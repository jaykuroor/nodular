'use client';

import { Handle, Position } from 'reactflow';
import { User, GripHorizontal, X, Settings, ChevronUp, ChevronDown, Wrench } from 'lucide-react';
import { useState } from 'react';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { LLMProvider } from '../types';
import { ModelMenu } from './ModelMenu';
import { ContextMenu } from './ContextMenu';

// The data prop is passed by React Flow and contains the 'bubble' object from our board state.
export default function SystemNode({ data }: { data: any }) {
    const { bubble, onRemove } = data;

    // Internal state for the component's controls
    const [prompt, setPrompt] = useState(bubble.messages[0]?.text || '');
    const [temperature, setTemperature] = useState(0.7);
    const [model, setModel] = useState<LLMProvider>('gpt-oss-120b');
    const [contextManagement, setContextManagement] = useState('Select a context system');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isFocused, setIsFocused] = useState(false);


    // #TODO: These handlers should be connected to a global state management solution (e.g., Zustand, Context)
    // to update the central 'boardState' when the user interacts with this node.
    const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setPrompt(e.target.value);
        // #TODO: Update system prompt in global state
    };

    const handleTemperatureChange = (newTemp: number) => {
        const temp = Math.max(0, Math.min(2, newTemp));
        setTemperature(parseFloat(temp.toFixed(1)));
        // #TODO: Update temperature in global state
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newModel = e.target.value as LLMProvider;
        setModel(newModel);
        // #TODO: Update model in global state
    };

    const handleContextChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        // #TODO: Implement context management logic
        console.log("Context management TBD:", e.target.value);
    };

    const handleRemove = () => {
        // TBD: Implement a confirmation modal before removing the system node, if desired.
        onRemove(bubble.id);
    };

    const nodeClasses = `glass-pane flex flex-col shadow-2xl group z-20 rounded-xl w-80vw ${isFocused && `nodrag`}`;


    return (
        <div className={nodeClasses}>
            {/* Handles are connection points for React Flow edges */}
            <Handle type="target" position={Position.Top} className="invisible" />

            <header className="drag-handle cursor-pointer flex items-center justify-between rounded-t-xl px-4 py-2 peer bg-slate-800/50">
                <User size={16} className="text-blue-400" />
                <div className="flex items-center gap-2">
                    <GripHorizontal size={16} className='opacity-40' />
                    <h3 className="text-sm font-semibold text-white truncate" title={bubble.title}>System Prompt</h3>
                </div>
                <div className="flex items-center gap-1">
                    <button onClick={handleRemove} title="Remove" className="rounded p-1 text-slate-100 hover:bg-slate-700 hover:text-white">
                        <X size={16} />
                    </button>
                </div>
            </header>

            <div className="p-4 bg-slate-800/50 rounded-b-xl space-y-4">
                {/* Prompt Text Area */}
                <div>
                    <textarea
                        value={prompt}
                        onChange={handlePromptChange}
                        onFocus={() => setIsFocused(true)}
                        onBlur={() => setIsFocused(false)}
                        className="w-full h-32 rounded-md border border-slate-700 bg-slate-900/70 p-2 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="e.g., You are a helpful assistant for writing code..."
                    />
                </div>

                <div className="flex justify-between items-center gap-4">
                    {/* Advanced Settings Button */}
                    <button onClick={() => { setShowAdvanced(!showAdvanced) }} className="flex items-center gap-2 text-xs bg-black/20 rounded-xl px-2.5 py-2 text-slate-100 hover:text-white hover:bg-black/30 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <Wrench size={15} /> {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                    </button>
                    {/* Model Selector */}
                    {/* <div className="flex-1">
                        
                        <select
                            id="model"
                            value={model}
                            onChange={handleModelChange}
                            className="w-full rounded-xl bg-slate-900 hover:bg-slate-950 px-2.5 py-2 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value="gpt-oss-120b">GPT OSS 120B</option>
                            <option value="gpt-oss-20b">GPT OSS 20B</option>
                            <option value="qwen-3-32b">Qwen 3 32B</option>
                            <option value="llama-4-scout">Llama 4 Scout</option>
                            <option value="kimi-k2">Kimi K2</option>
                            <option value="llama-3.3-70b">Llama 3.3 70B</option>
                            <option value="llama-4-maverick">Llama 4 Maverick</option>
                            <option value="whisper-large-v3">Whisper Large v3</option>
                            <option value="claude-v1">Claude v1</option>
                            <option value="local-model">Local Model</option>
                        </select>
                    </div> */}

                    <ModelMenu model={model} onChange={setModel} />

                </div>

                {/* Advanced Settings */}
                {showAdvanced && (
                    <div className="flex gap-4 pt-2 items-center">
                        {/* Temperature Control */}
                        <div className="flex flex-col items-center gap-2">
                            <label htmlFor="temperature" className="text-sm font-medium text-slate-300">Temperature</label>
                            <div className="flex items-center gap-1 rounded-md bg-slate-900 hover:bg-slate-950 p-1">
                                <input
                                    type="number"
                                    id="temperature"
                                    value={temperature.toFixed(1)}
                                    onChange={(e) => handleTemperatureChange(parseFloat(e.target.value))}
                                    min="0"
                                    max="2"
                                    step="0.1"
                                    className="w-12 bg-transparent text-center text-slate-300 text-sm focus:outline-none"
                                />
                                <div className="flex flex-col">
                                    <button onClick={() => handleTemperatureChange(temperature + 0.1)} className="h-4 w-4 rounded-sm temp-button-up"><ChevronUp size={16} /></button>
                                    <button onClick={() => handleTemperatureChange(temperature - 0.1)} className="h-4 w-4 rounded-sm temp-button-down"><ChevronDown size={16} /></button>
                                </div>
                            </div>
                        </div>
                        {/* Context Management Dropdown */}
                        <ContextMenu ctxMgmt={contextManagement} onChange={() => {}} />
                    </div>
                )}
            </div>

            <Handle type="source" position={Position.Bottom} className="invisible" />
        </div>
    );
}