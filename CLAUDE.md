# Working notes for this project

Read this before changing anything. It records decisions that are not recoverable from the code, and
one rule that must never be broken.

## Keep this file current — it is the whole point

Sessions are expensive. A long chat re-reads its entire history every turn, so the cheap way to work
is a **fresh session that starts already informed**. This file is what makes that possible, and it
only works if it is maintained.

**Update it in the same commit as the work**, whenever you:

- finish or partly finish a topic (update the coverage table with real numbers)
- discover a constraint, a gotcha, or a bug that could be reintroduced later
- change a convention, a data shape, or a migration rule
- learn something about cost, limits or what fails under load
- make a decision whose *reasoning* would not survive in the diff

Rule of thumb: if a future session would waste tokens rediscovering it, or could do damage without
knowing it, it belongs here. `README.md` is for the user and documents features; **`CLAUDE.md` is for
the next session** and documents rules, reasoning and state. Do not duplicate one into the other.

---

## The hard rule: never edit a flashcard answer

`physio_flashcards.html` holds 4,440 true/false statements. **These exact statements, with these
exact answers, appear in the computer test.** They are not a knowledge base to be corrected — they
are the answer key being examined on.

If standard physiology disagrees with a stored answer:

1. **Leave the answer alone.**
2. Add a `w` (warning) field to that card's explanation saying what the deck says, what physiology
   says, and *to answer as the deck says in the test*.
3. Tell the user, with the card index and the reasoning.

Two cards currently carry a warning, both in Endocrinology:

| Index | Statement | Deck says | Physiology says |
| --- | --- | --- | --- |
| 8 | "All hormone levels decrease in aging." | True | False — FSH/LH rise sharply after menopause, PTH usually rises |
| 32 | "Oxytocin acts via cAMP." | True | False — the oxytocin receptor is Gq → IP₃/Ca²⁺; cAMP is ADH at V2 |

And two in Nervous System:

| Index | Statement | Deck says | Physiology says |
| --- | --- | --- | --- |
| 158 | "Tectospinal tract mediates responses initiated by sudden changes of head position." | True | False — the tectospinal tract turns the head *towards* sudden visual/auditory stimuli; head displacement drives the vestibulospinal tracts |
| 350 | "Individuals in REM sleep are more likely to awake spontaneously." | False | True — spontaneous awakenings cluster at the end of REM episodes, even though arousal threshold to external stimuli is high |

Before committing any change to that file, verify nothing moved:

```bash
python3 - <<'PY'
import json,re,subprocess
orig=subprocess.run(["git","show","1a2be9b:physio_flashcards.html"],capture_output=True,text=True).stdout
o=orig.split('\n')[32]; O=json.loads(o[o.index('['):o.rindex(']')+1])
new=open('physio_flashcards.html',encoding='utf-8').read()
n=re.search(r'id="deck-data">(.*?)</script>',new,re.S).group(1).replace('<\\/script>','</script>')
N=json.loads(n)
qo=[(q['q'],q['a']) for t in O for q in t['questions']]
qn=[(q['q'],q['a']) for t in N for q in t['questions']]
print("identical:", qo==qn, "| count:", len(qn))
PY
```

`1a2be9b` is the original upload. It must print `identical: True | count: 4440`.

---

## What this project is

Two static files, no build step, no npm, no bundler. React 18 UMD + in-browser Babel from a CDN.
Netlify serves `main` at <https://peppy-lokum-2c5109.netlify.app>.

| File | What it is |
| --- | --- |
| `index.html` | the study planner — 7 tabs: Today, Plan, Progress, Goals, Health, Timeline, Productivity |
| `physio_flashcards.html` | 4,440 true/false cards across 9 topics |
| `physio_flashcards_silvia.html` | **generated** — Silvia's copy of the deck, own progress |
| `make_silvia_copy.py` | regenerates that copy |
| `README.md` | user-facing feature documentation |

**Never hand-edit `physio_flashcards_silvia.html`.** It is derived. After *any* change to
`physio_flashcards.html` — new explanations, a UI fix, anything — run `python3 make_silvia_copy.py`
**in the same commit**, or her deck silently falls behind. The script rewrites exactly three
identifiers (`KEY`, `BACKUP`, `DRIVE_FILE`) and asserts each appears once, so it fails loudly rather
than quietly if that file changes shape.

Those three are the whole point: progress is never stored in the HTML, only in `localStorage` under
`KEY`, so a distinct key is what makes her copy start at zero and stay separate from Linas's — even
in the same browser on the same domain. A plain `cp` would have shared his progress and, if she ever
switched sync on, his Drive file too.

Deploy is: commit on `test` → `git checkout main && git merge test --ff-only` → `git push origin main`.
Netlify picks it up in well under a minute.

### When Netlify refuses to deploy

On 2026-08-08 Netlify showed *"running on operational credits — production deploys and Agent Runners
are paused"* and stopped building. **This is a known Netlify bug**, not real exhaustion: through July
and August 2026 many free-plan teams reported the identical banner while their credit balance was
still full, and support clears the flag by hand. Check Usage & billing first — a healthy balance next
to the paused banner confirms it. The fix is a free post on <https://answers.netlify.com> naming the
team (**Planer**) and site (`peppy-lokum-2c5109`).

**Never "solve" this by making a second account on another email.** It breaches Netlify's terms on
circumventing plan limits, and it does not even work, for a reason that applies to *every* host move:

> **`localStorage` is scoped to the origin.** A new URL silently resets all seven keys —
> `study_planner_v2`, `physio_flashcards_v1`, `physio_flashcards_silvia_v1`, both `_backup` keys, and
> the shared `sp_gtok` / `sp_gaccount`. Every graded card is gone.

So the order of operations for **any** domain change is fixed:

1. **Turn on Drive sync first, on the old origin.** Drive data is keyed to the Google account and
   client ID, *not* the origin, so it is the only thing that survives the move. This is also why the
   dormant sync feature matters more than it looks.
2. Add the new origin to **Authorised JavaScript origins** for the OAuth client
   (`272590603949-…apps.googleusercontent.com`, hard-coded at `index.html:130` and
   `physio_flashcards*.html:258`). Nothing in this repo controls that list — it lives only in Google
   Cloud Console, and without it `requestAccessToken` fails with `origin_mismatch`.
3. Update `LIVE_URL` (`index.html:124`, used by the four `file://` fallbacks), plus the URL in
   `README.md` and here.

Keep the three HTML files **siblings at the same path depth**: the inter-page links are relative
(`index.html:95`, `physio_flashcards*.html:138`) and single-sign-on via `sp_gtok` only works while
planner and both decks share one origin. Avoid hosts that rewrite `/physio_flashcards.html` to a
clean URL — deck deep-linking reads `location.pathname` (`physio_flashcards.html:737-746`).

Fallback hosts, in order of preference. The repo is public, so both are free:

| Host | Why |
| --- | --- |
| **Cloudflare Pages** | unlimited bandwidth, 500 builds/mo, works with private repos, 25 MB/file (our largest is 2.2 MB) |
| **GitHub Pages** | zero setup — repo is already there; 1 GB site, 100 GB/mo; needs the repo public |

**The durable fix is a custom domain (~€10/year).** Then the domain is the identity and the host is
disposable: no origin change, so no lost progress, no OAuth re-registration, no broken bookmark, ever
again. Do not rent a VPS for this — the project is deliberately backend-free (browser + Drive), so
static hosting is correct permanently, and a server would only add patching, TLS renewal and downtime.

---

## Conventions that must be matched

- **Styling**: CSS custom properties in `:root` (warm paper `#FAF6EC`, ink `#2C2A26`, olive accent
  `#5E7155`, hairline `#E7E0CF`), a handful of utility classes, and inline `style={{}}` objects
  referencing `var(--…)`. Newsreader serif for headings. No Tailwind, no CSS-in-JS, no new fonts.
- **State**: plain `useState`, one data object, actions bundled in a single `A` object passed as one
  prop. No Context, no Redux.
- **Persistence**: one JSON blob in `localStorage`, saved on every change, plus a mirror in a hidden
  Google Drive `appDataFolder`. `migrate()` uses `Object.assign(DEFAULT_DATA(), d)`, so **adding a
  key to `DEFAULT_DATA()` seeds it for existing users automatically** — that is the seeding
  mechanism, don't invent another.
- **No new dependencies.** Everything so far is hand-rolled inline SVG and CSS. Ask before adding one.
- **Animation**: use CSS transitions, not `requestAnimationFrame`, so the blanket
  `@media (prefers-reduced-motion: reduce)` rule kills them for free. Stagger timers are the only
  thing that needs an explicit reduced-motion branch.

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

Every topic has explanations for at least its first half. What remains is the **second half of one
topic** — the batch ranges are in the coverage table. Each is one workflow call against an island
that already exists, so merging is an update rather than an insert: read the island, add the new
keys, write it back (see the merge used for Kidney's remainder).

**One topic per run, and ship it before starting the next.** The user asked for exactly this after
initially agreeing to pair topics up, and it is the right shape: pairing two topics into one run
only widens the blast radius of a spend limit, and buys nothing, because the runs are sequential
either way. A reusable merge script lives at `<scratchpad>/merge_island.py` — it updates existing
keys, inserts new ones, skips blank explanations, and reports gaps.

### Coverage

| Topic | Cards | Explanations |
| --- | --- | --- |
| Endocrinology | 454 | ✅ 454 shipped, 2 answer-key warnings |
| Nervous System | 502 | ✅ 499 shipped, 4 dropped as unsalvageable, 2 answer-key warnings |
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

## Two merges that work differently, on purpose

- **Planner** (`index.html`): whole-blob, newest `updatedAt` wins. Fine — it is one person's data
  edited in one place at a time.
- **Flashcards**: **per-card union, never subtraction.** The two devices held genuinely different
  progress (Endocrinology 91 known on the phone, 41 on the Mac). A newest-blob-wins merge would have
  destroyed one of them outright. Conflicts prefer the newer per-card timestamp; where neither side
  has one — all progress recorded before scheduling existed — **"review" wins**, because re-seeing a
  card you knew costs seconds and hiding one you didn't costs marks.

Do not "simplify" the flashcard merge into the planner's. It is different deliberately.

---

## Things already fixed — don't reintroduce them

- **Auto-advance.** Cards used to jump on 1.4s after a correct answer. Not enough time to read the
  answer, let alone the explanation. Removed. Advancing is manual: space, Next, or arrow keys.
- **The second tap.** Answering TRUE/FALSE now grades the card (right → Good, wrong → Again). The
  separate known / needs-review buttons are gone. Hard and Easy are optional, after the reveal.
- **Focus theft.** The planner's Google token refresh fired on a timer regardless of what the user
  was doing, and `requestAccessToken` opens a popup, which drags the browser to the front. Gate any
  token call on `document.hasFocus()` — `visibilityState` is *not* enough, a tab stays "visible"
  while another app covers it.
- **The 460 KB Babel compile.** The question bank lives in a JSON island, not inside the Babel
  script, so cold loads no longer recompile it. Keep it that way.
- **`exam_planer.html`** — a back-link to a file that never existed. The planner is `index.html`.

---

## Dates that go stale

- Computer test **2026-08-14**, oral **2026-08-24**, both in `EXAMS` in `index.html`.
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

## Open items

- Explanations for the remaining 7 topics (see the coverage table).
- The user has **not yet switched on flashcard sync** — until they tap "Turn on sync", phone and Mac
  still keep separate progress. That was the original complaint; the fix is built but dormant.
- The Health tracker has no CSV/Markdown export yet, so its data has no backup path.
- Only one of three redesign directions survived a truncated payload during the flashcard redesign;
  the other two were never scored.
