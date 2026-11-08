"""Tiny SVG helpers: consistent boxes, groups, arrows.

Themed by CSS variables so the same SVG reads well in both places the notes
are shown: Obsidian (--text-normal, --interactive-accent, ...) and the portal's
TechDocs (mkdocs-material's --md-* variables, set from the portal theme).
Each color tries Obsidian's variable, then TechDocs', then a light-theme default.
"""
FG = "var(--text-normal, var(--md-default-fg-color, #222))"
MUTED = "var(--text-muted, var(--md-default-fg-color--light, #666))"
ACC = "var(--interactive-accent, var(--md-accent-fg-color, var(--md-primary-fg-color, #3b82f6)))"
BG = "var(--background-primary, var(--md-default-bg-color, #ffffff))"
WARN = []

def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")

class D:
    def __init__(self, did, w, h, aria):
        self.id, self.w, self.h, self.aria, self.parts = did, w, h, aria, []

    def add(self, s): self.parts.append(s)

    def box(self, x, y, w, h, title, sub=None, accent=False, dashed=False, muted=False, sub2=None):
        if len(title) * 7.4 > w - 10: WARN.append(f"{self.id}: title too wide: {title}")
        for s in (sub, sub2):
            if s and len(s) * 6.1 > w - 8: WARN.append(f"{self.id}: sub too wide: {s}")
        st = (f'style="stroke:{ACC};fill:{ACC};fill-opacity:0.10;stroke-width:2"' if accent else
              'stroke="currentColor" stroke-opacity="0.55" fill="currentColor" fill-opacity="0.05"')
        dash = ' stroke-dasharray="5 4"' if dashed else ''
        op = ' opacity="0.55"' if muted else ''
        self.add(f'<g{op}><rect x="{x}" y="{y}" width="{w}" height="{h}" rx="7" {st}{dash}/>')
        cx = x + w / 2
        lines = [s for s in (sub, sub2) if s]
        ty = y + h / 2 + 4.5 - 7 * len(lines)
        self.add(f'<text x="{cx}" y="{ty}" text-anchor="middle" font-size="13" font-weight="600" fill="currentColor">{esc(title)}</text>')
        for i, s in enumerate(lines):
            self.add(f'<text x="{cx}" y="{ty + 15 * (i + 1)}" text-anchor="middle" font-size="11" fill="currentColor" fill-opacity="0.72">{esc(s)}</text>')
        self.add('</g>')

    def group(self, x, y, w, h, label, accent=False):
        st = f'style="stroke:{ACC}"' if accent else 'stroke="currentColor" stroke-opacity="0.35"'
        self.add(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="9" fill="none" {st} stroke-dasharray="6 4"/>')
        fill = f'style="fill:{ACC}"' if accent else 'fill="currentColor" fill-opacity="0.65"'
        self.add(f'<text x="{x + 12}" y="{y + 17}" font-size="10.5" font-weight="600" letter-spacing="0.06em" {fill}>{esc(label.upper())}</text>')

    def text(self, x, y, s, size=11, anchor="middle", muted=True, accent=False, bold=False, halo=True):
        fill = f'style="fill:{ACC}' if accent else 'style="fill:currentColor'
        fill += (';' + f'paint-order:stroke;stroke:{BG};stroke-width:4px;stroke-linejoin:round' if halo else '') + '"'
        op = ' fill-opacity="0.75"' if muted and not accent else ''
        b = ' font-weight="600"' if bold else ''
        self.add(f'<text x="{x}" y="{y}" text-anchor="{anchor}" font-size="{size}"{b}{op} {fill}>{esc(s)}</text>')

    def arrow(self, pts, label=None, at=None, accent=False, dashed=False, anchor="middle", muted=False, head=True):
        p = " ".join(f"{a},{b}" for a, b in pts)
        st = f'style="stroke:{ACC};stroke-width:2"' if accent else f'stroke="currentColor" stroke-opacity="{0.4 if muted else 0.7}" stroke-width="1.5"'
        dash = ' stroke-dasharray="5 4"' if dashed else ''
        m = f' marker-end="url(#{self.id}-{"acc" if accent else "arr"})"' if head else ''
        self.add(f'<polyline points="{p}" fill="none" {st}{dash}{m}/>')
        if label:
            x, y = at
            self.text(x, y, label, accent=accent, anchor=anchor)

    def step(self, x, y, n):
        self.add(f'<circle cx="{x}" cy="{y}" r="9" style="fill:{ACC}"/>'
                 f'<text x="{x}" y="{y + 4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">{n}</text>')

    def render(self, caption):
        defs = (f'<defs>'
                f'<marker id="{self.id}-arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="currentColor" fill-opacity="0.8"/></marker>'
                f'<marker id="{self.id}-acc" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" style="fill:{ACC}"/></marker>'
                f'</defs>')
        svg = (f'<svg viewBox="0 0 {self.w} {self.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="{esc(self.aria)}" '
               f'style="display:block;width:100%;height:auto;max-width:{self.w}px;font-family:var(--font-interface, system-ui, sans-serif);color:{FG}">'
               + defs + "".join(self.parts) + '</svg>')
        # Full width: TechDocs' theme otherwise shrinks a figure to its caption
        return (f'<figure style="margin:1.2em 0;display:block;width:100%;max-width:{self.w}px">{svg}'
                f'<figcaption style="font-size:0.85em;color:{MUTED};margin-top:0.4em">{esc(caption)}</figcaption></figure>')
