'use client';

import { Handle, Position } from 'reactflow';
import { User, GripHorizontal, X, Settings, ChevronUp, ChevronDown, Wrench, Plus } from 'lucide-react';
import { useState } from 'react';
import { LLMProvider } from '../types';
import { ModelMenu } from './ModelMenu';
import { ContextMenu } from './ContextMenu';
import { ButtonHandle } from './ButtonHandle';

// The data prop is passed by React Flow and contains the 'bubble' object from our board state.
export default function SystemNode({ data }: { data: any }) {
    const { bubble, onRemove, onAddNode } = data;

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

    const handleWheel = (e: React.WheelEvent<HTMLTextAreaElement>) => {
        e.stopPropagation();
    };

    const nodeClasses = `glass-pane flex flex-col shadow-2xl group z-20 rounded-xl w-80vw ${isFocused && `nodrag`}`;


    return (
        <div className={nodeClasses}>
            {/* Handles are connection points for React Flow edges */}
            <Handle type="target" position={Position.Top} className="invisible" />
            <Handle type="source" position={Position.Top} id="top" className="invisible" />
            <Handle type="source" position={Position.Right} id="right" className="invisible" />
            <Handle type="source" position={Position.Left} id="left" className="invisible" />


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
                        onWheel={handleWheel}
                        className="w-full h-32 rounded-md border border-slate-700 bg-slate-900/70 p-2 text-slate-300 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="e.g., You are a helpful assistant for writing code..."
                    />
                </div>

                <div className="flex justify-between items-center gap-4">
                    {/* Advanced Settings Button */}
                    <button onClick={() => { setShowAdvanced(!showAdvanced) }} className="flex items-center gap-2 text-xs bg-slate-900 rounded-xl px-2.5 py-2 text-slate-100 hover:text-white hover:bg-slate-950 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <Wrench size={15} /> {showAdvanced ? 'Hide' : 'Show'} Advanced Settings
                    </button>
                    <ModelMenu model={model} onChange={setModel} />

                </div>

                {/* Advanced Settings */}
                {showAdvanced && (
                    <div className="flex gap-4 px-4 py-8 items-start shadow-xl inset-shadow-xs inset-shadow-slate-700/80 bg-slate-700/10 rounded-lg">
                        {/* Temperature Control */}
                        <div className="flex flex-col items-center gap-2">
                            <label htmlFor="temperature" className="text-xs font-medium text-slate-300">Temperature</label>
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

            <ButtonHandle type="source" position={Position.Bottom} id="bottom">
                <button
                    onClick={() => onAddNode(bubble.id)}
                    className="p-1 rounded-full bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                    <Plus size={12} />
                </button>
            </ButtonHandle>
        </div>
    );
}