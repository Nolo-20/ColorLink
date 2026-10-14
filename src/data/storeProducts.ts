import { StoreProduct, StoreBranch } from '../types';

// ---------------------------------------------------------------------------
// Catálogo, tiendas y ciudades: se cargan de la base de datos (API) al abrir la tienda.
// Los arreglos se llenan "en el mismo lugar" para que todos los componentes que los importan
// vean los datos reales sin cambiar sus imports.
// ---------------------------------------------------------------------------

export interface CiudadTienda {
  ciudadId: number;
  ciudad: string;
  departamento?: string | null;
  /** Hay entrega a domicilio en esta ciudad */
  domicilio: boolean;
}

export const STORE_BRANCHES: StoreBranch[] = [];
export const STORE_PRODUCTS: StoreProduct[] = [];
export const STORE_CITIES: CiudadTienda[] = [];
/** Nombres de las ciudades registradas (mismo arreglo para todos los selectores) */
export const CITY_NAMES: string[] = [];
/** Colores de pintura (sin repetir) para los proyectos de obra */
export const PROJECT_COLORS: Array<{ id: string; name: string; hex: string; code: string; category: string }> = [];

const reemplazar = <T,>(destino: T[], datos: T[]) => { destino.splice(0, destino.length, ...datos); };

async function pedir(url: string) {
  const r = await fetch(url, { cache: 'no-store' });
  const d = await r.json().catch(() => null);
  if (!r.ok || !d?.success) throw new Error(d?.error || `Error ${r.status} al cargar ${url}`);
  return d;
}

/** Carga catálogo, tiendas y ciudades desde el servidor. Se llama al iniciar y después de comprar (stock). */
export async function cargarDatosTienda(): Promise<void> {
  const [catalogo, sucursales, ciudades] = await Promise.all([pedir('/api/catalog'), pedir('/api/branches'), pedir('/api/cities')]);
  reemplazar(STORE_PRODUCTS, catalogo.products as StoreProduct[]);
  reemplazar(STORE_BRANCHES, sucursales.branches as StoreBranch[]);
  reemplazar(STORE_CITIES, (ciudades.cities as CiudadTienda[]).map(c => ({ ...c, domicilio: !!c.domicilio })));
  reemplazar(CITY_NAMES, STORE_CITIES.map(c => c.ciudad));
  const vistos = new Set<string>();
  const colores: typeof PROJECT_COLORS = [];
  for (const p of STORE_PRODUCTS) {
    if (p.isTool) continue;
    for (const c of p.colors) {
      const clave = c.name.trim().toLowerCase();
      if (!c.inStock || vistos.has(clave)) continue;
      vistos.add(clave);
      colores.push({ id: `${p.id}:${c.id}`, name: c.name, hex: c.hex, code: c.code, category: p.categoryLabel || p.name });
    }
  }
  reemplazar(PROJECT_COLORS, colores);
}

/** Nombres de las ciudades registradas (para registro y proyectos) */
export const nombresCiudades = (): string[] => STORE_CITIES.map(c => c.ciudad);
/** Ciudades con entrega a domicilio (checkout) */
export const ciudadesDomicilio = (): string[] => STORE_CITIES.filter(c => c.domicilio).map(c => c.ciudad);

export const MAX_ITEM_QTY = 99;

/** Limita una cantidad a un entero entre 1 y MAX_ITEM_QTY (NaN -> 1). */
export const clampQty = (n: number): number => {
  const v = Math.floor(Number(n));
  if (!Number.isFinite(v) || v < 1) return 1;
  return Math.min(MAX_ITEM_QTY, v);
};

const COP_FORMAT = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 0 });

/** "$ 115.000" con formato colombiano; nunca muestra NaN. */
export const formatCOP = (value: number): string => {
  const n = Number(value);
  return `$${COP_FORMAT.format(Number.isFinite(n) ? Math.round(n) : 0)}`;
};

/** Enlace de WhatsApp solo para celulares colombianos (3xx xxx xxxx). */
export const whatsappUrl = (phone: string, text?: string): string | null => {
  let digits = String(phone || '').replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('57')) digits = digits.slice(2);
  if (!/^3\d{9}$/.test(digits)) return null;
  return `https://wa.me/57${digits}${text ? `?text=${encodeURIComponent(text)}` : ''}`;
};

/** Enlace tel: con indicativo de Colombia. */
export const telUrl = (phone: string): string => {
  const digits = String(phone || '').replace(/\D/g, '');
  return `tel:+57${digits.startsWith('57') && digits.length > 10 ? digits.slice(2) : digits}`;
};

/** Ruta de Google Maps hasta la sede (coordenadas si existen, si no la dirección). */
export const mapsDirectionsUrl = (branch: StoreBranch): string => {
  const dest = branch.lat != null && branch.lng != null
    ? `${branch.lat},${branch.lng}`
    : `${branch.name}, ${branch.address}, ${branch.city}, Colombia`;
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(dest)}`;
};

/** Mapa embebible (sin API key) centrado en la sede. */
export const mapsEmbedUrl = (branch: StoreBranch): string => {
  const q = branch.lat != null && branch.lng != null
    ? `${branch.lat},${branch.lng}`
    : `${branch.address}, ${branch.city}, Colombia`;
  return `https://maps.google.com/maps?q=${encodeURIComponent(q)}&z=16&output=embed`;
};

/** Tipo de herramienta a partir del nombre del producto. */
export const toolTypeFor = (name: string): 'rodillo' | 'cinta' | 'espatula' | 'bandeja' | 'extension' | 'brocha' => {
  const n = (name || '').toLowerCase();
  if (n.includes('rodillo')) return 'rodillo';
  if (n.includes('cinta')) return 'cinta';
  if (/esp[aá]tula/.test(n)) return 'espatula';
  if (n.includes('bandeja')) return 'bandeja';
  if (/extensi[oó]n/.test(n)) return 'extension';
  return 'brocha';
};

/** Rendimiento (m²/galón a una mano) y manos por defecto para las calculadoras. */
export const coverageFor = (product?: StoreProduct | null): { perCoat: number; coats: number } => ({
  perCoat: product?.coverageM2PerGallon && product.coverageM2PerGallon > 0 ? product.coverageM2PerGallon : 50,
  coats: product?.defaultCoats && product.defaultCoats > 0 ? product.defaultCoats : 2
});

/**
 * Plan de compra para N galones: usa cuñetes solo cuando conviene
 * (múltiplo de 5 o sobran 3+ galones), si no galones sueltos.
 */
export const purchasePlan = (product: StoreProduct | null | undefined, gallons: number): { sizeId: string; count: number; label: string } => {
  const g = Math.max(1, Math.ceil(gallons));
  const hasCunete = Boolean(product?.sizes.some(s => s.id === 'cunete' && s.inStock));
  const hasGalon = Boolean(product?.sizes.some(s => s.id === 'galon' && s.inStock));
  const rem = g % 5;
  if (hasCunete && g >= 5 && (rem === 0 || rem >= 3 || !hasGalon)) {
    const n = Math.ceil(g / 5);
    return { sizeId: 'cunete', count: n, label: `${n} cuñete${n > 1 ? 's' : ''} de 5 galones` };
  }
  return { sizeId: 'galon', count: g, label: `${g} galón${g > 1 ? 'es' : ''}` };
};
