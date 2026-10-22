import React, { useState } from 'react';
import { X, FilePlus, Sparkles, Check, ArrowRight } from 'lucide-react';
import { DOCUMENT_TEMPLATES } from '../data/templates';
import { TemplateId } from '../types';

interface NewDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, content: string) => void;
}

export const NewDocumentModal: React.FC<NewDocumentModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateId>('empty');
  const [docName, setDocName] = useState('Untitled.md');

  if (!isOpen) return null;

  const handleSelectTemplate = (templateId: TemplateId) => {
    setSelectedTemplate(templateId);
    const tmpl = DOCUMENT_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setDocName(tmpl.defaultFilename);
    }
  };

  const handleConfirm = () => {
    const tmpl = DOCUMENT_TEMPLATES.find((t) => t.id === selectedTemplate);
    const content = tmpl ? tmpl.content : '';
    const cleanName = docName.trim() || 'Untitled.md';
    onCreate(cleanName.endsWith('.md') ? cleanName : `${cleanName}.md`, content);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5 text-slate-900 dark:text-slate-100 font-semibold text-base">
            <FilePlus className="w-5 h-5 text-blue-500" />
            <span>Kreiraj novi Markdown dokument</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Document Name input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Naziv dokumenta
            </label>
            <input
              type="text"
              value={docName}
              onChange={(e) => setDocName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 outline-none focus:border-blue-500 text-sm font-mono"
              placeholder="Untitled.md"
            />
          </div>

          {/* Template Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
              Izaberite početni šablon
            </label>
            <div className="grid grid-cols-1 gap-2.5">
              {DOCUMENT_TEMPLATES.map((tmpl) => {
                const isSelected = selectedTemplate === tmpl.id;
                return (
                  <div
                    key={tmpl.id}
                    onClick={() => handleSelectTemplate(tmpl.id)}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition flex items-start justify-between ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/40 text-blue-900 dark:text-blue-100'
                        : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-xs sm:text-sm flex items-center gap-1.5">
                        {tmpl.id !== 'empty' && (
                          <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        )}
                        <span>{tmpl.name}</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        {tmpl.description}
                      </div>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                        isSelected
                          ? 'bg-blue-600 text-white'
                          : 'border border-slate-300 dark:border-slate-700 text-transparent'
                      }`}
                    >
                      <Check className="w-3 h-3" />
                    </div>
                  </div>
                );
              })}
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
            onClick={handleConfirm}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium shadow-sm transition"
          >
            <span>Kreiraj dokument</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
