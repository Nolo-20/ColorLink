/**
 * Reglas de captura y validación de un proyecto de obra.
 * Las usan el servidor (al guardar) y la tienda (al llenar el formulario), para que
 * la regla sea la misma en los dos lados: completitud, formato y coherencia.
 */

export const TIPOS_PROYECTO = ['residencial', 'comercial', 'industrial', 'institucional', 'otro'] as const;
export const SUPERFICIES = ['concreto', 'revoque', 'ladrillo', 'drywall', 'metal', 'madera'] as const;
export const AMBIENTES = ['exterior_fachada', 'interior_muros', 'zona_humeda', 'trafico_pesado_piso', 'cubierta_techo'] as const;
export const CONDICIONES = ['humedad', 'fisuras', 'descascaramiento', 'hongos_moho', 'caleo', 'buen_estado'] as const;
export const CANALES = ['web_portal', 'whatsapp', 'asesor_comercial', 'correo', 'linea_directa'] as const;

export const TIPO_PROYECTO_LABEL: Record<string, string> = {
  residencial: 'Vivienda / residencial',
  comercial: 'Comercial (local, oficina)',
  industrial: 'Industrial (bodega, planta)',
  institucional: 'Institucional (colegio, hospital)',
  otro: 'Otro'
};
export const CONDICION_LABEL: Record<string, string> = {
  humedad: 'Humedad / filtración',
  fisuras: 'Fisuras / grietas',
  descascaramiento: 'Pintura descascarada',
  hongos_moho: 'Hongos / moho',
  caleo: 'Desgaste / caleo',
  buen_estado: 'Buen estado'
};
export const CANAL_LABEL: Record<string, string> = {
  web_portal: 'Portal web',
  whatsapp: 'WhatsApp',
  asesor_comercial: 'Asesor comercial',
  correo: 'Correo',
  linea_directa: 'Línea directa'
};

export const AREA_MIN_M2 = 1;
export const AREA_MAX_M2 = 10000;
export const PLAZO_MIN_DIAS = 3;
export const PLAZO_MAX_DIAS = 180;
export const DESCRIPCION_MAX = 1000;
export const MAX_FOTOS = 5;

export interface DatosProyecto {
  nombreProyecto?: string;
  ciudad?: string;
  tipoProyecto?: string;
  area?: number | string;
  tipoSuperficie?: string;
  ambiente?: string;
  condiciones?: string[];
  fechaRequerida?: string; // AAAA-MM-DD
  descripcion?: string;
  consentimientoDatos?: boolean;
  canalOrigen?: string;
  colorHex?: string;
}

export interface ResultadoValidacion {
  /** Errores que impiden guardar, por campo */
  errores: Record<string, string>;
  /** Avisos de coherencia: no bloquean, pero quedan registrados */
  advertencias: string[];
  /** % de campos clave completos (calidad del dato) */
  completitudPct: number;
}

/** Días entre hoy y una fecha AAAA-MM-DD (en hora local). NaN si no es válida. */
export function diasHasta(fecha: string, hoy: Date = new Date()): number {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(fecha || ''));
  if (!m) return NaN;
  const f = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  if (f.getFullYear() !== Number(m[1]) || f.getMonth() !== Number(m[2]) - 1 || f.getDate() !== Number(m[3])) return NaN;
  const base = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  return Math.round((f.getTime() - base.getTime()) / 86400000);
}

/** Fecha AAAA-MM-DD a `dias` días de hoy (para valores por defecto y límites del calendario). */
export function fechaEnDias(dias: number, hoy: Date = new Date()): string {
  const f = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate() + dias);
  return `${f.getFullYear()}-${String(f.getMonth() + 1).padStart(2, '0')}-${String(f.getDate()).padStart(2, '0')}`;
}

export function validarProyecto(d: DatosProyecto, hoy: Date = new Date()): ResultadoValidacion {
  const errores: Record<string, string> = {};
  const advertencias: string[] = [];

  // ---- Completitud y formato
  const nombre = String(d.nombreProyecto ?? '').trim();
  if (!nombre) errores.nombreProyecto = 'Escribe el nombre del proyecto.';
  else if (nombre.length < 3) errores.nombreProyecto = 'El nombre debe tener al menos 3 caracteres.';
  else if (nombre.length > 100) errores.nombreProyecto = 'El nombre puede tener máximo 100 caracteres.';
  else if (/[<>]/.test(nombre)) errores.nombreProyecto = 'El nombre no puede tener los caracteres < o >.';

  if (!String(d.ciudad ?? '').trim()) errores.ciudad = 'Elige la ciudad de la obra.';

  if (!d.tipoProyecto) errores.tipoProyecto = 'Elige el tipo de proyecto.';
  else if (!(TIPOS_PROYECTO as readonly string[]).includes(d.tipoProyecto)) errores.tipoProyecto = 'Tipo de proyecto no válido.';

  const areaTxt = String(d.area ?? '').trim();
  const area = Number(areaTxt);
  if (!areaTxt) errores.area = 'Escribe el área a pintar.';
  else if (!Number.isFinite(area)) errores.area = 'El área debe ser un número.';
  else if (area < AREA_MIN_M2 || area > AREA_MAX_M2) errores.area = `El área debe estar entre ${AREA_MIN_M2} y ${AREA_MAX_M2.toLocaleString('es-CO')} m².`;

  if (!d.tipoSuperficie) errores.tipoSuperficie = 'Elige el tipo de superficie.';
  else if (!(SUPERFICIES as readonly string[]).includes(d.tipoSuperficie)) errores.tipoSuperficie = 'Superficie no válida.';

  if (!d.ambiente) errores.ambiente = 'Elige el ambiente.';
  else if (!(AMBIENTES as readonly string[]).includes(d.ambiente)) errores.ambiente = 'Ambiente no válido.';

  const condiciones = Array.isArray(d.condiciones) ? d.condiciones : [];
  if (condiciones.length === 0) errores.condiciones = 'Indica el estado de la superficie (o "Buen estado").';
  else if (condiciones.some(c => !(CONDICIONES as readonly string[]).includes(c))) errores.condiciones = 'Condición no válida.';
  else if (condiciones.includes('buen_estado') && condiciones.length > 1) errores.condiciones = '"Buen estado" no se puede combinar con otros daños.';

  const dias = diasHasta(d.fechaRequerida || '', hoy);
  if (!d.fechaRequerida) errores.fechaRequerida = 'Indica para cuándo necesitas el material.';
  else if (!Number.isFinite(dias)) errores.fechaRequerida = 'La fecha no es válida.';
  else if (dias < PLAZO_MIN_DIAS) errores.fechaRequerida = `La fecha debe ser al menos ${PLAZO_MIN_DIAS} días después de hoy.`;
  else if (dias > PLAZO_MAX_DIAS) errores.fechaRequerida = `La fecha no puede pasar de ${PLAZO_MAX_DIAS} días (6 meses).`;

  const desc = String(d.descripcion ?? '');
  if (desc.length > DESCRIPCION_MAX) errores.descripcion = `La descripción puede tener máximo ${DESCRIPCION_MAX} caracteres.`;

  if (d.consentimientoDatos !== true) errores.consentimientoDatos = 'Debes autorizar el tratamiento de tus datos.';

  if (d.canalOrigen && !(CANALES as readonly string[]).includes(d.canalOrigen)) errores.canalOrigen = 'Canal de origen no válido.';

  if (d.colorHex && !/^#[0-9a-f]{6}(,#[0-9a-f]{6}){0,2}$/i.test(d.colorHex)) errores.colorHex = 'Puedes elegir máximo 3 colores.';

  // ---- Coherencia (avisos: no bloquean)
  if (!errores.area && !errores.tipoProyecto) {
    if (d.tipoProyecto === 'residencial' && area > 2000) advertencias.push(`${area.toLocaleString('es-CO')} m² es un área inusual para una vivienda; confirma la medida.`);
    if (d.tipoProyecto === 'industrial' && area < 20) advertencias.push('El área es muy pequeña para un proyecto industrial; confirma la medida.');
  }
  if (d.ambiente === 'trafico_pesado_piso' && (d.tipoSuperficie === 'drywall' || d.tipoSuperficie === 'madera')) {
    advertencias.push('Un piso de tráfico pesado normalmente no es de drywall o madera; revisa la superficie.');
  }
  if (d.ambiente === 'zona_humeda' && d.tipoSuperficie === 'drywall') {
    advertencias.push('En zonas húmedas el drywall debe ser resistente a la humedad (RH).');
  }
  if (Number.isFinite(dias) && !errores.area && dias < 7 && area > 1000) {
    advertencias.push('El plazo es corto para un área tan grande; el asesor confirmará la disponibilidad.');
  }
  if (condiciones.includes('humedad') && d.ambiente === 'interior_muros' && !desc.trim()) {
    advertencias.push('Hay humedad en interior: describe de dónde viene para un mejor diagnóstico.');
  }

  // ---- Calidad del dato: campos clave completos
  const clave = [nombre, d.ciudad, d.tipoProyecto, areaTxt, d.tipoSuperficie, d.ambiente, condiciones.length ? 'x' : '', d.fechaRequerida, desc.trim(), d.colorHex];
  const completitudPct = Math.round((clave.filter(v => String(v ?? '').trim()).length / clave.length) * 100);

  return { errores, advertencias, completitudPct };
}
