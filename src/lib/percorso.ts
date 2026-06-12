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

/**
 * Disegna il tracciato di una tappa come curva morbida (Catmull-Rom → Bézier)
 * che passa per i punti attraversati. Restituisce l'attributo `d` di un path SVG.
 * Quando arriverà la mappa illustrata definitiva, basterà ridisegnare questi
 * tracciati una sola volta aggiornando le coordinate dei punti.
 */
export function tracciaTappa(tappa: Tappa, percorso: Percorso): string {
  const coords = tappa.punti.map((id) => {
    const punto = percorso.punti.find((p) => p.id === id);
    if (!punto) throw new Error(`Tappa «${tappa.id}»: punto sconosciuto «${id}»`);
    return [punto.x, punto.y] as const;
  });
  if (coords.length < 2) return '';

  let d = `M ${coords[0][0]} ${coords[0][1]}`;
  for (let i = 0; i < coords.length - 1; i++) {
    const p0 = coords[Math.max(0, i - 1)];
    const p1 = coords[i];
    const p2 = coords[i + 1];
    const p3 = coords[Math.min(coords.length - 1, i + 2)];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C ${c1[0].toFixed(1)} ${c1[1].toFixed(1)}, ${c2[0].toFixed(1)} ${c2[1].toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
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
