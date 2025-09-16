import { File as FileIcon, X } from 'lucide-react';

interface FileNodeProps {
    fileName: string;
    isShrunk?: boolean;
    onOpen: () => void;
    onRemove: () => void;
}

export default function FileNode({ fileName, isShrunk, onOpen, onRemove }: FileNodeProps) {
    return (
        <div className="flex items-center justify-between p-4 gap-3 bg-slate-850 rounded-b-xl">
            <div className="flex items-center gap-2 truncate">
                <FileIcon size={20} className="text-slate-300" />
                <span className="text-white truncate" title={fileName}>{fileName}</span>
            </div>
            <div className="flex items-center">
                <button onClick={onOpen} className="text-sm text-blue-400 hover:underline hover:cursor-pointer">{isShrunk ? "Reveal" : "Hide"}</button>
            </div>
        </div>
    );
}