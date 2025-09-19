// ContextMenu.tsx
// Converts your old <select> into a Headless UI <Menu> dropdown.
// - Pass the current `model` and an `onChange(newValue)` handler.
// - Keyboard & screen-reader friendly; keeps your Tailwind vibes.

import { Menu, MenuButton, MenuItems, MenuItem } from '@headlessui/react';
import { ChevronDown, Check } from 'lucide-react';
import * as React from 'react';

type ContextManagement = { value: string; label: string };

const OPTIONS: ContextManagement[] = [
    { value: 'TBD', label: 'TBD' },
];

export function ContextMenu({
    ctxMgmt,
    onChange,
    className = '',
}: {
    ctxMgmt: string;
    onChange: (value: string) => void;
    className?: string;
}) {
    const current =
        OPTIONS.find((m) => m.value === ctxMgmt)?.label ?? 'Select a context system';

    return (
        <Menu as="div" className={`relative ${className} flex flex-col gap-2 w-full`}>
            <label htmlFor="ctxmenu" className="text-xs font-medium text-slate-300">Memory Management</label>
            <MenuButton id="ctxmenu" className="inline-flex w-full items-center justify-between gap-x-1.5 rounded-xl bg-slate-900 px-3 py-3 text-xs font-semibold text-white inset-ring-1 inset-ring-white/5 hover:bg-slate-950">
                <span className="truncate">{current}</span>
                <ChevronDown size={16} className="-mr-1 text-gray-400" />
            </MenuButton>

            <MenuItems
                transition
                className="absolute left-0 -bottom-12 z-10 mt-2 w-full origin-top-right rounded-md bg-gray-800 outline-1 -outline-offset-1 outline-white/10 shadow-lg transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
            >
                <div className="p-1 max-h-72 overflow-auto">
                    {OPTIONS.map((opt) => (
                        <MenuItem key={opt.value}>
                            {({ focus }) => (
                                <button
                                    type="button"
                                    onClick={() => onChange(opt.value)}
                                    className={[
                                        'flex w-full items-center gap-2 px-3 py-2 text-left text-sm',
                                        'text-gray-300',
                                        focus ? 'bg-white/5 text-white outline-hidden' : '',
                                    ].join(' ')}
                                >
                                    <Check
                                        size={16}
                                        className={opt.value === ctxMgmt ? 'opacity-100' : 'opacity-0'}
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