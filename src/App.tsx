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

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_SAMPLE_PROJECT);
  const [aiResult, setAiResult] = useState<AiDiagnosisResult | null>(null);
  const [calculation, setCalculation] = useState<CalculationBreakdown>(SAMPLE_CALCULATION);
  
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

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUser(DEMO_PROFILES.cliente);
  };

  const handleLoadSampleCase = () => {
    setFormData(INITIAL_SAMPLE_PROJECT);
    updateCalculationForArea(85.0);
    setActiveTab('captura');
  };

  const handleAdvisorUpdateProject = (updated: ProjectFormData) => {
    setFormData(updated);
    updateCalculationForArea(updated.areaM2, updated.descuentoAsesorPct || 0);
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
            onBackToCapture={() => setActiveTab('captura')}
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
          />
        )}

        {/* Technical Engine & Quotation */}
        {activeTab === 'motor_tecnico' && (
          <TechnicalEngineStep
            formData={formData}
            aiResult={aiResult}
            calculation={calculation}
            onOpenPdfModal={() => setIsPdfModalOpen(true)}
            onProceedToPipeline={() => setActiveTab('trazabilidad_arquitectura')}
            onBackToAi={() => setActiveTab('ia_clasificacion')}
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
