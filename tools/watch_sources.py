#!/usr/bin/env python3
"""Watch the official pages the planner is built from, and say what changed.

Compares every source with the last snapshot (tools/state/sources.json), prints what differs, and
with --update writes the new snapshot. Standard library only.

What it keeps, and why only this. A SIS course page carries fields that change without anyone
editing anything (capacity, enrolled counts, schedule links, teacher rosters), so only the
editorial blocks are compared: each section's English text and its "Last update" stamp, a few
stable header fields, and the list of attached files (did, name, comment, who added it). A SIS
attachment is not year-scoped — the same did is served under every skr — so a NEW did is the
signal, not the file's presence (CLAUDE.md, "Source freshness"). For a plain file such as a
department PDF it keeps the size and a hash of the bytes.

The course list is read from index.html (every SUBJECTS entry's sis:"…"), so it cannot drift.

Usage:
  python3 tools/watch_sources.py            report what changed since the snapshot
  python3 tools/watch_sources.py --update   report, then save the new snapshot
Exit status: 0 nothing changed, 3 something changed, 2 nothing changed but a source could not be
fetched (in the cloud that is usually the network allowlist: is.cuni.cz must be allowed).
"""
import difflib, hashlib, html, json, os, re, sys, time, urllib.request, urllib.error

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
STATE = os.path.join(ROOT, "tools", "state", "sources.json")
SIS = "https://is.cuni.cz/studium/eng/predmety/index.php?do=predmet&kod={code}&fak=11140&skr=2026"
FILES = {
    # the 2026/27 Pathophysiology II syllabus, linked from no SIS page (CLAUDE.md, "Source freshness")
    "file:pfy-syllabus-2026-27": "https://lfp.cuni.cz/wp-content/uploads/2025/09/Syllabus-of-Pathological-Physiology-II-2026_27.pdf",
}
FIELDS = ["Semester:", "E-Credits:", "Examination process:", "Hours per week, examination:",
          "State of the course:", "Guarantor:", "Note:", "Pre-requisite :", "Interchangeability :"]
UA = {"User-Agent": "Mozilla/5.0 (planner source watch; github.com/kadzidrogalinasdraven/study-planner)"}


def fetch(url, tries=3):
    last = None
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=40) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            last = f"HTTP {e.code} {e.reason}"
            if e.code in (401, 403, 404):
                break
        except Exception as e:  # network down, DNS, timeout
            last = str(e)
        time.sleep(2 * (i + 1))
    raise RuntimeError(last or "unreachable")


def text_of(fragment):
    t = re.sub(r"(?i)<br\s*/?>|</p>|</li>|</tr>|</h\d>", "\n", fragment)
    t = re.sub(r"<[^>]+>", " ", t)
    t = html.unescape(t).replace("\xa0", " ")
    lines = [re.sub(r"[ \t\r\f\v]+", " ", ln).strip() for ln in t.split("\n")]
    return "\n".join(ln for ln in lines if ln)


def div_body(s, start):
    """The inner HTML of the <div> whose opening tag starts at `start`, nested divs included."""
    i = s.index(">", start) + 1
    depth = 1
    for m in re.finditer(r"(?i)<div\b|</div\s*>", s[i:]):
        depth += 1 if m.group(0).lower().startswith("<div") else -1
        if depth == 0:
            return s[i:i + m.start()], i + m.end()
    return s[i:], len(s)


def parse_sis(raw):
    s = raw.decode("utf-8", errors="replace")
    out = {"fields": {}, "sections": {}, "files": {}}
    for label in FIELDS:
        m = re.search(r"<th[^>]*>\s*" + re.escape(label) + r"\s*</th>\s*<td[^>]*>(.*?)</td>", s, re.S)
        if m:
            out["fields"][label.rstrip(" :")] = text_of(m.group(1))
    # A section is a head3 row naming it, then one content div per language: pamela_X_ENG and/or
    # pamela_X_CZE. A section written in one language only has no language switch, so the divs
    # are found by position — between this head row and the next.
    heads = list(re.finditer(r'<tr class="head3">(.*?)</tr>', s, re.S))
    for i, h in enumerate(heads):
        b = re.search(r"<b>(.*?)</b>", h.group(1), re.S)
        if not b:
            continue
        name = text_of(b.group(1))
        stop = heads[i + 1].start() if i + 1 < len(heads) else len(s)
        found = {}
        for m in re.finditer(r'<div id="pamela_\w+?_(ENG|CZE)"', s[h.end():stop]):
            body, _ = div_body(s, h.end() + m.start())
            # the edit stamp sits inside the block, at its end: keep it apart from the text
            stamp = re.search(r"Last update:\s*([^<]*?\(\d\d\.\d\d\.\d{4}\))", body)
            text = "\n".join(ln for ln in text_of(body).split("\n") if not ln.startswith("Last update:"))
            found[m.group(1)] = {"lang": m.group(1), "updated": stamp.group(1).strip() if stamp else "", "text": text}
        pick = found.get("ENG") if found.get("ENG", {}).get("text") else found.get("CZE") or found.get("ENG")
        if pick:
            out["sections"][name] = pick
    for row in re.findall(r'<tr class="row\d">(.*?)</tr>', s, re.S):
        did = re.search(r"did=(\d+)", row)
        if not did:
            continue
        cells = [text_of(c) for c in re.findall(r"<td[^>]*>(.*?)</td>", row, re.S)]
        name = re.search(r'class="link2">(.*?)</a>', row, re.S)
        out["files"][did.group(1)] = {
            "name": text_of(name.group(1)) if name else (cells[1] if len(cells) > 1 else ""),
            "comment": cells[2] if len(cells) > 2 else "",
            "added_by": cells[3] if len(cells) > 3 else "",
        }
    if not out["sections"] and not out["fields"]:
        raise RuntimeError("the page has no course sections — layout changed, or not a course page")
    return out


def courses():
    src = open(os.path.join(ROOT, "index.html"), encoding="utf-8").read()
    return sorted(set(re.findall(r'sis:"(EAP\d+)"', src)))


def snapshot():
    snap, errors = {}, {}
    for code in courses():
        url = SIS.format(code=code)
        try:
            snap["sis:" + code] = dict(url=url, **parse_sis(fetch(url)))
        except Exception as e:
            errors["sis:" + code] = f"{url}: {e}"
    for key, url in FILES.items():
        try:
            b = fetch(url)
            snap[key] = {"url": url, "bytes": len(b), "sha256": hashlib.sha256(b).hexdigest()}
        except Exception as e:
            errors[key] = f"{url}: {e}"
    return snap, errors


def short_diff(a, b, n=40):
    lines = list(difflib.unified_diff(a.split("\n"), b.split("\n"), lineterm="", n=0))[2:]
    lines = [ln for ln in lines if not ln.startswith("@@")]
    return lines[:n] + ([f"… {len(lines) - n} more lines"] if len(lines) > n else [])


def compare(old, new):
    report = []
    for key in sorted(set(old) | set(new)):
        o, n = old.get(key), new.get(key)
        if n is None:
            continue  # not fetched this time; reported as an error, never as "removed"
        if o is None:
            report.append(f"{key}: new source, now watched ({n['url']})")
            continue
        if "sha256" in n:
            if o.get("sha256") != n["sha256"]:
                report.append(f"{key}: the file changed ({o.get('bytes')} → {n['bytes']} bytes) — {n['url']}")
            continue
        head = f"{key} ({n['url']})"
        for did in sorted(set(o["files"]) | set(n["files"]), key=int):
            fo, fn = o["files"].get(did), n["files"].get(did)
            if fn and not fo:
                report.append(f"{head}: NEW FILE did={did} “{fn['name']}” — {fn['comment']} — added by {fn['added_by']}")
            elif fo and not fn:
                report.append(f"{head}: file removed did={did} “{fo['name']}”")
            elif fo != fn:
                report.append(f"{head}: file did={did} changed: {fo} → {fn}")
        for f in sorted(set(o["fields"]) | set(n["fields"])):
            if o["fields"].get(f) != n["fields"].get(f):
                report.append(f"{head}: field “{f}”: {o['fields'].get(f)!r} → {n['fields'].get(f)!r}")
        for sec in sorted(set(o["sections"]) | set(n["sections"])):
            so, sn = o["sections"].get(sec), n["sections"].get(sec)
            if so == sn:
                continue
            if not so or not sn:
                report.append(f"{head}: section “{sec}” {'added' if sn else 'removed'}")
                continue
            what = f"{head}: section “{sec}” changed (last update {so['updated'] or '—'} → {sn['updated'] or '—'})"
            if so["text"] != sn["text"]:
                what += "\n    " + "\n    ".join(short_diff(so["text"], sn["text"]))
            report.append(what)
    return report


def main():
    old = json.load(open(STATE, encoding="utf-8")) if os.path.exists(STATE) else {}
    new, errors = snapshot()
    report = compare(old, new)
    for line in report:
        print(line)
    for key, err in errors.items():
        print(f"UNREACHABLE {key}: {err}")
    if not report and not errors:
        print(f"No change in {len(new)} sources.")
    if "--update" in sys.argv:
        merged = dict(old)
        merged.update(new)  # a source that could not be fetched keeps its last known state
        os.makedirs(os.path.dirname(STATE), exist_ok=True)
        with open(STATE, "w", encoding="utf-8") as f:
            json.dump(merged, f, ensure_ascii=False, indent=1, sort_keys=True)
            f.write("\n")
    sys.exit(3 if report else 2 if errors else 0)


if __name__ == "__main__":
    main()
