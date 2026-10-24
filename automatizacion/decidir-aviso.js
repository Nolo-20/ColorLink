// ColorLink → n8n: decide a quién avisar según el evento que envió el backend.
// Si el evento no requiere aviso, se devuelve una lista vacía y el flujo termina aquí.
const entrada = $input.first().json;
const headers = entrada.headers || {};
const cuerpo = entrada.body || {};

// 1) Seguridad: el token debe coincidir con AUTOMATIZACION_TOKEN del backend
const esperado = $env.COLORLINK_TOKEN || '';
if (esperado && headers['x-colorlink-token'] !== esperado) {
  throw new Error('Token de ColorLink inválido');
}

const d = cuerpo.datos || {};
const equipo = $env.COLORLINK_EQUIPO_EMAIL || 'colorlinkpin@gmail.com';
const despachos = $env.COLORLINK_DESPACHOS_EMAIL || equipo;
const compras = $env.COLORLINK_COMPRAS_EMAIL || equipo;
const ESTADOS = {
  en_revision: 'En revisión', imagen_por_corregir: 'Imagen por corregir', en_peritaje: 'En peritaje',
  cotizado: 'Cotizado', aprobado_calidad: 'Aprobado por calidad', rechazado: 'Rechazado por calidad',
  despachado: 'Despachado', entregado: 'Entregado en obra', cancelado: 'Cancelado'
};
const lista = (xs) => '<ul>' + xs.map(x => `<li>${x}</li>`).join('') + '</ul>';
const avisos = [];

switch (cuerpo.evento) {
  case 'proyecto.creado': {
    const problemas = [...(d.advertencias || [])];
    if ((d.posiblesDuplicados || []).length) problemas.push(`Posible duplicado de: ${d.posiblesDuplicados.join(', ')}`);
    if (d.clasificacion && d.clasificacion.requiereVisita) problemas.push('La IA recomienda visita técnica.');
    if (d.clasificacion && d.clasificacion.motor === 'colorlink-expert-engine') problemas.push('Clasificado por reglas (la IA no estuvo disponible).');
    // Todo proyecto nuevo se reparte; si tiene problemas, el asunto lo dice
    avisos.push({
      para: equipo,
      asunto: `${problemas.length ? '⚠️ Revisar' : 'Nuevo'} proyecto: ${d.nombreProyecto} (${d.ciudad})`,
      html: `<h3>${d.nombreProyecto}</h3>
        <p><b>Cliente:</b> ${d.clienteEmail}<br><b>Tipo:</b> ${d.tipoProyecto} · <b>Área:</b> ${d.areaM2} m²<br>
        <b>Material para:</b> ${d.fechaRequerida} · <b>Canal:</b> ${d.canal}<br>
        <b>Datos completos:</b> ${d.completitudPct}% · <b>Evidencias:</b> ${d.evidencias}</p>
        ${d.clasificacion ? `<p><b>IA:</b> ${d.clasificacion.categoria} · severidad ${d.clasificacion.severidad} · complejidad ${d.clasificacion.complejidad}${d.clasificacion.confianzaPct != null ? ` · confianza ${d.clasificacion.confianzaPct}%` : ''}</p>` : '<p>Sin clasificación con IA.</p>'}
        ${problemas.length ? '<p><b>Para revisar:</b></p>' + lista(problemas) : ''}`
    });
    break;
  }
  case 'proyecto.estado_cambiado': {
    if (d.estadoNuevo === 'aprobado_calidad') {
      avisos.push({
        para: despachos,
        asunto: `Listo para despacho: ${d.nombreProyecto}`,
        html: `<p>Calidad aprobó el proyecto <b>${d.nombreProyecto}</b> (${d.ciudad || 'sin ciudad'}). Ya se puede alistar y despachar el material.</p>`
      });
    } else if (d.estadoNuevo === 'rechazado') {
      avisos.push({
        para: equipo,
        asunto: `Rechazado por calidad: ${d.nombreProyecto}`,
        html: `<p>El perito rechazó el sustrato de <b>${d.nombreProyecto}</b>. Asesor: ${d.asesor || 'sin asignar'}. Coordina con el cliente los ajustes.</p>`
      });
    } else if (d.estadoNuevo === 'entregado') {
      avisos.push({
        para: equipo,
        asunto: `Entregado en obra: ${d.nombreProyecto}`,
        html: `<p>El proyecto <b>${d.nombreProyecto}</b> quedó entregado${d.guia ? ` (guía ${d.guia})` : ''}. Estado anterior: ${ESTADOS[d.estadoAnterior] || d.estadoAnterior}.</p>`
      });
    }
    break;
  }
  case 'inventario.stock_bajo': {
    avisos.push({
      para: compras,
      asunto: `Stock bajo: ${d.productos.length} presentación(es) con menos de ${d.minimo} unidades`,
      html: '<p>Estas presentaciones necesitan reabastecimiento:</p>' + lista(d.productos.map(p => `${p.nombre} · ${p.presentacion || ''}: <b>${p.unidades}</b> unidades`))
    });
    break;
  }
  default:
    // pedido.creado, pedido.estado_cambiado: quedan registrados en el historial de ejecuciones de n8n
    break;
}

return avisos.map(a => ({ json: { ...a, de: $env.COLORLINK_REMITENTE || 'ColorLink <colorlinkpin@gmail.com>', evento: cuerpo.evento } }));
