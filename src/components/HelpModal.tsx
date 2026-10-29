import React, { useState, useEffect, useMemo } from 'react';
import {
  X,
  HelpCircle,
  FilePlus,
  FolderOpen,
  Save,
  Columns,
  Eye,
  Edit3,
  Search,
  Replace,
  FileType,
  Globe,
  FileText,
  Sliders,
  Keyboard,
  ListTree,
  Sparkles,
  ExternalLink,
  BookOpen,
  ArrowUp,
  Sun,
  Moon,
  GitCompare,
} from 'lucide-react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSampleGuide?: () => void;
}

interface HelpTopic {
  id: string;
  category: 'general' | 'modes' | 'editor' | 'export' | 'shortcuts';
  title: string;
  icon: React.ReactNode;
  summary: string;
  details: string[];
  shortcut?: string;
}

export const HelpModal: React.FC<HelpModalProps> = ({
  isOpen,
  onClose,
  onOpenSampleGuide,
}) => {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Reset tab and search on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const topics: HelpTopic[] = useMemo(
    () => [
      {
        id: 'new-open',
        category: 'general',
        title: 'Kreiranje i otvaranje dokumenata',
        icon: <FolderOpen className="w-4 h-4 text-blue-500" />,
        summary: 'Brzo kreiranje novih dokumenata, otvaranje sa diska ili interneta.',
        details: [
          'Kreirajte novi prazan dokument ili izaberite neki od gotovih šablona (README, API, Specifikacija, Beleške).',
          'Otvorite Markdown fajlove (.md, .markdown, .txt) direktno sa vašeg računara pomoću modernog File System API-ja ili standardnog dijaloga.',
          'Učitajte dokument direktno sa javne web adrese (npr. GitHub Raw URL).',
          'Jednostavno prevucite i pustite (Drag & Drop) fajl sa radne površine bilo gde u prozor aplikacije.',
        ],
        shortcut: 'Ctrl+N / Ctrl+O',
      },
      {
        id: 'view-modes',
        category: 'modes',
        title: 'Tri režima prikaza (View Modes)',
        icon: <Columns className="w-4 h-4 text-purple-500" />,
        summary: 'Prilagodite radni prostor vašim potrebama: čitanje, uređivanje ili oboje paralelno.',
        details: [
          'Uredi (Edit - Olovka): Napredan editor sa rednim brojevima linija, prelamanjem teksta i podrškom za Undo/Redo operacije.',
          'Podeljeno (Split - Kolone): Paralelni prikaz gde sa jedne strane kucate, a sa druge trenutno vidite formatirani rezultat uz automatski sinhronizovano skrolovanje.',
          'Prikaz (Rendered - Oko): Čist, stilizovan formatirani prikaz sa syntax highlighting-om za kôd, tabelama, formulama i mogućnošću kopiranja blokova koda jednim klikom.',
          'Nezavisno pamćenje režima po dokumentu: Svaki otvoreni dokument zasebno pamti svoj režim rada (Uredi, Podeljeno ili Prikaz). Prebacivanjem između tabova automatski se aktivira i vraća sačuvani režim za dati fajl.',
        ],
      },
      {
        id: 'split-screen-diff',
        category: 'modes',
        title: 'Split Screen Mode i Diff poređenje dokumenata',
        icon: <GitCompare className="w-4 h-4 text-indigo-500" />,
        summary: 'Istovremeni rad sa dva dokumenta i detaljna linijska analiza razlika.',
        details: [
          'Split Screen Mode: Dugme se automatski pojavljuje isključivo kada su u aplikaciji otvorena tačno dva dokumenta. Omogućava vam rad sa dva različita fajla na jednom ekranu.',
          'Ponašanje u Split Screen Mode-u: Opcije "Uredi" i "Prikaz" prikazuju dokumente jedan pored drugog (side-by-side), dok opcija "Podeljeno" prikazuje dokumente jedan ispod drugog (stacked), pri čemu svaki dokument u svom redu ima Markdown editor paralelno pored formatiranog prikaza.',
          'Diff analiza razlika: Opcija Diff se pojavljuje kada su otvorena dva dokumenta i aktiviran Split Screen Mode. Automatski upoređuje sadržaj dva dokumenta i izlistava razlike.',
          'Prikaz vrednosti i brojeva linija: Diff lista prikazuje broj linije i uporednu vrednost iz levog naspram desnog dokumenta.',
          'Kolor-kodirano markiranje: Linije koje se razlikuju označene su bojama u dokumentima (zelena za dodavanja, crvena za uklanjanja, žuta/ćilibar za izmene) i u poravnatoj tabeli razlika.',
          'Brze opcije: U Split Screen zaglavlju možete zameniti mesta levom i desnom dokumentu i uključiti ili isključiti sinhronizovano skrolovanje.',
        ],
      },
      {
        id: 'toc-nav',
        category: 'editor',
        title: 'Sadržaj dokumenta i sklopive sekcije (TOC)',
        icon: <ListTree className="w-4 h-4 text-emerald-500" />,
        summary: 'Lako kretanje kroz dugačke dokumente uz sklopive nivoe naslova.',
        details: [
          'Bočna traka automatski generiše hijerarhiju naslova (H1 do H6) iz vašeg dokumenta.',
          'Sklapanje sekcija: Kliknite na strelicu pored roditeljskog naslova da biste saželi podsekcije; pored se prikazuje brojač (npr. +3) sakrivenih stavki.',
          'Brza globalna dugmad: Upotrebite "Skupi sve" ili "Proširi sve" u zaglavlju bočne trake za brzo organizovanje velikih fajlova.',
          'Pretraga sadržaja: Filtrirajte naslove unosom reči u polje za pretragu na vrhu bočne trake.',
          'Kopiranje sidrenog linka: Pređite mišem preko naslova i kliknite ikonicu heša (#) da kopirate direktan link.',
        ],
      },
      {
        id: 'search-replace',
        category: 'editor',
        title: 'Pretraga i zamena teksta',
        icon: <Search className="w-4 h-4 text-amber-500" />,
        summary: 'Pronađite i zamenite reči i fraze u sekundi.',
        details: [
          'Pritisnite Ctrl+F da biste otvorili traku za brzu pretragu teksta sa brojačem podudaranja i tasterima za kretanje kroz rezultate.',
          'Pritisnite Ctrl+H u editoru za prozor zamene teksta (pojedinačna zamena ili "Zameni sve").',
          'Podržane su opcije za razlikovanje velikih i malih slova (Aa) i cele reči.',
        ],
        shortcut: 'Ctrl+F / Ctrl+H',
      },
      {
        id: 'export-save',
        category: 'export',
        title: 'Čuvanje i izvoz u više formata',
        icon: <Save className="w-4 h-4 text-rose-500" />,
        summary: 'Izvoz u PDF, HTML, Word, čist tekst ili preuzimanje izvornog Markdown-a.',
        details: [
          'Sačuvaj (Ctrl+S): Snimite izmene direktno u otvoreni fajl na računaru.',
          'Sačuvaj kao PDF (Ctrl+P): Otvara prozor u kome birate željeno ime i lokaciju; izvoz čuva identičnu strukturu i stilove.',
          'Izvoz u HTML (.html): Generiše samostalnu web stranicu sa ugrađenim stilovima, automatskim tamnim/svetlim modom i dugmadima za kopiranje koda.',
          'Izvoz u Word (.docx) i Čist tekst (.txt): Prilagođeno deljenju sa korisnicima bez Markdown čitača.',
          'Preuzimanje izvornog koda (.md) ili kopiranje u privremenu memoriju (clipboard).',
        ],
        shortcut: 'Ctrl+S / Ctrl+P',
      },
      {
        id: 'settings-themes',
        category: 'general',
        title: 'Izgled, teme i prilagođavanje',
        icon: <Sliders className="w-4 h-4 text-indigo-500" />,
        summary: 'Prilagodite veličinu teksta, tipografiju i temu.',
        details: [
          'Brza promena teme: Klikom na ikonu Sunce/Mesec u gornjoj traci trenutno prebacujete između svetle i tamne teme.',
          'Podešavanja prikaza: Podesite familiju fonta (Sans, Serif, Mono), veličinu fonta, širinu čitanja, prored i format papira (A4, A3, A5, US Letter, US Legal).',
          'Proračun strana i živa paginacija: U dnu ekrana u statusnoj traci ispisuje se ukupan broj strana i ažurira trenutna strana tokom skrolovanja (npr. Strana 2 od 5 (A4)) uz brzi klik za promenu formata.',
          'Scroll to top dugme: Pojavljuje se u donjem desnom uglu kada skrolujete naniže za glatki povratak na početak.',
        ],
      },
      {
        id: 'keyboard-shortcuts',
        category: 'shortcuts',
        title: 'Najvažnije prečice na tastaturi',
        icon: <Keyboard className="w-4 h-4 text-cyan-500" />,
        summary: 'Radite brže bez napuštanja tastature.',
        details: [
          'F1 — Otvaranje ove pomoći (Help)',
          'Ctrl + N — Novi prazan dokument',
          'Ctrl + O — Otvori lokalni dokument',
          'Ctrl + S — Sačuvaj trenutni dokument',
          'Ctrl + P — Sačuvaj / Izvezi kao PDF dokument',
          'Ctrl + F — Pretraga teksta u dokumentu',
          'Ctrl + H — Pretraga i zamena teksta (u editoru)',
          'Ctrl + Z / Ctrl + Y — Poništi (Undo) / Ponovi (Redo)',
          '~ (tilda) — Informacije o aplikaciji (About modal)',
          'Esc — Zatvaranje dijaloga, pretrage i modala',
          'F11 — Prikaz preko celog ekrana (Fullscreen)',
        ],
      },
    ],
    []
  );

  const filteredTopics = useMemo(() => {
    return topics.filter((t) => {
      const matchesCategory = activeTab === 'all' || t.category === activeTab;
      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q) ||
        t.details.some((d) => d.toLowerCase().includes(q)) ||
        (t.shortcut && t.shortcut.toLowerCase().includes(q))
      );
    });
  }, [topics, activeTab, searchQuery]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="help-modal-title"
    >
      <div
        className="relative w-full max-w-2xl max-h-[92vh] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl shadow-blue-950/20 dark:shadow-black/60 overflow-hidden animate-in zoom-in-95 duration-200 select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
              <HelpCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2
                  id="help-modal-title"
                  className="text-base font-bold text-slate-900 dark:text-slate-100 tracking-tight"
                >
                  Pomoć i uputstvo za upotrebu
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
                  F1
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Pregled osnovnih funkcionalnosti, režima rada i prečica
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
            title="Zatvori (Esc)"
            aria-label="Zatvori pomoć"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search & Tabs Filter Bar */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-100 dark:border-slate-800/80 space-y-3 bg-white dark:bg-slate-900">
          {/* Quick Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Pretraži funkcionalnosti, prečice ili opcije..."
              className="w-full pl-9 pr-8 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs scrollbar-none">
            {[
              { id: 'all', label: 'Sve' },
              { id: 'general', label: 'Osnove' },
              { id: 'modes', label: 'Režimi' },
              { id: 'editor', label: 'Editor & TOC' },
              { id: 'export', label: 'Izvoz' },
              { id: 'shortcuts', label: 'Prečice' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium whitespace-nowrap transition cursor-pointer text-xs ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Topics Content */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 text-slate-700 dark:text-slate-300">
          {filteredTopics.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                Nije pronađena pomoć za "{searchQuery}"
              </div>
              <div className="text-xs mt-1">Pokušajte sa drugačijim pojmom ili izaberite kategoriju "Sve".</div>
            </div>
          ) : (
            filteredTopics.map((topic) => (
              <div
                key={topic.id}
                className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/80 space-y-2.5 transition hover:border-blue-200 dark:hover:border-blue-900/60"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
                      {topic.icon}
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                        {topic.title}
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {topic.summary}
                      </p>
                    </div>
                  </div>

                  {topic.shortcut && (
                    <kbd className="hidden sm:inline-block font-mono text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shadow-2xs shrink-0">
                      {topic.shortcut}
                    </kbd>
                  )}
                </div>

                <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300 pl-4 list-disc leading-relaxed">
                  {topic.details.map((detail, idx) => (
                    <li key={idx}>
                      {detail.includes(' — ') ? (
                        <>
                          <strong className="font-semibold text-slate-800 dark:text-slate-200">
                            {detail.split(' — ')[0]}
                          </strong>
                          {' — '}
                          {detail.split(' — ')[1]}
                        </>
                      ) : detail.includes(': ') ? (
                        <>
                          <strong className="font-semibold text-slate-800 dark:text-slate-200">
                            {detail.split(': ')[0]}:
                          </strong>{' '}
                          {detail.split(': ').slice(1).join(': ')}
                        </>
                      ) : (
                        detail
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}

          {/* Quick Sample Guide Action */}
          {onOpenSampleGuide && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-200 dark:border-blue-900/60 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                <div className="text-xs">
                  <div className="font-bold text-slate-900 dark:text-slate-100">
                    Želite praktičan primer?
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 text-[11px]">
                    Otvorite interaktivni korisnički vodič sa primerima sintakse i prečicama.
                  </div>
                </div>
              </div>
              <button
                onClick={() => {
                  onOpenSampleGuide();
                  onClose();
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer whitespace-nowrap shrink-0"
              >
                Učitaj vodič
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2 text-[11px]">
            <span>Savet: Pritisnite</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
              F1
            </kbd>
            <span>za pomoć ili</span>
            <kbd className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold">
              Esc
            </kbd>
            <span>za zatvaranje</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200/80 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium transition cursor-pointer text-xs"
          >
            Zatvori
          </button>
        </div>
      </div>
    </div>
  );
};
