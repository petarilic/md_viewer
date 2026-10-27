import React, { useState, useRef, useMemo, useCallback } from 'react';
import {
  ArrowLeftRight,
  Link2,
  Unlink,
  GitCompare,
  FileText,
  Eye,
  Edit3,
  Columns,
  Layers,
  TableProperties,
} from 'lucide-react';
import { DocumentItem, ViewerSettings, ViewMode, SearchState } from '../types';
import { EditorView, EditorViewRef } from './EditorView';
import { RenderedView } from './RenderedView';
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

  // Sub-view toggles for vertically stacked 'split' mode
  const [paneTopMode, setPaneTopMode] = useState<'rendered' | 'edit'>('rendered');
  const [paneBottomMode, setPaneBottomMode] = useState<'rendered' | 'edit'>('rendered');

  // References for scrolling
  const leftEditorRef = useRef<EditorViewRef>(null);
  const rightEditorRef = useRef<EditorViewRef>(null);
  const leftRenderedScrollRef = useRef<HTMLDivElement>(null);
  const rightRenderedScrollRef = useRef<HTMLDivElement>(null);
  const isSyncingScrollRef = useRef(false);

  // Compute Diff between Left and Right document
  const diffResult: DiffResult = useMemo(() => {
    return compareDocuments(docLeft.content, docRight.content);
  }, [docLeft.content, docRight.content]);

  // Handle Diff selection and auto-scroll to line
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
          try {
            container.scrollTo({ top: targetScroll, behavior: 'smooth' });
          } catch {
            container.scrollTop = targetScroll;
          }
        }
      };

      // Scroll left side
      if (item.leftLineNumber) {
        scrollToLine(item.leftLineNumber, leftEditorRef.current, leftRenderedScrollRef.current);
      }
      // Scroll right side
      if (item.rightLineNumber) {
        scrollToLine(item.rightLineNumber, rightEditorRef.current, rightRenderedScrollRef.current);
      }
    },
    []
  );

  // Proportional scroll synchronization between Left and Right panes
  const handlePaneScroll = useCallback(
    (source: 'left' | 'right') => {
      onScroll?.();
      if (!syncScroll || isSyncingScrollRef.current) return;

      const getElement = (side: 'left' | 'right'): HTMLElement | null => {
        if (viewMode === 'edit') {
          return (side === 'left' ? leftEditorRef : rightEditorRef).current?.getTextarea() || null;
        }
        return (side === 'left' ? leftRenderedScrollRef : rightRenderedScrollRef).current;
      };

      const sourceEl = getElement(source);
      const targetEl = getElement(source === 'left' ? 'right' : 'left');

      if (!sourceEl || !targetEl) return;

      isSyncingScrollRef.current = true;
      const maxSource = sourceEl.scrollHeight - sourceEl.clientHeight;
      const maxTarget = targetEl.scrollHeight - targetEl.clientHeight;

      if (maxSource > 0 && maxTarget > 0) {
        const ratio = sourceEl.scrollTop / maxSource;
        targetEl.scrollTop = Math.round(ratio * maxTarget);
      }

      setTimeout(() => {
        isSyncingScrollRef.current = false;
      }, 50);
    },
    [syncScroll, viewMode, onScroll]
  );

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
                title="Prikaz dokumenata sa kolor-kodiranim linijama"
              >
                Prikaz teksta
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
            onClick={() => setSyncScroll(!syncScroll)}
            className={`flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium transition cursor-pointer ${
              syncScroll
                ? 'bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800'
                : 'border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-800'
            }`}
            title={syncScroll ? 'Sinhronizovano skrolovanje je uključeno' : 'Uključi sinhronizovano skrolovanje'}
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
          />
        ) : isHorizontalSplit ? (
          /* =================================================================== */
          /* SIDE-BY-SIDE (HORIZONTAL) LAYOUT for "Uredi" and "Prikaz"           */
          /* =================================================================== */
          <div className="flex flex-row h-full w-full overflow-hidden">
            {/* LEFT PANE (Document 1) */}
            <div className="flex-1 h-full min-w-0 border-r border-slate-200 dark:border-slate-800 flex flex-col relative bg-white dark:bg-slate-900/40">
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
              <div
                className="flex-1 h-full overflow-hidden flex flex-col relative"
                onScroll={() => handlePaneScroll('left')}
              >
                {viewMode === 'edit' ? (
                  <EditorView
                    ref={leftEditorRef}
                    content={docLeft.content}
                    onChange={onChangeContentLeft}
                    settings={settings}
                    onCopySuccess={onCopySuccess}
                    onScroll={() => handlePaneScroll('left')}
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
                    onScroll={() => handlePaneScroll('left')}
                  />
                )}
              </div>
            </div>

            {/* RIGHT PANE (Document 2) */}
            <div className="flex-1 h-full min-w-0 flex flex-col relative bg-white dark:bg-slate-900/40">
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
              <div
                className="flex-1 h-full overflow-hidden flex flex-col relative"
                onScroll={() => handlePaneScroll('right')}
              >
                {viewMode === 'edit' ? (
                  <EditorView
                    ref={rightEditorRef}
                    content={docRight.content}
                    onChange={onChangeContentRight}
                    settings={settings}
                    onCopySuccess={onCopySuccess}
                    onScroll={() => handlePaneScroll('right')}
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
                    onScroll={() => handlePaneScroll('right')}
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
            {/* TOP PANE (Document 1) */}
            <div className="flex-1 w-full min-h-0 border-b border-slate-200 dark:border-slate-800 flex flex-col relative bg-white dark:bg-slate-900/40">
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
                  <span className="text-[10px] font-mono text-slate-400">(Gornji panel)</span>
                </div>

                {/* Sub-view toggle for top pane */}
                <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPaneTopMode('rendered')}
                    className={`px-1.5 py-0.5 rounded ${
                      paneTopMode === 'rendered'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Prikaz
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaneTopMode('edit')}
                    className={`px-1.5 py-0.5 rounded ${
                      paneTopMode === 'edit'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Uredi
                  </button>
                </div>
              </div>

              {/* Top Content View */}
              <div
                className="flex-1 h-full overflow-hidden flex flex-col relative"
                onScroll={() => handlePaneScroll('left')}
              >
                {paneTopMode === 'edit' ? (
                  <EditorView
                    ref={leftEditorRef}
                    content={docLeft.content}
                    onChange={onChangeContentLeft}
                    settings={settings}
                    onCopySuccess={onCopySuccess}
                    onScroll={() => handlePaneScroll('left')}
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
                    onScroll={() => handlePaneScroll('left')}
                  />
                )}
              </div>
            </div>

            {/* BOTTOM PANE (Document 2) */}
            <div className="flex-1 w-full min-h-0 flex flex-col relative bg-white dark:bg-slate-900/40">
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
                  <span className="text-[10px] font-mono text-slate-400">(Donji panel)</span>
                </div>

                {/* Sub-view toggle for bottom pane */}
                <div className="flex items-center gap-1 bg-slate-200/60 dark:bg-slate-800 p-0.5 rounded text-[10px]">
                  <button
                    type="button"
                    onClick={() => setPaneBottomMode('rendered')}
                    className={`px-1.5 py-0.5 rounded ${
                      paneBottomMode === 'rendered'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Prikaz
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaneBottomMode('edit')}
                    className={`px-1.5 py-0.5 rounded ${
                      paneBottomMode === 'edit'
                        ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 font-medium shadow-xs'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    Uredi
                  </button>
                </div>
              </div>

              {/* Bottom Content View */}
              <div
                className="flex-1 h-full overflow-hidden flex flex-col relative"
                onScroll={() => handlePaneScroll('right')}
              >
                {paneBottomMode === 'edit' ? (
                  <EditorView
                    ref={rightEditorRef}
                    content={docRight.content}
                    onChange={onChangeContentRight}
                    settings={settings}
                    onCopySuccess={onCopySuccess}
                    onScroll={() => handlePaneScroll('right')}
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
                    onScroll={() => handlePaneScroll('right')}
                  />
                )}
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
