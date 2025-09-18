'use client';

import { Handle, Position } from 'reactflow';
import { User, GripHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { LLMProvider } from '../types';

// The data prop is passed by React Flow and contains the 'bubble' object from our board state.
export default function SystemNode({ data }: { data: any }) {
  const { bubble, onRemove } = data;

  // Internal state for the component's controls
  const [prompt, setPrompt] = useState(bubble.messages[0]?.text || '');
  const [temperature, setTemperature] = useState(0.7);
  const [model, setModel] = useState<LLMProvider>('gpt-oss-120b');

  // #TODO: These handlers should be connected to a global state management solution (e.g., Zustand, Context)
  // to update the central 'boardState' when the user interacts with this node.
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    // #TODO: Update system prompt in global state
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTemp = parseFloat(e.target.value);
    setTemperature(newTemp);
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

  return (
    <div className="glass-pane flex flex-col shadow-2xl group z-20 rounded-xl bg-slate-9850 w-80vw">
      {/* Handles are connection points for React Flow edges */}
      <Handle type="target" position={Position.Top} className="invisible" />
      
      <header className="drag-handle cursor-pointer flex items-center justify-between rounded-t-xl px-4 py-2 peer bg-slate-850">
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

      <div className="p-4 bg-slate-850 rounded-b-xl space-y-4">
        {/* Prompt Text Area */}
        <div>
            <textarea
              value={prompt}
              onChange={handlePromptChange}
              className="w-full h-64 rounded-md border border-slate-800 bg-slate-900 p-2 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-700 resize-none"
              placeholder="e.g., You are a helpful assistant for writing code..."
            />
        </div>

        {/* Temperature Slider */}
        <div className="flex-1">
            <label htmlFor="temperature" className="block text-sm font-medium text-slate-300 mb-1">Temperature: {temperature.toFixed(1)}</label>
            <input
                type="range"
                id="temperature"
                value={temperature}
                onChange={handleTemperatureChange}
                min="0"
                max="2"
                step="0.1"
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-700"
            />
        </div>

        {/* Model and Context Select Side-by-Side */}
        <div className="flex gap-4">
            {/* Model Selector */}
            <div className="flex-1">
                <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-1">Model</label>
                <select
                    id="model"
                    value={model}
                    onChange={handleModelChange}
                    className="w-full rounded-md border border-slate-600 bg-slate-700 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-700 h-[42px]"
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
            </div>
            {/* Context Management Dropdown */}
            <div className="flex-1">
                <label htmlFor="context" className="block text-sm font-medium text-slate-300 mb-1">Context</label>
                <select
                    id="context"
                    onChange={handleContextChange}
                    className="w-full rounded-md border border-slate-600 bg-slate-700 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-700 h-[42px]"
                >
                    <option>TBD: Short-term</option>
                    <option>TBD: Long-term</option>
                </select>
            </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="invisible" />
    </div>
  );
}