'use client';

import { Keyboard, Scroll, X } from 'lucide-react'; // Changed MouseWheel to Scroll

interface GuideProps {
    onClose: () => void;
}

export default function Guide({ onClose }: GuideProps) {
    return (
        <div className="glass-pane absolute top-4 right-4 z-10 w-64 rounded-lg p-4 text-sm text-slate-300 shadow-lg">
            <button onClick={onClose} className="absolute top-2 right-2 p-1 text-slate-400 hover:text-white">
                <X size={18} />
            </button>
            <h4 className="font-bold text-white mb-2">Quick Guide</h4>
            <ul className="space-y-2">
                <li className="flex items-center gap-2">
                    <span>Zoom :</span>
                    <Keyboard size={18} />
                    <span>Shift</span>
                    <span>+</span>
                    <Scroll size={18} /> {/* Corrected Icon */}
                    <span>Scroll</span>
                </li>
                <li className="flex items-center gap-2">
                <span>Drag & drop files to add them to context! </span>
                </li>
            </ul>
        </div>
    );
}