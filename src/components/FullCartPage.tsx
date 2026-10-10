import React, { useEffect, useRef, useState } from 'react';
import { ProductThumb } from './ProductThumb';
import { 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  CheckSquare, 
  Square, 
  Truck, 
  ShieldCheck, 
  Share2, 
  Bookmark, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { CartItem } from '../types';
import { MAX_ITEM_QTY, clampQty, formatCOP } from '../data/storeProducts';

interface FullCartPageProps {
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onToggleSelectItem: (id: string) => void;
  onSelectAllItems: (selected: boolean) => void;
  onNavigateToStore: () => void;
  onProceedToCheckout: () => void;
}

export const FullCartPage: React.FC<FullCartPageProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onToggleSelectItem,
  onSelectAllItems,
  onNavigateToStore,
  onProceedToCheckout
}) => {
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const FREE_SHIPPING_THRESHOLD = 150000;

  // Only calculate subtotal for items marked as `selectedForCheckout`
  const selectedItems = cartItems.filter(item => item.selectedForCheckout);
  const selectedSubtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const selectedCount = selectedItems.reduce((sum, item) => sum + item.quantity, 0);

  const allSelected = cartItems.length > 0 && cartItems.every(i => i.selectedForCheckout);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - selectedSubtotal);
  const progressPct = Math.min(100, Math.round((selectedSubtotal / FREE_SHIPPING_THRESHOLD) * 100));

  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showToast = (msg: string) => {
    setToastMessage(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToastMessage(null), 3000);
  };
  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      
      {/* Toast feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-xl border border-slate-700 flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Back to store navigation */}
      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={onNavigateToStore}
          className="inline-flex items-center gap-2 text-xs font-extrabold text-slate-700 hover:text-emerald-700 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Catálogo de Pinturas & Herramientas</span>
        </button>

        <span className="text-xs text-slate-500 font-medium">
          {cartItems.length} {cartItems.length === 1 ? 'producto en el carrito' : 'productos en el carrito'}
        </span>
      </div>

      {cartItems.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm max-w-xl mx-auto space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
            <ShoppingCart className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">Tu carrito de compras está vacío</h2>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            ¿Buscas pintura vinilo para tu casa, impermeabilizante Koraza para fachadas, o brochas y rodillos profesionales?
          </p>
          <button
            type="button"
            onClick={onNavigateToStore}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-extrabold text-sm rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Explorar Productos ColorLink</span>
          </button>
        </div>
      ) : (
        /* 2-Column Amazon/Pintuco-style Layout (Like Image 3) */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Cart Items List */}
          <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-7 space-y-6">
            
            {/* Header with Title & Deselect All toggle */}
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-slate-200">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Carrito
              </h1>
              
              <button
                type="button"
                onClick={() => onSelectAllItems(!allSelected)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline cursor-pointer text-left"
              >
                {allSelected ? 'Anular la selección de todos los elementos' : 'Seleccionar todos los elementos'}
              </button>
            </div>

            <div className="text-right text-xs font-bold text-slate-400 -mt-2">
              Precio
            </div>

            {/* Items list */}
            <div className="divide-y divide-slate-100 space-y-6">
              {cartItems.map((item) => (
                <div key={item.id} className={`pt-6 first:pt-0 flex flex-col sm:flex-row gap-4 items-start ${item.selectedForCheckout ? '' : 'opacity-70'}`}>
                  
                  {/* Checkbox for selection */}
                  <div className="pt-1 flex items-center">
                    <button
                      type="button"
                      onClick={() => onToggleSelectItem(item.id)}
                      className="text-slate-700 hover:text-emerald-600 transition-colors cursor-pointer"
                      title={item.selectedForCheckout ? 'Desmarcar para compra' : 'Marcar para compra'}
                      aria-pressed={item.selectedForCheckout}
                      aria-label={item.selectedForCheckout ? `Quitar ${item.name} de esta compra` : `Incluir ${item.name} en esta compra`}
                    >
                      {item.selectedForCheckout ? (
                        <CheckSquare className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                      ) : (
                        <Square className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {/* Thumbnail */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl bg-slate-50 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-2 relative">
                    <ProductThumb productId={item.productId} name={item.name} sizeName={item.sizeName} colorHex={item.colorHex} colorName={item.colorName} />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="text-sm sm:text-base font-extrabold text-slate-900 leading-snug">
                          {item.name}
                        </h3>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          Presentación: <strong className="text-slate-800">{item.sizeName}</strong>
                          {item.colorName && (
                            <span> • Color: <strong className="text-slate-800">{item.colorName}{item.colorCode ? ` (${item.colorCode})` : ''}</strong></span>
                          )}
                        </p>
                      </div>

                      {/* Item Price */}
                      <div className="text-right shrink-0">
                        <div className="text-base font-black text-slate-900 whitespace-nowrap">
                          {formatCOP(item.price * item.quantity)} <span className="text-[10px] font-bold text-slate-500">COP</span>
                        </div>
                        {item.quantity > 1 && (
                          <div className="text-[10px] text-slate-400 whitespace-nowrap">{formatCOP(item.price)} c/u</div>
                        )}
                      </div>
                    </div>

                    {!item.selectedForCheckout && (
                      <p className="text-[11px] font-semibold text-amber-700">Guardado para más tarde: no se incluirá en este pago.</p>
                    )}

                    {/* Quantity Selector and Action Links (Like Image 3) */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      
                      {/* Amazon-style Yellow Pill Selector */}
                      <div className="inline-flex items-center bg-amber-400/20 border-2 border-amber-400 rounded-full px-2.5 py-1 shadow-xs">
                        <button
                          type="button"
                          onClick={() => {
                            if (item.quantity <= 1) {
                              onRemoveItem(item.id);
                            } else {
                              onUpdateQuantity(item.id, item.quantity - 1);
                            }
                          }}
                          className="p-1 text-slate-900 hover:text-slate-950 transition-colors cursor-pointer"
                          title={item.quantity <= 1 ? "Eliminar artículo" : "Restar cantidad"}
                          aria-label={item.quantity <= 1 ? 'Eliminar artículo' : 'Restar cantidad'}
                        >
                          {item.quantity <= 1 ? <Trash2 className="w-4 h-4 text-slate-700" /> : <Minus className="w-4 h-4 text-slate-700" />}
                        </button>
                        <span className="w-8 text-center text-xs font-black text-slate-950">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => onUpdateQuantity(item.id, clampQty(item.quantity + 1))}
                          disabled={item.quantity >= MAX_ITEM_QTY}
                          className="p-1 text-slate-900 hover:text-slate-950 transition-colors cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                          title={item.quantity >= MAX_ITEM_QTY ? `Máximo ${MAX_ITEM_QTY} unidades` : 'Aumentar cantidad'}
                          aria-label="Aumentar cantidad"
                        >
                          <Plus className="w-4 h-4 text-slate-700" />
                        </button>
                      </div>

                      {/* Separator */}
                      <div className="hidden sm:block h-4 w-px bg-slate-200" />

                      {/* Action Links */}
                      <button
                        type="button"
                        onClick={() => onRemoveItem(item.id)}
                        className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors cursor-pointer"
                      >
                        Eliminar
                      </button>

                      <span className="text-slate-300">|</span>

                      <button
                        type="button"
                        onClick={() => {
                          onToggleSelectItem(item.id);
                          showToast(item.selectedForCheckout ? 'Guardado para más tarde: no se cobrará en este pago' : 'Producto incluido de nuevo en la compra');
                        }}
                        className="text-xs font-semibold text-slate-500 hover:text-emerald-700 transition-colors cursor-pointer"
                      >
                        {item.selectedForCheckout ? 'Guardar para más tarde' : 'Mover a la compra'}
                      </button>
                    </div>

                  </div>

                </div>
              ))}
            </div>

            {/* Subtotal preview at the bottom of the list */}
            <div className="pt-6 border-t border-slate-200 flex justify-end items-baseline gap-3">
              <span className="text-sm font-semibold text-slate-600">
                Subtotal ({selectedCount} {selectedCount === 1 ? 'producto' : 'productos'} seleccionados):
              </span>
              <span className="text-xl sm:text-2xl font-black text-slate-900">
                {formatCOP(selectedSubtotal)} <span className="text-xs font-bold text-slate-500">COP</span>
              </span>
            </div>

          </div>

          {/* Right: Checkout Summary Card (Sticky) */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 sticky top-24">
            
            {/* Free Shipping Progress Indicator */}
            <div className="space-y-2 pb-4 border-b border-slate-100">
              <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-emerald-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>

              {amountNeededForFreeShipping > 0 ? (
                <p className="text-xs text-slate-600 leading-relaxed">
                  Agrega <strong className="text-rose-600">{formatCOP(amountNeededForFreeShipping)} COP</strong> de productos elegibles para <strong className="text-slate-900">envío gratis</strong> a tu dirección.
                </p>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-emerald-700 font-bold bg-emerald-50 p-2.5 rounded-xl border border-emerald-200">
                  <Truck className="w-4 h-4 shrink-0" />
                  <span>¡Tu pedido califica para ENVÍO GRATIS!</span>
                </div>
              )}
            </div>

            {/* Subtotal Display */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Subtotal ({selectedCount} {selectedCount === 1 ? 'producto' : 'productos'}):
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
                {formatCOP(selectedSubtotal)} <span className="text-xs font-bold text-slate-500">COP</span>
              </div>
              <span className="text-[11px] text-slate-400">IVA incluido. El envío se calcula en el pago.</span>
            </div>

            {/* Yellow Primary Button: Proceder al Pago (Like Image 3) */}
            <button
              type="button"
              onClick={onProceedToCheckout}
              disabled={selectedItems.length === 0}
              className="w-full py-3.5 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-md shadow-amber-400/20 transition-all text-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed uppercase tracking-wide"
            >
              Proceder al Pago ({selectedCount})
            </button>

            {selectedItems.length === 0 && (
              <p className="text-[11px] text-amber-700 font-semibold text-center">
                Selecciona al menos un producto con la casilla de verificación para continuar al pago.
              </p>
            )}

            {/* Guarantees */}
            <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-500">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Puedes pedir factura electrónica con NIT en el siguiente paso</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>Entrega a domicilio en 24–48 h o retiro gratis en tienda</span>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
