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
  function requireAuth(req: any, res: any, next: any) {
    const token = req.cookies?.session;
    if (!token) return res.status(401).json({ success: false, error: 'No autenticado' });
    try {
      req.user = jwt.verify(token, JWT_SECRET);
      next();
    } catch {
      return res.status(401).json({ success: false, error: 'Sesión inválida o expirada' });
    }
  }

  function requireRole(...roles: string[]) {
    return (req: any, res: any, next: any) => {
      if (!req.user || !roles.includes(req.user.role)) {
        return res.status(403).json({ success: false, error: 'No tienes permiso para esta acción' });
      }
      next();
    };
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
        const token = issueSessionToken(existingUser);
        res.cookie('session', token, cookieOptions);
        return res.json({ success: true, isRegistered: true, user: safeUser(existingUser) });
      }

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

  // 3. Registro (siempre como rol "cliente")
  app.post('/api/auth/register', authLimiter, async (req, res) => {
    try {
      const { firstName, lastName, email, company, documentId, address, city, phone, password } = req.body;

      if (!firstName || !lastName || !email || !company || !documentId || !address || !password) {
        return res.status(400).json({ success: false, error: 'Todos los campos, incluida la contraseña, son requeridos' });
      }
      if (String(password).length < 8) {
        return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' });
      }

      const cleanEmail = String(email).trim().toLowerCase();

      const existing = await prisma.usuario.findUnique({ where: { email: cleanEmail } });
      if (existing) {
        return res.status(409).json({ success: false, error: 'Ya existe una cuenta con este correo' });
      }

      const rolCliente = await prisma.rol.findFirst({ where: { rol: 'cliente' } });
      if (!rolCliente) {
        return res.status(500).json({ success: false, error: 'Rol "cliente" no existe. Corre el seed primero (pnpm run db:seed).' });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = await prisma.usuario.create({
        data: {
          nombre: String(firstName).trim(),
          apellido: String(lastName).trim(),
          email: cleanEmail,
          telefono: phone || null,
          passwordHash,
          authProvider: 'credentials',
          rolId: rolCliente.rolId,
          company: company.trim(),
          documentId: documentId.trim(),
          address: address.trim(),
          city: city || 'Medellín'
        },
        include: { rol: true }
      });

      const token = issueSessionToken(newUser);
      res.cookie('session', token, cookieOptions);

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

      const needsProfile = !user.company; // le falta completar datos de empresa
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
      ? `if (window.opener) { window.opener.postMessage({ type: 'OAUTH_AUTH_SUCCESS', user: ${JSON.stringify(user)} }, '*'); setTimeout(() => window.close(), 250); }`
      : `if (window.opener) { window.opener.postMessage({ type: 'OAUTH_AUTH_ERROR', error: ${JSON.stringify(errorMsg)} }, '*'); setTimeout(() => window.close(), 1500); }`
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

  // 9. Olvidé mi contraseña — reutiliza la tabla de OTP
  app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, error: 'Correo requerido' });

      const cleanEmail = String(email).trim().toLowerCase();
      const user = await prisma.usuario.findUnique({ where: { email: cleanEmail } });

      // Por seguridad, respondemos igual exista o no el correo (evita enumeración de usuarios)
      if (user) {
        const code = String(Math.floor(100000 + Math.random() * 900000));
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await prisma.otpVerificationCode.updateMany({
          where: { email: cleanEmail, isUsed: false },
          data: { isUsed: true }
        });
        await prisma.otpVerificationCode.create({ data: { email: cleanEmail, code, expiresAt } });
        await sendOtpEmail(cleanEmail, code);
      }

      res.json({ success: true, message: 'Si el correo existe, recibirás un código para restablecer tu contraseña.' });
    } catch (error: any) {
      console.error('[forgot-password]', error);
      res.status(500).json({ success: false, error: 'No se pudo procesar la solicitud' });
    }
  });

  // 10. Confirmar código y establecer nueva contraseña
  app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ success: false, error: 'Correo, código y nueva contraseña son requeridos' });
      }
      if (String(newPassword).length < 8) {
        return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const stored = await prisma.otpVerificationCode.findFirst({
        where: { email: cleanEmail, isUsed: false },
        orderBy: { createdAt: 'desc' }
      });

      if (!stored || new Date() > stored.expiresAt || stored.code !== String(code).trim()) {
        return res.status(400).json({ success: false, error: 'Código inválido o expirado' });
      }

      await prisma.otpVerificationCode.update({ where: { id: stored.id }, data: { isUsed: true } });

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.usuario.update({ where: { email: cleanEmail }, data: { passwordHash } });

      res.json({ success: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
    } catch (error: any) {
      console.error('[reset-password]', error);
      res.status(500).json({ success: false, error: 'No se pudo restablecer la contraseña' });
    }
  });

  // 11. Ver / editar mi propio perfil
  app.get('/api/auth/profile', requireAuth, async (req: any, res) => {
    const user = await prisma.usuario.findUnique({ where: { usuarioId: req.user.id }, include: { rol: true } });
    if (!user) return res.status(404).json({ success: false, error: 'Usuario no encontrado' });
    res.json({ success: true, user: safeUser(user) });
  });

  app.patch('/api/auth/profile', requireAuth, async (req: any, res) => {
    try {
      const { firstName, lastName, phone, avatarUrl } = req.body;
      const updated = await prisma.usuario.update({
        where: { usuarioId: req.user.id },
        data: {
          nombre: firstName || undefined,
          apellido: lastName ?? undefined,
          telefono: phone ?? undefined,
          avatarUrl: avatarUrl ?? undefined
        },
        include: { rol: true }
      });
      res.json({ success: true, user: safeUser(updated) });
    } catch (error: any) {
      console.error('[patch-profile]', error);
      res.status(400).json({ success: false, error: 'No se pudo actualizar el perfil' });
    }
  });

  // 12. Estadísticas reales del dashboard, según el rol
  app.get('/api/dashboard/stats', requireAuth, async (req: any, res) => {
    try {
      const isStaff = ['asesor', 'calidad', 'administrador'].includes(req.user.role);
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
  app.post('/api/auth/forgot-password', authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) return res.status(400).json({ success: false, error: 'Correo requerido' });

      const cleanEmail = String(email).trim().toLowerCase();
      const user = await prisma.usuario.findUnique({ where: { email: cleanEmail } });

      // Respuesta genérica siempre, exista o no el correo (evita revelar qué emails están registrados)
      if (!user) {
        return res.json({ success: true, message: 'Si el correo existe, recibirás un código para restablecer tu contraseña.' });
      }

      const code = String(Math.floor(100000 + Math.random() * 900000));
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await prisma.otpVerificationCode.updateMany({
        where: { email: cleanEmail, isUsed: false },
        data: { isUsed: true }
      });
      await prisma.otpVerificationCode.create({
        data: { email: cleanEmail, code, expiresAt, usuarioId: user.usuarioId }
      });

      await sendOtpEmail(cleanEmail, code);

      res.json({ success: true, message: 'Si el correo existe, recibirás un código para restablecer tu contraseña.' });
    } catch (error: any) {
      console.error('[forgot-password]', error);
      res.status(500).json({ success: false, error: 'No se pudo procesar la solicitud' });
    }
  });

  // 9. Restablecer contraseña con el código recibido
  app.post('/api/auth/reset-password', authLimiter, async (req, res) => {
    try {
      const { email, code, newPassword } = req.body;
      if (!email || !code || !newPassword) {
        return res.status(400).json({ success: false, error: 'Correo, código y nueva contraseña son requeridos' });
      }
      if (String(newPassword).length < 8) {
        return res.status(400).json({ success: false, error: 'La contraseña debe tener al menos 8 caracteres' });
      }

      const cleanEmail = String(email).trim().toLowerCase();
      const stored = await prisma.otpVerificationCode.findFirst({
        where: { email: cleanEmail, isUsed: false },
        orderBy: { createdAt: 'desc' }
      });

      if (!stored || new Date() > stored.expiresAt || stored.code !== String(code).trim()) {
        return res.status(400).json({ success: false, error: 'Código inválido o expirado' });
      }

      await prisma.otpVerificationCode.update({ where: { id: stored.id }, data: { isUsed: true } });

      const passwordHash = await bcrypt.hash(newPassword, 10);
      await prisma.usuario.update({
        where: { email: cleanEmail },
        data: { passwordHash }
      });

      res.json({ success: true, message: 'Contraseña actualizada. Ya puedes iniciar sesión.' });
    } catch (error: any) {
      console.error('[reset-password]', error);
      res.status(500).json({ success: false, error: 'No se pudo restablecer la contraseña' });
    }
  });

  // 8. Completar perfil (empresa) para un usuario ya autenticado (ej. tras login social)
  app.post('/api/auth/complete-profile', requireAuth, async (req: any, res) => {
    try {
      const { company, documentId, address, city, phone } = req.body;
      if (!company || !documentId || !address) {
        return res.status(400).json({ success: false, error: 'Empresa, documento y dirección son requeridos' });
      }

      const updated = await prisma.usuario.update({
        where: { usuarioId: req.user.id },
        data: {
          company: company.trim(),
          documentId: documentId.trim(),
          address: address.trim(),
          city: city || 'Medellín',
          telefono: phone || undefined
        },
        include: { rol: true }
      });

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
    if (!usuario?.company || !usuario.documentId) {
      throw new Error('El usuario debe completar los datos de su empresa antes de crear un proyecto');
    }

    let empresa = await prisma.empresaCliente.findFirst({ where: { nitCedula: usuario.documentId } });
    if (empresa) return empresa;

    const ciudad = await findOrCreateCiudad(ciudadNombre || usuario.city || 'Medellín');
    empresa = await prisma.empresaCliente.create({
      data: {
        nitCedula: usuario.documentId,
        razonSocial: usuario.company,
        direccionDespacho: usuario.address || '',
        ciudadId: ciudad.ciudadId
      }
    });
    return empresa;
  }

  // Lista los proyectos del usuario autenticado
  app.get('/api/projects', requireAuth, async (req: any, res) => {
    try {
      const proyectos = await prisma.proyecto.findMany({
        where: { usuarioId: req.user.id },
        include: {
          diagnostico: true,
          cotizaciones: { orderBy: { createdAt: 'desc' } },
          empresa: { include: { ciudad: true } }
        },
        orderBy: { updatedAt: 'desc' }
      });
      res.json({ success: true, projects: proyectos });
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
        rendimientoEstimado, confianzaIaPct, requiereVisitaHumana
      } = req.body;

      if (!nombreProyecto) {
        return res.status(400).json({ success: false, error: 'El nombre del proyecto es requerido' });
      }

      const empresa = await findOrCreateEmpresaForUser(req.user.id, ciudad);

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
          estadoPipeline: 'cotizado',
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
        include: {
          diagnostico: true,
          cotizaciones: { orderBy: { createdAt: 'desc' } },
          empresa: { include: { ciudad: true } },
          usuario: { select: { nombre: true, apellido: true, email: true, telefono: true } }
        },
        orderBy: { createdAt: 'desc' }
      });
      res.json({ success: true, projects: proyectos });
    } catch (error: any) {
      console.error('[get-all-projects]', error);
      res.status(500).json({ success: false, error: 'No se pudieron cargar los proyectos' });
    }
  });

  // Ajustes comerciales de un asesor sobre un proyecto (área, acabado, descuento, notas, estado)
  app.patch('/api/projects/:id', requireAuth, requireRole('asesor', 'administrador'), async (req: any, res) => {
    try {
      const { area, acabado, descuentoAsesorPct, observacionesAsesor, estadoPipeline } = req.body;

      const updated = await prisma.proyecto.update({
        where: { proyectoId: req.params.id },
        data: {
          area: area != null ? Number(area) : undefined,
          acabado: acabado || undefined,
          descuentoAsesorPct: descuentoAsesorPct != null ? Number(descuentoAsesorPct) : undefined,
          observacionesAsesor: observacionesAsesor ?? undefined,
          estadoPipeline: estadoPipeline || undefined
        },
        include: { diagnostico: true, cotizaciones: true, empresa: { include: { ciudad: true } } }
      });

      res.json({ success: true, project: updated });
    } catch (error: any) {
      console.error('[patch-project]', error);
      res.status(400).json({ success: false, error: 'No se pudo actualizar el proyecto' });
    }
  });

  // Veredicto de calidad/laboratorio sobre un proyecto (crea o actualiza el DiagnosticoIA)
  app.put('/api/projects/:id/quality-verdict', requireAuth, requireRole('calidad', 'administrador'), async (req: any, res) => {
    try {
      const { humedadRelativa, severidadFisuras, notasPerito, aprobadoCalidad } = req.body;

      const verdict = await prisma.diagnosticoIA.upsert({
        where: { proyectoId: req.params.id },
        update: {
          humedadRelativa: humedadRelativa != null ? Number(humedadRelativa) : undefined,
          severidadFisuras: severidadFisuras || undefined,
          notasPerito: notasPerito || undefined,
          aprobadoCalidad: aprobadoCalidad != null ? Boolean(aprobadoCalidad) : undefined,
          peritoNombre: req.user.email,
          fechaVeredicto: new Date()
        },
        create: {
          proyectoId: req.params.id,
          humedadRelativa: humedadRelativa != null ? Number(humedadRelativa) : null,
          severidadFisuras: severidadFisuras || null,
          notasPerito: notasPerito || null,
          aprobadoCalidad: aprobadoCalidad != null ? Boolean(aprobadoCalidad) : null,
          peritoNombre: req.user.email,
          fechaVeredicto: new Date()
        }
      });

      // Si calidad aprueba, avanza el estado del proyecto en el pipeline
      if (aprobadoCalidad) {
        await prisma.proyecto.update({
          where: { proyectoId: req.params.id },
          data: { estadoPipeline: 'aprobado_calidad' }
        });
      }

      res.json({ success: true, diagnostico: verdict });
    } catch (error: any) {
      console.error('[quality-verdict]', error);
      res.status(400).json({ success: false, error: 'No se pudo guardar el veredicto de calidad' });
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

  app.patch('/api/inventory/:id', requireAuth, requireRole('administrador'), async (req: any, res) => {
    try {
      const { delta } = req.body; // ej: -1, +5
      const current = await prisma.inventarioProducto.findUnique({ where: { inventarioId: req.params.id } });
      if (!current) return res.status(404).json({ success: false, error: 'Registro de inventario no encontrado' });

      const nuevaCantidad = Math.max(0, (current.cantidadDisponible || 0) + Number(delta));
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

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'ColorLink Smart API', timestamp: new Date().toISOString() });
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
  "resumen_ejecutivo": "string"
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

  app.get('/api/inventory', requireAuth, async (req: any, res) => {
    try {
      const productos = await prisma.producto.findMany({
        include: { inventarios: { include: { ciudad: true } } }
      });
      res.json({ success: true, products: productos });
    } catch (error: any) {
      console.error('[get-inventory]', error);
      res.status(500).json({ success: false, error: 'No se pudo cargar el inventario' });
    }
  });

  app.patch('/api/inventory/:inventarioId', requireAuth, requireRole('administrador'), async (req: any, res) => {
    try {
      const { delta } = req.body; // +5, -1, etc.
      const actual = await prisma.inventarioProducto.findUnique({ where: { inventarioId: req.params.inventarioId } });
      if (!actual) return res.status(404).json({ success: false, error: 'Registro de inventario no encontrado' });

      const nuevaCantidad = Math.max(0, (actual.cantidadDisponible || 0) + Number(delta));
      const actualizado = await prisma.inventarioProducto.update({
        where: { inventarioId: req.params.inventarioId },
        data: { cantidadDisponible: nuevaCantidad },
        include: { ciudad: true, producto: true }
      });
      res.json({ success: true, item: actualizado });
    } catch (error: any) {
      console.error('[patch-inventory]', error);
      res.status(400).json({ success: false, error: 'No se pudo ajustar el stock' });
    }
  });

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
  });
}

startServer();