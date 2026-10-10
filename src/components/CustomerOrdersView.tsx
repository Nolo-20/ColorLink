import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProductThumb } from './ProductThumb';
import {
  Package,
  Search,
  CheckCircle2,
  Clock,
  Truck,
  RotateCcw,
  AlertCircle,
  X,
  FileText,
  QrCode,
  Store,
  Star,
  MessageSquareText,
  MapPin
} from 'lucide-react';
import { CustomerOrder } from '../types';
import { STORE_PRODUCTS } from '../data/storeProducts';
import { PickupReceiptModal } from './PickupReceiptModal';
import { ProductReviewModal, PickItemModal, SellerRatingModal, Stars, ItemParaOpinar } from './Reviews';

type OrderItem = CustomerOrder['items'][0];

interface CustomerOrdersViewProps {
  orders: CustomerOrder[];
  /** Cancela el pedido en el servidor. Si devuelve { error }, se muestra al cliente. */
  onCancelOrder: (orderId: string) => void | Promise<unknown>;
  onBuyAgain: (item: OrderItem) => void;
  onNavigateToStore: () => void;
  onOpenSupport?: (orderNumber: string) => void;
  /** Recarga los pedidos (p. ej. después de dejar una opinión) */
  onOrdersChanged?: () => void;
  /** Abre la ficha del producto en la tienda */
  onViewProduct?: (productId: string, productName: string) => void;
  /** true mientras se cargan los pedidos del servidor */
  loading?: boolean;
}

type TimeFilter = 'todos' | 'ultimos_30_dias' | 'ultimos_3_meses' | 'ultimos_6_meses' | `ano_${number}`;

const MAX_BUSQUEDA = 80;

/** Fecha real del pedido: createdAt si viene, o la fecha d/m/aaaa con la que App la formatea. */
const fechaDelPedido = (order: CustomerOrder): Date | null => {
  const raw = (order as CustomerOrder & { createdAt?: string }).createdAt;
  if (raw) {
    const d = new Date(raw);
    if (!isNaN(d.getTime())) return d;
  }
  const m = /^(\d{1,2})\/(\d{1,2})\/(\d{4})/.exec(String(order.date || '').trim());
  if (m) {
    const d = new Date(Number(m[3]), Number(m[2]) - 1, Number(m[1]));
    if (!isNaN(d.getTime())) return d;
  }
  const d = new Date(order.date);
  return isNaN(d.getTime()) ? null : d;
};

const fechaLarga = (d: Date | null, fallback?: string) =>
  d ? d.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }) : (fallback || '—');

const fechaSegura = (raw?: string) => {
  if (!raw) return null;
  const d = new Date(raw);
  return isNaN(d.getTime()) ? null : d;
};

const cop = (n: unknown) => `$${Math.round(Number(n) || 0).toLocaleString('es-CO')}`;

const esRetiro = (o: CustomerOrder) => o.deliveryMethod === 'sucursal' || !!o.pickupStore || !!o.pickupCode;
const lugarRetiro = (o: CustomerOrder) => o.pickupStore || o.branchName || o.shippingAddress || 'Sucursal por confirmar';

const productoEnCatalogo = (productId?: string) => !!productId && STORE_PRODUCTS.some(p => p.id === productId);

/** El servidor deja cancelar mientras el pedido no haya salido de bodega; aquí se permite solo en "comprado" (confirmado). */
const sePuedeCancelar = (o: CustomerOrder) => o.status === 'comprado';

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({
  orders,
  onCancelOrder,
  onBuyAgain,
  onNavigateToStore,
  onOpenSupport,
  onOrdersChanged,
  onViewProduct,
  loading
}) => {
  // Opiniones y evaluaciones guardadas en esta sesión (se ven al instante, sin esperar la recarga)
  const [reviewsLocal, setReviewsLocal] = useState<Record<string, ItemParaOpinar['review']>>({});
  const [sellerLocal, setSellerLocal] = useState<Record<string, { calificacion: number; comentario?: string | null }>>({});
  const [reviewTarget, setReviewTarget] = useState<{ orderId: string; item: ItemParaOpinar } | null>(null);
  const [pickTarget, setPickTarget] = useState<{ orderId: string; items: ItemParaOpinar[] } | null>(null);
  const [sellerTargetId, setSellerTargetId] = useState<string | null>(null);
  const [aviso, setAviso] = useState('');
  const avisoTimer = useRef<number | undefined>(undefined);

  const [activeTab, setActiveTab] = useState<'pedidos' | 'comprar_de_nuevo' | 'pendientes'>('pedidos');
  const [searchDraft, setSearchDraft] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('todos');

  // Se guarda solo el id: así los modales siempre muestran la versión más reciente del pedido
  const [trackingId, setTrackingId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [receiptId, setReceiptId] = useState<string | null>(null);
  const [cancelando, setCancelando] = useState(false);
  const [cancelError, setCancelError] = useState('');

  const trackingOrder = orders.find(o => o.id === trackingId) || null;
  const cancelOrder = orders.find(o => o.id === cancelId) || null;
  const receiptOrder = orders.find(o => o.id === receiptId) || null;
  const sellerTarget = orders.find(o => o.id === sellerTargetId) || null;

  useEffect(() => () => window.clearTimeout(avisoTimer.current), []);

  const mostrarAviso = (t: string) => {
    setAviso(t);
    window.clearTimeout(avisoTimer.current);
    avisoTimer.current = window.setTimeout(() => setAviso(''), 4000);
  };

  const conOpinion = (it: OrderItem): ItemParaOpinar => ({ ...it, review: reviewsLocal[it.id] !== undefined ? reviewsLocal[it.id] : it.review });
  const abrirOpinion = (order: CustomerOrder) => {
    const items = order.items.map(conOpinion);
    if (items.length === 1) setReviewTarget({ orderId: order.id, item: items[0] });
    else if (items.length > 1) setPickTarget({ orderId: order.id, items });
  };

  // Años con pedidos, para el filtro de periodo
  const anios = useMemo(() => {
    const set = new Set<number>();
    orders.forEach(o => { const d = fechaDelPedido(o); if (d) set.add(d.getFullYear()); });
    return Array.from(set).sort((a, b) => b - a);
  }, [orders]);

  const enPeriodo = (order: CustomerOrder) => {
    if (timeFilter === 'todos') return true;
    const d = fechaDelPedido(order);
    if (!d) return false;
    if (timeFilter.startsWith('ano_')) return d.getFullYear() === Number(timeFilter.slice(4));
    const desde = new Date();
    desde.setHours(0, 0, 0, 0);
    if (timeFilter === 'ultimos_30_dias') desde.setDate(desde.getDate() - 30);
    if (timeFilter === 'ultimos_3_meses') desde.setMonth(desde.getMonth() - 3);
    if (timeFilter === 'ultimos_6_meses') desde.setMonth(desde.getMonth() - 6);
    return d.getTime() >= desde.getTime();
  };

  const q = searchQuery.trim().toLowerCase();
  const coincide = (order: CustomerOrder) =>
    !q ||
    order.orderNumber.toLowerCase().includes(q) ||
    order.items.some(it => [it.name, it.colorName, it.sizeName].some(v => String(v || '').toLowerCase().includes(q)));

  const filteredOrders = orders.filter(order => {
    if (!coincide(order) || !enPeriodo(order)) return false;
    if (activeTab === 'pendientes') return order.status === 'comprado' || order.status === 'despacho' || order.status === 'enviado';
    return true;
  });

  // "Comprar de nuevo": productos distintos de los pedidos (el más reciente primero)
  const productosComprados = useMemo(() => {
    const vistos = new Map<string, { item: OrderItem; fecha: Date | null; veces: number }>();
    orders.forEach(o => {
      const fecha = fechaDelPedido(o);
      o.items.forEach(it => {
        const key = `${it.productId || it.name}|${it.sizeName || ''}|${it.colorName || ''}`;
        const prev = vistos.get(key);
        if (!prev) vistos.set(key, { item: it, fecha, veces: 1 });
        else {
          prev.veces += 1;
          if (fecha && (!prev.fecha || fecha > prev.fecha)) { prev.fecha = fecha; prev.item = it; }
        }
      });
    });
    return Array.from(vistos.values()).sort((a, b) => (b.fecha?.getTime() || 0) - (a.fecha?.getTime() || 0));
  }, [orders]);

  const productosFiltrados = productosComprados.filter(({ item }) =>
    !q || [item.name, item.colorName, item.sizeName].some(v => String(v || '').toLowerCase().includes(q))
  );

  const handleConfirmCancel = async () => {
    if (!cancelOrder || cancelando) return;
    if (!sePuedeCancelar(cancelOrder)) {
      setCancelError('Este pedido ya salió de bodega y no se puede cancelar.');
      return;
    }
    setCancelando(true);
    setCancelError('');
    try {
      const r: any = await onCancelOrder(cancelOrder.id);
      if (r && typeof r === 'object' && r.error) {
        setCancelError(String(r.error));
        return;
      }
      setCancelId(null);
      mostrarAviso(`Pedido ${cancelOrder.orderNumber} cancelado.`);
    } catch {
      setCancelError('No se pudo cancelar el pedido. Intenta de nuevo.');
    } finally {
      setCancelando(false);
    }
  };

  // Escape cierra el modal que esté encima
  useEffect(() => {
    if (!trackingId && !cancelId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (cancelId) { if (!cancelando) { setCancelId(null); setCancelError(''); } }
      else setTrackingId(null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [trackingId, cancelId, cancelando]);

  const nombreProducto = (item: OrderItem, className = '') => {
    const enlazable = !!onViewProduct && productoEnCatalogo(item.productId);
    return enlazable ? (
      <button
        type="button"
        onClick={() => onViewProduct!(item.productId, item.name)}
        className={`text-left text-xs font-bold text-blue-700 hover:underline focus-visible:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 rounded cursor-pointer line-clamp-2 ${className}`}
        title="Ver producto en la tienda"
      >
        {item.name || 'Producto'}
      </button>
    ) : (
      <span className={`block text-xs font-bold text-slate-900 line-clamp-2 ${className}`}>{item.name || 'Producto'}</span>
    );
  };

  const miniatura = (item: OrderItem) => {
    const enlazable = !!onViewProduct && productoEnCatalogo(item.productId);
    const thumb = <ProductThumb productId={item.productId} name={item.name} sizeName={item.sizeName} colorHex={item.colorHex} colorName={item.colorName} />;
    const clase = 'w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1 shadow-xs';
    return enlazable ? (
      <button
        type="button"
        onClick={() => onViewProduct!(item.productId, item.name)}
        aria-label={`Ver ${item.name} en la tienda`}
        className={`${clase} cursor-pointer hover:border-blue-400 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 transition`}
      >
        {thumb}
      </button>
    ) : (
      <div className={clase}>{thumb}</div>
    );
  };

  const botonComprarDeNuevo = (item: OrderItem) =>
    productoEnCatalogo(item.productId) ? (
      <button
        type="button"
        onClick={() => { onBuyAgain(item); mostrarAviso(`Agregamos ${item.name} a tu carrito.`); }}
        className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-400 hover:bg-amber-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 text-slate-950 font-bold text-xs shadow-xs transition-transform active:scale-95 cursor-pointer"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Comprar nuevamente</span>
      </button>
    ) : (
      <span className="mt-2.5 inline-block text-[11px] text-slate-500">Este producto ya no está disponible en la tienda.</span>
    );

  const hayFiltros = !!q || timeFilter !== 'todos';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">

      {/* Migas de pan */}
      <nav className="flex items-center gap-2 text-xs text-slate-500 mb-4" aria-label="Ruta">
        <button type="button" onClick={onNavigateToStore} className="hover:text-slate-900 transition-colors cursor-pointer">
          Tienda ColorLink
        </button>
        <span>›</span>
        <span className="font-bold text-slate-800">Tus pedidos</span>
      </nav>

      {/* Título y buscador */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Tus pedidos</h1>

        <form
          role="search"
          onSubmit={(e) => { e.preventDefault(); setSearchQuery(searchDraft.trim()); }}
          className="flex items-center gap-2 w-full md:w-auto"
        >
          <div className="relative flex-1 md:w-80 min-w-0">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              aria-label="Buscar en tus pedidos"
              placeholder="Buscar por producto o n.º de pedido"
              value={searchDraft}
              maxLength={MAX_BUSQUEDA}
              onChange={(e) => {
                const v = e.target.value.slice(0, MAX_BUSQUEDA);
                setSearchDraft(v);
                if (!v.trim()) setSearchQuery('');
              }}
              className="w-full pl-9 pr-3 py-2 bg-white text-xs text-slate-900 border border-slate-300 rounded-lg focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 shadow-xs"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer shrink-0"
          >
            Buscar
          </button>
        </form>
      </div>

      {/* Pestañas */}
      <div role="tablist" className="flex items-center gap-6 border-b border-slate-200 text-sm font-semibold mb-6 overflow-x-auto">
        {([
          ['pedidos', 'Pedidos'],
          ['comprar_de_nuevo', 'Comprar de nuevo'],
          ['pendientes', 'Pendiente de envío']
        ] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={activeTab === id}
            onClick={() => setActiveTab(id)}
            className={`pb-2.5 transition-all cursor-pointer relative whitespace-nowrap ${activeTab === id
              ? 'text-slate-950 font-black border-b-2 border-amber-500'
              : 'text-slate-600 hover:text-slate-900'
              }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Filtro de periodo */}
      {activeTab !== 'comprar_de_nuevo' && (
        <div className="flex flex-wrap items-center gap-2 mb-6 text-xs text-slate-600">
          <span className="font-bold text-slate-800">
            {filteredOrders.length} {filteredOrders.length === 1 ? 'pedido' : 'pedidos'}
          </span>
          <label htmlFor="filtro-periodo" className="ml-1">Periodo:</label>
          <select
            id="filtro-periodo"
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-lg text-xs font-bold text-slate-800 focus:outline-none focus:border-amber-500 cursor-pointer shadow-xs"
          >
            <option value="todos">Todos los pedidos</option>
            <option value="ultimos_30_dias">Últimos 30 días</option>
            <option value="ultimos_3_meses">Últimos 3 meses</option>
            <option value="ultimos_6_meses">Últimos 6 meses</option>
            {anios.map(a => <option key={a} value={`ano_${a}`}>Año {a}</option>)}
          </select>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => { setSearchDraft(''); setSearchQuery(''); setTimeFilter('todos'); }}
              className="text-blue-700 hover:underline font-semibold cursor-pointer"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      )}

      {loading && orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-sm text-slate-400 shadow-sm">
          Cargando tus pedidos…
        </div>
      ) : activeTab === 'comprar_de_nuevo' ? (
        /* ============================ COMPRAR DE NUEVO ============================ */
        productosFiltrados.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
              <RotateCcw className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-slate-900">
              {q ? 'Ningún producto coincide con tu búsqueda' : 'Aún no has comprado productos'}
            </h3>
            <button
              type="button"
              onClick={onNavigateToStore}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 font-black text-xs text-slate-950 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Explorar Tienda ColorLink
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {productosFiltrados.map(({ item, fecha, veces }) => (
              <div key={`${item.productId}-${item.sizeName}-${item.colorName}-${item.id}`} className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm flex gap-3 items-start">
                {miniatura(item)}
                <div className="flex-1 min-w-0">
                  {nombreProducto(item)}
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {[item.sizeName, item.colorName].filter(Boolean).join(' · ') || 'Presentación estándar'}
                  </p>
                  <p className="text-xs font-black text-slate-900 mt-1">{cop(item.price)} COP</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Última compra: {fechaLarga(fecha)}{veces > 1 ? ` · ${veces} veces` : ''}
                  </p>
                  {botonComprarDeNuevo(item)}
                </div>
              </div>
            ))}
          </div>
        )
      ) : filteredOrders.length === 0 ? (
        /* ============================ SIN RESULTADOS ============================ */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 mx-auto flex items-center justify-center text-slate-400">
            <Package className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-black text-slate-900">
            {orders.length === 0 ? 'Aún no tienes pedidos' : 'No se encontraron pedidos'}
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto break-words">
            {orders.length === 0
              ? 'Cuando compres en la tienda, tus pedidos aparecerán aquí.'
              : q
                ? `No hay pedidos que coincidan con "${searchQuery}" en el periodo elegido.`
                : activeTab === 'pendientes'
                  ? 'No tienes pedidos pendientes de envío en este periodo.'
                  : 'No hay pedidos en el periodo elegido.'}
          </p>
          {orders.length > 0 && hayFiltros ? (
            <button
              type="button"
              onClick={() => { setSearchDraft(''); setSearchQuery(''); setTimeFilter('todos'); }}
              className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 font-black text-xs text-white rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Ver todos los pedidos
            </button>
          ) : (
            <button
              type="button"
              onClick={onNavigateToStore}
              className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 font-black text-xs text-slate-950 rounded-xl transition-all shadow-xs cursor-pointer"
            >
              Explorar Tienda ColorLink
            </button>
          )}
        </div>
      ) : (
        /* ============================ LISTA DE PEDIDOS ============================ */
        <div className="space-y-6">
          {filteredOrders.map(order => {
            const isDelivered = order.status === 'entregado';
            const isCancelled = order.status === 'cancelado';
            const isShipped = order.status === 'enviado';
            const isPurchased = order.status === 'comprado';
            const isDispatched = order.status === 'despacho';
            const retiro = esRetiro(order);
            const entregadoEl = fechaSegura(order.deliveredAt);

            return (
              <div key={order.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all hover:shadow-md">
                {/* Encabezado */}
                <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-5 py-3 text-xs text-slate-600 flex flex-wrap items-start sm:items-center justify-between gap-x-6 gap-y-3">
                  <div className="flex flex-wrap items-start gap-x-8 gap-y-2 min-w-0">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">Pedido realizado</span>
                      <span className="font-bold text-slate-900">{fechaLarga(fechaDelPedido(order), order.date)}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">Total</span>
                      <span className="font-black text-slate-900">{cop(order.total)} COP</span>
                    </div>
                    <div className="min-w-0 max-w-[16rem]">
                      <span className="block text-[10px] uppercase font-bold text-slate-500">{retiro ? 'Retira' : 'Enviar a'}</span>
                      <span className="font-bold text-slate-900 block truncate">{order.recipientName || '—'}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-semibold">
                    <div>
                      <span className="block text-[10px] uppercase font-bold text-slate-500">Pedido N.º</span>
                      <span className="font-mono text-slate-900 font-bold">{order.orderNumber}</span>
                    </div>
                    <button type="button" onClick={() => setTrackingId(order.id)} className="text-blue-700 hover:underline cursor-pointer">
                      Ver detalles
                    </button>
                    <button type="button" onClick={() => setReceiptId(order.id)} className="text-blue-700 hover:underline cursor-pointer">
                      Ver recibo
                    </button>
                  </div>
                </div>

                {/* Cuerpo */}
                <div className="p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  <div className="lg:col-span-8 space-y-4 min-w-0">

                    {/* Estado */}
                    <div className="flex items-center gap-2">
                      {isDelivered && (
                        <div className="flex items-center gap-1.5 text-green-700 font-black text-base sm:text-lg">
                          <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0" />
                          <span>
                            {entregadoEl
                              ? `${retiro ? 'Retirado' : 'Entregado'} el ${fechaLarga(entregadoEl)}`
                              : retiro ? 'Retirado en tienda' : 'Entregado'}
                          </span>
                        </div>
                      )}
                      {isShipped && (
                        <div className="flex items-center gap-1.5 text-blue-700 font-black text-base sm:text-lg">
                          <Truck className="w-5 h-5 text-blue-600 shrink-0" />
                          <span>En camino a tu dirección</span>
                        </div>
                      )}
                      {isDispatched && (
                        <div className="flex items-center gap-1.5 text-amber-700 font-black text-base sm:text-lg">
                          <Package className="w-5 h-5 text-amber-600 shrink-0" />
                          <span>{order.readyForPickup ? 'Listo para retirar en la tienda' : 'En preparación en bodega'}</span>
                        </div>
                      )}
                      {isPurchased && (
                        <div className="flex items-center gap-1.5 text-indigo-700 font-black text-base sm:text-lg">
                          <Clock className="w-5 h-5 text-indigo-600 shrink-0" />
                          <span>Pedido confirmado</span>
                        </div>
                      )}
                      {isCancelled && (
                        <div className="flex items-center gap-1.5 text-rose-700 font-black text-base sm:text-lg">
                          <X className="w-5 h-5 text-rose-600 shrink-0" />
                          <span>Pedido cancelado</span>
                        </div>
                      )}
                    </div>

                    {/* Entrega o retiro */}
                    {retiro ? (
                      <div className="p-3.5 bg-blue-50/80 rounded-2xl border border-blue-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                        <div className="flex items-start gap-3 min-w-0">
                          <div className="w-9 h-9 rounded-xl bg-[#0B1E48] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Store className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <span className="block text-[10px] font-black uppercase text-blue-900 tracking-wider">Retiro en sucursal</span>
                            <span className="text-xs font-black text-slate-900 block mt-0.5 break-words">{lugarRetiro(order)}</span>
                            <span className="text-[11px] text-slate-600 block mt-0.5">
                              Presenta tu documento de identidad y el código de retiro en el mostrador.
                            </span>
                          </div>
                        </div>
                        {order.pickupCode && !isCancelled && (
                          <div className="flex items-center gap-2.5 bg-white px-3 py-2 rounded-xl border border-blue-200 shrink-0 shadow-xs self-start sm:self-auto">
                            <QrCode className="w-6 h-6 text-[#0B1E48]" />
                            <div className="text-left">
                              <span className="block text-[9px] uppercase font-black text-slate-500">Código de retiro</span>
                              <span className="font-mono font-black text-xs sm:text-sm text-[#0B1E48] tracking-wider block">{order.pickupCode}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-500 flex items-start gap-1.5 break-words">
                        <MapPin className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                        <span>
                          Dirección de entrega: <strong className="text-slate-800">{order.shippingAddress || '—'}</strong>
                          {order.trackingNumber && (
                            <> · Guía: <span className="font-mono">{order.trackingNumber}</span>{order.carrier ? ` (${order.carrier})` : ''}</>
                          )}
                        </span>
                      </p>
                    )}

                    {/* Productos */}
                    <div className="space-y-4 pt-2">
                      {order.items.map(item => (
                        <div key={item.id} className="flex gap-3 sm:gap-4 items-start p-3 rounded-xl bg-slate-50/70 border border-slate-100">
                          {miniatura(item)}
                          <div className="flex-1 min-w-0">
                            {nombreProducto(item)}
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {[
                                item.sizeName ? <>Presentación: <strong>{item.sizeName}</strong></> : null,
                                item.colorName ? <>Color: <strong>{item.colorName}</strong></> : null,
                                <>Cant: <strong>{Number(item.quantity) || 0}</strong></>
                              ].filter(Boolean).map((parte, i) => <React.Fragment key={i}>{i > 0 && ' • '}{parte}</React.Fragment>)}
                            </p>
                            <p className="text-xs font-black text-slate-900 mt-1">
                              {cop((Number(item.price) || 0) * (Number(item.quantity) || 0))} COP
                            </p>

                            <div className="flex flex-wrap items-center gap-2">
                              {botonComprarDeNuevo(item)}
                              {isDelivered && (() => {
                                const it = conOpinion(item);
                                return (
                                  <button
                                    type="button"
                                    onClick={() => setReviewTarget({ orderId: order.id, item: it })}
                                    className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs cursor-pointer"
                                    title={it.review ? 'Editar tu opinión' : undefined}
                                  >
                                    {it.review
                                      ? <><Stars value={it.review.calificacion} size="w-3 h-3" /><span>Tu opinión</span></>
                                      : <><Star className="w-3.5 h-3.5 text-amber-500" /><span>Calificar producto</span></>}
                                  </button>
                                );
                              })()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="lg:col-span-4 space-y-2.5 w-full">
                    {retiro && !isDelivered && !isCancelled && (
                      <button
                        type="button"
                        onClick={() => setReceiptId(order.id)}
                        className="w-full py-2.5 px-4 bg-[#0B1E48] hover:bg-blue-950 text-white font-black text-xs rounded-xl shadow-md transition-all text-center cursor-pointer flex items-center justify-center gap-2"
                      >
                        <QrCode className="w-4 h-4 text-amber-400" />
                        <span>Ver código QR de retiro</span>
                      </button>
                    )}

                    {!isCancelled && !isDelivered && (
                      <button
                        type="button"
                        onClick={() => setTrackingId(order.id)}
                        className="w-full py-2.5 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-all text-center cursor-pointer border border-amber-500/50"
                      >
                        {retiro ? 'Ver estado del pedido' : 'Rastrear paquete'}
                      </button>
                    )}

                    {onOpenSupport && (
                      <button
                        type="button"
                        onClick={() => onOpenSupport(order.orderNumber)}
                        className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 shadow-xs transition-all text-center cursor-pointer"
                      >
                        Obtener soporte
                      </button>
                    )}

                    {isDelivered && (
                      <>
                        {(() => {
                          const ev = sellerLocal[order.id] || order.sellerRating;
                          return (
                            <button
                              type="button"
                              onClick={() => setSellerTargetId(order.id)}
                              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-all text-center cursor-pointer inline-flex items-center justify-center gap-2"
                            >
                              {ev ? (<><span>Evaluaste al vendedor</span><Stars value={ev.calificacion} size="w-3 h-3" /></>) : 'Evaluar al vendedor'}
                            </button>
                          );
                        })()}
                        <button
                          type="button"
                          onClick={() => abrirOpinion(order)}
                          className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-xs rounded-xl border border-slate-300 transition-all text-center cursor-pointer"
                        >
                          {order.items.every(it => conOpinion(it).review) ? 'Editar tu opinión' : 'Escribir una opinión'}
                        </button>
                      </>
                    )}

                    {!isCancelled && !isDelivered && (
                      sePuedeCancelar(order) ? (
                        <button
                          type="button"
                          onClick={() => { setCancelError(''); setCancelId(order.id); }}
                          className="w-full py-2 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-all text-center cursor-pointer"
                        >
                          Cancelar pedido
                        </button>
                      ) : (
                        <p className="p-2 rounded-xl bg-slate-100 border border-slate-200 text-center text-[11px] font-semibold text-slate-500 leading-tight">
                          {isShipped
                            ? 'El pedido va en camino: ya no se puede cancelar.'
                            : order.readyForPickup
                              ? 'El pedido ya está listo en la tienda: no se puede cancelar.'
                              : 'El pedido se está preparando en bodega: ya no se puede cancelar.'}
                        </p>
                      )
                    )}

                    <button
                      type="button"
                      onClick={() => setReceiptId(order.id)}
                      className="w-full py-2 px-4 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs rounded-xl border border-slate-200 transition-all text-center cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <FileText className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver comprobante</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* =========================== MODAL DE SEGUIMIENTO =========================== */}
      {trackingOrder && (() => {
        const t = trackingOrder;
        const retiro = esRetiro(t);
        const paso = t.status === 'entregado' ? 4 : t.status === 'enviado' || t.readyForPickup ? 3 : t.status === 'despacho' ? 2 : t.status === 'comprado' ? 1 : 0;
        const pasos = [
          { label: 'Confirmado', sub: 'Pago recibido' },
          { label: 'Preparación', sub: 'En bodega' },
          { label: retiro ? 'Listo en tienda' : 'Enviado', sub: retiro ? 'Para retirar' : 'En camino' },
          { label: retiro ? 'Retirado' : 'Entregado', sub: retiro ? 'En la tienda' : 'En destino' }
        ];
        return (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
            onClick={() => setTrackingId(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={`Seguimiento del pedido ${t.orderNumber}`}
              className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="bg-slate-900 text-white p-5 sm:p-6 flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-1">Seguimiento del pedido</span>
                  <h3 className="text-lg sm:text-xl font-black tracking-tight">Pedido N.º {t.orderNumber}</h3>
                  <p className="text-xs text-slate-400 mt-0.5 break-words">
                    {retiro ? `Retiro en: ${lugarRetiro(t)}` : `Destino: ${t.shippingAddress || '—'}`}
                  </p>
                </div>
                <button type="button" onClick={() => setTrackingId(null)} aria-label="Cerrar" className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {t.status === 'cancelado' ? (
                <div className="p-6 bg-rose-50 border-b border-rose-200 text-sm font-bold text-rose-800 flex items-center gap-2">
                  <X className="w-5 h-5" /> Este pedido fue cancelado.
                </div>
              ) : (
                <div className="p-5 sm:p-6 bg-slate-50 border-b border-slate-200">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-600 mb-6">Progreso</h4>
                  <div className="relative">
                    <div className="absolute top-4 left-[12.5%] right-[12.5%] h-1 bg-slate-200">
                      <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${Math.max(0, paso - 1) / 3 * 100}%` }} />
                    </div>
                    <ol className="relative z-10 grid grid-cols-4 gap-1 sm:gap-2 text-center">
                      {pasos.map((p, i) => {
                        const n = i + 1;
                        const hecho = n < paso || (n === paso && paso === 4);
                        const actual = n === paso && paso !== 4;
                        return (
                          <li key={p.label} className="flex flex-col items-center" aria-current={actual ? 'step' : undefined}>
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${hecho
                              ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                              : actual
                                ? 'bg-amber-400 text-slate-950 ring-4 ring-amber-100'
                                : 'bg-slate-200 text-slate-500'}`}>
                              {hecho ? '✓' : n}
                            </div>
                            <span className="text-[11px] sm:text-xs font-extrabold text-slate-900 mt-2 leading-tight">{p.label}</span>
                            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline">{p.sub}</span>
                          </li>
                        );
                      })}
                    </ol>
                  </div>
                </div>
              )}

              <div className="p-5 sm:p-6 space-y-4 max-h-72 overflow-y-auto">
                <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Historial</h5>
                {t.trackingHistory.length === 0 ? (
                  <p className="text-xs text-slate-500">Aún no hay movimientos registrados.</p>
                ) : (
                  <ul className="space-y-3">
                    {[...t.trackingHistory].reverse().map((step, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-xs">
                        <div className={`w-2.5 h-2.5 rounded-full mt-1 shrink-0 ${step.isCurrent ? 'bg-amber-400' : 'bg-emerald-500'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <strong className="text-slate-900 font-bold">{step.label || '—'}</strong>
                            {step.date && <span className="text-[10px] text-slate-400 font-mono shrink-0">{step.date}</span>}
                          </div>
                          {step.description && <p className="text-slate-600 text-[11px] mt-0.5">{step.description}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div className="p-4 bg-slate-100 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2">
                {sePuedeCancelar(t) ? (
                  <button
                    type="button"
                    onClick={() => { setCancelError(''); setCancelId(t.id); }}
                    className="px-4 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-300 cursor-pointer"
                  >
                    Cancelar este pedido
                  </button>
                ) : <span />}
                <button
                  type="button"
                  onClick={() => setTrackingId(null)}
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================== CONFIRMAR CANCELACIÓN =========================== */}
      {cancelOrder && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xs"
          onClick={() => { if (!cancelando) { setCancelId(null); setCancelError(''); } }}
        >
          <div
            role="alertdialog"
            aria-modal="true"
            aria-label="Confirmar cancelación"
            className="bg-white rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-slate-200 text-slate-900"
            onClick={e => e.stopPropagation()}
          >
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-slate-900">¿Deseas cancelar este pedido?</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El pedido <strong>{cancelOrder.orderNumber}</strong> por <strong>{cop(cancelOrder.total)} COP</strong> quedará cancelado y no se despachará. Esta acción no se puede deshacer.
              </p>
            </div>
            {cancelError && (
              <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{cancelError}</p>
            )}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                disabled={cancelando}
                onClick={() => { setCancelId(null); setCancelError(''); }}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-800 font-bold text-xs rounded-xl cursor-pointer"
              >
                No, mantener
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelando || !sePuedeCancelar(cancelOrder)}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-black text-xs rounded-xl cursor-pointer shadow-md"
              >
                {cancelando ? 'Cancelando…' : 'Sí, cancelar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}

      {receiptOrder && (
        <PickupReceiptModal order={receiptOrder} onClose={() => setReceiptId(null)} />
      )}

      {pickTarget && (
        <PickItemModal
          items={pickTarget.items}
          onClose={() => setPickTarget(null)}
          onPick={(item) => { setReviewTarget({ orderId: pickTarget.orderId, item }); setPickTarget(null); }}
        />
      )}

      {reviewTarget && (
        <ProductReviewModal
          key={`${reviewTarget.orderId}-${reviewTarget.item.id}`}
          orderId={reviewTarget.orderId}
          item={reviewTarget.item}
          onClose={() => setReviewTarget(null)}
          onSaved={(review) => {
            setReviewsLocal(prev => ({ ...prev, [reviewTarget.item.id]: review }));
            setReviewTarget(null);
            mostrarAviso('¡Gracias! Tu opinión ya aparece en la página del producto.');
            onOrdersChanged?.();
          }}
        />
      )}

      {sellerTarget && (
        <SellerRatingModal
          key={sellerTarget.id}
          orderId={sellerTarget.id}
          orderNumber={sellerTarget.orderNumber}
          actual={sellerLocal[sellerTarget.id] || sellerTarget.sellerRating}
          onClose={() => setSellerTargetId(null)}
          onSaved={(ev) => {
            setSellerLocal(prev => ({ ...prev, [sellerTarget.id]: ev }));
            setSellerTargetId(null);
            mostrarAviso('¡Gracias por evaluar nuestro servicio!');
            onOrdersChanged?.();
          }}
        />
      )}

      {aviso && (
        <div role="status" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[80] max-w-[calc(100vw-2rem)] bg-slate-900 text-white text-sm font-semibold px-4 py-3 rounded-xl shadow-xl inline-flex items-center gap-2">
          <MessageSquareText className="w-4 h-4 text-amber-400 shrink-0" /> <span>{aviso}</span>
        </div>
      )}
    </div>
  );
};
