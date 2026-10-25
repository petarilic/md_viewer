import React, { useState, useEffect } from 'react';
import {
  X,
  FileText,
  Info,
  Clock,
  Code2,
  Shield,
  FileCheck,
  Mail,
  ExternalLink,
  ChevronRight,
  ArrowLeft,
  Sparkles,
  Copy,
  Check,
} from 'lucide-react';
import { APP_ABOUT_CONFIG, AboutConfig } from '../config/aboutConfig';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: AboutConfig;
}

type SubView = 'main' | 'privacy' | 'terms' | 'changelog';

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  config = APP_ABOUT_CONFIG,
}) => {
  const [activeSubView, setActiveSubView] = useState<SubView>('main');
  const [emailCopied, setEmailCopied] = useState(false);

  // Reset to main view whenever modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveSubView('main');
      setEmailCopied(false);
    }
  }, [isOpen]);

  // Handle ESC key to close or return to main sub-view
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (activeSubView !== 'main') {
          setActiveSubView('main');
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, activeSubView, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (config.supportEmail) {
      navigator.clipboard.writeText(config.supportEmail);
      setEmailCopied(true);
      setTimeout(() => setEmailCopied(false), 2000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
    >
      <div
        className="relative w-full max-w-[490px] max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl shadow-indigo-950/15 dark:shadow-black/60 overflow-hidden animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="relative flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2">
            {activeSubView !== 'main' ? (
              <button
                onClick={() => setActiveSubView('main')}
                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 p-1 -ml-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition cursor-pointer"
                title="Nazad na pregled"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Nazad</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span
                  id="about-modal-title"
                  className="text-base font-bold text-slate-800 dark:text-slate-100 tracking-tight"
                >
                  O aplikaciji
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold border border-slate-200 dark:border-slate-700">
                  ~
                </span>
              </div>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Zatvori (Esc)"
            aria-label="Zatvori"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5 text-slate-700 dark:text-slate-300">
          {activeSubView === 'main' ? (
            <>
              {/* App Identity Section (Faithful to illustration) */}
              <div className="flex flex-col items-center text-center pt-1 pb-2">
                {/* Application Logo Container */}
                <div className="relative mb-3 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-center shadow-inner">
                    <div className="w-12 h-14 rounded-lg bg-indigo-600 dark:bg-indigo-500 shadow-md flex flex-col justify-center items-center gap-1.5 p-2">
                      <div className="w-full h-1 bg-white/90 rounded-full" />
                      <div className="w-full h-1 bg-white/90 rounded-full" />
                      <div className="w-3/4 h-1 bg-white/90 rounded-full self-start" />
                      <div className="w-full h-1 bg-white/80 rounded-full" />
                    </div>
                  </div>
                </div>

                <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 tracking-tight">
                  {config.name}
                </h2>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5">
                  Verzija {config.version}
                </div>

                <p className="text-xs sm:text-[13px] text-slate-600 dark:text-slate-400 max-w-sm mt-2.5 leading-relaxed">
                  {config.shortDescription}
                </p>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Informational Cards (About, Release info, Developer) */}
              <div className="space-y-3.5">
                {/* About the application */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                    <Info className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-snug">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      O aplikaciji
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {config.aboutDetails}
                    </div>
                  </div>
                </div>

                {/* Release information */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-snug">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Informacije o izdanju
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 space-y-0.5">
                      <div>Datum izdanja: {config.releaseDate}</div>
                      <div>Build: {config.buildNumber}</div>
                    </div>
                  </div>
                </div>

                {/* Developer */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <div className="text-left leading-snug">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Razvoj i licenca
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {config.developer} {config.license ? `• ${config.license}` : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-100 dark:border-slate-800" />

              {/* Useful Links List (Privacy, Terms, Support, Changelog) */}
              <div className="space-y-1">
                {/* Privacy Policy */}
                <button
                  onClick={() => setActiveSubView('privacy')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition cursor-pointer text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <Shield className="w-4 h-4 text-indigo-500" />
                    <span className="font-medium">Politika privatnosti</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition" />
                </button>

                {/* Terms of Use */}
                <button
                  onClick={() => setActiveSubView('terms')}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition cursor-pointer text-xs group"
                >
                  <div className="flex items-center gap-2.5">
                    <FileCheck className="w-4 h-4 text-emerald-500" />
                    <span className="font-medium">Uslovi korišćenja</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition" />
                </button>

                {/* What's New / Changelog */}
                {config.whatsNew && config.whatsNew.length > 0 && (
                  <button
                    onClick={() => setActiveSubView('changelog')}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition cursor-pointer text-xs group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span className="font-medium">Šta je novo u verziji {config.version}</span>
                    </div>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 group-hover:translate-x-0.5 transition" />
                  </button>
                )}

                {/* Contact & Support */}
                {config.supportEmail && (
                  <div className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition text-xs">
                    <div className="flex items-center gap-2.5">
                      <Mail className="w-4 h-4 text-rose-500" />
                      <span className="font-medium">Podrška i kontakt</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <a
                        href={`mailto:${config.supportEmail}?subject=MD%20Viewer%20Upit`}
                        className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1 font-medium"
                        title="Pošalji email"
                      >
                        {config.supportEmail}
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        onClick={handleCopyEmail}
                        className="p-1 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer"
                        title="Kopiraj email"
                      >
                        {emailCopied ? (
                          <Check className="w-3 h-3 text-emerald-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : activeSubView === 'privacy' ? (
            /* Sub-View: Privacy Policy */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Shield className="w-5 h-5 text-indigo-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Politika privatnosti
                </h3>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                {config.privacyPolicyText}
              </div>
            </div>
          ) : activeSubView === 'terms' ? (
            /* Sub-View: Terms of Use */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <FileCheck className="w-5 h-5 text-emerald-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Uslovi korišćenja
                </h3>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-950/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800/80">
                {config.termsOfUseText}
              </div>
            </div>
          ) : (
            /* Sub-View: Changelog / What's New */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Novosti i izdanja (Changelog)
                </h3>
              </div>
              <div className="space-y-4">
                {config.whatsNew?.map((item) => (
                  <div
                    key={item.version}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between font-semibold text-slate-900 dark:text-slate-100">
                      <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                        <FileText className="w-3.5 h-3.5" />
                        Verzija {item.version}
                      </span>
                      <span className="text-[10px] text-slate-400 font-normal">{item.date}</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-300 pl-4 list-disc">
                      {item.highlights.map((h, i) => (
                        <li key={i}>{h}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer (Faithful to illustration) */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {config.copyright}
          </div>
          <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {config.madeWithText}
          </div>
        </div>
      </div>
    </div>
  );
};
