// Verifica funzionale delle isole interattive (planner + mappa) sulla
// pagina costruita, eseguendo davvero gli script in jsdom.
// Uso: node scripts/test-isole.mjs   (dopo `npm run build`)
import jsdom from 'jsdom';
const { JSDOM, VirtualConsole } = jsdom;
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');

// jsdom non esegue gli script `type="module"`: li convertiamo in script
// classici in fondo al body (equivalente al comportamento deferred),
// inglobando quelli esterni /_astro/*.js.
let html = await readFile(path.join(dist, 'itinerario/index.html'), 'utf8');
const codici = [];
for (const m of html.matchAll(
  /<script type="module"(?: src="(\/_astro\/[^"]+)")?>([\s\S]*?)<\/script>/g
)) {
  codici.push(m[1] ? await readFile(path.join(dist, m[1]), 'utf8') : m[2]);
  html = html.replace(m[0], '');
}
html = html.replace(
  '</body>',
  codici.map((js) => `<script>${js}</script>`).join('') + '</body>'
);

const virtualConsole = new VirtualConsole();
virtualConsole.on('jsdomError', (e) => console.error('ERRORE PAGINA:', e.message));

const dom = new JSDOM(html, {
  url: 'https://anticaviadelcifalco.it/itinerario',
  runScripts: 'dangerously',
  pretendToBeVisual: true,
  virtualConsole,
});

await new Promise((resolve) => dom.window.addEventListener('load', resolve));
await new Promise((resolve) => dom.window.setTimeout(resolve, 50));

const { document } = dom.window;
let errori = 0;
const verifica = (nome, condizione) => {
  console.log(`${condizione ? 'OK ' : 'FAIL'} ${nome}`);
  if (!condizione) errori++;
};

// --- Planner -----------------------------------------------------------
const partenza = document.querySelector('#pl-partenza');
verifica('planner: tendina partenza popolata', partenza.options.length === 8);
verifica(
  'planner: distanza calcolata',
  document.querySelector('[data-esito="distanza"]').textContent.includes('69 km')
);
verifica(
  'planner: tempo stimato presente',
  /h/.test(document.querySelector('[data-esito="tempo"]').textContent)
);
verifica(
  'planner: piano in 5 giornate (via intera, 6 h/giorno)',
  document.querySelectorAll('.planner__giornate li').length === 5
);
verifica(
  'planner: stepper al passo 1',
  document.querySelector('[data-esito="passo-contatore"]').textContent.startsWith('Passo 1 di')
);

// Scorri tutti gli step e verifica che almeno uno segnali acqua e uno un appoggio.
{
  let acqua = false;
  let appoggio = false;
  const tot = Number(
    document.querySelector('[data-esito="passo-contatore"]').textContent.match(/di (\d+)/)[1]
  );
  for (let i = 0; i < tot; i++) {
    if (document.querySelector('.planner__servizio--acqua')) acqua = true;
    if (document.querySelector('.planner__servizio--appoggio')) appoggio = true;
    document.querySelector('[data-azione="avanti"]').click();
  }
  verifica('planner: almeno uno step segnala acqua', acqua);
  verifica('planner: almeno uno step segnala un punto d’appoggio', appoggio);
}
// Torna all'inizio per i test successivi.
document.querySelector('#pl-itinerario').dispatchEvent(new dom.window.Event('change'));

// Avanza di un passo.
document.querySelector('[data-azione="avanti"]').click();
verifica(
  'planner: «avanti» fa avanzare il passo',
  document.querySelector('[data-esito="passo-contatore"]').textContent.startsWith('Passo 2 di')
);

// --- Mappa: evidenziazione iniziale dal planner -------------------------
const mappa = document.querySelector('.mappa');
verifica('mappa: itinerario del planner evidenziato', mappa.classList.contains('mappa--filtrata'));
verifica(
  'mappa: otto tracciati attivi (via intera)',
  mappa.querySelectorAll('.mappa__tappa.attiva').length === 8
);

// --- Mappa: scheda punto -------------------------------------------------
document.querySelector('[data-punto="rifugio-casermetta"]').click();
const scheda = document.querySelector('.mappa__scheda-contenuto');
verifica('mappa: la scheda del punto si apre', !scheda.hidden);
verifica(
  'mappa: nome del punto nella scheda',
  scheda.querySelector('[data-campo="nome"]').textContent === 'Rifugio Casermetta'
);
verifica(
  'mappa: badge acqua potabile visibile',
  !scheda.querySelector('[data-campo="acqua"]').hidden
);

// --- Planner → mappa: cambio itinerario ---------------------------------
const tendina = document.querySelector('#pl-itinerario');
tendina.value = 'dal-crinale-al-mare';
tendina.dispatchEvent(new dom.window.Event('change'));
await new Promise((resolve) => dom.window.setTimeout(resolve, 20));
verifica(
  'planner→mappa: «Dal crinale al mare» evidenziato dopo il cambio',
  [...mappa.querySelectorAll('.mappa__tappa.attiva')].map((p) => p.dataset.tappa).join() === 'tratta-6-barbagelata-neirone,tratta-7-neirone-casetti,tratta-8-casetti-portofino'
);
verifica(
  'planner: distanza aggiornata dopo il cambio',
  document.querySelector('[data-esito="distanza"]').textContent.includes('35 km')
);

process.exit(errori ? 1 : 0);
