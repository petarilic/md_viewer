import { DocumentTemplate } from '../types';

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: 'empty',
    name: 'Prazan dokument',
    description: 'Počnite sa potpuno čistim Markdown fajlom',
    category: 'all',
    iconName: 'FileText',
    defaultFilename: 'Untitled.md',
    content: `# Untitled

Počnite unos teksta ovde...
`,
  },
  {
    id: 'api-docs',
    name: 'API Dokumentacija',
    description: 'REST API specifikacija: rute, parametri, tela zahteva, zaglavlja i statusni kodovi',
    category: 'development',
    badge: 'API & Dev',
    iconName: 'Terminal',
    defaultFilename: 'API_Documentation.md',
    content: `# 🚀 API Reference Dokumentacija

Dobrodošli u zvaničnu dokumentaciju REST API servisa. Svi pozivi se obavljaju preko protokola HTTPS uz JSON formatiranje tela zahteva i odgovora.

---

## 🌐 Osnovni URL (Base URL)

\`\`\`
https://api.primer.rs/v1
\`\`\`

---

## 🔐 Autentifikacija

Svi zaštićeni endpoint-i zahtevaju prosleđivanje JWT tokena u zaglavlju (\`Authorization\` header):

\`\`\`http
Authorization: Bearer <vas_jwt_token>
Content-Type: application/json
\`\`\`

---

## 📋 Endpoint-i

### 1. Pretraga dokumenata

Vraća listu dokumenata koji odgovaraju zadatim kriterijumima filtera.

- **Metod:** \`GET\`
- **Putanja:** \`/documents\`
- **Pristup:** Zaštićen (\`read:documents\`)

#### Query Parametri:

| Parametar | Tip | Obavezno | Opis | Primer |
| :--- | :--- | :--- | :--- | :--- |
| \`q\` | \`string\` | Ne | Ključna reč za pretragu | \`specifikacija\` |
| \`limit\` | \`number\` | Ne | Broj rezultata po strani (podrazumevano 20) | \`50\` |
| \`offset\` | \`number\` | Ne | Pomak za paginaciju | \`0\` |
| \`status\` | \`string\` | Ne | Status (\`draft\` \| \`published\`) | \`published\` |

#### Primer Zahteva (cURL):

\`\`\`bash
curl -X GET "https://api.primer.rs/v1/documents?q=izvestaj&limit=10" \\
  -H "Authorization: Bearer eyJhbGciOi..." \\
  -H "Accept: application/json"
\`\`\`

#### Primer Uspešnog Odgovora (\`200 OK\`):

\`\`\`json
{
  "status": "success",
  "meta": {
    "total": 42,
    "limit": 10,
    "offset": 0
  },
  "data": [
    {
      "id": "doc_99182",
      "title": "Godišnji Izveštaj 2026",
      "format": "markdown",
      "size": 15420,
      "updatedAt": "2026-10-22T08:00:00Z"
    }
  ]
}
\`\`\`

---

### 2. Kreiranje novog dokumenta

Kreira novi zapis dokumenta u bazi sa prosleđenim sadržajem.

- **Metod:** \`POST\`
- **Putanja:** \`/documents\`
- **Pristup:** Zaštićen (\`write:documents\`)

#### Telo Zahteva (Request Body):

\`\`\`json
{
  "title": "Novi Markdown Fajl",
  "content": "# Naslov\\n\\nTekst dokumenta...",
  "category": "tehnicka_dokumentacija",
  "tags": ["frontend", "react"]
}
\`\`\`

#### Primer Odgovora (\`201 Created\`):

\`\`\`json
{
  "status": "success",
  "data": {
    "id": "doc_102847",
    "title": "Novi Markdown Fajl",
    "createdAt": "2026-10-22T09:15:30Z"
  }
}
\`\`\`

---

## ⚠️ Statusni Kodovi i Greške

| Status Kod | Značenje | Uzrok |
| :--- | :--- | :--- |
| \`200 OK\` | Zahtev je uspešno izvršen | Regularan uspešan odziv |
| \`201 Created\` | Resurs je uspešno kreiran | Uspešan \`POST\` zahtev |
| \`400 Bad Request\` | Neispravni parametri | Validaciona greška u JSON telu |
| \`401 Unauthorized\` | Nedostaje token | Nevažeći ili istekao Bearer token |
| \`403 Forbidden\` | Nedovoljne privilegije | Korisnik nema dozvolu za akciju |
| \`404 Not Found\` | Resurs nije pronađen | Pogrešan ID dokumenta |
| \`429 Too Many Requests\` | Prekoračen rate-limit | Dozvoljeno maksimalno 100 req/min |
| \`500 Server Error\` | Interna serverska greška | Greška baze ili neobrađen izuzetak |

#### Format Odgovora sa Greškom:

\`\`\`json
{
  "status": "error",
  "code": "INVALID_PARAMETER",
  "message": "Polje 'title' je obavezno i mora imati najmanje 3 karaktera."
}
\`\`\`
`,
  },
  {
    id: 'changelog',
    name: 'Dnevnik Izmena (Changelog)',
    description: 'Praćenje novih opcija, ispravki i promena po standardu "Keep a Changelog" i SemVer',
    category: 'development',
    badge: 'SemVer',
    iconName: 'History',
    defaultFilename: 'CHANGELOG.md',
    content: `# 📋 Dnevnik Izmena (Changelog)

Sve značajne izmene u ovom projektu dokumentovane su u ovom fajlu.

Format je zasnovan na standardu [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) i prati pravila [Semantičkog Verzionisanja (SemVer)](https://semver.org/spec/v2.0.0.html).

---

## [Neobjavljeno] (Unreleased)

### ✨ Dodato
- Prečice za brzi izbor gotovih Markdown šablona (API Docs, Changelog, Licenca).
- Poboljšana podrška za mobilni meni i fioku sa sadržajem (TOC).

---

## [v1.3.0] - ${new Date().toISOString().split('T')[0]}

### ✨ Dodato
- Podrška za izvoz u Microsoft Word (\`.docx\`) format sa očuvanim stilovima i tabelama.
- Izvoz u čist tekst (\`.txt\`) sa uklanjanjem Markdown sintakse.
- Prikaz statistike dokumenta: broj reči, broj karaktera, redova i procenjeno vreme čitanja.
- Svetla i tamna tema sa trenutnim prebacivanjem i sinhronizacijom sistema.

### 🔄 Promenjeno
- Optimizovan editor sa keširanim stanjem istorije za brži odziv bez zastajkivanja.
- Prilagođen raspored alatki za tablete i uske mobilne ekrane.

### 🐛 Ispravljeno
- Rešen problem sa dubinom ažuriranja renderovanja u podeljenom (Split) režimu.
- Ispravljeno centriranje slika u režimu za štampu / PDF.

---

## [v1.1.0] - 2026-10-15

### ✨ Dodato
- Podeljeni prikaz (Split Screen) sa sinhronizovanim skrolovanjem.
- Pretraga i zamena teksta (\`Ctrl+F\`) uz brojač poklapanja i navigaciju (Enter / Shift+Enter).
- Sistem kartica za rad sa više otvorenih fajlova istovremeno.

### 🛡️ Bezbednost
- Dodata sanitizacija HTML sadržaja radi sprečavanja XSS injekcija.

---

## [v1.0.0] - 2026-10-01

### ✨ Početno Izdanje
- Pregled Markdown dokumenata sa GFM podrškom (tabele, zadaci, kod sa isticanjem sintakse).
- Bočni indeks naslova dokumenta (Table of Contents) sa skokom na klik.
- Čuvanje i preuzimanje fajlova putem File System Access API.
`,
  },
  {
    id: 'license',
    name: 'Softverska Licenca (License)',
    description: 'Pravna licenca otvorenog koda (MIT, Apache 2.0 i pregled dozvola)',
    category: 'legal',
    badge: 'Open Source',
    iconName: 'Scale',
    defaultFilename: 'LICENSE.md',
    content: `# MIT Licenca (MIT License)

**Autorska prava (c) ${new Date().getFullYear()} [Ime Autora / Naziv Organizacije]**

Dozvola se ovim besplatno daje svakom licu koje pribavi primerak ovog softvera i prateće dokumentacije (u daljem tekstu "Softver"), da koristi Softver bez ograničenja, uključujući bez ograničenja prava na korišćenje, kopiranje, modifikaciju, spajanje, objavljivanje, distribuciju, podlicenciranje i/ili prodaju primeraka Softvera, kao i da dozvoli licima kojima je Softver ustupljen da to čine, pod sledećim uslovima:

Gornje obaveštenje o autorskim pravima i ovo obaveštenje o dozvoli moraju biti uključeni u sve kopije ili značajne delove Softvera.

---

## ⚖️ Sažetak Prava i Obaveza

### ✅ Dozvoljeno:
- **Komercijalna upotreba:** Dozvoljeno korišćenje u komercijalne svrhe.
- **Modifikacija:** Dozvoljena izmena koda po sopstvenim potrebama.
- **Distribucija:** Dozvoljeno deljenje originalnog ili modifikovanog softvera.
- **Privatna upotreba:** Dozvoljena interna upotreba u firmama ili pojedinačno.

### ⚠️ Uslovi:
- **Navođenje licence i autora:** Originalno obaveštenje o autorskim pravima i licenca moraju ostati u svim kopijama.

### ❌ Ograničenja:
- **Odricanje od odgovornosti:** Softver se isporučuje "u viđenom stanju" (AS IS). Autori ne snose nikakvu odgovornost za štetu nastalu upotrebom.
- **Nema garancije:** Autori ne garantuju podobnost za određenu namenu.

---

## 🛡️ Pravno Odricanje Odgovornosti (Warranty Disclaimer)

SOFTVER SE ISPORUČUJE "U VIĐENOM STANJU" (AS IS), BEZ BILO KAKVIH GARANCIJA, IZRIČITIH ILI PODRAZUMEVANIH, UKLJUČUJUĆI, ALI NE OGRANIČAVAJUĆI SE NA GARANCIJE O PRODAJI, POGODNOSTI ZA ODREĐENU NAMENU I NENARUŠAVANJU PRAVA TREĆIH LICA. AUTORI ILI NOSIOCI AUTORSKIH PRAVA NI U KOM SLUČAJU NEĆE BITI ODGOVORNI ZA BILO KAKVA POTRAŽIVANJA, ŠTETU ILI DRUGU ODGOVORNOST, BILO U UGOVORNOJ, GRAĐANSKOJ ILI DRUGOJ RADNJI, KOJA PROISTIČE IZ KORIŠĆENJA ILI JE U VEZI SA SOFTVEROM ILI UPOTREBOM SOFTVERA.
`,
  },
  {
    id: 'readme',
    name: 'README Projekta',
    description: 'Standardni šablon za GitHub / GitLab repozitorijume sa bedževima i uputstvima',
    category: 'popular',
    badge: 'Preporučeno',
    iconName: 'BookOpen',
    defaultFilename: 'README.md',
    content: `# Naziv Projekta

[![Licenca](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Status](https://img.shields.io/badge/status-active-success.svg)](#)
[![Verzija](https://img.shields.io/badge/version-1.0.0-orange.svg)](CHANGELOG.md)

Kratak, jasan i upečatljiv opis svrhe i ciljeva ovog projekta. Objasnite u 2-3 rečenice koji problem aplikacija rešava i kome je namenjena.

---

## ✨ Ključne Karakteristike

- 🚀 **Brz i responzivan interfejs** prilagođen mobilnim telefonima, tabletima i desktop računarima.
- 🛡️ **Privatnost i lokalni rad:** Podaci se obrađuju direktno u pregledaču, bez slanja na spoljne servere.
- 📑 **Navigacija i Sadržaj (TOC):** Automatsko kreiranje hijerarhijskog indeksa naslova.
- 🔍 **Pretraga i Zamena:** Moćan interni pretraživač sa brojačem rezultata.
- 📤 **Višestruki Izvoz:** Podrška za DOCX, TXT, PDF i .md formate.

---

## 📦 Instalacija i Pokretanje

### Preduslovi:
- Node.js verzija 18 ili novija
- npm ili yarn paket menadžer

### Koraci za instalaciju:

\`\`\`bash
# 1. Klonirajte repozitorijum
git clone https://github.com/korisnik/projekat.git

# 2. Uđite u radni direktorijum
cd projekat

# 3. Instalirajte zavisnosti
npm install

# 4. Pokrenite razvojni server
npm run dev
\`\`\`

Aplikacija će se pokrenuti na adresi \`http://localhost:3000\`.

---

## ⚙️ Tehnološki Stack

| Komponenta | Tehnologija | Namena |
| :--- | :--- | :--- |
| **Frontend** | React 19 + TypeScript | Korisnički interfejs i logika stanja |
| **Stilovi** | Tailwind CSS v4 | Savremen i prilagodljiv dizajn |
| **Prikaz** | Markdown / GFM | Formatiranje tehničkih tekstova |
| **Build Alat** | Vite | Brzo kompajliranje i bundling |

---

## 🤝 Doprinos Projektu

Predlozi i ispravke su dobrodošli! Pogledajte [CONTRIBUTING.md](CONTRIBUTING.md) za smernice o slanju Pull Request-ova.

---

## 📝 Licenca

Ovaj projekat je licenciran pod **MIT licencom** — pogledajte fajl [LICENSE.md](LICENSE.md) za detalje.
`,
  },
  {
    id: 'spec',
    name: 'Tehnička Specifikacija',
    description: 'Strukturirani obrazac za arhitekturu, funkcionalne zahteve i dijagrame sistema',
    category: 'documentation',
    badge: 'Arhitektura',
    iconName: 'Layers',
    defaultFilename: 'Tehnicka_Specifikacija.md',
    content: `# 📐 Tehnička Specifikacija: Naziv Sistema

**Verzija Dokumenta:** 1.0  
**Autor:** Tehnički Arhitekta  
**Datum:** ${new Date().toISOString().split('T')[0]}  
**Status:** Nacrt (Draft) / Na Razmatranju  

---

## 1. Pregled i Poslovni Ciljevi

Ovaj dokument definiše arhitekturu, funkcionalne zahteve, tokove podataka i bezbednosne smernice za implementaciju novog sistema.

### 1.1 Ciljevi Projekta
1. Skratiti vreme učitavanja stranica na ispod 1.2 sekunde.
2. Obezbediti potpunu funkcionalnost u režimu bez interneta (offline-first).
3. Postići pokrivenost testovima od minimum 85%.

---

## 2. Funkcionalni Zahtevi

| ID | Zahtev | Prioritet | Kriterijum Prihvatanja |
| :--- | :--- | :--- | :--- |
| **FR-01** | Uređivanje i Live Preview | Visok | Izmene se trenutno prikazuju u renderovanom oknu bez kašnjenja |
| **FR-02** | Izvoz u DOCX | Visok | Word fajl sadrži ispravno formatirane stilove, liste i tabele |
| **FR-03** | Auto-čuvanje | Srednji | Podaci se automatski čuvaju u lokalno skladište |

---

## 3. Arhitektura Sistema

\`\`\`
+-----------------------+        +------------------------+
|   Korisnik (Browser)  | <----> |  State Management      |
+-----------------------+        +------------------------+
            |                                |
            v                                v
+-----------------------+        +------------------------+
|  Markdown Parser GFM  |        |  File System API       |
+-----------------------+        +------------------------+
            |                                |
            +----------------+---------------+
                             |
                             v
                 +-----------------------+
                 |  DOCX / TXT / Print   |
                 +-----------------------+
\`\`\`

---

## 4. Bezbednost i Skalabilnost

> 🔒 **Zaštita od XSS:** Svi spoljni linkovi i HTML entiteti se proveravaju i sanitizuju pre dodavanja u DOM stablo.
`,
  },
  {
    id: 'meeting',
    name: 'Zapisnik sa Sastanka',
    description: 'Evidencija dnevnog reda, prisutnih, donetih odluka i akcionih zadataka',
    category: 'documentation',
    iconName: 'BookOpen',
    defaultFilename: 'Zapisnik_Sastanak.md',
    content: `# 👥 Zapisnik sa Sastanka: Planiranje Izdanja

**Datum:** ${new Date().toISOString().split('T')[0]}  
**Vreme:** 10:00 - 11:15 CET  
**Lokacija:** Google Meet / Sala za sastanke  
**Moderator:** Petar P.  
**Zapisničar:** Stefan M.  

**Prisutni:**
- Petar P. (Lead Developer)
- Ana N. (UI/UX Designer)
- Marko M. (QA Engineer)
- Jelena K. (Product Manager)

---

## 📌 Dnevni Red

1. Analiza povratnih informacija korisnika za verziju v1.2.
2. Predlog novih šablona (API Docs, Changelog, Licenca).
3. Rešavanje mobilnog prikaza i Dark/Light toggle dugmeta.
4. Definisanje rokova za naredni sprint.

---

## 💡 Donete Odluke

- [x] Usvojen je standardizovani modal za izbor šablona sa brzim kategorijama i pretragom.
- [x] Dodat je padajući meni za šablone direktno u gornju paletu sa alatkama.
- [x] Odluka da se zadrži 100% obrada podataka na strani klijenta bez slanja na server.

---

## 📋 Akcione Stavke (Action Items)

- [ ] **Ana:** Pripremiti vizuelne ikone i raspored kartica za novi modal.
- [ ] **Petar:** Implementirati prečice za šablone i testirati na mobilnim uređajima.
- [ ] **Marko:** Verifikovati izvoz u DOCX sa svim novim šablonima do četvrtka.

---

*Naredni sastanak zakazan je za sledeći ponedeljak u 10:00.*
`,
  },
  {
    id: 'contributing',
    name: 'Vodič za Doprinos (CONTRIBUTING)',
    description: 'Uputstvo za programere: pravila pisanja koda, kreiranje grana i Pull Request procedura',
    category: 'development',
    iconName: 'GitPullRequest',
    defaultFilename: 'CONTRIBUTING.md',
    content: `# 🤝 Vodič za Doprinos Projektu (Contributing)

Hvala vam na interesovanju da unapredite ovaj projekat! Molimo vas da pre slanja izmena pročitate sledeće smernice.

---

## 🚦 Kako Možete Pomoći?

- Prijavljivanjem pronađenih grešaka (Bug Reports)
- Predlaganjem novih funkcionalnosti (Feature Requests)
- Pisanjem dokumentacije ili prevoda
- Slanjem ispravki koda putem Pull Request-ova

---

## 🛠️ Pravila Razvoja

### 1. Imenovanje Grana (Git Branching)
Kreirajte namensku granu polazeći od \`main\` grane:
- Za greške: \`fix/opis-greske\` (npr. \`fix/mobile-menu-overflow\`)
- Za nove opcije: \`feat/naziv-opcije\` (npr. \`feat/templates-dropdown\`)
- Za dokumentaciju: \`docs/dopuna-uputstva\`

### 2. Poruke Commit-a (Conventional Commits)
Koristite standardizovane prefikse:
- \`feat:\` za novu mogućnost
- \`fix:\` za ispravku baga
- \`docs:\` za izmene u dokumentaciji
- \`refactor:\` za poboljšanje strukture koda

---

## 🚀 Slanje Pull Request-a

1. Forsirajte testove i proveru koda:
   \`\`\`bash
   npm run lint
   npm run build
   \`\`\`
2. Pošaljite Pull Request ka \`main\` grani sa sažetim opisom uvedenih izmena i screenshot-om ako utiče na UI.
`,
  },
  {
    id: 'bug-report',
    name: 'Prijava Greške (Bug Report)',
    description: 'Šablon za opis nepravilnosti, korake za reprodukciju i okruženje',
    category: 'development',
    iconName: 'Bug',
    defaultFilename: 'BUG_REPORT.md',
    content: `# 🐛 Izveštaj o Grešci (Bug Report)

Molimo popunite sva relevantna polja kako bismo što brže identifikovali i rešili problem.

---

## 📝 Sažetak Problema
*Kratak i jasan opis šta se ne ponaša kako je očekivano.*

---

## 🔁 Koraci za Reprodukciju
1. Otvorite aplikaciju na adresi \`...\`
2. Kliknite na dugme \`...\`
3. Unesite tekst \`...\`
4. Primetite da se javlja greška.

---

## 🎯 Očekivano Ponašanje
*Šta je trebalo da se dogodi umesto greške.*

---

## 💥 Trenutno Ponašanje
*Šta se stvarno dogodilo (npr. zamrznut ekran, greška u konzoli, pogrešan raspored elemenata).*

---

## 💻 Informacije o Okruženju
- **Operativni Sistem:** [npr. Windows 11, macOS Sequoia, Ubuntu 24.04, Android 15]
- **Pregledač (Browser):** [npr. Chrome 130, Firefox 132, Safari 18]
- **Verzija Aplikacije:** [npr. v1.3.0]

---

## 📸 Snimci Ekrana ili Logovi
\`\`\`
Zalepite grešku iz konzole (ako postoji) ovde...
\`\`\`
`,
  },
  {
    id: 'docs',
    name: 'Korisničko Uputstvo',
    description: 'Vodič za krajnje korisnike sa koracima, savetima i često postavljanim pitanjima (FAQ)',
    category: 'documentation',
    iconName: 'BookOpen',
    defaultFilename: 'Dokumentacija.md',
    content: `# 📖 Korisničko Uputstvo

Dobrodošli u vodič za korišćenje aplikacije. Ovaj dokument vas vodi kroz osnovne i napredne opcije.

---

## 1. 🚀 Brzi Početak

1. **Kreiranje fajla:** Kliknite na dugme **Novi** ili izaberite gotov šablon iz padajućeg menija **Šabloni**.
2. **Otvaranje postojećeg dokumenta:** Kliknite na **Otvori** (\`Ctrl+O\`) i odaberite fajl sa vašeg diska.
3. **Izbor prikaza:** 
   - 👁️ **Prikaz (Rendered):** Čist pregled formatiranog teksta.
   - ✏️ **Uredi (Edit):** Markdown editor sa prečicama i pomoćnim trakama.
   - 📑 **Podeljeno (Split):** Uporedni rad sa trenutnim ažuriranjem (*Live Preview*).

---

## 2. 💾 Čuvanje i Izvoz

- **Čuvanje (\`Ctrl+S\`):** Čuva izmene direktno u lokalni fajl na računaru.
- **Word Izvoz (\`.docx\`):** Konvertuje Markdown u formatiran DOCX dokument sa stilovima naslova i tabelama.
- **Čist Tekst (\`.txt\`):** Skida Markdown formatiranje i izvozi čist tekst.
- **Štampa i PDF (\`Ctrl+P\`):** Priprema dokument za štampu na papir ili snimanje u PDF format.

---

## 3. ❓ Često Postavljana Pitanja (FAQ)

**P: Da li su moji dokumenti bezbedni?**  
O: Da! Aplikacija radi 100% u vašem pregledaču, ništa se ne šalje na eksterne servere.

**P: Kako mogu pretraživati tekst?**  
O: Pritisnite prečicu \`Ctrl+F\` ili kliknite ikonicu lupe u traci sa alatkama.
`,
  },
];
