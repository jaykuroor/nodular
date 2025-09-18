// ModelMenu.tsx
// Converts your old <select> into a Headless UI <Menu> dropdown.
// - Pass the current `model` and an `onChange(newValue)` handler.
// - Keyboard & screen-reader friendly; keeps your Tailwind vibes.

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import { LLMProvider } from '../types';
import * as React from 'react';

type ModelOption = { value: LLMProvider; label: string };

const MODEL_OPTIONS: ModelOption[] = [
    { value: 'gpt-oss-120b', label: 'GPT OSS 120B' },
    { value: 'gpt-oss-20b', label: 'GPT OSS 20B' },
    { value: 'qwen-3-32b', label: 'Qwen 3 32B' },
    { value: 'llama-4-scout', label: 'Llama 4 Scout' },
    { value: 'kimi-k2', label: 'Kimi K2' },
    { value: 'llama-3.3-70b', label: 'Llama 3.3 70B' },
    { value: 'llama-4-maverick', label: 'Llama 4 Maverick' },
    { value: 'whisper-large-v3', label: 'Whisper Large v3' },
    { value: 'claude-v1', label: 'Claude v1' },
    { value: 'local-model', label: 'Local Model' },
];

export function ModelMenu({
    model,
    onChange,
    className = '',
}: {
    model: LLMProvider;
    onChange: React.Dispatch<React.SetStateAction<LLMProvider>>; // 👈 change here
    className?: string;
}) {
    const current =
        MODEL_OPTIONS.find((m) => m.value === model)?.label ?? 'Select a model';

    return (
        <Menu as="div" className={`relative inline-block ${className}`}>
            <MenuButton id = "ctxmenu" className="inline-flex w-full items-center justify-between gap-x-1.5 rounded-xl bg-slate-900 px-3 py-2 text-xs font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-slate-950">
                <span className="truncate">{current}</span>
                <ChevronDown size={16} className="-mr-1 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute right-0 z-10 mt-2 w-64 origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 shadow-lg transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
                <div className="py-1 max-h-72 overflow-auto">
                    {MODEL_OPTIONS.map((opt) => (
                        <MenuItem key={opt.value}>
                            {({ focus }) => (
                                <button
                                    type="button"
                                    onClick={() => onChange(opt.value)} // ✅ now matches setter type
                                    className={[
                                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                                        'text-gray-300',
                                        focus ? 'bg-white/5 text-white outline-hidden' : '',
                                    ].join(' ')}
                                >
                                    <Check
                                        size={16}
                                        className={opt.value === model ? 'opacity-100' : 'opacity-0'}
                                        aria-hidden="true"
                                    />
                                    <span className="truncate">{opt.label}</span>
                                </button>
                            )}
                        </MenuItem>
                    ))}
                </div>
            </MenuItems>
        </Menu>
    );
}