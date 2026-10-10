import { STORE_PRODUCTS } from '../data/storeProducts';
import type { StoreProduct } from '../types';

/** Minúsculas y sin tildes: "Epóxico" -> "epoxico" */
export const normalizar = (s: string = '') =>
  s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s]/g, ' ').replace(/\s+/g, ' ').trim();

// Sinónimos frecuentes de quien busca pintura
const SINONIMOS: Record<string, string[]> = {
  pintura: ['vinilo', 'esmalte', 'koraza', 'viniltex'],
  vinilo: ['viniltex'],
  fachada: ['koraza', 'exterior'],
  exterior: ['koraza', 'fachada'],
  impermeabilizante: ['koraza', 'fill', 'impermeable'],
  piso: ['epoxico', 'pisos'],
  pisos: ['epoxico'],
  carro: ['poliuretano', 'automotriz'],
  auto: ['poliuretano', 'automotriz'],
  metal: ['esmalte', 'pintulux'],
  madera: ['esmalte', 'pintulux'],
  brochas: ['brocha'],
  rodillos: ['rodillo'],
  cinta: ['enmascarar'],
  galon: ['galon'],
  cunete: ['cunete', '5 galones']
};

/** Distancia de edición limitada (para tolerar un error de tipeo: "korasa", "vinitex") */
function cercano(a: string, b: string): boolean {
  if (Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, dif = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) { i++; j++; continue; }
    if (++dif > 1) return false;
    if (a.length > b.length) i++;
    else if (b.length > a.length) j++;
    else { i++; j++; }
  }
  return dif + (a.length - i) + (b.length - j) <= 1;
}

interface Indexado { p: StoreProduct; nombre: string; palabras: string[]; todo: string }

let indice: Indexado[] | null = null;
const getIndice = (): Indexado[] => {
  if (indice) return indice;
  indice = STORE_PRODUCTS.map(p => {
    const nombre = normalizar(`${p.name} ${p.brand || ''}`);
    const extra = normalizar([
      (p as any).subtitle, p.categoryLabel, p.category, p.description,
      ...(p.colors || []).map(c => c.name),
      ...(p.sizes || []).map(s => s.name)
    ].filter(Boolean).join(' '));
    const todo = `${nombre} ${extra}`;
    return { p, nombre, palabras: Array.from(new Set(todo.split(' ').filter(Boolean))), todo };
  });
  return indice;
};

/**
 * Busca productos de la tienda. Cada palabra escrita debe aparecer (como inicio de palabra,
 * dentro del texto o con un error de tipeo). Ordena dando más peso a lo que coincide en el nombre.
 */
export function buscarProductos(consulta: string, limite = 50): StoreProduct[] {
  const q = normalizar(consulta).slice(0, 80);
  if (!q) return [];
  const tokens = q.split(' ').filter(t => t.length > 0);
  const resultados: Array<{ p: StoreProduct; puntos: number }> = [];

  for (const item of getIndice()) {
    let puntos = 0;
    let todas = true;
    for (const t of tokens) {
      const alternativas = [t, ...(SINONIMOS[t] || [])];
      let mejor = 0;
      for (const alt of alternativas) {
        const peso = alt === t ? 1 : 0.6;
        if (item.nombre.split(' ').some(w => w.startsWith(alt))) mejor = Math.max(mejor, 10 * peso);
        else if (item.nombre.includes(alt)) mejor = Math.max(mejor, 7 * peso);
        else if (item.palabras.some(w => w.startsWith(alt))) mejor = Math.max(mejor, 4 * peso);
        else if (item.todo.includes(alt)) mejor = Math.max(mejor, 2 * peso);
        else if (alt.length >= 4 && item.palabras.some(w => cercano(alt, w.slice(0, alt.length + 1)) || cercano(alt, w))) mejor = Math.max(mejor, 3 * peso);
      }
      if (!mejor) { todas = false; break; }
      puntos += mejor;
    }
    if (todas) {
      if (item.nombre.startsWith(q)) puntos += 8;
      resultados.push({ p: item.p, puntos });
    }
  }
  return resultados.sort((a, b) => b.puntos - a.puntos || a.p.name.localeCompare(b.p.name)).slice(0, limite).map(r => r.p);
}

/** Precio más bajo del producto (entre sus presentaciones) */
export const precioDesde = (p: StoreProduct): number =>
  Math.min(...(p.sizes || []).map(s => Number(s.price) || Infinity), Number((p as any).price) || Infinity);
