import { STORE_PRODUCTS } from './src/data/storeProducts';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import nodemailer from 'nodemailer';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { createHash } from 'crypto';
import QRCode from 'qrcode';
import { registerVisualizerRoutes, startVisualizerAutogen } from './visualizerGen';

dotenv.config();

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'CAMBIA_ESTO_EN_TU_ENV';
const APP_URL = process.env.APP_URL || 'http://localhost:3000';

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
};

// Roles internos (empleados) y estados válidos de un proyecto
const STAFF_ROLES = ['asesor', 'calidad', 'despachos', 'administrador'];
// Límites de negocio compartidos con el ERP
const MAX_AREA_M2 = 100000;
const MAX_DESCUENTO_ASESOR = 15;
const ESTADOS_PROYECTO = [
  'en_revision', 'imagen_por_corregir', 'en_peritaje', 'cotizado',
  'aprobado_calidad', 'rechazado', 'despachado', 'cancelado'
];

// Estados que un asesor puede fijar a mano; aprobar/rechazar/despachar tienen su propio flujo
const ESTADOS_EDITABLES_ASESOR = ['en_revision', 'en_peritaje', 'cotizado', 'cancelado'];

// Todo lo que el ERP necesita ver de un proyecto (sin el binario de la foto)
const PROYECTO_STAFF_INCLUDE = {
  evidencias: { select: { evidenciaId: true, nombreArchivo: true, fechaRegistro: true }, orderBy: { fechaRegistro: 'desc' } },
  diagnostico: true,
  cotizaciones: { orderBy: { createdAt: 'desc' }, include: { items: { include: { producto: true } } } },
  empresa: { include: { ciudad: true } },
  usuario: { select: { usuarioId: true, nombre: true, apellido: true, email: true, telefono: true, company: true, documentId: true } },
  asesorAsignado: { select: { usuarioId: true, nombre: true, apellido: true, email: true, telefono: true, avatarUrl: true } },
  peritoAsignado: { select: { usuarioId: true, nombre: true, apellido: true, email: true, telefono: true, avatarUrl: true } },
  historial: { orderBy: { fecha: 'desc' } },
  despacho: true
} as const;

function issueSessionToken(user: { usuarioId: string; email: string; rol: { rol: string } }) {
  return jwt.sign(
    { id: user.usuarioId, email: user.email, role: user.rol.rol },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function safeUser(user: any) {
  return {
    id: user.usuarioId,
    name: `${user.nombre} ${user.apellido || ''}`.trim(),
    firstName: user.nombre,
    lastName: user.apellido,
    email: user.email,
    phone: user.telefono || '',
    company: user.company || '',
    documentId: user.documentId || '',
    address: user.address || '',
    city: user.city || 'Medellín',
    role: user.rol?.rol,
    authMethod: user.authProvider,
    avatar: user.avatarUrl || null, // null = el frontend muestra un ícono genérico, no una foto de stock
    isRegistered: !!user.company
  };
}

// ---------- Email (nodemailer / SMTP) ----------
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// ---------- WhatsApp: pendiente / desactivado por ahora.
// Cuando decidas retomarlo (con tu propio WhatsApp personal, sin que nadie más tenga que hacer nada),
// aquí es donde reconectaríamos sendWhatsAppMessage. Por ahora es un no-op seguro.
async function sendWhatsAppMessage(_toPhone: string, _body: string) {
  return;
}

/** Convierte una entrada del historial de un proyecto en un aviso entendible para el cliente (sin notas internas). */
function textoHistorialCliente(
  h: { estadoAnterior: string | null; estadoNuevo: string; comentario: string | null },
  nombreProyecto: string
): { titulo: string; detalle: string } {
  const c = h.comentario || '';
  const nombre = `«${nombreProyecto}»`;
  const ESTADO: Record<string, string> = {
    en_revision: 'en revisión', imagen_por_corregir: 'pendiente de una nueva foto', en_peritaje: 'en revisión técnica',
    cotizado: 'cotizado', aprobado_calidad: 'aprobado por calidad', rechazado: 'con ajustes técnicos pendientes',
    despachado: 'despachado', cancelado: 'cancelado'
  };
  if (c.startsWith('Escalado a asesor ')) {
    const asesor = c.slice('Escalado a asesor '.length).split('.')[0];
    return { titulo: 'Tienes un asesor asignado', detalle: `${asesor} está a cargo de tu proyecto ${nombre}. Puedes escribirle desde el proyecto.` };
  }
  if (c.startsWith('Enviado a peritaje con ')) return { titulo: 'Tu proyecto pasó a revisión técnica', detalle: `Un perito de calidad está revisando ${nombre}.` };
  if (c.startsWith('Cotización técnica:')) {
    const total = /Total (\$[\d.,]+ COP)/.exec(c)?.[1];
    return { titulo: 'Tu cotización está lista', detalle: `${nombre}${total ? ` · total ${total}` : ''}.` };
  }
  if (c.startsWith('Veredicto de calidad: APROBADO')) return { titulo: 'Tu proyecto fue aprobado por calidad', detalle: `${nombre} quedó listo para el despacho del material.` };
  if (c.startsWith('Veredicto de calidad: RECHAZADO')) return { titulo: 'Calidad pidió ajustes en tu proyecto', detalle: `Tu asesor te contará qué se debe ajustar en ${nombre}.` };
  if (c.startsWith('Veredicto de calidad:')) return { titulo: 'Calidad revisó tu proyecto', detalle: `Se registraron observaciones técnicas en ${nombre}.` };
  if (c.startsWith('Se pidió al cliente cambiar la imagen')) {
    const motivo = c.split('Motivo: ')[1];
    return { titulo: 'Necesitamos otra foto de tu proyecto', detalle: `${nombre}${motivo ? `: ${motivo}` : ''}` };
  }
  if (c.startsWith('Despachado con guía')) {
    const guia = /guía ([^,.]+)/.exec(c)?.[1];
    return { titulo: 'Tu material va en camino', detalle: `${nombre}${guia ? ` · guía ${guia}` : ''}.` };
  }
  if (c.startsWith('Entrega confirmada en obra')) return { titulo: 'Entrega confirmada en obra', detalle: `El material de ${nombre} fue recibido.` };
  if (c.startsWith('Proyecto registrado')) return { titulo: 'Proyecto recibido', detalle: `${nombre} está en revisión.` };
  if (c.startsWith('El cliente subió una nueva imagen')) return { titulo: 'Recibimos tu nueva foto', detalle: `${nombre} vuelve a revisión.` };
  if (h.estadoAnterior !== h.estadoNuevo && ESTADO[h.estadoNuevo]) {
    return { titulo: `Tu proyecto ahora está ${ESTADO[h.estadoNuevo]}`, detalle: nombre };
  }
  return { titulo: 'Tu proyecto tuvo una actualización', detalle: nombre };
}

/** Valida los datos de un empleado (crear: todos; editar: solo los que llegan). Devuelve el error o null. */
function errorDatosEmpleado(d: { nombre?: any; apellido?: any; email?: any; telefono?: any; documentId?: any }, parcial: boolean): string | null {
  const LETRAS = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+( [A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*$/;
  const texto = (v: any) => String(v ?? '').trim().replace(/\s+/g, ' ');
  for (const [campo, etiqueta] of [['nombre', 'El nombre'], ['apellido', 'El apellido']] as const) {
    if (parcial && d[campo] === undefined) continue;
    const v = texto(d[campo]);
    if (v.length < 2 || v.length > 40 || !LETRAS.test(v)) return `${etiqueta} debe tener solo letras (2 a 40).`;
  }
  if (!(parcial && d.email === undefined)) {
    const e = texto(d.email).toLowerCase();
    if (e.length > 100 || !/^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(e)) return 'El correo no es válido.';
  }
  if (d.telefono !== undefined && d.telefono !== null && texto(d.telefono) !== '') {
    const dig = texto(d.telefono).replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
    if (!/^3\d{9}$/.test(dig) && !/^60\d{8}$/.test(dig)) return 'El celular debe tener 10 números y empezar por 3.';
  }
  if (d.documentId !== undefined && d.documentId !== null && texto(d.documentId) !== '') {
    if (!/^[A-Z0-9]{5,12}$/i.test(texto(d.documentId).replace(/[.\s-]/g, ''))) return 'El documento debe tener entre 5 y 12 letras o números.';
  }
  return null;
}

/** JSON seguro dentro de un <script> (evita que un "</script>" en los datos cierre la etiqueta) */
const jsonParaScript = (v: any) => JSON.stringify(v).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');

const escapeHtml = (s: any) =>
  String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string));

async function sendOrderStatusEmail(email: string, orden: any, estado: string) {
  if (!process.env.SMTP_HOST) {
    console.warn(`[EMAIL] SMTP no configurado. Actualización de orden ${orden.ordenId} para ${email}: ${estado}`);
    return;
  }

  const estadoLabels: Record<string, string> = {
    creado: 'Pedido recibido',
    confirmado: 'Pago confirmado',
    en_alistamiento: 'En alistamiento',
    en_camino: 'En camino',
    listo_recoger: 'Listo para recoger en tienda',
    entregado: 'Entregado',
    cancelado: 'Cancelado'
  };

  const orderCode = orden.ordenId.slice(0, 8).toUpperCase();
  const isPickup = orden.metodoEntrega === 'recoger_tienda';
  // El QR se envía al confirmar la compra y cuando el pedido queda listo para retirar
  const showQr = isPickup && (estado === 'confirmado' || estado === 'listo_recoger');
  const pickupCode = String(orden.qrToken || '').slice(0, 8).toUpperCase();

  const attachments: any[] = [];
  let qrBlock = '';

  if (showQr && orden.qrToken) {
    const qrBuffer = await QRCode.toBuffer(String(orden.qrToken), { width: 240, margin: 1, errorCorrectionLevel: 'M' });
    attachments.push({ filename: 'qr-retiro.png', content: qrBuffer, cid: 'qr-retiro@colorlink' });

    qrBlock = `
      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:12px; padding:20px; text-align:center; margin:20px 0;">
        <p style="margin:0 0 12px; color:#0A1A36; font-size:13px; font-weight:800; text-transform:uppercase; letter-spacing:0.5px;">
          Tu código de retiro
        </p>
        <img src="cid:qr-retiro@colorlink" width="180" height="180" alt="Código QR de retiro" style="display:block; margin:0 auto; border:6px solid #ffffff; border-radius:8px;" />
        <p style="margin:14px 0 2px; font-family: 'Courier New', monospace; font-size:24px; font-weight:800; letter-spacing:4px; color:#0A1A36;">
          ${pickupCode}
        </p>
        <p style="margin:0; color:#64748b; font-size:11px;">Si el QR no se puede escanear, dicta este código en la sucursal.</p>
        <p style="margin:16px 0 0; color:#334155; font-size:13px;">
          <strong>Sucursal de retiro:</strong><br/>${escapeHtml(orden.direccionEntrega || 'Sucursal asignada')}
        </p>
      </div>`;
  }

  const itemsRows = (orden.items || []).map((it: any) => `
    <tr>
      <td style="padding:8px 0; color:#334155; font-size:13px; border-bottom:1px solid #f1f5f9;">${escapeHtml(it.nombreProducto)} × ${it.cantidad}</td>
      <td style="padding:8px 0; color:#0A1A36; font-size:13px; font-weight:700; text-align:right; border-bottom:1px solid #f1f5f9;">$${Number(it.subtotal).toLocaleString('es-CO')}</td>
    </tr>`).join('');

  const intro =
    showQr && estado === 'confirmado'
      ? 'Tu pago fue confirmado. Presenta este código en la sucursal junto con tu documento de identidad para retirar tu pedido.'
      : showQr && estado === 'listo_recoger'
        ? '¡Tu pedido ya está listo! Acércate a la sucursal con este código y tu documento de identidad.'
        : `Tu pedido por un total de <strong style="color:#0A1A36;">$${Number(orden.total).toLocaleString('es-CO')} COP</strong> cambió de estado.`;

  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"ColorLink" <no-reply@colorlink.com>',
    to: email,
    subject: `Tu pedido #${orderCode} - ${estadoLabels[estado] || estado}`,
    attachments,
    html: `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #f1f5f9;">
      <div style="background: #0A1A36; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <img src="${APP_URL}/brand/logo-on-dark.png" alt="ColorLink" height="34" style="display:block;height:34px;width:auto;border:0;" />
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px;">
        <span style="display:inline-block; background:#d1fae5; color:#065f46; font-size:11px; font-weight:800; padding:4px 10px; border-radius:999px; text-transform:uppercase; letter-spacing:0.5px;">
          ${estadoLabels[estado] || estado}
        </span>
        <h2 style="color: #0A1A36; margin: 14px 0 6px; font-size: 20px;">Pedido #${orderCode}</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6; margin: 0;">${intro}</p>

        ${qrBlock}

        ${itemsRows ? `
        <table style="width:100%; border-collapse:collapse; margin-top:8px;">${itemsRows}
          <tr>
            <td style="padding:12px 0 0; color:#0A1A36; font-size:14px; font-weight:800;">Total</td>
            <td style="padding:12px 0 0; color:#0A1A36; font-size:14px; font-weight:800; text-align:right;">$${Number(orden.total).toLocaleString('es-CO')} COP</td>
          </tr>
        </table>` : ''}

        <a href="${process.env.APP_URL || ''}" style="display:inline-block; background:#F2C417; color:#14216B; font-weight:800; font-size:13px; padding:12px 24px; border-radius:10px; text-decoration:none; margin-top:24px;">
          Ver mi pedido
        </a>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          ColorLink Recubrimientos S.A.S. · Medellín, Colombia
        </p>
      </div>
    </div>`
  });
}

function validatePasswordPolicy(pw: string): string | null {
  if (pw.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Z]/.test(pw)) return 'Debe incluir al menos una letra mayúscula.';
  if (!/[0-9]/.test(pw)) return 'Debe incluir al menos un número.';
  if (!/[^A-Za-z0-9]/.test(pw)) return 'Debe incluir al menos un carácter especial (por ejemplo: ! @ # $ %).';
  return null;
}


// Valida y limpia los datos del registro (persona natural o jurídica)
function validateSignupFields(body: any, opts: { requirePassword: boolean }):
  | { error: string }
  | { nombre: string; apellido: string; correo: string; tipoPersona: 'natural' | 'juridica'; documento: string; empresa: string; direccion: string; ciudad: string; celular: string } {
  const { firstName, lastName, email, company, documentId, address, city, phone, password, personType, documentType } = body || {};
  const txt = (v: any) => (typeof v === 'string' ? v.trim().replace(/\s+/g, ' ') : '');
  const nombre = txt(firstName), apellido = txt(lastName), correo = txt(email).toLowerCase();
  const tipoPersona: 'natural' | 'juridica' = personType === 'juridica' ? 'juridica' : 'natural';
  const tipoDoc = tipoPersona === 'juridica' ? 'NIT' : (['CC', 'CE', 'PAS'].includes(documentType) ? documentType : 'CC');
  const documento = txt(documentId).toUpperCase();
  const empresa = txt(company), direccion = txt(address), ciudad = txt(city), celular = txt(phone).replace(/\D/g, '');
  const soloLetras = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+( [A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*$/;

  if (!soloLetras.test(nombre) || nombre.length < 2 || nombre.length > 40) return { error: 'El nombre solo puede tener letras (2 a 40 caracteres).' };
  if (!soloLetras.test(apellido) || apellido.length < 2 || apellido.length > 40) return { error: 'El apellido solo puede tener letras (2 a 40 caracteres).' };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo) || correo.length > 100) return { error: 'El correo no es válido.' };
  const docOk = ({ CC: /^[0-9]{6,10}$/, CE: /^[A-Z0-9]{6,12}$/, PAS: /^[A-Z0-9]{5,12}$/, NIT: /^[0-9]{9}-[0-9]$/ } as Record<string, RegExp>)[tipoDoc].test(documento);
  if (!docOk) return { error: tipoDoc === 'NIT' ? 'El NIT debe tener 9 números y el dígito de verificación (ej. 901234567-8).' : 'El número de documento no es válido para el tipo seleccionado.' };
  if (tipoPersona === 'juridica' && (empresa.length < 3 || empresa.length > 100)) return { error: 'La razón social debe tener entre 3 y 100 caracteres.' };
  if (!/^3[0-9]{9}$/.test(celular) && !/^60[0-9]{8}$/.test(celular)) return { error: 'El celular debe tener 10 números y empezar por 3.' };
  if (direccion.length > 120 || (direccion && direccion.length < 5)) return { error: 'La dirección no es válida.' };
  if (ciudad.length > 60) return { error: 'La ciudad no es válida.' };
  if (opts.requirePassword || password) {
    const policyError = validatePasswordPolicy(String(password || ''));
    if (policyError) return { error: policyError };
  }
  return { nombre, apellido, correo, tipoPersona, documento, empresa, direccion, ciudad, celular };
}

const SIGNUP_COOKIE = { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const, maxAge: 30 * 60 * 1000 };

// El token incluye una huella de la contraseña actual: cuando la contraseña cambia, el enlace deja de servir.
function passwordFingerprint(passwordHash: string | null) {
  return createHash('sha256').update(passwordHash || '').digest('hex').slice(0, 16);
}

function makeResetToken(user: any) {
  return jwt.sign(
    { uid: user.usuarioId, purpose: 'password_reset', fp: passwordFingerprint(user.passwordHash) },
    JWT_SECRET,
    { expiresIn: '30m' }
  );
}

async function sendPasswordResetEmail(email: string, firstName: string, link: string) {
  if (!process.env.SMTP_HOST) {
    console.warn(`[EMAIL] SMTP no configurado. Enlace de recuperación para ${email}: ${link}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"ColorLink" <no-reply@colorlink.com>',
    to: email,
    subject: 'Restablece tu contraseña de ColorLink',
    html: `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #f1f5f9;">
      <div style="background: #0A1A36; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <img src="${APP_URL}/brand/logo-on-dark.png" alt="ColorLink" height="34" style="display:block;height:34px;width:auto;border:0;" />
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #0A1A36; margin: 0 0 10px;">Hola, ${firstName}</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta. El enlace es válido por 30 minutos y solo se puede usar una vez.
        </p>
        <a href="${link}" style="display:inline-block; background:#F2C417; color:#14216B; font-weight:800; font-size:13px; padding:12px 24px; border-radius:10px; text-decoration:none; margin-top:16px;">
          Crear nueva contraseña
        </a>
        <p style="color: #94a3b8; font-size: 11px; margin-top: 28px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
          Si no fuiste tú, ignora este correo: tu contraseña actual sigue funcionando.
        </p>
      </div>
    </div>`
  });
}

async function sendWelcomeEmail(email: string, firstName: string) {
  if (!process.env.SMTP_HOST) {
    console.warn(`[EMAIL] SMTP no configurado. Bienvenida pendiente para ${email}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"ColorLink" <no-reply@colorlink.com>',
    to: email,
    subject: '¡Bienvenido a ColorLink! 🎨',
    html: `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #f1f5f9;">
      <div style="background: #0A1A36; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <img src="${APP_URL}/brand/logo-on-dark.png" alt="ColorLink" height="34" style="display:block;height:34px;width:auto;border:0;" />
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #0A1A36; margin: 0 0 10px;">¡Hola, ${firstName}! 👋</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Tu cuenta en ColorLink ya está lista. Ya puedes cotizar proyectos con diagnóstico de IA o comprar directo en nuestra tienda de pinturas y recubrimientos.
        </p>
        <a href="${process.env.APP_URL || ''}" style="display:inline-block; background:#F2C417; color:#14216B; font-weight:800; font-size:13px; padding:12px 24px; border-radius:10px; text-decoration:none; margin-top:16px;">
          Ingresar y Explorar
        </a>
      </div>
    </div>`
  });
}

async function sendOtpEmail(email: string, code: string) {
  if (!process.env.SMTP_HOST) {
    console.warn(`[EMAIL] SMTP no configurado. Código para ${email}: ${code}`);
    return;
  }
  await transporter.sendMail({
    from: process.env.SMTP_FROM || '"ColorLink" <no-reply@colorlink.com>',
    to: email,
    subject: 'Tu código de acceso a ColorLink',
    html: `<div style="font-family:sans-serif;padding:20px;">
      <h2>Tu código de acceso</h2>
      <p style="font-size:28px;font-weight:bold;letter-spacing:4px;">${code}</p>
      <p style="color:#666;font-size:13px;">Este código expira en 10 minutos. Si no solicitaste esto, ignora este correo.</p>
    </div>`
  });
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '25mb' }));
  app.use(cookieParser());

  // Limita intentos de login/OTP para frenar ataques de fuerza bruta
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutos
    max: 10, // 10 intentos por IP en esa ventana
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Demasiados intentos. Espera unos minutos e intenta de nuevo.' }
  });

  // ---------- Middleware de autenticación ----------
  async function requireAuth(req: any, res: any, next: any) {
    const token = req.cookies?.session;
    if (!token) return res.status(401).json({ success: false, error: 'No autenticado' });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch {
      return res.status(401).json({ success: false, error: 'Sesión inválida o expirada' });
    }

    // Un empleado desactivado pierde el acceso al instante, aunque su sesión (7 días) siga vigente.
    if (STAFF_ROLES.includes(req.user.role)) {
      try {
        const u = await prisma.usuario.findUnique({ where: { usuarioId: req.user.id }, select: { activo: true, nombre: true, apellido: true, rol: { select: { rol: true } } } });
        if (!u || u.activo === false) {
          res.clearCookie('session');
          return res.status(401).json({ success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' });
        }
        req.user.role = u.rol.rol; // el rol vigente en la BD manda sobre el que quedó en la cookie
        req.user.name = `${u.nombre} ${u.apellido || ''}`.trim();
      } catch (e) {
        console.error('[requireAuth]', e);
        return res.status(500).json({ success: false, error: 'No se pudo validar la sesión' });
      }
    }
    next();
  }

  function requireRole(...roles: string[]) {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'No tienes permiso para esta acción' });
      }
      next();
    };
  }

  // Foto fija de quién ejecutó una acción (nombre y rol), para la trazabilidad
  async function actorSnapshot(user: any) {
    let nombre: string | undefined = user.name;
    if (!nombre) {
      const u = await prisma.usuario.findUnique({ where: { usuarioId: user.id }, select: { nombre: true, apellido: true } });
      nombre = u ? `${u.nombre} ${u.apellido || ''}`.trim() : user.email;
    }
    return { usuarioId: user.id as string, usuarioNombre: nombre as string, rolNombre: user.role as string };
  }

  // ================================================================
  // AUTENTICACIÓN
  // ================================================================

  // 1. Enviar código OTP por email
  app.post('/api/auth/send-otp', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, error: 'Correo requerido' });

      const cleanEmail = String(email).trim().toLowerCase();
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      // Invalida códigos anteriores no usados de ese correo
      await prisma.otpVerificationCode.updateMany({
        where: { email: cleanEmail, isUsed: false },
        data: { isUsed: true }
      });

      await prisma.otpVerificationCode.create({
        data: { email: cleanEmail, code, expiresAt }
      });

      await sendOtpEmail(cleanEmail, code);

      res.json({ success: true, message: 'Código enviado. Revisa tu correo.' });
    } catch (error: any) {
      console.error('[send-otp]', error);
      res.status(500).json({ success: false, error: 'No se pudo enviar el código' });
    }
  });

  // 2. Verificar código OTP
  app.post('/api/auth/verify-otp', authLimiter, async (req, res) => {
    try {
      const { email, code } = req.body;
      if (!email || !code) {
        return res.status(400).json({ success: false, error: 'Correo y código requeridos' });
      }

      const cleanEmail = String(email).trim().toLowerCase();

      const stored = await prisma.otpVerificationCode.findFirst({
        where: { email: cleanEmail, isUsed: false },
        orderBy: { createdAt: 'desc' }
      });

      if (!stored) {
        return res.status(400).json({ success: false, error: 'No hay un código activo. Solicita uno nuevo.' });
      }
      if (new Date() > stored.expiresAt) {
        return res.status(400).json({ success: false, error: 'El código expiró. Solicita uno nuevo.' });
      }
      if (stored.code !== String(code).trim()) {
        return res.status(400).json({ success: false, error: 'Código incorrecto.' });
      }

      await prisma.otpVerificationCode.update({
        where: { id: stored.id },
        data: { isUsed: true }
      });

      const existingUser = await prisma.usuario.findUnique({
        where: { email: cleanEmail },
        include: { rol: true }
      });

      if (existingUser) {
        if (existingUser.activo === false) {
          return res.status(403).json({ success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' });
        }
        const token = issueSessionToken(existingUser);
        res.cookie('session', token, cookieOptions);
        return res.json({ success: true, isRegistered: true, user: safeUser(existingUser) });
      }

      res.cookie('signup', jwt.sign({ email: cleanEmail, purpose: 'signup' }, JWT_SECRET, { expiresIn: '30m' }), SIGNUP_COOKIE);
      return res.json({
        success: true,
        isRegistered: false,
        email: cleanEmail,
        message: 'Código verificado. Completa el registro de tu empresa.'
      });
    } catch (error: any) {
      console.error('[verify-otp]', error);
      res.status(500).json({ success: false, error: 'Error al verificar el código' });
    }
  });

  app.patch('/api/orders/:id/cancel', requireAuth, async (req: any, res) => {
    try {
      const orden = await prisma.orden.findUnique({ where: { ordenId: req.params.id } });
      if (!orden || orden.usuarioId !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
      }
      const estadosCancelables = ['confirmado', 'en_alistamiento'];
      if (!estadosCancelables.includes(orden.estado)) {
        return res.status(400).json({ success: false, error: 'Este pedido ya fue despachado y no se puede cancelar.' });
      }

      const updated = await prisma.orden.update({
        where: { ordenId: req.params.id },
        data: {
          estado: 'cancelado',
          historial: { create: { estado: 'cancelado', comentario: 'Cancelado por el cliente.', usuarioId: req.user.id } }
        }
      });

      res.json({ success: true, order: updated });
    } catch (error: any) {
      console.error('[cancel-order]', error);
      res.status(400).json({ success: false, error: 'No se pudo cancelar el pedido' });
    }
  });

  // 3. Registro (siempre como rol "cliente")
  app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
      const v = validateSignupFields(req.body, { requirePassword: true });
      if ('error' in v) return res.status(400).json({ success: false, error: v.error });
      const { nombre, apellido, correo, tipoPersona, documento, empresa, direccion, ciudad, celular } = v;

      // Solo se registra un correo que ya fue verificado (código por correo o Google)
      let verificado: any = null;
      try { verificado = jwt.verify(req.cookies?.signup || '', JWT_SECRET); } catch { verificado = null; }
      if (!verificado || verificado.purpose !== 'signup' || verificado.email !== correo) {
        return res.status(403).json({ success: false, error: 'Primero verifica tu correo con el código que te enviamos o con Google.' });
      }
      const password = req.body.password;

      const cleanEmail = correo;

      const existing = await prisma.usuario.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Ya existe una cuenta con este correo' });
      }
      const docEnUso = await prisma.usuario.findFirst({ where: { documentId: documento } });
      if (docEnUso) {
        return res.status(409).json({ success: false, error: 'Ya existe una cuenta con ese número de documento' });
      }

      const rolCliente = await prisma.rol.findFirst({ where: { rol: 'cliente' } });
      if (!rolCliente) {
        return res.status(500).json({ success: false, error: 'Rol "cliente" no existe. Corre el seed primero (pnpm run db:seed).' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await prisma.usuario.create({
        data: {
          nombre,
          apellido,
          email: cleanEmail,
          telefono: celular,
          passwordHash,
          authProvider: 'credentials',
          rolId: rolCliente.rolId,
          company: tipoPersona === 'juridica' ? empresa : null,
          documentId: documento,
          address: direccion || null,
          city: ciudad || 'Medellín'
        },
        include: { rol: true }
      });

      const token = issueSessionToken(newUser);
      res.cookie('session', token, cookieOptions);

      res.clearCookie('signup');
      sendWelcomeEmail(newUser.email, newUser.nombre).catch(err => console.error('[welcome-email]', err));
      res.json({ success: true, user: safeUser(newUser), message: 'Registro completado con éxito' });
    } catch (error: any) {
      console.error('[register]', error);
      res.status(500).json({ success: false, error: 'Error al registrar' });
    }
  });

  // 4. Login con email + contraseña
  app.post('/api/auth/login-password', authLimiter, async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ success: false, error: 'Correo y contraseña requeridos' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const user = await prisma.usuario.findUnique({ where: { email: cleanEmail }, include: { rol: true } });

      if (!user) {
        return res.json({ success: false, notRegistered: true, email: cleanEmail, message: 'Correo no registrado' });
      }
      if (!user.passwordHash) {
        return res.status(400).json({ success: false, error: 'Esta cuenta no usa contraseña. Usa "Recibir código por e-mail" o el login social.' });
      }

      const matches = await bcrypt.compare(password, user.passwordHash);
      if (!matches) {
        return res.status(401).json({ success: false, error: 'Contraseña incorrecta' });
      }
      if (user.activo === false) {
        return res.status(403).json({ success: false, error: 'Tu cuenta está desactivada. Contacta al administrador.' });
      }

      const token = issueSessionToken(user);
      res.cookie('session', token, cookieOptions);

      res.json({ success: true, isRegistered: true, user: safeUser(user) });
    } catch (error: any) {
      console.error('[login-password]', error);
      res.status(500).json({ success: false, error: 'Error al iniciar sesión' });
    }
  });

  // 5. Generar URL de autorización OAuth
  app.get('/api/auth/oauth-url/:provider', (req, res) => {
    const provider = String(req.params.provider || '');
    const origin = String(req.query.origin || APP_URL);
    const redirectUri = `${origin}/auth/callback`;

    if (provider === 'google') {
      if (!process.env.GOOGLE_CLIENT_ID) {
        return res.status(400).json({ success: false, error: 'Google OAuth no está configurado' });
      }
      const params = new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile',
        state: 'google',
        access_type: 'online',
        prompt: 'select_account'
      });
      return res.json({ success: true, url: `https://accounts.google.com/o/oauth2/v2/auth?${params}` });
    }

    if (provider === 'microsoft') {
      if (!process.env.MICROSOFT_CLIENT_ID) {
        return res.status(400).json({ success: false, error: 'Microsoft OAuth no está configurado' });
      }
      const params = new URLSearchParams({
        client_id: process.env.MICROSOFT_CLIENT_ID,
        redirect_uri: redirectUri,
        response_type: 'code',
        scope: 'openid email profile User.Read',
        state: 'microsoft',
        response_mode: 'query'
      });
      return res.json({ success: true, url: `https://login.microsoftonline.com/common/oauth2/v2.0/authorize?${params}` });
    }

    res.status(400).json({ success: false, error: 'Proveedor no soportado' });
  });

  // Crea o recupera un usuario autenticado por Google/Microsoft, respetando su rol existente
  async function findOrCreateSocialUser(profile: { email: string; name: string; sub: string }, provider: 'google' | 'microsoft') {
    const cleanEmail = profile.email.trim().toLowerCase();
    let user = await prisma.usuario.findUnique({ where: { email: cleanEmail }, include: { rol: true } });

    if (user) return user; // ya existe: se respeta el rol asignado en la BD, sin importar el proveedor

    const rolCliente = await prisma.rol.findFirst({ where: { rol: 'cliente' } });
    const [nombre, ...apellidoParts] = (profile.name || cleanEmail.split('@')[0]).split(' ');

    user = await prisma.usuario.create({
      data: {
        nombre: nombre || 'Usuario',
        apellido: apellidoParts.join(' ') || '',
        email: cleanEmail,
        authProvider: provider,
        providerId: profile.sub,
        rolId: rolCliente!.rolId
      },
      include: { rol: true }
    });

    return user;
  }

  // 6. Callback de OAuth
  app.get(['/auth/callback', '/auth/callback/'], async (req, res) => {
    const { code, state } = req.query;
    const provider = (state as string) === 'microsoft' ? 'microsoft' : 'google';

    if (!code) {
      return res.status(400).send(renderAuthResultPage(false, 'No se recibió código de autorización.'));
    }

    try {
      const redirectUri = `${APP_URL}/auth/callback`;
      let profile: { email: string; name: string; sub: string } | null = null;

      if (provider === 'google') {
        if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
          return res.status(400).send(renderAuthResultPage(false, 'Google OAuth no está configurado en el servidor.'));
        }
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: String(code),
            client_id: process.env.GOOGLE_CLIENT_ID,
            client_secret: process.env.GOOGLE_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });
        const tokens = await tokenRes.json();
        if (!tokens.access_token) throw new Error('No se obtuvo access_token de Google');

        const profileRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const g = await profileRes.json();
        profile = { email: g.email, name: g.name, sub: g.id };
      }

      if (provider === 'microsoft') {
        if (!process.env.MICROSOFT_CLIENT_ID || !process.env.MICROSOFT_CLIENT_SECRET) {
          return res.status(400).send(renderAuthResultPage(false, 'Microsoft OAuth no está configurado en el servidor.'));
        }
        const tokenRes = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            code: String(code),
            client_id: process.env.MICROSOFT_CLIENT_ID,
            client_secret: process.env.MICROSOFT_CLIENT_SECRET,
            redirect_uri: redirectUri,
            grant_type: 'authorization_code'
          })
        });
        const tokens = await tokenRes.json();
        if (!tokens.access_token) throw new Error('No se obtuvo access_token de Microsoft');

        const profileRes = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${tokens.access_token}` }
        });
        const m = await profileRes.json();
        profile = { email: m.mail || m.userPrincipalName, name: m.displayName, sub: m.id };
      }

      if (!profile?.email) throw new Error('No se pudo obtener el email del perfil');

      const user = await findOrCreateSocialUser(profile, provider);
      const token = issueSessionToken(user);
      res.cookie('session', token, cookieOptions);

      const needsProfile = !user.documentId; // le faltan sus datos (documento, celular...)
      return res.send(renderAuthResultPage(true, '', { ...safeUser(user), needsProfile }));
    } catch (e: any) {
      console.warn('[oauth-callback]', e.message);
      return res.status(400).send(renderAuthResultPage(false, 'No se pudo completar la autenticación. Intenta de nuevo.'));
    }
  });

  function renderAuthResultPage(success: boolean, errorMsg: string, user?: any) {
    return `<!DOCTYPE html><html><head><title>Autenticación</title>
    <style>body{font-family:sans-serif;background:#0b1528;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;text-align:center;}
    .card{background:#1e293b;padding:32px;border-radius:16px;border:1px solid #334155;max-width:360px;}</style>
    </head><body><div class="card">
    <h2>${success ? '✓ Autenticación exitosa' : '✗ Error de autenticación'}</h2>
    <p style="color:#94a3b8;font-size:13px;">${success ? 'Cerrando ventana...' : errorMsg}</p>
    </div><script>
    ${success
        ? `if (window.opener) { window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${jsonParaScript(user)} }, window.location.origin); setTimeout(() => window.close(), 250); }`
        : `if (window.opener) { window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${jsonParaScript(errorMsg)} }, window.location.origin); setTimeout(() => window.close(), 1500); }`
      }
    </script></body></html>`;
  }

  // 7. Sesión actual / logout
  app.get('/api/auth/me', requireAuth, (req: any, res) => {
    res.json({ success: true, user: req.user });
  });

  app.post('/api/auth/logout', (req, res) => {
    res.clearCookie('session');
    res.json({ success: true });
  });


  // 11. Ver / editar mi propio perfil
  app.get('/api/auth/profile', requireAuth, async (req: any, res) => {
    const user = await prisma.usuario.findUnique({ where: { usuarioId: req.user.id }, include: { rol: true } });
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    res.json({ success: true, user: safeUser(user) });
  });

  app.patch('/api/auth/profile', requireAuth, async (req: any, res) => {
    try {
      const { firstName, lastName, phone, avatarUrl } = req.body || {};
      const NOMBRE = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+( [A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*$/;
      const nombre = firstName != null ? String(firstName).trim().replace(/\s+/g, ' ') : undefined;
      const apellido = lastName != null ? String(lastName).trim().replace(/\s+/g, ' ') : undefined;
      if (nombre !== undefined && (nombre.length < 2 || nombre.length > 40 || !NOMBRE.test(nombre))) {
        return res.status(400).json({ success: false, error: 'El nombre debe tener solo letras (2 a 40).' });
      }
      if (apellido !== undefined && apellido !== '' && (apellido.length < 2 || apellido.length > 40 || !NOMBRE.test(apellido))) {
        return res.status(400).json({ success: false, error: 'El apellido debe tener solo letras (2 a 40).' });
      }
      let telefono: string | null | undefined = undefined;
      if (phone != null) {
        const digitos = String(phone).replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '');
        if (digitos === '') telefono = null;
        else if (/^3\d{9}$/.test(digitos) || /^60\d{8}$/.test(digitos)) telefono = String(phone).trim().slice(0, 20);
        else return res.status(400).json({ success: false, error: 'El celular debe tener 10 números y empezar por 3.' });
      }
      let avatar: string | null | undefined = undefined;
      if (avatarUrl != null) {
        const a = String(avatarUrl);
        if (a === '') avatar = null;
        else if (a.length > 4_500_000) return res.status(400).json({ success: false, error: 'La foto supera 3 MB.' });
        else if (!/^https:\/\/\S+$/.test(a) && !/^data:image\/(png|jpe?g|webp);base64,[A-Za-z0-9+/=]+$/.test(a)) {
          return res.status(400).json({ success: false, error: 'La foto no es válida (PNG, JPG o WEBP).' });
        } else avatar = a;
      }
      const updated = await prisma.usuario.update({
        where: { usuarioId: req.user.id },
        data: {
          nombre: nombre || undefined,
          apellido: apellido,
          telefono,
          avatarUrl: avatar
        },
        include: { rol: true }
      });
      res.json({ success: true, user: safeUser(updated) });
    } catch (error: any) {
      console.error('[patch-profile]', error);
      res.status(400).json({ success: false, error: 'No se pudo actualizar el perfil' });
    }
  });

  // Cambiar mi propia contraseña (exige la contraseña actual y cumple la política)
  app.post('/api/auth/change-password', authLimiter, requireAuth, async (req: any, res) => {
    try {
      const { currentPassword, newPassword } = req.body;
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ success: false, error: 'Escribe tu contraseña actual y la nueva.' });
      }
      const user = await prisma.usuario.findUnique({ where: { usuarioId: req.user.id } });
      if (!user || !user.passwordHash) {
        return res.status(400).json({ success: false, error: 'Esta cuenta no usa contraseña.' });
      }
      if (!(await bcrypt.compare(String(currentPassword), user.passwordHash))) {
        return res.status(400).json({ success: false, error: 'La contraseña actual no es correcta.' });
      }
      const policyError = validatePasswordPolicy(String(newPassword));
      if (policyError) return res.status(400).json({ success: false, error: policyError });
      if (String(newPassword) === String(currentPassword)) {
        return res.status(400).json({ success: false, error: 'La nueva contraseña debe ser distinta a la actual.' });
      }

      await prisma.usuario.update({
        where: { usuarioId: user.usuarioId },
        data: { passwordHash: await bcrypt.hash(String(newPassword), 10) }
      });
      res.json({ success: true, message: 'Contraseña actualizada.' });
    } catch (error: any) {
      console.error('[change-password]', error);
      res.status(500).json({ success: false, error: 'No se pudo cambiar la contraseña' });
    }
  });

  // 12. Estadísticas reales del dashboard, según el rol
  app.get('/api/dashboard/stats', requireAuth, async (req: any, res) => {
    try {
      const isStaff = STAFF_ROLES.includes(req.user.role);
      const whereClause = isStaff ? {} : { usuarioId: req.user.id };

      const proyectos = await prisma.proyecto.findMany({
        where: whereClause,
        include: { cotizaciones: true, diagnostico: true }
      });

      const totalProyectos = proyectos.length;
      const areaTotal = proyectos.reduce((sum, p) => sum + (p.area || 0), 0);
      const volumenCotizado = proyectos.reduce((sum, p) => {
        const ultimaCot = p.cotizaciones[p.cotizaciones.length - 1];
        return sum + (ultimaCot?.total || 0);
      }, 0);

      // Estadísticas específicas para el rol de calidad
      const conDictamen = proyectos.filter(p => p.diagnostico);
      const peritajesPendientes = proyectos.filter(p => !p.diagnostico || p.diagnostico.aprobadoCalidad == null).length;
      const certificadosEmitidos = conDictamen.filter(p => p.diagnostico?.aprobadoCalidad === true).length;
      const humedades = conDictamen.map(p => p.diagnostico?.humedadRelativa).filter((h): h is number => h != null);
      const humedadPromedio = humedades.length > 0 ? humedades.reduce((a, b) => a + b, 0) / humedades.length : 0;

      res.json({
        success: true,
        stats: {
          totalProyectos,
          areaTotal,
          volumenCotizado,
          peritajesPendientes,
          certificadosEmitidos,
          humedadPromedio: Math.round(humedadPromedio * 10) / 10
        }
      });
    } catch (error: any) {
      console.error('[dashboard-stats]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar las estadísticas' });
    }
  });

  // 8. Recuperar contraseña: solicitar código de restablecimiento

  // 9. Restablecer contraseña con el código recibido

  app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    try {
      const email = String(req.body.email || '').trim().toLowerCase();
      if (!email) {
        return res.status(400).json({ success: false, error: 'Escribe tu correo electrónico.' });
      }

      const user = await prisma.usuario.findUnique({ where: { email } });
      if (user) {
        const link = `${process.env.APP_URL || ''}/?reset_token=${makeResetToken(user)}`;
        sendPasswordResetEmail(user.email, user.nombre, link).catch(err => console.error('[reset-email]', err));
      }

      // Misma respuesta exista o no el correo, para no revelar qué correos tienen cuenta
      res.json({ success: true, message: 'Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña.' });
    } catch (error) {
      console.error('[forgot-password]', error);
      res.status(500).json({ success: false, error: 'No se pudo procesar la solicitud.' });
    }
  });

  app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    try {
      const { token, newPassword } = req.body;

      const policyError = validatePasswordPolicy(String(newPassword || ''));
      if (policyError) {
        return res.status(400).json({ success: false, error: policyError });
      }

      const invalidLink = { success: false, error: 'El enlace expiró o ya fue utilizado. Solicita uno nuevo.' };

      let payload: any;
      try {
        payload = jwt.verify(String(token), JWT_SECRET);
      } catch {
        return res.status(400).json(invalidLink);
      }
      if (payload.purpose !== 'password_reset') {
        return res.status(400).json(invalidLink);
      }

      const user = await prisma.usuario.findUnique({ where: { usuarioId: payload.uid } });
      if (!user || passwordFingerprint(user.passwordHash) !== payload.fp) {
        return res.status(400).json(invalidLink);
      }

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.usuario.update({ where: { usuarioId: user.usuarioId }, data: { passwordHash } });

      res.json({ success: true });
    } catch (error) {
      console.error('[reset-password]', error);
      res.status(500).json({ success: false, error: 'No se pudo restablecer la contraseña.' });
    }
  });

  // 8. Completar perfil (empresa) para un usuario ya autenticado (ej. tras login social)
  app.post('/api/auth/complete-profile', requireAuth, async (req: any, res) => {
    try {
      const actual = await prisma.usuario.findUnique({ where: { usuarioId: req.user.id } });
      if (!actual) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
      const v = validateSignupFields({ ...req.body, email: actual.email }, { requirePassword: false });
      if ('error' in v) return res.status(400).json({ success: false, error: v.error });

      const docEnUso = await prisma.usuario.findFirst({ where: { documentId: v.documento, NOT: { usuarioId: actual.usuarioId } } });
      if (docEnUso) return res.status(409).json({ success: false, error: 'Ya existe una cuenta con ese número de documento' });

      const data: any = {
        nombre: v.nombre,
        apellido: v.apellido,
        company: v.tipoPersona === 'juridica' ? v.empresa : null,
        documentId: v.documento,
        address: v.direccion || null,
        city: v.ciudad || 'Medellín',
        telefono: v.celular
      };
      if (req.body.password) data.passwordHash = await bcrypt.hash(String(req.body.password), 10);

      const updated = await prisma.usuario.update({ where: { usuarioId: actual.usuarioId }, data, include: { rol: true } });
      res.json({ success: true, user: safeUser(updated) });
    } catch (error: any) {
      console.error('[complete-profile]', error);
      res.status(500).json({ success: false, error: 'No se pudo actualizar el perfil' });
    }
  });

  // ================================================================
  // PROYECTOS DEL CLIENTE
  // ================================================================

  async function findOrCreateCiudad(nombre: string) {
    const clean = (nombre || 'Medellín').trim();
    let ciudad = await prisma.ciudad.findFirst({ where: { ciudad: clean } });
    if (!ciudad) ciudad = await prisma.ciudad.create({ data: { ciudad: clean } });
    return ciudad;
  }

  // Encuentra (o crea, la primera vez) la EmpresaCliente asociada al usuario,
  // usando los datos de empresa que ya tiene guardados en su perfil.
  async function findOrCreateEmpresaForUser(usuarioId: string, ciudadNombre: string) {
    const usuario = await prisma.usuario.findUnique({ where: { usuarioId } });
    if (!usuario?.documentId) {
      throw new Error('Completa tu número de documento en "Mi cuenta" antes de crear un proyecto.');
    }
    // Persona natural: el proyecto queda a su nombre; empresa: a su razón social
    const titular = usuario.company || `${usuario.nombre} ${usuario.apellido}`.trim();

    let empresa = await prisma.empresaCliente.findFirst({ where: { nitCedula: usuario.documentId } });
    if (empresa) return empresa;

    const ciudad = await findOrCreateCiudad(ciudadNombre || usuario.city || 'Medellín');
    empresa = await prisma.empresaCliente.create({
      data: {
        nitCedula: usuario.documentId,
        razonSocial: titular,
        direccionDespacho: usuario.address || '',
        ciudadId: ciudad.ciudadId
      }
    });
    return empresa;
  }

  // Valida una imagen enviada como data URI (png/jpg/webp, máx. 8 MB) y la deja lista para guardar
  function parseImageDataUri(raw: any): { dataUri: string; tamanoMb: number; ext: string } | null {
    if (typeof raw !== 'string' || raw.length > 11_500_000) return null;
    const m = raw.match(/^data:image\/(png|jpe?g|webp);base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return null;
    const bytes = Math.floor((m[2].length * 3) / 4);
    if (bytes > 8 * 1024 * 1024) return null;
    return { dataUri: raw, tamanoMb: Number((bytes / 1024 / 1024).toFixed(2)), ext: m[1] === 'jpeg' ? 'jpg' : m[1] };
  }

  async function sendImageChangeRequestEmail(email: string, nombreProyecto: string, proyectoId: string, motivo: string) {
    if (!process.env.SMTP_HOST) {
      console.warn(`[EMAIL] SMTP no configurado. Cambio de imagen solicitado para ${email}: ${motivo}`);
      return;
    }
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ColorLink" <no-reply@colorlink.com>',
      to: email,
      subject: `Necesitamos una nueva foto para tu proyecto "${nombreProyecto}"`,
      html: `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #f1f5f9;">
      <div style="background: #0A1A36; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <img src="${APP_URL}/brand/logo-on-dark.png" alt="ColorLink" height="34" style="display:block;height:34px;width:auto;border:0;" />
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px;">
        <span style="display:inline-block; background:#fee2e2; color:#991b1b; font-size:11px; font-weight:800; padding:4px 10px; border-radius:999px; text-transform:uppercase;">
          Acción requerida
        </span>
        <h2 style="color: #0A1A36; margin: 14px 0 6px;">${escapeHtml(nombreProyecto)}</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Revisamos tu proyecto (código <strong>#${proyectoId.slice(0, 8).toUpperCase()}</strong>) y necesitamos que cambies la imagen para poder continuar con la cotización.
        </p>
        <div style="background:#fef2f2; border-left:4px solid #ef4444; padding:12px 16px; border-radius:6px; margin:16px 0;">
          <p style="margin:0; color:#7f1d1d; font-size:13px;"><strong>Motivo:</strong> ${escapeHtml(motivo)}</p>
        </div>
        <a href="${process.env.APP_URL || ''}" style="display:inline-block; background:#F2C417; color:#14216B; font-weight:800; font-size:13px; padding:12px 24px; border-radius:10px; text-decoration:none; margin-top:8px;">
          Ingresar y subir nueva foto
        </a>
      </div>
    </div>`
    });
  }

  // Aviso por correo de un mensaje nuevo en la conversación del proyecto
  async function sendNewMessageEmail(email: string, d: { nombreProyecto: string; autor: string; texto: string; paraCliente: boolean; enlace: string }) {
    if (!process.env.SMTP_HOST) return;
    const proyecto = String(d.nombreProyecto).replace(/[\r\n]/g, ' ');
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ColorLink" <no-reply@colorlink.com>',
      to: email,
      subject: d.paraCliente ? `Tu asesor te escribió sobre "${proyecto}"` : `Nuevo mensaje del cliente en "${proyecto}"`,
      html: `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #f1f5f9;">
      <div style="background: #0A1A36; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <img src="${APP_URL}/brand/logo-on-dark.png" alt="ColorLink" height="34" style="display:block;height:34px;width:auto;border:0;" />
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px;">
        <p style="color:#64748b; font-size:12px; font-weight:700; text-transform:uppercase; margin:0 0 6px;">${escapeHtml(proyecto)}</p>
        <h2 style="color: #0A1A36; margin: 0 0 14px; font-size:18px;">${escapeHtml(d.autor)} te escribió</h2>
        <div style="background:#f8fafc; border-left:4px solid #F4C20D; padding:12px 14px; color:#334155; font-size:14px; line-height:1.6; white-space:pre-wrap;">${escapeHtml(d.texto)}</div>
        ${d.enlace ? `<p style="margin:22px 0 0;"><a href="${escapeHtml(d.enlace)}" style="background:#14216B; color:#fff; text-decoration:none; font-weight:700; font-size:13px; padding:10px 18px; border-radius:10px; display:inline-block;">Responder</a></p>` : ''}
        <p style="color:#94a3b8; font-size:12px; margin-top:22px;">Responde desde ${d.paraCliente ? 'tu proyecto en ColorLink' : 'el ERP de ColorLink'}; este correo no recibe respuestas.</p>
      </div>
    </div>`
    });
  }

  async function sendProjectCreatedEmail(email: string, nombreProyecto: string, proyectoId: string) {
    if (!process.env.SMTP_HOST) return;
    await transporter.sendMail({
      from: process.env.SMTP_FROM || '"ColorLink" <no-reply@colorlink.com>',
      to: email,
      subject: `Tu proyecto "${String(nombreProyecto).replace(/[\r\n]/g, ' ')}" fue recibido`,
      html: `
    <div style="font-family: -apple-system, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; background: #f1f5f9;">
      <div style="background: #0A1A36; padding: 24px 32px; border-radius: 12px 12px 0 0;">
        <img src="${APP_URL}/brand/logo-on-dark.png" alt="ColorLink" height="34" style="display:block;height:34px;width:auto;border:0;" />
      </div>
      <div style="background: #ffffff; padding: 32px; border-radius: 0 0 12px 12px;">
        <span style="display:inline-block; background:#fef3c7; color:#92400e; font-size:11px; font-weight:800; padding:4px 10px; border-radius:999px; text-transform:uppercase;">
          En revisión
        </span>
        <h2 style="color: #0A1A36; margin: 14px 0 6px;">${escapeHtml(nombreProyecto)}</h2>
        <p style="color: #475569; font-size: 14px; line-height: 1.6;">
          Recibimos tu proyecto (código <strong>#${proyectoId.slice(0, 8).toUpperCase()}</strong>) y ya está en revisión por nuestro equipo técnico. Te avisaremos por aquí cuando cambie de estado.
        </p>
      </div>
    </div>`
    });
  }

  // Lista los proyectos del usuario autenticado
  app.get('/api/projects', requireAuth, async (req: any, res) => {
    try {
      const proyectos = await prisma.proyecto.findMany({
        where: { usuarioId: req.user.id },
        include: {
          evidencias: { select: { evidenciaId: true, nombreArchivo: true, fechaRegistro: true }, orderBy: { fechaRegistro: 'desc' } },
          diagnostico: true,
          cotizaciones: { orderBy: { createdAt: 'desc' }, include: { items: { include: { producto: { select: { nombre: true, presentacion: true } } } } } },
          despacho: true,
          empresa: { include: { ciudad: true } },
          historial: { orderBy: { fecha: 'desc' } },
          asesorAsignado: { select: { nombre: true, apellido: true, email: true, telefono: true, avatarUrl: true } },
          _count: { select: { mensajes: { where: { leidoCliente: false, autorRol: { not: 'cliente' } } } } }
        },
        orderBy: { updatedAt: 'desc' }
      });
      // Al cliente no se le envían las notas internas del equipo, solo un texto pensado para él
      const projects = proyectos.map(({ _count, historial, ...p }) => ({
        ...p,
        mensajesSinLeer: _count.mensajes,
        historial: historial.map(h => ({
          id: h.id, estadoAnterior: h.estadoAnterior, estadoNuevo: h.estadoNuevo, fecha: h.fecha,
          comentario: textoHistorialCliente(h, p.nombreProyecto).detalle
        }))
      }));
      res.json({ success: true, projects });
    } catch (error: any) {
      console.error('[get-projects]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar los proyectos' });
    }
  });

  // Crea un proyecto nuevo (y opcionalmente su cotización y diagnóstico de IA) para el usuario autenticado
  app.post('/api/projects', requireAuth, async (req: any, res) => {
    try {
      const {
        nombreProyecto, ciudad, area, tipoSuperficie, ambiente, color, colorHex,
        cunetes5g, galones1g, subtotal, iva, total,
        // Campos opcionales del diagnóstico de IA (Gemini), si el wizard completo lo generó
        diagnosticoPatologia, severidad, sistemaRecomendado, manoRecomendada,
        rendimientoEstimado, confianzaIaPct, requiereVisitaHumana,
        imageBase64
      } = req.body;

      if (!nombreProyecto) {
        return res.status(400).json({ success: false, error: 'El nombre del proyecto es requerido' });
      }

      let foto: ReturnType<typeof parseImageDataUri> = null;
      if (imageBase64) {
        foto = parseImageDataUri(imageBase64);
        if (!foto) {
          return res.status(400).json({ success: false, error: 'La imagen debe ser PNG, JPG o WEBP de máximo 8 MB.' });
        }
      }

      const empresa = await findOrCreateEmpresaForUser(req.user.id, ciudad);
      const actor = await actorSnapshot(req.user);

      const tieneDiagnostico = diagnosticoPatologia != null;

      const proyecto = await prisma.proyecto.create({
        data: {
          usuarioId: req.user.id,
          empresaId: empresa.empresaId,
          nombreProyecto,
          area: area ? Number(area) : null,
          tipoSuperficie: tipoSuperficie || null,
          ambiente: ambiente || null,
          color: color || null,
          colorHex: colorHex || null,
          canalOrigen: 'web_portal',
          estadoPipeline: 'en_revision',
          evidencias: foto ? {
            create: { urlAlmacenado: foto.dataUri, nombreArchivo: `foto-proyecto.${foto.ext}`, tamanoMb: foto.tamanoMb }
          } : undefined,
          historial: {
            create: {
              estadoAnterior: null,
              estadoNuevo: 'en_revision',
              comentario: foto ? 'Proyecto registrado por el cliente con imagen adjunta.' : 'Proyecto registrado por el cliente.',
              ...actor
            }
          },
          cotizaciones: (cunetes5g != null || total != null) ? {
            create: {
              galonesExactos: null,
              cunetes5g: cunetes5g ? Number(cunetes5g) : null,
              galones1g: galones1g ? Number(galones1g) : null,
              subtotal: subtotal ? Number(subtotal) : null,
              iva: iva ? Number(iva) : null,
              total: total ? Number(total) : null,
              estado: 'Cotizado / Listo para Despacho'
            }
          } : undefined,
          diagnostico: tieneDiagnostico ? {
            create: {
              patologiaDetectada: diagnosticoPatologia || null,
              severidad: severidad || null,
              sistemaRecomendado: sistemaRecomendado ? JSON.stringify(sistemaRecomendado) : null,
              manoRecomendada: manoRecomendada != null ? String(manoRecomendada) : null,
              rendimientoEstimado: rendimientoEstimado != null ? Number(rendimientoEstimado) : null,
              confianzaIaPct: confianzaIaPct != null ? Number(confianzaIaPct) : null,
              requiereVisitaHumana: Boolean(requiereVisitaHumana)
            }
          } : undefined
        },
        include: { cotizaciones: true, diagnostico: true }
      });

      sendProjectCreatedEmail(req.user.email, proyecto.nombreProyecto, proyecto.proyectoId).catch(err => console.error('[project-email]', err));

      res.json({ success: true, project: proyecto });
    } catch (error: any) {
      console.error('[create-project]', error);
      res.status(400).json({ success: false, error: error.message || 'No se pudo crear el proyecto' });
    }
  });

  // Lista TODOS los proyectos de TODOS los clientes (solo asesor/calidad/administrador)
  app.get('/api/projects/all', requireAuth, requireRole('asesor', 'calidad', 'administrador'), async (req: any, res) => {
    try {
      const proyectos = await prisma.proyecto.findMany({
        include: PROYECTO_STAFF_INCLUDE,
        orderBy: { updatedAt: 'desc' }
      });
      res.json({ success: true, projects: proyectos });
    } catch (error: any) {
      console.error('[get-all-projects]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar los proyectos' });
    }
  });

  // Ajustes comerciales de un asesor sobre un proyecto (área, acabado, descuento, notas, estado)
  // Acceso libre: cualquier asesor puede editar cualquier proyecto; el primero que lo toca queda auto-asignado.
  app.patch('/api/projects/:id', requireAuth, requireRole('asesor', 'administrador'), async (req: any, res) => {
    try {
      const { area, acabado, descuentoAsesorPct, observacionesAsesor, estadoPipeline, comentario: nota } = req.body;
      if (area != null && (!Number.isFinite(Number(area)) || Number(area) <= 0 || Number(area) > MAX_AREA_M2)) {
        return res.status(400).json({ success: false, error: 'El área debe ser mayor a 0 y máximo 100.000 m².' });
      }
      if (descuentoAsesorPct != null && (!Number.isFinite(Number(descuentoAsesorPct)) || Number(descuentoAsesorPct) < 0 || Number(descuentoAsesorPct) > MAX_DESCUENTO_ASESOR)) {
        return res.status(400).json({ success: false, error: `El descuento debe estar entre 0 y ${MAX_DESCUENTO_ASESOR} %.` });
      }
      if (nota != null && String(nota).length > 500) return res.status(400).json({ success: false, error: 'La nota puede tener máximo 500 caracteres.' });
      if (observacionesAsesor != null && String(observacionesAsesor).length > 1000) return res.status(400).json({ success: false, error: 'Las observaciones pueden tener máximo 1000 caracteres.' });

      if (estadoPipeline) {
        if (!ESTADOS_PROYECTO.includes(estadoPipeline)) {
          return res.status(400).json({ success: false, error: `Estado inválido. Usa uno de: ${ESTADOS_PROYECTO.join(', ')}` });
        }
        if (req.user.role !== 'administrador' && !ESTADOS_EDITABLES_ASESOR.includes(estadoPipeline)) {
          return res.status(403).json({ success: false, error: 'Ese estado lo define Calidad o Despachos, no el asesor.' });
        }
      }

      const proyectoActual = await prisma.proyecto.findUnique({ where: { proyectoId: req.params.id } });
      if (!proyectoActual) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      if (['despachado', 'cancelado'].includes(proyectoActual.estadoPipeline || '')) {
        return res.status(400).json({ success: false, error: 'Este proyecto ya está cerrado y no se puede modificar.' });
      }

      // Auto-asignación (reclamo): si nadie lo ha tomado todavía y quien edita es un asesor, queda asignado a él.
      const asesorAsignadoIdFinal = proyectoActual.asesorAsignadoId
        || (req.user.role === 'asesor' ? req.user.id : proyectoActual.asesorAsignadoId);

      const cambios: string[] = [];
      if (area != null) cambios.push(`área ${Number(area)} m²`);
      if (acabado) cambios.push(`acabado ${acabado}`);
      if (descuentoAsesorPct != null) cambios.push(`descuento ${Number(descuentoAsesorPct)}%`);
      if (observacionesAsesor != null) cambios.push('observaciones del asesor');
      const cambiaEstado = !!estadoPipeline && estadoPipeline !== proyectoActual.estadoPipeline;
      const comentario = [
        cambiaEstado ? `Cambio de estado a ${estadoPipeline}` : null,
        cambios.length ? `Ajustes: ${cambios.join(', ')}` : null,
        nota ? String(nota).trim() : null
      ].filter(Boolean).join('. ');
      const actor = await actorSnapshot(req.user);

      const updated = await prisma.proyecto.update({
        where: { proyectoId: req.params.id },
        data: {
          area: area != null ? Number(area) : undefined,
          acabado: acabado || undefined,
          descuentoAsesorPct: descuentoAsesorPct != null ? Number(descuentoAsesorPct) : undefined,
          observacionesAsesor: observacionesAsesor ?? undefined,
          estadoPipeline: estadoPipeline || undefined,
          asesorAsignadoId: asesorAsignadoIdFinal,
          historial: comentario ? {
            create: {
              estadoAnterior: proyectoActual.estadoPipeline,
              estadoNuevo: estadoPipeline || proyectoActual.estadoPipeline || 'en_revision',
              comentario,
              ...actor
            }
          } : undefined
        },
        include: PROYECTO_STAFF_INCLUDE
      });

      res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('[patch-project]', error);
      res.status(400).json({ success: false, error: 'No se pudo actualizar el proyecto' });
    }
  });

  // Reasignar/escalar un proyecto a otro asesor o responsable de calidad con más experiencia en el tema
  app.patch('/api/projects/:id/reassign', requireAuth, requireRole('asesor', 'calidad', 'administrador'), async (req: any, res) => {
    try {
      const { role, nuevoUsuarioId, motivo } = req.body; // role: 'asesor' | 'calidad'
      if (!['asesor', 'calidad'].includes(role) || !nuevoUsuarioId) {
        return res.status(400).json({ success: false, error: 'Datos de reasignación inválidos' });
      }

      const nuevoUsuario = await prisma.usuario.findUnique({ where: { usuarioId: nuevoUsuarioId }, include: { rol: true } });
      if (!nuevoUsuario || nuevoUsuario.rol.rol !== role || nuevoUsuario.activo === false) {
        return res.status(400).json({ success: false, error: `El usuario indicado no es un "${role}" activo` });
      }

      const proyectoActual = await prisma.proyecto.findUnique({ where: { proyectoId: req.params.id } });
      if (!proyectoActual) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      if (['despachado', 'cancelado'].includes(proyectoActual.estadoPipeline || '')) {
        return res.status(400).json({ success: false, error: 'Este proyecto ya está cerrado.' });
      }

      // Escalar a calidad pone el proyecto en peritaje (salvo que ya esté aprobado)
      const pasaAPeritaje = role === 'calidad'
        && ['en_revision', 'cotizado', 'en_peritaje', 'rechazado'].includes(proyectoActual.estadoPipeline || '');
      const estadoNuevo = pasaAPeritaje ? 'en_peritaje' : (proyectoActual.estadoPipeline || 'en_revision');
      const actor = await actorSnapshot(req.user);
      const quien = `${nuevoUsuario.nombre} ${nuevoUsuario.apellido || ''}`.trim();
      const comentario = `${role === 'asesor' ? 'Escalado a asesor' : 'Enviado a peritaje con'} ${quien}.${motivo ? ' Motivo: ' + String(motivo).trim() : ''}`;

      const updated = await prisma.proyecto.update({
        where: { proyectoId: req.params.id },
        data: {
          ...(role === 'asesor' ? { asesorAsignadoId: nuevoUsuarioId } : { peritoAsignadoId: nuevoUsuarioId }),
          estadoPipeline: estadoNuevo,
          historial: { create: { estadoAnterior: proyectoActual.estadoPipeline, estadoNuevo, comentario, ...actor } }
        },
        include: PROYECTO_STAFF_INCLUDE
      });

      res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('[reassign-project]', error);
      res.status(400).json({ success: false, error: 'No se pudo reasignar el proyecto' });
    }
  });

  // Lista usuarios por rol (para poblar el selector de reasignación/escalamiento) — solo staff interno
  app.get('/api/users', requireAuth, requireRole('asesor', 'calidad', 'administrador'), async (req, res) => {
    try {
      const rolFiltro = String(req.query.role || '');
      const usuarios = await prisma.usuario.findMany({
        where: rolFiltro ? { rol: { rol: rolFiltro } } : undefined,
        select: { usuarioId: true, nombre: true, apellido: true, email: true, activo: true, avatarUrl: true, rol: { select: { rol: true } } }
      });
      res.json({ success: true, users: usuarios });
    } catch (error: any) {
      console.error('[get-users]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar los usuarios' });
    }
  });

  // ----------------------------------------------------------------
  // MENSAJES DEL PROYECTO (cliente <-> asesor / equipo ColorLink)
  // ----------------------------------------------------------------

  const messageLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false,
    message: { success: false, error: 'Estás enviando mensajes muy rápido. Espera un momento.' } });

  /** Devuelve el proyecto si quien pide es el cliente dueño o alguien del equipo; si no, null. */
  async function proyectoParaConversacion(proyectoId: string, user: any) {
    const proyecto = await prisma.proyecto.findUnique({
      where: { proyectoId },
      select: {
        proyectoId: true, usuarioId: true, nombreProyecto: true, asesorAsignadoId: true,
        usuario: { select: { email: true, nombre: true } },
        asesorAsignado: { select: { usuarioId: true, nombre: true, apellido: true, email: true, telefono: true, avatarUrl: true } }
      }
    });
    if (!proyecto) return null;
    const esDueno = proyecto.usuarioId === user.id;
    const esEquipo = STAFF_ROLES.includes(user.role);
    if (!esDueno && !esEquipo) return null;
    return { proyecto, esDueno };
  }

  app.get('/api/projects/:id/messages', requireAuth, async (req: any, res) => {
    try {
      const acceso = await proyectoParaConversacion(req.params.id, req.user);
      if (!acceso) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      const { proyecto, esDueno } = acceso;

      // Quien abre la conversación deja leídos los mensajes de la otra parte
      if (esDueno) {
        await prisma.mensajeProyecto.updateMany({ where: { proyectoId: proyecto.proyectoId, leidoCliente: false, autorRol: { not: 'cliente' } }, data: { leidoCliente: true } });
      } else {
        await prisma.mensajeProyecto.updateMany({ where: { proyectoId: proyecto.proyectoId, leidoEquipo: false, autorRol: 'cliente' }, data: { leidoEquipo: true } });
      }

      const mensajes = await prisma.mensajeProyecto.findMany({
        where: { proyectoId: proyecto.proyectoId },
        orderBy: { createdAt: 'asc' },
        take: 300,
        select: { mensajeId: true, autorId: true, autorNombre: true, autorRol: true, texto: true, createdAt: true, leidoCliente: true, leidoEquipo: true }
      });
      res.json({ success: true, messages: mensajes, asesor: proyecto.asesorAsignado, proyecto: { proyectoId: proyecto.proyectoId, nombreProyecto: proyecto.nombreProyecto } });
    } catch (error: any) {
      console.error('[get-messages]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar los mensajes' });
    }
  });

  app.post('/api/projects/:id/messages', requireAuth, messageLimiter, async (req: any, res) => {
    try {
      const texto = String(req.body?.texto ?? '').replace(/\r\n/g, '\n').trim();
      if (!texto) return res.status(400).json({ success: false, error: 'Escribe un mensaje.' });
      if (texto.length > 1000) return res.status(400).json({ success: false, error: 'El mensaje puede tener máximo 1000 caracteres.' });

      const acceso = await proyectoParaConversacion(req.params.id, req.user);
      if (!acceso) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      const { proyecto, esDueno } = acceso;

      const actor = await actorSnapshot(req.user);
      const autorRol = esDueno ? 'cliente' : req.user.role;

      // Para no llenar el correo: solo se avisa si la otra parte no tenía mensajes sin leer de este autor en los últimos 15 min
      const reciente = await prisma.mensajeProyecto.findFirst({
        where: { proyectoId: proyecto.proyectoId, autorRol, createdAt: { gte: new Date(Date.now() - 15 * 60 * 1000) },
          ...(esDueno ? { leidoEquipo: false } : { leidoCliente: false }) },
        select: { mensajeId: true }
      });

      const mensaje = await prisma.mensajeProyecto.create({
        data: {
          proyectoId: proyecto.proyectoId,
          autorId: req.user.id,
          autorNombre: actor.usuarioNombre,
          autorRol,
          texto,
          // Lo que uno mismo escribe ya está leído por su lado
          leidoCliente: esDueno,
          leidoEquipo: !esDueno
        },
        select: { mensajeId: true, autorId: true, autorNombre: true, autorRol: true, texto: true, createdAt: true, leidoCliente: true, leidoEquipo: true }
      });

      if (!reciente) {
        const destino = esDueno ? proyecto.asesorAsignado?.email : proyecto.usuario?.email;
        if (destino) {
          sendNewMessageEmail(destino, {
            nombreProyecto: proyecto.nombreProyecto,
            autor: actor.usuarioNombre,
            texto,
            paraCliente: !esDueno,
            enlace: esDueno ? (process.env.ERP_URL || '') : APP_URL
          }).catch(err => console.error('[message-email]', err));
        }
      }

      res.json({ success: true, message: mensaje });
    } catch (error: any) {
      console.error('[post-message]', error);
      res.status(400).json({ success: false, error: 'No se pudo enviar el mensaje' });
    }
  });

  // ERP: proyectos con mensajes del cliente sin leer (el asesor ve los suyos y los que no tienen asesor)
  app.get('/api/messages/unread', requireAuth, requireRole(...STAFF_ROLES), async (req: any, res) => {
    try {
      const filtroProyecto = req.user.role === 'administrador' ? {}
        : req.user.role === 'calidad' ? { peritoAsignadoId: req.user.id }
        : req.user.role === 'asesor' ? { OR: [{ asesorAsignadoId: req.user.id }, { asesorAsignadoId: null }] }
        : {};
      const grupos = await prisma.mensajeProyecto.groupBy({
        by: ['proyectoId'],
        where: { autorRol: 'cliente', leidoEquipo: false, proyecto: filtroProyecto },
        _count: { _all: true },
        _max: { createdAt: true }
      });
      res.json({ success: true, unread: grupos.map(g => ({ proyectoId: g.proyectoId, sinLeer: g._count._all, ultimo: g._max.createdAt })) });
    } catch (error: any) {
      console.error('[unread-messages]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar los mensajes' });
    }
  });

  // ----------------------------------------------------------------
  // NOTIFICACIONES DEL CLIENTE (campana con contador)
  // Se arman a partir del historial real de sus proyectos, pedidos y mensajes del equipo.
  // ----------------------------------------------------------------

  app.get('/api/notifications', requireAuth, async (req: any, res) => {
    try {
      const yo = await prisma.usuario.findUnique({ where: { usuarioId: req.user.id }, select: { notificacionesVistasAt: true, createdAt: true } });
      if (!yo) return res.status(401).json({ success: false, error: 'Sesión inválida' });
      const desde = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000);
      // Primera vez: se cuenta solo la última semana para no mostrar un número enorme
      const vistasHasta = yo.notificacionesVistasAt || new Date(Math.max(yo.createdAt.getTime(), Date.now() - 7 * 24 * 60 * 60 * 1000));

      const [histProy, histOrden, mensajes] = await Promise.all([
        prisma.estadoProyectoHistorial.findMany({
          where: { fecha: { gte: desde }, proyecto: { usuarioId: req.user.id }, OR: [{ usuarioId: null }, { usuarioId: { not: req.user.id } }] },
          orderBy: { fecha: 'desc' }, take: 40,
          include: { proyecto: { select: { nombreProyecto: true } } }
        }),
        prisma.estadoOrdenHistorial.findMany({
          where: { fecha: { gte: desde }, orden: { usuarioId: req.user.id }, estado: { notIn: ['creado', 'confirmado'] }, OR: [{ usuarioId: null }, { usuarioId: { not: req.user.id } }] },
          orderBy: { fecha: 'desc' }, take: 40,
          include: { orden: { select: { ordenId: true, metodoEntrega: true } } }
        }),
        prisma.mensajeProyecto.findMany({
          where: { createdAt: { gte: desde }, proyecto: { usuarioId: req.user.id }, autorRol: { not: 'cliente' } },
          orderBy: { createdAt: 'desc' }, take: 40,
          include: { proyecto: { select: { nombreProyecto: true } } }
        })
      ]);

      const ESTADO_ORDEN_CLIENTE: Record<string, string> = {
        en_alistamiento: 'se está preparando en bodega', en_camino: 'va en camino', listo_recoger: 'está listo para retirar en la sucursal',
        entregado: 'fue entregado', cancelado: 'fue cancelado'
      };

      const items = [
        ...histProy.map(h => {
          const t = textoHistorialCliente(h, h.proyecto.nombreProyecto);
          return { id: `p-${h.id}`, tipo: 'proyecto', titulo: t.titulo, detalle: t.detalle, fecha: h.fecha, enlace: { tipo: 'proyecto', id: h.proyectoId } };
        }),
        ...histOrden.map(h => {
          const codigo = `CL-${h.orden.ordenId.slice(0, 8).toUpperCase()}`;
          const listo = h.estado === 'listo_recoger';
          return {
            id: `o-${h.id}`, tipo: 'pedido',
            titulo: listo ? 'Tu pedido está listo para retirar' : `Tu pedido ${ESTADO_ORDEN_CLIENTE[h.estado] || 'tuvo una actualización'}`,
            detalle: `Pedido ${codigo}${listo ? ' · presenta tu código de retiro en la sucursal' : ''}`,
            fecha: h.fecha, enlace: { tipo: 'pedido', id: h.orden.ordenId }
          };
        }),
        ...mensajes.map(m => ({
          id: `m-${m.mensajeId}`, tipo: 'mensaje',
          titulo: `Nuevo mensaje de ${m.autorNombre}`,
          detalle: `${m.proyecto.nombreProyecto}: ${m.texto.length > 90 ? m.texto.slice(0, 90) + '…' : m.texto}`,
          fecha: m.createdAt, enlace: { tipo: 'proyecto', id: m.proyectoId, abrirChat: true }
        }))
      ]
        .sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime())
        .slice(0, 40)
        .map(n => ({ ...n, leida: new Date(n.fecha).getTime() <= vistasHasta.getTime() }));

      res.json({ success: true, notifications: items, sinLeer: items.filter(n => !n.leida).length });
    } catch (error: any) {
      console.error('[notifications]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar las notificaciones' });
    }
  });

  app.post('/api/notifications/read', requireAuth, async (req: any, res) => {
    try {
      await prisma.usuario.update({ where: { usuarioId: req.user.id }, data: { notificacionesVistasAt: new Date() } });
      res.json({ success: true });
    } catch (error: any) {
      console.error('[notifications-read]', error);
      res.status(400).json({ success: false, error: 'No se pudieron marcar como leídas' });
    }
  });

  // ----------------------------------------------------------------
  // REVISIÓN DE IMAGEN DEL PROYECTO (asesor <-> cliente)
  // ----------------------------------------------------------------

  // El asesor o el perito piden al cliente cambiar la foto (no corresponde al proyecto, está borrosa, etc.)
  app.patch('/api/projects/:id/request-image-change', requireAuth, requireRole('asesor', 'calidad', 'administrador'), async (req: any, res) => {
    try {
      const motivo = String(req.body.motivo || '').trim();
      if (motivo.length < 5) {
        return res.status(400).json({ success: false, error: 'Escribe el motivo (mínimo 5 caracteres) para que el cliente sepa qué corregir.' });
      }

      const proyecto = await prisma.proyecto.findUnique({
        where: { proyectoId: req.params.id },
        include: { usuario: { select: { email: true } } }
      });
      if (!proyecto) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      if (['despachado', 'cancelado', 'aprobado_calidad'].includes(proyecto.estadoPipeline || '')) {
        return res.status(400).json({ success: false, error: 'Este proyecto ya avanzó y no admite cambio de imagen.' });
      }

      const actor = await actorSnapshot(req.user);
      const updated = await prisma.proyecto.update({
        where: { proyectoId: req.params.id },
        data: {
          estadoPipeline: 'imagen_por_corregir',
          observacionImagen: motivo,
          asesorAsignadoId: proyecto.asesorAsignadoId || (req.user.role === 'asesor' ? req.user.id : undefined),
          historial: {
            create: {
              estadoAnterior: proyecto.estadoPipeline,
              estadoNuevo: 'imagen_por_corregir',
              comentario: `Se pidió al cliente cambiar la imagen. Motivo: ${motivo}`,
              ...actor
            }
          }
        },
        include: PROYECTO_STAFF_INCLUDE
      });

      sendImageChangeRequestEmail(proyecto.usuario.email, proyecto.nombreProyecto, proyecto.proyectoId, motivo)
        .catch(err => console.error('[image-change-email]', err));

      res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('[request-image-change]', error);
      res.status(400).json({ success: false, error: 'No se pudo solicitar el cambio de imagen' });
    }
  });

  // Imagen más reciente del proyecto: la ve el dueño o cualquier empleado
  app.get('/api/projects/:id/evidence', requireAuth, async (req: any, res) => {
    try {
      const proyecto = await prisma.proyecto.findUnique({ where: { proyectoId: req.params.id }, select: { usuarioId: true } });
      const esStaff = STAFF_ROLES.includes(req.user.role);
      if (!proyecto || (!esStaff && proyecto.usuarioId !== req.user.id)) {
        return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      }
      const ev = await prisma.evidenciaFoto.findFirst({
        where: { proyectoId: req.params.id },
        orderBy: { fechaRegistro: 'desc' }
      });
      if (!ev) return res.status(404).json({ success: false, error: 'Este proyecto no tiene imagen.' });

      res.json({
        success: true,
        evidence: { evidenciaId: ev.evidenciaId, nombreArchivo: ev.nombreArchivo, fechaRegistro: ev.fechaRegistro, imageDataUri: ev.urlAlmacenado }
      });
    } catch (error: any) {
      console.error('[get-evidence]', error);
      res.status(500).json({ success: false, error: 'No se pudo cargar la imagen' });
    }
  });

  // El cliente sube la imagen corregida: el proyecto vuelve a "en revisión"
  app.patch('/api/projects/:id/image', requireAuth, async (req: any, res) => {
    try {
      const foto = parseImageDataUri(req.body.imageBase64);
      if (!foto) {
        return res.status(400).json({ success: false, error: 'La imagen debe ser PNG, JPG o WEBP de máximo 8 MB.' });
      }

      const proyecto = await prisma.proyecto.findUnique({ where: { proyectoId: req.params.id } });
      if (!proyecto || proyecto.usuarioId !== req.user.id) {
        return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      }
      if (proyecto.estadoPipeline !== 'imagen_por_corregir') {
        return res.status(400).json({ success: false, error: 'Este proyecto no tiene una solicitud de cambio de imagen pendiente.' });
      }

      const actor = await actorSnapshot(req.user);
      const updated = await prisma.proyecto.update({
        where: { proyectoId: req.params.id },
        data: {
          estadoPipeline: 'en_revision',
          observacionImagen: null,
          evidencias: { create: { urlAlmacenado: foto.dataUri, nombreArchivo: `foto-proyecto.${foto.ext}`, tamanoMb: foto.tamanoMb } },
          historial: {
            create: {
              estadoAnterior: 'imagen_por_corregir',
              estadoNuevo: 'en_revision',
              comentario: 'El cliente subió una nueva imagen.',
              ...actor
            }
          }
        },
        include: {
          evidencias: { select: { evidenciaId: true, nombreArchivo: true, fechaRegistro: true }, orderBy: { fechaRegistro: 'desc' } },
          diagnostico: true,
          cotizaciones: true,
          empresa: { include: { ciudad: true } },
          historial: { orderBy: { fecha: 'desc' } }
        }
      });

      res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('[replace-project-image]', error);
      res.status(400).json({ success: false, error: 'No se pudo actualizar la imagen' });
    }
  });

  // ----------------------------------------------------------------
  // EMPLEADOS (solo administrador)
  // ----------------------------------------------------------------
  const EMPLOYEE_SELECT = {
    usuarioId: true, nombre: true, apellido: true, email: true, telefono: true,
    activo: true, createdAt: true, documentId: true, company: true, city: true,
    rol: { select: { rol: true } }
  } as const;

  app.get('/api/admin/employees', requireAuth, requireRole('administrador'), async (_req, res) => {
    try {
      const empleados = await prisma.usuario.findMany({
        where: { rol: { rol: { in: STAFF_ROLES } } },
        select: EMPLOYEE_SELECT,
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, employees: empleados });
    } catch (error: any) {
      console.error('[list-employees]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar los empleados' });
    }
  });

  app.post('/api/admin/employees', requireAuth, requireRole('administrador'), async (req: any, res) => {
    try {
      const { email, nombre, apellido, telefono, rol, password, documentId, company, city } = req.body;
      if (!email || !nombre || !apellido || !rol || !password) {
        return res.status(400).json({ success: false, error: 'Correo, nombre, apellido, rol y contraseña temporal son requeridos' });
      }
      if (!STAFF_ROLES.includes(rol)) {
        return res.status(400).json({ success: false, error: `Rol inválido. Usa uno de: ${STAFF_ROLES.join(', ')}` });
      }
      const datosError = errorDatosEmpleado({ nombre, apellido, email, telefono, documentId }, false);
      if (datosError) return res.status(400).json({ success: false, error: datosError });
      const policyError = validatePasswordPolicy(String(password));
      if (policyError) return res.status(400).json({ success: false, error: policyError });

      const cleanEmail = String(email).trim().toLowerCase();
      if (await prisma.usuario.findUnique({ where: { email: cleanEmail } })) {
        return res.status(409).json({ success: false, error: 'Ya existe una cuenta con este correo' });
      }
      const rolRow = await prisma.rol.findFirst({ where: { rol } });
      if (!rolRow) {
        return res.status(500).json({ success: false, error: `El rol "${rol}" no existe en la base de datos. Corre las migraciones.` });
      }

      const empleado = await prisma.usuario.create({
        data: {
          email: cleanEmail,
          nombre: String(nombre).trim().replace(/\s+/g, ' '),
          apellido: String(apellido).trim().replace(/\s+/g, ' '),
          telefono: telefono ? String(telefono).trim().slice(0, 20) : null,
          documentId: documentId ? String(documentId).trim().toUpperCase().slice(0, 20) : null,
          company: company ? String(company).trim().slice(0, 100) : null,
          ...(city ? { city: String(city).trim().slice(0, 60) } : {}),
          rolId: rolRow.rolId,
          passwordHash: await bcrypt.hash(String(password), 10),
          authProvider: 'credentials'
        },
        select: EMPLOYEE_SELECT
      });

      res.json({ success: true, employee: empleado });
    } catch (error: any) {
      console.error('[create-employee]', error);
      res.status(400).json({ success: false, error: 'No se pudo crear el empleado' });
    }
  });

  app.patch('/api/admin/employees/:id', requireAuth, requireRole('administrador'), async (req: any, res) => {
    try {
      const { nombre, apellido, telefono, rol, activo, password } = req.body;
      const datosError = errorDatosEmpleado({ nombre, apellido, telefono }, true);
      if (datosError) return res.status(400).json({ success: false, error: datosError });
      if (activo !== undefined && typeof activo !== 'boolean') return res.status(400).json({ success: false, error: 'Estado inválido.' });

      const target = await prisma.usuario.findUnique({ where: { usuarioId: req.params.id }, include: { rol: true } });
      if (!target || !STAFF_ROLES.includes(target.rol.rol)) {
        return res.status(404).json({ success: false, error: 'Empleado no encontrado' });
      }

      const cambiaRol = rol !== undefined && rol !== target.rol.rol;
      const desactiva = activo === false;

      if (target.usuarioId === req.user.id && (cambiaRol || desactiva)) {
        return res.status(400).json({ success: false, error: 'No puedes cambiar tu propio rol ni desactivar tu propia cuenta.' });
      }
      // Siempre debe quedar al menos un administrador activo
      if (target.rol.rol === 'administrador' && (cambiaRol || desactiva)) {
        const otros = await prisma.usuario.count({
          where: { rol: { rol: 'administrador' }, activo: true, usuarioId: { not: target.usuarioId } }
        });
        if (otros === 0) {
          return res.status(400).json({ success: false, error: 'Debe quedar al menos un administrador activo.' });
        }
      }

      let rolId: number | undefined;
      if (cambiaRol) {
        if (!STAFF_ROLES.includes(rol)) {
          return res.status(400).json({ success: false, error: `Rol inválido. Usa uno de: ${STAFF_ROLES.join(', ')}` });
        }
        const rolRow = await prisma.rol.findFirst({ where: { rol } });
        if (!rolRow) return res.status(500).json({ success: false, error: `El rol "${rol}" no existe en la base de datos.` });
        rolId = rolRow.rolId;
      }

      let passwordHash: string | undefined;
      if (password) {
        const policyError = validatePasswordPolicy(String(password));
        if (policyError) return res.status(400).json({ success: false, error: policyError });
        passwordHash = await bcrypt.hash(String(password), 10);
      }

      const empleado = await prisma.usuario.update({
        where: { usuarioId: target.usuarioId },
        data: {
          nombre: nombre ? String(nombre).trim() : undefined,
          apellido: apellido ? String(apellido).trim() : undefined,
          telefono: telefono !== undefined ? (telefono ? String(telefono).trim() : null) : undefined,
          rolId,
          activo: typeof activo === 'boolean' ? activo : undefined,
          passwordHash
        },
        select: EMPLOYEE_SELECT
      });

      res.json({ success: true, employee: empleado });
    } catch (error: any) {
      console.error('[update-employee]', error);
      res.status(400).json({ success: false, error: 'No se pudo actualizar el empleado' });
    }
  });

  // Veredicto de calidad/laboratorio sobre un proyecto (crea o actualiza el DiagnosticoIA)
  // Acceso libre: cualquier miembro de calidad puede emitir veredicto; el primero que lo hace queda auto-asignado.
  app.put('/api/projects/:id/quality-verdict', requireAuth, requireRole('calidad', 'administrador'), async (req: any, res) => {
    try {
      const { humedadRelativa, severidadFisuras, notasPerito, aprobadoCalidad, sistemaRecomendado, patologiaDetectada } = req.body;

      const proyectoActual = await prisma.proyecto.findUnique({ where: { proyectoId: req.params.id } });
      if (!proyectoActual) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      if (['despachado', 'cancelado'].includes(proyectoActual.estadoPipeline || '')) {
        return res.status(400).json({ success: false, error: 'Este proyecto ya está cerrado.' });
      }

      const actor = await actorSnapshot(req.user);

      const verdict = await prisma.diagnosticoIA.upsert({
        where: { proyectoId: req.params.id },
        update: {
          humedadRelativa: humedadRelativa != null ? Number(humedadRelativa) : undefined,
          severidadFisuras: severidadFisuras || undefined,
          notasPerito: notasPerito || undefined,
          sistemaRecomendado: sistemaRecomendado ? String(sistemaRecomendado) : undefined,
          patologiaDetectada: patologiaDetectada ? String(patologiaDetectada).slice(0, 500) : undefined,
          aprobadoCalidad: aprobadoCalidad != null ? Boolean(aprobadoCalidad) : undefined,
          peritoNombre: actor.usuarioNombre,
          fechaVeredicto: new Date()
        },
        create: {
          proyectoId: req.params.id,
          humedadRelativa: humedadRelativa != null ? Number(humedadRelativa) : null,
          severidadFisuras: severidadFisuras || null,
          notasPerito: notasPerito || null,
          sistemaRecomendado: sistemaRecomendado ? String(sistemaRecomendado) : null,
          patologiaDetectada: patologiaDetectada ? String(patologiaDetectada).slice(0, 500) : null,
          aprobadoCalidad: aprobadoCalidad != null ? Boolean(aprobadoCalidad) : null,
          peritoNombre: actor.usuarioNombre,
          fechaVeredicto: new Date()
        }
      });

      // Auto-asignación (reclamo): si nadie de calidad lo ha tomado todavía, queda asignado a quien emite el veredicto
      const peritoAsignadoIdFinal = proyectoActual.peritoAsignadoId
        || (req.user.role === 'calidad' ? req.user.id : proyectoActual.peritoAsignadoId);

      const estadoNuevo = aprobadoCalidad === true ? 'aprobado_calidad'
        : aprobadoCalidad === false ? 'rechazado'
        : (proyectoActual.estadoPipeline || 'en_peritaje');
      const decision = aprobadoCalidad === true ? 'APROBADO' : aprobadoCalidad === false ? 'RECHAZADO' : 'Observaciones registradas';
      const comentario = `Veredicto de calidad: ${decision}. Humedad: ${humedadRelativa ?? 'N/A'}%. Fisuras: ${severidadFisuras || 'N/A'}.${notasPerito ? ' Notas: ' + notasPerito : ''}`;

      const project = await prisma.proyecto.update({
        where: { proyectoId: req.params.id },
        data: {
          peritoAsignadoId: peritoAsignadoIdFinal,
          estadoPipeline: estadoNuevo,
          historial: { create: { estadoAnterior: proyectoActual.estadoPipeline, estadoNuevo, comentario, ...actor } }
        },
        include: PROYECTO_STAFF_INCLUDE
      });

      res.json({ success: true, diagnostico: verdict, project });
    } catch (error: any) {
      console.error('[quality-verdict]', error);
      res.status(400).json({ success: false, error: 'No se pudo guardar el veredicto de calidad' });
    }
  });

  // Cotización técnica hecha por el asesor: el servidor calcula cuñetes/galones y precios con el catálogo real
  app.post('/api/projects/:id/quote', requireAuth, requireRole('asesor', 'administrador'), async (req: any, res) => {
    try {
      const { productoId, area, manos, descuentoPct } = req.body;

      const proyecto = await prisma.proyecto.findUnique({ where: { proyectoId: req.params.id } });
      if (!proyecto) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      if (['despachado', 'cancelado', 'aprobado_calidad'].includes(proyecto.estadoPipeline || '')) {
        return res.status(400).json({ success: false, error: 'Este proyecto ya avanzó y no admite una nueva cotización.' });
      }

      const areaNum = Number(area ?? proyecto.area);
      const manosNum = Number(manos ?? 2);
      const descNum = Number(descuentoPct ?? 0);
      if (!Number.isFinite(areaNum) || areaNum <= 0 || areaNum > MAX_AREA_M2) {
        return res.status(400).json({ success: false, error: 'El área debe ser mayor a 0 y máximo 100.000 m².' });
      }
      if (!Number.isInteger(manosNum) || manosNum < 1 || manosNum > 5) {
        return res.status(400).json({ success: false, error: 'El número de manos debe estar entre 1 y 5.' });
      }
      if (!Number.isFinite(descNum) || descNum < 0 || descNum > MAX_DESCUENTO_ASESOR) {
        return res.status(400).json({ success: false, error: `El descuento debe estar entre 0 y ${MAX_DESCUENTO_ASESOR} %.` });
      }

      const base = productoId ? await prisma.producto.findUnique({ where: { productoId } }) : null;
      if (!base) return res.status(404).json({ success: false, error: 'Selecciona un producto del catálogo.' });
      if (!base.rendimientoM2 || base.rendimientoM2 <= 0) {
        return res.status(400).json({ success: false, error: 'Este producto no tiene rendimiento (m²/galón) configurado; no se puede cotizar por área.' });
      }

      // Mismo producto en sus dos presentaciones (cuñete 5 gal y galón 1 gal)
      const familia = await prisma.producto.findMany({ where: { nombre: base.nombre } });
      const cuneteProd = familia.find(f => f.presentacion === 'cunete_5gal') || null;
      const galonProd = familia.find(f => f.presentacion === 'galon_1gal') || null;
      const precioGalon = galonProd?.precio ?? (cuneteProd?.precio ? cuneteProd.precio / 4.6 : base.precio);
      const precioCunete = cuneteProd?.precio ?? (galonProd?.precio ? galonProd.precio * 4.6 : base.precio);
      if (!precioGalon || !precioCunete) {
        return res.status(400).json({ success: false, error: 'Este producto no tiene precio configurado.' });
      }

      // 6% de desperdicio técnico en obra
      const galonesExactos = Number((((areaNum * manosNum) / base.rendimientoM2) * 1.06).toFixed(1));
      const cunetes5g = Math.floor(galonesExactos / 5);
      const residuo = galonesExactos - cunetes5g * 5;
      const galones1g = residuo > 0.0001 ? Math.ceil(residuo) : 0;

      const subtotalBruto = cunetes5g * precioCunete + galones1g * precioGalon;
      const subtotalConDescuento = subtotalBruto * (1 - descNum / 100);
      const iva = Math.round(subtotalConDescuento * 0.19);
      const total = Math.round(subtotalConDescuento + iva);

      const items: any[] = [];
      if (cunetes5g > 0) items.push({ productoId: cuneteProd?.productoId || base.productoId, cantidad: cunetes5g, precioUnitario: Math.round(precioCunete), total: Math.round(cunetes5g * precioCunete) });
      if (galones1g > 0) items.push({ productoId: galonProd?.productoId || base.productoId, cantidad: galones1g, precioUnitario: Math.round(precioGalon), total: Math.round(galones1g * precioGalon) });

      const pasaACotizado = proyecto.estadoPipeline === 'en_revision';
      const estadoNuevo = pasaACotizado ? 'cotizado' : (proyecto.estadoPipeline || 'en_revision');
      const actor = await actorSnapshot(req.user);

      const updated = await prisma.proyecto.update({
        where: { proyectoId: req.params.id },
        data: {
          area: areaNum,
          descuentoAsesorPct: descNum,
          estadoPipeline: estadoNuevo,
          asesorAsignadoId: proyecto.asesorAsignadoId || (req.user.role === 'asesor' ? req.user.id : undefined),
          cotizaciones: {
            create: {
              galonesExactos, cunetes5g, galones1g,
              subtotal: Math.round(subtotalConDescuento), iva, total,
              estado: 'Enviada',
              items: { create: items }
            }
          },
          historial: {
            create: {
              estadoAnterior: proyecto.estadoPipeline,
              estadoNuevo,
              comentario: `Cotización técnica: ${cunetes5g} cuñetes (5G) + ${galones1g} galones (1G) = ${galonesExactos} galones de ${base.nombre}. Descuento ${descNum}%. Total $${total.toLocaleString('es-CO')} COP.`,
              ...actor
            }
          }
        },
        include: PROYECTO_STAFF_INCLUDE
      });

      res.json({ success: true, project: updated, quote: updated.cotizaciones[0] });
    } catch (error: any) {
      console.error('[quote-project]', error);
      res.status(400).json({ success: false, error: 'No se pudo generar la cotización' });
    }
  });

  // Despacha a obra un proyecto aprobado por calidad y registra guía, vehículo y conductor (despachos / administrador)
  app.patch('/api/projects/:id/dispatch', requireAuth, requireRole('administrador', 'despachos'), async (req: any, res) => {
    try {
      const proyecto = await prisma.proyecto.findUnique({
        where: { proyectoId: req.params.id },
        include: { empresa: { include: { ciudad: true } } }
      });
      if (!proyecto) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      if (proyecto.estadoPipeline !== 'aprobado_calidad') {
        return res.status(400).json({ success: false, error: 'Solo se pueden despachar proyectos ya aprobados por calidad' });
      }

      const b = req.body || {};
      const txt = (v: any, max = 120) => (v == null || String(v).trim() === '' ? null : String(v).replace(/[\r\n]+/g, ' ').trim().slice(0, max));
      const malo = (error: string) => res.status(400).json({ success: false, error });
      const guiaTxt = txt(b.numeroGuia, 30);
      if (guiaTxt && !/^[A-Z0-9][A-Z0-9-]{2,28}[A-Z0-9]$/i.test(guiaTxt)) return malo('Número de guía no válido (4 a 30 letras, números o guiones).');
      const numeroGuia = guiaTxt || `CL-DSP-${Math.floor(100000 + Math.random() * 900000)}`;
      const horasTxt = txt(b.tiempoEstimadoHoras, 10);
      const horas = horasTxt != null ? Number(horasTxt) : null;
      if (horas != null && (!Number.isInteger(horas) || horas < 1 || horas > 240)) return malo('El tiempo estimado debe estar entre 1 y 240 horas.');
      const placa = txt(b.placaVehiculo, 10)?.toUpperCase().replace(/[\s-]/g, '') ?? null;
      if (placa && !/^[A-Z]{3}(\d{3}|\d{2}[A-Z])$/.test(placa)) return malo('Placa no válida (ABC123 o ABC12D).');
      const telConductor = txt(b.conductorTelefono, 20)?.replace(/\D/g, '').replace(/^57(?=3\d{9}$)/, '') ?? null;
      if (telConductor && !/^3\d{9}$/.test(telConductor)) return malo('El celular del conductor debe tener 10 números y empezar por 3.');
      const conductor = txt(b.conductorNombre, 60);
      if (conductor && !/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]{3,60}$/.test(conductor)) return malo('El nombre del conductor debe tener solo letras.');
      const direccion = txt(b.direccionEntrega) || proyecto.empresa?.direccionDespacho || null;
      const ciudad = txt(b.ciudadEntrega) || proyecto.empresa?.ciudad?.ciudad || null;
      const actor = await actorSnapshot(req.user);

      const updated = await prisma.proyecto.update({
        where: { proyectoId: req.params.id },
        data: {
          estadoPipeline: 'despachado',
          despacho: {
            create: {
              numeroGuia,
              transportador: txt(b.transportador),
              placaVehiculo: placa,
              conductorNombre: conductor,
              conductorTelefono: telConductor,
              bodegaOrigen: txt(b.bodegaOrigen),
              direccionEntrega: direccion,
              ciudadEntrega: ciudad,
              tiempoEstimadoHoras: Number.isFinite(horas as number) ? horas : null,
              despachadoPorId: req.user.id
            }
          },
          historial: {
            create: {
              estadoAnterior: 'aprobado_calidad',
              estadoNuevo: 'despachado',
              comentario: `Despachado con guía ${numeroGuia}${placa ? `, vehículo ${placa}` : ''}${txt(b.conductorNombre) ? `, conductor ${txt(b.conductorNombre)}` : ''}. Destino: ${direccion || 'sin dirección'}${ciudad ? ` (${ciudad})` : ''}.`,
              ...actor
            }
          }
        },
        include: PROYECTO_STAFF_INCLUDE
      });

      res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('[dispatch-project]', error);
      res.status(400).json({ success: false, error: 'No se pudo despachar el proyecto' });
    }
  });

  // Confirma que el material llegó a obra y quién lo recibió (despachos / administrador)
  app.patch('/api/projects/:id/delivery', requireAuth, requireRole('administrador', 'despachos'), async (req: any, res) => {
    try {
      const recibidoPor = String(req.body.recibidoPor || '').replace(/\s+/g, ' ').trim();
      const documentoRecibe = String(req.body.documentoRecibe || '').replace(/[.\s-]/g, '').trim();
      if (!recibidoPor) {
        return res.status(400).json({ success: false, error: 'Indica quién recibió el material en obra.' });
      }
      if (!/^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]{3,80}$/.test(recibidoPor)) {
        return res.status(400).json({ success: false, error: 'El nombre de quien recibe debe tener solo letras (3 a 80).' });
      }
      if (documentoRecibe && !/^\d{6,12}$/.test(documentoRecibe)) {
        return res.status(400).json({ success: false, error: 'El documento de quien recibe debe tener de 6 a 12 números.' });
      }

      const proyecto = await prisma.proyecto.findUnique({ where: { proyectoId: req.params.id }, include: { despacho: true } });
      if (!proyecto) return res.status(404).json({ success: false, error: 'Proyecto no encontrado' });
      if (proyecto.estadoPipeline !== 'despachado' || !proyecto.despacho) {
        return res.status(400).json({ success: false, error: 'Este proyecto todavía no ha sido despachado.' });
      }
      if (proyecto.despacho.fechaEntrega) {
        return res.status(400).json({ success: false, error: 'La entrega de este proyecto ya fue confirmada.' });
      }

      const actor = await actorSnapshot(req.user);
      const updated = await prisma.proyecto.update({
        where: { proyectoId: req.params.id },
        data: {
          despacho: { update: { recibidoPor, documentoRecibe: documentoRecibe || null, fechaEntrega: new Date() } },
          historial: {
            create: {
              estadoAnterior: 'despachado',
              estadoNuevo: 'despachado',
              comentario: `Entrega confirmada en obra. Recibió: ${recibidoPor}${documentoRecibe ? ` (doc. ${documentoRecibe})` : ''}.`,
              ...actor
            }
          }
        },
        include: PROYECTO_STAFF_INCLUDE
      });

      res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('[delivery-project]', error);
      res.status(400).json({ success: false, error: 'No se pudo confirmar la entrega' });
    }
  });

  // Tablero de despachos: proyectos listos para salir y los ya despachados (despachos / administrador)
  app.get('/api/projects/dispatch-board', requireAuth, requireRole('administrador', 'despachos'), async (_req, res) => {
    try {
      const proyectos = await prisma.proyecto.findMany({
        where: { estadoPipeline: { in: ['aprobado_calidad', 'despachado'] } },
        include: PROYECTO_STAFF_INCLUDE,
        orderBy: { updatedAt: 'asc' } // los que llevan más tiempo esperando, primero
      });
      res.json({ success: true, projects: proyectos });
    } catch (error: any) {
      console.error('[dispatch-board]', error);
      res.status(500).json({ success: false, error: 'No se pudo cargar el tablero de despachos' });
    }
  });

  // Lista los proyectos aprobados por calidad y listos para despacho (despachos / administrador)
  app.get('/api/projects/ready-to-dispatch', requireAuth, requireRole('administrador', 'despachos'), async (req, res) => {
    try {
      const proyectos = await prisma.proyecto.findMany({
        where: { estadoPipeline: 'aprobado_calidad' },
        include: PROYECTO_STAFF_INCLUDE,
        orderBy: { updatedAt: 'asc' }
      });
      res.json({ success: true, projects: proyectos });
    } catch (error: any) {
      console.error('[ready-to-dispatch]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar los proyectos listos para despacho' });
    }
  });

  // ================================================================
  // NEGOCIO (sin cambios de lógica, ahora protegido por sesión)
  // ================================================================

  // ================================================================
  // INVENTARIO REAL (PRODUCTOS + STOCK POR BODEGA)
  // ================================================================

  app.get('/api/inventory', requireAuth, async (req, res) => {
    try {
      const [productos, stock] = await Promise.all([
        prisma.producto.findMany({ orderBy: { nombre: 'asc' } }),
        prisma.inventarioProducto.findMany({
          include: { producto: true, ciudad: true },
          orderBy: { nombreBodega: 'asc' }
        })
      ]);
      res.json({ success: true, productos, stock });
    } catch (error: any) {
      console.error('[get-inventory]', error);
      res.status(500).json({ success: false, error: 'No se pudo cargar el inventario' });
    }
  });

  // Ajusta el stock de un lote: `delta` (suma/resta) o `cantidad` (valor absoluto, p. ej. tras un conteo físico)
  app.patch('/api/inventory/:id', requireAuth, requireRole('administrador'), async (req: any, res) => {
    try {
      const { delta, cantidad } = req.body;
      const current = await prisma.inventarioProducto.findUnique({ where: { inventarioId: req.params.id } });
      if (!current) return res.status(404).json({ success: false, error: 'Registro de inventario no encontrado' });

      let nuevaCantidad: number;
      if (cantidad != null && cantidad !== '') {
        nuevaCantidad = Math.max(0, Math.round(Number(cantidad)));
      } else if (delta != null && delta !== '') {
        nuevaCantidad = Math.max(0, (current.cantidadDisponible || 0) + Math.round(Number(delta)));
      } else {
        return res.status(400).json({ success: false, error: 'Envía "cantidad" (valor final) o "delta" (ajuste).' });
      }
      if (!Number.isFinite(nuevaCantidad)) {
        return res.status(400).json({ success: false, error: 'La cantidad no es válida.' });
      }

      const updated = await prisma.inventarioProducto.update({
        where: { inventarioId: req.params.id },
        data: { cantidadDisponible: nuevaCantidad },
        include: { producto: true, ciudad: true }
      });

      res.json({ success: true, item: updated });
    } catch (error: any) {
      console.error('[patch-inventory]', error);
      res.status(400).json({ success: false, error: 'No se pudo ajustar el stock' });
    }
  });

  // Registra una entrada de mercancía (nuevo lote en una bodega)
  app.post('/api/inventory', requireAuth, requireRole('administrador'), async (req: any, res) => {
    try {
      const { productoId, ciudadId, nombreBodega, numeroLote, cantidadDisponible, tiempoDespacho } = req.body;
      const cantidad = Math.round(Number(cantidadDisponible));
      if (!productoId || !ciudadId || !nombreBodega || !Number.isFinite(cantidad) || cantidad < 0) {
        return res.status(400).json({ success: false, error: 'Producto, ciudad, bodega y una cantidad válida son requeridos.' });
      }

      const [producto, ciudad] = await Promise.all([
        prisma.producto.findUnique({ where: { productoId } }),
        prisma.ciudad.findUnique({ where: { ciudadId: Number(ciudadId) } })
      ]);
      if (!producto) return res.status(404).json({ success: false, error: 'Producto no encontrado' });
      if (!ciudad) return res.status(404).json({ success: false, error: 'Ciudad no encontrada' });

      const item = await prisma.inventarioProducto.create({
        data: {
          productoId,
          ciudadId: ciudad.ciudadId,
          nombreBodega: String(nombreBodega).trim(),
          numeroLote: numeroLote ? String(numeroLote).trim() : `LT-${new Date().getFullYear()}-${Date.now().toString().slice(-5)}`,
          cantidadDisponible: cantidad,
          fechaTinturado: new Date(),
          tiempoDespacho: tiempoDespacho != null && tiempoDespacho !== '' ? Math.round(Number(tiempoDespacho)) : null
        },
        include: { producto: true, ciudad: true }
      });

      res.json({ success: true, item });
    } catch (error: any) {
      console.error('[create-inventory]', error);
      res.status(400).json({ success: false, error: 'No se pudo registrar la entrada de inventario' });
    }
  });

  // Ciudades con bodega (para los selectores del ERP)
  app.get('/api/cities', requireAuth, async (_req, res) => {
    try {
      const ciudades = await prisma.ciudad.findMany({ orderBy: { ciudad: 'asc' } });
      res.json({ success: true, cities: ciudades });
    } catch (error: any) {
      console.error('[get-cities]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar las ciudades' });
    }
  });

  // Catálogo de la tienda: adapta tus Producto reales al formato que esperan los componentes del storefront
  app.get('/api/store/products', async (req, res) => {
    try {
      const productos = await prisma.producto.findMany({
        include: { inventarios: true }
      });

      // Agrupa por nombre base (para que "Koraza Tech 5G" y "Koraza Tech 1G" aparezcan
      // como tamaños del mismo producto, en vez de como productos separados)
      const grupos: Record<string, any[]> = {};
      for (const p of productos) {
        const key = p.nombre;
        if (!grupos[key]) grupos[key] = [];
        grupos[key].push(p);
      }

      const storeProducts = Object.entries(grupos).map(([nombre, variantes]) => {
        const stockTotal = variantes.reduce((sum, v) =>
          sum + v.inventarios.reduce((s: number, inv: any) => s + (inv.cantidadDisponible || 0), 0), 0);

        return {
          id: variantes[0].productoId,
          name: nombre,
          category: variantes[0].categoria || 'general',
          description: `${nombre} — línea profesional ColorLink.`,
          images: [], // sin fotos reales todavía; el frontend debe manejar el caso vacío con un ícono
          inStock: stockTotal > 0,
          sizes: variantes.map(v => ({
            id: v.productoId,
            name: v.presentacion === 'cunete_5gal' ? 'Cuñete 5 Gal' : v.presentacion === 'galon_1gal' ? 'Galón 1 Gal' : (v.presentacion || 'Único'),
            price: v.precio || 0,
            stock: v.inventarios.reduce((s: number, inv: any) => s + (inv.cantidadDisponible || 0), 0)
          })),
          colors: [] // tu catálogo de pinturas no maneja variantes de color por SKU todavía
        };
      });

      res.json({ success: true, products: storeProducts });
    } catch (error: any) {
      console.error('[get-store-products]', error);
      res.status(500).json({ success: false, error: 'No se pudo cargar el catálogo' });
    }
  });

  // Verifica si hay stock suficiente para una cotización específica (cuñetes/galones requeridos)
  app.post('/api/inventory/check-availability', requireAuth, async (req, res) => {
    try {
      const { cunetes5gRequeridos, galones1gRequeridos, categoria } = req.body;

      const stockCunetes = await prisma.inventarioProducto.aggregate({
        _sum: { cantidadDisponible: true },
        where: { producto: { categoria: categoria || 'acabado_exterior', presentacion: 'cunete_5gal' } }
      });
      const stockGalones = await prisma.inventarioProducto.aggregate({
        _sum: { cantidadDisponible: true },
        where: { producto: { categoria: categoria || 'acabado_exterior', presentacion: 'galon_1gal' } }
      });

      const disponibleCunetes = stockCunetes._sum.cantidadDisponible || 0;
      const disponibleGalones = stockGalones._sum.cantidadDisponible || 0;

      const suficiente = disponibleCunetes >= (cunetes5gRequeridos || 0) && disponibleGalones >= (galones1gRequeridos || 0);

      res.json({
        success: true,
        suficiente,
        disponibleCunetes,
        disponibleGalones
      });
    } catch (error: any) {
      console.error('[check-availability]', error);
      res.status(500).json({ success: false, error: 'No se pudo verificar disponibilidad' });
    }
  });

  // ================================================================
  // ÓRDENES / E-COMMERCE (pago simulado, correo + WhatsApp por cambio de estado)
  // ================================================================

  // Crea una orden nueva a partir del carrito (el precio se recalcula del lado del servidor, nunca se confía en el que manda el navegador)
  app.post('/api/orders', requireAuth, async (req: any, res) => {
    try {
      const { items, metodoEntrega, direccionEntrega } = req.body;
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'El carrito está vacío' });
      }
      if (!['domicilio', 'recoger_tienda'].includes(metodoEntrega)) {
        return res.status(400).json({ success: false, error: 'Método de entrega inválido' });
      }

      if (items.length > 50) return res.status(400).json({ success: false, error: 'El pedido tiene demasiados productos.' });
      const direccion = String(direccionEntrega ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, 400);
      if (metodoEntrega === 'domicilio' && direccion.length < 5) {
        return res.status(400).json({ success: false, error: 'Escribe la dirección de entrega.' });
      }

      // El precio sale del catálogo de la tienda (nunca del navegador); la cantidad se valida
      const corto = (v: any, max: number) => (v == null || v === '' ? null : String(v).replace(/[\r\n]/g, ' ').trim().slice(0, max) || null);
      const itemsConPrecio: any[] = [];
      for (const i of items) {
        const producto = STORE_PRODUCTS.find(p => p.id === i.productId);
        if (!producto) return res.status(400).json({ success: false, error: `El producto "${String(i.name || '').slice(0, 60)}" ya no está disponible.` });
        const talla = producto.sizes.find(sz => sz.name === i.sizeName || sz.id === i.sizeId) || (producto.sizes.length === 1 ? producto.sizes[0] : undefined);
        if (!talla) return res.status(400).json({ success: false, error: `Elige una presentación válida para ${producto.name}.` });
        if (talla.inStock === false) return res.status(400).json({ success: false, error: `${producto.name} (${talla.name}) está agotado.` });
        const cantidad = Math.floor(Number(i.cantidad ?? i.quantity));
        if (!Number.isInteger(cantidad) || cantidad < 1 || cantidad > 99) {
          return res.status(400).json({ success: false, error: `Cantidad inválida para ${producto.name} (de 1 a 99).` });
        }
        const color = i.colorName ? producto.colors?.find(c => c.name === i.colorName) : undefined;
        if (i.colorName && !color) return res.status(400).json({ success: false, error: `El color elegido no existe para ${producto.name}.` });
        itemsConPrecio.push({
          productoId: null, // el catálogo de la tienda es independiente del catálogo B2B de cotizaciones
          codigoProductoExterno: producto.id,
          presentacion: corto(talla.name, 60),
          color: corto(color?.name, 60),
          nombreProducto: producto.name.slice(0, 120),
          cantidad,
          precioUnitario: talla.price,
          subtotal: talla.price * cantidad
        });
      }

      const subtotalProductos = itemsConPrecio.reduce((sum, i) => sum + i.subtotal, 0);
      // Envío a domicilio: gratis desde $150.000; recogida en tienda siempre gratis (igual que en el checkout)
      const costoEnvio = metodoEntrega === 'domicilio' && subtotalProductos < 150000 ? 15000 : 0;
      const total = subtotalProductos + costoEnvio;
      const direccionEntregaFinal = direccion || null;

      const orden = await prisma.orden.create({
        data: {
          usuarioId: req.user.id,
          total,
          estado: 'confirmado',
          metodoEntrega,
          direccionEntrega: direccionEntregaFinal,
          items: { create: itemsConPrecio },
          historial: { create: {
            estado: 'confirmado',
            comentario: `Pedido confirmado. Pago ${metodoEntrega === 'domicilio' ? 'contra entrega' : 'en la tienda'}${costoEnvio ? `; incluye envío $${costoEnvio.toLocaleString('es-CO')}` : ''}.`,
            usuarioId: req.user.id
          } }
        },
        include: { items: true }
      });

      await sendOrderStatusEmail(req.user.email, orden, 'confirmado');

      res.json({ success: true, order: orden });
    } catch (error: any) {
      console.error('[create-order]', error);
      res.status(400).json({ success: false, error: 'No se pudo crear el pedido. Intenta de nuevo.' });
    }
  });

  // Mis órdenes (cliente)
  app.get('/api/orders', requireAuth, async (req: any, res) => {
    try {
      const ordenes = await prisma.orden.findMany({
        where: { usuarioId: req.user.id },
        include: {
          items: { include: { producto: true, resena: { select: { resenaId: true, calificacion: true, comentario: true, fotoDataUri: true } } } },
          historial: { orderBy: { fecha: 'asc' } },
          evaluacion: { select: { calificacion: true, comentario: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      // La foto de la opinión no viaja en la lista: solo si existe (se ve en /api/reviews/:id/photo)
      const orders = ordenes.map(o => ({
        ...o,
        items: o.items.map(({ resena, ...it }) => ({
          ...it,
          resena: resena ? { resenaId: resena.resenaId, calificacion: resena.calificacion, comentario: resena.comentario, tieneFoto: !!resena.fotoDataUri } : null
        }))
      }));
      res.json({ success: true, orders });
    } catch (error: any) {
      console.error('[get-orders]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar tus pedidos' });
    }
  });

  // ----------------------------------------------------------------
  // OPINIONES DE PRODUCTO Y EVALUACIÓN DEL VENDEDOR
  // Solo quien compró y recibió el pedido puede opinar (compra verificada).
  // ----------------------------------------------------------------

  const reviewLimiter = rateLimit({ windowMs: 10 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false,
    message: { success: false, error: 'Demasiados intentos. Espera unos minutos.' } });

  const limpiarComentario = (v: any) => {
    const t = String(v ?? '').replace(/\r\n/g, '\n').trim();
    return t ? t.slice(0, 1500) : null;
  };
  const calificacionValida = (v: any) => Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 5;
  /** "Juan Manuel Olave" -> "Juan O." para mostrar en público sin exponer el nombre completo */
  const nombrePublico = (nombre?: string | null, apellido?: string | null) =>
    `${String(nombre || 'Cliente').split(' ')[0]}${apellido ? ` ${apellido.trim().charAt(0).toUpperCase()}.` : ''}`;

  // Público: opiniones visibles de un producto de la tienda
  app.get('/api/products/:key/reviews', async (req, res) => {
    try {
      const key = String(req.params.key).slice(0, 80);
      const [resenas, agrupado] = await Promise.all([
        prisma.resenaProducto.findMany({
          where: { productoKey: key, visible: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
          select: {
            resenaId: true, calificacion: true, comentario: true, createdAt: true, updatedAt: true,
            fotoDataUri: true,
            ordenItem: { select: { presentacion: true, color: true } },
            usuario: { select: { nombre: true, apellido: true, city: true } }
          }
        }),
        prisma.resenaProducto.groupBy({ by: ['calificacion'], where: { productoKey: key, visible: true }, _count: { _all: true } })
      ]);
      const distribucion: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      agrupado.forEach(g => { distribucion[g.calificacion] = g._count._all; });
      const total = Object.values(distribucion).reduce((a, b) => a + b, 0);
      const promedio = total ? Object.entries(distribucion).reduce((a, [k, n]) => a + Number(k) * n, 0) / total : 0;
      res.setHeader('Cache-Control', 'no-cache');
      res.json({
        success: true,
        promedio: Math.round(promedio * 10) / 10,
        total,
        distribucion,
        resenas: resenas.map(r => ({
          resenaId: r.resenaId,
          calificacion: r.calificacion,
          comentario: r.comentario,
          fecha: r.createdAt,
          editada: r.updatedAt.getTime() - r.createdAt.getTime() > 60_000,
          autor: nombrePublico(r.usuario.nombre, r.usuario.apellido),
          ciudad: r.usuario.city || null,
          presentacion: r.ordenItem?.presentacion || null,
          color: r.ordenItem?.color || null,
          tieneFoto: !!r.fotoDataUri
        }))
      });
    } catch (error: any) {
      console.error('[product-reviews]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar las opiniones' });
    }
  });

  // Foto de una opinión (pública si la opinión está visible; su autor siempre la puede ver)
  app.get('/api/reviews/:id/photo', async (req: any, res) => {
    try {
      const r = await prisma.resenaProducto.findUnique({ where: { resenaId: req.params.id }, select: { fotoDataUri: true, visible: true } });
      if (!r?.fotoDataUri || !r.visible) return res.status(404).end();
      const m = r.fotoDataUri.match(/^data:(image\/(?:png|jpe?g|webp));base64,(.+)$/);
      if (!m) return res.status(404).end();
      res.setHeader('Content-Type', m[1]);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      res.send(Buffer.from(m[2], 'base64'));
    } catch {
      res.status(404).end();
    }
  });

  /** Verifica que el pedido sea del usuario y esté entregado. */
  async function pedidoEntregadoDe(ordenId: string, usuarioId: string) {
    const orden = await prisma.orden.findUnique({ where: { ordenId }, include: { items: true } });
    if (!orden || orden.usuarioId !== usuarioId) return { error: 'Pedido no encontrado', status: 404 as const };
    if (orden.estado !== 'entregado') return { error: 'Podrás opinar cuando el pedido esté entregado.', status: 400 as const };
    return { orden };
  }

  // Crear o editar la opinión de un producto comprado
  app.put('/api/orders/:ordenId/items/:itemId/review', requireAuth, reviewLimiter, async (req: any, res) => {
    try {
      const { calificacion, comentario, imageBase64, quitarFoto, productoKey } = req.body || {};
      if (!calificacionValida(calificacion)) return res.status(400).json({ success: false, error: 'Elige una calificación de 1 a 5 estrellas.' });

      const r = await pedidoEntregadoDe(req.params.ordenId, req.user.id);
      if ('error' in r) return res.status(r.status).json({ success: false, error: r.error });
      const item = r.orden.items.find(i => i.ordenItemId === req.params.itemId);
      if (!item) return res.status(404).json({ success: false, error: 'Ese producto no está en el pedido.' });

      // El id del catálogo sale de la orden; los pedidos antiguos no lo guardaban y lo manda la tienda
      const key = item.codigoProductoExterno || (typeof productoKey === 'string' ? productoKey.trim().slice(0, 80) : '');
      if (!key) return res.status(400).json({ success: false, error: 'No se pudo identificar el producto.' });

      let foto: string | null | undefined = undefined;
      if (imageBase64) {
        const f = parseImageDataUri(imageBase64);
        if (!f || f.tamanoMb > 4) return res.status(400).json({ success: false, error: 'La foto debe ser PNG, JPG o WEBP de máximo 4 MB.' });
        foto = f.dataUri;
      } else if (quitarFoto) {
        foto = null;
      }

      const texto = limpiarComentario(comentario);
      const resena = await prisma.resenaProducto.upsert({
        where: { ordenItemId: item.ordenItemId },
        update: { calificacion: Number(calificacion), comentario: texto, ...(foto !== undefined ? { fotoDataUri: foto } : {}) },
        create: {
          productoKey: key,
          nombreProducto: item.nombreProducto,
          usuarioId: req.user.id,
          ordenId: r.orden.ordenId,
          ordenItemId: item.ordenItemId,
          calificacion: Number(calificacion),
          comentario: texto,
          fotoDataUri: foto ?? null
        },
        select: { resenaId: true, calificacion: true, comentario: true, fotoDataUri: true }
      });
      res.json({ success: true, review: { resenaId: resena.resenaId, calificacion: resena.calificacion, comentario: resena.comentario, tieneFoto: !!resena.fotoDataUri } });
    } catch (error: any) {
      console.error('[save-review]', error);
      res.status(400).json({ success: false, error: 'No se pudo guardar tu opinión' });
    }
  });

  // Evaluar al vendedor (el servicio de ColorLink en ese pedido)
  app.put('/api/orders/:ordenId/seller-rating', requireAuth, reviewLimiter, async (req: any, res) => {
    try {
      const { calificacion, comentario } = req.body || {};
      if (!calificacionValida(calificacion)) return res.status(400).json({ success: false, error: 'Elige una calificación de 1 a 5 estrellas.' });
      const r = await pedidoEntregadoDe(req.params.ordenId, req.user.id);
      if ('error' in r) return res.status(r.status).json({ success: false, error: r.error });
      const texto = limpiarComentario(comentario);
      const ev = await prisma.evaluacionVendedor.upsert({
        where: { ordenId: r.orden.ordenId },
        update: { calificacion: Number(calificacion), comentario: texto },
        create: { ordenId: r.orden.ordenId, usuarioId: req.user.id, calificacion: Number(calificacion), comentario: texto },
        select: { calificacion: true, comentario: true }
      });
      res.json({ success: true, evaluacion: ev });
    } catch (error: any) {
      console.error('[seller-rating]', error);
      res.status(400).json({ success: false, error: 'No se pudo guardar tu evaluación' });
    }
  });

  // Todas las órdenes (panel ERP): administrador y despachos operan; asesor solo consulta
  app.get('/api/orders/all', requireAuth, requireRole('administrador', 'despachos', 'asesor'), async (req, res) => {
    try {
      const ordenes = await prisma.orden.findMany({
        include: {
          items: { include: { producto: true } },
          historial: { orderBy: { fecha: 'asc' } },
          usuario: { select: { nombre: true, apellido: true, email: true, telefono: true, company: true, documentId: true } }
        },
        orderBy: { createdAt: 'desc' }
      });

      // Nombre y rol de quien hizo cada cambio de estado (para la línea de tiempo del ERP)
      const ids = Array.from(new Set(ordenes.flatMap(o => o.historial.map(h => h.usuarioId)).filter((x): x is string => !!x)));
      const actores = ids.length
        ? await prisma.usuario.findMany({
            where: { usuarioId: { in: ids } },
            select: { usuarioId: true, nombre: true, apellido: true, rol: { select: { rol: true } } }
          })
        : [];
      const mapa = new Map(actores.map(a => [a.usuarioId, { nombre: `${a.nombre} ${a.apellido || ''}`.trim(), rol: a.rol.rol }]));
      const conActores = ordenes.map(o => ({
        ...o,
        historial: o.historial.map(h => ({ ...h, actor: h.usuarioId ? (mapa.get(h.usuarioId) || null) : null }))
      }));

      res.json({ success: true, orders: conActores });
    } catch (error: any) {
      console.error('[get-all-orders]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar las órdenes' });
    }
  });

  // Cambia el estado de una orden: dispara correo + WhatsApp automáticamente
  app.patch('/api/orders/:id/status', requireAuth, requireRole('administrador', 'despachos'), async (req: any, res) => {
    try {
      const { estado, comentario } = req.body;
      const estadosValidos = ['creado', 'confirmado', 'en_alistamiento', 'en_camino', 'listo_recoger', 'entregado', 'cancelado'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({ success: false, error: 'Estado inválido' });
      }

      const actual = await prisma.orden.findUnique({ where: { ordenId: req.params.id } });
      if (!actual) return res.status(404).json({ success: false, error: 'Pedido no encontrado' });
      if (['entregado', 'cancelado'].includes(actual.estado)) {
        return res.status(400).json({ success: false, error: `Este pedido ya está ${actual.estado} y no admite más cambios.` });
      }
      if (estado === actual.estado) {
        return res.status(400).json({ success: false, error: 'El pedido ya tiene ese estado.' });
      }
      if (estado === 'listo_recoger' && actual.metodoEntrega !== 'recoger_tienda') {
        return res.status(400).json({ success: false, error: '"Listo para recoger" solo aplica a pedidos de retiro en sucursal.' });
      }
      if (estado === 'en_camino' && actual.metodoEntrega !== 'domicilio') {
        return res.status(400).json({ success: false, error: '"En camino" solo aplica a pedidos a domicilio.' });
      }

      const orden = await prisma.orden.update({
        where: { ordenId: req.params.id },
        data: {
          estado,
          historial: { create: { estado, comentario: comentario || null, usuarioId: req.user.id } }
        },
        // Solo los datos del cliente que hacen falta; nunca el usuario completo (trae el hash de la contraseña)
        include: {
          usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } },
          items: { include: { producto: true } }
        }
      });

      await sendOrderStatusEmail(orden.usuario.email, orden, estado);
      if (orden.usuario.telefono) {
        const estadoLabels: Record<string, string> = {
          confirmado: 'Pago confirmado', en_alistamiento: 'En alistamiento', en_camino: 'En camino',
          listo_recoger: 'Listo para recoger en tienda', entregado: 'Entregado', cancelado: 'Cancelado'
        };
        await sendWhatsAppMessage(orden.usuario.telefono, `📦 ColorLink: tu pedido #${orden.ordenId.slice(0, 8)} ahora está: ${estadoLabels[estado] || estado}.`);
      }

      res.json({ success: true, order: orden });
    } catch (error: any) {
      console.error('[update-order-status]', error);
      res.status(400).json({ success: false, error: 'No se pudo actualizar el estado de la orden' });
    }
  });

  app.post('/api/orders/validate-pickup', requireAuth, requireRole('administrador', 'despachos', 'asesor'), async (req: any, res) => {
    try {
      const code = String(req.body.code || '').trim();
      if (!code) {
        return res.status(400).json({ success: false, error: 'Escribe o escanea el código de retiro.' });
      }

      let orden: any = null;
      if (code.length === 8) {
        const matches = await prisma.orden.findMany({
          where: { qrToken: { startsWith: code.toLowerCase() } },
          include: { items: true, usuario: { select: { nombre: true, apellido: true, email: true } } }
        });
        orden = matches.length === 1 ? matches[0] : null;
      } else {
        orden = await prisma.orden.findUnique({
          where: { qrToken: code },
          include: { items: true, usuario: { select: { nombre: true, apellido: true, email: true } } }
        });
      }

      if (!orden) {
        return res.status(404).json({ success: false, error: 'Código no encontrado.' });
      }
      if (orden.metodoEntrega !== 'recoger_tienda') {
        return res.status(400).json({ success: false, error: 'Este pedido es a domicilio, no se retira en sucursal.' });
      }
      if (orden.estado === 'entregado') {
        return res.status(400).json({ success: false, error: 'Este pedido ya fue entregado.' });
      }
      if (orden.estado === 'cancelado') {
        return res.status(400).json({ success: false, error: 'Este pedido fue cancelado.' });
      }
      if (orden.estado !== 'listo_recoger') {
        return res.status(400).json({ success: false, error: `El pedido todavía no está listo para entrega (estado actual: ${orden.estado}).` });
      }

      const updated = await prisma.orden.update({
        where: { ordenId: orden.ordenId },
        data: {
          estado: 'entregado',
          historial: { create: { estado: 'entregado', comentario: `Entregado en sucursal. Código validado por ${req.user.email}.`, usuarioId: req.user.id } }
        },
        include: { items: true }
      });

      sendOrderStatusEmail(orden.usuario.email, updated, 'entregado').catch(err => console.error('[pickup-email]', err));

      res.json({ success: true, order: updated, customer: orden.usuario });
    } catch (error) {
      console.error('[validate-pickup]', error);
      res.status(500).json({ success: false, error: 'No se pudo validar el código.' });
    }
  });

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ColorLink Smart API', timestamp: new Date().toISOString() });
  });

  // ----------------------------------------------------------------
  // ASISTENTE VIRTUAL (Gemini): orientación técnica y de la tienda para el cliente
  // ----------------------------------------------------------------
  let assistantModelCache: string | null = null; // último modelo que respondió bien
  let catalogCache: { at: number; rows: Array<{ nombre: string; categoria: string | null; presentacion: string | null; rendimientoM2: number | null; precio: number | null }> } | null = null;

  const assistantLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 15,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: 'Estás enviando muchos mensajes. Espera un momento e intenta de nuevo.' }
  });

  // Abierto también a visitantes (solo orienta sobre el catálogo); el límite por IP protege el costo
  app.post('/api/assistant/chat', assistantLimiter, async (req: any, res) => {
    try {
      const mensaje = String(req.body?.message || '').trim().slice(0, 1000);
      if (!mensaje) return res.status(400).json({ success: false, error: 'Escribe tu pregunta.' });

      const historial: Array<{ sender: string; text: string }> = Array.isArray(req.body?.history) ? req.body.history.slice(-8) : [];
      const proyecto = req.body?.project && typeof req.body.project === 'object' ? req.body.project : null;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.json({
          success: true,
          source: 'sin-ia',
          reply: 'Por ahora el asistente inteligente no está disponible. Puedes calcular tus cuñetes con la calculadora de pintura o escribirnos y un asesor te ayudará.'
        });
      }

      // Catálogo real para no inventar productos ni precios
      if (!catalogCache || Date.now() - catalogCache.at > 5 * 60 * 1000) {
        const rows = await prisma.producto.findMany({
          select: { nombre: true, categoria: true, presentacion: true, rendimientoM2: true, precio: true },
          orderBy: { nombre: 'asc' },
          take: 60
        });
        catalogCache = { at: Date.now(), rows };
      }
      const productos = catalogCache.rows;
      const catalogo = productos.map(p =>
        `- ${p.nombre}${p.categoria ? ` (${p.categoria})` : ''}${p.presentacion ? `, ${p.presentacion}` : ''}${p.rendimientoM2 ? `, rinde ~${p.rendimientoM2} m²/gal` : ''}${p.precio ? `, $${Math.round(p.precio).toLocaleString('es-CO')} COP` : ''}`
      ).join('\n');

      const contextoProyecto = proyecto
        ? `\nEl cliente tiene abierto el formulario de cotización con estos datos (todavía NO es un proyecto guardado): ${[proyecto.proyecto, proyecto.areaM2 ? proyecto.areaM2 + ' m²' : '', proyecto.superficie, proyecto.ambiente, proyecto.color].filter(Boolean).join(' · ')}.`
        : '';

      // Si hay sesión, el asistente ve los proyectos y pedidos REALES del cliente (solo los suyos)
      let sesion: any = null;
      try { if (req.cookies?.session) sesion = jwt.verify(req.cookies.session, JWT_SECRET); } catch { sesion = null; }

      const ESTADO_PROY_TXT: Record<string, string> = {
        en_revision: 'en revisión', imagen_por_corregir: 'imagen por corregir (debe subir otra foto)', en_peritaje: 'en peritaje técnico',
        cotizado: 'cotizado', aprobado_calidad: 'aprobado por calidad', rechazado: 'requiere ajustes técnicos', despachado: 'despachado', cancelado: 'cancelado'
      };
      const ESTADO_ORDEN_TXT: Record<string, string> = {
        creado: 'creado', confirmado: 'comprado', en_alistamiento: 'en preparación en bodega', en_camino: 'en camino',
        listo_recoger: 'listo para retirar en tienda', entregado: 'entregado', cancelado: 'cancelado'
      };

      let contextoCuenta = '\nEl usuario NO ha iniciado sesión: no puedes ver sus proyectos ni pedidos. Si pregunta por ellos, pídele que inicie sesión y los revise en "Mis Proyectos" o "Mis Pedidos".';
      if (sesion?.id) {
        const [misProyectos, misOrdenes] = await Promise.all([
          prisma.proyecto.findMany({
            where: { usuarioId: sesion.id },
            select: { nombreProyecto: true, estadoPipeline: true, area: true, color: true, createdAt: true, cotizaciones: { select: { total: true }, orderBy: { createdAt: 'desc' }, take: 1 } },
            orderBy: { updatedAt: 'desc' },
            take: 10
          }),
          prisma.orden.findMany({
            where: { usuarioId: sesion.id },
            select: { ordenId: true, estado: true, total: true, metodoEntrega: true, createdAt: true },
            orderBy: { createdAt: 'desc' },
            take: 10
          })
        ]);
        const fecha = (d: Date) => d.toLocaleDateString('es-CO');
        const proyTxt = misProyectos.length
          ? misProyectos.map(p => `- "${p.nombreProyecto}": ${ESTADO_PROY_TXT[p.estadoPipeline || ''] || p.estadoPipeline || 'en revisión'}${p.area ? `, ${p.area} m²` : ''}${p.color ? `, color ${p.color}` : ''}${p.cotizaciones[0]?.total ? `, cotizado en $${Math.round(p.cotizaciones[0].total).toLocaleString('es-CO')} COP` : ''} (creado el ${fecha(p.createdAt)})`).join('\n')
          : '(ninguno: el cliente NO tiene proyectos registrados)';
        const ordTxt = misOrdenes.length
          ? misOrdenes.map(o => `- Pedido CL-${o.ordenId.slice(0, 8).toUpperCase()}: ${ESTADO_ORDEN_TXT[o.estado] || o.estado}, $${Math.round(o.total).toLocaleString('es-CO')} COP, ${o.metodoEntrega === 'recoger_tienda' ? 'retiro en tienda' : 'envío a domicilio'} (${fecha(o.createdAt)})`).join('\n')
          : '(ninguno: el cliente NO tiene pedidos)';
        contextoCuenta = `\nDatos reales de la cuenta del cliente (fuente única de verdad, consultada ahora mismo):\nProyectos:\n${proyTxt}\nPedidos:\n${ordTxt}`;
      }

      const systemPrompt = `Eres el Asistente Virtual de COLORLINK, una plataforma colombiana de pinturas y recubrimientos con tienda en línea y cotización de proyectos de obra (Valle de Aburrá, Medellín).
Hablas en español, cálido, claro y breve (máximo ~120 palabras salvo que pidan detalle). Formato: texto plano; puedes usar **negrita** y viñetas que empiecen con "- ". No uses tablas ni encabezados.
Ayudas con: elegir productos, rendimientos y cuñetes/galones (fórmula: área × manos ÷ rendimiento m²/gal, más ~10% de desperdicio), preparación de superficies (humedad, fisuras, selladores), cómo funciona la tienda (pedidos, retiro en tienda con QR, cancelación solo mientras el pedido está en "Comprado") y cómo funciona la cotización de proyectos (revisión, peritaje, cotización, despacho).
Reglas: NUNCA inventes proyectos, pedidos, estados, stock, precios, plazos, descuentos ni nombres de personas. Sobre los proyectos y pedidos del cliente responde SOLO con la lista de "Datos reales de la cuenta"; si esa lista dice que no hay, di claramente que no tiene ninguno y explica cómo crearlo; usa solo el catálogo de abajo para productos y precios y, si no sabes algo, dilo y sugiere hablar con un asesor. No des información interna del equipo ni de otros clientes. No respondas sobre temas ajenos a pinturas, obra y la plataforma.
${contextoCuenta}${contextoProyecto}

Catálogo disponible:
${catalogo || '(catálogo no disponible)'}`;

      const contents = [
        ...historial
          .filter(h => h && typeof h.text === 'string' && h.text.trim())
          .map(h => ({ role: h.sender === 'user' ? 'user' : 'model', parts: [{ text: String(h.text).slice(0, 1000) }] })),
        { role: 'user', parts: [{ text: mensaje }] }
      ];
      // Gemini exige que la conversación empiece con un mensaje del usuario
      while (contents.length > 1 && contents[0].role !== 'user') contents.shift();

      const ai = new GoogleGenAI({ apiKey });
      const fallbackReply = 'No pude responder en este momento. Intenta de nuevo en unos segundos o escríbenos para que un asesor te ayude.';
      // Primero el modelo que ya funcionó (o el configurado); los rápidos van antes
      const candidates = [assistantModelCache, process.env.GEMINI_CHAT_MODEL, 'gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.7-flash']
        .filter((m, i, arr): m is string => !!m && arr.indexOf(m) === i);
      const wantsStream = req.body?.stream === true;

      for (const modelName of candidates) {
        // Intento rápido (sin razonamiento extendido); si el modelo no lo acepta, se reintenta normal
        for (const thinking of [true, false]) {
          const config: any = { systemInstruction: systemPrompt, temperature: 0.3, maxOutputTokens: 2048 };
          if (thinking) config.thinkingConfig = { thinkingBudget: 0 };
          let wrote = false;
          try {
            if (wantsStream) {
              const stream = await ai.models.generateContentStream({ model: modelName, contents, config });
              for await (const chunk of stream) {
                const t = chunk.text || '';
                if (!t) continue;
                if (!wrote) {
                  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
                  res.setHeader('Cache-Control', 'no-cache');
                  res.setHeader('X-Accel-Buffering', 'no');
                  wrote = true;
                }
                res.write(t);
              }
              if (wrote) { assistantModelCache = modelName; return res.end(); }
            } else {
              const response = await ai.models.generateContent({ model: modelName, contents, config });
              const reply = (response.text || '').trim();
              if (reply) { assistantModelCache = modelName; return res.json({ success: true, source: modelName, reply }); }
            }
          } catch (geminiError: any) {
            if (wrote) return res.end(); // ya se envió parte de la respuesta: se cierra como está
            console.error(`[ASSISTANT] Modelo ${modelName}${thinking ? ' (rápido)' : ''} falló:`, geminiError?.message || geminiError);
            if (assistantModelCache === modelName && !thinking) assistantModelCache = null;
          }
        }
      }

      if (wantsStream) {
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        return res.end(fallbackReply);
      }
      res.json({ success: true, source: 'sin-ia', reply: fallbackReply });
    } catch (error: any) {
      console.error('[assistant-chat]', error);
      res.status(500).json({ success: false, error: 'No se pudo consultar al asistente.' });
    }
  });

  app.post('/api/classify-project', requireAuth, async (req, res) => {
    try {
      const {
        cliente, ciudad, proyecto, area, superficie, condicion,
        color, fechaRequerida, descripcion, ambiente, imageBase64
      } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;

      if (apiKey) {
        const modelsToTry = ['gemini-3.7-flash', 'gemini-3.5-flash', 'gemini-3.1-flash-lite'];
        const ai = new GoogleGenAI({ apiKey });

        for (const modelName of modelsToTry) {
          try {
            const systemPrompt = `Eres el Asistente Técnico y Clasificador de Patologías en Pintura y Recubrimientos de COLORLINK.
Tu trabajo es analizar la necesidad del cliente y entregar un dictamen técnico formal en formato JSON estricto.
Si se te proporciona una imagen, evalúa además si esa fotografía es coherente con el contexto descrito por el cliente
(tipo de superficie, ambiente y condición reportada) — por ejemplo, si el cliente describe una fachada exterior con
humedad pero la foto muestra un interior sin ningún problema visible, márcala como NO coherente y explica por qué.
Si no se te proporciona ninguna imagen, usa "imagen_coherente": true por defecto (no hay nada que contradecir).
Responde ÚNICAMENTE un objeto JSON válido con la siguiente estructura:
{
  "diagnostico_patologia": "string",
  "severidad": "Baja" | "Media" | "Alta",
  "complejidad": "Baja" | "Media" | "Alta",
  "sistema_recomendado": { "paso1_preparacion": "string", "paso2_imprimante_sellador": "string", "paso3_acabado": "string" },
  "linea_producto_sugerida": "string",
  "manos_recomendadas": number,
  "rendimiento_estimado_m2_gal": number,
  "factor_desperdicio_pct": number,
  "observaciones_tecnicas": ["string"],
  "requiere_visita_especialista_human_in_the_loop": boolean,
  "nivel_confianza_ia_pct": number,
  "resumen_ejecutivo": "string",
  "imagen_coherente": boolean,
  "imagen_observacion": "string"
}`;

            const userContent: any[] = [
              `Datos del proyecto:
- Cliente: ${cliente || 'Constructora Horizonte'}
- Ciudad: ${ciudad || 'Medellín'}
- Tipo de Proyecto: ${proyecto || 'Fachada edificio residencial'}
- Área: ${area || 85} m²
- Sustrato/Superficie: ${superficie || 'Concreto'}
- Ambiente: ${ambiente || 'Exterior Fachada'}
- Condición reportada: ${Array.isArray(condicion) ? condicion.join(', ') : condicion || 'Humedad + Fisuras'}
- Color deseado: ${color || 'Gris'}
- Plazo requerido: ${fechaRequerida || '20 días'}
- Descripción adicional: ${descripcion || 'Muro exterior con humedad y grietas'}`
            ];

            if (imageBase64 && imageBase64.includes('base64,')) {
              const base64Data = imageBase64.split('base64,')[1];
              const mimeMatch = imageBase64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
              const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
              userContent.push({ inlineData: { data: base64Data, mimeType } });
            }

            const response = await ai.models.generateContent({
              model: modelName,
              contents: [{ role: 'user', parts: userContent.map(c => typeof c === 'string' ? { text: c } : c) }],
              config: { systemInstruction: systemPrompt, responseMimeType: 'application/json' }
            });

            const parsed = JSON.parse(response.text || '{}');
            return res.json({ success: true, source: modelName, data: parsed });
          } catch (geminiError: any) {
            console.error(`[GEMINI-ERROR] Modelo ${modelName} falló:`, geminiError?.message || geminiError);
            if (modelName === modelsToTry[modelsToTry.length - 1]) {
              console.info('Switching to ColorLink Expert Engineering Engine.');
            }
          }
        }
      }

      const areaNum = Number(area) || 85;
      const isConcreto = String(superficie || '').toLowerCase().includes('concreto');
      const hasHumedad = String(condicion || '').toLowerCase().includes('humedad');
      const hasFisuras = String(condicion || '').toLowerCase().includes('fisura');

      const fallbackResult = {
        diagnostico_patologia: hasHumedad && hasFisuras
          ? 'Presencia combinada de humedad capilar y microfisuras estructurales activas.'
          : hasHumedad ? 'Humedad superficial por intemperismo.' : 'Sustrato con desgaste normal.',
        severidad: (hasHumedad && hasFisuras) ? 'Alta' : hasHumedad ? 'Media' : 'Baja',
        complejidad: (hasHumedad && hasFisuras) ? 'Alta' : 'Media',
        sistema_recomendado: {
          paso1_preparacion: 'Limpieza mecánica con hidrolavado a 2000 PSI y apertura en V de fisuras > 0.5mm.',
          paso2_imprimante_sellador: 'Sellador Antialcalino Hidrófugo ColorLink Pro Shield + masilla elastomérica.',
          paso3_acabado: 'Recubrimiento Fachada Elastomérico 100% Acrílico Premium ColorLink Koraza Tech.'
        },
        linea_producto_sugerida: 'ColorLink Pro Fachada Impermeabilizante & Anti-Fisuras',
        manos_recomendadas: 2,
        rendimiento_estimado_m2_gal: 28.5,
        factor_desperdicio_pct: 10,
        observaciones_tecnicas: [
          'Verificar humedad del concreto inferior al 12% antes de aplicar el sellador.',
          'Curado mínimo de la masilla elastomérica de 4 a 6 horas.',
          'Aplicar con rodillo de felpa 3/8" o Airless con boquilla 517.'
        ],
        requiere_visita_especialista_human_in_the_loop: (hasHumedad && hasFisuras && areaNum > 50),
        imagen_coherente: true, // el motor de respaldo no analiza imágenes reales, así que no puede contradecir nada
        imagen_observacion: '',
        nivel_confianza_ia_pct: 96.5,
        resumen_ejecutivo: `Proyecto evaluado para ${cliente || 'Constructora Horizonte'} en ${ciudad || 'Medellín'}.`
      };

      return res.json({ success: true, source: 'colorlink-expert-engine', data: fallbackResult });
    } catch (error: any) {
      console.error('Error in classify-project endpoint:', error);
      res.status(500).json({ success: false, error: error.message || 'Error procesando la clasificación' });
    }
  });

  // ================================================================
  // INVENTARIO
  // ================================================================

  // Fotos reales del visualizador (generadas con Gemini y guardadas en data/visualizer)
  registerVisualizerRoutes(app);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({ server: { middlewareMode: true }, appType: 'spa' });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ColorLink Platform running on http://0.0.0.0:${PORT}`);
    startVisualizerAutogen();
  });
}

startServer();
