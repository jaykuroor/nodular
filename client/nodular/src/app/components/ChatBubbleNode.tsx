'use client';

import { Handle, Position, useNodeId } from '@xyflow/react';
import { ChatBubbleType } from '../types';
import { MoreHorizontal, MessageSquare, MessageSquareMore, Maximize2, Minimize2, GripHorizontal, X, CloudUpload, GitBranch } from 'lucide-react';
import MessageNode from './MessageNode';
import FileNode from './FileNode';
import { useCallback } from 'react';

interface ChatBubbleNodeProps {
    data: {
      bubble: ChatBubbleType;
      onRemove: (id: string) => void;
      onToggleShrink: (id: string) => void;
      onAddNode: (id: string) => void;
      isConnecting: boolean;
      connectingNode: any;
    };
    isConnectable: boolean;
}

export default function ChatBubbleNode({ data, isConnectable }: ChatBubbleNodeProps) {
    const { bubble, onRemove, onToggleShrink, onAddNode, isConnecting, connectingNode } = data;
    const nodeId = useNodeId()!;
    
    const isHuman = bubble.messages[0]?.sender === 'human';
    const isAI = bubble.messages[0]?.sender === 'ai';
    const bgColor = bubble.type === 'file' ? 'bg-slate-800' : isHuman ? 'bg-slate-600' : 'bg-blue-700';

    const isFileConnecting = isConnecting && connectingNode?.type === 'file';

    const handleRemove = useCallback(() => {
        onRemove(nodeId);
    }, [nodeId, onRemove]);

    const handleToggleShrink = useCallback(() => {
        onToggleShrink(nodeId);
    }, [nodeId, onToggleShrink]);

    const handleAddNode = useCallback(() => {
        onAddNode(bubble.id);
    }, [bubble.id, onAddNode]);

    return (
        <div className={`${isAI ? `response-node` : `glass-pane`} flex flex-col shadow-2xl group z-20 rounded-xl ${bgColor} ${bubble.type === 'file' && !bubble.isShrunk ? 'max-w-210' : 'w-80vh'} ${isFileConnecting && isHuman ? 'prompt-connectable' : ''}`}>
            {/* Top handle for AI responses and human prompts */}
            {(isAI || (isHuman && bubble.type !== 'file')) && (
                <Handle 
                    type="target" 
                    position={Position.Top} 
                    isConnectable={isConnectable}
                    className="!bg-teal-500"
                    id= {bubble.id + "-top"}
                />
            )}
            
            {/* Handles for file connections */}
            {bubble.type === 'file' && (
                <>
                    <Handle type="source" position={Position.Top} id= {bubble.id + "-top"} className="!bg-rose-500" isConnectable={isConnectable} />
                    <Handle type="source" position={Position.Right} id= {bubble.id + "-right"} className="!bg-rose-500" isConnectable={isConnectable} />
                    <Handle type="source" position={Position.Bottom} id= {bubble.id + "-bottom"} className="!bg-rose-500" isConnectable={isConnectable} />
                    <Handle type="source" position={Position.Left} id= {bubble.id + "-left"} className="!bg-rose-500" isConnectable={isConnectable} />
                </>
            )}
            
            {/* Left and Right handles for human prompts to receive file connections */}
            {bubble.type === 'message' && (
                <>
                    <Handle 
                        type="target" 
                        position={Position.Left} 
                        id= {bubble.id + "-left"}
                        isConnectable={isConnectable}
                        className="!bg-teal-500"
                    />
                    <Handle 
                        type="target" 
                        position={Position.Right} 
                        id= {bubble.id + "-right"}
                        isConnectable={isConnectable}
                        className="!bg-teal-500"
                    />
                </>
            )}

            
            
            <header className={`drag-handle cursor-pointer flex items-center justify-between rounded-t-xl px-4 py-2 peer ${bubble.type == "file" ? 'bg-slate-850' : isHuman ? 'bg-slate-850' : 'bg-blue-700'}`}>
                {bubble.type === "message" ? bubble.messages[0].sender === "ai" ? <MessageSquare size={16} className="text-slate-100" /> : <MessageSquareMore size={16} className="text-blue-100" /> : <CloudUpload size={16} />}
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
                            onAddNode={handleAddNode}
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
                             <div className="relative p-4 pt-0">
                                <div className="flex justify-center items-center gap-2 text-sm bg-black/20 rounded-xl px-2.5 py-2 text-slate-100 peer-hover:bg-black/30 transition-transform peer-hover:scale-105">
                                    <GitBranch size={15} /> Connect File
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}
            
            {/* Bottom handle for human prompts to connect to AI responses */}
            {(isHuman || isAI) && (
                <Handle 
                    type="source"
                    id= {bubble.id + "-bottom"} 
                    position={Position.Bottom} 
                    isConnectable={isConnectable}
                    className="!invisible"
                />
            )}
        </div>
    );
}