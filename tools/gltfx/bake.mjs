// bake a yaw (degrees, three.js sense) into each named piece of split.glb and re-centre it (bottom centre); args: in out '{"p0":deg,...}'
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [, , input, output, J] = process.argv; const ROT = JSON.parse(J);
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); const d = await io.read(input);
for (const n of d.getRoot().listNodes()) { const r = ROT[n.getName()]; const me = n.getMesh(); if (!me || r == null) continue; const t = r * Math.PI / 180, c = Math.cos(t), s = Math.sin(t);
  for (const p of me.listPrimitives()) { const a = []; let x0 = 9, x1 = -9, z0 = 9, z1 = -9;
    for (const sem of ['POSITION', 'NORMAL']) { const A = p.getAttribute(sem); if (!A) continue; for (let i = 0; i < A.getCount(); i++) { A.getElement(i, a); const X = a[0] * c + a[2] * s, Z = -a[0] * s + a[2] * c; a[0] = X; a[2] = Z; A.setElement(i, a); if (sem === 'POSITION') { x0 = Math.min(x0, X); x1 = Math.max(x1, X); z0 = Math.min(z0, Z); z1 = Math.max(z1, Z); } } }
    const A = p.getAttribute('POSITION'), cx = (x0 + x1) / 2, cz = (z0 + z1) / 2; for (let i = 0; i < A.getCount(); i++) { A.getElement(i, a); a[0] -= cx; a[2] -= cz; A.setElement(i, a); } } }
await io.write(output, d);
