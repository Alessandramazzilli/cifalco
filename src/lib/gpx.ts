/** Lettura e misure di una traccia GPX (nel browser). */

export interface PuntoTraccia {
  lat: number;
  lon: number;
  ele: number | null;
}

export interface Traccia {
  nome: string;
  tipo: string; // «principale» o «deviazione» (campo <type> del GPX)
  punti: PuntoTraccia[];
}

export interface Gpx {
  tracce: Traccia[];
  waypoint: { nome: string; lat: number; lon: number }[];
}

export function leggiGpx(testo: string): Gpx {
  const doc = new DOMParser().parseFromString(testo, 'application/xml');
  const num = (el: Element, attr: string) => Number(el.getAttribute(attr));
  const punto = (n: Element): PuntoTraccia => {
    const ele = n.getElementsByTagName('ele')[0]?.textContent;
    return { lat: num(n, 'lat'), lon: num(n, 'lon'), ele: ele ? Number(ele) : null };
  };
  const tracce = [...doc.getElementsByTagName('trk')].map((trk) => ({
    nome: trk.getElementsByTagName('name')[0]?.textContent?.trim() ?? '',
    tipo: trk.getElementsByTagName('type')[0]?.textContent?.trim() ?? '',
    punti: [...trk.getElementsByTagName('trkpt')].map(punto),
  }));
  const waypoint = [...doc.getElementsByTagName('wpt')].map((n) => ({
    nome: n.getElementsByTagName('name')[0]?.textContent?.trim() ?? '',
    lat: num(n, 'lat'),
    lon: num(n, 'lon'),
  }));
  return { tracce, waypoint };
}

/** Distanza in km tra due coordinate (formula dell'emisenoverso). */
export function distanzaKm(a: { lat: number; lon: number }, b: { lat: number; lon: number }): number {
  const R = 6371;
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLon = (b.lon - a.lon) * rad;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Indice del punto della traccia più vicino a una coordinata. */
export function puntoPiuVicino(traccia: PuntoTraccia[], [lat, lon]: [number, number]): number {
  let migliore = 0;
  let minima = Infinity;
  traccia.forEach((p, i) => {
    const d = distanzaKm(p, { lat, lon });
    if (d < minima) {
      minima = d;
      migliore = i;
    }
  });
  return migliore;
}

/**
 * Variazioni di quota sotto questa soglia (metri) sono rumore del modello
 * altimetrico: la stessa regola è usata da scripts/gpx/prepara.py per i dati
 * del walking tracker (e dà i 4677 m ufficiali sul percorso principale).
 */
export const SOGLIA_QUOTA = 0.77;

/** Lunghezza e dislivelli di un tratto, nel verso della traccia. */
export function misura(tratto: PuntoTraccia[]): { km: number; salita: number; discesa: number } {
  let km = 0;
  let salita = 0;
  let discesa = 0;
  let rif = tratto[0]?.ele ?? null;
  for (let i = 1; i < tratto.length; i++) {
    km += distanzaKm(tratto[i - 1], tratto[i]);
    const e = tratto[i].ele;
    if (e === null || rif === null) continue;
    if (e - rif >= SOGLIA_QUOTA) {
      salita += e - rif;
      rif = e;
    } else if (rif - e >= SOGLIA_QUOTA) {
      discesa += rif - e;
      rif = e;
    }
  }
  return { km, salita, discesa };
}
