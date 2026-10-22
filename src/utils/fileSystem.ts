import { DocumentItem } from '../types';

export interface SaveResult {
  success: boolean;
  method: 'direct' | 'download';
  name: string;
  fileHandle?: any;
}

/**
 * Saves document changes.
 * Uses the File System Access API when available and permitted,
 * or safely falls back to standard browser download (.md) as required by Section 4.3 & AC-04.
 */
export async function saveDocument(doc: DocumentItem): Promise<SaveResult> {
  // If we already have a file handle from File System Access API
  if (doc.fileHandle) {
    try {
      // Check/request permission
      if (doc.fileHandle.queryPermission) {
        const permission = await doc.fileHandle.queryPermission({ mode: 'readwrite' });
        if (permission !== 'granted') {
          const req = await doc.fileHandle.requestPermission({ mode: 'readwrite' });
          if (req !== 'granted') {
            throw new Error('Dozvola za upis nije odobrena.');
          }
        }
      }

      const writable = await doc.fileHandle.createWritable();
      await writable.write(doc.content);
      await writable.close();

      return {
        success: true,
        method: 'direct',
        name: doc.name,
        fileHandle: doc.fileHandle,
      };
    } catch (err) {
      console.warn('Direct file save failed, falling back to download:', err);
      // Fallback to download below
    }
  }

  // Fallback: Browser download
  downloadMarkdown(doc.content, doc.name);
  return {
    success: true,
    method: 'download',
    name: doc.name,
  };
}

/**
 * Saves document with a new name / location (Save As - Section 4.2 & AC-05)
 */
export async function saveDocumentAs(doc: DocumentItem, suggestedName?: string): Promise<SaveResult> {
  const targetName = (suggestedName || doc.name).trim() || 'Untitled.md';
  const cleanName = targetName.endsWith('.md') ? targetName : `${targetName}.md`;

  // Check if File System Access API is supported
  if ('showSaveFilePicker' in window) {
    try {
      const handle = await (window as any).showSaveFilePicker({
        suggestedName: cleanName,
        types: [
          {
            description: 'Markdown Dokument (*.md)',
            accept: {
              'text/markdown': ['.md', '.markdown'],
              'text/plain': ['.txt'],
            },
          },
        ],
      });

      const writable = await handle.createWritable();
      await writable.write(doc.content);
      await writable.close();

      return {
        success: true,
        method: 'direct',
        name: handle.name,
        fileHandle: handle,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return { success: false, method: 'direct', name: doc.name };
      }
      console.warn('showSaveFilePicker failed, falling back to download:', err);
    }
  }

  // Fallback: browser download
  downloadMarkdown(doc.content, cleanName);
  return {
    success: true,
    method: 'download',
    name: cleanName,
  };
}

/**
 * Triggers standard browser download for .md file
 */
export function downloadMarkdown(content: string, filename: string): void {
  const cleanName = filename.endsWith('.md') ? filename : `${filename}.md`;
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = cleanName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Attempts to open a file using File System Access API to retain fileHandle for direct Save.
 */
export async function openFileWithPicker(): Promise<{
  content: string;
  name: string;
  size: number;
  lastModified: number;
  fileHandle: any;
} | null> {
  if ('showOpenFilePicker' in window) {
    try {
      const [handle] = await (window as any).showOpenFilePicker({
        multiple: false,
        types: [
          {
            description: 'Markdown fajlovi',
            accept: {
              'text/markdown': ['.md', '.markdown', '.mdown', '.mkd'],
              'text/plain': ['.txt'],
            },
          },
        ],
      });

      const file = await handle.getFile();
      const content = await file.text();

      return {
        content,
        name: file.name,
        size: file.size,
        lastModified: file.lastModified,
        fileHandle: handle,
      };
    } catch (err: any) {
      if (err.name === 'AbortError') {
        return null;
      }
      // If error, return null so caller falls back to regular input[type=file]
      return null;
    }
  }

  return null;
}
