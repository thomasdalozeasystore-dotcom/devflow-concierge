import { useState, useRef, useEffect, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from "@google/genai";
import { ChatMessage, Role, ServiceType } from '../types';
import { SYSTEM_INSTRUCTION } from '../constants';
import { decodeAudioData, base64ToUint8Array, pcmToGeminiBlob } from '../utils/audioUtils';

interface UseGeminiLiveProps {
  onTranscriptCommit: (message: ChatMessage) => void;
  serviceType: ServiceType | null;
}

export const useGeminiLive = ({ onTranscriptCommit, serviceType }: UseGeminiLiveProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // Model is speaking
  const [isListening, setIsListening] = useState(false); // Mic is active
  const [error, setError] = useState<string | null>(null);
  
  // Current ephemeral transcription
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');

  // Refs for audio handling to avoid re-renders
  const inputContextRef = useRef<AudioContext | null>(null);
  const outputContextRef = useRef<AudioContext | null>(null);
  const inputSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioStreamRef = useRef<MediaStream | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const scheduledSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  
  // Transcription accumulation refs
  const inputTranscriptRef = useRef('');
  const outputTranscriptRef = useRef('');

  // Flag to trigger disconnect after bot finishes speaking
  const shouldDisconnectRef = useRef(false);

  const disconnect = useCallback(async () => {
    console.log("Disconnecting Live Session...");
    
    // Stop Microphone
    if (audioStreamRef.current) {
      audioStreamRef.current.getTracks().forEach(track => track.stop());
      audioStreamRef.current = null;
    }
    
    // Close Audio Contexts
    if (inputContextRef.current) {
      await inputContextRef.current.close();
      inputContextRef.current = null;
    }
    if (outputContextRef.current) {
      // Stop all playing audio
      scheduledSourcesRef.current.forEach(source => {
        try { source.stop(); } catch (e) {}
      });
      scheduledSourcesRef.current.clear();
      
      await outputContextRef.current.close();
      outputContextRef.current = null;
    }

    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    setCurrentInput('');
    setCurrentOutput('');
    shouldDisconnectRef.current = false;
  }, []);

  const connect = useCallback(async () => {
    if (!process.env.API_KEY || !serviceType) return;
    setError(null);
    shouldDisconnectRef.current = false;

    try {
      // 1. Setup Audio Contexts
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      inputContextRef.current = new AudioContextClass({ sampleRate: 16000 });
      outputContextRef.current = new AudioContextClass({ sampleRate: 24000 });
      
      // 2. Get Microphone Access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioStreamRef.current = stream;

      // 3. Initialize Gemini Client
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      let specializedInstruction = SYSTEM_INSTRUCTION;
      specializedInstruction += `\n\nCURRENT CONTEXT: The user is interested in ${serviceType}. REMEMBER: Ask for Company Name and Phone Number FIRST. Only after you have those, start gathering requirements for ${serviceType}.`;

      // 4. Connect to Live API
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } }
          },
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          systemInstruction: specializedInstruction,
        },
        callbacks: {
          onopen: () => {
            console.log("Gemini Live Session Opened");
            setIsConnected(true);
            setIsListening(true);
            
            // Resume Audio Context if suspended (browser autoplay policy)
            if (outputContextRef.current && outputContextRef.current.state === 'suspended') {
              outputContextRef.current.resume();
            }

            // Start Input Stream Processing
            if (!inputContextRef.current) return;
            
            const source = inputContextRef.current.createMediaStreamSource(stream);
            inputSourceRef.current = source;
            
            // Use ScriptProcessor for raw PCM access (worklet is harder in this single-file setup)
            const processor = inputContextRef.current.createScriptProcessor(4096, 1, 1);
            processorRef.current = processor;
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const pcmBlob = pcmToGeminiBlob(inputData, 16000);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            
            source.connect(processor);
            processor.connect(inputContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Audio Output
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData && outputContextRef.current) {
              const ctx = outputContextRef.current;
              const buffer = await decodeAudioData(base64ToUint8Array(audioData), ctx, 24000, 1);
              
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              
              // Schedule playback
              const currentTime = ctx.currentTime;
              if (nextStartTimeRef.current < currentTime) {
                nextStartTimeRef.current = currentTime;
              }
              
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              
              scheduledSourcesRef.current.add(source);
              source.onended = () => {
                scheduledSourcesRef.current.delete(source);
                if (scheduledSourcesRef.current.size === 0) {
                  setIsSpeaking(false);
                  
                  // Check if we need to disconnect after the bot finishes speaking
                  if (shouldDisconnectRef.current) {
                    disconnect();
                  }
                }
              };
              
              setIsSpeaking(true);
            }

            // Handle Transcriptions
            if (msg.serverContent?.inputTranscription) {
              const text = msg.serverContent.inputTranscription.text;
              if (text) {
                inputTranscriptRef.current += text;
                setCurrentInput(inputTranscriptRef.current);
              }
            }

            if (msg.serverContent?.outputTranscription) {
              const text = msg.serverContent.outputTranscription.text;
              if (text) {
                outputTranscriptRef.current += text;
                setCurrentOutput(outputTranscriptRef.current);
              }
            }

            // Handle Turn Completion (Commit messages)
            if (msg.serverContent?.turnComplete) {
              // Commit User Message
              if (inputTranscriptRef.current.trim()) {
                const userText = inputTranscriptRef.current.trim();
                
                // Check for exit phrases
                const lowerText = userText.toLowerCase();
                const exitPhrases = ['谢谢', 'thank you', 'thanks', 'bye', 'goodbye', '再见'];
                if (exitPhrases.some(phrase => lowerText.includes(phrase))) {
                  console.log("Exit phrase detected. Will disconnect after response.");
                  shouldDisconnectRef.current = true;
                }

                onTranscriptCommit({
                  id: crypto.randomUUID(),
                  role: Role.USER,
                  text: userText,
                  timestamp: Date.now()
                });
                inputTranscriptRef.current = '';
                setCurrentInput('');
              }

              // Commit Model Message
              if (outputTranscriptRef.current.trim()) {
                onTranscriptCommit({
                  id: crypto.randomUUID(),
                  role: Role.MODEL,
                  text: outputTranscriptRef.current.trim(),
                  timestamp: Date.now()
                });
                outputTranscriptRef.current = '';
                setCurrentOutput('');
              }
              
              // If we found an exit phrase and the model isn't speaking (and has no audio queued), disconnect now
              // Otherwise, source.onended will handle it
              if (shouldDisconnectRef.current && scheduledSourcesRef.current.size === 0 && !isSpeaking) {
                disconnect();
              }
            }
            
            // Handle Interruption
            if (msg.serverContent?.interrupted) {
              console.log("Interrupted!");
              // Clear audio queue
              scheduledSourcesRef.current.forEach(s => s.stop());
              scheduledSourcesRef.current.clear();
              nextStartTimeRef.current = 0;
              setIsSpeaking(false);
              
              // Commit what we have so far if interrupted
              if (outputTranscriptRef.current.trim()) {
                 onTranscriptCommit({
                  id: crypto.randomUUID(),
                  role: Role.MODEL,
                  text: outputTranscriptRef.current.trim() + " ...",
                  timestamp: Date.now()
                });
                outputTranscriptRef.current = '';
                setCurrentOutput('');
              }
            }
          },
          onclose: () => {
            console.log("Session Closed");
            disconnect();
          },
          onerror: (e) => {
            console.error("Session Error", e);
            setError("Connection error");
            disconnect();
          }
        }
      });

    } catch (err) {
      console.error("Failed to start session:", err);
      setError("Failed to access microphone or connect to AI.");
      disconnect();
    }
  }, [serviceType, onTranscriptCommit, disconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return {
    connect,
    disconnect,
    isConnected,
    isSpeaking, // Model is outputting audio
    isListening, // Mic is active
    currentInput,
    currentOutput,
    error
  };
};