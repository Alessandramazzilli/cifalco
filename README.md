# L'Antica Via del Cifalco — sito web

Il sito del cammino: informa chi è sul sentiero, promuove il territorio e
racconta la storia della Via con approccio critico.

Costruito con [Astro](https://astro.build): pagine statiche velocissime, con
due sole «isole» interattive (la mappa illustrata e il walk planner).
**Tutti i contenuti sono separati dal codice**: per aggiornare il sito non
serve essere programmatori, basta modificare file di testo. Questa guida
spiega come.

> **Nota:** tutti i contenuti attuali (nomi dei luoghi, distanze, recapiti,
> citazioni) sono **segnaposto** in attesa dei dati reali. Sono scritti nel
> tono giusto, ma vanno sostituiti.

---

## Come avviare il sito sul proprio computer

Serve [Node.js](https://nodejs.org) (versione 20 o successiva). Poi, nella
cartella del progetto:

```bash
npm install        # solo la prima volta
npm run dev        # apre il sito su http://localhost:4321
```

Ogni modifica ai file si vede subito nel browser. Per produrre la versione
da pubblicare:

```bash
npm run build      # crea la cartella dist/ pronta da pubblicare
```

---

## Dove vive ogni cosa

```
src/
├── content/             ⟵ TUTTI I CONTENUTI (è qui che si lavora di solito)
│   ├── itinerari/       ⟵ un file JSON per itinerario
│   ├── tappe/           ⟵ un file JSON per tratta (passi e deviazioni comprese)
│   └── punti/           ⟵ un file JSON per punto d'interesse
├── pages/               ⟵ le pagine del sito (testi delle pagine fisse)
├── components/          ⟵ i blocchi riusabili (mappa, planner, foto, note…)
├── lib/percorso.ts      ⟵ il codice che legge i contenuti
└── styles/global.css    ⟵ colori, font e stile di tutto il sito

public/
└── immagini/            ⟵ le foto del sito (vedi «Sostituire una foto»)
```

---

## Le operazioni più comuni

### Modificare un testo

I testi delle pagine fisse (Home, Il progetto, L'itinerario, Approfondimenti,
Chi siamo…) sono nei file di `src/pages/`: si aprono con qualunque editor di
testo, il testo è leggibile tra i tag HTML.

### Aggiungere un punto d'interesse

1. Copia un file esistente in `src/content/punti/`, ad esempio
   `rifugio-casermetta.json`, e rinominalo (minuscole e trattini: il nome del
   file diventa l'identificativo del punto).
2. Compila i campi:
   - `nome`, `descrizione`, `quota` (metri, facoltativa);
   - `tipo`: uno tra `borgo`, `fonte`, `valico`, `natura`, `storia`, `ristoro`;
   - `acquaPotabile`: `true` solo se c'è acqua potabile;
   - `x` e `y`: la posizione sulla mappa illustrata (vedi sotto).
3. Se il punto è lungo una tappa, aggiungi il suo nome-file nell'elenco
   `punti` della tappa in `src/content/tappe/`: comparirà nel tracciato e
   nel planner.

**Le coordinate `x` e `y`** sono sulla griglia della mappa: `x` da 0 (sinistra)
a 1000 (destra), `y` da 0 (alto) a 700 (basso). Si va a occhio e si controlla
con `npm run dev`: due o tre tentativi e il punto è al suo posto.

### Aggiungere o modificare un itinerario

1. Le tratte sono in `src/content/tappe/`: ogni tratta ha distanza,
   dislivelli, ore di cammino, il `segnavia`, l'elenco dei `punti`
   attraversati **in ordine**, i `passi` (le indicazioni che il planner
   mostra una alla volta) e le `deviazioni` (mostrate nella descrizione
   dettagliata).
2. Gli itinerari sono in `src/content/itinerari/`: un itinerario è soprattutto
   un elenco di tappe in ordine, più difficoltà, segnavia e descrizione.
3. Mappa e planner si aggiornano da soli: leggono questi file.

### Aggiungere o modificare un membro della Compagnia del Cifalco

Le persone della Compagnia stanno nella pagina `src/pages/progetto.astro`,
nell'elenco `compagnia` in cima al file: ogni voce ha `nome`, `ruolo` (la
descrizione, anche simpatica) e `foto` (il nome del file della foto).

Per la **foto vera**: metti un'immagine quadrata in `public/immagini/` con il
nome indicato in `foto` (es. `compagnia-luchino-ferraris.jpg`) e, in
`progetto.astro`, sostituisci `<PersonaPlaceholder nomeFile={persona.foto} />`
con:

```html
<img class="ritratto" src={`/immagini/${persona.foto}`} alt={persona.nome} />
```

### Sostituire o aggiungere una foto

Le foto stanno in `public/immagini/` e vengono mostrate **sempre intere**
(mai tagliate). Per cambiarne una, sostituisci il file mantenendo lo stesso
nome: comparirà subito al posto della vecchia. Le foto attualmente usate sono:

| Pagina | File | Dove |
| --- | --- | --- |
| Home | `home-banner-valle-del-cifalco.jpg` | accanto al titolo |
| Home | `costa-tigullio.jpg` | banda «dal crinale al mare» |
| Il progetto | `muro-ruota-carro.jpg` | accanto all'introduzione |
| L'itinerario | `vetta-rocca-bruna.jpg` | sotto i numeri della Via |
| L'itinerario | `sentiero-pozza.jpg` | tra le sezioni |
| Informazioni pratiche | `portofino-baia.jpg` | «arrivare e tornare» |
| Informazioni pratiche | `rifugio-terrazza-mare.jpg` | «punti di appoggio» |
| Approfondimenti | `rocca-bosco.jpg` | sotto il titolo |
| Chi siamo | `faggeta.jpg` | accanto al titolo |

Per **aggiungere** una foto in una pagina, metti il file in
`public/immagini/` e usa il componente `Foto` (mostra l'immagine intera):

```html
<Foto src="/immagini/nome-file.jpg" alt="Descrizione della foto" />
```

Per metterla **accanto a un testo** (due colonne), usala dentro un blocco
`duo`:

```html
<div class="contenitore duo">
  <div> …testo… </div>
  <Foto classe="duo__foto" src="/immagini/nome-file.jpg" alt="…" />
</div>
```

Conviene ridimensionare le foto prima di caricarle (lato lungo circa 2000 px):
mantiene il sito veloce anche con segnale debole.

### Aggiornare la mappa della pagina «L’itinerario»

La mappa nella pagina `/itinerario` è l'incorporamento (iframe) di una mappa
di Google My Maps, con il tracciato GPS reale della Via. Per aggiornarla
(nuova versione del tracciato, nuovi punti, ecc.):

1. Modifica la mappa su [Google My Maps](https://www.google.com/maps/d).
2. Da «Condividi» → «Incorpora nella mia pagina web», copia il nuovo `mid`
   (l'identificativo nell'URL, es. `mid=1pZkHOxW...`).
3. In `src/pages/itinerario/index.astro`, sostituisci quel `mid` sia nell'
   `src` dell'`<iframe>` sia nel link «Apri la mappa su Google Maps».

---

## Pubblicare il sito

Il sito è statico: si pubblica gratuitamente su Netlify, Vercel o GitHub
Pages. La via più semplice (Netlify):

1. Crea un account su [netlify.com](https://www.netlify.com) e collega questo
   repository.
2. Impostazioni di build: comando `npm run build`, cartella `dist`.
3. A ogni modifica caricata sul repository, il sito si ripubblica da solo.

Quando il dominio definitivo è attivo, aggiorna l'indirizzo in
`astro.config.mjs` (riga `site:`): serve per la sitemap e le anteprime
social.

---

## Scelte di design (per chi metterà mano allo stile)

- **Palette** in `src/styles/global.css`, tutta a variabili CSS: verde dei
  faggi, grigio delle rocce, accento acquatico e marrone della terra. Gli
  sfondi sono verdi/grigi/acqua (niente fondo «crema»): le sezioni a tinta
  piena si ottengono con le classi `sezione--bosco`, `sezione--acqua` e
  `sezione--pietra`.
- **Font**: Source Serif 4 per i titoli, Source Sans 3 per il corpo.
  Self-hosted, niente richieste a server esterni.
- **Walk planner**: il bottone «Scarica il piano» genera un file di testo con
  l'intero piano (numeri, segnavia, acqua, cosa portare e tutte le tappe in
  sequenza), utile da consultare sul sentiero anche senza campo.
- **Tono dell'interfaccia**: il quaderno vive nella struttura (note a
  margine, sezioni come pagine), mai in texture finte. Niente effetto
  «medioevo da fiera».
