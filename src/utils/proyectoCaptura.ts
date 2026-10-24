import { ProjectFormData } from '../types';
import { fechaEnDias, validarProyecto, ResultadoValidacion } from '../shared/validacionProyecto';

/**
 * Reduce una foto a máx. 1600 px y la pasa a JPG: así 5 fotos caben en una sola solicitud
 * y la IA las sigue viendo nítidas. Devuelve un data URI.
 */
export async function comprimirImagen(file: File, maxLado = 1600, calidad = 0.85): Promise<string> {
  const original: string = await new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new Error(`No se pudo leer ${file.name}.`));
    r.readAsDataURL(file);
  });
  try {
    const img: HTMLImageElement = await new Promise((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error('imagen'));
      i.src = original;
    });
    const escala = Math.min(1, maxLado / Math.max(img.naturalWidth, img.naturalHeight));
    const c = document.createElement('canvas');
    c.width = Math.max(1, Math.round(img.naturalWidth * escala));
    c.height = Math.max(1, Math.round(img.naturalHeight * escala));
    const ctx = c.getContext('2d');
    if (!ctx) return original;
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.drawImage(img, 0, 0, c.width, c.height);
    const jpg = c.toDataURL('image/jpeg', calidad);
    return jpg.length < original.length ? jpg : original;
  } catch {
    return original;
  }
}

/** Datos del formulario en el formato que esperan el servidor y las reglas compartidas. */
export const datosProyecto = (f: ProjectFormData) => ({
  nombreProyecto: (f.proyecto || '').trim().replace(/\s+/g, ' '),
  ciudad: f.ciudad,
  tipoProyecto: f.tipoProyecto,
  area: f.areaM2,
  tipoSuperficie: f.superficie,
  ambiente: f.ambiente,
  condiciones: f.condiciones,
  fechaRequerida: fechaEnDias(f.fechaRequeridaDias),
  descripcion: (f.descripcion || '').trim(),
  consentimientoDatos: f.consentimientoDatos === true,
  canalOrigen: f.canalOrigen || 'web_portal',
  color: f.color || null,
  colorHex: f.colorHex || null
});

export const fotosDe = (f: ProjectFormData): string[] =>
  (f.fotos || []).map(x => (x as any).base64 as string | undefined).filter((x): x is string => !!x);

export const validarFormulario = (f: ProjectFormData): ResultadoValidacion => {
  const d = datosProyecto(f);
  return validarProyecto({ ...d, colorHex: d.colorHex || '', descripcion: d.descripcion });
};
