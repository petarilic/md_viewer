import React, { useState } from 'react';
import { TocItem } from '../types';
import { ListTree, Search, Hash, Check, X } from 'lucide-react';

interface TOCSidebarProps {
  toc: TocItem[];
  activeHeadingId: string | null;
  onSelectHeading: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  onCopyAnchor: (anchor: string) => void;
}

export const TOCSidebar: React.FC<TOCSidebarProps> = ({
  toc,
  activeHeadingId,
  onSelectHeading,
  isOpen,
  onToggle,
  onCopyAnchor,
}) => {
  const [filterQuery, setFilterQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredToc = toc.filter((item) =>
    item.text.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const handleCopyLink = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onCopyAnchor(`#${id}`);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleHeadingClick = (id: string) => {
    onSelectHeading(id);
    // On mobile, auto-close the drawer so the user sees the section
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      onToggle();
    }
  };

  // Indentation levels
  const levelStyles: Record<number, string> = {
    1: 'pl-2 font-semibold text-slate-900 dark:text-slate-100 text-sm',
    2: 'pl-4 font-medium text-slate-800 dark:text-slate-200 text-sm',
    3: 'pl-6 text-slate-600 dark:text-slate-400 text-xs',
    4: 'pl-8 text-slate-500 dark:text-slate-400 text-xs',
    5: 'pl-10 text-slate-400 dark:text-slate-500 text-xs',
    6: 'pl-12 text-slate-400 dark:text-slate-500 text-xs',
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in duration-200"
        onClick={onToggle}
        aria-hidden="true"
      />

      {/* Sidebar Container: Drawer on mobile, sidebar on desktop */}
      <aside
        className="fixed inset-y-0 left-0 z-50 md:relative md:z-30 w-72 lg:w-80 shrink-0 h-full border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col shadow-2xl md:shadow-none transition-all select-none no-print animate-in slide-in-from-left duration-200"
        aria-label="Sadržaj dokumenta"
      >
        {/* Header */}
        <div className="p-3.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200 font-semibold text-sm">
            <ListTree className="w-4 h-4 text-blue-500" />
            <span>Sadržaj dokumenta</span>
            <span className="text-[11px] font-normal px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
              {toc.length}
            </span>
          </div>

          {/* Close button for mobile drawer */}
          <button
            type="button"
            onClick={onToggle}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition cursor-pointer"
            title="Zatvori sadržaj"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter / Search inside TOC */}
        {toc.length > 5 && (
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-900">
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filtriraj naslove..."
                className="bg-transparent w-full outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
        )}

        {/* Heading List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {filteredToc.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              {toc.length === 0
                ? 'Dokument nema naslova (H1-H6)'
                : 'Nema naslova koji odgovaraju pretrazi'}
            </div>
          ) : (
            filteredToc.map((item) => {
              const isActive = activeHeadingId === item.id;
              const isCopied = copiedId === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleHeadingClick(item.id)}
                  className={`group flex items-center justify-between rounded-lg py-1.5 pr-2 transition cursor-pointer ${
                    levelStyles[item.level] || 'pl-2 text-xs'
                  } ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 font-semibold shadow-xs'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-900/80 hover:text-slate-900 dark:hover:text-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-1.5 min-w-0 flex-1 pr-1">
                    {item.level === 1 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0" />
                    )}
                    {item.level > 1 && (
                      <span className="text-[10px] text-slate-400 shrink-0 select-none">
                        {'#'.repeat(item.level)}
                      </span>
                    )}
                    <span className="truncate">{item.text}</span>
                  </div>

                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, item.id)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition ${
                      isCopied ? '!opacity-100 text-emerald-500' : ''
                    }`}
                    title="Kopiraj link naslova"
                  >
                    {isCopied ? (
                      <Check className="w-3 h-3 text-emerald-500" />
                    ) : (
                      <Hash className="w-3 h-3" />
                    )}
                  </button>
                </div>
              );
            })
          )}
        </div>
      </aside>
    </>
  );
};
