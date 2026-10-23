import React from 'react';
import { ArrowUp } from 'lucide-react';

interface ScrollToTopButtonProps {
  visible: boolean;
  onClick: () => void;
  title?: string;
  ariaLabel?: string;
}

export const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({
  visible,
  onClick,
  title = 'Idi na vrh stranice',
  ariaLabel = 'Idi na vrh stranice',
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      title={title}
      className={`absolute bottom-6 right-6 z-30 flex items-center justify-center w-11 h-11 rounded-full border shadow-lg backdrop-blur-xs transition-all duration-300 ease-in-out cursor-pointer group active:scale-90 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
        visible
          ? 'opacity-100 translate-y-0 scale-100 pointer-events-auto'
          : 'opacity-0 translate-y-4 scale-75 pointer-events-none'
      } bg-white/95 dark:bg-slate-800/95 text-slate-700 dark:text-slate-200 border-slate-200/90 dark:border-slate-700/80 shadow-slate-300/40 dark:shadow-black/50 hover:text-blue-600 dark:hover:text-blue-400 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-white dark:hover:bg-slate-750 hover:shadow-xl`}
    >
      <ArrowUp className="w-5 h-5 transition-transform duration-200 group-hover:-translate-y-0.5" />
    </button>
  );
};
