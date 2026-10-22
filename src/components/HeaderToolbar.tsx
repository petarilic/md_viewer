import React, { useState, useRef, useEffect } from 'react';
import {
  FileText,
  FilePlus,
  FolderOpen,
  Save,
  Download,
  Eye,
  Edit3,
  Columns,
  Search,
  Sliders,
  Sun,
  Moon,
  Laptop,
  Maximize,
  Minimize,
  Printer,
  Copy,
  ChevronDown,
  Menu,
  Sparkles,
  BookOpen,
  FileCode,
  Undo2,
  Redo2,
  FileType,
} from 'lucide-react';
import { ViewMode, Theme, ViewerSettings } from '../types';

interface HeaderToolbarProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onOpenUrl: () => void;
  onOpenSample: (sampleKey: 'spec' | 'showcase' | 'quickstart') => void;
  onSave: () => void;
  onSaveAs: () => void;
  isModified: boolean;
  viewMode: ViewMode;
  onChangeViewMode: (mode: ViewMode) => void;
  isTocOpen: boolean;
  onToggleToc: () => void;
  onOpenSearch: () => void;
  onOpenReplace: () => void;
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  onOpenSettings: () => void;
  settings: ViewerSettings;
  onUpdateSettings: (newSettings: Partial<ViewerSettings>) => void;
  onCopyMarkdown: () => void;
  onExportDocx: () => void;
  onExportTxt: () => void;
  onPrint: () => void;
  onDownloadMarkdown: () => void;
  hasDocument: boolean;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
  documentTitle: string;
  onRenameDocument?: (newName: string) => void;
}

export const HeaderToolbar: React.FC<HeaderToolbarProps> = ({
  onNewFile,
  onOpenFile,
  onOpenUrl,
  onOpenSample,
  onSave,
  onSaveAs,
  isModified,
  viewMode,
  onChangeViewMode,
  isTocOpen,
  onToggleToc,
  onOpenSearch,
  onOpenReplace,
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  onOpenSettings,
  settings,
  onUpdateSettings,
  onCopyMarkdown,
  onExportDocx,
  onExportTxt,
  onPrint,
  onDownloadMarkdown,
  hasDocument,
  isFullscreen,
  onToggleFullscreen,
  documentTitle,
  onRenameDocument,
}) => {
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSampleMenuOpen, setIsSampleMenuOpen] = useState(false);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInput, setTitleInput] = useState(documentTitle);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const sampleMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTitleInput(documentTitle);
  }, [documentTitle]);

  // Close dropdowns on outside click
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

  const handleToggleTheme = () => {
    const nextTheme: Theme =
      settings.theme === 'light' ? 'dark' : settings.theme === 'dark' ? 'system' : 'light';
    onUpdateSettings({ theme: nextTheme });
  };

  const handleTitleSubmit = () => {
    setIsEditingTitle(false);
    if (onRenameDocument && titleInput.trim()) {
      onRenameDocument(titleInput.trim());
    } else {
      setTitleInput(documentTitle);
    }
  };

  const themeIcons = {
    light: <Sun className="w-4 h-4 text-amber-500" />,
    dark: <Moon className="w-4 h-4 text-blue-400" />,
    system: <Laptop className="w-4 h-4 text-slate-400" />,
  };

  return (
    <header className="toolbar h-14 border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between z-30 select-none no-print">
      {/* Left side: Logo, TOC toggle, Title & File Operations */}
      <div className="flex items-center gap-1.5 sm:gap-2 overflow-hidden">
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
        <div className="flex items-center gap-2 mr-1">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="hidden lg:block">
            <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm tracking-tight whitespace-nowrap">
              MD Viewer & Editor
            </span>
          </div>
        </div>

        {/* File Actions: New, Open, Save, Save As */}
        <div className="flex items-center gap-1">
          <button
            onClick={onNewFile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Kreiraj novi Markdown dokument (Ctrl+N)"
          >
            <FilePlus className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden sm:inline">Novi</span>
          </button>

          <button
            onClick={onOpenFile}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Otvori lokalni Markdown fajl (Ctrl+O)"
          >
            <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Otvori</span>
          </button>

          {hasDocument && (
            <>
              <button
                onClick={onSave}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  isModified
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs font-semibold'
                    : 'border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
                title={`Sačuvaj izmene (Ctrl+S)${isModified ? ' - Nesačuvane izmene!' : ' - Sačuvano'}`}
              >
                <Save className={`w-3.5 h-3.5 ${isModified ? 'text-white' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">Sačuvaj</span>
                {isModified && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                )}
              </button>

              <button
                onClick={onSaveAs}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-medium transition cursor-pointer"
                title="Sačuvaj kao novi fajl (Save As)"
              >
                <span>Save As...</span>
              </button>
            </>
          )}

          {/* Sample docs dropdown */}
          <div className="relative hidden md:block" ref={sampleMenuRef}>
            <button
              onClick={() => setIsSampleMenuOpen(!isSampleMenuOpen)}
              className="flex items-center gap-1 px-2 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Učitaj pripremljene primere"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden lg:inline">Primeri</span>
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
                    <div className="text-[10px] text-slate-400">Specifikacija ovog MD Viewer & Editor-a</div>
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

      {/* Center: View Mode Switcher (Edit / Rendered / Split) */}
      {hasDocument && (
        <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs mx-1">
          <button
            onClick={() => onChangeViewMode('edit')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'edit'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Uređivanje Markdown teksta (Edit View)"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Uredi</span>
          </button>

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
            <span className="hidden md:inline">Prikaz</span>
          </button>

          <button
            onClick={() => onChangeViewMode('split')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition cursor-pointer ${
              viewMode === 'split'
                ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
            title="Podeljeni živi prikaz (Split View / Live Preview)"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Podeljeno</span>
          </button>
        </div>
      )}

      {/* Right side: Undo/Redo, Search, Export, Fullscreen, Settings, Theme */}
      <div className="flex items-center gap-1 sm:gap-1.5">
        {/* Undo/Redo (shown when in edit or split mode) */}
        {hasDocument && (viewMode === 'edit' || viewMode === 'split') && onUndo && onRedo && (
          <div className="hidden sm:flex items-center gap-0.5">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition"
              title="Poništi (Undo - Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 disabled:opacity-30 disabled:pointer-events-none transition"
              title="Ponovi (Redo - Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* Search & Replace button */}
        {hasDocument && (
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
            title="Pretraga i zamena (Ctrl+F / Ctrl+H)"
          >
            <Search className="w-3.5 h-3.5" />
            <span className="hidden 2xl:inline">Pretraga</span>
            <kbd className="hidden lg:inline text-[10px] px-1 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 font-mono">
              Ctrl+F
            </kbd>
          </button>
        )}

        {/* Export Dropdown (DOCX, TXT, MD, PDF) */}
        {hasDocument && (
          <div className="relative" ref={exportMenuRef}>
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Izvoz dokumenata (DOCX, TXT, PDF, MD)"
            >
              <Download className="w-3.5 h-3.5 text-blue-500" />
              <span className="hidden md:inline">Izvoz</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1.5 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                <button
                  onClick={() => {
                    onExportDocx();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <FileType className="w-4 h-4 text-blue-600" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Izvoz u DOCX (.docx)</div>
                    <div className="text-[10px] text-slate-400">Microsoft Word sa stilovima i tabelama</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    onExportTxt();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300"
                >
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Izvoz u TXT (.txt)</div>
                    <div className="text-[10px] text-slate-400">Čist tekst bez Markdown simbola</div>
                  </div>
                </button>

                <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                <button
                  onClick={() => {
                    onPrint();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Printer className="w-3.5 h-3.5 text-purple-500" />
                  <span>Štampa / Sačuvaj kao PDF (Ctrl+P)</span>
                </button>

                <button
                  onClick={() => {
                    onDownloadMarkdown();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <FileCode className="w-3.5 h-3.5 text-amber-500" />
                  <span>Preuzmi Markdown fajl (.md)</span>
                </button>

                <button
                  onClick={() => {
                    onCopyMarkdown();
                    setIsExportMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2 text-slate-700 dark:text-slate-300"
                >
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Kopiraj izvorni tekst</span>
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
