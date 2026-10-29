import React, { useRef, useEffect } from 'react';
import { DiffResult } from '../utils/diff';
import { ViewerSettings, ViewMode } from '../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface DiffAlignedViewProps {
  diff: DiffResult;
  docLeftName: string;
  docRightName: string;
  selectedDiffId: string | null;
  onSelectDiff?: (diffId: string) => void;
  settings: ViewerSettings;
  viewMode?: ViewMode;
}

/**
 * Safely renders a single line of markdown into formatted HTML
 */
function renderFormattedDiffLine(content?: string): string {
  if (content === undefined || content === null) return '';
  const trimmed = content.trim();
  if (trimmed === '') return '&nbsp;';

  try {
    if (/^#{1,6}\s+/.test(trimmed)) {
      return DOMPurify.sanitize(marked.parse(trimmed) as string);
    }
    if (/^(\s*[-*+]|\s*\d+\.)\s+/.test(trimmed)) {
      return DOMPurify.sanitize(marked.parse(trimmed) as string);
    }
    if (/^>\s+/.test(trimmed)) {
      return DOMPurify.sanitize(marked.parse(trimmed) as string);
    }
    if (/^```/.test(trimmed)) {
      return `<code class="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-purple-600 dark:text-purple-400 font-mono text-xs">${trimmed}</code>`;
    }
    if (/^(---|___|\*\*\*)$/.test(trimmed)) {
      return '<hr class="my-1.5 border-slate-300 dark:border-slate-700" />';
    }
    return DOMPurify.sanitize(marked.parseInline(content) as string);
  } catch {
    return content;
  }
}

export const DiffAlignedView: React.FC<DiffAlignedViewProps> = ({
  diff,
  docLeftName,
  docRightName,
  selectedDiffId,
  onSelectDiff,
  settings,
  viewMode = 'rendered',
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectedRowRef = useRef<HTMLTableRowElement>(null);

  // Scroll to selected diff row when changed
  useEffect(() => {
    if (!selectedDiffId) return;
    const targetRow = containerRef.current?.querySelector(
      `[data-diff-id="${selectedDiffId}"]`
    ) as HTMLElement | null;
    if (targetRow) {
      targetRow.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [selectedDiffId]);

  const fontSizeClasses = {
    sm: 'text-xs sm:text-sm',
    base: 'text-sm sm:text-base',
    lg: 'text-base sm:text-lg',
    xl: 'text-lg sm:text-xl',
  };

  const fontFamilyClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  const isRenderedMode = viewMode === 'rendered';

  return (
    <div
      ref={containerRef}
      className={`flex-1 h-full w-full overflow-auto bg-white dark:bg-slate-950 ${
        isRenderedMode
          ? `${fontFamilyClasses[settings.fontFamily]} ${fontSizeClasses[settings.fontSize]}`
          : 'font-mono text-xs'
      } select-auto transition-colors`}
    >
      <table className="w-full border-collapse table-fixed">
        <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-sans text-xs select-none shadow-xs">
          <tr>
            <th className="w-12 py-2 px-2 text-right text-slate-400 font-mono font-normal">Lin.</th>
            <th className="w-1/2 py-2 px-3 text-left font-semibold border-r border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="truncate">{docLeftName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal shrink-0">
                    ({isRenderedMode ? 'Prikaz' : 'Uredi'} - Levi)
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-mono shrink-0">
                  - Uklonjeno
                </span>
              </div>
            </th>
            <th className="w-12 py-2 px-2 text-right text-slate-400 font-mono font-normal">Lin.</th>
            <th className="w-1/2 py-2 px-3 text-left font-semibold">
              <div className="flex items-center justify-between gap-1">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="truncate">{docRightName}</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-normal shrink-0">
                    ({isRenderedMode ? 'Prikaz' : 'Uredi'} - Desni)
                  </span>
                </div>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-mono shrink-0">
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
                data-diff-id={line.diffItemId || undefined}
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
                <td className="w-12 py-1 px-2 text-right text-slate-400 select-none bg-slate-50/50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 align-top font-mono text-xs">
                  {line.leftLineNumber ?? ''}
                </td>

                {/* Left Line Content (Formatted in Prikaz, Monospace in Uredi) */}
                <td
                  className={`w-1/2 py-1 px-3 border-r border-slate-200 dark:border-slate-800 whitespace-pre-wrap break-all align-top ${leftBg}`}
                >
                  {line.leftContent !== undefined ? (
                    isRenderedMode ? (
                      <div className="flex items-start gap-1.5">
                        <span className="w-4 select-none font-bold opacity-60 shrink-0 text-xs font-mono pt-0.5">
                          {leftPrefix}
                        </span>
                        <div
                          className="markdown-body flex-1 text-slate-800 dark:text-slate-200"
                          dangerouslySetInnerHTML={{
                            __html: renderFormattedDiffLine(line.leftContent),
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex">
                        <span className="w-4 select-none font-bold opacity-60 shrink-0 font-mono">
                          {leftPrefix}
                        </span>
                        <span className="flex-1 font-mono">{line.leftContent || ' '}</span>
                      </div>
                    )
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600 select-none italic text-[11px]">
                      — Nema linije (dodato u desnom) —
                    </span>
                  )}
                </td>

                {/* Right Line Number */}
                <td className="w-12 py-1 px-2 text-right text-slate-400 select-none bg-slate-50/50 dark:bg-slate-950/50 border-r border-slate-100 dark:border-slate-800 align-top font-mono text-xs">
                  {line.rightLineNumber ?? ''}
                </td>

                {/* Right Line Content (Formatted in Prikaz, Monospace in Uredi) */}
                <td
                  className={`w-1/2 py-1 px-3 whitespace-pre-wrap break-all align-top ${rightBg}`}
                >
                  {line.rightContent !== undefined ? (
                    isRenderedMode ? (
                      <div className="flex items-start gap-1.5">
                        <span className="w-4 select-none font-bold opacity-60 shrink-0 text-xs font-mono pt-0.5">
                          {rightPrefix}
                        </span>
                        <div
                          className="markdown-body flex-1 text-slate-800 dark:text-slate-200"
                          dangerouslySetInnerHTML={{
                            __html: renderFormattedDiffLine(line.rightContent),
                          }}
                        />
                      </div>
                    ) : (
                      <div className="flex">
                        <span className="w-4 select-none font-bold opacity-60 shrink-0 font-mono">
                          {rightPrefix}
                        </span>
                        <span className="flex-1 font-mono">{line.rightContent || ' '}</span>
                      </div>
                    )
                  ) : (
                    <span className="text-slate-400 dark:text-slate-600 select-none italic text-[11px]">
                      — Nema linije (uklonjeno iz levog) —
                    </span>
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
