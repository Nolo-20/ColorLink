import React, { useState } from 'react';
import { ProductThumb } from './ProductThumb';
import {
  CheckCircle2,
  Truck,
  Store,
  CreditCard,
  Building2,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  ArrowLeft,
  Lock,
  Calendar,
  AlertCircle,
  FileText,
  ChevronRight,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { CartItem, UserProfile, StoreBranch } from '../types';
import { STORE_BRANCHES } from '../data/storeProducts';

interface CheckoutPageProps {
  cartItems: CartItem[];
  user: UserProfile;
  onBackToCart: () => void;
  onOrderCompleted: (orderNumber: string, orderDetails?: any) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  user,
  onBackToCart,
  onOrderCompleted
}) => {
  // Delivery mode: 'envio' | 'recogida'
  const [deliveryMode, setDeliveryMode] = useState<'envio' | 'recogida'>('envio');

  // Shipping Form State
  const [shippingData, setShippingData] = useState({
    recipientName: user.name || 'Juan Manuel Olave Ramírez',
    phone: user.phone || '300 456 7890',
    email: user.email || 'juanma.olave40@gmail.com',
    city: user.city || 'Medellín',
    department: 'Antioquia',
    address: user.address || 'Calle 59A Sur # 42-23, Casa 104',
    neighborhood: 'La Florida / Itagüí',
    deliveryNotes: 'Dejar en portería o recepción con conserje'
  });

  // Pickup Branch State
  const [selectedCity, setSelectedCity] = useState<string>('Medellín');
  const [selectedBranchId, setSelectedBranchId] = useState<string>('medellin-guayabal');

  // Payment Method State
  const [paymentMethod, setPaymentMethod] = useState<'pse' | 'card' | 'cash_on_delivery' | 'corporate_credit'>('pse');
  const [pseBank, setPseBank] = useState<string>('Bancolombia');
  const [cardNumber, setCardNumber] = useState<string>('•••• •••• •••• 9469');
  const [cardHolder, setCardHolder] = useState<string>(user.name || 'Juan Manuel Olave');
  const [cardExp, setCardExp] = useState<string>('08/28');
  const [cardCvc, setCardCvc] = useState<string>('•••');

  const [requireNitInvoice, setRequireNitInvoice] = useState<boolean>(true);
  const [nitNumber, setNitNumber] = useState<string>('901.452.880-1');
  const [companyName, setCompanyName] = useState<string>(user.company || 'Constructora Horizonte S.A.S.');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [generatedOrderNumber, setGeneratedOrderNumber] = useState<string>('');

  // Selected items to purchase
  const itemsToBuy = cartItems.filter(item => item.selectedForCheckout);
  const productsSubtotal = itemsToBuy.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  // Shipping calculation: Free if >= 150000 COP or if pickup in branch
  const isFreeShipping = deliveryMode === 'recogida' || productsSubtotal >= 150000;
  const shippingCost = isFreeShipping ? 0 : 15000;

  // IVA 19% included in total (standard Colombian commercial practice)
  const ivaAmount = Math.round(productsSubtotal * 0.19 / 1.19);
  const totalAmountCOP = productsSubtotal + shippingCost;

  // Estimated delivery date (tomorrow)
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const deliveryDateFormatted = tomorrow.toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const availableBranchesForCity = STORE_BRANCHES.filter(b => b.city === selectedCity);
  const selectedBranch = STORE_BRANCHES.find(b => b.id === selectedBranchId) || STORE_BRANCHES[0];

  const [generatedPickupCode, setGeneratedPickupCode] = useState<string>('');
  const [successOrderInfo, setSuccessOrderInfo] = useState<{ orderNum: string; pickupCode?: string } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  const completeAndRedirectToOrders = (orderNum: string, pCode?: string) => {
    onOrderCompleted(orderNum, {
      deliveryMethod: deliveryMode === 'recogida' ? 'sucursal' : 'domicilio',
      pickupStore: deliveryMode === 'recogida' ? `${selectedBranch.name} (${selectedBranch.address})` : undefined,
      branchName: deliveryMode === 'recogida' ? selectedBranch.name : undefined,
      pickupCode: pCode,
      shippingAddress: deliveryMode === 'recogida' ? `${selectedBranch.name}, ${selectedBranch.address}` : `${shippingData.address}, ${shippingData.city}`,
      city: deliveryMode === 'recogida' ? selectedBranch.city : shippingData.city
    });
  };

  const handleConfirmOrder = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      const orderNum = `CL-${Math.floor(100000 + Math.random() * 900000)}`;
      const pickupCode = deliveryMode === 'recogida' ? `PK-${Math.floor(100000 + Math.random() * 900000)}` : undefined;
      setGeneratedOrderNumber(orderNum);
      if (pickupCode) setGeneratedPickupCode(pickupCode);
      setIsSubmitting(false);
      setSuccessOrderInfo({ orderNum, pickupCode });

      let count = 3;
      setRedirectCountdown(count);
      const interval = setInterval(() => {
        count -= 1;
        setRedirectCountdown(count);
        if (count <= 0) {
          clearInterval(interval);
          completeAndRedirectToOrders(orderNum, pickupCode);
        }
      }, 900);
    }, 900);
  };

  if (successOrderInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16 animate-in fade-in zoom-in-95 duration-300">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500 shadow-2xl text-center space-y-6 relative overflow-hidden">

          {/* Top celebratory accent bar */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50 animate-bounce">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-300">
              <CheckCircle2 className="w-3.5 h-3.5" />
              ¡Tu compra fue exitosa!
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Pago Confirmado Correctamente
            </h1>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Tu orden <strong className="text-slate-900 font-mono text-base">{successOrderInfo.orderNum}</strong> ha sido creada y enviada a alistamiento.
            </p>
          </div>

          {/* Quick summary pill */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between items-center text-slate-600">
              <span className="font-semibold">Modalidad de Entrega:</span>
              <span className="font-black text-slate-900">
                {deliveryMode === 'recogida' ? 'Retiro en Sucursal ColorLink' : 'Envío a Domicilio'}
              </span>
            </div>
            {deliveryMode === 'recogida' && successOrderInfo.pickupCode && (
              <div className="flex justify-between items-center text-blue-900 bg-blue-50/80 p-2 rounded-lg border border-blue-200">
                <span className="font-bold">Código de Retiro:</span>
                <span className="font-mono font-black text-sm">{successOrderInfo.pickupCode}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
              <span className="font-semibold">Total Pagado:</span>
              <span className="font-black text-slate-950 text-sm">${totalAmountCOP.toLocaleString('es-CO')} COP</span>
            </div>
          </div>

          {/* Redirection indicator and direct action button */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500">
              <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Redirigiéndote a tus pedidos en {redirectCountdown}s...</span>
            </div>

            <button
              type="button"
              onClick={() => completeAndRedirectToOrders(successOrderInfo.orderNum, successOrderInfo.pickupCode)}
              className="w-full sm:w-auto px-8 py-3 bg-[#0B1E48] hover:bg-blue-950 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-950/20 transition-all cursor-pointer inline-flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Ir a mis pedidos ahora</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Top breadcrumb & security banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={onBackToCart}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al Carrito</span>
        </button>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5" />
          <span>Proceso de pago encriptado de 256 bits</span>
        </div>
      </div>

      {/* Main 2-Column Layout (Matching Image 4 with custom adjustments) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left Column (8 cols): Delivery, Payment, and Items Review */}
        <div className="lg:col-span-8 space-y-6">

          {/* 1. MODALIDAD DE ENTREGA (Envío a Domicilio vs Recogida en Sucursal) */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                  1
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Modalidad de Entrega
                </h2>
              </div>

              {/* Selector Tabs: Envío vs Recogida */}
              <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setDeliveryMode('envio')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${deliveryMode === 'envio'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Envío a Domicilio</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryMode('recogida')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${deliveryMode === 'recogida'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                    }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Recogida en Sucursal</span>
                </button>
              </div>
            </div>

            <div className="p-5 sm:p-6">
              {deliveryMode === 'envio' ? (
                /* Subform: Envío a Domicilio */
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>
                      Fecha estimada de entrega: <strong className="capitalize">{deliveryDateFormatted}</strong> (Despacho desde bodega central)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Nombre Completo de Quien Recibe</label>
                      <input
                        type="text"
                        value={shippingData.recipientName}
                        onChange={(e) => setShippingData({ ...shippingData, recipientName: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Teléfono Móvil (+57)</label>
                      <input
                        type="text"
                        value={shippingData.phone}
                        onChange={(e) => setShippingData({ ...shippingData, phone: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ciudad</label>
                      <select
                        value={shippingData.city}
                        onChange={(e) => setShippingData({ ...shippingData, city: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium cursor-pointer"
                      >
                        <option value="Medellín">Medellín</option>
                        <option value="Envigado">Envigado</option>
                        <option value="Itagüí">Itagüí</option>
                        <option value="Sabaneta">Sabaneta</option>
                        <option value="Bello">Bello</option>
                        <option value="Bogotá">Bogotá D.C.</option>
                        <option value="Cali">Cali</option>
                        <option value="Barranquilla">Barranquilla</option>
                      </select>
                    </div>

                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Barrio / Sector</label>
                      <input
                        type="text"
                        value={shippingData.neighborhood}
                        onChange={(e) => setShippingData({ ...shippingData, neighborhood: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Dirección de Entrega (Calle, Carrera, Número, Apto/Casa)</label>
                      <input
                        type="text"
                        value={shippingData.address}
                        onChange={(e) => setShippingData({ ...shippingData, address: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block font-bold text-slate-700 mb-1">Instrucciones Adicionales para el Transportador</label>
                      <input
                        type="text"
                        value={shippingData.deliveryNotes}
                        onChange={(e) => setShippingData({ ...shippingData, deliveryNotes: e.target.value })}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                        placeholder="Ej. Dejar en portería con guardia o timbre 301"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Subform: Recogida en Sucursal */
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-bold text-slate-700">Selecciona la ciudad donde retirarás tu pedido:</span>
                    <select
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        const firstBranch = STORE_BRANCHES.find(b => b.city === e.target.value);
                        if (firstBranch) setSelectedBranchId(firstBranch.id);
                      }}
                      className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      <option value="Medellín">Medellín</option>
                      <option value="Itagüí">Itagüí</option>
                      <option value="Sabaneta">Sabaneta</option>
                      <option value="Bogotá D.C.">Bogotá D.C.</option>
                      <option value="Cali">Cali</option>
                    </select>
                  </div>

                  <div className="space-y-2.5">
                    {availableBranchesForCity.map((branch) => {
                      const isSelected = selectedBranchId === branch.id;
                      return (
                        <label
                          key={branch.id}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${isSelected
                            ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                        >
                          <input
                            type="radio"
                            name="branch_select"
                            checked={isSelected}
                            onChange={() => setSelectedBranchId(branch.id)}
                            className="mt-1 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1 text-xs">
                            <div className="flex items-center justify-between">
                              <span className="font-extrabold text-slate-900 text-sm">{branch.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Listo en {branch.readyInHours}h (Sin costo)
                              </span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{branch.address}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">{branch.schedule} • Tel: {branch.phone}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. MÉTODO DE PAGO */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                Método de Pago
              </h2>
            </div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { id: 'pse', title: 'PSE / Transferencia', sub: 'Bancolombia, Nequi, Daviplata', icon: '🏛️' },
                  { id: 'card', title: 'Tarjeta Crédito / Débito', sub: 'Visa, Mastercard, AMEX', icon: '💳' },
                  { id: 'cash_on_delivery', title: 'Pago Contra Entrega', sub: 'Efectivo o datáfono al recibir', icon: '💵' },
                  { id: 'corporate_credit', title: 'Crédito ColorLink 30 Días', sub: 'Para constructoras aliadas', icon: '🏢' },
                ].map(method => (
                  <label
                    key={method.id}
                    className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${paymentMethod === method.id
                      ? 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                  >
                    <input
                      type="radio"
                      name="payment_method"
                      checked={paymentMethod === method.id}
                      onChange={() => setPaymentMethod(method.id as any)}
                      className="mt-1 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <div className="flex items-center gap-1.5">
                        <span>{method.icon}</span>
                        <span className="font-extrabold text-slate-900">{method.title}</span>
                      </div>
                      <span className="text-slate-500 text-[11px] block mt-0.5">{method.sub}</span>
                    </div>
                  </label>
                ))}
              </div>

              {/* Sub-inputs according to payment method */}
              {paymentMethod === 'pse' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <label className="block font-bold text-slate-700">Selecciona tu Banco / Billetera Digital:</label>
                  <select
                    value={pseBank}
                    onChange={(e) => setPseBank(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-semibold cursor-pointer"
                  >
                    <option value="Bancolombia">Bancolombia</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Daviplata">Daviplata</option>
                    <option value="Banco de Bogotá">Banco de Bogotá</option>
                    <option value="Davivienda">Davivienda</option>
                    <option value="BBVA Colombia">BBVA Colombia</option>
                  </select>
                  <span className="text-[11px] text-slate-500 block">
                    Al confirmar serás redirigido a la pasarela segura de PSE para autorizar la transacción.
                  </span>
                </div>
              )}

              {paymentMethod === 'card' && (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Número de Tarjeta</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg font-mono font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Vencimiento (MM/AA)</label>
                      <input
                        type="text"
                        value={cardExp}
                        onChange={(e) => setCardExp(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-center font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Código de Seguridad (CVV)</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-center font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === 'corporate_credit' && (
                <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 text-xs space-y-2">
                  <span className="font-extrabold text-amber-900 block">Crédito Comercial ColorLink (30 Días)</span>
                  <p className="text-amber-800 leading-relaxed">
                    Esta orden se cargará al cupo rotativo de la constructora <strong>{companyName}</strong> con facturación electrónica a 30 días.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. REVISIÓN DE PRODUCTOS A COMPRAR */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                  3
                </span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">
                  Revisión de Productos ({itemsToBuy.length})
                </h2>
              </div>
              <span className="text-xs font-bold text-emerald-700">
                {deliveryMode === 'envio' ? `Llega: ${deliveryDateFormatted}` : 'Retiro en 2 horas'}
              </span>
            </div>

            <div className="p-5 sm:p-6 divide-y divide-slate-100 space-y-4">
              {itemsToBuy.map(item => (
                <div key={item.id} className="pt-4 first:pt-0 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1 relative">
                    <ProductThumb productId={item.productId} name={item.name} sizeName={item.sizeName} colorHex={item.colorHex} colorName={item.colorName} />
                  </div>

                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-extrabold text-slate-900">{item.name}</h4>
                    <p className="text-slate-500 font-medium">
                      {item.sizeName} {item.colorName && `• ${item.colorName}`}
                    </p>
                    <span className="text-slate-600 font-bold">Cant: {item.quantity}</span>
                  </div>

                  <div className="text-right text-xs">
                    <span className="font-black text-slate-900 text-sm block">
                      ${(item.price * item.quantity).toLocaleString('es-CO')}
                    </span>
                    <span className="text-[10px] text-slate-400">COP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Sticky Order Summary (No Amazon Prime, No Currency Converter) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5 sticky top-24">

          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">
            Resumen del Pedido
          </h3>

          {/* Breakdown in native COP */}
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Productos ({itemsToBuy.reduce((s, i) => s + i.quantity, 0)} items):</span>
              <span className="font-bold text-slate-900">
                COP ${productsSubtotal.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Envío y manejo:</span>
              <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                {shippingCost === 0 ? '¡GRATIS!' : `COP $${shippingCost.toLocaleString('es-CO')}`}
              </span>
            </div>

            <div className="flex justify-between">
              <span>IVA (19% incluido):</span>
              <span className="font-medium text-slate-500">
                COP ${ivaAmount.toLocaleString('es-CO')}
              </span>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-sm font-black text-slate-900">Total del Pedido:</span>
              <span className="text-2xl font-black text-slate-950">
                COP ${totalAmountCOP.toLocaleString('es-CO')}
              </span>
            </div>
          </div>

          {/* Factura con NIT toggle */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={requireNitInvoice}
                onChange={(e) => setRequireNitInvoice(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600"
              />
              <span>Factura Electrónica con NIT (DIAN)</span>
            </label>

            {requireNitInvoice && (
              <div className="space-y-1.5 pt-1 text-xs">
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Razón Social Constructora / Empresa"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-[11px]"
                />
                <input
                  type="text"
                  value={nitNumber}
                  onChange={(e) => setNitNumber(e.target.value)}
                  placeholder="NIT ej. 901.452.880-1"
                  className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded font-semibold text-[11px]"
                />
              </div>
            )}
          </div>

          {/* Prominent Yellow Button: Pagar en COP (Like Image 4) */}
          <button
            type="button"
            onClick={handleConfirmOrder}
            disabled={isSubmitting || itemsToBuy.length === 0}
            className="w-full py-4 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-md shadow-amber-400/20 transition-all text-center cursor-pointer disabled:opacity-50 uppercase tracking-wide flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <span>Procesando Pago Seguro...</span>
            ) : (
              <span>Pagar en COP (${totalAmountCOP.toLocaleString('es-CO')})</span>
            )}
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Al realizar el pedido aceptas los términos y condiciones comerciales de ColorLink Recubrimientos. Despacho garantizado desde bodegas oficiales.
          </p>

        </div>

      </div>

    </div>
  );
};
