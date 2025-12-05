export enum Role {
  USER = 'user',
  MODEL = 'model'
}

export enum ServiceType {
  WEB_DEV = 'WEB_DEV',
  APP_DEV = 'APP_DEV',
  IMAGE_PROCESSING = 'IMAGE_PROCESSING',
  VIDEO_PROCESSING = 'VIDEO_PROCESSING',
  FAQ = 'FAQ',
  GENERAL = 'GENERAL'
}

export interface ChatMessage {
  id: string;
  role: Role;
  text: string;
  timestamp: number;
}

export interface ServiceDefinition {
  id: ServiceType;
  title: string;
  description: string;
  icon: string; // Emoji or SVG path identifier
}

export interface ClientInfo {
  id?: number;
  name?: string;
  email?: string;
  companyName?: string;
  phone?: string;
}

export interface ChatLogPayload {
  sessionId: string;
  serviceType: ServiceType;
  role: string;
  content: string;
  companyName?: string;
  phone?: string;
  timestamp: string;
}

export interface RequirementsPayload {
  sessionId: string;
  serviceType: ServiceType;
  transcript: ChatMessage[];
  companyName?: string;
  phone?: string;
  submittedAt: string;
}