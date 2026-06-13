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
    '/percorso': '/itinerario',
    '/mappa': '/itinerario#mappa',
    '/info-pratiche': '/itinerario/informazioni-pratiche',
    '/punti-di-interesse': '/itinerario#mappa',
    '/storia-e-territorio': '/approfondimenti',
    '/rete-di-cammini': '/approfondimenti#rete',
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
