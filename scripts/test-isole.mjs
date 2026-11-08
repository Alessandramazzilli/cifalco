// Verifica funzionale del walking tracker e del suo dialogo con la mappa GPX sulla
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
let html = await readFile(path.join(dist, 'fare-il-cammino/organizzare-il-viaggio/index.html'), 'utf8');
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
  url: 'https://anticaviadelcifalco.it/fare-il-cammino/organizzare-il-viaggio',
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

// --- Tracker -> mappa GPX: il tratto scelto viene comunicato -------------
let ultimo = null;
dom.window.addEventListener('via-cifalco:itinerario', (e) => (ultimo = e.detail));
const tendina = document.querySelector('#pl-itinerario');
tendina.value = 'dal-crinale-al-mare';
tendina.dispatchEvent(new dom.window.Event('change'));
await new Promise((resolve) => dom.window.setTimeout(resolve, 20));
verifica(
  'tracker→mappa: comunica partenza e arrivo del tratto',
  ultimo && ultimo.da === 'barbagelata' && ultimo.a === 'portofino-mare'
);
verifica(
  'planner: distanza aggiornata dopo il cambio',
  document.querySelector('[data-esito="distanza"]').textContent.includes('35 km')
);

// --- Mappa GPX -> tracker: le misure reali compaiono nel tracker -----------
dom.window.dispatchEvent(
  new dom.window.CustomEvent('via-cifalco:misure', { detail: { km: 30.4, salita: 900, discesa: 2000 } })
);
const misure = document.querySelector('[data-esito="misure-gpx"]');
verifica('mappa→tracker: misure GPX mostrate', !misure.hidden && misure.textContent.includes('30,4 km'));

process.exit(errori ? 1 : 0);
