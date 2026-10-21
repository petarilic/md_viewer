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
export function renderMarkdownToHtml(markdown: string, showLineNumbersInCode = true): string {
  const slugCounts: Record<string, number> = {};

  const renderer = new marked.Renderer();

  // Custom Heading Renderer with duplicate ID handling
  renderer.heading = ({ tokens, depth }) => {
    const text = renderer.parser.parseInline(tokens);
    const plainText = text.replace(/<[^>]+>/g, '').trim();
    const baseSlug = slugify(plainText) || `heading-${depth}`;
    let finalSlug = baseSlug;

    if (slugCounts[baseSlug] !== undefined) {
      slugCounts[baseSlug]++;
      finalSlug = `${baseSlug}-${slugCounts[baseSlug]}`;
    } else {
      slugCounts[baseSlug] = 0;
    }

    return `
      <h${depth} id="${finalSlug}" class="md-heading group relative flex items-center scroll-mt-20">
        <span class="md-heading-text">${text}</span>
        <a href="#${finalSlug}" class="heading-anchor opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-primary-500 hover:text-primary-600 no-underline" title="Kopiraj direktan link" aria-label="Sidro za ${plainText}">
          #
        </a>
      </h${depth}>
    `;
  };

  // Custom Code Block Renderer with Syntax Highlighting and Copy Button
  renderer.code = ({ text, lang }) => {
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
    let codeHtml: string;

    if (showLineNumbersInCode) {
      codeHtml = lines
        .map((line, index) => {
          return `<span class="code-line"><span class="line-number select-none text-slate-400 dark:text-slate-500 pr-4 inline-block text-right w-8">${index + 1}</span><span class="line-content">${line || ' '}</span></span>`;
        })
        .join('\n');
    } else {
      codeHtml = highlighted;
    }

    const displayLang = (validLang || lang || 'text').toUpperCase();
    const encodedRawCode = encodeURIComponent(text);

    return `
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

    return `
      <div class="table-container my-6 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <table class="w-full text-sm text-left border-collapse">
          <thead>${headerHtml}</thead>
          <tbody>${bodyHtml}</tbody>
        </table>
      </div>
    `;
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
  renderer.blockquote = ({ tokens }) => {
    const body = renderer.parser.parse(tokens);
    return `<blockquote class="border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-950/20 px-4 py-2 my-4 rounded-r-lg text-slate-700 dark:text-slate-300 italic">${body}</blockquote>`;
  };

  // Parse markdown
  const rawHtml = marked(markdown, {
    renderer,
    gfm: true,
    breaks: true,
  }) as string;

  // Sanitize with DOMPurify to strictly prevent XSS while allowing formatting & SVGs
  const cleanHtml = DOMPurify.sanitize(rawHtml, {
    ADD_TAGS: ['input'],
    ADD_ATTR: ['target', 'rel', 'data-code', 'onerror', 'loading', 'checked', 'disabled'],
  });

  return cleanHtml;
}
