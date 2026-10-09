import React, { useEffect, useRef, useState } from 'react';
import { ProductThumb } from './ProductThumb';
import { Star, X, Camera, Trash2, BadgeCheck, MessageSquareText } from 'lucide-react';

// ------------------------------------------------------------------ Estrellas

export const Stars: React.FC<{ value: number; size?: string; className?: string }> = ({ value, size = 'w-4 h-4', className = '' }) => (
  <span className={`inline-flex items-center gap-0.5 ${className}`} aria-label={`${value.toFixed(1)} de 5 estrellas`}>
    {[1, 2, 3, 4, 5].map(i => {
      const lleno = Math.max(0, Math.min(1, value - (i - 1)));
      return (
        <span key={i} className={`relative inline-block ${size}`}>
          <Star className={`absolute inset-0 ${size} text-slate-300`} />
          {lleno > 0 && (
            <span className="absolute inset-0 overflow-hidden" style={{ width: `${lleno * 100}%` }}>
              <Star className={`${size} text-amber-400 fill-amber-400`} />
            </span>
          )}
        </span>
      );
    })}
  </span>
);

const ETIQUETAS = ['', 'Muy malo', 'Malo', 'Regular', 'Bueno', 'Excelente'];

export const StarInput: React.FC<{ value: number; onChange: (v: number) => void }> = ({ value, onChange }) => {
  const [hover, setHover] = useState(0);
  const mostrado = hover || value;
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1" role="radiogroup" aria-label="Calificación" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map(i => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={value === i}
            aria-label={`${i} ${i === 1 ? 'estrella' : 'estrellas'}`}
            onMouseEnter={() => setHover(i)}
            onClick={() => onChange(i)}
            className="p-0.5 cursor-pointer"
          >
            <Star className={`w-8 h-8 transition-colors ${i <= mostrado ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
          </button>
        ))}
      </div>
      <span className="text-sm font-bold text-slate-700 min-w-20">{ETIQUETAS[mostrado] || 'Toca una estrella'}</span>
    </div>
  );
};

// ------------------------------------------------------------------ Foto (se reduce en el navegador antes de subirla)

const TIPOS = ['image/png', 'image/jpeg', 'image/webp'];

async function comprimirImagen(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('No se pudo leer la imagen'));
      i.src = url;
    });
    const max = 1400;
    const escala = Math.min(1, max / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.width * escala);
    canvas.height = Math.round(img.height * escala);
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('No se pudo procesar la imagen');
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/jpeg', 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

// ------------------------------------------------------------------ Modal base

const Modal: React.FC<{ titulo: string; onClose: () => void; children: React.ReactNode }> = ({ titulo, onClose, children }) => {
  useEffect(() => {
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-[60] bg-slate-950/70 backdrop-blur-xs flex items-end sm:items-center justify-center sm:p-4" onClick={onClose}>
      <div role="dialog" aria-modal="true" aria-label={titulo} className="bg-white w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-center justify-between z-10">
          <h2 className="text-base font-black text-slate-900">{titulo}</h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 cursor-pointer" aria-label="Cerrar"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

// ------------------------------------------------------------------ Opinión de un producto

export interface ItemParaOpinar {
  id: string;
  productId: string;
  name: string;
  sizeName?: string;
  colorName?: string;
  image?: string;
  review?: { resenaId: string; calificacion: number; comentario?: string | null; tieneFoto: boolean } | null;
}

export const ProductReviewModal: React.FC<{
  orderId: string;
  item: ItemParaOpinar;
  onClose: () => void;
  onSaved: (review: NonNullable<ItemParaOpinar['review']>) => void;
}> = ({ orderId, item, onClose, onSaved }) => {
  const [calificacion, setCalificacion] = useState(item.review?.calificacion || 0);
  const [comentario, setComentario] = useState(item.review?.comentario || '');
  const [foto, setFoto] = useState<string | null>(null);
  const [fotoExistente, setFotoExistente] = useState(!!item.review?.tieneFoto);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const elegirFoto = async (file?: File) => {
    if (!file) return;
    setError('');
    if (!TIPOS.includes(file.type)) { setError('La foto debe ser PNG, JPG o WEBP.'); return; }
    if (file.size > 15 * 1024 * 1024) { setError('La foto es muy pesada (máximo 15 MB).'); return; }
    try { setFoto(await comprimirImagen(file)); } catch { setError('No se pudo leer la foto. Prueba con otra.'); }
  };

  const guardar = async () => {
    if (!calificacion) { setError('Elige cuántas estrellas le das al producto.'); return; }
    setGuardando(true);
    setError('');
    try {
      const r = await fetch(`/api/orders/${orderId}/items/${item.id}/review`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calificacion,
          comentario,
          productoKey: item.productId,
          ...(foto ? { imageBase64: foto } : {}),
          ...(!foto && item.review?.tieneFoto && !fotoExistente ? { quitarFoto: true } : {})
        })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.success) { setError(data.error || 'No se pudo guardar tu opinión.'); return; }
      onSaved(data.review);
    } catch {
      setError('No hay conexión con el servidor. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  const vistaFoto = foto || (fotoExistente && item.review ? `/api/reviews/${item.review.resenaId}/photo` : null);

  return (
    <Modal titulo={item.review ? 'Editar tu opinión' : 'Escribir una opinión'} onClose={onClose}>
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 shrink-0 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
            <ProductThumb productId={item.productId} name={item.name} sizeName={item.sizeName} colorName={item.colorName} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 leading-tight">{item.name}</p>
            {(item.sizeName || item.colorName) && (
              <p className="text-xs text-slate-500">{[item.sizeName, item.colorName].filter(Boolean).join(' · ')}</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2">Calificación general</p>
          <StarInput value={calificacion} onChange={setCalificacion} />
        </div>

        <div>
          <label htmlFor="resena-texto" className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2 block">
            Tu comentario <span className="font-semibold normal-case tracking-normal text-slate-400">(opcional)</span>
          </label>
          <textarea
            id="resena-texto"
            value={comentario}
            onChange={e => setComentario(e.target.value.slice(0, 1500))}
            rows={4}
            placeholder="¿Cómo te fue con el producto? Cubrimiento, acabado, rendimiento, olor, secado…"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#14216B] resize-none"
          />
          <p className="text-[11px] text-slate-400 text-right">{comentario.length}/1500</p>
        </div>

        <div>
          <p className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2">
            Foto <span className="font-semibold normal-case tracking-normal text-slate-400">(opcional)</span>
          </p>
          {vistaFoto ? (
            <div className="relative inline-block">
              <img src={vistaFoto} alt="Foto de tu opinión" className="h-32 rounded-xl border border-slate-200 object-cover" />
              <button
                type="button"
                onClick={() => { setFoto(null); setFotoExistente(false); }}
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-white border border-slate-300 shadow flex items-center justify-center text-slate-600 hover:text-red-600 cursor-pointer"
                aria-label="Quitar foto"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="w-full rounded-xl border-2 border-dashed border-slate-300 hover:border-[#14216B] hover:bg-slate-50 py-5 flex flex-col items-center gap-1 text-slate-500 cursor-pointer"
            >
              <Camera className="w-6 h-6" />
              <span className="text-xs font-bold">Agregar una foto del resultado</span>
              <span className="text-[11px]">PNG, JPG o WEBP</span>
            </button>
          )}
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={e => { elegirFoto(e.target.files?.[0]); e.target.value = ''; }} />
        </div>

        <p className="text-[11px] text-slate-500 leading-relaxed">
          Tu opinión se publica en la página del producto con tu primer nombre y la inicial de tu apellido, marcada como compra verificada.
        </p>

        {error && <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}

        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">Cancelar</button>
          <button
            type="button"
            onClick={guardar}
            disabled={guardando}
            className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 text-sm font-black cursor-pointer"
          >
            {guardando ? 'Publicando…' : item.review ? 'Guardar cambios' : 'Publicar opinión'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

/** Lista de productos del pedido para elegir cuál opinar (cuando hay más de uno). */
export const PickItemModal: React.FC<{ items: ItemParaOpinar[]; onPick: (i: ItemParaOpinar) => void; onClose: () => void }> = ({ items, onPick, onClose }) => (
  <Modal titulo="¿Sobre qué producto quieres opinar?" onClose={onClose}>
    <div className="space-y-2">
      {items.map(it => (
        <button key={it.id} type="button" onClick={() => onPick(it)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-left cursor-pointer">
          <span className="w-12 h-12 shrink-0 rounded-lg bg-white border border-slate-200 p-1 flex items-center justify-center overflow-hidden">
            <ProductThumb productId={it.productId} name={it.name} sizeName={it.sizeName} colorName={it.colorName} />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-bold text-slate-900 truncate">{it.name}</span>
            {it.review ? (
              <span className="flex items-center gap-1.5 text-[11px] text-slate-500"><Stars value={it.review.calificacion} size="w-3 h-3" /> Ya opinaste · editar</span>
            ) : (
              <span className="text-[11px] font-bold text-[#14216B]">Escribir opinión</span>
            )}
          </span>
        </button>
      ))}
    </div>
  </Modal>
);

// ------------------------------------------------------------------ Evaluar al vendedor

const ASPECTOS = ['Entrega a tiempo', 'Producto en buen estado', 'Buena atención', 'Empaque adecuado'];

export const SellerRatingModal: React.FC<{
  orderId: string;
  orderNumber: string;
  actual?: { calificacion: number; comentario?: string | null } | null;
  onClose: () => void;
  onSaved: (ev: { calificacion: number; comentario?: string | null }) => void;
}> = ({ orderId, orderNumber, actual, onClose, onSaved }) => {
  const [calificacion, setCalificacion] = useState(actual?.calificacion || 0);
  const [comentario, setComentario] = useState(actual?.comentario || '');
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const agregarAspecto = (a: string) =>
    setComentario(c => (c.includes(a) ? c : `${c.trim()}${c.trim() ? '. ' : ''}${a}`).slice(0, 1500));

  const guardar = async () => {
    if (!calificacion) { setError('Elige cuántas estrellas le das al servicio.'); return; }
    setGuardando(true);
    setError('');
    try {
      const r = await fetch(`/api/orders/${orderId}/seller-rating`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ calificacion, comentario })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data.success) { setError(data.error || 'No se pudo guardar tu evaluación.'); return; }
      onSaved(data.evaluacion);
    } catch {
      setError('No hay conexión con el servidor. Intenta de nuevo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo="Evaluar al vendedor" onClose={onClose}>
      <div className="space-y-5">
        <p className="text-sm text-slate-600">¿Cómo fue tu experiencia con <strong>ColorLink</strong> en el pedido <span className="font-mono font-bold">{orderNumber}</span>?</p>
        <StarInput value={calificacion} onChange={setCalificacion} />
        <div className="flex flex-wrap gap-1.5">
          {ASPECTOS.map(a => (
            <button key={a} type="button" onClick={() => agregarAspecto(a)} className="px-2.5 py-1 rounded-full border border-slate-300 text-[11px] font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer">
              + {a}
            </button>
          ))}
        </div>
        <div>
          <label htmlFor="vendedor-texto" className="text-xs font-black uppercase tracking-wider text-slate-600 mb-2 block">
            Comentario <span className="font-semibold normal-case tracking-normal text-slate-400">(opcional, solo lo ve ColorLink)</span>
          </label>
          <textarea
            id="vendedor-texto"
            value={comentario}
            onChange={e => setComentario(e.target.value.slice(0, 1500))}
            rows={3}
            placeholder="Cuéntanos qué hicimos bien o qué podemos mejorar"
            className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#14216B] resize-none"
          />
        </div>
        {error && <p role="alert" className="text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2">{error}</p>}
        <div className="flex gap-2">
          <button type="button" onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-700 hover:bg-slate-50 cursor-pointer">Cancelar</button>
          <button type="button" onClick={guardar} disabled={guardando} className="flex-1 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 text-slate-950 text-sm font-black cursor-pointer">
            {guardando ? 'Enviando…' : actual ? 'Guardar cambios' : 'Enviar evaluación'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// ------------------------------------------------------------------ Sección pública en la ficha del producto

export interface ResumenOpiniones {
  promedio: number;
  total: number;
  distribucion: Record<number, number>;
  resenas: Array<{
    resenaId: string; calificacion: number; comentario?: string | null; fecha: string; editada: boolean;
    autor: string; ciudad?: string | null; presentacion?: string | null; color?: string | null; tieneFoto: boolean;
  }>;
}

export const useProductReviews = (productId?: string) => {
  const [data, setData] = useState<ResumenOpiniones | null>(null);
  useEffect(() => {
    if (!productId) return;
    let cancel = false;
    setData(null);
    fetch(`/api/products/${encodeURIComponent(productId)}/reviews`)
      .then(r => r.json())
      .then(d => { if (!cancel && d.success) setData(d); })
      .catch(() => undefined);
    return () => { cancel = true; };
  }, [productId]);
  return data;
};

export const ProductReviewsSection: React.FC<{ data: ResumenOpiniones | null; productName: string }> = ({ data, productName }) => {
  const [filtro, setFiltro] = useState<number | 'foto' | null>(null);
  const [verTodas, setVerTodas] = useState(false);
  const [fotoGrande, setFotoGrande] = useState<string | null>(null);

  const lista = (data?.resenas || []).filter(r => (filtro === 'foto' ? r.tieneFoto : filtro ? r.calificacion === filtro : true));
  const visibles = verTodas ? lista : lista.slice(0, 5);
  const conFoto = (data?.resenas || []).filter(r => r.tieneFoto);

  return (
    <section id="opiniones" className="mt-8 bg-white rounded-3xl border border-slate-200 shadow-sm p-5 sm:p-8 scroll-mt-28">
      <div className="flex items-center gap-2 mb-5">
        <MessageSquareText className="w-5 h-5 text-[#14216B]" />
        <h2 className="text-lg sm:text-xl font-black text-slate-900">Opiniones de clientes</h2>
      </div>

      {!data ? (
        <p className="text-sm text-slate-400">Cargando opiniones…</p>
      ) : data.total === 0 ? (
        <div className="rounded-2xl bg-slate-50 border border-dashed border-slate-300 p-6 text-center">
          <Stars value={0} size="w-5 h-5" />
          <p className="mt-2 text-sm font-bold text-slate-700">Aún no hay opiniones de {productName}</p>
          <p className="text-xs text-slate-500">Las opiniones las escriben clientes que compraron y recibieron el producto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Resumen */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black text-slate-900">{data.promedio.toFixed(1)}</span>
              <div>
                <Stars value={data.promedio} size="w-5 h-5" />
                <p className="text-xs text-slate-500 mt-0.5">{data.total} {data.total === 1 ? 'opinión' : 'opiniones'}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              {[5, 4, 3, 2, 1].map(n => {
                const c = data.distribucion[n] || 0;
                const pct = data.total ? Math.round((c / data.total) * 100) : 0;
                return (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setFiltro(filtro === n ? null : n)}
                    disabled={!c}
                    className={`w-full flex items-center gap-2 text-xs group ${c ? 'cursor-pointer' : 'cursor-default opacity-60'}`}
                    aria-pressed={filtro === n}
                  >
                    <span className={`w-16 text-left font-semibold ${filtro === n ? 'text-[#14216B] underline' : 'text-blue-700 group-hover:underline'}`}>{n} estrella{n > 1 ? 's' : ''}</span>
                    <span className="flex-1 h-3 rounded-full bg-slate-100 border border-slate-200 overflow-hidden">
                      <span className="block h-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </span>
                    <span className="w-9 text-right text-slate-500">{pct}%</span>
                  </button>
                );
              })}
            </div>
            {conFoto.length > 0 && (
              <div>
                <p className="text-xs font-black text-slate-700 mb-2">Fotos de clientes</p>
                <div className="flex flex-wrap gap-2">
                  {conFoto.slice(0, 8).map(r => (
                    <button key={r.resenaId} type="button" onClick={() => setFotoGrande(`/api/reviews/${r.resenaId}/photo`)} className="cursor-zoom-in">
                      <img src={`/api/reviews/${r.resenaId}/photo`} alt={`Foto de ${r.autor}`} loading="lazy" className="w-16 h-16 rounded-lg object-cover border border-slate-200" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Lista */}
          <div className="lg:col-span-8 space-y-1">
            <div className="flex flex-wrap items-center gap-2 pb-3">
              <button type="button" onClick={() => setFiltro(null)} className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${filtro === null ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>Todas</button>
              {conFoto.length > 0 && (
                <button type="button" onClick={() => setFiltro(filtro === 'foto' ? null : 'foto')} className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer ${filtro === 'foto' ? 'bg-slate-900 text-white border-slate-900' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`}>Con foto ({conFoto.length})</button>
              )}
              {typeof filtro === 'number' && <span className="text-xs text-slate-500">Mostrando opiniones de {filtro} estrella{filtro > 1 ? 's' : ''}</span>}
            </div>
            {visibles.length === 0 && <p className="text-sm text-slate-500 py-4">No hay opiniones con ese filtro.</p>}
            {visibles.map(r => (
              <article key={r.resenaId} className="py-4 border-t border-slate-100 first:border-t-0">
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 text-xs font-black flex items-center justify-center">{r.autor.charAt(0)}</span>
                  <span className="text-sm font-bold text-slate-800">{r.autor}</span>
                  {r.ciudad && <span className="text-xs text-slate-400">· {r.ciudad}</span>}
                </div>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Stars value={r.calificacion} size="w-4 h-4" />
                  <span className="text-xs font-bold text-slate-700">{ETIQUETAS[r.calificacion]}</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  {new Date(r.fecha).toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {r.editada ? ' · editada' : ''}
                  {(r.presentacion || r.color) ? ` · ${[r.presentacion, r.color].filter(Boolean).join(' · ')}` : ''}
                </p>
                <p className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 mt-1"><BadgeCheck className="w-3.5 h-3.5" /> Compra verificada</p>
                {r.comentario && <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap break-words leading-relaxed">{r.comentario}</p>}
                {r.tieneFoto && (
                  <button type="button" onClick={() => setFotoGrande(`/api/reviews/${r.resenaId}/photo`)} className="mt-2 cursor-zoom-in">
                    <img src={`/api/reviews/${r.resenaId}/photo`} alt={`Foto de ${r.autor}`} loading="lazy" className="h-24 rounded-lg object-cover border border-slate-200" />
                  </button>
                )}
              </article>
            ))}
            {lista.length > 5 && (
              <button type="button" onClick={() => setVerTodas(v => !v)} className="mt-2 text-sm font-bold text-blue-700 hover:underline cursor-pointer">
                {verTodas ? 'Ver menos' : `Ver las ${lista.length} opiniones`}
              </button>
            )}
          </div>
        </div>
      )}

      {fotoGrande && (
        <div className="fixed inset-0 z-[70] bg-black/85 flex items-center justify-center p-4" onClick={() => setFotoGrande(null)}>
          <button type="button" className="absolute top-4 right-4 text-white/80 hover:text-white cursor-pointer" aria-label="Cerrar"><X className="w-7 h-7" /></button>
          <img src={fotoGrande} alt="Foto de cliente" className="max-w-full max-h-[85vh] rounded-xl" />
        </div>
      )}
    </section>
  );
};

