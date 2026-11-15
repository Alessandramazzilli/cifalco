import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * I punti della Via (luoghi mostrati sulla mappa) sono file JSON:
 * aggiornare il cammino significa modificare quei file, non il codice.
 * Le istruzioni passo-passo sono nel README.
 */

const punti = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/punti' }),
  schema: z.object({
    nome: z.string(),
    // Tipo di punto: determina l'icona sulla mappa e il raggruppamento.
    tipo: z.enum(['borgo', 'fonte', 'valico', 'natura', 'storia', 'ristoro']),
    // Coordinate sulla mappa illustrata (viewBox 1000×700).
    x: z.number(),
    y: z.number(),
    descrizione: z.string(),
    // true se qui c'è acqua potabile (fonte, fontana, abbeveratoio attivo).
    acquaPotabile: z.boolean().default(false),
    // true se qui c'è un punto di appoggio (locanda, rifugio, B&B, ristoro).
    appoggio: z.boolean().default(false),
    // Quota in metri (facoltativa, mostrata nelle schede).
    quota: z.number().optional(),
    // Coordinate geografiche (facoltative): servono alla mappa GPX solo se
    // la traccia non contiene un waypoint con lo stesso nome del punto.
    lat: z.number().optional(),
    lon: z.number().optional(),
  }),
});

export const collections = { punti };
