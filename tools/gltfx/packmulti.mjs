// many single-object GLBs -> one kit GLB with named pieces (k_*), each turned (deg, three.js yaw) and set on its bottom centre
import { NodeIO, Document } from '@gltf-transform/core'; import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { mergeDocuments, unpartition, prune, dedup, meshopt, flatten } from '@gltf-transform/functions'; import { MeshoptEncoder } from 'meshoptimizer'; import sharp from 'sharp'; import fs from 'fs';
const [, , output, specJ] = process.argv; const SPEC = JSON.parse(fs.readFileSync(specJ, 'utf8'));
await MeshoptEncoder.ready; const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const out = new Document(); const dims = {};
for (const s of SPEC) { const d = await io.read(s.f); await d.transform(flatten());
  const t = (s.rot || 0) * Math.PI / 180, c = Math.cos(t), sn = Math.sin(t); let mn = [9, 9, 9], mx = [-9, -9, -9]; const a = [];
  for (const me of d.getRoot().listMeshes()) for (const p of me.listPrimitives()) for (const sem of ['POSITION', 'NORMAL']) { const A = p.getAttribute(sem); if (!A) continue;
    for (let i = 0; i < A.getCount(); i++) { A.getElement(i, a); const X = a[0] * c + a[2] * sn, Z = -a[0] * sn + a[2] * c; a[0] = X; a[2] = Z; A.setElement(i, a); if (sem === 'POSITION') for (let k = 0; k < 3; k++) { mn[k] = Math.min(mn[k], a[k]); mx[k] = Math.max(mx[k], a[k]); } } }
  for (const me of d.getRoot().listMeshes()) for (const p of me.listPrimitives()) { const A = p.getAttribute('POSITION'); for (let i = 0; i < A.getCount(); i++) { A.getElement(i, a); a[0] -= (mn[0] + mx[0]) / 2; a[1] -= mn[1]; a[2] -= (mn[2] + mx[2]) / 2; A.setElement(i, a); } }
  dims[s.name] = [mx[0] - mn[0], mx[1] - mn[1], mx[2] - mn[2]].map((v) => +v.toFixed(4));
  for (const m of d.getRoot().listMaterials()) { m.setMetallicRoughnessTexture(null); m.setNormalTexture(null); m.setOcclusionTexture(null); m.setMetallicFactor(0); m.setRoughnessFactor(0.85); }
  await d.transform(prune());
  for (const tx of d.getRoot().listTextures()) { const o = await sharp(Buffer.from(tx.getImage())).resize(s.tex || 1024, s.tex || 1024, { kernel: 'lanczos3' }).sharpen({ sigma: 0.6, m1: 0.3, m2: 1.0 }).webp({ quality: 88 }).toBuffer(); tx.setImage(new Uint8Array(o)).setMimeType('image/webp'); }
  const sc = d.getRoot().listScenes()[0]; const g = d.createNode(s.name); for (const n of sc.listChildren()) { sc.removeChild(n); g.addChild(n); } sc.addChild(g);
  mergeDocuments(out, d); }
const scenes = out.getRoot().listScenes(), main = scenes[0]; for (const sc of scenes.slice(1)) { for (const n of sc.listChildren()) { sc.removeChild(n); main.addChild(n); } sc.dispose(); }
out.getRoot().setDefaultScene(main); out.createExtension(EXTTextureWebP).setRequired(true);
await out.transform(unpartition(), prune(), dedup(), meshopt({ encoder: MeshoptEncoder, level: 'medium' })); await io.write(output, out);
console.log((fs.statSync(output).size / 1024).toFixed(0), 'KB'); console.log(JSON.stringify(dims));
