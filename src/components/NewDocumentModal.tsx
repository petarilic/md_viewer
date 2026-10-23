import React, { useState, useMemo, useEffect } from 'react';
import {
  X,
  FilePlus,
  Sparkles,
  Check,
  ArrowRight,
  Search,
  Terminal,
  History,
  Scale,
  BookOpen,
  Layers,
  FileText,
  GitPullRequest,
  Bug,
  Eye,
  FileCode,
} from 'lucide-react';
import { DOCUMENT_TEMPLATES } from '../data/templates';
import { DocumentTemplate, TemplateCategory } from '../types';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, content: string) => void;
  initialTemplateId?: string;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  onCreate,
  initialTemplateId = 'empty',
}) => {
  const safeId = typeof initialTemplateId === 'string' && initialTemplateId.trim().length > 0 ? initialTemplateId : 'empty';
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(safeId);
  const [docName, setDocName] = useState('Untitled.md');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<TemplateCategory>('all');
  const [showPreview, setShowPreview] = useState(false);

  // Sync initial template and reset controls when opened
  useEffect(() => {
    if (isOpen) {
      const templateToSelect = typeof initialTemplateId === 'string' && initialTemplateId.trim().length > 0 ? initialTemplateId : 'empty';
      setSelectedTemplateId(templateToSelect);
      const tmpl = DOCUMENT_TEMPLATES.find((t) => t.id === templateToSelect);
      if (tmpl) {
        setDocName(tmpl.defaultFilename);
      } else {
        setDocName('Untitled.md');
      }
      setSearchQuery('');
      setSelectedCategory('all');
      setShowPreview(false);
    }
  }, [isOpen, initialTemplateId]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Selected template object
  const currentTemplate = useMemo(() => {
    return (
      DOCUMENT_TEMPLATES.find((t) => t.id === selectedTemplateId) ||
      DOCUMENT_TEMPLATES[0]
    );
  }, [selectedTemplateId]);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return DOCUMENT_TEMPLATES.filter((tmpl) => {
      // Category filter
      if (selectedCategory !== 'all') {
        if (selectedCategory === 'popular' && tmpl.category !== 'popular' && !['api-docs', 'changelog', 'license'].includes(tmpl.id)) {
          return false;
        }
        if (selectedCategory !== 'popular' && tmpl.category !== selectedCategory) {
          return false;
        }
      }

      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = tmpl.name.toLowerCase().includes(query);
        const matchesDesc = tmpl.description.toLowerCase().includes(query);
        const matchesFilename = tmpl.defaultFilename.toLowerCase().includes(query);
        const matchesId = tmpl.id.toLowerCase().includes(query);
        return matchesName || matchesDesc || matchesFilename || matchesId;
      }

      return true;
    });
  }, [selectedCategory, searchQuery]);

  if (!isOpen) return null;

  const handleSelectTemplate = (tmpl: DocumentTemplate) => {
    setSelectedTemplateId(tmpl.id);
    setDocName(tmpl.defaultFilename);
  };

  const handleConfirm = () => {
    const tmpl = currentTemplate;
    const content = tmpl ? tmpl.content : '';
    const cleanName = docName.trim() || 'Untitled.md';
    onCreate(cleanName.endsWith('.md') ? cleanName : `${cleanName}.md`, content);
    onClose();
  };

  // Render appropriate template icon
  const renderTemplateIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Terminal':
        return <Terminal className="w-4 h-4 text-emerald-500" />;
      case 'History':
        return <History className="w-4 h-4 text-blue-500" />;
      case 'Scale':
        return <Scale className="w-4 h-4 text-purple-500" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-amber-500" />;
      case 'Layers':
        return <Layers className="w-4 h-4 text-indigo-500" />;
      case 'GitPullRequest':
        return <GitPullRequest className="w-4 h-4 text-teal-500" />;
      case 'Bug':
        return <Bug className="w-4 h-4 text-rose-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-bold text-base">
            <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <FilePlus className="w-4 h-4" />
            </div>
            <div>
              <div className="text-sm sm:text-base font-bold">Novi Markdown Dokument iz Šablona</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal">
                Izaberite gotov šablon za API dokumentaciju, Changelog, licencu ili započnite prazan fajl
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            aria-label="Zatvori"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Controls: Search & Category Filter */}
        <div className="px-5 pt-3.5 pb-2 border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 space-y-2.5">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Pretraži šablone (npr. API, changelog, licenca, readme)..."
                className="w-full pl-9 pr-3.5 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 transition shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Toggle Preview Button */}
            <button
              onClick={() => setShowPreview(!showPreview)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition cursor-pointer shrink-0 ${
                showPreview
                  ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-300 dark:border-blue-800 text-blue-600 dark:text-blue-400 font-semibold'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Pregled teksta izabranog šablona"
            >
              <Eye className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pregled</span>
            </button>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs no-scrollbar">
            {[
              { id: 'all', label: 'Svi šabloni' },
              { id: 'popular', label: 'Popularno' },
              { id: 'development', label: 'Razvoj & API' },
              { id: 'documentation', label: 'Dokumentacija' },
              { id: 'legal', label: 'Licenca & Pravno' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as TemplateCategory)}
                className={`px-3 py-1 rounded-lg font-medium whitespace-nowrap transition cursor-pointer text-xs ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body content: Templates Grid + Optional Preview Pane */}
        <div className="flex-1 overflow-y-auto p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Templates List */}
          <div className={`${showPreview ? 'md:col-span-1' : 'md:col-span-2'} space-y-2`}>
            <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between">
              <span>Dostupni šabloni ({filteredTemplates.length})</span>
              <span className="text-[10px] lowercase font-normal">Dvoklik za trenutno kreiranje</span>
            </div>

            {filteredTemplates.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Nije pronađen nijedan šablon koji odgovara upitu &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div
                className={`grid gap-2.5 ${
                  showPreview ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'
                }`}
              >
                {filteredTemplates.map((tmpl) => {
                  const isSelected = selectedTemplateId === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl)}
                      onDoubleClick={handleConfirm}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 shadow-xs ring-1 ring-blue-500'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                      }`}
                    >
                      <div>
                        {/* Top info: Icon, Name, Badge */}
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0">
                              {renderTemplateIcon(tmpl.iconName)}
                            </div>
                            <div>
                              <div className="font-semibold text-xs text-slate-900 dark:text-slate-100">
                                {tmpl.name}
                              </div>
                              <div className="text-[10px] font-mono text-slate-400">
                                {tmpl.defaultFilename}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-1">
                            {tmpl.badge && (
                              <span className="text-[10px] px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-medium">
                                {tmpl.badge}
                              </span>
                            )}
                            <div
                              className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ml-1 ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-slate-300 dark:border-slate-700 text-transparent'
                              }`}
                            >
                              <Check className="w-2.5 h-2.5" />
                            </div>
                          </div>
                        </div>

                        {/* Description */}
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                          {tmpl.description}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Preview Pane (when enabled) */}
          {showPreview && (
            <div className="md:col-span-1 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-950 flex flex-col overflow-hidden max-h-[380px]">
              <div className="px-3.5 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                  <FileCode className="w-3.5 h-3.5 text-blue-500" />
                  <span>Pregled koda šablona</span>
                </div>
                <span className="text-[10px] font-mono text-slate-400">
                  {currentTemplate.defaultFilename}
                </span>
              </div>
              <div className="p-3 overflow-y-auto flex-1 font-mono text-[11px] text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed select-text">
                {currentTemplate.content}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Filename Config & Actions */}
        <div className="px-5 py-3.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Input name */}
            <div className="flex-1 flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 shrink-0">
                Naziv fajla:
              </label>
              <div className="relative flex-1">
                <input
                  type="text"
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleConfirm();
                    }
                  }}
                  className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 text-xs font-mono"
                  placeholder="MojDokument.md"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-2 shrink-0">
              <button
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-xl text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Otkaži
              </button>
              <button
                onClick={handleConfirm}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <span>Kreiraj fajl</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
