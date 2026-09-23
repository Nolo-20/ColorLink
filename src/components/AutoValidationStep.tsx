import React, { useState, useEffect } from 'react';
import { ProjectFormData, ValidationResult } from '../types';
import {
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  FileSearch,
  Database,
  Cpu,
  Layers,
  Clock,
  Fingerprint
} from 'lucide-react';

interface AutoValidationStepProps {
  formData: ProjectFormData;
  onProceedToAi: () => void;
  onBackToCapture: () => void;
}

export const AutoValidationStep: React.FC<AutoValidationStepProps> = ({
  formData,
  onProceedToAi,
  onBackToCapture
}) => {
  const [duplicateFound, setDuplicateFound] = useState(false);
  const [checkingDuplicates, setCheckingDuplicates] = useState(true);

  useEffect(() => {
    fetch('/api/projects')
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const posibleDuplicado = data.projects.some((p: any) =>
            p.nombreProyecto?.toLowerCase().trim() === formData.proyecto?.toLowerCase().trim()
          );
          setDuplicateFound(posibleDuplicado);
        }
      })
      .finally(() => setCheckingDuplicates(false));
  }, []);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.emailContacto || '');
  const areaCoherente = formData.areaM2 > 0 && formData.areaM2 <= 10000;
  const fechaCoherente = formData.fechaRequeridaDias > 0 && formData.fechaRequeridaDias <= 365;

  const checks = [
    {
      id: 'completitud',
      title: 'Completitud',
      desc: '¿Faltan campos obligatorios? Cliente, ciudad, área, superficie y color deben estar definidos.',
      passed: Boolean(formData.cliente && formData.ciudad && formData.areaM2 > 0 && formData.superficie && formData.color),
      severity: 'success'
    },
    {
      id: 'formato',
      title: 'Formato',
      desc: `Correo de contacto ${emailValido ? 'con formato válido' : 'con formato INVÁLIDO'}, área numérica, fecha requerida numérica.`,
      passed: emailValido && typeof formData.areaM2 === 'number' && typeof formData.fechaRequeridaDias === 'number',
      severity: emailValido ? 'success' : 'warning'
    },
    {
      id: 'coherencia',
      title: 'Coherencia',
      desc: `Área (${formData.areaM2} m²) y plazo (${formData.fechaRequeridaDias} días) dentro de rangos lógicos de obra.`,
      passed: areaCoherente && fechaCoherente,
      severity: (areaCoherente && fechaCoherente) ? 'success' : 'warning'
    },
    {
      id: 'duplicidad',
      title: 'Duplicidad',
      desc: checkingDuplicates
        ? 'Verificando contra tus proyectos existentes...'
        : duplicateFound
          ? 'Ya existe un proyecto con este mismo nombre en tu cuenta.'
          : 'No se encontraron proyectos duplicados con el mismo nombre.',
      passed: !checkingDuplicates && !duplicateFound,
      severity: duplicateFound ? 'warning' : 'success'
    },
    {
      id: 'trazabilidad',
      title: 'Trazabilidad',
      desc: `Origen: ${formData.canalOrigen || 'web_portal'} • Capturado: ${new Date().toLocaleString('es-CO')}`,
      passed: formData.consentimientoDatos,
      severity: 'success'
    }
  ];

  const passedCount = checks.filter(c => c.passed).length;
  const validationScore = Math.round((passedCount / checks.length) * 1000) / 10;
  const isValidating = checkingDuplicates;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-cyan-950 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Entregable 2 del MVP — Validación Automática</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Control de Calidad & Reglas de Integridad
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Filtro automático para asegurar que el dato sea veraz, completo y consistente antes de alimentar la IA y el motor técnico.
            </p>
          </div>

          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-center min-w-[140px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Score de Calidad</span>
            <span className="text-2xl font-extrabold text-cyan-400 font-mono">
              {isValidating ? '...' : `${validationScore}%`}
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold block mt-0.5">● Apto para IA</span>
          </div>
        </div>
      </div>

      {/* Regla de Oro Callout Card */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-5 shadow-sm flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-md shadow-amber-500/30 font-black text-lg">
          🏆
        </div>
        <div>
          <h3 className="text-sm font-bold text-amber-950">
            Regla de Oro de ColorLink
          </h3>
          <p className="text-xs text-amber-900/90 mt-0.5 leading-relaxed">
            "Primero capturar datos confiables, luego validar automáticamente, y solo después usar IA para interpretar información no estructurada."
          </p>
        </div>
      </div>

      {/* Trazabilidad ID Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">ID Único de Proyecto Asignado</span>
            <div className="flex items-center gap-2 mt-1">
              <Fingerprint className="w-5 h-5 text-cyan-600" />
              <span className="text-lg font-mono font-extrabold text-slate-900 tracking-wide">
                {formData.id || 'CLK-PRJ-2026-MED-085'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Estructura Validada en Memoria
            </span>
          </div>
        </div>

        {/* Checks Table */}
        {/* Checks Table */}
        <div className="mt-5 space-y-3">
          {checks.map((c) => (
            <div
              key={c.id}
              className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${c.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                  {c.passed ? <CheckCircle2 className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{c.desc}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${c.passed ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                {c.passed ? 'Aprobado' : 'Atención'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBackToCapture}
          className="px-5 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Editar Captura
        </button>

        <button
          id="btn-proceed-to-ai"
          type="button"
          onClick={onProceedToAi}
          className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center gap-2 cursor-pointer transition-all"
        >
          <span>Avanzar a Clasificación con IA (Gemini)</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
