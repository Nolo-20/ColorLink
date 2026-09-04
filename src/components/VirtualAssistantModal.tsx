import React, { useState } from 'react';
import { UserProfile, ProjectFormData } from '../types';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  HelpCircle, 
  CheckCircle2, 
  Layers, 
  Cpu, 
  ShieldCheck, 
  Truck, 
  RefreshCw
} from 'lucide-react';

interface VirtualAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  formData: ProjectFormData;
}

interface ChatMessage {
  id: string;
  sender: 'assistant' | 'user';
  text: string;
  timestamp: string;
}

export const VirtualAssistantModal: React.FC<VirtualAssistantModalProps> = ({
  isOpen,
  onClose,
  user,
  formData
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: `¡Hola ${user.firstName || user.name}! Soy tu **Asistente Virtual** de ColorLink, especialista en pinturas, recubrimientos y cálculo de obra. ¿En qué puedo orientarte hoy sobre rendimientos, patologías de sustrato o disponibilidad en bodegas de Medellín?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    '¿Cómo se calcula el rendimiento para una fachada de 85 m²?',
    '¿Qué sellador debo aplicar si el muro tiene humedad y microfisuras?',
    '¿En qué bodega de Medellín hay stock disponible para despacho en 24h?',
    '¿Qué diferencia hay entre el rol de Cliente y el de Asesor?'
  ];

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || inputText;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    setTimeout(() => {
      let botReply = '';
      const qLower = query.toLowerCase();

      if (qLower.includes('85') || qLower.includes('rendimiento') || qLower.includes('cuñete')) {
        botReply = `Para **${formData.proyecto || 'Fachada de 85 m²'}** aplicamos la fórmula oficial ColorLink:\n\n• **Área Efectiva a 2 Manos**: 170 m².\n• **Rendimiento Koraza Tech**: 28.5 m²/gal.\n• **Factor de Desperdicio**: 10%.\n• **Resultado Óptimo**: **6.56 Galones** = **1 Cuñete (5 Gal)** + **2 Galones individuales**. Así la obra no presenta sobrantes ni faltantes.`;
      } else if (qLower.includes('humedad') || qLower.includes('sellador') || qLower.includes('fisura')) {
        botReply = `Para la presencia de **humedad capilar y microfisuras** te recomendamos el sistema tricapa certificado:\n\n1. **Preparación**: Masilla Acrílica Elastómerica en grietas hasta 2mm.\n2. **Sellado**: 1 mano de *Imprimante Sellador Antialcalino e Hidrófugo* para neutralizar sales.\n3. **Acabado**: 2 manos de *ColorLink Koraza Tech 100% Acrílica* con protección antihongos y UV.`;
      } else if (qLower.includes('bodega') || qLower.includes('despacho') || qLower.includes('medellin') || qLower.includes('itagui')) {
        botReply = `Tenemos disponibilidad inmediata en el **Centro Logístico Regional Antioquia (Itagüí / Guayabal)** con el lote de tintometría **LOT-2026-MED-08A** activo (38 cuñetes y 124 galones). Los pedidos confirmados antes de las 3:00 p.m. se despachan a obra en menos de 24 horas.`;
      } else if (qLower.includes('rol') || qLower.includes('cliente') || qLower.includes('asesor') || qLower.includes('calidad')) {
        botReply = `Los roles en ColorLink se configuran automáticamente según la cuenta:\n\n• **Cliente**: Captura proyectos de pintura, calcula cuñetes, descarga fichas PDF y vincula obligatoriamente su *Empresa_Cliente* (NIT y dirección de despacho).\n• **Asesor**: Revisa todos los proyectos de clientes, ajusta metrajes y autoriza descuentos comerciales.\n• **Calidad**: Emite conceptos periciales sobre humedad y sustratos bajo norma NTC 5828.\n• **Administrador / Bodega**: Controla existencias, lotes y despachos en Itagüí y Guayabal.`;
      } else {
        botReply = `Excelente consulta sobre "${query}". En ColorLink contamos con tintometría computarizada, laboratorio de peritaje y despacho directo en el Valle de Aburrá. Si requieres visita técnica de campo, tu asesor asignado Juan David Osorio puede programarla hoy mismo.`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: `b-${Date.now()}`,
          sender: 'assistant',
          text: botReply,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsTyping(false);
    }, 550);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-3xl max-w-lg w-full h-[600px] shadow-2xl border border-slate-800 flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200 text-white">
        
        {/* Header */}
        <div className="bg-slate-950 p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500 text-slate-950 flex items-center justify-center font-black shadow-md">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">Asistente Virtual</h3>
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  ColorLink
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Asesoría Técnica en Recubrimientos & Pinturas</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-[#0B1528]">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shrink-0 text-xs font-black shadow-xs">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${isBot ? 'bg-slate-900 text-slate-100 border border-slate-800 shadow-md' : 'bg-emerald-600 text-slate-950 font-medium rounded-br-none shadow-md'}`}
                >
                  <p className="whitespace-pre-line">{msg.text}</p>
                  <span className={`text-[9px] block mt-1 ${isBot ? 'text-slate-400' : 'text-emerald-950 font-bold'} text-right`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-300 text-xs italic bg-slate-900 p-2.5 rounded-xl w-max border border-slate-800">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>Redactando recomendación técnica...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-2.5 bg-slate-950 border-t border-slate-800 shrink-0">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Preguntas Frecuentes:</span>
          <div className="flex gap-1.5 overflow-x-auto pb-1">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(qp)}
                className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 text-[10px] font-semibold rounded-lg border border-slate-800 whitespace-nowrap cursor-pointer transition-colors shrink-0"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Pregúntale al Asistente Virtual sobre pinturas, cuñetes o despachos..."
            className="flex-1 px-3.5 py-2 bg-slate-900 text-white placeholder-slate-500 text-xs rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>

      </div>
    </div>
  );
};
