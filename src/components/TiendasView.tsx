import React, { useState, useMemo } from 'react';
import { 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Search, 
  List, 
  Map as MapIcon, 
  Navigation, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight,
  Store,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { StoreBranch } from '../types';
import { STORE_BRANCHES } from '../data/storeProducts';

interface TiendasViewProps {
  onSelectBranchForPickup?: (branch: StoreBranch) => void;
  selectedBranchId?: string;
  onNavigateToCatalog?: () => void;
}

export const TiendasView: React.FC<TiendasViewProps> = ({
  onSelectBranchForPickup,
  selectedBranchId,
  onNavigateToCatalog
}) => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('todos');
  const [selectedCity, setSelectedCity] = useState<string>('todas');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'lista' | 'mapa'>('lista');
  const [activePinBranchId, setActivePinBranchId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Extract unique departments and cities
  const departments = useMemo(() => {
    const set = new Set<string>();
    STORE_BRANCHES.forEach(b => {
      if (b.department) set.add(b.department);
    });
    return Array.from(set).sort();
  }, []);

  const cities = useMemo(() => {
    const set = new Set<string>();
    STORE_BRANCHES.forEach(b => {
      if (selectedDepartment === 'todos' || b.department === selectedDepartment) {
        set.add(b.city);
      }
    });
    return Array.from(set).sort();
  }, [selectedDepartment]);

  // Filter branches
  const filteredBranches = useMemo(() => {
    return STORE_BRANCHES.filter(branch => {
      const matchDept = selectedDepartment === 'todos' || branch.department === selectedDepartment;
      const matchCity = selectedCity === 'todas' || branch.city === selectedCity;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch = !q || 
        branch.name.toLowerCase().includes(q) ||
        branch.address.toLowerCase().includes(q) ||
        branch.city.toLowerCase().includes(q) ||
        (branch.phone && branch.phone.toLowerCase().includes(q));

      return matchDept && matchCity && matchSearch;
    });
  }, [selectedDepartment, selectedCity, searchQuery]);

  // Paginated branches for list view
  const totalPages = Math.ceil(filteredBranches.length / itemsPerPage) || 1;
  const paginatedBranches = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBranches.slice(start, start + itemsPerPage);
  }, [filteredBranches, currentPage]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSelectBranch = (branch: StoreBranch) => {
    if (onSelectBranchForPickup) {
      onSelectBranchForPickup(branch);
    }
    showToast(`¡${branch.name} seleccionada para retiro express!`);
  };

  const openGoogleMaps = (branch: StoreBranch) => {
    const query = encodeURIComponent(`${branch.name} ${branch.address} ${branch.city} Colombia`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Feedback Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. HERO BANNER (Exact Image 1 Style: Paint cans store banner & "Tiendas ColorLink - Todo para pintar") */}
      <div className="relative w-full bg-[#0A1A3A] overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between min-h-[190px] sm:min-h-[220px] lg:min-h-[260px] relative">
          
          {/* Left: Decorative Storefront & Paint Cans Shelf Visual */}
          <div className="w-full md:w-7/12 h-44 sm:h-56 md:h-full relative overflow-hidden flex items-center">
            <img 
              src="https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=1200&auto=format&fit=crop&q=80" 
              alt="Tienda ColorLink - Todo para pintar" 
              className="w-full h-full object-cover object-center opacity-85 brightness-95 contrast-105"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0A1A3A]/40 to-[#0A1A3A]" />
          </div>

          {/* Right: Big Typography (Exact Image 1 wording) */}
          <div className="w-full md:w-5/12 p-6 sm:p-8 lg:p-10 flex flex-col justify-center text-right md:text-right text-white z-10">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white drop-shadow-md">
              Tiendas ColorLink
            </h1>
            <span className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-amber-400 tracking-tight mt-1 drop-shadow-sm">
              Todo para pintar
            </span>
            <p className="text-xs text-blue-200/90 font-medium mt-2 max-w-sm ml-auto hidden sm:block">
              Más de 35 puntos de atención, centros tintométricos computarizados y asesoría técnica especializada en Colombia.
            </p>
          </div>

        </div>
      </div>

      {/* 2. MAIN CONTENT SECTION (Exact Image 1 Structure) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        
        {/* Section Heading */}
        <div className="mb-6 sm:mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-[#0B2545] tracking-tight">
            Encuentra tu tienda más cercana
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1 max-w-3xl leading-relaxed">
            En nuestras tiendas encuentra los productos para pintar y decorar tu casa, proteger la madera y metales, hacerle mantenimiento a edificaciones o espacios industriales.
          </p>
        </div>

        {/* Filters and View Switcher Bar (Image 1 Layout) */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 mb-8 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 shadow-xs">
          
          {/* Dropdowns & Search */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
            
            {/* Departamentos */}
            <div className="relative">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Departamentos
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => {
                  setSelectedDepartment(e.target.value);
                  setSelectedCity('todas');
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden cursor-pointer"
              >
                <option value="todos">Todos los departamentos</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Ciudades */}
            <div className="relative">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Ciudades
              </label>
              <select
                value={selectedCity}
                onChange={(e) => {
                  setSelectedCity(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden cursor-pointer"
              >
                <option value="todas">Todas las ciudades</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Text Search */}
            <div className="relative">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-1">
                Buscar por barrio o nombre
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder="Ej: Galerías, Guayabal, Cra 48..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-hidden"
                />
              </div>
            </div>

          </div>

          {/* View Mode Toggle: [Lista] vs [Mapa] (Exact Image 1 Buttons) */}
          <div className="flex items-end justify-end">
            <div className="inline-flex rounded-xl bg-slate-200 p-1 border border-slate-300 shadow-inner">
              <button
                type="button"
                onClick={() => setViewMode('lista')}
                className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'lista'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>Lista</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('mapa')}
                className={`px-4 py-2 rounded-lg text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewMode === 'mapa'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MapIcon className="w-3.5 h-3.5" />
                <span>Mapa</span>
              </button>
            </div>
          </div>

        </div>

        {/* 3. LIST VIEW (Matching Image 1: 3-column clean cards) */}
        {viewMode === 'lista' ? (
          <div>
            {paginatedBranches.length === 0 ? (
              <div className="py-16 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300">
                <Store className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <p className="text-sm font-bold text-slate-700">No encontramos tiendas con esos filtros.</p>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedDepartment('todos');
                    setSelectedCity('todas');
                    setSearchQuery('');
                  }}
                  className="mt-3 text-xs font-extrabold text-emerald-600 hover:underline cursor-pointer"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                {paginatedBranches.map(branch => {
                  const isSelectedForPickup = selectedBranchId === branch.id;

                  return (
                    <div 
                      key={branch.id} 
                      className={`bg-white rounded-2xl border transition-all duration-200 p-6 flex flex-col justify-between hover:shadow-md ${
                        isSelectedForPickup 
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-emerald-500/10' 
                          : 'border-slate-200/90 hover:border-slate-300'
                      }`}
                    >
                      <div>
                        {/* Title Header with Pin Icon (Exact Image 1 Styling) */}
                        <div className="flex items-start gap-2.5 mb-3">
                          <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mt-0.5 border border-blue-200">
                            <MapPin className="w-4 h-4 text-blue-600" />
                          </div>
                          <div>
                            <h3 className="text-sm sm:text-base font-black text-[#0B2545] tracking-tight lowercase">
                              {branch.name}
                            </h3>
                            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                              {branch.city} • {branch.department || 'Colombia'}
                            </span>
                          </div>
                        </div>

                        {/* Thin Blue Divider (Image 1 Detail) */}
                        <div className="w-full h-0.5 bg-blue-700/80 mb-4 rounded-full" />

                        {/* Branch Metadata Specs (Image 1 Format) */}
                        <div className="space-y-2 text-xs">
                          
                          {/* Dirección */}
                          <div>
                            <strong className="text-slate-900 font-extrabold">Dirección : </strong>
                            <span className="text-slate-600 font-medium">{branch.address}</span>
                          </div>

                          {/* Celular / Teléfono */}
                          <div>
                            <strong className="text-slate-900 font-extrabold">Celular : </strong>
                            <a 
                              href={`tel:${branch.phone.replace(/[^0-9]/g, '')}`} 
                              className="text-slate-700 hover:text-emerald-600 font-medium hover:underline"
                            >
                              {branch.phone}
                            </a>
                          </div>

                          {/* Correo Electrónico */}
                          {branch.email && (
                            <div>
                              <strong className="text-slate-900 font-extrabold">Correo electrónico: </strong>
                              <a 
                                href={`mailto:${branch.email}`} 
                                className="text-slate-600 hover:text-blue-600 font-medium hover:underline break-all"
                              >
                                {branch.email}
                              </a>
                            </div>
                          )}

                          {/* Horario de Atención */}
                          <div>
                            <strong className="text-slate-900 font-extrabold">Horario de Atención: </strong>
                            <span className="text-slate-600 font-medium leading-relaxed block mt-0.5">
                              {branch.schedule}
                            </span>
                          </div>

                          {/* Ready in Hours indicator */}
                          <div className="pt-2 flex items-center gap-1.5 text-[11px] font-bold text-emerald-700">
                            <Clock className="w-3.5 h-3.5" />
                            <span>Retiro Express disponible en {branch.readyInHours} horas hábiles</span>
                          </div>

                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openGoogleMaps(branch)}
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <span>Cómo llegar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleSelectBranch(branch)}
                          className={`flex-1 py-2 px-3 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                            isSelectedForPickup
                              ? 'bg-emerald-700 text-white'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{isSelectedForPickup ? 'Sede Activa' : 'Recoger aquí'}</span>
                        </button>
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

            {/* Pagination Controls (Exact Image 1: < 1 2 3 4 5 ... 37 >) */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-600 text-xs font-bold cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <button
                    key={pageNum}
                    type="button"
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 rounded-lg text-xs font-black transition-all cursor-pointer ${
                      currentPage === pageNum
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'border border-slate-200 hover:bg-slate-100 text-slate-700'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-100 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-slate-600 text-xs font-bold cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        ) : (
          /* 4. INTERACTIVE MAP VIEW */
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 overflow-hidden relative">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Left Column: Interactive Store Locator Pins Map */}
              <div className="lg:col-span-8 bg-slate-950 rounded-2xl border border-slate-800 p-6 relative min-h-[420px] flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-4 z-10">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-bold text-white">Cobertura Nacional Colombia</span>
                  </div>
                  <span>{filteredBranches.length} Tiendas Localizadas</span>
                </div>

                {/* Stylized Interactive Map Canvas with Branch Markers */}
                <div className="relative w-full h-80 sm:h-96 rounded-xl bg-gradient-to-b from-[#0B1A3A] via-[#07132B] to-[#040C1D] border border-blue-900/40 flex items-center justify-center overflow-hidden">
                  
                  {/* Subtle Grid Lines */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b22_1px,transparent_1px),linear-gradient(to_bottom,#1e293b22_1px,transparent_1px)] bg-[size:28px_28px]" />

                  {/* Colombia Map Silhouette & Pins */}
                  <div className="relative w-full max-w-lg h-full p-4 flex flex-wrap items-center justify-center gap-6 z-10">
                    {filteredBranches.map(branch => {
                      const isActive = activePinBranchId === branch.id;
                      return (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => setActivePinBranchId(branch.id)}
                          className={`p-2.5 rounded-xl border text-left transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                            isActive
                              ? 'bg-emerald-500 text-slate-950 border-emerald-300 scale-105 shadow-lg shadow-emerald-500/25 ring-2 ring-white'
                              : 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700/80 hover:border-slate-500'
                          }`}
                        >
                          <MapPin className={`w-4 h-4 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                          <div>
                            <span className="block text-xs font-black leading-tight">{branch.city}</span>
                            <span className="text-[10px] opacity-80 block truncate max-w-[130px]">{branch.name.replace('Tienda ColorLink ', '')}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Map Footer Helper */}
                  <div className="absolute bottom-3 left-4 text-[11px] text-slate-400 font-medium">
                    Haz clic en una sede para ver su ficha y horario extendido.
                  </div>
                </div>

              </div>

              {/* Right Column: Selected Pin Details */}
              <div className="lg:col-span-4 bg-slate-800/90 rounded-2xl border border-slate-700 p-6 flex flex-col justify-between text-white">
                {(() => {
                  const activeBranch = filteredBranches.find(b => b.id === activePinBranchId) || filteredBranches[0];
                  if (!activeBranch) return <p className="text-xs text-slate-400">Selecciona una tienda</p>;

                  return (
                    <div className="space-y-4">
                      <div>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase tracking-wider border border-emerald-500/30">
                          {activeBranch.city} • {activeBranch.department}
                        </span>
                        <h3 className="text-xl font-black text-white mt-2 leading-tight">
                          {activeBranch.name}
                        </h3>
                      </div>

                      <div className="space-y-2.5 text-xs text-slate-300">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{activeBranch.address}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                          <span>{activeBranch.phone}</span>
                        </div>

                        {activeBranch.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                            <span className="break-all">{activeBranch.email}</span>
                          </div>
                        )}

                        <div className="flex items-start gap-2 pt-1">
                          <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <span className="text-slate-300">{activeBranch.schedule}</span>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-slate-700 space-y-2">
                        <button
                          type="button"
                          onClick={() => handleSelectBranch(activeBranch)}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-black text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Seleccionar para Retiro Express</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => openGoogleMaps(activeBranch)}
                          className="w-full py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Abrir en Google Maps</span>
                        </button>
                      </div>
                    </div>
                  );
                })()}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
};
