import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { GTAOPass } from 'three/examples/jsm/postprocessing/GTAOPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';
import { WebGLPathTracer } from 'three-gpu-pathtracer';

export { THREE };

// Albedo lineal de las superficies pintables en el render base (el visualizador lo usa para recolorear)
export const PAINT_ALBEDO = 0.62;

// ---------------------------------------------------------------- utilidades
let seed = 12345;
export const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const resetRand = (s = 12345) => { seed = s; };

export const lin = (hex) => new THREE.Color(hex); // three convierte hex sRGB a lineal

export function std(color, opts = {}) {
  return new THREE.MeshStandardMaterial({ color: lin(color), roughness: 0.75, metalness: 0, ...opts });
}

export function paintMat() {
  const c = new THREE.Color().setRGB(PAINT_ALBEDO, PAINT_ALBEDO, PAINT_ALBEDO, THREE.LinearSRGBColorSpace);
  return new THREE.MeshStandardMaterial({ color: c, roughness: 0.92, metalness: 0 });
}

export function box(w, h, d, mat, x = 0, y = 0, z = 0, r = 0) {
  const g = r > 0 ? new RoundedBoxGeometry(w, h, d, 4, r) : new THREE.BoxGeometry(w, h, d);
  const m = new THREE.Mesh(g, mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

export function cyl(rt, rb, h, mat, x = 0, y = 0, z = 0, seg = 40, open = false) {
  const m = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg, 1, open), mat);
  m.position.set(x, y, z);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

export function sphere(r, mat, x = 0, y = 0, z = 0, sx = 1, sy = 1, sz = 1) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16), mat);
  m.position.set(x, y, z); m.scale.set(sx, sy, sz);
  m.castShadow = true; m.receiveShadow = true;
  return m;
}

export function plane(w, h, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, 0);
  m.receiveShadow = true; m.castShadow = true;
  return m;
}

/** Marca un objeto (y sus hijos) como superficie pintable. */
export function paintable(obj) {
  obj.traverse(o => { if (o.isMesh) o.userData.paint = true; });
  return obj;
}

// ---------------------------------------------------------------- texturas procedurales
function canvasTex(w, h, draw, repeat = [1, 1], srgb = true) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.repeat.set(repeat[0], repeat[1]);
  t.anisotropy = 8;
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function noiseFill(ctx, w, h, base, amp, size = 1) {
  ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
  for (let i = 0; i < (w * h) / (size * size * 2); i++) {
    const v = (rand() - 0.5) * amp;
    ctx.fillStyle = v > 0 ? `rgba(255,255,255,${v})` : `rgba(0,0,0,${-v})`;
    ctx.fillRect(rand() * w, rand() * h, size, size);
  }
}

export const tex = {
  woodFloor: (tone = ['#b07a4a', '#9a6538', '#c08a57', '#a56f40'], repeat = [3, 3]) => canvasTex(1024, 1024, (ctx, w, h) => {
    const plankH = h / 8;
    for (let i = 0; i < 8; i++) {
      let x = -rand() * w;
      while (x < w) {
        const len = w * (0.45 + rand() * 0.4);
        ctx.fillStyle = tone[Math.floor(rand() * tone.length)];
        ctx.fillRect(x, i * plankH, len, plankH);
        for (let k = 0; k < 40; k++) { // vetas
          ctx.strokeStyle = `rgba(60,30,10,${0.05 + rand() * 0.08})`;
          ctx.lineWidth = 1 + rand() * 1.5;
          const yy = i * plankH + rand() * plankH;
          ctx.beginPath(); ctx.moveTo(x, yy);
          ctx.bezierCurveTo(x + len * 0.3, yy + (rand() - 0.5) * 6, x + len * 0.6, yy + (rand() - 0.5) * 6, x + len, yy + (rand() - 0.5) * 4);
          ctx.stroke();
        }
        ctx.fillStyle = 'rgba(40,20,5,0.55)';
        ctx.fillRect(x, i * plankH, 2, plankH);
        x += len;
      }
      ctx.fillStyle = 'rgba(40,20,5,0.5)';
      ctx.fillRect(0, i * plankH, w, 2);
    }
  }, repeat),
  fabric: (base, repeat = [4, 4]) => canvasTex(256, 256, (ctx, w, h) => {
    noiseFill(ctx, w, h, base, 0.12, 1);
    for (let y = 0; y < h; y += 2) { ctx.fillStyle = 'rgba(0,0,0,0.03)'; ctx.fillRect(0, y, w, 1); }
  }, repeat),
  rug: (bg, line, repeat = [1, 1]) => canvasTex(1024, 768, (ctx, w, h) => {
    noiseFill(ctx, w, h, bg, 0.1, 2);
    ctx.strokeStyle = line; ctx.lineWidth = 14; ctx.strokeRect(40, 40, w - 80, h - 80);
    ctx.lineWidth = 4; ctx.strokeRect(80, 80, w - 160, h - 160);
    ctx.globalAlpha = 0.35;
    for (let i = 0; i < 14; i++) { ctx.beginPath(); ctx.moveTo(120 + i * 60, 120); ctx.lineTo(120 + i * 60 + 80, h - 120); ctx.stroke(); }
    ctx.globalAlpha = 1;
  }, repeat),
  art: (colors) => canvasTex(512, 640, (ctx, w, h) => {
    ctx.fillStyle = colors[0]; ctx.fillRect(0, 0, w, h);
    for (let i = 1; i < colors.length; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      ctx.ellipse(w * (0.2 + rand() * 0.6), h * (0.2 + rand() * 0.6), w * (0.15 + rand() * 0.3), h * (0.1 + rand() * 0.25), rand() * 3, 0, Math.PI * 2);
      ctx.fill();
    }
  }),
  concrete: (base = '#9a9a96', repeat = [4, 4]) => canvasTex(512, 512, (ctx, w, h) => {
    noiseFill(ctx, w, h, base, 0.18, 2);
    for (let i = 0; i < 30; i++) {
      ctx.fillStyle = `rgba(0,0,0,${rand() * 0.05})`;
      ctx.beginPath(); ctx.arc(rand() * w, rand() * h, 10 + rand() * 50, 0, 7); ctx.fill();
    }
  }, repeat),
  grass: (repeat = [8, 8]) => canvasTex(512, 512, (ctx, w, h) => {
    noiseFill(ctx, w, h, '#4f7d33', 0.3, 2);
    for (let i = 0; i < 9000; i++) {
      ctx.strokeStyle = rand() > 0.5 ? 'rgba(120,170,70,0.5)' : 'rgba(40,80,25,0.5)';
      const x = rand() * w, y = rand() * h;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rand() - 0.5) * 3, y - 4 - rand() * 4); ctx.stroke();
    }
  }, repeat),
  tiles: (base = '#b4553a', repeat = [6, 6]) => canvasTex(512, 512, (ctx, w, h) => {
    ctx.fillStyle = base; ctx.fillRect(0, 0, w, h);
    const rows = 8, cols = 8;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const x = c * w / cols + (r % 2 ? w / cols / 2 : 0), y = r * h / rows;
      const g = ctx.createLinearGradient(x, y, x, y + h / rows);
      const v = 0.85 + rand() * 0.3;
      g.addColorStop(0, `rgba(255,255,255,${0.12 * v})`); g.addColorStop(1, `rgba(0,0,0,${0.35 * v})`);
      ctx.fillStyle = g; ctx.fillRect(x, y, w / cols - 2, h / rows - 2);
    }
  }, repeat),
  paving: (base = '#c9c3b8', repeat = [6, 6]) => canvasTex(512, 512, (ctx, w, h) => {
    noiseFill(ctx, w, h, base, 0.12, 2);
    ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 3;
    for (let i = 0; i <= 4; i++) { ctx.beginPath(); ctx.moveTo(i * w / 4, 0); ctx.lineTo(i * w / 4, h); ctx.stroke(); ctx.beginPath(); ctx.moveTo(0, i * h / 4); ctx.lineTo(w, i * h / 4); ctx.stroke(); }
  }, repeat),
  sky: () => canvasTex(1024, 512, (ctx, w, h) => {
    const g = ctx.createLinearGradient(0, 0, 0, h);
    g.addColorStop(0, '#5f97d8'); g.addColorStop(0.6, '#a9cbef'); g.addColorStop(1, '#e6f0f8');
    ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
    for (let i = 0; i < 14; i++) { // nubes suaves
      const cx = rand() * w, cy = h * (0.15 + rand() * 0.45), r = 40 + rand() * 90;
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      rg.addColorStop(0, 'rgba(255,255,255,0.75)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.fillStyle = rg; ctx.beginPath(); ctx.ellipse(cx, cy, r * 1.8, r * 0.6, 0, 0, 7); ctx.fill();
    }
  }, [1, 1]),
  skyEnv: (tint = ['#7fb0e8', '#cfe2f5', '#e9e4da', '#9b8f7d'], gain = 1) => {
    const W = 512, H = 256;
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, tint[0]); g.addColorStop(0.48, tint[1]); g.addColorStop(0.52, tint[2]); g.addColorStop(1, tint[3]);
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    const px = ctx.getImageData(0, 0, W, H).data;
    const data = new Float32Array(W * H * 4);
    const toLin = v => { const c = v / 255; return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
    for (let i = 0; i < W * H; i++) {
      data[i * 4] = toLin(px[i * 4]) * gain; data[i * 4 + 1] = toLin(px[i * 4 + 1]) * gain; data[i * 4 + 2] = toLin(px[i * 4 + 2]) * gain; data[i * 4 + 3] = 1;
    }
    const t = new THREE.DataTexture(data, W, H, THREE.RGBAFormat, THREE.FloatType);
    t.flipY = true;
    t.needsUpdate = true;
    return t;
  },
  stripes: (bg, fg, repeat = [1, 1]) => canvasTex(256, 256, (ctx, w, h) => {
    ctx.fillStyle = bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = fg;
    for (let i = -h; i < w; i += 64) { ctx.beginPath(); ctx.moveTo(i, h); ctx.lineTo(i + 32, h); ctx.lineTo(i + 32 + h, 0); ctx.lineTo(i + h, 0); ctx.fill(); }
  }, repeat)
};

// ---------------------------------------------------------------- objetos reutilizables
export function plant(x, z, scale = 1, potColor = '#e8e4dc') {
  const g = new THREE.Group();
  const pot = cyl(0.22 * scale, 0.17 * scale, 0.42 * scale, std(potColor, { roughness: 0.6 }), 0, 0.21 * scale, 0);
  g.add(pot);
  const soil = cyl(0.2 * scale, 0.2 * scale, 0.02, std('#3b2a1e'), 0, 0.41 * scale, 0);
  g.add(soil);
  const leafMats = ['#2f6b34', '#3d7d3c', '#285c2c', '#4a8a45'].map(c => std(c, { roughness: 0.55, side: THREE.DoubleSide }));
  for (let i = 0; i < 46; i++) {
    const a = rand() * Math.PI * 2, h = (0.55 + rand() * 1.0) * scale, r = rand() * 0.45 * scale;
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.11 * scale, 10, 8), leafMats[i % leafMats.length]);
    leaf.scale.set(1, 0.18, 2.2);
    leaf.position.set(Math.cos(a) * r, 0.42 * scale + h, Math.sin(a) * r);
    leaf.rotation.set(rand() * 1.2 - 0.6, a, rand() * 1.2 - 0.6);
    leaf.castShadow = true; leaf.receiveShadow = true;
    g.add(leaf);
    const stem = cyl(0.006, 0.008, h, std('#3c5a2a'), Math.cos(a) * r / 2, 0.42 * scale + h / 2, Math.sin(a) * r / 2, 6);
    stem.rotation.z = (Math.cos(a) * r) / (h + 0.01) * -0.6;
    stem.rotation.x = (Math.sin(a) * r) / (h + 0.01) * 0.6;
    g.add(stem);
  }
  g.position.set(x, 0, z);
  return g;
}

export function tree(x, z, s = 1) {
  const g = new THREE.Group();
  g.add(cyl(0.12 * s, 0.18 * s, 2.4 * s, std('#5a4330'), 0, 1.2 * s, 0, 12));
  const mats = ['#3f6d2d', '#4b7c35', '#355f27', '#56883c', '#2f5a22'].map(c => std(c, { roughness: 0.95 }));
  for (let i = 0; i < 70; i++) {
    const a = rand() * Math.PI * 2, r = Math.sqrt(rand()) * 1.3 * s, h = (2.4 + rand() * 2.2) * s;
    const leaf = sphere((0.28 + rand() * 0.32) * s, mats[i % mats.length], Math.cos(a) * r, h, Math.sin(a) * r);
    leaf.scale.y = 0.75;
    g.add(leaf);
  }
  for (let i = 0; i < 4; i++) { const br = cyl(0.04 * s, 0.07 * s, 1.2 * s, std('#5a4330'), 0, 2.4 * s, 0, 8); br.rotation.set((rand() - 0.5) * 1.4, 0, (rand() - 0.5) * 1.4); g.add(br); }
  g.position.set(x, 0, z);
  return g;
}

export function frameArt(w, h, colors, x, y, z, ry = 0) {
  const g = new THREE.Group();
  g.add(box(w, h, 0.035, std('#1d1d1f', { roughness: 0.5 }), 0, 0, 0));
  g.add(box(w - 0.08, h - 0.08, 0.01, std('#f4f1ea'), 0, 0, 0.02));
  const art = new THREE.Mesh(new THREE.PlaneGeometry(w - 0.22, h - 0.22), new THREE.MeshStandardMaterial({ map: tex.art(colors), roughness: 0.8 }));
  art.position.z = 0.027; g.add(art);
  g.position.set(x, y, z); g.rotation.y = ry;
  return g;
}

// ---------------------------------------------------------------- render
export async function render(build, { mode = 'beauty', width = 1280, height = 800, ssaa = 2, samples = 64 } = {}) {
  resetRand(777);
  const def = build();
  const { scene, camera } = def;
  camera.aspect = width / height; camera.updateProjectionMatrix();

  const W = width * ssaa, H = height * ssaa;
  const canvas = document.createElement('canvas');
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true });
  renderer.setSize(W, H, false);
  renderer.setPixelRatio(1);

  if (mode === 'mask') {
    const white = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });
    const black = new THREE.MeshBasicMaterial({ color: 0x000000, side: THREE.DoubleSide });
    scene.traverse(o => { if (o.isMesh) { o.material = o.userData.paint ? white : black; } });
    scene.background = new THREE.Color(0x000000);
    scene.environment = null;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.render(scene, camera);
  } else if (mode === 'pt') {
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = def.exposure ?? 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    if (!scene.environment) {
      const sky = tex.skyEnv(def.skyTint, def.skyGain ?? 1);
      sky.mapping = THREE.EquirectangularReflectionMapping;
      scene.environment = sky;
    }
    scene.environmentIntensity = def.ptEnvIntensity ?? 1;
    const pt = new WebGLPathTracer(renderer);
    pt.tiles.set(1, 1);
    pt.renderDelay = 0; pt.fadeDuration = 0; pt.minSamples = 1; pt.rasterizeScene = false;
    pt.bounces = def.bounces ?? 6;
    pt.filteredGlossyFactor = 0.5;
    const tS = performance.now();
    pt.setScene(scene, camera);
    console.log('setScene ms', Math.round(performance.now() - tS));
    const t0 = performance.now();
    let guard = 0;
    while (pt.samples < samples && guard < 200000) {
      pt.renderSample();
      guard++;
      if (pt.samples % 25 === 0) console.log('progress', pt.samples, Math.round(performance.now() - t0));
      await new Promise(r => setTimeout(r, pt.isCompiling ? 50 : 0));
    }
    window.__ptTime = (performance.now() - t0) + ' samples=' + pt.samples;
  } else {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.LinearToneMapping;
    renderer.toneMappingExposure = def.exposure ?? 1;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    const pmrem = new THREE.PMREMGenerator(renderer);
    const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = env;
    scene.environmentIntensity = def.envIntensity ?? 0.55;
    const composer = new EffectComposer(renderer);
    composer.setSize(W, H);
    composer.addPass(new RenderPass(scene, camera));
    if (def.ao !== false) {
      const ao = new GTAOPass(scene, camera, W, H);
      ao.updateGtaoMaterial({ radius: def.aoRadius ?? 0.9, distanceExponent: 1.3, thickness: 2, scale: 1.2, samples: 24 });
      ao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
      ao.blendIntensity = def.aoIntensity ?? 1.0;
      composer.addPass(ao);
    }
    composer.addPass(new OutputPass());
    composer.render();
  }

  // Reducción SSAA -> bordes suaves
  const out = document.createElement('canvas');
  out.width = width; out.height = height;
  const ctx = out.getContext('2d');
  ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(canvas, 0, 0, width, height);
  renderer.dispose();
  return out.toDataURL(mode === 'mask' ? 'image/png' : 'image/jpeg', 0.92);
}
