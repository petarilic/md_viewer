import { FontSize, PaperFormat } from '../types';

export interface PaperFormatOption {
  id: PaperFormat;
  name: string;
  widthMm: number;
  heightMm: number;
  dimensionsLabel: string;
  description: string;
  badge?: string;
  effectivePageHeightPx: number; // Printable height at standard 96 DPI (excluding margins)
  linesPerPage: number;
}

export const PAPER_FORMAT_OPTIONS: PaperFormatOption[] = [
  {
    id: 'a4',
    name: 'A4',
    widthMm: 210,
    heightMm: 297,
    dimensionsLabel: '210 × 297 mm',
    description: 'Međunarodni standard za kancelarijske i zvanične dokumente',
    badge: 'Standard',
    effectivePageHeightPx: 960,
    linesPerPage: 46,
  },
  {
    id: 'a3',
    name: 'A3',
    widthMm: 297,
    heightMm: 420,
    dimensionsLabel: '297 × 420 mm',
    description: 'Dvostruko veći format za grafikone, šeme i široke tabele',
    badge: 'Veliki',
    effectivePageHeightPx: 1400,
    linesPerPage: 70,
  },
  {
    id: 'a5',
    name: 'A5',
    widthMm: 148,
    heightMm: 210,
    dimensionsLabel: '148 × 210 mm',
    description: 'Kompaktni format pogodan za knjižice, priručnike i beleške',
    badge: 'Kompakt',
    effectivePageHeightPx: 680,
    linesPerPage: 32,
  },
  {
    id: 'letter',
    name: 'US Letter',
    widthMm: 216,
    heightMm: 279,
    dimensionsLabel: '8.5 × 11 in (216 × 279 mm)',
    description: 'Standardni severnoamerički format za poslovnu korespodenciju',
    badge: 'SAD',
    effectivePageHeightPx: 900,
    linesPerPage: 42,
  },
  {
    id: 'legal',
    name: 'US Legal',
    widthMm: 216,
    heightMm: 356,
    dimensionsLabel: '8.5 × 14 in (216 × 356 mm)',
    description: 'Produženi format za pravne ugovore i administrativne akte',
    badge: 'Pravni',
    effectivePageHeightPx: 1180,
    linesPerPage: 56,
  },
];

export const PAPER_FORMAT_MAP: Record<PaperFormat, PaperFormatOption> = PAPER_FORMAT_OPTIONS.reduce(
  (acc, opt) => {
    acc[opt.id] = opt;
    return acc;
  },
  {} as Record<PaperFormat, PaperFormatOption>
);

const FONT_SIZE_PAGE_FACTORS: Record<FontSize, number> = {
  sm: 1.15,
  base: 1.0,
  lg: 0.85,
  xl: 0.72,
};

/**
 * Estimates total pages from raw content and line/paragraph structure
 */
export function estimateTotalPagesFromContent(
  content: string,
  paperFormat: PaperFormat = 'a4',
  fontSize: FontSize = 'base'
): number {
  if (!content || content.trim().length === 0) {
    return 1;
  }

  const format = PAPER_FORMAT_MAP[paperFormat] || PAPER_FORMAT_MAP.a4;
  const factor = FONT_SIZE_PAGE_FACTORS[fontSize] || 1.0;
  const baseLinesPerPage = Math.max(15, Math.round(format.linesPerPage * factor));

  // Compute weighted line count based on content characteristics
  const rawLines = content.split('\n');
  let weightedLines = 0;

  let inCodeBlock = false;
  for (const line of rawLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('```')) {
      inCodeBlock = !inCodeBlock;
      weightedLines += 1.5;
      continue;
    }

    if (inCodeBlock) {
      weightedLines += 1;
      continue;
    }

    if (trimmed.startsWith('# ')) {
      weightedLines += 3.0; // Large H1 heading + margin
    } else if (trimmed.startsWith('## ')) {
      weightedLines += 2.2; // H2 heading + margin
    } else if (trimmed.startsWith('### ')) {
      weightedLines += 1.8; // H3 heading + margin
    } else if (trimmed.startsWith('![')) {
      weightedLines += 8; // Image placeholder ~8 lines
    } else if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      weightedLines += 1.6; // Table row
    } else if (trimmed.length === 0) {
      weightedLines += 0.8; // Paragraph break
    } else {
      // Estimate line wrapping for long lines (average 85 chars per line)
      const wraps = Math.max(1, Math.ceil(trimmed.length / 85));
      weightedLines += wraps;
    }
  }

  return Math.max(1, Math.ceil(weightedLines / baseLinesPerPage));
}

/**
 * Calculates current page and total pages based on DOM scroll position and selected paper format
 */
export function calculatePageInfoFromElement(
  element: HTMLElement | null,
  paperFormat: PaperFormat = 'a4',
  fontSize: FontSize = 'base',
  fallbackContent: string = ''
): { currentPage: number; totalPages: number } {
  const format = PAPER_FORMAT_MAP[paperFormat] || PAPER_FORMAT_MAP.a4;
  const factor = FONT_SIZE_PAGE_FACTORS[fontSize] || 1.0;
  const effectivePageHeight = Math.round(format.effectivePageHeightPx * factor);

  if (!element || element.scrollHeight <= 0) {
    const estimatedTotal = estimateTotalPagesFromContent(fallbackContent, paperFormat, fontSize);
    return { currentPage: 1, totalPages: estimatedTotal };
  }

  const scrollHeight = element.scrollHeight;
  const clientHeight = element.clientHeight;
  const scrollTop = element.scrollTop;

  // Calculate total pages from real rendered height
  const totalPages = Math.max(1, Math.ceil(scrollHeight / effectivePageHeight));
  const maxScroll = Math.max(0, scrollHeight - clientHeight);

  // If container is not scrollable or 1 page
  if (maxScroll <= 0 || totalPages <= 1) {
    return { currentPage: 1, totalPages };
  }

  // If user scrolled to the very bottom (within 25px threshold), always show the last page
  if (scrollTop >= maxScroll - 25) {
    return { currentPage: totalPages, totalPages };
  }

  // Current page calculated from scroll position relative to effective page height
  // Adding 35% of visible client viewport gives natural reading focal point
  const viewPosition = scrollTop + clientHeight * 0.35;
  const rawPage = Math.floor(viewPosition / effectivePageHeight) + 1;
  const currentPage = Math.min(totalPages, Math.max(1, rawPage));

  return { currentPage, totalPages };
}
