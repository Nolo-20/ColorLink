import React from 'react';
import { 
  X, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../types';

interface MiniCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onUpdateQuantity: (id: string, newQty: number) => void;
  onRemoveItem: (id: string) => void;
  onNavigateToCart: () => void;
  onNavigateToCheckout: () => void;
}

export const MiniCartDrawer: React.FC<MiniCartDrawerProps> = ({
  isOpen,
  onClose,
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onNavigateToCart,
  onNavigateToCheckout
}) => {
  // Umbral de envío gratis (COP $150.000)
  const FREE_SHIPPING_THRESHOLD = 150000;
  
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItemsCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const amountNeededForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);
  const progressPct = Math.min(100, Math.round((totalAmount / FREE_SHIPPING_THRESHOLD) * 100));

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-slate-950/60 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="w-screen max-w-md bg-white text-slate-900 shadow-2xl flex flex-col"
            >
              
              {/* Top Bar with Cart Count & Close */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <div className="flex items-center gap-2.5">
                  <div className="relative">
                    <ShoppingCart className="w-5 h-5 text-emerald-400" />
                    {totalItemsCount > 0 && (
                      <motion.span 
                        key={totalItemsCount}
                        initial={{ scale: 0.6 }}
                        animate={{ scale: 1 }}
                        className="absolute -top-1.5 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs"
                      >
                        {totalItemsCount}
                      </motion.span>
                    )}
                  </div>
                  <h2 className="font-extrabold text-base tracking-tight">Tu Carrito</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                  aria-label="Cerrar carrito"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Subtotal & Free Delivery Progress Bar (Like Image 2) */}
              <div className="p-4 bg-slate-50 border-b border-slate-200">
                <div className="flex items-baseline justify-between mb-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Subtotal:</span>
                  <span className="text-xl font-black text-rose-600">
                    ${totalAmount.toLocaleString('es-CO')} <span className="text-xs font-bold text-slate-600">COP</span>
                  </span>
                </div>

                {/* Shipping Progress */}
                <div className="space-y-1.5">
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <motion.div 
                      className="bg-emerald-600 h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPct}%` }}
                      transition={{ duration: 0.4, ease: 'easeOut' }}
                    />
                  </div>

                  {amountNeededForFreeShipping > 0 ? (
                    <p className="text-[11px] text-slate-600 leading-tight">
                      Agrega <strong className="text-rose-600">${amountNeededForFreeShipping.toLocaleString('es-CO')} COP</strong> productos a tu pedido para <strong className="text-slate-900">envío gratis</strong> a Medellín y Área Metropolitana.
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5" />
                      <span>¡Calificas para ENVÍO GRATIS a domicilio!</span>
                    </p>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToCart();
                      onClose();
                    }}
                    className="w-full py-2.5 px-3 bg-white hover:bg-slate-100 active:scale-98 text-slate-800 font-bold text-xs rounded-xl border border-slate-300 shadow-xs transition-all text-center cursor-pointer hover:border-slate-400"
                  >
                    Ir al Carrito
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      onNavigateToCheckout();
                      onClose();
                    }}
                    disabled={cartItems.length === 0}
                    className="w-full py-2.5 px-3 bg-amber-400 hover:bg-amber-300 active:scale-98 active:bg-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-xs transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Proceder al Pago
                  </button>
                </div>
              </div>

              {/* Cart Items List with Animated Removal */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-slate-100">
                {cartItems.length === 0 ? (
                  <div className="text-center py-16 text-slate-400 space-y-3">
                    <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                      <ShoppingCart className="w-7 h-7" />
                    </div>
                    <p className="text-sm font-bold text-slate-600">Tu carrito está vacío</p>
                    <p className="text-xs text-slate-400 max-w-xs mx-auto">
                      Explora nuestras pinturas vinilo, impermeabilizantes koraza, epóxicos y herramientas profesionales.
                    </p>
                  </div>
                ) : (
                  <AnimatePresence initial={false}>
                    {cartItems.map(item => (
                      <motion.div 
                        key={item.id} 
                        layout
                        initial={{ opacity: 0, height: 0, scale: 0.95 }}
                        animate={{ opacity: 1, height: 'auto', scale: 1 }}
                        exit={{ opacity: 0, height: 0, scale: 0.9, transition: { duration: 0.2 } }}
                        className="pt-3 first:pt-0 flex gap-3 items-start overflow-hidden"
                      >
                        
                        {/* Thumbnail */}
                        <div className="w-16 h-16 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center p-1">
                          {item.colorHex ? (
                            <div className="w-full h-full rounded-lg flex flex-col items-center justify-center text-white relative shadow-inner" style={{ backgroundColor: item.colorHex }}>
                              <span className="text-[9px] font-black px-1 py-0.5 rounded bg-black/40 backdrop-blur-xs">
                                {item.colorCode}
                              </span>
                            </div>
                          ) : (
                            <img 
                              src={item.image} 
                              alt={item.name} 
                              className="w-full h-full object-cover rounded-lg"
                              referrerPolicy="no-referrer"
                            />
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0 space-y-1">
                          <span className="inline-block px-1.5 py-0.2 rounded text-[9px] font-extrabold uppercase bg-rose-100 text-rose-700">
                            Oferta ColorLink
                          </span>
                          <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-2">
                            {item.name}
                          </h4>
                          <p className="text-[11px] text-slate-500 font-medium">
                            {item.sizeName} {item.colorName && `• ${item.colorName}`}
                          </p>
                          <div className="text-sm font-black text-slate-900">
                            ${(item.price * item.quantity).toLocaleString('es-CO')} <span className="text-[10px] text-slate-500">COP</span>
                          </div>

                          {/* Quantity Selector (Like Image 2 & 3: yellow rounded box with trash / - / +) */}
                          <div className="flex items-center gap-2 pt-1">
                            <div className="inline-flex items-center bg-amber-400/20 border-2 border-amber-400 rounded-full px-2 py-0.5 shadow-xs">
                              <button
                                type="button"
                                onClick={() => {
                                  if (item.quantity <= 1) {
                                    onRemoveItem(item.id);
                                  } else {
                                    onUpdateQuantity(item.id, item.quantity - 1);
                                  }
                                }}
                                className="p-1 text-slate-800 hover:text-slate-950 transition-transform active:scale-80 cursor-pointer"
                                title={item.quantity <= 1 ? "Eliminar" : "Restar"}
                              >
                                {item.quantity <= 1 ? <Trash2 className="w-3.5 h-3.5" /> : <Minus className="w-3.5 h-3.5" />}
                              </button>
                              <span className="w-6 text-center text-xs font-black text-slate-900">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                                className="p-1 text-slate-800 hover:text-slate-950 transition-transform active:scale-80 cursor-pointer"
                                title="Aumentar"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.id)}
                              className="text-[11px] text-slate-400 hover:text-red-500 transition-colors cursor-pointer font-medium ml-auto"
                            >
                              Eliminar
                            </button>
                          </div>
                        </div>

                      </motion.div>
                    ))}
                  </AnimatePresence>
                )}
              </div>

              {/* Footer Note */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex items-center justify-between">
                <span className="flex items-center gap-1 text-[11px]">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Garantía de fábrica ColorLink</span>
                </span>
                <button
                  onClick={onClose}
                  className="text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Seguir Comprando
                </button>
              </div>

            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};
