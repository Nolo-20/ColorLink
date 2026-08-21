export interface UserProfile {
  id: string;
  name: string;
  email: string;
  company: string;
  phone: string;
  city: string;
  role: 'constructora' | 'contratista' | 'arquitecto' | 'pintor' | 'compras' | 'administrador';
  authMethod: 'google' | 'email_otp' | 'credentials';
  avatar?: string;
  isRegistered: boolean;
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

export type ActiveTab = 
  | 'registro'
  | 'captura'
  | 'validacion'
  | 'ia_clasificacion'
  | 'motor_tecnico'
  | 'trazabilidad_arquitectura';
