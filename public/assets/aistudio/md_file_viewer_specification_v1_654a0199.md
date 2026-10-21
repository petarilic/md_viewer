**Naziv projekta:** MD Viewer  
**Tip aplikacije:** Web aplikacija za pregled, navigaciju i čitanje Markdown (`.md`) dokumenata  
**Verzija dokumenta:** 1.0  
**Status:** Početna funkcionalna specifikacija

## 1. Ciljevi i opseg aplikacije

Aplikacija treba da bude lagan, brz i moderan Markdown čitač, namenjen pregledanju tehničke dokumentacije, specifikacija, README fajlova, projektnih dokumenata, beležaka i drugih tekstualnih sadržaja.

Osnovni principi:
- **Jednostavnost:** dokument se otvara sa minimalnim brojem koraka.
- **Čitljivost:** kvalitetan prikaz naslova, teksta, tabela, koda i drugih Markdown elemenata.
- **Responsive dizajn:** podrška za desktop, tablet i mobilne uređaje.
- **Privatnost:** lokalni dokumenti se podrazumevano obrađuju u pregledaču, bez obaveznog slanja na server.
- **Pristupačnost:** podrška za tastaturu, jasnu navigaciju i čitljiv kontrast.
- **Proširivost:** arhitektura omogućava naknadno dodavanje editora, organizacije dokumenata i drugih funkcionalnosti.

## 2. Korisničke uloge

### 2.1. Gost / anonimni korisnik
- Otvara lokalne `.md` fajlove.
- Prevlači fajlove u aplikaciju.
- Čita dokumente i koristi opcije prikaza.
- Ne mora da kreira nalog.

### 2.2. Registrovani korisnik — opcionalno
U budućim fazama može čuvati podešavanja, omiljene dokumente, kolekcije i istoriju pregledanja. Registracija nije deo prve verzije.

## 3. Funkcionalni zahtevi

### 3.1. Otvaranje Markdown dokumenata

Podržani načini otvaranja:
- Izbor fajla preko sistemskog dijaloga (*Open File*).
- Prevlačenje i puštanje jednog ili više `.md` fajlova (*drag and drop*).
- Otvaranje preko prečice na tastaturi.
- Otvaranje dokumenta preko URL-a, ako je podržan javni HTTP/HTTPS izvor.
- Otvaranje nedavno korišćenih fajlova tokom aktivne sesije.

Pravila ponašanja:
1. Podrazumevani dozvoljeni format je `.md`.
2. Opcionalno se podržavaju `.markdown`, `.mdown` i `.mkd`.
3. Aplikacija prikazuje naziv dokumenta i stanje učitavanja.
4. Ako dokument nije validan tekstualni sadržaj, prikazuje se razumljiva poruka.
5. Ako se otvori novi dokument, aplikacija prelazi na njega bez ponovnog učitavanja cele aplikacije.
6. Ako se otvori više dokumenata, mogu se prikazati kao kartice.
7. Korisnik može zatvoriti dokument i vratiti se na početni ekran.

### 3.2. Markdown rendering

Renderer treba da podrži:
- Naslove nivoa H1–H6.
- Pasuse, prelom reda i horizontalne linije.
- Podebljan i kurzivan tekst, precrtavanje i inline kod.
- Numerisane i nenumerisane liste, uključujući ugnježdene liste.
- Task liste sa checkbox oznakama.
- Linkove ka eksternim stranicama i lokalnim naslovima.
- Slike sa alternativnim tekstom.
- Blokove koda sa oznakom programskog jezika i sintaksnim bojenjem.
- Tabele sa poravnanjem kolona.
- Blockquote elemente.
- Escape karaktere i prikaz Markdown simbola koji nisu deo formatiranja.
- Footnotes i definicije referenci ako ih korišćena biblioteka podržava.
- Matematičke formule i dijagrame kao opcionalne proširene funkcionalnosti.

Aplikacija treba da podrži CommonMark kao osnovni standard, uz odabrane GitHub Flavored Markdown (GFM) ekstenzije.

### 3.3. Režimi prikaza

| Režim | Opis |
|---|---|
| Rendered View | Prikazuje formatirani Markdown dokument. |
| Source View | Prikazuje izvorni Markdown tekst bez formatiranja. |
| Split View | Prikazuje izvorni tekst i renderovani rezultat istovremeno. |
| Fullscreen | Prikazuje dokument preko celog raspoloživog prostora. |

U Split View režimu, opciono se omogućava sinhronizovano skrolovanje izvornog teksta i renderovanog sadržaja.

### 3.4. Navigacija kroz dokument

Aplikacija treba automatski da generiše sadržaj dokumenta (*Table of Contents — TOC*) na osnovu naslova.

Funkcionalnosti:
- Bočna navigacija sa hijerarhijskom strukturom naslova.
- Klik na naslov vodi do odgovarajućeg dela dokumenta.
- Isticanje trenutno aktivnog naslova.
- Mogućnost skrivanja i ponovnog otvaranja navigacionog panela.
- Kopiranje direktnog linka do određenog naslova, kada je dokument dostupan preko URL-a.
- Automatsko generisanje stabilnih sidara za naslove, uz rešavanje dupliranih naziva.

### 3.5. Pretraga sadržaja

Pretraga omogućava pronalaženje teksta unutar trenutno otvorenog dokumenta:
- Pretraga po reči ili frazi.
- Prikaz broja pronađenih rezultata.
- Prelazak na prethodni i sledeći rezultat.
- Isticanje pronađenih termina.
- Opcija razlikovanja velikih i malih slova.
- Opcija pretrage cele reči.
- Prečica `Ctrl+F` / `Cmd+F`.
- Poruka kada nema rezultata.

Napredna pretraga kroz više dokumenata može se dodati u kasnijoj fazi.

### 3.6. Podešavanja prikaza

Korisnik može da prilagodi čitanje dokumenta:
- Light, Dark i System Theme režim.
- Podešavanje veličine fonta.
- Izbor porodice fonta za tekst.
- Podešavanje širine sadržaja: uska, standardna ili široka.
- Podešavanje razmaka između redova i pasusa.
- Prikaz ili skrivanje sadržaja dokumenta.
- Podešavanje veličine fonta u blokovima koda.
- Izbor stila sintaksnog bojenja.
- Uključivanje i isključivanje brojeva linija u blokovima koda.

Podešavanja se čuvaju lokalno u pregledaču i primenjuju na naredne dokumente.

### 3.7. Rad sa linkovima i slikama

**Eksterni linkovi**
- Linkovi se otvaraju u novom tabu, uz bezbedne atribute.
- Neispravni URL-ovi se prikazuju kao neaktivni ili prijavljuju odgovarajućom porukom.
- Podržavaju se relativni i apsolutni linkovi.
- Linkovi na naslove vode do odgovarajućih sidara u dokumentu.

**Slike**
- Prikaz slika sa alternativnim tekstom.
- Podrška za apsolutne URL-ove slika.
- Podrška za relativne putanje kada je poznata lokacija izvornog dokumenta i postoji dozvoljen pristup povezanim fajlovima.
- Ograničavanje maksimalne širine slike prema širini sadržaja.
- Klik na sliku može da otvori uvećani prikaz.
- Ako slika ne može da se učita, prikazuje se zamenski prikaz sa nazivom ili alternativnim tekstom.

Relativne putanje do lokalnih slika ne mogu se pouzdano razrešiti samo na osnovu sadržaja `.md` fajla. Za ovu funkcionalnost potrebno je definisati pristup pratećim fajlovima ili podržati otvaranje kompletnog direktorijuma.

### 3.8. Kopiranje i izvoz

Korisnik treba da ima mogućnost da:
- Kopira tekst selektovanog dela dokumenta.
- Kopira sadržaj bloka koda jednim klikom.
- Kopira izvorni Markdown sadržaj.
- Kopira link do naslova.
- Odštampa dokument pomoću funkcije *Print*.
- Sačuva renderovani dokument kao PDF putem dijaloga za štampanje.
- Preuzme originalni dokument ako je otvoren iz udaljenog izvora i preuzimanje je dozvoljeno.

U osnovnoj verziji nije potrebno implementirati sopstveni PDF generator. Dovoljna je kvalitetna print verzija dokumenta i podrška za `Save as PDF` u pregledaču.

### 3.9. Upravljanje dokumentima i karticama

Ako je podržano otvaranje više dokumenata, aplikacija treba da obezbedi:
- Prikaz otvorenih dokumenata u karticama.
- Prebacivanje između otvorenih dokumenata.
- Zatvaranje pojedinačne kartice.
- Zatvaranje svih dokumenata.
- Prikaz naziva fajla na kartici.
- Indikator da je dokument učitan.
- Upozorenje pre napuštanja dokumenta ako u budućnosti bude omogućen nesačuvani editovani sadržaj.

Viewer u osnovnoj verziji ne menja originalni fajl. Izmena sadržaja i čuvanje izmena pripadaju eventualnom budućem Markdown editoru.

### 3.10. Početni ekran i prazna stanja

Kada nijedan dokument nije otvoren, aplikacija prikazuje:
- Dugme za otvaranje fajla.
- Površinu za drag-and-drop.
- Kratak opis podržanih formata.
- Opcionalnu listu nedavno otvorenih dokumenata.
- Informaciju o privatnosti i lokalnoj obradi dokumenata.

Poruke o greškama moraju biti razumljive i ne smeju prikazivati nepotrebne tehničke detalje.

## 4. Predlog korisničkog interfejsa

### 4.1. Desktop raspored

1. **Top toolbar:** naziv aplikacije, otvaranje fajla, pretraga, izbor režima prikaza, tema i fullscreen.
2. **Sidebar:** sadržaj dokumenta i opciona lista otvorenih dokumenata.
3. **Main content:** renderovani dokument ili izvorni tekst.
4. **Status bar:** naziv fajla, aktivni režim prikaza i relevantni podaci o dokumentu.

### 4.2. Mobilni prikaz

- Sidebar se pretvara u bočni meni ili modalni panel.
- Toolbar prikazuje samo najvažnije akcije.
- Sadržaj koristi širinu ekrana uz odgovarajuće margine.
- Tabele mogu imati horizontalno skrolovanje.
- Blokovi koda imaju sopstveno horizontalno skrolovanje.
- Kontrole moraju biti dovoljno velike za dodir.
- Pretraga se prikazuje u posebnom panelu ili preko vrha dokumenta.

## 5. Funkcionalni zahtevi i prioriteti

| ID | Funkcionalnost | Prioritet |
|---|---|---|
| FR-001 | Otvaranje lokalnog `.md` fajla | Must |
| FR-002 | Drag-and-drop fajla | Must |
| FR-003 | Markdown rendering | Must |
| FR-004 | Podrška za CommonMark i GFM osnove | Must |
| FR-005 | Source View | Must |
| FR-006 | Light/Dark/System tema | Must |
| FR-007 | Navigacija kroz naslove | Must |
| FR-008 | Pretraga u dokumentu | Must |
| FR-009 | Kopiranje koda i izvornog teksta | Must |
| FR-010 | Responsive dizajn | Must |
| FR-011 | Bezbedan prikaz sadržaja | Must |
| FR-012 | Print / Save as PDF | Should |
| FR-013 | Više otvorenih dokumenata | Should |
| FR-014 | Split View | Should |
| FR-015 | Podešavanje fonta i širine sadržaja | Should |
| FR-016 | Nedavno otvoreni dokumenti | Should |
| FR-017 | Direktno učitavanje HTTP/HTTPS URL-a | Could |
| FR-018 | Prikaz Mermaid dijagrama | Could |
| FR-019 | Prikaz matematičkih formula | Could |
| FR-020 | PWA podrška | Could |
| FR-021 | Organizacija dokumenata u kolekcije | Won't for MVP |

Prioritet *Won't for MVP* znači da funkcionalnost nije predviđena za početnu verziju, ali može biti razmotrena u budućnosti.

## 6. Bezbednosni zahtevi

Markdown dokumenti mogu sadržati potencijalno opasan HTML, linkove i spoljne resurse. Bezbednost je obavezna karakteristika.

1. HTML ugrađen u Markdown mora biti sanitizovan ili potpuno onemogućen.
2. Zabraniti izvršavanje JavaScript-a iz učitanih dokumenata.
3. Ne dozvoliti `javascript:` URL-ove i slične nebezbedne protokole.
4. Koristiti proverenu Markdown biblioteku i sanitizator HTML-a.
5. Eksterni linkovi koji se otvaraju u novom tabu moraju imati odgovarajuću zaštitu od pristupa `window.opener`.
6. Ne učitavati udaljene slike ili druge resurse automatski bez jasno definisane politike privatnosti.
7. Ne slati sadržaj lokalnih fajlova na server.
8. Obraditi greške pri učitavanju fajlova i ograničiti potrošnju memorije kod velikih dokumenata.
9. Ako se implementira URL import, zaštititi aplikaciju od nebezbednih preusmeravanja i pristupa internim mrežnim adresama na serverskoj strani.
10. Ako aplikacija koristi PWA keširanje, ne čuvati sadržaj privatnih dokumenata bez eksplicitno definisanog ponašanja.

## 7. Nefunkcionalni zahtevi

| Oblast | Zahtev |
|---|---|
| Performanse | Učitavanje i renderovanje uobičajenog dokumenta od 1 MB treba da traje do 1 sekunde na referentnom desktop uređaju, bez mrežnog čekanja. |
| Responsivnost | Interfejs mora biti funkcionalan na mobilnim uređajima, tabletima i desktop računarima. |
| Kompatibilnost | Podrška za aktuelne stabilne verzije Chrome-a, Edge-a, Firefox-a i Safari-ja. |
| Pristupačnost | Cilj WCAG 2.2 AA, uključujući tastaturu, fokus i kontrast. |
| Privatnost | Lokalni fajlovi se podrazumevano obrađuju lokalno. |
| Održavanje | Modularna arhitektura i odvojeni UI, parser, renderer i servis za učitavanje dokumenata. |
| Pouzdanost | Neispravan dokument ne sme da sruši aplikaciju. |
| Skalabilnost | Veliki dokumenti obrađuju se bez nepotrebnog kopiranja sadržaja i blokiranja UI-ja. |
| Internacionalizacija | Podrška za Unicode, UTF-8 i srpski jezik sa dijakritičkim znakovima. |
| Testabilnost | Jedinični, integracioni i end-to-end testovi za ključne tokove. |

Vrednosti performansi su predloženi kriterijumi prihvatanja, a ne garantovane karakteristike. Potrebno ih je potvrditi testiranjem na dogovorenoj referentnoj konfiguraciji.

## 8. Predložena tehnička osnova

Ovo je preporuka za realizaciju, a ne obavezni deo funkcionalnog opsega.

- **Frontend:** React + TypeScript.
- **Build alat:** Vite.
- **Stilizovanje:** CSS Modules ili Tailwind CSS.
- **Markdown parser:** `remark` / `unified` ili proverena alternativa sa GFM podrškom.
- **HTML sanitizacija:** DOMPurify ili odgovarajuće rešenje.
- **Syntax highlighting:** Shiki ili Highlight.js.
- **Lokalna podešavanja:** `localStorage`.
- **Testiranje:** Vitest, React Testing Library i Playwright.
- **Hosting:** statički hosting preko HTTPS-a.

Backend, baza podataka i autentifikacija nisu potrebni za osnovni viewer. Ako se naknadno uvedu korisnički nalozi, deljenje dokumenata ili centralizovana biblioteka, arhitektura se može proširiti odgovarajućim servisima.

Otvaranje lokalnih fajlova i relativnih resursa mora biti zasnovano na eksplicitnim dozvolama pregledača. React aplikacija nema neograničen pristup lokalnom fajl-sistemu.

## 9. Razvojne faze

### F1 — Osnovni Markdown Viewer (MVP)
- Otvaranje lokalnih fajlova i drag-and-drop.
- Markdown rendering i Source View.
- Osnovni GFM elementi.
- Light/Dark/System tema.
- Responsive layout.
- Bezbedan rendering.

### F2 — Napredna navigacija i čitanje
- Automatski TOC.
- Pretraga dokumenta.
- Split View.
- Više otvorenih dokumenata.
- Podešavanje fonta i širine.
- Kopiranje linkova do naslova.

### F3 — Izvoz i napredni sadržaj
- Print optimizacija i Save as PDF.
- Napredni syntax highlighting.
- Uvećani prikaz slika.
- Opcionalni Mermaid i matematičke formule.
- Obrada većih dokumenata.

### F4 — Proširenja i distribucija
- Instalabilna PWA aplikacija.
- Opcionalno otvaranje dokumenata preko URL-a.
- Nedavno otvoreni dokumenti.
- Napredna obrada relativnih resursa.
- Mogućnost kasnijeg razvoja u Markdown editor.

Faze predstavljaju preporučeni redosled implementacije. Preporuka je da se prva verzija isporuči bez naloga, baze i backenda.

## 10. Acceptance Criteria — kriterijumi prihvatanja

### AC-01: Otvaranje fajla
- Korisnik može da izabere validan `.md` fajl sa lokalnog računara.
- Sadržaj fajla se prikazuje bez gubitka UTF-8 znakova.
- Neispravan ili nedostupan fajl izaziva jasnu poruku, a ne pad aplikacije.

### AC-02: Markdown rendering
- Naslovi, pasusi, liste, linkovi, citati, tabele i blokovi koda prikazuju se prema definisanom Markdown standardu.
- Kodni blokovi čuvaju uvlačenje i prelome linija.
- GFM task liste prikazuju se pravilno.
- HTML sadržaj ne može da izvršava skripte.

### AC-03: Promena režima prikaza
- Korisnik može da pređe iz Rendered View u Source View i nazad.
- Originalni učitani sadržaj ostaje dostupan prilikom promene režima.
- Promena režima ne izaziva ponovno učitavanje aplikacije.

### AC-04: Navigacija
- TOC se automatski generiše na osnovu naslova.
- Klik na naslov vodi na odgovarajuću poziciju u dokumentu.
- Dokumenti sa dupliranim naslovima dobijaju jedinstvena sidra.

### AC-05: Pretraga
- `Ctrl+F` na Windows/Linux sistemima i `Cmd+F` na macOS sistemima otvara pretragu dokumenta.
- Rezultati su vidljivo označeni.
- Korisnik može da pređe na sledeći ili prethodni rezultat.
- Za pretragu bez pogodaka prikazuje se odgovarajuća poruka.

### AC-06: Responsive prikaz i pristupačnost
- Osnovne funkcionalnosti rade na desktopu i mobilnom uređaju.
- Glavne akcije dostupne su preko tastature.
- Fokus tastature je jasno vidljiv.
- Sadržaj se ne odseca na uskim ekranima, osim elemenata koji imaju sopstveno skrolovanje.

### AC-07: Privatnost i stabilnost
- Lokalni dokument se obrađuje u pregledaču.
- Nema obaveznog prenosa dokumenta na server.
- Neispravni Markdown i nedozvoljeni URL-ovi ne izazivaju izvršavanje skripti.
- Otvaranje i zatvaranje dokumenata ne ostavlja aplikaciju u neispravnom stanju.

## 11. Predlog početnog backlog-a

| ID | Razvojni zadatak | Faza |
|---|---|---|
| MDV-001 | Inicijalizacija React + TypeScript projekta | F1 |
| MDV-002 | Implementacija osnovnog layout-a i toolbar-a | F1 |
| MDV-003 | Implementacija lokalnog učitavanja fajlova | F1 |
| MDV-004 | Implementacija drag-and-drop zone | F1 |
| MDV-005 | Integracija Markdown parsera i GFM podrške | F1 |
| MDV-006 | HTML sanitizacija i URL validacija | F1 |
| MDV-007 | Implementacija Source View režima | F1 |
| MDV-008 | Light/Dark/System tema | F1 |
| MDV-009 | Automatsko generisanje TOC-a | F2 |
| MDV-010 | Implementacija pretrage dokumenta | F2 |
| MDV-011 | Split View i sinhronizovano skrolovanje | F2 |
| MDV-012 | Upravljanje otvorenim dokumentima | F2 |
| MDV-013 | Podešavanje tipografije | F2 |
| MDV-014 | Print stylesheet i PDF izvoz | F3 |
| MDV-015 | Syntax highlighting | F3 |
| MDV-016 | Podrška za Mermaid i formule | F3 |
| MDV-017 | PWA konfiguracija | F4 |
| MDV-018 | Automatizovani E2E i bezbednosni testovi | Sve faze |

## 12. Završna definicija proizvoda

**MD Viewer** je samostalna, klijentska web aplikacija koja omogućava pouzdan pregled Markdown dokumenata, uz formatirani prikaz, pregled izvornog teksta, navigaciju kroz naslove, pretragu, prilagođavanje izgleda i bezbedno rukovanje sadržajem.

Preporučeni obim prve isporuke je F1, sa jasnim interfejsima za kasnije dodavanje F2–F4 funkcionalnosti. Na taj način se prvo dobija upotrebljiv i stabilan proizvod, a zatim se proširuje bez potrebe za uvođenjem nepotrebno složene infrastrukture.
