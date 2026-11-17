import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
const P = new URLSearchParams(location.search);
const W = 900, H = 330, city = P.get('city') || 'London', mgr = P.get('mgr') || 'mgr_f';
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true, alpha: true });
renderer.setSize(W, H); renderer.setPixelRatio(1); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0; renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const SKY = { London: ['#CFE3F2', '#F4EEE4'], Lagos: ['#9ED8F2', '#FCEBC8'], Mumbai: ['#A9DCF2', '#FDE5C4'], Seoul: ['#BFD8F4', '#F7E8F0'], 'São Paulo': ['#A7D7F0', '#F6ECD9'], Cairo: ['#9FD3EE', '#FBE3B8'], 'Mexico City': ['#B5D8F2', '#F6E2EE'], 'New York': ['#BBD6EE', '#F2EDE6'] }[city] || ['#BFE0F2', '#F4EEE4'];
scene.background = new THREE.CanvasTexture((() => { const c = document.createElement('canvas'); c.width = 4; c.height = 256; const g = c.getContext('2d'); const gr = g.createLinearGradient(0, 0, 0, 256); gr.addColorStop(0, SKY[0]); gr.addColorStop(1, SKY[1]); g.fillStyle = gr; g.fillRect(0, 0, 4, 256); return c; })());
scene.background.colorSpace = THREE.SRGBColorSpace;
const pm = new THREE.PMREMGenerator(renderer); scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.4;
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.75, metalness: o.m ?? 0, emissive: o.e ?? '#000', emissiveIntensity: o.ei ?? 1, transparent: o.op != null, opacity: o.op ?? 1 });
let G = null;
const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (G || scene).add(m); return m; };
function box(w, h, d, c, x, y, z, r = 0.04) { return add(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), M(c), x, y + h / 2, z); }
function cylA(rt, rb, h, c, x, y, z, seg = 16) { return add(new THREE.CylinderGeometry(rt, rb, h, seg), M(c), x, y + h / 2, z); }
function cone(r, h, c, x, y, z, seg = 4) { const k = add(new THREE.ConeGeometry(r, h, seg), M(c), x, y + h / 2, z); if (seg === 4) k.rotation.y = Math.PI / 4; return k; }
function sphA(r, c, x, y, z) { return add(new THREE.SphereGeometry(r, 18, 12), M(c, { r: 0.4 }), x, y, z); }
function hero(n, x, z) {
  const g = new THREE.Group(); G = g; const y = 0;
  const palm = (px, pz, h = 0.9) => { cylA(0.04, 0.06, h, '#A0794E', px, y, pz, 8); for (let k = 0; k < 6; k++) { const l = add(new THREE.SphereGeometry(0.2, 10, 8), M(k % 2 ? '#5DAE5E' : '#7ACB4E'), px + Math.cos(k) * 0.18, y + h + 0.02, pz + Math.sin(k) * 0.18); l.scale.set(1.4, 0.35, 0.6); l.rotation.y = -k; } };
  const tower = (px, pz, w, h, c, top = '#E8EEF4') => { box(w, h, w, c, px, y, pz, 0.05); box(w * 0.7, 0.12, w * 0.7, top, px, y + h, pz, 0.03); };
  switch (n) {
    case 'London': box(0.42, 1.9, 0.42, '#D9C28F', 0, y, 0, 0.04); box(0.5, 0.42, 0.5, '#CBB27A', 0, y + 1.9, 0, 0.04);
      for (const [dx, dz] of [[0, 0.26], [0.26, 0]]) { const d = add(new THREE.CylinderGeometry(0.14, 0.14, 0.03, 20), M('#FFFFFF'), dx, y + 2.1, dz); d.rotation.x = dz ? Math.PI / 2 : 0; d.rotation.z = dx ? Math.PI / 2 : 0; }
      cone(0.3, 0.75, '#5E6F64', 0, y + 2.32, 0, 4); cylA(0.02, 0.02, 0.25, '#C9A54A', 0, y + 3.05, 0, 6);
      box(0.95, 0.52, 0.38, '#E2453A', 0.85, y + 0.08, 0.5, 0.08); box(0.97, 0.12, 0.4, '#3A3F47', 0.85, y + 0.3, 0.5, 0.02); box(0.97, 0.12, 0.4, '#3A3F47', 0.85, y + 0.5, 0.5, 0.02);
      for (const wx of [0.55, 1.15]) for (const wz of [0.32, 0.68]) { const wh = add(new THREE.CylinderGeometry(0.09, 0.09, 0.06, 12), M('#26272B'), wx, y + 0.09, wz); wh.rotation.x = Math.PI / 2; }
      { const e = add(new THREE.TorusGeometry(0.8, 0.05, 8, 40), M('#F4F4F2'), -1.0, y + 1.0, -0.4); for (let k = 0; k < 8; k++) { const sp = box(0.025, 0.8, 0.025, '#F4F4F2', -1.0, y + 1.0, -0.4); sp.position.y = y + 1.0; sp.rotation.z = k * Math.PI / 8; } cylA(0.04, 0.06, 1.0, '#D8DCE2', -1.0, y, -0.4, 6); } break;
    case 'Lagos': tower(-0.4, 0, 0.42, 1.7, '#5E7FA8'); tower(0.15, -0.2, 0.4, 2.2, '#7F9CC0'); tower(0.6, 0.15, 0.38, 1.3, '#A9C0DD');
      box(0.85, 0.48, 0.42, '#F7C531', 0.5, y, 0.75, 0.1); box(0.87, 0.06, 0.44, '#26272B', 0.5, y + 0.18, 0.75, 0.01); box(0.87, 0.06, 0.44, '#26272B', 0.5, y + 0.34, 0.75, 0.01); palm(-0.9, 0.5); palm(-0.6, 0.85, 0.75); break;
    case 'Mumbai': box(1.5, 0.95, 0.5, '#E8C48A', 0, y, 0, 0.05); box(0.5, 0.65, 0.52, '#3B6F8C', 0, y, 0, 0.1);
      for (const dx of [-0.6, 0.6]) { cylA(0.14, 0.14, 0.35, '#E8C48A', dx, y + 0.95, 0, 12); sphA(0.15, '#E3B87A', dx, y + 1.32, 0); } sphA(0.32, '#EDCB92', 0, y + 1.05, 0); cone(0.05, 0.25, '#C9A54A', 0, y + 1.35, 0, 8);
      palm(0.95, 0.5); palm(-1.0, 0.45, 0.8); break;
    case 'Seoul': { const hill = add(new THREE.ConeGeometry(1.0, 0.8, 16), M('#7DB862'), 0, y + 0.4, 0); }
      cylA(0.05, 0.1, 1.6, '#F4F4F2', 0, y + 0.7, 0, 10); cylA(0.2, 0.2, 0.2, '#F4F4F2', 0, y + 1.75, 0, 16); cylA(0.02, 0.03, 0.6, '#E2453A', 0, y + 1.95, 0, 6);
      box(0.8, 0.3, 0.4, '#B9A68A', 0.9, y, 0.6, 0.03); box(0.6, 0.25, 0.3, '#C9483E', 0.9, y + 0.3, 0.6, 0.02); { const r = add(new THREE.ConeGeometry(0.62, 0.28, 4), M('#4A4F57'), 0.9, y + 0.68, 0.6); r.rotation.y = Math.PI / 4; r.scale.z = 0.6; }
      for (const [px, pz] of [[-0.8, 0.6], [-1.0, 0.1]]) { cylA(0.04, 0.05, 0.4, '#6B4E3A', px, y, pz, 8); sphA(0.28, '#F6B8CC', px, y + 0.55, pz); } break;
    case 'São Paulo': for (const dx of [-0.75, 0.75]) box(0.12, 1.0, 0.16, '#D93A3F', dx, y, 0, 0.02); box(1.62, 0.1, 0.18, '#D93A3F', 0, y + 1.0, 0, 0.02); box(1.4, 0.38, 0.62, '#3B4452', 0, y + 0.6, 0, 0.03);
      tower(-0.3, -0.75, 0.38, 1.6, '#E3DDD2'); tower(0.25, -0.85, 0.36, 2.0, '#8FA3B3'); tower(0.75, -0.6, 0.34, 1.3, '#E9B6C0');
      for (const [px, pz, c] of [[-1.05, 0.5, '#F7C928'], [1.05, 0.55, '#B97BE0']]) { cylA(0.04, 0.05, 0.4, '#7A563A', px, y, pz, 8); sphA(0.3, c, px, y + 0.58, pz); } break;
    case 'Cairo': cone(0.75, 1.0, '#E2C07A', -0.2, y, -0.1); cone(0.55, 0.75, '#D8B46C', 0.75, y, 0.25); cone(0.38, 0.5, '#E2C07A', -0.95, y, 0.45); box(0.5, 0.22, 0.2, '#D8B46C', 0.35, y, 0.85, 0.05); box(0.14, 0.18, 0.16, '#D8B46C', 0.12, y + 0.18, 0.85, 0.04); palm(1.15, -0.4, 0.8); palm(-1.2, -0.4, 0.75); break;
    case 'Mexico City': box(0.62, 0.3, 0.62, '#E3DDD2', 0, y, 0, 0.04); cylA(0.1, 0.12, 1.9, '#F2EDE4', 0, y + 0.3, 0, 12); sphA(0.13, '#E3B341', 0, y + 2.3, 0);
      for (const sx of [-1, 1]) { const w = box(0.28, 0.1, 0.03, '#E3B341', sx * 0.15, y + 2.32, 0, 0.01); w.rotation.z = sx * 0.4; }
      for (let i = 0; i < 4; i++) box(0.95 - i * 0.2, 0.15, 0.95 - i * 0.2, i % 2 ? '#C9A46A' : '#D8B87A', 0.95, y + i * 0.15, 0.55, 0.02);
      for (const [px, pz] of [[-0.85, 0.5], [-0.9, -0.2]]) { cylA(0.04, 0.05, 0.4, '#6B4E3A', px, y, pz, 8); sphA(0.28, '#9B7FD6', px, y + 0.55, pz); } break;
    case 'New York': tower(-0.2, -0.3, 0.4, 2.4, '#9FB3C8'); cone(0.08, 0.5, '#C9D6E3', -0.2, y + 2.5, -0.3, 8); tower(0.3, -0.4, 0.36, 1.7, '#C2D0DE'); tower(-0.7, -0.2, 0.34, 1.3, '#B9A68A');
      box(0.36, 0.42, 0.36, '#B9A68A', 0.8, y, 0.45, 0.04); cylA(0.09, 0.12, 0.65, '#6FB59B', 0.8, y + 0.42, 0.45, 10); sphA(0.1, '#6FB59B', 0.8, y + 1.15, 0.45); cylA(0.025, 0.025, 0.3, '#6FB59B', 0.92, y + 1.1, 0.45, 6); sphA(0.06, '#F2C14E', 0.92, y + 1.42, 0.45);
      box(0.7, 0.32, 0.34, '#F7C531', -0.4, y, 0.7, 0.1); break;
  }
  G = null; return g;
}

// ground: a strip of grass and a sidewalk, a few trees, the city's landmark behind, the manager in front
add(new THREE.BoxGeometry(60, 0.2, 30), M('#A6D06A'), 0, -0.1, -6).castShadow = false;
add(new THREE.BoxGeometry(60, 0.22, 2.2), M('#E6DCCB'), 0, -0.09, 2.6).castShadow = false;
const lm = hero(city, 0, 0); lm.position.set(5.6, 0, -5); lm.scale.setScalar(2.6); lm.rotation.y = -0.4; scene.add(lm);
for (const [x, z, s] of [[-7.5, -3, 1.2], [9.5, -1.0, 1.1], [-4.6, -6.5, 1.0], [8.2, -7, 1.3], [-9.5, 0.5, 1.0], [0.5, -9, 1.1]]) { G = null;
  add(new THREE.CylinderGeometry(0.12, 0.16, 1.2 * s, 8), M('#8B6A45'), x, 0.6 * s, z);
  for (const [dx, dy, r] of [[0, 1.6, 0.8], [0.45, 1.35, 0.55], [-0.45, 1.4, 0.55]]) add(new THREE.SphereGeometry(r * s, 16, 12), M('#6DB84E'), x + dx * s, dy * s, z); }
const loader = new GLTFLoader(); loader.setMeshoptDecoder(MeshoptDecoder);
const gl = await loader.loadAsync('/life-crisis-tycoon.github.io/models/mgr/' + mgr + '.glb');
const ch = gl.scene; ch.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.frustumCulled = false; } });
const box0 = new THREE.Box3().setFromObject(ch), hgt = box0.getSize(new THREE.Vector3()).y; ch.scale.setScalar(4.6 / hgt);
ch.position.set(0.9, -1.2, 5.2); ch.rotation.y = 0.2; scene.add(ch);
if (gl.animations.length) { const mix = new THREE.AnimationMixer(ch); const clip = gl.animations.find((a) => /cheer/i.test(a.name)) || gl.animations.find((a) => /idle/i.test(a.name)) || gl.animations[0]; mix.clipAction(clip).play(); mix.update(+(P.get('t') || 0.55)); }
window.__clips = gl.animations.map((a) => a.name);
scene.add(new THREE.HemisphereLight('#FFFFFF', '#C7D3BC', 0.8));
const sun = new THREE.DirectionalLight('#FFEFD6', 2.8); sun.position.set(-6, 12, 10); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 10, bottom: -6, near: 1, far: 40 }); sun.shadow.bias = -0.0005; sun.shadow.radius = 3; scene.add(sun);
const cam = new THREE.PerspectiveCamera(28, W / H, 0.5, 200); cam.position.set(0.4, 2.4, 15); cam.lookAt(0.4, 2.6, 0);
renderer.render(scene, cam); window.__ready = true;
