import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  onLoadSampleCase: () => void;
  hasValidatedData: boolean;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLoadSampleCase,
  hasValidatedData,
  onLogout
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Primary navigation items (like reference: Home, Projects, Reports/Validation, Engine/Stock, Pipeline)
  const navLinks: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<any> }> = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'captura', label: 'Proyectos', icon: Layers },
    { id: 'validacion', label: 'Validación', icon: CheckCircle2 },
    { id: 'ia_clasificacion', label: 'Diagnóstico IA', icon: Cpu },
    { id: 'motor_tecnico', label: 'Cotización & Stock', icon: Calculator },
    { id: 'trazabilidad_arquitectura', label: 'Arquitectura', icon: Network },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0F224A] text-white shadow-md font-sans border-b border-blue-900/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">
          
          {/* 1. Brand Logo */}
          <button
            onClick={() => setActiveTab('inicio')}
            className="flex items-center gap-2.5 text-left shrink-0 cursor-pointer focus:outline-none group"
          >
            <div className="w-9 h-9 rounded-xl bg-cyan-500 text-slate-950 flex items-center justify-center font-black shadow-sm group-hover:scale-105 transition-transform">
              <Droplet className="w-5 h-5 fill-slate-950 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="text-base sm:text-lg font-black tracking-tight text-white">
                  COLOR<span className="text-cyan-400">LINK</span>
                </span>
              </div>
              <span className="text-[10px] font-semibold text-blue-200 block tracking-wider uppercase">
                Paint Systems
              </span>
            </div>
          </button>

          {/* 2. Centered Search Bar (Like in reference) */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-md relative">
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search here... (Ej. Fachada 85m², Medellín)"
                className="w-full pl-3.5 pr-9 py-2 text-xs sm:text-sm bg-blue-950/70 border border-blue-800/80 rounded-xl text-white placeholder:text-blue-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:bg-[#071633] transition-all"
              />
              <Search className="w-4 h-4 text-blue-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* 3. Navigation Links with Icons (Like in reference: Home, Projects, Reports, Careers) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-link-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-800/90 text-cyan-300 shadow-xs ring-1 ring-cyan-400/40'
                      : 'text-blue-100/90 hover:text-white hover:bg-blue-900/50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-blue-300'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* 4. User Profile Dropdown (Right corner with avatar & name, as in reference) */}
          <div className="flex items-center gap-2 shrink-0">
            
            {user.isRegistered ? (
              <div className="relative">
                <button
                  id="btn-user-avatar-menu"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl hover:bg-blue-900/60 border border-transparent hover:border-blue-800 transition-all cursor-pointer text-left"
                >
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                    alt={user.name}
                    className="w-8 h-8 rounded-full object-cover border-2 border-cyan-400 shadow-xs"
                  />
                  <div className="hidden sm:block leading-tight">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-white max-w-[110px] truncate">
                        {user.firstName || user.name.split(' ')[0] || 'Antonio'}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-blue-300" />
                    </div>
                    <span className="text-[10px] text-cyan-300 font-medium block truncate max-w-[120px]">
                      {user.company || 'Constructora'}
                    </span>
                  </div>
                </button>

                {/* User Dropdown */}
                {isUserDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 bg-[#0A1A3A] border border-blue-800/80 rounded-2xl shadow-2xl p-3 z-50 text-xs text-blue-100 space-y-2 animate-in fade-in slide-in-from-top-2"
                    onMouseLeave={() => setIsUserDropdownOpen(false)}
                  >
                    <div className="p-2 bg-blue-950/60 rounded-xl border border-blue-800/40">
                      <p className="font-bold text-white text-sm">{user.name}</p>
                      <p className="text-[11px] text-cyan-300 truncate">{user.email}</p>
                      {user.documentId && (
                        <p className="text-[10px] text-blue-300 font-mono mt-0.5">NIT: {user.documentId}</p>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('registro');
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-900/60 text-white font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <User className="w-4 h-4 text-cyan-400" />
                      <span>Ver / Editar mi Perfil</span>
                    </button>

                    <button
                      onClick={() => {
                        onLoadSampleCase();
                        setIsUserDropdownOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-blue-900/60 text-cyan-300 font-semibold flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      <span>Cargar Proyecto Demo (85m²)</span>
                    </button>

                    {onLogout && (
                      <button
                        onClick={() => {
                          onLogout();
                          setIsUserDropdownOpen(false);
                        }}
                        className="w-full text-left px-3 py-2 rounded-lg hover:bg-rose-900/40 text-rose-300 font-semibold flex items-center gap-2 cursor-pointer transition-colors border-t border-blue-900/60 mt-1 pt-2"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Cerrar Sesión</span>
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Non-logged in state: simple clean login button */
              <button
                onClick={() => setActiveTab('registro')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-black transition-all cursor-pointer shadow-sm"
              >
                <User className="w-4 h-4" />
                <span>Ingresar / Registro</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-blue-200 hover:text-white hover:bg-blue-900/60 rounded-xl transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

          </div>

        </div>

        {/* Search input in mobile if shown */}
        <div className="md:hidden pb-3 pt-1">
          <div className="relative w-full">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search here..."
              className="w-full pl-3.5 pr-9 py-2 text-xs bg-blue-950/70 border border-blue-800/80 rounded-xl text-white placeholder:text-blue-300/70 focus:outline-none focus:ring-2 focus:ring-cyan-400"
            />
            <Search className="w-4 h-4 text-blue-300 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

      </div>

      {/* Mobile Drawer (Matches bottom part of the reference screenshot) */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-[#0A1A3A] border-t border-blue-900/80 px-4 py-3 space-y-2 animate-in slide-in-from-top-2">
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left transition-colors ${
                  isActive
                    ? 'bg-blue-800 text-cyan-300'
                    : 'text-blue-100 hover:bg-blue-900/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-blue-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-blue-900/60">
            <button
              onClick={() => {
                setActiveTab('registro');
                setIsMobileMenuOpen(false);
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-left text-cyan-300 hover:bg-blue-900/50"
            >
              <User className="w-4 h-4" />
              <span>{user.isRegistered ? `Perfil: ${user.name}` : 'Iniciar Sesión / Registro'}</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
