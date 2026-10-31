import React from 'react';
import { DocumentStats, ViewMode, PaperFormat } from '../types';
import {
  FileText,
  Clock,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  BookOpen,
  Columns,
  GitCompare,
} from 'lucide-react';
import { PAPER_FORMAT_MAP } from '../utils/pagination';

interface StatusBarProps {
  fileName: string;
  isModified: boolean;
  stats: DocumentStats;
  viewMode?: ViewMode;
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
  activeHeading,
  onOpenSettings,
  isSplitScreenActive = false,
  isDiffActive = false,
  currentPage,
  totalPages,
  paperFormat = 'a4',
}) => {
  const activeFormatInfo = PAPER_FORMAT_MAP[paperFormat] || PAPER_FORMAT_MAP.a4;
  const fileSizeInKb = ((stats.fileSizeBytes || 0) / 1024).toFixed(1);

  return (
    <footer className="status-bar h-8 px-3 border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-950/90 backdrop-blur-sm flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 select-none z-20 no-print">
      {/* Levi deo: Stavke 1 do 7 po traženom redosledu */}
      <div className="flex items-center gap-2.5 overflow-hidden text-[11px]">
        {/* 1. Naziv učitanog dokumenta */}
        <div
          className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300 truncate max-w-[160px] sm:max-w-xs shrink-0"
          title={fileName}
        >
          <FileText className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span className="truncate">{fileName}</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

        {/* 2. Trenutna sekcija */}
        <div
          className="hidden sm:flex items-center gap-1 text-slate-500 dark:text-slate-400 truncate max-w-[130px] md:max-w-[190px]"
          title={activeHeading ? `Trenutna sekcija: ${activeHeading}` : 'Početak dokumenta (Uvod)'}
        >
          <span className="text-slate-400 dark:text-slate-500 shrink-0">Sekcija:</span>
          <span className="text-slate-700 dark:text-slate-300 font-medium truncate">
            {activeHeading || 'Uvod'}
          </span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>

        {/* 3. Trenutna strana */}
        <div
          onClick={onOpenSettings}
          className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50/90 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 font-medium cursor-pointer hover:bg-blue-100 dark:hover:bg-blue-900/80 transition shrink-0"
          title={`Format papira: ${activeFormatInfo.name} (${activeFormatInfo.dimensionsLabel}) • Kliknite za promenu formata papira`}
        >
          <BookOpen className="w-3 h-3 text-blue-500 shrink-0" />
          <span>
            Strana{' '}
            <strong className="font-semibold text-blue-900 dark:text-blue-100">
              {currentPage || 1}
            </strong>{' '}
            od{' '}
            <strong className="font-semibold text-blue-900 dark:text-blue-100">
              {totalPages || 1}
            </strong>
          </span>
          <span className="text-[9px] px-1 py-0.2 rounded font-mono font-bold bg-blue-200/70 dark:bg-blue-900/90 text-blue-800 dark:text-blue-200 uppercase">
            {paperFormat.toUpperCase()}
          </span>
        </div>

        {/* 4. Veličina dokumenta u KB - skriveno u mobilnom režimu */}
        <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
        <span
          className="font-mono text-slate-600 dark:text-slate-400 hidden md:inline shrink-0"
          title={`Tačna veličina: ${stats.fileSizeBytes.toLocaleString()} bajtova`}
        >
          {fileSizeInKb} KB
        </span>

        {/* 5. Veličina dokumenta u linijama teksta - skriveno u mobilnom režimu */}
        <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
        <span className="hidden md:inline font-mono text-slate-600 dark:text-slate-400 shrink-0">
          {stats.lines.toLocaleString()} linija
        </span>

        {/* 6. Veličina dokumenta u broju karaktera - skriveno u mobilnom režimu */}
        <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
        <span className="hidden md:inline font-mono text-slate-600 dark:text-slate-400 shrink-0">
          {stats.characters.toLocaleString()} karaktera
        </span>

        {/* 7. Vreme potrebno za čitanje - skriveno u mobilnom režimu */}
        <span className="text-slate-300 dark:text-slate-700 hidden md:inline">•</span>
        <div className="hidden md:flex items-center gap-1 text-slate-600 dark:text-slate-400 shrink-0">
          <Clock className="w-3 h-3 text-slate-400" />
          <span>~{stats.readingTimeMinutes} min čitanja</span>
        </div>
      </div>

      {/* Desni deo: Stavke 8 i 9 po traženom redosledu */}
      <div className="flex items-center gap-3 text-[11px] shrink-0">
        {/* Split Screen / Diff indikatori ako su aktivni */}
        {isSplitScreenActive && (
          <div className="hidden xl:flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold text-[10px]">
            <Columns className="w-3 h-3 text-indigo-500" />
            <span>Split Screen</span>
          </div>
        )}
        {isDiffActive && (
          <div className="hidden xl:flex items-center gap-1 px-1.5 py-0.5 rounded bg-violet-50 dark:bg-violet-950/70 text-violet-700 dark:text-violet-300 border border-violet-200 dark:border-violet-800 font-semibold text-[10px]">
            <GitCompare className="w-3 h-3 text-violet-500" />
            <span>Diff</span>
          </div>
        )}

        {/* 8. Status (Sačuvano / Nesačuvano) */}
        <div className="flex items-center gap-1 shrink-0">
          {isModified ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/60 px-2 py-0.5 rounded-full text-[10px]">
              <AlertCircle className="w-2.5 h-2.5" />
              <span>Nesačuvano</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-900/60 px-2 py-0.5 rounded-full text-[10px]">
              <CheckCircle2 className="w-2.5 h-2.5" />
              <span>Sačuvano</span>
            </span>
          )}
        </div>

        {/* 9. Lokalna obrada */}
        <div
          className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium shrink-0"
          title="Fajl se obrađuje isključivo lokalno u vašem pregledaču"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="text-[10px]">Lokalna obrada</span>
        </div>
      </div>
    </footer>
  );
};
