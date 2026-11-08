# L'Antica Via del Cifalco: sito web

Il sito del cammino, costruito con [Astro](https://astro.build): pagine
statiche velocissime, con due sole parti interattive (il walking tracker e la
mappa GPX). **I testi sono separati dal codice**: per correggerli basta
modificare file di testo.

---

## Come avviare il sito sul proprio computer

Serve [Node.js](https://nodejs.org) (versione 20 o successiva). Nella cartella
del progetto:

```bash
npm install
```

```bash
npm run dev
```

Il sito si apre su http://localhost:4321 e ogni modifica si vede subito.
Per produrre la versione da pubblicare: `npm run build` (crea `dist/`).
`npm test` costruisce il sito e verifica il walking tracker.

---

## La struttura del sito

Segue lo «schema base» di Luchino (`scripts/docx/originali/`):

1. Home
2. Chi siamo (a–d, una sola pagina)
3. Fare il cammino: informazioni pratiche (a–g, una pagina per voce)
4. Approfondimenti (a–f, una pagina per voce)
5. Intorno all'Antica Via del Cifalco (e oltre): per ora solo c. Altri cammini
6. Contatti

Il menu, il piè di pagina, gli indici di sezione e le anteprime della Home
leggono tutti `src/lib/menu.ts`: è lì che si aggiunge una voce (per esempio
quando si apriranno 5a «Scritti d'autore» e 5b «Dicono di noi»).

```
src/
├── testi/            ⟵ I TESTI DEL SITO (un file HTML per pagina)
├── lib/menu.ts       ⟵ sezioni, voci a lettera e paragrafi i., ii., …
├── pages/            ⟵ le pagine (impaginazione, non testi)
├── components/       ⟵ walking tracker, mappa GPX, menu, piè di pagina…
├── content/          ⟵ dati del walking tracker (tratte, punti, itinerari)
└── styles/global.css ⟵ colori, font e stile
public/
├── immagini/         ⟵ le foto
└── gpx/              ⟵ (da creare) la traccia GPX ufficiale
scripts/docx/         ⟵ i Word originali e lo script che li ha convertiti
```

---

## Modificare i testi

Ogni pagina ha il suo file in `src/testi/`, in HTML semplice:
`<p>` paragrafo, `<strong>` grassetto, `<em>` corsivo, `<a href="…">` link.

Convenzioni usate nei testi:

- **Segnaposto** (le parti evidenziate in giallo nei Word):
  `<mark class="segnaposto">[…]</mark>`. Compaiono evidenziati sul sito
  finché non si sostituiscono con il testo definitivo.
- **Aneddoti e leggende** (evidenziati in verde nei Word): riquadri
  `<aside class="aneddoto aneddoto--destra">` (o `--sinistra`), posti appena
  prima del paragrafo del luogo a cui si riferiscono.
- **Descrizione dettagliata**: tratte `<h3 class="tratta">`, deviazioni e
  varianti in `<div class="percorso-alt percorso-alt--deviazione">` (o
  `--variante`). I segnavia sono disegnati come icone (`<span class="segnavia">`).

I testi sono stati generati una volta dai Word con
`python3 scripts/docx/converti.py`. **Non rilanciarlo** dopo aver corretto i
file di `src/testi/`: li riscriverebbe da zero.

---

## Le lingue (italiano, inglese, francese)

L'italiano è la lingua principale (indirizzi senza prefisso); inglese e
francese stanno sotto `/en/…` e `/fr/…`, con le stesse pagine. Il selettore
a bandierine in alto porta alla stessa pagina nell'altra lingua.

- **Testi lunghi:** `src/testi/en/…` e `src/testi/fr/…`, con gli stessi nomi
  dei file italiani. Se una traduzione manca, il sito mostra l'italiano.
  Quando si modifica un testo italiano, va aggiornata anche la traduzione.
- **Titoli del menu e delle sezioni:** tabella `TITOLI` in `src/lib/menu.ts`.
- **Scritte dell'interfaccia** (bottoni, walking tracker, mappa…):
  `src/lib/i18n.ts`.
- **Dati del walking tracker:** campo `traduzioni` (`en`, `fr`) nei file JSON
  di `src/content/tappe/` e `src/content/itinerari/`.
- I link interni nei testi si scrivono sempre in versione italiana
  (`/approfondimenti/…`): il sito aggiunge da solo `/en` o `/fr`.

---

## La mappa GPX e il walking tracker

La mappa compare da sola quando si carica la traccia in
`public/gpx/antica-via-del-cifalco.gpx`. Finché il file manca, la pagina
mostra il segnaposto e la mappa provvisoria di Google My Maps.

Perché mappa e tracker siano sincronizzati, i **waypoint** della traccia GPX
devono chiamarsi come i punti in `src/content/punti/` (es. «Ponte Organasco»,
«Cerignale», «Oneto», «Barbagelata», «Neirone», «Portofino mare»…). Così,
quando nel tracker si sceglie un tratto, la mappa lo evidenzia e misura km e
dislivelli reali, che il tracker mostra accanto alle sue stime. In
alternativa ai waypoint si possono scrivere `"lat"` e `"lon"` nel file JSON
del punto.

Le tratte del tracker (`src/content/tappe/`) corrispondono alle tratte della
descrizione dettagliata: se cambiano tempi o segnavia nel testo, conviene
aggiornarle anche lì.

---

## Foto

Le foto stanno in `public/immagini/`. Per cambiarne una, si sostituisce il
file mantenendo lo stesso nome. Quelle nei testi si inseriscono così:

```html
<figure class="figura"><img src="/immagini/nome.jpg" alt="Descrizione">
<figcaption>Didascalia<br><span class="figura__credito">Foto di …</span></figcaption></figure>
```

---

## Pubblicare il sito

Il sito si pubblica su Netlify (configurazione in `netlify.toml`): a ogni
modifica caricata sul repository si ripubblica da solo. Quando il dominio
definitivo è attivo, aggiornare `site:` in `astro.config.mjs`.
