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
 * Maps H1-H6 to Word Heading styles, converts paragraphs, lists, code blocks, tables and blockquotes.
 */
export async function exportToDocx(markdown: string, baseFilename: string): Promise<void> {
  const lines = markdown.split(/\r?\n/);
  const docElements: (Paragraph | Table)[] = [];

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
            size: 19, // 9.5 pt
            color: '1E293B',
          }),
        ],
        spacing: { before: 120, after: 120 },
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
                        bold: isHeader,
                        size: 21,
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

      docElements.push(
        new Paragraph({
          text: headingText,
          heading: headingMap[level] || HeadingLevel.HEADING_1,
          spacing: { before: 240, after: 120 },
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
              italics: true,
              color: '475569',
            }),
          ],
          indent: { left: 400 },
          border: {
            left: { style: BorderStyle.SINGLE, size: 6, color: '3B82F6' },
          },
          spacing: { before: 100, after: 100 },
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
            children: [new TextRun(itemText)],
            spacing: { before: 40, after: 40 },
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
              new TextRun({ text: `${numMatch[1]}. `, bold: true }),
              new TextRun(itemText),
            ],
            spacing: { before: 40, after: 40 },
          })
        );
        continue;
      }
    }

    // Normal paragraph
    if (line.trim().length > 0) {
      docElements.push(
        new Paragraph({
          children: parseInlineRuns(line),
          spacing: { before: 60, after: 80 },
        })
      );
    }
  }

  if (inCodeBlock) flushCodeBlock();
  if (inTable) flushTable();

  // Create docx Document
  const doc = new Document({
    sections: [
      {
        properties: {},
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
 * Parses inline bold, italic, and code text into docx TextRuns
 */
function parseInlineRuns(line: string): TextRun[] {
  const runs: TextRun[] = [];
  // Tokenize bold, italic, code, or plain text
  const regex = /(\*\*\*|___)(.*?)\1|(\*\*|__)(.*?)\3|(\*|_)(.*?)\5|`([^`]+)`|\[([^\]]+)\]\(([^)]+)\)/g;

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      runs.push(new TextRun(line.substring(lastIndex, match.index)));
    }

    if (match[1]) {
      // Bold + Italic
      runs.push(new TextRun({ text: match[2], bold: true, italics: true }));
    } else if (match[3]) {
      // Bold
      runs.push(new TextRun({ text: match[4], bold: true }));
    } else if (match[5]) {
      // Italic
      runs.push(new TextRun({ text: match[6], italics: true }));
    } else if (match[7]) {
      // Inline Code
      runs.push(
        new TextRun({
          text: match[7],
          font: 'Consolas',
          size: 19,
          color: 'BE185D',
        })
      );
    } else if (match[8] && match[9]) {
      // Link: Text (URL)
      runs.push(new TextRun({ text: match[8], color: '2563EB', underline: {} }));
      runs.push(new TextRun({ text: ` (${match[9]})`, color: '64748B' }));
    }

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < line.length) {
    runs.push(new TextRun(line.substring(lastIndex)));
  }

  return runs.length > 0 ? runs : [new TextRun(line)];
}
