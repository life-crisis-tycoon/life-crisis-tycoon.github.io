// split kit -> named pieces (origin bottom centre), one shared webp texture, meshopt; node names k_*
import { NodeIO } from '@gltf-transform/core'; import { ALL_EXTENSIONS, EXTTextureWebP } from '@gltf-transform/extensions';
import { prune, dedup, meshopt } from '@gltf-transform/functions'; import { MeshoptEncoder } from 'meshoptimizer'; import sharp from 'sharp'; import fs from 'fs';
const [, , input, output, mapJson, TEX = '2048'] = process.argv; const MAP = JSON.parse(mapJson); // {"p0":"k_bookcase", "p6+p14":"k_ochair", ...}
await MeshoptEncoder.ready; const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder });
const doc = await io.read(input), root = doc.getRoot(), scene = root.listScenes()[0]; const byName = Object.fromEntries(root.listNodes().map((n) => [n.getName(), n]));
for (const m of root.listMaterials()) { m.setMetallicRoughnessTexture(null); m.setNormalTexture(null); m.setOcclusionTexture(null); m.setMetallicFactor(0); m.setRoughnessFactor(0.85); }
const keep = new Set();
for (const [k, nm] of Object.entries(MAP)) { const parts = k.split('+').map((p) => byName[p]); const base = parts[0].getTranslation();
  if (parts.length === 1) { parts[0].setName(nm).setTranslation([0, 0, 0]); keep.add(parts[0]); continue; }
  const g = doc.createNode(nm); scene.addChild(g); keep.add(g);
  for (const p of parts) { const t = p.getTranslation(); scene.removeChild(p); p.setTranslation([t[0] - base[0], t[1] - base[1], t[2] - base[2]]); g.addChild(p); } }
for (const n of scene.listChildren()) if (!keep.has(n)) { scene.removeChild(n); n.dispose(); }
for (const t of root.listTextures()) { const out = await sharp(Buffer.from(t.getImage())).resize(+TEX, +TEX, { kernel: 'lanczos3' }).sharpen({ sigma: 0.6, m1: 0.3, m2: 1.0 }).webp({ quality: 90 }).toBuffer(); t.setImage(new Uint8Array(out)).setMimeType('image/webp'); }
doc.createExtension(EXTTextureWebP).setRequired(true);
await doc.transform(prune(), dedup(), meshopt({ encoder: MeshoptEncoder, level: 'medium' })); await io.write(output, doc);
console.log(scene.listChildren().map((n) => n.getName()).join(' '), (fs.statSync(output).size / 1024).toFixed(0), 'KB');
