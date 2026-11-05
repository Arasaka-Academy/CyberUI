"""Vendor the reviewed, MIT/OFL-licensed reference at a fixed revision.

Requires an authenticated GitHub CLI. This does not execute upstream code.
"""
import base64
import concurrent.futures
import hashlib
import json
from pathlib import Path
import subprocess

ROOT = Path(__file__).resolve().parents[1]
REF = 'a964738a6611cbec01094746a314c21528f1247b'
REPO = 'EmirErtorer/CyberUI.koplugin'

def api(endpoint):
    result = subprocess.run(['gh', 'api', f'repos/{REPO}/{endpoint}'],
                            capture_output=True, text=True, check=True, timeout=45)
    return json.loads(result.stdout)

def main():
    tree = api(f'git/trees/{REF}?recursive=1')['tree']
    selected = [e['path'] for e in tree if e['type'] == 'blob' and (
        e['path'].startswith(('fonts/', 'icons/')) or
        e['path'] in ('LICENSE', 'NOTICE.md', 'assets/cyberui-title.svg'))]
    icons = {}
    inventory = []
    def fetch(path):
        content = api(f'contents/{path}?ref={REF}')
        return path, base64.b64decode(content['content'])
    with concurrent.futures.ThreadPoolExecutor(max_workers=6) as pool:
        for path, data in pool.map(fetch, selected):
            if path.startswith('fonts/'):
                dest = ROOT / 'public' / path
            elif path.startswith('icons/'):
                dest = ROOT / 'public' / path
                text = data.decode()
                inner = text[text.index('>') + 1:text.rindex('</svg>')]
                icons[Path(path).stem] = inner.replace('fill="#000"', 'fill="currentColor"').replace('fill="black"', 'fill="currentColor"').replace('fill="#000000"', 'fill="currentColor"').replace('stroke="#000000"', 'stroke="currentColor"').replace('stroke="#000"', 'stroke="currentColor"')
            elif path.startswith('assets/'):
                dest = ROOT / 'public' / 'brand' / Path(path).name
            else:
                dest = ROOT / 'licenses' / ('upstream-' + Path(path).name)
            dest.parent.mkdir(parents=True, exist_ok=True)
            dest.write_bytes(data)
            inventory.append({'source': path, 'sha256': hashlib.sha256(data).hexdigest()})
    icon_dest = ROOT / 'packages/react/src/icons.generated.ts'
    icon_dest.parent.mkdir(parents=True, exist_ok=True)
    icon_dest.write_text('// Generated from upstream MIT SVGs by scripts/vendor-upstream.py.\nexport const iconPaths: Record<string, string> = ' + json.dumps(icons, indent=2) + ';\n')
    reference = ROOT / 'public/reference'
    reference.mkdir(parents=True, exist_ok=True)
    cache = Path('/var/folders/l4/dv8b_8z91g5704dmdtd9p59m0000gn/T/cyberui-source-reference-jlo_n8jq')
    screenshots = [e['path'] for e in tree if e['type'] == 'blob' and e['path'].startswith('assets/screenshots/')]
    for path in screenshots:
        cached = cache / Path(path).name
        data = cached.read_bytes() if cached.exists() else fetch(path)[1]
        (reference / Path(path).name).write_bytes(data)
        inventory.append({'source': path, 'sha256': hashlib.sha256(data).hexdigest()})
    (ROOT / 'licenses/upstream-manifest.json').write_text(json.dumps({'repository': REPO, 'revision': REF, 'files': inventory}, indent=2) + '\n')
    rules = []
    for font in sorted((ROOT / 'public/fonts').glob('*.ttf')):
        family = font.stem.rsplit('-', 1)[0]
        weight = 700 if 'Bold' in font.stem and 'SemiBold' not in font.stem else 600 if 'SemiBold' in font.stem else 500 if 'Medium' in font.stem else 400
        rules.append(f"@font-face{{font-family:'{family}';font-style:normal;font-weight:{weight};font-display:swap;src:url('./fonts/{font.name}') format('truetype');}}")
    (ROOT / 'public/fonts.css').write_text('\n'.join(rules) + '\n')
    print(f'Vendored {len(selected)} licensed assets and {len(screenshots)} references at {REF}.')

if __name__ == '__main__':
    main()
