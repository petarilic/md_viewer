import React, { useEffect, useRef, useMemo } from 'react';
import { ViewerSettings, SearchState } from '../types';
import { renderMarkdownToHtml } from '../utils/markdown';

interface RenderedViewProps {
  content: string;
  settings: ViewerSettings;
  searchState: SearchState;
  onUpdateTotalMatches: (total: number) => void;
  onImageClick: (src: string, alt: string) => void;
  onHeadingVisible?: (headingId: string) => void;
}

export const RenderedView: React.FC<RenderedViewProps> = ({
  content,
  settings,
  searchState,
  onUpdateTotalMatches,
  onImageClick,
  onHeadingVisible,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Generate clean rendered HTML
  const rawHtml = useMemo(() => {
    return renderMarkdownToHtml(content, settings.showLineNumbersInCode);
  }, [content, settings.showLineNumbersInCode]);

  // Set rendered content
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = rawHtml;

    // Attach click listeners for copy-code buttons
    const copyButtons = containerRef.current.querySelectorAll('.copy-code-btn');
    copyButtons.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const code = decodeURIComponent(btn.getAttribute('data-code') || '');
        if (code) {
          navigator.clipboard.writeText(code);
          const label = btn.querySelector('.copy-label');
          if (label) {
            const original = label.textContent;
            label.textContent = 'Kopirano!';
            btn.classList.add('bg-emerald-700', 'text-white');
            setTimeout(() => {
              label.textContent = original;
              btn.classList.remove('bg-emerald-700', 'text-white');
            }, 2000);
          }
        }
      });
    });

    // Attach click listeners for images
    const images = containerRef.current.querySelectorAll('.md-preview-img');
    images.forEach((img) => {
      img.addEventListener('click', () => {
        const src = img.getAttribute('src');
        const alt = img.getAttribute('alt') || '';
        if (src) {
          onImageClick(src, alt);
        }
      });
    });
  }, [rawHtml, onImageClick]);

  // IntersectionObserver for TOC scroll spy
  useEffect(() => {
    if (!containerRef.current || !onHeadingVisible) return;

    const headings = containerRef.current.querySelectorAll('h1, h2, h3, h4, h5, h6');
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.target.id) {
            onHeadingVisible(entry.target.id);
            break;
          }
        }
      },
      {
        root: null,
        rootMargin: '0px 0px -70% 0px',
        threshold: 0.1,
      }
    );

    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [rawHtml, onHeadingVisible]);

  // In-DOM search highlighting and navigation
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clear previous marks
    const existingMarks = container.querySelectorAll('mark.search-match');
    existingMarks.forEach((m) => {
      const parent = m.parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(m.textContent || ''), m);
        parent.normalize();
      }
    });

    if (!searchState.isOpen || !searchState.query.trim()) {
      onUpdateTotalMatches(0);
      return;
    }

    const query = searchState.query;
    const flags = searchState.matchCase ? 'g' : 'gi';
    const regexPattern = searchState.wholeWord
      ? `\\b${escapeRegExp(query)}\\b`
      : escapeRegExp(query);

    let regex: RegExp;
    try {
      regex = new RegExp(regexPattern, flags);
    } catch {
      onUpdateTotalMatches(0);
      return;
    }

    // Traverse text nodes only (to avoid breaking HTML attributes & tags)
    const walker = document.createTreeWalker(container, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'button') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      },
    });

    const nodesToReplace: { node: Text; matches: RegExpExecArray[] }[] = [];
    let currentNode: Node | null;

    while ((currentNode = walker.nextNode())) {
      const textNode = currentNode as Text;
      const text = textNode.nodeValue || '';
      regex.lastIndex = 0;
      let match: RegExpExecArray | null;
      const matches: RegExpExecArray[] = [];
      while ((match = regex.exec(text)) !== null) {
        matches.push(match);
        if (match.index === regex.lastIndex) regex.lastIndex++; // avoid infinite loop
      }
      if (matches.length > 0) {
        nodesToReplace.push({ node: textNode, matches });
      }
    }

    let matchCounter = 0;
    nodesToReplace.forEach(({ node, matches }) => {
      const text = node.nodeValue || '';
      const fragment = document.createDocumentFragment();
      let lastIdx = 0;

      matches.forEach((m) => {
        const matchStart = m.index;
        const matchEnd = matchStart + m[0].length;

        if (matchStart > lastIdx) {
          fragment.appendChild(document.createTextNode(text.substring(lastIdx, matchStart)));
        }

        const mark = document.createElement('mark');
        mark.className = 'search-match';
        mark.dataset.matchIndex = String(matchCounter);
        mark.textContent = m[0];
        fragment.appendChild(mark);

        matchCounter++;
        lastIdx = matchEnd;
      });

      if (lastIdx < text.length) {
        fragment.appendChild(document.createTextNode(text.substring(lastIdx)));
      }

      node.parentNode?.replaceChild(fragment, node);
    });

    onUpdateTotalMatches(matchCounter);

    // Scroll to current active match
    if (matchCounter > 0) {
      const activeMark = container.querySelector(
        `mark.search-match[data-match-index="${searchState.currentIndex}"]`
      ) as HTMLElement | null;

      if (activeMark) {
        container.querySelectorAll('mark.search-match.current-match').forEach((el) => {
          el.classList.remove('current-match');
        });
        activeMark.classList.add('current-match');
        activeMark.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [
    rawHtml,
    searchState.isOpen,
    searchState.query,
    searchState.matchCase,
    searchState.wholeWord,
    searchState.currentIndex,
    onUpdateTotalMatches,
  ]);

  // Width classes
  const widthClasses = {
    narrow: 'max-w-2xl',
    standard: 'max-w-4xl',
    wide: 'max-w-6xl',
    full: 'max-w-none',
  };

  // Font size classes
  const fontSizeClasses = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  // Font family classes
  const fontFamilyClasses = {
    sans: 'font-sans',
    serif: 'font-serif',
    mono: 'font-mono',
  };

  // Line spacing
  const lineSpacingClasses = {
    compact: 'leading-normal space-y-2',
    normal: 'leading-relaxed space-y-4',
    relaxed: 'leading-loose space-y-6',
  };

  return (
    <div className="w-full h-full overflow-y-auto px-4 sm:px-8 py-8 transition-colors">
      <div
        className={`mx-auto ${widthClasses[settings.contentWidth]} ${fontSizeClasses[settings.fontSize]} ${fontFamilyClasses[settings.fontFamily]} ${lineSpacingClasses[settings.lineSpacing]} print-container`}
      >
        <div
          ref={containerRef}
          className="markdown-body text-slate-800 dark:text-slate-200 transition-colors"
        />
      </div>
    </div>
  );
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
