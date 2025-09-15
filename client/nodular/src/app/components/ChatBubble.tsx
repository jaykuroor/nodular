import { ChatBubbleType, ViewMode } from '../types';
import { MoreHorizontal, MessageSquare, Maximize2, Minimize2, File, X } from 'lucide-react';
import MessageNode from './MessageNode';

interface ChatBubbleProps {
    bubble: ChatBubbleType;
    onAddNode: (sourceMessageId: string) => void;
    onToggleShrink: () => void;
    viewMode: ViewMode;
}

export default function ChatBubble({ bubble, onAddNode, onToggleShrink, viewMode }: ChatBubbleProps) {
    const isShrunk = bubble.isShrunk || (viewMode === 'chart' && bubble.messages.length > 0);

    const getFileIcon = (fileType: string) => {
        if (fileType.startsWith('image/')) return '🖼️';
        if (fileType === 'application/pdf') return '📄';
        return '📁';
    }

    return (
        <div
            id={bubble.id}
            className="glass-pane absolute flex w-96 flex-col rounded-xl shadow-2xl"
        >
            {bubble.sourceMessageId && (
                <div className="absolute -left-1 top-1/2 h-8 w-2 -translate-y-1/2 rounded-full bg-blue-500"></div>
            )}

            <header className="flex items-center justify-between border-slate-700/50 px-4 py-2">
                <div className="flex items-center gap-2">
                    {bubble.file ? getFileIcon(bubble.file.type) : <MessageSquare size={16} className="text-blue-400" />}
                    <h3 className="text-sm font-semibold text-white truncate">{bubble.title}</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button title={isShrunk ? "Expand" : "Shrink"} onClick={onToggleShrink} className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                        {isShrunk ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>
                    {bubble.file && (
                         <button title="Close" className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                            <X size={16} />
                         </button>
                    )}
                    <button title="More options" className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </header>

            {!isShrunk && (
                <div className="flex h-96 flex-col gap-4 overflow-y-auto p-4">
                    {bubble.messages.map(msg => (
                        <MessageNode key={msg.id} message={msg} onAddNode={onAddNode} viewMode={viewMode} />
                    ))}
                    {bubble.file && (
                        <div className="flex items-center gap-2 text-white">
                            <File size={20} />
                            <span>{bubble.file.name}</span>
                        </div>
                    )}
                </div>
            )}
            {isShrunk && (
                 <div className="p-4 text-sm text-slate-400">
                    {bubble.messages.length > 0 ? bubble.messages[0].text.substring(0, 50) + '...' : '...'}
                 </div>
            )}
        </div>
    );
}