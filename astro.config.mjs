import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Quando il sito avrà un dominio definitivo, aggiorna `site` qui sotto:
// serve per sitemap, Open Graph e URL canonici.
export default defineConfig({
  site: 'https://anticaviadelcifalco.it',
  integrations: [sitemap()],
  trailingSlash: 'never',
  // I vecchi indirizzi continuano a funzionare.
  redirects: {
    '/progetto': '/chi-siamo',
    '/itinerario': '/fare-il-cammino/organizzare-il-viaggio',
    '/itinerario/descrizione-dettagliata': '/fare-il-cammino/organizzare-il-viaggio#descrizione-dettagliata',
    '/itinerario/informazioni-pratiche': '/fare-il-cammino',
    '/percorso': '/fare-il-cammino/organizzare-il-viaggio',
    '/mappa': '/fare-il-cammino/organizzare-il-viaggio#mappa-gpx',
    '/info-pratiche': '/fare-il-cammino',
    '/punti-di-interesse': '/approfondimenti/tappe',
    '/storia-e-territorio': '/approfondimenti/cenni-storici',
    '/rete-di-cammini': '/intorno/altri-cammini',
    '/dicono-di-noi': '/intorno',
  },

  build: {
    inlineStylesheets: 'auto',
  },
});
