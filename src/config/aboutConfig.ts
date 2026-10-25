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
  buildNumber: '120',
  releaseDate: '24. oktobar 2026.',
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
      date: 'Oktobar 2026',
      highlights: [
        'Dodata opcija izvoza u samostalan HTML (.html) dokument sa vernim stilovima i kopiranjem koda',
        'Dodata mogućnost skupljanja i širenja sekcija (collapsible TOC) u bočnoj traci sa brojačem',
        'Poboljšan izvoz u PDF sa Save As dijalogom i prečicom Ctrl+P',
        'Novo Scroll-to-top dugme sa glatkom animacijom i podrškom za teme',
        'About modal sa informacijama o aplikaciji i prečicom na taster tilda (~)',
      ],
    },
    {
      version: '1.1.0',
      date: 'Septembar 2026',
      highlights: [
        'Podeljeni prikaz (Split View) sa sinhronizovanim skrolovanjem',
        'Napredna pretraga i zamena teksta u dokumentu (Ctrl+F, Ctrl+H)',
        'Sistem šablona za brzi start (README, API, Specifikacije)',
        'Izvoz u Microsoft Word (.docx) i Plain Text (.txt)',
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
