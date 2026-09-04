import React, { useState } from 'react';
import { ProjectFormData, UserProfile } from '../types';
import { ALL_MOCK_PROJECTS } from '../data/mockData';
import { 
  Building2, 
  Layers, 
  Edit3, 
  CheckCircle2, 
  Percent, 
  DollarSign, 
  MapPin, 
  Calendar, 
  FileText, 
  AlertCircle, 
  Save, 
  ArrowRight,
  ShieldCheck,
  Search,
  Sparkles,
  Phone
} from 'lucide-react';

interface AdvisorProjectManagerProps {
  user: UserProfile;
  activeProject: ProjectFormData;
  onUpdateProject: (updated: ProjectFormData) => void;
  onOpenPdfModal: () => void;
}

export const AdvisorProjectManager: React.FC<AdvisorProjectManagerProps> = ({
  user,
  activeProject,
  onUpdateProject,
  onOpenPdfModal
}) => {
  const [projectsList, setProjectsList] = useState<ProjectFormData[]>(ALL_MOCK_PROJECTS);
  const [selectedId, setSelectedId] = useState<string>(activeProject.id || ALL_MOCK_PROJECTS[0].id);
  const [searchFilter, setSearchFilter] = useState('');
  
  // Selected project details for live editing
  const currentProject = projectsList.find(p => p.id === selectedId) || activeProject;

  const [editArea, setEditArea] = useState<number>(currentProject.areaM2);
  const [editDiscount, setEditDiscount] = useState<number>(currentProject.descuentoAsesorPct || 5);
  const [editNotes, setEditNotes] = useState<string>(currentProject.observacionesAsesor || '');
  const [editAcabado, setEditAcabado] = useState<'mate' | 'satinado' | 'semibrillante'>(currentProject.acabado);
  const [isSavedNotice, setIsSavedNotice] = useState(false);

  const handleSelectProject = (proj: ProjectFormData) => {
    setSelectedId(proj.id);
    setEditArea(proj.areaM2);
    setEditDiscount(proj.descuentoAsesorPct || 5);
    setEditNotes(proj.observacionesAsesor || '');
    setEditAcabado(proj.acabado);
    setIsSavedNotice(false);
  };

  const handleSaveAdjustment = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ProjectFormData = {
      ...currentProject,
      areaM2: editArea,
      acabado: editAcabado,
      descuentoAsesorPct: editDiscount,
      observacionesAsesor: editNotes,
      estadoPipeline: 'aprobado_calidad'
    };

    setProjectsList(prev => prev.map(p => p.id === updated.id ? updated : p));
    onUpdateProject(updated);
    setIsSavedNotice(true);
    setTimeout(() => setIsSavedNotice(false), 3000);
  };

  const filteredProjects = projectsList.filter(p => 
    p.cliente.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.proyecto.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.ciudad.toLowerCase().includes(searchFilter.toLowerCase()) ||
    p.id.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 shadow-xl border border-blue-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-400/20 text-blue-300 text-xs font-bold mb-2">
            <Building2 className="w-4 h-4 text-blue-400" />
            <span>Módulo de Asesoría Comercial & Modificación Manual</span>
          </div>
          <h1 className="text-2xl font-black">Bandeja de Proyectos de Clientes</h1>
          <p className="text-xs text-blue-200 mt-1">
            Revisa levantamientos técnicos, ajusta áreas, aplica descuentos autorizados (0-15%) y recalcula insumos.
          </p>
        </div>

        <div className="text-right shrink-0">
          <span className="text-[11px] font-bold text-blue-300 uppercase block">Asesor Conectado:</span>
          <span className="text-sm font-black text-white">{user.name}</span>
          <span className="text-[11px] text-emerald-400 block font-semibold">✓ Nivel de Autorización: Senior</span>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Project List & Search Filter */}
        <div className="lg:col-span-5 space-y-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Buscar por cliente, NIT, obra o ciudad..."
              className="w-full pl-9 pr-3 py-2 bg-white text-xs rounded-xl border border-slate-300 shadow-inner focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
            {filteredProjects.map((p) => {
              const isSelected = p.id === selectedId;
              return (
                <div
                  key={p.id}
                  onClick={() => handleSelectProject(p)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer space-y-2 ${isSelected ? 'bg-blue-50/90 border-blue-500 shadow-md ring-2 ring-blue-400/20' : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-xs'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                      {p.id}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.estadoPipeline === 'aprobado_calidad' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                      {p.estadoPipeline || 'En Revisión'}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-sm text-slate-900 truncate">{p.proyecto}</h3>
                    <p className="text-xs text-slate-600 font-semibold truncate">{p.cliente}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
                    <span>{p.areaM2} m² • {p.superficie}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{p.ciudad}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Interactive Editor Form for the Selected Project */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-6">
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-black text-slate-400 uppercase">Editando Proyecto</span>
                <h2 className="text-lg font-black text-slate-900">{currentProject.proyecto}</h2>
                <span className="text-xs font-semibold text-blue-700">{currentProject.cliente}</span>
              </div>

              <button
                type="button"
                onClick={onOpenPdfModal}
                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Ver PDF Oficial</span>
              </button>
            </div>

            {/* Saved Banner */}
            {isSavedNotice && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs rounded-xl font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>¡Ajustes comerciales y recalculación técnica guardados exitosamente!</span>
              </div>
            )}

            <form onSubmit={handleSaveAdjustment} className="space-y-4">
              
              {/* Metric modifications */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Área Total de Intervención (m²)
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    value={editArea}
                    onChange={(e) => setEditArea(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 text-slate-900 font-bold text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="text-[10px] text-slate-500">Recalcula cuñetes y galones automáticamente.</span>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">
                    Descuento Comercial Autorizado (%)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={editDiscount}
                      onChange={(e) => setEditDiscount(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-slate-50 text-slate-900 font-bold text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 pr-8"
                    />
                    <Percent className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                  </div>
                  <span className="text-[10px] text-slate-500">Rango asesor: 0% a 15% según volumen.</span>
                </div>
              </div>

              {/* Finish selector */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Línea y Acabado Especificado
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['mate', 'satinado', 'semibrillante'] as const).map(ac => (
                    <button
                      key={ac}
                      type="button"
                      onClick={() => setEditAcabado(ac)}
                      className={`py-2 px-3 rounded-xl text-xs font-bold capitalize transition-all border ${editAcabado === ac ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'}`}
                    >
                      {ac}
                    </button>
                  ))}
                </div>
              </div>

              {/* Technical notes */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 block">
                  Observaciones Técnicas & Condiciones de Entrega
                </label>
                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(e) => setEditNotes(e.target.value)}
                  placeholder="Instrucciones para bodega, tintometría o peritaje de campo..."
                  className="w-full px-3 py-2 bg-slate-50 text-xs text-slate-900 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 cursor-pointer transition-all hover:scale-105"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar y Validar Propuesta</span>
                </button>
              </div>

            </form>

          </div>
        </div>

      </div>

    </div>
  );
};
