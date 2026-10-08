import { BrandLogo } from './BrandLogo';
import React, { useState } from 'react';
import { ActiveTab, UserProfile, StoreCategory } from '../types';
import {
  Droplet,
  Home,
  Layers,
  Calculator,
  Search,
  Menu,
  X,
  LogOut,
  ChevronDown,
  Building2,
  MapPin,
  Sparkles,
  ShoppingCart,
  LogIn,
  Store,
  Palette,
  HardHat,
  Package,
  User
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile;
  isLoggedIn: boolean;
  cartItemsCount: number;
  onOpenCart: () => void;
  onOpenLogin: () => void;
  onOpenBranchLocator: () => void;
  onOpenCalculator: () => void;
  searchFilter?: string;
  onSearchChange?: (query: string) => void;
  selectedCategory?: StoreCategory;
  onSelectCategory?: (category: StoreCategory) => void;
  onLoadSampleCase: () => void;
  hasValidatedData: boolean;
  onLogout?: () => void;
  onOpenVirtualAssistant?: () => void;
}

// Avatar con ícono genérico por defecto (en vez de una foto de stock fija) cuando el usuario no tiene foto propia
const UserAvatarImg: React.FC<{ avatar?: string | null; name: string; sizeClass?: string }> = ({ avatar, name, sizeClass = 'w-7 h-7' }) => {
  if (avatar) {
    return <img src={avatar} alt={name} className={`${sizeClass} rounded-full object-cover border border-emerald-400`} />;
  }
  return (
    <div className={`${sizeClass} rounded-full bg-emerald-950 text-emerald-400 flex items-center justify-center border border-emerald-400`}>
      <User className="w-1/2 h-1/2" />
    </div>
  );
};

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  isLoggedIn,
  cartItemsCount,
  onOpenCart,
  onOpenLogin,
  onOpenBranchLocator,
  onOpenCalculator,
  onSearchChange,
  selectedCategory = 'todos',
  onSelectCategory,
  onLoadSampleCase,
  hasValidatedData,
  onLogout,
  onOpenVirtualAssistant
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isProductsMenuOpen, setIsProductsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartBounce, setCartBounce] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchChange) {
      onSearchChange(searchQuery);
    }
    setActiveTab('tienda');
  };

  const handleCategoryClick = (cat: StoreCategory) => {
    if (onSelectCategory) {
      onSelectCategory(cat);
    }
    if (cat === 'todos') {
      setActiveTab('tienda');
    } else {
      setActiveTab('categoria');
    }
    setIsProductsMenuOpen(false);
  };

  const handleProjectsClick = () => {
    if (!isLoggedIn) {
      setActiveTab('proyectos_teaser');
    } else {
      setActiveTab('dashboard');
    }
    setIsMobileMenuOpen(false);
  };

  const triggerCartOpen = () => {
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 500);
    onOpenCart();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0A1A36] text-white shadow-xl font-sans border-b border-slate-800/80">

      {/* 1. Top Enterprise Micro-Bar */}
      <div className="bg-[#050D1C] border-b border-slate-800/60 px-4 py-1.5 text-[11px] text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenBranchLocator}
              className="flex items-center gap-1.5 hover:text-emerald-400 text-slate-300 font-semibold transition-colors cursor-pointer group"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>Puntos de Venta & Centros de Color (Medellín, Itagüí, Bello, Envigado)</span>
            </button>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span className="hidden md:inline-flex items-center gap-1.5 text-slate-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Asesoría Técnica Especializada
            </span>
            <span className="text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50">
              🚚 Envío gratis en compras &gt; $150.000 COP
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3 sm:gap-6">

          {/* Brand Logo */}
          <button
            onClick={() => {
              if (onSelectCategory) onSelectCategory('todos');
              setActiveTab('tienda');
            }}
            className="flex items-center gap-2.5 sm:gap-3 text-left shrink-0 cursor-pointer focus:outline-hidden group"
          >
            <div>
              <BrandLogo on="dark" className="h-8 sm:h-9" />
              <span className="text-[9px] font-semibold text-slate-400 block tracking-wider uppercase mt-0.5">
                Recubrimientos & Pinturas
              </span>
            </div>
          </button>

          {/* Search */}
          <form
            onSubmit={handleSearchSubmit}
            className={`relative transition-all duration-300 ease-in-out ${
              isSearchFocused
                ? 'flex-1 max-w-xl shadow-lg ring-2 ring-emerald-400/80 rounded-full'
                : 'w-48 sm:w-64 md:w-80 max-w-md'
            }`}
          >
            <Search className={`w-4 h-4 absolute left-3.5 top-2.5 pointer-events-none transition-colors ${
              isSearchFocused ? 'text-emerald-400' : 'text-slate-400'
            }`} />
            <input
              type="text"
              value={searchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (onSearchChange) onSearchChange(e.target.value);
              }}
              placeholder="Buscar Koraza, viniltex, epóxico, rodillos..."
              className="w-full pl-10 pr-9 py-2 bg-[#050D1C] border border-slate-700/80 rounded-full text-xs text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400/60 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  if (onSearchChange) onSearchChange('');
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-white text-xs cursor-pointer p-0.5 rounded-full hover:bg-slate-800"
              >
                ✕
              </button>
            )}
          </form>

          {/* Direct Navbar Buttons: Tiendas, Calculadora & Proyectos */}
          <div className="hidden lg:flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('tiendas')}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'tiendas'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/70 hover:text-white'
              }`}
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tiendas</span>
            </button>

            <button
              type="button"
              onClick={onOpenCalculator}
              title="Calculadora de Pintura y Rendimiento"
              className="px-3 py-2 rounded-xl bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/70 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Calculator className="w-3.5 h-3.5 text-cyan-400" />
              <span>Calculadora</span>
            </button>

            <button
              type="button"
              onClick={handleProjectsClick}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                activeTab === 'captura' || activeTab === 'dashboard' || activeTab === 'proyectos_teaser'
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black'
                  : 'bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700/70'
              }`}
            >
              <HardHat className="w-3.5 h-3.5 text-amber-400" />
              <span>Proyectos & Obras</span>
            </button>
          </div>

          {/* Right Actions: Cart & Auth */}
          <div className="flex items-center gap-2 sm:gap-3">

            <button
              type="button"
              onClick={triggerCartOpen}
              className={`relative p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/70 transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                cartBounce ? 'scale-105 ring-2 ring-emerald-400' : ''
              }`}
              title="Abrir Carrito de Compras"
            >
              <ShoppingCart className="w-5 h-5 text-emerald-400" />
              <span className="hidden sm:inline text-xs font-bold">Carrito</span>
              {cartItemsCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-400 text-slate-950 text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-bounce">
                  {cartItemsCount}
                </span>
              )}
            </button>

            {isLoggedIn && (
              <button
                type="button"
                onClick={() => setActiveTab('pedidos')}
                className={`relative p-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 border ${
                  activeTab === 'pedidos'
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-md'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-white border-slate-700/70'
                }`}
                title="Rastrear y ver mis pedidos"
              >
                <Package className="w-5 h-5 text-emerald-400" />
                <span className="hidden sm:inline text-xs font-bold">Pedidos</span>
              </button>
            )}

            {isLoggedIn ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 pr-2.5 rounded-full bg-[#050D1C] border border-slate-700 hover:border-emerald-400 transition-all cursor-pointer group"
                >
                  <UserAvatarImg avatar={user.avatar} name={user.name} sizeClass="w-7 h-7" />
                  <div className="hidden sm:block text-left">
                    <span className="text-xs font-bold text-white block leading-tight truncate max-w-[110px]">
                      {user.firstName || user.name.split(' ')[0]}
                    </span>
                    <span className="text-[9px] text-emerald-400 block leading-none font-bold capitalize">
                      {user.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-white transition-transform" />
                </button>

                {isUserDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 py-3 px-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    <div className="pb-3 border-b border-slate-100">
                      <div className="flex items-center gap-2">
                        <UserAvatarImg avatar={user.avatar} name={user.name} sizeClass="w-9 h-9" />
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">{user.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                          <span className="text-[9px] font-black uppercase text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                            {user.role}
                          </span>
                        </div>
                      </div>
                      {user.company && (
                        <div className="mt-2 text-[10px] text-slate-600 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                          🏢 {user.company}
                        </div>
                      )}
                    </div>

                    <div className="space-y-1 text-xs font-semibold">
                      <button
                        onClick={() => { setActiveTab('mi_cuenta'); setIsUserDropdownOpen(false); }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <User className="w-4 h-4 text-indigo-600" />
                        <span>Mi Cuenta & Perfil</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('pedidos'); setIsUserDropdownOpen(false); }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer font-bold"
                      >
                        <Package className="w-4 h-4 text-emerald-600" />
                        <span>Mis Pedidos & Seguimiento</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('dashboard'); setIsUserDropdownOpen(false); }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Home className="w-4 h-4 text-emerald-600" />
                        <span>Panel de Obras & Proyectos</span>
                      </button>

                      <button
                        onClick={() => { setActiveTab('tienda'); setIsUserDropdownOpen(false); }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Store className="w-4 h-4 text-blue-600" />
                        <span>Tienda de Pinturas</span>
                      </button>

                      <button
                        onClick={() => { onLoadSampleCase(); setIsUserDropdownOpen(false); }}
                        className="w-full text-left p-2 rounded-xl hover:bg-slate-100 text-slate-700 flex items-center gap-2 cursor-pointer"
                      >
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <span>Cargar Caso Demo 85m²</span>
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
                        <LogOut className="w-4 h-4 text-red-600" />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={onOpenLogin}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-slate-950 text-xs font-black shadow-md transition-all cursor-pointer"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar</span>
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-slate-900/80 text-white hover:bg-slate-800 border border-slate-700/70 cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

          </div>

        </div>
      </div>

      {/* 3. Secondary Category Navigation Bar */}
      <div className="bg-[#060E1E] border-t border-slate-800/80 px-4 py-2 text-xs overflow-x-auto no-scrollbar hidden sm:block">
        <div className="max-w-7xl mx-auto flex items-center gap-2 min-w-max">

          <div className="flex items-center gap-1.5">
            {[
              { id: 'todos', label: 'Todo el Catálogo', icon: '🎨' },
              { id: 'hogar', label: 'Hogar & Decoración', icon: '🏡' },
              { id: 'construccion', label: 'Construcción & Fachadas', icon: '🧱' },
              { id: 'automotriz', label: 'Automotriz 2K', icon: '🚗' },
              { id: 'industrial', label: 'Industrial & Pisos', icon: '🏭' },
              { id: 'herramientas', label: 'Herramientas & Brochas', icon: '🖌️' }
            ].map(cat => {
              const isActive = (activeTab === 'categoria' && selectedCategory === cat.id) ||
                (activeTab === 'tienda' && cat.id === 'todos' && !searchQuery);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => handleCategoryClick(cat.id as StoreCategory)}
                  className={`px-3 py-1.5 rounded-lg font-bold transition-all duration-200 flex items-center gap-1.5 cursor-pointer text-xs active:scale-95 ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 font-black shadow-xs ring-1 ring-emerald-300'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/80 font-medium'
                  }`}
                >
                  <span>{cat.icon}</span>
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          <button
            type="button"
            onClick={handleProjectsClick}
            className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-colors border border-slate-700/60 shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Obras & Contratistas</span>
          </button>

        </div>
      </div>

      {/* 4. Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="lg:hidden py-4 px-4 bg-[#060E1E] border-t border-slate-800 space-y-3 text-xs">

          <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">
            Navegación Principal
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => { setActiveTab('tienda'); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70 font-bold flex items-center gap-2 text-left"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Tienda</span>
            </button>

            <button
              type="button"
              onClick={() => { setActiveTab('tiendas'); setIsMobileMenuOpen(false); }}
              className={`p-2.5 rounded-xl font-bold flex items-center gap-2 text-left border ${
                activeTab === 'tiendas' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800/70 text-white border-slate-700/70'
              }`}
            >
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>Tiendas & Sucursales</span>
            </button>

            <button
              type="button"
              onClick={handleProjectsClick}
              className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70 font-bold flex items-center gap-2 text-left"
            >
              <HardHat className="w-4 h-4 text-amber-400" />
              <span>Proyectos & Obras</span>
            </button>

            <button
              type="button"
              onClick={() => { onOpenCalculator(); setIsMobileMenuOpen(false); }}
              className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/70 font-bold flex items-center gap-2 text-left text-slate-200"
            >
              <Calculator className="w-4 h-4 text-cyan-400" />
              <span>Calculadora</span>
            </button>
          </div>

          <div className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider pt-2">
            Líneas & Categorías
          </div>

          <div className="space-y-1">
            {[
              { id: 'todos', label: 'Todo el Catálogo', icon: '🎨' },
              { id: 'hogar', label: 'Hogar & Decoración', icon: '🏡' },
              { id: 'construccion', label: 'Construcción & Fachadas', icon: '🧱' },
              { id: 'automotriz', label: 'Automotriz 2K', icon: '🚗' },
              { id: 'industrial', label: 'Industrial & Pisos', icon: '🏭' },
              { id: 'herramientas', label: 'Herramientas & Brochas', icon: '🖌️' }
            ].map(cat => (
              <button
                key={cat.id}
                type="button"
                onClick={() => handleCategoryClick(cat.id as StoreCategory)}
                className="w-full text-left px-3 py-2 rounded-lg bg-[#050D1C] hover:bg-slate-800 text-slate-200 border border-slate-800/80 flex items-center gap-2 font-semibold"
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>

        </div>
      )}

    </header>
  );
};