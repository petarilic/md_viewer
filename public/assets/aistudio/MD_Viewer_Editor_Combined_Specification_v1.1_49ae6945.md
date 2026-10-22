# Funkcionalna specifikacija — Markdown Viewer & Editor

**Naziv projekta:** MD Viewer & Editor  
**Tip aplikacije:** Web aplikacija za pregled, kreiranje, uređivanje, čuvanje i izvoz Markdown dokumenata  
**Verzija dokumenta:** 1.2  
**Status:** Objedinjena funkcionalna specifikacija

---

## 1. Cilj i opseg aplikacije

MD Viewer & Editor je moderna web aplikacija za rad sa Markdown (`.md`) dokumentima.

Korisnik treba da može da:

- kreira novi Markdown dokument;
- otvori postojeći Markdown fajl;
- pregleda dokument kao formatirani HTML;
- uređuje Markdown izvorni tekst;
- koristi Live Preview / Split View;
- pretražuje i menja sadržaj;
- sačuva novi ili izmenjeni Markdown fajl;
- koristi Save i Save As;
- preuzme fajl kada direktno čuvanje nije podržano;
- izveze dokument u DOCX;
- izveze dokument u TXT;
- odštampa dokument / sačuva ga kao PDF;
- prilagodi izgled i način prikaza.

Osnovni principi:

- **Jednostavnost** — najčešće operacije dostupne su direktno iz glavnog toolbar-a.
- **Čitljivost** — kvalitetan prikaz Markdown sadržaja.
- **Uređivanje** — pun rad sa izvornim Markdown tekstom.
- **Pouzdanost** — zaštita od gubitka nesačuvanih izmena.
- **Privatnost** — lokalni dokumenti se podrazumevano obrađuju u pregledaču.
- **Responsive dizajn** — desktop, tablet i mobilni uređaji.
- **Proširivost** — arhitektura pogodna za buduće funkcionalnosti.

---

# 2. Korisničke uloge

## 2.1. Gost / anonimni korisnik

Gost može:

- kreirati novi Markdown dokument;
- otvoriti lokalni Markdown dokument;
- uređivati dokument;
- sačuvati ili preuzeti dokument;
- izvesti dokument u DOCX/TXT;
- pregledati renderovani sadržaj;
- koristiti pretragu i navigaciju;
- menjati podešavanja prikaza.

Registracija nije potrebna za osnovnu verziju.

## 2.2. Registrovani korisnik — opciono

U budućnosti može biti uvedena podrška za:

- čuvanje dokumenata u oblaku;
- istoriju dokumenata;
- kolekcije;
- sinhronizaciju između uređaja;
- deljenje dokumenata.

Nije deo MVP-a.

---

# 3. Funkcionalni zahtevi

## 3.1. Kreiranje novog Markdown dokumenta

Aplikacija mora omogućiti kreiranje novog praznog Markdown dokumenta.

### Funkcionalnosti

- Komanda **New File / Novi dokument** dostupna je u toolbar-u.
- Podržana je prečica `Ctrl+N` / `Cmd+N`.
- Novi dokument se otvara u Edit režimu.
- Dokument inicijalno može biti potpuno prazan.
- Podrazumevani naziv je `Untitled.md`.
- Korisnik može odmah unositi Markdown sadržaj.
- Dokument dobija status **Modified** nakon prve izmene.
- Prilikom zatvaranja nesačuvanog dokumenta prikazuje se upozorenje.
- Prilikom kreiranja novog dokumenta dok postoje nesačuvane izmene korisnik mora dobiti mogućnost:
  - Save;
  - Don't Save;
  - Cancel.

### Početni template-i

Opcionalno se mogu ponuditi:

- Empty document;
- README;
- Technical Specification;
- Meeting Notes;
- Project Documentation.

---

## 3.2. Otvaranje Markdown dokumenata

Podržani načini:

- Open File;
- drag & drop;
- `Ctrl+O` / `Cmd+O`;
- URL import, kao opciona funkcionalnost;
- Recent Files, kao opciona funkcionalnost.

Podržane ekstenzije:

- `.md`;
- `.markdown`;
- `.mdown`;
- `.mkd`.

Pravila:

1. UTF-8 je podrazumevano kodiranje.
2. Naziv fajla se prikazuje u naslovu/kartici.
3. Neispravan fajl ne sme srušiti aplikaciju.
4. Otvaranje drugog dokumenta ne sme zahtevati reload aplikacije.
5. Dokument sa nesačuvanim izmenama mora izazvati potvrdu pre zamene.

---

## 3.3. Uređivanje postojećeg Markdown dokumenta

Korisnik mora moći da uređuje učitani Markdown dokument.

### Editor

Editor treba da podrži:

- unos teksta;
- selektovanje;
- copy/cut/paste;
- undo/redo;
- pretragu;
- replace;
- syntax highlighting;
- brojeve linija;
- automatsko uvlačenje;
- automatsko prelamanje linija;
- Unicode/UTF-8;
- Markdown syntax highlighting.

Editor mora čuvati:

- originalni sadržaj dok korisnik ne izvrši Save;
- prelome redova;
- Unicode karaktere;
- Markdown strukturu.

Svaka izmena postavlja dokument u stanje:

**Saved → Modified**

Nakon uspešnog Save-a:

**Modified → Saved**

---

## 3.4. Markdown rendering

Renderer mora podržati:

- H1–H6;
- pasuse;
- bold;
- italic;
- strikethrough;
- inline code;
- code blocks;
- ordered lists;
- unordered lists;
- nested lists;
- task lists;
- blockquote;
- horizontal rule;
- linkove;
- slike;
- tabele;
- footnotes gde parser to podržava;
- GFM ekstenzije.

Osnovni standard je CommonMark uz GitHub Flavored Markdown ekstenzije.

---

## 3.5. Režimi prikaza

| Režim | Opis |
|---|---|
| Edit View | Markdown editor |
| Rendered View | Formatirani dokument |
| Split View | Editor + preview |
| Live Preview | Automatsko osvežavanje renderovanog sadržaja |
| Fullscreen | Prikaz preko celog ekrana |

Split View može imati sinhronizovano skrolovanje.

---

# 4. Save i Save As

## 4.1. Save

Komanda **Save** čuva trenutne izmene dokumenta.

### Pravila

Ako dokument već ima poznatu lokaciju i browser dozvoljava direktan upis:

1. Aplikacija upisuje sadržaj u postojeći fajl.
2. Nakon uspešnog upisa dokument dobija status **Saved**.
3. Indikator nesačuvanih izmena se uklanja.

Ako direktno čuvanje nije dostupno:

1. Aplikacija generiše sadržaj kao `.md` fajl.
2. Pokreće browser download.
3. Korisnik dobija standardni dijalog za čuvanje/preuzimanje.
4. Dokument ostaje otvoren u editoru.
5. Status čuvanja se ažurira samo nakon uspešnog završetka operacije.

Aplikacija ne sme tvrditi da je fajl uspešno sačuvan ako operacija nije potvrđena.

---

## 4.2. Save As

**Save As** omogućava čuvanje dokumenta pod novim nazivom.

Funkcionalnosti:

- izbor naziva;
- izbor lokacije gde browser to podržava;
- podrazumevana ekstenzija `.md`;
- mogućnost promene naziva;
- mogućnost kreiranja novog fajla;
- nakon uspešnog Save As dokument postaje povezan sa novim fajlom/lokacijom kada browser API to dozvoljava.

Primer:

`technical-specification.md`

---

## 4.3. Browser fallback

Direktan upis postojećeg lokalnog fajla nije podržan u svim browserima.

Zato aplikacija mora imati fallback:

**Save → Download `.md`**

Korisnik nikada ne sme izgubiti sadržaj zato što browser ne podržava File System Access API.

---

## 4.4. Unsaved Changes

Dokument mora imati najmanje dva stanja:

- **Saved**
- **Modified**

UI treba jasno da prikaže Modified stanje, na primer:

`specification.md •`

Prilikom:

- zatvaranja taba;
- otvaranja drugog dokumenta;
- kreiranja novog dokumenta;
- napuštanja stranice;

aplikacija mora upozoriti korisnika ako postoje nesačuvane izmene.

---

# 5. Navigacija kroz dokument

Aplikacija automatski generiše Table of Contents.

Funkcionalnosti:

- hijerarhijski prikaz H1–H6;
- klik na heading vodi do odgovarajuće pozicije;
- aktivni heading je vizuelno označen;
- sidebar može biti sakriven;
- generišu se stabilna sidra;
- duplikati naslova dobijaju jedinstvena sidra.

---

# 6. Pretraga i zamena

Pretraga:

- `Ctrl+F`;
- `Cmd+F`;
- pretraga reči/fraze;
- next/previous;
- broj rezultata;
- highlight rezultata;
- case-sensitive opcija;
- whole-word opcija.

Replace:

- Replace;
- Replace All;
- potvrda pre masovne zamene, ako je potrebno.

---

# 7. Linkovi i slike

## 7.1. Linkovi

Podržati:

- apsolutne URL-ove;
- relativne URL-ove;
- anchor linkove.

Eksterni linkovi koji se otvaraju u novom tabu moraju koristiti odgovarajuću bezbednosnu zaštitu.

## 7.2. Slike

Podržati:

- apsolutne URL-ove;
- relativne putanje kada su dostupne;
- alt tekst;
- responsive prikaz;
- opcioni lightbox.

Neučitane slike treba prikazati sa razumljivom porukom ili alt tekstom.

---

# 8. Izvoz dokumenata

## 8.1. Export as DOCX

Aplikacija mora omogućiti:

**Export → DOCX**

Izvoz treba da prenese:

- H1–H6;
- pasuse;
- bold;
- italic;
- liste;
- task liste gde je moguće;
- blockquote;
- linkove;
- tabele;
- code blocks;
- slike kada su dostupne.

Naslovi treba da se mapiraju na Word heading stilove:

- H1 → Heading 1;
- H2 → Heading 2;
- H3 → Heading 3;
- itd.

Podrazumevani naziv:

`document-name.docx`

Korisnik može promeniti naziv pre preuzimanja.

### DOCX greške

Ako pojedini Markdown elementi ne mogu biti potpuno konvertovani:

- ostatak dokumenta se ipak izvozi;
- aplikacija prikazuje upozorenje;
- originalni Markdown ostaje nepromenjen.

Preporuka je da se DOCX generiše lokalno u browseru gde god je moguće.

---

## 8.2. Export as TXT

Aplikacija mora omogućiti:

**Export → TXT**

TXT izvoz mora:

- ukloniti Markdown formatirajuće oznake;
- sačuvati tekstualni sadržaj;
- sačuvati strukturu naslova;
- sačuvati liste;
- sačuvati code block sadržaj;
- sačuvati Unicode znakove;
- koristiti UTF-8 kodiranje.

Primer:

Markdown:

```markdown
# Project

This is **important**.
```

TXT:

```text
Project

This is important.
```

Za linkove je preporučeni format:

```text
OpenAI (https://openai.com)
```

Za slike se koristi alt tekst kada postoji.

Podrazumevani naziv:

`document-name.txt`

---

# 9. Ostale funkcije kopiranja i izvoza

Podržati:

- Copy selected text;
- Copy code block;
- Copy Markdown source;
- Copy heading link;
- Print;
- Save as PDF preko browser Print funkcije.

---

# 10. Upravljanje dokumentima i tabovima

Ako je omogućeno više dokumenata:

- tab za svaki otvoreni dokument;
- aktivni tab;
- zatvaranje taba;
- Close All;
- naziv fajla;
- Modified indikator;
- potvrda pri zatvaranju nesačuvanog dokumenta;
- svaki dokument ima sopstveno stanje editora.

---

# 11. Početni ekran

Kada nema otvorenog dokumenta:

## Markdown Viewer & Editor

Akcije:

- **New Markdown File**
- **Open Markdown File**
- Drag & Drop zona

Opcionalno:

- Recent Files;
- templates;
- informacije o privatnosti.

---

# 12. Podešavanja

Podržati:

- Light;
- Dark;
- System;
- veličina fonta;
- porodica fonta;
- širina sadržaja;
- line height;
- code font;
- syntax highlighting theme;
- line numbers;
- word wrap;
- sidebar visibility.

Podešavanja se čuvaju lokalno.

---

# 13. Korisnički interfejs

## 13.1. Desktop

Predloženi toolbar:

`New | Open | Save | Save As | Export | Undo | Redo | Search | View | Theme | Fullscreen`

Sidebar:

- Document Outline;
- Open Documents.

Centralni deo:

- Edit;
- Preview;
- Split View.

Status bar:

- filename;
- Saved / Modified;
- word count;
- character count, opciono;
- current view.

## 13.2. Mobilni prikaz

Na mobilnim uređajima:

- toolbar se redukuje;
- manje korišćene funkcije idu u overflow menu;
- Edit i Preview mogu biti odvojene kartice;
- sidebar postaje drawer;
- code block i tabela imaju horizontalni scroll.

---

# 14. Funkcionalni zahtevi i prioriteti

| ID | Funkcionalnost | Prioritet |
|---|---|---|
| FR-001 | Kreiranje novog Markdown fajla | Must |
| FR-002 | Otvaranje lokalnog Markdown fajla | Must |
| FR-003 | Drag-and-drop | Must |
| FR-004 | Markdown rendering | Must |
| FR-005 | Uređivanje postojećeg Markdown dokumenta | Must |
| FR-006 | Save | Must |
| FR-007 | Save As | Must |
| FR-008 | Download fallback kada direktno čuvanje nije podržano | Must |
| FR-009 | Indikator nesačuvanih izmena | Must |
| FR-010 | Upozorenje pri gubitku nesačuvanih izmena | Must |
| FR-011 | CommonMark + GFM | Must |
| FR-012 | Edit / Source View | Must |
| FR-013 | Rendered View | Must |
| FR-014 | Light/Dark/System tema | Must |
| FR-015 | Document navigation / TOC | Must |
| FR-016 | Search | Must |
| FR-017 | Copy Markdown / Code | Must |
| FR-018 | Export as DOCX | Must |
| FR-019 | Export as TXT | Must |
| FR-020 | Responsive dizajn | Must |
| FR-021 | HTML sanitizacija | Must |
| FR-022 | Split View | Should |
| FR-023 | Live Preview | Should |
| FR-024 | Replace / Replace All | Should |
| FR-025 | Više otvorenih dokumenata | Should |
| FR-026 | Print / Save as PDF | Should |
| FR-027 | Podešavanje tipografije | Should |
| FR-028 | Recent Files | Could |
| FR-029 | URL import | Could |
| FR-030 | Mermaid | Could |
| FR-031 | Math / KaTeX | Could |
| FR-032 | PWA | Could |
| FR-033 | Cloud storage | Won't for MVP |
| FR-034 | User accounts | Won't for MVP |
| FR-035 | Collaborative editing | Won't for MVP |

---

# 15. Bezbednosni zahtevi

1. HTML iz Markdown-a mora biti sanitizovan.
2. JavaScript iz Markdown dokumenta ne sme biti izvršen.
3. `javascript:` URL-ovi moraju biti blokirani.
4. Koristiti proverenu Markdown biblioteku.
5. Koristiti HTML sanitizator.
6. Eksterni linkovi moraju imati odgovarajuću zaštitu.
7. Lokalni dokumenti se ne šalju na server u osnovnom režimu.
8. Ne sme se dozvoliti pristup proizvoljnim lokalnim fajlovima.
9. URL import mora imati zaštitu od SSRF-a ako se uvodi serverska komponenta.
10. Export servisi ne smeju neovlašćeno slati dokument na eksterni servis.
11. Lokalni draft podaci moraju biti obrisivi.
12. Neuspešan Save/Export ne sme obrisati sadržaj editora.

---

# 16. Nefunkcionalni zahtevi

| Oblast | Zahtev |
|---|---|
| Performanse | Dokument od približno 1 MB treba da se učita i renderuje bez primetnog kašnjenja na referentnom uređaju. |
| Responsive | Desktop, tablet i mobile podrška. |
| Browser | Chrome, Edge, Firefox i Safari aktuelne stabilne verzije. |
| Accessibility | Cilj WCAG 2.2 AA. |
| Privatnost | Lokalna obrada kao podrazumevano ponašanje. |
| Pouzdanost | Greške ne smeju dovesti do gubitka dokumenta. |
| Encoding | UTF-8. |
| Testabilnost | Unit, integration i E2E testovi. |
| Održavanje | Modularna arhitektura. |

---

# 17. Predložena tehnička osnova

- **Frontend:** React + TypeScript.
- **Build:** Vite.
- **Editor:** CodeMirror 6 ili Monaco Editor.
- **Markdown parser:** remark/unified + remark-gfm.
- **Sanitizacija:** DOMPurify.
- **Syntax highlighting:** Shiki ili Highlight.js.
- **DOCX:** `docx` ili odgovarajuća klijentska biblioteka.
- **TXT:** sopstveni Markdown-to-plain-text converter.
- **Local preferences:** localStorage.
- **Draft/recovery:** IndexedDB kada je potrebno.
- **Testing:** Vitest + React Testing Library + Playwright.
- **Hosting:** statički HTTPS hosting.

Backend nije potreban za MVP.

File System Access API može se koristiti za direktan Save/Save As kada je podržan, uz Download fallback za ostale browser-e.

---

# 18. Razvojne faze

## F1 — MVP Viewer & Editor

Obavezno:

- New Markdown File;
- Open;
- Drag & Drop;
- Edit;
- Markdown rendering;
- Save;
- Save As;
- Download fallback;
- Modified indicator;
- Unsaved changes protection;
- CommonMark/GFM;
- Light/Dark/System;
- osnovni responsive layout;
- bezbedan rendering;
- Export DOCX;
- Export TXT.

**Rezultat F1:** korisnik može od početka do kraja da kreira, otvori, izmeni, sačuva i izveze Markdown dokument.

## F2 — Advanced Editing & Navigation

- TOC;
- Search;
- Replace;
- Split View;
- Live Preview;
- Undo/Redo;
- syntax highlighting;
- line numbers;
- word wrap;
- više otvorenih dokumenata;
- napredna podešavanja editora.

## F3 — Advanced Export & Content

- Print;
- Save as PDF;
- naprednije DOCX formatiranje;
- slike u DOCX izvozu;
- Mermaid;
- KaTeX/math;
- optimizacija velikih dokumenata.

## F4 — PWA & Cloud Extensions

- PWA;
- Recent Files;
- draft recovery;
- URL import;
- napredni rad sa relativnim resursima;
- opciona cloud storage integracija;
- korisnički nalozi.

---

# 19. Acceptance Criteria

## AC-01 — New File

- Korisnik može kreirati novi Markdown dokument.
- Novi dokument ima podrazumevani naziv `Untitled.md`.
- Korisnik može odmah unositi sadržaj.
- Dokument postaje Modified nakon izmene.

## AC-02 — Open

- Korisnik može otvoriti `.md` fajl.
- UTF-8 sadržaj se pravilno prikazuje.
- Drag & Drop radi.
- Neispravan fajl ne ruši aplikaciju.

## AC-03 — Edit

- Korisnik može menjati učitani Markdown.
- Undo/Redo radi.
- Markdown se može editovati bez gubitka sadržaja.
- Editor podržava Unicode.

## AC-04 — Save

- Save čuva izmene u postojećem fajlu kada browser API to omogućava.
- Ako nije moguće direktno čuvanje, aplikacija nudi `.md` download.
- Sadržaj editora ostaje netaknut ako Save ne uspe.
- Nakon uspešnog čuvanja dokument dobija status Saved.

## AC-05 — Save As

- Save As omogućava novi naziv fajla.
- Podrazumevana ekstenzija je `.md`.
- Nakon uspešnog Save As dokument dobija novu ciljnu lokaciju kada browser to omogućava.
- Fallback download radi kada File System Access API nije dostupan.

## AC-06 — Unsaved Changes

- Modified indikator je vidljiv.
- Zatvaranje Modified dokumenta zahteva potvrdu.
- New/Open akcija zahteva potvrdu ako bi izazvala gubitak izmena.
- Korisnik može izabrati Save, Don't Save ili Cancel.

## AC-07 — Rendering

- H1–H6 se pravilno renderuju.
- Liste, tabele, code blocks, links i blockquotes rade.
- GFM task liste rade.
- HTML/JS injection je blokiran.

## AC-08 — View Modes

- Edit View radi.
- Rendered View radi.
- Split View prikazuje oba prikaza.
- Live Preview ažurira rezultat nakon izmene.

## AC-09 — Search & Replace

- Search pronalazi tekst.
- Rezultati se highlight-uju.
- Next/Previous radi.
- Replace menja odabrani rezultat.
- Replace All menja sva odgovarajuća pojavljivanja.

## AC-10 — DOCX Export

- Dokument se može izvesti kao `.docx`.
- Naslovi su mapirani na Word heading stilove.
- Tekst, liste, tabele i code blocks se prenose kada je podržano.
- Originalni Markdown ostaje nepromenjen.
- Greška izvoza prikazuje poruku.

## AC-11 — TXT Export

- Dokument se može izvesti kao `.txt`.
- Markdown oznake se uklanjaju.
- Struktura sadržaja ostaje čitljiva.
- Code blocks zadržavaju sadržaj.
- UTF-8 karakteri se čuvaju.

## AC-12 — Navigation

- TOC se generiše iz naslova.
- Klik na stavku TOC-a vodi do odgovarajućeg dela dokumenta.
- Duplirani naslovi dobijaju jedinstvena sidra.

## AC-13 — Responsive

- Osnovne funkcije rade na desktopu i mobilnom uređaju.
- Editor je upotrebljiv na malom ekranu.
- Toolbar se prilagođava širini ekrana.
- Code blocks i tabele mogu horizontalno da se skroluju.

## AC-14 — Privacy & Security

- Lokalni fajl se ne šalje na server u osnovnom režimu.
- Markdown ne može izvršiti proizvoljan JavaScript.
- Nedozvoljeni URL protokoli su blokirani.
- Neuspešan Save/Export ne briše dokument.

---

# 20. Početni razvojni backlog

| ID | Razvojni zadatak | Prioritet | Faza |
|---|---|---|---|
| MDV-001 | Inicijalizacija React + TypeScript projekta | Must | F1 |
| MDV-002 | Osnovni application layout | Must | F1 |
| MDV-003 | Toolbar sa osnovnim akcijama | Must | F1 |
| MDV-004 | Kreiranje novog Markdown dokumenta | Must | F1 |
| MDV-005 | Lokalno otvaranje Markdown fajla | Must | F1 |
| MDV-006 | Drag & Drop upload | Must | F1 |
| MDV-007 | Integracija Markdown parsera | Must | F1 |
| MDV-008 | GFM podrška | Must | F1 |
| MDV-009 | Markdown editor | Must | F1 |
| MDV-010 | Rendered Preview | Must | F1 |
| MDV-011 | Save postojeće datoteke | Must | F1 |
| MDV-012 | Save As | Must | F1 |
| MDV-013 | Download fallback | Must | F1 |
| MDV-014 | Modified/Saved state | Must | F1 |
| MDV-015 | Unsaved changes protection | Must | F1 |
| MDV-016 | HTML sanitizacija | Must | F1 |
| MDV-017 | Export as DOCX | Must | F1 |
| MDV-018 | Export as TXT | Must | F1 |
| MDV-019 | Light/Dark/System theme | Must | F1 |
| MDV-020 | Responsive UI | Must | F1 |
| MDV-021 | Table of Contents | Must | F2 |
| MDV-022 | Search | Must | F2 |
| MDV-023 | Replace / Replace All | Should | F2 |
| MDV-024 | Split View | Should | F2 |
| MDV-025 | Live Preview | Should | F2 |
| MDV-026 | Undo/Redo integration | Must | F2 |
| MDV-027 | Syntax highlighting | Should | F2 |
| MDV-028 | Line numbers | Could | F2 |
| MDV-029 | Word wrap | Could | F2 |
| MDV-030 | Multiple document tabs | Should | F2 |
| MDV-031 | Print stylesheet | Should | F3 |
| MDV-032 | Save as PDF | Should | F3 |
| MDV-033 | Advanced DOCX formatting | Should | F3 |
| MDV-034 | Mermaid | Could | F3 |
| MDV-035 | Math/KaTeX | Could | F3 |
| MDV-036 | PWA | Could | F4 |
| MDV-037 | Recent Files | Could | F4 |
| MDV-038 | Draft recovery | Could | F4 |
| MDV-039 | URL import | Could | F4 |
| MDV-040 | Cloud storage | Won't for MVP | F4 |
| MDV-041 | User accounts | Won't for MVP | F4 |
| MDV-042 | Collaborative editing | Won't for MVP | Future |

---

# 21. Završna definicija proizvoda

**MD Viewer & Editor** je lokalno-orijentisana web aplikacija koja omogućava kompletan osnovni lifecycle Markdown dokumenta:

**New → Edit → Preview → Save / Save As → Export**

Aplikacija u MVP verziji mora omogućiti korisniku da:

1. kreira novi Markdown dokument;
2. otvori postojeći `.md` dokument;
3. uređuje sadržaj;
4. vidi formatirani rezultat;
5. sačuva izmene;
6. koristi Save As;
7. preuzme `.md` fajl kada browser ne podržava direktno čuvanje;
8. izveze dokument u DOCX;
9. izveze dokument u TXT;
10. bezbedno zatvori dokument bez nenamernog gubitka izmena.

MVP ne zahteva backend, bazu podataka, autentifikaciju ili cloud storage. Lokalna obrada treba da bude osnovni model rada, dok se cloud funkcionalnosti mogu dodati u budućim fazama.

**Ključna napomena:** mogućnost direktnog čuvanja postojećeg lokalnog fajla zavisi od browser-a i File System Access API podrške. Aplikacija zato mora imati pouzdan Download/Save fallback i nikada ne sme izgubiti sadržaj editora zbog ograničenja browser-a.
