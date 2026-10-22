import React from 'react';
import {
  FileUp,
  FolderOpen,
  FilePlus,
  Globe,
  Sparkles,
  ShieldCheck,
  FileCode,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface EmptyStateProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onOpenUrl: () => void;
  onOpenSample: (sampleKey: 'spec' | 'showcase' | 'quickstart') => void;
  recentDocuments: DocumentItem[];
  onOpenRecent: (doc: DocumentItem) => void;
  isDragging: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onNewFile,
  onOpenFile,
  onOpenUrl,
  onOpenSample,
  recentDocuments,
  onOpenRecent,
  isDragging,
}) => {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-2xl text-center space-y-8 animate-in fade-in duration-300">
        {/* Hero title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Kompletan Markdown pregledač i editor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            MD Viewer & Editor
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Kreirajte nove dokumente, uređujte postojeće Markdown fajlove sa živim prikazom, pretražujte sadržaj i izvozite u DOCX, TXT ili PDF formate.
          </p>
        </div>

        {/* Action Buttons: New, Open, URL */}
        <div className="flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={onNewFile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition hover:shadow cursor-pointer"
          >
            <FilePlus className="w-4 h-4" />
            <span>Novi Markdown dokument</span>
          </button>

          <button
            onClick={onOpenFile}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 text-sm font-medium transition cursor-pointer"
          >
            <FolderOpen className="w-4 h-4 text-amber-500" />
            <span>Otvori sa računara</span>
          </button>

          <button
            onClick={onOpenUrl}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-medium transition cursor-pointer"
          >
            <Globe className="w-4 h-4 text-blue-500" />
            <span>Sa URL-a</span>
          </button>
        </div>

        {/* Drag & Drop Card */}
        <div
          onClick={onOpenFile}
          className={`border-2 border-dashed rounded-3xl p-8 sm:p-10 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/60 shadow-xs'
          }`}
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition duration-200">
            <FileUp className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Ili prevucite <span className="text-blue-600 dark:text-blue-400">.md fajl</span> ovde
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              automatski se otvara u kartici spremnoj za uređivanje i pregled
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              .md
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              .markdown
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              .mdown
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              .txt
            </span>
          </div>
        </div>

        {/* Quick Sample Documents */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3">
            Ili započnite sa pripremljenim primerima:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <button
              onClick={() => onOpenSample('spec')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <FileCode className="w-4 h-4 text-blue-500" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                Objedinjena Specifikacija
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Kompletna specifikacija v1.2 (Viewer & Editor)
              </div>
            </button>

            <button
              onClick={() => onOpenSample('showcase')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                GFM & Markdown Vodič
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Tabele, blokovi koda, formule i slike
              </div>
            </button>

            <button
              onClick={() => onOpenSample('quickstart')}
              className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1.5">
                <Clock className="w-4 h-4 text-emerald-500" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                Korisnički Vodič
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Uređivanje, Save/Save As i DOCX/TXT izvoz
              </div>
            </button>
          </div>
        </div>

        {/* Recently opened list if available */}
        {recentDocuments.length > 0 && (
          <div className="pt-2 text-left">
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Nedavno otvarani dokumenti:
            </div>
            <div className="flex flex-wrap gap-2">
              {recentDocuments.map((doc) => (
                <button
                  key={doc.id}
                  onClick={() => onOpenRecent(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition"
                >
                  <FileCode className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate max-w-[200px]">{doc.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Privacy badge */}
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% lokalna obrada — vaši fajlovi nikada ne napuštaju vaš pregledač.</span>
        </div>
      </div>
    </div>
  );
};
