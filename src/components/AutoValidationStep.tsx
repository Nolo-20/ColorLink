import React, { useState, useEffect } from 'react';
import { ProjectFormData } from '../types';
import { CheckCircle2, AlertCircle, ShieldCheck, ArrowRight, XCircle } from 'lucide-react';
import { SUPERFICIE_LABEL, AMBIENTE_LABEL } from './ClientProjectsManager';
import { datosProyecto, validarFormulario, esPdf } from '../utils/proyectoCaptura';

interface AutoValidationStepProps {
  formData: ProjectFormData;
  onProceedToAi: () => void;
  onBackToCapture: () => void;
}

type Nivel = 'ok' | 'aviso' | 'error' | 'cargando';

export const AutoValidationStep: React.FC<AutoValidationStepProps> = ({
  formData,
  onProceedToAi,
  onBackToCapture
}) => {
  const [coincidencias, setCoincidencias] = useState<Array<{ nombreProyecto: string; motivos: string[]; ciudad: string | null; area: number | null }>>([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(true);
  const [duplicadosError, setDuplicadosError] = useState(false);

  // Duplicidad: el servidor compara con los proyectos del cliente (nombre, ciudad, área, fechas y descripción)
  useEffect(() => {
    let cancel = false;
    setCheckingDuplicates(true);
    fetch('/api/projects/check-duplicates', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosProyecto(formData))
    })
      .then(res => res.json())
      .then(data => {
        if (cancel) return;
        if (data.success && Array.isArray(data.coincidencias)) setCoincidencias(data.coincidencias);
        else setDuplicadosError(true);
      })
      .catch(() => { if (!cancel) setDuplicadosError(true); })
      .finally(() => { if (!cancel) setCheckingDuplicates(false); });
    return () => { cancel = true; };
  }, [formData.proyecto, formData.ciudad, formData.areaM2, formData.fechaRequeridaDias, formData.descripcion]);

  // Mismas reglas que aplica el servidor al guardar
  const v = validarFormulario(formData);
  const NOMBRE_CAMPO: Record<string, string> = {
    nombreProyecto: 'nombre del proyecto', ciudad: 'ciudad', tipoProyecto: 'tipo de proyecto', area: 'área',
    tipoSuperficie: 'superficie', ambiente: 'ambiente', condiciones: 'estado de la superficie', fechaRequerida: 'fecha requerida',
    descripcion: 'descripción', consentimientoDatos: 'autorización de datos', colorHex: 'colores', canalOrigen: 'canal'
  };
  const faltantes = [
    !(formData.cliente || '').trim() && 'cliente',
    !formData.color && 'color',
    ...Object.keys(v.errores).filter(k => k !== 'consentimientoDatos').map(k => NOMBRE_CAMPO[k] || k)
  ].filter(Boolean) as string[];
  const primerError = Object.entries(v.errores).find(([k]) => k !== 'consentimientoDatos')?.[1];

  const checks: Array<{ id: string; title: string; desc: string; nivel: Nivel }> = [
    {
      id: 'completitud',
      title: 'Completitud y formato',
      desc: faltantes.length
        ? `Revisa: ${faltantes.join(', ')}.${primerError ? ` ${primerError}` : ''}`
        : `Todos los campos obligatorios están completos y con el formato correcto. Datos completos al ${v.completitudPct}%.`,
      nivel: faltantes.length ? 'error' : 'ok'
    },
    {
      id: 'coherencia',
      title: 'Coherencia',
      desc: v.advertencias.length
        ? v.advertencias.join(' ')
        : `${formData.areaM2.toLocaleString('es-CO')} m², ${SUPERFICIE_LABEL[formData.superficie] || formData.superficie} en ${(AMBIENTE_LABEL[formData.ambiente] || formData.ambiente).toLowerCase()}, para dentro de ${formData.fechaRequeridaDias} días.`,
      nivel: v.advertencias.length ? 'aviso' : 'ok'
    },
    {
      id: 'foto',
      title: 'Evidencias',
      desc: formData.fotos.length
        ? (() => {
            const docs = formData.fotos.filter(f => esPdf(f.url)).length;
            const fotos = formData.fotos.length - docs;
            return `${fotos} foto(s)${docs ? ` y ${docs} documento(s) PDF` : ''}; la IA los revisa todos y lee el texto que contengan.`;
          })()
        : 'Sin fotos: el diagnóstico será menos preciso. Puedes continuar o volver a agregar una.',
      nivel: formData.fotos.length ? 'ok' : 'aviso'
    },
    {
      id: 'duplicidad',
      title: 'Duplicidad',
      desc: checkingDuplicates
        ? 'Comparando con tus proyectos…'
        : duplicadosError
          ? 'No pudimos revisar tus proyectos anteriores. Puedes continuar.'
          : coincidencias.length
            ? `Se parece a "${coincidencias[0].nombreProyecto}" (${coincidencias[0].motivos.join(', ')}). Si es el mismo, escríbele a tu asesor desde ese proyecto en vez de crear otro.`
            : 'No encontramos un proyecto parecido.',
      nivel: checkingDuplicates ? 'cargando' : coincidencias.length || duplicadosError ? 'aviso' : 'ok'
    },
    {
      id: 'consentimiento',
      title: 'Autorización y trazabilidad',
      desc: formData.consentimientoDatos
        ? 'Autorizaste el tratamiento de datos. Se registra la fecha, tu usuario y el canal (portal web).'
        : 'Debes autorizar el tratamiento de datos.',
      nivel: formData.consentimientoDatos ? 'ok' : 'error'
    }
  ];

  const bloqueado = checks.some(c => c.nivel === 'error');
  const okCount = checks.filter(c => c.nivel === 'ok').length;

  const estilo: Record<Nivel, { icono: React.ReactNode; badge: string; texto: string }> = {
    ok: { icono: <CheckCircle2 className="w-4 h-4" />, badge: 'text-emerald-700 bg-emerald-100', texto: 'Correcto' },
    aviso: { icono: <AlertCircle className="w-4 h-4" />, badge: 'text-amber-700 bg-amber-100', texto: 'Revisar' },
    error: { icono: <XCircle className="w-4 h-4" />, badge: 'text-red-700 bg-red-100', texto: 'Falta' },
    cargando: { icono: <AlertCircle className="w-4 h-4 animate-pulse" />, badge: 'text-slate-600 bg-slate-100', texto: 'Revisando' }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-cyan-950 rounded-2xl p-5 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Paso 2 de 4 · Revisión de datos</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Revisamos tu información</h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Antes del diagnóstico confirmamos que los datos estén completos y sean coherentes.
            </p>
          </div>
          <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-4 text-center min-w-[140px]">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Revisiones correctas</span>
            <span className="text-2xl font-extrabold text-cyan-400 font-mono">{okCount}/{checks.length}</span>
            <span className={`text-[10px] font-semibold block mt-0.5 ${bloqueado ? 'text-red-300' : 'text-emerald-400'}`}>
              {bloqueado ? 'Corrige lo marcado' : 'Listo para continuar'}
            </span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="pb-4 border-b border-slate-100 text-xs text-slate-600 space-y-1">
          <p className="text-sm font-bold text-slate-900 break-words">{formData.proyecto || 'Proyecto sin nombre'}</p>
          <p>
            {[formData.cliente, formData.ciudad, SUPERFICIE_LABEL[formData.superficie], AMBIENTE_LABEL[formData.ambiente], formData.color].filter(Boolean).join(' · ') || '—'}
          </p>
          <p className="text-[11px] text-slate-400">El código del proyecto se asigna al guardarlo.</p>
        </div>

        <ul className="mt-5 space-y-3">
          {checks.map((c) => (
            <li key={c.id} className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/60 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${estilo[c.nivel].badge}`}>{estilo[c.nivel].icono}</div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900">{c.title}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5 break-words">{c.desc}</p>
                </div>
              </div>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${estilo[c.nivel].badge}`}>{estilo[c.nivel].texto}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onBackToCapture}
          className="px-5 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
        >
          Editar datos
        </button>
        <button
          id="btn-proceed-to-ai"
          type="button"
          onClick={onProceedToAi}
          disabled={bloqueado || checkingDuplicates}
          className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl shadow-lg shadow-purple-600/30 flex items-center justify-center gap-2 cursor-pointer transition-all"
        >
          <span>Continuar al diagnóstico</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
