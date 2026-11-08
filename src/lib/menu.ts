/**
 * La struttura del sito, secondo lo «schema base» (scripts/docx/originali/).
 * Da qui leggono: il menu in alto, il piè di pagina, gli indici di sezione,
 * la navigazione tra le pagine e le anteprime della Home.
 *
 * Per aprire una nuova voce (es. 5a «Scritti d'autore»): crea la pagina e
 * aggiungi la voce qui sotto, con la sua lettera.
 */

import { type Lingua, localizza, senzaLingua } from './i18n';

export interface Paragrafo {
  numero: string; // «i», «ii», …
  titolo: string;
  href: string;
}

export interface Voce {
  lettera: string; // «a», «b», …
  titolo: string;
  href: string;
  paragrafi?: Paragrafo[];
}

export interface Sezione {
  numero: number;
  titolo: string; // titolo completo, in testa alla pagina
  breve: string; // etichetta nel menu
  href: string;
  voci: Voce[];
}

export const SEZIONI: Sezione[] = [
  {
    numero: 2,
    titolo: 'Chi siamo',
    breve: 'Chi siamo',
    href: '/chi-siamo',
    voci: [
      { lettera: 'a', titolo: 'Il progetto', href: '/chi-siamo#il-progetto' },
      { lettera: 'b', titolo: 'Le persone', href: '/chi-siamo#le-persone' },
      { lettera: 'c', titolo: 'Ringraziamenti', href: '/chi-siamo#ringraziamenti' },
      { lettera: 'd', titolo: 'Menzione legale', href: '/chi-siamo#menzione-legale' },
    ],
  },
  {
    numero: 3,
    titolo: 'Fare il cammino: informazioni pratiche',
    breve: 'Fare il cammino',
    href: '/fare-il-cammino',
    voci: [
      { lettera: 'a', titolo: 'Premessa sull’itinerario proposto', href: '/fare-il-cammino/premessa' },
      { lettera: 'b', titolo: 'Come arrivare al punto di partenza', href: '/fare-il-cammino/come-arrivare' },
      { lettera: 'c', titolo: 'Rientrare', href: '/fare-il-cammino/rientrare' },
      { lettera: 'd', titolo: 'Vie di fuga', href: '/fare-il-cammino/vie-di-fuga' },
      {
        lettera: 'e',
        titolo: 'Organizzare il viaggio: tappe, deviazioni e mappe',
        href: '/fare-il-cammino/organizzare-il-viaggio',
        paragrafi: [
          { numero: 'i', titolo: 'Quanto dura la Via del Cifalco?', href: '/fare-il-cammino/organizzare-il-viaggio#quanto-dura' },
          { numero: 'ii', titolo: 'Descrizione dettagliata dell’itinerario', href: '/fare-il-cammino/organizzare-il-viaggio#descrizione-dettagliata' },
          { numero: 'iii', titolo: 'Mappa e traccia GPX', href: '/fare-il-cammino/organizzare-il-viaggio#mappa-gpx' },
        ],
      },
      {
        lettera: 'f',
        titolo: 'I punti di appoggio',
        href: '/fare-il-cammino/punti-di-appoggio',
        paragrafi: [
          { numero: 'i', titolo: 'Alberghi e altre strutture attrezzate per pernottamenti', href: '/fare-il-cammino/punti-di-appoggio#alberghi' },
          { numero: 'ii', titolo: 'Rifugi non attrezzati', href: '/fare-il-cammino/punti-di-appoggio#rifugi' },
        ],
      },
      { lettera: 'g', titolo: 'Avvertenze', href: '/fare-il-cammino/avvertenze' },
    ],
  },
  {
    numero: 4,
    titolo: 'Approfondimenti',
    breve: 'Approfondimenti',
    href: '/approfondimenti',
    voci: [
      { lettera: 'a', titolo: 'Le incerte origini dell’Antica Via del Cifalco', href: '/approfondimenti/origini' },
      { lettera: 'b', titolo: 'Cenni storici sul territorio', href: '/approfondimenti/cenni-storici' },
      { lettera: 'c', titolo: 'La civiltà rurale sulle Vie del Sale', href: '/approfondimenti/civilta-rurale' },
      {
        lettera: 'd',
        titolo: 'Natura e paesaggio, dai monti al mare',
        href: '/approfondimenti/natura-e-paesaggio',
        paragrafi: [
          { numero: 'i', titolo: 'L’Appennino “continentale”', href: '/approfondimenti/natura-e-paesaggio#appennino-continentale' },
          { numero: 'ii', titolo: 'L’Appennino “marittimo”', href: '/approfondimenti/natura-e-paesaggio#appennino-marittimo' },
        ],
      },
      {
        lettera: 'e',
        titolo: 'Le tappe della Via del Cifalco tra storia, natura e cultura',
        href: '/approfondimenti/tappe',
        paragrafi: [
          { numero: 'i', titolo: 'L’Appennino “continentale”', href: '/approfondimenti/tappe#appennino-continentale' },
          { numero: 'ii', titolo: 'L’Appennino “marittimo”', href: '/approfondimenti/tappe#appennino-marittimo' },
          { numero: 'iii', titolo: 'Il Parco del M. di Portofino: l’arrivo a Portofino mare e la fine della Via del Cifalco', href: '/approfondimenti/tappe#parco-portofino' },
        ],
      },
      { lettera: 'f', titolo: 'Riferimenti bibliografici', href: '/approfondimenti/bibliografia' },
    ],
  },
  {
    numero: 5,
    titolo: 'Intorno all’Antica Via del Cifalco (e oltre)',
    breve: 'Intorno alla Via (e oltre)',
    href: '/intorno',
    // 5a «Scritti d'autore» e 5b «Dicono di noi» verranno aperte con i
    // primi contributi: per ora non compaiono.
    voci: [{ lettera: 'c', titolo: 'Altri cammini', href: '/intorno/altri-cammini' }],
  },
  {
    numero: 6,
    titolo: 'Contatti',
    breve: 'Contatti',
    href: '/contatti',
    voci: [],
  },
];

export const EMAIL = 'info@anticaviadelcifalco.eu';

/** Sezione e voce corrispondenti a un indirizzo (senza #). */
export function trova(percorso: string): { sezione?: Sezione; voce?: Voce } {
  const p = percorso.replace(/\/$/, '') || '/';
  for (const sezione of SEZIONI) {
    for (const voce of sezione.voci) {
      if (voce.href.split('#')[0] === p && !voce.href.includes('#')) return { sezione, voce };
    }
    if (sezione.href === p || p.startsWith(sezione.href + '/')) return { sezione };
  }
  return {};
}

// ---------------------------------------------------------------------------
// Traduzioni dei titoli (chiave: titolo italiano)
// ---------------------------------------------------------------------------
const TITOLI: Record<string, { en: string; fr: string }> = {
  'Chi siamo': { en: 'About us', fr: 'Qui sommes-nous' },
  'Il progetto': { en: 'The project', fr: 'Le projet' },
  'Le persone': { en: 'The people', fr: 'Les personnes' },
  Ringraziamenti: { en: 'Acknowledgements', fr: 'Remerciements' },
  'Menzione legale': { en: 'Legal notice', fr: 'Mentions légales' },
  'Fare il cammino: informazioni pratiche': { en: 'Walking the trail: practical information', fr: 'Faire le chemin : informations pratiques' },
  'Fare il cammino': { en: 'Walking the trail', fr: 'Faire le chemin' },
  'Premessa sull’itinerario proposto': { en: 'About the proposed route', fr: 'Préambule sur l’itinéraire proposé' },
  'Come arrivare al punto di partenza': { en: 'Getting to the starting point', fr: 'Comment rejoindre le point de départ' },
  Rientrare: { en: 'Getting back', fr: 'Le retour' },
  'Vie di fuga': { en: 'Escape routes', fr: 'Échappatoires' },
  'Organizzare il viaggio: tappe, deviazioni e mappe': { en: 'Planning the journey: stages, detours and maps', fr: 'Organiser le voyage : étapes, détours et cartes' },
  'Quanto dura la Via del Cifalco?': { en: 'How long does the Via del Cifalco take?', fr: 'Combien de temps dure la Via del Cifalco ?' },
  'Descrizione dettagliata dell’itinerario': { en: 'Detailed route description', fr: 'Description détaillée de l’itinéraire' },
  'Mappa e traccia GPX': { en: 'Map and GPX track', fr: 'Carte et trace GPX' },
  'I punti di appoggio': { en: 'Places to stay', fr: 'Les points d’appui' },
  'Alberghi e altre strutture attrezzate per pernottamenti': { en: 'Hotels and other equipped accommodation', fr: 'Hôtels et autres hébergements équipés' },
  'Rifugi non attrezzati': { en: 'Unstaffed shelters', fr: 'Refuges non gardés' },
  Avvertenze: { en: 'Warnings', fr: 'Avertissements' },
  Approfondimenti: { en: 'In depth', fr: 'Approfondissements' },
  'Le incerte origini dell’Antica Via del Cifalco': { en: 'The uncertain origins of the Antica Via del Cifalco', fr: 'Les origines incertaines de l’Antica Via del Cifalco' },
  'Cenni storici sul territorio': { en: 'Historical notes on the territory', fr: 'Aperçu historique du territoire' },
  'La civiltà rurale sulle Vie del Sale': { en: 'Rural civilisation on the Salt Roads', fr: 'La civilisation rurale sur les Routes du Sel' },
  'Natura e paesaggio, dai monti al mare': { en: 'Nature and landscape, from the mountains to the sea', fr: 'Nature et paysage, des monts à la mer' },
  'L’Appennino “continentale”': { en: 'The “continental” Apennines', fr: 'L’Apennin « continental »' },
  'L’Appennino “marittimo”': { en: 'The “maritime” Apennines', fr: 'L’Apennin « maritime »' },
  'Le tappe della Via del Cifalco tra storia, natura e cultura': { en: 'The stages of the Via del Cifalco through history, nature and culture', fr: 'Les étapes de la Via del Cifalco entre histoire, nature et culture' },
  'Il Parco del M. di Portofino: l’arrivo a Portofino mare e la fine della Via del Cifalco': { en: 'The Monte di Portofino Park: arriving at Portofino Mare and the end of the Via del Cifalco', fr: 'Le Parc du Monte di Portofino : l’arrivée à Portofino Mare et la fin de la Via del Cifalco' },
  'Riferimenti bibliografici': { en: 'Bibliography', fr: 'Bibliographie' },
  'Intorno all’Antica Via del Cifalco (e oltre)': { en: 'Around the Antica Via del Cifalco (and beyond)', fr: 'Autour de l’Antica Via del Cifalco (et au-delà)' },
  'Intorno alla Via (e oltre)': { en: 'Around the Via (and beyond)', fr: 'Autour de la Via (et au-delà)' },
  'Altri cammini': { en: 'Other walks', fr: 'Autres chemins' },
  Contatti: { en: 'Contact', fr: 'Contact' },
};

export function traduciTitolo(titolo: string, lingua: Lingua): string {
  if (lingua === 'it') return titolo;
  return TITOLI[titolo]?.[lingua] ?? titolo;
}

/** Le sezioni con titoli e indirizzi nella lingua indicata. */
export function sezioni(lingua: Lingua): Sezione[] {
  const tr = (s: string) => traduciTitolo(s, lingua);
  return SEZIONI.map((s) => ({
    ...s,
    titolo: tr(s.titolo),
    breve: tr(s.breve),
    href: localizza(s.href, lingua),
    voci: s.voci.map((v) => ({
      ...v,
      titolo: tr(v.titolo),
      href: localizza(v.href, lingua),
      paragrafi: v.paragrafi?.map((p) => ({ ...p, titolo: tr(p.titolo), href: localizza(p.href, lingua) })),
    })),
  }));
}

/** Come trova(), ma con titoli e indirizzi nella lingua dell'indirizzo. */
export function trovaLocalizzato(percorso: string, lingua: Lingua): { sezione?: Sezione; voce?: Voce } {
  const { sezione, voce } = trova(senzaLingua(percorso));
  if (!sezione) return {};
  const i = SEZIONI.indexOf(sezione);
  const s = sezioni(lingua)[i];
  return { sezione: s, voce: voce ? s.voci[sezione.voci.indexOf(voce)] : undefined };
}

/** Le pagine «semplici» delle voci a lettera (sezioni 3, 4, 5). */
export function pagineVoci(): { sezione: string; voce: string; nome: string }[] {
  return SEZIONI.filter((s) => ['/fare-il-cammino', '/approfondimenti', '/intorno'].includes(s.href))
    .flatMap((s) => s.voci)
    .filter((v) => !v.href.endsWith('/organizzare-il-viaggio'))
    .map((v) => {
      const [, sezione, voce] = v.href.split('/');
      return { sezione, voce, nome: `${sezione}/${voce}` };
    });
}
