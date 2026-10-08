import React from 'react';
import { 
  Sparkles, 
  Droplet, 
  ShieldCheck, 
  Truck, 
  Calculator, 
  Cpu, 
  Star, 
  Layers, 
  ArrowRight, 
  CheckCircle2, 
  Building2, 
  Award,
  PhoneCall,
  Paintbrush
} from 'lucide-react';

interface WelcomeLandingProps {
  onStartProject: () => void;
  onGoToLogin: () => void;
  onLoadDemo: () => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({
  onStartProject,
  onGoToLogin,
  onLoadDemo
}) => {
  const testimonials = [
    {
      name: 'Ing. Carlos Mendoza',
      company: 'Constructora Horizonte S.A.S. (Medellín)',
      role: 'Director de Obra',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
      comment: 'Con ColorLink cotizamos 85 m² de fachada en minutos. El diagnóstico de fisuras con IA y el cálculo exacto de cuñetes nos ahorró un 18% en desperdicio.',
      rating: 5,
      project: 'Fachada Residencial El Poblado'
    },
    {
      name: 'Arq. Valentina Restrepo',
      company: 'Restrepo & Asociados Arquitectura',
      role: 'Especificadora Técnica',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=120&auto=format&fit=crop&q=80',
      comment: 'La ficha técnica oficial en PDF con desglose de IVA y carta de colores RAL/NCS nos permite entregar propuestas ejecutivas a comités de copropiedad al instante.',
      rating: 5,
      project: 'Restauración Edificio Laureles'
    },
    {
      name: 'Maestro Jorge Henao',
      company: 'Contratistas Unidos del Aburrá',
      role: 'Maestro Pintor Pro',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=120&auto=format&fit=crop&q=80',
      comment: 'El sistema de stock en tiempo real y despacho directo a obra en Medellín nos garantiza que el lote de pintura y el sellador antialcalino llegan el mismo día.',
      rating: 5,
      project: 'Parqueaderos & Muros Industriales Itagüí'
    }
  ];

  const features = [
    {
      icon: Cpu,
      title: 'Diagnóstico IA de Patologías',
      description: 'Detección automática de humedad capilar, fisuras y caleo sobre concreto, revoque o drywall recomendando el sistema multicapa exacto.',
      badge: 'Gemini Engine'
    },
    {
      icon: Calculator,
      title: 'Motor de Rendimiento & Cuñetes',
      description: 'Cálculo volumétrico según absorción de sustrato y manos requeridas. Desglose en Cuñetes de 5 Galones y Galones individuales.',
      badge: 'Cero Desperdicio'
    },
    {
      icon: Truck,
      title: 'Despacho Directo en 24h',
      description: 'Conexión con bodegas y tintometría en Medellín y Área Metropolitana para despacho prioritario con verificación de lote.',
      badge: 'Medellín & Antioquia'
    },
    {
      icon: Award,
      title: 'Ficha Técnica Oficial en PDF',
      description: 'Generación instantánea de certificado técnico, cotización con IVA discriminado y garantía de recubrimiento para contratistas.',
      badge: 'Norma NTC / ISO'
    }
  ];

  return (
    <div className="space-y-12 py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      
      {/* 1. HERO SECTION & PROPRIETARY SLOGAN */}
      <section className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-[#0F224A] via-[#163674] to-[#0A1A3A] text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-blue-900/60">
        <div className="absolute -right-16 -top-16 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-400/15 border border-cyan-400/40 text-cyan-300 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Sistema Profesional de Pinturas & Recubrimientos</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
            Transformamos espacios con <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-amber-300">precisión técnica</span> y respaldo total.
          </h1>

          {/* Proprietary Slogan */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15">
            <p className="text-sm sm:text-base font-semibold text-cyan-200 italic">
              "ColorLink: La inteligencia técnica que cotiza, diagnostica y abastece la pintura perfecta para tu obra en el Valle de Aburrá."
            </p>
          </div>

          <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
            Plataforma integral para constructoras, contratistas y arquitectos. Diagnostica patologías de muro, calcula el rendimiento por metro cuadrado y genera cotizaciones ejecutivas con entrega garantizada en 24 horas.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              id="btn-hero-start-project"
              onClick={onStartProject}
              className="px-6 py-3.5 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-sm rounded-xl shadow-lg flex items-center gap-2 transition-all cursor-pointer hover:scale-105"
            >
              <Paintbrush className="w-4 h-4 text-slate-950" />
              <span>Cotizar Proyecto Ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="btn-hero-load-demo"
              onClick={onLoadDemo}
              className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-xl border border-white/20 flex items-center gap-2 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-cyan-300" />
              <span>Ver Caso Demo (Fachada 85m²)</span>
            </button>

            <button
              id="btn-hero-login"
              onClick={onGoToLogin}
              className="px-5 py-3.5 bg-blue-900/60 hover:bg-blue-900 text-blue-200 font-bold text-xs sm:text-sm rounded-xl border border-blue-700/50 flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Portal de Clientes & NIT</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. WHAT WE DO / NUESTROS PILARES */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-black tracking-wider uppercase text-cyan-700 bg-cyan-50 px-3 py-1 rounded-full border border-cyan-200">
            ¿Qué Hacemos en ColorLink?
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            Ingeniería de Color y Recubrimientos de Alta Especificación
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Acompañamos tu proyecto de principio a fin con tecnología, química de materiales y logística local.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="p-6 bg-white rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-md hover:border-cyan-400/60 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-cyan-700 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-slate-950 transition-colors shadow-xs">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {feat.badge}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 text-cyan-700 text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Garantía de Rendimiento</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. TESTIMONIALS & OPINIONES DE CLIENTES */}
      <section className="bg-slate-50 rounded-3xl p-8 sm:p-10 border border-slate-200 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-black tracking-wider uppercase text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Confianza Comprobada en Obra
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Lo que Dicen Nuestros Clientes
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Constructores, arquitectos y maestros que confían su especificación y suministro a ColorLink.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-xs shrink-0">
            <div className="flex text-amber-400">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <span className="text-xs font-black text-slate-800">4.9 / 5.0 (140+ Obras)</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, idx) => (
            <div 
              key={idx}
              className="p-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex text-amber-400 gap-0.5">
                  {[...Array(t.rating)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "{t.comment}"
                </p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-3">
                <img 
                  src={t.avatar} 
                  alt={t.name} 
                  className="w-10 h-10 rounded-full object-cover border border-cyan-500" 
                />
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">{t.name}</h4>
                  <p className="text-[10px] text-slate-500">{t.role}</p>
                  <span className="text-[9px] font-bold text-cyan-700 block truncate max-w-[180px]">
                    {t.company}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. CALL TO ACTION FOOTER BANNER */}
      <section className="bg-gradient-to-r from-[#0F224A] to-[#1E3A8A] text-white p-8 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
        <div className="space-y-2 text-center sm:text-left">
          <h3 className="text-xl sm:text-2xl font-black">
            ¿Listo para calcular y cotizar la pintura de tu obra?
          </h3>
          <p className="text-xs sm:text-sm text-blue-200 max-w-xl">
            Inicia ingresando las dimensiones del proyecto o consulta con nuestro asesor técnico por WhatsApp.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={onStartProject}
            className="px-6 py-3 bg-cyan-400 hover:bg-cyan-300 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all cursor-pointer hover:scale-105"
          >
            Comenzar Captura
          </button>
        </div>
      </section>

    </div>
  );
};
