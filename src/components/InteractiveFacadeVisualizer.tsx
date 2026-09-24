import React, { useState } from 'react';
import { 
  Sun, 
  Sunset, 
  Moon, 
  Layers, 
  Eye, 
  Palette, 
  Sparkles, 
  Maximize2, 
  RefreshCw, 
  Check, 
  Home, 
  Building2, 
  Armchair, 
  BedDouble,
  Sliders,
  SplitSquareVertical
} from 'lucide-react';
import { StoreProduct, StoreProductColor } from '../types';

interface InteractiveFacadeVisualizerProps {
  currentProduct?: StoreProduct;
  selectedColor?: StoreProductColor;
  onSelectColor?: (colorId: string) => void;
  className?: string;
}

type SceneType = 'fachada_exterior' | 'interior_sala' | 'interior_dormitorio' | 'exterior_terraza';
type LightingMode = 'dia' | 'atardecer' | 'noche';
type FinishMode = 'mate' | 'satinado' | 'brillante';

interface SceneData {
  id: SceneType;
  title: string;
  category: 'exterior' | 'interior';
  subtitle: string;
  image: string;
  accentWallClip: string;
  secondaryWallClip?: string;
  lightingOffset: string;
}

const SCENES: Record<SceneType, SceneData> = {
  fachada_exterior: {
    id: 'fachada_exterior',
    title: 'Fachada Exterior Moderna',
    category: 'exterior',
    subtitle: 'Revoque exterior, intemperie y luz natural solar',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85',
    // SVG polygon clip path for the main stucco facade wall
    accentWallClip: 'polygon(14% 18%, 56% 18%, 56% 62%, 76% 62%, 76% 82%, 14% 82%)',
    secondaryWallClip: 'polygon(60% 28%, 94% 28%, 94% 68%, 60% 68%)',
    lightingOffset: 'brightness(1.02)'
  },
  interior_sala: {
    id: 'interior_sala',
    title: 'Sala de Estar Contemporánea',
    category: 'interior',
    subtitle: 'Muros interiores lisos con luz difusa y decoración',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1400&q=85',
    accentWallClip: 'polygon(20% 0%, 82% 0%, 82% 70%, 20% 70%)',
    secondaryWallClip: 'polygon(0% 0%, 20% 0%, 20% 85%, 0% 85%)',
    lightingOffset: 'brightness(1.0)'
  },
  interior_dormitorio: {
    id: 'interior_dormitorio',
    title: 'Dormitorio Principal',
    category: 'interior',
    subtitle: 'Pared de cabecero con iluminación ambiental suave',
    image: 'https://images.unsplash.com/photo-1616594039964-ae9021a400a0?auto=format&fit=crop&w=1400&q=85',
    accentWallClip: 'polygon(15% 10%, 85% 10%, 85% 68%, 15% 68%)',
    lightingOffset: 'brightness(0.98)'
  },
  exterior_terraza: {
    id: 'exterior_terraza',
    title: 'Muros de Terraza & Jardín',
    category: 'exterior',
    subtitle: 'Muros perimetrales y acabados arquitectónicos',
    image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1400&q=85',
    accentWallClip: 'polygon(8% 30%, 48% 30%, 48% 78%, 8% 78%)',
    secondaryWallClip: 'polygon(52% 38%, 90% 38%, 90% 75%, 52% 75%)',
    lightingOffset: 'brightness(1.05)'
  }
};

export const InteractiveFacadeVisualizer: React.FC<InteractiveFacadeVisualizerProps> = ({
  currentProduct,
  selectedColor,
  onSelectColor,
  className = ''
}) => {
  const isOutdoorProduct = currentProduct?.category === 'construccion' || currentProduct?.id.includes('koraza');
  const [activeScene, setActiveScene] = useState<SceneType>(isOutdoorProduct ? 'fachada_exterior' : 'interior_sala');
  const [lighting, setLighting] = useState<LightingMode>('dia');
  const [finish, setFinish] = useState<FinishMode>('satinado');
  const [splitSlider, setSplitSlider] = useState<number>(100);
  const [showBeforeAfter, setShowBeforeAfter] = useState<boolean>(false);

  // Active color hex and metadata
  const activeColorHex = selectedColor?.hex || '#1E3A8A';
  const activeColorName = selectedColor?.name || 'Azul Zafiro Profundo';
  const activeColorCode = selectedColor?.code || 'CL-5002';

  // Available colors from the active product
  const availableColors = currentProduct?.colors || [
    { id: 'blanco-nieve', name: 'Blanco Nieve', hex: '#FFFFFF', code: 'CL-1001', inStock: true },
    { id: 'gris-niebla', name: 'Gris Niebla', hex: '#D1D5DB', code: 'CL-7035', inStock: true },
    { id: 'azul-zafiro', name: 'Azul Zafiro Profundo', hex: '#1E3A8A', code: 'CL-5002', inStock: true },
    { id: 'verde-selva', name: 'Verde Eucalipto', hex: '#2D6A4F', code: 'CL-6005', inStock: true },
    { id: 'terracota-colonial', name: 'Terracota Cálido', hex: '#C2593F', code: 'CL-3016', inStock: true },
    { id: 'almendra-suave', name: 'Almendra Suave', hex: '#F3E8DC', code: 'CL-1015', inStock: true },
    { id: 'negro-onix', name: 'Negro Grafito', hex: '#1F2937', code: 'CL-9005', inStock: true }
  ];

  const scene = SCENES[activeScene] || SCENES.fachada_exterior;

  // Real lighting condition filters
  const getLightingStyles = () => {
    switch (lighting) {
      case 'atardecer':
        return {
          filter: 'sepia(0.28) saturate(1.25) brightness(0.92) contrast(1.05)',
          overlayColor: 'rgba(249, 115, 22, 0.16)',
          label: 'Atardecer Dorado (3200K)'
        };
      case 'noche':
        return {
          filter: 'brightness(0.68) contrast(1.22) saturate(0.9)',
          overlayColor: 'rgba(15, 23, 42, 0.42)',
          label: 'Noche con Focos LED (2700K)'
        };
      default:
        return {
          filter: 'brightness(1.0) contrast(1.0) saturate(1.05)',
          overlayColor: 'transparent',
          label: 'Luz Solar Natural (5500K)'
        };
    }
  };

  const lightingStyle = getLightingStyles();

  // Finish opacity and specular sheen
  const getFinishStyles = () => {
    switch (finish) {
      case 'brillante':
        return {
          colorOpacity: 0.72,
          sheen: 'linear-gradient(135deg, rgba(255,255,255,0.35) 0%, rgba(255,255,255,0) 50%, rgba(0,0,0,0.15) 100%)',
          label: 'Brillante (Reflexión de Luz)'
        };
      case 'mate':
        return {
          colorOpacity: 0.82,
          sheen: 'none',
          label: 'Mate (Acabado Aterciopelado Antirreflejo)'
        };
      default:
        return {
          colorOpacity: 0.76,
          sheen: 'linear-gradient(145deg, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 60%)',
          label: 'Satinado (Brillo Suave & Fácil Limpieza)'
        };
    }
  };

  const finishStyle = getFinishStyles();

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm ${className}`}>
      
      {/* Header bar */}
      <div className="bg-gradient-to-r from-[#07132E] via-[#0B254A] to-[#07132E] text-white p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-black uppercase tracking-widest text-emerald-400">
              Visualizador Fotográfico de Ambientes Reales
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            <span>Mira cómo queda tu espacio con {activeColorName}</span>
          </h3>
          <p className="text-xs text-blue-200/90 font-medium mt-0.5">
            Fotografías arquitectónicas reales con tintado dinámico de paredes, simulación de luz solar y acabado {finish}.
          </p>
        </div>

        {/* Selected Tone Tag */}
        <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/15 shrink-0 self-start md:self-auto shadow-md">
          <div 
            className="w-9 h-9 rounded-full border-2 border-white shadow-md shrink-0" 
            style={{ backgroundColor: activeColorHex }}
          />
          <div>
            <span className="text-xs font-black text-white block leading-tight">
              {activeColorName}
            </span>
            <span className="text-[10px] text-emerald-300 font-mono font-bold block mt-0.5">
              Ref: {activeColorCode} • {finishStyle.label.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Control Bar: Scenes, Lighting, Finish & Before/After */}
      <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        
        {/* Real Architectural Scene Selector */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-200/70 p-1 rounded-xl border border-slate-300">
          <button
            type="button"
            onClick={() => setActiveScene('fachada_exterior')}
            className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScene === 'fachada_exterior' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Home className="w-3.5 h-3.5 text-blue-600" />
            <span>Fachada Exterior</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScene('interior_sala')}
            className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScene === 'interior_sala' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Armchair className="w-3.5 h-3.5 text-emerald-600" />
            <span>Sala de Estar</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScene('interior_dormitorio')}
            className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScene === 'interior_dormitorio' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BedDouble className="w-3.5 h-3.5 text-purple-600" />
            <span>Dormitorio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveScene('exterior_terraza')}
            className={`px-3 py-1.5 rounded-lg font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              activeScene === 'exterior_terraza' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Muros Terraza</span>
          </button>
        </div>

        {/* Right Controls: Lighting, Finish & Compare */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Lighting Mode Selector */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl border border-slate-300">
            <button
              type="button"
              onClick={() => setLighting('dia')}
              title="Luz Solar Natural (5500K)"
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                lighting === 'dia' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Día</span>
            </button>

            <button
              type="button"
              onClick={() => setLighting('atardecer')}
              title="Atardecer Cálido (3200K)"
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                lighting === 'atardecer' ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Sunset className="w-3.5 h-3.5 text-orange-500" />
              <span className="hidden sm:inline">Tarde</span>
            </button>

            <button
              type="button"
              onClick={() => setLighting('noche')}
              title="Noche con Focos LED (2700K)"
              className={`px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition-all cursor-pointer ${
                lighting === 'noche' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Noche</span>
            </button>
          </div>

          {/* Acabado Selector (Mate / Satinado / Brillante) */}
          <div className="flex items-center gap-1 bg-slate-200/70 p-1 rounded-xl border border-slate-300">
            {(['mate', 'satinado', 'brillante'] as FinishMode[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFinish(f)}
                className={`px-2.5 py-1 rounded-lg font-bold capitalize transition-all cursor-pointer text-[11px] ${
                  finish === f ? 'bg-white text-slate-900 shadow-xs font-black' : 'text-slate-600'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Before/After Toggle */}
          <button
            type="button"
            onClick={() => setShowBeforeAfter(!showBeforeAfter)}
            className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-all cursor-pointer border ${
              showBeforeAfter 
                ? 'bg-emerald-600 text-white border-emerald-500 shadow-xs' 
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <SplitSquareVertical className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden md:inline">Comparar Antes/Después</span>
          </button>

        </div>

      </div>

      {/* Main Photographic Canvas Viewport */}
      <div className="relative w-full h-[360px] sm:h-[460px] md:h-[520px] bg-slate-950 overflow-hidden select-none group">
        
        {/* Base Layer: High-Res Real Architectural Photograph */}
        <img
          src={scene.image}
          alt={scene.title}
          className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
          style={{ filter: lightingStyle.filter }}
        />

        {/* Dynamic Architectural Wall Color Tinting Layer */}
        {/* Layer 1: Color Tint Multiply - Blends realistic pigment with stucco / plaster wall textures */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            backgroundColor: activeColorHex,
            mixBlendMode: 'multiply',
            opacity: finishStyle.colorOpacity,
            clipPath: showBeforeAfter ? `polygon(0 0, ${splitSlider}% 0, ${splitSlider}% 100%, 0 100%)` : undefined,
            maskImage: `radial-gradient(circle at 50% 50%, black 75%, transparent 100%)`
          }}
        />

        {/* Layer 2: Color Overlay - Gives accurate chroma and hue vibrancy */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-500"
          style={{
            backgroundColor: activeColorHex,
            mixBlendMode: 'color',
            opacity: 0.65,
            clipPath: showBeforeAfter ? `polygon(0 0, ${splitSlider}% 0, ${splitSlider}% 100%, 0 100%)` : undefined
          }}
        />

        {/* Layer 3: Realistic Sheen / Reflectance based on Finish (Mate vs Satinado vs Brillante) */}
        {finishStyle.sheen !== 'none' && (
          <div 
            className="absolute inset-0 pointer-events-none transition-all duration-500"
            style={{
              background: finishStyle.sheen,
              mixBlendMode: 'overlay',
              opacity: finish === 'brillante' ? 0.45 : 0.25,
              clipPath: showBeforeAfter ? `polygon(0 0, ${splitSlider}% 0, ${splitSlider}% 100%, 0 100%)` : undefined
            }}
          />
        )}

        {/* Ambient Lighting Atmospheric Overlay */}
        <div 
          className="absolute inset-0 pointer-events-none transition-all duration-700"
          style={{ backgroundColor: lightingStyle.overlayColor }}
        />

        {/* Split Screen Slider Handle if Compare Mode is active */}
        {showBeforeAfter && (
          <>
            <div 
              className="absolute top-0 bottom-0 w-1 bg-white shadow-2xl z-30 pointer-events-none"
              style={{ left: `${splitSlider}%` }}
            >
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white text-slate-900 border-2 border-slate-900 shadow-xl flex items-center justify-center text-xs font-black cursor-ew-resize">
                ⇄
              </div>
            </div>
            
            {/* Range Slider for Interaction */}
            <input
              type="range"
              min="0"
              max="100"
              value={splitSlider}
              onChange={(e) => setSplitSlider(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-40"
              aria-label="Deslizador comparativo antes y después"
            />

            {/* Labels Before / After */}
            <div className="absolute top-4 left-4 z-20 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-white/20">
              ColorLink {activeColorName} ({splitSlider}%)
            </div>
            <div className="absolute top-4 right-4 z-20 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-black uppercase px-2.5 py-1 rounded-full border border-white/20">
              Estado Original
            </div>
          </>
        )}

        {/* Scene Info Pill Overlay */}
        <div className="absolute bottom-4 left-4 z-20 bg-slate-950/85 backdrop-blur-md text-white p-3 rounded-2xl border border-white/10 max-w-xs shadow-xl hidden sm:block">
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
            {scene.title}
          </span>
          <p className="text-xs text-slate-200 mt-0.5 font-medium leading-snug">
            {scene.subtitle}
          </p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400">
            <span>Iluminación: <strong className="text-amber-300">{lightingStyle.label}</strong></span>
          </div>
        </div>

        {/* Finish & Guarantee Badge Overlay */}
        <div className="absolute bottom-4 right-4 z-20 bg-white/90 backdrop-blur-md text-slate-900 px-3.5 py-2 rounded-2xl border border-slate-200 shadow-xl flex items-center gap-2">
          <div 
            className="w-4 h-4 rounded-full border border-slate-400 shadow-inner"
            style={{ backgroundColor: activeColorHex }}
          />
          <div className="text-[11px]">
            <span className="font-extrabold block text-slate-950 leading-tight">
              {currentProduct?.name || 'ColorLink Premium'}
            </span>
            <span className="text-slate-600 block text-[10px]">
              Acabado: {finishStyle.label}
            </span>
          </div>
        </div>

      </div>

      {/* Real-time Color Palette Bar: Instant Clicking transforms the Room */}
      <div className="p-4 sm:p-5 bg-white border-t border-slate-200">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Palette className="w-4 h-4 text-emerald-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
              Explora los Tonos Recomendados para esta Pintura
            </h4>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Haz clic en cualquier muestra para pintar la pared
          </span>
        </div>

        {/* Color Swatch Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
          {availableColors.map((c) => {
            const isSelected = c.hex.toLowerCase() === activeColorHex.toLowerCase();
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onSelectColor && onSelectColor(c.id)}
                className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center gap-2.5 ${
                  isSelected 
                    ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-xs' 
                    : 'bg-slate-50 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                }`}
              >
                <div 
                  className="w-6 h-6 rounded-full border border-slate-300 shadow-inner shrink-0 flex items-center justify-center"
                  style={{ backgroundColor: c.hex }}
                >
                  {isSelected && (
                    <Check className={`w-3.5 h-3.5 ${
                      c.hex === '#FFFFFF' || c.hex === '#F3E8DC' || c.hex === '#D1D5DB' 
                        ? 'text-slate-900' 
                        : 'text-white'
                    }`} />
                  )}
                </div>
                <div className="overflow-hidden">
                  <span className="text-xs font-bold text-slate-900 block truncate leading-tight">
                    {c.name}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono block">
                    {c.code}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

    </div>
  );
};
