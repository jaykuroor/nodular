// Create a new file: src/app/components/NewNodeModal.tsx
import { useState } from 'react';

interface NewNodeModalProps {
    onClose: () => void;
}

export default function NewNodeModal({ onClose }: NewNodeModalProps) {
    const [text, setText] = useState('');

    const handleSubmit = () => {
        // TBD: Logic to create a new node with the text
        console.log("Creating new node with text:", text);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="glass-pane w-full max-w-md rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white">Create New Node</h2>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    className="mt-4 w-full rounded-md border border-slate-600 bg-slate-700 p-2 text-white"
                    placeholder="Enter the text for the new node..."
                    rows={4}
                />
                <div className="mt-4 flex justify-end gap-2">
                    <button onClick={onClose} className="rounded-md bg-slate-600 px-4 py-2 text-white">Cancel</button>
                    <button onClick={handleSubmit} className="rounded-md bg-blue-600 px-4 py-2 text-white">Create</button>
                </div>
            </div>
        </div>
    );
}