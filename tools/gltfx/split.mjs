// split one-mesh "kit" into clusters of touching parts; write a GLB with one node per cluster (origin = bottom centre)
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
const [, , input, output, EPS = '0.006'] = process.argv; const eps = +EPS;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS); const doc = await io.read(input); const root = doc.getRoot();
const prim = root.listMeshes()[0].listPrimitives()[0]; const P = prim.getAttribute('POSITION'), I = prim.getIndices().getArray(), nv = P.getCount();
const key = new Map(), rep = new Int32Array(nv), a = [];
for (let i = 0; i < nv; i++) { P.getElement(i, a); const k = a.map((v) => Math.round(v * 2000)).join(','); if (!key.has(k)) key.set(k, i); rep[i] = key.get(k); }
const par = new Int32Array(nv).map((_, i) => i); const f = (x) => { while (par[x] !== x) x = par[x] = par[par[x]]; return x; };
for (let t = 0; t < I.length; t += 3) { const r0 = f(rep[I[t]]); for (const j of [1, 2]) { const r = f(rep[I[t + j]]); if (r !== r0) par[r] = r0; } }
const comps = new Map();
for (let t = 0; t < I.length; t += 3) { const r = f(rep[I[t]]); if (!comps.has(r)) comps.set(r, { tris: [], mn: [9, 9, 9], mx: [-9, -9, -9] }); const c = comps.get(r); c.tris.push(t); for (const j of [0, 1, 2]) { P.getElement(I[t + j], a); for (const k of [0, 1, 2]) { c.mn[k] = Math.min(c.mn[k], a[k]); c.mx[k] = Math.max(c.mx[k], a[k]); } } }
let C = [...comps.values()];
const ov = (p, q) => [0, 1, 2].every((k) => p.mn[k] - eps <= q.mx[k] && q.mn[k] - eps <= p.mx[k]);
let changed = true; while (changed) { changed = false; for (let i = 0; i < C.length; i++) for (let j = i + 1; j < C.length; j++) if (ov(C[i], C[j])) { const p = C[i], q = C.splice(j, 1)[0]; p.tris.push(...q.tris); for (const k of [0, 1, 2]) { p.mn[k] = Math.min(p.mn[k], q.mn[k]); p.mx[k] = Math.max(p.mx[k], q.mx[k]); } changed = true; j--; } }
C.sort((p, q) => q.tris.length - p.tris.length);
const attrs = prim.listSemantics(); const mat = prim.getMaterial(); const scene = root.listScenes()[0]; for (const n of scene.listChildren()) scene.removeChild(n);
const buf = root.listBuffers()[0]; const info = [];
C.forEach((c, ci) => { const map = new Map(), idx = []; for (const t of c.tris) for (let j = 0; j < 3; j++) { const v = I[t + j]; if (!map.has(v)) map.set(v, map.size); idx.push(map.get(v)); }
  const cx = (c.mn[0] + c.mx[0]) / 2, cz = (c.mn[2] + c.mx[2]) / 2, by = c.mn[1]; const np = doc.createPrimitive().setMaterial(mat).setIndices(doc.createAccessor().setType('SCALAR').setArray(new Uint32Array(idx)).setBuffer(buf));
  for (const s of attrs) { const src = prim.getAttribute(s), el = src.getElementSize(), arr = new Float32Array(map.size * el), e = []; for (const [v, n] of map) { src.getElement(v, e); if (s === 'POSITION') { e[0] -= cx; e[1] -= by; e[2] -= cz; } for (let k = 0; k < el; k++) arr[n * el + k] = e[k]; } np.setAttribute(s, doc.createAccessor().setType(src.getType()).setArray(arr).setBuffer(buf)); }
  const nm = 'p' + ci; scene.addChild(doc.createNode(nm).setMesh(doc.createMesh(nm).addPrimitive(np)).setTranslation([cx, by, cz]));
  info.push([nm, c.tris.length, ...[0,1,2].map(k => (c.mx[k] - c.mn[k]).toFixed(3)), cx.toFixed(2), by.toFixed(2), cz.toFixed(2)].join(' ')); });
for (const m of root.listMeshes()) if (!m.listParents().some((p) => p.propertyType === 'Node')) m.dispose();
await io.write(output, doc); console.log(C.length, 'clusters  [name tris sx sy sz cx by cz]'); console.log(info.join('\n'));
