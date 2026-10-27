import {
  Document,
  Paragraph,
  HeadingLevel,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  Packer,
  AlignmentType,
} from 'docx';
import { renderMarkdownToHtml } from './markdown';
import { ViewerSettings } from '../types';

/**
 * Converts Markdown text to clean Plain Text format according to Specification 8.2 & AC-11:
 * - Strips markdown tags (#, **, *, ~~, `)
 * - Retains clean structure and headings
 * - Formats links as: Text (URL)
 * - Retains lists and code block contents
 * - Retains Unicode UTF-8
 */
export function markdownToPlainText(markdown: string): string {
  const lines = markdown.split(/\r?\n/);
  const resultLines: string[] = [];
  let inCodeBlock = false;

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];

    // Code block fences
    if (rawLine.trim().startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      continue;
    }

    if (inCodeBlock) {
      resultLines.push(rawLine);
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(rawLine.trim())) {
      resultLines.push('----------------------------------------');
      continue;
    }

    // Headings H1-H6
    const headingMatch = rawLine.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const headingLevel = headingMatch[1].length;
      const headingText = cleanInlineMarkdown(headingMatch[2].trim());
      if (headingLevel === 1) {
        resultLines.push('');
        resultLines.push(headingText.toUpperCase());
        resultLines.push('='.repeat(Math.max(headingText.length, 10)));
      } else if (headingLevel === 2) {
        resultLines.push('');
        resultLines.push(headingText);
        resultLines.push('-'.repeat(Math.max(headingText.length, 10)));
      } else {
        resultLines.push('');
        resultLines.push(headingText);
      }
      continue;
    }

    // Task list checkbox
    let processedLine = rawLine.replace(/^(\s*[-*+]\s+)\[ \]\s+/i, '$1[ ] ');
    processedLine = processedLine.replace(/^(\s*[-*+]\s+)\[x\]\s+/i, '$1[X] ');

    // Blockquote
    if (/^\s*>\s*/.test(processedLine)) {
      processedLine = processedLine.replace(/^\s*>\s*/, '| ');
    }

    // Clean inline formatting
    const cleaned = cleanInlineMarkdown(processedLine);
    resultLines.push(cleaned);
  }

  return resultLines.join('\n');
}

/**
 * Helper to strip inline markdown while formatting links as "Text (URL)"
 */
function cleanInlineMarkdown(text: string): string {
  let cleaned = text;

  // Images: ![alt](url) -> [Slika: alt] or alt
  cleaned = cleaned.replace(/!\[([^\]]*)\]\([^)]+\)/g, (_, alt) => (alt ? `[Slika: ${alt}]` : ''));

  // Links: [text](url) -> text (url)
  cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1 ($2)');

  // Bold & Italic: ***text*** or ___text___
  cleaned = cleaned.replace(/(\*\*\*|___)(.*?)\1/g, '$2');

  // Bold: **text** or __text__
  cleaned = cleaned.replace(/(\*\*|__)(.*?)\1/g, '$2');

  // Italic: *text* or _text_
  cleaned = cleaned.replace(/(\*|_)(.*?)\1/g, '$2');

  // Strikethrough: ~~text~~
  cleaned = cleaned.replace(/~~(.*?)~~/g, '$1');

  // Inline code: `code`
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');

  return cleaned;
}

/**
 * Triggers download of plain text file
 */
export function exportToTxt(markdown: string, baseFilename: string): void {
  const plainText = markdownToPlainText(markdown);
  const blob = new Blob([plainText], { type: 'text/plain;charset=utf-8' });
  const filename = baseFilename.replace(/\.[^/.]+$/, '') + '.txt';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Converts Markdown to a native Microsoft Word (.docx) document according to Specification 8.1 & AC-10.
 * Respects user's active ViewerSettings (font family, font size, page margins / column width, line spacing).
 */
export async function exportToDocx(
  markdown: string,
  baseFilename: string,
  settings?: ViewerSettings
): Promise<void> {
  const lines = markdown.split(/\r?\n/);
  const docElements: (Paragraph | Table)[] = [];

  // 1. Resolve Font Family for DOCX
  const docxFont =
    settings?.fontFamily === 'serif'
      ? 'Georgia'
      : settings?.fontFamily === 'mono'
      ? 'Consolas'
      : 'Calibri';

  // 2. Resolve Font Sizes in half-points (1 pt = 2 half-points)
  const sizeMap: Record<
    string,
    { body: number; h1: number; h2: number; h3: number; h4: number; code: number; table: number }
  > = {
    sm: { body: 20, h1: 30, h2: 26, h3: 23, h4: 21, code: 17, table: 18 }, // 10pt body
    base: { body: 23, h1: 34, h2: 30, h3: 26, h4: 24, code: 19, table: 21 }, // 11.5pt body
    lg: { body: 26, h1: 38, h2: 34, h3: 30, h4: 27, code: 22, table: 24 }, // 13pt body
    xl: { body: 30, h1: 44, h2: 38, h3: 34, h4: 30, code: 25, table: 27 }, // 15pt body
  };
  const fontSizes = sizeMap[settings?.fontSize || 'base'] || sizeMap.base;

  // 3. Resolve Margins in twips (1 inch = 1440 twips) based on contentWidth setting
  // 'narrow' = wide margins (2160 twips / 1.5 in)
  // 'standard' = standard margins (1440 twips / 1.0 in)
  // 'wide' = narrower margins (1080 twips / 0.75 in)
  // 'full' = minimal margins (720 twips / 0.5 in)
  let marginTwips = 1440;
  switch (settings?.contentWidth) {
    case 'narrow':
      marginTwips = 2160;
      break;
    case 'standard':
      marginTwips = 1440;
      break;
    case 'wide':
      marginTwips = 1080;
      break;
    case 'full':
      marginTwips = 720;
      break;
  }

  // 4. Resolve Line Spacing rule in twips
  // 240 = single, 276 = 1.15x, 360 = 1.5x
  const lineSpacingRule =
    settings?.lineSpacing === 'compact'
      ? 240
      : settings?.lineSpacing === 'relaxed'
      ? 360
      : 276;

  let inCodeBlock = false;
  let codeBuffer: string[] = [];

  let inTable = false;
  let tableRowsBuffer: string[][] = [];

  const flushCodeBlock = () => {
    if (codeBuffer.length === 0) return;
    const codeText = codeBuffer.join('\n');
    docElements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: codeText,
            font: 'Consolas',
            size: fontSizes.code,
            color: '1E293B',
          }),
        ],
        spacing: { before: 120, after: 120, line: 240 },
        shading: {
          color: 'F1F5F9',
        },
        border: {
          top: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
          left: { style: BorderStyle.SINGLE, size: 3, color: '3B82F6' },
          right: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
        },
      })
    );
    codeBuffer = [];
    inCodeBlock = false;
  };

  const flushTable = () => {
    if (tableRowsBuffer.length === 0) return;
    try {
      const tableRows = tableRowsBuffer.map((rowCells, rowIndex) => {
        const isHeader = rowIndex === 0;
        return new TableRow({
          tableHeader: isHeader,
          children: rowCells.map(
            (cellText) =>
              new TableCell({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: cleanInlineMarkdown(cellText.trim()),
                        font: docxFont,
                        bold: isHeader,
                        size: fontSizes.table,
                        color: isHeader ? '0F172A' : '334155',
                      }),
                    ],
                  }),
                ],
                shading: isHeader ? { color: 'F1F5F9' } : undefined,
                borders: {
                  top: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                  bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CBD5E1' },
                  left: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                  right: { style: BorderStyle.SINGLE, size: 1, color: 'E2E8F0' },
                },
              })
          ),
        });
      });

      docElements.push(
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          rows: tableRows,
        })
      );
      // Extra spacing after table
      docElements.push(new Paragraph({ spacing: { after: 180 } }));
    } catch {
      // If table parsing fails, ignore to preserve rest of document
    }
    tableRowsBuffer = [];
    inTable = false;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block fence
    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        flushCodeBlock();
      } else {
        inCodeBlock = true;
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Table rows (| cell | cell |)
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      // Check if it's separator row like |:---|---:|
      if (/^\|(\s*:?-+:?\s*\|)+$/.test(line.trim())) {
        continue;
      }
      inTable = true;
      const cells = line
        .trim()
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      tableRowsBuffer.push(cells);
      continue;
    } else if (inTable) {
      flushTable();
    }

    // Headings H1-H6
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = cleanInlineMarkdown(headingMatch[2].trim());

      const headingMap: Record<number, (typeof HeadingLevel)[keyof typeof HeadingLevel]> = {
        1: HeadingLevel.HEADING_1,
        2: HeadingLevel.HEADING_2,
        3: HeadingLevel.HEADING_3,
        4: HeadingLevel.HEADING_4,
        5: HeadingLevel.HEADING_5,
        6: HeadingLevel.HEADING_6,
      };

      const headingSizes: Record<number, number> = {
        1: fontSizes.h1,
        2: fontSizes.h2,
        3: fontSizes.h3,
        4: fontSizes.h4,
        5: fontSizes.h4,
        6: fontSizes.h4,
      };

      docElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: headingText,
              font: docxFont,
              size: headingSizes[level] || fontSizes.h1,
              bold: true,
              color: level === 1 ? '0F172A' : level === 2 ? '1E293B' : '334155',
            }),
          ],
          heading: headingMap[level] || HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120, line: lineSpacingRule },
        })
      );
      continue;
    }

    // Horizontal rule
    if (/^(\*{3,}|-{3,}|_{3,})$/.test(line.trim())) {
      docElements.push(
        new Paragraph({
          border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: '94A3B8' } },
          spacing: { before: 180, after: 180 },
        })
      );
      continue;
    }

    // Blockquote (> text)
    if (/^\s*>\s*(.+)/.test(line)) {
      const quoteText = line.replace(/^\s*>\s*/, '');
      docElements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: cleanInlineMarkdown(quoteText),
              font: docxFont,
              size: fontSizes.body,
              italics: true,
              color: '475569',
            }),
          ],
          indent: { left: 400 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: '3B82F6' },
          },
          spacing: { before: 100, after: 100, line: lineSpacingRule },
        })
      );
      continue;
    }

    // Bullet list (- item or * item)
    if (/^\s*[-*+]\s+(.+)/.test(line)) {
      const itemMatch = line.match(/^\s*[-*+]\s+(.+)/);
      if (itemMatch) {
        const itemText = cleanInlineMarkdown(itemMatch[1]);
        docElements.push(
          new Paragraph({
            bullet: { level: 0 },
            children: [
              new TextRun({
                text: itemText,
                font: docxFont,
                size: fontSizes.body,
              }),
            ],
            spacing: { before: 40, after: 40, line: lineSpacingRule },
          })
        );
        continue;
      }
    }

    // Numbered list (1. item)
    if (/^\s*(\d+)\.\s+(.+)/.test(line)) {
      const numMatch = line.match(/^\s*(\d+)\.\s+(.+)/);
      if (numMatch) {
        const itemText = cleanInlineMarkdown(numMatch[2]);
        docElements.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `${numMatch[1]}. `,
                font: docxFont,
                size: fontSizes.body,
                bold: true,
              }),
              new TextRun({
                text: itemText,
                font: docxFont,
                size: fontSizes.body,
              }),
            ],
            spacing: { before: 40, after: 40, line: lineSpacingRule },
          })
        );
        continue;
      }
    }

    // Normal paragraph
    if (line.trim().length > 0) {
      docElements.push(
        new Paragraph({
          children: parseInlineRuns(line, docxFont, fontSizes.body, fontSizes.code),
          spacing: { before: 60, after: 80, line: lineSpacingRule },
        })
      );
    }
  }

  if (inCodeBlock) flushCodeBlock();
  if (inTable) flushTable();

  // Create docx Document with custom styles and page margins
  const doc = new Document({
    styles: {
      default: {
        document: {
          run: {
            font: docxFont,
            size: fontSizes.body,
          },
          paragraph: {
            spacing: {
              line: lineSpacingRule,
            },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              bottom: 1440,
              left: marginTwips,
              right: marginTwips,
            },
          },
        },
        children: docElements.length > 0 ? docElements : [new Paragraph({ text: '' })],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = baseFilename.replace(/\.[^/.]+$/, '') + '.docx';

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Parses inline bold, italic, and code text into docx TextRuns with user's font and size
 */
function parseInlineRuns(
  line: string,
  font: string = 'Calibri',
  bodySize: number = 23,
  codeSize: number = 19
): TextRun[] {
  const runs: TextRun[] = [];
  // Tokenize bold, italic, code, or plain text
  const regex = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      runs.push(
        new TextRun({
          text: line.substring(lastIndex, match.index),
          font,
          size: bodySize,
        })
      );
    }

    if (match[1]) {
      // Bold + Italic
      runs.push(
        new TextRun({
          text: match[2],
          font,
          size: bodySize,
          bold: true,
          italics: true,
        })
      );
    } else if (match[3]) {
      // Bold
      runs.push(
        new TextRun({
          text: match[4],
          font,
          size: bodySize,
          bold: true,
        })
      );
    } else if (match[5]) {
      // Italic
      runs.push(
        new TextRun({
          text: match[6],
          font,
          size: bodySize,
          italics: true,
        })
      );
    } else if (match[7]) {
      // Inline Code
      runs.push(
        new TextRun({
          text: match[7],
          font: 'Consolas',
          size: codeSize,
          color: 'BE185D',
        })
      );
    } else if (match[8] && match[9]) {
      // Link: Text (URL)
      runs.push(
        new TextRun({
          text: match[8],
          font,
          size: bodySize,
          color: '2563EB',
          underline: {},
        })
      );
      runs.push(
        new TextRun({
          text: ` (${match[9]})`,
          font,
          size: bodySize,
          color: '64748B',
        })
      );
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    runs.push(
      new TextRun({
        text: line.substring(lastIndex),
        font,
        size: bodySize,
      })
    );
  }

  return runs.length > 0 ? runs : [new TextRun({ text: line, font, size: bodySize })];
}

/**
 * Exports markdown document as a self-contained, standalone HTML file
 * with faithful styling, typography, code highlighting, tables, and copy functionality.
 */
export async function exportToHtml(
  markdown: string,
  baseFilename: string,
  settings?: ViewerSettings
): Promise<void> {
  const cleanTitle = baseFilename.replace(/\.[^/.]+$/, '') || 'Dokument';
  const filename = `${cleanTitle}.html`;
  const renderedHtml = renderMarkdownToHtml(markdown, settings?.showLineNumbersInCode ?? true);

  const fullHtml = `<!DOCTYPE html>
<html lang="sr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(cleanTitle)}</title>
  <style>
    :root {
      --bg: #ffffff;
      --text: #0f172a;
      --text-muted: #64748b;
      --border: #e2e8f0;
      --code-bg: #0f172a;
      --code-text: #e2e8f0;
      --quote-bg: #f8fafc;
      --quote-border: #3b82f6;
      --table-header: #f1f5f9;
      --table-border: #e2e8f0;
      --table-row-alt: #f8fafc;
      --inline-code-bg: rgba(148, 163, 184, 0.15);
      --inline-code-color: #db2777;
    }

    @media (prefers-color-scheme: dark) {
      :root {
        --bg: #090d16;
        --text: #f8fafc;
        --text-muted: #94a3b8;
        --border: #1e293b;
        --code-bg: #020617;
        --code-text: #f8fafc;
        --quote-bg: rgba(30, 41, 59, 0.5);
        --quote-border: #3b82f6;
        --table-header: #1e293b;
        --table-border: #334155;
        --table-row-alt: rgba(30, 41, 59, 0.3);
        --inline-code-bg: rgba(148, 163, 184, 0.2);
        --inline-code-color: #f472b6;
      }
    }

    body {
      margin: 0;
      padding: 0;
      background-color: var(--bg);
      color: var(--text);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
    }

    .container {
      max-width: 860px;
      margin: 40px auto;
      padding: 0 24px;
    }

    /* Markdown Body Styling */
    .markdown-body {
      word-wrap: break-word;
    }

    .markdown-body h1, .markdown-body h2, .markdown-body h3,
    .markdown-body h4, .markdown-body h5, .markdown-body h6 {
      color: inherit;
      font-weight: 700;
      margin-top: 1.8rem;
      margin-bottom: 0.8rem;
      line-height: 1.3;
    }

    .markdown-body h1 {
      font-size: 2.2rem;
      border-bottom: 2px solid var(--border);
      padding-bottom: 0.5rem;
      letter-spacing: -0.025em;
    }

    .markdown-body h2 {
      font-size: 1.65rem;
      border-bottom: 1px solid var(--border);
      padding-bottom: 0.4rem;
      letter-spacing: -0.02em;
    }

    .markdown-body h3 { font-size: 1.35rem; }
    .markdown-body h4 { font-size: 1.15rem; }
    .markdown-body h5 { font-size: 1rem; }
    .markdown-body h6 { font-size: 0.9rem; }

    .markdown-body p {
      margin: 1rem 0;
    }

    .markdown-body a {
      color: #2563eb;
      text-decoration: underline;
      text-underline-offset: 3px;
    }
    .markdown-body a:hover {
      color: #1d4ed8;
    }

    .markdown-body blockquote {
      border-left: 4px solid var(--quote-border);
      background: var(--quote-bg);
      padding: 10px 18px;
      margin: 1.25rem 0;
      border-radius: 0 8px 8px 0;
      color: var(--text-muted);
      font-style: italic;
    }

    .markdown-body hr {
      height: 2px;
      background: var(--border);
      border: 0;
      margin: 2.5rem 0;
    }

    .markdown-body ul, .markdown-body ol {
      padding-left: 1.75rem;
      margin: 1rem 0;
    }

    .markdown-body li {
      margin: 0.35rem 0;
    }

    .markdown-body code:not(pre code) {
      padding: 0.2em 0.45em;
      margin: 0 0.2em;
      font-size: 85%;
      border-radius: 6px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
      background-color: var(--inline-code-bg);
      color: var(--inline-code-color);
    }

    /* Syntax Highlighting */
    .hljs { color: #e2e8f0; background: transparent; }
    .hljs-keyword, .hljs-selector-tag, .hljs-subst { color: #f43f5e; font-weight: 600; }
    .hljs-string, .hljs-title, .hljs-section, .hljs-attribute, .hljs-literal, .hljs-template-tag, .hljs-type { color: #38bdf8; }
    .hljs-comment, .hljs-quote, .hljs-deletion { color: #64748b; font-style: italic; }
    .hljs-number, .hljs-regexp, .hljs-link { color: #f59e0b; }
    .hljs-variable, .hljs-punctuation { color: #cbd5e1; }
    .hljs-function, .hljs-class .hljs-title { color: #a855f7; font-weight: 600; }
    .hljs-symbol, .hljs-bullet { color: #ec4899; }
    .hljs-tag, .hljs-name { color: #3b82f6; }

    .code-block-wrapper {
      margin: 1.5rem 0;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid var(--border);
      background-color: var(--code-bg);
      color: var(--code-text);
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }

    .code-block-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 16px;
      background-color: rgba(2, 6, 23, 0.85);
      border-bottom: 1px solid rgba(51, 65, 85, 0.5);
      font-size: 11px;
      font-family: ui-monospace, monospace;
      color: #94a3b8;
    }

    .copy-code-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 11px;
      font-family: inherit;
      color: #cbd5e1;
      background-color: rgba(51, 65, 85, 0.8);
      border: none;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .copy-code-btn:hover {
      background-color: rgba(71, 85, 105, 1);
      color: #ffffff;
    }

    .code-block-wrapper pre {
      padding: 16px;
      margin: 0;
      overflow-x: auto;
      font-size: 13px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      line-height: 1.55;
    }

    .code-line {
      display: block;
    }

    .line-number {
      display: inline-block;
      width: 2.25rem;
      padding-right: 1rem;
      text-align: right;
      color: #64748b;
      user-select: none;
    }

    /* Tables */
    .table-container {
      width: 100%;
      overflow-x: auto;
      margin: 1.75rem 0;
      border-radius: 10px;
      border: 1px solid var(--table-border);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .table-container table {
      width: 100%;
      border-collapse: collapse;
      font-size: 13.5px;
    }

    .table-container th {
      background-color: var(--table-header);
      padding: 10px 14px;
      text-align: left;
      font-weight: 600;
      border-bottom: 2px solid var(--table-border);
    }

    .table-container td {
      padding: 10px 14px;
      border-bottom: 1px solid var(--table-border);
    }

    .table-container tbody tr:hover {
      background-color: var(--table-row-alt);
    }

    .markdown-body img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1rem 0;
    }

    .heading-anchor {
      text-decoration: none !important;
      opacity: 0.35;
      margin-left: 8px;
    }
    .heading-anchor:hover {
      opacity: 1;
    }

    @media print {
      body { background: white !important; color: black !important; }
      .container { max-width: 100%; margin: 0; padding: 0; }
      .copy-code-btn, .heading-anchor { display: none !important; }
      .code-block-wrapper { break-inside: avoid; border: 1px solid #cbd5e1; }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="markdown-body">
      ${renderedHtml}
    </div>
  </div>
  <script>
    document.querySelectorAll('.copy-code-btn').forEach(function(btn) {
      btn.addEventListener('click', function(e) {
        e.stopPropagation();
        var code = decodeURIComponent(btn.getAttribute('data-code') || '');
        if (code) {
          navigator.clipboard.writeText(code);
          var label = btn.querySelector('.copy-label');
          if (label) {
            var orig = label.textContent;
            label.textContent = 'Kopirano!';
            setTimeout(function() { label.textContent = orig; }, 2000);
          }
        }
      });
    });
  </script>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });

  // 1. Try File System Access API (showSaveFilePicker)
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: filename,
        types: [
          {
            description: 'HTML Dokument (*.html)',
            accept: {
              'text/html': ['.html', '.htm'],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(blob);
      await writable.close();
      return;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return;
      }
      console.warn('showSaveFilePicker failed for HTML, using download fallback:', err);
    }
  }

  // 2. Fallback: Browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 2000);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

