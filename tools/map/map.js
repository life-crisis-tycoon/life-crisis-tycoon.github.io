import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
const P = new URLSearchParams(location.search);
const W = +P.get('w') || 780, H = +P.get('h') || 1000;
const data = await (await fetch('./mapdata.json')).json();
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setSize(W, H); renderer.setPixelRatio(1);
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
renderer.outputColorSpace = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color('#36A6E2');
const pm = new THREE.PMREMGenerator(renderer);
scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture; scene.environmentIntensity = 0.35;
const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.75, metalness: o.m ?? 0, emissive: o.e ?? '#000', emissiveIntensity: o.ei ?? 1, transparent: o.op != null, opacity: o.op ?? 1 });
let G = null;
const add = (geo, mat, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = m.receiveShadow = true; (G || scene).add(m); return m; };
const toXZ = ([x, y]) => [x, -y];

// ocean
const ocean = add(new RoundedBoxGeometry(110, 1.2, 80, 4, 0.5), M('#36A6E2', { r: 0.25 }), 0, -0.6, 0);
ocean.castShadow = false;
add(new RoundedBoxGeometry(111, 0.6, 81, 4, 0.28), M('#E3E6EC'), 0, -1.35, 0);
// little wave marks on the sea
{ let sd = 5; const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const wm = M('#A8E2F7', { r: 0.4 });
  for (let i = 0; i < 140; i++) { const x = -52 + rr() * 104, z = -37 + rr() * 74;
    for (const dx of [-0.32, 0, 0.32]) { const t = add(new THREE.TorusGeometry(0.16, 0.035, 6, 12, Math.PI), wm, x + dx, 0.01, z); t.rotation.x = -Math.PI / 2; t.castShadow = false; } } }

// land
const SIDE = '#D9A962';
const REG = { na: ['#9CCF5C', SIDE], sa: ['#8DC94F', SIDE], eu: ['#A8D468', SIDE], af: ['#EBCB7E', SIDE], asia: ['#A3D163', SIDE], me: ['#EED089', SIDE], oc: ['#E8C477', SIDE] };
const regM = {}; for (const [k, [a, b]] of Object.entries(REG)) regM[k] = [M(a, { r: 0.7 }), M(b, { r: 0.8 })];
const shoreM = M('#8EDCF2', { r: 0.5 });
for (const { r: reg, rings } of data.polys) {
  const sh = new THREE.Shape(rings[0].map(([x, y]) => new THREE.Vector2(x, y)));
  for (const h of rings.slice(1)) sh.holes.push(new THREE.Path(h.map(([x, y]) => new THREE.Vector2(x, y))));
  const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.35, bevelEnabled: true, bevelThickness: 0.12, bevelSize: 0.08, bevelSegments: 3, curveSegments: 4 });
  const m = new THREE.Mesh(geo, regM[reg]); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.castShadow = m.receiveShadow = true; scene.add(m);
  const geo2 = new THREE.ExtrudeGeometry(sh, { depth: 0.02, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.28, bevelSegments: 1, curveSegments: 4 });
  const s2 = new THREE.Mesh(geo2, shoreM); s2.rotation.x = -Math.PI / 2; s2.position.y = 0.0; s2.receiveShadow = true; scene.add(s2);
}
const TOP = 0.02 + 0.35 + 0.12;
// trees and mountains
for (const p of data.decor.trees) {
  const [x, z] = toXZ(p);
  for (let k = 0; k < 4; k++) { const dx = [-0.45, 0, 0.45, 0.2][k], dz = [0, 0.35, 0.05, -0.35][k];
    add(new THREE.CylinderGeometry(0.05, 0.07, 0.26, 8), M('#8B6A45'), x + dx, TOP + 0.13, z + dz);
    if (k === 3) add(new THREE.ConeGeometry(0.24, 0.62, 8), M('#3F8F55'), x + dx, TOP + 0.55, z + dz);
    else { const c = add(new THREE.SphereGeometry(0.27 - k * 0.02, 16, 12), M(k % 2 ? '#7ACB4E' : '#5DAE5E'), x + dx, TOP + 0.42, z + dz); c.scale.y = 0.95; } }
}
for (const p of data.decor.mountains) {
  const [x, z] = toXZ(p);
  add(new THREE.ConeGeometry(0.55, 0.9, 6), M('#C9BBA0', { r: 0.9 }), x, TOP + 0.45, z);
  add(new THREE.ConeGeometry(0.22, 0.36, 6), M('#FFFFFF'), x, TOP + 0.75, z);
}
// clouds
for (const [x, z, s] of [[-6, 2, 1.4], [12, -8, 1.1], [-14, -6, 1.2], [8, 7, 1.5], [20, 3, 1.1], [-30, 12, 1.3], [28, -14, 1.2], [36, 10, 1.4]]) {
  for (const [dx, dy, r] of [[0, 0, 0.6], [0.6, 0.1, 0.45], [-0.6, 0.05, 0.42], [0.2, 0.35, 0.4]]) {
    const c = add(new THREE.SphereGeometry(r * s, 18, 12), M('#FFFFFF', { r: 0.9 }), x + dx * s, 3.2 + dy * s, z);
  }
}
// pins
const status = {};
const GAME = new Set(['London', 'Lagos', 'Mumbai', 'Seoul', 'São Paulo', 'Cairo', 'Mexico City', 'New York']);
const labels = {};
function pin(name, [px, py]) {
  const [x, z] = toXZ(px === undefined ? [0, 0] : [px, py]);
  const st = status[name] || 'locked';
  if (GAME.has(name)) return [x, z];
  if (st === 'current') {
    const ring = add(new THREE.TorusGeometry(0.75, 0.08, 10, 40), M('#7ACB4E', { e: '#7ACB4E', ei: 0.6 }), x, TOP + 0.03, z); ring.rotation.x = Math.PI / 2;
    const disc = add(new THREE.CylinderGeometry(0.7, 0.7, 0.02, 40), M('#BFE8A6', { op: 0.6 }), x, TOP + 0.01, z); disc.castShadow = false;
    add(new THREE.CylinderGeometry(0.07, 0.07, 1.3, 12), M('#0E6E2C'), x, TOP + 0.65, z);
    add(new THREE.SphereGeometry(0.55, 28, 20), M('#16963C', { r: 0.35 }), x, TOP + 1.6, z);
    add(new THREE.SphereGeometry(0.24, 20, 14), M('#FFFFFF', { r: 0.3 }), x, TOP + 1.6, z + 0.4);
    // tiny clock tower
    add(new RoundedBoxGeometry(0.22, 0.9, 0.22, 2, 0.03), M('#D9C28F'), x + 0.75, TOP + 0.45, z + 0.25);
    const roof = add(new THREE.ConeGeometry(0.18, 0.3, 4), M('#6E7F6A'), x + 0.75, TOP + 1.05, z + 0.25); roof.rotation.y = Math.PI / 4;
  } else if (st === 'done') {
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.9, 12), M('#C98A0A'), x, TOP + 0.45, z);
    add(new THREE.SphereGeometry(0.42, 24, 16), M('#FFC21A', { r: 0.3, m: 0.2 }), x, TOP + 1.0, z);
  } else if (st === 'next') {
    add(new THREE.CylinderGeometry(0.06, 0.06, 0.8, 12), M('#B57A1A'), x, TOP + 0.4, z);
    add(new THREE.SphereGeometry(0.4, 24, 16), M('#FFD25E', { r: 0.35 }), x, TOP + 0.9, z);
  } else {
    add(new THREE.SphereGeometry(0.3, 20, 14), M('#E8ECF1', { r: 0.4 }), x, TOP + 0.3, z);
  }
  return [x, z];
}
function box(w, h, d, c, x, y, z, r = 0.04) { return add(new RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2.2, h / 2.2, d / 2.2)), M(c), x, y + h / 2, z); }
function cylA(rt, rb, h, c, x, y, z, seg = 16) { return add(new THREE.CylinderGeometry(rt, rb, h, seg), M(c), x, y + h / 2, z); }
function cone(r, h, c, x, y, z, seg = 4) { const k = add(new THREE.ConeGeometry(r, h, seg), M(c), x, y + h / 2, z); if (seg === 4) k.rotation.y = Math.PI / 4; return k; }
function sphA(r, c, x, y, z) { return add(new THREE.SphereGeometry(r, 18, 12), M(c, { r: 0.4 }), x, y, z); }
function landmark(n, x, z) {
  const y = TOP; x += 0.85; z += 0.4;
  switch (n) {
    case 'Paris': for (const s of [-1, 1]) for (const t of [-1, 1]) { const l = cone(0.08, 1.6, '#8A6F5A', x + s * 0.15, y, z + t * 0.15, 4); }
      cone(0.28, 1.9, '#9C7E66', x, y, z, 4); cylA(0.03, 0.03, 0.4, '#9C7E66', x, y + 1.9, z); break;
    case 'Lisbon': box(0.7, 0.4, 0.32, '#FFC21A', x, y, z, 0.12); box(0.6, 0.12, 0.34, '#FFFFFF', x, y + 0.22, z); break;
    case 'Berlin': for (const s of [-0.3, -0.1, 0.1, 0.3]) box(0.08, 0.6, 0.12, '#E8DCC2', x + s, y, z); box(0.8, 0.14, 0.2, '#D8C8A6', x, y + 0.6, z); break;
    case 'Moscow': cylA(0.18, 0.18, 0.5, '#E86A5A', x, y, z); sphA(0.24, '#3FA8A0', x, y + 0.72, z); cone(0.07, 0.3, '#FFC21A', x, y + 0.9, z, 8);
      cylA(0.1, 0.1, 0.35, '#F2C14E', x + 0.35, y, z); sphA(0.14, '#E86A5A', x + 0.35, y + 0.48, z); break;
    case 'Cairo': cone(0.55, 0.7, '#E2C07A', x, y, z); cone(0.4, 0.5, '#D8B46C', x + 0.65, y, z + 0.25); cone(0.3, 0.38, '#E2C07A', x - 0.5, y, z + 0.35); break;
    case 'Lagos': case 'São Paulo': box(0.22, 1.0, 0.22, '#7F9CC0', x, y, z); box(0.22, 0.7, 0.22, '#A9C0DD', x + 0.28, y, z + 0.1); box(0.22, 1.25, 0.22, '#5E7FA8', x - 0.26, y, z + 0.05); break;
    case 'Nairobi': cylA(0.04, 0.05, 0.5, '#8B6A45', x, y, z); { const c = add(new THREE.CylinderGeometry(0.42, 0.3, 0.14, 16), M('#5DAE5E'), x, y + 0.58, z); } break;
    case 'Cape Town': box(1.1, 0.45, 0.5, '#9E8A6E', x, y, z, 0.12); box(1.0, 0.06, 0.45, '#B8A486', x, y + 0.45, z); break;
    case 'Dubai': cylA(0.16, 0.22, 0.9, '#C9D6E3', x, y, z, 8); cylA(0.1, 0.16, 0.7, '#D8E2EC', x, y + 0.9, z, 8); cylA(0.02, 0.1, 0.8, '#E8EEF4', x, y + 1.6, z, 8); break;
    case 'Mumbai': box(0.8, 0.45, 0.4, '#F2E6CC', x, y, z, 0.05); sphA(0.2, '#FFFFFF', x, y + 0.6, z); cone(0.04, 0.2, '#FFC21A', x, y + 0.75, z, 8); break;
    case 'Shanghai': cylA(0.04, 0.06, 1.8, '#D57A8E', x, y, z, 8); sphA(0.2, '#E86A8A', x, y + 0.5, z); sphA(0.13, '#E86A8A', x, y + 1.25, z); break;
    case 'Tokyo': for (let i = 0; i < 4; i++) { box(0.36 - i * 0.05, 0.2, 0.36 - i * 0.05, '#F4EFE6', x, y + i * 0.3, z); cone(0.38 - i * 0.05, 0.12, '#D9342B', x, y + i * 0.3 + 0.2, z); } break;
    case 'Singapore': for (const s of [-0.28, 0, 0.28]) box(0.16, 0.9, 0.2, '#C9D6E3', x + s, y, z); box(0.9, 0.08, 0.24, '#7ACB4E', x, y + 0.92, z); break;
    case 'New York': box(0.26, 1.4, 0.26, '#9FB3C8', x, y, z); cone(0.06, 0.4, '#C9D6E3', x, y + 1.4, z, 8); box(0.24, 1.0, 0.24, '#C2D0DE', x + 0.3, y, z + 0.1); box(0.24, 0.8, 0.24, '#7F9CC0', x - 0.28, y, z + 0.12); break;
    case 'Los Angeles': for (const s of [-0.25, 0.2]) { cylA(0.03, 0.04, 0.9, '#A0794E', x + s, y, z); for (let k = 0; k < 5; k++) { const l = add(new THREE.SphereGeometry(0.14, 10, 8), M('#4E9E58'), x + s + Math.cos(k * 1.25) * 0.14, y + 0.95, z + Math.sin(k * 1.25) * 0.14); l.scale.set(1, 0.4, 1); } } break;
    case 'Seoul': cylA(0.04, 0.08, 1.6, '#F4EFE6', x, y, z, 10); sphA(0.14, '#E86A8A', x, y + 1.2, z); break;
    case 'Toronto': cylA(0.05, 0.1, 1.9, '#C9D6E3', x, y, z, 10); sphA(0.15, '#9FB3C8', x, y + 1.35, z); break;
    case 'Mexico City': for (let i = 0; i < 4; i++) box(0.9 - i * 0.2, 0.16, 0.9 - i * 0.2, i % 2 ? '#C9A46A' : '#D8B87A', x, y + i * 0.16, z, 0.02); break;
    case 'Buenos Aires': cylA(0.02, 0.1, 1.2, '#F2EDE4', x, y, z, 4); break;
  }
}
// hero landmarks for the game's cities: chunky toy miniatures, built around (0,0) then moved to the city
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
  G = null; g.position.set(x, TOP, z); g.scale.setScalar(1.85); scene.add(g);
}
const pos = {};
for (const [n, p] of Object.entries(data.cities)) { pos[n] = pin(n, p); if (GAME.has(n)) hero(n, pos[n][0], pos[n][1]); else landmark(n, pos[n][0], pos[n][1]); }
const lerp = (A, B, t, ox = 0, oz = 0) => [pos[A][0] + (pos[B][0] - pos[A][0]) * t + ox, pos[A][1] + (pos[B][1] - pos[A][1]) * t + oz];
for (const [bx, bz, br] of [[...lerp('São Paulo', 'Lagos', 0.5, 0, 2), 0.3], [...lerp('New York', 'London', 0.45, 0, 2), -0.4], [...lerp('Mumbai', 'Cape Town', 0.55, 4, 0), 0.8], [...lerp('Mexico City', 'Los Angeles', 0.5, -4, 4), 0.2]]) { G = new THREE.Group();
  box(0.9, 0.22, 0.32, '#E2453A', 0, 0, 0, 0.1); box(0.75, 0.06, 0.28, '#F4EFE6', 0, 0.2, 0, 0.02); cylA(0.025, 0.025, 1.0, '#8B6A45', 0.05, 0.2, 0, 6);
  const sl = add(new THREE.ConeGeometry(0.42, 0.85, 3), M('#FFFFFF', { r: 0.8 }), 0.25, 0.68, 0); sl.scale.z = 0.08;
  const g = G; G = null; g.position.set(bx, 0.05, bz); g.rotation.y = br; g.scale.setScalar(1.6); scene.add(g); }
// dotted route Lisbon -> London (done) and London -> Paris (next)
function route(a, b, color) { const [x1, z1] = pos[a], [x2, z2] = pos[b]; const n = 7;
  for (let i = 1; i < n; i++) { const t = i / n; const h = Math.sin(t * Math.PI) * 0.9; add(new THREE.SphereGeometry(0.07, 10, 8), M(color, { e: color, ei: 0.3 }), x1 + (x2 - x1) * t, TOP + 0.15 + h, z1 + (z2 - z1) * t); } }
route('London', 'Lagos', '#16963C'); route('Lagos', 'Mumbai', '#C9D6E3'); route('Mumbai', 'Seoul', '#C9D6E3'); route('Seoul', 'São Paulo', '#C9D6E3'); route('São Paulo', 'Cairo', '#C9D6E3'); route('Cairo', 'Mexico City', '#C9D6E3'); route('Mexico City', 'New York', '#C9D6E3');

// lights
scene.add(new THREE.HemisphereLight('#FFFFFF', '#B9C7B0', 0.75));
const sun = new THREE.DirectionalLight('#FFEFD6', 3.1); sun.position.set(-14, 26, 14); sun.castShadow = true;
sun.shadow.mapSize.set(4096, 4096); Object.assign(sun.shadow.camera, { left: -36, right: 36, top: 24, bottom: -24, near: 1, far: 90 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.03; sun.shadow.radius = 4; scene.add(sun);

const tx = +(P.get('tx') ?? 3), tz = +(P.get('tz') ?? -3);
const cam = new THREE.PerspectiveCamera(+(P.get('fov') || 30), W / H, 0.5, 300);
cam.position.set(tx + 1, +(P.get('cy') || 36), tz + +(P.get('cz') || 24)); cam.lookAt(tx, 0, tz); cam.updateMatrixWorld();
renderer.render(scene, cam);
for (const n of Object.keys(pos)) { const [x, z] = pos[n]; const v = new THREE.Vector3(x, TOP + 1.5, z).project(cam); labels[n] = [Math.round((v.x + 1) / 2 * W), Math.round((1 - v.y) / 2 * H)]; }
window.__labels = labels; window.__ready = true;
