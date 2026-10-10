import React, { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { StoreCategory, StoreProduct, StoreProductSize, StoreProductColor } from '../types';
import { STORE_PRODUCTS, formatCOP, toolTypeFor } from '../data/storeProducts';
import { PaintCanGraphic } from './PaintCanGraphic';
import { ToolGraphic } from './ToolGraphic';
import { PaintedScene } from './PaintedScene';
import { scenesForCategory, sceneImage } from '../data/visualizerScenes';
import {
  Truck,
  Store,
  ShoppingCart,
  ArrowLeft,
  Sparkles,
  Check,
  ChevronRight,
  ChevronLeft,
  Search,
  X,
  SlidersHorizontal
} from 'lucide-react';

interface CategoryPageViewProps {
  category: StoreCategory;
  onSelectProduct: (product: StoreProduct, initialColorId?: string) => void;
  onQuickAddToCart: (product: StoreProduct, color?: StoreProductColor, size?: StoreProductSize) => void;
  onBackToStore: () => void;
  onOpenCalculator: (product?: StoreProduct) => void;
}

interface CategoryInfo {
  title: string;
  badge: string;
  icon: string;
  tagline: string;
  description: string;
  purposes: string[];
  bannerBg: string;
  heroAccent: string;
  /** Foto real del ambiente (public/visualizer) o null para el degradado de marca */
  bgImageUrl: string | null;
}

const FREE_SHIPPING_THRESHOLD = 150000;

const CATEGORY_DETAILS: Record<StoreCategory, CategoryInfo> = {
  todos: {
    title: 'Catálogo general de recubrimientos',
    badge: 'Portafolio completo',
    icon: '🎨',
    tagline: 'Soluciones para obras, industria y remodelación',
    description: 'Explora toda la gama de pinturas arquitectónicas, impermeabilizantes, sistemas epóxicos y herramientas de aplicación.',
    purposes: ['Pinturas de interior y exterior', 'Impermeabilización', 'Pisos de alto tráfico', 'Herramientas profesionales'],
    bannerBg: 'from-slate-950/95 via-blue-950/80 to-slate-900/40',
    heroAccent: 'text-emerald-400',
    bgImageUrl: sceneImage('edificio')
  },
  hogar: {
    title: 'Pinturas para el hogar y decoración',
    badge: 'Ambientes saludables',
    icon: '🏡',
    tagline: 'Alta lavabilidad, bajo olor y acabados duraderos',
    description: 'Fórmulas vinil-acrílicas para salas, alcobas, comedores y zonas infantiles. Resisten manchas y se limpian con un paño húmedo sin perder el acabado mate.',
    purposes: [
      'Vinilos tipo 1 de alta lavabilidad (Viniltex)',
      'Esmaltes para maderas y metales (Pintulux)',
      'Bajo olor para habitar el mismo día',
      'Tintometría en tienda'
    ],
    bannerBg: 'from-slate-950/95 via-emerald-950/75 to-slate-900/30',
    heroAccent: 'text-emerald-400',
    bgImageUrl: sceneImage('sala')
  },
  construccion: {
    title: 'Construcción, fachadas e impermeabilización',
    badge: 'Protección exterior',
    icon: '🏗️',
    tagline: 'Barrera elastomérica contra lluvia, fisuras y sol',
    description: 'Productos para fachadas expuestas, terrazas y cubiertas. Sellan microfisuras y protegen los muros exteriores de la humedad.',
    purposes: [
      'Pinturas elastoméricas impermeables (Koraza)',
      'Impermeabilizante fibratado para cubiertas (Pintuco Fill)',
      'Muros de ladrillo, revoque y concreto',
      'Resistencia UV a la intemperie'
    ],
    bannerBg: 'from-slate-950/95 via-amber-950/75 to-slate-900/30',
    heroAccent: 'text-amber-400',
    bgImageUrl: sceneImage('casa_moderna')
  },
  industrial: {
    title: 'Pisos epóxicos y mantenimiento industrial',
    badge: 'Alto tráfico y químicos',
    icon: '🏭',
    tagline: 'Sistemas de altos sólidos para bodegas, clínicas y parqueaderos',
    description: 'Recubrimientos bicomponentes de alta dureza y resistencia química frente a aceites, ácidos de batería y desinfectantes.',
    purposes: [
      'Epóxico de altos sólidos para pisos',
      'Demarcación de pasillos y zonas seguras',
      'Tráfico de montacargas',
      'Bajo contenido de solventes'
    ],
    bannerBg: 'from-slate-950/95 via-indigo-950/75 to-slate-900/30',
    heroAccent: 'text-cyan-400',
    bgImageUrl: sceneImage('bodega')
  },
  automotriz: {
    title: 'Línea automotriz y repintado profesional',
    badge: 'Poliuretano 2K',
    icon: '🚗',
    tagline: 'Poliuretano bicomponente de alto brillo y secado rápido',
    description: 'Acabado automotriz para talleres de latonería y pintura: buena igualación de color, retención de brillo y resistencia a la gasolina.',
    purposes: [
      'Poliuretano 2K alto brillo',
      'Kits con endurecedor incluido',
      'Aerosol 2K para retoques',
      'Filtro UV contra decoloración'
    ],
    bannerBg: 'from-slate-950/95 via-purple-950/75 to-slate-900/30',
    heroAccent: 'text-purple-400',
    bgImageUrl: sceneImage('carro_exterior')
  },
  herramientas: {
    title: 'Brochas, rodillos y accesorios profesionales',
    badge: 'Aplicación perfecta',
    icon: '🖌️',
    tagline: 'Herramientas de alta transferencia, sin salpique',
    description: 'Rodillos de microfibra, brochas de cerda natural, cintas de enmascarar, bandejas, espátulas y extensiones para pintores y contratistas.',
    purposes: [
      'Rodillos antigoteo para superficies lisas y rugosas',
      'Brochas con corte angular para filos',
      'Cintas de enmascarar de remoción limpia',
      'Espátulas en acero inoxidable'
    ],
    bannerBg: 'from-slate-950 via-emerald-950 to-slate-900',
    heroAccent: 'text-emerald-400',
    bgImageUrl: null
  }
};

type SortKey = 'relevancia' | 'precio_asc' | 'precio_desc' | 'nombre';

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

const defaultSizeOf = (p: StoreProduct) =>
  p.sizes.find(s => s.id === p.defaultSizeId && s.inStock) || p.sizes.find(s => s.inStock) || p.sizes[0];

const minPrice = (p: StoreProduct) => {
  const inStock = p.sizes.filter(s => s.inStock);
  return Math.min(...(inStock.length ? inStock : p.sizes).map(s => s.price));
};

/** Fila con scroll horizontal y flechas que funcionan de verdad. */
const ScrollRow: React.FC<{ children: React.ReactNode; label: string }> = ({ children, label }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [update, children]);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (el) el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: 'smooth' });
  };

  return (
    <div className="relative">
      {(canPrev || canNext) && (
        <div className="flex items-center justify-end gap-2 mb-3">
          <button
            type="button"
            onClick={() => scroll(-1)}
            disabled={!canPrev}
            aria-label={`Ver anteriores de ${label}`}
            className="w-8 h-8 rounded-lg bg-[#0B1528] text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => scroll(1)}
            disabled={!canNext}
            aria-label={`Ver siguientes de ${label}`}
            className="w-8 h-8 rounded-lg bg-[#0B1528] text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
      <div
        ref={ref}
        onScroll={update}
        className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory pb-3 -mx-1 px-1 [scrollbar-width:thin]"
      >
        {children}
      </div>
    </div>
  );
};

const BannerImage: React.FC<{ src: string | null; alt: string }> = ({ src, alt }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) return null;
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      className="w-full h-full object-cover object-center"
    />
  );
};

export const CategoryPageView: React.FC<CategoryPageViewProps> = ({
  category,
  onSelectProduct,
  onQuickAddToCart,
  onBackToStore,
  onOpenCalculator
}) => {
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('relevancia');
  const [lineFilter, setLineFilter] = useState<string>('todas');
  const addedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const details = CATEGORY_DETAILS[category] || CATEGORY_DETAILS.todos;

  // Al cambiar de categoría se limpian los filtros
  useEffect(() => {
    setSearchQuery('');
    setSortKey('relevancia');
    setLineFilter('todas');
  }, [category]);

  useEffect(() => () => { if (addedTimer.current) clearTimeout(addedTimer.current); }, []);

  const categoryProducts = useMemo(
    () => STORE_PRODUCTS.filter(p => category === 'todos' || p.category === category),
    [category]
  );

  const q = normalize(searchQuery.trim());

  const visibleProducts = useMemo(() => {
    let list = categoryProducts.filter(p => lineFilter === 'todas' || p.id === lineFilter);
    if (q) {
      list = list.filter(p =>
        normalize(`${p.name} ${p.subtitle} ${p.categoryLabel}`).includes(q) ||
        (!p.isTool && p.colors.some(c => normalize(`${c.name} ${c.code}`).includes(q)))
      );
    }
    const sorted = [...list];
    if (sortKey === 'precio_asc') sorted.sort((a, b) => minPrice(a) - minPrice(b));
    if (sortKey === 'precio_desc') sorted.sort((a, b) => minPrice(b) - minPrice(a));
    if (sortKey === 'nombre') sorted.sort((a, b) => a.name.localeCompare(b.name, 'es'));
    return sorted;
  }, [categoryProducts, lineFilter, q, sortKey]);

  // Herramientas y "todos" se muestran como cuadrícula de productos; pinturas, por línea con sus colores
  const showAsLines = category !== 'todos' && category !== 'herramientas';

  const flashAdded = (id: string) => {
    setAddedAnimationId(id);
    if (addedTimer.current) clearTimeout(addedTimer.current);
    addedTimer.current = setTimeout(() => setAddedAnimationId(null), 1200);
  };

  const handleBuyColor = (product: StoreProduct, color: StoreProductColor, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!color.inStock) return;
    flashAdded(`${product.id}-${color.id}`);
    onQuickAddToCart(product, color, defaultSizeOf(product));
  };

  const handleBuyProduct = (product: StoreProduct, e: React.MouseEvent) => {
    e.stopPropagation();
    flashAdded(product.id);
    const color = product.colors.find(c => c.id === product.defaultColorId && c.inStock) || product.colors.find(c => c.inStock) || product.colors[0];
    onQuickAddToCart(product, color, defaultSizeOf(product));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setLineFilter('todas');
    setSortKey('relevancia');
  };

  const hasFilters = Boolean(q) || lineFilter !== 'todas' || sortKey !== 'relevancia';

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">

      {/* 1. Banner de la categoría con foto real del ambiente */}
      <section className="relative text-white py-12 sm:py-14 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-br from-slate-900 via-[#0B1E48] to-slate-950">
        <div className="absolute inset-0 z-0">
          <BannerImage src={details.bgImageUrl} alt="" />
          <div className={`absolute inset-0 bg-gradient-to-r ${details.bannerBg}`} />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs text-slate-300 mb-6 min-w-0">
            <button
              type="button"
              onClick={onBackToStore}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tienda</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 shrink-0" />
            <span className="font-bold text-emerald-400 truncate">{details.title}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold backdrop-blur-xs border border-white/10">
                <span>{details.icon}</span>
                <span>{details.badge}</span>
              </div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight drop-shadow-lg">
                {details.title}
              </h1>
              <p className={`text-base sm:text-lg font-semibold ${details.heroAccent} drop-shadow`}>{details.tagline}</p>
              <p className="text-sm text-slate-200 max-w-2xl leading-relaxed drop-shadow">{details.description}</p>
              <div className="pt-2 flex flex-wrap gap-2">
                {details.purposes.map((p) => (
                  <span key={p} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-black/30 text-slate-100 text-xs font-medium border border-white/10 backdrop-blur-xs">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{p}</span>
                  </span>
                ))}
              </div>
            </div>

            {category !== 'herramientas' && (
              <div className="lg:col-span-4 bg-slate-950/50 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white space-y-3 shadow-xl">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                  <h3 className="font-bold text-sm">¿Cuánta pintura necesitas?</h3>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  Ingresa los metros de tus muros, descuenta puertas y ventanas y te decimos cuántos galones o cuñetes llevar.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenCalculator(categoryProducts.length === 1 ? categoryProducts[0] : undefined)}
                  className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Calcular materiales</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-12">

        {/* 2. Barra de búsqueda, filtro por línea y orden */}
        <div className="bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row gap-3 md:items-center">
          <div className="relative flex-1 min-w-0">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              enterKeyHint="search"
              value={searchQuery}
              maxLength={60}
              onChange={(e) => setSearchQuery(e.target.value.replace(/[<>]/g, '').slice(0, 60))}
              placeholder={category === 'herramientas' ? 'Buscar brocha, rodillo, cinta…' : 'Buscar producto o color (ej. gris, blanco)…'}
              aria-label="Buscar en esta categoría"
              className="w-full pl-9 pr-9 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpiar búsqueda"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-md text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex gap-2 min-w-0">
            {categoryProducts.length > 1 && (
              <select
                value={lineFilter}
                onChange={(e) => setLineFilter(e.target.value)}
                aria-label="Filtrar por línea de producto"
                className="flex-1 md:flex-none md:w-56 min-w-0 px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="todas">Todas las líneas ({categoryProducts.length})</option>
                {categoryProducts.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
            <div className="relative flex-1 md:flex-none">
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                aria-label="Ordenar productos"
                className="w-full md:w-56 pl-8 pr-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="relevancia">Relevancia</option>
                <option value="precio_asc">Precio: menor a mayor</option>
                <option value="precio_desc">Precio: mayor a menor</option>
                <option value="nombre">Nombre (A–Z)</option>
              </select>
            </div>
          </div>
        </div>

        {visibleProducts.length === 0 ? (
          <div className="py-14 text-center bg-white rounded-2xl border border-dashed border-slate-300">
            <p className="text-sm font-bold text-slate-700">No hay productos que coincidan con tu búsqueda.</p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-3 text-xs font-extrabold text-emerald-700 hover:underline cursor-pointer"
            >
              Quitar filtros
            </button>
          </div>
        ) : showAsLines ? (
          // 3a. Una sección por línea de producto con sus colores reales
          visibleProducts.map(product => {
            const size = defaultSizeOf(product);
            const colorMatches = q && product.colors.some(c => normalize(`${c.name} ${c.code}`).includes(q)) && !normalize(`${product.name} ${product.subtitle}`).includes(q);
            const colors = colorMatches
              ? product.colors.filter(c => normalize(`${c.name} ${c.code}`).includes(q))
              : product.colors;
            const freeShipping = size.price >= FREE_SHIPPING_THRESHOLD;

            return (
              <section key={product.id} className="space-y-4" aria-labelledby={`linea-${product.id}`}>
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="min-w-0">
                    <h2 id={`linea-${product.id}`} className="text-xl sm:text-2xl font-black text-[#0B1528] tracking-tight">
                      <button type="button" onClick={() => onSelectProduct(product)} className="text-left hover:text-emerald-700 cursor-pointer">
                        {product.name}
                      </button>
                    </h2>
                    <p className="text-xs text-slate-500 font-medium">{product.subtitle}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onSelectProduct(product)}
                    className="text-xs font-extrabold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    Ver ficha técnica y tamaños <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <ScrollRow label={product.name}>
                  {colors.map(color => {
                    const cardId = `${product.id}-${color.id}`;
                    const isJustAdded = addedAnimationId === cardId;
                    return (
                      <div
                        key={color.id}
                        className="snap-start shrink-0 w-[78%] sm:w-60 lg:w-[calc(25%-1.125rem)] bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col justify-between group relative"
                      >
                        {isJustAdded && (
                          <div className="absolute inset-0 z-30 bg-emerald-600/90 rounded-2xl flex flex-col items-center justify-center text-white font-black pointer-events-none" role="status">
                            <Check className="w-10 h-10 mb-2" />
                            <span className="text-sm">¡Añadido al carrito!</span>
                          </div>
                        )}

                        <button
                          type="button"
                          onClick={() => onSelectProduct(product, color.id)}
                          aria-label={`Ver ${product.name} en ${color.name}`}
                          className="relative my-2 flex items-center justify-center cursor-pointer"
                        >
                          <div className="w-4/5 h-36 rounded-2xl transition-transform duration-500 group-hover:scale-105 ring-1 ring-black/5" style={{ backgroundColor: color.hex }} />
                          <div className="absolute inset-0 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                            <PaintCanGraphic
                              colorHex={color.hex}
                              colorName={color.name}
                              productLine={product.name}
                              sizeName={size.name}
                              category={product.category}
                              className="w-32 h-36"
                            />
                          </div>
                        </button>

                        <div className="flex justify-center -mt-3 mb-2 z-10 min-h-6">
                          {freeShipping && (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-700 text-[11px] font-black shadow-xs">
                              <Truck className="w-3 h-3 text-amber-500" />
                              <span>ENVÍO GRATIS</span>
                            </span>
                          )}
                        </div>

                        <div className="text-center space-y-1 mb-3">
                          <h3 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug">
                            <button type="button" onClick={() => onSelectProduct(product, color.id)} className="hover:text-emerald-700 cursor-pointer">
                              {product.name} <span className="font-black text-slate-950">{color.name}</span>
                            </button>
                          </h3>
                          <p className="text-[11px] text-slate-400 font-medium">{size.name} · Cód. {color.code}</p>
                          <div className="text-lg font-black text-[#0B1528]">{formatCOP(size.price)}</div>
                          {color.inStock ? (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                              <Store className="w-3 h-3 text-emerald-600" />
                              <span>Retiro en tienda disponible</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                              Agotado temporalmente
                            </div>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => handleBuyColor(product, color, e)}
                          disabled={!color.inStock || !size.inStock}
                          className="w-full py-2.5 px-4 bg-[#F2C417] hover:bg-[#E0B310] active:scale-95 text-slate-950 font-extrabold text-xs sm:text-sm rounded-xl shadow-md transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <ShoppingCart className="w-4 h-4" />
                          <span>{color.inStock ? 'Añadir al carrito' : 'Agotado'}</span>
                        </button>
                      </div>
                    );
                  })}
                </ScrollRow>
              </section>
            );
          })
        ) : (
          // 3b. Cuadrícula de productos (herramientas o catálogo general)
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {visibleProducts.map(prod => {
              const size = defaultSizeOf(prod);
              const color = prod.colors.find(c => c.id === prod.defaultColorId) || prod.colors[0];
              const isJustAdded = addedAnimationId === prod.id;
              return (
                <div key={prod.id} className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative">
                  {isJustAdded && (
                    <div className="absolute inset-0 z-30 bg-emerald-600/90 rounded-2xl flex flex-col items-center justify-center text-white font-black pointer-events-none" role="status">
                      <Check className="w-10 h-10 mb-2" />
                      <span className="text-sm">¡Añadido al carrito!</span>
                    </div>
                  )}
                  <div className="space-y-3">
                    <button
                      type="button"
                      onClick={() => onSelectProduct(prod)}
                      aria-label={`Ver ${prod.name}`}
                      className="w-full h-48 rounded-xl bg-slate-50 flex items-center justify-center overflow-hidden cursor-pointer"
                    >
                      {prod.isTool ? (
                        <ToolGraphic toolType={toolTypeFor(prod.name)} productName={prod.name} sizeLabel={size.name} className="w-40 h-44" />
                      ) : (
                        <PaintCanGraphic
                          colorHex={color?.hex || '#FAF9F6'}
                          colorName={color?.name || prod.name}
                          productLine={prod.name}
                          sizeName={size.name}
                          category={prod.category}
                          className="w-40 h-44"
                        />
                      )}
                    </button>
                    <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{prod.categoryLabel}</span>
                    <h3 className="font-black text-slate-900 text-sm leading-snug">
                      <button type="button" onClick={() => onSelectProduct(prod)} className="text-left hover:text-emerald-700 cursor-pointer">
                        {prod.name}
                      </button>
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2">{prod.subtitle}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase block">Desde</span>
                      <span className="text-base font-black text-slate-900">{formatCOP(minPrice(prod))} COP</span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => handleBuyProduct(prod, e)}
                      disabled={!size.inStock}
                      aria-label={`Añadir ${prod.name} al carrito`}
                      title="Añadir al carrito"
                      className="p-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-transform active:scale-95 cursor-pointer disabled:opacity-40"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {hasFilters && visibleProducts.length > 0 && (
          <div className="text-center">
            <button type="button" onClick={clearFilters} className="text-xs font-bold text-slate-500 hover:text-emerald-700 cursor-pointer">
              Quitar filtros y ver toda la categoría
            </button>
          </div>
        )}

        {/* 4. Galería: cómo lucen los colores de esta categoría aplicados (fotos reales) */}
        {category !== 'herramientas' && category !== 'todos' && (() => {
          const headings: Record<string, { title: string; subtitle: string }> = {
            automotriz: { title: 'Así lucen nuestros acabados automotrices', subtitle: 'Colores de la línea automotriz aplicados sobre carrocería.' },
            industrial: { title: 'Así lucen nuestros pisos industriales', subtitle: 'Colores epóxicos aplicados en bodegas, parqueaderos y plantas.' },
            construccion: { title: 'Así lucen nuestras fachadas', subtitle: 'Colores de exterior aplicados sobre casas y edificios.' },
            hogar: { title: 'Así lucen nuestros colores en casa', subtitle: 'Tonos de interior aplicados en salas, dormitorios y comedores.' }
          };
          const heading = headings[category] || headings.hogar;
          const scenes = scenesForCategory(category);
          const seen = new Set<string>();
          const picks: { product: StoreProduct; color: StoreProductColor }[] = [];
          for (const product of categoryProducts) {
            for (const color of product.colors || []) {
              const hex = color.hex.toUpperCase();
              if (seen.has(hex) || hex === '#FFFFFF' || hex === '#F8FAFC') continue;
              seen.add(hex);
              picks.push({ product, color });
            }
          }
          const items = picks.slice(0, 6);
          if (!items.length || !scenes.length) return null;

          return (
            <div className="pt-10 border-t border-slate-200">
              <div className="mb-5">
                <h3 className="text-xl font-black text-slate-900">{heading.title}</h3>
                <p className="text-xs text-slate-500 mt-1">{heading.subtitle}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(({ product, color }, i) => {
                  const scene = scenes[i % scenes.length];
                  return (
                    <button
                      type="button"
                      key={`${product.id}-${color.id}`}
                      onClick={() => onSelectProduct(product, color.id)}
                      className="text-left rounded-2xl overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <PaintedScene sceneId={scene.id} colorHex={color.hex} className="w-full aspect-[16/10]" alt={`${scene.name} en ${color.name}`} />
                      <span className="flex items-center gap-2.5 px-3 py-2.5">
                        <span className="w-6 h-6 rounded-full ring-1 ring-black/10 shrink-0" style={{ backgroundColor: color.hex }} />
                        <span className="min-w-0">
                          <span className="block text-xs font-black text-slate-900 truncate">{color.name}</span>
                          <span className="block text-[11px] text-slate-500 truncate">{product.name} · {scene.name}</span>
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};
