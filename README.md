# Study planner

A single-file app. Everything lives in `index.html` — React and Babel are pulled from a CDN and
the JSX is compiled in the browser, so there is no build step and nothing to install. Open the
file, or push to `main` and Netlify serves it at
[peppy-lokum-2c5109.netlify.app](https://peppy-lokum-2c5109.netlify.app/).

`physio_flashcards.html` is a separate standalone page that the planner links to. Keep it at the
same address or the flashcard links break.

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
visible warning and still tells you to answer as the deck says. Two endocrinology cards currently
carry that warning (indices 8 and 32).

### One tap

Tapping TRUE or FALSE both answers and grades the card — right counts as *Good*, wrong as *Again*.
There is no second tap. *Hard* and *Easy* appear after the reveal if you want finer control.

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

The pace is derived from the next exam in `EXAMS`, with the deadline set to the **day before** it
(the computer test starts at 08:00, so exam day is not a study day). On exam morning it rolls on to
the next exam, so the figure never divides by zero.

The weekly target defaults to the pace needed to finish the curriculum and is editable. The daily
figure — *"4 topics a day to finish by 13 Aug"* — is the one to read: the weekly equivalent is the
same fact in a form that sounds impossible.

### Logged late

Gym, language and project entries store `tickedAt` — when the box was ticked — separately from the
day it was ticked *for*. Filling in four days on Sunday is a different fact from doing them daily,
and without that field the two would be indistinguishable. A day filled in more than a day
afterwards is marked "late" in the week grid. Physiology has no late mark, and that's deliberate
rather than an omission: a topic isn't done *for* a date the way a gym session is, so its stamp
*is* its tick time.

---

## Health tracker

A tab for running structured n-of-1 self-experiments: take something daily, score your symptoms
daily, and don't look at the answer until the date you set in advance.

It shares the planner's storage, so health entries sync between phone and Mac the same way, and
are covered by the same Export backup.

### The metrics

Every metric points the same way — **0 = no problem, 10 = worst** — so a falling number is always
an improvement, on every line. That is what makes the first-half/second-half comparison readable
at a glance.

| Metric | Scale | Meaning |
| --- | --- | --- |
| **Night wakings** | count | How many times you woke in the night. 0 = slept through. |
| **Nasal patency** | 0–10 | 0 = clear, breathing freely · 10 = completely blocked. |
| **Fatigue** | 0–10 | 0 = no problem · 10 = worst. |
| **Brain fog** | 0–10 | 0 = no problem · 10 = worst. |

Note the direction on **nasal patency**: it keeps that name, but it is *scored as obstruction* so
it runs with the others. Higher is worse, as everywhere else.

Two flags are recorded alongside them — neck swelling and rescue medication — plus free-text notes.

Each experiment nominates one metric as its **primary endpoint** (the trial ships with nasal
patency). That is the one the verdict hangs on. The others are context, and reading a result off
a secondary metric after the fact is how you fool yourself.

### Void days

A day is **void** when the dose was missed, or when the dose checkbox was never answered at all.
Unanswered is treated the same as missed — not because skipping is assumed, but because a day you
can't vouch for is equally unusable as evidence.

Void days are dropped from the analysis. They are not counted as bad days, or as good ones. They
are counted as no data, and the `n` for each half of the trial is shown so you can see how much
was thrown away.

### When the whole trial is declared void

This is the part the app exists for.

The miss allowance is calculated against the **full length of the trial**, not against the days
elapsed so far. A 14-day trial at 80% adherence allows 2 missed days. You spend them as you go and
the app shows how many are left.

The trial is only marked `void` when the misses **exceed** that allowance — the point where even a
flawless run through the remaining days can no longer reach the threshold. At that moment the
target is mathematically out of reach, and the app says so plainly and tells you to restart.

It deliberately does **not** judge on a running percentage. One miss on day 2 of 14 is 50%
adherence, which looks catastrophic and is not: it is one miss out of an allowance of two. An app
that voided the trial there would be manufacturing exactly the premature-abandonment result this
is meant to prevent.

The distinction that matters, and the one the void banner states outright:

> **A void trial is not a negative result. It is no result.**

An aborted trial tells you nothing about whether the intervention works. It has to be run again
from a fresh start date.

### The readout lock

No verdict is shown before the experiment's `readoutDate`. Until then the app will only tell you
how many days remain and how your adherence is doing — no trend line, no means, no comparison,
nothing that can be squinted at and read as an early answer.

On or after the readout date the period is split in half and each metric is compared, first half
against second, with mean ± SD, absolute and percentage change, and the number of valid days
behind each figure.

That comparison is an uncontrolled, unblinded n-of-1 observation. Symptoms drift on their own,
seasons change, and you know what you are taking. It can tell you that something changed over
those two weeks. It cannot tell you that the intervention caused it.

### Privacy

Health entries stay in your browser and in your own private Google Drive app-data folder. They are
not sent anywhere else, there is no backend, no account, and no analytics anywhere in this app.
