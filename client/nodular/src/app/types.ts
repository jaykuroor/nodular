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
  sourceMessageId?: string; // ID of the message this bubble branches from
  position: { x: number; y: number }; // Position on the canvas
}

export interface BoardState {
  id: string;
  name: string;
  bubbles: ChatBubbleType[];
}

export type LLMProvider = 'openai' | 'llama' | 'deepseek' | 'gemini';