import React, { useState } from 'react';
import { MapPin, X, Phone, Clock, Search, ExternalLink, CheckCircle2 } from 'lucide-react';
import { STORE_BRANCHES } from '../data/storeProducts';
import { StoreBranch } from '../types';

interface BranchLocatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectBranch?: (branch: StoreBranch) => void;
  selectedBranchId?: string;
}

export const BranchLocatorModal: React.FC<BranchLocatorModalProps> = ({
  isOpen,
  onClose,
  onSelectBranch,
  selectedBranchId
}) => {
  const [selectedCity, setSelectedCity] = useState<string>('Todas');
  const [searchQuery, setSearchQuery] = useState<string>('');

  if (!isOpen) return null;

  const cities = ['Todas', ...Array.from(new Set(STORE_BRANCHES.map(b => b.city)))];

  const filteredBranches = STORE_BRANCHES.filter(branch => {
    const matchesCity = selectedCity === 'Todas' || branch.city === selectedCity;
    const matchesSearch = searchQuery.trim() === '' || 
      branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
      branch.city.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCity && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto">
        
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-extrabold tracking-tight">
                Puntos de Venta & Sucursales ColorLink
              </h3>
              <p className="text-slate-400 text-xs sm:text-sm">
                Encuentra tu tienda más cercana para retiro en 2 horas o tintometría en vivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          {/* City pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            {cities.map(city => (
              <button
                key={city}
                type="button"
                onClick={() => setSelectedCity(city)}
                className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCity === city
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por barrio o sede..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Branches list */}
        <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
          {filteredBranches.map(branch => {
            const isSelected = selectedBranchId === branch.id;
            return (
              <div
                key={branch.id}
                className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  isSelected 
                    ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20' 
                    : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{branch.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {branch.city}
                    </span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Retiro en {branch.readyInHours}h
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch.address}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch.schedule}</span>
                  </p>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{branch.phone}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {onSelectBranch && (
                    <button
                      type="button"
                      onClick={() => {
                        onSelectBranch(branch);
                        onClose();
                      }}
                      className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                        isSelected 
                          ? 'bg-emerald-600 text-white' 
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Seleccionada</span>
                        </>
                      ) : (
                        <span>Seleccionar para retiro</span>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {filteredBranches.length === 0 && (
            <div className="text-center py-10 text-slate-400 text-sm">
              No se encontraron sucursales para los filtros seleccionados.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Todas nuestras sedes cuentan con parqueadero gratuito para clientes y cargue de materiales</span>
          <button
            type="button"
            onClick={onClose}
            className="font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
