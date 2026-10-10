import React, { useState, useMemo, useEffect, useRef } from 'react';
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
import { STORE_BRANCHES, mapsDirectionsUrl, mapsEmbedUrl, telUrl, whatsappUrl } from '../data/storeProducts';

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

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3500);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  // La página nunca queda en una página vacía si cambian los filtros
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleSelectBranch = (branch: StoreBranch) => {
    if (!onSelectBranchForPickup) return;
    onSelectBranchForPickup(branch);
    showToast(`${branch.name} seleccionada para retiro`);
  };

  const resetFilters = () => {
    setSelectedDepartment('todos');
    setSelectedCity('todas');
    setSearchQuery('');
    setCurrentPage(1);
  };

  const cityCount = new Set(STORE_BRANCHES.map(b => b.city)).size;
  const activeBranch = filteredBranches.find(b => b.id === activePinBranchId) || filteredBranches[0];

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
          
          {/* Ilustración de marca (sin foto de stock): estantería de latas ColorLink */}
          <div className="w-full md:w-7/12 h-40 sm:h-56 md:h-full md:min-h-[260px] relative overflow-hidden flex items-end justify-center gap-2 sm:gap-3 px-6 pt-8 bg-gradient-to-br from-[#0B1E48] via-[#0A1A3A] to-[#06112A]" aria-hidden="true">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(16,185,129,0.25),transparent_55%)]" />
            <div className="absolute bottom-0 inset-x-0 h-3 bg-[#13306E]" />
            {['#E6A892', '#2D6A4F', '#1E3A8A', '#F2C417', '#C2593F', '#D1D5DB', '#0B1528'].map((hex, i) => (
              <div key={hex} className="relative flex flex-col items-center" style={{ height: `${55 + ((i * 37) % 35)}%` }}>
                <div className="w-8 sm:w-12 h-2 rounded-t-md bg-slate-300" />
                <div className="w-8 sm:w-12 flex-1 rounded-b-md bg-slate-200 overflow-hidden flex flex-col">
                  <div className="h-1/3 bg-[#13306E]" />
                  <div className="flex-1" style={{ backgroundColor: hex }} />
                </div>
              </div>
            ))}
            <img src="/brand/logo-on-dark.svg" alt="" className="absolute top-4 left-5 h-7 sm:h-8 opacity-90" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
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
              {STORE_BRANCHES.length} tiendas en {cityCount} ciudades de Colombia, con tintometría y asesoría técnica.
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
                  type="search"
                  value={searchQuery}
                  maxLength={60}
                  aria-label="Buscar tienda por barrio o nombre"
                  onChange={(e) => {
                    setSearchQuery(e.target.value.replace(/[<>]/g, '').slice(0, 60));
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
                  onClick={resetFilters}
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
                            <h3 className="text-sm sm:text-base font-black text-[#0B2545] tracking-tight">
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
                            <strong className="text-slate-900 font-extrabold">Dirección: </strong>
                            <span className="text-slate-600 font-medium">{branch.address}</span>
                          </div>

                          {/* Celular / Teléfono */}
                          <div>
                            <strong className="text-slate-900 font-extrabold">Teléfono: </strong>
                            <a
                              href={telUrl(branch.phone)}
                              className="text-slate-700 hover:text-emerald-600 font-medium hover:underline"
                            >
                              {branch.phone}
                            </a>
                            {whatsappUrl(branch.phone) && (
                              <a
                                href={whatsappUrl(branch.phone, `Hola, quiero información de ${branch.name}`)!}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ml-2 text-emerald-700 font-bold hover:underline"
                              >
                                WhatsApp
                              </a>
                            )}
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
                            <span>Pedidos listos para retiro en {branch.readyInHours} horas hábiles</span>
                          </div>

                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-2">
                        <a
                          href={mapsDirectionsUrl(branch)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors"
                        >
                          <Navigation className="w-3.5 h-3.5 text-blue-600" />
                          <span>Cómo llegar</span>
                        </a>
                        {onSelectBranchForPickup ? (
                          <button
                            type="button"
                            onClick={() => handleSelectBranch(branch)}
                            className={`flex-1 py-2 px-3 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                              isSelectedForPickup ? 'bg-emerald-700 text-white' : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{isSelectedForPickup ? 'Tienda elegida' : 'Recoger aquí'}</span>
                          </button>
                        ) : (
                          <a
                            href={telUrl(branch.phone)}
                            className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            <span>Llamar</span>
                          </a>
                        )}
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
          /* 4. MAPA REAL (Google Maps embebido) */
          <div className="bg-slate-900 rounded-3xl border border-slate-800 p-3 sm:p-6 overflow-hidden">
            {!activeBranch ? (
              <div className="py-16 text-center text-slate-300 text-sm">
                No encontramos tiendas con esos filtros.{' '}
                <button type="button" onClick={resetFilters} className="font-bold text-emerald-400 hover:underline cursor-pointer">Restablecer filtros</button>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
                <div className="lg:col-span-4 order-2 lg:order-1 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                  <div className="text-xs text-slate-400 mb-1">{filteredBranches.length} {filteredBranches.length === 1 ? 'tienda' : 'tiendas'}</div>
                  {filteredBranches.map(branch => {
                    const isActive = activeBranch.id === branch.id;
                    return (
                      <button
                        key={branch.id}
                        type="button"
                        onClick={() => setActivePinBranchId(branch.id)}
                        aria-pressed={isActive}
                        className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-start gap-2 ${
                          isActive ? 'bg-emerald-500 text-slate-950 border-emerald-300' : 'bg-slate-800/80 hover:bg-slate-700 text-white border-slate-700/80'
                        }`}
                      >
                        <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${isActive ? 'text-slate-950' : 'text-emerald-400'}`} />
                        <span className="min-w-0">
                          <span className="block text-xs font-black leading-tight">{branch.name}</span>
                          <span className="block text-[11px] opacity-80 truncate">{branch.address} · {branch.city}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="lg:col-span-8 order-1 lg:order-2 space-y-3">
                  <div className="rounded-2xl overflow-hidden border border-slate-700 bg-slate-800 aspect-[4/3] sm:aspect-[16/9]">
                    <iframe
                      key={activeBranch.id}
                      title={`Mapa de ${activeBranch.name}`}
                      src={mapsEmbedUrl(activeBranch)}
                      className="w-full h-full border-0"
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  </div>
                  <div className="bg-slate-800/90 rounded-2xl border border-slate-700 p-4 text-white space-y-2">
                    <h3 className="text-base font-black leading-tight">{activeBranch.name}</h3>
                    <div className="text-xs text-slate-300 space-y-1.5">
                      <p className="flex items-start gap-2"><MapPin className="w-4 h-4 text-emerald-400 shrink-0" /><span>{activeBranch.address}, {activeBranch.city}</span></p>
                      <p className="flex items-center gap-2"><Phone className="w-4 h-4 text-emerald-400 shrink-0" /><a href={telUrl(activeBranch.phone)} className="hover:underline">{activeBranch.phone}</a></p>
                      {activeBranch.email && (
                        <p className="flex items-center gap-2 min-w-0"><Mail className="w-4 h-4 text-emerald-400 shrink-0" /><a href={`mailto:${activeBranch.email}`} className="hover:underline break-all">{activeBranch.email}</a></p>
                      )}
                      <p className="flex items-start gap-2"><Clock className="w-4 h-4 text-amber-400 shrink-0" /><span>{activeBranch.schedule}</span></p>
                    </div>
                    <div className="pt-2 flex flex-col sm:flex-row gap-2">
                      <a
                        href={mapsDirectionsUrl(activeBranch)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2"
                      >
                        <Navigation className="w-4 h-4" />
                        <span>Cómo llegar</span>
                      </a>
                      {whatsappUrl(activeBranch.phone) && (
                        <a
                          href={whatsappUrl(activeBranch.phone, `Hola, quiero información de ${activeBranch.name}`)!}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                      {onSelectBranchForPickup && (
                        <button
                          type="button"
                          onClick={() => handleSelectBranch(activeBranch)}
                          className="flex-1 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Recoger aquí</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};
