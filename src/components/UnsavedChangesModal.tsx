import React from 'react';
import { AlertTriangle, X, Save, Trash2 } from 'lucide-react';

interface UnsavedChangesModalProps {
  isOpen: boolean;
  docName: string;
  onSave: () => void;
  onDiscard: () => void;
  onCancel: () => void;
}

export const UnsavedChangesModal: React.FC<UnsavedChangesModalProps> = ({
  isOpen,
  docName,
  onSave,
  onDiscard,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-amber-600 dark:text-amber-500 font-semibold text-base">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Nesačuvane izmene</span>
          </div>
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3 text-sm text-slate-700 dark:text-slate-300">
          <p>
            Dokument <strong className="text-slate-900 dark:text-slate-100 font-semibold">"{docName}"</strong> ima nesačuvane izmene.
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Da li želite da sačuvate izmene pre nego što nastavite? Ako izaberete "Nemoj sačuvati", sve promene od poslednjeg čuvanja biće izgubljene.
          </p>
        </div>

        {/* Footer actions */}
        <div className="flex flex-wrap items-center justify-end gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-2 rounded-xl text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition font-medium"
          >
            Otkaži
          </button>

          <button
            type="button"
            onClick={onDiscard}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition font-medium"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Nemoj sačuvati</span>
          </button>

          <button
            type="button"
            onClick={onSave}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white transition font-medium shadow-sm"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Sačuvaj izmene</span>
          </button>
        </div>
      </div>
    </div>
  );
};
