import React, { useState } from 'react';
import { X, Globe, AlertCircle, Loader2, ExternalLink } from 'lucide-react';

interface UrlOpenModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadFromUrl: (url: string, content: string, name: string) => void;
}

export const UrlOpenModal: React.FC<UrlOpenModalProps> = ({
  isOpen,
  onClose,
  onLoadFromUrl,
}) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const quickSamples = [
    {
      name: 'GitHub Markdown Spec (CommonMark)',
      url: 'https://raw.githubusercontent.com/commonmark/commonmark-spec/master/spec.txt',
    },
    {
      name: 'Facebook React README',
      url: 'https://raw.githubusercontent.com/facebook/react/main/README.md',
    },
    {
      name: 'Vite README',
      url: 'https://raw.githubusercontent.com/vitejs/vite/main/README.md',
    },
  ];

  const handleFetch = async (targetUrl = url) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      setError('Molimo unesite URL adresu.');
      return;
    }

    if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
      setError('URL mora počinjati sa http:// ili https://');
      return;
    }

    setIsLoading(true);
    setError(null);

    let fetchUrl = trimmed;
    // Auto-convert standard GitHub blob URLs to raw.githubusercontent.com for seamless CORS fetching
    const githubBlobMatch = fetchUrl.match(/^https?:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/i);
    if (githubBlobMatch) {
      fetchUrl = `https://raw.githubusercontent.com/${githubBlobMatch[1]}/${githubBlobMatch[2]}/${githubBlobMatch[3]}/${githubBlobMatch[4]}`;
    }

    try {
      const response = await fetch(fetchUrl);
      if (!response.ok) {
        throw new Error(`Učitavanje nije uspelo (HTTP status: ${response.status})`);
      }

      const content = await response.text();
      // Extract file name from URL or fallback
      const urlObj = new URL(fetchUrl);
      const pathname = urlObj.pathname;
      const fileName = pathname.split('/').pop() || 'Dokument.md';

      onLoadFromUrl(fetchUrl, content, fileName);
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Greška pri preuzimanju fajla. Proverite CORS podešavanja ili URL adresu.';
      setError(
        `${msg} (Napomena: udaljeni server mora dozvoliti CORS zahteve iz pregledača, npr. raw.githubusercontent.com).`
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-semibold text-base">
            <Globe className="w-5 h-5 text-blue-500" />
            <span>Otvori dokument sa URL-a</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Javna adresa Markdown fajla (.md)
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              placeholder="https://raw.githubusercontent.com/.../README.md"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 text-sm font-mono"
              disabled={isLoading}
              onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-600 dark:text-rose-400 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick preset links */}
          <div>
            <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">
              Primeri javnih repozitorijuma:
            </div>
            <div className="space-y-1.5">
              {quickSamples.map((sample) => (
                <button
                  key={sample.url}
                  onClick={() => {
                    setUrl(sample.url);
                    handleFetch(sample.url);
                  }}
                  disabled={isLoading}
                  className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs text-slate-700 dark:text-slate-300 flex items-center justify-between transition"
                >
                  <span className="truncate">{sample.name}</span>
                  <ExternalLink className="w-3 h-3 text-slate-400 shrink-0" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50 dark:bg-slate-950/60 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
          >
            Otkaži
          </button>
          <button
            onClick={() => handleFetch()}
            disabled={isLoading || !url.trim()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-medium shadow-sm transition"
          >
            {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>{isLoading ? 'Učitavanje...' : 'Učitaj dokument'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
