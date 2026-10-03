#!/usr/bin/env node
/* The publishing gate. Nothing the automatic planner check changes goes live unless this passes,
   and it is the quickest way to check a hand-made change too.

   It does what the browser does, without a browser: it compiles the planner's one Babel script
   with the same babel-standalone (7.23.5, preset "react"), runs it in jsdom with the same React
   (18.2.0), renders the app, opens every tab, and runs tools/engine-tests.js in that window.
   A console error, an integrity warning (the guards in index.html use console.warn), a tab that
   renders next to nothing, or a failed engine test fails the gate.

   With --auto, which the automatic check always passes, it also enforces what an unattended
   change may touch: only AUTO_FILES may differ between --base (default origin/main) and HEAD,
   and the added lines may not carry an e-mail address the file did not already contain, nor
   anything that looks like an enrolment key or a password. The repo is public.

   Whenever physio_flashcards.html differs from --base, the hard rule in CLAUDE.md is checked:
   all 4,440 statements and answers identical to the original upload, 1a2be9b.

   Usage:  npm ci --prefix tools                      (once)
           node tools/check.mjs                       (a hand-made change, before committing)
           node tools/check.mjs --auto [--base REF]   (after committing, before pushing)
   Exit code 0 means pass. */
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import { JSDOM, VirtualConsole } from "jsdom";

const require = createRequire(import.meta.url);
const TOOLS = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(TOOLS, "..");
const args = process.argv.slice(2);
const AUTO = args.includes("--auto");
const BASE = args.includes("--base") ? args[args.indexOf("--base") + 1] : "origin/main";
const AUTO_FILES = ["index.html", "tools/state/sources.json", "docs/planner-updates.md"];
const TABS = ["Today", "Plan", "Classes", "Subjects", "Progress", "Goals", "Timeline", "Productivity"];

const problems = [];
const fail = (msg) => problems.push(msg);
const git = (...a) => execFileSync("git", a, { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 1. compile, exactly as the page does
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
const babel = [...html.matchAll(/<script type="text\/babel" data-presets="react">([\s\S]*?)<\/script>/g)];
let code = "";
if (babel.length !== 1) fail(`expected one Babel script in index.html, found ${babel.length}`);
else {
  try { code = require("@babel/standalone").transform(babel[0][1], { presets: ["react"] }).code; }
  catch (e) { fail("Babel cannot compile index.html: " + e.message); }
}

// 2. run it in jsdom, as classic scripts so top-level constants are shared like in a browser
const errors = [], warnings = [];
const vc = new VirtualConsole();
vc.on("error", (...a) => errors.push(a.map(String).join(" ")));
vc.on("warn", (...a) => warnings.push(a.map(String).join(" ")));
vc.on("jsdomError", (e) => errors.push("uncaught: " + ((e && (e.stack || e.message)) || e)));
const dom = new JSDOM(html.replace(/<script\b[\s\S]*?<\/script>/g, ""), {
  url: "http://localhost:8732/index.html", runScripts: "outside-only", pretendToBeVisual: true, virtualConsole: vc,
});
const w = dom.window, ctx = dom.getInternalVMContext();
const run = (src, label) => {
  try { return new vm.Script(src, { filename: label }).runInContext(ctx); }
  catch (e) { fail(`${label} threw: ${(e && e.stack) || e}`); return undefined; }
};
// React's package "exports" hide its UMD builds from require.resolve, so read them by path
const umd = (pkg, file) => fs.readFileSync(path.join(TOOLS, "node_modules", pkg, "umd", file), "utf8");
run(umd("react", "react.production.min.js"), "react.production.min.js");
run(umd("react-dom", "react-dom.production.min.js"), "react-dom.production.min.js");
if (code) run(code, "index.html");
await sleep(500);

// 3. the app renders, and so does every tab
const root = w.document.getElementById("root");
const shown = () => (root ? root.textContent.length : 0);
const rendered = shown();
if (rendered < 500) fail(`the app rendered almost nothing (${rendered} characters)`);
else {
  for (const t of TABS) {
    const b = [...w.document.querySelectorAll("button")].find((x) => x.textContent.trim() === t);
    if (!b) { fail(`there is no "${t}" tab`); continue; }
    b.dispatchEvent(new w.MouseEvent("click", { bubbles: true }));
    await sleep(150);
    if (shown() < 500) fail(`the ${t} tab rendered almost nothing (${shown()} characters)`);
  }
}

// 4. the engine tests, in the same window
const tests = code ? run(fs.readFileSync(path.join(TOOLS, "engine-tests.js"), "utf8"), "tools/engine-tests.js") : null;
if (!tests || typeof tests.checks !== "number") fail("the engine tests did not run");
else if (tests.fails) fail(`${tests.fails} of ${tests.checks} engine tests failed:\n    ` + tests.failed.join("\n    "));

// 5. what an unattended change may touch
if (AUTO) {
  let changed = [];
  try { changed = git("diff", "--name-only", BASE, "HEAD", "--").split("\n").filter(Boolean); }
  catch (e) { fail(`cannot compare with ${BASE}: ${e.message.split("\n")[0]}`); }
  const stray = changed.filter((f) => !AUTO_FILES.includes(f));
  if (stray.length) fail(`an automatic change may only touch ${AUTO_FILES.join(", ")}; this one also touches ${stray.join(", ")}`);
  const before = AUTO_FILES.map((f) => { try { return git("show", `${BASE}:${f}`); } catch { return ""; } }).join("\n");
  let added = [];
  try { added = git("diff", "-U0", BASE, "HEAD", "--", ...AUTO_FILES).split("\n").filter((l) => l.startsWith("+") && !l.startsWith("+++")); }
  catch { /* reported above */ }
  for (const l of added) {
    for (const m of l.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)) {
      if (!before.includes(m[0])) fail(`adds an e-mail address that was not there before: ${m[0]}`);
    }
    if (/enrol+ment key|enrol+ key|password|passwort|heslo/i.test(l)) fail(`adds something that looks like a key or a password: ${l.slice(0, 120)}`);
  }
}

// 6. the flashcard answer key — the hard rule
let deckDiffers = false;
try { deckDiffers = git("diff", "--name-only", BASE, "--", "physio_flashcards.html").trim() !== ""; } catch { deckDiffers = true; }
if (deckDiffers) {
  try {
    const line = git("show", "1a2be9b:physio_flashcards.html").split("\n")[32];
    const O = JSON.parse(line.slice(line.indexOf("["), line.lastIndexOf("]") + 1));
    const now = fs.readFileSync(path.join(ROOT, "physio_flashcards.html"), "utf8");
    const N = JSON.parse(now.match(/id="deck-data">([\s\S]*?)<\/script>/)[1].replace(/<\\\/script>/g, "</script>"));
    const qa = (D) => D.flatMap((t) => t.questions.map((q) => [q.q, q.a]));
    if (JSON.stringify(qa(O)) !== JSON.stringify(qa(N)) || qa(N).length !== 4440) fail("a flashcard statement or answer changed — never edit a flashcard answer (CLAUDE.md)");
  } catch (e) { fail(`the flashcard deck differs from ${BASE} and could not be checked: ${e.message}`); }
}

errors.forEach((e) => fail("console error: " + e.slice(0, 400)));
warnings.forEach((e) => fail("console warning (integrity guard?): " + e.slice(0, 400)));
console.log(JSON.stringify({ compiled: !!code, rendered, tabs: TABS.length, engineTests: tests ? `${tests.checks - tests.fails}/${tests.checks}` : "not run", auto: AUTO, base: BASE }));
console.log(problems.length ? "GATE FAILED\n- " + problems.join("\n- ") : "GATE PASSED");
w.close();
process.exit(problems.length ? 1 : 0);
