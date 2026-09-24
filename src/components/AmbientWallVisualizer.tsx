import React, { useState, useEffect } from 'react';
import { StoreProduct, StoreProductColor, StoreProductSize } from '../types';
import { PaintCanGraphic } from './PaintCanGraphic';
import { Eye, X, Sparkles, Car, Building2, Factory, Home } from 'lucide-react';
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

interface SceneData {
  id: string;
  name: string;
  category: 'automotriz' | 'industrial' | 'construccion' | 'hogar';
  surfaceType: string;
  lightingType: string;
  photoUrl: string;
  thumbUrl: string;
  wallMask: string;
  blendStyle: 'car' | 'floor' | 'facade' | 'interior';
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
  // Determine scenes based on product category
  const categoryKey = (currentProduct.category && CATEGORY_SCENES[currentProduct.category]) 
    ? currentProduct.category 
    : 'hogar';

  const categoryScenes = CATEGORY_SCENES[categoryKey] || CATEGORY_SCENES.hogar;
  const [activeSceneId, setActiveSceneId] = useState<string>(categoryScenes[0].id);

  // Sync active scene when product category changes
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

  // Context category icon and meta label
  const getCategoryMeta = () => {
    switch (categoryKey) {
      case 'automotriz':
        return {
          icon: <Car className="w-3.5 h-3.5 text-blue-400" />,
          label: 'Contexto Automotriz',
          title: 'Visualización de Acabado Automotriz 2K',
          selectorTitle: 'Selecciona el entorno automotriz:'
        };
      case 'industrial':
        return {
          icon: <Factory className="w-3.5 h-3.5 text-amber-400" />,
          label: 'Contexto Industrial',
          title: 'Visualización de Pisos & Tráfico Pesado',
          selectorTitle: 'Selecciona la superficie industrial:'
        };
      case 'construccion':
        return {
          icon: <Building2 className="w-3.5 h-3.5 text-emerald-400" />,
          label: 'Contexto Construcción & Fachadas',
          title: 'Visualización de Fachada e Intemperie',
          selectorTitle: 'Selecciona la fachada exterior:'
        };
      case 'hogar':
      default:
        return {
          icon: <Home className="w-3.5 h-3.5 text-indigo-400" />,
          label: 'Contexto Hogar & Decoración',
          title: 'Visualización de Muros Interiores',
          selectorTitle: 'Selecciona el ambiente interior:'
        };
    }
  };

  const meta = getCategoryMeta();

  return (
    <div className="w-full flex flex-col gap-3">
      
      {/* Visualizer Stage Container */}
      <div 
        className="relative w-full aspect-[16/10] sm:aspect-[16/10.5] rounded-3xl overflow-hidden border shadow-xl transition-colors duration-500 bg-slate-900"
        style={{ borderColor: isLight ? '#CBD5E1' : `${currentColorHex}66` }}
      >
        
        {/* ======================================================== */}
        {/* BASE PHOTOGRAPH ACCORDING TO CATEGORY CONTEXT */}
        {/* ======================================================== */}
        <img
          src={activeScene.photoUrl}
          alt={activeScene.name}
          className="w-full h-full object-cover select-none pointer-events-none transition-all duration-500"
        />

        {/* ======================================================== */}
        {/* REALISTIC SURFACE SHADING (AUTOMOTIVE, FLOOR, OR WALL) */}
        {/* Preserves texture, reflections, highlights, and ambient light */}
        {/* ======================================================== */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-700 ease-out"
          style={{
            maskImage: activeScene.wallMask,
            WebkitMaskImage: activeScene.wallMask
          }}
        >
          {/* Multiply / Soft-light Pass: Sinks pigment into bodywork curves or floor grain */}
          <div 
            className="absolute inset-0 transition-colors duration-500"
            style={{
              backgroundColor: currentColorHex,
              mixBlendMode: isLight ? 'soft-light' : 'multiply',
              opacity: activeScene.blendStyle === 'car' ? (isLight ? 0.70 : 0.85) : (isLight ? 0.65 : 0.82)
            }}
          />

          {/* Color Tint Pass: Accurately renders the exact brand pigment hue */}
          <div 
            className="absolute inset-0 transition-colors duration-500"
            style={{
              backgroundColor: currentColorHex,
              mixBlendMode: 'color',
              opacity: activeScene.blendStyle === 'car' ? (isLight ? 0.65 : 0.78) : (isLight ? 0.55 : 0.70)
            }}
          />

          {/* Gloss / Sheen / Specular Pass for high-grade finishes */}
          <div 
            className="absolute inset-0 transition-colors duration-500"
            style={{
              backgroundColor: currentColorHex,
              mixBlendMode: 'overlay',
              opacity: activeScene.blendStyle === 'car' ? 0.35 : (isLight ? 0.28 : 0.18)
            }}
          />
        </div>

        {/* ======================================================== */}
        {/* TOP BAR: COLOR BADGE + SURFACE TAG + CLOSE BUTTON */}
        {/* ======================================================== */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-auto gap-2">
          {/* Top-Left Color & Surface Badge */}
          <div 
            className={`px-3 py-1.5 rounded-2xl shadow-lg border backdrop-blur-md flex items-center gap-2.5 transition-all ${
              isLight 
                ? 'bg-white/95 border-slate-300 shadow-slate-900/10 text-slate-950' 
                : 'border-white/30 shadow-black/30 text-white'
            }`}
            style={{
              backgroundColor: isLight ? '#FFFFFF' : `${currentColorHex}EE`
            }}
          >
            <div 
              className="w-4 h-4 rounded-full border border-white/70 shadow-xs shrink-0 ring-1 ring-black/10" 
              style={{ backgroundColor: currentColorHex }}
            />
            <div>
              <div className="flex items-center gap-1.5 leading-tight">
                <span className="text-xs font-black tracking-wide drop-shadow-xs">
                  {currentColorName}
                </span>
                <span className={`text-[10px] font-bold ${isLight ? 'text-slate-500' : 'text-white/80'}`}>
                  ({currentColorCode})
                </span>
              </div>
              <span className={`block text-[9.5px] font-bold leading-tight ${isLight ? 'text-slate-600' : 'text-white/90'}`}>
                {activeScene.surfaceType}
              </span>
            </div>
          </div>

          {/* Top-Right: Category Tag & "Cerrar" Action Button */}
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-900/80 text-white text-[10px] font-bold border border-white/15 backdrop-blur-md shadow-md">
              {meta.icon}
              <span>{meta.label}</span>
            </div>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-950 text-white text-[11px] font-extrabold shadow-xl backdrop-blur-md border border-white/20 transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <span>Cerrar</span>
              </button>
            )}
          </div>
        </div>

        {/* ======================================================== */}
        {/* ANIMATED DOCKED PAINT CAN IN CORNER */}
        {/* Synchronized with active product line and selected size */}
        {/* ======================================================== */}
        <div className="absolute bottom-2.5 left-2.5 sm:bottom-3.5 sm:left-3.5 z-20 pointer-events-none drop-shadow-2xl">
          <AnimatePresence mode="wait">
            <motion.div 
              key={`docked-can-${currentProduct.id}-${selectedSize?.id || 'galon'}-${currentColorHex}`}
              initial={{ y: 25, opacity: 0, scale: 0.85 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: 15, opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="relative"
            >
              {/* Floor Shadow */}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-20 h-3 bg-black/60 blur-xs rounded-full" />
              
              {/* Responsive Paint Can Graphic */}
              <PaintCanGraphic
                colorHex={currentColorHex}
                colorName={currentColorName}
                productLine={currentProduct.name.split(' ')[0]}
                sizeName={selectedSize?.name || '1 Galón'}
                className="w-20 h-26 sm:w-24 sm:h-32"
              />
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* ======================================================== */}
      {/* CONTEXT SELECTOR BAR (Specific to Product Category) */}
      {/* ======================================================== */}
      <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-200">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-black uppercase text-slate-700 tracking-wider flex items-center gap-1.5">
            <Eye className="w-3.5 h-3.5 text-emerald-600" />
            <span>{meta.selectorTitle}</span>
          </span>
          <span className="text-[10px] font-bold text-slate-500">
            {activeScene.lightingType}
          </span>
        </div>

        {/* Photographic Thumbnails Carousel */}
        <div className="grid grid-cols-3 gap-2">
          {categoryScenes.map((scene) => {
            const isSelected = activeSceneId === scene.id;
            return (
              <button
                key={scene.id}
                type="button"
                onClick={() => setActiveSceneId(scene.id)}
                className={`relative rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all cursor-pointer group flex flex-col justify-end p-2 ${
                  isSelected 
                    ? 'border-[#0B1E48] ring-2 ring-[#0B1E48] scale-102 shadow-md' 
                    : 'border-slate-200 hover:border-slate-400 opacity-75 hover:opacity-100'
                }`}
              >
                {/* Real photo background */}
                <img
                  src={scene.thumbUrl}
                  alt={scene.name}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                
                {/* Gradient overlay for label legibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/35 to-transparent" />

                {/* Color Dot preview */}
                <div 
                  className="absolute top-1.5 right-1.5 w-3 h-3 rounded-full border border-white/80 shadow-xs" 
                  style={{ backgroundColor: currentColorHex }}
                />

                {/* Scene Name Label */}
                <span className="relative z-10 text-[10px] sm:text-[11px] font-black text-white leading-tight truncate text-left">
                  {scene.name}
                </span>
                <span className="relative z-10 text-[8.5px] font-semibold text-slate-300 leading-tight truncate text-left">
                  {scene.surfaceType.split('•')[0]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
