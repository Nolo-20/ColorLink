import React, { useState, useEffect } from 'react';
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

// Estados reales del proyecto (los mueve el equipo desde el ERP) con texto para el cliente
const ESTADO_CLIENTE: Record<string, { label: string; detalle: string; clase: string }> = {
  en_revision: { label: 'En revisión', detalle: 'Nuestro equipo está revisando tu solicitud.', clase: 'bg-blue-50 text-blue-700 border-blue-200' },
  imagen_por_corregir: { label: 'Imagen por corregir', detalle: 'Necesitamos otra foto para continuar.', clase: 'bg-rose-50 text-rose-700 border-rose-200' },
  en_peritaje: { label: 'En peritaje', detalle: 'Un perito técnico está evaluando la superficie.', clase: 'bg-violet-50 text-violet-700 border-violet-200' },
  cotizado: { label: 'Cotizado', detalle: 'Tu cotización está lista.', clase: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  aprobado_calidad: { label: 'Aprobado por calidad', detalle: 'El sistema fue aprobado y pasa a despacho.', clase: 'bg-teal-50 text-teal-700 border-teal-200' },
  rechazado: { label: 'Requiere ajustes', detalle: 'El perito pidió ajustes técnicos; te contactaremos.', clase: 'bg-amber-50 text-amber-700 border-amber-200' },
  despachado: { label: 'Despachado', detalle: 'Tu pedido va en camino a la obra.', clase: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  cancelado: { label: 'Cancelado', detalle: 'Este proyecto fue cerrado.', clase: 'bg-slate-100 text-slate-600 border-slate-200' }
};
const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGEN_MB = 8;

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
  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  // El cliente sube la imagen que le pidió el equipo; el proyecto vuelve a "en revisión"
  const handleReplaceImage = async (proyectoId: string, file: File | undefined) => {
    if (!file) return;
    const fallo = (msg: string) => setUploadError(prev => ({ ...prev, [proyectoId]: msg }));
    if (!TIPOS_IMAGEN.includes(file.type)) return fallo('La imagen debe ser PNG, JPG o WEBP.');
    if (file.size > MAX_IMAGEN_MB * 1024 * 1024) return fallo(`La imagen no puede pesar más de ${MAX_IMAGEN_MB} MB.`);

    setUploadingId(proyectoId);
    setUploadError(prev => ({ ...prev, [proyectoId]: '' }));
    try {
      const dataUri: string = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('No se pudo leer la imagen'));
        reader.readAsDataURL(file);
      });
      const response = await fetch(`/api/projects/${proyectoId}/image`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageBase64: dataUri })
      });
      const data = await response.json();
      if (!data.success) return fallo(data.error || 'No se pudo enviar la imagen.');
      setClientProjects(prev => prev.map(p => p.proyectoId === proyectoId ? { ...p, ...data.project } : p));
    } catch {
      fallo('Error de conexión al enviar la imagen.');
    } finally {
      setUploadingId(null);
    }
  };

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.success) setClientProjects(data.projects);
      })
      .finally(() => setLoadingProjects(false));
  }, []);

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

  const handleSaveAndCalculate = async () => {
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreProyecto: formData.proyecto || 'Nueva Obra Cotizada',
          ciudad: formData.ciudad,
          area: formData.areaM2,
          tipoSuperficie: formData.superficie,
          ambiente: formData.ambiente,
          color: formData.color,
          colorHex: formData.colorHex,
          cunetes5g: calculation.cunetesPintura5Gal,
          galones1g: calculation.galonesPintura1Gal,
          total: calculation.costoEstimadoCOP.totalCOP,
          imageBase64: formData.fotos?.[0]?.base64 || null
        })
      });
      const data = await response.json();

      if (!data.success) {
        alert(data.error || 'No se pudo guardar el proyecto');
        return;
      }

      setClientProjects(prev => [data.project, ...prev]);
      setViewMode('list');
    } catch (err) {
      console.error('Error guardando proyecto:', err);
      alert('Error de conexión al guardar el proyecto');
    }
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
              <span>Proyectos Registrados ({loadingProjects ? '...' : clientProjects.length})</span>
            </h2>
            <span className="text-xs text-slate-500">Valle de Aburrá • Despacho directo a obra</span>
          </div>

          {!loadingProjects && clientProjects.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
              <Layers className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm text-slate-500 font-medium">Aún no tienes proyectos registrados.</p>
              <p className="text-xs text-slate-400">Crea tu primera cotización con el botón de arriba.</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientProjects.map((prj, idx) => {
              const cot = prj.cotizaciones?.[0]; // cotización más reciente de este proyecto
              return (
                <div
                  key={prj.proyectoId || idx}
                  className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
                >
                  {/* Card Top */}
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        {prj.proyectoId?.slice(0, 8)}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${(ESTADO_CLIENTE[prj.estadoPipeline] || ESTADO_CLIENTE.en_revision).clase}`}>
                        {(ESTADO_CLIENTE[prj.estadoPipeline] || { label: prj.estadoPipeline || 'Nuevo' }).label}
                      </span>
                    </div>

                    {ESTADO_CLIENTE[prj.estadoPipeline] && (
                      <p className="text-[11px] text-slate-500 leading-snug">{ESTADO_CLIENTE[prj.estadoPipeline].detalle}</p>
                    )}

                    {prj.estadoPipeline === 'imagen_por_corregir' && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                        <p className="text-[11px] font-bold text-rose-800">Pedimos una nueva imagen</p>
                        {prj.observacionImagen && (
                          <p className="text-[11px] text-rose-700 leading-snug">{prj.observacionImagen}</p>
                        )}
                        <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white cursor-pointer ${uploadingId === prj.proyectoId ? 'bg-slate-400' : 'bg-rose-600 hover:bg-rose-700'}`}>
                          <UploadCloud className="w-3.5 h-3.5" />
                          {uploadingId === prj.proyectoId ? 'Enviando…' : 'Subir otra imagen'}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="hidden"
                            disabled={uploadingId === prj.proyectoId}
                            onChange={(e) => { handleReplaceImage(prj.proyectoId, e.target.files?.[0]); e.target.value = ''; }}
                          />
                        </label>
                        {uploadError[prj.proyectoId] && (
                          <p className="text-[11px] font-semibold text-red-700">{uploadError[prj.proyectoId]}</p>
                        )}
                      </div>
                    )}

                    <h3 className="font-bold text-sm text-slate-900 leading-snug">
                      {prj.nombreProyecto}
                    </h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{prj.empresa?.ciudad?.ciudad || 'Medellín'} • {prj.tipoSuperficie}</span>
                    </div>
                  </div>

                  {/* Paint Spec & Calculated Buckets */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Área a pintar:</span>
                      <span className="font-extrabold text-slate-900">{prj.area || 0} m²</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Color:</span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-300 shadow-xs shrink-0"
                          style={{ backgroundColor: prj.colorHex || '#F8FAFC' }}
                        />
                        <span className="font-bold text-slate-800">{prj.color || 'Sin definir'}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-emerald-700">Consumo Calculado:</span>
                      <span className="text-xs font-black text-slate-900 bg-emerald-100/70 px-2 py-0.5 rounded text-emerald-950">
                        {cot?.cunetes5g ?? 0} Cuñete{cot?.cunetes5g !== 1 ? 's' : ''} (5G) + {cot?.galones1g ?? 0} Gal{cot?.galones1g !== 1 ? 'ones' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Price & Action Buttons */}
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total Cotizado (con IVA)</span>
                      <span className="text-base font-black text-slate-900">
                        ${(cot?.total ?? 0).toLocaleString('es-CO')} <span className="text-[10px] text-slate-500 font-medium">COP</span>
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
              );
            })}
          </div>

          {/* Quick Support Banner */}
          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-emerald-950">¿Requieres visita técnica o muestra de color en obra?</h4>
                <p className="text-[11px] text-emerald-800">Un asesor comercial de ColorLink acompaña cada uno de tus proyectos.</p>
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
              className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeStep === 1 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
                }`}
            >
              1. Datos de la Obra
            </button>
            <button
              onClick={() => setActiveStep(2)}
              className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeStep === 2 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
                }`}
            >
              2. Metraje & Superficie
            </button>
            <button
              onClick={() => setActiveStep(3)}
              className={`py-2 px-3 rounded-xl text-xs font-bold cursor-pointer transition-all ${activeStep === 3 ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600'
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
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${formData.ambiente === env.id
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
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${formData.superficie === s.id
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
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${formData.color === tone.name
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
