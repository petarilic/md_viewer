import { marked } from 'marked';
import DOMPurify from 'dompurify';
import hljs from 'highlight.js';
import { TocItem, DocumentStats } from '../types';

// Helper to create clean URL/anchor friendly slug
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s\u0400-\u04FF\u0100-\u017F-]/g, '') // keep unicode word characters
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Extracts all headings from markdown source to build a Table of Contents (TOC).
 * Resolves duplicate IDs identically to the renderer.
 */
export function extractToc(markdown: string): TocItem[] {
  const headings: TocItem[] = [];
  const lines = markdown.split(/\r?\n/);
  const slugCounts: Record<string, number> = {};

  let inCodeBlock = false;

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) continue;

    // Check for ATX headings (# H1 ... ###### H6)
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const rawText = match[2].trim();
      // Remove inline markdown formatting for TOC display
      const cleanText = rawText
        .replace(/[*_~`]/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();

      const baseSlug = slugify(cleanText) || `section-${headings.length + 1}`;
      let finalSlug = baseSlug;

      if (slugCounts[baseSlug] !== undefined) {
        slugCounts[baseSlug]++;
        finalSlug = `${baseSlug}-${slugCounts[baseSlug]}`;
      } else {
        slugCounts[baseSlug] = 0;
      }

      headings.push({
        id: finalSlug,
        level,
        text: cleanText,
        rawText,
      });
    }
  }

  return headings;
}

/**
 * Calculates document metrics (words, lines, reading time, characters)
 */
export function calculateDocumentStats(content: string, sizeBytes?: number): DocumentStats {
  const lines = content.split(/\r?\n/).length;
  const characters = content.length;
  // Count words, ignoring code block punctuation
  const wordsArray = content.trim().split(/\s+/).filter(Boolean);
  const words = content.trim().length === 0 ? 0 : wordsArray.length;
  const readingTimeMinutes = Math.max(1, Math.ceil(words / 200));
  const fileSizeBytes = sizeBytes ?? new Blob([content]).size;

  return {
    words,
    characters,
    lines,
    readingTimeMinutes,
    fileSizeBytes,
  };
}

/**
 * Formats byte size into human readable string
 */
export function formatBytes(bytes: number, decimals = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

/**
 * Renders Markdown into safe HTML with syntax highlighting, custom anchors,
 * task lists, and safe external links.
 */
/**
 * Helper to annotate line numbers on marked tokens
 */
function annotateTokenLines(tokens: any[], fullMarkdown: string) {
  let charIndex = 0;
  for (const token of tokens) {
    if (!token.raw) continue;
    const foundIdx = fullMarkdown.indexOf(token.raw, charIndex);
    if (foundIdx !== -1) {
      charIndex = foundIdx;
      const startChar = charIndex;
      const endChar = charIndex + token.raw.length;
      charIndex = endChar;

      const startLine = fullMarkdown.substring(0, startChar).split('\n').length;
      const rawTrim = token.raw.endsWith('\n') ? token.raw.slice(0, -1) : token.raw;
      const endLine = Math.max(startLine, fullMarkdown.substring(0, startChar + rawTrim.length).split('\n').length);

      token.startLine = startLine;
      token.endLine = endLine;

      if (token.items && Array.isArray(token.items)) {
        let itemChar = startChar;
        for (const item of token.items) {
          if (item.raw) {
            const itemIdx = fullMarkdown.indexOf(item.raw, itemChar);
            if (itemIdx !== -1) {
              itemChar = itemIdx;
              const itemTrim = item.raw.endsWith('\n') ? item.raw.slice(0, -1) : item.raw;
              item.startLine = fullMarkdown.substring(0, itemChar).split('\n').length;
              item.endLine = Math.max(item.startLine, fullMarkdown.substring(0, itemChar + itemTrim.length).split('\n').length);
              itemChar = itemChar + item.raw.length;
            }
          }
        }
      }
    }
  }
}

/**
 * Checks if any line within [startLine, endLine] has diff status
 */
function getDiffStatusForRange(
  startLine?: number,
  endLine?: number,
  diffLineStatus?: Map<number, { type: 'added' | 'removed' | 'modified'; diffItemId: string }>
): { type: 'added' | 'removed' | 'modified'; diffItemId: string; lineNumber: number } | undefined {
  if (!diffLineStatus || !startLine || !endLine) return undefined;
  for (let l = startLine; l <= endLine; l++) {
    const s = diffLineStatus.get(l);
    if (s) {
      return { ...s, lineNumber: l };
    }
  }
  return undefined;
}

/**
 * Wraps HTML content with a visual diff container, border, and badge
 */
function wrapWithDiffBadge(
  innerHtml: string,
  diff: { type: 'added' | 'removed' | 'modified'; diffItemId: string; lineNumber: number },
  isSelected: boolean
): string {
  let badgeLabel = '';
  let badgeClass = '';
  let containerClass = '';
  let borderLeftColor = '';

  if (diff.type === 'added') {
    badgeLabel = `+ Dodato (Linija ${diff.lineNumber})`;
    badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60';
    containerClass = 'bg-emerald-50/70 dark:bg-emerald-950/30';
    borderLeftColor = 'border-l-4 border-emerald-500';
  } else if (diff.type === 'removed') {
    badgeLabel = `- Uklonjeno (Linija ${diff.lineNumber})`;
    badgeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60';
    containerClass = 'bg-rose-50/70 dark:bg-rose-950/30';
    borderLeftColor = 'border-l-4 border-rose-500';
  } else {
    badgeLabel = `~ Izmenjeno (Linija ${diff.lineNumber})`;
    badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60';
    containerClass = 'bg-amber-50/70 dark:bg-amber-950/30';
    borderLeftColor = 'border-l-4 border-amber-500';
  }

  const selectedClass = isSelected
    ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-md ring-offset-2 dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-950/40'
    : '';

  return `
    <div
      id="diff-rendered-${diff.diffItemId}"
      data-diff-id="${diff.diffItemId}"
      data-diff-type="${diff.type}"
      data-diff-line="${diff.lineNumber}"
      class="diff-rendered-block group relative my-3 p-3 rounded-r-xl transition duration-200 cursor-pointer ${containerClass} ${borderLeftColor} ${selectedClass}"
      title="Kliknite za detalje ove razlike (${badgeLabel})"
    >
      <div class="flex items-center justify-between gap-2 mb-2 select-none">
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase tracking-wider ${badgeClass}">
          <span>${badgeLabel}</span>
        </span>
        ${isSelected ? '<span class="px-2 py-0.5 rounded text-[10px] font-medium bg-indigo-600 text-white shadow-xs font-sans">Aktivna razlika</span>' : ''}
      </div>
      <div class="diff-rendered-content">
        ${innerHtml}
      </div>
    </div>
  `;
}

/**
 * Renders Markdown into safe HTML with syntax highlighting, custom anchors,
 * task lists, safe external links, and optional Diff highlights.
 */
export function renderMarkdownToHtml(
  markdown: string,
  showLineNumbersInCode = true,
  diffLineStatus?: Map<number, { type: 'added' | 'removed' | 'modified'; diffItemId: string }>,
  selectedDiffId?: string | null
): string {
  const slugCounts: Record<string, number> = {};

  const renderer = new marked.Renderer();

  // Custom Heading Renderer with duplicate ID handling and diff tagging
  renderer.heading = (token) => {
    const text = renderer.parser.parseInline(token.tokens);
    const plainText = text.replace(/<[^>]+>/g, '').trim();
    const baseSlug = slugify(plainText) || `heading-${token.depth}`;
    let finalSlug = baseSlug;

    if (slugCounts[baseSlug] !== undefined) {
      slugCounts[baseSlug]++;
      finalSlug = `${baseSlug}-${slugCounts[baseSlug]}`;
    } else {
      slugCounts[baseSlug] = 0;
    }

    const headingHtml = `
      <h${token.depth} id="${finalSlug}" class="md-heading group relative flex items-center scroll-mt-20">
        <span class="md-heading-text">${text}</span>
        <a href="#${finalSlug}" class="heading-anchor opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-primary-500 hover:text-primary-600 no-underline" title="Kopiraj direktan link" aria-label="Sidro za ${plainText}">
          #
        </a>
      </h${token.depth}>
    `;

    const diff = getDiffStatusForRange((token as any).startLine, (token as any).endLine, diffLineStatus);
    if (diff) {
      const isSelected = selectedDiffId === diff.diffItemId;
      return wrapWithDiffBadge(headingHtml, diff, isSelected);
    }

    return headingHtml;
  };

  // Custom Paragraph Renderer with diff tagging
  renderer.paragraph = (token) => {
    const text = renderer.parser.parseInline(token.tokens);
    const diff = getDiffStatusForRange((token as any).startLine, (token as any).endLine, diffLineStatus);
    if (diff) {
      const isSelected = selectedDiffId === diff.diffItemId;
      return wrapWithDiffBadge(`<p class="md-paragraph">${text}</p>`, diff, isSelected);
    }
    return `<p class="md-paragraph">${text}</p>`;
  };

  // Custom Code Block Renderer with Syntax Highlighting, Diff lines, and Copy Button
  renderer.code = (token) => {
    const text = token.text;
    const lang = token.lang;
    const validLang = lang && hljs.getLanguage(lang) ? lang : '';
    let highlighted: string;
    try {
      if (validLang) {
        highlighted = hljs.highlight(text, { language: validLang }).value;
      } else {
        highlighted = hljs.highlightAuto(text).value;
      }
    } catch {
      highlighted = DOMPurify.sanitize(text);
    }

    const lines = highlighted.split('\n');
    const codeStartLine = (token as any).startLine ? (token as any).startLine + 1 : 1;
    let codeHtml: string;

    codeHtml = lines
      .map((line, index) => {
        const sourceLine = codeStartLine + index;
        const lineDiff = diffLineStatus?.get(sourceLine);
        let lineDiffClass = '';
        let linePrefix = '';

        if (lineDiff) {
          if (lineDiff.type === 'added') {
            lineDiffClass = ' bg-emerald-500/20 text-emerald-200 font-semibold';
            linePrefix = '+ ';
          } else if (lineDiff.type === 'removed') {
            lineDiffClass = ' bg-rose-500/20 text-rose-200 font-semibold';
            linePrefix = '- ';
          } else if (lineDiff.type === 'modified') {
            lineDiffClass = ' bg-amber-500/20 text-amber-200 font-semibold';
            linePrefix = '~ ';
          }
        }

        const lineNum = showLineNumbersInCode
          ? `<span class="line-number select-none text-slate-400 dark:text-slate-500 pr-3 inline-block text-right w-8">${linePrefix}${index + 1}</span>`
          : '';

        return `<span class="code-line block ${lineDiffClass}">${lineNum}<span class="line-content">${line || ' '}</span></span>`;
      })
      .join('\n');

    const displayLang = (validLang || lang || 'text').toUpperCase();
    const encodedRawCode = encodeURIComponent(text);

    const blockHtml = `
      <div class="code-block-wrapper my-5 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-900 text-slate-100 shadow-sm">
        <div class="code-block-header flex items-center justify-between px-4 py-2 bg-slate-950/70 border-b border-slate-800 text-xs font-mono text-slate-400">
          <span class="font-medium tracking-wide text-slate-300">${displayLang}</span>
          <button type="button" class="copy-code-btn flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-sans text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition cursor-pointer" data-code="${encodedRawCode}">
            <svg class="w-3.5 h-3.5 copy-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            <span class="copy-label">Kopiraj</span>
          </button>
        </div>
        <pre class="p-4 overflow-x-auto text-sm font-mono leading-relaxed"><code class="hljs language-${validLang}">${codeHtml}</code></pre>
      </div>
    `;

    const diff = getDiffStatusForRange((token as any).startLine, (token as any).endLine, diffLineStatus);
    if (diff) {
      const isSelected = selectedDiffId === diff.diffItemId;
      return wrapWithDiffBadge(blockHtml, diff, isSelected);
    }

    return blockHtml;
  };

  // Custom List Item Renderer with diff tagging
  renderer.listitem = (token) => {
    const itemDiff = getDiffStatusForRange((token as any).startLine, (token as any).endLine, diffLineStatus);
    const body = renderer.parser.parse(token.tokens);

    if (itemDiff) {
      const isSelected = selectedDiffId === itemDiff.diffItemId;
      let badgeClass = '';
      let containerClass = '';
      let symbol = '';

      if (itemDiff.type === 'added') {
        badgeClass = 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700/60';
        containerClass = 'bg-emerald-50/70 dark:bg-emerald-950/30 border-l-4 border-emerald-500';
        symbol = '+';
      } else if (itemDiff.type === 'removed') {
        badgeClass = 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700/60';
        containerClass = 'bg-rose-50/70 dark:bg-rose-950/30 border-l-4 border-rose-500';
        symbol = '-';
      } else {
        badgeClass = 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700/60';
        containerClass = 'bg-amber-50/70 dark:bg-amber-950/30 border-l-4 border-amber-500';
        symbol = '~';
      }

      const selectedClass = isSelected
        ? 'ring-2 ring-indigo-500 dark:ring-indigo-400 shadow-md ring-offset-2 dark:ring-offset-slate-900 bg-indigo-50/40 dark:bg-indigo-950/40'
        : '';

      return `
        <li
          id="diff-rendered-${itemDiff.diffItemId}"
          data-diff-id="${itemDiff.diffItemId}"
          data-diff-type="${itemDiff.type}"
          data-diff-line="${itemDiff.lineNumber}"
          class="diff-rendered-block my-1.5 p-2 rounded-r-lg transition cursor-pointer ${containerClass} ${selectedClass}"
          title="Kliknite za detalje ove razlike"
        >
          <span class="inline-flex items-center gap-1 px-1.5 py-0.2 mr-2 rounded text-[10px] font-mono font-bold ${badgeClass}">
            ${symbol} Linija ${itemDiff.lineNumber}
          </span>
          ${body}
        </li>
      `;
    }

    return `<li>${body}</li>`;
  };

  // Custom Table Renderer with wrapper for responsive horizontal scrolling
  renderer.table = (token) => {
    const header = token.header;
    const rows = token.rows;

    let headerHtml = '<tr>';
    for (let i = 0; i < header.length; i++) {
      const cell = header[i];
      const align = token.align[i] ? ` style="text-align:${token.align[i]}"` : '';
      headerHtml += `<th${align} class="px-4 py-3 bg-slate-100 dark:bg-slate-800/80 font-semibold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 text-left">${renderer.parser.parseInline(cell.tokens)}</th>`;
    }
    headerHtml += '</tr>';

    let bodyHtml = '';
    for (const row of rows) {
      bodyHtml += '<tr class="border-b border-slate-100 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">';
      for (let i = 0; i < row.length; i++) {
        const cell = row[i];
        const align = token.align[i] ? ` style="text-align:${token.align[i]}"` : '';
        bodyHtml += `<td${align} class="px-4 py-3 text-slate-700 dark:text-slate-300">${renderer.parser.parseInline(cell.tokens)}</td>`;
      }
      bodyHtml += '</tr>';
    }

    const tableHtml = `
      <div class="table-container my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <table class="w-full text-sm text-left border-collapse">
          <thead>${headerHtml}</thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
    `;

    const diff = getDiffStatusForRange((token as any).startLine, (token as any).endLine, diffLineStatus);
    if (diff) {
      const isSelected = selectedDiffId === diff.diffItemId;
      return wrapWithDiffBadge(tableHtml, diff, isSelected);
    }

    return tableHtml;
  };

  // Custom Link Renderer (Safe links with target="_blank" and rel="noopener noreferrer")
  renderer.link = ({ href, title, tokens }) => {
    const text = renderer.parser.parseInline(tokens);
    const isAnchor = href.startsWith('#');
    const safeHref = href.startsWith('javascript:') ? '#' : href;
    const titleAttr = title ? ` title="${title}"` : '';

    if (isAnchor) {
      return `<a href="${safeHref}"${titleAttr} class="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 transition">${text}</a>`;
    }

    return `<a href="${safeHref}" target="_blank" rel="noopener noreferrer"${titleAttr} class="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:text-blue-800 dark:hover:text-blue-300 transition inline-flex items-center gap-0.5">${text}<svg class="w-3 h-3 inline ml-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>`;
  };

  // Custom Image Renderer with Lightbox support & Error fallback
  renderer.image = ({ href, title, text }) => {
    const safeHref = href.startsWith('javascript:') ? '' : href;
    const titleAttr = title ? ` title="${title}"` : '';
    const altText = text || 'Slika';

    return `
      <figure class="my-6 inline-block max-w-full">
        <div class="relative group cursor-zoom-in overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800/40">
          <img 
            src="${safeHref}" 
            alt="${altText}" 
            ${titleAttr}
            class="md-preview-img max-h-[600px] w-auto max-w-full rounded-xl transition duration-300 group-hover:scale-[1.01]"
            loading="lazy"
            onerror="this.onerror=null; this.parentElement.innerHTML='<div class=\\'p-4 text-xs text-rose-500 bg-rose-50 dark:bg-rose-950/40 rounded-lg flex items-center gap-2\\'><span>⚠️ Slika nije dostupna:</span> <code>${safeHref}</code></div>';"
          />
          <div class="absolute inset-0 bg-slate-900/10 opacity-0 group-hover:opacity-100 transition flex items-end justify-end p-2 pointer-events-none">
            <span class="bg-black/60 backdrop-blur-sm text-white text-[11px] px-2 py-1 rounded-md font-medium">Uvećaj</span>
          </div>
        </div>
        ${altText ? `<figcaption class="mt-2 text-xs text-slate-500 dark:text-slate-400 text-center italic">${altText}</figcaption>` : ''}
      </figure>
    `;
  };

  // Task list checkbox renderer
  renderer.checkbox = ({ checked }) => {
    return `<input type="checkbox" ${checked ? 'checked' : ''} disabled class="w-4 h-4 mr-2 rounded text-blue-600 border-slate-300 dark:border-slate-600 focus:ring-0 align-middle inline-block cursor-default" />`;
  };

  // Custom Blockquote
  renderer.blockquote = (token) => {
    const body = renderer.parser.parse(token.tokens);
    const quoteHtml = `<blockquote class="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-2 my-4 rounded-r-lg text-slate-700 dark:text-slate-300 italic">${body}</blockquote>`;
    const diff = getDiffStatusForRange((token as any).startLine, (token as any).endLine, diffLineStatus);
    if (diff) {
      const isSelected = selectedDiffId === diff.diffItemId;
      return wrapWithDiffBadge(quoteHtml, diff, isSelected);
    }
    return quoteHtml;
  };

  // Parse markdown with annotated lines
  const tokens = marked.lexer(markdown, { gfm: true, breaks: true });
  annotateTokenLines(tokens, markdown);

  const parser = new marked.Parser({
    renderer,
    gfm: true,
    breaks: true,
  });

  const rawHtml = parser.parse(tokens);

  // Sanitize with DOMPurify to strictly prevent XSS while allowing formatting, diff markers & SVGs
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['input', 'span', 'div'],
    ADD_ATTR: [
      'target',
      'rel',
      'data-code',
      'onerror',
      'loading',
      'checked',
      'disabled',
      'data-diff-id',
      'data-diff-type',
      'data-diff-line',
    ],
  });

  return cleanHtml;
}
