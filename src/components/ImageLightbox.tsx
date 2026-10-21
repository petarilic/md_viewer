import React, { useEffect, useState } from 'react';
import { X, ZoomIn, ZoomOut, Download, ExternalLink } from 'lucide-react';

interface ImageLightboxProps {
  src: string | null;
  alt: string;
  onClose: () => void;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({ src, alt, onClose }) => {
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!src) return null;

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex flex-col items-center justify-center p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Controls Toolbar */}
      <div
        className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 rounded-xl px-3 py-1.5 shadow-lg backdrop-blur-sm text-slate-300"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="text-xs font-mono mr-2 text-slate-400">{Math.round(zoom * 100)}%</span>
        <button
          onClick={handleZoomIn}
          className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Uvećaj (+)"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Umanji (-)"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <a
          href={src}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:text-white hover:bg-slate-800 rounded-lg transition"
          title="Otvori original"
        >
          <ExternalLink className="w-4 h-4" />
        </a>
        <div className="w-px h-4 bg-slate-700 my-auto" />
        <button
          onClick={onClose}
          className="p-1.5 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
          title="Zatvori (Esc)"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Image container */}
      <div
        className="max-w-[90vw] max-h-[85vh] overflow-auto flex items-center justify-center p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src}
          alt={alt}
          style={{ transform: `scale(${zoom})`, transition: 'transform 0.15s ease-out' }}
          className="max-w-full max-h-[80vh] object-contain rounded-lg shadow-2xl origin-center"
        />
      </div>

      {alt && (
        <div
          className="absolute bottom-4 px-4 py-2 rounded-lg bg-black/60 backdrop-blur-sm text-xs text-slate-300 max-w-lg text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {alt}
        </div>
      )}
    </div>
  );
};
