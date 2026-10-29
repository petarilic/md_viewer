import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  FileCode,
  Link,
  Image,
  List,
  ListOrdered,
  CheckSquare,
  Table,
  Minus,
  Undo2,
  Redo2,
  WrapText,
  Copy,
  Check,
} from 'lucide-react';
import { ViewerSettings, SearchState } from '../types';

export interface EditorViewRef {
  focus: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  replaceSelection: (newText: string) => void;
  replaceAll: (findText: string, replaceText: string, matchCase: boolean, wholeWord: boolean) => number;
  selectMatch: (start: number, length: number) => void;
  getTextarea: () => HTMLTextAreaElement | null;
  getScrollTop: () => number;
  setScrollTop: (top: number) => void;
}

interface EditorViewProps {
  content: string;
  onChange: (newContent: string) => void;
  settings: ViewerSettings;
  onCopySuccess: () => void;
  onScroll?: (e: React.UIEvent<HTMLTextAreaElement>) => void;
  searchState?: SearchState;
  onUpdateTotalMatches?: (total: number) => void;
  diffLineStatus?: Map<number, { type: 'added' | 'removed' | 'modified'; diffItemId: string }>;
  selectedDiffId?: string | null;
}

export const EditorView = forwardRef<EditorViewRef, EditorViewProps>(
  (
    {
      content,
      onChange,
      settings,
      onCopySuccess,
      onScroll,
      searchState,
      onUpdateTotalMatches,
      diffLineStatus,
      selectedDiffId,
    },
    ref
  ) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const lineNumbersRef = useRef<HTMLDivElement>(null);
    const [wordWrap, setWordWrap] = useState(settings.wordWrap ?? true);
    const [copied, setCopied] = useState(false);

    // Undo / Redo history stack via refs to prevent infinite update depth
    const historyRef = useRef<string[]>([content]);
    const historyIndexRef = useRef(0);
    const isHistoryAction = useRef(false);

    // Synchronize history when content changes
    useEffect(() => {
      if (isHistoryAction.current) {
        isHistoryAction.current = false;
        return;
      }
      const currentEntry = historyRef.current[historyIndexRef.current];
      if (currentEntry !== content) {
        const newHist = historyRef.current.slice(0, historyIndexRef.current + 1);
        newHist.push(content);
        if (newHist.length > 50) newHist.shift();
        historyRef.current = newHist;
        historyIndexRef.current = newHist.length - 1;
      }
    }, [content]);

    // Synchronize search matches and navigate/select current match in Editor
    useEffect(() => {
      if (!searchState?.isOpen) return;

      if (!searchState.query) {
        onUpdateTotalMatches?.(0);
        return;
      }

      const flags = searchState.matchCase ? 'g' : 'gi';
      const escaped = searchState.query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const pattern = searchState.wholeWord ? `\\b${escaped}\\b` : escaped;
      let regex: RegExp;
      try {
        regex = new RegExp(pattern, flags);
      } catch {
        return;
      }

      const matches: { index: number; length: number }[] = [];
      let m: RegExpExecArray | null;
      while ((m = regex.exec(content)) !== null) {
        matches.push({ index: m.index, length: m[0].length });
        if (m.index === regex.lastIndex) regex.lastIndex++;
      }

      if (onUpdateTotalMatches) {
        onUpdateTotalMatches(matches.length);
      }

      if (matches.length > 0 && textareaRef.current) {
        const targetIdx = Math.max(0, Math.min(searchState.currentIndex, matches.length - 1));
        const target = matches[targetIdx];
        const textarea = textareaRef.current;
        textarea.focus();
        textarea.setSelectionRange(target.index, target.index + target.length);

        // Smoothly scroll textarea to match line
        const beforeText = content.substring(0, target.index);
        const line = beforeText.split('\n').length;
        const lineHeight = 24;
        textarea.scrollTop = Math.max(0, (line - 4) * lineHeight);
      }
    }, [
      searchState?.isOpen,
      searchState?.query,
      searchState?.currentIndex,
      searchState?.matchCase,
      searchState?.wholeWord,
      content,
      onUpdateTotalMatches,
    ]);

    const handleUndo = () => {
      if (historyIndexRef.current > 0) {
        isHistoryAction.current = true;
        historyIndexRef.current -= 1;
        const prevContent = historyRef.current[historyIndexRef.current];
        onChange(prevContent);
      }
    };

    const handleRedo = () => {
      if (historyIndexRef.current < historyRef.current.length - 1) {
        isHistoryAction.current = true;
        historyIndexRef.current += 1;
        const nextContent = historyRef.current[historyIndexRef.current];
        onChange(nextContent);
      }
    };

    const canUndo = historyIndexRef.current > 0;
    const canRedo = historyIndexRef.current < historyRef.current.length - 1;

    // Expose methods via ref
    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      undo: handleUndo,
      redo: handleRedo,
      canUndo,
      canRedo,
      replaceSelection: (newText: string) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const before = textarea.value.substring(0, start);
        const after = textarea.value.substring(end);
        const updated = before + newText + after;
        onChange(updated);
        setTimeout(() => {
          textarea.focus();
          textarea.setSelectionRange(start, start + newText.length);
        }, 10);
      },
      replaceAll: (findText: string, replaceText: string, matchCase: boolean, wholeWord: boolean) => {
        if (!findText) return 0;
        const flags = matchCase ? 'g' : 'gi';
        const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const pattern = wholeWord ? `\\b${escaped}\\b` : escaped;
        const regex = new RegExp(pattern, flags);
        const matchesCount = (content.match(regex) || []).length;
        if (matchesCount > 0) {
          const updated = content.replace(regex, replaceText);
          onChange(updated);
        }
        return matchesCount;
      },
      selectMatch: (start: number, length: number) => {
        const textarea = textareaRef.current;
        if (!textarea) return;
        textarea.focus();
        textarea.setSelectionRange(start, start + length);
        // Scroll roughly to selection
        const line = textarea.value.substring(0, start).split('\n').length;
        const lineHeight = 24;
        textarea.scrollTop = Math.max(0, (line - 5) * lineHeight);
      },
      getTextarea: () => textareaRef.current,
      getScrollTop: () => textareaRef.current?.scrollTop ?? 0,
      setScrollTop: (top: number) => {
        if (textareaRef.current) {
          textareaRef.current.scrollTop = top;
        }
        if (lineNumbersRef.current) {
          lineNumbersRef.current.scrollTop = top;
        }
      },
    }));

    // Insert formatting helper
    const insertFormatting = (prefix: string, suffix = '', defaultText = '') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const selected = textarea.value.substring(start, end) || defaultText;

      const replacement = `${prefix}${selected}${suffix}`;
      const before = textarea.value.substring(0, start);
      const after = textarea.value.substring(end);

      const newContent = before + replacement + after;
      onChange(newContent);

      setTimeout(() => {
        textarea.focus();
        if (selected === defaultText) {
          textarea.setSelectionRange(start + prefix.length, start + prefix.length + selected.length);
        } else {
          textarea.setSelectionRange(
            start + prefix.length,
            start + prefix.length + selected.length
          );
        }
      }, 10);
    };

    // Line prefix helper (for lists, quotes, headings)
    const toggleLinePrefix = (prefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const val = textarea.value;

      // Find start of current line
      const lineStart = val.lastIndexOf('\n', start - 1) + 1;
      const lineEnd = val.indexOf('\n', end);
      const effectiveLineEnd = lineEnd === -1 ? val.length : lineEnd;

      const currentLine = val.substring(lineStart, effectiveLineEnd);
      let newLine = currentLine;

      if (currentLine.startsWith(prefix)) {
        newLine = currentLine.substring(prefix.length);
      } else {
        newLine = prefix + currentLine;
      }

      const newContent = val.substring(0, lineStart) + newLine + val.substring(effectiveLineEnd);
      onChange(newContent);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, end + prefix.length);
      }, 10);
    };

    // Keyboard handlers (Tab, Enter with auto-indent, shortcuts)
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      // Undo / Redo shortcuts
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          handleRedo();
        } else {
          e.preventDefault();
          handleUndo();
        }
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
        return;
      }

      // Tab key
      if (e.key === 'Tab') {
        e.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const val = textarea.value;

        const updated = val.substring(0, start) + '  ' + val.substring(end);
        onChange(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
        return;
      }

      // Enter key with auto-indent & list continuation
      if (e.key === 'Enter') {
        const start = textarea.selectionStart;
        const val = textarea.value;
        const lineStart = val.lastIndexOf('\n', start - 1) + 1;
        const currentLine = val.substring(lineStart, start);

        // Check for list prefixes
        const listMatch = currentLine.match(/^(\s*)([-*+]\s+\[[ x]\]\s+|[-*+]\s+|\d+\.\s+)/i);
        if (listMatch) {
          const [fullMatch, indent, marker] = listMatch;
          // If line is empty list item, hitting enter removes it
          if (currentLine.trim() === marker.trim()) {
            e.preventDefault();
            const updated = val.substring(0, lineStart) + val.substring(start);
            onChange(updated);
            setTimeout(() => {
              textarea.selectionStart = textarea.selectionEnd = lineStart;
            }, 0);
            return;
          }

          // Otherwise continue list
          e.preventDefault();
          let nextMarker = marker;
          const numMatch = marker.match(/^(\d+)\.\s+/);
          if (numMatch) {
            nextMarker = `${parseInt(numMatch[1], 10) + 1}. `;
          } else if (marker.includes('[')) {
            nextMarker = '- [ ] ';
          }

          const continuation = `\n${indent}${nextMarker}`;
          const updated = val.substring(0, start) + continuation + val.substring(start);
          onChange(updated);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + continuation.length;
          }, 0);
          return;
        }

        // Keep spaces indent
        const indentMatch = currentLine.match(/^(\s+)/);
        if (indentMatch) {
          e.preventDefault();
          const continuation = `\n${indentMatch[1]}`;
          const updated = val.substring(0, start) + continuation + val.substring(start);
          onChange(updated);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = start + continuation.length;
          }, 0);
          return;
        }
      }
    };

    // Synchronize scrolling between textarea and line numbers, and notify parent
    const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
      if (textareaRef.current && lineNumbersRef.current) {
        lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop;
      }
      onScroll?.(e);
    };

    const handleCopyAll = () => {
      navigator.clipboard.writeText(content);
      setCopied(true);
      onCopySuccess();
      setTimeout(() => setCopied(false), 2000);
    };

    const lines = content.split('\n');

    // Font size classes
    const fontSizeClasses = {
      sm: 'text-xs',
      base: 'text-sm',
      lg: 'text-base',
      xl: 'text-lg',
    };

    const tbBtnClass =
      'p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition cursor-pointer';

    return (
      <div className="w-full h-full flex flex-col bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono transition-colors">
        {/* Formatting Toolbar */}
        <div className="flex items-center justify-between gap-1 px-2 sm:px-3 py-1.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/70 text-slate-700 dark:text-slate-300 text-xs select-none no-print overflow-x-auto">
          {/* Markdown Format Buttons */}
          <div className="flex items-center gap-0.5 overflow-x-auto shrink-0 scrollbar-none py-0.5">
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'podebljan tekst')}
              className={tbBtnClass}
              title="Podebljano (Bold - **tekst**)"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'kurzivni tekst')}
              className={tbBtnClass}
              title="Kurziv (Italic - *tekst*)"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('~~', '~~', 'precrtan tekst')}
              className={tbBtnClass}
              title="Precrtano (Strikethrough - ~~tekst~~)"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => toggleLinePrefix('# ')}
              className={tbBtnClass}
              title="Naslov 1 (# H1)"
            >
              <Heading1 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleLinePrefix('## ')}
              className={tbBtnClass}
              title="Naslov 2 (## H2)"
            >
              <Heading2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleLinePrefix('### ')}
              className={tbBtnClass}
              title="Naslov 3 (### H3)"
            >
              <Heading3 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => toggleLinePrefix('- ')}
              className={tbBtnClass}
              title="Nenumerisana lista (- stavka)"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleLinePrefix('1. ')}
              className={tbBtnClass}
              title="Numerisana lista (1. stavka)"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => toggleLinePrefix('- [ ] ')}
              className={tbBtnClass}
              title="Task lista (- [ ] zadatak)"
            >
              <CheckSquare className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => toggleLinePrefix('> ')}
              className={tbBtnClass}
              title="Citat (> citat)"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'kod')}
              className={tbBtnClass}
              title="Inline kôd (`kod`)"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('```\n', '\n```', '// kôd ovde')}
              className={tbBtnClass}
              title="Blok koda (```)"
            >
              <FileCode className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => insertFormatting('[', '](https://)', 'tekst linka')}
              className={tbBtnClass}
              title="Link ([tekst](url))"
            >
              <Link className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('![', '](https://)', 'opis slike')}
              className={tbBtnClass}
              title="Slika (![opis](url))"
            >
              <Image className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() =>
                insertFormatting(
                  '\n| Kolona 1 | Kolona 2 |\n| :--- | :--- |\n| Podatak 1 | Podatak 2 |\n'
                )
              }
              className={tbBtnClass}
              title="Tabela"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('\n---\n')}
              className={tbBtnClass}
              title="Horizontalna linija (---)"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Actions: Undo/Redo & Wrap & Copy */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handleUndo}
              disabled={!canUndo}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Poništi (Undo - Ctrl+Z)"
            >
              <Undo2 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={handleRedo}
              disabled={!canRedo}
              className="p-1.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
              title="Ponovi (Redo - Ctrl+Y)"
            >
              <Redo2 className="w-3.5 h-3.5" />
            </button>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-800 mx-1" />

            <button
              type="button"
              onClick={() => setWordWrap(!wordWrap)}
              className={`p-1.5 rounded transition cursor-pointer ${
                wordWrap
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 font-medium'
                  : 'hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Prelom redova (Word Wrap)"
            >
              <WrapText className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handleCopyAll}
              className="flex items-center gap-1 px-2 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 hover:text-slate-900 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:hover:text-white transition cursor-pointer"
              title="Kopiraj ceo Markdown sadržaj"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">Kopirano!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span className="text-[11px] hidden sm:inline">Kopiraj</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Editor Area with Line Numbers */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Line Numbers Column with optional Diff markers */}
          <div
            ref={lineNumbersRef}
            className="w-13 py-3 pr-1 text-right text-slate-400 dark:text-slate-500 bg-slate-50/90 dark:bg-slate-950/40 border-r border-slate-200 dark:border-slate-800 select-none overflow-hidden font-mono shrink-0"
          >
            {lines.map((_, i) => {
              const lineNum = i + 1;
              const diffInfo = diffLineStatus?.get(lineNum);
              const isSelectedDiff = diffInfo && diffInfo.diffItemId === selectedDiffId;

              let diffClass = '';
              let badgeSymbol = '';

              if (diffInfo) {
                if (diffInfo.type === 'added') {
                  diffClass =
                    'bg-emerald-100 dark:bg-emerald-500/25 text-emerald-800 dark:text-emerald-300 font-bold border-r-2 border-emerald-500 dark:border-emerald-400';
                  badgeSymbol = '+';
                } else if (diffInfo.type === 'removed') {
                  diffClass =
                    'bg-rose-100 dark:bg-rose-500/25 text-rose-800 dark:text-rose-300 font-bold border-r-2 border-rose-500 dark:border-rose-400';
                  badgeSymbol = '-';
                } else if (diffInfo.type === 'modified') {
                  diffClass =
                    'bg-amber-100 dark:bg-amber-500/25 text-amber-800 dark:text-amber-300 font-bold border-r-2 border-amber-500 dark:border-amber-400';
                  badgeSymbol = '~';
                }
              }

              return (
                <div
                  key={i}
                  className={`${fontSizeClasses[settings.fontSize]} leading-6 px-1 flex items-center justify-end gap-1 ${
                    isSelectedDiff ? 'ring-1 ring-indigo-500 dark:ring-indigo-400 font-bold ' : ''
                  }${diffClass}`}
                  title={diffInfo ? `Razlika: linija ${lineNum} (${diffInfo.type})` : undefined}
                >
                  {badgeSymbol && <span className="text-[10px] font-black">{badgeSymbol}</span>}
                  <span>{lineNum}</span>
                </div>
              );
            })}
          </div>

          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onScroll={handleScroll}
            spellCheck={false}
            className={`flex-1 p-3 bg-white dark:bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 caret-blue-600 dark:caret-blue-400 selection:bg-blue-100 dark:selection:bg-blue-900/60 ${
              fontSizeClasses[settings.fontSize]
            } leading-6 font-mono outline-none resize-none overflow-y-auto ${
              wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
            }`}
            placeholder="Unesite Markdown tekst ovde..."
          />
        </div>
      </div>
    );
  }
);
