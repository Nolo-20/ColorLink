import React, { useState } from 'react';
import { ActiveTab, ProjectFormData, UserProfile, AiDiagnosisResult, CalculationBreakdown } from './types';
import { INITIAL_USER, INITIAL_SAMPLE_PROJECT, SAMPLE_CALCULATION, DEMO_PROFILES } from './data/mockData';
import { Navbar } from './components/Navbar';
import { ModernLoginScreen } from './components/ModernLoginScreen';
import { RoleDashboard } from './components/RoleDashboard';
import { AdvisorProjectManager } from './components/AdvisorProjectManager';
import { QualityReviewModule } from './components/QualityReviewModule';
import { InventoryModule } from './components/InventoryModule';
import { SmartCaptureForm } from './components/SmartCaptureForm';
import { ClientProjectsManager } from './components/ClientProjectsManager';
import { AutoValidationStep } from './components/AutoValidationStep';
import { AiClassificationStep } from './components/AiClassificationStep';
import { TechnicalEngineStep } from './components/TechnicalEngineStep';
import { PipelineTraceability } from './components/PipelineTraceability';
import { TechnicalPdfModal } from './components/TechnicalPdfModal';
import { VirtualAssistantModal } from './components/VirtualAssistantModal';
import { WelcomeLanding } from './components/WelcomeLanding';
import { ProfileModal } from './components/ProfileModal';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_SAMPLE_PROJECT);
  const [aiResult, setAiResult] = useState<AiDiagnosisResult | null>(null);
  const [calculation, setCalculation] = useState<CalculationBreakdown>(SAMPLE_CALCULATION);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Al cargar la app, revisa si ya existe una sesión válida (cookie httpOnly)
  // en vez de asumir siempre que el usuario está deslogueado.
  React.useEffect(() => {
    fetch('/api/auth/profile')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data?.success) {
          setUser(data.user);
          setIsLoggedIn(true);
        }
      })
      .finally(() => setIsCheckingSession(false));
  }, []);

  // Modals
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);

  // Recalculate materials dynamically when area changes
  const updateCalculationForArea = (area: number, discountPct: number = 0) => {
    const areaEfectiva = area * 2; // 2 manos
    const rendimiento = 28.5; // m2/galon
    const desperdicio = 0.10;
    const exactGal = (areaEfectiva / rendimiento) * (1 + desperdicio);
    const cunetes5G = Math.floor(exactGal / 5);
    const galones1G = Math.ceil(exactGal % 5);

    const cunetesImprimante = Math.ceil((area / 35) / 5) || 1;
    const galonesMasilla = Math.max(1, Math.ceil(area * 0.025));

    let costoPintura = (cunetes5G * 485000) + (galones1G * 115000);
    if (discountPct > 0) {
      costoPintura = costoPintura * (1 - discountPct / 100);
    }
    const costoImprimante = cunetesImprimante * 320000;
    const costoMasilla = galonesMasilla * 88000;
    const costoAccesorios = 180300;
    const subtotal = costoPintura + costoImprimante + costoMasilla + costoAccesorios;
    const iva19 = subtotal * 0.19;

    setCalculation({
      ...calculation,
      areaM2: area,
      manos: 2,
      areaEfectivaTotalM2: areaEfectiva,
      galonesPinturaExactos: parseFloat(exactGal.toFixed(2)),
      cunetesPintura5Gal: cunetes5G,
      galonesPintura1Gal: galones1G,
      cunetesImprimante5Gal: cunetesImprimante,
      galonesMasillaElastomerica: galonesMasilla,
      costoEstimadoCOP: {
        pinturaAcabado: Math.round(costoPintura),
        imprimanteSellador: costoImprimante,
        masillaFisuras: costoMasilla,
        accesorios: costoAccesorios,
        subtotal: Math.round(subtotal),
        iva19: Math.round(iva19),
        totalCOP: Math.round(subtotal + iva19)
      }
    });
  };

  const handleLoginSuccess = (authenticatedUser: UserProfile) => {
    setUser(authenticatedUser);
    setIsLoggedIn(true);

    // Set landing tab based on user role
    if (authenticatedUser.role === 'asesor') {
      setActiveTab('proyectos_asesor');
    } else if (authenticatedUser.role === 'calidad') {
      setActiveTab('calidad_revision');
    } else if (authenticatedUser.role === 'administrador') {
      setActiveTab('inventario');
    } else {
      setActiveTab('dashboard');
    }

    if (authenticatedUser.company) {
      setFormData(prev => ({
        ...prev,
        cliente: authenticatedUser.company || prev.cliente,
        emailContacto: authenticatedUser.email || prev.emailContacto,
        telefonoContacto: authenticatedUser.phone || prev.telefonoContacto,
        ciudad: authenticatedUser.city || prev.ciudad
      }));
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Error al cerrar sesión:', err);
    }
    setIsLoggedIn(false);
    setUser(DEMO_PROFILES.cliente);
  };

  const handleLoadSampleCase = () => {
    setFormData(INITIAL_SAMPLE_PROJECT);
    updateCalculationForArea(85.0);
    setActiveTab('captura');
  };

  const handleStartNewAiQuote = () => {
    setFormData(prev => ({
      ...prev,
      id: '',
      proyecto: '',
      areaM2: 0,
      superficie: '',
      ambiente: '',
      condiciones: [],
      color: '',
      colorHex: '#ffffff',
      fotos: [],
      descripcion: '',
      consentimientoDatos: false,
      fechaRequeridaDias: 15,
      cliente: user.company || '',
      ciudad: user.city || 'Medellín',
      emailContacto: user.email || '',
      telefonoContacto: user.phone || ''
    }));
    setAiResult(null);
    setActiveTab('nueva_cotizacion_ia');
  };

  const handleAdvisorUpdateProject = (updated: ProjectFormData) => {
    setFormData(updated);
    updateCalculationForArea(updated.areaM2, updated.descuentoAsesorPct || 0);
  };

  const [isSavingProject, setIsSavingProject] = useState(false);
  const [saveProjectError, setSaveProjectError] = useState('');

  const handleSaveProjectAndProceed = async () => {
    setIsSavingProject(true);
    setSaveProjectError('');
    try {
      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombreProyecto: formData.proyecto,
          ciudad: formData.ciudad,
          area: formData.areaM2,
          tipoSuperficie: formData.superficie,
          ambiente: formData.ambiente,
          color: formData.color,
          colorHex: formData.colorHex,
          cunetes5g: calculation.cunetesPintura5Gal,
          galones1g: calculation.galonesPintura1Gal,
          subtotal: calculation.costoEstimadoCOP.subtotal,
          iva: calculation.costoEstimadoCOP.iva19,
          total: calculation.costoEstimadoCOP.totalCOP,
          // Diagnóstico real de Gemini, si ya corrió
          diagnosticoPatologia: aiResult?.diagnostico_patologia,
          severidad: aiResult?.severidad,
          sistemaRecomendado: aiResult?.sistema_recomendado,
          manoRecomendada: aiResult?.manos_recomendadas,
          rendimientoEstimado: aiResult?.rendimiento_estimado_m2_gal,
          confianzaIaPct: aiResult?.nivel_confianza_ia_pct,
          requiereVisitaHumana: aiResult?.requiere_visita_especialista_human_in_the_loop
        })
      });
      const data = await response.json();

      if (!data.success) {
        setSaveProjectError(data.error || 'No se pudo guardar el proyecto');
        return;
      }

      // Guarda el ID real del proyecto para que el resto de la app lo referencie
      setFormData(prev => ({ ...prev, id: data.project.proyectoId }));
      setActiveTab('captura');
    } catch (err) {
      setSaveProjectError('Error de conexión al guardar el proyecto');
    } finally {
      setIsSavingProject(false);
    }
  };

  const handleQualityVerdict = (verdict: { aprobado: boolean; perito: string; fecha: string; notas: string }) => {
    setFormData(prev => ({
      ...prev,
      dictamenCalidad: {
        aprobado: verdict.aprobado,
        perito: verdict.perito,
        fechaRevision: verdict.fecha,
        observacionSustrato: verdict.notas
      },
      estadoPipeline: verdict.aprobado ? 'aprobado_calidad' : 'revision_asesor'
    }));
  };

  // If not logged in, display the clean, unified login & registration screen
  // Mientras se verifica si ya hay sesión activa, no mostrar login ni la app todavía
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <span className="text-slate-400 text-sm">Cargando...</span>
      </div>
    );
  }

  // If not logged in, display the clean, unified login & registration screen
  if (!isLoggedIn) {
    return (
      <ModernLoginScreen
        onLoginSuccess={handleLoginSuccess}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">

      {/* Top Dynamic Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLoadSampleCase={handleLoadSampleCase}
        hasValidatedData={Boolean(formData.id)}
        onLogout={handleLogout}
        onOpenVirtualAssistant={() => setIsAssistantModalOpen(true)}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onStartNewAiQuote={handleStartNewAiQuote}

      />

      {/* Main View Router */}
      <main className="flex-1 pb-16">

        {/* Role Dashboard Cockpit */}
        {activeTab === 'dashboard' && (
          <RoleDashboard
            user={user}
            formData={formData}
            calculation={calculation}
            setActiveTab={setActiveTab}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onOpenAssistant={() => setIsAssistantModalOpen(true)}
            onStartNewAiQuote={handleStartNewAiQuote}
          />
        )}

        {activeTab === 'nueva_cotizacion_ia' && (
          <SmartCaptureForm
            formData={formData}
            setFormData={setFormData}
            user={user}
            onSubmitToValidation={() => setActiveTab('validacion')}
            onLoadHorizontePreset={() => {
              setFormData(INITIAL_SAMPLE_PROJECT);
              updateCalculationForArea(85.0);
            }}
          />
        )}

        {/* Asesor Dedicated Workspace */}
        {activeTab === 'proyectos_asesor' && (
          <AdvisorProjectManager
            user={user}
            activeProject={formData}
            onUpdateProject={handleAdvisorUpdateProject}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
          />
        )}

        {/* Calidad Dedicated Inspection */}
        {activeTab === 'calidad_revision' && (
          <QualityReviewModule
            user={user}
            formData={formData}
            onUpdateQualityVerdict={handleQualityVerdict}
          />
        )}

        {/* Inventory Module (SQL Bodegas + Productos) */}
        {activeTab === 'inventario' && (
          <InventoryModule
            user={user}
          />
        )}

        {/* Standard Project Capture & Client Projects (Clean & Commercial) */}
        {activeTab === 'captura' && (
          <ClientProjectsManager
            formData={formData}
            setFormData={(newVal) => {
              setFormData(newVal);
              if (typeof newVal === 'function') {
                const updated = newVal(formData);
                updateCalculationForArea(updated.areaM2, updated.descuentoAsesorPct || 0);
              } else {
                updateCalculationForArea(newVal.areaM2, newVal.descuentoAsesorPct || 0);
              }
            }}
            calculation={calculation}
            user={user}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onOpenAssistant={() => setIsAssistantModalOpen(true)}
          />
        )}

        {/* Auto Validation Step */}
        {activeTab === 'validacion' && (
          <AutoValidationStep
            formData={formData}
            onProceedToAi={() => setActiveTab('ia_clasificacion')}
            onBackToCapture={() => setActiveTab('nueva_cotizacion_ia')}
          />
        )}

        {/* AI Classifier (Gemini) */}
        {activeTab === 'ia_clasificacion' && (
          <AiClassificationStep
            formData={formData}
            aiResult={aiResult}
            setAiResult={setAiResult}
            onProceedToTechnicalEngine={() => setActiveTab('motor_tecnico')}
            onBackToValidation={() => setActiveTab('validacion')}
            onGoFixPhoto={() => setActiveTab('nueva_cotizacion_ia')}
          />
        )}

        {/* Technical Engine & Quotation */}
        {activeTab === 'motor_tecnico' && (
          <TechnicalEngineStep
            formData={formData}
            aiResult={aiResult}
            calculation={calculation}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onProceedToPipeline={handleSaveProjectAndProceed}
            onBackToAi={() => setActiveTab('ia_clasificacion')}
            isSaving={isSavingProject}
            saveError={saveProjectError}
          />
        )}

        {/* Pipeline Traceability & ER Schema */}
        {activeTab === 'trazabilidad_arquitectura' && (
          <PipelineTraceability
            formData={formData}
            aiResult={aiResult}
            calculation={calculation}
            onBackToEngine={() => setActiveTab('motor_tecnico')}
          />
        )}

        {/* Welcome Landing */}
        {activeTab === 'inicio' && (
          <WelcomeLanding
            onStartProject={() => setActiveTab('captura')}
            onGoToLogin={() => setActiveTab('dashboard')}
            onLoadDemo={handleLoadSampleCase}
          />
        )}

      </main>

      {/* Printable / Viewable PDF Modal */}
      <TechnicalPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        formData={formData}
        calculation={calculation}
        aiResult={aiResult}
        user={user}
      />

      {/* Max Virtual Assistant Modal */}
      <VirtualAssistantModal
        isOpen={isAssistantModalOpen}
        onClose={() => setIsAssistantModalOpen(false)}
        user={user}
        formData={formData}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={user}
        onProfileUpdated={(updated) => setUser(updated)}
      />

      {/* Persistent Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">COLOR<span className="text-emerald-400">LINK</span></span>
            <span>• Ecosistema Unificado de Pinturas & Recubrimientos</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Bodegas: Itagüí • Guayabal • Rionegro</span>
            <span className="text-slate-600">|</span>
            <span>Despacho a Obra: 24 Horas</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
