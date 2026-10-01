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

## Third year — how the planner models it (2026-09-03)

**The physiology oral is passed. The planner was rebuilt around the 2026/2027 third year of the
English General Medicine programme at LF Plzeň.** Triplets, practicals, the 122-topic physiology
curriculum and the projects tracker are all gone from `index.html`.

### Where every fact came from — verify here before changing any of it

| Fact | Source |
| --- | --- |
| The eleven courses, their SIS codes, semesters, completion types and credits | Charles University SIS, **study plan `EAVSEOB2023`**, faculty `11140`: `is.cuni.cz/studium/eng/predmety/index.php?do=prohl&fak=11140&oborplan=EAVSEOB2023&skr=2026` |
| Term and exam-period dates | **Dean's Measure No. 6/2026**, "Schedule of the Academic Year 2026/2027" |
| Topic lists | The exam-question PDFs attached to each SIS course page, or the SIS syllabus where no question list is published |
| Exam formats and credit rules | The "Course completion requirements" field of each SIS page, plus departmental PDFs |

**Faculty code 11140 is Plzeň; 11150 is Hradec Králové.** An hour went into this: the plan code
`FAVSEOB21` looks like the right English General Medicine plan and returns a complete, plausible
six-year curriculum — for the *wrong faculty*. Pilsen's English plans are prefixed `EA`, and the
current one is `EAVSEOB2023`. If a subject list ever looks subtly off, check the faculty code first.

**Do not trust a chat summary of the curriculum.** The one that started this work got four things
wrong that would each have produced a wrong planner: it put Microbiology and Immunology in third
year (Microbiology is second year, Immunology is fourth), it put Pharmacology I in third year
(it is second year; third year is Pharmacology II, and its exam covers both), it invented a
mandatory summer clerkship after third year (Pilsen's practice blocks are second and fourth year),
and it missed Pathology, Neurobehavioral sciences, Simulation Medicine and Radiological Anatomy
entirely. Everything above was re-derived from SIS.

### The eleven courses

| Code | Course | Sem | Completion | ECTS |
| --- | --- | --- | --- | --- |
| EAP0103500 | Pathology | both | winter credit, **summer exam** | 20 |
| EAP0103090 | Pathological Physiology II. | winter | **exam** | 5 |
| EAP0103100 | Pharmacology II. | winter | **exam** | 4 |
| EAP0103322 | Introduction to Internal Medicine II | winter | **exam** | 7 |
| EAP0103390 | Medical Psychology and Ethics | both | winter credit, **summer exam** | 5 |
| EAP0103320 | Internal Medicine I. | summer | credit | 3 |
| EAP0103400 | Propedeutics of Surgery | summer | credit | 3 |
| EAP0103091 | Neurobehavioral sciences | summer | credit | 4 |
| EAP0103430 | Simulation Medicine | both | credit | 3 |
| EAP0103440 | Radiological Anatomy | summer | credit | 1 |
| EAP0103050 | Czech for Medical Practice in Hospital | both | credit | 1 |

56 credits, five graded exams, six credits. **The Pathophysiology II and Pharmacology II exams
examine the second-year half of each course as well** — that is why `SUBJECTS` carries `examEcts`
(8 and 7) rather than the year-3 credit value.

### 569 topics, and where they came from

`CURRICULUM` is 22 blocks. Where a department publishes a numbered exam-question list, **that list
is the curriculum**, because it is literally what is examined:

| Subject | Blocks | Topics | Source |
| --- | --- | --- | --- |
| Pathology | General 47 / Special 108 / Oncological 69 | **224** | the three exam-question PDFs |
| Pathophysiology II | 4 oral groups (30/35/35/35) + practical 18 | **153** | oral + practical question PDFs, 2026/27 edition |
| Intro to Internal Medicine II | Propedeutics 24 / ECG+varia 18 | **42** | exam PDF, **2026/27 edition** (`did=357554`, read 2026-09-30) |
| Pharmacology II | General 35 / Special I 52 / Special II 47 | **134** | the department's 2026-27 Word file, read 2026-10-01, **pre-final** — see below |
| Medical Psychology and Ethics | 1 | 20 | SIS syllabus (labels abridged; full text in SIS) |
| Internal Medicine I | Cardiovascular 10 / Pneumology 4 | 14 | SIS syllabus |
| Propedeutics of Surgery | 1 | 32 | SIS syllabus |
| Neurobehavioral sciences | 1 | 24 | SIS syllabus |
| Simulation Medicine | winter 6 / summer 6 | 12 | SIS syllabus |
| Radiological Anatomy | 1 | 13 | SIS syllabus |
| Medical Czech | 1 | 10 | SIS syllabus |

**678 topics across 22 blocks** (701 across 21 until 2026-10-01, when Pharmacology's 157-question
stand-in was replaced by the official 134).

One staleness warning worth repeating to the user: the **Internal Medicine I** question PDF in SIS
is headed 2021/2022 and was therefore *not* used — the current SIS syllabus was used instead.

The **Intro to Internal Medicine II** list was replaced on 2026-09-30 with the 2026/27 edition,
which went up in September, two months earlier than last year's. One question was added — I.18,
*Examination of bone metabolism* — and six were reworded (I.7, I.8, I.12, I.15, III.6, III.7).
**The new question has the code `IIM042` although it sits eighteenth in its block.** Codes are
tick keys, not question numbers: renumbering 18–41 would have moved any existing tick onto the
wrong question. The PDF prints the second group as "III. ECG + varia"; there is no group II.

**The extractor lives at `<scratchpad>/extract.py`** and asserts an exact topic count per subject,
because two courses in the source notes carry the byte-identical heading
`### Syllabus (14 items, verbatim from SIS)` and an unscoped search silently gave Internal
Medicine I the wrong list. Scope any re-extraction to the course section.

### Hours are derived, never typed

There is no hand-written "this topic takes N hours" anywhere, and there must not be. Per-topic
cost is `(examEcts || ects) × HOURS_PER_ECTS × share ÷ topics in that subject`, where
`HOURS_PER_ECTS = 26` (the Bologna convention of 25–30 h per credit) and share is
`SELF_STUDY_SHARE = 0.55`, or `PRACTICAL_SHARE = 0.25` for the four courses the study plan writes
as `0/N` — no lectures, so almost all of the workload is contact time. That yields ~811 h of
private study across the year (measured 2026-10-01; quarter-hour rounding per topic moves it a
little whenever a topic count changes). **Change the constants, not the eleven numbers.**

### The plan engine

`buildPlan(data, today)` returns a **rolling 14 days from today** plus `.overflow`. The old fixed
`PLAN_START`/`PLAN_END` pair is what left the app reading "Nothing scheduled" the day after the
exam; a rolling window cannot go stale, and rendering 300 days through in-browser Babel would
freeze the page for no benefit.

Five rules that are load-bearing and easy to break:

- **The scheduling unit is a curriculum BLOCK, not a subject.** Pathology's winter blocks are due
  at the January credit and its summer blocks at the June final. Scheduling per subject made the
  January credit invisible, which is a genuine way to fail a course.
- **A block cannot be scheduled before the semester that teaches it** (`SEM_OPEN`). Without this
  the planner had you studying Propedeutics of Surgery in October, against lectures that happen
  in March.
- **A topic costing more than a whole day is capped at the day's budget** in `fillDay`. Pharmacology
  works out at ~3.75 h a topic against a 3 h teaching day; without the cap those 26 topics were
  unschedulable forever and sat permanently in overflow. (That was the 26-line syllabus. With the
  157-question list, and with the official 134, Pharmacology is 0.75 h a topic, and the course
  the cap now rescues is Medical Psychology at 3.5 h. The rule is the same.)
- **Blocks are ordered by PRESSURE — remaining hours ÷ hours left before the deadline —
  recomputed daily**, not by raw deadline. Deadline order starved the biggest course: the two
  blocks due first ate every day's budget and Pathophysiology went untouched for weeks.
- **Pressure is per BLOCK, so how a subject is cut into blocks decides who gets the daily slots.**
  A 3 h day holds about three topics, one from each of the three highest-pressure blocks, and
  with a shared deadline pressure is simply the block's remaining hours. Seen on 2026-10-01:
  Pharmacology went from two blocks (98 h + 20 h) to three (26 h / 39 h / 35 h). Before, the
  third slot went to a Pathophysiology block (26 h); after, Special I and Special II both
  outrank every Pathophysiology block, and **followed exactly, the Plan shows no Pathophysiology
  until 25 October**. It self-corrects, and the year's overflow is not worse (Pathophysiology
  15 h unplaced, was 16), but it is three and a half weeks of the largest winter exam off the
  list. Linas was told; the engine was not changed, at his instruction. The data-only way out is
  one Special block instead of two; the engine way is to rank by subject. **Before adding or
  splitting a block, print the next fortnight by subject.**

`projectYear()` simulates every remaining day with the same `fillDay` rule and reports what could
not be placed. **Do not replace it with arithmetic.** The share-of-the-calendar formula that stood
here first charged the October-to-January days against subjects not examined until May and
reported 181 h of overflow that did not exist. Simulating means the banner and the visible
schedule can never contradict each other.

#### Today's list holds still, and so does the week (2026-09-30)

The scheduler only ever looks at unticked topics, so a list built from the live state moves every
time a box is ticked: the ticked topic drops out and the next one slides up behind it. Until today
that made Today a treadmill — tick a topic and tomorrow's first topic took its place, so the day's
list could never be finished and tomorrow's list changed whenever today's was touched. Nobody had
hit it because nothing had been ticked before term. It had to go before the week table could
exist: a box that vanishes when ticked is not a box.

`doneAt` is the fix. **`beforeTicks(data, days)`** rebuilds the state as it stood before those
days' ticks, by putting the topics back, and two things are planned from such a state:

- **Today** — `startDay(data, today)` plans today from *this morning's* state, so `plan[0].items`
  is the list the day started with and **includes the topics already ticked** (the cards already
  rendered a done state; the engine simply never sent one). Later days are planned from what is
  really left, minus what today has claimed — so work done ahead frees them at once.
  `buildPlan` and `projectYear` both start from `startDay`; that is what keeps the banner and the
  schedule in step now. Do not give either its own way of opening the day.
- **The week** — `weekPlan(data, today)` plans Monday to Sunday from *Monday morning's* state with
  the same `fillDay`. It is the Productivity tab's table and the coursework ring's target.

**Followed day by day the two are the same list**, because both reach each morning with the same
topics left. That is tested, not assumed: six simulated weeks on plan, 504 day-comparisons,
checked in the morning, half-way through the day and in the evening. They part only when he is
off the plan, and on purpose:

| | The week table | The Plan |
| --- | --- | --- |
| Behind | the missed box stays open on the day it was due, outlined; "N behind" on the ring | re-flows the missed topics into the days left, **inside each day's budget** — never piled on top |
| Ahead | the week's own list finishes early; work beyond it is "+N" on the day it was ticked | refills the freed days to their budget straight away |

So "the Plan says X for Friday and the table says Y" is not a bug when he has skipped or jumped
ahead. It would be one if he were exactly on plan.

Things that are easy to break here:

- **`fillDay`'s sort must be a TOTAL order** (pressure, then deadline, then key). Today and the week
  are built by running it from different starting points and are expected to agree; a comparator
  that leaves two blocks tied lets the sort decide, and then they need not.
- **Nothing is stored.** The week is recomputed on every render from `done` + `doneAt`, which is
  why it cannot go stale — and also why **booking an exam date or skipping a block mid-week
  re-deals the whole week, past days included**, and can show topics as "behind" on days that had
  held something else. It is rare, and storing the week to avoid it would bring back exactly the
  staleness the derived plan exists to prevent. Explain it; do not persist it.
- **A bulk tick in Progress** stamps today on everything it ticks. Those topics land as "+N" on
  today, and the ring reads them as this week's work. That was already true of the ring.
- **Regression check for the engine:** with nothing ticked on the day under test, the new
  `buildPlan` and `projectYear` must equal the old ones exactly. Verified on 68 states — 17 dates
  across the year × 4 levels of progress, with skips and booked exam dates.

Daily budgets come from `PHASES` and are **the user's own choice**: 3 h on a teaching day, +2 at a
teaching weekend and on Dean's Day, 8 h inside an exam period, 2 h over the winter break. Look
phases up with `phaseById()`, never by index.

### Exam dates are booked, not known

The periods are fixed (`EXAM_PERIODS`); the individual date is booked by the student in SIS and
lives in `data.examDates`, so it syncs. Pacing falls back to the **first day of the period**, which
can only ever be too tight, never too loose. Booking a date relaxes the plan and shows up on the
Timeline immediately. Guarantors must publish winter dates by 11 Dec 2026 and summer dates by
7 May 2027, so nothing can be booked before then.

### Migration out of second year

`migrate()` wipes `done`, `doneAt` and `study` **once**, gated on `schemaV < 3`. The gate is not
optional: `migrate()` runs on every page load *and* on every Drive adopt, so an ungated wipe would
erase every third-year tick on the next reload. `schemaV` sits in `DEFAULT_DATA()` as **2, never
3**, for the same reason the seeding flag cannot live there at all — `Object.assign` hands the
default to any saved blob lacking the key, so the default must be the OLD value and `migrate()`
stamps the new one. The goal-seeding flag is `goalsSeededY3`; reusing `goalsSeededOral` would have
seeded nobody. The user's own old goals are never deleted, only the physiology ticks.

### Productivity

Three rings: **Coursework ×2, Gym ×1, Languages ×1**, plus the combined headline. The projects
tracker and the physiology ring are gone, at the user's request. `prodStats` now returns `byKey`
as well as `cats` — the old code read `cats[0]` and `cats[2]` positionally, which breaks silently
the moment a category is removed. **The language anchor stays at 2026-09-01 and must not be moved
to the start of term:** re-anchoring it to 1 October switched language practice off for the whole
of September, which is the one habit that runs through the holiday.

#### The coursework ring measures the Plan, not the pace (2026-09-30, Linas's request)

The target used to be the pace needed to finish every live subject on time — `paceOf().perWeek`
summed, **39 topics a week**. The Plan, at his 3 h a day, holds **21** in a full week. So the ring
asked for something the Plan never scheduled and could not reach 100 by doing everything on it.
He asked for "just the weekly amount of topics I have to study", as found in the Plan: the target
is now `weekPlan().total`, and `prodStats` returns `plan` instead of `need`.

**The gap between 21 and 39 is real and has not gone away.** It is the overflow — 71 h on an
untouched year, 74 h since the 42nd internal-medicine question — and it is reported by the banner on Today and Plan. Do not move it back into
this ring, and do not read a 100% coursework week as "on track for the exams".
**Since the official pharmacology list (2026-10-01) the three numbers are 19, 38 and 60 h**: a full
week holds 19 topics, not 21, because with 17 h less pharmacology the days take more of the
dearer Pathology and Internal Medicine topics; the first, short week is still 12.

The week grid carries the coursework under Gym and Languages: one row per course, one
`TopicTick` per planned topic, under the day the Plan gives it. **It is the same tick as
everywhere else** — `A.toggleDone` on `data.done` — so there is no second record to keep in step;
that is the whole answer to "directly connected". The boxes carry no words, so a tick raises a
toast naming the topic. A box still open on a past day is outlined (`missed`); work beyond the
week's list has no box and shows as "+N" on the day it was ticked. The label column is
`GRID_LABEL_W` = 112 px: "Pathophysiology" on one line, and seven 19 px boxes still fit beside it
at 375 px.

#### Languages can pass 100% — and only languages (2026-09-30, Linas's request)

The cadence (three or four days a week, alternating 3 / 4 because a week is odd) is the **target,
not the limit**. All seven boxes are open; a day off the cadence is an *extra*. `prodStats` gives
every category `raw` (n ÷ d), `score` (what it is worth in the mean: `raw`, held at 1 unless the
category is `uncapped`) and `pct`. **Only `lang` carries `uncapped:true`.** Gym and coursework stop
at 100 on purpose — he said gym "can stay like that" and never asked for coursework — so do not
tidy the three into one rule in either direction.

The surplus feeds the combined score too, because he asked for exactly that ("just add that extra
so it goes over 100% total"): +8 points per extra day in a three-day week, +6 in a four-day week,
133% for a full week (167% if coursework has no target). **The consequence to know about: a strong
language week lifts the headline over a weak coursework week.** Seven language days with half the
coursework and one gym session reads 92%, of which 34 is surplus. `prodStats().bonus` is that
share and the caption under the big ring always states it, so the number cannot flatter him
silently. If he ever calls the headline misleading, the lever is how `bonus` is presented — not
quietly re-capping the ring he asked to uncap.

Past 100% a ring draws the surplus as an **orbit**: a second, thinner lap just outside it, one per
extra 100%, two at most (the ceiling is 7 ÷ 3 = 233%). Four things here are easy to break:

- **Nothing above the week grid may change height when a score crosses 100%.** The first build
  added a "+N extra days" note and a bonus line that only appeared past 100; the grid jumped 42 px
  under the finger that had just ticked it, and the next tap would have landed on the wrong row.
  The orbit's room is reserved always, and the second caption line is always there and only
  changes what it says. Measure the grid's `top` at 100 / 133 / 233% after touching that area.
- **The orbits are always in the DOM** (zero length, opacity 0), never mounted on demand: an arc
  that mounts at its final length has nothing to transition from and snaps in. Opacity, not dash
  length, is what hides an empty one — a zero-length dash with a round cap can still paint a dot.
- **An extra day has no language of its own, and the app must not pretend it knows.** On Today an
  extra day offers both languages. In the week grid it starts as the language of the day before
  (`langSuggest` — on this cadence the day before a break day is always a language day) and a
  second tap swaps it, a third clears it. Cadence days stay a plain on/off. So `tickLang` now
  takes the language: `tickLang(date, "czech"|"italian"|null)`, and it keeps `tickedAt` across a
  swap so a correction is not re-stamped as a "late" tick.
- **The orbit's entrance delay is dropped once the ring has settled** (`useRingSettled`). Without
  that, every later tick waits 600 ms before the arc answers, which reads as a missed tap.

## Source freshness — the rule that governs every curriculum change (2026-09-04)

The 2026/27 curricula are **not all published**. Everything in `CURRICULUM` is the most recent list
that exists, which is not the same as the current one. Every block therefore carries a `src` into
`SOURCES`, every screen that shows topics shows the age of the list, and the Subjects tab carries
two panels: `FreshnessPanel` (where each list came from) and `ArchivePanel` (what the student's
Drive archive gets wrong). **Never add a curriculum block without a `src`.**

### The trap that invalidates naive checking

**SIS attachments are not year-scoped.** The identical `did` is served under `skr=2023`, `2024`,
`2025` and `2026`. A file appearing on the 2026/27 page is **zero evidence** that it was written
for 2026/27. Only a year printed in the title, the SIS comment, or the document body dates a file.

The page **body**, by contrast, *is* year-scoped, so an edit stamp under `skr=2026` is real. On
that test exactly **two** of the eleven records were genuinely edited for 2026/27 — `EAP0103091`
and `EAP0103090`, both prof. Cendelin.

Two live date traps: `EAP0103320`'s SIS comments say "summer semester 2026" while the documents
open "summer semester 2025/2026"; and `lectures 3rd year summer 24-25 (003).pdf` actually contains
the 2025/2026 schedule. **Trust the body, never the filename or the comment.**

And do not diff whole SIS pages when re-checking — every `skr=2026` page differs from `skr=2025`
in auto-generated fields (capacity, schedule links, teacher rosters). Diff the editorial blocks.

### Pharmacology: the official list is in, and it is pre-final (2026-10-01)

**The curriculum is the department's own 2026-27 oral list: 134 questions — General 35,
Special I 52, Special II 47 — all three blocks `sem:"winter"`, all examined at the winter exam.**
It is the Word file "Pharmacology Exam Requirements_2026-27.docx", which sits behind the login
under **`EAP0102100` (Pharmacology I) → Files**, not under Pharmacology II. Linas's verbatim
transcription, and the department's credit-and-exam rules (still the 2025-26 file), are in his
iCloud folder `Medical School/Jahr II/Pharmacology/Exam topics & curriculum/` — **read-only, never
edit anything there**, and use the list itself, not the transcriber's notes after it. The file has
no question numbers and no sub-points; the G/S1/S2 numbers in the transcription were added by
whoever transcribed it.

**It is not final.** At the first practical on 1 Oct the teacher (Dr. Dědečková) said the list
gets small changes that week — numbering, and some questions moved elsewhere — and that she will
announce the final version. Hence the source status `prefinal`, a status added for this: amber
badge "2026/27 · pre-final", ranked between `old` and `recent`, counted under "lists to replace".
Flip `pha-q` to `current` when the final list is in.

**The codes are `PHA201`–`PHA334`, and the number means nothing.** Codes are tick keys and belong
to a question's content, not its place (the `IIM042` rule):

- `PHA001`–`PHA157` were the 2020 stand-in list and meant other questions. They are retired and
  must never be reused. That is why the new run starts at 201.
- The run is flat, in the order of the 1 Oct file (General 201–235, Special I 236–287,
  Special II 288–334), and deliberately does not encode the block — questions are about to move
  between blocks, and a moved question keeps its code.
- **When the final list arrives, diff by content:** unchanged, reworded or moved → same code; new →
  the next free number from `PHA335`; dropped → the code is retired; split or merged → the
  results are new questions with new codes.
- Titles are byte-identical to the official file and were generated from it by script, never
  retyped. `S1.35` "coronary heart disease" and `S1.37` "ischemic heart disease" are the same
  disease under two names and stay two topics — never merge them silently.

**What a tick on a code that has left `CURRICULUM` does** (traced 2026-10-01; Linas had no
pharmacology ticks, so nothing was orphaned): it is kept — `migrate()` prunes nothing — and it is
invisible to Progress, Subjects, the Plan, the review queue and the week table, which all look
codes up first. The one place that still counts it is `prodStats`' `workN`, which counts every
tick dated this week whatever its code, so an orphan would add one to that week's coursework
ring and show nowhere else. Not fixed; nobody is affected.

**The teacher's other points from 1 Oct**, which exist in no file — they are from Linas's
recording: (1) no official credit test this semester; an optional short test after each practical,
for revision and as practice for the computer test. (2) A pre-term — an exam date in advance —
needs 100% attendance at the practicals; the one allowed absence does not apply, and a missed one
is made up in another group or a make-up lesson. (3) The Moodle practicals course is the same as
before, the first two lectures (antidiarrheals, laxatives) now at the top. (4) Do not park
pharmacology while studying pathophysiology: every year the pathophysiology-first students get
late exam dates and can end up with neither exam passed. That is recorded above `fillDay` as a
second reason for the round-robin. **The exam date picker only accepts dates inside the exam
period, so a pre-term date cannot be booked in the app yet** — told to Linas, not changed.

For the record, the stand-in it replaced: the legacy LFP code **`EA0107015`** carries a complete
157-question list inline and login-free in its "Course assessment methods" field (26 General +
131 Special, last updated November 2020); SIS declares `Interchangeability: EA0107015` on
`EAP0103100` at every skr, and `EAP0103100` itself renders no public Files section.
`https://is.cuni.cz/studium/eng/predmety/index.php?do=predmet&kod=EA0107015&fak=11140&skr=2022`

### Immunology is not a third-year subject and the archive is wrong about it

`EAP0103520 Immunology` has read **"not taught" since skr=2023**; it last ran in 2022/23. The live
course is `EAP0104520 Clinical Immunology and Allergology`, fourth year, winter. The decisive
argument is structural, not plan-based: `EAP0104520`'s prerequisites are `EAP0103090` and
`EAP0103100`, both third-year *winter* courses, and it is itself a winter course — it cannot be
taken concurrently. **Do not write "on every live plan it is fourth year"**: two archaic plans SIS
still renders (`EAVSPM11`, `EVSEOB19`) do list it in third year. Say "on every plan that could
apply to you".

### What to re-check, and when

| When | What |
| --- | --- |
| ~~Immediately, once logged in~~ **done 2026-10-01** | The Pharmacology Word file. It was under `EAP0102100` (Pharmacology I) → Files, not `EAP0103100`; its 134 questions are now the curriculum. Moodle courses 620 and 498 were not needed. |
| **When the practical teacher announces it (she said: the week of 1 Oct)** | The final 2026-27 pharma list, announced by the practical teacher — diff by content, keep the codes of unchanged questions. New questions take `PHA335` onwards; then set `pha-q` to `current`. |
| **During the winter semester** | A 2026-27 version of "Pharmacology II_Credit and Exam" — on 1 Oct SIS still had the 2025-26 file, and the "no credit test" rule is so far only the teacher's word. Also the pre-term dates. |
| ~~Late September 2026~~ **done 2026-09-30** | Pathology's three question PDFs (`did=335822/335828/335830`) re-downloaded and compared question by question with `CURRICULUM`: all 224 identical. The same page now carries the department's 2026/27 lecture and practical schedules (`did=357295`, `357296`, dated 8 Sept 2026) — those are in `TIMETABLE_NOTES`. |
| **By 11 December 2026** | Guarantors must publish winter exam dates in SIS (dean's measure 6/2026, Art. 3.1). |
| **Start of term** | The Pathophysiology WS 2026/2027 practical programme — the department page still links the **2024/2025** file, and the credit condition ("protocols of all experiments") hangs on it. |

One 2026/27 primary source exists **outside** SIS that no SIS page links:
`lfp.cuni.cz/wp-content/uploads/2025/09/Syllabus-of-Pathological-Physiology-II-2026_27.pdf`.
Check department websites as well as SIS.

### Two answers worth not re-deriving

- **Internal medicine: two courses, ONE exam.** `EAP0103322` Introduction to Internal Medicine II
  (3rd, winter, `2/3 C+Ex`, 7 cr) is the only internal-medicine exam of the year, and it examines
  Introduction to Internal Medicine I from second year as well. `EAP0103320` Internal Medicine I.
  (3rd, summer, `2/2 C`, 3 cr) is **credit only** — its "Examination process" field is *empty* and
  the "C" people read out of it belongs to the next row; the free-text "Zapocet, zkouska" on that
  page is a stale 2020 leftover. The 2021/22 exam PDF still attached is for an exam that no longer
  exists. Passing 3322 in winter is a **prerequisite** for taking 3320 in the summer.
  Naming inversion to keep straight: Internal Medicine **I** is taught by the Department of
  Internal Medicine **II** (14-320), and vice versa.
- **Pathology dropped the museum station**, deleted from the requirements in September 2025. One
  slide from a pool of 116 (0-5), then three oral questions (0-10 each), pass 21 of 35, and a zero
  on any single question is an automatic fail. Gross pathology is still examinable *content*.

## Staying signed in (2026-09-03)

The user's complaint was having to press Sync, and seeing "Google session expired" constantly.
Both had the same cause, and it was not the sync code: **auto-sync already worked whenever a token
was valid.** The token was the problem.

**The hard constraint: Google Identity Services gives a browser-only app an access token lasting
about an hour and no refresh token, and `requestAccessToken` opens a POPUP even with `prompt:""`.**
There is no hidden-iframe path in the token model; Google's own documentation says to call it
"from a user-driven event such as a button press". A popup fired from a bare timer has no user
activation behind it and is blocked. That is why the old timer-driven refresh still ended at the
Reconnect banner.

What the rebuild does about it, in order of how much it actually helps:

1. **Renewal rides on the user's own clicks.** A capture-phase `pointerdown`/`keydown` listener
   calls `ensureFresh()` when the token is within ten minutes of expiry, throttled to once a
   minute. The gesture supplies the activation, the popup is allowed, and because consent was
   granted long ago it closes again as a flicker. This is the mechanism that makes the session
   survive a working session with nothing to press.
2. **Cold load tries before it despairs.** `restoreToken()` refuses a token with under a minute
   left, so `_accessToken` is null on any load more than an hour after the last one. The app now
   goes to a `renewing` state and attempts a silent renewal; only a real failure produces
   `reconnect`. Previously it went straight to the banner without ever trying.
3. **The refresh timer is armed whenever an account is remembered**, not only when a live token is
   held, with backoff `[20 s, 60 s, 3 min, 10 min]` on repeated failure.
4. **A `storage` listener shares the renewed token** between the planner and both decks on the
   origin, which all read `sp_gtok`. Whichever tab renews first hands it to the rest.
5. **Edits no longer surrender.** An edit made while the token is stale queues and flushes after
   renewal, instead of flipping the UI to "expired".

`appIsInFront()` (`visibilityState` **and** `document.hasFocus()`) still gates every timer-driven
attempt — see "Focus theft" above; a tab stays "visible" while another app covers it.

### The regression this caused, and the two rules that came out of it (2026-09-08)

Shipping the above **broke signing in altogether**, and it is worth understanding exactly how,
because both mistakes look reasonable on the page.

**1. A background auth attempt spends the activation the button needs.** A popup may only open
while the page holds *transient user activation*, and the FIRST popup of a gesture consumes it.
`renewOnGesture` fired on capture-phase `pointerdown` — i.e. **before** the click handler — and on
a dead session it launched a silent request that cannot possibly succeed. By the time
`acquireToken` asked for the account chooser, there was no activation left, the popup was blocked,
and Reconnect failed every single time. Proven with a stubbed token client that models the
one-popup-per-gesture rule:

```text
OLD: [{prompt:"(silent)", gesture:true}, {prompt:"select_account", gesture:false}]  → FAILED
NEW: [{prompt:"select_account", gesture:true}]                                       → connected
```

So: **an explicit Connect / Reconnect / Switch account goes straight to `prompt:"select_account"`,
synchronously inside the click.** No silent-first, no `await waitForGis` before it, and no second
popup chained behind a failed network round trip — every one of those spends the activation.
Silent-first belongs only in the background paths, where there is no activation to protect.
Relatedly, `getToken` must never coalesce an interactive request onto an in-flight silent one.

**2. `ensureFresh()` returned early on any valid token, so pre-emptive renewal was dead code.**
The whole "renew on the user's clicks" mechanism could only ever run once the token had already
expired — precisely when a silent request fails and a popup does harm. It needs
`ensureFresh({force:true})` to renew a token that is still valid but aging; `renewOnGesture` and
`refreshIfStale` both pass it now.

Two smaller things fixed alongside: gesture renewal now only ever EXTENDS a live token (a dead one
is the button's job), and background auth is gated on `_syncEnabled`, not on `_gaccount` — because
`gcalForget()` deliberately keeps `sp_gaccount`, so "Turn off" used to leave the app still trying
to authenticate on timers and on every tap.

**Test any change here against the activation rule, not just against a happy path.** A stub that
resolves instantly will pass while the real thing is unusable.

**Do not promise the user this is permanent.** Safari's tracking prevention, a signed-out Google
account, or a browser that blocks the popup will still end in Reconnect, and no client-side code
can change that. The only complete fix is an authorization-code flow with a server-side refresh
token, which means a backend — and this project is deliberately backend-free.

**Still whole-blob newest-`updatedAt`-wins.** Two devices editing different things inside the same
25 s window will still lose one side. That was true before and is unchanged; the flashcard decks
merge per-card precisely because that rule was not good enough there.

### Why he still presses Reconnect on every open — diagnosed, NOT yet fixed (2026-09-30)

Linas reported that **every time he opens the app, on both devices, he has to press Reconnect, pick
his account and connect.** He asked only whether staying signed in longer is *possible*. No auth
code was changed; this is the diagnosis, so the next session does not have to redo it.

**What the code does today — read from the source, not inferred:**

- **Cold load more than an hour after the last use always ends in Reconnect.** `restoreToken()`
  finds nothing valid, `live()` → `ensureFresh()` → `requestAccessToken({prompt:""})`, which opens
  a popup with no user gesture behind it, and the browser blocks it. Seen directly this session:
  the built-in preview pane does *not* block popups, and on load it opened `accounts.google.com`.
- **Keeping the window open does not keep him signed in either.** The token lasts an hour and the
  only working renewal is `renewOnGesture`, which fires on a tap *inside the last ten minutes* of
  the token's life. Use the app at minute 5 and again at minute 70 and the session is dead.
- **The timer path is a no-op.** `scheduleRefresh` → `attempt` calls `ensureFresh()` *without*
  `force`, so while the token is still valid it returns the old token, renews nothing and never
  re-arms. (Even with `force` its popup would be blocked — no gesture.)
- **`live()` is not gated on `appIsInFront()`.** Harmless while the browser blocks the popup; it
  would become the old focus-theft bug on any browser that allows popups for this site.
- **Reconnect shows the account chooser by design** (`prompt:"select_account"`). GIS does honour
  the remembered account: the library reads `login_hint: b.login_hint || b.hint`, and in the token
  flow `prompt` *undefined* means `select_account` while `""` sends no prompt at all (checked in
  the live `accounts.google.com/gsi/client` script).

**What Google's own documentation says — fetched 2026-09-30, quoted, not remembered:**

- Token model: *"A user gesture such as button press or clicking on a link is required to request
  and obtain a new, valid access token."* No refresh token, no backend.
- Code model: refresh tokens, but *"On your backend server, you exchange an authorization
  code…"* — a static page cannot use it. The note above about a backend being the only complete
  fix stands.
- **Testing status: *"Authorizations by a test user will expire seven days from the time of
  consent."*** So while the app is in Testing he must re-consent about once a week **whatever the
  client code does.** This was not recorded anywhere before and it caps every option below.
- Publishing: *"A project's publishing status is considered In production after selecting the
  Publish app button"*; unverified apps asking for sensitive scopes get the "unverified app"
  warning screen and a cap of 100 new users. **So "Publish app" does not by itself send the app
  into a verification queue** — the wording further down in this file is stronger than the docs
  support. It is still his decision, not a default: leave the rule as written until he chooses.

**The options, in the order put to him:**

| | What | Needs | Gets |
| --- | --- | --- | --- |
| A | Allow pop-ups for `kadzidrogalinasdraven.github.io` in Chrome | a browser setting, no code | the silent renewals the app already attempts stop being blocked. **Untested.** Side effect: `live()` is ungated, so an hourly popup can flash while the tab is merely visible — gate it first if he keeps this. |
| B | **Silent sign-in with no popup** — the documented redirect flow (`response_type=token`, `prompt=none`, `login_hint`) | code, plus one **Authorised redirect URI** on the OAuth client in Google Cloud | opening the app signs in by itself on both devices. Recommended. |
| C | Lift the seven-day rule | switching the app to "In production" (unverified, warning screen once) | no weekly re-consent. His call; contradicts the "do not click Publish" note below. |
| D | Refresh token | a backend | permanent. Out of scope by design. |

**Design notes for B, so it is not re-derived.** Verified with `curl`, for the case with no Google
session: the endpoint answers a `prompt=none` request with a plain **302** straight back to the
redirect URI, the result in the fragment (`#error=interaction_required`). No HTML page, so no
popup and nothing to click. The success case could not be exercised without his session; Google
documents it as the same redirect carrying `#access_token=…&token_type=Bearer&expires_in=3600`.
  1. *On open with a stale token*: a top-level redirect to Google and back. First-party, so it
     works in Safari and on the iPhone, where third-party cookies are blocked.
  2. *While the window stays open*: the same request in a **hidden iframe** — invisible, but it
     needs third-party cookies, so Chrome on the Mac only. Fall back to the gesture popup.
  3. Guard against a redirect loop (one attempt per load, remembered in `sessionStorage`), check
     `navigator.onLine` before navigating away, send and verify a `state` value, and strip the
     fragment with `history.replaceState` the moment it is read.
  4. `interaction_required` means Google wants a click — signed out, or the weekly Testing expiry.
     Show Reconnect exactly as now. Reconnect itself can then use `prompt:""` with the remembered
     account instead of the chooser: still ONE popup inside the click, so the activation rule
     above is respected.
  5. The redirect URI must match exactly, trailing slash included, and the decks have their own
     paths. Google now labels the implicit redirect flow "discouraged" in favour of code + PKCE,
     which needs the backend this project does not have — it is documented and it works, but it
     is not the future-proof choice, and the token model it replaces is the same grant.
  6. **Cannot be tested from localhost** (not an authorised origin, and must not become one): it
     has to be tried on the live site, in his browser, with him.


---

## What this project is

Two static files, no build step, no npm, no bundler. React 18 UMD + in-browser Babel from a CDN.

**Where it is live (as of 2026-08-08). GitHub Pages is now the primary host, not Netlify:**

| | URL |
| --- | --- |
| Planner | <https://kadzidrogalinasdraven.github.io/study-planner/> |
| Deck (Linas) | <https://kadzidrogalinasdraven.github.io/study-planner/physio_flashcards.html> |
| Deck (Silvia) | <https://kadzidrogalinasdraven.github.io/study-planner/physio_flashcards_silvia.html> |
| Netlify — **stale, do not send anyone here** | <https://peppy-lokum-2c5109.netlify.app> |

Netlify is frozen at the 3,842-explanation build because its deploys are blocked (see below). It is
still serving, so the old links work and quietly show out-of-date content — which is worse than being
down. Treat GitHub Pages as the live site.

| File | What it is |
| --- | --- |
| `index.html` | the study planner — 7 tabs: Today, Plan, Subjects, Progress, Goals, Timeline, Productivity |
| `physio_flashcards.html` | 4,440 true/false cards across 9 topics |
| `physio_flashcards_silvia.html` | **generated** — Silvia's copy of the deck, own progress |
| `make_silvia_copy.py` | regenerates that copy |
| `README.md` | user-facing feature documentation |

**Never hand-edit `physio_flashcards_silvia.html`.** It is derived. After *any* change to
`physio_flashcards.html` — new explanations, a UI fix, anything — run `python3 make_silvia_copy.py`
**in the same commit**, or her deck silently falls behind. The script asserts an exact occurrence
count for every substitution, so it fails loudly rather than quietly if that file changes shape.
(It has already caught one: `grep -c` counts *lines*, not occurrences, and `sp_gtok` appears twice
in code plus once in a comment.)

The substitutions fall into two groups, for two different reasons.

**Storage** — `KEY`, `BACKUP`, `DRIVE_FILE`. Progress is never stored in the HTML, only in
`localStorage` under `KEY`, so a distinct key is what makes her copy start at zero and stay separate
from Linas's, even in the same browser on the same domain. A plain `cp` would have shared his
progress and, if she ever switched sync on, his Drive file too. **Never rename these once she has
used the deck** — that orphans her progress.

**Standalone** — Silvia has the flashcards but no planner, so her copy drops the `← planner` link,
requests only `drive.appdata`, and keeps its token under `sil_gtok` / `sil_gaccount`.

The main deck asks for `calendar.events` even though **the flashcards never call the Calendar API**
(`grep -c 'calendar/v3' physio_flashcards.html` → 0). That is deliberate there: the scope string
matches the planner's so the two share `sp_gtok` and one sign-in covers both. For Silvia it was pure
cost — a personal-calendar permission grant for an app that cannot use it.

**The narrow scope and the private token key are one change, not two.** If her copy asked for
drive-only while still writing to the shared `sp_gtok`, then on a browser they both use her token
would overwrite the planner's and 403 its calendar calls. Never separate them.

Deploy is: commit on `test` → `git checkout main && git merge test --ff-only` → `git push origin main`.
**GitHub Pages serves `main` from the repo root within about a minute — there is nothing to configure
per file.** Pages publishes the whole repository, so any file committed is reachable at its own path.
Netlify still watches `main` too and will resume automatically if its flag ever clears.

### Why Netlify was abandoned (2026-08-08)

Netlify showed *"running on operational credits — production deploys and Agent Runners are paused"*
and stopped building. **This is a known Netlify bug**, not real exhaustion: through July and August
2026 many free-plan teams reported the identical banner while their credit balance was still full,
and support clears the flag by hand. The free fix is a post on <https://answers.netlify.com> naming
the team (**Planer**) and site (`peppy-lokum-2c5109`) — **not yet done**, and no longer urgent.

GitHub Pages was set up instead: repo is public, so it is free, has no build step and no credit
system, and 4.5 MB of HTML is nothing against its 1 GB / 100 GB-per-month limits.

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

### The Google Cloud project — where sign-in actually lives

Nothing in this repo controls Google sign-in beyond the client ID. Everything else is console state,
so it is recorded here or it is lost:

| | |
| --- | --- |
| Project name | **OpenClaw** (nothing to do with this app — it is just the only project on the account) |
| Project ID | `driven-tape-493113-v3` |
| Project number | `272590603949` — the first field of the client ID |
| OAuth client | **planner-web**, `272590603949-tfgcscp9b13kka7gg8epj5tg4o47g6cq.apps.googleusercontent.com` |
| Publishing status | **Testing**, user type External |
| Test users | `kadzidrogalinas@gmail.com`, `silvia.stratta04@gmail.com` |
| Authorised JS origins | `https://peppy-lokum-2c5109.netlify.app`, `https://kadzidrogalinasdraven.github.io` |

There is a second client in the project ending `-3ssj…`; it belongs to something else. Do not touch it.

**Project ID and project number look nothing alike, and the console lists only the ID.** An hour was
lost to this: the Resource Manager showed one project called "OpenClaw" and no sign of `272590603949`,
which looked like the app living under a different Google account. It was the same project.
`https://console.cloud.google.com/iam-admin/settings` shows name, ID and number together.

**Two things must be done in the console for every new person or every new origin**, and both fail in
ways that look like application bugs:

1. **A new user must be added under Zielgruppe/Audience → Test users.** Otherwise Google returns
   `Error 403: access_denied` — *"the app has not completed Google's verification process"* — which
   reads like the app is broken. It is not; Testing status simply admits only listed testers. Cap is
   100, counted over the app's lifetime.
2. **A new origin must be added to Authorised JavaScript origins.** Otherwise `requestAccessToken`
   fails with `origin_mismatch`. Changes can take minutes to hours to propagate.

**Do not click "App veröffentlichen" / "Publish app".** Publishing sends the app into Google's
verification queue for the Drive scope — privacy policy, demo video, weeks of review — to solve a
problem that adding a test user solves in a minute.

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

### Known cosmetic bug — do not "fix" it in a panic

The flashcard sync bar always reads **"Sync on"**, never "Syncing to \<email\>". That is correct
behaviour, not a failure: `SyncBar` renders `email ? "Syncing to "+email : "Sync on"`, and in the deck
`setEmail` is declared and never called — the deck makes no `drive/v3/about` call, while the planner
makes exactly one. **"Sync on" means connected and syncing.** Worth wiring up properly one day, by
reusing the planner's call, so that on a shared device the deck can say which account it is using.
Not before the exam.

## Open items

- The **Netlify support post has not been made**. Doing it would restore the old URL; it is optional
  now that Pages is primary.
- No **custom domain** yet. This is the one change that would stop all of this recurring: the domain
  becomes the identity, the host becomes disposable, and no future move costs progress or an OAuth
  re-registration. ~€10/year. See the hosting section.
- Only one of three redesign directions survived a truncated payload during the flashcard redesign;
  the other two were never scored.


---

## Where things stand — 2026-09-28

Three days before the year opens. This section is the **session log**: it is appended to as work
happens, so the chat can be cleared at any point. Newest entries at the bottom.

### State on arrival

- Planner live on GitHub Pages with the third-year rebuild, the 700-topic curriculum, source
  freshness badges, and the sign-in fix of 2026-09-08 (Connect/Reconnect open the account chooser
  synchronously inside the click). **Linas has not yet confirmed that Connect works for him
  since that fix** — if sync still fails, that is the first thing to re-test, on the Mac first.
- Nothing has been ticked yet; the year has not started.

### The winter timetable — group 3.AVSEOB20-5 (from Linas's SIS screenshot, 2026-09-28)

> **CORRECTED 2026-09-30 — read this before anything below about odd and even weeks.**
> SIS's odd/even is the parity of the **teaching week**, not of the calendar week. SIS says so
> itself, on the room page for the simulation centre (`roz_ucebna_macro.php?…&ucebna=150015546`):
> *"3.AVSEOB20-5 even (odd numbered in calendar)"*. Teaching week 1 is the week of 28 Sep
> (ISO week 40), so until Christmas every SIS label is the opposite of the ISO parity. The
> planner and the Calendar were built the wrong way round on 09-28 — on Linas's answer, which
> was a guess — and would have sent him to the first Simulation Medicine practical a week late.
> **The room pages in the public SIS registry print the week rule and the group; check there,
> not in a screenshot.** The break is not counted: 4–8 Jan is teaching week 13.
>
> | | Was (wrong) | Is |
> | --- | --- | --- |
> | Simulation Medicine, Wed 07:30 | 14 Oct, 28 Oct, 11 Nov, 25 Nov, 9 Dec | **7 Oct, 21 Oct, 4 Nov, 18 Nov, 2 Dec, 16 Dec** |
> | Psychology seminar, Thu 11:00 | 8 Oct, 22 Oct, 5 Nov, 19 Nov, 3 Dec, 17 Dec, 7 Jan | **1 Oct, 15 Oct, 29 Oct, 19 Nov, 26 Nov, 10 Dec, 7 Jan** |
>
> The Psychology dates are the department's own list (group 5; 12 Nov was moved to 19 Nov), so
> that slot carries `dates` and ignores the week rule. **Wed 6 Jan is the one open date:** by the
> teaching-week count group 5 has no Simulation Medicine (week 13 is odd), by SIS's "odd numbered
> in calendar" it has (ISO week 1). It stays on and flagged. Six sessions also matches the six
> winter topics in the syllabus, which argues for "no".
> **Settled 2026-10-01: no.** The course coordinator's e-mail lists six sessions for group 5 —
> 7 and 21 Oct, 4 and 18 Nov, 2 and 16 Dec — and nothing in January. The slot now carries
> `dates`, and `TIMETABLE_EXTRA` / `TIMETABLE_CONFIRM` are empty.
>
> **Public holidays were missing too:** Wed 28 Oct and Tue 17 Nov have no classes
> (`PUBLIC_HOLIDAYS`). They are deliberately not in `TERMS.breaks` — a break week is skipped when
> teaching weeks are counted, a single day is not.

Lectures are the whole year group (`3.AVSEOB20`); practicals/seminars are **group 5**
(`3.AVSEOB20-5`). Room names ending in `-?` were cut off in the screenshot. Times are Europe/Prague.

| Day | Time | Course | Kind | Room | Teacher | Weeks |
| --- | --- | --- | --- | --- | --- | --- |
| Mon | 08:00–10:30 | Pathological Physiology II. | practical | UPF-J | Purkartová Zdeňka, MUDr., Ph.D. | all |
| Mon | 11:00–13:30 | Pharmacology II. | lecture | P-HNĚDÁ | Kučera Radek, prof. PharmDr., Ph.D. | all |
| Tue | 08:00–10:30 | Introduction to Internal Medicine II | practical | — (not shown) | Mlíková Seidlerová Jitka, prof. MUDr. | all |
| Tue | 11:00–12:40 | Introduction to Internal Medicine II | lecture | P4 | Mlíková Seidlerová Jitka | all |
| Wed | 07:30–09:10 | Simulation Medicine | practical | USIM5.21A-? | Smékalová Olga, MUDr. | **even** |
| Wed | 11:15–12:55 | Pathological Physiology II. | lecture | P-HNĚDÁ | Barcal Jan, MUDr., Ph.D. | all |
| Wed | 13:30–15:10 | Czech for Medical Practice | seminar | USL4.21-? | Kopřivová Tamara, PhD | all |
| Thu | 08:00–10:30 | Pharmacology II. | practical | U2.5.-PRAKT | Dědečková Eva, PharmDr. Bc., Ph.D. | all |
| Thu | 11:00–12:40 | Medical Psychology and Ethics | seminar | — (not shown) | Vevera Jan, prof. MUDr. | **odd** |
| Thu | 13:10–15:40 | Pathology | lecture | P-HNĚDÁ | Skálová Alena, prof. MUDr., CSc. | all |
| Fri | 08:00–10:30 | Pathology | practical | U3.15-PRAKT | Daumová Magdaléna, MUDr., Ph.D. | all |
| Fri | 11:15–13:45 | Medical Psychology and Ethics | lecture | P-MODRÁ | Vevera Jan, prof. MUDr., Ph.D.; Fiala… | all; **16.10.2026 cancelled** ("due to the r…", cut off) |

Cross-checks against the audit of 2026-09-04, all consistent: `P-HNĚDÁ` is the Brown lecture hall
the audit said Pathology lectures moved to; `U3.15-PRAKT` is "campus room 3.15"; the MPE seminar
being fortnightly matches SIS's "two-lessons block once in two weeks". Contact load is roughly
**22–26 h a week**, heaviest on Thursday. The four summer courses (Internal Medicine I,
Propedeutics of Surgery, Neurobehavioral sciences, Radiological Anatomy) are absent, as expected.

**Open — must be answered before the calendar events are created:**

1. **Even/odd weeks: calendar-week parity or semester-week parity?** *(Answered wrongly on 09-28;
   it is semester-week parity — see the correction above.)* They give different dates.
   1 Oct 2026 is a Thursday in ISO week 40 (even). By calendar parity, the first Simulation
   Medicine session is Wed **14 Oct** and the first MPE seminar Thu **8 Oct**; by semester-week
   parity (week 1 = 28 Sep–4 Oct), they are Wed **7 Oct** and Thu **1 Oct**. Charles University's
   timetable module normally means *calendar* week (sudý/lichý týden), which is the working
   assumption — confirm against the first Simulation Medicine session.
2. The two truncated room names and the Friday cancellation reason.
3. Reminder lead time for the calendar events, and whether they go into the primary calendar or a
   separate "Classes" calendar.

### Plan for the timetable (agreed direction, not yet built)

- `TIMETABLE` constant in `index.html`: weekly slots `{day, start, end, subject, kind, room,
  teacher, weeks:"all"|"even"|"odd"}`, valid for winter teaching **1 Oct 2026 – 8 Jan 2027**,
  excluding **21 Dec – 1 Jan**. Summer timetable to be added when Linas has it (Feb 2027).
- Today tab shows today's classes with the next one highlighted; a compact week view elsewhere.
- **Push notifications = Google Calendar reminders.** A backend-free static page cannot send web
  push (that needs a push server), so the honest mechanism is recurring Calendar events with popup
  reminders — the Google Calendar app on the phone delivers those as push. Events are created
  directly through the Calendar connector (not through the app's own token), as recurring weekly
  events with `UNTIL=20270108`, `EXDATE`s for the holiday fortnight and 16 Oct, and fortnightly
  ones with `INTERVAL=2` from the correct first date.
- The planner's calendar feed must **exclude** class events from "Upcoming" (they would flood it)
  — tag their descriptions with a marker and filter on it.
- The daily study budget (`PHASES`) stays at Linas's 3 h; class hours are displayed, not
  subtracted, unless he asks.

### Session log

- 2026-09-28 · Memory note added: keep this log as work happens, save before he clears, and tell
  him when the session is long enough to clear.
- 2026-09-28 · Timetable transcribed from the screenshot (table above).
- 2026-09-28 · Calendar connector verified: writes to the primary calendar
  `kadzidrogalinas@gmail.com` (tz Europe/Berlin, same offset as Prague), default reminder is a
  **30-min popup**, and there is only one writable calendar — no "Classes" calendar can be created
  through the connector, so events go into primary. No class events exist for October yet.
- 2026-09-28 · Questions 1–3 above put to Linas, plus whether Connect works since the 09-08 fix.
- 2026-09-28 · **Answers.** (1) Even/odd = **ISO calendar-week parity**. (2) Reminder **30 min
  popup**. (3) Use the visible room codes, but try to decode them into real locations (building,
  floor, room) — an agent is on it; fall back to the raw code. (4) **Sync works on both devices**
  since the 09-08 fix — confirmed by Linas.
- 2026-09-28 · **The ISO week-53 trap.** 2026 has 53 ISO weeks (1 Jan 2026 was a Thursday), so
  week 53 (28 Dec–3 Jan) and week 1 of 2027 (4–10 Jan) are BOTH odd. Under strict ISO parity the
  fortnightly classes therefore fall as: Simulation Medicine (even) 14 Oct, 28 Oct, 11 Nov,
  25 Nov, 9 Dec — and NOT 6 Jan; MPE seminar (odd) 8 Oct, 22 Oct, 5 Nov, 19 Nov, 3 Dec, 17 Dec,
  and 7 Jan. A plain 14-day cadence would instead give Sim Med on 6 Jan and no MPE on 7 Jan.
  The two conventions agree through December and differ only on **6/7 January** — those two
  dates are flagged in the events and must be confirmed in SIS.
- 2026-09-28 · **Timetable built into `index.html`**: `TERMS`, `TIMETABLE` (12 winter slots),
  `TIMETABLE_CANCELLED`, `TIMETABLE_CONFIRM`, `ROOMS`, and helpers `isoWeek` (removed 09-30) / `termOf` /
  `classesOn` / `classHours` / `classSpan`. New **Classes** tab (week view with prev/next),
  `ClassesToday` card on Today under the countdown, `ClassLine` per day on Plan. The calendar
  feed now drops events whose description carries `[planner:class]`, so the Calendar copies of
  the classes never flood "Upcoming". Node-verified: week 41 = 24.2 h, week 42 = 21.7 h of
  classes; fortnightly dates as listed above; 16 Oct lecture cancelled; holidays empty.
- 2026-09-28 · **Rooms decoded** from the public SIS room registry
  (`is.cuni.cz/studium/rozvrhng/roz_ucebna_macro.php?skr=2026&sem=1&fak=11140`, per-room pages
  `…&ucebna=<id>`), cross-checked against the faculty Kontakty directory. All eight in `ROOMS`.
  How to read a code: `P-<colour>` = campus lecture hall (Green/Brown/Azure in U1, Blue in U2);
  bare `P1`/`P4` = hospital lecture rooms; `U<inst><floor>.<room>` = classroom, door number =
  floor.room, **building not encoded** (U2.5 is U1 floor 2). **`P4` is at FN Bory, Dr. E.
  Beneše 13 — across town**, trolleybus 16 to Nemocnice Bory, right after an 08:00 practical.
  U1 = the 2022 building ("UniMeC 1"), U2 = the 2014 one; the archive's "UNIMEC 2, 6th floor"
  for simulation meant today's U1 (sim centre floors 5–6, briefing room 5.21a).
- 2026-09-28 · The two parity-ambiguous January sessions (Sim Med 6 Jan, MPE seminar 7 Jan) are
  **shown and flagged, not dropped** — `TIMETABLE_EXTRA` forces Sim Med on 6 Jan. A missed
  Simulation Medicine practical costs the credit (attendance at every one is required).
- 2026-09-28 · **Twelve recurring events created in the primary Google Calendar** through the
  connector, each with a 30-min popup reminder, per-subject colour, location = decoded room,
  and `[planner:class <subject>]` in the description (which the planner's feed filters on).
  Weekly ones: `RRULE:FREQ=WEEKLY;UNTIL=20270108T235959Z` + EXDATEs for 21 Dec–1 Jan.
  Sim Med: `INTERVAL=2` from 14 Oct, EXDATE 23 Dec (so 6 Jan IS included, flagged in the text).
  MPE seminar: `INTERVAL=2` from 8 Oct, EXDATE 31 Dec, **RDATE 7 Jan**. MPE lecture: EXDATE
  16 Oct as well. Event ids: pfy-prac `notrimnmb859v5e1efes70hc9c`, pha-lec
  `jjdmrju2uqg7jju4v5h74d73lc`, iim-prac `o80u6mq6n8sc7gumie2fcbqd4o`, iim-lec
  `842qrr7buf69ghc8phgsdu2qe8`, sim-prac `ev2fhs1vs1o7q4ad1rhvcqirj8`, pfy-lec
  `ipvknnl054h6hn6lp3ovrrf30g`, cze-sem `r9mfu8ntk0e7uv3m6oouuhr3us`, pha-prac
  `0ba3b28nor7g2ss3mdp3shsgb8`, mpe-sem `fnk9khjrmeq3u3cfjlnrcmvq7g`, pat-lec
  `dqvike3svmgrluhocr9p327b50`, pat-prac `v8fkeqp5e0objcl23n9ak8e64s`, mpe-lec
  `gm5og0cg2847r73imho61s43pk`. **To change the whole series, update the event by id; to change
  one date, edit that instance in Calendar.** When the summer timetable arrives, create a second
  set the same way and add the slots to `TIMETABLE` with `term:"summer"`.
- 2026-09-28 · Deployed as `e721f98`. The built-in browser pane is blocked by a stale Google
  sign-in popup from localhost (origin_mismatch — expected; localhost is not and must not be an
  authorised origin). Visual check moved to Chrome at Linas's request.
- 2026-09-28 · **Calendar expansion verified on Google's side** by listing 12–16 Oct and
  21 Dec–11 Jan: Sim Med on 14 Oct and no MPE seminar that week (even week ✓); MPE lecture absent
  on 16 Oct ✓; nothing at all 21 Dec–3 Jan ✓; 6 Jan Sim Med present (flagged) ✓; 7 Jan MPE
  seminar present via RDATE ✓; nothing after 8 Jan ✓. Every instance carries the 30-min popup.
- 2026-09-28 · **Visual pass done in Chrome on the live site**: eight tabs, "Signed in · syncing
  automatically", Today card reads "Winter teaching opens Thursday 1 October", Plan days carry
  class lines, Classes tab shows week 41 with every decoded room. No console errors.
- 2026-09-28 · **Session state is complete; safe to clear.** Open items for the next session:
  (a) confirm the 6/7 Jan fortnightly sessions in SIS once the department posts January dates;
  (b) the Tuesday practical and Thursday seminar rooms are not in the SIS timetable — ask at the
  first class and fill `TIMETABLE[].room` + edit the two Calendar series; (c) summer timetable in
  February — add `term:"summer"` slots and a second set of Calendar series; (d) the standing
  re-check list under "Source freshness" (Pathology PDFs late Sept, IM II list ~24 Nov,
  Pharmacology Word file once logged in). Nothing is half-done.
- 2026-09-30 · **Languages can now pass 100%**, at Linas's request: all seven days open in the
  week grid (dashed = extra), the languages ring and the combined score both carry the surplus,
  and a full ring shows it as a thinner second lap outside. Gym and coursework still stop at 100.
  Rules and the four things that are easy to break are under "Productivity" above.
- 2026-09-30 · Decisions made without asking, each one reversible: (1) coursework stays capped —
  he named languages only; (2) an extra day in the grid starts as the language of the day before
  and a second tap swaps it, while Today offers both languages outright; (3) the orbit is a
  concentric thin lap, not an Apple-style overlap, because the languages ring is two-coloured and
  a second lap drawn on top would hide the split. All three were told to him.
- 2026-09-30 · Verified: 18 worked weeks through the shipped `prodStats` source in Node (4 of 3 =
  133% → combined 108; 7 of 3 = 233% → 133; 7 of 4 = 175% → 119; gym 5 of 3 stays 100); then in a
  real browser via Playwright at 1100 px and 375 px — tap cycle on an extra day, plain toggle on a
  cadence day, Today strip on both kinds of day (clock faked to Thu 1 Oct and Wed 7 Oct), week
  grid `top` identical at 100 / 133 / 167 / 200 / 233%, reduced motion lands instantly, no console
  errors. **The built-in browser pane is unusable for this app while its localhost profile has
  sync switched on** — the cold-load renewal opens a Google popup the agent may not close, and
  closing the opener tab is the only way out. Use Playwright, whose profile has sync off.
- 2026-09-30 · **Sign-in question answered, nothing changed.** He must press Reconnect on every
  open; the cause and four options are written up under "Staying signed in → Why he still presses
  Reconnect". Waiting on his choice between A (allow pop-ups, no code) and B (build the no-popup
  silent sign-in, needs one redirect URI in Google Cloud). New fact worth remembering: **in
  Testing status Google expires every authorisation after seven days**, so a weekly re-consent
  survives any client-side fix.
- 2026-09-30 · Not done, and deliberately: extra days show no practice link on Today (the
  `LangChip` still follows the cadence only). Mentioned to him; add it if he asks.
- 2026-09-30 · **Deployed as `65fabda`.** GitHub Pages picked it up in about a minute; the live
  `index.html` is byte-identical to the commit. Checked on the live origin in a clean browser
  profile (sync off, nothing stored): four language days against three reads 133% with one orbit
  and "includes +8% from extra language days"; the only console error is the browser's own
  request for a `favicon.ico` the site has never had.
- 2026-09-30 · **Session state is complete; safe to clear.** The one open item is his answer on
  sign-in (option A or B above). Nothing is half-done.
- 2026-09-30 · **Sign-in, option A is now in place on the Mac — result not yet known.** His
  screenshot of Chrome → Pop-ups and redirects shows `https://kadzidrogalinasdraven.github.io`
  AND the old Netlify origin under "Allowed", **and the default itself set to "Sites can send
  pop-ups and use redirects"**. Unknown whether he switched the default on just now or it was
  already so. It matters: **if pop-ups were already allowed for every site before today, then a
  blocked popup was never what sent him to Reconnect**, and the diagnosis above needs a second
  look (the silent request would then be failing inside Google — the weekly Testing expiry is the
  first suspect). Asked him which it was, and told him to set the default back to "Don't allow"
  if he had changed it, since the planner only needs its own line. **The test is to open the app
  after more than an hour and see whether Reconnect appears.** Ask for the outcome first thing.
- 2026-09-30 · **Coursework on the Productivity tab now follows the Plan**, at his request: the
  ring's target is the week's planned topics (12 this week, 21 in a full one) instead of the
  39-a-week pace, and the week grid lists each day's topics as tickable boxes under Gym and
  Languages. Rules under "Productivity" and "Today's list holds still" above.
- 2026-09-30 · **One change he did not ask for, made because the request could not work without
  it: Today's list no longer refills.** A ticked topic stays on today's list, ticked, and Today
  says when the list is done; before, tomorrow's first topic slid up to replace it. Told to him
  plainly, with how to reverse it (`startDay` → plan today from the live state again).
- 2026-09-30 · Verified in the real app, in a browser, against the running engine rather than a
  copy of it: 68 states identical to the deployed engine when nothing is ticked today; 26 engine
  invariants (pinning, working ahead, six weeks on plan = 504 Plan-vs-table comparisons, 210
  day-states of random ticking with the week unmoved, behind, empty weeks, 40 consecutive weeks);
  8 scoring cases; then the clicks themselves — box in the grid → Today shows it ticked and does
  not refill → tick on Today → box in the grid → tick on Plan → "Today's list is done"; a skipped
  Friday seen from Saturday (3 behind, outlined); work beyond the week (+1, +2); 375 px; reduced
  motion; all eight tabs; no console errors.
- 2026-09-30 · **The built-in browser pane works again on a second port.** `.claude/launch.json`
  has `planner-clean` on 8732: a different origin, so an empty localStorage, so sync is off and
  no Google popup opens. Use that one, never `planner` on 8731. (The file is local, untracked.)
- 2026-09-30 · **Deployed as `0264502`.** Live `index.html` byte-identical to the commit; the
  same 34 engine and scoring checks pass on the live origin; ticking two boxes in the grid with
  the clock set to Thursday reads 2 / 12 and shows both ticked on Today, the third still open.
  The test suite is a single `page.evaluate`, kept where it survives a new session:
  `~/.claude/projects/-Users-linas-Projects-study-planner/tests/engine-tests.js`. It needs
  nothing but the loaded page, because every engine function is a global there. To run it, copy
  it into `.playwright-mcp/` (the Playwright tool only reads files under the repo) and pass that
  path as `filename` to `browser_run_code_unsafe`; it returns `{checks, fails, failed}`.
- 2026-09-30 · **Open, for him:** (1) was Chrome's pop-up default already on "allow" before
  today, and does Reconnect still appear after an hour; (2) whether Today holding still is what
  he wants, now that he can see it; (3) whether he wants the no-popup sign-in built. His own Plan
  may not match the example he gave (Pharmacology ×2 tomorrow): on an untouched plan Thursday is
  one topic each of Pharmacology, Pathology and Pathophysiology — 2.75 h of his 3 h, and a second
  0.75 h topic does not fit. The table shows whatever his Plan shows.
- 2026-09-30 · **Session state is complete; safe to clear.**
- 2026-09-30 · **His answers.** (3) The no-popup sign-in is **deferred — "we'll do it later"**.
  Do not build it unprompted; the design notes under "Staying signed in" are ready when he asks.
  (1) He reports sign-in "working fine enough after changing settings", and will check in an
  hour whether Reconnect still appears — **ask for that result first thing next session.** He did
  not say whether Chrome's pop-up default was already on "allow" before today, so that question
  is still open, and with it whether the default should go back to "Don't allow". (2) No comment
  on Today holding still; treat it as accepted unless he raises it.
- 2026-09-30 · **Documents from other students, read and built in.** Two emails, two PDFs:
  the Psychology department's seminar schedule for groups 1–5, and the 2nd Dept. of Internal
  Medicine's rules and practicals schedule for winter 2026/27. What they changed:
  - **The odd/even rule was backwards** — see the correction box under "The winter timetable".
    `classesOn` now uses `teachWeek()`; `isoWeek()` is gone. The Psychology seminar slot has
    `dates`; `TIMETABLE_NOTES` holds what each session is about (seminar topics, the first
    internal-medicine class, the practical-exam window); a slot may carry a standing `note`.
  - **Internal medicine practical, Tue 08:00:** at the Bory hospital like the lecture; first
    class starts at the Clinic Office (Secretariat); bring a white coat, slippers, stethoscope,
    visible ID card. Group 5 is split into **5A doc. Hirmerová / 5B Dr. Nussbaumerová** —
    **Linas has not yet said which he is in**; the slot shows both until he does. The practical
    exam is sat in class time in the last two weeks: Tue 15 Dec or Tue 5 Jan.
  - **The credit wording changed.** 2026/27: "a minimum of 10 classes, 9 practical classes and a
    practical exam". The 09-04 audit had "10 lectures". 11 Tuesdays are taught (17 Nov is a
    holiday). `creditRule` quotes the new sentence rather than interpreting it.
  - **The 2026/27 internal-medicine question list is already in SIS** and replaced the 2025/26
    one: 42 topics, 701 in all. Found only because the SIS page was opened to check the credit
    wording — four new files are attached there (`did=358386` practicals, `358387` rules,
    `357554` questions, `336406` application form for the practical exam).
  - **Psychology:** seminars are in the Dept. of Psychiatry's seminar room, 1st floor; the last
    one (7 Jan) is "Evaluation of essays". The email gives a Moodle enrolment key — **it is
    deliberately not in this repo, which is public.** He has the email.
- 2026-09-30 · **Calendar, and what the connector can and cannot do.** `update_event` has no
  recurrence field, so a series' rule cannot be changed. Both fortnightly series were fixed by
  **moving each instance seven days earlier** (an instance id is `<series id>_<original start in
  UTC>`, e.g. `…_20261014T053000Z`), which needs no deletion. So in Calendar these two series now
  consist entirely of exceptions, and the masters' own rules are still the old wrong ones — never
  "reset" them. Simulation Medicine on 16 Dec had no instance to move and is a **single event**,
  id `kkrpjufj98pf6kpa2itvkvs6to`. The four class instances on 28 Oct and 17 Nov were retitled
  "NO CLASS — public holiday", reminders removed, marked free — not deleted, because deleting
  needs his say-so. Both internal-medicine masters got new descriptions.
- 2026-09-30 · Verified in the running app: Simulation Medicine on 7 Oct … 16 Dec plus 6 Jan
  flagged; the seminar on the department's seven dates; 11 internal-medicine Tuesdays; nothing
  on 28 Oct or 17 Nov; 701 topics, no integrity warnings. In Calendar: 7 Oct shows the practical
  and 14 Oct does not.
- 2026-09-30 · **Open, for him:** (1) 5A or 5B; (2) whether to delete the four "NO CLASS"
  entries; (3) ask at a Simulation Medicine practical whether 6 Jan runs; (4) still from before:
  does Reconnect appear after an hour. **Due and not done:** the late-September re-download of
  Pathology's three question PDFs (see "What to re-check, and when").
- 2026-09-30 · **Deployed as `1e8ae83`.** Live `index.html` matched the commit 40 s after the push.
- 2026-09-30 · **His answers.** (1) 5A/5B: he thinks the SIS screenshot shows the teacher — it
  shows prof. Mlíková Seidlerová for the whole group-5 slot, which is the department head, not
  the subgroup teacher. His Gmail has **no** mail from the 2nd Dept. of Internal Medicine at all
  (searched for the secretary, the subject, the subgroups): the screenshots came from other
  students, so the department's list may not include his Gmail. **Still open** — he finds out at
  the first class on 6 Oct, or asks the secretary. (2) **Keep the "NO CLASS" Calendar entries** —
  he wants to see when a class is off. That is now the convention: a cancelled class is retitled
  "NO CLASS — …", reminders off, marked free, never deleted. (4) Pathology re-check: done, above.
- 2026-09-30 · **Pathology's 2026/27 schedules change week 1.** No lecture Thu 1 Oct, no
  practical Fri 2 Oct, and the 15 Oct lecture is "Moodle only". All three are in
  `TIMETABLE_CANCELLED` (with a note saying why) and in Calendar as "NO CLASS" / "MOODLE ONLY"
  instances. Every lecture and practical topic of the term is in `TIMETABLE_NOTES` and in the
  two Pathology series' descriptions; credits are given at the last practical, Fri 8 Jan.
  `ClassRow` now shows a date note on a cancelled class too. Tomorrow, Thu 1 Oct, is therefore
  Pharmacology practical 08:00 + Psychology seminar 11:00, nothing else — 4.2 h, not 6.7.
- 2026-09-30 · Also on SIS now, not acted on: a **2026/27 document for Medical Czech**
  (`EAP0103050`, `did=358528`) listing eight topics — the same content as the ten in `CZE-1`
  (Ophthalmology and ENT merged, no grammar line), so the block was left alone. Pathophysiology
  has 2026/27 oral and practical question files (`did=354571/354572`), already the basis of
  `PFY`. Pharmacology and Simulation Medicine still attach nothing.
- 2026-09-30 · Seen in his Gmail while looking for the subgroup mail, worth his attention: a
  meeting with **prof. Štengl on Mon 12 Oct at 10:00** (physiology notes) that he agreed to on
  17 Sep — it collides with the Pathophysiology practical (08:00–10:30) and is followed by the
  Pharmacology lecture at 11:00. Told to him; nothing changed.
  **Session state is complete; safe to clear.**
- 2026-10-01 · **Pharmacology is the official 2026-27 list now: 134 questions in three blocks,
  marked pre-final.** Codes `PHA201`–`PHA334`; the old `PHA001`–`PHA157` are retired. Rules, the
  teacher's points from the first practical, and what to do when the final list arrives are under
  "Pharmacology: the official list is in". The credit rule no longer has a credit test and names
  the pre-term condition; the 1 Oct practical carries a note; the teacher's "do not park
  pharmacology" advice is in the comment above `fillDay`. Linas had ticked no topics, so nothing
  was orphaned. 678 topics, 22 blocks.
- 2026-10-01 · Verified by script: 35 + 52 + 47 = 134, every title byte-identical to the official
  file, no new code equal to an old one. In the browser (`planner-clean`): Pharmacology 0/134,
  three blocks, badge "2026/27 · pre-final", "1 list to replace", ~0.75 h a topic before and
  after (exact 0.64 → 0.75), 117.75 h → 100.5 h in total, year overflow 74 h → 60 h
  (Pharmacology 26 h → 11 h), no console errors. **The pane caches `index.html`: after an edit,
  load `index.html?r=1` or it shows the old file.**
- 2026-10-01 · **A side effect he has been told about, not fixed: no Pathophysiology on the Plan
  until 25 October** if the Plan is followed exactly — see the fifth engine rule. Today's list
  went from Pharmacology / Pathology / Pathophysiology to Pathology / Pharmacology ×2. Waiting on
  his choice: leave it, merge Special I and II into one block, or change the ranking.
- 2026-10-01 · **The engine test suite: 30 of 34 pass, and the four that fail are expectations
  tied to the old list, not engine faults.** (1) "a full teaching week: 21 topics" and (2) the
  full-week scoring case expect 21 — it is 19 now. (3) "tomorrow is refilled to its budget"
  compares item counts: tomorrow became one 2.5 h internal-medicine topic instead of three small
  ones, which is still a full 3 h day. (4) the "15 ticked against 12" case ticks `PHA100` and
  `PHA101`, which no longer exist, so two of its three extras are orphans. The file
  (`~/.claude/projects/…/tests/engine-tests.js`) was **not edited** — it is outside the files he
  allowed. Update those four expectations before trusting a red result from it.
- 2026-10-01 · **Simulation Medicine, from the course coordinator's e-mail of 1 Oct** (sent by the
  secretary, Mgr. Jana Hrabová; in his Gmail): group 5 has six sessions, 07:30–09:10 on 7 and
  21 Oct, 4 and 18 Nov, 2 and 16 Dec — so **6 Jan does not run** and the flag is gone. Credit, each
  semester: 100% attendance including substitute sessions (a class on a public holiday counts as
  done), and the Moodle theory and assignments completed before each class, checked at the start
  and a condition for being let in. No more than five minutes late. A substitute session must be
  on the same topic and confirmed by the secretary first; extra ones run 11–15 Jan 2027, times to
  come. All of it is in `creditRule` and a standing note on the slot. **The Moodle enrolment key
  is in the e-mail and deliberately not in this public repo.** The staff e-mail addresses are not
  here either.
- 2026-10-01 · **Not done, and his to decide:** the Google Calendar series still has a Simulation
  Medicine entry on Wed 6 Jan — by his convention it should become "NO CLASS", but he asked only
  for the planner. Also pre-existing and merely noticed: the Plan does not schedule a Simulation
  Medicine topic until mid-December although the first class, with compulsory Moodle preparation,
  is 7 Oct — its block's pressure is too low to win a slot.
- 2026-10-01 · **An open question from him about hours.** Told that a code comment still says
  "nearly four hours a topic" for Pharmacology, he answered that 4 h a topic is more realistic and
  that it should be realistic for every topic. Not acted on: it contradicts "hours are derived"
  and his own instruction in the same session to change no constants, and at 4 h the 134
  pharmacology topics alone are 536 h. Asked him what he meant. If he does want it, the estimate
  is his to give (see the memory note on effort estimates) and the lever is the constants or a
  per-subject figure from him — never a number invented here.
- 2026-10-01 · **Deployed as `49dae8d`.** GitHub Pages was slow this time: the live `index.html`
  was still the old one two minutes after the push and matched the commit byte for byte at
  10:37. Checked on the live origin in the browser pane: 678 topics, 22 blocks, Pharmacology
  35 / 52 / 47 with the "2026/27 · pre-final" badge, the 1 Oct practical note on Today,
  Simulation Medicine on its six dates and nothing on 6 Jan, no console errors.
  **Open, for him:** (1) the Pathophysiology gap until 25 Oct — leave, merge the two Special
  blocks, or change the ranking; (2) what he meant by "4 h per topic"; (3) whether to mark the
  6 Jan Simulation Medicine entry in Google Calendar "NO CLASS"; (4) whether the four stale
  expectations in the engine test file may be updated; (5) from before: 5A or 5B, and whether
  Reconnect still appears after an hour.

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
- **Two topic lists are a year behind** (Intro to Internal Medicine II, 2025/26) or were rejected
  as stale (Internal Medicine I, 2021/22 — the current SIS syllabus was used instead). Re-check
  both once 2026/27 files appear.
- ~~**Pharmacology II has no public question list.**~~ **Resolved 2026-10-01:** the official
  2026-27 list (134 questions, pre-final) is the curriculum — see "Pharmacology: the official
  list is in".
- **The daily budget is 3 h in term and 8 h in an exam block, at the user's request.** At those
  numbers the year is tight but close to fitting; the overflow banner reports the shortfall per
  subject rather than hiding it. If it ever reads absurd, check `PHASES` before blaming the maths.
- `.playwright-mcp/` and the duplicate `exam structure/Copia di Physiology Triplets tg.pdf` are
  still untracked. Neither PDF is load-bearing any more.
