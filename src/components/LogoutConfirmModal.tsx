import React from 'react';
import { LogOut, X, CheckCircle2 } from 'lucide-react';

interface LogoutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const LogoutConfirmModal: React.FC<LogoutConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-[#181411] border border-amber-500/25 rounded-3xl shadow-2xl p-6 space-y-5 text-center">
        {/* CLOSE BUTTON */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-900/60 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 border border-neutral-800 transition cursor-pointer"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* LOGO / ICON */}
        <div className="mx-auto w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
          <LogOut className="w-6 h-6 stroke-[2]" />
        </div>

        {/* TITLE & MESSAGE */}
        <div className="space-y-1.5">
          <h2 className="text-lg font-bold text-amber-100 font-outfit">
            Log out?
          </h2>
          <p className="text-xs text-neutral-400 flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Your data is safely synced.</span>
          </p>
        </div>

        {/* ACTION BUTTONS */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-[#26201b] hover:bg-[#302822] text-neutral-300 font-semibold text-xs border border-neutral-700/60 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="py-2.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg shadow-rose-950/60 transition cursor-pointer"
          >
            Log out
          </button>
        </div>
      </div>
    </div>
  );
};
