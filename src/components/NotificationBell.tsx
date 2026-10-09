import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Bell, MessageSquare, Package, HardHat, CheckCheck } from 'lucide-react';

export interface Notificacion {
  id: string;
  tipo: 'proyecto' | 'pedido' | 'mensaje';
  titulo: string;
  detalle: string;
  fecha: string;
  leida: boolean;
  enlace: { tipo: 'proyecto' | 'pedido'; id: string; abrirChat?: boolean };
}

/** Evento global para pedir que la campana se actualice (p. ej. al leer mensajes de un proyecto). */
export const refrescarNotificaciones = () => window.dispatchEvent(new Event('colorlink:notificaciones'));

const hace = (d: string) => {
  const min = Math.round((Date.now() - new Date(d).getTime()) / 60000);
  if (min < 1) return 'Ahora';
  if (min < 60) return `Hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `Hace ${h} h`;
  const dias = Math.round(h / 24);
  if (dias < 7) return `Hace ${dias} d`;
  return new Date(d).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const ICONO = {
  proyecto: <HardHat className="w-4 h-4 text-amber-600" />,
  pedido: <Package className="w-4 h-4 text-blue-600" />,
  mensaje: <MessageSquare className="w-4 h-4 text-[#14216B]" />
};

/** Campana con el número de novedades (proyectos, pedidos y mensajes). No muestra avisos emergentes. */
export const NotificationBell: React.FC<{ onOpenItem: (n: Notificacion) => void }> = ({ onOpenItem }) => {
  const [items, setItems] = useState<Notificacion[]>([]);
  const [sinLeer, setSinLeer] = useState(0);
  const [abierta, setAbierta] = useState(false);
  const [cargando, setCargando] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const cargar = useCallback(async () => {
    try {
      const r = await fetch('/api/notifications');
      if (!r.ok) return;
      const data = await r.json();
      if (data.success) { setItems(data.notifications); setSinLeer(data.sinLeer); }
    } catch { /* sin conexión: se reintenta en el próximo ciclo */ }
  }, []);

  useEffect(() => {
    cargar();
    const id = setInterval(() => { if (document.visibilityState === 'visible') cargar(); }, 30000);
    const alVolver = () => { if (document.visibilityState === 'visible') cargar(); };
    window.addEventListener('colorlink:notificaciones', cargar);
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearInterval(id);
      window.removeEventListener('colorlink:notificaciones', cargar);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [cargar]);

  useEffect(() => {
    if (!abierta) return;
    const fuera = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setAbierta(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setAbierta(false); };
    document.addEventListener('mousedown', fuera);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('mousedown', fuera); document.removeEventListener('keydown', esc); };
  }, [abierta]);

  const abrir = async () => {
    const siguiente = !abierta;
    setAbierta(siguiente);
    if (!siguiente) return;
    setCargando(true);
    await cargar();
    setCargando(false);
    // Al abrir la campana se dan por vistas (el contador vuelve a 0, los nuevos siguen resaltados mientras está abierta)
    if (sinLeer > 0 || items.some(n => !n.leida)) {
      fetch('/api/notifications/read', { method: 'POST' }).then(() => setSinLeer(0)).catch(() => undefined);
    }
  };

  const cerrarYAbrir = (n: Notificacion) => {
    setAbierta(false);
    setItems(prev => prev.map(x => ({ ...x, leida: true })));
    onOpenItem(n);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={abrir}
        className="relative p-2 sm:p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-white border border-slate-700/70 transition-all cursor-pointer active:scale-95"
        aria-label={sinLeer > 0 ? `Notificaciones: ${sinLeer} sin leer` : 'Notificaciones'}
        aria-expanded={abierta}
        title="Notificaciones"
      >
        <Bell className="w-5 h-5 text-emerald-400" />
        {sinLeer > 0 && (
          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-red-600 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md ring-2 ring-[#0A1A36]">
            {sinLeer > 9 ? '9+' : sinLeer}
          </span>
        )}
      </button>

      {abierta && (
        <div className="fixed sm:absolute left-2 right-2 sm:left-auto sm:right-0 top-[7.5rem] sm:top-auto sm:mt-2 sm:w-96 bg-white text-slate-900 rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <span className="text-sm font-black">Notificaciones</span>
            <button type="button" onClick={() => setAbierta(false)} className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 inline-flex items-center gap-1 cursor-pointer">
              <CheckCheck className="w-3.5 h-3.5" /> Cerrar
            </button>
          </div>
          <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-100">
            {cargando && items.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-400">Cargando…</p>
            ) : items.length === 0 ? (
              <p className="p-6 text-center text-xs text-slate-500">No tienes novedades. Aquí verás los cambios de tus proyectos, pedidos y los mensajes de tu asesor.</p>
            ) : (
              items.map(n => (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => cerrarYAbrir(n)}
                  className={`w-full text-left flex gap-3 px-4 py-3 hover:bg-slate-50 cursor-pointer ${n.leida ? '' : 'bg-amber-50/70'}`}
                >
                  <span className="mt-0.5 w-8 h-8 shrink-0 rounded-full bg-slate-100 flex items-center justify-center">{ICONO[n.tipo]}</span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-start gap-2">
                      <span className={`text-xs leading-snug ${n.leida ? 'font-semibold text-slate-700' : 'font-black text-slate-900'}`}>{n.titulo}</span>
                      {!n.leida && <span className="mt-1 w-2 h-2 shrink-0 rounded-full bg-red-600" aria-label="Nueva" />}
                    </span>
                    <span className="block text-[11px] text-slate-500 leading-snug line-clamp-2">{n.detalle}</span>
                    <span className="block text-[10px] text-slate-400 mt-0.5">{hace(n.fecha)}</span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
