import { Message } from '../types';
import { Plus } from 'lucide-react';

interface MessageNodeProps {
  message: Message;
  onAddNode: (messageId: string) => void;
}

export default function MessageNode({ message, onAddNode }: MessageNodeProps) {
  const isUser = message.sender === 'user';
  const nodeBg = isUser ? 'bg-blue-600' : 'bg-slate-700';
  const alignment = isUser ? 'self-end' : 'self-start';

  return (
    <div className={`group relative max-w-sm rounded-lg px-3 py-2 ${nodeBg} ${alignment} shadow-md`}>
      <p className="text-sm text-slate-50">{message.text}</p>
      {/* Branch Button - for LLM messages */}
      {!isUser && (
        <button
          onClick={() => onAddNode(message.id)}
          className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-green-500 opacity-0 transition-all group-hover:opacity-100 hover:scale-110"
          title="Branch conversation here"
        >
          <Plus size={14} className="text-white" />
        </button>
      )}
    </div>
  );
}