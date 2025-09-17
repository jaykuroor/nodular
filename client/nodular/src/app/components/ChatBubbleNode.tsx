'use client';

import { Handle, Position, useNodeId } from 'reactflow';
import { ChatBubbleType } from '../types';
import { MoreHorizontal, MessageSquare, Maximize2, Minimize2, GripHorizontal, X, CloudUpload } from 'lucide-react';
import MessageNode from './MessageNode';
import FileNode from './FileNode';
import { useCallback } from 'react';

interface ChatBubbleNodeProps {
    data: {
      bubble: ChatBubbleType;
      onRemove: (id: string) => void;
      onToggleShrink: (id: string) => void;
    };
    isConnectable: boolean;
}

export default function ChatBubbleNode({ data, isConnectable }: ChatBubbleNodeProps) {
    const { bubble, onRemove, onToggleShrink } = data;
    const nodeId = useNodeId()!;
    
    const isHuman = bubble.messages[0]?.sender === 'human';
    const bgColor = bubble.type === 'file' ? 'bg-slate-800' : isHuman ? 'bg-slate-600' : 'bg-blue-800';

    const handleRemove = useCallback(() => {
        onRemove(nodeId);
    }, [nodeId, onRemove]);

    const handleToggleShrink = useCallback(() => {
        onToggleShrink(nodeId);
    }, [nodeId, onToggleShrink]);

    return (
        <div className={`glass-pane flex flex-col shadow-2xl group z-20 rounded-xl ${bgColor} ${bubble.type === 'file' && !bubble.isShrunk ? 'max-w-210' : 'w-96'}`}>
            {bubble.type === 'message' && (
                <Handle type="target" position={Position.Top} isConnectable={isConnectable} style={{ background: 'transparent', border: 'none' }}/>
            )}
            
            <header className={`drag-handle cursor-pointer flex items-center justify-between rounded-t-xl border-slate-700/50 px-4 py-2 peer ${bubble.type == "file" ? 'bg-slate-850' : isHuman ? 'bg-slate-850' : 'bg-blue-700'}`}>
                {bubble.file ? <CloudUpload size={16} /> : <MessageSquare size={16} className="text-blue-400" />}
                <div className="flex items-center gap-2 truncate">
                    <GripHorizontal size={16} className='opacity-40' />
                    <h3 className="text-sm font-semibold text-white truncate" title={bubble.title}>{bubble.type == "file" ? "File" : (isHuman ? "You" : "Assistant")}</h3>
                </div>
                <div className="flex items-center gap-1">
                    {bubble.type !== "file" && <button title={bubble.isShrunk ? "Expand" : "Shrink"} onClick={handleToggleShrink} className="rounded p-1 text-slate-100 hover:bg-slate-700 hover:text-white">
                        {bubble.isShrunk ? <Maximize2 size={16} /> : <Minimize2 size={16} />}
                    </button>}
                    {bubble.type !== "file" && <button title="More options" className="rounded p-1 text-slate-100 hover:bg-slate-700 hover:text-white">
                        <MoreHorizontal size={16} />
                    </button>}
                    <button onClick={handleRemove} title="Remove" className="rounded p-1 text-slate-100 hover:bg-slate-700 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            </header>

            {(!bubble.isShrunk || bubble.type === "file") && (
                <>
                    {bubble.type === 'message' && bubble.messages.map((msg, index) => (
                        <MessageNode
                            key={msg.id}
                            message={msg}
                            onAddNode={() => {}}
                            viewMode={"zoomed-out"}
                            isLastMessage={index === bubble.messages.length - 1}
                        />
                    ))}
                    {bubble.type === 'file' && bubble.file && (
                        <>
                            <FileNode
                                fileName={bubble.file.name}
                                isShrunk={bubble.isShrunk}
                                onOpen={handleToggleShrink}
                                onRemove={handleRemove}
                            />
                            {!bubble.isShrunk && (
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
            
            {(bubble.type === 'message' && isHuman) && (
                <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ background: 'transparent', border: 'none' }}/>
            )}
            {bubble.type === 'file' && (
                <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} style={{ background: 'transparent', border: 'none' }}/>
            )}
        </div>
    );
}