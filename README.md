# Study planner

A single-file app. Everything lives in `index.html` — React and Babel are pulled from a CDN and
the JSX is compiled in the browser, so there is no build step and nothing to install. Open the
file, or push to `main` and GitHub Pages serves it within a minute.

## Live

| | |
| --- | --- |
| **Planner** | <https://kadzidrogalinasdraven.github.io/study-planner/> |
| **Flashcards** | <https://kadzidrogalinasdraven.github.io/study-planner/physio_flashcards.html> |
| **Flashcards — Silvia** | <https://kadzidrogalinasdraven.github.io/study-planner/physio_flashcards_silvia.html> |

The old Netlify address still answers but is **frozen on an out-of-date build**, so use the links
above and let the old bookmarks go.

Signing in with Google needs two things that live in the Google Cloud console, not in this repo: your
address has to be on the app's test-user list, and the site's address has to be on its list of
allowed origins. Without the first you get *"Error 403: access_denied"*; without the second, sign-in
fails with an origin error. Both are recorded in `CLAUDE.md`.

`physio_flashcards.html` is a separate standalone page that the planner links to. Keep it at the
same address or the flashcard links break.

`physio_flashcards_silvia.html` is Silvia's copy of the same deck — identical cards, explanations and
features, but its own progress, kept under a different storage key so the two never mix even in the
same browser. It is a **standalone** copy: it has no link to the planner, and it asks Google only for
the Drive permission it actually uses, not the planner's calendar permission. It is **generated**, not
maintained by hand: after any change to the main deck run `python3 make_silvia_copy.py` so her copy
picks it up.

`CLAUDE.md` holds the working notes for AI sessions — the rules, the reasoning behind decisions, and
what is done so far. **It is kept up to date as part of any change**, so a new session can pick the
work up without re-reading a long conversation. If something new is built or learned here that the
next session would need, it goes in that file at the same time as the code.

Data is saved to the browser's `localStorage` under one key, `study_planner_v2`, on every change.
When Google reminders are switched on, that same blob is also mirrored to a hidden app-data folder
in your Google Drive so your phone and Mac stay in step. Whichever device edited most recently
wins — the merge is by timestamp on the whole blob, not per field.

---

## Flashcards

`physio_flashcards.html` — 4,440 true/false statements across 9 topics.

**The questions and answers are never edited.** These exact statements, with these exact answers,
appear in the computer test. Where standard physiology disagrees with an answer, the card carries a
visible warning and still tells you to answer as the deck says. Four cards currently carry that
warning — Endocrinology 8 and 32, Nervous System 158 and 350.

### One tap

Tapping TRUE or FALSE both answers and grades the card — right counts as *Good*, wrong as *Again*.
There is no second tap. *Hard* and *Easy* appear after the reveal if you want finer control.

### Explanations

Every card reveals a short explanation underneath the answer — one to three sentences of mechanism
with a textbook citation, written to be read on a phone in the seconds after you answer. (The UI
still hides the panel where an explanation is missing, so adding cards later degrades gracefully.)

| Topic | Cards | Explained |
| --- | --- | --- |
| Endocrinology | 454 | all 454 |
| Nervous System | 502 | all 502 |
| Gastrointestinal Tract | 510 | all 510 |
| Kidney | 680 | all 680 |
| Physiology of Blood | 602 | all 602 |
| Circulation | 499 | all 499 |
| Special Senses | 466 | all 466 |
| Respiratory | 365 | all 365 |
| General Physiology | 362 | all 362 |
| **Total** | **4,440** | **all 4,440** |

Finished 8 August 2026.

They are written and checked by AI, and **that is not free of error** — roughly one explanation in
six needed correcting before it shipped, and the ones that were wrong were wrong about specifics:
an energy value, a transporter, the direction of a reflex. So every explanation goes through a
written-then-independently-checked-twice-then-repaired pipeline before it reaches the deck, and
anything whose citation could not be stood behind ships with no citation rather than a plausible
invented one. Trust the card; treat the explanation as a good revision note, not as a source.

Where an explanation still disagrees with the stored answer after adjudication, it becomes the
visible warning described above rather than a silent edit.

Citations name a textbook chapter. Those chapter numbers are Guyton & Hall **14th edition** and were
checked against the publisher's contents listing, because roughly 160 of them had been written with
13th-edition numbers, which differ by one from chapter 33 onwards.

**For the next AI session:** the pipeline, the measured error rates, the per-topic state and the
reusable workflow scripts are documented in `CLAUDE.md` under *Explanations*. Read that before
generating any — the writing is the cheap part and the verification is what makes them usable.

### Study modes

| Mode | Shows |
| --- | --- |
| **Smart** (default) | new cards plus anything due back — skips what you already got right |
| **Unseen** | never answered |
| **Review** | only what you got wrong |
| **Known** | only what you got right |
| **All** | every card |

Scheduling is SM-2 lite: correct answers push a card out 1 day, then 3, then × its ease factor; a
wrong answer brings it back in ten minutes and lowers the ease. **Intervals are capped at the day
before the exam in `EXAM_ISO`**, so nothing is scheduled past the test — this is cramming, not
lifelong retention.

### Sync

Progress syncs through the same hidden Google Drive folder as the planner, and shares its sign-in,
so signing in once covers both apps.

The merge is a **per-card union, never a subtraction**. Each device keeps progress the other lacks,
so a card known on one and untouched on the other stays known. Conflicts prefer the newer timestamp;
where neither side has one — which is all progress recorded before scheduling existed — **"review"
wins**, because being shown a card you knew costs seconds and hiding one you didn't costs marks.
The pre-migration blob is snapshotted to `physio_flashcards_v1_backup` on first load.

### Why the deck is a `<script type="application/json">`

Babel compiles this file in the browser on every cold load. With the 460 KB question bank inline it
recompiled the whole thing each time the page opened. Parsed as JSON instead, Babel only ever sees
the ~20 KB of app code.

---

## The oral exam: triplets, tiers and the derived plan

The oral is drawn as **one triplet of three topics plus one practical**, and all 41 triplets are
published in advance. That, not the 122-topic curriculum, is what the app now plans against.

The **Triplets** tab is the whole exam laid out: 41 cards, each showing its three topics with how
often each can be drawn, and all 26 practicals underneath. The headline number is the only one that
matters — *how many of the 41 draws you could answer today*.

Rehearsal is the review mechanism. Saying a triplet out loud, from memory, is the only honest test
of whether something studied a month ago is still there; recognising it on a flashcard is not the
same thing. Marking a topic **shaky** unticks it and sends it back to the top of the deep queue, so
the plan repairs itself from evidence rather than from a guess.

### The plan is derived, not written

The **Plan** tab used to be 59 hand-written days. It went stale the moment the exam moved. It is now
computed from what you have actually ticked, every render, so it cannot drift: tick something and
tomorrow re-flows. Each topic falls into one of four tiers, all derived:

| Tier | What it means | Time |
| --- | --- | --- |
| **deep** | unticked and examinable | ~2.5 h, up to 3 a day, senses first then kidney |
| **shallow** | unticked but deprioritised | ~15 min — definition and mechanism sketch only |
| **review** | already ticked | rehearsed inside a triplet, not re-studied |
| **drop** | in no triplet and no practical | never scheduled |

You can override any topic's tier by hand, and the override is checked first — 123 triplet lines
were mapped from a PDF, so there had to be a one-tap repair for a line mapped wrong.

A triplet is only scheduled for rehearsal once its deep topics have actually been studied; 23 of the
41 contain no deep topic at all, which is what keeps the early days busy while the senses are still
being learned.

### Two things worth knowing about the source

Fifteen curriculum topics appear in **no** triplet. Three of them are still scheduled anyway:
*Clearance* and *Cerebellum* are examined as practicals 26 and 10, and *Adaptation of respiration*
is the hidden middle line of triplet 38 — set in a nine-glyph subset font that text extraction drops
silently, leaving what looks like a legitimate two-topic triplet. It is not: 41 × 3 = 123.

Practicals are tracked separately from topics, in their own map. They deliberately do **not** count
toward the `done` ledger, because the weekly physiology ring is computed from that ledger and 26
practical ticks would inflate it.

---

## Productivity

Four weekly rings plus a combined one. Weeks run **Monday–Sunday**, local time.

| Ring | Weight | Score |
| --- | --- | --- |
| Physiology | 2× | topics ticked this week ÷ weekly target |
| Gym | 1× | sessions this week ÷ 3 |
| Languages | 1× | language days hit ÷ language days scheduled |
| Projects | 0.5× | project-days logged ÷ 3 |

**A category you haven't set up is left out of the average entirely, rather than counted as zero.**
An unconfigured ring would otherwise drag the headline number down for no reason. "Set up" means
*configured* — a target exists — not *active this week*: a category with a target but a quiet week
still counts, at 0. If it dropped out on quiet weeks instead, Monday would read 100% off a single
gym session and then fall as the week filled in.

### Where the physiology number comes from

Ticking a topic anywhere in the app feeds this ring — there is no separate control. Alongside the
existing `done` map there is a parallel `doneAt` map recording *when* each topic was ticked, which
is what makes "this week" answerable. Unticking deletes the stamp, so it can't leave phantom
credit behind. The 85 topics ticked before `doneAt` existed carry no stamp and count toward no
week, which is correct — we genuinely don't know when they were done.

The pace is derived from the next exam in `EXAMS`, with the deadline set to the **day before** it,
since exam day is not a study day. On exam morning it rolls on to the next exam, so the figure never
divides by zero. It counts only the **examinable** topics — the ones that appear in a triplet or a
practical — because pacing against topics that cannot be drawn would invent work that does not exist.

The weekly target defaults to the pace needed to finish the curriculum and is editable. The daily
figure — *"3 topics a day to finish by 30 Aug"* — is the one to read: the weekly equivalent is the
same fact in a form that sounds impossible.

### Logged late

Gym, language and project entries store `tickedAt` — when the box was ticked — separately from the
day it was ticked *for*. Filling in four days on Sunday is a different fact from doing them daily,
and without that field the two would be indistinguishable. A day filled in more than a day
afterwards is marked "late" in the week grid. Physiology has no late mark, and that's deliberate
rather than an omission: a topic isn't done *for* a date the way a gym session is, so its stamp
*is* its tick time.

## Privacy

Everything you tick, write or log stays in your browser and, if you turn sync on, in your own
private Google Drive app-data folder. Nothing is sent anywhere else: there is no backend, no
account, and no analytics anywhere in this app.
