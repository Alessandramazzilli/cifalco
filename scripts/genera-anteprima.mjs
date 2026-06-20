// Genera un'anteprima autosufficiente del sito: un file HTML per pagina,
// con CSS, font latini, script e favicon incorporati, e i collegamenti
// interni riscritti tra i file. Si apre direttamente nel browser, anche
// senza server. Uso: node scripts/genera-anteprima.mjs (dopo la build)
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const dist = path.resolve('dist');
const destinazione = path.resolve('anteprima');
await mkdir(destinazione, { recursive: true });

const rotte = {
  '/': 'home.html',
  '/progetto': 'progetto.html',
  '/itinerario': 'itinerario.html',
  '/itinerario/descrizione-dettagliata': 'descrizione-dettagliata.html',
  '/itinerario/informazioni-pratiche': 'informazioni-pratiche.html',
  '/approfondimenti': 'approfondimenti.html',
  '/contatti': 'contatti.html',
};

const favicon = await readFile('public/favicon.svg', 'utf8');
const faviconDataUri = `data:image/svg+xml;base64,${Buffer.from(favicon).toString('base64')}`;

async function inlineCss(href) {
  let css = await readFile(path.join(dist, href), 'utf8');
  // Incorpora solo i font del sottoinsieme latino (basta per l'italiano);
  // gli altri sottoinsiemi non vengono mai usati grazie a unicode-range.
  const urlFont = [...css.matchAll(/url\((\/_astro\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
  for (const url of new Set(urlFont)) {
    if (/-latin-(?:wght|400)/.test(url)) {
      const font = await readFile(path.join(dist, url));
      css = css.replaceAll(
        `url(${url})`,
        `url(data:font/woff2;base64,${font.toString('base64')})`
      );
    }
  }
  return css;
}

for (const [rotta, nomeFile] of Object.entries(rotte)) {
  const sorgente =
    rotta === '/' ? 'index.html' : path.join(rotta.slice(1), 'index.html');
  let html = await readFile(path.join(dist, sorgente), 'utf8');

  // Fogli di stile esterni → <style> incorporato.
  for (const m of [...html.matchAll(/<link rel="stylesheet" href="(\/_astro\/[^"]+\.css)"\s*\/?>/g)]) {
    html = html.replace(m[0], `<style>${await inlineCss(m[1])}</style>`);
  }

  // Script esterni → incorporati.
  for (const m of [...html.matchAll(/<script type="module" src="(\/_astro\/[^"]+\.js)"><\/script>/g)]) {
    const js = await readFile(path.join(dist, m[1]), 'utf8');
    html = html.replace(m[0], `<script type="module">${js}</script>`);
  }

  // Favicon e sitemap.
  html = html
    .replace(/<link rel="icon"[^>]*>/, `<link rel="icon" type="image/svg+xml" href="${faviconDataUri}">`)
    .replace(/<link rel="sitemap"[^>]*>/, '');

  // Immagini /immagini/*.jpg → data URI, così l'anteprima è autosufficiente.
  for (const file of new Set(
    [...html.matchAll(/\/immagini\/([A-Za-z0-9._-]+)/g)].map((m) => m[1])
  )) {
    const buf = await readFile(path.join(dist, 'immagini', file));
    const dataUri = `data:image/jpeg;base64,${buf.toString('base64')}`;
    html = html.split(`/immagini/${file}`).join(dataUri);
  }

  // Collegamenti interni → file locali (conservando le àncore #...).
  html = html.replace(/href="(\/[^"#]*)(#[^"]*)?"/g, (tutto, percorso, ancora = '') => {
    const file = rotte[percorso.replace(/\/$/, '') || '/'];
    return file ? `href="${file}${ancora}"` : tutto;
  });

  await writeFile(path.join(destinazione, nomeFile), html);
  console.log(`✓ ${nomeFile}`);
}

console.log(`\nAnteprima generata in ${destinazione}/ — apri home.html`);
// Nota: le rotte di solo reindirizzamento (es. /percorso) non sono incluse.
