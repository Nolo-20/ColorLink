import React, { useState } from 'react';
import { StoreCategory, StoreProduct, StoreProductSize, StoreProductColor } from '../types';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { PaintCanGraphic } from './PaintCanGraphic';
import { ToolGraphic, ToolType } from './ToolGraphic';
import { AmbientWallVisualizer } from './AmbientWallVisualizer';
import { 
  Heart, 
  Truck, 
  Zap, 
  ShoppingCart, 
  ArrowLeft, 
  SlidersHorizontal, 
  Sparkles, 
  ShieldCheck, 
  Check, 
  ChevronRight,
  ChevronLeft,
  Info
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
  bgImageUrl: string;
}

const CATEGORY_DETAILS: Record<StoreCategory, CategoryInfo> = {
  todos: {
    title: 'Catálogo General de Recubrimientos',
    badge: 'Portafolio Completo',
    icon: '🎨',
    tagline: 'Soluciones especializadas para obras, industria y remodelación',
    description: 'Explora toda la gama de pinturas arquitectónicas, impermeabilizantes de alta tecnología, sistemas epóxicos y herramientas de aplicación.',
    purposes: ['Pinturas de Interior y Exterior', 'Impermeabilización Total', 'Pisos de Alto Tráfico', 'Herramientas Profesionales'],
    bannerBg: 'from-slate-900/90 via-blue-950/90 to-slate-900/95',
    heroAccent: 'text-emerald-400',
    bgImageUrl: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1600&auto=format&fit=crop&q=80'
  },
  hogar: {
    title: 'Pinturas para el Hogar & Decoración',
    badge: 'Ambientes Saludables',
    icon: '🏡',
    tagline: 'Máxima lavabilidad, cero olor y protección antibacteriana activa',
    description: 'Fórmulas vinil-acrílicas premium certificadas para salas, alcobas, comedores y zonas infantiles. Resisten manchas rebeldes y repelen suciedad con acabado mate aterciopelado.',
    purposes: [
      'Vinilos tipo 1 de alta lavabilidad (Viniltex)',
      'Esmaltes alquídicos y acrílicos para maderas y metales',
      'Cero emisión de VOC para habitar de inmediato',
      'Más de 1.200 tonos tintométricos computarizados'
    ],
    bannerBg: 'from-blue-950/90 via-slate-900/90 to-emerald-950/95',
    heroAccent: 'text-emerald-400',
    bgImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=1600&auto=format&fit=crop&q=80'
  },
  construccion: {
    title: 'Construcción, Fachadas & Impermeabilización',
    badge: 'Protección Extrema',
    icon: '🏗️',
    tagline: 'Barrera elastomérica contra lluvias torrenciales, fisuras y sol',
    description: 'Soluciones de alto rendimiento para envolventes de edificios, fachadas expuestas, terrazas y cubiertas. Sella microfisuras y garantiza hasta 8 años de estanqueidad.',
    purposes: [
      'Pinturas elastoméricas impermeables (Koraza)',
      'Selladores acrílicos y morteros de reparación',
      'Pinturas para tejas, ladrillos y muros a la vista',
      'Resistencia UV certificada ante intemperie extrema'
    ],
    bannerBg: 'from-amber-950/90 via-slate-900/90 to-blue-950/95',
    heroAccent: 'text-amber-400',
    bgImageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1600&auto=format&fit=crop&q=80'
  },
  industrial: {
    title: 'Pisos Epóxicos & Mantenimiento Industrial',
    badge: 'Alto Tráfico & Químicos',
    icon: '🏭',
    tagline: 'Sistemas 100% sólidos para bodegas, clínicas y parqueaderos',
    description: 'Recubrimientos bicomponentes de máxima dureza mecánica y resistencia química ante ácidos, aceites y solventes. Cumplen normas sanitarias INVIMA para áreas asépticas.',
    purposes: [
      'Epóxico autonivelante libre de solventes',
      'Poliuretano alifático resistente al rayado',
      'Demarcación vial y señalización de plantas',
      'Acabados antideslizantes para rampas y muelles'
    ],
    bannerBg: 'from-slate-950/90 via-indigo-950/90 to-slate-900/95',
    heroAccent: 'text-cyan-400',
    bgImageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1600&auto=format&fit=crop&q=80'
  },
  automotriz: {
    title: 'Línea Automotriz & Repintado Profesional',
    badge: 'Brillo Espejo 2K',
    icon: '🚗',
    tagline: 'Poliuretanos bicapa, primers de alto relleno y barnices rápidos',
    description: 'Tecnología de acabado automotriz formulada para talleres de latonería y pintura. Secado ultrarrápido, excelente igualación de color y retención de brillo.',
    purposes: [
      'Esmaltes poliuretánicos bicapa y monocapa',
      'Fondos y masillas poliéster ultra lijables',
      'Barnices transparentes con filtro UV superior',
      'Solventes y desengrasantes de alta pureza'
    ],
    bannerBg: 'from-purple-950/90 via-slate-900/90 to-blue-950/95',
    heroAccent: 'text-purple-400',
    bgImageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=1600&auto=format&fit=crop&q=80'
  },
  herramientas: {
    title: 'Brochas, Rodillos & Accesorios Profesionales',
    badge: 'Aplicación Perfecta',
    icon: '🖌️',
    tagline: 'Herramientas de alta transferencia sin salpique ni desprendimiento',
    description: 'Rodillos de microfibra tejida, brochas de cerda sintética cónica, cintas de enmascarar de borde limpio y bandejas de alta resistencia para pintores y contratistas.',
    purposes: [
      'Rodillos antigoteo para superficies lisas y rugosas',
      'Brochas con corte angular para molduras y filos',
      'Cintas de enmascarar resistentes a solventes',
      'Espátulas de acero inoxidable y plásticos de protección'
    ],
    bannerBg: 'from-emerald-950/90 via-slate-900/90 to-slate-950/95',
    heroAccent: 'text-emerald-400',
    bgImageUrl: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1600&auto=format&fit=crop&q=80'
  }
};

// Curated subcategory breakdowns matching Screenshot 2
interface LineVariant {
  id: string;
  name: string;
  toneName: string;
  colorHex: string;
  price: number;
  originalPrice: number;
  productId: string;
  freeShipping: boolean;
  sameDayPickup: boolean;
  bgTint: string;
  toolType?: ToolType;
}

interface ProductLineGroup {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  items: LineVariant[];
}

const LINE_GROUPS: Record<StoreCategory, ProductLineGroup[]> = {
  todos: [],
  construccion: [
    {
      id: 'koraza-impermeabilizante',
      title: 'Koraza Pintura Impermeabilizante',
      emoji: '🫧',
      subtitle: 'Protección exterior continua contra agua de lluvia y rayos solares',
      items: [
        {
          id: 'krz-verde-betula',
          productId: 'koraza-sol-lluvia',
          name: 'Koraza Sol & Lluvia Impermeabilizante',
          toneName: 'Verde Betula',
          colorHex: '#7A8B7B',
          price: 152900,
          originalPrice: 168000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#9DAF9E'
        },
        {
          id: 'krz-acero-industrial',
          productId: 'koraza-sol-lluvia',
          name: 'Koraza Sol & Lluvia Impermeabilizante',
          toneName: 'Acero Industrial',
          colorHex: '#465B66',
          price: 152900,
          originalPrice: 168000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#768E9B'
        },
        {
          id: 'krz-glaciar',
          productId: 'koraza-sol-lluvia',
          name: 'Koraza Sol & Lluvia Impermeabilizante',
          toneName: 'Glaciar',
          colorHex: '#C5D3D9',
          price: 152900,
          originalPrice: 168000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#DDE7EB'
        },
        {
          id: 'krz-gris-luminoso',
          productId: 'koraza-sol-lluvia',
          name: 'Koraza Sol & Lluvia Impermeabilizante',
          toneName: 'Gris Luminoso',
          colorHex: '#D3D6D8',
          price: 152900,
          originalPrice: 168000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#E6E9EA'
        }
      ]
    },
    {
      id: 'koraza-fachadas-calidas',
      title: 'Koraza Tonos Arquitectónicos de Fachada',
      emoji: '🏛️',
      subtitle: 'Colores de alta estabilidad lumínica para conjuntos residenciales e institucionales',
      items: [
        {
          id: 'krz-arena-med',
          productId: 'koraza-sol-lluvia',
          name: 'Koraza Fachadas Sol & Lluvia',
          toneName: 'Arena Mediterráneo',
          colorHex: '#D7C4A8',
          price: 152900,
          originalPrice: 168000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#E8DCB5'
        },
        {
          id: 'krz-rojo-teja',
          productId: 'koraza-sol-lluvia',
          name: 'Koraza Fachadas Sol & Lluvia',
          toneName: 'Rojo Teja Colonial',
          colorHex: '#9E382B',
          price: 152900,
          originalPrice: 168000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#C9776B'
        },
        {
          id: 'krz-blanco-puro',
          productId: 'koraza-sol-lluvia',
          name: 'Koraza Fachadas Sol & Lluvia',
          toneName: 'Blanco Puro Fachada',
          colorHex: '#FAF9F6',
          price: 152900,
          originalPrice: 168000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#F0EFEA'
        },
        {
          id: 'krz-basalto',
          productId: 'koraza-sol-lluvia',
          name: 'Koraza Fachadas Sol & Lluvia',
          toneName: 'Gris Basalto Urbano',
          colorHex: '#6B7280',
          price: 152900,
          originalPrice: 168000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#9BA2AE'
        }
      ]
    }
  ],
  hogar: [
    {
      id: 'viniltex-advanced',
      title: 'Pintuco Viniltex Advanced',
      emoji: '⭐',
      subtitle: 'Pintura interior mate con máxima lavabilidad y acabado sedoso',
      items: [
        {
          id: 'vtx-flor-rosal',
          productId: 'viniltex-ultralavable',
          name: 'Viniltex Advanced Mate Interior',
          toneName: 'Flor Del Rosal',
          colorHex: '#C9A8A8',
          price: 145000,
          originalPrice: 158000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#DEC1C1'
        },
        {
          id: 'vtx-corazon-oro',
          productId: 'viniltex-ultralavable',
          name: 'Viniltex Advanced Mate Interior',
          toneName: 'Corazón De Oro',
          colorHex: '#C58B35',
          price: 145000,
          originalPrice: 158000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#DBA858'
        },
        {
          id: 'vtx-verde-frailejon',
          productId: 'viniltex-ultralavable',
          name: 'Viniltex Advanced Mate Interior',
          toneName: 'Verde Frailejón',
          colorHex: '#567167',
          price: 145000,
          originalPrice: 158000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#769187'
        },
        {
          id: 'vtx-rosa-jazmin',
          productId: 'viniltex-ultralavable',
          name: 'Viniltex Advanced Mate Interior',
          toneName: 'Rosa Jazmín',
          colorHex: '#D9B9B9',
          price: 145000,
          originalPrice: 158000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#E8CECE'
        }
      ]
    },
    {
      id: 'esmaltes-metales',
      title: 'Pintulux Esmaltes 3 en 1 para Metales & Puertas',
      emoji: '🚪',
      subtitle: 'Anticorrosivo, color brillante y protección de secado rápido',
      items: [
        {
          id: 'ptx-negro',
          productId: 'pintulux-esmalte-brillante',
          name: 'Pintulux Esmalte Sintético Brillante',
          toneName: 'Negro Brillante Espejado',
          colorHex: '#111827',
          price: 52000,
          originalPrice: 59000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#4B5563'
        },
        {
          id: 'ptx-blanco',
          productId: 'pintulux-esmalte-brillante',
          name: 'Pintulux Esmalte Sintético Brillante',
          toneName: 'Blanco Puro Brillante',
          colorHex: '#FFFFFF',
          price: 52000,
          originalPrice: 59000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#E2E8F0'
        },
        {
          id: 'ptx-azul-rey',
          productId: 'pintulux-esmalte-brillante',
          name: 'Pintulux Esmalte Sintético Brillante',
          toneName: 'Azul Señalización Industrial',
          colorHex: '#2563EB',
          price: 52000,
          originalPrice: 59000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#60A5FA'
        },
        {
          id: 'ptx-rojo',
          productId: 'pintulux-esmalte-brillante',
          name: 'Pintulux Esmalte Sintético Brillante',
          toneName: 'Rojo Carmesí Intenso',
          colorHex: '#DC2626',
          price: 52000,
          originalPrice: 59000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#F87171'
        }
      ]
    }
  ],
  industrial: [
    {
      id: 'epoxicos-pisos',
      title: 'Sistemas Epóxicos para Pisos de Alto Tráfico',
      emoji: '🏭',
      subtitle: 'Resistencia mecánica a montacargas, derrames químicos y tránsito pesado',
      items: [
        {
          id: 'epx-gris-trafico',
          productId: 'epoxico-altos-solidos-pisos',
          name: 'ColorLink Epox-Floor 100% Sólidos',
          toneName: 'Gris Tráfico Claro (RAL 7035)',
          colorHex: '#CBD5E1',
          price: 185000,
          originalPrice: 205000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#94A3B8'
        },
        {
          id: 'epx-verde-quirurgico',
          productId: 'epoxico-altos-solidos-pisos',
          name: 'ColorLink Epox-Floor 100% Sólidos',
          toneName: 'Verde Seguridad Clínico',
          colorHex: '#15803D',
          price: 185000,
          originalPrice: 205000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#4ADE80'
        },
        {
          id: 'epx-azul-seguridad',
          productId: 'epoxico-altos-solidos-pisos',
          name: 'ColorLink Epox-Floor 100% Sólidos',
          toneName: 'Azul Demarcación Logística',
          colorHex: '#1D4ED8',
          price: 185000,
          originalPrice: 205000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#60A5FA'
        },
        {
          id: 'epx-amarillo-senal',
          productId: 'epoxico-altos-solidos-pisos',
          name: 'ColorLink Epox-Floor 100% Sólidos',
          toneName: 'Amarillo Seguridad Vial',
          colorHex: '#EAB308',
          price: 185000,
          originalPrice: 205000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#FDE047'
        }
      ]
    }
  ],
  automotriz: [
    {
      id: 'poliuretano-automotriz',
      title: 'Poliuretano Bicapa & Monocapa Automotriz 2K',
      emoji: '🚗',
      subtitle: 'Esmaltes de alto poder cubriente con catalizador/endurecedor y secado acelerado',
      items: [
        {
          id: 'blanco-polar',
          productId: 'poliuretano-automotriz-2k',
          name: 'Poliuretano 2K Alto Brillo',
          toneName: 'Blanco Nevada Cristal',
          colorHex: '#F8FAFC',
          price: 79000,
          originalPrice: 88000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#E2E8F0'
        },
        {
          id: 'negro-ebano',
          productId: 'poliuretano-automotriz-2k',
          name: 'Poliuretano 2K Alto Brillo',
          toneName: 'Negro Profundo Metalizado',
          colorHex: '#0B0B0B',
          price: 79000,
          originalPrice: 88000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#334155'
        },
        {
          id: 'plata-titanio',
          productId: 'poliuretano-automotriz-2k',
          name: 'Poliuretano 2K Alto Brillo',
          toneName: 'Plata Plataforma Fina',
          colorHex: '#94A3B8',
          price: 79000,
          originalPrice: 88000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#CBD5E1'
        },
        {
          id: 'rojo-monza',
          productId: 'poliuretano-automotriz-2k',
          name: 'Poliuretano 2K Alto Brillo',
          toneName: 'Rojo Rubí Perlado',
          colorHex: '#B91C1C',
          price: 79000,
          originalPrice: 88000,
          freeShipping: true,
          sameDayPickup: true,
          bgTint: '#EF4444'
        }
      ]
    }
  ],
  herramientas: [
    {
      id: 'rodillos-brochas',
      title: 'Brochas para Pared, Rodillos & Preparación',
      emoji: '🖌️',
      subtitle: 'Herramientas profesionales para pintar paredes, muros y techos con acabado parejo',
      items: [
        {
          id: 'her-rodillo-9',
          productId: 'rodillo-antigoteo-microfibra-9',
          name: 'Rodillo Antigoteo Microfibra Profesional',
          toneName: 'Paredes y Techos 9"',
          colorHex: '#0284C7',
          price: 28500,
          originalPrice: 35000,
          freeShipping: false,
          sameDayPickup: true,
          bgTint: '#E0F2FE',
          toolType: 'rodillo'
        },
        {
          id: 'her-brocha-3',
          productId: 'brocha-monopol-3pulg',
          name: 'Brocha Profesional Cerda Rubia',
          toneName: 'Paredes y Muros 3 Pulgadas',
          colorHex: '#D97706',
          price: 16500,
          originalPrice: 19000,
          freeShipping: false,
          sameDayPickup: true,
          bgTint: '#FEF3C7',
          toolType: 'brocha'
        },
        {
          id: 'her-brocha-4',
          productId: 'brocha-maestra-4pulg',
          name: 'Brocha Maestra Ancha para Fachadas',
          toneName: 'Muros y Exteriores 4 Pulgadas',
          colorHex: '#92400E',
          price: 23500,
          originalPrice: 26500,
          freeShipping: false,
          sameDayPickup: true,
          bgTint: '#FDE68A',
          toolType: 'brocha'
        },
        {
          id: 'her-cinta-azul',
          productId: 'cinta-azul-pintor-1pulg',
          name: 'Cinta Enmascarar Azul de Pintor',
          toneName: '14 Días UV 1 Pulgada x 50m',
          colorHex: '#2563EB',
          price: 11200,
          originalPrice: 13000,
          freeShipping: false,
          sameDayPickup: true,
          bgTint: '#DBEAFE',
          toolType: 'cinta'
        },
        {
          id: 'her-espatula',
          productId: 'espatula-inox-4pulg',
          name: 'Espátula Acero Flexible Pulido',
          toneName: 'Masillar Paredes 4 Pulgadas',
          colorHex: '#64748B',
          price: 14800,
          originalPrice: 17000,
          freeShipping: false,
          sameDayPickup: true,
          bgTint: '#E2E8F0',
          toolType: 'espatula'
        },
        {
          id: 'her-bandeja',
          productId: 'bandeja-pintura-9pulg',
          name: 'Bandeja Plástica con Escurridor',
          toneName: 'Capacidad 2.5L para Rodillo 9"',
          colorHex: '#1E3A8A',
          price: 15900,
          originalPrice: 19000,
          freeShipping: false,
          sameDayPickup: true,
          bgTint: '#BFDBFE',
          toolType: 'bandeja'
        },
        {
          id: 'her-extension',
          productId: 'extension-telescopica-aluminio-2m',
          name: 'Extensión Telescópica Aluminio 2m',
          toneName: 'Techos & Muros Altos (1.1m a 2.0m)',
          colorHex: '#EA580C',
          price: 32000,
          originalPrice: 36000,
          freeShipping: false,
          sameDayPickup: true,
          bgTint: '#FFEDD5',
          toolType: 'extension'
        }
      ]
    }
  ]
};

export const CategoryPageView: React.FC<CategoryPageViewProps> = ({
  category,
  onSelectProduct,
  onQuickAddToCart,
  onBackToStore,
  onOpenCalculator
}) => {
  const [wishlist, setWishlist] = useState<Record<string, boolean>>({});
  const [addedAnimationId, setAddedAnimationId] = useState<string | null>(null);

  const details = CATEGORY_DETAILS[category] || CATEGORY_DETAILS.todos;
  const groups = LINE_GROUPS[category] || [];

  const toggleWishlist = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setWishlist(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBuyItem = (item: LineVariant, e: React.MouseEvent) => {
    e.stopPropagation();
    const product = STORE_PRODUCTS.find(p => p.id === item.productId) || STORE_PRODUCTS[0];
    
    // Trigger flying animation id
    setAddedAnimationId(item.id);
    setTimeout(() => setAddedAnimationId(null), 1200);

    const size = product.sizes.find(s => s.id === product.defaultSizeId) || product.sizes[0];
    const color: StoreProductColor = {
      id: item.id,
      name: item.toneName,
      hex: item.colorHex,
      code: 'CL-' + item.id.slice(0, 4).toUpperCase(),
      inStock: true
    };

    onQuickAddToCart(product, color, size);
  };

  const handleCardClick = (productId: string, item?: LineVariant) => {
    let product = STORE_PRODUCTS.find(p => p.id === productId);
    if (!product) {
      product = STORE_PRODUCTS.find(p => p.category === category) || STORE_PRODUCTS[0];
    }

    let matchingColorId: string | undefined = undefined;
    if (item && product.colors) {
      const match = product.colors.find(c => 
        c.id === item.id ||
        c.hex.toLowerCase() === item.colorHex.toLowerCase() ||
        c.name.toLowerCase().includes(item.toneName.toLowerCase())
      );
      if (match) {
        matchingColorId = match.id;
      }
    }

    onSelectProduct(product, matchingColorId);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-16 font-sans">
      
      {/* 1. Category Context & Purpose Banner with Illustrative Image */}
      <section className="relative text-white py-14 px-4 sm:px-6 lg:px-8 overflow-hidden shadow-inner">
        {/* Illustrative Background Photo Layer with High Contrast Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src={details.bgImageUrl} 
            alt={details.title}
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1600&auto=format&fit=crop&q=80';
            }}
            className="w-full h-full object-cover object-center transform scale-105 filter brightness-50" 
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${details.bannerBg} mix-blend-multiply opacity-90`} />
          <div className="absolute inset-0 bg-slate-950/40" />
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none z-1" />
        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-300 mb-6">
            <button 
              type="button" 
              onClick={onBackToStore}
              className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Tienda Principal</span>
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            <span className="font-bold text-emerald-400 capitalize">{details.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            <div className="lg:col-span-8 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold backdrop-blur-xs border border-white/10">
                <span>{details.icon}</span>
                <span>{details.badge}</span>
              </div>
              
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white leading-tight">
                {details.title}
              </h1>
              
              <p className={`text-base sm:text-lg font-semibold ${details.heroAccent}`}>
                {details.tagline}
              </p>

              <p className="text-sm text-slate-300 max-w-2xl leading-relaxed">
                {details.description}
              </p>

              {/* Purpose & Applications Chips */}
              <div className="pt-2 flex flex-wrap gap-2">
                {details.purposes.map((p, idx) => (
                  <span 
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 text-slate-200 text-xs font-medium border border-white/5"
                  >
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>{p}</span>
                  </span>
                ))}
              </div>
            </div>

            {/* Quick Action Box: Paint Calculator shortcut */}
            <div className="lg:col-span-4 bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20 text-white space-y-3 shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm">¿Cuánta pintura necesitas?</h3>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                Nuestra calculadora técnica descuenta puertas y ventanas para darte el número exacto de galones o cuñetes sin desperdicio.
              </p>
              <button
                type="button"
                onClick={() => onOpenCalculator()}
                className="w-full py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Calcular Materiales Ahora</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Subcategory breakdowns matching Screenshot 2 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10 space-y-14">
        
        {groups.length === 0 ? (
          // Fallback if category has no custom sub-lines, render filtered catalog
          <div className="space-y-6">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <span>Productos Disponibles</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {STORE_PRODUCTS
                .filter(p => category === 'todos' || p.category === category)
                .map(prod => (
                  <div 
                    key={prod.id}
                    onClick={() => onSelectProduct(prod)}
                    className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="w-full h-48 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden">
                        <PaintCanGraphic 
                          colorHex={prod.colors[0]?.hex || '#FAF9F6'} 
                          colorName={prod.colors[0]?.name || prod.name}
                          productLine={prod.name.split(' ')[0]}
                        />
                      </div>
                      <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">{prod.categoryLabel}</span>
                      <h3 className="font-black text-slate-900 text-sm leading-snug">{prod.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-2">{prod.subtitle}</p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-base font-black text-slate-900">${prod.sizes[0].price.toLocaleString('es-CO')} COP</span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAddToCart(prod);
                        }}
                        className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-sm transition-transform active:scale-95"
                      >
                        <ShoppingCart className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          groups.map(group => (
            <section key={group.id} className="space-y-5">
              
              {/* Line Header with title & carousel navigation arrows */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 pb-3">
                <div>
                  <h2 className="text-2xl font-black text-[#0B1528] tracking-tight flex items-center gap-2">
                    <span>{group.title}</span>
                    <span className="text-xl">{group.emoji}</span>
                  </h2>
                  <p className="text-xs text-slate-500 font-medium">{group.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto">
                  <button 
                    type="button"
                    className="w-8 h-8 rounded-lg bg-[#0B1528] text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                    title="Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    type="button"
                    className="w-8 h-8 rounded-lg bg-[#0B1528] text-white flex items-center justify-center hover:bg-slate-800 transition-colors cursor-pointer shadow-xs"
                    title="Siguiente"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* 4-Item Grid matching Screenshot 2 exactly */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {group.items.map(item => {
                  const isFavorited = Boolean(wishlist[item.id]);
                  const isJustAdded = addedAnimationId === item.id;

                  return (
                    <div
                      key={item.id}
                      onClick={() => handleCardClick(item.productId, item)}
                      className="bg-white rounded-2xl border border-slate-200 hover:border-emerald-500/50 shadow-sm hover:shadow-xl transition-all duration-300 p-4 flex flex-col justify-between group relative cursor-pointer"
                    >
                      {/* Floating Feedback Badge when added */}
                      {isJustAdded && (
                        <div className="absolute inset-0 z-30 bg-emerald-600/90 rounded-2xl flex flex-col items-center justify-center text-white font-black animate-fade-in backdrop-blur-xs">
                          <Check className="w-10 h-10 mb-2 animate-bounce" />
                          <span className="text-sm">¡Añadido al Carrito!</span>
                        </div>
                      )}

                      {/* Top Header: Wishlist Heart */}
                      <div className="flex items-center justify-end z-10">
                        <button
                          type="button"
                          onClick={(e) => toggleWishlist(item.id, e)}
                          className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-slate-400 hover:text-red-500 shadow-xs flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
                          title="Guardar en favoritos"
                        >
                          <Heart className={`w-4 h-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                        </button>
                      </div>

                      {/* Tool or Paint Can Graphic Stage */}
                      <div className="relative my-2 flex items-center justify-center">
                        {/* Rounded color backdrop rectangle */}
                        <div 
                          className="w-4/5 h-36 rounded-2xl transition-transform duration-500 group-hover:scale-105"
                          style={{ backgroundColor: item.bgTint || item.colorHex }}
                        />

                        {/* Graphic on Top: Real wall painting tool or Paint Can */}
                        <div className="absolute inset-0 flex items-center justify-center group-hover:-translate-y-2 transition-transform duration-300">
                          {category === 'herramientas' || item.toolType ? (
                            <ToolGraphic
                              toolType={item.toolType || (item.name.toLowerCase().includes('rodillo') ? 'rodillo' : item.name.toLowerCase().includes('cinta') ? 'cinta' : item.name.toLowerCase().includes('espatula') ? 'espatula' : item.name.toLowerCase().includes('bandeja') ? 'bandeja' : item.name.toLowerCase().includes('extension') || item.name.toLowerCase().includes('extensión') ? 'extension' : 'brocha')}
                              productName={item.name}
                              sizeLabel={item.toneName}
                              className="w-32 h-40"
                            />
                          ) : (
                            <PaintCanGraphic
                              colorHex={item.colorHex}
                              colorName={item.toneName}
                              productLine={group.title.split(' ')[0]}
                              category={category}
                              className="w-32 h-40"
                            />
                          )}
                        </div>
                      </div>

                      {/* Badges: Envio Gratis floating pill */}
                      <div className="flex justify-center -mt-3 mb-2 z-10">
                        {item.freeShipping && (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white border border-amber-200 text-amber-700 text-[11px] font-black shadow-xs">
                            <Truck className="w-3 h-3 text-amber-500" />
                            <span>ENVÍO <strong className="text-amber-600 font-black">GRATIS</strong></span>
                          </span>
                        )}
                      </div>

                      {/* Product Name with specific color tone */}
                      <div className="text-center space-y-1 mb-3">
                        <h3 className="font-bold text-slate-800 text-xs sm:text-sm leading-snug group-hover:text-emerald-700 transition-colors">
                          {item.name} <span className="font-black text-slate-950">{item.toneName}</span>
                        </h3>
                        
                        <p className="text-[11px] text-slate-400 font-medium">
                          Desde
                        </p>
                        
                        <div className="text-lg font-black text-[#0B1528]">
                          ${item.price.toLocaleString('es-CO')}
                        </div>

                        {item.sameDayPickup && (
                          <div className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            <Zap className="w-3 h-3 text-emerald-600" />
                            <span>Retira hoy*</span>
                          </div>
                        )}
                      </div>

                      {/* Emerald Action Button: Comprar (Exact Screenshot 2) */}
                      <button
                        type="button"
                        onClick={(e) => handleBuyItem(item, e)}
                        className="w-full py-2.5 px-4 bg-[#10B981] hover:bg-[#059669] active:scale-95 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-md hover:shadow-emerald-500/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer mt-1"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Comprar</span>
                      </button>

                    </div>
                  );
                })}
              </div>

              {/* Slider Dots */}
              <div className="flex items-center justify-center gap-1.5 pt-2">
                <span className="w-6 h-1 rounded-full bg-slate-900" />
                <span className="w-6 h-1 rounded-full bg-slate-300" />
                <span className="w-6 h-1 rounded-full bg-slate-300" />
              </div>

            </section>
          ))
        )}

        {/* Interactive Category-Specific Visualizer */}
        {category !== 'herramientas' && (() => {
          const catProduct = STORE_PRODUCTS.find(p => p.category === category) || STORE_PRODUCTS[0];
          const titles: Record<string, { title: string; subtitle: string }> = {
            automotriz: {
              title: 'Visualizador de Acabado Automotriz 2K en Tiempo Real',
              subtitle: 'Simula el color y brillo de esmaltes poliuretano bicomponente sobre carrocerías vehiculares en estudio y luz diurna.'
            },
            industrial: {
              title: 'Visualizador de Pisos Industriales Epóxicos en Tiempo Real',
              subtitle: 'Aprecia el recubrimiento epóxico autonivelante de alto tráfico en bodegas, plantas y talleres.'
            },
            construccion: {
              title: 'Visualizador de Fachadas y Exteriores en Tiempo Real',
              subtitle: 'Aprecia el recubrimiento impermeable y antihongos sobre muros exteriores y obras.'
            },
            hogar: {
              title: 'Visualizador de Ambientes y Espacios en Tiempo Real',
              subtitle: 'Aprecia cómo luce el tono aplicado sobre muros de salas, dormitorios y comedores.'
            }
          };
          const currentVisual = titles[category] || titles.hogar;

          return (
            <div className="mt-14 pt-10 border-t border-slate-200">
              <div className="mb-4">
                <h3 className="text-xl font-black text-slate-900">
                  {currentVisual.title}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  {currentVisual.subtitle}
                </p>
              </div>
              <AmbientWallVisualizer
                currentProduct={catProduct}
                selectedColor={catProduct.colors?.[0]}
              />
            </div>
          );
        })()}

      </div>

    </div>
  );
};
