#!/usr/bin/env python3
"""Regenerate physio_flashcards_silvia.html from physio_flashcards.html.

Silvia's deck is not maintained by hand — it is derived. Run this after ANY change to
physio_flashcards.html (new explanations, UI fixes, anything) so her copy stays in step:

    python3 make_silvia_copy.py

Two groups of differences, for two different reasons.

STORAGE — progress is never stored in the file itself, only in localStorage, so a distinct key is
what makes her copy start at zero and stay independent of Linas's, including on the same browser.
**Never change these three once she has used the deck**: they are where her progress lives, and
renaming them orphans it.

STANDALONE — Silvia has the flashcards but no planner. The main deck is deliberately coupled to
`index.html`: it shares the planner's token so one sign-in covers both, and it therefore asks for
the planner's Calendar scope even though the flashcards never call the Calendar API. For her that
coupling is all cost and no benefit, so her copy drops the planner link, asks only for the Drive
scope it actually uses, and keeps its token under its own key.

Those last two are one change, not two. If her copy asked for the narrower scope while still writing
to the shared `sp_gtok`, then on a browser they both use her drive-only token would overwrite the
planner's and 403 its calendar calls — the exact failure the comment in the deck warns about. Narrow
scope and private token key must move together.
"""
import pathlib
import sys

SRC = pathlib.Path(__file__).parent / "physio_flashcards.html"
DST = pathlib.Path(__file__).parent / "physio_flashcards_silvia.html"

# (old, new, expected_count)
SUBS = [
    # --- storage: where her progress lives. Do not touch. ---
    ('const KEY="physio_flashcards_v1";',
     'const KEY="physio_flashcards_silvia_v1";', 1),
    ('const BACKUP="physio_flashcards_v1_backup";',
     'const BACKUP="physio_flashcards_silvia_v1_backup";', 1),
    ('const DRIVE_FILE="physio-flashcards-sync.json";',
     'const DRIVE_FILE="physio-flashcards-silvia-sync.json";', 1),

    # --- standalone: no planner, so no planner link, no Calendar scope, own token ---
    ('<a className="lnk" href={PLANNER}>← planner</a>',
     '', 1),
    ('const AUTH_SCOPES="https://www.googleapis.com/auth/calendar.events '
     'https://www.googleapis.com/auth/drive.appdata";',
     'const AUTH_SCOPES="https://www.googleapis.com/auth/drive.appdata";', 1),
    ("""/* Same scope string as the planner deliberately: the two apps then share sp_gtok, so signing in
   once covers both. A narrower token written back here would 403 the planner's calendar calls. */""",
     """/* Standalone copy: no planner, so no shared token and no Calendar scope. The token lives under
   its own key — a drive-only token written to sp_gtok would 403 the planner's calendar calls on a
   browser both are used in. Narrow scope and private key belong together; see make_silvia_copy.py. */""", 1),
    ('"sp_gtok"', '"sil_gtok"', 2),
    ('"sp_gaccount"', '"sil_gaccount"', 1),
]

s = SRC.read_text(encoding="utf-8")
for old, new, n in SUBS:
    found = s.count(old)
    if found != n:
        sys.exit(f"expected {n} of {old!r}, found {found} — "
                 "physio_flashcards.html changed shape, fix this script")
    s = s.replace(old, new)

# PLANNER is now unreferenced in her copy; leaving the const is harmless, but assert the link is gone
# so a future edit that reinstates it fails loudly rather than silently re-coupling the two apps.
if "href={PLANNER}" in s:
    sys.exit("her copy still links to the planner — a new link was added, decide deliberately")

DST.write_text(s, encoding="utf-8")
print(f"wrote {DST.name} ({len(s):,} bytes) — {len(SUBS)} substitutions applied")
