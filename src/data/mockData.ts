import { 
  ColorTone, 
  ProjectFormData, 
  UserProfile, 
  CalculationBreakdown,
  ProductCatalogItem,
  WarehouseStockItem
} from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'USR-2026-0042',
  name: 'Carlos Mendoza',
  firstName: 'Carlos',
  lastName: 'Mendoza Gómez',
  documentId: '901.458.789-3',
  address: 'Calle 10A # 36-24, El Poblado',
  email: 'proyectos@constructorahorizonte.com.co',
  company: 'Constructora Horizonte S.A.S.',
  phone: '+57 (314) 789-2045',
  city: 'Medellín',
  role: 'cliente',
  authMethod: 'credentials',
  isRegistered: false, // Default starts unauthenticated to show the modern login first
};

export const DEMO_PROFILES: Record<UserProfile['role'], UserProfile> = {
  cliente: {
    id: 'USR-2026-0042',
    name: 'Carlos Mendoza',
    firstName: 'Carlos',
    lastName: 'Mendoza Gómez',
    documentId: '901.458.789-3',
    address: 'Calle 10A # 36-24, El Poblado',
    email: 'proyectos@constructorahorizonte.com.co',
    company: 'Constructora Horizonte S.A.S.',
    phone: '+57 (314) 789-2045',
    city: 'Medellín',
    role: 'cliente',
    authMethod: 'google',
    isRegistered: true,
  },
  asesor: {
    id: 'USR-STAFF-ASE-01',
    name: 'Juan David Osorio',
    firstName: 'Juan David',
    lastName: 'Osorio Ríos',
    documentId: '1.037.645.912',
    email: 'j.osorio@colorlink.com.co',
    phone: '+57 (300) 450-8812',
    city: 'Medellín',
    role: 'asesor',
    department: 'Asesoría Técnica y Comercial Medellín',
    authMethod: 'microsoft',
    isRegistered: true,
  },
  calidad: {
    id: 'USR-STAFF-CAL-04',
    name: 'Dra. Elena Restrepo',
    firstName: 'Elena',
    lastName: 'Restrepo Montoya',
    documentId: '43.892.301',
    email: 'e.restrepo@colorlink.com.co',
    phone: '+57 (311) 902-3344',
    city: 'Medellín',
    role: 'calidad',
    department: 'Laboratorio de Patologías & Certificación NTC',
    authMethod: 'microsoft',
    isRegistered: true,
  },
  administrador: {
    id: 'USR-STAFF-ADM-99',
    name: 'Mateo Quintero',
    firstName: 'Mateo',
    lastName: 'Quintero Bedoya',
    documentId: '71.390.418',
    email: 'm.quintero@colorlink.com.co',
    phone: '+57 (318) 670-1122',
    city: 'Itagüí / Medellín',
    role: 'administrador',
    department: 'Dirección de Logística & Inventarios Aburrá',
    authMethod: 'apple',
    isRegistered: true,
  }
};

export const COLOR_PALETTES: ColorTone[] = [
  { id: 'c1', name: 'Gris Fachada Urbano', hex: '#8E979D', code: 'CLK-7035-GRIS', category: 'Neutrales Exteriores' },
  { id: 'c2', name: 'Gris Grafito Profundo', hex: '#4A5568', code: 'CLK-7016-GRAF', category: 'Contemporáneos' },
  { id: 'c3', name: 'Blanco Nieve Puro', hex: '#F8FAFC', code: 'CLK-9003-BLAN', category: 'Clásicos' },
  { id: 'c4', name: 'Arena Colonial Cálido', hex: '#D6C7B2', code: 'CLK-1015-AREN', category: 'Tierra & Cálidos' },
  { id: 'c5', name: 'Marfil Suave', hex: '#EBE5D8', code: 'CLK-1013-MARF', category: 'Clásicos' },
  { id: 'c6', name: 'Piedra Natural', hex: '#A39B8B', code: 'CLK-7032-PIED', category: 'Minerales' },
  { id: 'c7', name: 'Terracota Andino', hex: '#B85D43', code: 'CLK-3011-TERR', category: 'Acentos' },
  { id: 'c8', name: 'Azul Índigo Costero', hex: '#1E3A5F', code: 'CLK-5011-AZUL', category: 'Acentos' },
];

// Formulario vacío: así arranca la cotización para el cliente (sin datos de ejemplo)
export const EMPTY_PROJECT_FORM: ProjectFormData = {
  id: '',
  cliente: '',
  emailContacto: '',
  telefonoContacto: '',
  ciudad: 'Medellín',
  proyecto: '',
  areaM2: 0,
  superficie: 'revoque',
  ambiente: 'interior_muros',
  condiciones: ['buen_estado'],
  color: '',
  colorHex: '',
  acabado: 'mate',
  fechaRequeridaDias: 15,
  canalOrigen: 'web_portal',
  descripcion: '',
  fotos: [],
  consentimientoDatos: false,
  timestamp: new Date().toISOString()
};

export const INITIAL_SAMPLE_PROJECT: ProjectFormData = {
  id: 'CLK-PRJ-2026-MED-085',
  cliente: 'Constructora Horizonte S.A.S.',
  emailContacto: 'obras@constructorahorizonte.com.co',
  telefonoContacto: '+57 (314) 789-2045',
  ciudad: 'Medellín',
  proyecto: 'Fachada edificio residencial',
  areaM2: 85.0,
  superficie: 'concreto',
  ambiente: 'exterior_fachada',
  condiciones: ['humedad', 'fisuras'],
  color: 'Gris Fachada Urbano',
  colorHex: '#8E979D',
  acabado: 'mate',
  fechaRequeridaDias: 20,
  canalOrigen: 'web_portal',
  descripcion: 'Fachada exterior de 85 m² en concreto expuesto a la intemperie en Medellín. Se evidencia presencia de humedad por filtración capilar y fisuras superficiales activas que requieren sellado previo antes de la aplicación del recubrimiento protector.',
  fotos: [
    {
      id: 'foto-1',
      url: '/visualizer/edificio.jpg',
      name: 'evidencia_fachada_concreto_fisuras.jpg',
      size: '2.4 MB',
      isPreloaded: true
    },
    {
      id: 'foto-2',
      url: '/visualizer/casa_colonial.jpg',
      name: 'detalle_humedad_zona_baja.jpg',
      size: '1.8 MB',
      isPreloaded: true
    }
  ],
  consentimientoDatos: true,
  timestamp: new Date().toISOString(),
  estadoPipeline: 'capturado',
  descuentoAsesorPct: 5,
  observacionesAsesor: 'Proyecto con alto volumen de fachada. Se recomienda entrega directa en obra con camión de tintometría rápida.',
  dictamenCalidad: {
    aprobado: true,
    perito: 'Dra. Elena Restrepo',
    fechaRevision: '2026-08-30',
    observacionSustrato: 'Superficie de concreto curado con eflorescencia localizada. Tratamiento multicapa con sellador acrílico antialcalino 100% viable.'
  }
};

export const ALL_MOCK_PROJECTS: ProjectFormData[] = [
  INITIAL_SAMPLE_PROJECT,
  {
    id: 'CLK-PRJ-2026-LAU-240',
    cliente: 'Restrepo & Asociados Arquitectura',
    emailContacto: 'especificaciones@restrepoarq.com',
    telefonoContacto: '+57 (310) 889-1122',
    ciudad: 'Medellín (Laureles)',
    proyecto: 'Restauración Muros Interiores Edificio Laureles',
    areaM2: 240.0,
    superficie: 'drywall',
    ambiente: 'interior_muros',
    condiciones: ['buen_estado'],
    color: 'Blanco Nieve Puro',
    colorHex: '#F8FAFC',
    acabado: 'satinado',
    fechaRequeridaDias: 15,
    canalOrigen: 'asesor_comercial',
    descripcion: 'Pintura interior de 240 m² sobre drywall nuevo empastado. Requiere acabado satinado de alta lavabilidad para oficinas ejecutivas.',
    fotos: [
      {
        id: 'foto-lau-1',
        url: '/visualizer/sala.jpg',
        name: 'muros_interiores_drywall.jpg',
        size: '1.5 MB',
        isPreloaded: true
      }
    ],
    consentimientoDatos: true,
    timestamp: '2026-08-28T14:30:00Z',
    estadoPipeline: 'aprobado_calidad',
    descuentoAsesorPct: 8,
    observacionesAsesor: 'Cliente recurrente categoría Platinum. Aprobada entrega por etapas.',
    dictamenCalidad: {
      aprobado: true,
      perito: 'Dra. Elena Restrepo',
      fechaRevision: '2026-08-29',
      observacionSustrato: 'Drywall debidamente encintado y lijado. Apto para vinilo tipo 1 satinado.'
    }
  },
  {
    id: 'CLK-PRJ-2026-ITA-450',
    cliente: 'Contratistas del Aburrá S.A.S.',
    emailContacto: 'obras@contratistasaburra.com',
    telefonoContacto: '+57 (316) 430-9090',
    ciudad: 'Itagüí',
    proyecto: 'Parqueaderos & Muros Industriales',
    areaM2: 450.0,
    superficie: 'concreto',
    ambiente: 'trafico_pesado_piso',
    condiciones: ['descascaramiento', 'humedad'],
    color: 'Gris Grafito Profundo',
    colorHex: '#4A5568',
    acabado: 'mate',
    fechaRequeridaDias: 10,
    canalOrigen: 'whatsapp',
    descripcion: 'Revestimiento para zona de parqueaderos de alto tránsito en concreto. Presenta desprendimiento de capa previa.',
    fotos: [],
    consentimientoDatos: true,
    timestamp: '2026-08-29T09:15:00Z',
    estadoPipeline: 'revision_asesor',
    descuentoAsesorPct: 10,
    observacionesAsesor: 'Se requiere visita presencial de perito técnico para verificar nivel de abrasión.'
  },
  {
    id: 'CLK-PRJ-2026-ENV-120',
    cliente: 'Inversiones & Hábitat Envigado',
    emailContacto: 'contacto@habitatenvigado.com',
    telefonoContacto: '+57 (301) 222-7788',
    ciudad: 'Envigado',
    proyecto: 'Fachada Casona Colonial',
    areaM2: 120.0,
    superficie: 'revoque',
    ambiente: 'exterior_fachada',
    condiciones: ['hongos_moho', 'humedad'],
    color: 'Arena Colonial Cálido',
    colorHex: '#D6C7B2',
    acabado: 'mate',
    fechaRequeridaDias: 25,
    canalOrigen: 'web_portal',
    descripcion: 'Muro exterior con presencia de musgo por bajantes defectuosas. Sustrato en revoque tradicional.',
    fotos: [],
    consentimientoDatos: true,
    timestamp: '2026-08-30T08:00:00Z',
    estadoPipeline: 'capturado'
  }
];

export const SAMPLE_CALCULATION: CalculationBreakdown = {
  areaM2: 85.0,
  manos: 2,
  areaEfectivaTotalM2: 170.0,
  rendimientoM2Galon: 28.5,
  factorDesperdicio: 0.10,
  galonesPinturaExactos: 6.56,
  cunetesPintura5Gal: 1,
  galonesPintura1Gal: 2,
  cunetesImprimante5Gal: 1,
  galonesMasillaElastomerica: 2,
  insumosAdicionales: [
    { item: 'Rodillo Profesional Microfibra 3/8"', cantidad: 3, unidad: 'Und', precioUnitarioCOP: 22500 },
    { item: 'Cinta de Enmascarar Exterior 2"', cantidad: 4, unidad: 'Rollos', precioUnitarioCOP: 14200 },
    { item: 'Plástico Protector Uso Rudo 4x10m', cantidad: 2, unidad: 'Und', precioUnitarioCOP: 28000 }
  ],
  costoEstimadoCOP: {
    pinturaAcabado: 485000 + (2 * 115000),
    imprimanteSellador: 320000,
    masillaFisuras: 176000,
    accesorios: (3 * 22500) + (4 * 14200) + (2 * 28000),
    subtotal: 1391300,
    iva19: 264347,
    totalCOP: 1655647
  },
  disponibilidadBodega: {
    bodega: 'Centro Logístico Regional Antioquia (Itagüí / Guayabal)',
    ciudad: 'Medellín',
    skuPintura: 'CLK-EXT-KORAZA-5G',
    loteActivo: 'LOT-2026-MED-08A',
    stockDisponibleCunetes: 38,
    stockDisponibleGalones: 124,
    tiempoDespachoHoras: '24 a 48 horas',
    estadoInventario: 'disponible_inmediato'
  }
};

export const PRODUCT_CATALOG: ProductCatalogItem[] = [
  {
    sku: 'CLK-EXT-KORAZA-5G',
    nombre: 'ColorLink Koraza Tech Fachada 100% Acrílica',
    categoria: 'pintura_exterior',
    presentacion: 'cuñete_5gal',
    rendimientoM2Galon: 28.5,
    acabado: 'mate',
    precioBaseCOP: 485000,
    descripcionCorta: 'Recubrimiento elastomérico para fachadas exteriores con protección UV y resistencia a lluvia ácida en Valle de Aburrá.'
  },
  {
    sku: 'CLK-EXT-KORAZA-1G',
    nombre: 'ColorLink Koraza Tech Fachada 100% Acrílica',
    categoria: 'pintura_exterior',
    presentacion: 'galon_1gal',
    rendimientoM2Galon: 28.5,
    acabado: 'mate',
    precioBaseCOP: 115000,
    descripcionCorta: 'Fracción de galón individual para remates y esquemas de ajuste sin sobrantes.'
  },
  {
    sku: 'CLK-IMP-SEAL-5G',
    nombre: 'Imprimante Sellador Antialcalino e Hidrofugante',
    categoria: 'imprimante',
    presentacion: 'cuñete_5gal',
    rendimientoM2Galon: 35.0,
    acabado: 'mate',
    precioBaseCOP: 320000,
    descripcionCorta: 'Bloqueador de humedad por capilaridad y eflorescencia salina en revoque o concreto.'
  },
  {
    sku: 'CLK-MAS-ELAST-1G',
    nombre: 'Masilla Acrílica Elastómerica Antifisuras',
    categoria: 'masilla_sellador',
    presentacion: 'galon_1gal',
    rendimientoM2Galon: 25.0,
    acabado: 'mate',
    precioBaseCOP: 88000,
    descripcionCorta: 'Sellador flexible de grietas activas hasta 2mm con elongación del 300%.'
  },
  {
    sku: 'CLK-INT-VINIL-5G',
    nombre: 'Vinilo Acrílico Tipo 1 Lavable Satinado',
    categoria: 'pintura_interior',
    presentacion: 'cuñete_5gal',
    rendimientoM2Galon: 32.0,
    acabado: 'satinado',
    precioBaseCOP: 395000,
    descripcionCorta: 'Pintura interior premium de alta lavabilidad para apartamentos, oficinas y pasillos.'
  },
  {
    sku: 'CLK-ACC-ROD-PRO',
    nombre: 'Rodillo Profesional Microfibra 3/8"',
    categoria: 'herramienta',
    presentacion: 'unidad',
    rendimientoM2Galon: 0,
    acabado: 'n/a',
    precioBaseCOP: 22500,
    descripcionCorta: 'Rodillo antigoteo para aplicación uniforme sin salpicaduras.'
  },
  {
    sku: 'CLK-ACC-CINT-EXT',
    nombre: 'Cinta de Enmascarar Exterior Protección UV 2"',
    categoria: 'herramienta',
    presentacion: 'unidad',
    rendimientoM2Galon: 0,
    acabado: 'n/a',
    precioBaseCOP: 14200,
    descripcionCorta: 'Cinta azul resistente a intemperie con remoción limpia hasta 14 días.'
  }
];

export const WAREHOUSE_STOCKS: WarehouseStockItem[] = [
  {
    id: 'STK-01',
    sku: 'CLK-EXT-KORAZA-5G',
    bodegaNombre: 'Bodega Central Itagüí (Tintometría Mayorista)',
    municipio: 'Itagüí / Medellín',
    numeroLote: 'LOT-2026-MED-08A',
    stockDisponible: 38,
    stockMinimoAlerta: 10,
    estado: 'disponible',
    tiempoDespachoHoras: 24,
    fechaLote: '2026-08-25'
  },
  {
    id: 'STK-02',
    sku: 'CLK-EXT-KORAZA-1G',
    bodegaNombre: 'Centro Logístico Guayabal',
    municipio: 'Medellín',
    numeroLote: 'LOT-2026-MED-08A',
    stockDisponible: 124,
    stockMinimoAlerta: 20,
    estado: 'disponible',
    tiempoDespachoHoras: 24,
    fechaLote: '2026-08-25'
  },
  {
    id: 'STK-03',
    sku: 'CLK-IMP-SEAL-5G',
    bodegaNombre: 'Bodega Central Itagüí (Tintometría Mayorista)',
    municipio: 'Itagüí / Medellín',
    numeroLote: 'LOT-2026-IMP-14B',
    stockDisponible: 19,
    stockMinimoAlerta: 8,
    estado: 'disponible',
    tiempoDespachoHoras: 24,
    fechaLote: '2026-08-20'
  },
  {
    id: 'STK-04',
    sku: 'CLK-MAS-ELAST-1G',
    bodegaNombre: 'Centro Logístico Guayabal',
    municipio: 'Medellín',
    numeroLote: 'LOT-2026-MAS-03C',
    stockDisponible: 45,
    stockMinimoAlerta: 15,
    estado: 'disponible',
    tiempoDespachoHoras: 24,
    fechaLote: '2026-08-18'
  },
  {
    id: 'STK-05',
    sku: 'CLK-INT-VINIL-5G',
    bodegaNombre: 'Hub Oriente Rionegro',
    municipio: 'Rionegro',
    numeroLote: 'LOT-2026-VIN-22A',
    stockDisponible: 6,
    stockMinimoAlerta: 10,
    estado: 'bajo_stock',
    tiempoDespachoHoras: 48,
    fechaLote: '2026-08-12'
  }
];
