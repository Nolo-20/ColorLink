/**
 * Plantilla única de los correos de ColorLink (mismos colores y logo que la página web).
 *
 * El logo va incrustado en el correo (adjunto con Content-ID), así se ve aunque el servidor
 * no sea accesible desde Gmail/Outlook y aunque el cliente de correo bloquee imágenes externas.
 * Todo el diseño usa tablas y estilos en línea, que es lo que soportan los clientes de correo.
 */
import fs from 'fs';
import path from 'path';
import type { Progreso } from './src/shared/progreso';

// Paleta de la marca (igual a src/index.css)
export const MARCA = {
  navy: '#14216B',       // azul ColorLink (títulos, botón secundario)
  header: '#0A1A36',     // fondo del encabezado de la página
  amarillo: '#F2C417',   // botón principal
  amarilloSuave: '#FFFBEA',
  amarilloBorde: '#FDE68A',
  amarilloTexto: '#77580B',
  azul: '#1D74C0',
  azulSuave: '#EEF7FD',
  azulTexto: '#185E9C',
  naranja: '#F28B22',
  verde: '#3E9A35',
  rojo: '#D2343A',
  rojoSuave: '#FDECEC',
  rojoTexto: '#9F1F24',
  fondo: '#F1F5F9',
  texto: '#334155',
  textoSuave: '#64748B',
  borde: '#E2E8F0'
};

export const LOGO_CID = 'logo@colorlink';

const RUTAS_LOGO = [
  path.join(process.cwd(), 'dist', 'brand', 'logo-on-dark.png'),
  path.join(process.cwd(), 'public', 'brand', 'logo-on-dark.png')
];
let logoBuffer: Buffer | null | undefined;

/** Adjunto del logo para incrustarlo en el correo (se lee una sola vez). */
export function logoAdjunto(): { filename: string; content: Buffer; cid: string; contentType: string } | null {
  if (logoBuffer === undefined) {
    logoBuffer = null;
    for (const ruta of RUTAS_LOGO) {
      try { logoBuffer = fs.readFileSync(ruta); break; } catch { /* probar la siguiente ruta */ }
    }
    if (!logoBuffer) console.warn('[EMAIL] No se encontró brand/logo-on-dark.png; los correos saldrán con el nombre en texto.');
  }
  return logoBuffer ? { filename: 'colorlink-logo.png', content: logoBuffer, cid: LOGO_CID, contentType: 'image/png' } : null;
}

export const esc = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

export type TonoEtiqueta = 'marca' | 'info' | 'exito' | 'alerta';

const TONOS: Record<TonoEtiqueta, { fondo: string; texto: string; borde: string }> = {
  marca: { fondo: MARCA.amarilloSuave, texto: MARCA.amarilloTexto, borde: MARCA.amarilloBorde },
  info: { fondo: MARCA.azulSuave, texto: MARCA.azulTexto, borde: '#ADD8F5' },
  exito: { fondo: '#ECF7EA', texto: '#2C6E26', borde: '#BFE3B9' },
  alerta: { fondo: MARCA.rojoSuave, texto: MARCA.rojoTexto, borde: '#F5C2C4' }
};

// ------------------------------------------------------------------ piezas reutilizables

export const etiqueta = (texto: string, tono: TonoEtiqueta = 'marca') => {
  const t = TONOS[tono];
  return `<span style="display:inline-block;background:${t.fondo};color:${t.texto};border:1px solid ${t.borde};font-size:11px;font-weight:800;letter-spacing:.5px;text-transform:uppercase;padding:5px 12px;border-radius:999px;">${esc(texto)}</span>`;
};

/** Botón tipo "píldora" compatible con Outlook (tabla + enlace). */
export const boton = (texto: string, url: string, variante: 'principal' | 'secundario' = 'principal') => {
  if (!url) return '';
  const fondo = variante === 'principal' ? MARCA.amarillo : MARCA.navy;
  const color = variante === 'principal' ? MARCA.navy : '#FFFFFF';
  return `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 4px;">
    <tr><td style="border-radius:12px;background:${fondo};">
      <a href="${esc(url)}" target="_blank" style="display:inline-block;padding:13px 26px;font-family:Arial,Helvetica,sans-serif;font-size:14px;font-weight:800;color:${color};text-decoration:none;border-radius:12px;">${esc(texto)}</a>
    </td></tr>
  </table>`;
};

/** Caja destacada (motivo, mensaje, nota). El contenido ya debe venir escapado. */
export const caja = (htmlInterno: string, tono: 'marca' | 'alerta' | 'info' = 'marca') => {
  const t = tono === 'alerta' ? { fondo: MARCA.rojoSuave, barra: MARCA.rojo, texto: MARCA.rojoTexto }
    : tono === 'info' ? { fondo: MARCA.azulSuave, barra: MARCA.azul, texto: MARCA.azulTexto }
    : { fondo: MARCA.amarilloSuave, barra: MARCA.amarillo, texto: MARCA.texto };
  return `<div style="background:${t.fondo};border-left:4px solid ${t.barra};border-radius:8px;padding:14px 16px;margin:18px 0;color:${t.texto};font-size:14px;line-height:1.6;">${htmlInterno}</div>`;
};

export const parrafo = (htmlInterno: string) =>
  `<p style="margin:0 0 12px;color:${MARCA.texto};font-size:15px;line-height:1.65;">${htmlInterno}</p>`;

/**
 * Barra de progreso (Comprado → Enviado → En reparto → Entregado) hecha con tablas,
 * que es lo único que Gmail y Outlook dibujan igual. Los círculos son celdas redondeadas.
 */
export const barraProgreso = (p: Progreso) => {
  if (p.cancelado) {
    return `<div style="background:${MARCA.rojoSuave};border:1px solid #F5C2C4;border-radius:14px;padding:16px 18px;margin:20px 0;text-align:center;color:${MARCA.rojoTexto};font-size:15px;font-weight:800;">${esc(p.titulo)}</div>`;
  }
  const hecho = MARCA.azul;
  const gris = '#CBD5E1';
  const n = p.pasos.length;
  const ancho = Math.floor(100 / n);
  const linea = (activa: boolean, visible: boolean) =>
    `<td width="50%" style="padding:0;"><div style="height:4px;line-height:4px;font-size:0;background:${visible ? (activa ? hecho : gris) : 'transparent'};">&nbsp;</div></td>`;
  const celdas = p.pasos.map((paso, i) => {
    const alcanzado = i <= p.actual;
    const esActual = i === p.actual;
    const circulo = alcanzado
      ? `<td width="28" style="padding:0;"><div style="width:28px;height:28px;line-height:28px;border-radius:14px;background:${hecho};color:#FFFFFF;font-size:15px;font-weight:900;text-align:center;font-family:Arial,Helvetica,sans-serif;">&#10003;</div></td>`
      : `<td width="28" style="padding:0;"><div style="width:22px;height:22px;border-radius:14px;background:#FFFFFF;border:3px solid ${gris};font-size:0;line-height:0;">&nbsp;</div></td>`;
    return `
      <td width="${ancho}%" align="center" valign="top" style="padding:0;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
          ${linea(i <= p.actual, i > 0)}${circulo}${linea(i < p.actual, i < n - 1)}
        </tr></table>
        <div style="padding:8px 2px 0;font-family:Arial,Helvetica,sans-serif;font-size:12px;line-height:1.3;color:${esActual ? MARCA.navy : MARCA.textoSuave};font-weight:${esActual ? 800 : 600};">${esc(paso)}</div>
      </td>`;
  }).join('');
  return `
  <div style="background:#F8FAFC;border:1px solid ${MARCA.borde};border-radius:16px;padding:20px 14px 18px;margin:20px 0;">
    <p style="margin:0 0 16px;text-align:center;color:${MARCA.navy};font-size:18px;font-weight:800;line-height:1.3;">${esc(p.titulo)}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="table-layout:fixed;"><tr>${celdas}</tr></table>
  </div>`;
};

// ------------------------------------------------------------------ plantilla completa

export interface OpcionesCorreo {
  /** Texto corto que algunos clientes muestran junto al asunto */
  resumen?: string;
  etiqueta?: { texto: string; tono?: TonoEtiqueta };
  /** Texto pequeño sobre el título (por ejemplo, el nombre del proyecto) */
  antetitulo?: string;
  titulo: string;
  /** HTML del cuerpo (todo lo que venga del usuario debe ir escapado con esc()) */
  cuerpo: string;
  boton?: { texto: string; url: string; variante?: 'principal' | 'secundario' };
  /** Nota pequeña al final del contenido */
  nota?: string;
  destinatario?: string;
}

export function plantillaCorreo(o: OpcionesCorreo): string {
  const logo = logoAdjunto();
  const cabecera = logo
    ? `<img src="cid:${LOGO_CID}" alt="ColorLink" width="172" height="36" style="display:block;width:172px;height:36px;border:0;outline:none;" />`
    : `<span style="font-family:Arial,Helvetica,sans-serif;font-size:24px;font-weight:900;color:#FFFFFF;">Color<span style="color:${MARCA.amarillo};">Link</span></span>`;
  const franja = [MARCA.naranja, MARCA.amarillo, MARCA.verde, MARCA.azul, MARCA.rojo]
    .map(c => `<td style="height:4px;line-height:4px;font-size:0;background:${c};">&nbsp;</td>`).join('');

  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width,initial-scale=1" />
<meta name="color-scheme" content="light only" />
<title>${esc(o.titulo)}</title>
</head>
<body style="margin:0;padding:0;background:${MARCA.fondo};">
  ${o.resumen ? `<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(o.resumen)}</div>` : ''}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${MARCA.fondo};">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;font-family:-apple-system,'Segoe UI',Roboto,Arial,Helvetica,sans-serif;">
        <!-- Encabezado -->
        <tr><td style="background:${MARCA.header};padding:22px 28px;border-radius:16px 16px 0 0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>
            <td>${cabecera}</td>
            <td align="right" style="font-family:Arial,Helvetica,sans-serif;font-size:10px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#94A3B8;">Recubrimientos &amp; Pinturas</td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:0;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr>${franja}</tr></table></td></tr>
        <!-- Contenido -->
        <tr><td style="background:#FFFFFF;padding:32px 28px 28px;border-left:1px solid ${MARCA.borde};border-right:1px solid ${MARCA.borde};">
          ${o.etiqueta ? `<div style="margin:0 0 14px;">${etiqueta(o.etiqueta.texto, o.etiqueta.tono)}</div>` : ''}
          ${o.antetitulo ? `<p style="margin:0 0 4px;color:${MARCA.textoSuave};font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;">${esc(o.antetitulo)}</p>` : ''}
          <h1 style="margin:0 0 14px;color:${MARCA.navy};font-size:22px;line-height:1.3;font-weight:800;">${esc(o.titulo)}</h1>
          ${o.cuerpo}
          ${o.boton ? boton(o.boton.texto, o.boton.url, o.boton.variante) : ''}
          ${o.nota ? `<p style="margin:22px 0 0;color:${MARCA.textoSuave};font-size:12px;line-height:1.6;">${o.nota}</p>` : ''}
        </td></tr>
        <!-- Pie -->
        <tr><td style="background:#FFFFFF;border:1px solid ${MARCA.borde};border-top:0;border-radius:0 0 16px 16px;padding:0 28px 24px;">
          <div style="border-top:1px solid ${MARCA.borde};padding-top:16px;">
            <p style="margin:0;color:${MARCA.navy};font-size:12px;font-weight:800;">ColorLink Recubrimientos S.A.S.</p>
            <p style="margin:2px 0 0;color:${MARCA.textoSuave};font-size:11px;line-height:1.6;">Medellín, Colombia · Pinturas, recubrimientos y asesoría técnica para tus obras.</p>
            ${o.destinatario ? `<p style="margin:8px 0 0;color:#94A3B8;font-size:11px;">Este correo se envió a ${esc(o.destinatario)}. Es un mensaje automático: no respondas a esta dirección.</p>` : ''}
          </div>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

/** Adjuntos de un correo: siempre el logo + los que pida cada correo (por ejemplo, el QR). */
export function adjuntosCorreo(extra: any[] = []) {
  const logo = logoAdjunto();
  return logo ? [logo, ...extra] : extra;
}
