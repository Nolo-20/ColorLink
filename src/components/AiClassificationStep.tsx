import React, { useState, useEffect, useRef } from 'react';
import { ProjectFormData, AiDiagnosisResult } from '../types';
import { Sparkles, Cpu, AlertTriangle, CheckCircle2, ArrowRight, UserCheck, RefreshCw, XCircle } from 'lucide-react';

interface AiClassificationStepProps {
  formData: ProjectFormData;
  aiResult: AiDiagnosisResult | null;
  setAiResult: React.Dispatch<React.SetStateAction<AiDiagnosisResult | null>>;
  onProceedToTechnicalEngine: () => void;
  onBackToValidation: () => void;
  onGoFixPhoto?: () => void;
}

type Resultado = AiDiagnosisResult & { imagen_coherente?: boolean; imagen_observacion?: string };

/** Huella de los datos que se analizaron: si el cliente cambia el proyecto, el diagnóstico anterior ya no sirve. */
const huellaDe = (f: ProjectFormData) =>
  JSON.stringify([f.cliente, f.ciudad, f.proyecto, f.areaM2, f.superficie, f.ambiente, f.condiciones, f.color, f.descripcion, f.fotos[0]?.id || '']);
let ultimaHuella = '';

const MOTOR_REGLAS = 'colorlink-expert-engine';

export const AiClassificationStep: React.FC<AiClassificationStepProps> = ({
  formData,
  aiResult,
  setAiResult,
  onProceedToTechnicalEngine,
  onBackToValidation,
  onGoFixPhoto
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const enCurso = useRef(false);
  const montado = useRef(true);
  useEffect(() => { montado.current = true; return () => { montado.current = false; }; }, []);

  const runAiClassification = async () => {
    if (enCurso.current) return;
    enCurso.current = true;
    setIsLoading(true);
    setAiError(null);
    const huella = huellaDe(formData);
    try {
      const response = await fetch('/api/classify-project', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cliente: formData.cliente,
          ciudad: formData.ciudad,
          proyecto: formData.proyecto,
          area: formData.areaM2,
          superficie: formData.superficie,
          condicion: formData.condiciones,
          color: formData.color,
          fechaRequerida: `${formData.fechaRequeridaDias} días`,
          descripcion: formData.descripcion,
          ambiente: formData.ambiente,
          imageBase64: (formData.fotos[0] as any)?.base64 || null
        })
      });
      const json = await response.json().catch(() => ({}));
      if (!montado.current) return;
      if (json.success && json.data && typeof json.data === 'object') {
        setAiResult({ ...json.data, source: json.source });
        ultimaHuella = huella;
      } else {
        setAiResult(null);
        setAiError(json.error || 'No se pudo generar el diagnóstico.');
      }
    } catch {
      if (!montado.current) return;
      setAiResult(null);
      setAiError('No hay conexión con el servidor. Revisa tu conexión e intenta de nuevo.');
    } finally {
      enCurso.current = false;
      if (montado.current) setIsLoading(false);
    }
  };

  useEffect(() => {
    // Diagnóstico nuevo si no hay uno o si es de otro proyecto / de otros datos
    if (!aiResult || ultimaHuella !== huellaDe(formData)) runAiClassification();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = aiResult as Resultado | null;
  const esReglas = r?.source === MOTOR_REGLAS;
  const confianza = Number(r?.nivel_confianza_ia_pct);
  const manos = Number(r?.manos_recomendadas);
  const pasos = r?.sistema_recomendado || ({} as Resultado['sistema_recomendado']);
  const observaciones = Array.isArray(r?.observaciones_tecnicas) ? r!.observaciones_tecnicas : [];
  const severidadColor = r?.severidad === 'Alta' ? 'bg-red-500' : r?.severidad === 'Media' ? 'bg-amber-500' : 'bg-emerald-500';

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-indigo-950 rounded-2xl p-5 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-300 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Paso 3 de 4 · Diagnóstico preliminar</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Diagnóstico de la superficie</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              A partir de tus datos y la foto sugerimos cómo preparar y pintar la superficie. Es orientativo: tu asesor lo confirma.
            </p>
          </div>
          <button
            id="btn-re-run-ai"
            type="button"
            onClick={runAiClassification}
            disabled={isLoading}
            className="px-4 py-2.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-xs rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span>{isLoading ? 'Analizando…' : 'Volver a analizar'}</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-4 shadow-sm" aria-live="polite">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center animate-pulse">
            <Cpu className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Analizando tu proyecto…</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">Revisamos la superficie, el ambiente, el estado que marcaste y la foto. Puede tardar unos segundos.</p>
        </div>
      ) : aiError ? (
        <div role="alert" className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center space-y-3">
          <XCircle className="w-8 h-8 text-red-500 mx-auto" />
          <p className="text-sm font-bold text-red-800">{aiError}</p>
          <button type="button" onClick={runAiClassification} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer">
            Intentar de nuevo
          </button>
        </div>
      ) : r ? (
        <div className="space-y-6">
          {esReglas && (
            <p className="text-[11px] text-slate-600 bg-slate-100 border border-slate-200 rounded-xl px-3 py-2">
              El análisis con IA no estuvo disponible; este es un diagnóstico automático basado en reglas a partir de los datos que marcaste (no analiza la foto).
            </p>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Severidad</span>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${severidadColor}`}></span>
                <span className="text-base font-extrabold text-slate-900">{r.severidad || '—'}</span>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Complejidad</span>
              <span className="text-base font-extrabold text-indigo-700 block mt-1">{r.complejidad || '—'}</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Confianza</span>
              <span className="text-base font-extrabold text-emerald-600 font-mono block mt-1">
                {!esReglas && Number.isFinite(confianza) ? `${Math.round(confianza)}%` : '—'}
              </span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Visita técnica</span>
              {r.requiere_visita_especialista_human_in_the_loop ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full mt-1 border border-amber-200">
                  <UserCheck className="w-3.5 h-3.5" /> Recomendada
                </span>
              ) : (
                <span className="text-xs font-bold text-slate-600 block mt-1.5">No es necesaria</span>
              )}
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="space-y-1 min-w-0">
                <h3 className="text-sm font-bold text-slate-900">Diagnóstico</h3>
                <p className="text-xs text-slate-700 leading-relaxed font-medium break-words">{r.diagnostico_patologia || '—'}</p>
                {r.resumen_ejecutivo && <p className="text-[11px] text-slate-500 pt-1 break-words"><strong>Resumen:</strong> {r.resumen_ejecutivo}</p>}
              </div>
            </div>
          </div>

          {r.imagen_coherente === false && (
            <div className="bg-red-50 border border-red-300 rounded-2xl p-5 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <h4 className="text-sm font-bold text-red-950">La foto no parece coincidir con lo que describiste</h4>
                {r.imagen_observacion && <p className="text-xs text-red-800">{r.imagen_observacion}</p>}
                {onGoFixPhoto && (
                  <button type="button" onClick={onGoFixPhoto} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl cursor-pointer">
                    Cambiar la foto
                  </button>
                )}
              </div>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-4 mb-4 border-b border-slate-100">
              <div className="min-w-0">
                <h3 className="text-base font-bold text-slate-900">Sistema recomendado</h3>
                {r.linea_producto_sugerida && <p className="text-xs text-slate-500">Línea sugerida: <span className="font-semibold text-purple-700">{r.linea_producto_sugerida}</span></p>}
              </div>
              {Number.isFinite(manos) && manos > 0 && (
                <span className="text-xs font-bold px-3 py-1 bg-purple-50 text-purple-700 border border-purple-200 rounded-lg">
                  {manos} {manos === 1 ? 'mano' : 'manos'} de acabado
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { n: 1, t: 'Preparación', v: pasos.paso1_preparacion, c: 'bg-slate-50 border-slate-200', b: 'bg-slate-900' },
                { n: 2, t: 'Imprimante / sellador', v: pasos.paso2_imprimante_sellador, c: 'bg-teal-50/70 border-teal-200', b: 'bg-teal-600' },
                { n: 3, t: 'Acabado', v: pasos.paso3_acabado, c: 'bg-cyan-50/70 border-cyan-200', b: 'bg-cyan-600' }
              ].map(p => (
                <div key={p.n} className={`p-4 rounded-xl border space-y-2 ${p.c}`}>
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-full text-white flex items-center justify-center text-xs font-bold ${p.b}`}>{p.n}</span>
                    <h4 className="text-xs font-bold text-slate-900">{p.t}</h4>
                  </div>
                  <p className="text-[11px] text-slate-700 leading-relaxed break-words">{p.v || '—'}</p>
                </div>
              ))}
            </div>

            {observaciones.length > 0 && (
              <div className="mt-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Recomendaciones de aplicación
                </h4>
                <ul className="space-y-1.5">
                  {observaciones.map((obs, idx) => (
                    <li key={idx} className="text-xs text-slate-600 flex items-start gap-2">
                      <span className="text-purple-600 font-bold">•</span>
                      <span className="break-words">{String(obs)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      ) : null}

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToValidation}
          className="px-5 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Volver a la revisión
        </button>
        <button
          id="btn-proceed-to-engine"
          type="button"
          onClick={onProceedToTechnicalEngine}
          disabled={isLoading || !r || !!aiError}
          className="px-6 py-3.5 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-500 hover:to-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Ver materiales y estimado</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
