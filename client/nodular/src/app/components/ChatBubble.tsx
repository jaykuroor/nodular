// MODIFIED: Added Link2Off to the import
import { ChatBubbleType, ViewMode } from '../types';
import { MoreHorizontal, MessageSquare, Maximize2, Minimize2, GripHorizontal, X, CloudUpload, Link2Off } from 'lucide-react';
import MessageNode from './MessageNode';
import FileNode from './FileNode';
import { useEffect, useState } from 'react';

interface ChatBubbleProps {
    bubble: ChatBubbleType;
    onAddNode: (sourceMessageId: string) => void;
    onToggleShrink: () => void;
    viewMode: ViewMode;
    onRemove: (bubbleId: string) => void;
    isLastBubble: boolean;
    isConnecting: boolean;
    startConnecting: (bubbleId: string, e: React.MouseEvent) => void;
    finishConnecting: (bubbleId: string) => void;
    // ADDED: Prop for the removeConnection function
    removeConnection: (bubbleId: string) => void;
}

export default function ChatBubble({ bubble, onAddNode, onToggleShrink, viewMode, onRemove, isLastBubble, isConnecting, startConnecting, finishConnecting, removeConnection }: ChatBubbleProps) {
    const isShrunk = bubble.isShrunk || (viewMode === 'map' && bubble.messages.length > 0);
    const isUser = bubble.messages[0]?.sender === 'user';
    const bgColor = bubble.type === 'file' ? 'bg-slate-800' : isUser ? 'bg-slate-600' : 'bg-blue-800';
    const [textContent, setTextContent] = useState<string | null>(null);

    useEffect(() => {
        if (bubble.type === 'file' && bubble.file && bubble.file.type.startsWith('text/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setTextContent(e.target?.result as string);
            };
            reader.readAsText(bubble.file);
        }
    }, [bubble.file, bubble.type]);


    const handleConnectionStart = (e: React.MouseEvent) => {
        e.stopPropagation();
        startConnecting(bubble.id, e);
    };

    // ADDED: Handler for removing the connection
    const handleConnectionRemove = (e: React.MouseEvent) => {
        e.stopPropagation();
        removeConnection(bubble.id);
    };

    const handleConnectionEnd = (e: React.MouseEvent) => {
        if (isConnecting && bubble.type === 'message') {
            e.stopPropagation();
            finishConnecting(bubble.id);
        }
    };


    return (
        <div
            id={bubble.id}
            className={`glass-pane absolute flex flex-col rounded-xl shadow-2xl group z-10 ${bgColor} ${bubble.type === 'file' && !isShrunk ? 'max-w-210' : 'w-96'} ${isConnecting && bubble.type === 'message' ? 'connectable-node connectable-node-active' : ''}`}
            onClick={handleConnectionEnd}
        >
            {/* MODIFIED: The connection handle now has conditional logic */}
            {bubble.type === 'file' && (
                <div
                    // If connected, show the disconnect button. Otherwise, show the connect button.
                    onClick={bubble.connectedTo ? handleConnectionRemove : handleConnectionStart}
                    className={'absolute -left-1 top-1/2 h-8 w-2 -translate-y-1/2 opacity-20 rounded-full bg-white group-hover:opacity-100 transition-all hover:scale-105 hover:drop-shadow-glow hover:cursor-pointer'}
                >
                    {bubble.connectedTo && (
                        <Link2Off size={16} className="text-slate-800" />
                    )}
                </div>
            )}


            <header className={`drag-handle cursor-pointer flex items-center justify-between rounded-t-xl border-slate-700/50 px-4 py-2 peer ${bubble.type == "file" ? 'bg-slate-850' : isUser ? 'bg-slate-850' : 'bg-blue-700'}`}>
                {bubble.file ? <CloudUpload size ={16}/> : <MessageSquare size={16} className="text-blue-400" />}
                {<div className="flex items-center gap-2 truncate">
                    {<GripHorizontal size={16} className='opacity-40'/>}
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
                            {!isShrunk && (
                                <div className="p-4">
                                    {bubble.file.type.startsWith('image/') && (
                                        <img src={bubble.fileUrl} alt={bubble.file.name} className="h-auto w-auto max-h-160 max-w-120" />
                                    )}
                                    {!bubble.file.type.startsWith('image/') && (
                                        <iframe src={bubble.fileUrl} title={bubble.file.name} className="h-auto w-auto min-w-180 min-h-60 max-h-280 max-w-210" />
                                    )}
                                </div>
                            )}
                        </>
                    )}
                </>
            )}
        </div>
    );
}