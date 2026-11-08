"""
Raffigurazioni dei segnavia CAI e FIE, in SVG.

I segnavia FIE sono forme geometriche dipinte su fondo bianco (gialle nel
tratto «continentale», rosse in quello «marittimo»); quelli CAI sono la
bandierina bianco-rossa con il numero del sentiero.

sostituisci(html) cambia nel testo le diciture tra virgolette (es.
“tre pallini gialli”) e i numeri CAI (es. CAI 177) con l'icona.
"""
import re

GIALLO = '#E3B505'
ROSSO = '#C8102E'


def _cerchio(cx, colore, pieno=True, r=4.2):
    if pieno:
        return f'<circle cx="{cx}" cy="11" r="{r}" fill="{colore}"/>'
    return f'<circle cx="{cx}" cy="11" r="{r - 0.9}" fill="none" stroke="{colore}" stroke-width="1.8"/>'


def _quadrato(cx, colore, pieno=True, l=8):
    x, y = cx - l / 2, 11 - l / 2
    if pieno:
        return f'<rect x="{x}" y="{y}" width="{l}" height="{l}" fill="{colore}"/>'
    return f'<rect x="{x + 0.9}" y="{y + 0.9}" width="{l - 1.8}" height="{l - 1.8}" fill="none" stroke="{colore}" stroke-width="1.8"/>'


def _rombo(cx, colore, pieno=True, r=5.2):
    if pieno:
        return f'<path d="M{cx} {11 - r} L{cx + r} 11 L{cx} {11 + r} L{cx - r} 11 Z" fill="{colore}"/>'
    r -= 0.9
    return f'<path d="M{cx} {11 - r} L{cx + r} 11 L{cx} {11 + r} L{cx - r} 11 Z" fill="none" stroke="{colore}" stroke-width="1.8"/>'


def _triangolo(cx, colore, pieno=True, l=9.5):
    h = l * 0.87
    y0, y1 = 11 - h / 2, 11 + h / 2
    if pieno:
        return f'<path d="M{cx} {y0} L{cx + l / 2} {y1} L{cx - l / 2} {y1} Z" fill="{colore}"/>'
    return f'<path d="M{cx} {y0 + 1.2} L{cx + l / 2 - 1} {y1 - 0.7} L{cx - l / 2 + 1} {y1 - 0.7} Z" fill="none" stroke="{colore}" stroke-width="1.7" stroke-linejoin="round"/>'


def _barra(cx, colore):
    return f'<rect x="{cx - 5}" y="9" width="10" height="4" fill="{colore}"/>'


def _croce(cx, colore):
    return f'<path d="M{cx - 4.5} 11 H{cx + 4.5} M{cx} 6.5 V15.5" stroke="{colore}" stroke-width="2.6"/>'


def _t(cx, colore):
    return f'<path d="M{cx - 4.5} 7 H{cx + 4.5} M{cx} 7 V15.5" stroke="{colore}" stroke-width="2.6"/>'


def _fie(forme):
    """Targhetta bianca con le forme affiancate."""
    n = len(forme)
    passo = 11
    larghezza = max(22, 8 + n * passo)
    inizio = larghezza / 2 - (n - 1) * passo / 2
    corpo = ''.join(f(inizio + i * passo) for i, f in enumerate(forme))
    return (
        f'<svg viewBox="0 0 {larghezza} 22" width="{larghezza * 1.25:.0f}" height="27.5" aria-hidden="true" focusable="false">'
        f'<rect x="0.5" y="0.5" width="{larghezza - 1}" height="21" rx="2.5" fill="#fff" stroke="#9a978d" stroke-width="1"/>'
        f'{corpo}</svg>'
    )


def _cai(numero):
    return (
        '<svg viewBox="0 0 38 22" width="47.5" height="27.5" aria-hidden="true" focusable="false">'
        f'<rect x="0.5" y="0.5" width="37" height="21" rx="2" fill="#fff" stroke="#9a978d"/>'
        f'<rect x="1" y="1" width="36" height="6" fill="{ROSSO}"/>'
        f'<rect x="1" y="15" width="36" height="6" fill="{ROSSO}"/>'
        f'<text x="19" y="14.1" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" '
        f'font-size="7.6" font-weight="700" fill="#222">{numero}</text></svg>'
    )


def _g(colore, forma, pieno=True):
    return lambda cx: forma(cx, colore, pieno)


# Dicitura (senza virgolette, minuscolo) -> forme
CATALOGO = {
    'tre pallini gialli': [_g(GIALLO, _cerchio)] * 3,
    'tre pallini gialli pieni': [_g(GIALLO, _cerchio)] * 3,
    'pallino giallo pieno': [_g(GIALLO, _cerchio)],
    'pallino giallo vuoto': [_g(GIALLO, _cerchio, False)],
    'doppio triangolo giallo': [_g(GIALLO, _triangolo)] * 2,
    'quadrato giallo pieno': [_g(GIALLO, _quadrato)],
    'rombo giallo pieno': [_g(GIALLO, _rombo)],
    'tre pallini rossi pieni': [_g(ROSSO, _cerchio)] * 3,
    'triangolo rosso pieno': [_g(ROSSO, _triangolo)],
    'triangolo rosso vuoto': [_g(ROSSO, _triangolo, False)],
    'rombo rosso vuoto': [_g(ROSSO, _rombo, False)],
    'barra rossa e cerchio rosso': [lambda cx: _barra(cx, ROSSO), _g(ROSSO, _cerchio)],
    'due cerchi rossi vuoti': [_g(ROSSO, _cerchio, False)] * 2,
    'due cerchi vuoti': [_g(ROSSO, _cerchio, False)] * 2,
    'cerchio rosso vuoto': [_g(ROSSO, _cerchio, False)],
    'quadrato rosso pieno': [_g(ROSSO, _quadrato)],
    'due quadrati rossi pieni': [_g(ROSSO, _quadrato)] * 2,
    'due cerchi rossi pieni': [_g(ROSSO, _cerchio)] * 2,
    'due rombi rossi pieni': [_g(ROSSO, _rombo)] * 2,
}


def icona(nome_leggibile, svg):
    return (
        f'<span class="segnavia" role="img" aria-label="Segnavia {nome_leggibile}" '
        f'title="{nome_leggibile}">{svg}</span>'
    )


def sostituisci(html):
    # 1) Diciture FIE tra virgolette: “tre pallini gialli”
    def fie(m):
        dicitura = re.sub(r'<[^>]+>', '', m.group(1)).strip()
        chiave = dicitura.lower()
        if chiave not in CATALOGO:
            return m.group(0)
        return icona(dicitura, _fie(CATALOGO[chiave]))

    html = re.sub(r'“([^”]{3,40})”', fie, html)

    # 2) «“T” rossa»
    html = re.sub(r'“T” rossa', icona('T rossa', _fie([lambda cx: _t(cx, ROSSO)])), html)

    # 3) Numeri CAI: «CAI 177», «CAI 177 e 179», «177 CAI», «CAI 179, CAI 129»
    tag = r'(?:</?strong>)?'

    def cai_elenco(m):
        numeri = re.findall(r'\d{3}', m.group(0))
        separatori = re.findall(r'(\s*(?:,|e)\s*)', m.group('resto') or '')
        out = icona(f'CAI {numeri[0]}', _cai(numeri[0]))
        for sep, n in zip(separatori, numeri[1:]):
            out += sep + icona(f'CAI {n}', _cai(n))
        return out

    html = re.sub(
        rf'{tag}CAI\s*{tag}\s*(\d{{3}})(?P<resto>(?:\s*(?:,|e)\s*\d{{3}}\b)*)',
        cai_elenco, html)
    html = re.sub(r'\b(\d{3}) CAI\b', lambda m: icona(f'CAI {m.group(1)}', _cai(m.group(1))), html)
    # «sentiero 179» (numero CAI senza la sigla)
    html = re.sub(r'([Ss]entiero )(\d{3})\b',
                  lambda m: m.group(1) + icona(f'CAI {m.group(2)}', _cai(m.group(2))), html)
    return html


def legenda_html():
    """Piccola tavola dei segnavia per la legenda."""
    voci = [
        ('Sentiero CAI (bandierina bianco-rossa con il numero)', _cai('177')),
        ('Segnavia FIE del tratto «continentale» (forme gialle)', _fie(CATALOGO['pallino giallo pieno'])),
        ('Segnavia FIE del tratto «marittimo» (forme rosse)', _fie(CATALOGO['due cerchi rossi vuoti'])),
    ]
    return voci
