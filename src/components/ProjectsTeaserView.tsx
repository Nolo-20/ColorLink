import React from 'react';
import { 
  Building2, 
  Lock, 
  Sparkles, 
  FileText, 
  CheckCircle2, 
  Calculator, 
  Truck, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Layers,
  HardHat
} from 'lucide-react';

interface ProjectsTeaserViewProps {
  onOpenLogin: () => void;
  onLoadDemo: () => void;
  onNavigateToStore: () => void;
}

export const ProjectsTeaserView: React.FC<ProjectsTeaserViewProps> = ({
  onOpenLogin,
  onLoadDemo,
  onNavigateToStore
}) => {
  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      
      {/* Background Tech Glow */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">
        
        {/* 1. Header & Motivation */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <HardHat className="w-4 h-4" />
            <span>Módulo Profesional para Constructoras & Contratistas</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Ingeniería de recubrimientos y control de cubicaje para tu obra
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Centraliza el cálculo exacto de cuñetes, peritaje técnico de sustrato con Inteligencia Artificial, 
            dosificación de manos y despacho directo a pie de obra en Medellín y Colombia.
          </p>
        </div>

        {/* 2. Login Prompt & Motivation Card */}
        <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-8">
          
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>Acceso Restringido a Profesionales Registrados</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">
              ¿Listo para cotizar o administrar los materiales de tu proyecto?
            </h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Inicia sesión con tu cuenta corporativa o regístrate en 30 segundos para acceder a los precios institucionales por cuñete y generar actas técnicas.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={onOpenLogin}
              className="py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Iniciar Sesión / Registrarse</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onLoadDemo}
              className="py-3.5 px-6 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-sm rounded-xl border border-white/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Ver Proyecto de Ejemplo</span>
            </button>
          </div>

        </div>

        {/* 3. Real Project Showcase: How Projects Look Inside */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <span>Así se gestionan las obras en ColorLink</span>
              </h3>
              <p className="text-xs text-slate-400">Proyectos activos en ejecución con cubicaje y trazabilidad</p>
            </div>
            <span className="text-xs text-emerald-400 font-bold hidden sm:inline-block">Plataforma en tiempo real</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Project 1 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  EN PRODUCCIÓN • 72%
                </span>
                <span className="text-xs text-slate-400">Medellín</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Torre Residencial San Jerónimo</h4>
                <p className="text-xs text-slate-400">Constructora Horizonte S.A.S.</p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Área Fachada:</span>
                  <span className="font-bold text-white">2.850 m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Material Asignado:</span>
                  <span className="font-bold text-emerald-400">114 Cuñetes Koraza</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Dictamen IA:</span>
                  <span className="font-bold text-emerald-400">Sustrato Óptimo</span>
                </div>
              </div>
            </div>

            {/* Project 2 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  DESPACHO APROBADO
                </span>
                <span className="text-xs text-slate-400">Rionegro</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Parque Logístico Celta Park</h4>
                <p className="text-xs text-slate-400">Inversiones Inmobiliarias Andina</p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Área de Pisos:</span>
                  <span className="font-bold text-white">4.200 m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Material Asignado:</span>
                  <span className="font-bold text-cyan-400">Epóxico 100% Sólidos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Lote Tintométrico:</span>
                  <span className="font-bold text-white">Gris Tráfico RAL 7035</span>
                </div>
              </div>
            </div>

            {/* Project 3 */}
            <div className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-4 hover:border-emerald-500/40 transition-colors">
              <div className="flex items-start justify-between">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  REVISIÓN CALIDAD
                </span>
                <span className="text-xs text-slate-400">Itagüí</span>
              </div>
              <div>
                <h4 className="font-bold text-white text-base">Clínica Las Américas Piso 4</h4>
                <p className="text-xs text-slate-400">Consorcio Salud Aburrá</p>
              </div>
              <div className="space-y-1.5 text-xs text-slate-300 border-t border-slate-700/60 pt-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">Área Aséptica:</span>
                  <span className="font-bold text-white">1.100 m²</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Material Asignado:</span>
                  <span className="font-bold text-purple-300">Viniltex Antibacterial</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Certificación:</span>
                  <span className="font-bold text-white">Aprobada INVIMA</span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* 4. Professional Benefits Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <Sparkles className="w-6 h-6 text-emerald-400" />
            <h4 className="font-bold text-white text-sm">Diagnóstico con IA</h4>
            <p className="text-xs text-slate-400">Detecta fisuras, eflorescencias y humedad por capilaridad cargando fotos del muro.</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <Calculator className="w-6 h-6 text-amber-400" />
            <h4 className="font-bold text-white text-sm">Cálculo de Cuñetes</h4>
            <p className="text-xs text-slate-400">Descuenta vanos de puertas y ventanas para calcular galones y cuñetes sin desperdicio.</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <FileText className="w-6 h-6 text-blue-400" />
            <h4 className="font-bold text-white text-sm">Ficha Técnica en PDF</h4>
            <p className="text-xs text-slate-400">Exporta propuestas con dosificación, preparación de superficie y tiempos de curado.</p>
          </div>

          <div className="bg-slate-900/60 p-5 rounded-2xl border border-slate-800 space-y-2">
            <Truck className="w-6 h-6 text-cyan-400" />
            <h4 className="font-bold text-white text-sm">Despacho en 24 Horas</h4>
            <p className="text-xs text-slate-400">Entrega programada directamente al almacén de obra con montacargas o descarga a pie.</p>
          </div>
        </div>

      </div>
    </div>
  );
};
