import React, { useMemo, useState } from 'react';
import { Check, Palette, Search, X } from 'lucide-react';
import { PROJECT_COLORS } from '../data/storeProducts';

export const MAX_COLORES_PROYECTO = 3;

/** Colores guardados en un proyecto: nombres separados por coma y hex separados por coma (mismo orden). */
export const coloresDeProyecto = (color?: string | null, colorHex?: string | null): Array<{ name: string; hex: string }> => {
  const hexes = String(colorHex || '').split(',').map(h => h.trim()).filter(Boolean);
  const nombres = String(color || '').split(',').map(n => n.trim()).filter(Boolean);
  const n = Math.max(hexes.length, nombres.length);
  return Array.from({ length: n }, (_, i) => ({ name: nombres[i] || '', hex: hexes[i] || '#CBD5E1' }));
};

/** Muestras pequeñas de los colores de un proyecto (para tarjetas y resúmenes). */
export const ColorSwatches: React.FC<{ color?: string | null; colorHex?: string | null; className?: string }> = ({ color, colorHex, className = 'w-3 h-3' }) => {
  const lista = coloresDeProyecto(color, colorHex);
  if (lista.length === 0) return null;
  return (
    <span className="inline-flex -space-x-1 shrink-0">
      {lista.map((c, i) => (
        <span key={i} title={c.name} className={`${className} rounded-full ring-2 ring-white border border-slate-300 shadow-xs`} style={{ backgroundColor: c.hex }} />
      ))}
    </span>
  );
};

interface ProjectColorPickerProps {
  color: string;
  colorHex: string;
  onChange: (color: string, colorHex: string) => void;
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Selector de hasta 3 colores para un proyecto de obra (colores reales del catálogo). */
export const ProjectColorPicker: React.FC<ProjectColorPickerProps> = ({ color, colorHex, onChange }) => {
  const [filtro, setFiltro] = useState('');
  const [grupo, setGrupo] = useState('todos');
  const elegidos = coloresDeProyecto(color, colorHex);
  const lleno = elegidos.length >= MAX_COLORES_PROYECTO;

  const grupos = useMemo(() => Array.from(new Set(PROJECT_COLORS.map(c => c.category))).filter(Boolean), []);
  const q = normalizar(filtro.trim());
  const visibles = PROJECT_COLORS.filter(c =>
    (grupo === 'todos' || c.category === grupo) &&
    (!q || normalizar(`${c.name} ${c.code}`).includes(q))
  );

  const guardar = (lista: Array<{ name: string; hex: string }>) =>
    onChange(lista.map(c => c.name).join(', '), lista.map(c => c.hex).join(','));

  const alternar = (c: { name: string; hex: string }) => {
    const ya = elegidos.some(e => e.name === c.name);
    if (ya) guardar(elegidos.filter(e => e.name !== c.name));
    else if (!lleno) guardar([...elegidos, { name: c.name, hex: c.hex }]);
  };

  return (
    <fieldset className="space-y-3">
      <legend className="w-full flex flex-wrap items-end justify-between gap-2 mb-1">
        <span className="text-xs font-bold text-slate-700">
          Colores de acabado <span className="font-normal text-slate-400">(opcional, hasta {MAX_COLORES_PROYECTO})</span>
        </span>
        <span className={`text-[11px] font-black px-2 py-0.5 rounded-full ${lleno ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-600'}`}>
          {elegidos.length}/{MAX_COLORES_PROYECTO} elegidos
        </span>
      </legend>

      {/* Colores elegidos */}
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: MAX_COLORES_PROYECTO }, (_, i) => {
          const c = elegidos[i];
          return c ? (
            <div key={i} className="relative rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="h-14 sm:h-16 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)]" style={{ backgroundColor: c.hex }} />
              <div className="px-2 py-1.5">
                <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">{i === 0 ? 'Principal' : `Color ${i + 1}`}</p>
                <p className="text-[11px] font-black text-slate-800 truncate" title={c.name}>{c.name}</p>
              </div>
              <button
                type="button"
                onClick={() => alternar(c)}
                aria-label={`Quitar ${c.name}`}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-white/90 hover:bg-white text-slate-700 shadow flex items-center justify-center cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div key={i} className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 h-[5.5rem] sm:h-[6rem] flex flex-col items-center justify-center text-slate-400">
              <Palette className="w-4 h-4" />
              <span className="text-[10px] font-bold mt-1">{i === 0 ? 'Color principal' : `Color ${i + 1}`}</span>
            </div>
          );
        })}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={filtro}
            maxLength={40}
            onChange={e => setFiltro(e.target.value.replace(/[<>]/g, ''))}
            placeholder="Buscar color (ej. gris, blanco)…"
            aria-label="Buscar color"
            className="w-full pl-8 pr-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {grupos.length > 1 && (
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {['todos', ...grupos].map(g => (
              <button
                key={g}
                type="button"
                onClick={() => setGrupo(g)}
                className={`shrink-0 px-2.5 py-1.5 rounded-lg text-[11px] font-bold border cursor-pointer ${grupo === g ? 'bg-[#14216B] text-white border-[#14216B]' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                {g === 'todos' ? 'Todos' : g}
              </button>
            ))}
          </div>
        )}
      </div>

      {lleno && (
        <p className="text-[11px] font-semibold text-amber-700">Ya elegiste {MAX_COLORES_PROYECTO} colores. Quita uno para cambiarlo.</p>
      )}

      {/* Paleta */}
      <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2 max-h-72 overflow-y-auto pr-1">
        {visibles.length === 0 && (
          <p className="col-span-full text-center text-xs text-slate-500 py-6">No hay colores con ese nombre.</p>
        )}
        {visibles.map(c => {
          const activo = elegidos.some(e => e.name === c.name);
          const bloqueado = lleno && !activo;
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={activo}
              disabled={bloqueado}
              onClick={() => alternar(c)}
              title={bloqueado ? `Máximo ${MAX_COLORES_PROYECTO} colores` : c.name}
              className={`group text-left rounded-xl border overflow-hidden bg-white transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${activo ? 'border-emerald-500 ring-2 ring-emerald-500/30' : 'border-slate-200 hover:border-slate-400 hover:shadow-sm'}`}
            >
              <span className="relative block h-12 shadow-[inset_0_0_0_1px_rgba(15,23,42,0.08)]" style={{ backgroundColor: c.hex }}>
                {activo && (
                  <span className="absolute top-1 right-1 w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow">
                    <Check className="w-3 h-3" />
                  </span>
                )}
              </span>
              <span className="block px-1.5 py-1">
                <span className="block text-[10px] font-bold text-slate-800 leading-tight line-clamp-2">{c.name}</span>
                {c.code && <span className="block text-[9px] text-slate-400 truncate">{c.code}</span>}
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
