import React, { useState, useMemo } from 'react';
import { TocItem } from '../types';
import {
  ListTree,
  Search,
  Hash,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  FoldVertical,
  UnfoldVertical,
} from 'lucide-react';

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
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

  // Identify which headings have direct or nested child headings
  const itemsWithChildren = useMemo(() => {
    const set = new Set<string>();
    for (let i = 0; i < toc.length; i++) {
      if (toc[i + 1] && toc[i + 1].level > toc[i].level) {
        set.add(toc[i].id);
      }
    }
    return set;
  }, [toc]);

  // Compute total descendants count for each heading
  const descendantsCountMap = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 0; i < toc.length; i++) {
      const parentLevel = toc[i].level;
      let count = 0;
      for (let j = i + 1; j < toc.length; j++) {
        if (toc[j].level > parentLevel) {
          count++;
        } else {
          break;
        }
      }
      if (count > 0) {
        map.set(toc[i].id, count);
      }
    }
    return map;
  }, [toc]);

  // Compute which headings are hidden by any collapsed ancestor (single-pass linear stack)
  const hiddenItemIds = useMemo(() => {
    // If user is searching inside TOC, show all matching results without hiding
    if (filterQuery.trim().length > 0) {
      return new Set<string>();
    }

    const hidden = new Set<string>();
    const collapsedStack: { id: string; level: number }[] = [];

    for (let i = 0; i < toc.length; i++) {
      const item = toc[i];

      // Pop closed ancestor scopes
      while (
        collapsedStack.length > 0 &&
        item.level <= collapsedStack[collapsedStack.length - 1].level
      ) {
        collapsedStack.pop();
      }

      // If inside a collapsed ancestor, this item is hidden
      if (collapsedStack.length > 0) {
        hidden.add(item.id);
      }

      // If current item is collapsed, push to stack
      if (collapsedIds.has(item.id)) {
        collapsedStack.push({ id: item.id, level: item.level });
      }
    }

    return hidden;
  }, [toc, collapsedIds, filterQuery]);

  // Filter visible items
  const visibleToc = useMemo(() => {
    return toc.filter((item) => {
      if (filterQuery.trim()) {
        return item.text.toLowerCase().includes(filterQuery.toLowerCase());
      }
      return !hiddenItemIds.has(item.id);
    });
  }, [toc, filterQuery, hiddenItemIds]);

  if (!isOpen) return null;

  const handleToggleCollapse = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setCollapsedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCollapseAll = () => {
    setCollapsedIds(new Set(itemsWithChildren));
  };

  const handleExpandAll = () => {
    setCollapsedIds(new Set());
  };

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
    1: 'pl-1 font-semibold text-slate-900 dark:text-slate-100 text-sm',
    2: 'pl-4 font-medium text-slate-800 dark:text-slate-200 text-xs sm:text-sm',
    3: 'pl-7 text-slate-600 dark:text-slate-400 text-xs',
    4: 'pl-10 text-slate-500 dark:text-slate-400 text-xs',
    5: 'pl-12 text-slate-400 dark:text-slate-500 text-xs',
    6: 'pl-14 text-slate-400 dark:text-slate-500 text-xs',
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
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 text-slate-800 dark:text-slate-200 font-semibold text-xs sm:text-sm truncate">
            <ListTree className="w-4 h-4 text-blue-500 shrink-0" />
            <span className="truncate">Sadržaj dokumenta</span>
            <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
              {toc.length}
            </span>
          </div>

          <div className="flex items-center gap-0.5 shrink-0">
            {/* Quick Collapse / Expand All Buttons */}
            {itemsWithChildren.size > 0 && (
              <>
                <button
                  type="button"
                  onClick={handleCollapseAll}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Skupi sve sekcije"
                  aria-label="Skupi sve sekcije"
                >
                  <FoldVertical className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={handleExpandAll}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Proširi sve sekcije"
                  aria-label="Proširi sve sekcije"
                >
                  <UnfoldVertical className="w-3.5 h-3.5" />
                </button>
                <div className="w-px h-3 bg-slate-200 dark:bg-slate-800 mx-0.5" />
              </>
            )}

            {/* Close button for mobile drawer */}
            <button
              type="button"
              onClick={onToggle}
              className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition cursor-pointer"
              title="Zatvori sadržaj"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filter / Search inside TOC */}
        {toc.length > 5 && (
          <div className="p-2 border-b border-slate-100 dark:border-slate-900">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-xs text-slate-700 dark:text-slate-300">
              <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <input
                type="text"
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                placeholder="Filtriraj naslove..."
                className="bg-transparent w-full outline-none text-xs placeholder:text-slate-400"
              />
              {filterQuery && (
                <button
                  type="button"
                  onClick={() => setFilterQuery('')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          </div>
        )}

        {/* Heading List with Collapsible Sections */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {visibleToc.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              {toc.length === 0
                ? 'Dokument nema naslova (H1-H6)'
                : 'Nema naslova koji odgovaraju pretrazi'}
            </div>
          ) : (
            visibleToc.map((item) => {
              const isActive = activeHeadingId === item.id;
              const isCopied = copiedId === item.id;
              const hasChildren = itemsWithChildren.has(item.id);
              const isCollapsed = collapsedIds.has(item.id);
              const descendantsCount = descendantsCountMap.get(item.id) || 0;

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
                  <div className="flex items-center gap-1 min-w-0 flex-1 pr-1">
                    {/* Collapsible Chevron Toggle for headings with subheadings */}
                    {hasChildren && !filterQuery ? (
                      <button
                        type="button"
                        onClick={(e) => handleToggleCollapse(e, item.id)}
                        className="p-0.5 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition shrink-0 cursor-pointer"
                        title={isCollapsed ? 'Proširi sekciju' : 'Skupi sekciju'}
                        aria-label={isCollapsed ? 'Proširi sekciju' : 'Skupi sekciju'}
                      >
                        {isCollapsed ? (
                          <ChevronRight className="w-3.5 h-3.5" />
                        ) : (
                          <ChevronDown className="w-3.5 h-3.5" />
                        )}
                      </button>
                    ) : (
                      <span className="w-4 shrink-0 flex items-center justify-center">
                        {item.level === 1 && (
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                        )}
                      </span>
                    )}

                    <span className="truncate">{item.text}</span>

                    {/* Descendants counter badge when section is collapsed */}
                    {hasChildren && isCollapsed && descendantsCount > 0 && !filterQuery && (
                      <span
                        className="text-[10px] px-1.5 py-0.2 rounded-full bg-slate-200/80 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-mono font-medium shrink-0 select-none"
                        title={`${descendantsCount} skrivenih podsekcija`}
                      >
                        +{descendantsCount}
                      </span>
                    )}
                  </div>

                  {/* Copy Heading Anchor Button */}
                  <button
                    type="button"
                    onClick={(e) => handleCopyLink(e, item.id)}
                    className={`opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition shrink-0 ${
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
