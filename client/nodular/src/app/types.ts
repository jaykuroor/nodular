export type LLMProvider = 
  | 'gpt-oss-120b' 
  | 'claude-v1' 
  | 'local-model'
  | 'gpt-oss-20b'
  | 'qwen-3-32b'
  | 'llama-4-scout'
  | 'kimi-k2'
  | 'llama-3.3-70b'
  | 'llama-4-maverick'
  | 'whisper-large-v3';

export interface Message {
  id: string;
  text: string;
  sender: 'human' | 'ai';
  timestamp: string;
}

export type ViewMode = 'thread' | 'zoomed-out' | 'map';

export interface ChatBubbleType {
  id: string;
  title: string;
  messages: Message[];
  position: { x: number; y: number };
  isShrunk: boolean;
  type: 'message' | 'file' | 'system';
  parentId?: string;
  connectedFiles?: string[]; // Array of file node IDs connected to this prompt node
  connectedTo?: string; // For file nodes, the ID of the prompt node they're connected to
  file?: File;
  fileUrl?: string;
}

export interface BoardState {
  id: string;
  name: string;
  bubbles: ChatBubbleType[];
  viewMode: ViewMode;
}