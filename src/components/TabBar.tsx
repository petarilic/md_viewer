import React from 'react';
import { DocumentItem } from '../types';
import { FileText, X, Plus, Trash2 } from 'lucide-react';
import { formatBytes } from '../utils/markdown';

interface TabBarProps {
  documents: DocumentItem[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onCloseDoc: (id: string) => void;
  onCloseAll: () => void;
  onNewFile: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  onCloseDoc,
  onCloseAll,
  onNewFile,
}) => {
  if (documents.length === 0) return null;

  return (
    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950 px-2 py-1 overflow-x-auto no-print select-none">
      <div className="flex items-center gap-1 overflow-x-auto flex-1 mr-2 scrollbar-none py-0.5">
        {documents.map((doc) => {
          const isActive = doc.id === activeDocId;
          return (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`group flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition shrink-0 max-w-[220px] ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-900/40'
              }`}
              title={`${doc.name} (${formatBytes(doc.size)})`}
            >
              <FileText className={`w-3.5 h-3.5 shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
              <span className="truncate">{doc.name}</span>
              <span className="text-[10px] text-slate-400 font-mono hidden sm:inline-block">
                {formatBytes(doc.size)}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseDoc(doc.id);
                }}
                className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition ml-1"
                title="Zatvori dokument"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={onNewFile}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-900/50 transition shrink-0"
          title="Otvori novi dokument"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Novi fajl</span>
        </button>
      </div>

      {documents.length > 1 && (
        <button
          onClick={onCloseAll}
          className="flex items-center gap-1 px-2 py-1 rounded text-xs text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition shrink-0"
          title="Zatvori sve otvorene dokumente"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Zatvori sve</span>
        </button>
      )}
    </div>
  );
};
