"""
Legge un .docx e lo trasforma in un elenco di «blocchi» (paragrafi e voci
di elenco) con l'HTML dei testi già pronto: grassetto, corsivo, link,
evidenziazioni (giallo = segnaposto, verde = aneddoto, ecc.).

Usato da converti.py. Serve python-docx (pip install python-docx).
"""
import html
import re
import docx
from docx.oxml.ns import qn
from docx.text.hyperlink import Hyperlink

# Correzioni di indirizzi rotti nei documenti originali.
LINK_CORRETTI = {
    'dall’azienda%20di%20trasporti%20AMT%20Genova': 'https://www.amt.genova.it/',
    'dall’azienda di trasporti AMT Genova': 'https://www.amt.genova.it/',
}


def _formato(run):
    hl = run.font.highlight_color
    hl = str(hl).split('.')[-1].split(' ')[0] if hl is not None else None
    return (
        bool(run.bold),
        bool(run.italic),
        bool(run.font.underline),
        hl,
    )


def _segmenti(paragrafo):
    """[(testo, (grassetto, corsivo, sottolineato, evidenziazione), href)]"""
    out = []
    for parte in paragrafo.iter_inner_content():
        if isinstance(parte, Hyperlink):
            href = parte.address or ''
            href = LINK_CORRETTI.get(href, href)
            for r in parte.runs:
                if r.text:
                    out.append((r.text, _formato(r), href))
        else:
            if parte.text:
                out.append((parte.text, _formato(parte), None))
    # Unisci i segmenti consecutivi con lo stesso formato.
    uniti = []
    for t, f, h in out:
        if uniti and uniti[-1][1] == f and uniti[-1][2] == h:
            uniti[-1] = (uniti[-1][0] + t, f, h)
        else:
            uniti.append((t, f, h))
    return uniti


def _html_segmenti(segmenti):
    """HTML del paragrafo. Le evidenziazioni diventano marcatori:
    giallo -> <mark class="segnaposto">, sottolineato -> <u> (convertito
    in link più avanti), gli altri colori restano come attributo data."""
    pezzi = []
    for testo, (b, i, u, hl), href in segmenti:
        s = html.escape(testo, quote=False)
        # Gli spazi agli estremi restano fuori dai tag.
        m = re.match(r'^(\s*)(.*?)(\s*)$', s, re.S)
        pre, s, post = m.groups()
        if s:
            if i:
                s = f'<em>{s}</em>'
            if b:
                s = f'<strong>{s}</strong>'
            if u and not href:
                s = f'<u>{s}</u>'
            if href:
                esterno = href.startswith('http')
                attr = ' target="_blank" rel="noopener"' if esterno else ''
                s = f'<a href="{html.escape(href)}"{attr}>{s}</a>'
            if hl:
                s = f'<span data-hl="{hl}">{s}</span>'
        pezzi.append(pre + s + post)
    h = ''.join(pezzi)
    # Ripulisci tag adiacenti identici (es. </strong><strong>).
    for tag in ('strong', 'em', 'u'):
        h = re.sub(rf'</{tag}>(\s*)<{tag}>', r'\1', h)
    return _unisci_hl(h)


def _unisci_hl(h):
    # Unisce <span data-hl="X">a</span><span data-hl="X">b</span>.
    prec = None
    while prec != h:
        prec = h
        h = re.sub(r'<span data-hl="([A-Z_]+)">((?:(?!<span data-hl).)*?)</span>(\s*)<span data-hl="\1">',
                   r'<span data-hl="\1">\2\3', h, flags=re.S)
    return h


def blocchi(percorso):
    d = docx.Document(percorso)
    out = []
    for p in d.paragraphs:
        segmenti = _segmenti(p)
        testo = ''.join(t for t, _, _ in segmenti).strip()
        if not testo:
            continue
        num = p._p.find('.//' + qn('w:numPr'))
        tutto_grassetto = all(f[0] for t, f, _ in segmenti if t.strip())
        colori = {f[3] for t, f, _ in segmenti if t.strip() and f[3]}
        out.append({
            'stile': p.style.name,
            'testo': re.sub(r'\s+', ' ', testo),
            'html': _html_segmenti(segmenti).strip(),
            'elenco': num is not None,
            'grassetto': tutto_grassetto,
            'colori': colori,
            # Aneddoto: quasi tutto il paragrafo è evidenziato in verde
            # (può contenere un link non evidenziato).
            'verde': sum(len(t) for t, f, _ in segmenti if f[3] == 'BRIGHT_GREEN')
            > 0.7 * max(1, sum(len(t) for t, _, _ in segmenti)),
        })
    return out
