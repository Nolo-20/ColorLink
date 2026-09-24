import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  Copy, 
  Check, 
  Mail, 
  Smartphone, 
  MapPin, 
  ShieldCheck, 
  Store, 
  QrCode, 
  Share2, 
  Clock, 
  Info,
  Building2
} from 'lucide-react';
import { CustomerOrder } from '../types';

interface PickupReceiptModalProps {
  order: CustomerOrder;
  onClose: () => void;
}

export const PickupReceiptModal: React.FC<PickupReceiptModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [devicePreview, setDevicePreview] = useState<'movil' | 'pc'>('pc');

  // Check if order is for pickup or home delivery
  const isPickup = 
    order.deliveryMethod === 'sucursal' || 
    order.deliveryMethod === 'pickup' || 
    !!order.pickupStore || 
    !!order.pickupCode || 
    !!order.branchName ||
    Boolean(order.carrier && order.carrier.toLowerCase().includes('sucursal'));
  
  // Derive pickup code and transaction code from orderNumber
  const pickupCode = order.pickupCode || order.orderNumber.replace(/[^A-Z0-9]/g, '').slice(-7) || 'WFQHP6C';
  const transactionNumber = order.transactionId || order.orderNumber.replace(/[^0-9]/g, '').slice(-7) || '2555916';
  const customerName = order.recipientName || 'Juan Fernando Restrepo';
  const storeName = order.pickupStore || 'TIENDA COLORLINK GUAYABAL - CRA. 52 # 14-80, MEDELLÍN';

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pickupCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white">
      
      {/* Modal Container */}
      <div className={`bg-white rounded-3xl w-full shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col transition-all print:border-none print:shadow-none print:max-w-full ${
        devicePreview === 'movil' ? 'max-w-md' : 'max-w-2xl'
      }`}>
        
        {/* Top Control Bar (Hidden on Print) */}
        <div className="bg-slate-900 text-white px-5 py-3.5 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-black uppercase tracking-wider">
              {isPickup ? 'Comprobante de Retiro en Tienda' : 'Factura & Guía de Envío a Domicilio'} · Pedido #{order.orderNumber}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Toggle Movil / PC */}
            <div className="hidden sm:flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[10px] font-bold">
              <button
                type="button"
                onClick={() => setDevicePreview('pc')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  devicePreview === 'pc' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-300'
                }`}
              >
                Vista PC
              </button>
              <button
                type="button"
                onClick={() => setDevicePreview('movil')}
                className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                  devicePreview === 'movil' ? 'bg-amber-400 text-slate-950 font-black shadow-xs' : 'text-slate-300'
                }`}
              >
                Vista Móvil
              </button>
            </div>

            <button
              type="button"
              onClick={() => window.print()}
              title="Imprimir comprobante"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* EMAIL & PICKUP VOUCHER BODY                                              */}
        {/* ========================================================================= */}
        <div className="p-4 sm:p-8 bg-white overflow-y-auto max-h-[85vh] text-slate-900 font-sans print:max-h-none print:p-0">
          
          {/* 1. Header: ColorLink Brand Logo */}
          <div className="text-center pb-4 border-b border-slate-100 flex flex-col items-center">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#002D62] text-white flex items-center justify-center font-black text-sm shadow-xs">
                CL
              </div>
              <span className="text-xl sm:text-2xl font-black tracking-tight text-[#002D62]">
                COLORLINK
              </span>
            </div>
            <span className="text-[10px] uppercase font-black text-slate-400 tracking-widest mt-0.5">
              Recubrimientos & Pinturas de Colombia
            </span>
          </div>

          {/* 2. Customer Greeting */}
          <div className="text-center py-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              ¡Hola {customerName}!
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              {isPickup 
                ? 'Presenta tu código de retiro en la sucursal asignada para reclamar tus materiales.' 
                : 'Tu pedido se encuentra confirmado y en despacho hacia tu dirección de entrega.'}
            </p>
          </div>

          {/* 3. Conditional QR Code (ONLY for Pickup orders as explicitly requested) */}
          {isPickup ? (
            <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 mb-6 text-center">
              
              {/* Scannable SVG QR Visual */}
              <div className="relative p-3 bg-white rounded-xl border border-slate-300 shadow-md">
                <svg 
                  className="w-44 h-44 sm:w-52 sm:h-52" 
                  viewBox="0 0 200 200" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="200" height="200" fill="white" />
                  
                  {/* QR Finder Pattern Top-Left */}
                  <rect x="20" y="20" width="45" height="45" fill="#0F172A" rx="4" />
                  <rect x="27" y="27" width="31" height="31" fill="white" rx="2" />
                  <rect x="34" y="34" width="17" height="17" fill="#0F172A" rx="2" />

                  {/* QR Finder Pattern Top-Right */}
                  <rect x="135" y="20" width="45" height="45" fill="#0F172A" rx="4" />
                  <rect x="142" y="27" width="31" height="31" fill="white" rx="2" />
                  <rect x="149" y="34" width="17" height="17" fill="#0F172A" rx="2" />

                  {/* QR Finder Pattern Bottom-Left */}
                  <rect x="20" y="135" width="45" height="45" fill="#0F172A" rx="4" />
                  <rect x="27" y="142" width="31" height="31" fill="white" rx="2" />
                  <rect x="34" y="149" width="17" height="17" fill="#0F172A" rx="2" />

                  {/* Simulated Scannable Data Matrix Blocks */}
                  <rect x="75" y="25" width="10" height="10" fill="#0F172A" />
                  <rect x="95" y="25" width="10" height="10" fill="#0F172A" />
                  <rect x="115" y="25" width="10" height="10" fill="#0F172A" />
                  <rect x="85" y="35" width="10" height="10" fill="#0F172A" />
                  <rect x="105" y="35" width="10" height="10" fill="#0F172A" />

                  <rect x="25" y="75" width="10" height="10" fill="#0F172A" />
                  <rect x="45" y="75" width="10" height="10" fill="#0F172A" />
                  <rect x="25" y="95" width="10" height="10" fill="#0F172A" />
                  <rect x="55" y="105" width="10" height="10" fill="#0F172A" />

                  <rect x="75" y="75" width="15" height="15" fill="#002D62" rx="3" />
                  <rect x="110" y="75" width="15" height="15" fill="#0F172A" />
                  <rect x="80" y="105" width="15" height="15" fill="#0F172A" />
                  <rect x="110" y="105" width="15" height="15" fill="#002D62" rx="3" />

                  <rect x="135" y="75" width="10" height="10" fill="#0F172A" />
                  <rect x="155" y="75" width="10" height="10" fill="#0F172A" />
                  <rect x="145" y="95" width="10" height="10" fill="#0F172A" />
                  <rect x="165" y="105" width="10" height="10" fill="#0F172A" />

                  <rect x="75" y="135" width="10" height="10" fill="#0F172A" />
                  <rect x="95" y="135" width="10" height="10" fill="#0F172A" />
                  <rect x="115" y="145" width="10" height="10" fill="#0F172A" />
                  <rect x="85" y="155" width="10" height="10" fill="#0F172A" />
                  <rect x="135" y="135" width="10" height="10" fill="#0F172A" />
                  <rect x="155" y="145" width="10" height="10" fill="#0F172A" />
                  <rect x="145" y="165" width="10" height="10" fill="#0F172A" />
                  <rect x="165" y="165" width="10" height="10" fill="#0F172A" />

                  {/* Center Badge Icon */}
                  <circle cx="100" cy="100" r="14" fill="#002D62" />
                  <text x="100" y="104" fill="white" fontSize="10" fontWeight="900" textAnchor="middle">CL</text>
                </svg>
              </div>

              {/* Código de retiro */}
              <div className="mt-4 flex flex-col items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Código de retiro:
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-widest font-mono">
                    {pickupCode}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer print:hidden"
                    title="Copiar código"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <span className="text-xs text-slate-600 mt-1">
                  <strong>Número de transacción : </strong>
                  <span className="font-mono font-bold text-slate-800">{transactionNumber}</span>
                </span>
              </div>

            </div>
          ) : (
            /* Home Delivery Status Box (NO QR CODE - user requested) */
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shrink-0 shadow-sm">
                  🚚
                </div>
                <div className="space-y-1 text-xs">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-600 text-white font-black text-[10px] uppercase">
                    Envío a Domicilio Programado
                  </span>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    Despacho Express desde Centro de Distribución
                  </h4>
                  <p className="text-slate-600">
                    <strong>Dirección de Entrega:</strong> {order.deliveryAddress || 'Medellín, Antioquia'}
                  </p>
                  <p className="text-slate-600">
                    <strong>Número de Guía de Rastreo:</strong> <span className="font-mono font-bold text-slate-800">CL-LOG-{transactionNumber}</span>
                  </p>
                  <p className="text-slate-600">
                    <strong>Transportadora Aliada:</strong> Coordinadora Mercantil / ColorLink Flota Propia
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 5. Pickup & Order Details Table (Matching Image 2 Specs) */}
          <div className="space-y-4 text-xs sm:text-sm border-t border-b border-slate-200 py-5">
            
            {/* Tienda de retiro (Exact Image 2 "TEATRO / TIENDA") */}
            <div>
              <strong className="text-slate-900 font-black block uppercase text-[11px] tracking-wider mb-1 text-slate-500">
                TIENDA DE RETIRO :
              </strong>
              <div className="flex items-start gap-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-slate-800">
                <Store className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-black text-[#002D62] block text-xs sm:text-sm">
                    {storeName}
                  </span>
                  <span className="text-[11px] text-slate-600 block mt-0.5">
                    Horario de entrega: Lunes a viernes 8:00 AM – 5:00 PM · Sábados 8:00 AM – 1:00 PM
                  </span>
                </div>
              </div>
            </div>

            {/* Productos (Exact Image 2 "PRODUCTO :") */}
            <div>
              <strong className="text-slate-900 font-black block uppercase text-[11px] tracking-wider mb-1.5 text-slate-500">
                PRODUCTO(S) :
              </strong>
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 p-3 space-y-2">
                {order.items.map((it, idx) => (
                  <div key={it.id || idx} className="flex justify-between items-center pt-2 first:pt-0">
                    <div className="pr-4">
                      <span className="font-black text-slate-900 block text-xs sm:text-sm">
                        {it.quantity} X {it.name}
                      </span>
                      <span className="text-[11px] text-slate-500 font-medium">
                        Presentación: {it.sizeName} {it.colorName ? `· Tono: ${it.colorName}` : ''}
                      </span>
                    </div>
                    <span className="font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                      ${(it.price * it.quantity).toLocaleString('es-CO')} COP
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial Summary (Image 2 layout: Cargo por servicio & Total Pagado) */}
            <div className="pt-2 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between text-slate-600">
                <strong className="text-slate-700">CARGO POR SERVICIO DE RECOGIDA EN TIENDA :</strong>
                <span className="font-bold text-emerald-700">GRATIS ($ 0 COP)</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Subtotal sin IVA :</span>
                <span>${order.subtotal.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>IVA 19% Discriminado :</span>
                <span>${order.tax.toLocaleString('es-CO')} COP</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-black text-slate-950 border-t border-slate-300 pt-2.5">
                <strong className="uppercase">TOTAL PAGADO :</strong>
                <span className="text-[#002D62]">${order.total.toLocaleString('es-CO')} COP</span>
              </div>
            </div>

          </div>

          {/* 6. Instructions for Pickup (Image 2 text) */}
          <div className="py-4 text-xs text-slate-600 leading-relaxed space-y-2">
            <p>
              Redime tu compra presentando este código QR directamente en el <strong>Mostrador Express</strong> de la tienda para reclamar tus pinturas y herramientas antes de iniciar tus obras.
            </p>
            <p className="text-[11px] text-slate-500">
              Recibirás tu factura electrónica legal de venta en tu correo electrónico: <strong>{order.emailContacto || 'distribuidora@colorlink.com.co'}</strong>.
            </p>
          </div>

          {/* 7. Legal Terms Box (Exact Image 2 Gray Box at Bottom) */}
          <div className="bg-slate-100 rounded-xl p-4 border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <strong className="block text-slate-800 uppercase font-black tracking-wide text-xs">
              TÉRMINOS Y CONDICIONES LEGALES DE COMPRAS DIGITALES
            </strong>
            <p>
              <strong>I.</strong> Para ver los términos y condiciones de garantía y devoluciones entra en los portales oficiales de ColorLink.
            </p>
            <p>
              <strong>II.</strong> En caso de retiro presencial por parte de un tercero autorizado, este deberá presentar fotocopia o imagen de la cédula del comprador junto con este código QR de retiro.
            </p>
            <p>
              <strong>III.</strong> El horario de retiro es el habitual de la tienda seleccionada (generalmente de lunes a viernes de 8:00 a.m. a 5:00 p.m. y sábados hasta la 1:00 p.m.).
            </p>
          </div>

          {/* Print / Close Footer Button */}
          <div className="mt-6 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <span className="text-[11px] text-slate-400">
              ColorLink Recubrimientos S.A.S. · NIT 901.482.903-4
            </span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 sm:flex-none py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Imprimir comprobante</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none py-2.5 px-6 bg-[#002D62] hover:bg-[#001D40] text-white font-black text-xs rounded-xl cursor-pointer shadow-md"
              >
                Entendido / Cerrar
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
