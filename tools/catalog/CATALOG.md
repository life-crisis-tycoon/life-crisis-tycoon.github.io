# Catalogue of spare 3D pieces (not used in a room yet)

Pieces the user supplied (Tripo) that are kept for later. Each has a thumbnail (`.png`, three views) next to it.
To use one: add it to a `packmulti` spec (tools/gltfx), with `rot` so its front faces +Z, then place it with `kitRoom`.

| File | What | Size (model units, w × h × d) | Front | Notes |
|---|---|---|---|---|
| `pouf_capitonne_rond_rose.glb` | Large round tufted ottoman, coral pink | 1.0 × 0.53 × 1.0 | round (any) | Came with the Social Club / Wedding set (2026-11-19). Good for a lounge, nap room or social room centrepiece; real size ~0.9 m wide, 0.45 m high. |
| `tapis_rouge_rate_bloc.glb` | Meant to be the wedding rug, but Tripo made a 50 cm thick red block | 0.53 × 0.56 × 1.0 | — | Not usable as a rug; the wedding bureau rug is built in code. Could become a low red bench / chest if squashed. |

Room kits already in the game (for reuse of single pieces): `models/props/*_kit.js` — career, pharmacy, therapy, glowup, cafe, nap, training, social, wedding. Piece names and sizes are in the `*_DIMS` constants in game.js.
