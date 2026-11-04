#!/usr/bin/env bash
# What the website publishes, and proof that nothing else is served.
#
# The site publishes ONLY the files in tools/publish-list.txt — the app itself. The notes
# (CLAUDE.md, AUTOMATION.md, docs/), the tools and the state files stay off it.
#
#   bash tools/check-published.sh build [DIR]   copy the listed files into DIR (default _site) and
#                                               check them: exactly the list, identical to the repo,
#                                               and no e-mail address or private link in any of them.
#                                               The Pages workflow and tools/check.mjs run this.
#   bash tools/check-published.sh live [URL]    ask the real website for every file in the repo: the
#                                               listed ones must be served and identical to this copy
#                                               (run `git pull` first), everything else must be 404.
#   bash tools/check-published.sh private       ask raw.githubusercontent.com and github.com for the
#                                               repo: everything must be 404. Passes once it is private.
#
# Exit status 0 means passed. It never prints an address or a link it finds — only the file, the
# line and the kind. Standard tools only (bash, git, curl, grep, cmp), so it runs on a Mac as well.
set -u
export LC_ALL=C

ROOT=$(cd "$(dirname "$0")/.." && pwd)
LIST="$ROOT/tools/publish-list.txt"
SITE="https://kadzidrogalinasdraven.github.io/study-planner"
REPO="kadzidrogalinasdraven/study-planner"
EMAIL_RE='[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}'   # the same pattern as tools/check.mjs
LINK_RE='claude\.ai/(chat|project|share)/|docs\.google\.com/[a-z]+/d/|drive\.google\.com/(file/d|drive/folders|open\?id=)|chat\.whatsapp\.com/'

listed() { grep -vE '^[[:space:]]*(#|$)' "$LIST" | sed 's/[[:space:]]*$//'; }
tracked() { git -C "$ROOT" -c core.quotepath=off ls-files; }
is_listed() { listed | grep -qxF -- "$1"; }
urlencode() {   # percent-encode a path, byte by byte; "/" stays
  local s="$1" out="" c i
  for ((i = 0; i < ${#s}; i++)); do
    c=${s:i:1}
    case "$c" in [A-Za-z0-9._~/-]) out+="$c" ;; *) out+=$(printf '%%%02X' "'$c") ;; esac
  done
  printf '%s' "$out"
}
status() { curl -s -o "$2" -w '%{http_code}' --max-time 60 "$1" 2>/dev/null || true; }

build() {
  local dir="${1:-_site}" bad=0 n=0 f extra hits
  case "$dir" in /*) ;; *) dir="$ROOT/$dir" ;; esac
  if [ -e "$dir" ]; then
    if [ "$dir" = "$ROOT/_site" ]; then rm -rf "$dir"
    elif [ -n "$(ls -A "$dir" 2>/dev/null)" ]; then echo "Refusing to build into $dir: it is not empty."; return 2; fi
  fi
  mkdir -p "$dir"
  echo "Publishing, from tools/publish-list.txt:"
  while IFS= read -r f; do
    n=$((n + 1))
    if ! git -C "$ROOT" ls-files --error-unmatch -- "$f" >/dev/null 2>&1; then
      echo "  NOT IN THE REPO   $f"; bad=1; continue
    fi
    mkdir -p "$dir/$(dirname "$f")" && cp "$ROOT/$f" "$dir/$f"
    printf '  %10s bytes   %s\n' "$(wc -c < "$ROOT/$f" | tr -d ' ')" "$f"
  done < <(listed)
  extra=$(cd "$dir" && find . -type f | sed 's|^\./||' | sort | comm -23 - <(listed | sort))
  [ -n "$extra" ] && { echo "$extra" | sed 's/^/  NOT ON THE LIST   /'; bad=1; }
  while IFS= read -r f; do
    [ -f "$dir/$f" ] && ! cmp -s "$ROOT/$f" "$dir/$f" && { echo "  DIFFERS FROM THE REPO   $f"; bad=1; }
  done < <(listed)
  hits=$( (cd "$dir" && grep -rnoE "$EMAIL_RE" . | cut -d: -f1,2 | sed 's|^\./||; s|$|   e-mail address|'
           cd "$dir" && grep -rnoE "$LINK_RE" . | cut -d: -f1,2 | sed 's|^\./||; s|$|   private link|') 2>/dev/null)
  [ -n "$hits" ] && { echo "$hits" | sed 's/^/  /'; bad=1; }
  if [ "$bad" = 0 ]; then
    echo "BUILD CHECK PASSED: $n files, exactly the publish list, identical to the repo, no e-mail address or private link."
  else
    echo "BUILD CHECK FAILED — nothing may be published until the lines above are fixed."
  fi
  return "$bad"
}

live() {
  local base="${1:-$SITE}" tmp body f want code note bad=0 ok=0 hidden=0 stamp
  base=${base%/}; tmp=$(mktemp -d); body="$tmp/body"; stamp=$(date +%s)
  echo "Asking $base for every file in the repo (want = what it should answer):"
  printf '  %-5s %-4s %s\n' want got path
  { echo "/"; tracked; tracked | grep '\.md$' | sed 's/\.md$/.html/'; } | while IFS= read -r f; do
    if [ "$f" = "/" ]; then want=200; src="$ROOT/index.html"; url="$base/?check=$stamp"
    elif is_listed "$f"; then want=200; src="$ROOT/$f"; url="$base/$(urlencode "$f")?check=$stamp"
    else want=404; src=""; url="$base/$(urlencode "$f")?check=$stamp"; fi
    code=$(status "$url" "$body")
    note=""
    if [ "$want" = 200 ]; then
      if [ "$code" != 200 ]; then note="NOT SERVED"
      elif ! cmp -s "$body" "$src"; then note="DIFFERS from this copy (git pull, or wait a minute for the deploy)"
      else note="served, identical"; fi
    else
      [ "$code" = 404 ] && note="not served" || note="SERVED — must not be"
    fi
    printf '  %-5s %-4s %s   %s\n' "$want" "$code" "$f" "$note"
  done | tee "$tmp/report"
  bad=$(grep -cE 'NOT SERVED|DIFFERS|must not be' "$tmp/report")
  ok=$(grep -c 'served, identical' "$tmp/report"); hidden=$(grep -c ' not served$' "$tmp/report")
  rm -rf "$tmp"
  if [ "$bad" = 0 ]; then
    echo "LIVE CHECK PASSED: the app ($ok addresses) is served and identical; $hidden other paths are not served."
  else
    echo "LIVE CHECK FAILED: $bad path(s) wrong. Right after a change, GitHub's cache can lag ~10 minutes — run it again."
  fi
  [ "$bad" = 0 ]
}

private() {
  local tmp f code bad=0 n=0
  tmp=$(mktemp -d)
  echo "Asking GitHub for the repo itself, as a stranger would (want 404 everywhere):"
  code=$(status "https://github.com/$REPO" "$tmp/b"); n=$((n + 1))
  [ "$code" = 404 ] || { echo "  $code  github.com/$REPO   VISIBLE"; bad=$((bad + 1)); }
  while IFS= read -r f; do
    n=$((n + 1))
    code=$(status "https://raw.githubusercontent.com/$REPO/main/$(urlencode "$f")" "$tmp/b")
    [ "$code" = 404 ] || { echo "  $code  raw: $f   VISIBLE"; bad=$((bad + 1)); }
  done < <(tracked)
  rm -rf "$tmp"
  if [ "$bad" = 0 ]; then echo "PRIVATE CHECK PASSED: all $n addresses answer 404."
  else echo "PRIVATE CHECK FAILED: $bad of $n addresses are still public (expected until the repo is private)."; fi
  [ "$bad" = 0 ]
}

case "${1:-}" in
  build) build "${2:-_site}" ;;
  live) live "${2:-$SITE}" ;;
  private) private ;;
  *) sed -n '2,20p' "$0"; exit 2 ;;
esac
