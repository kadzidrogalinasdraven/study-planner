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
the Faculty's Dean's Measure 6/2026. The 569 topics come from the exam-question lists each
department publishes, or from the SIS syllabus where a department publishes no question list.

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

### The plan is derived, not written

Nothing in the Plan tab is hand-written. It shows a rolling fourteen days from today, recomputed
from what you have ticked and how close each deadline is, so it re-flows the moment you tick
something and it cannot go stale.

Days are filled to a budget that follows the academic calendar — three hours on a teaching day,
five at a teaching weekend, eight inside an exam period, two over the winter break. How long a
topic takes is derived from its course's credit value rather than guessed: twenty-six hours per
credit at 55% private study, divided across that course's topics. Courses the study plan writes
with no lecture hours are counted at 25%, because they are almost entirely contact time.

Three things the scheduler does that are worth knowing:

- **It plans by block, not by course.** Pathology's winter blocks are due at the January credit,
  its summer blocks at the June final. Treating Pathology as one deadline in May would hide the
  January credit entirely.
- **It will not schedule a course before the semester that teaches it.** Propedeutics of Surgery
  is a summer course, so it does not appear in October.
- **It rebalances every day.** Whichever block is under the most pressure — hours of work left
  against hours of calendar left — goes first, so no course gets starved by one with a nearer
  deadline.

Anything that will not fit before its deadline is reported, per subject, rather than quietly
dropped. A schedule that silently loses a third of the work is worse than one that admits it does
not fit, because only the second lets you choose what to cut. The levers are booking a later exam
date, raising the daily budget, or marking blocks you will not study as skipped.

### Progress

Every topic, grouped by course and then by block, with the block's semester marked. Ticking a
topic removes it from Today and the Plan, and brings it back once for review three weeks later if
its exam is close — over a nine-month year nothing else re-exposes what you learned in October.

The ban icon beside a topic skips it: a skipped topic is scheduled nowhere and counted nowhere.
Use it when a block turns out not to be examinable, rather than pretending you will study it.

## Productivity

Three weekly rings plus a combined one. Weeks run **Monday–Sunday**, local time.

| Ring | Weight | Score |
| --- | --- | --- |
| Coursework | 2× | topics ticked this week ÷ the pace needed across every live subject |
| Gym | 1× | sessions this week ÷ your target, 3 by default |
| Languages | 1× | language days hit ÷ language days scheduled |

**A category you haven't set up is left out of the average entirely, rather than counted as zero.**
An unconfigured ring would otherwise drag the headline number down for no reason. "Set up" means
*configured* — a target exists — not *active this week*: a category with a target but a quiet week
still counts, at 0. If it dropped out on quiet weeks instead, Monday would read 100% off a single
gym session and then fall as the week filled in.

### Where the coursework number comes from

Ticking a topic anywhere in the app feeds this ring — there is no separate control, and no row for
it in the week grid. Alongside the `done` map there is a parallel `doneAt` map recording *when*
each topic was ticked, which is what makes "this week" answerable. Unticking deletes the stamp, so
it cannot leave phantom credit behind.

The target is not a number anyone typed: it is the sum, across every subject whose deadline is
still ahead, of the topics per week that subject needs to be ready in time. It therefore rises as
an exam approaches and falls as you get ahead. If nothing is outstanding it is zero and the ring
drops out of the average rather than sitting at 0%.

### Logged late

Gym and language entries store `tickedAt` — when the box was ticked — separately from the day it
was ticked *for*. Filling in four days on Sunday is a different fact from doing them daily, and
without that field the two would be indistinguishable. A day filled in more than a day afterwards
is marked "late" in the week grid. Coursework has no late mark, and that is deliberate rather than
an omission: a topic is not done *for* a date the way a gym session is, so its stamp *is* its tick
time.

Language practice alternates Czech and Italian on every other day, half an hour each, and runs
straight through the holidays rather than pausing for term.

## Privacy

Everything you tick, write or log stays in your browser and, if you turn sync on, in your own
private Google Drive app-data folder. Nothing is sent anywhere else: there is no backend, no
account, and no analytics anywhere in this app.
