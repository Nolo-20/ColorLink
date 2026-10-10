import { BrandLogo } from './BrandLogo';
import React, { useEffect, useState } from 'react';
import { ProjectFormData, CalculationBreakdown, AiDiagnosisResult, UserProfile } from '../types';
import { X, Printer, FileCheck } from 'lucide-react';
import { SUPERFICIE_LABEL, AMBIENTE_LABEL } from './ClientProjectsManager';

interface TechnicalPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProjectFormData;
  calculation: CalculationBreakdown;
  aiResult: AiDiagnosisResult | null;
  user: UserProfile;
}

const formatCOP = (val: unknown) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(val) || 0);
const num = (v: unknown, dec = 0) => (Number(v) || 0).toLocaleString('es-CO', { maximumFractionDigits: dec });
const esc = (v: unknown) => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

const CONDICION_LABEL: Record<string, string> = {
  humedad: 'Humedad', fisuras: 'Fisuras', descascaramiento: 'Descascaramiento', hongos_moho: 'Hongos / moho', caleo: 'Caleo', buen_estado: 'Buen estado'
};

/** Ficha técnica y estimado del proyecto en curso (se imprime en una ventana aparte para guardarla como PDF). */
export const TechnicalPdfModal: React.FC<TechnicalPdfModalProps> = ({
  isOpen,
  onClose,
  formData,
  calculation,
  aiResult,
  user
}) => {
  const [errorPdf, setErrorPdf] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    setErrorPdf('');
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const c = calculation.costoEstimadoCOP;
  const codigo = formData.id ? `PRY-${formData.id.slice(0, 8).toUpperCase()}` : 'Sin guardar';
  const condiciones = (formData.condiciones || []).map(x => CONDICION_LABEL[x] || x).join(', ') || '—';
  const pasos = aiResult?.sistema_recomendado;
  const hayPasos = !!(pasos && (pasos.paso1_preparacion || pasos.paso2_imprimante_sellador || pasos.paso3_acabado));
  const filas = [
    { item: `Pintura de acabado${formData.color ? ` · ${formData.color}` : ''}`, dosis: `${num(calculation.galonesPinturaExactos, 2)} galones`, pres: `${num(calculation.cunetesPintura5Gal)} cuñete(s) 5 gal + ${num(calculation.galonesPintura1Gal)} galón(es)`, valor: c.pinturaAcabado },
    { item: 'Sellador / imprimante', dosis: '—', pres: `${num(calculation.cunetesImprimante5Gal)} cuñete(s) 5 gal`, valor: c.imprimanteSellador },
    { item: 'Masilla para fisuras', dosis: '—', pres: `${num(calculation.galonesMasillaElastomerica)} galón(es)`, valor: c.masillaFisuras },
    { item: 'Herramientas y accesorios', dosis: '—', pres: (calculation.insumosAdicionales || []).map(i => i.item).join(', ') || '—', valor: c.accesorios }
  ];
  const fechaHoy = new Date().toLocaleDateString('es-CO');

  const imprimir = () => {
    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Ficha técnica ${esc(formData.proyecto || '')}</title>
<style>
*{box-sizing:border-box} body{font-family:'Segoe UI',Roboto,Arial,sans-serif;color:#0f172a;margin:32px;font-size:12px}
.h{display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #0f172a;padding-bottom:14px;margin-bottom:18px}
.h img{height:38px} .m{color:#64748b} .box{background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:12px 14px;display:grid;grid-template-columns:1fr 1fr;gap:4px 24px;margin-bottom:16px}
h2{font-size:12px;letter-spacing:.06em;text-transform:uppercase;margin:18px 0 8px;border-bottom:1px solid #e2e8f0;padding-bottom:4px}
table{width:100%;border-collapse:collapse} th{text-align:left;font-size:10px;text-transform:uppercase;color:#64748b;border-bottom:1px solid #cbd5e1;padding:6px} td{padding:6px;border-bottom:1px solid #f1f5f9} .r{text-align:right}
.tot{margin-top:10px;margin-left:auto;width:260px} .tot div{display:flex;justify-content:space-between;padding:2px 0} .tot .g{font-weight:800;font-size:14px;border-top:2px solid #0f172a;padding-top:6px}
ol{margin:0;padding-left:18px} .foot{margin-top:24px;color:#64748b;font-size:10px}
@media print{body{margin:14mm}}
</style></head><body>
<div class="h"><div><img src="${location.origin}/brand/logo-on-light.svg" alt="ColorLink"><div class="m" style="margin-top:6px">Ficha técnica y estimado de materiales</div></div>
<div style="text-align:right"><div style="font-family:monospace;font-weight:700">${esc(codigo)}</div><div class="m">Fecha: ${esc(fechaHoy)}</div></div></div>
<div class="box">
<div><b>Cliente:</b> ${esc(formData.cliente || user.name || '—')}</div><div><b>Proyecto:</b> ${esc(formData.proyecto || '—')}</div>
<div><b>Contacto:</b> ${esc(user.email || '—')}</div><div><b>Ciudad:</b> ${esc(formData.ciudad || '—')}</div>
<div><b>Área:</b> ${esc(num(formData.areaM2, 2))} m²</div><div><b>Superficie:</b> ${esc(SUPERFICIE_LABEL[formData.superficie] || formData.superficie || '—')} · ${esc(AMBIENTE_LABEL[formData.ambiente] || formData.ambiente || '')}</div>
<div><b>Estado reportado:</b> ${esc(condiciones)}</div><div><b>Color:</b> ${esc(formData.color || 'Por definir')}</div>
</div>
${hayPasos ? `<h2>Sistema recomendado (preliminar)</h2><ol>${[pasos!.paso1_preparacion, pasos!.paso2_imprimante_sellador, pasos!.paso3_acabado].filter(Boolean).map(p => `<li>${esc(p)}</li>`).join('')}</ol>` : ''}
<h2>Materiales estimados para ${esc(num(calculation.areaM2, 2))} m²</h2>
<table><thead><tr><th>Producto</th><th>Cantidad exacta</th><th>Presentación</th><th class="r">Valor estimado</th></tr></thead><tbody>
${filas.map(f => `<tr><td>${esc(f.item)}</td><td>${esc(f.dosis)}</td><td>${esc(f.pres)}</td><td class="r">${esc(formatCOP(f.valor))}</td></tr>`).join('')}
</tbody></table>
<div class="tot"><div><span>Subtotal</span><span>${esc(formatCOP(c.subtotal))}</span></div><div><span>IVA (19%)</span><span>${esc(formatCOP(c.iva19))}</span></div><div class="g"><span>Total estimado</span><span>${esc(formatCOP(c.totalCOP))}</span></div></div>
<p class="foot">Documento informativo generado desde el portal de clientes de ColorLink. Las cantidades y valores son un estimado; la cotización definitiva la confirma tu asesor según inventario y visita técnica.</p>
<script>window.onload=()=>{setTimeout(()=>window.print(),300)}</script>
</body></html>`;
    const w = window.open('', '_blank');
    if (!w) { setErrorPdf('Tu navegador bloqueó la ventana del PDF. Permite las ventanas emergentes e intenta de nuevo.'); return; }
    setErrorPdf('');
    w.document.open(); w.document.write(html); w.document.close();
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label="Ficha técnica" className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-slate-900 text-white p-3 sm:p-4 sm:px-6 flex items-center justify-between gap-3 z-10">
          <div className="flex items-center gap-2 min-w-0">
            <FileCheck className="w-5 h-5 text-cyan-400 shrink-0" />
            <span className="text-sm font-bold truncate">Ficha técnica y estimado</span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button type="button" onClick={imprimir} className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
              <Printer className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>
            <button type="button" onClick={onClose} aria-label="Cerrar" className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        {errorPdf && <p role="alert" className="mx-4 sm:mx-6 mt-3 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{errorPdf}</p>}

        <div className="p-4 sm:p-10 space-y-6 text-slate-900">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b-2 border-slate-900 pb-5">
            <div>
              <BrandLogo on="light" className="h-9" />
              <p className="text-[11px] font-semibold text-slate-500 mt-1">Ficha técnica y estimado de materiales</p>
            </div>
            <div className="text-right text-xs">
              <p className="font-mono font-bold text-slate-950 text-sm">{codigo}</p>
              <p className="text-slate-500">Fecha: {fechaHoy}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded">Estimado preliminar</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Solicitante</span>
              <p className="font-bold text-slate-900 text-sm break-words">{formData.cliente || user.name || '—'}</p>
              <p className="text-slate-600 break-all">Contacto: {user.email || '—'}</p>
              <p className="text-slate-600">Ciudad: {formData.ciudad || '—'}</p>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Obra</span>
              <p className="font-bold text-slate-900 text-sm break-words">{formData.proyecto || '—'}</p>
              <p className="text-slate-600">Área: <strong>{num(formData.areaM2, 2)} m²</strong> · {SUPERFICIE_LABEL[formData.superficie] || formData.superficie || '—'}</p>
              <p className="text-slate-600">Estado reportado: <span className="text-amber-800 font-semibold">{condiciones}</span></p>
            </div>
          </div>

          {hayPasos && (
            <div className="space-y-3">
              <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">Sistema recomendado (preliminar)</h3>
              <ol className="space-y-2 text-xs">
                {[['Preparación', pasos!.paso1_preparacion], ['Imprimante / sellador', pasos!.paso2_imprimante_sellador], ['Acabado', pasos!.paso3_acabado]]
                  .filter(([, v]) => v)
                  .map(([t, v], i) => (
                    <li key={t} className="p-3 bg-slate-100 rounded-lg">
                      <span className="font-bold text-slate-900 block">{i + 1}. {t}</span>
                      <p className="text-slate-700 mt-0.5 break-words">{v}</p>
                    </li>
                  ))}
              </ol>
            </div>
          )}

          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              Materiales estimados para {num(calculation.areaM2, 2)} m²
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-xs text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                    <th className="p-2.5">Producto</th>
                    <th className="p-2.5">Cantidad exacta</th>
                    <th className="p-2.5">Presentación</th>
                    <th className="p-2.5 text-right">Valor estimado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filas.map(f => (
                    <tr key={f.item}>
                      <td className="p-2.5 font-semibold">{f.item}</td>
                      <td className="p-2.5">{f.dosis}</td>
                      <td className="p-2.5">{f.pres}</td>
                      <td className="p-2.5 text-right font-mono">{formatCOP(f.valor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-slate-900 text-white p-4 rounded-xl flex flex-wrap items-center justify-between gap-2 text-xs mt-4">
              <p className="text-[11px] text-slate-300 max-w-md">Valores de referencia con IVA. Tu asesor confirma la cotización según inventario y visita técnica.</p>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block">Total estimado con IVA</span>
                <span className="text-base font-extrabold text-white font-mono">{formatCOP(c.totalCOP)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
