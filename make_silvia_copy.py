#!/usr/bin/env python3
"""Regenerate physio_flashcards_silvia.html from physio_flashcards.html.

Silvia's deck is not maintained by hand — it is derived. Run this after ANY change to
physio_flashcards.html (new explanations, UI fixes, anything) so her copy stays in step:

    python3 make_silvia_copy.py

The only differences are the three storage identifiers below. Progress is never stored in the file
itself, only in localStorage, so changing the key is what makes her copy start at zero and stay
independent of Linas's — including on the same browser.
"""
import pathlib
import sys

SRC = pathlib.Path(__file__).parent / "physio_flashcards.html"
DST = pathlib.Path(__file__).parent / "physio_flashcards_silvia.html"

SUBS = [
    ('const KEY="physio_flashcards_v1";',
     'const KEY="physio_flashcards_silvia_v1";'),
    ('const BACKUP="physio_flashcards_v1_backup";',
     'const BACKUP="physio_flashcards_silvia_v1_backup";'),
    ('const DRIVE_FILE="physio-flashcards-sync.json";',
     'const DRIVE_FILE="physio-flashcards-silvia-sync.json";'),
]

s = SRC.read_text(encoding="utf-8")
for old, new in SUBS:
    if s.count(old) != 1:
        sys.exit(f"expected exactly one {old!r}, found {s.count(old)} — "
                 "physio_flashcards.html changed shape, fix this script")
    s = s.replace(old, new)

DST.write_text(s, encoding="utf-8")
print(f"wrote {DST.name} ({len(s):,} bytes) — {len(SUBS)} identifiers rewritten")
