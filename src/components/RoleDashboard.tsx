import React, { useState, useEffect } from 'react';
import { UserProfile, ProjectFormData, CalculationBreakdown, ActiveTab } from '../types';
import { ProjectDetailModal } from './ProjectDetailModal';
import { ESTADO_CLIENTE, SUPERFICIE_LABEL } from './ClientProjectsManager';
import {
  Building2,
  Layers,
  FileText,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Truck,
  TrendingUp,
  DollarSign,
  Users,
  Package,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Calendar,
  MapPin,
  Droplet,
  ExternalLink,
  MessageSquareQuote,
  Plus,
  MessageSquare
} from 'lucide-react';

// Pasos que ve el cliente, calculados del estado real del proyecto
const PASOS = ['Recibido', 'Cotizado', 'Aprobado', 'Despachado'];
const pasoActual = (p: any): number => {
  switch (p.estadoPipeline) {
    case 'cotizado': case 'en_peritaje': case 'rechazado': return 1;
    case 'aprobado_calidad': return 2;
    case 'despachado': return 3;
    default: return 0;
  }
};
const PROXIMO_PASO: Record<string, string> = {
  en_revision: 'Tu asesor revisa la solicitud y prepara la cotización.',
  imagen_por_corregir: 'Sube una nueva foto del área para continuar.',
  en_peritaje: 'Un perito de calidad revisa la superficie antes de aprobar el sistema.',
  cotizado: 'Revisa la cotización y escríbele a tu asesor si tienes dudas.',
  aprobado_calidad: 'Coordinamos el despacho del material a tu obra.',
  rechazado: 'Tu asesor te contará los ajustes técnicos que se requieren.',
  despachado: 'El material va en camino; confirma la recepción en obra.',
  cancelado: 'Este proyecto fue cerrado.'
};

interface RoleDashboardProps {
  user: UserProfile;
  formData: ProjectFormData;
  calculation: CalculationBreakdown;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenPdfModal: () => void;
  onOpenAssistant: () => void;
  onStartNewAiQuote?: () => void;
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  user,
  formData,
  calculation,
  setActiveTab,
  onOpenPdfModal,
  onOpenAssistant,
  onStartNewAiQuote
}) => {

  const [misProyectos, setMisProyectos] = useState<any[]>([]);
  const [loadingMisProyectos, setLoadingMisProyectos] = useState(true);
  const [detalleSel, setDetalleSel] = useState<{ id: string; chat: boolean } | null>(null);
  const setDetalle = (d: { p: any; chat: boolean } | null) => setDetalleSel(d ? { id: d.p.proyectoId, chat: d.chat } : null);

  const cargarProyectos = () =>
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => { if (data.success && Array.isArray(data.projects)) setMisProyectos(data.projects); })
      .catch(() => undefined);

  useEffect(() => {
    if (user.role !== 'cliente') return;
    cargarProyectos().finally(() => setLoadingMisProyectos(false));
    const id = setInterval(() => { if (document.visibilityState === 'visible') cargarProyectos(); }, 30000);
    return () => clearInterval(id);
  }, [user.role]);

  const detalleP = detalleSel ? misProyectos.find(x => x.proyectoId === detalleSel.id) : null;
  const detalle = detalleP && detalleSel ? { p: detalleP, chat: detalleSel.chat } : null;
  const proyectosCola = misProyectos.slice(0, 4); // los 4 más recientes/actualizados
  const proyectoReciente = proyectosCola[0];

  const tieneActualizacion = (p: any) => {
    const u = new Date(p.updatedAt).getTime(), c = new Date(p.createdAt).getTime();
    return Number.isFinite(u) && Number.isFinite(c) && u > c + 5 * 60 * 1000; // 5 minutos
  };
  const nombreAsesor = (a: any) => `${a?.nombre || ''} ${a?.apellido || ''}`.trim();
  const money = (n: any) => `$${Math.round(Number(n) || 0).toLocaleString('es-CO')}`;

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => { if (data.success) setStats(data.stats); })
      .catch(() => undefined);
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

      {/* 1. TOP WELCOME BANNER WITH USER PROFILE & ROLE CONTEXT */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0F224A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{user.role === 'cliente' ? 'Portal de clientes' : 'Equipo ColorLink'}</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hola{user.firstName || user.name ? `, ${user.firstName || user.name}` : ''}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              {user.role === 'cliente' && user.company ? (
                <>Cuenta de <strong className="text-white">{user.company}</strong>{user.documentId ? ` · NIT ${user.documentId}` : ''}{user.city ? ` · ${user.city}` : ''}</>
              ) : (
                <>{user.role === 'cliente' ? 'Tus proyectos de pintura y cotizaciones' : (user.department || 'Equipo ColorLink')}{user.city ? ` · ${user.city}` : ''}</>
              )}
            </p>
          </div>
        </div>

        {/* Action button in hero banner */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          {user.role === 'cliente' && (
            <>
              <button
                type="button"
                onClick={() => onStartNewAiQuote ? onStartNewAiQuote() : setActiveTab('nueva_cotizacion_ia' as ActiveTab)}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Nueva cotización con IA</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('captura')}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Ver mis proyectos</span>
              </button>
            </>
          )}

        </div>
      </div>

      {/* 2. ROLE SPECIFIC DASHBOARD CONTENT */}

      {/* ========================================================================= */}
      {/* 2.A CLIENTE DASHBOARD */}
      {/* ========================================================================= */}
      {user.role === 'cliente' && (
        <div className="space-y-6">
          {loadingMisProyectos ? (
            <div className="bg-white rounded-3xl p-10 border border-slate-200 shadow-xs text-center text-slate-400 text-sm">
              Cargando tus proyectos...
            </div>
          ) : !proyectoReciente ? (
            // Sin proyectos aún: llamado a la acción claro, sin datos inventados
            <div className="bg-white rounded-3xl p-10 border border-dashed border-slate-300 shadow-xs text-center space-y-4">
              <Layers className="w-10 h-10 text-slate-300 mx-auto" />
              <div>
                <h3 className="font-black text-slate-900 text-base">Aún no tienes ninguna cotización</h3>
                <p className="text-xs text-slate-500 mt-1">Empieza tu primer proyecto y deja que la IA diagnostique la patología de tu superficie.</p>
              </div>
              <button
                onClick={() => onStartNewAiQuote ? onStartNewAiQuote() : setActiveTab('nueva_cotizacion_ia' as ActiveTab)}
                className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Iniciar Nueva Cotización IA</span>
              </button>
            </div>
          ) : (
            <>
              {/* Key Metrics Grid — resumen del más reciente */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proyecto Más Reciente</span>
                  <div className="text-xl font-extrabold text-slate-900 truncate">{proyectoReciente.nombreProyecto}</div>
                  <span className="text-xs font-semibold text-emerald-700">{[proyectoReciente.area ? `${Number(proyectoReciente.area).toLocaleString('es-CO')} m²` : null, SUPERFICIE_LABEL[proyectoReciente.tipoSuperficie] || proyectoReciente.tipoSuperficie].filter(Boolean).join(' • ') || '—'}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Material Requerido</span>
                  <div className="text-xl font-extrabold text-slate-900">
                    {proyectoReciente.cotizaciones?.[0] && (proyectoReciente.cotizaciones[0].cunetes5g != null || proyectoReciente.cotizaciones[0].galones1g != null)
                      ? `${proyectoReciente.cotizaciones[0].cunetes5g ?? 0} cuñ. + ${proyectoReciente.cotizaciones[0].galones1g ?? 0} gal`
                      : 'Por cotizar'}
                  </div>
                  <span className="text-xs text-slate-500">Según la última cotización</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Presupuesto Estimado</span>
                  <div className="text-xl font-extrabold text-emerald-600">
                    {proyectoReciente.cotizaciones?.[0]?.total ? money(proyectoReciente.cotizaciones[0].total) : 'Por cotizar'}
                  </div>
                  <span className="text-xs text-slate-500">Incluye IVA</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proyectos Totales</span>
                  <div className="text-xl font-extrabold text-blue-700">{misProyectos.length}</div>
                  <span className="text-xs text-slate-500">En tu cuenta</span>
                </div>
              </div>

              {/* Una tarjeta detallada por cada proyecto reciente */}
              <div className="space-y-4">
                {proyectosCola.map((p) => (
                  <div key={p.proyectoId} className="bg-white rounded-3xl p-4 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {tieneActualizacion(p) && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Actualización reciente" />
                          )}
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            PRY-{String(p.proyectoId || '').slice(0, 8).toUpperCase()}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {p.empresa?.ciudad?.ciudad || '—'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-900 break-words">{p.nombreProyecto || 'Proyecto'}</h3>
                        {p.diagnostico?.patologiaDetectada && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.diagnostico.patologiaDetectada}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">
                          Color: {p.color || 'Por definir'}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">
                          Superficie: {SUPERFICIE_LABEL[p.tipoSuperficie] || p.tipoSuperficie || '—'}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Estado del Proyecto:</span>
                        {p.estadoPipeline === 'cancelado' ? (
                          <p className="text-xs font-bold text-slate-500 bg-slate-100 rounded-lg p-2 border border-slate-200">Proyecto cancelado</p>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
                            {PASOS.map((paso, i) => {
                              const actual = pasoActual(p);
                              const etiqueta = i === 3 && p.despacho?.fechaEntrega ? 'Entregado' : paso;
                              const clase = i < actual
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                : i === actual
                                  ? 'bg-[#14216B] text-white border-[#14216B]'
                                  : 'bg-slate-50 text-slate-400 border-slate-200';
                              return (
                                <div key={paso} className={`p-2 font-bold rounded-lg border ${clase}`} aria-current={i === actual ? 'step' : undefined}>
                                  {i + 1}. {etiqueta}
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <p className="text-[11px] text-slate-500">
                          Estado actual: <strong className="text-slate-700">{(ESTADO_CLIENTE[p.estadoPipeline] || ESTADO_CLIENTE.en_revision).label}</strong>
                        </p>
                      </div>
                    </div>

                    <div className="lg:col-span-4 bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.18em]">Seguimiento Comercial</span>
                          {p.mensajesSinLeer > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-red-600 text-white text-[10px] font-black px-2 py-1">
                              <MessageSquare className="w-3 h-3" />
                              {p.mensajesSinLeer} {p.mensajesSinLeer === 1 ? 'mensaje nuevo' : 'mensajes nuevos'}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          {p.asesorAsignado?.avatarUrl ? (
                            <img src={p.asesorAsignado.avatarUrl} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-sm" />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border-2 border-emerald-500 shadow-sm font-black">
                              {p.asesorAsignado?.nombre ? p.asesorAsignado.nombre.charAt(0).toUpperCase() : <Users className="w-5 h-5" />}
                            </div>
                          )}
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                              {p.asesorAsignado ? nombreAsesor(p.asesorAsignado) : 'Equipo ColorLink'}
                            </h4>
                            <p className="text-xs text-slate-500 truncate">
                              {p.asesorAsignado ? (p.asesorAsignado.email || 'Tu asesor asignado') : 'Un asesor revisará tu proyecto pronto'}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                          <div className="text-[10px] font-bold text-slate-500 uppercase">Próximo paso</div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {PROXIMO_PASO[p.estadoPipeline] || PROXIMO_PASO.en_revision}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => setDetalle({ p, chat: true })}
                          className="w-full py-2.5 bg-white hover:bg-slate-50 text-slate-900 border border-slate-300 font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer inline-flex items-center justify-center gap-1.5"
                        >
                          <MessageSquare className="w-4 h-4" />
                          {p.asesorAsignado ? `Escribir a ${p.asesorAsignado.nombre}` : 'Escribir al equipo ColorLink'}
                        </button>
                        <button
                          onClick={() => setDetalle({ p, chat: false })}
                          className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all cursor-pointer text-center block"
                        >
                          Ver Detalle Completo
                        </button>
                      </div>
                    </div>
                  </div>
               ))}
            </div>

          {
            misProyectos.length > proyectosCola.length && (
              <div className="text-center">
                <button type="button" onClick={() => setActiveTab('captura')} className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer">
                  Ver los {misProyectos.length - proyectosCola.length} proyectos restantes en Mis Proyectos →
                </button>
              </div>
            )
          }
        </>
      )}
    </div>
  )
}

      {/* ========================================================================= */}
      {/* 2.B EQUIPO COLORLINK: la gestión se hace en el ERP; aquí solo cifras reales */}
      {/* ========================================================================= */}
      {user.role !== 'cliente' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proyectos registrados</span>
              <div className="text-2xl font-black text-slate-900">{stats ? Number(stats.totalProyectos || 0).toLocaleString('es-CO') : '—'}</div>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Volumen cotizado</span>
              <div className="text-2xl font-black text-emerald-600">{stats ? money(stats.volumenCotizado) : '—'}</div>
              <span className="text-xs text-slate-500">COP, última cotización de cada proyecto</span>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Área total</span>
              <div className="text-2xl font-black text-purple-700">{stats ? `${Number(stats.areaTotal || 0).toLocaleString('es-CO')} m²` : '—'}</div>
            </div>
            {user.role === 'calidad' && stats && (
              <>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peritajes pendientes</span>
                  <div className="text-2xl font-black text-purple-900">{Number(stats.peritajesPendientes || 0)}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Aprobados por calidad</span>
                  <div className="text-2xl font-black text-emerald-600">{Number(stats.certificadosEmitidos || 0)}</div>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Humedad promedio</span>
                  <div className="text-2xl font-black text-amber-600">{Number(stats.humedadPromedio || 0)}%</div>
                </div>
              </>
            )}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 space-y-1">
            <h3 className="text-lg font-black text-blue-950">Gestión en el ERP</h3>
            <p className="text-xs text-blue-800">
              La bandeja de proyectos, los peritajes de calidad, el inventario y los despachos se manejan en el ERP de ColorLink. Esta tienda muestra solo el resumen.
            </p>
          </div>
        </div>
      )}

      {detalle && (
        <ProjectDetailModal
          key={detalle.p.proyectoId}
          project={detalle.p}
          estado={ESTADO_CLIENTE[detalle.p.estadoPipeline] || ESTADO_CLIENTE.en_revision}
          clienteNombre={user.name}
          clienteEmail={user.email}
          focusChat={detalle.chat}
          onMessagesRead={() => {
            if (detalle.p.mensajesSinLeer) {
              setMisProyectos(prev => prev.map(x => x.proyectoId === detalle.p.proyectoId ? { ...x, mensajesSinLeer: 0 } : x));
              window.dispatchEvent(new Event('colorlink:notificaciones'));
            }
          }}
          onClose={() => { setDetalle(null); cargarProyectos(); }}
        />
      )}
        </div >
      );
};
