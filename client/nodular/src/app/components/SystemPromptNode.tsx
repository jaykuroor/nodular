'use client';

import { Handle, Position } from 'reactflow';
import { Settings, GripHorizontal, X } from 'lucide-react';
import { useState } from 'react';
import { LLMProvider } from '../types';

// The data prop is passed by React Flow and contains the 'bubble' object from our board state.
export default function SystemNode({ data }: { data: any }) {
  const { bubble, onRemove } = data;

  // Internal state for the component's controls
  const [prompt, setPrompt] = useState(bubble.messages[0]?.text || '');
  const [temperature, setTemperature] = useState(0.7);
  const [model, setModel] = useState<LLMProvider>('gpt-oss-120b');

  // TBD: These handlers should be connected to a global state management solution (e.g., Zustand, Context)
  // to update the central 'boardState' when the user interacts with this node.
  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    console.log('TBD: Update system prompt in global state:', e.target.value);
  };

  const handleTemperatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTemp = parseFloat(e.target.value);
    // Clamp the value between 0 and 2
    if (!isNaN(newTemp)) {
        const clampedTemp = Math.max(0, Math.min(2, newTemp));
        setTemperature(clampedTemp);
        console.log('TBD: Update temperature in global state:', clampedTemp);
    }
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newModel = e.target.value as LLMProvider;
    setModel(newModel);
    console.log('TBD: Update model in global state:', newModel);
  };

  const handleRemove = () => {
    // TBD: Implement a confirmation modal before removing the system node, if desired.
    onRemove(bubble.id);
  };

  return (
    <div className="glass-pane flex flex-col shadow-2xl group z-20 rounded-xl bg-slate-900 w-96">
      {/* Handles are connection points for React Flow edges */}
      <Handle type="target" position={Position.Top} className="invisible" />
      
      <header className="drag-handle cursor-pointer flex items-center justify-between rounded-t-xl px-4 py-2 peer bg-slate-950">
        <div className="flex items-center gap-2">
            <Settings size={16} className="text-purple-400" />
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
              className="w-full h-32 rounded-md border border-slate-600 bg-slate-700 p-2 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              placeholder="e.g., You are a helpful assistant for writing code..."
            />
        </div>

        {/* Temperature and Model Select Side-by-Side */}
        <div className="flex gap-4">
            {/* Temperature Input */}
            <div className="flex-1">
                <label htmlFor="temperature" className="block text-sm font-medium text-slate-300 mb-1">Temperature</label>
                <input
                    type="number"
                    id="temperature"
                    value={temperature}
                    onChange={handleTemperatureChange}
                    min="0"
                    max="2"
                    step="0.1"
                    className="w-full rounded-md border border-slate-600 bg-slate-700 p-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
            </div>

            {/* Model Selector */}
            <div className="flex-1">
                <label htmlFor="model" className="block text-sm font-medium text-slate-300 mb-1">Model</label>
                <select
                    id="model"
                    value={model}
                    onChange={handleModelChange}
                    className="w-full rounded-md border border-slate-600 bg-slate-700 p-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500 h-[42px]"
                >
                    <option value="gpt-oss-120b">gpt-oss-120b</option>
                    <option value="gpt-oss-20b">gpt-oss-20b</option>
                    <option value="qwen-3-32b">qwen-3-32b</option>
                    <option value="llama-4-scout">llama-4-scout</option>
                    <option value="kimi-k2">kimi-k2</option>
                    <option value="llama-3.3-70b">llama-3.3-70b</option>
                    <option value="llama-4-maverick">llama-4-maverick</option>
                    <option value="whisper-large-v3">whisper-large-v3</option>
                </select>
            </div>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} className="invisible" />
    </div>
  );
}