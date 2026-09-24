import React, { useState } from 'react';
import { 
  Package, 
  Lock, 
  MapPin, 
  Building2, 
  CreditCard, 
  Bookmark, 
  Headphones, 
  Layers, 
  ChevronRight, 
  User, 
  Check, 
  X,
  Phone,
  Mail,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { UserProfile } from '../types';

interface CustomerAccountHubProps {
  user: UserProfile;
  onUpdateUser: (updated: Partial<UserProfile>) => void;
  onNavigateToOrders: () => void;
  onNavigateToProjects: () => void;
  onNavigateToStore: () => void;
}

export const CustomerAccountHub: React.FC<CustomerAccountHubProps> = ({
  user,
  onUpdateUser,
  onNavigateToOrders,
  onNavigateToProjects,
  onNavigateToStore
}) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  // Edit profile state
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState(user.phone || '+57 312 450-8920');
  const [company, setCompany] = useState(user.companyName || 'Constructora Horizonte S.A.S.');
  const [nit, setNit] = useState(user.nit || '901.234.567-8');
  const [city, setCity] = useState(user.city || 'Medellín');
  const [address, setAddress] = useState(user.address || 'Cra 43A # 18 Sur-135, El Poblado');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      name,
      email,
      phone,
      companyName: company,
      nit,
      city,
      address
    });
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveModal(null);
    }, 1200);
  };

  const accountCards = [
    {
      id: 'pedidos',
      title: 'Tus pedidos',
      description: 'Rastrear, devolver, cancelar un pedido, descargar factura o comprar de nuevo.',
      icon: <Package className="w-8 h-8 text-amber-600" />,
      badge: null,
      action: onNavigateToOrders
    },
    {
      id: 'seguridad',
      title: 'Inicio de sesión y seguridad',
      description: 'Editar nombre de usuario, contraseña, teléfono móvil y correo electrónico.',
      icon: <Lock className="w-8 h-8 text-blue-600" />,
      badge: 'Protegido',
      action: () => setActiveModal('seguridad')
    },
    {
      id: 'direcciones',
      title: 'Direcciones de entrega',
      description: 'Editar, eliminar o establecer direcciones predeterminadas para envío a obra o domicilio.',
      icon: <MapPin className="w-8 h-8 text-emerald-600" />,
      badge: null,
      action: () => setActiveModal('direcciones')
    },
    {
      id: 'empresa',
      title: 'Tu cuenta empresarial / Facturación DIAN',
      description: 'Configurar Razón Social, NIT y régimen tributario para la emisión de facturas electrónicas.',
      icon: <Building2 className="w-8 h-8 text-indigo-600" />,
      badge: user.personType === 'juridica' ? 'Empresa' : 'Persona Natural',
      action: () => setActiveModal('empresa')
    },
    {
      id: 'pagos',
      title: 'Tus pagos y crédito de obra',
      description: 'Administrar métodos de pago guardados (PSE, Tarjetas Débito/Crédito y Crédito Constructor).',
      icon: <CreditCard className="w-8 h-8 text-purple-600" />,
      badge: null,
      action: () => setActiveModal('pagos')
    },
    {
      id: 'listas',
      title: 'Tus listas & cotizaciones guardadas',
      description: 'Ver y modificar listas de materiales guardados para compras recurrentes de obra.',
      icon: <Bookmark className="w-8 h-8 text-rose-600" />,
      badge: null,
      action: () => setActiveModal('listas')
    },
    {
      id: 'soporte',
      title: 'Servicio al Cliente & Asesor Técnico',
      description: 'Contactar a tu asesor comercial asignado, WhatsApp directo o radicar consulta técnica.',
      icon: <Headphones className="w-8 h-8 text-teal-600" />,
      badge: 'Asesor 24/7',
      action: () => setActiveModal('soporte')
    },
    {
      id: 'proyectos',
      title: 'Panel de Obras & Proyectos',
      description: 'Acceder al módulo técnico de cubicaje por m², diagnóstico con IA y peritajes de calidad.',
      icon: <Layers className="w-8 h-8 text-slate-800" />,
      badge: 'Módulo PRO',
      action: onNavigateToProjects
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-6">
        <button 
          onClick={onNavigateToStore} 
          className="hover:text-slate-900 transition-colors cursor-pointer"
        >
          Tienda ColorLink
        </button>
        <span>›</span>
        <span className="font-bold text-slate-800">Tu cuenta</span>
      </div>

      {/* Header Profile Summary (Like Image 4) */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-slate-900 to-blue-900 text-white flex items-center justify-center font-black text-xl shadow-md">
            {user.name ? user.name.slice(0, 2).toUpperCase() : 'CL'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {user.name}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
                {user.role === 'cliente' ? 'Cliente VIP' : user.role}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              {user.email} • {user.companyName || 'Persona Natural'}
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-600 mt-2">
              <span className="flex items-center gap-1 text-emerald-700 font-bold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Cuenta Verificada</span>
              </span>
              <span>•</span>
              <span>NIT / Doc: <strong className="font-mono text-slate-800">{user.nit || '1.020.304.506'}</strong></span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-start md:self-auto">
          <button
            type="button"
            onClick={onNavigateToOrders}
            className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 font-black text-xs text-slate-950 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            Ver Tus Pedidos
          </button>
          <button
            type="button"
            onClick={() => setActiveModal('seguridad')}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 font-bold text-xs text-slate-700 rounded-xl transition-all cursor-pointer"
          >
            Editar Perfil
          </button>
        </div>
      </div>

      {/* Grid of 8 Cards (Amazon style - Image 4) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {accountCards.map(card => (
          <div
            key={card.id}
            onClick={card.action}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-lg hover:border-amber-400/80 transition-all duration-200 cursor-pointer flex gap-4 items-start group"
          >
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
              {card.icon}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1">
                <h3 className="font-extrabold text-sm text-slate-900 group-hover:text-blue-900 transition-colors">
                  {card.title}
                </h3>
                {card.badge && (
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                    {card.badge}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-2">
                {card.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* =================================================================== */}
      {/* MODAL: INICIO DE SESIÓN Y SEGURIDAD                                 */}
      {/* =================================================================== */}
      {activeModal === 'seguridad' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-black text-slate-900">Inicio de Sesión y Seguridad</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Teléfono Móvil / WhatsApp</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-900"
                  required
                />
              </div>

              {saveSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-100 text-emerald-800 font-bold flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>¡Datos actualizados correctamente!</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#002855] hover:bg-[#001D3D] text-white font-black rounded-lg shadow-sm cursor-pointer"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: CUENTA EMPRESARIAL / FACTURACIÓN DIAN                         */}
      {/* =================================================================== */}
      {activeModal === 'empresa' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-slate-900">Datos Fiscales y Facturación DIAN</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Razón Social</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">NIT con Dígito</label>
                  <input
                    type="text"
                    value={nit}
                    onChange={(e) => setNit(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ciudad Fiscal</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Dirección Fiscal / Obra</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600"
                    required
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[11px] text-blue-900 leading-relaxed">
                Todas las compras facturadas electrónicamente serán enviadas a la DIAN y a tu correo con el XML y PDF oficial correspondiente.
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg cursor-pointer"
                >
                  Cerrar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-lg shadow-sm cursor-pointer"
                >
                  Guardar Datos Fiscales
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: DIRECCIONES                                                  */}
      {/* =================================================================== */}
      {activeModal === 'direcciones' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-black text-slate-900">Direcciones de Entrega Guardadas</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50/50 space-y-1 relative">
                <span className="absolute top-3 right-3 px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[9px] uppercase">
                  Predeterminada
                </span>
                <strong className="text-slate-900 block font-bold text-sm">Obra Principal - El Poblado</strong>
                <p className="text-slate-600">{address}</p>
                <p className="text-slate-500">{city}, Colombia</p>
                <p className="text-[11px] text-slate-500 mt-1">Receptor: Carlos Mendoza • +57 312 450-8920</p>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-1">
                <strong className="text-slate-900 block font-bold text-sm">Bodega Norte - Guarne</strong>
                <p className="text-slate-600">Parque Industrial Celta Park, Km 7 Vía Medellín - Bogotá</p>
                <p className="text-slate-500">Antioquia, Colombia</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: SOPORTE Y ASESORÍA TÉCNICA                                  */}
      {/* =================================================================== */}
      {activeModal === 'soporte' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95 text-center">
            <div className="w-14 h-14 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto">
              <Headphones className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900">Asesoría Comercial & Técnica</h3>
              <p className="text-xs text-slate-500">
                Atención directa para cotizaciones por volumen, cuñetes de obra y especificaciones técnicas.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-left space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Phone className="w-4 h-4 text-emerald-600" />
                <span>WhatsApp Obras: +57 314 789-2045</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Mail className="w-4 h-4 text-blue-600" />
                <span>ventas@colorlink.com.co</span>
              </div>
              <div className="flex items-center gap-2 text-slate-800 font-bold">
                <Building2 className="w-4 h-4 text-purple-600" />
                <span>PBX Medellín: (604) 448-9000</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
              <a
                href="https://wa.me/573147892045?text=Hola%20ColorLink,%20necesito%20asesoría%20sobre%20mi%20cuenta%20y%20pedidos"
                target="_blank"
                rel="noreferrer"
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-xl cursor-pointer flex items-center justify-center gap-1.5 shadow-md"
              >
                <span>Chatear por WhatsApp</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: MÉTODOS DE PAGO                                              */}
      {/* =================================================================== */}
      {activeModal === 'pagos' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-purple-600" />
                <h3 className="text-base font-black text-slate-900">Métodos de Pago & Crédito</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <strong className="block text-slate-900 font-bold">PSE Bancolombia</strong>
                  <span className="text-slate-500 text-[11px]">Cuenta Ahorros vinculada •• 9102</span>
                </div>
                <span className="text-emerald-600 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">Activo</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <strong className="block text-slate-900 font-bold">Crédito Obras ColorLink 30 días</strong>
                  <span className="text-slate-500 text-[11px]">Cupo aprobado: $25.000.000 COP</span>
                </div>
                <span className="text-indigo-600 font-bold text-[10px] bg-indigo-100 px-2 py-0.5 rounded-full">Empresarial</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Listo
            </button>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* MODAL: TUS LISTAS                                                   */}
      {/* =================================================================== */}
      {activeModal === 'listas' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-xs">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div className="flex items-center gap-2">
                <Bookmark className="w-5 h-5 text-rose-600" />
                <h3 className="text-base font-black text-slate-900">Listas & Cotizaciones Guardadas</h3>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Lista Torre B - Acabados Interiores</span>
                  <span className="text-slate-500">6 artículos</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Viniltex Ultralavable (3 cuñetes), Rodillos 9", Masilla</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Impermeabilización Fachada Norte</span>
                  <span className="text-slate-500">2 artículos</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">Koraza Sol & Lluvia Verde Betula (5 cuñetes)</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
