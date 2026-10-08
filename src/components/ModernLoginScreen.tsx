import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { DEMO_PROFILES } from '../data/mockData';
import {
  HelpCircle,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  CheckCircle2,
  Info,
  Mail,
  ArrowLeft,
  X
} from 'lucide-react';

interface ModernLoginScreenProps {
  onLoginSuccess: (user: UserProfile) => void;
  onClose?: () => void;
  checkoutNotice?: boolean;
}

type AuthView = 'main_menu' | 'email_code' | 'verify_otp' | 'register_page' | 'forgot_password';

export const ModernLoginScreen: React.FC<ModernLoginScreenProps> = ({
  onLoginSuccess,
  onClose,
  checkoutNotice
}) => {
  const [authView, setAuthView] = useState<AuthView>('main_menu');

  // Credentials Form State
  const [userEmail, setUserEmail] = useState('');
  const [userPassword, setUserPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  // Register Form Fields
  const [regFirstName, setRegFirstName] = useState('');
  const [regLastName, setRegLastName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCompany, setRegCompany] = useState('');
  const [regNit, setRegNit] = useState('');
  const [regAddress, setRegAddress] = useState('');
  const [regCity, setRegCity] = useState('Medellín');
  const [regPhone, setRegPhone] = useState('');
  const [regPassword, setRegPassword] = useState(''); // NUEVO: contraseña real, ya no se inventa una por defecto
  const [personType, setPersonType] = useState<'natural' | 'juridica'>('natural');
  const [regDocType, setRegDocType] = useState('CC');
  const [regTaxRegime, setRegTaxRegime] = useState<'comun' | 'simplificado' | 'gran_contribuyente'>('comun');

  // Status & Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoNotice, setInfoNotice] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showDemoAccounts, setShowDemoAccounts] = useState(false);
  const [forgotSent, setForgotSent] = useState(false);

  // Escucha el resultado real de Google (postMessage desde /auth/callback en tu backend)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'OAUTH_AUTH_SUCCESS' && event.data?.user) {
        const { needsProfile, ...userData } = event.data.user;
        if (needsProfile) {
          // El backend ya creó la cuenta pero falta el perfil de empresa
          setUserEmail(userData.email);
          setRegEmail(userData.email);
          setRegFirstName(userData.firstName || 'Cliente');
          setRegLastName(userData.lastName || '');
          setInfoNotice(`Cuenta de Google (${userData.email}) validada. Completa los datos de tu empresa.`);
          setAuthView('register_page');
        } else {
          onLoginSuccess(userData);
        }
      }
      if (event.data?.type === 'OAUTH_AUTH_ERROR') {
        setErrorMessage(event.data.error || 'No se pudo completar la autenticación con Google.');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Resend OTP cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  // Action: Open Google SSO Popup
  const handleOpenGooglePopup = async () => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch(`/api/auth/oauth-url/google?origin=${encodeURIComponent(window.location.origin)}`);
      const data = await res.json();
      if (data.success && data.url) {
        const popup = window.open(
          data.url,
          'sso_google_popup',
          'width=500,height=640,left=350,top=80,toolbar=no,menubar=no,status=no'
        );
        if (!popup) {
          setErrorMessage('Tu navegador bloqueó la ventana emergente. Por favor permite popups para iniciar con Google.');
        }
      } else {
        setErrorMessage(data.error || 'Google OAuth no está disponible en este momento.');
      }
    } catch {
      setErrorMessage('No se pudo conectar con el servidor de autenticación. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Action: Confirm email to receive OTP
  const handleRequestEmailCode = async (targetEmail?: string) => {
    const emailToSend = targetEmail || userEmail;
    if (!emailToSend.trim()) {
      setErrorMessage('Por favor escribe tu correo electrónico.');
      return;
    }

    const emailLower = emailToSend.trim().toLowerCase();
    setUserEmail(emailLower);
    setErrorMessage('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower })
      });

      const data = await res.json();

      if (data.success) {
        setInfoNotice(data.message || `Código enviado a ${emailLower}. Revisa tu bandeja de entrada o spam.`);
        setResendCooldown(45);
        setAuthView('verify_otp');
      } else {
        setErrorMessage(data.error || 'No se pudo enviar el código.');
      }
    } catch {
      setErrorMessage('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    setErrorMessage('');
    if (!userEmail.trim()) {
      setErrorMessage('Escribe el correo de tu cuenta.');
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail.trim().toLowerCase() })
      });
      const data = await res.json();
      if (data.success) {
        setForgotSent(true);
        setInfoNotice(data.message);
      } else {
        setErrorMessage(data.error || 'No se pudo procesar la solicitud.');
      }
    } catch {
      setErrorMessage('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Action: Verify OTP Code
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim()) {
      setErrorMessage('Por favor digita el código de 6 dígitos.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    const emailLower = userEmail.trim().toLowerCase();

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailLower, code: otpCode.trim() })
      });

      const data = await response.json();

      if (data.success && data.isRegistered && data.user) {
        onLoginSuccess(data.user);
        return;
      }

      if (data.success && !data.isRegistered) {
        // Código correcto, pero aún no tiene cuenta: completa el registro
        extractEmailDetails(emailLower);
        setInfoNotice(`Correo ${emailLower} verificado con éxito. Completa los datos de tu empresa para terminar.`);
        setAuthView('register_page');
        return;
      }

      setErrorMessage(data.error || 'Código incorrecto o expirado.');
    } catch {
      setErrorMessage('No se pudo verificar el código. Revisa tu conexión e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Action: Standard Email & Password Submit
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

      if (data.notRegistered) {
        extractEmailDetails(emailLower);
        setInfoNotice(`El correo "${emailLower}" aún no tiene una cuenta. Completa el formulario para registrarte.`);
        setAuthView('register_page');
        return;
      }

      setErrorMessage(data.error || 'Correo o contraseña incorrectos.');
    } catch {
      setErrorMessage('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Helper to extract company info from corporate email (solo pre-llena el formulario, no crea cuentas)
  const extractEmailDetails = (email: string) => {
    setUserEmail(email);
    setRegEmail(email);

    const parts = email.split('@');
    const localPart = parts[0] || '';
    const domainPart = parts[1] || '';

    const nameParts = localPart.split(/[._-]/);
    const fName = nameParts[0] ? nameParts[0].charAt(0).toUpperCase() + nameParts[0].slice(1) : '';
    const lName = nameParts[1] ? nameParts[1].charAt(0).toUpperCase() + nameParts[1].slice(1) : '';

    setRegFirstName(fName);
    setRegLastName(lName);

    if (domainPart && !['gmail.com', 'hotmail.com', 'outlook.com', 'yahoo.com', 'icloud.com'].includes(domainPart)) {
      const compName = domainPart.split('.')[0];
      setRegCompany(`${compName.charAt(0).toUpperCase() + compName.slice(1)} S.A.S.`);
    }
  };

  const validarRegistro = (): string | null => {
    const soloLetras = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,30}$/;
    const soloNumeros = /^[0-9]{6,12}$/;
    const telefono = /^\+?[0-9\s-]{7,15}$/;

    if (!soloLetras.test(regFirstName.trim())) return 'El nombre solo debe contener letras (2-30 caracteres).';
    if (!soloLetras.test(regLastName.trim())) return 'El apellido solo debe contener letras (2-30 caracteres).';
    if (!soloNumeros.test(regNit.replace(/[.\-]/g, ''))) return 'El documento/NIT debe tener solo números (6-12 dígitos).';
    if (!telefono.test(regPhone.trim())) return 'El teléfono no tiene un formato válido.';
    if (personType === 'juridica' && regCompany.trim().length < 3) return 'La razón social debe tener al menos 3 caracteres.';
    if (regPassword.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    return null;
  };

  // Action: Complete Corporate Registration
  const handleCompleteRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    const errorValidacion = validarRegistro();
    if (errorValidacion) {
      setErrorMessage(errorValidacion);
      return;
    }

    if (!regPassword || regPassword.length < 8) {
      setErrorMessage('Define una contraseña de al menos 8 caracteres para tu cuenta.');
      return;
    }

    setIsLoading(true);
    const emailLower = (regEmail || userEmail).trim().toLowerCase();

    try {
      const payload = {
        firstName: regFirstName,
        lastName: regLastName,
        email: emailLower,
        company: regCompany,
        documentId: regNit,
        address: regAddress,
        city: regCity,
        phone: regPhone,
        password: regPassword
      };

      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (data.success && data.user) {
        onLoginSuccess(data.user);
        return;
      }

      setErrorMessage(data.error || 'No se pudo completar el registro.');
    } catch {
      setErrorMessage('No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Perfiles demo: solo pre-llena el formulario de login con contraseña — sigue pasando por el backend real
  const handleSelectDemoAccount = (role: 'cliente' | 'asesor' | 'calidad' | 'administrador') => {
    const profile = DEMO_PROFILES[role];
    setUserEmail(profile.email);
    setUserPassword('ColorLink*2026');
    setShowDemoAccounts(false);
    setInfoNotice(`Credenciales de prueba cargadas para rol: ${role.toUpperCase()}. Estas cuentas deben existir realmente en tu base de datos.`);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 font-sans selection:bg-[#002855] selection:text-white">

      {/* Checkout notice if launched from checkout */}
      {checkoutNotice && (
        <div className="max-w-md w-full mb-3 bg-amber-50 text-amber-900 border border-amber-300 text-xs px-4 py-2.5 rounded-xl font-bold flex items-center justify-between shadow-sm">
          <span>🛒 Inicia sesión para completar tu compra y asegurar tus materiales</span>
        </div>
      )}

      {/* Main Clean Card */}
      <div className="w-full max-w-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 p-8 sm:p-10 relative">

        {/* Close button if modal */}
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Header */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-full border-2 border-[#002855] text-[#002855] flex items-center justify-center mb-3">
            <User className="w-7 h-7 stroke-[2]" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-[#002855] tracking-tight uppercase">
            {authView === 'register_page' ? 'REGISTRO CORPORATIVO' : 'INICIA SESIÓN O REGÍSTRATE'}
          </h2>
          <p className="text-sm text-slate-600 font-semibold mt-1">
            {authView === 'register_page'
              ? 'Completa los datos de tu empresa'
              : 'Escoge una opción para ingresar'}
          </p>
        </div>

        {/* Feedback Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-medium flex items-center gap-2">
            <HelpCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {infoNotice && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 text-blue-800 text-xs rounded-xl font-medium flex items-start gap-2">
            <Info className="w-4 h-4 shrink-0 text-blue-500 mt-0.5" />
            <span className="leading-relaxed">{infoNotice}</span>
          </div>
        )}

        {/* =================================================================== */}
        {/* MAIN VIEW */}
        {/* =================================================================== */}
        {authView === 'main_menu' && (
          <div className="space-y-4">

            <button
              type="button"
              onClick={() => {
                if (userEmail.trim()) {
                  handleRequestEmailCode(userEmail);
                } else {
                  setAuthView('email_code');
                }
              }}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-[#002855] font-black text-xs sm:text-sm rounded-lg border-2 border-[#002855] cursor-pointer transition-colors uppercase tracking-wider flex items-center justify-center text-center shadow-xs"
            >
              RECIBIR CÓDIGO DE ACCESO POR E-MAIL
            </button>

            <button
              type="button"
              onClick={handleOpenGooglePopup}
              disabled={isLoading}
              className="w-full py-3.5 px-4 bg-white hover:bg-slate-50 text-[#002855] font-black text-xs sm:text-sm rounded-lg border-2 border-[#002855] cursor-pointer transition-colors tracking-wider flex items-center justify-center gap-3 text-center shadow-xs"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58l3.66 2.84c2.14-1.98 3.76-4.9 3.76-8.66z" />
                <path fill="#34A853" d="M12 23c3.24 0 5.95-1.08 7.93-2.91l-3.66-2.84c-1.07.72-2.45 1.16-4.27 1.16-3.11 0-5.73-2.04-6.61-5.12L1.73 16.12C3.67 19.84 7.51 23 12 23z" />
                <path fill="#FBBC05" d="M5.39 14.88C5.14 13.99 5 13.01 5 12s.14-1.99.39-2.88L1.73 6.28C.63 8.47 0 10.92 0 12s.63 3.53 1.73 5.72l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5c1.54 0 2.93.56 4.02 1.48l3.01-3.01C17.21 1.77 14.77 1 12 1 7.51 1 3.67 3.56 1.73 7.28l3.66 2.84C6.27 7.04 8.89 5 12 5z" />
              </svg>
              <span>ENTRAR CON <strong className="font-black">GOOGLE</strong></span>
            </button>

            <div className="pt-2 text-center">
              <span className="text-xs font-bold text-slate-700">
                Ingresar con e-mail y contraseña
              </span>
            </div>

            <form onSubmit={handleLoginWithPassword} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="exemplo@e-mail.com"
                  className="w-full px-3.5 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-lg text-sm border border-slate-300 focus:outline-none focus:border-[#002855] focus:ring-1 focus:ring-[#002855] transition-all"
                  required
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={userPassword}
                  onChange={(e) => setUserPassword(e.target.value)}
                  placeholder="contraseña"
                  className="w-full px-3.5 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-lg text-sm border border-slate-300 focus:outline-none focus:border-[#002855] focus:ring-1 focus:ring-[#002855] transition-all pr-10"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              <div className="text-center pt-1">
                <button
                  type="button"
                  onClick={() => setAuthView('forgot_password')}
                  className="text-xs text-[#002855] underline hover:text-blue-900 font-medium cursor-pointer"
                >
                  Olvidé mi contraseña
                </button>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 bg-[#002855] hover:bg-[#001D3D] active:scale-98 text-white font-black text-sm rounded-lg shadow-md transition-all cursor-pointer uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>INGRESAR</span>}
              </button>
            </form>

            <div className="text-center pt-2">
              <span className="text-xs text-slate-600 font-medium">¿No tiene una cuenta? </span>
              <button
                type="button"
                onClick={() => {
                  extractEmailDetails(userEmail);
                  setAuthView('register_page');
                }}
                className="text-xs font-bold text-[#002855] hover:underline cursor-pointer"
              >
                Regístrese
              </button>
            </div>

            <div className="border-t border-slate-100 pt-3 text-center">
              <button
                type="button"
                onClick={() => setShowDemoAccounts(!showDemoAccounts)}
                className="text-[11px] text-slate-400 hover:text-slate-600 font-medium"
              >
                {showDemoAccounts ? 'Ocultar Cuentas Demo' : 'Acceso Rápido con Perfiles Demo'}
              </button>

              {showDemoAccounts && (
                <div className="mt-2 grid grid-cols-2 gap-1.5 text-[10px]">
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('cliente')}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    🏗️ Cliente Constructora
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('asesor')}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    👔 Asesor Comercial
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('calidad')}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    🔍 Perito Calidad
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSelectDemoAccount('administrador')}
                    className="p-1.5 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold"
                  >
                    📦 Administrador Bodega
                  </button>
                </div>
              )}
            </div>

          </div>
        )}

        {/* =================================================================== */}
        {/* EMAIL FOR OTP CODE VIEW */}
        {/* =================================================================== */}
        {authView === 'email_code' && (
          <form onSubmit={(e) => { e.preventDefault(); handleRequestEmailCode(); }} className="space-y-4">
            <div className="text-center space-y-1">
              <h3 className="text-sm font-bold text-slate-800">Recibir código de acceso por e-mail</h3>
              <p className="text-xs text-slate-500">
                Escribe tu correo y te enviaremos un código de seguridad sin necesidad de recordar contraseña.
              </p>
            </div>

            <div>
              <input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                placeholder="exemplo@e-mail.com"
                className="w-full px-3.5 py-3 bg-white text-slate-800 placeholder-slate-400 rounded-lg text-sm border border-slate-300 focus:outline-none focus:border-[#002855]"
                required
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setAuthView('main_menu')}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver</span>
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="py-2.5 px-5 bg-[#002855] hover:bg-[#001D3D] text-white font-black text-xs rounded-lg uppercase tracking-wider cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Enviar Código</span>}
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* VERIFY 6-DIGIT OTP CODE VIEW */}
        {/* =================================================================== */}
        {authView === 'verify_otp' && (
          <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-blue-50 text-[#002855] flex items-center justify-center">
              <Mail className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-800">Código de Verificación</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Digita el código de 6 dígitos que enviamos a:
              </p>
              <div className="text-xs font-mono font-bold text-[#002855] mt-1 bg-slate-100 py-1 px-3 rounded-md inline-block">
                {userEmail}
              </div>
            </div>

            <div>
              <input
                type="text"
                maxLength={6}
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                placeholder="------"
                className="w-48 mx-auto block py-2.5 px-3 bg-white text-[#002855] font-mono tracking-[0.4em] text-center text-2xl font-black rounded-lg border-2 border-slate-300 focus:outline-none focus:border-[#002855]"
                required
                autoFocus
              />

              <div className="flex items-center justify-center gap-1.5 mt-2">
                <span className="text-[11px] text-slate-500">¿No lo recibiste?</span>
                <button
                  type="button"
                  onClick={() => handleRequestEmailCode()}
                  disabled={resendCooldown > 0 || isLoading}
                  className="text-[11px] font-bold text-[#002855] hover:underline disabled:text-slate-400 cursor-pointer"
                >
                  {resendCooldown > 0 ? `Reenviar (${resendCooldown}s)` : 'Reenviar'}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3">
              <button
                type="button"
                onClick={() => setAuthView('main_menu')}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver</span>
              </button>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 4}
                className="py-2.5 px-6 bg-[#002855] hover:bg-[#001D3D] disabled:opacity-50 text-white font-black text-xs rounded-lg uppercase tracking-wider cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Validar & Entrar</span>}
              </button>
            </div>
          </form>
        )}

        {/* =================================================================== */}
        {/* FORGOT PASSWORD VIEW (te loguea vía código OTP, no resetea contraseña todavía) */}
        {/* =================================================================== */}
        {authView === 'forgot_password' && (
          <div className="space-y-4 text-center">
            <h3 className="text-sm font-bold text-slate-800">Recuperar contraseña</h3>
            {forgotSent ? (
              <>
                <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Mail className="w-6 h-6" />
                </div>
                <p className="text-xs text-slate-600">
                  Revisa tu bandeja de entrada (y el spam). El enlace es válido por 30 minutos.
                </p>
                <button
                  type="button"
                  onClick={() => { setForgotSent(false); setInfoNotice(''); setAuthView('main_menu'); }}
                  className="text-xs font-bold text-[#002855] hover:underline cursor-pointer"
                >
                  Volver al inicio de sesión
                </button>
              </>
            ) : (
              <>
                <p className="text-xs text-slate-600">
                  Escribe el correo de tu cuenta y te enviaremos un enlace para crear una contraseña nueva.
                </p>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="exemplo@e-mail.com"
                  className="w-full px-3.5 py-3 bg-white text-slate-800 rounded-lg text-sm border border-slate-300 focus:outline-none focus:border-[#002855]"
                />
                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => { setInfoNotice(''); setAuthView('main_menu'); }}
                    className="text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
                  >
                    Volver
                  </button>
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={isLoading}
                    className="py-2.5 px-4 bg-[#002855] text-white font-bold text-xs rounded-lg cursor-pointer"
                  >
                    {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Enviar enlace</span>}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* =================================================================== */}
        {/* CUSTOMER & CORPORATE REGISTRATION VIEW */}
        {/* =================================================================== */}
        {authView === 'register_page' && (
          <form onSubmit={handleCompleteRegister} className="space-y-3 max-h-[460px] overflow-y-auto pr-1">

            <div className="bg-slate-100 p-1 rounded-xl grid grid-cols-2 gap-1 text-xs font-bold mb-2">
              <button
                type="button"
                onClick={() => setPersonType('natural')}
                className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${personType === 'natural'
                  ? 'bg-[#002855] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                👤 Persona Natural
              </button>
              <button
                type="button"
                onClick={() => setPersonType('juridica')}
                className={`py-1.5 px-2 rounded-lg text-center transition-all cursor-pointer ${personType === 'juridica'
                  ? 'bg-[#002855] text-white shadow-xs font-black'
                  : 'text-slate-600 hover:text-slate-900'
                  }`}
              >
                🏢 Persona Jurídica
              </button>
            </div>

            {personType === 'natural' ? (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Nombres *</label>
                    <input
                      type="text"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      maxLength={15}
                      placeholder="Ej. Juan Carlos"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Apellidos *</label>
                    <input
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      maxLength={15}
                      placeholder="Ej. Gómez Pérez"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Tipo Doc</label>
                    <select
                      value={regDocType}
                      onChange={(e) => setRegDocType(e.target.value)}
                      className="w-full px-2 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855] bg-white"
                    >
                      <option value="CC">C.C.</option>
                      <option value="CE">C.E.</option>
                      <option value="PAS">Pasaporte</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Número de Documento *</label>
                    <input
                      type="text"
                      value={regNit}
                      onChange={(e) => setRegNit(e.target.value)}
                      maxLength={12}
                      placeholder="Ej. 1.020.345.678"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Correo Personal / Contacto *</label>
                  <input
                    type="email"
                    value={regEmail || userEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="tucorreo@gmail.com"
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Ciudad *</label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855] bg-white"
                    >
                      <option value="Medellín">Medellín</option>
                      <option value="Bogotá">Bogotá</option>
                      <option value="Itagüí">Itagüí</option>
                      <option value="Bello">Bello</option>
                      <option value="Envigado">Envigado</option>
                      <option value="Sabaneta">Sabaneta</option>
                      <option value="Rionegro">Rionegro</option>
                      <option value="Cali">Cali</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Celular / WhatsApp *</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      maxLength={10}
                      placeholder="+57 310 000-0000"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Dirección de Domicilio</label>
                  <input
                    type="text"
                    value={regAddress}
                    onChange={(e) => setRegAddress(e.target.value)}
                    placeholder="Ej. Calle 10 # 43E-28"
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                  />
                </div>
              </>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Razón Social de la Empresa *</label>
                    <input
                      type="text"
                      value={regCompany}
                      onChange={(e) => setRegCompany(e.target.value)}
                      placeholder="Constructora ABC S.A.S."
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">NIT con Dígito de Verificación *</label>
                    <input
                      type="text"
                      value={regNit}
                      onChange={(e) => setRegNit(e.target.value)}
                      placeholder="901.234.567-8"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Representante / Contacto *</label>
                    <input
                      type="text"
                      value={regFirstName}
                      onChange={(e) => setRegFirstName(e.target.value)}
                      maxLength={10}
                      placeholder="Ingeniero / Arquitecto"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Apellidos de Contacto *</label>
                    <input
                      type="text"
                      value={regLastName}
                      onChange={(e) => setRegLastName(e.target.value)}
                      maxLength={10}
                      placeholder="Residente de Obra"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Correo Corporativo *</label>
                  <input
                    type="email"
                    value={regEmail || userEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="compras@constructorabc.com"
                    className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Ciudad Fiscal / Obra *</label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855] bg-white"
                    >
                      <option value="Medellín">Medellín</option>
                      <option value="Bogotá">Bogotá</option>
                      <option value="Itagüí">Itagüí</option>
                      <option value="Bello">Bello</option>
                      <option value="Envigado">Envigado</option>
                      <option value="Rionegro">Rionegro</option>
                      <option value="Cali">Cali</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Régimen Tributario</label>
                    <select
                      value={regTaxRegime}
                      onChange={(e) => setRegTaxRegime(e.target.value as any)}
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855] bg-white"
                    >
                      <option value="comun">Régimen Común</option>
                      <option value="gran_contribuyente">Gran Contribuyente</option>
                      <option value="simplificado">Régimen Simplificado</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Dirección Fiscal / Obra</label>
                    <input
                      type="text"
                      value={regAddress}
                      onChange={(e) => setRegAddress(e.target.value)}
                      placeholder="Cra 43A # 18 Sur-135"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-700 block mb-0.5">PBX / Celular Obras *</label>
                    <input
                      type="tel"
                      value={regPhone}
                      onChange={(e) => setRegPhone(e.target.value)}
                      maxLength={10}
                      placeholder="+57 314 000-0000"
                      className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855]"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            {/* NUEVO: contraseña real y obligatoria, sin valor por defecto oculto */}
            <div>
              <label className="text-[10px] font-bold text-slate-700 block mb-0.5">Crea tu Contraseña *</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  minLength={8}
                  className="w-full px-2.5 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-[#002855] pr-9"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAuthView('main_menu')}
                className="text-xs font-bold text-slate-600 hover:text-slate-800 cursor-pointer"
              >
                Volver
              </button>

              <button
                type="submit"
                disabled={isLoading}
                className="py-2.5 px-6 bg-[#002855] hover:bg-[#001D3D] text-white font-black text-xs rounded-lg uppercase tracking-wider cursor-pointer"
              >
                {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Finalizar Registro</span>}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};