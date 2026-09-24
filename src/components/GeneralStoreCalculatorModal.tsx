import React, { useState } from 'react';
import { 
  Calculator, 
  X, 
  Ruler, 
  Layers, 
  Sparkles, 
  Info, 
  Check, 
  ArrowRight, 
  Plus, 
  Trash2,
  Package,
  Droplet
} from 'lucide-react';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { StoreProduct } from '../types';

interface GeneralStoreCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct?: (product: StoreProduct) => void;
  onAddToCart?: (product: StoreProduct, size: any, color: any, quantity: number) => void;
}

interface WallEntry {
  id: string;
  name: string;
  width: number;
  height: number;
  doors: number;
  windows: number;
}

export const GeneralStoreCalculatorModal: React.FC<GeneralStoreCalculatorModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
  onAddToCart
}) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('viniltex-ultralavable');
  const [surfaceType, setSurfaceType] = useState<'revoque' | 'repintado' | 'drywall' | 'estuco'>('repintado');
  const [coats, setCoats] = useState<number>(2);
  
  const [walls, setWalls] = useState<WallEntry[]>([
    { id: '1', name: 'Muro Principal', width: 4.5, height: 2.6, doors: 0, windows: 1 },
    { id: '2', name: 'Muro Lateral', width: 3.5, height: 2.6, doors: 1, windows: 0 }
  ]);

  if (!isOpen) return null;

  const currentProduct = STORE_PRODUCTS.find(p => p.id === selectedProductId) || STORE_PRODUCTS[0];

  // Surface absorption factors
  const surfaceFactors: Record<string, { label: string; factor: number; desc: string }> = {
    repintado: { label: 'Muro Ya Pintado (Buen Estado)', factor: 1.0, desc: 'Rendimiento estándar óptimo' },
    estuco: { label: 'Estuco Pulido / Masilla', factor: 0.95, desc: 'Excelente anclaje con mínimo consumo' },
    drywall: { label: 'Drywall / Yeso Cartón', factor: 0.85, desc: 'Absorción media, requiere buena primera mano' },
    revoque: { label: 'Revoque / Cemento Nuevo', factor: 0.70, desc: 'Alta porosidad, recomendamos imprimante sellador previo' }
  };

  // Base coverage m2/galon (at 2 coats)
  const baseCoverage = currentProduct.specs.rendimiento.includes('25') ? 25 :
                        currentProduct.specs.rendimiento.includes('28') ? 28 :
                        currentProduct.specs.rendimiento.includes('35') ? 35 : 24;

  const effectiveCoverage = baseCoverage * surfaceFactors[surfaceType].factor;

  // Calculate total area
  const grossArea = walls.reduce((sum, w) => sum + (w.width * w.height), 0);
  const deductionsArea = walls.reduce((sum, w) => sum + (w.doors * 1.8) + (w.windows * 1.2), 0);
  const netArea = Math.max(1, Math.round((grossArea - deductionsArea) * 10) / 10);

  // Gallons required
  const exactGallons = (netArea / effectiveCoverage) * (coats / 2);
  const roundedGallons = Math.ceil(exactGallons);
  const bucketsCount = Math.floor(roundedGallons / 5);
  const remainingGallons = roundedGallons % 5;

  const handleAddWall = () => {
    const nextId = String(Date.now());
    setWalls([...walls, {
      id: nextId,
      name: `Muro ${walls.length + 1}`,
      width: 4,
      height: 2.6,
      doors: 0,
      windows: 0
    }]);
  };

  const handleRemoveWall = (id: string) => {
    if (walls.length <= 1) return;
    setWalls(walls.filter(w => w.id !== id));
  };

  const handleUpdateWall = (id: string, field: keyof WallEntry, value: any) => {
    setWalls(walls.map(w => {
      if (w.id === id) {
        return { ...w, [field]: value };
      }
      return w;
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto">
        
        {/* Header */}
        <div className="bg-[#0B1528] text-white p-6 sm:p-7 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  Herramienta Técnica ColorLink
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mt-0.5">
                Calculadora Técnica de Pintura & Metros Cuadrados
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
          
          {/* 1. Product Selector */}
          <div>
            <label className="text-xs font-black uppercase text-slate-700 tracking-wider block mb-2">
              1. Selecciona la Pintura que vas a utilizar:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {STORE_PRODUCTS.filter(p => !p.isTool).map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setSelectedProductId(p.id)}
                  className={`p-3 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-3 ${
                    selectedProductId === p.id 
                      ? 'border-[#0B1E48] bg-blue-50/60 ring-2 ring-[#0B1E48]' 
                      : 'border-slate-200 hover:border-slate-400 bg-white'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                    <Droplet className={`w-5 h-5 ${selectedProductId === p.id ? 'text-[#0B1E48]' : 'text-slate-400'}`} />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs text-slate-900 truncate">{p.name}</h4>
                    <p className="text-[11px] text-slate-500 truncate">{p.specs.rendimiento}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Surface & Hands */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
            <div>
              <label className="text-xs font-black uppercase text-slate-700 tracking-wider block mb-2">
                2. Tipo de Superficie:
              </label>
              <select
                value={surfaceType}
                onChange={(e) => setSurfaceType(e.target.value as any)}
                className="w-full p-3 rounded-xl border border-slate-300 text-xs sm:text-sm font-bold text-slate-800 bg-white focus:outline-hidden focus:ring-2 focus:ring-[#0B1E48]"
              >
                {Object.entries(surfaceFactors).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.label}
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1">
                {surfaceFactors[surfaceType].desc}
              </p>
            </div>

            <div>
              <label className="text-xs font-black uppercase text-slate-700 tracking-wider block mb-2">
                3. Número de Manos a Aplicar:
              </label>
              <div className="flex gap-2">
                {[1, 2, 3].map(c => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCoats(c)}
                    className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer ${
                      coats === c 
                        ? 'bg-[#0B1E48] text-white shadow-xs' 
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {c} {c === 1 ? 'Mano' : 'Manos'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 3. Walls list */}
          <div className="pt-2 border-t border-slate-100 space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase text-slate-700 tracking-wider">
                4. Dimensiones de Muros y Descuentos:
              </label>
              <button
                type="button"
                onClick={handleAddWall}
                className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Añadir Muro</span>
              </button>
            </div>

            <div className="space-y-2.5">
              {walls.map((wall, idx) => (
                <div key={wall.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
                  <div className="sm:col-span-3">
                    <input
                      type="text"
                      value={wall.name}
                      onChange={(e) => handleUpdateWall(wall.id, 'name', e.target.value)}
                      className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded-lg px-2.5 py-1.5"
                    />
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold">Ancho:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={wall.width}
                      onChange={(e) => handleUpdateWall(wall.id, 'width', parseFloat(e.target.value) || 0)}
                      className="w-16 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center"
                    />
                    <span className="text-[11px] text-slate-400">m</span>
                  </div>

                  <div className="sm:col-span-3 flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 font-bold">Alto:</span>
                    <input
                      type="number"
                      step="0.1"
                      min="0.5"
                      value={wall.height}
                      onChange={(e) => handleUpdateWall(wall.id, 'height', parseFloat(e.target.value) || 0)}
                      className="w-16 text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded-lg px-2 py-1 text-center"
                    />
                    <span className="text-[11px] text-slate-400">m</span>
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-2 text-xs">
                    <span title="Puertas / Ventanas" className="text-slate-500 text-[11px]">
                      D/V: {wall.doors}p / {wall.windows}v
                    </span>
                  </div>

                  <div className="sm:col-span-1 flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleRemoveWall(wall.id)}
                      disabled={walls.length <= 1}
                      className="text-slate-400 hover:text-red-500 disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Results Summary Box */}
          <div className="p-5 bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-3xl border border-slate-800 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <span className="text-xs text-blue-300 font-bold uppercase tracking-wider block">Área Neta a Pintar:</span>
                <span className="text-3xl font-black text-white">{netArea} m²</span>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  (Bruto: {grossArea.toFixed(1)} m² - Descuentos: {deductionsArea.toFixed(1)} m²)
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs text-emerald-400 font-black uppercase tracking-wider block">Pintura Necesaria:</span>
                <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                  {bucketsCount > 0 ? `${bucketsCount} Cuñete(s) + ` : ''}{remainingGallons > 0 ? `${remainingGallons} Galón(es)` : bucketsCount === 0 ? '1 Galón' : ''}
                </div>
                <span className="text-[11px] text-slate-300">
                  Aprox. {exactGallons.toFixed(1)} galones calculados para {currentProduct.name}
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-xs text-slate-300 font-medium">
                ¿Deseas ver este producto y elegir tu color favorito?
              </span>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSelectProduct) onSelectProduct(currentProduct);
                }}
                className="w-full sm:w-auto py-2.5 px-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Ver {currentProduct.name} en Tienda</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
