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

`physio_flashcards.html` is a separate standalone page from second year. The planner no longer
links to it, but it is still served at the address above and still works — including Silvia's copy.

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

**You should not have to press Sync.** Changes push about a second after you make them, the app
pulls every 25 seconds and whenever you come back to the tab, and the Google session renews itself
in the background while you use the app. The Sync button is still there as a manual override, and
a Reconnect banner appears only if the session genuinely cannot be renewed — which happens when
you have signed out of Google elsewhere, or your browser blocks the sign-in popup. Everything you
do is saved on the device either way; syncing only decides whether your other devices see it.

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

## The third year

The planner is built around the 2026/2027 third year of English General Medicine at LF Plzeň:
eleven compulsory courses, 56 credits, five graded exams and six credits.

Everything factual in it comes from the university, not from guesswork. The courses, their codes,
semesters, completion types and credit values are transcribed from Charles University's own study
plan (SIS, plan `EAVSEOB2023`). The term dates, exam periods, holidays and Dean's Day come from
the Faculty's Dean's Measure 6/2026. The 678 topics come from the exam-question lists each
department publishes, or from the SIS syllabus where a department publishes no question list.

### How current is any of it

The 2026/27 curricula are not all out yet — several departments post the new edition only once
teaching starts. So every topic list carries its own age, shown wherever the topics are: on the
subject card, and on each block in Progress. Two courses, Pathophysiology and Introduction to
Internal Medicine II, have a verified 2026/27 question list. Pathology's three lists are undated
and were silently refreshed on the first day of last term; they were downloaded again on
30 September 2026 and had not changed. Pharmacology uses the department's official 2026/27 oral list of 134 questions, read
on 1 October 2026 and marked pre-final: the department has said it will still renumber it and
move a few questions, and will announce the final version.

The Subjects tab has a panel spelling all of this out, and a second panel listing what the shared
student Drive archive gets wrong — it dates from 2020 to 2022 and predates the current
accreditation, so it still says Immunology is a third-year subject, that pharmacology has no exam
until fourth year, and that the Pathology exam involves museum specimens. None of those are true
now. The archive is still worth reading for logistics and for what examiners actually ask; it is
not worth reading for format, dates, or which year a subject falls in.

### It keeps itself up to date

Twice a day, at about 06:30 and 18:30, a routine in the cloud looks for anything that changes the
planner, so you never have to tell it:

- school e-mail — SIS messages, Moodle announcements, the departments, the hospital — picked out
  by sender rather than by keyword;
- the eleven SIS course pages, compared with the last copy so that only what changed is read;
- the class recordings you mark with a word like "introduction" or "information" in the title,
  each read once;
- anything you e-mail yourself with "planner" in the subject — a WhatsApp message, something said
  in class.

Official facts for your group — a cancelled or moved class, a room, a deadline, a credit rule —
go into the planner and into the matching Calendar entry by themselves, and only after a check has
confirmed that the page still loads and the plan still adds up. Everything else waits for you:
topic lists, hours, anything from classmates, anything unclear about 5A or 5B. It all shows on the
📋 card at the top of Today — what changed and where it came from, then what needs your OK,
numbered; say "apply 2" in a Claude chat. No card means the check did not run. Until 7 October it
only reports what it would change. Every change it makes is listed in `docs/planner-updates.md`,
and the rules it follows are in `AUTOMATION.md`.

| | |
| --- | --- |
| Winter teaching | 1 Oct 2026 – 8 Jan 2027 |
| Winter exam period | 11 Jan – 14 Feb 2027 |
| Summer teaching | 15 Feb – 21 May 2027 |
| Summer exam period | 24 May – 30 Jun 2027 |
| Resits stay open until | 15 Sep 2027 |

### Subjects

One card per course, grouped by semester. Each shows its SIS code, credits, whether it ends in a
credit or an exam, how much of its topic list you have covered, and how many days are left. "How
it is assessed" opens the department's own rules — what the exam consists of, how many questions,
and what you need for the credit.

**Exam dates are booked by you in SIS, so the planner cannot know them.** Until you set one, a
subject paces itself to the *first* day of its exam period, which is the pessimistic assumption:
booking a real date can only ever relax the plan. Set the date on the subject card and the whole
schedule re-paces around it, and the date appears on the Timeline.

**Your own deadlines** — a seminar you present, an essay you hand in — sit beside the exams. They
are listed in `index.html` (`DEADLINES`) and show in three places: as the countdown at the top of
Today whenever one is the next date coming up, on the Timeline, and on the subject's card with what
to prepare. A date that is not yet certain says so, and the earlier of two possible dates is used
until it is settled.

### The plan is derived, not written

Nothing in the Plan tab is hand-written. It shows a rolling fourteen days from today, recomputed
from what you have ticked and how close each deadline is, so it cannot go stale.

**Today's list holds still.** It is set each morning and stays as it is while you work through
it: a topic you tick stays on the list, ticked, instead of tomorrow's first topic sliding up to
take its place. That is what lets a day be finished — when every topic on it is ticked, Today
says so. Every later day re-flows the moment you tick something, so work done ahead frees those
days up at once.

Days are filled to a budget that follows the academic calendar — three hours on a teaching day,
five at a teaching weekend, eight inside an exam period, two over the winter break. How long a
topic takes is an estimate for a first pass to exam standard: every topic is small, medium or
large, and every course has an hour figure for each size — 1.5, 2.5 and 3.5 hours for a
pathophysiology or pharmacology question, for example, down to an hour for a Medical Czech
topic. The figures sit at the top of `index.html` (`SIZE_HOURS`, `TOPIC_SIZE`); change a course's
three numbers to re-pace it. They replaced a formula from credit values that gave 45 minutes a
question, which was never enough.

Five things the scheduler does that are worth knowing:

- **It plans by block, not by course.** A block is due when something actually examines it:
  Simulation Medicine's winter sessions at the January credit, Pathology's general questions at
  the June final — the winter Pathology credit is attendance only, so nothing is due in January.
- **It will not schedule a course before the semester that teaches it.** Propedeutics of Surgery
  is a summer course, so it does not appear in October.
- **It shares the winter's hours in your order:** Pathophysiology 40%, Pharmacology 30%,
  Introduction to Internal Medicine 20%, Pathology 7% — about one or two of its shorter topics a
  week — and 3% for everything else. Each topic goes to whichever group is furthest below its
  share, so none of them is ever parked, which is what the pharmacology teacher warned against.
  Followed exactly, a teaching week holds about four pathophysiology topics, three pharmacology,
  one or two internal medicine and one pathology. The numbers are `STUDY_SHARE` near the top of
  `index.html`. From the summer semester every course is paced to its own deadline instead.
- **Class preparation falls on the day before the class.** Simulation Medicine's Moodle work is
  checked at the door, so each of its six winter topics sits on the day before its session; a
  missed one comes first the next day.
- **Inside "everything else", the course furthest behind an even pace goes first**, so a January
  deadline moves faster than a June one and a small course still gets its turn.

Anything that will not fit before its deadline is reported, per subject, rather than quietly
dropped. A schedule that silently loses a third of the work is worse than one that admits it does
not fit, because only the second lets you choose what to cut. The levers are booking a later exam
date, raising the daily budget, or marking blocks you will not study as skipped.

### Progress

Every topic, grouped by course and then by block, with the block's semester marked. A ticked
topic drops out of every later day of the Plan (on today's list it stays, ticked), and comes back
once for review three weeks later if its exam is close — over a nine-month year nothing else
re-exposes what you learned in October.

The ban icon beside a topic skips it: a skipped topic is scheduled nowhere and counted nowhere.
Use it when a block turns out not to be examinable, rather than pretending you will study it.

## Productivity

Three weekly rings plus a combined one. Weeks run **Monday–Sunday**, local time.

| Ring | Weight | Score |
| --- | --- | --- |
| Coursework | 2× | topics ticked this week ÷ the topics the Plan puts on this week |
| Gym | 1× | sessions this week ÷ your target, 3 by default |
| Languages | 1× | language days logged ÷ language days on the cadence — **can pass 100%** |

### Going past 100%

The language cadence — three or four days a week — is the target, not the limit. All seven boxes
in the week grid are open: the solid ones are the cadence days, the dashed ones are extra. Every
extra day counts, so four days against a cadence of three is 133%, and a full week is 233%.

The surplus carries into the combined score as well: each extra language day adds about 8 points
to it in a three-day week, about 6 in a four-day week. A line under the big ring says how much of
the headline came from extra days.

A ring that is already full shows the surplus as a second, thinner lap just outside it — one
orbit per extra 100%.

Coursework and gym stop at 100%. Going to the gym five times against a target of three is still
100%, not 167%.

**Which language was an extra day?** The app cannot know, so it does not pretend to. On the Today
screen an extra day offers both Czech and Italian and you tap the one you did. In the week grid an
extra day starts as the language of the day before; tap it again to switch to the other, and once
more to clear it. Cadence days are a plain on/off, as they always were.

**A category you haven't set up is left out of the average entirely, rather than counted as zero.**
An unconfigured ring would otherwise drag the headline number down for no reason. "Set up" means
*configured* — a target exists — not *active this week*: a category with a target but a quiet week
still counts, at 0. If it dropped out on quiet weeks instead, Monday would read 100% off a single
gym session and then fall as the week filled in.

### Coursework: the week's plan, one box per topic

Under the Gym and Languages rows, the week grid lists the week's coursework: one row per course,
one box per topic, under the day the Plan gives it. Tomorrow's three topics are three boxes in
tomorrow's column.

**A box is the same tick as the checkbox on Today, the Plan and Progress.** Tick a topic in any
of them and it is ticked in all of them; there is nothing to keep in step. A box says which topic
it was as you tick it.

**The week is laid out on Monday and then holds still.** It is what the Plan held for those seven
days as the week began, and it does not move while you work through it — a ticked box stays where
it is, and the target neither shrinks when a day is skipped nor grows when one is finished early.
Follow the Plan day by day and the two list exactly the same topics. They differ only when you
are off it:

- **Behind.** A box left open on a day that has passed stays on that day, outlined, and the ring
  says how many are behind. The Plan, meanwhile, re-flows those topics into the days that are
  left, inside each day's budget. Ticking one late still counts for the week.
- **Ahead.** Work beyond the week's own list has no box, so it is shown as "+2" on the day you did
  it. It counts towards the ring, which stops at 100%.

**The target is the number of topics on the week's plan** — about twenty in a full teaching week,
at three hours a day. It used to be the pace needed to finish every course on time, which came to
about thirty-nine a week: a number the Plan itself never asked for, so doing everything on the
Plan could not fill the ring. The gap between the two is real, and it is reported on Today and
Plan as the hours that do not fit the calendar — not hidden inside this ring. If nothing is
planned for the week the ring drops out of the average rather than sitting at 0%.

Alongside the `done` map there is a parallel `doneAt` map recording *when* each topic was ticked.
It is what makes "this week" answerable, and what lets the week be rebuilt as it stood on Monday.
Unticking deletes the stamp, so it cannot leave phantom credit behind.

### Logged late

Gym and language entries store `tickedAt` — when the box was ticked — separately from the day it
was ticked *for*. Filling in four days on Sunday is a different fact from doing them daily, and
without that field the two would be indistinguishable. A day filled in more than a day afterwards
is marked "late" in the week grid. Coursework has no late mark, and that is deliberate rather than
an omission: a topic is not done *for* a date the way a gym session is, so its stamp *is* its tick
time.

Language practice alternates Czech and Italian on every other day, half an hour each, and runs
straight through the holidays rather than pausing for term. Those are the days the plan asks
for; practising on the days in between is logged as extra (see "Going past 100%").

## Privacy

Everything you tick, write or log stays in your browser and, if you turn sync on, in your own
private Google Drive app-data folder. Nothing is sent anywhere else: there is no backend, no
account, and no analytics anywhere in this app.
