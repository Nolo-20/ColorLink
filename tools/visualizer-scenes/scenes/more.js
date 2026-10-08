import { THREE, std, paintMat, box, cyl, sphere, plane, paintable, tex, plant, tree, rand } from '../lib.js';

// ============================================================================
// Exteriores (fachadas)
// ============================================================================
function outdoor({ sunPos = [12, 16, 10], sunTarget = [0, 0, 0], groundTex = tex.grass() } = {}) {
  const scene = new THREE.Scene();
  scene.background = tex.sky();
  scene.add(plane(120, 120, new THREE.MeshStandardMaterial({ map: groundTex, roughness: 1 }), 0, 0, 0, -Math.PI / 2));
  scene.add(new THREE.HemisphereLight(new THREE.Color('#cfe3ff'), new THREE.Color('#7c8b5a'), 0.75));
  const sun = new THREE.DirectionalLight(new THREE.Color('#fff1dc'), 3.0);
  sun.position.set(...sunPos); sun.target.position.set(...sunTarget);
  sun.castShadow = true;
  sun.shadow.mapSize.set(4096, 4096);
  sun.shadow.bias = -0.0005;
  Object.assign(sun.shadow.camera, { left: -18, right: 18, top: 18, bottom: -18, near: 1, far: 70 });
  scene.add(sun, sun.target);
  return scene;
}

function windowPane(w, h, x, y, z, ry = 0, frame = '#2b2b2d') {
  const g = new THREE.Group();
  const fm = std(frame, { roughness: 0.4, metalness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: new THREE.Color('#2c3f52'), roughness: 0.05, metalness: 0.6, envMapIntensity: 1.4 });
  g.add(box(w, h, 0.06, glass, 0, 0, 0));
  g.add(box(w + 0.1, 0.08, 0.14, fm, 0, h / 2, 0.02));
  g.add(box(w + 0.1, 0.08, 0.14, fm, 0, -h / 2, 0.02));
  g.add(box(0.08, h, 0.14, fm, -w / 2, 0, 0.02));
  g.add(box(0.08, h, 0.14, fm, w / 2, 0, 0.02));
  if (w > 1.2) g.add(box(0.05, h, 0.1, fm, 0, 0, 0.03));
  g.position.set(x, y, z); g.rotation.y = ry;
  return g;
}

export function casa_moderna() {
  const scene = outdoor({ sunPos: [-10, 14, 12] });
  const wall = paintMat();
  // Volumen principal (2 pisos) y volumen lateral (1 piso)
  scene.add(paintable(box(8, 6, 6, wall, 0, 3.1, 0)));
  scene.add(paintable(box(4.2, 3.2, 5.4, wall, 5.9, 1.7, 0.3)));
  // Zócalo de piedra y losas (no se pintan)
  const stone = new THREE.MeshStandardMaterial({ map: tex.concrete('#8d8a84', [6, 1]), roughness: 0.9 });
  scene.add(box(8.1, 0.2, 6.1, stone, 0, 0.1, 0));
  scene.add(box(4.3, 0.2, 5.5, stone, 5.9, 0.1, 0.3));
  const slab = std('#f2f1ee', { roughness: 0.7 });
  scene.add(box(8.6, 0.28, 6.6, slab, 0, 6.24, 0));
  scene.add(box(4.6, 0.24, 5.8, slab, 5.9, 3.42, 0.3));
  scene.add(box(8.2, 0.16, 0.6, slab, 0, 3.1, 3.2));
  // Revestimiento de madera vertical en la entrada (no se pinta)
  const wood = new THREE.MeshStandardMaterial({ map: tex.woodFloor(['#8b5e3c', '#7a5133', '#966644'], [1, 3]), roughness: 0.6 });
  scene.add(box(1.8, 3.0, 0.08, wood, -2.6, 1.7, 3.04));
  // Ventanas y puerta
  const fz = 3.03;
  scene.add(windowPane(2.6, 1.9, 0.9, 1.6, fz));
  scene.add(windowPane(1.6, 1.5, -2.2, 4.6, fz));
  scene.add(windowPane(2.6, 1.5, 1.3, 4.6, fz));
  scene.add(windowPane(2.4, 1.4, 5.9, 1.8, 3.03));
  scene.add(box(1.1, 2.3, 0.1, std('#3a2a1e', { roughness: 0.5 }), -2.6, 1.35, 3.1));
  scene.add(box(0.05, 0.4, 0.05, std('#c8c8c8', { metalness: 0.8, roughness: 0.3 }), -2.2, 1.3, 3.18));
  // Entrada, camino y jardín
  const paving = new THREE.MeshStandardMaterial({ map: tex.paving('#cfc8bc', [2, 6]), roughness: 0.9 });
  scene.add(box(1.6, 0.04, 7, paving, -2.6, 0.02, 6.5));
  scene.add(box(3.6, 0.04, 7, paving, 5.9, 0.02, 6.6));
  scene.add(box(2.2, 0.16, 1.0, stone, -2.6, 0.08, 3.6));
  for (const [x, z] of [[-4.6, 3.6], [1.2, 3.8], [3.0, 3.8]]) {
    scene.add(box(1.6, 0.45, 0.6, std('#6d6a64', { roughness: 0.9 }), x, 0.22, z));
    for (let i = 0; i < 6; i++) scene.add(sphere(0.22 + rand() * 0.1, std(['#3f6d2d', '#4f8236', '#335a24'][i % 3], { roughness: 0.95 }), x - 0.6 + i * 0.24, 0.6, z + (rand() - 0.5) * 0.2));
  }
  scene.add(tree(-8.5, 1.5, 1.2));
  scene.add(tree(10.5, -2, 1.4));
  scene.add(tree(-11, -6, 1.6));

  const camera = new THREE.PerspectiveCamera(42, 1.6, 0.1, 200);
  camera.position.set(4.5, 2.4, 17.5);
  camera.lookAt(2.0, 3.0, 0);
  return { scene, camera, envIntensity: 0.4, aoRadius: 1.5, exposure: 0.78 };
}

export function casa_colonial() {
  const scene = outdoor({ sunPos: [12, 15, 10] });
  const wall = paintMat();
  const W = 11, D = 7, H = 5.8;
  scene.add(paintable(box(W, H, D, wall, 0, H / 2 + 0.3, 0)));
  // Zócalo
  scene.add(box(W + 0.1, 0.6, D + 0.1, std('#6f5a4a', { roughness: 0.9 }), 0, 0.3, 0));
  // Techo de teja a dos aguas
  const roofMat = new THREE.MeshStandardMaterial({ map: tex.tiles('#b2523a', [8, 3]), roughness: 0.85 });
  const rise = 2.0, over = 0.8;
  const halfD = D / 2 + over;
  const slope = Math.hypot(halfD, rise);
  for (const side of [-1, 1]) {
    const r = box(W + 2 * over, 0.18, slope, roofMat, 0, H + 0.3 + rise / 2, side * halfD / 2);
    r.rotation.x = side * Math.atan2(rise, halfD);
    scene.add(r);
  }
  // Culatas triangulares (pintables)
  const tri = new THREE.Shape();
  tri.moveTo(-D / 2, 0); tri.lineTo(D / 2, 0); tri.lineTo(0, rise); tri.lineTo(-D / 2, 0);
  for (const sx of [-1, 1]) {
    const gm = new THREE.Mesh(new THREE.ExtrudeGeometry(tri, { depth: 0.2, bevelEnabled: false }), wall);
    gm.rotation.y = Math.PI / 2; gm.position.set(sx * (W / 2) - 0.1, H + 0.3, 0);
    gm.castShadow = true; gm.receiveShadow = true;
    scene.add(paintable(gm));
  }
  // Alero de madera
  scene.add(box(W + 2 * over, 0.12, 0.5, std('#5b3a24'), 0, H + 0.35, D / 2 + over - 0.25));
  // Puertas y ventanas de madera con marco blanco (no se pintan)
  const trim = std('#f5f2ea', { roughness: 0.6 });
  const woodDoor = std('#5a3520', { roughness: 0.55 });
  const fz = D / 2 + 0.02;
  const opening = (x, y, w, h, isDoor) => {
    scene.add(box(w + 0.36, h + 0.36, 0.08, trim, x, y, fz));
    scene.add(box(w, h, 0.1, isDoor ? woodDoor : std('#2c3e50', { roughness: 0.1, metalness: 0.5 }), x, y, fz + 0.02));
    if (!isDoor) {
      scene.add(box(w * 0.48, h, 0.06, woodDoor, x - w * 0.27, y, fz + 0.09));
      scene.add(box(w * 0.48, h, 0.06, woodDoor, x + w * 0.27, y, fz + 0.09));
      for (let i = 1; i < 5; i++) scene.add(box(w * 0.46, 0.03, 0.08, std('#4a2c1a'), x - w * 0.27, y - h / 2 + i * h / 5, fz + 0.12));
      for (let i = 1; i < 5; i++) scene.add(box(w * 0.46, 0.03, 0.08, std('#4a2c1a'), x + w * 0.27, y - h / 2 + i * h / 5, fz + 0.12));
    }
  };
  opening(0, 1.6, 1.5, 2.6, true);
  for (const x of [-3.6, 3.6]) opening(x, 1.9, 1.2, 1.6, false);
  for (const x of [-3.6, 0, 3.6]) opening(x, 4.3, 1.1, 1.4, false);
  // Balcón de madera
  scene.add(box(4.4, 0.14, 1.0, std('#5b3a24'), 0, 3.3, D / 2 + 0.5));
  scene.add(box(4.4, 0.08, 0.08, std('#5b3a24'), 0, 4.15, D / 2 + 0.96));
  for (let i = 0; i <= 16; i++) scene.add(box(0.05, 0.8, 0.05, std('#5b3a24'), -2.2 + i * 0.275, 3.75, D / 2 + 0.96));
  // Andén y matera
  scene.add(box(W + 4, 0.18, 2.4, new THREE.MeshStandardMaterial({ map: tex.paving('#b9b1a3', [8, 2]), roughness: 0.95 }), 0, 0.09, D / 2 + 1.4));
  scene.add(plant(-5.4, D / 2 + 1.0, 1.0, '#a8553a'));
  scene.add(plant(5.4, D / 2 + 1.0, 1.0, '#a8553a'));
  scene.add(tree(-10, -2, 1.3));
  scene.add(tree(9.5, -3, 1.2));
  const camera = new THREE.PerspectiveCamera(42, 1.6, 0.1, 200);
  camera.position.set(-5.2, 2.3, 16.5);
  camera.lookAt(-0.4, 3.4, 0);
  return { scene, camera, envIntensity: 0.4, aoRadius: 1.5, exposure: 0.78 };
}

export function edificio() {
  const scene = outdoor({ sunPos: [-14, 20, 14], groundTex: tex.paving('#bdb6aa', [20, 20]) });
  const wall = paintMat();
  const floors = 6, fh = 3.0, W = 16, D = 10;
  scene.add(paintable(box(W, floors * fh, D, wall, 0, floors * fh / 2 + 0.3, 0)));
  scene.add(box(W + 0.2, 3.2, D + 0.2, new THREE.MeshStandardMaterial({ map: tex.concrete('#77746e', [8, 2]), roughness: 0.85 }), 0, 1.6, 0));
  scene.add(box(W + 0.6, 0.3, D + 0.6, std('#e9e7e2'), 0, floors * fh + 0.45, 0));
  const glassRail = new THREE.MeshStandardMaterial({ color: new THREE.Color('#9fb8c8'), roughness: 0.05, metalness: 0.2, transparent: true, opacity: 0.45 });
  for (let f = 1; f < floors; f++) {
    const y = 0.3 + f * fh;
    for (const x of [-5.4, 0, 5.4]) {
      scene.add(windowPane(2.6, 2.0, x, y + 1.3, D / 2 + 0.02));
      scene.add(box(3.4, 0.16, 1.3, std('#f1efea'), x, y + 0.15, D / 2 + 0.65));
      scene.add(box(3.4, 1.0, 0.04, glassRail, x, y + 0.72, D / 2 + 1.28));
      scene.add(box(3.4, 0.05, 0.06, std('#333', { metalness: 0.6 }), x, y + 1.24, D / 2 + 1.28));
    }
  }
  // Locales en primer piso
  for (const x of [-5.4, 0, 5.4]) scene.add(windowPane(4.0, 2.4, x, 1.6, D / 2 + 0.14, 0, '#1e1e1e'));
  scene.add(tree(-11, 8, 1.3));
  scene.add(tree(11, 8.5, 1.2));
  for (const x of [-7, 7]) scene.add(plant(x, D / 2 + 1.5, 1.2, '#6d6a64'));
  const camera = new THREE.PerspectiveCamera(46, 1.6, 0.1, 200);
  camera.position.set(9, 3.2, 27);
  camera.lookAt(0, 8.5, 0);
  return { scene, camera, envIntensity: 0.4, aoRadius: 1.8, exposure: 0.8 };
}

// ============================================================================
// Interiores industriales (piso pintable)
// ============================================================================
function hall({ W = 30, D = 40, H = 9, wallColor = '#c9ccd1' } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#d5d8dc');
  const floor = new THREE.MeshStandardMaterial({ color: new THREE.Color().setRGB(0.62, 0.62, 0.62, THREE.LinearSRGBColorSpace), roughness: 0.28, metalness: 0 });
  scene.add(paintable(plane(W, D, floor, 0, 0, -D / 2 + 6, -Math.PI / 2)));
  const panel = new THREE.MeshStandardMaterial({ map: tex.stripes('#c7cbd0', '#bcc0c6', [24, 4]), roughness: 0.6, metalness: 0.2 });
  scene.add(box(W, H, 0.2, panel, 0, H / 2, -D + 6));
  scene.add(box(0.2, H, D, panel, -W / 2, H / 2, -D / 2 + 6));
  scene.add(box(0.2, H, D, panel, W / 2, H / 2, -D / 2 + 6));
  const roof = box(W, 0.3, D, std('#9aa0a8', { roughness: 0.7 }), 0, H + 0.15, -D / 2 + 6);
  roof.castShadow = false; scene.add(roof);
  // Cerchas y lámparas
  for (let z = 4; z > -D + 6; z -= 6) {
    scene.add(box(W, 0.35, 0.25, std('#5f6670', { metalness: 0.6, roughness: 0.4 }), 0, H - 0.4, z));
    for (const x of [-8, 0, 8]) {
      scene.add(cyl(0.35, 0.45, 0.25, std('#e9edf2', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 1.2 }), x, H - 1.0, z, 24));
    }
  }
  scene.add(new THREE.HemisphereLight(new THREE.Color('#f4f7ff'), new THREE.Color('#8a8d92'), 0.9));
  const top = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 1.6);
  top.position.set(4, 30, 6); top.target.position.set(0, 0, -8);
  top.castShadow = true; top.shadow.mapSize.set(2048, 2048); top.shadow.bias = -0.0006;
  Object.assign(top.shadow.camera, { left: -22, right: 22, top: 26, bottom: -26, near: 1, far: 60 });
  scene.add(top, top.target);
  return { scene, H };
}

function floorLine(scene, x, z, w, d, color = '#f2c230') {
  const m = plane(w, d, std(color, { roughness: 0.5 }), x, 0.006, z, -Math.PI / 2);
  m.castShadow = false;
  scene.add(m);
}

function rack(scene, x, z, len = 8, levels = 3) {
  const upr = std('#2f5aa8', { metalness: 0.5, roughness: 0.4 });
  const beam = std('#e8742a', { metalness: 0.4, roughness: 0.4 });
  const boxMat = [std('#c49a6c', { roughness: 0.9 }), std('#b58a5c', { roughness: 0.9 }), std('#d2aa7c', { roughness: 0.9 })];
  for (let i = 0; i <= len / 2.7; i++) for (const dz of [-0.55, 0.55]) scene.add(box(0.1, levels * 1.8 + 0.4, 0.1, upr, x - len / 2 + i * 2.7, (levels * 1.8 + 0.4) / 2, z + dz));
  for (let l = 0; l < levels; l++) {
    const y = 0.25 + l * 1.8;
    for (const dz of [-0.55, 0.55]) scene.add(box(len, 0.14, 0.08, beam, x, y, z + dz));
    for (let b = 0; b < len / 1.35 - 1; b++) {
      if (rand() < 0.15) continue;
      const bh = 0.9 + rand() * 0.6;
      scene.add(box(1.1, 0.14, 1.0, std('#8a6a48'), x - len / 2 + 0.75 + b * 1.35, y + 0.14, z));
      scene.add(box(1.0, bh, 0.95, boxMat[b % 3], x - len / 2 + 0.75 + b * 1.35, y + 0.21 + bh / 2, z));
    }
  }
}

export function bodega() {
  const { scene } = hall();
  rack(scene, -8.5, -6, 12); rack(scene, -8.5, -14, 12);
  rack(scene, 8.5, -6, 12); rack(scene, 8.5, -14, 12);
  for (const [x, z] of [[-3.2, 4], [3.2, 4], [-3.2, -4], [3.2, -4], [-3.2, -12], [3.2, -12], [-3.2, -20], [3.2, -20]]) {
    floorLine(scene, x, z - 4, 0.12, 8);
  }
  for (const z of [3, -5, -13]) floorLine(scene, 0, z, 1.2, 0.1, '#f5f5f5');
  // Columnas con protección amarilla
  for (const z of [0, -10, -20]) for (const x of [-14, 14]) {
    scene.add(box(0.5, 9, 0.5, std('#7a818b', { metalness: 0.5, roughness: 0.45 }), x, 4.5, z));
    scene.add(box(0.6, 1.0, 0.6, std('#f2c230', { roughness: 0.6 }), x, 0.5, z));
  }
  // Montacargas sencillo y estibas
  const fork = new THREE.Group();
  fork.add(box(1.2, 1.0, 2.0, std('#f0b41c', { roughness: 0.5 }), 0, 0.8, 0, 0.08));
  fork.add(box(1.0, 1.1, 0.9, std('#1d1d1f'), 0, 1.75, 0.3, 0.05));
  for (const [dx, dz] of [[-0.55, -0.6], [0.55, -0.6], [-0.55, 0.6], [0.55, 0.6]]) { const w = cyl(0.3, 0.3, 0.25, std('#111'), dx, 0.3, dz, 20); w.rotation.z = Math.PI / 2; fork.add(w); }
  fork.add(box(0.08, 2.6, 0.08, std('#333', { metalness: 0.6 }), -0.4, 1.3, -1.05));
  fork.add(box(0.08, 2.6, 0.08, std('#333', { metalness: 0.6 }), 0.4, 1.3, -1.05));
  fork.add(box(0.12, 0.06, 1.1, std('#333'), -0.3, 0.2, -1.6));
  fork.add(box(0.12, 0.06, 1.1, std('#333'), 0.3, 0.2, -1.6));
  fork.position.set(1.6, 0, -2); fork.rotation.y = 0.5;
  scene.add(fork);
  for (const [x, z] of [[-1.5, 1.5], [-1.5, 0.2]]) { scene.add(box(1.2, 0.14, 1.0, std('#8a6a48'), x, 0.07, z)); scene.add(box(1.1, 0.8, 0.95, std('#c49a6c', { roughness: 0.9 }), x, 0.54, z)); }
  const camera = new THREE.PerspectiveCamera(55, 1.6, 0.1, 200);
  camera.position.set(0.5, 2.6, 11);
  camera.lookAt(0, 1.4, -10);
  return { scene, camera, envIntensity: 0.35, aoRadius: 1.2, exposure: 0.62 };
}

export function parqueadero() {
  const { scene } = hall({ W: 26, D: 34, H: 3.2 });
  for (const z of [2, -6, -14, -22]) for (const x of [-6, 6]) {
    scene.add(box(0.6, 3.2, 0.6, std('#cfd2d6', { roughness: 0.85 }), x, 1.6, z));
    scene.add(box(0.62, 0.9, 0.62, std('#f2c230', { roughness: 0.6 }), x, 0.45, z));
    scene.add(box(0.63, 0.15, 0.63, std('#1d1d1f'), x, 0.6, z));
  }
  for (let i = 0; i < 8; i++) {
    floorLine(scene, -9 + (i % 2) * 0, 4 - i * 3.6, 5.5, 0.12, '#f5f5f5');
    floorLine(scene, 9, 4 - i * 3.6, 5.5, 0.12, '#f5f5f5');
  }
  for (let z = 4; z > -26; z -= 3.2) floorLine(scene, 0, z, 0.18, 1.6, '#f2c230');
  // Carros estacionados (siluetas simples)
  const carBody = (c) => std(c, { roughness: 0.3, metalness: 0.4 });
  for (const [x, z, c] of [[-9.5, -1.4, '#8a1c1c'], [9.5, -5, '#2a3f5f'], [-9.5, -12.2, '#d9d9d9'], [9.5, -15.8, '#1d1d1f']]) {
    const g = new THREE.Group();
    g.add(box(4.2, 0.9, 1.8, carBody(c), 0, 0.75, 0, 0.25));
    g.add(box(2.3, 0.6, 1.6, std('#1c2733', { roughness: 0.1, metalness: 0.5 }), -0.2, 1.4, 0, 0.22));
    for (const [dx, dz] of [[-1.35, -0.85], [1.35, -0.85], [-1.35, 0.85], [1.35, 0.85]]) { const w = cyl(0.36, 0.36, 0.25, std('#111'), dx, 0.36, dz, 20); w.rotation.x = Math.PI / 2; g.add(w); }
    g.position.set(x, 0, z); g.rotation.y = Math.PI / 2; scene.add(g);
  }
  const camera = new THREE.PerspectiveCamera(58, 1.6, 0.1, 200);
  camera.position.set(1.2, 1.7, 9);
  camera.lookAt(0, 1.0, -10);
  return { scene, camera, envIntensity: 0.35, aoRadius: 1.0, exposure: 0.7 };
}

export function planta() {
  const { scene } = hall({ W: 28, D: 34, H: 8 });
  const machine = (x, z, w, h, d, color) => {
    const g = new THREE.Group();
    g.add(box(w, h, d, std(color, { roughness: 0.45, metalness: 0.3 }), 0, h / 2 + 0.1, 0, 0.06));
    g.add(box(w * 0.4, h * 0.35, 0.05, std('#1b2430', { roughness: 0.2, metalness: 0.4 }), -w * 0.2, h * 0.65, d / 2 + 0.01));
    g.add(box(0.3, 0.3, 0.06, std('#2fbf71', { emissive: new THREE.Color('#2fbf71'), emissiveIntensity: 0.6 }), w * 0.25, h * 0.7, d / 2 + 0.01));
    g.add(box(w + 0.2, 0.1, d + 0.2, std('#3a3f46'), 0, 0.05, 0));
    g.position.set(x, 0, z); scene.add(g);
  };
  machine(-7, -4, 4, 2.4, 2.5, '#d9dde2');
  machine(-7, -12, 5, 3.0, 3, '#3c6fb6');
  machine(7, -6, 4.5, 2.2, 2.8, '#d9dde2');
  machine(7, -15, 3.5, 3.4, 3, '#e3a22a');
  // Pasillo peatonal demarcado
  floorLine(scene, -2.2, -8, 0.15, 30);
  floorLine(scene, 2.2, -8, 0.15, 30);
  for (let z = 4; z > -24; z -= 2) floorLine(scene, 0, z, 4.2, 0.5, '#f2c230');
  scene.add(box(0.06, 1.1, 10, std('#f2c230', { roughness: 0.5 }), -4.5, 0.55, -2));
  for (let i = 0; i < 6; i++) scene.add(box(0.08, 1.1, 0.08, std('#f2c230'), -4.5, 0.55, 3 - i * 2));
  const camera = new THREE.PerspectiveCamera(55, 1.6, 0.1, 200);
  camera.position.set(1.0, 2.4, 10.5);
  camera.lookAt(0, 1.2, -10);
  return { scene, camera, envIntensity: 0.35, aoRadius: 1.2, exposure: 0.62 };
}

// ============================================================================
// Automotriz (carrocería pintable)
// ============================================================================
function carModel() {
  const car = new THREE.Group();
  const paint = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color().setRGB(0.62, 0.62, 0.62, THREE.LinearSRGBColorSpace),
    roughness: 0.32, metalness: 0.15, clearcoat: 1, clearcoatRoughness: 0.06
  });
  const glass = new THREE.MeshPhysicalMaterial({ color: new THREE.Color('#0f1720'), roughness: 0.04, metalness: 0.3, clearcoat: 1 });
  const black = std('#151515', { roughness: 0.6 });
  const chrome = std('#d6d9de', { metalness: 1, roughness: 0.15 });

  // Perfil lateral de la carrocería baja (x = largo, y = alto)
  const s = new THREE.Shape();
  s.moveTo(-2.3, 0.32);
  s.lineTo(2.18, 0.32);
  s.quadraticCurveTo(2.42, 0.36, 2.4, 0.62);
  s.quadraticCurveTo(2.36, 0.8, 2.0, 0.86);
  s.lineTo(0.7, 0.98);
  s.lineTo(-1.6, 1.0);
  s.quadraticCurveTo(-2.25, 0.98, -2.32, 0.78);
  s.lineTo(-2.36, 0.45);
  s.quadraticCurveTo(-2.36, 0.32, -2.3, 0.32);
  const bodyGeo = new THREE.ExtrudeGeometry(s, { depth: 1.62, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.08, bevelSegments: 6, curveSegments: 24 });
  bodyGeo.translate(0, 0, -0.81);
  const body = new THREE.Mesh(bodyGeo, paint); body.castShadow = true; body.receiveShadow = true;
  car.add(paintable(body));

  // Cabina (techo y pilares pintables)
  const c = new THREE.Shape();
  c.moveTo(0.75, 0.96);
  c.quadraticCurveTo(0.2, 1.36, -0.25, 1.42);
  c.lineTo(-1.05, 1.42);
  c.quadraticCurveTo(-1.55, 1.38, -1.75, 0.98);
  c.lineTo(0.75, 0.96);
  const cabGeo = new THREE.ExtrudeGeometry(c, { depth: 1.34, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 6, curveSegments: 24 });
  cabGeo.translate(0, 0, -0.67);
  const cab = new THREE.Mesh(cabGeo, paint); cab.castShadow = true;
  car.add(paintable(cab));

  // Vidrios laterales (ligeramente por fuera de la cabina)
  const w = new THREE.Shape();
  w.moveTo(0.62, 1.0);
  w.quadraticCurveTo(0.15, 1.3, -0.25, 1.34);
  w.lineTo(-1.0, 1.34);
  w.quadraticCurveTo(-1.4, 1.3, -1.6, 1.02);
  w.lineTo(0.62, 1.0);
  for (const side of [-1, 1]) {
    const wg = new THREE.ShapeGeometry(w, 20);
    const wm = new THREE.Mesh(wg, glass);
    wm.position.z = side * 0.76; if (side < 0) wm.rotation.y = Math.PI, wm.scale.x = -1;
    car.add(wm);
    // Pilar B
    car.add(paintable(box(0.08, 0.36, 0.02, paint, -0.42, 1.17, side * 0.77)));
  }
  // Parabrisas y vidrio trasero
  const ws = box(0.025, 0.88, 1.28, glass, 0.34, 1.25, 0); ws.rotation.z = 1.14; car.add(ws);
  const rw = box(0.025, 0.66, 1.26, glass, -1.44, 1.25, 0); rw.rotation.z = -1.01; car.add(rw);

  // Ruedas
  for (const [x, z] of [[1.45, 0.86], [-1.45, 0.86], [1.45, -0.86], [-1.45, -0.86]]) {
    const g = new THREE.Group();
    const tire = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.11, 18, 48), std('#121212', { roughness: 0.85 }));
    g.add(tire);
    const rim = cyl(0.27, 0.27, 0.2, chrome, 0, 0, 0, 40); rim.rotation.x = Math.PI / 2; g.add(rim);
    const hub = cyl(0.21, 0.21, 0.22, std('#2a2c30', { metalness: 0.6, roughness: 0.4 }), 0, 0, 0, 40); hub.rotation.x = Math.PI / 2; g.add(hub);
    for (let i = 0; i < 5; i++) { const sp = box(0.06, 0.4, 0.04, chrome, 0, 0, 0.11 * Math.sign(z)); sp.rotation.z = i * Math.PI * 2 / 5; g.add(sp); }
    g.position.set(x, 0.4, z * 1.0);
    car.add(g);
    // Pasarrueda oscuro
    const arch = cyl(0.44, 0.44, 0.06, black, x, 0.42, z * 0.98, 40); arch.rotation.x = Math.PI / 2; car.add(arch);
  }
  // Luces, parrilla, manijas y espejos
  car.add(box(0.06, 0.12, 0.42, std('#f4f6f8', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.4, roughness: 0.1 }), 2.47, 0.7, 0.56));
  car.add(box(0.06, 0.12, 0.42, std('#f4f6f8', { emissive: new THREE.Color('#ffffff'), emissiveIntensity: 0.4, roughness: 0.1 }), 2.47, 0.7, -0.56));
  car.add(box(0.06, 0.16, 0.7, black, 2.5, 0.52, 0));
  car.add(box(0.06, 0.1, 0.5, std('#a3121a', { emissive: new THREE.Color('#7a0a10'), emissiveIntensity: 0.5, roughness: 0.2 }), -2.45, 0.85, 0.52));
  car.add(box(0.06, 0.1, 0.5, std('#a3121a', { emissive: new THREE.Color('#7a0a10'), emissiveIntensity: 0.5, roughness: 0.2 }), -2.45, 0.85, -0.52));
  for (const side of [-1, 1]) {
    car.add(box(0.18, 0.04, 0.03, chrome, 0.1, 0.92, side * 0.92));
    car.add(box(0.18, 0.04, 0.03, chrome, -1.0, 0.92, side * 0.92));
    const mir = box(0.16, 0.1, 0.18, paint, 0.62, 1.04, side * 0.98, 0.03); car.add(paintable(mir));
    car.add(box(0.5, 0.1, 0.03, black, 2.2, 0.38, side * 0.9));
  }
  return car;
}

function studio({ floorColor = '#e8e9ec', bg = '#dfe2e7' } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(bg);
  const floor = plane(80, 80, new THREE.MeshStandardMaterial({ color: new THREE.Color(floorColor), roughness: 0.35, metalness: 0 }), 0, 0, 0, -Math.PI / 2);
  scene.add(floor);
  // Fondo curvo (cyclorama)
  const cyc = new THREE.Mesh(new THREE.CylinderGeometry(14, 14, 16, 64, 1, true, Math.PI * 0.65, Math.PI * 0.7), new THREE.MeshStandardMaterial({ color: new THREE.Color(bg), roughness: 0.9, side: THREE.BackSide }));
  cyc.position.set(0, 8, 0); scene.add(cyc);
  scene.add(new THREE.HemisphereLight(new THREE.Color('#ffffff'), new THREE.Color('#9a9da3'), 0.8));
  const key = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 2.2);
  key.position.set(4, 9, 6); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005;
  Object.assign(key.shadow.camera, { left: -5, right: 5, top: 5, bottom: -5, near: 1, far: 30 });
  scene.add(key);
  const rim = new THREE.DirectionalLight(new THREE.Color('#dfe8ff'), 1.0);
  rim.position.set(-6, 4, -5); scene.add(rim);
  // Paneles de luz (dan los reflejos alargados en la pintura)
  for (const [x, z] of [[0, 3.5], [0, -3.5]]) {
    const p = plane(6, 1.2, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff') }), x, 5.5, z, Math.PI / 2);
    p.castShadow = false; scene.add(p);
  }
  return scene;
}

export function carro_lateral() {
  const scene = studio();
  const car = carModel(); scene.add(car);
  const camera = new THREE.PerspectiveCamera(27, 1.6, 0.1, 100);
  camera.position.set(1.6, 1.15, 9.6);
  camera.lookAt(0, 0.85, 0);
  return { scene, camera, envIntensity: 0.9, aoRadius: 0.6, exposure: 0.62 };
}

export function carro_exterior() {
  const scene = outdoor({ sunPos: [8, 14, 10], groundTex: tex.paving('#b8b2a7', [24, 24]) });
  // Casa de fondo y árboles
  scene.add(box(14, 6, 4, std('#e7e1d6', { roughness: 0.9 }), -1, 3, -9));
  scene.add(box(14.6, 0.3, 4.6, std('#9a9389'), -1, 6.1, -9));
  for (const x of [-5, -1, 3]) scene.add(windowPane(2, 1.6, x, 3.6, -6.95));
  scene.add(tree(-9, -6, 1.3)); scene.add(tree(8, -7, 1.5));
  for (let i = 0; i < 6; i++) scene.add(box(1.4, 0.7, 0.8, std('#4b7c35', { roughness: 0.95 }), -6 + i * 2.2, 0.35, -6.4, 0.3));
  const car = carModel(); car.rotation.y = -0.28; scene.add(car);
  const camera = new THREE.PerspectiveCamera(34, 1.6, 0.1, 200);
  camera.position.set(3.2, 1.6, 10.5);
  camera.lookAt(0.0, 1.2, -1);
  return { scene, camera, envIntensity: 0.6, aoRadius: 0.8, exposure: 0.72 };
}

export function carro_garaje() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#2b2f36');
  scene.add(plane(40, 40, new THREE.MeshStandardMaterial({ map: tex.concrete('#6d6f73', [6, 6]), roughness: 0.55 }), 0, 0, 0, -Math.PI / 2));
  const panel = new THREE.MeshStandardMaterial({ map: tex.stripes('#4b5059', '#454a52', [10, 2]), roughness: 0.6, metalness: 0.3 });
  scene.add(box(20, 6, 0.2, panel, 0, 3, -4));
  scene.add(box(0.2, 6, 14, panel, -8, 3, 2));
  for (const x of [-3, 0, 3]) {
    const l = plane(2.2, 0.25, new THREE.MeshBasicMaterial({ color: new THREE.Color('#ffffff') }), x, 4.4, 0.5, Math.PI / 2); l.castShadow = false; scene.add(l);
  }
  // Repisa con herramientas y llantas
  scene.add(box(4, 0.08, 0.6, std('#30343b', { metalness: 0.6 }), 4, 1.5, -3.6));
  scene.add(box(4, 0.08, 0.6, std('#30343b', { metalness: 0.6 }), 4, 2.4, -3.6));
  for (let i = 0; i < 4; i++) scene.add(cyl(0.18, 0.18, 0.35, std(['#c0392b', '#2c3e50', '#d4a017', '#7f8c8d'][i]), 2.6 + i * 0.9, 1.72, -3.6, 20));
  for (let i = 0; i < 3; i++) { const t = new THREE.Mesh(new THREE.TorusGeometry(0.32, 0.12, 14, 32), std('#151515', { roughness: 0.8 })); t.position.set(-6.5, 0.12 + i * 0.25, -2.6); t.rotation.x = Math.PI / 2; t.castShadow = true; scene.add(t); }
  scene.add(new THREE.HemisphereLight(new THREE.Color('#e6ecf5'), new THREE.Color('#3a3d42'), 0.9));
  const key = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 2.0);
  key.position.set(1, 9, 3); key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0005;
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 1, far: 30 });
  scene.add(key);
  const car = carModel(); car.rotation.y = 0.35; scene.add(car);
  const camera = new THREE.PerspectiveCamera(36, 1.6, 0.1, 100);
  camera.position.set(-2.4, 1.7, 7.6);
  camera.lookAt(0.3, 0.75, 0);
  return { scene, camera, envIntensity: 0.8, aoRadius: 0.7, exposure: 0.7 };
}
