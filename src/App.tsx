/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  DocumentItem,
  ViewerSettings,
  ViewMode,
  SearchState,
  DocumentStats,
} from './types';
import { extractToc, calculateDocumentStats } from './utils/markdown';
import { SHOWCASE_MD, QUICKSTART_MD, SPECIFICATION_DOC_NAME } from './data/samples';
import { HeaderToolbar } from './components/HeaderToolbar';
import { TabBar } from './components/TabBar';
import { TOCSidebar } from './components/TOCSidebar';
import { RenderedView } from './components/RenderedView';
import { SourceView } from './components/SourceView';
import { SplitView } from './components/SplitView';
import { StatusBar } from './components/StatusBar';
import { SearchOverlay } from './components/SearchOverlay';
import { SettingsModal } from './components/SettingsModal';
import { UrlOpenModal } from './components/UrlOpenModal';
import { EmptyState } from './components/EmptyState';
import { ImageLightbox } from './components/ImageLightbox';
import { Toast, ToastMessage } from './components/Toast';

const DEFAULT_SETTINGS: ViewerSettings = {
  theme: 'system',
  fontSize: 'base',
  fontFamily: 'sans',
  contentWidth: 'standard',
  lineSpacing: 'normal',
  showLineNumbersInCode: true,
  showToc: true,
  syncScroll: true,
  codeTheme: 'github-dark',
};

export default function App() {
  // Settings with localStorage persistence
  const [settings, setSettings] = useState<ViewerSettings>(() => {
    try {
      const saved = localStorage.getItem('md_viewer_settings');
      if (saved) {
        return { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
      }
    } catch {
      // ignore
    }
    return DEFAULT_SETTINGS;
  });

  // Theme application
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    try {
      localStorage.setItem('md_viewer_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // Documents state
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [recentDocuments, setRecentDocuments] = useState<DocumentItem[]>(() => {
    try {
      const saved = localStorage.getItem('md_viewer_recent');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  // UI States
  const [viewMode, setViewMode] = useState<ViewMode>('rendered');
  const [isTocOpen, setIsTocOpen] = useState(true);
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [lightbox, setLightbox] = useState<{ src: string | null; alt: string }>({
    src: null,
    alt: '',
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Search State
  const [searchState, setSearchState] = useState<SearchState>({
    isOpen: false,
    query: '',
    matchCase: false,
    wholeWord: false,
    currentIndex: 0,
    totalMatches: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Show toast helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      text,
      type,
    });
  }, []);

  // Active document memo
  const activeDocument = useMemo(() => {
    return documents.find((doc) => doc.id === activeDocId) || null;
  }, [documents, activeDocId]);

  // Extract Table of Contents from active document
  const toc = useMemo(() => {
    if (!activeDocument) return [];
    return extractToc(activeDocument.content);
  }, [activeDocument]);

  // Document statistics
  const stats: DocumentStats = useMemo(() => {
    if (!activeDocument) {
      return { words: 0, characters: 0, lines: 0, readingTimeMinutes: 0, fileSizeBytes: 0 };
    }
    return calculateDocumentStats(activeDocument.content, activeDocument.size);
  }, [activeDocument]);

  // Save to recent documents
  const addToRecent = useCallback((doc: DocumentItem) => {
    setRecentDocuments((prev) => {
      const filtered = prev.filter((d) => d.id !== doc.id && d.name !== doc.name);
      const updated = [doc, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('md_viewer_recent', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Add document to state
  const addDocument = useCallback(
    (newDoc: DocumentItem) => {
      setDocuments((prev) => {
        const existingIndex = prev.findIndex(
          (d) => d.id === newDoc.id || (d.name === newDoc.name && d.size === newDoc.size)
        );
        if (existingIndex >= 0) {
          setActiveDocId(prev[existingIndex].id);
          return prev;
        }
        return [...prev, newDoc];
      });
      setActiveDocId(newDoc.id);
      addToRecent(newDoc);
    },
    [addToRecent]
  );

  // Load sample documents
  const handleOpenSample = useCallback(
    async (sampleKey: 'spec' | 'showcase' | 'quickstart') => {
      if (sampleKey === 'spec') {
        try {
          const res = await fetch('/assets/aistudio/md_file_viewer_specification_v1_654a0199.md');
          if (res.ok) {
            const text = await res.text();
            addDocument({
              id: 'spec-v1',
              name: SPECIFICATION_DOC_NAME,
              content: text,
              size: new Blob([text]).size,
              lastModified: Date.now(),
              source: 'sample',
            });
            showToast('Učitana specifikacija aplikacije!');
            return;
          }
        } catch {
          // fallback to showcase if fetch fails
        }
        // Fallback
        addDocument({
          id: 'spec-v1-fallback',
          name: 'Specifikacija_MD_Viewer.md',
          content: SHOWCASE_MD,
          size: new Blob([SHOWCASE_MD]).size,
          lastModified: Date.now(),
          source: 'sample',
        });
        showToast('Učitan Markdown vodič!');
      } else if (sampleKey === 'showcase') {
        addDocument({
          id: 'sample-showcase',
          name: 'Markdown_GFM_Vodic.md',
          content: SHOWCASE_MD,
          size: new Blob([SHOWCASE_MD]).size,
          lastModified: Date.now(),
          source: 'sample',
        });
        showToast('Učitan kompletan Markdown & GFM vodič!');
      } else {
        addDocument({
          id: 'sample-quickstart',
          name: 'Brzi_Vodic_za_Korisnike.md',
          content: QUICKSTART_MD,
          size: new Blob([QUICKSTART_MD]).size,
          lastModified: Date.now(),
          source: 'sample',
        });
        showToast('Učitan brzi vodič za korišćenje!');
      }
    },
    [addDocument, showToast]
  );

  // Initial load: Open specification file as initial document for immediate wow effect!
  useEffect(() => {
    if (documents.length === 0) {
      handleOpenSample('spec');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // File open via system dialog
  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const newDoc: DocumentItem = {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          content: text || '',
          size: file.size,
          lastModified: file.lastModified,
          source: 'local',
        };
        addDocument(newDoc);
        showToast(`Dokument "${file.name}" uspešno učitan.`);
      };
      reader.onerror = () => {
        showToast(`Greška pri čitanju fajla ${file.name}.`, 'error');
      };
      reader.readAsText(file, 'UTF-8');
    });

    // Reset input
    e.target.value = '';
  };

  // Drag and Drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    let loadedCount = 0;
    Array.from(files).forEach((file) => {
      // Check file extension
      const ext = file.name.split('.').pop()?.toLowerCase();
      if (!['md', 'markdown', 'mdown', 'mkd', 'txt'].includes(ext || '')) {
        showToast(`Fajl "${file.name}" nije podržanog Markdown formata.`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const newDoc: DocumentItem = {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          content: text || '',
          size: file.size,
          lastModified: file.lastModified,
          source: 'local',
        };
        addDocument(newDoc);
        loadedCount++;
        if (loadedCount === files.length) {
          showToast(`Učitano ${files.length} fajl(ova).`);
        }
      };
      reader.readAsText(file, 'UTF-8');
    });
  };

  // Close tab
  const handleCloseDoc = (id: string) => {
    setDocuments((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (activeDocId === id) {
        setActiveDocId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      }
      return remaining;
    });
  };

  // Close all tabs
  const handleCloseAllDocs = () => {
    setDocuments([]);
    setActiveDocId(null);
  };

  // Heading click inside TOC
  const handleSelectHeading = (id: string) => {
    setActiveHeadingId(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Copy Heading anchor link
  const handleCopyAnchor = (anchor: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${anchor}`;
    navigator.clipboard.writeText(fullUrl);
    showToast(`Sidreni link ${anchor} kopiran u privremenu memoriju!`);
  };

  // Copy raw Markdown
  const handleCopyMarkdown = () => {
    if (!activeDocument) return;
    navigator.clipboard.writeText(activeDocument.content);
    showToast('Izvorni Markdown tekst je kopiran!');
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    if (!activeDocument) return;
    const blob = new Blob([activeDocument.content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeDocument.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast(`Fajl "${activeDocument.name}" je spreman za preuzimanje.`);
  };

  // Print / Save as PDF
  const handlePrint = () => {
    window.print();
  };

  // Fullscreen toggle
  const handleToggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Global keyboard shortcuts (Ctrl+O, Ctrl+F, Ctrl+P, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        fileInputRef.current?.click();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchState((prev) => ({ ...prev, isOpen: true }));
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        handlePrint();
      } else if (e.key === 'Escape') {
        if (searchState.isOpen) {
          setSearchState((prev) => ({ ...prev, isOpen: false }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchState.isOpen]);

  // Search matches navigation
  const handleNextMatch = () => {
    setSearchState((prev) => {
      if (prev.totalMatches <= 1) return prev;
      const nextIndex = (prev.currentIndex + 1) % prev.totalMatches;
      return { ...prev, currentIndex: nextIndex };
    });
  };

  const handlePrevMatch = () => {
    setSearchState((prev) => {
      if (prev.totalMatches <= 1) return prev;
      const prevIndex = (prev.currentIndex - 1 + prev.totalMatches) % prev.totalMatches;
      return { ...prev, currentIndex: prevIndex };
    });
  };

  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 select-auto"
      onDragOver={handleDragOver}
      onDragEnter={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".md,.markdown,.mdown,.mkd,text/markdown,text/plain"
        onChange={handleFileInputChange}
        className="hidden"
      />

      {/* Top Header Toolbar */}
      <HeaderToolbar
        onOpenFile={() => fileInputRef.current?.click()}
        onOpenUrl={() => setIsUrlModalOpen(true)}
        onOpenSample={handleOpenSample}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isTocOpen={isTocOpen}
        onToggleToc={() => setIsTocOpen(!isTocOpen)}
        onOpenSearch={() => setSearchState((prev) => ({ ...prev, isOpen: true }))}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
        onUpdateSettings={(upd) => setSettings((prev) => ({ ...prev, ...upd }))}
        onCopyMarkdown={handleCopyMarkdown}
        onPrint={handlePrint}
        onDownloadMarkdown={handleDownloadMarkdown}
        hasDocument={!!activeDocument}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
      />

      {/* Tab Bar for open documents */}
      <TabBar
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={setActiveDocId}
        onCloseDoc={handleCloseDoc}
        onCloseAll={handleCloseAllDocs}
        onNewFile={() => fileInputRef.current?.click()}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Search Overlay floating bar */}
        <SearchOverlay
          searchState={searchState}
          onUpdateSearch={(upd) => setSearchState((prev) => ({ ...prev, ...upd }))}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          onClose={() => setSearchState((prev) => ({ ...prev, isOpen: false }))}
        />

        {activeDocument ? (
          <>
            {/* Table of Contents Sidebar */}
            <TOCSidebar
              toc={toc}
              activeHeadingId={activeHeadingId}
              onSelectHeading={handleSelectHeading}
              isOpen={isTocOpen}
              onToggle={() => setIsTocOpen(!isTocOpen)}
              onCopyAnchor={handleCopyAnchor}
            />

            {/* Document Content View based on active mode */}
            <main className="flex-1 h-full overflow-hidden flex flex-col relative bg-white dark:bg-slate-900/40">
              {viewMode === 'rendered' && (
                <RenderedView
                  content={activeDocument.content}
                  settings={settings}
                  searchState={searchState}
                  onUpdateTotalMatches={(total) =>
                    setSearchState((prev) => ({ ...prev, totalMatches: total }))
                  }
                  onImageClick={(src, alt) => setLightbox({ src, alt })}
                  onHeadingVisible={setActiveHeadingId}
                />
              )}

              {viewMode === 'source' && (
                <SourceView
                  content={activeDocument.content}
                  settings={settings}
                  onCopySuccess={() => showToast('Izvorni Markdown tekst kopiran!')}
                />
              )}

              {viewMode === 'split' && (
                <SplitView
                  content={activeDocument.content}
                  settings={settings}
                  searchState={searchState}
                  onUpdateTotalMatches={(total) =>
                    setSearchState((prev) => ({ ...prev, totalMatches: total }))
                  }
                  onImageClick={(src, alt) => setLightbox({ src, alt })}
                  onCopySuccess={() => showToast('Izvorni tekst kopiran!')}
                />
              )}
            </main>
          </>
        ) : (
          /* Empty State when no document is open */
          <EmptyState
            onOpenFile={() => fileInputRef.current?.click()}
            onOpenUrl={() => setIsUrlModalOpen(true)}
            onOpenSample={handleOpenSample}
            recentDocuments={recentDocuments}
            onOpenRecent={addDocument}
            isDragging={isDragging}
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      {activeDocument && (
        <StatusBar
          fileName={activeDocument.name}
          stats={stats}
          viewMode={viewMode}
          activeHeading={
            toc.find((t) => t.id === activeHeadingId)?.text || null
          }
        />
      )}

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(upd) => setSettings((prev) => ({ ...prev, ...upd }))}
        onResetSettings={() => setSettings(DEFAULT_SETTINGS)}
      />

      {/* URL Open Modal */}
      <UrlOpenModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onLoadFromUrl={(url, content, name) => {
          addDocument({
            id: `url-${Date.now()}`,
            name,
            content,
            size: new Blob([content]).size,
            lastModified: Date.now(),
            source: 'url',
            url,
          });
          showToast(`Dokument uspešno preuzet sa URL adrese!`);
        }}
      />

      {/* Image Lightbox */}
      <ImageLightbox
        src={lightbox.src}
        alt={lightbox.alt}
        onClose={() => setLightbox({ src: null, alt: '' })}
      />

      {/* Toast Feedback */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
