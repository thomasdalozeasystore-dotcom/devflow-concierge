import { GoogleGenAI, Chat } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { ServiceType } from "../types";

let chatSession: Chat | null = null;

export const initializeGemini = (serviceType: ServiceType = ServiceType.GENERAL) => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing from environment variables.");
    return;
  }

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  // Customize system instruction based on selected service for better context
  let specializedInstruction = SYSTEM_INSTRUCTION;
  if (serviceType !== ServiceType.GENERAL) {
    specializedInstruction += `\n\nCURRENT CONTEXT: The user is specifically interested in ${serviceType}. Focus the conversation immediately on gathering requirements for this service.`;
  }

  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: specializedInstruction,
      temperature: 0.7,
      maxOutputTokens: 500,
    },
  });
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    // Lazy init if not started
    initializeGemini();
  }
  
  if (!chatSession) {
    throw new Error("Failed to initialize Gemini session.");
  }

  try {
    const response = await chatSession.sendMessage({ message });
    return response.text || "I apologize, I didn't catch that. Could you please rephrase?";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I'm having trouble connecting to the server right now. Please check your connection.";
  }
};

export const resetSession = (serviceType: ServiceType) => {
  initializeGemini(serviceType);
};