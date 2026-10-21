import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FolderOpen,
  Globe,
  Eye,
  Code,
  Columns,
  Search,
  Sliders,
  Sun,
  Moon,
  Laptop,
  Maximize,
  Minimize,
  Download,
  Printer,
  Copy,
  ChevronDown,
  Menu,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { ViewMode, Theme, ViewerSettings } from '../types';

interface HeaderToolbarProps {
  onOpenFile: () => void;
  onOpenUrl: () => void;
  onOpenSample: (sampleKey: 'spec' | 'showcase' | 'quickstart') => void;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isTocOpen: boolean;
  onToggleToc: () => void;
  onOpenSearch: () => void;
  onOpenSettings: () => void;
  settings: ViewerSettings;
  onUpdateSettings: (newSettings: Partial<ViewerSettings>) => void;
  onCopyMarkdown: () => void;
  onPrint: () => void;
  onDownloadMarkdown: () => void;
  hasDocument: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  onOpenFile,
  onOpenUrl,
  onOpenSample,
  viewMode,
  onChangeViewMode,
  isTocOpen,
  onToggleToc,
  onOpenSearch,
  onOpenSettings,
  settings,
  onUpdateSettings,
  onCopyMarkdown,
  onPrint,
  onDownloadMarkdown,
  hasDocument,
  isFullscreen,
  onToggleFullscreen,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSampleMenuOpen, setIsSampleMenuOpen] = useState(false);
  const exportMenuRef = useRef<HTMLDivElement>(null);
  const sampleMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(e.target as Node)) {
        setIsSampleMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Theme toggle cycle
  const handleToggleTheme = () => {
    const nextTheme: Theme =
      settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
    onUpdateSettings({ theme: nextTheme });
  };

  const themeIcons = {
    light: <Sun className="w-4 h-4 text-amber-500" />,
    dark: <Moon className="w-4 h-4 text-blue-400" />,
    system: <Laptop className="w-4 h-4 text-slate-400" />,
  };

  return (
    <header className="toolbar h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 select-none no-print">
      {/* Left side: Logo & TOC toggle & File Open buttons */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Toggle TOC button */}
        {hasDocument && (
          <button
            onClick={onToggleToc}
            className={`p-2 rounded-xl transition cursor-pointer ${
              isTocOpen
                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900/60'
                : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
            }`}
            title={isTocOpen ? 'Sakrij sadržaj' : 'Prikaži sadržaj dokumenta (TOC)'}
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Brand logo */}
        <div className="flex items-center gap-2 mr-1 sm:mr-3">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs">
            <FileText className="w-4 h-4" />
          </div>
          <div className="hidden sm:block">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">
              MD Viewer
            </span>
          </div>
        </div>

        {/* File Actions */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={onOpenFile}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-xs transition cursor-pointer"
            title="Otvori lokalni Markdown fajl (Ctrl+O)"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Otvori fajl</span>
          </button>

          <button
            onClick={onOpenUrl}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Učitaj Markdown sa URL adrese"
          >
            <Globe className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden lg:inline">Sa URL-a</span>
          </button>

          {/* Sample docs dropdown */}
          <div className="relative" ref={sampleMenuRef}>
            <button
              onClick={() => setIsSampleMenuOpen(!isSampleMenuOpen)}
              className="flex items-center gap-1 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Učitaj pripremljene primere"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden xl:inline">Primeri</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isSampleMenuOpen && (
              <div className="absolute left-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => {
                    onOpenSample('spec');
                    setIsSampleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                  <div>
                    <div className="font-medium">Specifikacija Projekta</div>
                    <div className="text-[10px] text-slate-400">Specifikacija ovog MD Viewer-a</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onOpenSample('showcase');
                    setIsSampleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <div>
                    <div className="font-medium">GFM & Markdown Vodič</div>
                    <div className="text-[10px] text-slate-400">Tabele, blokovi koda, formule</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    onOpenSample('quickstart');
                    setIsSampleMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <FileText className="w-3.5 h-3.5 text-emerald-500" />
                  <div>
                    <div className="font-medium">Brzi start vodič</div>
                    <div className="text-[10px] text-slate-400">Prečice i uputstvo za upotrebu</div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Center: View Mode Switcher (Rendered / Source / Split) */}
      {hasDocument && (
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
          <button
            onClick={() => onChangeViewMode('rendered')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'rendered'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Formatirani prikaz (Rendered View)"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Prikaz</span>
          </button>

          <button
            onClick={() => onChangeViewMode('source')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'source'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Izvorni tekst (Source View)"
          >
            <Code className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Izvor</span>
          </button>

          <button
            onClick={() => onChangeViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Podeljeni uporedni prikaz (Split View)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Podeljeno</span>
          </button>
        </div>
      )}

      {/* Right side: Search, Export, Fullscreen, Settings, Theme */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {hasDocument && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Pretraga u dokumentu (Ctrl+F)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden xl:inline">Pretraga</span>
            <kbd className="hidden lg:inline text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
              Ctrl+F
            </kbd>
          </button>
        )}

        {/* Export / Print Dropdown */}
        {hasDocument && (
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
              title="Izvoz, štampa i kopiranje"
            >
              <Download className="w-4 h-4" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-52 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => {
                    onCopyMarkdown();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kopiraj izvorni Markdown</span>
                </button>
                <button
                  onClick={() => {
                    onPrint();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Printer className="w-3.5 h-3.5 text-blue-500" />
                  <span>Štampa / Sačuvaj kao PDF</span>
                </button>
                <button
                  onClick={() => {
                    onDownloadMarkdown();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Preuzmi .md fajl</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Fullscreen Toggle */}
        <button
          onClick={onToggleFullscreen}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
          title={isFullscreen ? 'Izađi iz celog ekrana' : 'Prikaz preko celog ekrana (F11)'}
        >
          {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
        </button>

        {/* Settings button */}
        <button
          onClick={onOpenSettings}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
          title="Podešavanja izgleda i fontova"
        >
          <Sliders className="w-4 h-4" />
        </button>

        {/* Theme quick switch */}
        <button
          onClick={handleToggleTheme}
          className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
          title={`Tema: ${settings.theme} (klik za promenu)`}
        >
          {themeIcons[settings.theme]}
        </button>
      </div>
    </header>
  );
};
