'use client';

import { useState } from 'react';
import { LLMProvider, BoardState } from '../types';
import { Search, Plus, Settings, ChevronDown, MoreHorizontal, User, LogOut } from 'lucide-react';

interface SidebarProps {
    boards: Pick<BoardState, 'id' | 'name'>[];
    onSelectBoard: (boardId: string) => void;
    selectedLLM: LLMProvider;
    onSelectLLM: (provider: LLMProvider) => void;
}

export default function Sidebar({ boards, onSelectBoard, selectedLLM, onSelectLLM }: SidebarProps) {
    const [activeBoardId, setActiveBoardId] = useState(boards[0]?.id);

    const handleBoardSelect = (id: string) => {
        // TBD: Backend call to fetch board data for the given id
        setActiveBoardId(id);
        onSelectBoard(id);
    };

    const handleNewChat = () => {
        // TBD: Backend call to create a new chat board
        console.log("Creating new chat...");
    };

    const handleRenameChat = (id: string) => {
        // TBD: Backend call to rename chat
        console.log(`Renaming chat ${id}`);
    };

    const handleDeleteChat = (id: string) => {
        // TBD: Backend call to delete chat
        console.log(`Deleting chat ${id}`);
    };

    return (
        <aside className="flex h-screen w-72 flex-col bg-slate-800 p-4 shadow-2xl">
            {/* Workspace Switcher */}
            <div className="mb-4">
                <button className="flex w-full items-center justify-between rounded-lg p-2 text-left transition-colors hover:bg-slate-700">
                    <div>
                        <span className="text-xs text-slate-400">Workspace</span>
                        <h2 className="font-semibold text-white">My Workspace</h2>
                    </div>
                    <ChevronDown size={20} className="text-slate-400" />
                </button>
            </div>

            {/* Search and New Chat */}
            <div className="mb-4 flex items-center gap-2">
                <div className="relative flex-grow">
                    <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search chats..."
                        className="w-full rounded-md border border-slate-600 bg-slate-700 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <button onClick={handleNewChat} title="New Chat" className="flex-shrink-0 rounded-md bg-blue-600 p-2 text-white transition-colors hover:bg-blue-500">
                    <Plus size={20} />
                </button>
            </div>

            {/* Chat List */}
            <nav className="flex-grow overflow-y-auto pr-1">
                <ul className="space-y-1">
                    {boards.map((board) => (
                        <li key={board.id}>
                            <a
                                onClick={() => handleBoardSelect(board.id)}
                                className={`group flex cursor-pointer items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors ${activeBoardId === board.id ? 'bg-slate-700/80 text-white' : 'text-slate-300 hover:bg-slate-700/50'
                                    }`}
                            >
                                {board.name}
                                <div className="relative opacity-0 group-hover:opacity-100">
                                    <MoreHorizontal size={18} className="text-slate-400" />
                                    {/* Dropdown for actions */}
                                </div>
                            </a>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* LLM Selector & Settings */}
            <div className="mt-auto space-y-2 pt-4">
                <div className="glass-pane rounded-lg p-4 pt-2">
                    <label className="text-xs text-slate-400">Active LLM</label>
                    <div className="flex items-center justify-between gap-3 mt-1">
                        <select
                            value={selectedLLM}
                            onChange={(e) => onSelectLLM(e.target.value as LLMProvider)}
                            className="w-full rounded-md bg-slate-700 border border-slate-600 py-2 px-3 text-sm font-semibold text-white focus:outline-none focus:ring-2 focus:ring-blue-500 hover:bg-slate-600"
                        >
                            <option value="gpt-oss-120b">GPT OSS 120B</option>
                            <option value="gpt-oss-20b">GPT OSS 20B</option>
                            <option value="qwen-3-32b">Qwen 3 32B</option>
                            <option value="llama-4-scout">Llama 4 Scout</option>
                            <option value="kimi-k2">Kimi K2</option>
                            <option value="llama-3.3-70b">Llama 3.3 70B</option>
                            <option value="llama-4-maverick">Llama 4 Maverick</option>
                            <option value="whisper-large-v3">Whisper Large v3</option>

                        </select>
                        <button title="Model Settings" className="text-slate-400 hover:text-white">
                            <Settings size={18} />
                        </button>
                    </div>
                </div>

                {/* User Profile */}
                <div className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 font-bold">
                            A
                        </div>
                        <span className="text-sm font-medium">Alex</span>
                    </div>
                    <button title="Logout" className="text-slate-400 hover:text-white">
                        {/* TBD: Logout functionality */}
                        <LogOut size={18} />
                    </button>
                </div>
            </div>
        </aside>
    );
}