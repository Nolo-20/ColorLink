import React from 'react';
import { ActiveTab, UserProfile } from '../types';
import { 
  Sparkles, 
  Layers, 
  CheckCircle2, 
  Cpu, 
  Calculator, 
  Network, 
  User, 
  Building2, 
  RefreshCw,
  Droplet
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  onLoadSampleCase: () => void;
  hasValidatedData: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLoadSampleCase,
  hasValidatedData
}) => {
  const navItems: Array<{ id: ActiveTab; label: string; icon: React.ComponentType<any>; badge?: string }> = [
    { id: 'registro', label: '1. Registro & Perfil', icon: User },
    { id: 'captura', label: '2. Captura Inteligente', icon: Layers, badge: 'MVP' },
    { id: 'validacion', label: '3. Validación', icon: CheckCircle2 },
    { id: 'ia_clasificacion', label: '4. Diagnóstico IA', icon: Cpu, badge: 'Gemini' },
    { id: 'motor_tecnico', label: '5. Motor Técnico & Stock', icon: Calculator },
    { id: 'trazabilidad_arquitectura', label: '6. Pipeline & BD', icon: Network },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
      {/* Top Banner / Brand Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('captura')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-teal-400 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Droplet className="w-6 h-6 text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                  COLOR<span className="text-cyan-400">LINK</span>
                </span>
                <span className="bg-cyan-950 text-cyan-400 border border-cyan-700/50 text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full tracking-wider">
                  Ecosistema Inteligente
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Automatización Técnica, Comercial y Operacional de Recubrimientos
              </p>
            </div>
          </div>

          {/* Quick Actions & User Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              id="btn-load-sample-case"
              onClick={onLoadSampleCase}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-teal-500/20 to-cyan-500/20 border border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/30 transition-all shadow-sm"
              title="Carga el caso de prueba: Constructora Horizonte - Medellín 85m²"
            >
              <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline">Cargar Caso:</span>
              <span className="font-semibold">Constructora Horizonte</span>
            </button>

            {/* User Chip */}
            <div 
              onClick={() => setActiveTab('registro')}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 cursor-pointer transition-colors"
            >
              <div className="w-7 h-7 rounded-full bg-cyan-600/30 border border-cyan-500/50 flex items-center justify-center text-cyan-300 text-xs font-bold">
                {user.name ? user.name.charAt(0) : 'U'}
              </div>
              <div className="text-left hidden lg:block">
                <p className="text-xs font-medium text-slate-200 truncate max-w-[130px]">
                  {user.company || user.name || 'Sin registrar'}
                </p>
                <p className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  {user.city || 'Medellín'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="bg-slate-950/70 border-t border-slate-800/80 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-1 sm:space-x-2 py-1.5 min-w-max" aria-label="Tabs">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-tab-${item.id}`}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase ${
                      isActive ? 'bg-cyan-900 text-cyan-200' : 'bg-slate-800 text-cyan-400 border border-slate-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
};
