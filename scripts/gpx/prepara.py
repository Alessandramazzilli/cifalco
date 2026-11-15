"""
Prepara la traccia GPX del sito a partire dai file del cartografo
(scripts/gpx/originali/: percorso principale + una traccia per deviazione).

Produce:
- public/gpx/antica-via-del-cifalco.gpx: un unico file con il percorso
  principale, tutte le deviazioni e i luoghi (waypoint) della Via;
- public/gpx/antica-via-del-cifalco-percorso-principale.gpx: solo la via
  principale, con i luoghi.
E aggiorna i dati del walking tracker:
- coordinate (lat, lon) dei punti in src/content/punti/;
- distanza, salita e discesa delle tratte in src/content/tappe/, misurate
  sulla traccia, così tracker e mappa danno gli stessi numeri.

Uso: python3 scripts/gpx/prepara.py
"""
import glob
import html
import json
import math
import os
import re

QUI = os.path.dirname(os.path.abspath(__file__))
RADICE = os.path.join(QUI, '..', '..')
ORIGINALI = os.path.join(QUI, 'originali')
PUBBLICO = os.path.join(RADICE, 'public', 'gpx')

# Soglia (in metri) sotto la quale le variazioni di quota sono considerate
# rumore del modello altimetrico. Con 0,77 m il dislivello del percorso
# principale coincide con il dato ufficiale (4677 m). La stessa soglia è
# usata dalla mappa del sito (src/lib/gpx.ts).
SOGLIA_QUOTA = 0.77

# Posizione dei luoghi lungo il percorso principale, in km dalla partenza
# (ricavata dagli attacchi delle deviazioni e dal profilo altimetrico).
# I luoghi fuori dalla via principale stanno alla fine della loro deviazione.
SUL_PERCORSO = {
    'ponte-organasco': 0.0,
    'cerignale': 5.4,
    'oneto': 7.2,
    'rifugio-casermetta': 10.2,
    'monte-delle-tane': 10.5,   # pendici, attacco della deviazione alla vetta
    'monte-veri': 17.5,
    'monte-dego': 19.6,         # pendici, attacco della deviazione alla vetta
    'rifugio-prati-di-foppiano': 22.8,
    'passo-di-vallersone': 24.7,
    'lago-della-nave': 32.9,
    'passo-della-rocca': 33.8,
    'cappelletta-di-cardenosa': 35.6,
    'barbagelata': 40.4,
    'passo-della-scoglina': 41.7,
    'acquapendente': 44.3,
    'monte-caucaso': 45.3,
    'faggio-rotondo': 48.2,
    'neirone': 50.6,
    'gattorna': 54.0,
    'passo-dei-casetti': 57.5,
    'ruta': 67.8,
    'pietre-strette': 70.6,
    'portofino-mare': None,     # arrivo: ultimo punto della traccia
}
IN_DEVIAZIONE = {
    'monte-montarlone': 'deviazione_Montarlone.gpx',
    'monte-oramara': 'deviazione_MonteOramara.gpx',
    'casanova-di-rovegno': 'deviazione_CasanovaRovegno.gpx',
}


def leggi(percorso):
    s = open(percorso, encoding='utf-8').read()
    nome = re.search(r'<trk>\s*<name>([^<]*)</name>', s)
    punti = [(float(a), float(b), float(c)) for a, b, c in re.findall(
        r'<trkpt lat="([-\d.]+)" lon="([-\d.]+)">\s*<ele>([-\d.]+)</ele>', s)]
    return (html.unescape(nome.group(1)) if nome else os.path.basename(percorso)), punti


def distanza(a, b):
    r = 6371.0
    dl = math.radians(b[0] - a[0])
    do = math.radians(b[1] - a[1])
    h = math.sin(dl / 2) ** 2 + math.cos(math.radians(a[0])) * math.cos(math.radians(b[0])) * math.sin(do / 2) ** 2
    return 2 * r * math.asin(math.sqrt(h))


def misura(punti):
    km = sum(distanza(a, b) for a, b in zip(punti, punti[1:]))
    salita = discesa = 0.0
    rif = punti[0][2]
    for p in punti[1:]:
        if p[2] - rif >= SOGLIA_QUOTA:
            salita += p[2] - rif
            rif = p[2]
        elif rif - p[2] >= SOGLIA_QUOTA:
            discesa += rif - p[2]
            rif = p[2]
    return km, salita, discesa


def trk(nome, punti, tipo):
    righe = ''.join(f'<trkpt lat="{la:.7f}" lon="{lo:.7f}"><ele>{el:.1f}</ele></trkpt>' for la, lo, el in punti)
    return f'<trk><name>{html.escape(nome)}</name><type>{tipo}</type><trkseg>{righe}</trkseg></trk>\n'


def gpx(nome_file, contenuto, waypoint):
    w = ''.join(f'<wpt lat="{la:.7f}" lon="{lo:.7f}"><ele>{el:.0f}</ele><name>{html.escape(n)}</name></wpt>\n'
                for n, (la, lo, el) in waypoint)
    testo = ('<?xml version="1.0" encoding="UTF-8"?>\n'
             '<gpx version="1.1" creator="L’Antica Via del Cifalco" xmlns="http://www.topografix.com/GPX/1/1">\n'
             '<metadata><name>L’Antica Via del Cifalco</name>'
             '<link href="https://anticaviadelcifalco.netlify.app"><text>L’Antica Via del Cifalco</text></link></metadata>\n'
             + w + contenuto + '</gpx>\n')
    os.makedirs(PUBBLICO, exist_ok=True)
    with open(os.path.join(PUBBLICO, nome_file), 'w', encoding='utf-8') as f:
        f.write(testo)
    print('scritto public/gpx/' + nome_file, f'({len(testo) // 1024} kB)')


def main():
    _, principale = leggi(os.path.join(ORIGINALI, 'AVC_PercorsoPrincipale.gpx'))
    cumulata = [0.0]
    for a, b in zip(principale, principale[1:]):
        cumulata.append(cumulata[-1] + distanza(a, b))

    def indice_km(km):
        return min(range(len(cumulata)), key=lambda i: abs(cumulata[i] - km))

    # Luoghi
    posizioni, indici = {}, {}
    for id_, km in SUL_PERCORSO.items():
        i = len(principale) - 1 if km is None else indice_km(km)
        indici[id_] = i
        posizioni[id_] = principale[i]
    for id_, file in IN_DEVIAZIONE.items():
        _, dev = leggi(os.path.join(ORIGINALI, file))
        # il capo della deviazione lontano dalla via principale
        lontano = max((dev[0], dev[-1]), key=lambda p: min(distanza(p, q) for q in principale[::20]))
        posizioni[id_] = lontano

    nomi = {}
    for f in glob.glob(os.path.join(RADICE, 'src', 'content', 'punti', '*.json')):
        id_ = os.path.basename(f)[:-5]
        d = json.load(open(f, encoding='utf-8'))
        nomi[id_] = d['nome']
        if id_ in posizioni:
            la, lo, _ = posizioni[id_]
            d['lat'], d['lon'] = round(la, 6), round(lo, 6)
            with open(f, 'w', encoding='utf-8') as out:
                out.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
        else:
            print('  ! punto senza posizione:', id_)
    waypoint = [(nomi[i], posizioni[i]) for i in posizioni if i in nomi]

    # Tratte del tracker: misure sulla traccia, tra il primo e l'ultimo punto
    totale = [0, 0, 0]
    for f in sorted(glob.glob(os.path.join(RADICE, 'src', 'content', 'tappe', '*.json'))):
        d = json.load(open(f, encoding='utf-8'))
        a, b = indici[d['punti'][0]], indici[d['punti'][-1]]
        km, su, giu = misura(principale[a:b + 1])
        d['distanzaKm'], d['salitaM'], d['discesaM'] = round(km, 1), round(su), round(giu)
        totale = [totale[0] + km, totale[1] + su, totale[2] + giu]
        with open(f, 'w', encoding='utf-8') as out:
            out.write(json.dumps(d, ensure_ascii=False, indent=2) + '\n')
        print(f'  {os.path.basename(f):42s} {km:5.1f} km  +{su:4.0f}  -{giu:4.0f}')
    km, su, giu = misura(principale)
    print(f'  percorso principale: {km:.1f} km, +{su:.0f} m, -{giu:.0f} m (somma tratte {totale[0]:.1f} km, +{totale[1]:.0f})')

    # File GPX
    deviazioni = ''
    for f in sorted(glob.glob(os.path.join(ORIGINALI, 'deviazione_*.gpx'))):
        nome, punti = leggi(f)
        nome = nome[0].upper() + nome[1:]
        deviazioni += trk(nome, punti, 'deviazione')
    via = trk('Antica Via del Cifalco · percorso principale', principale, 'principale')
    gpx('antica-via-del-cifalco.gpx', via + deviazioni, waypoint)
    gpx('antica-via-del-cifalco-percorso-principale.gpx', via, waypoint)


if __name__ == '__main__':
    main()
