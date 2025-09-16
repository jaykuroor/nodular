import { ChatBubbleType, ViewMode } from '../types';
import { MoreHorizontal, MessageSquare, Maximize2, Minimize2, File, X } from 'lucide-react';
import MessageNode from './MessageNode';

interface ChatBubbleProps {
    bubble: ChatBubbleType;
    onAddNode: (sourceMessageId: string) => void;
    onToggleShrink: () => void;
    viewMode: ViewMode;
    onRemove: (bubbleId: string) => void;
}

export default function ChatBubble({ bubble, onAddNode, onToggleShrink, viewMode, onRemove }: ChatBubbleProps) {
    const isShrunk = bubble.isShrunk || (viewMode === 'map' && bubble.messages.length > 0);
    const hasContent = bubble.messages.length > 0 || bubble.file;

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
                    {hasContent && (
                        <button title={isShrunk ? "Expand" : "Shrink"} onClick={onToggleShrink} className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                            {isShrunk ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                        </button>
                    )}
                    <button onClick={() => onRemove(bubble.id)} title="Remove" className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                        <X size={16} />
                    </button>
                    <button title="More options" className="rounded p-1 text-slate-400 hover:bg-slate-700 hover:text-white">
                        <MoreHorizontal size={16} />
                    </button>
                </div>
            </header>

            {!isShrunk && hasContent && (
                <div className={`flex flex-col gap-4 overflow-y-auto p-4 ${bubble.file && bubble.messages.length === 0 ? 'h-24' : 'h-96'}`}>
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
            {isShrunk && hasContent && (
                 <div className="p-4 text-sm text-slate-400">
                    {bubble.messages.length > 0 ? bubble.messages[0].text.substring(0, 50) + '...' : bubble.file?.name}
                 </div>
            )}
        </div>
    );
}