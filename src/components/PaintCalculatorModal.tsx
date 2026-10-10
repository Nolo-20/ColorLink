import React, { useState, useEffect } from 'react';
import { Calculator, X, Ruler, HelpCircle, Move, Check, ArrowRight, Info } from 'lucide-react';
import { StoreProduct } from '../types';
import { coverageFor, purchasePlan, MAX_ITEM_QTY } from '../data/storeProducts';

interface PaintCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: StoreProduct | null;
  onApplyQuantity: (quantityGal: number, recommendedSizeId?: string, targetProduct?: StoreProduct) => void;
}

/** Límites de validación */
const MAX_AREA_M2 = 100000;
const MAX_WALL_M = 200;
const MAX_WALLS = 50;
const MIN_COATS = 1;
const MAX_COATS = 5;
const WASTE_FACTOR = 0.1; // 10 % de desperdicio

/** Convierte texto a número (acepta coma decimal); devuelve NaN si no es válido. */
const parseNum = (v: string): number => {
  const t = v.trim().replace(',', '.');
  if (t === '' || !/^\d*\.?\d*$/.test(t)) return NaN;
  return Number(t);
};

/** Deja solo dígitos y un separador decimal, máximo 8 caracteres. */
const sanitizeDecimal = (v: string) => {
  let out = v.replace(/[^\d.,]/g, '').replace(',', '.');
  const firstDot = out.indexOf('.');
  if (firstDot !== -1) out = out.slice(0, firstDot + 1) + out.slice(firstDot + 1).replace(/\./g, '');
  return out.slice(0, 8);
};

const sanitizeInt = (v: string, maxLen = 3) => v.replace(/\D/g, '').slice(0, maxLen);

const fmt = (n: number) => n.toLocaleString('es-CO', { maximumFractionDigits: 1 });

export const PaintCalculatorModal: React.FC<PaintCalculatorModalProps> = ({
  isOpen,
  onClose,
  product,
  onApplyQuantity
}) => {
  const { perCoat, coats: defaultCoats } = coverageFor(product);

  const [calculationMode, setCalculationMode] = useState<'known' | 'unknown'>('known');
  const [areaM2, setAreaM2] = useState<string>('25');
  const [wallWidth, setWallWidth] = useState<string>('4');
  const [wallHeight, setWallHeight] = useState<string>('2.6');
  const [wallsCount, setWallsCount] = useState<string>('4');
  const [deductionsM2, setDeductionsM2] = useState<string>('4');
  const [coats, setCoats] = useState<number>(defaultCoats);
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [calculatedArea, setCalculatedArea] = useState<number>(0);

  // Cada vez que se abre: resultado limpio y manos recomendadas del producto
  useEffect(() => {
    if (isOpen) {
      setHasCalculated(false);
      setCoats(defaultCoats);
    }
  }, [isOpen, product?.id]);

  // Cerrar con Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // ---------- Validación ----------
  const errors: Record<string, string> = {};
  let finalArea = 0;
  if (calculationMode === 'known') {
    const a = parseNum(areaM2);
    if (areaM2.trim() === '') errors.area = 'Ingresa el área a pintar.';
    else if (!Number.isFinite(a)) errors.area = 'Solo números (ej. 25 o 25.5).';
    else if (a <= 0) errors.area = 'El área debe ser mayor que 0.';
    else if (a > MAX_AREA_M2) errors.area = `Máximo ${MAX_AREA_M2.toLocaleString('es-CO')} m².`;
    else finalArea = a;
  } else {
    const w = parseNum(wallWidth), h = parseNum(wallHeight), n = parseNum(wallsCount), d = deductionsM2.trim() === '' ? 0 : parseNum(deductionsM2);
    if (!Number.isFinite(w) || w <= 0) errors.width = 'Ancho mayor que 0.';
    else if (w > MAX_WALL_M) errors.width = `Máximo ${MAX_WALL_M} m.`;
    if (!Number.isFinite(h) || h <= 0) errors.height = 'Alto mayor que 0.';
    else if (h > MAX_WALL_M) errors.height = `Máximo ${MAX_WALL_M} m.`;
    if (!Number.isFinite(n) || n < 1 || !Number.isInteger(n)) errors.walls = 'Entre 1 y 50 muros.';
    else if (n > MAX_WALLS) errors.walls = `Máximo ${MAX_WALLS} muros.`;
    if (!Number.isFinite(d) || d < 0) errors.deductions = 'Número igual o mayor que 0.';
    if (!errors.width && !errors.height && !errors.walls && !errors.deductions) {
      const gross = w * h * n;
      if (d >= gross) errors.deductions = 'Los descuentos no pueden ser mayores que el área de los muros.';
      else finalArea = Math.round((gross - d) * 10) / 10;
    }
  }
  if (coats < MIN_COATS || coats > MAX_COATS) errors.coats = `Entre ${MIN_COATS} y ${MAX_COATS} manos.`;
  const isValid = Object.keys(errors).length === 0 && finalArea > 0;

  const handleCalculate = () => {
    if (!isValid) return;
    setCalculatedArea(finalArea);
    setHasCalculated(true);
  };

  // ---------- Resultado ----------
  const exactGallons = (calculatedArea * coats / perCoat) * (1 + WASTE_FACTOR);
  const gallonsNeeded = Math.max(1, Math.ceil(exactGallons));
  const plan = purchasePlan(product, gallonsNeeded);

  const handleApply = () => {
    onApplyQuantity(gallonsNeeded, plan.sizeId, product || undefined);
    onClose();
  };

  const resetResult = () => setHasCalculated(false);
  const inputCls = (err?: string) =>
    `w-full py-1.5 px-2 bg-white border rounded-lg text-sm font-bold text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0B1E48] ${err ? 'border-red-400' : 'border-slate-300'}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="calc-title"
    >
      <div
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 sm:p-7 border-b border-slate-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 shrink-0 rounded-xl border-2 border-[#0B1E48] text-[#0B1E48] flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 id="calc-title" className="text-lg sm:text-xl font-black text-[#0B1E48] tracking-tight">
              CALCULAR CANTIDAD
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 shrink-0 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            aria-label="Cerrar calculadora"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-5">
          <p className="text-center text-sm font-semibold text-slate-600">¿Ya sabes cuántos metros tienes que pintar?</p>

          <div className="bg-[#E2E8F0]/50 p-1.5 rounded-2xl flex items-center gap-2">
            {([['known', 'Ya sé las medidas', Ruler], ['unknown', 'No sé las medidas', HelpCircle]] as const).map(([mode, label, Icon]) => (
              <button
                key={mode}
                type="button"
                onClick={() => { setCalculationMode(mode); resetResult(); }}
                aria-pressed={calculationMode === mode}
                className={`flex-1 py-3 px-2 sm:px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  calculationMode === mode ? 'bg-[#0B1E48] text-white shadow-md' : 'bg-transparent text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{label}</span>
              </button>
            ))}
          </div>

          {calculationMode === 'known' ? (
            <div>
              <div className="border border-slate-200 rounded-2xl p-4 flex items-center justify-between gap-3 bg-slate-50/50">
                <label htmlFor="calc-area" className="flex items-center gap-2 text-[#0B1E48] font-black text-xs sm:text-sm tracking-wide">
                  <Move className="w-4 h-4" />
                  <span>ÁREA A PINTAR (M²)</span>
                </label>
                <input
                  id="calc-area"
                  type="text"
                  inputMode="decimal"
                  value={areaM2}
                  onChange={(e) => { setAreaM2(sanitizeDecimal(e.target.value)); resetResult(); }}
                  placeholder="0"
                  aria-invalid={Boolean(errors.area)}
                  aria-describedby="calc-area-err"
                  className={`w-28 sm:w-32 text-center py-2.5 px-3 bg-white border rounded-xl font-black text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-[#0B1E48] text-base ${errors.area ? 'border-red-400' : 'border-slate-300'}`}
                />
              </div>
              {errors.area && <p id="calc-area-err" className="text-[11px] font-semibold text-red-600 mt-1.5">{errors.area}</p>}
              <div className="mt-3">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">O elige un ambiente típico:</span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Hab. pequeña', m2: 30 },
                    { label: 'Hab. mediana', m2: 45 },
                    { label: 'Sala / comedor', m2: 70 },
                    { label: 'Fachada', m2: 120 }
                  ].map(preset => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => { setAreaM2(String(preset.m2)); resetResult(); }}
                      className="py-2 px-2 text-center rounded-xl border border-slate-200 hover:border-[#0B1E48] bg-white text-xs font-bold text-slate-700 transition-all cursor-pointer hover:bg-slate-50"
                    >
                      <span className="block truncate">{preset.label}</span>
                      <span className="text-[10px] text-slate-500">{preset.m2} m² de muro</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Medidas aproximadas del espacio:</div>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ['calc-w', 'Ancho de cada muro (m)', wallWidth, setWallWidth, errors.width, 'decimal'],
                  ['calc-h', 'Alto de muro (m)', wallHeight, setWallHeight, errors.height, 'decimal'],
                  ['calc-n', 'Número de muros', wallsCount, setWallsCount, errors.walls, 'int'],
                  ['calc-d', 'Puertas y ventanas (m²)', deductionsM2, setDeductionsM2, errors.deductions, 'decimal']
                ] as const).map(([id, label, value, setter, err, kind]) => (
                  <div key={id} className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                    <label htmlFor={id} className="text-[11px] font-bold text-slate-600 block mb-1">{label}</label>
                    <input
                      id={id}
                      type="text"
                      inputMode={kind === 'int' ? 'numeric' : 'decimal'}
                      value={value}
                      onChange={(e) => { setter(kind === 'int' ? sanitizeInt(e.target.value, 2) : sanitizeDecimal(e.target.value)); resetResult(); }}
                      aria-invalid={Boolean(err)}
                      className={inputCls(err)}
                    />
                    {err && <p className="text-[10px] font-semibold text-red-600 mt-1">{err}</p>}
                  </div>
                ))}
              </div>
              {isValid && (
                <p className="text-[11px] text-slate-500">Área neta estimada: <strong className="text-slate-800">{fmt(finalArea)} m²</strong></p>
              )}
            </div>
          )}

          {/* Manos */}
          <div>
            <span className="text-[11px] font-bold text-slate-600 block mb-1.5">Número de manos</span>
            <div className="flex gap-2" role="group" aria-label="Número de manos">
              {[1, 2, 3, 4, 5].map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => { setCoats(c); resetResult(); }}
                  aria-pressed={coats === c}
                  className={`flex-1 py-2 rounded-xl font-black text-xs transition-all cursor-pointer ${
                    coats === c ? 'bg-[#0B1E48] text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
            {errors.coats && <p className="text-[11px] font-semibold text-red-600 mt-1">{errors.coats}</p>}
          </div>

          {product && (
            <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 flex items-start gap-2 text-xs text-blue-900">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <span>
                Rendimiento de {product.name}: <strong>~{fmt(perCoat)} m² por galón a una mano</strong>. Se recomiendan {defaultCoats} manos; el cálculo incluye 10 % de desperdicio.
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={handleCalculate}
            disabled={!isValid}
            className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md bg-[#0B1E48] hover:bg-[#132A60] text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Calcular resultado</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {hasCalculated && (
            <div className="p-5 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-4" role="status">
              <div className="flex items-center justify-between gap-2 border-b border-emerald-200 pb-3">
                <span className="text-xs font-bold text-emerald-900">Superficie a pintar:</span>
                <span className="text-sm font-black text-emerald-950">{fmt(calculatedArea)} m² · {coats} {coats === 1 ? 'mano' : 'manos'}</span>
              </div>
              <div className="text-center py-1">
                <span className="text-xs text-emerald-800 font-medium block">Necesitas aproximadamente {fmt(exactGallons)} galones:</span>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1E48] mt-1">{plan.label}</div>
              </div>
              {product && plan.count > MAX_ITEM_QTY ? (
                <p className="text-[11px] text-emerald-900 text-center font-semibold">
                  Es un volumen de obra (más de {MAX_ITEM_QTY} unidades): cotízalo en la plataforma de proyectos para recibir precio por volumen.
                </p>
              ) : product ? (
                <button
                  type="button"
                  onClick={handleApply}
                  className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Aplicar {plan.label} a mi pedido</span>
                </button>
              ) : (
                <p className="text-[11px] text-emerald-800 text-center">Estimado con un vinilo de interior. Elige un producto para un cálculo exacto.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
