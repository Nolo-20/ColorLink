import React, { useEffect, useRef } from 'react';
import { ProjectChat, AsesorContacto } from './ProjectChat';
import { X, Printer, MapPin, Ruler, Palette, Layers, Truck, Clock } from 'lucide-react';

interface ProjectDetailModalProps {
  project: any;
  estado: { label: string; detalle: string; clase: string };
  clienteNombre?: string;
  clienteEmail?: string;
  onClose: () => void;
  /** Abre el modal directamente en la conversación con el asesor */
  focusChat?: boolean;
  /** Se llama cuando el cliente ya vio los mensajes (para bajar el contador) */
  onMessagesRead?: () => void;
}

const money = (n?: number | null) => `$${Math.round(n || 0).toLocaleString('es-CO')}`;
const fecha = (d?: string | Date | null) => (d ? new Date(d).toLocaleDateString('es-CO', { day: '2-digit', month: 'short', year: 'numeric' }) : '');
const esc = (v: any) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const ESTADO_TXT: Record<string, string> = {
  en_revision: 'En revisión', imagen_por_corregir: 'Imagen por corregir', en_peritaje: 'En peritaje', cotizado: 'Cotizado',
  aprobado_calidad: 'Aprobado por calidad', rechazado: 'Requiere ajustes', despachado: 'Despachado', cancelado: 'Cancelado'
};

/** Detalle del proyecto del cliente, con su cotización real y descarga en PDF (impresión del navegador). */
export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ project: p, estado, clienteNombre, clienteEmail, onClose, focusChat, onMessagesRead }) => {
  const chatRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (focusChat) setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 150);
  }, [focusChat, p.proyectoId]);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);
  const cot = p.cotizaciones?.[0];
  const items: any[] = cot?.items || [];
  const ciudad = p.empresa?.ciudad?.ciudad || '';
  const codigo = `PRY-${String(p.proyectoId || '').slice(0, 8).toUpperCase()}`;
  const sistema = (() => {
    try { return p.diagnostico?.sistemaRecomendado ? JSON.parse(p.diagnostico.sistemaRecomendado) : null; } catch { return null; }
  })();
  const pasos: string[] = sistema ? Object.values(sistema).filter(Boolean).map(String) : [];
  const hayCotizacion = !!cot && (cot.total || items.length);

  const imprimir = () => {
    const filas = items.length
      ? items.map(it => `<tr><td>${esc(it.producto?.nombre || 'Producto')}${it.producto?.presentacion ? ` <span class="m">(${esc(it.producto.presentacion)})</span>` : ''}</td><td class="r">${esc(it.cantidad ?? '')}</td><td class="r">${money(it.precioUnitario)}</td><td class="r">${money(it.total)}</td></tr>`).join('')
      : `<tr><td>Pintura ${esc(p.color || '')}</td><td class="r">${cot?.cunetes5g ?? 0} cuñete(s) 5 gal + ${cot?.galones1g ?? 0} galón(es)</td><td></td><td class="r">${money(cot?.subtotal || cot?.total)}</td></tr>`;
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Cotización ${codigo}</title>
<style>
*{box-sizing:border-box} body{font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;margin:32px;font-size:13px}
.h{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #14216B;padding-bottom:16px;margin-bottom:20px}
.h img{height:40px} .code{font-family:monospace;font-size:15px;font-weight:700;text-align:right} .m{color:#64748b}
.box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:18px;display:grid;grid-template-columns:1fr 1fr;gap:6px 24px}
h2{font-size:13px;letter-spacing:.06em;text-transform:uppercase;color:#14216B;margin:22px 0 8px}
table{width:100%;border-collapse:collapse} th{text-align:left;font-size:11px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #cbd5e1;padding:8px 6px}
td{padding:8px 6px;border-bottom:1px solid #f1f5f9} .r{text-align:right}
.tot{margin-top:14px;margin-left:auto;width:280px} .tot div{display:flex;justify-content:space-between;padding:3px 0} .tot .g{font-size:16px;font-weight:800;border-top:2px solid #14216B;padding-top:8px;margin-top:4px}
.badge{display:inline-block;background:#FFF3C4;color:#77580B;border-radius:6px;padding:2px 8px;font-weight:700;font-size:11px}
ol{margin:0;padding-left:18px} .foot{margin-top:28px;color:#64748b;font-size:11px}
@media print{body{margin:14mm}}
</style></head><body>
<div class="h"><div><img src="${location.origin}/brand/logo-on-light.svg" alt="ColorLink"><div class="m" style="margin-top:6px">Cotización de proyecto de pintura</div></div>
<div><div class="code">${codigo}</div><div class="m" style="text-align:right">Fecha: ${fecha(cot?.createdAt || p.createdAt)}</div><div style="text-align:right;margin-top:4px"><span class="badge">${esc(ESTADO_TXT[p.estadoPipeline] || p.estadoPipeline || '')}</span></div></div></div>
<div class="box">
<div><b>Cliente:</b> ${esc(clienteNombre || '')}</div><div><b>Proyecto:</b> ${esc(p.nombreProyecto)}</div>
<div><b>Correo:</b> ${esc(clienteEmail || '')}</div><div><b>Ciudad:</b> ${esc(ciudad)}</div>
<div><b>Área:</b> ${esc(p.area ?? 0)} m²</div><div><b>Superficie:</b> ${esc(p.tipoSuperficie || '')}${p.ambiente ? ' · ' + esc(p.ambiente) : ''}</div>
<div><b>Color:</b> ${esc(p.color || 'Por definir')}</div>
</div>
${pasos.length ? `<h2>Sistema recomendado</h2><ol>${pasos.map(x => `<li>${esc(x)}</li>`).join('')}</ol>` : ''}
<h2>Materiales cotizados</h2>
<table><thead><tr><th>Producto</th><th class="r">Cantidad</th><th class="r">Precio unit.</th><th class="r">Total</th></tr></thead><tbody>${filas}</tbody></table>
<div class="tot">${cot?.subtotal ? `<div><span>Subtotal</span><span>${money(cot.subtotal)}</span></div>` : ''}${cot?.iva ? `<div><span>IVA</span><span>${money(cot.iva)}</span></div>` : ''}<div class="g"><span>Total</span><span>${money(cot?.total)} COP</span></div></div>
<p class="foot">Cotización generada desde el portal de clientes de ColorLink. Precios sujetos a disponibilidad de inventario al momento de la compra.</p>
<script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.open(); w.document.write(html); w.document.close();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-slate-100 px-6 py-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[11px] font-mono font-bold text-slate-500">{codigo}</span>
            <h2 className="text-lg font-black text-slate-900 leading-tight">{p.nombreProyecto}</h2>
            <span className={`inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${estado.clase}`}>{estado.label}</span>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 cursor-pointer" aria-label="Cerrar"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-6 space-y-5">
          <p className="text-sm text-slate-600">{estado.detalle}</p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="flex items-center gap-2 text-slate-600"><MapPin className="w-4 h-4 text-slate-400" />{ciudad || 'Sin ciudad'}</div>
            <div className="flex items-center gap-2 text-slate-600"><Ruler className="w-4 h-4 text-slate-400" />{p.area || 0} m²</div>
            <div className="flex items-center gap-2 text-slate-600"><Layers className="w-4 h-4 text-slate-400" />{p.tipoSuperficie || 'Sin definir'}</div>
            <div className="flex items-center gap-2 text-slate-600"><Palette className="w-4 h-4 text-slate-400" />
              <span className="w-3 h-3 rounded-full ring-1 ring-black/10" style={{ backgroundColor: p.colorHex || '#F8FAFC' }} />{p.color || 'Sin definir'}
            </div>
          </div>

          {pasos.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Sistema recomendado</h3>
              <ol className="list-decimal pl-5 space-y-1 text-xs text-slate-600">{pasos.map((x, i) => <li key={i}>{x}</li>)}</ol>
            </div>
          )}

          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Cotización</h3>
            {hayCotizacion ? (
              <div className="rounded-2xl border border-slate-200 overflow-hidden">
                {items.length > 0 ? (
                  <table className="w-full text-xs">
                    <tbody className="divide-y divide-slate-100">
                      {items.map((it, i) => (
                        <tr key={i}>
                          <td className="px-3 py-2 text-slate-800">{it.producto?.nombre}{it.producto?.presentacion ? <span className="text-slate-400"> · {it.producto.presentacion}</span> : null}</td>
                          <td className="px-3 py-2 text-right text-slate-500">x{it.cantidad}</td>
                          <td className="px-3 py-2 text-right font-bold text-slate-900">{money(it.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="px-3 py-2 text-xs text-slate-600">{cot?.cunetes5g ?? 0} cuñete(s) de 5 gal + {cot?.galones1g ?? 0} galón(es)</div>
                )}
                <div className="flex items-center justify-between px-3 py-2.5 bg-slate-50 border-t border-slate-200">
                  <span className="text-xs font-bold text-slate-600">Total con IVA</span>
                  <span className="text-base font-black text-slate-900">{money(cot?.total)} <span className="text-[10px] font-medium text-slate-500">COP</span></span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 bg-slate-50 border border-dashed border-slate-300 rounded-xl p-3">Aún no hay cotización. Te avisaremos cuando un asesor la prepare.</p>
            )}
          </div>

          <div ref={chatRef} className="space-y-3 scroll-mt-24">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-700">Tu asesor y mensajes</h3>
            <AsesorContacto asesor={p.asesorAsignado} proyecto={p.nombreProyecto} />
            <ProjectChat proyectoId={p.proyectoId} autoFocus={focusChat} onRead={onMessagesRead} />
          </div>

          {p.despacho && (
            <div className="rounded-2xl border border-slate-200 p-3 text-xs text-slate-600 space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-800"><Truck className="w-4 h-4" /> Despacho · guía {p.despacho.numeroGuia}</div>
              {p.despacho.direccionEntrega && <div>Destino: {p.despacho.direccionEntrega}{p.despacho.ciudadEntrega ? ` (${p.despacho.ciudadEntrega})` : ''}</div>}
              {p.despacho.fechaEntrega && <div>Entregado el {fecha(p.despacho.fechaEntrega)}{p.despacho.recibidoPor ? ` · recibió ${p.despacho.recibidoPor}` : ''}</div>}
            </div>
          )}

          {Array.isArray(p.historial) && p.historial.length > 0 && (
            <div>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">Seguimiento</h3>
              <ul className="space-y-2">
                {p.historial.map((h: any) => (
                  <li key={h.id} className="flex items-start gap-2 text-xs">
                    <Clock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" />
                    <span className="min-w-0">
                      <span className="text-slate-700 font-semibold block">{ESTADO_TXT[h.estadoNuevo] || h.estadoNuevo}</span>
                      {h.comentario && <span className="text-slate-500 block">{h.comentario}</span>}
                    </span>
                    <span className="text-slate-400 ml-auto shrink-0">{fecha(h.fecha)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-6 py-4 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">Cerrar</button>
          {hayCotizacion && (
            <button onClick={imprimir} className="px-4 py-2 rounded-xl bg-[#14216B] hover:bg-[#0f1a55] text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer">
              <Printer className="w-4 h-4" /> Descargar PDF
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
