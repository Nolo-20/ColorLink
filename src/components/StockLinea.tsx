import React from 'react';
import { stockDe } from '../data/storeProducts';

/** Disponibilidad de una presentación en el carrito (según el inventario de la base de datos). */
export const StockLinea: React.FC<{ productId: string; sizeId: string; quantity: number }> = ({ productId, sizeId, quantity }) => {
  const stock = stockDe(productId, sizeId);
  if (stock <= 0) {
    return <p className="text-[11px] font-bold text-red-600">Agotado: no se incluirá en el pago.</p>;
  }
  if (quantity >= stock) {
    return <p className="text-[11px] font-bold text-amber-700">Llevas todas las unidades disponibles ({stock}).</p>;
  }
  return (
    <p className={`text-[11px] font-semibold ${stock <= 10 ? 'text-amber-700' : 'text-slate-500'}`}>
      {stock <= 10 ? `¡Quedan ${stock} unidades!` : `${stock} disponibles`}
    </p>
  );
};
