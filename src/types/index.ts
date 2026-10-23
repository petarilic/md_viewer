export type ViewMode = 'rendered' | 'edit' | 'split';

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
  wordWrap: boolean;
}

export interface DocumentItem {
  id: string;
  name: string;
  content: string;
  initialContent: string;
  isModified: boolean;
  size: number;
  lastModified: number;
  source: 'local' | 'url' | 'sample' | 'new';
  url?: string;
  fileHandle?: any; // FileSystemFileHandle for native File System Access API
}

export interface TocItem {
  id: string;
  text: string;
  level: number;
  rawText: string;
}

export interface SearchState {
  isOpen: boolean;
  isReplaceOpen: boolean;
  query: string;
  replaceText: string;
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

export type TemplateId =
  | 'empty'
  | 'api-docs'
  | 'changelog'
  | 'license'
  | 'readme'
  | 'spec'
  | 'meeting'
  | 'docs'
  | 'contributing'
  | 'bug-report'
  | string;

export type TemplateCategory = 'all' | 'popular' | 'development' | 'documentation' | 'legal';

export interface DocumentTemplate {
  id: string;
  name: string;
  description: string;
  category: TemplateCategory;
  badge?: string;
  iconName?: 'FileCode' | 'History' | 'Scale' | 'BookOpen' | 'Layers' | 'FileText' | 'GitPullRequest' | 'Bug' | 'Sparkles' | 'Terminal';
  defaultFilename: string;
  content: string;
}
