import { Message } from '../types';
import MessageNode from './MessageNode';

interface ThreadProps {
  messages: Message[];
  onAddNode: (messageId: string) => void;
}

export default function Thread({ messages, onAddNode }: ThreadProps) {
  return (
    <div className="relative flex min-w-[300px] flex-1 flex-col gap-4 rounded-lg bg-gray-800/50 p-4 shadow-lg">
      {messages.map((msg) => (
        <MessageNode key={msg.id} message={msg} onAddNode={onAddNode} />
      ))}
    </div>
  );
}