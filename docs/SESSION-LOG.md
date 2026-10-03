# Session log

What each session did, dated, newest at the bottom. Moved out of CLAUDE.md on 2026-10-03 — the
whole of "Where things stand — 2026-09-28", verbatim, including the winter-timetable transcription
and its corrections. Append here as work happens, and keep the "Now" section of CLAUDE.md current.

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
- 2026-10-02 · **Medical Psychology, from four sources.** (a) His Wispr Flow recording of the first
  seminar, 1 Oct — a meeting titled "medical psychology". **Where Wispr Flow keeps it:** the
  summary in `~/Library/Application Support/Wispr Flow/flow.sqlite`, table `Meetings`, column
  `summary`; the full transcript in `…/Wispr Flow/meetings/<meeting id>/refined.ndjson`, one JSON
  line per utterance. Open the database with `sqlite3 -readonly`, and select by title — it holds
  all of his dictation history, so never browse it. (b) A photo of the group-5 sign-up sheet.
  (c) A photo of Prof. Vevera's business card. (d) The Dept. of Psychiatry e-mail of 1 Oct with
  links to the essay anthology. What they say is in `SUBJECTS.mpe.creditRule` and `DEADLINES`.
- 2026-10-02 · **Reading the sign-up sheet.** Printed columns: week, date, time, topic,
  "presentation" (who presents the day's topic). Beside it, handwritten, an "essay" column (whose
  essay is pitched that day). Linas and Silvia: **presentation 29 Oct** (agitated or aggressive
  patient; anxious patient), **essay in the 12 Nov row**. The five groups each present once and
  pitch an essay once, never on the same day, which is what fixes the essay column's rows.
  Two conflicts with what the planner holds, neither resolved by changing the planner:
  - The sheet prints **"Čt 9:20–11:00"** for every seminar. Wrong for group 5: his recording
    started at 11:16 with the seminar under way, and his pharmacology practical recording ran
    until about 10:08 the same morning. The planner keeps 11:00–12:40.
  - The sheet prints **12.11** for "Handicapped patient"; the department's list (and the planner
    and Calendar) say it moved to **19 Nov**. His essay is due 08:00 on the Wednesday before:
    **11 Nov or 18 Nov.** `DEADLINES` carries 11 Nov with a `confirm` until he finds out.
- 2026-10-02 · **The topic cards lost "New guide" and "Discuss"**, at his request — he never used
  them. With them went the expand arrow (nothing left to open), `PROJECT_STUDY`, the `.copied`
  style and every subject's `cmd`. The Instagram button keeps `copyText`.
- 2026-10-02 · Outdated text fixed: the `fillDay` comment (Medical Psychology is now the topic
  costing more than a day), the "check again in October" line on the freshness panel, the
  Pathophysiology source note ("one of two verified courses"), the archive's pharmacology rooms,
  README's late-September Pathology re-check, and this file's Netlify and "a year behind" notes.
- 2026-10-02 · **Netlify** — see "Netlify was building every push". Told him what to click; it
  is his account. Not changed from here.
- 2026-10-02 · Verified locally on `planner-clean` (`index.html?r=…` to beat the cache): Today's
  countdown reads "Psychology presentation · 27 days"; after 29 Oct it becomes the essay, after
  11 Nov "Winter credits due"; both dates on the Timeline; the Medical Psychology card shows both
  boxes and the amber note, and fits at 375 px with no sideways scroll; 29 Oct's seminar reads
  "You present today, with Silvia"; topic cards have no arrow; no console errors.
- 2026-10-02 · **His answers.** (1) Essay: keep 11 Nov, flagged, until he asks. (2) Calendar: all
  of it, plus "a reminder to ask about outdated schedules and curricula, for every subject where I
  have to ask, at the day and hour of that subject's practical". (3) Pathophysiology gap: "I'd
  prioritise pathophysio, then pharma and then the rest (you decide)". (4) Hours: "0.75 h is
  never enough — estimate topic-specific". (3) and (4) are the two engine sections above.
- 2026-10-02 · **Calendar, done through the connector.** Simulation Medicine: the six real
  sessions' descriptions rewritten (dates, Moodle preparation, 100% attendance, substitutes via
  the secretary, 11–15 Jan); **6 Jan retitled "NO CLASS — Simulation Medicine"**, reminders off,
  free. Psychology: the 29 Oct instance retitled "… — YOU PRESENT" with reminders a week, a day
  and 30 min before; the 7 Jan description no longer says nobody knows when the essay is due.
  Pharmacology practical series: credit text corrected (no credit test, pre-term rule). New
  single events, all "free", none tagged `[planner:class]` so they show in the planner's
  Upcoming: **essay due** Wed 11 Nov 08:00 (`5lsfva0bvo9v69nvbohrfg09sg`, reminders a week and a
  day before) and four **"Ask:"** events, each at the start of that subject's practical with a
  popup at 0 min — Pathophysiology programme Mon 5 Oct 08:00 (`2n74vhnluptuo8ql6cvo0pmvv8`),
  Internal Medicine 5A/5B Tue 6 Oct 08:00 (`eks31gdqra0vbsr4ejpqjtgn5g`), final Pharmacology list
  and credit rules Thu 8 Oct 08:00 (`15mtirj3en2ee8sotu6htk2edg`), Psychology essay date and
  textbook Thu 15 Oct 11:00 (`un5odhoom32u3brr96h5i619n0`). When one is answered, delete nothing:
  edit the planner, and leave the event as the record.
- 2026-10-02 · **The engine test suite was updated** (in `~/.claude/projects/…/tests/`, outside the
  repo). With the new hours, 8 of 34 failed — all counts written for the old figures ("three
  topics on Thu 1 Oct", "21 in a full week", the retired `PHA100`/`PHA101`), none an engine
  fault. They now test the rule instead of the count: the ring's target equals the week's plan,
  a full week holds more than the half week, a refilled day has less room left than the smallest
  topic, the scoring cases read the week's own total. **34 of 34 pass.** To run it from the
  built-in pane: copy it into `.playwright-mcp/`, `fetch` it from `planner-clean`, and evaluate
  the body of its `page.evaluate`.
- 2026-10-02 · Still worth knowing: `EXAMS.mpe-s.place` says "Dept. of Psychology", but every
  document this year comes from the **Dept. of Psychiatry**. Unverified, so unchanged.
- 2026-10-02 · **Deployed as `a964832`.** Live `index.html` byte-identical to the commit at 17:18.
  Checked on the live origin in the built-in pane (clean profile): 678 topics, 1,312.5 h, Today's
  countdown "Psychology presentation · 27 days", Today's list one 2.5 h Pathophysiology topic,
  overflow 548 h, no "New guide"/"Discuss" buttons, both psychology deadlines, no console errors.
  **This log entry is committed on `test` only, not pushed** — he asked for fewer deploys, so it
  goes out with the next real change.
- 2026-10-02 · **Open, for him:** (1) Netlify: Stop builds or delete the site — his account, his
  clicks; until then every push is also built there (free plan, so it cannot be billed). (2) The
  four "Ask:" events answer themselves at the practicals: 5A/5B (Tue 6 Oct), the final
  pharmacology list and credit rules (Thu 8 Oct), the Pathophysiology practical programme (Mon
  5 Oct), the essay date and the textbook (Thu 15 Oct). Put each answer into the planner.
  (3) Whether the hour estimates feel right after a week of real study — the lever is
  `SIZE_HOURS`. (4) The 548 h overflow: his daily budget, late exam dates, or skips.
- 2026-10-03 · **Planning session: the study priority and an automatic planner check.** He asked
  for "pathophysio, then pharma, then internal and if still time once or twice a week patho", and
  for the planner to keep itself up to date automatically ("I never want outdated information").
  Simulated four ways of weighting on a copy of `fillDay` that matched the shipped one on every
  day of the year; he chose shares of the hours, 40/30/20/7/3, General Pathology paced to June,
  Simulation Medicine prep pinned. For the automation he chose: official facts applied
  automatically, everything else waits for his OK; runs morning and evening; and his class
  recordings read from the start — he will mark the Wispr Flow sessions worth reading with titles
  like "Introduction …" or "Information …", and **a log of what has been read must be kept so
  nothing is read twice.**
- 2026-10-03 · Found on the way: his existing "morning briefing" is a **cloud routine**
  (`trig_012JocxLdZg1M2UpMpU4EfHP`, cron `0 5 * * *` UTC, Gmail + Calendar connectors, no repo,
  Sonnet). Its Gmail query is event keywords only, so it misses most school mail: on 3 Oct it
  scanned one e-mail, and it never saw the 2 Oct e-mail from the internal-medicine secretary
  (`KLICKOVAJ@fnplzen.cz`, "Prezenční listina 5 AB kruhu…") whose attachment holds the 5A/5B
  attendance lists. Official school mail does reach his Gmail: SIS course messages
  (`studium.noreply@is.cuni.cz`, and teachers' own addresses with a "This message in SIS" footer),
  Moodle news-forum posts (`noreply@moodle.lfp.cuni.cz`), department staff (`@lfp.cuni.cz`),
  hospital staff (`@fnplzen.cz`), the study department (`medstudy@lfp.cuni.cz`).
- 2026-10-03 · **Engine: shares of the hours.** `STUDY_PRIORITY` → `STUDY_SHARE` + `REST_SHARE`,
  `GROUP_W` → `GROUP_SHARE`, `groupOf(subject, date)`, `PREP_PIN`/`PIN_DAY`, `PAT-G` `paceTo:"exam"`,
  `blockDeadline` honours it. Rules under "The plan engine". The Plan tab's sentence about the
  split is generated from `STUDY_SHARE`. **The engine tests now live in the repo**,
  `tools/engine-tests.js` (39 checks: the old 34 with the "behind" week moved to 12–18 Oct, plus
  shares within 2 points, every prep on the day before its class, General Pathology due in June,
  shares off in summer, a missed prep first the next day). To run them: load `planner-clean`,
  then in the page `(0,eval)(await (await fetch('/tools/engine-tests.js?r='+Date.now())).text())`
  → `{checks, fails, failed}`. The copy under `~/.claude/projects/…/tests/` is superseded.

---
- 2026-10-03 · **Deployed as `9654c8c`**: shares of the hours (40/30/20/7/3), General Pathology
  paced to the June exam, Simulation Medicine prep on the day before each class. Live `index.html`
  byte-identical to the commit. A copy of `fillDay` reproduced the shipped one on every day of the
  year before anything was changed, and the real engine then reproduced the simulated numbers
  exactly (3.7 / 2.9 / 1.5 / 1.1 topics a teaching week; winter shortfall 441 h, banner 505 h).
- 2026-10-03 · **The planner check built**: `AUTOMATION.md` (the rulebook), `tools/watch_sources.py`
  with its snapshot `tools/state/sources.json` (the eleven SIS course pages and the 2026/27
  pathophysiology syllabus PDF; run again straight after a snapshot it prints "No change in 12
  sources"), `tools/check.mjs` (the gate; it caught five deliberately broken changes out of five),
  `docs/planner-updates.md`. Gmail label "Planner read" created, id `Label_3`; the three school
  e-mails already handled by hand (Simulation Medicine, the Pathology lecture notice, the essay
  anthology) were labelled so the first run skips them.
- 2026-10-03 · Recordings: first built as a Mac task reading the Wispr Flow SQLite database (his
  titles look like "Pharma introduction 01.10.26" — the marker sits anywhere in the title), then
  replaced the same afternoon: his claude.ai account has a **Wispr Flow connector**
  (`search_meetings` by title, the same ids as on the Mac), so the cloud routine reads the marked
  recordings itself and no Mac is needed. The Mac helper and its worktree were removed. Read log:
  `tools/state/recordings-read.json`, ids only, seeded with the seven recordings that existed (the
  1 Oct pharmacology introduction and psychology seminar had been read by hand on 1–2 Oct).
- 2026-10-03 · **Cloud test 1** (one-time routine `trig_01Hun5FLb5eQ9GxvJKgU4yvZ`): clone, Node
  22.22 and `npm ci --prefix tools` fine, and **SIS is reachable from the cloud on the default
  network** — no allowlist change needed. But the cloud's auto-mode safety check **denied the
  commit step as "Production Deploy"**, and `gh auth status` says the cloud's GH_TOKEN is invalid,
  so no pull requests from there. The run sent him a push notification saying it stopped at
  step 4.
- 2026-10-03 · **He allowed publishing explicitly** — this routine only, after the gate passes.
  The rule is the routine's `session_request.config.auto_mode_allow` plus
  `auto_mode_environment`. **Writing `auto_mode_*` under `job_config.ccr.session_context` is
  silently dropped; use the `session_request` form.** And a routine created without
  `mcp_connections` gets every claude.ai connector: pass the list, or `clear_mcp_connections`.
  Questions now go on the briefing card, numbered, instead of pull requests.
- 2026-10-03 · CLAUDE.md halved, 135 → 72 KB: this log moved here verbatim, the second-year
  history and the flashcard pipeline to `docs/HISTORY.md`; every line of the old file is in one of
  the three. The memory note on keeping a log now points here.
- 2026-10-03 · **Cloud test 2** (`trig_012X9WgQRzSaTtYQ42Pn8SND`, with the permission): `npm ci`,
  the gate in the cloud (`39/39`, 8 tabs, `GATE PASSED`) and `git push origin HEAD:main` all
  succeeded — commit `eaa2efb`, one line in `docs/planner-updates.md`, 95 seconds in all. The two
  one-time test routines stay in his routines list as "Ran"; routines cannot be deleted through
  the API, only at claude.ai/code/routines.
