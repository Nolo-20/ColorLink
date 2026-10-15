/**
 * Motor de "pintado" de superficies sobre una foto, al estilo de los visualizadores
 * de las marcas de pintura:
 *  1. Segmenta la superficie (pared, piso, fachada) por crecimiento de región desde
 *     puntos semilla, comparando color en espacio Lab y deteniéndose en los bordes.
 *  2. Recolorea solo esa región conservando la iluminación original de cada píxel
 *     (sombras, luz de ventana, textura), como lo haría una pintura mate real.
 *
 * Todo corre en el navegador sobre un <canvas>; no necesita servidor.
 */

export type Seed = [number, number]; // coordenadas normalizadas (0..1) sobre la foto

export interface SegmentOptions {
  /** Diferencia máxima de croma (a,b) respecto al color de la semilla. */
  chromaTol?: number;
  /** Diferencia máxima de luminosidad respecto a la semilla (permite sombras). */
  lightTol?: number;
  /** Diferencia máxima entre píxeles vecinos: corta en bordes de objetos. */
  stepTol?: number;
  /** Fracción máxima de la imagen que puede ocupar una región (evita "fugas"). */
  maxFraction?: number;
  /** Fracción mínima para aceptar una región (descarta semillas mal ubicadas). */
  minFraction?: number;
}

export interface Analysis {
  width: number;
  height: number;
  L: Float32Array;
  A: Float32Array;
  B: Float32Array;
}

// ---------------------------------------------------------------------------
// Color
// ---------------------------------------------------------------------------

const srgbToLinear = (v: number) => {
  const c = v / 255;
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
};

const LIN = new Float32Array(256);
for (let i = 0; i < 256; i++) LIN[i] = srgbToLinear(i);

const linearToSrgb = (c: number) => {
  const v = c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
  return Math.max(0, Math.min(255, Math.round(v * 255)));
};

const fLab = (t: number) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);

export function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  const R = LIN[r], G = LIN[g], Bl = LIN[b];
  const X = (R * 0.4124 + G * 0.3576 + Bl * 0.1805) / 0.95047;
  const Y = R * 0.2126 + G * 0.7152 + Bl * 0.0722;
  const Z = (R * 0.0193 + G * 0.1192 + Bl * 0.9505) / 1.08883;
  const fx = fLab(X), fy = fLab(Y), fz = fLab(Z);
  return [116 * fy - 16, 500 * (fx - fy), 200 * (fy - fz)];
}

export function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  const full = c.length === 3 ? c.split('').map(ch => ch + ch).join('') : c;
  return [parseInt(full.slice(0, 2), 16) || 0, parseInt(full.slice(2, 4), 16) || 0, parseInt(full.slice(4, 6), 16) || 0];
}

// ---------------------------------------------------------------------------
// Análisis (a baja resolución, rápido)
// ---------------------------------------------------------------------------

export function analyze(data: ImageData): Analysis {
  const { width, height } = data;
  const n = width * height;
  const L = new Float32Array(n), A = new Float32Array(n), B = new Float32Array(n);
  const px = data.data;
  for (let i = 0; i < n; i++) {
    const [l, a, b] = rgbToLab(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]);
    L[i] = l; A[i] = a; B[i] = b;
  }
  // Suavizado 3x3 para que la textura del muro no corte la región
  const blur = (src: Float32Array) => {
    const out = new Float32Array(n);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let sum = 0, cnt = 0;
        for (let dy = -1; dy <= 1; dy++) {
          const yy = y + dy;
          if (yy < 0 || yy >= height) continue;
          for (let dx = -1; dx <= 1; dx++) {
            const xx = x + dx;
            if (xx < 0 || xx >= width) continue;
            sum += src[yy * width + xx]; cnt++;
          }
        }
        out[y * width + x] = sum / cnt;
      }
    }
    return out;
  };
  return { width, height, L: blur(L), A: blur(A), B: blur(B) };
}

/** Crece una región desde una semilla. Devuelve los índices de píxeles o null si no es válida. */
export function growRegion(an: Analysis, seed: Seed, opts: SegmentOptions = {}): Uint8Array | null {
  const { width, height, L, A, B } = an;
  const chromaTol = opts.chromaTol ?? 16;
  const lightTol = opts.lightTol ?? 50;
  const stepTol = opts.stepTol ?? 6;
  const maxFraction = opts.maxFraction ?? 0.6;
  const minFraction = opts.minFraction ?? 0.01;
  const n = width * height;

  const sx = Math.min(width - 1, Math.max(0, Math.round(seed[0] * (width - 1))));
  const sy = Math.min(height - 1, Math.max(0, Math.round(seed[1] * (height - 1))));

  // Color de referencia: promedio 5x5 alrededor de la semilla
  let rl = 0, ra = 0, rb = 0, rc = 0;
  for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
    const x = sx + dx, y = sy + dy;
    if (x < 0 || y < 0 || x >= width || y >= height) continue;
    const i = y * width + x; rl += L[i]; ra += A[i]; rb += B[i]; rc++;
  }
  rl /= rc; ra /= rc; rb /= rc;

  const mask = new Uint8Array(n);
  const queue = new Int32Array(n);
  let head = 0, tail = 0, count = 0;
  const start = sy * width + sx;
  mask[start] = 1; queue[tail++] = start; count++;
  const maxCount = maxFraction * n;

  while (head < tail) {
    const p = queue[head++];
    const px = p % width, py = (p - px) / width;
    const neighbors = [
      px > 0 ? p - 1 : -1,
      px < width - 1 ? p + 1 : -1,
      py > 0 ? p - width : -1,
      py < height - 1 ? p + width : -1
    ];
    for (const q of neighbors) {
      if (q < 0 || mask[q]) continue;
      const da = A[q] - ra, db = B[q] - rb;
      if (Math.sqrt(da * da + db * db) > chromaTol) continue;
      if (Math.abs(L[q] - rl) > lightTol) continue;
      const sl = (L[q] - L[p]) * 0.7, sa = A[q] - A[p], sb = B[q] - B[p];
      if (Math.sqrt(sl * sl + sa * sa + sb * sb) > stepTol) continue;
      mask[q] = 1; queue[tail++] = q; count++;
      if (count > maxCount) return null; // se fugó a toda la foto: semilla inválida
    }
  }
  if (count < minFraction * n) return null;
  return mask;
}

/** Cierre morfológico (dilatar y erosionar) para tapar huecos de textura. */
export function closeMask(mask: Uint8Array, width: number, height: number, radius: number) {
  const pass = (src: Uint8Array, dilate: boolean) => {
    const tmp = new Uint8Array(src.length);
    const out = new Uint8Array(src.length);
    // horizontal
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let v = dilate ? 0 : 1;
        for (let k = -radius; k <= radius; k++) {
          const xx = x + k;
          if (xx < 0 || xx >= width) continue;
          const m = src[y * width + xx];
          if (dilate ? m : !m) { v = dilate ? 1 : 0; break; }
        }
        tmp[y * width + x] = v;
      }
    }
    // vertical
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let v = dilate ? 0 : 1;
        for (let k = -radius; k <= radius; k++) {
          const yy = y + k;
          if (yy < 0 || yy >= height) continue;
          const m = tmp[yy * width + x];
          if (dilate ? m : !m) { v = dilate ? 1 : 0; break; }
        }
        out[y * width + x] = v;
      }
    }
    return out;
  };
  return pass(pass(mask, true), false);
}

/** Une varias regiones semilla en una sola máscara limpia. */
export function buildMask(an: Analysis, seeds: Seed[], opts?: SegmentOptions): Uint8Array {
  const n = an.width * an.height;
  const out = new Uint8Array(n);
  for (const seed of seeds) {
    const r = growRegion(an, seed, opts);
    if (!r) continue;
    for (let i = 0; i < n; i++) if (r[i]) out[i] = 1;
  }
  return closeMask(out, an.width, an.height, 2);
}

/** Convierte la máscara binaria en un canvas alfa suavizado (bordes antialias). */
export function maskToCanvas(mask: Uint8Array, width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas');
  c.width = width; c.height = height;
  const ctx = c.getContext('2d')!;
  const img = ctx.createImageData(width, height);
  for (let i = 0; i < mask.length; i++) {
    img.data[i * 4 + 3] = mask[i] ? 255 : 0;
  }
  ctx.putImageData(img, 0, 0);
  return c;
}

/** Acabado de la superficie: cuánto brillo/reflejo tiene y si se excluyen partes oscuras (llantas, molduras, vidrios). */
export interface SurfaceFinish {
  /** 0 = mate (muros), 1 = laca automotriz de alto brillo */
  gloss: number;
  /** Excluir píxeles mucho más oscuros que la superficie (diferencia de L*). 0 = no excluir. */
  darkCut: number;
}

export interface PreparedSurface {
  width: number;
  height: number;
  /** L* de cada píxel de la foto */
  L: Float32Array;
  /** Máscara final 0..1 (ya sin molduras oscuras y con bordes suaves) */
  alpha: Float32Array;
  /** L* mediana de la superficie original */
  Lm: number;
  /** Filas superior e inferior de la superficie (para el reflejo del cielo) */
  y0: number;
  y1: number;
}

const median = (vals: number[]) => {
  if (!vals.length) return 50;
  vals.sort((a, b) => a - b);
  return vals[Math.floor(vals.length / 2)];
};

/** Se calcula una vez por escena: luminosidad, mediana de la superficie y máscara refinada. */
export function prepareSurface(base: ImageData, alphaMask: Uint8ClampedArray, finish: SurfaceFinish): PreparedSurface {
  const { width: W, height: H } = base;
  const n = W * H;
  const px = base.data;
  const L = new Float32Array(n);
  const C = new Float32Array(n);
  const muestraL: number[] = [];
  const muestraC: number[] = [];
  let y0 = H, y1 = 0;
  for (let i = 0; i < n; i++) {
    const [l, a, b] = rgbToLab(px[i * 4], px[i * 4 + 1], px[i * 4 + 2]);
    L[i] = l; C[i] = Math.hypot(a, b);
    if (alphaMask[i * 4 + 3] >= 128) {
      if ((i & 7) === 0) { muestraL.push(l); muestraC.push(C[i]); }
      const y = (i / W) | 0;
      if (y < y0) y0 = y;
      if (y > y1) y1 = y;
    }
  }
  const Lm = median(muestraL);
  const Cm = median(muestraC);

  const raw = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    let a = alphaMask[i * 4 + 3] / 255;
    // Molduras negras, llantas, vidrios oscuros y pilotos de color no son pintura de carrocería
    if (a > 0 && finish.darkCut > 0 && (L[i] < Lm - finish.darkCut || C[i] > Cm + 30)) a = 0;
    raw[i] = a;
  }
  // Bordes suaves (caja 3x3)
  const alpha = new Float32Array(n);
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let sum = 0, cnt = 0;
      for (let dy = -1; dy <= 1; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -1; dx <= 1; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W) continue;
          sum += raw[yy * W + xx]; cnt++;
        }
      }
      alpha[y * W + x] = sum / cnt;
    }
  }
  return { width: W, height: H, L, alpha, Lm, y0: y0 > y1 ? 0 : y0, y1: y0 > y1 ? H - 1 : y1 };
}

const labLToY = (l: number) => {
  const fy = (l + 16) / 116;
  const f3 = fy * fy * fy;
  return f3 > 0.008856 ? f3 : (fy - 16 / 116) / 7.787;
};

/**
 * Pinta la superficie conservando la luz de la foto:
 *  - el tono sale del color elegido (se escala en RGB lineal, así no cambia de matiz);
 *  - las sombras se suavizan según lo oscuro del color (en un negro casi no se notan, en un blanco sí);
 *  - los brillos y el reflejo del cielo se suman y pierden color, como en una pintura brillante;
 *  - un 10 % menos de croma, porque en una foto ningún color se ve "puro".
 */
export function paintSurface(
  base: ImageData,
  prep: PreparedSurface,
  colorHex: string,
  out: ImageData,
  finish: SurfaceFinish
) {
  const px = base.data;
  const o = out.data;
  const { L, alpha, Lm, y0, y1, width: W } = prep;
  const n = base.width * base.height;
  const gloss = finish.gloss;

  const [tr, tg, tb] = hexToRgb(colorHex);
  const TR = LIN[tr], TG = LIN[tg], TB = LIN[tb];
  const tY = Math.max(1e-4, TR * 0.2126 + TG * 0.7152 + TB * 0.0722);
  const Lt = rgbToLab(tr, tg, tb)[0];
  const kSombra = 0.35 + 0.65 * Math.min(1, Lt / Math.max(1, Lm));
  const room = Math.max(1, 100 - Lt);
  const alto = Math.max(1, y1 - y0);

  for (let i = 0; i < n; i++) {
    const a = alpha[i];
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    o[i * 4 + 3] = 255;
    if (a <= 0.004) {
      o[i * 4] = r; o[i * 4 + 1] = g; o[i * 4 + 2] = b;
      continue;
    }
    const d = L[i] - Lm;
    const sombra = d < 0 ? d : 0;
    const brillo = d > 0 ? d : 0;
    let env = 0;
    if (gloss > 0) {
      const yn = Math.min(1, Math.max(0, ((i / W | 0) - y0) / alto));
      const arriba = Math.max(0, 1 - yn / 0.45);
      env = gloss * (9 * Math.pow(arriba, 1.5) - 5 * Math.min(1, Math.max(0, (yn - 0.8) / 0.2)));
    }
    const pos = brillo * gloss + Math.max(0, env);
    let Lo = Lt + sombra * kSombra + (pos * room) / (pos + room) + Math.min(0, env);
    Lo = Math.max(Lo, Lt * 0.55);
    Lo = Math.min(100, Math.max(0, Lo));
    const Yo = labLToY(Lo);
    const desat = Math.min(1, Math.max(0.25, 1 - (brillo * gloss) / 45 - Math.max(0, env) / 80)) * 0.9;
    const w = 1 - desat;
    const esc = Yo / tY;
    let cr = TR * esc * desat + Yo * w;
    let cg = TG * esc * desat + Yo * w;
    let cb = TB * esc * desat + Yo * w;
    const mx = Math.max(cr, cg, cb);
    if (mx > 1) {
      const k = 1 / mx;
      cr = cr * k + (1 - k) * Yo; cg = cg * k + (1 - k) * Yo; cb = cb * k + (1 - k) * Yo;
    }
    o[i * 4] = Math.round(r + (linearToSrgb(cr) - r) * a);
    o[i * 4 + 1] = Math.round(g + (linearToSrgb(cg) - g) * a);
    o[i * 4 + 2] = Math.round(b + (linearToSrgb(cb) - b) * a);
  }
}
