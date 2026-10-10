import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Send, MessageSquare, Mail, Phone, UserRound } from 'lucide-react';

interface Mensaje {
  mensajeId: string;
  autorNombre: string;
  autorRol: string;
  texto: string;
  createdAt: string;
  leidoEquipo?: boolean;
}

interface Asesor {
  nombre: string;
  apellido?: string | null;
  email?: string | null;
  telefono?: string | null;
  avatarUrl?: string | null;
}

const ROL_LABEL: Record<string, string> = {
  asesor: 'Asesor comercial',
  calidad: 'Perito de calidad',
  despachos: 'Despachos',
  administrador: 'Equipo ColorLink'
};

const hora = (d: string) => { const f = new Date(d); return isNaN(f.getTime()) ? '' : f.toLocaleTimeString('es-CO', { hour: 'numeric', minute: '2-digit' }); };
const dia = (d: string) => {
  const f = new Date(d);
  if (isNaN(f.getTime())) return '';
  const hoy = new Date();
  const ayer = new Date(); ayer.setDate(hoy.getDate() - 1);
  if (f.toDateString() === hoy.toDateString()) return 'Hoy';
  if (f.toDateString() === ayer.toDateString()) return 'Ayer';
  return f.toLocaleDateString('es-CO', { day: 'numeric', month: 'long' });
};

/** Número colombiano para enlace de WhatsApp (57 + 10 dígitos), o null si no es un celular válido. */
export const whatsappDe = (tel?: string | null) => {
  const d = String(tel || '').replace(/\D/g, '').replace(/^57/, '');
  return /^3\d{9}$/.test(d) ? `57${d}` : null;
};

/** Datos de contacto del asesor asignado (o aviso de que aún no hay uno). */
export const AsesorContacto: React.FC<{ asesor?: Asesor | null; proyecto?: string }> = ({ asesor, proyecto }) => {
  if (!asesor) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
        <div className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400"><UserRound className="w-5 h-5" /></div>
        <div className="text-xs">
          <p className="font-bold text-slate-800">Aún no tienes asesor asignado</p>
          <p className="text-slate-500">Puedes escribirnos aquí abajo; el equipo de ColorLink te responde.</p>
        </div>
      </div>
    );
  }
  const nombre = `${asesor.nombre} ${asesor.apellido || ''}`.trim();
  const wa = whatsappDe(asesor.telefono);
  const textoWa = encodeURIComponent(`Hola ${asesor.nombre}, te escribo por mi proyecto${proyecto ? ` "${proyecto}"` : ''} en ColorLink.`);
  return (
    <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3">
      {asesor.avatarUrl ? (
        <img src={asesor.avatarUrl} alt={nombre} className="w-10 h-10 rounded-full object-cover border border-slate-200" />
      ) : (
        <div className="w-10 h-10 rounded-full bg-[#14216B] text-white font-black flex items-center justify-center">{asesor.nombre.charAt(0).toUpperCase()}</div>
      )}
      <div className="min-w-[9rem] flex-1 text-xs">
        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Tu asesor</p>
        <p className="font-black text-slate-900 truncate">{nombre}</p>
      </div>
      <div className="flex gap-1.5 w-full sm:w-auto">
        {asesor.email && (
          <a href={`mailto:${asesor.email}`} className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[11px] font-bold text-slate-700 hover:bg-slate-100" title={asesor.email}>
            <Mail className="w-3.5 h-3.5" /> Correo
          </a>
        )}
        {wa && (
          <a href={`https://wa.me/${wa}?text=${textoWa}`} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-none justify-center inline-flex items-center gap-1 rounded-lg bg-[#25D366] px-2.5 py-1.5 text-[11px] font-bold text-white hover:brightness-95">
            <Phone className="w-3.5 h-3.5" /> WhatsApp
          </a>
        )}
      </div>
    </div>
  );
};

/** Conversación del cliente con el equipo ColorLink dentro de un proyecto. */
export const ProjectChat: React.FC<{ proyectoId: string; autoFocus?: boolean; onRead?: () => void }> = ({ proyectoId, autoFocus, onRead }) => {
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [cargando, setCargando] = useState(true);
  const [texto, setTexto] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState('');
  const listaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const onReadRef = useRef(onRead);
  onReadRef.current = onRead;
  const proyectoActual = useRef(proyectoId);
  proyectoActual.current = proyectoId;
  const enviandoRef = useRef(false);

  const cargar = async (silencioso = false) => {
    const id = proyectoId;
    try {
      const r = await fetch(`/api/projects/${id}/messages`);
      const data = await r.json();
      if (id !== proyectoActual.current) return; // la respuesta llegó tarde, de otro proyecto
      if (data.success && Array.isArray(data.messages)) {
        setMensajes(prev => (prev.length === data.messages.length && prev[prev.length - 1]?.mensajeId === data.messages[data.messages.length - 1]?.mensajeId ? prev : data.messages));
        onReadRef.current?.();
      } else if (!silencioso) {
        setError(data.error || 'No se pudieron cargar los mensajes.');
      }
    } catch {
      if (!silencioso) setError('No hay conexión con el servidor.');
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    setCargando(true);
    setMensajes([]);
    setError('');
    cargar();
    const id = setInterval(() => { if (document.visibilityState === 'visible') cargar(true); }, 10000);
    return () => clearInterval(id);
  }, [proyectoId]);

  useEffect(() => { if (autoFocus && !cargando) inputRef.current?.focus(); }, [autoFocus, cargando]);

  useLayoutEffect(() => {
    const el = listaRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [mensajes.length]);

  const enviar = async () => {
    const t = texto.trim();
    if (!t || enviando || enviandoRef.current) return;
    if (t.length > 1000) { setError('El mensaje puede tener máximo 1000 caracteres.'); return; }
    enviandoRef.current = true;
    setEnviando(true);
    setError('');
    try {
      const r = await fetch(`/api/projects/${proyectoId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ texto: t })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.success) { setError(data.error || 'No se pudo enviar el mensaje.'); return; }
      if (data.message) setMensajes(prev => [...prev, data.message]);
      setTexto('');
    } catch {
      setError('No hay conexión con el servidor. Intenta de nuevo.');
    } finally {
      enviandoRef.current = false;
      setEnviando(false);
      inputRef.current?.focus();
    }
  };

  let ultimoDia = '';
  const ultimoMio = [...mensajes].reverse().find(m => m.autorRol === 'cliente');

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-slate-50">
        <MessageSquare className="w-4 h-4 text-[#14216B]" />
        <span className="text-xs font-black text-slate-800">Mensajes con tu asesor</span>
      </div>

      <div ref={listaRef} className="h-64 overflow-y-auto px-3 py-3 space-y-2 bg-white" aria-live="polite">
        {cargando ? (
          <p className="text-center text-xs text-slate-400 pt-24">Cargando mensajes…</p>
        ) : mensajes.length === 0 ? (
          <div className="text-center text-xs text-slate-500 pt-20 px-6">
            Escribe tu pregunta sobre el proyecto: colores, cantidades, fechas de entrega o una visita técnica. Te avisamos cuando te respondan.
          </div>
        ) : (
          mensajes.map(m => {
            const mio = m.autorRol === 'cliente';
            const d = dia(m.createdAt);
            const separador = d !== ultimoDia ? (ultimoDia = d) : null;
            return (
              <React.Fragment key={m.mensajeId}>
                {separador && (
                  <div className="text-center"><span className="inline-block text-[10px] font-bold text-slate-400 bg-slate-100 rounded-full px-2 py-0.5">{separador}</span></div>
                )}
                <div className={`flex ${mio ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${mio ? 'bg-[#14216B] text-white rounded-br-sm' : 'bg-slate-100 text-slate-800 rounded-bl-sm'}`}>
                    {!mio && (
                      <p className="text-[10px] font-black text-[#14216B] mb-0.5">{m.autorNombre} · <span className="font-semibold text-slate-500">{ROL_LABEL[m.autorRol] || 'Equipo ColorLink'}</span></p>
                    )}
                    <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                    <p className={`text-[9px] mt-0.5 text-right ${mio ? 'text-blue-200' : 'text-slate-400'}`}>
                      {hora(m.createdAt)}{mio && m.mensajeId === ultimoMio?.mensajeId && m.leidoEquipo ? ' · Visto' : ''}
                    </p>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}
      </div>

      <div className="border-t border-slate-100 p-2.5 space-y-1.5">
        {error && <p role="alert" className="text-[11px] font-semibold text-red-700">{error}</p>}
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={texto}
            onChange={e => setTexto(e.target.value.slice(0, 1000))}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); enviar(); } }}
            rows={2}
            maxLength={1000}
            aria-label="Escribe tu mensaje"
            placeholder="Escribe tu mensaje…"
            className="flex-1 resize-none rounded-xl border border-slate-300 px-3 py-2 text-xs focus:outline-none focus:border-[#14216B]"
          />
          <button
            type="button"
            onClick={enviar}
            disabled={enviando || !texto.trim()}
            className="h-10 px-3.5 rounded-xl bg-[#14216B] hover:bg-[#0f1a55] disabled:opacity-40 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> {enviando ? 'Enviando…' : 'Enviar'}
          </button>
        </div>
        <p className="text-[10px] text-slate-400">Enter para enviar · Shift + Enter para nueva línea · {texto.length}/1000</p>
      </div>
    </div>
  );
};
