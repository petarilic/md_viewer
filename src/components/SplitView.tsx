import React, { useRef, useEffect, useCallback } from 'react';
import { Link2, Unlink } from 'lucide-react';
import { ViewerSettings, SearchState } from '../types';
import { EditorView, EditorViewRef } from './EditorView';
import { RenderedView } from './RenderedView';

interface SplitViewProps {
  content: string;
  onChangeContent: (newContent: string) => void;
  settings: ViewerSettings;
  searchState: SearchState;
  onUpdateTotalMatches: (total: number) => void;
  onImageClick: (src: string, alt: string) => void;
  onCopySuccess: () => void;
  editorRef?: React.RefObject<EditorViewRef | null>;
  previewScrollRef?: React.RefObject<HTMLDivElement | null>;
  onScroll?: () => void;
  onUpdateSettings?: (newSettings: Partial<ViewerSettings>) => void;
}

export const SplitView: React.FC<SplitViewProps> = ({
  content,
  onChangeContent,
  settings,
  searchState,
  onUpdateTotalMatches,
  onImageClick,
  onCopySuccess,
  editorRef,
  previewScrollRef,
  onScroll,
  onUpdateSettings,
}) => {
  const localPreviewScrollRef = useRef<HTMLDivElement>(null);
  const actualPreviewScrollRef = previewScrollRef || localPreviewScrollRef;
  const isSyncingRef = useRef(false);
  const activeDriverRef = useRef<'editor' | 'preview' | null>(null);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Helper to compute scroll ratio (0 to 1)
  const getScrollRatio = (el: HTMLElement) => {
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll <= 0) return 0;
    return Math.max(0, Math.min(1, el.scrollTop / maxScroll));
  };

  // Helper to apply scroll ratio
  const setScrollByRatio = (el: HTMLElement, ratio: number) => {
    const maxScroll = el.scrollHeight - el.clientHeight;
    if (maxScroll > 0) {
      el.scrollTop = Math.round(ratio * maxScroll);
    }
  };

  const setDriver = (driver: 'editor' | 'preview') => {
    activeDriverRef.current = driver;
    // Release previous sync lock if user explicitly shifted focus/pointer
    isSyncingRef.current = false;
  };

  // Handle scroll originating from markdown editor
  const handleEditorScroll = useCallback(() => {
    onScroll?.();
    if (!settings.syncScroll) return;
    if (isSyncingRef.current && activeDriverRef.current === 'preview') return;

    const editorEl = editorRef?.current?.getTextarea?.();
    const previewEl = actualPreviewScrollRef.current;
    if (!editorEl || !previewEl) return;

    activeDriverRef.current = 'editor';
    isSyncingRef.current = true;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    const ratio = getScrollRatio(editorEl);
    setScrollByRatio(previewEl, ratio);

    syncTimeoutRef.current = setTimeout(() => {
      isSyncingRef.current = false;
    }, 70);
  }, [settings.syncScroll, editorRef, actualPreviewScrollRef, onScroll]);

  // Handle scroll originating from rendered HTML preview
  const handlePreviewScroll = useCallback(() => {
    onScroll?.();
    if (!settings.syncScroll) return;
    if (isSyncingRef.current && activeDriverRef.current === 'editor') return;

    const editorEl = editorRef?.current?.getTextarea?.();
    const previewEl = actualPreviewScrollRef.current;
    if (!editorEl || !previewEl) return;

    activeDriverRef.current = 'preview';
    isSyncingRef.current = true;
    if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);

    const ratio = getScrollRatio(previewEl);
    if (editorRef?.current?.setScrollTop) {
      const maxScroll = editorEl.scrollHeight - editorEl.clientHeight;
      editorRef.current.setScrollTop(maxScroll > 0 ? Math.round(ratio * maxScroll) : 0);
    } else {
      setScrollByRatio(editorEl, ratio);
    }

    syncTimeoutRef.current = setTimeout(() => {
      isSyncingRef.current = false;
    }, 70);
  }, [settings.syncScroll, editorRef, actualPreviewScrollRef, onScroll]);

  // When syncScroll option is enabled or toggled ON, align preview to editor
  useEffect(() => {
    if (!settings.syncScroll) return;
    const editorEl = editorRef?.current?.getTextarea?.();
    const previewEl = actualPreviewScrollRef.current;
    if (editorEl && previewEl) {
      const ratio = getScrollRatio(editorEl);
      setScrollByRatio(previewEl, ratio);
    }
  }, [settings.syncScroll, editorRef, actualPreviewScrollRef]);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current);
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
      {/* Left Pane: Interactive Live Editor */}
      <div
        onMouseEnter={() => setDriver('editor')}
        onTouchStart={() => setDriver('editor')}
        onWheel={() => setDriver('editor')}
        className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
      >
        <EditorView
          ref={editorRef}
          content={content}
          onChange={onChangeContent}
          settings={settings}
          onCopySuccess={onCopySuccess}
          onScroll={handleEditorScroll}
          searchState={searchState}
        />
      </div>

      {/* Right Pane: Live Rendered Preview */}
      <div
        onMouseEnter={() => setDriver('preview')}
        onTouchStart={() => setDriver('preview')}
        onWheel={() => setDriver('preview')}
        className="w-full md:w-1/2 h-1/2 md:h-full overflow-hidden bg-slate-50/50 dark:bg-slate-900/30 flex flex-col"
      >
        {/* Preview Top Header Bar with title and sync toggle */}
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-500 dark:text-slate-400 select-none shrink-0">
          <div className="flex items-center gap-1.5 font-semibold text-slate-700 dark:text-slate-300">
            <span>Formatirani prikaz (Preview)</span>
          </div>

          {/* Quick sync toggle button */}
          {onUpdateSettings && (
            <button
              onClick={() => onUpdateSettings({ syncScroll: !settings.syncScroll })}
              className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[11px] font-medium transition cursor-pointer ${
                settings.syncScroll
                  ? 'border-blue-300 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title={
                settings.syncScroll
                  ? 'Sinhronizovano skrolovanje je UKLJUČENO (kliknite za isključivanje)'
                  : 'Sinhronizovano skrolovanje je ISKLJUČENO (kliknite za uključivanje)'
              }
            >
              {settings.syncScroll ? (
                <>
                  <Link2 className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                  <span>Sinhronizovano: Uključeno</span>
                </>
              ) : (
                <>
                  <Unlink className="w-3 h-3 text-slate-400" />
                  <span>Nezavisno skrolovanje</span>
                </>
              )}
            </button>
          )}
        </div>

        {/* Rendered Preview content */}
        <div className="flex-1 overflow-hidden relative">
          <RenderedView
            scrollContainerRef={actualPreviewScrollRef}
            onScroll={handlePreviewScroll}
            content={content}
            settings={settings}
            searchState={searchState}
            onUpdateTotalMatches={onUpdateTotalMatches}
            onImageClick={onImageClick}
          />
        </div>
      </div>
    </div>
  );
};
