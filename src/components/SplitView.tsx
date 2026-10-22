import React, { useRef, useEffect } from 'react';
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
}) => {
  const leftPaneRef = useRef<HTMLDivElement>(null);
  const rightPaneRef = useRef<HTMLDivElement>(null);
  const isScrollingSync = useRef(false);

  // Synchronized scrolling
  useEffect(() => {
    if (!settings.syncScroll) return;

    const left = leftPaneRef.current;
    const right = rightPaneRef.current;
    if (!left || !right) return;

    const handleLeftScroll = () => {
      if (isScrollingSync.current) return;
      isScrollingSync.current = true;
      const leftScrollPercent = left.scrollTop / (left.scrollHeight - left.clientHeight || 1);
      right.scrollTop = leftScrollPercent * (right.scrollHeight - right.clientHeight);
      setTimeout(() => {
        isScrollingSync.current = false;
      }, 50);
    };

    const handleRightScroll = () => {
      if (isScrollingSync.current) return;
      isScrollingSync.current = true;
      const rightScrollPercent = right.scrollTop / (right.scrollHeight - right.clientHeight || 1);
      left.scrollTop = rightScrollPercent * (left.scrollHeight - left.clientHeight);
      setTimeout(() => {
        isScrollingSync.current = false;
      }, 50);
    };

    left.addEventListener('scroll', handleLeftScroll);
    right.addEventListener('scroll', handleRightScroll);

    return () => {
      left.removeEventListener('scroll', handleLeftScroll);
      right.removeEventListener('scroll', handleRightScroll);
    };
  }, [settings.syncScroll]);

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden">
      {/* Left Pane: Interactive Live Editor */}
      <div
        ref={leftPaneRef}
        className="w-full md:w-1/2 h-1/2 md:h-full border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col"
      >
        <EditorView
          ref={editorRef}
          content={content}
          onChange={onChangeContent}
          settings={settings}
          onCopySuccess={onCopySuccess}
        />
      </div>

      {/* Right Pane: Live Rendered Preview */}
      <div
        ref={rightPaneRef}
        className="w-full md:w-1/2 h-1/2 md:h-full overflow-y-auto bg-slate-50/50 dark:bg-slate-900/30"
      >
        <RenderedView
          content={content}
          settings={settings}
          searchState={searchState}
          onUpdateTotalMatches={onUpdateTotalMatches}
          onImageClick={onImageClick}
        />
      </div>
    </div>
  );
};
