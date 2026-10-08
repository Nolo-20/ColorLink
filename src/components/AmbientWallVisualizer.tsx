import React, { useState, useEffect, useRef, useCallback } from 'react';
import { StoreProduct, StoreProductColor, StoreProductSize } from '../types';
import { Eye, X, Car, Building2, Factory, Home, MousePointerClick, RotateCcw, Loader2, SplitSquareHorizontal } from 'lucide-react';
import { analyze, growRegion, paintSurface, closeMask, Analysis } from '../lib/surfacePainter';

interface AmbientWallVisualizerProps {
  currentProduct: StoreProduct;
  selectedColor?: StoreProductColor;
  selectedSize?: StoreProductSize;
  onSelectSize?: (sizeId: string) => void;
  onClose?: () => void;
}

export function isLightColor(hexColor: string): boolean {
  if (!hexColor) return false;
  const c = hexColor.replace('#', '');
  const r = parseInt(c.substring(0, 2), 16) || 0;
  const g = parseInt(c.substring(2, 4), 16) || 0;
  const b = parseInt(c.substring(4, 6), 16) || 0;
  const brightness = (r * 299 + g * 587 + b * 114) / 1000;
  return brightness > 180;
}

interface SceneData {
  id: string;
  name: string;
  category: 'automotriz' | 'industrial' | 'construccion' | 'hogar';
  surfaceType: string;
  lightingType: string;
  photoUrl: string;
  thumbUrl: string;
  wallMask: string; // (heredado, ya no se usa para pintar)
  blendStyle: 'car' | 'floor' | 'facade' | 'interior';
  /** Máscara precisa (PNG con alfa) de la superficie pintable; si existe, se pinta sola al abrir. */
  maskUrl?: string;
}

const CATEGORY_SCENES: Record<string, SceneData[]> = {
  automotriz: [
    {
      id: 'auto_coupe_studio',
      name: 'Carrocería Deportiva',
      category: 'automotriz',
      surfaceType: 'Lámina Automotriz • Acabado 2K',
      lightingType: 'Reflejos de Estudio 2K',
      photoUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1617814076367-b759c7d7e738?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.9) 25%, rgba(0,0,0,1) 60%, rgba(0,0,0,0.2) 90%)',
      blendStyle: 'car'
    },
    {
      id: 'auto_side_panel',
      name: 'Cabina de Horneado',
      category: 'automotriz',
      surfaceType: 'Panel Lateral & Detallado',
      lightingType: 'Luz Blanca de Cabina 6500K',
      photoUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0.15) 85%)',
      blendStyle: 'car'
    },
    {
      id: 'auto_daylight',
      name: 'Luz Solar Exterior',
      category: 'automotriz',
      surfaceType: 'Brillo Cristalino Intemperie',
      lightingType: 'Luz Solar Directa',
      photoUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0.9) 35%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.1) 95%)',
      blendStyle: 'car'
    }
  ],
  industrial: [
    {
      id: 'ind_nave_logistica',
      name: 'Piso Nave Logística',
      category: 'industrial',
      surfaceType: 'Piso Epóxico Autonivelante',
      lightingType: 'Iluminación LED Industrial',
      photoUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 45%, rgba(0,0,0,0.1) 68%, rgba(0,0,0,0) 80%)',
      blendStyle: 'floor'
    },
    {
      id: 'ind_taller_operativo',
      name: 'Taller de Maquinaria',
      category: 'industrial',
      surfaceType: 'Concreto de Alto Tráfico',
      lightingType: 'Reflectores de Taller',
      photoUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 50%, rgba(0,0,0,0.15) 72%, rgba(0,0,0,0) 82%)',
      blendStyle: 'floor'
    },
    {
      id: 'ind_hangar',
      name: 'Hangar Industrial',
      category: 'industrial',
      surfaceType: 'Piso Vitrificado Sin Juntas',
      lightingType: 'Luz Cenital de Techo',
      photoUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 55%, rgba(0,0,0,0.2) 75%, rgba(0,0,0,0) 85%)',
      blendStyle: 'floor'
    }
  ],
  construccion: [
    {
      id: 'const_fachada_moderna',
      name: 'Fachada Moderna',
      category: 'construccion',
      surfaceType: 'Muro Exterior Elastomérico',
      lightingType: 'Luz Solar Exterior Intemperie',
      photoUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,1) 30%, rgba(0,0,0,0.9) 70%, rgba(0,0,0,0.1) 90%)',
      blendStyle: 'facade'
    },
    {
      id: 'const_muro_entrada',
      name: 'Entrada Residencial',
      category: 'construccion',
      surfaceType: 'Revoque & Fachada Principal',
      lightingType: 'Luz Diurna Alta Exposición',
      photoUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.88) 60%, rgba(0,0,0,0) 88%)',
      blendStyle: 'facade'
    },
    {
      id: 'const_terraza_losa',
      name: 'Terraza & Cubierta',
      category: 'construccion',
      surfaceType: 'Superficie Impermeabilizada',
      lightingType: 'Luz Abierta al Cielo',
      photoUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.9) 55%, rgba(0,0,0,0.1) 80%, rgba(0,0,0,0) 90%)',
      blendStyle: 'facade'
    }
  ],
  hogar: [
    {
      id: 'hogar_sala_confort',
      name: 'Sala de Estar',
      category: 'hogar',
      surfaceType: 'Muro Interior Mate Lavable',
      lightingType: 'Luz Natural Lateral Difusa',
      photoUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 50%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0) 88%)',
      blendStyle: 'interior'
    },
    {
      id: 'hogar_dormitorio',
      name: 'Dormitorio Principal',
      category: 'hogar',
      surfaceType: 'Pared Cabecera de Acercamiento',
      lightingType: 'Luz Cálida Indirecta',
      photoUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.92) 52%, rgba(0,0,0,0.1) 72%, rgba(0,0,0,0) 85%)',
      blendStyle: 'interior'
    },
    {
      id: 'hogar_comedor',
      name: 'Comedor & Cocina',
      category: 'hogar',
      surfaceType: 'Área Social de Tránsito',
      lightingType: 'Iluminación Ambiental Neutra',
      photoUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=1200&q=80',
      thumbUrl: 'https://images.unsplash.com/photo-1617806118233-18e1de247200?auto=format&fit=crop&w=200&q=80',
      wallMask: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 55%, rgba(0,0,0,0.15) 78%, rgba(0,0,0,0) 90%)',
      blendStyle: 'interior'
    }
  ]
};

export const AmbientWallVisualizer: React.FC<AmbientWallVisualizerProps> = ({
  currentProduct,
  selectedColor,
  selectedSize,
  onClose
}) => {
  const categoryKey = (currentProduct.category && CATEGORY_SCENES[currentProduct.category])
    ? currentProduct.category
    : 'hogar';
  const categoryScenes = CATEGORY_SCENES[categoryKey] || CATEGORY_SCENES.hogar;
  const [activeSceneId, setActiveSceneId] = useState<string>(categoryScenes[0].id);

  useEffect(() => {
    if (categoryScenes.length > 0 && !categoryScenes.some(s => s.id === activeSceneId)) {
      setActiveSceneId(categoryScenes[0].id);
    }
  }, [categoryKey]);

  const currentColorHex = selectedColor?.hex || '#FAF9F6';
  const currentColorName = selectedColor?.name || 'Blanco Nieve';
  const currentColorCode = selectedColor?.code || 'CL-1001';
  const isLight = isLightColor(currentColorHex);
  const activeScene = categoryScenes.find(s => s.id === activeSceneId) || categoryScenes[0];

  // ---------------- Motor de pintado sobre la foto ----------------
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const baseRef = useRef<ImageData | null>(null);          // foto original a resolución de trabajo
  const analysisRef = useRef<Analysis | null>(null);       // foto en Lab a baja resolución
  const outRef = useRef<ImageData | null>(null);
  const [selection, setSelection] = useState<Uint8Array | null>(null); // máscara en resolución de análisis
  const [presetAlpha, setPresetAlpha] = useState<Uint8ClampedArray | null>(null); // máscara precisa (si la escena la trae)
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [showOriginal, setShowOriginal] = useState(false);
  const [history, setHistory] = useState<Uint8Array[]>([]);

  // Carga la escena: foto + (opcional) máscara precisa
  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setSelection(null);
    setPresetAlpha(null);
    setHistory([]);

    const loadImage = (src: string) => new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });

    (async () => {
      try {
        const img = await loadImage(activeScene.photoUrl);
        if (cancelled) return;
        const W = Math.min(1200, img.naturalWidth);
        const H = Math.round(img.naturalHeight * W / img.naturalWidth);
        const work = document.createElement('canvas');
        work.width = W; work.height = H;
        const wctx = work.getContext('2d', { willReadFrequently: true })!;
        wctx.drawImage(img, 0, 0, W, H);
        const base = wctx.getImageData(0, 0, W, H); // lanza SecurityError si la foto no permite CORS

        const AW = 480, AH = Math.round(H * AW / W);
        const small = document.createElement('canvas');
        small.width = AW; small.height = AH;
        const sctx = small.getContext('2d', { willReadFrequently: true })!;
        sctx.drawImage(img, 0, 0, AW, AH);
        const an = analyze(sctx.getImageData(0, 0, AW, AH));

        let preset: Uint8ClampedArray | null = null;
        if (activeScene.maskUrl) {
          try {
            const m = await loadImage(activeScene.maskUrl);
            const mc = document.createElement('canvas');
            mc.width = W; mc.height = H;
            const mctx = mc.getContext('2d', { willReadFrequently: true })!;
            mctx.drawImage(m, 0, 0, W, H);
            preset = mctx.getImageData(0, 0, W, H).data;
          } catch { preset = null; }
        }
        if (cancelled) return;

        baseRef.current = base;
        analysisRef.current = an;
        outRef.current = new ImageData(W, H);
        const canvas = canvasRef.current;
        if (canvas) { canvas.width = W; canvas.height = H; }
        setPresetAlpha(preset);
        setSelection(new Uint8Array(AW * AH));
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => { cancelled = true; };
  }, [activeScene.photoUrl, activeScene.maskUrl]);

  // Convierte la selección (baja resolución) en un alfa suave a resolución de trabajo
  const selectionAlpha = useCallback((): Uint8ClampedArray | null => {
    const an = analysisRef.current, base = baseRef.current;
    if (!an || !base || !selection) return null;
    const m = document.createElement('canvas');
    m.width = an.width; m.height = an.height;
    const mctx = m.getContext('2d')!;
    const img = mctx.createImageData(an.width, an.height);
    let any = false;
    for (let i = 0; i < selection.length; i++) if (selection[i]) { img.data[i * 4 + 3] = 255; any = true; }
    if (!any) return null;
    mctx.putImageData(img, 0, 0);
    const up = document.createElement('canvas');
    up.width = base.width; up.height = base.height;
    const uctx = up.getContext('2d', { willReadFrequently: true })!;
    uctx.imageSmoothingEnabled = true;
    uctx.imageSmoothingQuality = 'high';
    uctx.filter = 'blur(1.5px)';
    uctx.drawImage(m, 0, 0, base.width, base.height);
    return uctx.getImageData(0, 0, base.width, base.height).data;
  }, [selection]);

  // Pinta cada vez que cambia el color, la selección o el modo "ver original"
  useEffect(() => {
    if (status !== 'ready') return;
    const canvas = canvasRef.current, base = baseRef.current, out = outRef.current;
    if (!canvas || !base || !out) return;
    const ctx = canvas.getContext('2d')!;
    if (showOriginal) { ctx.putImageData(base, 0, 0); return; }

    const sel = selectionAlpha();
    let alpha: Uint8ClampedArray | null = presetAlpha;
    if (sel && presetAlpha) {
      alpha = new Uint8ClampedArray(presetAlpha);
      for (let i = 3; i < alpha.length; i += 4) alpha[i] = Math.max(alpha[i], sel[i]);
    } else if (sel) {
      alpha = sel;
    }
    if (!alpha) { ctx.putImageData(base, 0, 0); return; }
    paintSurface(base, alpha, currentColorHex, out);
    ctx.putImageData(out, 0, 0);
  }, [status, currentColorHex, selection, presetAlpha, showOriginal, selectionAlpha]);

  // Toque/clic: pinta la superficie tocada; si ya estaba pintada, la despinta
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current, an = analysisRef.current;
    if (!canvas || !an || !selection || status !== 'ready') return;
    const rect = canvas.getBoundingClientRect();
    // object-cover: la foto se escala para cubrir y se recorta centrada
    const scale = Math.max(rect.width / canvas.width, rect.height / canvas.height);
    const dispW = canvas.width * scale, dispH = canvas.height * scale;
    const offX = (rect.width - dispW) / 2, offY = (rect.height - dispH) / 2;
    const nx = (e.clientX - rect.left - offX) / dispW;
    const ny = (e.clientY - rect.top - offY) / dispH;
    if (nx < 0 || ny < 0 || nx > 1 || ny > 1) return;

    const ax = Math.round(nx * (an.width - 1)), ay = Math.round(ny * (an.height - 1));
    const idx = ay * an.width + ax;
    const next = new Uint8Array(selection);

    if (selection[idx]) {
      // Quitar la región conectada que contiene el punto
      const stack = [idx];
      next[idx] = 0;
      while (stack.length) {
        const p = stack.pop()!;
        const x = p % an.width, y = (p - x) / an.width;
        const nb = [x > 0 ? p - 1 : -1, x < an.width - 1 ? p + 1 : -1, y > 0 ? p - an.width : -1, y < an.height - 1 ? p + an.width : -1];
        for (const q of nb) if (q >= 0 && next[q]) { next[q] = 0; stack.push(q); }
      }
    } else {
      const region = growRegion(an, [nx, ny], { maxFraction: 0.55, minFraction: 0.002 });
      if (!region) return;
      const closed = closeMask(region, an.width, an.height, 2); // tapa motas de textura
      for (let i = 0; i < next.length; i++) if (closed[i]) next[i] = 1;
    }
    setHistory(h => [...h.slice(-9), selection]);
    setSelection(next);
  };

  const undo = () => {
    setHistory(h => {
      if (!h.length) return h;
      setSelection(h[h.length - 1]);
      return h.slice(0, -1);
    });
  };
  const clearAll = () => {
    if (!analysisRef.current || !selection) return;
    setHistory(h => [...h.slice(-9), selection]);
    setSelection(new Uint8Array(selection.length));
  };

  const hasUserPaint = !!selection && selection.some(v => v === 1);
  const hasPaint = hasUserPaint || !!presetAlpha;

  const getCategoryMeta = () => {
    switch (categoryKey) {
      case 'automotriz':
        return { icon: <Car className="w-3.5 h-3.5 text-blue-400" />, label: 'Contexto Automotriz', hint: 'Toca la carrocería para pintarla', selectorTitle: 'Selecciona el entorno automotriz:' };
      case 'industrial':
        return { icon: <Factory className="w-3.5 h-3.5 text-amber-400" />, label: 'Contexto Industrial', hint: 'Toca el piso para pintarlo', selectorTitle: 'Selecciona la superficie industrial:' };
      case 'construccion':
        return { icon: <Building2 className="w-3.5 h-3.5 text-emerald-400" />, label: 'Fachadas & Exterior', hint: 'Toca la fachada para pintarla', selectorTitle: 'Selecciona la fachada exterior:' };
      case 'hogar':
      default:
        return { icon: <Home className="w-3.5 h-3.5 text-indigo-400" />, label: 'Hogar & Decoración', hint: 'Toca una pared para pintarla', selectorTitle: 'Selecciona el ambiente interior:' };
    }
  };
  const meta = getCategoryMeta();

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border shadow-xl bg-slate-900"
        style={{ borderColor: isLight ? '#CBD5E1' : `${currentColorHex}66` }}
      >
        {/* Foto pintada (canvas). Si la foto no se puede procesar, se muestra tal cual. */}
        <canvas
          ref={canvasRef}
          onClick={handleCanvasClick}
          className={`absolute inset-0 w-full h-full object-cover select-none ${status === 'ready' ? 'cursor-crosshair' : 'opacity-0'}`}
          aria-label={`Vista de ${activeScene.name} pintada en ${currentColorName}`}
        />
        {status !== 'ready' && (
          <img
            src={activeScene.photoUrl}
            alt={activeScene.name}
            className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
          />
        )}
        {status === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-950/30">
            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 text-white text-xs font-bold">
              <Loader2 className="w-4 h-4 animate-spin" /> Preparando el ambiente…
            </span>
          </div>
        )}

        {/* Barra superior: color + cerrar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-2 pointer-events-none">
          <div className="pointer-events-auto px-3 py-1.5 rounded-2xl shadow-lg bg-white/95 backdrop-blur-md border border-slate-200 flex items-center gap-2.5 text-slate-950 max-w-[65%]">
            <div className="w-5 h-5 rounded-full shadow-inner ring-1 ring-black/10 shrink-0" style={{ backgroundColor: currentColorHex }} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-xs font-black truncate">{currentColorName}</span>
                <span className="text-[10px] font-bold text-slate-500 shrink-0">{currentColorCode}</span>
              </div>
              <span className="block text-[10px] font-semibold text-slate-500 leading-tight truncate">{activeScene.surfaceType}</span>
            </div>
          </div>
          <div className="pointer-events-auto flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 text-white text-[10px] font-bold border border-white/15 backdrop-blur-md">
              {meta.icon}<span>{meta.label}</span>
            </div>
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-950 text-white text-[11px] font-extrabold shadow-xl border border-white/20 cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-rose-400" /><span>Cerrar</span>
              </button>
            )}
          </div>
        </div>

        {/* Ayuda y controles */}
        {status === 'ready' && (
          <div className="absolute bottom-3 left-3 right-3 z-20 flex items-end justify-between gap-2 pointer-events-none">
            {!hasPaint ? (
              <span className="pointer-events-none inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-950/80 text-white text-[11px] font-bold backdrop-blur-md shadow-lg">
                <MousePointerClick className="w-4 h-4 text-emerald-400" /> {meta.hint}
              </span>
            ) : <span />}
            <div className="pointer-events-auto flex items-center gap-1.5">
              {hasPaint && (
                <button
                  type="button"
                  onMouseDown={() => setShowOriginal(true)}
                  onMouseUp={() => setShowOriginal(false)}
                  onMouseLeave={() => setShowOriginal(false)}
                  onTouchStart={() => setShowOriginal(true)}
                  onTouchEnd={() => setShowOriginal(false)}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold shadow cursor-pointer"
                  title="Mantén presionado para ver la foto original"
                >
                  <SplitSquareHorizontal className="w-3.5 h-3.5" /> Antes
                </button>
              )}
              {history.length > 0 && (
                <button type="button" onClick={undo} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold shadow cursor-pointer">
                  <RotateCcw className="w-3.5 h-3.5" /> Deshacer
                </button>
              )}
              {hasUserPaint && (
                <button type="button" onClick={clearAll} className="px-2.5 py-1.5 rounded-lg bg-white/90 hover:bg-white text-slate-800 text-[10px] font-bold shadow cursor-pointer">
                  Limpiar
                </button>
              )}
            </div>
          </div>
        )}
        {status === 'error' && (
          <div className="absolute bottom-3 left-3 z-20 px-3 py-2 rounded-xl bg-slate-950/80 text-white text-[11px] font-bold">
            No pudimos preparar este ambiente. Prueba con otro.
          </div>
        )}
      </div>

      {/* Selector de escenas */}
      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-2 px-1 gap-2">
          <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>{meta.selectorTitle}</span>
          </span>
          <span className="text-[10px] font-bold text-slate-500 truncate">{activeScene.lightingType}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {categoryScenes.map((scene) => {
            const isSelected = activeSceneId === scene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActiveSceneId(scene.id)}
                className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all cursor-pointer group flex flex-col justify-end p-2 ${
                  isSelected ? 'border-[#0B1E48] ring-2 ring-[#0B1E48] shadow-md' : 'border-slate-200 hover:border-slate-400 opacity-80 hover:opacity-100'
                }`}
              >
                <img src={scene.thumbUrl} alt={scene.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform" />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/30 to-transparent" />
                <span className="relative z-10 text-[10px] sm:text-[11px] font-black text-white leading-tight truncate text-left">{scene.name}</span>
                <span className="relative z-10 text-[8.5px] font-semibold text-slate-300 leading-tight truncate text-left">{scene.surfaceType.split('•')[0]}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
