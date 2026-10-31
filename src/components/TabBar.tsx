import React, { useState } from 'react';
import { DocumentItem } from '../types';
import { FileText, X, Plus, Trash2, Edit2, Check, FileUp } from 'lucide-react';
import { formatBytes } from '../utils/markdown';

interface TabBarProps {
  documents: DocumentItem[];
  activeDocId: string | null;
  onSelectDoc: (id: string) => void;
  onCloseDoc: (id: string) => void;
  onCloseAll: () => void;
  onNewFile: () => void;
  onRenameDoc?: (id: string, newName: string) => void;
  isDragging?: boolean;
  onDropFiles?: (files: FileList | File[]) => void;
  onOpenFilePicker?: () => void;
}

export const TabBar: React.FC<TabBarProps> = ({
  documents,
  activeDocId,
  onSelectDoc,
  onCloseDoc,
  onCloseAll,
  onNewFile,
  onRenameDoc,
  isDragging = false,
  onDropFiles,
  onOpenFilePicker,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [isOverDropZone, setIsOverDropZone] = useState(false);
  const [isOverTabBar, setIsOverTabBar] = useState(false);

  if (documents.length === 0) return null;

  const handleStartRename = (doc: DocumentItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(doc.id);
    setEditingName(doc.name);
  };

  const handleFinishRename = (id: string) => {
    if (editingName.trim() && onRenameDoc) {
      const clean = editingName.trim();
      const hasExt = clean.endsWith('.md') || clean.endsWith('.docx');
      onRenameDoc(id, hasExt ? clean : `${clean}.md`);
    }
    setEditingId(null);
  };

  return (
    <div
      onDragEnter={(e) => {
        e.preventDefault();
        setIsOverTabBar(true);
      }}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        setIsOverTabBar(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsOverTabBar(false);
        }
      }}
      onDrop={(e) => {
        e.preventDefault();
        setIsOverTabBar(false);
        setIsOverDropZone(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          onDropFiles?.(e.dataTransfer.files);
        }
      }}
      className={`flex items-center justify-between border-b transition-colors duration-200 px-2 py-1 overflow-x-auto no-print select-none ${
        isOverTabBar
          ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800'
          : 'bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800'
      }`}
    >
      <div className="flex items-center gap-1.5 overflow-x-auto flex-1 mr-2 scrollbar-none py-0.5">
        {documents.map((doc) => {
          const isActive = doc.id === activeDocId;
          const isEditingThis = editingId === doc.id;

          return (
            <div
              key={doc.id}
              onClick={() => onSelectDoc(doc.id)}
              className={`group flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition shrink-0 max-w-[170px] sm:max-w-[260px] ${
                isActive
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-800'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-900/40'
              }`}
              title={`${doc.name} (${formatBytes(doc.size)})${doc.isModified ? ' • Nesačuvane izmene' : ''}`}
            >
              <FileText
                className={`w-3.5 h-3.5 shrink-0 ${
                  doc.isModified
                    ? 'text-amber-500'
                    : isActive
                    ? 'text-blue-500'
                    : 'text-slate-400'
                }`}
              />

              {isEditingThis ? (
                <div
                  className="flex items-center gap-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <input
                    type="text"
                    value={editingName}
                    onChange={(e) => setEditingName(e.target.value)}
                    onBlur={() => handleFinishRename(doc.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleFinishRename(doc.id);
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    autoFocus
                    className="w-20 sm:w-24 bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-xs outline-none text-slate-900 dark:text-slate-100 font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => handleFinishRename(doc.id)}
                    className="p-0.5 hover:text-emerald-500"
                  >
                    <Check className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <span
                  onDoubleClick={(e) => handleStartRename(doc, e)}
                  className="truncate"
                >
                  {doc.name}
                </span>
              )}

              {/* Modified indicator bullet dot according to Section 4.4 */}
              {doc.isModified && (
                <span
                  className="text-amber-500 font-extrabold text-sm leading-none shrink-0"
                  title="Dokument ima nesačuvane izmene"
                >
                  •
                </span>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onCloseDoc(doc.id);
                }}
                className="opacity-70 sm:opacity-0 sm:group-hover:opacity-100 p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-rose-500 transition ml-0.5 sm:ml-1"
                title="Zatvori dokument"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          );
        })}

        <button
          onClick={() => onNewFile()}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-900/50 transition shrink-0"
          title="Kreiraj novi dokument (Ctrl+N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Novi fajl</span>
        </button>

        {/* Drag & Drop dashed rounded rectangle drop target */}
        <div
          onDragEnter={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOverDropZone(true);
          }}
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
            e.dataTransfer.dropEffect = 'copy';
            setIsOverDropZone(true);
          }}
          onDragLeave={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOverDropZone(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsOverDropZone(false);
            setIsOverTabBar(false);
            if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
              onDropFiles?.(e.dataTransfer.files);
            }
          }}
          onClick={onOpenFilePicker || onNewFile}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border-2 border-dashed transition-all duration-200 shrink-0 cursor-pointer select-none ${
            isOverDropZone
              ? 'border-blue-600 bg-blue-100 dark:bg-blue-900/70 text-blue-800 dark:text-blue-100 scale-102 shadow-md shadow-blue-500/20'
              : isDragging || isOverTabBar
              ? 'border-blue-500 dark:border-blue-400 bg-blue-50/90 dark:bg-blue-950/70 text-blue-600 dark:text-blue-300 animate-pulse shadow-xs'
              : 'border-slate-300 dark:border-slate-700/80 hover:border-blue-400 dark:hover:border-blue-500 text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-white/60 dark:hover:bg-slate-900/40'
          }`}
          title="Prevucite i spustite .md fajl ovde da biste ga učitali u novi tab (ili kliknite za odabir)"
        >
          <FileUp
            className={`w-3.5 h-3.5 transition-transform ${
              isOverDropZone ? 'scale-110 text-blue-600 animate-bounce' : 'text-blue-500'
            }`}
          />
          <span className="text-xs font-semibold whitespace-nowrap">
            {isOverDropZone
              ? 'Pusti fajl ovde'
              : isDragging || isOverTabBar
              ? 'Spusti dokument ovde'
              : 'Prevuci fajl ovde'}
          </span>
        </div>
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
