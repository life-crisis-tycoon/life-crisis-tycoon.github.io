#!/bin/bash
# Publishes chosen preview commits to the live game WITHOUT copying the whole preview file.
# Several sessions work in game_preview.js at the same time; copying it to game.js ships everyone's unapproved work.
# This replays only the game_preview.js changes of the commits you name onto game.js (3-way, in order).
# Usage: tools/publish.sh <commit> [<commit> ...]      e.g. tools/publish.sh 7eb5988 895de2f
# Find your own commits: git log --grep="<your Claude-Session id>" --format='%h %s'
set -e
cd "$(dirname "$0")/.."
[ $# -gt 0 ] || { echo "usage: tools/publish.sh <commit>..."; exit 1; }
for c in "$@"; do
  git show "$c" -- game_preview.js | sed 's#a/game_preview.js#a/game.js#; s#b/game_preview.js#b/game.js#' > "/tmp/publish_$c.patch"
  if [ ! -s "/tmp/publish_$c.patch" ]; then echo "$c: no game_preview.js change, skipped"; continue; fi
  git apply --3way --recount "/tmp/publish_$c.patch" && echo "$c: applied"
done
cp game.js /tmp/publish_check.mjs && node --check /tmp/publish_check.mjs && echo "game.js syntax OK"
echo "Now look at the result (git diff --cached game.js), test it, then commit with a 'Live:' message listing the commits."
