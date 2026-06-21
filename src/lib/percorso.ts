import { getCollection } from 'astro:content';

/** Modello dati condiviso da mappa, planner e pagine. */

export interface Punto {
  id: string;
  nome: string;
  tipo: 'borgo' | 'fonte' | 'valico' | 'natura' | 'storia' | 'ristoro';
  x: number;
  y: number;
  descrizione: string;
  acquaPotabile: boolean;
  appoggio: boolean;
  quota?: number;
}

export interface Tappa {
  id: string;
  nome: string;
  da: string;
  a: string;
  distanzaKm: number;
  salitaM: number;
  discesaM: number;
  oreBase: number;
  descrizione: string;
  segnavia: string;
  punti: string[];
  passi: { titolo: string; testo: string }[];
  deviazioni: { titolo: string; testo: string }[];
}

export interface Itinerario {
  id: string;
  nome: string;
  sottotitolo: string;
  descrizione: string;
  difficolta: 'facile' | 'medio' | 'impegnativo';
  tappe: string[];
  giorniConsigliati: string;
  ordine: number;
  anello: boolean;
}

export interface Percorso {
  punti: Punto[];
  tappe: Tappa[];
  itinerari: Itinerario[];
}

export async function caricaPercorso(): Promise<Percorso> {
  const punti = (await getCollection('punti')).map((p) => ({ id: p.id, ...p.data }));
  const tappe = (await getCollection('tappe')).map((t) => ({ id: t.id, ...t.data }));
  const itinerari = (await getCollection('itinerari'))
    .map((i) => ({ id: i.id, ...i.data }))
    .sort((a, b) => a.ordine - b.ordine);
  return { punti, tappe, itinerari };
}

/** «4 h 30 min» a partire da ore decimali. */
export function formattaOre(ore: number): string {
  const h = Math.floor(ore);
  const min = Math.round((ore - h) * 60);
  if (h === 0) return `${min} min`;
  return min === 0 ? `${h} h` : `${h} h ${min} min`;
}

export const ETICHETTE_TIPO: Record<Punto['tipo'], string> = {
  borgo: 'Borgo',
  fonte: 'Fonte',
  valico: 'Valico',
  natura: 'Natura',
  storia: 'Storia',
  ristoro: 'Ristoro e sosta',
};
