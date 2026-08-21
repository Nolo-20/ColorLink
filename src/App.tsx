import React, { useState } from 'react';
import { ActiveTab, ProjectFormData, UserProfile, AiDiagnosisResult, CalculationBreakdown } from './types';
import { INITIAL_USER, INITIAL_SAMPLE_PROJECT, SAMPLE_CALCULATION } from './data/mockData';
import { Navbar } from './components/Navbar';
import { AuthModule } from './components/AuthModule';
import { SmartCaptureForm } from './components/SmartCaptureForm';
import { AutoValidationStep } from './components/AutoValidationStep';
import { AiClassificationStep } from './components/AiClassificationStep';
import { TechnicalEngineStep } from './components/TechnicalEngineStep';
import { PipelineTraceability } from './components/PipelineTraceability';
import { TechnicalPdfModal } from './components/TechnicalPdfModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('captura');
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [formData, setFormData] = useState<ProjectFormData>(INITIAL_SAMPLE_PROJECT);
  const [aiResult, setAiResult] = useState<AiDiagnosisResult | null>(null);
  const [calculation, setCalculation] = useState<CalculationBreakdown>(SAMPLE_CALCULATION);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);

  // Recalculate materials dynamically when area changes
  const updateCalculationForArea = (area: number) => {
    const areaEfectiva = area * 2; // 2 manos
    const rendimiento = 28.5; // m2/galon
    const desperdicio = 0.10;
    const exactGal = (areaEfectiva / rendimiento) * (1 + desperdicio);
    const cunetes5G = Math.floor(exactGal / 5);
    const galones1G = Math.ceil(exactGal % 5);

    const cunetesImprimante = Math.ceil((area / 35) / 5) || 1;
    const galonesMasilla = Math.max(1, Math.ceil(area * 0.025));

    const costoPintura = (cunetes5G * 485000) + (galones1G * 115000);
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
        pinturaAcabado: costoPintura,
        imprimanteSellador: costoImprimante,
        masillaFisuras: costoMasilla,
        accesorios: costoAccesorios,
        subtotal: subtotal,
        iva19: Math.round(iva19),
        totalCOP: Math.round(subtotal + iva19)
      }
    });
  };

  const handleLoadSampleCase = () => {
    setFormData(INITIAL_SAMPLE_PROJECT);
    updateCalculationForArea(85.0);
    setActiveTab('captura');
  };

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLoadSampleCase={handleLoadSampleCase}
        hasValidatedData={Boolean(formData.id)}
      />

      {/* Main View Container */}
      <main className="flex-1 pb-16">
        {activeTab === 'registro' && (
          <AuthModule
            user={user}
            setUser={setUser}
            onContinueToCapture={() => setActiveTab('captura')}
          />
        )}

        {activeTab === 'captura' && (
          <SmartCaptureForm
            formData={formData}
            setFormData={(newVal) => {
              setFormData(newVal);
              if (typeof newVal === 'function') {
                const updated = newVal(formData);
                updateCalculationForArea(updated.areaM2);
              } else {
                updateCalculationForArea(newVal.areaM2);
              }
            }}
            user={user}
            onSubmitToValidation={() => setActiveTab('validacion')}
            onLoadHorizontePreset={handleLoadSampleCase}
          />
        )}

        {activeTab === 'validacion' && (
          <AutoValidationStep
            formData={formData}
            onProceedToAi={() => setActiveTab('ia_clasificacion')}
            onBackToCapture={() => setActiveTab('captura')}
          />
        )}

        {activeTab === 'ia_clasificacion' && (
          <AiClassificationStep
            formData={formData}
            aiResult={aiResult}
            setAiResult={setAiResult}
            onProceedToTechnicalEngine={() => setActiveTab('motor_tecnico')}
            onBackToValidation={() => setActiveTab('validacion')}
          />
        )}

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

        {activeTab === 'trazabilidad_arquitectura' && (
          <PipelineTraceability
            formData={formData}
            aiResult={aiResult}
            calculation={calculation}
            onBackToEngine={() => setActiveTab('motor_tecnico')}
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

      {/* Persistent Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-slate-400 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-wider">COLOR<span className="text-cyan-400">LINK</span></span>
            <span>• Ecosistema de Automatización de Pintura & Recubrimientos</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Stack: FastAPI + Supabase + n8n + Gemini</span>
            <span className="text-slate-600">|</span>
            <span>Caso: Medellín (Constructora Horizonte)</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
