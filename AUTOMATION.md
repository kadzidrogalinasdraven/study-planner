# The planner check — rulebook for the automatic runs

Linas asked on 3 Oct 2026 for a planner that keeps itself up to date ("I never want outdated
information"). One automatic run follows this file: the **planner check**, a cloud routine that
fires at 04:30 and 16:30 UTC (06:30 and 18:30 in Prague in summer time, an hour earlier in winter)
and reads Gmail, SIS, his marked Wispr Flow recordings and the planner itself. It needs no Mac.

He chose the scope himself: **official facts are applied automatically; everything else waits for
his OK.** The routine's permission to push to `main` — after the gate passes, nothing else — was
given by him explicitly on 3 Oct 2026, after the cloud's safety check had stopped a test run. This
file is public — never write anything private into it.

## 0. Mode

`LIVE_FROM: 2026-10-07`. Before that date a run is a dry run: do everything up to the gate, push
nothing, label no mail (the seven-day search window carries it over to the
first live run), and write in the briefing "Would change: …". From that date on, publish.

## 1. A run, step by step

1. **Start clean.** `git fetch origin && git checkout -B main origin/main`. Install the gate only
   when a change is coming: `npm ci --prefix tools`.
2. **Collect** — cheaply, and only what is new:
   - **School mail.** Gmail search, minimal view first:
     `newer_than:7d -label:Label_3 (from:cuni.cz OR from:fnplzen.cz OR (from:me to:me subject:planner))`.
     `Label_3` is "Planner read": every message a run has processed carries it, so nothing is
     read twice. Label each processed MESSAGE (not the thread), ignored ones included.
     Open a body only when the subject and snippet say it may matter.
   - **Other events** (the original morning briefing): `newer_than:1d -label:Label_3 (meeting OR
     appointment OR invitation OR reminder OR event OR trip OR conference OR webinar OR deadline
     OR workshop OR session OR "save the date")` → genuine dated events go into Calendar as they
     always have; marketing that borrows event words is skipped.
   - **SIS and department pages:** `python3 tools/watch_sources.py`. Exit 0 no change, 3 changed
     (the report says what), 2 a source could not be fetched — name it in the briefing and carry
     on (the cloud reached SIS without trouble on 3 Oct 2026, so it is the site, not a setting).
   - **Class recordings** he has marked: §5.
   - **What the planner says now** about the next 14 days: grep `index.html` for `TIMETABLE`,
     `TIMETABLE_CANCELLED`, `TIMETABLE_NOTES`, `DEADLINES`, `EXAMS`. Never read the whole file.
3. **Sort every finding** into one of: apply (§2), ask (§3), calendar only, ignore. Before
   applying anything, check the planner does not already say it.
4. **Apply** the "apply" findings (§2, always within §4), then `python3 tools/watch_sources.py --update` if the
   watcher reported a change, then one line per change in `docs/planner-updates.md`.
5. **Gate, then publish.** One commit for the run, then `node tools/check.mjs --auto`. Push to
   `main` only if it prints `GATE PASSED`. If it fails: `git reset --hard origin/main`, change
   nothing else, and put the gate's message at the top of the briefing.
6. **Draft the answers** (§2a): a Gmail draft for every processed message that needs a reply or
   an e-mail from him. Never sent — he clicks Send.
7. **Ask** (§3): numbered, in the briefing card.
8. **Report** in the briefing card (§6). Label the processed mail.

## 2. Applied automatically

All three must hold, or it is a question (§3):

- **Official.** A sender at `cuni.cz` (department staff, SIS messages from `studium.noreply@is.cuni.cz`
  or a teacher's own address, the study department), at `fnplzen.cz` (hospital staff), Moodle
  (`noreply@moodle.lfp.cuni.cz`), a SIS course page, or a teacher's own words in a marked recording
  (§5, with its own limits).
- **For him.** Third year, English General Medicine (`AVSEOB`), his group 5 — or the whole year.
  For internal medicine he is in **5B (Dr. Nussbaumerová)** since 4 Oct 2026, by a swap with a
  classmate, so the department's own lists may still put him in 5A. Anything for 5B, or for both,
  is for him; anything for 5A only is reported in the briefing, never applied.
- **Unambiguous.** One clear date, time or room, not conditional, and no other official source
  says otherwise.

What may change, and where:

| Finding | In `index.html` | In Calendar |
| --- | --- | --- |
| A class cancelled, Moodle-only, moved, or in another room | `TIMETABLE_CANCELLED`, `TIMETABLE_EXTRA`, `TIMETABLE_NOTES` (comment naming the source) | the instance: retitle `NO CLASS — <course> (<reason>)` or `MOODLE ONLY — …`, reminders off, show as free. **Never delete.** |
| Something said about one session: what to bring, the topic, a test that day | `TIMETABLE_NOTES[date][slot]` | that instance's description |
| A dated thing he must do: hand-in, form, registration, Moodle task | `DEADLINES` — `{id, subject, iso, time, label, short, detail, confirm?}`; when two dates are possible the **earlier** goes in, with `confirm` saying why | a single event with reminders a day and an hour before; **not** tagged `[planner:class]`, so it shows in Upcoming |
| A credit or exam rule, stated by the department | `SUBJECTS[].creditRule` / `examFormat` — quote the source's sentence, do not interpret | — |
| Exam dates published in SIS | nothing (he books them himself) | — ; put it **first** in the briefing: good dates go fast |

## 2a. Draft e-mails, ready to send (his request, 7 Oct 2026)

He asked for "draft responses I just have to click send". So when a processed message needs an
answer or a follow-up e-mail from him, write it as a **Gmail draft**, never send it:

- **When:** a teacher or office asks him something or asks him to do something by e-mail ("ask the
  Study Department to enrol you"), approves or refuses a request of his, or a deadline needs a
  confirmation from him. Not for circulars, newsletters, automatic SIS notices or anything only
  informative.
- **Which:** a reply in the same thread (`replyToMessageId`), plus a new e-mail when the reply
  sends him elsewhere — e.g. to the English Study Department, `medstudy@lfp.cuni.cz`, with the
  approving teacher in Cc and the approval quoted.
- **How:** English, short, polite, in his own style. Sign-off as in his own sent mail:
  "Kind regards, / Linas Kadzidroga / 3rd year, General Medicine (English programme) / Faculty of
  Medicine in Pilsen, Charles University". Read his own message in the thread first so the
  answer fits it, and correct nothing he did not ask about.
- **Never twice:** `list_drafts` (full view) before creating one; if a draft to the same people
  on the same matter exists, leave it. Never send, never delete or edit a draft he has touched.
- **Report:** under "Drafts ready:" on the card, one line each: to whom, about what.
- Drafts are private (Gmail), so they may contain what the public repo may not — but nothing
  about drafts goes into the repo beyond "a draft was prepared".

## 3. Never applied automatically — a question instead

- Topic lists: anything in `CURRICULUM`, codes included. When the final pharmacology list arrives,
  follow CLAUDE.md "Pharmacology: the official list is in" (diff by content, new codes from `PHA335`).
- Hours, shares, budgets, priorities: `SIZE_HOURS`, `TOPIC_SIZE`, `STUDY_SHARE`, `PHASES`.
- Anything from classmates or unofficial channels — including what he forwards himself, unless his
  forward says "apply".
- Anything that contradicts another official source.
- Anything that would delete or retire something.

**How to ask:** under "Needs your OK" in the briefing card, numbered, each with what the source
says (and which source) and the exact change you would make. He answers in a Claude chat —
"apply 2" — and that session makes the change; it reads the card through the Calendar connector.
A question stays on every morning card until the planner says it or he has answered. (Pull
requests were the first idea; `gh` has no valid token in the cloud, so they are not used.)

## 4. Never

- Never touch `physio_flashcards*.html` or `make_silvia_copy.py`; never touch `CLAUDE.md`,
  `README.md` or this file — the gate refuses any file outside `index.html`,
  `tools/state/sources.json`, `tools/state/recordings-read.json` and `docs/planner-updates.md`.
- **The repo is public.** Never write classmates' names, anyone's private phone number or e-mail,
  a Moodle enrolment key, a password, or anything about his health or private life — not in the
  code, not in a commit message, not in a pull request. Staff already named in `TIMETABLE` may be
  named. The briefing card is in his private calendar and may say more.
- Never send, reply to, forward, delete, archive or mark read any e-mail. Labels and drafts
  (§2a) only.
- Never open a recording whose title carries no marker (§5).
- Never delete a Calendar event. Never edit a class series' own rule: find an instance by listing
  that day's events, never by building its id — the fortnightly series consist of moved instances
  whose ids still carry their original dates.

## 5. Class recordings

He marks the recordings worth reading with a word in the title — "Pharma introduction 01.10.26",
"… information …" (his words, 3 Oct 2026). Through the Wispr Flow connector, `search_meetings` with
`field: "title"` and `since` seven days ago, once for each of `introduction`, `intro`,
`information`, `info`, `announcement`, `organisation`, `organization`. **Never list or search
recordings any other way:** the unmarked ones are private and are never opened.

Skip every id already in `tools/state/recordings-read.json`. For a new one, read the summary
(`get_meeting` without a transcript); ask for the transcript only when the summary points at
something planner-relevant and is vague about it. Then add its id and today's date to that file —
ids only, never titles or content, because the file is public. Every recording is read once.

**Two advisors work on this planner** (agreed 7 Oct 2026): Claude (this routine and chat sessions)
and Kimi, another assistant he uses on his Mac. So that neither does the other's work twice:

- `tools/state/recordings-read.json` is the single record of "this recording has been read and its
  planner facts applied". Whoever reads one — automatically or by hand, Claude or Kimi — adds its
  id and the date. Ids only.
- Before applying anything from a recording or a transcript, check (a) that file, (b) the planner
  itself, and (c) his Calendar on the dates concerned. If the fact is already in any of them, do
  not add it again: a second Calendar event or a duplicate note is what reaches him.
- Kimi's own log is on his Mac (`~/Projects/advisor/study-planner advisor/ADVISOR_LOG.md`, §0.3
  open items, §7 dated journal, newest on top). A cloud run cannot read it; a session on the Mac
  should, before comparing content. Transcripts he forwards to Kimi by hand never reach
  `recordings-read.json` unless Kimi adds them.
- Commit messages on `main` are the shared channel: say plainly what was done and what was
  deliberately skipped.

Speech-to-text mishears numbers. So from a recording alone: notes, tasks and announced tests with a
clearly stated date are applied, written as "(from your recording of <class>, <date>)"; a **changed**
date, time or room is a question unless an official e-mail or SIS says the same.

## 6. The briefing card

One all-day event per day in his primary calendar, titled `📋 Daily Briefing — YYYY-MM-DD`; the
planner shows it at the top of Today. The morning run creates it; the evening run adds a section to the
same event instead of creating another, and creates the card only if the morning left none. Plain lines, most important first:

```
Morning check 06:31 · Gmail 4 new · SIS no change · planner 1 change
⚠ Exam dates for Pharmacology are open in SIS
Planner updated:
• Pathology practical Fri 9 Oct cancelled (SIS message from the department)
Needs your OK:
1. Essay date: the department's list moves the 12 Nov seminar to 19 Nov — make the essay due
   Wed 18 Nov instead of 11 Nov?
Drafts ready:
• Reply to Doc. Ježek — thanks, will attend 13 Oct
• To the English Study Department (Cc Ježek) — enrol me in EAV090X02
Calendar: added "Faculty open day" Wed 14 Oct 16:00
Skipped: 2 newsletters, 1 library notice
```

A missing card means a run did not happen — that is how he notices. A push notification goes out
only when the planner changed or something needs him.

## 7. Cost

Quiet runs must stay cheap: no change and nothing new means search, watcher, card, stop.
Never read all of `index.html` (290 KB) or the flashcard decks; grep around the constant you need.
