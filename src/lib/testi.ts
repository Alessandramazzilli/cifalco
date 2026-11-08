/**
 * Accesso ai testi del sito (src/testi/**.html).
 * I testi sono HTML semplice, modificabile senza toccare il codice.
 */
import { type Lingua, localizzaHtml } from './i18n';

const file = import.meta.glob('../testi/**/*.html', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

/**
 * Il testo di una pagina, es. testo('fare-il-cammino/premessa', 'en').
 * Per inglese e francese legge src/testi/en/… e src/testi/fr/…; se la
 * traduzione manca, mostra l'italiano. I link interni prendono la lingua.
 */
export function testo(nome: string, lingua: Lingua = 'it'): string {
  const tradotto = lingua === 'it' ? undefined : file[`../testi/${lingua}/${nome}.html`];
  const h = tradotto ?? file[`../testi/${nome}.html`];
  if (h === undefined) throw new Error(`Testo mancante: src/testi/${nome}.html`);
  return localizzaHtml(h.replace(/^<!--[\s\S]*?-->\s*/, ''), lingua);
}

/** Divide un testo nei punti marcati con <!-- NOME -->. */
export function dividi(h: string, segnaposto: string): [string, string] {
  const marca = `<!-- ${segnaposto} -->`;
  const i = h.indexOf(marca);
  if (i < 0) return [h, ''];
  return [h.slice(0, i), h.slice(i + marca.length)];
}

/** I titoli <h2 id="…"> di un testo, per l'indice laterale. */
export function titoli(h: string): { id: string; titolo: string }[] {
  return [...h.matchAll(/<h2 id="([^"]+)">([\s\S]*?)<\/h2>/g)].map((m) => ({
    id: m[1],
    titolo: m[2].replace(/<[^>]+>/g, '').trim(),
  }));
}

/** Le prime righe di un testo (testo semplice), per le anteprime. */
export function anteprima(h: string, caratteri = 260): string {
  const primo = h.match(/<p[^>]*>([\s\S]*?)<\/p>/);
  const t = (primo ? primo[1] : h)
    .replace(/<[^>]+>/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  if (t.length <= caratteri) return t;
  return t.slice(0, t.lastIndexOf(' ', caratteri)).replace(/[,;:.]$/, '') + '…';
}

/** Nome del testo associato a un indirizzo di pagina. */
export function nomeTesto(href: string): string {
  return href.split('#')[0].replace(/^\/(en|fr)(?=\/)/, '').replace(/^\//, '');
}
