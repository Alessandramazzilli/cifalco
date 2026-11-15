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
  altFoto: {
    "golfo-tigullio-dai-monti.jpg": "Il golfo del Tigullio visto dai monti",
    "sentiero-faggeta.jpg": "Un sentiero nella faggeta",
    "croce-vetta-nuvole.jpg": "Una croce di vetta sotto un cielo di nuvole",
    "girini.jpg": "Girini nel Lago della Nave durante il mese di maggio",
    "ruscello-casanova.jpg": "Uno dei ruscelli lungo la discesa verso Casanova",
    "vista-tigullio-crinale.jpg": "Dai monti, la vista si apre sul Tigullio",
    "ginestre-monte-caucaso.jpg": "La parete sud del Monte Caucaso con le ginestre in fiore",
    "chiesa-gattorna.jpg": "La chiesa di Gattorna",
    "castello-paraggi.jpg": "Il castello di Paraggi sul mare",
    "portofino-baia.jpg": "Il promontorio di Portofino e le barche fuori dal porticciolo",
    "vetta-rocca-bruna.jpg": "La croce di vetta sul Monte Roccabruna, lungo il crinale della Via",
    "monte-gifarco.jpg": "Il Monte Gifarco tra i boschi del crinale",
    "sentiero-pozza.jpg": "Un sentiero nel bosco accanto a una pozza d’acqua",
    "costa-tigullio.jpg": "Il golfo del Tigullio visto dall’alto, dove la Via arriva al mare",
    "home-banner-valle-del-cifalco.jpg": "La valle del Cifalco vista dall’alto, con un borgo tra i boschi",
    "rifugio-terrazza-mare.jpg": "La terrazza di un rifugio con tavoli e vista sul mare",
    "spada-nella-roccia.jpg": "La spada nella roccia sulla vetta del Monte Gifarco",
    "muro-ruota-carro.jpg": "Una vecchia ruota di carro appoggiata al muro di una casa in pietra"
  } as Record<string, string>,
  home: 'Home',
  menu: 'Menu',
  navPrincipale: 'Navigazione principale',
  lingua: 'Lingua',
  saltaContenuto: 'Salta al contenuto',
  nomeSito: 'Antica Via del Cifalco',
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
  pdf: {
    descrizione: 'Scarica il PDF della descrizione dettagliata',
    approfondimenti: 'Scarica il PDF degli approfondimenti',
    istruzioni: 'Si apre la finestra di stampa: come stampante scegli «Salva come PDF».',
    salva: 'Salva come PDF',
    torna: '← Torna al sito',
  },
  mappa: {
    profiloAiuto: 'Passa con il cursore (o con il dito) sul profilo: la posizione compare sulla mappa.',
    cursore: 'Km {km} · quota {quota} m',
    scaricaSeparate: 'Tutte le tracce in file separati (ZIP)',
    caricamento: 'Caricamento della mappa…',
    legenda: 'Legenda della mappa',
    principale: 'Percorso principale',
    deviazioni: 'Deviazioni',
    profilo: 'Profilo altimetrico del percorso principale (quote da {min} a {max} m)',
    scaricaPrincipale: 'Solo il percorso principale (GPX)',
    altrove:
      'Il file GPX completo contiene il percorso principale, tutte le deviazioni e i luoghi della Via: si apre con le app che leggono più tracce in un file (ad esempio OsmAnd, Locus Map, Gaia GPS). Alcune app (ad esempio Komoot o Wikiloc) importano solo la prima traccia di un file: in quel caso, usa lo ZIP con un file per ogni deviazione. Il percorso è anche su OpenStreetMap: <a href="{waymarked}" target="_blank" rel="noopener">Waymarked Trails</a>.',
    manca: 'La mappa sarà disponibile a breve.',
    regione: 'Mappa della traccia GPX dell’Antica Via del Cifalco',
    scarica: 'Scarica la traccia GPX completa',
    topografica: 'Topografica',
    stradale: 'Stradale',
  },
};

export type Dizionario = typeof it;

const en: Dizionario = {
  altFoto: {
    "golfo-tigullio-dai-monti.jpg": "The Gulf of Tigullio seen from the mountains",
    "sentiero-faggeta.jpg": "A path through the beech wood",
    "croce-vetta-nuvole.jpg": "A summit cross under a cloudy sky",
    "girini.jpg": "Tadpoles in the Lago della Nave in May",
    "ruscello-casanova.jpg": "One of the streams on the descent towards Casanova",
    "vista-tigullio-crinale.jpg": "From the mountains, the view opens onto the Tigullio",
    "ginestre-monte-caucaso.jpg": "The south face of Monte Caucaso with the broom in flower",
    "chiesa-gattorna.jpg": "The church of Gattorna",
    "castello-paraggi.jpg": "The castle of Paraggi above the sea",
    "portofino-baia.jpg": "The Portofino headland and the boats outside the little harbour",
    "vetta-rocca-bruna.jpg": "The summit cross on Monte Roccabruna, along the ridge of the Via",
    "monte-gifarco.jpg": "Monte Gifarco among the woods of the ridge",
    "sentiero-pozza.jpg": "A woodland path beside a pool of water",
    "costa-tigullio.jpg": "The Gulf of Tigullio seen from above, where the Via reaches the sea",
    "home-banner-valle-del-cifalco.jpg": "The Cifalco valley seen from above, with a village among the woods",
    "rifugio-terrazza-mare.jpg": "The terrace of a mountain hut with tables and a view of the sea",
    "spada-nella-roccia.jpg": "The sword in the stone on the summit of Monte Gifarco",
    "muro-ruota-carro.jpg": "An old cartwheel leaning against the wall of a stone house"
  },
  home: 'Home',
  menu: 'Menu',
  navPrincipale: 'Main navigation',
  lingua: 'Language',
  saltaContenuto: 'Skip to content',
  nomeSito: 'Antica Via del Cifalco',
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
  pdf: {
    descrizione: 'Download the detailed description as PDF',
    approfondimenti: 'Download the In depth section as PDF',
    istruzioni: 'The print window opens: as the printer, choose “Save as PDF”.',
    salva: 'Save as PDF',
    torna: '← Back to the site',
  },
  mappa: {
    profiloAiuto: 'Move the cursor (or your finger) over the profile: the position appears on the map.',
    cursore: 'Km {km} · altitude {quota} m',
    scaricaSeparate: 'All tracks as separate files (ZIP)',
    caricamento: 'Loading the map…',
    legenda: 'Map key',
    principale: 'Main route',
    deviazioni: 'Detours',
    profilo: 'Elevation profile of the main route (from {min} to {max} m)',
    scaricaPrincipale: 'Main route only (GPX)',
    altrove:
      'The full GPX file contains the main route, all the detours and the places along the Via: it opens in apps that read several tracks in one file (for example OsmAnd, Locus Map, Gaia GPS). Some apps (for example Komoot or Wikiloc) only import the first track of a file: in that case, use the ZIP with one file per detour. The route is also on OpenStreetMap: <a href="{waymarked}" target="_blank" rel="noopener">Waymarked Trails</a>.',
    manca: 'The map will be available soon.',
    regione: 'Map of the GPX track of the Antica Via del Cifalco',
    scarica: 'Download the full GPX track',
    topografica: 'Topographic',
    stradale: 'Road map',
  },
};

const fr: Dizionario = {
  altFoto: {
    "golfo-tigullio-dai-monti.jpg": "Le golfe du Tigullio vu depuis les montagnes",
    "sentiero-faggeta.jpg": "Un sentier dans la hêtraie",
    "croce-vetta-nuvole.jpg": "Une croix sommitale sous un ciel de nuages",
    "girini.jpg": "Têtards dans le Lago della Nave au mois de mai",
    "ruscello-casanova.jpg": "L’un des ruisseaux sur la descente vers Casanova",
    "vista-tigullio-crinale.jpg": "Depuis les montagnes, la vue s’ouvre sur le Tigullio",
    "ginestre-monte-caucaso.jpg": "Le versant sud du Monte Caucaso avec les genêts en fleur",
    "chiesa-gattorna.jpg": "L’église de Gattorna",
    "castello-paraggi.jpg": "Le château de Paraggi au-dessus de la mer",
    "portofino-baia.jpg": "Le promontoire de Portofino et les bateaux devant le petit port",
    "vetta-rocca-bruna.jpg": "La croix sommitale du Monte Roccabruna, le long de la crête de la Via",
    "monte-gifarco.jpg": "Le Monte Gifarco au milieu des bois de la crête",
    "sentiero-pozza.jpg": "Un sentier forestier au bord d’une mare",
    "costa-tigullio.jpg": "Le golfe du Tigullio vu d’en haut, là où la Via rejoint la mer",
    "home-banner-valle-del-cifalco.jpg": "La vallée du Cifalco vue d’en haut, avec un village au milieu des bois",
    "rifugio-terrazza-mare.jpg": "La terrasse d’un refuge avec des tables et vue sur la mer",
    "spada-nella-roccia.jpg": "L’épée dans le rocher au sommet du Monte Gifarco",
    "muro-ruota-carro.jpg": "Une vieille roue de charrette appuyée contre le mur d’une maison en pierre"
  },
  home: 'Accueil',
  menu: 'Menu',
  navPrincipale: 'Navigation principale',
  lingua: 'Langue',
  saltaContenuto: 'Aller au contenu',
  nomeSito: 'Antica Via del Cifalco',
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
  pdf: {
    descrizione: 'Télécharger la description détaillée en PDF',
    approfondimenti: 'Télécharger les approfondissements en PDF',
    istruzioni: 'La fenêtre d’impression s’ouvre : comme imprimante, choisissez « Enregistrer au format PDF ».',
    salva: 'Enregistrer en PDF',
    torna: '← Retour au site',
  },
  mappa: {
    profiloAiuto: 'Passez le curseur (ou le doigt) sur le profil : la position apparaît sur la carte.',
    cursore: 'Km {km} · altitude {quota} m',
    scaricaSeparate: 'Toutes les traces en fichiers séparés (ZIP)',
    caricamento: 'Chargement de la carte…',
    legenda: 'Légende de la carte',
    principale: 'Itinéraire principal',
    deviazioni: 'Détours',
    profilo: 'Profil altimétrique de l’itinéraire principal (de {min} à {max} m)',
    scaricaPrincipale: 'Itinéraire principal seul (GPX)',
    altrove:
      'Le fichier GPX complet contient l’itinéraire principal, tous les détours et les lieux de la Via : il s’ouvre avec les applications qui lisent plusieurs traces dans un fichier (par exemple OsmAnd, Locus Map, Gaia GPS). Certaines applications (par exemple Komoot ou Wikiloc) n’importent que la première trace d’un fichier : dans ce cas, utilisez le ZIP avec un fichier par détour. L’itinéraire figure aussi sur OpenStreetMap : <a href="{waymarked}" target="_blank" rel="noopener">Waymarked Trails</a>.',
    manca: 'La carte sera bientôt disponible.',
    regione: 'Carte de la trace GPX de l’Antica Via del Cifalco',
    scarica: 'Télécharger la trace GPX complète',
    topografica: 'Topographique',
    stradale: 'Routière',
  },
};

export const DIZIONARI: Record<Lingua, Dizionario> = { it, en, fr };
export const t = (lingua: Lingua) => DIZIONARI[lingua];
