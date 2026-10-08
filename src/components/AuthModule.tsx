import React, { useState } from 'react';
import { UserProfile } from '../types';
import { 
  User, 
  Mail, 
  Building2, 
  Phone, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  FileBadge, 
  Truck, 
  Check, 
  AlertCircle,
  LogOut,
  Edit3,
  Sparkles
} from 'lucide-react';

interface AuthModuleProps {
  user: UserProfile;
  setUser: React.Dispatch<React.SetStateAction<UserProfile>>;
  onContinueToCapture: () => void;
  onLogout?: () => void;
}

export const AuthModule: React.FC<AuthModuleProps> = ({
  user,
  setUser,
  onContinueToCapture,
  onLogout
}) => {
  // Mode when NOT logged in: 'register' vs 'login'
  const [authMode, setAuthMode] = useState<'register' | 'login'>('register');
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Form Fields for Register / Profile Update
  const [firstName, setFirstName] = useState(user.firstName || 'Carlos');
  const [lastName, setLastName] = useState(user.lastName || 'Mendoza Gómez');
  const [email, setEmail] = useState(user.email || 'proyectos@constructorahorizonte.com.co');
  const [phone, setPhone] = useState(user.phone || '+57 (314) 789-2045');
  const [address, setAddress] = useState(user.address || 'Calle 10A # 36-24, El Poblado');
  const [documentId, setDocumentId] = useState(user.documentId || '901.458.789-3');
  const [company, setCompany] = useState(user.company || 'Constructora Horizonte S.A.S.');
  const [city, setCity] = useState(user.city || 'Medellín');
  const [role, setRole] = useState<UserProfile['role']>(user.role || 'constructora');

  // Password fields
  const [password, setPassword] = useState('ColorLink*2026');
  const [confirmPassword, setConfirmPassword] = useState('ColorLink*2026');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login simple fields
  const [loginEmail, setLoginEmail] = useState('proyectos@constructorahorizonte.com.co');
  const [loginPassword, setLoginPassword] = useState('ColorLink*2026');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const isPasswordMatch = password.length > 0 && password === confirmPassword;

  const handleLoadDemoData = () => {
    setFirstName('Carlos');
    setLastName('Mendoza Gómez');
    setEmail('proyectos@constructorahorizonte.com.co');
    setPhone('+57 (314) 789-2045');
    setAddress('Calle 10A # 36-24, El Poblado');
    setDocumentId('901.458.789-3');
    setCompany('Constructora Horizonte S.A.S.');
    setCity('Medellín');
    setRole('constructora');
    setPassword('ColorLink*2026');
    setConfirmPassword('ColorLink*2026');
    setErrorMessage('');
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (authMode === 'register' && !isPasswordMatch) {
      setErrorMessage('Las contraseñas no coinciden. Por favor verifícalas.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const fullName = `${firstName.trim()} ${lastName.trim()}`;
      setUser({
        id: user.id || `USR-2026-MED-${Math.floor(100 + Math.random() * 900)}`,
        name: fullName,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        address: address.trim(),
        documentId: documentId.trim(),
        company: company.trim(),
        city: city,
        role: role,
        authMethod: 'credentials',
        isRegistered: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      setIsEditingProfile(false);
    }, 500);
  };

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUser({
        id: 'USR-2026-0042',
        name: 'Carlos Mendoza Gómez',
        firstName: 'Carlos',
        lastName: 'Mendoza Gómez',
        email: loginEmail,
        phone: '+57 (314) 789-2045',
        address: 'Calle 10A # 36-24, El Poblado',
        documentId: '901.458.789-3',
        company: 'Constructora Horizonte S.A.S.',
        city: 'Medellín',
        role: 'constructora',
        authMethod: 'credentials',
        isRegistered: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
    }, 400);
  };

  const handleGoogleQuickAuth = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setUser({
        id: 'USR-2026-0042',
        name: 'Carlos Mendoza Gómez',
        firstName: 'Carlos',
        lastName: 'Mendoza Gómez',
        email: 'proyectos@constructorahorizonte.com.co',
        phone: '+57 (314) 789-2045',
        address: 'Calle 10A # 36-24, El Poblado',
        documentId: '901.458.789-3',
        company: 'Constructora Horizonte S.A.S.',
        city: 'Medellín',
        role: 'constructora',
        authMethod: 'google',
        isRegistered: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
      });
      setIsEditingProfile(false);
    }, 400);
  };

  const handleLogoutAction = () => {
    if (onLogout) {
      onLogout();
    } else {
      setUser(prev => ({
        ...prev,
        isRegistered: false
      }));
    }
  };

  // =========================================================================
  // VIEW 1: CLIENT IS LOGGED IN (Dashboard / Client Context View)
  // =========================================================================
  if (user.isRegistered && !isEditingProfile) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
        
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-[#0F224A] via-[#163674] to-[#0F224A] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold mb-3">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Sesión Activa • Portal ColorLink</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                Bienvenido, {user.firstName || user.name.split(' ')[0]}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
                Tus datos de facturación, NIT y dirección de obra están vinculados automáticamente a todas tus cotizaciones de pintura y fichas técnicas.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <button
                onClick={() => setIsEditingProfile(true)}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                <span>Editar mis Datos</span>
              </button>
              <button
                onClick={handleLogoutAction}
                className="px-4 py-2.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 font-bold text-xs rounded-xl border border-rose-400/30 flex items-center gap-2 transition-all cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>

        {/* Client Profile Card */}
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden p-6 sm:p-8 space-y-6">
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <img
                src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                alt={user.name}
                className="w-14 h-14 rounded-2xl object-cover border-2 border-emerald-500 shadow-md"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    Cuenta Verificada
                  </span>
                  <span className="text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {user.role}
                  </span>
                </div>
                <h3 className="text-xl font-black text-slate-900 mt-1">
                  {user.name}
                </h3>
                <p className="text-xs text-slate-600 font-medium">
                  {user.company} • <span className="font-mono text-slate-700">NIT: {user.documentId}</span>
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-4 py-2 bg-white border border-emerald-300 text-emerald-800 text-xs font-bold rounded-xl hover:bg-emerald-100/60 transition-colors cursor-pointer"
            >
              Actualizar Perfil
            </button>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                <MapPin className="w-3 h-3 text-cyan-600" /> Dirección de Despacho
              </span>
              <p className="font-bold text-slate-900 mt-1.5 text-sm">{user.address}</p>
              <p className="text-slate-500 mt-0.5">{user.city} (Valle de Aburrá)</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                <Phone className="w-3 h-3 text-cyan-600" /> Contacto de Obra
              </span>
              <p className="font-bold text-slate-900 mt-1.5 text-sm">{user.phone}</p>
              <p className="text-slate-500 mt-0.5 truncate">{user.email}</p>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-slate-400 block text-[10px] uppercase font-bold flex items-center gap-1">
                <Truck className="w-3 h-3 text-emerald-600" /> Cobertura & Tarifa
              </span>
              <p className="font-bold text-slate-900 mt-1.5 text-sm">Tarifa Mayorista Pro</p>
              <p className="text-emerald-700 font-semibold mt-0.5">Despacho 24h Medellín</p>
            </div>
          </div>

          {/* CTA to Next Step */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <p className="text-xs text-slate-500">
              Tu proyecto actual de <strong className="text-slate-800">85 m² en Medellín</strong> está listo para ser cotizado y validado.
            </p>

            <button
              id="btn-go-to-capture"
              onClick={onContinueToCapture}
              className="w-full sm:w-auto px-7 py-3.5 bg-[#0F224A] hover:bg-[#163674] text-white font-black text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            >
              <span>Continuar a Captura de Proyecto</span>
              <ArrowRight className="w-4 h-4 text-cyan-400" />
            </button>
          </div>

        </div>

      </div>
    );
  }

  // =========================================================================
  // VIEW 2: CLIENT NOT LOGGED IN (Pure Clean Login & Registration Screen)
  // =========================================================================
  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-6">
      
      {/* Auth Banner */}
      <div className="bg-gradient-to-r from-[#0F224A] via-[#163674] to-[#0F224A] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-400/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold mb-3">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span>Acceso Profesional ColorLink</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {isEditingProfile ? 'Actualizar Datos del Cliente' : authMode === 'register' ? 'Crea tu Cuenta Profesional' : 'Iniciar Sesión'}
            </h1>
            <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-xl">
              Ingresa tus datos para generar cotizaciones con IVA discriminado, ficha técnica en PDF y despacho en el Valle de Aburrá.
            </p>
          </div>

          <button
            id="btn-auth-demo-preset"
            onClick={handleLoadDemoData}
            className="self-start md:self-auto px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
            title="Auto-rellenar datos de Constructora Horizonte"
          >
            <RefreshCw className="w-4 h-4 text-slate-950" />
            <span>Cargar Datos Horizonte (Demo)</span>
          </button>
        </div>
      </div>

      {/* Main Authentication Box */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden">
        
        {/* Toggle between Register and Login (Only visible when not logged in) */}
        {!isEditingProfile && (
          <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => { setAuthMode('register'); setErrorMessage(''); }}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  authMode === 'register'
                    ? 'bg-[#0F224A] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Nuevo Registro
              </button>
              <button
                type="button"
                onClick={() => { setAuthMode('login'); setErrorMessage(''); }}
                className={`flex-1 sm:flex-none px-5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-[#0F224A] text-white shadow-md'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                Ya tengo Cuenta
              </button>
            </div>

            <button
              type="button"
              onClick={handleGoogleQuickAuth}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-2.5 shadow-xs transition-all cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Acceso Rápido con Google</span>
            </button>
          </div>
        )}

        {/* LOGIN FORM */}
        {authMode === 'login' && !isEditingProfile ? (
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5 max-w-lg mx-auto">
            <div className="text-center space-y-1 pb-2">
              <h3 className="text-lg font-black text-slate-900">Ingreso a tu Portal de Clientes</h3>
              <p className="text-xs text-slate-500">Accede con tus credenciales registradas</p>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="ejemplo@constructora.com"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  placeholder="Tu contraseña"
                  className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#0F224A] hover:bg-[#163674] text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              {isSubmitting ? (
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
              ) : (
                <>
                  <span>Ingresar a mi Cuenta</span>
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                </>
              )}
            </button>
          </form>
        ) : (
          /* REGISTRATION / EDIT FORM */
          <form onSubmit={handleRegisterSubmit} className="p-6 sm:p-8 space-y-6">
            
            {errorMessage && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs font-semibold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* SECCIÓN 1: DATOS PERSONALES */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <User className="w-4 h-4 text-blue-900" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  1. Datos del Solicitante / Ingeniero
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-first-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Nombre(s) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-first-name"
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Ej. Carlos"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="reg-last-name" className="block text-xs font-bold text-slate-700 mb-1">
                    Apellido(s) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    id="reg-last-name"
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Ej. Mendoza Gómez"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-phone" className="block text-xs font-bold text-slate-700 mb-1">
                    Teléfono / Celular (WhatsApp) <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="reg-phone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 314 789 2045"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-email" className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="reg-email"
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="obras@empresa.com"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: EMPRESA Y FACTURACIÓN */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                <Building2 className="w-4 h-4 text-blue-900" />
                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  2. Empresa, Facturación & Dirección de Despacho
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="reg-document-id" className="block text-xs font-bold text-slate-700 mb-1">
                    NIT / Cédula de Ciudadanía <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <FileBadge className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="reg-document-id"
                      type="text"
                      required
                      value={documentId}
                      onChange={(e) => setDocumentId(e.target.value)}
                      placeholder="Ej. 901.458.789-3 o C.C."
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-company" className="block text-xs font-bold text-slate-700 mb-1">
                    Empresa / Razón Social
                  </label>
                  <input
                    id="reg-company"
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="Ej. Constructora Horizonte S.A.S."
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label htmlFor="reg-address" className="block text-xs font-bold text-slate-700 mb-1">
                    Dirección de Entrega / Despacho <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      id="reg-address"
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Ej. Calle 10A # 36-24, El Poblado"
                      className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="reg-city" className="block text-xs font-bold text-slate-700 mb-1">
                    Ciudad / Municipio
                  </label>
                  <select
                    id="reg-city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none font-semibold"
                  >
                    <option value="Medellín">Medellín</option>
                    <option value="Envigado">Envigado</option>
                    <option value="Itagüí">Itagüí</option>
                    <option value="Bello">Bello</option>
                    <option value="Sabaneta">Sabaneta</option>
                    <option value="Rionegro">Rionegro / Oriente</option>
                    <option value="Bogotá D.C.">Bogotá D.C.</option>
                    <option value="Cali">Cali</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Tipo de Actividad / Rol
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { id: 'constructora', label: 'Constructora' },
                    { id: 'contratista', label: 'Contratista' },
                    { id: 'arquitecto', label: 'Arquitecto' },
                    { id: 'pintor', label: 'Pintor Pro' },
                    { id: 'compras', label: 'Compras' },
                  ].map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id as any)}
                      className={`py-2 px-2.5 rounded-xl text-xs font-bold border text-center transition-all cursor-pointer ${
                        role === r.id
                          ? 'bg-[#0F224A] text-cyan-300 border-[#0F224A] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* SECCIÓN 3: CONTRASEÑA (Solo para nuevo registro) */}
            {!isEditingProfile && (
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Lock className="w-4 h-4 text-blue-900" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    3. Seguridad & Contraseña
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="reg-password" className="block text-xs font-bold text-slate-700 mb-1">
                      Contraseña <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        id="reg-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Mínimo 6 caracteres"
                        className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-900 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label htmlFor="reg-confirm-password" className="block text-xs font-bold text-slate-700">
                        Repetir Contraseña <span className="text-rose-500">*</span>
                      </label>
                      {confirmPassword && (
                        <span className={`text-[10px] font-bold flex items-center gap-1 ${
                          isPasswordMatch ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                          {isPasswordMatch ? (
                            <>
                              <Check className="w-3 h-3" />
                              <span>Coinciden</span>
                            </>
                          ) : (
                            'No coinciden'
                          )}
                        </span>
                      )}
                    </div>
                    <div className="relative">
                      <input
                        id="reg-confirm-password"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Repite tu contraseña"
                        className={`w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none ${
                          confirmPassword
                            ? isPasswordMatch
                              ? 'border-emerald-500 focus:ring-2 focus:ring-emerald-500'
                              : 'border-rose-400 focus:ring-2 focus:ring-rose-400'
                            : 'border-slate-300 focus:ring-2 focus:ring-blue-900'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Despacho disponible en 24h para Medellín y Área Metropolitana</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                {isEditingProfile && (
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Cancelar
                  </button>
                )}
                <button
                  id="btn-submit-registration"
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 sm:flex-none px-8 py-3.5 bg-[#0F224A] hover:bg-[#163674] text-white font-extrabold text-sm rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-[1.02]"
                >
                  {isSubmitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-cyan-400" />
                  ) : (
                    <>
                      <span>{isEditingProfile ? 'Guardar Cambios' : 'Guardar Registro & Continuar'}</span>
                      <ArrowRight className="w-4 h-4 text-cyan-400" />
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>

    </div>
  );
};
