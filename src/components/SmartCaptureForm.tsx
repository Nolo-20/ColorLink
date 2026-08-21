import React, { useState, useRef } from 'react';
import { ProjectFormData, SurfaceType, SpaceEnvironment, SurfaceCondition, ColorTone, UserProfile } from '../types';
import { COLOR_PALETTES } from '../data/mockData';
import { 
  Building2, 
  MapPin, 
  Layers, 
  Ruler, 
  Sun, 
  AlertTriangle, 
  Palette, 
  Calendar, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Sparkles, 
  ArrowRight, 
  Check, 
  FileText, 
  HelpCircle,
  Eye,
  CheckCircle2,
  Shield
} from 'lucide-react';

interface SmartCaptureFormProps {
  formData: ProjectFormData;
  setFormData: React.Dispatch<React.SetStateAction<ProjectFormData>>;
  user: UserProfile;
  onSubmitToValidation: () => void;
  onLoadHorizontePreset: () => void;
}

export const SmartCaptureForm: React.FC<SmartCaptureFormProps> = ({
  formData,
  setFormData,
  user,
  onSubmitToValidation,
  onLoadHorizontePreset
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedPhotoPreview, setSelectedPhotoPreview] = useState<string | null>(null);

  const surfaces: Array<{ id: SurfaceType; label: string; desc: string; icon: string }> = [
    { id: 'concreto', label: 'Concreto', desc: 'Vaciado, losas o prefabricado', icon: '🧱' },
    { id: 'revoque', label: 'Revoque / Pañete', desc: 'Mortero tradicional o afinado', icon: '🏗️' },
    { id: 'ladrillo', label: 'Ladrillo a la Vista', desc: 'Arcilla o tolete estructural', icon: '🧱' },
    { id: 'drywall', label: 'Drywall / Yeso', desc: 'Placas de yeso o fibrocemento', icon: '⬜' },
    { id: 'metal', label: 'Estructura Metálica', desc: 'Acero galvanizado o hierro', icon: '⚙️' },
    { id: 'madera', label: 'Madera / Enchapado', desc: 'Tablillas o maciza', icon: '🪵' },
  ];

  const environments: Array<{ id: SpaceEnvironment; label: string; desc: string }> = [
    { id: 'exterior_fachada', label: 'Exterior Fachada', desc: 'Alta intemperie, sol UV y lluvia directa' },
    { id: 'interior_muros', label: 'Interior Habitacional / Comercial', desc: 'Muros y cielos rasos' },
    { id: 'zona_humeda', label: 'Zona Húmeda / Baños / Cocinas', desc: 'Vapor constante y condensación' },
    { id: 'trafico_pesado_piso', label: 'Pisos & Tráfico Pesado', desc: 'Parqueaderos o pasillos de alto flujo' },
  ];

  const conditionsList: Array<{ id: SurfaceCondition; label: string; badgeColor: string; description: string }> = [
    { id: 'humedad', label: 'Humedad / Filtración', badgeColor: 'bg-blue-100 text-blue-800 border-blue-300', description: 'Manchas de eflorescencia o agua' },
    { id: 'fisuras', label: 'Fisuras / Grietas', badgeColor: 'bg-amber-100 text-amber-800 border-amber-300', description: 'Aperturas menores a 1.5mm o superficiales' },
    { id: 'descascaramiento', label: 'Descascaramiento', badgeColor: 'bg-orange-100 text-orange-800 border-orange-300', description: 'Pintura anterior suelta o ampollada' },
    { id: 'hongos_moho', label: 'Hongos / Moho', badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-300', description: 'Contaminación biológica vegetal' },
    { id: 'caleo', label: 'Caleo / Polvillo', badgeColor: 'bg-purple-100 text-purple-800 border-purple-300', description: 'Desprendimiento de carbonato de calcio' },
    { id: 'buen_estado', label: 'Superficie Sana / Buena', badgeColor: 'bg-green-100 text-green-800 border-green-300', description: 'Sin patologías activas visibles' },
  ];

  const handleToggleCondition = (cond: SurfaceCondition) => {
    if (cond === 'buen_estado') {
      setFormData(prev => ({ ...prev, condiciones: ['buen_estado'] }));
      return;
    }
    const current = formData.condiciones.filter(c => c !== 'buen_estado');
    if (current.includes(cond)) {
      const next = current.filter(c => c !== cond);
      setFormData(prev => ({ ...prev, condiciones: next.length ? next : ['buen_estado'] }));
    } else {
      setFormData(prev => ({ ...prev, condiciones: [...current, cond] }));
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newPhotos = (Array.from(files) as File[]).map((file: File, idx: number) => ({
      id: `photo-user-${Date.now()}-${idx}`,
      url: URL.createObjectURL(file),
      name: file.name,
      size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`
    }));

    setFormData(prev => ({
      ...prev,
      fotos: [...prev.fotos, ...newPhotos]
    }));
  };

  const handleRemovePhoto = (id: string) => {
    setFormData(prev => ({
      ...prev,
      fotos: prev.fotos.filter(p => p.id !== id)
    }));
  };

  const handleColorSelect = (tone: ColorTone) => {
    setFormData(prev => ({
      ...prev,
      color: tone.name,
      colorHex: tone.hex
    }));
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-cyan-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Entregable 1 del MVP — Captura Inteligente</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Toma Guiada de Datos & Necesidad de Recubrimiento
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl">
              Capturamos la información técnica, física y estética del proyecto para activar el motor automático de validación, clasificación con IA y cálculo de inventario.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <button
              id="btn-load-preset-horizonte"
              type="button"
              onClick={onLoadHorizontePreset}
              className="px-4 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-cyan-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              <span>Pre-cargar Caso Medellín (85m²)</span>
            </button>
          </div>
        </div>
        <div className="absolute right-0 bottom-0 opacity-10 w-96 h-96 bg-cyan-400 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onSubmitToValidation(); }} className="space-y-8">
        
        {/* SECCIÓN 1: IDENTIFICACIÓN DEL CLIENTE Y PROYECTO */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              1
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Identificación del Cliente & Ubicación</h2>
              <p className="text-xs text-slate-500">Datos clave para trazabilidad en Supabase y logística regional</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Cliente */}
            <div>
              <label htmlFor="input-cliente" className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente / Razón Social
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="input-cliente"
                  type="text"
                  required
                  value={formData.cliente}
                  onChange={(e) => setFormData({ ...formData, cliente: e.target.value })}
                  placeholder="Ej: Constructora Horizonte S.A.S."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Ciudad */}
            <div>
              <label htmlFor="input-ciudad" className="block text-xs font-semibold text-slate-700 mb-1">
                Ciudad del Proyecto
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  id="input-ciudad"
                  value={formData.ciudad}
                  onChange={(e) => setFormData({ ...formData, ciudad: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                >
                  <option value="Medellín">Medellín (Antioquia)</option>
                  <option value="Bogotá">Bogotá D.C.</option>
                  <option value="Cali">Cali (Valle)</option>
                  <option value="Barranquilla">Barranquilla (Atlántico)</option>
                  <option value="Bucaramanga">Bucaramanga</option>
                  <option value="Pereira">Pereira / Eje Cafetero</option>
                  <option value="Cartagena">Cartagena</option>
                </select>
              </div>
            </div>

            {/* Nombre del Proyecto */}
            <div>
              <label htmlFor="input-proyecto" className="block text-xs font-semibold text-slate-700 mb-1">
                Nombre del Proyecto / Espacio
              </label>
              <input
                id="input-proyecto"
                type="text"
                required
                value={formData.proyecto}
                onChange={(e) => setFormData({ ...formData, proyecto: e.target.value })}
                placeholder="Ej: Fachada edificio residencial"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4 pt-4 border-t border-slate-100">
            {/* Canal de Origen */}
            <div>
              <label htmlFor="input-canal-origen" className="block text-xs font-semibold text-slate-700 mb-1">
                Canal de Entrada de la Solicitud
              </label>
              <select
                id="input-canal-origen"
                value={formData.canalOrigen}
                onChange={(e) => setFormData({ ...formData, canalOrigen: e.target.value as any })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
              >
                <option value="web_portal">Portal Web ColorLink</option>
                <option value="whatsapp">WhatsApp Business / Bot</option>
                <option value="asesor_comercial">Asesor Comercial en Campo</option>
                <option value="correo">Correo Electrónico Corporativo</option>
                <option value="linea_directa">Línea Directa / PBX</option>
              </select>
            </div>

            {/* Fecha Requerida */}
            <div>
              <label htmlFor="input-fecha-dias" className="block text-xs font-semibold text-slate-700 mb-1">
                Plazo Máximo Requerido de Entrega: <span className="font-bold text-cyan-700">{formData.fechaRequeridaDias} días</span>
              </label>
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  id="input-fecha-dias"
                  type="range"
                  min={3}
                  max={60}
                  step={1}
                  value={formData.fechaRequeridaDias}
                  onChange={(e) => setFormData({ ...formData, fechaRequeridaDias: Number(e.target.value) })}
                  className="w-full accent-cyan-600 cursor-pointer"
                />
                <span className="text-xs font-mono font-bold bg-slate-100 px-2 py-1 rounded-md text-slate-700 min-w-[50px] text-center">
                  {formData.fechaRequeridaDias}d
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECCIÓN 2: SUPERFICIE, ÁREA Y AMBIENTE */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Superficie, Dimensiones & Exposición</h2>
              <p className="text-xs text-slate-500">Parámetros esenciales para el cálculo de rendimiento y tipo de polímero</p>
            </div>
          </div>

          {/* Área Selector */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
              <label htmlFor="input-area-num" className="text-xs font-bold text-slate-800 flex items-center gap-2">
                <Ruler className="w-4 h-4 text-cyan-600" />
                Área Total a Recubrir (m²)
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, areaM2: 85.0 })}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    formData.areaM2 === 85 ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  Caso Inicial (85.00 m²)
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, areaM2: 150.0 })}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    formData.areaM2 === 150 ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  150 m²
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, areaM2: 300.0 })}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all ${
                    formData.areaM2 === 300 ? 'bg-cyan-600 text-white border-cyan-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                  }`}
                >
                  300 m²
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <input
                id="input-area-slider"
                type="range"
                min={10}
                max={500}
                step={5}
                value={formData.areaM2}
                onChange={(e) => setFormData({ ...formData, areaM2: Number(e.target.value) })}
                className="w-full accent-cyan-600 cursor-pointer"
              />
              <div className="relative min-w-[130px]">
                <input
                  id="input-area-num"
                  type="number"
                  min={1}
                  step={0.5}
                  value={formData.areaM2}
                  onChange={(e) => setFormData({ ...formData, areaM2: parseFloat(e.target.value) || 0 })}
                  className="w-full pl-3 pr-8 py-2 bg-white border border-slate-300 rounded-lg text-base font-bold text-slate-900 text-right focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                />
                <span className="absolute right-3 top-2.5 text-xs text-slate-500 font-bold pointer-events-none">m²</span>
              </div>
            </div>
          </div>

          {/* Tipo de Superficie */}
          <div className="mb-6">
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Tipo de Sustrato / Superficie
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {surfaces.map((s) => (
                <div
                  key={s.id}
                  id={`surface-option-${s.id}`}
                  onClick={() => setFormData({ ...formData, superficie: s.id })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-start gap-3 ${
                    formData.superficie === s.id
                      ? 'bg-cyan-50/80 border-cyan-500 ring-2 ring-cyan-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-xl">{s.icon}</span>
                  <div>
                    <p className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      {s.label}
                      {formData.superficie === s.id && <Check className="w-3.5 h-3.5 text-cyan-600 font-bold" />}
                    </p>
                    <p className="text-[11px] text-slate-500">{s.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ambiente / Exposición */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">
              Ambiente y Grado de Exposición
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {environments.map((env) => (
                <div
                  key={env.id}
                  id={`env-option-${env.id}`}
                  onClick={() => setFormData({ ...formData, ambiente: env.id })}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    formData.ambiente === env.id
                      ? 'bg-teal-50/80 border-teal-500 ring-2 ring-teal-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <p className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    {env.label}
                    {formData.ambiente === env.id && <Check className="w-3.5 h-3.5 text-teal-600 font-bold" />}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{env.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SECCIÓN 3: CONDICIÓN DEL ESPACIO (PATOLOGÍAS) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Condición Actual del Espacio (Patologías)</h2>
              <p className="text-xs text-slate-500">Selecciona los síntomas observados en la pared para formular el sistema de reparación</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {conditionsList.map((cond) => {
              const isSelected = formData.condiciones.includes(cond.id);
              return (
                <div
                  key={cond.id}
                  id={`condition-chip-${cond.id}`}
                  onClick={() => handleToggleCondition(cond.id)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                    isSelected
                      ? 'bg-amber-50/90 border-amber-500 ring-2 ring-amber-500/20 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${cond.badgeColor}`}>
                      {cond.label}
                    </span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="accent-amber-600 w-4 h-4 rounded"
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">{cond.description}</p>
                </div>
              );
            })}
          </div>

          {(formData.condiciones.includes('humedad') || formData.condiciones.includes('fisuras')) && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-3 text-amber-900 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                <strong>Detección temprana:</strong> La presencia combinada de <strong>Humedad + Fisuras</strong> activará el módulo de imprimante antialcalino y masilla elastomérica puenteadora en el motor técnico.
              </span>
            </div>
          )}
        </div>

        {/* SECCIÓN 4: COLOR & ACABADO ESTÉTICO */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              4
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Color & Acabado Arquitectónico</h2>
              <p className="text-xs text-slate-500">Selecciona el tono exacto para tintometría o despacho de lote</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {COLOR_PALETTES.map((tone) => {
              const isSelected = formData.color === tone.name;
              return (
                <div
                  key={tone.id}
                  id={`color-swatch-${tone.id}`}
                  onClick={() => handleColorSelect(tone)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-3 ${
                    isSelected
                      ? 'border-cyan-600 ring-2 ring-cyan-500/30 bg-cyan-50/40 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg shadow-inner border border-black/10 shrink-0"
                    style={{ backgroundColor: tone.hex }}
                  ></div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold text-slate-900 truncate">{tone.name}</p>
                    <p className="text-[10px] text-slate-400 font-mono">{tone.code}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Acabado */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'mate', label: 'Mate Arquitectónico', desc: 'Disimula imperfecciones en fachada' },
              { id: 'satinado', label: 'Satinado Suave', desc: 'Brillo sutil y alta lavabilidad' },
              { id: 'semibrillante', label: 'Semibrillante', desc: 'Máxima repelencia a polución' },
            ].map((finish) => (
              <div
                key={finish.id}
                onClick={() => setFormData({ ...formData, acabado: finish.id as any })}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${
                  formData.acabado === finish.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                    : 'bg-white text-slate-800 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <p className="text-xs font-bold flex items-center justify-between">
                  {finish.label}
                  {formData.acabado === finish.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                </p>
                <p className={`text-[11px] mt-0.5 ${formData.acabado === finish.id ? 'text-slate-300' : 'text-slate-500'}`}>
                  {finish.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* SECCIÓN 5: EVIDENCIAS FOTOGRÁFICAS & DESCRIPCIÓN */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-7 shadow-sm">
          <div className="flex items-center gap-3 mb-5 pb-3 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-cyan-100 text-cyan-700 flex items-center justify-center font-bold">
              5
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Evidencias Fotográficas & Observaciones</h2>
              <p className="text-xs text-slate-500">Fotografías para la inspección multimodal de Gemini y el dictamen técnico</p>
            </div>
          </div>

          {/* Upload Dropzone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-300 hover:border-cyan-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/60 hover:bg-cyan-50/20 transition-all"
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              onChange={handleFileUpload}
            />
            <div className="w-12 h-12 rounded-2xl bg-cyan-100 text-cyan-600 mx-auto flex items-center justify-center mb-3 shadow-inner">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800">
              Haz clic para subir fotografías o arrastra tus archivos aquí
            </p>
            <p className="text-[11px] text-slate-500 mt-1">
              Formatos soportados: JPG, PNG, WEBP (Hasta 10MB por fotografía)
            </p>
          </div>

          {/* Photos list / previews */}
          {formData.fotos.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {formData.fotos.map((photo) => (
                <div key={photo.id} className="group relative rounded-xl overflow-hidden border border-slate-200 bg-slate-900 aspect-video">
                  <img
                    src={photo.url}
                    alt={photo.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-2 flex flex-col justify-between">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemovePhoto(photo.id);
                      }}
                      className="self-end w-6 h-6 bg-red-600/80 hover:bg-red-600 text-white rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <div>
                      <p className="text-[10px] font-medium text-white truncate">{photo.name}</p>
                      <span className="text-[9px] text-slate-300">{photo.size}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Detailed description */}
          <div className="mt-5">
            <label htmlFor="input-descripcion" className="block text-xs font-semibold text-slate-700 mb-1">
              Descripción Adicional del Estado / Requerimiento Específico
            </label>
            <textarea
              id="input-descripcion"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
              placeholder="Describe detalles como antecedentes de humedad, antigüedad de la construcción, orientación solar..."
              className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-2 focus:ring-cyan-500 focus:outline-none"
            ></textarea>
          </div>

          {/* Consent Checkbox */}
          <div className="mt-4 flex items-start gap-2.5 pt-3 border-t border-slate-100">
            <input
              id="checkbox-consentimiento"
              type="checkbox"
              required
              checked={formData.consentimientoDatos}
              onChange={(e) => setFormData({ ...formData, consentimientoDatos: e.target.checked })}
              className="accent-cyan-600 w-4 h-4 mt-0.5 rounded"
            />
            <label htmlFor="checkbox-consentimiento" className="text-[11px] text-slate-600 cursor-pointer">
              Autorizo el tratamiento de datos y especificaciones técnicas para la validación automática, cotización y trazabilidad en el ecosistema ColorLink.
            </label>
          </div>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-100 p-4 rounded-2xl border border-slate-300">
          <div className="text-xs text-slate-600">
            <span className="font-semibold text-slate-800">Siguiente Paso:</span> Validación Automática & Reglas de Integridad (Entregable 2)
          </div>
          <button
            id="btn-submit-capture"
            type="submit"
            className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Validar y Procesar Proyecto</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </form>
    </div>
  );
};
