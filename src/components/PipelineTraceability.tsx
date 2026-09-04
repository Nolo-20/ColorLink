import React, { useState } from 'react';
import { ProjectFormData, CalculationBreakdown, AiDiagnosisResult } from '../types';
import { 
  Network, 
  Database, 
  Cpu, 
  Layers, 
  Copy, 
  Check, 
  Code2, 
  Terminal, 
  Activity, 
  Server, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Search,
  Filter,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface PipelineTraceabilityProps {
  formData: ProjectFormData;
  aiResult: AiDiagnosisResult | null;
  calculation: CalculationBreakdown;
  onBackToEngine?: () => void;
}

export const PipelineTraceability: React.FC<PipelineTraceabilityProps> = ({
  formData,
  aiResult,
  calculation
}) => {
  const [activeTab, setActiveTab] = useState<'monitoreo_salud' | 'logs_vivo' | 'pipeline_flujo' | 'esquema_bd' | 'json_api'>('monitoreo_salud');
  const [copiedJson, setCopiedJson] = useState(false);
  const [logFilter, setLogFilter] = useState<'ALL' | 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR'>('ALL');
  const [logSearch, setLogSearch] = useState('');

  // Realistic live system logs
  const systemLogs = [
    { id: 'LOG-109', time: '18:42:15', level: 'SUCCESS', tag: 'AUTH', msg: `Usuario autenticado exitosamente: ${formData.emailContacto || 'proyectos@constructorahorizonte.com.co'} (Rol: cliente, Empresa vinculada: Constructora Horizonte S.A.S.)` },
    { id: 'LOG-108', time: '18:42:08', level: 'INFO', tag: 'DB', msg: 'Consulta relacional ejecutada: SELECT * FROM proyectos_pintura WHERE cliente_id = "USR-CLI-4028" (Tiempo: 12ms)' },
    { id: 'LOG-107', time: '18:41:50', level: 'SUCCESS', tag: 'ENGINE', msg: `Cálculo de dosificación ejecutado: ${formData.areaM2}m² -> 1 Cuñete (5G) + 2 Galones (1G) • $${calculation.costoEstimadoCOP.totalCOP.toLocaleString('es-CO')} COP` },
    { id: 'LOG-106', time: '18:41:42', level: 'INFO', tag: 'IA_GEMINI', msg: 'Prompt estructurado enviado a Gemini 2.5 Flash. Latencia de inferencia: 384ms (Confianza: 96.5%)' },
    { id: 'LOG-105', time: '18:41:30', level: 'INFO', tag: 'TINTOMETRIA', msg: 'Lote activo LOT-2026-MED-08A verificado en Bodega Itagüí. Stock: 38 cuñetes, 124 galones.' },
    { id: 'LOG-104', time: '18:40:12', level: 'SUCCESS', tag: 'NTC_5828', msg: 'Regla de calidad aprobada: Sustrato con humedad <12%, masilla elastomérica prescrita.' },
    { id: 'LOG-103', time: '18:38:05', level: 'WARN', tag: 'STOCK_MONITOR', msg: 'Bodega Rionegro: Lote LOT-2026-RIO-03B al 22% de capacidad. Alerta de reabastecimiento programada.' },
    { id: 'LOG-102', time: '18:35:10', level: 'INFO', tag: 'SERVER', msg: 'Express API Server heartbeat 200 OK • Memory RSS: 142MB • Node.js v20.18 LTS' }
  ];

  const filteredLogs = systemLogs.filter(log => {
    const matchesLevel = logFilter === 'ALL' || log.level === logFilter;
    const matchesSearch = !logSearch.trim() || 
      log.msg.toLowerCase().includes(logSearch.toLowerCase()) || 
      log.tag.toLowerCase().includes(logSearch.toLowerCase());
    return matchesLevel && matchesSearch;
  });

  const pipelineStages = [
    { num: 1, name: 'Captura Cliente', status: 'completed', desc: 'Datos de obra, m², tipo de sustrato y color' },
    { num: 2, name: 'Validación de Integridad', status: 'completed', desc: 'Filtro anti-duplicados y verificación de NIT empresa' },
    { num: 3, name: 'Clasificación con IA (Gemini)', status: 'completed', desc: 'Diagnóstico patológico y recomendación de acabado' },
    { num: 4, name: 'Motor Técnico de Cuñetes', status: 'completed', desc: 'Dosificación exacta: 1 Cuñete (5G) + 2 Galones (1G)' },
    { num: 5, name: 'Disponibilidad de Bodega', status: 'completed', desc: 'Lote activo asignado en Centro Logístico Itagüí' },
    { num: 6, name: 'Generación de Cotización & PDF', status: 'completed', desc: 'Costos con IVA y ficha técnica NTC 5828' },
    { num: 7, name: 'Despacho a Obra', status: 'active', desc: 'Integración logística para entrega en menos de 24h' }
  ];

  const relationalTables = [
    {
      name: 'empresas_clientes',
      description: 'Empresas constructoras y contratistas habilitados para compras corporativas',
      pk: 'nit VARCHAR(20) PRIMARY KEY',
      fields: ['nit VARCHAR(20) PRIMARY KEY', 'razon_social VARCHAR(255)', 'direccion_despacho VARCHAR(255)', 'ciudad VARCHAR(100)', 'telefono VARCHAR(50)', 'estado_credito VARCHAR(50)']
    },
    {
      name: 'usuarios_roles',
      description: 'Cuentas registradas con control de acceso basado en roles (RBAC)',
      pk: 'id UUID PRIMARY KEY',
      fields: ['id UUID PRIMARY KEY', 'email VARCHAR(255) UNIQUE', 'nombre VARCHAR(255)', 'rol VARCHAR(50) (cliente|asesor|calidad|admin)', 'empresa_nit VARCHAR(20) REFERENCES empresas_clientes(nit)', 'created_at TIMESTAMP']
    },
    {
      name: 'proyectos_obras',
      description: 'Obras solicitadas con metrajes, especificaciones y estado comercial',
      pk: 'id VARCHAR(50) (CLK-PRJ-...)',
      fields: ['id VARCHAR(50) PRIMARY KEY', 'cliente_id UUID REFERENCES usuarios_roles(id)', 'nombre_obra VARCHAR(255)', 'area_m2 NUMERIC(10,2)', 'sustrato VARCHAR(50)', 'ambiente VARCHAR(50)', 'color_solicitado VARCHAR(100)', 'estado VARCHAR(50)']
    },
    {
      name: 'cotizaciones_materiales',
      description: 'Desglose exacto de cuñetes, galones, imprimante, bodega y precio total con IVA',
      pk: 'id UUID PRIMARY KEY',
      fields: ['id UUID PRIMARY KEY', 'proyecto_id VARCHAR(50) REFERENCES proyectos_obras(id)', 'cunetes_5gal INT', 'galones_1gal INT', 'imprimante_cunetes INT', 'bodega_asignada VARCHAR(50)', 'lote_tintometria VARCHAR(50)', 'total_cop NUMERIC(12,2)']
    }
  ];

  const fullJsonPayload = {
    sistema: "COLORLINK Pro Enterprise Paint Platform",
    ambiente: "Producción - Valle de Aburrá",
    timestamp: new Date().toISOString(),
    servidor: {
      uptime: "99.99%",
      puerto: 3000,
      protocolo: "Express REST + Vite"
    },
    cliente: {
      email: formData.emailContacto || "proyectos@constructorahorizonte.com.co",
      empresa: formData.cliente || "Constructora Horizonte S.A.S.",
      ciudad: formData.ciudad || "Medellín"
    },
    proyecto_activo: {
      codigo: formData.id || "CLK-PRJ-2026-MED-085",
      nombre: formData.proyecto || "Torre Residencial Poblado - Fachada Sur",
      area_m2: formData.areaM2 || 85,
      superficie: formData.superficie || "revoque",
      dosificacion: {
        cunetes_5gal: calculation.cunetesPintura5Gal || 1,
        galones_1gal: calculation.galonesPintura1Gal || 2,
        total_cop_con_iva: calculation.costoEstimadoCOP.totalCOP || 826931
      }
    }
  };

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(fullJsonPayload, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 space-y-6">
      
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
            <span>Centro de Monitoreo & Logs • Rol Ingeniero / Administrador</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Estado de la Plataforma & Pipelines
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
            Monitoreo en tiempo real de servicios API, base de datos relacional, modelos de IA y trazabilidad de eventos de usuario.
          </p>
        </div>

        {/* Live System Status Badges */}
        <div className="flex items-center gap-2">
          <div className="px-3 py-2 bg-slate-900 rounded-xl border border-emerald-500/40 flex items-center gap-2 text-xs text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span>Sistemas 100% Operacionales</span>
          </div>
        </div>
      </div>

      {/* 2. SYSTEM HEALTH METRICS CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-black shrink-0">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Servidor API</span>
            <span className="text-sm font-black text-slate-900 block">Express (Puerto 3000)</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 99.99% Uptime
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-black shrink-0">
            <Database className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Base de Datos</span>
            <span className="text-sm font-black text-slate-900 block">PostgreSQL Sync</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> 12ms Latencia
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black shrink-0">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Motor de IA</span>
            <span className="text-sm font-black text-slate-900 block">Gemini Flash</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> ~380ms Inferencia
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 shadow-xs border border-slate-200 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-black shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Tintometría</span>
            <span className="text-sm font-black text-slate-900 block">3 Lotes Activos</span>
            <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Bodegas Medellín
            </span>
          </div>
        </div>
      </div>

      {/* 3. SUB-TABS NAVIGATION FOR ENGINEER */}
      <div className="flex gap-2 bg-slate-200/80 p-1.5 rounded-2xl w-max max-w-full overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveTab('monitoreo_salud')}
          className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'monitoreo_salud' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-emerald-600" />
          <span>Salud & Pipeline</span>
        </button>

        <button
          onClick={() => setActiveTab('logs_vivo')}
          className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'logs_vivo' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-3.5 h-3.5 text-indigo-600" />
          <span>Logs en Vivo ({filteredLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('esquema_bd')}
          className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'esquema_bd' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Database className="w-3.5 h-3.5 text-blue-600" />
          <span>Arquitectura BD</span>
        </button>

        <button
          onClick={() => setActiveTab('json_api')}
          className={`py-2 px-3.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'json_api' ? 'bg-white text-slate-900 shadow-xs font-extrabold' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Code2 className="w-3.5 h-3.5 text-slate-700" />
          <span>Payload JSON / API</span>
        </button>
      </div>

      {/* 4. VIEW: SALUD & PIPELINE */}
      {activeTab === 'monitoreo_salud' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Pipeline stages */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 shadow-xs border border-slate-200 space-y-4">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Network className="w-4 h-4 text-emerald-600" />
              <span>Pipeline de Ejecución Automática (End-to-End)</span>
            </h3>

            <div className="space-y-2.5">
              {pipelineStages.map((stg) => (
                <div 
                  key={stg.num}
                  className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-200/80 flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                      stg.status === 'completed' ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {stg.num}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{stg.name}</h4>
                      <p className="text-[11px] text-slate-500">{stg.desc}</p>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    stg.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-blue-50 text-blue-700 border-blue-200'
                  }`}>
                    {stg.status === 'completed' ? 'OK / Verificado' : 'En Cola'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats sidebar */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-slate-900 text-white rounded-3xl p-5 shadow-xs border border-slate-800 space-y-3">
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                Infraestructura
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Ambiente</span>
                  <span className="font-mono text-emerald-400">Cloud Run Containers</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Nginx Reverse Proxy</span>
                  <span className="font-mono text-emerald-400">Port 3000 Active</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-800">
                  <span className="text-slate-400">Motor Tintométrico</span>
                  <span className="font-mono text-white">Datacolor / Corob</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-400">Norma Técnica</span>
                  <span className="font-mono text-emerald-400">NTC 5828 & 1335</span>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 text-emerald-950 rounded-3xl p-5 border border-emerald-200 space-y-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800">Seguridad & RBAC</span>
              <p className="text-xs text-emerald-900 leading-relaxed">
                Control de roles segregado: Los clientes solo tienen acceso a cotizaciones y proyectos sin ruido de desarrollo.
              </p>
            </div>
          </div>

        </div>
      )}

      {/* 5. VIEW: LOGS EN VIVO */}
      {activeTab === 'logs_vivo' && (
        <div className="bg-slate-950 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 text-white space-y-4 font-mono">
          
          {/* Logs Toolbar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Search className="w-4 h-4 text-slate-400 shrink-0" />
              <input
                type="text"
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                placeholder="Filtrar logs por mensaje o tag..."
                className="bg-slate-900 text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 w-full sm:w-64"
              />
            </div>

            {/* Level filters */}
            <div className="flex items-center gap-1.5 text-[10px]">
              {(['ALL', 'SUCCESS', 'INFO', 'WARN'] as const).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLogFilter(lvl)}
                  className={`px-2.5 py-1 rounded-md cursor-pointer transition-all ${
                    logFilter === lvl ? 'bg-emerald-500 text-slate-950 font-black' : 'bg-slate-900 text-slate-400 hover:text-white'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Terminal stream */}
          <div className="space-y-2 text-xs max-h-[460px] overflow-y-auto pr-2">
            {filteredLogs.map((log) => (
              <div 
                key={log.id} 
                className="p-2.5 bg-slate-900/90 rounded-xl border border-slate-800/80 flex flex-col sm:flex-row sm:items-center gap-2 hover:bg-slate-800/60 transition-colors"
              >
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 text-[10px]">{log.time}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                    log.level === 'SUCCESS' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                    log.level === 'WARN' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                    'bg-blue-950 text-blue-400 border border-blue-800'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-[10px] text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded font-bold">
                    [{log.tag}]
                  </span>
                </div>
                <span className="text-slate-200 text-xs break-all sm:break-normal">
                  {log.msg}
                </span>
              </div>
            ))}
          </div>

        </div>
      )}

      {/* 6. VIEW: ESQUEMA BASE DE DATOS */}
      {activeTab === 'esquema_bd' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {relationalTables.map((tbl) => (
            <div 
              key={tbl.name}
              className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-600" />
                  <h4 className="font-extrabold text-sm text-slate-900 font-mono">{tbl.name}</h4>
                </div>
                <span className="text-[10px] font-mono bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-200">
                  {tbl.pk}
                </span>
              </div>

              <p className="text-xs text-slate-500">{tbl.description}</p>

              <div className="p-3 bg-slate-900 rounded-xl text-slate-300 font-mono text-[11px] space-y-1">
                {tbl.fields.map((f, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <span className="text-emerald-400">•</span>
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 7. VIEW: JSON API PAYLOAD */}
      {activeTab === 'json_api' && (
        <div className="bg-slate-950 rounded-3xl p-5 sm:p-6 shadow-xl border border-slate-800 text-white space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-emerald-400" />
              <h3 className="font-bold text-xs text-slate-300 uppercase tracking-wider">
                Payload JSON Estructurado para ERP / CRM
              </h3>
            </div>
            <button
              onClick={handleCopyJson}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl border border-slate-700 cursor-pointer flex items-center gap-1.5 transition-colors"
            >
              {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedJson ? 'Copiado' : 'Copiar JSON'}</span>
            </button>
          </div>

          <pre className="p-4 bg-slate-900 rounded-2xl text-emerald-400 font-mono text-xs overflow-x-auto max-h-96 border border-slate-800">
            {JSON.stringify(fullJsonPayload, null, 2)}
          </pre>
        </div>
      )}

    </div>
  );
};
