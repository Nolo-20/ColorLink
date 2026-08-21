import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Mail, 
  KeyRound, 
  Building2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Sparkles,
  Lock,
  Eye,
  EyeOff,
  RefreshCw
} from 'lucide-react';

interface AuthModuleProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onContinueToCapture: () => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({
  user,
  setUser,
  onContinueToCapture
}) => {
  const [authStep, setAuthStep] = useState<'method' | 'otp_verify' | 'profile_setup' | 'completed'>('completed');
  const [authMethod, setAuthMethod] = useState<'google' | 'email_otp'>('google');
  const [inputEmail, setInputEmail] = useState(user.email || 'proyectos@constructorahorizonte.com.co');
  const [otpCode, setOtpCode] = useState(['5', '4', '2', '8', '9', '0']);
  const [password, setPassword] = useState('ColorLink*2026');
  const [showPassword, setShowPassword] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // Profile Form state
  const [formData, setFormData] = useState({
    name: user.name || 'Ing. Carlos Mendoza',
    company: user.company || 'Constructora Horizonte S.A.S.',
    phone: user.phone || '+57 314 789 2045',
    city: user.city || 'Medellín',
    role: user.role || 'constructora'
  });

  const handleGoogleSignIn = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAuthMethod('google');
      setAuthStep('profile_setup');
    }, 600);
  };

  const handleSendEmailOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail) return;
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAuthMethod('email_otp');
      setAuthStep('otp_verify');
    }, 500);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setAuthStep('profile_setup');
    }, 600);
  };

  const handleCompleteProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setUser({
      ...user,
      id: user.id || `USR-${Math.floor(1000 + Math.random() * 9000)}`,
      name: formData.name,
      email: inputEmail,
      company: formData.company,
      phone: formData.phone,
      city: formData.city,
      role: formData.role as any,
      authMethod: authMethod,
      isRegistered: true,
    });
    setAuthStep('completed');
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Info */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-50 border border-cyan-200 text-cyan-800 text-xs font-semibold mb-3">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" />
          <span>Acceso Rápido y Seguro para Clientes & Contratistas</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Registro & Perfil en ColorLink
        </h1>
        <p className="text-slate-600 text-sm max-w-xl mx-auto mt-2">
          Autentícate en segundos con Google o correo con código para gestionar tus necesidades técnicas de pintura con trazabilidad completa.
        </p>
      </div>

      {/* Main Auth Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/50 overflow-hidden">
        
        {/* Step Indicator */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between max-w-md mx-auto">
            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                authStep === 'method' || authStep === 'otp_verify' ? 'bg-cyan-600 text-white' : 'bg-emerald-600 text-white'
              }`}>
                {authStep === 'profile_setup' || authStep === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : '1'}
              </span>
              <span className="text-xs font-semibold text-slate-700">Autenticación</span>
            </div>

            <div className="w-12 h-0.5 bg-slate-300"></div>

            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                authStep === 'profile_setup' ? 'bg-cyan-600 text-white' : authStep === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {authStep === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : '2'}
              </span>
              <span className="text-xs font-semibold text-slate-700">Contraseña & Perfil</span>
            </div>

            <div className="w-12 h-0.5 bg-slate-300"></div>

            <div className="flex items-center gap-2">
              <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                authStep === 'completed' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                3
              </span>
              <span className="text-xs font-semibold text-slate-700">Listo</span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-6 sm:p-8">
          {/* STEP 1: METHOD SELECTION */}
          {authStep === 'method' && (
            <div className="max-w-md mx-auto space-y-6">
              {/* Google Fast Login */}
              <button
                id="btn-auth-google"
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isVerifying}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-slate-300 rounded-xl bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm shadow-sm transition-all hover:border-slate-400"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>{isVerifying ? 'Conectando con Google...' : 'Continuar con cuenta de Google'}</span>
              </button>

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-slate-200"></div>
                <span className="text-xs text-slate-400 uppercase font-medium">o con correo por código</span>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>

              {/* Email OTP Request */}
              <form onSubmit={handleSendEmailOtp} className="space-y-4">
                <div>
                  <label htmlFor="auth-email" className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Electrónico Corporativo o Personal
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />
                    <input
                      id="auth-email"
                      type="email"
                      required
                      value={inputEmail}
                      onChange={(e) => setInputEmail(e.target.value)}
                      placeholder="ejemplo@constructorahorizonte.com"
                      className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                    />
                  </div>
                </div>

                <button
                  id="btn-submit-email-otp"
                  type="submit"
                  disabled={isVerifying}
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-cyan-600/20 transition-all"
                >
                  <Mail className="w-4 h-4" />
                  <span>{isVerifying ? 'Enviando código...' : 'Recibir Código de Verificación'}</span>
                </button>
              </form>
            </div>
          )}

          {/* STEP 1.5: OTP CODE VERIFICATION */}
          {authStep === 'otp_verify' && (
            <div className="max-w-md mx-auto text-center space-y-6">
              <div className="w-12 h-12 rounded-full bg-cyan-100 text-cyan-600 mx-auto flex items-center justify-center">
                <KeyRound className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Ingresa el código enviado</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Enviamos un código de 6 dígitos a <span className="font-semibold text-slate-700">{inputEmail}</span>
                </p>
              </div>

              {/* OTP Digits Input Box */}
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex justify-center gap-2">
                  {otpCode.map((digit, idx) => (
                    <input
                      key={idx}
                      id={`otp-input-${idx}`}
                      type="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => {
                        const newOtp = [...otpCode];
                        newOtp[idx] = e.target.value;
                        setOtpCode(newOtp);
                      }}
                      className="w-11 h-12 text-center text-lg font-bold bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  ))}
                </div>

                <div className="text-xs text-slate-400">
                  <span>Código de demostración pre-cargado: </span>
                  <span className="font-mono font-bold text-cyan-700">542890</span>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthStep('method')}
                    className="w-1/2 py-2.5 px-4 border border-slate-300 rounded-xl text-slate-700 font-semibold text-xs hover:bg-slate-50"
                  >
                    Cambiar correo
                  </button>
                  <button
                    id="btn-verify-otp"
                    type="submit"
                    disabled={isVerifying}
                    className="w-1/2 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-cyan-600/20"
                  >
                    {isVerifying ? 'Verificando...' : 'Verificar y Continuar'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: PASSWORD SET & PROFILE COMPLETION */}
          {authStep === 'profile_setup' && (
            <div className="max-w-xl mx-auto">
              <div className="text-center mb-6">
                <h3 className="text-xl font-bold text-slate-900">Asigna Contraseña y Completa tu Perfil</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Datos requeridos para la ficha técnica, facturación y trazabilidad de los proyectos de pintura.
                </p>
              </div>

              <form onSubmit={handleCompleteProfile} className="space-y-4">
                {/* Password input */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4">
                  <label htmlFor="user-password" className="block text-xs font-semibold text-slate-700 mb-1">
                    Asignar Contraseña Segura
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="user-password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2 bg-white border border-slate-300 rounded-lg text-sm text-slate-900 focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 bg-emerald-500 rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-emerald-500 rounded-full"></div>
                    <div className="flex-1 h-1.5 bg-emerald-500 rounded-full"></div>
                    <span className="text-[11px] font-semibold text-emerald-700">Contraseña Segura</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label htmlFor="profile-name" className="block text-xs font-semibold text-slate-700 mb-1">
                      Nombre y Apellidos
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="profile-name"
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ej. Ing. Carlos Mendoza"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Company */}
                  <div>
                    <label htmlFor="profile-company" className="block text-xs font-semibold text-slate-700 mb-1">
                      Empresa / Constructora
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="profile-company"
                        type="text"
                        required
                        value={formData.company}
                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                        placeholder="Ej. Constructora Horizonte S.A.S."
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label htmlFor="profile-phone" className="block text-xs font-semibold text-slate-700 mb-1">
                      Teléfono / Celular (WhatsApp)
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <input
                        id="profile-phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="+57 314 789 2045"
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="profile-city" className="block text-xs font-semibold text-slate-700 mb-1">
                      Ciudad Sede
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                      <select
                        id="profile-city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                      >
                        <option value="Medellín">Medellín (Antioquia)</option>
                        <option value="Bogotá">Bogotá D.C.</option>
                        <option value="Cali">Cali (Valle)</option>
                        <option value="Barranquilla">Barranquilla (Atlántico)</option>
                        <option value="Bucaramanga">Bucaramanga (Santander)</option>
                        <option value="Pereira">Pereira (Eje Cafetero)</option>
                        <option value="Cartagena">Cartagena (Bolívar)</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label htmlFor="profile-role" className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Usuario / Rol
                  </label>
                  <select
                    id="profile-role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="constructora">Constructora / Desarrollador Inmobiliario</option>
                    <option value="contratista">Contratista Especializado de Pintura</option>
                    <option value="arquitecto">Arquitecto / Diseñador / Especificador</option>
                    <option value="pintor">Maestro / Pintor Profesional</option>
                    <option value="compras">Departamento de Compras / Suministros</option>
                  </select>
                </div>

                <div className="pt-3">
                  <button
                    id="btn-save-profile"
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-600/20 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completar Registro y Activar Cuenta</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: COMPLETED ACTIVE SESSION SUMMARY */}
          {authStep === 'completed' && (
            <div className="max-w-xl mx-auto">
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl p-6 text-slate-800">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl font-black shadow-md shadow-emerald-600/30">
                      {user.company ? user.company.charAt(0) : 'C'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-lg text-slate-900">{user.company || 'Constructora Horizonte S.A.S.'}</h3>
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verificado
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">
                        Contacto: <span className="font-semibold text-slate-800">{user.name}</span> ({user.email})
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setAuthStep('profile_setup')}
                    className="text-xs text-slate-500 hover:text-slate-800 underline font-medium"
                  >
                    Editar
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-emerald-200/70 text-center">
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">ID Cliente</span>
                    <span className="text-xs font-mono font-bold text-emerald-950">{user.id}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Ciudad Sede</span>
                    <span className="text-xs font-semibold text-emerald-950">{user.city}</span>
                  </div>
                  <div className="bg-white/80 p-2.5 rounded-xl border border-emerald-100">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Tipo Cuenta</span>
                    <span className="text-xs font-semibold text-emerald-950 capitalize">{user.role}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <button
                    id="btn-goto-capture"
                    onClick={onContinueToCapture}
                    className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl font-bold text-sm shadow-md shadow-cyan-600/20 transition-all cursor-pointer"
                  >
                    <span>Ir a Captura de Proyecto (MVP)</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setAuthStep('method')}
                    className="px-4 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl font-semibold text-xs transition-colors"
                  >
                    Cambiar Cuenta
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
