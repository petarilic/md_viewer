import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  text: string;
}

interface ToastProps {
  toast: ToastMessage | null;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast, onClose]);

  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />,
    error: <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-400 shrink-0" />,
  };

  const bgColors = {
    success: 'bg-emerald-950/90 border-emerald-800 text-emerald-200',
    error: 'bg-rose-950/90 border-rose-800 text-rose-200',
    info: 'bg-slate-900/90 border-slate-700 text-slate-200',
  };

  return (
    <div className="fixed bottom-12 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg border shadow-xl backdrop-blur-md text-sm transition-all animate-in fade-in slide-in-from-bottom-2 ${bgColors[toast.type]}">
      {icons[toast.type]}
      <span className="font-medium">{toast.text}</span>
      <button
        onClick={onClose}
        className="ml-2 p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition"
        aria-label="Zatvori obaveštenje"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
