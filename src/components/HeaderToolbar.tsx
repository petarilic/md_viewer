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
  X,
  Globe,
  MoreVertical,
  Replace,
  LayoutGrid,
  Terminal,
  History,
  Scale,
} from 'lucide-react';
import { ViewMode, Theme, ViewerSettings } from '../types';

interface HeaderToolbarProps {
  onNewFile: () => void;
  onOpenFile: () => void;
  onOpenUrl: () => void;
  onSelectTemplate?: (templateId: string) => void;
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
  onSelectTemplate,
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
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const exportMenuRef = useRef<HTMLDivElement>(null);
  const sampleMenuRef = useRef<HTMLDivElement>(null);
  const templateMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target as Node)) {
        setIsExportMenuOpen(false);
      }
      if (sampleMenuRef.current && !sampleMenuRef.current.contains(e.target as Node)) {
        setIsSampleMenuOpen(false);
      }
      if (templateMenuRef.current && !templateMenuRef.current.contains(e.target as Node)) {
        setIsTemplateMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Determine if the app is currently in dark mode
  const isCurrentlyDark =
    settings.theme === 'dark' ||
    (settings.theme === 'system' &&
      typeof window !== 'undefined' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  // Instant direct toggle between Light and Dark
  const handleToggleTheme = () => {
    const nextTheme: Theme = isCurrentlyDark ? 'light' : 'dark';
    onUpdateSettings({ theme: nextTheme });
  };

  return (
    <>
      <header className="toolbar relative z-40 h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 backdrop-blur-md px-2.5 sm:px-4 flex items-center justify-between select-none no-print">
        {/* Left side: Logo, TOC toggle, Desktop File Operations */}
        <div className="flex items-center gap-1.5 sm:gap-2">
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
              aria-label="Sadržaj dokumenta"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Brand logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-xs shrink-0 font-bold text-xs">
              <FileText className="w-4 h-4" />
            </div>
            <div className="hidden lg:block">
              <span className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm tracking-tight whitespace-nowrap">
                MD Viewer & Editor
              </span>
            </div>
          </div>

          {/* Desktop File Actions: New, Open, Save, Save As */}
          <div className="hidden md:flex items-center gap-1 ml-1">
            <button
              onClick={() => onNewFile()}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Kreiraj novi Markdown dokument (Ctrl+N)"
            >
              <FilePlus className="w-3.5 h-3.5 text-blue-500" />
              <span>Novi</span>
            </button>

            {/* Desktop Templates Dropdown */}
            <div className={`relative ${isTemplateMenuOpen ? 'z-50' : ''}`} ref={templateMenuRef}>
              <button
                onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
                title="Brzi izbor gotovih Markdown šablona (API, Changelog, Licenca, README)"
              >
                <LayoutGrid className="w-3.5 h-3.5 text-indigo-500" />
                <span>Šabloni</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isTemplateMenuOpen && (
                <div className="absolute left-0 top-full mt-1.5 w-72 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-[100] text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="px-3 py-1.5 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Popularni Markdown Šabloni
                  </div>
                  <button
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      onSelectTemplate?.('api-docs');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Terminal className="w-4 h-4 text-emerald-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">API Dokumentacija</div>
                      <div className="text-[10px] text-slate-400">Endpoint-i, parametri, JSON tela i statusi</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      onSelectTemplate?.('changelog');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <History className="w-4 h-4 text-blue-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">Dnevnik Izmena (Changelog)</div>
                      <div className="text-[10px] text-slate-400">Keep a Changelog & SemVer standard</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      onSelectTemplate?.('license');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <Scale className="w-4 h-4 text-purple-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">Softverska Licenca (MIT)</div>
                      <div className="text-[10px] text-slate-400">Pravna prava, uslovi i odricanje garancije</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      onSelectTemplate?.('readme');
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-200 cursor-pointer"
                  >
                    <BookOpen className="w-4 h-4 text-amber-500 shrink-0" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">README Projekta</div>
                      <div className="text-[10px] text-slate-400">Bedževi, opis, instalacija i tehnologije</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={() => {
                      setIsTemplateMenuOpen(false);
                      onNewFile();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-blue-50 dark:hover:bg-blue-950/50 flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Pregledaj sve šablone i prilagodi...</span>
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={onOpenFile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Otvori lokalni Markdown fajl (Ctrl+O)"
            >
              <FolderOpen className="w-3.5 h-3.5 text-amber-500" />
              <span>Otvori</span>
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
                  <span>Sačuvaj</span>
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

            {/* Desktop Sample docs dropdown */}
            <div className={`relative ${isSampleMenuOpen ? 'z-50' : ''}`} ref={sampleMenuRef}>
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
                <div className="absolute left-0 top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-[100] text-xs animate-in fade-in slide-in-from-top-1">
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

        {/* Center: View Mode Switcher (Compact on mobile, labeled on desktop) */}
        {hasDocument && (
          <div className="flex items-center p-0.5 sm:p-1 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs">
            <button
              onClick={() => onChangeViewMode('edit')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewMode === 'edit'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Uređivanje teksta (Edit)"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Uredi</span>
            </button>

            <button
              onClick={() => onChangeViewMode('rendered')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewMode === 'rendered'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Formatirani prikaz (Rendered)"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Prikaz</span>
            </button>

            <button
              onClick={() => onChangeViewMode('split')}
              className={`flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-lg transition cursor-pointer ${
                viewMode === 'split'
                  ? 'bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Podeljeni prikaz (Split)"
            >
              <Columns className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Podeljeno</span>
            </button>
          </div>
        )}

        {/* Right side: Desktop Actions + Mobile Quick Actions & Menu Toggle */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Quick Save button for mobile */}
          {hasDocument && (
            <button
              onClick={onSave}
              className={`md:hidden p-2 rounded-xl transition cursor-pointer relative ${
                isModified
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
              title="Sačuvaj dokument"
            >
              <Save className="w-4 h-4" />
              {isModified && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              )}
            </button>
          )}

          {/* Undo/Redo (Desktop only) */}
          {hasDocument && (viewMode === 'edit' || viewMode === 'split') && onUndo && onRedo && (
            <div className="hidden lg:flex items-center gap-0.5">
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

          {/* Search Button (Desktop) */}
          {hasDocument && (
            <button
              onClick={onOpenSearch}
              className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
              title="Pretraga u dokumentu (Ctrl+F)"
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">Pretraga</span>
            </button>
          )}

          {/* Export Dropdown (Desktop) */}
          {hasDocument && (
            <div className={`relative hidden md:block ${isExportMenuOpen ? 'z-50' : ''}`} ref={exportMenuRef}>
              <button
                onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition cursor-pointer"
                title="Izvoz dokumenata (DOCX, TXT, PDF, MD)"
              >
                <Download className="w-3.5 h-3.5 text-blue-500" />
                <span>Izvoz</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {isExportMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl py-1.5 z-[100] text-xs animate-in fade-in slide-in-from-top-1">
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
                      <div className="text-[10px] text-slate-400">Word dokument sa stilovima i tabelama</div>
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
                      <div className="text-[10px] text-slate-400">Čist tekst bez Markdown oznaka</div>
                    </div>
                  </button>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    onClick={() => {
                      onPrint();
                      setIsExportMenuOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer"
                  >
                    <FileType className="w-4 h-4 text-rose-500" />
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">Sačuvaj kao PDF (.pdf)</div>
                      <div className="text-[10px] text-slate-400">Save As prozor za naziv i lokaciju (Ctrl+P)</div>
                    </div>
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

          {/* Fullscreen Toggle (Desktop) */}
          <button
            onClick={onToggleFullscreen}
            className="hidden md:flex p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
            title={isFullscreen ? 'Izađi iz celog ekrana' : 'Prikaz preko celog ekrana (F11)'}
          >
            {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
          </button>

          {/* Settings button (Desktop) */}
          <button
            onClick={onOpenSettings}
            className="hidden md:flex p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 transition cursor-pointer"
            title="Podešavanja izgleda i fontova"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Quick Dark/Light Theme Toggle (Both Mobile & Desktop) */}
          <button
            onClick={handleToggleTheme}
            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title={isCurrentlyDark ? 'Prebaci na svetlu temu (Light)' : 'Prebaci na tamnu temu (Dark)'}
            aria-label="Promeni temu"
          >
            {isCurrentlyDark ? (
              <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-200" />
            ) : (
              <Moon className="w-4 h-4 text-blue-600 animate-in spin-in-180 duration-200" />
            )}
          </button>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Meni sa opcijama"
            aria-label="Meni"
          >
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] md:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer content */}
          <div className="relative w-4/5 max-w-sm h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-250 select-none overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-xs">
                  MD
                </div>
                <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  MD Viewer & Editor
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body Items */}
            <div className="p-4 space-y-6 text-xs">
              {/* Sekcija: Fajl */}
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Dokument
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onNewFile();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                >
                  <FilePlus className="w-4 h-4 text-blue-500" />
                  <span>Novi dokument (svi šabloni)</span>
                </button>

                {/* Brzi šabloni za mobilne uređaje */}
                <div className="pt-2 pb-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                    <LayoutGrid className="w-3 h-3 text-indigo-500" />
                    <span>Popularni šabloni</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSelectTemplate?.('api-docs');
                      }}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left border border-slate-200 dark:border-slate-800"
                    >
                      <div className="font-semibold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Terminal className="w-3 h-3 text-emerald-500" />
                        <span>API Docs</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 truncate">REST rute i JSON</div>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSelectTemplate?.('changelog');
                      }}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left border border-slate-200 dark:border-slate-800"
                    >
                      <div className="font-semibold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <History className="w-3 h-3 text-blue-500" />
                        <span>Changelog</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 truncate">Dnevnik izmena</div>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSelectTemplate?.('license');
                      }}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left border border-slate-200 dark:border-slate-800"
                    >
                      <div className="font-semibold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <Scale className="w-3 h-3 text-purple-500" />
                        <span>Licenca</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 truncate">MIT licenca</div>
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSelectTemplate?.('readme');
                      }}
                      className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-left border border-slate-200 dark:border-slate-800"
                    >
                      <div className="font-semibold text-[11px] text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-amber-500" />
                        <span>README</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5 truncate">Projektni vodič</div>
                    </button>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenFile();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                >
                  <FolderOpen className="w-4 h-4 text-amber-500" />
                  <span>Otvori sa uređaja</span>
                </button>

                {hasDocument && (
                  <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSave();
                      }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <Save className="w-4 h-4 text-emerald-500" />
                        <span>Sačuvaj dokument</span>
                      </div>
                      {isModified && (
                        <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 px-1.5 py-0.5 rounded-full font-semibold">
                          Nesačuvano
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onSaveAs();
                      }}
                      className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                    >
                      <Download className="w-4 h-4 text-blue-500" />
                      <span>Sačuvaj kao (Save As)...</span>
                    </button>
                  </>
                )}

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenUrl();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                >
                  <Globe className="w-4 h-4 text-blue-500" />
                  <span>Učitaj sa URL adrese</span>
                </button>
              </div>

              {/* Sekcija: Pretraga */}
              {hasDocument && (
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Pretraga i zamena
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenSearch();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                  >
                    <Search className="w-4 h-4 text-blue-500" />
                    <span>Pretraga teksta</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onOpenReplace();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                  >
                    <Replace className="w-4 h-4 text-purple-500" />
                    <span>Zamena teksta (Replace)</span>
                  </button>
                </div>
              )}

              {/* Sekcija: Izvoz */}
              {hasDocument && (
                <div className="space-y-1">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Izvoz i deljenje
                  </div>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onExportDocx();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                  >
                    <FileType className="w-4 h-4 text-blue-600" />
                    <span>Izvoz u Word (.docx)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onExportTxt();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                  >
                    <FileText className="w-4 h-4 text-emerald-600" />
                    <span>Izvoz u čist tekst (.txt)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onPrint();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left cursor-pointer"
                  >
                    <FileType className="w-4 h-4 text-rose-500" />
                    <span>Sačuvaj kao PDF (.pdf) (Ctrl+P)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onDownloadMarkdown();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                  >
                    <FileCode className="w-4 h-4 text-amber-500" />
                    <span>Preuzmi Markdown fajl (.md)</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onCopyMarkdown();
                    }}
                    className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                  >
                    <Copy className="w-4 h-4 text-slate-400" />
                    <span>Kopiraj izvorni tekst</span>
                  </button>
                </div>
              )}

              {/* Sekcija: Primeri */}
              <div className="space-y-1">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Pripremljeni primeri
                </div>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSample('spec');
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                >
                  <BookOpen className="w-4 h-4 text-blue-500" />
                  <span>Specifikacija aplikacije</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSample('showcase');
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>GFM & Markdown vodič</span>
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSample('quickstart');
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                >
                  <FileText className="w-4 h-4 text-emerald-500" />
                  <span>Korisnički vodič</span>
                </button>
              </div>

              {/* Sekcija: Teme i podešavanja */}
              <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  Tema interfejsa
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    onClick={() => onUpdateSettings({ theme: 'light' })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-[11px] font-medium transition ${
                      settings.theme === 'light'
                        ? 'border-blue-500 bg-blue-50 text-blue-600 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-500" />
                    <span>Svetla</span>
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ theme: 'dark' })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-[11px] font-medium transition ${
                      settings.theme === 'dark'
                        ? 'border-blue-500 bg-blue-950/60 text-blue-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-blue-400" />
                    <span>Tamna</span>
                  </button>

                  <button
                    onClick={() => onUpdateSettings({ theme: 'system' })}
                    className={`flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl border text-[11px] font-medium transition ${
                      settings.theme === 'system'
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    <Laptop className="w-3.5 h-3.5" />
                    <span>Sistem</span>
                  </button>
                </div>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenSettings();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left mt-2"
                >
                  <Sliders className="w-4 h-4 text-blue-500" />
                  <span>Podešavanja prikaza (fontovi, širina)</span>
                </button>

                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onToggleFullscreen();
                  }}
                  className="w-full flex items-center gap-2.5 p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium transition text-left"
                >
                  <Maximize className="w-4 h-4 text-slate-400" />
                  <span>Ceo ekran (Fullscreen)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
