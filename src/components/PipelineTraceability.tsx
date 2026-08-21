import React, { useState } from 'react';
import { ProjectFormData, CalculationBreakdown, AiDiagnosisResult } from '../types';
import { 
  Network, 
  Database, 
  Cpu, 
  Layers, 
  Workflow, 
  Copy, 
  Check, 
  Code2, 
  ArrowRight, 
  Terminal, 
  GitBranch, 
  BarChart3, 
  ShieldCheck,
  Truck,
  CheckCircle2,
  Sparkles,
  Bot
} from 'lucide-react';

interface PipelineTraceabilityProps {
  formData: ProjectFormData;
  aiResult: AiDiagnosisResult | null;
  calculation: CalculationBreakdown;
  onBackToEngine: () => void;
}

export const PipelineTraceability: React.FC<PipelineTraceabilityProps> = ({
  formData,
  aiResult,
  calculation,
  onBackToEngine
}) => {
  const [copiedJson, setCopiedJson] = useState(false);
  const [activeSchemaTab, setActiveSchemaTab] = useState<'pipeline' | 'supabase_schema' | 'json_payload' | 'architecture_stack'>('pipeline');

  const pipelineStages = [
    { num: 1, name: 'Captura Inteligente', status: 'completed', desc: 'Datos, fotos y requerimientos estructurados' },
    { num: 2, name: 'Validación Automática', status: 'completed', desc: 'Score de calidad 98.5% y filtro anti-duplicados' },
    { num: 3, name: 'Clasificación con IA (Gemini)', status: 'completed', desc: 'Diagnóstico patológico y sistema tricapa' },
    { num: 4, name: 'Motor Técnico', status: 'completed', desc: 'Cálculo de manos, rendimiento y 6.2 galones' },
    { num: 5, name: 'Consulta Disponibilidad', status: 'completed', desc: 'Stock confirmado en Bodega Regional Medellín' },
    { num: 6, name: 'Decisión Automatizada', status: 'completed', desc: 'Despacho directo de inventario (Lote activo)' },
    { num: 7, name: 'Presupuesto Preliminar', status: 'completed', desc: 'Cotización comercial con IVA para Constructora' },
    { num: 8, name: 'Human-in-the-Loop', status: 'active', desc: 'Especialista asignado para visita técnica previa' },
    { num: 9, name: 'Logística & Reserva', status: 'pending', desc: 'Webhook n8n reserva stock y emite guía' },
    { num: 10, name: 'Servicio & Calidad', status: 'pending', desc: 'Acompañamiento en obra y trazabilidad de lote' },
    { num: 11, name: 'Analítica & Metabase', status: 'pending', desc: 'Actualización en dashboard de KPI operacionales' }
  ];

  const supabaseTables = [
    {
      name: 'clientes',
      description: 'Registro de empresas constructoras y profesionales de pintura',
      pk: 'id (UUID)',
      fields: ['id UUID PRIMARY KEY', 'nombre_empresa VARCHAR(255)', 'email VARCHAR(255) UNIQUE', 'telefono VARCHAR(50)', 'ciudad VARCHAR(100)', 'rol VARCHAR(50)', 'created_at TIMESTAMP']
    },
    {
      name: 'proyectos_pintura',
      description: 'Toma de datos capturados del proyecto con identificador único',
      pk: 'id VARCHAR(50) (CLK-PRJ-...)',
      fields: ['id VARCHAR(50) PRIMARY KEY', 'cliente_id UUID REFERENCES clientes(id)', 'nombre_proyecto VARCHAR(255)', 'ciudad VARCHAR(100)', 'area_m2 NUMERIC(10,2)', 'superficie VARCHAR(50)', 'condicion VARCHAR(100)', 'ambiente VARCHAR(50)', 'color VARCHAR(100)', 'canal_origen VARCHAR(50)', 'fotos_urls TEXT[]', 'estado_workflow VARCHAR(50)']
    },
    {
      name: 'evaluacion_tecnica_ia',
      description: 'Diagnóstico estructurado devuelto por Gemini para auditoría técnica',
      pk: 'id UUID',
      fields: ['id UUID PRIMARY KEY', 'proyecto_id VARCHAR(50) REFERENCES proyectos_pintura(id)', 'diagnostico_patologia TEXT', 'severidad VARCHAR(20)', 'complejidad VARCHAR(20)', 'sistema_recomendado JSONB', 'linea_producto VARCHAR(100)', 'nivel_confianza NUMERIC(5,2)', 'human_in_loop BOOLEAN', 'created_at TIMESTAMP']
    },
    {
      name: 'calculo_materiales_inventario',
      description: 'Desglose exacto de galones, cuñetes, masilla, bodega asignada y cotización',
      pk: 'id UUID',
      fields: ['id UUID PRIMARY KEY', 'proyecto_id VARCHAR(50) REFERENCES proyectos_pintura(id)', 'galones_acabado NUMERIC(8,2)', 'cunetes_5gal INT', 'galones_1gal INT', 'imprimante_gal NUMERIC(8,2)', 'masilla_gal NUMERIC(8,2)', 'bodega_id VARCHAR(50)', 'lote_asignado VARCHAR(50)', 'costo_total_cop NUMERIC(12,2)']
    }
  ];

  const fullJsonPayload = {
    metadata: {
      ecosistema: "COLORLINK Smart Paint Platform",
      timestamp: new Date().toISOString(),
      canal_origen: formData.canalOrigen,
      version_api: "2.4-fastapi-supabase"
    },
    cliente: {
      id: "USR-2026-0042",
      nombre: formData.cliente,
      ciudad: formData.ciudad,
      tipo_cuenta: "constructora"
    },
    proyecto: {
      codigo_unico: formData.id || "CLK-PRJ-2026-MED-085",
      nombre: formData.proyecto,
      area_m2: formData.areaM2,
      sustrato: formData.superficie,
      ambiente: formData.ambiente,
      condiciones_patologicas: formData.condiciones,
      color_solicitado: formData.color,
      acabado: formData.acabado,
      dias_requeridos: formData.fechaRequeridaDias,
      evidencias_adjuntas_count: formData.fotos.length
    },
    validacion_calidad: {
      score_confiabilidad_pct: 98.5,
      reglas_integridad_aprobadas: true,
      duplicados_detectados: false
    },
    diagnostico_gemini_ia: aiResult || {
      diagnostico: "Humedad capilar y fisuras en concreto vertical",
      severidad: "Alta",
      complejidad: "Alta",
      confianza: 96.5
    },
    motor_tecnico_cantidades: {
      area_efectiva_2_manos_m2: formData.areaM2 * 2,
      pintura_acabado_galones: 6.56,
      dosificacion: {
        cunetes_5_galones: 1,
        galones_individuales: 2
      },
      imprimante_sellador_cunetes: 1,
      masilla_elastomerica_galones: 2,
      presupuesto_total_cop: calculation.costoEstimadoCOP.totalCOP
    },
    disponibilidad_logistica: {
      bodega: calculation.disponibilidadBodega.bodega,
      lote: calculation.disponibilidadBodega.loteActivo,
      stock_confirmado: true,
      tiempo_despacho: calculation.disponibilidadBodega.tiempoDespachoHoras
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fullJsonPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-semibold mb-2">
              <Network className="w-3.5 h-3.5" />
              <span>Arquitectura & Flujo End-to-End</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Trazabilidad del Ecosistema ColorLink
            </h1>
            <p className="text-slate-300 text-sm mt-1 max-w-xl">
              Conexión automatizada entre captura, validación, IA, inventario, n8n, FastAPI y Supabase PostgreSQL.
            </p>
          </div>

          <button
            id="btn-copy-payload-json"
            onClick={handleCopyJson}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer self-start sm:self-auto"
          >
            {copiedJson ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
            <span>{copiedJson ? '¡JSON Copiado!' : 'Copiar Payload para n8n / FastAPI'}</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2">
        {[
          { id: 'pipeline', label: 'Flujo Completo (11 Pasos)', icon: Workflow },
          { id: 'supabase_schema', label: 'Esquema Supabase (PostgreSQL)', icon: Database },
          { id: 'json_payload', label: 'Payload JSON Estructurado', icon: Code2 },
          { id: 'architecture_stack', label: 'Stack Tecnológico', icon: Layers },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeSchemaTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSchemaTab(tab.id as any)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                isActive
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: PIPELINE STAGES */}
      {activeSchemaTab === 'pipeline' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Pipeline de Automatización Operacional</h3>
            <span className="text-xs text-slate-500 font-mono">Proyecto: {formData.id || 'CLK-PRJ-2026-MED-085'}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {pipelineStages.map((stage) => (
              <div
                key={stage.num}
                className={`p-3.5 rounded-xl border flex items-start gap-3 transition-all ${
                  stage.status === 'completed'
                    ? 'bg-emerald-50/60 border-emerald-200'
                    : stage.status === 'active'
                    ? 'bg-amber-50/80 border-amber-300 ring-2 ring-amber-300/30'
                    : 'bg-slate-50 border-slate-200 opacity-75'
                }`}
              >
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                  stage.status === 'completed'
                    ? 'bg-emerald-600 text-white'
                    : stage.status === 'active'
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-slate-300 text-slate-700'
                }`}>
                  {stage.num}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-bold text-slate-900">{stage.name}</h4>
                    {stage.status === 'completed' && (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Completado</span>
                    )}
                    {stage.status === 'active' && (
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">En Curso</span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-0.5">{stage.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: SUPABASE SCHEMA */}
      {activeSchemaTab === 'supabase_schema' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-white p-4 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-400" />
              <span>Base de Datos Supabase (PostgreSQL 15) — Estructura Normalizada para ColorLink</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">4 Tablas Principales</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {supabaseTables.map((table) => (
              <div key={table.name} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-700">tabla: {table.name}</span>
                  </div>
                  <span className="text-[10px] font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                    PK: {table.pk}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">{table.description}</p>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <ul className="space-y-1 font-mono text-[10px] text-slate-700">
                    {table.fields.map((f, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <span className="text-indigo-500">•</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: JSON PAYLOAD */}
      {activeSchemaTab === 'json_payload' && (
        <div className="bg-slate-950 text-slate-100 rounded-2xl p-6 font-mono text-xs shadow-xl border border-slate-800">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <span className="text-cyan-400 font-bold">Payload API listo para Webhook n8n / FastAPI</span>
            <button
              onClick={handleCopyJson}
              className="flex items-center gap-1.5 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copiado' : 'Copiar'}</span>
            </button>
          </div>
          <pre className="overflow-x-auto text-[11px] leading-relaxed text-slate-300">
            {JSON.stringify(fullJsonPayload, null, 2)}
          </pre>
        </div>
      )}

      {/* TAB 4: ARCHITECTURE STACK */}
      {activeSchemaTab === 'architecture_stack' && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <h3 className="text-base font-bold text-slate-900">Arquitectura de Integración ColorLink</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
              <span className="text-2xl block mb-1">⚡</span>
              <p className="text-xs font-bold text-slate-900">Automatización</p>
              <p className="text-[11px] text-orange-700 font-semibold mt-0.5">n8n Workflow Engine</p>
            </div>
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200">
              <span className="text-2xl block mb-1">🗄️</span>
              <p className="text-xs font-bold text-slate-900">Base de Datos</p>
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">Supabase PostgreSQL</p>
            </div>
            <div className="p-4 rounded-xl bg-teal-50 border border-teal-200">
              <span className="text-2xl block mb-1">🚀</span>
              <p className="text-xs font-bold text-slate-900">Backend API</p>
              <p className="text-[11px] text-teal-700 font-semibold mt-0.5">FastAPI Python</p>
            </div>
            <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
              <span className="text-2xl block mb-1">📊</span>
              <p className="text-xs font-bold text-slate-900">Dashboard</p>
              <p className="text-[11px] text-blue-700 font-semibold mt-0.5">Metabase / Looker</p>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Nav */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={onBackToEngine}
          className="px-5 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          Volver a Motor Técnico
        </button>
      </div>
    </div>
  );
};
