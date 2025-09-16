export interface Message {
  id: string;
  text: string;
  sender: 'user' | 'llm';
  timestamp: string;
}

export interface ChatBubbleType {
  id: string;
  title: string;
  messages: Message[];
  parentId?: string; // Renamed from sourceMessageId and made optional
  position: { x: number; y: number };
  file?: File;
  isShrunk: boolean;
  type: 'message' | 'file'; // Added type property
  fileUrl?: string; // URL for the file if applicable
  connectedTo?: string; // ADDED: ID of the bubble this file bubble is connected to
}

export type ViewMode = 'thread' | 'zoomed-out' | 'map';

export interface BoardState {
  id: string;
  name: string;
  bubbles: ChatBubbleType[];
  viewMode: ViewMode;
}

export type LLMProvider =
  'gpt-oss-120b' |
  'gpt-oss-20b' |
  'qwen-3-32b' |
  'llama-4-scout' |
  'kimi-k2' |
  'llama-3.3-70b' |
  'llama-4-maverick' |
  'whisper-large-v3';