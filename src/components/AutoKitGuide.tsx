import React from 'react';
import { Car, Check } from 'lucide-react';
import { StoreProduct } from '../types';
import { formatCOP } from '../data/storeProducts';

/**
 * En automotriz no se calcula por m²: se elige el kit según el tamaño del trabajo.
 * Cada trabajo apunta a una presentación (por capacidad), así funciona aunque cambien los ids.
 */
const TRABAJOS: Array<{ id: string; titulo: string; detalle: string; litrosMin: number; litrosMax: number }> = [
  { id: 'retoque', titulo: 'Retoque o rayón', detalle: 'Rayones, bordes, espejos y piezas pequeñas', litrosMin: 0, litrosMax: 0.45 },
  { id: 'pieza', titulo: 'Una pieza', detalle: 'Puerta, guardafango o bómper', litrosMin: 0.45, litrosMax: 0.8 },
  { id: 'varias', titulo: '2 a 3 piezas', detalle: 'Capó, techo o un costado completo', litrosMin: 0.8, litrosMax: 2 },
  { id: 'completo', titulo: 'Carro completo', detalle: 'Cambio de color o repintado total de un automóvil', litrosMin: 2, litrosMax: 99 }
];

const presentacionPara = (product: StoreProduct, t: typeof TRABAJOS[number]) =>
  product.sizes.find(s => (s.capacityLiters ?? 0) > t.litrosMin && (s.capacityLiters ?? 0) <= t.litrosMax);

interface AutoKitGuideProps {
  product: StoreProduct;
  /** Presentación elegida (para resaltarla) */
  selectedSizeId?: string;
  onPickSize: (sizeId: string) => void;
  variant?: 'light' | 'dark';
}

export const AutoKitGuide: React.FC<AutoKitGuideProps> = ({ product, selectedSizeId, onPickSize, variant = 'light' }) => {
  const opciones = TRABAJOS.map(t => ({ t, size: presentacionPara(product, t) })).filter(o => o.size);
  if (opciones.length === 0) return null;
  const dark = variant === 'dark';

  return (
    <div className={`rounded-2xl border p-4 space-y-3 ${dark ? 'bg-slate-950/50 backdrop-blur-md border-white/20 text-white' : 'bg-slate-50 border-slate-200'}`}>
      <div className="flex items-center gap-2">
        <Car className={`w-5 h-5 ${dark ? 'text-amber-300' : 'text-[#14216B]'}`} />
        <h3 className={`font-black text-sm ${dark ? 'text-white' : 'text-slate-900'}`}>¿Qué kit necesitas?</h3>
      </div>
      <p className={`text-[11px] leading-relaxed ${dark ? 'text-slate-200' : 'text-slate-500'}`}>
        Elige el tamaño del trabajo y te sugerimos la presentación. El código de color de tu carro está en la placa del marco de la puerta.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {opciones.map(({ t, size }) => {
          const activo = size!.id === selectedSizeId;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => onPickSize(size!.id)}
              disabled={!size!.inStock}
              className={`text-left rounded-xl border px-3 py-2.5 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                activo
                  ? 'border-[#F2C417] bg-[#F2C417]/15 ring-1 ring-[#F2C417]'
                  : dark ? 'border-white/15 bg-white/5 hover:bg-white/10' : 'border-slate-200 bg-white hover:border-slate-400'
              }`}
            >
              <span className="flex items-center justify-between gap-2">
                <span className={`text-xs font-black ${dark ? 'text-white' : 'text-slate-900'}`}>{t.titulo}</span>
                {activo && <Check className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
              </span>
              <span className={`block text-[10px] ${dark ? 'text-slate-300' : 'text-slate-500'}`}>{t.detalle}</span>
              <span className={`block mt-1 text-[10px] font-bold ${dark ? 'text-amber-200' : 'text-[#14216B]'}`}>
                {size!.name} · {formatCOP(size!.price)}{!size!.inStock ? ' · Agotado' : ''}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
