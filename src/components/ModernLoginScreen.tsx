import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { DEMO_PROFILES } from '../data/mockData';
import {
  HelpCircle,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  KeyRound,
  CheckCircle2,
  Droplet,
  Info,
  Mail
} from 'lucide-react';

interface ModernLoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
}

// Architectural coating presentation images rotating on each visit/session
const PRESENTATION_IMAGES = [
  "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1000&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1541888946425-d0fbb186c5f7?w=1000&auto=format&fit=crop&q=80"
];

// Pre-registered database emails
const REGISTERED_DATABASE_EMAILS = [
  'proyectos@constructorahorizonte.com.co',
  'j.osorio@colorlink.com.co',
  'e.restrepo@colorlink.com.co',
  'm.quintero@colorlink.com.co',
  'carlos.mendoza@constructorahorizonte.com.co',
  'obras@constructorahorizonte.com.co',
  'admin@colorlink.com.co'
];

type AuthView = 'main_menu' | 'email_code' | 'email_password' | 'verify_otp' | 'register_page';

export const ModernLoginScreen: React.FC<ModernLoginScreenProps> = ({
  onLoginSuccess
}) => {
  // View state following the requested flow
  //const [authView, setAuthView] = useState<AuthView>('main_menu');

  const [authView, setAuthView] = useState<'main_menu' | 'password_login' | 'register_page' | 'forgot_email' | 'forgot_code'>('main_menu');

  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotCode, setForgotCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [forgotMessage, setForgotMessage] = useState('');
  // Rotating image index on each visit/session
  const [imageIndex] = useState(() => {
    try {
      const stored = sessionStorage.getItem('colorlink_img_idx');
      const nextIdx = stored ? (parseInt(stored, 10) + 1) % PRESENTATION_IMAGES.length : 0;
      sessionStorage.setItem('colorlink_img_idx', nextIdx.toString());
      return nextIdx;
    } catch {
      return Math.floor(Math.random() * PRESENTATION_IMAGES.length);
    }
  });

  // Registered emails in memory (includes predefined and dynamically registered ones)
  const [dbEmails, setDbEmails] = useState<string[]>(REGISTERED_DATABASE_EMAILS);

  // Email input for code access or login
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [activeGeneratedCode, setActiveGeneratedCode] = useState('');

  // Register Form Fields
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regNit, setRegNit] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('');
  const [regPhone, setRegPhone] = useState('');

  // UI status & Modals
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoNotice, setInfoNotice] = useState('');
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Listen for SSO postMessage from popup (Google, Microsoft)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        const { needsProfile, ...userData } = event.data.user;
        executeSocialAuth(userData, needsProfile);
      }
      if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setErrorMessage(event.data.error || 'Error al autenticar');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [dbEmails]);

  // Resend OTP cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Action to open real OAuth / SSO popup window
  const handleOpenSSOPopup = async (provider: 'google' | 'microsoft') => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/auth/oauth-url/${provider}?origin=${encodeURIComponent(window.location.origin)}`);
      const data = await res.json();
      if (data.url) {
        const popup = window.open(
          data.url,
          `sso_${provider}_popup`,
          'width=500,height=640,left=350,top=80,toolbar=no,menubar=no,status=no'
        );
        if (!popup) {
          setErrorMessage('Tu navegador bloqueó la ventana emergente. Por favor permite popups para iniciar sesión con ' + provider);
        }
      } else {
        setErrorMessage(data.error || `El servicio de autenticación con ${provider === 'google' ? 'Google' : 'Microsoft'} aún no está configurado.`);
      }
    } catch {
      setErrorMessage('No se pudo conectar con el servidor de autenticación SSO.');
    } finally {
      setIsLoading(false);
    }
  };

  // Action to resend code by email
  const handleResendOtp = async () => {
    if (resendCooldown > 0 || !userEmail.trim()) return;
    setResendCooldown(30);
    setErrorMessage('');
    setIsLoading(true);
    try {
      const emailLower = userEmail.trim().toLowerCase();
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower })
      });
      const data = await response.json();
      const code = data.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
      setActiveGeneratedCode(code);
      setInfoNotice(`Código reenviado a tu correo: ${emailLower}`);
    } catch {
      setInfoNotice('Código reenviado.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract email components and pre-populate names
  const extractEmailDetails = (email: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const parts = cleanEmail.split('@');
    const usernamePart = parts[0] || '';
    const domainPart = parts[1] || '';

    setRegEmail(cleanEmail);

    // Try to guess first and last name from username (e.g. carlos.mendoza -> Carlos Mendoza)
    if (usernamePart.includes('.')) {
      const nameParts = usernamePart.split('.');
      if (nameParts[0] && !regFirstName) {
        setRegFirstName(nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1));
      }
      if (nameParts[1] && !regLastName) {
        setRegLastName(nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1));
      }
    } else if (usernamePart && !regFirstName) {
      setRegFirstName(usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1));
    }

    // Guess company if domain is not a generic provider
    if (domainPart && !['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com'].includes(domainPart) && !regCompany) {
      const companyClean = domainPart.split('.')[0];
      setRegCompany(`Constructora ${companyClean.charAt(0).toUpperCase() + companyClean.slice(1)} S.A.S.`);
    }
  };

  const handleForgotPasswordRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase() })
      });
      const data = await res.json();
      if (data.success) {
        setForgotMessage(data.message);
        setAuthView('forgot_code');
      } else {
        setErrorMessage(data.error || 'No se pudo procesar la solicitud');
      }
    } catch {
      setErrorMessage('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (newPassword.length < 8) {
      setErrorMessage('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail.trim().toLowerCase(), code: forgotCode, newPassword })
      });
      const data = await res.json();
      if (data.success) {
        setForgotMessage('¡Contraseña actualizada! Ya puedes iniciar sesión.');
        setTimeout(() => setAuthView('email_password'), 2000);
      } else {
        setErrorMessage(data.error || 'No se pudo restablecer la contraseña');
      }
    } catch {
      setErrorMessage('Error de conexión');
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Action: Confirm Email for Code Access
  // REQUERIMIENTO EXACTO: NO decirle que no existe, enviarle PRIMERO el correo con el código y pasar a verificación
  const handleConfirmEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoNotice('');

    if (!userEmail.trim()) {
      setErrorMessage('Por favor ingresa un correo electrónico válido.');
      return;
    }

    const emailLower = userEmail.trim().toLowerCase();
    setIsLoading(true);

    try {
      // Call backend to generate and send OTP
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower })
      });

      const data = await response.json();
      const code = data.otpCode || Math.floor(100000 + Math.random() * 900000).toString();
      setActiveGeneratedCode(code);
      setOtpCode('');

      // Move directly to OTP verification view without complaining
      setAuthView('verify_otp');
      setInfoNotice(`Hemos enviado un código de seguridad de 6 dígitos a ${emailLower}`);
    } catch {
      // Offline fallback
      const fallbackCode = Math.floor(100000 + Math.random() * 900000).toString();
      setActiveGeneratedCode(fallbackCode);
      setOtpCode('');
      setAuthView('verify_otp');
      setInfoNotice(`Hemos enviado un código de seguridad de 6 dígitos a ${emailLower}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Action: Verify OTP Code
  // REQUERIMIENTO EXACTO: Si está registrado, ingresa normal por inercia. Si NO está registrado, lo redirige al registro corporativo.
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (otpCode.length < 4) {
      setErrorMessage('Ingresa el código numérico de verificación recibido por correo.');
      return;
    }

    setIsLoading(true);
    const emailLower = userEmail.trim().toLowerCase();

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, code: otpCode })
      });

      const data = await response.json();

      if (data.success && data.isRegistered && data.user) {
        // Registered: login immediately by simple inertia!
        onLoginSuccess(data.user);
        return;
      }

      // Check local DB if backend indicates not registered or offline
      const isRegisteredLocally = dbEmails.some(e => e.toLowerCase() === emailLower);
      if (isRegisteredLocally) {
        resolveLoginByEmail(emailLower);
        return;
      }

      // If NOT registered, redirect smoothly to corporate registration with email pre-extracted!
      extractEmailDetails(emailLower);
      setInfoNotice(`Correo ${emailLower} verificado con éxito. Por favor completa los datos de tu empresa para terminar de vincularla.`);
      setAuthView('register_page');
    } catch {
      // Fallback evaluation
      const isRegisteredLocally = dbEmails.some(e => e.toLowerCase() === emailLower);
      if (isRegisteredLocally) {
        resolveLoginByEmail(emailLower);
      } else {
        extractEmailDetails(emailLower);
        setInfoNotice(`Correo ${emailLower} verificado con éxito. Por favor completa los datos de tu empresa.`);
        setAuthView('register_page');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Action: Login with Email & Password
  const handleLoginWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setInfoNotice('');

    if (!userEmail.trim() || !userPassword.trim()) {
      setErrorMessage('Por favor ingresa tu correo y contraseña.');
      return;
    }

    const emailLower = userEmail.trim().toLowerCase();
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, password: userPassword })
      });

      const data = await response.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user);
        return;
      }

      // If not registered, smoothly redirect to registration without reprimanding
      extractEmailDetails(emailLower);
      setInfoNotice(`El correo "${emailLower}" aún no tiene datos de empresa registrados. Completa el formulario a continuación.`);
      setAuthView('register_page');
    } catch {
      const isRegistered = dbEmails.some(e => e.toLowerCase() === emailLower);
      if (isRegistered) {
        resolveLoginByEmail(emailLower);
      } else {
        extractEmailDetails(emailLower);
        setInfoNotice(`El correo "${emailLower}" aún no tiene empresa vinculada. Completa el formulario de registro.`);
        setAuthView('register_page');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Action: Complete Full Registration
  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regFirstName || !regLastName || !regEmail || !regCompany || !regNit || !regAddress) {
      setErrorMessage('Por favor completa todos los campos requeridos de la empresa.');
      return;
    }

    setIsLoading(true);
    try {
      // Si ya hay sesión activa (vino de Google/Microsoft), completamos perfil.
      // Si no, es un registro nuevo por contraseña.
      const meCheck = await fetch('/api/auth/me');
      const isAlreadyAuthenticated = meCheck.ok;

      const endpoint = isAlreadyAuthenticated ? '/api/auth/complete-profile' : '/api/auth/register';
      const body = isAlreadyAuthenticated
        ? { company: regCompany, documentId: regNit, address: regAddress, city: regCity, phone: regPhone }
        : { firstName: regFirstName, lastName: regLastName, email: regEmail.trim().toLowerCase(), company: regCompany, documentId: regNit, address: regAddress, city: regCity, phone: regPhone, password: regPassword };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await response.json();
      if (!data.success) {
        setErrorMessage(data.error || 'No se pudo completar el registro');
        setIsLoading(false);
        return;
      }

      onLoginSuccess?.(data.user); // ajusta al nombre real de tu callback
    } catch (err) {
      setErrorMessage('Error de conexión con el servidor');
    } finally {
      setIsLoading(false);
    }
  };

  // 5. Functional Social / SSO Authentication execution
  const executeSocialAuth = (userData: any, needsProfile?: boolean) => {
    setIsLoading(false);

    if (needsProfile) {
      setUserEmail(userData.email);
      setRegEmail(userData.email);
      setRegFirstName(userData.firstName || 'Usuario');
      setRegLastName(userData.lastName || '');
      setAuthView('register_page');
    } else {
      onLoginSuccess(userData); // ahora sí con el usuario completo y bien formado
    }
  };

  // Helper to resolve role and log user in based on email
  const resolveLoginByEmail = (email: string) => {
    const emailLower = email.toLowerCase();
    if (emailLower.includes('j.osorio') || emailLower.includes('asesor')) {
      onLoginSuccess({ ...DEMO_PROFILES.asesor, email });
    } else if (emailLower.includes('e.restrepo') || emailLower.includes('calidad')) {
      onLoginSuccess({ ...DEMO_PROFILES.calidad, email });
    } else if (emailLower.includes('m.quintero') || emailLower.includes('admin') || emailLower.includes('bodega')) {
      onLoginSuccess({ ...DEMO_PROFILES.administrador, email });
    } else {
      onLoginSuccess({
        ...DEMO_PROFILES.cliente,
        email,
        name: emailLower.includes('constructor') ? 'Carlos Mendoza' : email.split('@')[0].toUpperCase(),
        firstName: emailLower.includes('constructor') ? 'Carlos' : email.split('@')[0]
      });
    }
  };

  // Quick Demo Account selection helper
  const handleSelectDemoAccount = (role: 'cliente' | 'asesor' | 'calidad' | 'administrador') => {
    const profile = DEMO_PROFILES[role];
    setUserEmail(profile.email);
    setUserPassword('ColorLink*2026');
    setAuthView('email_password');
    setShowDemoAccounts(false);
    setInfoNotice(`Credenciales cargadas para rol: ${role.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-[#0B1528] flex flex-col justify-between p-4 sm:p-6 lg:p-10 font-sans relative overflow-hidden selection:bg-emerald-500 selection:text-white">

      {/* Background Graphic Ambient Lighting */}
      <div className="absolute -top-32 -left-32 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-6xl w-full mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10 py-4">

        {/* ========================================================================= */}
        {/* LEFT COLUMN: Presentation & Rotating Image (Clean, without any badge)     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col justify-center items-center lg:items-start text-center lg:text-left space-y-6">

          {/* Brand Logo Header */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-emerald-500/20">
                <Droplet className="w-6 h-6 fill-slate-950 text-slate-950" />
              </div>
              <div className="text-left">
                <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  COLOR<span className="text-emerald-400">LINK</span>
                </span>
                <span className="text-[10px] block font-bold text-slate-400 tracking-wider uppercase">
                  Pinturas & Recubrimientos
                </span>
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
              Ingeniería en color y protección para grandes obras
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-lg leading-relaxed">
              Plataforma técnica para cotización de cuñetes, tintometría computarizada y despacho de recubrimientos en el Valle de Aburrá.
            </p>
          </div>

          {/* Pure Rotating Presentation Image: Pure image, no text badge overlay */}
          <div className="w-full max-w-md rounded-3xl overflow-hidden shadow-2xl border border-slate-700/80 bg-slate-900 group">
            <img
              src={PRESENTATION_IMAGES[imageIndex]}
              alt="ColorLink Recubrimientos Arquitectónicos"
              className="w-full h-64 sm:h-72 object-cover object-center group-hover:scale-105 transition-all duration-700 brightness-95"
            />
          </div>

        </div>

        {/* ========================================================================= */}
        {/* RIGHT COLUMN: Auth Card retaining original Dark Navy/Emerald Styling     */}
        {/* ========================================================================= */}
        <div className="lg:col-span-6 flex flex-col items-center">

          <div className="w-full max-w-md bg-slate-900/95 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-800 text-white space-y-5 relative">

            {/* Top User Icon matching structure in dark theme */}
            <div className="flex flex-col items-center text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center">
                <User className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase">
                  {authView === 'register_page' ? 'Registro Corporativo' : 'Inicia Sesión o Regístrate'}
                </h2>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {authView === 'register_page'
                    ? 'Completa los datos de tu empresa para cotizar y comprar'
                    : 'Escoge una opción para ingresar'}
                </p>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 bg-red-950/50 border border-red-800/80 text-red-200 text-xs rounded-xl font-medium flex items-center gap-2 animate-in fade-in duration-200">
                <HelpCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Information Notice / Redirect Notice */}
            {infoNotice && (
              <div className="p-3 bg-blue-950/50 border border-blue-800/80 text-blue-200 text-xs rounded-xl font-medium flex items-start gap-2 animate-in fade-in duration-200">
                <Info className="w-4 h-4 shrink-0 text-blue-400 mt-0.5" />
                <span className="leading-relaxed">{infoNotice}</span>
              </div>
            )}

            {/* =================================================================== */}
            {/* VIEW 1: MAIN OPTIONS (Preserving Dark Navy & Emerald Palette)       */}
            {/* =================================================================== */}
            {authView === 'main_menu' && (
              <div className="space-y-3 pt-1">

                {/* 1. RECIBIR CÓDIGO DE ACCESO POR E-MAIL */}
                <button
                  id="btn-option-email-code"
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setInfoNotice('');
                    setAuthView('email_code');
                  }}
                  className="w-full py-3.5 px-4 bg-transparent hover:bg-slate-800/90 text-emerald-400 font-black text-xs sm:text-sm rounded-xl border-2 border-emerald-500/60 hover:border-emerald-400 cursor-pointer transition-all shadow-xs flex items-center justify-center uppercase tracking-wide"
                >
                  Recibir código de acceso por e-mail
                </button>

                {/* 2. ENTRAR CON E-MAIL Y CONTRASEÑA */}
                <button
                  id="btn-option-email-password"
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setInfoNotice('');
                    setAuthView('email_password');
                  }}
                  className="w-full py-3.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-xl cursor-pointer transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center uppercase tracking-wide hover:scale-[1.01]"
                >
                  Entrar con e-mail y contraseña
                </button>

                {/* 3. ENTRAR CON GOOGLE (Ventana Emergente SSO Real) */}
                <button
                  id="btn-option-google"
                  type="button"
                  onClick={() => handleOpenSSOPopup('google')}
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700/80 cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2.5 hover:border-slate-500"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M12 5c1.54 0 2.93.56 4.02 1.48l3.01-3.01C17.21 1.77 14.77 1 12 1 7.51 1 3.67 3.56 1.73 7.28l3.66 2.84C6.27 7.04 8.89 5 12 5z" />
                    <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.66 2.84c2.14-1.98 3.76-4.9 3.76-8.66z" />
                    <path fill="#FBBC05" d="M5.39 14.88C5.14 13.99 5 13.01 5 12s.14-1.99.39-2.88L1.73 6.28C.63 8.47 0 10.92 0 12s.63 3.53 1.73 5.72l3.66-2.84z" />
                    <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.66-2.84c-1.07.72-2.45 1.16-4.27 1.16-3.11 0-5.73-2.04-6.61-5.12L1.73 16.12C3.67 19.84 7.51 23 12 23z" />
                  </svg>
                  <span>Entrar con <strong className="text-white">Google</strong></span>
                </button>

                {/* 4. ENTRAR CON MICROSOFT (Ventana Emergente SSO Real) */}
                <button
                  id="btn-option-microsoft"
                  type="button"
                  onClick={() => handleOpenSSOPopup('microsoft')}
                  className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-slate-200 font-bold text-xs sm:text-sm rounded-xl border border-slate-700/80 cursor-pointer transition-all shadow-xs flex items-center justify-center gap-2.5 hover:border-slate-500"
                >
                  <svg className="w-4 h-4" viewBox="0 0 23 23">
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span>Entrar con <strong className="text-white">Microsoft</strong></span>
                </button>

              </div>
            )}

            {/* =================================================================== */}
            {/* VIEW 2: EMAIL FOR CODE (Dark Mode styling)                         */}
            {/* =================================================================== */}
            {authView === 'email_code' && (
              <form onSubmit={handleConfirmEmailCode} className="space-y-4 pt-1 animate-in fade-in duration-200">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-300 block text-center">
                    Recibir código de acceso por e-mail
                  </label>
                  <input
                    id="input-code-email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="exemplo@e-mail.com"
                    className="w-full px-4 py-3 bg-slate-950 text-white placeholder-slate-500 rounded-xl text-sm border-2 border-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
                    required
                    autoFocus
                  />
                  <p className="text-[11px] text-slate-400 text-center">
                    Te enviaremos un código de seguridad para verificar tu correo. Si tu empresa aún no está registrada, podrás completar tus datos inmediatamente.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setAuthView('main_menu');
                    }}
                    className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1 py-2 px-1"
                  >
                    <span>← Volver</span>
                  </button>

                  <button
                    id="btn-confirm-email-code"
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-2"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Enviar Código</span>}
                  </button>
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* VIEW 3: VERIFY OTP CODE (Simple & Limpio)                           */}
            {/* =================================================================== */}
            {authView === 'verify_otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4 pt-1 animate-in fade-in duration-200">
                <div className="space-y-3 text-center">
                  <div className="w-12 h-12 mx-auto rounded-2xl bg-emerald-950/60 border border-emerald-800/80 flex items-center justify-center text-emerald-400 shadow-inner">
                    <Mail className="w-6 h-6" />
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-black text-white">Verificación por Código</h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ingresa el código de 6 dígitos enviado a:
                    </p>
                    <div className="mt-1.5 text-xs font-mono font-bold text-emerald-400 bg-slate-950 py-1 px-3 rounded-lg border border-slate-800 inline-block">
                      {userEmail}
                    </div>
                  </div>

                  <div className="py-2">
                    <input
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                      placeholder="------"
                      className="w-full max-w-[240px] mx-auto block py-3 px-4 bg-slate-950 text-emerald-400 font-mono tracking-[0.45em] text-center text-2xl font-black rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all placeholder:text-slate-600"
                      required
                      autoFocus
                    />
                    <div className="flex items-center justify-center gap-2 mt-2.5">
                      <span className="text-[11px] text-slate-400">¿No recibiste el correo?</span>
                      <button
                        type="button"
                        onClick={handleResendOtp}
                        disabled={resendCooldown > 0 || isLoading}
                        className="text-[11px] font-bold text-emerald-400 hover:underline disabled:text-slate-500 cursor-pointer"
                      >
                        {resendCooldown > 0 ? `Reenviar en ${resendCooldown}s` : 'Reenviar código'}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400">
                    Revisa tu bandeja de entrada o spam. Si ya estás registrado entrarás directo, sino registrarás tu empresa.
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setAuthView('email_code');
                    }}
                    className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer"
                  >
                    <span>← Cambiar Correo</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading || otpCode.length < 4}
                    className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Validar & Entrar</span>}
                  </button>
                </div>
              </form>
            )}

            {/* =================================================================== */}
            {/* VIEW 4: EMAIL & PASSWORD LOGIN                                      */}
            {/* =================================================================== */}
            {authView === 'email_password' && (
              <form onSubmit={handleLoginWithPassword} className="space-y-3.5 pt-1 animate-in fade-in duration-200">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Correo Electrónico
                  </label>
                  <input
                    id="input-password-email"
                    type="email"
                    value={userEmail}
                    onChange={(e) => setUserEmail(e.target.value)}
                    placeholder="tu-correo@empresa.com"
                    className="w-full px-3.5 py-2.5 bg-slate-950 text-white placeholder-slate-500 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-emerald-500"
                    required
                    autoFocus
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300 block">
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={userPassword}
                      onChange={(e) => setUserPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3.5 py-2.5 bg-slate-950 text-white placeholder-slate-500 rounded-xl text-xs border border-slate-700 focus:outline-none focus:border-emerald-500 pr-10"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setAuthView('main_menu');
                    }}
                    className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>← Volver</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-6 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl uppercase tracking-wider cursor-pointer shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Ingresar</span>}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <button
                    type="button"
                    onClick={() => { setAuthView('forgot_email'); setErrorMessage(''); }}
                    className="text-[11px] text-slate-400 hover:text-emerald-400 hover:underline"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>
              </form>
            )}

            {authView === 'forgot_email' && (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                <h3 className="font-bold text-sm text-white">Recuperar contraseña</h3>
                <p className="text-xs text-slate-400">Ingresa tu correo y te enviaremos un código para restablecerla.</p>
                <input
                  type="email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="tu-correo@empresa.com"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                />
                {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
                <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl">
                  {isLoading ? 'Enviando...' : 'Enviar código'}
                </button>
                <button type="button" onClick={() => setAuthView('email_password')} className="text-xs text-emerald-400 hover:underline">
                  ← Volver
                </button>
              </form>
            )}

            {authView === 'forgot_code' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <h3 className="font-bold text-sm text-white">Ingresa el código y tu nueva contraseña</h3>
                {forgotMessage && <p className="text-xs text-emerald-400">{forgotMessage}</p>}
                <input
                  type="text"
                  value={forgotCode}
                  onChange={(e) => setForgotCode(e.target.value)}
                  placeholder="Código de 6 dígitos"
                  maxLength={6}
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                />
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nueva contraseña (mínimo 8 caracteres)"
                  required
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white rounded-xl border border-slate-700 text-xs focus:outline-none focus:border-emerald-500"
                />
                {errorMessage && <p className="text-xs text-red-400">{errorMessage}</p>}
                <button type="submit" disabled={isLoading} className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl">
                  {isLoading ? 'Actualizando...' : 'Restablecer contraseña'}
                </button>
              </form>
            )}

            {/* =================================================================== */}
            {/* VIEW 5: FULL REGISTRATION PAGE WITH PRE-FILLED EMAIL                */}
            {/* =================================================================== */}
            {authView === 'register_page' && (
              <form onSubmit={handleCompleteRegister} className="space-y-3.5 max-h-[460px] overflow-y-auto pr-1 animate-in fade-in duration-200">

                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Nombres *</label>
                    <input
                      type="text"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      placeholder="Carlos"
                      className="w-full px-2.5 py-1.5 bg-slate-950 text-xs rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Apellidos *</label>
                    <input
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      placeholder="Mendoza"
                      className="w-full px-2.5 py-1.5 bg-slate-950 text-xs rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-300 block mb-1">Contraseña *</label>
                  <input
                    type="password"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Mínimo 8 caracteres"
                    minLength={8}
                    className="w-full px-2.5 py-1.5 bg-slate-950 text-xs rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
                {/* Company Information */}
                <div className="p-3 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-2.5">
                  <span className="text-[10px] font-black text-emerald-400 uppercase tracking-wider block">
                    Datos Corporativos para Facturación & Despacho
                  </span>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">Razón Social *</label>
                      <input
                        type="text"
                        value={regCompany}
                        onChange={(e) => setRegCompany(e.target.value)}
                        placeholder="Constructora Horizonte S.A.S."
                        className="w-full px-2.5 py-1.5 bg-slate-900 text-xs rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">NIT / C.C. *</label>
                      <input
                        type="text"
                        value={regNit}
                        onChange={(e) => setRegNit(e.target.value)}
                        placeholder="901.458.789-3"
                        className="w-full px-2.5 py-1.5 bg-slate-900 text-xs rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-300 block mb-1">Dirección de Despacho en Obra *</label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="Calle 10A # 36-24, El Poblado"
                      className="w-full px-2.5 py-1.5 bg-slate-900 text-xs rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">Ciudad / Municipio</label>
                      <select
                        value={regCity}
                        onChange={(e) => setRegCity(e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-900 text-xs rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      >
                        <option value="Medellín">Medellín</option>
                        <option value="Envigado">Envigado</option>
                        <option value="Itagüí">Itagüí</option>
                        <option value="Sabaneta">Sabaneta</option>
                        <option value="Bello">Bello</option>
                        <option value="Rionegro">Rionegro</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-300 block mb-1">Teléfono Obra</label>
                      <input
                        type="text"
                        value={regPhone}
                        onChange={(e) => setRegPhone(e.target.value)}
                        placeholder="+57 314 789-2045"
                        className="w-full px-2.5 py-1.5 bg-slate-900 text-xs rounded-lg border border-slate-700 text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setErrorMessage('');
                      setAuthView('main_menu');
                    }}
                    className="text-xs font-bold text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>← Volver</span>
                  </button>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Completar Registro</span>}
                  </button>
                </div>

              </form>
            )}

            {/* Quick Helper Toggle for Demo Accounts */}
            <div className="pt-2 border-t border-slate-800 text-center">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="text-[11px] font-bold text-slate-400 hover:text-emerald-400 inline-flex items-center gap-1 cursor-pointer transition-colors"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>{showDemoAccounts ? 'Ocultar cuentas de prueba' : 'Ver cuentas y roles de prueba para validar inicios'}</span>
              </button>
            </div>

            {/* Demo Accounts Panel */}
            {showDemoAccounts && (
              <div className="p-3 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2 animate-in fade-in duration-200">
                <span className="text-[10px] font-black uppercase text-slate-400 block">
                  Haz clic para auto-llenar credenciales por rol:
                </span>

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('cliente')}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <span className="font-extrabold text-[11px] text-emerald-400 block">👷 Cliente / Obra</span>
                    <span className="text-[10px] text-slate-400 block truncate">proyectos@constructorahorizonte.com.co</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('asesor')}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <span className="font-extrabold text-[11px] text-emerald-400 block">📐 Asesor Comercial</span>
                    <span className="text-[10px] text-slate-400 block truncate">j.osorio@colorlink.com.co</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('calidad')}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <span className="font-extrabold text-[11px] text-emerald-400 block">🧪 Calidad & Lab</span>
                    <span className="text-[10px] text-slate-400 block truncate">e.restrepo@colorlink.com.co</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('administrador')}
                    className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-emerald-500/40 rounded-xl text-left cursor-pointer transition-colors"
                  >
                    <span className="font-extrabold text-[11px] text-emerald-400 block">🏢 Admin & Bodega</span>
                    <span className="text-[10px] text-slate-400 block truncate">m.quintero@colorlink.com.co</span>
                  </button>
                </div>

                <div className="text-[10px] text-slate-400 bg-slate-900 p-2 rounded-lg border border-slate-800">
                  <strong>Contraseña común para todos los roles:</strong> <code className="font-bold text-emerald-400">ColorLink*2026</code>
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

      {/* Clean Copyright Footer */}
      <div className="text-center text-slate-500 text-[11px] pt-4 z-10">
        Copyright 2026 © Derechos Reservados • COLORLINK S.A.S. • Valle de Aburrá, Colombia
      </div>

    </div>
  );
};
