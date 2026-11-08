/**
 * Lingue del sito: italiano (lingua principale, indirizzi senza prefisso),
 * inglese (/en/…) e francese (/fr/…).
 *
 * - I testi lunghi stanno in src/testi/ (italiano), src/testi/en/, src/testi/fr/.
 * - Le scritte dell'interfaccia (menu, bottoni, walking tracker…) stanno qui.
 */

export const LINGUE = ['it', 'en', 'fr'] as const;
export type Lingua = (typeof LINGUE)[number];
export const LINGUE_TRADOTTE = ['en', 'fr'] as const;

export const NOMI_LINGUA: Record<Lingua, string> = {
  it: 'Italiano',
  en: 'English',
  fr: 'Français',
};

export const LOCALE: Record<Lingua, string> = { it: 'it-IT', en: 'en-GB', fr: 'fr-FR' };

/** Lingua di un indirizzo: /en/… → en, /fr/… → fr, altrimenti it. */
export function linguaDa(percorso: string): Lingua {
  const m = percorso.match(/^\/(en|fr)(?:\/|$)/);
  return (m ? m[1] : 'it') as Lingua;
}

/** Indirizzo senza prefisso di lingua. */
export function senzaLingua(percorso: string): string {
  return percorso.replace(/^\/(en|fr)(?=\/|$)/, '') || '/';
}

/** Indirizzo nella lingua indicata (solo link interni). */
export function localizza(href: string, lingua: Lingua): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  if (/^\/(immagini|gpx|_astro|favicon)/.test(href)) return href;
  const base = senzaLingua(href);
  if (lingua === 'it') return base;
  if (base === '/') return `/${lingua}`;
  if (base.startsWith('/#')) return `/${lingua}${base.slice(1)}`;
  return `/${lingua}${base}`;
}

/** Rende «di lingua» tutti i link interni di un frammento HTML. */
export function localizzaHtml(html: string, lingua: Lingua): string {
  if (lingua === 'it') return html;
  return html.replace(/href="(\/[^"]*)"/g, (_, h) => `href="${localizza(h, lingua)}"`);
}

/** Sostituisce {nome} con i valori indicati. */
export function fmt(s: string, valori: Record<string, string | number>): string {
  return s.replace(/\{(\w+)\}/g, (_, k) => String(valori[k] ?? `{${k}}`));
}

const it = {
  home: 'Home',
  menu: 'Menu',
  navPrincipale: 'Navigazione principale',
  lingua: 'Lingua',
  saltaContenuto: 'Salta al contenuto',
  nomeSito: 'L’Antica Via del Cifalco',
  seiQui: 'Sei qui',
  indice: 'Indice',
  indiceSezione: 'Indice della sezione',
  precedente: '← Precedente',
  successiva: 'Successiva →',
  altreVoci: 'Altre voci della sezione',
  piePagina: 'Collegamenti del piè di pagina',
  menzioneLegale: 'Menzione legale',
  homeDescrizione:
    'L’Antica Via del Cifalco: una mulattiera medievale riscoperta, da Ponte Organasco a Portofino Mare in circa 75 chilometri lungo il crinale tra Trebbia e Aveto.',
  homeOcchiello: 'Da Ponte Organasco a Portofino Mare',
  citazioni: 'Citazioni',
  inBreve: 'L’Antica Via del Cifalco in breve',
  novita: 'Novità',
  scopri: 'Scopri il sito',
  altBanner: 'La valle del Cifalco vista dall’alto, con un borgo tra i boschi',
  chiSiamo: 'Chi siamo',
  chiSiamoDescrizione:
    'Il progetto dell’Antica Via del Cifalco, le persone che lo animano, i ringraziamenti e la menzione legale.',
  altFaggeta: 'Una faggeta lungo il crinale della Via',
  contatti: 'Contatti',
  contattiDescrizione: 'Per scrivere all’Antica Via del Cifalco: {email}.',
  contattiTesto:
    'Per informazioni sul cammino, segnalazioni dal sentiero, proposte di collaborazione o per entrare a far parte della <a href="{link}">Compagnia del Cifalco</a>, scriveteci:',
  altSezione: {
    '/fare-il-cammino': 'La croce di vetta sul Monte Roccabruna, lungo il crinale della Via',
    '/approfondimenti': 'Rocce e bosco lungo il crinale tra Trebbia e Aveto',
    '/intorno': 'Un sentiero accanto a una pozza d’acqua',
  } as Record<string, string>,
  // Mappa GPX
  mappa: {
    regione: 'Mappa della traccia GPX dell’Antica Via del Cifalco',
    scegli: 'Scegli un tratto nel <a href="#quanto-dura">walking tracker</a>: la mappa lo evidenzia.',
    scarica: 'Scarica la traccia GPX',
    provvisoriaTitolo: 'Mappa provvisoria della Via del Cifalco',
    provvisoria:
      'Mappa provvisoria, in attesa della traccia GPX ufficiale. Il tracciato si può aprire anche su <a href="{google}" target="_blank" rel="noopener">Google Maps</a> e <a href="{oa}" target="_blank" rel="noopener">Outdooractive</a>.',
    topografica: 'Topografica',
    stradale: 'Stradale',
    mancano: 'Per evidenziare il tratto scelto, la traccia GPX deve contenere un punto chiamato: {nomi}.',
    evidenza: 'In evidenza: da {da} a {a}, {km} km sulla traccia.',
  },
  // Walking tracker
  planner: {
    aria: 'Pianifica la tua camminata',
    titolo: 'Costruisci il tuo piano',
    sottotitolo: 'Cinque scelte, nessun calcolo da fare: al resto pensiamo noi.',
    itinerario: 'Itinerario',
    partiDa: 'Parti da',
    arriviA: 'Arrivi a',
    senso: 'Senso di percorrenza',
    classico: 'Classico (verso Portofino)',
    inverso: 'Inverso',
    passo: 'Il tuo passo',
    passoLento: 'Tranquillo, prime uscite, famiglie',
    passoMedio: 'Medio, cammino abitualmente',
    passoVeloce: 'Allenato, montagna frequente',
    ore: 'Ore di cammino al giorno',
    fino: 'Fino a {n} ore',
    piano: 'Il tuo piano',
    scarica: 'Scarica il piano (PDF)',
    distanza: 'Distanza',
    salita: 'Salita',
    discesa: 'Discesa',
    tempo: 'Tempo stimato',
    difficolta: 'Difficoltà',
    segnaviaTratte: 'Segnavia da seguire, tratta per tratta:',
    vaiMappa: 'Vedi il tratto sulla mappa ↓',
    tappeUna: 'Le tappe, una alla volta',
    notaInverso:
      'Le indicazioni sono descritte nel senso classico: in senso inverso usale come riferimento dei luoghi che attraversi, in ordine contrario.',
    indietro: '← Indietro',
    avanti: 'Avanti →',
    facile: 'Facile',
    medio: 'Medio',
    impegnativo: 'Impegnativo',
    pianoCammino: 'Piano di cammino',
    contatore: 'Passo {n} di {tot}',
    acqua: 'Acqua',
    appoggio: 'Punto d’appoggio',
    anello: 'Anello con partenza e ritorno a {da}. Il tempo stimato non comprende le soste.',
    direzione: 'Da {da} a {a}, in senso {senso}. Il tempo stimato non comprende le soste.',
    sensoClassico: 'classico',
    sensoInverso: 'inverso',
    giorno: 'Giorno {n}',
    daA: 'da {da} a {a}',
    giornataLunga:
      '<strong>Giornata lunga per il tempo che hai indicato.</strong> Parti presto al mattino, oppure scegli un tratto più corto o un passo più realistico: la Via resta lì, non scappa.',
    servonoGiorni:
      '<strong>Servono {n} giorni con le ore che hai a disposizione.</strong> Le notti si organizzano nei <a href="{link}">punti d’appoggio</a> lungo la Via.',
    misureGpx: 'Misurato sulla traccia GPX: {km} km, salita {salita} m, discesa {discesa} m.',
    zaino: [
      'Scarpe da trekking già rodate',
      'Borraccia da almeno 1 litro',
      'Guscio antipioggia',
      'Cappello e crema solare',
      'Telefono carico (e mappa scaricata: sul sentiero il campo va e viene)',
      'Qualcosa da mangiare lungo il cammino',
    ],
    zainoAcqua: 'Scorta d’acqua: almeno 1,5 litri a persona',
    zainoCaldo: 'Uno strato caldo in più: i crinali sopra i mille metri sono ventosi anche d’estate',
    zainoBastoncini: 'Bastoncini da trekking per le lunghe discese',
    zainoSacco: 'Sacco lenzuolo e un ricambio per le notti nei punti d’appoggio',
    pdfSottotitolo: 'Piano di cammino',
    pdfAnello: 'Anello con partenza e ritorno a {da}.',
    pdfDirezione: 'Da {da} a {a} (senso {senso}).',
    pdfSintesi: 'In sintesi',
    pdfDistanza: 'Distanza stimata',
    pdfTempo: 'Tempo di cammino (soste escluse)',
    pdfSegnavia: 'Segnavia, tratta per tratta',
    pdfGiornate: 'Suddivisione in giornate',
    pdfAcqua: 'Acqua lungo il tratto',
    pdfNessunaAcqua: 'Nessuna fonte: parti con tutta l’acqua che ti serve.',
    pdfPortare: 'Cosa portare',
    pdfTappe: 'Le tappe, passo per passo',
    pdfNb:
      'Le indicazioni passo per passo sono descritte nel senso classico; in senso inverso usale come riferimento dei luoghi, in ordine contrario.',
    pdfChiusura: 'Buon cammino. La montagna chiede rispetto, non coraggio.',
  },
};

export type Dizionario = typeof it;

const en: Dizionario = {
  home: 'Home',
  menu: 'Menu',
  navPrincipale: 'Main navigation',
  lingua: 'Language',
  saltaContenuto: 'Skip to content',
  nomeSito: 'L’Antica Via del Cifalco',
  seiQui: 'You are here',
  indice: 'Contents',
  indiceSezione: 'Section contents',
  precedente: '← Previous',
  successiva: 'Next →',
  altreVoci: 'Other pages in this section',
  piePagina: 'Footer links',
  menzioneLegale: 'Legal notice',
  homeDescrizione:
    'L’Antica Via del Cifalco: a rediscovered medieval mule track, from Ponte Organasco to Portofino Mare in about 75 kilometres along the ridge between the Trebbia and Aveto valleys.',
  homeOcchiello: 'From Ponte Organasco to Portofino Mare',
  citazioni: 'Quotations',
  inBreve: 'L’Antica Via del Cifalco at a glance',
  novita: 'News',
  scopri: 'Explore the site',
  altBanner: 'The Cifalco valley seen from above, with a village among the woods',
  chiSiamo: 'About us',
  chiSiamoDescrizione:
    'The Antica Via del Cifalco project, the people behind it, acknowledgements and legal notice.',
  altFaggeta: 'A beech wood along the ridge of the Via',
  contatti: 'Contact',
  contattiDescrizione: 'To write to the Antica Via del Cifalco: {email}.',
  contattiTesto:
    'For information about the trail, reports from the path, proposals for collaboration or to join the <a href="{link}">Compagnia del Cifalco</a>, write to us:',
  altSezione: {
    '/fare-il-cammino': 'The summit cross on Monte Roccabruna, along the ridge of the Via',
    '/approfondimenti': 'Rocks and woods along the ridge between the Trebbia and Aveto valleys',
    '/intorno': 'A path beside a pool of water',
  },
  mappa: {
    regione: 'Map of the GPX track of the Antica Via del Cifalco',
    scegli: 'Choose a section in the <a href="#quanto-dura">walking tracker</a>: the map will highlight it.',
    scarica: 'Download the GPX track',
    provvisoriaTitolo: 'Provisional map of the Via del Cifalco',
    provvisoria:
      'Provisional map, pending the official GPX track. The route can also be opened in <a href="{google}" target="_blank" rel="noopener">Google Maps</a> and <a href="{oa}" target="_blank" rel="noopener">Outdooractive</a>.',
    topografica: 'Topographic',
    stradale: 'Road map',
    mancano: 'To highlight the chosen section, the GPX track must contain a point named: {nomi}.',
    evidenza: 'Highlighted: from {da} to {a}, {km} km on the track.',
  },
  planner: {
    aria: 'Plan your walk',
    titolo: 'Build your plan',
    sottotitolo: 'Five choices, no maths: we take care of the rest.',
    itinerario: 'Itinerary',
    partiDa: 'Start from',
    arriviA: 'Finish at',
    senso: 'Direction',
    classico: 'Classic (towards Portofino)',
    inverso: 'Reverse',
    passo: 'Your pace',
    passoLento: 'Relaxed: first outings, families',
    passoMedio: 'Average: I walk regularly',
    passoVeloce: 'Fit: frequent mountain walker',
    ore: 'Walking hours per day',
    fino: 'Up to {n} hours',
    piano: 'Your plan',
    scarica: 'Download the plan (PDF)',
    distanza: 'Distance',
    salita: 'Ascent',
    discesa: 'Descent',
    tempo: 'Estimated time',
    difficolta: 'Difficulty',
    segnaviaTratte: 'Waymarks to follow, section by section:',
    vaiMappa: 'See the section on the map ↓',
    tappeUna: 'The stages, one at a time',
    notaInverso:
      'Directions are written for the classic direction: when walking in reverse, use them as a reference for the places you pass, in reverse order.',
    indietro: '← Back',
    avanti: 'Next →',
    facile: 'Easy',
    medio: 'Moderate',
    impegnativo: 'Demanding',
    pianoCammino: 'Walking plan',
    contatore: 'Step {n} of {tot}',
    acqua: 'Water',
    appoggio: 'Place to stay or eat',
    anello: 'Loop starting and ending at {da}. The estimated time does not include breaks.',
    direzione: 'From {da} to {a}, {senso} direction. The estimated time does not include breaks.',
    sensoClassico: 'classic',
    sensoInverso: 'reverse',
    giorno: 'Day {n}',
    daA: 'from {da} to {a}',
    giornataLunga:
      '<strong>A long day for the time you have indicated.</strong> Set off early in the morning, or choose a shorter section or a more realistic pace: the Via will still be there, it is not going anywhere.',
    servonoGiorni:
      '<strong>You need {n} days with the hours you have available.</strong> Nights can be spent at the <a href="{link}">places to stay</a> along the Via.',
    misureGpx: 'Measured on the GPX track: {km} km, ascent {salita} m, descent {discesa} m.',
    zaino: [
      'Broken-in hiking boots',
      'Water bottle of at least 1 litre',
      'Waterproof shell',
      'Hat and sun cream',
      'Charged phone (and a downloaded map: on the trail the signal comes and goes)',
      'Something to eat along the way',
    ],
    zainoAcqua: 'Water supply: at least 1.5 litres per person',
    zainoCaldo: 'An extra warm layer: ridges above a thousand metres are windy even in summer',
    zainoBastoncini: 'Trekking poles for the long descents',
    zainoSacco: 'Sleeping-bag liner and a change of clothes for nights at places to stay',
    pdfSottotitolo: 'Walking plan',
    pdfAnello: 'Loop starting and ending at {da}.',
    pdfDirezione: 'From {da} to {a} ({senso} direction).',
    pdfSintesi: 'Summary',
    pdfDistanza: 'Estimated distance',
    pdfTempo: 'Walking time (breaks excluded)',
    pdfSegnavia: 'Waymarks, section by section',
    pdfGiornate: 'Day-by-day breakdown',
    pdfAcqua: 'Water along the way',
    pdfNessunaAcqua: 'No water sources: carry all the water you need.',
    pdfPortare: 'What to bring',
    pdfTappe: 'The stages, step by step',
    pdfNb:
      'Step-by-step directions are written for the classic direction; when walking in reverse, use them as a reference for the places, in reverse order.',
    pdfChiusura: 'Enjoy your walk. The mountain asks for respect, not courage.',
  },
};

const fr: Dizionario = {
  home: 'Accueil',
  menu: 'Menu',
  navPrincipale: 'Navigation principale',
  lingua: 'Langue',
  saltaContenuto: 'Aller au contenu',
  nomeSito: 'L’Antica Via del Cifalco',
  seiQui: 'Vous êtes ici',
  indice: 'Sommaire',
  indiceSezione: 'Sommaire de la section',
  precedente: '← Précédent',
  successiva: 'Suivant →',
  altreVoci: 'Autres pages de la section',
  piePagina: 'Liens de bas de page',
  menzioneLegale: 'Mentions légales',
  homeDescrizione:
    'L’Antica Via del Cifalco : un chemin muletier médiéval redécouvert, de Ponte Organasco à Portofino Mare en 75 kilomètres environ, le long de la crête entre Trebbia et Aveto.',
  homeOcchiello: 'De Ponte Organasco à Portofino Mare',
  citazioni: 'Citations',
  inBreve: 'L’Antica Via del Cifalco en bref',
  novita: 'Actualités',
  scopri: 'Découvrir le site',
  altBanner: 'La vallée du Cifalco vue d’en haut, avec un village au milieu des bois',
  chiSiamo: 'Qui sommes-nous',
  chiSiamoDescrizione:
    'Le projet de l’Antica Via del Cifalco, les personnes qui l’animent, les remerciements et les mentions légales.',
  altFaggeta: 'Une hêtraie le long de la crête de la Via',
  contatti: 'Contact',
  contattiDescrizione: 'Pour écrire à l’Antica Via del Cifalco : {email}.',
  contattiTesto:
    'Pour des informations sur le chemin, des signalements depuis le sentier, des propositions de collaboration ou pour rejoindre la <a href="{link}">Compagnia del Cifalco</a>, écrivez-nous :',
  altSezione: {
    '/fare-il-cammino': 'La croix sommitale du Monte Roccabruna, le long de la crête de la Via',
    '/approfondimenti': 'Rochers et bois le long de la crête entre Trebbia et Aveto',
    '/intorno': 'Un sentier au bord d’une mare',
  },
  mappa: {
    regione: 'Carte de la trace GPX de l’Antica Via del Cifalco',
    scegli: 'Choisissez un tronçon dans le <a href="#quanto-dura">walking tracker</a> : la carte le met en évidence.',
    scarica: 'Télécharger la trace GPX',
    provvisoriaTitolo: 'Carte provisoire de la Via del Cifalco',
    provvisoria:
      'Carte provisoire, dans l’attente de la trace GPX officielle. Le tracé peut aussi être ouvert sur <a href="{google}" target="_blank" rel="noopener">Google Maps</a> et <a href="{oa}" target="_blank" rel="noopener">Outdooractive</a>.',
    topografica: 'Topographique',
    stradale: 'Routière',
    mancano: 'Pour mettre en évidence le tronçon choisi, la trace GPX doit contenir un point nommé : {nomi}.',
    evidenza: 'En évidence : de {da} à {a}, {km} km sur la trace.',
  },
  planner: {
    aria: 'Planifiez votre randonnée',
    titolo: 'Construisez votre plan',
    sottotitolo: 'Cinq choix, aucun calcul à faire : nous nous occupons du reste.',
    itinerario: 'Itinéraire',
    partiDa: 'Départ',
    arriviA: 'Arrivée',
    senso: 'Sens de marche',
    classico: 'Classique (vers Portofino)',
    inverso: 'Inverse',
    passo: 'Votre rythme',
    passoLento: 'Tranquille : premières sorties, familles',
    passoMedio: 'Moyen : je marche régulièrement',
    passoVeloce: 'Entraîné : montagne fréquente',
    ore: 'Heures de marche par jour',
    fino: 'Jusqu’à {n} heures',
    piano: 'Votre plan',
    scarica: 'Télécharger le plan (PDF)',
    distanza: 'Distance',
    salita: 'Montée',
    discesa: 'Descente',
    tempo: 'Temps estimé',
    difficolta: 'Difficulté',
    segnaviaTratte: 'Balisage à suivre, tronçon par tronçon :',
    vaiMappa: 'Voir le tronçon sur la carte ↓',
    tappeUna: 'Les étapes, une à la fois',
    notaInverso:
      'Les indications sont rédigées dans le sens classique : dans le sens inverse, utilisez-les comme repères des lieux traversés, dans l’ordre contraire.',
    indietro: '← Retour',
    avanti: 'Suivant →',
    facile: 'Facile',
    medio: 'Moyen',
    impegnativo: 'Difficile',
    pianoCammino: 'Plan de randonnée',
    contatore: 'Étape {n} sur {tot}',
    acqua: 'Eau',
    appoggio: 'Hébergement ou restauration',
    anello: 'Boucle avec départ et retour à {da}. Le temps estimé ne comprend pas les pauses.',
    direzione: 'De {da} à {a}, sens {senso}. Le temps estimé ne comprend pas les pauses.',
    sensoClassico: 'classique',
    sensoInverso: 'inverse',
    giorno: 'Jour {n}',
    daA: 'de {da} à {a}',
    giornataLunga:
      '<strong>Journée longue pour le temps indiqué.</strong> Partez tôt le matin, ou choisissez un tronçon plus court ou un rythme plus réaliste : la Via restera là, elle ne s’enfuit pas.',
    servonoGiorni:
      '<strong>Il faut {n} jours avec les heures dont vous disposez.</strong> Les nuits s’organisent dans les <a href="{link}">points d’appui</a> le long de la Via.',
    misureGpx: 'Mesuré sur la trace GPX : {km} km, montée {salita} m, descente {discesa} m.',
    zaino: [
      'Chaussures de randonnée déjà rodées',
      'Gourde d’au moins 1 litre',
      'Veste imperméable',
      'Chapeau et crème solaire',
      'Téléphone chargé (et carte téléchargée : sur le sentier, le réseau va et vient)',
      'De quoi manger en chemin',
    ],
    zainoAcqua: 'Réserve d’eau : au moins 1,5 litre par personne',
    zainoCaldo: 'Une couche chaude en plus : au-dessus de mille mètres, les crêtes sont venteuses même en été',
    zainoBastoncini: 'Bâtons de randonnée pour les longues descentes',
    zainoSacco: 'Sac à viande et des vêtements de rechange pour les nuits dans les points d’appui',
    pdfSottotitolo: 'Plan de randonnée',
    pdfAnello: 'Boucle avec départ et retour à {da}.',
    pdfDirezione: 'De {da} à {a} (sens {senso}).',
    pdfSintesi: 'En résumé',
    pdfDistanza: 'Distance estimée',
    pdfTempo: 'Temps de marche (pauses exclues)',
    pdfSegnavia: 'Balisage, tronçon par tronçon',
    pdfGiornate: 'Répartition par journées',
    pdfAcqua: 'Eau le long du parcours',
    pdfNessunaAcqua: 'Aucune source : partez avec toute l’eau nécessaire.',
    pdfPortare: 'Que prendre',
    pdfTappe: 'Les étapes, pas à pas',
    pdfNb:
      'Les indications pas à pas sont rédigées dans le sens classique ; dans le sens inverse, utilisez-les comme repères des lieux, dans l’ordre contraire.',
    pdfChiusura: 'Bonne randonnée. La montagne demande du respect, pas du courage.',
  },
};

export const DIZIONARI: Record<Lingua, Dizionario> = { it, en, fr };
export const t = (lingua: Lingua) => DIZIONARI[lingua];
