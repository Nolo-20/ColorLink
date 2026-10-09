import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  ArrowRight, 
  ChevronLeft, 
  ChevronRight, 
  ShieldCheck, 
  Truck, 
  Calculator, 
  Layers, 
  Sparkles, 
  Award, 
  CheckCircle2, 
  Check, 
  Package, 
  Wrench, 
  Bot
} from 'lucide-react';
import { StoreProduct, StoreCategory, StoreProductColor, StoreProductSize } from '../types';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { PaintCanGraphic } from './PaintCanGraphic';
import { ToolGraphic } from './ToolGraphic';

interface StorefrontHomeProps {
  onSelectProduct: (product: StoreProduct) => void;
  onQuickAddToCart: (product: StoreProduct) => void;
  onNavigateToProjects: () => void;
  onOpenCalculator: (product?: StoreProduct) => void;
  selectedCategory: StoreCategory;
  onSelectCategory: (cat: StoreCategory) => void;
  searchFilter: string;
}

export const StorefrontHome: React.FC<StorefrontHomeProps> = ({
  onSelectProduct,
  onQuickAddToCart,
  onNavigateToProjects,
  onOpenCalculator,
  selectedCategory,
  onSelectCategory,
  searchFilter
}) => {
  // Hero Carousel State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const HERO_SLIDES = [
    {
      id: 'slide-koraza',
      title: 'KORAZA',
      tagline: 'PROTECCIÓN SOL & LLUVIA',
      sub: 'PINTURA IMPERMEABILIZANTE ELASTOMÉRICA',
      highlight: 'Máxima duración, protección antihongos y resistencia ante intemperie extrema en fachadas.',
      bgGradient: 'from-amber-600 via-amber-800 to-slate-950',
      textColor: 'text-amber-300',
      image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1000&auto=format&fit=crop&q=80',
      productId: 'koraza-sol-lluvia'
    },
    {
      id: 'slide-viniltex',
      title: 'VINILTEX ULTRALAVABLE',
      tagline: 'TECNOLOGÍA ULTRA PROTECT RESIST',
      sub: 'LÁTEX INTERIOR MATE HIDROFÓBICO',
      highlight: 'Repele líquidos, salsas y manchas difíciles sin desgastar el color ni el acabado aterciopelado.',
      bgGradient: 'from-teal-700 via-emerald-800 to-slate-950',
      textColor: 'text-emerald-300',
      image: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1000&auto=format&fit=crop&q=80',
      productId: 'viniltex-ultralavable'
    },
    {
      id: 'slide-epox',
      title: 'COLORLINK INDUSTRIAL',
      tagline: 'SISTEMAS EPÓXICOS PARA PISOS',
      sub: '100% SÓLIDOS DE ALTO TRÁFICO',
      highlight: 'Resistencia mecánica y química para plantas industriales, bodegas, clínicas y parqueaderos.',
      bgGradient: 'from-blue-700 via-indigo-900 to-slate-950',
      textColor: 'text-cyan-300',
      image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&auto=format&fit=crop&q=80',
      productId: 'colorlink-epox-floor'
    }
  ];

  // Auto-advance carousel
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [HERO_SLIDES.length]);

  // Categories defined as in Pintuco (Image 1)
  const CATEGORIES: Array<{ id: StoreCategory; title: string; subtitle: string; img: string; icon: string }> = [
    {
      id: 'hogar',
      title: 'Hogar',
      subtitle: 'Vinilos, esmaltes y acabados decorativos',
      img: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&auto=format&fit=crop&q=80',
      icon: '🏡'
    },
    {
      id: 'construccion',
      title: 'Construcción y mantenimiento',
      subtitle: 'Impermeabilizantes, fachadas y estucos',
      img: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&auto=format&fit=crop&q=80',
      icon: '🧱'
    },
    {
      id: 'automotriz',
      title: 'Automotriz',
      subtitle: 'Poliuretanos 2K, fondos y barnices espejo',
      img: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=800&auto=format&fit=crop&q=80',
      icon: '🚗'
    },
    {
      id: 'industrial',
      title: 'Industrial',
      subtitle: 'Recubrimientos epóxicos y pisos de tráfico',
      img: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
      icon: '🏭'
    },
    {
      id: 'herramientas',
      title: 'Brochas, Rodillos y Herramientas',
      subtitle: 'Accesorios profesionales de aplicación',
      img: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800&auto=format&fit=crop&q=80',
      icon: '🖌️'
    }
  ];

  // Products filter
  const filteredProducts = STORE_PRODUCTS.filter(p => {
    const matchesCategory = selectedCategory === 'todos' || p.category === selectedCategory;
    const matchesSearch = searchFilter.trim() === '' || 
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.subtitle.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.categoryLabel.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleQuickAdd = (product: StoreProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAddedAnimationId(product.id);
    onQuickAddToCart(product);
    setTimeout(() => {
      setAddedAnimationId(null);
    }, 1000);
  };

  return (
    <div className="space-y-14 pb-16 font-sans">
      
      {/* =================================================================== */}
      {/* 1. HERO CAROUSEL BANNER (Pintuco style banner)                      */}
      {/* =================================================================== */}
      <div
        className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[440px] sm:min-h-[480px] flex items-center shadow-lg"
        onTouchStart={(e) => { (e.currentTarget as any)._x = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const x0 = (e.currentTarget as any)._x;
          if (x0 == null) return;
          const dx = e.changedTouches[0].clientX - x0;
          if (Math.abs(dx) > 45) setCurrentSlide(prev => (prev + (dx < 0 ? 1 : -1) + HERO_SLIDES.length) % HERO_SLIDES.length);
        }}
      >
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const targetProduct = STORE_PRODUCTS.find(p => p.id === slide.productId);

          return (
            <div
              key={slide.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Background gradient & image overlay */}
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.bgGradient} opacity-90`} />
              <img
                src={slide.image}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-30"
                referrerPolicy="no-referrer"
              />

              <div className="relative max-w-7xl mx-auto px-5 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 pb-14 sm:py-12">
                
                {/* Left Text details */}
                <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Lanzamiento Oficial ColorLink</span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-[2rem] leading-none sm:text-6xl font-black tracking-tight text-white uppercase">
                      {slide.title}
                    </h2>
                    <h3 className={`text-lg sm:text-2xl font-black leading-tight ${slide.textColor} tracking-wide`}>
                      {slide.tagline}
                    </h3>
                    <p className="text-[11px] sm:text-sm font-extrabold uppercase tracking-wider text-slate-300">
                      {slide.sub}
                    </p>
                  </div>

                  <p className="text-[13px] sm:text-base text-slate-200 max-w-xl font-medium leading-relaxed line-clamp-3 sm:line-clamp-none">
                    {slide.highlight}
                  </p>

                  <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
                    {targetProduct && (
                      <button
                        type="button"
                        onClick={() => onSelectProduct(targetProduct)}
                        className="px-5 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-[13px] sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer transform hover:-translate-y-0.5"
                      >
                        Conoce más
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenCalculator(targetProduct)}
                      className="px-4 sm:px-6 py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[13px] sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Calcular m² para mi obra</span>
                    </button>
                  </div>
                </div>

                {/* Right Visual Product Card */}
                <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
                  {(() => {
                    const defaultColor = targetProduct?.colors?.[0] || { id: 'c-def', name: 'Blanco Puro', code: '1000', hex: '#FAF9F6' };

                    return (
                      <div 
                        onClick={() => {
                          if (targetProduct) onSelectProduct(targetProduct);
                        }}
                        className="w-72 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/15 p-6 flex flex-col items-center justify-between text-center shadow-2xl transition-all duration-300 hover:border-cyan-400/40 cursor-pointer group"
                      >
                        {/* Product Paint Can Visual */}
                        <div className="py-3 transition-transform duration-300 group-hover:scale-105">
                          <PaintCanGraphic
                            colorHex={defaultColor.hex}
                            colorName={defaultColor.name}
                            productLine={slide.title}
                            sizeName="1 Galón"
                            className="w-44 h-52 drop-shadow-2xl"
                          />
                        </div>

                        {/* Product Info */}
                        <div className="w-full pt-3 pb-2">
                          <h4 className="text-base font-extrabold text-white tracking-wide truncate">
                            {targetProduct?.name || slide.title}
                          </h4>
                          <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">
                            {targetProduct?.categoryLabel || 'Línea Arquitectónica Pro'}
                          </p>
                        </div>

                        {/* Action Button: Ver Producto */}
                        <div className="w-full pt-3 border-t border-white/10">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (targetProduct) onSelectProduct(targetProduct);
                            }}
                            className="w-full py-3 px-4 rounded-xl bg-cyan-400 hover:bg-cyan-300 active:scale-98 text-slate-950 font-black text-xs shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                          >
                            <span>Ver Producto</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>

                      </div>
                    );
                  })()}
                </div>

              </div>
            </div>
          );
        })}

        {/* Carousel Prev/Next Buttons */}
        <button
          type="button"
          onClick={() => setCurrentSlide(prev => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center transition-colors cursor-pointer"
          aria-label="Anterior slide"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length)}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center transition-colors cursor-pointer"
          aria-label="Siguiente slide"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Dots Indicators */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setCurrentSlide(i)}
              className={`w-3 h-3 rounded-full transition-all cursor-pointer ${
                i === currentSlide ? 'bg-white w-8' : 'bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>
      </div>

      {/* =================================================================== */}
      {/* 2. NUESTROS PRODUCTOS (Now navigates to Category View with details) */}
      {/* =================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Nuestros productos
          </h2>
          <p className="text-sm text-slate-600 font-medium">
            Queremos facilitar tu experiencia a la hora de comprar. Haz clic en la categoría para ver sus líneas, aplicaciones y carta de colores.
          </p>
        </div>

        {/* Category Cards (Image 1 layout) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => {
            const isCurrent = selectedCategory === cat.id;

            return (
              <div
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`group rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col bg-white shadow-xs hover:shadow-xl hover:-translate-y-1 ${
                  isCurrent 
                    ? 'border-emerald-600 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-emerald-500/40'
                }`}
              >
                {/* Photo with Overlay Badge */}
                <div className="h-44 overflow-hidden relative bg-slate-100">
                  <img
                    src={cat.img}
                    alt={cat.title}
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80';
                    }}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold flex items-center gap-1">
                    <span>{cat.icon}</span>
                    <span>Explorar</span>
                  </div>
                </div>

                {/* Bottom title & arrow banner */}
                <div className="p-4 flex items-center justify-between gap-2 bg-white flex-1">
                  <div>
                    <h3 className="font-black text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">
                      {cat.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">
                      {cat.subtitle}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-all shrink-0 shadow-xs group-hover:scale-105">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category reset pill */}
        {selectedCategory !== 'todos' && (
          <div className="flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={() => onSelectCategory('todos')}
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              ✕ Mostrar catálogo general completo
            </button>
          </div>
        )}

      </div>

      {/* =================================================================== */}
      {/* 3. LOS MÁS VENDIDOS (With 3D Paint Cans & Cart Animations)          */}
      {/* =================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-2">
        
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Los más vendidos
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Pinturas vinilo tipo 1, impermeabilizantes elastoméricos, recubrimientos epóxicos y herramientas de aplicación profesional
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelectCategory('todos')}
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>Ver catálogo completo ({STORE_PRODUCTS.length} productos)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const defaultSize = product.sizes.find(s => s.id === product.defaultSizeId) || product.sizes[0];
            const defaultColor = product.colors?.find(c => c.id === product.defaultColorId) || product.colors?.[0];
            const isJustAdded = addedAnimationId === product.id;

            return (
              <div
                key={product.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
              >
                {/* Floating animation banner on addition */}
                {isJustAdded && (
                  <div className="absolute inset-0 z-30 bg-emerald-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white font-black animate-fade-scale">
                    <Check className="w-10 h-10 mb-2 animate-bounce" />
                    <span className="text-sm">¡Añadido al Carrito!</span>
                  </div>
                )}

                {/* Top Image Stage */}
                <div 
                  onClick={() => onSelectProduct(product)}
                  className="h-56 bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 flex items-center justify-center relative cursor-pointer overflow-hidden"
                >
                  {product.badge && (
                    <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900 text-white shadow-xs">
                      {product.badge}
                    </span>
                  )}

                  {/* Render 3D Vector Paint Can or Tool Graphic */}
                  {product.isTool ? (
                    <div className="group-hover:-translate-y-1.5 transition-transform duration-300">
                      <ToolGraphic
                        toolType={
                          product.name.toLowerCase().includes('rodillo') ? 'rodillo' :
                          product.name.toLowerCase().includes('cinta') ? 'cinta' :
                          product.name.toLowerCase().includes('espatula') ? 'espatula' :
                          product.name.toLowerCase().includes('bandeja') ? 'bandeja' :
                          product.name.toLowerCase().includes('extension') || product.name.toLowerCase().includes('extensión') ? 'extension' : 'brocha'
                        }
                        productName={product.name}
                        sizeLabel={defaultSize?.name || '3"'}
                        className="w-32 h-40"
                      />
                    </div>
                  ) : (
                    <div className="group-hover:-translate-y-1.5 transition-transform duration-300">
                      <PaintCanGraphic
                        colorHex={defaultColor?.hex || '#FAF9F6'}
                        colorName={defaultColor?.name || product.name}
                        productLine={product.name}
                        className="w-32 h-44"
                      />
                    </div>
                  )}

                  {/* Swatch dots preview */}
                  {product.colors && product.colors.length > 0 && (
                    <div className="absolute bottom-2.5 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
                      <span 
                        className="w-2.5 h-2.5 rounded-full border border-slate-300 shadow-xs shrink-0" 
                        style={{ backgroundColor: defaultColor?.hex || '#ffffff' }}
                      />
                      <span>+{product.colors.length} tonos</span>
                    </div>
                  )}
                </div>

                {/* Body Details - Corporate Enterprise Layout */}
                <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {product.categoryLabel}
                      </span>
                      <span className="text-[9px] font-bold text-slate-400">
                        {product.isTool ? 'HERRAMIENTA' : 'NTC COLOMBIA'}
                      </span>
                    </div>

                    <h3 
                      onClick={() => onSelectProduct(product)}
                      className="font-black text-sm text-slate-900 leading-snug group-hover:text-blue-900 transition-colors cursor-pointer line-clamp-2 pt-0.5"
                    >
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 font-medium leading-relaxed">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Corporate Colombian Dispatch Badge */}
                  <div className="text-[10px] font-semibold text-emerald-800 bg-emerald-50/90 px-2 py-1 rounded-lg border border-emerald-200 flex items-center justify-between">
                    <span>⚡ Despacho 24h Medellín & AM</span>
                    <span className="font-mono text-[9px] font-bold text-emerald-900">Stock</span>
                  </div>

                  {/* Price & Cart Actions */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">
                        Precio desde:
                      </span>
                      <div className="text-base font-black text-slate-950 font-sans">
                        ${defaultSize.price.toLocaleString('es-CO')}{' '}
                        <span className="text-[10px] font-bold text-slate-500">COP</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleQuickAdd(product, e)}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xs hover:shadow-md transition-all cursor-pointer"
                      title="Añadir al carrito de compras"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="w-full py-2 bg-slate-50 hover:bg-blue-900 hover:text-white text-slate-800 font-bold text-xs rounded-xl border border-slate-200 hover:border-blue-900 transition-all cursor-pointer text-center"
                  >
                    Ver Ficha & Carta de Tonos →
                  </button>
                </div>

              </div>
            );
          })}
        </div>

      </div>

      {/* =================================================================== */}
      {/* 4. SECCIÓN PROYECTOS & ASESORÍA TÉCNICA                             */}
      {/* =================================================================== */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>División de Proyectos & Obras ColorLink</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              ¿Tienes una obra, constructora o proyecto arquitectónico?
            </h2>

            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Además de nuestra tienda, ofrecemos <strong>gestión técnica de proyectos</strong>: diagnóstico de patologías de humedad y fisuras con IA, cálculo milimétrico de cuñetes por m², tintometría computarizada y seguimiento de peritaje de calidad para ingenieros residentes.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onNavigateToProjects}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Acceder a la Plataforma de Proyectos</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => onOpenCalculator()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Calculadora de Cuñetes para Obra</span>
              </button>
            </div>
          </div>

          <div className="lg:col-span-4 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-emerald-400 block">+150</span>
              <span className="text-slate-300 font-semibold mt-1 block">Obras Asistidas en Colombia</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-cyan-400 block">NTC 1335</span>
              <span className="text-slate-300 font-semibold mt-1 block">Certificación Tipo 1</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-amber-400 block">24h</span>
              <span className="text-slate-300 font-semibold mt-1 block">Despacho Inmediato</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-purple-400 block">30 Días</span>
              <span className="text-slate-300 font-semibold mt-1 block">Crédito a Constructoras</span>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};
