import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { buildCity, moveCity } from './city.js';
import { makeAudio } from './audio.js';
import { CASE_TXT, CASES } from './cases.js';
import { batchNode } from './batch.js';
import { CHAR, loadCharacters, canGLB, makeGLBAvatar, updateCharacters, loadFull, slimTextures, MOBILE, trainClips } from './chars.js';
import { TV, t, tList, setLang, detectLang, getLang, LANGS, DICT } from './i18n.js';
import { EXTRA, EXTRA2, EXTRA3, EXTRA4, EXTRA5, EXTRA6, EXTRA7, EXTRA8, EXTRA9, EXTRA10, EXTRA11, EXTRA12, EXTRA13, EXTRA14, EXTRA15, EXTRA16, EXTRA17, EXTRA18, EXTRA19, EXTRA20, EXTRA21, EXTRA22, EXTRA23, EXTRA24, EXTRA25, EXTRA26, EXTRA27, EXTRA28, EXTRA29, EXTRA30, EXTRA31, EXTRA32, EXTRA33, EXTRA34, EXTRA35 } from './i18n_mgr.js';
import { EPI } from './i18n_epi.js';
for (const l in EXTRA) Object.assign(DICT[l], EXTRA[l], EXTRA2[l], EXTRA3[l], EXTRA4[l], EXTRA5[l], EXTRA6[l], EXTRA7[l], EXTRA8[l], EXTRA9[l], EXTRA10[l], EXTRA11[l], EXTRA12[l], EXTRA13[l], EXTRA14[l], EXTRA15[l], EXTRA16[l], EXTRA17[l], EXTRA18[l], EXTRA19[l], EXTRA20[l], EXTRA21[l], EXTRA22[l], EXTRA23[l], EXTRA24[l], EXTRA25[l], EXTRA26[l], EXTRA27[l], EXTRA28[l], EXTRA29[l], EXTRA30[l], EXTRA31[l], EXTRA32[l], EXTRA33[l], EXTRA34[l], EXTRA35[l]);
for (const l in EPI) if (DICT[l]) Object.assign(DICT[l], EPI[l]);
const AU = makeAudio();

/* =========================================================
   Life Crisis Tycoon — London prototype (build 2)
   ========================================================= */
const $ = (id) => document.getElementById(id);
let RNG = Math.random;
const rnd = (a) => a[Math.floor(RNG() * a.length)];
const crnd = (a) => a[Math.floor(Math.random() * a.length)];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const money = (n) => (n < 0 ? '-$' : '$') + Math.abs(Math.round(n)).toLocaleString('en-US');
const saveKey = (c) => 'ahq_' + (c || 'london') + '_v2';
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let x = Math.imul(a ^ a >>> 15, 1 | a); x = x + Math.imul(x ^ x >>> 7, 61 | x) ^ x; return ((x ^ x >>> 14) >>> 0) / 4294967296; }; }

// ---------------- data ----------------
const PROBLEMS = {
  doom: { e: '📱', room: 'detox', fee: 180 }, group: { e: '💬', room: 'detox', fee: 200 },
  sunday: { e: '😰', room: 'nap', fee: 190 }, burn: { e: '🔥', room: 'nap', fee: 240 }, gloom: { e: '🌧️', room: 'nap', fee: 210 },
  rent: { e: '🏠', room: 'budget', fee: 260 }, subs: { e: '💳', room: 'budget', fee: 220 }, flat: { e: '🛏️', room: 'budget', fee: 230 },
  boss: { e: '😤', room: 'career', fee: 280 }, ladder: { e: '🪜', room: 'career', fee: 300 },
  ghosted: { e: '👻', room: 'social', fee: 230 }, apps: { e: '💔', room: 'social', fee: 210 }, lonely: { e: '🫂', room: 'social', fee: 240 },
  toddler: { e: '🧸', room: 'parent', fee: 250 }, schoolrun: { e: '🎒', room: 'parent', fee: 230 },
  tablet: { e: '🎮', room: 'parent', fee: 240, fam: true }, homework: { e: '📝', room: 'parent', fee: 230, fam: true }, sugar: { e: '🍭', room: 'parent', fee: 220, fam: true },
  moving: { e: '📦', room: 'moving', fee: 260 }, newcity: { e: '🗺️', room: 'moving', fee: 240 },
  tummy: { e: '🤢', room: 'pharmacy', fee: 170 }, headache: { e: '🤕', room: 'pharmacy', fee: 160 }, screeneyes: { e: '🥲', room: 'pharmacy', fee: 150 },
  filter: { e: '🤳', room: 'glowup', fee: 280 }, haircut: { e: '💇', room: 'glowup', fee: 220 }, botoxfomo: { e: '💉', room: 'glowup', fee: 260 },
  hoesik: { e: '🍻', room: 'jjim', fee: 280, city: 'seoul' }, networking: { e: '🤝', room: 'yoga', fee: 310, city: 'newyork' }, // one more local ailment for Seoul and New York
  backpain: { e: '🪑', room: 'pharmacy', fee: 180, lvl: 4 }, hayfever: { e: '🌼', room: 'pharmacy', fee: 160, lvl: 6 }, // pharmacy, later in the career: from São Paulo / from Mexico on
  quitall: { e: '🎒', room: 'career', fee: 290, lvl: 1 }, firstjob: { e: '📄', room: 'career', fee: 240, lvl: 1 }, // not in the London tutorial
  topper: { e: '📚', room: 'career', fee: 260, city: 'mumbai' }, sharmaji: { e: '🏆', room: 'therapy', fee: 290, city: 'mumbai' }, wedding: { e: '💸', room: 'wedding', fee: 320, city: 'mumbai' }, train: { e: '🚆', room: 'nap', fee: 220, city: 'mumbai' },
  overtime: { e: '🌃', room: 'jjim', fee: 280, city: 'seoul' }, hagwon: { e: '✏️', room: 'therapy', fee: 290, city: 'seoul' }, beauty: { e: '🪞', room: 'glowup', fee: 300, city: 'seoul' }, nunchi: { e: '👀', room: 'social', fee: 250, city: 'seoul' },
  commute: { e: '🚗', room: 'nap', fee: 240, city: 'saopaulo' }, novela: { e: '📺', room: 'detox', fee: 230, city: 'saopaulo' }, saudade: { e: '🥹', room: 'roda', fee: 280, city: 'saopaulo' },
  hustle: { e: '💼', room: 'garage', fee: 270, city: 'lagos' }, fuel: { e: '⛽', room: 'budget', fee: 230, city: 'lagos' }, goslow: { e: '🚦', room: 'nap', fee: 210, city: 'lagos' }, aunty: { e: '💍', room: 'social', fee: 240, city: 'lagos' },
  paperwork: { e: '📑', room: 'ahwa', fee: 290, city: 'cairo' }, honk: { e: '📯', room: 'nap', fee: 240, city: 'cairo' }, heatgrump: { e: '🥵', room: 'pharmacy', fee: 220, city: 'cairo' },
  rentshock: { e: '🏙️', room: 'budget', fee: 300, city: 'newyork' }, grind: { e: '☕', room: 'yoga', fee: 320, city: 'newyork' }, swipe: { e: '📲', room: 'social', fee: 260, city: 'newyork' }, roomie: { e: '🛋️', room: 'therapy', fee: 290, city: 'newyork' },
  ahorita: { e: '⏳', room: 'career', fee: 270, city: 'mexico' }, quake: { e: '🫨', room: 'therapy', fee: 300, city: 'mexico' }, antojo: { e: '🌮', room: 'pharmacy', fee: 220, city: 'mexico' }, coraje: { e: '😤', room: 'lucha', fee: 290, city: 'mexico' },
  quarter: { e: '🫠', room: 'therapy', fee: 340, myst: true }, thirty: { e: '🎂', room: 'career', fee: 320, myst: true }, situation: { e: '🫤', room: 'social', fee: 300, myst: true }, mercury: { e: '🪐', room: 'nap', fee: 310, myst: true },
  lowmood: { e: '🪫', room: 'therapy', fee: 300, care: true },
  flu: { e: '🤒', room: 'pharmacy', fee: 180, epi: true }, flurest: { e: '🤧', room: 'nap', fee: 200, epi: true }, // flu/flurest: epidemic waves only
  impostor: { e: '🎭', room: 'therapy', fee: 290 }, overthink: { e: '🌀', room: 'therapy', fee: 280 }, // were lost inside the comment above
};
const ROOMS = {
  budget: { e: '💸', cost: 2500, role: 'coach', time: 8, pill: '#A86A1E', floor: '#E7C08C' },
  nap: { e: '😴', cost: 3000, role: 'guide', time: 10, pill: '#7F68C9', floor: '#D8CCF4' },
  detox: { e: '📵', cost: 2200, role: 'guide', time: 7, pill: '#1F74C4', floor: '#CFE6F7' },
  career: { e: '💼', cost: 2800, role: 'coach', time: 9, pill: '#C2577A', floor: '#F2D6DE' },
  cafe: { e: '🍵', cost: 1800, role: 'host', // a Community Host runs the café (no separate barista profile)
    pill: '#2E7D4F', floor: '#E8C796' },
  lab: { e: '🔬', cost: 4000, role: 'researcher', time: 0, pill: '#3B4A6B', floor: '#E3E8EE' },
  social: { e: '🥂', cost: 2600, role: 'guide', time: 9, pill: '#E0567F', floor: '#FBD9E3' },
  parent: { e: '🧸', cost: 2600, role: 'coach', time: 8, pill: '#E08A2E', floor: '#FFE6B8' },
  moving: { e: '📦', cost: 2400, role: 'coach', time: 8, pill: '#8A6A45', floor: '#EBDCC6' },
  pharmacy: { e: '💊', cost: 2000, role: 'pharmacist', time: 5, pill: '#2BB5A6', floor: '#DFF5F1' },
  glowup: { e: '✨', cost: 3000, role: 'guide', time: 9, pill: '#D4537E', floor: '#FBEAF0' },
  wedding: { e: '💍', cost: 2800, role: 'coach', time: 10, pill: '#D4537E', floor: '#FBE3EC', city: 'mumbai' },
  jjim: { e: '♨️', cost: 2800, role: 'guide', time: 10, pill: '#C2703A', floor: '#F2DCC6', city: 'seoul' },
  yoga: { e: '🧘', cost: 3000, role: 'guide', time: 10, pill: '#3B8D99', floor: '#D6EEF0', city: 'newyork' },
  lucha: { e: '🤼', cost: 2800, role: 'guide', time: 9, pill: '#D63A7A', floor: '#F7D6E4', city: 'mexico' },
  ahwa: { e: '🫖', cost: 2700, role: 'guide', time: 9, pill: '#B5793A', floor: '#F1DFC2', city: 'cairo' },
  roda: { e: '🥁', cost: 2600, role: 'guide', time: 9, pill: '#2E9E5B', floor: '#D8F0D8', city: 'saopaulo' },
  garage: { e: '🔧', cost: 2600, role: 'coach', time: 9, pill: '#E3B341', floor: '#F2E2B8', city: 'lagos' },
  shop: { e: '🛒', cost: 2200, role: 'host', time: 0, pill: '#E9785F', floor: '#FCE3D8', shop: true },
  staffroom: { e: '☕', cost: 1500, role: null, pill: '#8A6A45', floor: '#F1E4CC', staffOnly: true },
  toilet: { e: '🚻', cost: 1200, role: null, pill: '#5AB8F0', floor: '#E6F3FC', loo: true },
  therapy: { e: '🛋️', cost: 3200, role: 'therapist', time: 11, pill: '#0E6E2C', floor: '#D7EBDD' },
  training: { e: '🎓', cost: 3400, role: 'trainer', time: 0, pill: '#5B6CC9', floor: '#E9ECF5', train: true, oneSt: true }, // career mode, from Mumbai
};
const ROLES = {
  host: { uni: '#FFD25E', pants: '#2F3A52', wage: [600, 950], bg: '#FFF3CF', strip: '#F2C14E' },
  coach: { uni: '#16963C', pants: '#2F3A52', wage: [800, 1400], bg: '#DDF3E2', strip: '#7ACB4E' },
  guide: { uni: '#B9A6E8', pants: '#B9A6E8', wage: [700, 1200], bg: '#ECE6FA', strip: '#B57BE8' },
  maint: { uni: '#FF6B5B', pants: '#FF6B5B', wage: [500, 800], bg: '#FFE4DF', strip: '#FF9F43' },
  researcher: { uni: '#FFFFFF', pants: '#2F3A52', wage: [900, 1500], bg: '#E3ECF5', strip: '#5AB8F0' },
  pharmacist: { uni: '#FFFFFF', pants: '#2BB5A6', wage: [700, 1100], bg: '#DFF5F1', strip: '#2BB5A6' },
  therapist: { uni: '#0E6E2C', pants: '#3B4A6B', wage: [1000, 1600], bg: '#D7EBDD', strip: '#2E7D4F' },
  trainer: { uni: '#5B6CC9', pants: '#2F3A52', wage: [900, 1400], bg: '#E6E9F7', strip: '#5B6CC9' },
};
const TRAITS = [
  { n: 'Actually Reads Emails', t: 'good', speed: 1.2 }, { n: 'Spreadsheet Wizard', t: 'good', speed: 1.15 }, { n: 'Calm Voice', t: 'good', calm: 0.7 }, { n: 'Has a Dog', t: 'good', vibe: 1 },
  { n: 'Replies in Voice Notes', t: 'bad', speed: 0.85 }, { n: 'Quiet Quitter', t: 'bad', speed: 0.8 }, { n: 'Always on LinkedIn', t: 'bad', wageUp: 1.1 },
  { n: 'Gym Rat', t: 'fun' }, { n: 'Plant Parent', t: 'fun' }, { n: 'Main Character', t: 'fun' }, { n: 'Astrology Fan', t: 'fun' },
];
const PROJECTS = { nap: { cost: 120, e: '😴' }, mute: { cost: 120, e: '🔇' }, sheet: { cost: 120, e: '📊' }, bins: { cost: 90, e: '🗑️' }, oat: { cost: 80, e: '🥛' }, rent: { cost: 1e9, e: '🏠' } };
for (const k of ['quarter', 'thirty', 'situation', 'mercury']) PROJECTS['m_' + k] = { cost: 100, e: '❓', myst: k };
const EMERGENCIES = { subway: { room: 'yoga', probs: ['grind'], city: 'newyork' }, replica: { room: 'therapy', probs: ['quake'], city: 'mexico' }, stamps: { room: 'ahwa', probs: ['paperwork'], city: 'cairo' }, weddingseason: { room: 'wedding', probs: ['wedding'], city: 'mumbai' }, crunch: { room: 'jjim', probs: ['overtime'], city: 'seoul' }, gridlock: { room: 'nap', probs: ['commute'], city: 'saopaulo' }, blackout: { room: 'garage', probs: ['hustle', 'fuel'], city: 'lagos' }, valentine: { room: 'social', probs: ['ghosted', 'apps', 'lonely'] }, rentriot: { room: 'budget', probs: ['rent', 'flat', 'subs'] }, strike: { room: 'nap', probs: ['sunday', 'burn', 'gloom'], city: 'london' }, layoff: { room: 'career', probs: ['boss', 'ladder'] }, bills: { room: 'budget', probs: ['rent', 'subs', 'flat'] },
  // big Lagos events once the city has 2 stars: a lot of people at once, a bigger payout
  danfo: { room: 'garage', mix: true, city: 'lagos', stars: 2, n: 11, need: 8, time: 210, gap: 1.6, reward: 6500 },
  tourbus: { room: 'budget', mix: true, city: 'london', stars: 2, n: 12, need: 9, time: 220, gap: 1.4, reward: 6000 },
  // one big local event per city once it has 2 stars; bias = the local problems that show up most in the crowd
  baraat: { room: 'wedding', mix: true, bias: ['wedding', 'sharmaji', 'topper', 'train'], city: 'mumbai', stars: 2, n: 12, need: 9, time: 220, gap: 1.4, reward: 6500 },
  hoesik: { room: 'jjim', mix: true, bias: ['overtime', 'nunchi', 'beauty', 'burn', 'boss'], city: 'seoul', stars: 2, n: 12, need: 9, time: 220, gap: 1.4, reward: 6500 },
  derby: { room: 'roda', mix: true, bias: ['commute', 'saudade', 'novela', 'ghosted'], city: 'saopaulo', stars: 2, n: 13, need: 9, time: 230, gap: 1.3, reward: 7000 },
  results: { room: 'ahwa', mix: true, bias: ['paperwork', 'overthink', 'impostor', 'ladder', 'heatgrump'], city: 'cairo', stars: 2, n: 12, need: 9, time: 220, gap: 1.4, reward: 6500 },
  zocalo: { room: 'lucha', mix: true, bias: ['coraje', 'antojo', 'ahorita', 'quake'], city: 'mexico', stars: 2, n: 12, need: 9, time: 220, gap: 1.4, reward: 6500 },
  marathon: { room: 'yoga', mix: true, bias: ['grind', 'headache', 'tummy', 'rentshock'], city: 'newyork', stars: 2, n: 13, need: 9, time: 220, gap: 1.3, reward: 7500 },
  school: { room: 'parent', probs: ['schoolrun', 'homework', 'sugar', 'tablet', 'toddler'], city: 'lagos', stars: 2, n: 15, need: 11, time: 240, gap: 1.1, reward: 8500 } };
const CITY_NAMES = { newyork: ['Jess', 'Marcus', 'Priya', 'Danny', 'Aaliyah', 'Ethan', 'Mei', 'Carlos', 'Rachel', 'Malik', 'Sofia', 'Tyler', 'Grace', 'Omar', 'Brooke', 'Kenji'], mexico: ['Sofía', 'Diego', 'Valeria', 'Luis', 'Ximena', 'Carlos', 'Fernanda', 'Jorge', 'Mariana', 'Alejandro', 'Daniela', 'Mateo', 'Lupita', 'Emiliano', 'Camila', 'Andrés'], cairo: ['Omar', 'Noor', 'Yasmin', 'Karim', 'Mariam', 'Ahmed', 'Salma', 'Youssef', 'Hana', 'Mostafa', 'Laila', 'Tarek', 'Nadia', 'Amr', 'Dina', 'Sherif'] };
const FIRST = ['Priya', 'Marcus', 'Jade', 'Omar', 'Zoe', 'Kai', 'Amara', 'Leo', 'Noor', 'Mateo', 'Hana', 'Tunde', 'Ines', 'Sam', 'Riya', 'Ezra', 'Lola', 'Dev', 'Maya', 'Femi', 'Chloe', 'Arjun', 'Sofia', 'Kwame', 'Yuki', 'Min-jun', 'Lucas', 'Aiko'];
// each role is played by one character model, so its first names follow that character: women at the desk, coaching, maintenance and the pharmacy; men as therapist, wellness guide and researcher
const ROLE_SEX = { host: 'f', coach: 'f', maint: 'f', pharmacist: 'f', therapist: 'm', guide: 'm', researcher: 'm' };
const FIRST_F = ['Priya', 'Jade', 'Zoe', 'Amara', 'Noor', 'Hana', 'Ines', 'Riya', 'Lola', 'Maya', 'Chloe', 'Sofia', 'Yuki', 'Aiko', 'Grace', 'Mei', 'Lina', 'Ama', 'Nadia', 'Elena'];
const FIRST_M = ['Marcus', 'Omar', 'Kai', 'Leo', 'Mateo', 'Tunde', 'Sam', 'Ezra', 'Dev', 'Femi', 'Arjun', 'Kwame', 'Min-jun', 'Lucas', 'Malik', 'Hiro', 'Rafael', 'Theo', 'Idris', 'Tomas'];
const staffFirst = (role) => crnd(ROLE_SEX[role] === 'm' ? FIRST_M : ROLE_SEX[role] === 'f' ? FIRST_F : FIRST);
const LAST = ['Shah', 'Bello', 'Kim', 'Haddad', 'Okafor', 'Nguyen', 'Silva', 'Brown', 'Patel', 'Rossi', 'Mensah', 'Garcia', 'Ito', 'Kowalski', 'Adeyemi', 'Murphy', 'Park', 'Dubois'];
const CITIES = {
  london: { lvl: 0, region: 'rg.europe', cash: 15000, rent: 2400, rain: 0.45, pin: [44.5, 17.0], desc: 'map.desc', tag: 'brief.tag', brief: 'brief.desc', rules: [['🌧️', 'brief.r1'], ['📝', 'brief.r2'], ['🧍', 'brief.r3']], chips: [['b', 'chip.rain'], ['b', 'chip.planning'], ['r', 'chip.strike']], start: 'start.landlord',
    goals: [[['helped', 100], ['vibes', 60, 2]], [['helped', 250], ['succ', 65, 3], ['value', 40000]], [['helped', 500], ['vibes', 85, 3], ['succ', 75, 3], ['value', 80000], ['emwin', 2], ['bestday', 18]]] },
  lagos: { lvl: 1, region: 'rg.africa', unlock: 'london', cash: 14000, rent: 2600, rain: 0.25, pin: [44.5, 58.8], desc: 'lg.desc', tag: 'lg.tag', brief: 'lg.brief', rules: [['⚡', 'lg.r1'], ['💼', 'lg.r2'], ['🚦', 'lg.r3']], chips: [['b', 'lg.c1'], ['b', 'lg.c2'], ['r', 'lg.c3']], start: 'lg.landlord', power: true, hustle: true, waves: true,
    goals: [[['helped', 130], ['vibes', 60, 2], ['wave', 5]], [['helped', 300], ['succ', 65, 3], ['value', 50000], ['wave', 20]], [['helped', 600], ['vibes', 80, 3], ['succ', 75, 3], ['value', 100000], ['emwin', 3], ['bestday', 24]]] },
  mumbai: { lvl: 2, region: 'rg.asia', unlock: 'lagos', cash: 13000, rent: 2200, rain: 0.5, monsoon: true, pin: [69.9, 53.3], desc: 'mb.desc', tag: 'mb.tag', brief: 'mb.brief', rules: [['🌧️', 'mb.r1'], ['👨‍👩‍👧', 'mb.r2'], ['💍', 'mb.r3']], chips: [['b', 'mb.c1'], ['b', 'mb.c2'], ['r', 'mb.c3']], start: 'mb.landlord', groups: { chance: 0.22, kind: 'families' },
    goals: [[['helped', 160], ['vibes', 60, 2], ['wedding', 10]], [['helped', 350], ['succ', 70, 3], ['value', 60000], ['wedding', 30]], [['helped', 700], ['vibes', 80, 3], ['succ', 80, 3], ['value', 120000], ['emwin', 3], ['bestday', 26], ['rain', 80]]] },
  seoul: { lvl: 3, region: 'rg.asia', unlock: 'mumbai', cash: 12000, rent: 3000, rain: 0.3, night: true, pin: [87.6, 30.7], desc: 'se.desc', tag: 'se.tag', brief: 'se.brief', rules: [['🌙', 'se.r1'], ['💼', 'se.r2'], ['🪞', 'se.r3']], chips: [['b', 'se.c1'], ['b', 'se.c2'], ['r', 'se.c3']], start: 'se.landlord',
    goals: [[['helped', 180], ['vibes', 65, 2], ['nightbest', 5]], [['helped', 400], ['succ', 70, 3], ['value', 65000], ['nightbest', 9]], [['helped', 800], ['vibes', 80, 3], ['succ', 80, 3], ['value', 130000], ['emwin', 3], ['bestday', 28], ['nightbest', 12]]] },
  saopaulo: { lvl: 4, region: 'rg.americas', unlock: 'seoul', cash: 12000, rent: 2500, rain: 0.3, waves: true, sig: 'saudade', pin: [29.9, 78.6], desc: 'sp.desc', tag: 'sp.tag', brief: 'sp.brief', rules: [['🚗', 'sp.r1'], ['🥁', 'sp.r2'], ['📺', 'sp.r3']], chips: [['b', 'sp.c1'], ['b', 'sp.c2'], ['r', 'sp.c3']], start: 'sp.landlord',
    goals: [[['helped', 200], ['vibes', 65, 2], ['roda', 15]], [['helped', 450], ['succ', 70, 3], ['value', 75000], ['roda', 50]], [['helped', 900], ['vibes', 80, 3], ['succ', 80, 3], ['value', 150000], ['emwin', 3], ['bestday', 30]]] },
  cairo: { lvl: 5, region: 'rg.africa', unlock: 'saopaulo', cash: 12000, rent: 2500, sig: 'paperwork', rain: 0.05, hot: true, evening: true, pin: [55.1, 42.7], desc: 'cr.desc', tag: 'cr.tag', brief: 'cr.brief', rules: [['🥵', 'cr.r1'], ['🌆', 'cr.r2'], ['📑', 'cr.r3']], chips: [['b', 'cr.c1'], ['b', 'cr.c2'], ['r', 'cr.c3']], start: 'cr.landlord',
    goals: [[['helped', 220], ['vibes', 65, 2], ['tea', 15]], [['helped', 500], ['succ', 70, 3], ['value', 80000], ['tea', 50]], [['helped', 1300], ['vibes', 82, 3], ['succ', 80, 3], ['value', 210000], ['emwin', 3], ['bestday', 30]]] },
  mexico: { lvl: 6, region: 'rg.americas', unlock: 'cairo', cash: 12000, rent: 2600, rain: 0.25, quake: true, altitude: true, sig: 'coraje', pin: [13.4, 35.1], desc: 'mx.desc', tag: 'mx.tag', brief: 'mx.brief', rules: [['🚨', 'mx.r1'], ['⛰️', 'mx.r2'], ['🤼', 'mx.r3']], chips: [['b', 'mx.c1'], ['b', 'mx.c2'], ['r', 'mx.c3']], start: 'mx.landlord',
    goals: [[['helped', 240], ['vibes', 65, 2], ['lucha', 15]], [['helped', 550], ['succ', 75, 3], ['value', 85000], ['lucha', 55]], [['helped', 1600], ['vibes', 82, 3], ['succ', 80, 3], ['value', 245000], ['emwin', 4], ['bestday', 32], ['quake', 35]]] },
  newyork: { lvl: 7, region: 'rg.americas', unlock: 'mexico', cash: 14000, rent: 3600, rain: 0.3, tips: true, impatient: true, sig: 'grind', pin: [23.8, 20.9], desc: 'ny.desc', tag: 'ny.tag', brief: 'ny.brief', rules: [['💸', 'ny.r1'], ['⏱️', 'ny.r2'], ['🧘', 'ny.r3']], chips: [['b', 'ny.c1'], ['b', 'ny.c2'], ['r', 'ny.c3']], start: 'ny.landlord',
    goals: [[['helped', 260], ['vibes', 68, 2], ['yoga', 20]], [['helped', 600], ['succ', 75, 3], ['value', 110000], ['yoga', 60]], [['helped', 1900], ['vibes', 86, 3], ['succ', 85, 3], ['value', 350000], ['emwin', 4], ['bestday', 34]]] },
};
const LOCKED_PINS = [];
const metric = (s, m) => (m === 'value' ? centreValue(s) : m === 'succ' ? succRate(s) : m === 'bestday' ? Math.max(s.bestDay || 0, s.dServ || 0) : m === 'nightbest' ? Math.max(s.bestNight || 0, s.nServ || 0) : m === 'helped' ? s.served : m === 'vibes' ? s.vibes : m === 'cash' ? s.cash : (s.cnt || {})[m] || 0);
function incCnt(k) { S.cnt = S.cnt || {}; S.cnt[k] = (S.cnt[k] || 0) + 1; }
const isNight = () => cityOf().night && S.t > DAY_LEN * 0.66;
// centre value: what is built (rooms, equipment, land bought) + the profit of the last 7 days (never below 0)
function centreValue(s) { if (!s || !s.rooms) return 0; let v = 0;
  for (const r of s.rooms) if (ROOMS[r.type]) v += roomCost(r.type, r.size || 'm');
  for (const d of s.decor || []) v += (DECOR[d.k] && DECOR[d.k].cost) || 0;
  if (s.mode === 'career' && s === S) { const lots = plotOf().lots; for (let i = 0; i < lots.length; i++) if (lotSt(i) === 'owned') v += lotCost(i); }
  if (s === S) { let rev = 0; for (const id in s.rEarn || {}) rev += roomWeek(+id); const wages = (s.staff || []).reduce((a, x) => a + (x.wage || 0), 0) * WAGE_K; v += Math.max(0, rev - RENT - wages); }
  return Math.round(v); }
// success rate: share of the last 40 visitors who left helped rather than angry
const succRate = (s) => { const o = s.outc || []; return o.length < 8 ? 0 : Math.round((o.reduce((a, x) => a + x, 0) / o.length) * 100); };
function outcome(ok) { if (!S) return; (S.outc = S.outc || []).push(ok ? 1 : 0); if (S.outc.length > 40) S.outc.shift(); }
// a vibes condition has to be HELD: 2 days in a row for the 1st star, 3 days for the others (a dip under the line for more than 10 s restarts the count). Once held it stays ticked.
const VH_GRACE = 10, vhNeed = (i, days) => (days || (i === 0 ? 2 : 3)) * 90;
const holdKey = (i, m) => i + ':' + m;
const heldOk = (s, i, m) => s.mode !== 'career' || !!(s.holdDone || {})[holdKey(i, m)] || (m === 'vibes' && !!(s.vhDone || {})[i]);
const vibeHeld = (s, i) => heldOk(s, i, 'vibes');
const partOk = (s, i, m, v) => (m === 'vibes' ? vibeHeld(s, i) && true : metric(s, m) >= v);
const mkGoals = (arr) => arr.map((parts, i) => ({ k: 'g' + (i + 1), i, parts, ok: (s) => parts.every(([m, v, days]) => (days && s.mode === 'career' ? heldOk(s, i, m) : metric(s, m) >= v)) }));
for (const C of Object.values(CITIES)) if ((C.lvl || 0) >= 2 && !C.goals[2].some((g) => g[0] === 'epiclean')) C.goals[2].push(['epiclean', 2]); // 3★: get through 2 epidemics without a penalty
let GOALS = mkGoals(CITIES.london.goals);
const goalText = (G) => G.parts.map(([m, v, days]) => t('gp.' + m, { n: m === 'cash' || m === 'value' ? money(v) : v }) + (days ? ' (' + t('obj.days', { d: days }) + ')' : '')).join(' · ');
const cityOf = () => CITIES[(S && S.city) || 'london'];
const DAY_LEN = 90, RENT_EVERY = 7, BILL_K = 2.5, WAGE_K = 2.0, ELEC_K = 1.5, // 90 s days; weekly bills scaled so cost per real minute stays balanced // weekly bills (rent ×1.5, wages ×1.2 of the old 4-day amounts — balanced by bot runs so a sensible HQ makes a profit)
  // weekly bills; amounts scaled from the old 4-day cycle so the economy keeps its balance
  ANNEX_COST = 8000, QUICK_LEN = 180;
let RENT = 2400;
const lvlOk = (k) => !PROBLEMS[k].lvl || ((CITIES[(S && S.city) || 'london'] || {}).lvl || 0) >= PROBLEMS[k].lvl;
const isMystK = (k) => PROBLEMS[k] && PROBLEMS[k].myst && !S.research.done.includes('m_' + k);
const pn = (k) => (isMystK(k) || isNewK(k) ? '???' : t('p.' + k)), rn = (k) => t('r.' + k), roleN = (k) => t('role.' + k), trN = (n) => t('t.' + n), dayN = (d) => t('day.n', { d });

// ---------------- state ----------------
let S;
function newState() {
  return { v: 2, mode: 'career', cash: 15000, vibes: 60, day: 1, t: 0, served: 0, left: 0, earned: 0, stars: 0, annex: 'locked', annexDay: 0,
    rooms: [], staff: [], chat: [], unread: 0, nextId: 1, rainy: false,
    research: { done: [], active: null, pts: 0 }, nextInspect: 3, inspectAt: -1, nextEm: 2, emAt: -1, em: null, qt: QUICK_LEN, pepT: 0, pepCd: 0, tut: -1, tips: {}, desk: { x: 4.6, z: 2.8, r: 0 } }; // against the back wall, facing the entrance; the waiting sofa is beside it, not behind it
}
function save() { if (!S || S.mode !== 'career') return; try { if (inGame) S.vis = R.visitors.filter((v) => !['exit', 'angry', 'toShop', 'shopping', 'toLine', 'line'].includes(v.state)).map(snapVisitor); localStorage.setItem(saveKey(S.city), JSON.stringify(S)); const p = profile(); p.last = S.city || 'london'; p.stars = p.stars || {}; p.stars[S.city || 'london'] = Math.max(p.stars[S.city || 'london'] || 0, S.stars); localStorage.setItem('ahq_profile', JSON.stringify(p)); } catch (e) {} }
function load(c) { try { const s = JSON.parse(localStorage.getItem(saveKey(c))); if (s && s.v === 2) return s; } catch (e) {} return null; }

// ---------------- three setup ----------------
const canvas = $('c');
const GFX = (() => { let q = null; try { q = localStorage.getItem('ahq_gfx'); } catch (e) {}
  let hint = null; try { hint = localStorage.getItem('ahq_gfx_hint2'); } catch (e) {}
  const weak = hint === 'low' || (navigator.deviceMemory && navigator.deviceMemory <= 3);
  const mode = q === 'high' || q === 'low' ? q : weak ? 'low' : 'high';
  return { pref: q || 'auto', mode, low: mode === 'low', batch: true }; })();
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); renderer.localClippingEnabled = true; // London kit houses are cut open (clip plane) instead of squashed
renderer.setPixelRatio(GFX.low ? Math.min(window.devicePixelRatio || 1, 1.5) : Math.min(window.devicePixelRatio || 1, MOBILE ? 2 : 2.5));
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); try { if (inGame) save(); } catch (er) {} setTimeout(() => location.reload(), 300); });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = GFX.low || MOBILE ? THREE.PCFSoftShadowMap : THREE.VSMShadowMap; // phones: classic soft shadows (variance maps broke the drawing on iPhone)
// if a material fails to compile on this device, say so on screen (phones can't open a console) and keep a copy for support
renderer.debug.onShaderError = (gl, prog, vs, fs) => { try { const log = [gl.getProgramInfoLog(prog), gl.getShaderInfoLog(vs), gl.getShaderInfoLog(fs)].filter(Boolean).join(' | ').slice(0, 400); window.__shaderErr = (window.__shaderErr || []).concat(log);
  let el = document.getElementById('shaderErr'); if (!el) { el = document.createElement('div'); el.id = 'shaderErr'; el.style.cssText = 'position:fixed;left:8px;right:8px;bottom:96px;z-index:99999;background:#fff3f0;color:#8a1f11;font:12px/1.3 monospace;padding:8px;border-radius:8px;max-height:30vh;overflow:auto;box-shadow:0 2px 8px rgba(0,0,0,.2)'; el.onclick = () => el.remove(); document.body.appendChild(el); }
  el.textContent = 'Erreur graphique (capture d\'écran pour le support, touche pour fermer) : ' + window.__shaderErr.join(' || '); } catch (e) {} }; // preview: soft, blurred shadows (variance maps)
/* daylight look (preview, ?look=day): soft daylight, neutral tone mapping, colour carried by the materials; one place for its values */
const LOOK_DAY = /[?&]look=day\b/.test(location.search);
const DAY = { dress: { social: { rug: '#F4B9C3', shelf: 1, art: ['#F2B66D', '#E98C7A'] }, lab: { shelf: 1, art: ['#8FC1D9', '#A9C3A6'] }, nap: { art: ['#C9B3E6', '#F6D27A'] }, garage: { shelf: 1, art: ['#F2B66D', '#91B4A0'] } }, glassUp: 0.55, exposure: 1.0, hemi: ['#FFF8F2', '#D8C9BE', 1.15], sun: ['#FFF5E9', 2.35], fill: ['#F4F0FF', 0.45], env: 0.3, ext: '#F3E5E0', corridor: [237, 221, 216], grout: '#D9C7C2', frame: '#ABA8A5',
  rooms: { social: { wall: '#ECA4B1', floor: '#F0C8CE' }, lab: { wall: '#B5C8AD', floor: '#E6E6DF' }, nap: { wall: '#CBB5DF', floor: '#E5D9EE' }, garage: { wall: '#E9C795', floor: '#E5C5A4' }, budget: { wall: '#A9CDB2', floor: '#DCE6DA' }, therapy: { wall: '#E9B89E', floor: '#EFD9CB' },
    pharmacy: { wall: '#A9D1C8', floor: '#E3E8E3' }, detox: { wall: '#C5D3A2', floor: '#E7E9D8' }, cafe: { wall: '#EBB89A', floor: '#EFE2D6' }, toilet: { wall: '#B3CBE0', floor: '#E3E8EE' }, parent: { wall: '#AFC8E2', floor: '#EBD3AE' }, career: { wall: '#B5BCE0', floor: '#E4E2EC' } }, kits: { social_kit: 'social_kit_n', lab_kit: 'lab_kit_n', nap_kit: 'nap_kit_n', garage_kit: 'garage_kit_n' } };
const BASE_EXPO = LOOK_DAY ? DAY.exposure : 0.92;
renderer.toneMapping = LOOK_DAY ? THREE.NeutralToneMapping : THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = BASE_EXPO;
renderer.outputColorSpace = THREE.SRGBColorSpace;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#DCE6EC');
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.22;
const hemi = new THREE.HemisphereLight('#FFE9D2', '#B39C82', 0.62); scene.add(hemi);
const fill = new THREE.DirectionalLight('#E6ECFF', 0.3); fill.position.set(-14, 12, -10); scene.add(fill);
const sun = new THREE.DirectionalLight('#FFD9AC', 3.1);
sun.position.set(16, 24, 10); sun.castShadow = true; sun.shadow.mapSize.set(GFX.low || MOBILE ? 1024 : 2048, GFX.low || MOBILE ? 1024 : 2048);
Object.assign(sun.shadow.camera, { left: -20, right: 22, top: 20, bottom: -20, near: 1, far: 80 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; sun.shadow.radius = GFX.low ? 4 : 7; sun.shadow.blurSamples = 14;
scene.add(sun); sun.target.position.set(-1, 0, 2); scene.add(sun.target);
const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
const view = { tx: -0.6, tz: -1.6, half: 15.5, yaw: Math.PI / 4, pitch: 0.72, yawT: null };
const CLOSE_HALF = 10; // zoomed in closer than this = dollhouse view: everything between the camera and what you look at drops to hip height
const PITCH_MIN = 0.06; // ~3° above the ground: down to the people's own eye level
const DIO_PITCH = 0.56; // ~32°: the diorama angle the camera eases into as you pinch-zoom in
const camPitch = () => { const f = Math.min(1, Math.max(0, (CLOSE_HALF + 3 - view.half) / 6)); return view.pitch > DIO_PITCH ? view.pitch + (DIO_PITCH - view.pitch) * f : view.pitch; }; // zooming in lowers the camera toward the diorama view; a lower tilt chosen by the player is kept
let PR_BASE = null; // pixel ratio chosen by the graphics level / speed watcher; close up we draw at the screen's full sharpness
function closePR() { if (PR_BASE == null) PR_BASE = renderer.getPixelRatio(); const dpr = window.devicePixelRatio || 1;
  const want = view.half < CLOSE_HALF - 0.4 ? Math.max(PR_BASE, Math.min(dpr, GFX.low ? 2 : 3)) : view.half > CLOSE_HALF + 0.4 ? PR_BASE : null;
  if (want != null && Math.abs(renderer.getPixelRatio() - want) > 0.01) { renderer.setPixelRatio(want); renderer.setSize(innerWidth, innerHeight, false); } }
function fitSun() { // close up the shadow map covers just what you see, so shadows stay crisp; further out it covers the whole HQ as before
  const sc = sun.shadow.camera, close = view.half < 9;
  if (close) { const r = Math.ceil(view.half * 1.9 + 3), qx = Math.round(view.tx), qz = Math.round(view.tz); Object.assign(sc, { left: -r, right: r, top: r, bottom: -r }); sun.target.position.set(qx, 0, qz); sun.position.set(qx + 17, 24, qz + 8); } // snapped to whole metres so shadows don't shimmer while panning
  else { Object.assign(sc, { left: -20, right: 22, top: 20, bottom: -20 }); sun.target.position.set(-1, 0, 2); sun.position.set(16, 24, 10); }
  sc.updateProjectionMatrix(); sun.target.updateMatrixWorld();
}
// ---- test (preview only): London as a painted panorama on a ring around the plot. The ring leans back by the camera's tilt so its far side
// always faces the camera, whatever the rotation; the near side is culled. Tilt is locked to the painting's angle, zoom is limited, the 3D city is hidden.
const BG_Q = new URLSearchParams(location.search), BG_ON = BG_Q.get('bg') === '1', BG_PITCH = +(BG_Q.get('bgp') || 0.62), BG_R = +(BG_Q.get('bgr') || 21), BG_REP = +(BG_Q.get('bgrep') || 3);
const bgMode = () => BG_ON && S && (S.city || 'london') === 'london';
function placeBackdrop(on) {
  if (world.bg) { world.bg.parent && world.bg.parent.remove(world.bg); world.bg = null; }
  if (world.cityG) world.cityG.visible = !on || BG_Q.get('bgcity') === '1'; // ?bgcity=1 keeps the 3D streets in front of the painting
  if (!on) return;
  const tex = new THREE.TextureLoader().load('assets/bg/london_pano.jpg?v=1'); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4; tex.wrapS = THREE.RepeatWrapping; tex.repeat.set(-BG_REP, 1);
  const P = plotBox(S.city || 'london'), cx = (P[0] + P[1]) / 2, cz = (P[2] + P[3]) / 2, tn = Math.tan(BG_PITCH), cs = Math.cos(BG_PITCH);
  const hv = (2 * Math.PI * BG_R / (BG_REP * 2271 / 768)) / (1 / cs - Math.PI * tn / (BG_REP * 2271 / 768)); // slant height matches the picture's aspect
  const geo = new THREE.CylinderGeometry(BG_R + hv * tn, BG_R, hv, 120, 1, true);
  const m = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, toneMapped: false, fog: false }));
  m.position.set(cx, -0.52 + hv / 2, cz); scene.add(m); world.bg = m; scene.background = new THREE.Color('#BCBFF6'); scene.fog = null;
}
function placeCam() {
  closePR(); fitSun();
  if (bgMode()) { view.pitch = BG_PITCH; view.pitchT = null; view.half = clamp(view.half, 6, 22); }
  const a = innerWidth / innerHeight;
  cam.left = -view.half * a; cam.right = view.half * a; cam.top = view.half; cam.bottom = -view.half; cam.updateProjectionMatrix();
  const D = 65, ep = bgMode() ? BG_PITCH : camPitch(), cp = Math.cos(ep);
  const put0 = () => { cam.left = -view.half * a; cam.right = view.half * a; cam.top = view.half; cam.bottom = -view.half; cam.updateProjectionMatrix();
    cam.position.set(view.tx + Math.sin(view.yaw) * cp * D, Math.sin(ep) * D, view.tz + Math.cos(view.yaw) * cp * D); cam.lookAt(view.tx, 0, view.tz); cam.updateMatrixWorld(); };
  put0();
  // camera limit: the ground seen on screen always stays inside the city, so its empty edges never show (zoom out and pan stop there)
  const gnd = world.ground; if (gnd) { const gh = 45 * gnd.scale.x + 2.5, X0 = gnd.position.x - gh, X1 = gnd.position.x + gh, Z0 = gnd.position.z - gh, Z1 = gnd.position.z + gh;
    const fw = new THREE.Vector3(), rt = new THREE.Vector3(), up = new THREE.Vector3(); cam.getWorldDirection(fw); rt.setFromMatrixColumn(cam.matrixWorld, 0); up.setFromMatrixColumn(cam.matrixWorld, 1);
    const foot = () => { let x0 = 1e9, x1 = -1e9, z0 = 1e9, z1 = -1e9; for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const o = cam.position.clone().addScaledVector(rt, sx * view.half * a).addScaledVector(up, sy * view.half), t = (-0.5 - o.y) / fw.y, x = o.x + fw.x * t, z = o.z + fw.z * t; x0 = Math.min(x0, x); x1 = Math.max(x1, x); z0 = Math.min(z0, z); z1 = Math.max(z1, z); } return [x0, x1, z0, z1]; };
    let f = foot(); const k = Math.min(1, (X1 - X0) / (f[1] - f[0]), (Z1 - Z0) / (f[3] - f[2])); if (k < 1) { view.half *= k * 0.999; put0(); f = foot(); }
    let dx = 0, dz = 0; if (f[0] < X0) dx = X0 - f[0]; else if (f[1] > X1) dx = X1 - f[1]; if (f[2] < Z0) dz = Z0 - f[2]; else if (f[3] > Z1) dz = Z1 - f[3];
    if (dx || dz) { view.tx += dx; view.tz += dz; put0(); } }
  updateCutaway();
}
const GHOST = new Map();
function ghostOf(m) { let g = GHOST.get(m); if (!g) { g = m.clone(); g.transparent = true; g.opacity = 0.38; g.depthWrite = false; GHOST.set(m, g); } return g; }
function fadeNode(node, on) {
  if (node.userData.faded === on) return; node.userData.faded = on;
  node.traverse((o) => { if (!o.isMesh || Array.isArray(o.material)) return; if (!o.userData.solidMat) { o.userData.solidMat = o.material; o.userData.cs0 = o.castShadow; } o.material = on ? ghostOf(o.userData.solidMat) : o.userData.solidMat; o.castShadow = !on && o.userData.cs0 !== false; });
}
const SEE_MAT = new Map(); // material -> its see-through twin
function seeThrough(g, on) {
  if (g.userData.ghost === on) return; g.userData.ghost = on;
  g.traverse((m) => { if (!m.isMesh) return; if (!m.userData.mat0) m.userData.mat0 = m.material; const base = m.userData.mat0;
    if (!on) { m.material = base; m.castShadow = true; return; }
    const one = (b) => { let t = SEE_MAT.get(b); if (!t) { t = b.clone(); t.transparent = true; t.opacity = 0.17; t.depthWrite = false; SEE_MAT.set(b, t); } return t; };
    m.material = Array.isArray(base) ? base.map(one) : one(base); m.castShadow = false; });
}
let WALLS_UP = (() => { try { return localStorage.getItem('ahq_walls') === 'up'; } catch (e) { return false; } })();
function updateCutaway() {
  if (typeof world === 'undefined') return;
  const cx = Math.sin(view.yaw), cz = Math.cos(view.yaw);
  // Two Point Hospital cutaway: back walls full height (taller than people); walls on the camera side cut to hip height
  // (solid, never see-through); doors always keep their full frame and leaf. The 🧱 button raises every wall when wanted.
  const close = view.half < CLOSE_HALF, fr = (p) => !!p && (p[0] - view.tx) * cx + (p[1] - view.tz) * cz > 0.6; // fr: nearer the camera than the point you look at
  const up = WALLS_UP, cut = (n, p) => { if (close && fr(p)) return true; if (up) return false; const f = n[0] * cx + n[1] * cz; if (f > 0.2) return true; if (LOOK_DAY) return false; /* daylight look: back walls stay full height, as in the benchmark render */ if (!p || typeof inFloor !== 'function') return false; return inFloor(p[0] + n[0] * 0.7, p[1] + n[1] * 0.7) || inFloor(p[0] + n[0] * 0.7 + 0.01, p[1] + n[1] * 0.7 + 0.01); };
  const tv = new THREE.Vector3(), wp2 = (o) => { o.getWorldPosition(tv); return [tv.x, tv.z]; };
  for (const w of world.cutWalls || []) { w.visible = true; const n = w.userData.n; w.scale.y = (!up || close) && n[0] * cx + n[1] * cz > 0.2 ? WALL_HIP / W_H : ROOM_H / W_H; }
  for (const w of world.roomCut || []) { w.scale.y = !(LOOK_DAY && w.userData.door) && cut(w.userData.n, w.userData.p) ? WALL_HIP / ROOM_H : 1; for (const c of w.children) if (c.userData.keepY) c.scale.y = 1 / w.scale.y; }
  for (const h of world.roomHangs || []) { const wp = h.o.getWorldPosition(new THREE.Vector3()); h.o.visible = !cut(h.n, [wp.x, wp.z]); } // wall decor goes with its wall when the wall is cut down
  for (const d of world.doors || []) { const c = !LOOK_DAY && !d.kit && close && d.g.userData.n && cut(d.g.userData.n, [d.x, d.z]); // close up, a door in a wall that drops to hip height drops with it (frame cut down, leaf and arch hidden)
    d.g.scale.y = c ? WALL_HIP / ROOM_H : 1; for (const o of [d.top, d.head, ...d.leaves]) if (o) o.visible = !c; d.cut = !!c; }
  const ep = camPitch(), tan = Math.tan(ep);
  // how far toward the camera the HQ (and its plaza) reaches from the point you look at, capped by the bottom of the screen:
  // a city building whose roof would hide any of that is squashed. Low tilts need this, as roofs then hide a lot more.
  let reach = 9; try { const bx = plotBox(); for (const x of [bx[0], bx[1]]) for (const z of [bx[2], bx[3] + 6]) reach = Math.max(reach, (x - view.tx) * cx + (z - view.tz) * cz); } catch (e) {}
  reach = Math.max(9, Math.min(reach, view.half / Math.sin(ep) + 2));
  const side = Math.max(18, view.half * innerWidth / innerHeight + 4);
  for (const b of world.cityB || []) {
    const dx = b.x - view.tx, dz = b.z - view.tz, along = dx * cx + dz * cz;
    const perp = Math.abs(dx * cz - dz * cx);
    const occl = along > -b.r && perp < side + b.r && b.h / tan > along - b.r - reach;
    if (b.lm) b.o.visible = !occl; else if (b.clip) { if (b._occ !== occl) { b._occ = occl; b.clip(occl); } } else { const ky = occl ? Math.max(0.06, Math.min(1, 1.6 / b.h)) : 1; b.o.scale.y = ky; if (b.onSquash && b._ky !== ky) { b._ky = ky; b.onSquash(ky); } }
  }
}
function resize() { renderer.setSize(innerWidth, innerHeight, false); placeCam(); }
addEventListener('resize', resize);

// ---------------- helpers ----------------
const MC = {}, GC = {};
function mat(c, o = {}) {
  const k = c + '|' + (o.r ?? '') + (o.e ?? '') + (o.ei ?? '') + (o.op ?? '') + (o.m ?? '') + (o.mapK ?? '');
  if (!MC[k]) MC[k] = new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? 0.7, metalness: o.m ?? 0, emissive: o.e ?? '#000000', emissiveIntensity: o.ei ?? 1, transparent: o.op != null, opacity: o.op ?? 1, map: o.map || null });
  return MC[k];
}
function rbox(w, h, d, c, r = 0.06, o) {
  const rr = Math.max(0.005, Math.min(r, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002));
  const k = 'b' + w + '|' + h + '|' + d + '|' + rr;
  if (!GC[k]) GC[k] = new RoundedBoxGeometry(w, h, d, GFX.low ? 1 : 2, rr);
  const m = new THREE.Mesh(GC[k], mat(c, o)); m.castShadow = m.receiveShadow = true; return m;
}
function cyl(rt, rb, h, c, o, seg = GFX.low ? 12 : 20) {
  const k = 'c' + rt + '|' + rb + '|' + h + '|' + seg;
  if (!GC[k]) GC[k] = new THREE.CylinderGeometry(rt, rb, h, seg);
  const m = new THREE.Mesh(GC[k], mat(c, o)); m.castShadow = m.receiveShadow = true; return m;
}
function sph(r, c, o) {
  const k = 's' + r;
  if (!GC[k]) GC[k] = GFX.low ? new THREE.SphereGeometry(r, 12, 8) : new THREE.SphereGeometry(r, 20, 14);
  const m = new THREE.Mesh(GC[k], mat(c, o)); m.castShadow = m.receiveShadow = true; return m;
}
function put(o, x, y, z, p = scene) { o.position.set(x, y, z); p.add(o); return o; }
function grp(x = 0, z = 0, rot = 0, p = scene) { const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.y = rot; p.add(g); return g; }
function canvasTex(w, h, draw, rep) {
  const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
  const tx = new THREE.CanvasTexture(c); tx.colorSpace = THREE.SRGBColorSpace;
  if (rep) { tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(rep[0], rep[1]); }
  return tx;
}
const woodTex = (a, b, rep) => canvasTex(128, 128, (g, w) => { for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect(0, i * 16, w, 16); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(0, i * 16, w, 1); } }, rep);
// the real pavement of each city (preview): drawn once per city, tiled over the whole ground
function groundTex(kind) {
  let sd = 11; const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; }; const pick = (a) => a[Math.floor(rr() * a.length)];
  const rect = (g, x, y, w, h, c, r = 3) => { g.fillStyle = c; g.beginPath(); g.roundRect(x, y, w, h, r); g.fill(); };
  const speck = (g, n, a) => { for (let k = 0; k < n; k++) { g.fillStyle = `rgba(${rr() < 0.5 ? '0,0,0' : '255,255,255'},${a})`; g.fillRect(rr() * 256, rr() * 256, 2, 2); } };
  if (kind === 'london') return cobbleTex();
  if (kind === 'newyork') return canvasTex(256, 256, (g) => { // big poured-concrete squares with tooled joints
    g.fillStyle = '#C9C7C1'; g.fillRect(0, 0, 256, 256); for (const [x, y] of [[0, 0], [128, 0], [0, 128], [128, 128]]) rect(g, x + 2, y + 2, 124, 124, pick(['#D2D0CA', '#CBC9C3', '#D6D4CF', '#C6C4BE']), 2); speck(g, 500, 0.06); }, [22, 22]);
  if (kind === 'saopaulo') return canvasTex(256, 256, (g) => { // calçada portuguesa: white and black stone mosaic in waves
    g.fillStyle = '#8F8A84'; g.fillRect(0, 0, 256, 256);
    for (let y = 0; y < 256; y += 8) for (let x = 0; x < 256; x += 8) { const w = Math.sin((x / 256) * Math.PI * 2) * 34 + 128, band = Math.abs(((y - w + 512) % 128) - 64) < 22;
      rect(g, x + 1 + rr(), y + 1 + rr(), 6, 6, band ? pick(['#3A3836', '#2F2D2C', '#45423F']) : pick(['#F2EEE6', '#E9E4DA', '#F7F4EE']), 1.5); } }, [60, 60]);
  if (kind === 'mexico') return canvasTex(256, 256, (g) => { // dark volcanic stone slabs (recinto) of the historic centre
    g.fillStyle = '#5F5A56'; g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 4; row++) for (let i = -1; i < 3; i++) rect(g, i * 128 + (row % 2 ? 64 : 0) + 2, row * 64 + 2, 124, 60, pick(['#8A847E', '#7F7973', '#938D86', '#857F78']), 3);
    speck(g, 900, 0.08); }, [22, 22]);
  if (kind === 'seoul') return canvasTex(256, 256, (g) => { // small interlocking bricks, grey with warm and red ones mixed in
    g.fillStyle = '#9C9690'; g.fillRect(0, 0, 256, 256);
    for (let row = 0; row < 16; row++) for (let i = -1; i < 9; i++) rect(g, i * 32 + (row % 2 ? 16 : 0) + 1, row * 16 + 1, 30, 14, pick(['#C9C4BD', '#C2BCB4', '#D1CCC5', '#BFB2A3', '#B57A66', '#C9C4BD']), 2); }, [24, 24]);
  if (kind === 'lagos' || kind === 'mumbai') return canvasTex(256, 256, (g) => { // concrete interlocking pavers (I-shape), Lagos with red ones in the pattern
    g.fillStyle = kind === 'lagos' ? '#8E877D' : '#8C877F'; g.fillRect(0, 0, 256, 256);
    const C = kind === 'lagos' ? ['#BDB5A8', '#B5AD9F', '#C4BCAF', '#A65B44'] : ['#BDB8AF', '#B4AFA6', '#C5C0B8', '#ABA59B'];
    for (let row = 0; row < 8; row++) for (let i = -1; i < 6; i++) { const x = i * 48 + (row % 2 ? 24 : 0) + 2, y = row * 32 + 2, c = row % 4 === 1 && kind === 'lagos' && i % 2 ? C[3] : pick(C.slice(0, 3));
      rect(g, x, y, 44, 28, c, 4); g.fillStyle = 'rgba(0,0,0,0.18)'; g.fillRect(x + 20, y, 4, 7); g.fillRect(x + 20, y + 21, 4, 7); } speck(g, 400, 0.05); }, [24, 24]);
  if (kind === 'cairo') return canvasTex(256, 256, (g) => { // sand-coloured square tiles
    g.fillStyle = '#B9A47F'; g.fillRect(0, 0, 256, 256); for (let y = 0; y < 256; y += 42.67) for (let x = 0; x < 256; x += 42.67) rect(g, x + 1.5, y + 1.5, 39.7, 39.7, pick(['#E2CFA8', '#DCC79E', '#E8D7B4', '#D6C095']), 2); speck(g, 600, 0.06); }, [24, 24]);
  return null;
}
const cobbleTex = () => canvasTex(256, 256, (g) => { // warm cobbles like the reference painting, offset rows of rounded stones
  g.fillStyle = '#A6978A'; g.fillRect(0, 0, 256, 256); let sd = 7; const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const cols = ['#C9C0B4', '#C0B6A9', '#D2C9BD', '#BAAF A1'.replace(' ', ''), '#CCC3B8', '#C4BAAE'];
  for (let row = 0; row < 10; row++) for (let i = -1; i < 10; i++) { const w = 25.6, x = i * w + (row % 2 ? w / 2 : 0) + 1.5, y = row * 25.6 + 1.5;
    g.fillStyle = cols[Math.floor(rr() * cols.length)]; g.beginPath(); g.roundRect(x, y, w - 3, 22.6, 7); g.fill();
    g.fillStyle = 'rgba(255,255,255,0.18)'; g.beginPath(); g.roundRect(x + 3, y + 2, w - 10, 6, 3); g.fill(); }
}, [26, 26]);
const tileTex = (a, b, rep) => canvasTex(64, 64, (g) => { g.fillStyle = a; g.fillRect(0, 0, 64, 64); g.fillStyle = b; g.fillRect(0, 0, 32, 32); g.fillRect(32, 32, 32, 32); }, rep);

// ---------------- people ----------------
const SKIN = ['#F3D2B3', '#E8BE98', '#C68B5E', '#9A6440', '#6B4127', '#4A2D1C'];
const HAIR = ['#1C120C', '#2B1D14', '#5A3A22', '#7A3B1E', '#C98E4B', '#E9EEF2', '#FF8FAB', '#5B8DEF', '#3A2A2A'];
const SHIRTS = ['#E9785F', '#5AB8F0', '#F4EFE6', '#7F68C9', '#FF9F43', '#2BB5A6', '#E86A8A', '#8A9A5B', '#3B4A6B', '#C9B6F2', '#F2C14E'];
const STYLES = ['short', 'long', 'bun', 'curly', 'beanie', 'beard', 'hijab', 'bald'];
// Appearance entry point: GLB avatar when available for this kind/outfit, else the procedural one (fallback).
function outfitKey(kind, o) { return kind === 'staff' ? (o.role === 'barista' ? 'host' : o.role) : kind === 'manager' ? (o.model || 'mgr_h') : (o.vm && CHAR.A.full[o.vm] ? o.vm : 'casual'); }
// ---- modelled visitors: 28 people; who shows up depends on the city's population, never on the problem they bring ----
// h = height in m (HUD placement), kid = only comes along with a family group
const VIS = { sp_health: { h: 1.82 }, sp_safety: { h: 1.8 }, sp_mystery: { h: 1.66 }, sp_influencer: { h: 1.65 }, sp_trainer: { h: 1.68 }, v01: { h: 1.65 }, v02: { h: 1.8 }, v03: { h: 1.68 }, v04: { h: 1.74 }, v05: { h: 1.62 }, v06: { h: 1.75 }, v07: { h: 1.63 }, v08: { h: 1.76 }, v09: { h: 1.65 }, v10: { h: 1.35, chair: true }, v11: { h: 1.64 }, v12: { h: 1.8 }, v13: { h: 1.66 }, v14: { h: 1.78 },
  v15: { h: 1.8 }, v16: { h: 1.74 }, v17: { h: 1.6 }, v18: { h: 1.7 }, v19: { h: 1.6 }, v20: { h: 1.63 }, v21: { h: 1.56 }, v22: { h: 1.78 }, v23: { h: 1.66 }, v24: { h: 1.8 }, v25: { h: 1.15, kid: 1 }, v26: { h: 1.28, kid: 1 }, v27: { h: 1.2, kid: 1 }, v28: { h: 1.22, kid: 1 } };
const VIS_POOL = {
  london: { v01: 3, v02: 3, v03: 4, v04: 4, v05: 3, v06: 3, v07: 2, v08: 2, v09: 2, v10: 1, v11: 3, v12: 4, v15: 1, v22: 1, v25: 1, v26: 1, v27: 1, v28: 1 },
  lagos: { v01: 4, v02: 4, v11: 4, v13: 6, v14: 5, v15: 6, v16: 5, v10: 1, v12: 1, v03: 1, v06: 1, v25: 2, v26: 2 },
  mumbai: { v05: 5, v06: 5, v17: 6, v18: 5, v19: 6, v10: 1, v03: 1, v02: 1, v27: 3 },
  seoul: { v07: 5, v08: 5, v20: 6, v21: 5, v22: 6, v10: 1, v03: 1, v12: 1, v02: 1, v28: 3 },
  newyork: { v01: 3, v02: 3, v03: 3, v04: 3, v05: 2, v06: 2, v07: 2, v08: 2, v09: 3, v10: 1, v11: 3, v12: 3, v13: 2, v15: 2, v17: 2, v20: 2, v22: 2, v23: 2, v24: 2, v25: 2, v26: 2, v27: 2, v28: 2 },
  mexico: { v09: 5, v24: 5, v23: 4, v03: 2, v04: 2, v12: 2, v01: 2, v02: 2, v11: 1, v10: 1, v25: 2, v26: 2, v27: 1 },
  cairo: { v13: 3, v14: 2, v17: 4, v18: 4, v19: 3, v05: 3, v06: 3, v01: 2, v02: 2, v15: 2, v16: 2, v10: 1, v25: 2, v26: 2, v27: 2 },
  saopaulo: { v09: 5, v24: 5, v23: 3, v03: 3, v04: 3, v12: 3, v02: 3, v01: 2, v11: 2, v07: 1, v10: 1, v25: 1, v26: 1, v27: 1 },
};
const visPool = (c) => VIS_POOL[c || (S && S.city) || 'london'] || VIS_POOL.london;
function pickVis(kid, noChair) {
  const P = visPool(), ks = Object.keys(P).filter((k) => !!VIS[k].kid === !!kid && !(noChair && VIS[k].chair)); if (!ks.length) return null;
  let r = RNG() * ks.reduce((a, k) => a + P[k], 0); for (const k of ks) { r -= P[k]; if (r <= 0) return k; } return ks[ks.length - 1];
}
const VIS_MALE = new Set(['sp_health', 'sp_safety', 'v02', 'v04', 'v06', 'v08', 'v10', 'v12', 'v14', 'v15', 'v16', 'v18', 'v22', 'v23', 'v24', 'v26', 'v28']);
// body language by problem (shared clips, bought once): how they walk, wait and sit
const PSTYLE = {}; const sty = (ks, st) => ks.split(' ').forEach((k) => (PSTYLE[k] = st));
sty('doom group apps filter novela', { walk: 'WalkText' });
sty('burn sunday gloom overtime commute goslow train lowmood', { walk: 'WalkTired', idle: 'IdleBreath', sit: 'SitDoze' });
sty('headache screeneyes', { idle: 'IdleHead', phone: 'IdleHead' }); sty('tummy', { walk: 'WalkTired', idle: 'IdleHead' });
sty('overthink mercury quarter impostor thirty situation ladder saudade nunchi newcity moving', { walk: 'WalkThink', idle: 'IdleConfused' });
sty('grind rentshock', { walk: 'WalkQuick', sit: 'SitCross' }); sty('swipe', { walk: 'WalkText' }); sty('roomie', { walk: 'WalkThink', idle: 'IdleConfused' });
sty('ahorita', { walk: 'WalkTired', idle: 'IdleBreath' }); sty('quake coraje', { walk: 'WalkQuick', idle: 'IdleConfused' }); sty('antojo', { walk: 'WalkTired', idle: 'IdleHead' });
sty('heatgrump honk', { walk: 'WalkTired', idle: 'IdleHead' }); sty('paperwork', { walk: 'WalkQuick', idle: 'IdleConfused' });
sty('boss hustle rent fuel subs flat', { walk: 'WalkQuick', sit: 'SitCross' });
sty('haircut botoxfomo beauty', { idle: 'IdleMirror', phone: 'IdleMirror' }); sty('lonely ghosted', { walk: 'WalkTired', idle: 'IdleBreath' });
sty('schoolrun toddler tablet homework sugar', { walk: 'WalkQuick' });
const styleFor = (prob) => { const st = Object.assign({ angry: 'IdleAngry' }, PSTYLE[prob] || {}); delete st.walk; return st; }; // everyone walks normally: the symptom shows only when they stop (waiting, sitting), plus the emoji bubble
const EXTRA_VIS = ['v16', 'v08', 'v15', 'v22', 'sp_health', 'sp_safety', 'sp_mystery', 'sp_influencer', 'sp_trainer']; // inspector + the "crew"
function visPerson(key, fb) { if (CHAR.A.full[key]) { const a = person({ vm: key, tall: VIS[key].h / 1.75 }, 'visitor'); if (a.userData.p.glb) return a; } loadFull(key); return person(fb); }
function preloadVisitors(c) { if (CHAR.status !== 'ready' || !CHAR.man || !CHAR.man.visitors) return; for (const k of Object.keys(visPool(c))) loadFull(k); for (const k of EXTRA_VIS.concat(['v25', 'v26', 'v27', 'v28'])) loadFull(k); }
function visitorPose(v) {
  const p = v.av.userData.p, sp = v.state === 'wait' ? v.spot : v.state === 'treat' ? v.rspot : v.state === 'loo' || v.state === 'cafe' || v.state === 'amen' ? v.lspot : v.state === 'shopping' ? v.sspot : null;
  poseStand(p); if (sp && sp.sit) poseSit(p, sp.lie); if (['queue', 'wait', 'shopping'].includes(v.state)) posePhone(p);
}
function swapVisitorAvatar(v) {
  const old = v.av, av = person(v.look, 'visitor'); if (!av.userData.p.glb) return;
  av.position.copy(old.position); av.rotation.copy(old.rotation); scene.remove(old); scene.add(av); av.userData.p.waitPose = old.userData.p.waitPose; if (v.cured && av.userData.p.anim && av.userData.p.anim.calm) av.userData.p.anim.calm(); v.av = av; v.gag = addGag(av, v.prob, v.look); visitorPose(v);
}
// props held in the hands of the special characters (Blender-made, models/props/hp_*): [bone, prop, rotation x/y/z in degrees, offset along the hand]
const HAND_PROPS = { sp_health: [['RightHand', 'hp_pen'], ['LeftHand', 'hp_clipboard']], sp_safety: [['RightHand', 'hp_flashlight'], ['LeftHand', 'hp_tablet']], sp_mystery: [['RightHand', 'hp_notebook']], sp_influencer: [['RightHand', 'hp_selfie']], sp_trainer: [['RightHand', 'hp_clicker'], ['LeftHand', 'hp_tablet']] };
// how each prop sits in the hand, in the character's own space while standing (facing +Z, its left = +X): long axis, which way its face points, offset from the wrist (m)
const HP_POSE = { hp_clipboard: [[0.15, -1, 0.1], [0.3, 0, 1], [0, -0.08, 0.05]], hp_tablet: [[0.15, -1, 0.1], [0.3, 0, 1], [0, -0.08, 0.05]], hp_pen: [[0, -0.6, 1], [0, 1, 0], [0, -0.07, 0.03]],
  hp_flashlight: [[0, -0.5, 1], [0, 1, 0], [0, -0.07, 0.03]], hp_notebook: [[-0.1, -1, 0.2], [-0.3, 0, 1], [0, -0.06, 0.09]], hp_selfie: [[0, 1, 0.25], [0, 0, 1], [0, -0.05, 0.03]], hp_clicker: [[0, -0.3, 1], [0, 1, 0], [0, -0.07, 0.03]] };
function attachHandProps(av, key) {
  const list = HAND_PROPS[key]; if (!list || !PROPS_ON) return; const bones = {}; av.traverse((b) => { if (b.isBone && !bones[b.name]) bones[b.name] = b; });
  for (const [bn, name] of list) { const bone = bones[bn]; if (!bone) continue;
    propModel(name).then((src) => { const m = src.clone(), P = HP_POSE[name]; if (!P) return; const V = (a) => new THREE.Vector3(...a).normalize();
      av.updateMatrixWorld(true); const ws = bone.getWorldScale(new THREE.Vector3()), as = av.getWorldScale(new THREE.Vector3());
      const Y = V(P[0]), Z = V(P[1]).sub(Y.clone().multiplyScalar(V(P[1]).dot(Y))).normalize(), X = new THREE.Vector3().crossVectors(Y, Z);
      const qd = new THREE.Quaternion().setFromRotationMatrix(new THREE.Matrix4().makeBasis(X, Y, Z));
      const aq = av.getWorldQuaternion(new THREE.Quaternion()), bq = bone.getWorldQuaternion(new THREE.Quaternion());
      m.quaternion.copy(bq.clone().invert().multiply(aq).multiply(qd));
      const wp = bone.getWorldPosition(new THREE.Vector3()).add(new THREE.Vector3(...P[2]).multiplyScalar(as.x).applyQuaternion(aq)); bone.worldToLocal(wp); m.position.copy(wp);
      m.scale.setScalar(as.x / (ws.x || 1)); m.traverse((c) => { if (c.isMesh) { c.castShadow = true; c.frustumCulled = false; } }); bone.add(m); }).catch(() => {}); }
}
function person(o, kind) {
  if (kind && canGLB(kind, outfitKey(kind, o))) { try { const a = makeGLBAvatar(o, kind, outfitKey(kind, o)); a.scale.multiplyScalar(CHAR_BOOST); if (o && o.vm && HAND_PROPS[o.vm]) attachHandProps(a, o.vm); return a; } catch (e) { CHAR.errors.push('avatar ' + e.message); } }
  return proceduralPerson(o);
}
function proceduralPerson(o) {
  const root = new THREE.Group(); const body = new THREE.Group(); root.add(body);
  const sx = o.wide || 1, sy = o.tall || 1; body.scale.set(sx, sy, sx);
  const legs = [], knees = [], arms = [];
  for (const s of [-1, 1]) {
    const hip = new THREE.Group(); hip.position.set(s * 0.1, 0.55, 0); body.add(hip);
    put(rbox(0.17, 0.3, 0.19, o.pants, 0.07), 0, -0.15, 0, hip);
    const knee = new THREE.Group(); knee.position.set(0, -0.28, 0); hip.add(knee);
    put(rbox(0.16, 0.25, 0.18, o.pants, 0.06), 0, -0.12, 0, knee);
    put(rbox(0.18, 0.08, 0.26, o.shoes || '#2A2A2E', 0.035), 0, -0.24, 0.04, knee);
    legs.push(hip); knees.push(knee);
  }
  put(rbox(0.5, 0.56, 0.32, o.shirt, 0.15), 0, 0.83, 0, body);
  if (o.coat) put(rbox(0.54, 0.7, 0.36, '#FFFFFF', 0.12), 0, 0.78, 0, body);
  if (o.inner) put(rbox(0.2, 0.4, 0.02, o.inner, 0.01), 0, 0.9, 0.18 + (o.coat ? 0.02 : 0), body);
  if (o.skirt) put(cyl(0.27, 0.36, 0.42, o.skirt), 0, 0.44, 0, body);
  if (o.tie) put(rbox(0.07, 0.3, 0.02, o.tie, 0.01), 0, 0.86, 0.185, body);
  if (o.hood) { const hd = rbox(0.42, 0.14, 0.22, o.shirt, 0.07); put(hd, 0, 1.1, -0.16, body); }
  if (o.apron) put(rbox(0.44, 0.34, 0.04, '#F4EFE6', 0.02), 0, 0.72, 0.17, body);
  if (o.belt) put(rbox(0.54, 0.12, 0.36, '#8B6A45', 0.04), 0, 0.6, 0, body);
  if (o.lanyard) put(rbox(0.1, 0.13, 0.02, '#FFFFFF', 0.01), 0, 0.9, o.coat ? 0.2 : 0.17, body);
  if (o.mat) { const m = cyl(0.09, 0.09, 0.5, '#9B86E0'); m.rotation.z = Math.PI / 2; put(m, 0, 1.05, -0.22, body); }
  if (o.clip) put(rbox(0.22, 0.3, 0.03, '#8B6A45', 0.01), 0.18, 0.85, 0.25, body);
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * 0.3, 1.06, 0); body.add(sh);
    put(rbox(0.13, 0.42, 0.15, o.coat ? '#FFFFFF' : o.shirt, 0.06), 0, -0.2, 0, sh);
    put(sph(0.07, o.skin), 0, -0.43, 0.01, sh); arms.push(sh);
  }
  const phone = rbox(0.13, 0.21, 0.03, '#23262D', 0.015); phone.rotation.x = -0.5; put(phone, 0, 0.98, 0.36, body); phone.visible = false;
  const head = new THREE.Group(); head.position.set(0, 1.38, 0); body.add(head); head.scale.set(1 / sx, 1 / sy, 1 / sx);
  const st = o.style;
  if (st === 'hijab') { put(sph(0.29, o.hair), 0, 0.01, -0.04, head); put(rbox(0.56, 0.28, 0.36, o.hair, 0.14), 0, -0.28, -0.01, head); put(sph(0.215, o.skin), 0, -0.01, 0.07, head); }
  else {
    put(sph(0.25, o.skin), 0, 0, 0, head);
    if (st !== 'bald') { const cap = sph(0.262, o.hair); cap.scale.set(1, 0.72, 1.02); put(cap, 0, 0.08, -0.025, head); } else put(sph(0.06, o.hair), 0, 0.2, -0.18, head);
    if (st === 'long') put(rbox(0.48, 0.5, 0.18, o.hair, 0.08), 0, -0.18, -0.13, head);
    if (st === 'bun') put(sph(0.12, o.hair), 0, 0.3, -0.06, head);
    if (st === 'curly') for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; put(sph(0.11, o.hair), Math.cos(a) * 0.22, 0.12, Math.sin(a) * 0.2 - 0.03, head); }
    if (st === 'beanie') put(cyl(0.25, 0.27, 0.22, o.hair), 0, 0.17, -0.01, head);
    if (st === 'beard') put(rbox(0.36, 0.16, 0.2, o.hair, 0.08), 0, -0.15, 0.13, head);
  }
  if (o.cap) { put(cyl(0.27, 0.27, 0.14, o.cap), 0, 0.2, 0, head); const br = rbox(0.3, 0.03, 0.2, o.cap, 0.01); put(br, 0, 0.14, 0.24, head); }
  if (o.goggles) put(rbox(0.4, 0.08, 0.1, '#BFE6F6', 0.03), 0, 0.2, 0.17, head);
  if (o.nose) put(sph(0.07, o.skin), 0, -0.03, 0.25, head);
  const fz = st === 'hijab' ? 0.27 : 0.235;
  for (const s of [-1, 1]) put(sph(0.034, '#2A2020', { r: 0.3 }), s * 0.085, 0.04, fz - 0.01, head);
  for (const s of [-1, 1]) put(sph(0.04, '#F08C8C', { op: 0.45 }), s * 0.14, -0.05, fz - 0.03, head);
  if (o.glasses) for (const s of [-1, 1]) { const ring = new THREE.Mesh(GC.ring || (GC.ring = new THREE.TorusGeometry(0.065, 0.013, 6, 18)), mat('#2A2020')); put(ring, s * 0.085, 0.04, fz + 0.01, head); }
  if (o.headset) { const hb = new THREE.Mesh(GC.hb || (GC.hb = new THREE.TorusGeometry(0.27, 0.025, 6, 20, Math.PI)), mat('#2F3640')); put(hb, 0, 0.02, 0, head); }
  root.userData.p = { body, legs, knees, arms, phone, head, sy };
  if (GFX.batch) { const od = { owner: root }; batchNode(body, new Set([...legs, ...arms, phone]), { userData: od }); for (const l of legs) batchNode(l, new Set(knees), { userData: od }); for (const k of knees) batchNode(k, new Set(), { userData: od }); for (const a of arms) batchNode(a, new Set(), { userData: od }); }
  root.traverse((m) => { if (m.isMesh) m.userData.owner = root; });
  return root;
}
// people read a bit bigger than life next to the chunky diorama furniture (seat heights, naps and paths all follow av.scale)
const CHAR_BOOST = +(new URLSearchParams(location.search).get('cs') || 1.2);
function poseStand(p) { if (p.anim) return p.anim.set('idle'); p.legs.forEach((l) => l.rotation.x = 0); p.knees.forEach((k) => k.rotation.x = 0); p.arms.forEach((a) => { a.rotation.x = 0; a.rotation.z = 0; }); p.body.position.y = 0; p.phone.visible = false; }
function poseSit(p, lie) { if (p.anim) return p.anim.set(lie ? 'idle' : 'sit'); // lying = the standing idle laid flat by lieUpdate (Meshy's 'lie' clip is a half-sit)
 p.legs.forEach((l) => l.rotation.x = -Math.PI / 2); p.knees.forEach((k) => k.rotation.x = Math.PI / 2); p.arms.forEach((a) => a.rotation.x = -0.5); }
function poseWalk(p, ph, amp = 0.55, speed = 2.3) {
  if (p.anim) return p.anim.set('walk', speed / 2.3);
  p.legs[0].rotation.x = Math.sin(ph) * amp; p.legs[1].rotation.x = -Math.sin(ph) * amp;
  p.knees[0].rotation.x = Math.max(0, -Math.sin(ph)) * 0.7; p.knees[1].rotation.x = Math.max(0, Math.sin(ph)) * 0.7;
  p.arms[0].rotation.x = -Math.sin(ph) * amp * 0.8; p.arms[1].rotation.x = Math.sin(ph) * amp * 0.8;
  p.body.position.y = Math.abs(Math.sin(ph)) * 0.05;
}
function poseWork(p, sit) { if (p.anim) return p.anim.set(sit ? 'worksit' : 'work'); if (sit) poseSit(p); }
function posePhone(p) { if (p.anim) { const sit = /sit/i.test(p.anim.state || ''); return p.anim.set(sit ? (p.waitPose === 'idle' ? 'sit' : 'sitphone') : p.waitPose || 'phone'); } p.arms.forEach((a) => a.rotation.x = -1.1); p.phone.visible = true; }

// ---------------- world ----------------
// spd: treatment speed — the bigger room is better equipped (regular +30%, large +15% on each of its 2 stations)
const SIZES = { s: { W: 4, D: 4, st: 1, cost: 0.7, vibe: 0.4, cafe: 0.8, spd: 1 }, m: { W: 6, D: 6, st: 1, cost: 1, vibe: 0.9, cafe: 0.7, spd: 1.3 }, l: { W: 8, D: 6, spd: 1.15, st: 2, cost: 1.8, vibe: 1.5, cafe: 0.6 } };
const roomCost = (type, size) => Math.round(ROOMS[type].cost * SIZES[size].cost / 50) * 50;
function roomRect(r) { const z = SIZES[r.size]; const side = Math.abs(Math.sin(r.a)) > 0.5; const w = side ? z.D : z.W, d = side ? z.W : z.D; return { x0: r.x - w / 2, x1: r.x + w / 2, z0: r.z - d / 2, z1: r.z + d / 2, w, d }; }
const toW = (r, lx, lz) => ({ x: r.x + lx * Math.cos(r.a) + lz * Math.sin(r.a), z: r.z - lx * Math.sin(r.a) + lz * Math.cos(r.a) });
const doorPt = (r, out = 0) => toW(r, 0, SIZES[r.size].D / 2 + out);
// --- walk grid (0.5 m cells) + A* ---
const G0x = -30, G0z = -32, GCs = 0.25, GW = 240, GH = 184; // 25 cm cells: fine enough to walk round a desk instead of clipping its corner
let gridBlk = new Uint8Array(GW * GH);
// which room each cell is in (0 = hall/corridor) and where each room's door is: a step may only change room through a door, so nobody walks through a wall
let gridRid = new Int16Array(GW * GH), gridDoors = [null];
function crossOK(a, b) { const ra = gridRid[a], rb = gridRid[b]; if (ra === rb) return true;
  const ia = a % GW, ib = b % GW, mx = G0x + ((ia + ib) / 2 + 0.5) * GCs, mz = G0z + (((a - ia) / GW + (b - ib) / GW) / 2 + 0.5) * GCs;
  for (const r of [ra, rb]) if (r) { const d = gridDoors[r]; if (!d || Math.hypot(mx - d.x, mz - d.z) > 0.6) return false; }
  return true; }
const ci = (x, z) => [Math.floor((x - G0x) / GCs), Math.floor((z - G0z) / GCs)];
const cc = (i, j) => ({ x: G0x + (i + 0.5) * GCs, z: G0z + (j + 0.5) * GCs });
const PLOTS = {
  // every edge sits on the 2 m room module (x ≡ 0.5 mod 2): 4, 6 and 8 m rooms plus 2 m corridors tile with no leftover strips
  london: { main: [[-13.5, 6.5, -7.5, 6.5]], lots: [[6.5, 14.5, -7.5, 6.5], [-19.5, -13.5, -7.5, 6.5]], cost: 8000 },
  lagos: { main: [[-17.5, 6.5, -3.5, 6.5], [-5.5, 2.5, -11.5, -3.5]], lots: [[6.5, 14.5, -3.5, 6.5], [-17.5, -5.5, -11.5, -3.5]], cost: 9000 },
  mumbai: { main: [[-11.5, 6.5, -7.5, 6.5], [-11.5, -1.5, -13.5, -7.5]], lots: [[6.5, 12.5, -1.5, 6.5], [-1.5, 6.5, -13.5, -7.5]], cost: 12000 },
  seoul: { main: [[-9.5, 6.5, -7.5, 6.5], [-15.5, 2.5, -13.5, -7.5]], lots: [[-15.5, -9.5, -7.5, 2.5], [6.5, 12.5, -7.5, 6.5]], cost: 12000 },
  newyork: { main: [[-11.5, 6.5, -11.5, 6.5]], lots: [[6.5, 12.5, -11.5, 6.5], [-17.5, -11.5, -5.5, 6.5]], cost: 18000 },
  mexico: { main: [[-13.5, 6.5, -9.5, 6.5], [-19.5, -13.5, -3.5, 6.5]], lots: [[6.5, 14.5, -9.5, 2.5], [-19.5, -13.5, -11.5, -3.5]], cost: 14000 },
  cairo: { main: [[-15.5, 6.5, -9.5, 6.5]], holes: [[-15.5, -9.5, -9.5, -5.5]], lots: [[6.5, 14.5, -9.5, 2.5], [-15.5, -5.5, -15.5, -9.5]], cost: 13000 },
  saopaulo: { main: [[-17.5, 6.5, -11.5, 6.5]], holes: [[-11.5, -3.5, -7.5, -1.5]], lots: [[6.5, 14.5, -11.5, 0.5], [-21.5, -17.5, -11.5, 4.5]], cost: 14000 },
};
for (const P of Object.values(PLOTS)) { const zb = Math.min(...P.main.concat(P.lots).map((r) => r[2])); for (const r of P.main.concat(P.lots)) if (r[2] === zb) r[2] -= 2; } // every plot 2 m deeper at the back (bigger HQ); the back lots move back with it, so a room already built keeps its ground
for (const P of Object.values(PLOTS)) { const rs = P.main.concat(P.lots), x0 = Math.min(...rs.map((r) => r[0])), x1 = Math.max(...rs.map((r) => r[1])), z0 = Math.min(...rs.map((r) => r[2])), z1 = Math.max(...rs.map((r) => r[3]));
  P.lots.push([x0, x1, z0 - 8, z0], [x0, x1, z0 - 16, z0 - 8], [x1, x1 + 8, z0 - 16, z1]); }
const plotOf = (c) => PLOTS[c || (S && S.city) || 'london'] || PLOTS.london;
const inR = (r, x, z) => x > r[0] && x < r[1] && z > r[2] && z < r[3];
const lotSt = (i) => (!S ? 'locked' : i === 0 ? S.annex || 'locked' : i === 1 ? S.annex2 || 'locked' : (S.lotsX && S.lotsX[i]) || 'locked');
const lotDay = (i) => (i === 0 ? S.annexDay : i === 1 ? S.annexDay2 || 0 : (S.lotsXDay && S.lotsXDay[i]) || 0);
function setLot(i, st, day) { if (i === 0) { S.annex = st; if (day != null) S.annexDay = day; } else if (i === 1) { S.annex2 = st; if (day != null) S.annexDay2 = day; } else { (S.lotsX = S.lotsX || {})[i] = st; if (day != null) (S.lotsXDay = S.lotsXDay || {})[i] = day; } }
// land is priced by the square metre (one rate per city, each further lot a bit dearer), and every owned lot adds to the weekly rent
const LAND_M2 = { london: 110, lagos: 100, mumbai: 180, seoul: 200, newyork: 250, mexico: 150, cairo: 130, saopaulo: 150 }, ANNEX_RENT_K = 0.25;
const rArea = (r) => (r[1] - r[0]) * (r[3] - r[2]);
const lotArea = (i, c) => rArea(plotOf(c).lots[i]);
const mainArea = (c) => plotOf(c).main.reduce((a, r) => a + rArea(r), 0) - (plotOf(c).holes || []).reduce((a, r) => a + rArea(r), 0);
const lotCost = (i, c) => Math.max(2000, Math.round(lotArea(i, c) * (LAND_M2[c || (S && S.city) || 'london'] || 150) * (i < 2 ? 1 + 0.15 * i : 0.45 + 0.05 * (i - 2)) / 500) * 500); // the 3 big back plots (index 2+) are huge: bulk land, cheaper per m²
const lotRent = (i, c) => { const C = CITIES[c || (S && S.city) || 'london']; return Math.round(C.rent * BILL_K / mainArea(c) * lotArea(i, c) * ANNEX_RENT_K / 50) * 50; };
const annexRent = () => (S && S.mode === 'career' ? plotOf().lots.reduce((a, _, i) => a + (lotSt(i) === 'owned' ? lotRent(i) : 0), 0) : 0);
function setRent() { RENT = Math.round(CITIES[S.city || 'london'].rent * BILL_K / 50) * 50 + annexRent(); }
const lotOpen = (i) => i < 2 || lotSt(i - 1) === 'owned'; // the big extra lots open one after another
const ownedLots = (c) => plotOf(c).lots.map((_, i) => !!(S && (!c || S.city === c) && lotSt(i) === 'owned'));
function inFloorC(c, own, x, z) { const P = plotOf(c); if ((P.holes || []).some((h) => inR(h, x, z))) return false; if (P.main.some((r) => inR(r, x, z))) return true; return P.lots.some((L, i) => own[i] && inR(L, x, z)); }
function inFloor(x, z) { return inFloorC(null, ownedLots(), x, z); }
function plotBox(c) { const P = plotOf(c), rs = P.main.concat(P.lots); return [Math.min(...rs.map((r) => r[0])), Math.max(...rs.map((r) => r[1])), Math.min(...rs.map((r) => r[2])), Math.max(...rs.map((r) => r[3]))]; }
function plazaX(c) { const b = plotBox(c); return [b[0] - 1.6, b[1] + 1.2]; }
function baseWalk(x, z) { if (inFloor(x, z)) return true; const [a, b] = plazaX(); return x > a && x < b && z > 6.5 && z < 12.6; }
const LOB = 0.5; // lobby inner edge, on the room module
function buildable(x, z) { return inFloor(x, z) && !(x > LOB && x < 6.5 && z > LOB && z < 6.5); }
function reachIn(blk, a, b, q) { // flood fill limited to the room rectangle
  const [si, sj] = ci(a.x, a.z), [ti, tj] = ci(b.x, b.z), [i0, j0] = ci(q.x0, q.z0), [i1, j1] = ci(q.x1, q.z1); const seen = new Set([si + sj * GW]), st = [[si, sj]];
  while (st.length) { const [i, j] = st.pop(); if (Math.abs(i - ti) + Math.abs(j - tj) <= 1) return true;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj, k = ni + nj * GW; if (ni < i0 || nj < j0 || ni > i1 || nj > j1 || seen.has(k) || blk[k]) continue; seen.add(k); st.push([ni, nj]); } }
  return false;
}
// cheapest way in from the door when furniture boxes a spot in: Dijkstra over the room, a furniture cell costs 25, returns the furniture cells to clear
function carveLane(blk, a, b, q, own = []) { // own: the seat/bed's own boxes, cheap to cross (you climb onto your own bed, not over your neighbour's)
  const [si, sj] = ci(a.x, a.z), [ti, tj] = ci(b.x, b.z), [i0, j0] = ci(q.x0 + 0.3, q.z0 + 0.3), [i1, j1] = ci(q.x1 - 0.3, q.z1 - 0.3), dist = new Map(), prev = new Map(), open = [[0, si + sj * GW]];
  dist.set(si + sj * GW, 0);
  while (open.length) { let bi = 0; for (let k = 1; k < open.length; k++) if (open[k][0] < open[bi][0]) bi = k; const [dc, n] = open.splice(bi, 1)[0]; if (dc > dist.get(n)) continue;
    const i = n % GW, j = (n - i) / GW; if (i === ti && j === tj) break;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj, m = ni + nj * GW; if (ni < i0 || nj < j0 || ni > i1 || nj > j1) continue; const p = cc(ni, nj), c = dc + (!blk[m] ? 1 : own.some((o) => p.x > o[0] - 0.15 && p.x < o[1] + 0.15 && p.z > o[2] - 0.15 && p.z < o[3] + 0.15) ? 3 : 25); if (c < (dist.has(m) ? dist.get(m) : 1e9)) { dist.set(m, c); prev.set(m, n); open.push([c, m]); } } }
  const out = []; let n = ti + tj * GW; while (prev.has(n)) { if (blk[n]) out.push(n); n = prev.get(n); } return out;
}
function markRoom(r, blk) {
  const q = roomRect(r), dp = doorPt(r, 0), rm = R.rooms && R.rooms[r.id];
  if (rm && rm.obs) { const keep = rm.spots.concat(rm.staffSpots.filter(Boolean)).concat([doorPt(r, -0.6)]);
    for (const b of rm.obs) { const [i0, j0] = ci(b[0] - 0.18, b[2] - 0.18), [i1, j1] = ci(b[1] + 0.18, b[3] + 0.18);
      for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { if (i < 0 || j < 0 || i >= GW || j >= GH) continue; const p = cc(i, j); if (keep.some((k) => Math.hypot(k.x - p.x, k.z - p.z) < 0.36)) continue; blk[j * GW + i] = 1; } }
    // never wall a seat off: if a spot can't be reached from the door, clear the cheapest lane to it
    const din = doorPt(r, -0.6);
    for (const k of keep) { if (reachIn(blk, din, k, q)) continue; const own = rm.obs.filter((o) => k.x > o[0] - 0.05 && k.x < o[1] + 0.05 && k.z > o[2] - 0.05 && k.z < o[3] + 0.05); for (const n of carveLane(blk, din, k, q, own)) blk[n] = 0; // the fewest furniture cells, not a straight line through the desk
    } }
  const [i0, j0] = ci(q.x0 + 0.01, q.z0 + 0.01), [i1, j1] = ci(q.x1 - 0.01, q.z1 - 0.01);
  for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
    if (i < 0 || j < 0 || i >= GW || j >= GH) continue;
    const p = cc(i, j); const ring = p.x - q.x0 < 0.5 || q.x1 - p.x < 0.5 || p.z - q.z0 < 0.5 || q.z1 - p.z < 0.5;
    if (ring && Math.hypot(p.x - dp.x, p.z - dp.z) > 0.6) blk[j * GW + i] = 1;
  }
  { const M = 0.3, [a0, b0] = ci(q.x0 - M, q.z0 - M), [a1, b1] = ci(q.x1 + M, q.z1 + M); // keep walkers off the outside of the walls too (their bodies brushed through them), except in front of the door
    for (let j = b0; j <= b1; j++) for (let i = a0; i <= a1; i++) { if (i < 0 || j < 0 || i >= GW || j >= GH) continue; const p = cc(i, j); if (p.x > q.x0 && p.x < q.x1 && p.z > q.z0 && p.z < q.z1) continue; if (Math.hypot(p.x - dp.x, p.z - dp.z) < 0.95) continue; blk[j * GW + i] = 1; } }
}
function markObstacles(blk) {
  const box = (cx, cz, w, d, rot) => { const c = Math.cos(rot || 0), s = Math.sin(rot || 0), R = Math.hypot(w, d) / 2 + 0.3;
    const [i0, j0] = ci(cx - R, cz - R), [i1, j1] = ci(cx + R, cz + R);
    for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) { if (i < 0 || j < 0 || i >= GW || j >= GH) continue; const p = cc(i, j), dx = p.x - cx, dz = p.z - cz, lx = dx * c - dz * s, lz = dx * s + dz * c; if (Math.abs(lx) < w / 2 + 0.15 && Math.abs(lz) < d / 2 + 0.15) blk[j * GW + i] = 1; } };
  if (!S) return;
  if (S.desk) for (const D of desks()) box(D.x, D.z, 2.5, 0.9, D.r);
  for (const [x, z] of LOBBY_PLANTS) box(x, z, 0.5, 0.5, 0);
  for (const d of S.decor || []) if (!(DECOR[d.k] && DECOR[d.k].flat)) box(d.x, d.z, d.k === 'sofa' ? 2.2 : DECOR[d.k] && DECOR[d.k].len ? DECOR[d.k].len : 0.7, d.k === 'sofa' ? 0.9 : DECOR[d.k] && DECOR[d.k].len ? 0.55 : 0.7, d.r || 0); // a doormat is walked on
}
function makeGrid(rooms) {
  const blk = new Uint8Array(GW * GH);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) { const p = cc(i, j); blk[j * GW + i] = baseWalk(p.x, p.z) ? 0 : 1; }
  for (const r of rooms) markRoom(r, blk);
  markObstacles(blk);
  if (blk !== undefined && rooms === (S && S.rooms)) { const rid = new Int16Array(GW * GH), doors = [null];
    rooms.forEach((r, k) => { const q = roomRect(r), [i0, j0] = ci(q.x0 + 0.01, q.z0 + 0.01), [i1, j1] = ci(q.x1 - 0.01, q.z1 - 0.01); doors.push(doorPt(r, 0));
      for (let j = Math.max(0, j0); j <= Math.min(GH - 1, j1); j++) for (let i = Math.max(0, i0); i <= Math.min(GW - 1, i1); i++) rid[j * GW + i] = k + 1; });
    gridRid = rid; gridDoors = doors; }
  return blk;
}
function rebuildGrid() { gridBlk = makeGrid(S.rooms); }
// furniture footprints become obstacles for the walk grid (people go around sofas, desks, poufs, beds…): every mesh between knee and chest height
// built-in-code pieces are measured once, before batching merges them into one big mesh; the 3D-model pieces (swap groups, never batched) every time one loads; rugs are walked on
function roomObs(room) { const g = room.g; g.updateMatrixWorld(true); const skip = new Set([...(room.wallG || []), room.door && room.door.g]), bx = new THREE.Box3(), first = !room.obs0, st = [], sw = [];
  const walk = (o, inSw) => { for (const c of o.children) { if (skip.has(c) || c.userData.noObs || /rug|carpet|playmat/i.test(c.userData.glb || '')) continue; const s2 = inSw || !!c.userData.swap;
    if (c.isMesh && (s2 || first)) { bx.setFromObject(c); const sx = bx.max.x - bx.min.x, sz = bx.max.z - bx.min.z; if (bx.max.y > 0.3 && bx.min.y < 1.0 && sx < 3.6 && sz < 3.6 && sx * sz > 0.01) (s2 ? sw : st).push([bx.min.x, bx.max.x, bx.min.z, bx.max.z]); }
    if (s2 || first) walk(c, s2); else if (c.children.length) walk(c, false); } };
  walk(g, false); if (first) room.obs0 = st; room.obs = room.obs0.concat(sw).concat(room.obsX || []); } // obsX: shapes the measuring can't see (the ring's ropes, with its stairs left open)
// the Tripo/Meshy pieces load after the room is built: once they are in, measure the room again so people walk around the real furniture
let obsT = null; const obsDirty = new Set();
function roomObsLater(rid) { obsDirty.add(rid); clearTimeout(obsT); obsT = setTimeout(() => { let any = false; for (const id of obsDirty) { const rm = R.rooms && R.rooms[id]; if (rm && rm.g && rm.g.parent) { roomObs(rm); any = true; } } obsDirty.clear(); if (any && S && S.rooms) rebuildGrid(); }, 120); }
const free = (blk, i, j) => i >= 0 && j >= 0 && i < GW && j < GH && !blk[j * GW + i];
function reach(blk, from, to) {
  const [si, sj] = ci(from.x, from.z), [ti, tj] = ci(to.x, to.z); if (!free(blk, ti, tj)) return false;
  const seen = new Uint8Array(GW * GH), q = [si + sj * GW]; seen[q[0]] = 1;
  while (q.length) { const c = q.pop(), i = c % GW, j = (c - i) / GW; if (i === ti && j === tj) return true;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj; if (free(blk, ni, nj) && !seen[nj * GW + ni]) { seen[nj * GW + ni] = 1; q.push(nj * GW + ni); } } }
  return false;
}
// exact grid traversal (every cell the segment touches, both cells at a corner); cb(i, j, pi, pj) must accept each step
function walkCells(ax, az, bx, bz, cb) {
  let [i, j] = ci(ax, az); const [ti, tj] = ci(bx, bz), dx = bx - ax, dz = bz - az, sx = Math.sign(dx), sz = Math.sign(dz);
  const tdx = dx ? GCs / Math.abs(dx) : Infinity, tdz = dz ? GCs / Math.abs(dz) : Infinity;
  let tmx = dx ? (sx > 0 ? G0x + (i + 1) * GCs - ax : ax - (G0x + i * GCs)) / Math.abs(dx) : Infinity, tmz = dz ? (sz > 0 ? G0z + (j + 1) * GCs - az : az - (G0z + j * GCs)) / Math.abs(dz) : Infinity;
  for (let n = 0; n < 2400 && (i !== ti || j !== tj); n++) {
    const pi = i, pj = j;
    if (Math.abs(tmx - tmz) < 1e-9) { if (!cb(i + sx, j, pi, pj) || !cb(i, j + sz, pi, pj)) return false; i += sx; j += sz; tmx += tdx; tmz += tdz; }
    else if (tmx < tmz) { i += sx; tmx += tdx; } else { j += sz; tmz += tdz; }
    if (!cb(i, j, pi, pj)) return false;
  }
  return true;
}
// straight walk a→b allowed? no blocked cell on the way (the end may be a seat), and no wall crossed — checked on the centre line and on both shoulders
function los(a, b, o) {
  const [ti, tj] = ci(b.x, b.z), [oi, oj] = ci((o || a).x, (o || a).z), inB = (i, j) => i >= 0 && j >= 0 && i < GW && j < GH;
  const end = (i, j) => (Math.abs(i - ti) <= 1 && Math.abs(j - tj) <= 1) || (Math.abs(i - oi) <= 1 && Math.abs(j - oj) <= 1);
  const step = (i, j, pi, pj, centre) => { if (!inB(i, j) || !inB(pi, pj)) return false; if (gridBlk[j * GW + i] && (centre ? !(i === ti && j === tj) : !end(i, j))) return false; return crossOK(pj * GW + pi, j * GW + i); };
  if (!walkCells(a.x, a.z, b.x, b.z, (i, j, pi, pj) => step(i, j, pi, pj, true))) return false;
  const d = Math.hypot(b.x - a.x, b.z - a.z); if (d < 0.05) return true; const nx = -(b.z - a.z) / d * 0.2, nz = (b.x - a.x) / d * 0.2;
  for (const k of [1, -1]) if (!walkCells(a.x + nx * k, a.z + nz * k, b.x + nx * k, b.z + nz * k, (i, j, pi, pj) => step(i, j, pi, pj, false))) return false;
  return true;
}
let VIA_SPOTS = [];
function findPath(from, to, loose) {
  if (!loose && to && to.via && Math.hypot(from.x - to.via.x, from.z - to.via.z) > 0.05) return findPath(from, to.via).concat([{ x: to.x, z: to.z }]); // into a cubicle: to its door first, then straight in
  if (!loose && from) { const vs = VIA_SPOTS.find((s) => s !== to && R.rooms[s.room0.id] === s.room0 && Math.hypot(s.x - from.x, s.z - from.z) < 0.35); if (vs) return [{ x: vs.via.x, z: vs.via.z }].concat(findPath(vs.via, to)); } // out of a cubicle: straight out of its door first
  if (!Number.isFinite(to.x) || !Number.isFinite(to.z) || !Number.isFinite(from.x) || !Number.isFinite(from.z)) { console.warn('[findPath] bad point', JSON.stringify(from), JSON.stringify(to), new Error().stack.split('\n').slice(2, 5).join(' | ')); return []; }
  const [si, sj] = ci(from.x, from.z), [ti, tj] = ci(to.x, to.z);
  const N = GW * GH, inB = (i, j) => i >= 0 && j >= 0 && i < GW && j < GH;
  if (inB(si, sj) && !inB(ti, tj)) { const ex = clamp(to.x, G0x + 0.3, G0x + GW * GCs - 0.3), ez = clamp(to.z, G0z + 0.3, G0z + GH * GCs - 0.3); return findPath(from, { x: ex, z: ez }).concat([{ x: to.x, z: to.z }]); } // leaving the map: walk to its edge properly, then out
  if (!inB(si, sj) || !inB(ti, tj)) return [{ x: to.x, z: to.z }];
  const gS = new Float32Array(N).fill(1e9), par = new Int32Array(N).fill(-1), closed = new Uint8Array(N);
  const s = sj * GW + si, tg = tj * GW + ti; gS[s] = 0; const open = [[Math.hypot(ti - si, tj - sj), s]];
  const hpush = (e) => { open.push(e); let i = open.length - 1; while (i) { const p = (i - 1) >> 1; if (open[p][0] <= open[i][0]) break; [open[p], open[i]] = [open[i], open[p]]; i = p; } };
  const hpop = () => { const top = open[0], last = open.pop(); if (open.length) { open[0] = last; let i = 0; for (;;) { const l = 2 * i + 1, r = l + 1; let m = i; if (l < open.length && open[l][0] < open[m][0]) m = l; if (r < open.length && open[r][0] < open[m][0]) m = r; if (m === i) break; [open[m], open[i]] = [open[i], open[m]]; i = m; } } return top; };
  // someone standing on a blocked cell (a seat against the wall, a staff spot) may step out through blocked cells of their own room; same to reach a blocked target
  const sB = gridBlk[s], tB = gridBlk[tg], R0 = loose ? 6 : 3, near = (n, c) => { const a = n % GW, b = c % GW; return Math.abs(a - b) <= R0 && Math.abs((n - a) / GW - (c - b) / GW) <= R0; };
  const ok = (i, j, from) => { if (!inB(i, j)) return false; const n = j * GW + i; if (from != null && !crossOK(from, n)) return false;
    return !gridBlk[n] || n === tg || n === s || (loose && sB && gridRid[n] && gridRid[n] === gridRid[s]) || (loose && tB && gridRid[n] && gridRid[n] === gridRid[tg]) || (sB && near(n, s)) || (tB && near(n, tg)); };
  let found = false, best = s, bh = 1e9;
  while (open.length) {
    const [, c] = hpop();
    if (closed[c]) continue; closed[c] = 1; if (c === tg) { found = true; break; }
    const i = c % GW, j = (c - i) / GW, hh = Math.hypot(ti - i, tj - j); if (hh < bh) { bh = hh; best = c; }
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) {
      const ni = i + di, nj = j + dj; if (!ok(ni, nj, c)) continue;
      if (di && dj && (!ok(i + di, j, c) || !ok(i, j + dj, c))) continue;
      const n = nj * GW + ni, ng = gS[c] + (di && dj ? 1.414 : 1) + (gridBlk[n] && n !== tg ? 12 : 0); // squeezing past furniture only when there's no other way
      if (ng < gS[n]) { gS[n] = ng; par[n] = c; hpush([ng + Math.hypot(ti - ni, tj - nj), n]); }
    }
  }
  if (!found && !loose) return findPath(from, to, true); // boxed in (a piece just landed on someone): the old, softer rules get them out
  const end = found ? tg : best;
  if (end === s) return found ? [{ x: to.x, z: to.z }] : []; // never a straight line through a wall
  const cells = []; for (let c = end; c !== -1 && c !== s; c = par[c]) cells.push(c); cells.reverse();
  const pts = cells.map((c) => cc(c % GW, (c - (c % GW)) / GW)); if (found) pts[pts.length - 1] = { x: to.x, z: to.z };
  const out = []; let cur = { x: from.x, z: from.z }, k = 0;
  while (k < pts.length) { let far = k; for (let m = pts.length - 1; m > k; m--) if (los(cur, pts[m], from)) { far = m; break; } out.push(pts[far]); cur = pts[far]; k = far + 1; }
  return out;
}
const W_H = 2.6, T = 0.24;
function wallSeg(x0, z0, x1, z1, h, c, parent) {
  const alongX = Math.abs(z1 - z0) < 1e-6, len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0);
  put(rbox(alongX ? len : T, h, alongX ? T : len, c, 0.04), (x0 + x1) / 2, h / 2 + 0.1, (z0 + z1) / 2, parent);
  put(rbox(alongX ? len + 0.02 : T + 0.05, 0.07, alongX ? T + 0.05 : len + 0.02, '#FFFFFF', 0.03), (x0 + x1) / 2, h + 0.13, (z0 + z1) / 2, parent);
}
const FLOOR_KIND = { cafe: 'herring', budget: 'herring', career: 'herring', moving: 'herring', garage: 'herring', roda: 'herring', toilet: 'check', pharmacy: 'check', lab: 'check', jjim: 'check', lucha: 'check',
  nap: 'carpet', detox: 'carpet', yoga: 'carpet', therapy: 'carpet', social: 'carpet', parent: 'carpet', staffroom: 'terrazzo', glowup: 'terrazzo', wedding: 'terrazzo', ahwa: 'terrazzo', lobby: 'terrazzo' };
const FLOOR_TILE = { herring: 2.4, check: 2.0, carpet: 2.0, terrazzo: 2.0 }, floorTex = {};
function floorMat(kind, w, d) { // one material per (kind, size) so the pattern keeps its real scale in every room
  const key = 'fl|' + kind + '|' + w.toFixed(2) + 'x' + d.toFixed(2);
  if (!MC[key]) {
    const base = floorTex[kind] || (floorTex[kind] = new THREE.TextureLoader().load('assets/floor_' + kind + '.jpg', (tx) => { tx.needsUpdate = true; }));
    base.colorSpace = THREE.SRGBColorSpace; const tx = base.clone(); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(w / FLOOR_TILE[kind], d / FLOOR_TILE[kind]);
    if (kind === 'herring') { tx.center.set(0.5, 0.5); tx.rotation = Math.PI / 4; } // planks at 45°, like the reference
    tx.anisotropy = 4; MC[key] = new THREE.MeshStandardMaterial({ color: '#FFFFFF', roughness: kind === 'carpet' ? 1 : 0.8, map: tx });
  }
  return MC[key];
}
// preview, London: a lot you can buy is a lush little garden like the reference painting: striped lawn, clipped hedge border,
// flower beds in the corners, a gravel path, a round tree and a bench
const LAWN_TEX = (rep) => canvasTex(128, 128, (g) => { g.fillStyle = '#6CAF48'; g.fillRect(0, 0, 128, 128); g.fillStyle = '#79BB53'; g.fillRect(0, 0, 64, 128);
  for (let k = 0; k < 220; k++) { g.fillStyle = k % 2 ? 'rgba(40,110,30,0.16)' : 'rgba(255,255,200,0.14)'; g.fillRect((k * 37) % 128, (k * 59) % 128, 2, 4); } }, rep);
const GARDEN = { // lawn, hedge greens, flowers, tree model and its stand-in colour; dry = gravel garden with a small lawn
  london: { tree: 'lon_plane', tc: '#4FAE44', fl: ['#FF6F91', '#FFD25E', '#FF4F5E', '#FFFFFF', '#B57BE8', '#FF9F43', '#FF8FC8'] },
  newyork: { tree: 'tree', tc: '#5FA05A', fl: ['#FF4F5E', '#FFD25E', '#FFFFFF', '#FF8FC8', '#FF9F43'] },
  saopaulo: { tree: 'sp_ipe_y', tc: '#F2C230', fl: ['#FFD25E', '#FF6F91', '#FFFFFF', '#FF9F43', '#B57BE8'] },
  mexico: { tree: 'sp_ipe_p', tc: '#9B7FD6', fl: ['#E83E8C', '#FF9F43', '#FFD25E', '#C2185B', '#FFFFFF'] },
  seoul: { tree: 'sp_ipe_p', tc: '#F4A7C3', fl: ['#FF8FC8', '#FF6F91', '#FFFFFF', '#FFD25E', '#E2C2FF'] },
  lagos: { tree: 'pt_palm', tree2: 'pt_flame', tc: '#4E9E58', fl: ['#E8452E', '#F08A3C', '#F2C14E', '#D9487E', '#FFFFFF'], lush: 1, nat: 1 },
  mumbai: { tree: 'sp_palm', tc: '#4E9E58', fl: ['#FF9F43', '#FFD25E', '#FF3B3B', '#E83E8C', '#FFFFFF'], lush: 1 },
  cairo: { tree: 'sp_palm', tc: '#4E9E58', fl: ['#E83E8C', '#C2185B', '#FF9F43', '#FFFFFF', '#FFD25E'], dry: 1 },
};
// preview London: every buyable lot is a small London park, after the reference painting: natural lawn, a winding gravel path from the
// gate, a centrepiece that changes from lot to lot (duck pond, fountain, flower roundel, bandstand), flower beds by the path, groves of
// mixed trees on the edges, benches and lamps, a low hedge with openings
const LAWN_BLADES = false;
const LAWN_NAT = () => GC.lawnNat || (GC.lawnNat = canvasTex(256, 256, (c, W) => { c.fillStyle = '#6F9450'; c.fillRect(0, 0, W, W); let sd = 21; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 70; i++) { const g = c.createRadialGradient(0, 0, 0, 0, 0, 1); const dark = rr() < 0.5; g.addColorStop(0, dark ? 'rgba(70,120,50,0.09)' : 'rgba(170,210,110,0.08)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.save(); c.translate(rr() * W, rr() * W); c.scale(20 + rr() * 40, 20 + rr() * 40); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 1, 0, 6.3); c.fill(); c.restore(); }
  for (let i = 0; i < 2500; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(60,110,40,0.18)' : 'rgba(200,235,150,0.16)'; c.fillRect(rr() * W, rr() * W, 1, 2 + rr() * 2); }
  c.fillStyle = 'rgba(255,255,235,0.07)'; c.fillRect(0, 0, W, W / 2); }, [1, 1])); // faint mowing bands, 2 m wide
function lotRibbon(pts, wid, m, y, g) { // a flat path of width wid along a smooth curve through pts ([x, z] in g space)
  const P = []; for (let k = 0; k < pts.length - 1; k++) { const p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
    for (let t = 0; t < 1; t += 0.1) { const t2 = t * t, t3 = t2 * t; P.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
  P.push(pts[pts.length - 1]); const pos = [], idx = [];
  P.forEach((p, k) => { const a = P[Math.max(0, k - 1)], b = P[Math.min(P.length - 1, k + 1)]; let dx = b[0] - a[0], dz = b[1] - a[1]; const l = Math.hypot(dx, dz) || 1; dx /= l; dz /= l;
    pos.push(p[0] - dz * wid / 2, y, p[1] + dx * wid / 2, p[0] + dz * wid / 2, y, p[1] - dx * wid / 2); if (k) { const o = (k - 1) * 2; idx.push(o, o + 2, o + 1, o + 1, o + 2, o + 3); } }); // wound to face up
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, m); mesh.receiveShadow = true; g.add(mesh);
  for (let k = 0; k < P.length; k += 3) { const d = new THREE.Mesh(GC.pathDot || (GC.pathDot = new THREE.CylinderGeometry(1, 1, 0.02, 16)), m); d.scale.set(wid / 2, 1, wid / 2); d.position.set(P[k][0], y, P[k][1]); g.add(d); } // round the joins
  return P;
}
function lotParkLondon(L, i, g) {
  const w = L[1] - L[0], d = L[3] - L[2], cx = (L[0] + L[1]) / 2, cz = (L[2] + L[3]) / 2; let sd = i * 7 + 5; const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  const Y = -0.24, sgn = i % 2 ? -1 : 1;
  put(rbox(w - 0.2, 0.3, d - 0.2, '#8C6B4E', 0.06), cx, -0.4, cz, g);
  const lm = mat('#FFFFFF', { r: 0.95, map: LAWN_NAT(), mapK: 'lawnNat' }); const lf = floorPlane(L[0] + 0.1, L[1] - 0.1, L[2] + 0.1, L[3] - 0.1, lm, Y, g);
  { const uv = lf.geometry.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * w / 4, uv.getY(k) * d / 4); } // lawn texture at a fixed 4 m scale
  // low hedge with a gate on the street side and a gap on one side
  const gate = [cx - 0.8, cx + 0.8], gapZ = [cz - 0.8 + sgn * d * 0.18, cz + 0.8 + sgn * d * 0.18], HG = ['#3D6E33', '#4A7D3D'], hh = 0.42, ht = 0.42;
  const hedge = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0); if (len < 0.4) return; const ax = Math.abs(z1 - z0) < 1e-6 ? 'x' : 'z';
    put(rbox(ax === 'x' ? len : ht, hh, ax === 'x' ? ht : len, HG[0], 0.18), (x0 + x1) / 2, Y + hh / 2, (z0 + z1) / 2, g);
    for (let t = 0.22; t < len - 0.1; t += 0.4) { const b = sph(0.17 + rr() * 0.05, HG[1], { r: 0.9 }); b.scale.y = 0.7; put(b, ax === 'x' ? x0 + t : x0, Y + hh - 0.02, ax === 'x' ? z0 : z0 + t, g); } };
  const e = 0.32, sx = sgn > 0 ? L[1] - e : L[0] + e, ox = sgn > 0 ? L[0] + e : L[1] - e;
  hedge(L[0] + e, L[2] + e, L[1] - e, L[2] + e); hedge(ox, L[2] + e, ox, L[3] - e);
  hedge(sx, L[2] + e, sx, gapZ[0]); hedge(sx, gapZ[1], sx, L[3] - e);
  hedge(L[0] + e, L[3] - e, gate[0], L[3] - e); hedge(gate[1], L[3] - e, L[1] - e, L[3] - e);
  // winding gravel path: street gate -> around the centrepiece -> out through the side gap
  const fx = cx - sgn * w * 0.08, fz = cz - d * 0.08, fr = Math.min(1.5, w * 0.2);
  const pm = mat('#E7D3AA', { r: 1 });
  const PP = lotRibbon([[cx, L[3] - 0.1], [cx + sgn * 0.5, L[3] - d * 0.22], [fx + sgn * (fr + 0.9), fz + fr * 0.6], [fx + sgn * (fr + 0.7), fz - fr * 0.7], [sx - sgn * 1.4, (gapZ[0] + gapZ[1]) / 2 - 0.2], [sx + sgn * 0.1, (gapZ[0] + gapZ[1]) / 2]], 1.05, pm, Y + 0.025, g);
  lawnGrass(g, L[0] + 0.7, L[1] - 0.7, L[2] + 0.7, L[3] - 0.7, Y + 0.02, (x, z) => Math.hypot((x - fx) / 1.0, (z - fz) / 0.75) < fr + 0.45 || PP.some((p) => Math.hypot(x - p[0], z - p[1]) < 0.62), i * 131 + 7);
  // centrepiece, one per lot in turn
  const kind = ['pond', 'fountain', 'roundel', 'bandstand'][i % 4];
  if (kind === 'pond') {
    const rim = new THREE.Mesh(new THREE.CylinderGeometry(fr + 0.18, fr + 0.22, 0.14, 40), mat('#D9CDB8', { r: 0.8 })); rim.scale.z = 0.72; rim.position.set(fx, Y + 0.07, fz); g.add(rim);
    const wt = new THREE.Mesh(new THREE.CylinderGeometry(fr, fr, 0.05, 40), mat('#6FB8D6', { r: 0.15, e: '#2E7FA8', ei: 0.12 })); wt.scale.z = 0.72; wt.position.set(fx, Y + 0.12, fz); g.add(wt);
    for (let k = 0; k < 2; k++) { const du = grp(fx + (k ? 0.5 : -0.4), fz + (k ? 0.2 : -0.25), rr() * 6, g); du.position.y = Y + 0.15; put(sph(0.13, '#FFFFFF'), 0, 0.08, 0, du); put(sph(0.08, '#FFFFFF'), 0.12, 0.2, 0, du); put(cyl(0.02, 0.035, 0.07, '#F2A33A'), 0.2, 0.2, 0, du); }
    for (let k = 0; k < 7; k++) { const a = rr() * 6.28; put(sph(0.14 + rr() * 0.08, '#8FA08A', { r: 0.9 }), fx + Math.cos(a) * (fr + 0.25), Y + 0.1, fz + Math.sin(a) * (fr + 0.25) * 0.72, g); }
  } else if (kind === 'fountain') {
    put(cyl(fr * 0.85, fr * 0.9, 0.3, '#E4DACB'), fx, Y + 0.15, fz, g); const w1 = new THREE.Mesh(new THREE.CylinderGeometry(fr * 0.76, fr * 0.76, 0.04, 32), mat('#7CC3E0', { r: 0.12, e: '#3A8DB8', ei: 0.15 })); w1.position.set(fx, Y + 0.29, fz); g.add(w1);
    put(cyl(0.12, 0.16, 0.7, '#E4DACB'), fx, Y + 0.6, fz, g); put(cyl(0.45, 0.3, 0.12, '#E4DACB'), fx, Y + 0.98, fz, g); put(sph(0.16, '#BFE6F5', { r: 0.1 }), fx, Y + 1.12, fz, g);
  } else if (kind === 'roundel') {
    const bd = grp(fx, fz, 0, g); put(cyl(fr, fr, 0.12, '#6B4A33'), 0, Y + 0.06, 0, bd); glbSwap(bd, 'lon_flowerbed', { len: fr * 2.1, y: Y }); const bd2 = grp(fx, fz, 0.6, g); glbSwap(bd2, 'lon_bush', { h: 1.0, y: Y + 0.25 });
  } else { const bs = grp(fx, fz, rr() * 6, g); put(cyl(fr * 0.8, fr * 0.8, 0.2, '#EFE7DA'), 0, Y + 0.1, 0, bs); glbSwap(bs, 'lon_bandstand', { h: 2.7, y: Y }); }
  // flower beds along the path, a couple of benches facing the centrepiece, lamps
  for (const [bx, bz] of [[cx - sgn * 0.9, L[3] - d * 0.2], [fx - sgn * (fr + 0.9), fz + fr + 0.5]]) { const bd = grp(bx, bz, rr() * 6, g); put(sph(0.6, '#6B4A33'), 0, Y, 0, bd); glbSwap(bd, 'lon_flowerbed', { len: 1.4 + rr() * 0.4, y: Y }); }
  for (const [bx, bz, r] of [[fx + sgn * (fr + 1.5), fz, sgn > 0 ? -Math.PI / 2 : Math.PI / 2], [fx, fz + fr + 1.2, Math.PI]]) { const bg = grp(bx, bz, r, g); put(rbox(1.4, 0.08, 0.4, '#B5793A', 0.03), 0, 0.2, 0, bg); glbSwap(bg, 'bench', { len: 1.4, y: Y }); }
  for (const [lx, lz] of [[cx + sgn * 1.1, L[3] - 0.9], [fx + sgn * (fr + 1.1), fz - fr - 0.6]]) { const lg = grp(lx, lz, 0, g); put(cyl(0.05, 0.06, 2.2, '#2E3238'), 0, Y + 1.1, 0, lg); glbSwap(lg, 'lamp', { h: 2.4, y: Y }); }
  // groves of mixed trees on the edges away from the path, bushes under them
  const sp = ['pt_oak', 'pt_lime', 'pt_oak', 'pt_fir', 'pt_cherry', 'pt_lime'], H0 = { pt_oak: 4.6, pt_lime: 5.2, pt_cherry: 3.9, pt_fir: 5.0 }, M = 1.9; // crowns stay inside the lot: away from walls and hedges
  const spots = [[ox + sgn * 1.5, L[2] + 1.6], [ox + sgn * 2.9, L[2] + 1.3], [ox + sgn * 1.4, L[2] + 3.0], [sx - sgn * 1.5, L[2] + 1.5], [ox + sgn * 1.3, L[3] - 2.0], [sx - sgn * 1.4, L[3] - 2.1]];
  spots.forEach(([tx0, tz0], k) => { if (k >= 4 && d < 9) return; const tx = Math.min(L[1] - M, Math.max(L[0] + M, tx0)), tz = Math.min(L[3] - M, Math.max(L[2] + M, tz0)); const n = sp[(k + i) % sp.length], tg = grp(tx + (rr() - 0.5) * 0.3, tz + (rr() - 0.5) * 0.3, rr() * 6, g); put(sph(1.0, '#4E9E44'), 0, 2, 0, tg); glbSwap(tg, n, { h: H0[n] * (0.82 + rr() * 0.36), y: Y });
    if (rr() < 0.6) { const b = grp(tx + 0.9 * (rr() - 0.5), tz + 0.9, rr() * 6, g); glbSwap(b, 'lon_bush', { h: 0.7 + rr() * 0.3, y: Y }); } });
}
function lotGarden(L, i, g, c = 'london') {
  const GD = GARDEN[c] || GARDEN.london;
  const w = L[1] - L[0], d = L[3] - L[2], cx = (L[0] + L[1]) / 2, cz = (L[2] + L[3]) / 2; let sd = i * 7 + 3; const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
  put(rbox(w - 0.2, 0.3, d - 0.2, '#8C6B4E', 0.06), cx, -0.4, cz, g); // soil edge
  const lm = mat('#FFFFFF', { r: 0.95, map: LAWN_TEX([Math.max(1, w / 3), Math.max(1, d / 3)]), mapK: 'lawn' + i + '|' + w + '|' + d });
  if (GD.dry) { floorPlane(L[0] + 0.1, L[1] - 0.1, L[2] + 0.1, L[3] - 0.1, mat('#E6D3AC', { r: 1 }), -0.24, g); floorPlane(cx - w * 0.3, cx + w * 0.3, cz - d * 0.3, cz + d * 0.05, lm, -0.235, g); } // dry climate: raked gravel garden, a small watered lawn
  else if (GD.nat) { const lf = floorPlane(L[0] + 0.1, L[1] - 0.1, L[2] + 0.1, L[3] - 0.1, mat('#FFFFFF', { r: 0.95, map: LAWN_NAT(), mapK: 'lawnNat' }), -0.24, g); { const uv = lf.geometry.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * w / 4, uv.getY(k) * d / 4); } // natural lawn with living grass (kept off the path and plaza)
    lawnGrass(g, L[0] + 0.7, L[1] - 0.7, L[2] + 0.7, L[3] - 0.7, -0.22, (x, z) => (Math.abs(x - cx) < 1.1 && z > cz) || Math.hypot(x - cx, z - cz) < 1.8 || Math.hypot(x - cx, z - cz + 1.9) < 1.1, i * 97 + 5); }
  else floorPlane(L[0] + 0.1, L[1] - 0.1, L[2] + 0.1, L[3] - 0.1, lm, -0.24, g);
  // hedge border: a rounded clipped box with soft bumps in three greens, gaps for the path
  const HG = GD.nat ? ['#3D6E33', '#4A7D3D', '#557F45'] : ['#3F9A3A', '#4FAE44', '#5DBB4E'], hy = -0.24, hh = 0.62, ht = 0.5, gate = [cx - 0.9, cx + 0.9];
  const hedge = (x0, z0, x1, z1) => { const len = Math.hypot(x1 - x0, z1 - z0); if (len < 0.4) return; const ax = x0 === x1 ? 'z' : 'x';
    put(rbox(ax === 'x' ? len : ht, hh, ax === 'x' ? ht : len, HG[0], 0.2), (x0 + x1) / 2, hy + hh / 2, (z0 + z1) / 2, g);
    for (let t = 0.25; t < len - 0.1; t += 0.42) { const b = sph(0.2 + rr() * 0.06, HG[1 + (rr() < 0.5 ? 0 : 1)], { r: 0.9 }); b.scale.y = 0.75; put(b, ax === 'x' ? x0 + t : x0 + (rr() - 0.5) * 0.1, hy + hh - 0.02, ax === 'x' ? z0 + (rr() - 0.5) * 0.1 : z0 + t, g); } };
  const e = 0.35; hedge(L[0] + e, L[2] + e, L[1] - e, L[2] + e); hedge(L[0] + e, L[2] + e, L[0] + e, L[3] - e); hedge(L[1] - e, L[2] + e, L[1] - e, L[3] - e);
  hedge(L[0] + e, L[3] - e, gate[0], L[3] - e); hedge(gate[1], L[3] - e, L[1] - e, L[3] - e);
  // gravel path from the gate to a little round plaza
  const pm = mat('#EAD9B5', { r: 1 }); floorPlane(gate[0] + 0.15, gate[1] - 0.15, cz, L[3] - 0.1, pm, -0.22, g);
  const pl = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.04, 28), pm); pl.position.set(cx, -0.21, cz); pl.receiveShadow = true; g.add(pl);
  // flower beds in the corners (modelled clay bed; soil and blooms until it loads)
  const FL = GD.fl;
  for (const [fx, fz] of [[L[0] + 1.6, L[2] + 1.6], [L[1] - 1.6, L[2] + 1.6], [L[0] + 1.6, L[3] - 1.7], [L[1] - 1.6, L[3] - 1.7]]) {
    const bd = grp(fx, fz, rr() * 6, g); const bed = sph(0.95, '#6B4A33', { r: 1 }); bed.scale.set(1, 0.22, 0.8); put(bed, 0, -0.22, 0, bd);
    for (let k = 0; k < 10; k++) { const a = rr() * Math.PI * 2, r = Math.sqrt(rr()) * 0.7; put(sph(0.12, FL[Math.floor(rr() * FL.length)], { r: 0.7 }), Math.cos(a) * r, -0.02, Math.sin(a) * r * 0.8, bd); }
    glbSwap(bd, 'lon_flowerbed', { len: 2.0, y: -0.24 }); }
  // round clipped bushes along the inside of the hedge, every few metres (none at the gate or the corner beds)
  for (let t = 3.2; t < w - 3; t += 2.6 + rr() * 0.8) { const b = grp(L[0] + t, L[2] + 0.95, rr() * 6, g); put(sph(0.45, '#5DBB4E'), 0, 0.2, 0, b); glbSwap(b, 'lon_bush', { h: 0.85 + rr() * 0.3, y: -0.24 }); }
  for (let t = 3.2; t < d - 3; t += 2.6 + rr() * 0.8) for (const sx of [L[0] + 0.95, L[1] - 0.95]) { const b = grp(sx, L[2] + t, rr() * 6, g); put(sph(0.45, '#5DBB4E'), 0, 0.2, 0, b); glbSwap(b, 'lon_bush', { h: 0.8 + rr() * 0.35, y: -0.24 }); }
  // white planters of geraniums either side of the gate
  for (const px of [gate[0] - 0.75, gate[1] + 0.75]) { const p = grp(px, L[3] - 0.95, 0, g); put(rbox(1.0, 0.45, 0.45, '#F4F1EA', 0.05), 0, 0, 0, p); glbSwap(p, 'lon_planter', { len: 1.1, y: -0.24 }); }
  // two trees (tropical cities: palms) and a bench by the plaza
  const tg = grp(cx + (i % 2 ? -1 : 1) * Math.min(3.2, w / 2 - 1.8), cz - Math.min(2.2, d / 2 - 1.8), 0, g); put(sph(1.2, GD.tc), 0, 2.2, 0, tg); glbSwap(tg, GD.tree, { h: GD.tree === 'pt_palm' ? 6.2 : GD.tree === 'sp_palm' ? 5.2 : 4.2, y: -0.24 });
  if (w >= 6 && d >= 6 && !GD.nat) { const t2 = grp(cx - (i % 2 ? -1 : 1) * Math.min(3.4, w / 2 - 2), cz + Math.min(1.8, d / 2 - 2.4), 0, g); put(sph(1.0, GD.tc), 0, 2, 0, t2); glbSwap(t2, GD.tree2 || GD.tree, { h: GD.tree2 ? 4.8 : GD.tree === 'sp_palm' ? 4.6 : 3.6, y: -0.24 }); }
  const bg = grp(cx, cz - 1.9, 0, g); put(rbox(1.5, 0.08, 0.42, '#B5793A', 0.03), 0, 0.2, 0, bg); glbSwap(bg, 'bench', { len: 1.5, y: -0.24 });
}
function floorPlane(x0, x1, z0, z1, m, y = 0.1, parent = scene) {
  const f = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.04, z1 - z0), m); f.position.set((x0 + x1) / 2, y, (z0 + z1) / 2); f.receiveShadow = true; parent.add(f); return f;
}
function plant(x, z, s = 1, pot = '#E9785F', p = scene, force = null) { // force: { v: model name, h: height } to pick a given plant
  const g = grp(x, z, 0, p); g.position.y = 0.1;
  put(cyl(0.22 * s, 0.17 * s, 0.38 * s, pot), 0, 0.19 * s, 0, g);
  [[0, 0.6, 0, 0.26], [0.16, 0.5, 0.08, 0.2], [-0.15, 0.52, -0.05, 0.2], [0.05, 0.78, -0.06, 0.18]].forEach((q, i) => put(sph(q[3] * s, ['#4E9E58', '#6DBA63', '#3F8A4D'][i % 3], { r: 0.85 }), q[0] * s, q[1] * s, q[2] * s, g));
  if (force) glbSwap(g, force.v, { h: force.h, ...(force.tint ? { tint: force.tint } : {}) });
  else if (pot !== '#E3B341') { const k = Math.abs(Math.round(x * 7.3 + z * 3.1)) % 3; glbSwap(g, 'nap_plant', { h: [0.75, 0.9, 1.0][k] * s, rot: k * 2.1 }); } // the well-defined monstera everywhere (the old round-leaf pots looked like blobs)
  return g;
}
const world = { roomGroups: {}, lotGroup: null, decor: {} };
function buildWorld() {
  const ground = new THREE.Mesh(new THREE.BoxGeometry(90, 0.2, 90), mat('#FFFFFF', { r: 0.9, map: tileTex('#C9D5DA', '#C2CFD5', [36, 36]), mapK: 'g' }));
  ground.position.set(3, -0.62, 3); ground.receiveShadow = true; scene.add(ground); world.ground = ground;
  const desk = grp(5.25, 5.25, Math.PI / 4); world.desk = desk;
  put(rbox(2.3, 1.0, 0.7, '#16963C', 0.12), 0, 0.6, 0, desk); put(rbox(2.5, 0.1, 0.9, '#FFFFFF', 0.05), 0, 1.15, -0.05, desk);
  put(rbox(2.1, 0.1, 0.05, '#FFD25E', 0.02, { e: '#FFC94A', ei: 0.8 }), 0, 0.72, 0.36, desk); put(rbox(0.5, 0.36, 0.05, '#2F3640', 0.02), -0.75, 1.42, -0.3, desk);
  put(sph(0.09, '#E3B341', { m: 0.7, r: 0.25 }), 0.6, 1.26, 0.1, desk);
  desk.traverse((m) => { if (m.isMesh) m.userData.desk = true; });
  setTimeout(() => glbSwap(desk, 'desk', { len: 2.5, y: 0.1, keep: (c) => c === world.deskRing, onModel: () => setTimeout(() => { if (S && S.desk) { (world.desks2 || []).forEach((m) => scene.remove(m)); world.desks2 = []; placeDesk(); } }, 0) }), 0); // modelled in Blender; once it is in (it can take longer than dressDesks' retries on a phone), the chairs and monitors are set out per station and the extra desks re-cloned from it
  const dr = new THREE.Mesh(new THREE.RingGeometry(1.35, 1.55, 40), new THREE.MeshBasicMaterial({ color: '#7ACB4E', transparent: true, opacity: 0.85 })); dr.rotation.x = -Math.PI / 2; dr.position.y = 0.14; dr.visible = false; desk.add(dr); world.deskRing = dr;
  const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.5, 1.5, 0.02, 40), mat('#2BB5A6', { r: 1 })); rug.position.set(2.6, 0.13, 3.6); rug.receiveShadow = true; scene.add(rug);
  plant(6.1, 1.1, 1.1, '#FFFFFF'); plant(1.0, 6.0, 1, '#E9785F'); plant(2.6, 1.0, 0.9, '#FFD25E');
  buildCityDecor('london');
  buildAnnexLot();
}
// ---------------- modelled props (London art pilot) ----------------
// Each prop is first built from primitives (instant, and the fallback); the Meshy model then replaces it when loaded.
// ?props=0 turns them off. Models live in models/props/<name>.js (base64 GLB, 2–12k triangles, WebP textures).
const PROPS_ON = new URLSearchParams(location.search).get('props') !== '0';
const PROP_CACHE = {};
function propModel(name) {
  if (/^pt_/.test(name)) return PROP_CACHE[name] || (PROP_CACHE[name] = Promise.resolve(procTree(name.slice(3)))); // procedural trees (no file)
  return PROP_CACHE[name] || (PROP_CACHE[name] = (async () => {
    const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
    const b64 = (await import('./models/props/' + (LOOK_DAY && DAY.kits[name] || name) + '.js')).default; const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const { MeshoptDecoder } = await import('three/addons/libs/meshopt_decoder.module.js'); // the Meshy props are meshopt-compressed
    const gl = await new Promise((res, rej) => new GLTFLoader().setMeshoptDecoder(MeshoptDecoder).parse(bin.buffer, '', res, rej)); slimTextures(gl.scene);
    if (/^plant_/.test(name)) gl.scene.traverse((m) => { // potted plants: crisper leaves (faceted shading, more contrast between the soft vertex-colour shades, shadows between leaves)
      if (!m.isMesh || !/leaf/i.test(m.material.name || '')) return; const col = m.geometry.attributes.color; m.material = m.material.clone(); m.material.flatShading = true; m.material.roughness = 0.55; m.material.needsUpdate = true; m.castShadow = m.receiveShadow = true;
      if (col) { const c = new THREE.Color(), hsl = {}; for (let i = 0; i < col.count; i++) { c.fromBufferAttribute(col, i); c.getHSL(hsl); const l = Math.pow(hsl.l, 1.25) * 0.97; c.setHSL(hsl.h, Math.min(1, hsl.s * 1.18), l); col.setXYZ(i, c.r, c.g, c.b); } col.needsUpdate = true; } });
    { const { mergeGeometries } = await import('three/addons/utils/BufferGeometryUtils.js'); gl.scene.updateMatrixWorld(true); const groups = new Map();
      gl.scene.traverse((m) => { if (m.isMesh && !m.isSkinnedMesh) { const k = m.material.uuid + '|' + Object.keys(m.geometry.attributes).sort().join(','); if (!groups.has(k)) groups.set(k, []); groups.get(k).push(m); } });
      if ([...groups.values()].some((l) => l.length > 1)) { const root = new THREE.Group();
        for (const list of groups.values()) { const geos = list.map((m) => { const g2 = m.geometry.index ? m.geometry.clone() : m.geometry.clone(); g2.applyMatrix4(m.matrixWorld); return g2; });
          const merged = geos.length > 1 ? mergeGeometries(geos, false) : geos[0]; if (!merged) { for (const m of list) { const c = m.clone(); c.applyMatrix4(m.matrixWorld); root.add(c); } continue; }
          const mm = new THREE.Mesh(merged, list[0].material); mm.name = list[0].name; root.add(mm); }
        // keep named top-level nodes (the building kit picks modules by name)
        if (name !== 'desk' && name !== 'toilet' && !gl.scene.children.some((c) => /^(bw|gw|ob|sf|chim|k_)/.test(c.name))) gl.scene = root; } // the reception desk keeps its parts too: dressDesk moves its chair and monitor to each station by name; the toilet too: merging by material named the porcelain after the hidden basin (no bowl, seat or tank) and the cubicle sides after the walk-through posts
    }
    gl.scene.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; const mt = m.material; if (mt && mt.isMeshStandardMaterial) { mt.metalness = 0; mt.roughness = /glass/.test(mt.name) ? 0.2 : 0.8; mt.envMapIntensity = /glass/.test(mt.name) ? 1.2 : 0.6; if (mt.map) mt.map.anisotropy = 4; } } });
    return gl.scene;
  })());
}
// room architecture kit, modelled once in Blender (tools/blender/room_kit.py): wall layers, crown, skirting, plinth, rounded corners,
// arched door frame, window. Loaded before the first room is built; every chunky room is assembled from it (falls back to code walls)
const KIT_C = { rim: '#E3AD89', trim: '#FBF5EA', plinth: '#8E9AA9', glass: '#A8CFEF' }; /* plinth: the façade's dark skirting under its grey-blue dado */
let RKIT = null;
try { const gl = await propModel('room_kit'); RKIT = {}; const sc = gl.scene || gl; sc.updateMatrixWorld(true); sc.traverse((o) => { if (o.isMesh) { const g2 = o.geometry.clone(); g2.applyMatrix4(o.matrixWorld); RKIT[o.name] = g2; } }); if (!RKIT.k_wall_in) RKIT = null; } catch (e) { console.warn('[room kit]', e); RKIT = null; }
const KIT_PO = {};
// Each room's kit walls are pushed toward the camera by a depth offset of their own so that two rooms' walls standing in the same plane
// (back to back, or a room against the plot wall) never flicker. The offset used to come from the room id (id % 6), so two neighbours
// whose ids differed by a multiple of 6 got the same one and flickered again. Now a room takes an offset that none of the rooms
// touching it uses (kept across rebuilds while it stays free).
const PO_OF = {}, PO_LIST = [-2, -5, -8, -11, -14, -17, -20, -23, -26, -29];
function roomPO(r) {
  const q = roomRect(r), near = (o) => { if (!o || o === r || o.id === r.id) return false; const p = roomRect(o); return p.x0 < q.x1 + 0.8 && p.x1 > q.x0 - 0.8 && p.z0 < q.z1 + 0.8 && p.z1 > q.z0 - 0.8; };
  const used = new Set((S.rooms || []).filter(near).map((o) => PO_OF[o.id]).filter((v) => v != null));
  if (PO_OF[r.id] != null && !used.has(PO_OF[r.id])) return PO_OF[r.id];
  return (PO_OF[r.id] = PO_LIST.find((v) => !used.has(v)) ?? PO_LIST[0]);
}
/* polish (preview): walls in two tones like a real interior: a darker dado up to 40 % of the wall, a white moulding, the light paint above.
   Drawn in the wall's own shader from its local height (kit walls run 0..1), so it follows the cutaway and costs nothing. */
const FAC_HI = '#F4EEE3', FAC_LO = '#A9B5C3', TT_MOLD = new THREE.Color('#FBF8F2'); /* dado: 55 % of the wall as it stands (at most 85 cm), so a wall cut to hip height still shows both tones */
const darkHex = (hex, f) => { const c = new THREE.Color(hex); c.offsetHSL(0, 0, -f); return '#' + c.getHexString(); };
const lowOf = (wall, base) => { const a = {}, b = {}; new THREE.Color(wall).getHSL(a); if (base) new THREE.Color(base).getHSL(b); return base && a.l - b.l >= 0.1 ? base : darkHex(wall, 0.15); }; /* the dado always clearly darker than the paint */
function ttMat(c, low, r = 0.95, b0 = 0, b1 = 1) { if (LOOK_DAY) return mat(c === FAC_HI ? DAY.ext : c, { r: 0.9 }); const k = 'tt|' + c + '|' + low + '|' + r + '|' + b0; if (MC[k]) return MC[k]; const m = mat(c, { r }).clone(), lowC = new THREE.Color(low);
  m.onBeforeCompile = (sh) => { sh.uniforms.uLow = { value: lowC }; sh.uniforms.uMold = { value: TT_MOLD }; sh.uniforms.uB0 = { value: b0 }; sh.uniforms.uB1 = { value: b1 };
    sh.vertexShader = 'varying float vLY;\nvarying float vCut;\nuniform float uB0;\nuniform float uB1;\n' + sh.vertexShader.replace('#include <begin_vertex>', '#include <begin_vertex>\n vLY = (modelMatrix * vec4(transformed, 1.0)).y; float wb = (modelMatrix * vec4(0.0, uB0, 0.0, 1.0)).y, wt = (modelMatrix * vec4(0.0, uB1, 0.0, 1.0)).y; vCut = wb + min(0.85, 0.55 * (wt - wb));');
    sh.fragmentShader = 'varying float vLY;\nvarying float vCut;\nuniform vec3 uLow;\nuniform vec3 uMold;\n' + sh.fragmentShader.replace('#include <color_fragment>', '#include <color_fragment>\n diffuseColor.rgb = vLY < vCut ? uLow : (vLY < vCut + 0.06 ? uMold : diffuseColor.rgb);'); };
  m.customProgramCacheKey = () => 'tt4'; return (MC[k] = m); }
const KM = (name, c, r = 0.9) => { const m = new THREE.Mesh(RKIT[name], mat(c, { r })); m.castShadow = m.receiveShadow = true; m.userData.kitW = true; return m; };
const INST = {}, INST_NAMES = new Set(['pt_oak', 'pt_lime', 'pt_cherry', 'pt_fir', 'pt_palm', 'pt_flame', 'lon_oak', 'lon_leafy', 'lon_cherry', 'lon_cypress', ...['padaria', 'boteco', 'shops', 'houses', 'mural', 'depot', 'selfbuilt', 'liberdade', 'pixo', 'tower', 'glass', 'wave', 'res_beige', 'res_brick', 'heli', 'favela_a', 'favela_b', 'ipe_y', 'ipe_p', 'palm'].map((n) => 'sp2_' + n), 'lon_plane', 'lon_tree_hq', 'lon_tree_round', 'tree', 'lamp', 'bench', 'postbox', 'phonebox', 'busstop', 'sp_ipe_y', 'sp_ipe_p', 'sp_palm', 'sp_lamp', 'sp_bench', 'sp_light', 'sp_tree_g', 'sp_bin', 'sp_orelhao']);
function glbInst(g, name, o = {}) {
  if (!PROPS_ON || !g) return; g.userData.swap = true;
  let rec = INST[name]; if (!rec || rec.done) { rec = INST[name] = { list: [], done: false }; const R0 = rec; propModel(name).then((src) => { R0.done = true; buildInst(src, R0.list, name); }).catch((e) => console.warn('[props]', name, e.message)); }
  rec.list.push([g, o]);
}
function buildInst(src, list, name) {
  const live = list.filter(([g]) => g.parent); if (!live.length) return; const wind = name && TREE_RX.test(name) && !GFX.low;
  let root = live[0][0]; while (root.parent && root.parent !== scene) root = root.parent;
  src.updateMatrixWorld(true); const meshes = []; src.traverse((m) => { if (m.isMesh) meshes.push(m); });
  const box0 = new THREE.Box3().setFromObject(src), sz0 = box0.getSize(new THREE.Vector3());
  const placeM = live.map(([g, o]) => {
    const quarter = Math.abs(Math.sin(o.rot || 0)) > 0.7, sx = quarter ? sz0.z : sz0.x, sz = quarter ? sz0.x : sz0.z;
    const sl = o.len ? o.len / Math.max(sx, sz) : null, sh = o.h ? o.h / sz0.y : null, k = sl || sh || 1;
    for (const c of g.children.slice()) g.remove(c); g.userData.glb = src.name || 'inst';
    g.updateWorldMatrix(true, false);
    return g.matrixWorld.clone().multiply(new THREE.Matrix4().compose(new THREE.Vector3(0, o.y || 0, 0), new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), o.rot || 0), new THREE.Vector3(k, sh && sl ? sh : k, k)));
  });
  const inv = new THREE.Matrix4().copy(root.matrixWorld).invert(), tmp = new THREE.Matrix4();
  for (const m of meshes) {
    const mt = wind ? windify(m.material.clone(), 0.12, 4.5) : m.material; if (wind && /^lon_(oak|leafy|cypress)/.test(name)) mt.color.multiply(new THREE.Color('#CDD5C2')); // natural, less acid green
    const im = new THREE.InstancedMesh(m.geometry, mt, placeM.length); if (m.customDepthMaterial) im.customDepthMaterial = m.customDepthMaterial; im.castShadow = !GFX.low; im.receiveShadow = true;
    placeM.forEach((pm, i) => { tmp.multiplyMatrices(inv, pm).multiply(m.matrixWorld); im.setMatrixAt(i, tmp); });
    if (live.some(([, o]) => o.tint)) { const c = new THREE.Color(); live.forEach(([, o], i) => im.setColorAt(i, c.set(o.tint || '#FFFFFF'))); im.instanceColor.needsUpdate = true; } // per-instance repaint (e.g. São Paulo's favela blocks)
    im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere(); root.add(im);
  }
}
// o: { h: height } and/or { len: longest horizontal size } (both → non-uniform), rot: extra yaw, y: base height, keep: fn(child) → keep it
let CREASE_FN = null; import('three/addons/utils/BufferGeometryUtils.js').then((u) => { CREASE_FN = u.toCreasedNormals; });
function glbSwap(g, name, o = {}) {
  if (!PROPS_ON || !g) return; g.userData.swap = true; // keeps the batcher out of it
  const [kit, piece] = name.split('/');
  propModel(kit).then((src0) => {
    if (!g.parent) return; const src = piece ? src0.getObjectByName(piece) : src0; if (!src) throw new Error('no piece ' + piece);
    let m = src.clone(); if (piece) { const w = new THREE.Group(); w.add(m); m = w; } m.rotation.y = o.rot || 0; // a kit piece keeps its own (quantization) scale inside a wrapper
    const AN = Math.min(8, renderer.capabilities.getMaxAnisotropy()); m.traverse((c) => { const mp = c.isMesh && c.material && c.material.map; if (mp && mp.anisotropy < AN) { mp.anisotropy = AN; mp.needsUpdate = true; } }); // sharp textures at an angle
    if (o.crease && CREASE_FN) m.traverse((c) => { if (c.isMesh) c.geometry = c.geometry.userData.cr || (c.geometry.userData.cr = CREASE_FN(c.geometry, o.crease)); }); // crisp edges on soft Meshy furniture
    const b = new THREE.Box3().setFromObject(m), sz = b.getSize(new THREE.Vector3());
    const sl = o.len ? o.len / Math.max(sz.x, sz.z) : null, sh = o.h ? o.h / sz.y : null;
    const k = sl || sh || 1; m.scale.set(k, sh && sl ? sh : k, k);
    if (/rug|carpet|playmat|jute/i.test(name) && sz.y * m.scale.y > (o.rugH || 0.035)) m.scale.y = (o.rugH || 0.035) / sz.y; // a rug is walked on: flat, so feet stay above it
    if (/rug|carpet|playmat|jute/i.test(name)) m.traverse((c) => { if (c.isMesh && c.material && c.material.side !== THREE.FrontSide) { c.material = c.material.clone(); c.material.side = THREE.FrontSide; } }); // squashed flat, its underside showed through the weave as dark patches: only the top side is drawn
    if (o.fit) { const fx = o.fit[0] / sz.x, fz = o.fit[1] / sz.z; m.scale.set(fx, o.h ? sh : Math.min(fx, fz) * (o.hk || 1), fz); } // fit a footprint [w, d] (group axes); height follows the narrower side unless h is given
    let rid; g.traverse((c) => { if (c.userData.roomId != null && rid == null) rid = c.userData.roomId; });
    for (const c of g.children.slice()) if (!(o.keep && o.keep(c))) g.remove(c);
    if (o.fabric) m.traverse((c) => { if (!c.isMesh || !c.material) return; const s0 = c.material; // upholstery: soft velvet sheen and a fine weave instead of plastic
      c.material = new THREE.MeshPhysicalMaterial({ map: s0.map, color: s0.color, vertexColors: s0.vertexColors, roughness: 0.92, metalness: 0, sheen: 1, sheenRoughness: 0.42, sheenColor: new THREE.Color(o.fabric), normalMap: FABRIC_N(), normalScale: new THREE.Vector2(0.35, 0.35) }); });
    if (o.lift) m.traverse((c) => { if (c.isMesh && c.material && c.material.map) { c.material = c.material.clone(); c.material.map = LIFT_TEX(c.material.map, o.lift); } }); /* paler purples in the texture, other colours untouched */
    if (o.recol) m.traverse((c) => { if (c.isMesh && c.material && c.material.map) { c.material = c.material.clone(); c.material.map = RECOL_TEX(c.material.map, o.recol[0], o.recol[1]); } }); /* repaint one fabric of a model in a room's colour */
    if (o.tint) m.traverse((c) => { if (c.isMesh && c.material) { c.material = c.material.clone(); c.material.color.multiply(new THREE.Color(o.tint)); } });
    if (o.glow) m.traverse((c) => { if (c.isMesh && c.material) { c.material = c.material.clone(); c.material.emissive = new THREE.Color(o.glow); c.material.emissiveIntensity = o.gi || 0.8; if (c.material.map) c.material.emissiveMap = c.material.map; } }); // recolour a shared model for one room's palette
    if (TREE_RX.test(name) && !GFX.low) m.traverse((c) => { if (c.isMesh && c.material) { c.material = windify(c.material.clone(), name === 'nap_plant' ? 0.03 : 0.12, 4.5); if (/^lon_(oak|leafy|cypress)/.test(name)) c.material.color.multiply(new THREE.Color('#CDD5C2')); } }); // leaves stir in the wind; calmer greens
    m.position.y = o.y || 0; g.add(m); g.userData.glb = name; if (o.onModel) o.onModel(m);
    if (rid != null) { m.traverse((c) => { if (c.isMesh) c.userData.roomId = rid; }); roomObsLater(rid); }
  }).catch((e) => console.warn('[props]', name, e.message));
}
let cityScene = null;
const SIGN_TEX = canvasTex(1024, 220, (g) => { g.fillStyle = '#16963C'; g.fillRect(0, 0, 1024, 220); g.fillStyle = '#fff'; g.font = '700 104px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillText('Life Crisis', 512, 150); });
const GARDEN_OK = () => S && S.garden && (!S.rainy || S.gardenRoof) && (() => { const o = outsideT(); return o > (S.gardenHeat ? -2 : 8) && o < (S.gardenCool ? 42 : 34); })(); // roof = rain-proof, heaters/fans widen the usable temperatures
function gardenBuild(g, pa, pb) { // grass, planters and benches on both sides of the entrance; benches become outdoor waiting seats
  for (let i = WAIT_SPOTS.length - 1; i >= 0; i--) if (WAIT_SPOTS[i].out) WAIT_SPOTS.splice(i, 1);
  const spots = [], sides = [[pa + 0.6, -0.6], [7.6, pb - 0.6]];
  for (const [a, b] of sides) { if (b - a < 2.5) continue;
    floorPlane(a, b, 7.2, 11.6, mat('#8DBF6A', { r: 1 }), 0.09, g);
    const n = Math.min(4, Math.floor((b - a) / 2.6));
    for (let k = 0; k < n; k++) { const bx = a + 1.3 + k * ((b - a - 2.6) / Math.max(1, n - 1 || 1)); const bz = 9.2;
      const bench = grp(bx, bz, 0, g); put(rbox(1.5, 0.08, 0.95, '#B5793A', 0.03), 0, 0.45, 0, bench); put(rbox(1.5, 0.45, 0.07, '#B5793A', 0.03), 0, 0.7, 0, bench); for (const sx of [-0.65, 0.65]) put(rbox(0.07, 0.42, 0.85, '#5A3A22', 0.02), sx, 0.24, 0, bench);
      for (const sx of [-0.38, 0.38]) for (const side of [-1, 1]) spots.push({ x: bx + sx, z: bz + side * 0.26, rot: side > 0 ? 0 : Math.PI, sit: true, y: 0.02, out: true, busy: null }); // double-sided: back to back
      if (S.gardenRoof) { for (const [px, pz] of [[-1.1, -0.6], [1.1, -0.6], [-1.1, 0.8], [1.1, 0.8]]) put(cyl(0.05, 0.05, 2.3, '#5A6470'), bx + px, 1.25, bz + pz, g); const gl = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.05, 1.8), mat('#BFE6F6', { r: 0.1, op: 0.45 })); gl.position.set(bx, 2.42, bz + 0.1); g.add(gl); put(rbox(2.7, 0.06, 0.08, '#5A6470', 0.02), bx, 2.44, bz + 1.0, g); put(rbox(2.7, 0.06, 0.08, '#5A6470', 0.02), bx, 2.44, bz - 0.8, g); }
      if (S.gardenHeat) { const hx = bx + (k % 2 ? -1.0 : 1.0); put(cyl(0.05, 0.12, 1.8, '#4A4F57'), hx, 1.0, bz + 0.9, g); put(new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.25, 12), mat('#8A8E96', { m: 0.5 })), hx, 2.0, bz + 0.9, g); put(sph(0.08, '#FF8A3D', { e: '#FF6A1A', ei: 1.4 }), hx, 1.8, bz + 0.9, g); }
      if (S.gardenCool) { const fx = bx + (k % 2 ? 1.0 : -1.0); put(cyl(0.04, 0.04, 2.1, '#C9CED6'), fx, 1.05, bz + 0.9, g); put(cyl(0.25, 0.25, 0.08, '#5AB8F0', { op: 0.8 }), fx, 2.1, bz + 0.9, g); const um = new THREE.Mesh(new THREE.ConeGeometry(1.0, 0.35, 16), mat('#F4EFE6', { r: 0.9 })); um.position.set(fx, 2.35, bz + 0.9); g.add(um); }
      { const pg = grp(bx + (k % 2 ? 1.1 : -1.1), 10.9, 0, g); put(rbox(1.0, 0.4, 0.36, '#E3D3BA', 0.04), 0, 0.3, 0, pg); put(sph(0.22, '#7DB54B'), 0, 0.55, 0, pg); glbSwap(pg, 'planter', { len: 1.1, y: 0.1 }); } }
    for (let x = a + 0.8; x < b - 0.4; x += 2.2) { const f = sph(0.18, ['#FF8FAB', '#FFD25E', '#B57BE8'][Math.floor(x) % 3 < 0 ? 0 : Math.floor(x) % 3]); f.scale.y = 0.6; put(f, x, 0.2, 7.6, g); } }
  WAIT_SPOTS.unshift(...spots); gardenRain();
}
function gardenRain() { const ok = GARDEN_OK(); for (const s of WAIT_SPOTS) if (s.out) s.blocked = !ok; }
/* polish (preview): corridors in warm sand tiles, 60 cm, with real grout and a little variation from tile to tile (one texture = 2.4 m) */
const SAND = () => GC.sand || (GC.sand = canvasTex(512, 512, (c, W) => { const t = W / 4; let sd = 11; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  c.fillStyle = LOOK_DAY ? DAY.grout : '#CDBFA6'; c.fillRect(0, 0, W, W);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { const v = Math.round((rr() - 0.5) * 10); c.fillStyle = LOOK_DAY ? `rgb(${DAY.corridor[0] + v},${DAY.corridor[1] + v},${DAY.corridor[2] + v})` : `rgb(${233 + v},${224 + v},${207 + v})`; c.fillRect(i * t + 2, j * t + 2, t - 4, t - 4);
    for (let k = 0; k < 260; k++) { c.fillStyle = rr() < 0.5 ? 'rgba(160,140,110,0.10)' : 'rgba(255,252,245,0.22)'; c.fillRect(i * t + 3 + rr() * (t - 6), j * t + 3 + rr() * (t - 6), 1 + rr() * 2, 1 + rr() * 2); }
    c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(i * t + 2, j * t + 2, t - 4, 3); c.fillStyle = 'rgba(120,100,70,0.08)'; c.fillRect(i * t + 2, j * t + t - 5, t - 4, 3); } }));
function sandMat(w, d) { const k = 'sand|' + w.toFixed(2) + 'x' + d.toFixed(2); if (!MC[k]) { const tx = SAND().clone(); tx.wrapS = tx.wrapT = THREE.RepeatWrapping; tx.repeat.set(w / 2.4, d / 2.4); tx.anisotropy = 4; tx.needsUpdate = true; MC[k] = new THREE.MeshStandardMaterial({ color: '#FFFFFF', map: tx, roughness: 0.78 }); } return MC[k]; }
function buildShell(c) {
  if (world.shellG) scene.remove(world.shellG); const g = new THREE.Group(); scene.add(g); world.shellG = g; world.cutWalls = [];
  const own = ownedLots(c), P = plotOf(c), rs = P.main.concat(P.lots.filter((_, i) => own[i]));
  for (const r of rs) { put(rbox(r[1] - r[0] + 0.3, 0.62, r[3] - r[2] + 0.3, '#E9E1D3', 0.06), (r[0] + r[1]) / 2, -0.25, (r[2] + r[3]) / 2, g); floorPlane(r[0], r[1], r[2], r[3], sandMat(r[1] - r[0], r[3] - r[2]), 0.08, g); }
  floorPlane(LOB, 6.5, LOB, 6.5, floorMat(FLOOR_KIND.lobby, 6.5 - LOB, 6.5 - LOB), 0.1, g); // terrazzo lobby (art kit, sheet C #9)
  const [pa, pb] = plazaX(c), pl = new THREE.Mesh(new THREE.BoxGeometry(pb - pa, 0.5, 6), mat('#FFFFFF', { r: 0.9, map: tileTex('#E4E7EB', '#DADFE4', [Math.round((pb - pa) / 2), 3]), mapK: 'p' + c })); pl.position.set((pa + pb) / 2, -0.17, 9.6); pl.receiveShadow = true; g.add(pl);
  if (S && S.garden && S.city === c) gardenBuild(g, pa, pb); else for (let i = WAIT_SPOTS.length - 1; i >= 0; i--) if (WAIT_SPOTS[i].out) WAIT_SPOTS.splice(i, 1);
  for (const h of P.holes || []) { floorPlane(h[0], h[1], h[2], h[3], mat('#8DBF6A', { r: 1 }), 0.09, g); const cx = (h[0] + h[1]) / 2, cz = (h[2] + h[3]) / 2; put(cyl(1.0, 1.1, 0.4, '#C9CED6'), cx, 0.3, cz, g); put(cyl(0.8, 0.8, 0.05, '#7EC8E3', { r: 0.2 }), cx, 0.5, cz, g); for (const [dx, dz] of [[-2.6, -1.8], [2.6, 1.8], [-2.6, 1.8], [2.6, -1.8]]) plant(cx + dx, cz + dz, 1.4, '#C9A06B', g); }
  // boundary walls from a 0.5 grid
  const box = plotBox(c), inF = (x, z) => inFloorC(c, own, x, z), E = {};
  for (let x = box[0] + 0.25; x < box[1]; x += 0.5) for (let z = box[2] + 0.25; z < box[3]; z += 0.5) {
    if (!inF(x, z)) continue;
    for (const [dx, dz] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nx = x + dx * 0.5, nz = z + dz * 0.5; if (inF(nx, nz)) continue;
      if (dz === 1 && nz > 6.5) continue;
      const k = dz ? 'h' + (z + dz * 0.25).toFixed(2) + ':' + dz : 'v' + (x + dx * 0.25).toFixed(2) + ':' + dx;
      (E[k] = E[k] || []).push(dz ? x : z);
    }
  }
  const segs = [];
  for (const k in E) { const v = E[k].sort((a, b) => a - b), line = +k.slice(1).split(':')[0], n = +k.split(':')[1], hz = k[0] === 'h'; let s = v[0], p = v[0];
    for (let i = 1; i <= v.length; i++) { if (i < v.length && Math.abs(v[i] - p - 0.5) < 0.01) { p = v[i]; continue; } segs.push({ hz, line, a: s - 0.25, b: p + 0.25, n }); if (i < v.length) { s = p = v[i]; } } }
  let best = null;
  for (const s of segs) {
    const wg = new THREE.Group(); g.add(wg); const nx = s.hz ? 0 : s.n, nz = s.hz ? s.n : 0; wg.userData.n = [nx, nz]; world.cutWalls.push(wg);
    const col = FAC_HI;
    if (s.hz) { wallSeg(s.a, s.line, s.b, s.line, W_H, col, wg); wallSeg(s.a, s.line, s.b, s.line, 0.35, FAC_LO, g); } else { wallSeg(s.line, s.a, s.line, s.b, W_H, col, wg); wallSeg(s.line, s.a, s.line, s.b, 0.35, FAC_LO, g); }
    wg.traverse((o) => { if (o.isMesh && o.material && o.material.color && o.material.color.getHexString() === new THREE.Color(FAC_HI).getHexString()) { o.material = ttMat(FAC_HI, FAC_LO, 0.95, -W_H / 2, W_H / 2); o.userData.kitW = true; } }); /* the same dado and moulding as the rooms */
    const L = s.b - s.a, inn = -(T / 2 + 0.03);
    for (let u = s.a + 3.2; u < s.b - 1.5; u += 6.5) { const wx = s.hz ? u : s.line + nx * inn, wz = s.hz ? s.line + nz * inn : u; kitWindow(wg, wx - nx * 0.03, wz - nz * 0.03, s.hz ? 0 : Math.PI / 2); }
    if (s.hz && s.n === -1 && (!best || L > best.L)) best = { s, wg, L };
  }
  if (GFX.batch) { for (const w of world.cutWalls) batchNode(w); const st = new Set(world.cutWalls); g.traverse((o) => { if (o.userData.swap) st.add(o); }); batchNode(g, st); }
  if (best) { const s = best.s, cx = (s.a + s.b) / 2; const sg = new THREE.Mesh(new THREE.PlaneGeometry(4.6, 1.0), new THREE.MeshStandardMaterial({ map: SIGN_TEX, emissive: '#ffffff', emissiveMap: SIGN_TEX, emissiveIntensity: 0.15 })); put(sg, cx, 3.3, s.line + 0.12, best.wg); put(rbox(4.8, 1.15, 0.1, '#0E6E2C', 0.04), cx, 3.3, s.line + 0.05, best.wg); }
  updateCutaway();
}
// per-city light. London: rainy late-afternoon — lavender sky, warm low sun, wet glossy pavement, lit windows (step 6 of the London look)
// preview: every city bright and toy-like (clear sky of its own, more light, a colour grade), each in its own climate
const CITY_GRADE = {
  london: { sky: '#BCBFF6', light: { hemi: ['#FFFFFF', '#B9AE9E', 0.9], sun: ['#FFF4E2', 2.9], fill: ['#E9EEFF', 0.35] }, filter: 'saturate(1.1) contrast(1.05) brightness(1.02)' },
  newyork: { sky: '#AFCBF2', light: { hemi: ['#F4F7FF', '#A39C8E', 0.86], sun: ['#FFF0DA', 3.0], fill: ['#DCE6FF', 0.38] }, filter: 'saturate(1.22) contrast(1.05) brightness(1.03)' },
  saopaulo: { sky: '#B3D2F0', light: { hemi: ['#FFFFFF', '#A89C8A', 0.86], sun: ['#FFF2DC', 3.0], fill: ['#E2ECFF', 0.35] }, filter: 'saturate(1.22) contrast(1.05) brightness(1.03)' },
  mexico: { sky: '#C2C6F5', light: { hemi: ['#FFF8EE', '#A8957C', 0.86], sun: ['#FFE9C6', 3.2], fill: ['#E8EEFF', 0.32] }, filter: 'saturate(1.25) contrast(1.05) brightness(1.03)' },
  seoul: { sky: '#B6D3F7', light: { hemi: ['#F7FAFF', '#A6A196', 0.86], sun: ['#FFF4E4', 2.9], fill: ['#E2EAFF', 0.38] }, filter: 'saturate(1.22) contrast(1.05) brightness(1.04)' },
  lagos: { sky: '#A9D6F2', light: { hemi: ['#FFF6E8', '#B09A7C', 0.84], sun: ['#FFE2B4', 3.3], fill: ['#E6F0FF', 0.3] }, filter: 'saturate(1.08) contrast(1.05) brightness(1.02)' },
  mumbai: { sky: '#B0D8F0', light: { hemi: ['#FFF6EA', '#B09C80', 0.84], sun: ['#FFE6C0', 3.2], fill: ['#E6F0FF', 0.3] }, filter: 'saturate(1.24) contrast(1.05) brightness(1.03)' },
  cairo: { sky: '#BCDDF2', light: { hemi: ['#FFF4E2', '#BC9C70', 0.84], sun: ['#FFE2B4', 3.3], fill: ['#FFEEDA', 0.3] }, filter: 'saturate(1.2) contrast(1.05) brightness(1.03)' },
};
const CITY_LIGHT = {
  _: { hemi: ['#FFE9D2', '#B39C82', 0.62], sun: ['#FFD9AC', 3.1], fill: ['#E6ECFF', 0.3] },
  newyork: { hemi: ['#E3E9F5', '#8A8578', 0.64], sun: ['#FFE6C4', 2.9], fill: ['#D7E2FF', 0.38], fog: [80, 170] },
  mexico: { hemi: ['#FFE9D8', '#9C8A74', 0.68], sun: ['#FFE2B8', 3.3], fill: ['#E8F0FF', 0.32], fog: [90, 180] },
  cairo: { hemi: ['#FFE4C2', '#B08A5E', 0.66], sun: ['#FFC98A', 3.2], fill: ['#FFE9CF', 0.3], fog: [80, 170] },
  london: { hemi: ['#FFE6C4', '#A8865E', 0.72], sun: ['#FFC27A', 3.0], fill: ['#FFE2C2', 0.3], wet: true, fog: [70, 150] }, // warm golden late-afternoon light
};
// a passer-by for the city streets: one of the city's visitor models, walking (created once its model is loaded)
function cityWalker(cb) {
  if (CHAR.status === 'off' || CHAR.status === 'fallback') return; if (CHAR.status !== 'ready') { setTimeout(() => cityWalker(cb), 1500); return; }
  const k = pickVis(false); if (!k) { setTimeout(() => cityWalker(cb), 1500); return; }
  loadFull(k).then((g) => { if (!g) return; const look = { vm: k, tall: VIS[k].h / 1.75, wide: 1, male: VIS_MALE.has(k) }; const av = person(look, 'visitor'); if (!av.userData.p.glb) return;
    av.traverse((m) => { if (m.isMesh) m.castShadow = false; }); av.userData.p.anim.set('walk', 1.15 / 2.3); cb(av); });
}
function buildCityDecor(kind) {
  if (cityScene === kind) { buildShell(kind); buildAnnexLot(kind); return; } cityScene = kind;
  if (world.cityG) scene.remove(world.cityG); const cg = new THREE.Group(); scene.add(cg); world.cityG = cg;
  const res = buildCity(kind, cg, { THREE, put, rbox, cyl, sph, grp, mat, canvasTex, low: GFX.low, lively: kind === 'london', cityKit: kind === 'london' && PROPS_ON, grade: true, spNew: true, lonNew: true, lgNew: true, grass: kind === 'london' || kind === 'lagos' ? lawnSkin : null, walker: cityWalker, glb: kind === 'london' || kind === 'saopaulo' || kind === 'lagos' ? (g, n, o) => (INST_NAMES.has(n) ? glbInst : glbSwap)(g, n, o) : null, model: kind === 'london' && PROPS_ON ? propModel : null }, plotBox(kind));
  const GR = CITY_GRADE[kind]; scene.background = new THREE.Color(GR ? GR.sky : res.bg); const L = GR ? GR.light : CITY_LIGHT[kind] || CITY_LIGHT._; // preview: London lit like the reference painting (clear, bright, lavender sky)
  world.ground.material = mat('#FFFFFF', { r: L.wet ? 0.38 : 0.9, map: groundTex(kind) || tileTex(res.ground[0], res.ground[1], [36, 36]), mapK: 'g' + kind });
  canvas.style.filter = GR ? GR.filter : '';
  { const big = kind === 'saopaulo' && GR, k = big ? 1.9 : 1; world.ground.scale.set(k, 1, k); const mp = world.ground.material.map; if (mp && big) mp.repeat.set(60 * k, 60 * k); } // São Paulo's rows of towers reach further out // preview: the toy-like punch of the London reference painting
  hemi.color.set(L.hemi[0]); hemi.groundColor.set(L.hemi[1]); hemi.intensity = L.hemi[2]; sun.color.set(L.sun[0]); sun.intensity = L.sun[1]; fill.color.set(L.fill[0]); fill.intensity = L.fill[1];
  if (LOOK_DAY) { hemi.color.set(DAY.hemi[0]); hemi.groundColor.set(DAY.hemi[1]); hemi.intensity = DAY.hemi[2]; sun.color.set(DAY.sun[0]); sun.intensity = DAY.sun[1]; fill.color.set(DAY.fill[0]); fill.intensity = DAY.fill[1]; scene.environmentIntensity = DAY.env; canvas.style.filter = ''; }
  scene.fog = L.fog ? new THREE.Fog(res.bg, L.fog[0], L.fog[1]) : null;
  if (GFX.batch) { const stop = new Set([...res.buildings.map((b) => b.o), ...res.movers.filter((m) => m.o).map((m) => m.o)]); cg.traverse((o) => { if (o.userData.swap) stop.add(o); }); for (const b of res.buildings) batchNode(b.o); batchNode(cg, stop); }
  world.cityB = res.buildings; world.movers = res.movers; moveCity(world.movers, 0); updateCutaway(); placeBackdrop(BG_ON && kind === 'london');
  buildShell(kind); buildAnnexLot(kind); town3d(kind);
}
// ---- comparison test (preview only, ?town=3d): the owner's Claude Design town (assets/town3d) instead of the London city ----
// Its town is built by its own <town-scene> element (kept alive off-screen so its traffic keeps moving, its own drawing switched off);
// the pieces are moved into our scene at ×2.6 (its buses and houses at our scale) as the district behind the HQ; our London pieces behind the HQ are hidden.
const TOWN3D = new URLSearchParams(location.search).get('town') === '3d';
function town3d(kind) {
  if (!TOWN3D || kind !== 'london' || world.town3d) return; world.town3d = 'loading';
  const sc = document.createElement('script'); sc.src = './assets/town3d/town-scene.js'; document.head.appendChild(sc);
  sc.onload = () => { const el = document.createElement('town-scene'); el.setAttribute('config', JSON.stringify({ coins: false, birds: true, orbit: false }));
    el.style.cssText = 'position:fixed;left:-20px;top:-20px;width:8px;height:8px;opacity:0;pointer-events:none'; document.body.appendChild(el);
    const wait = () => { if (!el.ready || !el.scene) return setTimeout(wait, 100); el.renderer.render = () => {}; el.renderer.setSize(2, 2);
      const G = new THREE.Group(), K = 2.6, rs = plotOf('london').main.concat(plotOf('london').lots), bx = new THREE.Box3();
      const x0 = Math.min(...rs.map((r) => r[0])), x1 = Math.max(...rs.map((r) => r[1])), z0 = Math.min(...rs.map((r) => r[2])); // the HQ, its plots and annexes
      for (const o of [...el.scene.children]) if (!o.isLight && o !== el.sun.target) G.add(o);
      // its town stands behind the HQ (its high street parallel to ours), our own street and plaza stay in front
      G.scale.setScalar(K); G.position.set((x0 + x1) / 2, -0.12, z0 - 2 - 13.5 * K); scene.add(G); world.town3d = G; el.plot.visible = false;
      if (world.cityG) { world.cityG.updateMatrixWorld(true); const cut = z0 - 1; for (const o of world.cityG.children) { bx.setFromObject(o); if (bx.isEmpty()) continue; const c = bx.getCenter(new THREE.Vector3()); if (c.z < cut && bx.max.x - bx.min.x < 200) o.visible = false; } }
      world.cityB = (world.cityB || []).filter((b) => b.o.visible);
      G.updateMatrixWorld(true);
      for (const h of el.houses) { bx.setFromObject(h); const c = bx.getCenter(new THREE.Vector3()); world.cityB.push({ o: h, x: c.x, z: c.z, h: bx.max.y, r: Math.max(bx.max.x - bx.min.x, bx.max.z - bx.min.z) / 2, lm: true }); } // hidden by the cutaway when they would cover the HQ
      updateCutaway(); };
    wait(); };
}
function buildAnnexLot(c) {
  c = c || (S && S.city) || 'london';
  if (world.lotGroup) { scene.remove(world.lotGroup); world.lotGroup = null; }
  const g = new THREE.Group(); scene.add(g); world.lotGroup = g;
  const sig = c + ownedLots(c).join(',') + (S && S.city === c ? ['garden', 'gardenRoof', 'gardenHeat', 'gardenCool'].map((k) => (S[k] ? 1 : 0)).join('') : ''); if (world.shellOwn !== sig) { world.shellOwn = sig; buildShell(c); }
  plotOf(c).lots.forEach((L, i) => {
    const st = S && S.city === c ? lotSt(i) : 'locked', cx = (L[0] + L[1]) / 2, cz = (L[2] + L[3]) / 2;
    if (st === 'owned') return;
    if (CITY_GRADE[c]) { if (c === 'london') lotParkLondon(L, i, g); else lotGarden(L, i, g, c); if (st === 'pending') { for (let k = 0; k < 4; k++) put(cyl(0.05, 0.05, 2.4, '#E3B341'), L[0] + 1 + k * (L[1] - L[0] - 2) / 3, 0.95, L[2] + 1, g); put(rbox(L[1] - L[0] - 2, 0.1, 0.1, '#E3B341', 0.02), cx, 2.0, L[2] + 1, g); put(rbox(L[1] - L[0] - 2, 0.1, 0.1, '#E3B341', 0.02), cx, 1.2, L[2] + 1, g); } else { const s = grp(cx, cz, 0, g); put(cyl(0.05, 0.05, 1.6, '#8B6A45'), 0, 0.5, 0, s); put(rbox(1.4, 0.8, 0.08, '#FFD25E', 0.04), 0, 1.4, 0, s); } return; }
    put(rbox(L[1] - L[0] - 0.2, 0.3, L[3] - L[2] - 0.2, '#CBBFA9', 0.06), cx, -0.4, cz, g);
    // a vacant lot rather than bare sand: rough grass with a worn dirt patch, a few shrubs, a low wooden fence along the edges
    floorPlane(L[0] + 0.1, L[1] - 0.1, L[2] + 0.1, L[3] - 0.1, mat('#A9C47F', { r: 1 }), -0.24, g);
    { const w = L[1] - L[0], d = L[3] - L[2]; floorPlane(cx - w * 0.22, cx + w * 0.18, cz - d * 0.15, cz + d * 0.25, mat('#C9B48E', { r: 1 }), -0.23, g);
      let sd = i * 7 + 3; const rr = () => { sd = (sd * 16807) % 2147483647; return sd / 2147483647; };
      for (let k = 0; k < Math.min(9, Math.round(w * d / 18)); k++) { const b = sph(0.35 + rr() * 0.35, rr() < 0.5 ? '#7FAE5A' : '#93BD62'); b.scale.y = 0.7; put(b, L[0] + 0.8 + rr() * (w - 1.6), -0.1, L[2] + 0.8 + rr() * (d - 1.6), g); }
      const fc = '#C9A577', y0 = -0.24;
      for (const [x0, z0, x1, z1] of [[L[0] + 0.2, L[2] + 0.2, L[1] - 0.2, L[2] + 0.2], [L[0] + 0.2, L[3] - 0.2, L[1] - 0.2, L[3] - 0.2], [L[0] + 0.2, L[2] + 0.2, L[0] + 0.2, L[3] - 0.2], [L[1] - 0.2, L[2] + 0.2, L[1] - 0.2, L[3] - 0.2]]) {
        const len = Math.hypot(x1 - x0, z1 - z0), along = x0 === x1 ? 'z' : 'x';
        for (const h of [0.35, 0.65]) put(rbox(along === 'x' ? len : 0.06, 0.07, along === 'x' ? 0.06 : len, fc, 0.02), (x0 + x1) / 2, y0 + h, (z0 + z1) / 2, g);
        for (let t = 0; t <= len + 0.01; t += 2.4) put(rbox(0.1, 0.8, 0.1, '#A8845A', 0.02), along === 'x' ? x0 + t : x0, y0 + 0.4, along === 'x' ? z0 : z0 + t, g); } }
    if (st === 'pending') { for (let k = 0; k < 4; k++) put(cyl(0.05, 0.05, 2.4, '#E3B341'), L[0] + 1 + k * (L[1] - L[0] - 2) / 3, 0.95, L[2] + 1, g); put(rbox(L[1] - L[0] - 2, 0.1, 0.1, '#E3B341', 0.02), cx, 2.0, L[2] + 1, g); put(rbox(L[1] - L[0] - 2, 0.1, 0.1, '#E3B341', 0.02), cx, 1.2, L[2] + 1, g); }
    else { const s = grp(cx, cz, 0, g); put(cyl(0.05, 0.05, 1.6, '#8B6A45'), 0, 0.5, 0, s); put(rbox(1.4, 0.8, 0.08, '#FFD25E', 0.04), 0, 1.4, 0, s); }
  });
  if (GFX.batch) { const st = new Set(); g.traverse((o) => { if (o.userData.swap) st.add(o); }); batchNode(g, st); } // fences, shrubs and signs: a few draw calls instead of hundreds
}
function lotOwned(i) {
  setLot(i, 'owned'); setRent(); buildAnnexLot(); rebuildGrid();
  const L = plotOf().lots[i];
  for (const r of S.rooms) { const q = roomRect(r); if (q.x0 <= L[1] + 0.1 && q.x1 >= L[0] - 0.1 && q.z0 <= L[3] + 0.1 && q.z1 >= L[2] - 0.1) { evictRoom(r.id); buildRoom(r); } }
  assignStaff(); chat(t('from.council'), t('council.ok'), '📝'); toast('🏗️ ' + t('lot.ready'), 2600); say('lot', t('lot.ready'), 0); save();
}

// ---------------- rooms ----------------
const R = { rooms: {}, staff: [], visitors: [], deskQ: [], deskQs: [], litter: [], rats: [], inspector: null, later: [] }; R.deskQs[0] = R.deskQ;
// Room style kit (v2 look): thick rounded matte walls, cream cap, darker skirting, optional fairy lights (no ivy).
const WALL_HIP = 1.0, WALL_CUT = 0.3, DOOR_H = 2.15, DOOR_W = 1.15, ROOM_H = DOOR_H + 0.12; // interior walls are exactly as tall as the door frame // walls taller than people (~1.75 m), one modern door per room
const ROOM_STYLE = { nap: { wall: '#E4D6F6', cap: '#FFF7EC', base: '#BFA6E6', floor: '#EFE4FA', lights: true, h: ROOM_H }, training: { v2: true, model: 'training_kit', kit: true, winSide: 'none', // no window: the board, sink, shelf and table take the walls
    wall: '#A9B3EE', inBase: '#8C97D8', floor: '#E7E9EF', door: '#7F8BD6', panel: '#7F8BD6', pop: '#F2C230', posts: true, h: ROOM_H } };
// soft pastel wall per room (from its colour), cream rounded caps and posts — same family as the nap room
const _mix = (a, b, k) => { const A = new THREE.Color(a), B = new THREE.Color(b); return '#' + A.lerp(B, k).getHexString(); };
const WALL_TINT = { yoga: '#D3ECEE', lucha: '#F6D3E2', ahwa: '#F0DCC0', budget: '#F3D9B8', detox: '#D3E6F4', career: '#F2D6DE', cafe: '#D6EBDD', lab: '#DCE2EC', social: '#F8D7E2', parent: '#FBE2C0', moving: '#EADCC8', pharmacy: '#D2EDE6', glowup: '#F8DCE8', wedding: '#F8DCE6', jjim: '#F0D9C4', roda: '#D7EDD5', garage: '#F2E3BD', shop: '#F9DCCF', staffroom: '#EDE2CF', toilet: '#D9ECF8', therapy: '#D5E6D9' };
for (const [k, c] of Object.entries(WALL_TINT)) ROOM_STYLE[k] = { wall: c, cap: '#F4E9D2', base: _mix(c, '#4C5753', 0.62), lights: ['cafe', 'social', 'glowup'].includes(k), h: ROOM_H, posts: true };
ROOM_STYLE.nap.posts = true; ROOM_STYLE.nap.base = _mix(ROOM_STYLE.nap.wall, '#4C5753', 0.62); ROOM_STYLE.nap.cap = '#F4E9D2';
// 2026 room design (v2): cream outside shared by every room, the room's own colour drenched inside, arched window, sign plate over the door
const OUT_WALL = '#F3E8D6', OUT_CAP = '#FBF4E8', OUT_BASE = '#A9C29E';
ROOM_STYLE.career = { v2: true, model: 'career_kit', kit: true, winOuter: true, wood: ['#7A4428', '#8C5232'], winSide: '-1,0', winOff: 0, wall: '#E5826C', wallSide: { '0,-1': '#22305A' }, inBase: '#151E3A', floor: '#6E3324', door: '#22305A', panel: '#22305A', pop: '#F0A830', posts: true, h: ROOM_H };
ROOM_STYLE.pharmacy = { v2: true, model: 'pharmacy_kit', kit: true, floorMap: () => PHARMA_FLOOR(), wall: '#CFE6D4', inBase: '#A9D3B6', floor: '#F6F3EC', door: '#8FC7A0', panel: '#8FC7A0', pop: '#5BB37A', posts: true, h: ROOM_H };
ROOM_STYLE.social = { v2: true, model: 'social_kit', kit: true, wall: '#E9A9A4', inBase: '#D98C8A', floor: '#A45A6C', door: '#F1E2CC', panel: '#C97E86', pop: '#D4A64A', posts: true, h: ROOM_H };
ROOM_STYLE.wedding = { v2: true, model: 'wedding_kit', kit: true, wall: '#F0A12C', inBase: '#D9861A', floor: '#EBDCC6', door: '#8E1F28', panel: '#8E1F28', pop: '#E3B341', posts: true, h: ROOM_H };
ROOM_STYLE.therapy = { v2: true, model: 'therapy_kit', kit: true, winSide: '-1,0', winOuter: true, wood: ['#F4F0E9', '#EAE4DA'], wall: '#5C3A26', inBase: '#3F2719', floor: '#F4F0E9', door: '#C8644E', panel: '#C8644E', pop: '#E3A23B', posts: true, h: ROOM_H };
ROOM_STYLE.glowup = { v2: true, model: 'glowup_kit', kit: true, winSide: '-1,0', winOuter: true, floorMap: () => TERRAZZO(), wall: '#EFA7AE', inBase: '#D9858F', floor: '#F2C2C4', door: '#E98C98', panel: '#E98C98', pop: '#E7B04A', posts: true, h: ROOM_H };
ROOM_STYLE.cafe = { v2: true, chunky: true, ao: true, plinth: '#9DB38C', floorM: () => mat('#FFFFFF', { map: CHECKER_M(), mapK: 'cafeM', r: 0.6 }), model: 'cafe_kit', kit: true, winSide: '0,-1', winOff: 1.0, winOuter: true, floorMap: () => CHECKER_SOFT(), wall: '#93A97C', inBase: '#73895E', floor: '#F1EAD8', door: '#6E8A5A', panel: '#6E8A5A', pop: '#C98A3A', posts: true, h: ROOM_H };
ROOM_STYLE.budget = { v2: true, model: 'budget_kit', kit: true, wall: '#2A8550', inBase: '#17643A', floor: '#167A42', door: '#1D6B40', panel: '#1D6B40', pop: '#F2845C', posts: true, h: ROOM_H };
ROOM_STYLE.nap = { v2: true, model: 'nap_kit', kit: true, archWin: true, rim: '#8A78C2', wall: '#B4A4E2', inBase: '#9A88D0', floor: '#C3B6E6', floorM: () => mat('#FFFFFF', { map: NAP_CARPET(), mapK: 'napCarpet', r: 1 }), door: '#8D72C9', panel: '#8D72C9', pop: '#FFD866', icon: 'moon', stars: true, posts: true, h: ROOM_H };
// diorama look (validated on the café) for every room built from Tripo/Meshy pieces: rounded walls and floor, sage plinth, soft contact shadows, pieces ×1.1
// the older rooms (code-built furniture, interiors not redone yet) get the same walls and floors: their pastel tint inside, cream outside, arched door
const LAB_FLOOR = () => GC.labFloor || (GC.labFloor = canvasTex(256, 256, (c, W) => { c.fillStyle = '#B9B5C3'; c.fillRect(0, 0, W, W); let sd = 3; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1400; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(255,255,255,0.08)' : 'rgba(60,50,80,0.07)'; c.fillRect(rr() * W, rr() * W, 2, 2); }
  c.strokeStyle = '#9C7BD6'; c.lineWidth = 9; c.lineCap = 'round'; c.lineJoin = 'round'; c.beginPath(); c.moveTo(0, 70); c.lineTo(150, 70); c.arcTo(190, 70, 190, 110, 40); c.lineTo(190, 256); c.stroke();
  c.beginPath(); c.moveTo(256, 190); c.lineTo(110, 190); c.arcTo(70, 190, 70, 150, 40); c.lineTo(70, 0); c.stroke(); }, [3, 3]));
ROOM_STYLE.lab = { v2: true, model: 'lab_kit', kit: true, winSide: '0,-1', winOuter: true, wall: '#E6E2EC', inBase: '#B7AFC6', floor: '#B9B5C3', floorM: () => mat('#FFFFFF', { map: LAB_FLOOR(), mapK: 'labFloor', r: 0.7 }), door: '#8E6CC9', panel: '#8E6CC9', pop: '#B48CE8', posts: true, h: ROOM_H };
ROOM_STYLE.moving = { v2: true, model: 'moving_kit', kit: true, winSide: '1,0', winOuter: true, wood: ['#C98E52', '#B97E45'], wall: '#E9D3A6', inBase: '#C9AD78', floor: '#C98E52', door: '#2F7F78', panel: '#2F7F78', pop: '#E3B341', posts: true, h: ROOM_H };
ROOM_STYLE.parent = { v2: true, model: 'parent_kit', kit: true, winSide: 'none', wood: ['#EBD3AE', '#E2C79F'], rim: '#E4CBA2', wall: '#A8C8EC', inBase: '#8CB2DC', floor: '#EBD3AE', door: '#6E9FD3', panel: '#6E9FD3', pop: '#9DB38C', posts: true, h: ROOM_H };
const GARAGE_FLOOR = () => GC.garFloor || (GC.garFloor = canvasTex(256, 256, (c, W) => { c.fillStyle = '#9A9C9A'; c.fillRect(0, 0, W, W); let sd = 9; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 2600; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(40,40,40,0.07)'; c.fillRect(rr() * W, rr() * W, 2, 2); }
  c.strokeStyle = 'rgba(70,70,70,0.25)'; c.lineWidth = 1.5; c.beginPath(); c.moveTo(0, 128); c.lineTo(W, 128); c.moveTo(128, 0); c.lineTo(128, W); c.stroke(); }, [2, 2]));
ROOM_STYLE.shop = { v2: true, model: 'shop_kit', kit: true, winSide: 'none', wood: ['#E2B47F', '#D8A874'], wall: '#EFA283', inBase: '#D98B6C', floor: '#E2B47F', door: '#E0664A', panel: '#E0664A', pop: '#F6C9A8', posts: true, h: ROOM_H };
ROOM_STYLE.detox = { v2: true, model: 'detox_kit', kit: true, winSide: '-1,0', archWin: true, wood: ['#C48A4E', '#B67E45'], wall: '#86A070', inBase: '#6E8A5B', floor: '#C48A4E', rim: '#C08A55', door: '#C08A55', panel: '#C08A55', pop: '#D9663F', posts: true, h: ROOM_H };
ROOM_STYLE.garage = { v2: true, model: 'garage_kit', kit: true, winSide: 'none', wall: '#E3AE3C', inBase: '#C99429', floor: '#9A9C9A', floorM: () => mat('#FFFFFF', { map: GARAGE_FLOOR(), mapK: 'garFloor', r: 0.85 }), rim: '#C2BDB2', door: '#2E7F82', panel: '#2E7F82', pop: '#E3AE3C', posts: true, h: ROOM_H };
for (const k of ['detox', 'lab', 'parent', 'moving', 'jjim', 'yoga', 'lucha', 'ahwa', 'roda', 'garage', 'shop', 'staffroom', 'toilet']) { const st = ROOM_STYLE[k]; if (!st || st.v2) continue;
  const c = new THREE.Color(st.wall), h = {}; c.getHSL(h); const tone = (s2, l2) => '#' + new THREE.Color().setHSL(h.h, Math.min(1, s2), l2).getHexString(); // a bit more colour inside, a door in the deep version of the room's hue
  const dc = tone(h.s * 0.55 + 0.25, 0.42); Object.assign(st, { v2: true, chunky: true, ao: true, wall: tone(h.s * 1.25, h.l * 0.9), inBase: tone(h.s * 0.9, h.l * 0.72), door: dc, panel: dc, pop: '#E3B341' }); }
Object.assign(ROOM_STYLE.staffroom, { model: 'staffroom_kit', kit: true, wall: '#9A7D66', inBase: '#76604E', door: '#7E5F47', panel: '#7E5F47', pop: '#E9785F', wood: ['#C98E52', '#B97E45'], floor: '#C98E52' }); // the painting: warm taupe walls, wooden floor
Object.assign(ROOM_STYLE.roda, { model: 'roda_kit', kit: true, archWin: true, wall: '#8DBF5A', inBase: '#F2C94C', door: '#4E9A5B', panel: '#4E9A5B', pop: '#F2C94C', floor: '#EFE6D2', floorM: () => mat('#FFFFFF', { map: CALCADAO(), mapK: 'calcadao', r: 0.85 }) }); // green walls over a sunny yellow skirting, Copacabana wave pavement
Object.assign(ROOM_STYLE.lucha, { model: 'lucha_kit', kit: true, wall: '#D9346E', inBase: '#1E9C8E', door: '#1FA39A', panel: '#1FA39A', pop: '#F2B33D', wood: ['#2F2C35', '#3A3640'], floor: '#2F2C35' }); // magenta walls over a teal skirting, black rubber floor
Object.assign(ROOM_STYLE.ahwa, { model: 'ahwa_kit', kit: true, wall: '#E2B77E', inBase: '#2E8C86', door: '#2E8C86', panel: '#2E8C86', pop: '#C9873A', wood: ['#E6CFA8', '#D9BF94'], floor: '#E6CFA8' }); // sand plaster, teal tile skirting, pale tiles
Object.assign(ROOM_STYLE.jjim, { model: 'jjim_kit', kit: true, wall: '#C98A4E', inBase: '#9C6436', door: '#9A6234', panel: '#9A6234', pop: '#F2B33D', wood: ['#E9B949', '#E0AE3F'], floor: '#E9B949' }); // warm wood walls, the heated yellow ondol floor
Object.assign(ROOM_STYLE.yoga, { model: 'yoga_kit', kit: true, wall: '#F1E2C4', inBase: '#D6BE98', door: '#8A5A36', panel: '#B48CE8', pop: '#B48CE8', wood: ['#D59D5F', '#C68C50'], floor: '#D59D5F' }); // cream terrace walls, wooden deck // the Tripo pieces of the break-room and yoga paintings
if (LOOK_DAY) for (const k in ROOM_STYLE) if (ROOM_STYLE[k] && ROOM_STYLE[k].kit) ROOM_STYLE[k].ao = true;
if (LOOK_DAY) for (const k in DAY.rooms) { const st = ROOM_STYLE[k], d = DAY.rooms[k]; if (!st) continue; st.wall = d.wall; st.inBase = d.wall; st.floor = d.floor; st.floorM = null; st.floorMap = null; }
for (const k of ['career', 'pharmacy', 'social', 'wedding', 'therapy', 'glowup', 'budget', 'nap', 'training', 'lab', 'moving', 'parent', 'staffroom', 'yoga', 'shop', 'detox', 'garage', 'lucha', 'ahwa', 'jjim', 'roda']) if (ROOM_STYLE[k]) Object.assign(ROOM_STYLE[k], { chunky: true, ao: true, kscale: ['career', 'social', 'glowup'].includes(k) ? 1.1 : 1 }); // pharmacy, therapy, wedding and nap layouts are already full: bigger pieces would overlap
/* polish (preview): every room floor gets a real pattern at real scale (kit floors have UVs in metres): staggered planks with grain,
   carpet pile, small glazed tiles or terrazzo, in the room's own colours. Rooms that already had their own floor keep it. */
const hexL = (hex, dl, ds = 0) => { const c = new THREE.Color(hex); c.offsetHSL(0, ds, dl); return '#' + c.getHexString(); };
const FLOOR_PAT = {
  parquet: (a, b) => canvasTex(512, 512, (c, W) => { let sd = 17; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647), rows = 12, rh = W / rows; /* 2 m square, 16.7 cm boards */
    const A = new THREE.Color(a), B = new THREE.Color(b);
    for (let r = 0; r < rows; r++) { let x = -rr() * 240; while (x < W) { const L = 150 + rr() * 150, m = A.clone().lerp(B, rr()), v = (rr() - 0.5) * 0.06; m.offsetHSL(0, 0, v); const col = '#' + m.getHexString();
        for (const ox of [0, -W, W]) { const x0 = x + ox; if (x0 > W || x0 + L < 0) continue; c.fillStyle = col; c.fillRect(x0, r * rh, L, rh);
          for (let k = 0; k < 7; k++) { const gy = r * rh + 3 + rr() * (rh - 6); c.strokeStyle = rr() < 0.5 ? 'rgba(90,55,25,0.10)' : 'rgba(255,240,215,0.14)'; c.lineWidth = 0.8 + rr(); c.beginPath(); c.moveTo(x0, gy); c.bezierCurveTo(x0 + L * 0.3, gy + (rr() - 0.5) * 4, x0 + L * 0.7, gy + (rr() - 0.5) * 4, x0 + L, gy + (rr() - 0.5) * 3); c.stroke(); }
          c.fillStyle = 'rgba(60,35,15,0.28)'; c.fillRect(x0, r * rh, 1.5, rh); }
        x += L; }
      c.fillStyle = 'rgba(60,35,15,0.30)'; c.fillRect(0, r * rh, W, 1.5); c.fillStyle = 'rgba(255,245,225,0.12)'; c.fillRect(0, r * rh + 1.5, W, 1.5); } }, [0.5, 0.5]),
  carpet: (a) => canvasTex(256, 256, (c, W) => { let sd = 23; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); c.fillStyle = a; c.fillRect(0, 0, W, W);
    for (let i = 0; i < 40; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(0,0,0,0.025)' : 'rgba(255,255,255,0.03)'; c.beginPath(); c.arc(rr() * W, rr() * W, 20 + rr() * 40, 0, 6.3); c.fill(); }
    for (let i = 0; i < 14000; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(0,0,0,0.10)' : 'rgba(255,255,255,0.12)'; c.fillRect(rr() * W, rr() * W, 1 + rr() * 1.5, 1 + rr() * 1.5); } }, [1, 1]),
  check: (a, b) => canvasTex(256, 256, (c, W) => { let sd = 29; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647), n = 4, t = W / n; /* 1.2 m: 30 cm tiles */
    c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(0, 0, W, W);
    for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) { c.fillStyle = (i + j) % 2 ? a : b; c.fillRect(i * t + 1, j * t + 1, t - 2, t - 2); c.fillStyle = `rgba(255,255,255,${0.03 + rr() * 0.06})`; c.fillRect(i * t + 1, j * t + 1, t - 2, t - 2);
      c.fillStyle = 'rgba(255,255,255,0.10)'; c.fillRect(i * t + 3, j * t + 3, t - 6, 2); } }, [1 / 1.2, 1 / 1.2]),
  terrazzo: (a) => canvasTex(256, 256, (c, W) => { let sd = 31; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); c.fillStyle = a; c.fillRect(0, 0, W, W);
    const chips = [hexL(a, -0.18), hexL(a, 0.12), '#FFFFFF', hexL(a, -0.32, 0.1)];
    for (let i = 0; i < 520; i++) { c.fillStyle = chips[Math.floor(rr() * chips.length)]; c.globalAlpha = 0.55 + rr() * 0.4; c.beginPath(); const x = rr() * W, y = rr() * W, r0 = 1 + rr() * 3.2; c.moveTo(x + r0, y); for (let k = 1; k < 6; k++) { const an = k / 6 * 6.28, rk = r0 * (0.6 + rr() * 0.6); c.lineTo(x + Math.cos(an) * rk, y + Math.sin(an) * rk); } c.fill(); } c.globalAlpha = 1; }, [1 / 1.4, 1 / 1.4]) };
for (const k in ROOM_STYLE) { const st = ROOM_STYLE[k]; if (!st || !st.kit || !st.chunky || st.floorM || st.floorMap) continue;
  const kind = k === 'lucha' ? 'carpet' : st.wood ? 'parquet' : FLOOR_KIND[k] === 'herring' ? 'parquet' : FLOOR_KIND[k] || 'carpet', /* lucha: rubber mat */ base = (st.wood && st.wood[0]) || st.floor || '#E8E0D0';
  const make = kind === 'parquet' ? () => FLOOR_PAT.parquet(st.wood ? st.wood[0] : base, st.wood ? st.wood[1] : hexL(base, -0.05)) : kind === 'check' ? () => FLOOR_PAT.check(hexL(base, 0.1), hexL(base, -0.06)) : kind === 'terrazzo' ? () => FLOOR_PAT.terrazzo(base) : () => FLOOR_PAT.carpet(base);
  st.floorM = () => mat('#FFFFFF', { map: GC['fp' + k] || (GC['fp' + k] = make()), mapK: 'fp' + k, r: kind === 'carpet' ? 1 : kind === 'parquet' ? 0.7 : 0.45 }); }
function leaf(r, c, o) { const k = 'L' + r; if (!GC[k]) GC[k] = new THREE.IcosahedronGeometry(r, 1); const m = new THREE.Mesh(GC[k], mat(c, o)); m.castShadow = false; m.receiveShadow = false; return m; }
// one box of a wall run, in wall coordinates: a0..a1 along the run from (px, pz) (ds = which way along), b0..b1 across it (+ = the side n points to, outside the room)
function wbox(parent, alongX, px, pz, ds, n, a0, a1, b0, b1, hh, y, c, r, o) {
  const am = ds * (a0 + a1) / 2, bm = (b0 + b1) / 2, la = a1 - a0, lb = b1 - b0;
  return put(rbox(alongX ? la : lb, hh, alongX ? lb : la, c, r, o), px + (alongX ? am : 0) + n[0] * bm, y, pz + (alongX ? 0 : am) + n[1] * bm, parent);
}
// Every room builds only on its own side of the wall line (plus a thin cream skin outside, thinner than any neighbour's own
// lining), so two rooms sharing a wall never overlap or flicker and each shows its own colour inside. Against the building's
// outer wall (userData.outer) the lining sits just proud of that wall instead of being skipped.
// ---- diorama look (vertical slice: rooms whose style has chunky / ao) ----
// soft grounding: a gradient strip on the floor along each inner wall, and a blurred blob under each piece of furniture
const AO_STRIP = () => GC.aoStrip || (GC.aoStrip = canvasTex(4, 64, (c, W, H) => { const gr = c.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, 'rgba(60,45,30,0.55)'); gr.addColorStop(0.3, 'rgba(60,45,30,0.22)'); gr.addColorStop(1, 'rgba(60,45,30,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); }));
const AO_BLOB = () => GC.aoBlob || (GC.aoBlob = canvasTex(64, 64, (c, W, H) => { const gr = c.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W / 2); gr.addColorStop(0, 'rgba(55,40,28,0.7)'); gr.addColorStop(0.5, 'rgba(55,40,28,0.4)'); gr.addColorStop(1, 'rgba(55,40,28,0)'); c.fillStyle = gr; c.fillRect(0, 0, W, H); }));
const aoMat = (k, tex) => MC[k] || (MC[k] = new THREE.MeshBasicMaterial({ map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2, toneMapped: false }));
function aoStrip(parent, cx, cz, len, n, inset, w = 0.6) { // n points out of the room; the dark edge sits against the wall face
  const m = new THREE.Mesh(GC.aoPlane || (GC.aoPlane = new THREE.PlaneGeometry(1, 1)), aoMat('aoStrip', AO_STRIP()));
  m.scale.set(len, w, 1); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, Math.atan2(-n[0], -n[1]), 0);
  m.position.set(cx - n[0] * (inset + w / 2), 0.134, cz - n[1] * (inset + w / 2)); m.renderOrder = 1; m.userData.swap = true; parent.add(m); return m;
}
function aoBlob(parent, x, z, w, d, rot = 0) {
  const m = new THREE.Mesh(GC.aoPlane || (GC.aoPlane = new THREE.PlaneGeometry(1, 1)), aoMat('aoBlob', AO_BLOB()));
  m.scale.set(w, d, 1); m.rotation.order = 'YXZ'; m.rotation.set(-Math.PI / 2, rot, 0); m.position.set(x, 0.135, z); m.renderOrder = 1; m.userData.swap = true; parent.add(m); return m;
}
// softer café checker: half-metre tiles with grout lines and a faint bevel on each tile, lower contrast than the old one
const CHECKER_M = () => GC.checkerM || (GC.checkerM = canvasTex(256, 256, (c, W) => { const t = W / 2; c.fillStyle = '#DCD3BF'; c.fillRect(0, 0, W, W);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const x = i * t + 3, y = j * t + 3, s = t - 6; c.fillStyle = (i + j) % 2 ? '#CBD5B4' : '#F4EFE2'; c.fillRect(x, y, s, s);
    const gr = c.createLinearGradient(x, y, x + s, y + s); gr.addColorStop(0, 'rgba(255,255,255,0.25)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(70,60,40,0.10)'); c.fillStyle = gr; c.fillRect(x, y, s, s); } }, [1.25, 1.25]));
const CHECKER_SOFT = () => GC.checkerSoft || (GC.checkerSoft = canvasTex(256, 256, (c, W) => { const t = W / 2; c.fillStyle = '#D9D0BA'; c.fillRect(0, 0, W, W);
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { const x = i * t + 3, y = j * t + 3, s = t - 6, base = (i + j) % 2 ? '#B7C69C' : '#F3EDDF';
    c.fillStyle = base; c.fillRect(x, y, s, s); const gr = c.createLinearGradient(x, y, x + s, y + s); gr.addColorStop(0, 'rgba(255,255,255,0.22)'); gr.addColorStop(0.5, 'rgba(255,255,255,0)'); gr.addColorStop(1, 'rgba(70,60,40,0.10)'); c.fillStyle = gr; c.fillRect(x, y, s, s); } }, [6, 6]));
const LIFT_TEX = (map, amt) => { const k = map.uuid + '|' + amt; if (GC[k]) return GC[k]; const im = map.image; if (!im || !im.width) return map; const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const c = cv.getContext('2d'); c.drawImage(im, 0, 0); let D; try { D = c.getImageData(0, 0, cv.width, cv.height); } catch (e) { return map; } const a = D.data;
  for (let i = 0; i < a.length; i += 4) { const r = a[i] / 255, g = a[i + 1] / 255, b = a[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 0.08) continue; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360; if (h < 235 || h > 335) continue; /* purples and violets only */
    let l = (mx + mn) / 2, s = d / (1 - Math.abs(2 * l - 1)); l = l + (1 - l) * amt; s *= 0.78; const q = (1 - Math.abs(2 * l - 1)) * s, x = q * (1 - Math.abs(((h / 60) % 2) - 1)), m0 = l - q / 2; const [R, G, B] = h < 300 ? [x, 0, q] : [q, 0, x]; a[i] = (R + m0) * 255; a[i + 1] = (G + m0) * 255; a[i + 2] = (B + m0) * 255; }
  c.putImageData(D, 0, 0); const t = map.clone(); t.image = cv; t.needsUpdate = true; return (GC[k] = t); };
const RECOL_TEX = (map, kind, col) => { const k = map.uuid + '|' + kind + col; if (GC[k]) return GC[k]; const im = map.image; if (!im || !im.width) return map; const cv = document.createElement('canvas'); cv.width = im.width; cv.height = im.height; const c = cv.getContext('2d'); c.drawImage(im, 0, 0); let D; try { D = c.getImageData(0, 0, cv.width, cv.height); } catch (e) { return map; } const a = D.data, T = new THREE.Color(col), hit = new Uint8Array(a.length / 4); let sum = 0, n = 0;
  for (let i = 0, j = 0; i < a.length; i += 4, j++) { const r = a[i] / 255, g = a[i + 1] / 255, b = a[i + 2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn, l = (mx + mn) / 2, sat = d < 1e-4 ? 0 : d / (1 - Math.abs(2 * l - 1)); let h = d < 1e-4 ? 0 : mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h *= 60; if (h < 0) h += 360;
    const ok = kind === 'cream' ? (l > 0.66 && d < 0.47 && h > 15 && h < 65 || l > 0.74 && d < 0.05) : kind === 'green' ? (h > 75 && h < 175 && sat > 0.12 && d > 0.06) : false; /* cream: pale upholstery (dark wood and bright cushions kept); green: the green fabric */
    if (ok) { hit[j] = 1; sum += l; n++; } }
  if (!n) return map; const avg = sum / n;
  for (let i = 0, j = 0; i < a.length; i += 4, j++) if (hit[j]) { const l = (Math.max(a[i], a[i + 1], a[i + 2]) + Math.min(a[i], a[i + 1], a[i + 2])) / 510, f = Math.min(1.6, l / avg); a[i] = Math.min(255, T.r * f * 255); a[i + 1] = Math.min(255, T.g * f * 255); a[i + 2] = Math.min(255, T.b * f * 255); } /* new colour, same folds and shading */
  c.putImageData(D, 0, 0); const t = map.clone(); t.image = cv; t.needsUpdate = true; return (GC[k] = t); };
const NAP_CARPET = () => GC.napCarpet || (GC.napCarpet = canvasTex(256, 256, (c, W) => { c.fillStyle = '#BEB0E2'; c.fillRect(0, 0, W, W); let sd = 5; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 9000; i++) { const v = rr(); c.fillStyle = v < 0.5 ? 'rgba(70,50,110,0.10)' : 'rgba(235,225,250,0.10)'; c.fillRect(rr() * W, rr() * W, 1 + rr() * 2, 1 + rr() * 2); } }, [2, 2]));
const FLUFF = () => GC.fluff || (GC.fluff = canvasTex(128, 128, (c, W) => { c.fillStyle = '#ECE5F2'; c.fillRect(0, 0, W, W); let sd = 9; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 4000; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(150,130,180,0.18)' : 'rgba(255,255,255,0.35)'; c.beginPath(); c.arc(rr() * W, rr() * W, 0.8 + rr() * 1.6, 0, 6.3); c.fill(); } }, [1, 1]));
const FABRIC_N = () => GC.fabricN || (GC.fabricN = (() => { const W = 128, cv = document.createElement('canvas'); cv.width = cv.height = W; const c = cv.getContext('2d'), im = c.createImageData(W, W); let sd = 3; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const h = new Float32Array(W * W); for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) h[y * W + x] = 0.5 * Math.sin(x * 1.6) * Math.sin(y * 1.6) + 0.35 * rr(); // fine weave + fuzz
  for (let y = 0; y < W; y++) for (let x = 0; x < W; x++) { const hx = h[y * W + (x + 1) % W] - h[y * W + (x + W - 1) % W], hy = h[((y + 1) % W) * W + x] - h[((y + W - 1) % W) * W + x], i = (y * W + x) * 4;
    im.data[i] = 128 - hx * 60; im.data[i + 1] = 128 - hy * 60; im.data[i + 2] = 255; im.data[i + 3] = 255; } c.putImageData(im, 0, 0);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 6); return t; })());
// fluffy pile: the rug drawn again as stacked shells, each a little higher and sparser (classic shell fur), in one soft colour
const FUR_A = () => GC.furA || (GC.furA = canvasTex(128, 128, (c, W) => { c.fillStyle = '#000'; c.fillRect(0, 0, W, W); let sd = 13; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 1500; i++) { const v = Math.floor(80 + rr() * 175); c.fillStyle = `rgb(${v},${v},${v})`; c.beginPath(); c.arc(rr() * W, rr() * W, 1.2 + rr() * 2.2, 0, 6.3); c.fill(); } }, [5, 5]));
function furShells(m, col, n = 9, hgt = 0.05) {
  const meshes = []; m.traverse((c) => { if (c.isMesh) meshes.push(c); });
  for (const c of meshes) { c.material = new THREE.MeshStandardMaterial({ color: col, roughness: 1 }); // base: the pile's colour, no flat print
    for (let i = 1; i <= n; i++) { const t = i / n, sh = new THREE.Mesh(c.geometry, new THREE.MeshStandardMaterial({ color: new THREE.Color(col).multiplyScalar(0.82 + 0.3 * t), roughness: 1, alphaMap: FUR_A(), alphaTest: 0.3 + 0.6 * t, transparent: false }));
      sh.position.copy(c.position); sh.quaternion.copy(c.quaternion); sh.scale.copy(c.scale); const ws = new THREE.Vector3(); c.parent.updateWorldMatrix(true, false); c.parent.getWorldScale(ws); sh.position.y += hgt * t / Math.max(1e-4, ws.y); sh.receiveShadow = true; c.parent.add(sh); } }
}
const WIND = { value: 0 };
function windify(m, amp, hgt) { // sway in world space: tips move, the base stays planted; works for instanced and plain meshes
  if (!m || m.userData.wind) return m; m.userData.wind = true; const prev = m.onBeforeCompile;
  m.onBeforeCompile = (sh, r) => { if (prev) prev(sh, r); sh.uniforms.uTime = WIND; sh.uniforms.uWA = { value: amp }; sh.uniforms.uWH = { value: hgt };
    sh.vertexShader = 'uniform float uTime; uniform float uWA; uniform float uWH;\n' + sh.vertexShader.replace('#include <project_vertex>', `
      vec4 lp = vec4(transformed, 1.0); vec4 o0 = vec4(0.0, 0.0, 0.0, 1.0);
      #ifdef USE_INSTANCING
        lp = instanceMatrix * lp; o0 = instanceMatrix * o0;
      #endif
      vec4 wpos = modelMatrix * lp; vec4 worg = modelMatrix * o0;
      float hh = clamp((wpos.y - worg.y) / uWH, 0.0, 1.4); float ph = worg.x * 0.37 + worg.z * 0.53;
      float gust = 0.65 + 0.35 * sin(uTime * 0.35 + ph * 0.2);
      wpos.x += (sin(uTime * 1.3 + ph) + 0.35 * sin(uTime * 3.1 + ph * 2.0)) * uWA * gust * hh * hh;
      wpos.z += (cos(uTime * 1.05 + ph * 1.3)) * uWA * 0.7 * gust * hh * hh;
      vec4 mvPosition = viewMatrix * wpos; gl_Position = projectionMatrix * mvPosition;`); };
  m.customProgramCacheKey = () => 'wind' + amp + '_' + hgt; m.needsUpdate = true; return m;
}
const TREE_RX = /^(pt_|lon_(oak|leafy|cherry|cypress|plane|tree)|tree|sp2?_(ipe|palm|tree)|nap_plant)/;
// living lawn: thousands of small grass tufts (three blades each, dark at the root, pale at the tip) that bend in the wind
function grassTuftGeo() { if (GC.tuft) return GC.tuft; const pos = [], col = [], c0 = new THREE.Color('#3E5F2C'), c1 = new THREE.Color('#A9BE78');
  for (let b = 0; b < 3; b++) { const a = b * 2.1, ca = Math.cos(a), sa = Math.sin(a), lean = 0.05 + b * 0.02, hb = 1 - b * 0.15;
    const P = [[-0.035, 0], [0.035, 0], [-0.018, 0.55], [0.018, 0.55], [0, 1]].map(([x, y]) => [x * ca + lean * y * sa, y * hb, x * sa - lean * y * ca]);
    for (const [i, j, k] of [[0, 1, 3], [0, 3, 2], [2, 3, 4]]) for (const q of [i, j, k]) { pos.push(...P[q]); const t = P[q][1]; const c = c0.clone().lerp(c1, t); col.push(c.r, c.g, c.b); } }
  const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3)); g.computeVertexNormals();
  return (GC.tuft = g); }
function lawnSkin(g, x0, x1, z0, z1, y) { // smooth textured turf over a lawn strip (the city's lawns), same 4 m scale as the parks
  x0 -= 0.15; x1 += 0.15; z0 -= 0.15; z1 += 0.15; const w = x1 - x0, d = z1 - z0, pg = new THREE.PlaneGeometry(w, d); pg.rotateX(-Math.PI / 2);
  const uv = pg.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setXY(k, uv.getX(k) * w / 4, uv.getY(k) * d / 4);
  const m = new THREE.Mesh(pg, mat('#FFFFFF', { r: 0.95, map: LAWN_NAT(), mapK: 'lawnNat' })); m.position.set((x0 + x1) / 2, y + 0.004, (z0 + z1) / 2); m.receiveShadow = true; g.add(m); }
function lawnGrass(g, x0, x1, z0, z1, y, avoid, seed) {
  if (!LAWN_BLADES) return; // lawns are smooth textured turf now: cleaner to read, lighter on phones
  const dens = GFX.low || MOBILE ? 8 : 24, n = Math.floor((x1 - x0) * (z1 - z0) * dens); let sd = seed; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const m = GC.grassM || (GC.grassM = windify(new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, side: THREE.DoubleSide }), 0.05, 0.32));
  const im = new THREE.InstancedMesh(grassTuftGeo(), m, n), o = new THREE.Object3D(), tint = new THREE.Color(); let k = 0;
  for (let i = 0; i < n * 1.6 && k < n; i++) { const x = x0 + rr() * (x1 - x0), z = z0 + rr() * (z1 - z0); if (avoid(x, z)) continue;
    const s = 0.2 + rr() * 0.22; o.position.set(x, y, z); o.rotation.set(0, rr() * 6.28, 0); o.scale.set(s * 1.4, s * (0.8 + rr() * 0.6), s * 1.4); o.updateMatrix(); im.setMatrixAt(k, o.matrix);
    im.setColorAt(k, tint.setHSL(0.22 + rr() * 0.07, 0.22 + rr() * 0.14, 0.4 + rr() * 0.16)); k++; }
  im.count = k; im.receiveShadow = true; im.castShadow = false; im.userData.swap = true; g.add(im); return im;
}
// ---- procedural trees, built like game trees: a barked trunk and branches, and a crown made of many small leaf-cluster cards
// (alpha-cut leaf textures, normals bent away from the crown centre so the crown shades softly like a real canopy)
// alpha-cut foliage texture without dark fringes: transparent pixels take the leaf colour so mipmaps of distant leaves stay green, not black-edged
function cardTex(cv, fill) { const W = cv.width, H = cv.height, d = cv.getContext('2d').getImageData(0, 0, W, H).data, o = new Uint8Array(d.length), f = new THREE.Color(fill);
  const fr = Math.round(Math.pow(f.r, 1 / 2.2) * 255), fg = Math.round(Math.pow(f.g, 1 / 2.2) * 255), fb = Math.round(Math.pow(f.b, 1 / 2.2) * 255);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, j = ((H - 1 - y) * W + x) * 4; if (d[i + 3] < 100) { o[j] = fr; o[j + 1] = fg; o[j + 2] = fb; o[j + 3] = 0; } else { o[j] = d[i]; o[j + 1] = d[i + 1]; o[j + 2] = d[i + 2]; o[j + 3] = 255; } }
  const t = new THREE.DataTexture(o, W, H); t.colorSpace = THREE.SRGBColorSpace; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.anisotropy = 4; t.needsUpdate = true; return t; }
function leafTex(kind) { const key = 'leafT_' + kind; if (GC[key]) return GC[key];
  const cv = document.createElement('canvas'); cv.width = cv.height = 256; const c = cv.getContext('2d'); let sd = kind.length * 977 + 3; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  const pal = { flame: ['#5E8A3C', '#4F7A34', '#577F39', '#669447', '#53783A'], oak: ['#4F6B36', '#5C7740', '#68834A', '#425C2E', '#748C55'], lime: ['#5A7438', '#678242', '#768F4E', '#4B6430', '#82985C'], cherry: ['#F4C6D6', '#EFB2C7', '#FBE1EA', '#E79DB8', '#FFFFFF'], fir: ['#34523A', '#3E5F42', '#2D4733', '#486A4C'] }[kind];
  for (let i = 0; i < (kind === 'fir' ? 260 : 150); i++) { const x = 128 + (rr() - 0.5) * 220 * Math.sqrt(rr()), y = 128 + (rr() - 0.5) * 220 * Math.sqrt(rr()); if (Math.hypot(x - 128, y - 128) > 118) continue;
    c.save(); c.translate(x, y); c.rotate(rr() * 6.28); c.fillStyle = pal[Math.floor(rr() * pal.length)];
    if (kind === 'flame' && rr() < 0.22) { c.fillStyle = rr() < 0.5 ? '#D9452B' : '#E8603A'; for (let k = 0; k < 5; k++) { c.rotate(1.2566); c.beginPath(); c.ellipse(0, -4.5, 3.2, 5, 0, 0, 6.3); c.fill(); } } // a few flame-red flowers in green leaves
    else if (kind === 'fir') { c.fillRect(-1.2, -11, 2.4, 22); } else if (kind === 'cherry' && rr() < 0.7) { for (let k = 0; k < 5; k++) { c.rotate(1.2566); c.beginPath(); c.ellipse(0, -5, 3.4, 5.4, 0, 0, 6.3); c.fill(); } }
    else { c.beginPath(); c.ellipse(0, 0, (6 + rr() * 3) * (kind === 'flame' ? 1.5 : 1), (11 + rr() * 4) * (kind === 'flame' ? 1.3 : 1), 0, 0, 6.3); c.fill(); c.strokeStyle = 'rgba(0,0,0,0.18)'; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -11); c.lineTo(0, 11); c.stroke(); }
    c.restore(); }
  return (GC[key] = cardTex(cv, pal[0])); }
function barkTex() { if (GC.bark) return GC.bark; const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const c = cv.getContext('2d'); c.fillStyle = '#6B5240'; c.fillRect(0, 0, 64, 256); let sd = 7; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  for (let i = 0; i < 90; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(40,28,20,0.45)' : 'rgba(150,125,100,0.35)'; c.fillRect(rr() * 64, rr() * 256, 2 + rr() * 4, 20 + rr() * 60); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; return (GC.bark = t); }
function frondTex() { if (GC.frond) return GC.frond; const cv = document.createElement('canvas'); cv.width = 64; cv.height = 256; const c = cv.getContext('2d'); let sd = 5; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  c.strokeStyle = '#7C8A4A'; c.lineWidth = 3; c.beginPath(); c.moveTo(32, 256); c.lineTo(32, 0); c.stroke();
  for (let y = 250; y > 6; y -= 5) { const L = 28 * Math.sin(Math.PI * (1 - y / 256) * 0.95 + 0.15); for (const sg of [-1, 1]) { c.strokeStyle = ['#8AAE52', '#98BC5C', '#A4C668', '#7EA24A'][Math.floor(rr() * 4)]; c.lineWidth = 3.2; c.beginPath(); c.moveTo(32, y); c.quadraticCurveTo(32 + sg * L * 0.5, y - 6, 32 + sg * L, y - 14 + rr() * 4); c.stroke(); } }
  return (GC.frond = cardTex(cv, '#90B458')); }
function procPalm() { // coconut palm: a curved ringed trunk and a crown of arching fronds (alpha-cut leaflets)
  let sd = 991; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); const g = new THREE.Group(), V = (x, y, z) => new THREE.Vector3(x, y, z), geos = [];
  const P = []; for (let i = 0; i <= 10; i++) { const t = i / 10; P.push(V(0.13 * t * t, 0.86 * t, 0.03 * Math.sin(t * 3))); }
  for (let i = 0; i < 10; i++) { const a = P[i], b = P[i + 1], d = b.clone().sub(a), L = d.length(), r0 = 0.032 - i * 0.0011, cg = new THREE.CylinderGeometry(r0 - 0.001, r0, L, 8, 1, true); cg.translate(0, L / 2, 0); cg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize())); cg.translate(a.x, a.y, a.z); geos.push(cg); }
  const bt = barkTex().clone(); bt.needsUpdate = true; bt.repeat.set(1, 6);
  const trunk = new THREE.Mesh(mergeGeometries(geos), new THREE.MeshStandardMaterial({ map: bt, color: '#C9B89A', roughness: 0.95 })); trunk.castShadow = trunk.receiveShadow = true; g.add(trunk);
  const top = P[10]; const pos = [], nrm = [], uv = [], col = [];
  const N = 15; for (let f = 0; f < N; f++) { const az = (f / N) * Math.PI * 2 + rr() * 0.3, up = f % 3 === 0 ? 0.75 : f % 3 === 1 ? 0.25 : -0.15, len = 0.36 + rr() * 0.1, wd = 0.075, S = 8, dir = V(Math.cos(az), 0, Math.sin(az)), side = V(-Math.sin(az), 0, Math.cos(az));
    let prev = null; for (let k = 0; k <= S; k++) { const t = k / S, p = top.clone().add(dir.clone().multiplyScalar(len * t)).add(V(0, (up * t - 1.1 * t * t) * len * 0.75, 0)), w = wd * Math.sin(Math.PI * Math.min(1, t * 1.1 + 0.05)), l = p.clone().add(side.clone().multiplyScalar(w)), r = p.clone().sub(side.clone().multiplyScalar(w)), n = V(0, 1, 0).add(dir.clone().multiplyScalar(0.3)).normalize(), sh = 0.95 + 0.15 * (1 - t);
      if (prev) for (const [q, u, v] of [[prev[0], 0, prev[2]], [prev[1], 1, prev[2]], [r, 1, t], [prev[0], 0, prev[2]], [r, 1, t], [l, 0, t]]) { pos.push(q.x, q.y, q.z); nrm.push(n.x, n.y, n.z); uv.push(u, v); col.push(sh, sh, sh); }
      prev = [l, r, t]; } }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); lg.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); lg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); lg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const lm = new THREE.MeshStandardMaterial({ map: frondTex(), alphaTest: 0.45, side: THREE.DoubleSide, vertexColors: true, roughness: 0.85 });
  const fr = new THREE.Mesh(lg, lm); fr.castShadow = fr.receiveShadow = true; fr.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: lm.map, alphaTest: 0.45 }); g.add(fr);
  const nuts = []; for (let k = 0; k < 5; k++) { const a = k * 1.3, sg = new THREE.SphereGeometry(0.02, 8, 6); sg.translate(top.x + Math.cos(a) * 0.035, top.y - 0.03, top.z + Math.sin(a) * 0.035); nuts.push(sg); }
  const nm = new THREE.Mesh(mergeGeometries(nuts), new THREE.MeshStandardMaterial({ color: '#7A6234', roughness: 0.8 })); nm.castShadow = true; g.add(nm);
  return g; }
function procTree(kind) {
  if (kind === 'palm') return procPalm();
  let sd = kind.length * 131 + 17; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); const g = new THREE.Group();
  const geos = [], V = (x, y, z) => new THREE.Vector3(x, y, z);
  const limb = (a, b, r0, r1) => { const d = b.clone().sub(a), L = d.length(), cg = new THREE.CylinderGeometry(r1, r0, L, 7, 1, true); cg.translate(0, L / 2, 0);
    cg.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(V(0, 1, 0), d.normalize())); cg.translate(a.x, a.y, a.z); geos.push(cg); };
  const crown = { flame: [0.72, 0.5, 0.15], oak: [0.62, 0.36, 0.3], lime: [0.64, 0.27, 0.36], cherry: [0.58, 0.4, 0.24], fir: [0.55, 0.2, 0.45] }[kind]; const C = V(0, crown[0], 0);
  // trunk and limbs reaching into the crown
  const top = kind === 'fir' ? 0.95 : 0.4 + rr() * 0.06; limb(V(0, 0, 0), V(0.01, top, 0), kind === 'fir' ? 0.04 : 0.06, 0.042);
  const tips = [];
  if (kind !== 'fir') for (let i = 0; i < 6; i++) { const a = i * 1.047 + rr() * 0.5, tip = V(Math.cos(a) * crown[1] * (0.55 + rr() * 0.35), crown[0] + (rr() - 0.35) * crown[2] * 1.1, Math.sin(a) * crown[1] * (0.55 + rr() * 0.35)), mid = V(0, top, 0).lerp(tip, 0.45).add(V(0, 0.04, 0)); limb(V(0, top - 0.03, 0), mid, 0.034, 0.022); limb(mid, tip, 0.022, 0.008); tips.push(tip); }
  const trunk = new THREE.Mesh(mergeGeometries(geos), new THREE.MeshStandardMaterial({ map: barkTex(), roughness: 0.95 })); trunk.castShadow = trunk.receiveShadow = true; g.add(trunk);
  // leaf cards
  const pos = [], nrm = [], uv = [], col = [], tint = new THREE.Color();
  const card = (p, s, ry, tilt, shade) => { const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(tilt, ry, (rr() - 0.5) * 0.6));
    const cs = [[-1, -1, 0, 0], [1, -1, 1, 0], [1, 1, 1, 1], [-1, 1, 0, 1]].map(([x, y, u, v]) => ({ p: V(x * s, y * s, 0).applyQuaternion(q).add(p), u, v }));
    for (const i of [0, 1, 2, 0, 2, 3]) { const P = cs[i].p; pos.push(P.x, P.y, P.z); const n = P.clone().sub(C).multiply(V(1, kind === 'fir' ? 0.4 : 0.8, 1)).normalize(); nrm.push(n.x, n.y + 0.25, n.z); uv.push(cs[i].u, cs[i].v); col.push(shade, shade, shade); } };
  if (kind === 'fir') { for (let y = 0.16; y < 1.0; y += 0.045) { const R = 0.26 * (1 - (y - 0.16) / 0.9) + 0.03, n = Math.max(4, Math.round(R * 40));
      for (let k = 0; k < n; k++) { const a = (k / n) * 6.28 + y * 7, p = V(Math.cos(a) * R * 0.7, y, Math.sin(a) * R * 0.7); card(p, 0.08 + R * 0.35, -a + Math.PI / 2, 0.9, 0.75 + 0.3 * (y + rr() * 0.3)); } } }
  else { const n = { oak: 260, lime: 240, cherry: 220, flame: 300 }[kind];
    const cl = tips.map((t) => [t.clone().add(V(0, 0.05, 0)), 0.13 + rr() * 0.08]); cl.push([C.clone().add(V(0, crown[2] * 0.55, 0)), crown[1] * 0.55]);
    for (let i = 0; i < n; i++) { const [cc, cr] = cl[Math.floor(rr() * cl.length)], u = rr() * 6.28, w = Math.acos(2 * rr() - 1), r = Math.pow(rr(), 0.4) * cr; const p = V(Math.sin(w) * Math.cos(u) * r * 1.15, Math.cos(w) * r * 0.85, Math.sin(w) * Math.sin(u) * r * 1.15).add(cc);
      const shade = (kind === 'flame' ? 0.58 : 0.5) + (kind === 'flame' ? 0.3 : 0.42) * Math.min(1, Math.max(0, (p.y - C.y) / crown[2] * 0.5 + 0.5)) + (rr() - 0.5) * (kind === 'flame' ? 0.05 : 0.14); for (let k = 0; k < 2; k++) card(p, 0.075 + rr() * 0.05, rr() * 6.28, (rr() - 0.5) * 1.4, shade); } }
  const lg = new THREE.BufferGeometry(); lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); lg.setAttribute('normal', new THREE.Float32BufferAttribute(nrm, 3)); lg.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); lg.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
  const lm = new THREE.MeshStandardMaterial({ map: leafTex(kind), alphaTest: 0.45, side: THREE.DoubleSide, vertexColors: true, roughness: 0.85 });
  const leaves = new THREE.Mesh(lg, lm); leaves.castShadow = leaves.receiveShadow = true; leaves.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: lm.map, alphaTest: 0.45 }); g.add(leaves);
  return g;
}
const DIO_RC = 0.38; // corner radius of a diorama room (on the wall line)
// a quarter ring standing up: radii r0..r1 around (cx, cz), from world direction (ax, az) to (bx, bz), height h from y; optional soft bevel
function ringQ(parent, cx, cz, ax, az, bx, bz, r0, r1, h, y, c, bev = 0, o = { r: 0.9 }) {
  const a1 = Math.atan2(-az, ax), a2 = Math.atan2(-bz, bx); let d = a2 - a1; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI;
  const sh = new THREE.Shape(), q0 = r0 + bev, q1 = r1 - bev; sh.absarc(0, 0, q1, a1, a1 + d, d < 0); sh.absarc(0, 0, q0, a1 + d, a1, d >= 0); sh.closePath();
  const geo = new THREE.ExtrudeGeometry(sh, { depth: Math.max(0.001, h - 2 * bev), curveSegments: GFX.low ? 8 : 14, bevelEnabled: bev > 0, bevelSize: bev, bevelThickness: bev, bevelSegments: 3 });
  geo.rotateX(-Math.PI / 2); const m = new THREE.Mesh(geo, mat(c, o)); m.position.set(cx, y + bev, cz); m.castShadow = m.receiveShadow = true; parent.add(m); return m;
}
// rounded-corner room: one curved corner piece per room corner (its own cutaway group, judged by its diagonal)
function dioCorner(g, RS, q, sx, sz, owA, owB) {
  const px = sx < 0 ? q.x0 : q.x1, pz = sz < 0 ? q.z0 : q.z1, R = DIO_RC, cx = px - sx * R, cz = pz - sz * R, h = RS.h, ow = owA && owB, IN = ow ? 0.135 : 0.09, OUT = ow ? 0 : 0.06;
  const cg = new THREE.Group(); g.add(cg); cg.userData.n = [sx * Math.SQRT1_2, sz * Math.SQRT1_2]; cg.userData.p = [px, pz]; cg.userData.corner = true;
  if (RKIT) { const kx = cx - (owA ? sx * 0.02 : 0), kz = cz - (owB ? sz * 0.02 : 0); // follows its walls 2 cm proud of the building's outer wall (see wallSegV2)
    const pc = (name, c, par, y, sy, r) => { const m = KM(name, c, r); m.position.set(kx, y, kz); m.scale.set(sx, sy, sz); par.add(m); return m; };
    pc('k_c_wall_in', RS.wall, cg, 0.1, h, 0.95).material = ttMat(RS.wall, lowOf(RS.wall, RS.inBase)); if (!ow) pc('k_c_wall_out', RS.wall, cg, 0.1, h, 0.95).material = ttMat(FAC_HI, FAC_LO); pc('k_c_skirt', KIT_C.trim, cg, 0.1, 1, 0.6);
    const rim = new THREE.Group(); rim.position.y = h + 0.1; rim.userData.keepY = true; cg.add(rim); pc('k_c_rim', RS.rim || KIT_C.rim, rim, 0, 1, 0.72);
    if (!ow) { const base = new THREE.Group(); base.userData.keepY = true; cg.add(base); pc('k_c_plinth', KIT_C.plinth, base, 0.1, 1, 0.85); }
    return cg; }
  ringQ(cg, cx, cz, sx, 0, 0, sz, R - IN, R, h, 0.1, RS.wall, 0, { r: 0.95 });
  if (OUT) ringQ(cg, cx, cz, sx, 0, 0, sz, R, R + OUT, h, 0.1, OUT_WALL, 0, { r: 0.95 });
  ringQ(cg, cx, cz, sx, 0, 0, sz, R - IN - 0.035, R - IN + 0.005, 0.14, 0.1, RS.inBase, 0);
  const rim = new THREE.Group(); rim.position.y = h + 0.17; rim.userData.keepY = true; cg.add(rim);
  ringQ(rim, cx, cz, sx, 0, 0, sz, R - IN - 0.12, R + OUT + (ow ? 0 : 0.1), 0.22, -0.11, OUT_CAP, 0.07, { r: 0.8 });
  if (OUT) { const base = new THREE.Group(); base.userData.keepY = true; cg.add(base); ringQ(base, cx, cz, sx, 0, 0, sz, R + OUT - 0.005, R + OUT + 0.025, 0.46, 0.1, RS.plinth || OUT_BASE, 0); }
  return cg;
}
function wallSegV2(x0, z0, x1, z1, S, parent) {
  if (S.chunky && parent.userData.q && !LOOK_DAY) { const q = parent.userData.q, R = DIO_RC, isC = (x, z) => (Math.abs(x - q.x0) < 1e-3 || Math.abs(x - q.x1) < 1e-3) && (Math.abs(z - q.z0) < 1e-3 || Math.abs(z - q.z1) < 1e-3);
    const ax = Math.abs(z1 - z0) < 1e-6, sg = ax ? Math.sign(x1 - x0) : Math.sign(z1 - z0); // trim the ends that are room corners: the curved corner piece takes over there
    if (isC(x0, z0)) { if (ax) x0 += sg * R; else z0 += sg * R; } if (isC(x1, z1)) { if (ax) x1 -= sg * R; else z1 -= sg * R; } }
  const alongX = Math.abs(z1 - z0) < 1e-6, len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0), h = S.h, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (len < 0.05) return;
  const n = (parent.userData && parent.userData.n) || [0, -1], ow = !!parent.userData.outer, IN = ow ? 0.135 : 0.09, OUT = ow ? 0 : 0.06; // n points outside
  const run = (a, b, hh, y, c, r, o, ex = 0) => wbox(parent, alongX, cx, cz, 1, n, -len / 2 - ex, len / 2 + ex, a, b, hh, y, c, r, o);
  if (LOOK_DAY) { // daylight look: thin square walls in the room colour, one light façade colour outside, a slim cap and a soft warm-white strip; the entrance side is a glass front
    const paint = parent.userData.wall || S.wall;
    if (parent.userData.door) {
      const g = GC.glassM || (GC.glassM = new THREE.MeshPhysicalMaterial({ color: '#EEF4F7', transparent: true, opacity: 0.13, roughness: 0.05, metalness: 0, depthWrite: false }));
      const hg = h + DAY.glassUp, pane = new THREE.Mesh(new THREE.BoxGeometry(alongX ? len : 0.02, hg, alongX ? 0.02 : len), g); pane.position.set(cx, hg / 2 + 0.1, cz); pane.renderOrder = 2; parent.add(pane);
      const fr = DAY.frame; run(-0.02, 0.02, 0.03, 0.115, fr, 0.008, { m: 0.6, r: 0.35 }); run(-0.02, 0.02, 0.035, hg + 0.085, fr, 0.008, { m: 0.6, r: 0.35 });
      for (const e of [-1, 1]) put(rbox(alongX ? 0.03 : 0.035, hg, alongX ? 0.035 : 0.03, fr, 0.008, { m: 0.6, r: 0.35 }), alongX ? cx + e * (len / 2 - 0.015) : cx, hg / 2 + 0.1, alongX ? cz : cz + e * (len / 2 - 0.015), parent);
      return;
    }
    run(-0.06, 0, h, h / 2 + 0.1, paint, 0.006, { r: 0.92 }); if (!ow) run(0, 0.04, h, h / 2 + 0.1, DAY.ext, 0.006, { r: 0.92 });
    if (parent.parent) aoStrip(parent.parent, cx, cz, len, n, 0.06, 0.45);
    const cap = new THREE.Group(); cap.position.y = h + 0.1; cap.userData.keepY = true; parent.add(cap); parent.userData.rim = cap;
    wbox(cap, alongX, cx, cz, 1, n, -len / 2 - 0.01, len / 2 + 0.01, -0.075, ow ? 0.005 : 0.055, 0.035, 0.0175, '#F7EEE9', 0.012, { r: 0.8 });
    if (len > 0.6) put(rbox(alongX ? len - 0.12 : 0.012, 0.018, alongX ? 0.012 : len - 0.12, '#FFF1D8', 0.004, { e: '#FFF1D8', ei: 0.9 }), cx - n[0] * 0.066, h + 0.03, cz - n[1] * 0.066, parent);
    return;
  }
  if (S.chunky && RKIT) { // kit wall: paint layer, outer layer (a shade deeper), skirting; crown and plinth keep their shape under the cutaway
    const yaw = Math.atan2(n[0], n[1]), paint = parent.userData.wall || S.wall;
    // against the building's outer wall the kit lining's painted face would sit exactly in the plane of that wall's inner face (both 12 cm in from
    // the line): the two then z-fight and the room colour blinks to the wall's cream. A depth bias hid it on some GPUs only (not on iPhone), so the
    // whole kit wall stands 2 cm proud of the outer wall instead: no shared plane left, whatever the GPU.
    const pr = ow ? 0.02 : 0, px = cx - n[0] * pr, pz = cz - n[1] * pr;
    const pc = (name, c, par, y, sy, r) => { const m = KM(name, c, r); m.position.set(px, y, pz); m.rotation.y = yaw; m.scale.set(len, sy, 1); par.add(m); return m; };
    pc('k_wall_in', paint, parent, 0.1, h, 0.95).material = ttMat(paint, lowOf(paint, paint === S.wall ? S.inBase : null)); if (!ow) pc('k_wall_out', paint, parent, 0.1, h, 0.95).material = ttMat(FAC_HI, FAC_LO); /* inside: the room's two tones; outside: one shared corridor façade */ pc('k_skirt', KIT_C.trim, parent, 0.1, 1, 0.6);
    const rim = new THREE.Group(); rim.position.y = h + 0.1; rim.userData.keepY = true; parent.add(rim); pc('k_rim', S.rim || KIT_C.rim, rim, 0, 1, 0.72); parent.userData.rim = rim;
    if (!ow) { const base = new THREE.Group(); base.userData.keepY = true; parent.add(base); pc('k_plinth', KIT_C.plinth, base, 0.1, 1, 0.85); }
    if (S.ao && parent.parent) aoStrip(parent.parent, cx, cz, len, n, 0.12);
    if (S.stars && len > 1) { let sd = Math.round((x0 * 7 + z0 * 13) * 10); const rr = () => ((sd = (sd * 16807 + 11) % 2147483647) / 2147483647);
      for (let u = 0.3; u < len - 0.2; u += 0.32) { const px = alongX ? Math.min(x0, x1) + u : cx, pz = alongX ? cz : Math.min(z0, z1) + u, y = h - 0.15 - rr() * 0.55;
        put(leaf(0.04 + rr() * 0.035, '#FFF1B8', { e: '#FFE38A', ei: 2.2 }), px - n[0] * 0.13, y, pz - n[1] * 0.13, parent); } }
    if (len > 0.6) put(rbox(alongX ? len - 0.1 : 0.03, 0.05, alongX ? 0.03 : len - 0.1, '#FFE6B0', 0.01, { e: '#FFD58A', ei: 1.6 }), cx - n[0] * 0.14, h - 0.02, cz - n[1] * 0.14, parent);
    return;
  }
  run(-IN, 0, h, h / 2 + 0.1, parent.userData.wall || S.wall, 0.05, { r: 0.95 });
  if (OUT) run(0, OUT, h, h / 2 + 0.1, OUT_WALL, 0.03, { r: 0.95 });
  if (S.chunky) { // diorama wall: a thick, fully rounded cream rim and a tall sage plinth outside (kept within 8.5 cm so a neighbour's lining still hides it)
    // the rim lives in its own group that keeps its shape when the cutaway squashes the wall to hip height
    const rim = new THREE.Group(); rim.position.y = h + 0.17; rim.userData.keepY = true; parent.add(rim);
    wbox(rim, alongX, cx, cz, 1, n, -len / 2 - 0.03, len / 2 + 0.03, -IN - 0.12, OUT + (ow ? 0 : 0.1), 0.22, 0, OUT_CAP, 0.11, { r: 0.8 });
    parent.userData.rim = rim;
    if (OUT) { const base = new THREE.Group(); base.userData.keepY = true; parent.add(base); wbox(base, alongX, cx, cz, 1, n, -len / 2 - 0.005, len / 2 + 0.005, OUT - 0.005, OUT + 0.025, 0.46, 0.33, S.plinth || OUT_BASE, 0.03, { r: 0.9 }); }
    if (S.ao && parent.parent) aoStrip(parent.parent, cx, cz, len, n, IN);
  } else {
  run(-IN - 0.04, OUT + (ow ? 0 : 0.04), 0.1, h + 0.15, OUT_CAP, 0.045, { r: 0.85 }, 0.02); // soft rounded rim
  if (OUT) run(OUT - 0.005, OUT + 0.045, 0.22, 0.21, OUT_BASE, 0.02, { r: 0.9 }, 0.005); // sage skirting outside
  }
  run(-IN - 0.035, -IN + 0.005, 0.14, 0.17, S.inBase, 0.02, { r: 0.9 }, 0.005);
  if (false) { const ds = Math.sign(alongX ? x1 - x0 : z1 - z0) || 1, bm = (OUT - IN) / 2; // rounded column at each end of the run, centred in the wall's thickness
    for (const [px, pz, d] of [[x0, z0, ds], [x1, z1, -ds]]) { const ax = px + (alongX ? d * 0.07 : 0) + n[0] * bm, az = pz + (alongX ? 0 : d * 0.07) + n[1] * bm;
      const rim = parent.userData.rim || parent; put(cyl(0.135, 0.135, h, OUT_WALL, { r: 0.95 }), ax, h / 2 + 0.1, az, parent);
      put(cyl(0.2, 0.2, 0.22, OUT_CAP, { r: 0.8 }), ax, rim === parent ? h + 0.17 : 0, az, rim); put(sph(0.2, OUT_CAP, { r: 0.8 }), ax, (rim === parent ? h + 0.17 : 0) + 0.11, az, rim).scale.y = 0.4; } }
  else if (S.posts && !ow) { const ds = Math.sign(alongX ? x1 - x0 : z1 - z0) || 1;
    for (const [px, pz, d] of [[x0, z0, ds], [x1, z1, -ds]]) { wbox(parent, alongX, px, pz, d, n, -0.02, 0.2, -IN - 0.02, OUT + 0.02, h, h / 2 + 0.1, OUT_WALL, 0.05, { r: 0.95 }); wbox(parent, alongX, px, pz, d, n, -0.04, 0.23, -IN - 0.05, OUT + 0.03, 0.1, h + 0.16, OUT_CAP, 0.04, { r: 0.85 }); } }
  if (S.stars && len > 1) { let sd = Math.round((x0 * 7 + z0 * 13) * 10); const rr = () => ((sd = (sd * 16807 + 11) % 2147483647) / 2147483647);
    for (let u = 0.3; u < len - 0.2; u += 0.32) { const px = alongX ? Math.min(x0, x1) + u : cx, pz = alongX ? cz : Math.min(z0, z1) + u, y = h - 0.15 - rr() * 0.55;
      put(leaf(0.04 + rr() * 0.035, '#FFF1B8', { e: '#FFE38A', ei: 2.2 }), px - n[0] * (IN + 0.01), y, pz - n[1] * (IN + 0.01), parent); } }
  if (len > 0.6) put(rbox(alongX ? len - 0.1 : 0.03, 0.05, alongX ? 0.03 : len - 0.1, '#FFE6B0', 0.01, { e: '#FFD58A', ei: 1.6 }), cx - n[0] * (IN + 0.02), h - 0.02, cz - n[1] * (IN + 0.02), parent); // warm cove light under the rim
}
function kitWin(parent, x, z, nx, nz) { // kit window: deep rounded frame, cross mullion, glass through the wall, a sill on both faces
  const g = grp(x, z, Math.atan2(nx, nz), parent);
  for (const k of ['k_win_l', 'k_win_r', 'k_win_t', 'k_win_b', 'k_win_mv', 'k_win_mh', 'k_win_sill', 'k_win_sill_out']) g.add(KM(k, KIT_C.trim, 0.6));
  const gl = new THREE.Mesh(RKIT.k_win_glass, mat(KIT_C.glass, { r: 0.15, e: '#A9D3F2', ei: 0.4 })); g.add(gl); return g;
}
function archWindow(parent, x, z, rot, th) { // tall window with a round top, slim cream frame, sky glass through the whole wall, a sill on both faces
  const g = grp(x, z, rot, parent), fm = '#FBF4E8', W = 1.05, Hr = 1.0, y0 = 0.85, R = W / 2, d = th + 0.04;
  const glass = mat('#9CCBEE', { r: 0.15, e: '#A9D3F2', ei: 0.45 });
  put(new THREE.Mesh(new THREE.BoxGeometry(W, Hr, d), glass), 0, y0 + Hr / 2, 0, g);
  for (const s of [-1, 1]) { const cap = new THREE.Mesh(GC.archCap || (GC.archCap = new THREE.CircleGeometry(R, 24, 0, Math.PI)), glass); cap.position.set(0, y0 + Hr, s * (d / 2 + 0.002)); if (s < 0) cap.rotation.y = Math.PI; g.add(cap); }
  for (const s of [-1, 1]) { put(rbox(0.08, Hr, d + 0.04, fm, 0.02, { r: 0.85 }), s * (R + 0.04), y0 + Hr / 2, 0, g);
    const ar = new THREE.Mesh(new THREE.TorusGeometry(R + 0.04, 0.045, 8, 24, Math.PI), mat(fm, { r: 0.85 })); ar.position.set(0, y0 + Hr, s * (d / 2 + 0.01)); g.add(ar);
    put(rbox(W + 0.3, 0.07, 0.16, fm, 0.03, { r: 0.85 }), 0, y0 - 0.03, s * (d / 2 + 0.06), g); }
  put(rbox(0.05, Hr + R * 0.95, d + 0.02, fm, 0.01, { r: 0.85 }), 0, y0 + (Hr + R * 0.95) / 2, 0, g); put(rbox(W, 0.05, d + 0.02, fm, 0.01, { r: 0.85 }), 0, y0 + Hr * 0.55, 0, g);
  return g;
}
function wallSegS(x0, z0, x1, z1, S, parent) {
  if (S.v2) return wallSegV2(x0, z0, x1, z1, S, parent);
  const alongX = Math.abs(z1 - z0) < 1e-6, len = alongX ? Math.abs(x1 - x0) : Math.abs(z1 - z0), th = 0.15, h = S.h, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
  if (len < 0.05) return;
  const n = (parent.userData && parent.userData.n) || [0, -1]; // own side only (−n): a neighbour's wall on the same line never overlaps this one
  const run = (a, b, hh, y, c, r, o, ex = 0) => wbox(parent, alongX, cx, cz, 1, n, -len / 2 - ex, len / 2 + ex, a, b, hh, y, c, r, o);
  run(-th, 0, h, h / 2 + 0.1, S.wall, 0.1, { r: 0.95 });
  run(-th - 0.06, 0.06, 0.12, h + 0.15, S.cap, 0.06, { r: 0.9 }, 0.03);
  run(-th - 0.03, 0.03, 0.16, 0.2, S.base, 0.05, { r: 0.95 }, 0.01);
  if (S.posts) { const ds = Math.sign(alongX ? x1 - x0 : z1 - z0) || 1;
    for (const [px, pz, d] of [[x0, z0, ds], [x1, z1, -ds]]) { wbox(parent, alongX, px, pz, d, n, -0.04, 0.34, -th - 0.04, 0.04, h, h / 2 + 0.1, S.wall, 0.06, { r: 0.95 }); wbox(parent, alongX, px, pz, d, n, -0.05, 0.39, -th - 0.09, 0.05, 0.14, h + 0.17, S.cap, 0.06, { r: 0.9 }); wbox(parent, alongX, px, pz, d, n, -0.04, 0.37, -th - 0.06, 0.04, 0.2, 0.2, S.base, 0.05, { r: 0.95 }); } } // square pillar: cap + plinth
  if (S.lights && len > 1.5) for (let u = 0.6; u < len - 0.3; u += 0.75) put(leaf(0.045, '#FFE2A8', { e: '#FFD27A', ei: 1.6 }), (alongX ? Math.min(x0, x1) + u : cx) - n[0] * th / 2, h + 0.02 - Math.abs(Math.sin(u * 2.1)) * 0.12, (alongX ? cz : Math.min(z0, z1) + u) - n[1] * th / 2, parent);
}
// sheet C #4: cream frame, four panes split by a cross mullion, a deep sill
function kitWindow(parent, x, z, rot) {
  const g = grp(x, z, rot, parent), fm = '#F4E9D2', W = 1.1, Hh = 1.15, y0 = 1.05, fw = 0.09;
  put(rbox(W, Hh, 0.04, '#8DA3BE', 0.01, { r: 0.15, e: '#9FB7D6', ei: 0.18 }), 0, y0 + Hh / 2, 0, g);
  for (const sx of [-1, 1]) put(rbox(fw, Hh, 0.1, fm, 0.02, { r: 0.85 }), sx * (W / 2 + fw / 2), y0 + Hh / 2, 0, g);
  put(rbox(W + 2 * fw, fw, 0.1, fm, 0.02, { r: 0.85 }), 0, y0 + Hh + fw / 2, 0, g);
  put(rbox(W + 2 * fw + 0.16, 0.07, 0.2, fm, 0.025, { r: 0.85 }), 0, y0 - 0.035, 0.04, g);
  put(rbox(0.05, Hh, 0.07, fm, 0.01, { r: 0.85 }), 0, y0 + Hh / 2, 0, g); put(rbox(W, 0.05, 0.07, fm, 0.01, { r: 0.85 }), 0, y0 + Hh / 2, 0, g);
  return g;
}
function wallWithGap(x0, z0, x1, z1, gap, g, S) {
  const seg = (a, b, c, d) => (S ? wallSegS(a, b, c, d, S, g) : wallSeg(a, b, c, d, ROOM_H, '#FFFFFF', g));
  if (!gap) { seg(x0, z0, x1, z1); return; }
  const alongX = Math.abs(z1 - z0) < 1e-6, a = alongX ? x0 : z0, b = alongX ? x1 : z1, c = gap, hw = DOOR_W / 2 + 0.08;
  if (c - hw - a > 0.2) alongX ? seg(a, z0, c - hw, z0) : seg(x0, a, x0, c - hw);
  if (b - (c + hw) > 0.2) alongX ? seg(c + hw, z0, b, z0) : seg(x0, c + hw, x0, b);
}
function buildRoom(r) {
  if (world.roomGroups[r.id]) { const og = world.roomGroups[r.id]; if (og.parent) og.parent.remove(og); }
  const g = new THREE.Group(); scene.add(g); world.roomGroups[r.id] = g;
  const def = ROOMS[r.type], Z = def.oneSt ? { ...SIZES[r.size], st: 1 } : SIZES[r.size], q = roomRect(r), dp = doorPt(r, 0);
  const RS = ROOM_STYLE[r.type];
  const fm = RS && RS.floorMap ? mat('#FFFFFF', { map: RS.floorMap(), mapK: 'fm' + r.type, r: 0.6 }) : RS && RS.wood ? mat('#FFFFFF', { map: woodTex(RS.wood[0], RS.wood[1], [5, 5]), mapK: 'wk' + r.type, r: 0.8 }) : RS && RS.floor ? mat(RS.floor, { r: 1 }) : r.type === 'budget' || r.type === 'cafe' ? mat('#FFFFFF', { map: woodTex(def.floor, '#D9AE78', [3, 3]), mapK: 'w' + r.type }) : mat(def.floor, { r: 0.9 });
  if (RS && RS.chunky) { const x0 = q.x0 + 0.04, x1 = q.x1 - 0.04, z0 = q.z0 + 0.04, z1 = q.z1 - 0.04, rr = DIO_RC - 0.04, sh = new THREE.Shape(); // rounded floor that follows the curved corners (UVs in metres)
    sh.moveTo(x0 + rr, -z0); sh.lineTo(x1 - rr, -z0); sh.absarc(x1 - rr, -z0 - rr, rr, Math.PI / 2, 0, true); sh.lineTo(x1, -z1 + rr); sh.absarc(x1 - rr, -z1 + rr, rr, 0, -Math.PI / 2, true);
    sh.lineTo(x0 + rr, -z1); sh.absarc(x0 + rr, -z1 + rr, rr, -Math.PI / 2, -Math.PI, true); sh.lineTo(x0, -z0 - rr); sh.absarc(x0 + rr, -z0 - rr, rr, Math.PI, Math.PI / 2, true);
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.04, bevelEnabled: false, curveSegments: 10 }); geo.rotateX(-Math.PI / 2);
    const fW = x1 - x0, fD = z1 - z0, metre = (m) => { if (!m.map) return m; const k = 'fmM' + m.uuid + '|' + fW.toFixed(2) + '|' + fD.toFixed(2); // same tiling as the flat floor, in metre UVs
      if (!MC[k]) { const tx = m.map.clone(); tx.repeat.set(m.map.repeat.x / fW, m.map.repeat.y / fD); tx.needsUpdate = true; MC[k] = m.clone(); MC[k].map = tx; } return MC[k]; };
    const fl = new THREE.Mesh(geo, RS.floorM ? RS.floorM() : metre(FLOOR_KIND[r.type] && !RS.model ? floorMat(FLOOR_KIND[r.type], fW, fD) : fm)); fl.position.y = 0.09; fl.receiveShadow = true; g.add(fl); }
  else floorPlane(q.x0 + 0.04, q.x1 - 0.04, q.z0 + 0.04, q.z1 - 0.04, FLOOR_KIND[r.type] && !(RS && RS.model) ? floorMat(FLOOR_KIND[r.type], q.x1 - q.x0 - 0.08, q.z1 - q.z0 - 0.08) : fm, 0.11, g);
  const near = (a, b) => Math.abs(a - b) < 0.05;
  const outer = (x, z, nz) => !inFloor(x, z) && !(nz > 0 && z > 6.5), mx = (q.x0 + q.x1) / 2, mz = (q.z0 + q.z1) / 2;
  const ca0 = Math.cos(r.a), sa0 = Math.sin(r.a), loc = (nx, nz) => Math.round(nx * ca0 - nz * sa0) + ',' + Math.round(nx * sa0 + nz * ca0); // world side -> room-local side
  const doorSide = (sg, d) => { sg.userData.door = !!d; return sg; };
  const wallG = [], V2 = !!(RS && RS.v2); const side = (nx, nz, ow) => { const sg = new THREE.Group(); g.add(sg); sg.userData.n = [nx, nz]; sg.userData.outer = !!ow; sg.userData.q = q; if (RS && RS.wallSide) sg.userData.wall = RS.wallSide[loc(nx, nz)]; sg.userData.p = [nx ? (nx < 0 ? q.x0 : q.x1) : mx, nz ? (nz < 0 ? q.z0 : q.z1) : mz]; wallG.push(sg); return sg; };
  { const o = outer(mx, q.z0 - 0.3, -1); if (!o || V2) wallWithGap(q.x0, q.z0, q.x1, q.z0, near(dp.z, q.z0) ? dp.x : 0, doorSide(side(0, -1, o), near(dp.z, q.z0)), RS); }
  { const o = outer(mx, q.z1 + 0.3, 1); if (!o || V2) wallWithGap(q.x0, q.z1, q.x1, q.z1, near(dp.z, q.z1) ? dp.x : 0, doorSide(side(0, 1, o), near(dp.z, q.z1)), RS); }
  { const o = outer(q.x0 - 0.3, mz, 0); if (!o || V2) wallWithGap(q.x0, q.z0, q.x0, q.z1, near(dp.x, q.x0) ? dp.z : 0, doorSide(side(-1, 0, o), near(dp.x, q.x0)), RS); }
  { const o = outer(q.x1 + 0.3, mz, 0); if (!o || V2) wallWithGap(q.x1, q.z0, q.x1, q.z1, near(dp.x, q.x1) ? dp.z : 0, doorSide(side(1, 0, o), near(dp.x, q.x1)), RS); }
  if (RS && RS.chunky && !LOOK_DAY) { const ow = (nx, nz) => { const w = wallG.find((o) => o.userData.n[0] === nx && o.userData.n[1] === nz); return !w || w.userData.outer; };
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) wallG.push(dioCorner(g, RS, q, sx, sz, ow(sx, 0), ow(0, sz))); }
  if (RS && RS.v2) { const opts = [[0, -1, mx, q.z0, 0, near(dp.z, q.z0)], [-1, 0, q.x0, mz, Math.PI / 2, near(dp.x, q.x0)], [0, 1, mx, q.z1, 0, near(dp.z, q.z1)], [1, 0, q.x1, mz, Math.PI / 2, near(dp.x, q.x1)]];
    for (const [nx, nz, wx, wz, wr, hasDoor] of opts) { const sg = wallG.find((w) => w.userData.n[0] === nx && w.userData.n[1] === nz); if (LOOK_DAY || !sg || (sg.userData.outer && !RS.winOuter) || hasDoor || (RS.winSide && loc(nx, nz) !== RS.winSide)) continue;
      const off = RS.winOff ?? ((nz ? q.x1 - q.x0 : q.z1 - q.z0) > 4.5 ? 0.9 : 0); const wg = RKIT && !RS.archWin ? kitWin(g, wx + (nz ? off : 0), wz + (nx ? off : 0), nx, nz) : archWindow(g, wx + (nz ? off : 0), wz + (nx ? off : 0), wr, RKIT ? 0.3 : 0.18); wg.userData.whang = [nx, nz]; wg.userData.swap = true; break; } }
  const door = buildDoor(r, g, RS, def); // not cut away: the door keeps its real height so the scale reads right
  const room = { id: r.id, type: r.type, size: r.size, def: r, spots: [], staffSpots: [], staff: new Array(staffN(r.type, r.size)).fill(null), cx: r.x, cz: r.z, door, g };
  if (r.dirt) setTimeout(() => { room.dirtLv = -1; applyDirt(room); }, 1800); // after the modelled furniture has been swapped in
  const K = clamp(Math.min(Z.W / Z.st, Z.D) / 6.2, 0.6, 1);
  for (let i = 0; i < Z.st; i++) {
    const lx = Z.st === 2 ? (i ? Z.W / 4 : -Z.W / 4) : 0, c = toW(r, lx, 0);
    const sg = grp(c.x, c.z, r.a, g); const tmp = { spots: [], staffSpot: null, sz: r.size, w: Z.W / Z.st, st: i, nst: Z.st };
    { const ddx = dp.x - r.x, ddz = dp.z - r.z, ca = Math.cos(r.a), sa = Math.sin(r.a); tmp.door = { x: ca * ddx - sa * ddz - lx, z: sa * ddx + ca * ddz }; } // door in station coords
    furniture[r.type](sg, 0, 0, tmp, K);
    fitFurniture(sg, tmp, Z.W / Z.st, Z.D, RS ? 0.2 : 0.16);
    const conv = (p) => { const w = toW(r, lx + p.x, p.z); return { ...p, x: w.x, z: w.z, rot: (p.rot || 0) + r.a, ...(p.rot2 != null ? { rot2: p.rot2 + r.a } : {}), ...(p.pts ? { pts: Object.fromEntries(Object.entries(p.pts).map(([k, q]) => [k, conv(q)])) } : {}) }; }; // pts: named points of a scene (kid's chair, board…)
    for (const sp of tmp.spots) room.spots.push({ ...conv(sp), st: i, busy: null });
    room.staffSpots[i] = tmp.staffSpot ? conv(tmp.staffSpot) : null; if (tmp.staffSpot2) room.staffSpots[Z.st + i] = conv(tmp.staffSpot2); // a 2nd post in the same station (the regular lab's second researcher)
    if (tmp.ringL) { const R0 = tmp.ringL, o = toW(r, lx + R0.o.x, R0.o.z), a = toW(r, lx + R0.o.x + R0.ax.x, R0.o.z + R0.ax.z), b = toW(r, lx + R0.o.x + R0.az.x, R0.o.z + R0.az.z); (room.rings = room.rings || []).push({ ox: o.x, oz: o.z, ax: [a.x - o.x, a.z - o.z], az: [b.x - o.x, b.z - o.z], k: R0.k }); } // a raised floor (the lucha ring)
    if (tmp.obsX) room.obsX = (room.obsX || []).concat(tmp.obsX.map(([x0, x1, z0, z1]) => { const p = toW(r, lx + x0, z0), q = toW(r, lx + x1, z1); return [Math.min(p.x, q.x), Math.max(p.x, q.x), Math.min(p.z, q.z), Math.max(p.z, q.z)]; }));
    VIA_SPOTS = VIA_SPOTS.filter((sp) => sp.room0 && R.rooms[sp.room0.id] === sp.room0); for (const sp of room.spots) if (sp.front && !sp.via) { sp.via = { x: sp.x + Math.sin(sp.rot) * 1.35, z: sp.z + Math.cos(sp.rot) * 1.35 }; sp.room0 = room; VIA_SPOTS.push(sp); }
    if (tmp.wash) { room.wash = (room.wash || []).concat(tmp.wash.map((sp) => ({ ...conv(sp), st: i, busy: null }))); (room.bins = room.bins || []).push(conv({ ...tmp.bin, rot: 0 })); }
  }
  if (!(RS && RS.model) && r.type !== 'parent') { const pc = toW(r, Z.W / 2 - 0.6, -Z.D / 2 + 0.7); plant(pc.x, pc.z, 0.9, '#FFFFFF', g); }
  // furniture footprints become obstacles for the walk grid (people go around sofas, desks, poufs, machines…)
  room.wallG = wallG; roomObs(room);
  // two rooms side by side build their kit walls, corners and crowns in the very same planes: the GPU then flickers between the two
  // colours. Each room gets its own small depth priority (and the kit wins over the plot walls it is pushed against).
  { const off = roomPO(r), po = (o) => { if (o.isMesh && o.material && !Array.isArray(o.material) && !o.material.polygonOffset) { const k = o.material.uuid + '|' + off;
      o.material = KIT_PO[k] || (KIT_PO[k] = Object.assign(o.material.clone(), { polygonOffset: true, polygonOffsetFactor: 0, polygonOffsetUnits: off, onBeforeCompile: o.material.onBeforeCompile, customProgramCacheKey: o.material.customProgramCacheKey })); } }; /* a clone loses the two-tone shader hook: carried over */
    g.traverse((o) => { if (o.userData.kitW) po(o); }); for (const w of wallG) w.traverse(po); }
  // two rooms side by side: each one's wall skin reaches a few cm into the neighbour's wall, so their wall tops (and, cut down, their hip-height tops)
  // met in exactly the same plane and blinked between the two colours on phones. Each room's walls now sit a hair higher or lower (0.6-12 mm, from the
  // same per-room number as the depth bias): never the same height as a neighbour's, invisible to the eye
  { const jit = -roomPO(r) * 0.0004; for (const w of wallG) w.position.y += jit; } // every piece of the walls, not only the kit parts: the painted inner layers and caps met the centre's walls in the same plane too
  if (GFX.batch) { for (const w of wallG) { const keep = w.children.filter((c) => c.userData.keepY || c.userData.kitW); batchNode(w, new Set(keep), { userData: { roomId: r.id } }); for (const k of keep) batchNode(k, new Set(), { userData: { roomId: r.id } }); } batchNode(door.g, new Set([...door.leaves, door.top, door.head].filter(Boolean)), { userData: { roomId: r.id } }); const st = new Set([...wallG, door.g]); g.traverse((o) => { if (o.userData.swap) st.add(o); }); batchNode(g, st, { userData: { roomId: r.id } }); }
  { const ca = Math.cos(r.a), sa = Math.sin(r.a), hs = []; g.traverse((o) => { if (o.userData.whang) hs.push({ o, n: o.userData.whang }); else if (o.userData.hang) { const [lx, lz] = o.userData.hang; hs.push({ o, n: [Math.round(lx * ca + lz * sa), Math.round(-lx * sa + lz * ca)] }); } });
    world.roomHangs = (world.roomHangs || []).filter((h) => h.o.parent && h.o.parent.parent && R.rooms[h.rid]).concat(hs.map((h) => ({ ...h, rid: r.id }))); }
  world.roomCut = (world.roomCut || []).filter((w) => w.parent && w.parent.parent).concat(wallG); updateCutaway();
  g.traverse((m) => { if (m.isMesh) m.userData.roomId = r.id; });
  if (LOOK_DAY && DAY.dress[r.type]) { setTimeout(() => dayDress(room), 3500); setTimeout(() => dayDress(room), 9000); }
  R.rooms[r.id] = room; if (S && S.rooms) rebuildGrid(); for (const rr of Object.values(R.rooms)) rr.linePts = null;
}
// 2026 rooms: round-topped doorway (arched cream frame, flush leaf with a rounded top, brass knob, icon plate)
/* daylight look: the dressing of the Blender benchmark, placed once the room's furniture is in: two framed prints and a planted wall shelf on the back wall,
   plants in free back corners, the round rug under the Social Club's lounge. Wall pieces hide with their wall when the cutaway drops it. */
function dayDress(room) {
  if (!room.g.parent || room.dressed) return; const r = room.def, Z = SIZES[r.size], D = DAY.dress[r.type], W = Z.W, Dp = Z.D, a = r.a;
  const boxes = []; room.g.updateMatrixWorld(true);
  room.g.traverse((m) => { if (!m.isMesh || m.userData.kitW) return; const b = new THREE.Box3().setFromObject(m), sx = b.max.x - b.min.x, sz = b.max.z - b.min.z, sy = b.max.y - b.min.y; if (sy > 0.15 && sx * sz < 3 && sx < 2.5 && sz < 2.5) boxes.push(b); });
  if (boxes.length < 2) return; room.dressed = true;
  const free = (p, rad) => !boxes.some((b) => p.x > b.min.x - rad && p.x < b.max.x + rad && p.z > b.min.z - rad && p.z < b.max.z + rad);
  const dg = grp(r.x, r.z, a, room.g), nW = [Math.round(-Math.sin(a)), Math.round(-Math.cos(a))], hang = (o) => { (world.roomHangs = world.roomHangs || []).push({ o, n: nW, rid: room.id }); return o; };
  const back = -Dp / 2 + 0.075;
  D.art.forEach((c, i) => { const f = grp(-W * 0.18 + i * 0.62, back, 0, dg); f.position.y = 1.32 + i * 0.12; put(rbox(i ? 0.42 : 0.6, i ? 0.42 : 0.55, 0.03, '#F7F2EA', 0.01, { r: 0.6 }), 0, 0, 0, f); put(rbox((i ? 0.42 : 0.6) - 0.09, (i ? 0.42 : 0.55) - 0.09, 0.035, c, 0.004, { r: 0.85 }), 0, 0, 0.004, f); hang(f); });
  if (D.shelf) propModel('nap_wallshelf').then((m) => { if (!room.g.parent) return; const o = m.clone(); o.scale.setScalar(0.8); const sh = grp(W * 0.28, -Dp / 2 + 0.2, 0, dg); sh.position.y = 1.2; sh.add(o); hang(sh); }).catch(() => {});
  for (const [lx, i] of [[-W / 2 + 0.5, 0], [W / 2 - 0.5, 1]]) { const p = toW(r, lx, -Dp / 2 + 0.5); if (!free(p, 0.3)) continue;
    propModel(['plant_m', 'nap_plant'][i]).then((m) => { if (!room.g.parent) return; const o = m.clone(); o.scale.setScalar(0.95); const pg = grp(lx, -Dp / 2 + 0.5, i * 1.3, dg); pg.position.y = 0.1; pg.add(o); o.traverse((c) => { if (c.isMesh) c.castShadow = true; }); aoBlob(room.g, p.x, p.z, 0.7, 0.7); }).catch(() => {}); }
  if (D.rug) { const low = boxes.filter((b) => b.max.y < 0.95 && (b.max.x - b.min.x) < 1.1 && (b.max.z - b.min.z) < 1.1); if (low.length) {
    const cx = low.reduce((s2, b) => s2 + (b.min.x + b.max.x) / 2, 0) / low.length, cz = low.reduce((s2, b) => s2 + (b.min.z + b.max.z) / 2, 0) / low.length;
    const tx = GC.dayRug || (GC.dayRug = canvasTex(256, 256, (c, Wc) => { c.fillStyle = D.rug; c.fillRect(0, 0, Wc, Wc); let sd = 5; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647); for (let i = 0; i < 9000; i++) { c.fillStyle = rr() < 0.5 ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.1)'; c.fillRect(rr() * Wc, rr() * Wc, 1.5, 1.5); } }));
    const rug = new THREE.Mesh(new THREE.CircleGeometry(1.45, 64), new THREE.MeshStandardMaterial({ map: tx, roughness: 1 })); rug.rotation.x = -Math.PI / 2; rug.position.set(cx, 0.133, cz); rug.material.polygonOffset = true; rug.material.polygonOffsetFactor = -1; rug.receiveShadow = true; room.g.add(rug); } }
}
function buildDayDoor(r, g, RS, H0, dp) {
  const H = H0 + DAY.glassUp, fr = DAY.frame, fo = { m: 0.6, r: 0.35 }, W = DOOR_W + 0.1;
  const gm = GC.glassM || (GC.glassM = new THREE.MeshPhysicalMaterial({ color: '#EEF4F7', transparent: true, opacity: 0.13, roughness: 0.05, depthWrite: false }));
  for (const sx of [-1, 1]) put(rbox(0.03, H, 0.04, fr, 0.008, fo), sx * W / 2, H / 2 + 0.1, 0, g);
  const head = put(rbox(W, 0.03, 0.04, fr, 0.008, fo), 0, DOOR_H + 0.1, 0, g);
  const top = new THREE.Mesh(new THREE.BoxGeometry(W, H - DOOR_H, 0.02), gm); top.position.y = DOOR_H + 0.1 + (H - DOOR_H) / 2; top.renderOrder = 2; g.add(top);
  // the leaf reads as a pair of glass doors: two panes, a slim centre bar, two vertical pulls
  const piv = grp(-DOOR_W / 2, 0, 0, g); piv.position.y = 0.1; const lw = DOOR_W - 0.02, lh = DOOR_H - 0.02;
  const pane = new THREE.Mesh(new THREE.BoxGeometry(lw, lh, 0.02), gm); pane.position.set(lw / 2, lh / 2, 0); pane.renderOrder = 2; piv.add(pane);
  for (const [w2, h2, x2, y2] of [[lw, 0.03, lw / 2, 0.015], [lw, 0.025, lw / 2, lh - 0.0125], [0.025, lh, 0.0125, lh / 2], [0.025, lh, lw - 0.0125, lh / 2], [0.03, lh, lw / 2, lh / 2]]) put(rbox(w2, h2, 0.03, fr, 0.006, fo), x2, y2, 0, piv);
  for (const sx of [-1, 1]) for (const fz of [-1, 1]) put(rbox(0.022, 0.42, 0.022, '#5A5652', 0.008, { m: 0.5, r: 0.4 }), lw / 2 + sx * 0.08, 1.05, fz * 0.035, piv);
  // physical sign on the glass right above the entrance: warm white panel, colour dot, the room's name in charcoal on both faces
  const name = rn(r.type), key = 'daySign|' + r.type;
  const tex = GC[key] || (GC[key] = canvasTex(1024, 192, (c, W2) => { const Hc = 192; c.fillStyle = '#FBF7F2'; c.fillRect(0, 0, W2, Hc); c.fillStyle = RS.wall || '#E8A5AD'; c.beginPath(); c.arc(84, Hc / 2, 30, 0, 6.3); c.fill();
    c.fillStyle = '#2B2A2C'; c.font = '700 118px Nunito, Inter, system-ui, sans-serif'; c.textBaseline = 'middle'; c.fillText(name, 140, Hc / 2 + 6, W2 - 170); })); tex.anisotropy = 8;
  const sw = 2.6, sh = 0.48, sm = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.6 }), sign = grp(0, 0, 0, g); sign.position.y = DOOR_H + 0.1 + 0.05 + sh / 2;
  put(rbox(sw + 0.04, sh + 0.04, 0.05, '#FBF7F2', 0.02, { r: 0.6 }), 0, 0, 0, sign);
  for (const fz of [-1, 1]) { const pl = new THREE.Mesh(new THREE.PlaneGeometry(sw, sh), sm); pl.position.z = fz * 0.026; if (fz < 0) pl.rotation.y = Math.PI; sign.add(pl); }
  const d = { g, leaves: [piv], top, head, x: dp.x, z: dp.z, open: 0, kit: false, sign };
  (world.doors = (world.doors || []).filter((o) => o.g.parent && o.g.parent.parent)).push(d);
  return d;
}
function buildArchDoor(r, g, RS, H, th, dp) {
  if (LOOK_DAY) return buildDayDoor(r, g, RS, H, dp);
  const R = DOOR_W / 2, yS = DOOR_H - R, fm = '#FBF4E8', fw = 0.11, ow = DOOR_W + 2 * fw;
  let arc;
  if (RKIT && RS.chunky) { arc = KM('k_doorframe', RS.rim || KIT_C.rim, 0.72); g.add(arc); } // kit: one chunky arched frame through the wall, crown colour
  else { for (const sx of [-1, 1]) put(rbox(fw, yS, th + 0.06, fm, 0.03, { r: 0.85 }), sx * (R + fw / 2), yS / 2 + 0.1, 0, g);
  arc = new THREE.Mesh(GC.dArc || (GC.dArc = new THREE.TorusGeometry(R + fw / 2, fw / 2, 10, 28, Math.PI)), mat(fm, { r: 0.85 })); arc.scale.z = (th + 0.06) / fw; arc.position.y = yS + 0.1; g.add(arc); }
  const sh = new THREE.Shape(); const top = H - yS + 0.02; sh.moveTo(-ow / 2, 0); sh.lineTo(-R - fw, 0); sh.absarc(0, 0, R + fw, Math.PI, 0, true); sh.lineTo(ow / 2, 0); sh.lineTo(ow / 2, top); sh.lineTo(-ow / 2, top); sh.closePath();
  const fill = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: th, bevelEnabled: false }), mat(RKIT && RS.chunky ? RS.wall : OUT_WALL, { r: 0.95 })); fill.position.set(0, yS + 0.1, -th / 2); g.add(fill);
  const piv = grp(-R, 0, 0, g); piv.position.y = 0.1; const lw = DOOR_W - 0.04, lm = mat(RS.door, { r: 0.7 });
  put(rbox(lw, yS, 0.06, RS.door, 0.012, { r: 0.7 }), lw / 2, yS / 2, 0, piv);
  const hs = new THREE.Shape(); hs.absarc(0, 0, lw / 2, 0, Math.PI, false); hs.closePath();
  const hd = new THREE.Mesh(GC.dHead || (GC.dHead = new THREE.ExtrudeGeometry(hs, { depth: 0.06, bevelEnabled: false })), lm); hd.position.set(lw / 2, yS - 0.01, -0.03); piv.add(hd);
  for (const fz of [-1, 1]) put(sph(0.045, '#D8B45A', { m: 0.6, r: 0.35 }), lw - 0.14, 1.0, fz * 0.06, piv);
  for (const fz of [-1, 1]) { put(rbox(0.36, 0.26, 0.04, fm, 0.1, { r: 0.8 }), lw / 2, yS + 0.08, fz * 0.05, piv);
    if (RS.icon === 'moon') { const m = new THREE.Mesh(GC.signMoon || (GC.signMoon = new THREE.TorusGeometry(0.08, 0.028, 8, 20, Math.PI * 1.25)), mat(RS.pop, { e: RS.pop, ei: 0.6 })); m.rotation.z = 0.9; m.position.set(lw / 2, yS + 0.08, fz * 0.075); piv.add(m); } }
  const d = { g, leaves: [piv], top: fill, head: arc, x: dp.x, z: dp.z, open: 0, kit: !!(RKIT && RS.chunky) };
  (world.doors = (world.doors || []).filter((o) => o.g.parent && o.g.parent.parent)).push(d);
  return d;
}
// swinging double door in the 2 m wall gap: opens inward when someone comes close, closes behind them
const doorMats = {};
function buildDoor(r, parent, RS, def) {
  const dp = doorPt(r, 0), H = RS ? RS.h : ROOM_H, g = grp(dp.x, dp.z, r.a, parent); g.userData.n = [Math.sin(r.a), Math.cos(r.a)];
  const wallC = RS ? (RS.v2 ? OUT_WALL : RS.wall) : '#FFFFFF', frame = '#F4E9D2', leafC = RS && RS.door || '#7E9CC0', panelC = RS && RS.panel || '#6F8FB6', th = RS ? (RS.v2 ? 0.18 : 0.3) : T, fw = 0.12, ow = DOOR_W + 2 * fw;
  // cream architrave (two jambs + head), proud of the wall on both faces, and the wall piece above
  if (RS && RS.v2) return buildArchDoor(r, g, RS, H, th, dp);
  for (const sx of [-1, 1]) put(rbox(fw, DOOR_H + fw, th + 0.08, frame, 0.03, { r: 0.85 }), sx * (DOOR_W / 2 + fw / 2), (DOOR_H + fw) / 2 + 0.1, 0, g);
  const head = put(rbox(ow, fw, th + 0.08, frame, 0.03, { r: 0.85 }), 0, DOOR_H + fw / 2 + 0.1, 0, g);
  const top = H > DOOR_H + fw + 0.05 ? put(rbox(ow, H - DOOR_H - fw, th, wallC, 0.03, { r: 0.95 }), 0, (H + DOOR_H + fw) / 2 + 0.1, 0, g) : null;
  // one panel door hinged on the left: two raised panels per face, chrome lever handle, two hinges
  const piv = grp(-DOOR_W / 2, 0, 0, g); piv.position.y = 0.1; const lw = DOOR_W - 0.04;
  put(rbox(lw, DOOR_H - 0.03, 0.06, leafC, 0.012, { r: 0.7 }), lw / 2, (DOOR_H - 0.03) / 2 + 0.01, 0, piv);
  for (const [py, ph] of [[0.62, 0.95], [1.62, 0.8]]) for (const fz of [-1, 1]) put(rbox(lw - 0.3, ph, 0.02, panelC, 0.008, { r: 0.7 }), lw / 2, py, fz * 0.038, piv);
  for (const fz of [-1, 1]) { put(rbox(0.16, 0.035, 0.035, '#C9CDD2', 0.012, { m: 0.6, r: 0.35 }), lw - 0.16, 1.0, fz * 0.065, piv); put(rbox(0.05, 0.09, 0.02, '#C9CDD2', 0.008, { m: 0.6, r: 0.35 }), lw - 0.1, 1.0, fz * 0.045, piv); }
  for (const hz of [0.25, DOOR_H - 0.3]) put(rbox(0.03, 0.12, 0.08, '#C9CDD2', 0.008, { m: 0.6, r: 0.35 }), 0.01, hz, 0, piv);
  if (RS && RS.v2) for (const fz of [-1, 1]) { const pl = put(rbox(0.5, 0.36, 0.05, '#FBF4E8', 0.12, { r: 0.8 }), 0, H - 0.12, fz * (th / 2 + 0.05), g); // rounded sign plate with the room's icon, both faces
    if (RS.icon === 'moon') { const m = new THREE.Mesh(GC.signMoon || (GC.signMoon = new THREE.TorusGeometry(0.1, 0.035, 8, 20, Math.PI * 1.25)), mat(RS.pop, { e: RS.pop, ei: 0.6 })); m.rotation.z = 0.9; m.position.set(0, H - 0.12, fz * (th / 2 + 0.085)); g.add(m); } }
  const d = { g, leaves: [piv], top, head, x: dp.x, z: dp.z, open: 0 };
  (world.doors = (world.doors || []).filter((o) => o.g.parent && o.g.parent.parent)).push(d);
  return d;
}
// how loud a sound at p is: full when it's around the centre of the view, silent off-screen
function hearVol(p) { const d = Math.hypot(p.x - view.tx, p.z - view.tz); return clamp(1.15 - d / (view.half * 0.9), 0, 1); }
let ambT = 3;
function ambience(dt) {
  ambT -= dt; if (ambT > 0) return; ambT = 2.2 + Math.random() * 2.5;
  const sleepers = R.visitors.filter((v) => v.state === 'treat' && v.rspot && v.rspot.lie);
  if (sleepers.length) { const v = rnd(sleepers); AU.sfx('snore', hearVol(v.av.position) * 0.9); }
  else if (Math.random() < 0.15) { const w = R.visitors.filter((v) => v.state === 'wait'); if (w.length) { const v = rnd(w); AU.sfx('yawn', hearVol(v.av.position) * 0.6); } }
}
// people on a bed lie flat on their back, head to the pillow, under a duvet (feet to chest); back upright when they get up
const LIE_V = new THREE.Vector3(), DUVET_C = ['#9C7BD4', '#E07FA6', '#6FA3D8', '#7FBF8E', '#E9A35B'];
function napDuvet(col) { // a thick, soft duvet that hides the whole body up to the chest, with the white sheet folded back over its top edge
  const dv = rbox(1.0, 0.3, 1, col, 0.12, { r: 0.95 }); const f = rbox(1.01, 0.1, 0.13, '#D9CFF0', 0.05, { r: 0.95 }); f.position.set(0, 0.12, -0.44); /* a soft rolled-over sheet edge, not a flat board */ const dr = rbox(1.0, 0.34, 0.05, col, 0.025, { r: 0.95 }); dr.position.set(0, -0.12, 0.49); dv.add(dr); /* and it hangs over the foot of the bed */ f.castShadow = false; dv.add(f); return dv;
}
const LIE_DV = new Set(); // every duvet in the scene, so one never stays behind when its sleeper is removed mid-nap
function lieUpdate() {
  const seenDv = new Set(), who = []; for (const v of R.visitors) who.push([v, v.state === 'treat' && v.rspot]); for (const rs of R.staff) who.push([rs, rs.mode === 'break' && rs.onBreak]);
  for (const [o, sp] of who) { const av = o.av; if (!av) continue; const on = !!(sp && sp.lie && !(o.path && o.path.length) && Math.hypot(av.position.x - sp.x, av.position.z - sp.z) < 1.2);
    if (on) { const L = 1.55 * av.scale.y, r = sp.rot || 0, s = Math.sin(r), c = Math.cos(r), base = 0.1 + (sp.y || 0);
      av.rotation.order = 'YXZ'; av.rotation.set(-Math.PI / 2, r, 0); av.position.set(sp.x + s * L * 0.5, base + 0.13, sp.z + c * L * 0.5); // feet at +z, head toward -z (the pillow end)
      const ud = av.userData, now = performance.now(); if (!ud.lieT) { ud.lieS = now; ud.roll = 0; ud.rollT = 0; ud.rollAt = now + 1500; }
      ud.roll = 0; // once in bed a client lies still under the duvet (no tossing: it read as bodies falling out of the bed)
      const p = av.userData.p; if (sp.duvetC && p && p.anim && p.anim.calm && /^~/.test(p.anim.state || '')) p.anim.calm(); /* resting in a nap bed: the plain idle, not a fidgety styled one */ if (p && p.anim && p.anim.state !== 'idle') { p.anim.set('idle'); if (ud.sleep) { ud.sleep = false; ud.lieT = 15; ud.rollQ = null; ud.rollN = 0; ud.rollSg = 0; } } /* something else changed the pose: settle and hold still again */
      let hb = av.userData.hipsB; if (hb === undefined) { hb = null; av.traverse((b) => { if (!hb && b.isBone && /hips|pelvis/i.test(b.name)) hb = b; }); av.userData.hipsB = hb; }
      if (sp.duvetC && ud.sleep) { // nap beds: some idles stand turned 3/4, so lying they roll onto one side and a knee or hand pokes up; roll them flat on their back
        if (ud.rollQ) av.quaternion.premultiply(ud.rollQ);
        if ((ud.rollN || 0) < 3) { let L1 = null, R1 = null; av.traverse((b) => { if (b.isBone && b.name === 'LeftUpLeg') L1 = b; if (b.isBone && b.name === 'RightUpLeg') R1 = b; });
          if (L1 && R1) { av.updateMatrixWorld(true); L1.getWorldPosition(LIE_V); const ly = LIE_V.y, lw = LIE_V.x * c - LIE_V.z * s; R1.getWorldPosition(LIE_V); const a = Math.atan2(LIE_V.y - ly, (LIE_V.x * c - LIE_V.z * s) - lw);
            const lev = Math.atan2(Math.sin(a), Math.abs(Math.cos(a))); // tilt of the hip line from level, whichever side is left
            if (Math.abs(lev) > 0.05) { const q = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(s, 0, c), (Math.cos(a) >= 0 ? 1 : -1) * lev * (ud.rollSg || 1)); ud.rollQ = ud.rollQ ? q.multiply(ud.rollQ) : q; av.quaternion.premultiply(q);
              av.updateMatrixWorld(true); L1.getWorldPosition(LIE_V); const ly2 = LIE_V.y; R1.getWorldPosition(LIE_V); if (Math.abs(LIE_V.y - ly2) > Math.abs(Math.sin(a)) * 0.2 + 0.01 && !ud.rollSg) { ud.rollSg = -1; ud.rollQ = null; ud.rollN = 0; } } /* rotated the wrong way: undo and try the other */
            ud.rollN = (ud.rollN || 0) + 1; } } }
      if (hb) { av.updateMatrixWorld(true); hb.getWorldPosition(LIE_V); av.position.y += base + (sp.duvetC ? 0.2 : 0.14) - LIE_V.y; } /* nap beds: on the thick mattress, head on the pillow */ // the clip's pelvis offset: lay the hips on the mattress
      let dv = av.userData.duvet; if (dv && dv.userData.wide !== !!sp.duvetC) { if (dv.parent) dv.parent.remove(dv); dv = null; } if (!dv) { dv = av.userData.duvet = sp.duvetC ? napDuvet(sp.duvetC) : rbox(0.68, 0.2, 1, rnd(DUVET_C), 0.09); dv.castShadow = true; dv.userData.swap = true; dv.userData.wide = !!sp.duvetC; } // the nap beds: a wide, thick duvet in the bed's colour that covers the arms and comes up to the chest
      av.userData.lieT = (av.userData.lieT || 0) + 1; if (av.userData.lieT > 20 && !av.userData.sleep) { if (p && p.anim && p.anim.freeze) p.anim.freeze('idle'); else if (p && p.anim && p.anim.mixer) { for (const ac of p.anim.mixer._actions || []) if (ac.isRunning()) { ac.time = 0; ac.paused = true; } } /* the modelled characters: hold the first idle frame still (paused, not stopped: a stopped clip snaps back to the T-pose) */ /* the modelled characters: hold the first frame of their idle, so no hand waves out of the duvet */ av.userData.sleep = true; } // a moment to settle, then one still pose, arms by the sides
      dv.visible = !sp.noDuvet; // jjimjilbang mats: people lie on the heated floor, uncovered
      if (!dv.parent) scene.add(dv); LIE_DV.add(dv); seenDv.add(dv); const len = L * 0.88 * (o.prob ? clamp((performance.now() - (av.userData.lieS || 0)) / 1100, 0.25, 1) : 1); dv.scale.z = len; /* a client pulls the duvet up over themselves */ dv.rotation.y = r; dv.rotation.z = 0; dv.scale.y = sp.duvetC ? 1 : 1.3; const dy = sp.duvetC ? 0.28 : 0.19; dv.position.set(sp.x + s * (L * 0.5 - len / 2 + 0.06), base + dy, sp.z + c * (L * 0.5 - len / 2 + 0.06));
      if (sp.duvetC) { // the nap beds: lay the duvet on where the body really is (the clip shifts it toward the pillow), from past the feet up to the chest
        let hd = ud.headB, ft = ud.footB; if (hd === undefined) { hd = ft = null; av.traverse((b) => { if (!b.isBone) return; if (!hd && /head/i.test(b.name) && !/end|top/i.test(b.name)) hd = b; if (!ft && /foot|ankle/i.test(b.name)) ft = b; }); ud.headB = hd; ud.footB = ft; }
        if (hd && ft) { av.updateMatrixWorld(true); hd.getWorldPosition(LIE_V); const hz = LIE_V.x * s + LIE_V.z * c; ft.getWorldPosition(LIE_V); const fz = LIE_V.x * s + LIE_V.z * c; // positions along the bed axis
          const sg = Math.sign(fz - hz) || 1, spz = sp.x * s + sp.z * c, top = spz + sg * clamp((hz - spz) * sg + 0.36, -0.75, -0.3), foot = spz + 0.97 * sg, /* the bed's own foot end, whatever pose the body holds */ k = o.prob ? clamp((performance.now() - (ud.lieS || 0)) / 1100, 0.25, 1) : 1, end = foot + (top - foot) * k, l2 = Math.abs(end - foot), mid = (foot + end) / 2, hb2 = ud.hipsB; let side = sp.x * c - sp.z * s; if (hb2) { hb2.getWorldPosition(LIE_V); side = clamp(LIE_V.x * c - LIE_V.z * s, side - 0.12, side + 0.12); } /* centred on the body, not the bed */
          dv.scale.z = Math.max(0.2, l2); dv.rotation.y = sg > 0 ? r : r + Math.PI;
          if (ud.sleep) { let hi = 0; if (!ud.pokeB) { ud.pokeB = []; av.traverse((b) => { if (b.isBone && /^(Left|Right)(ToeBase|Foot|Leg)$/.test(b.name)) ud.pokeB.push(b); }); } for (const b of ud.pokeB) { b.getWorldPosition(LIE_V); hi = Math.max(hi, LIE_V.y); }
            ud.dvLift = Math.min(0.14, Math.max(0, hi + 0.13 - (base + dy + 0.15))); } /* a raised knee or upturned shoe: puff the duvet up over it instead of letting it poke through */
          else ud.dvLift = 0; /* the folded sheet on the head side */ dv.position.set(side * c + mid * s, base + dy + (ud.dvLift || 0) / 2, -side * s + mid * c); dv.scale.y = 1 + (ud.dvLift || 0) / 0.3; } } dv.visible = av.visible !== false && !sp.noDuvet; }
    else { if (av.userData.sleep) { const p0 = av.userData.p; if (p0 && p0.anim && p0.anim.mixer) for (const ac of p0.anim.mixer._actions || []) ac.paused = false; } av.userData.lieT = 0; av.userData.sleep = false; av.userData.rollQ = null; av.userData.rollN = 0; av.userData.rollSg = 0; if (av.rotation.x && !(o.ix && o.ix.mat)) { av.rotation.x = 0; av.rotation.z = 0; } const dv = av.userData.duvet; if (dv && dv.parent) dv.parent.remove(dv); } }
  for (const dv of LIE_DV) if (!seenDv.has(dv)) { if (dv.parent) dv.parent.remove(dv); LIE_DV.delete(dv); }
}
function doorsUpdate(dt) {
  ambience(dt); lieUpdate();
  const ds = world.doors; if (!ds || !ds.length) return;
  const movers = []; for (const v of R.visitors) movers.push(v.av.position); for (const rs of R.staff) movers.push(rs.av.position); if (R.mgr && R.mgr.av && R.mgr.av.visible) movers.push(R.mgr.av.position);
  for (const d of ds) {
    if (!d.g.parent) continue;
    let want = 0; for (const p of movers) if (Math.abs(p.x - d.x) < 1.25 && Math.abs(p.z - d.z) < 1.25) { want = 1; break; }
    if (want && d.open < 0.05) AU.sfx('door', hearVol(d) * 0.8);
    if (!want && d.open > 0.12 && d.open * (1 - Math.min(1, dt * 4)) <= 0.12) AU.sfx('doorShut', hearVol(d) * 0.6);
    d.open += (want - d.open) * Math.min(1, dt * (want ? 9 : 4));
    const e = d.open * d.open * (3 - 2 * d.open);
    d.leaves[0].rotation.y = e * 1.5; // swings into the room
  }
}
// keep every piece of furniture inside the room: push it back from the walls (and the seats/spots that go with it)
const _fb = new THREE.Box3();
function fitFurniture(sg, tmp, w, d, m) {
  const p0 = sg.position.clone(), r0 = sg.rotation.y; sg.position.set(0, 0, 0); sg.rotation.y = 0; sg.updateMatrixWorld(true);
  const lim = [-w / 2 + m, w / 2 - m, -d / 2 + m, d / 2 - m];
  for (const c of sg.children) {
    _fb.setFromObject(c); if (_fb.isEmpty() || _fb.max.y < 0.2) continue;
    const sx = _fb.max.x - _fb.min.x, sz = _fb.max.z - _fb.min.z, hung = _fb.min.y > 0.5 && Math.min(sx, sz) < 0.2; // wall-hung: only slide along the wall
    let dx = 0, dz = 0;
    if (_fb.min.x < lim[0]) dx = lim[0] - _fb.min.x; else if (_fb.max.x > lim[1]) dx = lim[1] - _fb.max.x;
    if (_fb.min.z < lim[2]) dz = lim[2] - _fb.min.z; else if (_fb.max.z > lim[3]) dz = lim[3] - _fb.max.z;
    if (hung) { if (sz < sx) dz = 0; else dx = 0; }
    if (!dx && !dz) continue;
    const near = (sp) => sp && sp.x > _fb.min.x - 0.35 && sp.x < _fb.max.x + 0.35 && sp.z > _fb.min.z - 0.35 && sp.z < _fb.max.z + 0.35;
    for (const sp of tmp.spots.concat(tmp.staffSpot ? [tmp.staffSpot] : [])) if (near(sp)) { sp.x += dx; sp.z += dz; }
    c.position.x += dx; c.position.z += dz;
  }
  sg.position.copy(p0); sg.rotation.y = r0; sg.updateMatrixWorld(true);
}
function chair(g, x, z, rot, col) { const c = grp(x, z, rot, g); put(rbox(0.6, 0.1, 0.55, col, 0.04), 0, 0.5, 0, c); put(rbox(0.6, 0.65, 0.1, col, 0.04), 0, 0.88, -0.28, c); put(cyl(0.04, 0.04, 0.42, '#555'), 0, 0.25, 0, c); }
// group rooms seat more people as they grow: 2 (small) · 4 (normal) · 6 (large = 2 stations × 3)
const seatsN = (room) => ({ s: 2, m: 4, l: 3 }[room.sz] || 2);
function bedXs(room, bw) { const n = room.sz ? { s: 2, m: 4, l: 3 }[room.sz] : 2, W = (room.w || 6) - 0.5, sp = Math.min(1.5, W / n); return Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * sp); }
const CAPC = {};
const staffN = (type, size) => (type === 'lab' && size === 'm' ? 2 : SIZES[size].st); // the regular lab takes two researchers, the small one one
function capOf(type, size) { const k = type + size; if (CAPC[k] != null) return CAPC[k]; const Z = SIZES[size], K = clamp(Math.min(Z.W / Z.st, Z.D) / 6.2, 0.6, 1); let n = 0; for (let i = 0; i < Z.st; i++) { const tmp = { spots: [], staffSpot: null, sz: size, w: Z.W / Z.st }; try { furniture[type](new THREE.Group(), 0, 0, tmp, K); } catch (e) {} n += tmp.spots.length; } return (CAPC[k] = n); }

// career office decor from the reference painting: window seat, arc lamp, ladder shelf + gold star, sconces, framed sign, corkboard with notes
const CAREER_CORK = () => GC.corkTex || (GC.corkTex = canvasTex(640, 440, (c, w, h) => {
  c.fillStyle = '#C8955E'; c.fillRect(0, 0, w, h); for (let i = 0; i < 2600; i++) { c.fillStyle = Math.random() < 0.5 ? 'rgba(120,70,30,0.22)' : 'rgba(255,230,190,0.18)'; c.fillRect(Math.random() * w, Math.random() * h, 2, 2); }
  const card = (x, y, cw, chh, bg, rot, lines, fg, fs) => { c.save(); c.translate(x + cw / 2, y + chh / 2); c.rotate(rot); c.fillStyle = 'rgba(0,0,0,0.18)'; c.fillRect(-cw / 2 + 4, -chh / 2 + 5, cw, chh); c.fillStyle = bg; c.fillRect(-cw / 2, -chh / 2, cw, chh);
    if (lines) { c.fillStyle = fg; c.font = '700 ' + fs + 'px "Open Sans", sans-serif'; c.textAlign = 'center'; lines.forEach((t, k) => c.fillText(t, 0, -chh / 2 + fs * 1.25 * (k + 1) + 4)); }
    c.fillStyle = '#D93A3F'; c.beginPath(); c.arc(0, -chh / 2 + 9, 7, 0, 7); c.fill(); c.restore(); return { x, y, cw, chh }; };
  card(40, 40, 150, 150, '#1F2A4A', -0.04, ['Plan', 'Prepare', 'Progress'], '#FFFFFF', 30);
  const m = card(250, 40, 200, 130, '#F4EEDC', 0.03); c.save(); c.translate(250, 40); c.fillStyle = '#7FB38A'; for (const [ex, ey, rx, ry] of [[50, 50, 30, 22], [62, 92, 14, 22], [105, 48, 20, 16], [112, 85, 16, 24], [150, 55, 28, 20], [168, 98, 14, 10]]) { c.beginPath(); c.ellipse(ex, ey, rx, ry, 0, 0, 7); c.fill(); } c.restore();
  card(40, 230, 140, 150, '#F2A7B5', 0.05, ['Dream', 'Plan', 'Do'], '#1F2A4A', 30);
  card(210, 250, 130, 110, '#7CC6BE', -0.06, ['Next', 'Step'], '#1F2A4A', 30);
  card(370, 210, 150, 150, '#FFFFFF', 0.04); c.fillStyle = '#F6C5A6'; c.fillRect(382, 222, 126, 110); c.fillStyle = '#C8546A'; c.beginPath(); c.moveTo(382, 332); c.lineTo(430, 262); c.lineTo(465, 300); c.lineTo(490, 275); c.lineTo(508, 332); c.fill(); c.fillStyle = '#F7E07A'; c.beginPath(); c.arc(480, 248, 12, 0, 7); c.fill();
  card(520, 70, 90, 90, '#F7D35C', -0.08); card(540, 330, 80, 80, '#F7D35C', 0.07);
}));
const CAREER_SIGN = () => GC.signTex || (GC.signTex = canvasTex(300, 400, (c, w, h) => { c.fillStyle = '#F6F0E2'; c.fillRect(0, 0, w, h); c.fillStyle = '#2B2B2B'; c.textAlign = 'center'; c.font = '700 44px "Open Sans", sans-serif'; ['CLARITY', 'CONFIDENCE', 'CAREER', 'YOU'].forEach((t, i) => { c.font = '700 ' + (t.length > 8 ? 36 : 46) + 'px "Open Sans", sans-serif'; c.fillText(t, w / 2, 95 + i * 80); }); }));
function careerDecor(g, cx, cz, room, k) {
  const W = room.w || 6, D = SIZES[room.sz || 'm'].D, lx = cx - W / 2 + 0.1, bz = cz - D / 2 + 0.1, wood = '#8A4E2E', brass = '#C9A54A';
  const hang = (o, n) => { o.userData.hang = n; o.userData.swap = true; return o; };
  // window seat under the window: white drawer base, mustard cushion, two pillows
  { const s = grp(lx + 0.3, cz, 0, g), L = Math.min(1.9, D - 1.6);
    put(rbox(0.56, 0.42, L, '#F4EEE2', 0.04, { r: 0.8 }), 0, 0.33, 0, s); for (let i = 0; i < 3; i++) { const dz = (i - 1) * L / 3; put(rbox(0.02, 0.26, L / 3 - 0.08, '#E6DCCB', 0.01), 0.285, 0.32, dz, s); put(sph(0.025, brass, { m: 0.5, r: 0.4 }), 0.3, 0.33, dz, s); }
    put(rbox(0.6, 0.13, L + 0.04, '#E7A93B', 0.06, { r: 1 }), 0, 0.6, 0, s);
    put(rbox(0.14, 0.36, 0.44, '#24305A', 0.07, { r: 1 }), -0.15, 0.82, -L / 2 + 0.45, s).rotation.y = 0.2; put(rbox(0.14, 0.38, 0.48, '#F3EBDD', 0.07, { r: 1 }), -0.17, 0.83, -L / 2 + 0.9, s).rotation.y = -0.15;
    for (let i = 0; i < 4; i++) put(rbox(0.005, 0.32, 0.012, '#24305A', 0.002), -0.095, 0.83, -L / 2 + 0.72 + i * 0.1, s); }
  // arc floor lamp in the back corner, its black dome hanging over the seat
  { const f = grp(lx + 0.55, bz + 0.75, 0, g), blk = '#1C1C22';
    put(cyl(0.2, 0.22, 0.05, blk, { m: 0.3, r: 0.5 }), 0, 0.14, 0, f); put(cyl(0.025, 0.025, 1.75, blk, { m: 0.3, r: 0.5 }), 0, 1.0, 0, f);
    const arc = new THREE.Mesh(GC.lampArc || (GC.lampArc = new THREE.TorusGeometry(0.42, 0.022, 8, 24, Math.PI / 2)), mat(blk, { m: 0.3, r: 0.5 })); arc.rotation.y = Math.PI / 2; arc.position.set(0, 1.87, 0.42); arc.rotation.z = 0; f.add(arc);
    const sh = new THREE.Mesh(GC.lampDome || (GC.lampDome = new THREE.SphereGeometry(0.2, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2)), mat(blk, { m: 0.3, r: 0.45, side: THREE.DoubleSide })); sh.position.set(0, 1.86, 0.84); f.add(sh);
    put(sph(0.08, '#FFF1C2', { e: '#FFD27A', ei: 2 }), 0, 1.8, 0.84, f); }
  // leaning ladder shelf with a gold star on top
  { const ld = hang(grp(cx - 1.75 * (k / 3.47), bz + 0.2, 0, g), [0, -1]); ld.rotation.x = -0.08;
    for (const sx of [-0.21, 0.21]) put(rbox(0.04, 2.0, 0.04, wood, 0.01, { r: 0.7 }), sx, 1.1, 0, ld); for (let i = 0; i < 8; i++) put(rbox(0.46, 0.04, 0.2, wood, 0.01, { r: 0.7 }), 0, 0.3 + i * 0.24, 0.06, ld);
    const st = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r2 = i % 2 ? 0.07 : 0.16, an = Math.PI / 2 + i * Math.PI / 5; i ? st.lineTo(Math.cos(an) * r2, Math.sin(an) * r2) : st.moveTo(Math.cos(an) * r2, Math.sin(an) * r2); }
    const star = new THREE.Mesh(new THREE.ExtrudeGeometry(st, { depth: 0.05, bevelEnabled: true, bevelSize: 0.012, bevelThickness: 0.012, bevelSegments: 2 }), mat('#F2B830', { m: 0.35, r: 0.4, e: '#B07A10', ei: 0.25 })); star.position.set(0, 2.32, -0.02); ld.add(star); }
  // corkboard with the notes
  { const cb = hang(grp(cx - 0.35 * (k / 3.47), bz + 0.04, 0, g), [0, -1]); put(rbox(1.42, 1.0, 0.06, wood, 0.03, { r: 0.7 }), 0, 1.55, 0, cb);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(1.3, 0.89), mat('#FFFFFF', { map: CAREER_CORK(), r: 0.95, mapK: 'cork' })); pl.position.set(0, 1.55, 0.035); cb.add(pl); }
  // brass sconces with warm glow: one on the navy wall, one on the coral wall near the door end
  for (const [x, z, ry, n] of [[cx - 2.25 * (k / 3.47), bz + 0.02, 0, [0, -1]], [lx + 0.02, cz + D / 2 - 0.95, Math.PI / 2, [-1, 0]]]) { const sc = hang(grp(x, z, ry, g), n);
    put(rbox(0.12, 0.2, 0.06, brass, 0.02, { m: 0.5, r: 0.4 }), 0, 1.75, 0.03, sc); put(cyl(0.07, 0.08, 0.18, '#FFF4DA', { e: '#FFD58A', ei: 1.8 }), 0, 1.86, 0.12, sc); }
  // framed sign on the coral wall
  { const fr = hang(grp(lx + 0.03, cz + D / 2 - 1.35, Math.PI / 2, g), [-1, 0]); put(rbox(0.6, 0.78, 0.04, '#2B2B2B', 0.01, { r: 0.6 }), 0, 1.45, 0.02, fr);
    const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.67), mat('#FFFFFF', { map: CAREER_SIGN(), r: 0.95, mapK: 'csign' })); pl.position.set(0, 1.45, 0.045); fr.add(pl); }
}
const CAREER_RUG = () => GC.cRug || (GC.cRug = canvasTex(256, 256, (c, w, h) => { c.fillStyle = '#F1E6CF'; c.fillRect(0, 0, w, h); c.fillStyle = '#24305A'; for (let i = 0; i < 9; i++) c.fillRect(0, 14 + i * 28, w, i % 3 === 1 ? 10 : 4); c.fillStyle = '#C9A54A'; c.fillRect(0, 0, w, 6); c.fillRect(0, h - 6, w, 6); }));
// Career Coach Office from the Tripo furniture kit. Every piece was straightened and turned in the kit so it faces +z;
// sizes below are the real footprint at the set height, so wall pieces sit flush against their wall (layout = the room painting)
function careerKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, first = !room.st, last = room.st == null || room.st === (room.nst || 1) - 1, S = D < 5, N = w < 5;
  const dx = first && N && !S ? 0.3 : 0, KIT = ROOM_STYLE.career.model, lx = cx - w / 2, rx = cx + w / 2, bz = cz - D / 2, zc = cz - (S ? 0.3 : 0.45), H = Math.PI / 2;
  const pc = (name, x, z, rot, h, fw, fd, o = {}) => { let p = grp(x, z, rot, g); if (o.hang) { p.userData.hang = o.hang; p.userData.swap = true; p = grp(0, o.inset || 0, 0, p); }
    if (fw) put(rbox(fw, Math.min(h, 1), fd, o.col || '#2A3354', 0.04), 0, Math.min(h, 1) / 2 + 0.1, 0, p);
    glbSwap(p, KIT + '/' + name, { h, y: (o.y || 0) + 0.11 }); p.userData.kit = name; return p; };
  { const rg = new THREE.Mesh(new THREE.PlaneGeometry(2.9, S ? 2.4 : 2.7), mat('#FFFFFF', { map: CAREER_RUG(), r: 0.95, mapK: 'crug' })); rg.rotation.x = -H; rg.position.set(cx + dx, 0.135, zc + 0.45); g.add(rg); }
  // desk square to the walls, laptop facing the coach; coach chair behind it, both client chairs side by side facing the desk
  pc('k_desk', cx + dx, zc, 0, 1.15, 1.9, 0.9, { col: '#EFE6D6' });
  pc('k_ochair', cx + dx, zc - 0.95, 0, 1.1, 0.6, 0.6);
  { const s = grp(cx + dx, zc - 0.95, 0, g); put(cyl(0.035, 0.035, 0.2, '#3A2A1E'), 0, 0.42, 0, s); }
  pc('k_chairB', cx + dx - 0.5, zc + 1.05, Math.PI, 1.05, 0.8, 0.8, { col: '#E0A53A' }); // both client chairs use the same model (the other one had a throw on it)
  pc('k_chairB', cx + dx + 0.5, zc + 1.05, Math.PI, 1.05, 0.8, 0.8, { col: '#E0A53A' });
  if (first) { // window wall (-x) and the left part of the back wall (-z)
    if (!S) pc('k_seat', lx + 0.44, cz, H, 0.95, 1.7, 0.8, { col: '#F4EEE2' }); // window seat in medium and large rooms only           // flush under the window, facing the room
    pc('k_plant', lx + 0.32, cz + 1.2, 0, 0.62, 0.4, 0.4);                         // small plant past the seat's front end
    if (!S) pc('k_lamp', lx + 0.7, cz - 0.75, 0, 2.15, 0.3, 0.3);                  // arc lamp: pole beside the seat, shade over it
    if (!S) pc('k_snake', lx + 0.38, bz + 0.4, 0, 1.3, 0.5, 0.5);                  // back corner
    if (!S) pc('k_ladder', lx + 1.35, bz + 0.02, 0, 2.15, 0.65, 0.25, { hang: [0, -1], inset: 0.15 });
    pc('k_cork', cx + (S ? -0.1 : 0.35), bz + 0.02, 0, 1.2, 0, 0, { hang: [0, -1], inset: 0.11, y: 0.75 });
    pc('k_sconce', lx + (S ? 0.6 : 0.85), bz + 0.02, -H, 0.34, 0, 0, { hang: [0, -1], inset: 0.15, y: 1.45 });
    { const sc = grp(lx + 0.02, cz + D / 2 - 0.7, 0, g); sc.userData.hang = [-1, 0]; sc.userData.swap = true; const q = grp(0.15, 0, 0, sc); glbSwap(q, KIT + '/k_sconce', { h: 0.34, y: 1.56 }); }
    { const fr = grp(lx + 0.03, cz + D / 2 - 1.3, H, g); fr.userData.hang = [-1, 0]; fr.userData.swap = true; put(rbox(0.6, 0.78, 0.04, '#2B2B2B', 0.01, { r: 0.6 }), 0, 1.45, 0.02, fr);
      const pl = new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.67), mat('#FFFFFF', { map: CAREER_SIGN(), r: 0.95, mapK: 'csign' })); pl.position.set(0, 1.45, 0.045); fr.add(pl); }
  }
  if (last) { // bookcase in the back-right corner, armchair (and footstool) on the right, turned towards the room
    pc('k_bookcase', rx - 0.65, bz + 0.33, 0, 2.0, 1.15, 0.55, { col: '#7A4A2A' });
    if (N) { if (!S) pc('k_armchair', rx - 0.6, zc + 2.0, -H / 2, 1.1, 0.85, 0.85); } // small room: no space beside the client chairs
    else { pc('k_armchair', rx - 0.65, zc + 1.0, -H / 2, 1.1, 0.85, 0.85); pc('k_ottoman', rx - 1.25, zc + 1.65, -H / 2, 0.46, 0.6, 0.5); }
  }
  room.staffSpot = { x: cx + dx, z: zc - 0.95, rot: 0, sit: true, y: 0.02 };
  room.spots.push({ x: cx + dx - 0.5, z: zc + 1.05, rot: Math.PI, sit: true, y: 0.02, busy: null });
}
// ---- kit layout tool: a room is a list of pieces placed by wall / corner, sized from their real footprint, then checked ----
// item: { p: piece, h: height, wall: 'back'|'left'|'right'|'front' (flush, facing into the room) | none (free: x,z,rot),
//   u: along the wall in m from its middle, or 'L'/'R' (back/front walls: left/right corner) / 'B'/'F' (side walls: back/front corner),
//   gap, hang (wall-hung, follows the cutaway), y, solid (default true: blocks walking) }
const KIT_DIMS = {};
// frame: with frontDoor the whole layout turns a quarter at a time so its front (+z) is the door's wall: you walk in facing its back wall
function kitFrame(room, frontDoor) {
  const H = Math.PI / 2, w0 = room.w || 6, D0 = SIZES[room.sz || 'm'].D; let rho = 0;
  if (frontDoor && room.door) { const ax = Math.abs(room.door.x) / (w0 / 2), az = Math.abs(room.door.z) / (D0 / 2); rho = az >= ax ? (room.door.z > 0 ? 0 : Math.PI) : (room.door.x > 0 ? H : -H); }
  const sw = Math.abs(Math.sin(rho)) > 0.5, c = Math.round(Math.cos(rho)), s = Math.round(Math.sin(rho));
  const T = (x, z) => ({ x: x * c + z * s, z: -x * s + z * c }), V = (x, z) => ({ x: x * c - z * s, z: x * s + z * c });
  return { w: sw ? D0 : w0, D: sw ? w0 : D0, rho, T, door: room.door ? V(room.door.x, room.door.z) : null };
}
const DECO_DIMS = { '@menu': [1.45, 1, 0.08], '@shelf': [3.4, 1, 0.7], '@frame': [0.8, 1, 0.08], '@rug': [1, 0.02, 1] };
const DECO = {
  '@menu': (p, it) => { const H = it.h, W = H * 1.45, y = it.y || 1.7; put(rbox(W, H, 0.05, '#E9DCC0', 0.03, { r: 0.8 }), 0, y, 0, p); put(rbox(W - 0.1, H - 0.1, 0.06, '#3B5440', 0.02, { r: 0.95 }), 0, y, 0.004, p);
    put(rbox(W * 0.45, 0.05, 0.065, '#F3EEDC', 0.02, { r: 0.9 }), -W * 0.12, y + H * 0.26, 0.006, p);
    for (let i = 0; i < 3; i++) { put(rbox(W * 0.42, 0.022, 0.065, '#E6E1CC', 0.01, { r: 0.9 }), -W * 0.13, y + H * (0.06 - i * 0.14), 0.006, p); put(rbox(0.07, 0.022, 0.065, '#E8C55A', 0.01, { r: 0.9 }), W * 0.3, y + H * (0.06 - i * 0.14), 0.006, p); }
    put(cyl(0.07, 0.055, 0.1, '#9DB38C', { r: 0.8 }), W * 0.3, y + H * 0.27, 0.04, p); },
  '@shelf': (p, it) => { const H = it.h, W = H * 3.4, y = it.y || 1.55; put(rbox(W, 0.05, 0.2, '#B98454', 0.02, { r: 0.75 }), 0, y, 0, p);
    for (const sx of [-1, 1]) put(rbox(0.04, 0.14, 0.16, '#9C6B40', 0.01, { r: 0.75 }), sx * W * 0.36, y - 0.09, -0.01, p);
    put(cyl(0.07, 0.055, 0.13, '#D9805E', { r: 0.8 }), -W * 0.32, y + 0.09, 0.01, p); for (let i = 0; i < 5; i++) put(leaf(0.06, '#7FA86A', { r: 0.8 }), -W * 0.32 + Math.cos(i * 1.3) * 0.05, y + 0.2 + (i % 2) * 0.04, 0.01 + Math.sin(i * 1.3) * 0.04, p);
    for (let i = 0; i < 3; i++) put(cyl(0.045, 0.045, 0.16 - i * 0.02, ['#E8D7A8', '#CFE0BE', '#F1C9A6'][i], { r: 0.4 }), -0.05 + i * 0.12, y + 0.1 - i * 0.01, 0.01, p);
    put(cyl(0.05, 0.04, 0.06, '#F4EEE2', { r: 0.6 }), W * 0.3, y + 0.055, 0.01, p); put(cyl(0.05, 0.04, 0.06, '#9DB38C', { r: 0.6 }), W * 0.3, y + 0.115, 0.01, p); },
  '@frame': (p, it) => { const H = it.h, W = H * 0.8, y = it.y || 1.55; put(rbox(W, H, 0.04, it.c || '#C98A3A', 0.02, { r: 0.7 }), 0, y, 0, p); put(rbox(W - 0.08, H - 0.08, 0.045, '#F4E6CC', 0.01, { r: 0.95 }), 0, y, 0.003, p);
    put(sph(0.09, it.c2 || '#9DB38C', { r: 0.9 }), 0, y - H * 0.05, 0.02, p).scale.z = 0.2; put(rbox(W * 0.5, 0.04, 0.05, it.c2 || '#9DB38C', 0.01, { r: 0.9 }), 0, y - H * 0.3, 0.004, p); },
  '@rug': (p, it) => { const r = (it.len || 1.8) / 2; put(cyl(r, r, 0.015, '#9DB38C', { r: 1 }, 32), 0, 0.14, 0, p); put(cyl(r - 0.1, r - 0.1, 0.018, '#EADBB8', { r: 1 }, 32), 0, 0.142, 0, p); put(cyl(r - 0.28, r - 0.28, 0.02, '#D9A877', { r: 1 }, 32), 0, 0.144, 0, p); put(cyl(r - 0.4, r - 0.4, 0.022, '#EADBB8', { r: 1 }, 32), 0, 0.146, 0, p); },
};
const ROOM_MAP = () => GC.roomMap || (GC.roomMap = canvasTex(512, 320, (c, W, H) => { c.fillStyle = '#EFE3C4'; c.fillRect(0, 0, W, H); let sd = 11; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647);
  c.strokeStyle = '#FFFFFF'; c.lineWidth = 7; for (let i = 0; i < 9; i++) { c.beginPath(); c.moveTo(0, 20 + i * 38 + rr() * 10); c.lineTo(W, 30 + i * 36 + rr() * 20); c.stroke(); c.beginPath(); c.moveTo(20 + i * 60 + rr() * 10, 0); c.lineTo(10 + i * 58 + rr() * 30, H); c.stroke(); }
  for (let i = 0; i < 26; i++) { c.fillStyle = rr() < 0.5 ? '#E3D2A8' : '#D8E6C2'; c.fillRect(rr() * W, rr() * H, 26 + rr() * 30, 18 + rr() * 20); }
  c.strokeStyle = '#8CC3E3'; c.lineWidth = 22; c.lineCap = 'round'; c.beginPath(); c.moveTo(250, -10); c.bezierCurveTo(200, 80, 330, 140, 260, 210); c.bezierCurveTo(200, 270, 300, 300, 280, 340); c.stroke();
  for (let i = 0; i < 30; i++) { const x = rr() * W, y = rr() * H; if (Math.abs(x - 260) < 40) continue; c.fillStyle = '#8DBF73'; c.beginPath(); c.arc(x, y, 6 + rr() * 5, 0, 6.3); c.fill(); } }));
const SCHED_TEX = () => GC.sched || (GC.sched = canvasTex(256, 96, (c, W, H) => { c.fillStyle = '#F8EEDF'; c.fillRect(0, 0, W, H);
  [['#F3C04A', 'sun'], ['#7DB8D8', 'bowl'], ['#9C7BD6', 'book'], ['#8DBF73', 'star']].forEach(([col, k], i) => { const x = 16 + i * 60; c.fillStyle = '#FFFFFF'; c.fillRect(x, 18, 48, 62); c.fillStyle = col; c.fillRect(x + 18, 10, 12, 12);
    c.beginPath(); if (k === 'sun') { c.arc(x + 24, 52, 12, 0, 6.3); } else if (k === 'bowl') { c.arc(x + 24, 46, 15, 0, Math.PI); } else if (k === 'book') { c.rect(x + 10, 38, 28, 26); } else { for (let a = 0; a < 10; a++) { const r = a % 2 ? 7 : 16, t = a * Math.PI / 5 - Math.PI / 2; c.lineTo(x + 24 + Math.cos(t) * r, 52 + Math.sin(t) * r); } } c.fill(); }); }));
Object.assign(DECO_DIMS, { '@whiteboard': [1.5, 1, 0.06], '@map': [1.6, 1, 0.04], '@cork': [1.25, 1, 0.06], '@pendant': [0.45, 1, 0.45], '@cubby': [1.4, 1, 0.42], '@planterLav': [0.9, 1, 0.3] });
Object.assign(DECO, {
  '@whiteboard': (p, it) => { const H = it.h, W = H * 1.5, y = it.y || 1.5; put(rbox(W, H, 0.04, '#5E5A6A', 0.02, { m: 0.3, r: 0.5 }), 0, y, 0, p); put(rbox(W - 0.08, H - 0.08, 0.045, '#FBFBFD', 0.01, { r: 0.3 }), 0, y, 0.004, p);
    [[-0.35, 0.18, '#9C7BD6'], [0.1, 0.25, '#9C7BD6'], [0.35, -0.1, '#9C7BD6'], [-0.2, -0.2, '#9C7BD6']].forEach(([x, yy, c]) => put(cyl(0.07, 0.07, 0.01, c, { r: 0.6 }), x * W, y + yy * H, 0.03, p).rotation.x = Math.PI / 2);
    [[-0.42, 0.32, '#F7D154'], [0.4, 0.3, '#F2A0B8'], [0.38, -0.3, '#F7D154'], [-0.4, -0.32, '#9ED6B0']].forEach(([x, yy, c]) => put(rbox(0.12, 0.12, 0.012, c, 0.005, { r: 0.9 }), x * W, y + yy * H, 0.032, p)); },
  '@map': (p, it) => { const H = it.h, W = H * 1.6, y = it.y || 1.45; put(rbox(W + 0.06, H + 0.06, 0.03, '#C99A5E', 0.01, { r: 0.7 }), 0, y, 0, p); const pl = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat('#FFFFFF', { map: ROOM_MAP(), mapK: 'roomMap', r: 0.9 })); pl.position.set(0, y, 0.02); p.add(pl); },
  '@cork': (p, it) => { const H = it.h, W = H * 1.25, y = it.y || 1.55; put(rbox(W, H, 0.04, '#8A5A34', 0.02, { r: 0.7 }), 0, y, 0, p); put(rbox(W - 0.08, H - 0.08, 0.045, '#C9955F', 0.01, { r: 0.95 }), 0, y, 0.004, p);
    for (let i = 0; i < 3; i++) { put(rbox(0.22, 0.26, 0.01, '#FFFFFF', 0.004, { r: 0.8 }), (-0.3 + i * 0.3) * W, y + 0.18 * H, 0.03, p); put(rbox(0.17, 0.15, 0.012, ['#C9B79A', '#B9C7D6', '#D6C2A6'][i], 0.004, { r: 0.8 }), (-0.3 + i * 0.3) * W, y + 0.2 * H, 0.034, p); put(sph(0.018, ['#D9534F', '#3E8E5A', '#3B6FB6'][i]), (-0.3 + i * 0.3) * W, y + 0.33 * H, 0.04, p); }
    for (let i = 0; i < 5; i++) { put(cyl(0.012, 0.012, 0.02, '#C9A23B', { m: 0.6 }), (-0.36 + i * 0.18) * W, y - 0.18 * H, 0.03, p).rotation.x = Math.PI / 2; put(rbox(0.03, 0.09, 0.012, '#C9A23B', 0.006, { m: 0.6, r: 0.3 }), (-0.36 + i * 0.18) * W, y - 0.26 * H, 0.032, p); put(rbox(0.05, 0.06, 0.008, ['#E9785F', '#5AB8F0', '#7ACB4E', '#F2C14E', '#B57BE8'][i], 0.004), (-0.36 + i * 0.18) * W, y - 0.34 * H, 0.033, p); } },
  '@pendant': (p, it) => { const y = it.y || 1.95, c = it.c || '#DADCE2'; put(cyl(0.008, 0.008, ROOM_H + 0.1 - y, '#4A4A50'), 0, (ROOM_H + 0.1 + y) / 2, 0, p); put(cyl(0.05, 0.05, 0.08, c, { m: 0.5, r: 0.35 }), 0, y + 0.02, 0, p);
    const sh = put(new THREE.Mesh(new THREE.SphereGeometry(0.22, 20, 10, 0, Math.PI * 2, 0, Math.PI / 2), mat(c, { m: 0.4, r: 0.35 })), 0, y - 0.18, 0, p); sh.material.side = THREE.DoubleSide; sh.castShadow = true; put(sph(0.07, '#FFF2D0', { e: '#FFE2A8', ei: 1.2 }), 0, y - 0.2, 0, p); },
  '@cubby': (p, it) => { const H = it.h, W = H * 1.4, D = 0.42; for (const [w2, h2, d2, x, y] of [[W, 0.05, D, 0, H - 0.025], [W, 0.05, D, 0, 0.17], [0.05, H - 0.1, D, -W / 2 + 0.025, H / 2 + 0.07], [0.05, H - 0.1, D, W / 2 - 0.025, H / 2 + 0.07], [W, H - 0.1, 0.03, 0, H / 2 + 0.07]]) put(rbox(w2, h2, d2, '#D9935A', 0.02, { r: 0.6 }), x, y + 0.1, d2 === 0.03 ? -D / 2 + 0.015 : 0, p);
    put(rbox(0.55, 0.3, 0.32, '#E8D2A6', 0.04, { r: 0.95 }), 0.15, 0.42, 0.02, p); ['#E9785F', '#5AB8F0', '#F2C14E', '#7ACB4E'].forEach((c, i) => put(sph(0.08, c, { r: 0.4 }), 0.15 + (i - 1.5) * 0.12, 0.6, 0.02 + (i % 2) * 0.05, p)); },
  '@planterLav': (p, it) => { const y = it.y || 0.95; put(rbox(0.9, 0.2, 0.26, '#B97E45', 0.03, { r: 0.8 }), 0, y, 0, p); for (let i = 0; i < 11; i++) { const x = -0.38 + i * 0.076; put(cyl(0.008, 0.008, 0.26, '#6E8F45'), x, y + 0.2, (i % 2) * 0.06 - 0.03, p); put(rbox(0.035, 0.12, 0.035, i % 3 ? '#9C7BD6' : '#B39AE0', 0.012, { r: 0.9 }), x, y + 0.36, (i % 2) * 0.06 - 0.03, p); } },
});
Object.assign(DECO_DIMS, { '@notes': [1.3, 1, 0.06], '@stool': [0.42, 1, 0.42], '@lowtable': [0.85, 1, 0.85], '@bookshelf': [1.0, 1, 0.36], '@yline': [0.12, 1, 3] });
Object.assign(DECO, {
  '@notes': (p, it) => { const H = it.h, W = H * 1.3, y = it.y || 1.5; put(rbox(W, H, 0.04, '#8A5A34', 0.02, { r: 0.7 }), 0, y, 0, p); put(rbox(W - 0.08, H - 0.08, 0.045, '#C9955F', 0.01, { r: 0.95 }), 0, y, 0.004, p); // idea board: many sticky notes, one circled in red
    let sd = 21; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647), cols = ['#F7D154', '#F2A0B8', '#9ED6B0', '#8CC8EE', '#F5B66A', '#FFFFFF'];
    for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { if (rr() < 0.15) continue; const x = (-0.42 + i * 0.168) * W + (rr() - 0.5) * 0.04, yy = y + (0.34 - r * 0.22) * H; const n = put(rbox(0.12, 0.12, 0.01, cols[Math.floor(rr() * cols.length)], 0.004, { r: 0.9 }), x, yy, 0.03, p); n.rotation.z = (rr() - 0.5) * 0.25; }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.01, 6, 28), mat('#D9342B', { r: 0.6 })); ring.position.set(0.08 * W, y - 0.04 * H, 0.04); p.add(ring); put(rbox(0.12, 0.12, 0.011, '#F7D154', 0.004, { r: 0.9 }), 0.08 * W, y - 0.04 * H, 0.035, p); },
  '@stool': (p, it) => { const sh = it.h || 0.62; put(cyl(0.19, 0.19, 0.05, '#B97A45', { r: 0.7 }), 0, sh, 0, p); // round wooden seat on four black splayed legs with a foot ring
    for (const a of [0.785, 2.356, 3.927, 5.498]) { const l = put(cyl(0.016, 0.016, sh, '#2E2F33', { m: 0.5, r: 0.4 }), Math.cos(a) * 0.15, sh / 2, Math.sin(a) * 0.15, p); l.rotation.set(Math.sin(a) * 0.12, 0, -Math.cos(a) * 0.12); }
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.01, 6, 24), mat('#2E2F33', { m: 0.5, r: 0.4 })); ring.rotation.x = Math.PI / 2; ring.position.y = sh * 0.38; p.add(ring); },
  '@lowtable': (p, it) => { const r = (it.len || 0.85) / 2; put(cyl(r, r, 0.07, '#B97E45', { r: 0.7 }), 0, 0.42, 0, p); for (const a of [0.785, 2.356, 3.927, 5.498]) put(cyl(0.04, 0.035, 0.36, '#A86F3C', { r: 0.7 }), Math.cos(a) * r * 0.62, 0.21, Math.sin(a) * r * 0.62, p); },
  '@bookshelf': (p, it) => { const H = it.h || 1.0, W = it.w || 1.0, Dp = 0.34, wood = '#B97E45'; // low open bookshelf with books, a basket and a fern-like plant on top
    for (const [w2, h2, d2, x, y, z] of [[W, 0.04, Dp, 0, H, 0], [W, 0.04, Dp, 0, 0.06, 0], [0.04, H, Dp, -W / 2 + 0.02, H / 2, 0], [0.04, H, Dp, W / 2 - 0.02, H / 2, 0], [W, H, 0.02, 0, H / 2, -Dp / 2 + 0.01], [W - 0.06, 0.03, Dp - 0.03, 0, H * 0.36, 0], [W - 0.06, 0.03, Dp - 0.03, 0, H * 0.68, 0]]) put(rbox(w2, h2, d2, wood, 0.01, { r: 0.7 }), x, y + 0.1, z, p);
    let sd = 5; const rr = () => ((sd = (sd * 16807) % 2147483647) / 2147483647), bc = ['#3E6E8E', '#C8553D', '#7A9A5A', '#E3B341', '#8E5A9E', '#D98B6C', '#4A7A6A'];
    for (const sy of [0.08, H * 0.38]) { let x = -W / 2 + 0.06; while (x < W / 2 - 0.12) { const bw = 0.035 + rr() * 0.03, bh = H * 0.24 + rr() * 0.05; put(rbox(bw, bh, 0.2, bc[Math.floor(rr() * bc.length)], 0.006, { r: 0.8 }), x + bw / 2, sy + bh / 2 + 0.1, 0.02, p); x += bw + 0.006; if (sy > 0.1 && x > 0.05) break; } }
    put(rbox(0.28, 0.16, 0.22, '#C9A56B', 0.03, { r: 0.95 }), W / 2 - 0.2, H * 0.38 + 0.2, 0.02, p);
    for (let i = 0; i < 3; i++) put(rbox(0.22, 0.04, 0.17, bc[i + 2], 0.006, { r: 0.8 }), -0.15, H * 0.7 + 0.14 + i * 0.045, 0.02, p);
    put(cyl(0.09, 0.07, 0.12, '#C9A56B', { r: 0.9 }), 0.25, H + 0.18, 0, p); [[0.25, 0.32, 0], [0.19, 0.27, 0.04], [0.31, 0.28, -0.03]].forEach(([x, y, z]) => put(sph(0.07, '#5E8A3C', { r: 0.8 }), x, H + y, z, p)); }, // a small fern pot on top (part of the shelf, so it folds away with it)
});
const SHOP_DIMS = {"k_shelf":[0.9139,1,0.3307],"k_counter":[0.998,0.7832,0.834],"k_display":[0.9004,0.998,0.8887],"k_bag":[0.6582,0.998,0.5176],"k_reader":[0.7832,0.8379,0.998],"k_candles":[0.998,0.3691,0.3145],"k_milk":[0.998,0.666,0.7793],"k_masks":[0.998,0.416,0.2598]};
const DETOX_DIMS = {"k_lockers":[0.998,0.9082,0.5371],"k_beanbag":[0.998,0.666,0.998],"k_rug":[0.998,0.041,0.998],"k_cushion":[0.998,0.2793,0.9512],"k_book":[0.998,0.1973,0.7598]};
const GARAGE_DIMS = {"k_workbench":[0.998,0.7871,0.6621],"k_table":[0.998,0.6777,0.502],"k_pegboard":[0.998,0.6504,0.1465],"k_rack":[0.502,0.998,0.209],"k_boxes":[0.998,0.8145,0.6035],"k_bench":[0.998,0.5527,0.5176],"k_bike":[0.998,0.623,0.3223]};
// Boutique (from its painting, simplified): the counter stands out from the left wall with room behind it for the host, who serves the buyer standing at its front; product shelves on the back walls, a display table with a candle pyramid
function shopKit(g, cx, cz, room) { // laid out in the door frame (door on the front wall), so the doorway is always clear wherever the player put the door
  const F = kitFrame(room, true), w = F.w, D = F.D, S = Math.min(w, D) < 5, H = Math.PI / 2, L = [], Wp = (x, z, rot) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z, rot: rot + F.rho }; };
  const cl = S ? 1.2 : 1.45, cd = SHOP_DIMS.k_counter[2] / SHOP_DIMS.k_counter[0] * cl, ch = SHOP_DIMS.k_counter[1] / SHOP_DIMS.k_counter[0] * cl;
  const hx = -w / 2 + 0.5, ccx = -w / 2 + 0.95 + cd / 2, ccz = S ? -0.35 : -0.55; // host lane behind the counter
  L.push({ p: 'k_counter', len: cl, x: ccx, z: ccz, rot: H });
  L.push({ p: 'k_reader', h: 0.14, x: ccx, z: ccz + cl * 0.22, rot: H, solid: false, y: ch - 0.03 }, { p: 'k_bag', h: 0.3, x: ccx + 0.05, z: ccz - cl * 0.25, rot: H + 0.4, solid: false, y: ch - 0.03 });
  const sl = S ? 1.3 : 1.6, spd = SHOP_DIMS.k_shelf[2] / SHOP_DIMS.k_shelf[0] * sl, su = S ? 0.55 : 0.2;
  L.push({ p: 'k_shelf', len: sl, wall: 'back', u: su });
  if (!S) L.push({ p: 'k_shelf', len: 1.6, wall: 'right', u: -0.9 });
  const dx = S ? 1.15 : 1.0, dz = S ? 0.05 : 0.6; L.push({ p: 'k_display', len: S ? 0.65 : 0.85, x: dx, z: dz, rot: 0 });
  if (!S) L.push({ p: '@plant', s: 1.5, wall: 'left', u: 'B' });
  kitRoom(g, cx, cz, room, ROOM_STYLE.shop.model, L, SHOP_DIMS, F);
  room.staffSpot = { ...Wp(hx, ccz, H), sit: false, y: 0 }; // behind the counter, facing the buyer
  const sp = [{ ...Wp(ccx + cd / 2 + 0.38, ccz, -H), till: true }, Wp(su, -D / 2 + spd + 0.5, Math.PI), Wp(dx - (S ? 0.65 : 0.75), dz + 0.1, H)]; // the till first: everyone pays there
  if (!S) sp.push(Wp(w / 2 - 0.85, -0.9, H));
  for (const q of sp.slice(0, seatsN(room))) room.spots.push({ ...q, sit: false, y: 0, busy: null });
}
// Digital detox (from its painting, sage version): the phone lockers and a low bookshelf on the back wall, a round rug with two beanbags and a floor cushion around a low table with an open book, a plant in the corner, an arched window
function detoxKit(g, cx, cz, room) {
  const F = kitFrame(room, true), w = F.w, D = F.D, S = Math.min(w, D) < 5, L = [], tx = S ? 0.1 : -0.2, tz = S ? 0.0 : 0.2, Wp = (x, z, rot) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z, rot: rot + F.rho }; };
  L.push({ p: 'k_lockers', len: S ? 1.3 : 1.7, wall: 'back', u: S ? -0.35 : 0.1 });
  if (!S) L.push({ p: '@bookshelf', h: 1.15, wall: 'back', u: 'R' }, { p: '@plant', s: 1.7, wall: 'back', u: 'L' });
  L.push({ p: 'k_rug', len: S ? 2.4 : 3.2, x: tx, z: tz, rot: 0, solid: false }, { p: '@lowtable', h: 1, len: 0.8, x: tx, z: tz, rot: 0 }, { p: 'k_book', len: 0.34, x: tx + 0.03, z: tz, rot: 0.3, solid: false, y: 0.36 });
  const b1 = [tx - 1.25, tz - 0.3], b2 = [tx + 1.25, tz + 0.25]; // far enough from the low table for the sitters' legs
  L.push({ p: 'k_beanbag', len: 0.85, x: b1[0], z: b1[1], rot: 0.9 }, { p: 'k_beanbag', len: 0.85, x: b2[0], z: b2[1], rot: -2.0 });
  if (!S) L.push({ p: 'k_cushion', len: 0.6, x: tx - 0.1, z: tz + 0.95, rot: 0.2, solid: false });
  kitRoom(g, cx, cz, room, ROOM_STYLE.detox.model, L, DETOX_DIMS, F);
  const face = (a) => Math.atan2(tx - a[0], tz - a[1]);
  const back = (a, k) => [a[0] - Math.sin(face(a)) * k, a[1] - Math.cos(face(a)) * k]; const s1 = back(b1, 0.12), s2 = back(b2, 0.12); // sit into the back of the beanbag
  room.spots.push({ ...Wp(s1[0], s1[1], face(b1)), sit: true, y: -0.1, busy: null });
  room.staffSpot = { ...Wp(s2[0], s2[1], face(b2)), sit: true, y: -0.1 };
}
// Hustle garage (from its painting, without the roll-up door): idea board with one note circled, tool pegboard over the workbench, a trestle table in the middle with a stool each side, boxes and a product rack, a bench and a bicycle on the wall
function garageKit(g, cx, cz, room) {
  const F = kitFrame(room, true), w = F.w, D = F.D, S = Math.min(w, D) < 5, L = [], tx = S ? 0.1 : -0.3, tz = S ? -0.45 : 0.15, Wp = (x, z, rot) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z, rot: rot + F.rho }; };
  L.push({ p: '@notes', h: S ? 0.8 : 1.0, wall: 'back', u: S ? -0.6 : -1.0, hang: true, y: 1.45, gap: 0.12 });
  L.push({ p: 'k_workbench', len: S ? 1.2 : 1.6, wall: 'back', u: 'R' }, { p: 'k_pegboard', len: S ? 1.0 : 1.3, wall: 'back', u: 'R', hang: true, y: 1.25, gap: 0.12 });
  const tl = S ? 1.5 : 1.9, td = GARAGE_DIMS.k_table[2] / GARAGE_DIMS.k_table[0] * tl;
  const sg = S ? 0.36 : 0.4, st = [[tx, tz - td / 2 - sg, 0], [tx, tz + td / 2 + sg, Math.PI]]; // coach and client face each other across the long side of the table, as in the painting (the small garage pulls the table back to keep the doorway clear)
  L.push({ p: 'k_table', len: tl, x: tx, z: tz, rot: 0 }, { p: '@stool', h: 1, x: st[0][0], z: st[0][1], rot: st[0][2] }, { p: '@stool', h: 1, x: st[1][0], z: st[1][1], rot: st[1][2] });
  if (!S) { L.push({ p: 'k_rack', h: 1.5, wall: 'right', u: -1.35 }, { p: 'k_boxes', len: 1.2, wall: 'right', u: 0.5 }, { p: 'k_bench', len: 1.15, wall: 'left', u: 0.35 }, { p: 'k_bike', len: 1.45, wall: 'left', u: -1.2, hang: true, y: 0.75, gap: 0.08 }, { p: '@plant', s: 1.5, wall: 'left', u: 'F' }); }
  else L.push({ p: 'k_boxes', len: 0.95, wall: 'right', u: 0.6 });
  kitRoom(g, cx, cz, room, ROOM_STYLE.garage.model, L, GARAGE_DIMS, F);
  room.staffSpot = { ...Wp(st[0][0], st[0][1], st[0][2]), sit: true, y: 0.14 };
  room.spots.push({ ...Wp(st[1][0], st[1][1], st[1][2]), sit: true, y: 0.14, busy: null });
}
const LAB_DIMS = {"k_bench":[0.998,0.7246,0.3379],"k_chair":[0.7324,0.998,0.7129],"k_shelf":[0.998,0.8223,0.4941],"k_stool":[0.6621,0.998,0.6582],"k_printer":[0.7715,0.998,0.6426],"k_pegboard":[0.998,0.6738,0.2168],"k_island":[0.998,0.791,0.5918],"k_desk":[0.998,0.8887,0.5645]};
const MOVING_DIMS = {"k_chair":[0.6855,0.998,0.8848],"k_boxes":[0.834,0.998,0.6152],"k_trolley":[0.5762,0.998,0.9277],"k_rug":[0.998,0.041,0.8105],"k_box":[0.998,0.627,0.416],"k_openbox":[0.998,0.8848,0.998],"k_desk":[0.998,0.9473,0.834]};
const PARENT_DIMS = {"k_schedule":[0.998,0.4746,0.084],"k_table":[0.998,0.3613,0.5527],"k_rug":[0.998,0.0488,0.7441],"k_sofa":[0.998,0.5176,0.459],"k_playmat":[0.998,0.084,0.709],"k_kidchair":[0.6699,0.998,0.6504],"k_kidtable":[0.998,0.8574,0.9941],"k_armchair":[0.7285,0.998,0.7246]};
// Lab (from the lab painting): tool pegboard over the long bench with the microscope (stool in front), the two-screen desk and its chair, the 3D printer and the bin shelf on the right, the island in the middle, pendants and a whiteboard
function labKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = w < 5 || D < 5, H = Math.PI / 2, L = [];
  L.push({ p: 'k_bench', len: S ? 1.6 : 2.2, wall: 'back', u: 'L' }, { p: 'k_pegboard', len: S ? 1.4 : 1.7, wall: 'back', u: 'L', hang: true, y: 1.05, gap: 0.12 });
  L.push({ p: 'k_desk', len: S ? 1.4 : 1.7, wall: 'back', u: 'R' });
  if (!S) L.push({ p: 'k_printer', h: 0.95, wall: 'right', u: -0.15 }, { p: 'k_shelf', len: 1.5, wall: 'right', u: 'F' }, { p: '@whiteboard', h: 0.8, wall: 'right', u: -0.3, hang: true, y: 1.65, gap: 0.14 });
  else L.push({ p: 'k_shelf', len: 1.2, wall: 'right', u: 'F' });
  L.push({ p: 'k_island', len: S ? 1.0 : 1.5, x: S ? -1.05 : -0.4, z: S ? 0.6 : 0.75, rot: 0 });
  L.push({ p: 'k_stool', h: 0.62, x: -w / 2 + (S ? 0.8 : 1.0), z: -D / 2 + 1.0, rot: 0 });
  L.push({ p: '@pendant', h: 1, x: -w / 2 + (S ? 0.55 : 0.75), z: -D / 2 + 0.55, solid: false, y: 1.85 }, { p: '@pendant', h: 1, x: -w / 2 + (S ? 1.25 : 1.75), z: -D / 2 + 0.55, solid: false, y: 1.85 });
  if (!S) L.push({ p: '@plant', s: 1.4, wall: 'left', u: 'F' });
  const at = kitRoom(g, cx, cz, room, ROOM_STYLE.lab.model, L, LAB_DIMS);
  const dk = at.k_desk; if (dk) { const cz2 = dk.z + dk.pd / 2 + 0.35; const ch = grp(dk.x, cz2, Math.PI, g); glbSwap(ch, 'lab_kit/k_chair', { h: 0.95, y: 0.11 }); room.staffSpot = { x: dk.x, z: cz2, rot: Math.PI, sit: true, y: 0.02 }; }
  const bn = at.k_bench; if (bn && !S) room.staffSpot2 = { x: bn.x + 0.35, z: bn.z + bn.pd / 2 + 0.35, rot: Math.PI, sit: false, y: 0 }; // the regular lab's 2nd researcher works standing at the bench
}
// Moving (from the moving painting): city map on the back wall, the round wooden desk on a jute rug with the agent behind it and two client chairs in front, a stack of boxes with the hand truck in the corner, the sofa, the photo-and-keys board, a lavender box, a lamp over the desk
function movingKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = w < 5 || D < 5, H = Math.PI / 2, L = [], dx = -0.55, dz = S ? -0.6 : -0.5;
  L.push({ p: '@map', h: S ? 1.0 : 1.3, wall: 'back', u: S ? -0.5 : -0.9, hang: true, y: 1.45, gap: 0.14 });
  L.push({ p: 'k_boxes', h: 1.45, wall: 'back', u: 'R' }, { p: 'k_rug', len: S ? 2.4 : 3.0, x: dx, z: dz + 0.35, rot: 0, solid: false });
  L.push({ p: 'k_desk', len: S ? 1.35 : 1.6, x: dx, z: dz, rot: 0 });
  L.push({ p: 'k_chair', h: 0.9, x: dx - 0.45, z: dz + 1.05, rot: Math.PI }); if (!S) L.push({ p: 'k_chair', h: 0.9, x: dx + 0.45, z: dz + 1.05, rot: Math.PI });
  if (!S) { L.push({ p: 'k_sofa', kit: 'parent_kit', dm: PARENT_DIMS.k_sofa, len: 1.9, wall: 'right', u: 0.55, tint: '#6FB3A8' }, { p: '@cork', h: 0.7, wall: 'right', u: -1.4, hang: true, y: 1.6, gap: 0.14 }, { p: '@planterLav', h: 1, wall: 'right', u: 0.6, hang: true, y: 1.35, gap: 0.14 });
    L.push({ p: 'k_trolley', h: 1.1, x: w / 2 - 1.55, z: -D / 2 + 0.55, rot: -0.4 }, { p: 'k_openbox', h: 0.5, x: w / 2 - 0.55, z: D / 2 - 0.55, rot: -0.3 }, { p: '@plant', s: 1.5, wall: 'left', u: 'F' }); }
  else L.push({ p: 'k_openbox', h: 0.5, wall: 'right', u: 'F' });
  L.push({ p: '@pendant', h: 1, x: dx, z: dz, solid: false, y: 1.9, c: '#2F7F78' });
  const at = kitRoom(g, cx, cz, room, ROOM_STYLE.moving.model, L, MOVING_DIMS);
  const ag = grp(cx + dx, cz + dz - 0.78, 0, g); glbSwap(ag, 'moving_kit/k_chair', { h: 0.9, y: 0.11 });
  room.staffSpot = { x: cx + dx, z: cz + dz - 0.78, rot: 0, sit: true, y: 0.02 };
  room.spots.push({ x: cx + dx - 0.45, z: cz + dz + 1.05, rot: Math.PI, sit: true, y: 0.02, busy: null });
}
// Parent coaching (from the parent painting): grown-ups' corner (sofa on a rug, coffee table, the coach's green armchair), the routine board and a cubby with a basket of balls on the wall, the kids' corner (foam play mat, small table with shape puzzle, little chair)
function parentKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = w < 5 || D < 5, H = Math.PI / 2, L = [];
  const sx = -w / 2 + (S ? 1.15 : 1.5), sz = -D / 2 + 0.8, ax = sx + (S ? 1.55 : 2.0);
  L.push({ p: 'k_rug', len: S ? 2.2 : 2.8, x: sx + 0.7, z: sz + 0.75, rot: 0, solid: false }, { p: 'k_sofa', len: S ? 1.5 : 1.8, x: sx, z: sz, rot: 0, recol: ['cream', '#7FA6D6'] }, { p: 'k_table', len: S ? 0.8 : 1.0, x: sx + 0.25, z: sz + 1.05, rot: 0 }, { p: 'k_armchair', h: 0.92, x: ax, z: sz + 0.35, rot: -H * 0.75, recol: ['green', '#2F4A7E'] });
  L.push({ p: 'k_schedule', len: S ? 1.2 : 1.5, wall: 'back', u: S ? 0.6 : 1.1, hang: true, y: 1.15, gap: 0.13 });
  const mx = w / 2 - (S ? 1.0 : 1.75), mz = S ? D / 2 - 0.95 : 0.75; // the kids' corner sits towards the middle, not pushed into the far corner
  L.push({ p: 'k_playmat', len: S ? 1.7 : 2.3, x: mx, z: mz, rot: 0, solid: false }, { p: 'k_kidtable', len: 0.75, x: mx + 0.2, z: mz - 0.2, rot: 0 }, { p: 'k_kidchair', h: 0.55, x: mx + 0.2, z: mz + 0.42, rot: Math.PI });
  if (!S) L.push({ p: '@cubby', h: 0.8, wall: 'right', u: -0.3, gap: 0.12 });
  kitRoom(g, cx, cz, room, ROOM_STYLE.parent.model, L, PARENT_DIMS);
  const P = (x, z, rot) => ({ x: cx + x, z: cz + z, rot });
  room.spots.push({ x: cx + sx + 0.25, z: cz + sz + 0.1, rot: 0, sit: true, y: 0, busy: null,
    pts: { chair: P(mx + 0.2, mz + 0.42, Math.PI), mat: P(mx - 0.4, mz + 0.2, 0), matSide: P(mx - 1.0, mz, H), board: P(S ? 0.6 : 1.1, -D / 2 + 0.75, Math.PI), basket: P(w / 2 - 0.9, -0.3, -H), table: P(mx + 0.2, mz - 0.2, 0), kidNear: P(mx - 0.5, mz + 0.4, H) } });
  room.staffSpot = { x: cx + ax, z: cz + sz + 0.35, rot: -H * 0.75, sit: true, y: 0 };
}
const STAFF_DIMS = {"k_mugshelf":[0.998,0.6035,0.4668],"k_stool":[0.9707,0.998,0.9434],"k_lamp":[0.5605,0.998,0.5684],"k_coffeetable":[0.998,0.4434,0.998],"k_coffee":[0.6699,0.998,0.7051],"k_jute":[0.998,0.0801,0.998],"k_sink":[0.998,0.8887,0.5879],"k_monstera":[0.8887,0.998,0.6738],"k_fridge":[0.834,0.998,0.6191],"k_sofa":[0.998,0.5918,0.6191],"k_arcade":[0.5527,0.998,0.6465],"k_sidetable":[0.998,0.7949,0.9746]};
const YOGA_DIMS = {"k_lantern":[0.502,0.998,0.5684],"k_bowl":[0.998,0.9121,0.998],"k_towels":[0.998,0.5684,0.373],"k_lemon":[0.8418,0.998,0.5879],"k_mat":[0.5684,0.1348,0.998],"k_matpink":[0.5684,0.1348,0.998],"k_matblue":[0.5684,0.1348,0.998],"k_matyellow":[0.5684,0.1348,0.998],"k_matpurple":[0.5684,0.1348,0.998],"k_cushion":[0.998,0.3496,0.998],"k_dais":[0.998,0.2598,0.6699],"k_teatable":[0.998,0.5059,0.9863],"k_rug":[0.998,0.041,0.998],"k_speaker":[0.5723,0.998,0.502]};
// Break room (from the break-room painting): kitchenette on the back wall (sink counter with the coffee machine on it, mug shelf above, mini fridge),
// the "Wellness Quest" arcade with its stool, two coral sofas facing each other across a jute rug and a round coffee table, a side table and floor lamp, potted monsteras.
// Seats: 2 per sofa, plus the arcade stool (a staff member on a break there plays instead of drinking).
function staffroomKit(g, cx, cz, room) {
  const F = kitFrame(room, true), w = F.w, D = F.D, S = w < 5 || D < 5, H = Math.PI / 2, L = [], bz = -D / 2, lx = -w / 2, rx = w / 2;
  const W = (x, z) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z }; };
  const seat = (x, z, rot, o = {}) => { const q = W(x, z); room.spots.push({ x: q.x, z: q.z, rot: rot + F.rho, sit: true, y: 0.05, busy: null, ...o }); };
  const sk = S ? 0.95 : 1.05, sx = lx + 0.12 + 0.55; // sink counter, back-left
  const sw = 1.07, cw = 0.62, ccx = sx + sw / 2 + cw / 2; // the sink counter, then a stretch of worktop for the coffee machine (not on the sink), then the fridge
  L.push({ p: 'k_sink', h: 0.95, x: sx, z: bz + 0.33, rot: 0 }, { p: 'k_coffee', h: 0.42, x: ccx, z: bz + 0.3, rot: 0, y: 0.9, solid: false }, { p: 'k_mugshelf', len: 0.8, wall: 'back', u: ccx - 0.1, hang: true, y: 1.55, gap: 0.1 });
  { const q = W(ccx, bz + 0.33), t = grp(q.x, q.z, F.rho, g); put(rbox(cw, 0.82, 0.56, '#E0C9A4', 0.04), 0, 0.52, 0, t); put(rbox(cw + 0.02, 0.06, 0.6, '#EFE2CC', 0.02), 0, 0.96, 0, t); put(rbox(0.04, 0.12, 0.02, '#C9A46A', 0.01), 0.18, 0.75, 0.29, t); }
  L.push({ p: 'k_fridge', h: 0.95, x: ccx + cw / 2 + 0.42, z: bz + 0.3, rot: 0 });
  const ax = rx - (S ? 0.55 : 0.75), ah = S ? 1.25 : 1.35, ad = 0.6465 * ah; L.push({ p: 'k_arcade', h: ah, x: ax, z: bz + ad / 2 + 0.06, rot: 0 }, { p: 'k_stool', h: 0.5, x: ax, z: bz + ad + 0.42, rot: 0 });
  seat(ax, bz + ad + 0.42, Math.PI, { anim: 'worksit', y: 0.2 }); // playing the arcade
  const rz = S ? 0.55 : 0.6, rl = S ? 1.9 : 2.4; L.push({ p: 'k_jute', len: rl, x: 0, z: rz, rot: 0, solid: false }, { p: 'k_coffeetable', len: S ? 0.75 : 0.95, x: 0, z: rz, rot: 0 });
  const sl = S ? 1.55 : 1.85, sd = 0.62 * sl / 1; // sofas: left wall facing right, and (M) right wall facing left
  L.push({ p: 'k_sofa', len: sl, x: lx + sd / 2 + 0.06, z: rz, rot: H }); for (const o of [-0.42, 0.42]) seat(lx + sd / 2 + 0.12, rz + o * sl / 1.85, H);
  if (!S) { L.push({ p: 'k_sofa', len: sl, x: rx - sd / 2 - 0.06, z: rz + 0.25, rot: -H }); for (const o of [-0.42, 0.42]) seat(rx - sd / 2 - 0.12, rz + 0.25 + o, -H);
    L.push({ p: 'k_sidetable', len: 0.6, x: rx - 0.42, z: rz - 1.05, rot: 0 }, { p: 'k_lamp', h: 1.25, x: rx - 0.4, z: D / 2 - 0.45, rot: 0, solid: true });
    L.push({ p: 'k_monstera', h: 1.15, x: lx + 0.62, z: D / 2 - 0.5, rot: 0 }, { p: 'k_monstera', h: 1.0, x: ax - 1.05, z: bz + 0.42, rot: 0 }, { p: '@plant', s: 1.1, x: rx - 0.4, z: rz - 1.75 }); }
  else L.push({ p: 'k_monstera', h: 0.9, x: rx - 0.5, z: D / 2 - 0.45, rot: 0 }, { p: '@plant', s: 0.9, x: lx + 0.35, z: D / 2 - 0.4 });
  kitRoom(g, cx, cz, room, 'staffroom_kit', L, STAFF_DIMS, F);
}
// Yoga terrace (from the yoga painting): the teacher's wooden dais with its purple mat at the back, a speaker and a singing bowl beside it, rows of mats in
// five colours for the clients, the towel bench with water bottles, a tea corner with floor cushions on a round rug, a lemon tree and lanterns
function yogaKit(g, cx, cz, room) {
  const F = kitFrame(room, true), w = F.w, D = F.D, S = w < 5 || D < 5, H = Math.PI / 2, L = [], bz = -D / 2, lx = -w / 2, rx = w / 2;
  const W = (x, z) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z }; };
  const dl = S ? 1.5 : 1.9, dz = bz + 0.45; // dais (kept low: fitted to a footprint, not scaled up)
  { const q = W(0, dz), d = grp(q.x, q.z, F.rho, g); put(rbox(dl, 0.22, dl * 0.6, '#C98A4B', 0.05), 0, 0.2, 0, d); glbSwap(d, 'yoga_kit/k_dais', { fit: [dl, dl * 0.62], h: 0.24, y: 0.11 }); }
  room.staffSpot = (() => { const q = W(0, dz + 0.05); return { x: q.x, z: q.z, rot: F.rho, sit: false, y: 0.24 }; })();
  L.push({ p: 'k_speaker', h: 0.85, x: -dl / 2 - 0.4, z: bz + 0.35, rot: 0.3 }, { p: 'k_bowl', h: 0.22, x: dl / 2 + 0.3, z: bz + 0.35, rot: 0, solid: false });
  const n = seatsN(room), cols = ['k_matpink', 'k_matblue', 'k_matyellow', 'k_matpurple', 'k_mat', 'k_matpink'];
  const xs = n <= 2 ? [-0.55, 0.55] : n === 3 ? [-1.05, 0, 1.05] : [-1.5, -0.5, 0.5, 1.5], mz = S ? 0.55 : 0.5, ml = S ? 1.45 : 1.6;
  for (let i = 0; i < n; i++) { L.push({ p: cols[i], len: ml, x: xs[i], z: mz, rot: 0, solid: false }); const q = W(xs[i], mz + 0.15); room.spots.push({ x: q.x, z: q.z, rot: Math.PI + F.rho, sit: true, y: 0.02, busy: null }); }
  if (!S) { L.push({ p: 'k_towels', len: 1.1, wall: 'right', u: -1.3 }, { p: 'k_lemon', h: 1.4, x: rx - 0.66, z: D / 2 - 0.55, rot: 0 });
    L.push({ p: 'k_rug', len: 1.3, x: lx + 0.95, z: D / 2 - 0.95, rot: 0, solid: false }, { p: 'k_teatable', len: 0.6, x: lx + 0.95, z: D / 2 - 0.95, rot: 0 });
    L.push({ p: 'k_cushion', len: 0.5, x: lx + 0.4, z: D / 2 - 1.35, rot: 0, solid: false, tint: '#7FC8B8' }, { p: 'k_cushion', len: 0.5, x: lx + 1.5, z: D / 2 - 0.55, rot: 0, solid: false, tint: '#E9B949' });
    L.push({ p: 'k_lantern', h: 0.45, x: lx + 0.35, z: bz + 0.35, rot: 0, solid: false }, { p: 'k_monstera', kit: 'staffroom_kit', dm: STAFF_DIMS.k_monstera, h: 1.1, x: rx - 0.6, z: bz + 0.45, rot: 0 }); }
  else L.push({ p: 'k_lemon', h: 1.1, x: rx - 0.55, z: D / 2 - 0.45, rot: 0 }, { p: 'k_lantern', h: 0.4, x: lx + 0.3, z: bz + 0.3, rot: 0, solid: false });
  kitRoom(g, cx, cz, room, 'yoga_kit', L, YOGA_DIMS, F);
}
const LUCHA_DIMS = {"k_ring":[0.9277,0.5801,0.998],"k_gong":[0.8926,0.998,0.6504],"k_maskshelf":[0.584,0.998,0.2715],"k_bag":[0.291,0.998,0.6426],"k_trophy":[0.8809,0.998,0.4512],"k_bench":[0.998,0.7793,0.5684],"k_pouf":[0.9941,0.9941,0.998],"k_agave":[0.9941,0.998,0.9863],"k_cactus":[0.502,0.998,0.498]};
const AHWA_DIMS = {"k_counter":[0.998,0.4082,0.3105],"k_samovar":[0.7715,0.998,0.6074],"k_dallah":[0.2441,0.998,0.3105],"k_files":[0.998,0.5723,0.6504],"k_sofa":[0.998,0.502,0.416],"k_table":[0.998,0.8496,0.998],"k_chair":[0.5684,0.998,0.5293],"k_backgammon":[0.998,0.1426,0.998],"k_tray":[0.998,0.3066,0.7949],"k_stamp":[0.9082,0.5684,0.998],"k_fern":[0.998,0.8184,0.9863]};
const JJIM_DIMS = {"k_kiln":[0.998,0.8535,0.998],"k_mat":[0.6074,0.1582,0.998],"k_sheep":[0.9316,0.6504,0.998],"k_lowtable":[0.998,0.377,0.9434],"k_eggs":[0.998,0.5098,0.998],"k_sikhye":[0.998,0.7871,0.998],"k_towels":[0.998,0.7598,0.8262],"k_lockers":[0.8223,0.998,0.416],"k_bamboo":[0.4863,0.998,0.4355],"k_pouf":[0.9941,0.9941,0.998]};
// Lucha gym, Mexico (from the lucha painting): the ring at the back with the coach standing in it, pink poufs in a row for the clients watching,
// the mask shelf, a punching bag on the wall, the ¡GRITA! gong, the trophy cabinet, a towel bench and the painted pots (agave, cactus)
function luchaKit(g, cx, cz, room) {
  const F = kitFrame(room, true), w = F.w, D = F.D, S = w < 5 || D < 5, H = Math.PI / 2, L = [], bz = -D / 2, fz = D / 2, lx = -w / 2, rx = w / 2;
  const W = (x, z) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z }; };
  const rl = S ? 1.85 : w >= 6 ? 2.5 : 2.2, rd = rl * 0.998 / 0.998, rz = bz + rd / 2 + 0.3; // ring (len = its longer side)
  L.push({ p: 'k_ring', len: rl, x: 0, z: rz, rot: 0 });
  const k = rl / 0.998; // the coach lives on the canvas: in and out by the little stairs (front right), the ropes are walls everywhere else
  room.staffSpot = (() => { const q = W(-0.1 * k, rz - 0.08 * k); return { x: q.x, z: q.z, rot: F.rho, sit: false, y: 0.25 * k }; })();
  { const o = W(0, rz), a1 = W(1, rz), b1 = W(0, rz + 1); room.ringL = { o, ax: { x: a1.x - o.x, z: a1.z - o.z }, az: { x: b1.x - o.x, z: b1.z - o.z }, k }; // station coords; turned into the room's world frame when the room is built
    const box = (u0, u1, w0, w1) => { const a = W(u0 * k, rz + w0 * k), b = W(u1 * k, rz + w1 * k); return [Math.min(a.x, b.x), Math.max(a.x, b.x), Math.min(a.z, b.z), Math.max(a.z, b.z)]; };
    room.obsX = [box(-0.465, 0.465, -0.5, -0.39), box(-0.465, -0.36, -0.5, 0.3), box(0.36, 0.465, -0.5, 0.3), box(-0.465, 0.15, 0.19, 0.3), box(0.44, 0.465, 0.19, 0.3)]; }
  const n = seatsN(room), sp = Math.min(0.95, (w - 1.0) / n), pz = rz + rd / 2 + (S ? 0.6 : 0.75);
  for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * sp; L.push({ p: 'k_pouf', h: 0.44, x, z: pz, rot: 0, tint: '#E2457A' }); const q = W(x, pz); room.spots.push({ x: q.x, z: q.z, rot: Math.PI + F.rho, sit: true, y: 0.06, busy: null }); }
  const side = (w - rl) / 2; // room left beside the ring
  if (side > 0.7) L.push({ p: 'k_maskshelf', h: S ? 1.25 : 1.5, x: lx + side / 2, z: bz + 0.25, rot: 0 });
  if (side > 0.7) L.push(S ? { p: 'k_cactus', h: 0.7, x: rx - side / 2, z: bz + 0.35, rot: 0 } : { p: 'k_gong', h: 1.25, x: rx - side / 2, z: bz + 0.45, rot: -0.35 });
  if (!S) { L.push({ p: 'k_bag', h: 1.35, wall: 'left', u: 0.3, hang: true, y: 0.75 });
    L.push({ p: 'k_bench', len: 1.1, wall: 'left', u: fz - 1.2 - 0.6 }, { p: 'k_agave', h: 0.7, x: rx - 0.45, z: fz - 0.45, rot: 0 }, { p: 'k_cactus', h: 0.85, x: lx + 0.4, z: fz - 0.4, rot: 0 });
    if (w >= 6) L.push({ p: 'k_trophy', len: 1.0, wall: 'right', u: 0.6 }); }
  else L.push({ p: 'k_agave', h: 0.6, x: rx - 0.35, z: fz - 0.4, rot: 0 });
  kitRoom(g, cx, cz, room, 'lucha_kit', L, LUCHA_DIMS, F);
  g.traverse((o) => { if (o.userData.kit === 'k_ring') o.userData.noObs = true; }); // measured as rope walls (obsX), not as one solid block
}
// Ahwa, the Cairo café (from the ahwa painting): the carved counter at the back with the copper samovar, the coffee pots and the paperwork stamp on it
// (the host works behind it), the files shelf on the wall, a red cushioned bench along the wall, round copper tables with carved chairs and a backgammon board, ferns
function ahwaKit(g, cx, cz, room) {
  const F = kitFrame(room, true), w = F.w, D = F.D, S = w < 5 || D < 5, H = Math.PI / 2, L = [], bz = -D / 2, fz = D / 2, lx = -w / 2, rx = w / 2;
  const W = (x, z) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z }; };
  const seat = (x, z, rot) => { const q = W(x, z); room.spots.push({ x: q.x, z: q.z, rot: rot + F.rho, sit: true, y: 0.05, busy: null }); };
  const cl = S ? 1.7 : 2.2, cd = cl * 0.3105 / 0.998, ch = cl * 0.4082 / 0.998, ccx = S ? 0.3 : 0.5, ccz = bz + 0.7 + cd / 2; // counter, an aisle behind it
  L.push({ p: 'k_counter', len: cl, x: ccx, z: ccz, rot: 0 });
  L.push({ p: 'k_samovar', h: 0.5, x: ccx - cl / 2 + 0.3, z: ccz - 0.02, rot: 0, y: ch, solid: false }, { p: 'k_stamp', len: 0.38, x: ccx + 0.1, z: ccz, rot: 0.2, y: ch, solid: false }, { p: 'k_dallah', h: 0.42, x: ccx + cl / 2 - 0.25, z: ccz, rot: 0, y: ch, solid: false });
  L.push({ p: 'k_files', len: S ? 0.6 : 0.75, x: ccx + cl / 2 + (S ? 0.35 : 0.45), z: bz + 0.3, rot: 0 }); // the files sideboard beside the counter (not hung: windows sit on the back wall)
  room.staffSpot = (() => { const q = W(ccx + 0.1, bz + 0.38); return { x: q.x, z: q.z, rot: F.rho, sit: false, y: 0 }; })(); // behind the counter, facing the room
  const n = seatsN(room), sl = S ? 1.45 : 1.75, sd = sl * 0.416 / 0.998, sz0 = S ? 0.45 : 0.3; // the cushioned bench on the left wall: 2 clients
  L.push({ p: 'k_sofa', len: sl, x: lx + sd / 2 + 0.06, z: sz0, rot: H }); for (const o of [-0.36, 0.36]) seat(lx + sd / 2 + 0.1, sz0 + o * sl / 1.75, H);
  const tl = S ? 0.6 : 0.7, th = tl * 0.8496 / 0.998;
  L.push({ p: 'k_table', len: tl, x: lx + sd + 0.55, z: sz0, rot: 0 }, { p: 'k_tray', len: 0.38, x: lx + sd + 0.55, z: sz0, rot: 0, y: th, solid: false });
  if (n > 2) { const tx = S ? 1.0 : rx - 1.35, tz = S ? 0.9 : 0.9; L.push({ p: 'k_table', len: tl, x: tx, z: tz, rot: 0 }, { p: 'k_backgammon', len: 0.42, x: tx, z: tz, rot: 0.3, y: th, solid: false });
    L.push({ p: 'k_chair', h: 0.9, x: tx - 0.62, z: tz, rot: H }); seat(tx - 0.62, tz, H);
    if (n > 3) { L.push({ p: 'k_chair', h: 0.9, x: tx + 0.62, z: tz, rot: -H }); seat(tx + 0.62, tz, -H); } }
  if (!S) L.push({ p: 'k_fern', h: 0.85, x: rx - 0.45, z: bz + 0.45, rot: 0 }, { p: 'k_fern', h: 0.75, x: lx + 0.42, z: fz - 0.42, rot: 0 });
  else L.push({ p: 'k_fern', h: 0.65, x: rx - 0.35, z: fz - 0.4, rot: 0 });
  kitRoom(g, cx, cz, room, 'ahwa_kit', L, AHWA_DIMS, F);
}
// Jjimjilbang, Seoul (from the jjimjilbang painting): the domed clay kiln (hanjeungmak) glowing in the back corner, straw mats on the heated yellow floor where
// the clients lie with a sheep-towel pillow, the attendant on a pouf by the low table with the baked eggs and sikhye, the towel shelf, the lockers, bamboo
function jjimKit(g, cx, cz, room) {
  const F = kitFrame(room, true), w = F.w, D = F.D, S = w < 5 || D < 5, H = Math.PI / 2, L = [], bz = -D / 2, fz = D / 2, lx = -w / 2, rx = w / 2;
  const W = (x, z) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z }; };
  const kh = S ? 1.2 : 1.5, kw = kh / 0.8535; L.push({ p: 'k_kiln', h: kh, x: lx + kw / 2 + 0.08, z: bz + kw / 2 + 0.08, rot: 0.35, glow: false });
  const tl = S ? 0.7 : 0.85, tx = rx - tl / 2 - (S ? 0.25 : 0.45), tz = bz + 0.55, th = tl * 0.377 / 0.998; // low table, back right
  L.push({ p: 'k_lowtable', len: tl, x: tx, z: tz, rot: 0 }, { p: 'k_eggs', len: 0.3, x: tx - 0.15, z: tz, rot: 0, y: th, solid: false }, { p: 'k_sikhye', len: 0.28, x: tx + 0.2, z: tz, rot: 0, y: th, solid: false });
  L.push({ p: 'k_pouf', h: 0.38, x: tx - tl / 2 - 0.35, z: tz + 0.45, rot: 0, solid: false });
  room.staffSpot = (() => { const q = W(tx - tl / 2 - 0.35, tz + 0.45); return { x: q.x, z: q.z, rot: F.rho, sit: true, y: 0.04 }; })(); // the attendant on the pouf, watching the mats
  const n = seatsN(room), ml = S ? 1.45 : 1.6, sp = Math.min(1.15, (w - 0.6) / n), mz = S ? 0.55 : 0.45;
  for (let i = 0; i < n; i++) { const x = (i - (n - 1) / 2) * sp; L.push({ p: 'k_mat', len: ml, x, z: mz, rot: 0, solid: false }, { p: 'k_sheep', len: 0.5, x, z: mz - ml / 2 + 0.22, rot: 0, solid: false, y: 0.04 });
    const q = W(x, mz + 0.05); room.spots.push({ x: q.x, z: q.z, rot: F.rho, sit: true, lie: true, y: 0.05, busy: null, noDuvet: true }); } // on the warm floor: no duvet
  if (!S) { L.push({ p: 'k_lockers', h: 1.4, wall: 'right', u: 'F' }, { p: 'k_towels', len: 0.9, wall: 'back', u: (lx + kw + 0.2 + tx - tl / 2) / 2 }, { p: 'k_bamboo', h: 1.2, x: lx + 0.4, z: fz - 0.45, rot: 0 }); }
  else L.push({ p: 'k_bamboo', h: 0.95, x: lx + 0.35, z: fz - 0.4, rot: 0 });
  kitRoom(g, cx, cz, room, 'jjim_kit', L, JJIM_DIMS, F);
}
const RODA_DIMS = {"k_cavaco":[0.4849,0.9995,0.5356],"k_mic":[0.5425,0.9995,0.3989],"k_rug":[0.9995,0.0317,0.9946],"k_speaker":[0.5952,0.9995,0.5103],"k_stool":[0.9829,0.8979,0.9995],"k_bench":[0.999,0.6147,0.439],"k_surdo":[0.8931,0.9995,0.8979]};
// Copacabana's wavy black-and-white pavement, for the roda floor
const CALCADAO = () => GC.calcadao || (GC.calcadao = canvasTex(256, 256, (c, W, H) => { c.fillStyle = '#EFE6D2'; c.fillRect(0, 0, W, H); c.fillStyle = '#6E6F73';
  for (let k = -1; k < 3; k++) { c.beginPath(); for (let x = 0; x <= W; x += 4) c.lineTo(x, k * 128 + 40 + Math.sin(x / W * Math.PI * 2) * 34); for (let x = W; x >= 0; x -= 4) c.lineTo(x, k * 128 + 92 + Math.sin(x / W * Math.PI * 2) * 34); c.closePath(); c.fill(); }
  c.globalAlpha = 0.18; c.strokeStyle = '#3B3B3E'; for (let i = 0; i < 260; i++) { const x = (i * 53) % W, y = (i * 97) % H; c.strokeRect(x, y, 9 + (i % 4), 8 + (i % 3)); } c.globalAlpha = 1; }, [1.4, 1.4]));
// Roda de samba, São Paulo (from the roda painting): an orange rug in the middle with stools all round it — the clients sit in the circle, the musician
// sits with them next to the big surdo drum and leads the singing; a speaker and a mic at the back, cavaquinho and guitar on their stands, a cushioned bench
function rodaKit(g, cx, cz, room) {
  const F = kitFrame(room, true), w = F.w, D = F.D, S = w < 5 || D < 5, H = Math.PI / 2, L = [], bz = -D / 2, fz = D / 2, lx = -w / 2, rx = w / 2;
  const W = (x, z) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z }; };
  const rr = S ? 0.75 : Math.min(1.1, w / 2 - 1.1), rcz = S ? -0.05 : 0.1, R = rr + 0.42; // rug, then the ring of stools
  L.push({ p: 'k_rug', len: rr * 2, x: 0, z: rcz, rot: 0, solid: false });
  const n = S ? seatsN(room) : 6, m = n + 1, a0 = Math.PI * 0.62, a1 = Math.PI * 2.38; // regular size: a bigger circle (6 clients, still one musician) // stools round the rug, leaving the door side (front) open
  for (let i = 0; i < m; i++) { const a = a0 + (a1 - a0) * i / (m - 1), x = Math.cos(a) * R, z = rcz - Math.sin(a) * R, face = Math.atan2(-x, rcz - z); // facing the middle
    L.push({ p: 'k_stool', h: 0.44, x, z, rot: 0, solid: false, tint: ['#F2C14E', '#F4D88A', '#EFC56B'][i % 3] });
    const q = W(x, z); if (i === 0) { room.staffSpot = { x: q.x, z: q.z, rot: face + F.rho, sit: true, y: 0.05 }; L.push({ p: 'k_surdo', h: 0.6, x: x - Math.cos(a) * 0.05 - 0.55, z: z + 0.15, rot: 0 }); }
    else room.spots.push({ x: q.x, z: q.z, rot: face + F.rho, sit: true, y: 0.05, busy: null }); }
  L.push({ p: 'k_speaker', h: S ? 0.8 : 0.95, x: lx + 0.45, z: bz + 0.35, rot: 0.25 }, { p: 'k_mic', h: 1.35, x: lx + (S ? 1.05 : 1.2), z: bz + 0.55, rot: 0.6, solid: false });
  L.push({ p: 'k_cavaco', h: 0.62, x: rx - (S ? 0.9 : 1.3), z: bz + 0.3, rot: -0.2, solid: false }, { p: 'k_cavaco', h: 0.95, x: rx - (S ? 0.4 : 0.75), z: bz + 0.35, rot: -0.3, solid: false, tint: '#E3A15A' }); // cavaquinho and guitar
  if (!S) L.push({ p: 'k_bench', len: 1.5, wall: 'right', u: 0.9 }, { p: '@plant', s: 1.2, x: lx + 0.45, z: fz - 0.45 });
  else L.push({ p: '@plant', s: 0.9, x: lx + 0.35, z: fz - 0.4 });
  kitRoom(g, cx, cz, room, 'roda_kit', L, RODA_DIMS, F);
}
const KITK = new Proxy({}, { get: (o, kit) => { const st = Object.values(ROOM_STYLE).find((x) => x && x.model === kit); return st && st.kscale || 1; } }); // per-kit piece scale (diorama look)
function kitRoom(g, cx, cz, room, kit, items, dims, F = kitFrame(room, false)) {
  const w = F.w, D = F.D, lx = -w / 2, rx = w / 2, bz = -D / 2, fz = D / 2, H = Math.PI / 2, out = [], rep = [], door = F.door;
  const W = (x, z) => { const p = F.T(x, z); return { x: cx + p.x, z: cz + p.z }; }; // layout frame -> station coords
  const lane = door ? (Math.abs(door.z) / (D / 2) >= Math.abs(door.x) / (w / 2) ? { x0: door.x - 0.55, x1: door.x + 0.55, z0: door.z > 0 ? door.z - 1.4 : door.z, z1: door.z > 0 ? door.z : door.z + 1.4 } : { z0: door.z - 0.55, z1: door.z + 0.55, x0: door.x > 0 ? door.x - 1.4 : door.x, x1: door.x > 0 ? door.x : door.x + 1.4 }) : null; // 1.1 m wide, 1.4 m in from the door
  for (const it of items) { if (!it) continue; const dm = it.p === '@plant' ? [0.45, 1, 0.45] : it.dm || dims[it.p] || DECO_DIMS[it.p]; if (!dm) { rep.push('no piece ' + it.p); continue; }
    const KS = it.p[0] === '@' ? 1 : KITK[kit] || 1, k = it.p === '@plant' ? (it.s || 1.5) : (it.len ? it.len / Math.max(dm[0], dm[2]) : it.h / dm[1]) * KS, pw = dm[0] * k, pd = dm[2] * k, gp = it.gap ?? 0.04; let x, z, rot;
    const along = (u, half, lo, hi) => u === 'L' || u === 'B' ? lo + half + gp : u === 'R' || u === 'F' ? hi - half - gp : (lo + hi) / 2 + (u || 0);
    if (it.wall === 'back') { rot = 0; z = bz + pd / 2 + gp; x = along(it.u, pw / 2, lx, rx); }
    else if (it.wall === 'front') { rot = Math.PI; z = fz - pd / 2 - gp; x = along(it.u, pw / 2, lx, rx); }
    else if (it.wall === 'left') { rot = H; x = lx + pd / 2 + gp; z = along(it.u, pw / 2, bz, fz); }
    else if (it.wall === 'right') { rot = -H; x = rx - pd / 2 - gp; z = along(it.u, pw / 2, bz, fz); }
    else { x = it.x; z = it.z; rot = it.rot || 0; }
    if (it.wall && it.r) rot += it.r; // extra turn for pieces whose model faces another way
    const q = Math.abs(Math.sin(rot)) > 0.7, ex = (q ? pd : pw) / 2, ez = (q ? pw : pd) / 2;
    const box = { p: it.p, x0: x - ex, x1: x + ex, z0: z - ez, z1: z + ez, solid: it.solid !== false && !it.hang };
    if (door && box.solid && door.x > box.x0 - 0.75 && door.x < box.x1 + 0.75 && door.z > box.z0 - 0.75 && door.z < box.z1 + 0.75) { rep.push('skip ' + it.p + ' (door)'); continue; } // keep the doorway clear
    if (box.x0 < lx - 0.01 || box.x1 > rx + 0.01 || box.z0 < bz - 0.01 || box.z1 > fz + 0.01) rep.push('outside ' + it.p);
    if (lane && box.solid && box.x0 < lane.x1 && box.x1 > lane.x0 && box.z0 < lane.z1 && box.z1 > lane.z0) rep.push('in the doorway lane ' + it.p); // people walk straight in from the door
    for (const o of out) if (o.solid && box.solid && box.x0 < o.x1 - 0.02 && box.x1 > o.x0 + 0.02 && box.z0 < o.z1 - 0.02 && box.z1 > o.z0 + 0.02) rep.push('overlap ' + it.p + ' / ' + o.p);
    out.push(box); const P = W(x, z), R = rot + F.rho;
    let p; if (it.hang) { const wn = it.wall === 'back' ? [0, -1] : it.wall === 'left' ? [-1, 0] : it.wall === 'right' ? [1, 0] : [0, 1], o = pd / 2 + gp; // anchor on the wall line (the cutaway judges it there), piece set into the room
      const A = W(x + wn[0] * o, z + wn[1] * o), n2 = F.T(wn[0], wn[1]); p = grp(A.x, A.z, R, g); p.userData.hang = [Math.round(n2.x), Math.round(n2.z)]; p.userData.swap = true; p = grp(0, o, 0, p); } else p = grp(P.x, P.z, R, g);
    box.at = { x: P.x, z: P.z, rot: R, pw, pd };
    p.userData.kit = it.p; // treatment scenes find pieces by name (the board, the shelf…)
    if (it.p === '@plant') { plant(0, 0, it.s || 1.5, '#F3EDE2', p, it.v ? { v: it.v, h: it.vh || 0.72 * (it.s || 1.5), tint: it.tint } : null); box.g = p; continue; } // the game's own potted plants
    if (DECO[it.p]) { DECO[it.p](p, it); box.g = p; continue; } // decor built in code (menu board, shelf, frames, rug)
    if (box.solid) put(rbox(pw * 0.9, Math.min(it.h || 1, 1), pd * 0.9, '#E8E2D6', 0.04), 0, Math.min(it.h || 1, 1) / 2 + 0.1, 0, p); // walk-grid footprint until the model swaps in
    glbSwap(p, (it.kit || kit) + '/' + it.p, { ...(it.len ? { len: it.len * KS } : { h: it.h * KS }), y: (it.y || 0) + 0.11, ...(it.glow ? { glow: '#FFD866', gi: 0.9 } : {}), ...(it.fabric ? { fabric: it.fabric } : {}), ...(it.tint ? { tint: it.tint } : {}), ...(it.lift ? { lift: it.lift } : {}), ...(it.recol ? { recol: it.recol } : {}), ...(it.rugH ? { rugH: it.rugH } : {}), ...(it.onModel ? { onModel: it.onModel } : {}) }); box.g = p;
    if (!it.hang && !/rug|jute|k_mat/.test(it.p) && !(it.y > 0.3) && Object.values(ROOM_STYLE).some((st) => st && st.model === kit && st.ao)) aoBlob(g, P.x, P.z, pw * 1.3 + 0.15, pd * 1.3 + 0.15, R); }
  try { (window.__layout = window.__layout || []).push({ room: room.sz + (room.st != null ? '#' + room.st : ''), kit, rho: F.rho, rep }); if (rep.length) console.warn('[layout]', kit, room.sz, rep.join('; ')); } catch (e) {}
  return Object.fromEntries(out.map((b) => [b.p, b.at]));
}
const PHARMA_FLOOR = () => GC.phFloor || (GC.phFloor = canvasTex(180, 104, (c, W, Hh) => { const r = 30, h3 = Math.sqrt(3) * r; c.fillStyle = '#DAD5CB'; c.fillRect(0, 0, W, Hh);
  for (let i = -1; i <= 4; i++) for (let j = -1; j <= 2; j++) { const x = i * 1.5 * r, y = j * h3 + (i & 1 ? h3 / 2 : 0); c.beginPath(); for (let a = 0; a < 6; a++) { const t = a * Math.PI / 3; c.lineTo(x + Math.cos(t) * (r - 2), y + Math.sin(t) * (r - 2)); } c.closePath();
    c.fillStyle = ((i + 4) * 7 + (j + 4) * 3) % 5 === 0 ? '#BFE3CF' : '#F6F3EC'; c.fill(); } }, [8, 8]));
const PHARMA_DIMS = {"k_snakestand": [0.5034, 0.998, 0.5051], "k_shelfcross": [0.459, 0.998, 0.1973], "k_planter": [0.998, 0.4746, 0.3184], "k_lavender": [0.5098, 0.998, 0.5527], "k_succulent": [0.6777, 0.998, 0.7832], "k_cooler": [0.4902, 0.998, 0.3535], "k_armchair": [0.9824, 0.998, 0.9355], "k_shelfvit": [0.627, 0.998, 0.1973], "k_counter": [1.0026, 0.627, 0.5451], "k_shelftea": [0.6504, 0.998, 0.1973], "k_sidetable": [0.8809, 0.9746, 0.9316], "k_tearack": [0.5879, 0.998, 0.3926]};
// Pharmacy from the Tripo pieces (layout = the pharmacy painting): shelves along the back wall, counter in front with the pharmacist behind it,
// a seating corner (2 armchairs + side table) on the right, tea rack near the front, lavender and herbs on the left
function pharmacyKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = D < 5, two = (room.nst || 1) > 1, first = !room.st, last = room.st == null || room.st === (room.nst || 1) - 1, H = Math.PI / 2;
  const bz = cz - D / 2, rx = cx + w / 2, cxo = two ? 0 : -0.45, zc = bz + 1.95; // counter: 1.1 m aisle for the pharmacist between it and the shelves
  const L = [];
  if (!two) { const sh = S ? 1.95 : 2.15; // M: vitamins, cross, water cooler, teas side by side (cooler between the shelves)
    if (S) L.push({ p: 'k_shelfvit', h: sh, wall: 'back', u: -1.2 }, { p: 'k_shelfcross', h: sh, wall: 'back', u: -0.1 }, { p: 'k_shelftea', h: sh, wall: 'back', u: 1.0 });
    else L.push({ p: 'k_shelfvit', h: sh, wall: 'back', u: -1.775 }, { p: 'k_shelfcross', h: sh, wall: 'back', u: -0.565 }, { p: 'k_cooler', h: 1.25, wall: 'back', u: 0.275 }, { p: 'k_shelftea', h: sh, wall: 'back', u: 1.32 }); }
  else if (first) L.push({ p: 'k_shelfvit', h: 2.15, wall: 'back', u: -0.6 }, { p: 'k_shelfcross', h: 2.15, wall: 'back', u: 'R' }); // L: cross shelf ends the first half, the cooler starts the second
  else L.push({ p: 'k_cooler', h: 1.25, wall: 'back', u: 'L' }, { p: 'k_shelftea', h: 2.15, wall: 'back', u: -0.6 });
  L.push({ p: 'k_counter', h: 1.05, x: cxo, z: zc - cz, rot: 0 });
  if (first) { if (!S) L.push({ p: 'k_lavender', h: 0.8, wall: 'left', u: 'B' }); L.push({ p: 'k_lavender', h: 0.8, wall: 'left', u: 'F' }); if (!S) L.push({ p: 'k_planter', h: 0.55, wall: 'left', u: 0.9 }); if (two) L.push({ p: 'k_tearack', h: 1.4, x: 1.0, z: D / 2 - 0.7, rot: 0 }); }
  if (last) {
    if (!S) { const tz = two ? 1.0 : 0.6; // two armchairs face to face with the side table between them
      L.push({ p: 'k_armchair', h: 0.95, x: w / 2 - 2.38, z: tz, rot: H }, { p: 'k_sidetable', h: 0.6, x: w / 2 - 1.45, z: tz, rot: 0 }, { p: 'k_armchair', h: 0.95, x: w / 2 - 0.52, z: tz, rot: -H });
      L.push({ p: 'k_snakestand', h: 1.2, wall: 'right', u: two ? 0 : 'F' }); if (!two) L.push({ p: 'k_tearack', h: 1.4, x: 1.3, z: D / 2 - 0.7, rot: 0 }); }
  }
  kitRoom(g, cx, cz, room, ROOM_STYLE.pharmacy.model, L, PHARMA_DIMS);
  room.staffSpot = { x: cx + cxo, z: zc - 0.85, rot: 0, sit: false, y: 0 };
  room.spots.push({ x: cx + cxo, z: zc + 0.85, rot: Math.PI, sit: false, y: 0, busy: null });
}
const THERAPY_DIMS = {"k_armchair": [0.9552, 0.998, 0.9237], "k_coffee": [0.998, 0.6465, 0.998], "k_pouf": [0.9941, 0.6465, 0.998], "k_lamp": [0.2793, 0.998, 0.4512], "k_sideboard": [0.998, 0.8457, 0.4551], "k_sidetable": [0.9238, 0.998, 0.9238], "k_rug": [0.998, 0.0391, 0.998], "k_chaise": [0.998, 0.4746, 0.4395]}, GLOWUP_DIMS = {"k_rack": [0.752, 0.998, 0.4941], "k_vanity": [0.8457, 0.998, 0.4277], "k_chair": [0.673, 0.998, 0.7684], "k_ring": [0.4434, 0.998, 0.3379], "k_rug": [0.998, 0.0801, 0.998], "k_pouf": [0.998, 0.5293, 0.998], "k_shelf": [0.6582, 0.998, 0.373]}, CAFE_DIMS = {"k_counter": [0.998, 0.6973, 0.6426], "k_cabinet": [0.998, 0.7129, 0.3184], "k_mat": [0.998, 0.0762, 0.709], "k_chair": [0.5684, 0.998, 0.7441], "k_bench": [0.998, 0.623, 0.377], "k_case": [0.959, 0.998, 0.5918], "k_table": [0.7637, 0.998, 0.7637]};
const TERRAZZO = () => GC.terrazzo || (GC.terrazzo = canvasTex(256, 256, (c, W, Hh) => { c.fillStyle = '#F2C2C4'; c.fillRect(0, 0, W, Hh); let q = 7; const rnd = () => (q = (q * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 420; i++) { c.fillStyle = ['#E89AA0', '#FFFFFF', '#D9A441', '#F7DADB', '#C97A86'][i % 5]; c.beginPath(); c.arc(rnd() * W, rnd() * Hh, 1.5 + rnd() * 3.5, 0, 7); c.fill(); } }, [6, 6]));
const CHECKER = () => GC.checker || (GC.checker = canvasTex(128, 128, (c) => { for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { c.fillStyle = (i + j) % 2 ? '#A9B98E' : '#F1EAD8'; c.fillRect(i * 64, j * 64, 64, 64); } }, [6, 6]));
// Therapy (room painting): chaise along the window wall, sideboard with the fountain on the back wall, round rug + coffee table, pouf,
// therapist's armchair across from the chaise with the side table and floor lamp behind it, olive tree in the front corner
function therapyKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = D < 5, first = !room.st, H = Math.PI / 2, lx = cx - w / 2, rx = cx + w / 2;
  const L = [{ p: 'k_rug', len: S ? 2.0 : 2.5, x: 0.1, z: 0.2, solid: false }, { p: 'k_coffee', h: 0.45, x: 0.1, z: 0.2 },
    { p: 'k_chaise', h: 0.85, wall: 'left', u: 0 }, { p: 'k_armchair', h: 1.0, x: w / 2 - (S ? 0.75 : 1.05), z: 0.2, rot: -H }];
  if (first) L.push({ p: 'k_sideboard', h: 1.2, wall: 'back', u: S ? -0.3 : -0.5 });
  if (!S) L.push({ p: 'k_sidetable', h: 0.6, wall: 'right', u: -0.75 }, { p: 'k_lamp', h: 1.85, wall: 'back', u: 'R' }, { p: 'k_pouf', h: 0.42, x: -0.9, z: 1.25 } /* off the line from the door */);
  if (first && !S) L.push({ p: '@plant', s: 1.7, wall: 'left', u: 'F' });
  const at = kitRoom(g, cx, cz, room, ROOM_STYLE.therapy.model, L, THERAPY_DIMS), ch = at.k_chaise, ac = at.k_armchair;
  room.spots.push({ x: ch ? ch.x : lx + 0.45, z: cz, rot: H, sit: true, y: 0.05, busy: null });
  room.staffSpot = { x: ac ? ac.x : rx - 1, z: cz + 0.2, rot: -H, sit: true, y: 0.02 };
}
// Glow-up studio (room painting): vanity with the bulb mirror on the back wall, salon chair facing it, ring light beside the chair,
// clothes rack on the window wall, gold candle shelf on the wall, round fluffy rug with a pouf, a big plant in the back corner
function glowupKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = D < 5, first = !room.st, last = room.st == null || room.st === (room.nst || 1) - 1, H = Math.PI / 2;
  const vx = S ? 0.25 : 0.35, chz = 0.9 + 0.04 + 0.95 - D / 2; // chair 0.95 m in front of the vanity
  const L = [{ p: 'k_vanity', h: 1.9, wall: 'back', u: vx }, { p: 'k_chair', h: 1.15, x: vx, z: chz, rot: Math.PI }, { p: 'k_ring', h: 1.6, x: vx + 1.0, z: chz + 0.15, rot: -1.41 } /* ring turned to the chair (checked on the model) */];
  if (last && !S) L.push({ p: 'k_shelf', h: 1.0, wall: 'back', u: 'R', hang: true, y: 0.75 });
  if (first) { L.push({ p: 'k_rack', h: 1.7, wall: 'left', u: S ? -0.3 : -0.55 }); if (!S) L.push({ p: '@plant', s: 1.6, wall: 'back', u: 'L' }); }
  const dr = kitFrame(room, false).door, px = (dr && dr.x > 0 ? -1 : 1) * (w / 2 - 1.15); // rug and pouf on the side away from the door, out of the way in
  if (!S) L.push({ p: 'k_rug', len: 1.7, x: px, z: D / 2 - 1.25, solid: false }, { p: 'k_pouf', h: 0.45, x: px, z: D / 2 - 1.25 });
  kitRoom(g, cx, cz, room, ROOM_STYLE.glowup.model, L, GLOWUP_DIMS);
  room.spots.push({ x: cx + vx, z: cz + chz, rot: Math.PI, sit: true, y: 0.12, busy: null });
  room.staffSpot = { x: cx + vx - 1.0, z: cz + chz + 0.15, rot: H, sit: false, y: 0 }; // beside the chair, clear of its armrest
}
// Matcha café (room painting): counter + pastry case along the left wall with the jar cabinet behind (barista between), banquette under
// the window on the back wall, two bistro tables with bentwood chairs, an olive tree in the corner
function cafeKit(g, cx, cz, room) {
  const H = Math.PI / 2, two = (room.nst || 1) > 1, first = !room.st;
  if (!two) { // S and M: laid out facing the door. You walk in facing the counter and pastry case (jar cabinet behind, barista between); tables near the door
    const F = kitFrame(room, true), w = F.w, D = F.D, S = D < 5 || w < 5, sx = F.door && F.door.x > 0 ? -1 : 1; // sx: the side away from the door
    const K = ROOM_STYLE.cafe.chunky ? 1.15 : 1; // diorama look: chunkier pieces
    const ccz = -D / 2 + 0.5 + 0.9 + 0.53 + (K - 1) * 0.5, ccx = S ? -0.35 : -0.6, L = [];
    L.push({ p: 'k_cabinet', h: 1.0 * K, wall: 'back', u: ccx - 0.2 }, { p: 'k_counter', h: 1.15 * K, x: ccx, z: ccz, rot: 0 }, { p: 'k_case', h: 1.25 * K, x: ccx + (0.83 + 0.64) * K, z: ccz - 0.07 * K, rot: 0 });
    if (K > 1) { L.push({ p: '@menu', h: 0.72, wall: 'back', u: ccx - 0.2, hang: true, y: 1.78, gap: 0.1, solid: false });
      if (!S) L.push({ p: '@shelf', h: 0.3, wall: sx > 0 ? 'right' : 'left', u: 0.9, hang: true, y: 1.62, gap: 0.12, solid: false },
        { p: '@frame', h: 0.55, wall: sx > 0 ? 'left' : 'right', u: -0.3, hang: true, y: 1.55, gap: 0.1, solid: false, c: '#C98A3A', c2: '#9DB38C' },
        { p: '@frame', h: 0.42, wall: sx > 0 ? 'left' : 'right', u: 0.35, hang: true, y: 1.68, gap: 0.1, solid: false, c: '#6E8A5A', c2: '#E8A87C' },
        { p: '@rug', len: 2.1, x: -sx * (1.6 + (K - 1) * 1.0), z: 1.4, solid: false }); }
    if (S) L.push({ p: 'k_table', h: 0.78 * K, x: sx * (w / 2 - 0.4), z: D / 2 - 1.05 }, { p: 'k_chair', h: 0.95 * K, x: sx * (w / 2 - 1.07), z: D / 2 - 1.05, rot: sx * H }); // small café: one table against the side wall, one chair
    else { const bx = sx * (w / 2 - 0.33); // banquette on the side wall away from the door, its table and one chair facing it; a second table on the door side
      L.push({ p: 'k_bench', h: 0.95 * K, wall: sx > 0 ? 'right' : 'left', u: 0.9 }, { p: 'k_table', h: 0.78 * K, x: bx - sx * 0.95 * K, z: 0.9 }, { p: 'k_chair', h: 0.95 * K, x: bx - sx * 1.65 * K, z: 0.9, rot: sx * H },
        { p: 'k_table', h: 0.78 * K, x: -sx * (1.6 + (K - 1) * 1.0), z: 1.4 }, { p: 'k_chair', h: 0.95 * K, x: -sx * (1.6 + (K - 1) * 1.0) - 0.75, z: 1.4, rot: H }, { p: 'k_chair', h: 0.95 * K, x: -sx * (1.6 + (K - 1) * 1.0) + 0.75, z: 1.4, rot: -H },
        { p: '@plant', s: 1.8 * K, v: K > 1 ? 'pharmacy_kit/k_succulent' : null, vh: 1.0, wall: sx > 0 ? 'right' : 'left', u: 'B' }); } // diorama café: the monstera (crisp leaves), same height as before
    kitRoom(g, cx, cz, room, ROOM_STYLE.cafe.model, L, CAFE_DIMS, F);
    const P = (x, z) => { const q = F.T(x, z); return { x: cx + q.x, z: cz + q.z }; }, b = P(ccx, ccz - 1.0 * K);
    room.staffSpot = { x: b.x, z: b.z, rot: F.rho, sit: false, y: 0 };
    if (K > 1 && !S) { // diorama café: drinks are taken seated at the tables (the 3 chairs), facing the table, instead of standing at the counter
      const tb = -sx * (1.6 + (K - 1) * 1.0), bx2 = sx * (w / 2 - 0.33) - sx * 0.95 * K, seat = (x, z, tx, tz) => { const a = P(x, z), b2 = P(tx, tz); room.spots.push({ x: a.x, z: a.z, rot: Math.atan2(b2.x - a.x, b2.z - a.z), sit: true, y: 0.02, cafe: true, busy: null }); };
      seat(tb - 0.75, 1.4, tb, 1.4); seat(tb + 0.75, 1.4, tb, 1.4); seat(sx * (w / 2 - 0.33) - sx * 1.65 * K, 0.9, bx2, 0.9); return; }
    for (let i = 0, n = S ? 2 : 3; i < n; i++) { const c = P(ccx - (n - 1) * 0.3 + i * 0.6, ccz + 1.05 * K); room.spots.push({ x: c.x, z: c.z, rot: F.rho + Math.PI, sit: false, y: 0, cafe: true, busy: null }); }
    return;
  }
  // L (two stations, door in the middle of the front wall): the counter faces the door from the back wall of the first half; seating in the second half
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, L = [], xo = first ? 0 : -w; // the second station's barista and queue use the first station's counter
  const ccx = -0.35, ccz = -D / 2 + 0.5 + 0.9 + 0.53;
  if (first) L.push({ p: 'k_cabinet', h: 1.0, wall: 'back', u: ccx - 0.2 }, { p: 'k_counter', h: 1.15, x: ccx, z: ccz, rot: 0 }, { p: 'k_case', h: 1.25, x: ccx + 1.47, z: ccz - 0.07, rot: 0 });
  else L.push({ p: 'k_bench', h: 0.95, wall: 'right', u: 0.9 }, { p: 'k_table', h: 0.78, x: w / 2 - 1.28, z: 0.9 }, { p: 'k_chair', h: 0.95, x: w / 2 - 1.98, z: 0.9, rot: H },
    { p: 'k_table', h: 0.78, x: -0.3, z: -1.6 }, { p: 'k_chair', h: 0.95, x: -0.98, z: -1.6, rot: H }, { p: 'k_chair', h: 0.95, x: 0.38, z: -1.6, rot: -H }, { p: '@plant', s: 1.8, wall: 'right', u: 'B' });
  kitRoom(g, cx, cz, room, ROOM_STYLE.cafe.model, L, CAFE_DIMS);
  room.staffSpot = { x: cx + xo + ccx + (first ? -0.35 : 0.35), z: cz + ccz - 1.0, rot: 0, sit: false, y: 0 };
  for (let i = 0; i < 2; i++) room.spots.push({ x: cx + xo + ccx + (first ? -0.3 + i * 0.6 : (i ? 0.9 : -0.9)), z: cz + ccz + 1.05, rot: Math.PI, sit: false, y: 0, cafe: true, busy: null });
}
const NAP_DIMS = {"k_bed": [0.5835, 0.5566, 0.9946], "k_armchair": [0.9434, 0.8223, 0.998], "k_rug": [0.973, 0.1426, 0.974], "k_lamp": [0.6465, 0.998, 0.6465], "k_dresser": [0.998, 0.5879, 0.3457], "k_moon": [0.709, 0.998, 0.416]};
// Nap room from the Tripo pieces: canopy beds side by side, heads to the back wall (one client each), glowing moon on the wall above,
// cloud rug in front, a dresser on the side wall, the round armchair with the mushroom lamp in the front corner
function napKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = D < 5, first = !room.st, last = room.st == null || room.st === (room.nst || 1) - 1, H = Math.PI / 2;
  const n = 3, bw = 0.6 * 1.9, sp = Math.min(1.62, (w - 0.3) / n), bed = 1.9; // beds 1.9 m long (0.6 wide per metre of length in the model)
  const L = []; for (let i = 0; i < n; i++) L.push({ p: 'k_bed', len: bed, wall: 'back', u: (i - (n - 1) / 2) * sp, ...(LOOK_DAY ? {} : { fabric: '#B9A8E0', lift: 0.45 }) }); // daylight look: the reworked bed carries its own baked colours
  if (first) L.push({ p: 'k_moon', h: 0.9, wall: 'back', u: 0, hang: true, y: 1.15, glow: true });
  if (sp > 1.45) for (let i = 0; i < n - 1; i++) L.push({ p: 'k_lamp', h: 0.62, wall: 'back', u: (i + 0.5 - (n - 1) / 2) * sp, solid: false, glow: true }); // target image: a glowing mushroom lamp between the beds

  const two = (room.nst || 1) > 1; // large room: the beds fill each half, so no lamp in the corner and the dresser moves past the bed ends
  if (first && !S) L.push(two ? null : { p: '@plant', s: 1.0, v: 'nap_plant', vh: 1.5, wall: 'left', u: 0.42 }, { p: 'k_dresser', h: 0.85, wall: 'left', u: two ? -0.25 : -0.75 }, { p: 'k_armchair', h: 0.9, wall: 'left', u: two ? 1.2 : 1.4, r: -H, fabric: '#B9A8E0', lift: 0.45 }); // monstera between the dresser and the armchair, in view (not by a bed head) // armchair model faces +x
  if (!S) L.push({ p: 'k_rug', len: 2.5, x: -0.35, z: 0.35, solid: false, onModel: (m) => furShells(m, '#EEEAF2', 12, 0.08) }); // reference: big white cloud rug in the middle of the room, long soft pile // the owner's cloud rug, with a real fluffy pile // the owner's cloud rug, with its own fluffy texture
  for (const it of L) if (it && !it.glow && it.p !== 'k_moon') it.tint = it.p === 'k_rug' ? null : '#ECE8F2'; for (const it of L) if (it && it.p === 'k_dresser') it.lift = 0.4; // dimmed room: everything a little darker and warmer, only the lamps and the moon stay bright
  const at = kitRoom(g, cx, cz, room, ROOM_STYLE.nap.model, L, NAP_DIMS), bz = cz - D / 2;
  if (!GFX.low && !MOBILE && sp > 1.45) for (let i = 0; i < n - 1; i++) { const pl = new THREE.PointLight('#FFB46A', 1.1, 1.5, 2); pl.position.set(cx + (i + 0.5 - (n - 1) / 2) * sp, 0.55, bz + 0.45); g.add(pl); } // a small pool of lamp light at each bedside, nothing on the sleepers' faces // the warm, dimmed glow of the lamps and the moon
  for (let i = 0; i < n; i++) room.spots.push({ x: cx + (i - (n - 1) / 2) * sp, z: bz + 0.04 + bed / 2 + 0.1, rot: 0, sit: true, lie: true, y: 0.3, busy: null, duvetC: ['#FBF8F4', '#F6F2EC', '#FAF7F2'][i % 3] }); // each bed its own duvet shade, as in the painting
  room.staffSpot = { x: cx + (S ? 0.9 : 1.2), z: cz + D / 2 - 1.0, rot: Math.PI, sit: false, y: 0 };
}
const TRAIN_DIMS = {"k_board":[0.9538,0.998,0.4711],"k_chair":[0.6579,0.998,0.6337],"k_table":[0.998,0.6348,0.6582],"k_shelf":[0.6621,0.998,0.3457],"k_sink":[0.6348,0.998,0.5723]};
// Training room from the Tripo pieces (layout = the training room painting): whiteboard on wheels at the back with the trainer beside it,
// yellow tablet chairs facing it (S 2 · M 4 · L 6), sink + soap and the binder shelf on the left wall, the first-aid / CPR table on the right, a ficus in the corner
const BUDGET_DIMS = {"k_easel":[0.7207,0.998,0.1699],"k_armchair":[0.9512,0.998,0.9629],"k_bookcase":[0.4785,0.998,0.2559],"k_chair":[0.8418,0.998,0.7598],"k_table":[0.998,0.3887,0.998],"k_desk":[0.998,0.6543,0.5215]};
// Budget Booth from the Tripo pieces (layout = the budget booth painting): green desk (piggy bank, laptop, coin jar) with the coach's coral chair behind it and the client's in front,
// round rug under them, arched green bookcase on the back wall, chart easel on the right wall, a reading corner (green armchair + round table) by the front, a plant in the back corner
function budgetKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = D < 5, two = (room.nst || 1) > 1, first = !room.st, last = room.st == null || room.st === (room.nst || 1) - 1, bz = -D / 2, H = Math.PI / 2;
  const dx = two ? 0.2 : S ? 0.15 : 0, dz = bz + (S ? 1.45 : 1.75), sc = S ? 0.9 : 1; // desk centre; the coach sits between it and the back wall
  const coach = { x: dx, z: dz - 0.9 * sc }, client = { x: dx, z: dz + 0.95 * sc };
  const L = [{ p: '@rug', len: S ? 1.9 : 2.3, x: dx, z: dz + 0.25, solid: false }, { p: 'k_desk', len: 1.85 * sc, x: dx, z: dz, rot: 0 },
    { p: 'k_chair', h: 1.05, x: coach.x, z: coach.z, rot: 0, solid: false }, { p: 'k_chair', h: 1.05, x: client.x, z: client.z, rot: Math.PI, solid: false }];
  if (first) L.push({ p: 'k_bookcase', h: S ? 1.75 : 1.95, wall: 'back', u: 'L' });
  if (last) { L.push({ p: '@plant', s: 1.4, x: w / 2 - 0.55, z: D / 2 - 0.75 }); /* front corner: the chart easel on the back wall stays in view */ L.push({ p: 'k_easel', h: S ? 1.3 : 1.55, wall: 'back', u: S ? 0.75 : two ? 0.7 : 1.35 }); }
  if (!S && first) L.push({ p: 'k_armchair', h: 1.0, x: -w / 2 + 0.62, z: 0.55, rot: H * 0.75 }, { p: 'k_table', len: 0.7, x: -w / 2 + 0.75, z: 1.55, rot: 0 });
  kitRoom(g, cx, cz, room, ROOM_STYLE.budget.model, L, BUDGET_DIMS);
  room.staffSpot = { x: cx + coach.x, z: cz + coach.z, rot: 0, sit: true, y: 0.02 };
  room.spots.push({ x: cx + client.x, z: cz + client.z, rot: Math.PI, sit: true, y: 0.02, busy: null });
}
function trainingKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, sz = room.sz || 'm', bz = -D / 2;
  const n = { s: 2, m: 4, l: 6 }[sz], cols = n === 6 ? 3 : 2, dx = cols === 3 ? 1.35 : sz === 's' ? 1.3 : 1.5, z0 = bz + (sz === 's' ? 1.6 : 1.8), dz = 1.25;
  const L = [{ p: 'k_board', h: 1.75, x: -0.25, z: bz + 0.45 }];
  const seats = []; for (let i = 0; i < n; i++) { const c = i % cols, r = Math.floor(i / cols), x = -0.2 + (c - (cols - 1) / 2) * dx, z = z0 + r * dz; seats.push({ x, z }); L.push({ p: 'k_chair', h: 0.9, x, z, rot: Math.PI, solid: false }); }
  L.push({ p: 'k_sink', h: 1.0, wall: 'left', u: 'B' }, { p: 'k_shelf', h: 1.45, wall: 'left', u: 'F' });
  L.push({ p: 'k_table', len: 1.2, wall: 'right', u: Math.min(D / 2 - 1.2, z0 + 0.35) }, { p: '@plant', s: 1.5, wall: 'right', u: 'B' });
  kitRoom(g, cx, cz, room, ROOM_STYLE.training.model, L, TRAIN_DIMS);
  for (const s of seats) room.spots.push({ x: cx + s.x, z: cz + s.z, rot: Math.PI, sit: true, y: 0.02, busy: null });
  const tx = sz === 's' ? 0.85 : 1.05, tz = bz + 0.95; // beside the board, facing the class; rot2 = turned to the board
  room.staffSpot = { x: cx + tx, z: cz + tz, rot: -0.35, rot2: Math.atan2(-0.25 - tx, bz + 0.45 - tz), sit: false, y: 0 };
}
const SOCIAL_DIMS = {"k_sofa":[0.998,0.459,0.5488],"k_pouf":[0.998,0.9941,0.9941],"k_cart":[0.998,0.998,0.5723],"k_vase":[0.6777,0.998,0.6777]};
const WEDDING_DIMS = {"k_desk":[0.998,0.709,0.5176],"k_arch":[0.9238,0.998,0.6934],"k_armchair":[0.9512,0.998,0.7871],"k_dress":[0.5566,0.998,0.4785]};
// a group hung on a station wall (nx, nz = wall normal pointing out of the room), anchored on the wall line so the cutaway judges it there
function wallHung(g, cx, cz, room, nx, nz, u, y) { const w = room.w || 6, D = SIZES[room.sz || 'm'].D, ax = nx ? cx + nx * w / 2 : cx + u, az = nz ? cz + nz * D / 2 : cz + u;
  const a = grp(ax, az, nx ? -nx * Math.PI / 2 : nz > 0 ? Math.PI : 0, g); a.userData.hang = [nx, nz]; a.userData.swap = true; const p = grp(0, 0.06, 0, a); p.position.y = y; return p; }
// Social Club (Tripo pieces, layout = the social club painting): curved lilac sofa on the back wall under string lights, marble table with poufs around it, gold bar cart on the right, a plant in the corner
function socialKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = D < 5, first = !room.st, last = room.st == null || room.st === (room.nst || 1) - 1, bz = -D / 2, n = seatsN(room);
  const tz = S ? 0.05 : -0.2, R0 = S ? 0.82 : 0.85;
  const L = [{ p: 'k_sofa', len: Math.min(1.9, w - 2.0), wall: 'back', u: S ? 0 : 0.2 }];
  const ang = n === 2 ? [Math.PI, 0] : n === 3 ? [Math.PI, 0, Math.PI / 2] : [Math.PI * 0.75, Math.PI * 0.25, -Math.PI * 0.75, -Math.PI * 0.25];
  const seats = ang.slice(0, n).map((a) => ({ x: Math.cos(a) * R0, z: tz + Math.sin(a) * R0 }));
  for (const s of seats) L.push({ p: 'k_pouf', h: 0.44, x: s.x, z: s.z, solid: false });
  L.push({ p: 'k_vase', h: 0.2, x: 0.05, z: tz - 0.05, y: 0.72, solid: false });
  if (last && !S) L.push({ p: 'k_cart', len: 0.95, wall: 'right', u: 0.6 });
  if (first) L.push({ p: '@plant', s: 1.6, wall: 'left', u: 'B' });
  const at = kitRoom(g, cx, cz, room, ROOM_STYLE.social.model, L, SOCIAL_DIMS);
  const tb = grp(cx, cz + tz, 0, g); put(cyl(0.45, 0.45, 0.05, '#F4F1EC', { r: 0.25 }), 0, 0.76, 0, tb); put(cyl(0.05, 0.05, 0.62, '#C9A24A', { m: 0.6, r: 0.3 }), 0, 0.43, 0, tb); put(cyl(0.26, 0.3, 0.05, '#C9A24A', { m: 0.6, r: 0.3 }), 0, 0.14, 0, tb); // marble table on a brass foot
  for (const [gx, gz, c] of [[-0.24, 0.1, '#F2A3A8'], [0.26, 0.14, '#8E1F38']]) { const gl = grp(gx, gz, 0, tb); put(cyl(0.006, 0.006, 0.1, '#FFFFFF', { op: 0.7 }), 0, 0.84, 0, gl); put(cyl(0.045, 0.02, 0.07, c, { op: 0.75 }), 0, 0.92, 0, gl); }
  for (const s of seats) { const dx = s.x, dz = s.z - tz, d = Math.hypot(dx, dz) || 1; room.spots.push({ x: cx + s.x + dx / d * 0.12, z: cz + s.z + dz / d * 0.12, rot: Math.atan2(-s.x, tz - s.z), sit: true, y: 0, busy: null }); } // a sitter's hips land in front of the point: set it back so they sit in the middle of the pouf, not on its edge
  { const lg = wallHung(g, cx, cz, room, 0, -1, 0, 2.15), nb = Math.max(6, Math.round(w * 2)); // string lights along the back wall
    for (let i = 0; i < nb; i++) { const t = i / (nb - 1), x = (t - 0.5) * (w - 0.6), y = -0.18 * Math.sin(t * Math.PI * 2) ** 2; put(sph(0.045, '#FFE7A8', { e: '#FFD27A', ei: 1.4 }), x, y - 0.05, 0.08, lg); put(cyl(0.004, 0.004, (w - 0.6) / (nb - 1), '#5A4A3A'), x, y + 0.02, 0.06, lg).rotation.z = Math.PI / 2; } }
  // the guide hosts the circle from the sofa (it used to be decor nobody sat on); fallback: standing beside the poufs
  const sf = at && at.k_sofa; room.staffSpot = sf ? { x: sf.x + Math.sin(sf.rot) * 0.2, z: sf.z + Math.cos(sf.rot) * 0.2, rot: sf.rot, sit: true, y: 0 } : { x: cx + (S ? -1.15 : -1.55), z: cz + tz + (S ? 0.9 : 1.2), rot: Math.atan2(1.4, -1.0), sit: false, y: 0 };
}
// Wedding Calm Bureau (Mumbai; layout = the wedding bureau painting): carved desk with the planner behind it, two red armchairs on a red rug, the lehenga on its mannequin, marigolds, the flower arch in the corner
function weddingKit(g, cx, cz, room) {
  const w = room.w || 6, D = SIZES[room.sz || 'm'].D, S = D < 5, first = !room.st, last = room.st == null || room.st === (room.nst || 1) - 1, bz = -D / 2;
  const dz = bz + (S ? 1.05 : 1.75), dx = S ? 0 : w < 5 ? -0.25 : -0.35, az = dz + (S ? 1.05 : 1.4);
  const L = [{ p: 'k_desk', len: 1.25, x: dx, z: dz }, { p: 'k_armchair', h: 0.85, x: dx - 0.48, z: az, rot: Math.PI, solid: false }, { p: 'k_armchair', h: 0.85, x: dx + 0.48, z: az, rot: Math.PI }];
  if (first) L.push({ p: 'k_dress', h: 1.7, wall: 'left', u: 'B', gap: 0.15 });
  if (last && !S) L.push({ p: 'k_arch', h: 2.0, wall: 'back', u: 'R' });
  kitRoom(g, cx, cz, room, ROOM_STYLE.wedding.model, L, WEDDING_DIMS);
  { const rw = w * 0.7, rd = D * 0.62, rz = (dz - 0.55 + az + 0.6) / 2; put(rbox(rw, 0.02, rd, '#B3863A', 0.01), cx + dx, 0.12, cz + rz, g); put(rbox(rw - 0.14, 0.024, rd - 0.14, '#9E1B24', 0.01), cx + dx, 0.125, cz + rz, g); } // red rug with a gold border
  if (first) { const mx = cx - w / 2 + (S ? 0.38 : 1.05), mz = cz + (S ? 0.1 : bz + 0.32), pg = grp(mx, mz, 0, g); put(cyl(0.2, 0.15, 0.32, '#B5623A'), 0, 0.27, 0, pg); put(cyl(0.21, 0.21, 0.04, '#8E4A2A'), 0, 0.43, 0, pg); // marigolds in a terracotta pot
    for (let i = 0; i < 9; i++) { const a = i * 2.4, r = i ? 0.13 : 0; put(sph(0.075, i % 3 ? '#F28C1E' : '#F6B41A'), Math.cos(a) * r, 0.55 + (i ? 0 : 0.06), Math.sin(a) * r, pg); } for (let i = 0; i < 5; i++) put(sph(0.05, '#3E7A3A'), Math.cos(i * 1.3) * 0.2, 0.47, Math.sin(i * 1.3) * 0.2, pg); }
  { const fr = wallHung(g, cx, cz, room, 0, -1, dx, 1.55); put(rbox(0.62, 0.78, 0.04, '#5A2E1E', 0.02), 0, 0, 0.02, fr); // framed sign above the desk
    const sg = new THREE.Mesh(new THREE.PlaneGeometry(0.52, 0.68), new THREE.MeshStandardMaterial({ map: canvasTex(128, 168, (c, W, H) => { c.fillStyle = '#F6EAD3'; c.fillRect(0, 0, W, H); c.strokeStyle = '#B3863A'; c.lineWidth = 4; c.strokeRect(8, 8, W - 16, H - 16); c.font = '64px serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('💍', W / 2, H / 2 - 8); c.fillStyle = '#9E1B24'; c.fillRect(W / 2 - 26, H - 40, 52, 4); }), roughness: 0.9 })); sg.position.set(0, 0, 0.045); fr.add(sg); }
  room.staffSpot = { x: cx + dx, z: cz + dz - 0.75, rot: 0, sit: false, y: 0 };
  room.spots.push({ x: cx + dx - 0.48, z: cz + az + 0.05, rot: Math.PI, sit: true, y: 0.02, busy: null });
}
const furniture = {
  budget(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.budget.kit && PROPS_ON) { budgetKit(g, cx, cz, room); return; }
    if (ROOM_STYLE.budget.model && PROPS_ON) { // 2026 room: the whole interior is one model made from the room painting; walls, arched door and window stay in code
      const L = Math.min(room.w || 6, SIZES[room.sz || 'm'].D) - 0.24, k = L / 1.64, m = grp(cx, cz, 0, g);
      put(rbox(L * 0.9, 0.04, L * 0.9, '#167A42', 0.01), 0, 0.12, 0, m); glbSwap(m, ROOM_STYLE.budget.model, { len: L, y: 0.115, crease: 0.6 });
      const ob = grp(cx, cz, 0, g); ob.userData.swap = true; // invisible footprints so people walk around the desk, plant, bookcase and easel
      for (const [x0, x1, z0, z1] of [[-0.37, 0.37, -0.39, -0.06], [-0.75, -0.45, -0.75, -0.45], [0.64, 0.8, -0.45, 0], [0.45, 0.72, -0.8, -0.5]]) { const b = put(rbox((x1 - x0) * k, 0.8, (z1 - z0) * k, '#000000', 0.01), (x0 + x1) / 2 * k, 0.5, (z0 + z1) / 2 * k, ob); b.visible = false; }
      room.staffSpot = { x: cx, z: cz - 0.575 * k, rot: 0, sit: true, y: 0.02 };
      room.spots.push({ x: cx + 0.05 * k, z: cz + 0.25 * k, rot: Math.PI, sit: true, y: 0.02, busy: null });
      return;
    }
    const d = grp(cx, cz - 0.6 * K, 0, g);
    put(rbox(2.2, 0.12, 1.0, '#C98F5A', 0.05), 0, 0.86, 0, d); put(rbox(0.45, 0.78, 0.85, '#B07B49', 0.05), -0.8, 0.46, 0, d); put(rbox(0.45, 0.78, 0.85, '#B07B49', 0.05), 0.8, 0.46, 0, d);
    put(rbox(0.9, 0.58, 0.06, '#2F3640', 0.03), 0, 1.32, -0.25, d); put(rbox(0.8, 0.48, 0.02, '#9FE8D8', 0.01, { e: '#7FD8C6', ei: 0.5 }), 0, 1.32, -0.21, d);
    put(cyl(0.07, 0.06, 0.14, '#FFFFFF'), 0.8, 1.0, 0.2, d); glbSwap(d, 'budgetdesk', { len: 2.2, h: 1.15, y: 0.12 });
    chair(g, cx, cz - 1.6 * K, 0, '#2BB5A6'); chair(g, cx, cz + 0.45 * K, Math.PI, '#E9785F');
    const sh = grp(cx + 2.2 * K, cz - 2.7 * K, 0, g); put(rbox(1.3, 1.9, 0.5, '#B98552', 0.04), 0, 1.05, 0, sh);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) put(rbox(0.15, 0.4, 0.32, ['#2BB5A6', '#E9785F', '#5AB8F0', '#FFC83D', '#7F68C9'][(i + r) % 5], 0.02), -0.44 + i * 0.22, 0.5 + r * 0.6, 0.12, sh);
    room.staffSpot = { x: cx, z: cz - 1.6 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz + 0.45 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  career(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.career.kit && PROPS_ON) { careerKit(g, cx, cz, room); return; }
    if (ROOM_STYLE.career.model && PROPS_ON) { // 2026 room: interior model (desk, coach chair, mustard client chairs, striped rug, armchair, bookcase, window seat, lamp) + a code corkboard
      const L = Math.min(room.w || 6, SIZES[room.sz || 'm'].D) - 0.24, k = L / 1.66, m = grp(cx, cz, 0, g);
      put(rbox(L * 0.9, 0.04, L * 0.9, '#6E3324', 0.01), 0, 0.12, 0, m); glbSwap(m, ROOM_STYLE.career.model, { len: L, y: 0.115, crease: 0.6 });
      const ob = grp(cx, cz, 0, g); ob.userData.swap = true;
      for (const [x0, x1, z0, z1] of [[-0.45, 0.3, -0.11, 0.21], [0.5, 0.78, -0.25, 0.42], [0.3, 0.62, -0.8, -0.66], [-0.83, -0.7, -0.6, 0]]) { const b = put(rbox((x1 - x0) * k, 0.8, (z1 - z0) * k, '#000000', 0.01), (x0 + x1) / 2 * k, 0.5, (z0 + z1) / 2 * k, ob); b.visible = false; }
      if (!room.st) careerDecor(g, cx, cz, room, k);
      room.staffSpot = { x: cx - 0.064 * k, z: cz - 0.32 * k, rot: 0, sit: true, y: 0.02 };
      room.spots.push({ x: cx - 0.26 * k, z: cz + 0.375 * k, rot: Math.PI, sit: true, y: 0.02, busy: null });
      return;
    }
    const d = grp(cx, cz - 0.6 * K, 0, g);
    put(rbox(2.2, 0.12, 1.0, '#F4EFE6', 0.05), 0, 0.86, 0, d); put(rbox(2.0, 0.76, 0.1, '#C2577A', 0.03), 0, 0.46, 0.4, d);
    put(rbox(0.9, 0.58, 0.06, '#2F3640', 0.03), 0, 1.32, -0.25, d); put(rbox(0.8, 0.48, 0.02, '#FFD6E0', 0.01, { e: '#FFC2D1', ei: 0.4 }), 0, 1.32, -0.21, d);
    chair(g, cx, cz - 1.6 * K, 0, '#3B4A6B'); chair(g, cx, cz + 0.45 * K, Math.PI, '#FFD25E');
    const wb = grp(cx - 2.2 * K, cz - 2.95 * K, 0, g); put(rbox(1.6, 1.0, 0.06, '#FFFFFF', 0.03), 0, 1.6, 0, wb); put(rbox(1.0, 0.06, 0.02, '#16963C', 0.01), -0.1, 1.7, 0.04, wb); put(rbox(0.6, 0.06, 0.02, '#D93A3F', 0.01), 0.1, 1.5, 0.04, wb);
    const ladder = grp(cx + 2.3 * K, cz - 2.6 * K, 0, g); for (const sx of [-0.25, 0.25]) put(rbox(0.06, 2.0, 0.06, '#B98552', 0.02), sx, 1.1, 0, ladder); for (let i = 0; i < 5; i++) put(rbox(0.5, 0.05, 0.05, '#B98552', 0.02), 0, 0.4 + i * 0.38, 0, ladder);
    room.staffSpot = { x: cx, z: cz - 1.6 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz + 0.45 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  nap(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.nap.kit && PROPS_ON) { napKit(g, cx, cz, room); return; }
    if (ROOM_STYLE.nap.model && PROPS_ON) { // 2026 room: interior model from the painting (rug, lamps, chair, plant, shelf) + the clean Meshy pod beds; turned a quarter so the door opens onto free floor
      const L = Math.min(room.w || 6, SIZES[room.sz || 'm'].D) - 0.24, k = L / 1.66, R = Math.PI / 2, m = grp(cx, cz, R, g);
      put(rbox(L * 0.9, 0.04, L * 0.9, '#E2AEC0', 0.01), 0, 0.12, 0, m); glbSwap(m, ROOM_STYLE.nap.model, { len: L, y: 0.115, crease: 0.6 });
      const P = (x, z) => ({ x: cx + (x * Math.cos(R) + z * Math.sin(R)) * k, z: cz + (-x * Math.sin(R) + z * Math.cos(R)) * k });
      for (const bx of [-0.58, -0.005, 0.525]) { const c = P(bx, -0.52), p = grp(c.x, c.z, R, g);
        put(rbox(0.36 * k, 0.3, 0.56 * k, '#9C7BD6', 0.12, { r: 0.85 }), 0, 0.26, 0, p); glbSwap(p, 'nap_pod2', { len: 0.57 * k, y: 0.11 });
        const s2 = P(bx, -0.52 + 0.5 / k); room.spots.push({ x: s2.x, z: s2.z, rot: R, sit: true, lie: true, y: 0.12, busy: null }); }
      const ob = grp(cx, cz, R, g); ob.userData.swap = true; // invisible footprints: armchair, plant, shelf
      for (const [x0, x1, z0, z1] of [[0.33, 0.77, 0.08, 0.55], [-0.82, -0.45, 0.42, 0.8], [-0.27, 0.4, 0.62, 0.8]]) { const b = put(rbox((x1 - x0) * k, 0.8, (z1 - z0) * k, '#000000', 0.01), (x0 + x1) / 2 * k, 0.5, (z0 + z1) / 2 * k, ob); b.visible = false; }
      if (!room.st) { const D = SIZES[room.sz || 'm'].D, mo = grp(cx - 0.9 * K, cz - D / 2 + 0.14, 0, g); mo.userData.hang = [0, -1]; mo.userData.swap = true; put(rbox(0.8, 0.8, 0.06, '#FFE7A8', 0.2, { e: '#FFD27A', ei: 1 }), 0, 1.75, 0, mo); glbSwap(mo, 'nap_moon', { len: 0.8, y: 1.3, tint: '#FFE9A0', glow: '#FFD866', gi: 1.1 }); }
      const st = P(0.2, 0.45); room.staffSpot = { x: st.x, z: st.z, rot: R + Math.PI, sit: false, y: 0 };
      return;
    }
    const V = '#CDB6F6', W0 = room.w || 6, n = room.sz === 's' ? 2 : 3, sp = Math.min(1.9, (W0 - 0.4) / n), xs = Array.from({ length: n }, (_, i) => (i - (n - 1) / 2) * sp);
    xs.forEach((ox, i) => { // pods side by side with a gap and a small bedside table between: you get in from the side, like a bed
      const p = grp(cx + ox, cz - 1.25 * K, 0, g);
      put(rbox(1.05, 0.36, 2.0, '#B79DE6', 0.17, { r: 0.85 }), 0, 0.28, 0, p); put(rbox(1.15, 1.2, 0.3, '#B79DE6', 0.15, { r: 0.85 }), 0, 0.7, -0.95, p);
      glbSwap(p, 'nap_pod', { len: 1.95, rot: 0, y: 0.1, tint: V });
      room.spots.push({ x: cx + ox, z: cz - 0.75 * K, rot: 0, sit: true, lie: true, y: 0.12, busy: null });
      if (i < n - 1) { const bx = cx + ox + sp / 2, t = grp(bx, cz - 2.0 * K, 0, g);
        put(cyl(0.2, 0.2, 0.45, '#FFD866', { r: 0.8 }), 0, 0.33, 0, t); put(sph(0.12, '#FFF1C2', { e: '#FFD27A', ei: 1.2 }), 0, 0.68, 0, t); put(cyl(0.02, 0.02, 0.12, '#C9A54A'), 0, 0.58, 0, t);
        const sc = grp(bx, cz - D0() / 2 + 0.12, 0, g); sc.userData.hang = [0, -1]; sc.userData.swap = true; put(rbox(0.16, 0.22, 0.08, '#C9A54A', 0.03, { m: 0.4, r: 0.4 }), 0, 1.5, 0, sc); put(sph(0.09, '#FFF1C2', { e: '#FFD27A', ei: 1.6 }), 0, 1.66, 0.06, sc); }
    });
    function D0() { return SIZES[room.sz || 'm'].D; }
    const hang = (o, nx, nz) => { o.userData.hang = [nx, nz]; o.userData.swap = true; return o; };
    const W = room.w || 6, D = SIZES[room.sz || 'm'].D, bz = cz - D / 2 + 0.2, first = !room.st, last = room.st == null || room.st === (room.nst || 1) - 1;
    if (first && room.sz !== 's') { const m = grp(cx - 1.1 * K, bz - 0.06, 0, g); m.userData.hang = [0, -1]; m.userData.swap = true; put(rbox(0.8, 0.8, 0.06, '#FFE7A8', 0.2, { e: '#FFD27A', ei: 1 }), 0, 1.75, 0, m); glbSwap(m, 'nap_moon', { len: 0.85, y: 1.35, tint: '#FFE9A0', glow: '#FFD866', gi: 1.1 }); }
    const frame = (x, z, ry, w, h, art) => { const f = hang(grp(x, z, ry, g), Math.round(-Math.sin(ry)), Math.round(-Math.cos(ry))); put(rbox(w, h, 0.05, '#FBF4E8', 0.02, { r: 0.8 }), 0, 1.75, 0, f); put(rbox(w - 0.12, h - 0.12, 0.02, art[0], 0.01, { r: 0.9 }), 0, 1.75, 0.03, f);
      put(sph(Math.min(w, h) * 0.18, art[1], { r: 0.9 }), -w * 0.12, 1.72, 0.045, f).scale.z = 0.2; put(sph(Math.min(w, h) * 0.13, art[2], { r: 0.9 }), w * 0.15, 1.8, 0.045, f).scale.z = 0.2; };
    if (first) frame(cx - W / 2 + 0.11, cz - 0.4 * K, Math.PI / 2, 0.7, 0.9, ['#F6E7C8', '#E9A7B8', '#8FC1A0']);

    if (room.sz !== 's' && first) { const lo = grp(cx - 0.9 * K, cz + 2.35 * K, 0, g), oak = '#E8CFA6'; // low curved pale-oak shelf with books and candles (reference)
      put(rbox(1.4, 0.07, 0.42, oak, 0.03, { r: 0.8 }), 0, 0.5, 0, lo); put(rbox(1.4, 0.07, 0.42, oak, 0.03, { r: 0.8 }), 0, 0.14, 0, lo);
      for (const s of [-1, 1]) { const e = new THREE.Mesh(GC.shEnd || (GC.shEnd = new THREE.CylinderGeometry(0.21, 0.21, 0.07, 18, 1, false, 0, Math.PI)), mat(oak, { r: 0.8 })); e.rotation.z = Math.PI / 2; e.rotation.y = s > 0 ? 0 : Math.PI; e.scale.set(1, 1, 1); e.position.set(s * 0.7, 0.32, 0); lo.add(e); put(rbox(0.07, 0.43, 0.42, oak, 0.03, { r: 0.8 }), s * 0.7, 0.32, 0, lo); }
      for (const [x, c] of [[-0.45, '#B79DE6'], [-0.33, '#F2C6D4'], [-0.21, '#9E80DE']]) put(rbox(0.09, 0.26, 0.3, c, 0.02), x, 0.31, 0, lo);
      for (const [x, h] of [[0.3, 0.16], [0.45, 0.11]]) { put(cyl(0.05, 0.05, h, '#FFF6E2'), x, 0.54 + h / 2, 0.05, lo); put(sph(0.03, '#FFE38A', { e: '#FFC94A', ei: 2 }), x, 0.6 + h, 0.05, lo); }
      put(sph(0.08, '#C3AEEE'), 0.1, 0.62, -0.05, lo); }
    if (room.sz !== 's' && first) { const bs = grp(cx - W / 2 + 0.45, cz + 0.35 * K, 0, g); put(cyl(0.25, 0.25, 0.5, '#FFD866'), 0, 0.35, 0, bs); glbSwap(bs, 'nap_bedside', { h: 0.95, rot: Math.PI, y: 0.1, tint: '#FFE27A' }); }
    { const pl = grp(cx + W / 2 - 0.55, cz + 2.25 * K, 0, g); put(cyl(0.25, 0.2, 0.45, '#FFFFFF'), 0, 0.33, 0, pl); put(sph(0.4, '#5DAE5E'), 0, 0.9, 0, pl); glbSwap(pl, 'nap_plant', { h: 1.3, y: 0.1 }); }
    // cloud rug: overlapping soft discs
    for (const [ox, oz, r] of [[0, 0, 0.75], [-0.6, 0.15, 0.55], [0.62, 0.1, 0.58], [-0.25, -0.35, 0.5], [0.3, 0.38, 0.5]]) { const c = new THREE.Mesh(GC['cl' + r] || (GC['cl' + r] = new THREE.CylinderGeometry(r * K, r * K, 0.05, 28)), mat('#EADFFC', { r: 1 })); c.position.set(cx + ox * K, 0.14, cz + 1.35 * K + oz * K); c.receiveShadow = true; g.add(c); }
    // violet boucle lounge chair + butter-yellow pouf (the pop colour)
    { const ch = grp(cx + 1.15 * K, cz + 1.75 * K, Math.atan2(-1.15, -1.5), g); const bou = '#6E4BBE';
      put(rbox(0.9, 0.38, 0.8, bou, 0.18, { r: 1 }), 0, 0.3, 0, ch); put(rbox(0.95, 0.62, 0.26, bou, 0.13, { r: 1 }), 0, 0.68, -0.3, ch);
      for (const s of [-1, 1]) put(rbox(0.22, 0.5, 0.78, bou, 0.11, { r: 1 }), s * 0.42, 0.45, 0, ch); put(rbox(0.6, 0.12, 0.55, '#8A68D4', 0.06, { r: 1 }), 0, 0.53, 0.05, ch); }
    const pouf = sph(0.32, '#FFD866', { r: 0.95 }); pouf.scale.set(1, 0.6, 1); put(pouf, cx - 0.9 * K, 0.31, cz + 1.9 * K, g);
    room.staffSpot = { x: cx + 0.2 * K, z: cz + 1.4 * K, rot: Math.PI / 4, sit: false, y: 0 };
  },

  detox(g, cx, cz, room, K = 1) { if (ROOM_STYLE.detox && ROOM_STYLE.detox.kit && PROPS_ON) { detoxKit(g, cx, cz, room); return; } // phone locker + bookcase on the back wall, the client on a beanbag on a round rug, plants; the guide beside them
    const D = SIZES[room.sz || 'm'].D, w = room.w || 6, bz = cz - D / 2, bx = cx - 0.35 * K, bzb = cz + 0.15 * K;
    const lock = grp(cx + w / 2 - 1.1, bz + 0.42, 0, g); put(rbox(1.6, 1.6, 0.6, '#5AB8F0', 0.08), 0, 0.9, 0, lock);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 4; i++) put(rbox(0.32, 0.38, 0.03, '#E6F3FC', 0.02), -0.55 + i * 0.37, 0.4 + r * 0.48, 0.31, lock); glbSwap(lock, 'locker', { h: 1.8, y: 0.1 });
    const bc = grp(cx - w / 2 + 0.75, bz + 0.3, 0, g); put(rbox(1.0, 1.6, 0.4, '#E6D3B3', 0.06), 0, 0.9, 0, bc); glbSwap(bc, 'nap_bookcase', { h: 1.7, y: 0.1 });
    { const rug = cyl(1.0 * K, 1.0 * K, 0.03, '#E7D9F6'); rug.receiveShadow = true; put(rug, bx, 0.125, bzb, g); }
    const bean = sph(0.55, '#FFB067'); bean.scale.set(1, 0.6, 1); const bg = grp(bx, bzb, Math.PI / 4, g); put(bean, 0, 0.38, 0, bg); glbSwap(bg, 'beanbag', { h: 0.72, y: 0.1 });
    plant(cx - w / 2 + 0.5, cz + D / 2 - 0.7, 1.25, '#E9785F', g); plant(cx + w / 2 - 0.45, cz + 0.2 * K, 1.0, '#C9B6F2', g);
    room.spots.push({ x: bx, z: bzb, rot: Math.PI / 4, sit: true, y: 0.0, busy: null });
    const sx = bx + 1.05, sz = bzb - 0.75; room.staffSpot = { x: sx, z: sz, rot: Math.atan2(bx - sx, bzb - sz), sit: false, y: 0 }; // beside the beanbag, not between the camera and the client
  },
  cafe(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.cafe && ROOM_STYLE.cafe.kit && PROPS_ON) { cafeKit(g, cx, cz, room); return; }
    // counter against the back wall, sized to the room; barista between counter and wall, facing the customers
    const W = room.w || 6, D = SIZES[room.sz || 'm'].D, cw = Math.min(3.0, W - 1.4), ccx = cx - W / 2 + 0.45 + cw / 2, ccz = cz - D / 2 + 1.55;
    const c = grp(ccx, ccz, 0, g);
    put(rbox(cw, 1.0, 0.8, '#7CC4A4', 0.06), 0, 0.6, 0, c); put(rbox(cw + 0.15, 0.1, 0.95, '#E8C796', 0.04), 0, 1.15, 0, c);
    put(rbox(0.45, 0.5, 0.45, '#C0C6CC', 0.06, { m: 0.5, r: 0.3 }), -cw / 2 + 0.4, 1.45, 0, c);
    const gl = rbox(Math.min(0.8, cw * 0.3), 0.45, 0.6, '#FFFFFF', 0.05, { op: 0.35, r: 0.05 }); gl.castShadow = false; put(gl, cw / 2 - 0.5, 1.43, 0, c);
    ['#FF8FAB', '#FFD36E', '#9FD8B8', '#C9B6F2'].forEach((col, i) => put(cyl(0.08, 0.08, 0.07, col), cw / 2 - 0.65 + (i % 2) * 0.3, 1.3, -0.12 + Math.floor(i / 2) * 0.24, c)); glbSwap(c, 'cafecounter', { len: cw + 0.1, h: 1.65, y: 0.1 });
    const tabs = W >= 6 ? [[cx + 0.9 * K, cz + 0.5 * K], [cx - 0.8 * K, cz + 1.6 * K]] : [[cx + 0.6, cz + D / 2 - 1.1]];
    for (const [tx, tz] of tabs) { const tb = grp(tx, tz, 0, g); put(cyl(0.42, 0.42, 0.06, '#FFFFFF'), 0, 0.82, 0, tb); put(cyl(0.05, 0.05, 0.72, '#7A8088'), 0, 0.46, 0, tb); put(cyl(0.07, 0.06, 0.15, '#7CC4A4'), 0.12, 0.93, 0.05, tb); }
    room.staffSpot = { x: ccx - cw * 0.15, z: ccz - 0.85, rot: 0, sit: false, y: 0 };
    for (let i = 0, n = Math.max(2, Math.floor(cw / 0.9)); i < n; i++) room.spots.push({ x: ccx - cw / 2 + cw * (i + 0.5) / n, z: ccz + 0.85, rot: Math.PI, sit: false, y: 0, cafe: true, busy: null });
  },
  social(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.social.kit && PROPS_ON) { socialKit(g, cx, cz, room); return; }
    const tb = grp(cx, cz - 0.3 * K, 0, g); put(cyl(0.7, 0.7, 0.08, '#FFFFFF'), 0, 0.82, 0, tb); put(cyl(0.08, 0.1, 0.75, '#7A8088'), 0, 0.42, 0, tb);
    put(cyl(0.05, 0.04, 0.22, '#E0567F', { op: 0.85 }), -0.2, 0.97, 0.1, tb); put(cyl(0.05, 0.04, 0.22, '#FFD25E', { op: 0.85 }), 0.22, 0.97, -0.05, tb); put(sph(0.12, '#FF8FAB'), 0, 0.95, -0.25, tb);
    { const n = seatsN(room), tz = cz - 0.3 * K, R0 = 1.05 * Math.max(K, 0.8); for (let i = 0; i < n; i++) { const a = Math.PI + (i * 2 * Math.PI) / n + (n === 3 ? 0.4 : 0), x = cx + Math.cos(a) * R0, z = tz + Math.sin(a) * R0, rot = Math.atan2(cx - x, tz - z); const st = grp(x, z, rot, g); put(cyl(0.25, 0.22, 0.5, '#E0567F'), 0, 0.3, 0, st); room.spots.push({ x, z, rot, sit: true, y: 0.05, busy: null }); } }
    for (let i = 0; i < 7; i++) put(sph(0.08, ['#FFD25E', '#FF8FAB', '#7ACB4E', '#5AB8F0'][i % 4], { e: ['#FFD25E', '#FF8FAB', '#7ACB4E', '#5AB8F0'][i % 4], ei: 0.8 }), cx + (-1.8 + i * 0.6) * K, 2.2 - Math.abs(i - 3) * 0.08, cz - 2.6 * K, g);
    const sofa = grp(cx + 1.8 * K, cz + 1.6 * K, -Math.PI / 2, g); put(rbox(1.6, 0.4, 0.7, '#B57BE8', 0.14), 0, 0.3, 0, sofa); put(rbox(1.6, 0.55, 0.22, '#B57BE8', 0.1), 0, 0.62, -0.28, sofa);
    room.staffSpot = { x: cx, z: cz + 1.1 * K, rot: Math.PI, sit: false, y: 0 };
  },
  parent(g, cx, cz, room, K = 1) { if (ROOM_STYLE.parent && ROOM_STYLE.parent.kit && PROPS_ON) { parentKit(g, cx, cz, room); return; } // two zones: the grown-ups' corner (parent's sofa facing the coach's armchair) and, against the back wall, the kids' corner (rug, small table and chair, toy basket, routine board)
    const hw = (room.w || 6) / 2, hd = SIZES[room.sz || 'm'].D / 2, dr = room.door || { x: 0, z: hd }, alongZ = Math.abs(dr.z) >= Math.abs(dr.x), sg = alongZ ? Math.sign(dr.z) || 1 : Math.sign(dr.x) || 1;
    const U = alongZ ? hw : hd, Wd = alongZ ? hd : hw; // u: across the room, w: toward the door
    const P = (u, w) => alongZ ? { x: cx + u, z: cz + w * sg } : { x: cx + w * sg, z: cz + u };
    const A = (du, dw) => alongZ ? Math.atan2(du, dw * sg) : Math.atan2(dw * sg, du); // facing (du, dw)
    const at = (u, w, du, dw) => { const q = P(u, w); return grp(q.x, q.z, A(du, dw), g); };
    // kids' corner
    const mu = U * 0.3, mw = -Wd + 1.15, mL = Math.min(2.3, U * 1.15), mD = 1.5;
    { const m = at(mu, mw, 0, 1); const r = put(rbox(mL, 0.03, mD, '#9ED97A', 0.02), 0, 0.12, 0, m); r.receiveShadow = true; put(rbox(mL - 0.2, 0.031, mD - 0.2, '#B8E59A', 0.02), 0, 0.125, 0, m); }
    const tu = Math.min(U - 0.6, mu + mL / 2 - 0.4), tw = -Wd + 0.55;
    { const t = at(tu, tw, 0, 1); put(rbox(0.8, 0.06, 0.52, '#FFD25E', 0.03), 0, 0.42, 0, t); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(cyl(0.03, 0.03, 0.38, '#E08A2E'), sx * 0.33, 0.2, sz * 0.2, t); }
    { const c = at(tu, tw + 0.55, 0, -1); put(rbox(0.36, 0.05, 0.34, '#5AB8F0', 0.03), 0, 0.3, 0, c); put(rbox(0.36, 0.34, 0.05, '#5AB8F0', 0.03), 0, 0.48, -0.16, c); for (const [sx, sz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(cyl(0.022, 0.022, 0.28, '#3E8FD0'), sx * 0.14, 0.15, sz * 0.13, c); }
    const bu = mu - mL / 2 + 0.25, bw = -Wd + 0.35;
    { const b = at(bu, bw, 0, 1); put(cyl(0.26, 0.22, 0.34, '#E9C08F'), 0, 0.27, 0, b); ['#E9785F', '#5AB8F0', '#FFD25E'].forEach((c, i) => put(rbox(0.13, 0.13, 0.13, c, 0.02), -0.1 + i * 0.1, 0.48, (i - 1) * 0.06, b)); }
    const ru = -U + 0.85;
    { const b = at(ru, -Wd + 0.1, 0, 1); put(rbox(1.0, 0.72, 0.05, '#FFFFFF', 0.02), 0, 1.35, 0, b); ['#E9785F', '#7ACB4E', '#5AB8F0', '#B57BE8'].forEach((c, i) => put(rbox(0.19, 0.19, 0.02, c, 0.01), -0.33 + i * 0.22, 1.4, 0.035, b)); put(rbox(0.8, 0.05, 0.02, '#FFD25E', 0.01), 0, 1.15, 0.035, b); }
    // grown-ups' corner: the parent on a small sofa, facing the coach in an armchair, a low table with a teddy between them
    const aw = Math.min(Wd - 1.0, Wd * 0.2), su = -U + 0.55, cu = Math.min(U - 0.6, su + 1.9);
    { const so = at(su, aw, 1, 0); put(rbox(1.5, 0.42, 0.8, '#FFB067', 0.15), 0, 0.32, 0, so); put(rbox(1.5, 0.6, 0.22, '#FFB067', 0.1), 0, 0.66, -0.3, so); glbSwap(so, 'sofa', { len: 1.6, h: 0.9, y: 0.12 }); }
    { const ac = at(cu, aw, -1, 0); put(rbox(0.85, 0.45, 0.8, '#7ACB4E', 0.15), 0, 0.3, 0, ac); put(rbox(0.85, 0.55, 0.2, '#7ACB4E', 0.1), 0, 0.7, -0.32, ac); glbSwap(ac, 'armchair', { len: 0.95, y: 0.1, rot: Math.PI }); }
    { const q = P((su + cu) / 2, aw), t = grp(q.x, q.z, 0, g); put(cyl(0.32, 0.32, 0.05, '#FFFFFF'), 0, 0.34, 0, t); put(cyl(0.05, 0.05, 0.3, '#C9A06B'), 0, 0.18, 0, t); put(sph(0.09, '#B5793A'), 0.05, 0.45, 0, t); put(sph(0.065, '#B5793A'), 0.05, 0.58, 0, t); }
    const sp = P(su + 0.1, aw), cs = P(cu - 0.1, aw), pt = (u, w, du, dw) => ({ ...P(u, w), rot: A(du, dw) });
    room.spots.push({ x: sp.x, z: sp.z, rot: A(1, 0), sit: true, y: 0, busy: null,
      pts: { chair: pt(tu, tw + 0.55, 0, -1), mat: pt(mu, mw, 0, 1), matSide: pt(mu - 0.95, mw, 1, 0), board: pt(ru, -Wd + 0.8, 0, -1), basket: pt(bu + 0.15, bw + 0.65, 0, -1), table: pt(tu, tw, 0, 1), kidNear: pt(tu - 0.7, tw + 0.55, 1, 0) } });
    room.staffSpot = { x: cs.x, z: cs.z, rot: A(-1, 0), sit: true, y: 0 };
  },
  moving(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.moving && ROOM_STYLE.moving.kit && PROPS_ON) { movingKit(g, cx, cz, room); return; }
    const d = grp(cx, cz - 0.6 * K, 0, g);
    put(rbox(2.0, 0.12, 0.9, '#F4EFE6', 0.05), 0, 0.86, 0, d); put(rbox(1.9, 0.76, 0.1, '#8A6A45', 0.03), 0, 0.46, 0.36, d);
    put(rbox(1.0, 0.6, 0.05, '#FFFFFF', 0.02), 0, 1.3, -0.35, d); put(rbox(0.9, 0.5, 0.02, '#9FD8B8', 0.01), 0, 1.3, -0.32, d);
    for (let i = 0; i < 4; i++) put(rbox(0.6, 0.45, 0.5, '#C9A06B', 0.03), cx + (2.0 + (i % 2) * 0.1) * K, 0.33 + Math.floor(i / 2) * 0.46, cz + (-2.4 + (i % 2) * 0.65) * K, g);
    chair(g, cx, cz - 1.5 * K, 0, '#8A6A45'); chair(g, cx, cz + 0.4 * K, Math.PI, '#FFD25E');
    room.staffSpot = { x: cx, z: cz - 1.5 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz + 0.4 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  therapy(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.therapy && ROOM_STYLE.therapy.kit && PROPS_ON) { therapyKit(g, cx, cz, room); return; }
    const cs = grp(cx + 0.6 * K, cz - 0.6 * K, -Math.PI / 2, g);
    put(rbox(1.9, 0.4, 0.75, '#2E7D4F', 0.16), 0, 0.32, 0, cs); put(rbox(0.5, 0.45, 0.75, '#2E7D4F', 0.16), -0.75, 0.6, 0, cs); glbSwap(cs, 'daybed', { len: 1.95, h: 0.8, rot: -Math.PI / 2, y: 0.12 });
    const ac = grp(cx - 1.0 * K, cz - 1.4 * K, Math.PI / 4, g); put(rbox(0.8, 0.45, 0.75, '#F2C14E', 0.14), 0, 0.32, 0, ac); put(rbox(0.8, 0.6, 0.2, '#F2C14E', 0.1), 0, 0.7, -0.3, ac); glbSwap(ac, 'armchair', { len: 0.85, h: 1.0, y: 0.12, rot: Math.PI });
    const lp = grp(cx - 1.9 * K, cz - 2.4 * K, 0, g); put(cyl(0.03, 0.03, 1.5, '#3B4A6B'), 0, 0.85, 0, lp); put(cyl(0.18, 0.28, 0.3, '#FFF3CF', { e: '#FFE7A8', ei: 0.8 }), 0, 1.65, 0, lp);
    { const tt = grp(cx + 0.6 * K - 1.1, cz - 0.6 * K, 0, g); put(rbox(0.25, 0.15, 0.18, '#FFFFFF', 0.03), 0, 0.58, 0, tt); glbSwap(tt, 'sidetable', { h: 0.78, y: 0.1 }); }
    room.spots.push({ x: cx + 0.6 * K, z: cz - 0.6 * K, rot: -Math.PI / 2, sit: true, y: 0.05, busy: null });
    room.staffSpot = { x: cx - 1.0 * K, z: cz - 1.4 * K, rot: Math.PI / 4, sit: true, y: 0.02 };
  },
  pharmacy(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.pharmacy && ROOM_STYLE.pharmacy.kit && PROPS_ON) { pharmacyKit(g, cx, cz, room); return; }
    const c = grp(cx, cz - 0.9 * K, 0, g);
    put(rbox(2.4, 1.0, 0.7, '#2BB5A6', 0.08), 0, 0.6, 0, c); put(rbox(2.55, 0.08, 0.85, '#FFFFFF', 0.03), 0, 1.13, 0, c);
    put(rbox(0.5, 0.5, 0.05, '#FFFFFF', 0.02), 0.9, 1.5, 0.3, c); put(rbox(0.12, 0.36, 0.06, '#7ACB4E', 0.01, { e: '#7ACB4E', ei: 0.6 }), 0.9, 1.5, 0.34, c); put(rbox(0.36, 0.12, 0.06, '#7ACB4E', 0.01, { e: '#7ACB4E', ei: 0.6 }), 0.9, 1.5, 0.34, c);
    const sh = grp(cx, cz - 2.6 * K, 0, g); put(rbox(2.6, 2.0, 0.45, '#F4EFE6', 0.04), 0, 1.1, 0, sh);
    for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) put(cyl(0.08, 0.08, 0.26, ['#FF8FAB', '#FFD25E', '#5AB8F0', '#7ACB4E', '#B57BE8'][(i + r) % 5]), -1.05 + i * 0.3, 0.6 + r * 0.6, 0.15, sh);
    room.staffSpot = { x: cx, z: cz - 1.6 * K, rot: 0, sit: false, y: 0 };
    room.spots.push({ x: cx, z: cz - 0.1 * K, rot: Math.PI, sit: false, y: 0, busy: null });
  },
  glowup(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.glowup && ROOM_STYLE.glowup.kit && PROPS_ON) { glowupKit(g, cx, cz, room); return; }
    const mr = grp(cx, cz - 2.5 * K, 0, g); put(rbox(1.6, 1.3, 0.08, '#FFFFFF', 0.04), 0, 1.5, 0, mr); put(rbox(1.4, 1.1, 0.03, '#E6F1FB', 0.02, { e: '#FFFFFF', ei: 0.3 }), 0, 1.5, 0.05, mr);
    for (let i = 0; i < 6; i++) put(sph(0.06, '#FFF3CF', { e: '#FFE7A8', ei: 1.4 }), -0.7 + i * 0.28, 2.2, 0.06, mr);
    put(rbox(1.6, 0.08, 0.5, '#F4C0D1', 0.03), 0, 0.85, 0.25, mr);
    const ch = grp(cx, cz - 1.2 * K, 0, g); put(cyl(0.3, 0.35, 0.12, '#2F3A52'), 0, 0.12, 0, ch); put(cyl(0.06, 0.06, 0.35, '#C0C6CC', { m: 0.6, r: 0.3 }), 0, 0.3, 0, ch);
    put(rbox(0.65, 0.18, 0.6, '#D4537E', 0.08), 0, 0.52, 0, ch); put(rbox(0.65, 0.75, 0.15, '#D4537E', 0.07), 0, 0.88, 0.3, ch);
    const rl = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.05, 8, 24), mat('#FFFFFF', { e: '#FFFFFF', ei: 1.2 })); put(rl, cx + 1.5 * K, 1.7, cz - 1.0 * K, g); put(cyl(0.03, 0.03, 1.6, '#2F3640'), cx + 1.5 * K, 0.9, cz - 1.0 * K, g);
    room.spots.push({ x: cx, z: cz - 1.2 * K, rot: Math.PI, sit: true, y: 0.08, busy: null });
    room.staffSpot = { x: cx - 0.8 * K, z: cz - 1.5 * K, rot: Math.PI * 0.75, sit: false, y: 0 };
  },
  wedding(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.wedding.kit && PROPS_ON) { weddingKit(g, cx, cz, room); return; }
    const ar = grp(cx, cz - 2.5 * K, 0, g); for (const sx of [-0.9, 0.9]) put(cyl(0.08, 0.08, 2.0, '#F2C14E', { m: 0.5, r: 0.3 }), sx, 1.0, 0, ar); const top = new THREE.Mesh(new THREE.TorusGeometry(0.9, 0.08, 8, 24, Math.PI), mat('#F2C14E', { m: 0.5, r: 0.3 })); put(top, 0, 2.0, 0, ar);
    for (let i = 0; i < 9; i++) { const a = i / 8 * Math.PI; put(sph(0.12, ['#FF8FAB', '#FFFFFF', '#FFD25E'][i % 3]), Math.cos(a) * 0.9, 2.0 + Math.sin(a) * 0.9, 0.05, ar); }
    const d = grp(cx, cz - 0.7 * K, 0, g); put(rbox(2.0, 0.12, 0.9, '#FFFFFF', 0.05), 0, 0.86, 0, d); put(rbox(1.8, 0.76, 0.1, '#D4537E', 0.03), 0, 0.46, 0.38, d);
    for (let i = 0; i < 5; i++) put(rbox(0.3, 0.03, 0.22, ['#F2C14E', '#FF8FAB', '#FFFFFF'][i % 3], 0.01), -0.5 + i * 0.05, 0.94 + i * 0.03, -0.1, d); put(rbox(0.5, 0.35, 0.05, '#2F3640', 0.02), 0.55, 1.15, -0.2, d);
    chair(g, cx, cz - 1.6 * K, 0, '#D4537E'); chair(g, cx, cz + 0.3 * K, Math.PI, '#F2C14E');
    room.staffSpot = { x: cx, z: cz - 1.6 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz + 0.3 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  jjim(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.jjim && ROOM_STYLE.jjim.kit && PROPS_ON) { jjimKit(g, cx, cz, room); return; }
    for (const ox of bedXs(room, 1.0)) { const m = rbox(1.0, 0.08, 1.9, '#E9785F', 0.03); put(m, cx + ox, 0.16, cz - 1.0 * K, g); put(rbox(0.5, 0.12, 0.3, '#FFFFFF', 0.05), cx + ox, 0.25, cz - 1.75 * K, g); room.spots.push({ x: cx + ox, z: cz - 0.9 * K, rot: 0, sit: true, lie: true, y: 0.05, busy: null }); }
    const bk = grp(cx + 2.0 * K, cz + 1.0 * K, 0, g); put(cyl(0.35, 0.28, 0.3, '#A0794E'), 0, 0.25, 0, bk); for (let i = 0; i < 6; i++) { const e = sph(0.09, '#F4E2C4'); e.scale.y = 1.3; put(e, -0.15 + (i % 3) * 0.15, 0.45, -0.07 + Math.floor(i / 3) * 0.14, bk); }
    const st = grp(cx - 2.2 * K, cz - 2.6 * K, 0, g); put(rbox(1.2, 1.6, 0.5, '#C2703A', 0.06), 0, 0.85, 0, st); put(rbox(1.0, 0.4, 0.05, '#FFB067', 0.02, { e: '#FFB067', ei: 0.8 }), 0, 1.2, 0.26, st);
    room.staffSpot = { x: cx + 0.2 * K, z: cz + 1.3 * K, rot: Math.PI, sit: false, y: 0 };
  },
  yoga(g, cx, cz, room, K = 1) { if (ROOM_STYLE.yoga && ROOM_STYLE.yoga.kit && PROPS_ON) { yogaKit(g, cx, cz, room); return; }
    const win = grp(cx, cz - 2.75 * K, 0, g); put(rbox(3.4 * K, 1.4, 0.06, '#BFE6F6', 0.02, { e: '#9FCBE8', ei: 0.25 }), 0, 1.5, 0, win); for (let i = 0; i < 7; i++) put(rbox(0.32, 0.4 + (i * 37 % 9) / 10, 0.02, '#5E6B78', 0.01), -1.4 * K + i * 0.47 * K, 1.0 + (0.4 + (i * 37 % 9) / 10) / 2, 0.04, win);
    put(rbox(0.9, 0.06, 0.6, '#3B8D99', 0.02), cx, 0.13, cz - 1.7 * K, g); room.staffSpot = { x: cx, z: cz - 1.7 * K, rot: 0, sit: false, y: 0.03 };
    const n = seatsN(room), pos = [[-0.8, 0], [0.8, 0], [-0.8, 1.3], [0.8, 1.3], [-2.0, 0.6], [2.0, 0.6]];
    for (let i = 0; i < n; i++) { const [px, pz] = pos[i], x = cx + px * K, z = cz + (pz - 0.2) * K; put(rbox(0.65, 0.03, 1.5, ['#E85A9C', '#7ACB4E', '#F2C14E', '#B57BE8', '#5AB8F0', '#E9785F'][i], 0.01), x, 0.12, z, g); room.spots.push({ x, z, rot: Math.PI, sit: true, y: 0.02, busy: null }); }
    plant(cx - 2.3 * K, cz - 2.3 * K, 0.9, '#FFFFFF', g); plant(cx + 2.3 * K, cz - 2.3 * K, 0.9, '#FFFFFF', g);
  },
  lucha(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.lucha && ROOM_STYLE.lucha.kit && PROPS_ON) { luchaKit(g, cx, cz, room); return; }
    const rz = cz - 0.7 * K, rs = 1.5 * K; put(rbox(rs * 2, 0.3, rs * 2, '#2F3A52', 0.05), cx, 0.25, rz, g); put(rbox(rs * 2 - 0.1, 0.04, rs * 2 - 0.1, '#5AB8F0', 0.02), cx, 0.42, rz, g);
    for (const [px, pz] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) put(cyl(0.06, 0.06, 1.1, ['#D63A7A', '#F7C531', '#5AB8F0', '#7ACB4E'][(px + 1) + (pz + 1) / 2]), cx + px * rs, 0.95, rz + pz * rs, g);
    for (const h of [0.75, 1.05]) { put(rbox(rs * 2, 0.03, 0.03, '#F4EFE6', 0.01), cx, h, rz - rs, g); put(rbox(rs * 2, 0.03, 0.03, '#F4EFE6', 0.01), cx, h, rz + rs, g); put(rbox(0.03, 0.03, rs * 2, '#F4EFE6', 0.01), cx - rs, h, rz, g); put(rbox(0.03, 0.03, rs * 2, '#F4EFE6', 0.01), cx + rs, h, rz, g); }
    put(cyl(0.22, 0.22, 0.9, '#B5793A'), cx + 2.1 * K, 1.0, cz - 2.2 * K, g); put(cyl(0.02, 0.02, 0.6, '#5A6470'), cx + 2.1 * K, 1.75, cz - 2.2 * K, g);
    const n = seatsN(room), xs = [-1.3, 1.3, -0.45, 0.45, -2.1, 2.1];
    for (let i = 0; i < n; i++) { const x = cx + xs[i] * K, z = cz + 1.45 * K; put(rbox(0.5, 0.42, 0.5, '#D63A7A', 0.1), x, 0.31, z, g); room.spots.push({ x, z, rot: Math.PI, sit: true, y: 0.08, busy: null }); }
    room.staffSpot = { x: cx, z: rz + 0.3, rot: 0, sit: false, y: 0.22 };
  },
  ahwa(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.ahwa && ROOM_STYLE.ahwa.kit && PROPS_ON) { ahwaKit(g, cx, cz, room); return; }
    const ct = grp(cx, cz - 2.4 * K, 0, g); put(rbox(2.4, 0.95, 0.6, '#8A5A32', 0.06), 0, 0.58, 0, ct); put(rbox(2.5, 0.08, 0.7, '#E8D3B0', 0.03), 0, 1.08, 0, ct);
    put(cyl(0.16, 0.2, 0.3, '#C9A54A', { m: 0.6, r: 0.3 }), -0.6, 1.27, 0, ct); put(sph(0.1, '#C9A54A', { m: 0.6, r: 0.3 }), -0.6, 1.45, 0, ct); for (let i = 0; i < 4; i++) put(cyl(0.05, 0.04, 0.1, '#F4EFE6'), 0.1 + i * 0.22, 1.17, 0.05, ct);
    const tables = [[-0.9, -0.5], [0.9, -0.5], [-0.9, 1.0], [0.9, 1.0]], n = seatsN(room);
    for (let i = 0; i < n; i++) { const [tx, tz] = tables[Math.floor(i / 2) % tables.length], side = i % 2 ? 1 : -1, x = cx + (tx + side * 0.5) * K, z = cz + tz * K;
      if (i % 2 === 0) { put(cyl(0.32, 0.32, 0.05, '#E8D3B0'), cx + tx * K, 0.62, z, g); put(cyl(0.05, 0.08, 0.5, '#6B4E2E'), cx + tx * K, 0.36, z, g); put(rbox(0.36, 0.03, 0.24, '#5A3A22', 0.01), cx + tx * K, 0.66, z, g); put(cyl(0.04, 0.035, 0.08, '#F4EFE6'), cx + tx * K + 0.18, 0.69, z + 0.12, g); }
      put(cyl(0.18, 0.16, 0.42, '#B5793A'), x, 0.31, z, g); room.spots.push({ x, z, rot: side > 0 ? -Math.PI / 2 : Math.PI / 2, sit: true, y: 0.06, busy: null }); }
    room.staffSpot = { x: cx + 0.5 * K, z: cz - 1.8 * K, rot: Math.PI, sit: false, y: 0 };
  },
  roda(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.roda && ROOM_STYLE.roda.kit && PROPS_ON) { rodaKit(g, cx, cz, room); return; }
    const rug = new THREE.Mesh(new THREE.CylinderGeometry(1.5 * K + 0.4, 1.5 * K + 0.4, 0.02, 32), mat('#FFD25E', { r: 1 })); rug.position.set(cx, 0.13, cz - 0.6 * K); g.add(rug);
    for (const [a, sit] of [[Math.PI * 0.75, true], [Math.PI * 1.25, true], [Math.PI * 1.0, true], [Math.PI * 1.6, true], [Math.PI * 0.45, true], [Math.PI * 1.85, true]].slice(0, seatsN(room)).concat([[Math.PI * 0.25, false]])) { const x = cx + Math.cos(a) * 1.1 * K, z = cz - 0.6 * K + Math.sin(a) * 1.1 * K; put(cyl(0.22, 0.2, 0.45, '#2E9E5B'), x, 0.33, z, g); if (sit) room.spots.push({ x, z, rot: -a + Math.PI / 2 + Math.PI, sit: true, y: 0.08, busy: null }); }
    put(cyl(0.25, 0.25, 0.5, '#E9785F'), cx, 0.35, cz - 0.6 * K, g); put(cyl(0.26, 0.26, 0.04, '#F4EFE6'), cx, 0.62, cz - 0.6 * K, g);
    const gt = grp(cx + 2.0 * K, cz - 2.3 * K, 0.4, g); put(rbox(0.5, 0.7, 0.15, '#A0794E', 0.15), 0, 0.5, 0, gt); put(rbox(0.1, 0.8, 0.05, '#5A3A22', 0.02), 0, 1.2, 0, gt);
    room.staffSpot = { x: cx + Math.cos(Math.PI * 0.25) * 1.1 * K, z: cz - 0.6 * K + Math.sin(Math.PI * 0.25) * 1.1 * K, rot: -Math.PI * 0.75, sit: true, y: 0.08 };
  },
  garage(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.garage && ROOM_STYLE.garage.kit && PROPS_ON) { garageKit(g, cx, cz, room); return; }
    const wb = grp(cx, cz - 2.6 * K, 0, g); put(rbox(2.6, 1.6, 0.12, '#8A6A45', 0.03), 0, 1.3, 0, wb); for (let i = 0; i < 6; i++) put(rbox(0.1, 0.5, 0.06, ['#C0C6CC', '#E9785F', '#FFD25E'][i % 3], 0.02, { m: 0.4 }), -1 + i * 0.4, 1.4, 0.1, wb);
    const tb = grp(cx, cz - 1.0 * K, 0, g); put(rbox(2.2, 0.1, 0.9, '#E3B341', 0.03), 0, 0.85, 0, tb); for (const sx of [-0.95, 0.95]) put(rbox(0.1, 0.8, 0.8, '#2F3A52', 0.02), sx, 0.42, 0, tb);
    put(rbox(0.7, 0.45, 0.05, '#2F3640', 0.02), -0.5, 1.15, -0.2, tb); put(rbox(0.6, 0.35, 0.02, '#BFE6F6', 0.01, { e: '#BFE6F6', ei: 0.5 }), -0.5, 1.15, -0.17, tb); put(rbox(0.5, 0.35, 0.4, '#C9A06B', 0.03), 0.6, 1.08, 0, tb);
    chair(g, cx, cz - 1.9 * K, 0, '#2F3A52'); chair(g, cx, cz - 0.1 * K, Math.PI, '#E3B341');
    room.staffSpot = { x: cx, z: cz - 1.9 * K, rot: 0, sit: true, y: 0.02 };
    room.spots.push({ x: cx, z: cz - 0.1 * K, rot: Math.PI, sit: true, y: 0.02, busy: null });
  },
  shop(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.shop && ROOM_STYLE.shop.kit && PROPS_ON) { shopKit(g, cx, cz, room); return; }
    const goods = ['#FF8FAB', '#FFD25E', '#7ACB4E', '#5AB8F0', '#B57BE8', '#E9785F', '#F4EFE6'];
    for (const [ox, oz] of [[-1.6, -2.5], [0.4, -2.5]]) { const sh = grp(cx + ox * K, cz + oz * K, 0, g); put(rbox(1.7, 1.6, 0.45, '#F4EFE6', 0.04), 0, 0.9, 0, sh); for (let r = 0; r < 3; r++) for (let i = 0; i < 5; i++) put(rbox(0.22, 0.3, 0.25, goods[(i + r * 2 + Math.round(ox)) % goods.length], 0.03), -0.6 + i * 0.3, 0.45 + r * 0.48, 0.12, sh); }
    const fr = grp(cx + 2.2 * K, cz - 2.3 * K, 0, g); put(rbox(0.9, 1.9, 0.6, '#FFFFFF', 0.05), 0, 1.05, 0, fr); put(rbox(0.75, 1.6, 0.04, '#BFE6F6', 0.02, { e: '#BFE6F6', ei: 0.4 }), 0, 1.05, 0.31, fr); for (let i = 0; i < 4; i++) put(cyl(0.06, 0.06, 0.22, ['#7ACB4E', '#FFD25E'][i % 2]), -0.2 + (i % 2) * 0.35, 0.6 + Math.floor(i / 2) * 0.6, 0.15, fr);
    const till = grp(cx + 1.2 * K, cz + 0.6 * K, -Math.PI / 2, g); put(rbox(1.6, 0.95, 0.6, '#E9785F', 0.06), 0, 0.57, 0, till); put(rbox(0.4, 0.3, 0.3, '#2F3640', 0.03), 0.4, 1.2, 0, till);
    room.staffSpot = { x: cx + 1.8 * K, z: cz + 0.6 * K, rot: -Math.PI / 2, sit: false, y: 0 };
    for (const [ox, oz, rot] of [[-1.6, -1.6, Math.PI], [0.4, -1.6, Math.PI], [2.2, -1.5, Math.PI], [-0.6, -1.6, Math.PI]].slice(0, seatsN(room))) room.spots.push({ x: cx + ox * K, z: cz + oz * K, rot, sit: false, y: 0, busy: null });
  },
  training(g, cx, cz, room, K = 1) { if (ROOM_STYLE.training.kit && PROPS_ON) { trainingKit(g, cx, cz, room); return; } // code fallback (props off): code furniture until the modelled pieces arrive: whiteboard on wheels, yellow tablet chairs facing it, sink + shelf, first-aid table
    const W = room.w || 6, D = SIZES[room.sz || 'm'].D, sz = room.sz || 'm', bz = cz - D / 2 + 0.5;
    const wb = grp(cx - 0.25, bz, 0, g); // whiteboard on wheels, facing the seats
    for (const sx of [-0.85, 0.85]) { put(rbox(0.06, 1.9, 0.06, '#9AA3AD', 0.02, { m: 0.5, r: 0.35 }), sx, 1.02, 0, wb); put(rbox(0.08, 0.05, 0.55, '#9AA3AD', 0.02, { m: 0.5, r: 0.35 }), sx, 0.12, 0, wb); for (const wz of [-0.24, 0.24]) put(cyl(0.05, 0.05, 0.05, '#2F3640'), sx, 0.06, wz, wb); }
    put(rbox(1.7, 1.0, 0.05, '#C9CED6', 0.02, { m: 0.4, r: 0.4 }), 0, 1.45, 0, wb); put(rbox(1.6, 0.9, 0.02, '#FFFFFF', 0.01, { r: 0.25 }), 0, 1.45, 0.03, wb);
    put(rbox(1.5, 0.04, 0.1, '#C9CED6', 0.01), 0, 0.93, 0.06, wb);
    for (const [x, y, w, c] of [[-0.45, 1.7, 0.6, '#2F6FD6'], [-0.5, 1.58, 0.45, '#2F3640'], [-0.48, 1.47, 0.5, '#2F3640'], [0.35, 1.62, 0.12, '#E5484D'], [0.35, 1.62, 0.04, '#E5484D'], [0.3, 1.3, 0.5, '#2E9E5B'], [-0.45, 1.22, 0.35, '#2F3640']]) put(rbox(w, w < 0.06 ? 0.12 : 0.025, 0.005, c, 0.002), x, y, 0.045, wb);
    put(rbox(0.12, 0.12, 0.005, '#E5484D', 0.002), 0.35, 1.62, 0.045, wb); // a red cross drawn on the board
    for (const [mx, mc] of [[-0.3, '#2F6FD6'], [-0.15, '#E5484D'], [0, '#2F3640']]) put(cyl(0.012, 0.012, 0.12, mc), mx, 0.97, 0.06, wb).rotation.z = Math.PI / 2;
    room.staffSpot = { x: cx + 1.0 * (sz === 's' ? 0.8 : 1), z: bz + 0.45, rot: -0.35, sit: false, y: 0 }; // the trainer stands beside the board, facing the class
    const n = { s: 2, m: 4, l: 6 }[sz], cols = n === 6 ? 3 : 2, rows = n / cols, dx = cols === 3 ? 1.35 : sz === 's' ? 1.3 : 1.5, z0 = sz === 's' ? bz + 1.55 : bz + 1.75, dz = 1.25;
    for (let i = 0; i < n; i++) { // yellow tablet chairs, facing the whiteboard
      const c = i % cols, r = Math.floor(i / cols), x = cx - 0.2 + (c - (cols - 1) / 2) * dx, z = z0 + r * dz, ch = grp(x, z, Math.PI, g);
      put(rbox(0.5, 0.07, 0.48, '#F2C230', 0.03), 0, 0.47, 0, ch); put(rbox(0.5, 0.5, 0.06, '#F2C230', 0.03), 0, 0.78, -0.24, ch);
      for (const [lx, lz] of [[-0.21, -0.2], [0.21, -0.2], [-0.21, 0.2], [0.21, 0.2]]) put(cyl(0.018, 0.018, 0.44, '#3B4452'), lx, 0.22, lz, ch);
      put(rbox(0.26, 0.03, 0.36, '#F2C230', 0.02), -0.36, 0.72, 0.12, ch); put(cyl(0.015, 0.015, 0.26, '#3B4452'), -0.3, 0.6, -0.02, ch); // the writing tablet on the arm
      put(rbox(0.16, 0.01, 0.22, '#FFFFFF', 0.005), -0.36, 0.74, 0.12, ch);
      room.spots.push({ x, z, rot: Math.PI, sit: true, y: 0.02, busy: null });
    }
    const lw = cx - W / 2 + 0.3; // left wall: sink with soap, then a shelf of binders and a first-aid box
    const sk = grp(lw, bz + 0.85, Math.PI / 2, g); put(rbox(0.6, 0.12, 0.45, '#F4F6F8', 0.04, { r: 0.2 }), 0, 0.85, 0, sk); put(rbox(0.12, 0.8, 0.12, '#E2E6EA', 0.03), 0, 0.42, -0.08, sk);
    put(rbox(0.4, 0.05, 0.28, '#BFE3F2', 0.02, { r: 0.1 }), 0, 0.9, 0.02, sk); put(cyl(0.015, 0.015, 0.2, '#B8C0C8', { m: 0.7, r: 0.25 }), 0, 1.0, -0.17, sk);
    put(cyl(0.035, 0.04, 0.14, '#7ACB4E'), 0.22, 0.98, -0.12, sk); put(cyl(0.01, 0.01, 0.06, '#FFFFFF'), 0.22, 1.08, -0.12, sk); // soap dispenser
    put(rbox(0.5, 0.6, 0.03, '#DDE7F0', 0.01, { m: 0.3, r: 0.15 }), 0, 1.5, -0.2, sk); // mirror
    if (sz !== 's') { const sh = grp(lw, cz + 0.25, Math.PI / 2, g); put(rbox(1.1, 1.3, 0.34, '#FFFFFF', 0.03), 0, 0.68, 0, sh);
      for (let k = 0; k < 2; k++) { put(rbox(1.0, 0.03, 0.3, '#E8ECF0', 0.01), 0, 0.5 + k * 0.5, 0.02, sh); for (let b = 0; b < 6; b++) put(rbox(0.07, 0.34, 0.24, ['#2F6FD6', '#E5484D', '#F2C230', '#2E9E5B', '#7F68C9', '#2F6FD6'][(b + k) % 6], 0.01), -0.4 + b * 0.09, 0.69 + k * 0.5, 0.04, sh); }
      put(rbox(0.32, 0.22, 0.24, '#FFFFFF', 0.03), 0.3, 1.47, 0.04, sh); put(rbox(0.04, 0.14, 0.01, '#E5484D', 0.004), 0.3, 1.47, 0.165, sh); put(rbox(0.14, 0.04, 0.01, '#E5484D', 0.004), 0.3, 1.47, 0.165, sh); }
    const tz = Math.min(cz + D / 2 - 1.15, z0 + 0.4), tb = grp(cx + W / 2 - 0.45, tz, -Math.PI / 2, g); // right wall: table with the first-aid kit and the CPR mannequin
    put(rbox(1.2, 0.05, 0.6, '#E8EBEF', 0.02), 0, 0.76, 0, tb); for (const [lx, lz] of [[-0.55, -0.25], [0.55, -0.25], [-0.55, 0.25], [0.55, 0.25]]) put(cyl(0.025, 0.025, 0.74, '#9AA3AD', { m: 0.5, r: 0.35 }), lx, 0.38, lz, tb);
    put(rbox(0.36, 0.2, 0.24, '#E5484D', 0.04), -0.35, 0.89, 0, tb); put(rbox(0.04, 0.12, 0.005, '#FFFFFF', 0.002), -0.35, 0.9, 0.122, tb); put(rbox(0.12, 0.04, 0.005, '#FFFFFF', 0.002), -0.35, 0.9, 0.122, tb);
    const mq = put(rbox(0.5, 0.14, 0.3, '#E9C9A8', 0.06), 0.2, 0.86, 0, tb); put(sph(0.1, '#E9C9A8'), 0.53, 0.88, 0, tb); put(rbox(0.3, 0.02, 0.22, '#5AB8F0', 0.01), 0.15, 0.94, 0, tb); mq.userData.cpr = true;
  },
  staffroom(g, cx, cz, room, K = 1) { // every seat is a real piece: sofa (2), armchairs (1 each), beanbags (1 each); a big room's 2nd half is a games corner
    const seat = (x, z, rot, y = 0.05) => room.spots.push({ x, z, rot, sit: true, y, busy: null });
    const sofa = (x, z, rot = 0) => { const so = grp(x, z, rot, g); put(rbox(2.4, 0.42, 0.85, '#FFB067', 0.15), 0, 0.32, 0, so); put(rbox(2.4, 0.6, 0.25, '#FFB067', 0.1), 0, 0.68, -0.33, so); glbSwap(so, 'sofa', { len: 2.5, h: 1.0, y: 0.12 }); for (const ox of [-0.7, 0.7]) seat(x + ox * Math.cos(rot), z - ox * Math.sin(rot) + 0.05, rot); };
    const arm = (x, z, rot) => { const a = grp(x, z, rot, g); put(rbox(0.9, 0.45, 0.85, '#7ACB4E', 0.15), 0, 0.3, 0, a); put(rbox(0.9, 0.55, 0.2, '#7ACB4E', 0.1), 0, 0.7, -0.33, a); glbSwap(a, 'armchair', { len: 1.0, y: 0.1, rot: Math.PI }); seat(x, z, rot); }; // the model faces -z: turn it so its seat opens where the sitter faces
    const bag = (x, z, rot, c) => { const b = grp(x, z, rot, g); const bb = sph(0.48, c); bb.scale.set(1, 0.6, 1); put(bb, 0, 0.3, 0, b); glbSwap(b, 'beanbag', { len: 0.95, y: 0.1 }); seat(x, z, rot, 0); };
    const table = (x, z) => { const tb = grp(x, z, 0, g); put(cyl(0.45, 0.45, 0.06, '#FFFFFF'), 0, 0.45, 0, tb); put(cyl(0.06, 0.06, 0.4, '#7A8088'), 0, 0.23, 0, tb); put(cyl(0.07, 0.06, 0.14, '#E9785F'), 0.1, 0.55, 0, tb); glbSwap(tb, 'sidetable', { h: 0.55, y: 0.1 }); };
    const H = Math.PI / 2, half = room.nst === 2 && room.st === 1;
    if (!half && ROOM_STYLE.staffroom && ROOM_STYLE.staffroom.kit && PROPS_ON) { staffroomKit(g, cx, cz, room); return; } // the break room painting; a big room's 2nd half keeps the bunk-bed rest corner
    if (half) { // rest corner: a bunk bed against the back wall (2 beds: a nap restores energy twice as fast), a foosball table and an armchair
      { const bx = cx - 0.7 * K, bz = cz - 2.0 * K, bk = grp(bx, bz, H, g), wood = '#C98F5A';
        for (const px of [-0.95, 0.95]) for (const pz of [-0.45, 0.45]) put(rbox(0.1, 2.0, 0.1, wood, 0.03), px, 1.0, pz, bk);
        for (const y of [0.32, 1.32]) { put(rbox(2.0, 0.12, 0.95, wood, 0.03), 0, y, 0, bk); put(rbox(1.9, 0.14, 0.88, '#F4EFE6', 0.05), 0, y + 0.13, 0, bk); put(rbox(0.36, 0.1, 0.62, '#FFFFFF', 0.05), -0.72, y + 0.25, 0, bk); put(rbox(1.2, 0.06, 0.9, y > 1 ? '#7FB6E0' : '#9DB38C', 0.03), 0.3, y + 0.22, 0, bk); }
        put(rbox(0.1, 0.06, 0.95, wood, 0.02), -0.95, 1.85, 0, bk); for (let i = 0; i < 4; i++) put(rbox(0.06, 0.06, 0.5, wood, 0.02), 0.95, 0.55 + i * 0.3, 0.5, bk).rotation.x = 0; // rails and ladder rungs
        for (const y of [0.4, 1.4]) room.spots.push({ x: bx, z: bz, rot: H, sit: true, lie: true, bed: true, y, busy: null }); }
      const fb = grp(cx + 0.6 * K, cz + 0.5 * K, 0, g); put(rbox(1.5, 0.12, 0.8, '#2E8B57', 0.04), 0, 0.85, 0, fb); put(rbox(1.6, 0.25, 0.9, '#8A5A35', 0.05), 0, 0.72, 0, fb);
      for (const sx of [-0.65, 0.65]) for (const sz of [-0.35, 0.35]) put(rbox(0.08, 0.7, 0.08, '#6B4426', 0.02), sx, 0.35, sz, fb);
      for (let i = -2; i <= 2; i++) put(cyl(0.015, 0.015, 1.15, '#C9CED6'), i * 0.28, 0.95, 0, fb).rotation.x = H;
      arm(cx + 1.3 * K, cz - 2.0 * K, Math.PI * 0.1);
      return; }
    sofa(cx - 0.4 * K, cz - 1.8 * K); table(cx - 0.4 * K, cz - 0.6 * K);
    const n = seatsN(room) - 2; // armchairs facing the sofa across the coffee table
    if (n >= 1) arm(cx + 1.2 * K, cz - 0.4 * K, -H * 1.3); if (n >= 2) arm(cx - 2.0 * K, cz - 0.4 * K, H * 1.3);
    const cm = grp(cx + 1.9 * K, cz - 2.2 * K, 0, g); put(rbox(0.9, 1.0, 0.6, '#2F3A52', 0.06), 0, 0.6, 0, cm); put(rbox(0.5, 0.4, 0.5, '#C0C6CC', 0.05, { m: 0.5, r: 0.3 }), 0, 1.3, 0, cm); glbSwap(cm, 'kitchenette', { len: 1.4, y: 0.1 });
  },
  toilet(g, cx, cz, room, K = 1) {
    const n = room.sz ? { s: 2, m: 4, l: 3 }[room.sz] : K < 0.8 ? 2 : 3, W = room.w || 6, D = SIZES[room.sz || 'm'].D;
    for (let i = 0; i < n; i++) {
      const x = cx + (i - (n - 1) / 2) * 1.25, wz = cz - 0.9 * K - 0.55;
      if (!PROPS_ON) put(rbox(0.06, 1.5, 1.1, '#FFFFFF', 0.02), x + 0.6, 0.85, cz - 0.9 * K - 0.25, g); // the modelled cubicle brings its own walls
      const wc = grp(x, wz, 0, g); put(rbox(0.42, 0.42, 0.5, '#FFFFFF', 0.12, { r: 0.25 }), 0, 0.3, 0.05, wc); put(rbox(0.45, 0.45, 0.16, '#F4F7FA', 0.05), 0, 0.6, -0.2, wc);
      // the cubicle is made deeper at the front (side panels carried forward, door further out) so a seated person's knees stay inside the closed door
      const ext = [-0.6, 0.6].map((sx) => put(rbox(0.11, 1.42, 0.5, '#D8C6E4', 0.03, { r: 0.6 }), sx, 0.83, 0.5, wc));
      glbSwap(wc, 'toilet', { y: 0.1, onModel: (m) => m.traverse((o) => { if (/^(basin|bowlIn|pipe|spout|tap)/.test(o.name)) o.visible = false; if (/^post/.test(o.name)) o.userData.noObs = true; const TH = { back: [1, 1, 2], left: [1.8, 1, 1], right: [1.8, 1, 1], post: [1.5, 1, 1.5], leg: [1.6, 1, 1.6], seat: [1, 2, 1], lid: [1, 2, 1], tankLid: [1, 1.8, 1], hinge: [1.6, 1, 1.6] }[o.name.split('.')[0]]; if (TH) o.scale.multiply(new THREE.Vector3(...TH)); /* chunkier: the cubicle panels, posts, seat and lid were paper-thin */ if (o.isMesh && o.name === 'left' && o.material) for (const e of ext) e.material = o.material; }) }); // no hand basin inside the cubicle: hands are washed at the vanity
      // cubicle door on the front-left hinge: swings open when the cubicle is free, closes while someone is inside; a small red/green lock shows which
      const dv = grp(x - 0.57, wz + 0.76, 0, g); dv.rotation.y = -1.35; dv.userData.looDoor = true;
      put(rbox(1.1, 1.3, 0.09, '#E4ECF1', 0.035, { r: 0.6 }), 0.56, 0.86, 0, dv); put(rbox(0.06, 0.16, 0.05, '#B9C2CA', 0.02, { m: 0.6, r: 0.3 }), 1.0, 0.9, 0.06, dv);
      const lk = put(rbox(0.09, 0.06, 0.03, '#4CB363', 0.012, { e: '#4CB363', ei: 0.5 }), 1.0, 1.04, 0.055, dv);
      dv.traverse((o) => { if (o.isMesh) o.userData.kitW = true; }); // moving parts stay out of the static batches
      room.spots.push({ x, z: wz - 0.04, rot: 0, sit: true, y: 0.1, busy: null, door: dv, lock: lk, front: true });
    }
    // double vanity against a side wall (light oak top on two panels with a shelf, two round vessel basins, tall chrome taps, an oval mirror), a towel dispenser and a pedal bin
    const side = room.nst === 2 ? (room.st ? 1 : -1) : -1, Lv = K < 0.8 ? 1.5 : 1.9, vz = Math.min(D / 2 - 0.3 - Lv / 2, cz - 0.9 * K - 0.28 + 1.2 + Lv / 2), bs = vz + Lv / 2 + 0.55 < D / 2 ? 1 : -1; // starts past the swing of the cubicle doors; bin and towels at whichever end has room
    const vg = grp(side * (W / 2 - 0.33), vz, -side * Math.PI / 2, g), OAK = '#D9B27C';
    put(rbox(Lv, 0.13, 0.56, OAK, 0.05, { r: 0.7 }), 0, 0.84, 0, vg); put(rbox(Lv - 0.16, 0.09, 0.48, OAK, 0.03, { r: 0.7 }), 0, 0.3, 0, vg);
    for (const sx of [-1, 1]) put(rbox(0.12, 0.8, 0.52, OAK, 0.04, { r: 0.7 }), sx * (Lv / 2 - 0.08), 0.42, 0, vg);
    const wash = [];
    for (const bx of [-Lv / 4, Lv / 4]) {
      put(cyl(0.2, 0.15, 0.15, '#FFFFFF', { r: 0.2 }), bx, 0.97, 0.03, vg); put(cyl(0.16, 0.16, 0.02, '#D9E2E8', { r: 0.25 }), bx, 1.04, 0.03, vg);
      put(cyl(0.04, 0.045, 0.34, '#C7CDD3', { m: 0.8, r: 0.25 }), bx, 1.06, -0.2, vg); put(rbox(0.07, 0.06, 0.18, '#C7CDD3', 0.025, { m: 0.8, r: 0.25 }), bx, 1.22, -0.12, vg);
      const wt = put(cyl(0.012, 0.012, 0.15, '#BFE3F5', { e: '#BFE3F5', ei: 0.3 }), bx, 1.13, -0.06, vg); wt.visible = false; wt.castShadow = false;
      // spot in front of the basin, facing the wall (vanity frame: x along the top, +z its front)
      const lx = bx, lz = 0.62, c = Math.cos(vg.rotation.y), s2 = Math.sin(vg.rotation.y);
      wash.push({ x: vg.position.x + lx * c + lz * s2, z: vg.position.z - lx * s2 + lz * c, rot: vg.rotation.y + Math.PI, sit: false, y: 0, busy: null, water: wt });
    }
    const mr = grp(0, -0.25, 0, vg); mr.position.y = 1.62; { const fr = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.065, 12, 40), mat(OAK, { r: 0.6 })); fr.scale.set(Lv > 1.6 ? 1.5 : 1.25, 1, 1); fr.castShadow = true; mr.add(fr);
      const gl = new THREE.Mesh(new THREE.CircleGeometry(0.355, 40), mat('#CFE3EC', { r: 0.08, m: 0.3 })); gl.scale.set(Lv > 1.6 ? 1.5 : 1.25, 1, 1); gl.position.z = -0.005; mr.add(gl); }
    put(cyl(0.035, 0.035, 0.13, '#F2F4F5', { r: 0.4 }), 0, 0.96, -0.17, vg); put(cyl(0.012, 0.012, 0.05, '#C7CDD3', { m: 0.8 }), 0, 1.05, -0.17, vg); // soap
    const td = put(rbox(0.32, 0.4, 0.17, '#F4F6F7', 0.05, { r: 0.4 }), bs * (Lv / 2 + 0.3), 1.32, -0.18, vg); put(rbox(0.2, 0.02, 0.02, '#FFFFFF', 0.005), 0, -0.17, 0.065, td); // paper towels
    const bin = grp(bs * (Lv / 2 + 0.3), 0, 0, vg); put(cyl(0.16, 0.14, 0.44, '#C9CFD4', { m: 0.6, r: 0.3 }), 0, 0.22, 0, bin); put(cyl(0.175, 0.175, 0.07, '#B4BBC2', { m: 0.6, r: 0.3 }), 0, 0.47, 0, bin); put(rbox(0.1, 0.02, 0.06, '#59606A', 0.01), 0, 0.03, 0.17, bin);
    { const c = Math.cos(vg.rotation.y), s2 = Math.sin(vg.rotation.y), bx = bs * (Lv / 2 + 0.3); room.bin = { x: vg.position.x + bx * c, z: vg.position.z - bx * s2 }; }
    room.wash = wash;
  },
  lab(g, cx, cz, room, K = 1) {
    if (ROOM_STYLE.lab && ROOM_STYLE.lab.kit && PROPS_ON) { labKit(g, cx, cz, room); return; }
    const d = grp(cx - 0.4 * K, cz - 1.2 * K, 0, g);
    put(rbox(2.6, 0.12, 1.0, '#FFFFFF', 0.05), 0, 0.9, 0, d); put(rbox(2.5, 0.8, 0.9, '#C9D6E3', 0.05), 0, 0.46, 0, d);
    put(cyl(0.12, 0.16, 0.5, '#3B4A6B'), -0.8, 1.2, -0.1, d); put(cyl(0.05, 0.05, 0.35, '#3B4A6B'), -0.8, 1.55, 0.05, d);
    ['#7ACB4E', '#FF8FAB', '#5AB8F0', '#FFD25E'].forEach((col, i) => put(cyl(0.05, 0.05, 0.28, col, { op: 0.8 }), 0.2 + i * 0.16, 1.1, 0.15, d));
    put(rbox(0.8, 0.5, 0.06, '#2F3640', 0.03), 0.6, 1.3, -0.3, d); put(rbox(0.7, 0.4, 0.02, '#BFE6F6', 0.01, { e: '#BFE6F6', ei: 0.5 }), 0.6, 1.3, -0.26, d);
    chair(g, cx - 0.4 * K, cz - 2.2 * K, 0, '#5AB8F0');
    const board = grp(cx + 2.2 * K, cz - 2.95 * K, 0, g); put(rbox(1.6, 1.1, 0.06, '#FFFFFF', 0.03), 0, 1.6, 0, board);
    for (let i = 0; i < 4; i++) put(rbox(0.25, 0.25, 0.02, ['#FFD25E', '#FF8FAB', '#7ACB4E', '#5AB8F0'][i], 0.01), -0.5 + i * 0.33, 1.65, 0.04, board);
    room.staffSpot = { x: cx - 0.4 * K, z: cz - 2.2 * K, rot: 0, sit: true, y: 0.02 };
  },
};

// ---------------- staff ----------------
function makeCandidate(role) {
  const r = ROLES[role]; const traits = [];
  const pool = TRAITS.slice().sort(() => Math.random() - 0.5);
  traits.push(pool.find((x) => x.t === 'good').n);
  traits.push(pool.find((x) => !traits.includes(x.n)).n);
  if (Math.random() < 0.4) { const f = pool.find((x) => x.t === 'fun' && !traits.includes(x.n)); if (f) traits.push(f.n); }
  const skill = 1 + Math.floor(Math.random() * 5);
  let wage = Math.round((r.wage[0] + (r.wage[1] - r.wage[0]) * (skill - 1) / 4 + Math.random() * 80) / 10) * 10;
  if (traits.includes('Always on LinkedIn')) wage = Math.round(wage * 1.1 / 10) * 10;
  return { id: 0, role, name: staffFirst(role) + ' ' + crnd(LAST), skill, wage, traits,
    look: { skin: crnd(SKIN), hair: crnd(HAIR.slice(0, 7)), style: crnd(STYLES.filter((s) => s !== 'beanie')), tall: 0.9 + Math.random() * 0.25, wide: 0.9 + Math.random() * 0.25, glasses: Math.random() < 0.35, nose: Math.random() < 0.4 } };
}
function staffLook(st) {
  const r = ROLES[st.role], L = { ...st.look, role: st.role, shirt: r.uni, pants: r.pants, shoes: '#F4EFE6' };
  if (st.role === 'host') Object.assign(L, { apron: true, lanyard: true, headset: true });
  if (st.role === 'coach') Object.assign(L, { lanyard: true, inner: '#F4EFE6' });
  if (st.role === 'guide') Object.assign(L, { mat: true, shoes: '#8B6A45' });
  if (st.role === 'maint') Object.assign(L, { cap: '#E9785F', belt: true, inner: '#F4EFE6', shoes: '#8B6A45' });
  if (st.role === 'pharmacist') Object.assign(L, { coat: true, shirt: '#2BB5A6', inner: '#2BB5A6', lanyard: true, glasses: true });
  if (st.role === 'therapist') Object.assign(L, { inner: '#F4EFE6', clip: true, shoes: '#8B6A45' });
  if (st.role === 'researcher') Object.assign(L, { coat: true, shirt: '#5AB8F0', inner: '#5AB8F0', goggles: true, lanyard: true });
  return L;
}
const energyF = (rs) => ((rs.data.energy ?? 1) < 0.25 ? 0.6 : 1) * (rs.data.sadT > 0 ? 0.7 : 1) * (rs.data.sick ? 0.5 : 1);
const staffPerson = (st) => (st.role === 'trainer' && CHAR.A.full.sp_trainer ? visPerson('sp_trainer', staffLook(st)) : person(staffLook(st), 'staff'));
function traitVal(st, key, def = 1) { let v = def; for (const n of st.traits) { const x = TRAITS.find((y) => y.n === n); if (x && x[key] != null) v *= x[key]; } return v; }
function spawnStaffAvatar(st) {
  { const sx = ROLE_SEX[st.role], f = (st.name || '').split(' ')[0]; if (sx && (sx === 'm' ? FIRST_F : FIRST_M).includes(f)) st.name = staffFirst(st.role) + st.name.slice(f.length); } // older saves: a name that doesn't fit the character gets one that does
  const av = staffPerson(st); av.position.set(3, 0.1, 11); scene.add(av);
  const rs = { data: st, av, at: null, path: [], ph: 0, mode: 'walk', task: null, work: 0 };
  R.staff.push(rs); return rs;
}
const MAINT_HOME = (i) => ({ x: 5.9 - i * 0.6, z: 1.0, rot: Math.PI / 4, sit: false, y: 0 });
function assignStaff() {
  for (const rs of R.staff) if (rs.at != null && !['desk', 'idle', 'maint', 'train', 'heal'].includes(rs.at) && (!R.rooms[rs.at] || R.rooms[rs.at].staff[rs.st] !== rs)) rs.at = null;
  desks().forEach((_, di) => { if (deskHost(di)) return; const h = R.staff.find((rs) => rs.data.role === 'host' && (!rs.at || rs.at === 'idle')); if (h) { h.at = 'desk'; h.desk = di; goStaff(h, deskSpot(di)); } });
  // free staff go where they are needed most: a room with an emergency waiting first, then the longest queue (was: whichever room was built first)
  const need = (room) => { const q = roomQ(room.id); return q.some((v) => v.em) * 100 + q.length; };
  const byNeed = Object.values(R.rooms).filter((r) => ROOMS[r.type].role).sort((a, b) => need(b) - need(a));
  // and a carer standing in an empty room moves over to an unstaffed room of their speciality where 2+ people (or an emergency) wait
  for (const room of byNeed) { if (need(room) < 2 || room.closed || room.staff.some((s, i) => s && R.staff.includes(s) && s.at === room.id && s.st === i)) continue;
    const role = ROOMS[room.type].role, idle = R.staff.find((rs) => rs.data.role === role && !rs.onBreak && !rs.data.train && !(rs.data.awayT > 0) && R.rooms[rs.at] && rs.at !== room.id && need(R.rooms[rs.at]) === 0 && !R.visitors.some((u) => u.room === rs.at && (u.state === 'treat' || u.state === 'toRoom')));
    if (idle) { const old = R.rooms[idle.at]; if (old.staff[idle.st] === idle) old.staff[idle.st] = null; idle.at = null; } }
  for (const room of Object.values(R.rooms)) if (room.closed) room.staff.forEach((s, i) => { if (s && s.at === room.id && !s.onBreak && !s.ixGo) { room.staff[i] = null; s.at = null; } }); // a closed room (leak…) doesn't keep its carer sitting inside
  for (const room of byNeed) {
    if (room.closed) continue;
    room.staff.forEach((s, i) => {
      if (s && R.staff.includes(s) && s.at === room.id && s.st === i) return;
      room.staff[i] = null;
      const c = R.staff.find((rs) => rs.data.role === ROOMS[room.type].role && (rs.at == null || rs.at === 'idle') && !rs.data.train);
      if (c && room.staffSpots[i]) { c.at = room.id; c.st = i; room.staff[i] = c; goStaff(c, room.staffSpots[i]); }
    });
  }
  let i = 0, m = 0;
  for (const rs of R.staff) {
    if (rs.data.role === 'maint' && (rs.at == null || rs.at === 'idle')) { rs.at = 'maint'; rs.home = MAINT_HOME(m++); goStaff(rs, rs.home); continue; }
    if (rs.at == null) { rs.at = 'idle'; goStaff(rs, { x: 5.6 - i * 0.7, z: 1.6, rot: Math.PI / 4, sit: false, y: 0 }); i++; }
  }
}
const angW = (a) => ((a % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
function turnTo(av, want, dt, k = 6) { av.rotation.y = angW(av.rotation.y + angW(want - av.rotation.y) * Math.min(1, dt * k)); }
// who this staff member is serving right now (desk: the visitor checking in; room: the visitor on one of their spots)
function patientOf(rs) {
  if (rs.at === 'desk') return R.visitors.find((u) => u.state === 'checkin' && (u.desk || 0) === (rs.desk || 0)) || null;
  return R.visitors.find((u) => u.room === rs.at && u.rspot && u.rspot.st === rs.st && (u.state === 'treat' || u.state === 'toRoom')) || null;
}
function staffAttend(rs, dt) {
  if (rs.data.role === 'maint' || !rs.target) return;
  if (ixStaffWalk(rs, dt)) return; // away for a moment of a treatment scene
  const p = rs.av.userData.p, base = (rs.lessonRot ?? rs.target.rot) || 0, sit = !!rs.target.sit, v = patientOf(rs);
  let want = base;
  if (v) { const dx = v.av.position.x - rs.av.position.x, dz = v.av.position.z - rs.av.position.z; if (dx * dx + dz * dz > 0.04) { const d = angW(Math.atan2(dx, dz) - base); want = base + (sit ? clamp(d, -0.7, 0.7) : d); } }
  turnTo(rs.av, want, dt, 5);
  const room = R.rooms[rs.at], rt = room && ROOMS[room.type];
  let busy = !!v && (v.state === 'treat' || v.state === 'checkin'); // talk only when someone is actually in front of them
  if (!busy && rt && (rt.shop || room.type === 'cafe')) { const u = R.visitors.find((x) => (x.state === 'cafe' && roomOfSpot(x.lspot) === room) || (x.state === 'shopping' && roomOfSpot(x.sspot) === room) || (x.state === 'line' && room.lineQ && room.lineQ[0] === x));
    if (u) { busy = rt.shop ? 'till' : 'work'; const dx = u.av.position.x - rs.av.position.x, dz = u.av.position.z - rs.av.position.z; if (dx * dx + dz * dz > 0.04 && !sit) turnTo(rs.av, Math.atan2(dx, dz), dt, 4); } } // the barista serves, the cashier rings up
  if (!busy && room && room.type === 'lab' && S.research && S.research.active) busy = 'work'; // researching: working at the bench
  if (busy === true && rt && rt.shop) busy = 'till';
  if (rs.ixPose && v && v.state === 'treat') busy = rs.ixPose; // playing a beat of the treatment scene
  if (busy) rs.fid = null;
  if (busy !== rs.busyPose) { rs.busyPose = busy; rs.fid = null; if (typeof busy === 'string' && busy.startsWith('ix:') && p.anim) p.anim.set(busy.slice(3)); else if (busy === 'till' && p.anim) p.anim.set('till'); else if (busy) poseWork(p, sit); else if (sit) poseSit(p); else poseStand(p); }
  if (!busy && !sit && p.anim && !rs.lesPose && rs.at !== 'train') { // standing staff don't stand frozen: a breath, a look at the phone, then back
    rs.fidT = (rs.fidT ?? 6 + RNG() * 14) - dt;
    if (rs.fidT <= 0) { if (rs.fid) { rs.fid = null; poseStand(p); rs.fidT = 10 + RNG() * 16; } else { rs.fid = RNG() < 0.5 ? 'phone' : 'idle2'; p.anim.set(rs.fid); rs.fidT = 4 + RNG() * 3; } }
  }
  if (!sit && !busy) p.body.position.y = Math.sin(performance.now() / 400 + rs.data.id) * 0.015;
}
function goStaff(rs, spot) { rs.target = spot; rs.path = findPath(rs.av.position, spot); rs.mode = 'walk'; poseStand(rs.av.userData.p); }
// Maintenance: rats first, then mess, then (during a Wi-Fi outage) the router; when all is clean she does her rounds —
// waters the plants, checks the router, walks the floor — instead of standing in a corner.
function routerMesh() {
  if (world.router && world.router.parent) return world.router;
  const g = grp(4.2, 0.62, 0); g.position.y = 1.45; put(rbox(0.42, 0.1, 0.26, '#F4F2EE', 0.03), 0, 0, 0, g);
  put(rbox(0.6, 0.05, 0.34, '#C98F5A', 0.02), 0, -0.08, -0.02, g); for (const x of [-0.22, 0.22]) put(rbox(0.04, 0.2, 0.26, '#B07A48', 0.01), x, -0.2, -0.06, g); // on a little wall shelf, not floating
  for (const x of [-0.14, 0.14]) put(cyl(0.015, 0.015, 0.26, '#2F3640'), x, 0.16, -0.06, g);
  const led = sph(0.03, '#3BD16F', { e: '#3BD16F', ei: 1 }); put(led, 0.12, 0.03, 0.14, g); g.userData.led = led; world.router = g; return g;
}
// everything the crew should deal with, most urgent first: vomit & spills, rats, dirty toilets, broken machines, dirty rooms, litter, thirsty plants
const ROOM_JOB = new Map(), FIX_JOB = new Map();
function maintJobs() {
  const out = [];
  for (const o of R.litter) out.push({ kind: 'litter', obj: o, pr: o.prio ? -1 : o.heavy ? 0 : 5 }); // prio: the player tapped it
  for (const o of R.rats) out.push({ kind: 'rat', obj: o, pr: o.prio ? -1 : 1 });
  for (const room of Object.values(R.rooms)) if ((room.def.dirt || 0) >= 0.35) { let j = ROOM_JOB.get(room); if (!j) { j = { mesh: { position: doorPt(room.def, -1.0) } }; ROOM_JOB.set(room, j); } out.push({ kind: 'room', room: room.id, obj: j, pr: ROOMS[room.type].loo ? 2 : 4 }); }
  for (const d of S.decor || []) { if (d.broken) { let j = FIX_JOB.get(d.id); if (!j) { j = { mesh: { position: { x: d.x, z: d.z } } }; FIX_JOB.set(d.id, j); } j.mesh.position = { x: d.x, z: d.z }; out.push({ kind: 'fix', dec: d, obj: j, pr: 3 }); }
    if (d.k === 'plant' && (d.dry || 0) >= 0.5) { let j = FIX_JOB.get('w' + d.id); if (!j) { j = { mesh: { position: { x: d.x, z: d.z } } }; FIX_JOB.set('w' + d.id, j); } out.push({ kind: 'chore', what: 'water', dec: d, obj: j, pr: 6 }); } }
  return out;
}
function maintChores(rs) {
  const out = [], P = (x, z) => ({ position: { x, z } });
  for (const [x, z] of [[6.1, 2.6], [1.0, 6.0], [2.6, 1.0]]) out.push({ kind: 'chore', what: 'water', obj: { mesh: P(x, z) } });
  for (const d of S.decor || []) if (d.k === 'plant') out.push({ kind: 'chore', what: 'water', dec: d, obj: { mesh: P(d.x, d.z) } });
  out.push({ kind: 'chore', what: 'router', obj: { mesh: P(4.2, 0.62) } });
  for (let k = 0; k < 3; k++) { const x = 1 + Math.random() * 5, z = 1.5 + Math.random() * 5; out.push({ kind: 'chore', what: 'patrol', obj: { mesh: P(x, z) } }); }
  return out.filter((c) => c.obj.mesh.position !== (rs.lastChore && rs.lastChore.obj.mesh.position) && !(rs.lastChore && rs.lastChore.what === c.what && c.what !== 'water'));
}
function maintGo(rs, tg) {
  rs.goingTo = tg; rs.target = tg.what === 'patrol' ? { x: tg.obj.mesh.position.x, z: tg.obj.mesh.position.z, rot: Math.random() * 6.28, sit: false, y: 0 } : cleanSpot(tg.obj.mesh.position, rs.av.position);
  rs.path = findPath(rs.av.position, rs.target); rs.mode = 'walk'; poseStand(rs.av.userData.p);
}
function maintUpdate(rs, dt) {
  const mess = R.rats.length || R.litter.length, wifiDown = S.ev && S.ev.k === 'wifi';
  { const r = routerMesh(); r.userData.led.material.color.set(wifiDown ? '#FF4B4B' : '#3BD16F'); }
  if (rs.mode === 'walk') { // already heading somewhere; a chore gives way to real mess or a broken router
    if (rs.goingTo && rs.goingTo.kind === 'chore' && (mess || (wifiDown && rs.goingTo.what !== 'router'))) { rs.goingTo = null; rs.mode = 'free'; }
    else return;
  }
  if (rs.task) {
    const p = rs.av.userData.p, ch = rs.task.kind === 'chore';
    rs.work -= dt * boost() * energyF(rs);
    const kk = rs.task.kind, lit = kk === 'litter' && rs.task.obj && !rs.task.obj.heavy && !rs.task.obj.vomit;
    if (p.anim) p.anim.set(ch ? (rs.task.what === 'patrol' ? 'idle' : 'work') : kk === 'fix' ? 'work' : lit ? 'pickup' : 'clean'); // picks up rubbish, sweeps puddles / vomit / dirty rooms, works on repairs
    holdBroom(rs.av, !ch && kk !== 'fix' && !lit);
    if (!ch && !rs.broom && (kk === 'rat' || kk === 'fix')) { rs.broom = new THREE.Sprite(iconTex({ rat: '🪤', fix: '🔧' }[rs.task.kind])); rs.broom.scale.set(0.45, 0.45, 1); rs.broom.renderOrder = 10; scene.add(rs.broom); }
    if (rs.broom) rs.broom.position.set(rs.av.position.x, 2.2 + Math.sin(performance.now() / 120) * 0.05, rs.av.position.z);
    if (!p.anim) { rs.ph += dt * 10; p.arms[1].rotation.x = -1 + Math.sin(rs.ph) * 0.5; }
    if (ch && mess && rs.task.what !== 'router' && !rs.task.dec) rs.work = 0; // drop the watering can, there's a mess
    if (rs.work <= 0) {
      if (ch) { if (rs.task.what === 'router' && wifiDown) { endEvent(); chat(rs.data.name + ' · ' + roleN('maint'), t('maint.wifi'), '📶'); } if (rs.task.dec) { rs.task.dec.dry = 0; decState(rs.task.dec); } rs.lastChore = rs.task; rs.restT = 1 + Math.random() * 2; }
      else if (rs.task.kind === 'room') { const rm = R.rooms[rs.task.room]; if (rm) { rm.def.dirt = 0; applyDirt(rm); } }
      else if (rs.task.kind === 'fix') { rs.task.dec.broken = false; decState(rs.task.dec); }
      else {
        const o = rs.task.obj; scene.remove(o.mesh);
        const list = rs.task.kind === 'rat' ? R.rats : R.litter; const ix = list.indexOf(o); if (ix >= 0) list.splice(ix, 1);
        if (rs.task.kind === 'rat') { S.st = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }; S.st.chased = (S.st.chased || 0) + 1; }
        // (no more 'cleaned it' chatter from maintenance: it said nothing the player could act on)
      }
      if (!ch) floatAt(rs.av.position, '✨'); if (rs.broom) { scene.remove(rs.broom); rs.broom = null; }
      rs.task = null; holdBroom(rs.av, false); poseStand(rs.av.userData.p); rs.mode = 'free';
    }
    return;
  }
  if (rs.goingTo) { // just arrived
    const g = rs.goingTo; rs.goingTo = null;
    const ok = g.kind === 'chore' || (g.kind === 'rat' && R.rats.includes(g.obj)) || (g.kind === 'litter' && R.litter.includes(g.obj)) || (g.kind === 'room' && R.rooms[g.room] && (R.rooms[g.room].def.dirt || 0) > 0.05) || (g.kind === 'fix' && g.dec.broken && (S.decor || []).includes(g.dec));
    if (!ok) return;
    rs.task = g; rs.work = g.kind === 'rat' ? 5 : g.kind === 'chore' ? (g.what === 'router' ? (wifiDown ? 6 : 2.5) : g.what === 'water' ? 3 : 1.8) : g.kind === 'room' ? 4 + 6 * (R.rooms[g.room].def.dirt || 0) : g.kind === 'fix' ? 8 : g.obj.vomit ? 7 : g.obj.heavy ? 5 : 3; return;
  }
  const claimed = new Set(R.staff.filter((x) => x.task || x.goingTo).map((x) => (x.task || x.goingTo).obj));
  const targets = maintJobs().filter((x) => !claimed.has(x.obj));
  if (targets.length) {
    const p = rs.av.position, dd = (x) => Math.hypot(x.obj.mesh.position.x - p.x, x.obj.mesh.position.z - p.z); targets.sort((a, b) => a.pr - b.pr || dd(a) - dd(b));
    maintGo(rs, targets[0]); return;
  }
  if (wifiDown && !R.staff.some((x) => x !== rs && ((x.task && x.task.what === 'router') || (x.goingTo && x.goingTo.what === 'router')))) { maintGo(rs, { kind: 'chore', what: 'router', obj: { mesh: { position: { x: 4.2, z: 0.62 } } } }); return; }
  if (rs.mode !== 'free') return;
  if ((rs.restT = (rs.restT || 0) - dt) > 0) return; // short breather between chores
  const ch = maintChores(rs); if (ch.length) maintGo(rs, rnd(ch));
}
// where to stand to clean something: a free cell next to it (never inside a wall or furniture), facing it
function cleanSpot(o, from) {
  let best = null, bd = 1e9;
  for (let k = 0; k < 8; k++) { const a = k * Math.PI / 4 + Math.PI / 4, x = o.x + Math.sin(a) * 0.45, z = o.z + Math.cos(a) * 0.45, [i, j] = ci(x, z);
    if (!free(gridBlk, i, j) || !reach(gridBlk, from, { x, z })) continue; const d = Math.hypot(x - from.x, z - from.z); if (d < bd) { bd = d; best = { x, z }; } }
  if (!best) best = { x: o.x, z: o.z };
  return { x: best.x, z: best.z, rot: Math.atan2(o.x - best.x, o.z - best.z), sit: false, y: 0 };
}

// ---------------- visitors ----------------
// Reception desks: desk 0 is the lobby desk (S.desk); extra desks (S.desks2) can be built anywhere on the floor. Each has its own queue and host.
// The lobby desk can be lengthened into a double counter (two hosts side by side, two lines) instead of building a second desk.
const DESK_HALF = 0.85; // each station sits this far from the centre of a double counter
function seatDesk(i) { const D = S.desk, sg = D.segs[i], sx = (i ? 1 : -1) * DESK_HALF, o = { x: D.x + sx * Math.cos(D.r), z: D.z - sx * Math.sin(D.r), r: D.r }; Object.defineProperty(o, 'lv', { get: () => sg.lv || 1, set: (v) => { sg.lv = v; }, enumerable: true }); return o; }
const deskBase = () => (S.desk && S.desk.segs ? 2 : 1);
const desks = () => (S.desk.segs ? [seatDesk(0), seatDesk(1)] : [S.desk]).concat(S.desks2 || []);
const DQ = (di = 0) => (R.deskQs[di] || (R.deskQs[di] = []));
const allQ = () => R.deskQs.reduce((a, q) => a + q.length, 0);
const deskHost = (di = 0, there) => R.staff.find((rs) => rs.at === 'desk' && (rs.desk || 0) === di && (!there || rs.mode === 'there'));
function deskF(di = 0) { const D = desks()[di] || S.desk; return { x: Math.sin(D.r), z: Math.cos(D.r) }; }
// each station of a counter = one chair + one monitor, lined up; the host sits exactly on that chair
const ST_X = -0.3, ST_BACK = 0.98, CHAIR_P = ['cback', 'cbase', 'cpost', 'cseat'], MON_P = ['mbase', 'mneck', 'mon', 'scr'];
function deskSpot(di = 0) { const D = desks()[di] || S.desk, f = deskF(di), ox = di >= deskBase() || !S.desk.segs ? ST_X : 0; return { x: D.x + ox * Math.cos(D.r) - f.x * ST_BACK, z: D.z - ox * Math.sin(D.r) - f.z * ST_BACK, rot: D.r, sit: true, y: 0.04 }; }
const PART_OX = {}; // the model's own x of each chair / monitor part (same model for every desk)
function dressDesk(g, segs) { // move the model's chair and monitor to the station(s); a double counter gets a second set (not one stretched set)
  const m = g.children.find((c) => c.getObjectByName && c.getObjectByName('cseat')); if (!m) return false;
  const names = [...CHAIR_P, ...MON_P], sx = segs ? 1.5 : 1, xs = segs ? [-DESK_HALF / sx, DESK_HALF / sx] : [ST_X];
  const all = names.map((n) => { const a = []; m.traverse((o) => { if (o.name === n) a.push(o); }); if (PART_OX[n] == null) PART_OX[n] = a[0].position.x; return a; });
  if (all[0].length < 2) all.forEach((a) => { const c = a[0].clone(); a[0].parent.add(c); a.push(c); });
  for (let i = 0; i < 2; i++) names.forEach((n, j) => { const o = all[j][i], on = i < xs.length; o.visible = on; if (!on) return; o.position.x = PART_OX[n] - (j < CHAIR_P.length ? 0.44 : -0.48) + xs[i]; o.scale.x = 1 / sx; });
  return true;
}
let dressTry = 0;
function dressDesks() { const ok = dressDesk(world.desk, !!S.desk.segs); (world.desks2 || []).forEach((m) => { m.scale.x = 1; dressDesk(m, false); }); if (!ok && dressTry++ < 40) setTimeout(dressDesks, 500); }
function QUEUE(i, di = 0) { const D = desks()[di] || S.desk, f = deskF(di); const k = di ? i : Math.min(i, 2); const b = { x: D.x + f.x * (0.95 + k * 0.72), z: D.z + f.z * (0.95 + k * 0.72) }; if (!di && i > 2) b.z += (i - 2) * 0.72; if (i > 0) { b.x += Math.sin(i * 2.7) * 0.16; b.z += Math.cos(i * 1.9) * 0.08; } return b; } // a loose line, not a parade
function deskMesh() { const m = world.desk.clone(true); m.traverse((o) => { if (o.isMesh) o.userData.desk = true; }); m.children.forEach((c) => { if (c === world.deskRing || c.geometry && c.geometry.type === 'RingGeometry') c.visible = false; }); scene.add(m); return m; }
function placeDesk() {
  const D = S.desk; world.desk.position.set(D.x, 0, D.z); world.desk.rotation.y = D.r; world.desk.scale.x = D.segs ? 1.5 : 1;
  world.desks2 = world.desks2 || []; while (world.desks2.length > (S.desks2 || []).length) scene.remove(world.desks2.pop());
  (S.desks2 || []).forEach((E, i) => { const m = world.desks2[i] || (world.desks2[i] = deskMesh()); m.position.set(E.x, 0, E.z); m.rotation.y = E.r; m.userData.di = i + deskBase(); });
  if (S.rooms) rebuildGrid(); dressTry = 0; dressDesks();
  const hs = deskSpot(), q0 = QUEUE(0);
  const extra = D.segs ? [deskSpot(1), QUEUE(0, 1), QUEUE(1, 1)] : [];
  for (const s of WAIT_SPOTS) s.blocked = Math.hypot(s.x - D.x, s.z - D.z) < (D.segs ? 2.0 : 1.5) || Math.hypot(s.x - hs.x, s.z - hs.z) < 0.8 || Math.hypot(s.x - q0.x, s.z - q0.z) < 0.8 || extra.some((e) => Math.hypot(s.x - e.x, s.z - e.z) < 0.8);
}
const WAIT_SPOTS = [
  ...[[1.3, 3.6], [1.3, 4.8], [2.2, 1.5], [3.0, 1.6], [2.0, 2.3], [6.0, 4.0], [6.0, 4.8], [6.0, 5.6], [2.2, 5.9], [2.9, 2.5]].map(([x, z]) => ({ x, z, rot: Math.atan2(4.6 - x, 3.6 - z) })), // standing: by the walls, clear of the sofa and the queue, facing the desk
].map((s) => ({ ...s, busy: null, sit: !!s.sit, y: s.y || 0 }));
const iconCache = {};
function iconTex(e) {
  if (iconCache[e]) return iconCache[e];
  const tx = canvasTex(96, 96, (g) => { g.fillStyle = '#ffffff'; g.beginPath(); g.arc(48, 48, 44, 0, 7); g.fill(); g.lineWidth = 6; g.strokeStyle = '#14213D'; g.stroke(); g.font = '52px "Apple Color Emoji","Segoe UI Emoji","Noto Color Emoji",sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(e, 48, 52); });
  return (iconCache[e] = new THREE.SpriteMaterial({ map: tx, depthTest: false }));
}
const barBg = new THREE.SpriteMaterial({ color: '#14213D', depthTest: false }), barFg = {};
function barMat(c) { return barFg[c] || (barFg[c] = new THREE.SpriteMaterial({ color: c, depthTest: false })); }
let spawnKid = false, famNext = false; // kids never come alone: they follow a parent (famNext)
function spawnVisitor(prob, em, vip, look0) {
  if (!prob && S.ad && S.ad.room && RNG() < 0.5) prob = rnd(Object.keys(PROBLEMS).filter((k) => PROBLEMS[k].room === S.ad.room && lvlOk(k) && !isNewK(k) && (!PROBLEMS[k].city || PROBLEMS[k].city === (S.city || 'london'))));
  if (!prob && unlocked('lab') && S.mode === 'career' && RNG() < 0.12) prob = rnd(Object.keys(PROBLEMS).filter((k) => PROBLEMS[k].myst && unlocked(PROBLEMS[k].room)));
  const cityOk = (k) => (!PROBLEMS[k].city || PROBLEMS[k].city === (S.city || 'london')) && lvlOk(k);
  if (!prob) { const pool = Object.keys(PROBLEMS).filter((k) => !PROBLEMS[k].myst && !PROBLEMS[k].fam && !PROBLEMS[k].epi && cityOk(k) && unlocked(PROBLEMS[k].room) && !isNewK(k)); const w = pool.map((k) => (hasRoom(PROBLEMS[k].room) ? 3 : 1) * (PROBLEMS[k].city ? (cityOf().sig === k ? 4 : 2) : 1)); let r = RNG() * w.reduce((a, b) => a + b, 0); prob = pool[pool.length - 1]; for (let i = 0; i < pool.length; i++) { r -= w[i]; if (r <= 0) { prob = pool[i]; break; } } }
  const vm = look0 ? null : vip && VIS.sp_influencer ? 'sp_influencer' : pickVis(spawnKid, PROBLEMS[prob] && PROBLEMS[prob].room === 'nap'); // the influencer has her own model
  const look = look0 || { vm, kid: famNext || ['toddler', 'schoolrun', 'tablet', 'homework', 'sugar'].includes(prob) ? pickVis(true) || 'v25' : null, skin: rnd(SKIN), hair: rnd(HAIR), style: rnd(STYLES), shirt: rnd(SHIRTS), pants: rnd(['#3B4A6B', '#2F3A52', '#5E6B3A', '#7A5A3A', '#2A2A2E', '#8A9AB0']), tall: 0.85 + RNG() * 0.35, wide: 0.85 + RNG() * 0.4, glasses: RNG() < 0.25, nose: RNG() < 0.5, shoes: rnd(['#2A2A2E', '#F4EFE6', '#E9785F']) };
  if (look0 && !look0.vm) look0.vm = pickVis(false, PROBLEMS[prob] && PROBLEMS[prob].room === 'nap'); // visitors from older saves
  if (look.vm && VIS[look.vm]) { look.tall = VIS[look.vm].h / 1.75; look.wide = 1; look.male = VIS_MALE.has(look.vm); look.style2 = styleFor(prob); }
  if (look.vm && !CHAR.A.full[look.vm]) loadFull(look.vm);
  const av = person(look, 'visitor'); av.position.set(1 + Math.random() * 4, 0.1, 12.2); scene.add(av); av.userData.p.waitPose = RNG() < 0.55 ? 'phone' : 'idle';
  const hud = new THREE.Group(); scene.add(hud);
  const icon = new THREE.Sprite(iconTex(em ? '🚨' : '🛎️')); icon.scale.set(0.55, 0.55, 1); icon.position.set(0, 2.15 * look.tall, 0); icon.renderOrder = 10; hud.add(icon);
  const bg = new THREE.Sprite(barBg); bg.center.set(0, 0.5); bg.scale.set(0.64, 0.1, 1); bg.position.set(-0.226, 1.82 * look.tall, 0.226); bg.renderOrder = 11; hud.add(bg);
  const fg = new THREE.Sprite(barMat('#7ACB4E')); fg.center.set(0, 0.5); fg.scale.set(0.6, 0.06, 1); fg.position.set(-0.212, 1.82 * look.tall, 0.212); fg.renderOrder = 12; hud.add(fg);
  const gag = addGag(av, prob, look);
  const v = { gag, id: S.nextId++, name: rnd(CITY_NAMES[S.city] && RNG() < 0.75 ? CITY_NAMES[S.city] : FIRST), age: 19 + Math.floor(RNG() * 22), prob, known: false, av, hud, icon, bg, fg, pat: 1, prog: 0, state: 'toQueue', path: [], ph: Math.random() * 6, spot: null, room: null, look, em: !!em };
  if (vip) { v.vip = true; v.name = '@' + crnd(['glowwithjade', 'kaivibes', 'lunchbreaklena', 'mainchar.mo', 'softlifesam']); const cr = new THREE.Sprite(iconTex('👑')); cr.scale.set(0.45, 0.45, 1); cr.position.set(0.35, 2.5 * look.tall, -0.35); cr.renderOrder = 10; hud.add(cr); }
  if (em) { const ring = new THREE.Mesh(new THREE.TorusGeometry(0.62, 0.08, 8, 32), mat('#FF2D2D', { e: '#FF2D2D', ei: 1.5 })); ring.rotation.x = Math.PI / 2; ring.position.y = 0.06; ring.visible = false; v.emRing = null; /* no red ring at their feet: the 🚨 over the head says it */ const sb = new THREE.Sprite(iconTex('🚨')); sb.scale.set(0.42, 0.42, 1); sb.position.set(-0.4, 2.45 * look.tall, 0.4); sb.renderOrder = 10; hud.add(sb); v.prio = true; }
  v.need = RNG() < 0.35 ? 0.3 + RNG() * 0.4 : 0; // some arrive already needing the loo
  if (PROBLEMS[prob] && PROBLEMS[prob].epi) v.virus = true;
  R.visitors.push(v); if (!wavePending) behSpawn(v); if (!em && beh('nolines') && ['grind', 'rentshock'].includes(prob) && DQ(0).length >= 6 && desks().length <= 1) { behSeen('nolines'); floatAt(v.av.position, '🙅 nope'); joinQueue(v); leave(v, false); return v; } if (em) { finishCheckin(v, true); return v; } joinQueue(v); return v;
}

function addGag(av, prob, look) {
  const gg = new THREE.Group(); av.add(gg); const top = 2.55 * (look.tall || 1);
  if (prob === 'gloom' || prob === 'lowmood') { for (const [x, z, r] of [[0, 0, 0.2], [0.18, 0.02, 0.15], [-0.18, 0.02, 0.15]]) put(sph(r, '#8E99A8'), x, top + 0.1, z, gg); for (let i = 0; i < 3; i++) put(cyl(0.015, 0.015, 0.15, '#5AB8F0'), -0.12 + i * 0.12, top - 0.15, 0, gg); }
  if (prob === 'burn') { const f = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.3, 10), mat('#FF7A2E', { e: '#FF7A2E', ei: 1.2 })); put(f, 0, top - 0.05, 0, gg); }
  if (prob === 'ghosted') { const gh = new THREE.Group(); put(sph(0.16, '#FFFFFF', { op: 0.85 }), 0, 0.15, 0, gh); const c = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.25, 12), mat('#FFFFFF', { op: 0.85 })); c.rotation.x = Math.PI; put(c, 0, -0.02, 0, gh); gh.position.set(0.55, 1.6, 0); gg.add(gh); }
  if (prob === 'overthink') { const r = new THREE.Mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 16), mat('#B57BE8', { e: '#B57BE8', ei: 0.6 })); r.rotation.x = Math.PI / 2; put(r, 0, top - 0.1, 0, gg); }
  if (prob === 'moving') { put(rbox(0.5, 0.38, 0.38, '#C9A06B', 0.03), 0, 1.0, 0.36, gg); if (av.userData.p.glb) av.userData.carry = { y: 1.0, z: 0.36 }; } // both hands hold it (carryPose in chars.js)
  const wantKid = look.kid || prob === 'toddler' || prob === 'schoolrun';
  if (wantKid && av.userData.p.glb) { const kk = ['v25', 'v26', 'v27', 'v28'].filter((k) => CHAR.A.full[k]); if (kk.length) { const key = CHAR.A.full[look.kid] ? look.kid : kk[(look.vm || 'v').charCodeAt(2) % kk.length]; const kid = person({ vm: key }, 'visitor'); kid.position.set(0.6, 0, 0.15); av.add(kid); kid.traverse((m) => { if (m.isMesh) m.userData.owner = av; }); gg.userData.kid = kid; return gg; } }
  if (wantKid) { const kid = person({ skin: look.skin, hair: crnd(HAIR.slice(0, 5)), style: crnd(['short', 'curly', 'bun']), shirt: crnd(SHIRTS), pants: '#5AB8F0', tall: 0.55, wide: 0.75, shoes: '#E9785F' }); kid.scale.setScalar(0.62); kid.position.set(0.55, 0, 0.1); av.add(kid); kid.traverse((m) => { if (m.isMesh) m.userData.owner = av; }); gg.userData.kid = kid; if (prob === 'schoolrun') put(rbox(0.3, 0.35, 0.15, '#E9785F', 0.05), 0, 0.95, -0.22, kid.userData.p.body); }
  return gg;
}
// ---- treatment scenes (preview): what the client, the carer (and a parent's kid) do during a session, per problem.
// Each scene is a list of beats [progress 0..1, actions], played as the session's progress passes them:
//   v / s / k : what the client / carer / kid does (a verb, mapped to a seated or standing clip below; kid: own verbs)
//   vp / sp : an object in the client's / carer's right hand ('-' = put it down)
//   fv / fs / fk : a floating emoji over the client / carer / kid      gag: 'off' hides the problem's 3D gag (ring, cloud, flame, ghost…)
//   shake / melt : the client trembles / melts (1 on, 0 off)          box: 'tidy' = the moving box gets taped shut
// seated: TrSitAnswer / TrSitThumb make the person stand up (class clips), so a seated person talks with the listening clip and cheers by clapping
const IXV = { talk: ['listen', 'talk'], talk2: ['listen', 'talk2'], listen: ['listen', 'idle'], phone: ['sitphone', 'phone'], drink: ['drinksit', 'drink'], doze: ['SitDoze', 'IdleDoze'],
  happy: ['clap', 'cheer'], clap: ['clap', 'cheer'], think: ['SitCross', 'IdleConfused'], show: ['listen', 'show'], pickup: ['worksit', 'pickup'], angry: ['sit', 'IdleAngry'],
  head: ['sit', 'IdleHead'], breath: ['sit', 'IdleBreath'], work: ['worksit', 'work'], idle: ['sit', 'idle'] };
const IXP = { // hand props (metres, in the right hand)
  card: (g) => put(rbox(0.09, 0.006, 0.056, '#3E7BD6', 0.003), 0, 0.07, 0.04, g),
  scissors: (g) => { for (const s of [-1, 1]) { const b = put(rbox(0.012, 0.13, 0.006, '#C9D1DC', 0.003), 0.012 * s, 0.13, 0.03, g); b.rotation.z = 0.25 * s; put(cyl(0.022, 0.022, 0.012, '#E5484D'), 0.025 * s, 0.05, 0.03, g); } },
  bills: (g) => { put(rbox(0.2, 0.025, 0.14, '#FFFFFF', 0.004), 0, 0.07, 0.05, g); put(rbox(0.2, 0.008, 0.03, '#F2C14E', 0.002), 0, 0.087, 0.09, g); },
  paper: (g) => put(rbox(0.16, 0.006, 0.2, '#FFFFFF', 0.003), 0, 0.07, 0.06, g),
  tea: (g) => { put(cyl(0.04, 0.032, 0.1, '#F4EFE6'), 0, 0.09, 0.03, g); put(cyl(0.036, 0.036, 0.01, '#7ACB4E'), 0, 0.135, 0.03, g); },
  glass: (g) => put(cyl(0.032, 0.026, 0.11, '#BFE3F7'), 0, 0.09, 0.03, g),
  bottle: (g) => { put(cyl(0.025, 0.025, 0.08, '#2BB5A6'), 0, 0.09, 0.03, g); put(cyl(0.012, 0.012, 0.03, '#FFFFFF'), 0, 0.145, 0.03, g); },
  sachet: (g) => { put(rbox(0.11, 0.13, 0.04, '#FFFFFF', 0.01), 0, 0.09, 0.04, g); put(rbox(0.112, 0.03, 0.042, '#2BB5A6', 0.005), 0, 0.12, 0.04, g); },
  ball: (g) => put(sph(0.05, '#E5484D'), 0, 0.06, 0.04, g),
  book: (g) => put(rbox(0.13, 0.17, 0.03, '#5B6CC9', 0.008), 0, 0.1, 0.04, g),
  marker: (g) => put(cyl(0.012, 0.012, 0.15, '#2F3A52'), 0, 0.08, 0.03, g),
  hourglass: (g) => { const a = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.07, 10), mat('#F2C14E')); put(a, 0, 0.12, 0.03, g); const b = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.07, 10), mat('#F2C14E')); b.rotation.x = Math.PI; put(b, 0, 0.06, 0.03, g); },
  muffin: (g) => { put(cyl(0.045, 0.035, 0.05, '#C98A4B'), 0, 0.07, 0.04, g); put(sph(0.048, '#FF8FAB'), 0, 0.1, 0.04, g); put(cyl(0.006, 0.006, 0.06, '#5AB8F0'), 0, 0.16, 0.04, g); put(sph(0.012, '#FFB000', { e: '#FFB000', ei: 1.5 }), 0, 0.2, 0.04, g); },
  map: (g) => { put(rbox(0.24, 0.006, 0.17, '#E9F1D8', 0.003), 0, 0.07, 0.06, g); put(sph(0.015, '#E5484D'), 0.04, 0.08, 0.05, g); },
  jerry: (g) => put(rbox(0.14, 0.2, 0.08, '#D63A2F', 0.02), 0, 0.02, 0.05, g),
  lamp: (g) => put(cyl(0.05, 0.05, 0.11, '#FFD25E', { e: '#FFD25E', ei: 0.8 }), 0, 0.1, 0.04, g),
  piggy: (g) => { put(sph(0.07, '#FF8FAB'), 0, 0.1, 0.05, g); put(cyl(0.025, 0.025, 0.03, '#FF8FAB'), 0, 0.1, 0.12, g); },
  mask: (g) => { const m = put(sph(0.09, '#FFFFFF'), 0, 0.12, 0.05, g); m.scale.z = 0.35; put(sph(0.015, '#2F3A52'), -0.03, 0.14, 0.085, g); put(sph(0.015, '#2F3A52'), 0.03, 0.14, 0.085, g); },
  lmask: (g) => { const m = put(sph(0.1, '#D63A7A'), 0, 0.12, 0.05, g); m.scale.z = 0.4; put(sph(0.02, '#FFD25E'), -0.035, 0.14, 0.09, g); put(sph(0.02, '#FFD25E'), 0.035, 0.14, 0.09, g); },
  pad: (g) => put(rbox(0.3, 0.32, 0.1, '#FF8FAB', 0.04), 0, 0.12, 0.08, g),
  fan: (g) => put(rbox(0.2, 0.13, 0.01, '#E9785F', 0.01), 0, 0.12, 0.04, g),
  taco: (g) => { const t = put(cyl(0.07, 0.07, 0.05, '#F2C14E'), 0, 0.09, 0.04, g); t.rotation.x = Math.PI / 2; t.scale.y = 1; },
  trophy: (g) => { put(cyl(0.05, 0.03, 0.08, '#F2C14E'), 0, 0.13, 0.04, g); put(cyl(0.02, 0.02, 0.05, '#F2C14E'), 0, 0.07, 0.04, g); },
  cards: (g) => put(rbox(0.13, 0.17, 0.01, '#FFD25E', 0.008), 0, 0.1, 0.04, g),
  brush: (g) => { put(cyl(0.012, 0.012, 0.14, '#D4537E'), 0, 0.07, 0.03, g); put(rbox(0.05, 0.08, 0.025, '#D4537E', 0.01), 0, 0.17, 0.03, g); },
  scroll: (g) => { const r = put(cyl(0.03, 0.03, 0.3, '#FFF8E6'), 0, 0.08, 0.05, g); r.rotation.z = Math.PI / 2; },
  egg: (g) => { const e = put(sph(0.035, '#F4EAD0'), 0, 0.08, 0.04, g); e.scale.y = 1.3; },
  drum: (g) => put(cyl(0.12, 0.12, 0.16, '#C2703A'), 0, 0.05, 0.1, g),
  pen: (g) => put(cyl(0.01, 0.01, 0.13, '#3B4A6B'), 0, 0.08, 0.03, g),
};
const NOISE = [[0.05, { fv: '🚗📯🔊' }], [0.3, { s: 'show', fs: '🎧' }], [0.45, { fv: '🎧' }], [0.6, { fv: '💤' }], [0.85, { fv: '💤' }]];
const APPS = [[0.05, { v: 'phone', fv: '👈👉👈' }], [0.35, { s: 'talk', fs: '👋' }], [0.55, { v: 'talk', fv: '👋🙂' }], [0.85, { v: 'happy', fv: '💬' }]];
const IX = {
  // 💸 Budget Booth
  rent: [[0.04, { v: 'show', vp: 'bills', fv: '🧾🧾🧾' }], [0.3, { go: 'piece:easel|cork|board|chart', s: 'show', fs: '📂📂' }], [0.55, { go: 'home' }], [0.62, { vp: '-', v: 'listen', fv: '✅' }], [0.85, { v: 'happy', fv: '😮‍💨' }]],
  subs: [[0.04, { v: 'phone', fv: '💳💳💳' }], [0.2, { go: 'piece:easel|cork|board|chart', s: 'show', fs: '📊' }], [0.45, { go: 'home', v: 'show', vp: 'card' }], [0.62, { sp: 'scissors', fs: '✂️' }], [0.78, { vp: '-', sp: '-', fv: '✂️💳' }], [0.9, { v: 'happy' }]],
  flat: [[0.04, { v: 'head', fv: '🛏️🛏️' }], [0.25, { go: 'piece:easel|cork|board|chart', s: 'show', fs: '📈' }], [0.5, { go: 'home' }], [0.6, { sp: 'piggy', fs: '🐷' }], [0.8, { sp: '-', vp: 'piggy', v: 'happy', fv: '💰' }]],
  fuel: [[0.02, { vp: 'jerry', fv: '⛽❓' }], [0.35, { s: 'show', sp: 'lamp', fs: '☀️💡' }], [0.7, { vp: '-', sp: '-' }], [0.74, { vp: 'lamp', v: 'happy', fv: '☀️' }]],
  rentshock: [[0.02, { vp: 'paper', fv: '🏙️💸' }], [0.2, { v: 'head' }], [0.4, { go: 'near', s: 'show', sp: 'map', fs: '🗺️📍' }], [0.72, { go: 'home', sp: '-' }], [0.8, { vp: '-', v: 'happy', fv: '🏠👍' }]],
  // 😴 Nap Room (the client lies under the duvet: floats only)
  sunday: [[0.05, { fv: '😰📅' }], [0.25, { go: 'near', s: 'pickup', fs: '📵' }], [0.5, { fs: '⏰' }], [0.6, { go: 'home' }], [0.75, { fv: '💤' }]],
  burn: [[0.05, { fv: '🔥' }], [0.25, { go: 'near', s: 'pickup', fs: '👟👟' }], [0.5, { gag: 'off', fv: '💤' }], [0.55, { go: 'home' }], [0.8, { fv: '💤' }]],
  gloom: [[0.1, { s: 'show', fs: '💡' }], [0.35, { gag: 'off', fv: '☀️' }], [0.7, { fv: '💤' }]],
  flurest: [[0.05, { fv: '🤧' }], [0.25, { go: 'near', s: 'show', sp: 'tea', fs: '🍵' }], [0.5, { sp: '-', fv: '💤' }], [0.55, { go: 'home' }], [0.8, { fv: '💤' }]],
  train: NOISE, commute: NOISE, goslow: NOISE, honk: NOISE,
  mercury: [[0.1, { s: 'show', fs: '🪐✨' }], [0.4, { fv: '🌙' }], [0.7, { fv: '💤' }]],
  // 📵 Digital Detox
  doom: [[0.04, { fv: '📱🔒' }], [0.25, { v: 'phone', fv: '👆👆' }], [0.4, { go: 'near', s: 'show', sp: 'ball', fs: '🔴' }], [0.56, { sp: '-', vp: 'ball', v: 'listen', fv: '😌' }], [0.6, { go: 'home' }], [0.88, { vp: '-' }]],
  group: [[0.04, { fv: '📱🔒' }], [0.25, { fv: '📳📳📳' }], [0.45, { s: 'show', fs: '🔕' }], [0.6, { v: 'clap', s: 'clap', fv: '🎲' }], [0.85, { v: 'happy' }]],
  novela: [[0.04, { v: 'show', fv: '🎭📺' }], [0.35, { s: 'show', sp: 'book', fs: '📖' }], [0.5, { sp: '-', vp: 'book', v: 'listen' }], [0.78, { fv: '😭📖' }], [0.92, { vp: '-' }]],
  // 💼 Career Coach
  boss: [[0.04, { v: 'talk', fv: '😤👹' }], [0.25, { go: 'piece:easel|cork|board|chart', s: 'show', fs: '🧽' }], [0.55, { go: 'home' }], [0.6, { v: 'talk', fv: '🛑🙂' }], [0.85, { v: 'happy' }]],
  ladder: [[0.1, { fv: '🪜😵' }], [0.25, { go: 'piece:ladder|cork|board', s: 'show', sp: 'marker', fs: '📶' }], [0.58, { go: 'home', sp: '-' }], [0.62, { v: 'think' }], [0.85, { v: 'happy', fv: '🪜👍' }]],
  topper: [[0.04, { v: 'show', vp: 'paper', fv: '📚💯' }], [0.35, { vp: '-', s: 'work', fs: '🗄️' }], [0.6, { s: 'talk', fs: '❤️❓' }], [0.85, { v: 'happy', fv: '🎨' }]],
  ahorita: [[0.04, { v: 'doze', fv: '⏳😴' }], [0.35, { s: 'show', sp: 'hourglass', fs: '⏳' }], [0.55, { v: 'talk', sp: '-' }], [0.85, { v: 'happy', fv: '✅' }]],
  thirty: [[0.1, { s: 'show', sp: 'muffin', fs: '🧁' }], [0.4, { v: 'talk', fv: '🌬️🕯️' }], [0.55, { sp: '-', fs: '✅' }], [0.85, { v: 'happy', fv: '🎂' }]],
  // 🥂 Social Club
  ghosted: [[0.04, { v: 'phone', fv: '👻📱' }], [0.35, { s: 'show', fs: '📵' }], [0.5, { gag: 'off', v: 'listen' }], [0.68, { v: 'drink', vp: 'glass', s: 'drink', sp: 'glass', fv: '🥂' }], [0.88, { vp: '-', sp: '-', v: 'happy' }]],
  apps: APPS, swipe: APPS,
  lonely: [[0.04, { v: 'head', fv: '🫥' }], [0.35, { s: 'talk' }], [0.55, { v: 'talk', fv: '😄' }], [0.75, { v: 'clap', fv: '🫂' }]],
  nunchi: [[0.1, { s: 'show', fs: '😐' }], [0.3, { v: 'think', fv: '❓' }], [0.45, { s: 'show', fs: '😬' }], [0.6, { v: 'talk', fv: '💡' }], [0.85, { v: 'happy', fv: '👀✅' }]],
  aunty: [[0.1, { s: 'talk', fs: '💍❓' }], [0.35, { v: 'talk', fv: '🙂🍛' }], [0.6, { s: 'talk2', fs: '💍❓❓' }], [0.75, { v: 'talk', fv: '😄☕' }], [0.9, { v: 'happy' }]],
  situation: [[0.1, { s: 'show', fs: '🥂 / 🫙' }], [0.4, { v: 'think', fv: '🤔' }], [0.7, { v: 'show', fv: '🥂' }], [0.88, { v: 'happy' }]],
  // 🧸 Parent Pod (the kid plays its own part)
  toddler: [[0.02, { k: 'floor', kat: 'mat', fk: '😭' }], [0.15, { go: 'matSide', s: 'pickup', fs: '🧎' }], [0.38, { v: 'talk', fv: '🗣️🤗' }], [0.52, { k: 'sitfloor', fk: '😌' }], [0.6, { go: 'home' }], [0.7, { k: 'play', fk: '🧸' }], [0.93, { k: 'home' }]],
  schoolrun: [[0.02, { k: 'sitchair', kat: 'chair' }], [0.1, { go: 'board', s: 'show', fs: '🗓️' }], [0.3, { k: 'stand', fk: '🎒' }], [0.42, { k: 'pickup', fk: '👟' }], [0.55, { go: 'home' }], [0.62, { k: 'happy', fk: '🎒✅' }], [0.78, { v: 'happy', fv: '⏰✅' }], [0.93, { k: 'home' }]],
  tablet: [[0.02, { k: 'sitchair', kat: 'chair', fk: '🎮😤' }], [0.2, { go: 'basket', s: 'pickup', fs: '🧱' }], [0.35, { fk: '😤' }], [0.4, { go: 'kidNear', s: 'show' }], [0.5, { k: 'tower', fk: '🧱' }], [0.62, { go: 'home' }], [0.8, { k: 'happy', fk: '🏰' }], [0.93, { k: 'home' }]],
  homework: [[0.02, { k: 'write', kat: 'chair', kp: 'pen', fk: '📝' }], [0.15, { v: 'head', fv: '😱📝' }], [0.35, { s: 'talk', fs: '🙌' }], [0.55, { v: 'listen', fv: '😮‍💨' }], [0.72, { fk: '💯' }], [0.82, { kp: '-', k: 'happy' }], [0.93, { k: 'home' }]],
  sugar: [[0.02, { k: 'run', kat: 'mat', fk: '🍭⚡' }], [0.2, { fk: '⚡⚡' }], [0.3, { go: 'matSide', s: 'show', sp: 'glass', fs: '💧' }], [0.42, { k: 'stand', sp: '-', kp: 'glass' }], [0.52, { kp: '-', k: 'sleep', fk: '💤' }], [0.6, { go: 'home' }], [0.82, { v: 'happy', fv: '😮‍💨' }], [0.95, { k: 'home' }]],
  // 📦 Moving Desk
  moving: [[0.04, { fv: '📦💥' }], [0.3, { go: 'near', s: 'work', fs: '📦🩹' }], [0.6, { box: 'tidy', fv: '📦✨' }], [0.65, { go: 'home' }], [0.85, { v: 'happy' }]],
  newcity: [[0.04, { v: 'think', fv: '🗺️❓' }], [0.3, { s: 'show', fs: '📍☕' }], [0.48, { fs: '📍🏋️' }], [0.64, { fs: '📍🥂' }], [0.8, { vp: 'map', v: 'happy', fv: '🗺️✅' }]],
  // 💊 Pharmacy (standing at the counter)
  tummy: [[0.04, { v: 'head', fv: '🤢' }], [0.2, { go: 'piece:shelftea|tearack|shelf', s: 'pickup' }], [0.38, { go: 'home', fs: '🍵' }], [0.48, { vp: 'tea', v: 'drink' }], [0.85, { vp: '-', fv: '😌' }]],
  headache: [[0.04, { v: 'head', fv: '🤕' }], [0.2, { go: 'piece:shelfcross|shelfvit|shelf', s: 'pickup' }], [0.38, { go: 'home', fs: '💊💧' }], [0.48, { vp: 'glass', v: 'drink' }], [0.85, { vp: '-', fv: '😌' }]],
  screeneyes: [[0.04, { v: 'head', fv: '🥲' }], [0.3, { s: 'pickup', sp: 'bottle', fs: '💧👁️' }], [0.5, { sp: '-', v: 'breath', fv: '💧' }], [0.85, { fv: '👀✨' }]],
  flu: [[0.04, { fv: '🤒🤧' }], [0.3, { s: 'pickup', fs: '💊😷' }], [0.45, { vp: 'sachet', fv: '😷' }], [0.88, { vp: '-' }]],
  heatgrump: [[0.04, { v: 'angry', fv: '🥵' }], [0.3, { s: 'pickup', fs: '🪭💧' }], [0.45, { vp: 'fan', v: 'idle', fv: '🪭' }], [0.85, { vp: '-', fv: '😎' }]],
  antojo: [[0.02, { vp: 'taco', fv: '🌮' }], [0.3, { s: 'pickup', sp: 'sachet', fs: '🔄' }], [0.5, { vp: '-', sp: '-' }], [0.52, { vp: 'sachet', fv: '🌮➡️💊' }], [0.88, { vp: '-' }]],
  // ✨ Glow-up Studio
  filter: [[0.04, { v: 'phone', fv: '🤳✨' }], [0.3, { s: 'show', fs: '📵' }], [0.5, { v: 'listen', fv: '🪞' }], [0.8, { v: 'happy', fv: '😊✨' }]],
  haircut: [[0.04, { fv: '💇😩' }], [0.3, { s: 'work', sp: 'brush', fs: '💨' }], [0.6, { fs: '✂️' }], [0.8, { sp: '-', v: 'happy', fv: '✨💇✨' }]],
  botoxfomo: [[0.04, { fv: '💉😬' }], [0.3, { s: 'work', fs: '🧖' }], [0.6, { fv: '🧖✨' }], [0.85, { v: 'happy', fv: '✨' }]],
  beauty: [[0.04, { fv: '🪞😔' }], [0.35, { s: 'show', fs: '🪞↩️' }], [0.6, { v: 'happy', fv: '👍😎' }]],
  // 🛋️ Talk Room
  lowmood: [[0.04, { fv: '🪫' }], [0.3, { s: 'work', fs: '📝' }], [0.5, { fv: '🔋' }], [0.8, { v: 'happy', fv: '🔋🔋' }]],
  impostor: [[0.02, { vp: 'mask', fv: '🎭' }], [0.3, { s: 'work', fs: '📝' }], [0.55, { vp: '-', fv: '🎭➡️🙂' }], [0.85, { v: 'happy' }]],
  overthink: [[0.04, { fv: '🌀🌀' }], [0.3, { s: 'talk', fs: '🌬️' }], [0.45, { v: 'breath', fv: '🌬️' }], [0.6, { gag: 'off' }], [0.85, { v: 'happy', fv: '😌' }]],
  sharmaji: [[0.02, { vp: 'trophy', fv: '🏆👦' }], [0.35, { s: 'talk', fs: '🙃' }], [0.5, { vp: '-' }], [0.6, { s: 'talk2', fs: '⭐❓' }], [0.75, { v: 'talk', fv: '💪' }], [0.9, { v: 'happy' }]],
  hagwon: [[0.02, { vp: 'pen', v: 'doze', fv: '✏️😴' }], [0.4, { s: 'pickup', fs: '✏️' }], [0.5, { vp: '-', v: 'listen' }], [0.85, { v: 'happy' }]],
  roomie: [[0.04, { v: 'angry', fv: '🛋️😤' }], [0.25, { go: 'near', s: 'show', fs: '⚖️' }], [0.55, { v: 'talk', fv: '🗣️🙂' }], [0.7, { go: 'home' }], [0.85, { v: 'happy' }]],
  quake: [[0.02, { fv: '🫨', shake: 1 }], [0.3, { go: 'near', s: 'talk', fs: '🦶🦶' }], [0.6, { shake: 0, fv: '🧘' }], [0.68, { go: 'home' }], [0.85, { v: 'happy' }]],
  quarter: [[0.04, { melt: 1, fv: '🫠' }], [0.4, { s: 'talk' }], [0.65, { melt: 0, fv: '🙂' }], [0.85, { v: 'happy' }]],
  // city rooms
  hustle: [[0.04, { fv: '💼💼💼' }], [0.2, { go: 'piece:easel|cork|board|chart', s: 'show', fs: '📝📝📝' }], [0.45, { s: 'pickup', fs: '🗑️' }], [0.62, { fs: '📝' }], [0.7, { go: 'home' }], [0.85, { v: 'happy', fv: '🎯' }]],
  wedding: [[0.02, { vp: 'scroll', fv: '📜×600' }], [0.35, { s: 'show', sp: 'scissors', fs: '✂️' }], [0.6, { sp: '-', fv: '📜➡️📃' }], [0.85, { vp: '-', v: 'happy', fv: '😮‍💨' }]],
  overtime: [[0.04, { fv: '🌃💻' }], [0.22, { fv: '🐑😴' }], [0.38, { go: 'near', s: 'pickup', sp: 'egg', fs: '🥚' }], [0.5, { s: 'show', sp: 'bottle', fs: '🍶' }], [0.62, { go: 'home', sp: '-', fv: '😋' }], [0.78, { fv: '📵😌' }]], // jjimjilbang: lying on the warm mat, the attendant brings a baked egg and sikhye
  grind: [[0.04, { fv: '☕☕☕' }], [0.15, { stand: 1, v: 'breath', s: 'show', fs: '🙆' }], [0.4, { mat: 1, fv: '🧘' }], [0.72, { mat: 0, sitback: 1, v: 'think', fv: '😌' }]],
  coraje: [[0.02, { vp: 'lmask', fv: '😤' }], [0.25, { go: 'near', s: 'show', sp: 'pad', fs: '🛡️' }], [0.45, { v: 'angry', fv: '👊💥' }], [0.6, { fv: '🗣️❗' }], [0.72, { go: 'home', sp: '-' }], [0.8, { vp: '-', v: 'happy', fv: '😌' }], [0.86, { sp: 'trophy', s: 'show', fs: '🏆🔔' }], [0.95, { sp: '-' }]], // lucha: mask on, punches into the coach's pad, then the coach raises a trophy from the ring
  paperwork: [[0.04, { vp: 'paper', fv: '📑📑' }], [0.22, { go: 'near', s: 'show', sp: 'tea', fs: '🍵' }], [0.36, { sp: '-', vp: 'tea', v: 'drink', fv: '😌' }], [0.48, { go: 'home', fv: '🎲' }], [0.62, { sp: 'pen', s: 'work', fs: '📑🖊️' }], [0.78, { fs: '✅' }], [0.88, { vp: '-', sp: '-', v: 'happy' }]], // ahwa: the host brings tea to the bench, then stamps the papers at the counter
  saudade: [[0.04, { fv: '🥹' }], [0.22, { sp: 'drum', s: 'clap', fs: '🥁🎶' }], [0.4, { v: 'clap', fv: '👏🎶' }], [0.6, { fs: '🎤🎶' }], [0.8, { sp: '-', v: 'happy', fv: '🎶😊' }]], // roda: the musician beats the pandeiro and sings, the circle claps along
};
const IX_DEF = [[0.1, { s: 'talk' }], [0.4, { v: 'talk' }], [0.7, { s: 'show' }], [0.9, { v: 'happy' }]]; // anything without its own scene
const _ixw = new THREE.Vector3();
function ixClip(av, verb, sit) { const p = av.userData.p; if (!p || !p.anim || !verb) return; const m = IXV[verb]; p.anim.set(m ? m[sit ? 0 : 1] : verb); }
function ixHold(av, list, name) { // one object at a time in that hand
  for (const k of list.splice(0)) holdProp(av, 'ix_' + k, false);
  if (name && name !== '-' && IXP[name]) { holdProp(av, 'ix_' + name, true, IXP[name]); const g = av.userData['ix_' + name]; if (g) g.scale.multiplyScalar(1.7); list.push(name); } // larger than life, to read from the game camera
}
// ---- the kid (Parent Pod): walks to a corner of the room, then sits, lies, plays, runs… Its world position is kept here and turned into
// the parent's local frame each frame (the kid stays a child of the parent, so it leaves with them).
const _ixq = new THREE.Quaternion(), _ixq2 = new THREE.Quaternion(), _ixY = new THREE.Vector3(0, 1, 0), _ixX = new THREE.Vector3(1, 0, 0), _ixh = new THREE.Vector3();
const KID_H = { sitchair: 0.4, write: 0.4, tower: 0.4, sitfloor: 0.16, play: 0.16, floor: 0.13, sleep: 0.13 }; // hips height above the floor
const KID_LIE = new Set(['floor', 'sleep']);
function ixKidAnim(kid, st) { const k = kid.userData, pa = k.p && k.p.anim; if (pa) { pa.set(st === 'run' ? 'walk' : st, st === 'run' ? 1.25 : 1); return; } if (k.p) { if (st === 'sit') poseSit(k.p); else poseStand(k.p); } }
function ixKidAct(v, kid, what) { // the action itself, once the kid is where it should be
  const k = kid.userData; k.ix = what; k.ixT = 0; if (k.blocks) k.blocks.visible = false;
  if (k.cush) k.cush.visible = false;
  if (KID_LIE.has(what)) { ixKidAnim(kid, 'idle'); if (what === 'sleep') { if (!k.cush) { k.cush = put(rbox(0.5, 0.12, 0.4, '#FF8FAB', 0.05), 0, 0, 0, scene); } k.cush.visible = true; } }
  else if (what === 'sitchair' || what === 'sitfloor' || what === 'write') ixKidAnim(kid, 'sit');
  else if (what === 'play' || what === 'tower') { ixKidAnim(kid, 'sit'); if (!k.blocks) { const b = k.blocks = new THREE.Group(); for (let i = 0; i < 3; i++) put(rbox(0.12, 0.12, 0.12, ['#E5484D', '#5AB8F0', '#FFD25E'][i], 0.02), 0, 0.06 + i * 0.125, 0, b); scene.add(b); } k.blocks.visible = true; k.blocks.children.forEach((c, i) => c.visible = what === 'play' || i === 0); }
  else ixKidAnim(kid, { run: 'run', angry: 'IdleAngry', sad: 'IdleHead', happy: 'cheer', pickup: 'pickup', stand: 'idle', home: 'idle' }[what] || 'idle');
}
function ixKid(v, kid, what, at) {
  const k = kid.userData, pts = v.rspot && v.rspot.pts;
  if (!k.wp) { kid.getWorldPosition(_ixw); k.wp = _ixw.clone(); k.face = v.av.rotation.y; }
  let goal = null;
  if (what === 'home') { k.goHome = true; goal = 'home'; }
  else if (at && pts && pts[at]) goal = pts[at];
  if (goal) { k.goal = goal; k.next = what; ixKidAnim(kid, 'walk'); k.ix = 'walk'; if (k.blocks) k.blocks.visible = false; if (k.cush) k.cush.visible = false; }
  else ixKidAct(v, kid, what);
}
function ixKidTick(v, kid, dt) {
  const k = kid.userData, av = v.av; if (!k.ix) return; k.ixT = (k.ixT || 0) + dt;
  if (!k.home) k.home = kid.position.clone();
  if (!k.wp) { kid.getWorldPosition(_ixw); k.wp = _ixw.clone(); k.face = av.rotation.y; }
  const homeW = av.localToWorld(_ixh.set(k.home.x, 0, k.home.z));
  if (k.goal) { // walking there
    const gx = k.goal === 'home' ? homeW.x : k.goal.x, gz = k.goal === 'home' ? homeW.z : k.goal.z, dx = gx - k.wp.x, dz = gz - k.wp.z, d = Math.hypot(dx, dz), stp = 1.3 * dt;
    if (d > 0.02) k.face = Math.atan2(dx, dz);
    if (d <= stp) { k.wp.x = gx; k.wp.z = gz; const g = k.goal; k.goal = null; if (g === 'home') { k.ix = null; kid.quaternion.identity(); kid.position.copy(k.home); ixKidAnim(kid, 'idle'); return; } k.face = g.rot ?? k.face; ixKidAct(v, kid, k.next); }
    else { k.wp.x += dx / d * stp; k.wp.z += dz / d * stp; }
  } else if (k.ix === 'run') { const c = (v.rspot.pts && v.rspot.pts.mat) || homeW, a = k.ixT * 2.2, r = 0.6; const nx = c.x + Math.cos(a) * r, nz = c.z + Math.sin(a) * r; k.face = Math.atan2(nx - k.wp.x, nz - k.wp.z); k.wp.x = nx; k.wp.z = nz; }
  // into the parent's frame: position, then yaw (and lying down) as a quaternion
  _ixw.set(k.wp.x, 0, k.wp.z); av.worldToLocal(_ixw); kid.position.x = _ixw.x; kid.position.z = _ixw.z;
  _ixq.setFromAxisAngle(_ixY, k.face - av.rotation.y); if (KID_LIE.has(k.ix)) _ixq.multiply(_ixq2.setFromAxisAngle(_ixX, -Math.PI / 2)); kid.quaternion.copy(_ixq);
  const sy = av.scale.y || 1, hh = KID_H[k.ix];
  if (hh == null) kid.position.y = (0.02 - av.position.y) / sy;
  else { if (k.hips === undefined) { k.hips = null; kid.traverse((b) => { if (!k.hips && b.isBone && /hips/i.test(b.name)) k.hips = b; }); }
    if (k.hips) { kid.updateMatrixWorld(true); k.hips.getWorldPosition(_ixh); kid.position.y += (hh - _ixh.y) / sy; }
    else kid.position.y = ((KID_LIE.has(k.ix) ? 0.12 : hh - 0.45 * kid.scale.y * sy) - av.position.y) / sy; } // simple kid: its own legs fold
  if (k.blocks && k.blocks.visible) { const pts = v.rspot.pts || {}, onT = k.ix === 'tower' && pts.table; const bx = onT ? pts.table.x : k.wp.x + Math.sin(k.face) * 0.38, bz = onT ? pts.table.z : k.wp.z + Math.cos(k.face) * 0.38; k.blocks.position.set(bx, onT ? 0.45 : 0.12, bz);
    if (k.ix === 'tower') k.blocks.children.forEach((c, i) => c.visible = k.ixT > i * 1.2); }
  if (k.cush && k.cush.visible) { k.cush.position.set(k.wp.x - Math.sin(k.face) * 0.55, 0.16, k.wp.z - Math.cos(k.face) * 0.55); k.cush.rotation.y = k.face; }
}
// a simple (non-animated) kid made while the kid models were still loading: swapped for a real one as soon as they are in
function ixKidUpgrade(v) {
  const gg = v.gag, old = gg && gg.userData.kid; if (!old || old.userData.p.glb || !v.av.userData.p.glb) return;
  const kk = ['v25', 'v26', 'v27', 'v28'].filter((k) => CHAR.A.full[k]); if (!kk.length) return;
  const key = v.look.kid && CHAR.A.full[v.look.kid] ? v.look.kid : kk[(v.look.vm || 'v').charCodeAt(2) % kk.length]; const kid = person({ vm: key }, 'visitor'); if (!kid.userData.p.glb) return;
  kid.position.set(0.6, 0, 0.15); v.av.add(kid); kid.traverse((m) => { if (m.isMesh) m.userData.owner = v.av; });
  const o = old.userData; if (o.ix) { const n = kid.userData; n.wp = o.wp; n.face = o.face; n.goal = o.goal; n.next = o.next; n.home = kid.position.clone(); if (o.blocks) o.blocks.visible = false; if (o.cush) o.cush.visible = false; if (o.goal) { n.ix = 'walk'; ixKidAnim(kid, 'walk'); } else ixKidAct(v, kid, o.ix); }
  old.parent && old.parent.remove(old); gg.userData.kid = kid;
}
// ---- the carer walks over (to the board, the client, the kids' corner…) and comes back to their seat
function ixPoint(v, st, room, where) {
  const pts = (v.rspot && v.rspot.pts) || {}, c = v.av.position;
  if (where === 'near') { const dx = st.av.position.x - c.x, dz = st.av.position.z - c.z, d = Math.hypot(dx, dz) || 1; const x = c.x + dx / d * 0.75, z = c.z + dz / d * 0.75; return { x, z, rot: Math.atan2(c.x - x, c.z - z) }; }
  if (pts[where]) return pts[where];
  if (where.startsWith('piece:')) { const re = new RegExp(where.slice(6), 'i'); let hit = null; room.g.traverse((o) => { if (!hit && (re.test(o.name || '') || re.test(o.userData.glb || '') || re.test(o.userData.kit || ''))) hit = o; });
    if (hit) { _fb.setFromObject(hit); const cx = (_fb.min.x + _fb.max.x) / 2, cz = (_fb.min.z + _fb.max.z) / 2, dx = c.x - cx, dz = c.z - cz, d = Math.hypot(dx, dz) || 1, x = cx + dx / d * 0.8, z = cz + dz / d * 0.8; return { x, z, rot: Math.atan2(cx - x, cz - z) }; } }
  return null;
}
// a carer's few steps inside their own room: a small A* on a 15 cm grid of the room, around the furniture (room.obs), then
// straightened where the way is clear. The start and the goal may sit inside a piece (their own chair, the shelf they reach for).
function ixRoute(room, from, to, pad = 0.2) {
  const q = roomRect(room.def), C = 0.15, x0 = q.x0 + 0.22, z0 = q.z0 + 0.22, nx = Math.max(2, Math.floor((q.x1 - q.x0 - 0.44) / C)), nz = Math.max(2, Math.floor((q.z1 - q.z0 - 0.44) / C));
  const cell = (x, z) => [clamp(Math.round((x - x0) / C), 0, nx), clamp(Math.round((z - z0) / C), 0, nz)], pos = (i, j) => ({ x: x0 + i * C, z: z0 + j * C });
  const obs = room.obs || [], blocked = new Uint8Array((nx + 1) * (nz + 1));
  for (let j = 0; j <= nz; j++) for (let i = 0; i <= nx; i++) { const p = pos(i, j); if (Math.hypot(p.x - from.x, p.z - from.z) < 0.5 || Math.hypot(p.x - to.x, p.z - to.z) < 0.5) continue;
    for (const b of obs) if (p.x > b[0] - pad && p.x < b[1] + pad && p.z > b[2] - pad && p.z < b[3] + pad) { blocked[j * (nx + 1) + i] = 1; break; } }
  const [si, sj] = cell(from.x, from.z), [ti, tj] = cell(to.x, to.z), W1 = nx + 1, N = W1 * (nz + 1), g = new Float32Array(N).fill(1e9), par = new Int32Array(N).fill(-1), done = new Uint8Array(N);
  const s0 = sj * W1 + si, t0 = tj * W1 + ti; g[s0] = 0; const open = [s0];
  while (open.length) { let bi = 0, bf = 1e9; for (let k = 0; k < open.length; k++) { const c = open[k], ci2 = c % W1, f = g[c] + Math.hypot(ti - ci2, tj - (c - ci2) / W1); if (f < bf) { bf = f; bi = k; } }
    const c = open.splice(bi, 1)[0]; if (done[c]) continue; done[c] = 1; if (c === t0) break; const i = c % W1, j = (c - i) / W1;
    for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const ni = i + di, nj = j + dj; if (ni < 0 || nj < 0 || ni > nx || nj > nz) continue; const n = nj * W1 + ni; if (blocked[n] || done[n]) continue;
      if (di && dj && (blocked[j * W1 + ni] || blocked[nj * W1 + i])) continue; const ng = g[c] + (di && dj ? 1.414 : 1); if (ng < g[n]) { g[n] = ng; par[n] = c; open.push(n); } } }
  let tg = t0; if (par[t0] < 0 && t0 !== s0) { if (pad > 0.1) return ixRoute(room, from, to, 0.06); // tight: hug the furniture closer
    let bd = 1e9; for (let c = 0; c < N; c++) if (done[c]) { const ci2 = c % W1, dd = Math.hypot(ti - ci2, tj - (c - ci2) / W1); if (dd < bd) { bd = dd; tg = c; } } } // still no way: as close as it gets, then the last step
  const cells = []; for (let c = tg; c >= 0 && c !== s0; c = par[c]) cells.push(c); cells.reverse();
  const clear = (a, b) => { const n = Math.ceil(Math.hypot(b.x - a.x, b.z - a.z) / 0.07); for (let k = 1; k < n; k++) { const [i, j] = cell(a.x + (b.x - a.x) * k / n, a.z + (b.z - a.z) * k / n); if (blocked[j * W1 + i]) return false; } return true; };
  const pts = cells.map((c) => pos(c % W1, (c - c % W1) / W1)); pts.push({ x: to.x, z: to.z });
  const out = []; let a = { x: from.x, z: from.z }, k = 0; while (k < pts.length) { let far = k; for (let m = pts.length - 1; m > k; m--) if (clear(a, pts[m])) { far = m; break; } out.push(pts[far]); a = pts[far]; k = far + 1; }
  return out;
}
function ixGo(v, st, room, where, pose) {
  if (where === 'home') { if (st.ixGo && !st.ixGo.back) st.ixGo = { back: true, av: st.av, ph: 0, path: ixRoute(room, st.av.position, st.target) }; return; } // a few steps inside the room, round the furniture (the house walk grid would send them out by the door)
  const p = ixPoint(v, st, room, where) || (where !== 'near' ? ixPoint(v, st, room, 'near') : null); if (!p) return;
  st.ixGo = { av: st.av, ph: 0, path: ixRoute(room, st.av.position, p), face: p.rot, pose }; poseStand(st.av.userData.p);
}
function ixStaffWalk(rs, dt) { // from staffAttend: true while the carer is away from their spot for a scene
  const G = rs.ixGo; if (!G) return false;
  if (G.path.length) { stepWalker(G, dt, 2.2); return true; }
  if (G.back) { rs.ixGo = null; settle(rs, rs.target); rs.busyPose = null; return false; }
  if (!G.arrived) { G.arrived = true; const p = rs.av.userData.p; if (p.anim) p.anim.set(G.pose ? (IXV[G.pose] ? IXV[G.pose][1] : G.pose) : 'idle'); }
  if (G.face != null) turnTo(rs.av, G.face, dt, 6); rs.av.position.y = 0.1 + liftAt(rs.av.position.x, rs.av.position.z); return true;
}
function ixFloat(o, txt) { if (!o || !txt) return; o.getWorldPosition(_ixw); floatAt(_ixw, txt); }
function ixTick(v, st, room, dt) {
  if (!v.ix) { v.ix = { i: 0, beats: IX[v.prob] || IX_DEF, vp: [], sp: [], kp: [], st, sit: !!(v.rspot && v.rspot.sit && !v.rspot.lie), lie: !!(v.rspot && v.rspot.lie), ssit: !!(st.target && st.target.sit), sc: v.av.scale.y, chair: !!(v.look && VIS[v.look.vm] && VIS[v.look.vm].chair) }; }
  const X = v.ix, kid = v.gag && v.gag.userData.kid;
  while (X.i < X.beats.length && v.prog >= X.beats[X.i][0]) {
    const b = X.beats[X.i++][1];
    if (b.stand) { poseStand(v.av.userData.p); v.av.position.y = 0.1; X.sit = false; X.stood = true; }
    if (b.sitback) { settle(v, v.rspot); X.sit = !!v.rspot.sit; X.stood = false; }
    if (b.mat != null) X.mat = b.mat;
    if (b.v && !X.lie && !X.chair && !X.mat) ixClip(v.av, b.v, X.sit); // (wheelchair users keep their own clip)
    if (b.go && st.av) ixGo(v, st, room, b.go, b.s);
    if (b.s && st.av) { const away = st.ixGo && !st.ixGo.back; if (away) { if (st.ixGo.arrived && st.av.userData.p.anim) st.av.userData.p.anim.set(IXV[b.s] ? IXV[b.s][1] : b.s); else st.ixGo.pose = b.s; } else st.ixPose = 'ix:' + (IXV[b.s] ? IXV[b.s][X.ssit ? 0 : 1] : b.s); }
    if (b.vp) ixHold(v.av, X.vp, b.vp);
    if (b.sp && st.av) ixHold(st.av, X.sp, b.sp);
    if (b.kp && kid) ixHold(kid, X.kp, b.kp);
    if (b.fv) ixFloat(v.av, b.fv); if (b.fs && st.av) ixFloat(st.av, b.fs);
    if (b.gag === 'off' && v.gag) for (const c of v.gag.children) if (c !== kid && !c.userData.ixKeep) c.visible = false;
    if (b.box === 'tidy' && v.gag) v.gag.traverse((o) => { if (o.isMesh && o.material && !o.userData.ixTaped) { o.userData.ixTaped = true; o.material = o.material.clone(); o.material.color.set('#E3C590'); } });
    if (b.shake != null) X.shake = b.shake; if (b.melt != null) X.melt = b.melt;
    if (kid && b.k) ixKid(v, kid, b.k, b.kat); if (kid && b.fk) ixFloat(kid, b.fk);
  }
  if (kid) { ixKidUpgrade(v); const k2 = v.gag.userData.kid; if (k2.userData.ix) ixKidTick(v, k2, dt);
    // the parent keeps an eye on the kid: a glance over every few seconds
    X.gl = (X.gl || 0) + dt; if (X.gl > 5.5 && !X.lie) { X.gl = 0; X.look = 1.6; } if (X.look > 0) { X.look -= dt; const kw = k2.userData.wp; if (kw) turnTo(v.av, Math.atan2(kw.x - v.av.position.x, kw.z - v.av.position.z), dt, 5); } }
  if (X.mat) { // yoga: lying flat on the mat (savasana)
    const r = v.rspot.rot || 0; v.av.quaternion.setFromAxisAngle(_ixY, r).multiply(_ixq2.setFromAxisAngle(_ixX, -Math.PI / 2)); v.av.position.set(v.rspot.x + Math.sin(r) * 0.78 * v.av.scale.y, 0.17, v.rspot.z + Math.cos(r) * 0.78 * v.av.scale.y); // body centred on the mat
    const p = v.av.userData.p; if (p.anim && p.anim.state !== 'idle') p.anim.set('idle'); X.wasMat = true; }
  else if (X.wasMat) { X.wasMat = false; v.av.quaternion.identity(); v.av.rotation.set(0, v.rspot.rot || 0, 0); if (X.stood) { poseStand(v.av.userData.p); v.av.position.set(v.rspot.x, 0.1, v.rspot.z); } else settle(v, v.rspot); }
  if (X.shake) v.av.rotation.z = Math.sin(performance.now() / 28) * 0.05; else if (v.av.rotation.z && !X.mat) v.av.rotation.z = 0;
  if (X.melt != null) { X.m = (X.m || 0) + ((X.melt ? 1 : 0) - (X.m || 0)) * Math.min(1, dt * 3); v.av.scale.y = X.sc * (1 - 0.35 * X.m); v.av.scale.x = v.av.scale.z = X.sc * (1 + 0.15 * X.m); }
}
function ixEnd(v) { // session over (cured, or the carer left): everything back to normal
  const X = v.ix; if (!X) return; v.ix = null;
  ixHold(v.av, X.vp, null); if (X.st && X.st.av) { ixHold(X.st.av, X.sp, null); X.st.ixPose = null; if (X.st.ixGo && !X.st.ixGo.back) { const rm = R.rooms[X.st.at]; X.st.ixGo = { back: true, av: X.st.av, ph: 0, path: rm ? ixRoute(rm, X.st.av.position, X.st.target) : [{ x: X.st.target.x, z: X.st.target.z }] }; } }
  if (X.wasMat) { v.av.quaternion.identity(); v.av.rotation.set(0, (v.rspot && v.rspot.rot) || v.av.rotation.y, 0); }
  v.av.rotation.z = 0; v.av.rotation.x = 0; if (X.m) { v.av.scale.setScalar(X.sc); }
  if (X.stood || X.wasMat) { v.av.position.y = 0.1; poseStand(v.av.userData.p); }
  const kid = v.gag && v.gag.userData.kid; if (kid) { ixHold(kid, X.kp, null); const k = kid.userData; k.ix = null; k.goal = null; k.wp = null; kid.quaternion.identity(); if (k.home) kid.position.copy(k.home); if (k.blocks) k.blocks.visible = false; if (k.cush) k.cush.visible = false; ixKidAnim(kid, 'idle'); }
}
function finishCheckin(v, quiet) {
  v.known = true; if (!v.diag) probSeen(v.prob); v.icon.material = iconTex(isMystK(v.prob) || v.diag ? '❓' : PROBLEMS[v.prob].e); for (const q of R.deskQs) { const qi = q.indexOf(v); if (qi >= 0) q.splice(qi, 1); }
  if (!quiet && isMystK(v.prob)) { S.mystSeen = S.mystSeen || []; if (!S.mystSeen.includes(v.prob)) { S.mystSeen.push(v.prob); chat(t('research.title'), t('myst.chat'), '❓'); } }
  if (!quiet && cafeOpen()) { const tip = done('oat') ? 12 : 8; S.cash += tip; S.earned += tip; v.spent = (v.spent || 0) + tip; }
  v.target = pickRoomFor(v); seatVisitor(v);
  const need = needOf(v); if (!quiet && need && !hasRoom(need) && S.mode === 'career' && S.tut < 0) { S.askNR = S.askNR || {}; if (S.askNR[need] !== S.day) { S.askNR[need] = S.day; chat(t('from.hq'), t('ct.r.msg', { name: v.name, prob: pn(v.prob), room: rn(need) }), '🚪', { act: { k: 'noRoom', room: need } }); } }
}
// when every seat and standing place inside is taken, people wait in tidy rows on the plaza outside the entrance (one place
// each, never on top of each other); when those are full too, newcomers see the full house and turn back (a crowd complaint)
const OVERFLOW = []; for (const z of [7.45, 8.2]) for (let x = 0.9; x <= 5.8; x += 0.7) OVERFLOW.push({ x, z, rot: Math.PI, sit: false, y: 0, busy: null, out: true });
// ---- lines for the café counter and the mini-market till: when every place is taken, people queue inside the room (a few spots in front of the counter)
const LINE_CAP = { s: 3, m: 5, l: 7 };
function linePts(room) {
  if (room.linePts) return room.linePts;
  const sp = room.spots.filter((s) => !s.lie), q = roomRect(room.def), out = [];
  if (!sp.length) return (room.linePts = out);
  const ax = sp.reduce((a, s) => a + s.x, 0) / sp.length, z0 = Math.max(...sp.map((s) => s.z));
  for (let k = 0; k < 10 && out.length < LINE_CAP[room.size] + 2; k++) for (const xo of [0, 0.75, -0.75]) {
    const x = ax + xo, z = z0 + 0.8 + 0.7 * k; if (x < q.x0 + 0.4 || x > q.x1 - 0.4 || z < q.z0 + 0.4 || z > q.z1 - 0.4) continue;
    const [i, j] = ci(x, z); if (!free(gridBlk, i, j) || sp.some((s) => Math.hypot(s.x - x, s.z - z) < 0.5)) continue; out.push({ x, z, rot: Math.PI }); }
  return (room.linePts = out.slice(0, LINE_CAP[room.size]));
}
function joinLine(v, room, kind) {
  const pts = linePts(room), Q = (room.lineQ = room.lineQ || []); if (Q.length >= pts.length) { if (!v.cured && !v.lineFullCmp) { v.lineFullCmp = true; logComplaint(kind === 'cafe' ? 'cafeq' : 'queue'); floatAt(v.av.position, '😤'); } return false; }
  if (v.spot) { v.spot.busy = null; v.spot = null; }
  Q.push(v); v.lineT = 0; v.lineRoom = room.id; v.lineKind = kind; v.linePt = pts[Q.length - 1]; setPath(v, findPath(v.av.position, v.linePt)); v.state = 'toLine';
  v.icon.material = iconTex(kind === 'cafe' ? '🍵' : '🛒'); return true;
}
function lineDrop(v) { const room = R.rooms[v.lineRoom]; v.lineRoom = null; if (!room || !room.lineQ) return; const i = room.lineQ.indexOf(v); if (i < 0) return; room.lineQ.splice(i, 1);
  const pts = linePts(room); room.lineQ.forEach((o, k) => { const np = pts[k]; if (np && o.linePt !== np) { o.linePt = np; if (o.state === 'line' || o.state === 'toLine') { setPath(o, findPath(o.av.position, np)); o.state = 'toLine'; } } }); }
function lineTick(v, dt) {
  v.lineT = (v.lineT || 0) + dt; if (!v.lineCmp && !v.cured && v.lineT > 20) { v.lineCmp = true; logComplaint(v.lineKind === 'cafe' ? 'cafeq' : 'queue'); floatAt(v.av.position, '⏳'); } // a complaint only after 20 s in the line
  const room = R.rooms[v.lineRoom]; if (!room || room.closed) { lineDrop(v); if (v.cured) { setPath(v, exitPath(v)); v.state = 'exit'; } else seatVisitor(v); return; }
  if (!v.cured) { const need = needOf(v); if (need && Object.values(R.rooms).some((r) => r.type === need && !r.closed && r.spots.some((s) => !s.busy) && r.staff.some((x) => x && x.mode === 'there'))) { lineDrop(v); seatVisitor(v); return; } } // their room is free: they leave the line
  if (room.lineQ[0] !== v) return;
  const sp = room.spots.find((s) => !s.busy && (v.lineKind !== 'cafe' || s.cafe)); if (!sp) return;
  lineDrop(v); sp.busy = v;
  if (v.lineKind === 'cafe') { v.lspot = sp; setPath(v, findPath(v.av.position, sp)); v.state = 'toCafe'; } else { v.sspot = sp; setPath(v, findPath(v.av.position, sp)); v.state = 'toShop'; }
}
// Clients who already know which room they need wait right outside its door (standing, to either side of the doorway, so the way in stays clear),
// so the player sees who is waiting for what; the lobby seats are for the others and for when that spot by the door is full.
function nearRoomSpot(v) {
  const room = v.target != null && R.rooms[v.target]; if (!room || room.closed) return null;
  if (!room.waitPts) { const r = room.def, d0 = doorPt(r, 0), c = { x: room.cx, z: room.cz }, L = Math.hypot(d0.x - c.x, d0.z - c.z) || 1, nx = (d0.x - c.x) / L, nz = (d0.z - c.z) / L, tx = -nz, tz = nx;
    room.waitPts = []; for (const [d, lat] of [[1.05, 0.85], [1.05, -0.85], [1.05, 1.6], [1.05, -1.6], [1.8, 0.85], [1.8, -0.85]]) { const x = d0.x + nx * d + tx * lat, z = d0.z + nz * d + tz * lat; room.waitPts.push({ x, z, rot: Math.atan2(d0.x - x, d0.z - z), sit: false, y: 0, busy: null, near: room.id }); } }
  const okPt = (p) => { if (!inFloor(p.x, p.z)) return false; const [i, j] = ci(p.x, p.z); if (!free(gridBlk, i, j)) return false;
    return !S.rooms.some((o) => { const q = roomRect(o); return p.x > q.x0 - 0.3 && p.x < q.x1 + 0.3 && p.z > q.z0 - 0.3 && p.z < q.z1 + 0.3; }) && !desks().some((D) => Math.hypot(p.x - D.x, p.z - D.z) < 1.5); };
  for (const p of room.waitPts) { if (p.busy && !R.visitors.includes(p.busy)) p.busy = null; if (!p.busy && okPt(p)) return p; }
  return null;
}
// a free bench seat near the door of the room they wait for comes first: sitting beats standing
function benchFor(v) {
  const room = v.target != null && R.rooms[v.target]; if (!room || room.closed) return null; const d0 = doorPt(room.def, 0.5); let best = null, bd = 8;
  for (const w of WAIT_SPOTS) { if (!w.bench) continue; if (w.busy && !R.visitors.includes(w.busy)) w.busy = null; if (w.busy) continue; const d = Math.hypot(w.x - d0.x, w.z - d0.z); if (d < bd) { bd = d; best = w; } }
  return best;
}
const waitSpotFor = (v) => benchFor(v) || nearRoomSpot(v) || WAIT_SPOTS.find((s) => !s.busy && !s.blocked);
function seatVisitor(v) {
  const spot = waitSpotFor(v) || OVERFLOW.find((s) => !s.busy || !R.visitors.includes(s.busy)); v.prog = 0;
  if (!spot) { floatAt(v.av.position, '🚪 ' + t('cmp.crowd')); v.crowdOut = true; leave(v, false); return; }
  spot.busy = v; v.spot = spot; setPath(v, findPath(v.av.position, spot));
  v.state = 'toWait';
}
// a wait told in the game's own time (a day lasts DAY_LEN seconds), not in real minutes
function gameDur(sec) { const h = sec / DAY_LEN * 24; if (h < 1.5) return t('dur.h1'); if (h < 23.5) return t('dur.h', { n: Math.round(h) }); const d = Math.round(h / 24); return d <= 1 ? t('dur.d1') : t('dur.d', { n: d }); }
const hostHere = (sp) => { const r = sp && roomOfSpot(sp); return !!(r && r.staff.some((x) => x && x.mode === 'there')); }; // the shop's till and the café need their host in the room
const needOf = (v) => (v.diag ? 'therapy' : isMystK(v.prob) ? null : PROBLEMS[v.prob].room);
function roomQ(id) { return R.visitors.filter((v) => v.target === id && (v.state === 'wait' || v.state === 'toWait')); }
function pickRoomFor(v) { const need = needOf(v); if (!need) return null; const rs = Object.values(R.rooms).filter((r) => r.type === need); if (!rs.length) return null; rs.sort((a, b) => (roomQ(a.id).length - a.spots.length) - (roomQ(b.id).length - b.spots.length)); return rs[0].id; }
function roomNo(room) { const same = S.rooms.filter((r) => r.type === room.type); return same.length > 1 ? ' #' + (same.findIndex((r) => r.id === room.id) + 1) : ''; }
function splitQueue(id) {
  const room = R.rooms[id]; if (!room) return 0; const others = Object.values(R.rooms).filter((r) => r.type === room.type && r.id !== id); if (!others.length) return 0;
  const q = roomQ(id), n = Math.floor(q.length / 2); let moved = 0;
  for (const v of q.slice(q.length - n)) { others.sort((a, b) => roomQ(a.id).length - roomQ(b.id).length); v.target = others[0].id; moved++; }
  return moved;
}
const QMAX = 11;
function joinQueue(v) { // shortest staffed line wins
  let di = 0, best = 1e9; desks().forEach((_, k) => { const sc = DQ(k).length + (deskHost(k) ? 0 : 50) + (k ? 0.5 : 0); if (sc < best) { best = sc; di = k; } });
  if (DQ(di).length >= QMAX && !v.em) { floatAt(v.av.position, '🙅 ' + t('cmp.queue')); v.state = 'queue'; leave(v, false); return; } // the line would spill into the street: they turn back
  v.desk = di; DQ(di).push(v); const q = QUEUE(DQ(di).length - 1, di); setPath(v, findPath(v.av.position, q)); v.state = 'toQueue'; }
function setPath(v, pts) { v.path = pts.slice(); poseStand(v.av.userData.p); }
let doomers = [];
// raised floors people can walk onto (the lucha ring): height of the floor under a point, 0 on the plain floor. The ring is a 25%-of-its-size platform
// reached by its little stairs (front right of the model); the stairs ramp down from the canvas to the floor
function liftAt(x, z) { if (!R.rooms) return 0;
  for (const rm of Object.values(R.rooms)) for (const L of rm.rings || []) { const X = x - L.ox, Z = z - L.oz, u = (X * L.ax[0] + Z * L.ax[1]) / L.k, w = (X * L.az[0] + Z * L.az[1]) / L.k;
    if (Math.abs(u) < 0.43 && w > -0.46 && w < 0.29) return 0.25 * L.k; if (u > 0.15 && u < 0.44 && w >= 0.29 && w < 0.52) return 0.25 * L.k * (1 - (w - 0.29) / 0.23 * 0.85); }
  return 0; }
function stepWalker(o, dt, speed) {
  if (!o.path.length) return true;
  // match ground speed to the character's own stride so feet don't skate: a slow tired shuffle moves slowly, a hurry only speeds the legs up so far
  const an = o.av.userData.p.anim, nw = an && an.stride ? an.stride() : 0;
  if (nw) speed = Math.min(speed * clamp(nw / 1.25, 0.5, 1.3), nw * (speed > 2.6 ? 2.2 : 1.9));
  if (doomers.length && !doomers.includes(o)) for (const u of doomers) if (Math.hypot(u.av.position.x - o.av.position.x, u.av.position.z - o.av.position.z) < 0.8) { speed *= 0.45; break; } // stuck behind someone staring at their phone
  const p = o.path[0], pos = o.av.position;
  const dx = p.x - pos.x, dz = p.z - pos.z, d = Math.hypot(dx, dz);
  // turn before walking off: a big heading change slows the step until the body faces the way it goes (no crab-walking at path corners)
  const tw = d > 0.001 ? Math.abs((((Math.atan2(dx, dz) - o.av.rotation.y) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI) : 0, step = speed * dt * (tw > 0.5 ? Math.max(0.12, Math.cos(Math.min(tw, 1.45))) : 1);
  if (d <= step) { pos.x = p.x; pos.z = p.z; o.path.shift(); } else { pos.x += dx / d * step; pos.z += dz / d * step; }
  if (d > 0.001) { const a = Math.atan2(dx, dz); let r = o.av.rotation.y; r += ((((a - r) % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 14); o.av.rotation.y = ((r + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; }
  o.ph += dt * speed * 4.2; poseWalk(o.av.userData.p, o.ph, 0.55, speed); pos.y = 0.1 + liftAt(pos.x, pos.z);
  return !o.path.length;
}
// Seats come in many heights (sofas, benches, booth chairs, the host's chair, models swapped in later), so a sitter is placed
// on the real surface under the seat point instead of a hand-tuned number: hips rest on the cushion, never in it or above it.
const seatRay = new THREE.Raycaster(), DOWN = new THREE.Vector3(0, -1, 0), HIP_SIT = 0.67, HIP_PAD = 0.09;
function seatTop(x, z, self, guess) {
  seatRay.set(new THREE.Vector3(x, 1.05, z), DOWN); seatRay.far = 1.0; seatRay.camera = cam; let best = null;
  for (const h of seatRay.intersectObjects(scene.children, true)) {
    const m = h.object; if (!m.isMesh || m.isSkinnedMesh || !m.visible || h.point.y < 0.3 || h.point.y > 0.9) continue;
    let a = m, mine = false; while (a) { if (a === self || (a.userData.p && a.userData.p.body)) { mine = true; break; } a = a.parent; } if (mine) continue; // people are not seats
    if (best == null || Math.abs(h.point.y - guess) < Math.abs(best - guess)) best = h.point.y; // a table edge above the seat loses to the cushion
  }
  return best != null && Math.abs(best - guess) < 0.25 ? best : null;
}
function settle(o, spot) {
  o.av.position.set(spot.x, 0.1 + (spot.y || 0), spot.z); o.av.rotation.y = spot.rot || 0; const p = o.av.userData.p; poseStand(p);
  if (!spot.sit) return;
  poseSit(p, spot.lie); o.av.position.y -= 0.05;
  if (!spot.lie && p.anim) { const top = seatTop(spot.x, spot.z, o.av, o.av.position.y + HIP_SIT * o.av.scale.y - HIP_PAD); if (top != null) o.av.position.y = top + HIP_PAD - HIP_SIT * o.av.scale.y;
    const fw = 0.55 * (o.av.scale.y - 1) + 0.04, r = spot.rot || 0; o.av.position.x += Math.sin(r) * fw; o.av.position.z += Math.cos(r) * fw; } // bigger-than-life people: sit forward on the cushion, back against the backrest instead of inside it
}
// group rooms (nap, social…) already seat 2/4/6; one-on-one rooms (budget, career…) seat one client per station, so their
// bigger sizes work faster instead: M ≈ +70 %, L ≈ +50 % per station (two stations), so upgrading pays like it does for groups
const SOLO_SPD = { s: 1, m: 1.7, l: 1.5 };
const sizeSpd = (room) => (capOf(room.type, 'm') === 1 ? SOLO_SPD[room.size] || 1 : SIZES[room.size].spd || 1);
const hasRoom = (type) => S.rooms.some((r) => r.type === type);
function roomEarn(id, m) { if (!m || id == null || !S) return; const E = (S.rEarn = S.rEarn || {}), e = (E[id] = E[id] || {}); e[S.day] = (e[S.day] || 0) + m; for (const d in e) if (+d < S.day - 6) delete e[d]; }
const roomWeek = (id) => { const e = (S.rEarn || {})[id] || {}; let a = 0; for (const d in e) if (+d >= S.day - 6) a += e[d]; return a; };
const roomOfSpot = (sp) => (sp ? Object.values(R.rooms).find((r) => r.spots.includes(sp)) : null);
// ---- dirt: toilets get dirty everywhere; from city 2 treatment rooms and the café too. It shows on the floor and the furniture until the maintenance crew cleans it
const DIRT_COL = new THREE.Color('#6B5536'), DIRT_MAT = new Map();
const dirtOn = (room) => !!room && (!!ROOMS[room.type].loo || ((S.city || 'london') !== 'london' && (!!ROOMS[room.type].role || room.type === 'cafe')));
const dirtF = (room) => ((room.def.dirt || 0) >= 0.6 ? 0.8 : 1);
function dirtyMat(m, lv) { const k = m.uuid + ':' + lv; let d = DIRT_MAT.get(k); if (!d) { d = m.clone(); if (d.color) d.color.lerp(DIRT_COL, lv === 1 ? 0.3 : 0.5); if (d.roughness != null) d.roughness = Math.min(1, d.roughness + 0.2); DIRT_MAT.set(k, d); } return d; }
function addDirt(room, n) { if (!dirtOn(room)) return; room.def.dirt = Math.min(1, (room.def.dirt || 0) + n); applyDirt(room); }
function applyDirt(room) {
  const d = room.def.dirt || 0, lv = d < 0.35 ? 0 : d < 0.7 ? 1 : 2; if (room.dirtLv === lv || !room.g) return; room.dirtLv = lv;
  if (room.stains) { room.g.remove(room.stains); room.stains = null; }
  room.g.traverse((o) => { if (!o.isMesh || o.isInstancedMesh || !o.material || Array.isArray(o.material) || o.userData.stain) return; if (!o.userData.m0) o.userData.m0 = o.material; o.material = lv ? dirtyMat(o.userData.m0, lv) : o.userData.m0; });
  if (!lv) return;
  const sg = new THREE.Group(), q = roomRect(room.def), n = lv * 3 + (ROOMS[room.type].loo ? 2 : 0);
  for (let i = 0; i < n; i++) { const m = stainDecal((ROOMS[room.type].loo ? [7, 0, 4] : room.type === 'garage' ? [5, 5, 0] : room.type === 'cafe' ? [1, 2, 0] : [0, 4, 5, 1])[i % (ROOMS[room.type].loo || room.type === 'garage' || room.type === 'cafe' ? 3 : 4)], 0.55 + Math.random() * 0.35);
    m.position.set(q.x0 + 0.5 + Math.random() * Math.max(0.1, q.x1 - q.x0 - 1), 0.166, q.z0 + 0.5 + Math.random() * Math.max(0.1, q.z1 - q.z0 - 1)); m.userData.stain = true; sg.add(m); }
  if (lv === 2) { const fl = new THREE.Sprite(iconTex('🪰')); fl.scale.set(0.4, 0.4, 1); fl.position.set(room.cx, 1.7, room.cz); fl.userData.stain = true; sg.add(fl); }
  room.stains = sg; room.g.add(sg);
}
// ---- vibes = the centre's reputation. Every change goes through vb() so the panel can say what moved it; tiers change the game
const VB = {}; let vbHist = [], vbHistT = 0;
function vb(cat, d) { if (!S || !d) return; const v0 = S.vibes; S.vibes = clamp(S.vibes + d, 0, 100); const real = S.vibes - v0; VB[cat] = (VB[cat] || 0) + real; if (Math.abs(real) >= 3) vibePop(real); }
const VTIERS = [['bad', 0], ['normal', 30], ['good', 55], ['popular', 75], ['adored', 90]];
const vibeTier = () => { let k = 'normal'; for (const [n, lo] of VTIERS) if ((S ? S.vibes : 60) >= lo) k = n; return k; };
const TIER_FX = { bad: { spawn: 0.7, pat: 1.2, e: '😡' }, normal: { spawn: 1, pat: 1, e: '😐' }, good: { spawn: 1.1, pat: 1, e: '🙂' }, popular: { spawn: 1.25, pat: 1, e: '😍' }, adored: { spawn: 1.35, pat: 0.8, e: '🌟' } };
function vibePop(d) { const host = $('hVibes'); if (!host) return; const el = document.createElement('span'); el.textContent = (d > 0 ? '+' : '') + Math.round(d) + '%';
  el.style.cssText = `position:absolute;right:8px;top:-4px;font:800 14px Fredoka;color:${d > 0 ? '#1E8A3A' : '#E53E3E'};pointer-events:none;transition:transform 1.4s ease-out,opacity 1.4s;z-index:5`;
  const par = host.parentElement; par.style.position = 'relative'; par.appendChild(el); requestAnimationFrame(() => { el.style.transform = 'translateY(-22px)'; el.style.opacity = '0'; }); setTimeout(() => el.remove(), 1500); }
function vibeTick(dt) {
  if (!S || S.mode !== 'career') return;
  for (const k in VB) VB[k] *= Math.exp(-dt / 60); // the panel shows roughly the last minute
  vb('fade', (50 - S.vibes) * dt / 900); // a reputation needs upkeep: it drifts back toward 50 % (about -3 %/day at 80 %)
  const st = R.staff.filter((x) => x.data && x.data.energy != null); if (st.length >= 2 && st.reduce((a, x) => a + x.data.energy, 0) / st.length < 0.3) vb('staff', -0.005 * dt); // an exhausted team shows
  { const gi = S.stars, G = GOALS[gi]; S.hold = S.hold || {}; S.holdLow = S.holdLow || {}; S.holdDone = S.holdDone || {};
    if (G) for (const [m, v, days] of G.parts) { if (!days) continue; const k = holdKey(gi, m); if (heldOk(S, gi, m)) continue;
      if (metric(S, m) >= v) { S.hold[k] = (S.hold[k] || 0) + dt; S.holdLow[k] = 0; if (S.hold[k] >= vhNeed(gi, days)) { S.holdDone[k] = true; toast('★ ' + t('obj.held'), 3000); AU.sfx('cash'); } }
      else if ((S.holdLow[k] = (S.holdLow[k] || 0) + dt) > VH_GRACE) S.hold[k] = 0; } }
  if ((vbHistT += dt) >= 5) { vbHistT = 0; vbHist.push(S.vibes); if (vbHist.length > 12) vbHist.shift(); }
}
const vibeTrend = () => (vbHist.length < 3 ? 0 : S.vibes - vbHist[0]);
function openVibes() {
  const tier = vibeTier(), fx = TIER_FX[tier], spawnPct = Math.round((fx.spawn - 1) * 100), feeK = (0.7 + S.vibes / 200) / 0.95;
  const causes = Object.entries(VB).filter(([, d]) => Math.abs(d) >= 0.15).sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).slice(0, 4);
  const tiers = VTIERS.map(([k, lo], i) => `<div style="display:flex;justify-content:space-between;gap:8px;padding:3px 6px;border-radius:8px;${k === tier ? 'background:#FFF3CF;font-weight:900' : 'opacity:.75'}"><span>${TIER_FX[k].e} ${t('vb.t.' + k)} <small>(${lo}${VTIERS[i + 1] ? '–' + VTIERS[i + 1][1] : '+'} %)</small></span><span style="font-size:12px;text-align:right">${t('vb.fx.' + k)}</span></div>`).join('');
  openSheet(`<h2>${fx.e} ${t('vb.title')} · ${Math.round(S.vibes)} %</h2><p class="sub">${t('vb.sub')}</p>
    <div class="receipt"><div><span>👥 ${t('vb.visitors')}</span><b>${spawnPct >= 0 ? '+' : ''}${spawnPct} %</b></div><div><span>💵 ${t('vb.price')}</span><b>×${feeK.toFixed(2)}</b></div>${fx.pat !== 1 ? `<div><span>⏳ ${t('vb.patience')}</span><b>${fx.pat < 1 ? '+' : '−'}${Math.round(Math.abs(1 - fx.pat) * 100)} %</b></div>` : ''}</div>
    <div class="lbl" style="margin:10px 0 4px">${t('vb.why')}</div>${causes.length ? causes.map(([k, d]) => `<div style="display:flex;justify-content:space-between"><span>${t('vb.c.' + k)}</span><b style="color:${d > 0 ? '#1E8A3A' : '#E53E3E'}">${d > 0 ? '+' : ''}${d.toFixed(1)} %</b></div>`).join('') : `<div class="sub">${t('vb.calm')}</div>`}
    <div class="lbl" style="margin:10px 0 4px">${t('vb.tiers')}</div>${tiers}
    <button class="btn w" id="vbTemp" style="width:100%;margin-top:10px">🌡️ ${t('tp.title')}</button>`);
  $('vbTemp').onclick = () => openTemp();
}
const cafeOpen = () => Object.values(R.rooms).some((r) => r.type === 'cafe' && !r.closed && r.staff.some((s) => s && s.mode === 'there'));
const POWER = { s: 20, m: 35, l: 55 }, POWER_X = { lab: 40, cafe: 20, glowup: 10, toilet: -10 };
function elecPerDay() { let e = 0; for (const r of S.rooms) e += POWER[r.size] + (POWER_X[r.type] || 0); if (S.ac) e += 30; if (S.gen) e += 10; if (S.net) e += 8; if (S.gardenHeat) e += 15; if (S.gardenCool) e += 15; for (const d of S.decor || []) if (d.k === 'radiator') e += 20; else if (d.k === 'aircon') e += 30; e += 15 * (S.decor || []).filter((d) => d.k === 'vending' || d.k === 'neon' || d.k === 'massage').length; return e; }
const cafeF = () => Math.min(1, ...S.rooms.filter((r) => r.type === 'cafe').map((r) => SIZES[r.size].cafe));
const UNLOCK = { pharmacy: 1, pharmacist: 1, glowup: 2, career: 1, social: 1, parent: 1, maint: 0, therapy: 2, therapist: 2, moving: 2, lab: 2, researcher: 2, annex: 0 };
const localRoom = (k) => Object.values(PROBLEMS).some((p) => p.city && p.city === (S.city || 'london') && p.room === k);
// London is the simple first city: no Innovation Lab / research (and so no mystery cases) — they start in Lagos. A London save that already built a lab keeps it.
const noResearch = () => !!(S && S.mode === 'career' && !Array.isArray(S.known) && (S.city || 'london') === 'london' && !(S.rooms || []).some((r) => r.type === 'lab'));
const unlockedOld = (k) => (k === 'training' || k === 'trainer') ? epiCity() : !S || S.mode !== 'career' || ((k === 'lab' || k === 'researcher') && noResearch() ? false : localRoom(k) || (UNLOCK[k] || 0) <= S.stars);
// Discovery (every city after the London tutorial): ailments are found one by one through the talk room, and the care rooms they need are developed in the lab.
// Stars no longer open rooms there. S.known = ailments found, S.dev = rooms developed.
const DEV_ROOMS = { social: [300, 1500], parent: [360, 2000], career: [400, 2500], moving: [400, 2500], glowup: [440, 3000] }; // research points, cash
const FREE_ROLES = ['pharmacy', 'pharmacist', 'therapy', 'therapist', 'lab', 'researcher'];
const NEWP = () => !!(S && S.mode === 'career' && Array.isArray(S.known)); // every city, London included (its tutorial teaches it)
const isNewK = (k) => NEWP() && !S.known.includes(k);
const STARTER_KNOWN = ['rent', 'burn', 'doom', 'tummy', 'headache']; // what every centre already knows how to treat on day one
const discCand = () => Object.keys(PROBLEMS).filter((k) => isNewK(k) && !PROBLEMS[k].myst && !PROBLEMS[k].epi && !PROBLEMS[k].fam && (!PROBLEMS[k].city || PROBLEMS[k].city === (S.city || 'london')) && lvlOk(k));
function knowInit() { // once per save, on load: a new career starts from the starter list; an older save keeps everything it could already treat
  if (!S || S.mode !== 'career' || Array.isArray(S.known)) return;
  const fresh = (S.served || 0) === 0 && (S.day || 1) <= 1 && !(S.rooms || []).some((r) => DEV_ROOMS[r.type]), city = S.city;
  S.known = fresh ? STARTER_KNOWN.concat(Object.keys(PROBLEMS).filter((k) => PROBLEMS[k].city === city && ROOMS[PROBLEMS[k].room] && ROOMS[PROBLEMS[k].room].city === city))
    : Object.keys(PROBLEMS).filter((k) => !PROBLEMS[k].myst && (!PROBLEMS[k].city || PROBLEMS[k].city === city) && lvlOk(k) && unlockedOld(PROBLEMS[k].room));
  S.dev = fresh ? [] : Object.keys(DEV_ROOMS).filter((k) => unlockedOld(k) || (S.rooms || []).some((r) => r.type === k));
  S.discAt = nowAbs() + DAY_LEN * (fresh ? 1.2 : 2);
}
const devPts = (k) => Math.round(DEV_ROOMS[k][0] * (1 + 0.1 * (cityOf().lvl || 0))), devCost = (k) => Math.round(DEV_ROOMS[k][1] * (1 + 0.1 * (cityOf().lvl || 0)) / 50) * 50;
const devFor = (k) => (S.known || []).filter((q) => PROBLEMS[q] && PROBLEMS[q].room === k);
const devWanted = (k) => NEWP() && !(S.dev || []).includes(k) && devFor(k).length > 0;
for (const k of Object.keys(DEV_ROOMS)) PROJECTS['d_' + k] = { get cost() { return devPts(k); }, e: '🧪', dev: k };
// every 2 to 3 days a client comes in with something nobody here has seen yet: the talk room finds out what it is
function discTick() {
  const tutDisc = S.tut >= 0 && TUT[S.tut] && TUT[S.tut].disc; // the tutorial's discovery step calls the first ❓ client straight away
  if (!NEWP() || (S.tut >= 0 && !tutDisc)) return; if (S.discAt == null || (tutDisc && !R.visitors.some((v) => v.diag) && S.discAt > nowAbs() + 2)) S.discAt = nowAbs() + (tutDisc ? 2 : DAY_LEN * 2);
  if (nowAbs() < S.discAt || R.visitors.some((v) => v.diag)) return;
  const c = discCand(); if (!c.length) { S.discAt = nowAbs() + DAY_LEN * 3; return; }
  const easy = c.filter((k) => hasRoom(PROBLEMS[k].room)), k = easy.length && (tutDisc || RNG() < 0.6) ? rnd(easy) : rnd(c); // more often one your rooms can already treat
  const n = R.visitors.length; spawnVisitor(k); const v = R.visitors[n]; if (v && v.prob === k) v.diag = true;
  S.discAt = nowAbs() + DAY_LEN * (2 + RNG());
}
function diagDone(v, room) {
  const k = v.prob, r = PROBLEMS[k].room; v.diag = false;
  if (!S.known.includes(k)) { S.known.push(k); if (r === 'parent') for (const q of Object.keys(PROBLEMS)) if (PROBLEMS[q].fam && !S.known.includes(q)) S.known.push(q); }
  const fee = Math.round(PROBLEMS[k].fee * 0.5 * (S.price || 1)); S.cash += fee; S.earned += fee; roomEarn(room.id, fee); floatAt(v.av.position, '🔎 +' + money(fee)); AU.sfx('cash');
  ixEnd(v); if (v.rspot) v.rspot.busy = null; v.rspot = null; v.room = null; v.target = null; v.prog = 0; v.icon.material = iconTex(PROBLEMS[k].e);
  const has = hasRoom(r), st = has ? t('disc.have', { room: rn(r) }) : unlocked(r) ? t('disc.build', { room: rn(r) }) : t('disc.dev', { room: rn(r) });
  toast('🔎 ' + t('disc.title') + ' : ' + PROBLEMS[k].e + ' ' + t('p.' + k), 4000); probSeen(k); if (S.pQ) { S.pQ = S.pQ.filter((q) => q !== k); S.pQ.unshift(k); } piCool = Math.min(piCool, 1); /* its card (what it is, where it's treated) comes up right away */ chat(t('disc.title'), PROBLEMS[k].e + ' <b>' + t('p.' + k) + '</b>. ' + st, '🔎'); save();
  tip('disc'); if (!has && !unlocked(r)) tip('dev', 'nResearch', true);
  if (has) { v.target = pickRoomFor(v); seatVisitor(v); } else { v.icon.material = iconTex('😕'); setPath(v, exitPath(v)); v.state = 'exit'; } // nowhere to treat it yet: they go home, no review
}
function devDone(k) { S.dev = S.dev || []; if (!S.dev.includes(k)) S.dev.push(k); toast('🧪 ' + t('rp.devDone', { room: rn(k) }), 4000); chat(t('research.title'), t('rp.devDone', { room: rn(k) }), ROOMS[k].e); save(); }
function bookHtml() { // the casebook: what has been found here, and how much is still unknown
  if (!NEWP()) return ''; const city = S.city || 'london', all = Object.keys(PROBLEMS).filter((k) => !PROBLEMS[k].myst && !PROBLEMS[k].epi && (!PROBLEMS[k].city || PROBLEMS[k].city === city) && lvlOk(k)), kn = all.filter((k) => S.known.includes(k));
  const byRoom = {}; for (const k of kn) (byRoom[PROBLEMS[k].room] = byRoom[PROBLEMS[k].room] || []).push(k);
  return `<details class="w" style="border-radius:14px;padding:10px 12px;margin-bottom:10px"><summary style="font-weight:800;cursor:pointer">📖 ${t('book.title')} · ${t('book.n', { a: kn.length, b: all.length })}</summary>` +
    Object.entries(byRoom).map(([r, ks]) => `<div style="margin-top:6px;font-size:13px"><b>${ROOMS[r].e} ${rn(r)}</b>${hasRoom(r) ? '' : unlocked(r) ? ' · ' + t('disc.toBuild') : ' · ' + t('disc.toDev')}<div>${ks.map((q) => PROBLEMS[q].e + ' ' + t('p.' + q)).join(' · ')}</div></div>`).join('') +
    `<div style="margin-top:6px;font-size:13px;color:#6B6480">${'❓ '.repeat(Math.min(12, all.length - kn.length))}${all.length - kn.length > 0 ? t('book.left', { n: all.length - kn.length }) : ''}</div></details>`;
}
const unlocked = (k) => { if (NEWP()) { if (DEV_ROOMS[k]) return (S.dev || []).includes(k); if (FREE_ROLES.includes(k)) return true; } return unlockedOld(k); };
const done = (k) => S.research.done.includes(k);
// ================= Training room + epidemics (career mode, from Mumbai) =================
// The 🎓 sanitary course (2 full days, paid): after day 1 the risk is halved, after day 2 the person is immune for good (in this city's save).
// Epidemics: announced a day ahead, a wave of sick visitors, untrained staff who treat them can catch it and pass it on at work.
const epiCity = () => !!(S && S.mode === 'career' && (cityOf().lvl || 0) >= 2);
const COURSE_COST = () => Math.round(RENT * 0.45 / 50) * 50, LVL_COST = (st) => Math.round(RENT * 0.15 * st.skill / 50) * 50, LVL_WAGE = (st) => Math.round((ROLES[st.role].wage[1] - ROLES[st.role].wage[0]) / 4 / 10) * 10, BRIG_COST = () => Math.round(RENT * 2.2 / 50) * 50;
const EPI_QUIET = DAY_LEN / 2; // "no new case for half a day" closes the epidemic
const sickAtWork = () => R.staff.filter((rs) => rs.data.sick && !(rs.data.awayT > 0) && rs.at !== 'heal');
const sickN = () => S.staff.filter((s) => s.sick || (s.sickHome && s.awayT > 0)).length;
const sickHomeN = () => S.staff.filter((s) => s.sickHome && s.awayT > 0).length;
const epiDirt = () => 1 + Math.min(1, R.litter.length * 0.05 + R.rats.length * 0.15 + Object.values(R.rooms).reduce((a, r) => a + (r.def.dirt || 0), 0) * 0.15);
const trainRooms = () => Object.values(R.rooms).filter((r) => ROOMS[r.type].train);
const trainDur = (tr) => (tr.kind === 'lvl' ? DAY_LEN : DAY_LEN * 2); // ⭐ level course: 1 day · sanitary course: 2 days
const trainerHere = (room) => room.staff.some((s) => s && s.mode === 'there');
function trainRoomFor() { return trainRooms().find((r) => r.staff.some(Boolean) && S.staff.filter((s) => s.train && s.train.room === r.id).length < r.spots.length); }
function startCourse(st, kind = 'san') {
  if (!trainRooms().length) { toast(t('trn.noRoom'), 2200); return; }
  const room = trainRoomFor(); if (!room) { toast(trainRooms().some((r) => r.staff.some(Boolean)) ? t('trn.full') : t('trn.noTrainer'), 2200); return; }
  if (kind === 'lvl') { if (st.skill >= 5) return; const c = LVL_COST(st); if (S.cash < c) { toast(t('build.noCash'), 1600); return; }
    S.cash -= c; st.train = { room: room.id, t: 0, kind: 'lvl' }; chat(st.name + ' · ' + roleN(st.role), t('trn.lvlStart', { n: st.skill + 1 }), '⭐', { fun: true }); toast('⭐ ' + t('trn.lvlStartT', { name: st.name.split(' ')[0], n: st.skill + 1 }), 2200); save(); return; }
  const c = st.cert === 1 ? Math.round(COURSE_COST() / 2 / 10) * 10 : COURSE_COST(); if (S.cash < c) { toast(t('build.noCash'), 1600); return; }
  S.cash -= c; st.train = { room: room.id, t: st.cert === 1 ? DAY_LEN : 0 }; // day 1 already done: only the second day is left
  chat(st.name + ' · ' + roleN(st.role), t('trn.start'), '🎓', { fun: true }); toast('🎓 ' + t('trn.startT', { name: st.name.split(' ')[0] }), 2200); save();
}
// ---- the class itself: the trainer talks to the class, turns to show the board; the trainees listen, sometimes answer, clap when someone graduates
let trainAsked = false;
function lessonPose(rs, st) { const p = rs.av.userData.p; if (!p.anim) return; rs.lesPose = st; p.anim.set(st); }
function lessonTick(dt) {
  for (const room of trainRooms()) {
    const tr = room.staff[0], kids = R.staff.filter((o) => o.at === 'train' && o.seat && room.spots.includes(o.seat) && o.mode === 'there' && !(o.gradT > 0));
    for (const o of kids) { // listening; now and then someone answers a question
      if (o.clapT > 0) { o.clapT -= dt; if (o.clapT > 0) continue; }
      o.askT = (o.askT ?? 8 + RNG() * 20) - dt;
      if (o.askT <= 0 && o.lesPose !== 'answer' && !kids.some((k) => k.lesPose === 'answer')) { o.askT = 4.5; lessonPose(o, 'answer'); continue; }
      if (o.askT <= 0) o.askT = 14 + RNG() * 22;
      const want = o.lesPose === 'answer' && o.askT > 0 ? 'answer' : 'listen'; const p = o.av.userData.p;
      if (o.lesPose !== want || (p.anim && !String(p.anim.state || '').match(want === 'listen' ? /listen/ : /answer/))) lessonPose(o, want);
    }
    if (!tr || tr.mode !== 'there' || patientOf(tr)) continue;
    if (!kids.length) { if (tr.lesPose) { tr.lesPose = null; tr.lessonRot = null; poseStand(tr.av.userData.p); } continue; }
    tr.lesT = (tr.lesT ?? 0) - dt; const sp = tr.target || {};
    if (tr.lesT <= 0) { // talk to the class (two gestures), then turn and show the board
      const next = tr.lesPose === 'talk' || tr.lesPose === 'talk2' ? (RNG() < 0.45 ? 'show' : tr.lesPose === 'talk' ? 'talk2' : 'talk') : 'talk';
      tr.lesT = next === 'show' ? 4.5 : 5 + RNG() * 4; tr.lessonRot = next === 'show' && sp.rot2 != null ? sp.rot2 : null; lessonPose(tr, next);
    } else if (tr.av.userData.p.anim && tr.av.userData.p.anim.state !== tr.lesPose && !/talk|show/.test(String(tr.av.userData.p.anim.state))) lessonPose(tr, tr.lesPose);
  }
}
// ---- hand props for the everyday clips: a cup (café, break) and a broom (maintenance)
function handBone(av) { let h = null; av.traverse((o) => { if (!h && o.isBone && o.name === 'RightHand') h = o; }); return h; }
function holdProp(av, key, on, make) {
  const ud = av.userData; if (!on) { if (ud[key]) { ud[key].parent && ud[key].parent.remove(ud[key]); ud[key] = null; } return; }
  if (ud[key] || !av.userData.p || !av.userData.p.glb) return; const h = handBone(av); if (!h) return;
  av.updateMatrixWorld(true); const ws = h.getWorldScale(new THREE.Vector3()); if (!(ws.x > 1e-6 && ws.y > 1e-6 && ws.z > 1e-6)) return; const g = new THREE.Group(); make(g); g.scale.set(1 / ws.x, 1 / ws.y, 1 / ws.z); h.add(g); ud[key] = g;
}
function holdCup(av, on) { holdProp(av, 'cup', on, (g) => { const c = put(cyl(0.04, 0.032, 0.1, '#F4EFE6'), 0, 0.09, 0.03, g); put(cyl(0.036, 0.036, 0.01, '#6B4226'), 0, 0.135, 0.03, g); c.castShadow = false; }); }
// The broom is not glued to the hand: its top follows the right hand, its head stays on the floor in front of the agent and
// sweeps left and right (Meshy has no sweeping clip, so the broom does the sweeping and reads as such from far away)
const _bv = { h: null, d: null, s: null, x: null, y: null, z: null, m: null };
function holdBroom(av, on) {
  const ud = av.userData; if (!on) { if (ud.broomS) { ud.broomS.parent && ud.broomS.parent.remove(ud.broomS); ud.broomS = null; } return; }
  if (!_bv.h) for (const k of ['h', 'd', 's', 'x', 'y', 'z']) _bv[k] = new THREE.Vector3(); if (!_bv.m) _bv.m = new THREE.Matrix4();
  let b = ud.broomS; if (!b) { b = ud.broomS = new THREE.Group(); b.matrixAutoUpdate = false; av.add(b); // child of the person, so it leaves with them
    put(cyl(0.016, 0.016, 1.0, '#B5793A'), 0, -0.5, 0, b); put(rbox(0.36, 0.07, 0.09, '#9C6B40', 0.02), 0, -1.0, 0, b); // stick, head block
    const br = put(rbox(0.34, 0.1, 0.08, '#E3B341', 0.02), 0, -1.08, 0, b); br.scale.z = 1.1; b.traverse((o) => { if (o.isMesh) o.castShadow = true; }); }
  const ry = av.rotation.y, fx = Math.sin(ry), fz = Math.cos(ry), t = performance.now() / 1000, sw = Math.sin(t * 5.5);
  const hb = ud.p && ud.p.glb ? (ud._hand || (ud._hand = handBone(av))) : null;
  if (hb) hb.getWorldPosition(_bv.h); else _bv.h.set(av.position.x + fx * 0.25, av.position.y + 1.0, av.position.z + fz * 0.25);
  _bv.d.set(av.position.x + fx * 0.62 - fz * sw * 0.32, 0.2, av.position.z + fz * 0.62 + fx * sw * 0.32); // where the bristles touch the floor
  _bv.y.subVectors(_bv.h, _bv.d).normalize(); _bv.s.set(-fz, 0, fx); _bv.x.copy(_bv.s).addScaledVector(_bv.y, -_bv.s.dot(_bv.y)).normalize(); _bv.z.crossVectors(_bv.x, _bv.y);
  _bv.m.makeBasis(_bv.x, _bv.y, _bv.z); _bv.m.setPosition(_bv.d.addScaledVector(_bv.y, 1.08)); // bristles on the floor point, stick leaning up toward the hand
  av.updateMatrixWorld(); b.matrix.copy(av.matrixWorld).invert().multiply(_bv.m); b.matrixWorldNeedsUpdate = true;
}
function leaveTraining(rs) { if (rs.seat) rs.seat.busy = null; rs.seat = null; rs.lesPose = null; rs.gradT = 0; if (rs.at === 'train') { rs.at = null; assignStaff(); } }
function trainTick(dt) {
  lessonTick(dt);
  for (const rs of R.staff) {
    if (rs.gradT > 0) { rs.gradT -= dt; if (rs.gradT <= 0) leaveTraining(rs); continue; }
    const d = rs.data, tr = d.train; if (!tr) continue;
    const room = R.rooms[tr.room];
    if (!room) { d.train = null; leaveTraining(rs); continue; } // the room was sold: the day in progress is lost
    if (rs.at !== 'train') { // they walk over once their current session is over
      if (d.awayT > 0 || rs.onBreak || rs.at === 'heal' || patientOf(rs)) continue;
      const seat = room.spots.find((sp) => !sp.busy); if (!seat) continue;
      const old = R.rooms[rs.at]; if (old && old.staff[rs.st] === rs) old.staff[rs.st] = null;
      rs.at = 'train'; seat.busy = rs; rs.seat = seat; goStaff(rs, seat); assignStaff(); continue;
    }
    if (rs.mode !== 'there' || !trainerHere(room)) continue; // no trainer in the room: the course is on hold
    tr.t += dt;
    if (tr.kind === 'lvl') { if (tr.t >= DAY_LEN) { d.skill = Math.min(5, d.skill + 1); d.wage += LVL_WAGE(d); d.train = null; rs.gradT = 3.6; lessonPose(rs, 'thumb'); for (const o of R.staff) if (o !== rs && o.at === 'train' && o.seat && room.spots.includes(o.seat)) { o.clapT = 3.2; lessonPose(o, 'clap'); }
        AU.sfx('star'); chat(d.name + ' · ' + roleN(d.role), t('trn.lvlDone', { n: d.skill }), '⭐', { fun: true }); toast('⭐ ' + t('trn.lvlDoneT', { name: d.name.split(' ')[0], n: d.skill, m: money(Math.round(LVL_WAGE(d) * WAGE_K)) }), 3000); save(); }
      continue; }
    if (tr.t >= DAY_LEN && !(d.cert >= 1)) { d.cert = 1; chat(d.name + ' · ' + roleN(d.role), t('trn.half'), '📘', { fun: true }); }
    if (tr.t >= DAY_LEN * 2) { d.cert = 2; d.train = null; rs.gradT = 3.6; lessonPose(rs, 'thumb'); for (const o of R.staff) if (o !== rs && o.at === 'train' && o.seat && room.spots.includes(o.seat)) { o.clapT = 3.2; lessonPose(o, 'clap'); } AU.sfx('star'); chat(d.name + ' · ' + roleN(d.role), t('trn.done'), '🎓', { fun: true }); toast('🎓 ' + t('trn.doneT', { name: d.name.split(' ')[0] }), 2800); save(); }
  }
}
// ---- sick staff
function infect(d) {
  const E = S.epi; if (!E || E.ph !== 'on' || d.sick || d.cert >= 2 || d.awayT > 0) return;
  if (sickN() >= Math.floor(S.staff.length * 0.5)) return; // never more than half the team at once (for now)
  d.sick = 1; d.sickT = DAY_LEN * 2; E.cases = (E.cases || 0) + 1; E.quiet = 0;
  chat(d.name + ' · ' + roleN(d.role), t('epi.caught'), '🤒'); toast('🤒 ' + t('epi.caughtT', { name: d.name.split(' ')[0] }), 2600); AU.sfx('pop');
}
function epiTreated(st, room) { // a sick visitor was just helped: the person who helped them may catch it (the main source)
  const d = st.data; if (!S.epi || S.epi.ph !== 'on' || d.cert >= 2) return;
  if (RNG() < 0.22 * epiDirt() * (d.cert === 1 ? 0.5 : 1)) infect(d);
}
function sendPharm(st) {
  const rs = R.staff.find((x) => x.data === st), ph = Object.values(R.rooms).find((r) => r.type === 'pharmacy' && !r.closed && r.staff.some((x) => x && x !== rs && x.mode === 'there')); // someone else has to be there to look after them
  if (!rs || !ph) { toast(t('epi.noPharm'), 2200); return; }
  if (st.train) { st.train = null; leaveTraining(rs); }
  const old = R.rooms[rs.at]; if (old && old.staff[rs.st] === rs) old.staff[rs.st] = null;
  const p = doorPt(ph.def, 0.8); rs.at = 'heal'; rs.healT = 18; goStaff(rs, { x: p.x, z: p.z, rot: Math.atan2(ph.cx - p.x, ph.cz - p.z), sit: false, y: 0 }); assignStaff();
  toast('💊 ' + t('epi.toPharm', { name: st.name.split(' ')[0] }), 2200); save();
}
function sendHome(st) {
  const rs = R.staff.find((x) => x.data === st); if (st.train) { st.train = null; if (rs) leaveTraining(rs); }
  st.sick = 0; st.sickHome = 1; st.awayT = DAY_LEN * (1 + Math.random()); // 1–2 days at home, not contagious there
  chat(st.name + ' · ' + roleN(st.role), t('epi.home'), '🏠'); save();
}
// ---- the epidemic itself
function epiDay() { // called at each new day
  if (!epiCity()) return;
  if (S.epiNext == null) { S.epiNext = S.day + 6; setTimeout(() => { chat(t('from.hq'), t('trn.unl'), '🎓'); toast('🎓 ' + t('trn.unlT'), 3500); }, 1200); }
  const E = S.epi;
  if (E && E.ph === 'ann' && S.day >= E.day) {
    Object.assign(E, { ph: 'on', d0: S.day, el: 0, quiet: 0, cases: 0, wt: 3 });
    chat(t('from.hq'), t('epi.start'), '🦠'); toast('🦠 ' + t('epi.startT'), 3500); AU.sfx('siren');
  } else if (!E && S.day >= S.epiNext - 1) {
    if (S.em || (S.emBurst || 0) > 0 || S.emAt > 0) { S.epiNext = S.day + 2; return; } // never on top of another emergency
    S.epi = { ph: 'ann', day: S.day + 1 }; chat(t('from.hq'), t('epi.ann'), '🦠');
    setTimeout(() => { if (!S.epi || modalPaused) return; modal(`<div style="font-size:46px">🦠</div><h2>${t('epi.annT')}</h2><p>${t('epi.annP')}</p>
      <div class="receipt" style="text-align:left;font-size:13.5px"><div>🎓 ${t('epi.tip1')}</div><div>🧹 ${t('epi.tip2')}</div><div>💊 ${t('epi.tip3')}</div></div>
      <div class="row2" style="margin-top:8px"><button class="btn y" id="eStaff">👥 ${t('epi.staffBtn')}</button><button class="btn g" id="mOk">${t('insp.ok')}</button></div>`);
      $('mOk').onclick = closeModal; $('eStaff').onclick = () => { closeModal(); openStaffList('all'); }; }, 600);
  }
}
function epiTick(dt) {
  if (!S || S.mode !== 'career') return;
  trainTick(dt);
  for (const rs of R.staff) {
    const d = rs.data;
    if (rs.at === 'heal' && rs.mode === 'there') { rs.healT -= dt; if (rs.healT <= 0) { d.sick = 0; rs.at = null; assignStaff(); chat(d.name + ' · ' + roleN(d.role), t('epi.healed'), '💊', { fun: true }); } }
    if (d.sick && !(d.awayT > 0)) { d.sickT = (d.sickT ?? DAY_LEN * 2) - dt; if (d.sickT <= 0) d.sick = 0; } // gets better on their own after ~2 days
  }
  const E = S.epi; if (!E || E.ph !== 'on') return;
  E.el = (E.el || 0) + dt;
  if (E.el < DAY_LEN * 2 && !E.quar) { // the wave of sick visitors: busy the first day, lighter the second
    E.wt = (E.wt ?? 3) - dt;
    if (E.wt <= 0) { E.wt = (E.el < DAY_LEN ? 7 : 13) * (0.7 + RNG() * 0.6); const ps = ['flu', 'flurest'].filter((k) => hasRoom(PROBLEMS[k].room)); if (ps.length && R.visitors.filter((v) => v.virus && !v.cured).length < 6) spawnVisitor(rnd(ps)); }
  }
  const work = sickAtWork(), dm = epiDirt();
  if (work.length) for (const rs of R.staff) { // sick colleagues at work pass it on (slower than patients do)
    const d = rs.data; if (d.sick || d.cert >= 2 || d.awayT > 0 || rs.at == null || rs.at === 'heal') continue;
    if (RNG() < 0.15 / EPI_QUIET * work.length * dm * (d.cert === 1 ? 0.5 : 1) * dt) infect(d);
  }
  if (work.length) E.quiet = 0; else E.quiet = (E.quiet || 0) + dt;
  if (E.quar && !work.length) { E.quar = 0; chat(t('from.hq'), t('epi.reopen'), '🔓'); toast('🔓 ' + t('epi.reopen'), 2800); }
  if (E.brig > 0) { E.brig -= dt; if (E.brig <= 0) { for (const s of S.staff) s.sick = 0; chat(t('epi.brigN'), t('epi.brigDone'), '🧑‍⚕️'); toast('🧑‍⚕️ ' + t('epi.brigDone'), 2800); } }
  const n = S.staff.length, fr = n ? sickN() / n : 0; E.fr = fr;
  if (fr >= 0.25 && fr < 0.4) vb('epi', -5 * dt / DAY_LEN); // 25–40 % of the team sick: −5 % vibes a day
  if (E.cd > 0) E.cd -= dt;
  if (E.inspIn > 0) { E.inspIn -= dt; if (E.inspIn <= 0) { if (R.inspector) E.inspIn = 4; else spawnInspector('epi'); } }
  else if (fr >= 0.4 && !(E.cd > 0) && !(R.inspector && R.inspector.kind === 'epi')) { E.inspIn = 12; E.cd = 1e9; chat(t('ik.epi'), t('epi.called'), '🦠'); toast('🦠 ' + t('epi.called'), 2800); } // over 40 %: the health inspector is called in
  if (E.el >= DAY_LEN && E.quiet >= EPI_QUIET && !E.quar && !(E.inspIn > 0) && !(R.inspector && R.inspector.kind === 'epi')) epiEnd();
}
function epiEnd() {
  const E = S.epi, clean = !E.pen, bonus = Math.round(RENT * (clean ? 0.6 : 0.25) / 50) * 50;
  S.cash += bonus; vb('epi', clean ? 4 : 1); if (clean) incCnt('epiclean'); S.epiN = (S.epiN || 0) + 1;
  S.epi = null; S.epiNext = S.day + 15 + Math.floor(Math.random() * 6);
  AU.sfx('cash'); chat(t('from.hq'), '✅ ' + t('epi.over') + ' · +' + money(bonus), '✅');
  modal(`<div style="font-size:46px">✅</div><h2>${t('epi.over')}</h2><p>${t('epi.overP', { n: E.cases || 0, d: Math.max(1, S.day - E.d0 + 1) })}</p>
    <div class="receipt"><div><span>${t('epi.bonus')}</span><span>+${money(bonus)}</span></div></div>
    <p style="font-weight:800;color:${clean ? '#1E8A3A' : 'var(--red)'}">${clean ? '🛡️ ' + t('epi.clean') : '⚠️ ' + t('epi.notClean')}</p><button class="btn g" id="mOk" style="width:100%">${t('insp.ok')}</button>`);
  $('mOk').onclick = closeModal; save();
}
function epiVerdict() { // the epidemic inspector: cleanliness, sick staff still working, sick visitors left waiting
  const { sc, ded } = inspScore('epi'), lv = cityOf().lvl || 0, base = Math.round(RENT * 0.25 * (1 + 0.1 * lv) / 50) * 50;
  const tier = sc >= 95 ? 'gold' : sc >= 85 ? 'great' : sc >= 70 ? 'pass' : sc >= 55 ? 'warn' : 'fail';
  const T = { gold: [3, 8, 5], great: [2, 6, 4], pass: [1, 4, 3], warn: [-0.5, -3, 0], fail: [-2.5, -10, 0] }[tier], cash = Math.round(base * T[0] / 50) * 50;
  S.cash += cash; vb('insp', 0 + T[1]); if (T[2]) addKudos(T[2]);
  const E = S.epi; let quar = false;
  if (E) { E.cd = DAY_LEN / 2; if (tier === 'fail') { E.pen = 1; E.inspIn = DAY_LEN / 2; quar = sickAtWork().length > 0; E.quar = quar ? 1 : 0; } } // a fail: back within half a day
  const m = (cash >= 0 ? '+' : '−') + money(Math.abs(cash)), v = (T[1] >= 0 ? '+' : '−') + Math.abs(T[1]) + '%';
  chat(t('ik.epi'), t('iv.' + tier) + ' · ' + t('iv.p', { s: sc, m, v }) + (quar ? ' · 🚫 ' + t('epi.quar') : ''), '🦠');
  const why = ded.slice(0, 3).map(([k, n]) => `<div style="display:flex;justify-content:space-between;gap:8px"><span>${t('iv.r.' + k)}</span><b>−${n}</b></div>`).join('');
  modal(`<div style="font-size:44px">${tier === 'gold' ? '🏆' : tier === 'fail' ? '❌' : '🦠'}</div><h2>${t('ik.epi')} · ${t('iv.' + tier)}</h2><p style="font:700 22px Fredoka">${sc}/100</p><p>${t('iv.p', { s: sc, m, v })}</p>
  ${quar ? `<p style="font-weight:800;color:var(--red)">🚫 ${t('epi.quarP')}</p>` : ''}${tier === 'fail' ? `<p style="font-weight:800;color:var(--red)">🔁 ${t('epi.back')}</p>` : ''}${why ? `<div class="receipt" style="text-align:left"><div style="font-weight:800;margin-bottom:4px">${t('iv.lost')}</div>${why}</div>` : ''}
  <button class="btn g" id="mOk" style="width:100%">${t('insp.ok')}</button>`);
  $('mOk').onclick = closeModal;
}
function epiHud() {
  const E = S.epi; if (E.ph === 'ann') return '🦠 ' + t('epi.hudAnn');
  const a = sickAtWork().length; let s = '🦠 ' + t('epi.hud', { a, b: sickHomeN(), d: Math.max(1, S.day - E.d0 + 1) });
  if (E.quar) s += ' · 🚫 ' + t('epi.quar');
  else if (!a && E.el >= DAY_LEN * 0.25) s += ' · ⏱ ' + t('epi.quiet', { a: Math.min(EPI_QUIET, Math.floor(E.quiet || 0)), b: EPI_QUIET });
  if (E.brig > 0) s += ' · 🧑‍⚕️ ' + Math.ceil(E.brig) + 's';
  return s;
}
function openEpi() {
  const E = S.epi; if (!E) return;
  const n = S.staff.length, fr = n ? sickN() / n : 0, pct = Math.round(fr * 100), canBrig = E.ph === 'on' && !E.brigUsed;
  const tierTxt = fr >= 0.4 ? t('epi.t3') : fr >= 0.25 ? t('epi.t2') : t('epi.t1');
  modal(`<div style="font-size:44px">🦠</div><h2>${E.ph === 'ann' ? t('epi.annT') : t('epi.title')}</h2>
    ${E.ph === 'on' ? `<p style="font-weight:800">${epiHud().replace('🦠 ', '')}</p><div class="receipt" style="text-align:left;font-size:13.5px"><div><span>${t('epi.sickPct')}</span><span>${pct}%</span></div><div>${tierTxt}</div><div style="font-size:12px;color:var(--muted)">${t('epi.rules')}</div></div>` : `<p>${t('epi.annP')}</p>`}
    <div class="receipt" style="text-align:left;font-size:13.5px"><div>🎓 ${t('epi.tip1')}</div><div>🧹 ${t('epi.tip2')}</div><div>💊 ${t('epi.tip3')}</div></div>
    ${canBrig ? `<button class="btn y" id="eBrig" style="width:100%;margin-top:6px">🧑‍⚕️ ${t('epi.brigBtn', { m: money(BRIG_COST()) })}</button><p class="sub" style="margin:2px 0 0">${t('epi.brigD')}</p>` : E.brig > 0 ? `<p class="sub">🧑‍⚕️ ${t('epi.brigOn')}</p>` : ''}
    <div class="row2" style="margin-top:8px"><button class="btn y" id="eStaff">👥 ${t('epi.staffBtn')}</button><button class="btn g" id="mOk">${t('insp.ok')}</button></div>`);
  $('mOk').onclick = closeModal; $('eStaff').onclick = () => { closeModal(); openStaffList('all'); };
  if ($('eBrig')) $('eBrig').onclick = () => { const c = BRIG_COST(); if (S.cash < c) { toast(t('build.noCash'), 1600); return; } S.cash -= c; E.brigUsed = 1; E.brig = DAY_LEN / 2; closeModal(); chat(t('epi.brigN'), t('epi.brigGo'), '🧑‍⚕️'); save(); };
}
// staff card: course / sick buttons
function staffEpiRow(st) {
  if (S.mode !== 'career' || !epiCity()) return '';
  const b = (id, txt, cls = 'y') => `<button class="btn ${cls}" data-${id}="${st.id}" style="padding:6px 10px;font-size:13.5px">${txt}</button>`;
  let h = '';
  if (st.sick) h += b('epiph', '💊 ' + t('epi.pharmBtn')) + b('epihome', '🏠 ' + t('epi.homeBtn'));
  else if (st.train) h += `<span style="font-size:12.5px;font-weight:900;color:#5B6CC9">${st.train.kind === 'lvl' ? '⭐ ' + t('trn.lvlProg', { n: st.skill + 1, p: Math.min(100, Math.round((st.train.t / trainDur(st.train)) * 100)) }) : '📘 ' + t('trn.prog', { p: Math.min(100, Math.round((st.train.t / trainDur(st.train)) * 100)) })}</span>`;
  else {
    h += !(st.cert >= 2) ? b('course', '🎓 ' + t('trn.btn', { m: money(st.cert === 1 ? Math.round(COURSE_COST() / 20) * 10 : COURSE_COST()) }), 'g') : `<span style="font-size:12.5px;font-weight:900;color:#5B6CC9">🎓 ${t('trn.immune')}</span>`;
    h += st.skill < 5 ? b('lvl', t('trn.lvlBtn', { n: st.skill + 1, m: money(LVL_COST(st)) }), 'y') : `<span style="font-size:12.5px;font-weight:900;color:#B7791F">⭐ ${t('trn.lvlMax')}</span>`;
  }
  return `<div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:8px">${h}</div>${!st.train && st.skill < 5 ? `<div style="font-size:12px;font-weight:800;color:var(--muted);margin-top:4px">⭐ ${t('trn.lvlInfo', { w: money(Math.round(LVL_WAGE(st) * WAGE_K)) })}</div>` : ''}${st.cert === 1 && !st.train ? `<div style="font-size:12px;font-weight:800;color:#5B6CC9;margin-top:4px">📘 ${t('trn.halfInfo')}</div>` : ''}`;
}
// ---- earthquake alert (Mexico City): the siren sounds, waiting visitors evacuate to the street for 20 s, rooms pause; afterwards some come in anxious
function quakeStart() {
  S.quake = { t: 20 }; AU.sfx('siren'); toast('🚨 ' + t('qk.alert'), 3500); say('qk', t('qk.alert'), 0); chat(t('from.hq'), '🚨 ' + t('qk.chat'), '🚨');
  for (const v of R.visitors) { if (!['toQueue', 'queue', 'checkin', 'toWait', 'wait'].includes(v.state) || v.caseK) continue;
    v.prevState = v.state; v.asleep = false; const p = { x: 0.5 + Math.random() * 6, z: 10.4 + Math.random() * 1.6 }; setPath(v, findPath(v.av.position, p)); v.state = 'evac'; }
}
function quakeEnd() {
  S.quake = null; let n = 0;
  for (const v of R.visitors) { if (v.state !== 'evac') continue; n++;
    for (const q of R.deskQs) { const qi = q.indexOf(v); if (qi >= 0) q.splice(qi, 1); }
    if (v.spot) { v.spot.busy = null; v.spot = null; }
    if (['toWait', 'wait'].includes(v.prevState)) seatVisitor(v); else joinQueue(v); }
  vb('misc', 0 + 2); chat(t('from.hq'), '✅ ' + t('qk.ok', { n }), '✅');
  for (let i = 0; i < 3; i++) R.later.push({ t: 4 + i * 3, prob: 'quake' }); // the alert leaves some people shaken
}
function quakeTick(dt) {
  if (!S || S.mode !== 'career' || !cityOf().quake) return;
  if (S.quake) { S.quake.t -= dt; if (S.quake.t <= 0) quakeEnd(); return; }
  if (S.quakeAt > 0 && S.t >= S.quakeAt && !modalPaused) { S.quakeAt = -1; quakeStart(); }
}
// ---- temperature (Theme Hospital style): each city has its climate; radiators and air conditioners keep the centre comfortable, at a cost ----
const CLIMATE = { newyork: [6, 4], mexico: [17, 6], london: [9, 3], lagos: [30, 3], mumbai: [31, 2], seoul: [4, 4], saopaulo: [22, 4], cairo: [33, 6] };
const T_LO = 19, T_HI = 24;
function outsideT() { const [b, a] = CLIMATE[S.city] || [18, 3], v = b + a * Math.sin((S.t / DAY_LEN - 0.25) * Math.PI * 2) - (S.rainy ? 2 : 0); return S.ev && S.ev.k === 'heat' ? Math.max(v + 7, 32 + a * 0.5 * Math.sin((S.t / DAY_LEN - 0.25) * Math.PI * 2)) : v; } // a heatwave is a heatwave everywhere, even in London
function targetT() {
  const size = Math.pow(Math.max(1, (S.rooms.length + 2) / 4), 0.6), dec = S.decor || [];
  const heat = dec.filter((d) => d.k === 'radiator' && !d.broken).length, cool = dec.filter((d) => d.k === 'aircon' && !d.broken).length + (S.ac ? 1 : 0) + (S.acTemp ? 1 : 0); // acTemp: portable AC rented for a heatwave
  const base = outsideT() * 0.6 + 8 + Math.min(4, (R.visitors.length + R.staff.length) * 0.12), aim = 21.5; // thermostat: devices only push toward ~21.5 °C, up to their capacity
  return base < aim ? base + Math.min(3.5 * heat / size, aim - base) : base - Math.min(3.5 * cool / size, base - aim);
}
const tempOff = () => { const T = S.temp ?? 21; return T < T_LO ? T_LO - T : T > T_HI ? T - T_HI : 0; };
let gardenT = 0;
function tempTick(dt) {
  if (!S || S.mode !== 'career') return;
  if (S.garden) { if (GARDEN_OK() && S.vibes < 95) vb('decor', 0 + 0.0015 * dt); if ((gardenT += dt) > 5) { gardenT = 0; gardenRain(); } }
  if (S.temp == null) S.temp = targetT(); S.temp += (targetT() - S.temp) * Math.min(1, dt / (S.ev && S.ev.k === 'heat' ? 8 : 20)); // the centre warms up fast in a heatwave, so the thermometer matches the news
  const off = tempOff();
  if (off > 0) { vb('temp', 0 - 0.012 * Math.min(off, 8) * dt); if (off > 1.5 && (S.day >= 2 || S.t > DAY_LEN * 0.5)) behSeen('temp'); }
  else if (S.vibes < 90) vb('temp', 0 + 0.004 * dt);
}
function openTemp() {
  const T = S.temp ?? 21, off = tempOff(), dec = S.decor || [], st = T < T_LO ? 'cold' : T > T_HI ? 'hot' : 'ok';
  openSheet(`<h2>🌡️ ${t('tp.title')}</h2><div class="w" style="border-radius:14px;padding:10px 12px;font-weight:800">${t('tp.in')} : <b style="color:${st === 'ok' ? '#1E8A3A' : st === 'cold' ? '#2F7FD1' : '#C0362C'}">${Math.round(T)}°C</b> · ${t('tp.out')} : ${Math.round(outsideT())}°C<div style="font-size:13px;color:var(--muted)">${t('tp.zone')}</div><div style="margin-top:4px">${t('tp.' + st)}</div><div style="font-size:13px;margin-top:4px">${t('tp.dev', { h: dec.filter((d) => d.k === 'radiator').length, c: dec.filter((d) => d.k === 'aircon').length + (S.ac ? 1 : 0) })}</div></div>
    ${!S.tempFree ? `<p class="sub" style="color:#1E8A3A;font-weight:900">🎁 ${t('tp.free')}</p>` : ''}
    <div class="row2" style="margin-top:8px"><button class="btn ${st === 'cold' ? 'g' : 'w'}" id="tpRad">🔥 ${t('dc.radiator')} · ${S.tempFree ? money(DECOR.radiator.cost) : '🎁'}</button><button class="btn ${st === 'hot' ? 'g' : 'w'}" id="tpAc">❄️ ${t('dc.aircon')} · ${S.tempFree ? money(DECOR.aircon.cost) : '🎁'}</button></div>
    <p class="sub" style="margin-top:6px">${t('dc.radiatorD')}<br>${t('dc.airconD')}</p>`);
  $('tpRad').onclick = () => startDecor('radiator'); $('tpAc').onclick = () => startDecor('aircon');
}
// ---- special cases: short funny mini-games tied to a real modern problem; variants never repeat on a profile until a bank is used up ----
const ct = (path, vars) => { const pick = (L) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), CASE_TXT[L]); let v = pick(getLang()); if (v == null) v = pick('en'); if (typeof v === 'string' && vars) v = v.replace(/\{(\w+)\}/g, (m, k) => (vars[k] != null ? vars[k] : m)); return v; };
function saveProfile(p) { try { localStorage.setItem('ahq_profile', JSON.stringify(p)); } catch (e) {} }
function drawItems(k, bank, n) { // fresh items first; a bank only starts over once every item has been seen
  const p = profile(); p.cu = p.cu || {}; const key = k + '.' + bank, all = ct(k + '.' + bank).map((_, i) => i); let used = p.cu[key] || [];
  let free = all.filter((i) => !used.includes(i)); if (free.length < n) { used = []; free = all.slice(); }
  const out = []; while (out.length < n && free.length) out.push(free.splice(Math.floor(Math.random() * free.length), 1)[0]);
  p.cu[key] = used.concat(out); saveProfile(p); return out;
}
let caseRun = null;
function caseTick() {
  if (!S || S.mode !== 'career' || S.tut >= 0 || S.day < 2 || S.day < (S.caseNext || 0) || S.t < DAY_LEN * 0.15 || R.visitors.some((v) => v.caseK)) return;
  const elig = []; for (const v of R.visitors) { if (v.em || v.vip || v.cured || !['queue', 'wait'].includes(v.state)) continue; for (const [k, C] of Object.entries(CASES)) if (C.probs.includes(v.prob) && hasRoom(C.room) && (C.city ? C.city === S.city : (cityOf().lvl || 0) >= (C.lvl || 0))) elig.push([v, k]); }
  if (!elig.length) return; const [v, k] = rnd(elig); S.caseNext = S.day + 7; // one special case a week
  v.caseK = k; v.iconPrev = v.icon.material; v.icon.material = iconTex('⭐'); floatAt(v.av.position, '⭐'); AU.sfx('pop'); toast('⭐ ' + ct('ui.star'), 3200); chat(t('from.hq'), '⭐ ' + ct(k + '.name') + ' — ' + ct('ui.star'), '⭐');
}
function openCase(v) {
  const k = v.caseK, C = CASES[k], steps = [];
  for (const [bank, n] of C.rounds) for (const i of drawItems(k, bank, n)) steps.push({ bank, i });
  caseRun = { v, k, steps, at: -1, score: 0 };
  modal(`<div style="font-size:44px">⭐</div><div class="lbl">${ct('ui.title')}</div><h2 style="margin:4px 0 6px">${ct(k + '.name')}</h2><p style="font-weight:700">${ct(k + '.intro', { name: v.name })}</p>
    <div class="row2" style="margin-top:10px"><button class="btn y" id="csLater">${ct('ui.later')}</button><button class="btn g" id="csGo">${ct('ui.open')}</button></div>`);
  $('csLater').onclick = () => { caseRun = null; closeModal(); }; $('csGo').onclick = () => caseStep();
}
function caseStep() {
  const R0 = caseRun; if (!R0) return; R0.at++; if (R0.at >= R0.steps.length) return caseEnd();
  const { bank, i } = R0.steps[R0.at], k = R0.k, item = ct(k + '.' + bank)[i];
  const C = CASES[k], kind = C.b[bank], head = ct(k + '.' + (C.h[bank] || 'q')), quote = item[0]; let opts; // opts: [label, correct]
  if (kind === 'mc') opts = [[item[1], true], [item[2], false], [item[3], false]].sort(() => Math.random() - 0.5);
  else { const labels = kind === 'lb' ? ct(k + '.lb.' + bank) : kind.map((x) => ct(x)); opts = labels.map((lab, j) => [lab, j === item[1]]); }
  modal(`<div style="font-size:13px;font-weight:900;color:var(--muted)">${ct(k + '.name')} · ${R0.at + 1}/${R0.steps.length}</div><div class="lbl" style="margin-top:6px">${head}</div>
    <div class="w" style="border-radius:16px;padding:12px;font-size:16px;font-weight:800;margin:6px 0 10px">“${quote}”</div>
    <div style="display:grid;gap:8px">${opts.map((o, j) => `<button class="btn w" data-co="${j}" style="text-align:left;font-size:14.5px;padding:12px">${o[0]}</button>`).join('')}</div>`);
  document.querySelectorAll('[data-co]').forEach((b) => b.onclick = () => {
    const ok = opts[+b.dataset.co][1]; if (ok) R0.score++; AU.sfx(ok ? 'cash' : 'bad');
    document.querySelectorAll('[data-co]').forEach((x) => { x.disabled = true; if (opts[+x.dataset.co][1]) x.style.background = '#BFEFC9'; }); if (!ok) b.style.background = '#F6C3C3';
    setTimeout(caseStep, ok ? 650 : 1100);
  });
}
function caseEnd() {
  const R0 = caseRun; caseRun = null; const v = R0.v, n = R0.steps.length, r = R0.score / n, P = PROBLEMS[v.prob];
  const tier = r >= 0.8 ? 'win' : r >= 0.5 ? 'mid' : 'lose', money0 = Math.round(P.fee * (tier === 'lose' ? 0.5 : 1 + 3 * r) / 10) * 10, vib = tier === 'lose' ? -1 : Math.round(1 + 5 * r);
  S.cash += money0; S.earned += money0; vb('case', 0 + vib); if (tier !== 'lose') { S.served++; incCnt('cases'); const p = profile(); p.album = (p.album || 0) + 1; saveProfile(p); if (r >= 0.8) addKudos(2); dailyHit(v); }
  modal(`<div style="font-size:46px">${tier === 'win' ? '🎉' : tier === 'mid' ? '🙂' : '😬'}</div><h2>${ct('ui.' + (tier === 'win' ? 'great' : tier === 'mid' ? 'ok' : 'fail'))}</h2><p style="font-weight:800">${ct(R0.k + '.' + tier, { name: v.name })}</p>
    <div class="w" style="border-radius:14px;padding:8px 12px;font-weight:900">${ct('ui.score', { s: R0.score, n })}<br>${ct('ui.reward', { m: money(money0), v: (vib >= 0 ? '+' : '−') + Math.abs(vib) })}</div><button class="btn g" id="csEnd" style="width:100%;margin-top:10px">${ct('ui.done')}</button>`);
  $('csEnd').onclick = closeModal;
  // the visitor's story is settled: they leave (happy, or with a story to tell)
  v.caseK = null; if (v.iconPrev) v.icon.material = v.iconPrev; v.caseDone = true;
  if (v.spot) v.spot.busy = null; v.spot = null; for (const q of R.deskQs) { const qi = q.indexOf(v); if (qi >= 0) q.splice(qi, 1); }
  if (tier === 'lose') { chat(t('from.review') + ' · ' + v.name + ', ' + v.age, '😬 ' + ct(R0.k + '.lose', { name: v.name }), '😬'); leave(v, true); }
  else { v.cured = true; if (v.av.userData.p.anim && v.av.userData.p.anim.calm) v.av.userData.p.anim.calm(); v.icon.material = iconTex(tier === 'win' ? '💘' : '😊'); floatAt(v.av.position, '+' + money(money0)); setPath(v, exitPath(v)); v.state = 'exit'; chat(t('from.review') + ' · ' + v.name + ', ' + v.age, (tier === 'win' ? '🎉 ' : '🙂 ') + ct(R0.k + '.' + tier, { name: v.name }), '⭐'); }
  save();
}
// ---- daily goal: one small target per day, with a small reward ----
function dailyNew() { // one goal at a time, lasting a week (7 in-game days), then a day off
  if (!S || S.mode !== 'career' || S.day < 2) { S.daily = null; return; }
  if (S.daily && !S.daily.won && S.day < S.daily.end) return; if (S.daily && S.day < (S.daily.end || 0) + 1) return;
  const seen = Object.keys((S.st && S.st.prob) || {}).filter((k) => PROBLEMS[k] && !PROBLEMS[k].myst && hasRoom(PROBLEMS[k].room));
  const lv = cityOf().lvl || 0, reward = 4 * (400 + 150 * lv + 20 * Math.min(S.day, 30)), r = RNG(), end = S.day + 7; // one goal a week
  if (seen.length && r < 0.5) S.daily = { k: 'cure', p: rnd(seen), n: 12 + Math.floor(RNG() * 7), c: 0, m: reward, end };
  else if (r < 0.75) S.daily = { k: 'calm', bad: 0, m: reward, end };
  else S.daily = { k: 'vibes', n: clamp(Math.round((S.vibes + 5) / 5) * 5, 50, 90), m: reward, end };
  toast('🎯 ' + dailyText(), 3200);
}
const dailyText = () => { const D = S.daily; if (!D) return ''; const left = D.won || D.lost ? '' : ' · ⏳' + Math.max(1, (D.end || S.day) - S.day + 1); return (D.k === 'cure' ? ct('dl.cure', { n: D.n, p: PROBLEMS[D.p].e + ' ' + pn(D.p) }) + ` (${D.c}/${D.n})` : D.k === 'calm' ? ct('dl.calm') + ` (${D.bad || 0}/4)` : ct('dl.vibes', { n: D.n })) + left; };
function dailyWin() { const D = S.daily; if (!D || D.won) return; D.won = true; S.cash += D.m; S.earned += D.m; addKudos(1); AU.sfx('cash'); toast('🎯 ' + ct('ui.dailyDone', { m: money(D.m) }), 3000); chat(t('from.hq'), '🎯 ' + dailyText() + ' — ' + ct('ui.dailyDone', { m: money(D.m) }), '🎯'); }
function dailyHit(v) { const D = S && S.daily; if (D && D.k === 'cure' && !D.won && v.prob === D.p) { D.c++; if (D.c >= D.n) dailyWin(); } }
function dailyEnd() { const D = S.daily; if (!D || D.won || S.day + 1 < (D.end || 0)) return; if (D.k === 'calm' && !D.fail) dailyWin(); if (D.k === 'vibes' && S.vibes >= D.n) dailyWin(); if (!D.won) D.lost = true; }
// ---- behaviours: from the 2nd city on, problems start to *play* differently. Each city adds two, and they stay on in later cities. London stays the simple tutorial city.
const BEH = { nolines: 7, onestar: 7, ahorita: 6, antojo: 6, slowdoom: 1, waves: 1, sleepy: 2, famleave: 2, ghost: 3, nunchi: 3, toxic: 4, saudade: 4, stamps2: 5 }; // ('broke visitors pay tomorrow' removed: it only delayed money)
const BEH_E = { nolines: '🙅', onestar: '⭐', ahorita: '⏳', antojo: '🌮', temp: '🌡️', slowdoom: '📱', waves: '🚦', sleepy: '💤', famleave: '👨‍👩‍👧', ghost: '👻', nunchi: '👀', toxic: '😤', saudade: '🥹', iou: '🧾', stamps2: '📑' };
const TRAFFIC = new Set(['goslow', 'train', 'commute', 'honk']), BROKE = new Set(['rent', 'flat', 'subs', 'fuel']), DOOM = new Set(['doom', 'group']);
const beh = (k) => !window.__noBeh && !!S && S.mode === 'career' && (cityOf().lvl || 0) >= BEH[k];
function behSeen(k) { if (!S) return; S.seenB = S.seenB || {}; if (S.seenB[k]) return; S.seenB[k] = 1; (S.pQ = S.pQ || []).push('b:' + k); }
function behCard(k) {
  modal(`<div style="font-size:46px;line-height:1">${BEH_E[k]}</div><div class="lbl" style="margin-top:4px">${t('bh.new')}</div><h2 style="margin:4px 0 8px">${t('bh.' + k)}</h2>
    <div class="w" style="border-radius:14px;padding:10px 12px;text-align:left;font-size:14px;font-weight:700">${t('bh.' + k + '.d')}</div>
    <button class="btn g" id="piOk" style="width:100%;margin-top:10px">${t('pi.got')}</button>`);
  $('piOk').onclick = closeModal;
}
const waiting = (v) => ['toQueue', 'queue', 'checkin', 'toWait', 'wait'].includes(v.state);
let badAura = [];
function behTick(dt) { // per frame: who is spreading a bad mood in the waiting area
  badAura = [];
  if (!beh('toxic') && !beh('saudade')) return;
  for (const v of R.visitors) { if (!waiting(v) || v.asleep) continue;
    if (beh('toxic') && v.prob === 'boss') { badAura.push(v); behSeen('toxic'); if (RNG() < dt * 0.15) floatAt(v.av.position, '😤', true); }
    else if (beh('saudade') && v.prob === 'saudade' && (v.waitT || 0) > 10) { badAura.push(v); behSeen('saudade'); vb('misc', 0 - dt * 0.01); if (RNG() < dt * 0.15) floatAt(v.av.position, '🥹', true); } }
}
function wakeUp(v) { if (!v.asleep) return; v.asleep = false; v.sleepT = 0; if (v.iconPrev) v.icon.material = v.iconPrev; floatAt(v.av.position, '⏰'); v.pat = Math.min(1, v.pat + 0.08); if (v.state === 'wait') posePhone(v.av.userData.p); }
function behSpawn(v) { // traffic: one stuck driver means more are right behind
  if (beh('slowdoom') && DOOM.has(v.prob)) behSeen('slowdoom');
  if (beh('waves') && TRAFFIC.has(v.prob) && !v.wave && !v.em) { v.wave = true; behSeen('waves'); floatAt(v.av.position, '🚦'); R.later.push({ t: 2.2, prob: v.prob, wave: true }, { t: 4.6, prob: v.prob, wave: true }); spawnT += 8; }
}
function laterTick(dt) { for (const L of R.later.slice()) { L.t -= dt; if (L.t > 0) continue; R.later.splice(R.later.indexOf(L), 1); if (R.visitors.length >= 26) continue; wavePending = !!L.wave; const nv = spawnVisitor(L.prob); wavePending = false; if (nv) { nv.wave = !!L.wave; nv.stage2 = !!L.stage2; if (nv.wave) floatAt(nv.av.position, '🚦'); } } }
let wavePending = false;
function patienceRate(v) {
  if (S.tut >= 0 && S.tut <= 4) return 0; // nobody storms out while the tutorial is still explaining
  if (v.caseK) return 0; // a ⭐ case waits patiently for you
  let r = 1 / 75 / 1.2;
  if (v.spot && v.spot.out) r *= 0.75; // fresh air on the garden benches
  if (S.mode === 'career') r *= TIER_FX[vibeTier()].pat;
  if (R.litter.length && R.litter.some((l) => l.vomit && Math.hypot(l.mesh.position.x - v.av.position.x, l.mesh.position.z - v.av.position.z) < 2)) r *= 1.3; // nobody likes waiting next to that
  if (S.mode === 'career' && S.temp != null) { const off = tempOff(); if (off > 0) r *= 1 + 0.1 * Math.min(off, 8); }
  if (S.rainy) r *= cityOf().monsoon ? 1.25 : 1.15;
  if (cafeOpen()) r *= cafeF() - (done('oat') ? 0.1 : 0);
  r *= 1 + 0.12 * R.rats.length + 0.02 * R.litter.length;
  if (v.state === 'toQueue' || v.state === 'queue') r *= 0.8;
  if (v.em) r *= 1.5; // people in crisis: patience runs out fast
  if (v.vip) r *= 1.3;
  if (cityOf().hustle) r *= 1.05;
  r *= decorCalm(v) * evPatience() * (inAura(v.av.position) ? 0.75 : 1);
  if (beh('ghost') && v.prob === 'ghosted' && !v.seen && v.known) { r *= 1.7; behSeen('ghost'); } // ignored again? they ghost you back
  if (cityOf().impatient) r *= 1.25; // New York minute
  if (beh('antojo') && v.prob === 'antojo' && !cafeOpen() && !(S.decor || []).some((d) => d.k === 'vending')) { r *= 2; behSeen('antojo'); }
  if (beh('nunchi') && v.prob === 'nunchi' && R.visitors.filter((u) => u.state === 'wait').length > 8) { r *= 2; behSeen('nunchi'); }
  if (badAura.length && badAura.some((u) => u !== v && Math.hypot(u.av.position.x - v.av.position.x, u.av.position.z - v.av.position.z) < 2.2)) r *= 1.4;
  return r;
}
function roomSpeed(type) { return (type === 'nap' && done('nap')) || (type === 'detox' && done('mute')) ? 1.3 : type === 'budget' && done('sheet') ? 1.25 : 1; }
function exitPath(v) { const x = 2 + Math.random() * 3; return findPath(v.av.position, { x, z: 11.8 }).concat([{ x, z: 13.4 }]); }
function visitorUpdate(v, dt) {
  if (v.ix && v.state !== 'treat') ixEnd(v);
  if (v.gag && v.gag.userData.kid && !v.gag.userData.kid.userData.p.glb && (v.kidChk = (v.kidChk || 0) + dt) > 1) { v.kidChk = 0; ixKidUpgrade(v); }
  if (v.markAt === undefined) { const mk = v.state === 'toQueue' ? arrivalMark(v) : null; v.markAt = mk ? 1 + RNG() * 2.5 : null; v.mark = mk; }
  if (v.markAt != null && (v.markAt -= dt) <= 0) { v.markAt = null; dropMark(v.av.position.x + 0.2, v.av.position.z, v.mark[0], v.mark[1]); }
  if (v.asleep) { v.sleepT = (v.sleepT || 0) + dt; if (v.sleepT > (v.state === 'queue' ? (DQ(v.desk || 0)[0] === v && deskHost(v.desk || 0, true) ? 5 : 15) : 20) || (R.mgr && Math.hypot(R.mgr.av.position.x - v.av.position.x, R.mgr.av.position.z - v.av.position.z) < 1.6)) wakeUp(v); v.hud.position.copy(v.av.position); return; } // asleep: doesn't move, blocks the line
  const p = v.av.userData.p, walkSpeed = 2.3 * (beh('slowdoom') && DOOM.has(v.prob) && !v.cured ? 0.55 : 1) * (v.state === 'angry' ? 1.6 : 1) * (v.av.userData.p.anim ? 1 : !v.cured && v.look.style2 && v.look.style2.walk === 'WalkTired' ? 0.72 : 1);
  switch (v.state) {
    case 'toQueue': if (stepWalker(v, dt, walkSpeed)) { v.state = 'queue'; v.av.rotation.y = Math.PI + Math.sin(v.id * 3.1) * 0.45; poseStand(p); posePhone(p); } break;
    case 'queue': {
      const di = v.desk || 0, i = DQ(di).indexOf(v); if (i < 0) { joinQueue(v); break; } const q = QUEUE(i, di);
      if (Math.hypot(v.av.position.x - q.x, v.av.position.z - q.z) > 0.05) { setPath(v, [q]); v.state = 'toQueue'; break; }
      const host = deskHost(di, true);
      if (i === 0 && host) { v.state = 'checkin'; v.prog = 0; v.av.rotation.y = desks()[di].r + Math.PI; poseStand(p); }
      break; }
    case 'checkin': {
      const host = deskHost(v.desk || 0, true);
      if (!host) { v.state = 'queue'; break; }
      if (S.ev && S.ev.k === 'power' && !S.ev.gen) break;
      v.prog += dt / (3.2 / (0.7 + host.data.skill * 0.12) / traitVal(host.data, 'speed') / boost() / energyF(host) * mgrDeskF()) * deskLv(v.desk || 0);
      if (v.prog >= 1) {
        finishCheckin(v);
      }
      break; }
    case 'toWait': if (stepWalker(v, dt, walkSpeed)) { settle(v, v.spot); posePhone(p); v.state = 'wait'; } break;
    case 'toShop': if (stepWalker(v, dt, walkSpeed)) { settle(v, v.sspot); poseStand(v.av.userData.p); v.state = 'shopping'; v.prog = 0; } break; // looks at the shelves, not at the phone
    case 'shopping': {
      if ((v.paying || v.prog >= 0.99) && !hostHere(v.sspot)) { if ((v.noHostT = (v.noHostT || 0) + dt) > 8) { v.paying = false; v.noHostT = 0; v.prog = 0; v.tillWait = 0; v.sspot.busy = null; v.sspot = null; floatAt(v.av.position, '🤷'); if (v.cured) { setPath(v, exitPath(v)); v.state = 'exit'; } else seatVisitor(v); } break; } // nobody at the till: they wait a moment, then put it back and go
      v.prog += dt / (v.paying ? 1.2 : 2.5);
      if (v.prog >= 1 && !v.sspot.till) { // picked an item at a shelf or the table: now pay at the counter (wait a moment if someone is being served)
        const sr = roomOfSpot(v.sspot), till = sr && sr.spots.find((q) => q.till && q.st === v.sspot.st);
        if (till && !till.busy) { v.sspot.busy = null; till.busy = v; v.sspot = till; v.paying = true; v.prog = 0; setPath(v, findPath(v.av.position, till)); v.state = 'toShop'; break; }
        if (till && (v.tillWait = (v.tillWait || 0) + dt) < 8) { v.prog = 1; break; } }
      if (v.prog >= 1) { v.paying = false; v.tillWait = 0; const spend = Math.round((12 + RNG() * 26) * (S.price || 1) * (done('oat') ? 1.15 : 1)); S.cash += spend; S.earned += spend; v.spent = (v.spent || 0) + spend; AU.sfx('cash'); floatAt(v.av.position, '🛍️ +' + money(spend)); { const sr = roomOfSpot(v.sspot); if (sr) roomEarn(sr.id, spend); } v.sspot.busy = null; v.sspot = null; if (v.cured) { setPath(v, exitPath(v)); v.state = 'exit'; } else { v.pat = Math.min(1, v.pat + 0.1); seatVisitor(v); } }
      break; }
    case 'toLoo': if (stepWalker(v, dt, walkSpeed * (v.urgent ? 1.7 : 1))) { settle(v, v.lspot); v.state = 'loo'; v.prog = 0; } break;
    case 'toCafe': if (stepWalker(v, dt, walkSpeed)) { settle(v, v.lspot); v.state = 'cafe'; v.prog = 0; if (p.anim) p.anim.set(v.lspot && v.lspot.sit ? 'drinksit' : 'drink'); holdCup(v.av, true); } break;
    case 'cafe': {
      if (!hostHere(v.lspot)) { if ((v.noHostT = (v.noHostT || 0) + dt) > 8) { v.noHostT = 0; holdCup(v.av, false); v.lspot.busy = null; v.lspot = null; v.prog = 0; floatAt(v.av.position, '🤷'); if (v.cured) { setPath(v, exitPath(v)); v.state = 'exit'; } else seatVisitor(v); } break; } // no host behind the counter: no drink
      v.prog += dt / 3;
      if (v.prog >= 1) { const spend = Math.round((7 + RNG() * 6) * (S.price || 1) * (done('oat') ? 1.2 : 1)); S.cash += spend; S.earned += spend; v.spent = (v.spent || 0) + spend; v.pat = Math.min(1, v.pat + 0.25); incCnt('matcha'); { const cr = roomOfSpot(v.lspot); if (cr) { roomEarn(cr.id, spend); addDirt(cr, 0.03); } } if (notLondon() && RNG() < ((S.temp || 21) > 27 || (S.ev && S.ev.k === 'heat') ? 0.14 : 0.07)) dropMark(v.av.position.x + 0.3, v.av.position.z + 0.2, 1, null, 0.5);
        AU.sfx('cash'); floatAt(v.av.position, '🍵 +' + money(spend)); holdCup(v.av, false); v.lspot.busy = null; v.lspot = null; v.prog = 0; v.icon.material = iconTex(v.known ? (isMystK(v.prob) || v.diag ? '❓' : PROBLEMS[v.prob].e) : '🛎️');
        const spot = waitSpotFor(v) || { x: 2 + Math.random() * 3, z: 7.2 + Math.random(), rot: Math.PI, sit: false, y: 0 };
        spot.busy = v; v.spot = spot; setPath(v, findPath(v.av.position, spot)); v.state = 'toWait'; }
      break; }
    case 'toLine': if (stepWalker(v, dt, walkSpeed)) { const lp = v.linePt; if (lp) { v.av.rotation.y = lp.rot; } posePhone(v.av.userData.p); v.state = 'line'; } // fall through to 'line' next frame
      break;
    case 'line': lineTick(v, dt); break;
    case 'toAmen': if (stepWalker(v, dt, walkSpeed)) { settle(v, v.lspot); v.state = 'amen'; v.prog = 0; } break;
    case 'amen': {
      const A = v.lspot; v.prog += dt / 2.5;
      if (v.prog >= 1) {
        if (A.k === 'vending') { const spend = Math.round((4 + RNG() * 5) * (S.price || 1)); S.cash += spend; S.earned += spend; v.spent = (v.spent || 0) + spend; v.pat = Math.min(1, v.pat + 0.15); incCnt('snack'); if (notLondon() && RNG() < ((S.temp || 21) > 27 || (S.ev && S.ev.k === 'heat') ? 0.14 : 0.07)) dropMark(v.av.position.x + 0.3, v.av.position.z + 0.2, 2, null, 0.55); AU.sfx('cash'); floatAt(v.av.position, '🥤 +' + money(spend)); }
        else { v.pat = Math.min(1, v.pat + 0.4); vb('decor', 0 + 0.3); floatAt(v.av.position, '💆'); }
        A.busy = null; v.lspot = null; v.prog = 0; v.icon.material = iconTex(v.known ? (isMystK(v.prob) || v.diag ? '❓' : PROBLEMS[v.prob].e) : '🛎️');
        const spot = waitSpotFor(v) || { x: 2 + Math.random() * 3, z: 7.2 + Math.random(), rot: Math.PI, sit: false, y: 0 };
        spot.busy = v; v.spot = spot; setPath(v, findPath(v.av.position, spot)); v.state = 'toWait'; }
      break; }
    case 'loo': {
      v.prog += dt / 3.5;
      if (v.prog >= 1) { { const lr = roomOfSpot(v.lspot); if (lr) { if ((lr.def.dirt || 0) >= 0.7) { v.pat = Math.max(0.05, v.pat - 0.12); logComplaint('dirty'); floatAt(v.av.position, '🤢'); } addDirt(lr, 0.1); } }
        const lroom = roomOfSpot(v.lspot); v.lspot.busy = null; v.lspot = null; v.need = 0; v.urgent = false; v.prog = 0; v.icon.material = iconTex(v.known ? (isMystK(v.prob) || v.diag ? '❓' : PROBLEMS[v.prob].e) : '🛎️'); AU.sfx('flush', hearVol(v.av.position));
        const ws = lroom && lroom.wash && lroom.wash.filter((w) => !w.busy).sort((a, b) => Math.hypot(a.x - v.av.position.x, a.z - v.av.position.z) - Math.hypot(b.x - v.av.position.x, b.z - v.av.position.z))[0];
        if (ws) { ws.busy = v; v.wspot = ws; v.wroom = lroom; setPath(v, findPath(v.av.position, ws)); v.state = 'toWash'; break; } // hands are washed before leaving
        const spot = waitSpotFor(v) || { x: 2 + Math.random() * 3, z: 7.2 + Math.random(), rot: Math.PI, sit: false, y: 0 };
        spot.busy = v; v.spot = spot; setPath(v, findPath(v.av.position, spot)); v.state = 'toWait'; }
      break; }
    case 'toWash': if (stepWalker(v, dt, walkSpeed)) { settle(v, v.wspot); v.state = 'washing'; v.prog = 0; if (v.wspot.water) v.wspot.water.visible = true; } break;
    case 'washing': {
      v.prog += dt / 2.8;
      if (v.prog >= 1) { const ws = v.wspot, rm = v.wroom; if (ws) { if (ws.water) ws.water.visible = false; ws.busy = null; } v.wspot = null; v.wroom = null; v.prog = 0; floatAt(v.av.position, '🧼');
        const bn = rm && rm.bins && rm.bins.reduce((a, b) => (!a || Math.hypot(b.x - v.av.position.x, b.z - v.av.position.z) < Math.hypot(a.x - v.av.position.x, a.z - v.av.position.z) ? b : a), null);
        if (bn) tossPaper(v.av.position, bn); // the paper towel goes in the bin
        const spot = waitSpotFor(v) || { x: 2 + Math.random() * 3, z: 7.2 + Math.random(), rot: Math.PI, sit: false, y: 0 };
        spot.busy = v; v.spot = spot; setPath(v, findPath(v.av.position, spot)); v.state = 'toWait'; }
      break; }
    case 'wait': {
      v.need = (v.need || 0) + dt / 95;
      if (v.pat < 0.25 && RNG() < dt * 0.006) {
        if (RNG() < 0.55) { dropPuddle(v.av.position.x + 0.35, v.av.position.z + 0.2, '#9BCB4E'); floatAt(v.av.position, '🤢', true); vb('dirt', 0 - 0.6); for (const o of R.visitors) if (o !== v && Math.hypot(o.av.position.x - v.av.position.x, o.av.position.z - v.av.position.z) < 2) o.pat -= 0.05; tip('vomit'); }
        else { v.need = 1.5; v.urgent = true; floatAt(v.av.position, '💩', true); }
      }
      if (v.need >= 1) {
        const loo = Object.values(R.rooms).filter((r) => ROOMS[r.type].loo).map((r) => r.spots.find((s) => !s.busy)).find(Boolean);
        if (loo) { loo.busy = v; if (v.spot) v.spot.busy = null; v.spot = null; v.lspot = loo; setPath(v, findPath(v.av.position, loo)); v.state = 'toLoo'; v.icon.material = iconTex('🚻'); break; }
        if (!hasRoom('toilet')) { tip('toilet'); if (v.urgent) { dropPuddle(v.av.position.x + 0.3, v.av.position.z, '#A0784A'); v.noLoo = true; S.st = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }; S.st.acc++; leave(v, false); break; } }
      }
      const thirsty = S.mode === 'career' && S.temp != null && tempOff() > 2 ? 2 : 1; // too hot or too cold: people go for a drink more often
      if (!v.drank && (v.waitT || 0) > 3 && v.pat < 0.95 && RNG() < dt * 0.16 * thirsty) {
        const crs = Object.values(R.rooms).filter((r) => r.type === 'cafe' && !r.closed && r.staff.some((x) => x && x.mode === 'there'));
        const cs = crs.map((r) => r.spots.find((s) => s.cafe && !s.busy)).find(Boolean);
        if (cs) { v.drank = true; cs.busy = v; if (v.spot) v.spot.busy = null; v.spot = null; v.lspot = cs; setPath(v, findPath(v.av.position, cs)); v.state = 'toCafe'; v.icon.material = iconTex('🍵'); break; }
        const lr = crs.sort((a, b) => (a.lineQ || []).length - (b.lineQ || []).length)[0];
        if (lr && joinLine(v, lr, 'cafe')) { v.drank = true; break; }
      }
      if (!v.shopped && (v.waitT || 0) > 8 && v.pat > 0.3 && RNG() < dt * 0.03) { // a quick browse in the mini-market while waiting
        const srs = Object.values(R.rooms).filter((r) => ROOMS[r.type].shop && !r.closed && r.staff.some((x) => x && x.mode === 'there'));
        const ss = srs.map((r) => r.spots.find((s) => !s.busy)).find(Boolean);
        if (ss) { v.shopped = true; ss.busy = v; if (v.spot) v.spot.busy = null; v.spot = null; v.sspot = ss; setPath(v, findPath(v.av.position, ss)); v.state = 'toShop'; break; }
        if (srs.length && joinLine(v, srs[0], 'shop')) { v.shopped = true; break; }
      }
      if (!v.amen && (v.waitT || 0) > 5 && v.pat < 0.92 && RNG() < dt * 0.08 * thirsty) { const as = amenSpot(v);
        if (as) { v.amen = true; as.busy = v; if (v.spot) v.spot.busy = null; v.spot = null; v.lspot = as; setPath(v, findPath(v.av.position, as)); v.state = 'toAmen'; v.icon.material = iconTex(DECOR[as.k].e); break; } }
      if (RNG() < dt * (done('bins') ? 0.0012 : 0.0025)) dropLitter(v.av.position.x, v.av.position.z);
      if (!v.vomited && (S.city || 'london') !== 'london' && S.mode === 'career') { const vr = (v.pat < 0.25 ? 0.004 : 0) + (['tummy', 'antojo', 'heatgrump'].includes(v.prob) ? 0.005 : 0) + ((S.temp || 21) > 27 ? 0.003 : 0);
        if (vr && RNG() < dt * vr) { v.vomited = true; dropVomit(v.av.position.x, v.av.position.z); } }
      const need = needOf(v);
      if (need && (v.target == null || !R.rooms[v.target])) v.target = pickRoomFor(v);
      const cands = Object.values(R.rooms).filter((r) => r.type === need).sort((a, b) => (a.id === v.target ? -1 : 0) - (b.id === v.target ? -1 : 0));
      for (const room of cands) {
        if (room.closed) continue;
        if (room.id !== v.target && roomQ(room.id).length) continue;
        if (!v.prio && R.visitors.some((u) => u !== v && u.prio && u.state === 'wait' && u.target === room.id)) continue;
        const sp = room.spots.find((s) => !s.busy && room.staff[s.st] && room.staff[s.st].mode === 'there');
        if (sp) { sp.busy = v; if (v.spot) v.spot.busy = null; v.spot = null; v.room = room.id; v.target = room.id; v.rspot = sp; setPath(v, findPath(v.av.position, sp)); v.state = 'toRoom'; break; }
      }
      break; }
    case 'toRoom': if (beh('ahorita') && v.prob === 'ahorita' && (v.ahT = (v.ahT || 0) + dt) < 5) { if (!v.ahSaid) { v.ahSaid = true; floatAt(v.av.position, '⏳ ahorita…'); behSeen('ahorita'); } break; } if (stepWalker(v, dt, walkSpeed)) { settle(v, v.rspot); v.state = 'treat'; v.prog = 0; } break;
    case 'treat': {
      const room = R.rooms[v.room]; const st = room && v.rspot && room.staff[v.rspot.st];
      if (!room) { leave(v, true); break; }
      if (st && st.av && !v.rspot.lie) { const dx = st.av.position.x - v.av.position.x, dz = st.av.position.z - v.av.position.z, base = v.rspot.rot || 0; if (dx * dx + dz * dz > 0.04) { const d = angW(Math.atan2(dx, dz) - base); turnTo(v.av, base + (v.rspot.sit ? clamp(d, -0.6, 0.6) : d), dt, 4); } }
      // staff gone (sent home, life event…): don't leave the client sitting alone in the room; back to the waiting area
      if (!st || st.mode !== 'there') { v.aloneT = (v.aloneT || 0) + dt; if (v.aloneT > 2.5) { v.aloneT = 0; v.rspot.busy = null; v.rspot = null; v.room = null; seatVisitor(v); } break; } v.aloneT = 0;
      if (room.closed) { v.closedT = (v.closedT || 0) + dt; if (v.closedT > 1.2) { v.closedT = 0; if (v.ix) ixEnd(v); poseStand(v.av.userData.p); v.av.position.y = 0.1; v.rspot.busy = null; v.rspot = null; v.room = null; v.target = null; seatVisitor(v); } break; } // a leak or a breakdown closes the room: out they go, back to waiting (their place in the queue is kept by the wait)
      if ((S.ev && S.ev.k === 'power' && (!S.ev.gen || S.ev.off.includes(room.id))) || S.quake) break;
      v.prog += dirtF(room) * dt / (ROOMS[room.type].time / (0.7 + st.data.skill * 0.12) / traitVal(st.data, 'speed') / roomSpeed(room.type) / sizeSpd(room) / incSpd(room) / boost() / energyF(st) / evSlow(room.type) * mgrRoomF(room.id) * (inAura(st.av.position) ? 1.15 : 1));
      ixTick(v, st, room, dt);
      if (v.prog >= 1 && v.diag) { diagDone(v, room); break; }
      if (v.prog >= 1) {
        const pr = (S.price || 1) * (cityOf().hustle ? 1.1 : 1) * (isNight() ? 1.15 : 1), fee = Math.round(PROBLEMS[v.prob].fee * 1.3 * (0.7 + S.vibes / 200) * pr);
        const twoVisit = beh('stamps2') && v.prob === 'paperwork', gain = Math.round(fee * (v.vip ? 2 : 1) * (twoVisit ? 0.5 : 1)), iou = beh('iou') && BROKE.has(v.prob);
        if (iou) { S.iou = (S.iou || 0) + gain; behSeen('iou'); floatAt(v.av.position, '🧾 ' + money(gain)); } else S.cash += gain;
        if (v.virus) epiTreated(st, room); roomEarn(room.id, gain); addDirt(room, 0.035); S.earned += gain; S.served++; outcome(true); S.dServ = (S.dServ || 0) + 1; if (isNight()) S.nServ = (S.nServ || 0) + 1; v.spent = (v.spent || 0) + gain; dailyHit(v);
        if (cityOf().tips && v.pat > 0.5) { const tip = Math.round(gain * 0.25); S.cash += tip; S.earned += tip; roomEarn(room.id, tip); incCnt('tips'); setTimeout(() => floatAt(v.av.position, '💵 tip +' + money(tip)), 400); } // happy & quick → they tip
        if (twoVisit && !v.stage2) { behSeen('stamps2'); R.later.push({ t: 40 + RNG() * 40, prob: 'paperwork', stage2: true }); floatAt(v.av.position, '📑 1/2'); }
        const SS = S.st = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }; SS.prob[v.prob] = (SS.prob[v.prob] || 0) + 1; SS.room[room.type] = (SS.room[room.type] || 0) + 1; SS.staff[st.data.id] = (SS.staff[st.data.id] || 0) + 1;
        if (v.vip) { SS.vip++; const q = v.pat >= 0.65 ? 'viral' : v.pat >= 0.35 ? 'nice' : 'meh', sp = q === 'viral' ? Math.round((300 + 150 * (cityOf().lvl || 0)) / 50) * 50 : 0; vb('vip', 0 + { viral: 8, nice: 4, meh: 1 }[q]); addKudos({ viral: 4, nice: 2, meh: 0 }[q]); if (sp) S.cash += sp; const msg = q === 'viral' ? t('vip.viral') + ' ' + t('vip.sponsor', { m: money(sp) }) : t('vip.' + q); chat('🤳 ' + v.name, msg, { viral: '🔥', nice: '👍', meh: '😐' }[q]); toast('👑 ' + msg, 3200); }
        vb('cure', 0 + (SIZES[room.size].vibe + (traitVal(st.data, 'vibe', 0) ? 0.3 : 0)) * (pr > 1 ? Math.max(0, 1 - (pr - 1) * 2) : 1 + (1 - pr) * 2) - (pr >= 1.4 ? 0.4 : 0));
        if (pr >= 1.2 && Math.random() < (pr - 1) * 0.5) chat(t('from.review') + ' · ' + v.name + ', ' + v.age, t('rev.greedy'), '💸');
        if (!iou) floatAt(v.av.position, '+' + money(gain)); AU.sfx('cash');
        if (v.em && S.em) S.em.got++;
        if (v.gag) v.gag.visible = false;
        if (v.gid && S.gs && S.gs[v.gid] > 0) { S.gh = S.gh || {}; S.gh[v.gid] = (S.gh[v.gid] || 0) + 1; groupStep(v, v.gid); }
        if (v.prob === 'wedding') incCnt('wedding'); if (PROBLEMS[v.prob].room === 'yoga') incCnt('yoga'); if (PROBLEMS[v.prob].room === 'lucha') incCnt('lucha'); if (PROBLEMS[v.prob].room === 'roda') incCnt('roda'); if (S.rainy) incCnt('rain'); if (v.prob === 'quake') incCnt('quake'); if (v.wave) incCnt('wave'); if (PROBLEMS[v.prob].room === 'ahwa') incCnt('tea'); if (cityOf().evening && S.t > DAY_LEN * 0.6) incCnt('evening'); if (isNight()) incCnt('night'); if (PROBLEMS[v.prob].care) vb('misc', 0 + 1);
        // generic 5-star thank-yous are gone from the chat: only reviews that point at a problem stay
        ixEnd(v); v.rspot.busy = null; v.rspot = null; v.cured = true; if (p.anim && p.anim.calm) p.anim.calm(); // cured: back to a normal walk
        v.icon.material = iconTex('😊');
        const shop = Object.values(R.rooms).filter((r) => ROOMS[r.type].shop && !r.closed).map((r) => r.spots.find((s) => !s.busy && r.staff[s.st] && r.staff[s.st].mode === 'there')).find(Boolean);
        const shopR = Object.values(R.rooms).filter((r) => ROOMS[r.type].shop && !r.closed && r.staff.some((x) => x && x.mode === 'there'));
        if (shop && RNG() < 0.75) { shop.busy = v; v.sspot = shop; setPath(v, findPath(v.av.position, shop)); v.state = 'toShop'; }
        else if (!shop && shopR.length && RNG() < 0.6 && joinLine(v, shopR[0], 'shop')) { /* lines up for the till */ }
        else { setPath(v, exitPath(v)); v.state = 'exit'; }
        if (p.anim && !v.em && room.type !== 'nap' && RNG() < 0.7) { v.after = v.state; v.state = 'cheer'; v.cheerT = 1.8; p.anim.set('cheer'); } // a little joy before leaving
      }
      break; }
    case 'cheer': v.cheerT -= dt; if (v.cheerT <= 0) { v.state = v.after || 'exit'; poseStand(p); } break;
    case 'exit': case 'angry': if (stepWalker(v, dt, walkSpeed)) removeVisitor(v); break;
    case 'evac': stepWalker(v, dt, walkSpeed * 1.3); break;
  }
  if (beh('sleepy') && v.prob === 'burn' && !v.cured && (v.state === 'queue' || v.state === 'wait') && (v.waitT || 0) > 10 && (v.sleeps || 0) < 2 && RNG() < dt * 0.05) { v.asleep = true; v.sleepT = 0; v.sleeps = (v.sleeps || 0) + 1; v.iconPrev = v.icon.material; v.icon.material = iconTex('💤'); floatAt(v.av.position, '💤'); behSeen('sleepy'); AU.sfx('snore', hearVol(v.av.position)); return; }
  if (['toQueue', 'queue', 'checkin', 'toWait'].includes(v.state)) v.need = (v.need || 0) + dt / 110; // needs build up from the moment they arrive
  if (v.state === 'toLine' || v.state === 'line') { if (!v.cured) { v.pat -= patienceRate(v) * 0.7 * dt; v.waitT = (v.waitT || 0) + dt; if (v.pat <= 0) leave(v, false); } }
  if (['toQueue', 'queue', 'checkin', 'toWait', 'wait'].includes(v.state)) { v.pat -= patienceRate(v) * (v.need > 1 && !hasRoom('toilet') ? 1.6 : 1) * dt; v.waitT = (v.waitT || 0) + dt; if (v.pat <= 0) leave(v, false); }
  if (v.emRing) { const s = 1 + 0.2 * Math.sin(performance.now() / 150); v.emRing.scale.set(s, s, s); v.emRing.visible = !['exit', 'angry'].includes(v.state); }
  v.hud.position.copy(v.av.position);
  const showProg = ['treat', 'checkin'].includes(v.state), val = showProg ? v.prog : v.pat;
  v.fg.scale.x = Math.max(0.001, 0.6 * clamp(val, 0, 1));
  v.fg.material = barMat(showProg ? '#5AB8F0' : v.pat > 0.5 ? '#7ACB4E' : v.pat > 0.25 ? '#FFB800' : '#E5484D');
  // Two Point style: heads stay clean; the icon + bar only show when the visitor needs attention, or is selected (Settings can show all)
  { const need = v.known && needOf(v), attn = ICONS_ALL || v === sel || v.em || v.vip || v.caseK || v.urgent || v.pat < 0.35 || v.state === 'toLoo' || v.state === 'loo' || (need && !hasRoom(need)) || v.state === 'treat';
    v.icon.visible = attn && !['exit', 'angry'].includes(v.state); v.fg.visible = v.bg.visible = attn && v.icon.visible; }
  { const pa = v.av.userData.p.anim, standWait = v.state === 'queue' || (v.state === 'wait' && v.spot && !v.spot.sit);
    if (pa && standWait && v.pat < 0.25) pa.set('angry'); else if (pa && standWait && pa.state === '~angry' && v.pat > 0.35) posePhone(v.av.userData.p); }
  const kid = v.gag && v.gag.userData.kid; if (kid && kid.userData.p.anim && !kid.userData.ix) { const pa = v.av.userData.p.anim; kid.userData.p.anim.set(pa && /walk/.test(pa.state) ? 'walk' : 'idle', 1); }
}
const CMP_E = { noLoo: '🚻', noRoom: '🚪', queue: '🛎️', cold: '🥶', hot: '🥵', dirty: '🐀', price: '💸', crowd: '👥', wait: '⏳' };
function complaintOf(v) {
  if (v.crowdOut) return 'crowd';
  if (v.noLoo) return 'noLoo';
  if (v.known && !isMystK(v.prob) && !hasRoom(PROBLEMS[v.prob].room)) return 'noRoom';
  if (['toQueue', 'queue', 'checkin'].includes(v.state)) return 'queue';
  if (S.temp != null && tempOff() > 2) return S.temp < T_LO ? 'cold' : 'hot';
  if (R.litter.length >= 5 || R.rats.length) return 'dirty';
  if ((S.price || 1) >= 1.3) return 'price';
  if (R.visitors.filter((u) => u.state === 'wait').length > 10) return 'crowd';
  return 'wait';
}
function logComplaint(k) { S.cmp = (S.cmp || []).filter((c) => c[0] > S.day - 7); S.cmp.push([S.day, k]); vb('cmp', -0.15); }
function topComplaints() { const n = {}; for (const [d, k] of S.cmp || []) if (d > S.day - 7) n[k] = (n[k] || 0) + 1; return Object.entries(n).sort((a, b) => b[1] - a[1]).slice(0, 3); }
// a group counts once every member is done (helped or gone), as long as at least 2 of them were helped
function groupStep(v, gid) { S.gs[gid]--; if (S.gs[gid] > 0) return; delete S.gs[gid]; const ok = ((S.gh || {})[gid] || 0) >= 2; if (S.gh) delete S.gh[gid];
  if (ok) { incCnt(cityOf().groups ? cityOf().groups.kind : 'groups'); floatAt(v.av.position, cityOf().groups && cityOf().groups.kind === 'families' ? '👨‍👩‍👧 ✓' : '🥳 ✓'); } }
function leave(v, quiet) {
  lineDrop(v);
  if (v.spot) v.spot.busy = null; if (v.rspot) v.rspot.busy = null; if (v.sspot) { v.sspot.busy = null; v.sspot = null; } if (v.lspot) { v.lspot.busy = null; v.lspot = null; } if (v.wspot) { if (v.wspot.water) v.wspot.water.visible = false; v.wspot.busy = null; v.wspot = null; }
  for (const q of R.deskQs) { const qi = q.indexOf(v); if (qi >= 0) q.splice(qi, 1); }
  if (v.gid && S.gs && S.gs[v.gid] > 0) groupStep(v, v.gid); // one member leaving no longer cancels the whole group
  if (!quiet && beh('onestar')) { vb('left', 0 - 1.5); behSeen('onestar'); } // one-star reviews travel fast here
  if (!quiet && beh('famleave') && v.gid && !v.famGone) { v.famGone = true; const mates = R.visitors.filter((o) => o !== v && o.gid === v.gid && waiting(o)); if (mates.length) behSeen('famleave'); for (const o of mates) { o.famGone = true; vb('misc', 0 - 1); leave(o, true); floatAt(o.av.position, '👋', true); } }
  if (!quiet) {
    logComplaint(complaintOf(v));
    if (S.daily && S.daily.k === 'calm' && !S.daily.won && ++S.daily.bad > 4) S.daily.fail = true;
    S.left++; outcome(false); AU.sfx('bad'); vb('left', 0 - (v.known && !isMystK(v.prob) && !hasRoom(PROBLEMS[v.prob].room) ? 0.8 : PROBLEMS[v.prob].care ? 2.5 : 1.8) - (v.vip ? 10 : 0)); /* balanced so ~65 % success holds vibes steady; above that they climb */ if (v.vip) { chat('🤳 ' + v.name, t('vip.roast'), '💀'); toast('👑 ' + t('vip.roast'), 3200); } floatAt(v.av.position, t('v.lost'), true);
    if (v.known && !hasRoom(PROBLEMS[v.prob].room)) tip('noRoom');
    const need = v.known ? PROBLEMS[v.prob].room : null;
    if (v.noLoo || Math.random() < 0.3) chat(t('from.review') + ' · ' + v.name + ', ' + v.age, v.noLoo ? t('rev.noLoo') : v.known && isMystK(v.prob) ? t('rev.myst') : need && !hasRoom(need) ? t('rev.noRoom', { room: rn(need) }) : crnd(tList('rev.bad')), '😤');
    if (Math.random() < 0.6) dropLitter(v.av.position.x, v.av.position.z);
  }
  v.icon.material = iconTex('😤'); setPath(v, exitPath(v)); v.state = 'angry';
}
function removeVisitor(v) { scene.remove(v.av); scene.remove(v.hud); R.visitors.splice(R.visitors.indexOf(v), 1); if (sel === v) selectVisitor(null); }

// ---------------- litter & pests ----------------
// floor stains drawn as flat decals (assets/stains.png, 4x2: footprints, brown splat, soda, vomit / dust, grease, green smear, toilet accident)
let STAIN_IMG = null; const STAIN_MAT = new Map();
function stainMat(i, tint) { const k = i + '|' + (tint || '');
  if (!STAIN_MAT.has(k)) { if (!STAIN_IMG) { STAIN_IMG = new THREE.TextureLoader().load('assets/stains.png', () => { for (const m of STAIN_MAT.values()) m.map.needsUpdate = true; }); STAIN_IMG.colorSpace = THREE.SRGBColorSpace; }
    const tx = STAIN_IMG.clone(); tx.repeat.set(1 / 4, 1 / 2); tx.offset.set((i % 4) / 4, i < 4 ? 0.5 : 0); if (STAIN_IMG.image) tx.needsUpdate = true;
    STAIN_MAT.set(k, new THREE.MeshLambertMaterial({ map: tx, color: tint || '#ffffff', transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 })); }
  return STAIN_MAT.get(k); }
function stainDecal(i, size, tint) { const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size), stainMat(i, tint)); m.rotation.x = -Math.PI / 2; m.rotation.z = Math.random() * Math.PI * 2; m.renderOrder = 2; m.receiveShadow = true; return m; }
// ---- floor marks tied to what is going on: rain footprints, snow slush, desert dust, café/vending spills, crowds, emergencies, garden grass
// (light marks: the crew wipes them in a few seconds; London keeps only light rain footprints)
const snowy = () => !!(S && S.rainy && outsideT() < 2), notLondon = () => (S.city || 'london') !== 'london';
function dropMark(x, z, idx, tint, size) { if (!S || S.mode !== 'career' || R.litter.length >= 32) return; const m = stainDecal(idx, size || 0.7, tint); m.position.set(x, 0.168, z); scene.add(m); R.litter.push({ mesh: m, mark: true, wet: !!tint && snowy() }); }
function arrivalMark(v) { // decided once, when a visitor comes in from the street
  if (S.mode !== 'career') return null; const mat = (S.decor || []).some((d) => d.k === 'doormat') ? 0.5 : 1;
  if (snowy() && notLondon()) return RNG() < 0.45 * mat ? [0, '#9FB3C8'] : null;
  if (S.rainy) return RNG() < (notLondon() ? (cityOf().monsoon ? 0.5 : 0.35) : 0.2) * mat ? [0, null] : null;
  if (S.dusty) return RNG() < 0.4 * mat ? [4, null] : null;
  if (v.em && notLondon()) return RNG() < 0.4 ? [S.em && S.em.k === 'marathon' ? 4 : 0, null] : null;
  if (notLondon() && typeof GARDEN_OK === 'function' && GARDEN_OK() && RNG() < 0.15) return [6, null];
  return null;
}
function marksTick(dt) {
  if (!S || S.mode !== 'career' || !notLondon()) return; marksTick.t = (marksTick.t || 0) + dt; if (marksTick.t < 10) return; marksTick.t = 0;
  const waiting = R.visitors.filter((v) => v.state === 'wait' || v.state === 'queue');
  if (waiting.length > 10 && RNG() < 0.5) { const v = rnd(waiting); dropMark(v.av.position.x + (RNG() - 0.5), v.av.position.z + (RNG() - 0.5), RNG() < 0.5 ? 4 : 5); } // a packed waiting room gets grubby
  if (snowy() && R.litter.filter((l) => l.wet).length >= 4 && waiting.length && RNG() < 0.5) { const v = rnd(waiting); v.pat = Math.max(0.05, v.pat - 0.1); floatAt(v.av.position, '💫'); vb('dirt', -0.3); } // slush: someone slips
}
function dropPuddle(x, z, col) { AU.sfx('pop');
  const vomit = col === '#9BCB4E' || col === '#A3B04A', accident = col === '#A0784A';
  const m = stainDecal(vomit ? 3 : accident ? 7 : 2, vomit || accident ? 1.5 : 1.2, vomit || accident ? null : col); m.position.set(x, 0.17, z); // above room floors and rugs, so it can be seen
  scene.add(m); R.litter.push({ mesh: m, heavy: true });
}
function dropVomit(x, z) { if (R.litter.length >= 25) return; dropPuddle(x + 0.35, z, '#A3B04A'); R.litter[R.litter.length - 1].vomit = true; floatAt({ x, y: 1.6, z }, '🤢'); }
function dropLitter(x, z) {
  if (R.litter.length >= 25) return;
  const m = Math.random() < 0.5 ? cyl(0.1, 0.07, 0.24, crnd(['#FFFFFF', '#7CC4A4'])) : sph(0.13, '#F4EFE6');
  if (m.geometry.type === 'CylinderGeometry') m.rotation.z = Math.PI / 2;
  m.position.set(x + (Math.random() - 0.5) * 0.6, 0.18, z + (Math.random() - 0.5) * 0.6); scene.add(m);
  R.litter.push({ mesh: m });
}
function spawnRat() {
  const g = new THREE.Group(); put(rbox(0.34, 0.16, 0.18, '#8A8592', 0.08), 0, 0.2, 0, g); put(sph(0.08, '#8A8592'), 0.2, 0.22, 0, g);
  put(sph(0.04, '#FFB3C0'), 0.17, 0.3, 0.06, g); put(sph(0.04, '#FFB3C0'), 0.17, 0.3, -0.06, g);
  const tail = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.015, 6, 20, Math.PI), mat('#FFB3C0')); tail.rotation.x = Math.PI / 2; put(tail, -0.3, 0.14, 0, g);
  g.position.set(6.2, 0.1, 6.2); scene.add(g);
  const r = { mesh: g, tx: 3, tz: 3, wait: 0 }; R.rats.push(r); S.st = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }; S.st.rats++;
  tip('rat'); if (!S.ratSeen) { S.ratSeen = true; chat(t('from.hq'), t('pest.chat'), '🐀'); }
}
const messIcons = new Map();
const MESS_V = new THREE.Vector3();
function pickMess(e) { // finger-friendly like pickVisitor: the icon nearest the tap on screen, within ~34 px
  let best = null, bd = 34; for (const [o, sp] of messIcons) { if (!sp.visible) continue; MESS_V.copy(sp.position).project(cam); if (MESS_V.z > 1) continue;
    const d = Math.hypot((MESS_V.x + 1) / 2 * innerWidth - e.clientX, (1 - MESS_V.y) / 2 * innerHeight - e.clientY); if (d < bd) { bd = d; best = o; } }
  return best;
}
function prioMess(o) { // tapped a mess icon: the nearest free cleaner drops what they were walking to and deals with it first
  o.prio = true; const p = o.mesh.position; floatAt({ x: p.x, y: 1.4, z: p.z }, '❗');
  const crew = R.staff.filter((rs) => rs.data.role === 'maint' && !rs.away && rs.at !== 'break');
  if (!crew.length) { tip('litter', null, true); return; }
  const idle = crew.filter((rs) => !rs.task || rs.task.kind === 'chore').sort((a, b) => Math.hypot(a.av.position.x - p.x, a.av.position.z - p.z) - Math.hypot(b.av.position.x - p.x, b.av.position.z - p.z));
  if (idle.length) { const rs = idle[0]; if (rs.task) { rs.task = null; holdBroom(rs.av, false); } maintGo(rs, { kind: R.rats.includes(o) ? 'rat' : 'litter', obj: o, pr: -1 }); }
}
function updateMessIcons() { // 🤢 over a puddle, 🗑️ over litter, 🐀 over a rat: the player sees where the centre is dirty
  const live = new Set([...R.litter, ...R.rats]), now = performance.now();
  for (const [o, sp] of messIcons) if (!live.has(o)) { scene.remove(sp); messIcons.delete(o); }
  for (const o of live) {
    let sp = messIcons.get(o); if (!sp) { sp = new THREE.Sprite(iconTex(R.rats.includes(o) ? '🐀' : o.heavy ? '🤢' : '🧹')); sp.scale.set(0.38, 0.38, 1); sp.renderOrder = 9; sp.userData.mess = o; scene.add(sp); messIcons.set(o, sp); }
    const p = o.mesh.position; sp.position.set(p.x, 1.05 + Math.sin(now / 300 + p.x) * 0.06, p.z); if (o.prio) { const k = 0.46 + Math.sin(now / 160) * 0.05; sp.scale.set(k, k, 1); }
  }
}
function pestUpdate(dt) { updateMessIcons();
  if (unlocked('maint') && R.litter.length >= 5 && !R.staff.some((rs) => rs.data.role === 'maint')) tip('litter');
  if (R.litter.length >= 6 && R.rats.length < 3 && RNG() < dt * (done('bins') ? 0.01 : 0.025)) spawnRat();
  for (const r of R.rats) {
    const p = r.mesh.position; const dx = r.tx - p.x, dz = r.tz - p.z, d = Math.hypot(dx, dz);
    if (d < 0.1) { r.wait -= dt; if (r.wait <= 0) { r.tx = 0.6 + Math.random() * 5.4; r.tz = 0.6 + Math.random() * 5.4; r.wait = 1 + Math.random() * 2; } }
    else { p.x += dx / d * dt * 1.6; p.z += dz / d * dt * 1.6; r.mesh.rotation.y = Math.atan2(dx, dz) - Math.PI / 2; }
  }
  vb('dirt', 0 - (R.litter.length * 0.0015 + R.litter.filter((l) => l.heavy).length * 0.005 + R.rats.length * 0.012) * dt);
}

// ---------------- inspector ----------------
// three kinds of visit (London only gets the health one): each scores the centre on different things, and the reward grows with the score, the city and a streak of good visits
const INSP = { epi: { e: '🦠', look: { shirt: '#4E8C7A', pants: '#2F3A4A', hair: '#3A3A3A' } }, health: { e: '📋', look: { shirt: '#5E6B7A', pants: '#3B4452', hair: '#5A5A5A' } }, safety: { e: '🦺', look: { shirt: '#F28C28', pants: '#2F3A4A', hair: '#2B2B2B' } }, critic: { e: '🕵️', look: { shirt: '#2D2D3A', pants: '#1F1F28', hair: '#7A4B2A' } } };
function spawnInspector(force) {
  if (!force) tip('insp');
  const kinds = (S.city || 'london') === 'london' ? ['health'] : Object.keys(INSP).filter((k) => k !== S.inspLast && k !== 'epi');
  const kind = force || rnd(kinds); if (!force) S.inspLast = kind; const L = INSP[kind].look;
  const av = visPerson({ epi: 'sp_health', health: 'sp_health', safety: 'sp_safety', critic: 'sp_mystery' }[kind] || 'v16', { skin: rnd(SKIN), hair: L.hair, style: 'short', shirt: L.shirt, pants: L.pants, clip: kind !== 'critic', glasses: kind !== 'safety', tall: 1.12, wide: 0.9, nose: true });
  av.position.set(3, 0.1, 12.5); scene.add(av);
  R.inspector = { kind, av, path: [{ x: 3.2, z: 7.5 }, { x: 3, z: 3 }, { x: 1.2, z: 1.2 }, { x: 3.5, z: 2.5 }], ph: 0, stage: 0, wait: 0 };
  chat(t('ik.' + kind), t('ik.' + kind + '.arrive'), INSP[kind].e);
}
function inspectorUpdate(dt) {
  const I = R.inspector; if (!I) return;
  if (I.stage === 0) { if (stepWalker(I, dt, 1.4)) { I.stage = 1; I.wait = 6; const rs0 = Object.values(R.rooms); const d1 = rs0.length ? doorPt(rnd(rs0).def, 0.9) : { x: 3.5, z: 4 }, d2 = rs0.length ? doorPt(rnd(rs0).def, 0.9) : { x: 2, z: 3 }; I.tour = findPath(I.av.position, d1).concat(findPath(d1, d2)); const pa = I.av.userData.p; if (pa.anim) pa.anim.set('lookwalk'); } }
  else if (I.stage === 1) { I.wait -= dt; const pa = I.av.userData.p, q = I.tour && I.tour[0]; // walks slowly between two rooms, looking around and taking notes
    if (q) { const dx = q.x - I.av.position.x, dz = q.z - I.av.position.z, d = Math.hypot(dx, dz); if (d < 0.15) { I.tour.shift(); if (!I.tour.length && pa.anim) pa.anim.set('idle'); } else { const st = Math.min(d, dt * 0.75); I.av.position.x += dx / d * st; I.av.position.z += dz / d * st; turnTo(I.av, Math.atan2(dx, dz), dt, 5); if (pa.anim && pa.anim.state !== 'lookwalk') pa.anim.set('lookwalk'); } }
    if (I.wait <= 0 && (!I.tour || !I.tour.length || I.wait < -8)) { verdict(I.kind || 'health'); I.stage = 2; I.path = [{ x: 3.2, z: 7.5 }, { x: 3, z: 13 }]; } }
  else if (stepWalker(I, dt, 1.8)) { scene.remove(I.av); R.inspector = null; }
}
function inspScore(kind) {
  const ded = []; const minus = (k, n) => { if (n > 0) ded.push([k, Math.round(n)]); };
  const waiting = R.visitors.filter((v) => ['queue', 'wait'].includes(v.state)), heavy = R.litter.filter((l) => l.heavy).length;
  if (kind === 'epi') {
    minus('litter', R.litter.length * 7 + heavy * 8); minus('rats', R.rats.length * 18); minus('vomit', R.litter.filter((l) => l.vomit).length * 6);
    minus('dirty', Object.values(R.rooms).reduce((a, room) => a + ((room.def.dirt || 0) >= 0.35 ? (room.def.dirt || 0) * 12 : 0), 0));
    minus('sickw', sickAtWork().length * 12); minus('sickp', R.visitors.filter((v) => v.virus && !v.cured && ['queue', 'wait', 'toWait'].includes(v.state)).length * 6);
  } else if (kind === 'health') {
    minus('litter', R.litter.length * 7 + heavy * 8); minus('rats', R.rats.length * 18); if (!hasRoom('toilet')) minus('loo', 15);
    if (!R.staff.some((rs) => rs.at === 'desk')) minus('desk', 20);
    minus('staff', Object.values(R.rooms).filter((room) => ROOMS[room.type].role && !room.staff.some(Boolean)).length * 10);
    minus('dirty', Object.values(R.rooms).reduce((a, room) => a + ((room.def.dirt || 0) >= 0.35 ? (room.def.dirt || 0) * 12 : 0), 0));
    minus('vomit', R.litter.filter((l) => l.vomit).length * 6);
  } else if (kind === 'safety') {
    minus('inc', (S.inc || []).length * 22); if (cityOf().power && (S.genBroken || (S.gen && genFuel() <= 0))) minus('gen', 15);
    minus('crowd', Math.max(0, waiting.length - 10) * 4); minus('temp', Math.min(20, tempOff() * 5)); minus('slip', heavy * 8);
    if (!R.staff.some((rs) => rs.data && rs.data.role === 'maint')) minus('maint', 12);
  } else {
    const avgPat = waiting.length ? waiting.reduce((a, v) => a + v.pat, 0) / waiting.length : 1;
    minus('wait', (1 - avgPat) * 45); minus('vibes', Math.max(0, 75 - S.vibes) * 0.8); minus('temp', Math.min(15, tempOff() * 4));
    minus('litter', R.litter.length * 4); minus('rats', R.rats.length * 12); if (!hasRoom('cafe') && !(S.decor || []).some((d) => d.k === 'sofa')) minus('comfort', 8);
  }
  ded.sort((x, y) => y[1] - x[1]);
  return { sc: clamp(100 - ded.reduce((a, d) => a + d[1], 0), 0, 100), ded };
}
function verdict(kind = 'health') {
  if (kind === 'epi') return epiVerdict();
  const { sc, ded } = inspScore(kind), lv = cityOf().lvl || 0, base = Math.round(RENT * 0.25 * (1 + 0.1 * lv) / 50) * 50; // tied to the weekly rent so it weighs the same in every city
  const tier = sc >= 95 ? 'gold' : sc >= 85 ? 'great' : sc >= 70 ? 'pass' : sc >= 55 ? 'warn' : 'fail';
  const T = { gold: [3, 8, 5], great: [2, 6, 4], pass: [1, 4, 3], warn: [-0.5, -3, 0], fail: [-2.5, -10, 0] }[tier];
  if (tier === 'fail' || tier === 'warn') S.nextInspect = S.day + (tier === 'fail' ? 1 : 2); // they come back soon to check it was fixed
  if (T[0] > 0) S.inspStreak = (S.inspStreak || 0) + 1; else S.inspStreak = 0;
  const streak = T[0] > 0 ? Math.min(S.inspStreak, 6) - 1 : 0, cash = Math.round(base * T[0] * (1 + 0.2 * Math.max(0, streak)) / 50) * 50;
  S.cash += cash; vb('insp', 0 + T[1]); if (T[2]) addKudos(T[2]); if (T[0] > 0) incCnt('insp');
  const m = (cash >= 0 ? '+' : '−') + money(Math.abs(cash)), v = (T[1] >= 0 ? '+' : '−') + Math.abs(T[1]) + '%';
  chat(t('ik.' + kind), t('iv.' + tier) + ' · ' + t('iv.p', { s: sc, m, v }), INSP[kind].e);
  const why = ded.slice(0, 3).map(([k, n]) => `<div style="display:flex;justify-content:space-between;gap:8px"><span>${t('iv.r.' + k)}</span><b>−${n}</b></div>`).join('');
  modal(`<div style="font-size:44px">${tier === 'gold' ? '🏆' : tier === 'fail' ? '❌' : INSP[kind].e}</div><h2>${t('ik.' + kind)} · ${t('iv.' + tier)}</h2><p style="font:700 22px Fredoka">${sc}/100</p><p>${t('iv.p', { s: sc, m, v })}</p>
  ${streak > 0 ? `<p style="font-weight:800;color:#B7791F">🔥 ${t('iv.streak', { n: S.inspStreak, p: Math.round(streak * 20) })}</p>` : ''}${T[0] < 0 ? `<p style="font-weight:800;color:var(--red)">🔁 ${t('iv.back', { n: tier === 'fail' ? 1 : 2 })}</p>` : ''}${why ? `<div class="receipt" style="text-align:left"><div style="font-weight:800;margin-bottom:4px">${t('iv.lost')}</div>${why}</div>` : ''}
  <button class="btn g" id="mOk" style="width:100%">${t('insp.ok')}</button>`);
  $('mOk').onclick = closeModal;
}

// ---------------- emergencies ----------------
// a burst of 1–4 emergencies back to back, then a calm stretch of a few days; sizes and gaps are random so the rhythm never settles
function emProbs(k) { const D = EMERGENCIES[k]; return D ? (D.mix ? ['*mix'].concat(D.bias || []) : D.probs) : []; }
function emStartBurst() { const st2 = (S.stars || 0) >= 2, r = Math.random(); S.emBurst = st2 ? (r < 0.15 ? 1 : r < 0.55 ? 2 : r < 0.85 ? 3 : 4) : (r < 0.6 ? 1 : 2); S.emAt = 8 + Math.random() * 40; }
function emNext() { // called whenever an emergency is over (won, failed or declined)
  if ((S.emBurst || 0) > 0) { S.emAt = S.t + 12 + Math.random() * 30; return; } // may run past midnight: carried over at day rollover
  const st2 = (S.stars || 0) >= 2; S.nextEm = S.day + (st2 ? 3 + Math.floor(Math.random() * 2) : 4 + Math.floor(Math.random() * 3)); }
// the clock is sized to your centre: roughly the time your staffed rooms need to help that many people, +40 %, plus walking time
function emClock(E) {
  const types = new Set(E.mix ? Object.keys(ROOMS).filter((k) => ROOMS[k].role && !ROOMS[k].shop && !ROOMS[k].train && k !== 'cafe' && k !== 'lab') : (E.probs || []).map((p) => PROBLEMS[p] && PROBLEMS[p].room).filter(Boolean));
  let thr = 0; for (const r of Object.values(R.rooms)) if (types.has(r.type) && r.staff.some(Boolean)) thr += (capOf(r.type, r.size) || 1) * sizeSpd(r) / (ROOMS[r.type].time || 9);
  const max = E.time || 150; if (!thr) return max;
  return Math.round(clamp((E.need || 4) / thr * 1.4 + 25, 60, max));
}
function emFail(E) {
  vb('em', -12); const fine = Math.round(RENT * 0.15 / 50) * 50; S.cash -= fine;
  for (const v of R.visitors.filter((u) => u.em && !u.cured && !['exit', 'angry'].includes(u.state))) leave(v, false); // the ones you could not help walk out angry
  S.em = null; emNext(); toast(t('em.fail') + ' −' + money(fine), 3500); chat(t('from.hq'), t('em.failFine', { m: money(fine) }), '😬');
}
// which care rooms this emergency will send people to: the ones you have (staffed or not), and any you'd still need to build
function emRoomsHtml(E) {
  const city = S.city || 'london', ok = (pk) => PROBLEMS[pk] && PROBLEMS[pk].room && ROOMS[PROBLEMS[pk].room] && !PROBLEMS[pk].myst && (!PROBLEMS[pk].city || PROBLEMS[pk].city === city) && lvlOk(pk);
  let need = [], maybe = false;
  if (E.mix) { const bias = (E.bias || []).filter(ok).map((pk) => PROBLEMS[pk].room); need = [...new Set(bias.concat(Object.keys(PROBLEMS).filter((pk) => ok(pk) && hasRoom(PROBLEMS[pk].room)).map((pk) => PROBLEMS[pk].room)))];
    maybe = !!E.stars && Object.keys(PROBLEMS).some((pk) => ok(pk) && !hasRoom(PROBLEMS[pk].room) && unlocked(PROBLEMS[pk].room)); }
  else need = [...new Set((E.probs || []).filter(ok).map((pk) => PROBLEMS[pk].room))];
  if (!need.length && E.room) need = [E.room];
  const staffed = (type) => Object.values(R.rooms).some((r) => r.type === type && r.staff.some((x) => x));
  const chip = (type) => { const has = hasRoom(type), st = has && staffed(type);
    return `<span style="display:inline-block;margin:3px;padding:4px 10px;border-radius:12px;background:${has ? (st ? '#EEE8FB' : '#FFF3CF') : '#FDE3E3'};font-weight:700;white-space:nowrap">${ROOMS[type].e} ${rn(type)}${has ? (st ? '' : ' · ' + t('em.noStaff')) : ' · ' + t('em.toBuild')}</span>`; };
  return `<p style="margin:8px 0 2px;font-weight:800">${t('em.rooms')}</p><div style="line-height:1.4">${need.map(chip).join('')}</div>${maybe ? `<p style="font-size:14px;opacity:.8;margin-top:4px">${t('em.maybe')}</p>` : ''}`;
}
// what a care room treats in this city, at this point of the career (so new and local ailments show up in the build menu)
function treatList(k) { const c = S.city || 'london', ps = Object.keys(PROBLEMS).filter((p) => PROBLEMS[p].room === k && !PROBLEMS[p].myst && !PROBLEMS[p].epi && (!PROBLEMS[p].city || PROBLEMS[p].city === c) && lvlOk(p) && !isNewK(p));
  const diag = k === 'therapy' && NEWP() ? t('disc.diagRoom') + (ps.length ? ' · ' : '') : '';
  return ps.length || diag ? diag + (ps.length ? t('build.soigne', { list: ps.map((p) => t('p.' + p)).join(', ') }) : '') : ''; }
function offerEmergency() {
  tip('em');
  const city = S.city || 'london';
  let keys = Object.keys(EMERGENCIES).filter((e) => unlocked(EMERGENCIES[e].room) && (!EMERGENCIES[e].city || EMERGENCIES[e].city === city) && EMERGENCIES[e].notCity !== city && (S.stars || 0) >= (EMERGENCIES[e].stars || 0));
  // never the same emergency, nor one about the same problems, twice in a row
  const last = new Set(emProbs(S.emLast)), fresh = keys.filter((e) => e !== S.emLast && !emProbs(e).some((p) => last.has(p)));
  keys = fresh.length ? fresh : keys.filter((e) => e !== S.emLast).length ? keys.filter((e) => e !== S.emLast) : keys;
  if (!keys.length) { S.emBurst = 0; emNext(); return; }
  const big = keys.filter((e) => EMERGENCIES[e].stars), k = big.length && RNG() < 0.55 ? rnd(big) : rnd(keys); const E = EMERGENCIES[k];
  S.emLast = k; S.emBurst = Math.max(0, (S.emBurst || 1) - 1);
  const missing = !hasRoom(E.room);
  const clk = emClock(E), mmss = Math.floor(clk / 60) + ':' + String(clk % 60).padStart(2, '0');
  modal(`<div style="font-size:44px">🚨</div><h2>${t('em.' + k)}</h2><p>${t('em.' + k + '.d').replace(/\b\d:\d\d\b/, mmss)}</p><p style="font-weight:800">⏱️ ${t('em.clock', { t: mmss })}</p><p style="color:var(--green-d)">${E.reward ? t('em.rewardN', { m: money(E.reward) }) : t('em.reward')}</p>${emRoomsHtml(E)}
  <div class="row2" style="margin-top:10px"><button class="btn y" id="emNo">${t('em.decline')}</button><button class="btn g" id="emYes">${t('em.accept')}</button></div>`);
  $('emNo').onclick = () => { closeModal(); emNext(); };
  $('emYes').onclick = () => { closeModal(); AU.sfx('siren'); E.time0 = clk; say('em', t('pa.em', { name: t('em.' + k) }), 0); S.em = { k, need: E.need || 4, got: 0, t: clk, left: E.n || 6, spawnT: 0, gap: E.gap || 3, reward: E.reward || 2500 }; S.em.t0 = S.em.t; chat(t('from.hq'), '🚨 ' + t('em.' + k), '🚨'); };
}
function emergencyUpdate(dt) {
  const E = S.em; if (!E) return;
  E.t -= dt; E.spawnT -= dt;
  if (E.left > 0 && E.spawnT <= 0) { E.spawnT = E.gap || 3; E.left--; const D = EMERGENCIES[E.k];
    const ok = (pk) => PROBLEMS[pk] && PROBLEMS[pk].room && hasRoom(PROBLEMS[pk].room) && !isMystK(pk) && !isNewK(pk) && (!PROBLEMS[pk].city || PROBLEMS[pk].city === (S.city || 'london')) && lvlOk(pk);
    let pool = D.probs; if (D.mix) { const b = (D.bias || []).filter(ok); pool = b.length && RNG() < 0.6 ? b : Object.keys(PROBLEMS).filter(ok);
      if (D.stars && RNG() < 0.2) { const city = S.city || 'london', miss = Object.keys(PROBLEMS).filter((pk) => PROBLEMS[pk].room && ROOMS[PROBLEMS[pk].room] && !hasRoom(PROBLEMS[pk].room) && !isMystK(pk) && !PROBLEMS[pk].myst && (!PROBLEMS[pk].city || PROBLEMS[pk].city === city) && lvlOk(pk) && unlocked(PROBLEMS[pk].room)); if (miss.length) pool = miss; } } // ~20 % come with a problem you have no room for
    spawnVisitor(rnd(pool.length ? pool : ['hustle']), true); }
  if (E.got >= E.need) { incCnt('emwin'); addKudos(5); S.cash += E.reward || 2500; floatAt(new THREE.Vector3(2, 1.5, 4), '🎉 +' + money(E.reward || 2500)); vb('em', 0 + 8); S.em = null; emNext(); toast(t('em.win'), 3500); chat(t('from.hq'), t('em.win'), '🎉'); }
  else if (E.t <= 0 || E.got + E.left + R.visitors.filter((u) => u.em && !u.cured && !['exit', 'angry'].includes(u.state)).length < E.need) emFail(E); // out of time, or too many already gone
}

// ---------------- research ----------------
function researchUpdate(dt) {
  const A = S.research.active; if (!A) return;
  let rate = 0;
  for (const rs of R.staff) if (rs.data.role === 'researcher' && R.rooms[rs.at] && R.rooms[rs.at].type === 'lab' && rs.mode === 'there') rate += (0.5 + rs.data.skill * 0.35 * traitVal(rs.data, 'speed')) * energyF(rs); // a tired researcher is slower all round (and the staff room's breaks keep them fresh)
  S.research.pts += rate * boost() * dt;
  if (S.research.pts >= PROJECTS[A].cost) { S.research.done.push(A); S.research.active = null; S.research.pts = 0; if (PROJECTS[A].dev) { devDone(PROJECTS[A].dev); return; } const nm = PROJECTS[A].myst ? t('p.' + PROJECTS[A].myst) : t('rp.' + A); toast(t('research.complete', { name: nm }), 3500); chat(t('research.title'), t('research.complete', { name: nm }), '🔬'); if (PROJECTS[A].myst) for (const v of R.visitors) if (v.known && v.prob === PROJECTS[A].myst) v.icon.material = iconTex(PROBLEMS[v.prob].e); }
}
function openResearch() {
  if (S) S.tutRes = true;
  const hasLab = hasRoom('lab') && R.staff.some((rs) => rs.data.role === 'researcher');
  const res = R.staff.filter((rs) => rs.data.role === 'researcher'), rate = (rs) => (0.5 + rs.data.skill * 0.35 * traitVal(rs.data, 'speed')) * energyF(rs) * (R.rooms[rs.at] && R.rooms[rs.at].type === 'lab' && rs.mode === 'there' ? 1 : 0);
  const fx = (n) => n.toFixed(1).replace('.', ['en', 'ja', 'ko'].includes(getLang()) ? '.' : ',');
  let h = `<h2>${t('research.title')}</h2>${hasLab ? '' : `<p class="sub">${t('research.needLab')}</p>`}`;
  // who is researching, and how fast (stars, points a second, energy)
  for (const rs of res) { const d = rs.data, r = rate(rs), en = Math.round((d.energy ?? 1) * 100);
    h += `<div class="w" style="border-radius:16px;padding:10px 12px;margin-bottom:10px;display:flex;gap:10px;align-items:center"><img src="${portrait(d)}" alt="" style="width:44px;height:44px;border-radius:22px;flex:none;background:#E3ECF5"><div style="min-width:0"><b class="f" style="font-size:16px">${d.name} · ${'★'.repeat(d.skill)}</b><div style="font-size:13px;font-weight:700;color:var(--muted)">${t('rs.speed', { n: fx(r) })} · ${t('rs.energy', { n: en })}${r ? '' : ' · ' + t('rs.away')}</div></div></div>`; }
  // what is running now, with its bar
  const A = S.research.active, AP = A && PROJECTS[A];
  if (AP) { const pct = Math.min(100, Math.round(S.research.pts / AP.cost * 100)), tot = res.reduce((a, rs) => a + rate(rs), 0), left = tot > 0 ? (AP.cost - S.research.pts) / tot / DAY_LEN : null;
    const nm = AP.dev ? t('rp.dev', { room: rn(AP.dev) }) : AP.myst ? t('rp.myst') : t('rp.' + A);
    h += `<div class="w" style="border-radius:16px;padding:12px;margin-bottom:12px;border-color:var(--blue)"><div style="display:flex;justify-content:space-between;gap:8px;align-items:baseline"><b class="f" style="font-size:16px">${AP.dev ? ROOMS[AP.dev].e : AP.e} ${nm}</b><span style="font-size:13px;font-weight:800;color:var(--blue);white-space:nowrap">${left == null ? '—' : t('rs.left', { n: fx(Math.max(0.1, left)) })}</span></div>
      <div style="height:12px;border-radius:6px;background:var(--line);margin:8px 0 4px;overflow:hidden"><div style="width:${pct}%;height:12px;background:var(--blue)"></div></div><div style="font-size:12px;font-weight:700;color:var(--muted)">${t('research.points', { p: Math.floor(S.research.pts), n: AP.cost })}</div></div>`; }
  h += bookHtml();
  const card = (k, P, e, title, sub, meta, btn) => `<div class="opt w"><div class="oi" style="background:#E3ECF5">${e}</div><div class="ot"><b>${title}</b><div>${sub}</div>${meta ? `<div style="font-size:12px;font-weight:800;color:var(--blue)">${meta}</div>` : ''}</div>${btn}</div>`;
  const startBtn = (k, extra) => `<button class="btn g" data-res="${k}" ${!hasLab || S.research.active === k || extra ? 'disabled' : ''}>${S.research.active === k ? t('research.active') : t('research.start')}</button>`;
  const sec = (title, body) => body ? `<div class="lbl" style="margin:12px 2px 6px;font-weight:800">${title}</div>` + body : '';
  let dev = '', myst = '', up = '';
  for (const [k, P] of Object.entries(PROJECTS)) {
    if (P.dev) { if (!NEWP() || !devWanted(P.dev)) continue; const paid = (S.devPaid || {})[k], cost = devCost(P.dev);
      dev += card(k, P, ROOMS[P.dev].e, t('rp.dev', { room: rn(P.dev) }), t('rp.devD', { list: devFor(P.dev).map((q) => t('p.' + q)).join(', ') }), P.cost + ' pts' + (paid ? '' : ' · ' + money(cost)), startBtn(k, !paid && S.cash < cost)); continue; }
    if (P.myst) { if (!(S.mystSeen || []).includes(P.myst)) continue; const isDone = done(k);
      myst += card(k, P, '❓', isDone ? t('rp.mystDone', { name: t('p.' + P.myst) }) : t('rp.myst'), t('rp.mystD', { room: rn(PROBLEMS[P.myst].room) }), isDone ? '' : P.cost + ' pts', isDone ? `<span class="tr good">${t('research.done')}</span>` : startBtn(k)); continue; }
    const isDone = done(k);
    up += card(k, P, P.e, t('rp.' + k), t('rp.' + k + '.d'), isDone || k === 'rent' ? '' : P.cost + ' pts', isDone ? `<span class="tr good">${t('research.done')}</span>` : startBtn(k));
  }
  h += sec('🧪 ' + t('rs.secDev'), dev) + sec('❓ ' + t('rs.secMyst'), myst) + sec('⚙️ ' + t('rs.secUp'), up);
  openSheet(h);
  $('sheet').querySelectorAll('[data-res]').forEach((b) => b.onclick = () => { const k = b.dataset.res, P = PROJECTS[k];
    if (P.dev && !(S.devPaid || {})[k]) { const c = devCost(P.dev); if (S.cash < c) { toast(t('build.noCash')); return; } S.cash -= c; (S.devPaid = S.devPaid || {})[k] = 1; } // a room's development is paid once, even if research switches away and back
    S.research.active = k; S.research.pts = 0; openResearch(); });
}

// ---------------- UI helpers ----------------
function toast(html, ms = 2600) { const el = $('toast'); el.innerHTML = html; el.classList.add('on'); clearTimeout(toast.h); toast.h = setTimeout(() => el.classList.remove('on'), ms); }
// The HQ chat has two tabs: Important (decisions, problems, news that matters; the badge counts these) and All (adds jokes, hellos,
// ambience). Messages with `act` carry real choices: each option has an effect in the game and the sender answers.
function chat(from, text, icon = '💬', o = {}) {
  if (S && S.mode === 'career' && String(from).startsWith(t('from.review')) && !o.act) text = '<b style="color:#E3A008">' + '★'.repeat(clamp(Math.round(S.vibes / 20), 1, 5)) + '☆'.repeat(5 - clamp(Math.round(S.vibes / 20), 1, 5)) + '</b> ' + text;
  const m = { from, text, day: S.day, icon, fun: !!o.fun }; if (o.act) m.act = o.act;
  S.chat.unshift(m); S.chat = S.chat.slice(0, 50); if (!m.fun) S.unread++;
  if (m.fun && $('banner').classList.contains('on')) return; // a joke never covers a real message
  // fewer pop-ups: reviews only go to the chat (their tab shows the count); other news pops up at most every 12 s unless it needs a decision
  const now = performance.now(), review = String(from).startsWith(t('from.review')) && !o.act;
  if (review || (!o.act && now - (chat.lastB || -1e9) < 12000)) { updateBadge(); return; }
  chat.lastB = now;
  $('bnFrom').textContent = from.toUpperCase(); $('bnText').innerHTML = text; $('banner').querySelector('.bi').textContent = icon; updateBadge();
  const bn = $('banner'); bn.classList.remove('on'); void bn.offsetWidth; bn.classList.add('on'); clearTimeout(chat.h); chat.h = setTimeout(() => bn.classList.remove('on'), 5000);
}
$('banner').onclick = () => { if (inGame) openChat(); };
function updateBadge() { const b = $('chatBadge'); b.style.display = S.unread ? 'block' : 'none'; b.textContent = S.unread; }
const proj = new THREE.Vector3();
function toScreen(x, y, z) { proj.set(x, y, z).project(cam); return [(proj.x + 1) / 2 * innerWidth, (1 - proj.y) / 2 * innerHeight]; }
function floatAt(pos, txt, bad) { const [x, y] = toScreen(pos.x, pos.y + 2.3, pos.z); const d = document.createElement('div'); d.className = 'float' + (bad ? ' bad' : ''); d.textContent = txt; d.style.left = x + 'px'; d.style.top = y + 'px'; $('labels').appendChild(d); setTimeout(() => d.remove(), 1300); }
let sheetPaused = false, modalPaused = false;
function openSheet(html) { AU.sfx('click'); $('sheet').innerHTML = `<div class="grab" style="margin:0 auto 8px"></div><button class="shx" aria-label="${t('ui.close')}" onclick="this.closest('#sheet') && document.getElementById('shade').click()">✕</button>` + html; $('sheet').classList.add('on'); $('shade').classList.add('on'); sheetPaused = true; }
// After the tutorial, building happens in real time: the Build menus and placing a room or decor no longer freeze the clock,
// and opening Build while paused resumes the game (otherwise pause + build skips the time pressure).
const liveBuild = () => !!(S && S.mode === 'career' && S.tut < 0);
function resumeForBuild() { if (liveBuild() && speedMul === 0) { setSpeed(lastSpeed || 1); toast('▶️ ' + t('build.live'), 2200); } }
function buildSheet(html) { openSheet(html); if (!liveBuild()) return; sheetPaused = false; if (speedMul === 0) { setSpeed(lastSpeed || 1); toast('▶️ ' + t('build.live'), 2200); } }
function closeSheet() { $('sheet').classList.remove('on'); $('shade').classList.remove('on'); sheetPaused = false; }
$('shade').onclick = () => { closeSheet(); placing = null; };
// ---- problem intro: the first time a problem shows up in a city, explain what it is and where it's treated ----
function probCard(k, fresh) {
  const P = PROBLEMS[k], r = P.room, R0 = ROOMS[r] || {}, built = hasRoom(r);
  modal(`<div style="font-size:46px;line-height:1">${P.e}</div>${fresh ? `<div class="lbl" style="margin-top:4px">${t('pi.title')}</div>` : ''}<h2 style="margin:4px 0 8px">${pn(k)}</h2>
    <div class="w" style="border-radius:14px;padding:10px 12px;text-align:left"><div class="lbl" style="margin:0 0 2px">${t('pi.real')}</div><div style="font-size:14px;font-weight:700">${t('pd.' + k)}</div></div>
    <div class="w" style="border-radius:14px;padding:10px 12px;margin-top:8px;text-align:left"><div class="lbl" style="margin:0 0 2px">${t('pi.cure')}</div><b>${R0.e || ''} ${rn(r)}</b><div style="font-size:13px;font-weight:800;margin-top:2px;color:${built ? '#1E8A3A' : '#B45309'}">${built ? t('pi.have') : t('pi.need')}</div></div>
    <div class="row2" style="margin-top:10px">${built ? '' : `<button class="btn y" id="piBuild">🔨 ${t('pi.build')}</button>`}<button class="btn g" id="piOk" style="${built ? 'width:100%' : ''}">${t('pi.got')}</button></div>`);
  $('piOk').onclick = closeModal; if ($('piBuild')) $('piBuild').onclick = () => { closeModal(); openBuild(); };
}
function probSeen(k) { if (!S || isMystK(k) || !PROBLEMS[k]) return; S.seenP = S.seenP || {}; if (S.seenP[k]) return; S.seenP[k] = 1; (S.pQ = S.pQ || []).push(k); }
let piCool = 0;
function probIntroTick(dt) { // one card at a time, never during the tutorial or over another popup, spaced out so it never floods
  piCool -= dt; if (!S || !S.pQ || !S.pQ.length || piCool > 0 || S.tut >= 0 || $('modal').classList.contains('on') || $('sheet').classList.contains('on')) return;
  piCool = 40; const k = S.pQ.shift(); if (k.startsWith('b:')) behCard(k.slice(2)); else probCard(k, true); save();
}
function modal(html) { $('modalBox').innerHTML = html; $('modal').classList.add('on'); modalPaused = true; }
function closeModal() { $('modal').classList.remove('on'); modalPaused = false; }
function show(id) { for (const s of ['title', 'map', 'brief', 'create']) $(s).classList.toggle('on', s === id); $('hud').classList.toggle('on', id === 'game'); $('labels').style.display = id === 'game' ? 'block' : 'none'; inGame = id === 'game'; if (id !== 'game') selectVisitor(null); }
function applyStatic() { if (S && S.city) { TV.city = t('city.' + S.city); TV.transit = t('tr.' + S.city); } document.querySelectorAll('[data-i18n]').forEach((el) => { el.innerHTML = t(el.dataset.i18n); }); $('langCode').textContent = getLang().toUpperCase(); }

// ---------------- labels ----------------
const labelEls = {};
function label(key, cls, html, onTap) {
  let el = labelEls[key];
  if (!el) { el = document.createElement('div'); $('labels').appendChild(el); labelEls[key] = el; if (onTap) el.addEventListener('pointerup', (e) => { e.stopPropagation(); onTap(); }); }
  el.className = 'rl ' + cls; if (el._h !== html) { el.innerHTML = html; el._h = html; } el.style.background = ''; return el;
}
function clearLabels() { for (const k in labelEls) { labelEls[k].remove(); delete labelEls[k]; } }
function at(el, x, y, z) { const [sx, sy] = toScreen(x, y, z); el.style.left = sx + 'px'; el.style.top = sy + 'px'; }
function updateLabels() {
  const seen = new Set();
  for (const room of Object.values(R.rooms)) {
    const q = roomRect(room.def), needStaff = ROOMS[room.type].role && !room.staff.some(Boolean);
    const ix = incOf(room.id); const el = label('r' + room.id, needStaff || room.closed || ix ? 'warn tap' : 'tap', ix ? INC[ix.k].e + ' ' + rn(room.type) + ' · ' + (INC[ix.k].closes ? t('ev.closed') : t('inc.slow')) + ' · ' + incLeft(ix) : room.closed ? '💧 ' + rn(room.type) + ' · ' + t('ev.closed') : needStaff ? t('room.needs', { room: rn(room.type), role: roleN(ROOMS[room.type].role) }) : rn(room.type) + roomNo(room) + (roomQ(room.id).length ? ' · 👥' + roomQ(room.id).length : '') + ((room.lineQ || []).length ? ' · 👥' + room.lineQ.length : '') + (roomWeek(room.id) ? ' · 💵' + money(roomWeek(room.id)) + ' ' + t('room.wkShort') : ''), () => openRoomMenu(room.id));
    if (needStaff && R.visitors.some((v) => v.state === 'wait' && v.known && needOf(v) === room.type)) say('ns' + room.type, t('room.needs', { room: rn(room.type), role: roleN(ROOMS[room.type].role) }), 50);
    else if (roomQ(room.id).length >= 5) say('q' + room.id, t('pa.queue', { room: rn(room.type) + roomNo(room) }), 90);
    if (!needStaff && !room.closed) el.style.background = ROOMS[room.type].pill; at(el, room.cx, 3.0, q.z0 + 0.3); seen.add('r' + room.id);
    el.style.display = LOOK_DAY && !(needStaff || room.closed || ix) ? 'none' : '';
  }
  if (S.mode === 'career' && S.garden) { const ok = GARDEN_OK(), o = outsideT(), why = ok ? 'open' : S.rainy && !S.gardenRoof ? 'rain' : o <= (S.gardenHeat ? -2 : 8) ? 'cold' : 'hot'; const [pa] = plazaX(); const el = label('garden', ok ? 'ok' : 'lock', '🌳 ' + t('gd.' + why)); at(el, Math.min(-2, pa + 3), 0.8, 8.4); seen.add('garden'); }
  if (S.mode === 'career') plotOf().lots.forEach((L, i) => { const st = lotSt(i); if (st === 'owned' || !lotOpen(i)) return; const el = label('lot' + i, 'lock', st === 'pending' ? t('lot.pending', { d: lotDay(i) }) : t('lot.expand', { cost: money(lotCost(i)) }), () => tapLot(i)); at(el, (L[0] + L[1]) / 2, 0.6, (L[2] + L[3]) / 2); seen.add('lot' + i); });
  (S.desks2 || []).forEach((E, i) => { const di = i + deskBase(); if (!deskHost(di)) { const el = label('desk' + di, 'warn', t('desk.need')); at(el, E.x, 2.2, E.z); seen.add('desk' + di); } else if (DQ(di).length >= 3) { const el = label('deskq' + di, DQ(di).length >= 6 ? 'warn' : 'tap', '🛎️ 👥' + DQ(di).length); at(el, E.x, 2.4, E.z); seen.add('deskq' + di); } });
  if (S.desk.segs && !deskHost(1) && deskHost(0)) { const d1 = desks()[1], el = label('desk1', 'warn', t('desk.need')); at(el, d1.x, 2.2, d1.z); seen.add('desk1'); }
  if (!deskHost(0)) { if (R.deskQ.length) say('desk', t('desk.need'), 50); const el = label('desk', 'warn', t('desk.need')); at(el, S.desk.x, 2.2, S.desk.z); seen.add('desk'); }
  if (unlocked('maint') && R.litter.length >= 5 && !R.staff.some((rs) => rs.data.role === 'maint')) { say('litter', t('pest.needMaint'), 80); const el = label('litter', 'warn', t('pest.needMaint')); at(el, 3, 1.2, 1.5); seen.add('litter'); }
  // (the manager has no label on the floor any more: her portrait bubble opens her menu)
  if (R.deskQ.length >= 3 && deskHost(0)) { const el = label('deskq', R.deskQ.length >= 6 ? 'warn tap' : 'tap', '🛎️ 👥' + R.deskQ.length, openDesk); el.style.background = R.deskQ.length >= 6 ? '' : '#16963C'; at(el, S.desk.x, 2.4, S.desk.z); seen.add('deskq'); }
  if (R.rats.length) say('rat', t('pest.rat'), 70);
  R.rats.forEach((r, i) => { const el = label('rat' + i, 'warn', '🐀 ' + t('pest.rat')); at(el, r.mesh.position.x, 0.9, r.mesh.position.z); seen.add('rat' + i); });
  for (const k in labelEls) if (!seen.has(k)) { labelEls[k].remove(); delete labelEls[k]; }
}

// ---------------- build ----------------
let placing = null;
function openBuild() {
  let h = `<h2>${t('build.title')}</h2><p class="sub">${t('build.sub')}</p>`;
  // grouped: reception · care rooms (with the problems each one treats) · comfort for visitors · for the team
  const cat = (k) => (ROOMS[k].staffOnly || ROOMS[k].train || k === 'lab' ? 'staff' : ROOMS[k].shop || ROOMS[k].loo || k === 'cafe' ? 'comfort' : 'care');
  const hdr = (k) => `<div class="lbl" style="margin:12px 0 6px">${t('bc.' + k)}</div>`;
  const treats = (k) => { const ps = Object.keys(PROBLEMS).filter((p) => PROBLEMS[p].room === k && !PROBLEMS[p].myst && !PROBLEMS[p].epi && (!PROBLEMS[p].city || PROBLEMS[p].city === (S.city || 'london')) && lvlOk(p)); return ps.length ? `<div style="font-size:12px;color:#2D3748;margin-top:2px"><b>${t('build.treats')}</b> ${ps.map((p) => PROBLEMS[p].e + ' ' + t('p.' + p)).join(' · ')}</div>` : ''; };
  const nOwn = (k) => S.rooms.filter((r) => r.type === k).length;
  const roomRow = (k, r) => { const ok = unlocked(k);
    return `<div class="opt w" style="${ok ? '' : 'opacity:.55'}"><div class="oi" style="background:${r.pill}22">${ok ? r.e : '🔒'}</div><div class="ot"><b>${rn(k)}</b>${ok && nOwn(k) ? ` <span class="own" style="background:#E7EEF7;color:#2D3748;border-radius:9px;padding:1px 7px;font-size:12px;font-weight:800;white-space:nowrap">${t('build.have', { n: nOwn(k) })}</span>` : ''}<div>${treatList(k) || (NEWP() ? t('build.soigne', { list: '???' }) : t('r.' + k + '.d'))}</div><div>${ok ? t('build.from', { m: money(roomCost(k, 's')) }) + (r.role ? ' · ' + t('build.needs', { role: roleN(r.role) }) : '') : (NEWP() && DEV_ROOMS[k] ? '🧪 ' + t('disc.toDev') : t('lock.at', { n: UNLOCK[k] }))}</div></div>${ok ? `<button class="btn g" data-room="${k}">${t('build.btn')}</button>` : ''}</div>`; };
  h += hdr('desk') + `<div class="opt w"><div class="oi" style="background:#FFF3C4">➕</div><div class="ot"><b>${t('desk2.title')}</b><div>${t('desk2.D', { n: (S.desks2 || []).length + 2 })}</div></div><button class="btn g" id="bDesk2">${money(DESK_COST)}</button></div>`;
  for (const c of ['care', 'comfort', 'staff']) {
    const ks = Object.entries(ROOMS).filter(([k, r]) => (!r.city || r.city === (S.city || 'london')) && !(r.train && !epiCity()) && cat(k) === c).sort(([a], [b]) => unlocked(b) - unlocked(a)); if (!ks.length) continue; // what you can build right now first, locked rooms after
    h += hdr(c) + ks.map(([k, r]) => roomRow(k, r)).join('');
  }
  h += buildExtras();
  buildSheet(h);
  if ($('bDesk2')) $('bDesk2').onclick = () => { closeSheet(); if (S.cash < DESK_COST) { toast(t('build.noCash'), 1600); return; } startMove(true); };
  $('sheet').querySelectorAll('[data-room]').forEach((b) => b.onclick = () => openSize(b.dataset.room));
  bindExtras();
}
function sizeCards(type, cur, onPick) {
  return Object.keys(SIZES).filter((s) => s !== 'l').map((s) => { // two sizes only: small and regular
    const Z = SIZES[s], cost = roomCost(type, s), diff = cur ? cost - roomCost(type, cur) : cost, price = cur ? (s === cur ? '—' : diff > 0 ? '−' + money(diff) : '+' + money(-diff / 2)) : money(cost);
    const afford = !cur ? S.cash >= cost : diff <= 0 || S.cash >= diff;
    return `<div class="opt w" style="${s === cur ? 'border-color:var(--green)' : ''}"><div class="oi" style="background:#F1F2F5;font:700 15px Fredoka">${Z.W}×${Z.D}</div><div class="ot"><b>${t('sz.' + s)}</b><div>${t('sz.' + s + 'D')}</div><div>${price}${capOf(type, s) ? ' · ' + t('sz.cap', { n: capOf(type, s) }) : ''}${type === 'lab' ? ' · ' + t('sz.res', { n: staffN(type, s) }) : ''}</div></div>${s === cur ? '' : `<button class="btn g" data-size="${s}" ${afford ? '' : 'disabled'}>${t(cur ? 'room.pick' : 'build.btn')}</button>`}</div>`;
  }).join('');
}
function openSize(type) {
  buildSheet(`<h2>${t('sz.title')}</h2><p class="sub">${t('sz.sub', { room: rn(type) })}</p>` + sizeCards(type, null));
  $('sheet').querySelectorAll('[data-size]').forEach((b) => b.onclick = () => { closeSheet(); startPlace({ type, size: b.dataset.size }); });
}
function openRoomMenu(id) {
  const room = R.rooms[id]; if (!room || placingR || moving) return;
  const r = room.def, Z = SIZES[r.size], role = ROOMS[r.type].role, refund = Math.round(roomCost(r.type, r.size) / 2);
  let h = `<h2>${ROOMS[r.type].e} ${rn(r.type)}${roomNo(room)}</h2><p class="sub">${t('room.sizeL', { s: t('sz.' + r.size) })} · ${Z.W}×${Z.D}${role ? ' · ' + t('room.staffN', { a: room.staff.filter(Boolean).length, b: room.staff.length, role: roleN(role) }) : ''}</p>`;
  { const ix = incOf(id); if (ix && ix.k === 'smash') h += `<div class="opt w" style="border-color:#E53E3E"><div class="oi" style="background:#FFE0E0">🔨</div><div class="ot"><b>${t('inc.smash', { room: rn(r.type) })}</b><div>${ix.rep ? '🧰 ' + t('inc.repairing', { left: incLeft(ix) }) : t('inc.smashD')}</div></div>${ix.rep ? '' : `<button class="btn y" id="rmRepair" ${S.cash < repairCost(r) ? 'disabled' : ''}>🧰 ${money(repairCost(r))}</button>`}</div>`;
    else if (ix) h += `<div class="opt w" style="border-color:#FF9F43"><div class="oi" style="background:#FFE9D2">${INC[ix.k].e}</div><div class="ot"><b>${t('inc.' + ix.k, { room: rn(r.type) })}</b><div>${t('inc.' + ix.k + 'D')} ${ix.techT != null ? '🧰 ' + t('inc.techComing') : t('inc.how', { left: incLeft(ix) })}</div></div>${ix.techT == null ? `<button class="btn y" id="rmExpress" ${S.cash < expressCost(ix) ? 'disabled' : ''}>🧰 ${money(expressCost(ix))}</button>` : ''}</div>`; }
  { const wk = roomWeek(id), wg = Math.round(room.staff.filter(Boolean).reduce((a, x) => a + ((x.data && x.data.wage) || 0), 0) * WAGE_K), dd = room.def.dirt || 0;
    if (ROOMS[r.type].role || r.type === 'cafe') h += `<div class="receipt" style="margin-bottom:8px"><div><span>☀️ ${t('room.today')}</span><b>+${money(((S.rEarn || {})[id] || {})[S.day] || 0)}</b></div><div><span>💵 ${t('room.week')}</span><b>+${money(wk)}</b></div>${wg ? `<div><span>👥 ${t('room.wages')}</span><span>-${money(wg)}</span></div><div style="font-weight:800"><span>${t('room.net')}</span><span style="color:${wk - wg >= 0 ? '#1E8A3A' : 'var(--red)'}">${wk - wg >= 0 ? '+' : '-'}${money(Math.abs(wk - wg))}</span></div>` : ''}${S.day < 7 ? `<div style="font-size:12px;color:var(--muted)">${t('room.weekNote', { d: S.day })}</div>` : ''}</div>`;
    if (dd >= 0.35) h += `<div class="msg" style="margin-bottom:8px">🧽 ${t('room.dirty', { p: Math.round(dd * 100) })}</div>`; }
  if (ROOMS[r.type].role || ROOMS[r.type].loo) h += roomQueueHtml(room) + '<div style="height:10px"></div>';
  h += `<div class="row2" style="margin-bottom:10px"><button class="btn g" id="rmMove">✋ ${t('room.move')}</button><button class="btn y" id="rmDemo">🗑️ ${t('room.demolish', { m: money(refund) })}</button></div>`;
  h += `<div class="lbl" style="margin:4px 0 6px">${t('room.resize')}</div>` + sizeCards(r.type, r.size);
  if (role && room.staff.some((s) => !s)) h += `<button class="btn w" id="rmHire" style="width:100%">${t('next.staff', { role: roleN(role), room: rn(r.type) })}</button>`;
  openSheet(h);
  $('rmMove').onclick = () => { closeSheet(); startPlace({ type: r.type, size: r.size }, r); };
  { const xb = $('rmExpress'); if (xb) xb.onclick = () => { if (incExpress(id)) openRoomMenu(id); }; }
  { const xb = $('rmRepair'); if (xb) xb.onclick = () => { if (incRepair(id)) openRoomMenu(id); }; }
  $('rmDemo').onclick = () => { closeSheet(); demolish(r.id); };
  const hb = $('rmHire'); if (hb) hb.onclick = () => openHire(role);
  bindRoomQueue(room);
  $('sheet').querySelectorAll('[data-size]').forEach((b) => b.onclick = () => { closeSheet(); startPlace({ type: r.type, size: b.dataset.size }, r); });
}
function evictRoom(id) {
  for (const v of R.visitors) if ((v.room === id && (v.state === 'toRoom' || v.state === 'treat')) || ((v.state === 'toLoo' || v.state === 'loo' || v.state === 'toCafe' || v.state === 'cafe') && R.rooms[id] && R.rooms[id].spots.includes(v.lspot)) || ((v.state === 'toWash' || v.state === 'washing') && R.rooms[id] && (R.rooms[id].wash || []).includes(v.wspot))) {
    if (v.lspot) { v.lspot.busy = null; v.lspot = null; } if (v.wspot) { if (v.wspot.water) v.wspot.water.visible = false; v.wspot.busy = null; v.wspot = null; }
    v.room = null; v.rspot = null; v.prog = 0;
    const spot = waitSpotFor(v) || { x: 2 + Math.random() * 3, z: 7.2 + Math.random(), rot: Math.PI, sit: false, y: 0 };
    spot.busy = v; v.spot = spot; setPath(v, findPath(v.av.position, spot)); v.state = 'toWait';
  }
  const room = R.rooms[id]; if (room) for (const s of room.staff) if (s) s.at = null;
}
function demolish(id) {
  const i = S.rooms.findIndex((r) => r.id === id); if (i < 0) return; const r = S.rooms[i];
  evictRoom(id); const refund = Math.round(roomCost(r.type, r.size) / 2); S.cash += refund;
  S.rooms.splice(i, 1); const og = world.roomGroups[id]; if (og && og.parent) og.parent.remove(og); delete world.roomGroups[id]; delete R.rooms[id];
  rebuildGrid(); assignStaff(); save(); toast(t('room.demolished', { m: money(refund) }));
}
// ---- placement mode for rooms ----
let placingR = null;
const ghost = new THREE.Group(); ghost.visible = false; scene.add(ghost);
const ghostFloor = new THREE.Mesh(new THREE.BoxGeometry(1, 0.05, 1), new THREE.MeshBasicMaterial({ color: '#7ACB4E', transparent: true, opacity: 0.45, depthWrite: false })); ghostFloor.position.y = 0.16; ghost.add(ghostFloor);
const ghostEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1, 1, 1)), new THREE.LineBasicMaterial({ color: '#0E6E2C' })); ghostEdge.position.y = 0.6; ghost.add(ghostEdge);
const ghostDoor = new THREE.Mesh(new THREE.ConeGeometry(0.35, 0.7, 4), new THREE.MeshBasicMaterial({ color: '#FFD25E' })); ghostDoor.rotation.x = Math.PI / 2; ghost.add(ghostDoor);
function placeValid(p) {
  p.lotBlock = false; const q = roomRect(p);
  for (let x = q.x0 + 0.25; x < q.x1; x += 0.5) for (let z = q.z0 + 0.25; z < q.z1; z += 0.5) if (!buildable(x, z)) return false;
  const others = S.rooms.filter((r) => !p.edit || r.id !== p.edit.id);
  for (const o of others) { const b = roomRect(o); if (q.x0 < b.x1 - 0.01 && q.x1 > b.x0 + 0.01 && q.z0 < b.z1 - 0.01 && q.z1 > b.z0 + 0.01) return false; }
  const all = others.concat([p]), blk = makeGrid(all), hub = { x: 3, z: 3 };
  for (const r of all) if (!reach(blk, hub, doorPt(r, 0.35))) return false;
  if (!reach(blk, hub, { x: 3, z: 9 })) return false;
  { const before = lotAccess(makeGrid(others)), after = lotAccess(blk); if (before.some((ok, i) => ok && !after[i])) { p.lotBlock = true; return false; } p.lotBlock = false; } // never wall off a plot you can still buy or build on
  return true;
}
// for every lot the player doesn't own yet: can a builder still walk from the hall to its edge? (sampled every 0.5 m just outside it)
function lotAccess(blk) {
  const hub = { x: 3, z: 3 }, [si, sj] = ci(hub.x, hub.z), own = ownedLots(); if (!free(blk, si, sj)) return own.map(() => true);
  const seen = new Uint8Array(GW * GH), q = [si + sj * GW]; seen[q[0]] = 1;
  while (q.length) { const c = q.pop(), i = c % GW, j = (c - i) / GW; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj; if (free(blk, ni, nj) && !seen[nj * GW + ni]) { seen[nj * GW + ni] = 1; q.push(nj * GW + ni); } } }
  const hit = (x, z) => { if (!inFloor(x, z)) return false; const [i, j] = ci(x, z); return i >= 0 && j >= 0 && i < GW && j < GH && !!seen[j * GW + i]; };
  return plotOf().lots.map((L, k) => { if (own[k]) return true; const o = 0.6;
    for (let x = L[0] + 0.25; x < L[1]; x += 0.5) if (hit(x, L[2] - o) || hit(x, L[3] + o)) return true;
    for (let z = L[2] + 0.25; z < L[3]; z += 0.5) if (hit(L[0] - o, z) || hit(L[1] + o, z)) return true;
    return false; });
}
function startPlace(spec, edit) { resumeForBuild();
  if (!inGame) return; selectVisitor(null);
  placingR = { type: spec.type, size: spec.size, x: edit ? edit.x : 0, z: edit ? edit.z : 0, a: edit ? edit.a : 0, edit };
  if (edit) { const og = world.roomGroups[edit.id]; if (og) og.visible = false; }
  if (!edit || !placeValid(placingR)) {
    const c = [];
    const pb = plotBox(), lot = plotOf().lots[0];
    for (let x = snapC(pb[0]); x <= pb[1]; x += 1) for (let z = snapC(pb[2]); z <= pb[3]; z += 1) for (const a of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) {
      const q = roomRect({ ...placingR, x, z, a });
      const sc = edit ? Math.hypot(x - edit.x, z - edit.z) : (q.z0 - pb[2]) * 3 + (q.x0 - pb[0]) * 0.6 + (inR(lot, x, z) ? 80 : 0);
      c.push([sc, x, z, a]);
    }
    c.sort((m, n) => m[0] - n[0]);
    for (const [, x, z, a] of c) { const tr = { ...placingR, x, z, a }; if (placeValid(tr)) { Object.assign(placingR, { x, z, a }); break; } }
  }
  ghost.visible = true; $('movebar').classList.add('on'); $('nav').style.visibility = 'hidden'; $('pep').style.visibility = 'hidden';
  $('moveHint').textContent = ROOMS[spec.type].e + ' ' + t('place.hint'); $('mvRot').textContent = t('move.rotate'); $('mvOk').textContent = t('move.ok'); $('mvCancel').textContent = t('move.cancel');
  $('mvOk').onclick = () => endPlace(true); $('mvCancel').onclick = () => endPlace(false); $('mvRot').onclick = () => { placingR.a = ((placingR.a + Math.PI / 2 + Math.PI) % (Math.PI * 2)) - Math.PI; placeShow(); };
  placeShow();
}
function placeShow() {
  const p = placingR, q = roomRect(p), ok = placeValid(p); p.ok = ok;
  ghost.position.set(p.x, 0, p.z); ghostFloor.scale.set(q.w, 1, q.d); ghostEdge.scale.set(q.w, 1, q.d);
  ghostFloor.material.color.set(ok ? '#7ACB4E' : '#E5484D'); ghostEdge.material.color.set(ok ? '#0E6E2C' : '#A82328');
  const dp = doorPt(p, 0.45); ghostDoor.position.set(dp.x - p.x, 0.5, dp.z - p.z); ghostDoor.rotation.set(Math.PI / 2, 0, 0); ghostDoor.rotation.order = 'YXZ'; ghostDoor.rotation.y = p.a + Math.PI;
  $('mvOk').disabled = !ok; $('moveHint').textContent = ROOMS[p.type].e + ' ' + (ok ? t('place.hint') : p.lotBlock ? t('place.lot') : t('place.bad'));
}
const snapC = (v) => Math.round(v - 0.5) + 0.5; // even-sized rooms: centre on n+0.5 → walls on n+0.5, same lattice as the plot
function placeDrag(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
  if (!ray.ray.intersectPlane(gPlane, gHit)) return;
  const pb = plotBox(), nx = clamp(snapC(gHit.x), pb[0], pb[1]), nz = clamp(snapC(gHit.z), pb[2], pb[3]);
  if (nx === placingR.rawX && nz === placingR.rawZ) return; placingR.rawX = nx; placingR.rawZ = nz; placingR.moved = true;
  // magnet: if the finger's spot doesn't fit, slide to the closest spot nearby that does (turning the door if that's what it takes)
  const P = placingR, a0 = P.a, rots = [a0, a0 + Math.PI / 2, a0 - Math.PI / 2, a0 + Math.PI].map((a) => Math.atan2(Math.sin(a), Math.cos(a)));
  const cand = []; for (let dx = -6; dx <= 6; dx++) for (let dz = -6; dz <= 6; dz++) { const d = Math.hypot(dx, dz); if (d <= 6.1) cand.push([d, nx + dx, nz + dz]); } cand.sort((m, n) => m[0] - n[0]);
  let hit = null, tries = 0;
  const clash = (tr) => { const q = roomRect(tr); return S.rooms.some((r) => r !== P.edit && (() => { const o = roomRect(r); return q.x0 < o.x1 - 0.01 && q.x1 > o.x0 + 0.01 && q.z0 < o.z1 - 0.01 && q.z1 > o.z0 + 0.01; })()); }; // cheap pre-check
  for (const [d, x, z] of cand) { for (let ri = 0; ri < (d === 0 ? 4 : 2); ri++) { const tr = { ...P, x, z, a: rots[ri] }; if (clash(tr)) continue; if (++tries > 30) break; if (placeValid(tr)) { hit = tr; break; } } if (hit || tries > 30) break; }
  if (hit) { P.x = hit.x; P.z = hit.z; P.a = hit.a; } else { P.x = nx; P.z = nz; }
  placeShow();
}
function endPlace(ok) {
  const p = placingR; if (!p) return; placingR = null; ghost.visible = false;
  $('movebar').classList.remove('on'); $('nav').style.visibility = $('pep').style.visibility = '';
  $('mvOk').onclick = () => endMove(true); $('mvCancel').onclick = () => endMove(false); $('mvRot').onclick = () => { moving.r = (moving.r + Math.PI / 4) % (Math.PI * 2); moveShow(); };
  if (p.edit) { const og = world.roomGroups[p.edit.id]; if (og) og.visible = true; }
  if (!ok || !placeValid(p)) return;
  AU.sfx('build');
  if (p.edit) {
    const r = p.edit, diff = roomCost(p.type, p.size) - roomCost(r.type, r.size);
    if (diff > 0 && S.cash < diff) { toast(t('build.noCash')); return; }
    S.cash -= diff > 0 ? diff : Math.round(diff / 2);
    evictRoom(r.id); Object.assign(r, { x: p.x, z: p.z, a: p.a, size: p.size }); buildRoom(r);
  } else {
    const cost = roomCost(p.type, p.size); if (S.cash < cost) { toast(t('build.noCash')); return; }
    S.cash -= cost; const r = { id: S.nextId++, type: p.type, size: p.size, x: p.x, z: p.z, a: p.a }; S.rooms.push(r); buildRoom(r);
    const role = ROOMS[r.type].role;
    toast(t('build.done', { room: rn(r.type) }) + (role ? t('build.needStaff', { role: roleN(role) }) : ''));
    if (role) setTimeout(() => { if (R.rooms[r.id] && !R.rooms[r.id].staff.some(Boolean)) chat(t('from.hq'), t('build.chatNeed', { room: rn(r.type), role: roleN(role) }), '🧑‍💼', { act: { k: 'needStaff', room: r.id, role } }); }, 800);
    if (S.rooms.length === 2) tip('sizes');
  }
  rebuildGrid(); assignStaff(); save();
}
function tapLot(i = 0) {
  if (S.mode !== 'career') return;
  if (lotSt(i) !== 'locked') { toast(t('lot.wait')); return; }
  if (!lotOpen(i)) { toast('🔒 ' + t('lot.order')); return; }
  const cost = lotCost(i), L = plotOf().lots[i], area = Math.round((L[1] - L[0]) * (L[3] - L[2]));
  openSheet(`<h2>${t('lot.title')}</h2><p class="sub">${t('lot.sub2', { a: area })}</p><div class="msg" style="margin-bottom:8px">🏠 ${t('lot.rentAdd', { m: money(lotRent(i)), p: money(Math.round(cost / area)) })}</div><button class="btn g" id="buyLot" style="width:100%" ${S.cash < cost ? 'disabled' : ''}>${t('lot.btn', { cost: money(cost) })}</button>${S.cash < cost ? `<div class="msg" style="margin-top:8px">💡 ${t('lot.loan')}</div>` : ''}`);
  $('buyLot').onclick = () => { S.cash -= cost; S.annexNote = 1; setLot(i, 'pending', S.day + 1); buildAnnexLot(); closeSheet(); chat(t('from.council'), t('council.received'), '📝'); save(); };
}


// ---------------- hire ----------------
let candidates = {}, hireTab = 'coach';
const portraitR = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
portraitR.setSize(128, 128); portraitR.outputColorSpace = THREE.SRGBColorSpace; portraitR.toneMapping = THREE.ACESFilmicToneMapping;
const pScene = new THREE.Scene(); pScene.add(new THREE.HemisphereLight('#ffffff', '#b8ae9f', 1.2)); const pl = new THREE.DirectionalLight('#fff1dc', 2.2); pl.position.set(2, 4, 5); pScene.add(pl);
const pCam = new THREE.PerspectiveCamera(26, 1, 0.1, 20);
const portraits = {};
function portrait(st) {
  const key = st.id ? 's' + st.id : st.name + st.skill;
  if (portraits[key]) return portraits[key];
  pScene.background = new THREE.Color(ROLES[st.role].bg);
  const p = staffPerson(st); p.rotation.y = 0.25; pScene.add(p);
  if (p.userData.p.glb) p.userData.p.anim.update(0.05); p.updateMatrixWorld(true); const hy = p.userData.p.head.getWorldPosition(new THREE.Vector3()).y + 0.04;
  pCam.position.set(0.15, hy + 0.1, 2.3); pCam.lookAt(0, hy - 0.18, 0);
  portraitR.render(pScene, pCam); portraits[key] = portraitR.domElement.toDataURL('image/jpeg', 0.85);
  pScene.remove(p); return portraits[key];
}
function refreshCandidates() { for (const r of Object.keys(ROLES)) candidates[r] = [makeCandidate(r), makeCandidate(r), makeCandidate(r)]; }
function trChip(n) { const x = TRAITS.find((y) => y.n === n); return `<span class="tr ${x.t}">${{ good: '+', bad: '−', fun: '~' }[x.t]} ${trN(n)}</span>`; }
function stars(n) { return '<span class="stars">' + '★'.repeat(n) + '</span><span style="color:#D5D9E2">' + '★'.repeat(5 - n) + '</span>'; }
function openHire(tab) {
  hireTab = tab || hireTab;
  let h = `<div style="display:flex;justify-content:space-between;align-items:center"><h2>${t('hire.title')}</h2><span class="y" style="border-radius:12px;padding:5px 10px;font-family:Fredoka;font-weight:700">${money(S.cash)}</span></div>`;
  h += '<div class="tabs">' + Object.keys(ROLES).filter(unlocked).map((k) => `<button class="${k === hireTab ? 'g' : 'y'}" data-tab="${k}">${roleN(k)}</button>`).join('') + '</div>';
  h += `<p class="sub">${t('hire.sub', { role: roleN(hireTab), job: t('job.' + hireTab) })}</p>`;
  candidates[hireTab].forEach((c, i) => {
    h += `<div class="staff w" style="border-left:7px solid ${ROLES[hireTab].strip}"><div class="top"><img src="${portrait(c)}" alt=""><div style="flex:1;min-width:0"><b class="f" style="font-size:18px">${c.name}</b><div style="font-size:16px">${stars(c.skill)}</div></div><div style="text-align:right"><b class="f" style="font-size:18px">${money(Math.round(c.wage * WAGE_K))}</b><div style="font-size:11.5px;font-weight:800;color:var(--muted)">${t('hire.perRent')}</div></div></div>
    <div>${c.traits.map(trChip).join('')}</div><button class="btn g" data-hire="${i}" style="width:100%;margin-top:8px;padding:8px">${t('hire.btn', { name: c.name.split(' ')[0] })}</button></div>`;
  });
  h += `<button class="btn y" id="newCand" style="width:100%">${t('hire.new')}</button>`;
  openSheet(h);
  $('sheet').querySelectorAll('[data-tab]').forEach((b) => b.onclick = () => openHire(b.dataset.tab));
  $('sheet').querySelectorAll('[data-hire]').forEach((b) => b.onclick = () => hire(+b.dataset.hire));
  $('newCand').onclick = () => { if (S.cash < 200) return toast(t('build.noCash')); S.cash -= 200; candidates[hireTab] = [makeCandidate(hireTab), makeCandidate(hireTab), makeCandidate(hireTab)]; openHire(); };
}
function hire(i, tab) {
  tab = tab || hireTab; const c = candidates[tab][i]; const img = portrait(c); c.id = S.nextId++; portraits['s' + c.id] = img;
  if (c.role === 'trainer') c.cert = 2; S.staff.push(c); candidates[tab][i] = makeCandidate(tab);
  spawnStaffAvatar(c); closeSheet(); assignStaff(); save(); AU.sfx('hire');
  chat(c.name + ' · ' + roleN(c.role), crnd(tList('hire.hello')), '👋', { fun: true });
}
let staffFilter = 'all', staffOpen = null;
function openStaffList(filter) {
  if (typeof filter === 'string') staffFilter = filter;
  const roles = Object.keys(ROLES).filter((r) => unlocked(r) || S.staff.some((s) => s.role === r));
  const count = (r) => S.staff.filter((s) => s.role === r).length;
  let h = `<div class="stHead"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><div><h2 style="margin:0">${t('staff.title')}</h2><p class="sub" style="margin:0">${t('staff.sub', { n: S.staff.length, w: money(S.staff.reduce((a, s) => a + s.wage, 0)) })}</p></div></div>`; // one way to hire: the + button of each team below (the big duplicate is gone); the maintenance backlog sits in its own team
  h += `<div class="tabs" style="margin-top:8px"><button class="${staffFilter === 'all' ? 'g' : 'y'}" data-sf="all">${t('staff.all')} · ${S.staff.length}</button>` + roles.map((r) => `<button class="${staffFilter === r ? 'g' : 'w'}" data-sf="${r}" style="border-left:5px solid ${ROLES[r].strip}">${roleN(r)} · ${count(r)}</button>`).join('') + `</div></div>`;
  if (!S.staff.length) h += `<div class="msg">${t('staff.none')}</div>`;
  const mj = S.mode === 'career' ? maintJobs().length : 0;
  for (const r of roles) {
    if (staffFilter !== 'all' && staffFilter !== r) continue;
    const list = S.staff.filter((s) => s.role === r);
    const rooms = Object.values(R.rooms).filter((x) => ROOMS[x.type].role === r);
    const seats = r === 'host' ? 1 : rooms.reduce((a, x) => a + x.staff.length, 0), filled = r === 'host' ? Math.min(1, list.length) : rooms.reduce((a, x) => a + x.staff.filter(Boolean).length, 0);
    if (!list.length && staffFilter === 'all' && !(seats > filled) && !(r === 'maint' && mj)) continue; // empty teams show only when a post waits for them
    h += `<div class="stGroup" style="border-left-color:${ROLES[r].strip}"><b>${roleN(r)} · ${list.length}</b><span>${r === 'maint' && S.mode === 'career' ? `<b style="color:${mj > 4 ? 'var(--red)' : 'inherit'}">🧹 ${t('mt.pending', { n: mj, m: list.length })}</b>` : r === 'maint' || r === 'researcher' && !rooms.length ? t('job.' + r) : seats ? t('staff.seats', { a: filled, b: seats }) : t('job.' + r)}</span><button class="w" data-hr="${r}">+ ${t('staff.hireRole')}</button></div>`;
    for (const st of list) {
      const rs = R.staff.find((x) => x.data === st), en = st.energy ?? 1;
      const where = st.sickHome && st.awayT > 0 ? '🏠 ' + t('epi.atHome') : st.awayT > 0 ? '🏠 ' + t('life.away') : rs && rs.at === 'train' ? '📘 ' + t('trn.inClass') : rs && rs.at === 'heal' ? '💊 ' + t('epi.atPharm') : st.train ? '📘 ' + t('trn.going') : rs && rs.onBreak ? '☕ ' + t('st.break') : rs && rs.at === 'desk' ? t('staff.desk') : rs && R.rooms[rs.at] ? rn(R.rooms[rs.at].type) : rs && rs.at === 'maint' ? t('job.maint') : t('staff.waiting');
      const open = staffOpen === st.id;
      h += `<div class="stRow w" data-so="${st.id}"><img src="${portrait(st)}" alt=""><div class="stMid"><b>${st.name}${st.grumpy ? ' 😒' : ''}${st.sadT > 0 ? ' 💔' : ''}${st.wfh ? ' 🏠' : ''}${st.sick ? ' 🤒' : ''}${st.cert >= 2 ? ' 🎓' : ''}</b><small>${where}</small><div class="stMeta"><span class="stars">${'★'.repeat(st.skill)}</span><span class="en"><i style="width:${Math.round(en * 100)}%;background:${en < 0.25 ? '#E5484D' : '#7ACB4E'}"></i></span></div></div><div class="stWage">${money(Math.round(st.wage * WAGE_K))}<small>${open ? '▴' : '▾'}</small></div></div>`;
      if (open) h += `<div class="stMore"><div>${st.traits.map(trChip).join('')}</div><div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px"><span style="font-size:12px;font-weight:900;color:var(--muted)">⚡ ${t('st.energy')} ${Math.round(en * 100)}%</span><span style="display:flex;gap:6px"><button class="btn g" data-raise="${st.id}" style="padding:6px 10px;font-size:13.5px">💸 ${t('staff.raise', { m: money(Math.round(st.wage * 0.1 / 10) * 10) })}</button><button class="btn y" data-fire="${st.id}" style="padding:6px 10px;font-size:13.5px">${t('staff.fire')}</button></span></div>${st.grumpy ? `<div style="font-size:12px;font-weight:800;color:var(--red);margin-top:6px">😒 ${t('staff.grumpyInfo')}</div>` : ''}${staffEpiRow(st)}</div>`;
    }
  }
  openSheet(h);
  $('sheet').querySelectorAll('[data-sf]').forEach((b) => b.onclick = () => openStaffList(b.dataset.sf));
  $('sheet').querySelectorAll('[data-hr]').forEach((b) => b.onclick = () => openHire(b.dataset.hr));
  $('sheet').querySelectorAll('[data-so]').forEach((b) => b.onclick = () => { const id = +b.dataset.so; staffOpen = staffOpen === id ? null : id; const top = $('sheet').scrollTop; openStaffList(); $('sheet').scrollTop = top; });
  $('sheet').querySelectorAll('[data-fire]').forEach((b) => b.onclick = () => fire(+b.dataset.fire));
  const epiBtn = (k, fn) => $('sheet').querySelectorAll('[data-' + k + ']').forEach((b) => b.onclick = (e) => { e.stopPropagation(); const st = S.staff.find((x) => x.id === +b.getAttribute('data-' + k)); if (!st) return; fn(st); const top = $('sheet').scrollTop; openStaffList(); $('sheet').scrollTop = top; });
  epiBtn('course', startCourse); epiBtn('lvl', (st) => startCourse(st, 'lvl')); epiBtn('epiph', sendPharm); epiBtn('epihome', sendHome);
  $('sheet').querySelectorAll('[data-raise]').forEach((b) => b.onclick = (e) => { e.stopPropagation(); const st = S.staff.find((s) => s.id === +b.dataset.raise); if (!st) return;
    st.wage += Math.round(st.wage * 0.1 / 10) * 10; st.grumpy = 0; st.raiseDay = S.day; st.energy = Math.min(1, (st.energy ?? 1) + 0.5); save();
    chat(st.name + ' · ' + roleN(st.role), t('staff.raisedChat'), '🥹', { fun: true }); toast(t('staff.raised', { name: st.name.split(' ')[0] })); const top = $('sheet').scrollTop; openStaffList(); $('sheet').scrollTop = top; });
}
function fire(id, silent) {
  const st = S.staff.find((s) => s.id === id); if (!st) return;
  S.staff.splice(S.staff.indexOf(st), 1);
  const rs = R.staff.find((x) => x.data === st);
  if (rs) { for (const room of Object.values(R.rooms)) room.staff = room.staff.map((s) => (s === rs ? null : s)); scene.remove(rs.av); R.staff.splice(R.staff.indexOf(rs), 1); }
  if (rs && rs.onBreak) rs.onBreak.busy = null; if (rs && rs.seat) rs.seat.busy = null;
  if (!silent) { chat(st.name, t('staff.fired'), '👋'); closeSheet(); } assignStaff(); save();
}

// ---------------- panels ----------------
function goalHtml() { return GOALS.map((g, i) => `<div class="goal"><span><span class="stars">${'★'.repeat(i + 1)}</span> ${goalText(g)}</span><span style="color:${S.stars > i ? '#1E8A3A' : 'var(--muted)'}">${S.stars > i ? t('goals.done') : t('goals.locked')}</span></div>`).join(''); }
function receipt() { return `<div class="receipt"><div><span>${t('rc.helped')}</span><span>${S.served}</span></div><div><span>${t('rc.out')}</span><span>${S.left}</span></div><div><span>${t('rc.vibes')}</span><span>${Math.round(S.vibes)}%</span></div><div><span>${t('rc.earned')}</span><span>${money(S.earned)}</span></div></div>`; }
function openGoals() {
  S.tutGoals = true;
  if (S.mode !== 'career') { openSheet(`<h2>${t('title.quick')}</h2><p class="sub">${t('quick.start')}</p>${receipt()}<button class="btn y" id="qQuit" style="width:100%">${t('menu.quit')}</button>`); $('qQuit').onclick = () => { closeSheet(); toTitle(); }; return; }
  // one read, top to bottom: the star you are working on (with its progress), then at most 3 things to do now (worst complaints first, then the next
  // steps), then the daily challenge as one line. The album lives on the world map, the Wrapped recap pops up by itself, the map has its own button.
  const steps = nextSteps(), cur = Math.min(S.stars, GOALS.length - 1), G = GOALS[cur], allDone = S.stars >= GOALS.length;
  let h = `<h2>${t('goals.title')} <span class="stars" style="font-size:20px">${'★'.repeat(S.stars)}${'☆'.repeat(GOALS.length - S.stars)}</span></h2>`;
  h += `<div class="goalcard w ${allDone ? 'done' : 'now'}"><div class="gh"><span><span class="stars">${'★'.repeat(cur + 1)}</span> ${goalText(G)}</span><small>${allDone ? '✅ ' + t('goals.done') : t('goals.now')}</small></div>${G.parts.map((pt) => metricRow(pt, allDone, cur)).join('')}</div>`;
  const tc = topComplaints().slice(0, 2), todo = tc.length + Math.min(steps.length, 3 - tc.length);
  h += `<div class="lbl" style="margin:10px 0 6px">👉 ${t('goals.nextSteps')}</div>`;
  h += tc.map(([k, n]) => `<div class="stepbtn w" style="cursor:default">${CMP_E[k]} <span><b>${t('cmp.' + k + '.fix')}</b><br><small style="color:var(--muted)">📣 ${t('cmp.' + k)} · ${n}</small></span></div>`).join('');
  h += steps.slice(0, 3 - tc.length).map((s, i) => `<button class="stepbtn w" data-step="${i}">${s.icon} <span>${s.txt}</span></button>`).join('');
  if (!todo) h += `<div class="msg">${t('goals.none')}</div>`;
  if (S.daily) h += `<div style="margin-top:10px;font-weight:800;font-size:14px">🎯 ${ct('ui.daily')} : ${dailyText()} → +${money(S.daily.m)} ${S.daily.won ? '✅' : S.daily.fail ? '❌' : ''}</div>`;
  { // problem guide: every problem this city can bring, and the room that fixes it
    const c = S.city || 'london', ps = Object.keys(PROBLEMS).filter((k) => !PROBLEMS[k].myst && (!PROBLEMS[k].city || PROBLEMS[k].city === c) && lvlOk(k));
    const byRoom = {}; for (const k of ps) (byRoom[PROBLEMS[k].room] = byRoom[PROBLEMS[k].room] || []).push(k);
    h += `<details style="margin-top:12px"><summary class="lbl" style="cursor:pointer">📖 ${t('guide.title')}</summary><p class="sub">${t('guide.sub')}</p>` + Object.entries(byRoom).map(([r, ks]) => `<div class="w" style="border-radius:14px;padding:8px 12px;margin-bottom:6px"><b>${ROOMS[r] ? ROOMS[r].e : ''} ${rn(r)}</b>${hasRoom(r) ? '' : ` <span style="color:#B45309;font-size:12px">· ${t('guide.notBuilt')}</span>`}${ks.map((k) => `<div data-pi="${k}" style="font-size:13px;margin-top:4px;cursor:pointer"><b>${PROBLEMS[k].e} ${t('p.' + k)} ℹ️</b><div style="color:var(--muted);font-weight:700">${t('pd.' + k)}</div></div>`).join('')}</div>`).join('') + `<p class="sub">❓ ${t('guide.myst')}</p></details>`;
  }
  openSheet(h); $('sheet').querySelectorAll('[data-pi]').forEach((el) => el.onclick = () => { closeSheet(); probCard(el.dataset.pi, false); });
  $('sheet').querySelectorAll('[data-step]').forEach((b) => b.onclick = () => { closeSheet(); const a = steps[+b.dataset.step].act; if (a) a(); });
}
let chatTab = 'staff';
// chat tabs: messages from the team · from visitors (reviews, influencers, people waiting) · everything else (HQ, landlord, inspectors, weather…)
function chatCat(m) {
  const f = String(m.from || ''), k = m.act && m.act.k;
  if (k === 'wait' || k === 'noRoom' || f.startsWith(t('from.review')) || f.startsWith('🤳')) return 'vis';
  if (k === 'tired' || k === 'needStaff' || f.includes(' · ') || f === t('pep.from', { name: MGR.name }) || S.staff.some((st) => st.name === f)) return 'staff';
  return 'other';
}
let ICONS_ALL = (() => { try { return localStorage.getItem('ahq_icons') === 'all'; } catch (e) { return false; } })();
function openChat() {
  S.unread = 0; updateBadge();
  if (!['staff', 'vis', 'other'].includes(chatTab)) chatTab = 'staff';
  const list = S.chat.filter((m) => chatCat(m) === chatTab), nNew = (c) => S.chat.filter((m) => chatCat(m) === c && m.act && !m.ans && ACTS[m.act.k] && ACTS[m.act.k].live(m.act)).length;
  const row = (m, i) => { const A = m.act && ACTS[m.act.k], opts = A && !m.ans ? A.opts(m.act).filter((x) => !x.hide) : [], live = A && !m.ans && A.live(m.act);
    return `<div class="msg${m.act && !m.ans && live ? ' ask' : ''}"><small>${m.icon || ''} ${m.from} · ${dayN(m.day)}</small>${m.text}`
      + (m.ans ? `<div class="ans">↪ <b>${m.pick}</b><br>${m.ans}</div>` : m.act ? (live ? `<div class="acts">${opts.map((x) => `<button class="btn ${x.main ? 'g' : 'w'}" data-ci="${S.chat.indexOf(m)}" data-co="${x.id}" ${x.ok === false ? 'disabled' : ''}>${x.label}</button>`).join('')}</div>` : `<div class="ans" style="opacity:.6">⌛ ${t('ct.expired')}</div>`) : '') + '</div>'; };
  openSheet(`<h2>${t('chat.title')}</h2><div class="tabs">${[['staff', '👥'], ['vis', '🙂'], ['other', '📢']].map(([c, e]) => `<button class="${chatTab === c ? 'g' : 'y'}" data-ctab="${c}">${e} ${t('ct.' + c)}${nNew(c) ? ` <b style="background:#E53E3E;color:#fff;border-radius:9px;padding:0 6px">${nNew(c)}</b>` : ''}</button>`).join('')}</div>`
    + (list.filter((m) => !m.fun).map(row).join('') || `<div class="msg">${t('chat.empty')}</div>`)
    // the chit-chat (hellos, training news, thank-yous) folds into one line at the bottom: what needs you stays on top
    + ((n) => n.length ? `<details style="margin-top:8px"><summary class="lbl" style="cursor:pointer">💬 ${t('chat.small', { n: n.length })}</summary>${n.map(row).join('')}</details>` : '')(list.filter((m) => m.fun)));
  $('sheet').querySelectorAll('[data-ctab]').forEach((b) => b.onclick = () => { chatTab = b.dataset.ctab; openChat(); });
  $('sheet').querySelectorAll('[data-co]').forEach((b) => b.onclick = () => { const m = S.chat[+b.dataset.ci], A = m && m.act && ACTS[m.act.k]; if (!A || m.ans || !A.live(m.act)) { openChat(); return; }
    const x = A.opts(m.act).find((y) => y.id === b.dataset.co); if (!x || x.ok === false) return; const keep = x.run(); m.pick = x.label; m.ans = x.reply || ''; save(); if (keep !== 'leave') openChat(); });
}
// ---- decisions in the chat: options with real effects (validated when tapped: the situation may have changed)
// only jobs that can really be done from a laptop ask to work from home: the researcher (analysis) and the coach/therapist (video sessions).
// The front desk, maintenance, the wellness guide and the pharmacist need to be in the building.
const WFH_ROLES = ['researcher', 'coach', 'therapist'];
const staffById = (id) => R.staff.find((rs) => rs.data.id === id);
const visById = (id) => R.visitors.find((v) => v.id === id && ['toWait', 'wait', 'queue', 'toQueue', 'checkin'].includes(v.state));
const ACTS = {
  inc: { live: (a) => { const x = incOf(a.room); return !!x && x.techT == null; },
    opts: (a) => { const x = incOf(a.room), c = x ? expressCost(x) : 0; return [
      { id: 'exp', main: true, label: '🧰 ' + t('inc.express', { m: money(c) }), ok: S.cash >= c, reply: t('inc.fixedX', { room: rn((S.rooms.find((q) => q.id === a.room) || {}).type) }), run: () => incExpress(a.room) },
      { id: 'wait', label: '⏳ ' + t('inc.wait'), reply: t('inc.waitR'), run: () => {} }]; } },
  gen: { live: () => S.gen && (S.genBroken || genFuel() < GEN_TANK || !S.genBig),
    opts: () => [
      { id: 'fix', main: true, hide: !S.genBroken, label: '🔧 ' + t('gen.repair', { m: money(350) }), ok: S.cash >= 350, reply: t('gen.repaired'), run: () => repairGen() },
      { id: 'fuel', main: !S.genBroken, hide: genFuel() >= GEN_TANK, label: '⛽ ' + t('gen.refuel', { m: money((GEN_TANK - genFuel()) * fuelPrice()) }), ok: S.cash >= (GEN_TANK - genFuel()) * fuelPrice(), reply: t('gen.refueledShort'), run: () => refuelGen() },
      { id: 'big', hide: !!S.genBig, label: '⚡ ' + t('gen.big', { m: money(3500) }), ok: S.cash >= 3500, reply: t('gen.bigR'), run: () => { S.cash -= 3500; S.genBig = true; save(); } },
      { id: 'later', label: t('gen.later'), reply: '👍', run: () => {} }] },
  tired: { live: (a) => { const rs = staffById(a.id); return !!rs && !(rs.data.awayT > 0); },
    opts: (a) => { const rs = staffById(a.id), d = rs && rs.data, first = d ? d.name.split(' ')[0] : '';
      return [
        { id: 'break', main: true, label: '☕ ' + t('ct.t.break'), reply: t('ct.t.breakR'), run: () => { const spot = Object.values(R.rooms).filter((r) => ROOMS[r.type].staffOnly).map((r) => r.spots.find((x) => !x.busy)).find(Boolean); if (spot && !patientOf(rs)) { spot.busy = rs; rs.onBreak = spot; goStaff(rs, spot); } else { d.awayT = 25; d.energy = 1; } } },
        { id: 'off', label: '🏖️ ' + t('ct.t.off'), reply: t('ct.t.offR'), run: () => { d.awayT = DAY_LEN * 0.6; d.sadT = 0; d.energy = 1; vb('misc', 0 + 1); } },
        { id: 'bonus', label: '💰 ' + t('ct.t.bonus', { m: money(200) }), ok: S.cash >= 200, reply: t('ct.t.bonusR', { name: first }), run: () => { S.cash -= 200; d.energy = Math.min(1, d.energy + 0.35); d.sadT = 0; } },
        { id: 'push', label: '💪 ' + t('ct.t.push'), reply: t('ct.t.pushR'), run: () => { d.energy = Math.max(d.energy, 0.6); d.pushT = DAY_LEN * 0.5; } },
      ]; } },
  wait: { live: (a) => !!visById(a.id),
    opts: (a) => { const v = visById(a.id); return [
      { id: 'mgr', main: true, label: '⭐ ' + t('ct.w.mgr', { name: MGR.name }), ok: !(S.mgrCd > 0), reply: t('ct.w.mgrR'), run: () => { mgrGo({ kind: 'v', v }); return 'leave'; } },
      { id: 'matcha', label: '🍵 ' + t('ct.w.matcha', { m: money(15) }), ok: cafeOpen() && S.cash >= 15, hide: !hasRoom('cafe'), reply: t('ct.w.matchaR'), run: () => { S.cash -= 15; v.pat = Math.min(1, v.pat + 0.35); floatAt(v.av.position, '🍵💛'); } },
      { id: 'prio', label: '🎟️ ' + t('ct.w.prio'), reply: t('ct.w.prioR'), run: () => { v.prio = true; v.pat = Math.min(1, v.pat + 0.15); for (const o of R.visitors) if (o !== v && o.state === 'wait' && o.target === v.target) o.pat = Math.max(0.05, o.pat - 0.06); } },
      { id: 'sorry', label: '🙏 ' + t('ct.w.sorry'), reply: t('ct.w.sorryR'), run: () => { v.pat = Math.min(1, v.pat + 0.12); } },
    ]; } },
  noRoom: { live: (a) => !hasRoom(a.room),
    opts: (a) => [
      { id: 'build', main: true, label: '🔨 ' + t('ct.r.build', { room: rn(a.room), m: money(roomCost(a.room, 's')) }), ok: unlocked(a.room), reply: t('ct.r.buildR'), run: () => { closeSheet(); openSize(a.room); return 'leave'; } },
      { id: 'refer', label: '🤝 ' + t('ct.r.refer'), reply: t('ct.r.referR'), run: () => { for (const v of R.visitors.filter((u) => u.known && needOf(u) === a.room && ['toWait', 'wait'].includes(u.state))) { floatAt(v.av.position, '🤝'); vb('misc', 0 + 0.5); leave(v, true); } } },
      { id: 'later', label: t('ct.later'), reply: t('ct.laterR'), run: () => {} },
    ] },
  needStaff: { live: (a) => { const r = R.rooms[a.room]; return !!r && !r.staff.some(Boolean); },
    opts: (a) => [
      { id: 'hire', main: true, label: '👥 ' + t('ct.s.hire', { role: roleN(a.role) }), reply: t('ct.s.hireR'), run: () => { closeSheet(); openHire(a.role); return 'leave'; } },
      { id: 'later', label: t('ct.later'), reply: t('ct.laterR'), run: () => {} },
    ] },
  leak: { live: () => !!(S.ev && S.ev.k === 'leak' && S.ev.obj && R.litter.includes(S.ev.obj)),
    opts: () => [
      { id: 'plumber', main: true, label: '🔧 ' + t('ct.l.plumber', { m: money(300) }), ok: S.cash >= 300, reply: t('ct.l.plumberR'), run: () => { S.cash -= 300; const o = S.ev.obj; if (o.mesh.userData.drip) scene.remove(o.mesh.userData.drip); scene.remove(o.mesh); R.litter.splice(R.litter.indexOf(o), 1); } },
      { id: 'maint', label: '🧹 ' + t('ct.l.maint'), ok: R.staff.some((rs) => rs.data.role === 'maint'), reply: t('ct.l.maintR'), run: () => {} },
    ] },
  heat: { live: () => !!(S.ev && S.ev.k === 'heat'),
    opts: () => [
      { id: 'ac', main: true, label: '❄️ ' + t('ct.h.ac', { m: money(250) }), ok: S.cash >= 250 && !S.acTemp, reply: t('ct.h.acR'), run: () => { S.cash -= 250; S.acTemp = true; } },
      { id: 'drinks', label: '🧊 ' + t('ct.h.drinks', { m: money(60) }), ok: S.cash >= 60, reply: t('ct.h.drinksR'), run: () => { S.cash -= 60; for (const v of R.visitors) if (['wait', 'queue'].includes(v.state)) v.pat = Math.min(1, v.pat + 0.2); } },
      { id: 'endure', label: '🥵 ' + t('ct.h.endure'), reply: t('ct.h.endureR'), run: () => {} },
    ] },
};
function selectVisitor(v) { if (v && v.caseK) { openCase(v); return; } if (v && v.asleep) wakeUp(v); if (v && v.prob === 'ghosted' && !v.seen && beh('ghost')) { v.seen = true; v.pat = Math.min(1, v.pat + 0.15); floatAt(v.av.position, '👀💛'); } sel = v; const el = $('vcard'); if (!v) { el.classList.remove('on'); selRing.visible = false; return; } el.classList.add('on'); selRing.visible = true; renderVCard(); }
function renderVCard() {
  const v = sel; if (!v) return;
  const pr = PROBLEMS[v.prob]; const need = v.known ? pr.room : null; const built = need && hasRoom(need);
  const st = { toShop: t('v.toShop'), shopping: t('v.shopping'), toLoo: t('v.toLoo'), loo: t('v.loo'), toCafe: t('v.toCafe'), cafe: t('v.cafe'), toLine: t('v.line'), line: t('v.line'), toQueue: t('v.toQueue'), queue: t('v.queue'), checkin: t('v.checkin'), toWait: t('v.toWait'), wait: built ? t('v.waitFor', { room: rn(need) }) : t('v.needs', { room: need ? rn(need) : '?' }), toRoom: t('v.toRoom', { room: need ? rn(need) : '' }), treat: t('v.treat'), exit: t('v.exit'), angry: t('v.angry') }[v.state];
  const mood = v.pat > 0.6 ? '😊 ' + t('mood.ok') : v.pat > 0.3 ? '😐 ' + t('mood.meh') : '😡 ' + t('mood.bad');
  const tr = v.target != null && R.rooms[v.target], qi = tr ? roomQ(v.target).indexOf(v) : -1, others = need ? Object.values(R.rooms).filter((r) => r.type === need && r.id !== v.target) : [];
  const ws = Math.round(v.waitT || 0), wt = ws >= 60 ? Math.floor(ws / 60) + 'm' + String(ws % 60).padStart(2, '0') : ws + 's';
  $('vcard').style.borderLeftColor = v.em ? '#FF2D2D' : v.vip ? '#FFC83D' : '';
  const html = `<div style="display:flex;justify-content:space-between;gap:8px"><div style="min-width:0"><b class="f" style="font-size:17px">${v.em ? '🚨 ' : v.vip ? '👑 ' : ''}${v.name}, ${v.age}</b><div style="font-size:13px;font-weight:900">${v.known ? (isMystK(v.prob) ? '❓ ' + pn(v.prob) : `<span id="vInfo" style="cursor:pointer;text-decoration:underline dotted">${pr.e} ${pn(v.prob)} ℹ️</span>`) : '🛎️ ' + t('v.notChecked')}${v.em ? ` <span class="emtag">${t('vc.em')}</span>` : ''}</div><div style="font-size:12.5px;font-weight:800;color:${v.state === 'wait' && !built ? 'var(--red)' : 'var(--muted)'}">${st}${qi >= 0 ? ' · ' + t('vc.pos', { i: qi + 1, n: roomQ(v.target).length }) : ''}</div></div><button class="icon y" style="width:34px;height:34px;flex:none" id="vClose">✕</button></div>
  <div class="bar" style="height:8px;margin-top:6px"><i style="width:${Math.round(v.pat * 100)}%;background:${v.pat > 0.5 ? '#7ACB4E' : v.pat > 0.25 ? '#FFB800' : '#E5484D'}"></i></div>
  <div class="vgrid"><span>${mood} · ${Math.round(v.pat * 100)}%</span><span>⏱️ ${wt}</span><span>💵 ${t('vc.spent', { m: money(v.spent || 0) })}</span><span>${v.known && !isMystK(v.prob) ? '💰 ' + t('vc.fee', { m: money(feeFor(v)) }) : '💰 ?'}</span><span class="neg">⚠️ ${t('vc.leave', { n: leaveCost(v) })}</span></div>
  <div class="vthought">💬 “${vThought(v)}”</div>
  <div class="vbtns">${v.state === 'wait' && need && !built ? `<button class="btn g" id="vBuild">${t('v.build', { room: rn(need) })}</button>` : ''}${['wait', 'toWait'].includes(v.state) && others.length ? others.slice(0, 2).map((r) => `<button class="btn w" data-redir="${r.id}">↪ ${rn(r.type)}${roomNo(r)} (👥${roomQ(r.id).length})</button>`).join('') : ''}${!['exit', 'angry'].includes(v.state) && R.mgr ? `<button class="btn y" id="vMgr" ${S.mgrCd > 0 ? 'disabled' : ''}>⭐ ${S.mgrCd > 0 ? Math.ceil(S.mgrCd) + 's' : t('vc.send', { name: MGR.name })}</button>` : ''}</div>`;
  if ($('vcard')._h === html) return; $('vcard')._h = html; $('vcard').innerHTML = html;
  $('vClose').onclick = () => selectVisitor(null); if ($('vInfo')) $('vInfo').onclick = () => probCard(v.prob, false);
  const vb = $('vBuild'); if (vb) vb.onclick = () => { selectVisitor(null); openSize(pr.room); };
  const vm = $('vMgr'); if (vm) vm.onclick = () => { mgrGo({ kind: 'v', v }); renderVCard(); };
  $('vcard').querySelectorAll('[data-redir]').forEach((b) => b.onclick = () => { v.target = +b.dataset.redir; toast('↪ ' + t('rq.moved', { n: 1 }), 1200); renderVCard(); });
}
function openLang() {
  openSheet(`<h2>${t('lang.title')}</h2>` + Object.entries(LANGS).map(([k, n]) => `<button class="btn ${k === getLang() ? 'g' : 'w'}" data-lang="${k}" style="width:100%;margin-bottom:8px;text-align:left">${n}</button>`).join(''));
  $('sheet').querySelectorAll('[data-lang]').forEach((b) => b.onclick = () => { setLang(b.dataset.lang); applyStatic(); refreshTitle(); closeSheet(); });
}

// ---------------- input ----------------
let sel = null, inGame = false, speedMul = 1;
const selRing = new THREE.Mesh(new THREE.TorusGeometry(0.45, 0.06, 8, 30), mat('#FFD25E', { e: '#FFD25E', ei: 0.6 })); selRing.rotation.x = Math.PI / 2; selRing.visible = false; scene.add(selRing);
const ptrs = new Map(); let dragDist = 0, pinch0 = 0, half0 = 0, ang0 = 0, yaw0 = 0, mid0 = 0, pitch0 = 0;
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
// While placing: grab the ghost to move it; drag anywhere else to pan/zoom the map; a quick tap elsewhere drops the ghost there.
function ghostHit(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam); if (!ray.ray.intersectPlane(gPlane, gHit)) return false;
  if (placingR) { const q = roomRect(placingR); return gHit.x > q.x0 - 0.6 && gHit.x < q.x1 + 0.6 && gHit.z > q.z0 - 0.6 && gHit.z < q.z1 + 0.6; }
  const o = placingD || moving; const ox = o.x != null ? o.x : o.mesh && o.mesh.position.x, oz = o.z != null ? o.z : o.mesh && o.mesh.position.z; return Math.hypot(gHit.x - ox, gHit.z - oz) < 1.2;
}
const placeMode = () => placingR || placingD || moving;
canvas.addEventListener('pointerdown', (e) => { if (!inGame) return; const pm = placeMode(); if (pm && !ptrs.size && ghostHit(e)) { canvas.setPointerCapture(e.pointerId); pm.drag = true; pm.moved = false; pm.downX = e.clientX; pm.downY = e.clientY; if (placingR) { placingR.rawX = snapC(placingR.x); placingR.rawZ = snapC(placingR.z); } if (placingD) decorDrag(e); else if (placingR) placeDrag(e); else moveDrag(e); return; } canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); dragDist = 0; if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); half0 = view.half; ang0 = Math.atan2(b.y - a.y, b.x - a.x); yaw0 = view.yaw; mid0 = (a.y + b.y) / 2; pitch0 = view.pitch; view.yawT = null; } });
canvas.addEventListener('pointermove', (e) => {
  if (placingD && placingD.drag) { decorDrag(e); return; }
  if (placingR && placingR.drag) { placeDrag(e); return; }
  if (moving && moving.drag) { moveDrag(e); return; }
  if (!ptrs.has(e.pointerId)) return; const p = ptrs.get(e.pointerId); const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
  if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); view.half = clamp(half0 * pinch0 / d, 5, 22); let da = Math.atan2(b.y - a.y, b.x - a.x) - ang0; da = Math.atan2(Math.sin(da), Math.cos(da)); view.yaw = yaw0 - da; view.pitch = clamp(pitch0 + ((a.y + b.y) / 2 - mid0) * 0.004, PITCH_MIN, PITCH_TOP); dragDist = 99; placeCam(); return; }
  dragDist += Math.abs(dx) + Math.abs(dy);
  const k = view.half * 2 / innerHeight, rx = dx * k, ry = dy * k * 1.6;
  const cy = Math.cos(view.yaw), sy = Math.sin(view.yaw), ky = 1 / Math.max(0.35, Math.sin(view.pitch)) * 0.62;
  view.tx = clamp(view.tx - rx * cy - ry * ky * sy, -28, 28); view.tz = clamp(view.tz + rx * sy - ry * ky * cy, -30, 14); placeCam();
});
canvas.addEventListener('pointerup', (e) => {
  const pm = placeMode(); if (pm && pm.drag) { pm.drag = false; if (placingR && pm === placingR && Math.hypot(e.clientX - pm.downX, e.clientY - pm.downY) < 14 && placingR.ok) { if (navigator.vibrate) navigator.vibrate(15); endPlace(true); } return; } // tap the green room = build it
  ptrs.delete(e.pointerId);
  if (dragDist > 14 || !inGame) return; // fingers wobble: a small slide is still a tap
  if (pm) { if (placingD) decorDrag(e); else if (placingR) placeDrag(e); else moveDrag(e); return; }
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
  if (mgrPick) { mgrPickAt(e); return; }
  if (R.mgr && R.mgr.av.visible && ray.intersectObject(R.mgr.av, true).length) { openMgr(); return; }
  { const mo = pickMess(e); if (mo) { prioMess(mo); return; } } // tap a 🧹 / 🤢 / 🐀 to send the cleaner there first
  { const pv = pickVisitor(e); if (pv) { selectVisitor(pv); return; } }
  // decor (vending machine, radiators, AC, plants, sofas…): the modelled versions replace the primitive children after the tap
  // ids were set, so climb to the decor group instead of trusting the mesh — otherwise placed items could never be moved
  const dh = ray.intersectObjects(Object.values(world.decor), true);
  if (dh.length) { let o = dh[0].object; while (o && o.userData.decorId == null && !Object.values(world.decor).includes(o)) o = o.parent;
    const id = o ? (o.userData.decorId ?? +Object.keys(world.decor).find((k) => world.decor[k] === o)) : null; if (id != null && !isNaN(id)) { openDecorMenu(id); return; } }
  if (ray.intersectObject(world.desk, true).length) { openDesk(); return; }
  { const dh2 = ray.intersectObjects(world.desks2 || [], true); if (dh2.length) { let o = dh2[0].object; while (o && o.userData.di == null) o = o.parent; if (o) { openDesk2(o.userData.di); return; } } }
  const hits = ray.intersectObjects(R.visitors.map((v) => v.av), true);
  if (hits.length) { const owner = hits[0].object.userData.owner; const v = R.visitors.find((x) => x.av === owner); if (v) { selectVisitor(v); return; } }
  if (ray.ray.intersectPlane(gPlane, gHit)) {
    const hitR = S.rooms.find((r) => { const q = roomRect(r); return gHit.x > q.x0 && gHit.x < q.x1 && gHit.z > q.z0 && gHit.z < q.z1; }) || S.rooms.find((r) => { const q = roomRect(r); return gHit.x > q.x0 - 0.35 && gHit.x < q.x1 + 0.35 && gHit.z > q.z0 - 0.35 && gHit.z < q.z1 + 0.35; }); // a tap on the wall counts too
    if (hitR) { openRoomMenu(hitR.id); return; }
    { const li = plotOf().lots.findIndex((L, i) => lotSt(i) !== 'owned' && inR(L, gHit.x, gHit.z)); if (li >= 0) { if (S.mode === 'career') tapLot(li); return; } }
    if (buildable(gHit.x, gHit.z)) { openBuild(); return; }
  }
  selectVisitor(null);
});
canvas.addEventListener('wheel', (e) => { view.half = clamp(view.half * (e.deltaY > 0 ? 1.08 : 0.93), 5, 22); placeCam(); }, { passive: true });
function camRot(dir) { view.yawT = (view.yawT ?? view.yaw) + dir * Math.PI / 2; }
// Diorama view: frames one room close up, ~32° above the ground, so you see furniture height, wall depth and details (the management view is unchanged)
function dioFrame(r, yaw = view.yawT ?? view.yaw) { const q = roomRect(r), W = q.x1 - q.x0, D = q.z1 - q.z0, a = innerWidth / innerHeight;
  const cx = Math.sin(yaw), cz = Math.cos(yaw), hw = (Math.abs(cz) * W + Math.abs(cx) * D) / 2 + 0.6, depth = (Math.abs(cx) * W + Math.abs(cz) * D) / 2;
  const vh = depth * Math.sin(DIO_PITCH) + 1.3 * Math.cos(DIO_PITCH) + 0.4; // footprint seen at this tilt plus the back walls
  return { tx: (q.x0 + q.x1) / 2, tz: (q.z0 + q.z1) / 2, half: clamp(Math.max(hw / a, vh) * 1.04, 3.2, CLOSE_HALF) }; }
function dioramaView(id) { const r = S.rooms.find((o) => o.id === id); if (!r) return; Object.assign(view, dioFrame(r)); placeCam(); }
// 🎥 tour: the camera glides slowly from room to room (the reception first), lingers on each while turning a little, then comes back to where it was.
// Any touch on the game, or the button again, stops it where it is.
let TOUR = null;
function tourStop(back) { if (!TOUR) return; if (back) Object.assign(view, TOUR.home); TOUR = null; const b = $('camTour'); if (b) b.classList.remove('on'); placeCam(); }
function tourStart() { if (!inGame || placingR || !S.rooms.length) return; const stops = [{ desk: true }].concat(S.rooms.slice().sort((a, b) => a.x - b.x || a.z - b.z));
  TOUR = { stops, i: -1, t: 99, home: { tx: view.tx, tz: view.tz, half: view.half, yaw: view.yaw } }; const b = $('camTour'); if (b) b.classList.add('on'); }
function tourTick(rdt) { const T = TOUR; T.t += rdt;
  if (T.t > 6.5) { T.i++; T.t = 0; if (T.i >= T.stops.length) { tourStop(true); return; } const st = T.stops[T.i]; const D = desks()[0];
    T.to = st.desk ? { tx: D ? D.x : 0, tz: D ? D.z : 0, half: 5.5 } : dioFrame(st, view.yaw); T.from = { tx: view.tx, tz: view.tz, half: view.half }; }
  const k = Math.min(1, T.t / 2.2), e = k * k * (3 - 2 * k); // 2.2 s glide, then ~4 s on the room
  view.tx = T.from.tx + (T.to.tx - T.from.tx) * e; view.tz = T.from.tz + (T.to.tz - T.from.tz) * e; view.half = T.from.half + (T.to.half - T.from.half) * e;
  view.yaw += rdt * 0.06; // a slow turn, so the room is seen from a few angles
  placeCam(); }
function camTilt() { if (bgMode()) return; const L = [0.3, 0.53, 0.72, 0.9, 1.1]; const i = L.findIndex((v) => v > view.pitch + 0.02); view.pitchT = L[i < 0 ? 0 : i]; }
function camAnim(rdt) {
  if (TOUR) { tourTick(rdt); return; }
  let ch = false;
  if (view.yawT != null) { const d = view.yawT - view.yaw; if (Math.abs(d) < 0.01) { view.yaw = view.yawT; view.yawT = null; } else view.yaw += d * Math.min(1, rdt * 7); ch = true; }
  if (view.pitchT != null) { const d = view.pitchT - view.pitch; if (Math.abs(d) < 0.005) { view.pitch = view.pitchT; view.pitchT = null; } else view.pitch += d * Math.min(1, rdt * 7); ch = true; }
  if (ch) placeCam();
}
{ const wb = $('camWalls'); const paint = () => { wb.textContent = WALLS_UP ? '🧱' : '🔽'; wb.title = t(WALLS_UP ? 'cam.wallsUp' : 'cam.wallsCut'); };
  paint(); wb.onclick = () => { WALLS_UP = !WALLS_UP; try { localStorage.setItem('ahq_walls', WALLS_UP ? 'up' : 'cut'); } catch (e) {} paint(); updateCutaway(); toast(t(WALLS_UP ? 'cam.wallsUp' : 'cam.wallsCut'), 1800); }; }
// Two camera buttons (the old ⟲ ⟳ pair becomes one): each is a little joystick.
//  turn: slide your finger left/right on it to spin the view freely, all the way round; a tap turns it 45°
//  tilt: slide up/down on it to raise or lower the camera smoothly; a tap jumps between the top view and the normal view
const PITCH_TOP = 1.3, PITCH_STD = 0.72;
function camTiltTap() { if (bgMode()) return; const p = view.pitchT ?? view.pitch; view.pitchT = p < (PITCH_TOP + PITCH_STD) / 2 ? PITCH_TOP : PITCH_STD; }
function camStick(btn, onDrag, onTap) {
  let st = null;
  btn.addEventListener('pointerdown', (e) => { e.preventDefault(); e.stopPropagation(); try { btn.setPointerCapture(e.pointerId); } catch (er) {} st = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 }; btn.classList.add('held'); });
  btn.addEventListener('pointermove', (e) => { if (!st || e.pointerId !== st.id) return; const dx = e.clientX - st.x, dy = e.clientY - st.y; st.x = e.clientX; st.y = e.clientY; st.moved += Math.abs(dx) + Math.abs(dy); if (st.moved > 6) { view.yawT = null; view.pitchT = null; onDrag(dx, dy); placeCam(); } });
  const end = (e) => { if (!st || e.pointerId !== st.id) return; const tap = st.moved <= 6; st = null; btn.classList.remove('held'); if (tap) onTap(); };
  btn.addEventListener('pointerup', end); btn.addEventListener('pointercancel', end); btn.onclick = null;
}
{ const bL = $('camL'), bR = $('camR'), bT = $('camT');
  if (bR) bR.style.display = 'none';
  if (bL) { bL.setAttribute('aria-label', 'Rotate (slide left or right)'); bL.title = '↔'; bL.style.touchAction = 'none';
    bL.innerHTML = '<svg viewBox="0 0 24 24"><path d="M5 9a8 4 0 0 1 14 0"/><path d="M19 15a8 4 0 0 1-14 0"/><path d="M16 6l3 3-3 3"/><path d="M8 12l-3 3 3 3"/></svg>';
    camStick(bL, (dx) => { view.yaw -= dx * 0.016; }, () => camRot(0.5)); }
  if (bT) { bT.setAttribute('aria-label', 'Tilt (slide up or down)'); bT.title = '↕'; bT.style.touchAction = 'none';
    bT.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 3v18"/><path d="M8 7l4-4 4 4"/><path d="M8 17l4 4 4-4"/><path d="M4 12h3M17 12h3"/></svg>';
    camStick(bT, (dx, dy) => { if (!bgMode()) view.pitch = clamp(view.pitch - dy * 0.006, PITCH_MIN, PITCH_TOP); }, camTiltTap); }
  const css = document.createElement('style'); css.textContent = '#camCtl button.held{transform:scale(1.15);background:#E6F6EA;border-color:#16963C}'; document.head.appendChild(css); }
addEventListener('keydown', (e) => { if (!inGame) return; if (e.key === 'q' || e.key === 'Q') camRot(-0.5); if (e.key === 'e' || e.key === 'E') camRot(0.5); if (e.key === 't' || e.key === 'T') camTiltTap(); });
let lastSpeed = 1;
function setSpeed(s) {
  speedMul = s; if (s > 0) lastSpeed = s;
  $('spPause').classList.toggle('on', s === 0); $('icPause').style.display = s === 0 ? 'none' : ''; $('icPlay').style.display = s === 0 ? '' : 'none';
  $('spLbl').textContent = lastSpeed + '×'; $('spFast').classList.toggle('on', s > 1);
}
$('spPause').onclick = () => { if (speedMul > 0 && liveBuild() && (placingR || placingD || moving || $('sheet').classList.contains('on') && !sheetPaused)) { toast('⏸️ ' + t('build.noPause'), 1800); return; } setSpeed(speedMul === 0 ? lastSpeed : 0); };
$('spFast').onclick = () => setSpeed(speedMul === 0 ? lastSpeed : speedMul >= 3 ? 1 : speedMul + 1);
function navResearch() { const b = $('nResearch'); if (b) b.style.display = inGame && noResearch() ? 'none' : ''; }
$('nBuild').onclick = openBuild; $('nStaff').onclick = openStaffList; $('nGoals').onclick = openGoals; $('nChat').onclick = openChat; $('nResearch').onclick = openResearch;
$('banner').onclick = openChat;

// ---------------- game loop ----------------
let spawnT = 3, saveT = 0, last = performance.now();
function dayTick(dt) {
  if (S.mode !== 'career') {
    S.qt -= dt; S.t = (S.t + dt) % DAY_LEN;
    if (S.qt <= 0) endQuick();
    return;
  }
  S.t += dt;
  if ((R.rebalT = (R.rebalT || 0) + dt) > 4) { R.rebalT = 0; assignStaff(); }
  // 'about to leave' alert: one grouped message at most every 60 s, and only for clients who matter (VIP, emergency, or stuck in a queue of 4+);
  // everyone else just shows their ⏳. Tapping it opens the most pressing one with the 4 answers (manager, matcha, priority, sorry).
  if (S.mode === 'career' && S.tut < 0 && (R.waitAlT = (R.waitAlT || 0) + dt) > 5) { R.waitAlT = 0; const now = S.day * DAY_LEN + S.t;
    if (now - (S.askWaitT ?? -99) > 60) { const hot = R.visitors.filter((v) => (v.state === 'wait' || v.state === 'toWait') && v.pat < 0.45 && !v.asked && (v.vip || v.em || (v.target != null && roomQ(v.target).length >= 4)));
      if (hot.length) { hot.sort((a, b) => (b.em ? 2 : 0) + (b.vip ? 1 : 0) - (a.em ? 2 : 0) - (a.vip ? 1 : 0) || a.pat - b.pat); const v = hot[0]; for (const u of hot) u.asked = true; S.askWaitT = now;
        chat(t('from.review') + ' · ' + v.name + ', ' + v.age, hot.length > 1 ? t('ct.w.many', { n: hot.length, who: v.name }) : t('ct.w.one'), '⏳', { act: { k: 'wait', id: v.id } }); } } } // every few seconds: an idle carer moves to a busier room of their speciality
  if (S.inspectAt > 0 && S.t >= S.inspectAt && !R.inspector) { S.inspectAt = -1; spawnInspector(); }
  if (S.vipAt > 0 && S.t >= S.vipAt) { S.vipAt = -1; const ok = Object.keys(PROBLEMS).filter((k) => !PROBLEMS[k].myst && !PROBLEMS[k].epi && hasRoom(PROBLEMS[k].room) && (!PROBLEMS[k].city || PROBLEMS[k].city === (S.city || 'london')) && lvlOk(k) && !isNewK(k)); /* a VIP only brings a problem of this city */ if (ok.length) { spawnVisitor(rnd(ok), false, true); say('vip', t('vip.arrive'), 0); chat(t('from.hq'), t('vip.arrive'), '👑'); toast('👑 ' + t('vip.arrive'), 3000); } }
  if (S.crewAt > 0 && S.t >= S.crewAt && !modalPaused) { S.crewAt = -1; crewVisit(); }
  crewTick(dt);
  if (S.evAt > 0 && S.t >= S.evAt && !S.ev && !modalPaused) { S.evAt = -1; startEvent(); }
  if (S.raiseAt > 0 && S.t >= S.raiseAt && !modalPaused) { S.raiseAt = -1; raiseRequest(); }
  if (S.lifeAt > 0 && S.t >= S.lifeAt && !modalPaused) { S.lifeAt = -1; lifeEvent(); }
  if (S.incAt > 0 && S.t >= S.incAt) { S.incAt = -1; incStart(); }
  if (S.emAt > 0 && S.t >= S.emAt) { if (S.em || S.epi || modalPaused) S.emAt = S.t + 10; else { S.emAt = -1; offerEmergency(); } }
  if (S.t >= DAY_LEN) {
    S.t -= DAY_LEN; dailyEnd(); S.bestDay = Math.max(S.bestDay || 0, S.dServ || 0); S.bestNight = Math.max(S.bestNight || 0, S.nServ || 0); S.dServ = 0; S.nServ = 0; S.day++; dailyNew(); epiDay(); if (S.day >= 3 && RNG() < ((S.stars || 0) >= 2 ? 0.45 : 0.3)) S.incAt = 10 + RNG() * 50;
    if (cityOf().quake && S.day >= 3 && Math.random() < 0.3) S.quakeAt = 15 + Math.random() * 50;
    if (S.iou) { S.cash += S.iou; chat(t('from.hq'), t('bh.iouPaid', { m: money(S.iou) }), '🧾'); S.iou = 0; }
    if (RENT_EVERY - ((S.day - 1) % RENT_EVERY) === 1) say('rent', t('pa.rent', { m: money(RENT) }), 0);
    S.rainy = Math.random() < cityOf().rain; S.dusty = S.city === 'cairo' && !S.rainy && Math.random() < 0.3; // khamsin wind: dusty footprints
    if (S.rainy) { chat(t('from.weather'), t('weather.rain'), '🌧️'); tip('rain'); }
    if (S.day === 3 && unlocked('lab') && !hasRoom('lab')) tip('lab');
    plotOf().lots.forEach((_, i) => { if (lotSt(i) === 'pending' && S.day >= lotDay(i)) lotOwned(i); });
    if (S.day >= S.nextInspect) { S.nextInspect = S.day + 7; S.inspectAt = 15 + Math.random() * 30; } // one inspection a week (a failed or warned one gets a re-check sooner, see verdict)
    if (S.day >= 2 && Math.random() < (cityOf().power ? 0.7 : 0.5)) S.evAt = 10 + Math.random() * 35;
    if (S.day >= 3 && S.staff.length >= 3 && Math.random() < 0.3) S.raiseAt = 20 + Math.random() * 25;
    else if (S.mode === 'career' && S.city !== 'london' && S.day >= 30 && S.staff.length >= 2 && Math.random() < 0.3) S.lifeAt = 15 + Math.random() * 35;
    for (const st of S.staff) if (st.wfh && !WFH_ROLES.includes(st.role)) st.wfh = false;
    for (const st of S.staff) if (st.wfh && S.day % 5 === 0 && !(st.awayT > 0)) { st.awayT = DAY_LEN * 0.95; chat(st.name + ' · ' + roleN(st.role), t('life.wfhOn'), '🏠'); }
    poachCheck();
    if (S.day >= 3 && Math.random() < (['popular', 'adored'].includes(vibeTier()) ? 0.6 : 0.35)) S.vipAt = 15 + Math.random() * 30;
    // the protection racket: first visit a few days after the 2nd star, then about every 15 days (8 days after an arrest, angrier); never after the 3rd star
    if (S.crewReport) { S.crewReport = 0; S.crewNext = S.day + 8; S.crewMad = 1; } // a report from an older version: treated as an arrest
    if (S.mode === 'career' && S.stars >= 2 && S.stars < 3 && S.day >= 10 && !S.crewRaid) { if (!S.crewNext) S.crewNext = S.day + 3 + Math.floor(Math.random() * 4); else if (S.day >= S.crewNext) { S.crewNext = S.day + crewGap(); S.crewAt = 20 + Math.random() * 25; } }
    if (S.crewAngry && S.day >= S.crewAngry) { S.crewAngry = 0; crewNight(); }
    if (S.day > 1 && (S.day - 1) % 12 === 0) setTimeout(() => showWrapped(true), 400);
    if (S.mode === 'career' && !S.annexNote && annexRent()) { S.annexNote = 1; chat(t('from.landlord'), t('lot.rentNote', { m: money(annexRent()) }), '🏠'); }
    decorDaily();
    if (S.emAt >= DAY_LEN - 1) S.emAt = Math.max(3, S.emAt - DAY_LEN); // an offer that slipped past midnight comes early the next day
    if (S.day >= S.nextEm && !S.em && !S.epi && !(S.emAt > 0) && !((S.emBurst || 0) > 0)) { S.nextEm = S.day + 99; emStartBurst(); }
    else if ((S.emBurst || 0) > 0 && !S.em && !(S.emAt > 0)) emNext();
    billWarn();
    if ((S.day - 1) % RENT_EVERY === 0) {
      const wages = Math.round(S.staff.reduce((a, s) => a + s.wage, 0) * WAGE_K);
      const loanPay = S.loan ? Math.min(S.loan.left, S.loan.per) : 0; if (S.loan) { S.loan.left -= loanPay; if (S.loan.left <= 0) S.loan = null; }
      const elec = elecPerDay() * ELEC_K * RENT_EVERY; S.adUses = 0;
      S.cash -= RENT + wages + loanPay + elec;
      modal(`<div style="font-size:44px">🧾</div><h2>${t('rent.title')}</h2><p>${t('rent.p')}</p><div class="receipt"><div><span>${t('rent.rent')}</span><span>-${money(RENT)}</span></div><div><span>${t('rent.wages')}</span><span>-${money(wages)}</span></div><div><span>⚡ ${t('bill.elec')}</span><span>-${money(elec)}</span></div>${loanPay ? `<div><span>${t('loan.pay')}</span><span>-${money(loanPay)}</span></div>` : ''}<div style="border-top:2px dashed var(--sh);margin-top:4px;padding-top:6px"><span>${t('rent.left')}</span><span>${money(S.cash)}</span></div></div><button class="btn g" id="mOk" style="width:100%">${t('rent.ok')}</button>`);
      $('mOk').onclick = closeModal;
      chat(t('from.landlord'), t('landlord.thanks'), '🏠', { fun: true }); tip('rent');
      const wk = S.earned - (S.earnedAtBill || 0); S.earnedAtBill = S.earned;
      if (S.cash < -5000 && !S.bailout) { // first time under: the bank steps in once instead of ending the run
        S.bailout = true; const need = Math.round((-S.cash + 5000) / 500) * 500, owe = Math.round(need * 1.15 / 500) * 500; S.cash += need;
        S.loan = { left: (S.loan ? S.loan.left : 0) + owe, per: Math.round(((S.loan ? S.loan.left : 0) + owe) / 6) };
        setTimeout(() => { modal(`<div style="font-size:44px">🏦</div><h2>${t('bail.title')}</h2><p>${t('bail.p', { m: money(need), o: money(owe) })}</p><button class="btn g" id="mOk" style="width:100%">${t('tut.ok')}</button>`); $('mOk').onclick = closeModal; }, 600);
      } else if (S.cash < -5000) gameOver({ bill: RENT + wages + loanPay + elec, rent: RENT, wages, elec, loanPay, wk });
    } // (random small talk from the landlord/HQ/group chat removed: noise)
    save();
  }
}
// all three goals done: celebrate with the totals, then stay or move on to the next city (its brief shows the new goals)
function cityVictory() {
  const nxt = Object.keys(CITIES).find((k) => CITIES[k].unlock === (S.city || 'london'));
  modal(`<div style="font-size:46px">⭐⭐⭐</div><h2>${t('win.title', { city: t('city.' + S.city) })}</h2><p>${t('win.p')}</p>
    <div class="receipt"><div><span>${t('rc.helped')}</span><span>${S.served}</span></div><div><span>${t('rc.earned')}</span><span>${money(S.earned || 0)}</span></div><div><span>${t('rc.cash')}</span><span>${money(S.cash)}</span></div><div><span>${t('rc.vibes')}</span><span>${Math.round(S.vibes)}%</span></div><div><span>${t('rc.rooms')}</span><span>${S.rooms.length}</span></div><div><span>${t('rc.team')}</span><span>${S.staff.length}</span></div><div><span>${t('rc.days')}</span><span>${S.day}</span></div></div>
    ${nxt ? `<button class="btn g" id="wNext" style="width:100%;margin-top:6px">🌍 ${t('win.next', { city: t('city.' + nxt) })}</button>` : `<p style="font-weight:800">${t('win.last')}</p>`}
    <button class="btn w" id="wStay" style="width:100%;margin-top:8px">${t('win.stay', { city: t('city.' + S.city) })}</button>`);
  $('wStay').onclick = () => { closeModal(); };
  if (nxt) $('wNext').onclick = () => { closeModal(); save(); inGame = false; RNG = Math.random; resetRuntime(); const p = profile(); p.last = nxt; try { localStorage.setItem('ahq_profile', JSON.stringify(p)); } catch (e) {} mapCity = nxt; openBrief(); };
}
function checkGoals() {
  if (S.mode !== 'career') return;
  const prev = S.stars;
  const wasStars = S.stars;
  while (S.stars < 3 && GOALS[S.stars].ok(S)) { S.stars++; addKudos(20); }
  if (wasStars === 0 && S.stars > 0) for (const [k, C] of Object.entries(CITIES)) if (C.unlock === (S.city || 'london')) setTimeout(() => { chat(t('from.hq'), t('unl.city', { city: t('city.' + k) }), '🌍'); toast('🌍 ' + t('unl.city', { city: t('city.' + k) }), 4000); }, 1500);
  if (S.stars > prev && S.stars >= 3 && prev < 3) { save(); AU.sfx('star'); say('star', t('win.title', { city: t('city.' + S.city) }), 0); cityVictory(); return; }
  if (S.stars > prev) {
    save();
    AU.sfx('star'); say('star', S.stars === 1 ? t('star.one') : t('star.many', { n: S.stars }), 0);
    modal(`<div style="font-size:46px">${'⭐'.repeat(S.stars)}</div><h2>${S.stars === 1 ? t('star.one', { city: t('city.' + S.city) }) : t('star.many', { n: S.stars, city: t('city.' + S.city) })}</h2><p>${(() => { const nx = Object.keys(CITIES).find((k) => CITIES[k].unlock === S.city); return S.stars === 1 && nx ? t('star.oneP', { next: t('city.' + nx) }) : t('star.manyP', { city: t('city.' + S.city) }); })()}</p>
    <div class="receipt"><div><span>${t('rc.helped')}</span><span>${S.served}</span></div><div><span>${t('rc.vibes')}</span><span>${Math.round(S.vibes)}%</span></div><div><span>${t('rc.cash')}</span><span>${money(S.cash)}</span></div><div><span>${t('rc.days')}</span><span>${S.day}</span></div></div>
    <p style="font-size:13px">${t('star.share')}</p><button class="btn g" id="mOk" style="width:100%">${t('star.keep')}</button>`);
    $('mOk').onclick = () => { closeModal(); showUnlocks(prev, S.stars); };
  }
}
const UNL_TIPS = { pharmacy: ['unlBuild', 'nBuild'], glowup: ['unlBuild', 'nBuild'], social: ['unlBuild', 'nBuild'], parent: ['unlBuild', 'nBuild'], therapy: ['unlBuild', 'nBuild'], moving: ['unlBuild', 'nBuild'], career: ['unlBuild', 'nBuild'], maint: ['unlStaff', 'nStaff'], lab: ['unlBuild', 'nBuild'], annex: ['unlAnnex', null] };
function showUnlocks(from, to) {
  const items = Object.keys(UNLOCK).filter((k) => UNLOCK[k] > from && UNLOCK[k] <= to && t('unl.' + k) !== 'unl.' + k && !(NEWP() && (DEV_ROOMS[k] || FREE_ROLES.includes(k)))); // with discovery, stars open no rooms
  if (!items.length) return;
  modal(`<div style="font-size:46px">🎉</div><h2>${t('unl.title')}</h2><p>${t('unl.p')}</p>${items.map((k) => `<div class="msg" style="text-align:left">${t('unl.' + k)}</div>`).join('')}<button class="btn g" id="mOk" style="width:100%">${t('unl.ok')}</button>`);
  $('mOk').onclick = () => { closeModal(); const seen = new Set(); for (const k of items) { const [tk, tg] = UNL_TIPS[k]; if (!seen.has(tk)) { seen.add(tk); tip(tk, tg, true); } } };
}
// what the next bill will be, from today
function billInfo() { const toRent = RENT_EVERY - ((S.day - 1) % RENT_EVERY), wages = Math.round(S.staff.reduce((a, s) => a + s.wage, 0) * WAGE_K), elec = elecPerDay() * ELEC_K * RENT_EVERY, loanPay = S.loan ? Math.min(S.loan.left, S.loan.per) : 0; return { toRent, total: RENT + wages + elec + loanPay }; }
// a heads-up 2 days and 1 day before bills when the cash won't cover them
function billWarn() {
  if (S.mode !== 'career') return; const b = billInfo(); if (b.toRent > 2 || b.toRent === RENT_EVERY) return;
  if (S.cash >= b.total) return; const short = b.total - S.cash, fatal = S.cash - b.total < -5000;
  const msg = t(fatal ? 'bills.warnFatal' : 'bills.warn', { n: b.toRent, m: money(short) });
  toast('⚠️ ' + msg, 5000); say('billwarn', msg, 0); chat(t('from.hq'), msg + ' ' + t('bills.tapHint'), '🧾'); AU.sfx('bad');
}
// losing: say exactly why, with the numbers, before leaving the city
function gameOver(why = {}) {
  const r = (a, b) => `<div><span>${a}</span><span>${b}</span></div>`;
  modal(`<div style="font-size:46px">💀</div><h2>${t('over.title')}</h2><p><b>${t('over.why', { m: money(S.cash), lim: money(-5000) })}</b></p>
    <div class="receipt">${why.bill ? r('🧾 ' + t('over.bill'), '-' + money(why.bill)) + r('&nbsp;&nbsp;🏠 ' + t('rent.rent'), '-' + money(why.rent)) + r('&nbsp;&nbsp;👥 ' + t('rent.wages'), '-' + money(why.wages)) + r('&nbsp;&nbsp;⚡ ' + t('bill.elec'), '-' + money(why.elec)) + (why.loanPay ? r('&nbsp;&nbsp;🏦 ' + t('loan.pay'), '-' + money(why.loanPay)) : '') : ''}${why.wk != null ? r('💰 ' + t('over.week'), money(why.wk)) : ''}${r(t('rc.helped'), S.served)}${r(t('rc.days'), S.day)}</div>
    <p style="font-size:13px">💡 ${t(why.wages > (why.wk || 0) ? 'over.tipWages' : 'over.tipEarn')}</p><p style="font-size:13px">${t('over.p', { n: S.served })}</p>
    <button class="btn g" id="mOk" style="width:100%">${t('over.btn')}</button><button class="btn w" id="mMap" style="width:100%;margin-top:8px">🌍 ${t('over.map')}</button>`);
  $('mOk').onclick = () => { closeModal(); startNew(S.city); };
  $('mMap').onclick = () => { closeModal(); inGame = false; toMap(); };
}
function updateHUD() { navResearch();
  if (S && $('hTemp')) { const T = S.temp; if (S.mode !== 'career' || T == null) $('hTemp').textContent = ''; else { $('hTemp').textContent = '🌡️ ' + Math.round(T) + '°C'; $('hTemp').style.color = T < T_LO ? '#2F7FD1' : T > T_HI ? '#C0362C' : '#1E8A3A'; } }
  const q = S.mode !== 'career';
  if (q) {
    const s = Math.max(0, Math.ceil(S.qt)); $('hDay').textContent = t('quick.time') + ' ' + Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0');
    $('hDayBar').style.width = (S.qt / QUICK_LEN * 100) + '%'; $('hRent').textContent = t('hud.score') + ' ' + quickScore();
  } else {
    $('hDay').textContent = (t('city.' + (S.city || 'london')) + ' · ' + dayN(S.day)).toUpperCase() + (S.rainy ? ' 🌧️' : '') + (isNight() ? ' 🌙' : '');
  if (cityOf().night) { const ex = isNight() ? 0.72 : 0.95; if (!(S.ev && S.ev.k === 'power') && Math.abs(renderer.toneMappingExposure - ex) > 0.01) renderer.toneMappingExposure += (ex - renderer.toneMappingExposure) * 0.05; }
    $('hDayBar').style.width = (S.t / DAY_LEN * 100) + '%';
    const toRent = RENT_EVERY - ((S.day - 1) % RENT_EVERY);
    $('hRent').textContent = toRent === RENT_EVERY && S.day > 1 ? t('hud.rentPaid') : toRent === 1 ? t('hud.rentIn1') : t('hud.rentIn', { n: toRent });
    { const short = toRent <= 3 && toRent !== RENT_EVERY && S.cash < billInfo().total; $('hRent').style.color = short ? '#C0362C' : ''; $('hRent').textContent = (short ? '⚠️ ' : '') + $('hRent').textContent; if (S.daily && !S.daily.lost) $('hRent').textContent += S.daily.won ? ' · 🎯✅' : S.daily.k === 'cure' ? ` · 🎯 ${S.daily.c}/${S.daily.n}` : S.daily.k === 'calm' ? (S.daily.fail ? ' · 🎯❌' : ' · 🎯😌') : ` · 🎯 ${S.daily.n}%`; }
  }
  $('hCash').textContent = money(S.cash); $('hCash').style.color = S.cash < 0 ? 'var(--red)' : '';
  { const tr = vibeTrend(); $('hVibes').innerHTML = '<span class="stars">★</span> ' + Math.round(S.vibes) + '% ' + (S.mode === 'career' ? `<span style="font-size:13px">${TIER_FX[vibeTier()].e}</span>` + (tr > 0.5 ? '<span style="color:#1E8A3A;font-size:13px">▲</span>' : tr < -0.5 ? '<span style="color:#E53E3E;font-size:13px">▼</span>' : '') : ''); }
  const ec = $('emchip');
  ec.onclick = S.epi && !S.em ? openEpi : null; ec.style.cursor = S.epi && !S.em ? 'pointer' : '';
  if (!S.em && S.crewRaid) { ec.style.display = 'block'; ec.style.borderLeftColor = '#3B6FD8'; const s2 = Math.max(0, Math.ceil(S.crewRaid.t - S.crewRaid.el)); ec.textContent = '🚓 ' + t('crew.hud', { t: Math.floor(s2 / 60) + ':' + String(s2 % 60).padStart(2, '0') }); }
  else if (!S.em && S.epi) { ec.style.display = 'block'; ec.style.borderLeftColor = '#7F68C9'; ec.textContent = epiHud(); }
  else if (!S.em && S.ev) { ec.style.display = 'block'; ec.style.borderLeftColor = '#FF9F43'; ec.textContent = EVENTS[S.ev.k].e + ' ' + (S.ev.k === 'leak' ? t('ev.leak', { room: rn((R.rooms[S.ev.room] || {}).type || 'budget') }) : t('ev.hud', { name: t('ev.' + S.ev.k), t: Math.ceil(S.ev.t) + 's' })); }
  else if (!S.em && S.ad) { ec.style.display = 'block'; ec.style.borderLeftColor = '#16963C'; ec.textContent = ADS[S.ad.k].e + ' ' + t('mk.active', { name: t('mk.' + S.ad.k), t: Math.ceil(S.ad.t) + 's' }); }
  else if (S.em) { ec.style.borderLeftColor = ''; const s = Math.max(0, Math.ceil(S.em.t)); ec.style.display = 'block'; ec.textContent = '🚨 ' + t('em.hud', { name: t('em.' + S.em.k), a: S.em.got, b: S.em.need, t: Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0') }); ec.style.color = s <= 30 ? '#E53E3E' : ''; ec.style.fontWeight = s <= 30 ? '900' : ''; }
  else ec.style.display = 'none';
  if (!S.em) { ec.style.color = ''; ec.style.fontWeight = ''; }
}
// the street sends more people to a bigger centre: every staffed treatment room past the 3rd adds 6 % more arrivals (up to +80 %), and the building holds more at once
let flowCache = { t: -1, n: 0 };
function staffedRooms() { const now = performance.now(); if (now - flowCache.t > 1000) { flowCache = { t: now, n: Object.values(R.rooms).filter((r) => ROOMS[r.type].role && !ROOMS[r.type].shop && r.type !== 'cafe' && r.type !== 'lab' && !ROOMS[r.type].train && r.staff.some(Boolean)).length }; } return flowCache.n; }
const flowMul = () => (S.mode === 'career' ? Math.min(1.8, 1 + 0.06 * Math.max(0, staffedRooms() - 3)) : 1) * (S.rumorEnd && nowAbs() < S.rumorEnd ? 0.7 : 1); // 'word is out' after a raid: 30 % fewer arrivals
const visCap = () => (S.mode === 'career' ? Math.min(36, 18 + Math.round(1.5 * Math.max(0, staffedRooms() - 3))) : 18);
const PAPERS = [];
function tossPaper(from, to) { const m = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), mat('#FFFFFF', { r: 0.9 })); m.position.set(from.x, 1.0, from.z); scene.add(m); PAPERS.push({ m, t: 0, a: { x: from.x, z: from.z }, b: to }); }
function tickLoos(dt) {
  for (const room of Object.values(R.rooms)) { if (!ROOMS[room.type].loo) continue;
    for (const sp of room.spots) { if (!sp.door) continue; const inside = sp.busy && sp.busy.state === 'loo', tgt = inside ? 0 : -1.35; sp.door.rotation.y += (tgt - sp.door.rotation.y) * Math.min(1, dt * 6);
      if (sp.lock && sp.lock.userData.on !== inside) { sp.lock.userData.on = inside; sp.lock.material = mat(inside ? '#D9534F' : '#4CB363', { e: inside ? '#D9534F' : '#4CB363', ei: 0.5 }); } } }
  for (let i = PAPERS.length - 1; i >= 0; i--) { const p = PAPERS[i]; p.t += dt / 0.6; const t = Math.min(1, p.t); p.m.position.set(p.a.x + (p.b.x - p.a.x) * t, 1.0 + Math.sin(t * Math.PI) * 0.35 - 0.55 * t, p.a.z + (p.b.z - p.a.z) * t); if (p.t >= 1) { scene.remove(p.m); PAPERS.splice(i, 1); } }
}
function step(dt, now = performance.now(), rdt = dt) {
  tickLoos(dt);
  dayTick(dt); if (!inGame) return; if (!trainAsked && CHAR.status === 'ready') { trainAsked = true; trainClips(); } // extra Meshy clips (class, drink, till, pick up…) for every character probIntroTick(rdt); behTick(dt); laterTick(dt); caseTick(); tempTick(dt); quakeTick(dt); doomers = beh('slowdoom') ? R.visitors.filter((u) => DOOM.has(u.prob) && !u.cured && u.path && u.path.length) : [];
  spawnT -= dt; if (S.epi && S.epi.quar) spawnT = Math.max(spawnT, 1.5); // quarantine: the front desk turns new people away
  if (spawnT <= 0 && S.mode === 'career' && cityOf().groups && cityOf().groups.kind === 'families' && RNG() < cityOf().groups.chance && R.visitors.length < 15) { const kp = ['toddler', 'schoolrun', 'tablet', 'homework', 'sugar']; famNext = true; const pr = spawnVisitor(unlocked('parent') ? rnd(kp) : undefined); famNext = false; const gid = S.nextId++; S.gs = S.gs || {}; S.gs[gid] = 1; pr.gid = gid; spawnT = 9; }
  else if (spawnT <= 0 && S.mode === 'career' && cityOf().groups && cityOf().groups.kind !== 'families' && RNG() < cityOf().groups.chance && R.visitors.length < 15) { const pr = spawnVisitor(); const gid = S.nextId++; S.gs = S.gs || {}; const n = 2 + (RNG() < 0.4 ? 1 : 0); S.gs[gid] = n; pr.gid = gid; for (let i = 1; i < n; i++) { const o = spawnVisitor(pr.prob); o.gid = gid; } spawnT = 9; }
  if (spawnT <= 0) { const base = S.mode === 'career' ? 5.6 : 4.2; spawnT = (base / (S.mode === 'career' ? 1.2 * TIER_FX[vibeTier()].spawn : 0.6 + S.vibes / 100)) * (0.7 + RNG() * 0.6) / adMul() * Math.pow(S.price || 1, S.mode === 'career' && vibeTier() === 'adored' ? 0.6 : 1.2) / (cityOf().waves && S.mode === 'career' ? 1 + 0.45 * Math.sin(S.t / 9) : 1) / flowMul() / (cityOf().evening && S.mode === 'career' ? (S.t > DAY_LEN * 0.6 ? 1.7 : S.t < DAY_LEN * 0.35 ? 0.75 : 1) : 1); if (R.visitors.length < visCap() + (S.ad ? 6 : 0)) spawnVisitor(); }
  adUpdate(dt);
  for (const v of R.visitors.slice()) visitorUpdate(v, dt);
  for (const rs of R.staff) {
    if (rs.mode === 'walk') { if (stepWalker(rs, dt, 2.6)) { rs.mode = rs.onBreak ? 'break' : rs.data.role === 'maint' && rs.at !== 'train' && rs.at !== 'heal' ? 'free' : 'there'; settle(rs, rs.target); rs.busyPose = null; } }
    else if (rs.mode === 'there') staffAttend(rs, dt);
    else if (rs.target && !rs.target.sit) rs.av.userData.p.body.position.y = Math.sin(now / 400 + rs.data.id) * 0.015;
    staffEnergy(rs, dt);
    if (rs.data.role === 'maint' && !rs.onBreak && rs.at !== 'train' && rs.at !== 'heal') maintUpdate(rs, dt);
  }
  doorsUpdate(dt); staffCover(dt); mgrUpdate(dt); if (S.pepT > 0) S.pepT -= dt; if (S.pepCd > 0) S.pepCd -= dt;
  pestUpdate(dt); vibeTick(dt); marksTick(dt); inspectorUpdate(dt); emergencyUpdate(dt); researchUpdate(dt); eventUpdate(dt); incTick(dt); discTick(); decorUpdate(dt); checkGoals(); epiTick(dt);
  saveT += rdt; if (saveT > 3) { saveT = 0; save(); }
}
const fpsW = { t: 0, n: 0, sum: 0, done: false };
function fpsWatch(rdt) {
  if (fpsW.done || GFX.pref !== 'auto' || !inGame || document.hidden || (PR_BASE != null && renderer.getPixelRatio() > PR_BASE + 0.01)) return; // don't judge speed while zoomed in at full sharpness
  fpsW.t += rdt; fpsW.n++; fpsW.sum += rdt; if (fpsW.t < 8) return;
  const avg = fpsW.sum / fpsW.n; fpsW.t = fpsW.n = fpsW.sum = 0;
  if (avg > 0.05) { fpsW.done = true; PR_BASE = Math.min(window.devicePixelRatio || 1, 1.5); renderer.setPixelRatio(PR_BASE); try { localStorage.setItem('ahq_gfx_hint2', 'low'); } catch (e) {} if (!GFX.low) toast('🖥️ ' + t('gfx.slow'), 3500); }
}
function loop(now) {
  WIND.value = now / 1000;
  const rdt = Math.min(0.1, (now - last) / 1000); last = now; fpsWatch(Math.min(0.5, rdt));
  if (inGame) {
    const dt = sheetPaused || modalPaused || (!liveBuild() && (moving || placingR || placingD)) ? 0 : rdt * speedMul; loop.held = dt === 0;
    if (dt > 0) { const n = Math.ceil(dt / 0.1); for (let i = 0; i < n; i++) step(dt / n, now, i === 0 ? rdt : 0); }
    if (sel) { selRing.position.set(sel.av.position.x, 0.14, sel.av.position.z); if (Math.floor(now / 250) !== loop.vc) { loop.vc = Math.floor(now / 250); renderVCard(); } }
    camAnim(rdt);
    updateHUD(); updateLabels(); updatePep(); updateTut(); if (Math.floor(now / 300) !== loop.oc) { loop.oc = Math.floor(now / 300); updateObj(); }
  }
  if (world.movers) moveCity(world.movers, rdt * (inGame ? Math.max(speedMul, 0.4) : 0.6));
  if (scMixer) scMixer.update(rdt);
  if (CHAR.active.size) updateCharacters(inGame && loop.held ? rdt : rdt * (inGame ? (speedMul || 0) : 1), inGame && loop.held); /* held or paused: walkers freeze, everyone else keeps breathing / idling in real time */ // while the game is held (menu, build mode) walkers stop mid-stride instead of marching on the spot
  if (creating) renderPreview(now);
  renderer.render(scene, cam);
  requestAnimationFrame(loop);
}

// ---------------- quick shift ----------------
function quickScore() { return Math.max(0, S.served * 100 + Math.round(S.earned / 10) - S.left * 50); }
function startQuick(daily) {
  const d = new Date(); const ds = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  RNG = daily ? mulberry32(+ds.replace(/-/g, '')) : Math.random;
  S = newState(); S.mode = daily ? 'daily' : 'quick'; S.date = ds; S.cash = 3000; S.city = 'london';
  S.rooms = [{ id: S.nextId++, type: 'nap', size: 'm', x: -3.5, z: -3.5, a: Math.PI / 2 }, { id: S.nextId++, type: 'budget', size: 'm', x: 3.5, z: -3.5, a: 0 }, { id: S.nextId++, type: 'detox', size: 'm', x: -3.5, z: 3.5, a: Math.PI / 2 }];
  const mk = (role, name, skill, look) => { const c = makeCandidate(role); c.name = name; c.skill = skill; c.id = S.nextId++; if (look) c.look = { ...c.look, ...look }; return c; };
  S.staff = [mk('host', 'Amara Okafor', 3, { skin: SKIN[3], hair: '#1C120C', style: 'curly' }), mk('coach', 'Priya Shah', 3), mk('guide', 'Leo Rossi', 3), mk('guide', 'Hana Ito', 2), mk('maint', 'Sam Brown', 2)];
  startGame();
  chat(t('from.hq'), t('quick.start'), '⏱️'); S.unread = 0; updateBadge();
  toast(daily ? t('daily.title', { date: ds }) : t('quick.start'), 3000);
}
function endQuick() {
  const sc = quickScore(); let best = 0; const key = 'ahq_best_' + S.mode + (S.mode === 'daily' ? S.date : '');
  try { best = +localStorage.getItem(key) || 0; if (sc > best) localStorage.setItem(key, sc); } catch (e) {}
  inGame = false;
  modal(`<div style="font-size:46px">⏱️</div><h2>${t('quick.end')}</h2>${S.mode === 'daily' ? `<p>${t('daily.title', { date: S.date })}</p>` : ''}<div style="font-family:Fredoka;font-size:44px;font-weight:700;color:var(--green)">${sc.toLocaleString('en-US')}</div><p>${t('quick.score')} · best ${Math.max(best, sc).toLocaleString('en-US')}</p>${receipt()}<p style="font-size:13px">${t('star.share')}</p>
  <div class="row2"><button class="btn y" id="qMenu">${t('menu.quit')}</button><button class="btn g" id="qAgain">${t('quick.again')}</button></div>`);
  const mode = S.mode;
  $('qMenu').onclick = () => { closeModal(); toTitle(); };
  $('qAgain').onclick = () => { closeModal(); startQuick(mode === 'daily'); };
}


// ---------------- manager (player avatar) ----------------
const OUTFITS = ['hoodie', 'suit', 'blazer', 'street', 'dress', 'cardigan'];
const OCOLS = ['#16963C', '#1F74C4', '#E9785F', '#7F68C9', '#2F3A52', '#FF8FAB', '#F2C14E', '#2BB5A6'];
const BODY = { slim: 0.88, mid: 1, broad: 1.16 }, HEIGHT = { short: 0.9, mid: 1, tall: 1.1 };
function randomMgr(keepName) {
  return { name: keepName || '', pron: Math.random() < 0.5 ? 'm' : 'f', model: crnd(MGR_MODELS), skin: crnd(SKIN), hair: crnd(HAIR), style: crnd(STYLES), outfit: crnd(OUTFITS), ocol: crnd(OCOLS), body: crnd(Object.keys(BODY)), height: crnd(Object.keys(HEIGHT)), glasses: Math.random() < 0.3 };
}
function loadMgr() { try { const m = JSON.parse(localStorage.getItem('ahq_mgr')); if (m && m.skin) return m; } catch (e) {} return null; }
function saveMgr(m) { try { localStorage.setItem('ahq_mgr', JSON.stringify(m)); } catch (e) {} }
const MGR_MODELS = ['mgr_f', 'mgr_h', 'mgr_f2', 'mgr_h2'];
function defaultModel(m) { const dark = SKIN.indexOf(m.skin) >= 3; return (m.pron === 'm' ? 'mgr_h' : 'mgr_f') + (dark ? '2' : ''); }
let MGR = loadMgr() || Object.assign(randomMgr(), { name: 'Boss' }); if (!MGR.model) MGR.model = defaultModel(MGR); if (MGR.pron !== 'm' && MGR.pron !== 'f') MGR.pron = MGR.model.startsWith('mgr_h') ? 'm' : 'f';
function mgrLook(m) {
  const c = m.ocol, L = { skin: m.skin, hair: m.hair, style: m.style, glasses: m.glasses, wide: BODY[m.body] || 1, tall: HEIGHT[m.height] || 1, shirt: c, pants: '#2F3A52', shoes: '#2A2A2E' };
  L.outfit = m.outfit; L.model = m.model;
  if (m.outfit === 'hoodie') Object.assign(L, { hood: true, pants: '#3B4A6B', shoes: '#F4EFE6' });
  if (m.outfit === 'suit') Object.assign(L, { pants: c, inner: '#FFFFFF', tie: c === '#E9785F' ? '#2F3A52' : '#D93A3F' });
  if (m.outfit === 'blazer') Object.assign(L, { inner: '#F4EFE6', pants: '#2F3A52' });
  if (m.outfit === 'street') Object.assign(L, { pants: '#5E6B3A', shoes: '#F4EFE6', cap: m.style === 'hijab' ? null : '#2F3A52' });
  if (m.outfit === 'dress') Object.assign(L, { skirt: c, pants: '#3A2E2E', shoes: '#8B6A45' });
  if (m.outfit === 'cardigan') Object.assign(L, { inner: '#F4EFE6', pants: '#8A9AB0', shoes: '#8B6A45' });
  return L;
}
function mgrPortrait() {
  const key = 'mgr' + JSON.stringify(MGR); if (portraits[key]) return portraits[key];
  pScene.background = new THREE.Color('#FFE9A8');
  const L = mgrLook(MGR); const p = person(L, 'manager'); p.rotation.y = 0.25; pScene.add(p);
  if (p.userData.p.glb) p.userData.p.anim.update(0.05); p.updateMatrixWorld(true); const hy = p.userData.p.head.getWorldPosition(new THREE.Vector3()).y + 0.04;
  pCam.position.set(0.15, hy + 0.1, 2.3); pCam.lookAt(0, hy - 0.18, 0);
  portraitR.render(pScene, pCam); portraits[key] = portraitR.domElement.toDataURL('image/jpeg', 0.85); pScene.remove(p);
  return portraits[key];
}
const MGR_SPOTS = [{ x: 3.6, z: 1.3 }, { x: 1.8, z: 2.4 }, { x: 4.4, z: 3.0 }, { x: 2.6, z: 5.4 }, { x: 5.6, z: 2.2 }];
function spawnManager() {
  const sp = mgrSpot(); const av = person(mgrLook(MGR), 'manager'); av.position.set(sp.x, 0.1, sp.z); av.rotation.y = Math.PI / 4; scene.add(av);
  R.mgr = { av, path: [], ph: 0, cheer: 0, task: null }; S.mgrHelp = null; S.mgrCd = S.mgrCd || 0;
  $('pepImg').src = mgrPortrait();
}
function mgrUpdate(dt) {
  const M = R.mgr; if (!M) return; const p = M.av.userData.p;
  // The manager no longer walks the floor: she lives in the portrait bubble on the side. Her orders still work, at once: she is simply
  // put where the job is (unseen), so her boosts, calming a visitor or rushing the desk apply straight away.
  M.av.visible = false; if (M.path.length) { const e = M.path[M.path.length - 1]; M.av.position.set(e.x, 0.1, e.z); M.path = []; poseStand(p); mgrArrive(); }
  if (S.mgrCd > 0) S.mgrCd -= dt; if (S.mgrHelp) { S.mgrHelp.t -= dt; if (S.mgrHelp.t <= 0) { S.mgrHelp = null; mgrHome(); } }
  auraRing.visible = false; if (M.autoCd > 0) M.autoCd -= dt;
  if (M.cheer > 0 && p.anim) { if (p.anim.state !== 'cheer') p.anim.set('cheer'); M.cheer -= dt; if (M.cheer <= 0) poseStand(p); return; }
  if (M.cheer > 0) { M.cheer -= dt; p.arms.forEach((a) => { a.rotation.x = -2.8; a.rotation.z = 0; }); p.body.position.y = Math.abs(Math.sin(M.cheer * 9)) * 0.18; if (M.cheer <= 0) poseStand(p); return; }
  if (M.path.length) { if (stepWalker(M, dt, 3.4)) { poseStand(p); mgrArrive(); } return; }
  if (M.look) turnTo(M.av, M.look, dt, 4);
  if (!M.task && !S.mgrHelp) { M.idleT = (M.idleT || 0) - dt; if (M.idleT <= 0) mgrThink(); }
}
// The boss does rounds: firefights on their own (angriest visitor, longest room queue, desk rush), otherwise walks from room to room.
function mgrThink() {
  const M = R.mgr; if (!M) return; M.idleT = 2;
  if (S.mgrAuto !== false && !(M.autoCd > 0)) {
    const mad = R.visitors.filter((v) => ['wait', 'queue', 'toWait'].includes(v.state) && v.pat < 0.3 && !v.prio).sort((a, b) => a.pat - b.pat)[0];
    if (mad) { mgrGo({ kind: 'v', v: mad }, true); return; }
    const rq = Object.values(R.rooms).filter((r) => !r.closed && ROOMS[r.type].role && r.staff.some(Boolean)).map((r) => [r, roomQ(r.id).length]).sort((a, b) => b[1] - a[1])[0];
    if (rq && rq[1] >= 3) { mgrGo({ kind: 'room', id: rq[0].id }, true); return; }
    if (allQ() >= 5 && R.staff.some((x) => x.at === 'desk')) { mgrGo({ kind: 'desk' }, true); return; }
  }
  M.idleT = 3; return; // (no patrol any more: she is not on the floor)
  // patrol: visit a staffed room (or the lobby), have a look, move on
  const rooms = Object.values(R.rooms).filter((r) => r.id !== M.lastRoom);
  if (rooms.length && RNG() < 0.8) { const r = rnd(rooms); M.lastRoom = r.id; const d = doorPt(r.def, 0.9); M.task = { kind: 'patrol', id: r.id }; M.look = Math.atan2(r.cx - d.x, r.cz - d.z); setPath(M, findPath(M.av.position, d)); }
  else { M.task = { kind: 'patrol' }; M.look = null; setPath(M, findPath(M.av.position, { x: 1.8 + RNG() * 3.6, z: 1.8 + RNG() * 3.6 })); }
}
const boost = () => (S && S.pepT > 0 ? 1.2 : 1);
function pepTalk() {
  if (!inGame || !R.mgr) return;
  if (S.pepCd > 0) { toast(t('pep.cd', { s: Math.ceil(S.pepCd) }), 1200); return; }
  S.pepT = 30; S.pepCd = 120; S.pepUsed = true; R.mgr.cheer = 1.6;
  toast('📣 ' + t('pep.go'), 2200);
  chat(t('pep.from', { name: MGR.name }), crnd(tList('pep.lines')), '📣', { fun: true });
  for (const rs of R.staff) floatAt(rs.av.position, '💪');
}
function updatePep() {
  const b = $('pep'); if (!S) return;
  b.style.setProperty('--p', S.pepCd > 0 ? Math.round(S.pepCd / 120 * 100) + '%' : '0%');
  b.classList.toggle('boost', S.pepT > 0);
}
$('pep').onclick = () => openMgr();

// ---------------- create manager screen ----------------
let creating = false, crAfter = 'map', draft = null;
let pvR = null;
function pvInit() {
  if (pvR) return; const c = document.createElement('canvas'); c.id = 'pc'; $('pcWrap').appendChild(c);
  pvR = new THREE.WebGLRenderer({ canvas: c, antialias: true, alpha: true });
  pvR.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); pvR.outputColorSpace = THREE.SRGBColorSpace; pvR.toneMapping = THREE.ACESFilmicToneMapping; pvR.shadowMap.enabled = true;
}
function pvFree() { if (!pvR) return; pvR.dispose(); pvR.forceContextLoss(); pvR.domElement.remove(); pvR = null; }
const pvScene = new THREE.Scene(); pvScene.add(new THREE.HemisphereLight('#ffffff', '#b8ae9f', 1.1));
const pvSun = new THREE.DirectionalLight('#fff1dc', 2.4); pvSun.position.set(3, 5, 6); pvSun.castShadow = true; pvScene.add(pvSun);
const pvFloor = new THREE.Mesh(new THREE.CylinderGeometry(1.1, 1.1, 0.12, 40), mat('#FFFFFF', { r: 0.6 })); pvFloor.position.y = -0.06; pvFloor.receiveShadow = true; pvScene.add(pvFloor);
const pvCam = new THREE.PerspectiveCamera(30, 1, 0.1, 30);
let pvAv = null;
function rebuildPreview() {
  if (pvAv) pvScene.remove(pvAv);
  const L = mgrLook(draft); pvAv = person(L, 'manager'); pvAv.position.y = 0; pvAv.traverse((m) => { if (m.isMesh) m.castShadow = true; }); pvScene.add(pvAv);
}
function renderPreview(now) {
  if (!pvR) return; const c = pvR.domElement, w = c.clientWidth, h = c.clientHeight; if (!w || !h) return;
  if (c.width !== Math.round(w * pvR.getPixelRatio())) pvR.setSize(w, h, false);
  pvCam.aspect = w / h; pvCam.position.set(0, 1.25, 5.2); pvCam.lookAt(0, 0.85, 0); pvCam.updateProjectionMatrix();
  if (pvAv) { pvAv.rotation.y = Math.sin(now / 1400) * 0.5; const p = pvAv.userData.p; if (!p.glb) p.arms[1].rotation.x = Math.sin(now / 500) * 0.15; }
  pvR.render(pvScene, pvCam);
}
function crRow(label, html) { return `<div class="lbl">${label}</div>${html}`; }
function swatches(key, list) { return `<div class="sw">${list.map((c) => `<button data-k="${key}" data-v="${c}" class="${draft[key] === c ? 'on' : ''}" style="background:${c}"></button>`).join('')}</div>`; }
function chips(key, list, lab) { return `<div class="chips">${list.map((v) => `<button data-k="${key}" data-v="${v}" class="${draft[key] === v ? 'g' : 'w'}">${lab(v)}</button>`).join('')}</div>`; }
function renderCreate() {
  const b = $('crBody');
  b.innerHTML =
    crRow(t('cr.name'), `<input id="crName" maxlength="14" placeholder="${t('cr.namePh')}" value="${(draft.name || '').replace(/"/g, '&quot;')}">`) +
    crRow(t('cr.pron'), chips('pron', ['m', 'f'], (v) => t({ m: 'cr.he', f: 'cr.she' }[v]))) +
    crRow(t('cr.pick'), `<div class="mgrpick">${MGR_MODELS.map((k) => `<button data-k="model" data-v="${k}" class="${draft.model === k ? 'on' : ''}"><img src="assets/${k}.jpg" alt=""></button>`).join('')}</div>`) + '<div style="height:8px"></div>';
  b.querySelectorAll('[data-k]').forEach((el) => el.onclick = () => {
    const k = el.dataset.k; draft.name = $('crName').value.trim(); draft[k] = el.dataset.v;
    const top = b.scrollTop; renderCreate(); b.scrollTop = top; if (k === 'model') rebuildPreview();
  });
  $('crName').oninput = (e) => { draft.name = e.target.value.trim(); };
}
function openCreate(after) {
  crAfter = after; draft = { ...(loadMgr() || randomMgr()) }; if (!draft.model) draft.model = defaultModel(draft); if (draft.pron !== 'm' && draft.pron !== 'f') draft.pron = draft.model.startsWith('mgr_h') ? 'm' : 'f';
  pvInit(); renderCreate(); rebuildPreview(); show('create'); creating = true;
}
$('crRand').onclick = () => { const name = $('crName').value.trim(), pron = draft.pron; draft = randomMgr(name); draft.pron = pron; renderCreate(); rebuildPreview(); };
function refreshMgrModel() { if (creating) rebuildPreview(); if (R.mgr && !R.mgr.av.userData.p.glb && inGame) { const old = R.mgr.av, av = person(mgrLook(MGR), 'manager'); if (av.userData.p.glb) { av.position.copy(old.position); av.rotation.copy(old.rotation); scene.remove(old); scene.add(av); R.mgr.av = av; for (const k in portraits) if (k.startsWith('mgr')) delete portraits[k]; $('pepImg').src = mgrPortrait(); } } }
$('crDone').onclick = () => {
  draft.name = ($('crName').value.trim() || crnd(FIRST)).slice(0, 14);
  MGR = { ...draft }; saveMgr(MGR); creating = false; pvFree();
  if (crAfter === 'map') showMap(); else { refreshTitle(); show('title'); }
};

// ---------------- tutorial & tips ----------------
const TUT = [
  { k: 'tut.0', ok: true },
  { k: 'tut.1', target: 'nBuild', inSheet: ['[data-size]:not([disabled])', '[data-room]'], place: true, done: () => S.rooms.length > 0 },
  { k: 'tut.2', target: 'nStaff', inSheet: ['[data-hire]:not([disabled])', '[data-hr]', '[data-role]'], done: () => Object.values(R.rooms).every((r) => !ROOMS[r.type].role || r.staff.some(Boolean)) },
  { k: 'tut.3b', done: () => !!sel || S.served >= 1 }, // something to do, not just wait: tap a visitor
  { k: 'tut.3c', ok: true, done: () => S.served >= 1 },
  { k: 'tut.d1', target: 'nBuild', inSheet: ['[data-size]:not([disabled])', '[data-room="therapy"]', '[data-room]'], place: true, done: () => hasRoom('therapy') },
  { k: 'tut.d1b', target: 'nStaff', inSheet: ['[data-hire]:not([disabled])', '[data-hr]', '[data-role]'], done: () => R.staff.some((r) => r.data.role === 'therapist') },
  { k: 'tut.d2', disc: true, done: () => (S.known || []).length > STARTER_KNOWN.length },
  { k: 'tut.d3', target: 'nBuild', inSheet: ['[data-size]:not([disabled])', '[data-room="lab"]', '[data-room]'], place: true, done: () => hasRoom('lab') },
  { k: 'tut.d3b', target: 'nStaff', inSheet: ['[data-hire]:not([disabled])', '[data-hr]', '[data-role]'], done: () => R.staff.some((r) => r.data.role === 'researcher') },
  { k: 'tut.d4', target: 'nResearch', inSheet: [], done: () => !!S.tutRes },
  { k: 'tut.4b', target: 'pep', done: () => S.pepUsed },
  { k: 'tut.5', ok: true },
  { k: 'tut.6', target: 'nGoals', inSheet: [], done: () => S.tutGoals },
  // tour of the screen: what each card and tab is for
  { k: 'tut.t1', target: 'hDay', ok: true }, { k: 'tut.t2', target: 'hCash', ok: true }, { k: 'tut.t3', target: 'hVibes', ok: true }, { k: 'tut.t4', target: 'spPause', ok: true },
  { k: 'tut.t5', target: 'nStaff', ok: true }, { k: 'tut.t6', target: 'nResearch', ok: true }, { k: 'tut.t7', target: 'nChat', ok: true }, { k: 'tut.t8', target: 'camMap', ok: true }, { k: 'tut.t9', ok: true },
  { k: 'tut.end', ok: true },
];
let tipShown = null, tipT = 0; const tipQ = [];
function tip(k, target, ok) { if (!S || S.mode !== 'career' || (S.tips[k] && !ok)) return; S.tips[k] = 1; tipQ.push({ k, target, ok }); }
function hideTut() { $('tut').classList.remove('on'); $('tarrow').style.display = 'none'; tipShown = null; }
function amaraImg() { const h = S.staff.find((s) => s.name === 'Amara Okafor') || S.staff.find((s) => s.role === 'host'); return h ? portrait(h) : mgrPortrait(); }
function finishTut() { S.tut = -1; try { localStorage.setItem('ahq_tut_done', '1'); } catch (e) {} hideTut(); save(); }
let tutDrawn = null, tutPre = false;
// 👇 above the target, or 👆 under it when the target sits at the top of the screen
function placeArrow(ar, r) { ar.style.display = 'block'; ar.style.left = (r.left + r.width / 2) + 'px'; const up = r.top < 110; ar.textContent = up ? '👆' : '👇'; ar.style.top = (up ? r.bottom + 46 : r.top - 4) + 'px'; }
function updateTut() {
  const blocked = sheetPaused || modalPaused || !inGame;
  const el = $('tut'), ar = $('tarrow');
  if (S.tut >= 0) {
    if (TUT[S.tut] && TUT[S.tut].target === 'nResearch' && noResearch()) { S.tut++; tutDrawn = null; return; } // no research tab in London
    const st = TUT[S.tut];
    if (st.done && !tutPre && tutDrawn === S.tut && st.done()) { S.tut++; tutDrawn = null; if (S.tut >= TUT.length) { finishTut(); return; } return; }
    // inside a sheet or while placing: hide the bubble but keep pointing at the next thing to tap
    if (!modalPaused && inGame && st.target && !tutPre && (sheetPaused || placingR)) {
      el.classList.remove('on'); let te = null;
      if (placingR && st.place) te = $('mvOk');
      else if (sheetPaused) for (const q of st.inSheet || []) { te = $('sheet').querySelector(q); if (te) break; }
      const r = te && te.getBoundingClientRect();
      if (r && r.width && r.top > 40 && r.top < innerHeight - 10) placeArrow(ar, r); else ar.style.display = 'none';
      return;
    }
    if (blocked) { el.classList.remove('on'); ar.style.display = 'none'; return; }
    if (tutDrawn !== S.tut) {
      tutDrawn = S.tut; tutPre = !!(st.done && st.done()); const showOk = st.ok || tutPre;
      $('tutImg').src = amaraImg();
      $('tutText').textContent = t(st.k, { name: MGR.name, g: MGR.pron });
      $('tutBtns').innerHTML = (S.tut < TUT.length - 1 ? `<button class="w" id="tutSkip">${t('tut.skip')}</button>` : '') + (showOk ? `<button class="g" id="tutOk">${t('tut.ok')}</button>` : '');
      const sk = $('tutSkip'); if (sk) sk.onclick = finishTut;
      const ok = $('tutOk'); if (ok) ok.onclick = () => { S.tut++; tutDrawn = null; if (S.tut >= TUT.length) finishTut(); };
    }
    el.classList.add('on');
    if (st.target && !tutPre) placeArrow(ar, $(st.target).getBoundingClientRect());
    else ar.style.display = 'none';
    return;
  }
  ar.style.display = 'none';
  if (tipShown) { if (tipShown.target && !blocked) placeArrow(ar, $(tipShown.target).getBoundingClientRect()); if (!tipShown.ok) tipT -= 1 / 60; if (tipT <= 0 || (blocked && !tipShown.ok)) { el.classList.remove('on'); tipShown = null; } else if (blocked) { el.classList.remove('on'); ar.style.display = 'none'; if (tipShown.target && sheetPaused) tipShown = null; } else el.classList.add('on'); return; }
  if (!blocked && tipQ.length) {
    tipShown = tipQ.shift(); tipT = 5.5;
    $('tutImg').src = amaraImg(); $('tutText').textContent = t('tip.' + tipShown.k, { name: MGR.name, g: MGR.pron });
    $('tutBtns').innerHTML = tipShown.ok ? `<button class="g" id="tipX">${t('tut.ok')}</button>` : `<button class="w" id="tipX">✕</button>`; $('tipX').onclick = () => { el.classList.remove('on'); ar.style.display = 'none'; tipShown = null; };
    el.classList.add('on');
  }
}


// ---------------- staff energy, breaks, raises ----------------
function postSpot(rs) { if (rs.at === 'desk') return deskSpot(rs.desk || 0); const room = R.rooms[rs.at]; if (room) return room.staffSpots[rs.st]; if (rs.at === 'maint') return rs.home; return { x: 5.6, z: 1.6, rot: Math.PI / 4, sit: false, y: 0 }; }
function staffEnergy(rs, dt) {
  const d = rs.data; if (d.energy == null) d.energy = 1;
  if (d.sadT > 0) d.sadT -= dt;
  if (d.pushT > 0) { d.pushT -= dt; if (d.pushT <= 0 && RNG() < 0.35) { d.awayT = DAY_LEN * 1.5; chat(d.name + ' · ' + roleN(d.role), t('ct.t.burnout'), '🫠'); } }
  if (d.awayT > 0) {
    if (rs.mode !== 'away' && patientOf(rs)) return; // life event, day off…: they finish the session in progress first, then go
    d.awayT -= dt; rs.av.visible = false; rs.mode = 'away';
    if (d.awayT <= 0) { d.awayT = 0; d.sickHome = 0; rs.av.visible = true; rs.av.position.set(3, 0.1, 11); d.energy = 1; goStaff(rs, postSpot(rs)); chat(d.name + ' · ' + roleN(d.role), t('life.back', { name: d.name.split(' ')[0] }), '👋', { fun: true }); }
    return;
  }
  if (rs.onBreak) {
    if (rs.mode === 'break') { { const pa = rs.av.userData.p; if (pa.anim && !/drink|lie/.test(pa.anim.state || '')) { if (rs.onBreak && rs.onBreak.bed) { if (pa.anim.state !== 'idle') pa.anim.set('idle'); } else if (rs.onBreak && rs.onBreak.anim) { if (pa.anim.state !== rs.onBreak.anim) pa.anim.set(rs.onBreak.anim); } else { pa.anim.set(rs.onBreak && rs.onBreak.sit ? 'drinksit' : 'drink'); holdCup(rs.av, true); } } } d.energy = Math.min(1, d.energy + dt / (rs.onBreak && rs.onBreak.bed ? 11 : rs.onBreak && rs.onBreak.anim ? 14 : 22)); /* a nap is fastest, a round of arcade beats a coffee */ if (d.energy >= 1) { holdCup(rs.av, false); rs.onBreak.busy = null; rs.onBreak = null; const old = R.rooms[rs.at]; if (old) { if (old.staff[rs.st] === rs) old.staff[rs.st] = null; rs.at = null; assignStaff(); } if (rs.at == null || rs.mode !== 'walk') goStaff(rs, postSpot(rs)); } } /* back from a break: to the room that needs them most (emergency, then longest queue), not just their old post */
  } else if (rs.mode === 'there' || rs.task) {
    if (rs.at !== 'idle' && rs.at !== 'train' && rs.at !== 'heal') d.energy = Math.max(0.05, d.energy - dt * (cityOf().altitude ? 1.15 : 1) * (S.mode === 'career' && S.temp != null && tempOff() > 0 ? 1 + 0.05 * Math.min(tempOff(), 8) : 1) / (185 * (d.traits.includes('Gym Rat') ? 1.3 : 1) * (d.wfh ? 1.3 : 1) / (cityOf().night ? 1.25 : 1)));
    if (d.energy < 0.25) {
      const free = Object.values(R.rooms).filter((r) => ROOMS[r.type].staffOnly).flatMap((r) => r.spots.filter((s) => !s.busy)), spot = free.find((s) => s.bed) || free.find((s) => s.anim) || free[0]; // a free bunk first (napping is fastest), then the arcade
      if (spot && !rs.task && !patientOf(rs)) { spot.busy = rs; rs.onBreak = spot; /* never walk out mid-session */ rs.goingTo = null; goStaff(rs, spot); tip('break'); }
      else if (!hasRoom('staffroom')) tip('tired');
      // at most one "we're exhausted" message for the whole team every 2 days (it names how many are worn out)
      if (!rs.onBreak && (S.tiredAsk == null || S.day - S.tiredAsk >= 2)) { S.tiredAsk = S.day; const n = R.staff.filter((x) => x.data && x.data.energy < 0.25 && !x.onBreak).length;
        chat(d.name + ' · ' + roleN(d.role), n > 1 ? t('staff.tiredMany', { n }) : t('staff.tiredChat'), '😮‍💨', { act: { k: 'tired', id: d.id } }); }
    }
  }
  if (!rs.zz) { rs.zz = new THREE.Sprite(iconTex('😮‍💨')); rs.zz.scale.set(0.5, 0.5, 1); rs.zz.position.y = 2.3; rs.zz.renderOrder = 10; rs.av.add(rs.zz); }
  rs.zz.material = iconTex(rs.onBreak ? '☕' : d.sick ? '🤒' : d.sadT > 0 ? '💔' : '😮‍💨'); rs.zz.visible = !!rs.onBreak || !!d.sick || d.energy < 0.25 || d.sadT > 0;
}
function raiseRequest() {
  const cand = S.staff.filter((s) => s.skill >= 2 && !s.grumpy && (s.raiseDay == null || s.raiseDay < S.day - 5)); if (!cand.length) return;
  const st = crnd(cand), up = Math.round(st.wage * 0.1 / 10) * 10; st.raiseDay = S.day;
  modal(`<img src="${portrait(st)}" style="width:80px;height:80px;border-radius:20px"><h2>${t('raise.title', { name: st.name.split(' ')[0] })}</h2><p>${t('raise.p', { m: money(up) })}</p><div class="row2" style="margin-top:10px"><button class="btn y" id="rNo">${t('raise.no')}</button><button class="btn g" id="rYes">${t('raise.yes')}</button></div>`);
  $('rYes').onclick = () => { closeModal(); st.wage += up; st.energy = 1; toast(t('raise.ok', { name: st.name.split(' ')[0] })); save(); };
  $('rNo').onclick = () => { closeModal(); st.grumpy = S.day; chat(st.name + ' · ' + roleN(st.role), t('raise.grumpy', { name: st.name.split(' ')[0] }), '😒'); save(); };
}
function lifeEvent() {
  const cand = S.staff.filter((s) => !(s.awayT > 0) && (s.lifeDay == null || s.lifeDay < S.day - 6)); if (!cand.length) return;
  const st = crnd(cand), first = st.name.split(' ')[0], k = crnd(st.wfh || !WFH_ROLES.includes(st.role) ? ['break', 'baby'] : ['break', 'baby', 'wfh']); st.lifeDay = S.day;
  const say = (ok) => chat(st.name + ' · ' + roleN(st.role), t(ok ? 'life.okChat' : 'life.noChat'), ok ? '🥹' : '😒');
  const btns = { break: [['life.breakOff', 'g', () => { st.awayT = DAY_LEN * 0.5; say(true); }], ['life.breakStay', 'y', () => { st.sadT = DAY_LEN; }]],
    baby: [['life.babyPaid', 'g', () => { st.awayT = DAY_LEN * 2; vb('misc', 0 + 2); chat(st.name + ' · ' + roleN(st.role), t('life.babyChat'), '👶'); }], ['life.babyUnpaid', 'y', () => { st.awayT = DAY_LEN * 2; S.cash += Math.round(st.wage * 0.5); if (Math.random() < 0.5) st.grumpy = S.day; say(false); }]],
    wfh: [['life.wfhYes', 'g', () => { st.wfh = true; say(true); }], ['life.wfhNo', 'y', () => { if (Math.random() < 0.5) st.grumpy = S.day; say(false); }]] }[k];
  modal(`<img src="${portrait(st)}" style="width:80px;height:80px;border-radius:20px"><h2>${t('life.' + k + 'T', { name: first })}</h2><p>${t('life.' + k + 'P')}</p>` + btns.map(([lk, c], i) => `<button class="btn ${c}" id="lf${i}" style="width:100%;margin-top:8px">${t(lk)}</button>`).join(''));
  btns.forEach(([, , fn], i) => { $('lf' + i).onclick = () => { closeModal(); fn(); save(); }; });
}
function poachCheck() {
  for (const st of S.staff.slice()) if (st.grumpy && st.grumpy < S.day && Math.random() < 0.4) { chat(t('from.hq'), t('poach.left', { name: st.name }), '😭'); fire(st.id, true); return; }
}

// ---------------- equipment, decor, kudos ----------------
const DECOR = { sofa: { cost: 500, e: '🛋️', calm: 0.95, vibe: 0.001, seats: 2 }, radiator: { cost: 400, e: '🔥', calm: 1, vibe: 0, temp: 1 }, aircon: { cost: 600, e: '❄️', calm: 1, vibe: 0, temp: -1 }, plant: { cost: 150, e: '🪴', calm: 0.94, vibe: 0.0015 }, neon: { cost: 300, e: '💡', calm: 0.96, vibe: 0.002 }, vending: { cost: 600, e: '🥤', calm: 0.9, vibe: 0 }, bench2: { cost: 250, e: '🪑', calm: 0.97, vibe: 0, seats: 2, len: 1.2 }, bench3: { cost: 350, e: '🪑', calm: 0.96, vibe: 0, seats: 3, len: 1.75 }, gold: { kd: 10, e: '🌟', calm: 0.92, vibe: 0.005 }, doormat: { cost: 300, e: '🟫', calm: 1, vibe: 0, flat: true } };
function profile() { try { return JSON.parse(localStorage.getItem('ahq_profile')) || { kudos: 0 }; } catch (e) { return { kudos: 0 }; } }
function kudos() { return profile().kudos || 0; }
function addKudos(n) { if (S.mode !== 'career') return; const p = profile(); p.kudos = (p.kudos || 0) + n; try { localStorage.setItem('ahq_profile', JSON.stringify(p)); } catch (e) {} toast(t('kd.got', { n }), 1800); }
function decorMesh(k) {
  const g = new THREE.Group();
  if (k === 'doormat') { put(rbox(1.4, 0.03, 0.9, '#6B4F35', 0.02), 0, 0.03, 0, g); put(rbox(1.2, 0.035, 0.7, '#9C7B52', 0.02), 0, 0.035, 0, g); }
  if (k === 'plant' || k === 'gold') { const pl = plant(0, 0, k === 'gold' ? 1.3 : 1.15, k === 'gold' ? '#E3B341' : '#FFFFFF', g); pl.position.y = 0; if (k === 'gold') pl.traverse((m) => { if (m.isMesh && m.geometry.type === 'SphereGeometry') m.material = mat('#F2C14E', { m: 0.6, r: 0.3, e: '#FFD25E', ei: 0.25 }); }); }
  if (k === 'radiator') { for (let i = -3; i <= 3; i++) put(rbox(0.12, 0.7, 0.14, '#F4F2EE', 0.04), i * 0.14, 0.55, 0, g); put(rbox(1.05, 0.06, 0.16, '#E3E0DA', 0.02), 0, 0.92, 0, g); for (const x of [-0.42, 0.42]) put(cyl(0.025, 0.025, 0.2, '#8A8E96'), x, 0.12, 0, g); put(sph(0.05, '#E9785F', { e: '#E9785F', ei: 0.8 }), 0.48, 0.7, 0.08, g); glbSwap(g, 'radiator', { len: 1.1 }); }
  if (k === 'aircon') { put(rbox(0.55, 1.5, 0.4, '#F4F2EE', 0.08), 0, 0.8, 0, g); for (let i = 0; i < 5; i++) put(rbox(0.42, 0.03, 0.02, '#BFC6CE', 0.01), 0, 1.15 + i * 0.07, 0.21, g); put(rbox(0.4, 0.06, 0.02, '#5AB8F0', 0.01, { e: '#5AB8F0', ei: 0.9 }), 0, 0.55, 0.21, g); glbSwap(g, 'aircon', { h: 1.15 }); }
  if (k === 'neon') { put(rbox(1.3, 0.5, 0.08, '#2F3A52', 0.04), 0, 1.7, 0, g); put(rbox(1.1, 0.12, 0.05, '#FF8FAB', 0.02, { e: '#FF8FAB', ei: 1.5 }), 0, 1.75, 0.05, g); put(cyl(0.03, 0.03, 1.5, '#2F3A52'), 0, 0.8, 0, g); }
  if (k === 'vending') { // a real drinks machine: red cabinet, lit sign on top, a glass window with 4 shelves of cans and bottles, the coin/card panel and buttons on the right, the pick-up flap at the bottom
    const RED = '#C9302C', DK = '#2B2F36';
    put(rbox(0.95, 1.9, 0.78, RED, 0.06, { r: 0.45 }), 0, 1.0, 0, g); put(rbox(0.99, 0.08, 0.82, DK, 0.03), 0, 0.09, 0, g); // body on a dark plinth
    put(rbox(0.85, 0.2, 0.03, '#FFF4E0', 0.02, { e: '#FFE7B8', ei: 0.9 }), 0, 1.78, 0.39, g); put(rbox(0.5, 0.06, 0.01, RED, 0.005), -0.1, 1.78, 0.405, g); // lit brand panel
    put(rbox(0.64, 1.2, 0.04, DK, 0.03), -0.1, 1.06, 0.38, g); put(rbox(0.58, 1.12, 0.02, '#CFE9F5', 0.01, { e: '#BFE6F6', ei: 0.35, op: 0.55 }), -0.1, 1.06, 0.41, g); // window
    const C = ['#E53E3E', '#2E9E5B', '#F2C14E', '#3B82F6', '#F07C9A', '#FFFFFF'];
    for (let r = 0; r < 4; r++) { const y = 0.6 + r * 0.27; put(rbox(0.56, 0.02, 0.3, '#9AA3AE', 0.005), -0.1, y, 0.24, g);
      for (let c = 0; c < 5; c++) { const col = C[(r * 2 + c) % C.length], x = -0.34 + c * 0.12; if ((r + c) % 2) put(cyl(0.035, 0.035, 0.13, col, { m: 0.5, r: 0.35 }), x, y + 0.075, 0.27, g); else { put(cyl(0.032, 0.036, 0.15, col, { r: 0.3 }), x, y + 0.085, 0.27, g); put(cyl(0.015, 0.015, 0.04, '#F4F4F4'), x, y + 0.18, 0.27, g); } } }
    put(rbox(0.22, 1.2, 0.03, '#3A3F47', 0.02), 0.33, 1.06, 0.395, g); // control panel
    for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) put(rbox(0.05, 0.04, 0.02, '#E9ECEF', 0.008), 0.29 + c * 0.08, 1.38 - r * 0.07, 0.415, g);
    put(rbox(0.12, 0.08, 0.02, '#7ACB4E', 0.01, { e: '#7ACB4E', ei: 0.7 }), 0.33, 1.55, 0.415, g); put(rbox(0.04, 0.1, 0.02, '#111', 0.005), 0.33, 1.06, 0.415, g); put(rbox(0.12, 0.07, 0.02, '#111', 0.01), 0.33, 0.9, 0.415, g); // display, coin slot, card reader
    put(rbox(0.6, 0.2, 0.06, DK, 0.03), -0.1, 0.3, 0.38, g); put(rbox(0.54, 0.12, 0.02, '#4A505A', 0.02), -0.1, 0.31, 0.415, g); } // pick-up flap
  if (k === 'sofa') { put(rbox(2.0, 0.42, 0.85, '#FF8FAB', 0.15), 0, 0.3, 0, g); put(rbox(2.0, 0.62, 0.26, '#FF8FAB', 0.12), 0, 0.62, -0.32, g); for (const sx of [-1.0, 1.0]) put(rbox(0.24, 0.55, 0.85, '#F07C9A', 0.1), sx, 0.42, 0, g); glbSwap(g, 'sofa', { len: 2.2, h: 0.8 }); }
  if (k === 'bench2' || k === 'bench3') benchMesh(g, DECOR[k].len);
  if (false) { put(rbox(0.8, 0.5, 0.9, '#3B4A6B', 0.15), 0, 0.35, 0, g); put(rbox(0.8, 0.9, 0.25, '#3B4A6B', 0.12), 0, 0.85, -0.35, g); put(rbox(0.3, 0.15, 0.6, '#B57BE8', 0.06), 0.45, 0.65, 0, g); }
  g.traverse((m) => { if (m.isMesh) { m.castShadow = true; } });
  return g;
}
// a built sofa is real waiting seating: two seats join the waiting spots (seat height is found by settle)
const SEAT_X = { 2: [-0.3, 0.3], 3: [-0.56, 0, 0.56] };
const SOFA_SEATS = (d) => (d.k === 'sofa' ? [-0.5, 0.5] : SEAT_X[DECOR[d.k].seats]).map((lx) => ({ x: d.x + lx * Math.cos(d.r || 0) + 0.12 * Math.sin(d.r || 0), z: d.z - lx * Math.sin(d.r || 0) + 0.12 * Math.cos(d.r || 0), rot: d.r || 0, sit: true, y: d.k === 'sofa' ? 0.02 : 0.0, busy: null, dec: d.id, bench: d.k !== 'sofa' }));
function syncDecorSeats() {
  const want = new Map((S.decor || []).filter((d) => DECOR[d.k] && DECOR[d.k].seats).map((d) => [d.id, d]));
  for (let i = WAIT_SPOTS.length - 1; i >= 0; i--) { const w = WAIT_SPOTS[i]; if (w.dec == null) continue; const d = want.get(w.dec); if (!d || Math.hypot(w.x - d.x, w.z - d.z) > 0.8) { if (w.busy && w.busy.spot === w) w.busy.spot = null; WAIT_SPOTS.splice(i, 1); } }
  for (const d of want.values()) if (!WAIT_SPOTS.some((w) => w.dec === d.id)) WAIT_SPOTS.splice(0, 0, ...SOFA_SEATS(d)); // seats are taken before standing places
}
const BREAKS = new Set(['vending', 'aircon', 'radiator']);
function decState(d) { const m = world.decor[d.id]; if (!m) return;
  if (m.userData.brk) { m.remove(m.userData.brk); m.userData.brk = null; }
  if (d.broken) { const sp = new THREE.Sprite(iconTex('⚠️')); sp.scale.set(0.5, 0.5, 1); sp.position.set(0, 2.1, 0); m.add(sp); m.userData.brk = sp; }
  const lv = d.broken ? 2 : d.k === 'plant' && (d.dry || 0) >= 1 ? 2 : 0;
  m.traverse((o) => { if (!o.isMesh || o.isInstancedMesh || !o.material || Array.isArray(o.material)) return; if (!o.userData.m0) o.userData.m0 = o.material; o.material = lv ? dirtyMat(o.userData.m0, lv) : o.userData.m0; });
  m.rotation.z = d.k === 'plant' && (d.dry || 0) >= 1 ? 0.18 : 0; }
function decorDaily() { if (!S || S.mode !== 'career' || (S.city || 'london') === 'london') return;
  for (const d of S.decor || []) { if (BREAKS.has(d.k) && !d.broken && Math.random() < 0.1) { d.broken = true; decState(d); floatAt({ x: d.x, y: 1.4, z: d.z }, '💥'); }
    if (d.k === 'plant') { d.dry = (d.dry || 0) + 0.5; decState(d); } } }
function buildDecor(d) { if (world.decor[d.id]) scene.remove(world.decor[d.id]); const m = decorMesh(d.k); m.position.set(d.x, 0.1, d.z); m.rotation.y = d.r || 0; m.traverse((o) => { o.userData.decorId = d.id; }); scene.add(m); world.decor[d.id] = m; syncDecorSeats(); if (d.broken || d.dry) setTimeout(() => decState(d), 1500); }
function decorCalm(v) { let f = 1; for (const d of S.decor || []) if (!d.broken && !(d.k === 'plant' && (d.dry || 0) >= 1) && Math.hypot(d.x - v.av.position.x, d.z - v.av.position.z) < 2.6) f *= DECOR[d.k].calm; return Math.max(0.55, f); }
let decorT = 0;
function decorUpdate(dt) {
  for (const d of S.decor || []) vb('decor', 0 + DECOR[d.k].vibe * dt);
  decorT += dt; if (decorT < 8) return; decorT = 0;
  if (false) for (const d of S.decor || []) if (d.k === 'vending') { const near = R.visitors.filter((v) => ['wait', 'queue'].includes(v.state) && Math.hypot(d.x - v.av.position.x, d.z - v.av.position.z) < 3.5).length; if (near) { const m = near * 4; S.cash += m; S.earned += m; floatAt({ x: d.x, y: 0.5, z: d.z }, '+' + money(m)); } }
}
// one use spot per vending machine (stand in front of it) and per massage chair (sit in it)
const AMEN = new Map();
function amenSpot(v) {
  const list = (S.decor || []).filter((d) => d.k === 'vending' && !d.broken);
  for (const id of [...AMEN.keys()]) if (!list.some((d) => d.id === id)) AMEN.delete(id);
  const free = []; for (const d of list) { let a = AMEN.get(d.id); const r = d.r || 0;
    const want = d.k === 'vending' ? { x: d.x + Math.sin(r) * 0.85, z: d.z + Math.cos(r) * 0.85, rot: r + Math.PI, sit: false, y: 0 } : { x: d.x, z: d.z, rot: r, sit: true, y: 0.05 };
    if (!a) { a = { ...want, k: d.k, busy: null }; AMEN.set(d.id, a); } else if (!a.busy) Object.assign(a, want);
    if (!a.busy) free.push(a); }
  if (!free.length) return null; return rnd(free);
}
// an item may not cut the hall in two: every room door and the reception queue must still be reachable from the entrance
// an item may not cut a room's door off from the reception. Compared with the HQ *without* the item: a door that is already unreachable
// (a room facing the plot edge, an older item, a lobby plant) no longer forbids every placement everywhere, it just isn't counted
function doorReach(extra, id) {
  const keep = S.decor; S.decor = (S.decor || []).filter((d) => d.id !== id).concat(extra ? [extra] : []);
  let blk; try { blk = makeGrid(S.rooms.slice()); } finally { S.decor = keep; }
  const st = QUEUE(0, 0), [si, sj] = ci(st.x, st.z); if (!free(blk, si, sj)) return null; // can't tell from here
  const seen = new Uint8Array(GW * GH), q = [si + sj * GW]; seen[q[0]] = 1;
  while (q.length) { const c = q.pop(), i = c % GW, j = (c - i) / GW; for (const [di, dj] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + di, nj = j + dj; if (free(blk, ni, nj) && !seen[nj * GW + ni]) { seen[nj * GW + ni] = 1; q.push(nj * GW + ni); } } }
  const ok = (pt) => { const [i, j] = ci(pt.x, pt.z); for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) { const ni = i + di, nj = j + dj; if (ni >= 0 && nj >= 0 && ni < GW && nj < GH && seen[nj * GW + ni]) return true; } return false; };
  return S.rooms.map((rm) => ok(doorPt(rm, 0.5)));
}
let doorBase = null;
function decorKeepsPaths(x, z, id, k, r) {
  const key = S.rooms.length + '|' + (S.decor || []).length + '|' + id; if (!doorBase || doorBase.key !== key) doorBase = { key, v: doorReach(null, id) };
  const now = doorReach({ id: -1, k, x, z, r }, id); if (!now || !doorBase.v) return true;
  return now.every((ok, i) => ok || !doorBase.v[i]);
}
function benchMesh(g, len) { // a simple slatted wooden bench on two dark metal frames, seats about 0.45 m high
  for (let i = 0; i < 3; i++) put(rbox(len, 0.05, 0.12, '#B98552', 0.02), 0, 0.45, -0.15 + i * 0.15, g);
  for (let i = 0; i < 2; i++) put(rbox(len, 0.1, 0.04, '#B98552', 0.02), 0, 0.68 + i * 0.16, -0.27, g).rotation.x = -0.12;
  for (const sx of [-1, 1]) { const x = sx * (len / 2 - 0.1); put(rbox(0.05, 0.45, 0.42, '#3A3F47', 0.015), x, 0.22, 0, g); put(rbox(0.05, 0.5, 0.05, '#3A3F47', 0.015), x, 0.7, -0.27, g); put(rbox(0.06, 0.05, 0.44, '#3A3F47', 0.015), x, 0.62, -0.02, g); }
}
const DECOR_HALF = (k) => (k === 'sofa' ? [1.15, 0.5] : k === 'doormat' ? [0.7, 0.45] : DECOR[k] && DECOR[k].len ? [DECOR[k].len / 2, 0.3] : [0.3, 0.3]);
let decorWhy = null; const why = (k) => { decorWhy = k; return false; }; // why a spot is refused, shown under the item while it is dragged
function decorValid(x, z, id, k = placingD ? placingD.k : 'plant', r = placingD ? placingD.mesh.rotation.y : 0) { // the whole footprint, rotated, must be clear
  const [hx, hz] = DECOR_HALF(k), c = Math.cos(r), sn = Math.sin(r), pts = [[0, 0]];
  for (const u of [-hx, 0, hx]) for (const w of [-hz, hz]) pts.push([u, w]);
  if (DECOR[k] && DECOR[k].flat) { // a doormat is walked on: the queue line, the desk and room doors don't matter, only the floor (its middle) and other mats
    if (!inFloor(x, z)) return why('out'); if ((S.decor || []).some((d) => d.id !== id && d.k === k && Math.hypot(d.x - x, d.z - z) < 1.2)) return why('item'); decorWhy = null; return true; }
  for (const [u, w] of pts) { const px = x + u * c + w * sn, pz = z - u * sn + w * c;
    if (!inFloor(px, pz)) return why('out');
    if (S.rooms.some((rm) => { const q = roomRect(rm); return px > q.x0 - 0.02 && px < q.x1 + 0.02 && pz > q.z0 - 0.02 && pz < q.z1 + 0.02; })) return why('room'); // flush against a room's outside wall is fine
    if (S.rooms.some((rm) => { const dp = doorPt(rm, 0); return Math.hypot(px - dp.x, pz - dp.z) < 1.3; })) return why('door'); // never in front of a door
    if (px > SOFA_BOX[0] && px < SOFA_BOX[1] && pz > SOFA_BOX[2] && pz < SOFA_BOX[3]) return why('desk');
    if (desks().some((D, di) => Array.from({ length: QMAX }, (_, i) => QUEUE(i, di)).some((q) => Math.hypot(px - q.x, pz - q.z) < 0.55))) return why('queue'); // keep the queue line free
    if (desks().some((D) => Math.hypot(px - D.x, pz - D.z) < 1.4) || LOBBY_PLANTS.some(([a, b]) => Math.hypot(px - a, pz - b) < 0.5)) return why('desk');
    if ((S.decor || []).some((d) => d.id !== id && Math.hypot(d.x - px, d.z - pz) < (d.k === 'sofa' ? 1.2 : DECOR[d.k] && DECOR[d.k].len ? DECOR[d.k].len / 2 + 0.3 : 0.6))) return why('item'); }
  if (!decorKeepsPaths(x, z, id, k, r)) return why('path');
  decorWhy = null; return true;
}
let placingD = null;
function startDecor(k, edit) { resumeForBuild();
  closeSheet(); selectVisitor(null);
  const c = edit ? { x: edit.x, z: edit.z } : [[5.8, 0.8], [0.7, 0.7], [5.8, 3.6], [3.5, 0.7], [0.7, 6.0], [6.0, 6.0]].map(([x, z]) => ({ x, z })).concat(Array.from({ length: 625 }, (_, i) => ({ x: 0.5 + (i % 25) * 0.25, z: 0.5 + Math.floor(i / 25) * 0.25 }))).find((p) => decorValid(p.x, p.z, undefined, k, 0)) || { x: 3, z: 1 };
  placingD = { k, x: c.x, z: c.z, edit, mesh: decorMesh(k) }; scene.add(placingD.mesh);
  if (edit) world.decor[edit.id].visible = false;
  $('movebar').classList.add('on'); $('nav').style.visibility = $('pep').style.visibility = 'hidden';
  $('mvRot').textContent = t('move.rotate'); $('mvOk').textContent = t('move.ok'); $('mvCancel').textContent = t('move.cancel');
  $('mvOk').onclick = () => endDecor(true); $('mvCancel').onclick = () => endDecor(false); $('mvRot').onclick = () => { placingD.mesh.rotation.y += Math.PI / 2; decorShow(); };
  decorShow();
}
// dragged close to a room's outside wall, an item backs flush onto it and turns to face the hall (a doormat stays where it's put)
function wallSnap(p) {
  if (DECOR[p.k] && DECOR[p.k].flat) return; const [hx, hz] = DECOR_HALF(p.k); let best = null, bd = 0.45;
  for (const rm of S.rooms) { const q = roomRect(rm);
    for (const [nx, nz, edge] of [[-1, 0, q.x0], [1, 0, q.x1], [0, -1, q.z0], [0, 1, q.z1]]) {
      const d = nx ? (p.x - edge) * nx : (p.z - edge) * nz; if (d < -0.1 || d - hz > bd) continue; // in front of this wall, not inside the room
      const along = nx ? p.z : p.x, a0 = nx ? q.z0 : q.x0, a1 = nx ? q.z1 : q.x1; if (along - hx < a0 - 0.05 || along + hx > a1 + 0.05) continue; // fully along the wall
      bd = d - hz; best = { nx, nz, edge }; } }
  if (!best) return; const g = 0.04 + hz;
  if (best.nx) p.x = best.edge + best.nx * g; else p.z = best.edge + best.nz * g;
  p.mesh.rotation.y = Math.atan2(best.nx, best.nz);
}
function decorShow() { const p = placingD; p.mesh.position.set(p.x, 0.16, p.z); const ok = decorValid(p.x, p.z, p.edit && p.edit.id); $('mvOk').disabled = !ok; $('moveHint').textContent = DECOR[p.k].e + ' ' + (ok ? t('dc.hint') : decorWhy ? t('dc.why.' + decorWhy) : t('dc.bad')); }
function decorDrag(e) { ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam); if (!ray.ray.intersectPlane(gPlane, gHit)) return; placingD.x = Math.round(gHit.x * 4) / 4; placingD.z = Math.round(gHit.z * 4) / 4; wallSnap(placingD); decorShow(); }
function endDecor(ok) {
  const p = placingD; if (!p) return; placingD = null; scene.remove(p.mesh);
  $('movebar').classList.remove('on'); $('nav').style.visibility = $('pep').style.visibility = '';
  $('mvOk').onclick = () => endMove(true); $('mvCancel').onclick = () => endMove(false); $('mvRot').onclick = () => { moving.r = (moving.r + Math.PI / 4) % (Math.PI * 2); moveShow(); };
  if (p.edit) world.decor[p.edit.id].visible = true;
  if (!ok || !decorValid(p.x, p.z, p.edit && p.edit.id, p.k, p.mesh.rotation.y)) return;
  const D = DECOR[p.k];
  if (p.edit) { Object.assign(p.edit, { x: p.x, z: p.z, r: p.mesh.rotation.y }); buildDecor(p.edit); rebuildGrid(); save(); return; }
  if (D.kd) { const pr = profile(); if ((pr.kudos || 0) < D.kd) { toast(t('kd.need')); return; } pr.kudos -= D.kd; localStorage.setItem('ahq_profile', JSON.stringify(pr)); }
  else if (D.temp && !S.tempFree) { S.tempFree = true; toast('🎁 ' + t('tp.free')); }
  else { if (S.cash < D.cost) { toast(t('build.noCash')); return; } S.cash -= D.cost; }
  const d = { id: S.nextId++, k: p.k, x: p.x, z: p.z, r: p.mesh.rotation.y }; (S.decor = S.decor || []).push(d); buildDecor(d); save();
  rebuildGrid();
}
function openDecorMenu(id) {
  const d = (S.decor || []).find((x) => x.id === id); if (!d) return; const D = DECOR[d.k], refund = D.cost ? Math.round(D.cost / 2) : 0;
  openSheet(`<h2>${D.e} ${t('dc.' + d.k)}</h2><p class="sub">${t('dc.' + d.k + 'D')}</p><div class="row2"><button class="btn g" id="dMove">✋ ${t('dc.move')}</button><button class="btn y" id="dSell">${t('dc.sell', { m: D.kd ? '✨' + Math.round(D.kd / 2) : money(refund) })}</button></div>`);
  $('dMove').onclick = () => startDecor(d.k, d);
  $('dSell').onclick = () => { closeSheet(); if (D.kd) addKudos(Math.round(D.kd / 2)); else S.cash += refund; S.decor = S.decor.filter((x) => x !== d); scene.remove(world.decor[d.id]); delete world.decor[d.id]; syncDecorSeats(); rebuildGrid(); save(); };
}
function buildExtras() {
  let h = `<div class="lbl" style="margin:12px 0 6px">🔧 ${t('eq.title')}</div>`;
  for (const [k, cost] of [['gen', 1500], ['ac', 2000], ['garden', 3000]].filter(([k]) => S[k] || (k === 'gen' ? cityOf().power : k === 'ac' ? cityOf().hot : true)).concat(S.garden ? [['gardenRoof', 2500], ['gardenHeat', 1200], ['gardenCool', 1200]] : [])) h += `<div class="opt w"><div class="oi" style="background:#E3ECF5">${{ gen: '🔋', ac: '❄️', net: '📡', quiet: '🔇', garden: '🌳', gardenRoof: '🏠', gardenHeat: '🔥', gardenCool: '🌬️' }[k]}</div><div class="ot"><b>${t('eq.' + k)} · ${money(cost)}</b><div>${t('eq.' + k + 'D')}</div></div>${S[k] ? `<span class="tr good">${t('eq.owned')}</span>` : `<button class="btn g" data-eq="${k}" data-cost="${cost}" ${S.cash < cost ? 'disabled' : ''}>${t('build.btn')}</button>`}</div>`;
  // (no 'your placed items' list: tap an item in the HQ to move or sell it)
  if (S.gen) h += `<div class="opt w"><div class="oi" style="background:#FFF3CF">⛽</div><div class="ot"><b>${t('gen.status', { f: genFuel(), tank: GEN_TANK, n: genCap() })}${S.genBroken ? ' · 💥 ' + t('gen.brokenShort') : ''}</b><div>${t('gen.info')}</div></div>${S.genBroken ? `<button class="btn y" id="genFix" ${S.cash < 350 ? 'disabled' : ''}>🔧 ${money(350)}</button>` : genFuel() < GEN_TANK ? `<button class="btn g" id="genFuel" ${S.cash < (GEN_TANK - genFuel()) * fuelPrice() ? 'disabled' : ''}>⛽ ${money((GEN_TANK - genFuel()) * fuelPrice())}</button>` : ''}${!S.genBig ? `<button class="btn w" id="genBig" ${S.cash < 3500 ? 'disabled' : ''}>⚡ ${money(3500)}</button>` : ''}</div>`;
  h += `<div class="lbl" style="margin:12px 0 6px">🪴 ${t('dc.title')} · ✨ ${kudos()} ${t('kd.name')}</div><p class="sub">${t('kd.info')}</p>`;
  for (const [k, D] of Object.entries(DECOR)) if (k !== 'sofa' && k !== 'neon') h += `<div class="opt w"><div class="oi" style="background:${D.kd ? '#FFF3CF' : '#DDF3E2'}">${D.e}</div><div class="ot"><b>${t('dc.' + k)} · ${D.kd ? '✨' + D.kd : money(D.cost)}</b><div>${t('dc.' + k + 'D')}</div></div><button class="btn ${D.kd ? 'y' : 'g'}" data-dec="${k}" ${D.kd ? (kudos() < D.kd ? 'disabled' : '') : (S.cash < D.cost ? 'disabled' : '')}>${t('build.btn')}</button></div>`;
  return h;
}
function bindExtras() {
  $('sheet').querySelectorAll('[data-eq]').forEach((b) => b.onclick = () => { const k = b.dataset.eq, c = +b.dataset.cost; if (S.cash < c) return; S.cash -= c; S[k] = true; if (k.startsWith('garden')) { world.shellOwn = null; buildAnnexLot(); rebuildGrid(); gardenRain(); } save(); toast(t('eq.done', { name: t('eq.' + k) })); openBuild(); });
  $('sheet').querySelectorAll('[data-dec]').forEach((b) => b.onclick = () => startDecor(b.dataset.dec));
  { const f = $('genFuel'), x = $('genFix'), bg = $('genBig'); if (f) f.onclick = () => { refuelGen(); closeSheet(); }; if (x) x.onclick = () => { repairGen(); closeSheet(); }; if (bg) bg.onclick = () => { if (S.cash < 3500) return; S.cash -= 3500; S.genBig = true; save(); toast('⚡ ' + t('gen.bigR')); closeSheet(); }; }
  $('sheet').querySelectorAll('[data-mvdec]').forEach((b) => b.onclick = () => { const d = (S.decor || []).find((x) => x.id === +b.dataset.mvdec); if (d) { closeSheet(); startDecor(d.k, d); } });
}

// ---------------- generator: a crutch, not a cure ----------------
// It only carries a few rooms (4, or 9 with the big one), burns fuel that must be bought (dearer in Lagos as the weeks go by),
// is loud (waiting people get edgy), and can stall — then the cut is total until someone repairs it.
const GEN_TANK = 4, genCap = () => (S.genBig ? 9 : 4);
const fuelPrice = () => Math.round(110 * (S.city === 'lagos' ? Math.min(2.2, 1 + S.day / 30) : 1));
const genFuel = () => (S.genFuel ?? GEN_TANK);
function refuelGen() { const need = GEN_TANK - genFuel(), c = need * fuelPrice(); if (!need || S.cash < c) return false; S.cash -= c; S.genFuel = GEN_TANK; save(); toast('⛽ ' + t('gen.refueled', { m: money(c) })); return true; }
function repairGen() { const c = 350; if (!S.genBroken || S.cash < c) return false; S.cash -= c; S.genBroken = false; save(); toast('🔧 ' + t('gen.repaired')); return true; }
// ---------------- building incidents (from city 2): a room is out of action for 1–2 days ----------------
// The maintenance crew can only make it safe — they cannot repair it. Wait it out, or pay a technician for an express repair.
const INC_MESH = new Map(); // room id → warning sign / puddle (never saved)
const INC = { leak: { e: '💧', closes: true }, elec: { e: '⚡', spd: 0.45 }, ceiling: { e: '🧱', closes: true }, smash: { e: '🔨', closes: true } }; // smash: broken by the crew, closed until you pay the repair, then 1 day of work
const nowAbs = () => S.day * DAY_LEN + S.t;
const incOf = (id) => (S.inc || []).find((x) => x.room === id);
const incSpd = (room) => { const x = incOf(room.id); return x && INC[x.k].spd ? INC[x.k].spd : 1; };
const expressCost = (x) => { const r = S.rooms.find((q) => q.id === x.room); return Math.round(({ s: 650, m: 950, l: 1400 })[r ? r.size : 'm'] * (x.k === 'ceiling' ? 1.3 : 1)); };
const incLeft = (x) => { const s2 = Math.max(0, x.end - nowAbs()), d = Math.floor(s2 / DAY_LEN), h = Math.round((s2 % DAY_LEN) / DAY_LEN * 24); return d ? t('inc.leftD', { d, h }) : t('inc.leftH', { h: Math.max(1, h) }); };
function incStart() {
  if ((S.city || 'london') === 'london' || (S.inc || []).length >= 2) return;
  const pool = S.rooms.filter((r) => !ROOMS[r.type].staffOnly && !incOf(r.id) && R.rooms[r.id]); if (pool.length < 3) return;
  const r = rnd(pool), k = rnd(['leak', 'leak', 'elec', 'ceiling']), dur = DAY_LEN * (1 + RNG());
  const x = { k, room: r.id, end: nowAbs() + dur }; (S.inc = S.inc || []).push(x); incVisual(x);
  AU.sfx('err'); toast(INC[k].e + ' ' + t('inc.' + k, { room: rn(r.type) }), 3000);
  chat(t('from.hq'), t('inc.' + k, { room: rn(r.type) }) + ' ' + t('inc.' + k + 'D') + ' ' + t('inc.how', { left: incLeft(x) }), INC[k].e, { act: { k: 'inc', room: r.id } });
}
function incVisual(x) {
  const room = R.rooms[x.room]; if (!room || INC_MESH.has(x.room)) return; const g = new THREE.Group(); g.position.set(room.cx + 0.6, 0, room.cz + 0.6);
  if (x.k === 'leak') { put(cyl(0.55, 0.55, 0.02, '#7FC7F0'), 0, 0.14, 0, g); const d = put(cyl(0.0, 0.08, 0.2, '#7FC7F0'), 0, 2.4, 0, g); g.userData.drip = d; }
  else if (x.k === 'smash') { for (let i = 0; i < 9; i++) put(rbox(0.16 + RNG() * 0.14, 0.03, 0.1 + RNG() * 0.12, i % 3 ? '#BFE3F2' : '#8A6A4E', 0.01), (RNG() - 0.5) * 1.6, 0.13, (RNG() - 0.5) * 1.6, g).rotation.y = RNG() * 3; }
  else if (x.k === 'ceiling') { for (let i = 0; i < 5; i++) put(rbox(0.22, 0.08, 0.18, '#CFC6B8', 0.03), (RNG() - 0.5) * 0.9, 0.16, (RNG() - 0.5) * 0.9, g); }
  put(rbox(0.5, 0.5, 0.04, '#FFD23F', 0.05), 0, 0.55, 0, g).rotation.z = Math.PI / 4; put(rbox(0.06, 0.5, 0.06, '#3A3F47', 0.01), 0, 0.25, 0, g);
  scene.add(g); INC_MESH.set(x.room, g);
}
function incEnd(x, express) {
  S.inc = (S.inc || []).filter((y) => y !== x); const mm = INC_MESH.get(x.room); if (mm) { scene.remove(mm); INC_MESH.delete(x.room); }
  const room = R.rooms[x.room]; if (room && INC[x.k].closes) room.closed = !!(S.ev && S.ev.k === 'leak' && S.ev.room === x.room);
  if (room) chat(t('from.hq'), t(express ? 'inc.fixedX' : 'inc.fixed', { room: rn(room.type) }), '🔧');
}
function incTick(dt) {
  for (const x of (S.inc || []).slice()) {
    const room = R.rooms[x.room]; if (!room) { S.inc = S.inc.filter((y) => y !== x); continue; }
    if (!INC_MESH.has(x.room)) incVisual(x);
    if (INC[x.k].closes) room.closed = true;
    { const mm = INC_MESH.get(x.room); if (mm && mm.userData.drip) mm.userData.drip.position.y = 2.4 - ((performance.now() / 600) % 1) * 2.2; }
    if (x.techT != null) { incEnd(x, true); continue; } // a repair paid in an older save: done
    if (nowAbs() >= x.end) incEnd(x, false);
  }
}
function incRepair(id) { const x = incOf(id); if (!x || x.k !== 'smash' || x.rep) return false; const r = S.rooms.find((q) => q.id === id), c = repairCost(r); if (S.cash < c) { toast(t('build.noCash')); return false; } S.cash -= c; x.rep = 1; x.end = nowAbs() + DAY_LEN; toast('🧰 ' + t('inc.repairing', { left: incLeft(x) })); save(); return true; }
function incExpress(id) { const x = incOf(id); if (!x) return false; if (x.techT != null) { incEnd(x, true); save(); return true; } /* already paid in an older version: finish it now */ const c = expressCost(x); if (S.cash < c) { toast(t('build.noCash')); return false; } S.cash -= c; incEnd(x, true); { const room = R.rooms[id]; if (room) floatAt({ x: room.cx, y: 1.6, z: room.cz }, '🧰✅'); } toast('🧰 ' + t('inc.fixedX', { room: rn((S.rooms.find((q) => q.id === id) || {}).type) })); save(); return true; } // paid express repair: fixed and reopened right away
// ---------------- mandatory events ----------------
const EVENTS = { power: { dur: 25, e: '⚡' }, wifi: { dur: 40, e: '📶' }, leak: { dur: 45, e: '💧' }, noise: { dur: 40, e: '🔨' }, heat: { dur: 50, e: '🥵' } };
const evSlow = (type) => (S.ev && S.ev.k === 'noise' && (type === 'nap' || type === 'therapy') ? 2 : S.ev && S.ev.k === 'wifi' && type === 'detox' ? 0.67 : 1);
function evPatience() { if (!S.ev) return 1; const k = S.ev.k; return k === 'wifi' ? 1.4 : k === 'noise' ? 1.2 : k === 'heat' ? 1 : k === 'power' ? (S.ev.gen ? 1.12 : 1.2) : 1; }
function startEvent() {
  const keys = Object.keys(EVENTS).filter((k) => k !== 'leak' || ((S.city || 'london') === 'london' && S.rooms.some((r) => !ROOMS[r.type].staffOnly)));
  const k = cityOf().power && RNG() < 0.5 ? 'power' : cityOf().hot && RNG() < 0.45 ? 'heat' : rnd(keys.filter((x) => (x !== 'power' || cityOf().power) && (x !== 'heat' || cityOf().hot))); // power cuts and heatwaves only where the city has them (that's where the generator and the AC are sold)
  let genRun = false;
  if (k === 'power' && S.gen) {
    if (S.genBroken) chat(t('from.hq'), t('gen.stillBroken'), '🔧', { act: { k: 'gen' } });
    else if (genFuel() <= 0) chat(t('from.hq'), t('gen.empty'), '⛽', { act: { k: 'gen' } });
    else if (RNG() < 0.18) { S.genBroken = true; chat(t('from.hq'), t('gen.broke'), '💥', { act: { k: 'gen' } }); }
    else genRun = true;
  }
  if (genRun) {
    S.genFuel = genFuel() - 1; incCnt('pcuts');
    // the biggest power users beyond the generator's capacity go dark
    const live = S.rooms.filter((r) => !ROOMS[r.type].staffOnly).sort((a, b) => (POWER[a.size] + (POWER_X[a.type] || 0)) - (POWER[b.size] + (POWER_X[b.type] || 0)));
    const off = live.slice(genCap()).map((r) => r.id);
    S.ev = { k: 'power', t: EVENTS.power.dur, gen: true, off }; say('evpower', t('ev.power'), 30);
    chat(t('from.hq'), t('gen.running', { n: Math.min(live.length, genCap()), off: off.length, f: S.genFuel, tank: GEN_TANK }), '🔋', S.genFuel <= 1 || off.length ? { act: { k: 'gen' } } : {});
    renderer.toneMappingExposure = 0.75; toast('🔋 ' + t('gen.toast', { off: off.length }), 2600); return;
  }
  if (k === 'heat' && S.ac) { chat(t('from.weather'), t('ev.acOk'), '❄️'); return; }
  if (k === 'wifi' && S.net) { chat(t('from.hq'), t('ev.netOk'), '📡'); return; }
  if (k === 'noise' && S.quiet) { chat(t('from.hq'), t('ev.quietOk'), '🔇'); return; }
  S.ev = { k, t: EVENTS[k].dur }; say('ev' + k, t('ev.' + k), 30);
  if (k === 'leak') {
    const r = rnd(S.rooms.filter((x) => !ROOMS[x.type].staffOnly)); const room = R.rooms[r.id]; room.closed = true; S.ev.room = r.id; S.ev.t = 999;
    const pd = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.02, 18), mat('#7FC7F0', { r: 0.1, op: 0.85 })); pd.position.set(room.cx + 0.6, 0.14, room.cz + 0.6); scene.add(pd);
    const drip = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), mat('#7FC7F0')); drip.rotation.x = Math.PI; drip.position.set(room.cx + 0.6, 2.4, room.cz + 0.6); scene.add(drip); pd.userData.drip = drip;
    const leak = { mesh: pd, heavy: true, leak: r.id }; R.litter.push(leak); S.ev.obj = leak; S.ev.fixT = 45;
    chat(t('from.hq'), t('ev.leak', { room: rn(r.type) }) + ' ' + t('ev.leakD'), '💧', { act: { k: 'leak' } });
  } else chat(t('from.hq'), t('ev.' + k) + ' ' + (k === 'heat' ? t('ev.heatD2', { o: Math.round(outsideT()) }) : t('ev.' + k + 'D')) + ({ power: 1, heat: 1 }[k] ? ' ' + t('ev.fix.' + k) : ''), EVENTS[k].e, k === 'heat' ? { act: { k: 'heat' } } : {});
  if (k === 'power') renderer.toneMappingExposure = 0.5;
  toast(EVENTS[k].e + ' ' + (k === 'leak' ? t('ev.leak', { room: rn(R.rooms[S.ev.room].type) }) : t('ev.' + k)), 2600);
}
function endEvent() { S.acTemp = false;
  const E = S.ev; if (!E) return;
  if (E.k === 'power') renderer.toneMappingExposure = BASE_EXPO;
  if (E.k === 'leak') { const room = R.rooms[E.room]; if (room) room.closed = false; if (E.obj && E.obj.mesh.userData.drip) scene.remove(E.obj.mesh.userData.drip); }
  S.ev = null;
}
function eventUpdate(dt) {
  const E = S.ev; if (!E) return;
  if (E.k === 'leak') {
    if (!R.litter.includes(E.obj)) { chat(t('from.hq'), t('ev.leakDone', { room: rn((R.rooms[E.room] || {}).type || 'budget') }), '🔧'); endEvent(); return; }
    if (E.obj.mesh.userData.drip) E.obj.mesh.userData.drip.position.y = 2.4 - ((performance.now() / 600) % 1) * 2.2;
    if (!R.staff.some((rs) => rs.data.role === 'maint')) { E.fixT -= dt; if (E.fixT <= 0) { S.cash -= 300; scene.remove(E.obj.mesh); R.litter.splice(R.litter.indexOf(E.obj), 1); chat(t('from.landlord'), t('ev.leakFix'), '🔧'); endEvent(); } }
    return;
  }
  E.t -= dt; if (E.t <= 0) endEvent();
}

// ---------------- HQ Wrapped & Adulting Awards ----------------
function awards() {
  const SS = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 }, a = [];
  if (S.vibes >= 80) a.push('vibes'); if ((SS.chased || 0) >= 3) a.push('rats'); if (hasRoom('toilet') && !SS.acc && S.served >= 20) a.push('loo'); if (S.earned >= 20000) a.push('money'); if (SS.vip >= 1) a.push('vip');
  if (!a.length) a.push('trying'); return a;
}
function showWrapped(auto) {
  const SS = S.st || { prob: {}, room: {}, staff: {}, acc: 0, rats: 0, vip: 0 };
  const top = (o) => Object.entries(o).sort((x, y) => y[1] - x[1])[0];
  const tp = top(SS.prob), tr = top(SS.room), ts = top(SS.staff), mvp = ts && S.staff.find((s) => s.id === +ts[0]);
  const aw = awards(); if (auto) addKudos(aw.length * 5);
  const line = (e, k, v) => `<div style="display:flex;justify-content:space-between;gap:10px;padding:7px 0;border-bottom:1px dashed rgba(255,255,255,.35)"><span>${e} ${t(k)}</span><b style="text-align:right">${v}</b></div>`;
  const html = `<div style="background:linear-gradient(160deg,#16963C,#1F74C4 70%,#7F68C9);color:#fff;border-radius:22px;padding:16px 16px 12px;text-align:left;margin:-6px -4px 0">
    <div style="font:700 13px Nunito;opacity:.85">${t('city.london')} · ${dayN(S.day)} · Boss ${MGR.name}</div><div style="font:700 28px Fredoka;line-height:1.1;margin:4px 0 8px">🎁 ${t('wr.title')}</div>
    ${line('🙂', 'wr.helped', S.served)}${line('🏆', 'wr.topProb', tp ? pn(tp[0]) + ' ×' + tp[1] : '—')}${line('🚪', 'wr.topRoom', tr ? rn(tr[0]) : '—')}${line('🌟', 'wr.mvp', mvp ? mvp.name : '—')}${line('💵', 'wr.earned', money(S.earned))}${line('🐀', 'wr.rats', SS.chased || 0)}
    <div style="font:700 17px Fredoka;margin:10px 0 4px">🏅 ${t('wr.awards')}</div>${aw.map((k) => `<div style="background:rgba(255,255,255,.16);border-radius:12px;padding:6px 10px;margin:4px 0;font-weight:800">🏅 ${t('aw.' + k)}</div>`).join('')}
    ${auto ? `<div style="font-weight:800;margin-top:6px">+${aw.length * 5} Kudos ✨</div>` : ''}</div>
    <div class="row2" style="margin-top:12px"><button class="btn y" id="wShare">📤 ${t('wr.share')}</button><button class="btn g" id="mOk">${t('rent.ok')}</button></div>`;
  modal(html); $('mOk').onclick = closeModal;
  $('wShare').onclick = async () => {
    const txt = t('wr.shareText', { n: S.served, aw: aw.map((k) => t('aw.' + k)).join(', '), m: money(S.earned) });
    try { if (navigator.share) { await navigator.share({ title: 'Life Crisis Tycoon', text: txt }); return; } } catch (e) {}
    try { await navigator.clipboard.writeText(txt); toast(t('wr.copied')); } catch (e) { toast(txt, 5000); }
  };
}

// ---------------- the "protection fee" crew (fictional) ----------------
// crew comes back about every 3 weeks of game days; a bit more often the further you progress
function crewGap() { return 14 + Math.floor(Math.random() * 4); }
// what refusing would cost in plain money: repairing the 2 best-earning rooms + one day of what they earn. The crew asks 1.3× that
// (+25 % each time you paid before, ×2 when they come back after an arrest), so paying is the safe but dearer choice
const repairCost = (r) => Math.round(roomCost(r.type, r.size) / 4 / 50) * 50;
const roomDayEarn = (id) => { const e = (S.rEarn || {})[id] || {}; let a = 0, n = 0; for (let d = S.day - 1; d >= Math.max(1, S.day - 3); d--) { a += e[d] || 0; n++; } return n ? a / n : 0; };
function crewFee() {
  const rs = S.rooms.filter((r) => !ROOMS[r.type].staffOnly).map((r) => repairCost(r) + roomDayEarn(r.id)).sort((a, b) => b - a).slice(0, 2);
  const base = 1.3 * rs.reduce((a, x) => a + x, 0) * (1 + 0.25 * (S.crewPaidN || 0)) * (S.crewMad ? 2 : 1);
  return Math.max(500, Math.round(base / 50) * 50);
}
function crewSpawn() {
  for (const a of R.crew || []) scene.remove(a.av); R.crew = [];
  for (let i = 0; i < 3; i++) { const av = visPerson(['v08', 'v15', 'v22'][i], { skin: rnd(SKIN), hair: '#1C120C', style: 'short', shirt: '#2A2A2E', pants: '#2A2A2E', cap: '#2A2A2E', glasses: true, tall: 1.05 + i * 0.05, wide: 1.1 }); av.position.set(2 + i * 0.8, 0.1, 8.2); av.rotation.y = Math.PI; scene.add(av); R.crew.push({ av, path: [], ph: 0 }); }
}
function crewLeave() { const g = R.crew || []; R.crew = []; for (const c of g) { c.path = findPath(c.av.position, { x: 2.5 + Math.random(), z: 11 }); c.out = true; } R.crewOut = (R.crewOut || []).concat(g); }
function crewVisit() {
  const fee = crewFee(); crewSpawn();
  modal(`<div style="font-size:46px">🕶️🕶️🕶️</div><h2>${t('crew.title')}</h2><p>${t(S.crewMad ? 'crew.p2' : 'crew.p', { m: money(fee) })}</p>
  <button class="btn g" id="cPay" style="width:100%;margin-top:8px">${t('crew.pay', { m: money(fee) })}</button>
  <div class="row2" style="margin-top:8px"><button class="btn y" id="cRef">${t('crew.refuse')}</button><button class="btn w" id="cRep">🚓 ${t('crew.report')}</button></div>`);
  const bye = () => { closeModal(); crewLeave(); save(); };
  $('cPay').onclick = () => { S.cash -= fee; S.crewPaidN = (S.crewPaidN || 0) + 1; S.crewMad = 0; chat(t('crew.name'), t('crew.paid'), '🕶️'); bye(); };
  $('cRef').onclick = () => { S.crewAngry = S.day + 1; chat(t('crew.name'), t('crew.refused'), '🕶️'); bye(); };
  // the police: they are still here, so they start smashing rooms until the police arrive (40–60 s, shown on screen; a room every 20 s, at most 3)
  $('cRep').onclick = () => { closeModal(); S.crewRaid = { t: 40 + Math.floor(Math.random() * 21), el: 0, n: 0, mad: !!S.crewMad }; chat(t('crew.name'), t('crew.raid'), '🚓'); toast('🚓 ' + t('crew.raid'), 3200); save(); };
}
function smashPool() { return S.rooms.filter((r) => !ROOMS[r.type].staffOnly && R.rooms[r.id] && !(incOf(r.id) && incOf(r.id).k === 'smash')); }
function smashRoom(r, quiet) {
  const x0 = incOf(r.id); if (x0) S.inc = S.inc.filter((y) => y !== x0); { const mm = INC_MESH.get(r.id); if (mm) { scene.remove(mm); INC_MESH.delete(r.id); } }
  const x = { k: 'smash', room: r.id, end: 1e12 }; (S.inc = S.inc || []).push(x); incVisual(x); R.rooms[r.id].closed = true;
  AU.sfx('err'); if (!quiet) { toast('🔨 ' + t('crew.smash', { room: rn(r.type) }), 2600); const rm = R.rooms[r.id]; floatAt({ x: rm.cx, y: 1.4, z: rm.cz }, '💥', true); }
}
function crewAfter(mad) { // a raid by an angry crew also scares the team and the neighbourhood
  if (!mad) return;
  const pool = S.staff.filter((st) => !(st.awayT > 0)).sort(() => Math.random() - 0.5).slice(0, 1 + (Math.random() < 0.5 ? 1 : 0));
  for (const st of pool) { st.awayT = DAY_LEN * 2; chat(st.name + ' · ' + roleN(st.role), t('crew.trauma'), '😰'); }
  S.rumorEnd = nowAbs() + DAY_LEN * 3; chat(t('from.hq'), t('crew.rumor'), '📉');
}
function crewNight() { // refused: they came back overnight
  const n = S.crewMad ? 3 : 2, pool = smashPool().sort(() => Math.random() - 0.5).slice(0, n);
  for (const r of pool) smashRoom(r, true);
  if (pool.length) { chat(t('crew.name'), t('crew.night', { n: pool.length, rooms: pool.map((r) => rn(r.type)).join(', ') }), '🔨', { act: { k: 'inc', room: pool[0].id } }); toast('🔨 ' + t('crew.night', { n: pool.length, rooms: pool.map((r) => rn(r.type)).join(', ') }), 4000); }
  crewAfter(S.crewMad);
}
function crewTick(dt) {
  for (const c of (R.crewOut || []).slice()) if (stepWalker(c, dt, 2.4)) { scene.remove(c.av); R.crewOut = R.crewOut.filter((y) => y !== c); }
  const X = S.crewRaid; if (!X) return;
  if (!R.crew || !R.crew.length) crewSpawn(); // after a reload
  X.el += dt;
  const iv = X.mad ? 12 : 20, first = X.mad ? 5 : 10, due = Math.min(3, X.el >= first ? 1 + Math.floor((X.el - first) / iv) : 0);
  // the crew walks to the next room to smash
  if (X.tgt == null) { const r = rnd(smashPool()); if (r) { X.tgt = r.id; const d = doorPt(r, -0.8); R.crew.forEach((c, i) => { c.path = findPath(c.av.position, { x: d.x + (i - 1) * 0.6, z: d.z }); }); } }
  for (const c of R.crew) { if (c.path.length) { stepWalker(c, dt, 3.2); c.idle = 0; } else if (!c.idle) { c.idle = 1; poseStand(c.av.userData.p); } }
  if (due > X.n && X.tgt != null) { const r = S.rooms.find((q) => q.id === X.tgt); X.n++; X.tgt = null; if (r && R.rooms[r.id]) smashRoom(r); }
  if (X.el >= X.t) { // the police arrive and take them away
    S.crewRaid = null; S.crewMad = 1; S.crewNext = S.day + 8; crewLeave();
    chat(t('crew.name'), t('crew.arrest'), '🚓'); toast('🚓 ' + t('crew.arrest'), 3500); crewAfter(X.mad); save();
  }
}

// ---------------- marketing ----------------
const ADS = { flyers: { cost: 400, dur: 60, mul: 1.3, e: '📰' }, social: { cost: 1200, dur: 120, mul: 1.6, e: '📱' }, influencer: { cost: 2500, dur: 60, mul: 2.0, e: '🤳' }, promo: { cost: 800, dur: 120, mul: 1.2, e: '🎯' } };
const adMul = () => (S.ad ? 1 + (ADS[S.ad.k].mul - 1) * (S.ad.fat ? 0.5 : 1) : 1);
function adUpdate(dt) {
  if (S.adCd > 0) S.adCd -= dt;
  const A = S.ad; if (!A) return; A.t -= dt;
  if (A.t <= 0) {
    if (A.k === 'influencer') { const served = S.served - A.s0, left = S.left - A.l0; const ok = served >= 3 && left <= served * 0.4; vb('ads', 0 + (ok ? 5 : -8)); chat('🤳 @' + A.handle, t(ok ? 'mk.viral' : 'mk.roast'), ok ? '🔥' : '💀'); toast(t(ok ? 'mk.viral' : 'mk.roast'), 3500); }
    S.adLast = A.k; S.ad = null; S.adCd = 45;
  }
}
function openMarketing() {
  const wages = Math.round(S.staff.reduce((a, s) => a + s.wage, 0) * WAGE_K), toRent = RENT_EVERY - ((S.day - 1) % RENT_EVERY);
  let h = `<h2>📣 ${t('mk.title')}</h2><p class="sub">${t('mk.sub')}</p>`;
  if (S.mode === 'career') h += `<div class="receipt"><div><span>${t('mk.earned')}</span><span>${money(S.earned)}</span></div><div><span>${t('mk.bills', { d: S.day + toRent })}</span><span>-${money(RENT + wages + elecPerDay() * ELEC_K * RENT_EVERY)}</span></div><div style="font-size:12px;color:var(--muted)"><span>⚡ ${t('bill.elec')}: ${money(elecPerDay() * ELEC_K)}/${t('day.unit')}</span><span>✨ ${kudos()} ${t('kd.name')}</span></div></div>`;
  if (S.mode === 'career') {
    const P = [[0.8, 'pr.low'], [1, 'pr.norm'], [1.2, 'pr.high'], [1.4, 'pr.max']], cur = S.price || 1;
    h += `<div class="lbl" style="margin:6px 0">💲 ${t('pr.title')}</div><div class="chips" style="margin-bottom:6px">${P.map(([v, k]) => `<button class="${v === cur ? 'g' : 'w'}" data-price="${v}" style="border-radius:999px;padding:6px 12px;font-weight:800;font-size:13px">${t(k)} ${v === 1 ? '' : (v > 1 ? '+' : '−') + Math.round(Math.abs(v - 1) * 100) + '%'}</button>`).join('')}</div><p class="sub">${t('pr.d')}</p>`;
    h += `<div class="lbl" style="margin:6px 0">🏦 ${t('loan.title')}</div>` + (S.loan ? `<div class="msg">${t('loan.left', { m: money(S.loan.left), p: money(S.loan.per) })}</div>` : `<div class="opt w"><div class="oi" style="background:#E3ECF5">🏦</div><div class="ot"><b>${t('loan.offer', { m: money(10000) })}</b><div>${t('loan.d', { m: money(11000), p: money(2750) })}</div></div><button class="btn y" id="takeLoan">${t('loan.btn')}</button></div>`);
    h += `<div class="lbl" style="margin:10px 0 6px">📣 ${t('mk.camp')}</div>`;
  }
  const usesLeft = 2 - (S.adUses || 0), blocked = !!S.ad || S.adCd > 0 || usesLeft <= 0;
  if (!S.ad && S.adCd > 0) h += `<div class="msg">⏳ ${t('mk.cd', { t: Math.ceil(S.adCd) + 's' })}</div>`;
  if (usesLeft <= 0) h += `<div class="msg">🚫 ${t('mk.limit', { d: S.day + toRent })}</div>`;
  else h += `<p class="sub">${t('mk.uses', { n: usesLeft })}${S.adLast ? ' · ' + t('mk.fatigue', { name: t('mk.' + S.adLast) }) : ''}</p>`;
  if (S.ad) h += `<div class="msg" style="border-color:var(--green)">${ADS[S.ad.k].e} ${t('mk.active', { name: t('mk.' + S.ad.k) + (S.ad.room ? ' · ' + rn(S.ad.room) : ''), t: Math.ceil(S.ad.t) + 's' })}</div>`;
  for (const [k, A] of Object.entries(ADS)) {
    if (k === 'promo') continue; // removed: visitors come with their own problems, promoting a room made no sense (kept in ADS so a promo already running in a save still ends cleanly)
    if (k === 'promo') {
      const types = [...new Set(S.rooms.map((r) => r.type))].filter((ty) => Object.values(PROBLEMS).some((p) => p.room === ty));
      h += `<div class="opt w"><div class="oi" style="background:#FFF3CF">${A.e}</div><div class="ot"><b>${t('mk.promo')} · ${money(A.cost)}</b><div>${t('mk.promoD')}</div><div class="chips" style="margin-top:6px">${types.map((ty) => `<button class="w" data-promo="${ty}" style="border-radius:999px;padding:4px 10px;font-weight:800;font-size:12.5px" ${blocked || S.cash < A.cost ? 'disabled' : ''}>${ROOMS[ty].e} ${rn(ty)}</button>`).join('')}</div></div></div>`;
      continue;
    }
    h += `<div class="opt w"><div class="oi" style="background:#FFF3CF">${A.e}</div><div class="ot"><b>${t('mk.' + k)} · ${money(A.cost)}</b><div>${t('mk.' + k + 'D')}</div></div><button class="btn g" data-ad="${k}" ${blocked || S.cash < A.cost ? 'disabled' : ''}>${t('mk.btn')}</button></div>`;
  }
  openSheet(h);
  const go = (k, room) => { const A = ADS[k]; S.cash -= A.cost; S.adUses = (S.adUses || 0) + 1; S.ad = { k, fat: S.adLast === k, t: A.dur, room, s0: S.served, l0: S.left, handle: crnd(['glowwithjade', 'kaivibes', 'adultingfails', 'lunchbreaklena', 'mainchar.mo']) }; closeSheet(); toast(t('mk.start', { name: t('mk.' + k) }), 2500); save(); };
  $('sheet').querySelectorAll('[data-ad]').forEach((b) => b.onclick = () => go(b.dataset.ad));
  $('sheet').querySelectorAll('[data-price]').forEach((b) => b.onclick = () => { S.price = +b.dataset.price; save(); openMarketing(); });
  const tl = $('takeLoan'); if (tl) tl.onclick = () => { S.cash += 10000; S.loan = { left: 11000, per: 2750 }; save(); toast(t('loan.got', { m: money(10000) })); openMarketing(); };
  $('sheet').querySelectorAll('[data-promo]').forEach((b) => b.onclick = () => go('promo', b.dataset.promo));
}
$('hCash').parentElement.style.cursor = 'pointer'; $('hCash').parentElement.onclick = openMarketing;
// upcoming bills: tap the day / rent card to see exactly what will be taken, and when
function openBills() {
  if (!inGame || S.mode !== 'career') return;
  const toRent = RENT_EVERY - ((S.day - 1) % RENT_EVERY), elec = elecPerDay() * ELEC_K * RENT_EVERY, loanPay = S.loan ? Math.min(S.loan.left, S.loan.per) : 0;
  const staff = S.staff.map((st) => [st.name + ' · ' + roleN(st.role), Math.round(st.wage * WAGE_K)]), wages = staff.reduce((a, x) => a + x[1], 0);
  const total = RENT + wages + elec + loanPay, after = S.cash - total;
  const row = (a, b, sub) => `<div${sub ? ' style="font-size:12px;color:var(--muted);padding-left:10px"' : ''}><span>${a}</span><span>-${money(b)}</span></div>`;
  openSheet(`<h2>🧾 ${t('bills.title')}</h2><p class="sub">${t('bills.when', { d: S.day + toRent, n: toRent })}</p>
    <div class="receipt">${row('🏠 ' + t('rent.rent'), RENT)}${annexRent() ? row(t('rent.annex'), annexRent(), true) : ''}${row('👥 ' + t('rent.wages'), wages)}${staff.map(([n, w]) => row(n, w, true)).join('')}${row('⚡ ' + t('bill.elec') + ' (' + money(elecPerDay() * ELEC_K) + '/' + t('day.unit') + ' × ' + RENT_EVERY + ')', elec)}${loanPay ? row('🏦 ' + t('loan.pay'), loanPay) : ''}
    <div style="border-top:2px dashed var(--sh);margin-top:4px;padding-top:6px;font-weight:800"><span>${t('bills.total')}</span><span>-${money(total)}</span></div>
    <div style="font-weight:800;color:${after < 0 ? '#C0362C' : '#1E8A3A'}"><span>${t('bills.after')}</span><span>${money(after)}</span></div></div>
    ${after < 0 ? `<div class="msg">⚠️ ${t('bills.short', { m: money(-after) })}</div>` : ''}`);
}
$('hDay').parentElement.style.cursor = 'pointer'; $('hDay').parentElement.onclick = openBills;
$('hVibes').parentElement.style.cursor = 'pointer'; $('hVibes').parentElement.onclick = (e) => { if (!S || S.mode !== 'career') return; if (e.target && e.target.id === 'hTemp') openTemp(); else openVibes(); };

// ---------------- objectives tracker ----------------
function metricRow([m, v, days], done, gi) {
  if (days && S.mode === 'career' && gi != null) { const ok = done || heldOk(S, gi, m), need = vhNeed(gi, days), held = ok ? need : ((S.hold || {})[holdKey(gi, m)] || 0), cur = metric(S, m), above = cur >= v;
    return `<div class="gm ${ok ? 'ok' : ''}">${m === 'vibes' ? '★' : '✅'} ${t('obj.' + m)} <b>${Math.floor(cur)}% / ${v}%</b> ${ok ? '✅' : ''}<div style="font-size:12px;color:${ok || above ? 'inherit' : 'var(--red)'}">⏱️ ${t('obj.hold', { a: (held / 90).toFixed(1).replace('.0', ''), b: days, v })}</div><div class="bar"><i style="width:${(held / need) * 100}%;background:${ok ? '#7ACB4E' : '#FFB800'}"></i></div></div>`; }
  const cur = metric(S, m), ok = done || cur >= v, pct = clamp(cur / v, 0, 1) * 100;
  const fmt = (x) => (m === 'cash' || m === 'value' ? money(x) : m === 'vibes' ? Math.floor(x) + '%' : Math.floor(x));
  const icon = { helped: '🙂', vibes: '★', cash: '💵', groups: '🥳', families: '👨‍👩‍👧', bestday: '📈', nightbest: '🌙', emwin: '🚨', wave: '🚦', wedding: '💍', tea: '🍵', quake: '🌋', lucha: '🤼', yoga: '🧘', roda: '🥁', rain: '🌧️', value: '🏢', succ: '✅' }[m] || '🎯';
  return `<div class="gm ${ok ? 'ok' : ''}">${icon} ${t('obj.' + m)} <b>${fmt(Math.max(0, cur))} / ${fmt(v)}</b> ${ok ? '✅' : ''}<div class="bar"><i style="width:${ok ? 100 : pct}%;background:${ok ? '#7ACB4E' : '#FFB800'}"></i></div></div>`;
}
function nextSteps() {
  const out = [], add = (icon, txt, act) => { if (out.length < 3 && !out.some((o) => o.txt === txt)) out.push({ icon, txt, act }); };
  const hireAct = (role) => () => openHire(role);
  if (!R.staff.some((rs) => rs.data.role === 'host')) add('🛎️', t('next.host'), hireAct('host'));
  if (!hasRoom('toilet') && (S.served >= 3 || R.visitors.some((v) => v.need > 0.8))) add('🚻', t('next.toilet'), () => openSize('toilet'));
  const need = {};
  for (const v of R.visitors) if (v.known && ['wait', 'toWait'].includes(v.state) && !hasRoom(PROBLEMS[v.prob].room)) need[PROBLEMS[v.prob].room] = (need[PROBLEMS[v.prob].room] || 0) + 1;
  Object.entries(need).sort((a, b) => b[1] - a[1]).forEach(([room, n]) => add(ROOMS[room].e, t('next.build', { room: rn(room), n }), () => openSize(room)));
  for (const room of Object.values(R.rooms)) if (ROOMS[room.type].role && !room.staff.some(Boolean) && !R.staff.some((rs) => rs.data.role === ROOMS[room.type].role && rs.at === 'idle')) add('🧑‍💼', t('next.staff', { role: roleN(ROOMS[room.type].role), room: rn(room.type) }), hireAct(ROOMS[room.type].role));
  if (unlocked('maint') && (R.litter.length >= 4 || R.rats.length) && !R.staff.some((rs) => rs.data.role === 'maint')) add('🧹', t('next.maint'), hireAct('maint'));
  const G = GOALS[S.stars];
  if (G) {
    for (const [m, v] of G.parts) {
      if (G.parts.find((q) => q[0] === m)[2] ? heldOk(S, S.stars, m) : metric(S, m) >= v) continue;
      if (m === 'vibes') { if (!hasRoom('cafe')) add('🍵', t('next.cafe'), () => openSize('cafe')); if (S.pepCd <= 0) add('📣', t('next.pep'), pepTalk); }
      if (m === 'helped') { add('🏗️', t('next.more'), openBuild); { const li = plotOf().lots.findIndex((_, i) => lotSt(i) === 'locked' && lotOpen(i) && S.cash >= lotCost(i)); if (li >= 0) add('🔓', t('next.expand'), () => tapLot(li)); } }
      if (m === 'cash') add('💵', t('next.cash'), null);
    }
  }
  if (S.day >= 3 && unlocked('lab') && !hasRoom('lab')) add('🔬', t('next.lab'), () => openSize('lab'));
  if (S.cash < 1500 && !S.loan && S.mode === 'career') add('🏦', t('next.money'), openMarketing);
  if (!S.ad && !(S.adCd > 0) && (S.adUses || 0) < 2 && S.cash >= 400 && R.visitors.length < 4 && S.rooms.length >= 2) add('📣', t('next.ads'), openMarketing);
  if (speedMul < 2 && out.length < 2) add('⏩', t('next.speed'), () => setSpeed(2));
  return out;
}
let objKey = '', objSteps = [], objOpenUntil = 0, objLastStep = '';
function updateObj() {
  const el = $('obj'), now = performance.now();
  const G = GOALS[S.stars];
  // progress on the Goals nav button: average of the current star's conditions
  const prog = !G ? 1 : G.parts.reduce((a, [m, v, days]) => a + (days && S.mode === 'career' ? (heldOk(S, S.stars, m) ? 1 : clamp(((S.hold || {})[holdKey(S.stars, m)] || 0) / vhNeed(S.stars, days), 0, 1)) : clamp(metric(S, m) / v, 0, 1)), 0) / G.parts.length;
  $('gpBar').style.width = (prog * 100) + '%'; $('gpBar').style.background = prog >= 1 ? '#7ACB4E' : '#FFB800';
  objSteps = S.mode === 'career' ? nextSteps() : []; const s0 = objSteps[0];
  $('goalDot').style.display = s0 && s0.act ? 'block' : 'none';
  // the next step pops up briefly only when the priority changes, then gets out of the way
  if (s0 && s0.txt !== objLastStep) { objLastStep = s0.txt; objOpenUntil = now + 5000; }
  if (S.mode !== 'career' || (S.tut >= 0 && S.tut < 7) || !s0 || now > objOpenUntil) { el.style.display = 'none'; objKey = ''; return; }
  el.style.display = 'block';
  const h = `<button class="nx y" id="objNext">${s0.icon} <span style="flex:1">${s0.txt}</span> ›</button>`;
  if (h !== objKey) { objKey = h; el.innerHTML = h; $('objNext').onclick = (e) => { e.stopPropagation(); objOpenUntil = 0; const a = objSteps[0] && objSteps[0].act; if (a) a(); else openGoals(); }; }
}


// ---------------- moving the reception desk ----------------
let moving = null; const gPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.1), gHit = new THREE.Vector3();
const DESK_COST = 1500;
function deskValid2(x, z, r) { // an extra desk: on the floor, clear of rooms and other desks, with room for its line
  const f = { x: Math.sin(r), z: Math.cos(r) }, pts = [{ x, z }, { x: x - f.x * 0.78, z: z - f.z * 0.78 }]; for (let k = 0; k < 4; k++) pts.push({ x: x + f.x * (0.95 + k * 0.72), z: z + f.z * (0.95 + k * 0.72) });
  for (const p of pts) { if (!inFloor(p.x, p.z)) return false; if (S.rooms.some((rm) => { const q = roomRect(rm); return p.x > q.x0 - 0.3 && p.x < q.x1 + 0.3 && p.z > q.z0 - 0.3 && p.z < q.z1 + 0.3; })) return false; }
  return desks().every((D, i) => (moving && moving.di === i) || Math.hypot(D.x - x, D.z - z) > 2.6);
}
// Placement rule for the lobby desk: its whole footprint (counter length and depth, the host's chair behind it, the first places
// of its line in front) must sit on the lobby floor clear of the walls, the sofa, the fixed plants and any decor.
const LOBBY_IN = [LOB + 0.2, 6.5 - 0.2], SOFA_BOX = [0.55, 1.75, 2.75, 5.65], LOBBY_PLANTS = [[6.1, 1.1], [1.0, 6.0], [2.6, 1.0]];
function deskPts(x, z, r, half) {
  const a = { x: Math.cos(r), z: -Math.sin(r) }, f = { x: Math.sin(r), z: Math.cos(r) }, P = (u, w) => ({ x: x + a.x * u + f.x * w, z: z + a.z * u + f.z * w });
  return { body: [P(-half, -0.5), P(half, -0.5), P(-half, 0.5), P(half, 0.5), P(0, -1.15), P(0.6, -1.0), P(-0.6, -1.0)], line: [P(0, 0.95), P(0, 1.67)] };
}
function deskValid(x, z, r = moving ? moving.r : S.desk.r) {
  const { body, line } = deskPts(x, z, r, S.desk.segs ? 2.1 : 1.3), inL = (p, m = 0) => p.x >= LOBBY_IN[0] + m && p.x <= LOBBY_IN[1] - m && p.z >= LOBBY_IN[0] + m && p.z <= LOBBY_IN[1] - m;
  const hitsSofa = (p) => p.x > SOFA_BOX[0] && p.x < SOFA_BOX[1] && p.z > SOFA_BOX[2] && p.z < SOFA_BOX[3];
  const nearThing = (p) => LOBBY_PLANTS.some(([px, pz]) => Math.hypot(p.x - px, p.z - pz) < 0.55) || (S.decor || []).some((d) => Math.hypot(p.x - d.x, p.z - d.z) < 0.6);
  return body.every((p) => inL(p) && !hitsSofa(p) && !nearThing(p)) && line.every((p) => p.x >= LOB && p.x <= 7.2 && p.z >= LOB && p.z <= 7.4 && !hitsSofa(p));
}
function fixDesk() { // a desk that breaks the rule (older saves) moves to the nearest spot that keeps it
  const D = S.desk; if (deskValid(D.x, D.z, D.r)) return;
  let best = null, bd = 1e9;
  for (let x = 1; x <= 6; x += 0.25) for (let z = 1; z <= 6; z += 0.25) for (let k = 0; k < 8; k++) { const r = k * Math.PI / 4; if (!deskValid(x, z, r)) continue; const d = Math.hypot(x - D.x, z - D.z) + (Math.abs(angW(r - D.r)) > 0.01 ? 0.6 : 0); if (d < bd) { bd = d; best = { x, z, r }; } }
  if (best) Object.assign(S.desk, best);
}
function openDesk2(di) {
  const h = deskHost(di), q = DQ(di);
  openSheet(`<h2>🛎️ ${t('desk2.title')} #${di + 1}</h2><p class="sub">${h ? h.data.name : t('desk.need')} · 👥 ${q.length}</p>
    <div class="opt w"><div class="oi" style="background:#FFE1DC">🗑️</div><div class="ot"><b>${t('desk2.remove')}</b><div>+${money(DESK_COST / 2)}</div></div><button class="btn y" id="d2Rm">${t('desk2.removeBtn')}</button></div>` + deskUpRow(di)); bindDeskUp(di, () => openDesk2(di));
  $('d2Rm').onclick = () => { closeSheet(); removeDesk2(di); };
}
function removeDesk2(di) {
  S.desks2.splice(di - deskBase(), 1); S.cash += DESK_COST / 2;
  const moved = []; for (let k = di; k < R.deskQs.length; k++) { moved.push(...R.deskQs[k]); R.deskQs[k] = []; } R.deskQs.length = Math.max(1, di);
  for (const rs of R.staff) if (rs.at === 'desk' && (rs.desk || 0) >= di) { rs.at = null; rs.desk = 0; }
  placeDesk(); assignStaff(); for (const v of moved) if (R.visitors.includes(v) && ['queue', 'toQueue', 'checkin'].includes(v.state)) joinQueue(v); save();
}
function startMove(extra) { resumeForBuild();
  if (!inGame || moving || S.mode !== 'career' && S.mode !== 'quick' && S.mode !== 'daily') return;
  closeSheet(); selectVisitor(null);
  if (extra) { const m = deskMesh(), ring = m.children.find((c) => c.geometry && c.geometry.type === 'RingGeometry'); if (ring) { ring.visible = true; ring.material = ring.material.clone(); }
    moving = { x: view.tx, z: view.tz, r: 0, drag: false, extra: true, mesh: m, ring };
    // start somewhere valid near the view centre
    let best = null; for (let rr = 0; rr < 12 && !best; rr += 0.5) for (let a = 0; a < 6.28 && !best; a += 0.5) for (const r0 of [0, Math.PI / 2, Math.PI, -Math.PI / 2]) { const x = Math.round((view.tx + Math.cos(a) * rr) * 4) / 4, z = Math.round((view.tz + Math.sin(a) * rr) * 4) / 4; if (deskValid2(x, z, r0)) { best = { x, z, r: r0 }; break; } }
    if (best) Object.assign(moving, best);
  } else { moving = { x: S.desk.x, z: S.desk.z, r: S.desk.r, orig: { ...S.desk }, drag: false }; world.deskRing.visible = true; } $('movebar').classList.add('on'); $('nav').style.visibility = 'hidden'; $('pep').style.visibility = 'hidden';
  $('moveHint').textContent = '🛎️ ' + t(extra ? 'desk2.hint' : 'move.hint'); $('mvRot').textContent = t('move.rotate'); $('mvOk').textContent = t('move.ok'); $('mvCancel').textContent = t('move.cancel');
  $('mvOk').onclick = () => endMove(true); $('mvCancel').onclick = () => endMove(false); $('mvRot').onclick = () => { moving.r = (moving.r + Math.PI / 4) % (Math.PI * 2); moveShow(); };
  moveShow();
}
function moveShow() { const m = moving.mesh || world.desk, ring = moving.mesh ? moving.ring : world.deskRing; m.position.set(moving.x, 0.12, moving.z); m.rotation.y = moving.r; const ok = moving.extra ? deskValid2(moving.x, moving.z, moving.r) : deskValid(moving.x, moving.z, moving.r); if (ring) ring.material.color.set(ok ? '#7ACB4E' : '#E5484D'); $('mvOk').disabled = !ok; }
function moveDrag(e) {
  ndc.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight) * 2 + 1); ray.setFromCamera(ndc, cam);
  if (!ray.ray.intersectPlane(gPlane, gHit)) return;
  if (moving.extra) { const b = plotBox(); moving.x = clamp(Math.round(gHit.x * 4) / 4, b[0], b[1]); moving.z = clamp(Math.round(gHit.z * 4) / 4, b[2], b[3]); } else { moving.x = clamp(Math.round(gHit.x * 4) / 4, 0.8, 6.2); moving.z = clamp(Math.round(gHit.z * 4) / 4, 0.8, 6.4); } moveShow();
}
function endMove(ok) {
  if (!moving) return;
  if (moving.extra) { const mv = moving; scene.remove(mv.mesh); moving = null; $('movebar').classList.remove('on'); $('nav').style.visibility = $('pep').style.visibility = '';
    if (ok && deskValid2(mv.x, mv.z, mv.r) && S.cash >= DESK_COST) { S.cash -= DESK_COST; (S.desks2 = S.desks2 || []).push({ x: mv.x, z: mv.z, r: mv.r }); placeDesk(); assignStaff(); AU.sfx('build'); toast('🛎️ ' + t(R.staff.some((rs) => rs.data.role === 'host' && (!rs.at || rs.at === 'idle')) ? 'desk2.done' : 'desk2.hire'), 3000); save(); }
    return; }
  if (ok && deskValid(moving.x, moving.z, moving.r)) { S.desk = { ...S.desk, x: moving.x, z: moving.z, r: moving.r }; }
  moving = null; world.deskRing.visible = false; $('movebar').classList.remove('on'); $('nav').style.visibility = $('pep').style.visibility = '';
  placeDesk();
  if (ok) {
    for (const v of R.visitors) if (v.state === 'checkin') { v.state = 'queue'; v.prog = 0; }
    for (const s of WAIT_SPOTS) if (s.blocked && s.busy) { const v = s.busy; s.busy = null; const n = WAIT_SPOTS.find((w) => !w.busy && !w.blocked); if (n) { n.busy = v; v.spot = n; setPath(v, [{ x: n.x, z: n.z }]); v.state = 'toWait'; } }
    const h = deskHost(0); if (h) goStaff(h, deskSpot(0));
    toast(t('move.done'), 2000); save();
  }
}
$('mvOk').onclick = () => endMove(true);
$('mvCancel').onclick = () => endMove(false);
$('mvRot').onclick = () => { moving.r = (moving.r + Math.PI / 4) % (Math.PI * 2); moveShow(); };

// ---------------- flow ----------------
function resetRuntime() {
  if (R.mgr) { scene.remove(R.mgr.av); R.mgr = null; } hideTut();
  for (const c of (R.crew || []).concat(R.crewOut || [])) scene.remove(c.av || c); R.crew = []; R.crewOut = [];
  for (const v of R.visitors) { scene.remove(v.av); scene.remove(v.hud); } for (const rs of R.staff) scene.remove(rs.av);
  for (const sp of messIcons.values()) scene.remove(sp); messIcons.clear(); for (const rs of R.staff) if (rs.broom) { scene.remove(rs.broom); rs.broom = null; }
  for (const l of R.litter) scene.remove(l.mesh); for (const r of R.rats) scene.remove(r.mesh); if (R.inspector) scene.remove(R.inspector.av);
  R.visitors.length = 0; R.staff.length = 0; R.deskQ.length = 0; R.deskQs = [R.deskQ]; R.litter.length = 0; R.rats.length = 0; R.later.length = 0; R.inspector = null; WAIT_SPOTS.forEach((s) => s.busy = null);
  for (const k of Object.keys(world.roomGroups)) { const g = world.roomGroups[k]; if (g && g.parent) g.parent.remove(g); delete world.roomGroups[k]; }
  for (const k of Object.keys(R.rooms)) delete R.rooms[k];
  clearLabels(); selectVisitor(null); spawnT = 3;
}
function startGame() {
  S.tips = S.tips || {}; if (S.tut == null) S.tut = -1; S.pepT = S.pepT || 0; S.pepCd = S.pepCd || 0; S.desk = S.desk || { x: 5.25, z: 5.25, r: Math.PI / 4 };
  // saves from before the reception redesign: a desk still at the old default (never moved by the player) goes to the new spot; nothing else in the save changes
  { const D = S.desk, nd = { x: 4.6, z: 2.8, r: 0 }; if (!S.deskV && !D.segs && D.x === 5.25 && D.z === 5.25 && Math.abs(D.r - Math.PI / 4) < 1e-6 && !(S.decor || []).some((d) => Math.hypot(d.x - nd.x, d.z - nd.z) < 1.6)) S.desk = nd; S.deskV = 2; fixDesk(); }
  if (!Array.isArray(S.rooms)) {
    const P = { A: [-3.5, -3.5, Math.PI / 2], B: [3.5, -3.5, 0], C: [-3.5, 3.5, Math.PI / 2], E: [9.75, -3.5, 0], F: [9.75, 3.5, Math.PI] }, old = S.rooms; S.rooms = [];
    for (const k in old) if (old[k] && P[k]) S.rooms.push({ id: S.nextId++, type: old[k], size: 'm', x: P[k][0], z: P[k][1], a: P[k][2] });
  }
  S.city = S.city || 'london'; preloadVisitors(S.city); TV.city = t('city.' + S.city); TV.transit = t('tr.' + S.city); const C = CITIES[S.city]; setRent(); GOALS = mkGoals(S.mode === 'career' ? C.goals : CITIES.london.goals); buildCityDecor(S.city);
  resetRuntime(); buildAnnexLot(); rebuildGrid();
  if (!S.mod2) { S.mod2 = 1; for (const r of S.rooms) { if (Math.abs(((r.x - 0.5) % 1)) < 1e-6 && Math.abs(((r.z - 0.5) % 1)) < 1e-6) continue; // old saves: move rooms onto the 2 m lattice
    let done = false; for (const dx of [0.5, -0.5, 0]) { for (const dz of [0.5, -0.5, 0]) { const tr = { ...r, x: snapC(r.x + dx), z: snapC(r.z + dz), edit: r }; if (placeValid(tr)) { r.x = tr.x; r.z = tr.z; done = true; break; } } if (done) break; } } }
  { const bad = S.rooms.filter((r) => { const q = roomRect(r); for (let x = q.x0 + 0.25; x < q.x1; x += 0.5) for (let z = q.z0 + 0.25; z < q.z1; z += 0.5) if (!buildable(x, z)) return true; return false; }); if (bad.length) { for (const r of bad) S.cash += roomCost(r.type, r.size); S.rooms = S.rooms.filter((r) => !bad.includes(r)); rebuildGrid(); setTimeout(() => toast(t('plot.refund', { n: bad.length })), 800); } }
  knowInit();
  { const big = S.rooms.filter((r) => r.size === 'l'); if (big.length) { let m = 0; for (const r of big) { m += Math.max(0, roomCost(r.type, 'l') - roomCost(r.type, 'm')); r.size = 'm'; } S.cash += m; // large rooms are out of the game: each becomes a regular room in the same place, the price difference refunded
    setTimeout(() => toast('📐 ' + t('sz.lGone', { n: big.length, m: money(m) }), 4500), 1800); } }
  { const nn = (S.decor || []).filter((d) => d.k === 'neon'); if (nn.length) { S.decor = S.decor.filter((d) => d.k !== 'neon'); S.cash += nn.length * Math.round(DECOR.neon.cost / 2); } } // the 'just breathe' neon is gone from the game: half its price back
  { const n = (S.decor || []).filter((d) => d.k === 'massage').length; if (n) { S.decor = S.decor.filter((d) => d.k !== 'massage'); const pr = profile(); pr.kudos = (pr.kudos || 0) + 15 * n; try { localStorage.setItem('ahq_profile', JSON.stringify(pr)); } catch (e) {} // massage chairs are out of the game: their kudos come back
    setTimeout(() => toast('💆 ' + t('dc.massageGone', { n: 15 * n }), 4500), 2600); } }
  for (const r of S.rooms) buildRoom(r);
  for (const m of INC_MESH.values()) scene.remove(m); INC_MESH.clear();
  { const n = (S.decor || []).filter((d) => d.k === 'sofa').length; if (n) { S.decor = S.decor.filter((d) => d.k !== 'sofa'); S.cash += 500 * n; setTimeout(() => toast('🛋️ ' + t('dc.sofaGone', { m: money(500 * n) }), 4000), 1500); } } // sofas are out of the game for now: refunded
  for (const k in world.decor) { scene.remove(world.decor[k]); delete world.decor[k]; } for (const d of S.decor || []) buildDecor(d);
  if (S.ev) { S.ev = null; } renderer.toneMappingExposure = BASE_EXPO;
  // the café needs a host now: a save that already had a café gets one (once), so nothing stops working; a short-lived 'barista' role becomes a host
  for (const x of S.staff) if (x.role === 'barista') x.role = 'host';
  if (!S.baristaV) { S.baristaV = 1; if (S.rooms.some((r) => r.type === 'cafe')) { const c = makeCandidate('host'); c.id = S.nextId++; S.staff.push(c); setTimeout(() => chat(c.name + ' · ' + roleN('host'), crnd(tList('hire.hello')), '🍵', { fun: true }), 1500); } }
  for (const st of S.staff) spawnStaffAvatar(st);
  spawnManager();
  assignStaff(); restoreVisitors(); refreshCandidates(); updateBadge();
  setSpeed(1); placeDesk(); AU.startMusic(S.city);
  show('game'); view.tx = -0.6; view.tz = -1.6; view.half = 15.5; view.yaw = Math.PI / 4; view.pitch = 0.72; view.yawT = view.pitchT = null; placeCam();
  if (S.chat.length) { $('bnFrom').textContent = S.chat[0].from.toUpperCase(); $('bnText').innerHTML = S.chat[0].text; }
}
function startNew(city) {
  RNG = Math.random; S = newState(); S.city = city || 'london'; S.cash = CITIES[S.city].cash;
  const host = makeCandidate('host'); host.skill = 3; host.name = 'Amara Okafor'; host.traits = ['Calm Voice', 'Plant Parent']; host.wage = 750; host.id = S.nextId++;
  host.look = { skin: SKIN[3], hair: '#1C120C', style: 'curly', tall: 1, wide: 1, glasses: false, nose: false };
  S.staff.push(host);
  startGame();
  chat(t('from.landlord'), t(CITIES[S.city].start, { r: money(RENT) }), '🏠');
  let tutSeen = false; try { tutSeen = localStorage.getItem('ahq_tut_done') === '1'; } catch (e) {}
  if (tutSeen) chat('Amara · ' + roleN('host'), t('start.amara'), '👋', { fun: true });
  S.unread = 1; updateBadge(); save();
  let tutDone = false; try { tutDone = localStorage.getItem('ahq_tut_done') === '1'; } catch (e) {}
  modal(`<img src="${amaraImg()}" style="width:84px;height:84px;border-radius:50%;border:3px solid #fff;box-shadow:0 3px 0 var(--sh)"><h2>${t('tut.askT')}</h2><p>${t('tut.askP', { name: MGR.name, g: MGR.pron })}</p><div class="row2" style="margin-top:12px"><button class="btn y" id="tNo">${t('tut.askNo')}</button><button class="btn g" id="tYes">${t('tut.askYes')}</button></div>`);
  $('tYes').onclick = () => { closeModal(); S.tut = 0; tutDrawn = null; S.unread = 0; updateBadge(); };
  $('tNo').onclick = () => { closeModal(); try { localStorage.setItem('ahq_tut_done', '1'); } catch (e) {} chat('Amara · ' + roleN('host'), t('start.amara'), '👋', { fun: true }); toast(t('start.toast')); };
  if (tutDone) $('tYes').className = 'btn w';
}
$('camMap').onclick = () => { if (!inGame || placingR || moving) return; toMap(); };
{ const b = $('camTour'); if (b) b.onclick = () => { if (TOUR) tourStop(false); else tourStart(); }; }
for (const ev of ['pointerdown', 'wheel']) canvas.addEventListener(ev, () => { if (TOUR) tourStop(false); }, { passive: true }); // touching the game ends the tour
$('camSet').onclick = () => { if (!inGame || placingR || moving) return; openAudio(); };
// Save code: all progress (every city, profile, manager) as one text code — works across browsers, devices and new versions of the game
function exportSave() {
  if (inGame) save(); const data = {}; for (let i = 0; i < localStorage.length; i++) { const k = localStorage.key(i); if (k && k.startsWith('ahq_')) data[k] = localStorage.getItem(k); }
  const code = 'MLT1:' + btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  modal(`<div style="font-size:42px">💾</div><h2>${t('sv.export')}</h2><p>${t('sv.exportP')}</p><textarea id="svCode" readonly style="width:100%;height:110px;font-size:11px;border-radius:12px;padding:8px">${code}</textarea><button class="btn g" id="svCopy" style="width:100%;margin-top:8px">${t('sv.copy')}</button><button class="btn w" id="svClose" style="width:100%;margin-top:8px">${t('tut.ok')}</button>`);
  $('svCopy').onclick = () => { const ta = $('svCode'); ta.select(); try { (navigator.clipboard ? navigator.clipboard.writeText(code) : Promise.reject()).then(() => toast('✅ ' + t('sv.copied'), 2000), () => { document.execCommand('copy'); toast('✅ ' + t('sv.copied'), 2000); }); } catch (e) { document.execCommand('copy'); } };
  $('svClose').onclick = closeModal;
}
function importSave() {
  modal(`<div style="font-size:42px">📥</div><h2>${t('sv.import')}</h2><p>${t('sv.importP')}</p><textarea id="svIn" style="width:100%;height:110px;font-size:11px;border-radius:12px;padding:8px" placeholder="MLT1:…"></textarea><button class="btn g" id="svGo" style="width:100%;margin-top:8px">${t('sv.restore')}</button><button class="btn w" id="svNo" style="width:100%;margin-top:8px">${t('new.no')}</button>`);
  $('svNo').onclick = closeModal;
  $('svGo').onclick = () => { try { const raw = $('svIn').value.trim(); if (!raw.startsWith('MLT1:')) throw 0; const data = JSON.parse(decodeURIComponent(escape(atob(raw.slice(5))))); for (const [k, v] of Object.entries(data)) if (k.startsWith('ahq_')) localStorage.setItem(k, v); toast('✅ ' + t('sv.done'), 1500); setTimeout(() => location.reload(), 900); } catch (e) { toast('⚠️ ' + t('sv.bad'), 2500); } };
}
// ---------------- online save: every ahq_ key is mirrored to the player's private rows (db capability, data/users/<id>/…).
// The phone's local storage alone can be wiped (iOS, in-app browsers, new device); on start the newest/most advanced copy wins.
const CLOUD = { api: null, uid: null, ready: false, sent: {}, timer: 0, early: new Set(), busy: false, on: false };
const LS_SET = Storage.prototype.setItem;
const CLOUD_SKIP = new Set(['ahq_sync_at', 'ahq_gfx', 'ahq_gfx_hint2']);
function lsAt() { try { return JSON.parse(localStorage.getItem('ahq_sync_at')) || {}; } catch (e) { return {}; } }
Storage.prototype.setItem = function (k, v) {
  LS_SET.call(this, k, v);
  if (this !== localStorage || typeof k !== 'string' || !k.startsWith('ahq_') || CLOUD_SKIP.has(k)) return;
  try { const a = lsAt(); a[k] = Date.now(); LS_SET.call(localStorage, 'ahq_sync_at', JSON.stringify(a)); } catch (e) {}
  if (!CLOUD.ready) CLOUD.early.add(k); else cloudSoon();
};
const cloudProgress = (k, v) => { try { const o = JSON.parse(v); if (/_v2$/.test(k) && o) return (o.stars || 0) * 100000 + (o.day || 0); } catch (e) {} return null; };
function cloudSoon(ms = 4000) { if (!CLOUD.ready) return; clearTimeout(CLOUD.timer); CLOUD.timer = setTimeout(cloudPush, ms); }
async function cloudPush() {
  if (!CLOUD.ready || CLOUD.busy) { if (CLOUD.ready) cloudSoon(2000); return; }
  CLOUD.busy = true; const at = lsAt();
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i); if (!k || !k.startsWith('ahq_') || CLOUD_SKIP.has(k)) continue;
      let v = localStorage.getItem(k); if (v == null || CLOUD.sent[k] === v) continue;
      if (v.length > 240000) { try { const o = JSON.parse(v); delete o.vis; v = JSON.stringify(o); } catch (e) { continue; } } // stay under row-size limits
      await CLOUD.api.put(k, v, at[k] || Date.now());
      CLOUD.sent[k] = localStorage.getItem(k);
    }
  } catch (e) { console.warn('[cloud] push', e && (e.code || e.message)); if (e && (e.code === 'revoked' || e.code === 'invalid_argument')) CLOUD.ready = false; }
  CLOUD.busy = false;
}
// two backends, one sync: the standalone app (Supabase accounts, window.MLT_ACCOUNT from account.js) or the Claude artifact's db
async function cloudBackend() {
  if (window.MLT_APP) {
    for (let i = 0; i < 100 && !window.MLT_ACCOUNT; i++) await new Promise((r) => setTimeout(r, 100));
    return window.MLT_ACCOUNT ? window.MLT_ACCOUNT.api() : null;
  }
  if (!window.claude || !window.claude.use) return null;
  const [db, user] = await Promise.all([window.claude.use('db'), window.claude.use('user')]);
  const uid = user && (await user.id()); if (!db || !uid) return null;
  const col = db.collection('data/users/' + uid);
  return { uid, list: async () => (await col.get()).docs.map((d) => ({ k: d.id, ...(d.data() || {}) })), put: (k, v, at) => col.doc(k).set({ v, at }) };
}
let cloudHooked = false;
async function cloudInit() {
  try {
    CLOUD.ready = false; CLOUD.on = false;
    const api = await cloudBackend(); if (!api) { const ci = document.getElementById('cloudInfo'); if (ci && !inGame) ci.textContent = t(window.MLT_APP ? 'sv.cloudOffApp' : 'sv.cloudOff'); return; }
    CLOUD.api = api; CLOUD.uid = api.uid; CLOUD.sent = {};
    const rows = await Promise.race([api.list(), new Promise((_, rej) => setTimeout(() => rej({ code: 'timeout' }), 10000))]);
    const at = lsAt(); let got = 0;
    for (const b of rows) {
      const k = b.k; if (!k || !k.startsWith('ahq_') || typeof b.v !== 'string') continue;
      const loc = localStorage.getItem(k); CLOUD.sent[k] = b.v;
      if (loc === b.v) continue;
      let useCloud;
      if (loc == null || !at[k]) useCloud = true;                       // wiped / new device: take the online copy
      else if (CLOUD.early.has(k)) { const pl = cloudProgress(k, loc), pc = cloudProgress(k, b.v); useCloud = pl != null && pc != null ? pc > pl : (b.at || 0) > at[k]; } // written before sync: never let a fresh start erase progress
      else useCloud = (b.at || 0) > at[k];                              // otherwise the newest copy wins
      if (k === 'ahq_profile') { try { const L = JSON.parse(loc || '{}'), C = JSON.parse(b.v); if ((L.reset || 0) !== (C.reset || 0)) useCloud = (C.reset || 0) > (L.reset || 0); const W = useCloud ? C : L, O = useCloud ? L : C; W.stars = W.stars || {}; if ((O.reset || 0) === (W.reset || 0)) for (const [c, n] of Object.entries(O.stars || {})) W.stars[c] = Math.max(W.stars[c] || 0, n); if (O.cu) W.cu = Object.assign({}, O.cu, W.cu); const js = JSON.stringify(W); if (js !== loc) { LS_SET.call(localStorage, k, js); got++; } at[k] = Math.max(b.at || 0, at[k] || 0); continue; } catch (e) {} }
      if (useCloud) { LS_SET.call(localStorage, k, b.v); at[k] = b.at || Date.now(); got++; }
    }
    LS_SET.call(localStorage, 'ahq_sync_at', JSON.stringify(at));
    CLOUD.ready = true; CLOUD.on = true; cloudSoon(500);
    if (!cloudHooked) { cloudHooked = true;
      addEventListener('pagehide', () => { if (inGame) save(); cloudPush(); });
      document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden') { if (inGame) save(); cloudPush(); } }); }
    if (got && !inGame) { refreshTitle(); toast(t('sv.cloudGot'), 4000); }
    const ci = document.getElementById('cloudInfo'); if (ci && !inGame) ci.innerHTML = '<svg width=\"26\" height=\"20\" viewBox=\"0 0 28 20\" fill=\"none\" stroke=\"#18962F\" stroke-width=\"2\"><path d=\"M7 18h14a5 5 0 0 0 .5-10A7 7 0 0 0 8 7a5.5 5.5 0 0 0-1 11z\"/><path d=\"M10.5 12.5l2.5 2.5 4.5-4.5\" stroke-linecap=\"round\"/></svg>' + t('title.savedOnline');
  } catch (e) { console.warn('[cloud] init', e && (e.code || e.message)); }
}
window.mltCloudStart = cloudInit; // the account screen calls this after sign-in
window.mltCloudStop = () => { CLOUD.ready = false; CLOUD.on = false; CLOUD.api = null; const ci = document.getElementById('cloudInfo'); if (ci) ci.textContent = t(window.MLT_APP ? 'sv.cloudOffApp' : 'sv.cloudOff'); };
setTimeout(cloudInit, 0);
function toMap() { if (inGame) save(); AU.setCity('london'); inGame = false; RNG = Math.random; resetRuntime(); buildCityDecor('london'); showMap(); } // progress is kept: reopen the city from the map
function toTitle() { AU.setCity('london'); inGame = false; RNG = Math.random; resetRuntime(); buildCityDecor('london'); refreshTitle(); show('title'); }
function cityStars(c) { const p = profile(); const s = load(c); return Math.max((p.stars || {})[c] || 0, s ? s.stars : 0); }
function cityUnlocked(c) { const C = CITIES[c]; return !C.unlock || localStorage.getItem('ahq_unlock') === '1' || cityStars(C.unlock) >= 1; }
// playtest shortcut: tap the star counter on the title screen 5 times to open every city (again to close them)
{ let n = 0, tm = 0; document.getElementById('starTotal').addEventListener('click', () => { clearTimeout(tm); tm = setTimeout(() => (n = 0), 1500); if (++n < 5) return; n = 0;
  const on = localStorage.getItem('ahq_unlock') !== '1'; localStorage.setItem('ahq_unlock', on ? '1' : '0'); toast(on ? '🔓 ' + t('dev.unlockOn') : '🔒 ' + t('dev.unlockOff'), 3000); refreshTitle(); renderMap(); }); }
function refreshTitle() {
  $('bRestore').innerHTML = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#18962F" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 4v11M7 10l5 5 5-5M4 19h16"/></svg>' + t('sv.import'); $('bRestore').onclick = importSave;
  const last = profile().last || 'london', s = load(last) || load('london'); $('bContinue').disabled = !s;
  $('contInfo').textContent = s ? t('city.' + (s.city || 'london')) + ' · ' + dayN(s.day) + ' · ' + money(s.cash) : t('title.noSave');
  $('starTotal').textContent = Object.keys(CITIES).reduce((a, c) => a + cityStars(c), 0) + ' / 66 ★';
  const ci = document.getElementById('cloudInfo'); if (ci) ci.innerHTML = (CLOUD.on ? '<svg width=\"26\" height=\"20\" viewBox=\"0 0 28 20\" fill=\"none\" stroke=\"#18962F\" stroke-width=\"2\"><path d=\"M7 18h14a5 5 0 0 0 .5-10A7 7 0 0 0 8 7a5.5 5.5 0 0 0-1 11z\"/><path d=\"M10.5 12.5l2.5 2.5 4.5-4.5\" stroke-linecap=\"round\"/></svg>' : '') + t(CLOUD.on ? 'title.savedOnline' : (window.MLT_APP ? 'sv.cloudOffApp' : 'sv.cloudOff'));
}
let mapCity = 'london';
let mapRegion = 'all';
// world map pan + pinch/wheel zoom (both axes); labels keep their on-screen size while the map scales
const MZ = { s: 1, tx: 0, ty: 0, ptrs: new Map(), moved: 0, last: null, ready: false };
// the world picture always covers the whole map area: on a wide screen (a laptop, an iPad sideways) it is scaled up to the screen's width
// instead of leaving a band of empty sea on the right; on a phone it fills the height and pans sideways, as before
function mzMin() { const sc = $('mapScroll'), inn = $('mapInner'); return sc && inn && inn.offsetWidth ? Math.max(1, sc.clientWidth / inn.offsetWidth, sc.clientHeight / inn.offsetHeight) : 1; }
function mzApply() {
  const sc = $('mapScroll'), inn = $('mapInner'); if (!sc || !inn) return; MZ.s = Math.max(MZ.s, mzMin());
  const cw = sc.clientWidth, ch = sc.clientHeight, w = inn.offsetWidth * MZ.s, h = inn.offsetHeight * MZ.s;
  MZ.tx = Math.min(0, Math.max(cw - w, MZ.tx)); MZ.ty = Math.min(0, Math.max(ch - h, MZ.ty));
  inn.style.transform = `translate(${MZ.tx}px,${MZ.ty}px) scale(${MZ.s})`; inn.style.setProperty('--k', 1 / MZ.s);
}
function mzZoom(f, cx, cy) { const k0 = mzMin(), s2 = Math.min(3.2 * k0, Math.max(k0, MZ.s * f)); MZ.tx = cx - (cx - MZ.tx) * s2 / MZ.s; MZ.ty = cy - (cy - MZ.ty) * s2 / MZ.s; MZ.s = s2; mzApply(); }
function mzCenter(px, py, smooth) { const sc = $('mapScroll'), inn = $('mapInner'); if (!sc || !inn) return;
  MZ.s = Math.max(MZ.s, mzMin());
  MZ.tx = sc.clientWidth / 2 - inn.offsetWidth * MZ.s * px / 100; MZ.ty = sc.clientHeight / 2 - inn.offsetHeight * MZ.s * py / 100;
  inn.style.transition = smooth ? 'transform .45s ease' : ''; mzApply(); if (smooth) setTimeout(() => { inn.style.transition = ''; }, 480); }
function mzInit() {
  if (MZ.ready) return; const sc = $('mapScroll'); if (!sc) return; MZ.ready = true;
  const pt = (e) => { const r = sc.getBoundingClientRect(); return [e.clientX - r.left, e.clientY - r.top]; };
  sc.addEventListener('pointerdown', (e) => { MZ.ptrs.set(e.pointerId, pt(e)); MZ.moved = 0; MZ.last = null; });
  sc.addEventListener('pointermove', (e) => { if (!MZ.ptrs.has(e.pointerId)) return; const p = pt(e), q = MZ.ptrs.get(e.pointerId); MZ.ptrs.set(e.pointerId, p);
    if (MZ.ptrs.size === 1) { MZ.tx += p[0] - q[0]; MZ.ty += p[1] - q[1]; MZ.moved += Math.abs(p[0] - q[0]) + Math.abs(p[1] - q[1]); mzApply(); }
    else if (MZ.ptrs.size === 2) { const [a, b] = [...MZ.ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]), m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (MZ.last) { MZ.tx += m[0] - MZ.last.m[0]; MZ.ty += m[1] - MZ.last.m[1]; mzZoom(d / MZ.last.d, m[0], m[1]); } MZ.last = { d, m }; MZ.moved += 99; } });
  const up = (e) => { MZ.ptrs.delete(e.pointerId); MZ.last = null; };
  sc.addEventListener('pointerup', up); sc.addEventListener('pointercancel', up); sc.addEventListener('pointerleave', up);
  sc.addEventListener('click', (e) => { if (MZ.moved > 8) { e.stopPropagation(); e.preventDefault(); } }, true); // a drag is not a tap on a pin
  sc.addEventListener('wheel', (e) => { e.preventDefault(); const [x, y] = pt(e); mzZoom(e.deltaY < 0 ? 1.15 : 1 / 1.15, x, y); }, { passive: false });
  addEventListener('resize', mzApply);
}
function renderMap() {
  const inner = $('mapInner'); inner.querySelectorAll('.pin').forEach((x) => x.remove());
  for (const [k, C] of Object.entries(CITIES)) {
    if (mapRegion !== 'all' && C.region !== mapRegion) continue;
    const ok = cityUnlocked(k), b = document.createElement('button'); b.className = 'pin ' + (k === mapCity ? 'g' : ok ? 'w' : 'y');
    b.style.left = C.pin[0] + '%'; b.style.top = C.pin[1] + '%'; b.textContent = (ok ? '' : '🔒 ') + t('city.' + k) + (cityStars(k) ? ' ' + '★'.repeat(cityStars(k)) : '');
    b.onclick = () => { if (!ok) { toast(t('map.lockC', { city: t('city.' + C.unlock) })); return; } mapCity = k; renderMap(); }; inner.appendChild(b);
  }
  for (const [nk, x, y] of LOCKED_PINS) { const b = document.createElement('button'); b.className = 'pin y'; b.style.cssText = `left:${x}%;top:${y}%;font-size:12px`; b.textContent = '🔒 ' + t(nk); b.onclick = () => toast(t('map.soon')); inner.appendChild(b); }
  const C = CITIES[mapCity], s = load(mapCity), st = cityStars(mapCity);
  $('mapSheet').innerHTML = `<div class="grab"></div><div class="maphead" style="background-image:linear-gradient(90deg,rgba(255,255,255,.88) 0%,rgba(255,255,255,.6) 28%,rgba(255,255,255,0) 50%),url(assets/banners/${mapCity}.webp)"><div><div class="lbl">${t('map.lvl', { n: C.lvl + 1 })} · ${t(C.region)}</div><h2 class="f" style="margin:0;font-size:30px">${t('city.' + mapCity)}</h2><div class="stars mstars">${'★'.repeat(st)}${'☆'.repeat(3 - st)}</div></div></div>
    <div style="font-weight:800;font-size:13.5px">📒 ${ct('ui.album')} : ${ct('ui.albumN', { n: profile().album || 0 })}</div>
    <div style="font-weight:700;color:#2D3748;font-size:14.5px">${t(C.desc)}</div>
    <button class="btn g" id="mOpen" style="font-size:20px">${s ? t('map.contC', { city: t('city.' + mapCity) }) : t('map.openC', { city: t('city.' + mapCity) })}</button>`;
  $('mOpen').onclick = openBrief;
}
function showMap() { const l = profile().last; if (l && CITIES[l] && cityUnlocked(l)) mapCity = l; renderMap(); show('map'); mzInit(); requestAnimationFrame(() => { MZ.s = 1; const P = CITIES[mapCity].pin; mzCenter(P[0], P[1], false); }); }
function openBrief() {
  const C = CITIES[mapCity];
  buildCityDecor(mapCity);
  { // the empty lot of this city, framed in the picture strip at the top (the sheet covers the bottom of the screen)
    const M = plotOf(mapCity).main, px = (Math.min(...M.map((r) => r[0])) + Math.max(...M.map((r) => r[1]))) / 2, pz = (Math.min(...M.map((r) => r[2])) + Math.max(...M.map((r) => r[3]))) / 2;
    view.yaw = Math.PI / 4; view.yawT = null; view.pitch = 0.72; view.pitchT = null; view.half = innerWidth < innerHeight ? 40 : 20;
    const k = 0.72 * view.half / Math.sin(0.72); view.tx = px + Math.sin(view.yaw) * k; view.tz = pz + Math.cos(view.yaw) * k; placeCam(); }
  GOALS = mkGoals(C.goals);
  const lp = Object.keys(PROBLEMS).filter((k) => PROBLEMS[k].city === mapCity), lv = CITIES[mapCity].lvl || 0, nb = Object.keys(BEH).filter((k) => BEH[k] === lv);
  const li = (e, txt) => `<li><span class="be">${e}</span><span>${txt}</span></li>`;
  const goal = (G, i) => `<div class="bgoal g${i + 1}"><span class="rib">${'★'.repeat(i + 1)}</span><div class="chips">${G.parts.map(([m, v]) => `<span>${t('gp.' + m, { n: m === 'cash' || m === 'value' ? money(v) : v })}</span>`).join('')}</div></div>`; // one ribbon per star level, its conditions as chips
  // one simple read: the local rules (budget and rent first), the goals of this city; plain bullet lists, no boxes
  $('briefBody').innerHTML = `<div><h1 class="f" style="margin:0">${t('city.' + mapCity)}</h1><div style="font-weight:700;color:#2D3748;font-size:14px">${t(C.brief)}</div></div>
    <div class="lbl">${t('brief.rules')}</div><ul class="blist">${li('💰', `<b>${t('brief.budgetC', { m: money(C.cash) })}</b>`)}${li('🏠', `<b>${t('brief.rentC', { m: money(Math.round(C.rent * BILL_K / 50) * 50) })}</b>`)}${C.rules.map(([e, k]) => li(e, t(k))).join('')}</ul>
    ${lp.length ? `<div class="lbl">${t('br.probs')}</div><ul class="blist">${lp.map((k) => li(PROBLEMS[k].e, `<b>${t('p.' + k)}</b> → ${ROOMS[PROBLEMS[k].room].e} ${rn(PROBLEMS[k].room)}`)).join('')}</ul>` : ''}
    ${nb.length ? `<div class="lbl">${t('br.new')}</div><ul class="blist">${nb.map((k) => li(BEH_E[k], `<b>${t('bh.' + k)}</b>`)).join('')}</ul>` : ''}
    <div class="lbl">${t('brief.goals')}</div><div class="bgoals">${GOALS.map((G, i) => goal(G, i)).join('')}</div>
    <div class="bfoot"><button class="btn g" id="bOpen" style="font-size:21px">${t('brief.open')}</button></div>`;
  { const bi = document.querySelector('#brief .bimg'), img = { london: 'assets/brief/london.webp' }[mapCity]; bi.style.background = img ? `#E9E1D3 url(${img}) 38% 40% / cover no-repeat` : ''; } // a framed shot of the city and its empty lot where we have one, otherwise the live view
  $('briefTag').textContent = t(C.tag);
  $('bOpen').onclick = () => { const sv = load(mapCity); if (sv) { RNG = Math.random; S = sv; S.city = S.city || mapCity; startGame(); } else startNew(mapCity); };
  show('brief');
}
// a new career must also win against the online copy: city saves become 'null' (synced like any save, removeItem would not be) and the profile gets a
// reset stamp, so the cloud merge stops adding back the old stars. The playtest 'open every city' switch is turned off too.
function resetCareer() { for (const c of Object.keys(CITIES)) localStorage.setItem(saveKey(c), 'null'); localStorage.setItem('ahq_unlock', '0'); const p = profile(); p.stars = {}; p.last = 'london'; p.reset = Date.now(); localStorage.setItem('ahq_profile', JSON.stringify(p)); }
$('bContinue').onclick = showMap;
$('bNew').onclick = () => {
  const go = () => { resetCareer(); mapCity = 'london'; openCreate('map'); }; // every new career starts by creating (or tweaking) the manager
  if (Object.keys(CITIES).some((c) => load(c))) { modal(`<div style="font-size:44px">🧹</div><h2>${t('new.confirmT')}</h2><p>${t('new.confirmP')}</p><div class="row2" style="margin-top:10px"><button class="btn y" id="nNo">${t('new.no')}</button><button class="btn g" id="nYes">${t('new.yes')}</button></div>`); $('nNo').onclick = closeModal; $('nYes').onclick = () => { closeModal(); go(); }; }
  else go();
};
if ($('bMgr')) $('bMgr').onclick = () => openCreate('title');


$('bLang').onclick = openLang;
$('mBack').onclick = () => { refreshTitle(); show('title'); };
$('bBack').onclick = () => { buildCityDecor('london'); showMap(); };
document.addEventListener('visibilitychange', () => { if (document.hidden && S && inGame) save(); });
addEventListener('pagehide', () => { if (S && inGame) save(); }); addEventListener('blur', () => { if (S && inGame) save(); });

setLang(detectLang()); applyStatic();
S = newState();
buildWorld(); resize(); refreshTitle();
{ let c = null; try { c = sessionStorage.getItem('ahq_resume'); sessionStorage.removeItem('ahq_resume'); } catch (e) {} // back into the game after a graphics change
  const sv = c && CITIES[c] && load(c); if (sv) setTimeout(() => { buildCityDecor(c); mapCity = c; RNG = Math.random; S = sv; S.city = S.city || c; startGame(); }, 0); }
// ---------------- manager actions ----------------
const MGR_CD = 45, AURA_R = 3.5; let mgrPick = null;
const auraRing = new THREE.Mesh(new THREE.RingGeometry(AURA_R - 0.1, AURA_R, 56), new THREE.MeshBasicMaterial({ color: '#FFD25E', transparent: true, opacity: 0.6, depthWrite: false }));
auraRing.rotation.x = -Math.PI / 2; auraRing.visible = false; auraRing.renderOrder = 2; scene.add(auraRing);
{ const f = new THREE.Mesh(new THREE.CircleGeometry(AURA_R, 56), new THREE.MeshBasicMaterial({ color: '#FFD25E', transparent: true, opacity: 0.1, depthWrite: false })); auraRing.add(f); }
function mgrSpot() { return S.mgrSpot || (S.mgrSpot = { x: 3.6, z: 1.3 }); }
function inAura(p) { if (!R.mgr || R.mgr.path.length || !R.mgr.av.visible) return false; const s = R.mgr.av.position; return Math.hypot(p.x - s.x, p.z - s.z) < 2.6; } // around the boss, wherever they stand
const mgrRoomF = (id) => (S.mgrHelp && S.mgrHelp.kind === 'room' && S.mgrHelp.id === id ? S.mgrHelp.f || 1.6 : 1);
const mgrDeskF = () => (S.mgrHelp && S.mgrHelp.kind === 'desk' ? S.mgrHelp.f || 2 : 1);
function mgrHome() { const M = R.mgr; if (!M) return; M.task = null; M.idleT = 1.5; }
function mgrGo(task, auto) {
  const M = R.mgr; if (!M) return;
  if (!auto && S.mgrCd > 0) { toast(t('mg.cd', { s: Math.ceil(S.mgrCd) }), 1400); return; }
  if (auto) { M.autoCd = 14; task.auto = true; } else S.mgrCd = MGR_CD;
  S.mgrHelp = null; M.task = task; M.look = null;
  let dest;
  if (task.kind === 'v') { const p = task.v.av.position; dest = { x: p.x + 0.55, z: p.z + 0.35 }; }
  else if (task.kind === 'room') { const r = R.rooms[task.id]; dest = doorPt(r.def, -0.9); }
  else { const d = deskSpot(); dest = { x: d.x + 0.9, z: d.z - 0.3 }; }
  setPath(M, findPath(M.av.position, dest)); if (!auto) toast('⭐ ' + t('mg.onWay', { name: MGR.name }), 1600);
}
function mgrArrive() {
  const M = R.mgr, tk = M.task; if (!tk) return;
  if (tk.kind === 'v') {
    const v = tk.v; M.task = null;
    if (!R.visitors.includes(v) || ['exit', 'angry'].includes(v.state)) { toast(t('mg.late'), 1600); mgrHome(); return; }
    v.pat = Math.min(1, v.pat + 0.5); v.prio = true; floatAt(v.av.position, '😌 +50%');
    if (!v.known && R.deskQ.includes(v)) finishCheckin(v);
    M.av.lookAt(v.av.position.x, M.av.position.y, v.av.position.z); M.cheer = 1.0; mgrHome(); return;
  }
  if (tk.kind === 'patrol') { M.task = null; M.idleT = 3 + RNG() * 3; return; }
  if (tk.kind === 'room') { if (!R.rooms[tk.id]) { mgrHome(); return; } const rm = R.rooms[tk.id]; M.look = Math.atan2(rm.cx - M.av.position.x, rm.cz - M.av.position.z); S.mgrHelp = { kind: 'room', id: tk.id, t: tk.auto ? 15 : 25, f: tk.auto ? 1.3 : 1.6 }; floatAt(M.av.position, tk.auto ? '⚡ ×1.3' : '⚡ ×1.6'); }
  else { S.mgrHelp = { kind: 'desk', t: tk.auto ? 15 : 25, f: tk.auto ? 1.5 : 2 }; floatAt(M.av.position, tk.auto ? '⚡ ×1.5' : '⚡ ×2'); }
  M.task = null; M.cheer = 0.8;
}
function openMgr() {
  if (!inGame || !R.mgr) return; selectVisitor(null);
  const pc = S.pepCd > 0 ? Math.ceil(S.pepCd) : 0, mc = S.mgrCd > 0 ? Math.ceil(S.mgrCd) : 0;
  openSheet(`<div style="display:flex;gap:12px;align-items:center;margin-bottom:6px"><img src="${mgrPortrait()}" style="width:58px;height:58px;border-radius:50%;border:3px solid var(--gold-b)"><div><h2 style="margin:0">${MGR.name}</h2><p class="sub" style="margin:0">${t('mg.sub', { g: MGR.pron })}</p></div></div>
  <div class="opt w"><div class="oi" style="background:#FFF3C4">📣</div><div class="ot"><b>${t('pep.btn')}</b><div>${t('pep.go')}</div></div><button class="btn g" id="mgPep" ${pc ? 'disabled' : ''}>${pc ? pc + 's' : t('mg.do')}</button></div>
  <div class="opt w"><div class="oi" style="background:#FFE1DC">🎯</div><div class="ot"><b>${t('mg.go')}</b><div>${t('mg.goD')}</div></div><button class="btn g" id="mgGo" ${mc ? 'disabled' : ''}>${mc ? mc + 's' : t('mg.do')}</button></div>
  <div class="opt w"><div class="oi" style="background:#FFF8E0">🚶</div><div class="ot"><b>${t('mg.auto')}</b><div>${t('mg.autoD')}</div></div><button class="btn ${S.mgrAuto !== false ? 'g' : 'y'}" id="mgAuto">${S.mgrAuto !== false ? t('mg.on') : t('mg.off')}</button></div>`);
  $('mgPep').onclick = () => { closeSheet(); pepTalk(); };
  $('mgGo').onclick = () => { closeSheet(); startPick('go'); };
  $('mgAuto').onclick = () => { S.mgrAuto = S.mgrAuto === false; save(); openMgr(); };
}
function startPick(kind) { mgrPick = { kind }; $('pickTxt').textContent = kind === 'go' ? '🎯 ' + t('mg.pickGo') : '📍 ' + t('mg.pickAura'); $('pickbar').classList.add('on'); }
function endPick() { mgrPick = null; $('pickbar').classList.remove('on'); }
$('pickX').onclick = endPick;
function mgrPickAt(e) {
  if (mgrPick.kind === 'go') {
    const v = pickVisitor(e); if (v) { if (['exit', 'angry'].includes(v.state)) { toast(t('mg.late')); return; } endPick(); mgrGo({ kind: 'v', v }); return; }
    if (ray.intersectObject(world.desk, true).length) { endPick(); mgrGo({ kind: 'desk' }); return; }
    if (ray.ray.intersectPlane(gPlane, gHit)) { const hr = S.rooms.find((r) => { const q = roomRect(r); return gHit.x > q.x0 && gHit.x < q.x1 && gHit.z > q.z0 && gHit.z < q.z1; }); if (hr && ROOMS[hr.type].role) { endPick(); mgrGo({ kind: 'room', id: hr.id }); return; } }
    toast(t('mg.pickNone'), 1400); return;
  }
  if (ray.ray.intersectPlane(gPlane, gHit) && inFloor(gHit.x, gHit.z) && !S.rooms.some((r) => { const q = roomRect(r); return gHit.x > q.x0 && gHit.x < q.x1 && gHit.z > q.z0 && gHit.z < q.z1; })) { S.mgrSpot = { x: gHit.x, z: gHit.z }; endPick(); if (!R.mgr.task && !S.mgrHelp) mgrHome(); save(); return; }
  toast(t('mg.pickBad'), 1400);
}
function pickVisitor(e) { // finger-friendly: nearest visitor to the tap (body or the bubble over their head) within ~a fingertip
  let best = null, bd = 50;
  for (const v of R.visitors) { if (v.state === 'exit' || !v.av.visible) continue; const t0 = v.look.tall || 1;
    for (const y of [0.5 * t0, 1.1 * t0, 2.3]) { const [sx, sy] = toScreen(v.av.position.x, y, v.av.position.z); const d = Math.hypot(sx - e.clientX, sy - e.clientY); if (d < bd) { bd = d; best = v; } } }
  if (best) return best;
  const hits = ray.intersectObjects(R.visitors.map((v) => v.av), true);
  if (hits.length) { const owner = hits[0].object.userData.owner; const v = R.visitors.find((x) => x.av === owner || x.av === hits[0].object.parent); if (v) return v; }
  return null;
}
// ---------------- inspect: desk & room queues ----------------
function vChip(v) { const c = v.pat > 0.6 ? '#7ACB4E' : v.pat > 0.3 ? '#FFB800' : '#E5484D'; return `<button class="vchip w" data-vid="${v.id}"><span class="vf">${v.em ? '🚨' : v.vip ? '👑' : v.known && !isMystK(v.prob) ? PROBLEMS[v.prob].e : '🛎️'}</span><span class="vn">${v.name}</span><i style="width:${Math.round(v.pat * 100)}%;background:${c}"></i></button>`; }
function bindChips() { $('sheet').querySelectorAll('[data-vid]').forEach((b) => b.onclick = () => { const v = R.visitors.find((x) => x.id === +b.dataset.vid); closeSheet(); if (v) selectVisitor(v); }); }
// express check-in upgrades: ×2 then ×3 speed for one desk (pricey on purpose)
const DESK_UP = [0, 6000, 15000];
const deskLv = (di) => ((desks()[di] || {}).lv || 1);
function deskUpRow(di) { const lv = deskLv(di); if (lv >= 3) return `<div class="msg">⚡ ${t('dk.upMax')}</div>`;
  return `<div class="opt w" style="margin-top:8px"><div class="oi" style="background:#FFF3C4">⚡</div><div class="ot"><b>${t('dk.up', { x: lv + 1 })}</b><div>${t('dk.upD', { x: lv + 1 })}</div></div><button class="btn g" id="dkUp" ${S.cash < DESK_UP[lv] ? 'disabled' : ''}>${money(DESK_UP[lv])}</button></div>`; }
function bindDeskUp(di, reopen) { const b = $('dkUp'); if (!b) return; b.onclick = () => { const lv = deskLv(di); if (S.cash < DESK_UP[lv]) return; S.cash -= DESK_UP[lv]; if (di === 0 && S.desk.segs) S.desk.segs.forEach((sg) => (sg.lv = lv + 1)); else desks()[di].lv = lv + 1; AU.sfx('build'); toast('⚡ ' + t('dk.up', { x: lv + 1 }), 2000); save(); reopen(); }; }
const DESK_LONG = 2500;
function lengthenDesk() {
  const lv = S.desk.lv || 1; S.desk.segs = [{ lv }, { lv }]; fixDesk(); // longer counter: keep it clear of the walls
  // extra desks shift up one index: move their hosts and lines along
  for (const rs of R.staff) if (rs.at === 'desk' && (rs.desk || 0) >= 1) rs.desk++;
  R.deskQs.splice(1, 0, []);
  for (const v of R.visitors) if ((v.desk || 0) >= 1) v.desk++;
  placeDesk(); assignStaff(); const h = deskHost(0); if (h) goStaff(h, deskSpot(0));
  for (const v of R.deskQ.slice(Math.ceil(R.deskQ.length / 2))) { R.deskQ.splice(R.deskQ.indexOf(v), 1); joinQueue(v); } // half the line moves over
}
function openDesk() {
  if (!inGame || placingR || moving) return; selectVisitor(null);
  const host = R.staff.find((rs) => rs.at === 'desk'), q = R.deskQ, avg = q.length ? Math.round(q.reduce((a, v) => a + v.pat, 0) / q.length * 100) : 100;
  let h = `<h2>🛎️ ${t('dk.title')}</h2><p class="sub">${host ? t('dk.host', { name: host.data.name }) : '⚠️ ' + t('desk.need')} · ${t('dk.line', { n: q.length })}${q.length ? ' · ' + t('dk.mood', { p: avg }) : ''}</p>`;
  h += q.length ? `<div class="chips">${q.slice(0, 12).map(vChip).join('')}</div>${q.length > 12 ? `<div class="sub">+${q.length - 12}</div>` : ''}` : `<div class="msg">${t('dk.empty')}</div>`;
  if (q.length >= 6) h += `<div class="msg">💡 ${t('dk.tip')}</div>`;
  if (!S.desk.segs) h += `<div class="opt w" style="margin-top:8px"><div class="oi" style="background:#DDF3E2">🛎️🛎️</div><div class="ot"><b>${t('dk.long')}</b><div>${t('dk.longD')}</div></div><button class="btn g" id="dkLong" ${S.cash < DESK_LONG ? 'disabled' : ''}>${money(DESK_LONG)}</button></div>`;
  else h += `<div class="msg">🛎️🛎️ ${t('dk.longOn', { a: deskHost(0) ? deskHost(0).data.name : '—', b: deskHost(1) ? deskHost(1).data.name : t('desk.need') })}</div>`;
  h += deskUpRow(0);
  h += `<div class="row2" style="margin-top:10px"><button class="btn y" id="dkMove">✋ ${t('build.moveDesk')}</button>${host ? `<button class="btn g" id="dkMgr" ${S.mgrCd > 0 ? 'disabled' : ''}>⭐ ${t('dk.mgr')}</button>` : `<button class="btn g" id="dkHire">${t('next.host')}</button>`}</div>`;
  openSheet(h); bindChips(); bindDeskUp(0, openDesk);
  { const b = $('dkLong'); if (b) b.onclick = () => { if (S.cash < DESK_LONG) return; S.cash -= DESK_LONG; lengthenDesk(); AU.sfx('build'); toast('🛎️🛎️ ' + t(R.staff.some((rs) => rs.data.role === 'host' && (!rs.at || rs.at === 'idle')) ? 'desk2.done' : 'desk2.hire'), 3000); save(); openDesk(); }; }
  $('dkMove').onclick = () => { closeSheet(); startMove(); };
  const m = $('dkMgr'); if (m) m.onclick = () => { closeSheet(); mgrGo({ kind: 'desk' }); };
  const hh = $('dkHire'); if (hh) hh.onclick = () => openHire('host');
}
function roomQueueHtml(room) {
  const q = roomQ(room.id), cap = room.spots.length, busy = room.spots.filter((s) => s.busy).length, others = Object.values(R.rooms).filter((r) => r.type === room.type && r.id !== room.id);
  let h = `<div class="lbl" style="margin:2px 0 6px">👥 ${t('rq.title', { n: q.length })} · ${t('rq.inUse', { a: busy, b: cap })}</div>`;
  h += q.length ? `<div class="chips">${q.slice(0, 12).map(vChip).join('')}</div>` : `<div class="msg">${t('rq.empty')}</div>`;
  if (q.length >= 2 && others.length) h += `<button class="btn g" id="rqSplit" style="width:100%;margin-top:8px">↔️ ${t('rq.split', { room: rn(room.type) + roomNo(others[0]) })}</button>`;
  else if (q.length >= 4 && !others.length) h += `<div class="msg">💡 ${t('rq.tip', { room: rn(room.type) })}</div>`;
  if (ROOMS[room.type].role) h += `<button class="btn w" id="rqMgr" style="width:100%;margin-top:8px" ${S.mgrCd > 0 ? 'disabled' : ''}>⭐ ${t('rq.mgr', { name: MGR.name })}</button>`;
  return h;
}
function bindRoomQueue(room) {
  bindChips();
  const s = $('rqSplit'); if (s) s.onclick = () => { const n = splitQueue(room.id); closeSheet(); toast('↔️ ' + t('rq.moved', { n }), 1800); };
  const m = $('rqMgr'); if (m) m.onclick = () => { closeSheet(); mgrGo({ kind: 'room', id: room.id }); };
}
// ---------------- visitor card helpers ----------------
function feeFor(v) { if (isMystK(v.prob)) return 0; const pr = (S.price || 1) * (cityOf().hustle ? 1.1 : 1) * (isNight() ? 1.15 : 1); return Math.round(PROBLEMS[v.prob].fee * 1.3 * (0.7 + S.vibes / 200) * pr) * (v.vip ? 2 : 1); }
function leaveCost(v) { return (v.known && !isMystK(v.prob) && !hasRoom(PROBLEMS[v.prob].room) ? 1 : PROBLEMS[v.prob].care ? 5 : 3) + (v.vip ? 10 : 0); }
function vThought(v) {
  const need = v.known ? needOf(v) : null, host = R.staff.some((rs) => rs.at === 'desk' && rs.mode === 'there');
  if (['exit'].includes(v.state)) return t('th.happy');
  if (v.state === 'angry') return t('th.gone');
  if (v.em) return t('th.em');
  if (v.need > 1 && !hasRoom('toilet')) return t('th.loo');
  if (need && !hasRoom(need)) return t('th.noRoom', { room: rn(need) });
  if (S.ev && S.ev.k === 'power') return t('th.power');
  if (R.rats.length) return t('th.rats');
  if (R.litter.length >= 4) return t('th.dirty');
  if (['queue', 'toQueue'].includes(v.state) && !host) return t('th.noHost');
  if (need && v.target != null && R.rooms[v.target] && !R.rooms[v.target].staff.some((s) => s && s.mode === 'there')) return t('th.noStaff', { room: rn(need) });
  if (v.pat < 0.3) return t('th.long');
  if (['queue', 'toQueue'].includes(v.state) && DQ(v.desk || 0).length > 4) return t('th.line');
  if ((S.price || 1) > 1.2) return t('th.price');
  if (inAura(v.av.position)) return t('th.boss', { name: MGR.name });
  return v.pat > 0.7 ? t('th.good') : t('th.ok');
}
// ---------------- save / restore visitors ----------------
function snapVisitor(v) { const p = v.av.position; return { prob: v.prob, em: v.em, vip: v.vip, name: v.name, age: v.age, known: v.known, pat: v.pat, need: v.need || 0, urgent: !!v.urgent, x: p.x, z: p.z, look: v.look, gid: v.gid, spent: v.spent || 0, waitT: v.waitT || 0, prio: !!v.prio }; }
function restoreVisitors() {
  const list = S.vis || []; S.vis = null;
  for (const d of list) {
    if (!PROBLEMS[d.prob]) continue;
    const v = spawnVisitor(d.prob, d.em, false, d.look); Object.assign(v, { name: d.name, age: d.age, pat: d.pat, need: d.need, urgent: d.urgent, gid: d.gid, spent: d.spent, waitT: d.waitT, prio: d.prio || d.em });
    if (d.vip) { v.vip = true; const cr = new THREE.Sprite(iconTex('👑')); cr.scale.set(0.45, 0.45, 1); cr.position.set(0.35, 2.5 * v.look.tall, -0.35); cr.renderOrder = 10; v.hud.add(cr); }
    v.av.position.set(d.x, 0.1, d.z);
    if (d.known) finishCheckin(v, true); else { const i = R.deskQ.indexOf(v); setPath(v, [QUEUE(i)]); }
  }
}

// ---------------- audio settings & PA ----------------
function say(k, txt, cd = 45) { if (!S || !inGame || speedMul === 0 || sheetPaused || modalPaused && cd) return; AU.announce(k, txt, getLang(), cd); }
function openAudio() { // ⚙️ Settings
  const row = (k, ic) => `<div class="opt w"><div class="oi" style="background:#EEF2F7">${ic}</div><div class="ot"><b>${t('au.' + k)}</b><div>${t('au.' + k + 'D')}</div></div><button class="btn ${AU.st[k] ? 'g' : 'y'}" data-au="${k}">${AU.st[k] ? t('au.on') : t('au.off')}</button></div>`;
  const gb = (k) => `<button class="btn ${GFX.pref === k ? 'g' : 'w'}" data-gfx="${k}" style="flex:1;padding:8px 4px;font-size:14px">${t('gfx.' + k)}</button>`;
  const game = inGame && S && S.mode === 'career';
  openSheet(`<h2>⚙️ ${t('set.title')}</h2>` + `<div class="lbl" style="margin:4px 0 6px">🔊 ${t('au.title')}</div>` + row('music', '🎵') + row('sfx', '🔔') + row('voice', '📢')
    + `<div class="opt w" style="display:block"><div class="ot"><b>🖥️ ${t('gfx.title')}</b><div>${t('gfx.D', { m: t('gfx.' + GFX.mode) })}</div></div><div style="display:flex;gap:6px;margin-top:8px">${gb('auto')}${gb('high')}${gb('low')}</div></div>`
    + `<div class="opt w"><div class="oi" style="background:#EEF2F7">🏷️</div><div class="ot"><b>${t('set.icons')}</b><div>${t('set.iconsD')}</div></div><button class="btn ${ICONS_ALL ? 'g' : 'y'}" id="stIcons">${ICONS_ALL ? t('set.iconsAll') : t('set.iconsNeed')}</button></div>`
    + `<div class="row2" style="margin-top:8px"><button class="btn w" id="stLang">🌐 ${t('set.lang')}</button><button class="btn w" id="stAcc">👤 ${t('set.acc')}</button></div>`
    + (game ? `<div class="lbl" style="margin:12px 0 6px">💾 ${t('set.save')}</div><div class="row2"><button class="btn w" id="gSave">💾 ${t('sv.export')}</button><button class="btn w" id="gLoad">📥 ${t('sv.import')}</button><button class="btn w" id="gTut">${t('tut.replay')}</button><button class="btn y" id="gQuit">${t('menu.quit')}</button></div>` : '')
    + `<button class="btn w" id="scBtn" style="width:100%;margin-top:10px;font-size:13px">✨ Showcase</button>`);
  $('scBtn').onclick = () => { closeSheet(); startShowcase().catch((e) => toast(String(e))); };
  $('stLang').onclick = () => { closeSheet(); openLang(); };
  $('stIcons').onclick = () => { ICONS_ALL = !ICONS_ALL; try { localStorage.setItem('ahq_icons', ICONS_ALL ? 'all' : 'need'); } catch (e) {} openAudio(); };
  $('stAcc').onclick = () => { closeSheet(); window.MLT_ACCOUNT && window.MLT_ACCOUNT.open(); };
  if (game) {
    $('gTut').onclick = () => { closeSheet(); S.pepUsed = false; S.tutGoals = false; S.tut = 0; tutDrawn = null; };
    $('gQuit').onclick = () => { save(); closeSheet(); toTitle(); };
    $('gSave').onclick = () => { closeSheet(); exportSave(); }; $('gLoad').onclick = () => { closeSheet(); importSave(); };
  }
  // graphics need a reload; the game reopens right where it was (same city, same save) instead of the title screen
  $('sheet').querySelectorAll('[data-gfx]').forEach((b) => b.onclick = () => { const k = b.dataset.gfx; try { if (k === 'auto') { localStorage.removeItem('ahq_gfx'); localStorage.removeItem('ahq_gfx_hint2'); } else localStorage.setItem('ahq_gfx', k); if (game) { save(); sessionStorage.setItem('ahq_resume', S.city); } } catch (e) {} location.reload(); });
  $('sheet').querySelectorAll('[data-au]').forEach((b) => b.onclick = () => { const k = b.dataset.au; AU.set(k, !AU.st[k]); if (k === 'voice' && AU.st.voice) AU.announce('test', t('au.test'), getLang(), 0); openAudio(); });
}
for (const ev of ['pointerdown', 'touchend', 'click']) addEventListener(ev, () => { AU.ensure(); if (inGame) AU.startMusic(); }, { passive: true }); // iOS only unlocks audio on some of these
// ---------------- staff cover ----------------
let coverT = 0;
function staffCover(dt) {
  coverT += dt; if (coverT < 3) return; coverT = 0;
  for (const room of Object.values(R.rooms)) {
    const role = ROOMS[room.type].role; if (!role || role === 'host' || room.closed || room.staff.some(Boolean) || !room.staffSpots[0]) continue;
    if (!R.visitors.some((v) => v.state === 'wait' && v.known && needOf(v) === room.type)) continue;
    const donor = R.staff.find((rs) => {
      if (rs.data.role !== role || rs.mode !== 'there' || rs.onBreak || rs.data.awayT > 0) return false;
      const A = R.rooms[rs.at]; if (!A || A.id === room.id || A.type === room.type) return false;
      if (A.spots.some((s) => s.st === rs.st && s.busy)) return false;
      if (R.visitors.some((v) => (v.state === 'wait' || v.state === 'toWait') && v.known && needOf(v) === A.type)) return false;
      return true;
    });
    if (!donor) continue;
    const A = R.rooms[donor.at]; A.staff[donor.st] = null;
    donor.at = room.id; donor.st = 0; room.staff[0] = donor; goStaff(donor, room.staffSpots[0]);
    floatAt(donor.av.position, '🔁'); toast('🔁 ' + t('cover.go', { name: donor.data.name.split(' ')[0], room: rn(room.type), from: rn(A.type) }), 2200);
    say('cover' + room.id, t('cover.go', { name: donor.data.name.split(' ')[0], room: rn(room.type), from: rn(A.type) }), 40);
  }
}

const MODELS_URL = (() => { const q = new URLSearchParams(location.search).get('models'); return q && !/:\/\//.test(q) ? q : 'models/manifest.json'; })();
function swapStaffAvatar(rs) {
  const old = rs.av, av = staffPerson(rs.data); if (!av.userData.p.glb) return;
  av.position.copy(old.position); av.rotation.copy(old.rotation); scene.remove(old); scene.add(av); rs.av = av; delete portraits['s' + rs.data.id];
  const p = av.userData.p, sp = rs.target;
  if (rs.mode === 'walk') poseWalk(p, 0); else if (rs.mode === 'there') { rs.busyPose = null; if (sp && sp.sit) poseSit(p); else poseStand(p); } else if (sp && sp.sit) poseSit(p); else poseStand(p);
}
CHAR.onModel = (role) => { if (role.startsWith('mgr_')) { refreshMgrModel(); return; } if (VIS[role]) { if (role === 'sp_trainer') for (const rs of R.staff) if (rs.data.role === 'trainer' && !rs.av.userData.p.glb) swapStaffAvatar(rs); for (const v of R.visitors) if (v.look.vm === role && !v.av.userData.p.glb) swapVisitorAvatar(v); return; } for (const rs of R.staff) if (rs.data.role === role && !rs.av.userData.p.glb) swapStaffAvatar(rs); };
loadCharacters(MODELS_URL).then((ok) => { if (ok) { if (S) preloadVisitors(S.city); for (const rs of R.staff) if (!(rs.av.userData.p && rs.av.userData.p.glb)) swapStaffAvatar(rs); for (const v of R.visitors) if (!(v.av.userData.p && v.av.userData.p.glb) && CHAR.A.full[v.look && v.look.vm]) swapVisitorAvatar(v); /* anyone who arrived before the models were all in: each model's own swap ran while loading wasn't finished, so it kept the stand-in */ for (const k in portraits) delete portraits[k]; console.info('[chars] GLB avatars ready', CHAR.errors); } });

// ---------------- style showcase (GLB modelled in Blender) ----------------
let scMixer = null;
async function loadGLB64(name) {
  const { GLTFLoader } = await import('three/addons/loaders/GLTFLoader.js');
  const b64 = (await import('./models/showcase/' + name + '.js')).default; const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return new Promise((res, rej) => new GLTFLoader().parse(bin.buffer, '', res, rej));
}
async function startShowcase() {
  const [room, host, pod, plantG] = await Promise.all(['nap_showcase', 'host', 'pod', 'plant'].map(loadGLB64));
  if (!S) { startNew('london'); closeModal(); }
  S.rooms.slice().forEach((r) => demolish(r.id)); closeSheet(); closeModal();
  for (const v of R.visitors.slice()) removeVisitor(v);
  for (const rs of R.staff) rs.av.visible = false; if (R.mgr) R.mgr.av.visible = false;
  setSpeed(0);
  const g0 = new THREE.Group(); g0.position.set(-7.5, 0.17, -2.6); scene.add(g0); world.showcase = g0;
  // room shell modelled in Blender; its placeholder bed / plant / character are replaced by the Meshy models
  room.scene.traverse((m) => { if (m.isMesh && /^(char|bed|plant)_/.test(m.name)) m.visible = false; });
  g0.add(room.scene);
  const place = (gl, x, z, ry) => { const o = gl.scene; o.position.set(x, 0, z); o.rotation.y = ry; g0.add(o); return o; };
  place(pod, 0.55, -0.4, 0); place(plantG, -1.2, -1.15, 0.4);
  const h = place(host, -0.45, 0.55, 0.65);
  g0.traverse((m) => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; m.frustumCulled = false; if (m.material && m.material.isMeshStandardMaterial) { m.material.metalness = 0; m.material.roughness = Math.max(0.7, m.material.roughness ?? 0.8); } } });
  if (host.animations.length) { scMixer = new THREE.AnimationMixer(h); scMixer.clipAction(host.animations[0]).play(); }
  $('hud').style.display = 'none'; $('labels').style.display = 'none'; hideTut();
  view.tx = -7.95; view.tz = -3.0; view.half = 2.3; view.yaw = Math.PI / 4; view.pitch = 0.6; placeCam();
  return g0;
}
if (new URLSearchParams(location.search).get('showcase')) setTimeout(() => startShowcase().catch((e) => console.warn(e)), 600);

window.__dbg = { renderer,  epi: { epiDay: () => epiDay(), openEpi: () => openEpi(), startCourse: (st) => startCourse(st), sendPharm: (st) => sendPharm(st), sendHome: (st) => sendHome(st), infect: (d) => infect(d), staff: () => openStaffList("all"), verdict: () => epiVerdict(), sickAtWork: () => sickAtWork() }, settle: (o, s) => settle(o, s), buildShell: (c) => buildShell(c), buildAnnexLot: () => { world.shellOwn = null; buildAnnexLot(); }, get gridRid() { return gridRid; }, get gridDoors() { return gridDoors; }, get gridBlk() { return gridBlk; }, ci, crossOK, lengthenDesk, PROBLEMS, ROOMS, CITIES, unlocked, roomCost, billInfo, get GOALS() { return GOALS; }, gameOver, billWarn, openBills, cityVictory, hemi, fill, sun, startShowcase, CHAR, GFX, person, AU, openAudio, staffCover, selectVisitor, openMgr, mgrGo, startPick, endPick, openDesk, splitQueue, roomQ, capOf, get view() { return view; }, camRot, camTilt, placeCam, snapVisitor, save, load, step, closeModal, closeSheet, get S() { return S; }, R, spawnVisitor, hire, startPlace, endPlace, placeShow, get placingR() { return placingR; }, openRoomMenu, demolish, findPath, placeValid, openHire,  startNew, startQuick, offerEmergency, spawnInspector, dropLitter, pickMess, prioMess, dropPuddle, spawnRat, setLang: (l) => { setLang(l); applyStatic(); refreshTitle(); }, pepTalk, lifeEvent, get cnt() { return S.cnt; }, isNight, renderMap, showMap, openBrief, get mapCity() { return mapCity; }, setMapCity: (c) => { mapCity = c; }, crewVisit, crewNight, crewFee, incRepair, incOf, showWrapped, openMarketing, openCreate, startEvent, endEvent, raiseRequest, startDecor, endDecor, decorTo: (x, z) => { placingD.x = x; placingD.z = z; wallSnap(placingD); decorShow(); }, decorValid, decorKeepsPaths, lotAccess, modelsReady: async (c) => { for (let i = 0; i < 150 && CHAR.status !== 'ready' && CHAR.status !== 'fallback' && CHAR.status !== 'off'; i++) await new Promise((r) => setTimeout(r, 200)); if (CHAR.status !== 'ready' || !CHAR.man || !CHAR.man.visitors) return false; await Promise.all(Object.keys(visPool(c)).concat(EXTRA_VIS, ['v25', 'v26', 'v27', 'v28', 'anims']).map((k) => loadFull(k).catch(() => null))); return true; }, /* the demo waits for every real character before anyone walks in */ gridDims: () => [GW, GH], makeGrid, get placingD() { return placingD; }, doorPt, roomRect, inFloor, openDecorMenu, startMove, endMove, moveTo: (x, z) => { moving.x = x; moving.z = z; moveShow(); }, nextSteps, openGoals, setSpeed, get MGR() { return MGR; }, renderer, scene, cam, updateLabels, updateTut, updatePep, updateHUD };
requestAnimationFrame(loop);
try { window.__dbg.dioramaView = dioramaView; } catch (e) {}
