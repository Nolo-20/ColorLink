import { ProductReviewsSection, Stars, useProductReviews } from './Reviews';
import React, { useState } from 'react';
import { 
  Calculator, 
  MapPin, 
  Share2, 
  CheckCircle2, 
  ShoppingCart, 
  ArrowLeft, 
  Palette, 
  Package, 
  Info, 
  ShieldCheck, 
  Truck, 
  Droplet,
  Check,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  ChevronRight,
  Star,
  Zap,
  Eye,
  Sparkles
} from 'lucide-react';
import { StoreProduct, StoreProductColor, StoreProductSize } from '../types';
import { PaintCalculatorModal } from './PaintCalculatorModal';
import { BranchLocatorModal } from './BranchLocatorModal';
import { AmbientWallVisualizer, isLightColor } from './AmbientWallVisualizer';
import { PaintCanGraphic } from './PaintCanGraphic';
import { ToolGraphic } from './ToolGraphic';
import { motion, AnimatePresence } from 'motion/react';

interface ProductDetailViewProps {
  product: StoreProduct;
  initialColorId?: string;
  onAddToCart: (product: StoreProduct, size: StoreProductSize, color?: StoreProductColor, quantity?: number) => void;
  onBuyNow: (product: StoreProduct, size: StoreProductSize, color?: StoreProductColor, quantity?: number) => void;
  onBackToCatalog: () => void;
  onNavigateToStores?: () => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  product,
  initialColorId,
  onAddToCart,
  onBuyNow,
  onBackToCatalog,
  onNavigateToStores
}) => {
  // Current selected color (defaults to initialColorId, first in-stock color or defaultColorId)
  const [selectedColorId, setSelectedColorId] = useState<string>(() => {
    if (initialColorId && product.colors?.some(c => c.id === initialColorId)) {
      return initialColorId;
    }
    if (product.colors && product.colors.length > 0) {
      const defaultCol = product.colors.find(c => c.id === product.defaultColorId && c.inStock);
      if (defaultCol) return defaultCol.id;
      const firstInStock = product.colors.find(c => c.inStock);
      return firstInStock ? firstInStock.id : product.colors[0].id;
    }
    return '';
  });

  // Current selected size (defaults to first in-stock size or defaultSizeId)
  const [selectedSizeId, setSelectedSizeId] = useState<string>(() => {
    if (product.sizes && product.sizes.length > 0) {
      const defaultS = product.sizes.find(s => s.id === product.defaultSizeId && s.inStock);
      if (defaultS) return defaultS.id;
      const firstInStock = product.sizes.find(s => s.inStock);
      return firstInStock ? firstInStock.id : product.sizes[0].id;
    }
    return '';
  });

  // Keep state synchronized when product or initialColorId changes
  React.useEffect(() => {
    if (initialColorId && product.colors?.some(c => c.id === initialColorId)) {
      setSelectedColorId(initialColorId);
    } else if (product.colors && product.colors.length > 0) {
      const defaultCol = product.colors.find(c => c.id === product.defaultColorId && c.inStock);
      setSelectedColorId(defaultCol ? defaultCol.id : product.colors[0].id);
    }

    if (product.sizes && product.sizes.length > 0) {
      const defaultS = product.sizes.find(s => s.id === product.defaultSizeId && s.inStock);
      setSelectedSizeId(defaultS ? defaultS.id : product.sizes[0].id);
    }
  }, [product.id, initialColorId]);

  const [quantity, setQuantity] = useState<number>(1);
  const [showColorPalette, setShowColorPalette] = useState<boolean>(true);
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState<boolean>(false);
  const [isCalculatorOpen, setIsCalculatorOpen] = useState<boolean>(false);
  const [isBranchLocatorOpen, setIsBranchLocatorOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isVisualizerOpen, setIsVisualizerOpen] = useState<boolean>(false);

  const selectedColor = product.colors?.find(c => c.id === selectedColorId);
  const selectedSize = product.sizes?.find(s => s.id === selectedSizeId) || product.sizes[0];

  const isCurrentSelectionInStock = (selectedColor ? selectedColor.inStock : true) && (selectedSize ? selectedSize.inStock : true);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleShare = (platform: 'whatsapp' | 'facebook' | 'x') => {
    const text = encodeURIComponent(`Mira este producto en ColorLink: ${product.name} - ${window.location.href}`);
    if (platform === 'whatsapp') {
      window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    } else if (platform === 'facebook') {
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`, '_blank');
    } else {
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');
    }
  };

  const opiniones = useProductReviews(product.id);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Breadcrumb / Back button */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onBackToCatalog}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-600 hover:text-slate-950 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo</span>
        </button>

        {!product.isTool && (
          <div className="hidden sm:flex items-center gap-2">
            {isVisualizerOpen ? (
              <button
                type="button"
                onClick={() => setIsVisualizerOpen(false)}
                className="text-[11px] font-bold text-slate-700 hover:text-slate-950 bg-slate-100 hover:bg-slate-200 px-3 py-1 rounded-full border border-slate-300 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <span>← Volver a vista de producto</span>
              </button>
            ) : (
              <span className="text-[11px] font-bold text-[#0B1E48] bg-blue-50 px-3 py-1 rounded-full border border-blue-200 inline-flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#0B1E48] animate-pulse" />
                Vista de Presentación Oficial 3D
              </span>
            )}
          </div>
        )}
      </div>

      {/* ======================================================== */}
      {/* MAIN PRODUCT LAYOUT (Exact Match with Image 7) */}
      {/* Left Column (7 cols): Solo Product Stage / Visualizer */}
      {/* Right Column (5 cols): Product Details & Options */}
      {/* ======================================================== */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-start">
        
        {/* ======================================================== */}
        {/* LEFT COLUMN: SOLO PRODUCT STAGE / AMBIENT VISUALIZER */}
        {/* ======================================================== */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {!product.isTool ? (
            <AnimatePresence mode="wait">
              {!isVisualizerOpen ? (
                /* ---------------------------------------------------- */
                /* 1. DEFAULT VIEW: SOLO EL PRODUCTO (Product Showcase) */
                /* ---------------------------------------------------- */
                <motion.div
                  key="product-solo-stage"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0.3, scale: 0.96 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full rounded-3xl border border-slate-200 bg-gradient-to-b from-slate-50 via-slate-100/50 to-slate-200/40 p-3 sm:p-8 flex flex-col items-center justify-between min-h-[420px] sm:min-h-[530px] relative overflow-hidden shadow-xs"
                >
                  {/* Dynamic subtle radial lighting matching selected color */}
                  <div 
                    className="absolute inset-0 pointer-events-none transition-colors duration-700 opacity-60"
                    style={{
                      background: `radial-gradient(circle at 50% 45%, ${selectedColor?.hex || '#0B1E48'}22 0%, transparent 65%)`
                    }}
                  />

                  {/* Top Badges */}
                  <div className="w-full flex items-center justify-between z-10">
                    {/* Selected Color Badge */}
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/95 border border-slate-200 shadow-xs backdrop-blur-xs">
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs" 
                        style={{ backgroundColor: selectedColor?.hex || '#FAF9F6' }}
                      />
                      <span className="text-xs font-black text-slate-800 tracking-wide">
                        {selectedColor?.name || 'Color Base'}
                      </span>
                    </div>

                    {/* Selected Size Badge */}
                    <span className="text-xs font-black text-[#0B1E48] bg-blue-50/95 px-3.5 py-1.5 rounded-full border border-blue-200">
                      {selectedSize.name}
                    </span>
                  </div>

                  {/* Centered Large Interactive Paint Can / Bucket */}
                  {/* Animates DOWNWARD (minimizing) when opening visualizer */}
                  <div className="relative my-auto py-4 flex flex-col items-center justify-center z-10">
                    <motion.div
                      key={`stage-can-${selectedSize.id}-${selectedColorId}`}
                      initial={{ y: 80, scale: 0.7, opacity: 0 }}
                      animate={{ y: 0, scale: 1, opacity: 1 }}
                      exit={{ y: 130, scale: 0.45, opacity: 0 }}
                      transition={{ duration: 0.38, ease: [0.22, 1, 0.36, 1] }}
                      className="relative flex items-center justify-center"
                    >
                      <PaintCanGraphic
                        colorHex={selectedColor?.hex || '#FAF9F6'}
                        colorName={selectedColor?.name || 'Blanco Nieve'}
                        productLine={product.name}
                        sizeName={selectedSize.name}
                        category={product.category}
                        className="w-56 h-72 sm:w-64 sm:h-80 drop-shadow-2xl"
                      />
                    </motion.div>

                    {/* Pedestal Floor Shadow */}
                    <motion.div 
                      exit={{ opacity: 0, scale: 0.5 }}
                      transition={{ duration: 0.25 }}
                      className="w-48 sm:w-56 h-4 bg-slate-950/15 blur-sm rounded-full -mt-2" 
                    />
                  </div>

                  {/* Visualizer Trigger Button */}
                  <div className="w-full z-10 pt-2">
                    {(() => {
                      const buttonContent = (() => {
                        switch (product.category) {
                          case 'automotriz':
                            return {
                              title: 'Visualizar color en carrocería 2K',
                              subtitle: 'Simula el acabado poliuretano de alto brillo en estudio y luz diurna'
                            };
                          case 'industrial':
                            return {
                              title: 'Visualizar recubrimiento en pisos industriales',
                              subtitle: 'Simula el acabado epóxico autonivelante de alto tráfico'
                            };
                          case 'construccion':
                            return {
                              title: 'Visualizar en fachadas y exteriores',
                              subtitle: 'Aprecia el recubrimiento impermeable sobre muros exteriores'
                            };
                          case 'hogar':
                          default:
                            return {
                              title: 'Visualizar color aplicado en pared',
                              subtitle: 'Mira cómo luce aplicado en salas, dormitorios y terrazas'
                            };
                        }
                      })();

                      return (
                        <button
                          type="button"
                          onClick={() => setIsVisualizerOpen(true)}
                          className="w-full py-3 sm:py-3.5 px-3 sm:px-5 gap-2 rounded-2xl bg-gradient-to-r from-[#0B1E48] via-blue-900 to-[#0B1E48] hover:from-blue-900 hover:to-blue-950 text-white font-black text-xs sm:text-sm shadow-lg flex items-center justify-between transition-all group cursor-pointer border border-blue-800/60 active:scale-99"
                        >
                          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                            <span className="w-9 h-9 shrink-0 rounded-xl bg-white/15 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                              <Eye className="w-4.5 h-4.5" />
                            </span>
                            <div className="text-left min-w-0">
                              <span className="block font-black text-xs sm:text-sm leading-snug">{buttonContent.title}</span>
                              <span className="block text-[11px] text-blue-200 font-medium">{buttonContent.subtitle}</span>
                            </div>
                          </div>
                          <span className="shrink-0 inline-flex items-center gap-1 text-emerald-400 font-black text-xs px-2 sm:px-3 py-1.5 rounded-xl bg-white/10 group-hover:bg-white/20 transition-colors">
                            <span className="hidden sm:inline">Visualizar</span>
                            <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </button>
                      );
                    })()}
                  </div>
                </motion.div>
              ) : (
                /* ---------------------------------------------------- */
                /* 2. AMBIENT WALL VISUALIZER (Real Photographic View) */
                /* ---------------------------------------------------- */
                <motion.div
                  key="ambient-visualizer-view"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                  className="w-full"
                >
                  <AmbientWallVisualizer
                    currentProduct={product}
                    selectedColor={selectedColor}
                    selectedSize={selectedSize}
                    onSelectSize={(sizeId) => setSelectedSizeId(sizeId)}
                    onClose={() => setIsVisualizerOpen(false)}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          ) : (
            /* ---------------------------------------------------- */
            /* 3. TOOL DISPLAY STAGE (Wall Painting Tools)          */
            /* ---------------------------------------------------- */
            <div className="bg-slate-50 rounded-3xl border border-slate-200 overflow-hidden flex flex-col items-center p-4 sm:p-8 space-y-6">
              {/* Badge indicando herramienta profesional de pintor */}
              <div className="px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-black shadow-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Herramienta Profesional de Aplicación</span>
              </div>

              {/* Main Tool Display Area: Solo la visual de la herramienta */}
              <div className="w-full flex items-center justify-center min-h-[300px] sm:min-h-[360px] py-2">
                <ToolGraphic
                  toolType={
                    product.name.toLowerCase().includes('rodillo') ? 'rodillo' :
                    product.name.toLowerCase().includes('cinta') ? 'cinta' :
                    product.name.toLowerCase().includes('espatula') ? 'espatula' :
                    product.name.toLowerCase().includes('bandeja') ? 'bandeja' :
                    product.name.toLowerCase().includes('extension') || product.name.toLowerCase().includes('extensión') ? 'extension' : 'brocha'
                  }
                  productName={product.name}
                  sizeLabel={selectedSize?.name || '3"'}
                  className="w-56 h-68 sm:w-64 sm:h-80"
                />
              </div>

              {/* Quality Guarantee Callout */}
              <div className="w-full bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs flex flex-wrap items-center justify-around gap-3 text-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-black">
                    ✓
                  </span>
                  <span className="font-bold text-slate-800">Uso en Paredes & Techos</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-black">
                    ★
                  </span>
                  <span className="font-bold text-slate-800">Calidad de Pintor Maestro</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center font-black">
                    🛡
                  </span>
                  <span className="font-bold text-slate-800">Cero Rayas de Pasada</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* RIGHT COLUMN: PRODUCT INFO & CONTROLS (Screenshot 7) */}
        {/* ======================================================== */}
        <div className="lg:col-span-5 space-y-5">
          
          {/* Product Title */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-950 tracking-tight leading-tight">
              {product.name} {!product.isTool && selectedColor ? selectedColor.name : ''}
            </h1>

            {/* Quick Badge & Reviews */}
            <div className="flex flex-wrap items-center gap-3 mt-2.5">
              <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-black px-2.5 py-1 rounded-full border border-emerald-200">
                <Zap className="w-3.5 h-3.5 fill-emerald-600 text-emerald-600" />
                <span>Retira hoy*</span>
              </span>

              <a
                href="#opiniones"
                onClick={(e) => { e.preventDefault(); document.getElementById('opiniones')?.scrollIntoView({ behavior: 'smooth' }); }}
                className="flex items-center gap-1.5 text-xs hover:underline"
              >
                <Stars value={opiniones?.promedio || 0} size="w-3.5 h-3.5" />
                <span className="font-bold text-slate-600">
                  {!opiniones ? '' : opiniones.total === 0 ? 'Sin opiniones aún' : `${opiniones.promedio.toFixed(1)} · ${opiniones.total} ${opiniones.total === 1 ? 'opinión' : 'opiniones'}`}
                </span>
              </a>
            </div>

            {/* Description with Ver más / Ver menos */}
            <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
              <p className={isDescriptionExpanded ? '' : 'line-clamp-2'}>
                {product.description}
              </p>
              <button
                type="button"
                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                className="text-xs font-bold text-[#0B1E48] hover:underline mt-1 inline-flex items-center gap-1 cursor-pointer"
              >
                <span>{isDescriptionExpanded ? 'Ver menos' : 'Ver más'}</span>
                {isDescriptionExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ELIGE UN COLOR (Para Pinturas)                           */}
          {/* ======================================================== */}
          {!product.isTool && product.colors && product.colors.length > 0 && (
            <div className="space-y-3 pt-1 border-t border-slate-100">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                Elige un color:
              </span>

              {/* Main Selected Color Button (Image 7 Style with High Contrast) */}
              {(() => {
                const isSelectedLight = selectedColor ? isLightColor(selectedColor.hex) : false;
                return (
                  <button
                    type="button"
                    onClick={() => setShowColorPalette(!showColorPalette)}
                    className={`w-full py-3.5 px-4 rounded-xl shadow-xs border flex items-center justify-between transition-transform active:scale-99 cursor-pointer ${
                      isSelectedLight ? 'border-slate-400 ring-1 ring-slate-300' : 'border-slate-300'
                    }`}
                    style={{ backgroundColor: selectedColor?.hex || '#FFFFFF' }}
                  >
                    <span className={`font-black text-xs sm:text-sm tracking-wide ${
                      isSelectedLight ? 'text-slate-950' : 'text-white drop-shadow-md'
                    }`}>
                      {selectedColor?.name || 'Selecciona un color'}
                    </span>

                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                      isSelectedLight ? 'bg-slate-900/15 text-slate-950' : 'bg-black/25 text-white'
                    }`}>
                      <Palette className="w-4 h-4" />
                    </div>
                  </button>
                );
              })()}

              {/* Collapsible Swatches Grid Palette */}
              {showColorPalette && (
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2 animate-in fade-in duration-150">
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                    {product.colors.map((color) => {
                      const isSelected = selectedColorId === color.id;
                      const isOutOfStock = !color.inStock;
                      const colorIsLight = isLightColor(color.hex);

                      return (
                        <button
                          key={color.id}
                          type="button"
                          onClick={() => !isOutOfStock && setSelectedColorId(color.id)}
                          disabled={isOutOfStock}
                          title={isOutOfStock ? `${color.name} (Sin Stock)` : color.name}
                          className={`relative w-10 h-10 rounded-full transition-all flex items-center justify-center cursor-pointer ${
                            isSelected 
                              ? 'ring-3 ring-[#0B1E48] ring-offset-2 scale-110 shadow-md' 
                              : 'hover:scale-105 border border-slate-300'
                          } ${
                            isOutOfStock 
                              ? 'opacity-35 grayscale cursor-not-allowed border-dashed border-2 border-slate-400' 
                              : ''
                          }`}
                          style={{ backgroundColor: color.hex }}
                        >
                          {isSelected && (
                            <Check className={`w-4 h-4 ${colorIsLight ? 'text-slate-950 stroke-[3]' : 'text-white'}`} />
                          )}
                          {isOutOfStock && (
                            <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-800 bg-white/70 rounded-full">
                              ✕
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <p className="text-[11px] text-slate-400 italic">
                    *Los colores mostrados son referenciales y pueden variar según tu pantalla.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* GUÍA DE APLICACIÓN DE LA HERRAMIENTA                     */}
          {/* ======================================================== */}
          {product.isTool && (
            <div className="space-y-2.5 pt-1 border-t border-slate-100">
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                Aplicación y Superficies Recomendadas:
              </span>
              <div className="bg-blue-50/70 border border-blue-200/80 rounded-2xl p-3.5 text-xs text-slate-700 space-y-1.5">
                <p className="font-bold text-[#0B1E48]">
                  Herramienta profesional para pintura arquitectónica de paredes y muros
                </p>
                <p className="text-slate-600 leading-relaxed">
                  {product.subtitle || 'Diseñada para brindar cobertura homogénea y recortar ángulos limpios en uniones de zócalos, techos y marcos.'}
                </p>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ELIGE UN TAMAÑO O MEDIDAS (Exact Match with Screenshot 7) */}
          {/* ======================================================== */}
          <div className="space-y-2.5 pt-1 border-t border-slate-100">
            <span className="text-xs sm:text-sm font-bold text-slate-900 block">
              {product.isTool ? 'Medidas y Presentación:' : 'Elige un tamaño:'}
            </span>

            <div className="flex flex-wrap gap-2.5">
              {product.sizes.map((size) => {
                const isSelected = selectedSizeId === size.id;
                const isOutOfStock = !size.inStock;

                return (
                  <button
                    key={size.id}
                    type="button"
                    onClick={() => !isOutOfStock && setSelectedSizeId(size.id)}
                    disabled={isOutOfStock}
                    className={`py-2 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B1E48] text-white shadow-md'
                        : 'bg-white border border-slate-300 text-slate-700 hover:border-slate-500'
                    } ${isOutOfStock ? 'opacity-40 cursor-not-allowed border-dashed' : ''}`}
                  >
                    <span>{size.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ======================================================== */}
          {/* BOTÓN CALCULADORA (Exact Match with Screenshot 7) */}
          {/* ======================================================== */}
          {!product.isTool && (
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setIsCalculatorOpen(true)}
                className="w-full py-3 px-4 rounded-xl border border-[#0B1E48] text-[#0B1E48] hover:bg-blue-50/50 font-extrabold text-xs sm:text-sm flex items-center justify-between transition-all cursor-pointer shadow-xs"
              >
                <span>Calcula cuánta pintura necesitas</span>
                <Calculator className="w-5 h-5 text-[#0B1E48]" />
              </button>
            </div>
          )}

          {/* Price & Quantity Block */}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Precio unitario:</span>
              <div className="text-2xl sm:text-3xl font-black text-slate-950">
                ${(selectedSize.price * quantity).toLocaleString('es-CO')}
                <span className="text-xs text-slate-500 font-bold ml-1.5">COP</span>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="flex items-center bg-slate-100 border border-slate-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center font-bold text-slate-700 cursor-pointer"
              >
                -
              </button>
              <span className="w-9 text-center font-black text-sm text-slate-900">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity(quantity + 1)}
                className="w-8 h-8 rounded-lg hover:bg-white flex items-center justify-center font-bold text-slate-700 cursor-pointer"
              >
                +
              </button>
            </div>
          </div>

          {/* ======================================================== */}
          {/* ACTION BUTTONS (Añadir al Carrito / Comprar Ahora) */}
          {/* ======================================================== */}
          <div className="flex flex-col sm:flex-row gap-3 pt-1">
            <button
              type="button"
              onClick={() => {
                if (isCurrentSelectionInStock) {
                  onBuyNow(product, selectedSize, selectedColor, quantity);
                }
              }}
              disabled={!isCurrentSelectionInStock}
              className="flex-1 py-3.5 px-6 bg-[#0B1528] hover:bg-slate-800 text-white font-black text-sm rounded-xl shadow-md transition-all text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wider"
            >
              {isCurrentSelectionInStock ? 'Comprar Ahora' : 'Agotado'}
            </button>

            <button
              type="button"
              onClick={() => {
                if (isCurrentSelectionInStock) {
                  onAddToCart(product, selectedSize, selectedColor, quantity);
                  showToast(`¡${product.name} (${selectedSize.name}) añadido al carrito!`);
                }
              }}
              disabled={!isCurrentSelectionInStock}
              className="py-3.5 px-6 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Añadir al Carrito</span>
            </button>
          </div>

          {/* Store Locator Link */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToStores) {
                  onNavigateToStores();
                } else {
                  setIsBranchLocatorOpen(true);
                }
              }}
              className="text-xs font-bold text-slate-700 hover:text-[#0B1E48] flex items-center gap-2 cursor-pointer transition-colors"
            >
              <MapPin className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="underline decoration-slate-300">
                Encuentra tu tienda ColorLink más cercana para retiro gratis
              </span>
            </button>
          </div>

          {/* Social Sharing */}
          <div className="pt-3 border-t border-slate-100 flex items-center gap-3 text-xs text-slate-500 font-bold uppercase tracking-wider">
            <span>Compartir:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleShare('facebook')}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-600 flex items-center justify-center text-xs font-black cursor-pointer"
                title="Compartir en Facebook"
              >
                f
              </button>
              <button
                type="button"
                onClick={() => handleShare('whatsapp')}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-600 flex items-center justify-center text-xs font-black cursor-pointer"
                title="Compartir en WhatsApp"
              >
                W
              </button>
              <button
                type="button"
                onClick={() => handleShare('x')}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-950 flex items-center justify-center text-xs font-black cursor-pointer"
                title="Compartir en X"
              >
                𝕏
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* ======================================================== */}
      {/* TECHNICAL SPECS SECTION AT BOTTOM */}
      {/* ======================================================== */}
      <div className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-4 sm:p-8">
        <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
          <Info className="w-5 h-5 text-emerald-600" />
          <span>Ficha Técnica y Rendimiento Oficial</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">Rendimiento Teórico</span>
            <span className="text-sm font-black text-slate-900 mt-1 block">{product.specs.rendimiento}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">Tiempos de Secado</span>
            <span className="text-sm font-black text-slate-900 mt-1 block">{product.specs.secado}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">Base Química</span>
            <span className="text-sm font-black text-slate-900 mt-1 block">{product.specs.base}</span>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <span className="text-xs font-bold text-slate-500 block">Acabado Final</span>
            <span className="text-sm font-black text-slate-900 mt-1 block">{product.specs.acabado}</span>
          </div>
        </div>
      </div>

      {/* Opiniones reales de clientes (compras verificadas) */}
      <ProductReviewsSection data={opiniones} productName={product.name} />

      {/* Paint Calculator Modal (Exact Match with Screenshot 8) */}
      <PaintCalculatorModal
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
        product={product}
        onApplyQuantity={(galCount, sizeId) => {
          setQuantity(galCount);
          if (sizeId) {
            const matchingSize = product.sizes.find(s => s.id === sizeId && s.inStock);
            if (matchingSize) setSelectedSizeId(matchingSize.id);
          }
          showToast(`¡Calculadora aplicada! ${galCount} galones configurados.`);
        }}
      />

      {/* Branch Locator Modal */}
      <BranchLocatorModal
        isOpen={isBranchLocatorOpen}
        onClose={() => setIsBranchLocatorOpen(false)}
      />

    </div>
  );
};
