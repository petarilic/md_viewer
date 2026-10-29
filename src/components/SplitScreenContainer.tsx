import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  ArrowLeftRight,
  Link2,
  Unlink,
  GitCompare,
  Columns,
  Layers,
  TableProperties,
} from 'lucide-react';
import { DocumentItem, ViewerSettings, ViewMode, SearchState } from '../types';
import { EditorView, EditorViewRef } from './EditorView';
import { RenderedView } from './RenderedView';
import { SplitView } from './SplitView';
import { compareDocuments, DiffItem, DiffResult } from '../utils/diff';
import { DiffInspector } from './DiffInspector';
import { DiffAlignedView } from './DiffAlignedView';

interface SplitScreenContainerProps {
  docLeft: DocumentItem;
  docRight: DocumentItem;
  onChangeContentLeft: (content: string) => void;
  onChangeContentRight: (content: string) => void;
  viewMode: ViewMode;
  settings: ViewerSettings;
  onUpdateSettings: (newSettings: Partial<ViewerSettings>) => void;
  onSwapDocs: () => void;
  isDiffActive: boolean;
  onToggleDiff: () => void;
  searchState: SearchState;
  onUpdateTotalMatches?: (total: number) => void;
  onImageClick: (src: string, alt: string) => void;
  onCopySuccess: () => void;
  onScroll?: () => void;
}

export const SplitScreenContainer: React.FC<SplitScreenContainerProps> = ({
  docLeft,
  docRight,
  onChangeContentLeft,
  onChangeContentRight,
  viewMode,
  settings,
  onUpdateSettings,
  onSwapDocs,
  isDiffActive,
  onToggleDiff,
  searchState,
  onUpdateTotalMatches,
  onImageClick,
  onCopySuccess,
  onScroll,
}) => {
  const [selectedDiffId, setSelectedDiffId] = useState<string | null>(null);
  const [syncScroll, setSyncScroll] = useState(true);
  const [diffViewStyle, setDiffViewStyle] = useState<'standard' | 'aligned'>('standard');

  // References for horizontal scrolling (viewMode === 'edit' or 'rendered')
  const leftEditorRef = useRef<EditorViewRef>(null);
  const rightEditorRef = useRef<EditorViewRef>(null);
  const leftRenderedScrollRef = useRef<HTMLDivElement>(null);
  const rightRenderedScrollRef = useRef<HTMLDivElement>(null);

  // References for stacked split scrolling (viewMode === 'split')
  const topEditorRef = useRef<EditorViewRef>(null);
  const topPreviewScrollRef = useRef<HTMLDivElement>(null);
  const bottomEditorRef = useRef<EditorViewRef>(null);
  const bottomPreviewScrollRef = useRef<HTMLDivElement>(null);

  // Active scroll driver: 'left' | 'right' | 'top' | 'bottom'
  const activeDriverRef = useRef<'left' | 'right' | 'top' | 'bottom' | null>(null);
  const isSyncingScrollRef = useRef(false);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to compute scroll ratio (0 to 1)
  const getScrollRatio = (el: HTMLElement | null | undefined): number => {
    if (!el) return 0;
    const max = el.scrollHeight - el.clientHeight;
    if (max <= 0) return 0;
    return Math.max(0, Math.min(1, el.scrollTop / max));
  };

  // Helper to apply scroll ratio (0 to 1)
  const setScrollRatio = (el: HTMLElement | null | undefined, ratio: number) => {
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    if (max > 0) {
      el.scrollTop = Math.round(ratio * max);
    }
  };

  // Compute Diff between Left and Right document
  const diffResult: DiffResult = useMemo(() => {
    return compareDocuments(docLeft.content, docRight.content);
  }, [docLeft.content, docRight.content]);

  // Handle Diff selection and auto-scroll to line
  // Handle Diff selection and auto-scroll to line / element
  const handleSelectDiff = useCallback(
    (diffId: string, item: DiffItem) => {
      setSelectedDiffId(diffId);

      const scrollToLine = (targetLine?: number, editor?: EditorViewRef | null, container?: HTMLDivElement | null) => {
        if (!targetLine) return;
        const LINE_HEIGHT = 24;
        const targetScroll = Math.max(0, (targetLine - 3) * LINE_HEIGHT);

        if (editor?.setScrollTop) {
          editor.setScrollTop(targetScroll);
        }
        if (container) {
          const diffEl = container.querySelector(`[data-diff-id="${diffId}"]`) as HTMLElement | null;
          if (diffEl) {
            diffEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
          } else {
            try {
              container.scrollTo({ top: targetScroll, behavior: 'smooth' });
            } catch {
              container.scrollTop = targetScroll;
            }
          }
        }
      };

      if (viewMode === 'split') {
        if (item.leftLineNumber) {
          scrollToLine(item.leftLineNumber, topEditorRef.current, topPreviewScrollRef.current);
        }
        if (item.rightLineNumber) {
          scrollToLine(item.rightLineNumber, bottomEditorRef.current, bottomPreviewScrollRef.current);
        }
      } else {
        if (item.leftLineNumber) {
          scrollToLine(item.leftLineNumber, leftEditorRef.current, leftRenderedScrollRef.current);
        }
        if (item.rightLineNumber) {
          scrollToLine(item.rightLineNumber, rightEditorRef.current, rightRenderedScrollRef.current);
        }
      }
    },
    [viewMode]
  );

  const handleDiffClick = useCallback(
    (diffId: string) => {
      setSelectedDiffId(diffId);
      const found = diffResult.items.find((it) => it.id === diffId);
      if (found) {
        handleSelectDiff(diffId, found);
      }
    },
    [diffResult.items, handleSelectDiff]
  );

  // Scroll handler for Top document in stacked 'split' mode
  const handleTopSplitScrollRatio = useCallback(
    (ratio: number) => {
      onScroll?.();
      if (!syncScroll) return;
      if (isSyncingScrollRef.current && activeDriverRef.current === 'bottom') return;

      activeDriverRef.current = 'top';
      isSyncingScrollRef.current = true;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      const bEditor = bottomEditorRef.current?.getTextarea();
      const bPreview = bottomPreviewScrollRef.current;
      if (bEditor) setScrollRatio(bEditor, ratio);
      if (bPreview) setScrollRatio(bPreview, ratio);

      syncTimeoutRef.current = setTimeout(() => {
        isSyncingScrollRef.current = false;
      }, 70);
    },
    [syncScroll, onScroll]
  );

  // Scroll handler for Bottom document in stacked 'split' mode
  const handleBottomSplitScrollRatio = useCallback(
    (ratio: number) => {
      onScroll?.();
      if (!syncScroll) return;
      if (isSyncingScrollRef.current && activeDriverRef.current === 'top') return;

      activeDriverRef.current = 'bottom';
      isSyncingScrollRef.current = true;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      const tEditor = topEditorRef.current?.getTextarea();
      const tPreview = topPreviewScrollRef.current;
      if (tEditor) setScrollRatio(tEditor, ratio);
      if (tPreview) setScrollRatio(tPreview, ratio);

      syncTimeoutRef.current = setTimeout(() => {
        isSyncingScrollRef.current = false;
      }, 70);
    },
    [syncScroll, onScroll]
  );

  // Proportional scroll synchronization between Left and Right panes in horizontal mode
  const handleHorizontalScroll = useCallback(
    (side: 'left' | 'right') => {
      onScroll?.();
      if (!syncScroll) return;
      const opposite = side === 'left' ? 'right' : 'left';
      if (isSyncingScrollRef.current && activeDriverRef.current === opposite) return;

      activeDriverRef.current = side;
      isSyncingScrollRef.current = true;
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

      if (viewMode === 'edit') {
        const sourceEl = (side === 'left' ? leftEditorRef : rightEditorRef).current?.getTextarea();
        const targetEl = (side === 'left' ? rightEditorRef : leftEditorRef).current?.getTextarea();
        if (sourceEl && targetEl) {
          const ratio = getScrollRatio(sourceEl);
          setScrollRatio(targetEl, ratio);
        }
      } else if (viewMode === 'rendered') {
        const sourceEl = (side === 'left' ? leftRenderedScrollRef : rightRenderedScrollRef).current;
        const targetEl = (side === 'left' ? rightRenderedScrollRef : leftRenderedScrollRef).current;
        if (sourceEl && targetEl) {
          const ratio = getScrollRatio(sourceEl);
          setScrollRatio(targetEl, ratio);
        }
      }

      syncTimeoutRef.current = setTimeout(() => {
        isSyncingScrollRef.current = false;
      }, 70);
    },
    [syncScroll, viewMode, onScroll]
  );

  // Toggle sync scroll and immediately align views
  const handleToggleSyncScroll = () => {
    const next = !syncScroll;
    setSyncScroll(next);
    if (next) {
      if (viewMode === 'split') {
        const tEditor = topEditorRef.current?.getTextarea();
        const tPreview = topPreviewScrollRef.current;
        const ratio = getScrollRatio(tEditor) || getScrollRatio(tPreview);
        const bEditor = bottomEditorRef.current?.getTextarea();
        const bPreview = bottomPreviewScrollRef.current;
        if (bEditor) setScrollRatio(bEditor, ratio);
        if (bPreview) setScrollRatio(bPreview, ratio);
      } else if (viewMode === 'edit') {
        const leftEl = leftEditorRef.current?.getTextarea();
        const rightEl = rightEditorRef.current?.getTextarea();
        if (leftEl && rightEl) {
          setScrollRatio(rightEl, getScrollRatio(leftEl));
        }
      } else if (viewMode === 'rendered') {
        const leftEl = leftRenderedScrollRef.current;
        const rightEl = rightRenderedScrollRef.current;
        if (leftEl && rightEl) {
          setScrollRatio(rightEl, getScrollRatio(leftEl));
        }
      }
    }
  };

  // Align scroll positions when mode changes if syncScroll is active
  useEffect(() => {
    if (!syncScroll) return;
    const timer = setTimeout(() => {
      if (viewMode === 'split') {
        const tEditor = topEditorRef.current?.getTextarea();
        const tPreview = topPreviewScrollRef.current;
        const ratio = getScrollRatio(tEditor) || getScrollRatio(tPreview);
        const bEditor = bottomEditorRef.current?.getTextarea();
        const bPreview = bottomPreviewScrollRef.current;
        if (bEditor) setScrollRatio(bEditor, ratio);
        if (bPreview) setScrollRatio(bPreview, ratio);
      } else if (viewMode === 'edit') {
        const leftEl = leftEditorRef.current?.getTextarea();
        const rightEl = rightEditorRef.current?.getTextarea();
        if (leftEl && rightEl) {
          setScrollRatio(rightEl, getScrollRatio(leftEl));
        }
      } else if (viewMode === 'rendered') {
        const leftEl = leftRenderedScrollRef.current;
        const rightEl = rightRenderedScrollRef.current;
        if (leftEl && rightEl) {
          setScrollRatio(rightEl, getScrollRatio(leftEl));
        }
      }
    }, 120);
    return () => clearTimeout(timer);
  }, [viewMode, syncScroll]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  // Layout decision based on viewMode:
  // "opcije 'Uredi' i 'Prikaz' prikazuju dokumenta jedan pored drugog, dok opcija 'Podeljeno' prikazuje dokumente jedan ispod drugog."
  const isHorizontalSplit = viewMode === 'edit' || viewMode === 'rendered';

  return (
    <div className="flex-1 flex flex-col h-full w-full overflow-hidden relative bg-slate-100 dark:bg-slate-950">
      {/* Split Screen Top Banner */}
      <div className="h-8 px-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/90 flex items-center justify-between text-xs select-none shrink-0">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 font-semibold text-blue-600 dark:text-blue-400">
            {isHorizontalSplit ? (
              <Columns className="w-3.5 h-3.5" />
            ) : (
              <Layers className="w-3.5 h-3.5" />
            )}
            <span>Split Screen Mode</span>
          </span>

          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono hidden sm:inline">
            {isHorizontalSplit ? '(Jedan pored drugog)' : '(Jedan ispod drugog)'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* If Diff is active, allow switching between Standard Document Views and Side-by-Side Aligned Table */}
          {isDiffActive && (
            <div className="flex items-center gap-0.5 bg-slate-200/70 dark:bg-slate-800 p-0.5 rounded text-[10px]">
              <button
                type="button"
                onClick={() => setDiffViewStyle('standard')}
                className={`px-1.5 py-0.5 rounded transition cursor-pointer ${
                  diffViewStyle === 'standard'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Standardni prikaz toka dokumenata sa kolor-kodiranim razlikama"
              >
                Standardni tok
              </button>
              <button
                type="button"
                onClick={() => setDiffViewStyle('aligned')}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded transition cursor-pointer ${
                  diffViewStyle === 'aligned'
                    ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Poravnata tabela razlika linija po linija"
              >
                <TableProperties className="w-3 h-3" />
                <span>Poravnate linije</span>
              </button>
            </div>
          )}

          {/* Swap Documents button */}
          <button
            type="button"
            onClick={onSwapDocs}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border border-slate-200 dark:border-slate-800 hover:bg-slate-200/60 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition cursor-pointer"
            title="Zameni mesta dokumentima (Levo <-> Desno)"
          >
            <ArrowLeftRight className="w-3 h-3 text-indigo-500" />
            <span className="hidden md:inline">Zameni</span>
          </button>

          {/* Sync scroll toggle */}
          <button
            type="button"
            onClick={handleToggleSyncScroll}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              syncScroll
                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                : 'border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title={
              syncScroll
                ? 'Sinhronizovano skrolovanje je UKLJUČENO (kliknite za isključivanje)'
                : 'Sinhronizovano skrolovanje je ISKLJUČENO (kliknite za uključivanje)'
            }
          >
            {syncScroll ? <Link2 className="w-3 h-3" /> : <Unlink className="w-3 h-3" />}
            <span className="hidden sm:inline">{syncScroll ? 'Sinhronizovano' : 'Nezavisno'}</span>
          </button>

          {/* Diff toggle button */}
          <button
            type="button"
            onClick={onToggleDiff}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold transition cursor-pointer ${
              isDiffActive
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                : 'border border-indigo-200 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50'
            }`}
            title="Uključi/isključi poređenje i analizu razlika (Diff)"
          >
            <GitCompare className="w-3 h-3" />
            <span>Diff {isDiffActive ? 'Aktivan' : ''}</span>
            {isDiffActive && diffResult.stats.total > 0 && (
              <span className="ml-0.5 px-1 rounded-full text-[10px] bg-white/25 text-white font-mono">
                {diffResult.stats.total}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Main Content Area based on horizontal or vertical split, or aligned diff */}
      <div className="flex-1 flex overflow-hidden relative">
        {isDiffActive && diffViewStyle === 'aligned' ? (
          /* =================================================================== */
          /* SIDE-BY-SIDE ALIGNED DIFF VIEW                                      */
          /* =================================================================== */
          <DiffAlignedView
            diff={diffResult}
            docLeftName={docLeft.name}
            docRightName={docRight.name}
            selectedDiffId={selectedDiffId}
            onSelectDiff={(id) => {
              setSelectedDiffId(id);
              const found = diffResult.items.find((it) => it.id === id);
              if (found) handleSelectDiff(id, found);
            }}
            settings={settings}
            viewMode={viewMode}
          />
        ) : isHorizontalSplit ? (
          /* =================================================================== */
          /* SIDE-BY-SIDE (HORIZONTAL) LAYOUT for "Uredi" and "Prikaz"           */
          /* =================================================================== */
          <div className="flex flex-row h-full w-full overflow-hidden">
            {/* LEFT PANE (Document 1) */}
            <div
              onMouseEnter={() => {
                activeDriverRef.current = 'left';
                isSyncingScrollRef.current = false;
              }}
              onTouchStart={() => {
                activeDriverRef.current = 'left';
                isSyncingScrollRef.current = false;
              }}
              onWheel={() => {
                activeDriverRef.current = 'left';
                isSyncingScrollRef.current = false;
              }}
              className="flex-1 h-full min-w-0 border-r border-slate-200 dark:border-slate-800 flex flex-col relative bg-white dark:bg-slate-900/40"
            >
              {/* Left Pane Header */}
              <div className="h-7 px-3 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs select-none shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {docLeft.name}
                  </span>
                  {docLeft.isModified && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Nesačuvano" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono shrink-0">
                  {isDiffActive && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300">
                      - Levi
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-[10px]">
                    Leva strana
                  </span>
                </div>
              </div>

              {/* Left Content View */}
              <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                {viewMode === 'edit' ? (
                  <EditorView
                    ref={leftEditorRef}
                    content={docLeft.content}
                    onChange={onChangeContentLeft}
                    settings={settings}
                    onCopySuccess={onCopySuccess}
                    onScroll={() => handleHorizontalScroll('left')}
                    searchState={searchState}
                    onUpdateTotalMatches={onUpdateTotalMatches}
                    diffLineStatus={isDiffActive ? diffResult.leftLineStatus : undefined}
                    selectedDiffId={isDiffActive ? selectedDiffId : null}
                  />
                ) : (
                  <RenderedView
                    scrollContainerRef={leftRenderedScrollRef}
                    content={docLeft.content}
                    settings={settings}
                    searchState={searchState}
                    onUpdateTotalMatches={onUpdateTotalMatches || (() => {})}
                    onImageClick={onImageClick}
                    onScroll={() => handleHorizontalScroll('left')}
                    diffLineStatus={isDiffActive ? diffResult.leftLineStatus : undefined}
                    selectedDiffId={isDiffActive ? selectedDiffId : null}
                    onSelectDiff={handleDiffClick}
                  />
                )}
              </div>
            </div>

            {/* RIGHT PANE (Document 2) */}
            <div
              onMouseEnter={() => {
                activeDriverRef.current = 'right';
                isSyncingScrollRef.current = false;
              }}
              onTouchStart={() => {
                activeDriverRef.current = 'right';
                isSyncingScrollRef.current = false;
              }}
              onWheel={() => {
                activeDriverRef.current = 'right';
                isSyncingScrollRef.current = false;
              }}
              className="flex-1 h-full min-w-0 flex flex-col relative bg-white dark:bg-slate-900/40"
            >
              {/* Right Pane Header */}
              <div className="h-7 px-3 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs select-none shrink-0">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {docRight.name}
                  </span>
                  {docRight.isModified && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Nesačuvano" />
                  )}
                </div>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono shrink-0">
                  {isDiffActive && (
                    <span className="px-1.5 py-0.2 rounded text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      + Desni
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/60 dark:bg-slate-800 text-[10px]">
                    Desna strana
                  </span>
                </div>
              </div>

              {/* Right Content View */}
              <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                {viewMode === 'edit' ? (
                  <EditorView
                    ref={rightEditorRef}
                    content={docRight.content}
                    onChange={onChangeContentRight}
                    settings={settings}
                    onCopySuccess={onCopySuccess}
                    onScroll={() => handleHorizontalScroll('right')}
                    searchState={searchState}
                    onUpdateTotalMatches={onUpdateTotalMatches}
                    diffLineStatus={isDiffActive ? diffResult.rightLineStatus : undefined}
                    selectedDiffId={isDiffActive ? selectedDiffId : null}
                  />
                ) : (
                  <RenderedView
                    scrollContainerRef={rightRenderedScrollRef}
                    content={docRight.content}
                    settings={settings}
                    searchState={searchState}
                    onUpdateTotalMatches={onUpdateTotalMatches || (() => {})}
                    onImageClick={onImageClick}
                    onScroll={() => handleHorizontalScroll('right')}
                    diffLineStatus={isDiffActive ? diffResult.rightLineStatus : undefined}
                    selectedDiffId={isDiffActive ? selectedDiffId : null}
                    onSelectDiff={handleDiffClick}
                  />
                )}
              </div>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* STACKED (VERTICAL) LAYOUT for "Podeljeno" (Split)                   */
          /* =================================================================== */
          <div className="flex flex-col h-full w-full overflow-hidden">
            {/* TOP PANE (Document 1) - SplitView: Markdown editor on the left + Rendered preview on the right */}
            <div
              onMouseEnter={() => {
                activeDriverRef.current = 'top';
                isSyncingScrollRef.current = false;
              }}
              onTouchStart={() => {
                activeDriverRef.current = 'top';
                isSyncingScrollRef.current = false;
              }}
              onWheel={() => {
                activeDriverRef.current = 'top';
                isSyncingScrollRef.current = false;
              }}
              className="flex-1 w-full min-h-0 border-b-2 border-slate-300 dark:border-slate-800 flex flex-col relative bg-white dark:bg-slate-900/40"
            >
              {/* Top Pane Header */}
              <div className="h-7 px-3 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs select-none shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {docLeft.name}
                  </span>
                  {docLeft.isModified && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Nesačuvano" />
                  )}
                  <span className="text-[10px] font-mono text-slate-400">(Gornji dokument)</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 shrink-0">
                  {isDiffActive && (
                    <span className="px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-semibold">
                      - Levi
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    Markdown pored prikaza
                  </span>
                </div>
              </div>

              {/* Top Content View: Markdown Editor + Rendered Preview side-by-side */}
              <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                <SplitView
                  editorRef={topEditorRef}
                  previewScrollRef={topPreviewScrollRef}
                  content={docLeft.content}
                  onChangeContent={onChangeContentLeft}
                  settings={settings}
                  onUpdateSettings={onUpdateSettings}
                  onCopySuccess={onCopySuccess}
                  searchState={searchState}
                  onUpdateTotalMatches={onUpdateTotalMatches || (() => {})}
                  onImageClick={onImageClick}
                  diffLineStatus={isDiffActive ? diffResult.leftLineStatus : undefined}
                  selectedDiffId={isDiffActive ? selectedDiffId : null}
                  onSelectDiff={handleDiffClick}
                  onScroll={onScroll}
                  onScrollRatio={handleTopSplitScrollRatio}
                />
              </div>
            </div>

            {/* BOTTOM PANE (Document 2) - SplitView: Markdown editor on the left + Rendered preview on the right */}
            <div
              onMouseEnter={() => {
                activeDriverRef.current = 'bottom';
                isSyncingScrollRef.current = false;
              }}
              onTouchStart={() => {
                activeDriverRef.current = 'bottom';
                isSyncingScrollRef.current = false;
              }}
              onWheel={() => {
                activeDriverRef.current = 'bottom';
                isSyncingScrollRef.current = false;
              }}
              className="flex-1 w-full min-h-0 flex flex-col relative bg-white dark:bg-slate-900/40"
            >
              {/* Bottom Pane Header */}
              <div className="h-7 px-3 bg-slate-100/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs select-none shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                  <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                    {docRight.name}
                  </span>
                  {docRight.isModified && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" title="Nesačuvano" />
                  )}
                  <span className="text-[10px] font-mono text-slate-400">(Donji dokument)</span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 shrink-0">
                  {isDiffActive && (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-semibold">
                      + Desni
                    </span>
                  )}
                  <span className="px-1.5 py-0.5 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium">
                    Markdown pored prikaza
                  </span>
                </div>
              </div>

              {/* Bottom Content View: Markdown Editor + Rendered Preview side-by-side */}
              <div className="flex-1 h-full overflow-hidden flex flex-col relative">
                <SplitView
                  editorRef={bottomEditorRef}
                  previewScrollRef={bottomPreviewScrollRef}
                  content={docRight.content}
                  onChangeContent={onChangeContentRight}
                  settings={settings}
                  onUpdateSettings={onUpdateSettings}
                  onCopySuccess={onCopySuccess}
                  searchState={searchState}
                  onUpdateTotalMatches={onUpdateTotalMatches || (() => {})}
                  onImageClick={onImageClick}
                  diffLineStatus={isDiffActive ? diffResult.rightLineStatus : undefined}
                  selectedDiffId={isDiffActive ? selectedDiffId : null}
                  onSelectDiff={handleDiffClick}
                  onScroll={onScroll}
                  onScrollRatio={handleBottomSplitScrollRatio}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Diff Inspector Drawer at the bottom when Diff is active */}
      {isDiffActive && (
        <DiffInspector
          diff={diffResult}
          docLeftName={docLeft.name}
          docRightName={docRight.name}
          selectedDiffId={selectedDiffId}
          onSelectDiff={handleSelectDiff}
          onClose={onToggleDiff}
        />
      )}
    </div>
  );
};
