import React, { useRef, useEffect } from 'react';
import { AlignedDiffLine, DiffResult } from '../utils/diff';
import { ViewerSettings } from '../types';

interface DiffAlignedViewProps {
  diff: DiffResult;
  docLeftName: string;
  docRightName: string;
  selectedDiffId: string | null;
  onSelectDiff?: (diffId: string) => void;
  settings: ViewerSettings;
}

export const DiffAlignedView: React.FC<DiffAlignedViewProps> = ({
  diff,
  docLeftName,
  docRightName,
  selectedDiffId,
  onSelectDiff,
  settings,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  // Scroll to selected diff row when changed
  useEffect(() => {
    if (selectedDiffId && selectedRowRef.current) {
      selectedRowRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedDiffId]);

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full w-full overflow-auto bg-white dark:bg-slate-950 font-mono text-xs select-auto"
    >
      <table className="w-full border-collapse table-fixed">
        <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-sans text-xs select-none">
          <tr>
            <th className="w-12 py-1.5 px-2 text-right text-slate-400 font-mono font-normal">Lin.</th>
            <th className="w-1/2 py-1.5 px-3 text-left font-semibold border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between">
                <span className="truncate">{docLeftName} (Original / Levi)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono">
                  - Uklonjeno
                </span>
              </div>
            </th>
            <th className="w-12 py-1.5 px-2 text-right text-slate-400 font-mono font-normal">Lin.</th>
            <th className="w-1/2 py-1.5 px-3 text-left font-semibold">
              <div className="flex items-center justify-between">
                <span className="truncate">{docRightName} (Izmenjeni / Desni)</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono">
                  + Dodato
                </span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {diff.alignedLines.map((line, idx) => {
            const isSelected = line.diffItemId && line.diffItemId === selectedDiffId;

            // Row styling based on change type
            let leftBg = 'bg-transparent text-slate-800 dark:text-slate-200';
            let rightBg = 'bg-transparent text-slate-800 dark:text-slate-200';
            let leftPrefix = ' ';
            let rightPrefix = ' ';

            if (line.type === 'modified') {
              leftBg =
                'bg-amber-100/60 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-l-2 border-amber-500';
              rightBg =
                'bg-amber-100/60 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200 border-l-2 border-amber-500';
              leftPrefix = '~';
              rightPrefix = '~';
            } else if (line.type === 'removed') {
              leftBg =
                'bg-rose-100/70 dark:bg-rose-950/50 text-rose-950 dark:text-rose-200 border-l-2 border-rose-500';
              rightBg = 'bg-slate-100/40 dark:bg-slate-900/40 text-slate-400 italic';
              leftPrefix = '-';
              rightPrefix = ' ';
            } else if (line.type === 'added') {
              leftBg = 'bg-slate-100/40 dark:bg-slate-900/40 text-slate-400 italic';
              rightBg =
                'bg-emerald-100/70 dark:bg-emerald-950/50 text-emerald-950 dark:text-emerald-200 border-l-2 border-emerald-500';
              leftPrefix = ' ';
              rightPrefix = '+';
            }

            return (
              <tr
                key={line.id || idx}
                ref={isSelected ? selectedRowRef : null}
                onClick={() => line.diffItemId && onSelectDiff?.(line.diffItemId)}
                className={`border-b border-slate-100/80 dark:border-slate-900/80 transition-colors leading-6 ${
                  line.type !== 'equal' ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'ring-2 ring-indigo-500 ring-inset bg-indigo-50/50 dark:bg-indigo-950/30'
                    : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                }`}
              >
                {/* Left Line Number */}
                <td className="w-12 py-0.5 px-2 text-right text-slate-400 select-none bg-slate-50/50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800">
                  {line.leftLineNumber ?? ''}
                </td>

                {/* Left Line Content */}
                <td className={`w-1/2 py-0.5 px-3 border-r border-slate-200 dark:border-slate-800 whitespace-pre-wrap break-all ${leftBg}`}>
                  {line.leftContent !== undefined ? (
                    <div className="flex">
                      <span className="w-4 select-none font-bold opacity-60 shrink-0">{leftPrefix}</span>
                      <span className="flex-1">{line.leftContent || ' '}</span>
                    </div>
                  ) : (
                    <span className="opacity-30 select-none">—</span>
                  )}
                </td>

                {/* Right Line Number */}
                <td className="w-12 py-0.5 px-2 text-right text-slate-400 select-none bg-slate-50/50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800">
                  {line.rightLineNumber ?? ''}
                </td>

                {/* Right Line Content */}
                <td className={`w-1/2 py-0.5 px-3 whitespace-pre-wrap break-all ${rightBg}`}>
                  {line.rightContent !== undefined ? (
                    <div className="flex">
                      <span className="w-4 select-none font-bold opacity-60 shrink-0">{rightPrefix}</span>
                      <span className="flex-1">{line.rightContent || ' '}</span>
                    </div>
                  ) : (
                    <span className="opacity-30 select-none">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
