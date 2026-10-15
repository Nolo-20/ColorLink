/**
 * Pasos de seguimiento de pedidos y proyectos (los usan la tienda, el ERP y los correos).
 * Solo lógica: cada vista dibuja la barra a su manera.
 */

export interface Progreso {
  /** Título corto del momento actual ("¡Tu pedido va en camino!") */
  titulo: string;
  /** Nombres de los pasos, en orden */
  pasos: string[];
  /** Índice del paso alcanzado (0 = primero). -1 si está cancelado. */
  actual: number;
  /** El recorrido terminó (todo en verde) */
  completo: boolean;
  cancelado: boolean;
}

/**
 * Pedido de la tienda. Acepta los estados de la base de datos
 * (creado, confirmado, en_alistamiento, en_camino, listo_recoger, entregado, cancelado).
 */
export function progresoPedido(estado: string, retiroEnTienda: boolean): Progreso {
  const pasos = retiroEnTienda
    ? ['Comprado', 'En preparación', 'Listo en tienda', 'Retirado']
    : ['Comprado', 'En preparación', 'En camino', 'Entregado'];
  const indice: Record<string, number> = {
    creado: 0, confirmado: 0, en_alistamiento: 1, en_camino: 2, listo_recoger: 2, entregado: 3
  };
  if (estado === 'cancelado') {
    return { titulo: 'Tu pedido fue cancelado', pasos, actual: -1, completo: false, cancelado: true };
  }
  const actual = indice[estado] ?? 0;
  const titulos = retiroEnTienda
    ? ['¡Recibimos tu pedido!', 'Estamos preparando tu pedido', '¡Tu pedido está listo para retirar!', '¡Retiraste tu pedido!']
    : ['¡Recibimos tu pedido!', 'Estamos preparando tu pedido', '¡Tu pedido va en camino!', '¡Tu pedido fue entregado!'];
  return { titulo: titulos[actual], pasos, actual, completo: actual === pasos.length - 1, cancelado: false };
}

/** Proyecto de obra (estado_pipeline de la base de datos). */
export function progresoProyecto(estado: string): Progreso {
  const pasos = ['Recibido', 'Cotizado', 'Aprobado', 'Despachado', 'Entregado'];
  if (estado === 'cancelado') {
    return { titulo: 'Tu proyecto fue cancelado', pasos, actual: -1, completo: false, cancelado: true };
  }
  const indice: Record<string, number> = {
    en_revision: 0, imagen_por_corregir: 0, cotizado: 1, en_peritaje: 1, rechazado: 1,
    aprobado_calidad: 2, despachado: 3, entregado: 4
  };
  const titulos: Record<string, string> = {
    en_revision: 'Recibimos tu proyecto',
    imagen_por_corregir: 'Necesitamos otra foto de tu obra',
    cotizado: '¡Tu cotización está lista!',
    en_peritaje: 'Tu proyecto está en revisión técnica',
    rechazado: 'Tu proyecto requiere ajustes técnicos',
    aprobado_calidad: '¡Tu proyecto fue aprobado!',
    despachado: '¡Tu material va en camino!',
    entregado: '¡Material entregado en obra!'
  };
  const actual = indice[estado] ?? 0;
  return { titulo: titulos[estado] || titulos.en_revision, pasos, actual, completo: actual === pasos.length - 1, cancelado: false };
}

/**
 * Estados del pedido como los ve la tienda (comprado, despacho, enviado, entregado, cancelado)
 * convertidos a los de la base de datos.
 */
export function estadoPedidoDesdeTienda(status: string, listoParaRetirar?: boolean): string {
  switch (status) {
    case 'despacho': return listoParaRetirar ? 'listo_recoger' : 'en_alistamiento';
    case 'enviado': return 'en_camino';
    case 'entregado': return 'entregado';
    case 'cancelado': return 'cancelado';
    default: return 'confirmado';
  }
}
