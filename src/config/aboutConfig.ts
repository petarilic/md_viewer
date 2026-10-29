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
  version: '1.4.0',
  buildNumber: '140',
  releaseDate: '29. oktobar 2026.',
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
      version: '1.4.0',
      date: '29. oktobar 2026',
      highlights: [
        '[Nova funkcija] Izbor formata papira u podešavanjima: podržani standardni i specijalizovani formati A4, A3, A5, US Letter i US Legal sa detaljnim dimenzijama i namenom',
        '[Nova funkcija] Proračun broja strana i živa paginacija u dnu ekrana: na osnovu odabranog formata papira i veličine fonta precizno se računa ukupan broj stranica, a tokom skrolovanja u realnom vremenu se ažurira redni broj strane na kojoj se korisnik nalazi (npr. „Strana 2 od 5 (A4)”) uz direktnu prečicu ka podešavanjima',
        '[Poboljšanje] Integracija formata papira sa PDF izvozom: podrška za sve formate (A4, A3, A5, Letter, Legal) uz automatsko sinhronizovanje izabranog formata iz podešavanja',
        '[Ispravka] Otklonjen problem prikaza u opciji „Poravnate linije”: kada je u Split Screen-u izabran „Prikaz”, uključivanjem poravnatih linija oba dokumenta ostaju u formatiranom prikazu (Prikaz / Rendered) sa primenjenim stilovima, naslovima i formatom, umesto prebacivanja u sirovi tekst editora',
        '[Poboljšanje] Prilagođena tema i paleta boja editora za Light mode: editor teksta, traka sa alatkama za formatiranje, brojevi linija i Diff oznake sada imaju čist, svetao i prijatan izgled u svetloj temi uz očuvanu punu podršku za tamnu temu',
        '[Poboljšanje] Prilagođen redosled opcija prikaza u traci sa alatkama: dugmad režima su sada poređana prirodnim redom „Uredi”, „Podeljeno”, „Prikaz”',
        '[Ispravka] Otklonjen problem sa prikazom razlika u Formatiranom prikazu: kada je uključen Diff u Split Screen Mode-u, razlike su sada jasno markirane i kolor-kodirane i u formatiranom tekstu (zeleno za dodavanja u desnom dokumentu, crveno za uklanjanja iz levog, ćilibar za izmene) sa bedževima linija, automatskim skrolovanjem na selekciju i interaktivnim klikom, u oba režima („Prikaz” i „Podeljeno”)',
        '[Ispravka] Otklonjen problem sa sinhronizovanim skrolovanjem u Split Screen Mode-u: implementirano precizno, proporcionalno i dvosmerno sinhronizovano skrolovanje između otvorenih dokumenata u svim režimima (uključujući složeni vertikalni "Podeljeno" raspored sa 4 paralelna panela)',
        '[Poboljšanje] U opciji "Podeljeno" unutar Split Screen Mode-a dokumenti se prikazuju jedan ispod drugog, a u okviru svakog dokumenta prikazan je Markdown editor paralelno pored formatiranog prikaza (paralelni SplitView za oba dokumenta)',
        '[Poboljšanje] Redizajniran i poravnat prikaz sekcije Novosti i izdanja (Changelog): ravnomerno poravnate kategorije, jasne kolor-kodirane oznake, veći komfor čitanja i pregledna istorija evolucije aplikacije',
      ],
    },
    {
      version: '1.3.0',
      date: '27. oktobar 2026',
      highlights: [
        '[Nova funkcija] Split Screen Mode za dva otvorena dokumenta: omogućava istovremeni pregled i rad sa dva različita fajla na jednom ekranu (dugme se automatski pojavljuje isključivo kada su učitana tačno dva dokumenta)',
        '[Nova funkcija] Fleksibilan raspored u Split Screen Mode-u: opcije "Uredi" i "Prikaz" prikazuju dokumente jedan pored drugog (side-by-side), dok opcija "Podeljeno" prikazuje dokumente jedan ispod drugog (stacked)',
        '[Nova funkcija] Diff alat za analizu i poređenje: automatsko pronalaženje razlika između levog i desnog dokumenta uz navođenje tačnog broja linije i uporednih vrednosti (levi protiv desnog)',
        '[Nova funkcija] Kolor-kodirano markiranje razlika u dokumentima: vizuelno istaknute linije (zelena za dodavanja u desnom dokumentu, crvena za uklanjanja iz levog dokumenta, ćilibar/žuta za izmenjene linije) uz interaktivnu listu razlika i brzu navigaciju',
        '[Nova funkcija] Poravnata tabela razlika (Aligned Diff Table): mogućnost direktnog uporednog tabelarnog prikaza linija po linija u Diff modu',
        '[Nova funkcija] Brza zamena mesta dokumentima (Levo <-> Desno) i sinhronizovano skrolovanje u Split Screen prikazu',
        '[Nova funkcija] Drag & Drop učitavanje fajlova direktno na traku sa tabovima sa namenskim isprekidanim pravougaonikom za spuštanje i otvaranje pored već otvorenih dokumenata',
        '[Nova funkcija] Izvoz u DOCX i PDF sada verno reflektuje izabranu veličinu fonta, tipografiju i širinu stranice (margine) iz podešavanja',
      ],
    },
    {
      version: '1.2.0',
      date: '27. oktobar 2026',
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
