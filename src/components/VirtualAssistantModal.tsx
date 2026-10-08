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

// Formato mínimo para las respuestas: **negrita** y viñetas "- " o "* "
const renderInline = (text: string) =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') && part.length > 4
      ? <strong key={i} className="font-bold">{part.slice(2, -2)}</strong>
      : <React.Fragment key={i}>{part.replace(/\*\*/g, '')}</React.Fragment>
  );

const FormattedMessage: React.FC<{ text: string }> = ({ text }) => {
  const lines = text.split('\n');
  const blocks: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => {
    if (bullets.length) {
      blocks.push(
        <ul key={`ul-${blocks.length}`} className="list-disc pl-4 space-y-1">
          {bullets.map((b, i) => <li key={i}>{renderInline(b)}</li>)}
        </ul>
      );
      bullets = [];
    }
  };
  lines.forEach((raw) => {
    const line = raw.trim();
    const m = line.match(/^(?:[-*•]|\d+\.)\s+(.*)$/);
    if (m) { if (m[1].replace(/\*/g, '').trim()) bullets.push(m[1]); return; }
    flush();
    if (line) blocks.push(<p key={`p-${blocks.length}`}>{renderInline(line)}</p>);
  });
  flush();
  return <div className="space-y-2">{blocks}</div>;
};

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
      text: `¡Hola ${user.firstName || user.name}! Soy tu **Asistente Virtual** de ColorLink, especialista en pinturas, recubrimientos y cálculo de obra. ¿En qué puedo orientarte hoy sobre productos, rendimientos, patologías de sustrato o tus pedidos y proyectos?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  if (!isOpen) return null;

  const quickPrompts = [
    '¿Cuántos galones necesito para pintar 85 m² a 2 manos?',
    '¿Qué sellador debo aplicar si el muro tiene humedad y microfisuras?',
    '¿Cómo retiro mi pedido en tienda?',
    '¿Cómo funciona la cotización de un proyecto?'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputText).trim();
    if (!query || isTyping) return;

    const hora = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg: ChatMessage = { id: `u-${Date.now()}`, sender: 'user', text: query, timestamp: hora() };
    const historial = messages.slice(1).map(m => ({ sender: m.sender, text: m.text })); // sin el saludo inicial

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsTyping(true);

    let reply = 'No pude conectarme con el asistente. Revisa tu conexión e intenta de nuevo.';
    try {
      const response = await fetch('/api/assistant/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: query,
          history: historial,
          project: formData?.proyecto ? { proyecto: formData.proyecto, areaM2: formData.areaM2, superficie: formData.superficie, ambiente: formData.ambiente, color: formData.color } : null
        })
      });
      const data = await response.json();
      reply = data.success ? data.reply : (data.error || reply);
    } catch {
      // se queda el mensaje de conexión
    }

    setMessages(prev => [...prev, { id: `b-${Date.now()}`, sender: 'assistant', text: reply, timestamp: hora() }]);
    setIsTyping(false);
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
                  <FormattedMessage text={msg.text} />
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
              <span>Escribiendo...</span>
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
            placeholder="Pregunta sobre pinturas, cuñetes, pedidos o proyectos..."
            className="flex-1 px-3.5 py-2 bg-slate-900 text-white placeholder-slate-500 text-xs rounded-xl border border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
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
