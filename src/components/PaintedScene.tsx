import React, { useEffect, useRef, useState } from 'react';
import { paintSurface } from '../lib/surfacePainter';
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

function loadScene(id: string): Promise<LoadedScene> {
  if (!cache.has(id)) {
    const p = (async () => {
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
