"""
Converte i testi originali (.docx in scripts/docx/originali/) nei frammenti
HTML del sito (src/testi/). Ogni pagina del sito legge il suo frammento.

Uso (dalla cartella del progetto):
    pip install python-docx
    python3 scripts/docx/converti.py

ATTENZIONE: rigenera i frammenti da zero. Se nel frattempo i testi sono
stati corretti direttamente nei file di src/testi/, quelle correzioni
andrebbero perse: in quel caso non rilanciare lo script.

Convenzioni dei documenti originali:
- evidenziato giallo  -> segnaposto da completare, mostrato come tale;
- evidenziato verde   -> aneddoto/leggenda, spostato in un riquadro;
- sottolineato        -> collegamento a un'altra sezione del sito;
- in «Descrizione dettagliata»: fucsia = via principale, azzurro =
  deviazione, verde = variante.
"""
import html as htmlmod
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from estrai import blocchi  # noqa: E402
import segnavia  # noqa: E402

QUI = os.path.dirname(os.path.abspath(__file__))
ORIGINALI = os.path.join(QUI, 'originali')
USCITA = os.path.join(QUI, '..', '..', 'src', 'testi')


# ---------------------------------------------------------------------------
# Utilità
# ---------------------------------------------------------------------------
def slug(testo):
    t = testo.lower()
    t = re.sub(r'<[^>]+>', '', t)
    for a, b in (('à', 'a'), ('è', 'e'), ('é', 'e'), ('ì', 'i'), ('ò', 'o'), ('ù', 'u'), ('’', '-'), ("'", '-')):
        t = t.replace(a, b)
    t = re.sub(r'[^a-z0-9]+', '-', t).strip('-')
    return t


def senza_lettera(testo):
    """«a. Premessa…» / «ii. Rifugi…» -> «Premessa…»"""
    return re.sub(r'^(?:[a-z]{1,4}|[0-9]+)\.\s*', '', testo.strip()).strip()


def pulisci_titolo(h):
    """HTML di un titolo: via grassetto, lettera iniziale ed evidenziazioni."""
    h = re.sub(r'</?strong>', '', h)
    h = re.sub(r'<span data-hl="[A-Z_]+">(.*?)</span>', r'\1', h, flags=re.S)
    h = re.sub(r'^\s*(?:[a-z]{1,4}|[0-9]+)\.\s*', '', h)
    return h.strip().rstrip(':').strip()


def segnaposto(h):
    """Giallo -> <mark class="segnaposto">, parentesi quadre comprese."""
    h = re.sub(r'\[?<span data-hl="YELLOW">(.*?)</span>\]?',
               lambda m: f'<mark class="segnaposto">{m.group(0)[0] if m.group(0).startswith("[") else ""}'
                         f'{m.group(1)}{"]" if m.group(0).endswith("]") else ""}</mark>',
               h, flags=re.S)
    # «[» o «]» rimasti appena fuori dal segnaposto
    h = re.sub(r'\[(\s*)<mark class="segnaposto">', r'<mark class="segnaposto">[\1', h)
    h = re.sub(r'</mark>(\s*)\]', r'\1]</mark>', h)
    return h


def togli_hl(h):
    return re.sub(r'<span data-hl="[A-Z_]+">(.*?)</span>', r'\1', h, flags=re.S)


class Pagina:
    def __init__(self, nome):
        self.nome = nome
        self.parti = []
        self._in_lista = False
        self._li_aperto = False

    def chiudi_lista(self):
        if self._li_aperto:
            self.parti.append('</li>')
            self._li_aperto = False
        if self._in_lista:
            self.parti.append('</ul>')
            self._in_lista = False

    def aggiungi(self, html_blocco):
        self.chiudi_lista()
        self.parti.append(html_blocco)

    def li(self, html_li):
        if not self._in_lista:
            self.parti.append('<ul>')
            self._in_lista = True
        if self._li_aperto:
            self.parti.append('</li>')
        self.parti.append(f'<li>{html_li}')
        self._li_aperto = True

    def continua_li(self, html_p):
        """Paragrafo che prosegue la voce di elenco precedente."""
        self.parti.append(f'<p>{html_p}</p>')

    def html(self):
        self.chiudi_lista()
        return '\n'.join(self.parti) + '\n'


def scrivi(cartella, pagine, trasforma=None):
    os.makedirs(os.path.join(USCITA, cartella), exist_ok=True)
    for nome_file, p in pagine.items():
        h = p.html()
        if trasforma:
            h = trasforma(p.nome, h)
        h = segnaposto(h)
        h = togli_hl(h)
        percorso = os.path.join(USCITA, cartella, f'{nome_file}.html')
        with open(percorso, 'w', encoding='utf-8') as f:
            f.write(intestazione() + h)
        print('scritto', os.path.relpath(percorso))


def intestazione():
    return ('<!-- Testo del sito. Si può modificare liberamente: è HTML semplice '
            '(<p> paragrafo, <strong> grassetto, <em> corsivo, <a href> link). '
            'Generato in origine da scripts/docx/converti.py. -->\n')


def figura(src, alt, didascalia, credito=None, classe='figura'):
    cap = didascalia
    if credito:
        cap += f'<br><span class="figura__credito">{credito}</span>'
    return (f'<figure class="{classe}"><img src="{src}" alt="{htmlmod.escape(alt)}" '
            f'loading="lazy" decoding="async"><figcaption>{cap}</figcaption></figure>')


def elementi_generici(pagina, b, precedente):
    """Paragrafo o voce di elenco senza regole speciali."""
    if b['elenco']:
        pagina.li(b['html'])
    elif b['stile'] == 'List Paragraph' and pagina._li_aperto:
        pagina.continua_li(b['html'])
    else:
        pagina.aggiungi(f'<p>{b["html"]}</p>')


# ---------------------------------------------------------------------------
# 2. Chi siamo
# ---------------------------------------------------------------------------
def chi_siamo():
    bl = blocchi(os.path.join(ORIGINALI, '2. Chi siamo.docx'))
    p = Pagina('chi-siamo')
    titoli = {'Il progetto': 'il-progetto', 'Le persone': 'le-persone',
              'Ringraziamenti': 'ringraziamenti', 'Menzione legale': 'menzione-legale'}
    for b in bl[1:]:
        t = b['testo'].strip()
        if b['elenco'] and t in titoli:
            p.aggiungi(f'<h2 id="{titoli[t]}">{t}</h2>')
            continue
        elementi_generici(p, b, None)
    scrivi('chi-siamo', {'chi-siamo': p})


# ---------------------------------------------------------------------------
# 3. Fare il cammino
# ---------------------------------------------------------------------------
PAGINE_FARE = {
    'Premessa sull’itinerario proposto': 'premessa',
    'Come arrivare al punto di partenza': 'come-arrivare',
    'Rientrare': 'rientrare',
    'Vie di fuga': 'vie-di-fuga',
    'Organizzare il viaggio: tappe, deviazioni e mappe': 'organizzare-il-viaggio',
    'Punti di appoggio': 'punti-di-appoggio',
    'Avvertenze': 'avvertenze',
}
SOTTO_FARE = {
    'Quanto dura la Via del Cifalco?': 'quanto-dura',
    'Descrizione dettagliata dell’itinerario': 'descrizione-dettagliata',
    'Mappa e traccia GPX': 'mappa-gpx',
    'Alberghi e altre strutture attrezzate per pernottamenti': 'alberghi',
    'Rifugi non attrezzati': 'rifugi',
}

LEGENDA = (
    '<div class="legenda-percorso" role="note" aria-label="Legenda">'
    '<span class="legenda-percorso__titolo">Legenda:</span> '
    '<span class="legenda-percorso__voce legenda-percorso__voce--principale">Via principale</span> '
    '<span class="legenda-percorso__voce legenda-percorso__voce--deviazione">Deviazione</span> '
    '<span class="legenda-percorso__voce legenda-percorso__voce--variante">Variante</span>'
    '</div>'
)


def fare_il_cammino():
    bl = blocchi(os.path.join(ORIGINALI, '3. Fare il cammino - informazioni pratiche.docx'))
    pagine = {}
    p = None
    modo = None  # None | 'tratte' | 'alberghi' | 'avvertenze'
    n_tratta = 0
    sospesi = []  # «Tempo»/«Segnavia» finiti fuori posto nel documento
    tratta_ha_tempo = False
    dopo_foto = 0

    for b in bl[1:]:
        t = senza_lettera(b['testo'])
        if t in PAGINE_FARE:
            p = pagine.setdefault(PAGINE_FARE[t], Pagina(PAGINE_FARE[t]))
            modo = 'avvertenze' if t == 'Avvertenze' else None
            continue
        if t in SOTTO_FARE:
            if sospesi:
                for s in sospesi:
                    p.aggiungi(s)
                sospesi = []
            id_ = SOTTO_FARE[t]
            p.aggiungi(f'<h2 id="{id_}">{htmlmod.escape(t)}</h2>')
            modo = {'descrizione-dettagliata': 'tratte', 'alberghi': 'alberghi'}.get(id_)
            if id_ == 'rifugi':
                modo = None
            continue

        # --- 3.a: la carta del Regio Corpo di Stato Maggiore ------------
        if p.nome == 'premessa':
            elementi_generici(p, b, None)
            if t.startswith('In primo luogo, come noto, le vecchie carte'):
                p.aggiungi(figura(
                    '/immagini/carta-regio-corpo-stato-maggiore.jpg',
                    'Antica carta topografica del crinale tra Trebbia e Aveto, con Fontanigorda, Casanova, Roccabruna, il Lago della Nave e Brignole',
                    'Il crinale tra Trebbia e Aveto nella carta del Regio Corpo di Stato Maggiore',
                    classe='figura figura--larga'))
            continue

        # --- 3.e.i: il walking tracker ----------------------------------
        if t.startswith('[Usate il “walking tracker”'):
            p.aggiungi('<p>Usate il “walking tracker” qui sotto per cucire su misura '
                       'l’itinerario che fa per voi!</p>')
            p.aggiungi('<!-- WALKING-TRACKER -->')
            continue

        # --- 3.e.iii: segnaposto della mappa GPX ------------------------
        if t.startswith('[caricare mappa e tracce GPX'):
            p.aggiungi(f'<p>{b["html"]}</p>')
            p.aggiungi('<!-- MAPPA-GPX -->')
            continue

        # --- 3.e.ii: descrizione dettagliata ----------------------------
        if modo == 'tratte':
            if t.startswith('[inserire foto cartelli'):
                p.aggiungi(figura(
                    '/immagini/cartelli-uscita-avc.jpg',
                    'Cartelli in legno dipinti a mano con la scritta «Uscita AVC» e le destinazioni delle deviazioni: Fontana del Figliolo, Ertola, Vetta M. Roccabruna, Fontanigorda, Casanova, Rezzoaglio, Vetta M. Gifarco, Brignole, Cariseto, Montarlone, Toveraia, Ottone, Vetta M. Oramara, Vetta M. Dego, Vetta M. Tane',
                    'I cartelli in legno che segnalano le uscite dell’Antica Via del Cifalco',
                    classe='figura figura--larga'))
                continue
            if t.startswith('Legenda'):
                p.aggiungi(LEGENDA)
                continue
            colori = b['colori']
            if b['elenco'] and 'PINK' in colori:
                if sospesi and tratta_ha_tempo is False:
                    pass
                n_tratta += 1
                tratta_ha_tempo = False
                p.aggiungi(f'<h3 class="tratta" id="tratta-{n_tratta}">{pulisci_titolo(b["html"])}</h3>')
                continue
            if re.match(r'^(Tempo|Segnavia)\s*:', t):
                riga = f'<p class="tratta-dato">{b["html"]}</p>'
                if t.startswith('Tempo'):
                    if tratta_ha_tempo:
                        # Riga fuori posto nel documento: appartiene alla tratta successiva.
                        sospesi.append(riga)
                        continue
                    tratta_ha_tempo = True
                elif sospesi:
                    sospesi.append(riga)
                    continue
                p.aggiungi(riga)
                continue
            inizio = b['html'][:80]
            if inizio.startswith('<span data-hl="TURQUOISE">') or inizio.startswith('<span data-hl="GREEN">'):
                if sospesi:
                    for s in sospesi:
                        p.aggiungi(s)
                    sospesi = []
                    tratta_ha_tempo = True
                tipo = 'deviazione' if 'TURQUOISE' in inizio else 'variante'
                corpo = re.sub(
                    r'^<span data-hl="(?:TURQUOISE|GREEN)">(.*?)</span>',
                    lambda m: f'<span class="percorso-alt__titolo">{m.group(1)}</span>',
                    b['html'], count=1, flags=re.S)
                p.aggiungi(f'<div class="percorso-alt percorso-alt--{tipo}"><p>{corpo}</p></div>')
                continue
            elementi_generici(p, b, None)
            continue

        # --- 3.f: strutture --------------------------------------------
        if modo == 'alberghi':
            if b['elenco']:
                p.aggiungi(f'<h3 class="struttura">{re.sub(r"</?strong>", "", b["html"])}</h3>')
            else:
                p.aggiungi(f'<p>{b["html"]}</p>')
            continue

        # --- 3.g: avvertenze --------------------------------------------
        if modo == 'avvertenze' and b['elenco'] and b['grassetto']:
            titolo = pulisci_titolo(b['html'])
            p.aggiungi(f'<h2 id="{slug(titolo)}">{titolo}</h2>')
            continue

        elementi_generici(p, b, None)

    def trasforma(nome, h):
        if nome != 'organizzare-il-viaggio':
            return h
        # Icone dei segnavia solo nella descrizione dettagliata.
        inizio = h.index('id="descrizione-dettagliata"')
        fine = h.index('id="mappa-gpx"')
        return h[:inizio] + segnavia.sostituisci(h[inizio:fine]) + h[fine:]

    scrivi('fare-il-cammino', pagine, trasforma)


# ---------------------------------------------------------------------------
# 4. Approfondimenti
# ---------------------------------------------------------------------------
PAGINE_APPRO = {
    'Le incerte origini dell’Antica Via del Cifalco': 'origini',
    'Cenni storici sul territorio': 'cenni-storici',
    'La civiltà rurale sulle Vie del Sale': 'civilta-rurale',
    'Natura e paesaggio, dai monti al mare': 'natura-e-paesaggio',
    'Le tappe della Via del Cifalco tra storia, natura e cultura': 'tappe',
    'Riferimenti bibliografici': 'bibliografia',
}
SOTTO_APPRO = {
    'L’Appennino “continentale”': 'appennino-continentale',
    'L’Appennino “marittimo”': 'appennino-marittimo',
    'Il Parco del M. di Portofino: l’arrivo a Portofino mare e la fine della Via del Cifalco': 'parco-portofino',
}

# Aneddoti (testo evidenziato in verde): titolo del riquadro e paragrafo
# accanto al quale va collocato (il riquadro precede quel paragrafo).
ANEDDOTI = [
    ('Fontana del Figliolo', 'Posto che si consiglia di attaccare la cima del Montarlone'),
    ('Sotto il Monte Gifarco, 1944', 'Le aspettative non saranno deluse.'),
    ('Da Casoni a Orezzoli, estate 1924', 'Al Valico del Fregarolo'),
    ('Barbagelata e il bandito Billo', 'Delle suggestioni relative all’antico insediamento'),
    ('Il prete di Roccatagliata e le patate', 'Prima di scendere verso il fondovalle'),
    ('San Fruttuoso e il naufragio del Croesus', 'Anche a San Fruttuoso, finirono per piombare i Doria'),
]

# Testo sottolineato -> collegamento. Più occorrenze dello stesso testo
# possono avere destinazioni diverse (elenco, in ordine di apparizione).
LINK_SOTTOLINEATI = {
    'b. Cenni storici sul territorio': ['/approfondimenti/cenni-storici'],
    'sezione bibliografica': ['/approfondimenti/bibliografia'],
    'cenni storici sul territorio': ['/approfondimenti/cenni-storici'],
    'Le incerte origini dell’Antica Via del Cifalco': ['/approfondimenti/origini'],
    'Altri cammini': ['/intorno/altri-cammini'],
    'sopra': ['/approfondimenti/cenni-storici#la-congiura-dei-fieschi'],
    'Fare il Cammino': ['/fare-il-cammino/organizzare-il-viaggio#tratta-4'],
    'Natura e paesaggio, dai monti al mare': [
        '/approfondimenti/natura-e-paesaggio#fauna',
        '/approfondimenti/natura-e-paesaggio#appennino-marittimo',
    ],
    'Cenni storici sul territorio': ['/approfondimenti/cenni-storici'],
    'La civiltà rurale sulle Vie del Sale': ['/approfondimenti/civilta-rurale#l-ardesia'],
    'Organizzare il viaggio: tappe, deviazioni e mappe': ['/fare-il-cammino/organizzare-il-viaggio#tratta-8'],
}


def collega_sottolineati(h, contatori):
    def sost(m):
        testo = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        destinazioni = LINK_SOTTOLINEATI.get(testo)
        if not destinazioni:
            print('  ! sottolineato senza destinazione:', testo)
            return m.group(1)
        i = contatori.get(testo, 0)
        contatori[testo] = i + 1
        return f'<a href="{destinazioni[min(i, len(destinazioni) - 1)]}">{m.group(1)}</a>'
    return re.sub(r'<u>(.*?)</u>', sost, h, flags=re.S)


def approfondimenti():
    bl = blocchi(os.path.join(ORIGINALI, '4. Approfondimenti.docx'))

    # 1) Togli gli aneddoti dal testo base.
    gruppi, base = [], []
    for b in bl:
        if b['verde']:
            if base and base[-1] == 'ANEDDOTO':
                gruppi[-1].append(b)
            else:
                gruppi.append([b])
                base.append('ANEDDOTO')
        else:
            base.append(b)
    base = [b for b in base if b != 'ANEDDOTO']
    assert len(gruppi) == len(ANEDDOTI), f'aneddoti trovati: {len(gruppi)}'
    da_inserire = {}
    for i, ((titolo, ancora), gruppo) in enumerate(zip(ANEDDOTI, gruppi)):
        lato = 'destra' if i % 2 == 0 else 'sinistra'
        corpo = ''.join(f'<p>{togli_hl(g["html"])}</p>' for g in gruppo)
        da_inserire[ancora] = (
            f'<aside class="aneddoto aneddoto--{lato}" aria-label="Aneddoto: {htmlmod.escape(titolo)}">'
            f'<p class="aneddoto__occhiello">Aneddoti e leggende</p>'
            f'<p class="aneddoto__titolo">{titolo}</p>{corpo}</aside>'
        )

    pagine = {}
    p = None
    contatori = {}
    for b in base[1:]:
        t = senza_lettera(b['testo'])
        if t in PAGINE_APPRO:
            p = pagine.setdefault(PAGINE_APPRO[t], Pagina(PAGINE_APPRO[t]))
            continue
        if b['elenco'] and t in SOTTO_APPRO:
            p.aggiungi(f'<h2 id="{SOTTO_APPRO[t]}">{pulisci_titolo(b["html"])}</h2>')
            continue
        # Titoletti: paragrafi brevi tutti in grassetto.
        if b['grassetto'] and not b['elenco'] and len(t) < 110:
            titolo = pulisci_titolo(b['html'])
            livello = 'h3' if p.nome == 'natura-e-paesaggio' else 'h2'
            p.aggiungi(f'<{livello} id="{slug(titolo)}">{titolo}</{livello}>')
            continue
        for ancora, riquadro in list(da_inserire.items()):
            if b['testo'].startswith(ancora):
                p.aggiungi(riquadro)
                del da_inserire[ancora]
        if b['testo'].startswith('Qui occorre aprire una parentesi'):
            p.aggiungi(f'<p id="la-congiura-dei-fieschi">{b["html"]}</p>')
            continue
        elementi_generici(p, b, None)
        # Foto d'archivio nelle tappe.
        if b['testo'].startswith('A proposito, nell’arco della sua storia, qui di ponti'):
            p.aggiungi(figura('/immagini/ponte-organasco-inizio-900.jpg',
                              'Il vecchio ponte ad arco sul Trebbia a Ponte Organasco, con il tempietto sulla rupe',
                              'Ponte Organasco all’inizio del ’900', 'Foto di Guido Ferretti'))
        if b['testo'].startswith('Il primo punto di interesse dopo il Valico è senza dubbio il Lago della Nave'):
            p.aggiungi(figura('/immagini/abbeverata-lago-della-nave-anni-50.jpg',
                              'Mucche al pascolo che si abbeverano nel Lago della Nave',
                              'Abbeverata al Lago della Nave, anni ’50', 'Foto di Guido Ferretti'))
    assert not da_inserire, f'aneddoti non collocati: {list(da_inserire)}'

    scrivi('approfondimenti', pagine, lambda nome, h: collega_sottolineati(h, contatori))


# ---------------------------------------------------------------------------
# 5c. Altri cammini
# ---------------------------------------------------------------------------
def altri_cammini():
    bl = blocchi(os.path.join(ORIGINALI, '5c. Altri cammini.docx'))
    p = Pagina('altri-cammini')
    for b in bl[1:]:
        elementi_generici(p, b, None)
    scrivi('intorno', {'altri-cammini': p})


# ---------------------------------------------------------------------------
# 1. Home
# ---------------------------------------------------------------------------
def home():
    bl = blocchi(os.path.join(ORIGINALI, '1. Home page.docx'))
    citazioni, in_breve, novita = [], Pagina('home-in-breve'), Pagina('home-novita')
    parte = 'citazioni'
    for b in bl[1:]:
        t = b['testo']
        if t.startswith('L’Antica Via del Cifalco in breve'):
            parte = 'breve'
            continue
        if t == 'Novità':
            parte = 'novita'
            continue
        if parte == 'citazioni':
            if t.startswith('('):
                citazioni[-1]['fonte'] = t.strip('()')
            else:
                testo = re.sub(r'</?(?:em|strong)>', '', b['html']).strip()
                citazioni.append({'testo': testo})
        elif parte == 'breve':
            in_breve.li(b['html'])
        else:
            novita.li(b['html'])
    c = Pagina('home-citazioni')
    for i, cit in enumerate(citazioni):
        autore, _, opera = cit['fonte'].partition(',')
        c.aggiungi(
            f'<figure class="citazione{" citazione--principale" if i == 0 else ""}">'
            f'<blockquote><p>{cit["testo"]}</p></blockquote>'
            f'<figcaption>{autore.strip()}, <cite>{opera.strip().strip("“”")}</cite></figcaption></figure>'
        )
    scrivi('home', {'citazioni': c, 'in-breve': in_breve, 'novita': novita})


if __name__ == '__main__':
    home()
    chi_siamo()
    fare_il_cammino()
    approfondimenti()
    altri_cammini()
