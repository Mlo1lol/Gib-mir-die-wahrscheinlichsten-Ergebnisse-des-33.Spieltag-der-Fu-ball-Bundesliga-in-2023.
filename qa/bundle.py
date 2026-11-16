#!/usr/bin/env python3
"""Baut aus website/ und tietmann/ je eine eigenständige HTML-Datei:  python3 qa/bundle.py"""
import base64, re, os
os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..'))
MIME = {'woff2': 'font/woff2', 'webp': 'image/webp', 'svg': 'image/svg+xml', 'jpg': 'image/jpeg', 'png': 'image/png'}
def b64(path): return f"data:{MIME[path.rsplit('.', 1)[1]]};base64," + base64.b64encode(open(path, 'rb').read()).decode()
def inline_css(css, base): return re.sub(r'url\("((?:assets/|fonts/)[^"]+)"\)', lambda m: f'url("{b64(os.path.join(base, m.group(1)))}")', css)
def bundle(root, out, extra=None):
    html = open(root + 'index.html').read()
    html = re.sub(r'\s*<link rel="preload"[^>]*>', '', html)
    html = re.sub(r'<link rel="stylesheet" href="(assets/[^"]+)">', lambda m: '<style>\n' + inline_css(open(root + m.group(1)).read(), os.path.dirname(root + m.group(1))) + '\n</style>', html)
    html = inline_css(html, root)
    html = re.sub(r'<script src="(assets/[^"]+)"( defer)?></script>', lambda m: '<script>\n' + open(root + m.group(1)).read().replace('</script>', '<\\/script>') + '\n</script>', html)
    html = re.sub(r'\s(srcset|imagesrcset|imagesizes|sizes)="[^"]*"', '', html)
    def img(m):
        src = m.group(1); mm = re.match(r'assets/img/(.+?)-(\d+)\.webp', src)
        if mm:
            for w in ('1920', '1280', '720'):
                c = f'{root}assets/img/{mm.group(1)}-{w}.webp'
                if os.path.exists(c): return f'src="{b64(c)}"'
        return f'src="{b64(root + src)}"'
    html = re.sub(r'src="(assets/img/[^"]+)"', img, html)
    html = re.sub(r'href="(assets/favicon\.svg)"', lambda m: f'href="{b64(root + m.group(1))}"', html)
    html = re.sub(r'<meta property="og:image"[^>]*>', '', html)
    if extra: html = extra(html)
    left = re.findall(r'(?:src|href)="(assets/[^"]+)', html); assert not left, left[:5]
    open(out, 'w').write(html); print(out, round(len(html) / 1048576, 2), 'MB')
def with_legal(root):
    def fn(html):
        def legal(f, id):
            t = open(root + f).read(); body = t[t.index('<div class="wrap">\n', t.index('<main')) + 19:t.index('  </div>\n</main>')]
            body = body.replace('<h1>', '<h2 class="legal-h1">', 1).replace('</h1>', '</h2>', 1)
            return f'\n  <section class="legal legal-page legal-inline" id="{id}">\n  <div class="wrap">\n{body}  </div>\n  </section>\n'
        html = html.replace('\n</main>', legal('impressum.html', 'impressum') + legal('datenschutz.html', 'datenschutz') + '\n</main>')
        html = html.replace('href="impressum.html"', 'href="#impressum"').replace('href="datenschutz.html"', 'href="#datenschutz"')
        return html.replace('</head>', '<style>.legal-inline{padding:clamp(72px,9vw,120px) 0;border-top:1px solid rgba(128,128,128,.3)}.legal-inline .legal-h1{font-size:clamp(2.4rem,5vw,3.6rem);margin:0 0 .4em}.legal-inline h2:not(.legal-h1){font-size:1.5rem;margin:44px 0 10px}.legal-inline p,.legal-inline ul,.legal-inline address{max-width:68ch}.legal-inline address{font-style:normal;margin-bottom:1em}</style>\n</head>', 1)
    return fn
bundle('website/', 'koop-website-komplett.html', with_legal('website/'))
bundle('tietmann/', 'tietmann-website-komplett.html', with_legal('tietmann/'))
