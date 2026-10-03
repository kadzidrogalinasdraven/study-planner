/* Engine tests for the planner. Every engine function is a global on the loaded page, so this
   file is evaluated in the page itself — by tools/check.mjs, or by hand in a browser console.
   It returns { checks, fails, failed }. Moved here from ~/.claude/…/tests/ on 3 Oct 2026 so the
   automatic planner check can run it. */
(() => {
    const res = []; let fails = 0;
    const ok = (cond, msg, extra) => { if (!cond) fails++; res.push((cond ? "ok   " : "FAIL ") + msg + (cond ? "" : "  " + JSON.stringify(extra || ""))); };
    const tick = (d, c, iso) => { d.done[c] = true; d.doneAt[c] = iso; };
    const lists = (plan) => plan.map(p => p.items.map(i => i.code).join(" "));
    const over = (plan) => JSON.stringify(plan.overflow.bySubject.map(x => [x.id, x.topics, x.hours]));
    const wkLists = (wp) => wp.week.map(iso => { const out = []; wp.subjects.forEach(s => { const c = wp.cells[s.id][iso]; if (c) c.planned.forEach(x => out.push(x)); }); return out.sort().join(" "); });
    const sorted = s => s.split(" ").filter(Boolean).sort().join(" ");
    { const T = "2026-10-01", d = migrate({});
      const p0 = buildPlan(d, T), l0 = lists(p0), o0 = over(p0);
      let same = true, sameOver = true;
      p0[0].items.forEach(i => { tick(d, i.code, T); const p = buildPlan(d, T); if (JSON.stringify(lists(p)) !== JSON.stringify(l0)) same = false; if (over(p) !== o0) sameOver = false; });
      ok(p0[0].items.length >= 1, "Thu 1 Oct starts with a list", l0[0]);
      ok(same, "ticking today's topics one by one leaves today and the next 13 days exactly as they were");
      ok(sameOver, "…and leaves the overflow banner exactly as it was");
      const p = buildPlan(d, T);
      ok(p[0].items.every(i => d.done[i.code]), "today's list still holds all three, now ticked");
      const n = buildPlan(d, "2026-10-02");
      ok(lists(n)[0] === l0[1], "next morning, today is what yesterday called tomorrow", [lists(n)[0], l0[1]]);
      ok(JSON.stringify(lists(n).slice(0, 13)) === JSON.stringify(l0.slice(1)), "…and the rest of the fortnight has not moved"); }
    { const T = "2026-10-01", d = migrate({});
      const p0 = buildPlan(d, T), l0 = lists(p0);
      const ahead = p0[1].items[0].code; tick(d, ahead, T);
      const p = buildPlan(d, T), l = lists(p);
      ok(l[0] === l0[0], "ticking one of tomorrow's topics leaves today's list alone");
      ok(l[1].indexOf(ahead) < 0, "…removes it from tomorrow");
      { const used = p[1].items.reduce((a, i) => a + Math.min(i.hrs, p[1].budget), 0); const least = Math.min(...Object.values(SIZE_HOURS).map(h => h.S));
        ok(p[1].budget - used < least, "…and tomorrow is refilled to its budget (no topic would still fit)", [l[1], l0[1], used, p[1].budget]); }
      ok(p.overflow.hours <= p0.overflow.hours, "…and the overflow does not grow", [p.overflow.hours, p0.overflow.hours]); }
    { const d = migrate({}); let bad = 0, checks = 0, firstBad = null;
      dateRange("2026-09-28", "2026-11-08").forEach(T => {
        for (let phase = 0; phase < 3; phase++) {
          const plan = buildPlan(d, T), wp = weekPlan(d, T);
          const wl = wkLists(wp), wi = wp.week.indexOf(T);
          for (let j = wi; j < 7; j++) { checks++; const pl = sorted(lists(plan)[j - wi]); if (pl !== wl[j]) { bad++; if (!firstBad) firstBad = { T, phase, day: wp.week[j], plan: pl, week: wl[j] }; } }
          const items = plan[0].items.map(i => i.code).filter(c => !d.done[c]);
          if (phase === 0) items.slice(0, Math.ceil(items.length / 2)).forEach(c => tick(d, c, T));
          if (phase === 1) items.forEach(c => tick(d, c, T));
        }
      });
      ok(bad === 0, "on plan for six weeks: Plan day == week-table day on " + checks + " checks", firstBad);
      const wp = weekPlan(d, "2026-11-08");
      ok(wp.done === wp.total && wp.behind === 0 && wp.extra === 0, "…and the last week reads fully done, nothing behind, nothing extra", [wp.done, wp.total, wp.behind, wp.extra]);
      const S = prodStats(d, "2026-11-08");
      ok(S.byKey.work.pct === 100 && S.byKey.work.n === wp.total, "…so the coursework ring is exactly 100%", [S.byKey.work.n, S.byKey.work.d]); }
    { let seed = 7; const rnd = () => (seed = (seed * 1664525 + 1013904223) % 4294967296) / 4294967296;
      let moved = 0, sumBad = 0, runs = 0, firstBad = null;
      ["2026-10-05", "2026-11-16", "2027-01-18", "2027-03-08", "2027-05-24"].forEach(mon => {
        for (let r = 0; r < 6; r++) {
          const d = migrate({});
          ALL_CODES.forEach(c => { if (rnd() < 0.25 * r / 5) tick(d, c, addDays(mon, -3 - Math.floor(rnd() * 30))); });
          const base = weekPlan(d, mon), key = JSON.stringify(base.planned), week = base.week;
          week.forEach(T => {
            const planned = Object.keys(base.planned).filter(c => !d.done[c]);
            const others = ALL_CODES.filter(c => !d.done[c] && !base.planned[c] && tierOf(c, d) !== "skip");
            const n = Math.floor(rnd() * 5);
            for (let i = 0; i < n; i++) { const pool = rnd() < 0.7 ? planned : others; if (pool.length) tick(d, pool[Math.floor(rnd() * pool.length)], T); }
            runs++;
            const wp = weekPlan(d, T);
            if (JSON.stringify(wp.planned) !== key) { moved++; if (!firstBad) firstBad = { mon, T }; }
            const S = prodStats(d, T);
            if (S.byKey.work.d !== base.total || S.byKey.work.n !== wp.done + wp.extra) sumBad++;
          });
        }
      });
      ok(moved === 0, "week plan identical on " + runs + " day-states of random ticking across five weeks of the year", firstBad);
      ok(sumBad === 0, "ring target stays the week's total, and ticked-this-week == planned-done + beyond-the-plan"); }
    // a week with no class prep in it: from 3 Oct 2026 a missed prep comes first (tested below)
    { const d = migrate({}), T0 = "2026-10-12";
      const base = weekPlan(d, T0), mondays = Object.keys(base.planned).filter(c => base.planned[c] === T0);
      const wed = "2026-10-14";
      const wp = weekPlan(d, wed), plan = buildPlan(d, wed);
      const dueBefore = Object.keys(base.planned).filter(c => base.planned[c] < wed);
      ok(wp.behind === dueBefore.length && wp.behind > 0, "Wednesday with nothing done: everything Monday and Tuesday held is behind", [wp.behind, dueBefore.length]);
      ok(wp.total === base.total, "…the week's target is unchanged", [wp.total, base.total]);
      ok(mondays.every(c => wp.planned[c] === T0), "…and Monday's topics are still on Monday in the table");
      ok(mondays.every(c => plan[0].items.some(i => i.code === c)), "…while the Plan has moved them into today", [mondays, lists(plan)[0]]);
      const hrs = plan[0].items.reduce((a, i) => a + Math.min(i.hrs, plan[0].budget), 0);
      ok(hrs <= plan[0].budget + 0.001, "…inside today's budget, not piled on top of it", [hrs, plan[0].budget]); }
    { const d = migrate({}); const S = prodStats(d, "2026-09-23");
      ok(S.plan.total === 0 && !S.byKey.work.configured && S.counted === 2, "21–27 Sept, before term: nothing planned, coursework not counted", [S.plan.total, S.counted]);
      const S2 = prodStats(d, "2026-09-30");
      ok(S2.plan.total > 0 && S2.byKey.work.d === S2.plan.total, "this week (term opens Thursday): the ring's target is the week's planned topics (" + S2.plan.total + ")", S2.plan.total);
      const S3 = prodStats(d, "2026-10-07");
      ok(S3.plan.total > S2.plan.total, "a full teaching week plans more than the half week that opens term (" + S3.plan.total + " vs " + S2.plan.total + ")", [S3.plan.total, S2.plan.total]); }
    { const d = migrate({}); let maxCell = 0, maxWhere = null, weeks = 0, err = null;
      try { dateRange("2026-09-28", "2027-07-04").filter((x, i) => i % 7 === 0).forEach(mon => {
          const wp = weekPlan(d, mon); weeks++;
          wp.subjects.forEach(s => wp.week.forEach(iso => { const c = wp.cells[s.id][iso]; if (c && c.planned.length > maxCell) { maxCell = c.planned.length; maxWhere = s.short + " " + iso; } })); });
      } catch (e) { err = String(e); }
      ok(!err, weeks + " consecutive weeks plan without error", err);
      ok(maxCell <= 10, "largest single cell: " + maxCell + " boxes (" + maxWhere + ")"); }
    { const T = "2026-10-01", d = migrate({});
      const p0 = buildPlan(d, T), c = p0[0].items[0].code, k0 = JSON.stringify(weekPlan(d, T).planned);
      tick(d, c, T); d.done[c] = false; delete d.doneAt[c];
      ok(JSON.stringify(lists(buildPlan(d, T))) === JSON.stringify(lists(p0)) && JSON.stringify(weekPlan(d, T).planned) === k0, "tick then untick: Plan and week table both back to where they started"); }
    // scoring
    const eq = (got, want, msg) => ok(JSON.stringify(got) === JSON.stringify(want), msg, { got, want });
    const mk = (T, { lang = [], gym = [], work = 0 }) => { const d = migrate({}), wk = weekDaysOf(T);
      lang.forEach(i => { d.prod.lang.log[wk[i]] = { lang: langSuggest(wk[i]), tickedAt: wk[i] + "T10:00:00Z" }; });
      gym.forEach(i => { d.prod.gym.log[wk[i]] = { tickedAt: wk[i] + "T10:00:00Z" }; });
      Object.keys(weekPlan(d, T).planned).slice(0, work).forEach(c => { d.done[c] = true; d.doneAt[c] = T; }); return d; };
    const T = "2026-09-30";
    const W = weekPlan(migrate({}), T).total, W2 = weekPlan(migrate({}), "2026-10-07").total;   // this week's planned topics, and a full week's
    let S = prodStats(mk(T, { lang: [1, 3, 5], gym: [0, 2, 4], work: W }), T);
    eq([S.byKey.work.pct, S.byKey.gym.pct, S.byKey.lang.pct, S.combined, S.bonus], [100, 100, 100, 100, 0], "scoring: everything exactly on target → 100, no bonus");
    S = prodStats(mk(T, { lang: [1, 2, 3, 5], gym: [0, 2, 4], work: W }), T);
    eq([S.byKey.lang.pct, S.combined, S.bonus], [133, 108, 8], "scoring: 4 of 3 language days → 133, combined 108");
    S = prodStats(mk(T, { lang: [0, 1, 2, 3, 4, 5, 6], gym: [0, 2, 4], work: W }), T);
    eq([S.byKey.lang.pct, S.combined, S.bonus], [233, 133, 33], "scoring: 7 of 3 → 233, combined 133");
    S = prodStats(mk(T, { lang: [1, 3, 5], gym: [0, 1, 2, 3, 4], work: W }), T);
    eq([S.byKey.gym.pct, S.combined], [100, 100], "scoring: 5 gym sessions of 3 still 100");
    { const h = Math.floor(W / 2), pct = Math.round(h / W * 100);
      S = prodStats(mk(T, { lang: [1, 3, 5], gym: [0, 2, 4], work: h }), T);
      eq([S.byKey.work.n, S.byKey.work.d, S.byKey.work.pct, S.combined], [h, W, pct, Math.round((2 * h / W + 2) / 4 * 100)], "scoring: half the week's topics → coursework " + pct); }
    { const d = mk(T, { lang: [1, 3, 5], gym: [0, 2, 4], work: W }), planned = weekPlan(d, T).planned;
      ALL_CODES.filter(c => !planned[c] && !d.done[c]).slice(0, 3).forEach(c => { d.done[c] = true; d.doneAt[c] = T; });
      S = prodStats(d, T); eq([S.byKey.work.n, S.byKey.work.d, S.byKey.work.pct, S.plan.extra, S.combined], [W + 3, W, 100, 3, 100], "scoring: three ticked beyond the plan → still 100, three extra"); }
    S = prodStats(mk("2026-10-07", { lang: [0, 1, 2, 3, 4, 5, 6], gym: [0, 2, 4], work: W2 }), "2026-10-07");
    eq([S.byKey.lang.d, S.byKey.lang.pct, S.byKey.work.d, S.combined, S.bonus], [4, 175, W2, 119, 19], "scoring: full week, 7 of 4 → 175, combined 119");
    S = prodStats(mk("2026-09-23", { lang: [0, 2, 4, 6], gym: [0, 2, 4] }), "2026-09-23");
    eq([S.counted, S.byKey.work.configured, S.byKey.lang.d, S.combined], [2, false, 4, 100], "scoring: week before term: two categories, 100");
    // the study shares, the pinned preparation and General Pathology's deadline (3 Oct 2026)
    { const d = migrate({}), T0 = "2026-10-03", bl = liveBlocks(d, T0), q = {};
      bl.forEach(x => { q[x.key] = blockQueue(x.b, d).slice(); });
      const hrs = {}; let placed = {};
      dateRange(T0, "2027-01-10").forEach(D => fillDay(D, bl, q).items.forEach(i => {
        placed[i.code] = D;
        if (D >= "2026-10-05" && D <= "2026-12-20") { const k = PREP_PIN[BLOCK_OF[i.code]] ? "pin" : groupOf(i.subject, D); hrs[k] = (hrs[k] || 0) + Math.min(i.hrs, budgetFor(D)); } }));
      const tot = Object.keys(hrs).filter(k => k !== "pin").reduce((a, k) => a + hrs[k], 0);
      const want = Object.assign({}, GROUP_SHARE), wsum = Object.values(want).reduce((a, b) => a + b, 0);
      const off = Object.keys(want).map(k => [k, Math.round((hrs[k] || 0) / tot * 1000) / 10, Math.round(want[k] / wsum * 1000) / 10]).filter(r => Math.abs(r[1] - r[2]) > 2);
      ok(off.length === 0, "an untouched winter splits its hours within 2 points of the shares", off);
      const pins = Object.keys(PIN_DAY);
      ok(pins.length === 6 && pins.every(c => placed[c] === PIN_DAY[c]), "each Simulation Medicine prep falls on the day before its class", pins.map(c => [c, placed[c], PIN_DAY[c]]));
      const pg = bl.filter(x => x.key === "PAT-G")[0];
      ok(pg && pg.due === deadlineOf(SUBJECT.pat, d) && pg.due > CREDIT_DUE.winter, "General Pathology is paced to the June exam, not the January credit", pg && pg.due);
      ok(groupOf("pfy", "2027-02-14") === "pfy" && groupOf("pat", "2027-02-15") === "rest", "the shares hold through the winter exam period and stop when summer teaching opens"); }
    { const d = migrate({}), first = Object.keys(PIN_DAY).sort((a, b) => PIN_DAY[a] < PIN_DAY[b] ? -1 : 1)[0];
      const classDay = addDays(PIN_DAY[first], 1), p = buildPlan(d, classDay);
      ok(p[0].items.length && p[0].items[0].code === first, "a missed prep is the first thing on the next day's list", [first, lists(p)[0]]); }
    return { checks: res.length, fails, failed: res.filter(r => r.indexOf("FAIL") === 0) };
})()
