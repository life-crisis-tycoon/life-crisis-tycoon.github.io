// per piece: yaw that makes its footprint axis-aligned (min XZ box area), and the aligned size
import { NodeIO } from '@gltf-transform/core';
const d = await new NodeIO().read(process.argv[2]);
for (const n of d.getRoot().listNodes()) { const me = n.getMesh(); if (!me) continue; const P = me.listPrimitives()[0].getAttribute('POSITION'); const a = [], pts = [];
  let my = -9, ny = 9; for (let i = 0; i < P.getCount(); i++) { P.getElement(i, a); pts.push([a[0], a[2], a[1]]); my = Math.max(my, a[1]); ny = Math.min(ny, a[1]); }
  // footprint from the lower 60% (legs, base) so leaning tops / plants don't skew it
  const low = pts.filter((p) => p[2] < ny + (my - ny) * 0.6);
  let best = null; for (let deg = 0; deg < 90; deg += 0.5) { const t = deg * Math.PI / 180, c = Math.cos(t), s = Math.sin(t); let x0 = 9, x1 = -9, z0 = 9, z1 = -9;
    for (const [x, z] of low) { const X = x * c - z * s, Z = x * s + z * c; x0 = Math.min(x0, X); x1 = Math.max(x1, X); z0 = Math.min(z0, Z); z1 = Math.max(z1, Z); }
    const ar = (x1 - x0) * (z1 - z0); if (!best || ar < best.ar) best = { deg, ar, w: x1 - x0, d: z1 - z0 }; }
  console.log(n.getName(), 'rot', best.deg, 'w', best.w.toFixed(3), 'd', best.d.toFixed(3), 'h', (my - ny).toFixed(3)); }
