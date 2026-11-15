import { getCollection } from 'astro:content';

/** I luoghi della Via (src/content/punti/), mostrati sulla mappa GPX. */
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
  lat?: number;
  lon?: number;
}

export async function caricaPunti(): Promise<Punto[]> {
  return (await getCollection('punti')).map((p) => ({ id: p.id, ...p.data }));
}
