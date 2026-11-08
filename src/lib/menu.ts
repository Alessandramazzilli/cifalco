/**
 * La struttura del sito, secondo lo «schema base» (scripts/docx/originali/).
 * Da qui leggono: il menu in alto, il piè di pagina, gli indici di sezione,
 * la navigazione tra le pagine e le anteprime della Home.
 *
 * Per aprire una nuova voce (es. 5a «Scritti d'autore»): crea la pagina e
 * aggiungi la voce qui sotto, con la sua lettera.
 */

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
