/** Lettura e misure di una traccia GPX (nel browser). */

export interface PuntoTraccia {
  lat: number;
  lon: number;
  ele: number | null;
}

export interface Gpx {
  traccia: PuntoTraccia[];
  waypoint: { nome: string; lat: number; lon: number }[];
}

export function leggiGpx(testo: string): Gpx {
  const doc = new DOMParser().parseFromString(testo, 'application/xml');
  const num = (el: Element, attr: string) => Number(el.getAttribute(attr));
  // Tracce (trkpt) o, in mancanza, percorsi (rtept).
  let nodi = [...doc.getElementsByTagName('trkpt')];
  if (nodi.length === 0) nodi = [...doc.getElementsByTagName('rtept')];
  const traccia = nodi.map((n) => {
    const ele = n.getElementsByTagName('ele')[0]?.textContent;
    return { lat: num(n, 'lat'), lon: num(n, 'lon'), ele: ele ? Number(ele) : null };
  });
  const waypoint = [...doc.getElementsByTagName('wpt')].map((n) => ({
    nome: n.getElementsByTagName('name')[0]?.textContent?.trim() ?? '',
    lat: num(n, 'lat'),
    lon: num(n, 'lon'),
  }));
  return { traccia, waypoint };
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

/** Lunghezza e dislivelli di un tratto, nel verso della traccia. */
export function misura(tratto: PuntoTraccia[]): { km: number; salita: number; discesa: number } {
  let km = 0;
  let salita = 0;
  let discesa = 0;
  for (let i = 1; i < tratto.length; i++) {
    km += distanzaKm(tratto[i - 1], tratto[i]);
    const a = tratto[i - 1].ele;
    const b = tratto[i].ele;
    if (a !== null && b !== null) {
      if (b > a) salita += b - a;
      else discesa += a - b;
    }
  }
  return { km, salita, discesa };
}
