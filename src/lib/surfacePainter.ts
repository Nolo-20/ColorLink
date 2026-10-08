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

/**
 * Pinta la región: el color objetivo se multiplica por la iluminación relativa de
 * cada píxel (luminancia del píxel / luminancia media de la superficie), así se
 * conservan sombras, luces y textura. alphaMask es un canvas del tamaño de la foto.
 */
export function paintSurface(
  base: ImageData,
  alphaMask: Uint8ClampedArray,
  colorHex: string,
  out: ImageData
) {
  const px = base.data;
  const o = out.data;
  const n = base.width * base.height;

  // Luminancia media (lineal) de la superficie original
  let sumY = 0, cnt = 0;
  for (let i = 0; i < n; i++) {
    const a = alphaMask[i * 4 + 3];
    if (a < 128) continue;
    sumY += LIN[px[i * 4]] * 0.2126 + LIN[px[i * 4 + 1]] * 0.7152 + LIN[px[i * 4 + 2]] * 0.0722;
    cnt++;
  }
  const meanY = cnt ? sumY / cnt : 0.5;

  const [tr, tg, tb] = hexToRgb(colorHex);
  const TR = LIN[tr], TG = LIN[tg], TB = LIN[tb];
  const targetY = TR * 0.2126 + TG * 0.7152 + TB * 0.0722;
  // En colores oscuros comprimimos un poco el contraste para que no se "queme" la textura
  const contrast = 0.75 + 0.25 * Math.min(1, targetY / 0.5);

  for (let i = 0; i < n; i++) {
    const a = alphaMask[i * 4 + 3] / 255;
    const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
    if (a <= 0) {
      o[i * 4] = r; o[i * 4 + 1] = g; o[i * 4 + 2] = b; o[i * 4 + 3] = 255;
      continue;
    }
    const Y = LIN[r] * 0.2126 + LIN[g] * 0.7152 + LIN[b] * 0.0722;
    let light = meanY > 0 ? Y / meanY : 1;
    light = 1 + (light - 1) * contrast;
    light = Math.max(0.08, Math.min(1.9, light));
    const nr = linearToSrgb(Math.min(1, TR * light));
    const ng = linearToSrgb(Math.min(1, TG * light));
    const nb = linearToSrgb(Math.min(1, TB * light));
    o[i * 4] = Math.round(r + (nr - r) * a);
    o[i * 4 + 1] = Math.round(g + (ng - g) * a);
    o[i * 4 + 2] = Math.round(b + (nb - b) * a);
    o[i * 4 + 3] = 255;
  }
}
