import { buscarProductos } from '../utils/productSearch';
import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ShoppingCart,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Calculator,
  Layers,
  Sparkles,
  Check,
  SearchX
} from 'lucide-react';
import { StoreProduct, StoreCategory } from '../types';
import { STORE_PRODUCTS, STORE_BRANCHES, formatCOP, toolTypeFor } from '../data/storeProducts';
import { sceneImage } from '../data/visualizerScenes';
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
  /** Quita el filtro de búsqueda (vuelve al catálogo completo) */
  onClearSearch?: () => void;
}

// Banner principal: fondo con fotos reales de ambientes (public/visualizer)
const HERO_SLIDES = [
  {
    id: 'slide-koraza',
    title: 'KORAZA',
    tagline: 'PROTECCIÓN SOL & LLUVIA',
    sub: 'PINTURA IMPERMEABILIZANTE ELASTOMÉRICA',
    highlight: 'Máxima duración, protección antihongos y resistencia a la intemperie en fachadas.',
    overlay: 'from-slate-950/95 via-amber-950/75 to-slate-950/10',
    textColor: 'text-amber-300',
    scene: 'casa_moderna',
    productId: 'koraza-sol-lluvia'
  },
  {
    id: 'slide-viniltex',
    title: 'VINILTEX ULTRALAVABLE',
    tagline: 'TECNOLOGÍA ULTRA PROTECT RESIST',
    sub: 'LÁTEX INTERIOR MATE HIDROFÓBICO',
    highlight: 'Repele líquidos, salsas y manchas difíciles sin desgastar el color ni el acabado mate.',
    overlay: 'from-slate-950/95 via-emerald-950/75 to-slate-950/10',
    textColor: 'text-emerald-300',
    scene: 'sala',
    productId: 'viniltex-ultralavable'
  },
  {
    id: 'slide-epox',
    title: 'EPÓXICO PARA PISOS',
    tagline: 'SISTEMAS EPÓXICOS DE ALTO TRÁFICO',
    sub: 'ALTOS SÓLIDOS · BODEGAS Y PARQUEADEROS',
    highlight: 'Resistencia mecánica y química para plantas industriales, bodegas, clínicas y parqueaderos.',
    overlay: 'from-slate-950/95 via-blue-950/75 to-slate-950/10',
    textColor: 'text-cyan-300',
    scene: 'bodega',
    productId: 'epoxico-altos-solidos-pisos'
  }
] as const;

const CATEGORIES: Array<{ id: StoreCategory; title: string; subtitle: string; img: string; contain?: boolean }> = [
  { id: 'hogar', title: 'Hogar', subtitle: 'Vinilos, esmaltes y acabados decorativos', img: sceneImage('sala') },
  { id: 'construccion', title: 'Construcción y mantenimiento', subtitle: 'Impermeabilizantes y fachadas', img: sceneImage('casa_colonial') },
  { id: 'automotriz', title: 'Automotriz', subtitle: 'Poliuretanos 2K y repintado', img: sceneImage('carro_lateral') },
  { id: 'industrial', title: 'Industrial', subtitle: 'Recubrimientos epóxicos y pisos de tráfico', img: sceneImage('planta') },
  { id: 'herramientas', title: 'Brochas, rodillos y herramientas', subtitle: 'Accesorios profesionales de aplicación', img: '/products/tool-rodillo-9.webp', contain: true }
];

const PAGE_SIZE = 8;

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

/** Precio más bajo disponible del producto (para "Desde"). */
const minPrice = (p: StoreProduct) => {
  const sizes = p.sizes.filter(s => s.inStock);
  const list = sizes.length ? sizes : p.sizes;
  return Math.min(...list.map(s => s.price));
};

/** Imagen con respaldo: si la foto no carga se oculta y queda el degradado de marca. */
const SafeImg: React.FC<React.ImgHTMLAttributes<HTMLImageElement>> = (props) => {
  const [failed, setFailed] = useState(false);
  if (failed || !props.src) return null;
  return <img {...props} onError={() => setFailed(true)} />;
};

export const StorefrontHome: React.FC<StorefrontHomeProps> = ({
  onSelectProduct,
  onQuickAddToCart,
  onNavigateToProjects,
  onOpenCalculator,
  selectedCategory,
  onSelectCategory,
  searchFilter,
  onClearSearch
}) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHeroPaused, setIsHeroPaused] = useState(false);
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const touchStartX = useRef<number | null>(null);
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const catalogRef = useRef<HTMLDivElement>(null);

  const goToSlide = (idx: number) => setCurrentSlide((idx + HERO_SLIDES.length) % HERO_SLIDES.length);

  // Avance automático (se reinicia cada vez que el usuario cambia de slide y se pausa con el cursor encima)
  useEffect(() => {
    if (isHeroPaused) return;
    const timer = setTimeout(() => setCurrentSlide(prev => (prev + 1) % HERO_SLIDES.length), 6000);
    return () => clearTimeout(timer);
  }, [currentSlide, isHeroPaused]);

  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  // Si cambia la búsqueda o la categoría, se vuelve a la primera "página"
  useEffect(() => { setVisibleCount(PAGE_SIZE); }, [searchFilter, selectedCategory]);

  const query = normalize(searchFilter.trim().slice(0, 80));
  // Misma búsqueda que las sugerencias del encabezado (sin tildes, sinónimos y tolerante a un error de tipeo)
  const filteredProducts = useMemo(() => {
    const base = query ? buscarProductos(searchFilter, 200) : STORE_PRODUCTS;
    return base.filter(p => selectedCategory === 'todos' || p.category === selectedCategory);
  }, [selectedCategory, query, searchFilter]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const cityCount = new Set(STORE_BRANCHES.map(b => b.city)).size;

  const handleQuickAdd = (product: StoreProduct, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setAddedAnimationId(product.id);
    onQuickAddToCart(product);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAddedAnimationId(null), 1000);
  };

  const scrollToCatalog = () => {
    if (selectedCategory !== 'todos') onSelectCategory('todos');
    catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-14 pb-16 font-sans">

      {/* 1. BANNER PRINCIPAL */}
      <section
        aria-roledescription="carrusel"
        aria-label="Productos destacados"
        className="relative w-full overflow-hidden bg-slate-950 text-white min-h-[440px] sm:min-h-[480px] flex items-center shadow-lg"
        onMouseEnter={() => setIsHeroPaused(true)}
        onMouseLeave={() => setIsHeroPaused(false)}
        onTouchStart={(e) => { touchStartX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          const x0 = touchStartX.current;
          touchStartX.current = null;
          if (x0 == null) return;
          const dx = e.changedTouches[0].clientX - x0;
          if (Math.abs(dx) > 45) goToSlide(currentSlide + (dx < 0 ? 1 : -1));
        }}
      >
        {HERO_SLIDES.map((slide, idx) => {
          const isActive = idx === currentSlide;
          const targetProduct = STORE_PRODUCTS.find(p => p.id === slide.productId);
          const defaultColor = targetProduct?.colors?.find(c => c.id === targetProduct.defaultColorId) || targetProduct?.colors?.[0];
          const defaultSize = targetProduct?.sizes.find(s => s.id === targetProduct.defaultSizeId) || targetProduct?.sizes[0];

          return (
            <div
              key={slide.id}
              aria-hidden={!isActive}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex items-center ${
                isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {/* Foto real del ambiente + velo oscuro para que el texto se lea */}
              <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-[#0B1E48]" />
              <SafeImg
                src={sceneImage(slide.scene)}
                alt=""
                aria-hidden="true"
                loading={idx === 0 ? 'eager' : 'lazy'}
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className={`absolute inset-0 bg-gradient-to-r ${slide.overlay}`} />
              <div className="absolute inset-0 bg-slate-950/25 lg:bg-transparent" />

              <div className="relative max-w-7xl mx-auto px-5 sm:px-12 w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pt-8 pb-14 sm:py-12">
                <div className="lg:col-span-8 space-y-3 sm:space-y-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-[10px] sm:text-xs font-bold text-white uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Línea ColorLink</span>
                  </div>

                  <div className="space-y-1">
                    <h2 className="text-[2rem] leading-none sm:text-6xl font-black tracking-tight text-white uppercase drop-shadow-lg break-words">
                      {slide.title}
                    </h2>
                    <h3 className={`text-lg sm:text-2xl font-black leading-tight ${slide.textColor} tracking-wide drop-shadow`}>
                      {slide.tagline}
                    </h3>
                    <p className="text-[11px] sm:text-sm font-extrabold uppercase tracking-wider text-slate-200">
                      {slide.sub}
                    </p>
                  </div>

                  <p className="text-[13px] sm:text-base text-slate-100 max-w-xl font-medium leading-relaxed line-clamp-3 sm:line-clamp-none drop-shadow">
                    {slide.highlight}
                  </p>

                  <div className="pt-2 sm:pt-3 flex flex-wrap items-center gap-2.5 sm:gap-3">
                    {targetProduct && (
                      <button
                        type="button"
                        tabIndex={isActive ? 0 : -1}
                        onClick={() => onSelectProduct(targetProduct)}
                        className="px-5 sm:px-8 py-3 sm:py-3.5 bg-white hover:bg-slate-100 text-slate-950 font-black text-[13px] sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer"
                      >
                        Conoce más
                      </button>
                    )}
                    <button
                      type="button"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => onOpenCalculator(targetProduct)}
                      className="px-4 sm:px-6 py-3 sm:py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-[13px] sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                    >
                      <Calculator className="w-4 h-4" />
                      <span>Calcular cuánta pintura necesito</span>
                    </button>
                  </div>
                </div>

                {/* Tarjeta del producto (escritorio) */}
                {targetProduct && (
                  <div className="hidden lg:flex lg:col-span-4 justify-center items-center">
                    <button
                      type="button"
                      tabIndex={isActive ? 0 : -1}
                      onClick={() => onSelectProduct(targetProduct)}
                      className="w-72 rounded-3xl bg-slate-950/80 backdrop-blur-xl border border-white/15 p-6 flex flex-col items-center justify-between text-center shadow-2xl transition-all duration-300 hover:border-cyan-400/40 cursor-pointer group"
                    >
                      <div className="py-3 transition-transform duration-300 group-hover:scale-105">
                        <PaintCanGraphic
                          colorHex={defaultColor?.hex || '#FAF9F6'}
                          colorName={defaultColor?.name || targetProduct.name}
                          productLine={targetProduct.name}
                          sizeName={defaultSize?.name || '1 Galón'}
                          category={targetProduct.category}
                          className="w-44 h-48 drop-shadow-2xl"
                        />
                      </div>
                      <div className="w-full pt-3 pb-2">
                        <h4 className="text-base font-extrabold text-white tracking-wide truncate">{targetProduct.name}</h4>
                        <p className="text-xs font-semibold text-slate-400 truncate mt-0.5">
                          Desde {formatCOP(minPrice(targetProduct))} COP
                        </p>
                      </div>
                      <span className="w-full mt-3 py-3 px-4 rounded-xl bg-cyan-400 group-hover:bg-cyan-300 text-slate-950 font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2">
                        <span>Ver producto</span>
                        <ArrowRight className="w-4 h-4" />
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Flechas */}
        <button
          type="button"
          onClick={() => goToSlide(currentSlide - 1)}
          className="hidden sm:flex absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center transition-colors cursor-pointer"
          aria-label="Slide anterior"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => goToSlide(currentSlide + 1)}
          className="hidden sm:flex absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white items-center justify-center transition-colors cursor-pointer"
          aria-label="Slide siguiente"
        >
          <ChevronRight className="w-5 h-5" />
        </button>

        {/* Puntos */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
          {HERO_SLIDES.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => goToSlide(i)}
              className={`h-3 rounded-full transition-all cursor-pointer ${
                i === currentSlide ? 'bg-white w-8' : 'w-3 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Ir al slide ${i + 1}`}
              aria-current={i === currentSlide}
            />
          ))}
        </div>
      </section>

      {/* 2. CATEGORÍAS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center space-y-1.5 max-w-2xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Nuestros productos</h2>
          <p className="text-sm text-slate-600 font-medium">
            Haz clic en una categoría para ver sus líneas, aplicaciones y carta de colores.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {CATEGORIES.map(cat => {
            const isCurrent = selectedCategory === cat.id;
            const count = STORE_PRODUCTS.filter(p => p.category === cat.id).length;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => onSelectCategory(cat.id)}
                className={`group text-left rounded-2xl overflow-hidden border transition-all duration-300 cursor-pointer flex flex-col bg-white shadow-xs hover:shadow-xl hover:-translate-y-1 ${
                  isCurrent ? 'border-emerald-600 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-emerald-500/40'
                }`}
              >
                <div className={`h-44 w-full overflow-hidden relative ${cat.contain ? 'bg-white' : 'bg-gradient-to-br from-slate-800 to-[#0B1E48]'}`}>
                  <SafeImg
                    src={cat.img}
                    alt={cat.title}
                    loading="lazy"
                    className={`w-full h-full transition-transform duration-500 group-hover:scale-105 ${cat.contain ? 'object-contain p-3' : 'object-cover'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/50 via-transparent to-transparent" />
                  <div className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-bold">
                    {count} {count === 1 ? 'producto' : 'productos'}
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between gap-2 bg-white flex-1 w-full">
                  <div className="min-w-0">
                    <h3 className="font-black text-sm text-slate-900 leading-snug group-hover:text-emerald-700 transition-colors">{cat.title}</h3>
                    <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5 font-medium">{cat.subtitle}</p>
                  </div>
                  <div className="w-8 h-8 rounded-xl bg-slate-100 group-hover:bg-emerald-600 group-hover:text-white text-slate-600 flex items-center justify-center transition-all shrink-0">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </button>
            );
          })}
        </div>

        {selectedCategory !== 'todos' && (
          <div className="flex items-center justify-center pt-2">
            <button
              type="button"
              onClick={() => onSelectCategory('todos')}
              className="text-xs font-bold text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full transition-colors cursor-pointer"
            >
              ✕ Mostrar el catálogo completo
            </button>
          </div>
        )}
      </div>

      {/* 3. CATÁLOGO */}
      <div ref={catalogRef} id="catalogo" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-2 scroll-mt-24">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {query ? `Resultados para “${searchFilter.trim().slice(0, 80)}”` : 'Catálogo ColorLink'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {query
                ? `${filteredProducts.length} ${filteredProducts.length === 1 ? 'producto encontrado' : 'productos encontrados'}`
                : 'Vinilos tipo 1, impermeabilizantes, recubrimientos epóxicos y herramientas de aplicación profesional'}
            </p>
          </div>
          <button
            type="button"
            onClick={() => { if (query && onClearSearch) onClearSearch(); scrollToCatalog(); }}
            className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>{query ? 'Quitar búsqueda y ver todo' : `Ver catálogo completo (${STORE_PRODUCTS.length} productos)`}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="py-14 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <SearchX className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">No encontramos productos que coincidan con tu búsqueda.</p>
            <p className="text-xs text-slate-500 mt-1">Prueba con “vinilo”, “koraza”, “epóxico” o “rodillo”.</p>
            {selectedCategory !== 'todos' && (
              <button
                type="button"
                onClick={() => onSelectCategory('todos')}
                className="mt-3 text-xs font-extrabold text-emerald-700 hover:underline cursor-pointer"
              >
                Buscar en todas las categorías
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {visibleProducts.map(product => {
              const defaultSize = product.sizes.find(s => s.id === product.defaultSizeId) || product.sizes[0];
              const defaultColor = product.colors?.find(c => c.id === product.defaultColorId) || product.colors?.[0];
              const isJustAdded = addedAnimationId === product.id;
              const anyInStock = product.sizes.some(s => s.inStock);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative"
                >
                  {isJustAdded && (
                    <div className="absolute inset-0 z-30 bg-emerald-600/90 backdrop-blur-xs flex flex-col items-center justify-center text-white font-black pointer-events-none" role="status">
                      <Check className="w-10 h-10 mb-2" />
                      <span className="text-sm">¡Añadido al carrito!</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    aria-label={`Ver ${product.name}`}
                    className="h-56 w-full bg-gradient-to-b from-slate-50 to-slate-100/60 p-4 flex items-center justify-center relative cursor-pointer overflow-hidden"
                  >
                    {product.badge && (
                      <span className="absolute top-3 left-3 z-10 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-900 text-white shadow-xs">
                        {product.badge}
                      </span>
                    )}
                    <div className="group-hover:-translate-y-1.5 transition-transform duration-300">
                      {product.isTool ? (
                        <ToolGraphic
                          toolType={toolTypeFor(product.name)}
                          productName={product.name}
                          sizeLabel={defaultSize?.name}
                          className="w-36 h-40"
                        />
                      ) : (
                        <PaintCanGraphic
                          colorHex={defaultColor?.hex || '#FAF9F6'}
                          colorName={defaultColor?.name || product.name}
                          productLine={product.name}
                          sizeName={defaultSize?.name}
                          category={product.category}
                          className="w-40 h-44"
                        />
                      )}
                    </div>
                    {!product.isTool && product.colors.length > 1 && (
                      <span className="absolute bottom-2.5 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full border border-slate-200 text-[10px] font-bold text-slate-700 shadow-xs">
                        <span className="w-2.5 h-2.5 rounded-full border border-slate-300 shrink-0" style={{ backgroundColor: defaultColor?.hex || '#ffffff' }} />
                        <span>{product.colors.length} colores</span>
                      </span>
                    )}
                  </button>

                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3 bg-white">
                    <div className="space-y-1.5">
                      <span className="inline-block text-[10px] font-black uppercase tracking-wider text-blue-900 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                        {product.categoryLabel}
                      </span>
                      <h3>
                        <button
                          type="button"
                          onClick={() => onSelectProduct(product)}
                          className="text-left font-black text-sm text-slate-900 leading-snug hover:text-blue-900 transition-colors cursor-pointer line-clamp-2 pt-0.5"
                        >
                          {product.name}
                        </button>
                      </h3>
                      <p className="text-[11px] text-slate-500 line-clamp-2 font-medium leading-relaxed">{product.subtitle}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <span className="text-[9px] uppercase tracking-wider text-slate-400 block font-bold">Desde</span>
                        <div className="text-base font-black text-slate-950">
                          {formatCOP(minPrice(product))} <span className="text-[10px] font-bold text-slate-500">COP</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(product, e)}
                        disabled={!anyInStock}
                        className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-xs hover:shadow-md transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                        title={`Añadir ${defaultSize?.name || ''} al carrito`}
                        aria-label={`Añadir ${product.name} al carrito`}
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onSelectProduct(product)}
                      className="w-full py-2 bg-slate-50 hover:bg-blue-900 hover:text-white text-slate-800 font-bold text-xs rounded-xl border border-slate-200 hover:border-blue-900 transition-all cursor-pointer text-center"
                    >
                      {product.isTool ? 'Ver ficha del producto →' : 'Ver ficha y carta de colores →'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredProducts.length > visibleCount && (
          <div className="flex justify-center pt-2">
            <button
              type="button"
              onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
              className="px-6 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-extrabold text-xs rounded-xl shadow-xs cursor-pointer"
            >
              Ver más productos ({filteredProducts.length - visibleCount} restantes)
            </button>
          </div>
        )}
      </div>

      {/* 4. PROYECTOS Y ASESORÍA */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-12 shadow-xl border border-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-bold uppercase tracking-wider">
              <Layers className="w-3.5 h-3.5" />
              <span>Proyectos y obras ColorLink</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              ¿Tienes una obra, constructora o proyecto arquitectónico?
            </h2>
            <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
              Además de la tienda, ofrecemos <strong>gestión técnica de proyectos</strong>: diagnóstico de humedad y fisuras con IA, cálculo de cuñetes por m², tintometría y revisión de calidad por nuestro equipo.
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onNavigateToProjects}
                className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Ir a la plataforma de proyectos</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => onOpenCalculator()}
                className="px-6 py-3 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4 text-emerald-400" />
                <span>Calculadora de pintura para obra</span>
              </button>
            </div>
          </div>

          {/* Cifras reales del catálogo y la red de tiendas */}
          <div className="lg:col-span-4 grid grid-cols-2 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-emerald-400 block">{STORE_BRANCHES.length}</span>
              <span className="text-slate-300 font-semibold mt-1 block">Tiendas ColorLink</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-cyan-400 block">{cityCount}</span>
              <span className="text-slate-300 font-semibold mt-1 block">Ciudades con tienda</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-amber-400 block">{STORE_PRODUCTS.length}</span>
              <span className="text-slate-300 font-semibold mt-1 block">Productos en catálogo</span>
            </div>
            <div className="bg-white/5 border border-white/10 p-4 rounded-2xl">
              <span className="text-2xl font-black text-purple-400 block">24–48 h</span>
              <span className="text-slate-300 font-semibold mt-1 block">Entrega a domicilio</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
