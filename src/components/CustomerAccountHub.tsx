import React, { useEffect, useRef, useState } from 'react';
import {
  Package,
  Lock,
  Building2,
  Headphones,
  Layers,
  User,
  Check,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  Circle,
  ChevronRight
} from 'lucide-react';
import { UserProfile } from '../types';

interface CustomerAccountHubProps {
  user: UserProfile;
  /** Actualiza el usuario en la app (App vuelve a guardar en el servidor; el valor ya viene validado y guardado) */
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  /** Si se pasa, recibe el usuario que devolvió el servidor y se usa en lugar de onUpdateUser (evita un segundo PATCH) */
  onProfileSaved?: (user: UserProfile) => void;
  onNavigateToOrders: () => void;
  onNavigateToProjects: () => void;
  onNavigateToStore: () => void;
  onOpenSupport?: () => void;
}

// ---------- Reglas (las mismas del servidor: validateSignupFields / validatePasswordPolicy) ----------
const SOLO_LETRAS = /^[A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+( [A-Za-zÁÉÍÓÚÜáéíóúüÑñ]+)*$/;
const limpiarNombre = (v: string) => v.replace(/[^A-Za-zÁÉÍÓÚÜáéíóúüÑñ ]/g, '').replace(/\s{2,}/g, ' ').slice(0, 40);
const limpiarCelular = (v: string) => {
  let d = v.replace(/\D/g, '');
  if (d.length > 10 && d.startsWith('57')) d = d.slice(2);
  return d.slice(0, 10);
};
const errorNombre = (v: string, campo: string) => {
  const t = v.trim();
  if (!t) return `Escribe tu ${campo}.`;
  if (!SOLO_LETRAS.test(t) || t.length < 2 || t.length > 40) return `El ${campo} solo puede tener letras (2 a 40 caracteres).`;
  return '';
};
const errorCelular = (v: string) => (!v ? 'Escribe tu celular.' : /^3\d{9}$/.test(v) ? '' : 'El celular debe tener 10 números y empezar por 3.');

const REGLAS_CLAVE = [
  { label: 'Mínimo 8 caracteres', ok: (p: string) => p.length >= 8 },
  { label: 'Al menos una letra mayúscula', ok: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos un número', ok: (p: string) => /[0-9]/.test(p) },
  { label: 'Al menos un carácter especial (! @ # $ % …)', ok: (p: string) => /[^A-Za-z0-9]/.test(p) }
];

const Modal: React.FC<{ titulo: string; icono: React.ReactNode; onClose: () => void; bloqueado?: boolean; children: React.ReactNode }> = ({ titulo, icono, onClose, bloqueado, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && !bloqueado) onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose, bloqueado]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto" onClick={() => !bloqueado && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className="bg-white rounded-3xl w-full max-w-lg p-5 sm:p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 my-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 gap-3">
          <div className="flex items-center gap-2 min-w-0">
            {icono}
            <h3 className="text-base font-black text-slate-900">{titulo}</h3>
          </div>
          <button type="button" onClick={onClose} disabled={bloqueado} aria-label="Cerrar" className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 disabled:opacity-40 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

const CampoError: React.FC<{ id: string; msg?: string }> = ({ id, msg }) =>
  msg ? <p id={id} className="text-[11px] font-semibold text-red-600 mt-1">{msg}</p> : null;

const inputClase = (err?: string) =>
  `w-full px-3 py-2 bg-slate-50 border rounded-lg text-sm focus:outline-none focus:ring-1 ${err ? 'border-red-400 focus:border-red-500 focus:ring-red-500' : 'border-slate-300 focus:border-blue-900 focus:ring-blue-900'}`;

export const CustomerAccountHub: React.FC<CustomerAccountHubProps> = ({
  user,
  onUpdateUser,
  onProfileSaved,
  onNavigateToOrders,
  onNavigateToProjects,
  onNavigateToStore,
  onOpenSupport
}) => {
  const [activeModal, setActiveModal] = useState<'perfil' | 'clave' | 'facturacion' | null>(null);
  const [aviso, setAviso] = useState('');
  const avisoTimer = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(avisoTimer.current), []);
  const mostrarAviso = (t: string) => {
    setAviso(t);
    window.clearTimeout(avisoTimer.current);
    avisoTimer.current = window.setTimeout(() => setAviso(''), 3500);
  };

  // ---------- Datos personales ----------
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [perfilTocado, setPerfilTocado] = useState<Record<string, boolean>>({});
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [errorPerfil, setErrorPerfil] = useState('');

  const abrirPerfil = () => {
    const partes = (user.name || '').trim().split(/\s+/);
    setFirstName(limpiarNombre(user.firstName ?? partes[0] ?? ''));
    setLastName(limpiarNombre(user.lastName ?? partes.slice(1).join(' ') ?? ''));
    setPhone(limpiarCelular(user.phone || ''));
    setPerfilTocado({});
    setErrorPerfil('');
    setActiveModal('perfil');
  };

  const erroresPerfil = {
    firstName: errorNombre(firstName, 'nombre'),
    lastName: errorNombre(lastName, 'apellido'),
    phone: errorCelular(phone)
  };
  const perfilValido = !erroresPerfil.firstName && !erroresPerfil.lastName && !erroresPerfil.phone;
  const perfilSinCambios =
    firstName.trim() === (user.firstName || '').trim() &&
    lastName.trim() === (user.lastName || '').trim() &&
    phone === limpiarCelular(user.phone || '');

  const guardarPerfil = async (e: React.FormEvent) => {
    e.preventDefault();
    setPerfilTocado({ firstName: true, lastName: true, phone: true });
    if (!perfilValido || guardandoPerfil) return;
    setGuardandoPerfil(true);
    setErrorPerfil('');
    const datos = { firstName: firstName.trim(), lastName: lastName.trim(), phone };
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(datos)
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        setErrorPerfil(data.error || 'No se pudo actualizar el perfil.');
        return;
      }
      if (onProfileSaved && data.user) onProfileSaved(data.user);
      else onUpdateUser({ ...datos, name: `${datos.firstName} ${datos.lastName}`.trim() });
      setActiveModal(null);
      mostrarAviso('Tus datos se actualizaron.');
    } catch {
      setErrorPerfil('No hay conexión con el servidor. Intenta de nuevo.');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  // ---------- Contraseña ----------
  const [claveActual, setClaveActual] = useState('');
  const [claveNueva, setClaveNueva] = useState('');
  const [claveConfirm, setClaveConfirm] = useState('');
  const [verClaves, setVerClaves] = useState(false);
  const [claveTocado, setClaveTocado] = useState<Record<string, boolean>>({});
  const [guardandoClave, setGuardandoClave] = useState(false);
  const [errorClave, setErrorClave] = useState('');
  const [errorClaveActual, setErrorClaveActual] = useState('');

  const abrirClave = () => {
    setClaveActual(''); setClaveNueva(''); setClaveConfirm('');
    setVerClaves(false); setClaveTocado({}); setErrorClave(''); setErrorClaveActual('');
    setActiveModal('clave');
  };

  const erroresClave = {
    actual: errorClaveActual || (!claveActual ? 'Escribe tu contraseña actual.' : ''),
    nueva: !claveNueva
      ? 'Escribe la nueva contraseña.'
      : REGLAS_CLAVE.every(r => r.ok(claveNueva))
        ? (claveNueva === claveActual ? 'La nueva contraseña debe ser distinta a la actual.' : '')
        : 'La contraseña no cumple los requisitos.',
    confirm: claveConfirm !== claveNueva || !claveConfirm ? 'Las contraseñas no coinciden.' : ''
  };
  const claveValida = !erroresClave.actual && !erroresClave.nueva && !erroresClave.confirm;

  const guardarClave = async (e: React.FormEvent) => {
    e.preventDefault();
    setClaveTocado({ actual: true, nueva: true, confirm: true });
    if (!claveValida || guardandoClave) return;
    setGuardandoClave(true);
    setErrorClave('');
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: claveActual, newPassword: claveNueva })
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        if (res.status === 401) setErrorClaveActual(data.error || 'La contraseña actual no es correcta.');
        else setErrorClave(data.error || 'No se pudo cambiar la contraseña.');
        return;
      }
      setActiveModal(null);
      mostrarAviso('Tu contraseña se cambió correctamente.');
    } catch {
      setErrorClave('No hay conexión con el servidor. Intenta de nuevo.');
    } finally {
      setGuardandoClave(false);
    }
  };

  const esEmpresa = !!user.company;
  const iniciales = (user.name || '').trim().split(/\s+/).filter(Boolean).slice(0, 2).map(p => p[0]).join('').toUpperCase() || <User className="w-7 h-7" />;

  const accountCards: Array<{ id: string; title: string; description: string; icon: React.ReactNode; action: () => void }> = [
    {
      id: 'pedidos',
      title: 'Tus pedidos',
      description: 'Rastrea, cancela, descarga el comprobante o compra de nuevo.',
      icon: <Package className="w-8 h-8 text-amber-600" />,
      action: onNavigateToOrders
    },
    {
      id: 'perfil',
      title: 'Datos personales',
      description: 'Edita tu nombre, apellido y celular de contacto.',
      icon: <User className="w-8 h-8 text-blue-600" />,
      action: abrirPerfil
    },
    {
      id: 'clave',
      title: 'Contraseña y seguridad',
      description: 'Cambia la contraseña con la que ingresas a tu cuenta.',
      icon: <Lock className="w-8 h-8 text-slate-700" />,
      action: abrirClave
    },
    {
      id: 'facturacion',
      title: 'Facturación y dirección',
      description: 'Consulta tu documento, razón social, dirección y ciudad registrados.',
      icon: <Building2 className="w-8 h-8 text-indigo-600" />,
      action: () => setActiveModal('facturacion')
    },
    {
      id: 'proyectos',
      title: 'Proyectos y cotizaciones',
      description: 'Tus proyectos de pintura, cotizaciones y mensajes con tu asesor.',
      icon: <Layers className="w-8 h-8 text-emerald-700" />,
      action: onNavigateToProjects
    },
    ...(onOpenSupport ? [{
      id: 'soporte',
      title: 'Ayuda y soporte',
      description: 'Resuelve dudas sobre productos, pedidos o tu cuenta.',
      icon: <Headphones className="w-8 h-8 text-teal-600" />,
      action: onOpenSupport
    }] : [])
  ];

  const Dato: React.FC<{ label: string; value?: string | null }> = ({ label, value }) => (
    <div className="py-2 border-b border-slate-100 last:border-b-0 flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-0.5 sm:gap-4">
      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{label}</span>
      <span className="text-sm text-slate-900 font-semibold sm:text-right break-words">{value && String(value).trim() ? value : '—'}</span>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">

      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6" aria-label="Ruta">
        <button type="button" onClick={onNavigateToStore} className="hover:text-slate-900 transition-colors cursor-pointer">
          Tienda ColorLink
        </button>
        <span>›</span>
        <span className="font-bold text-slate-800">Tu cuenta</span>
      </nav>

      {/* Resumen del perfil */}
      <div className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white flex items-center justify-center font-black text-xl shadow-md shrink-0">
            {iniciales}
          </div>
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words">{user.name || 'Tu cuenta'}</h1>
            <p className="text-xs text-slate-500 mt-0.5 break-all">{user.email || '—'}</p>
            <p className="text-xs text-slate-600 mt-1.5">
              {esEmpresa ? user.company : 'Persona natural'} · Documento: <strong className="font-mono text-slate-800">{user.documentId || '—'}</strong>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={onNavigateToOrders}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 font-black text-xs text-slate-950 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Ver tus pedidos
          </button>
          <button
            type="button"
            onClick={abrirPerfil}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            Editar perfil
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accountCards.map(card => (
          <button
            key={card.id}
            type="button"
            onClick={card.action}
            className="text-left bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-lg hover:border-amber-400/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-500 transition-all duration-200 cursor-pointer flex gap-4 items-start group"
          >
            <span className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">{card.icon}</span>
            <span className="flex-1 min-w-0">
              <span className="flex items-center justify-between gap-1">
                <span className="font-extrabold text-sm text-slate-900 group-hover:text-blue-900 transition-colors">{card.title}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
              </span>
              <span className="block text-xs text-slate-500 mt-1 leading-relaxed">{card.description}</span>
            </span>
          </button>
        ))}
      </div>

      {/* =========================== DATOS PERSONALES =========================== */}
      {activeModal === 'perfil' && (
        <Modal titulo="Datos personales" icono={<User className="w-5 h-5 text-blue-600" />} onClose={() => setActiveModal(null)} bloqueado={guardandoPerfil}>
          <form onSubmit={guardarPerfil} noValidate className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="perfil-nombre" className="font-bold text-slate-700 block mb-1">Nombres *</label>
                <input
                  id="perfil-nombre"
                  type="text"
                  value={firstName}
                  maxLength={40}
                  autoComplete="given-name"
                  onChange={(e) => setFirstName(limpiarNombre(e.target.value))}
                  onBlur={() => setPerfilTocado(t => ({ ...t, firstName: true }))}
                  aria-invalid={!!(perfilTocado.firstName && erroresPerfil.firstName)}
                  aria-describedby="perfil-nombre-err"
                  className={inputClase(perfilTocado.firstName ? erroresPerfil.firstName : '')}
                />
                <CampoError id="perfil-nombre-err" msg={perfilTocado.firstName ? erroresPerfil.firstName : ''} />
              </div>
              <div>
                <label htmlFor="perfil-apellido" className="font-bold text-slate-700 block mb-1">Apellidos *</label>
                <input
                  id="perfil-apellido"
                  type="text"
                  value={lastName}
                  maxLength={40}
                  autoComplete="family-name"
                  onChange={(e) => setLastName(limpiarNombre(e.target.value))}
                  onBlur={() => setPerfilTocado(t => ({ ...t, lastName: true }))}
                  aria-invalid={!!(perfilTocado.lastName && erroresPerfil.lastName)}
                  aria-describedby="perfil-apellido-err"
                  className={inputClase(perfilTocado.lastName ? erroresPerfil.lastName : '')}
                />
                <CampoError id="perfil-apellido-err" msg={perfilTocado.lastName ? erroresPerfil.lastName : ''} />
              </div>
            </div>

            <div>
              <label htmlFor="perfil-correo" className="font-bold text-slate-700 block mb-1">Correo electrónico</label>
              <input id="perfil-correo" type="email" value={user.email || ''} readOnly className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-500 cursor-not-allowed" />
              <p className="text-[11px] text-slate-500 mt-1">El correo es tu usuario de acceso y no se puede cambiar desde aquí.</p>
            </div>

            <div>
              <label htmlFor="perfil-celular" className="font-bold text-slate-700 block mb-1">Celular / WhatsApp *</label>
              <input
                id="perfil-celular"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                placeholder="3001234567"
                value={phone}
                onChange={(e) => setPhone(limpiarCelular(e.target.value))}
                onBlur={() => setPerfilTocado(t => ({ ...t, phone: true }))}
                aria-invalid={!!(perfilTocado.phone && erroresPerfil.phone)}
                aria-describedby="perfil-celular-err"
                className={inputClase(perfilTocado.phone ? erroresPerfil.phone : '')}
              />
              <CampoError id="perfil-celular-err" msg={perfilTocado.phone ? erroresPerfil.phone : ''} />
            </div>

            {errorPerfil && <p role="alert" className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold">{errorPerfil}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} disabled={guardandoPerfil} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-lg cursor-pointer">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoPerfil || !perfilValido || perfilSinCambios}
                className="px-5 py-2 bg-[#002855] hover:bg-[#001D3D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-lg shadow-sm cursor-pointer"
              >
                {guardandoPerfil ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================== CONTRASEÑA =========================== */}
      {activeModal === 'clave' && (
        <Modal titulo="Cambiar contraseña" icono={<Lock className="w-5 h-5 text-slate-700" />} onClose={() => setActiveModal(null)} bloqueado={guardandoClave}>
          <form onSubmit={guardarClave} noValidate className="space-y-3 text-xs">
            <div>
              <label htmlFor="clave-actual" className="font-bold text-slate-700 block mb-1">Contraseña actual *</label>
              <input
                id="clave-actual"
                type={verClaves ? 'text' : 'password'}
                value={claveActual}
                maxLength={72}
                autoComplete="current-password"
                onChange={(e) => { setClaveActual(e.target.value); setErrorClaveActual(''); }}
                onBlur={() => setClaveTocado(t => ({ ...t, actual: true }))}
                aria-invalid={!!(claveTocado.actual && erroresClave.actual)}
                aria-describedby="clave-actual-err"
                className={inputClase(claveTocado.actual ? erroresClave.actual : '')}
              />
              <CampoError id="clave-actual-err" msg={claveTocado.actual ? erroresClave.actual : ''} />
            </div>
            <div>
              <label htmlFor="clave-nueva" className="font-bold text-slate-700 block mb-1">Nueva contraseña *</label>
              <div className="relative">
                <input
                  id="clave-nueva"
                  type={verClaves ? 'text' : 'password'}
                  value={claveNueva}
                  maxLength={72}
                  autoComplete="new-password"
                  onChange={(e) => setClaveNueva(e.target.value)}
                  onBlur={() => setClaveTocado(t => ({ ...t, nueva: true }))}
                  aria-invalid={!!(claveTocado.nueva && erroresClave.nueva)}
                  aria-describedby="clave-nueva-err"
                  className={`${inputClase(claveTocado.nueva ? erroresClave.nueva : '')} pr-10`}
                />
                <button type="button" onClick={() => setVerClaves(v => !v)} aria-label={verClaves ? 'Ocultar contraseñas' : 'Mostrar contraseñas'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                  {verClaves ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <CampoError id="clave-nueva-err" msg={claveTocado.nueva ? erroresClave.nueva : ''} />
            </div>
            <ul className="space-y-1 bg-slate-50 border border-slate-200 rounded-xl p-3">
              {REGLAS_CLAVE.map(r => {
                const ok = r.ok(claveNueva);
                return (
                  <li key={r.label} className={`flex items-center gap-2 font-semibold ${ok ? 'text-emerald-700' : 'text-slate-500'}`}>
                    {ok ? <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> : <Circle className="w-3.5 h-3.5 shrink-0 text-slate-300" />}
                    {r.label}
                  </li>
                );
              })}
            </ul>
            <div>
              <label htmlFor="clave-confirm" className="font-bold text-slate-700 block mb-1">Confirmar nueva contraseña *</label>
              <input
                id="clave-confirm"
                type={verClaves ? 'text' : 'password'}
                value={claveConfirm}
                maxLength={72}
                autoComplete="new-password"
                onChange={(e) => setClaveConfirm(e.target.value)}
                onBlur={() => setClaveTocado(t => ({ ...t, confirm: true }))}
                aria-invalid={!!(claveTocado.confirm && erroresClave.confirm)}
                aria-describedby="clave-confirm-err"
                className={inputClase(claveTocado.confirm ? erroresClave.confirm : '')}
              />
              <CampoError id="clave-confirm-err" msg={claveTocado.confirm ? erroresClave.confirm : ''} />
            </div>

            {user.authMethod && user.authMethod !== 'credentials' && (
              <p className="text-[11px] text-slate-500">
                Si te registraste con Google o con código por correo y nunca creaste una contraseña, usa “Olvidé mi contraseña” al iniciar sesión para crear una.
              </p>
            )}

            {errorClave && <p role="alert" className="p-2.5 rounded-lg bg-red-50 border border-red-200 text-red-700 font-semibold">{errorClave}</p>}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button type="button" onClick={() => setActiveModal(null)} disabled={guardandoClave} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold rounded-lg cursor-pointer">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={guardandoClave || !claveValida}
                className="px-5 py-2 bg-[#002855] hover:bg-[#001D3D] disabled:opacity-50 disabled:cursor-not-allowed text-white font-black rounded-lg shadow-sm cursor-pointer"
              >
                {guardandoClave ? 'Guardando…' : 'Cambiar contraseña'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* =========================== FACTURACIÓN =========================== */}
      {activeModal === 'facturacion' && (
        <Modal titulo="Facturación y dirección" icono={<Building2 className="w-5 h-5 text-indigo-600" />} onClose={() => setActiveModal(null)}>
          <div className="text-xs">
            <Dato label="Tipo de cliente" value={esEmpresa ? 'Persona jurídica' : 'Persona natural'} />
            {esEmpresa && <Dato label="Razón social" value={user.company} />}
            <Dato label={esEmpresa ? 'NIT' : 'Documento'} value={user.documentId} />
            <Dato label="Dirección" value={user.address} />
            <Dato label="Ciudad" value={user.city} />
          </div>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Estos datos se usan para tus comprobantes. Si necesitas corregirlos, escríbenos{onOpenSupport ? ' desde Ayuda y soporte' : ''}.
          </p>
          <div className="flex flex-wrap justify-end gap-2">
            {onOpenSupport && (
              <button type="button" onClick={() => { setActiveModal(null); onOpenSupport(); }} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-lg cursor-pointer">
                Pedir un cambio
              </button>
            )}
            <button type="button" onClick={() => setActiveModal(null)} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg cursor-pointer">
              Cerrar
            </button>
          </div>
        </Modal>
      )}

      {aviso && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] max-w-[calc(100vw-2rem)] bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl inline-flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-400 shrink-0" /> <span>{aviso}</span>
        </div>
      )}
    </div>
  );
};
