import React, { useState, useRef, useEffect } from 'react';
import { ProjectFormData, SurfaceType, SpaceEnvironment, SurfaceCondition, ColorTone, UserProfile } from '../types';
import { COLOR_PALETTES, EMPTY_PROJECT_FORM } from '../data/mockData';
import { CIUDADES_PROYECTO, AREA_MAX_M2, errorNombreProyecto, errorArea } from './ClientProjectsManager';
import {
  Building2,
  MapPin,
  Ruler,
  AlertTriangle,
  Calendar,
  UploadCloud,
  Trash2,
  Sparkles,
  ArrowRight,
  Check
} from 'lucide-react';

interface SmartCaptureFormProps {
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  user: UserProfile;
  onSubmitToValidation: () => void;
  /** Ya no se usa: el caso de ejemplo se retiró porque cargaba datos que no son del cliente */
  onLoadHorizontePreset?: () => void;
}

const TIPOS_FOTO = ['image/png', 'image/jpeg', 'image/webp'];
const MAX_FOTO_MB = 8;
const MAX_FOTOS = 3;
const MAX_DESCRIPCION = 1000;

type Foto = ProjectFormData['fotos'][0] & { base64?: string };

export const SmartCaptureForm: React.FC<SmartCaptureFormProps> = ({
  formData,
  setFormData,
  user,
  onSubmitToValidation
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tocado, setTocado] = useState<Record<string, boolean>>({});
  const [errorFotos, setErrorFotos] = useState('');
  const [areaTexto, setAreaTexto] = useState(formData.areaM2 > 0 ? String(formData.areaM2) : '');

  // Si el formulario ya se guardó como proyecto, se empieza uno nuevo; se precargan datos reales del cliente
  useEffect(() => {
    setFormData(prev => {
      const base = prev.id ? { ...EMPTY_PROJECT_FORM, timestamp: new Date().toISOString() } : prev;
      const sinEmpezar = base !== prev || !prev.proyecto;
      const ciudad = sinEmpezar
        ? (CIUDADES_PROYECTO.includes(user.city) ? user.city : '')
        : (CIUDADES_PROYECTO.includes(base.ciudad) ? base.ciudad : '');
      return {
        ...base,
        cliente: base.cliente || user.company || user.name || '',
        emailContacto: base.emailContacto || user.email || '',
        telefonoContacto: base.telefonoContacto || user.phone || '',
        ciudad,
        canalOrigen: 'web_portal'
      };
    });
    if (formData.id) setAreaTexto('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (patch: Partial<ProjectFormData>) => setFormData(prev => ({ ...prev, ...patch }));

  const errores = {
    cliente: (() => {
      const t = (formData.cliente || '').trim();
      if (t.length < 2) return 'Escribe tu nombre o el de tu empresa.';
      if (t.length > 100) return 'Máximo 100 caracteres.';
      return '';
    })(),
    proyecto: errorNombreProyecto(formData.proyecto),
    ciudad: formData.ciudad ? '' : 'Elige la ciudad del proyecto.',
    area: errorArea(formData.areaM2),
    color: formData.color ? '' : 'Elige un color de referencia.',
    consentimiento: formData.consentimientoDatos ? '' : 'Debes aceptar el tratamiento de datos para continuar.'
  };
  const err = (k: keyof typeof errores) => (tocado[k] ? errores[k] : '');
  const formValido = Object.values(errores).every(e => !e);

  const surfaces: Array<{ id: SurfaceType; label: string; desc: string }> = [
    { id: 'concreto', label: 'Concreto', desc: 'Vaciado, losas o prefabricado' },
    { id: 'revoque', label: 'Revoque / Pañete', desc: 'Mortero tradicional o afinado' },
    { id: 'ladrillo', label: 'Ladrillo a la vista', desc: 'Arcilla o tolete' },
    { id: 'drywall', label: 'Drywall / Yeso', desc: 'Placas de yeso o fibrocemento' },
    { id: 'metal', label: 'Estructura metálica', desc: 'Acero galvanizado o hierro' },
    { id: 'madera', label: 'Madera', desc: 'Tablillas o maciza' },
  ];

  const environments: Array<{ id: SpaceEnvironment; label: string; desc: string }> = [
    { id: 'exterior_fachada', label: 'Exterior / Fachada', desc: 'Sol, lluvia e intemperie directa' },
    { id: 'interior_muros', label: 'Interior', desc: 'Muros y cielos rasos' },
    { id: 'zona_humeda', label: 'Zona húmeda', desc: 'Baños y cocinas: vapor y condensación' },
    { id: 'trafico_pesado_piso', label: 'Pisos de tráfico pesado', desc: 'Parqueaderos o pasillos de alto flujo' },
  ];

  const conditionsList: Array<{ id: SurfaceCondition; label: string; badgeColor: string; description: string }> = [
    { id: 'humedad', label: 'Humedad / Filtración', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', description: 'Manchas, salitre o agua' },
    { id: 'fisuras', label: 'Fisuras / Grietas', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', description: 'Grietas finas o superficiales' },
    { id: 'descascaramiento', label: 'Descascaramiento', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300', description: 'Pintura anterior suelta o con ampollas' },
    { id: 'hongos_moho', label: 'Hongos / Moho', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', description: 'Manchas negras o verdes' },
    { id: 'caleo', label: 'Caleo / Polvillo', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', description: 'La pintura suelta polvo al tocarla' },
    { id: 'buen_estado', label: 'En buen estado', badgeColor: 'bg-green-100 text-green-800 border-green-300', description: 'Sin daños visibles' },
  ];

  const handleToggleCondition = (cond: SurfaceCondition) => {
    setFormData(prev => {
      if (cond === 'buen_estado') return { ...prev, condiciones: ['buen_estado'] };
      const current = prev.condiciones.filter(c => c !== 'buen_estado');
      const next = current.includes(cond) ? current.filter(c => c !== cond) : [...current, cond];
      return { ...prev, condiciones: next.length ? next : ['buen_estado'] };
    });
  };

  const processFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setErrorFotos('');
    const disponibles = MAX_FOTOS - formData.fotos.length;
    if (disponibles <= 0) { setErrorFotos(`Puedes subir máximo ${MAX_FOTOS} fotos.`); return; }
    const lista = Array.from(files);
    const rechazos: string[] = [];
    const validas = lista.filter(f => {
      if (!TIPOS_FOTO.includes(f.type)) { rechazos.push(`${f.name}: debe ser PNG, JPG o WEBP`); return false; }
      if (f.size > MAX_FOTO_MB * 1024 * 1024) { rechazos.push(`${f.name}: pesa más de ${MAX_FOTO_MB} MB`); return false; }
      return true;
    });
    if (validas.length > disponibles) rechazos.push(`Solo se agregaron ${disponibles} foto(s): el máximo es ${MAX_FOTOS}.`);
    if (rechazos.length) setErrorFotos(rechazos.join(' · '));

    validas.slice(0, disponibles).forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = reader.result as string;
        setFormData(prev => prev.fotos.length >= MAX_FOTOS ? prev : ({
          ...prev,
          fotos: [...prev.fotos, {
            id: `foto-${Date.now()}-${idx}`,
            url: base64,
            base64,
            name: file.name,
            size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
          } as Foto]
        }));
      };
      reader.onerror = () => setErrorFotos(`No se pudo leer ${file.name}.`);
      reader.readAsDataURL(file);
    });
  };

  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const handleRemovePhoto = (id: string) => {
    setErrorFotos('');
    setFormData(prev => ({ ...prev, fotos: prev.fotos.filter(p => p.id !== id) }));
  };

  const handleColorSelect = (tone: ColorTone) => {
    setTocado(t => ({ ...t, color: true }));
    set({ color: tone.name, colorHex: tone.hex });
  };

  const cambiarArea = (texto: string) => {
    const limpio = texto.replace(',', '.').replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
    const [ent, dec] = limpio.split('.');
    const final = dec !== undefined ? `${ent.slice(0, 5)}.${dec.slice(0, 2)}` : ent.slice(0, 5);
    setAreaTexto(final);
    const n = parseFloat(final);
    set({ areaM2: Number.isFinite(n) ? n : 0 });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTocado({ cliente: true, proyecto: true, ciudad: true, area: true, color: true, consentimiento: true });
    if (!formValido) {
      const primero = (['cliente', 'proyecto', 'ciudad', 'area', 'color', 'consentimiento'] as const).find(k => errores[k]);
      if (primero) document.getElementById(`campo-${primero}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setFormData(prev => ({
      ...prev,
      cliente: prev.cliente.trim().replace(/\s+/g, ' '),
      proyecto: prev.proyecto.trim().replace(/\s+/g, ' '),
      descripcion: prev.descripcion.trim(),
      canalOrigen: 'web_portal',
      timestamp: new Date().toISOString()
    }));
    onSubmitToValidation();
  };

  const campo = (hayError: string) =>
    `w-full py-2 bg-slate-50 border rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none ${hayError ? 'border-red-400' : 'border-slate-300'}`;
  const ErrorTxt: React.FC<{ msg: string }> = ({ msg }) => (msg ? <p className="text-[11px] font-semibold text-red-600 mt-1">{msg}</p> : null);

  const ACTIVA: Record<'cyan' | 'teal' | 'amber', string> = {
    cyan: 'bg-cyan-50/80 border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm',
    teal: 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-sm',
    amber: 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
  };
  const opcion = (activa: boolean, color: 'cyan' | 'teal' | 'amber' = 'cyan') =>
    `p-3 rounded-xl border cursor-pointer transition-all text-left w-full ${activa ? ACTIVA[color] : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`;

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 rounded-2xl p-5 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Paso 1 de 4 · Datos del proyecto</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Cuéntanos sobre tu proyecto</h1>
          <p className="text-slate-300 text-sm max-w-2xl">
            Con estos datos revisamos la información, generamos un diagnóstico preliminar con IA y un estimado de materiales. Tu asesor confirma la cotización final.
          </p>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-8">

        {/* 1. CLIENTE Y PROYECTO */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold shrink-0">1</div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Cliente y ubicación</h2>
              <p className="text-xs text-slate-500">A nombre de quién va la cotización y dónde es la obra</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <div id="campo-cliente">
              <label htmlFor="input-cliente" className="block text-xs font-semibold text-slate-700 mb-1">Cliente / Razón social *</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-cliente"
                  type="text"
                  maxLength={100}
                  value={formData.cliente}
                  onChange={(e) => set({ cliente: e.target.value.slice(0, 100) })}
                  onBlur={() => setTocado(t => ({ ...t, cliente: true }))}
                  aria-invalid={!!err('cliente')}
                  className={`${campo(err('cliente'))} pl-9 pr-3`}
                />
              </div>
              <ErrorTxt msg={err('cliente')} />
            </div>

            <div id="campo-ciudad">
              <label htmlFor="input-ciudad" className="block text-xs font-semibold text-slate-700 mb-1">Ciudad del proyecto *</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  id="input-ciudad"
                  value={formData.ciudad}
                  onChange={(e) => set({ ciudad: e.target.value })}
                  onBlur={() => setTocado(t => ({ ...t, ciudad: true }))}
                  aria-invalid={!!err('ciudad')}
                  className={`${campo(err('ciudad'))} pl-9 pr-3`}
                >
                  <option value="">Selecciona una ciudad</option>
                  {CIUDADES_PROYECTO.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <ErrorTxt msg={err('ciudad')} />
            </div>

            <div id="campo-proyecto">
              <label htmlFor="input-proyecto" className="block text-xs font-semibold text-slate-700 mb-1">Nombre del proyecto o espacio *</label>
              <input
                id="input-proyecto"
                type="text"
                maxLength={100}
                value={formData.proyecto}
                onChange={(e) => set({ proyecto: e.target.value.slice(0, 100) })}
                onBlur={() => setTocado(t => ({ ...t, proyecto: true }))}
                placeholder="Ej: Fachada de la casa"
                aria-invalid={!!err('proyecto')}
                className={`${campo(err('proyecto'))} px-3`}
              />
              <ErrorTxt msg={err('proyecto')} />
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100">
            <label htmlFor="input-fecha-dias" className="block text-xs font-semibold text-slate-700 mb-1">
              ¿En cuánto tiempo necesitas el material? <span className="font-bold text-cyan-700">{formData.fechaRequeridaDias} días</span>
            </label>
            <div className="flex items-center gap-3">
              <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                id="input-fecha-dias"
                type="range"
                min={3}
                max={60}
                step={1}
                value={Math.min(60, Math.max(3, formData.fechaRequeridaDias || 15))}
                onChange={(e) => set({ fechaRequeridaDias: Math.min(60, Math.max(3, Number(e.target.value) || 15)) })}
                className="w-full accent-cyan-600 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 2. SUPERFICIE, ÁREA Y AMBIENTE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold shrink-0">2</div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Superficie, área y ambiente</h2>
              <p className="text-xs text-slate-500">Con esto se calcula el rendimiento y el tipo de producto</p>
            </div>
          </div>

          <div id="campo-area" className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <label htmlFor="input-area-num" className="text-xs font-bold text-slate-800 flex items-center gap-2 mb-2">
              <Ruler className="w-4 h-4 text-cyan-600" />
              Área total a pintar (m²) *
            </label>
            <div className="flex items-center gap-4">
              <input
                id="input-area-slider"
                type="range"
                min={10}
                max={500}
                step={5}
                aria-label="Área aproximada"
                value={Math.min(500, Math.max(10, formData.areaM2 || 10))}
                onChange={(e) => { setTocado(t => ({ ...t, area: true })); cambiarArea(e.target.value); }}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="relative w-32 shrink-0">
                <input
                  id="input-area-num"
                  type="text"
                  inputMode="decimal"
                  placeholder="Ej: 85"
                  value={areaTexto}
                  onChange={(e) => cambiarArea(e.target.value)}
                  onBlur={() => setTocado(t => ({ ...t, area: true }))}
                  aria-invalid={!!err('area')}
                  className={`w-full pl-3 pr-9 py-2 bg-white border rounded-lg text-base font-bold text-slate-900 text-right focus:ring-2 focus:ring-cyan-500 focus:outline-none ${err('area') ? 'border-red-400' : 'border-slate-300'}`}
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold pointer-events-none">m²</span>
              </div>
            </div>
            <ErrorTxt msg={err('area')} />
            <p className="text-[11px] text-slate-500 mt-1">Hasta {AREA_MAX_M2.toLocaleString('es-CO')} m². Para áreas mayores escribe el valor en la casilla.</p>
          </div>

          <fieldset className="mb-6">
            <legend className="block text-xs font-semibold text-slate-700 mb-2">Tipo de superficie *</legend>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {surfaces.map((s) => (
                <button key={s.id} id={`surface-option-${s.id}`} type="button" aria-pressed={formData.superficie === s.id} onClick={() => set({ superficie: s.id })} className={opcion(formData.superficie === s.id)}>
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    {s.label}
                    {formData.superficie === s.id && <Check className="w-3.5 h-3.5 text-cyan-600" />}
                  </span>
                  <span className="block text-[11px] text-slate-500">{s.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="block text-xs font-semibold text-slate-700 mb-2">Ambiente *</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {environments.map((env) => (
                <button key={env.id} id={`env-option-${env.id}`} type="button" aria-pressed={formData.ambiente === env.id} onClick={() => set({ ambiente: env.id })} className={opcion(formData.ambiente === env.id, 'teal')}>
                  <span className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    {env.label}
                    {formData.ambiente === env.id && <Check className="w-3.5 h-3.5 text-teal-600" />}
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-0.5">{env.desc}</span>
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        {/* 3. ESTADO DE LA SUPERFICIE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">3</div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Estado actual de la superficie</h2>
              <p className="text-xs text-slate-500">Marca lo que ves en la pared o el piso</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {conditionsList.map((cond) => {
              const isSelected = formData.condiciones.includes(cond.id);
              return (
                <button key={cond.id} id={`condition-chip-${cond.id}`} type="button" role="checkbox" aria-checked={isSelected} onClick={() => handleToggleCondition(cond.id)} className={opcion(isSelected, 'amber')}>
                  <span className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cond.badgeColor}`}>{cond.label}</span>
                    <span className={`w-4 h-4 rounded border flex items-center justify-center ${isSelected ? 'bg-amber-600 border-amber-600 text-white' : 'border-slate-300 bg-white'}`}>
                      {isSelected && <Check className="w-3 h-3" />}
                    </span>
                  </span>
                  <span className="block text-[11px] text-slate-500 mt-1">{cond.description}</span>
                </button>
              );
            })}
          </div>

          {(formData.condiciones.includes('humedad') || formData.condiciones.includes('fisuras')) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Con humedad o fisuras normalmente se necesita preparar la superficie (sellador y masilla) antes de pintar; lo tendremos en cuenta en el estimado.</span>
            </div>
          )}
        </div>

        {/* 4. COLOR Y ACABADO */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold shrink-0">4</div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Color y acabado</h2>
              <p className="text-xs text-slate-500">Un color de referencia; tu asesor te ayuda a ajustarlo</p>
            </div>
          </div>

          <fieldset id="campo-color" className="mb-5">
            <legend className="sr-only">Color *</legend>
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-4 gap-3">
              {COLOR_PALETTES.map((tone) => {
                const isSelected = formData.color === tone.name;
                return (
                  <button key={tone.id} id={`color-swatch-${tone.id}`} type="button" aria-pressed={isSelected} onClick={() => handleColorSelect(tone)} className={`${opcion(isSelected)} flex items-center gap-3`}>
                    <span className="w-8 h-8 rounded-lg shadow-inner border border-black/10 shrink-0" style={{ backgroundColor: tone.hex }} />
                    <span className="overflow-hidden">
                      <span className="block text-xs font-bold text-slate-900 truncate">{tone.name}</span>
                      <span className="block text-[10px] text-slate-400 font-mono">{tone.code}</span>
                    </span>
                  </button>
                );
              })}
            </div>
            <ErrorTxt msg={err('color')} />
          </fieldset>

          <fieldset>
            <legend className="block text-xs font-semibold text-slate-700 mb-2">Acabado</legend>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: 'mate', label: 'Mate', desc: 'Disimula imperfecciones' },
                { id: 'satinado', label: 'Satinado', desc: 'Brillo sutil y más lavable' },
                { id: 'semibrillante', label: 'Semibrillante', desc: 'Más resistente a la suciedad' },
              ].map((finish) => {
                const activa = formData.acabado === finish.id;
                return (
                  <button
                    key={finish.id}
                    type="button"
                    aria-pressed={activa}
                    onClick={() => set({ acabado: finish.id as ProjectFormData['acabado'] })}
                    className={`p-3 rounded-xl border cursor-pointer transition-all text-left ${activa ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'}`}
                  >
                    <span className="text-xs font-bold flex items-center justify-between">
                      {finish.label}
                      {activa && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                    </span>
                    <span className={`block text-[11px] mt-0.5 ${activa ? 'text-slate-300' : 'text-slate-500'}`}>{finish.desc}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        {/* 5. FOTOS Y DESCRIPCIÓN */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold shrink-0">5</div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Fotos y observaciones</h2>
              <p className="text-xs text-slate-500">La primera foto se usa para el diagnóstico y se adjunta al proyecto</p>
            </div>
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Subir fotos"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click(); } }}
            onDrop={(e) => { e.preventDefault(); setIsDraggingOver(false); processFiles(e.dataTransfer.files); }}
            onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
            onDragLeave={() => setIsDraggingOver(false)}
            className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-cyan-600 ${isDraggingOver ? 'border-cyan-500 bg-cyan-50' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/png,image/jpeg,image/webp"
              className="hidden"
              onChange={(e) => { processFiles(e.target.files); e.target.value = ''; }}
            />
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 mx-auto flex items-center justify-center mb-3 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">Toca para subir fotos o arrástralas aquí</p>
            <p className="text-[11px] text-slate-500 mt-1">PNG, JPG o WEBP · máximo {MAX_FOTO_MB} MB por foto · hasta {MAX_FOTOS} fotos</p>
          </div>
          {errorFotos && <p role="alert" className="text-[11px] font-semibold text-red-600 mt-2">{errorFotos}</p>}

          {formData.fotos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.fotos.map((photo, i) => (
                <div key={photo.id} className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video">
                  <img src={photo.url} alt={photo.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-between">
                    <div className="flex items-start justify-between gap-1">
                      {i === 0 ? <span className="text-[9px] font-black uppercase bg-cyan-500 text-slate-950 px-1.5 py-0.5 rounded">Principal</span> : <span />}
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); handleRemovePhoto(photo.id); }}
                        aria-label={`Quitar ${photo.name}`}
                        className="w-7 h-7 bg-red-600/90 hover:bg-red-600 text-white rounded-md flex items-center justify-center cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-medium text-white truncate">{photo.name}</p>
                      <span className="text-[9px] text-slate-300">{photo.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-5">
            <label htmlFor="input-descripcion" className="block text-xs font-semibold text-slate-700 mb-1">
              Observaciones <span className="font-normal text-slate-400">(opcional)</span>
            </label>
            <textarea
              id="input-descripcion"
              rows={3}
              maxLength={MAX_DESCRIPCION}
              value={formData.descripcion}
              onChange={(e) => set({ descripcion: e.target.value.slice(0, MAX_DESCRIPCION) })}
              placeholder="Ej: la humedad aparece en temporada de lluvias, la casa tiene 20 años, el muro da al occidente…"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            ></textarea>
            <p className="text-[10px] text-slate-400 text-right">{formData.descripcion.length}/{MAX_DESCRIPCION}</p>
          </div>

          <div id="campo-consentimiento" className="mt-4 pt-3 border-t border-slate-100">
            <div className="flex items-start gap-2.5">
              <input
                id="checkbox-consentimiento"
                type="checkbox"
                checked={formData.consentimientoDatos}
                onChange={(e) => { setTocado(t => ({ ...t, consentimiento: true })); set({ consentimientoDatos: e.target.checked }); }}
                className="accent-cyan-600 w-4 h-4 mt-0.5 rounded shrink-0"
              />
              <label htmlFor="checkbox-consentimiento" className="text-[11px] text-slate-600 cursor-pointer">
                Autorizo a ColorLink a tratar estos datos y fotos para preparar el diagnóstico y la cotización de mi proyecto. *
              </label>
            </div>
            <ErrorTxt msg={err('consentimiento')} />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100 p-4 rounded-2xl border border-slate-300">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Siguiente:</span> revisamos que los datos estén completos.
          </div>
          <button
            id="btn-submit-capture"
            type="submit"
            aria-disabled={!formValido}
            className={`${formValido ? '' : 'opacity-60'} w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all`}
          >
            <span>Revisar y continuar</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
