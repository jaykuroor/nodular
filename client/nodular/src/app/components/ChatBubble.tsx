import { ChatBubbleType, ViewMode } from '../types';
import { MoreHorizontal, MessageSquare, Maximize2, Minimize2, X, CloudUpload } from 'lucide-react';
import MessageNode from './MessageNode';
import FileNode from './FileNode';

interface ChatBubbleProps {
    bubble: ChatBubbleType;
    onAddNode: (sourceMessageId: string) => void;
    onToggleShrink: () => void;
    viewMode: ViewMode;
    onRemove: (bubbleId: string) => void;
    isLastBubble: boolean;
}

export default function ChatBubble({ bubble, onAddNode, onToggleShrink, viewMode, onRemove, isLastBubble }: ChatBubbleProps) {
    const isShrunk = bubble.isShrunk || (viewMode === 'map' && bubble.messages.length > 0);
    const isUser = bubble.messages[0]?.sender === 'user';
    const bgColor = bubble.type === 'file' ? 'bg-slate-800' : isUser ? 'bg-slate-600' : 'bg-blue-800';


    const handleOpenFile = () => {

    }

    return (
        <div
            id={bubble.id}
            className={`glass-pane absolute flex w-96 flex-col rounded-xl shadow-2xl ${bgColor}`}
        >
            {bubble.sourceMessageId && (
                <div className="absolute -left-1 top-1/2 h-8 w-2 -translate-y-1/2 rounded-full bg-white"></div>
            )}

            <header className={`drag-handle cursor-pointer flex items-center justify-between rounded-t-xl border-slate-700/50 px-4 py-2 ${bubble.type == "file" ? 'bg-slate-850' : isUser ? 'bg-slate-850' : 'bg-blue-700'}`}>
                {bubble.file ? <CloudUpload size ={16}/> : <MessageSquare size={16} className="text-blue-400" />}
                {<div className="flex items-center gap-2 truncate">
                    <h3 className="text-sm font-semibold text-white truncate" title={bubble.title}>{bubble.type == "file" ? "File" : (isUser ? "You" : "Assistant")}</h3>
                </div>}
                <div className="flex items-center gap-1">
                    {bubble.type != "file" && <button title={isShrunk ? "Expand" : "Shrink"} onClick={onToggleShrink} className="rounded p-1 text-slate-100 hover:bg-slate-700 hover:text-white">
                        {isShrunk ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>}
                    {bubble.type != "file" && <button title="More options" className="rounded p-1 text-slate-100 hover:bg-slate-700 hover:text-white">
                        <MoreHorizontal size={16} />
                    </button>}
                    {<button onClick={() => onRemove(bubble.id)} title="Remove" className="rounded p-1 text-slate-100 hover:bg-slate-700 hover:text-white">
                        <X size={16} />
                    </button>}
                </div>
            </header>

            {(!isShrunk || bubble.type === "file") && (
                <>
                    {bubble.type === 'message' && bubble.messages.map((msg, index) => (
                        <MessageNode
                            key={msg.id}
                            message={msg}
                            onAddNode={onAddNode}
                            viewMode={viewMode}
                            isLastMessage={isLastBubble && index === bubble.messages.length - 1}
                        />
                    ))}
                    {bubble.type === 'file' && bubble.file && (
                        <>
                            <FileNode
                                fileName={bubble.file.name}
                                isShrunk={isShrunk}
                                onOpen={onToggleShrink}
                                onRemove={() => onRemove(bubble.id)}
                            />
                            {!isShrunk && <iframe
                                src={URL.createObjectURL(bubble.file)}
                                title={bubble.file.name}
                                className="flex-grow-1"
                            ></iframe>}
                        </>
                    )}
                </>
            )}
        </div>
    );
}