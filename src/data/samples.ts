export const SPECIFICATION_DOC_NAME = 'Specifikacija_MD_Viewer_v1.0.md';

export const SHOWCASE_MD = `# Markdown & GFM Kompletan Vodič

Dobrodošli u **MD Viewer**! Ovaj dokument prikazuje sve podržane elemente formatiranja teksta, GitHub Flavored Markdown (GFM) ekstenzije, tabele, blokove koda sa sintaksnim bojenjem, matematičke formule i ugnježdene liste.

---

## Tipografija i osnovni elementi

Markdown omogućava jednostavno i čisto formatiranje:
- **Podebljan tekst** pomoću \`**bold**\` ili \`__bold__\`
- *Kurzivni tekst* pomoću \`*italic*\` ili \`_italic_\`
- ***Podebljano i kurzivno*** zajedno
- ~~Precrtan tekst~~ (strikethrough)
- \`Inline kod\` unutar rečenice za promenljive poput \`const documentId = 'md-001'\`
- [Eksterni link sa bezbednim parametrima](https://commonmark.org) koji se otvara u novom tabu

> **Važna napomena:**  
> Svi podaci se obrađuju **100% lokalno u vašem pregledaču**. Fajlovi se ne šalju na udaljeni server, što garantuje potpunu privatnost poverljivih beležaka i tehničke dokumentacije.

---

## Zadaci i Task Liste (GFM)

Planirane stavke sa interaktivnim checkbox oznakama:

- [x] Implementirati brzo otvaranje lokalnih \`.md\` fajlova
- [x] Podrška za drag-and-drop više dokumenata odjednom
- [x] Automatsko generisanje sadržaja (TOC) sa hijerarhijom H1-H6
- [x] Brza pretraga teksta unutar dokumenta (\`Ctrl+F\` / \`Cmd+F\`)
- [x] Prikaz u tri režima: Rendered, Source i Split View
- [ ] Izvoz u prilagođeni PDF format (dostupno preko *Print / Save as PDF*)
- [ ] Sinhronizovano skrolovanje u Split View režimu

---

## Tabele sa poravnanjem

Tabele podržavaju levo, centralno i desno poravnanje kolona pomoću dvotačke \`:\`:

| Prečica | Akcija | Režim | Podržane platforme |
| :--- | :--- | :---: | ---: |
| \`Ctrl + O\` / \`Cmd + O\` | Otvori lokalni fajl | Svi | Windows, Mac, Linux |
| \`Ctrl + F\` / \`Cmd + F\` | Pretraga u dokumentu | Svi | Svi moderni browseri |
| \`Ctrl + P\` / \`Cmd + P\` | Štampa / Sačuvaj kao PDF | Rendered | Svi OS |
| \`F11\` / Dugme | Fullscreen režim | Svi | Desktop |
| \`Esc\` | Zatvori pretragu ili modal | Svi | Svi uređaji |

---

## Blokovi koda i sintaksno bojenje

Aplikacija prepoznaje programske jezike, prikazuje oznaku jezika, omogućava kopiranje koda jednim klikom i prikaz brojeva linija.

### TypeScript / React primer:
\`\`\`typescript
import React, { useState, useEffect } from 'react';

interface ViewerProps {
  initialContent: string;
  theme?: 'light' | 'dark' | 'system';
}

export const MarkdownReader: React.FC<ViewerProps> = ({ initialContent, theme = 'system' }) => {
  const [content, setContent] = useState<string>(initialContent);
  const [wordCount, setWordCount] = useState<number>(0);

  useEffect(() => {
    const words = content.trim().split(/\\s+/).filter(Boolean).length;
    setWordCount(words);
  }, [content]);

  return (
    <article className="prose dark:prose-invert max-w-none">
      <header className="mb-4 text-sm text-gray-500">
        Reči: {wordCount} | Procenjeno vreme čitanja: {Math.ceil(wordCount / 200)} min
      </header>
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </article>
  );
};
\`\`\`

### Python primer:
\`\`\`python
import os
import re

def parse_markdown_metadata(file_path: str) -> dict:
    """Izdvaja naslov i dužinu dokumenta iz Markdown fajla."""
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Dokument nije pronađen: {file_path}")
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()
        
    first_heading = re.search(r"^#\\s+(.+)$", content, re.MULTILINE)
    title = first_heading.group(1) if first_heading else os.path.basename(file_path)
    words = len(re.findall(r"\\b\\w+\\b", content))
    
    return {
        "title": title,
        "word_count": words,
        "reading_time_min": max(1, round(words / 200))
    }
\`\`\`

### SQL upit:
\`\`\`sql
-- Analiza posećenosti dokumentacije
SELECT 
    doc_id,
    title,
    category,
    COUNT(session_id) AS total_views,
    AVG(duration_seconds) AS avg_reading_time
FROM documentation_logs
WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY doc_id, title, category
ORDER BY total_views DESC
LIMIT 10;
\`\`\`

---

## Ugnježdene i numerisane liste

1. **Učitavanje dokumenta**
   - Lokalni fajl sa računara (\`.md\`, \`.markdown\`, \`.mdown\`)
   - Drag & drop u zonu za prevlačenje
   - Uvoz sa javnog HTTPS URL-a (npr. GitHub Raw README)
2. **Navigacija i pregled**
   - Automatski generisan Table of Contents (TOC)
   - Hijerarhija nivoa 1 do 6
   - Praćenje trenutne sekcije tokom skrolovanja
3. **Prilagođavanje izgleda**
   - Veličina fonta: mala, normalna, velika, ekstra velika
   - Porodica fonta: Sans-Serif, Serif ili Monospace
   - Širina stupca: Uska (~680px), Standardna (~880px), Široka (~1150px) ili Puna širina
   - Teme: Svetla, Tamna ili Sistemska

---

## Citati i višestepene beleške

> "Jednostavnost je preduslov za pouzdanost."
> 
> — *Edsger W. Dijkstra*
>> "Kvalitetan softverski inženjering znači da dokumentacija i kod govore istim jezikom."

---

## Matematički izrazi i formule

Linearna regresija i funkcija greške:

$$MSE = \\frac{1}{n} \\sum_{i=1}^{n} (y_i - \\hat{y}_i)^2$$

Brzina čitanja teksta računa se po formuli:
$$T_{min} = \\left\\lceil \\frac{N_{reči}}{200} \\right\\rceil$$

---

## Slike sa opisom i uvećanjem

Klik na bilo koju sliku otvara uvećani prikaz (*lightbox*):

![Primer ilustracije tehnologije](https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1000&auto=format&fit=crop&q=80)
*Slika: Rad sa kodom i strukturiranom dokumentacijom*

---

## Fusnote i reference

Ovaj dokument je optimizovan za standard CommonMark[^1] sa GitHub GFM ekstenzijama[^2].

[^1]: CommonMark specifikacija obezbeđuje preciznu semantiku za parsiranje Markdown sintakse.
[^2]: GFM dodaje tabele, precrtavanje teksta, task liste i automatsko linkovanje.
`;

export const QUICKSTART_MD = `# Brzi Vodič za Korišćenje MD Viewer-a

MD Viewer je dizajniran da vam pruži maksimalnu brzinu i udobnost pri čitanju Markdown dokumenata.

## Ključne mogućnosti

1. **Otvaranje fajlova**:
   - Pritisnite dugme **Otvori fajl** ili prevucite bilo koji \`.md\` fajl bilo gde u prozor pregledača.
   - Možete otvoriti i više fajlova odjednom — svaki će se otvoriti u zasebnoj kartici (*tabu*).
   - Možete uneti javni HTTPS URL (npr. GitHub \`raw.githubusercontent.com\`) za direktno učitavanje.

2. **Režimi prikaza**:
   - **Rendered (Formatirano)**: Čist, moderan prikaz sa tabelama, slikama i formatiranim elementima.
   - **Source (Izvorni kod)**: Sirovi Markdown sa brojevima linija.
   - **Split (Podeljeni prikaz)**: Uporedni prikaz izvornog teksta i renderovanog rezultata.
   - **Fullscreen**: Pritisnite ikonicu za prikaz preko celog ekrana radi fokusiranog čitanja.

3. **Pretraga (\`Ctrl+F\` ili \`Cmd+F\`)**:
   - Trenutno označava sva poklapanja u tekstu.
   - Koristite strelice gore/dole za kretanje kroz rezultate.
   - Podržano razlikovanje malih i velikih slova i pretraga celih reči.

4. **Navigacija (Sadržaj / TOC)**:
   - Sa leve strane se automatski kreira hijerarhijski sadržaj naslova.
   - Klik na bilo koji naslov vas odmah vodi do odgovarajućeg dela dokumenta.
   - Možete kopirati direktan sidreni link klikom na ikonicu pored naslova.

5. **Podešavanja izgleda**:
   - Birajte između **Svetle (Light)**, **Tamne (Dark)** i **Sistemske** teme.
   - Menjajte veličinu fonta, porodicu fonta (Sans, Serif, Mono) i širinu kolone.
   - Uključite ili isključite brojeve linija u blokovima koda.

6. **Štampa i PDF**:
   - Izaberite **Štampa / PDF** iz menija ili pritisnite \`Ctrl+P\`.
   - Dokument je posebno stilizovan za papir i PDF formate, bez dugmića i panela.
`;
