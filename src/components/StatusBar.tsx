import React from 'react';
import { DocumentStats, ViewMode, PaperFormat } from '../types';
import {
  FileText,
  Clock,
  Type,
  ShieldCheck,
  Eye,
  Edit3,
  Columns,
  CheckCircle2,
  AlertCircle,
  Info,
  HelpCircle,
  GitCompare,
  BookOpen,
} from 'lucide-react';
import { formatBytes } from '../utils/markdown';
import { APP_ABOUT_CONFIG } from '../config/aboutConfig';
import { PAPER_FORMAT_MAP } from '../utils/pagination';

interface StatusBarProps {
  fileName: string;
  isModified: boolean;
  stats: DocumentStats;
  viewMode: ViewMode;
  activeHeading: string | null;
  onOpenAbout?: () => void;
  onOpenHelp?: () => void;
  onOpenSettings?: () => void;
  isSplitScreenActive?: boolean;
  isDiffActive?: boolean;
  currentPage?: number;
  totalPages?: number;
  paperFormat?: PaperFormat;
}

export const StatusBar: React.FC<StatusBarProps> = ({
  fileName,
  isModified,
  stats,
  viewMode,
  activeHeading,
  onOpenAbout,
  onOpenHelp,
  onOpenSettings,
  isSplitScreenActive = false,
  isDiffActive = false,
  currentPage,
  totalPages,
  paperFormat = 'a4',
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

  const activeFormatInfo = PAPER_FORMAT_MAP[paperFormat] || PAPER_FORMAT_MAP.a4;

  return (
    <footer className="status-bar h-8 px-3 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none z-20 no-print">
      {/* Left items: filename, modified state, file size, words, characters, lines, pages */}
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

        {/* Page counter based on selected paper format (e.g. Strana 1 od 4 (A4)) */}
        {totalPages !== undefined && (
          <>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <div
              onClick={onOpenSettings}
              className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 font-medium cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/80 transition"
              title={`Format papira: ${activeFormatInfo.name} (${activeFormatInfo.dimensionsLabel}) • Kliknite za promenu formata papira u podešavanjima`}
            >
              <BookOpen className="w-3 h-3 text-blue-500 shrink-0" />
              <span>
                Strana <strong className="font-semibold text-blue-900 dark:text-blue-100">{currentPage || 1}</strong> od <strong className="font-semibold text-blue-900 dark:text-blue-100">{totalPages || 1}</strong>
              </span>
              <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-blue-200/70 dark:bg-blue-900/90 text-blue-800 dark:text-blue-200 uppercase">
                {paperFormat.toUpperCase()}
              </span>
            </div>
          </>
        )}

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

        {isSplitScreenActive && (
          <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-[10px]">
            <Columns className="w-3 h-3 text-indigo-500" />
            <span>Split Screen (2 dok.)</span>
          </div>
        )}

        {isDiffActive && (
          <div className="hidden md:flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-semibold text-[10px]">
            <GitCompare className="w-3 h-3 text-violet-500" />
            <span>Diff Uključen</span>
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

        {onOpenHelp && (
          <button
            onClick={onOpenHelp}
            className="flex items-center gap-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-1.5 py-0.5 rounded transition cursor-pointer"
            title="Pomoć i uputstvo (Help) [F1]"
            aria-label="Pomoć (F1)"
          >
            <HelpCircle className="w-3 h-3 text-blue-500" />
            <span className="text-[10px] font-mono">F1</span>
          </button>
        )}

        {onOpenAbout && (
          <button
            onClick={onOpenAbout}
            className="flex items-center gap-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 px-1.5 py-0.5 rounded transition cursor-pointer"
            title="O aplikaciji (About) [~]"
            aria-label="O aplikaciji"
          >
            <Info className="w-3 h-3 text-indigo-500" />
            <span className="text-[10px] font-mono">v{APP_ABOUT_CONFIG.version}</span>
          </button>
        )}
      </div>
    </footer>
  );
};
