import { Message, ChatBubbleType } from '../types';
import { MoreHorizontal, MessageSquare, Maximize2 } from 'lucide-react';
import MessageNode from './MessageNode'; // Assuming MessageNode exists and is styled

interface ChatBubbleProps {
    bubble: ChatBubbleType;
    onAddNode: (sourceMessageId: string) => void;
}

export default function ChatBubble({ bubble, onAddNode }: ChatBubbleProps) {
    const handleRename = () => {
        // TBD: Backend call to rename bubble title
        console.log(`Renaming bubble ${bubble.id}`);
    };

    const handleDeleteBranch = () => {
        // TBD: Backend call to delete this bubble and all children
        console.log(`Deleting branch starting from ${bubble.id}`);
    };

    return (
        <div
            id={bubble.id}
            className="glass-pane absolute flex w-96 flex-col rounded-xl shadow-2xl"
            style={{ top: `${bubble.position.y}px`, left: `${bubble.position.x}px` }}
        >
            {/* Visual indicator if it's a branched node */}
            {bubble.sourceMessageId && (
                <div className="absolute -left-1 top-1/2 h-8 w-2 -translate-y-1/2 rounded-full bg-blue-500"></div>
            )}

            {/* Bubble Header */}
            <header className="flex items-center justify-between border-b border-slate-700/50 px-4 py-2">
                <div className="flex items-center gap-2">
                    <MessageSquare size={16} className="text-blue-400" />
                    <h3 className="text-sm font-semibold text-white">{bubble.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button title="Focus on this branch" className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                        <Maximize2 size={16} />
                    </button>
                    <button title="More options" className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </header>

            {/* Messages */}
            <div className="flex h-96 flex-col gap-4 overflow-y-auto p-4">
                {bubble.messages.map(msg => (
                    <MessageNode key={msg.id} message={msg} onAddNode={onAddNode} />
                ))}
            </div>
        </div>
    );
}