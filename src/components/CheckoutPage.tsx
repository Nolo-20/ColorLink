import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ProductThumb } from './ProductThumb';
import {
  CheckCircle2,
  Truck,
  Store,
  ArrowLeft,
  Calendar,
  AlertCircle,
  ArrowRight,
  Banknote,
  ShoppingCart
} from 'lucide-react';
import { CartItem, UserProfile } from '../types';
import { STORE_BRANCHES, formatCOP } from '../data/storeProducts';

interface CheckoutPageProps {
  cartItems: CartItem[];
  user: UserProfile;
  onBackToCart: () => void;
  onOrderCompleted: (orderNumber: string, orderDetails?: any) => Promise<{ orderNum?: string; pickupCode?: string; error?: string }>;
  onGoToOrders: () => void;
}

// ---------------------------------------------------------------------------
// Reglas del pedido y validación
// ---------------------------------------------------------------------------
const FREE_SHIPPING_THRESHOLD = 150000;
const SHIPPING_COST = 15000;

const DELIVERY_CITIES = [
  'Medellín', 'Envigado', 'Itagüí', 'Sabaneta', 'Bello', 'Copacabana', 'La Estrella',
  'Bogotá D.C.', 'Cali', 'Yumbo', 'Barranquilla', 'Bucaramanga', 'Manizales', 'Coveñas'
];

const NAME_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const ADDRESS_RE = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9#°º.,\-/ ]+$/;
const FREE_TEXT_RE = /[<>{}]/g;

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z]/g, '');

/** "+57 (314) 789-2045" -> "3147892045" */
const cleanPhone = (v: string) => {
  let d = String(v || '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('57')) d = d.slice(2);
  return d.slice(0, 10);
};
const cleanNit = (v: string) => v.replace(/[.\s]/g, '');
const collapse = (v: string) => v.replace(/\s+/g, ' ').trim();

interface FormState {
  recipientName: string;
  phone: string;
  email: string;
  city: string;
  neighborhood: string;
  address: string;
  deliveryNotes: string;
  requireInvoice: boolean;
  companyName: string;
  nit: string;
}

type FieldKey = keyof FormState;

const FIELD_LABELS: Partial<Record<FieldKey, string>> = {
  recipientName: 'nombre',
  phone: 'celular',
  email: 'correo',
  city: 'ciudad',
  address: 'dirección',
  neighborhood: 'barrio',
  deliveryNotes: 'instrucciones',
  companyName: 'razón social',
  nit: 'NIT'
};

const validate = (f: FormState, mode: 'envio' | 'recogida'): Partial<Record<FieldKey, string>> => {
  const e: Partial<Record<FieldKey, string>> = {};
  const name = collapse(f.recipientName);
  if (!name) e.recipientName = 'Escribe el nombre de quien recibe.';
  else if (name.length < 2 || name.length > 60) e.recipientName = 'Entre 2 y 60 caracteres.';
  else if (!NAME_RE.test(name) || !/[A-Za-zÁÉÍÓÚÑáéíóúñ]{2}/.test(name)) e.recipientName = 'Solo letras y espacios.';

  const phone = cleanPhone(f.phone);
  if (!phone) e.phone = 'Escribe un número de celular.';
  else if (!/^3\d{9}$/.test(phone)) e.phone = 'Celular colombiano de 10 dígitos que empiece por 3.';

  const email = f.email.trim();
  if (!email) e.email = 'Escribe tu correo.';
  else if (email.length > 120 || !EMAIL_RE.test(email)) e.email = 'Correo no válido (ej. nombre@correo.com).';

  if (mode === 'envio') {
    if (!f.city) e.city = 'Selecciona la ciudad de entrega.';
    const addr = collapse(f.address);
    if (!addr) e.address = 'Escribe la dirección de entrega.';
    else if (addr.length < 5 || addr.length > 120) e.address = 'Entre 5 y 120 caracteres.';
    else if (!ADDRESS_RE.test(addr)) e.address = 'Usa solo letras, números y # - . , /';
    else if (!/\d/.test(addr)) e.address = 'Incluye el número de la dirección (ej. Calle 10 # 36-24).';
    if (collapse(f.neighborhood).length > 60) e.neighborhood = 'Máximo 60 caracteres.';
    if (f.deliveryNotes.trim().length > 200) e.deliveryNotes = 'Máximo 200 caracteres.';
  }

  if (f.requireInvoice) {
    const company = collapse(f.companyName);
    if (company.length < 2 || company.length > 100) e.companyName = 'Razón social entre 2 y 100 caracteres.';
    const nit = cleanNit(f.nit);
    if (!nit) e.nit = 'Escribe el NIT.';
    else if (!/^\d{6,10}(-\d)?$/.test(nit)) e.nit = 'NIT no válido (ej. 901452880-1).';
  }
  return e;
};

// ---------------------------------------------------------------------------

export const CheckoutPage: React.FC<CheckoutPageProps> = ({
  cartItems,
  user,
  onBackToCart,
  onOrderCompleted,
  onGoToOrders
}) => {
  const [deliveryMode, setDeliveryMode] = useState<'envio' | 'recogida'>('envio');

  // Datos del cliente: solo lo que viene de su perfil real (nunca datos de ejemplo)
  const initialCity = DELIVERY_CITIES.find(c => user.city && normalize(c).startsWith(normalize(user.city).slice(0, 5))) || '';
  const [form, setForm] = useState<FormState>(() => ({
    recipientName: collapse(user.name || '').slice(0, 60),
    phone: cleanPhone(user.phone || ''),
    email: (user.email || '').slice(0, 120),
    city: initialCity,
    neighborhood: '',
    address: (user.address || '').slice(0, 120),
    deliveryNotes: '',
    requireInvoice: false,
    companyName: (user.companyName || user.company || '').slice(0, 100),
    nit: user.nit || ''
  }));
  const [touched, setTouched] = useState<Partial<Record<FieldKey, boolean>>>({});
  const [submitAttempted, setSubmitAttempted] = useState(false);

  // Sucursal de retiro
  const pickupCities = useMemo(() => Array.from(new Set(STORE_BRANCHES.map(b => b.city))).sort((a, b) => a.localeCompare(b, 'es')), []);
  const defaultPickupBranch = STORE_BRANCHES.find(b => user.city && normalize(b.city).includes(normalize(user.city).slice(0, 5)))
    || STORE_BRANCHES.find(b => b.id === 'medellin-guayabal')
    || STORE_BRANCHES[0];
  const [selectedCity, setSelectedCity] = useState<string>(defaultPickupBranch.city);
  const [selectedBranchId, setSelectedBranchId] = useState<string>(defaultPickupBranch.id);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const submittingRef = useRef(false);
  const [orderError, setOrderError] = useState('');
  const [successOrderInfo, setSuccessOrderInfo] = useState<{ orderNum: string; pickupCode?: string; total: number; mode: 'envio' | 'recogida'; branchName?: string } | null>(null);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(4);

  const itemsToBuy = cartItems.filter(item => item.selectedForCheckout);
  const productsSubtotal = itemsToBuy.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const unitsCount = itemsToBuy.reduce((s, i) => s + i.quantity, 0);
  const isFreeShipping = deliveryMode === 'recogida' || productsSubtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = isFreeShipping ? 0 : SHIPPING_COST;
  const ivaAmount = Math.round(productsSubtotal * 0.19 / 1.19); // IVA incluido en los precios
  const totalAmountCOP = productsSubtotal + shippingCost;

  const availableBranchesForCity = STORE_BRANCHES.filter(b => b.city === selectedCity);
  const selectedBranch = STORE_BRANCHES.find(b => b.id === selectedBranchId) || availableBranchesForCity[0] || STORE_BRANCHES[0];

  const errors = validate(form, deliveryMode);
  const isValid = Object.keys(errors).length === 0;
  const showError = (k: FieldKey) => (touched[k] || submitAttempted) ? errors[k] : undefined;

  const setField = <K extends FieldKey>(key: K, value: FormState[K]) => setForm(prev => ({ ...prev, [key]: value }));
  const blur = (key: FieldKey) => setTouched(prev => ({ ...prev, [key]: true }));

  // Redirección automática a "Mis pedidos" (con limpieza si el usuario sale antes)
  useEffect(() => {
    if (!successOrderInfo || successOrderInfo.pickupCode) return;
    if (redirectCountdown <= 0) { onGoToOrders(); return; }
    const t = setTimeout(() => setRedirectCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [successOrderInfo, redirectCountdown, onGoToOrders]);

  const buildOrderDetails = () => {
    const name = collapse(form.recipientName);
    const phone = cleanPhone(form.phone);
    const contact = `Recibe: ${name} · Cel: ${phone}`;
    const invoice = form.requireInvoice ? ` · Factura: ${collapse(form.companyName)} NIT ${cleanNit(form.nit)}` : '';
    const notes = collapse(form.deliveryNotes.replace(FREE_TEXT_RE, ''));
    const shippingAddress = deliveryMode === 'recogida'
      ? `${selectedBranch.name}, ${selectedBranch.address} · Retira: ${name} · Cel: ${phone}${invoice}`
      : `${collapse(form.address)}${form.neighborhood.trim() ? `, ${collapse(form.neighborhood)}` : ''}, ${form.city} · ${contact}${notes ? ` · Nota: ${notes}` : ''}${invoice}`;
    return {
      deliveryMethod: deliveryMode === 'recogida' ? 'sucursal' : 'domicilio',
      pickupStore: deliveryMode === 'recogida' ? `${selectedBranch.name} (${selectedBranch.address})` : undefined,
      branchName: deliveryMode === 'recogida' ? selectedBranch.name : undefined,
      shippingAddress: shippingAddress.slice(0, 400),
      city: deliveryMode === 'recogida' ? selectedBranch.city : form.city,
      recipientName: name,
      recipientPhone: phone,
      recipientEmail: form.email.trim(),
      deliveryNotes: notes || undefined,
      paymentMethod: deliveryMode === 'recogida' ? 'pago_en_tienda' : 'contra_entrega',
      shippingCost,
      invoice: form.requireInvoice ? { companyName: collapse(form.companyName), nit: cleanNit(form.nit) } : undefined
    };
  };

  // El número de pedido y el código de retiro los genera el servidor
  const handleConfirmOrder = async () => {
    setSubmitAttempted(true);
    if (submittingRef.current || !isValid || itemsToBuy.length === 0) return;
    submittingRef.current = true;
    setIsSubmitting(true);
    setOrderError('');
    const totalSnapshot = totalAmountCOP;
    const modeSnapshot = deliveryMode;
    const branchSnapshot = selectedBranch.name;
    try {
      const result = await onOrderCompleted('', buildOrderDetails());
      if (!result || result.error || !result.orderNum) {
        setOrderError(result?.error || 'No se pudo registrar el pedido. Intenta de nuevo.');
        return;
      }
      setRedirectCountdown(4);
      setSuccessOrderInfo({ orderNum: result.orderNum, pickupCode: result.pickupCode, total: totalSnapshot, mode: modeSnapshot, branchName: branchSnapshot });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      setOrderError('No se pudo conectar con el servidor. Intenta de nuevo.');
    } finally {
      submittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  // ------------------------------------------------------------------ Pedido creado
  if (successOrderInfo) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 sm:py-16">
        <div className="bg-white rounded-3xl p-6 sm:p-10 border-2 border-emerald-500 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />
          <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">¡Pedido confirmado!</h1>
            <p className="text-slate-600 text-sm max-w-md mx-auto">
              Tu pedido <strong className="text-slate-900 font-mono text-base">{successOrderInfo.orderNum}</strong> fue registrado y pasa a alistamiento. Te enviamos la confirmación a tu correo.
            </p>
          </div>

          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left text-xs space-y-2 max-w-md mx-auto">
            <div className="flex justify-between items-center gap-3 text-slate-600">
              <span className="font-semibold">Entrega:</span>
              <span className="font-black text-slate-900 text-right">
                {successOrderInfo.mode === 'recogida' ? `Retiro en ${successOrderInfo.branchName}` : 'Envío a domicilio'}
              </span>
            </div>
            {successOrderInfo.pickupCode && (
              <div className="flex justify-between items-center text-blue-900 bg-blue-50/80 p-2 rounded-lg border border-blue-200">
                <span className="font-bold">Código de retiro:</span>
                <span className="font-mono font-black text-sm">{successOrderInfo.pickupCode}</span>
              </div>
            )}
            <div className="flex justify-between items-center text-slate-600 pt-1 border-t border-slate-200">
              <span className="font-semibold">{successOrderInfo.mode === 'recogida' ? 'Total a pagar en tienda:' : 'Total a pagar al recibir:'}</span>
              <span className="font-black text-slate-950 text-sm">{formatCOP(successOrderInfo.total)} COP</span>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            {successOrderInfo.pickupCode ? (
              <p className="text-xs font-semibold text-slate-500">
                Guarda este código: lo presentas en la tienda para retirar tu pedido.
              </p>
            ) : (
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-slate-500" aria-live="polite">
                <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                <span>Te llevamos a tus pedidos en {Math.max(0, redirectCountdown)} s…</span>
              </div>
            )}
            <button
              type="button"
              onClick={onGoToOrders}
              className="w-full sm:w-auto px-8 py-3 bg-[#0B1E48] hover:bg-blue-950 active:scale-95 text-white font-black text-xs rounded-xl shadow-lg transition-all cursor-pointer inline-flex items-center justify-center gap-2 uppercase tracking-wider"
            >
              <span>Ir a mis pedidos</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ------------------------------------------------------------------ Sin productos seleccionados
  if (itemsToBuy.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl p-10 text-center border border-slate-200 shadow-sm space-y-4">
          <ShoppingCart className="w-10 h-10 text-slate-400 mx-auto" />
          <h1 className="text-xl font-black text-slate-900">No hay productos para pagar</h1>
          <p className="text-sm text-slate-500">Agrega productos o márcalos en el carrito para continuar.</p>
          <button
            type="button"
            onClick={onBackToCart}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm rounded-xl cursor-pointer"
          >
            Volver al carrito
          </button>
        </div>
      </div>
    );
  }

  const inputCls = (k: FieldKey) =>
    `w-full px-3 py-2.5 bg-white border rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-sm ${showError(k) ? 'border-red-400' : 'border-slate-300'}`;
  const ErrorText: React.FC<{ k: FieldKey }> = ({ k }) => showError(k) ? (
    <p id={`err-${k}`} className="text-[11px] font-semibold text-red-600 mt-1">{showError(k)}</p>
  ) : null;
  const a11y = (k: FieldKey) => ({
    'aria-invalid': Boolean(showError(k)),
    'aria-describedby': showError(k) ? `err-${k}` : undefined,
    onBlur: () => blur(k)
  });

  const FIELD_IDS: Partial<Record<FieldKey, string>> = {
    recipientName: 'co-name', phone: 'co-phone', email: 'co-email', city: 'co-city', neighborhood: 'co-hood',
    address: 'co-address', deliveryNotes: 'co-notes', companyName: 'co-company', nit: 'co-nit'
  };
  const missing = (Object.keys(errors) as FieldKey[]).filter(k => FIELD_LABELS[k]);
  const goToField = (k: FieldKey) => {
    setTouched(prev => ({ ...prev, [k]: true }));
    const el = FIELD_IDS[k] ? document.getElementById(FIELD_IDS[k]!) : null;
    if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); (el as HTMLElement).focus({ preventScroll: true }); }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-200">
        <button
          type="button"
          onClick={onBackToCart}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al carrito</span>
        </button>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900">Finalizar compra</h1>
      </div>

      <form
        noValidate
        onSubmit={(e) => { e.preventDefault(); handleConfirmOrder(); }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
      >
        <div className="lg:col-span-8 space-y-6 min-w-0">

          {/* 1. ENTREGA */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">1</span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Entrega</h2>
              </div>
              <div className="flex bg-slate-200/80 p-1 rounded-xl text-xs font-bold" role="group" aria-label="Modalidad de entrega">
                {([['envio', 'Envío a domicilio', Truck], ['recogida', 'Retiro en tienda', Store]] as const).map(([mode, label, Icon]) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setDeliveryMode(mode)}
                    aria-pressed={deliveryMode === mode}
                    className={`flex-1 sm:flex-none px-3 py-1.5 rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer ${deliveryMode === mode ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 sm:p-6 space-y-4">
              {/* Datos de contacto (para ambos modos) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label htmlFor="co-name" className="block font-bold text-slate-700 mb-1">
                    {deliveryMode === 'envio' ? 'Nombre de quien recibe' : 'Nombre de quien retira'} *
                  </label>
                  <input
                    id="co-name"
                    type="text"
                    autoComplete="name"
                    maxLength={60}
                    value={form.recipientName}
                    onChange={(e) => setField('recipientName', e.target.value.replace(/[^A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]/g, '').slice(0, 60))}
                    className={inputCls('recipientName')}
                    {...a11y('recipientName')}
                  />
                  <ErrorText k="recipientName" />
                </div>
                <div>
                  <label htmlFor="co-phone" className="block font-bold text-slate-700 mb-1">Celular *</label>
                  <div className="flex">
                    <span className="px-2.5 inline-flex items-center rounded-l-lg border border-r-0 border-slate-300 bg-slate-50 text-slate-500 font-bold">+57</span>
                    <input
                      id="co-phone"
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      placeholder="3001234567"
                      value={form.phone}
                      onChange={(e) => setField('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                      className={`${inputCls('phone')} rounded-l-none`}
                      {...a11y('phone')}
                    />
                  </div>
                  <ErrorText k="phone" />
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="co-email" className="block font-bold text-slate-700 mb-1">Correo para la confirmación *</label>
                  <input
                    id="co-email"
                    type="email"
                    autoComplete="email"
                    maxLength={120}
                    value={form.email}
                    onChange={(e) => setField('email', e.target.value.replace(/\s/g, '').slice(0, 120))}
                    className={inputCls('email')}
                    {...a11y('email')}
                  />
                  <ErrorText k="email" />
                </div>
              </div>

              {deliveryMode === 'envio' ? (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 text-emerald-800 rounded-xl text-xs font-semibold border border-emerald-200">
                    <Calendar className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Entrega estimada: 24 a 48 horas hábiles después de confirmar el pedido.</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div>
                      <label htmlFor="co-city" className="block font-bold text-slate-700 mb-1">Ciudad *</label>
                      <select
                        id="co-city"
                        value={form.city}
                        onChange={(e) => { setField('city', e.target.value); blur('city'); }}
                        className={`${inputCls('city')} cursor-pointer`}
                        {...a11y('city')}
                      >
                        <option value="">Selecciona tu ciudad</option>
                        {DELIVERY_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                      <ErrorText k="city" />
                    </div>
                    <div>
                      <label htmlFor="co-hood" className="block font-bold text-slate-700 mb-1">Barrio / sector</label>
                      <input
                        id="co-hood"
                        type="text"
                        maxLength={60}
                        value={form.neighborhood}
                        onChange={(e) => setField('neighborhood', e.target.value.replace(FREE_TEXT_RE, '').slice(0, 60))}
                        className={inputCls('neighborhood')}
                        {...a11y('neighborhood')}
                      />
                      <ErrorText k="neighborhood" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="co-address" className="block font-bold text-slate-700 mb-1">Dirección de entrega (calle, número, apto/casa) *</label>
                      <input
                        id="co-address"
                        type="text"
                        autoComplete="street-address"
                        maxLength={120}
                        placeholder="Ej. Calle 10A # 36-24, Apto 301"
                        value={form.address}
                        onChange={(e) => setField('address', e.target.value.replace(FREE_TEXT_RE, '').slice(0, 120))}
                        className={inputCls('address')}
                        {...a11y('address')}
                      />
                      <ErrorText k="address" />
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="co-notes" className="block font-bold text-slate-700 mb-1">Instrucciones para el transportador (opcional)</label>
                      <input
                        id="co-notes"
                        type="text"
                        maxLength={200}
                        placeholder="Ej. Dejar en portería"
                        value={form.deliveryNotes}
                        onChange={(e) => setField('deliveryNotes', e.target.value.replace(FREE_TEXT_RE, '').slice(0, 200))}
                        className={inputCls('deliveryNotes')}
                        {...a11y('deliveryNotes')}
                      />
                      <ErrorText k="deliveryNotes" />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label htmlFor="co-pickup-city" className="text-xs font-bold text-slate-700">Ciudad donde retirarás tu pedido:</label>
                    <select
                      id="co-pickup-city"
                      value={selectedCity}
                      onChange={(e) => {
                        setSelectedCity(e.target.value);
                        const firstBranch = STORE_BRANCHES.find(b => b.city === e.target.value);
                        if (firstBranch) setSelectedBranchId(firstBranch.id);
                      }}
                      className="px-3 py-2 text-xs font-bold bg-white border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                    >
                      {pickupCities.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2.5" role="radiogroup" aria-label="Tienda de retiro">
                    {availableBranchesForCity.map((branch) => {
                      const isSelected = selectedBranch.id === branch.id;
                      return (
                        <label
                          key={branch.id}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-all ${isSelected ? 'border-emerald-500 bg-emerald-50/60 ring-2 ring-emerald-500/20' : 'border-slate-200 hover:border-slate-300 bg-white'}`}
                        >
                          <input
                            type="radio"
                            name="branch_select"
                            checked={isSelected}
                            onChange={() => setSelectedBranchId(branch.id)}
                            className="mt-1 text-emerald-600 focus:ring-emerald-500"
                          />
                          <div className="flex-1 min-w-0 text-xs">
                            <div className="flex flex-wrap items-center justify-between gap-1">
                              <span className="font-extrabold text-slate-900 text-sm">{branch.name}</span>
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                Listo en {branch.readyInHours} h · sin costo
                              </span>
                            </div>
                            <p className="text-slate-600 mt-0.5">{branch.address}</p>
                            <p className="text-slate-400 text-[11px] mt-0.5">{branch.schedule} · Tel: {branch.phone}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 2. PAGO */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
              <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">2</span>
              <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Pago</h2>
            </div>
            <div className="p-4 sm:p-6 space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border border-emerald-500 bg-emerald-50/50 flex items-start gap-3">
                <Banknote className="w-5 h-5 text-emerald-700 shrink-0" />
                <div>
                  <span className="font-extrabold text-slate-900 block">
                    {deliveryMode === 'recogida' ? 'Pagas en la tienda al retirar' : 'Pago contra entrega'}
                  </span>
                  <span className="text-slate-600 block mt-0.5">
                    {deliveryMode === 'recogida'
                      ? 'Efectivo, tarjeta o transferencia en la tienda cuando recojas tu pedido.'
                      : 'Efectivo o datáfono al recibir tu pedido. No te pedimos datos de tarjeta en línea.'}
                  </span>
                </div>
              </div>

              {/* Factura electrónica (opcional) */}
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.requireInvoice}
                    onChange={(e) => setField('requireInvoice', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600"
                  />
                  <span>Necesito factura electrónica a nombre de una empresa (NIT)</span>
                </label>
                {form.requireInvoice && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label htmlFor="co-company" className="block font-bold text-slate-700 mb-1">Razón social *</label>
                      <input
                        id="co-company"
                        type="text"
                        maxLength={100}
                        value={form.companyName}
                        onChange={(e) => setField('companyName', e.target.value.replace(FREE_TEXT_RE, '').slice(0, 100))}
                        className={inputCls('companyName')}
                        {...a11y('companyName')}
                      />
                      <ErrorText k="companyName" />
                    </div>
                    <div>
                      <label htmlFor="co-nit" className="block font-bold text-slate-700 mb-1">NIT *</label>
                      <input
                        id="co-nit"
                        type="text"
                        inputMode="numeric"
                        maxLength={14}
                        placeholder="901452880-1"
                        value={form.nit}
                        onChange={(e) => setField('nit', e.target.value.replace(/[^\d.\-\s]/g, '').slice(0, 14))}
                        className={inputCls('nit')}
                        {...a11y('nit')}
                      />
                      <ErrorText k="nit" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 3. PRODUCTOS */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">3</span>
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Productos ({itemsToBuy.length})</h2>
              </div>
              <span className="text-xs font-bold text-emerald-700">
                {deliveryMode === 'envio' ? 'Llega en 24–48 h hábiles' : `Listo para retiro en ${selectedBranch.readyInHours} h`}
              </span>
            </div>
            <div className="p-4 sm:p-6 divide-y divide-slate-100">
              {itemsToBuy.map(item => (
                <div key={item.id} className="py-3 first:pt-0 last:pb-0 flex items-center gap-3 sm:gap-4">
                  <div className="w-14 h-14 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden shrink-0 flex items-center justify-center p-1">
                    <ProductThumb productId={item.productId} name={item.name} sizeName={item.sizeName} colorHex={item.colorHex} colorName={item.colorName} />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <h4 className="font-extrabold text-slate-900 line-clamp-2">{item.name}</h4>
                    <p className="text-slate-500 font-medium truncate">{item.sizeName}{item.colorName ? ` • ${item.colorName}` : ''}</p>
                    <span className="text-slate-600 font-bold">Cant.: {item.quantity}</span>
                  </div>
                  <div className="text-right text-xs shrink-0">
                    <span className="font-black text-slate-900 text-sm block">{formatCOP(item.price * item.quantity)}</span>
                    <span className="text-[10px] text-slate-400">COP</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RESUMEN */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-5 lg:sticky lg:top-24">
          <h3 className="text-base font-extrabold text-slate-900 pb-3 border-b border-slate-100">Resumen del pedido</h3>
          <div className="space-y-2.5 text-xs text-slate-600">
            <div className="flex justify-between gap-2">
              <span>Productos ({unitsCount} {unitsCount === 1 ? 'unidad' : 'unidades'}):</span>
              <span className="font-bold text-slate-900">{formatCOP(productsSubtotal)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span>Envío:</span>
              <span className={`font-bold ${shippingCost === 0 ? 'text-emerald-600' : 'text-slate-900'}`}>
                {shippingCost === 0 ? 'Gratis' : formatCOP(shippingCost)}
              </span>
            </div>
            {deliveryMode === 'envio' && shippingCost > 0 && (
              <p className="text-[11px] text-slate-500">Envío gratis desde {formatCOP(FREE_SHIPPING_THRESHOLD)} en productos.</p>
            )}
            <div className="flex justify-between gap-2">
              <span>IVA (19 %, incluido):</span>
              <span className="font-medium text-slate-500">{formatCOP(ivaAmount)}</span>
            </div>
            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline gap-2">
              <span className="text-sm font-black text-slate-900">Total:</span>
              <span className="text-2xl font-black text-slate-950">{formatCOP(totalAmountCOP)} <span className="text-xs text-slate-500">COP</span></span>
            </div>
          </div>

          {orderError && (
            <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{orderError}</span>
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || !isValid}
            aria-disabled={isSubmitting || !isValid}
            className="w-full py-4 px-4 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-black text-sm rounded-xl shadow-md transition-all text-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-slate-900 border-t-transparent rounded-full animate-spin" />
                <span>Registrando pedido…</span>
              </>
            ) : (
              <span>Confirmar pedido ({formatCOP(totalAmountCOP)})</span>
            )}
          </button>

          {!isValid && (
            <p className="text-[11px] font-semibold text-amber-700 text-center" aria-live="polite">
              Revisa:{' '}
              {missing.map((k, i) => (
                <React.Fragment key={k}>
                  {i > 0 && ', '}
                  <button type="button" onClick={() => goToField(k)} className="underline hover:text-amber-900 cursor-pointer">
                    {FIELD_LABELS[k]}
                  </button>
                </React.Fragment>
              ))}
              .
            </p>
          )}

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Al confirmar aceptas los términos y condiciones comerciales de ColorLink.
          </p>
        </div>
      </form>
    </div>
  );
};
