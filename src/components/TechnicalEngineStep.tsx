import React, { useState, useEffect, useRef } from 'react';
import { ProjectFormData, CalculationBreakdown, AiDiagnosisResult } from '../types';
import { Calculator, Package, Warehouse, CheckCircle2, ArrowRight, AlertCircle, Printer, FileText } from 'lucide-react';

interface TechnicalEngineStepProps {
  formData: ProjectFormData;
  aiResult: AiDiagnosisResult | null;
  calculation: CalculationBreakdown;
  onOpenPdfModal: () => void;
  onProceedToPipeline: () => void;
  onBackToAi: () => void;
  isSaving?: boolean;
  saveError?: string;
}

const formatCOP = (val: unknown) =>
  new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(Number(val) || 0);
const num = (v: unknown, dec = 0) => (Number(v) || 0).toLocaleString('es-CO', { maximumFractionDigits: dec });

export const TechnicalEngineStep: React.FC<TechnicalEngineStepProps> = ({
  formData,
  calculation,
  onOpenPdfModal,
  onProceedToPipeline,
  onBackToAi,
  isSaving,
  saveError
}) => {
  const [stockCheck, setStockCheck] = useState<{ suficiente: boolean; disponibleCunetes: number; disponibleGalones: number } | null>(null);
  const [stockEstado, setStockEstado] = useState<'cargando' | 'listo' | 'error'>('cargando');
  const clicGuardar = useRef(false);

  // El cálculo lo arma App con el área del formulario; si no coincide, el estimado está desactualizado
  const calculoAlDia = Math.abs((Number(calculation.areaM2) || 0) - (Number(formData.areaM2) || 0)) < 0.001;
  const c = calculation.costoEstimadoCOP;

  useEffect(() => {
    let cancel = false;
    setStockEstado('cargando');
    fetch('/api/inventory/check-availability', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        cunetes5gRequeridos: calculation.cunetesPintura5Gal,
        galones1gRequeridos: calculation.galonesPintura1Gal,
        categoria: formData.ambiente === 'exterior_fachada' ? 'acabado_exterior' : 'acabado_interior'
      })
    })
      .then(res => res.json())
      .then(data => {
        if (cancel) return;
        if (data.success) { setStockCheck(data); setStockEstado('listo'); } else setStockEstado('error');
      })
      .catch(() => { if (!cancel) setStockEstado('error'); });
    return () => { cancel = true; };
  }, [calculation.cunetesPintura5Gal, calculation.galonesPintura1Gal, formData.ambiente]);

  useEffect(() => { if (!isSaving) clicGuardar.current = false; }, [isSaving]);

  const guardar = () => {
    if (isSaving || clicGuardar.current) return;
    clicGuardar.current = true;
    onProceedToPipeline();
  };

  const filas = [
    {
      nombre: `Pintura de acabado${formData.color ? ` · ${formData.color}` : ''}`,
      detalle: `Rendimiento ${num(calculation.rendimientoM2Galon, 1)} m²/galón · ${num(calculation.manos)} manos · ${num(calculation.areaEfectivaTotalM2, 1)} m² efectivos`,
      cantidad: `${num(calculation.cunetesPintura5Gal)} cuñete(s) de 5 gal + ${num(calculation.galonesPintura1Gal)} galón(es)`,
      extra: `≈ ${num(calculation.galonesPinturaExactos, 2)} galones`,
      valor: c.pinturaAcabado
    },
    {
      nombre: 'Sellador / imprimante',
      detalle: 'Prepara la superficie antes del acabado',
      cantidad: `${num(calculation.cunetesImprimante5Gal)} cuñete(s) de 5 gal`,
      extra: '',
      valor: c.imprimanteSellador
    },
    {
      nombre: 'Masilla para fisuras',
      detalle: 'Para resanar grietas y fisuras, si las hay',
      cantidad: `${num(calculation.galonesMasillaElastomerica)} galón(es)`,
      extra: '',
      valor: c.masillaFisuras
    }
  ];

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 rounded-2xl p-5 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Paso 4 de 4 · Materiales y estimado</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Materiales y valor estimado</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Cantidades calculadas con el área, las manos y un margen de desperdicio. Tu asesor confirma la cotización final.
            </p>
          </div>
          <button
            id="btn-print-technical-sheet"
            type="button"
            onClick={onOpenPdfModal}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 text-cyan-700" />
            <span>Ver ficha y descargar PDF</span>
          </button>
        </div>
      </div>

      {!calculoAlDia && (
        <div role="alert" className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-900">
          El estimado se calculó para {num(calculation.areaM2, 2)} m² y no para el área que escribiste ({num(formData.areaM2, 2)} m²). Puedes guardar el proyecto: tu asesor recalculará las cantidades al cotizar.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Materiales para {num(calculation.areaM2, 2)} m²</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">
                {num(calculation.manos)} manos + {num((Number(calculation.factorDesperdicio) || 0) * 100)}% de desperdicio
              </span>
            </div>

            <div className="space-y-4">
              {filas.map((f, i) => (
                <div key={f.nombre} className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-slate-900 break-words">{i + 1}. {f.nombre}</span>
                    <p className="text-[11px] text-slate-500 mt-1">{f.detalle}</p>
                  </div>
                  <div className="sm:text-right sm:shrink-0">
                    <span className="text-xs font-bold text-teal-700 block">{f.cantidad}</span>
                    {f.extra && <span className="text-[11px] text-slate-400 font-mono">{f.extra}</span>}
                  </div>
                </div>
              ))}
            </div>

            {Array.isArray(calculation.insumosAdicionales) && calculation.insumosAdicionales.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-700 mb-2">Herramientas y protección sugeridas</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {calculation.insumosAdicionales.map((acc, idx) => (
                    <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                      <p className="font-semibold text-slate-800 truncate">{acc.item}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{num(acc.cantidad)} {acc.unidad}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Disponibilidad real en inventario */}
          <div className={`rounded-2xl p-5 sm:p-6 shadow-sm border ${stockEstado === 'listo' && stockCheck && !stockCheck.suficiente ? 'bg-amber-50 border-amber-300' : 'bg-white border-slate-200'}`}>
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-cyan-600" />
                <h3 className="text-base font-bold text-slate-900">Disponibilidad en inventario</h3>
              </div>
              {stockEstado === 'listo' && stockCheck && (
                stockCheck.suficiente ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Hay existencias
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                    <AlertCircle className="w-3.5 h-3.5" /> Existencias insuficientes
                  </span>
                )
              )}
            </div>

            {stockEstado === 'cargando' && <p className="text-xs text-slate-500">Consultando inventario…</p>}
            {stockEstado === 'error' && <p className="text-xs text-slate-500">No pudimos consultar el inventario ahora. Tu asesor confirmará la disponibilidad.</p>}
            {stockEstado === 'listo' && stockCheck && (
              <>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-white/70 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Cuñetes disponibles</span>
                    <span className="text-sm font-bold text-slate-800">{num(stockCheck.disponibleCunetes)}</span>
                  </div>
                  <div className="p-3 bg-white/70 rounded-xl border border-slate-200">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Galones disponibles</span>
                    <span className="text-sm font-bold text-slate-800">{num(stockCheck.disponibleGalones)}</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-slate-600">
                  {stockCheck.suficiente
                    ? `Tu proyecto requiere ${num(calculation.cunetesPintura5Gal)} cuñete(s) y ${num(calculation.galonesPintura1Gal)} galón(es). Plazo que pediste: ${formData.fechaRequeridaDias} días.`
                    : `Tu proyecto requiere ${num(calculation.cunetesPintura5Gal)} cuñete(s) y ${num(calculation.galonesPintura1Gal)} galón(es). Puedes guardar el proyecto igual: tu asesor te propondrá fechas o alternativas.`}
                </p>
              </>
            )}
          </div>
        </div>

        {/* Valor estimado */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm lg:sticky lg:top-24">
            <div className="pb-4 mb-4 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Valor de referencia</span>
              <h3 className="text-lg font-bold text-slate-900">Estimado</h3>
              {formData.cliente && <p className="text-xs text-slate-500 break-words">{formData.cliente}</p>}
            </div>

            <div className="space-y-3 text-xs">
              {[
                ['Pintura de acabado', c.pinturaAcabado],
                ['Sellador / imprimante', c.imprimanteSellador],
                ['Masilla para fisuras', c.masillaFisuras],
                ['Herramientas y accesorios', c.accesorios]
              ].map(([l, v]) => (
                <div key={String(l)} className="flex justify-between gap-2 text-slate-600">
                  <span>{l}</span>
                  <span className="font-semibold text-slate-900 whitespace-nowrap">{formatCOP(v)}</span>
                </div>
              ))}
              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-500 text-xs"><span>Subtotal</span><span>{formatCOP(c.subtotal)}</span></div>
                <div className="flex justify-between text-slate-500 text-xs"><span>IVA (19%)</span><span>{formatCOP(c.iva19)}</span></div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-300">
                  <span>Total estimado</span>
                  <span className="text-teal-700">{formatCOP(c.totalCOP)}</span>
                </div>
              </div>
            </div>

            <button
              id="btn-view-pdf"
              type="button"
              onClick={onOpenPdfModal}
                className="mt-6 w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Ver ficha técnica</span>
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={onBackToAi}
            disabled={isSaving}
            className="px-5 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors cursor-pointer"
          >
            Volver al diagnóstico
          </button>
          <button
            id="btn-proceed-to-pipeline"
            type="button"
            onClick={guardar}
            disabled={isSaving}
            className="px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            <span>{isSaving ? 'Guardando proyecto…' : 'Guardar en mis proyectos'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
        {saveError && <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{saveError}</p>}
      </div>
    </div>
  );
};
