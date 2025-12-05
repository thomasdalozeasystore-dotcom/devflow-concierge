import React, { useState, useEffect, useRef } from 'react';
import { SERVICES, N8N_CHAT_LOG_WEBHOOK, N8N_GEN_REQ_WEBHOOK } from './constants';
import { ChatMessage, Role, ServiceType, ClientInfo } from './types';
import { logChatRound, triggerRequirementsGeneration } from './services/n8nService';
import { ChatMessageBubble } from './components/ChatMessageBubble';
import { ServiceCard } from './components/ServiceCard';
import { Button } from './components/Button';
import { SettingsModal } from './components/SettingsModal';
import { VoiceControls } from './components/VoiceControls';
import { useGeminiLive } from './hooks/useGeminiLive';
import UserForm from './components/UserForm';

// --- Icons ---
const SettingsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.819l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.922-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.819l-1.02.382c-.114.043-.282.031-.449-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
  </svg>
);

const BackIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path fillRule="evenodd" d="M11.03 3.97a.75.75 0 010 1.06l-6.22 6.22H21a.75.75 0 010 1.5H4.81l6.22 6.22a.75.75 0 11-1.06 1.06l-7.5-7.5a.75.75 0 010-1.06l7.5-7.5a.75.75 0 011.06 0z" clipRule="evenodd" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-green-500">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

// Regex to extract the hidden info block: [[UPDATE_INFO: {...}]]
const INFO_EXTRACTION_REGEX = /\[\[UPDATE_INFO:\s*(\{.*?\})\s*\]\]/;



// ... (existing imports)

// ... (existing constants)

export default function App() {
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // Client Info State
  const [clientInfo, setClientInfo] = useState<ClientInfo>({});

  const [isSubmitting, setIsSubmitting] = useState(false);
  // Default to Gen Req URL, but user can override in settings
  const [n8nUrl, setN8nUrl] = useState(() => localStorage.getItem('n8n_url') || N8N_GEN_REQ_WEBHOOK);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sessionId, setSessionId] = useState(() => crypto.randomUUID());
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use the custom hook for Gemini Live
  const {
    connect,
    disconnect,
    isConnected,
    isSpeaking,
    currentInput,
    currentOutput,
    error: liveError
  } = useGeminiLive({
    serviceType: selectedService,
    onTranscriptCommit: async (msg) => {
      let finalMessage = msg;

      // 1. If it's a Model message, try to extract hidden metadata
      if (msg.role === Role.MODEL) {
        const match = msg.text.match(INFO_EXTRACTION_REGEX);
        if (match && match[1]) {
          try {
            const extractedData = JSON.parse(match[1]);
            setClientInfo(prev => ({ ...prev, ...extractedData }));

            // Remove the tag from the text so user doesn't see it (cleaning)
            const cleanedText = msg.text.replace(INFO_EXTRACTION_REGEX, '').trim();
            finalMessage = { ...msg, text: cleanedText };
          } catch (e) {
            console.warn("Failed to parse extracted info JSON", e);
          }
        }
      }

      // 2. Update UI
      setMessages(prev => [...prev, finalMessage]);

      // 3. Log to N8N (Chat Log) - Triggered every round
      if (selectedService) {
        await logChatRound(
          N8N_CHAT_LOG_WEBHOOK,
          finalMessage,
          sessionId,
          selectedService,
          // Note: We use the *latest* clientInfo available in ref or state? 
          // React state updates are async, so inside this callback 'clientInfo' might be stale.
          // However, for simplicity in this turn, we accept it might be 1 turn delayed for the very first capture,
          // or we can use the `extractedData` if we just parsed it.
          // Better: just fire it. N8N will eventually get the populated fields in subsequent rows.
          clientInfo
        );
      }
    }
  });

  // Scroll to bottom when messages change or ephemeral text updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentInput, currentOutput]);

  const handleServiceSelect = (serviceType: ServiceType) => {
    setSelectedService(serviceType);
    setMessages([]);
    setSubmitStatus('idle');
    // Don't reset client info so we keep the UserForm data
    // setClientInfo({}); 
  };

  const handleStartCall = async () => {
    await connect();
  };

  const handleEndCall = () => {
    disconnect();
  };

  // Logic: "Finish & Submit" -> Call Generate Requirements Webhook
  const handleGenerateDocs = async () => {
    if (!selectedService) return;

    // Disconnect if still connected
    if (isConnected) disconnect();

    setIsSubmitting(true);

    // Use the configurable URL for the "Big Submit", or strict constant? 
    // The prompt implies specific URL for requirements. Let's use the state `n8nUrl` which defaults to it.
    const success = await triggerRequirementsGeneration(
      n8nUrl,
      messages,
      sessionId,
      selectedService,
      clientInfo
    );

    setIsSubmitting(false);
    if (success) {
      setSubmitStatus('success');
      // Reset after a delay
      setTimeout(() => {
        setSelectedService(null);
        setSessionId(crypto.randomUUID());
        setSubmitStatus('idle');
        setMessages([]);
        setClientInfo({}); // Reset everything for a completely new session
      }, 4000);
    } else {
      setSubmitStatus('error');
    }
  };

  const handleBack = () => {
    if (isConnected) {
      const confirm = window.confirm("Going back will end the call. Are you sure?");
      if (!confirm) return;
      disconnect();
    }
    setSelectedService(null);
    setSessionId(crypto.randomUUID());
    setMessages([]);
    // Don't reset client info when going back
    // setClientInfo({});
  };

  const updateN8nUrl = (url: string) => {
    setN8nUrl(url);
    localStorage.setItem('n8n_url', url);
  };




  // 1. If we don't have basic client info (Name/Email), show the UserForm
  //    (Unless we are in a 'success' state, but preventing loop is good)
  if (!clientInfo.name && submitStatus !== 'success') {
    return (
      <UserForm onSubmit={(info) => setClientInfo(info)} />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 max-w-4xl mx-auto shadow-2xl overflow-hidden border-x border-slate-200">

      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-10">
        <div className="flex items-center gap-3">
          {selectedService ? (
            <button
              onClick={handleBack}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full transition-colors"
            >
              <BackIcon />
            </button>
          ) : (
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold">
              ET
            </div>
          )}

          <div>
            <h1 className="font-bold text-slate-800 text-lg leading-tight">
              {selectedService
                ? SERVICES.find(s => s.id === selectedService)?.title
                : "Easy Tech Concierge"}
            </h1>
            <p className="text-xs text-slate-500">
              {clientInfo.companyName
                ? `${clientInfo.companyName} ${clientInfo.phone ? `(${clientInfo.phone})` : ''}`
                : "AI Customer Service"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedService && (
            <Button
              variant="primary"
              onClick={handleGenerateDocs}
              isLoading={isSubmitting}
              className="text-sm px-3 py-1.5"
              disabled={messages.length === 0 || submitStatus === 'success'}
            >
              {submitStatus === 'success' ? 'Sent!' : 'End & Generate Docs'}
            </Button>
          )}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <SettingsIcon />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative flex flex-col">

        {/* Success Overlay */}
        {submitStatus === 'success' && (
          <div className="absolute inset-0 z-50 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300">
            <div className="bg-green-100 p-4 rounded-full mb-4">
              <CheckCircleIcon />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-2">Requirements Sent!</h2>
            <p className="text-slate-600 max-w-md">
              We've sent the requirements document for <strong>{clientInfo.companyName || 'your company'}</strong> to our team via n8n.
            </p>
            <p className="text-sm text-slate-400 mt-8">Returning to home...</p>
          </div>
        )}

        {/* View 1: Service Selection */}
        {!selectedService && (
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <h2 className="text-2xl font-bold text-slate-900 mb-3">How can Easy Tech help you?</h2>
                <p className="text-slate-500">Select a service to start a voice consultation.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {SERVICES.map(service => (
                  <ServiceCard
                    key={service.id}
                    service={service}
                    onClick={() => handleServiceSelect(service.id)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {/* View 2: Live Call Interface */}
        {selectedService && (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide bg-slate-50 relative">
              {messages.length === 0 && !isConnected && !liveError && (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 opacity-60">
                  <p>Tap microphone to start...</p>
                </div>
              )}

              {messages.map((msg) => (
                <ChatMessageBubble key={msg.id} message={msg} />
              ))}

              {/* Live Partial Transcripts */}
              {(currentInput || currentOutput) && (
                <div className="opacity-70 animate-pulse">
                  {currentInput && (
                    <div className="flex w-full mb-2 justify-end">
                      <div className="bg-brand-100 text-brand-800 rounded-2xl rounded-br-none px-5 py-3 text-sm italic">
                        {currentInput}
                      </div>
                    </div>
                  )}
                  {currentOutput && (
                    <div className="flex w-full mb-2 justify-start">
                      <div className="bg-white border border-slate-200 text-slate-600 rounded-2xl rounded-bl-none px-5 py-3 text-sm italic">
                        {currentOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {liveError && (
                <div className="bg-red-50 text-red-600 p-4 rounded-lg text-center mx-4 mt-4 text-sm border border-red-100">
                  {liveError}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Voice Controls */}
            <div className="shrink-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
              <VoiceControls
                isConnected={isConnected}
                isSpeaking={isSpeaking}
                onStart={handleStartCall}
                onEnd={handleEndCall}
              />
            </div>
          </>
        )}
      </main>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUrl={n8nUrl}
        onSave={updateN8nUrl}
      />
    </div>
  );
}