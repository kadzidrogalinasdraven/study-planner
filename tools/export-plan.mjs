#!/usr/bin/env node
/* THE CLOCK — the planner's next 21 days, for the notes factories (Linas, 16 Oct 2026).

   "It has to run like a clock": every Pathophysiology and Pharmacology topic the planner gives him
   should have its note filed BEFORE its day. The factories on his Mac build one note at a time, so
   they must build in the planner's order. This command tells them that order.

     node tools/export-plan.mjs              write the export (the factories run this before every build)
     node tools/export-plan.mjs --publish    …and publish notes.json to main when it has changed
       --today YYYY-MM-DD   plan from another day (default: today in Prague)
       --days N             the window (default 21)
       --out PATH           default ~/Projects/advisor/plan/plan-next-21-days.json

   Run `git -C ~/Projects/study-planner pull --ff-only` first: the cloud planner check edits
   CLASS_TOPICS on main. Offline it plans from the last pulled copy.

   It loads index.html exactly as the gate does (tools/check.mjs) and runs the page's own engine, so
   the export cannot disagree with the app — and it checks that it does not: the first fourteen days
   must equal buildPlan's. The plan is the INTENDED plan; the swap of a topic without a note is laid
   over it in the app only (index.html, noteSwaps).

   Ticks are not known here. They live only in his browsers and in the planner's hidden Drive file,
   which only the planner's own sign-in can open, so the plan is made as if nothing were ticked.
   Class-topic dates do not depend on ticks; share topics run in list order.

   The factories' queues are read, never written. Pathophysiology is matched by its own `pfy`
   field, Pharmacology by exact title; any topic that stops matching fails the run, loudly.
   Exit 0 when written, 1 on any failure — and then nothing is written or published. */
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { JSDOM, VirtualConsole } from "jsdom";

const require = createRequire(import.meta.url);
const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLS, "..");
const HOME = os.homedir();
const args = process.argv.slice(2);
const opt = (name, dflt) => (args.includes(name) ? args[args.indexOf(name) + 1] : dflt);
const pragueDay = (d) => new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Prague", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);

const TODAY = opt("--today", pragueDay(new Date()));
const DAYS = +opt("--days", "21");
const OUT = opt("--out", path.join(HOME, "Projects/advisor/plan/plan-next-21-days.json"));
const PUBLISH = args.includes("--publish");
// the factories, by planner subject: where each keeps its queue, and the folder its files are relative to
const FACTORIES = {
  pfy: { root: path.join(HOME, "mnt/Pathophysiology"), list: "topics" },
  pha: { root: path.join(HOME, "mnt/Pharmacology"), list: "rows" },
};
const NEXT_PER_SUBJECT = 10;   // the order beyond the window, for when he is ahead of it
const NEXT_SUBJECTS = ["pfy", "pha", "iim"];

const problems = [];
const die = () => { console.error("export-plan: nothing written.\n  " + problems.join("\n  ")); process.exit(1); };
if (!/^\d{4}-\d\d-\d\d$/.test(TODAY) || !(DAYS >= 14)) { problems.push(`bad --today ${TODAY} or --days ${DAYS} (at least 14)`); die(); }
const git = (a, o = {}) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["pipe", "pipe", "pipe"], ...o });

// 1. the page, as the gate loads it
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const babel = [...html.matchAll(/<script type="text\/babel" data-presets="react">([\s\S]*?)<\/script>/g)];
const code = require("@babel/standalone").transform(babel[0][1], { presets: ["react"] }).code;
const vc = new VirtualConsole();
const warnings = [];
vc.on("warn", (...a) => warnings.push(a.map(String).join(" ")));
const dom = new JSDOM(html.replace(/<script\b[\s\S]*?<\/script>/g, ""), {
  url: "http://localhost:8732/index.html", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc,
});
const ctx = dom.getInternalVMContext();
const umd = (pkg, file) => fs.readFileSync(path.join(TOOLS, "node_modules", pkg, "umd", file), "utf8");
const run = (src, label) => new vm.Script(src, { filename: label }).runInContext(ctx);
run(umd("react", "react.production.min.js"), "react.production.min.js");
run(umd("react-dom", "react-dom.production.min.js"), "react-dom.production.min.js");
run(code, "index.html");
const linkWarn = warnings.filter((w) => w.indexOf("CLASS_TOPICS") === 0);
if (linkWarn.length) { problems.push(...linkWarn); die(); }

// 2. the plan, from the page's own engine
const plan = JSON.parse(run(`(function(T, N, PER, SUBS){
  const d=migrate({}), sd=startDay(d, T), days=dateRange(T, addDays(T, N-1));
  const row=function(date, code, why){
    const L=LINK[code]||null, s=SUBJECT[SUBJECT_OF[code]];
    return { date:date, subject:s.short, subject_id:s.id, code:code, title:CODE_TITLE[code], why:why,
             "class": L ? { slot:L.slot, date:L.date, what:L.what||"", prep:!!L.prep } : null, hours:HRS_OF[code] };
  };
  const rows=[], byDay={};
  days.forEach(function(date, n){
    const f = n===0 ? sd.first : fillDay(date, sd.blocks, sd.queue);
    byDay[date]=f.items.map(function(i){ return i.code; });
    f.items.forEach(function(i){ rows.push(row(date, i.code, i.why && i.why.link ? "class" : "share")); });
  });
  // beyond the window: the order the plan keeps after it
  const next={}; SUBS.forEach(function(k){ next[k]=[]; });
  let last=T; sd.blocks.forEach(function(x){ if(x.due>last) last=x.due; });
  for(let date=addDays(T, N); date<=last && SUBS.some(function(k){ return next[k].length<PER; }); date=addDays(date, 1)){
    fillDay(date, sd.blocks, sd.queue).items.forEach(function(i){
      if(next[i.subject] && next[i.subject].length<PER) next[i.subject].push(row(date, i.code, i.why && i.why.link ? "class" : "share"));
    });
  }
  const bp=buildPlan(d, T), differ=bp.filter(function(p){ return p.items.map(function(i){ return i.code; }).join()!==(byDay[p.date]||[]).join(); })
    .map(function(p){ return p.date; });
  const pile=bp.backlog.map(function(c){ return row(LINK[c].day, c, "class"); });
  const codes={}; ["pfy","pha"].forEach(function(k){ codes[k]=CODES_OF[k].map(function(c){ return [c, CODE_TITLE[c]]; }); });
  return JSON.stringify({ rows:rows, next:next, pile:pile, differ:differ, codes:codes,
    subject:{ pfy:SUBJECT.pfy.short, pha:SUBJECT.pha.short, iim:SUBJECT.iim.short } });
})(${JSON.stringify(TODAY)}, ${DAYS}, ${NEXT_PER_SUBJECT}, ${JSON.stringify(NEXT_SUBJECTS)})`, "export"));
if (plan.differ.length) problems.push("the export disagrees with buildPlan on " + plan.differ.join(", "));

// 3. the factories' notes, matched to planner codes
const norm = (s) => String(s).normalize("NFKC").replace(/[‘’`´]/g, "'").replace(/[“”]/g, '"').replace(/[–—]/g, "-").replace(/\s+/g, " ").trim().toLowerCase();
const filedDay = (r, file) => {
  const f = r.filed;
  if (typeof f === "string" && /^\d{4}-\d\d-\d\d$/.test(f)) return f;
  if (typeof f === "string" && /^\d{4}-\d\d-\d\dT/.test(f) && !isNaN(Date.parse(f))) return pragueDay(new Date(f));
  return pragueDay(fs.statSync(file).mtime);   // some rows hold the file's path in `filed`: the file's own date stands in
};
const factory = {};   // planner code → { code, status, filed, ready }
for (const sid of Object.keys(FACTORIES)) {
  const F = FACTORIES[sid], qf = path.join(F.root, "_pipeline/QUEUE.json");
  let rows;
  try { rows = JSON.parse(fs.readFileSync(qf, "utf8"))[F.list]; } catch (e) { problems.push(`cannot read ${qf}: ${e.message}`); continue; }
  if (!Array.isArray(rows)) { problems.push(`${qf} has no "${F.list}" list`); continue; }
  const planner = plan.codes[sid], match = {};
  if (sid === "pfy") {
    const by = {};
    rows.forEach((r) => { if (by[r.pfy]) problems.push(`${qf}: ${r.pfy} twice (${by[r.pfy].code}, ${r.code})`); by[r.pfy] = r; });
    planner.forEach(([c, t]) => {
      const r = by[c];
      if (!r) problems.push(`${plan.subject.pfy} ${c} "${t}" has no factory row`);
      else if (norm(r.title) !== norm(t)) problems.push(`${plan.subject.pfy} ${c}: planner "${t}", factory ${r.code} "${r.title}"`);
      else match[c] = r;
    });
    rows.forEach((r) => { if (!planner.some(([c]) => c === r.pfy)) problems.push(`${qf}: ${r.code} points at ${r.pfy}, not a planner code`); });
  } else {
    const by = {};
    rows.forEach((r) => { (by[norm(r.title)] = by[norm(r.title)] || []).push(r); });
    planner.forEach(([c, t]) => {
      const hit = by[norm(t)] || [];
      if (hit.length !== 1) problems.push(`${plan.subject[sid]} ${c} "${t}" matches ${hit.length} factory rows`);
      else match[c] = hit[0];
    });
    const used = new Set(Object.values(match));
    rows.forEach((r) => { if (!used.has(r)) problems.push(`${qf}: ${r.code} "${r.title}" matches no planner title`); });
  }
  for (const [c, r] of Object.entries(match)) {
    const file = r.file ? path.join(F.root, r.file) : null;
    const ready = r.status === "done" && !!file && fs.existsSync(file);
    factory[c] = { code: r.code, status: r.status, filed: ready ? filedDay(r, file) : null, ready };
  }
}
if (problems.length) die();

// 4. the export
const withFactory = (x) => {
  const f = factory[x.code];
  if (!f) return { ...x, factory: null };
  // a pile row's date has passed: for it, "in time" only means the note is there now
  return { ...x, factory: { ...f, in_time: f.ready && (x.date < TODAY || f.filed < x.date) } };
};
const head = git(["rev-parse", "--short", "HEAD"]).trim();
const out = {
  generated: new Date().toISOString(),
  planner_commit: head,
  from: TODAY,
  to: pragueDay(new Date(Date.parse(TODAY + "T12:00:00Z") + (DAYS - 1) * 86400000)),
  ticks: "unknown — planned as if nothing were ticked; class-topic dates do not depend on ticks",
  note_rule: "a note is in time when it was filed BEFORE the row's date",
  rows: plan.rows.map(withFactory),
  next: Object.fromEntries(NEXT_SUBJECTS.map((k) => [plan.subject[k], plan.next[k].map(withFactory)])),
  pile: plan.pile.map(withFactory),
};
fs.mkdirSync(path.dirname(OUT), { recursive: true });
const tmp = OUT + ".tmp-" + process.pid;
fs.writeFileSync(tmp, JSON.stringify(out, null, 1) + "\n");
fs.renameSync(tmp, OUT);

// 5. a summary: what each factory subject needs, and what is not in time
const lines = [`${out.from} – ${out.to}: ${out.rows.length} topics, planner ${head} → ${OUT}`];
for (const sid of Object.keys(FACTORIES)) {
  const mine = out.rows.filter((r) => r.subject_id === sid);
  lines.push(`  ${plan.subject[sid]}: ${mine.length} planned, ${mine.filter((r) => r.factory.in_time).length} with a note in time`);
  mine.filter((r) => !r.factory.in_time).forEach((r) =>
    lines.push(`    ${r.date}  ${r.code} = ${r.factory.code}  ${r.title}${r.factory.ready ? " (filed " + r.factory.filed + ", too late)" : ""}`));
}
console.log(lines.join("\n"));

// 6. notes.json for the app — only when asked, and only when it changed
if (PUBLISH) {
  const ready = Object.keys(factory).filter((c) => factory[c].ready).sort();
  const notes = Object.fromEntries(ready.map((c) => [c, factory[c].filed]));
  if (!run(`isNotes(${JSON.stringify(notes)})`, "check")) { console.error("export-plan: notes.json would not pass the app's own check; not published"); process.exit(1); }
  const body = "{\n" + ready.map((c) => `  "${c}": "${notes[c]}"`).join(",\n") + "\n}\n";
  console.log(publishNotes(body, notes));
}
process.exit(0);   // the page's own timers (sync, refresh) would keep Node alive

/* Commits notes.json onto origin/main WITHOUT touching the working tree, the index or the current
   branch — the Mac's copy is usually on `test` with work in progress. A temporary index is built
   from origin/main with only notes.json replaced. If the cloud planner check pushes in between, the
   push is refused and the whole thing is rebuilt on the new main, at most three times. */
function publishNotes(body, notes) {
  for (let attempt = 1; ; attempt++) {
    git(["fetch", "-q", "origin", "main"]);
    let current = null;
    try { current = git(["show", "origin/main:notes.json"]); } catch (e) { /* not published yet */ }
    if (current === body) return "notes.json unchanged on main";
    let before = {};
    try { before = JSON.parse(current || "{}"); } catch (e) { /* replaced below */ }
    const added = Object.keys(notes).filter((c) => !before[c]), gone = Object.keys(before).filter((c) => !notes[c]);
    const count = (sid) => Object.keys(notes).filter((c) => c.startsWith(sid === "pfy" ? "PFY" : "PHA")).length;
    const msg = `Notes: ${added.length ? "+" + added.join(" +") : "dates updated"}${gone.length ? " −" + gone.join(" −") : ""}` +
      ` — ${count("pfy")} ${plan.subject.pfy}, ${count("pha")} ${plan.subject.pha} filed\n\nPublished by tools/export-plan.mjs --publish from the factories' queues.`;
    const index = path.join(os.tmpdir(), `planner-notes-index-${process.pid}`);
    const env = { ...process.env, GIT_INDEX_FILE: index };
    try {
      const blob = git(["hash-object", "-w", "--stdin"], { input: body }).trim();
      git(["read-tree", "origin/main"], { env });
      git(["update-index", "--add", "--cacheinfo", `100644,${blob},notes.json`], { env });
      const tree = git(["write-tree"], { env }).trim();
      const commit = git(["commit-tree", tree, "-p", "origin/main", "-m", msg]).trim();
      git(["push", "-q", "origin", `${commit}:refs/heads/main`]);
      git(["fetch", "-q", "origin", "main"]);
      return `notes.json published to main: ${commit.slice(0, 7)} — ${msg.split("\n")[0]}`;
    } catch (e) {
      if (attempt >= 3) { console.error("export-plan: could not publish notes.json: " + (e.stderr || e.message)); process.exit(1); }
    } finally {
      fs.rmSync(index, { force: true });
    }
  }
}
