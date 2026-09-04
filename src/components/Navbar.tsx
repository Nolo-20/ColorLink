import React, { useState, useRef, useEffect } from 'react';
import { ActiveTab, UserProfile } from '../types';
import { 
  Droplet,
  Home,
  Layers, 
  CheckCircle2, 
  Cpu, 
  Calculator, 
  Network, 
  User, 
  Search,
  Menu, 
  X,
  LogOut,
  ChevronDown,
  Building2,
  MapPin,
  FileText,
  Sparkles,
  Package,
  ShieldCheck,
  Bot
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  onLoadSampleCase: () => void;
  hasValidatedData: boolean;
  onLogout?: () => void;
  onOpenVirtualAssistant?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLoadSampleCase,
  hasValidatedData,
  onLogout,
  onOpenVirtualAssistant
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  
  // Dynamic Collapsible Search State
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus input when search expands
  useEffect(() => {
    if (isSearchExpanded && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchExpanded]);

  // Role-based Nav Links Configuration
  const getNavLinks = () => {
    const base: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<any> }> = [
      { id: 'dashboard', label: 'Dashboard', icon: Home },
    ];

    if (user.role === 'cliente') {
      base.push(
        { id: 'captura', label: 'Mis Proyectos', icon: Layers },
        { id: 'motor_tecnico', label: 'Cotización & Cuñetes', icon: Calculator }
      );
    } else if (user.role === 'asesor') {
      base.push(
        { id: 'proyectos_asesor', label: 'Gestión Obras', icon: Layers },
        { id: 'inventario', label: 'Inventario Bodegas', icon: Package },
        { id: 'motor_tecnico', label: 'Cotizaciones', icon: Calculator }
      );
    } else if (user.role === 'calidad') {
      base.push(
        { id: 'calidad_revision', label: 'Peritaje & Sustratos', icon: ShieldCheck },
        { id: 'ia_clasificacion', label: 'Diagnóstico IA', icon: Cpu }
      );
    } else if (user.role === 'administrador') {
      base.push(
        { id: 'inventario', label: 'Inventario Bodegas', icon: Package },
        { id: 'proyectos_asesor', label: 'Bandeja Obras', icon: Layers },
        { id: 'trazabilidad_arquitectura', label: 'Monitoreo & Logs', icon: Network }
      );
    }

    return base;
  };

  const navLinks = getNavLinks();

  const handleSearchResultClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsSearchExpanded(false);
    setSearchQuery('');
  };

  return (
    <header className="sticky top-0 z-50 bg-[#0F224A] text-white shadow-md font-sans border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
          
          {/* 1. Brand Logo */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2 text-left shrink-0 cursor-pointer focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  COLOR<span className="text-emerald-400">LINK</span>
                </span>
                <span className="text-[9px] font-black text-amber-400 bg-amber-400/20 px-1 py-0.2 rounded border border-amber-400/40 uppercase">
                  {user.role}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-blue-200 block tracking-wider uppercase">
                Paint Systems Medellín
              </span>
            </div>
          </button>

          {/* 2. DYNAMIC & COLLAPSIBLE SEARCH ICON / BAR */}
          <div className="relative flex items-center">
            {!isSearchExpanded ? (
              <button
                onClick={() => setIsSearchExpanded(true)}
                className="p-2 rounded-full bg-blue-900/60 hover:bg-blue-800 text-blue-200 hover:text-white transition-all cursor-pointer flex items-center gap-1.5 border border-blue-700/60"
                title="Buscar en la plataforma..."
              >
                <Search className="w-4 h-4" />
                <span className="hidden xl:inline text-xs font-medium text-blue-300 pr-1">Buscar...</span>
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-blue-950 border border-cyan-400 rounded-full px-3 py-1.5 shadow-lg animate-in fade-in duration-150 z-50">
                <Search className="w-4 h-4 text-cyan-400 shrink-0" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Escape' && setIsSearchExpanded(false)}
                  placeholder="Buscar proyectos, SKUs o cuñetes..."
                  className="bg-transparent text-white placeholder-blue-300 text-xs focus:outline-none w-48 sm:w-64"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-blue-400 hover:text-white text-xs font-bold"
                  >
                    ✕
                  </button>
                )}
                <button
                  onClick={() => setIsSearchExpanded(false)}
                  className="text-blue-400 hover:text-white p-0.5 rounded-full"
                  title="Cerrar búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Live Search Quick Results Dropdown */}
            {isSearchExpanded && searchQuery.trim() && (
              <div className="absolute top-12 left-0 w-72 sm:w-80 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 space-y-2 text-xs">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Accesos Rápidos Encontrados:
                </span>
                
                <button
                  onClick={() => handleSearchResultClick('captura')}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-white flex items-center justify-between"
                >
                  <span>Fachada Residencial (85 m² - Medellín)</span>
                  <span className="text-[10px] text-cyan-400 font-bold">Proyecto ➔</span>
                </button>

                <button
                  onClick={() => handleSearchResultClick('inventario')}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-white flex items-center justify-between"
                >
                  <span>Stock Koraza Tech 5G (Bodega Itagüí)</span>
                  <span className="text-[10px] text-emerald-400 font-bold">Inventario ➔</span>
                </button>

                <button
                  onClick={() => handleSearchResultClick('ia_clasificacion')}
                  className="w-full text-left p-2 rounded-xl hover:bg-slate-800 text-white flex items-center justify-between"
                >
                  <span>Diagnóstico Humedad & Fisuras (Gemini)</span>
                  <span className="text-[10px] text-purple-400 font-bold">IA ➔</span>
                </button>
              </div>
            )}
          </div>

          {/* 3. Navigation Links with Active Highlighting */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-emerald-500 text-slate-950 shadow-md font-black' 
                      : 'text-blue-100 hover:bg-blue-900/60 hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-blue-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 4. Right Controls: Max Assistant & User Profile Dropdown */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Asistente Virtual Button in Navbar */}
            <button
              onClick={onOpenVirtualAssistant}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-400/40 text-xs font-bold transition-all cursor-pointer"
              title="Abrir Asistente Virtual ColorLink"
            >
              <Bot className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Asistente Virtual</span>
            </button>

            {/* User Profile Avatar with Dropdown */}
            <div className="relative">
              <button
                onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-blue-950 border border-blue-800 hover:border-emerald-400 transition-all cursor-pointer group"
              >
                <img 
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'} 
                  alt={user.name} 
                  className="w-7 h-7 rounded-full object-cover border border-emerald-400" 
                />
                <div className="hidden sm:block text-left">
                  <span className="text-xs font-bold text-white block leading-tight truncate max-w-[120px]">
                    {user.firstName || user.name.split(' ')[0]}
                  </span>
                  <span className="text-[10px] text-emerald-300 block leading-none font-bold capitalize">
                    {user.role}
                  </span>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-blue-300 group-hover:text-white transition-transform" />
              </button>

              {/* Profile Dropdown Menu */}
              {isUserDropdownOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-3 px-4 z-50 space-y-3 animate-in fade-in zoom-in duration-100">
                  <div className="pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="w-9 h-9 rounded-full object-cover border-2 border-emerald-500" 
                      />
                      <div>
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">{user.name}</h4>
                        <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                        <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                          Rol: {user.role}
                        </span>
                      </div>
                    </div>
                    {user.company && (
                      <div className="mt-2 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                        🏢 <strong>Empresa:</strong> {user.company}
                      </div>
                    )}
                  </div>

                  <div className="space-y-1 text-xs font-semibold">
                    <button
                      onClick={() => { setActiveTab('dashboard'); setIsUserDropdownOpen(false); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Home className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Ir a mi Dashboard</span>
                    </button>

                    <button
                      onClick={() => { onLoadSampleCase(); setIsUserDropdownOpen(false); }}
                      className="w-full text-left p-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Recargar Caso Demo 85m²</span>
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsUserDropdownOpen(false);
                        if (onLogout) onLogout();
                      }}
                      className="w-full text-left p-2 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-600" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-blue-950 text-white hover:bg-blue-900 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-blue-900/80 space-y-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold ${
                    isActive ? 'bg-emerald-500 text-slate-950 font-black' : 'text-blue-100 hover:bg-blue-900/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}

      </div>
    </header>
  );
};
