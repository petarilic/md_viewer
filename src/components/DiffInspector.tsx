import React, { useState } from 'react';
import {
  GitCompare,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  MinusCircle,
  Edit,
  CheckCircle2,
  ListFilter,
  X,
} from 'lucide-react';
import { DiffResult, DiffItem } from '../utils/diff';

interface DiffInspectorProps {
  diff: DiffResult;
  docLeftName: string;
  docRightName: string;
  selectedDiffId: string | null;
  onSelectDiff: (diffId: string, item: DiffItem) => void;
  onClose?: () => void;
}

export const DiffInspector: React.FC<DiffInspectorProps> = ({
  diff,
  docLeftName,
  docRightName,
  selectedDiffId,
  onSelectDiff,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [filterType, setFilterType] = useState<'all' | 'modified' | 'added' | 'removed'>('all');

  const filteredItems = diff.items.filter((item) => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const currentIndex = selectedDiffId
    ? diff.items.findIndex((item) => item.id === selectedDiffId)
    : -1;

  const handlePrev = () => {
    if (diff.items.length === 0) return;
    const nextIdx = currentIndex <= 0 ? diff.items.length - 1 : currentIndex - 1;
    const item = diff.items[nextIdx];
    onSelectDiff(item.id, item);
  };

  const handleNext = () => {
    if (diff.items.length === 0) return;
    const nextIdx = (currentIndex + 1) % diff.items.length;
    const item = diff.items[nextIdx];
    onSelectDiff(item.id, item);
  };

  return (
    <div className="border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xl transition-all duration-200 flex flex-col z-30 select-none">
      {/* Top Header Bar */}
      <div className="px-3 py-2 flex items-center justify-between gap-3 text-xs border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-100">
            <GitCompare className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Diff Analiza Dokumenata</span>
          </div>

          <div className="hidden sm:inline-block w-px h-3.5 bg-slate-300 dark:bg-slate-700" />

          {/* Badges */}
          {diff.stats.identical ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              <CheckCircle2 className="w-3 h-3" />
              Dokumenti su identični (bez razlika)
            </span>
          ) : (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                Ukupno razlika: <strong>{diff.stats.total}</strong>
              </span>

              {diff.stats.modified > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                  <Edit className="w-3 h-3" />
                  {diff.stats.modified} izmenjeno
                </span>
              )}

              {diff.stats.added > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                  <PlusCircle className="w-3 h-3" />
                  +{diff.stats.added} dodato
                </span>
              )}

              {diff.stats.removed > 0 && (
                <span className="px-1.5 py-0.5 rounded-md text-[11px] font-medium bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 flex items-center gap-1">
                  <MinusCircle className="w-3 h-3" />
                  -{diff.stats.removed} uklonjeno
                </span>
              )}
            </div>
          )}
        </div>

        {/* Right Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          {!diff.stats.identical && (
            <>
              <button
                type="button"
                onClick={handlePrev}
                className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Prethodna razlika"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 px-1">
                {currentIndex >= 0 ? `${currentIndex + 1} / ${diff.items.length}` : `0 / ${diff.items.length}`}
              </span>

              <button
                type="button"
                onClick={handleNext}
                className="p-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Sledeća razlika"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-3.5 bg-slate-300 dark:bg-slate-700 mx-1" />
            </>
          )}

          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium transition cursor-pointer"
            title={isExpanded ? 'Skupi listu razlika' : 'Prikaži listu razlika'}
          >
            <span>{isExpanded ? 'Sakrij listu' : 'Prikaži detalje'}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
              title="Zatvori Diff prikaz"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Differences List */}
      {isExpanded && !diff.stats.identical && (
        <div className="max-h-56 overflow-y-auto p-2.5 bg-slate-50/70 dark:bg-slate-950/70 divide-y divide-slate-200/60 dark:divide-slate-800/60">
          {/* Quick Filters */}
          <div className="flex items-center gap-1.5 pb-2 text-[11px]">
            <ListFilter className="w-3.5 h-3.5 text-slate-400 mr-1" />
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterType === 'all'
                  ? 'bg-indigo-600 text-white font-medium shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Sve ({diff.items.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('modified')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterType === 'modified'
                  ? 'bg-amber-600 text-white font-medium shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Izmenjeno ({diff.stats.modified})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('added')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterType === 'added'
                  ? 'bg-emerald-600 text-white font-medium shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Dodato ({diff.stats.added})
            </button>
            <button
              type="button"
              onClick={() => setFilterType('removed')}
              className={`px-2 py-0.5 rounded transition cursor-pointer ${
                filterType === 'removed'
                  ? 'bg-rose-600 text-white font-medium shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
              }`}
            >
              Uklonjeno ({diff.stats.removed})
            </button>
          </div>

          {/* List items */}
          <div className="space-y-1.5 pt-2">
            {filteredItems.map((item, index) => {
              const isSelected = item.id === selectedDiffId;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectDiff(item.id, item)}
                  className={`p-2 rounded-lg border text-xs cursor-pointer transition-all duration-150 ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/80 dark:bg-indigo-950/40 shadow-xs ring-1 ring-indigo-400'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 font-medium">
                      {item.type === 'modified' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                          <Edit className="w-2.5 h-2.5" />
                          Izmenjeno
                        </span>
                      )}
                      {item.type === 'added' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          <PlusCircle className="w-2.5 h-2.5" />
                          Dodato u desni
                        </span>
                      )}
                      {item.type === 'removed' && (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                          <MinusCircle className="w-2.5 h-2.5" />
                          Uklonjeno iz levog
                        </span>
                      )}

                      <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                        Razlika #{index + 1}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      {item.leftLineNumber !== undefined && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Levi: Linija <strong>{item.leftLineNumber}</strong>
                        </span>
                      )}
                      {item.rightLineNumber !== undefined && (
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          Desni: Linija <strong>{item.rightLineNumber}</strong>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Left vs Right value presentation */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 font-mono text-[11px] mt-1">
                    {/* Left Document value */}
                    <div
                      className={`p-1.5 rounded border ${
                        item.type === 'added'
                          ? 'bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 italic'
                          : 'bg-rose-50/80 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-sans font-bold text-slate-400 mb-0.5 flex items-center justify-between">
                        <span>{docLeftName}</span>
                        {item.leftLineNumber !== undefined && <span>L: {item.leftLineNumber}</span>}
                      </div>
                      <div className="whitespace-pre-wrap break-all line-clamp-3">
                        {item.leftContent !== undefined ? (
                          <>
                            <span className="text-rose-600 dark:text-rose-400 font-bold mr-1">-</span>
                            {item.leftContent || <span className="italic text-slate-400">&lt;prazan red&gt;</span>}
                          </>
                        ) : (
                          <span className="italic text-slate-400">(Nema linije u levom dokumentu)</span>
                        )}
                      </div>
                    </div>

                    {/* Right Document value */}
                    <div
                      className={`p-1.5 rounded border ${
                        item.type === 'removed'
                          ? 'bg-slate-100/50 dark:bg-slate-800/30 border-dashed border-slate-200 dark:border-slate-800 text-slate-400 italic'
                          : 'bg-emerald-50/80 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900 text-emerald-900 dark:text-emerald-200'
                      }`}
                    >
                      <div className="text-[10px] uppercase font-sans font-bold text-slate-400 mb-0.5 flex items-center justify-between">
                        <span>{docRightName}</span>
                        {item.rightLineNumber !== undefined && <span>D: {item.rightLineNumber}</span>}
                      </div>
                      <div className="whitespace-pre-wrap break-all line-clamp-3">
                        {item.rightContent !== undefined ? (
                          <>
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold mr-1">+</span>
                            {item.rightContent || <span className="italic text-slate-400">&lt;prazan red&gt;</span>}
                          </>
                        ) : (
                          <span className="italic text-slate-400">(Nema linije u desnom dokumentu)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
