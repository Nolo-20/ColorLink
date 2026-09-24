import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  X, 
  Ruler, 
  HelpCircle, 
  Move, 
  Check, 
  Layers, 
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import { StoreProduct } from '../types';

interface PaintCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: StoreProduct | null;
  onApplyQuantity: (quantityGal: number, recommendedSizeId?: string, targetProduct?: StoreProduct) => void;
}

export const PaintCalculatorModal: React.FC<PaintCalculatorModalProps> = ({
  isOpen,
  onClose,
  product,
  onApplyQuantity
}) => {
  // Mode matching Image 8: 'known' (Ya sé las medidas) vs 'unknown' (No sé las medidas)
  const [calculationMode, setCalculationMode] = useState<'known' | 'unknown'>('known');
  
  // Known mode area
  const [areaM2, setAreaM2] = useState<number | string>('');

  // Unknown mode parameters
  const [wallWidth, setWallWidth] = useState<number | string>(4);
  const [wallHeight, setWallHeight] = useState<number | string>(2.6);
  const [wallsCount, setWallsCount] = useState<number>(4);
  const [deductionsM2, setDeductionsM2] = useState<number>(4); // doors/windows to deduct

  // Coats
  const [coats, setCoats] = useState<number>(2);

  // Calculation result state
  const [hasCalculated, setHasCalculated] = useState<boolean>(false);
  const [calculatedArea, setCalculatedArea] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setHasCalculated(false);
      if (areaM2 === '') setAreaM2(25);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Rendimiento técnico específico por producto (m2/galón a 2 manos)
  const getProductCoverage = () => {
    if (!product) return 25;
    const id = product.id.toLowerCase();
    if (id.includes('koraza')) return 16; // 32 m2 a 1 mano -> 16 m2 a 2 manos sobre revoque
    if (id.includes('epox')) return 10;
    if (id.includes('pintulux')) return 22;
    return 25; // Viniltex Ultralavable
  };

  const coveragePerGalon2Manos = getProductCoverage();

  const handleCalculate = () => {
    let finalArea = 0;
    if (calculationMode === 'known') {
      finalArea = Math.max(0, Number(areaM2) || 0);
    } else {
      const grossArea = (Number(wallWidth) || 0) * (Number(wallHeight) || 0) * wallsCount;
      finalArea = Math.max(1, grossArea - (Number(deductionsM2) || 0));
    }
    setCalculatedArea(finalArea);
    setHasCalculated(true);
  };

  // Gallons computation
  const gallonsNeeded = Math.max(1, Math.ceil(calculatedArea / coveragePerGalon2Manos));
  const cunetesNeeded = Math.floor(gallonsNeeded / 5);
  const remainderGallons = gallonsNeeded % 5;

  const handleApply = () => {
    onApplyQuantity(gallonsNeeded, gallonsNeeded >= 5 ? 'cunete' : 'galon', product || undefined);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* ======================================================== */}
        {/* MODAL HEADER (Exact match with Image 8) */}
        {/* ======================================================== */}
        <div className="p-6 sm:p-7 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl border-2 border-[#0B1E48] text-[#0B1E48] flex items-center justify-center shadow-xs">
              <Calculator className="w-5 h-5 stroke-[2.2]" />
            </div>
            <h3 className="text-lg sm:text-xl font-black text-[#0B1E48] tracking-tight">
              CALCULAR CANTIDAD
            </h3>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-7 space-y-6">
          
          {/* Subtitle matching Image 8 */}
          <p className="text-center text-sm font-semibold text-slate-600">
            ¿Ya sabes cuántos metros tienes que pintar?
          </p>

          {/* ======================================================== */}
          {/* TOGGLE TABS (Exact match with Image 8) */}
          {/* [ Ya sé las medidas ] vs [ No sé las medidas ] */}
          {/* ======================================================== */}
          <div className="bg-[#E2E8F0]/50 p-1.5 rounded-2xl flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setCalculationMode('known');
                setHasCalculated(false);
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                calculationMode === 'known'
                  ? 'bg-[#0B1E48] text-white shadow-md'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <Ruler className="w-4 h-4" />
              <span>Ya sé las medidas</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCalculationMode('unknown');
                setHasCalculated(false);
              }}
              className={`flex-1 py-3 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer ${
                calculationMode === 'unknown'
                  ? 'bg-[#0B1E48] text-white shadow-md'
                  : 'bg-transparent text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>No sé las medidas</span>
            </button>
          </div>

          {/* ======================================================== */}
          {/* CONTENT: YA SÉ LAS MEDIDAS (Exact match with Image 8) */}
          {/* ======================================================== */}
          {calculationMode === 'known' && (
            <div className="border border-slate-200 rounded-2xl p-4 sm:p-5 flex items-center justify-between gap-4 bg-slate-50/50">
              <div className="flex items-center gap-2.5 text-[#0B1E48] font-black text-xs sm:text-sm tracking-wide">
                <Move className="w-4 h-4 text-[#0B1E48]" />
                <span>AREA DEL AMBIENTE (M²)</span>
              </div>

              <div className="w-28 sm:w-32">
                <input
                  type="number"
                  min="1"
                  max="1000"
                  value={areaM2}
                  onChange={(e) => {
                    setAreaM2(e.target.value);
                    setHasCalculated(false);
                  }}
                  placeholder="0"
                  className="w-full text-center py-2.5 px-3 bg-white border border-slate-300 rounded-xl font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0B1E48] text-base"
                />
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* CONTENT: NO SÉ LAS MEDIDAS (Presets & Guided Dimensions) */}
          {/* ======================================================== */}
          {calculationMode === 'unknown' && (
            <div className="space-y-4">
              <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Dimensiones aproximadas del espacio:
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Ancho de muro (m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.5"
                    value={wallWidth}
                    onChange={(e) => {
                      setWallWidth(e.target.value);
                      setHasCalculated(false);
                    }}
                    className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>

                <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Alto de muro (m)
                  </label>
                  <input
                    type="number"
                    min="1"
                    step="0.1"
                    value={wallHeight}
                    onChange={(e) => {
                      setWallHeight(e.target.value);
                      setHasCalculated(false);
                    }}
                    className="w-full py-1.5 px-2 bg-white border border-slate-300 rounded-lg text-sm font-bold text-slate-900"
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 block mb-2">
                  O selecciona un ambiente típico:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { label: 'Hab. Pequeña', m2: 12 },
                    { label: 'Hab. Mediana', m2: 20 },
                    { label: 'Sala / Comedor', m2: 35 },
                    { label: 'Fachada', m2: 60 }
                  ].map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setAreaM2(preset.m2);
                        setCalculationMode('known');
                        setHasCalculated(false);
                      }}
                      className="py-2 px-2 text-center rounded-xl border border-slate-200 hover:border-[#0B1E48] bg-white text-xs font-bold text-slate-700 transition-all cursor-pointer hover:bg-slate-50"
                    >
                      <span className="block truncate">{preset.label}</span>
                      <span className="text-[10px] text-slate-500">{preset.m2} m²</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Product Technical Reference Banner */}
          {product && (
            <div className="bg-blue-50/70 border border-blue-200/60 rounded-xl p-3 flex items-center justify-between text-xs text-blue-900">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>Rendimiento {product.name}: <strong>~{coveragePerGalon2Manos} m²/galón a 2 manos</strong></span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ACTION BUTTON: CALCULAR RESULTADO (Exact match with Image 8) */}
          {/* ======================================================== */}
          <button
            type="button"
            onClick={handleCalculate}
            className="w-full py-3.5 px-6 rounded-xl font-black text-sm uppercase tracking-wider transition-all duration-200 cursor-pointer shadow-md bg-[#0B1E48] hover:bg-[#132A60] active:scale-98 text-white flex items-center justify-center gap-2"
          >
            <span>CALCULAR RESULTADO</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* ======================================================== */}
          {/* CALCULATION RESULTS DISPLAY (When button is clicked) */}
          {/* ======================================================== */}
          {hasCalculated && (
            <div className="mt-4 p-5 bg-emerald-50 border border-emerald-300 rounded-2xl animate-in fade-in duration-200 space-y-4">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-3">
                <span className="text-xs font-bold text-emerald-900">Superficie a pintar:</span>
                <span className="text-sm font-black text-emerald-950">{calculatedArea} m² (2 manos)</span>
              </div>

              <div className="text-center py-2">
                <span className="text-xs text-emerald-800 font-medium block">Cantidad recomendada para tu proyecto:</span>
                <div className="text-2xl sm:text-3xl font-black text-[#0B1E48] mt-1">
                  {gallonsNeeded} Galón{gallonsNeeded > 1 ? 'es' : ''}
                </div>
                {cunetesNeeded > 0 && (
                  <span className="text-xs text-slate-600 font-bold block mt-1">
                    Equivalente a: {cunetesNeeded} Cuñete{cunetesNeeded > 1 ? 's' : ''} de 5 Gal. {remainderGallons > 0 ? `+ ${remainderGallons} Galón(es)` : ''}
                  </span>
                )}
              </div>

              {/* Apply Button */}
              <button
                type="button"
                onClick={handleApply}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-4 h-4" />
                <span>Aplicar {gallonsNeeded} Galón{gallonsNeeded > 1 ? 'es' : ''} a mi pedido</span>
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
