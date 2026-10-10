import React from 'react';
import {
  Lock,
  Sparkles,
  Calculator,
  ArrowRight,
  HardHat,
  Camera,
  MessageSquare,
  ClipboardCheck,
  Store
} from 'lucide-react';

interface ProjectsTeaserViewProps {
  onOpenLogin: () => void;
  /** Ir a la tienda (App usa los dos nombres según la pantalla) */
  onNavigateToStore?: () => void;
  onExploreStore?: () => void;
  /** Calculadora de pintura de la tienda (abre sin iniciar sesión) */
  onOpenCalculator?: () => void;
  /** Ya no se usan: el proyecto de ejemplo se retiró porque no tenía datos reales */
  onLoadDemo?: () => void;
  onOpenDemoProject?: () => void;
}

const PASOS = [
  { icon: Camera, titulo: 'Describe tu obra', texto: 'Área, tipo de superficie, ambiente, estado actual y una foto del muro o piso.' },
  { icon: Sparkles, titulo: 'Diagnóstico preliminar', texto: 'La IA sugiere un sistema de preparación, imprimante y acabado según lo que describes.' },
  { icon: Calculator, titulo: 'Estimado de materiales', texto: 'Calculamos galones y cuñetes aproximados con manos y desperdicio.' },
  { icon: MessageSquare, titulo: 'Tu asesor confirma', texto: 'Un asesor revisa el proyecto, te envía la cotización definitiva y te responde por chat.' }
];

/** Presentación del módulo de proyectos para quien aún no inicia sesión. */
export const ProjectsTeaserView: React.FC<ProjectsTeaserViewProps> = ({
  onOpenLogin,
  onNavigateToStore,
  onExploreStore,
  onOpenCalculator
}) => {
  const irATienda = onNavigateToStore || onExploreStore;

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-100 py-10 sm:py-12 px-4 sm:px-6 lg:px-8 font-sans relative overflow-hidden">
      <div className="absolute top-0 left-1/4 w-[600px] max-w-full h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[600px] max-w-full h-[600px] bg-blue-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12 relative z-10">

        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <HardHat className="w-4 h-4" />
            <span>Proyectos y cotizaciones</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Cotiza la pintura de tu obra con acompañamiento de un asesor
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Registra tu proyecto, recibe un diagnóstico preliminar y un estimado de materiales, y sigue el estado de la cotización desde tu cuenta.
          </p>
        </div>

        <div className="bg-slate-900/90 border-2 border-emerald-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="space-y-3 text-center md:text-left">
            <div className="inline-flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Lock className="w-4 h-4" />
              <span>Necesitas una cuenta</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">¿Listo para cotizar tu proyecto?</h2>
            <p className="text-slate-400 text-sm max-w-xl leading-relaxed">
              Inicia sesión o crea tu cuenta gratis para guardar tus proyectos, recibir cotizaciones y hablar con tu asesor.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              type="button"
              onClick={onOpenLogin}
              className="py-3.5 px-6 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Iniciar sesión / Registrarse</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            {onOpenCalculator && (
              <button
                type="button"
                onClick={onOpenCalculator}
                className="py-3.5 px-6 bg-white/10 hover:bg-white/20 active:scale-95 text-white font-bold text-sm rounded-xl border border-white/20 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Calculator className="w-4 h-4" />
                <span>Calcular pintura</span>
              </button>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-400" />
            <span>Cómo funciona</span>
          </h3>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {PASOS.map(({ icon: Icon, titulo, texto }, i) => (
              <li key={titulo} className="bg-slate-800/80 rounded-2xl p-5 border border-slate-700/80 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black flex items-center justify-center">{i + 1}</span>
                  <Icon className="w-5 h-5 text-emerald-400" />
                </div>
                <h4 className="font-bold text-white text-sm">{titulo}</h4>
                <p className="text-xs text-slate-400 leading-relaxed">{texto}</p>
              </li>
            ))}
          </ol>
          <p className="text-[11px] text-slate-500">
            El diagnóstico y el estimado son orientativos; la cotización definitiva la confirma tu asesor.
          </p>
        </div>

        {irATienda && (
          <div className="text-center">
            <button
              type="button"
              onClick={irATienda}
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-300 hover:text-emerald-200 hover:underline cursor-pointer"
            >
              <Store className="w-4 h-4" />
              ¿Solo necesitas comprar pintura? Ve a la tienda
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
