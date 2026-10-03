# History — second year, and how the flashcard deck was built

Moved out of CLAUDE.md on 2026-10-03, verbatim, because every session read all of it. Nothing here
is a live rule for the planner, with one exception that stays in CLAUDE.md: never edit a
flashcard answer. Read this before adding or re-explaining a card, or when a question needs the
second-year history.

---

## Explanations: the pipeline and its actual error rate

Explanations live in a second JSON island, `<script type="application/json" id="<topic>-exp">`,
keyed by question index: `{"12": {"e": "...", "s": "Guyton & Hall 14e, Ch.75 — ...", "w": "optional warning"}}`.

**Generated explanations are wrong often enough that verification is not optional.** Measured:

| Run | Written | Needed correction |
| --- | --- | --- |
| General Physiology pilot (120) | 120 | 6 flagged (5%) — one checker |
| Endocrinology (454) | 454 | 44 corrected, 7 sources dropped (~10%) — one checker |
| Nervous System (502) | 502 | **121 flagged (24%)**, 4 unsalvageable — two checkers |
| Gastrointestinal Tract, cards 0-259 | 260 | 31 corrected (12%) — two checkers, + 8 more (3%) on a re-verify with a corrected lens |
| Gastrointestinal Tract, cards 260-509 | 250 | 34 corrected (14%) — two checkers, lens named all three sub-subjects up front, no second pass needed |
| Kidney, remaining 356 | 356 | 59 corrected (17%) — two checkers |
| Physiology of Blood, cards 0-311 | 312 | 59 corrected (19%) — two checkers |
| Circulation, cards 0-259 | 260 | 52 corrected (20%) — two checkers |
| Special Senses, cards 0-233 | 234 | 33 corrected (14%) — two checkers |
| Respiratory, cards 0-181 | 182 | 36 corrected (20%) — two checkers |
| General Physiology, cards 0-181 | 182 | 22 corrected (12%) — two checkers |
| Physiology of Blood, cards 312-601 | 290 | 62 corrected (21%) — two checkers, 8-section mechFocus |
| Circulation, cards 260-498 | 239 | 31 corrected (13%) — two checkers, 8-section mechFocus |
| Special Senses, cards 234-465 | 232 | 40 corrected (17%) — two checkers, 5-section mechFocus |
| Respiratory, cards 182-364 | 183 | 23 corrected (13%) — two checkers, 9-section mechFocus, arithmetic-weighted |
| General Physiology, cards 182-361 | 180 | 17 corrected (9%) — two checkers, 3-block mechFocus |
| Nervous System, 3 orphan cards | 3 | 2 corrected — the "unsalvageable" three, all routine after all |

Errors were real: a sodium-channel selectivity figure out by an order of magnitude, osmolarity
numbers that didn't multiply out, a membrane potential contradicting the chapter it cited.

The working recipe, per topic:

1. Split the topic into batches of ~26 questions as JSON files.
2. One agent per batch writes explanations with a textbook-level citation and sets
   `answerLooksWrong` where the physiology disagrees with the key.
3. **Two independent checkers per batch with different lenses** — one on mechanism and numbers, one
   on "does this explanation actually support the stored answer, and is the citation plausible".
   Diversity catches more than redundancy.
4. A repair agent rewrites only what was flagged, with both critiques in hand. If it cannot stand
   behind a citation, it returns an empty source — **a blank source is better than a wrong one**.
5. Anything still disputing the stored answer goes to a separate adjudication: two examiners, one of
   them explicitly instructed to *defend* the deck. Only unanimous high-confidence disputes become
   warnings.

Batch files go in the scratchpad, not the repo.

### Check citation chapter numbers after every run — the checkers do not

Neither checker catches this, because the consistency lens only asks whether a chapter *plausibly*
covers the claim, not whether its number is right. Blood 312-601 came back citing **the same chapter
title under two different numbers** — "Hemostasis and Blood Coagulation" as both Ch.36 (38 cards)
and Ch.37 (69 cards). Whichever is true, a deck that says both is wrong on one of them, and a student
comparing two cards sees the contradiction.

Chasing that revealed a deck-wide problem, since fixed: **160 explanations across every topic carried
13th-edition chapter numbers** while claiming 14e, because writers drift between the two editions and
the numbers differ by one from Ch.33 onwards. The titles were almost always right; the numbers were
not.

**The title decides the number, and the map below was verified against Elsevier's published 14e
contents — not inferred.** Verify rather than reason from majority vote: raw majority was *wrong* for
three titles, because the 13e number was the commoner one, and adopting it would have put two
different chapter titles on Ch.55 and two more on Ch.57.

| Ch. | Title | | Ch. | Title |
| --- | --- | --- | --- | --- |
| 33 | Red Blood Cells, Anemia, and Polycythemia | | 55 | Motor Functions of the Spinal Cord |
| 34 | Resistance to Infection: I. Leukocytes, Inflammation | | 56 | Cortical and Brain Stem Control of Motor Function |
| 35 | Resistance to Infection: II. Immunity and Allergy | | 57 | Cerebellum and Basal Ganglia in Motor Control |
| 36 | Blood Types; Transfusion; Transplantation | | 58 | Cerebral Cortex, Intellectual Functions, Memory |
| 37 | Hemostasis and Blood Coagulation | | 59 | Behavioral and Motivational Mechanisms; Limbic |
| 38 | Pulmonary Ventilation | | 60 | States of Brain Activity: Sleep, Brain Waves |
| 39 | Pulmonary Circulation, Pulmonary Edema | | 61 | The Autonomic Nervous System and Adrenal Medulla |
| 41 | Transport of Oxygen and Carbon Dioxide | | 62 | Cerebral Blood Flow, CSF, Brain Metabolism |
| 42 | Regulation of Respiration | | 64 | Propulsion and Mixing of Food |
| 43 | Respiratory Insufficiency | | 65 | Secretory Functions of the Alimentary Tract |
| 46 | Organization of the Nervous System, Synapses | | 66 | Digestion and Absorption |
| 47 | Sensory Receptors, Neuronal Circuits | | 67 | Physiology of Gastrointestinal Disorders |
| 48 | Somatic Sensations: I. Tactile and Position | | 68 | Metabolism of Carbohydrates, Formation of ATP |
| 49 | Somatic Sensations: II. Pain, Headache, Thermal | | 69 | Lipid Metabolism |
| 50-52 | The Eye: I. Optics / II. Retina / III. Central | | 70 | Protein Metabolism |
| 53 | The Sense of Hearing | | 71 | The Liver as an Organ |
| 9 | Cardiac Muscle; The Heart as a Pump | | 72 | Dietary Balances |
| 14 | Overview of the Circulation; Biophysics | | 73 | Energetics and Metabolic Rate |
| 16 | The Microcirculation and Lymphatic System | | 74 | Body Temperature Regulation and Fever |
| 18 | Nervous Regulation of the Circulation | | 84 | Fetal and Neonatal Physiology |

Ganong 26e: Ch.10 is *Hearing & Equilibrium*.

Beware two false positives when auditing. Compound citations like `Ch.65 and Ch.66 — Secretory
Functions...; Digestion and Absorption...` are **correct** — two chapters for two titles. And one
chapter legitimately carries several section headings (Ch.9 appears as "Cardiac Muscle", "The Cardiac
Cycle", "Heart Sounds"). Check before rewriting; a blind fix breaks both.

So after every run, before merging, group the citations by chapter *title* and flag any title carrying
more than one number. It is a few lines of local Python and needs no agent:

```python
bt = defaultdict(Counter)
for it in items:
    m = re.match(r'Guyton\s*&\s*Hall\s*14e,\s*Ch\.?\s*(\d+)\s*—\s*(.+)', it['source'].strip())
    if m: bt[m.group(2).strip()][m.group(1)] += 1
print({t: dict(c) for t, c in bt.items() if len(c) > 1} or "no conflicts")
```

Rewrite only the number bound to a canonical title, and never touch the explanation text.

**There are two reusable workflows for this**, at paths that survive a new session (Claude Code's own
copy lands under the *session* directory and disappears with it — these are the stable ones):

```text
~/.claude/projects/-Users-linas-Projects-study-planner/workflows/scripts/topic-explanations.js
~/.claude/projects/-Users-linas-Projects-study-planner/workflows/scripts/reverify-batches.js
```

`topic-explanations.js` runs the whole write → double-verify → repair pipeline. Pass
`{dir, topic, label, batches, mechFocus}`.

**`mechFocus` is not optional in practice.** It is the list of things the mechanism checker is told
to actually check, and without it the checker inherits the kidney lens and skims everything else.
Name the cell types, transporters, hormones, reflexes and numeric quantities that this topic turns
on — the checker verifies what you name and glances at the rest.

**A deck topic is not always about its own name.** Gastrointestinal Tract cards 0-39 are
thermoregulation and 40-110 are energy metabolism and calorimetry; GI proper starts around 110.
Before writing `mechFocus`, print every 10th question and read what the range is *actually* about.
Getting this wrong is recoverable but costs a second pass: on GI a corrected-lens re-verify of cards
0-103 found 8 more errors that the GI-lensed checker had let through, including two bomb-calorimeter
energy values.

`reverify-batches.js` is that second pass — it re-checks explanations that already exist against a
corrected lens and repairs what it flags. Pass `{file, batches, size, lens, label}`, where `file` is
a JSON array of `{i, explanation, source, answerLooksWrong}`.

Invoke either with `Workflow({scriptPath: "<that file>", args: {...}})`. Prepare the batch files first:

```python
# split one topic into batches of 26 under <scratchpad>/<topic>/bNN.json
import json, os, re
s = open('physio_flashcards.html', encoding='utf-8').read()
d = re.search(r'id="deck-data">(.*?)</script>', s, re.S).group(1).replace('<\\/script>', '</script>')
t = [x for x in json.loads(d) if x['id'] == TOPIC][0]
qs, B = t['questions'], 26
for b in range((len(qs) + B - 1) // B):
    chunk = [{"i": i, "q": qs[i]['q'], "a": qs[i]['a']} for i in range(b*B, min((b+1)*B, len(qs)))]
    json.dump({"topic": TOPIC, "batch": b, "questions": chunk}, open(f"{DIR}/{TOPIC}/b{b:02d}.json", "w"), indent=1)
```

**Run one topic at a time.** Two concurrent runs exhausted the session limit partway through and
killed 39 of 63 agents on one and 34 of 41 on the other. The explanation agents had already
succeeded, so what died was the *verification* — the most dangerous possible half to lose, because
it leaves a pile of finished-looking explanations that nobody checked.

**A dropped wifi connection kills agents exactly like a spend limit does**, and it kills the same
half — Special Senses lost 11 agents to `ENOTFOUND`, of which 6 were repairs and 5 were checkers,
leaving nine finished-looking batches that nobody had checked. Resume is the answer, not a re-run:
the 23 survivors replayed from cache and only the 11 failures re-ran, at no extra cost for the work
already done.

If a run dies partway:

```js
Workflow({ scriptPath: "<the script>", resumeFromRunId: "<run id>", args: {...} })
```

Completed agents replay from cache instantly; only the failed ones re-run. Same script and args →
100% cache hit on the survivors.

**Never ship a topic whose verification did not complete.** Check the returned logs for
`N repaired after review` — if that number is 0 on a topic of hundreds of cards, the checkers did
not run, because the real rate is 5-10%. Partial results are parked in the scratchpad as
`<topic>_UNVERIFIED.json` rather than merged into the deck.

### What is left

**Nothing. All 4,440 cards have explanations.** Coverage reached 100% on 2026-08-08.

If cards are ever added, the pipeline below still applies. Note that the three Nervous System cards
a much earlier session recorded as "unsalvageable" were nothing of the kind — propriospinal tracts,
the two cranial nerves that bypass the brain stem, and amygdalar autonomic output are all routine.
They took one four-agent run. **Before writing anything off as unsalvageable, try it once properly**;
and note the count was recorded as 4 dropped when only 3 were actually missing.

**One topic per run, and ship it before starting the next.** The user asked for exactly this after
initially agreeing to pair topics up, and it is the right shape: pairing two topics into one run
only widens the blast radius of a spend limit, and buys nothing, because the runs are sequential
either way. A reusable merge script lives at `<scratchpad>/merge_island.py` — it updates existing
keys, inserts new ones, skips blank explanations, and reports gaps.

### Coverage

| Topic | Cards | Explanations |
| --- | --- | --- |
| Endocrinology | 454 | ✅ 454 shipped, 2 answer-key warnings |
| Nervous System | 502 | ✅ 502 shipped, 2 answer-key warnings |
| Kidney | 680 | ✅ 680 shipped, 0 answer-key warnings |
| Gastrointestinal Tract | 510 | ✅ 510 shipped, 0 answer-key warnings |
| Physiology of Blood | 602 | ✅ 602 shipped, 0 answer-key warnings |
| Circulation | 499 | ✅ 499 shipped, 2 adjudicated and defended, 0 answer-key warnings |
| Special Senses | 466 | ✅ 466 shipped, 0 answer-key warnings |
| Respiratory | 365 | ✅ 365 shipped, 0 answer-key warnings |
| General Physiology | 362 | ✅ 362 shipped, 0 answer-key warnings |

**All nine topics are now wired.** Island ids: `endo-exp`, `nerv-exp`, `kid-exp`, `gi-exp`,
`blood-exp`, `circ-exp`, `sens-exp`, `resp-exp`, `gp-exp`. There is no longer any topic to add — only
batches to extend within the islands that exist. **The `EXPL` key must be
the deck's topic id, which is not always the island's prefix** — GI's topic id is `git`, not `gi`.

To wire a new topic in: add its island to the `EXPL` map at the top of the Babel script. The UI shows
an explanation where one exists and silently omits the panel where it doesn't.

### Answer audit

198 questions sampled across all 9 topics were audited for correctness — 3 flagged, all 3 defended,
**zero confirmed errors**. That is a 4.5% sample, not a clean bill of health for all 4,440.

---

## SUPERSEDED (2026-09-03) — the physiology oral. Kept as a record of how the deck was built.

Everything from here to "Dates that go stale" describes second year. The oral was passed on
2026-08-31 and the planner no longer models triplets, practicals or a single-subject plan. The
decks themselves are still live and still Silvia's; do not delete them. Read the third-year
section at the top of this file for how the planner works now.

## The oral exam — how the planner modelled it (2026-08-17, superseded)

**The oral draws ONE triplet of three topics plus one practical.** All 41 triplets are published in
advance, in `exam structure/physiology tripletes.pdf`. Planning against the 122-topic `CURRICULUM`
optimises the wrong thing, so `TRIPLETS` and `PRACTICALS` are now first-class data in `index.html`.

**41 x 3 = 123 slots, 108 distinct drawable topics, 15 doubles.** 108 + 15 = 123; if your arithmetic
does not close like that, an extraction dropped a line. Adding the two practical-only topics gives
**110 examinable of 122**.

### Triplet 38 is a trap for text extractors — do not "fix" it

Its middle topic is set in a **separate 9-glyph Identity-H subset font (hex CIDs)** while the rest of
page 3 is WinAnsi literals. A parser that only reads `(...)` strings drops the line in silence and
leaves what looks like a perfectly legitimate **two-topic** triplet. It is not. The line reads
**"Adaptation of respiration"** (`RS10`), and that was confirmed three ways: the F4 ToUnicode map
yields exactly `dpttonofresprton` (the font has no `A`, `a`, `i` or space), the slot count closes at
123, and a second independent extraction agreed. **`RS10` is examinable.** An earlier pass here had
it wrong and nearly dropped it as unexaminable.

Decode with all fonts, not just the literal strings:

```python
# per page: map each /Fn through its own /ToUnicode CMap; handle BOTH (lit) and <hex> in TJ arrays
mp, is_type0 = fonts[current_font]          # None mp => WinAnsi literal, use raw bytes
step = 4 if is_type0 else 2                 # Identity-H is 2-byte CIDs
```

### The mapping, code by code — verified against the PDF wording, one line at a time

|  1 KI05+EN06+SS07 |  2 CV13+NS13+RS09 |  3 BL09+KI01+NS15 |
|  4 CV04+SS02+EN05 |  5 RS05+BL04+EN02 |  6 GP02+SS06+CV20 |
|  7 GI07+GP15+CV11 |  8 BL01+CV05+NS09 |  9 KI02+NS07+EN08 |
| 10 GP14+CV12+SS09 | 11 CV01+BL11+EN07 | 12 BL07+KI07+CV06 |
| 13 NS16+RS04+GP05 | 14 GP13+CV08+MT02 | 15 GI10+SS08+BL02 |
| 16 BL01+KI06+CV14 | 17 GP08+CV03+GI08 | 18 SS05+CV18+EN01 |
| 19 GP09+GI09+EN04 | 20 NS02+KI06+BL09 | 21 GP04+EN11+NS04 |
| 22 CV09+KI04+EN09 | 23 RS03+SS01+CV16 | 24 GP11+RS01+BL08 |
| 25 EN12+GP03+SS04 | 26 BL03+CV06+NS14 | 27 RS07+GP07+BL06 |
| 28 BL13+MT01+NS20 | 29 NS19+GP10+CV10 | 30 NS06+RS06+GI05 |
| 31 CV07+EN03+BL05 | 32 NS12+GI03+CV02 | 33 NS17+EN01+GP01 |
| 34 CV12+GI06+GP12 | 35 BL08+GI02+RS08 | 36 BL13+GI04+CV05 |
| 37 EN13+GP11+CV19 | 38 BL10+RS10+SS03 | 39 GP03+EN12+SS04 |
| 40 GP14+EN10+SS09 | 41 KI08+RS02+NS01 |

Not typos, do not "tidy" them: **25 and 39 are near-duplicates** (both `GP03`+`SS04`+ovaries;
39's "Female endocrine System" reads as `EN12`, arguably `EN11`); **`BL13` covers T-lymphocytes (28)
and B-lymphocytes (36)** under one curriculum code; **triplet 39's third slot names a practical
outright** — "Taste / RBC in Hypotonic Solution" — which is the evidence for restoring practical #3,
blank in `curriculum_GM_2025.pdf`.

### Zero-yield does not mean droppable

15 curriculum topics appear in no triplet, but **three of them are still examinable**: `KI03`
Clearance is practical 26, `NS18` Cerebellum is practical 10, and `RS10` is the hidden line above.
That is why `yieldOf()` counts **triplets AND practicals** and there is no hand-written drop list —
a hand-written list is exactly what lost them the first time.

### The plan is derived; the `PLAN` literal is gone

`buildPlan(data, today)` is a pure function of `data.done` + `data.study` + today, recomputed each
render via `useMemo`. It replaced a 161-line hand-written `PLAN` that had gone stale twice. Tiers:

| Tier | Rule | Cost |
| --- | --- | --- |
| `deep` | unticked, examinable | `DEEP_HOURS` = **5 h**, <= 3/day, spread over `DEEP_WINDOW` (11 days), senses then kidney |
| `shallow` | unticked, in `SHALLOW_CODES` | 30 min, definition + mechanism sketch |
| `review` | already ticked | covered by rehearsing its triplet, never re-studied |
| `drop` | `yieldOf()===0` and not in `FORCED_CODES` | never scheduled |

### The hours are the user's own, and days are filled to a budget

**`REHEARSE_HOURS` = 2 and `DEEP_HOURS` = 5.** An earlier version costed a triplet rehearsal at
**fifteen minutes**, which produced a schedule that looked comfortable and was fiction — the user
corrected it: *a triplet is around forty pages of text, and two hours is the floor even to revise
one.* Never quietly lower these to make a plan fit.

Days are therefore filled to **`HOURS_PER_DAY` = 10**, item by item, in the order
**deep → shallow → practicals → triplets**. Practicals are booked *before* triplets deliberately:
they are 20 minutes each and were being crowded out entirely by 2-hour rehearsals.

**Whatever does not fit is returned as `plan.overflow` and shown by `OverflowBanner` on Plan and
Today.** At the current state that is **~52 h and ~26 triplets** — the fortnight genuinely cannot
hold 18 new topics at 5 h plus 40 triplets at 2 h (170 h against 140 h of capacity). A schedule that
silently drops a third of the work is worse than one that admits it, because only the second lets
the user choose the cut. Measured levers, if that choice ever needs making again:

| Change | Unscheduled |
| --- | --- |
| as-is, 18 deep topics | ~52 h, 26 triplets |
| kidney block marked `shallow` | ~14 h, 7 triplets |
| kidney + the three small senses (`SS01`, `SS04`, `SS05`) shallow | **0 h, everything fits** |

**`DEEP_WINDOW` is 11, not 8.** At 8 the deep queue fills the first nine days solidly and the first
triplet is not said out loud until **day 10**; at 11 rehearsal starts on **day 3** for the cost of
about two triplets. Rehearsal is the only instrument that reveals what has decayed, so it has to
start while there is still time to act on it.

### Triplet 39 and the Hemostasis/Homeostasis question

`DUPLICATE_OF = { 39: 25 }`. Triplet 39 is the **same three topics** as 25 (`EN12`+`GP03`+`SS04`,
reordered and reworded) — the user flagged it and the sets match exactly. It is kept in `TRIPLETS`
because the sheet numbers to 41 and 39 can still be drawn, so the 2/41 draw probability of those
topics is real and the yield count is left alone; what is skipped is rehearsing it a second time.

`FORCED_CODES = ["GP16"]`. Homeostasis appears in no triplet **as printed**. But the sheet carries
**two "Hemostasis" and two "Hemocoagulation"** triplets — four slots on two clotting topics — and
the user reads one Hemostasis as a publisher's slip for Homeostasis. That is not verifiable from the
PDF, so **the triplet data is left exactly as printed** and the topic is simply forced back into the
study set. Being wrong costs an hour; being wrong the other way costs a third of a draw.

**`data.study.tier` is checked FIRST in `tierOf()`, before the drop rule.** 123 lines were mapped by
hand; that ordering is what makes a mis-mapped topic a one-tap fix instead of a redeploy.

Rules that are load-bearing and easy to break:

- **A triplet is only rehearsable once its deep topics are studied.** 23 of the 41 contain no deep
  topic, which is exactly enough to fill the early days — there is no deadlock, but only just.
- **`REHEARSE_LIGHT` (8) on days with no deep work vs `REHEARSE_PER_DAY` (3) on days with it** is
  what turns the back half into a genuine second pass instead of dead time. Every triplet gets 2.
- **Deep work is spread evenly, not front-loaded.** Front-loading at 3/day put ~10 h on the first six
  days and left the last six nearly empty. `overflow` reports any surplus rather than hiding it.
- **Practicals live in `data.study.prac`, never in `done`/`doneAt`.** `prodStats` counts `doneAt` for
  the weekly physiology ring, so 26 practical ticks in there would inflate it and poison the pace.
- **`loadData()` routes the fresh-install path through `migrate({})`.** The oral-goal seed flag
  cannot live in `DEFAULT_DATA()` — `Object.assign` would hand it to existing users as already-true
  and the goal would never seed for the one person who needs it.
- `useMemo` had to be added to the React destructure at the top; it was not imported.

### The measured triage, for the record

88 of 122 ticked, 34 outstanding. Deep queue came to **17** (9 Special Senses + `KI01`-`KI08`), which
is 5-8 days of work, not the 107-topic catastrophe it looks like from the raw count — because the
already-ticked 88 need **recall, not re-study**, and rehearsal supplies that. Total ~71 h over 14
days. The user's own "5 h per topic" x 3 a day is 15 h/day and does not survive contact with a
calendar; `DEEP_HOURS` is 2.5 and is a constant so it can be argued with.

**Worth revisiting before the exam:** `GP14` Smooth muscle and `BL13` Specific immunity are both
double-weighted AND head their two triplets each, yet sit in `SHALLOW_CODES` at the user's request.
That was flagged to them; the data reflects their choice, not the recommendation.

## Dates that go stale (second year — all in the past, kept for context)

- **Computer test: PASSED.** It is no longer in `EXAMS` at all — `Countdown` and `physioPace` both
  pick the next *future* exam, so a past entry is only noise. It survives as a `TIMELINE` milestone.
- **Oral exam 2026-08-31**, the single entry in `EXAMS` in `index.html`.
- `PLAN_START` / `PLAN_END` (`2026-08-17` → `2026-08-30`) bound the derived schedule.
- `langForDate`'s anchor is `2026-09-01`, which pauses language practice for the run-up and resumes
  it the day after the oral. `off<0` already returns `null`, so no other change was needed.
- Flashcard `EXAM_ISO` is now **2026-08-31** (was the computer test). `capDue` guards with
  `if(last<=now) return due;`, so a past date does **not** break scheduling — it just stops capping.
  It was briefly reported as "everything permanently due, Smart mode degenerated to All"; that was
  wrong, and the guard is why. Updating it restores the guarantee that every seen card resurfaces
  before the oral.
- Flashcard scheduling caps intervals at the day before `EXAM_ISO` in `physio_flashcards.html` —
  this is cramming, not lifelong retention, so nothing is scheduled past the test.
- The Productivity tab derives its pacing from `EXAMS`, so it self-corrects when the exam moves.

---

## Kidney — complete

All 680 shipped, no answer-key warnings. The 356 cards a previous session left unwritten or
unverified were written and double-checked in one run: 59 corrected (17%).

**Two cards went to adjudication and the deck won both.** That is the pattern to expect, and the
reason the defender examiner exists:

- **Card 43** — "Vasa recta can respond to sympathetic stimulation by vasoconstriction", stored
  False. Prosecutor: descending vasa recta pericytes carry alpha-1 adrenoceptors and do constrict.
  Defender: the deck's neighbouring cards class vasa recta as capillaries and put the sympathetic
  effector at the arteriole, which is what a second-year course tests. Split, so no warning;
  explanation rewritten by hand to the taught scheme with the pericyte literature as an aside.

- **Card 659** — "Metabolic acidosis can be corrected by increasing pH of urine", stored True. The
  challenge was strong: renal *compensation* acidifies the urine toward pH 4.5. But the defender
  found the deck's own lexical distinction — it writes **"corrected"** for treatment and
  **"compensated"** for the body's own response, consistently across topics — and cards 640 and 644
  are keyed the challenger's way. On the therapeutic reading True is right: alkali pushes plasma
  HCO3- past the reabsorptive threshold and the urine turns alkaline. Split, so no warning; the
  shipped explanation teaches the corrected/compensated distinction explicitly, because that is the
  trap.

Both would have shipped a warning calling a correct answer key wrong if the prosecutor had run
alone. **Never adjudicate with one examiner.**

Circulation added two more, and **the deck has now won all four adjudications ever run.** The write
agents' `answerLooksWrong` flag is noticeably trigger-happy — Circulation card 218 was flagged while
its own explanation argued *for* the stored answer. Treat the flag as "look at this", never as
"the key is wrong".

- **Circulation 218** — "QRS complex varies from 0.16 to 0.2 sec", stored False. Purely spurious:
  both examiners high-confidence that False is right, since 0.16-0.2 s is the P-Q interval and the
  deck's own cards 206, 459 and 465 say so.
- **Circulation 223** — "If a rhythm is described as sinus, a QRS complex precedes each T wave",
  stored False. Read as a bare conditional the sentence is true. But card **466 writes the same item
  out in full — "sinus rhythm *indicates that* a P-wave precedes each QRS"** — so the family stem is
  "indicates that", i.e. which feature identifies the pacemaker, and 223 is its distractor. Defective
  wording, not a wrong key. Its explanation now states the elided clause outright and points at 466.

**When a card reads oddly, search the deck for the same item written out in full.** These statements
were converted from single-best-answer MCQs, and the long-form twin often still carries the clause
that was elided — which decides the reading.

## Adjudicating disputes

`~/.claude/projects/-Users-linas-Projects-study-planner/workflows/scripts/adjudicate-disputes.js`

Two examiners per disputed card — one told to judge independently, one told its default position is
that the key is right and the challenger misread it. A warning is written **only when both say the
key is wrong and both are high-confidence.** Pass `{cards: [{i, q, a, explanation}], label}`.

## Resume is same-session — and that is worth checking before writing anything off

Respiratory lost 12 of 24 agents to the spend limit, and the notes here briefly recorded it as
unrecoverable. That was wrong: `resumeFromRunId` works for the whole life of the session, not just
immediately after the failure. The limit reset later in the same session, the run resumed, the 12
survivors replayed from cache, and only the 12 failures re-ran.

**Before re-running a dead topic from scratch, check whether the run id is still in this session.**
Re-running costs the full topic; resuming costs only what failed. It is only across a session
boundary that the run id dies and re-splitting becomes necessary.

## Cost, and why this ran out

Explanations are by far the most expensive thing in this project. Rough measured cost: a full topic
with the three-pass protocol is **~1M subagent tokens per ~360 cards**. Endocrinology, Nervous System
and half of Kidney together exhausted a monthly spend limit once; all of GI plus the Kidney remainder
(1,116 cards, 3.7M subagent tokens in one session) exhausted it again, **four agents into a
four-agent adjudication** — see card 659.

That is the failure mode to design around: the limit does not warn, and it bites the *last* thing
you run. It bit twice in one session — once four agents into an adjudication, once halfway through
Respiratory.

**Deploy after every topic, not at the end of the session.** Six topics went out one at a time here,
so when the limit finally bit, the only casualty was the topic in flight. Batching the deploys would
have put all six at risk of the same interruption. So run adjudication and any other small final pass **early**, or accept that the cheapest
step is the one you will lose.

Budget accordingly: **one half-topic (~10-13 batches) per session**, and expect the session limit to
bite before that if anything else large ran first. Measured on GI: 10 batches / 260 cards = 40
agents, **1.06M subagent tokens, ~15 min wall clock**; the 4-batch corrected-lens re-verify added 12
agents and 0.5M more — re-verification is not cheap, which is the argument for getting `mechFocus`
right the first time. When a limit hits mid-run it is always the *later*
phases that die — verification and repair — leaving finished-looking explanations nobody checked.
Never ship those.

## Where things stand — 2026-08-08 (superseded, kept for the hosting/Drive detail)

**The computer test is 2026-08-14 and the oral 2026-08-24.** At the time of writing that is six days
away, so prefer stability over improvement. Nothing below is urgent enough to risk the deck.

- **Explanations are finished: 4,440 of 4,440, every topic, no gaps.** There is no explanation work
  left. The 100% pass and the deck-wide citation fix both shipped on 2026-08-08.
- **Live on GitHub Pages**, verified serving all 4,440 on both decks. Netlify is stale at 3,842.
- **Linas has flashcard sync ON.** On the Netlify origin his progress was 516 known / 339 due /
  3,766 unseen, heaviest in Endocrinology (230) and Nervous System (138), and he pushed it to Drive
  before the move. On GitHub Pages that has to come back down from Drive on first sign-in — if the
  numbers look wrong there, press **Sync now** before concluding anything is broken. The merge is a
  per-card union, so a pull can add but never subtract.
- **Silvia** was added as a Google test user and given the GitHub Pages link. Her deck had zero
  progress at the time of the move, so she lost nothing by switching origin.

## Open items

- The **Netlify support post has not been made**. Doing it would restore the old URL; it is optional
  now that Pages is primary.
- No **custom domain** yet. This is the one change that would stop all of this recurring: the domain
  becomes the identity, the host becomes disposable, and no future move costs progress or an OAuth
  re-registration. ~€10/year. See the hosting section.
- Only one of three redesign directions survived a truncated payload during the flashcard redesign;
  the other two were never scored.


---

## Where things stand — 2026-09-03

**The physiology oral is passed and the planner is a third-year planner.** What shipped today:

- Every physiology structure removed from `index.html`: `TRIPLETS`, `PRACTICALS`, the 122-topic
  `CURRICULUM`, `T`, the deck links and maps, `SHALLOW_CODES`/`DEEP_ORDER`, the tier vocabulary,
  `physioPace`, `tripletCoverage`, the projects tracker and the physiology ring.
- Eleven third-year courses and 569 real topics in, from SIS plan `EAVSEOB2023`.
- The Triplets tab is now **Subjects**; Progress groups by subject with a per-topic skip control;
  the Timeline is the whole academic year with a "you are here" marker.
- Google sign-in renews itself on user gestures rather than asking you to press Reconnect.
- Verified in a real browser: all seven tabs render, no console errors, the integrity guards are
  silent, booking an exam date re-paces the plan and appears on the Timeline, skipping a topic
  removes it from every count, and a second `migrate()` does not wipe third-year ticks.

### What is NOT done, and what to watch

- **The decks are untouched and still live.** `physio_flashcards.html` and Silvia's copy are
  unchanged and still served from GitHub Pages; the planner simply no longer links to them. Do not
  delete them — the hard rule about flashcard answers still stands, and Silvia still uses hers.
- **No exam date can be booked yet.** Guarantors publish winter dates by 11 Dec 2026. Until then
  every subject paces to the first day of its exam period, which is deliberately pessimistic.
- ~~**Two topic lists are a year behind**~~ **Half resolved:** Intro to Internal Medicine II has
  its 2026/27 list since 2026-09-30. Internal Medicine I is still the SIS syllabus, because its
  only question PDF is the 2021/22 one for an exam that no longer exists.
- ~~**Pharmacology II has no public question list.**~~ **Resolved 2026-10-01:** the official
  2026-27 list (134 questions, pre-final) is the curriculum — see "Pharmacology: the official
  list is in".
- **The daily budget is 3 h in term and 8 h in an exam block, at the user's request.** At those
  numbers the year is tight but close to fitting; the overflow banner reports the shortfall per
  subject rather than hiding it. If it ever reads absurd, check `PHASES` before blaming the maths.
- `.playwright-mcp/` and the duplicate `exam structure/Copia di Physiology Triplets tg.pdf` are
  still untracked. Neither PDF is load-bearing any more.
