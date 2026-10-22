import { DocumentTemplate } from '../types';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'empty',
    name: 'Prazan dokument',
    description: 'Počnite sa potpuno čistim Markdown fajlom',
    defaultFilename: 'Untitled.md',
    content: `# Untitled

Počnite unos teksta ovde...
`,
  },
  {
    id: 'readme',
    name: 'README Projekta',
    description: 'Standardni šablon za GitHub / GitLab repozitorijume',
    defaultFilename: 'README.md',
    content: `# Naziv Projekta

Kratak i jasan opis svrhe i ciljeva ovog projekta.

## ✨ Ključne Karakteristike

- 🚀 Brza i pouzdana arhitektura
- 🛡️ Bezbedno i privatno procesiranje podataka
- 📱 Responsive interfejs za mobilne i desktop uređaje
- 📊 Automatsko generisanje izveštaja

## 📦 Instalacija

Preuzmite repozitorijum i instalirajte zavisnosti:

\`\`\`bash
git clone https://github.com/korisnik/projekat.git
cd projekat
npm install
\`\`\`

## 🚀 Pokretanje

Pokrenite lokalni server za razvoj:

\`\`\`bash
npm run dev
\`\`\`

Aplikacija će biti dostupna na \`http://localhost:3000\`.

## ⚙️ Tehnološki Stack

| Tehnologija | Verzija | Namena |
| :--- | :--- | :--- |
| React | 19.x | Frontend biblioteka |
| TypeScript | 5.x | Tipski bezbedan kod |
| Tailwind CSS | 4.x | Stilizovanje interfejsa |

## 📝 Licenca

Distribuira se pod MIT licencom. Pogledajte \`LICENSE\` za više informacija.
`,
  },
  {
    id: 'spec',
    name: 'Tehnička Specifikacija',
    description: 'Strukturirani obrazac za arhitekturu i zahteve sistema',
    defaultFilename: 'Tehnicka_Specifikacija.md',
    content: `# Tehnička Specifikacija: Naziv Modula

**Verzija:** 1.0  
**Autor:** Razvojni Tim  
**Datum:** ${new Date().toISOString().split('T')[0]}  
**Status:** Nacrt

---

## 1. Pregled i Ciljevi

Ovaj dokument definiše arhitekturu, funkcionalne i bezbednosne zahteve za implementaciju novog sistema.

### 1.1. Poslovni Ciljevi
- Smanjiti vreme odziva za 40%.
- Omogućiti rad van mreže (offline mode).
- Standardizovati API komunikaciju.

## 2. Funkcionalni Zahtevi

- [ ] **FR-01:** Implementacija klijentskog keširanja
- [ ] **FR-02:** Automatska validacija ulaznih parametara
- [ ] **FR-03:** Podrška za izvoz u formatima DOCX i TXT

## 3. Arhitektura Sistema

\`\`\`
+------------------+      +-------------------+
|  Klijent (React) | ---> |  REST / GraphQL   |
+------------------+      +-------------------+
          |                         |
          v                         v
+------------------+      +-------------------+
| LocalStorage/IDB |      |   Glavna Baza     |
+------------------+      +-------------------+
\`\`\`

## 4. Bezbednost i Privatnost

> Svi korisnički unosi moraju biti sanitizovani pre obrade i renderinga kako bi se sprečili XSS i injection napadi.
`,
  },
  {
    id: 'meeting',
    name: 'Zapisnik sa Sastanka',
    description: 'Evidencija odluka, tema i akcionih stavki',
    defaultFilename: 'Zapisnik_Sastanak.md',
    content: `# Zapisnik sa Sastanka: Planiranje Sprinta

**Datum:** ${new Date().toISOString().split('T')[0]}  
**Vreme:** 10:00 - 11:30  
**Prisutni:** Petar, Marko, Ana, Stefan  
**Zapisničar:** Stefan

---

## 🎯 Dnevni Red

1. Pregled završenih zadataka iz prethodnog sprinta
2. Demonstracija novih funkcionalnosti editora
3. Raspodela zadataka za izvoz (DOCX & TXT)
4. Razno i pitanja

## 💡 Donete Odluke

- Odobren je prelazak na klijentski izvoz u DOCX bez potrebe za serverskim procesiranjem.
- Uvodi se obavezna potvrda pre zatvaranja tabova sa nesačuvanim izmenama.

## 📋 Akcione Stavke (Action Items)

- [ ] **Ana:** Pripremiti testne Markdown scenarije do petka
- [ ] **Marko:** Implementirati prečicu \`Ctrl+S\` i Save As dijalog
- [ ] **Petar:** Proveriti kompatibilnost sa Safari pregledačem

---

*Sledeći sastanak zakazan je za sledeći ponedeljak u 10:00.*
`,
  },
  {
    id: 'docs',
    name: 'Projektna Dokumentacija',
    description: 'Vodič za korisnike i administrativna uputstva',
    defaultFilename: 'Dokumentacija.md',
    content: `# Korisničko Uputstvo za Aplikaciju

Dobrodošli u zvaničnu dokumentaciju aplikacije. Ovaj vodič pokriva osnovne korake i napredne opcije.

## 1. Početak rada

1. Otvorite aplikaciju u bilo kom savremenom pregledaču.
2. Pritisnite **Novi dokument** ili upotrebite prečicu \`Ctrl+N\`.
3. Unesite željeni tekst ili otvorite postojeći fajl preko dugmeta **Otvori fajl** (\`Ctrl+O\`).

## 2. Režimi rada

Aplikacija podržava tri glavna režima:
- **Uređivanje (Edit):** Direktan rad sa Markdown tekstom, podrška za prečice, uvlačenje i pretragu.
- **Formatirano (Rendered):** Čist pregled dokumenata sa interaktivnim tabelama i slikama.
- **Podeljeno (Split):** Uporedni rad sa trenutnim živim osvežavanjem renderovanog prikaza (*Live Preview*).

## 3. Čuvanje i Izvoz

- **Save (\`Ctrl+S\`):** Čuva fajl direktno na vaš disk ili pokreće preuzimanje.
- **DOCX Izvoz:** Generiše Word dokument sa sačuvanim naslovima, tabelama i listama.
- **TXT Izvoz:** Uklanja Markdown tagove i generiše čist UTF-8 tekst.
`,
  },
];
