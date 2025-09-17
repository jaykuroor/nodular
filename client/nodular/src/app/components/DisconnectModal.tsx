'use client';

interface DisconnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  fileName: string;
  nodeTitle: string;
}

export default function DisconnectModal({ isOpen, onClose, onConfirm, fileName, nodeTitle }: DisconnectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="glass-pane w-full max-w-md rounded-lg p-6">
        <h2 className="text-lg font-semibold text-white">Confirm Disconnection</h2>
        <p className="mt-4 text-slate-300">
          Are you sure you want to disconnect <span className="font-semibold text-white">{fileName}</span> from <span className="font-semibold text-white">{nodeTitle}</span>?
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md bg-slate-600 px-4 py-2 text-white">Cancel</button>
          <button onClick={onConfirm} className="rounded-md bg-red-600 px-4 py-2 text-white">Disconnect</button>
        </div>
      </div>
    </div>
  );
}