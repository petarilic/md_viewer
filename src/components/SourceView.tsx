import React, { useState } from 'react';
import { Copy, Check, WrapText } from 'lucide-react';
import { ViewerSettings } from '../types';

interface SourceViewProps {
  content: string;
  settings: ViewerSettings;
  onCopySuccess: () => void;
}

export const SourceView: React.FC<SourceViewProps> = ({ content, settings, onCopySuccess }) => {
  const [wordWrap, setWordWrap] = useState(true);
  const [copied, setCopied] = useState(false);

  const lines = content.split(/\r?\n/);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    onCopySuccess();
    setTimeout(() => setCopied(false), 2000);
  };

  const fontSizeClasses = {
    sm: 'text-xs',
    base: 'text-sm',
    lg: 'text-base',
    xl: 'text-lg',
  };

  return (
    <div className="w-full h-full flex flex-col bg-slate-900 text-slate-100 font-mono">
      {/* Mini toolbar */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-950/60 text-xs text-slate-400 select-none">
        <div className="flex items-center gap-3">
          <span>Izvorni Markdown</span>
          <span className="text-slate-500">•</span>
          <span>{lines.length} linija</span>
          <span className="text-slate-500">•</span>
          <span>{content.length} karaktera</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition ${
              wordWrap
                ? 'bg-blue-900/60 text-blue-300 border border-blue-700/50'
                : 'hover:bg-slate-800 text-slate-400 hover:text-white'
            }`}
            title="Prelomi duge redove"
          >
            <WrapText className="w-3.5 h-3.5" />
            <span>Prelom</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition cursor-pointer"
            title="Kopiraj ceo izvorni tekst"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Kopirano!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Kopiraj sve</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor Body */}
      <div className="flex-1 overflow-auto p-4 flex">
        {/* Line numbers column */}
        <div className="select-none pr-4 text-right text-slate-600 border-r border-slate-800 mr-4 shrink-0 font-mono">
          {lines.map((_, i) => (
            <div key={i} className={`${fontSizeClasses[settings.fontSize]} leading-6`}>
              {i + 1}
            </div>
          ))}
        </div>

        {/* Text lines */}
        <div
          className={`flex-1 font-mono text-slate-200 ${fontSizeClasses[settings.fontSize]} leading-6 ${
            wordWrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre overflow-x-auto'
          }`}
        >
          {lines.map((line, i) => (
            <div key={i} className="hover:bg-slate-800/40 px-1 -mx-1 rounded">
              {line || '\u00A0'}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
