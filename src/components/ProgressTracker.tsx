import React from 'react';
import { Check, X } from 'lucide-react';
import type { Progreso } from '../shared/progreso';

interface ProgressTrackerProps {
  progreso: Progreso;
  /** Muestra el título encima ("¡Tu pedido va en camino!") */
  conTitulo?: boolean;
  /** Versión pequeña para tarjetas */
  compacto?: boolean;
  /** Sobre fondo oscuro */
  oscuro?: boolean;
  className?: string;
}

/** Barra de seguimiento: Comprado → En preparación → En camino → Entregado (o las etapas del proyecto). */
export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progreso, conTitulo = true, compacto = false, oscuro = false, className = '' }) => {
  const { pasos, actual, cancelado, titulo } = progreso;

  if (cancelado) {
    return (
      <div className={`flex items-center justify-center gap-2 rounded-2xl border px-4 py-3 text-sm font-bold ${oscuro ? 'border-rose-500/40 bg-rose-950/40 text-rose-300' : 'border-rose-200 bg-rose-50 text-rose-700'} ${className}`}>
        <X className="w-4 h-4" /> {titulo}
      </div>
    );
  }

  const circulo = compacto ? 'w-6 h-6' : 'w-8 h-8';
  const icono = compacto ? 'w-3.5 h-3.5' : 'w-4 h-4';
  const mitad = compacto ? 'top-3' : 'top-4';
  const pendienteLinea = oscuro ? 'bg-slate-700' : 'bg-slate-200';

  return (
    <div className={className}>
      {conTitulo && (
        <p className={`text-center font-black mb-3 ${compacto ? 'text-sm' : 'text-base sm:text-lg'} ${oscuro ? 'text-white' : 'text-[#14216B]'}`}>{titulo}</p>
      )}
      <ol className="grid" style={{ gridTemplateColumns: `repeat(${pasos.length}, minmax(0, 1fr))` }} aria-label={titulo}>
        {pasos.map((paso, i) => {
          const alcanzado = i <= actual;
          const esActual = i === actual;
          return (
            <li key={paso} className="relative flex flex-col items-center text-center" aria-current={esActual ? 'step' : undefined}>
              {/* Líneas hacia el paso anterior y el siguiente */}
              {i > 0 && <span className={`absolute ${mitad} left-0 right-1/2 h-1 -translate-y-1/2 ${i <= actual ? 'bg-[#1D74C0]' : pendienteLinea}`} aria-hidden="true" />}
              {i < pasos.length - 1 && <span className={`absolute ${mitad} left-1/2 right-0 h-1 -translate-y-1/2 ${i < actual ? 'bg-[#1D74C0]' : pendienteLinea}`} aria-hidden="true" />}
              <span
                className={`relative z-10 ${circulo} rounded-full flex items-center justify-center ${
                  alcanzado
                    ? `bg-[#1D74C0] text-white ${esActual && !progreso.completo ? 'ring-4 ' + (oscuro ? 'ring-[#1D74C0]/30' : 'ring-[#1D74C0]/20') : ''}`
                    : `${oscuro ? 'bg-slate-900 border-slate-600' : 'bg-white border-slate-300'} border-[3px]`
                }`}
              >
                {alcanzado && <Check className={icono} strokeWidth={3.5} />}
              </span>
              <span
                className={`mt-1.5 px-0.5 leading-tight ${compacto ? 'text-[10px]' : 'text-[11px] sm:text-xs'} ${
                  esActual ? (oscuro ? 'font-black text-white' : 'font-black text-[#14216B]') : (oscuro ? 'font-semibold text-slate-400' : 'font-semibold text-slate-500')
                }`}
              >
                {paso}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
};
