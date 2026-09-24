import React, { useState, useEffect, useRef } from 'react';
import { UserProfile, ProjectFormData } from '../types';
import { 
  Bot, 
  X, 
  Send, 
  RefreshCw
} from 'lucide-react';

interface VirtualAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  formData: ProjectFormData;
  onOpenCalculator?: () => void;
  onOpenBranchLocator?: () => void;
  onNavigateCategory?: (category: 'hogar' | 'construccion' | 'automotriz' | 'industrial' | 'herramientas') => void;
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
      text: `¡Hola ${user.firstName || user.name}! Soy tu **Asistente Virtual Robot de ColorLink**, especialista en pinturas, recubrimientos técnicos y cálculo de rendimiento para obra.\n\n¿En qué puedo orientarte hoy? Puedes preguntarme cuántos galones o cuñetes necesitas (dime tus m²), qué pintura usar según tu problema de pared o consultar sedes de despacho en Medellín.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isTyping, isOpen]);

  if (!isOpen) return null;

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

      // Check if user specified m2 / square meters
      const m2Match = query.match(/(\d+(\.\d+)?)\s*(m2|m²|metros|metro)/i) || 
                      (query.match(/para\s*(\d+)/i) ? query.match(/para\s*(\d+)/i) : null);

      if (m2Match) {
        const areaNum = parseFloat(m2Match[1]);
        if (areaNum > 0) {
          const areaEfectiva = areaNum * 2;
          const rendimiento = 28.5;
          const desperdicio = 0.10;
          const exactGal = (areaEfectiva / rendimiento) * (1 + desperdicio);
          const cunetes5G = Math.floor(exactGal / 5);
          const galones1G = Math.ceil(exactGal % 5);

          const costoAprox = (cunetes5G * 485000) + (galones1G * 128000);

          botReply = `📊 **Cálculo de Pintura Oficial ColorLink para ${areaNum} m²**:\n\n` +
            `• **Área a 2 manos**: ${areaEfectiva} m² totales.\n` +
            `• **Rendimiento oficial**: 28.5 m²/galón (con 10% de desperdicio por absorción del muro).\n` +
            `• **Volumen exacto**: **${exactGal.toFixed(2)} galones**.\n\n` +
            `🎯 **Presentación sugerida para no desperdiciar ni pagar de más**:\n` +
            (cunetes5G > 0 ? `• **${cunetes5G} Cuñete(s) (5 Gal)**\n` : '') +
            `• **${galones1G} Galón(es) individuales de 3.785 L**.\n\n` +
            `💰 **Costo estimado aproximado**: $${costoAprox.toLocaleString('es-CO')} COP.\n` +
            `¿Deseas calcular otra superficie o consultar algún producto específico?`;
        }
      } else if (qLower.includes('85') || qLower.includes('rendimiento') || qLower.includes('cuñete')) {
        botReply = `Para **${formData.proyecto || 'Fachada de 85 m²'}** aplicamos la fórmula oficial ColorLink:\n\n• **Área Efectiva a 2 Manos**: 170 m².\n• **Rendimiento Koraza Tech**: 28.5 m²/gal.\n• **Factor de Desperdicio**: 10%.\n• **Resultado Óptimo**: **6.56 Galones** = **1 Cuñete (5 Gal)** + **2 Galones individuales**. Así la obra no presenta sobrantes ni faltantes.`;
      } else if (qLower.includes('humedad') || qLower.includes('sellador') || qLower.includes('fisura') || qLower.includes('filtrac')) {
        botReply = `Para paredes con **humedad capilar, eflorescencia salina y fisuras**, el sistema certificado NTC es:\n\n1. **Sellado de Fisuras**: Masilla Acrílica Elastómerica en grietas hasta 2mm.\n2. **Neutralización**: 1 mano de *Imprimante Sellador Antialcalino Hidrófugo* ColorLink para bloquear el paso de humedad.\n3. **Capa Impermeable**: 2 manos de *Koraza Sol & Lluvia 100% Acrílica* con barrera contra rayos UV y hongos.\n\n¿Quieres que revisemos qué presentación te conviene más?`;
      } else if (qLower.includes('piso') || qLower.includes('taller') || qLower.includes('parqueadero') || qLower.includes('epox')) {
        botReply = `Para pisos de alto impacto mecánico y tránsito vehicular pesado recomendamos:\n\n• **ColorLink Epox Floor 100% Sólidos**:\n  - Resistencia a aceites, solventes, derrames de frenos y montacargas.\n  - Relación de mezcla 4:1 con catalizador poliamida.\n  - Acabado brillante espejo, antideslizante con agregado de cuarzo si se requiere.\n\nPuedes revisar la ficha técnica completa en la sección **Industrial**.`;
      } else if (qLower.includes('carro') || qLower.includes('moto') || qLower.includes('automot') || qLower.includes('poliuretano')) {
        botReply = `Para repintado automotriz contamos con la línea **ColorLink Auto 2K**:\n\n• **Esmalte Poliuretano 2K** de alto brillo directo o sistema bicapa poliéster.\n• **Barniz Transparente Clear 4:1** con secado al tacto en 40 min y protección UV de alta durabilidad.\n• Presentaciones en Kit con catalizador y aerosoles con válvula en abanico pro.`;
      } else if (qLower.includes('tienda') || qLower.includes('sede') || qLower.includes('medellin') || qLower.includes('itagui') || qLower.includes('donde')) {
        botReply = `📍 **Puntos de Venta & Retiro Express ColorLink en Medellín y Valle de Aburrá**:\n\n` +
          `1. **Centro Logístico Regional Itagüí**: Autopista Sur # 65-12 (Retiro express en 30 min y tintometría computarizada).\n` +
          `2. **Sede Principal Guayabal**: Cra 52 # 14-85, Medellín.\n` +
          `3. **Punto Express Bello**: Cra 50 # 38-12, Parque Fabricato.\n` +
          `4. **Sede Envigado**: Calle 37 Sur # 43-20, cerca al parque principal.\n\n` +
          `🚚 Hacemos despacho gratis a obra en Medellín y Área Metropolitana por compras mayores a $150.000 COP.`;
      } else if (qLower.includes('lavable') || qLower.includes('interior') || qLower.includes('mancha') || qLower.includes('hogar')) {
        botReply = `Para interiores con alto roce o presencia de niños y mascotas, la opción número 1 es **Viniltex Ultralavable**:\n\n• Resiste más de 1.000 ciclos de lavado con esponja y detergente sin desgastar el color.\n• Acabado mate sedoso anti-reflejo.\n• Libre de plomo y mercurio, bajo olor (puedes habitar el espacio el mismo día).`;
      } else {
        botReply = `Con gusto te asesoro sobre "${query}". En ColorLink contamos con laboratorio técnico, tintometría computarizada con más de 2.000 tonos disponibles y asesoría para contratistas y propietarios de vivienda.\n\n¿Deseas calcular metros cuadrados, consultar especificaciones técnicas o revisar disponibilidad en bodega?`;
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
    }, 450);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-slate-900 rounded-3xl max-w-xl w-full h-[600px] max-h-[90vh] shadow-2xl border border-slate-700/80 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-white font-sans">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-[#0A1832] via-[#0F244E] to-[#0A1832] p-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative w-11 h-11 rounded-2xl bg-gradient-to-tr from-slate-950 to-blue-950 border border-cyan-400/50 flex items-center justify-center font-black shadow-lg">
              <svg viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-6 h-6 text-cyan-300">
                <line x1="18" y1="4" x2="18" y2="8" stroke="#38BDF8" strokeWidth="2" strokeLinecap="round" />
                <circle cx="18" cy="3" r="2" fill="#10B981" />
                <rect x="7" y="8" width="22" height="18" rx="6" fill="#0F172A" stroke="#38BDF8" strokeWidth="1.8" />
                <rect x="10" y="12" width="16" height="7" rx="3" fill="#020617" />
                <circle cx="14" cy="15.5" r="1.8" fill="#10B981" />
                <circle cx="22" cy="15.5" r="1.8" fill="#10B981" />
                <path d="M13 22H23" stroke="#38BDF8" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span className="absolute top-0 right-0 w-3 h-3 bg-emerald-400 border-2 border-slate-950 rounded-full animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm text-white">Robot Asesor ColorLink</h3>
                <span className="text-[9px] font-black bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30 uppercase tracking-wider">
                  En Línea
                </span>
              </div>
              <p className="text-[11px] text-slate-300">Asistencia Técnica en Pinturas & Obras</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                setMessages([
                  {
                    id: 'm-init',
                    sender: 'assistant',
                    text: `¡Hola ${user.firstName || user.name}! ¿En qué proyecto o pintura te puedo orientar hoy?`,
                    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  }
                ]);
              }}
              title="Reiniciar conversación"
              className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white text-[10px] font-bold cursor-pointer transition-colors"
            >
              Reiniciar
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center font-bold text-sm cursor-pointer transition-colors"
              title="Cerrar ventana"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Chat History Area */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-[#081224] text-xs">
          {messages.map((msg) => {
            const isBot = msg.sender === 'assistant';
            return (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 border border-cyan-400/40 text-cyan-300 flex items-center justify-center shrink-0 shadow-xs mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                    isBot 
                      ? 'bg-slate-900 text-slate-100 border border-slate-800/90 shadow-md' 
                      : 'bg-emerald-600 text-white font-medium rounded-br-none shadow-md'
                  }`}
                >
                  <div className="whitespace-pre-line text-xs font-normal">
                    {msg.text}
                  </div>
                  <span className={`text-[9px] block mt-1.5 font-mono ${isBot ? 'text-slate-500' : 'text-emerald-200'} text-right`}>
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isTyping && (
            <div className="flex items-center gap-2 text-slate-300 text-xs italic bg-slate-900/90 p-2.5 rounded-xl w-max border border-slate-800">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>El Asesor está escribiendo...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
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
            placeholder="Escribe tu consulta aquí (ej: cuánta pintura para 50 m², humedad en pared...)"
            className="flex-1 px-4 py-2.5 bg-slate-900 text-white placeholder-slate-500 text-xs rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 text-slate-950 font-black text-xs rounded-xl shadow cursor-pointer flex items-center gap-1.5 transition-all active:scale-95"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Enviar</span>
          </button>
        </form>

      </div>
    </div>
  );
};
