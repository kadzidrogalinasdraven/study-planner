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

**Keep it lean, too: every session reads all of it, and so does the planner check, twice a day.**
Rules, reasoning and the current state live here. What each session did, dated, goes to
`docs/SESSION-LOG.md` — append as you work, newest at the bottom — and finished history to
`docs/HISTORY.md`; both are read only when a question needs them. (Split out on 2026-10-03,
when this file had grown to 135 KB.)

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

## Now — state and open items (updated 2026-10-07)

**Live:** the third-year planner on GitHub Pages. Since 3 Oct the winter's study time is shared
40/30/20/7/3 (pathophysiology, pharmacology, internal medicine, pathology, the rest) and the
overflow banner reads about 505 h. The planner check — a cloud routine, morning and evening — is
in dry run until 6 Oct and live from 7 Oct (see "The planner check" below).

**Open, for him — his clicks and his answers:**
1. The four **"Ask:" events** in his Calendar (Mon 5, Tue 6, Thu 8, Thu 15 Oct): the answers go
   into the planner, by the planner check if they arrive by official mail. Tue 6 Oct: tell
   Dr. Nussbaumerová he swapped into 5B, and ask for his practical-exam date (15 Dec or 5 Jan).
2. The **final pharmacology list** (pre-final since 1 Oct): diff by content, new codes from
   `PHA335` — "Pharmacology: the official list is in".
3. The **essay date**: 11 Nov stands, flagged, until 18 Nov is confirmed.
4. **Sign-in:** the no-popup sign-in is deferred ("we'll do it later"); whether Reconnect still
   appears after an hour is unanswered, and so is whether Chrome's pop-up default was already
   "allow" before 30 Sep.
5. Whether the **hour estimates** (`SIZE_HOURS`) feel right after a week of real study.
6. **Core elective EAV090X02** (Brain, Doc. Ježek, Neuroseminar, Tue 16:00, 8 dates 13 Oct–8 Dec,
   credit = 6 of 8): approved by Ježek on 7 Oct; two Gmail drafts wait for his Send — a thank-you
   reply and the enrolment request to the Study Department. Calendar series is in. Not in the
   planner's `TIMETABLE` (electives are not modelled) — ask before adding it. **ECG Principles**
   (EAV090X03, prof. Cendelín): asked 7 Oct, no answer yet.

**Due later, for whichever session touches the engine then:**
- **February**, with the summer timetable: decide the summer split — the shares stop on 15 Feb and
  every course is paced to its own deadline; the summer is about 68 h short however it is split —
  and pin `SIM-S` to its class dates.
- **December**, once exam dates are booked: January should become "next exam first"; the shares do
  not look at booked dates.

The dated log of every session is `docs/SESSION-LOG.md`, newest at the bottom; the second-year
history and the flashcard-explanation pipeline are in `docs/HISTORY.md`. Read them when a question
needs the history, not by default.

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

### Hours are estimated per topic — Linas's call (2026-10-02)

**This replaced "hours are derived, never typed".** Until 2026-10-02 a topic's cost was
`(examEcts || ects) × 26 h × share ÷ topics in the subject`, which gave 0.75 h for a pharmacology or
pathophysiology question. Linas rejected it twice: "4 h per topic is more realistic", then, asked
what he meant, "under an hour for a whole topic is not realistic!! think about topic specific!
Estimate the time, doesn't have to be perfect but 0,75h is never enough". So the hours are now an
estimate, made by Claude at his explicit request, and his to overrule:

- every topic has a **size** — `TOPIC_SIZE[code]`, else `BLOCK_SIZE[block]`, else `"M"`;
- every subject has **hours per size** in `SIZE_HOURS` (pathophysiology and pharmacology
  1.5 / 2.5 / 3.5, pathology 1 / 1.5 / 2.5, the credit-only courses 1–2 h); nothing is under 1 h;
- the subject card shows the range ("1.5–3.5 h each"), from `s.hrsRange`.

That makes 1,312 h across the year (pathophysiology 352, pharmacology 311, pathology 344).
**To re-pace a subject change its three numbers; to re-size one topic change `TOPIC_SIZE`.**
The sizes were judged from the titles, one subject at a time: whole mechanisms and big drug
classes L, single narrow causes or drug groups S. `HOURS_PER_ECTS`, `SELF_STUDY_SHARE`,
`PRACTICAL_SHARE` and the subjects' `practical:true` are gone.

**The consequence he must keep seeing: the winter does not fit.** The three January exams, the
Pathology and Simulation winter blocks need ~846 h; at his 3 h teaching days the calendar holds
384 h to 10 Jan. The overflow banner read **544 h** on 2 Oct, up from 52 h, and **505 h** on
3 Oct once General Pathology stopped being charged to January. That is the honest
number, not a bug — **never shrink `SIZE_HOURS` to make the banner smaller.** The levers are his:
the daily budget (`PHASES`), booking exam dates late in the period (each booked day adds up to
8 h of runway), and skipping blocks.

### The plan engine

`buildPlan(data, today)` returns a **rolling 14 days from today** plus `.overflow`. The old fixed
`PLAN_START`/`PLAN_END` pair is what left the app reading "Nothing scheduled" the day after the
exam; a rolling window cannot go stale, and rendering 300 days through in-browser Babel would
freeze the page for no benefit.

Five rules that are load-bearing and easy to break:

- **The scheduling unit is a curriculum BLOCK, not a subject.** A block is due when something
  examines it. Simulation Medicine's winter block is due at the January credit, which needs every
  session. **General Pathology (`PAT-G`) carries `paceTo:"exam"` since 3 Oct 2026** and is due at
  the June final: SIS's completion requirements say the winter credit is "physical presence at
  the practicals" — nothing else (checked 3 Oct 2026). Until then the code charged its 47
  questions against January on the claim that the January credit examined them; it never did.
  Before giving any other block a January deadline, check in SIS that the credit examines it.
- **A block cannot be scheduled before the semester that teaches it** (`SEM_OPEN`). Without this
  the planner had you studying Propedeutics of Surgery in October, against lectures that happen
  in March.
- **A topic costing more than a whole day is capped at the day's budget** in `fillDay`. With the
  2026-10-02 hours the largest topics are 3.5 h against a 3 h teaching day; without the cap they
  would be unschedulable forever and sit permanently in overflow.
- **The day is filled by SHARES OF THE HOURS (2026-10-03).** Linas: "pathophysio, then pharma,
  then internal, and if still time once or twice a week patho". `STUDY_SHARE` gives the winter
  groups `pfy` 40, `pha` 30, `iim` 20, `pat` 7, and `REST_SHARE` 3 for everything else (Czech,
  Psychology). Each topic placed goes to the group whose **hours done ÷ share** is lowest; ties in
  that order. Only the ratios count. **The shares stop when summer teaching opens**
  (`groupOf(subject, date)` returns "rest" from `SEM_OPEN.summer`): in the summer every course is
  paced to its own deadline, and the summer split is a decision for February. Inside the rest,
  the subject furthest **behind an even pace** to its own deadline goes first; inside a subject,
  the block with most hours left. Followed exactly from 3 Oct, a teaching week holds 3.7
  pathophysiology, 2.9 pharmacology, 1.5 internal-medicine and 1.1 pathology topics (0–2 a
  week); by 10 Jan that is 59/153, 45/134, 28/42 and 18/224.
  **Why hours and not "how far along each list"** — the rule of 2–3 Oct, `STUDY_PRIORITY` with
  weights 1.3/1.15/1 on the share of a list done: it gives each subject time roughly in
  proportion to the length of its list, so the 42-question internal-medicine list got 0.9 topics
  a week, fewer than Pathology's 1.4 — the reverse of his order — and making internal medicine
  third would have needed it to carry the LARGEST weight, which reads as nonsense. Shares of
  hours say what he said.
  **Class preparation is outside the shares (`PREP_PIN`, 2026-10-03).** The k-th topic of
  `SIM-W` is pinned to the day before the k-th date of the `sim-prac` slot (`PIN_DAY`), because
  the Moodle work is checked at the door and is a condition for being let in. The coordinator's
  e-mail gives no topic per date, only that each topic builds on the one before, so syllabus
  order is taken as class order. A missed prep is placed first on the next day it fits — so a
  week with a missed prep re-flows differently from one without (the engine test for "behind"
  uses the week of 12 Oct for that reason). Under the shares Simulation Medicine had only five of
  its six winter preps placed by 10 Jan, none tied to a class. SIM-S gets pinned when the summer
  dates are in `TIMETABLE`.
  Three reasons it is built like this, all learned the hard way:
  - **A plain priority order would park pharmacology.** At 1.5–3.5 h a topic a teaching day holds
    one; "pathophysiology first" would be pathophysiology every day for weeks — exactly what the
    pharmacology teacher warned against (see the comment above `fillDay`).
  - **Weights on REMAINING hours front-load.** Multiplying need or pressure by a weight builds the
    whole lead at the start: tried on paper, 1.3 on pathophysiology meant about three weeks of
    nothing else. Shares of the hours DONE build the lead gradually from zero.
  - **Ranking BLOCKS lets the cutting decide.** When blocks were ranked one by one (until
    2026-10-02), a subject in more blocks won more slots: Pharmacology's two Special blocks
    pushed Pathophysiology off the plan until 25 October. And ranking by hours left inside the
    rest gave every slot to the biggest course, so Simulation Medicine was never scheduled.
  `liveBlocks` therefore keeps a block whose topics are all done (with `total`, its hours), so
  finishing a block does not make its subject look less far along. **Every comparison ends on a
  fixed order** — group order, deadline, subject id, block key — because Today and the week table
  are built from different starting points and must agree.
- **`fillDay` must stay a pure function of (date, blocks, queue).** No history, no counters. The
  shares are recomputed from the queue each time, which is what lets the week table and the Plan
  match when he follows the plan.

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

### His own deadlines (`DEADLINES`, 2026-10-02)

Dated coursework that belongs to him rather than to the class — a seminar he presents, an essay
he hands in — lives in `DEADLINES` beside `EXAMS`, as `{id, subject, iso, time, label, short,
detail, confirm?}`. It feeds three existing places and adds no screen: `nextMilestone` (so it is
Today's countdown whenever it is the next date), `TIMELINE`, and a box on the subject's card with
`detail` and, in amber, `confirm`. **When two dates are possible, the earlier goes in** and
`confirm` says why — the same reasoning as pacing exams to the first day of the period. The day
itself is marked on the class through `TIMETABLE_NOTES` ("You present today, with Silvia: …").
Nothing is stored; it is code, so a changed date is an edit and a deploy.

**Never put classmates' names in the planner.** The repo and the site are public. The Psychology
sign-up sheet names nine other students; only Silvia's first name went in, because she is his
partner on both pieces of work and is already in this file as a Google test user. Prof. Vevera's
work e-mail, phone and address did go in (the subject's `note`): they are printed on the card he
hands to students, and the e-mail is where the essay must be sent.

### The timetable and its Calendar copy (winter 2026/27, group 3.AVSEOB20-5)

`TERMS`, `TIMETABLE` (12 winter slots), `TIMETABLE_CANCELLED`, `TIMETABLE_EXTRA`,
`TIMETABLE_CONFIRM`, `TIMETABLE_NOTES`, `PUBLIC_HOLIDAYS` and `ROOMS`; `classesOn()` decides a
date. The full story with every correction is in `docs/SESSION-LOG.md` (28–30 Sep). The rules:

- **Odd/even is the parity of the TEACHING week, not the ISO week.** Teaching week 1 is the week of
  28 Sep, the Christmas break is not counted, 4–8 Jan is week 13. SIS says so on the room page for
  the simulation centre: "3.AVSEOB20-5 even (odd numbered in calendar)". It was built the wrong way
  round on 28 Sep from a guess. **Check the public SIS room pages
  (`is.cuni.cz/studium/rozvrhng/roz_ucebna_macro.php?skr=2026&sem=1&fak=11140`), never a
  screenshot.**
- **A slot with `dates` follows its list and ignores the week rule** — the Psychology seminar (the
  department's list; 12 Nov moved to 19 Nov) and Simulation Medicine (the coordinator's six dates,
  nothing on 6 Jan).
- **Public holidays (28 Oct, 17 Nov) are not in `TERMS.breaks`:** a break week is skipped when
  teaching weeks are counted, a single day is not.
- Lectures are the whole year group; practicals and seminars are group 5. Internal medicine splits
  into 5A (doc. Hirmerová) and 5B (Dr. Nussbaumerová). **He is in 5B** since 4 Oct 2026, by a
  swap with a classmate: the department's 5B sheet, as sent, still lists the classmate and not
  him, until the teacher changes it. Same Tuesdays, same time, so only the teacher changed.
- `ROOMS` decodes the SIS room codes; `P4` is at FN Bory, across town.
- **The Calendar copy:** 12 recurring series in his primary calendar, a 30-minute popup each, tagged
  `[planner:class <subject>]` in the description so the planner's own feed hides them; the series
  ids are in the log (28 Sep). Change a whole series by its id; change one date by editing that
  instance. **The two fortnightly series consist of instances moved a week earlier, whose ids
  still carry their original dates: find an instance by listing that day, never by building its
  id, and never "reset" a master's rule.** Simulation Medicine on 16 Dec is a single event,
  `kkrpjufj98pf6kpa2itvkvs6to`.
- **A cancelled class is retitled "NO CLASS — …", reminders off, shown as free — never deleted.**
  He wants to see when a class is off (30 Sep).
- Summer: add slots with `term:"summer"`, and a second set of series, when he has the timetable.

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
**Since the topic-size hours (2026-10-02) a full week holds 11 topics and the first week 8, and
the overflow is about 544 h** — see "Hours are estimated per topic". **Since the shares of hours
(2026-10-03) a full week holds 11–12 and the overflow banner reads 505 h.** The ring is unchanged
in kind: 100% still means "did what the Plan put in this week".

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

## The planner check — automatic, since 2026-10-03

He asked for a planner that is never out of date without his having to tell it. **The rules are in
`AUTOMATION.md`; the routine follows that file, and so must any session that changes how the check
works.** What a session needs to know:

| | |
| --- | --- |
| Routine | `trig_012JocxLdZg1M2UpMpU4EfHP` — the old "morning briefing", upgraded. Cron `30 4,16 * * *` (UTC), Sonnet 5.5, the repo plus the Gmail, Google Calendar and Wispr Flow connectors. Managed at https://claude.ai/code/routines |
| Dry run | until 6 Oct 2026 (`LIVE_FROM` in `AUTOMATION.md`) |
| Mail read log | the Gmail label "Planner read", id `Label_3`, on every processed **message** (not thread) |
| Other read logs | `tools/state/sources.json` (the SIS snapshot), `tools/state/recordings-read.json` (Wispr ids only — the file is public) |
| Gate | `node tools/check.mjs`; the routine adds `--auto`. Install once: `npm ci --prefix tools` |
| Public log | `docs/planner-updates.md` |

**Since 7 Oct it also writes Gmail drafts** for mail that needs an answer from him (AUTOMATION.md
§2a) — never sends. **And there are two advisors:** Kimi (another assistant, on his Mac) works on
the same planner. `tools/state/recordings-read.json` is the shared record of read recordings for
both; check it, the planner and the Calendar before applying anything from a recording, and say in
commit messages what was done and skipped. Kimi keeps its own log on the Mac (path in
AUTOMATION.md §5). Rules in AUTOMATION.md §5.

**His personal details** — student number (confirmed 7 Oct), group, study-department address,
e-mail sign-off — are kept in a private Gmail **draft** titled "📌 Student profile — for assistants
(do not send)", so any assistant with Gmail can find them. **Never copy them into this public repo**;
the safety check blocked a commit that tried (7 Oct).

**Recordings without a marker word in the title are never read automatically** — "Czech class
overview" or "Pathophysio class" would be missed. Tell him to put intro / info / organisation in
the title of any recording the planner should read.

Things that are easy to get wrong:
- **`main` moves under you.** The routine commits to `main`. Before deploying from `test`:
  `git fetch && git rebase origin/main`, or the `--ff-only` merge fails.
- **Run the gate before every deploy, by hand too.** It compiles the page with the same
  babel-standalone, renders it in jsdom with the same React, opens all eight tabs and runs
  `tools/engine-tests.js`, in about four seconds. In testing it caught a syntax error, a top-level
  crash, an unknown `TOPIC_SIZE` code, a broken engine rule, and an automatic change touching a
  forbidden file or adding an e-mail address. Its packages are test-only and live in `tools/`;
  the app still has no dependencies.
- **Recordings are read through the Wispr Flow connector, by title marker only** — he marks what is
  worth reading ("Pharma introduction 01.10.26"). The Mac copy of the database,
  `~/Library/Application Support/Wispr Flow/flow.sqlite` (table `Meetings`, transcripts under
  `meetings/<id>/refined.ndjson`), holds all his dictation: read-only and by title only, if ever.
- **A routine gets every claude.ai connector unless told otherwise.** Keep its list to Gmail,
  Google Calendar and Wispr Flow.
- **The cloud's auto-mode safety check blocks an unattended push to `main`** ("Production Deploy"):
  the first test run on 3 Oct was stopped at the commit. Linas then allowed it explicitly, for this
  routine only, and only after the gate passes — the rule sits in the routine's
  `auto_mode_allow`. Do not widen it without asking him. `gh` has no valid token in the cloud, so
  the routine opens no pull requests: questions go on the briefing card and he answers in a chat.
- The SIS watcher compares only the edited parts of a course page (section texts with their
  "Last update" stamps, the attachment list, a few header fields); SIS changes the rest on its own.
  Re-running it right after a snapshot must print "No change".

---

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

Netlify serves whatever it last built — since 30 Sep 2026 that is commit `b4856e4`, and it falls
further behind with every push (see "Netlify was building every push" below). It is still serving,
so the old links work and quietly show out-of-date content — which is worse than being down. Treat
GitHub Pages as the live site.

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
Netlify still watches `main` too, and **every push costs Netlify credits until its builds are
stopped** — see the next section.

### Why Netlify was abandoned (2026-08-08)

Netlify showed *"running on operational credits — production deploys and Agent Runners are paused"*
and stopped building. **This is a known Netlify bug**, not real exhaustion: through July and August
2026 many free-plan teams reported the identical banner while their credit balance was still full,
and support clears the flag by hand. The free fix is a post on <https://answers.netlify.com> naming
the team (**Planer**) and site (`peppy-lokum-2c5109`) — **not yet done**, and no longer urgent.

GitHub Pages was set up instead: repo is public, so it is free, has no build step and no credit
system, and 4.5 MB of HTML is nothing against its 1 GB / 100 GB-per-month limits.

#### Netlify was building every push — the credits were real (found 2026-10-02)

The flag above did clear, and nobody noticed: from the billing cycle that began 18 Sep 2026,
Netlify built and published **every push to `main`**, in parallel with GitHub Pages. On the
credit-based Free plan a production deploy costs **15 credits of 300 a month** (Netlify's pricing
page and "How credits work" doc, checked 2026-10-02), so about twenty pushes empty it. There were
12 pushes to `main` from 18 to 30 Sep; Netlify e-mailed "75% used" at 16:29 UTC on 30 Sep and
"used all available credits … can't ship to production right now" at 18:50 UTC, three minutes after
the push of `b4856e4`. **Proof it was building:** the live Netlify `index.html` is `b4856e4`
byte for byte, plus one comment Netlify injects ("This site is hosted on Netlify…"); GitHub's
deployments API shows only `github-pages`, so do not look for Netlify there.

**Builds were stopped on 2026-10-03** (Project configuration → Developer settings → Build settings →
Build status: Stopped), at Linas's request, through his Chrome. The old copy stays online, frozen at
`b4856e4`. The team's other projects were left as they were: `studentforstudents.com` is his live
Student for Students site and keeps building.

So the advice "push less" is wrong: **GitHub Pages costs nothing per push.** The cost is the second,
unwanted Netlify build. The Free plan cannot bill — out of credits, it pauses deploys and keeps
the site up on "operational credits" — so the only consequences are the e-mails and a stale copy.
The fix is in Netlify's dashboard, which only Linas can reach: **Stop builds** (reversible), or
**delete the site** (also removes the stale copy; irreversible, and safe only because his progress
was moved to Drive before the move to Pages). Never re-link Netlify to this repo.

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

## Flashcard explanations — finished

All 4,440 cards have an explanation (since 2026-08-08), in one JSON island per topic, keyed by
question index: `{"12": {"e": "...", "s": "Guyton & Hall 14e, Ch.75 — ...", "w": "optional warning"}}`.
**Before adding or re-explaining any card, read `docs/HISTORY.md`** — the write → double-verify →
repair pipeline, its measured error rates (5–24% of generated explanations needed correcting), the
verified 14e chapter map, the adjudication rule (never one examiner; the deck has won every
adjudication so far), and the cost of a run.

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

### Known cosmetic bug in the decks — do not "fix" it in a panic

The flashcard sync bar always reads **"Sync on"**, never "Syncing to \<email\>". That is correct
behaviour, not a failure: `SyncBar` renders `email ? "Syncing to "+email : "Sync on"`, and in the deck
`setEmail` is declared and never called — the deck makes no `drive/v3/about` call, while the planner
makes exactly one. **"Sync on" means connected and syncing.** Worth wiring up properly one day, by
reusing the planner's call, so that on a shared device the deck can say which account it is using.
Not before the exam.
