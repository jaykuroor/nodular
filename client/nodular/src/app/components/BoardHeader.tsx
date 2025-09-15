import { Share2, Download, LayoutGrid, Rows, Columns } from 'lucide-react';
import { useState } from 'react';

interface BoardHeaderProps {
    boardName: string;
}

export default function BoardHeader({ boardName }: BoardHeaderProps) {
    const [viewMode, setViewMode] = useState('canvas');

    const handleShare = () => {
        // TBD: Backend call to generate share link/manage permissions
        console.log("Sharing board...");
    };

    const handleExport = () => {
        // TBD: Logic to export board as PNG/JSON
        console.log("Exporting board...");
    };

    return (
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800/80 px-6">
            <h1 className="text-lg font-semibold text-white">{boardName}</h1>
            <div className="flex items-center gap-2">
                <div className="flex items-center rounded-md border border-slate-600 p-1">
                    <button title="Canvas View" onClick={() => setViewMode('canvas')} className={`rounded p-1.5 ${viewMode === 'canvas' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
                        <Rows size={18} />
                    </button>
                    <button title="Tree View" onClick={() => setViewMode('tree')} className={`rounded p-1.5 ${viewMode === 'tree' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
                        <Columns size={18} />
                    </button>
                    <button title="Grid View" onClick={() => setViewMode('grid')} className={`rounded p-1.5 ${viewMode === 'grid' ? 'bg-slate-700' : 'hover:bg-slate-700'}`}>
                        <LayoutGrid size={18} />
                    </button>
                </div>
                <button onClick={handleExport} className="rounded-md bg-slate-700 px-3 py-1.5 text-sm font-medium hover:bg-slate-600">
                    <Download size={16} className="inline-block mr-2" />
                    Export
                </button>
                <button onClick={handleShare} className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-500">
                    <Share2 size={16} className="inline-block mr-2" />
                    Share
                </button>
            </div>
        </header>
    );
}