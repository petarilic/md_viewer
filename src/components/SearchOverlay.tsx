import React, { useEffect, useRef } from 'react';
import {
  Search,
  ChevronUp,
  ChevronDown,
  X,
  CaseSensitive,
  WholeWord,
  Replace,
  ReplaceAll,
  ChevronRight,
} from 'lucide-react';
import { SearchState } from '../types';

interface SearchOverlayProps {
  searchState: SearchState;
  onUpdateSearch: (updates: Partial<SearchState>) => void;
  onNextMatch: () => void;
  onPrevMatch: () => void;
  onReplaceCurrent: () => void;
  onReplaceAll: () => void;
  onClose: () => void;
  isEditorActive?: boolean;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
  searchState,
  onUpdateSearch,
  onNextMatch,
  onPrevMatch,
  onReplaceCurrent,
  onReplaceAll,
  onClose,
  isEditorActive = false,
}) => {
  const findInputRef = useRef<HTMLInputElement>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchState.isOpen) {
      setTimeout(() => {
        if (searchState.isReplaceOpen && replaceInputRef.current) {
          findInputRef.current?.focus();
        } else {
          findInputRef.current?.focus();
          findInputRef.current?.select();
        }
      }, 50);
    }
  }, [searchState.isOpen, searchState.isReplaceOpen]);

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
    <div className="absolute top-16 right-4 sm:right-6 z-40 flex flex-col p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-slate-800 dark:text-slate-200 transition-all animate-in fade-in slide-in-from-top-2 max-w-sm sm:max-w-md w-full select-none no-print">
      {/* Row 1: Find Input & Main Controls */}
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onUpdateSearch({ isReplaceOpen: !searchState.isReplaceOpen })}
          className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition ${
            searchState.isReplaceOpen ? 'rotate-90 text-blue-500' : ''
          }`}
          title={searchState.isReplaceOpen ? 'Sakrij zamenu' : 'Otvori zamenu teksta (Ctrl+H)'}
        >
          <ChevronRight className="w-3.5 h-3.5 transition-transform" />
        </button>

        <div className="flex-1 flex items-center gap-2 pl-2.5 pr-2 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
          <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <input
            ref={findInputRef}
            type="text"
            value={searchState.query}
            onChange={(e) => onUpdateSearch({ query: e.target.value })}
            onKeyDown={handleKeyDown}
            placeholder="Pronađi..."
            className="bg-transparent text-xs w-full outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
          />

          {isSearching && (
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-medium shrink-0 ${
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
          type="button"
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
          type="button"
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

        {/* Navigation Arrows */}
        <button
          type="button"
          onClick={onPrevMatch}
          disabled={!hasMatches}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-600 dark:text-slate-300 transition"
          title="Prethodni pogodak (Shift + Enter)"
        >
          <ChevronUp className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={onNextMatch}
          disabled={!hasMatches}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none text-slate-600 dark:text-slate-300 transition"
          title="Sledeći pogodak (Enter)"
        >
          <ChevronDown className="w-4 h-4" />
        </button>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition"
          title="Zatvori (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Row 2: Replace Bar (if opened) */}
      {searchState.isReplaceOpen && (
        <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in">
          <div className="w-6" /> {/* Spacer */}
          <div className="flex-1 flex items-center pl-2.5 pr-2 py-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
            <input
              ref={replaceInputRef}
              type="text"
              value={searchState.replaceText}
              onChange={(e) => onUpdateSearch({ replaceText: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') onReplaceCurrent();
              }}
              placeholder="Zameni sa..."
              className="bg-transparent text-xs w-full outline-none text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          <button
            type="button"
            onClick={onReplaceCurrent}
            disabled={!hasMatches || !isEditorActive}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 text-xs font-medium disabled:opacity-40 disabled:pointer-events-none transition"
            title="Zameni trenutni pogodak"
          >
            <Replace className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Zameni</span>
          </button>

          <button
            type="button"
            onClick={onReplaceAll}
            disabled={!hasMatches || !isEditorActive}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 hover:text-blue-600 dark:hover:text-blue-400 text-slate-700 dark:text-slate-300 text-xs font-medium disabled:opacity-40 disabled:pointer-events-none transition"
            title="Zameni sve pogotke u dokumentu"
          >
            <ReplaceAll className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sve</span>
          </button>
        </div>
      )}
    </div>
  );
};
