import { ChatLogPayload, RequirementsPayload, ChatMessage, ServiceType, ClientInfo } from '../types';

/**
 * Logs a single chat message (round) to N8N for database storage.
 * Fire and forget - does not block UI.
 */
export const logChatRound = async (
  webhookUrl: string,
  message: ChatMessage,
  sessionId: string,
  serviceType: ServiceType,
  clientInfo: ClientInfo
): Promise<void> => {
  if (!webhookUrl) return;

  const payload: ChatLogPayload = {
    sessionId,
    serviceType,
    role: message.role,
    content: message.text,
    companyName: clientInfo.companyName || '',
    phone: clientInfo.phone || '',
    timestamp: new Date(message.timestamp).toISOString()
  };

  try {
    // We use navigator.sendBeacon if available for better reliability on page unload,
    // otherwise fallback to fetch (keepalive: true)
    const blob = new Blob([JSON.stringify(payload)], { type: 'application/json' });
    const useBeacon = navigator.sendBeacon(webhookUrl, blob);
    
    if (!useBeacon) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true
      }).catch(err => console.error("N8N Log Error:", err));
    }
  } catch (error) {
    console.error("Error logging to N8N:", error);
  }
};

/**
 * Sends the full transcript to generate requirements doc.
 */
export const triggerRequirementsGeneration = async (
  webhookUrl: string,
  transcript: ChatMessage[],
  sessionId: string,
  serviceType: ServiceType,
  clientInfo: ClientInfo
): Promise<boolean> => {
  if (!webhookUrl) return false;

  const payload: RequirementsPayload = {
    sessionId,
    serviceType,
    transcript,
    companyName: clientInfo.companyName || '',
    phone: clientInfo.phone || '',
    submittedAt: new Date().toISOString()
  };

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(`N8N Generation failed with status: ${response.status}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error triggering N8N requirements:", error);
    return false;
  }
};