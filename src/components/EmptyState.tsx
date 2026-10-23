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
  Terminal,
  History,
  Scale,
  BookOpen,
  Cpu,
  Users,
  LayoutGrid,
} from 'lucide-react';
import { DocumentItem } from '../types';

interface EmptyStateProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onOpenUrl: () => void;
  onSelectTemplate?: (templateId: string) => void;
  onOpenSample: (sampleKey: 'spec' | 'showcase' | 'quickstart') => void;
  recentDocuments: DocumentItem[];
  onOpenRecent: (doc: DocumentItem) => void;
  isDragging: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  onNewFile,
  onOpenFile,
  onOpenUrl,
  onSelectTemplate,
  onOpenSample,
  recentDocuments,
  onOpenRecent,
  isDragging,
}) => {
  return (
    <div className="flex-1 overflow-y-auto flex flex-col items-center justify-start p-6 sm:p-12">
      <div className="w-full max-w-3xl text-center space-y-8 animate-in fade-in duration-300 py-4">
        {/* Hero title */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-medium">
            <Sparkles className="w-3.5 h-3.5" />
            <span>MD Viewer & Editor</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            Kako želite da započnete?
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm sm:text-base max-w-lg mx-auto">
            Izaberite novi prazan dokument, upotrebite neki od gotovih Markdown šablona ili otvorite postojeći fajl sa računara.
          </p>
        </div>

        {/* Primary Choice Cards: Blank document vs Choose template vs Open file */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
          {/* Option 1: Blank Document */}
          <button
            onClick={() => (onSelectTemplate ? onSelectTemplate('empty') : onNewFile())}
            className="p-5 rounded-2xl border-2 border-blue-500/30 hover:border-blue-500 bg-white dark:bg-slate-900/80 hover:bg-blue-50/50 dark:hover:bg-blue-950/30 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition">
                <FilePlus className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <span>Novi prazan dokument</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Počnite unos teksta u čistom, praznom Markdown fajlu
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span>Kreiraj odmah</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* Option 2: Explore all templates */}
          <button
            onClick={() => onNewFile()}
            className="p-5 rounded-2xl border-2 border-indigo-500/30 hover:border-indigo-500 bg-white dark:bg-slate-900/80 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/30 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition">
                <LayoutGrid className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <span>Izaberi gotov šablon</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Pregledajte biblioteku šablona (API, README, Licenca, Specifikacije)
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
              <span>Pregledaj šablone</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>

          {/* Option 3: Open existing file */}
          <button
            onClick={() => onOpenFile()}
            className="p-5 rounded-2xl border-2 border-slate-200 dark:border-slate-800 hover:border-amber-500/80 bg-white dark:bg-slate-900/80 hover:bg-amber-50/50 dark:hover:bg-amber-950/30 shadow-xs hover:shadow-md transition-all group cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 shadow-xs group-hover:scale-105 transition">
                <FolderOpen className="w-5 h-5" />
              </div>
              <div className="font-bold text-slate-900 dark:text-slate-100 text-sm flex items-center gap-1.5">
                <span>Otvori sa uređaja</span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Učitajte lokalni .md fajl za pregled i izmene
              </div>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center gap-1 text-xs font-semibold text-amber-600 dark:text-amber-400">
              <span>Izaberi fajl</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
            </div>
          </button>
        </div>

        {/* Popular Templates Direct Grid */}
        <div className="space-y-3 text-left">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span>Popularni Markdown šabloni za brzi start:</span>
            </div>
            <button
              onClick={() => onNewFile()}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Vidi sve šablone →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {/* API Docs Template */}
            <button
              onClick={() => (onSelectTemplate ? onSelectTemplate('api-docs') : onNewFile())}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/70 bg-white dark:bg-slate-900/60 hover:bg-emerald-50/30 dark:hover:bg-emerald-950/20 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400">
                  <Terminal className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition">
                  API Dokumentacija
                </div>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                REST rute, query parametri, JSON tela i statusni kodovi
              </div>
            </button>

            {/* Changelog Template */}
            <button
              onClick={() => (onSelectTemplate ? onSelectTemplate('changelog') : onNewFile())}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/70 bg-white dark:bg-slate-900/60 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400">
                  <History className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition">
                  Dnevnik Izmena (Changelog)
                </div>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                SemVer verzije i sekcije (Added, Changed, Fixed, Removed)
              </div>
            </button>

            {/* MIT License Template */}
            <button
              onClick={() => (onSelectTemplate ? onSelectTemplate('license') : onNewFile())}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-purple-500/70 bg-white dark:bg-slate-900/60 hover:bg-purple-50/30 dark:hover:bg-purple-950/20 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400">
                  <Scale className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition">
                  Softverska Licenca (MIT)
                </div>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                Pravna dozvola, autorska prava i odricanje garancije
              </div>
            </button>

            {/* Project README Template */}
            <button
              onClick={() => (onSelectTemplate ? onSelectTemplate('readme') : onNewFile())}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-500/70 bg-white dark:bg-slate-900/60 hover:bg-amber-50/30 dark:hover:bg-amber-950/20 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition">
                  README Projekta
                </div>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                Bedževi, instalacija, tehnologije i primeri pokretanja
              </div>
            </button>

            {/* Technical Specification Template */}
            <button
              onClick={() => (onSelectTemplate ? onSelectTemplate('tech-spec') : onNewFile())}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-cyan-500/70 bg-white dark:bg-slate-900/60 hover:bg-cyan-50/30 dark:hover:bg-cyan-950/20 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-cyan-100 dark:bg-cyan-950/80 text-cyan-600 dark:text-cyan-400">
                  <Cpu className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-cyan-600 dark:group-hover:text-cyan-400 transition">
                  Tehnička Specifikacija
                </div>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                Arhitektura sistema, modeli podataka i bezbednost
              </div>
            </button>

            {/* Meeting Notes Template */}
            <button
              onClick={() => (onSelectTemplate ? onSelectTemplate('meeting-notes') : onNewFile())}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-pink-500/70 bg-white dark:bg-slate-900/60 hover:bg-pink-50/30 dark:hover:bg-pink-950/20 text-left transition group cursor-pointer"
            >
              <div className="flex items-center gap-2.5 mb-1">
                <div className="p-1.5 rounded-lg bg-pink-100 dark:bg-pink-950/80 text-pink-600 dark:text-pink-400">
                  <Users className="w-3.5 h-3.5" />
                </div>
                <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 group-hover:text-pink-600 dark:group-hover:text-pink-400 transition">
                  Zapisnik sa Sastanka
                </div>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2">
                Učesnici, dnevni red, donete odluke i akcioni zadaci
              </div>
            </button>
          </div>
        </div>

        {/* Drag & Drop Card with URL alternative */}
        <div
          onClick={() => onOpenFile()}
          className={`border-2 border-dashed rounded-3xl p-6 sm:p-8 transition-all cursor-pointer group flex flex-col items-center justify-center gap-2.5 ${
            isDragging
              ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/40 scale-[1.01]'
              : 'border-slate-300 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/60 shadow-xs'
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition duration-200">
            <FileUp className="w-6 h-6" />
          </div>

          <div className="space-y-1">
            <div className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Ili prevucite <span className="text-blue-600 dark:text-blue-400">.md fajl</span> ovde
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Automatski se otvara u kartici spremnoj za uređivanje i formatirani pregled
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenUrl();
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 text-xs transition"
            >
              <Globe className="w-3.5 h-3.5 text-blue-500" />
              <span>Otvori sa web adrese (URL)</span>
            </button>
          </div>
        </div>

        {/* Quick Sample Documents */}
        <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
          <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-3 text-left">
            Ili pogledajte pripremljene primere i dokumentaciju:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            <button
              onClick={() => onOpenSample('spec')}
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
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
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
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
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 dark:hover:border-blue-600 bg-white dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition group cursor-pointer"
            >
              <div className="flex items-center justify-between mb-1">
                <Clock className="w-4 h-4 text-emerald-500" />
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition" />
              </div>
              <div className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                Korisnički Vodič
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Prečice, Save/Save As i DOCX/TXT izvoz
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
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500 dark:text-slate-400 pt-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>100% lokalna obrada — vaši fajlovi nikada ne napuštaju vaš pregledač.</span>
        </div>
      </div>
    </div>
  );
};
