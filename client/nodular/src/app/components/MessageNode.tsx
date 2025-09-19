import { Message, ViewMode } from '../types';
import { Plus, GitBranch, Repeat, Info } from 'lucide-react';

interface MessageNodeProps {
    message: Message;
    onAddNode: () => void;
    viewMode: ViewMode;
    isLastMessage: boolean;
}

export default function MessageNode({ message, onAddNode, viewMode, isLastMessage }: MessageNodeProps) {
    const isUser = message.sender === 'human';

    const handleCreateNode = () => {
        // TBD: Logic for creating a new node from AI message
    };

    const handleRegenerate = () => {
        // TBD: Logic for regenerating response
    };

    const handleAddInfo = () => {
        // TBD: Logic for adding info to the prompt
    };

    const UserActions = () => (
        <div className="flex justify-around pt-2">
            <button onClick={handleRegenerate} className="flex items-center gap-2 text-sm bg-black/20 rounded-xl px-2.5 py-2 text-slate-100 hover:text-white hover:bg-black/30">
                <Repeat size={15} /> Regenerate
            </button>
            <button onClick={handleAddInfo} className="flex items-center gap-2 text-sm bg-black/20 rounded-xl px-2.5 py-2 text-slate-100 hover:text-white hover:bg-black/30">
                <Info size={15} /> Add Info
            </button>
        </div>
    );

    const AiActions = () => {
        if (isLastMessage) return null;
        return (
            <div className="flex justify-center pt-2">
                <button onClick={onAddNode} className="flex items-center gap-2 text-sm bg-black/20 rounded-xl px-2.5 py-2 text-slate-100 hover:text-white hover:bg-black/30">
                    <GitBranch size={15} /> Create Node
                </button>
            </div>
        );
    };

    return (
        <div className={`p-4 ${isUser ? 'bg-slate-850' : 'bg-blue-700'} rounded-b-xl`}>
             <p className={`text-sm text-slate-50 ${isUser ? 'bg-slate-850' : 'bg-blue-700'} ${viewMode === 'map' && 'truncate'}`}>{message.text}</p>
             <div className="mt-4">
                {isUser ? <UserActions /> : <AiActions />}
             </div>
        </div>
    );
}