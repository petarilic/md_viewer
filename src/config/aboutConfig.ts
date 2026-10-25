export interface AboutConfig {
  name: string;
  version: string;
  buildNumber: string;
  releaseDate: string;
  shortDescription: string;
  aboutDetails: string;
  developer: string;
  developerRole?: string;
  website?: string;
  supportEmail?: string;
  privacyPolicyUrl?: string;
  termsUrl?: string;
  license?: string;
  githubUrl?: string;
  copyright: string;
  madeWithText: string;
  whatsNew?: {
    version: string;
    date: string;
    highlights: string[];
  }[];
  privacyPolicyText?: string;
  termsOfUseText?: string;
}

export const APP_ABOUT_CONFIG: AboutConfig = {
  name: 'Markdown Viewer',
  version: '1.2.0',
  buildNumber: '125',
  releaseDate: '25. oktobar 2026.',
  shortDescription:
    'Jednostavan i moćan alat za pregled, uređivanje i izvoz Markdown dokumenata.',
  aboutDetails:
    'Kreirajte, pregledajte, uređujte i izvozite Markdown dokumente u čistom i intuitivnom interfejsu.',
  developer: 'MD Viewer Team',
  developerRole: 'Petar & Saradnici',
  website: 'https://markdownviewer.app',
  supportEmail: 'petar.pancevo@gmail.com',
  license: 'MIT Licenca (Open Source)',
  githubUrl: 'https://github.com/markdown-viewer/md-viewer',
  copyright: '© 2026 Markdown Viewer. Sva prava zadržana.',
  madeWithText: 'Napravljeno sa pažnjom • Made with care.',
  whatsNew: [
    {
      version: '1.2.0',
      date: '25. oktobar 2026',
      highlights: [
        '[Nova funkcija] Integrisan Help sistem sa opisom svih opcija, pretragom i tabelom prečica (aktivacija na taster F1 ili klikom na "?" ikonicu)',
        '[Nova funkcija] Implementiran About modal sa informacijama o izdanju, politici privatnosti i prečicom na taster tilda (~)',
        '[Nova funkcija] Izvoz u samostalni HTML (.html) dokument sa vernim stilovima, podrškom za teme i kopiranjem blokova koda',
        '[Nova funkcija] Sklopive sekcije (collapsible TOC) u bočnoj traci sa brojačem podsekcija (+N) i dugmadima "Skupi sve" i "Proširi sve"',
        '[Nova funkcija] Scroll to top dugme sa fade-in/fade-out efektom i glatkim vraćanjem na vrh stranice',
        '[Ispravka] Rešena greška pri generisanju PDF-a (problem parsiranja "oklch" boja u html2canvas-u zamenjen bezbednom konverzijom)',
        '[Ispravka] Otklonjen bag praznog PDF dokumenta: obezbeđeno verno renderovanje sadržaja uz Save As dijalog i prečicu Ctrl+P',
        '[Ispravka] Izolovano okidanje globalnih prečica (F1, ~, itd.) kako ne bi prekidalo unos koda i teksta unutar editora',
      ],
    },
    {
      version: '1.1.0',
      date: 'Septembar 2026',
      highlights: [
        '[Nova funkcija] Podeljeni prikaz (Split View) sa sinhronizovanim skrolovanjem editora i prikaza',
        '[Nova funkcija] Napredna pretraga i zamena teksta u dokumentu (Ctrl+F, Ctrl+H)',
        '[Nova funkcija] Sistem šablona za brzi start (README, API, Specifikacije, Beleške)',
        '[Nova funkcija] Izvoz u Microsoft Word (.docx) i Čist tekst (.txt)',
      ],
    },
  ],
  privacyPolicyText: `MD Viewer poštuje vašu privatnost. Svi vaši dokumenti, beleške i podaci obrađuju se isključivo lokalno u vašem internet pregledaču (Client-Side).

• Nema slanja dokumenata na udaljene servere bez vaše izričite namere.
• Podešavanja i nedavno otvoreni fajlovi čuvaju se lokalno (LocalStorage) na vašem uređaju.
• Podaci se ne dele sa trećim licima niti se koriste u marketinške svrhe.`,
  termsOfUseText: `MD Viewer je slobodan softver dostupan za ličnu i profesionalnu upotrebu.

• Aplikaciju koristite na sopstvenu odgovornost u skladu sa važećim zakonima.
• Nema skrivenih troškova, pretplata ili ograničenja broja izvezenih dokumenata.
• Sav autorski sadržaj dokumenata koje kreirate ili uređujete ostaje u vašem isključivom vlasništvu.`,
};
