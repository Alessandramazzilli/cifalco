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
`npm test` costruisce il sito e verifica mappa e file GPX.

---

## La struttura del sito

Segue lo «schema base» di Luchino (`scripts/docx/originali/`):

1. Home
2. Chi siamo (una pagina per voce, con ingresso a riquadri)
3. Fare il cammino: informazioni pratiche (a–g, una pagina per voce)
4. Approfondimenti (a–f, una pagina per voce)
5. Intorno alla Via del Cifalco (e oltre): Scritti d'autore (una pagina per
   contributo) e Altri cammini; «Dicono di noi» si aprirà più avanti
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

**Nuovo contributo in «Scritti d'autore»:** metti il Word in
`scripts/docx/originali/scritti/`, aggiungilo all'elenco in
`scripts/docx/interviste.py` e lancia lo script; poi aggiungi il contributo
ai `paragrafi` della voce «Scritti d'autore» in `src/lib/menu.ts` (titolo,
autore, indirizzo) e le traduzioni in `src/testi/en/` e `src/testi/fr/`.

**Foto:** ogni foto compare una sola volta nel sito. Le foto d'apertura delle
pagine sono nel campo `foto` di `src/lib/menu.ts`; quelle dentro i testi
lunghi sono in `src/viste/Voce.astro` (elenco `FOTO_NEL_TESTO`).

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
- **Scritte dell'interfaccia** (bottoni, mappa, PDF…):
  `src/lib/i18n.ts`.
- I link interni nei testi si scrivono sempre in versione italiana
  (`/approfondimenti/…`): il sito aggiunge da solo `/en` o `/fr`.

---

## La mappa GPX

Le tracce del cartografo (percorso principale + una traccia per deviazione)
stanno in `scripts/gpx/originali/`. Lo script

```bash
python3 scripts/gpx/prepara.py
```

prepara i file scaricabili in `public/gpx/`: uno con tutto (percorso
principale, deviazioni e luoghi), uno con il solo percorso principale e uno
ZIP con un file per ogni traccia (per le app, come Komoot o Wikiloc, che
importano solo la prima traccia di un file). Scrive anche le coordinate dei
luoghi in `src/content/punti/`.

Sulla pagina «Organizzare il viaggio» la mappa mostra percorso principale e
deviazioni; il profilo altimetrico è interattivo (passando sul profilo, un
segnaposto si muove sulla mappa).

Se il cartografo aggiorna le tracce: si sostituiscono i file in
`scripts/gpx/originali/` e si rilancia lo script.

## I PDF scaricabili

«Scarica il PDF» (descrizione dettagliata e approfondimenti) apre una pagina
di stampa (`src/pages/stampa/`) con lo stesso testo, la stessa grafica e le
stesse foto del sito, e avvia la stampa: si sceglie «Salva come PDF». I PDF
sono quindi sempre aggiornati con i testi del sito.

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
