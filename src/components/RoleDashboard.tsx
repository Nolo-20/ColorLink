import React, { useState, useEffect } from 'react';
import { UserProfile, ProjectFormData, CalculationBreakdown, ActiveTab } from '../types';
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
  Plus
} from 'lucide-react';

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

  useEffect(() => {
    if (user.role === 'cliente') {
      fetch('/api/projects')
        .then(res => res.json())
        .then(data => { if (data.success) setMisProyectos(data.projects); })
        .finally(() => setLoadingMisProyectos(false));
    }
  }, [user.role]);

  const proyectosCola = misProyectos.slice(0, 4); // los 4 más recientes/actualizados
  const proyectoReciente = proyectosCola[0];

  const tieneActualizacion = (p: any) =>
    new Date(p.updatedAt).getTime() > new Date(p.createdAt).getTime() + 5 * 60 * 1000; // 5 minutos

  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/dashboard/stats')
      .then(res => res.json())
      .then(data => { if (data.success) setStats(data.stats); });
  }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

      {/* 1. TOP WELCOME BANNER WITH USER PROFILE & ROLE CONTEXT */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-[#0F224A] text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-700/60 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-3 z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Sesión Activa: {user.role === 'cliente' ? 'Portal de Clientes' : user.role === 'asesor' ? 'Módulo de Asesoría Técnica' : user.role === 'calidad' ? 'Laboratorio & Calidad NTC' : 'Gestión de Bodega & Inventario'}</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Hola, {user.firstName || user.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm">
              {user.role === 'cliente' && user.company ? (
                <>Panel Corporativo de <strong className="text-white">{user.company}</strong> (NIT: {user.documentId || '901.458.789-3'}) • {user.city}</>
              ) : (
                <>{user.department || 'Equipo Especialista ColorLink'} • {user.city}</>
              )}
            </p>
          </div>
        </div>

        {/* Action button in hero banner */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          {user.role === 'cliente' && (
            <>
              <button
                onClick={() => setActiveTab('captura')}
                className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Nuevo Proyecto de Pintura</span>
              </button>
            </>
          )}

          {user.role === 'asesor' && (
            <button
              onClick={() => setActiveTab('proyectos_asesor')}
              className="px-4 py-2.5 bg-blue-500 hover:bg-blue-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4" />
              <span>Gestionar Proyectos de Clientes</span>
            </button>
          )}

          {user.role === 'calidad' && (
            <button
              onClick={() => setActiveTab('calidad_revision')}
              className="px-4 py-2.5 bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Panel de Peritaje & Sustratos</span>
            </button>
          )}

          {user.role === 'administrador' && (
            <button
              onClick={() => setActiveTab('inventario')}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>Ver Inventario de Bodega</span>
            </button>
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
                onClick={() => onStartNewAiQuote ? onStartNewAiQuote() : setActiveTab('nueva_cotizacion_ia')}
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
                  <span className="text-xs font-semibold text-emerald-700">{proyectoReciente.area || 0} m² • {proyectoReciente.tipoSuperficie || 'N/A'}</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Material Requerido</span>
                  <div className="text-xl font-extrabold text-slate-900">
                    {proyectoReciente.cotizaciones?.[0]?.cunetes5g ?? 0} Cuñete + {proyectoReciente.cotizaciones?.[0]?.galones1g ?? 0} Gal
                  </div>
                  <span className="text-xs text-slate-500">Última cotización generada</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Presupuesto Estimado</span>
                  <div className="text-xl font-extrabold text-emerald-600">
                    ${(proyectoReciente.cotizaciones?.[0]?.total ?? 0).toLocaleString('es-CO')}
                  </div>
                  <span className="text-xs text-slate-500">Incluye IVA 19%</span>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proyectos Totales</span>
                  <div className="text-xl font-extrabold text-blue-700">{misProyectos.length}</div>
                  <span className="text-xs text-slate-500">En tu cuenta corporativa</span>
                </div>
              </div>

              {/* Una tarjeta detallada por cada proyecto reciente */}
              <div className="space-y-4">
                {proyectosCola.map((p) => (
                  <div key={p.proyectoId} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6">
                    <div className="lg:col-span-8 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {tieneActualizacion(p) && (
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" title="Actualización reciente" />
                          )}
                          <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                            Código: {p.proyectoId.slice(0, 8)}
                          </span>
                        </div>
                        <span className="text-xs font-bold text-slate-500">
                          {p.empresa?.ciudad?.ciudad || 'N/A'}
                        </span>
                      </div>

                      <div>
                        <h3 className="text-xl font-black text-slate-900">{p.nombreProyecto}</h3>
                        {p.diagnostico?.patologiaDetectada && (
                          <p className="text-xs text-slate-600 mt-1 leading-relaxed">{p.diagnostico.patologiaDetectada}</p>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 pt-2">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">
                          🎨 Color: {p.color || 'N/A'}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">
                          🧱 Sustrato: {p.tipoSuperficie || 'N/A'}
                        </span>
                      </div>

                      <div className="pt-4 border-t border-slate-100 space-y-2">
                        <span className="text-[11px] font-bold text-slate-500 uppercase">Estado del Proyecto:</span>
                        <div className="grid grid-cols-4 gap-2 text-center text-xs">
                          <div className="p-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300">1. Capturado</div>
                          <div className="p-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300">2. Validado</div>
                          <div className={`p-2 font-bold rounded-lg border ${p.diagnostico ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-slate-100 text-slate-500 border-slate-200'}`}>3. Diagnóstico IA</div>
                          <div className={`p-2 font-bold rounded-lg border ${p.estadoPipeline === 'aprobado_calidad' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                            {p.estadoPipeline === 'aprobado_calidad' ? '4. Aprobado' : '4. Cotizado'}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-4 bg-gradient-to-br from-slate-50 to-emerald-50 rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between gap-4">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.18em]">Seguimiento Comercial</span>
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Activo
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center border-2 border-emerald-500 shadow-sm">
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-extrabold text-sm text-slate-900 truncate">
                              {p.asesorAsignado ? `${p.asesorAsignado.nombre} ${p.asesorAsignado.apellido}` : 'Equipo ColorLink'}
                            </h4>
                            <p className="text-xs text-slate-500">
                              {p.asesorAsignado ? 'Tu asesor asignado' : 'Un asesor revisará tu proyecto pronto'}
                            </p>
                          </div>
                        </div>

                        <div className="rounded-xl bg-white border border-slate-200 p-3 space-y-2">
                          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase">
                            <span>Próximo paso</span>
                            <span className="text-emerald-700">24h</span>
                          </div>
                          <p className="text-xs text-slate-700 leading-relaxed">
                            {p.asesorAsignado
                              ? 'Revisión y coordinación de la cotización con el cliente.'
                              : 'Asignación de asesor y revisión comercial del proyecto.'}
                          </p>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <button
                          onClick={() => setActiveTab('captura')}
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
                <button onClick={() => setActiveTab('captura')} className="text-xs font-bold text-emerald-700 hover:underline">
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

{/* ========================================================================= */ }
{/* 2.B ASESOR COMERCIAL & TÉCNICO DASHBOARD */ }
{/* ========================================================================= */ }
{
  user.role === 'asesor' && (
    <div className="space-y-6">
      {/* Asesor Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proyectos Asignados</span>
          <div className="text-2xl font-black text-slate-900">4 Obras</div>
          <span className="text-xs text-blue-600 font-semibold">Valle de Aburrá</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Volumen Cotizado</span>
          <div className="text-2xl font-black text-emerald-600">$14.280.000</div>
          <span className="text-xs text-slate-500">COP en cartera activa</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Área Total Evaluada</span>
          <div className="text-2xl font-black text-purple-700">895 m²</div>
          <span className="text-xs text-slate-500">Fachadas, pisos y drywall</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Margen de Ajuste</span>
          <div className="text-2xl font-black text-amber-600">Hasta 15%</div>
          <span className="text-xs text-slate-500">Descuentos autorizados</span>
        </div>
      </div>

      {/* Direct CTA to Manager */}
      <div className="bg-blue-50 border border-blue-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-blue-950">Módulo de Modificación Manual para Asesores</h3>
          <p className="text-xs text-blue-800">
            Puedes ingresar a cualquiera de las 4 obras de clientes para ajustar metrajes, aplicar descuentos comerciales o cambiar la formulación de acabado.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('proyectos_asesor')}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Abrir Bandeja de Proyectos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

{/* ========================================================================= */ }
{/* 2.C CONTROL DE CALIDAD DASHBOARD */ }
{/* ========================================================================= */ }
{
  user.role === 'calidad' && (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peritajes Pendientes</span>
          <div className="text-2xl font-black text-purple-900">{stats ? stats.peritajesPendientes : '...'} Obras</div>
          <span className="text-xs text-purple-700 font-semibold">Pendientes de dictamen</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Certificados Emitidos</span>
          <div className="text-2xl font-black text-emerald-600">{stats ? stats.certificadosEmitidos : '...'} Certificaciones</div>
          <span className="text-xs text-slate-500">Norma NTC 5828 & ISO</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Índice Humedad Promedio</span>
          <div className="text-2xl font-black text-amber-600">{stats ? stats.humedadPromedio : '...'}%</div>
          <span className="text-xs text-slate-500">Requiere sellador hidrófugo</span>
        </div>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-purple-950">Panel de Inspección de Patologías & Sustratos</h3>
          <p className="text-xs text-purple-800">
            Dictamina el estado técnico de fisuras, humedad capilar y caleo en las obras enviadas por los clientes.
          </p>
        </div>
        <button
          onClick={() => setActiveTab('calidad_revision')}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow shrink-0 cursor-pointer flex items-center gap-2"
        >
          <span>Revisar Patologías</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

{/* ========================================================================= */ }
{/* 2.D ADMINISTRADOR / BODEGA DASHBOARD */ }
{/* ========================================================================= */ }
{
  user.role === 'administrador' && (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock Cuñetes (5G)</span>
          <div className="text-2xl font-black text-slate-900">57 Cuñetes</div>
          <span className="text-xs text-emerald-600 font-bold">Bodega Central Itagüí</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stock Galones (1G)</span>
          <div className="text-2xl font-black text-slate-900">169 Galones</div>
          <span className="text-xs text-slate-500">Centro Logístico Guayabal</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Alertas de Bajo Stock</span>
          <div className="text-2xl font-black text-amber-600">1 SKU Crítico</div>
          <span className="text-xs text-amber-700 font-semibold">Vinilo Satinado Rionegro</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Lotes Activos</span>
          <div className="text-2xl font-black text-blue-700">5 Lotes</div>
          <span className="text-xs text-slate-500">Tintometría calibrada</span>
        </div>
      </div>

      <div className="bg-slate-900 text-white rounded-3xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-white">Módulo de Inventario, Bodegas & Monitoreo</h3>
          <p className="text-xs text-slate-300">
            Controla existencias físicas de cuñetes, lotes de tintometría y el estado operativo del sistema API.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('trazabilidad_arquitectura')}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 shadow shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Monitoreo & Logs</span>
          </button>
          <button
            onClick={() => setActiveTab('inventario')}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow shrink-0 cursor-pointer flex items-center gap-2"
          >
            <span>Abrir Inventario</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

        </div >
      );
};
