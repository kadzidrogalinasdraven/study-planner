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

### Coverage

| Topic | Cards | Explanations |
| --- | --- | --- |
| Endocrinology | 454 | ✅ 454 shipped, 2 answer-key warnings |
| Nervous System | 502 | ✅ 499 shipped, 4 dropped as unsalvageable, 2 answer-key warnings |
| Kidney | 680 | ✅ 679 shipped, 0 answer-key warnings; card 659 held (adjudication never ran) |
| Gastrointestinal Tract | 510 | ✅ 510 shipped, 0 answer-key warnings |
| Physiology of Blood | 602 | ✗ |
| Circulation | 499 | ✗ |
| Special Senses | 466 | ✗ |
| Respiratory | 365 | ✗ |
| General Physiology | 362 | ✗ (120 piloted, not shipped) |

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

## Kidney — complete but for one card

679 of 680 shipped. The 356 that a previous session left unwritten or unverified were written and
double-checked in one run: 59 corrected (17%).

**Card 659 is the only one held back.** "Metabolic acidosis can be corrected by increasing pH of
urine", stored True. The explanation argues the opposite — renal correction *lowers* urine pH toward
4.5, and an alkaline urine means bicarbonate is being lost — so it cannot ship as written: an
explanation that quietly contradicts its own answer is worse than none. Its two examiners were both
killed by the spend limit before they could adjudicate. It sits in `<scratchpad>/kidney_HELD.json`,
but regenerate rather than hunt for it — the scratchpad is session-scoped.

To finish: adjudicate 659 with `adjudicate-disputes.js` (below). If unanimous and high-confidence,
it becomes the deck's fifth answer-key warning; otherwise rewrite the explanation to defend the
stored True and ship it.

**Card 43 was adjudicated and the deck won.** "Vasa recta can respond to sympathetic stimulation by
vasoconstriction", stored False. The prosecutor held that descending vasa recta pericytes carry
alpha-1 adrenoceptors and do constrict; the defender held that the deck's own neighbouring cards
class vasa recta as capillaries and put the sympathetic effector at the arteriole, which is what a
second-year course tests. Not unanimous, so **no warning** — its explanation was rewritten by hand
to the taught scheme, with the pericyte literature as a parenthetical aside.

That split is the pattern to expect: a confident-sounding objection that is true of the specialist
literature and false of the course. The defender exists to catch exactly that, and without it this
card would have shipped a warning telling the student the answer key is wrong when it isn't.

## Adjudicating disputes

`~/.claude/projects/-Users-linas-Projects-study-planner/workflows/scripts/adjudicate-disputes.js`

Two examiners per disputed card — one told to judge independently, one told its default position is
that the key is right and the challenger misread it. A warning is written **only when both say the
key is wrong and both are high-confidence.** Pass `{cards: [{i, q, a, explanation}], label}`.

## Cost, and why this ran out

Explanations are by far the most expensive thing in this project. Rough measured cost: a full topic
with the three-pass protocol is **~1M subagent tokens per ~360 cards**. Endocrinology, Nervous System
and half of Kidney together exhausted a monthly spend limit once; all of GI plus the Kidney remainder
(1,116 cards, 3.7M subagent tokens in one session) exhausted it again, **four agents into a
four-agent adjudication** — see card 659.

That is the failure mode to design around: the limit does not warn, and it bites the *last* thing
you run. So run adjudication and any other small final pass **early**, or accept that the cheapest
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
