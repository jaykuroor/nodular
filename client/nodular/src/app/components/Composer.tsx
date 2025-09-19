'use client';

import { FormEvent, useState } from 'react';
import { Send, Paperclip, FileText } from 'lucide-react';
import { ChatBubbleType } from '../types';

interface ComposerProps {
  bubbles: ChatBubbleType[];
  onSendMessage: (text: string, bubbleId: string) => void;
}

export default function Composer({ bubbles, onSendMessage }: ComposerProps) {
  const [text, setText] = useState('');
  const [currentTargetId, setCurrentTargetId] = useState(bubbles[0]?.id || '');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (text.trim()) {
      onSendMessage(text, currentTargetId);
      setText('');
    }
  };

  return (
    <div className='absolute bottom-0 w-[calc(100%-18rem)] flex justify-center bg-slate-700/5 backdrop-blur-xl py-4'>
      <div className="flex-shrink-0 rounded-[48px] border-t border-slate-700 shadow-xl bg-slate-800/30 p-4 px-16 w-4xl max-w-4/5">
        <div className="mx-auto w-full">
          <div className="glass-pane flex items-center gap-2 rounded-[48px] p-2">
            <button title="Attach File" className="p-2 text-slate-400 hover:text-white">
              <Paperclip size={20} />
            </button>
            <button title="Use Template" className="p-2 text-slate-400 hover:text-white">
              <FileText size={20} />
            </button>
            <input
              type="text"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your message, or ask for a new thread..."
              className="flex-1 bg-transparent text-slate-200 placeholder-slate-500 focus:outline-none"
            />
            <div className="h-6 border-l border-slate-600"></div>
            <select
              value={currentTargetId}
              onChange={(e) => setCurrentTargetId(e.target.value)}
              className="appearance-none rounded-md border-slate-600 bg-slate-700/50 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">New Node</option>
              {bubbles.map((bubble) => (
                <option key={bubble.id} value={bubble.id}>
                  To: {bubble.title}
                </option>
              ))}
            </select>
            <button
              type="submit"
              onClick={handleSubmit}
              className="rounded-lg bg-blue-600 p-2 text-white transition-colors hover:bg-blue-500 disabled:bg-slate-600"
              disabled={!text.trim()}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}