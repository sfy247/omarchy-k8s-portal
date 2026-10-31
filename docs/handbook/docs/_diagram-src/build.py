"""Regenerate the SVG diagrams embedded in the kindell247 notes.

Each diagram lives in diagrams.py. Notes contain them inline as <figure><svg id-prefix...>;
this script swaps each <figure> whose SVG uses a known id prefix for a fresh render.
Run:  python3 build.py
"""
import re, sys, glob, os
here = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, here)
import lib
from diagrams import DIAGRAMS

rendered = {}
for key, (fn, cap) in DIAGRAMS.items():
    d = fn()
    rendered[d.id] = d.render(cap)
for note in glob.glob(os.path.join(here, "..", "*.md")):
    s = open(note).read()
    def swap(m):
        mid = re.search(r'marker id="([a-z]+)-arr"', m.group(0))
        return rendered.get(mid.group(1), m.group(0)) if mid else m.group(0)
    new = re.sub(r'<figure style="margin:1\.2em 0">.*?</figure>', swap, s, flags=re.S)
    if new != s:
        open(note, "w").write(new)
        print("updated", os.path.basename(note))
print("label warnings:", lib.WARN or "none")
