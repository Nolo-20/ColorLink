import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { X, Printer, Copy, Check, Store, Truck, Mail } from 'lucide-react';
import { CustomerOrder } from '../types';
import { BrandLogo } from './BrandLogo';

interface PickupReceiptModalProps {
  order: CustomerOrder;
  onClose: () => void;
}

const cop = (n: unknown) => `$${Math.round(Number(n) || 0).toLocaleString('es-CO')}`;
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const ESTADO_TXT: Record<string, string> = {
  comprado: 'Pago confirmado',
  despacho: 'En preparación',
  enviado: 'En camino',
  entregado: 'Entregado',
  cancelado: 'Cancelado'
};

/** Comprobante del pedido. Si es para retirar en tienda, muestra el QR real del código de retiro. */
export const PickupReceiptModal: React.FC<PickupReceiptModalProps> = ({ order, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);

  const isPickup = order.deliveryMethod === 'sucursal' || !!order.pickupStore || !!order.pickupCode;
  const isCancelled = order.status === 'cancelado';
  const isDelivered = order.status === 'entregado';
  const pickupCode = order.pickupCode || '';
  const mostrarQr = isPickup && !!pickupCode && !isCancelled && !isDelivered;
  const storeName = order.pickupStore || order.branchName || order.shippingAddress || 'Sucursal por confirmar';
  const estado = order.status === 'despacho' && order.readyForPickup ? 'Listo para retirar' : (ESTADO_TXT[order.status] || order.status);

  // QR real con el código de retiro (el mismo que valida la sucursal)
  useEffect(() => {
    let cancel = false;
    setQrDataUrl(null);
    if (!mostrarQr) return;
    QRCode.toDataURL(pickupCode, { width: 240, margin: 1, errorCorrectionLevel: 'M' })
      .then(url => { if (!cancel) setQrDataUrl(url); })
      .catch(() => { if (!cancel) setQrDataUrl(null); });
    return () => { cancel = true; };
  }, [pickupCode, mostrarQr]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(pickupCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  };

  // Imprime solo el comprobante (en una ventana aparte) para poder guardarlo como PDF
  const imprimir = () => {
    const filas = order.items.map(it => `<tr><td>${esc(Number(it.quantity) || 0)} × ${esc(it.name)}<div class="m">${esc([it.sizeName, it.colorName].filter(Boolean).join(' · '))}</div></td><td class="r">${cop((Number(it.price) || 0) * (Number(it.quantity) || 0))}</td></tr>`).join('');
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Comprobante ${esc(order.orderNumber)}</title>
<style>
*{box-sizing:border-box} body{font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;margin:32px;font-size:13px}
.h{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #14216B;padding-bottom:14px;margin-bottom:18px}
.h img{height:36px} .m{color:#64748b;font-size:11px} .code{font-family:monospace;font-size:22px;font-weight:800;letter-spacing:4px}
.qr{text-align:center;border:1px dashed #94a3b8;border-radius:12px;padding:16px;margin:16px 0}
table{width:100%;border-collapse:collapse} td{padding:8px 4px;border-bottom:1px solid #f1f5f9;vertical-align:top} .r{text-align:right;white-space:nowrap}
.tot td{font-weight:800;font-size:15px;border-top:2px solid #14216B}
@media print{body{margin:14mm}}
</style></head><body>
<div class="h"><div><img src="${location.origin}/brand/logo-on-light.svg" alt="ColorLink"><div class="m" style="margin-top:6px">Comprobante de pedido</div></div>
<div style="text-align:right"><div style="font-family:monospace;font-weight:700">${esc(order.orderNumber)}</div><div class="m">Fecha: ${esc(order.date || '')}</div><div class="m">Estado: ${esc(estado)}</div></div></div>
<p><b>Cliente:</b> ${esc(order.recipientName || '—')}${order.recipientEmail ? ` · ${esc(order.recipientEmail)}` : ''}</p>
<p><b>${isPickup ? 'Retiro en' : 'Entrega en'}:</b> ${esc(isPickup ? storeName : (order.shippingAddress || '—'))}</p>
${mostrarQr && qrDataUrl ? `<div class="qr"><img src="${qrDataUrl}" width="180" height="180" alt="QR de retiro"><div class="code">${esc(pickupCode)}</div><div class="m">Presenta este código y tu documento de identidad en la sucursal.</div></div>` : ''}
<table><tbody>${filas}<tr class="tot"><td>Total</td><td class="r">${cop(order.total)} COP</td></tr></tbody></table>
<p class="m" style="margin-top:6px">Precios con IVA incluido.</p>
<p class="m" style="margin-top:24px">ColorLink Recubrimientos S.A.S.</p>
<script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open(); w.document.write(html); w.document.close();
  };

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`Comprobante del pedido ${order.orderNumber}`}
        className="bg-white rounded-3xl w-full max-w-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Barra superior */}
        <div className="bg-slate-900 text-white px-4 sm:px-5 py-3.5 flex items-center justify-between gap-3">
          <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider min-w-0 truncate">
            {isPickup ? 'Comprobante de retiro' : 'Comprobante de compra'} · {order.orderNumber}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={imprimir}
              title="Imprimir o guardar como PDF"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">Imprimir / PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-600 text-slate-300 hover:text-white cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-8 bg-white overflow-y-auto max-h-[85vh] text-slate-900">
          <div className="text-center pb-4 border-b border-slate-100 flex flex-col items-center">
            <BrandLogo on="light" className="h-9" />
          </div>

          <div className="text-center py-4">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight break-words">
              {order.recipientName ? `¡Hola ${order.recipientName}!` : '¡Hola!'}
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Estado del pedido: <strong className="text-slate-800">{estado}</strong> · {order.date || '—'}
            </p>
          </div>

          {isCancelled ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl mb-6 text-sm font-bold text-rose-800 text-center">
              Este pedido fue cancelado.
            </div>
          ) : isPickup ? (
            mostrarQr ? (
              <div className="flex flex-col items-center justify-center p-5 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 mb-6 text-center">
                <div className="p-3 bg-white rounded-xl border border-slate-300 shadow-md w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center">
                  {qrDataUrl
                    ? <img src={qrDataUrl} alt={`Código QR de retiro ${pickupCode}`} className="w-full h-full" />
                    : <span className="text-xs text-slate-400">Generando código…</span>}
                </div>
                <span className="mt-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Código de retiro</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-widest font-mono">{pickupCode}</span>
                  <button
                    type="button"
                    onClick={handleCopyCode}
                    className="p-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 transition-colors cursor-pointer"
                    title="Copiar código"
                    aria-label="Copiar código de retiro"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 mt-2 max-w-xs">
                  {order.readyForPickup
                    ? 'Tu pedido ya está listo. Presenta este código y tu documento de identidad en la sucursal.'
                    : 'Te avisaremos cuando esté listo para retirar. Guarda este código.'}
                </p>
              </div>
            ) : (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl mb-6 text-sm font-semibold text-emerald-800 text-center">
                {isDelivered ? 'Ya retiraste este pedido en la tienda.' : 'El código de retiro aparecerá aquí en cuanto esté disponible.'}
              </div>
            )
          ) : (
            <div className="p-5 bg-emerald-50/70 border border-emerald-200 rounded-2xl mb-6">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Truck className="w-5 h-5" />
                </div>
                <div className="space-y-1 text-xs min-w-0">
                  <h4 className="font-extrabold text-slate-900 text-sm">Envío a domicilio</h4>
                  <p className="text-slate-600 break-words"><strong>Dirección de entrega:</strong> {order.shippingAddress || '—'}</p>
                  {order.trackingNumber && (
                    <p className="text-slate-600"><strong>Guía:</strong> <span className="font-mono font-bold text-slate-800">{order.trackingNumber}</span>{order.carrier ? ` · ${order.carrier}` : ''}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="space-y-4 text-xs sm:text-sm border-t border-b border-slate-200 py-5">
            {isPickup && (
              <div>
                <strong className="font-black block uppercase text-[11px] tracking-wider mb-1 text-slate-500">Tienda de retiro</strong>
                <div className="flex items-start gap-2 p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl text-slate-800">
                  <Store className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                  <span className="font-black text-[#002D62] block text-xs sm:text-sm break-words">{storeName}</span>
                </div>
              </div>
            )}

            <div>
              <strong className="font-black block uppercase text-[11px] tracking-wider mb-1.5 text-slate-500">Productos</strong>
              <div className="divide-y divide-slate-100 bg-slate-50 rounded-xl border border-slate-200 p-3">
                {order.items.length === 0 && <p className="text-xs text-slate-500">Sin productos.</p>}
                {order.items.map((it, idx) => (
                  <div key={it.id || idx} className="flex justify-between items-start gap-3 py-2 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <span className="font-black text-slate-900 block text-xs sm:text-sm break-words">
                        {Number(it.quantity) || 0} × {it.name}
                      </span>
                      {(it.sizeName || it.colorName) && (
                        <span className="text-[11px] text-slate-500 font-medium">
                          {[it.sizeName && `Presentación: ${it.sizeName}`, it.colorName && `Color: ${it.colorName}`].filter(Boolean).join(' · ')}
                        </span>
                      )}
                    </div>
                    <span className="font-black text-slate-900 text-xs sm:text-sm whitespace-nowrap">
                      {cop((Number(it.price) || 0) * (Number(it.quantity) || 0))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 space-y-1.5 text-xs sm:text-sm">
              <div className="flex justify-between text-base sm:text-lg font-black text-slate-950">
                <strong className="uppercase">Total</strong>
                <span className="text-[#002D62]">{cop(order.total)} COP</span>
              </div>
              <p className="text-[11px] text-slate-500 text-right">Precios con IVA incluido.</p>
            </div>
          </div>

          <div className="py-4 text-xs text-slate-600 leading-relaxed space-y-2">
            {order.recipientEmail && (
              <p className="flex items-start gap-1.5">
                <Mail className="w-3.5 h-3.5 mt-0.5 shrink-0 text-slate-400" />
                <span>Te enviamos las actualizaciones de este pedido a <strong className="break-all">{order.recipientEmail}</strong>.</span>
              </p>
            )}
            {isPickup && (
              <p className="text-[11px] text-slate-500">
                Si otra persona retira por ti, debe presentar este código y una copia del documento de identidad del comprador.
              </p>
            )}
          </div>

          <div className="mt-2 pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <span className="text-[11px] text-slate-400">ColorLink Recubrimientos S.A.S.</span>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={imprimir}
                className="flex-1 sm:flex-none py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5 text-slate-600" />
                <span>Imprimir</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 sm:flex-none py-2.5 px-6 bg-[#002D62] hover:bg-[#001D40] text-white font-black text-xs rounded-xl cursor-pointer shadow-md"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
