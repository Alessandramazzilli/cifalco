// Verifica della pagina «Organizzare il viaggio» costruita (dopo `npm run build`):
// la mappa GPX c'è, i file da scaricare esistono e contengono le tracce attese.
// Uso: node scripts/test-isole.mjs
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
let errori = 0;
const verifica = (nome, condizione) => {
  console.log(`${condizione ? 'OK ' : 'FAIL'} ${nome}`);
  if (!condizione) errori++;
};

for (const lingua of ['', 'en/', 'fr/']) {
  const html = await readFile(path.join(dist, lingua, 'fare-il-cammino/organizzare-il-viaggio/index.html'), 'utf8');
  const l = lingua || 'it/';
  verifica(`${l} mappa presente`, html.includes('class="mappa-gpx"') && html.includes('data-profilo'));
  verifica(`${l} nessun walking tracker`, !html.includes('planner') && !/walking tracker/i.test(html));
  for (const file of [
    '/gpx/antica-via-del-cifalco.gpx',
    '/gpx/antica-via-del-cifalco-percorso-principale.gpx',
    '/gpx/antica-via-del-cifalco-tracce-separate.zip',
  ])
    verifica(`${l} link a ${file}`, html.includes(`href="${file}"`));
}

const completo = await readFile(path.join(dist, 'gpx/antica-via-del-cifalco.gpx'), 'utf8');
verifica('GPX completo: 1 percorso principale + 24 deviazioni', (completo.match(/<trk>/g) || []).length === 25);
verifica('GPX completo: luoghi (waypoint)', (completo.match(/<wpt /g) || []).length >= 20);
const principale = await readFile(path.join(dist, 'gpx/antica-via-del-cifalco-percorso-principale.gpx'), 'utf8');
verifica('GPX principale: una sola traccia', (principale.match(/<trk>/g) || []).length === 1);
verifica('ZIP delle tracce separate presente', (await stat(path.join(dist, 'gpx/antica-via-del-cifalco-tracce-separate.zip'))).size > 50000);

process.exit(errori ? 1 : 0);
