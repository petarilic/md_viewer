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
import { exportToDocx, exportToTxt } from './utils/export';
import {
  saveDocument,
  saveDocumentAs,
  downloadMarkdown,
  openFileWithPicker,
} from './utils/fileSystem';
import { SHOWCASE_MD, QUICKSTART_MD } from './data/samples';
import { HeaderToolbar } from './components/HeaderToolbar';
import { TabBar } from './components/TabBar';
import { TOCSidebar } from './components/TOCSidebar';
import { RenderedView } from './components/RenderedView';
import { EditorView, EditorViewRef } from './components/EditorView';
import { SplitView } from './components/SplitView';
import { StatusBar } from './components/StatusBar';
import { SearchOverlay } from './components/SearchOverlay';
import { SettingsModal } from './components/SettingsModal';
import { UrlOpenModal } from './components/UrlOpenModal';
import { NewDocumentModal } from './components/NewDocumentModal';
import { UnsavedChangesModal } from './components/UnsavedChangesModal';
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
  wordWrap: true,
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

  // Apply Theme
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      settings.theme === 'dark' ||
      (settings.theme === 'system' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
      document.body.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      document.body.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    try {
      localStorage.setItem('md_viewer_settings', JSON.stringify(settings));
    } catch {
      // ignore
    }
  }, [settings]);

  // System theme changes listener
  useEffect(() => {
    if (settings.theme !== 'system') return;
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const updateTheme = () => {
      const root = document.documentElement;
      if (media.matches) {
        root.classList.add('dark');
        document.body.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else {
        root.classList.remove('dark');
        document.body.classList.remove('dark');
        root.style.colorScheme = 'light';
      }
    };
    media.addEventListener('change', updateTheme);
    return () => media.removeEventListener('change', updateTheme);
  }, [settings.theme]);

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
  const [isNewDocModalOpen, setIsNewDocModalOpen] = useState(false);

  // Unsaved changes confirmation modal state
  const [unsavedModal, setUnsavedModal] = useState<{
    isOpen: boolean;
    docId: string;
    docName: string;
    pendingAction: () => void;
  } | null>(null);

  // Lightbox & Toast
  const [lightbox, setLightbox] = useState<{ src: string | null; alt: string }>({
    src: null,
    alt: '',
  });
  const [toast, setToast] = useState<ToastMessage | null>(null);

  // Search State with Replace
  const [searchState, setSearchState] = useState<SearchState>({
    isOpen: false,
    isReplaceOpen: false,
    query: '',
    replaceText: '',
    matchCase: false,
    wholeWord: false,
    currentIndex: 0,
    totalMatches: 0,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<EditorViewRef>(null);

  // Memoized search total matches updater to avoid re-renders
  const handleUpdateTotalMatches = useCallback((total: number) => {
    setSearchState((prev) => {
      if (prev.totalMatches === total) return prev;
      return { ...prev, totalMatches: total };
    });
  }, []);

  // Memoized image click and heading visibility callbacks
  const handleImageClick = useCallback((src: string, alt: string) => {
    setLightbox({ src, alt });
  }, []);

  const handleHeadingVisible = useCallback((headingId: string) => {
    setActiveHeadingId((prev) => (prev === headingId ? prev : headingId));
  }, []);

  // Toast helper
  const showToast = useCallback((text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({
      id: String(Date.now()),
      text,
      type,
    });
  }, []);

  // Active document
  const activeDocument = useMemo(() => {
    return documents.find((doc) => doc.id === activeDocId) || null;
  }, [documents, activeDocId]);

  // TOC extraction
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
      const cleanDoc = { ...doc, isModified: false };
      const updated = [cleanDoc, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('md_viewer_recent', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  }, []);

  // Add document
  const addDocument = useCallback(
    (newDoc: DocumentItem, activateMode?: ViewMode) => {
      setDocuments((prev) => {
        const existing = prev.find(
          (d) => d.id === newDoc.id || (d.name === newDoc.name && d.size === newDoc.size)
        );
        if (existing) {
          return prev;
        }
        return [...prev, newDoc];
      });
      setActiveDocId(newDoc.id);
      addToRecent(newDoc);
      if (activateMode) {
        setViewMode(activateMode);
      }
    },
    [addToRecent]
  );

  // Window beforeunload protection if any document has unsaved modifications
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const hasUnsaved = documents.some((d) => d.isModified);
      if (hasUnsaved) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [documents]);

  // Load sample documents on mount or request
  const handleOpenSample = useCallback(
    async (sampleKey: 'spec' | 'showcase' | 'quickstart') => {
      if (sampleKey === 'spec') {
        try {
          // Attempt to load the combined specification v1.1
          const res = await fetch(
            '/assets/aistudio/MD_Viewer_Editor_Combined_Specification_v1.1_49ae6945.md'
          );
          if (res.ok) {
            const text = await res.text();
            addDocument(
              {
                id: 'spec-combined-v1.2',
                name: 'MD_Viewer_Editor_Specifikacija_v1.2.md',
                content: text,
                initialContent: text,
                isModified: false,
                size: new Blob([text]).size,
                lastModified: Date.now(),
                source: 'sample',
              },
              'rendered'
            );
            showToast('Učitana objedinjena specifikacija MD Viewer & Editor-a!');
            return;
          }
        } catch {
          // fallback
        }
        // Fallback to showcase
        addDocument(
          {
            id: 'spec-v1-fallback',
            name: 'Specifikacija_MD_Viewer_Editor.md',
            content: SHOWCASE_MD,
            initialContent: SHOWCASE_MD,
            isModified: false,
            size: new Blob([SHOWCASE_MD]).size,
            lastModified: Date.now(),
            source: 'sample',
          },
          'rendered'
        );
        showToast('Učitan Markdown vodič!');
      } else if (sampleKey === 'showcase') {
        addDocument(
          {
            id: 'sample-showcase',
            name: 'Markdown_GFM_Vodic.md',
            content: SHOWCASE_MD,
            initialContent: SHOWCASE_MD,
            isModified: false,
            size: new Blob([SHOWCASE_MD]).size,
            lastModified: Date.now(),
            source: 'sample',
          },
          'rendered'
        );
        showToast('Učitan kompletan Markdown & GFM vodič!');
      } else {
        addDocument(
          {
            id: 'sample-quickstart',
            name: 'Korisnicki_Vodic_za_Editor.md',
            content: QUICKSTART_MD,
            initialContent: QUICKSTART_MD,
            isModified: false,
            size: new Blob([QUICKSTART_MD]).size,
            lastModified: Date.now(),
            source: 'sample',
          },
          'rendered'
        );
        showToast('Učitan korisnički vodič!');
      }
    },
    [addDocument, showToast]
  );

  // Initial load
  useEffect(() => {
    if (documents.length === 0) {
      handleOpenSample('spec');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update document content when edited
  const handleContentChange = (newContent: string) => {
    if (!activeDocId) return;

    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id !== activeDocId) return doc;
        const isModified = newContent !== doc.initialContent;
        return {
          ...doc,
          content: newContent,
          isModified,
          size: new Blob([newContent]).size,
        };
      })
    );
  };

  // Rename document
  const handleRenameDocument = (newName: string) => {
    if (!activeDocId) return;
    setDocuments((prev) =>
      prev.map((doc) => (doc.id === activeDocId ? { ...doc, name: newName } : doc))
    );
    showToast(`Naziv dokumenta promenjen u "${newName}".`);
  };

  // Save operation (Ctrl+S or Toolbar)
  const handleSave = async (targetDoc = activeDocument) => {
    if (!targetDoc) return;

    try {
      const result = await saveDocument(targetDoc);
      if (result.success) {
        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id !== targetDoc.id) return doc;
            return {
              ...doc,
              initialContent: doc.content,
              isModified: false,
              name: result.name,
              fileHandle: result.fileHandle || doc.fileHandle,
              lastModified: Date.now(),
            };
          })
        );
        if (result.method === 'direct') {
          showToast(`Dokument "${result.name}" uspešno sačuvan na disk!`);
        } else {
          showToast(`Dokument preuzet kao "${result.name}".`);
        }
      }
    } catch {
      showToast('Greška pri čuvanju dokumenta.', 'error');
    }
  };

  // Save As operation (Save As dialog or download)
  const handleSaveAs = async () => {
    if (!activeDocument) return;

    try {
      const result = await saveDocumentAs(activeDocument);
      if (result.success) {
        setDocuments((prev) =>
          prev.map((doc) => {
            if (doc.id !== activeDocument.id) return doc;
            return {
              ...doc,
              name: result.name,
              initialContent: doc.content,
              isModified: false,
              fileHandle: result.fileHandle || doc.fileHandle,
              lastModified: Date.now(),
            };
          })
        );
        showToast(`Dokument uspešno sačuvan kao "${result.name}"!`);
      }
    } catch {
      showToast('Greška pri čuvanju fajla.', 'error');
    }
  };

  // New Document creation
  const handleRequestNewFile = () => {
    if (activeDocument && activeDocument.isModified) {
      setUnsavedModal({
        isOpen: true,
        docId: activeDocument.id,
        docName: activeDocument.name,
        pendingAction: () => setIsNewDocModalOpen(true),
      });
    } else {
      setIsNewDocModalOpen(true);
    }
  };

  const handleCreateDocument = (name: string, content: string) => {
    const newDoc: DocumentItem = {
      id: `doc-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name,
      content,
      initialContent: content,
      isModified: false,
      size: new Blob([content]).size,
      lastModified: Date.now(),
      source: 'new',
    };
    addDocument(newDoc, 'edit');
    showToast(`Dokument "${name}" uspešno kreiran.`);
  };

  // Open File with File System Access API or input dialog
  const handleRequestOpenFile = async () => {
    // Check if browser supports File System Access API
    const opened = await openFileWithPicker();
    if (opened) {
      const newDoc: DocumentItem = {
        id: `file-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        name: opened.name,
        content: opened.content,
        initialContent: opened.content,
        isModified: false,
        size: opened.size,
        lastModified: opened.lastModified,
        source: 'local',
        fileHandle: opened.fileHandle,
      };
      addDocument(newDoc, 'rendered');
      showToast(`Fajl "${opened.name}" uspešno otvoren.`);
      return;
    }

    // Fallback: trigger standard hidden input
    fileInputRef.current?.click();
  };

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
          initialContent: text || '',
          isModified: false,
          size: file.size,
          lastModified: file.lastModified,
          source: 'local',
        };
        addDocument(newDoc, 'rendered');
        showToast(`Fajl "${file.name}" uspešno učitan.`);
      };
      reader.onerror = () => {
        showToast(`Greška pri čitanju fajla ${file.name}.`, 'error');
      };
      reader.readAsText(file, 'UTF-8');
    });

    e.target.value = '';
  };

  // Drag and Drop
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

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const newDoc: DocumentItem = {
          id: `${file.name}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          name: file.name,
          content: text || '',
          initialContent: text || '',
          isModified: false,
          size: file.size,
          lastModified: file.lastModified,
          source: 'local',
        };
        addDocument(newDoc, 'rendered');
        showToast(`Učitan fajl "${file.name}".`);
      };
      reader.readAsText(file, 'UTF-8');
    });
  };

  // Close tab with unsaved changes verification
  const performCloseDoc = (id: string) => {
    setDocuments((prev) => {
      const remaining = prev.filter((d) => d.id !== id);
      if (activeDocId === id) {
        setActiveDocId(remaining.length > 0 ? remaining[remaining.length - 1].id : null);
      }
      return remaining;
    });
  };

  const handleCloseDoc = (id: string) => {
    const docToClose = documents.find((d) => d.id === id);
    if (!docToClose) return;

    if (docToClose.isModified) {
      setUnsavedModal({
        isOpen: true,
        docId: docToClose.id,
        docName: docToClose.name,
        pendingAction: () => performCloseDoc(id),
      });
    } else {
      performCloseDoc(id);
    }
  };

  // Close all tabs
  const handleCloseAllDocs = () => {
    const unsavedDoc = documents.find((d) => d.isModified);
    if (unsavedDoc) {
      setUnsavedModal({
        isOpen: true,
        docId: unsavedDoc.id,
        docName: unsavedDoc.name,
        pendingAction: () => {
          setDocuments([]);
          setActiveDocId(null);
        },
      });
    } else {
      setDocuments([]);
      setActiveDocId(null);
    }
  };

  // Heading selection in TOC
  const handleSelectHeading = (id: string) => {
    setActiveHeadingId(id);
    // If we're in edit mode, switch to split or rendered so heading can be viewed
    if (viewMode === 'edit') {
      setViewMode('split');
    }
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const handleCopyAnchor = (anchor: string) => {
    const fullUrl = `${window.location.origin}${window.location.pathname}${anchor}`;
    navigator.clipboard.writeText(fullUrl);
    showToast(`Sidreni link ${anchor} kopiran u privremenu memoriju!`);
  };

  const handleCopyMarkdown = () => {
    if (!activeDocument) return;
    navigator.clipboard.writeText(activeDocument.content);
    showToast('Izvorni Markdown tekst kopiran u clipboard!');
  };

  // Export DOCX
  const handleExportDocx = async () => {
    if (!activeDocument) return;
    try {
      await exportToDocx(activeDocument.content, activeDocument.name);
      showToast(`Dokument "${activeDocument.name}" uspešno izvezen u DOCX!`);
    } catch (err) {
      console.error(err);
      showToast('Greška pri izvozu u DOCX dokument.', 'error');
    }
  };

  // Export TXT
  const handleExportTxt = () => {
    if (!activeDocument) return;
    try {
      exportToTxt(activeDocument.content, activeDocument.name);
      showToast(`Dokument uspešno izvezen kao TXT bez formatiranja!`);
    } catch (err) {
      console.error(err);
      showToast('Greška pri izvozu u TXT.', 'error');
    }
  };

  // Fullscreen
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

  // Global Keyboard Shortcuts (Ctrl+N, Ctrl+S, Ctrl+O, Ctrl+F, Ctrl+H, Ctrl+P, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCmdOrCtrl = e.metaKey || e.ctrlKey;

      if (isCmdOrCtrl && e.key.toLowerCase() === 'n') {
        e.preventDefault();
        handleRequestNewFile();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (activeDocument) {
          handleSave();
        }
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'o') {
        e.preventDefault();
        handleRequestOpenFile();
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'f') {
        e.preventDefault();
        setSearchState((prev) => ({ ...prev, isOpen: true, isReplaceOpen: false }));
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'h') {
        e.preventDefault();
        setSearchState((prev) => ({ ...prev, isOpen: true, isReplaceOpen: true }));
      } else if (isCmdOrCtrl && e.key.toLowerCase() === 'p') {
        e.preventDefault();
        window.print();
      } else if (e.key === 'Escape') {
        if (searchState.isOpen) {
          setSearchState((prev) => ({ ...prev, isOpen: false }));
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeDocument, searchState.isOpen]);

  // Search Navigation
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

  // Replace Current Match
  const handleReplaceCurrent = () => {
    if (!editorRef.current || !searchState.replaceText) return;
    editorRef.current.replaceSelection(searchState.replaceText);
    showToast('Izvršena zamena!');
  };

  // Replace All Matches
  const handleReplaceAll = () => {
    if (!editorRef.current || !searchState.query) return;
    const count = editorRef.current.replaceAll(
      searchState.query,
      searchState.replaceText,
      searchState.matchCase,
      searchState.wholeWord
    );
    showToast(`Zamenjeno ${count} pojavljivanja teksta.`);
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
        onNewFile={handleRequestNewFile}
        onOpenFile={handleRequestOpenFile}
        onOpenUrl={() => setIsUrlModalOpen(true)}
        onOpenSample={handleOpenSample}
        onSave={() => handleSave()}
        onSaveAs={handleSaveAs}
        isModified={activeDocument?.isModified ?? false}
        viewMode={viewMode}
        onChangeViewMode={setViewMode}
        isTocOpen={isTocOpen}
        onToggleToc={() => setIsTocOpen(!isTocOpen)}
        onOpenSearch={() => setSearchState((prev) => ({ ...prev, isOpen: true, isReplaceOpen: false }))}
        onOpenReplace={() => setSearchState((prev) => ({ ...prev, isOpen: true, isReplaceOpen: true }))}
        onUndo={() => editorRef.current?.undo()}
        onRedo={() => editorRef.current?.redo()}
        canUndo={editorRef.current?.canUndo ?? false}
        canRedo={editorRef.current?.canRedo ?? false}
        onOpenSettings={() => setIsSettingsOpen(true)}
        settings={settings}
        onUpdateSettings={(upd) => setSettings((prev) => ({ ...prev, ...upd }))}
        onCopyMarkdown={handleCopyMarkdown}
        onExportDocx={handleExportDocx}
        onExportTxt={handleExportTxt}
        onPrint={() => window.print()}
        onDownloadMarkdown={() => activeDocument && downloadMarkdown(activeDocument.content, activeDocument.name)}
        hasDocument={!!activeDocument}
        isFullscreen={isFullscreen}
        onToggleFullscreen={handleToggleFullscreen}
        documentTitle={activeDocument?.name || 'Untitled.md'}
        onRenameDocument={handleRenameDocument}
      />

      {/* Tab Bar for open documents */}
      <TabBar
        documents={documents}
        activeDocId={activeDocId}
        onSelectDoc={setActiveDocId}
        onCloseDoc={handleCloseDoc}
        onCloseAll={handleCloseAllDocs}
        onNewFile={handleRequestNewFile}
        onRenameDoc={(id, name) => {
          setDocuments((prev) =>
            prev.map((d) => (d.id === id ? { ...d, name } : d))
          );
        }}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Search & Replace Overlay */}
        <SearchOverlay
          searchState={searchState}
          onUpdateSearch={(upd) => setSearchState((prev) => ({ ...prev, ...upd }))}
          onNextMatch={handleNextMatch}
          onPrevMatch={handlePrevMatch}
          onReplaceCurrent={handleReplaceCurrent}
          onReplaceAll={handleReplaceAll}
          onClose={() => setSearchState((prev) => ({ ...prev, isOpen: false }))}
          isEditorActive={viewMode === 'edit' || viewMode === 'split'}
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
                  onUpdateTotalMatches={handleUpdateTotalMatches}
                  onImageClick={handleImageClick}
                  onHeadingVisible={handleHeadingVisible}
                />
              )}

              {viewMode === 'edit' && (
                <EditorView
                  ref={editorRef}
                  content={activeDocument.content}
                  onChange={handleContentChange}
                  settings={settings}
                  onCopySuccess={() => showToast('Izvorni Markdown tekst kopiran!')}
                />
              )}

              {viewMode === 'split' && (
                <SplitView
                  content={activeDocument.content}
                  onChangeContent={handleContentChange}
                  settings={settings}
                  searchState={searchState}
                  onUpdateTotalMatches={handleUpdateTotalMatches}
                  onImageClick={handleImageClick}
                  onCopySuccess={() => showToast('Izvorni tekst kopiran!')}
                  editorRef={editorRef}
                />
              )}
            </main>
          </>
        ) : (
          /* Empty State when no document is open */
          <EmptyState
            onNewFile={handleRequestNewFile}
            onOpenFile={handleRequestOpenFile}
            onOpenUrl={() => setIsUrlModalOpen(true)}
            onOpenSample={handleOpenSample}
            recentDocuments={recentDocuments}
            onOpenRecent={(doc) => addDocument(doc, 'rendered')}
            isDragging={isDragging}
          />
        )}
      </div>

      {/* Bottom Status Bar */}
      {activeDocument && (
        <StatusBar
          fileName={activeDocument.name}
          isModified={activeDocument.isModified}
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

      {/* New Document Modal */}
      <NewDocumentModal
        isOpen={isNewDocModalOpen}
        onClose={() => setIsNewDocModalOpen(false)}
        onCreate={handleCreateDocument}
      />

      {/* URL Open Modal */}
      <UrlOpenModal
        isOpen={isUrlModalOpen}
        onClose={() => setIsUrlModalOpen(false)}
        onLoadFromUrl={(url, content, name) => {
          addDocument(
            {
              id: `url-${Date.now()}`,
              name,
              content,
              initialContent: content,
              isModified: false,
              size: new Blob([content]).size,
              lastModified: Date.now(),
              source: 'url',
              url,
            },
            'rendered'
          );
          showToast(`Dokument uspešno preuzet sa URL adrese!`);
        }}
      />

      {/* Unsaved Changes Confirmation Modal */}
      {unsavedModal && (
        <UnsavedChangesModal
          isOpen={unsavedModal.isOpen}
          docName={unsavedModal.docName}
          onSave={async () => {
            const doc = documents.find((d) => d.id === unsavedModal.docId);
            if (doc) {
              await handleSave(doc);
            }
            unsavedModal.pendingAction();
            setUnsavedModal(null);
          }}
          onDiscard={() => {
            unsavedModal.pendingAction();
            setUnsavedModal(null);
          }}
          onCancel={() => setUnsavedModal(null)}
        />
      )}

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
