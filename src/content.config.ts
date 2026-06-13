import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Le tre collection «di percorso» (punti, tappe, itinerari) sono file JSON:
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
    // Quota in metri (facoltativa, mostrata nelle schede).
    quota: z.number().optional(),
  }),
});

const tappe = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/tappe' }),
  schema: z.object({
    nome: z.string(),
    da: z.string(),
    a: z.string(),
    distanzaKm: z.number(),
    salitaM: z.number(),
    discesaM: z.number(),
    // Ore di cammino a passo medio, soste escluse.
    oreBase: z.number(),
    descrizione: z.string(),
    // Segnavia da seguire su questa tratta (può cambiare lungo la Via).
    segnavia: z.string(),
    // Id dei punti attraversati, in ordine: disegnano la tappa sulla mappa.
    punti: z.array(z.string()),
    // Le indicazioni passo-passo mostrate dal planner («avanti»).
    passi: z.array(
      z.object({
        titolo: z.string(),
        testo: z.string(),
      })
    ),
    // Le deviazioni dalla via principale (mostrate nella descrizione dettagliata).
    deviazioni: z
      .array(
        z.object({
          titolo: z.string(),
          testo: z.string(),
        })
      )
      .default([]),
  }),
});

const itinerari = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/itinerari' }),
  schema: z.object({
    nome: z.string(),
    sottotitolo: z.string(),
    descrizione: z.string(),
    difficolta: z.enum(['facile', 'medio', 'impegnativo']),
    // Id delle tappe che compongono l'itinerario, in ordine.
    tappe: z.array(z.string()),
    giorniConsigliati: z.string(),
    // Ordine di presentazione nelle liste.
    ordine: z.number(),
    // true se il percorso torna al punto di partenza.
    anello: z.boolean().default(false),
  }),
});

export const collections = { punti, tappe, itinerari };
