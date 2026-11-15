"""
Converte le interviste di «Scritti d'autore» (scripts/docx/originali/scritti/)
nei frammenti HTML src/testi/intorno/scritti-d-autore/<nome>.html.

Uso: python3 scripts/docx/interviste.py
Riscrive solo i file delle interviste (non tocca gli altri testi).
"""
import html as htmlmod
import os
import re
import sys

sys.path.insert(0, os.path.dirname(__file__))
from estrai import blocchi  # noqa: E402
from converti import intestazione  # noqa: E402

QUI = os.path.dirname(os.path.abspath(__file__))
ORIGINI = os.path.join(QUI, 'originali', 'scritti')
USCITA = os.path.join(QUI, '..', '..', 'src', 'testi', 'intorno', 'scritti-d-autore')

INTERVISTE = {
    'sandro-sbarbaro': 'Intervista Sandro Sbarbaro.docx',
    'dino-magistrati': 'Intervista Dino Magistrati.docx',
}


def converti(nome, file):
    bl = blocchi(os.path.join(ORIGINI, file))
    parti = []
    for i, b in enumerate(bl[1:]):  # il primo paragrafo è il titolo (sta nel menu)
        h = b['html'].replace('\n', '<br>')
        if i == 0:
            # Presentazione: grassetto-corsivo nell'originale
            parti.append(f'<p class="intervista__intro">{re.sub(r"</?strong>", "", h)}</p>')
        elif b['testo'].strip() == '***':
            parti.append('<hr class="divisore">')
        elif b['stile'] == 'detti_popolari':
            pulito = re.sub(r'</?(?:em|strong)>', '', h)
            if '<br>' not in pulito:
                parti.append(f'<h3 class="poesia__titolo">{pulito}</h3>')
            else:
                parti.append(f'<p class="poesia">{pulito}</p>')
        elif b['grassetto']:
            parti.append(f'<p class="intervista__domanda">{h}</p>')
        else:
            parti.append(f'<p>{h}</p>')
    os.makedirs(USCITA, exist_ok=True)
    with open(os.path.join(USCITA, f'{nome}.html'), 'w', encoding='utf-8') as f:
        f.write(intestazione() + '\n'.join(parti) + '\n')
    print('scritto', nome, '| titolo:', bl[0]['testo'])


if __name__ == '__main__':
    for nome, file in INTERVISTE.items():
        converti(nome, file)
