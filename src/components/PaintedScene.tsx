import React, { useEffect, useRef, useState } from 'react';
import { paintSurface, rgbToLab, closeMask } from '../lib/surfacePainter';
import { sceneImage, sceneMask } from '../data/visualizerScenes';

interface LoadedScene {
  base: ImageData;
  alpha: Uint8ClampedArray;
}

// Caché compartida: cada escena se descarga y decodifica una sola vez
const cache = new Map<string, Promise<LoadedScene>>();

const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = reject;
  img.src = src;
});

// Manifiesto de fotos reales generadas en el servidor (si aún no existen, se usa la escena 3D)
interface RealEntry { base: string; ref: string }
let manifestPromise: Promise<Record<string, RealEntry>> | null = null;
function loadManifest(): Promise<Record<string, RealEntry>> {
  if (!manifestPromise) {
    manifestPromise = fetch('/api/visualizer/manifest')
      .then(r => (r.ok ? r.json() : { scenes: {} }))
      .then(d => (d && d.scenes) || {})
      .catch(() => ({}));
  }
  return manifestPromise;
}

/**
 * Recorte a partir de la foto real: el servidor guarda la foto (base) y la misma foto
 * con la superficie en magenta (ref). Donde el magenta aparece es la superficie pintable.
 */
function maskFromReference(base: ImageData, ref: ImageData): Uint8ClampedArray | null {
  const W = base.width, H = base.height;
  // Análisis a menor resolución para que sea rápido
  const AW = Math.min(640, W), AH = Math.round(H * AW / W);
  const sample = (img: ImageData) => {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    c.getContext('2d')!.putImageData(img, 0, 0);
    const s = document.createElement('canvas'); s.width = AW; s.height = AH;
    const sctx = s.getContext('2d', { willReadFrequently: true })!;
    sctx.drawImage(c, 0, 0, AW, AH);
    return sctx.getImageData(0, 0, AW, AH).data;
  };
  const pb = sample(base), pr = sample(ref);
  const n = AW * AH;
  let mask = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const [, ab, bb] = rgbToLab(pb[i * 4], pb[i * 4 + 1], pb[i * 4 + 2]);
    const [, ar, br] = rgbToLab(pr[i * 4], pr[i * 4 + 1], pr[i * 4 + 2]);
    if (ar - ab > 18 && ar > 20 && br - bb < -4) mask[i] = 1;
  }
  mask = closeMask(mask, AW, AH, 2);

  // Quita manchas sueltas pequeñas (ruido de la edición)
  const minBlob = n * 0.003;
  const seen = new Uint8Array(n);
  const stack: number[] = [];
  let total = 0;
  for (let i = 0; i < n; i++) {
    if (!mask[i] || seen[i]) continue;
    const comp: number[] = [];
    stack.push(i); seen[i] = 1;
    while (stack.length) {
      const p = stack.pop()!;
      comp.push(p);
      const x = p % AW, y = (p - x) / AW;
      const nb = [x > 0 ? p - 1 : -1, x < AW - 1 ? p + 1 : -1, y > 0 ? p - AW : -1, y < AH - 1 ? p + AW : -1];
      for (const q of nb) if (q >= 0 && mask[q] && !seen[q]) { seen[q] = 1; stack.push(q); }
    }
    if (comp.length < minBlob) for (const p of comp) mask[p] = 0; else total += comp.length;
  }
  const coverage = total / n;
  if (coverage < 0.02 || coverage > 0.9) return null; // la edición no salió bien: se usa la escena 3D

  // Escala el recorte al tamaño de la foto con bordes suaves
  const m = document.createElement('canvas'); m.width = AW; m.height = AH;
  const mctx = m.getContext('2d')!;
  const mi = mctx.createImageData(AW, AH);
  for (let i = 0; i < n; i++) if (mask[i]) mi.data[i * 4 + 3] = 255;
  mctx.putImageData(mi, 0, 0);
  const up = document.createElement('canvas'); up.width = W; up.height = H;
  const uctx = up.getContext('2d', { willReadFrequently: true })!;
  uctx.imageSmoothingEnabled = true; uctx.imageSmoothingQuality = 'high';
  uctx.filter = 'blur(1px)';
  uctx.drawImage(m, 0, 0, W, H);
  return uctx.getImageData(0, 0, W, H).data;
}

async function loadRealScene(entry: RealEntry): Promise<LoadedScene | null> {
  const [img, refImg] = await Promise.all([loadImage(`/visualizer-real/${entry.base}`), loadImage(`/visualizer-real/${entry.ref}`)]);
  const W = Math.min(1600, img.naturalWidth);
  const H = Math.round(img.naturalHeight * W / img.naturalWidth);
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0, W, H);
  const base = ctx.getImageData(0, 0, W, H);
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(refImg, 0, 0, W, H);
  const ref = ctx.getImageData(0, 0, W, H);
  const alpha = maskFromReference(base, ref);
  return alpha ? { base, alpha } : null;
}

async function load3DScene(id: string) /* foto + máscara estáticas */: Promise<LoadedScene> {
  const [img, mask] = await Promise.all([loadImage(sceneImage(id)), loadImage(sceneMask(id))]);
  const W = img.naturalWidth, H = img.naturalHeight;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d', { willReadFrequently: true })!;
  ctx.drawImage(img, 0, 0);
  const base = ctx.getImageData(0, 0, W, H);
  ctx.clearRect(0, 0, W, H);
  ctx.drawImage(mask, 0, 0, W, H);
  const m = ctx.getImageData(0, 0, W, H).data;
  // La máscara es en escala de grises: se pasa el gris al canal alfa
  const alpha = new Uint8ClampedArray(W * H * 4);
  for (let i = 0; i < W * H; i++) alpha[i * 4 + 3] = m[i * 4];
  return { base, alpha };
}

function loadScene(id: string): Promise<LoadedScene> {
  if (!cache.has(id)) {
    const p = (async () => {
      // Primero las fotos reales con recorte preparado; las generadas en el servidor quedan de respaldo
      try {
        return await load3DScene(id);
      } catch {
        const manifest = await loadManifest();
        if (manifest[id]) {
          const real = await loadRealScene(manifest[id]);
          if (real) return real;
        }
        throw new Error('Escena no disponible');
      }
    })();
    p.catch(() => cache.delete(id));
    cache.set(id, p);
  }
  return cache.get(id)!;
}

interface PaintedSceneProps {
  sceneId: string;
  colorHex: string;
  className?: string;
  alt?: string;
}

/** Escena con la superficie ya pintada del color indicado (sin interacción). */
export const PaintedScene: React.FC<PaintedSceneProps> = ({ sceneId, colorHex, className = '', alt }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scene, setScene] = useState<LoadedScene | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let alive = true;
    setScene(null); setFailed(false);
    loadScene(sceneId).then(s => { if (alive) setScene(s); }).catch(() => { if (alive) setFailed(true); });
    return () => { alive = false; };
  }, [sceneId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !scene) return;
    const { base, alpha } = scene;
    canvas.width = base.width; canvas.height = base.height;
    const out = new ImageData(base.width, base.height);
    paintSurface(base, alpha, colorHex, out);
    canvas.getContext('2d')!.putImageData(out, 0, 0);
  }, [scene, colorHex]);

  if (failed) {
    return <img src={sceneImage(sceneId)} alt={alt} className={`object-cover ${className}`} />;
  }
  return (
    <div className={`relative overflow-hidden bg-slate-200 ${className}`}>
      <canvas ref={canvasRef} role="img" aria-label={alt} className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${scene ? 'opacity-100' : 'opacity-0'}`} />
      {!scene && <div className="absolute inset-0 animate-pulse bg-slate-200" />}
    </div>
  );
};
