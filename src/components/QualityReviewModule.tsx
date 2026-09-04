import React, { useState } from 'react';
import { ProjectFormData, UserProfile } from '../types';
import { ALL_MOCK_PROJECTS } from '../data/mockData';
import { 
  ShieldCheck, 
  Droplet, 
  AlertTriangle, 
  CheckCircle2, 
  FileBadge, 
  Sparkles, 
  Microscope, 
  Search, 
  Layers, 
  Save,
  Check
} from 'lucide-react';

interface QualityReviewModuleProps {
  user: UserProfile;
  formData: ProjectFormData;
  onUpdateQualityVerdict: (verdict: { aprobado: boolean; perito: string; fecha: string; notas: string }) => void;
}

export const QualityReviewModule: React.FC<QualityReviewModuleProps> = ({
  user,
  formData,
  onUpdateQualityVerdict
}) => {
  const [selectedProjectId, setSelectedProjectId] = useState(formData.id || ALL_MOCK_PROJECTS[0].id);
  const [moistureReading, setMoistureReading] = useState(18.5);
  const [crackSeverity, setCrackSeverity] = useState<'leve' | 'moderada' | 'critica'>('moderada');
  const [labNotes, setLabNotes] = useState(
    'Sustrato en concreto curado con eflorescencia localizada por humedad capilar. Se aprueba esquema tricapa: masillado elastomérico + sellador hidrófugo antialcalino + Koraza Tech 100% Acrílica.'
  );
  const [isApproved, setIsApproved] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const currentProject = ALL_MOCK_PROJECTS.find(p => p.id === selectedProjectId) || formData;

  const handleSaveVerdict = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateQualityVerdict({
      aprobado: isApproved,
      perito: user.name,
      fecha: new Date().toISOString().split('T')[0],
      notas: labNotes
    });
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-purple-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold">
            <Microscope className="w-4 h-4 text-purple-400" />
            <span>Laboratorio de Ensayos & Peritaje NTC 5828</span>
          </div>
          <h1 className="text-2xl font-black">Control de Calidad & Diagnóstico de Sustratos</h1>
          <p className="text-xs text-purple-200">
            Valida la adherencia, humedad relativa y patologías antes de autorizar el despacho desde bodega.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold text-purple-300 uppercase block">Perito Asignado:</span>
          <span className="text-sm font-black text-white">{user.name}</span>
          <span className="text-[10px] text-purple-300 block">{user.department || 'Laboratorio Central Medellín'}</span>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Project Selector */}
        <div className="lg:col-span-4 space-y-3">
          <span className="text-xs font-black text-slate-500 uppercase tracking-wider block">
            Cola de Proyectos para Peritaje
          </span>

          <div className="space-y-2">
            {ALL_MOCK_PROJECTS.map((proj) => {
              const isSelected = proj.id === selectedProjectId;
              return (
                <div
                  key={proj.id}
                  onClick={() => setSelectedProjectId(proj.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${isSelected ? 'bg-purple-50 border-purple-500 shadow-md ring-2 ring-purple-400/20' : 'bg-white border-slate-200 hover:border-purple-300'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-white px-2 py-0.5 rounded border border-purple-200">
                      {proj.id}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full">
                      ✓ NTC Apta
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900 truncate">{proj.proyecto}</h4>
                  <p className="text-xs text-slate-600 truncate">{proj.cliente}</p>
                  <div className="text-[11px] text-slate-500 pt-1 border-t border-slate-100 flex items-center justify-between">
                    <span>{proj.areaM2} m²</span>
                    <span className="text-purple-700 font-semibold">{proj.condiciones.join(', ')}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Lab Form */}
        <div className="lg:col-span-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Inspeccionando Sustrato</span>
                <h3 className="text-lg font-black text-slate-900">{currentProject.proyecto}</h3>
                <p className="text-xs text-slate-600">{currentProject.cliente} • {currentProject.ciudad}</p>
              </div>

              <div className="flex items-center gap-2">
                <span className={`px-3 py-1 rounded-full text-xs font-black ${isApproved ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-red-100 text-red-800 border border-red-300'}`}>
                  {isApproved ? 'Aprobado para Tinturado' : 'En Observación Técnica'}
                </span>
              </div>
            </div>

            {isSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Dictamen técnico de calidad registrado con sello pericial.</span>
              </div>
            )}

            <form onSubmit={handleSaveVerdict} className="space-y-6">
              
              {/* Moisture and crack parameters */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                      <Droplet className="w-4 h-4 text-purple-600" />
                      <span>Humedad Relativa del Muro (%)</span>
                    </label>
                    <span className="text-sm font-black text-purple-900">{moistureReading}%</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    step="0.5"
                    value={moistureReading}
                    onChange={(e) => setMoistureReading(parseFloat(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer"
                  />
                  <span className="text-[10px] text-purple-700 block">
                    {moistureReading > 15 ? '⚠️ Requiere sellador antialcalino previo.' : '✓ Nivel óptimo para aplicación directa.'}
                  </span>
                </div>

                <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-2">
                  <label className="text-xs font-bold text-purple-950 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    <span>Severidad de Fisuras en Sustrato</span>
                  </label>
                  <div className="grid grid-cols-3 gap-1.5 pt-1">
                    {(['leve', 'moderada', 'critica'] as const).map(sev => (
                      <button
                        key={sev}
                        type="button"
                        onClick={() => setCrackSeverity(sev)}
                        className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all border ${crackSeverity === sev ? 'bg-purple-700 text-white border-purple-700 shadow-xs' : 'bg-white text-slate-700 border-slate-200'}`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] text-purple-700 block">
                    {crackSeverity === 'moderada' ? 'Masilla elastomérica de 300% elongación.' : 'Inspección estándar.'}
                  </span>
                </div>
              </div>

              {/* Lab Notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Concepto Pericial y Recomendación Multicapa
                </label>
                <textarea
                  rows={4}
                  value={labNotes}
                  onChange={(e) => setLabNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
                />
              </div>

              {/* Approval toggle */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900">Emisión de Certificado de Garantía Técnica</h4>
                  <p className="text-[11px] text-slate-500">Autoriza el despacho de pintura y tintometría para este proyecto.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsApproved(!isApproved)}
                  className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${isApproved ? 'bg-emerald-600 text-white shadow-md' : 'bg-slate-300 text-slate-700'}`}
                >
                  <Check className="w-4 h-4" />
                  <span>{isApproved ? 'Certificado Aprobado' : 'Rechazar / Detener'}</span>
                </button>
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Dictamen en Base de Datos</span>
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
