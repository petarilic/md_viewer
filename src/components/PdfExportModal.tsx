import React, { useState, useEffect } from 'react';
import { X, FileType, Check, Loader2, Download, Sun, Moon, Sliders } from 'lucide-react';
import { generatePdfBlob, savePdfFile, PdfExportOptions } from '../utils/pdfExport';
import { ViewerSettings } from '../types';

interface PdfExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultFilename: string;
  markdown: string;
  documentTitle: string;
  settings: ViewerSettings;
  onSuccess: (savedName: string, method: 'picker' | 'download') => void;
  onError: (errorMsg: string) => void;
}

export const PdfExportModal: React.FC<PdfExportModalProps> = ({
  isOpen,
  onClose,
  defaultFilename,
  markdown,
  documentTitle,
  settings,
  onSuccess,
  onError,
}) => {
  const [filename, setFilename] = useState('');
  const [pageSize, setPageSize] = useState<'a4' | 'letter'>('a4');
  const [orientation, setOrientation] = useState<'p' | 'l'>('p');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [includeHeader, setIncludeHeader] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  // Initialize filename when modal opens
  useEffect(() => {
    if (isOpen) {
      let initialName = defaultFilename || 'Dokument';
      initialName = initialName.replace(/\.md$/i, '');
      if (!initialName.toLowerCase().endsWith('.pdf')) {
        initialName += '.pdf';
      }
      setFilename(initialName);
      setIsGenerating(false);
    }
  }, [isOpen, defaultFilename]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isGenerating) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isGenerating, onClose]);

  if (!isOpen) return null;

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (isGenerating) return;

    let targetName = filename.trim();
    if (!targetName) targetName = 'Dokument.pdf';
    if (!targetName.toLowerCase().endsWith('.pdf')) {
      targetName += '.pdf';
    }

    setIsGenerating(true);

    try {
      const options: PdfExportOptions = {
        filename: targetName,
        pageSize,
        orientation,
        theme,
        includeHeader,
        settings,
      };

      // 1. Generate PDF blob
      const pdfBlob = await generatePdfBlob(markdown, documentTitle, options);

      // 2. Trigger native Save As file picker or fallback download
      const result = await savePdfFile(pdfBlob, targetName);

      if (result.cancelled) {
        // User voluntarily closed the file dialog
        setIsGenerating(false);
        return;
      }

      if (result.success) {
        onSuccess(targetName, result.method);
        onClose();
      } else {
        onError('Nije uspelo čuvanje PDF fajla.');
      }
    } catch (err: any) {
      console.error('PDF generation error:', err);
      onError(err?.message || 'Greška prilikom kreiranja PDF dokumenta.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col scale-100 animate-in zoom-in-95 duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="pdf-modal-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 dark:bg-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <FileType className="w-5 h-5" />
            </div>
            <div>
              <h2 id="pdf-modal-title" className="text-base font-bold text-slate-900 dark:text-slate-100">
                Sačuvaj kao PDF (Save As)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Izvoz i čuvanje formatiranog dokumenta u PDF formatu
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-40 cursor-pointer"
            title="Zatvori (Esc)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          {/* File Name Field */}
          <div>
            <label htmlFor="pdf-filename" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Naziv fajla
            </label>
            <div className="relative">
              <input
                id="pdf-filename"
                type="text"
                value={filename}
                onChange={(e) => setFilename(e.target.value)}
                disabled={isGenerating}
                placeholder="Unesite naziv fajla..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition disabled:opacity-50"
                autoFocus
              />
              <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                .pdf
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Možete uneti željeno ime fajla pre čuvanja.
            </p>
          </div>

          {/* Active Settings Banner */}
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 space-y-1 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
              <Sliders className="w-3.5 h-3.5 text-blue-500" />
              <span>Primenjena podešavanja (font, tipografija i margine):</span>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 pt-0.5">
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                {settings.fontSize === 'sm'
                  ? 'Mala veličina'
                  : settings.fontSize === 'lg'
                  ? 'Velika veličina'
                  : settings.fontSize === 'xl'
                  ? 'Ekstra velika'
                  : 'Normalna veličina'}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                {settings.fontFamily === 'serif'
                  ? 'Serif (Knjiški)'
                  : settings.fontFamily === 'mono'
                  ? 'Monospace (Kôdni)'
                  : 'Sans-Serif (Moderni)'}
              </span>
              <span>•</span>
              <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-medium">
                {settings.contentWidth === 'narrow'
                  ? 'Široke margine'
                  : settings.contentWidth === 'wide'
                  ? 'Uže margine'
                  : settings.contentWidth === 'full'
                  ? 'Minimalne margine'
                  : 'Standardne margine'}
              </span>
            </div>
          </div>

          {/* Page Layout Settings */}
          <div className="grid grid-cols-2 gap-4">
            {/* Page Format */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Format stranice
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setPageSize('a4')}
                  disabled={isGenerating}
                  className={`py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                    pageSize === 'a4'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  A4
                </button>
                <button
                  type="button"
                  onClick={() => setPageSize('letter')}
                  disabled={isGenerating}
                  className={`py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                    pageSize === 'letter'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Letter
                </button>
              </div>
            </div>

            {/* Orientation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Orijentacija
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
                <button
                  type="button"
                  onClick={() => setOrientation('p')}
                  disabled={isGenerating}
                  className={`py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                    orientation === 'p'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Uspravno
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('l')}
                  disabled={isGenerating}
                  className={`py-1.5 text-xs font-medium rounded-lg transition cursor-pointer ${
                    orientation === 'l'
                      ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  Položeno
                </button>
              </div>
            </div>
          </div>

          {/* Visual Style Theme */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Stil dokumenta
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                disabled={isGenerating}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  theme === 'light'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <div>
                  <div className="text-xs">Svetla (Štampa)</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    Preporučeno za papir
                  </div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('dark')}
                disabled={isGenerating}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-left transition cursor-pointer ${
                  theme === 'dark'
                    ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-200 font-semibold'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                }`}
              >
                <Moon className="w-4 h-4 text-blue-400 shrink-0" />
                <div>
                  <div className="text-xs">Tamna tema</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-normal">
                    Tamna pozadina
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Header option checkbox */}
          <label className="flex items-center gap-2.5 text-xs text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={includeHeader}
              onChange={(e) => setIncludeHeader(e.target.checked)}
              disabled={isGenerating}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            <span>Dodaj zaglavlje sa nazivom dokumenta i datumom izvoza</span>
          </label>

          {/* Save dialog instruction notice */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-800 dark:text-blue-300 flex items-start gap-2.5">
            <Download className="w-4 h-4 shrink-0 mt-0.5 text-blue-600 dark:text-blue-400" />
            <p className="leading-relaxed">
              Klikom na dugme <span className="font-semibold">Sačuvaj PDF dokument</span> prikazaće se sistemski prozor za odabir foldera (Save As) ili će fajl odmah biti preuzet sa unetim nazivom.
            </p>
          </div>

          {/* Modal Footer Buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-800 transition disabled:opacity-50 cursor-pointer"
            >
              Otkaži
            </button>
            <button
              type="submit"
              disabled={isGenerating}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white text-xs font-bold shadow-md hover:shadow-lg transition cursor-pointer disabled:opacity-60"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Kreiranje PDF-a...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Sačuvaj PDF dokument</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
