import { THREE, std, paintMat, box, cyl, sphere, plane, paintable, tex, plant, frameArt, rand } from '../lib.js';

// Cuarto genérico: paredes trasera e izquierda pintables, ventana en la pared izquierda
function room({ width = 8, depth = 7, height = 2.8, windowZ = [-1.6, 0.6], windowY = [0.85, 2.35], floor = tex.woodFloor(undefined, [6, 6]), sun = true } = {}) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#f2efe9');
  const hw = width / 2, back = -3;
  const wallMat = paintMat();

  // Piso
  const fl = plane(width + 2, depth + 4, new THREE.MeshStandardMaterial({ map: floor, roughness: 0.55 }), 0, 0, back + (depth + 4) / 2 - 0.5, -Math.PI / 2);
  scene.add(fl);
  // Techo (blanco, no se pinta)
  const ceil = box(width + 2, 0.2, depth + 4, std('#f7f6f3', { roughness: 0.95 }), 0, height + 0.1, back + (depth + 4) / 2 - 0.5);
  ceil.castShadow = false; // deja pasar la luz cenital que simula la luz difusa del cuarto
  scene.add(ceil);

  // Pared trasera (pintable)
  const backWall = box(width + 0.4, height, 0.2, wallMat, 0, height / 2, back - 0.1);
  scene.add(paintable(backWall));

  // Pared izquierda con hueco de ventana (pintable)
  const lx = -hw - 0.1;
  const [wz0, wz1] = windowZ, [wy0, wy1] = windowY;
  const zFront = back + depth;
  const parts = [
    // [zMin, zMax, yMin, yMax]
    [back, wz0, 0, height],
    [wz1, zFront, 0, height],
    [wz0, wz1, 0, wy0],
    [wz0, wz1, wy1, height]
  ];
  for (const [z0, z1, y0, y1] of parts) {
    const m = box(0.2, y1 - y0, z1 - z0, wallMat, lx, (y0 + y1) / 2, (z0 + z1) / 2);
    scene.add(paintable(m));
  }
  // Marco y vidrio de la ventana
  const frameMat = std('#f3f2ee', { roughness: 0.5 });
  scene.add(box(0.24, 0.06, wz1 - wz0 + 0.12, frameMat, lx, wy0 - 0.03, (wz0 + wz1) / 2));
  scene.add(box(0.24, 0.06, wz1 - wz0 + 0.12, frameMat, lx, wy1 + 0.03, (wz0 + wz1) / 2));
  scene.add(box(0.24, wy1 - wy0 + 0.12, 0.06, frameMat, lx, (wy0 + wy1) / 2, wz0 - 0.03));
  scene.add(box(0.24, wy1 - wy0 + 0.12, 0.06, frameMat, lx, (wy0 + wy1) / 2, wz1 + 0.03));
  scene.add(box(0.08, wy1 - wy0, 0.04, frameMat, lx, (wy0 + wy1) / 2, (wz0 + wz1) / 2));
  // Vista exterior luminosa
  const outside = plane(14, 9, new THREE.MeshStandardMaterial({ color: 0x000000, emissive: new THREE.Color('#eef4fa'), emissiveIntensity: 2.2 }), lx - 3, 2, 0, 0, Math.PI / 2);
  outside.castShadow = false;
  scene.add(outside);

  // Paredes derecha y frontal (fuera de cámara) para cerrar el cuarto
  scene.add(paintable(box(0.2, height, depth + 1, wallMat, hw + 0.1, height / 2, back + depth / 2)));
  scene.add(box(width + 0.4, height, 0.2, std('#f1efea'), 0, height / 2, back + depth + 0.1));
  const lampC = new THREE.PointLight(new THREE.Color('#fff4e6'), 0.0, 6, 2); scene.add(lampC);

  // Guardaescobas blancos (no se pintan)
  const base = std('#f4f3ef', { roughness: 0.5 });
  scene.add(box(width + 0.4, 0.1, 0.03, base, 0, 0.05, back + 0.015));
  scene.add(box(0.03, 0.1, depth, base, -hw + 0.015, 0.05, back + depth / 2));

  // Luz
  scene.add(new THREE.HemisphereLight(new THREE.Color('#fbf7f0'), new THREE.Color('#b9a58e'), 0.22));
  if (sun) {
    const s = new THREE.DirectionalLight(new THREE.Color('#fff0d8'), 3.2);
    const wc = new THREE.Vector3(-hw, (windowY[0] + windowY[1]) / 2, (windowZ[0] + windowZ[1]) / 2);
    const tgt = new THREE.Vector3(-hw + 2.6, 0, wc.z + 1.0);
    const dir = tgt.clone().sub(wc);
    s.position.copy(wc.clone().sub(dir.multiplyScalar(3.5)));
    s.target.position.copy(tgt);
    s.castShadow = true;
    s.shadow.mapSize.set(4096, 4096);
    s.shadow.radius = 14;
    s.shadow.blurSamples = 24;
    s.shadow.bias = -0.0006;
    Object.assign(s.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8, near: 0.5, far: 30 });
    scene.add(s, s.target);
  }
  // Luz cenital suave: sombras de contacto bajo los muebles
  const top = new THREE.DirectionalLight(new THREE.Color('#fffaf2'), 1.1);
  top.position.set(0.5, 12, back + 3);
  top.target.position.set(0.5, 0, back + 2);
  top.castShadow = true;
  top.shadow.mapSize.set(512, 512);
  top.shadow.radius = 26; top.shadow.blurSamples = 25; top.shadow.bias = -0.0008;
  Object.assign(top.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 20 });
  scene.add(top, top.target);
  // Rebote cálido del piso (simula luz indirecta)
  const bounce = new THREE.PointLight(new THREE.Color('#ffe7cc'), 0.8, 9, 1.6);
  bounce.position.set(0, 0.4, back + 2.5);
  scene.add(bounce);
  // Relleno suave desde la cámara
  const fill = new THREE.DirectionalLight(new THREE.Color('#ffffff'), 0.35);
  fill.position.set(2, 3, 8);
  scene.add(fill);
  return { scene, back, hw, height };
}

function sofa(x, z, w = 2.4, fabricColor = '#b9b3a8') {
  const g = new THREE.Group();
  const fab = new THREE.MeshStandardMaterial({ map: tex.fabric(fabricColor), roughness: 0.95 });
  const leg = std('#2b2622', { roughness: 0.4, metalness: 0.3 });
  g.add(box(w, 0.36, 0.95, fab, 0, 0.3, 0, 0.06));
  g.add(box(w, 0.55, 0.26, fab, 0, 0.66, -0.36, 0.08));
  g.add(box(0.22, 0.58, 0.95, fab, -w / 2 + 0.11, 0.42, 0, 0.08));
  g.add(box(0.22, 0.58, 0.95, fab, w / 2 - 0.11, 0.42, 0, 0.08));
  const cw = (w - 0.44) / 2;
  g.add(box(cw - 0.02, 0.14, 0.72, fab, -cw / 2, 0.54, 0.08, 0.06));
  g.add(box(cw - 0.02, 0.14, 0.72, fab, cw / 2, 0.54, 0.08, 0.06));
  const pil1 = box(0.48, 0.42, 0.14, new THREE.MeshStandardMaterial({ map: tex.fabric('#d9cbb2'), roughness: 0.95 }), -w / 2 + 0.5, 0.78, -0.2, 0.07);
  pil1.rotation.set(-0.15, 0.25, 0.08); g.add(pil1);
  const pil2 = box(0.45, 0.4, 0.14, new THREE.MeshStandardMaterial({ map: tex.fabric('#6f7d6a'), roughness: 0.95 }), w / 2 - 0.5, 0.78, -0.2, 0.07);
  pil2.rotation.set(-0.15, -0.3, -0.06); g.add(pil2);
  for (const lx of [-w / 2 + 0.12, w / 2 - 0.12]) for (const lz of [-0.38, 0.38]) g.add(cyl(0.025, 0.02, 0.12, leg, lx, 0.06, lz, 10));
  g.position.set(x, 0, z);
  return g;
}

export function sala() {
  const { scene, back } = room();
  scene.add(sofa(0.4, back + 0.62));
  // Mesa de centro redonda
  const wood = std('#a57a52', { roughness: 0.45 });
  scene.add(cyl(0.58, 0.58, 0.05, wood, 0.4, 0.42, back + 2.0));
  scene.add(cyl(0.42, 0.42, 0.03, wood, 0.4, 0.14, back + 2.0));
  for (let i = 0; i < 3; i++) { const a = i * 2.1; scene.add(cyl(0.02, 0.02, 0.4, std('#2b2622', { metalness: 0.4, roughness: 0.4 }), 0.4 + Math.cos(a) * 0.4, 0.21, back + 2.0 + Math.sin(a) * 0.4, 8)); }
  scene.add(box(0.32, 0.05, 0.24, std('#e9e3d6'), 0.25, 0.47, back + 1.95));
  scene.add(box(0.28, 0.04, 0.2, std('#3e5a6b'), 0.27, 0.51, back + 1.95));
  scene.add(cyl(0.06, 0.05, 0.16, std('#d8d2c6', { roughness: 0.3 }), 0.6, 0.53, back + 2.1));
  // Tapete
  scene.add(plane(3.4, 2.4, new THREE.MeshStandardMaterial({ map: tex.rug('#e3d9c6', '#a99375'), roughness: 1 }), 0.4, 0.006, back + 1.7, -Math.PI / 2));
  // Lámpara de pie
  const metal = std('#222', { metalness: 0.6, roughness: 0.35 });
  scene.add(cyl(0.16, 0.18, 0.03, metal, 2.15, 0.015, back + 0.45));
  scene.add(cyl(0.015, 0.015, 1.55, metal, 2.15, 0.8, back + 0.45, 8));
  const shade = cyl(0.2, 0.26, 0.32, std('#efe8da', { roughness: 0.9, side: THREE.DoubleSide }), 2.15, 1.7, back + 0.45, 32, true);
  scene.add(shade);
  const bulb = new THREE.PointLight(new THREE.Color('#ffd9a3'), 1.2, 3.5, 2);
  bulb.position.set(2.15, 1.62, back + 0.45); scene.add(bulb);
  // Mesa auxiliar
  scene.add(cyl(0.24, 0.24, 0.03, std('#8a6644', { roughness: 0.4 }), -1.35, 0.55, back + 0.5));
  scene.add(cyl(0.03, 0.03, 0.55, metal, -1.35, 0.27, back + 0.5, 8));
  scene.add(cyl(0.07, 0.09, 0.22, std('#c9b9a2', { roughness: 0.5 }), -1.35, 0.68, back + 0.5));
  // Cuadros
  scene.add(frameArt(0.7, 0.9, ['#e9dfcf', '#c98b5d', '#5b6f63', '#d6b98f'], -0.15, 1.75, back + 0.02));
  scene.add(frameArt(0.7, 0.9, ['#e8e4dc', '#3f5466', '#b9a07c', '#8a9c8c'], 0.95, 1.75, back + 0.02));
  // Plantas
  scene.add(plant(-3.15, back + 0.55, 1.05, '#d8cbb8'));
  scene.add(plant(3.2, back + 0.5, 0.8, '#f0ede6'));

  const camera = new THREE.PerspectiveCamera(48, 1.6, 0.1, 100);
  camera.position.set(1.1, 1.35, back + 6.6);
  camera.lookAt(-0.35, 1.15, back);
  return { scene, camera, envIntensity: 0.32, exposure: 1.35, skyGain: 1.6 };
}

export function dormitorio() {
  const { scene, back } = room({ windowZ: [-1.2, 0.9] });
  const fab = (c) => new THREE.MeshStandardMaterial({ map: tex.fabric(c), roughness: 0.95 });
  const wood = std('#8c6a4c', { roughness: 0.5 });
  const bx = 0.5, bz = back + 1.25;
  // Cabecera tapizada + cama
  scene.add(box(2.1, 1.25, 0.12, fab('#cfc6b6'), bx, 0.63, back + 0.08, 0.05));
  scene.add(box(1.9, 0.32, 2.15, wood, bx, 0.2, bz, 0.03));
  scene.add(box(1.86, 0.24, 2.05, fab('#f4f2ee'), bx, 0.47, bz, 0.08));
  const duvet = box(1.94, 0.14, 1.45, fab('#e6e1d7'), bx, 0.62, bz + 0.33, 0.07);
  scene.add(duvet);
  scene.add(box(1.96, 0.05, 0.55, fab('#8fa18a'), bx, 0.7, bz + 0.85, 0.02));
  for (const px of [-0.45, 0.45]) { const p = box(0.62, 0.22, 0.42, fab('#faf8f4'), bx + px, 0.72, back + 0.45, 0.09); p.rotation.x = -0.35; scene.add(p); }
  const cush = box(0.5, 0.36, 0.13, fab('#c8a77e'), bx, 0.8, back + 0.62, 0.06); cush.rotation.x = -0.3; scene.add(cush);
  // Mesas de noche y lámparas
  for (const sx of [-1.45, 1.45]) {
    scene.add(box(0.5, 0.5, 0.42, wood, bx + sx, 0.25, back + 0.3, 0.02));
    scene.add(box(0.44, 0.015, 0.36, std('#2a2a2a'), bx + sx, 0.33, back + 0.51));
    scene.add(cyl(0.08, 0.1, 0.32, std('#d9d0c2', { roughness: 0.4 }), bx + sx, 0.66, back + 0.3));
    scene.add(cyl(0.16, 0.2, 0.24, std('#f2ece0', { side: THREE.DoubleSide }), bx + sx, 0.94, back + 0.3, 32, true));
    const l = new THREE.PointLight(new THREE.Color('#ffd7a0'), 0.7, 2.5, 2); l.position.set(bx + sx, 0.92, back + 0.3); scene.add(l);
  }
  scene.add(frameArt(1.2, 0.7, ['#ece6db', '#b98b67', '#6e8073', '#d9c4a4'], bx, 1.72, back + 0.02));
  scene.add(plane(2.8, 2.0, new THREE.MeshStandardMaterial({ map: tex.rug('#d9d2c4', '#8f8170'), roughness: 1 }), bx, 0.006, bz + 0.6, -Math.PI / 2));
  scene.add(plant(2.75, back + 0.5, 0.9));
  // Banca al pie de la cama
  scene.add(box(1.3, 0.12, 0.42, fab('#9a8670'), bx, 0.45, bz + 1.35, 0.05));
  for (const lx of [-0.55, 0.55]) scene.add(cyl(0.02, 0.02, 0.4, std('#222', { metalness: 0.5 }), bx + lx, 0.2, bz + 1.35, 8));

  const camera = new THREE.PerspectiveCamera(50, 1.6, 0.1, 100);
  camera.position.set(1.6, 1.4, back + 5.6);
  camera.lookAt(0.0, 1.0, back);
  return { scene, camera, envIntensity: 0.32, exposure: 1.35, skyGain: 1.6 };
}

export function comedor() {
  const { scene, back } = room({ windowZ: [-1.4, 0.8], floor: tex.woodFloor(['#c9a27a', '#b88f66', '#d3ad86', '#bf9870'], [6, 6]) });
  const wood = std('#7b5a3e', { roughness: 0.45 });
  const tz = back + 1.7;
  // Mesa
  scene.add(box(2.0, 0.05, 0.95, wood, 0.3, 0.75, tz, 0.01));
  for (const lx of [-0.9, 0.9]) for (const lz of [-0.4, 0.4]) scene.add(box(0.06, 0.73, 0.06, wood, 0.3 + lx, 0.365, tz + lz));
  // Sillas
  const seat = std('#d9cfbf', { roughness: 0.9 });
  const chair = (x, z, ry) => {
    const g = new THREE.Group();
    g.add(box(0.44, 0.05, 0.44, seat, 0, 0.46, 0, 0.02));
    g.add(box(0.44, 0.45, 0.04, wood, 0, 0.72, -0.2, 0.01));
    for (const lx of [-0.19, 0.19]) for (const lz of [-0.19, 0.19]) g.add(box(0.035, 0.46, 0.035, wood, lx, 0.23, lz));
    g.position.set(x, 0, z); g.rotation.y = ry; return g;
  };
  for (const cx of [-0.3, 0.9]) { scene.add(chair(cx, tz - 0.7, 0)); scene.add(chair(cx, tz + 0.7, Math.PI)); }
  // Lámparas colgantes
  for (const lx of [-0.2, 0.8]) {
    scene.add(cyl(0.004, 0.004, 1.0, std('#111'), lx, 2.3, tz, 6));
    scene.add(cyl(0.05, 0.22, 0.2, std('#1f1f1f', { metalness: 0.5, roughness: 0.35, side: THREE.DoubleSide }), lx, 1.72, tz, 32, true));
    const l = new THREE.PointLight(new THREE.Color('#ffd9a8'), 1.0, 3, 2); l.position.set(lx, 1.6, tz); scene.add(l);
  }
  // Vajilla y florero
  scene.add(cyl(0.08, 0.06, 0.24, std('#e9e4da', { roughness: 0.3 }), 0.3, 0.9, tz));
  for (let i = 0; i < 7; i++) scene.add(sphere(0.035, std(['#e6b9a6', '#f2e6d0', '#c98a6e'][i % 3]), 0.3 + (rand() - 0.5) * 0.12, 1.05 + rand() * 0.08, tz + (rand() - 0.5) * 0.12));
  for (const px of [-0.3, 0.9]) for (const pz of [-0.28, 0.28]) scene.add(cyl(0.12, 0.12, 0.012, std('#f7f5f0', { roughness: 0.25 }), 0.3 + px - 0.3 + (px > 0 ? 0 : 0), 0.78, tz + pz, 32));
  // Aparador
  scene.add(box(1.8, 0.75, 0.42, std('#e8e2d8', { roughness: 0.6 }), 2.4, 0.42, back + 0.22, 0.02));
  scene.add(box(1.8, 0.04, 0.44, wood, 2.4, 0.81, back + 0.22));
  scene.add(cyl(0.1, 0.12, 0.34, std('#b98a63', { roughness: 0.5 }), 2.0, 1.0, back + 0.22));
  scene.add(frameArt(1.0, 0.75, ['#efe9de', '#a6765a', '#56695b', '#d7bf9a'], 2.4, 1.6, back + 0.02));
  scene.add(frameArt(0.55, 0.75, ['#e8e1d4', '#3f5466', '#c6a47a'], 0.3, 1.65, back + 0.02));
  scene.add(plant(-2.9, back + 0.55, 1.1, '#cbbba5'));

  const camera = new THREE.PerspectiveCamera(48, 1.6, 0.1, 100);
  camera.position.set(1.2, 1.45, back + 6.2);
  camera.lookAt(0.2, 1.05, back);
  return { scene, camera, envIntensity: 0.32, exposure: 1.35, skyGain: 1.6 };
}
