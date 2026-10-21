import React, { useEffect, useRef } from 'react';
import { Search, ChevronUp, ChevronDown, X, CaseSensitive, WholeWord } from 'lucide-react';
import { SearchState } from '../types';

interface SearchOverlayProps {
  searchState: SearchState;
  onUpdateSearch: (updates: Partial<SearchState>) => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onClose: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  searchState,
  onUpdateSearch,
  onNextMatch,
  onPrevMatch,
  onClose,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchState.isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [searchState.isOpen]);

  if (!searchState.isOpen) return null;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'Enter') {
      if (e.shiftKey) {
        onPrevMatch();
      } else {
        onNextMatch();
      }
    }
  };

  const hasMatches = searchState.totalMatches > 0;
  const isSearching = searchState.query.trim().length > 0;

  return (
    <div className="absolute top-16 right-6 z-40 flex items-center gap-1.5 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-slate-800 dark:text-slate-200 transition-all animate-in fade-in slide-in-from-top-2">
      <div className="flex items-center gap-2 pl-2.5 pr-1 py-1 bg-slate-100 dark:bg-slate-800/70 rounded-lg">
        <Search className="w-4 h-4 text-slate-400 shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchState.query}
          onChange={(e) => onUpdateSearch({ query: e.target.value })}
          onKeyDown={handleKeyDown}
          placeholder="Pronađi u dokumentu..."
          className="bg-transparent text-sm w-44 sm:w-56 outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
        />

        {isSearching && (
          <span
            className={`text-xs px-1.5 py-0.5 rounded font-mono font-medium ${
              hasMatches
                ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300'
                : 'bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300'
            }`}
          >
            {hasMatches
              ? `${searchState.currentIndex + 1}/${searchState.totalMatches}`
              : 'Nema rezultata'}
          </span>
        )}
      </div>

      {/* Case Sensitive Toggle */}
      <button
        onClick={() => onUpdateSearch({ matchCase: !searchState.matchCase })}
        className={`p-1.5 rounded-lg text-xs font-semibold transition ${
          searchState.matchCase
            ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Razlikuj velika i mala slova (Aa)"
      >
        <CaseSensitive className="w-4 h-4" />
      </button>

      {/* Whole Word Toggle */}
      <button
        onClick={() => onUpdateSearch({ wholeWord: !searchState.wholeWord })}
        className={`p-1.5 rounded-lg text-xs font-semibold transition ${
          searchState.wholeWord
            ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800'
            : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
        }`}
        title="Samo cela reč"
      >
        <WholeWord className="w-4 h-4" />
      </button>

      <div className="w-px h-5 bg-slate-200 dark:bg-slate-800 my-auto" />

      {/* Navigation Arrows */}
      <button
        onClick={onPrevMatch}
        disabled={!hasMatches}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-600 dark:text-slate-300 transition"
        title="Prethodni pogodak (Shift + Enter)"
      >
        <ChevronUp className="w-4 h-4" />
      </button>

      <button
        onClick={onNextMatch}
        disabled={!hasMatches}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-600 dark:text-slate-300 transition"
        title="Sledeći pogodak (Enter)"
      >
        <ChevronDown className="w-4 h-4" />
      </button>

      {/* Close button */}
      <button
        onClick={onClose}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition"
        title="Zatvori (Esc)"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
