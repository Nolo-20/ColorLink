import React, { useState } from 'react';
import { ProductThumb } from './ProductThumb';
import { 
  Package, 
  Search, 
  CheckCircle2, 
  Clock, 
  Truck, 
  RotateCcw, 
  HelpCircle, 
  ExternalLink, 
  AlertCircle, 
  X, 
  ChevronRight, 
  ArrowLeft,
  FileText,
  MapPin,
  Building2,
  Calendar,
  QrCode,
  Store
} from 'lucide-react';
import { CustomerOrder, OrderStatus, CartItem, StoreProduct, StoreProductSize, StoreProductColor } from '../types';
import { PickupReceiptModal } from './PickupReceiptModal';

interface CustomerOrdersViewProps {
  orders: CustomerOrder[];
  onCancelOrder: (orderId: string) => void;
  onBuyAgain: (item: CustomerOrder['items'][0]) => void;
  onNavigateToStore: () => void;
  onOpenSupport?: (orderNumber: string) => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  orders,
  onCancelOrder,
  onBuyAgain,
  onNavigateToStore,
  onOpenSupport
}) => {
  const [activeTab, setActiveTab] = useState<'pedidos' | 'comprar_de_nuevo' | 'pendientes'>('pedidos');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState('ultimos_3_meses');
  const [trackingOrder, setTrackingOrder] = useState<CustomerOrder | null>(null);
  const [cancelModalOrder, setCancelModalOrder] = useState<CustomerOrder | null>(null);
  const [receiptModalOrder, setReceiptModalOrder] = useState<CustomerOrder | null>(null);

  // Filter orders by search and tab
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchQuery.trim() === '' ||
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.items.some(it => it.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (activeTab === 'pendientes') {
      return order.status === 'comprado' || order.status === 'despacho' || order.status === 'enviado';
    }
    return true;
  });

  const handleConfirmCancel = () => {
    if (cancelModalOrder) {
      onCancelOrder(cancelModalOrder.id);
      setCancelModalOrder(null);
      if (trackingOrder?.id === cancelModalOrder.id) {
        setTrackingOrder(null);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      
      {/* Breadcrumb navigation */}
      <div className="flex items-center gap-2 text-xs text-slate-500 mb-4">
        <button 
          onClick={onNavigateToStore} 
          className="hover:text-slate-900 transition-colors cursor-pointer"
        >
          Tienda ColorLink
        </button>
        <span>›</span>
        <span className="text-slate-400">Tu cuenta</span>
        <span>›</span>
        <span className="font-bold text-slate-800">Tus pedidos</span>
      </div>

      {/* Main Title & Search Bar (Amazon style - Image 1) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Tus pedidos
        </h1>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar todos los pedidos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>
          <button
            type="button"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Buscar pedidos
          </button>
        </div>
      </div>

      {/* Sub-tabs: Pedidos / Comprar de nuevo / Pendiente de envío */}
      <div className="flex items-center gap-6 border-b border-slate-200 text-sm font-semibold mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('pedidos')}
          className={`pb-2.5 transition-all cursor-pointer relative whitespace-nowrap ${
            activeTab === 'pedidos' 
              ? 'text-slate-950 font-black border-b-2 border-amber-500' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pedidos
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('comprar_de_nuevo')}
          className={`pb-2.5 transition-all cursor-pointer relative whitespace-nowrap ${
            activeTab === 'comprar_de_nuevo' 
              ? 'text-slate-950 font-black border-b-2 border-amber-500' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Comprar de nuevo
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pendientes')}
          className={`pb-2.5 transition-all cursor-pointer relative whitespace-nowrap ${
            activeTab === 'pendientes' 
              ? 'text-slate-950 font-black border-b-2 border-amber-500' 
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Pendiente de envío
        </button>
      </div>

      {/* Period Filter dropdown */}
      <div className="flex items-center gap-2 mb-6 text-xs text-slate-600">
        <span className="font-bold text-slate-800">{filteredOrders.length} pedido(s)</span>
        <span>realizado en</span>
        <select
          value={timeFilter}
          onChange={(e) => setTimeFilter(e.target.value)}
          className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
        >
          <option value="ultimos_3_meses">Últimos 3 meses</option>
          <option value="ano_2026">Año 2026</option>
          <option value="ano_2025">Año 2025</option>
          <option value="todos">Todos los pedidos</option>
        </select>
      </div>

      {/* Orders List matching Image 1 */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">No se encontraron pedidos</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            {searchQuery 
              ? `No hay pedidos que coincidan con "${searchQuery}". Revisa la ortografía o limpia el filtro.` 
              : 'Aún no tienes pedidos registrados con esta cuenta. Visita nuestra tienda para agregar pinturas o herramientas.'}
          </p>
          <button
            type="button"
            onClick={onNavigateToStore}
            className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 font-black text-xs text-slate-950 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            Explorar Tienda ColorLink
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const isDelivered = order.status === 'entregado';
            const isCancelled = order.status === 'cancelado';
            const isShipped = order.status === 'enviado';
            const isPurchased = order.status === 'comprado';
            const isDispatched = order.status === 'despacho';

            // User Rule: "cancelar pero solo se puede cancelar cuando esta en el estado de comprado, ya cuando este enviado no se puede hacer nada"
            const canCancelThisOrder = order.status === 'comprado';

            return (
              <div 
                key={order.id} 
                className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                {/* 1. Header Bar: PEDIDO REALIZADO | TOTAL | ENVIAR A | PEDIDO N.º */}
                <div className="bg-slate-100/90 border-b border-slate-200 px-5 py-3 text-xs text-slate-600 flex flex-wrap items-center justify-between gap-y-2">
                  <div className="flex flex-wrap items-center gap-6 sm:gap-10">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">PEDIDO REALIZADO</span>
                      <span className="font-bold text-slate-900">{order.date}</span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">TOTAL</span>
                      <span className="font-black text-slate-900">
                        COP ${order.total.toLocaleString('es-CO')}
                      </span>
                    </div>

                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">ENVIAR A</span>
                      <span className="font-bold text-slate-900 inline-flex items-center gap-1">
                        {order.recipientName} ▾
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs font-semibold">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500 text-right">PEDIDO N.º</span>
                      <span className="font-mono text-slate-900 font-bold">{order.orderNumber}</span>
                    </div>
                    <div className="h-6 w-px bg-slate-300" />
                    <button
                      type="button"
                      onClick={() => setTrackingOrder(order)}
                      className="text-blue-700 hover:underline cursor-pointer"
                    >
                      Ver detalles
                    </button>
                    <button
                      type="button"
                      onClick={() => setReceiptModalOrder(order)}
                      className="text-blue-700 hover:underline cursor-pointer"
                    >
                      Ver recibo
                    </button>
                  </div>
                </div>

                {/* 2. Order Body (Items & Actions matching Image 1) */}
                <div className="p-5 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Left Column: Status header + Products List */}
                  <div className="lg:col-span-8 space-y-4">
                    
                    {/* Status announcement */}
                    <div className="flex items-center gap-2">
                      {isDelivered && (
                        <div className="flex items-center gap-1.5 text-emerald-700 font-black text-base sm:text-lg">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span>Entregado el {order.estimatedDelivery || 'recientemente'}</span>
                        </div>
                      )}
                      {isShipped && (
                        <div className="flex items-center gap-1.5 text-blue-700 font-black text-base sm:text-lg">
                          <Truck className="w-5 h-5 text-blue-600 animate-pulse" />
                          <span>Enviado — En camino hacia dirección de entrega</span>
                        </div>
                      )}
                      {isDispatched && (
                        <div className="flex items-center gap-1.5 text-amber-700 font-black text-base sm:text-lg">
                          <Package className="w-5 h-5 text-amber-600" />
                          <span>{order.readyForPickup ? 'Listo para retiro — Te esperamos en la tienda' : 'En preparación — Estamos alistando tu pedido'}</span>
                        </div>
                      )}
                      {isPurchased && (
                        <div className="flex items-center gap-1.5 text-indigo-700 font-black text-base sm:text-lg">
                          <Clock className="w-5 h-5 text-indigo-600" />
                          <span>Comprado — Pedido confirmado y recibido</span>
                        </div>
                      )}
                      {isCancelled && (
                        <div className="flex items-center gap-1.5 text-rose-700 font-black text-base sm:text-lg">
                          <X className="w-5 h-5 text-rose-600" />
                          <span>Pedido Cancelado por el cliente</span>
                        </div>
                      )}
                    </div>

                    {/* Delivery or Pickup Mode Information */}
                    {(order.deliveryMethod === 'sucursal' || !!order.pickupStore || !!order.pickupCode) ? (
                      <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[#0B1E48] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Store className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-[10px] font-black uppercase text-blue-900 tracking-wider">
                              Modalidad: Retiro en Sucursal Asignada
                            </span>
                            <span className="text-xs font-black text-slate-900 block mt-0.5">
                              {order.pickupStore || order.branchName || 'Tienda ColorLink Guayabal - Cra. 52 # 14-80, Medellín'}
                            </span>
                            <span className="text-[11px] text-slate-600 block mt-0.5">
                              Presenta tu documento de identidad y código de retiro en el mostrador.
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-xl border border-blue-200 shrink-0 shadow-xs">
                          <QrCode className="w-6 h-6 text-[#0B1E48]" />
                          <div className="text-left">
                            <span className="block text-[9px] uppercase font-black text-slate-500">CÓDIGO DE RETIRO</span>
                            <span className="font-mono font-black text-xs sm:text-sm text-[#0B1E48] tracking-wider block">
                              {order.pickupCode || order.orderNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Transportadora: <strong className="text-slate-800">{order.carrier || 'Flota ColorLink'}</strong> • Guía: <span className="font-mono">{order.trackingNumber || 'N/A'}</span>
                      </p>
                    )}

                    {/* Products list with horizontal thumbnails */}
                    <div className="space-y-4 pt-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex gap-4 items-start p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                          
                          {/* Thumbnail / Swatch */}
                          <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1 relative shadow-xs">
                            <ProductThumb productId={item.productId} name={item.name} sizeName={item.sizeName} colorHex={item.colorHex} colorName={item.colorName} />
                          </div>

                          {/* Info */}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-blue-700 hover:underline cursor-pointer line-clamp-2">
                              {item.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Presentación: <strong>{item.sizeName}</strong> {item.colorName && `• Color: ${item.colorName}`} • Cant: <strong>{item.quantity}</strong>
                            </p>
                            <p className="text-xs font-black text-slate-900 mt-1">
                              ${(item.price * item.quantity).toLocaleString('es-CO')} COP
                            </p>

                            {/* Buy Again Button (Amazon style) */}
                            <button
                              type="button"
                              onClick={() => onBuyAgain(item)}
                              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Comprar nuevamente</span>
                            </button>
                          </div>

                        </div>
                      ))}
                    </div>

                  </div>

                  {/* Right Column: Actions matching Image 1 */}
                  <div className="lg:col-span-4 space-y-2.5 w-full">
                    
                    {/* Primary Pickup Voucher Button if pickup */}
                    {(order.deliveryMethod === 'sucursal' || !!order.pickupStore || !!order.pickupCode) && (
                      <button
                        type="button"
                        onClick={() => setReceiptModalOrder(order)}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-[#0B1E48] via-blue-900 to-[#0B1E48] hover:from-blue-900 hover:to-blue-950 text-white font-black text-xs rounded-xl shadow-md transition-all text-center cursor-pointer flex items-center justify-center gap-2 border border-blue-800 active:scale-98"
                      >
                        <QrCode className="w-4 h-4 text-amber-400" />
                        <span>Ver Código QR de Retiro</span>
                      </button>
                    )}

                    {/* Primary Tracking Button */}
                    <button
                      type="button"
                      onClick={() => setTrackingOrder(order)}
                      className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all text-center cursor-pointer border border-amber-500/50"
                    >
                      Rastrear paquete
                    </button>

                    {/* Support Button */}
                    <button
                      type="button"
                      onClick={() => onOpenSupport ? onOpenSupport(order.orderNumber) : window.open(`https://wa.me/573147892045?text=Hola,%20necesito%20soporte%20sobre%20mi%20pedido%20${order.orderNumber}`, '_blank')}
                      className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 shadow-xs transition-all text-center cursor-pointer"
                    >
                      Obtener soporte
                    </button>

                    {/* Cancel Button with User Rule:
                        "cancelar pero solo se puede cancelar cuando esta en el estado de comprado, ya cuando este enviado no se puede hacer nada" */}
                    {!isCancelled && (
                      <div>
                        {canCancelThisOrder ? (
                          <button
                            type="button"
                            onClick={() => setCancelModalOrder(order)}
                            className="w-full py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all text-center cursor-pointer"
                          >
                            Cancelar pedido
                          </button>
                        ) : (
                          <div className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-center">
                            <span className="text-[11px] font-semibold text-slate-500 block leading-tight">
                              {order.status === 'enviado' 
                                ? '⚠️ En transporte: ya no se puede cancelar este pedido.' 
                                : order.status === 'despacho'
                                ? '📦 En despacho de bodega: no se puede cancelar.'
                                : '✅ Pedido completado y entregado.'}
                            </span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Download Invoice / Receipt */}
                    <button
                      type="button"
                      onClick={() => setReceiptModalOrder(order)}
                      className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Descargar comprobante</span>
                    </button>

                  </div>

                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* =================================================================== */}
      {/* 3. TRACKING MODAL (Comprado -> Despacho -> Enviado -> Entregado)   */}
      {/* =================================================================== */}
      {trackingOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in zoom-in-95 duration-200">
            
            {/* Header */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">
                  Rastreo en Línea de Pedido
                </span>
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  Pedido N.º {trackingOrder.orderNumber}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Destino: {trackingOrder.shippingAddress}, {trackingOrder.city}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Progress Bar: Comprado -> Despacho -> Enviado -> Entregado */}
            <div className="p-6 bg-slate-50 border-b border-slate-200">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-6">
                Progreso del Envío:
              </h4>

              <div className="relative">
                {/* Horizontal Progress Line */}
                <div className="absolute top-4 left-6 right-6 h-1 bg-slate-200 -z-0">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: trackingOrder.status === 'comprado' ? '15%'
                        : trackingOrder.status === 'despacho' ? '45%'
                        : trackingOrder.status === 'enviado' ? '75%'
                        : trackingOrder.status === 'entregado' ? '100%' : '0%'
                    }}
                  />
                </div>

                {/* 4 Steps */}
                <div className="relative z-10 grid grid-cols-4 gap-2 text-center">
                  
                  {/* Step 1: Comprado */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      ['comprado', 'despacho', 'enviado', 'entregado'].includes(trackingOrder.status)
                        ? 'bg-emerald-500 text-white shadow-md ring-4 ring-emerald-100'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      ✓
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 mt-2">Comprado</span>
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">Confirmado</span>
                  </div>

                  {/* Step 2: Despacho (en bodega: se está alistando) */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      (['enviado', 'entregado'].includes(trackingOrder.status) || !!trackingOrder.readyForPickup)
                        ? 'bg-emerald-500 text-white shadow-md ring-4 ring-emerald-100'
                        : trackingOrder.status === 'despacho'
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-100 animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {(['enviado', 'entregado'].includes(trackingOrder.status) || !!trackingOrder.readyForPickup) ? '✓' : '2'}
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 mt-2">Despacho</span>
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">En bodega</span>
                  </div>

                  {/* Step 3: Enviado (o listo para retiro en tienda) */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      ['enviado', 'entregado'].includes(trackingOrder.status)
                        ? 'bg-emerald-500 text-white shadow-md ring-4 ring-emerald-100'
                        : trackingOrder.readyForPickup
                        ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-100 animate-pulse'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {['enviado', 'entregado'].includes(trackingOrder.status) ? '✓' : '3'}
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 mt-2">{trackingOrder.deliveryMethod === 'sucursal' ? 'Listo en tienda' : 'Enviado'}</span>
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">{trackingOrder.deliveryMethod === 'sucursal' ? 'Para retirar' : 'En transporte'}</span>
                  </div>

                  {/* Step 4: Entregado */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                      trackingOrder.status === 'entregado'
                        ? 'bg-emerald-500 text-white shadow-md ring-4 ring-emerald-100'
                        : 'bg-slate-200 text-slate-500'
                    }`}>
                      {trackingOrder.status === 'entregado' ? '✓' : '4'}
                    </div>
                    <span className="text-xs font-extrabold text-slate-900 mt-2">Entregado</span>
                    <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">En destino</span>
                  </div>

                </div>
              </div>
            </div>

            {/* Tracking History Timeline */}
            <div className="p-6 space-y-4 max-h-72 overflow-y-auto">
              <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Historial de eventos:</h5>
              <div className="space-y-3">
                {trackingOrder.trackingHistory.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-xs">
                    <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${
                      step.isCompleted ? 'bg-emerald-500' : 'bg-slate-300'
                    }`} />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">{step.label}</strong>
                        <span className="text-[10px] text-slate-400 font-mono">{step.date}</span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-100 border-t border-slate-200 flex items-center justify-between">
              {trackingOrder.status === 'comprado' ? (
                <button
                  type="button"
                  onClick={() => {
                    setCancelModalOrder(trackingOrder);
                  }}
                  className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-300 cursor-pointer"
                >
                  Cancelar este pedido
                </button>
              ) : (
                <span className="text-xs text-slate-500">
                  {trackingOrder.status === 'enviado' ? '⚠️ Pedido en camino: cancelación no disponible.' : 'Guía de transporte activa.'}
                </span>
              )}

              <button
                type="button"
                onClick={() => setTrackingOrder(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
              >
                Cerrar
              </button>
            </div>

          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 4. CONFIRM CANCEL MODAL                                             */}
      {/* =================================================================== */}
      {cancelModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">¿Deseas cancelar este pedido?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El pedido <strong>{cancelModalOrder.orderNumber}</strong> aún está en estado <strong>comprado</strong>, por lo que el reintegro de tus fondos se tramitará automáticamente por el canal de pago original.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCancelModalOrder(null)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                No, mantener pedido
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl cursor-pointer shadow-md"
              >
                Sí, cancelar pedido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* 5. RECEIPT / INVOICE & PICKUP VOUCHER VIEW MODAL (Email Style)      */}
      {/* =================================================================== */}
      {receiptModalOrder && (
        <PickupReceiptModal
          order={receiptModalOrder}
          onClose={() => setReceiptModalOrder(null)}
        />
      )}

    </div>
  );
};
