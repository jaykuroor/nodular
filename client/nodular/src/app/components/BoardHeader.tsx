import { Share2, Download, LayoutGrid, Rows, Columns, HelpCircle } from 'lucide-react';
import { ViewMode } from '../types';

interface BoardHeaderProps {
    boardName: string;
    setViewMode: (mode: ViewMode) => void;
    viewMode: ViewMode;
    onToggleGuide: () => void;
}

export default function BoardHeader({ boardName, setViewMode, viewMode, onToggleGuide }: BoardHeaderProps) {

    return (
        <header className="flex h-16 flex-shrink-0 items-center justify-between border-b border-slate-700 bg-slate-800/80 px-6">
            <h1 className="text-lg font-semibold text-white">{boardName}</h1>
            <div className="flex items-center gap-2">
                <button onClick={() => setViewMode('thread')} title="Thread View" className={`rounded p-1.5 hover:bg-slate-700 ${viewMode === 'thread' ? 'bg-slate-700' : ''}`}>
                    <Rows size={18} />
                </button>
                <button onClick={() => setViewMode('zoomed-out')} title="Zoomed Out View" className={`rounded p-1.5 hover:bg-slate-700 ${viewMode === 'zoomed-out' ? 'bg-slate-700' : ''}`}>
                    <Columns size={18} />
                </button>
                <button onClick={() => setViewMode('map')} title="Map View" className={`rounded p-1.5 hover:bg-slate-700 ${viewMode === 'map' ? 'bg-slate-700' : ''}`}>
                    <LayoutGrid size={18} />
                </button>
                <button onClick={onToggleGuide} title="Show Guide" className="rounded p-1.5 hover:bg-slate-700">
                    <HelpCircle size={18} />
                </button>
                
                {/* ... (rest of the export/share buttons are the same) */}
            </div>
        </header>
    );
}