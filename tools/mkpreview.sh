#!/bin/bash
# Builds preview.html (hidden test page, not linked from the game) from index.html.
# It runs game_preview.js, never writes to the phone's real storage, no cloud sync, no service worker.
# Usage: tools/mkpreview.sh            -> copies game.js to game_preview.js (same as live)
#        tools/mkpreview.sh keep       -> keeps the current game_preview.js (new rooms under test)
cd "$(dirname "$0")/.."
[ "$1" = keep ] && [ -f game_preview.js ] || cp game.js game_preview.js
python3 - <<'PY'
import re
h=open('index.html').read()
h=h.replace('<script type="module" src="./account.js"></script>','')
h=h.replace('src="./game.js"','src="./game_preview.js"')
h=re.sub(r"<script>if \('serviceWorker'.*?</script>","",h,flags=re.S)
h=h.replace('<head>','<head>'+open('tools/preview/shim.html').read(),1)
h=h.replace('<title>','<meta name="robots" content="noindex"><title>',1)
h=h.replace('</body>',open('tools/preview/panel.html').read()+'</body>',1)
open('preview.html','w').write(h)
PY
echo "preview.html built"
