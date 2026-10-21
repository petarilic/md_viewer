export type ViewMode = 'rendered' | 'source' | 'split';

export type Theme = 'light' | 'dark' | 'system';

export type FontSize = 'sm' | 'base' | 'lg' | 'xl';
export type FontFamily = 'sans' | 'serif' | 'mono';
export type ContentWidth = 'narrow' | 'standard' | 'wide' | 'full';
export type LineSpacing = 'compact' | 'normal' | 'relaxed';
export type CodeTheme = 'github-dark' | 'github-light' | 'monokai' | 'dracula' | 'nord';

export interface ViewerSettings {
  theme: Theme;
  fontSize: FontSize;
  fontFamily: FontFamily;
  contentWidth: ContentWidth;
  lineSpacing: LineSpacing;
  showLineNumbersInCode: boolean;
  showToc: boolean;
  syncScroll: boolean;
  codeTheme: CodeTheme;
}

export interface DocumentItem {
  id: string;
  name: string;
  content: string;
  size: number;
  lastModified: number;
  source: 'local' | 'url' | 'sample';
  url?: string;
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
  rawText: string;
}

export interface SearchState {
  isOpen: boolean;
  query: string;
  matchCase: boolean;
  wholeWord: boolean;
  currentIndex: number;
  totalMatches: number;
}

export interface DocumentStats {
  words: number;
  characters: number;
  lines: number;
  readingTimeMinutes: number;
  fileSizeBytes: number;
}
