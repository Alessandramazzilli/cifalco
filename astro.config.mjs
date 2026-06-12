import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Quando il sito avrà un dominio definitivo, aggiorna `site` qui sotto:
// serve per sitemap, Open Graph e URL canonici.
export default defineConfig({
  site: 'https://anticaviadelcifalco.it',
  integrations: [sitemap()],
  trailingSlash: 'never',
  build: {
    inlineStylesheets: 'auto',
  },
});
