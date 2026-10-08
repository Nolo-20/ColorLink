import React, { useState, useEffect } from 'react';
import { StoreProduct, StoreProductColor, StoreProductSize } from '../types';
import { PaintCanGraphic } from './PaintCanGraphic';
import { PaintedScene } from './PaintedScene';
import { scenesForCategory } from '../data/visualizerScenes';
import { Eye, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

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

const SELECTOR_TITLE: Record<string, string> = {
  hogar: 'Elige el ambiente',
  construccion: 'Elige la fachada',
  industrial: 'Elige el espacio',
  automotriz: 'Elige la escena'
};

/**
 * Visualizador: muestra el ambiente con el color elegido ya aplicado sobre las
 * superficies que se pintan (muros, fachada, piso o carrocería según la categoría).
 */
export const AmbientWallVisualizer: React.FC<AmbientWallVisualizerProps> = ({
  currentProduct,
  selectedColor,
  selectedSize,
  onClose
}) => {
  const scenes = scenesForCategory(currentProduct.category);
  const [activeSceneId, setActiveSceneId] = useState(scenes[0].id);

  useEffect(() => {
    if (!scenes.some(s => s.id === activeSceneId)) setActiveSceneId(scenes[0].id);
  }, [currentProduct.category]);

  const colorHex = selectedColor?.hex || '#FAF9F6';
  const colorName = selectedColor?.name || 'Blanco Nieve';
  const colorCode = selectedColor?.code || '';
  const isLight = isLightColor(colorHex);
  const activeScene = scenes.find(s => s.id === activeSceneId) || scenes[0];

  return (
    <div className="w-full flex flex-col gap-3">
      <div
        className="relative w-full aspect-[16/10] rounded-3xl overflow-hidden border shadow-xl bg-slate-200"
        style={{ borderColor: isLight ? '#CBD5E1' : `${colorHex}66` }}
      >
        <PaintedScene
          sceneId={activeScene.id}
          colorHex={colorHex}
          className="absolute inset-0 w-full h-full"
          alt={`${activeScene.name} pintado en ${colorName}`}
        />

        {/* Color aplicado + cerrar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-2">
          <div className="px-3 py-1.5 rounded-2xl shadow-lg bg-white/95 backdrop-blur-md border border-slate-200 flex items-center gap-2.5 text-slate-950 max-w-[70%]">
            <div className="w-5 h-5 rounded-full shadow-inner ring-1 ring-black/10 shrink-0" style={{ backgroundColor: colorHex }} />
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-xs font-black truncate">{colorName}</span>
                {colorCode && <span className="text-[10px] font-bold text-slate-500 shrink-0">{colorCode}</span>}
              </div>
              <span className="block text-[10px] font-semibold text-slate-500 leading-tight truncate">{activeScene.surface}</span>
            </div>
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

        {/* Lata del producto en la esquina */}
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-3.5 sm:left-3.5 z-20 pointer-events-none drop-shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={`docked-can-${currentProduct.id}-${selectedSize?.id || 'galon'}-${colorHex}`}
              initial={{ y: 25, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 15, opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
            >
              <PaintCanGraphic
                colorHex={colorHex}
                colorName={colorName}
                productLine={currentProduct.name}
                sizeName={selectedSize?.name || '1 Galón'}
                category={currentProduct.category}
                className="w-20 h-24 sm:w-28 sm:h-32"
              />
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Selector de escenas (cada miniatura ya muestra el color) */}
      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
        <div className="flex items-center mb-2 px-1">
          <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>{SELECTOR_TITLE[currentProduct.category] || SELECTOR_TITLE.hogar}</span>
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {scenes.map((scene) => {
            const isSelected = activeSceneId === scene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActiveSceneId(scene.id)}
                className={`relative rounded-xl overflow-hidden aspect-[16/10] border-2 transition-all cursor-pointer group ${
                  isSelected ? 'border-[#0B1E48] ring-2 ring-[#0B1E48] shadow-md' : 'border-slate-200 hover:border-slate-400 opacity-85 hover:opacity-100'
                }`}
              >
                <PaintedScene sceneId={scene.id} colorHex={colorHex} className="absolute inset-0 w-full h-full" alt={scene.name} />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                <span className="absolute left-2 bottom-1.5 text-[10px] sm:text-[11px] font-black text-white leading-tight truncate text-left">{scene.name}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
