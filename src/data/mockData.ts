import { PROJECT_COLORS } from './storeProducts';
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

// Colores para proyectos: los mismos colores de pintura registrados en la base de datos (tabla color_producto)
export const COLOR_PALETTES: ColorTone[] = PROJECT_COLORS;

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

