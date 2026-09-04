import React, { useState } from 'react';
import { ProjectFormData, CalculationBreakdown, UserProfile, SurfaceType, SpaceEnvironment, SurfaceCondition, ColorTone } from '../types';
import { COLOR_PALETTES } from '../data/mockData';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Ruler, 
  Palette, 
  Calendar, 
  Plus, 
  FileText, 
  Download, 
  Phone, 
  CheckCircle2, 
  Clock, 
  Droplet, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft,
  UploadCloud,
  Trash2,
  Package,
  ShieldCheck
} from 'lucide-react';

interface ClientProjectsManagerProps {
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  calculation: CalculationBreakdown;
  user: UserProfile;
  onOpenPdfModal: () => void;
  onOpenAssistant: () => void;
}

export const ClientProjectsManager: React.FC<ClientProjectsManagerProps> = ({
  formData,
  setFormData,
  calculation,
  user,
  onOpenPdfModal,
  onOpenAssistant
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  // Sample client projects list (realistic for Colombian construction)
  const [clientProjects, setClientProjects] = useState([
    {
      id: formData.id || 'CLK-PRJ-2026-MED-085',
      nombre: formData.proyecto || 'Torre Residencial Poblado - Fachada Sur',
      ciudad: formData.ciudad || 'Medellín',
      areaM2: formData.areaM2 || 85,
      superficie: 'Revoque / Pañete',
      ambiente: 'Exterior Fachada',
      linea: 'Koraza Tech 100% Acrílica',
      color: formData.color || 'Blanco Nieve',
      colorHex: formData.colorHex || '#F8FAFC',
      cunetes: 1,
      galones: 2,
      totalCOP: calculation.costoEstimadoCOP.totalCOP || 826931,
      estado: 'Cotizado / Listo para Despacho',
      fecha: '28 Feb 2026',
      asesor: 'Juan David Osorio (+57 314 789-2045)'
    },
    {
      id: 'CLK-PRJ-2026-MED-042',
      nombre: 'Edificio Laureles Park - Cielos Rasos & Pasillos',
      ciudad: 'Medellín',
      areaM2: 160,
      superficie: 'Drywall / Yeso',
      ambiente: 'Interior Habitacional',
      linea: 'Vinilo Tipo 1 Blanco Hielo',
      color: 'Blanco Puro',
      colorHex: '#FFFFFF',
      cunetes: 2,
      galones: 1,
      totalCOP: 980500,
      estado: 'En Producción Tintometría',
      fecha: '24 Feb 2026',
      asesor: 'Juan David Osorio (+57 314 789-2045)'
    },
    {
      id: 'CLK-PRJ-2026-ENV-019',
      nombre: 'Parqueadero Subterráneo Torre Envigado',
      ciudad: 'Envigado',
      areaM2: 320,
      superficie: 'Concreto Vaciado',
      ambiente: 'Pisos & Tráfico Pesado',
      linea: 'Esmalte Epóxico Alto Tráfico',
      color: 'Gris Cemento',
      colorHex: '#94A3B8',
      cunetes: 4,
      galones: 2,
      totalCOP: 2640000,
      estado: 'Aprobado en Obra',
      fecha: '18 Feb 2026',
      asesor: 'Juan David Osorio (+57 314 789-2045)'
    }
  ]);

  const surfaces: Array<{ id: SurfaceType; label: string; desc: string; icon: string }> = [
    { id: 'revoque', label: 'Revoque / Pañete', desc: 'Mortero tradicional o afinado', icon: '🏗️' },
    { id: 'concreto', label: 'Concreto', desc: 'Vaciado o muros estructurales', icon: '🧱' },
    { id: 'ladrillo', label: 'Ladrillo a la Vista', desc: 'Arcilla o tolete estructural', icon: '🧱' },
    { id: 'drywall', label: 'Drywall / Yeso', desc: 'Placas interiores o cielos', icon: '⬜' },
    { id: 'metal', label: 'Estructura Metálica', desc: 'Acero galvanizado o hierro', icon: '⚙️' }
  ];

  const environments: Array<{ id: SpaceEnvironment; label: string; desc: string }> = [
    { id: 'exterior_fachada', label: 'Exterior Fachada', desc: 'Sol UV, lluvia y máxima intemperie' },
    { id: 'interior_muros', label: 'Interior Muros & Cielos', desc: 'Espacios habitacionales o comerciales' },
    { id: 'zona_humeda', label: 'Zona Húmeda / Baños', desc: 'Vapor constante y resistencia a hongos' },
    { id: 'trafico_pesado_piso', label: 'Pisos & Tráfico Pesado', desc: 'Parqueaderos y zonas de alto flujo' }
  ];

  const handleSaveAndCalculate = () => {
    // Add current formData as a new project in the list
    const newProject = {
      id: `CLK-PRJ-2026-${Math.floor(100 + Math.random() * 900)}`,
      nombre: formData.proyecto || 'Nueva Obra Cotizada',
      ciudad: formData.ciudad || 'Medellín',
      areaM2: formData.areaM2 || 50,
      superficie: formData.superficie,
      ambiente: formData.ambiente,
      linea: formData.ambiente === 'exterior_fachada' ? 'Koraza Tech 100% Acrílica' : 'Vinilo Tipo 1 Alta Lavabilidad',
      color: formData.color || 'Blanco Nieve',
      colorHex: formData.colorHex || '#F8FAFC',
      cunetes: calculation.cunetesPintura5Gal,
      galones: calculation.galonesPintura1Gal,
      totalCOP: calculation.costoEstimadoCOP.totalCOP,
      estado: 'Cotizado / Listo para Despacho',
      fecha: 'Hoy',
      asesor: 'Juan David Osorio (+57 314 789-2045)'
    };

    setClientProjects(prev => [newProject, ...prev]);
    setViewMode('list');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5" />
            <span>Portal de Proyectos • {user.company || 'Constructora Horizonte S.A.S.'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {viewMode === 'list' ? 'Mis Proyectos & Cotizaciones' : 'Nueva Cotización de Pintura'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            {viewMode === 'list' 
              ? 'Consulta el estado de tus obras, rendimiento de cuñetes calculados y descarga cotizaciones comerciales con IVA.'
              : 'Ingresa los metros cuadrados y características de la obra para calcular los cuñetes y galones exactos.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {viewMode === 'list' ? (
            <button
              id="btn-crear-nuevo-proyecto"
              onClick={() => { setViewMode('create'); setActiveStep(1); }}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>+ Crear Nuevo Proyecto</span>
            </button>
          ) : (
            <button
              onClick={() => setViewMode('list')}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a Mis Proyectos</span>
            </button>
          )}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* VIEW MODE 1: LIST OF REQUESTED PROJECTS */}
      {/* ========================================================================= */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          
          <div className="flex items-center justify-between">
            <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
              <Layers className="w-4 h-4 text-emerald-600" />
              <span>Proyectos Registrados ({clientProjects.length})</span>
            </h2>
            <span className="text-xs text-slate-500">Valle de Aburrá • Despacho directo a obra</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientProjects.map((prj, idx) => (
              <div 
                key={prj.id || idx}
                className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Card Top */}
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                      {prj.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      prj.estado.includes('Listo') 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                        : prj.estado.includes('Producción')
                        ? 'bg-amber-50 text-amber-700 border-amber-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}>
                      {prj.estado}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-900 leading-snug">
                    {prj.nombre}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{prj.ciudad} • {prj.superficie}</span>
                  </div>
                </div>

                {/* Paint Spec & Calculated Buckets */}
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Área a pintar:</span>
                    <span className="font-extrabold text-slate-900">{prj.areaM2} m²</span>
                  </div>

                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Línea & Color:</span>
                    <div className="flex items-center gap-1.5">
                      <span 
                        className="w-3 h-3 rounded-full border border-slate-300 shadow-xs shrink-0" 
                        style={{ backgroundColor: prj.colorHex }} 
                      />
                      <span className="font-bold text-slate-800">{prj.color}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] font-bold text-emerald-700">Consumo Calculado:</span>
                    <span className="text-xs font-black text-slate-900 bg-emerald-100/70 px-2 py-0.5 rounded text-emerald-950">
                      {prj.cunetes} Cuñete{prj.cunetes !== 1 ? 's' : ''} (5G) + {prj.galones} Gal{prj.galones !== 1 ? 'ones' : ''}
                    </span>
                  </div>
                </div>

                {/* Price & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">Total Cotizado (con IVA)</span>
                    <span className="text-base font-black text-slate-900">
                      ${prj.totalCOP.toLocaleString('es-CO')} <span className="text-[10px] text-slate-500 font-medium">COP</span>
                    </span>
                  </div>

                  <button
                    onClick={onOpenPdfModal}
                    className="p-2.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                    title="Descargar Ficha y Cotización PDF"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Support Banner */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-emerald-950">¿Requieres visita técnica o muestra de color en obra?</h4>
                <p className="text-[11px] text-emerald-800">Tu asesor comercial Juan David Osorio está asignado a tu cuenta corporativa.</p>
              </div>
            </div>
            <button
              onClick={onOpenAssistant}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              Consultar con Asistente
            </button>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* VIEW MODE 2: CREATE NEW PROJECT & QUOTE WIZARD (SIMPLE & NON-TECHNICAL) */}
      {/* ========================================================================= */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-200 space-y-6">
          
          {/* Wizard Step Indicator */}
          <div className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-100 text-center">
            <button
              onClick={() => setActiveStep(1)}
              className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeStep === 1 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
              }`}
            >
              1. Datos de la Obra
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeStep === 2 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
              }`}
            >
              2. Metraje & Superficie
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${
                activeStep === 3 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
              }`}
            >
              3. Color & Resumen
            </button>
          </div>

          {/* STEP 1: Basic Project Info */}
          {activeStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-sm text-slate-900">Identificación del Proyecto de Pintura</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Nombre del Proyecto / Obra *</label>
                  <input
                    type="text"
                    value={formData.proyecto}
                    onChange={(e) => setFormData(prev => ({ ...prev, proyecto: e.target.value }))}
                    placeholder="Ej: Fachada Principal Edificio Horizonte"
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 placeholder-slate-400 rounded-xl text-xs font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 block">Ciudad / Municipio *</label>
                  <select
                    value={formData.ciudad}
                    onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl text-xs font-medium border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Medellín">Medellín</option>
                    <option value="Envigado">Envigado</option>
                    <option value="Itagüí">Itagüí</option>
                    <option value="Sabaneta">Sabaneta</option>
                    <option value="Bello">Bello</option>
                    <option value="Rionegro">Rionegro</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Ambiente o Destino del Espacio *</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {environments.map((env) => (
                    <button
                      key={env.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, ambiente: env.id }))}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        formData.ambiente === env.id
                          ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-xs font-extrabold block">{env.label}</span>
                      <span className="text-[11px] text-slate-500 block">{env.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continuar a Metraje</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Area & Surface */}
          {activeStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-sm text-slate-900">Dimensiones y Tipo de Superficie</h3>

              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div>
                  <label className="text-xs font-bold text-emerald-950 block">Área Total a Pintar (Metros Cuadrados) *</label>
                  <p className="text-[11px] text-emerald-800">Ingresa los metros cuadrados calculados para la obra.</p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min="5"
                    max="10000"
                    value={formData.areaM2}
                    onChange={(e) => setFormData(prev => ({ ...prev, areaM2: Math.max(1, Number(e.target.value)) }))}
                    className="w-28 px-3 py-2 bg-white text-slate-900 font-black text-center text-lg rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                  <span className="text-xs font-black text-emerald-950">m²</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">Tipo de Sustrato / Material *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {surfaces.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, superficie: s.id }))}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        formData.superficie === s.id
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span className="text-base mb-1 block">{s.icon}</span>
                      <span className="text-xs font-extrabold block leading-tight">{s.label}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex justify-between pt-4">
                <button
                  type="button"
                  onClick={() => setActiveStep(1)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={() => setActiveStep(3)}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5"
                >
                  <span>Continuar a Color & Cotización</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Color, Finish & Instant Calculation */}
          {activeStep === 3 && (
            <div className="space-y-5 animate-in fade-in duration-200">
              <h3 className="font-extrabold text-sm text-slate-900">Selección de Color y Resultado de Cotización</h3>

              {/* Color Swatches */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Color de Acabado Solicitado</label>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTES.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color: tone.name, colorHex: tone.hex }))}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                        formData.color === tone.name
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'
                      }`}
                    >
                      <span 
                        className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs" 
                        style={{ backgroundColor: tone.hex }} 
                      />
                      <span>{tone.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* COMMERCIAL CALCULATION CARD */}
              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                      Resultado Comercial Oficial
                    </span>
                    <h4 className="font-black text-sm text-white">{formData.proyecto} ({formData.areaM2} m²)</h4>
                  </div>
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
                    2 Manos • {formData.ambiente === 'exterior_fachada' ? 'Koraza Tech' : 'Vinilo Tipo 1'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Cuñetes (5G)</span>
                    <span className="text-xl font-black text-emerald-400">{calculation.cunetesPintura5Gal}</span>
                    <span className="text-[10px] text-slate-500 block">Baldes de 5 Galones</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Galones (1G)</span>
                    <span className="text-xl font-black text-emerald-400">{calculation.galonesPintura1Gal}</span>
                    <span className="text-[10px] text-slate-500 block">Para remates exactos</span>
                  </div>

                  <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-medium">Total con IVA</span>
                    <span className="text-lg font-black text-white">
                      ${calculation.costoEstimadoCOP.totalCOP.toLocaleString('es-CO')}
                    </span>
                    <span className="text-[10px] text-slate-500 block">COP Listo para facturar</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
                  <span>Bodega Asignada: <strong>Centro Logístico Itagüí</strong></span>
                  <span className="text-emerald-400 font-semibold">Despacho en obra en 24h</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveStep(2)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Atrás
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={onOpenPdfModal}
                    className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Descargar PDF</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleSaveAndCalculate}
                    className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-1.5 transition-all hover:scale-[1.01]"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Guardar en Mis Proyectos</span>
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
