import { BrandLogo } from './BrandLogo';
import React from 'react';
import { ProjectFormData, CalculationBreakdown, AiDiagnosisResult, UserProfile } from '../types';
import { 
  X, 
  Printer, 
  Download, 
  Droplet, 
  CheckCircle2, 
  Building2, 
  MapPin, 
  Calendar, 
  Package, 
  ShieldCheck,
  FileCheck
} from 'lucide-react';

interface TechnicalPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: ProjectFormData;
  calculation: CalculationBreakdown;
  aiResult: AiDiagnosisResult | null;
  user: UserProfile;
}

export const TechnicalPdfModal: React.FC<TechnicalPdfModalProps> = ({
  isOpen,
  onClose,
  formData,
  calculation,
  aiResult,
  user
}) => {
  if (!isOpen) return null;

  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
        
        {/* Modal Action Bar */}
        <div className="sticky top-0 bg-slate-900 text-white p-4 px-6 flex items-center justify-between z-10 print:hidden">
          <div className="flex items-center gap-2">
            <FileCheck className="w-5 h-5 text-cyan-400" />
            <span className="text-sm font-bold">Ficha Técnica & Dictamen Comercial — ColorLink</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="p-8 sm:p-10 space-y-6 text-slate-900 font-sans" id="printable-technical-sheet">
          
          {/* Document Header */}
          <div className="flex items-start justify-between border-b-2 border-slate-900 pb-6">
            <div className="flex items-center gap-3">
              <div>
                <BrandLogo on="light" className="h-10" />
                <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                  Ecosistema de Recubrimientos & Pinturas de Alto Desempeño
                </p>
              </div>
            </div>

            <div className="text-right text-xs">
              <p className="font-mono font-bold text-slate-950 text-sm">{formData.id || 'CLK-PRJ-2026-MED-085'}</p>
              <p className="text-slate-500">Fecha: {new Date().toLocaleDateString('es-CO')}</p>
              <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded">
                Dictamen Aprobado
              </span>
            </div>
          </div>

          {/* Client & Project Overview */}
          <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Datos del Solicitante</span>
              <p className="font-bold text-slate-900 text-sm">{formData.cliente}</p>
              <p className="text-slate-600">Contacto: {user.name} ({user.email})</p>
              <p className="text-slate-600">Ciudad: {formData.ciudad}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Especificación de Obra</span>
              <p className="font-bold text-slate-900 text-sm">{formData.proyecto}</p>
              <p className="text-slate-600">Área: <strong>{formData.areaM2} m²</strong> • Sustrato: <strong>{formData.superficie}</strong></p>
              <p className="text-slate-600">Patología: <span className="text-amber-800 font-semibold">{formData.condiciones.join(' + ')}</span></p>
            </div>
          </div>

          {/* Technical System Formulation */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              1. Sistema Tricapa Formulado
            </h3>
            <div className="space-y-2 text-xs">
              <div className="p-3 bg-slate-100 rounded-lg">
                <span className="font-bold text-slate-900 block">Paso 1: Preparación & Saneamiento</span>
                <p className="text-slate-700 mt-0.5">{aiResult?.sistema_recomendado.paso1_preparacion}</p>
              </div>
              <div className="p-3 bg-teal-50 rounded-lg border border-teal-200">
                <span className="font-bold text-teal-950 block">Paso 2: Sellador Antialcalino & Masilla Elastomérica</span>
                <p className="text-teal-900 mt-0.5">{aiResult?.sistema_recomendado.paso2_imprimante_sellador}</p>
              </div>
              <div className="p-3 bg-cyan-50 rounded-lg border border-cyan-200">
                <span className="font-bold text-cyan-950 block">Paso 3: Acabado ColorLink Koraza Tech (2 Manos)</span>
                <p className="text-cyan-900 mt-0.5">{aiResult?.sistema_recomendado.paso3_acabado}</p>
              </div>
            </div>
          </div>

          {/* Materials & Logistics Table */}
          <div className="space-y-3">
            <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-900 border-b border-slate-200 pb-1">
              2. Dosificación de Materiales & Stock
            </h3>
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <th className="p-2.5">Producto / Ítem</th>
                  <th className="p-2.5">Dosificación Exacta</th>
                  <th className="p-2.5">Presentación Asignada</th>
                  <th className="p-2.5 text-right">Subtotal Estimado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="p-2.5 font-semibold">Pintura Fachada {formData.color}</td>
                  <td className="p-2.5">6.56 Galones</td>
                  <td className="p-2.5">1 Cuñete (5G) + 2 Galones (1G)</td>
                  <td className="p-2.5 text-right font-mono">{formatCOP(calculation.costoEstimadoCOP.pinturaAcabado)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Imprimante Antialcalino Pro Shield</td>
                  <td className="p-2.5">5.00 Galones</td>
                  <td className="p-2.5">1 Cuñete (5G)</td>
                  <td className="p-2.5 text-right font-mono">{formatCOP(calculation.costoEstimadoCOP.imprimanteSellador)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Masilla Elastomérica para Fisuras</td>
                  <td className="p-2.5">2.00 Galones</td>
                  <td className="p-2.5">2 Galones (1G c/u)</td>
                  <td className="p-2.5 text-right font-mono">{formatCOP(calculation.costoEstimadoCOP.masillaFisuras)}</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Accesorios de Aplicación Profesional</td>
                  <td className="p-2.5">Kit Completo</td>
                  <td className="p-2.5">Rodillos, Cinta, Plásticos</td>
                  <td className="p-2.5 text-right font-mono">{formatCOP(calculation.costoEstimadoCOP.accesorios)}</td>
                </tr>
              </tbody>
            </table>

            {/* Total Row */}
            <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between text-xs mt-4">
              <div>
                <p className="font-semibold text-cyan-300">Bodega de Despacho: {calculation.disponibilidadBodega.bodega}</p>
                <p className="text-[11px] text-slate-400">Lote Activo: {calculation.disponibilidadBodega.loteActivo} • Entrega en 24 a 48 horas</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase text-slate-400 block">Total con IVA (19%)</span>
                <span className="text-base font-extrabold text-white font-mono">{formatCOP(calculation.costoEstimadoCOP.totalCOP)}</span>
              </div>
            </div>
          </div>

          {/* Footer Signatures */}
          <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-center text-xs text-slate-500">
            <div>
              <div className="w-48 mx-auto border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-800">Dirección Técnica ColorLink</p>
              <p className="text-[10px]">Ingeniería de Recubrimientos</p>
            </div>
            <div>
              <div className="w-48 mx-auto border-b border-slate-400 mb-1"></div>
              <p className="font-semibold text-slate-800">{formData.cliente}</p>
              <p className="text-[10px]">Aceptación de Propuesta Técnica</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
