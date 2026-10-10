import React, { useState, useEffect, useRef } from 'react';
import { ProjectFormData, CalculationBreakdown, UserProfile, SurfaceType, SpaceEnvironment, SurfaceCondition, ColorTone } from '../types';
import { COLOR_PALETTES } from '../data/mockData';
import { ProjectDetailModal } from './ProjectDetailModal';
import {
  MessageSquare,
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
  /** Proyecto a abrir apenas cargue la lista (desde una notificación) */
  focusProject?: { id: string; chat: boolean } | null;
  onFocusHandled?: () => void;
  /** Avisa que cambió el número de mensajes sin leer (para refrescar la campana) */
  onMessagesRead?: () => void;
}

// Estados reales del proyecto (los mueve el equipo desde el ERP) con texto para el cliente
export const ESTADO_CLIENTE: Record<string, { label: string; detalle: string; clase: string }> = {
  en_revision: { label: 'En revisión', detalle: 'Nuestro equipo está revisando tu solicitud.', clase: 'bg-blue-50 text-blue-700 border-blue-200' },
  imagen_por_corregir: { label: 'Imagen por corregir', detalle: 'Necesitamos otra foto para continuar.', clase: 'bg-rose-50 text-rose-700 border-rose-200' },
  en_peritaje: { label: 'En peritaje', detalle: 'Un perito técnico está evaluando la superficie.', clase: 'bg-violet-50 text-violet-700 border-violet-200' },
  cotizado: { label: 'Cotizado', detalle: 'Tu cotización está lista.', clase: 'bg-green-50 text-green-700 border-green-200' },
  aprobado_calidad: { label: 'Aprobado por calidad', detalle: 'El sistema fue aprobado y pasa a despacho.', clase: 'bg-teal-50 text-teal-700 border-teal-200' },
  rechazado: { label: 'Requiere ajustes', detalle: 'El perito pidió ajustes técnicos; te contactaremos.', clase: 'bg-amber-50 text-amber-700 border-amber-200' },
  despachado: { label: 'Despachado', detalle: 'Tu pedido va en camino a la obra.', clase: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  cancelado: { label: 'Cancelado', detalle: 'Este proyecto fue cerrado.', clase: 'bg-slate-100 text-slate-600 border-slate-200' }
};
const TIPOS_IMAGEN = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_IMAGEN_MB = 8;

/** Ciudades que se ofrecen al crear un proyecto */
export const CIUDADES_PROYECTO = [
  'Medellín', 'Envigado', 'Itagüí', 'Sabaneta', 'Bello', 'La Estrella', 'Caldas', 'Copacabana', 'Girardota', 'Rionegro',
  'Bogotá', 'Cali', 'Barranquilla', 'Cartagena', 'Bucaramanga', 'Pereira', 'Manizales', 'Armenia'
];

export const SUPERFICIE_LABEL: Record<string, string> = {
  concreto: 'Concreto', revoque: 'Revoque / pañete', ladrillo: 'Ladrillo', drywall: 'Drywall / yeso', metal: 'Metal', madera: 'Madera'
};
export const AMBIENTE_LABEL: Record<string, string> = {
  exterior_fachada: 'Exterior / fachada', interior_muros: 'Interior', zona_humeda: 'Zona húmeda', trafico_pesado_piso: 'Piso de tráfico pesado', cubierta_techo: 'Cubierta / techo'
};

export const AREA_MAX_M2 = 10000;
/** Reglas del nombre del proyecto (el servidor solo exige que exista) */
export const errorNombreProyecto = (v: string) => {
  const t = (v || '').trim();
  if (!t) return 'Escribe el nombre del proyecto.';
  if (t.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
  if (t.length > 100) return 'El nombre puede tener máximo 100 caracteres.';
  return '';
};
export const errorArea = (n: number) => {
  if (!Number.isFinite(n) || n <= 0) return 'Escribe un área mayor que 0 m².';
  if (n > AREA_MAX_M2) return `El área máxima es ${AREA_MAX_M2.toLocaleString('es-CO')} m².`;
  return '';
};
const money = (n?: number | null) => `$${Math.round(Number(n) || 0).toLocaleString('es-CO')}`;

export const ClientProjectsManager: React.FC<ClientProjectsManagerProps> = ({
  formData,
  setFormData,
  calculation,
  user,
  onOpenAssistant,
  focusProject,
  onFocusHandled,
  onMessagesRead
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'create'>('list');
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);

  const [clientProjects, setClientProjects] = useState<any[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailChat, setDetailChat] = useState(false);
  const [uploadError, setUploadError] = useState<Record<string, string>>({});

  // Asistente de creación
  const [areaTexto, setAreaTexto] = useState('');
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const [guardando, setGuardando] = useState(false);
  const guardandoRef = useRef(false);
  const [errorGuardar, setErrorGuardar] = useState('');
  const [aviso, setAviso] = useState('');

  // Se guarda el id: el detalle siempre muestra la versión más reciente del proyecto
  const detailProject = clientProjects.find(p => p.proyectoId === detailId) || null;
  const abrirDetalle = (prj: any, chat = false) => { setDetailChat(chat); setDetailId(prj.proyectoId); };

  const recargarProyectos = () =>
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.success) { setClientProjects(Array.isArray(data.projects) ? data.projects : []); setLoadError(''); }
        else setLoadError(data.error || 'No se pudieron cargar tus proyectos.');
      })
      .catch(() => setLoadError('No hay conexión con el servidor.'));

  // El cliente sube la imagen que le pidió el equipo; el proyecto vuelve a "en revisión"
  const handleReplaceImage = async (proyectoId: string, file: File | undefined) => {
    if (!file || uploadingId) return;
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
      const data = await response.json().catch(() => ({}));
      if (!data.success) return fallo(data.error || 'No se pudo enviar la imagen.');
      setClientProjects(prev => prev.map(p => p.proyectoId === proyectoId ? { ...p, ...data.project } : p));
      recargarProyectos();
    } catch {
      fallo('Error de conexión al enviar la imagen.');
    } finally {
      setUploadingId(null);
    }
  };

  useEffect(() => {
    recargarProyectos().finally(() => setLoadingProjects(false));
    // Se refresca solo para ver cambios de estado y mensajes nuevos del asesor
    const id = setInterval(() => { if (document.visibilityState === 'visible') recargarProyectos(); }, 30000);
    return () => clearInterval(id);
  }, []);

  // Abrir el proyecto que viene de una notificación
  useEffect(() => {
    if (!focusProject || loadingProjects) return;
    const prj = clientProjects.find(p => p.proyectoId === focusProject.id);
    if (prj) { setViewMode('list'); abrirDetalle(prj, focusProject.chat); }
    onFocusHandled?.();
  }, [focusProject, loadingProjects]);

  const surfaces: Array<{ id: SurfaceType; label: string; desc: string }> = [
    { id: 'revoque', label: 'Revoque / Pañete', desc: 'Mortero tradicional o afinado' },
    { id: 'concreto', label: 'Concreto', desc: 'Vaciado o muros estructurales' },
    { id: 'ladrillo', label: 'Ladrillo a la vista', desc: 'Arcilla o tolete' },
    { id: 'drywall', label: 'Drywall / Yeso', desc: 'Placas interiores o cielos' },
    { id: 'metal', label: 'Estructura metálica', desc: 'Acero galvanizado o hierro' },
    { id: 'madera', label: 'Madera', desc: 'Tablillas o maciza' }
  ];

  const environments: Array<{ id: SpaceEnvironment; label: string; desc: string }> = [
    { id: 'exterior_fachada', label: 'Exterior / Fachada', desc: 'Sol, lluvia e intemperie' },
    { id: 'interior_muros', label: 'Interior: muros y cielos', desc: 'Espacios habitacionales o comerciales' },
    { id: 'zona_humeda', label: 'Zona húmeda / Baños', desc: 'Vapor constante y riesgo de hongos' },
    { id: 'trafico_pesado_piso', label: 'Pisos de tráfico pesado', desc: 'Parqueaderos y zonas de alto flujo' }
  ];

  const abrirCreacion = () => {
    const ciudadUsuario = CIUDADES_PROYECTO.includes(user.city) ? user.city : '';
    setFormData(prev => ({
      ...prev,
      id: '',
      proyecto: '',
      ciudad: ciudadUsuario,
      areaM2: 0,
      color: '',
      colorHex: '',
      fotos: []
    }));
    setAreaTexto('');
    setTocado({});
    setErrorGuardar('');
    setActiveStep(1);
    setViewMode('create');
  };

  const errores = {
    proyecto: errorNombreProyecto(formData.proyecto),
    ciudad: formData.ciudad ? '' : 'Elige la ciudad del proyecto.',
    area: errorArea(formData.areaM2)
  };
  const paso1Ok = !errores.proyecto && !errores.ciudad;
  const paso2Ok = !errores.area && !!formData.superficie;
  const irAPaso = (n: 1 | 2 | 3) => {
    if (n >= 2 && !paso1Ok) { setTocado(t => ({ ...t, proyecto: true, ciudad: true })); setActiveStep(1); return; }
    if (n === 3 && !paso2Ok) { setTocado(t => ({ ...t, area: true })); setActiveStep(2); return; }
    setActiveStep(n);
  };

  const cambiarArea = (texto: string) => {
    // Solo números positivos con hasta 2 decimales (acepta coma o punto)
    const limpio = texto.replace(',', '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const [ent, dec] = limpio.split('.');
    const final = dec !== undefined ? `${ent.slice(0, 5)}.${dec.slice(0, 2)}` : ent.slice(0, 5);
    setAreaTexto(final);
    const n = parseFloat(final);
    setFormData(prev => ({ ...prev, areaM2: Number.isFinite(n) ? n : 0 }));
  };

  const calculoAlDia = calculation.areaM2 === formData.areaM2;

  const handleSaveAndCalculate = async () => {
    setTocado({ proyecto: true, ciudad: true, area: true });
    if (!paso1Ok) { setActiveStep(1); return; }
    if (!paso2Ok) { setActiveStep(2); return; }
    if (guardandoRef.current) return;
    guardandoRef.current = true;
    setGuardando(true);
    setErrorGuardar('');
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreProyecto: formData.proyecto.trim().replace(/\s+/g, ' '),
          ciudad: formData.ciudad,
          area: formData.areaM2,
          tipoSuperficie: formData.superficie,
          ambiente: formData.ambiente,
          color: formData.color || null,
          colorHex: formData.colorHex || null,
          ...(calculoAlDia ? {
            cunetes5g: calculation.cunetesPintura5Gal,
            galones1g: calculation.galonesPintura1Gal,
            subtotal: calculation.costoEstimadoCOP.subtotal,
            iva: calculation.costoEstimadoCOP.iva19,
            total: calculation.costoEstimadoCOP.totalCOP
          } : {}),
          imageBase64: (formData.fotos?.[0] as any)?.base64 || null
        })
      });
      const data = await response.json().catch(() => ({}));
      if (!data.success) {
        setErrorGuardar(data.error || 'No se pudo guardar el proyecto.');
        return;
      }
      setClientProjects(prev => [data.project, ...prev]);
      setFormData(prev => ({ ...prev, id: data.project?.proyectoId || '' }));
      setViewMode('list');
      setAviso(`Proyecto "${data.project?.nombreProyecto || formData.proyecto}" guardado. Tu asesor lo revisará pronto.`);
      setTimeout(() => setAviso(''), 5000);
      recargarProyectos();
    } catch {
      setErrorGuardar('Error de conexión al guardar el proyecto. Intenta de nuevo.');
    } finally {
      guardandoRef.current = false;
      setGuardando(false);
    }
  };

  const inputErr = (campo: keyof typeof errores) => (tocado[campo] ? errores[campo] : '');

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">

      {/* Encabezado */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 rounded-3xl p-5 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5 min-w-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold max-w-full">
            <Building2 className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Portal de proyectos · {user.company || user.name || 'Tu cuenta'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {viewMode === 'list' ? 'Mis proyectos y cotizaciones' : 'Nueva cotización de pintura'}
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            {viewMode === 'list'
              ? 'Consulta el estado de tus proyectos, las cotizaciones de tu asesor y escríbele cuando lo necesites.'
              : 'Cuéntanos el área y las características de la obra; calculamos un estimado y tu asesor prepara la cotización final.'}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {viewMode === 'list' ? (
            <button
              id="btn-crear-nuevo-proyecto"
              type="button"
              onClick={abrirCreacion}
              className="px-5 py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center gap-2 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Crear nuevo proyecto</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setViewMode('list')}
              disabled={guardando}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl border border-slate-700 cursor-pointer flex items-center gap-2 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver a mis proyectos</span>
            </button>
          )}
        </div>
      </div>

      {aviso && viewMode === 'list' && (
        <div role="status" className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" /> {aviso}
        </div>
      )}

      {/* ============================ LISTA ============================ */}
      {viewMode === 'list' && (
        <div className="space-y-4">
          <h2 className="text-base font-extrabold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-600" />
            <span>Proyectos registrados {loadingProjects ? '' : `(${clientProjects.length})`}</span>
          </h2>

          {loadingProjects && (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 text-sm text-slate-400">Cargando tus proyectos…</div>
          )}

          {!loadingProjects && loadError && clientProjects.length === 0 && (
            <div className="text-center py-8 bg-red-50 rounded-2xl border border-red-200 space-y-2">
              <p className="text-sm font-bold text-red-700">{loadError}</p>
              <button type="button" onClick={() => recargarProyectos()} className="text-xs font-bold text-red-800 underline cursor-pointer">Reintentar</button>
            </div>
          )}

          {!loadingProjects && !loadError && clientProjects.length === 0 && (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <Layers className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-sm text-slate-500 font-medium">Aún no tienes proyectos registrados.</p>
              <button type="button" onClick={abrirCreacion} className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer">Crear mi primer proyecto</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clientProjects.map((prj, idx) => {
              const cot = prj.cotizaciones?.[0]; // cotización más reciente
              const estado = ESTADO_CLIENTE[prj.estadoPipeline];
              const ubicacion = [prj.empresa?.ciudad?.ciudad, SUPERFICIE_LABEL[prj.tipoSuperficie] || prj.tipoSuperficie].filter(Boolean).join(' • ');
              return (
                <div key={prj.proyectoId || idx} className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200/80 hover:shadow-md transition-all flex flex-col justify-between gap-4 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                        PRY-{String(prj.proyectoId || '').slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${(estado || ESTADO_CLIENTE.en_revision).clase}`}>
                        {estado ? estado.label : 'En revisión'}
                      </span>
                    </div>

                    {estado && <p className="text-[11px] text-slate-500 leading-snug">{estado.detalle}</p>}

                    {prj.estadoPipeline === 'imagen_por_corregir' && (
                      <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                        <p className="text-[11px] font-bold text-rose-800">Pedimos una nueva imagen</p>
                        {prj.observacionImagen && <p className="text-[11px] text-rose-700 leading-snug break-words">{prj.observacionImagen}</p>}
                        <label className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-[11px] font-bold text-white focus-within:outline-2 focus-within:outline-rose-800 ${uploadingId ? 'bg-slate-400 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700 cursor-pointer'}`}>
                          <UploadCloud className="w-3.5 h-3.5" />
                          {uploadingId === prj.proyectoId ? 'Enviando…' : 'Subir otra imagen'}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="sr-only"
                            disabled={!!uploadingId}
                            onChange={(e) => { handleReplaceImage(prj.proyectoId, e.target.files?.[0]); e.target.value = ''; }}
                          />
                        </label>
                        <p className="text-[10px] text-rose-700">PNG, JPG o WEBP · máximo {MAX_IMAGEN_MB} MB</p>
                        {uploadError[prj.proyectoId] && <p role="alert" className="text-[11px] font-semibold text-red-700">{uploadError[prj.proyectoId]}</p>}
                      </div>
                    )}

                    <h3 className="font-bold text-sm text-slate-900 leading-snug break-words">{prj.nombreProyecto || 'Proyecto sin nombre'}</h3>

                    <div className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{ubicacion || '—'}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => abrirDetalle(prj, true)}
                      className="w-full flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 px-3 py-2 text-left cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-[#14216B] shrink-0" />
                      <span className="min-w-0 flex-1 text-[11px] leading-tight">
                        <span className="block text-slate-500">{prj.asesorAsignado ? 'Tu asesor' : 'Asesor por asignar'}</span>
                        <span className="block font-bold text-slate-800 truncate">
                          {prj.asesorAsignado ? `${prj.asesorAsignado.nombre} ${prj.asesorAsignado.apellido || ''}`.trim() : 'Escríbele al equipo ColorLink'}
                        </span>
                      </span>
                      {prj.mensajesSinLeer > 0 ? (
                        <span className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center" title="Mensajes sin leer">
                          {prj.mensajesSinLeer > 9 ? '9+' : prj.mensajesSinLeer}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[11px] font-bold text-[#14216B]">Escribir</span>
                      )}
                    </button>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Área a pintar:</span>
                      <span className="font-extrabold text-slate-900">{prj.area ? `${Number(prj.area).toLocaleString('es-CO')} m²` : '—'}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs gap-2">
                      <span className="text-slate-500 font-medium">Color:</span>
                      <div className="flex items-center gap-1.5 min-w-0">
                        {prj.colorHex && <span className="w-3 h-3 rounded-full border border-slate-300 shadow-xs shrink-0" style={{ backgroundColor: prj.colorHex }} />}
                        <span className="font-bold text-slate-800 truncate">{prj.color || 'Por definir'}</span>
                      </div>
                    </div>
                    {cot && (cot.cunetes5g != null || cot.galones1g != null) && (
                      <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                        <span className="text-[11px] font-bold text-emerald-700">Pintura estimada:</span>
                        <span className="text-xs font-black px-2 py-0.5 rounded bg-emerald-100/70 text-emerald-950">
                          {cot.cunetes5g ?? 0} cuñete{cot.cunetes5g === 1 ? '' : 's'} + {cot.galones1g ?? 0} galón{cot.galones1g === 1 ? '' : 'es'}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-medium">Total cotizado (con IVA)</span>
                      <span className="text-base font-black text-slate-900">
                        {cot?.total ? <>{money(cot.total)} <span className="text-[10px] text-slate-500 font-medium">COP</span></> : <span className="text-sm text-slate-500">Por cotizar</span>}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => abrirDetalle(prj)}
                      className="px-3 py-2 bg-[#14216B] hover:bg-[#0f1a55] text-white rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold shrink-0"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Ver detalle</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">
                <Phone className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-emerald-950">¿Tienes dudas sobre colores, productos o cantidades?</h4>
                <p className="text-[11px] text-emerald-800">Pregúntale al asistente o escríbele a tu asesor desde cada proyecto.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onOpenAssistant}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors shrink-0"
            >
              Consultar con el asistente
            </button>
          </div>
        </div>
      )}

      {/* ============================ CREAR PROYECTO ============================ */}
      {viewMode === 'create' && (
        <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-md border border-slate-200 space-y-6">

          <ol className="grid grid-cols-3 gap-2 pb-4 border-b border-slate-100 text-center">
            {([[1, 'Datos de la obra'], [2, 'Área y superficie'], [3, 'Color y resumen']] as const).map(([n, label]) => (
              <li key={n}>
                <button
                  type="button"
                  onClick={() => irAPaso(n)}
                  aria-current={activeStep === n ? 'step' : undefined}
                  className={`w-full py-2 px-2 sm:px-3 rounded-xl text-[11px] sm:text-xs font-bold cursor-pointer transition-all ${activeStep === n ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                  {n}. {label}
                </button>
              </li>
            ))}
          </ol>

          {/* PASO 1 */}
          {activeStep === 1 && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Identificación del proyecto</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label htmlFor="cpm-nombre" className="text-xs font-bold text-slate-700 block">Nombre del proyecto u obra *</label>
                  <input
                    id="cpm-nombre"
                    type="text"
                    value={formData.proyecto}
                    maxLength={100}
                    onChange={(e) => setFormData(prev => ({ ...prev, proyecto: e.target.value.slice(0, 100) }))}
                    onBlur={() => setTocado(t => ({ ...t, proyecto: true }))}
                    placeholder="Ej: Fachada casa principal"
                    aria-invalid={!!inputErr('proyecto')}
                    aria-describedby="cpm-nombre-err"
                    className={`w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 placeholder-slate-400 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputErr('proyecto') ? 'border-red-400' : 'border-slate-300'}`}
                  />
                  {inputErr('proyecto') && <p id="cpm-nombre-err" className="text-[11px] font-semibold text-red-600">{inputErr('proyecto')}</p>}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="cpm-ciudad" className="text-xs font-bold text-slate-700 block">Ciudad o municipio *</label>
                  <select
                    id="cpm-ciudad"
                    value={formData.ciudad}
                    onChange={(e) => setFormData(prev => ({ ...prev, ciudad: e.target.value }))}
                    onBlur={() => setTocado(t => ({ ...t, ciudad: true }))}
                    aria-invalid={!!inputErr('ciudad')}
                    className={`w-full px-3.5 py-2.5 bg-slate-50 text-slate-900 rounded-xl text-sm border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputErr('ciudad') ? 'border-red-400' : 'border-slate-300'}`}
                  >
                    <option value="">Selecciona una ciudad</option>
                    {CIUDADES_PROYECTO.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  {inputErr('ciudad') && <p className="text-[11px] font-semibold text-red-600">{inputErr('ciudad')}</p>}
                </div>
              </div>

              <fieldset className="space-y-1.5">
                <legend className="text-xs font-bold text-slate-700 block mb-1.5">Ambiente o destino del espacio *</legend>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {environments.map((env) => (
                    <button
                      key={env.id}
                      type="button"
                      aria-pressed={formData.ambiente === env.id}
                      onClick={() => setFormData(prev => ({ ...prev, ambiente: env.id }))}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${formData.ambiente === env.id
                        ? 'border-emerald-500 bg-emerald-50/80 text-emerald-950'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                    >
                      <span className="text-xs font-extrabold block">{env.label}</span>
                      <span className="text-[11px] text-slate-500 block">{env.desc}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => irAPaso(2)} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5">
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 2 */}
          {activeStep === 2 && (
            <div className="space-y-4">
              <h3 className="font-extrabold text-sm text-slate-900">Área y tipo de superficie</h3>

              <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <label htmlFor="cpm-area" className="text-xs font-bold text-emerald-950 block">Área total a pintar (m²) *</label>
                  <p className="text-[11px] text-emerald-800">Suma las superficies a pintar. Máximo {AREA_MAX_M2.toLocaleString('es-CO')} m².</p>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <input
                      id="cpm-area"
                      type="text"
                      inputMode="decimal"
                      value={areaTexto || (formData.areaM2 > 0 ? String(formData.areaM2) : '')}
                      onChange={(e) => cambiarArea(e.target.value)}
                      onBlur={() => setTocado(t => ({ ...t, area: true }))}
                      placeholder="Ej: 85"
                      aria-invalid={!!inputErr('area')}
                      aria-describedby="cpm-area-err"
                      className={`w-32 px-3 py-2 bg-white text-slate-900 font-black text-center text-lg rounded-xl border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${inputErr('area') ? 'border-red-400' : 'border-emerald-300'}`}
                    />
                    <span className="text-xs font-black text-emerald-950">m²</span>
                  </div>
                  {inputErr('area') && <p id="cpm-area-err" className="text-[11px] font-semibold text-red-600 mt-1">{inputErr('area')}</p>}
                </div>
              </div>

              <fieldset>
                <legend className="text-xs font-bold text-slate-700 block mb-1.5">Tipo de superficie *</legend>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {surfaces.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      aria-pressed={formData.superficie === s.id}
                      onClick={() => setFormData(prev => ({ ...prev, superficie: s.id }))}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${formData.superficie === s.id
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                    >
                      <span className="text-xs font-extrabold block leading-tight">{s.label}</span>
                      <span className="text-[10px] text-slate-500 block leading-tight">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="flex justify-between pt-4 gap-2">
                <button type="button" onClick={() => setActiveStep(1)} className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">Atrás</button>
                <button type="button" onClick={() => irAPaso(3)} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5">
                  <span>Continuar</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* PASO 3 */}
          {activeStep === 3 && (
            <div className="space-y-5">
              <h3 className="font-extrabold text-sm text-slate-900">Color y estimado</h3>

              <fieldset className="space-y-2">
                <legend className="text-xs font-bold text-slate-700 block mb-1">Color de acabado <span className="font-normal text-slate-400">(opcional, tu asesor te puede ayudar)</span></legend>
                <div className="flex flex-wrap gap-2">
                  {COLOR_PALETTES.map((tone) => (
                    <button
                      key={tone.id}
                      type="button"
                      aria-pressed={formData.color === tone.name}
                      onClick={() => setFormData(prev => prev.color === tone.name ? { ...prev, color: '', colorHex: '' } : { ...prev, color: tone.name, colorHex: tone.hex })}
                      className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${formData.color === tone.name
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700'}`}
                    >
                      <span className="w-3.5 h-3.5 rounded-full border border-slate-300 shadow-xs" style={{ backgroundColor: tone.hex }} />
                      <span>{tone.name}</span>
                    </button>
                  ))}
                </div>
              </fieldset>

              <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="min-w-0">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">Estimado preliminar</span>
                    <h4 className="font-black text-sm text-white break-words">{formData.proyecto.trim() || 'Proyecto'} ({formData.areaM2.toLocaleString('es-CO')} m²)</h4>
                  </div>
                  <span className="text-xs font-bold bg-emerald-500/20 text-emerald-300 px-2.5 py-1 rounded-full border border-emerald-400/30">
                    {calculation.manos || 2} manos
                  </span>
                </div>

                {calculoAlDia ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Cuñetes (5 gal)</span>
                      <span className="text-xl font-black text-emerald-400">{calculation.cunetesPintura5Gal}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Galones (1 gal)</span>
                      <span className="text-xl font-black text-emerald-400">{calculation.galonesPintura1Gal}</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded-xl border border-slate-800">
                      <span className="text-[10px] text-slate-400 block font-medium">Total estimado con IVA</span>
                      <span className="text-lg font-black text-white">{money(calculation.costoEstimadoCOP.totalCOP)}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-300">Calculando el estimado para el área indicada…</p>
                )}

                <p className="text-[11px] text-slate-400">
                  Es un valor de referencia. Tu asesor revisa el proyecto y te envía la cotización definitiva con disponibilidad y tiempos de entrega.
                </p>
              </div>

              {errorGuardar && <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{errorGuardar}</p>}

              <div className="flex flex-col-reverse sm:flex-row justify-between gap-3 pt-2">
                <button type="button" onClick={() => setActiveStep(2)} disabled={guardando} className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 font-bold text-xs rounded-xl cursor-pointer">
                  Atrás
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndCalculate}
                  disabled={guardando || !paso1Ok || !paso2Ok}
                  className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{guardando ? 'Guardando…' : 'Guardar en mis proyectos'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {detailProject && (
        <ProjectDetailModal
          key={detailProject.proyectoId}
          project={detailProject}
          estado={ESTADO_CLIENTE[detailProject.estadoPipeline] || ESTADO_CLIENTE.en_revision}
          clienteNombre={user.name}
          clienteEmail={user.email}
          focusChat={detailChat}
          onMessagesRead={() => {
            if (detailProject.mensajesSinLeer) {
              setClientProjects(prev => prev.map(p => p.proyectoId === detailProject.proyectoId ? { ...p, mensajesSinLeer: 0 } : p));
              onMessagesRead?.();
            }
          }}
          onClose={() => { setDetailId(null); recargarProyectos(); }}
        />
      )}
    </div>
  );
};
