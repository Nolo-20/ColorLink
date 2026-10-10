import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Search, X, ArrowRight } from 'lucide-react';
import type { StoreProduct } from '../types';
import { buscarProductos, normalizar, precioDesde } from '../utils/productSearch';
import { ProductThumb } from './ProductThumb';

const formato = (n: number) => (Number.isFinite(n) ? `$${Math.round(n).toLocaleString('es-CO')}` : '');

/** Resalta en negrita la parte del nombre que coincide con lo escrito */
const Resaltado: React.FC<{ texto: string; consulta: string }> = ({ texto, consulta }) => {
  const tokens = normalizar(consulta).split(' ').filter(t => t.length > 1);
  if (!tokens.length) return <>{texto}</>;
  const norm = normalizar(texto);
  // normalizar conserva la longitud salvo símbolos; se marca por posiciones sobre el texto sin tildes
  const marcas = new Array(texto.length).fill(false);
  const plano = texto.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  tokens.forEach(t => {
    let i = plano.indexOf(t);
    while (i >= 0) { for (let k = i; k < i + t.length && k < marcas.length; k++) marcas[k] = true; i = plano.indexOf(t, i + t.length); }
  });
  if (!norm || !marcas.some(Boolean)) return <>{texto}</>;
  const partes: React.ReactNode[] = [];
  let actual = '', marcado = marcas[0];
  for (let i = 0; i < texto.length; i++) {
    if (marcas[i] !== marcado) { partes.push(marcado ? <strong key={i} className="font-black text-slate-950">{actual}</strong> : actual); actual = ''; marcado = marcas[i]; }
    actual += texto[i];
  }
  partes.push(marcado ? <strong key="f" className="font-black text-slate-950">{actual}</strong> : actual);
  return <>{partes}</>;
};

interface Props {
  value: string;
  onChange: (v: string) => void;
  /** Enter o "Ver todos": muestra los resultados en la tienda */
  onSubmit: (v: string) => void;
  onSelectProduct: (p: StoreProduct) => void;
  placeholder?: string;
  /** Clases del contenedor (ancho, visibilidad por breakpoint) */
  className?: string;
  inputClassName?: string;
}

/** Campo de búsqueda con sugerencias de productos mientras se escribe (teclado: ↑ ↓ Enter Esc). */
export const SearchWithSuggestions: React.FC<Props> = ({ value, onChange, onSubmit, onSelectProduct, placeholder, className = '', inputClassName = '' }) => {
  const [abierto, setAbierto] = useState(false);
  const [activo, setActivo] = useState(-1);
  const ref = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listaId = useRef(`sugerencias-${Math.random().toString(36).slice(2, 8)}`).current;

  const consulta = value.trim();
  const resultados = useMemo(() => (consulta.length >= 2 ? buscarProductos(consulta, 50) : []), [consulta]);
  const sugerencias = resultados.slice(0, 6);
  const mostrar = abierto && consulta.length >= 2;

  useEffect(() => { setActivo(-1); }, [consulta]);

  useEffect(() => {
    if (!abierto) return;
    const fuera = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAbierto(false); };
    document.addEventListener('mousedown', fuera);
    return () => document.removeEventListener('mousedown', fuera);
  }, [abierto]);

  const elegir = (p: StoreProduct) => {
    setAbierto(false);
    inputRef.current?.blur();
    onSelectProduct(p);
  };

  const enviar = () => {
    if (activo >= 0 && sugerencias[activo]) return elegir(sugerencias[activo]);
    setAbierto(false);
    inputRef.current?.blur();
    onSubmit(consulta);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setAbierto(true); setActivo(a => Math.min(a + 1, sugerencias.length - 1)); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActivo(a => Math.max(a - 1, -1)); }
    else if (e.key === 'Escape') { setAbierto(false); setActivo(-1); }
  };

  return (
    <div ref={ref} className={`relative ${className}`}>
      <form
        role="search"
        onSubmit={(e) => { e.preventDefault(); enviar(); }}
        className="relative"
      >
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
        <input
          ref={inputRef}
          type="search"
          value={value}
          maxLength={80}
          onFocus={() => setAbierto(true)}
          onChange={(e) => { onChange(e.target.value.slice(0, 80)); setAbierto(true); }}
          onKeyDown={onKeyDown}
          placeholder={placeholder || 'Buscar pinturas, epóxicos, rodillos…'}
          role="combobox"
          aria-expanded={mostrar}
          aria-controls={listaId}
          aria-autocomplete="list"
          aria-activedescendant={activo >= 0 ? `${listaId}-${activo}` : undefined}
          className={`w-full pl-10 pr-9 py-2 bg-[#050D1C] border border-slate-700/80 rounded-full text-white placeholder-slate-400 focus:outline-hidden focus:border-cyan-400/60 [&::-webkit-search-cancel-button]:hidden ${inputClassName}`}
        />
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); onSubmit(''); inputRef.current?.focus(); }}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 rounded-full hover:bg-slate-800 cursor-pointer"
            aria-label="Borrar búsqueda"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {mostrar && (
        <div id={listaId} role="listbox" className="absolute left-0 right-0 sm:right-auto sm:w-[28rem] mt-2 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {sugerencias.length === 0 ? (
            <div className="px-4 py-4 text-sm">
              <p className="font-bold text-slate-800">No encontramos “{consulta}”</p>
              <p className="text-xs text-slate-500 mt-1">Prueba con otra palabra, por ejemplo: koraza, viniltex, epóxico, brocha o rodillo.</p>
            </div>
          ) : (
            <>
              <p className="px-4 pt-3 pb-1 text-[10px] font-black uppercase tracking-wider text-slate-400">Productos</p>
              <ul>
                {sugerencias.map((p, i) => {
                  const desde = precioDesde(p);
                  return (
                    <li key={p.id} id={`${listaId}-${i}`} role="option" aria-selected={activo === i}>
                      <button
                        type="button"
                        onMouseEnter={() => setActivo(i)}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => elegir(p)}
                        className={`w-full flex items-center gap-3 px-4 py-2 text-left cursor-pointer ${activo === i ? 'bg-amber-50' : 'hover:bg-slate-50'}`}
                      >
                        <span className="w-10 h-10 shrink-0 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center overflow-hidden">
                          <ProductThumb productId={p.id} name={p.name} />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm text-slate-700 line-clamp-2 leading-snug"><Resaltado texto={p.name} consulta={consulta} /></span>
                          <span className="block text-[11px] text-slate-500 truncate">{p.categoryLabel}</span>
                        </span>
                        {Number.isFinite(desde) && <span className="shrink-0 text-xs font-bold text-slate-700">Desde {formato(desde)}</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setActivo(-1); setAbierto(false); onSubmit(consulta); }}
                className="w-full flex items-center justify-between px-4 py-2.5 border-t border-slate-100 text-xs font-bold text-blue-700 hover:bg-slate-50 cursor-pointer"
              >
                <span>Ver {resultados.length === 1 ? 'el resultado' : `los ${resultados.length} resultados`} para “{consulta}”</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};
