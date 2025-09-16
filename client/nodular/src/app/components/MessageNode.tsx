import { Message, ViewMode } from '../types';
import { Plus, Pencil } from 'lucide-react';
import { useState } from 'react';
import NewNodeModal from './NewNodeModal';

interface MessageNodeProps {
    message: Message;
    onAddNode: (messageId: string) => void;
    viewMode: ViewMode;
}

export default function MessageNode({ message, onAddNode, viewMode }: MessageNodeProps) {
    const [showModal, setShowModal] = useState(false);
    const isUser = message.sender === 'user';
    const nodeBg = isUser ? 'bg-blue-600' : 'bg-slate-700';
    const alignment = isUser ? 'self-end' : 'self-start';

    const handleAddNodeClick = () => {
        if (isUser) {
            setShowModal(true);
        } else {
            onAddNode(message.id);
        }
    };

    return (
        <>
            <div className={`group relative max-w-sm rounded-lg px-3 py-2 ${nodeBg} ${alignment} shadow-md`}>
                <p className={`text-sm text-slate-50 ${viewMode === 'map' && 'truncate'}`}>{message.text}</p>
                <div className="absolute -right-2 -top-2 flex opacity-0 transition-all group-hover:opacity-100">
                    <button
                        onClick={handleAddNodeClick}
                        className="flex h-5 w-5 items-center justify-center rounded-full bg-green-500 hover:scale-110"
                        title="Branch conversation here"
                    >
                        <Plus size={14} className="text-white" />
                    </button>
                    {isUser && (
                        <button
                            className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-500 hover:scale-110"
                            title="Edit message"
                        >
                            <Pencil size={14} className="text-white" />
                        </button>
                    )}
                </div>
            </div>
            {showModal && <NewNodeModal onClose={() => setShowModal(false)} />}
        </>
    );
}