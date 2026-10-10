export type AppRole = 'cliente' | 'asesor' | 'calidad' | 'administrador';

export interface UserProfile {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  documentId?: string;
  personType?: 'natural' | 'juridica';
  taxRegime?: 'comun' | 'simplificado' | 'gran_contribuyente';
  address?: string;
  email: string;
  company?: string;
  companyName?: string;
  nit?: string;
  phone: string;
  city: string;
  role: AppRole;
  authMethod: 'google' | 'microsoft' | 'apple' | 'email_otp' | 'credentials';
  avatar?: string;
  isRegistered: boolean;
  department?: string; // Para staff interno (ej. "Comercial Antioquia", "Laboratorio Central")
}

export type OrderStatus = 'comprado' | 'despacho' | 'enviado' | 'entregado' | 'cancelado';

export interface OrderTrackingStep {
  status: OrderStatus;
  label: string;
  description: string;
  date?: string;
  isCompleted: boolean;
  isCurrent: boolean;
}

export interface CustomerOrder {
  id: string;
  orderNumber: string;
  date: string;
  /** Fecha ISO de creación (para filtrar por periodo) */
  createdAt?: string;
  total: number;
  subtotal: number;
  shipping: number;
  tax: number;
  recipientName: string;
  recipientEmail: string;
  recipientPhone: string;
  shippingAddress: string;
  city: string;
  deliveryMethod: 'domicilio' | 'sucursal';
  branchName?: string;
  pickupStore?: string;
  pickupCode?: string;
  transactionId?: string;
  status: OrderStatus;
  readyForPickup?: boolean; // pedido de retiro ya alistado, esperando al cliente en tienda
  items: Array<{
    id: string;
    productId: string;
    name: string;
    sizeName: string;
    colorName?: string;
    colorHex?: string;
    price: number;
    quantity: number;
    image: string;
    /** Opinión que el cliente ya dejó sobre este producto (si existe) */
    review?: { resenaId: string; calificacion: number; comentario?: string | null; tieneFoto: boolean } | null;
  }>;
  trackingHistory: OrderTrackingStep[];
  /** Fecha real de entrega (del historial) */
  deliveredAt?: string;
  /** Evaluación del vendedor que el cliente ya dejó en este pedido */
  sellerRating?: { calificacion: number; comentario?: string | null } | null;
  trackingNumber?: string;
  carrier?: string;
  estimatedDelivery?: string;
  canCancel: boolean;
}

export type SurfaceType = 
  | 'concreto'
  | 'revoque'
  | 'ladrillo'
  | 'drywall'
  | 'metal'
  | 'madera';

export type SpaceEnvironment = 
  | 'exterior_fachada'
  | 'interior_muros'
  | 'zona_humeda'
  | 'trafico_pesado_piso'
  | 'cubierta_techo';

export type SurfaceCondition = 
  | 'humedad'
  | 'fisuras'
  | 'descascaramiento'
  | 'hongos_moho'
  | 'caleo'
  | 'buen_estado';

export type ColorTone = {
  id: string;
  name: string;
  hex: string;
  code: string;
  category: string;
};

export interface ProjectFormData {
  id: string;
  cliente: string;
  emailContacto: string;
  telefonoContacto: string;
  ciudad: string;
  proyecto: string;
  areaM2: number;
  superficie: SurfaceType;
  ambiente: SpaceEnvironment;
  condiciones: SurfaceCondition[];
  color: string;
  colorHex: string;
  acabado: 'mate' | 'satinado' | 'semibrillante';
  fechaRequeridaDias: number;
  canalOrigen: 'web_portal' | 'whatsapp' | 'asesor_comercial' | 'correo' | 'linea_directa';
  descripcion: string;
  fotos: Array<{
    id: string;
    url: string;
    name: string;
    size: string;
    isPreloaded?: boolean;
  }>;
  consentimientoDatos: boolean;
  timestamp: string;
  // Campos de ajuste asesor / calidad
  estadoPipeline?: 'capturado' | 'revision_asesor' | 'aprobado_calidad' | 'cotizado' | 'despachado';
  descuentoAsesorPct?: number;
  observacionesAsesor?: string;
  dictamenCalidad?: {
    aprobado: boolean;
    perito: string;
    fechaRevision: string;
    observacionSustrato: string;
  };
}

export interface ValidationResult {
  isValid: boolean;
  qualityScore: number;
  completenessPercentage: number;
  checks: Array<{
    id: string;
    name: string;
    passed: boolean;
    severity: 'info' | 'warning' | 'error' | 'success';
    message: string;
  }>;
  generatedProjectId: string;
}

export interface AiDiagnosisResult {
  diagnostico_patologia: string;
  severidad: 'Baja' | 'Media' | 'Alta';
  complejidad: 'Baja' | 'Media' | 'Alta';
  sistema_recomendado: {
    paso1_preparacion: string;
    paso2_imprimante_sellador: string;
    paso3_acabado: string;
  };
  linea_producto_sugerida: string;
  manos_recomendadas: number;
  rendimiento_estimado_m2_gal: number;
  factor_desperdicio_pct: number;
  observaciones_tecnicas: string[];
  requiere_visita_especialista_human_in_the_loop: boolean;
  nivel_confianza_ia_pct: number;
  resumen_ejecutivo: string;
  source?: string;
}

export interface CalculationBreakdown {
  areaM2: number;
  manos: number;
  areaEfectivaTotalM2: number;
  rendimientoM2Galon: number;
  factorDesperdicio: number;
  galonesPinturaExactos: number;
  cunetesPintura5Gal: number;
  galonesPintura1Gal: number;
  cunetesImprimante5Gal: number;
  galonesMasillaElastomerica: number;
  insumosAdicionales: Array<{
    item: string;
    cantidad: number;
    unidad: string;
    precioUnitarioCOP: number;
  }>;
  costoEstimadoCOP: {
    pinturaAcabado: number;
    imprimanteSellador: number;
    masillaFisuras: number;
    accesorios: number;
    subtotal: number;
    iva19: number;
    totalCOP: number;
  };
  disponibilidadBodega: {
    bodega: string;
    ciudad: string;
    skuPintura: string;
    loteActivo: string;
    stockDisponibleCunetes: number;
    stockDisponibleGalones: number;
    tiempoDespachoHoras: string;
    estadoInventario: 'disponible_inmediato' | 'produccion_tintometria' | 'agotado';
  };
}

export interface ProductCatalogItem {
  sku: string;
  nombre: string;
  categoria: 'pintura_exterior' | 'pintura_interior' | 'imprimante' | 'masilla_sellador' | 'herramienta';
  presentacion: 'cuñete_5gal' | 'galon_1gal' | 'caneca_1gal' | 'unidad';
  rendimientoM2Galon: number;
  acabado: 'mate' | 'satinado' | 'brillante' | 'n/a';
  precioBaseCOP: number;
  descripcionCorta: string;
}

export interface WarehouseStockItem {
  id: string;
  sku: string;
  bodegaNombre: string;
  municipio: string;
  numeroLote: string;
  stockDisponible: number;
  stockMinimoAlerta: number;
  estado: 'disponible' | 'bajo_stock' | 'en_tintometria' | 'agotado';
  tiempoDespachoHoras: number;
  fechaLote: string;
}

// =========================================================================
// E-COMMERCE STORE & CART TYPES
// =========================================================================

export type StoreCategory = 
  | 'todos'
  | 'hogar'
  | 'construccion'
  | 'automotriz'
  | 'industrial'
  | 'herramientas';

export interface StoreProductColor {
  id: string;
  name: string;
  hex: string;
  code: string;
  inStock: boolean;
  canImage?: string;
}

export interface StoreProductSize {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  inStock: boolean;
  capacityLiters?: number;
}

export interface StoreProduct {
  id: string;
  sku: string;
  name: string;
  brand: string;
  subtitle: string;
  category: StoreCategory;
  categoryLabel: string;
  rating: number;
  reviewsCount: number;
  badge?: string;
  description: string;
  features: string[];
  specs: {
    rendimiento: string;
    secado: string;
    base: string;
    acabado: string;
    solvente?: string;
  };
  colors: StoreProductColor[];
  sizes: StoreProductSize[];
  defaultColorId?: string;
  defaultSizeId: string;
  image: string;
  isTool?: boolean;
  /** Rendimiento real por galón a UNA mano (m²). Lo usan las calculadoras. */
  coverageM2PerGallon?: number;
  /** Manos recomendadas por el fabricante (por defecto 2). */
  defaultCoats?: number;
}

export interface CartItem {
  id: string; // unique: `${productId}_${sizeId}_${colorId || 'none'}`
  productId: string;
  name: string;
  brand?: string;
  category?: StoreCategory;
  sizeId: string;
  sizeName: string;
  colorId?: string;
  colorName?: string;
  colorHex?: string;
  colorCode?: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  image: string;
  selectedForCheckout: boolean;
  inStock?: boolean;
}

export interface StoreBranch {
  id: string;
  city: string;
  department?: string;
  name: string;
  address: string;
  phone: string;
  email?: string;
  schedule: string;
  readyInHours: number;
  lat?: number;
  lng?: number;
}

export type ActiveTab = 
  | 'tienda'
  | 'categoria'
  | 'tiendas'
  | 'pedidos'
  | 'mi_cuenta'
  | 'proyectos_teaser'
  | 'producto_detalle'
  | 'carrito'
  | 'checkout'
  | 'inicio'
  | 'dashboard'
  | 'captura'
  | 'proyectos_asesor'
  | 'calidad_revision'
  | 'inventario'
  | 'validacion'
  | 'ia_clasificacion'
  | 'motor_tecnico'
  | 'trazabilidad_arquitectura'
  | 'registro';
