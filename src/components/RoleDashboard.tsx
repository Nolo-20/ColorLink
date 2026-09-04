import React from 'react';
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
}

export const RoleDashboard: React.FC<RoleDashboardProps> = ({
  user,
  formData,
  calculation,
  setActiveTab,
  onOpenPdfModal,
  onOpenAssistant
}) => {
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
              <button
                onClick={onOpenPdfModal}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-300" />
                <span>Descargar Ficha PDF</span>
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
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Proyecto Activo</span>
              <div className="text-xl font-extrabold text-slate-900 truncate">{formData.proyecto}</div>
              <span className="text-xs font-semibold text-emerald-700">{formData.areaM2} m² • {formData.superficie}</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Material Requerido</span>
              <div className="text-xl font-extrabold text-slate-900">
                {calculation.cunetesPintura5Gal} Cuñete + {calculation.galonesPintura1Gal} Gal
              </div>
              <span className="text-xs text-slate-500">Total {calculation.galonesPinturaExactos} Galones (2 manos)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Presupuesto Estimado</span>
              <div className="text-xl font-extrabold text-emerald-600">
                ${calculation.costoEstimadoCOP.totalCOP.toLocaleString('es-CO')}
              </div>
              <span className="text-xs text-slate-500">Incluye IVA 19% y sellador</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Despacho en Obra</span>
              <div className="text-xl font-extrabold text-blue-700">24 a 48 Horas</div>
              <span className="text-xs text-emerald-600 font-bold">✓ Stock Verificado en Itagüí</span>
            </div>
          </div>

          {/* Active Project Details Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                  Código: {formData.id}
                </span>
                <span className="text-xs font-bold text-slate-500">
                  {formData.ciudad}
                </span>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">{formData.proyecto}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{formData.descripcion}</p>
              </div>

              {/* Specs pill row */}
              <div className="flex flex-wrap gap-2 pt-2">
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">
                  🎨 Color: {formData.color}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">
                  🧱 Sustrato: {formData.superficie}
                </span>
                <span className="px-2.5 py-1 bg-slate-100 text-slate-800 text-xs font-semibold rounded-md">
                  💧 Patologías: {formData.condiciones.join(', ')}
                </span>
              </div>

              {/* Progress Stepper for client */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase">Estado del Pipeline:</span>
                <div className="grid grid-cols-4 gap-2 text-center text-xs">
                  <div className="p-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300">
                    1. Capturado
                  </div>
                  <div className="p-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300">
                    2. Validado
                  </div>
                  <div className="p-2 bg-emerald-100 text-emerald-800 font-bold rounded-lg border border-emerald-300">
                    3. Diagnóstico IA
                  </div>
                  <div className="p-2 bg-blue-100 text-blue-800 font-bold rounded-lg border border-blue-300">
                    4. Cotizado
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Advisor Contact Card */}
            <div className="lg:col-span-4 bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-wider block">
                  Asesor Técnico Asignado
                </span>
                <div className="flex items-center gap-3">
                  <img 
                    src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" 
                    alt="Asesor Juan David" 
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                  />
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">Juan David Osorio</h4>
                    <p className="text-xs text-slate-500">Asesor de Pinturas & Recubrimientos</p>
                    <span className="text-[10px] font-bold text-emerald-700">En línea • Medellín</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">
                  "Tu proyecto de fachada ya cuenta con análisis de rendimiento y sellador antialcalino incluido."
                </p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('motor_tecnico')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow transition-all cursor-pointer text-center block"
                >
                  Ver Cotización Detallada
                </button>
                <button
                  onClick={onOpenAssistant}
                  className="w-full py-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs rounded-xl border border-emerald-300 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Consultar con Asistente IA</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2.B ASESOR COMERCIAL & TÉCNICO DASHBOARD */}
      {/* ========================================================================= */}
      {user.role === 'asesor' && (
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
      )}

      {/* ========================================================================= */}
      {/* 2.C CONTROL DE CALIDAD DASHBOARD */}
      {/* ========================================================================= */}
      {user.role === 'calidad' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Peritajes Pendientes</span>
              <div className="text-2xl font-black text-purple-900">2 Obras</div>
              <span className="text-xs text-purple-700 font-semibold">1 Concreto / 1 Revoque</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Certificados Emitidos</span>
              <div className="text-2xl font-black text-emerald-600">128 Certificaciones</div>
              <span className="text-xs text-slate-500">Norma NTC 5828 & ISO</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Índice Humedad Promedio</span>
              <div className="text-2xl font-black text-amber-600">18.4%</div>
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
      )}

      {/* ========================================================================= */}
      {/* 2.D ADMINISTRADOR / BODEGA DASHBOARD */}
      {/* ========================================================================= */}
      {user.role === 'administrador' && (
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
      )}

    </div>
  );
};
