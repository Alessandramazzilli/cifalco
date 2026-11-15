/**
 * Foto dentro i testi lunghi. Ogni foto va dopo il paragrafo che inizia con
 * il testo indicato (in italiano): i testi tradotti hanno gli stessi
 * paragrafi nello stesso ordine, quindi la foto cade nello stesso punto in
 * ogni lingua. Ogni foto compare una volta sola nel sito.
 */
import { testo } from './testi';
import { type Lingua, t } from './i18n';

const FOTO_NEL_TESTO: Record<string, { dopo: string; foto: string }[]> = {
  'approfondimenti/natura-e-paesaggio': [
    { dopo: 'Attorno alle zone umide', foto: 'girini.jpg' },
    { dopo: 'In maggio, quando la parete sud', foto: 'ginestre-monte-caucaso.jpg' },
  ],
  'approfondimenti/tappe': [
    { dopo: 'Questa deviazione è un vero spettacolo', foto: 'ruscello-casanova.jpg' },
    { dopo: 'Giunti a fondovalle, si entra nella piccola', foto: 'chiesa-gattorna.jpg' },
    { dopo: 'Come spiegato nella sezione', foto: 'castello-paraggi.jpg' },
  ],
};

const paragrafi = (h: string) => [...h.matchAll(/<p[\s>][\s\S]*?<\/p>/g)];

/** Il testo di una pagina con le sue foto già inserite. */
export function testoConFoto(nome: string, lingua: Lingua): string {
  let html = testo(nome, lingua);
  const italiano = paragrafi(testo(nome, 'it'));
  for (const { dopo, foto } of FOTO_NEL_TESTO[nome] ?? []) {
    const n = italiano.findIndex((m) => m[0].replace(/<[^>]+>/g, '').startsWith(dopo));
    const bersaglio = n < 0 ? undefined : paragrafi(html)[n];
    if (!bersaglio) continue;
    const fine = bersaglio.index! + bersaglio[0].length;
    const alt = t(lingua).altFoto[foto] ?? '';
    const figura = `<figure class="figura figura--larga"><img src="/immagini/${foto}" alt="${alt}" loading="lazy" decoding="async"><figcaption>${alt}</figcaption></figure>`;
    html = html.slice(0, fine) + figura + html.slice(fine);
  }
  return html;
}
