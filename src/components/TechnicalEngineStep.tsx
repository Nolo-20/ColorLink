import React, { useState } from 'react';
import { ProjectFormData, CalculationBreakdown, AiDiagnosisResult } from '../types';
import { SAMPLE_CALCULATION } from '../data/mockData';
import { 
  Calculator, 
  Package, 
  Warehouse, 
  CheckCircle2, 
  Truck, 
  FileText, 
  ArrowRight, 
  DollarSign, 
  Sparkles, 
  AlertCircle,
  Clock,
  Printer,
  ChevronRight,
  ShieldCheck
} from 'lucide-react';

interface TechnicalEngineStepProps {
  formData: ProjectFormData;
  aiResult: AiDiagnosisResult | null;
  calculation: CalculationBreakdown;
  onOpenPdfModal: () => void;
  onProceedToPipeline: () => void;
  onBackToAi: () => void;
}

export const TechnicalEngineStep: React.FC<TechnicalEngineStepProps> = ({
  formData,
  aiResult,
  calculation,
  onOpenPdfModal,
  onProceedToPipeline,
  onBackToAi
}) => {
  // Format currency Colombian Pesos (COP)
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-cyan-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-500/20 border border-teal-400/30 text-teal-300 text-xs font-semibold mb-2">
              <Calculator className="w-3.5 h-3.5" />
              <span>Motor Técnico, Cantidades & Stock en Tiempo Real</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Cálculo de Materiales & Disponibilidad en Bodega
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Cálculo matemático de rendimiento, manos, desperdicio y consulta de stock en el Centro Logístico Regional de Medellín.
            </p>
          </div>

          <button
            id="btn-print-technical-sheet"
            onClick={onOpenPdfModal}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Printer className="w-4 h-4 text-cyan-700" />
            <span>Generar Ficha Técnica & Cotización</span>
          </button>
        </div>
      </div>

      {/* Grid: Formulas & Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Technical Quantities Breakdown */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-teal-600" />
                <h3 className="text-base font-bold text-slate-900">Dosificación del Sistema para {formData.areaM2} m²</h3>
              </div>
              <span className="text-xs font-semibold text-slate-500">2 Manos + 10% Desperdicio</span>
            </div>

            <div className="space-y-4">
              {/* Product 1: Acabado */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">1. Pintura Fachada ColorLink Koraza Tech</span>
                    <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-mono">Tono: {formData.color}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Rendimiento: 28.5 m²/galón • Área total con 2 manos: {formData.areaM2 * 2} m²
                  </p>
                </div>
                <div className="text-right sm:shrink-0">
                  <span className="text-xs font-bold text-teal-700 block">
                    1 Cuñete (5 Gal) + 2 Galones (1 Gal c/u)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Total: ~6.56 galones</span>
                </div>
              </div>

              {/* Product 2: Imprimante */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">2. Sellador Antialcalino Hidrófugo Pro Shield</span>
                    <span className="text-[10px] bg-teal-100 text-teal-800 px-2 py-0.5 rounded font-semibold">Barrera Humedad</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Capa previa para neutralizar alcalinidad del concreto y sellar poro
                  </p>
                </div>
                <div className="text-right sm:shrink-0">
                  <span className="text-xs font-bold text-teal-700 block">
                    1 Cuñete (5 Galones)
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Rendimiento: 35 m²/galón</span>
                </div>
              </div>

              {/* Product 3: Masilla */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900">3. Masilla Elastomérica Puenteadora de Fisuras</span>
                    <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-semibold">Flexibilidad 300%</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-1">
                    Tratamiento flexible para fisuras vivas en muro exterior
                  </p>
                </div>
                <div className="text-right sm:shrink-0">
                  <span className="text-xs font-bold text-teal-700 block">
                    2 Galones
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">Aplicación con espátula</span>
                </div>
              </div>
            </div>

            {/* Accesories list */}
            <div className="mt-5 pt-4 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-700 mb-2">Herramientas & Protección Complementaria</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {calculation.insumosAdicionales.map((acc, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-xs">
                    <p className="font-semibold text-slate-800 truncate">{acc.item}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">{acc.cantidad} {acc.unidad}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Inventory Availability in Regional Warehouse */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Warehouse className="w-5 h-5 text-cyan-600" />
                <div>
                  <h3 className="text-base font-bold text-slate-900">Disponibilidad en Bodega Regional</h3>
                  <p className="text-xs text-slate-500">{calculation.disponibilidadBodega.bodega}</p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Stock Inmediato
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Lote Activo</span>
                <span className="text-xs font-mono font-bold text-slate-800">{calculation.disponibilidadBodega.loteActivo}</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock Cuñetes</span>
                <span className="text-xs font-bold text-emerald-700">{calculation.disponibilidadBodega.stockDisponibleCunetes} disp.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Stock Galones</span>
                <span className="text-xs font-bold text-emerald-700">{calculation.disponibilidadBodega.stockDisponibleGalones} disp.</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Tiempo Despacho</span>
                <span className="text-xs font-bold text-cyan-700">{calculation.disponibilidadBodega.tiempoDespachoHoras}</span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-cyan-50/70 border border-cyan-200 rounded-xl flex items-center justify-between text-xs text-cyan-900">
              <div className="flex items-center gap-2">
                <Truck className="w-4 h-4 text-cyan-700" />
                <span>
                  <strong>Plazo solicitado:</strong> {formData.fechaRequeridaDias} días. <strong>Entrega estimada ColorLink:</strong> En 48 horas en Medellín.
                </span>
              </div>
              <span className="font-bold text-emerald-700">Cumple 100%</span>
            </div>
          </div>
        </div>

        {/* Right Col: Commercial Quotation Card */}
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm sticky top-24">
            <div className="pb-4 mb-4 border-b border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Presupuesto Preliminar</span>
              <h3 className="text-lg font-bold text-slate-900">Cotización Estimada</h3>
              <p className="text-xs text-slate-500">{formData.cliente}</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Pintura Acabado ({formData.color})</span>
                <span className="font-semibold text-slate-900">{formatCOP(calculation.costoEstimadoCOP.pinturaAcabado)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Imprimante Sellador (1 Cuñete)</span>
                <span className="font-semibold text-slate-900">{formatCOP(calculation.costoEstimadoCOP.imprimanteSellador)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Masilla Fisuras (2 Galones)</span>
                <span className="font-semibold text-slate-900">{formatCOP(calculation.costoEstimadoCOP.masillaFisuras)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Accesorios & Aplicación</span>
                <span className="font-semibold text-slate-900">{formatCOP(calculation.costoEstimadoCOP.accesorios)}</span>
              </div>

              <div className="pt-3 border-t border-slate-200 space-y-2">
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>Subtotal</span>
                  <span>{formatCOP(calculation.costoEstimadoCOP.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-500 text-xs">
                  <span>IVA (19%)</span>
                  <span>{formatCOP(calculation.costoEstimadoCOP.iva19)}</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-300">
                  <span>Total Estimado</span>
                  <span className="text-teal-700">{formatCOP(calculation.costoEstimadoCOP.totalCOP)}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <button
                id="btn-view-pdf"
                onClick={onOpenPdfModal}
                className="w-full py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Ver Ficha Técnica Oficial</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToAi}
          className="px-5 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Volver a Diagnóstico IA
        </button>

        <button
          id="btn-proceed-to-pipeline"
          type="button"
          onClick={onProceedToPipeline}
          className="px-6 py-3.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-2 cursor-pointer transition-all"
        >
          <span>Ver Trazabilidad & Esquema Base de Datos</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
