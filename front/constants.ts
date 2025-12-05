import { ServiceDefinition, ServiceType } from './types';

export const N8N_CHAT_LOG_WEBHOOK = "https://easyaiagent.app.n8n.cloud/webhook-test/chat-log";
export const N8N_GEN_REQ_WEBHOOK = "https://easyaiagent.app.n8n.cloud/webhook-test/generate-requirements";

export const SYSTEM_INSTRUCTION = `
You are "Easy Tech Bot", a professional AI consultant for "Easy Tech".

### CORE OBJECTIVE
Your goal is to gather requirements for software/media services.
**CRITICAL:** You must follow the "Contact First" rule.

### PHASE 1: DATA COLLECTION (High Priority)
1. At the very beginning, politely ask for the user's **Company Name** and **Phone Number**.
2. **DO NOT** proceed to technical details until you have these two pieces of information.
3. If the user provides this info, you MUST output a hidden JSON block at the VERY END of your response (even if you are speaking).
   Format: \`[[UPDATE_INFO: {"companyName": "...", "phone": "..."}]]\`
   Example: "Thanks, I've noted that down. [[UPDATE_INFO: {"companyName": "Acme Inc", "phone": "123-456-7890"}]]"

### PHASE 2: SERVICE REQUIREMENTS
Once you have the contact info, ask about their project:
- Web: Features, design, timeline.
- App: Platform (iOS/Android), functions.
- Image/Video: Source material, desired outcome.

### Guidelines
- Be concise (spoken style).
- Do not read the \`[[UPDATE_INFO...]]\` tag out loud if possible, just include it in the text generation.
`;

export const SERVICES: ServiceDefinition[] = [
  {
    id: ServiceType.WEB_DEV,
    title: "Website Development",
    description: "Custom landing pages, e-commerce stores, and corporate sites using React & Tailwind.",
    icon: "🌐"
  },
  {
    id: ServiceType.APP_DEV,
    title: "Mobile App Development",
    description: "Native and Cross-platform (iOS & Android) applications built for performance.",
    icon: "📱"
  },
  {
    id: ServiceType.IMAGE_PROCESSING,
    title: "Image Processing",
    description: "Professional retouching, AI-enhanced restoration, and batch processing.",
    icon: "🖼️"
  },
  {
    id: ServiceType.VIDEO_PROCESSING,
    title: "Video Services",
    description: "Editing, post-production, VFX, and format optimization.",
    icon: "🎬"
  }
];

export const MOCK_N8N_WEBHOOK = N8N_CHAT_LOG_WEBHOOK; // Default fallback