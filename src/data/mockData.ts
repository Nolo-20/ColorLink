import { ColorTone, ProjectFormData, UserProfile, CalculationBreakdown } from '../types';

export const INITIAL_USER: UserProfile = {
  id: 'USR-2026-0042',
  name: 'Ing. Carlos Mendoza',
  email: 'proyectos@constructorahorizonte.com.co',
  company: 'Constructora Horizonte S.A.S.',
  phone: '+57 (314) 789-2045',
  city: 'Medellín',
  role: 'constructora',
  authMethod: 'google',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  isRegistered: true,
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
      url: 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?w=800&auto=format&fit=crop&q=80',
      name: 'evidencia_fachada_concreto_fisuras.jpg',
      size: '2.4 MB',
      isPreloaded: true
    },
    {
      id: 'foto-2',
      url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
      name: 'detalle_humedad_zona_baja.jpg',
      size: '1.8 MB',
      isPreloaded: true
    }
  ],
  consentimientoDatos: true,
  timestamp: new Date().toISOString()
};

export const SAMPLE_CALCULATION: CalculationBreakdown = {
  areaM2: 85.0,
  manos: 2,
  areaEfectivaTotalM2: 170.0,
  rendimientoM2Galon: 28.5,
  factorDesperdicio: 0.10, // 10%
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
    pinturaAcabado: 485000 + (2 * 115000), // 1 cuñete + 2 galones
    imprimanteSellador: 320000, // 1 cuñete
    masillaFisuras: 176000, // 2 galones
    accesorios: (3 * 22500) + (4 * 14200) + (2 * 28000),
    subtotal: 1391300,
    iva19: 264347,
    totalCOP: 1655647
  },
  disponibilidadBodega: {
    bodega: 'Centro Logístico Regional Antioquia (Itagüí / Guayabal)',
    ciudad: 'Medellín',
    skuPintura: 'CLK-FACH-GRIS-5G',
    loteActivo: 'LOT-2026-MED-08A',
    stockDisponibleCunetes: 38,
    stockDisponibleGalones: 124,
    tiempoDespachoHoras: '24 a 48 horas',
    estadoInventario: 'disponible_inmediato'
  }
};
