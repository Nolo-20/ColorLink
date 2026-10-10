import React, { useEffect, useState } from 'react';
import { Calculator, X, ArrowRight, Plus, Trash2, Minus, ShoppingCart } from 'lucide-react';
import { STORE_PRODUCTS, coverageFor, purchasePlan, formatCOP, MAX_ITEM_QTY } from '../data/storeProducts';
import { StoreProduct, StoreProductSize, StoreProductColor } from '../types';
import { PaintCanGraphic } from './PaintCanGraphic';

interface GeneralStoreCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: StoreProduct) => void;
  onAddToCart?: (product: StoreProduct, size: StoreProductSize, color: StoreProductColor | undefined, quantity: number) => void;
}

interface WallEntry {
  id: string;
  name: string;
  width: string;
  height: string;
  doors: number;
  windows: number;
}

const MAX_WALLS = 30;
const MAX_WALL_M = 200;
const MAX_OPENINGS = 20;
const DOOR_M2 = 1.8;
const WINDOW_M2 = 1.2;
const WASTE_FACTOR = 0.1;

const sanitizeDecimal = (v: string) => {
  let out = v.replace(/[^\d.,]/g, '').replace(',', '.');
  const firstDot = out.indexOf('.');
  if (firstDot !== -1) out = out.slice(0, firstDot + 1) + out.slice(firstDot + 1).replace(/\./g, '');
  return out.slice(0, 7);
};
const parseNum = (v: string) => (v.trim() === '' || !/^\d*\.?\d*$/.test(v.trim()) ? NaN : Number(v));
const fmt = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 1 });

const PAINTS = STORE_PRODUCTS.filter(p => !p.isTool);

const newWall = (n: number): WallEntry => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
  name: `Muro ${n}`,
  width: '4',
  height: '2.6',
  doors: 0,
  windows: 0
});

export const GeneralStoreCalculatorModal: React.FC<GeneralStoreCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>(PAINTS[0]?.id || '');
  const [surfaceType, setSurfaceType] = useState<'revoque' | 'repintado' | 'drywall' | 'estuco'>('repintado');
  const [coats, setCoats] = useState<number>(2);
  const [walls, setWalls] = useState<WallEntry[]>([
    { id: '1', name: 'Muro principal', width: '4.5', height: '2.6', doors: 0, windows: 1 },
    { id: '2', name: 'Muro lateral', width: '3.5', height: '2.6', doors: 1, windows: 0 }
  ]);

  const currentProduct = PAINTS.find(p => p.id === selectedProductId) || PAINTS[0];

  // Al cambiar de pintura se usan las manos recomendadas por el fabricante
  useEffect(() => {
    setCoats(coverageFor(currentProduct).coats);
  }, [currentProduct?.id]);

  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen || !currentProduct) return null;

  const surfaceFactors: Record<string, { label: string; factor: number; desc: string }> = {
    repintado: { label: 'Muro ya pintado (buen estado)', factor: 1.0, desc: 'Rendimiento estándar' },
    estuco: { label: 'Estuco pulido / masilla', factor: 0.95, desc: 'Buen anclaje con bajo consumo' },
    drywall: { label: 'Drywall / yeso cartón', factor: 0.85, desc: 'Absorción media: la primera mano rinde menos' },
    revoque: { label: 'Revoque / cemento nuevo', factor: 0.7, desc: 'Alta porosidad: recomendamos sellador previo' }
  };

  const { perCoat } = coverageFor(currentProduct);
  const effectiveCoverage = perCoat * surfaceFactors[surfaceType].factor;

  // Validación por muro
  const wallErrors: Record<string, string> = {};
  let grossArea = 0;
  let deductionsArea = 0;
  walls.forEach(w => {
    const width = parseNum(w.width);
    const height = parseNum(w.height);
    if (!Number.isFinite(width) || width <= 0 || !Number.isFinite(height) || height <= 0) {
      wallErrors[w.id] = 'Ancho y alto deben ser números mayores que 0.';
      return;
    }
    if (width > MAX_WALL_M || height > MAX_WALL_M) {
      wallErrors[w.id] = `Máximo ${MAX_WALL_M} m por medida.`;
      return;
    }
    const area = width * height;
    const ded = w.doors * DOOR_M2 + w.windows * WINDOW_M2;
    if (ded >= area) {
      wallErrors[w.id] = 'Las puertas y ventanas ocupan más que el muro.';
      return;
    }
    grossArea += area;
    deductionsArea += ded;
  });
  const isValid = Object.keys(wallErrors).length === 0 && walls.length > 0;
  const netArea = Math.round((grossArea - deductionsArea) * 10) / 10;

  const exactGallons = isValid && netArea > 0 ? (netArea * coats / effectiveCoverage) * (1 + WASTE_FACTOR) : 0;
  const roundedGallons = Math.max(1, Math.ceil(exactGallons));
  const plan = purchasePlan(currentProduct, roundedGallons);
  const planSize = currentProduct.sizes.find(s => s.id === plan.sizeId && s.inStock)
    || currentProduct.sizes.find(s => s.inStock)
    || currentProduct.sizes[0];
  const planCount = planSize.id === plan.sizeId ? plan.count : roundedGallons;
  const planCost = planSize.price * planCount;
  const defaultColor = currentProduct.colors.find(c => c.id === currentProduct.defaultColorId && c.inStock) || currentProduct.colors.find(c => c.inStock);

  const handleAddWall = () => {
    if (walls.length >= MAX_WALLS) return;
    setWalls(prev => [...prev, newWall(prev.length + 1)]);
  };
  const handleRemoveWall = (id: string) => {
    setWalls(prev => (prev.length <= 1 ? prev : prev.filter(w => w.id !== id)));
  };
  const updateWall = (id: string, patch: Partial<WallEntry>) => {
    setWalls(prev => prev.map(w => (w.id === id ? { ...w, ...patch } : w)));
  };

  const Stepper: React.FC<{ label: string; value: number; onChange: (n: number) => void }> = ({ label, value, onChange }) => (
    <div className="flex items-center gap-1.5">
      <span className="text-[11px] text-slate-500 font-bold">{label}</span>
      <button type="button" aria-label={`Restar ${label}`} disabled={value <= 0} onClick={() => onChange(Math.max(0, value - 1))} className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center disabled:opacity-30 cursor-pointer">
        <Minus className="w-3 h-3" />
      </button>
      <span className="w-5 text-center text-xs font-black">{value}</span>
      <button type="button" aria-label={`Sumar ${label}`} disabled={value >= MAX_OPENINGS} onClick={() => onChange(Math.min(MAX_OPENINGS, value + 1))} className="w-6 h-6 rounded-md bg-white border border-slate-300 flex items-center justify-center disabled:opacity-30 cursor-pointer">
        <Plus className="w-3 h-3" />
      </button>
    </div>
  );

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="gcalc-title"
    >
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto" onClick={(e) => e.stopPropagation()}>

        <div className="bg-[#0B1528] text-white p-5 sm:p-7 flex items-center justify-between gap-3 border-b border-slate-800">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 shrink-0 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Calculadora ColorLink</span>
              <h2 id="gcalc-title" className="text-lg sm:text-2xl font-black tracking-tight text-white leading-tight">
                ¿Cuánta pintura necesito?
              </h2>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar calculadora"
            className="w-10 h-10 shrink-0 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">

          {/* 1. Pintura */}
          <div>
            <span className="text-xs font-black uppercase text-slate-700 tracking-wider block mb-2">1. Pintura que vas a usar</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {PAINTS.map(p => {
                const cov = coverageFor(p);
                const selected = selectedProductId === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProductId(p.id)}
                    aria-pressed={selected}
                    className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                      selected ? 'border-[#0B1E48] bg-blue-50/60 ring-2 ring-[#0B1E48]' : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <PaintCanGraphic productLine={p.name} sizeName="1 Galón" colorHex={p.colors[0]?.hex} colorName={p.colors[0]?.name} className="w-12 h-12 shrink-0" />
                    <span className="min-w-0">
                      <span className="block font-extrabold text-xs text-slate-900 truncate">{p.name}</span>
                      <span className="block text-[11px] text-slate-500 truncate">~{fmt(cov.perCoat)} m²/galón por mano</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Superficie y manos */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label htmlFor="gcalc-surface" className="text-xs font-black uppercase text-slate-700 tracking-wider block mb-2">2. Tipo de superficie</label>
              <select
                id="gcalc-surface"
                value={surfaceType}
                onChange={(e) => setSurfaceType(e.target.value as typeof surfaceType)}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B1E48]"
              >
                {Object.entries(surfaceFactors).map(([key, item]) => (
                  <option key={key} value={key}>{item.label}</option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">{surfaceFactors[surfaceType].desc}</p>
            </div>
            <div>
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider block mb-2">3. Número de manos</span>
              <div className="flex gap-2" role="group" aria-label="Número de manos">
                {[1, 2, 3, 4, 5].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCoats(c)}
                    aria-pressed={coats === c}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      coats === c ? 'bg-[#0B1E48] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c}
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">Recomendado para este producto: {coverageFor(currentProduct).coats} manos</p>
            </div>
          </div>

          {/* 3. Muros */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-black uppercase text-slate-700 tracking-wider">4. Muros, puertas y ventanas</span>
              <button
                type="button"
                onClick={handleAddWall}
                disabled={walls.length >= MAX_WALLS}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer disabled:opacity-40 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir muro</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {walls.map(wall => (
                <div key={wall.id} className={`p-3 bg-slate-50 rounded-2xl border ${wallErrors[wall.id] ? 'border-red-300' : 'border-slate-200'}`}>
                  <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 items-center">
                    <input
                      type="text"
                      value={wall.name}
                      maxLength={30}
                      aria-label="Nombre del muro"
                      onChange={(e) => updateWall(wall.id, { name: e.target.value.replace(/[<>]/g, '').slice(0, 30) })}
                      className="col-span-2 sm:col-span-3 w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                    />
                    {(['width', 'height'] as const).map(field => (
                      <label key={field} className="sm:col-span-2 flex items-center gap-1.5">
                        <span className="text-[11px] text-slate-500 font-bold">{field === 'width' ? 'Ancho' : 'Alto'}</span>
                        <input
                          type="text"
                          inputMode="decimal"
                          value={wall[field]}
                          onChange={(e) => updateWall(wall.id, { [field]: sanitizeDecimal(e.target.value) })}
                          className="w-16 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center"
                        />
                        <span className="text-[11px] text-slate-400">m</span>
                      </label>
                    ))}
                    <div className="col-span-2 sm:col-span-4 flex items-center gap-3 flex-wrap">
                      <Stepper label="Puertas" value={wall.doors} onChange={(n) => updateWall(wall.id, { doors: n })} />
                      <Stepper label="Ventanas" value={wall.windows} onChange={(n) => updateWall(wall.id, { windows: n })} />
                    </div>
                    <div className="col-span-2 sm:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveWall(wall.id)}
                        disabled={walls.length <= 1}
                        aria-label={`Eliminar ${wall.name}`}
                        className="text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {wallErrors[wall.id] && <p className="text-[11px] font-semibold text-red-600 mt-2">{wallErrors[wall.id]}</p>}
                </div>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">Se descuentan {fmt(DOOR_M2)} m² por puerta y {fmt(WINDOW_M2)} m² por ventana.</p>
          </div>

          {/* Resultado */}
          <div className="p-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl border border-slate-800 space-y-4" aria-live="polite">
            {isValid ? (
              <>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-xs text-blue-300 font-bold uppercase tracking-wider block">Área neta a pintar</span>
                    <span className="text-3xl font-black text-white">{fmt(netArea)} m²</span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">
                      (Muros: {fmt(grossArea)} m² − puertas/ventanas: {fmt(deductionsArea)} m²)
                    </span>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-xs text-emerald-400 font-black uppercase tracking-wider block">Pintura necesaria</span>
                    <div className="text-2xl sm:text-3xl font-black text-emerald-400">{plan.label}</div>
                    <span className="text-[11px] text-slate-300 block">
                      ≈ {fmt(exactGallons)} galones de {currentProduct.name} (incluye 10 % de desperdicio)
                    </span>
                    <span className="text-[11px] text-slate-300 block">
                      Valor estimado: {formatCOP(planCost)} COP ({planCount} × {planSize.name})
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
                  {onSelectProduct && (
                    <button
                      type="button"
                      onClick={() => { onClose(); onSelectProduct(currentProduct); }}
                      className="py-2.5 px-5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <span>Elegir color en la ficha</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                  {planCount > MAX_ITEM_QTY && (
                    <p className="text-[11px] text-amber-300 sm:mr-auto">Para más de {MAX_ITEM_QTY} unidades cotiza tu obra en la plataforma de proyectos.</p>
                  )}
                  {onAddToCart && planSize.inStock && planCount <= MAX_ITEM_QTY && (
                    <button
                      type="button"
                      onClick={() => onAddToCart(currentProduct, planSize, defaultColor, planCount)}
                      className="py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Añadir {planCount} × {planSize.name}{defaultColor ? ` (${defaultColor.name})` : ''}</span>
                    </button>
                  )}
                </div>
              </>
            ) : (
              <p className="text-sm text-amber-300 font-semibold">Revisa las medidas de los muros marcados en rojo para ver el resultado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
