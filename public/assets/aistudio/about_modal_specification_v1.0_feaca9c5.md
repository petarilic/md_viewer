# About modal aplikacije — specifikacija

## 1. Svrha About modala

About modal treba da pruži korisniku kratak i jasan pregled aplikacije: šta je aplikacija, koja je njena verzija, ko je razvija i gde korisnik može da pronađe dodatne informacije ili podršku.

Dizajn treba da bude jednostavan, profesionalan i usklađen sa ostatkom korisničkog interfejsa.

## 2. Ilustracija predloženog izgleda

Sledeća ilustracija je primer UI-ja za aplikaciju **Markdown Viewer**. Naziv, verzija, build, developer i ostali podaci su ilustrativni i treba ih zameniti stvarnim vrednostima.

![Ilustracija About modala za Markdown Viewer](./about_modal_illustration.svg)

> Napomena: SVG ilustracija je sačuvana kao zaseban fajl uz ovu specifikaciju. Da bi se slika prikazala u Markdown pregledaču, zadržite oba fajla u istom direktorijumu.

## 3. Informacije koje modal treba da sadrži

Informacije su podeljene na obavezne, preporučene i opcione.

### 3.1. Obavezne informacije

| Polje | Opis | Primer |
|---|---|---|
| Application name | Zvaničan naziv aplikacije | Markdown Viewer |
| Application icon | Ikonica ili logo aplikacije | SVG/PNG logo |
| Version | Verzija aplikacije | `1.2.0` |
| Short description | Kratak opis namene | View, edit and export Markdown files |
| Developer | Ime autora ili kompanije | Company Name |
| Copyright | Nosilac prava i godina | © 2026 Company Name |

### 3.2. Preporučene informacije

| Polje | Namena |
|---|---|
| Build number | Identifikacija konkretne verzije za dijagnostiku |
| Release date | Datum objavljivanja te verzije |
| What's New / Changelog | Pregled novosti u aktuelnoj verziji |
| Privacy Policy | Objašnjenje obrade i zaštite podataka |
| Terms of Use | Uslovi korišćenja, ako su primenljivi |
| Contact / Support | Email ili stranica za podršku |
| Website | Zvanični sajt aplikacije |

### 3.3. Opcione informacije

- Licenca aplikacije, npr. MIT ili komercijalna licenca.
- Open-source biblioteke i njihove licence.
- Link ka GitHub repozitorijumu, ako je javan.
- Verzija API-ja ili backend servisa, ako je relevantna za podršku.
- Informacije o dostupnosti funkcionalnosti i kompatibilnosti.
- Link ka prijavi greške ili slanju predloga za unapređenje.

Ne treba prikazivati sve tehničke detalje svakom korisniku. Commit hash, environment, API endpoint i detalji infrastrukture uglavnom pripadaju administratorskom ili dijagnostičkom ekranu.

## 4. UX/UI pravila

Preporučeno ponašanje modala:

- **Otvaranje:** klikom na `About` u glavnom meniju ili meniju `Help`.
- **Zatvaranje:** klikom na `X`, taster `Esc` ili klikom izvan modala, ako je to u skladu sa pravilima aplikacije.
- **Responsive dizajn:** na desktopu modal širine približno 480–560 px; na mobilnim uređajima koristiti skoro punu širinu ekrana.
- **Vizuelna hijerarhija:** logo, naziv i verzija na vrhu; opis i informacije u sredini; pravni linkovi i copyright pri dnu.
- **Pristupačnost:** podrška za tastaturu, vidljiv fokus, odgovarajuće ARIA oznake i čitljiv kontrast.
- **Linkovi:** jasno naznačiti koji otvaraju eksternu stranicu.
- **Lokalizacija:** koristiti jezik koji je izabran u aplikaciji.
- **Dark/Light mode:** automatski pratiti temu aplikacije.

## 5. Predložena struktura sadržaja

1. **Header**
   - Naziv „About“
   - Dugme za zatvaranje
2. **Identitet aplikacije**
   - Ikonica ili logo
   - Naziv aplikacije
   - Verzija
   - Kratak opis
3. **Informacije o izdanju**
   - Datum izdanja
   - Build broj, ako je relevantan
4. **Informacije o developeru**
   - Ime autora ili kompanije
   - Zvanični sajt, ako postoji
5. **Korisni linkovi**
   - Privacy Policy
   - Terms of Use
   - Contact & Support
   - What's New / Changelog, opciono
6. **Footer**
   - Copyright informacija

## 6. Tehnički zahtevi

Ako se aplikacija razvija kao web aplikacija, verzija i podaci o izdanju ne treba da se unose ručno u UI, već da dolaze iz centralne konfiguracije ili build procesa.

Primer konfiguracije:

```json
{
  "name": "Markdown Viewer",
  "version": "1.2.0",
  "buildNumber": "120",
  "releaseDate": "2026-10-23",
  "developer": "Company Name",
  "website": "https://example.com",
  "supportEmail": "support@example.com",
  "privacyPolicyUrl": "https://example.com/privacy",
  "termsUrl": "https://example.com/terms"
}
```

Ovo je ilustrativna konfiguracija, a ne stvarna konfiguracija aplikacije.

### 6.1. Verzije po platformi

Ako je aplikacija dostupna kao web aplikacija, PWA i mobilna aplikacija, prikaz verzije treba prilagoditi platformi:

- Web aplikacija može imati verziju frontenda i build ID.
- Android aplikacija može imati `versionName` i `versionCode`.
- iOS aplikacija može imati marketing verziju i build broj.

Ne treba prikazivati build broj kao verziju koju korisnik vidi u prodavnici aplikacija. Tehničke identifikatore treba prikazati samo kada su korisni korisniku ili podršci.

### 6.2. Linkovi i nedostajuće vrednosti

- Linkovi moraju voditi ka stvarnim i dostupnim stranicama.
- Email podrške mora biti validan i aktivan.
- Opciona polja treba izostaviti ako nisu konfigurisana.
- UI ne sme prikazivati `undefined`, `null` ili neobrađene vrednosti.
- Eksterni linkovi treba da imaju jasnu oznaku i odgovarajuće ponašanje pri otvaranju.

## 7. Acceptance Criteria

Ovi kriterijumi mogu direktno da se iskoriste u Jira User Story-ju.

| ID | Acceptance criterion |
|---|---|
| AC-01 | Korisnik može da otvori About modal iz glavnog menija ili menija Help. |
| AC-02 | Modal prikazuje naziv aplikacije, ikonicu, verziju i kratak opis. |
| AC-03 | Modal prikazuje podatke o developeru i copyright informaciju. |
| AC-04 | Verzija odgovara verziji aktuelnog izdanja aplikacije. |
| AC-05 | Linkovi ka Privacy Policy, Terms of Use i Support prikazuju se samo kada su odgovarajuće vrednosti konfigurisane. |
| AC-06 | Modal može da se zatvori pomoću dugmeta za zatvaranje i tastera `Esc`. |
| AC-07 | Modal je funkcionalan na desktopu, tabletu i mobilnim uređajima. |
| AC-08 | Modal poštuje aktivnu svetlu ili tamnu temu aplikacije. |
| AC-09 | Sve interaktivne kontrole dostupne su putem tastature i imaju odgovarajuće oznake za asistivne tehnologije. |
| AC-10 | Nedostupni opcioni podaci ne prikazuju se kao `undefined`, `null` ili prazne vrednosti. |

## 8. Predlog QA test slučajeva

| ID | Test scenario | Očekivani rezultat |
|---|---|---|
| TC-01 | Otvoriti About modal iz menija | Modal se prikazuje bez greške. |
| TC-02 | Proveriti naziv i verziju aplikacije | Prikazane vrednosti odgovaraju konfiguraciji aktuelnog izdanja. |
| TC-03 | Kliknuti na dugme `X` | Modal se zatvara. |
| TC-04 | Pritisnuti `Esc` dok je modal otvoren | Modal se zatvara, u skladu sa pravilima aplikacije. |
| TC-05 | Kliknuti na Privacy Policy | Otvara se ispravna politika privatnosti. |
| TC-06 | Isključiti opcionu URL konfiguraciju | Odgovarajući link se ne prikazuje; nema praznih ili neispravnih elemenata. |
| TC-07 | Otvoriti modal u dark mode-u | Boje, tekst i kontrole ostaju čitljivi. |
| TC-08 | Proveriti modal na uskom ekranu | Sadržaj se prilagođava bez horizontalnog skrolovanja и преклапања. |
| TC-09 | Навигација само тастатуром | Фокус је видљив и контроле су доступне. |
| TC-10 | Проверити недостајуће метаподатке | UI не приказује `null`, `undefined` нити необрађене вредности. |

## 9. Preporuka

About modal treba da bude kratak, uredan i informativan. Za Markdown Viewer posebno treba istaći:

- Naziv aplikacije i logo.
- Verziju aplikacije.
- Kratak opis funkcionalnosti.
- Informacije o developeru.
- Linkove ka politici privatnosti i podršci.
- Copyright informaciju.

Changelog može biti zaseban link ili sekcija ako aplikacija ima redovna izdanja. About modal ne treba da postane kompletna tehnička dokumentacija — njegov cilj je identifikacija aplikacije, transparentnost i lak pristup dodatnim informacijama.
