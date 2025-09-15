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
  sourceMessageId?: string;
  position: { x: number; y: number };
  file?: File;
  isShrunk: boolean;
}

export type ViewMode = 'thread' | 'zoomed-out' | 'chart';

export interface BoardState {
  id: string;
  name: string;
  bubbles: ChatBubbleType[];
  viewMode: ViewMode;
}

export type LLMProvider = 'openai' | 'llama' | 'deepseek' | 'gemini';