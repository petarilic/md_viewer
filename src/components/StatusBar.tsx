import React from 'react';
import { DocumentStats, ViewMode } from '../types';
import { FileText, Clock, Type, ShieldCheck, Eye, Edit3, Columns, CheckCircle2, AlertCircle } from 'lucide-react';
import { formatBytes } from '../utils/markdown';

interface StatusBarProps {
  fileName: string;
  isModified: boolean;
  stats: DocumentStats;
  viewMode: ViewMode;
  activeHeading: string | null;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  fileName,
  isModified,
  stats,
  viewMode,
  activeHeading,
}) => {
  const viewModeIcons = {
    edit: <Edit3 className="w-3 h-3 text-amber-500" />,
    rendered: <Eye className="w-3 h-3 text-blue-500" />,
    split: <Columns className="w-3 h-3 text-purple-500" />,
  };

  const viewModeLabels = {
    edit: 'Uređivanje',
    rendered: 'Formatirano',
    split: 'Podeljeno',
  };

  return (
    <footer className="status-bar h-8 px-3 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none z-20 no-print">
      {/* Left items: filename, modified state, file size, words, characters, lines */}
      <div className="flex items-center gap-3 overflow-hidden text-[11px]">
        <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px] sm:max-w-xs">
          <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{fileName}</span>
        </div>

        {/* Saved / Modified status badge */}
        <div className="flex items-center gap-1">
          {isModified ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-1.5 py-0.2 rounded-full text-[10px]">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Nesačuvano</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-1.5 py-0.2 rounded-full text-[10px]">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Sačuvano</span>
            </span>
          )}
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

        <span className="font-mono text-slate-500 hidden sm:inline">
          {formatBytes(stats.fileSizeBytes)}
        </span>

        <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>

        <div className="hidden md:flex items-center gap-1">
          <Type className="w-3 h-3 text-slate-400" />
          <span>{stats.words.toLocaleString()} reči</span>
          <span className="text-slate-400 text-[10px]">({stats.characters.toLocaleString()} kar.)</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>

        <span className="hidden md:inline font-mono">{stats.lines} linija</span>

        <span className="text-slate-300 dark:text-slate-700 hidden lg:inline">•</span>

        <div className="hidden lg:flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>~{stats.readingTimeMinutes} min čitanja</span>
        </div>
      </div>

      {/* Right items: active section, view mode, privacy indicator */}
      <div className="flex items-center gap-3 text-[11px] shrink-0">
        {activeHeading && (
          <div className="hidden xl:flex items-center gap-1 text-slate-400 truncate max-w-xs">
            <span className="text-slate-500">Sekcija:</span>
            <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
              {activeHeading}
            </span>
          </div>
        )}

        <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
          {viewModeIcons[viewMode]}
          <span>{viewModeLabels[viewMode]}</span>
        </div>

        <div
          className="hidden sm:flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium"
          title="Fajl se obrađuje lokalno u vašem pregledaču"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[10px]">Lokalna obrada</span>
        </div>
      </div>
    </footer>
  );
};
