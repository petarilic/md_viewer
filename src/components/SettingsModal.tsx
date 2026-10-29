import React from 'react';
import {
  X,
  Sliders,
  Sun,
  Moon,
  Laptop,
  Type,
  Maximize2,
  ListOrdered,
  RotateCcw,
  FileText,
} from 'lucide-react';
import {
  ViewerSettings,
  Theme,
  FontSize,
  FontFamily,
  ContentWidth,
  LineSpacing,
  PaperFormat,
} from '../types';
import { PAPER_FORMAT_OPTIONS, PAPER_FORMAT_MAP } from '../utils/pagination';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: ViewerSettings;
  onUpdateSettings: (newSettings: Partial<ViewerSettings>) => void;
  onResetSettings: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-semibold text-base">
            <Sliders className="w-5 h-5 text-blue-500" />
            <span>Podešavanja prikaza</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300">
          {/* Tema */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Tema interfejsa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'light', label: 'Svetla', icon: Sun },
                  { id: 'dark', label: 'Tamna', icon: Moon },
                  { id: 'system', label: 'Sistem', icon: Laptop },
                ] as const
              ).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onUpdateSettings({ theme: id as Theme })}
                  className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition cursor-pointer ${
                    settings.theme === id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Veličina fonta */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Veličina fonta teksta
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'sm', label: 'Mala' },
                  { id: 'base', label: 'Normalna' },
                  { id: 'lg', label: 'Velika' },
                  { id: 'xl', label: 'Ekstra' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => onUpdateSettings({ fontSize: id as FontSize })}
                  className={`py-2 px-2 rounded-xl border text-xs font-medium text-center transition cursor-pointer ${
                    settings.fontSize === id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Porodica fonta */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Tipografija (Porodica fonta)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'sans', label: 'Sans-Serif', example: 'Moderni' },
                  { id: 'serif', label: 'Serif', example: 'Knjiški' },
                  { id: 'mono', label: 'Monospace', example: 'Kôdni' },
                ] as const
              ).map(({ id, label, example }) => (
                <button
                  key={id}
                  onClick={() => onUpdateSettings({ fontFamily: id as FontFamily })}
                  className={`flex flex-col items-center justify-center py-2 px-3 rounded-xl border text-xs transition cursor-pointer ${
                    settings.fontFamily === id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <span className="font-medium">{label}</span>
                  <span className="text-[10px] text-slate-400">{example}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Širina kolone dokumenta */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Širina kolone dokumenta
            </label>
            <div className="grid grid-cols-4 gap-2">
              {(
                [
                  { id: 'narrow', label: 'Uska', sub: '680px' },
                  { id: 'standard', label: 'Standard', sub: '860px' },
                  { id: 'wide', label: 'Široka', sub: '1150px' },
                  { id: 'full', label: 'Puna', sub: '100%' },
                ] as const
              ).map(({ id, label, sub }) => (
                <button
                  key={id}
                  onClick={() => onUpdateSettings({ contentWidth: id as ContentWidth })}
                  className={`py-2 px-1 rounded-xl border text-xs text-center transition cursor-pointer ${
                    settings.contentWidth === id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="font-medium">{label}</div>
                  <div className="text-[10px] text-slate-400">{sub}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Razmak redova i pasusa */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Razmak redova i pasusa
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(
                [
                  { id: 'compact', label: 'Kompaktno' },
                  { id: 'normal', label: 'Standardno' },
                  { id: 'relaxed', label: 'Prostrano' },
                ] as const
              ).map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => onUpdateSettings({ lineSpacing: id as LineSpacing })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium text-center transition cursor-pointer ${
                    settings.lineSpacing === id
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold'
                      : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Format papira (Proračun strana i štampa) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                <FileText className="w-3.5 h-3.5 text-blue-500" />
                <span>Format papira (proračun strana i štampa)</span>
              </label>
              <span className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
                {PAPER_FORMAT_MAP[settings.paperFormat || 'a4']?.dimensionsLabel}
              </span>
            </div>
            <div className="grid grid-cols-5 gap-2">
              {PAPER_FORMAT_OPTIONS.map((opt) => {
                const isSelected = (settings.paperFormat || 'a4') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateSettings({ paperFormat: opt.id })}
                    title={`${opt.name} (${opt.dimensionsLabel}) — ${opt.description}`}
                    className={`flex flex-col items-center justify-between py-2 px-1 rounded-xl border text-center transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-xs ring-1 ring-blue-400/30'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs font-bold">{opt.name}</span>
                    </div>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 mt-1 truncate max-w-full font-mono">
                      {opt.widthMm}×{opt.heightMm}mm
                    </span>
                    {opt.badge && (
                      <span
                        className={`text-[8px] mt-0.5 px-1 py-0.2 rounded font-medium ${
                          isSelected
                            ? 'bg-blue-100 dark:bg-blue-900/80 text-blue-800 dark:text-blue-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1.5">
              Odabrani format papira proračunava ukupan broj strana dokumenta i ažurira trenutnu stranu tokom skrolovanja u statusnoj traci na dnu ekrana.
            </p>
          </div>

          {/* Dodatne opcije */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Brojevi linija u blokovima koda
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.showLineNumbersInCode}
                onChange={(e) => onUpdateSettings({ showLineNumbersInCode: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-2">
                <Maximize2 className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                  Sinhronizovano skrolovanje u Split View-u
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.syncScroll}
                onChange={(e) => onUpdateSettings({ syncScroll: e.target.checked })}
                className="w-4 h-4 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-blue-500"
              />
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onResetSettings}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Vrati na podrazumevano</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition"
          >
            Gotovo
          </button>
        </div>
      </div>
    </div>
  );
};
