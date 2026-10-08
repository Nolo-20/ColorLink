/**
 * Fotos reales para el visualizador de color, generadas con Gemini en el servidor.
 *
 * Por cada escena se guardan dos imágenes:
 *  - base: foto realista del ambiente con la superficie en un color neutro
 *  - ref:  la MISMA foto con solo la superficie pintable en magenta
 * El navegador compara ambas para obtener el recorte exacto de la superficie y
 * aplica encima cualquier color del inventario conservando luces y sombras.
 *
 * Se generan solas al arrancar el servidor (una vez por escena) si hay GEMINI_API_KEY.
 * Variables opcionales:
 *  - VISUALIZER_AUTOGEN=false        desactiva la generación automática
 *  - VISUALIZER_REGENERATE=sala,bodega  vuelve a generar esas escenas en el próximo arranque
 *  - GEMINI_IMAGE_MODEL=<modelo>      fuerza un modelo de imagen
 */
import fs from 'fs';
import path from 'path';
import type { Express } from 'express';
import express from 'express';
import { GoogleGenAI } from '@google/genai';

export const VISUALIZER_DIR = process.env.VISUALIZER_DIR || path.join(process.cwd(), 'data', 'visualizer');
const MANIFEST = path.join(VISUALIZER_DIR, 'manifest.json');

type Surface = 'walls' | 'facade' | 'floor' | 'car';

interface SceneSpec { id: string; surface: Surface; description: string }

const SCENES: SceneSpec[] = [
  { id: 'sala', surface: 'walls', description: 'A bright, tidy living room in a modern apartment in Medellín, Colombia: a light-grey fabric sofa against the main wall, a round wooden coffee table, a jute rug, a floor lamp and a potted plant, light wooden floor, a window with sheer curtains on the left side. Large areas of plain painted wall are clearly visible behind and beside the sofa.' },
  { id: 'dormitorio', surface: 'walls', description: 'A calm master bedroom: a double bed with white linen and an upholstered headboard against the main wall, two wooden nightstands with ceramic lamps, one small framed print, wooden floor, soft daylight. Large areas of plain painted wall are clearly visible.' },
  { id: 'comedor', surface: 'walls', description: 'A dining room in a Colombian home: a wooden dining table with six chairs, two pendant lamps above it, a low sideboard against the wall, wooden floor, daylight from a side window. Large areas of plain painted wall are clearly visible.' },
  { id: 'casa_moderna', surface: 'facade', description: 'Front three-quarter view of a modern two-story house in a residential neighborhood of Medellín, Colombia: flat roof, large windows with dark frames, a wooden front door, a small front garden with grass and shrubs, a paved driveway, clear blue sky, sunny afternoon.' },
  { id: 'casa_colonial', surface: 'facade', description: 'A traditional two-story Colombian colonial-style house like those in towns of Antioquia: clay tile roof, a wooden balcony, wooden doors and windows with white trim, stone sidewalk, sunny day, blue sky.' },
  { id: 'edificio', surface: 'facade', description: 'A mid-rise residential apartment building (six floors) in Medellín seen from the street at a slight angle: balconies with glass railings, shops on the ground floor, trees on the sidewalk, sunny day, blue sky.' },
  { id: 'bodega', surface: 'floor', description: 'Interior of a large logistics warehouse: tall metal pallet racks full of cardboard boxes on both sides, a forklift, LED high-bay lights, a wide open floor in the foreground occupying the lower half of the photo.' },
  { id: 'parqueadero', surface: 'floor', description: 'An underground parking garage: concrete columns, a few parked cars, ceiling lights, a wide open floor in the foreground occupying the lower half of the photo.' },
  { id: 'planta', surface: 'floor', description: 'A clean manufacturing plant: industrial machines, safety railings, a wide open floor in the foreground occupying the lower half of the photo, bright even lighting.' },
  { id: 'carro_lateral', surface: 'car', description: 'A modern mid-size sedan photographed from the side in a professional photo studio with a seamless light-grey background and soft studio lighting.' },
  { id: 'carro_exterior', surface: 'car', description: 'A modern mid-size sedan parked on a residential street in Medellín, three-quarter front view, sunny day, houses and trees in the background.' },
  { id: 'carro_garaje', surface: 'car', description: 'A modern mid-size sedan inside a clean automotive body and paint workshop, three-quarter rear view, tools on the wall, bright work lights.' }
];

const SURFACE_TEXT: Record<Surface, { base: string; target: string; keep: string }> = {
  walls: {
    base: 'All the walls are painted in a plain, uniform, smooth matte off-white paint (no wallpaper, no texture, no murals, no wood panels).',
    target: 'the painted interior walls',
    keep: 'ceiling, floor, baseboards, doors, windows, curtains, frames, artwork, furniture, lamps and plants'
  },
  facade: {
    base: 'The exterior facade walls are painted in a plain, uniform, smooth matte off-white paint (no brick, no stone cladding on the main walls).',
    target: 'the painted exterior facade walls',
    keep: 'roof, windows, glass, doors, balconies, railings, trim, ground, plants, trees, sky and sidewalk'
  },
  floor: {
    base: 'The floor is a uniform, smooth, light-grey epoxy coating with a soft sheen and subtle reflections (no tiles, no cracks).',
    target: 'the floor surface',
    keep: 'walls, columns, racks, boxes, vehicles, machines, safety lines painted on the floor, railings and lights'
  },
  car: {
    base: 'The car body paint is a plain glossy silver-white.',
    target: 'the painted body panels of the car',
    keep: 'windows, glass, tires, wheels, rims, headlights, taillights, grille, chrome trims, mirrors glass and the background'
  }
};

const basePrompt = (s: SceneSpec) =>
  `Photorealistic professional photograph, natural realistic lighting, shot with a full-frame camera and a 24mm lens at eye level, landscape 16:9. ${s.description} ${SURFACE_TEXT[s.surface].base} No people, no text, no logos, no watermarks.`;

const editPrompt = (s: SceneSpec) =>
  `Edit this exact photo. Repaint ONLY ${SURFACE_TEXT[s.surface].target} with a flat, solid, fully saturated magenta color (#FF00FF), keeping the natural shading. ` +
  `Everything else must stay exactly identical to the original: same camera, framing, perspective and resolution, and the same ${SURFACE_TEXT[s.surface].keep}. Do not add, move or remove anything.`;

interface ManifestEntry { base: string; ref: string; model: string; createdAt: string }
type Manifest = { scenes: Record<string, ManifestEntry>; regenerated?: string };

function readManifest(): Manifest {
  try { return JSON.parse(fs.readFileSync(MANIFEST, 'utf8')); } catch { return { scenes: {} }; }
}
function writeManifest(m: Manifest) {
  fs.mkdirSync(VISUALIZER_DIR, { recursive: true });
  fs.writeFileSync(MANIFEST, JSON.stringify(m, null, 2));
}

const extFor = (mime: string) => (mime.includes('png') ? 'png' : mime.includes('webp') ? 'webp' : 'jpg');

let preferredModel: string | null = null;

async function requestImage(ai: GoogleGenAI, parts: any[]): Promise<{ data: string; mimeType: string; model: string }> {
  const models = [preferredModel, process.env.GEMINI_IMAGE_MODEL, 'gemini-3.1-flash-image-preview', 'gemini-3.1-flash-image', 'gemini-3-pro-image-preview', 'gemini-2.5-flash-image']
    .filter((m, i, a): m is string => !!m && a.indexOf(m) === i);
  let lastError: any = null;
  for (const model of models) {
    try {
      const resp: any = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts }],
        config: { responseModalities: ['TEXT', 'IMAGE'], imageConfig: { aspectRatio: '16:9' } } as any
      });
      const img = resp?.candidates?.[0]?.content?.parts?.find((p: any) => p?.inlineData?.data);
      if (img) {
        preferredModel = model;
        return { data: img.inlineData.data, mimeType: img.inlineData.mimeType || 'image/png', model };
      }
      lastError = new Error('La respuesta no trajo imagen');
    } catch (e: any) {
      lastError = e;
      console.error(`[VISUALIZER] Modelo ${model} falló:`, e?.message || e);
    }
  }
  throw lastError || new Error('Ningún modelo de imagen respondió');
}

async function generateScene(ai: GoogleGenAI, s: SceneSpec): Promise<ManifestEntry> {
  const base = await requestImage(ai, [{ text: basePrompt(s) }]);
  const ref = await requestImage(ai, [{ inlineData: { mimeType: base.mimeType, data: base.data } }, { text: editPrompt(s) }]);
  const stamp = Date.now();
  const baseFile = `${s.id}-${stamp}.${extFor(base.mimeType)}`;
  const refFile = `${s.id}-${stamp}-ref.${extFor(ref.mimeType)}`;
  fs.mkdirSync(VISUALIZER_DIR, { recursive: true });
  fs.writeFileSync(path.join(VISUALIZER_DIR, baseFile), Buffer.from(base.data, 'base64'));
  fs.writeFileSync(path.join(VISUALIZER_DIR, refFile), Buffer.from(ref.data, 'base64'));
  return { base: baseFile, ref: refFile, model: ref.model, createdAt: new Date().toISOString() };
}

let running = false;

export async function generateMissingScenes(forceIds: string[] = []) {
  let force = forceIds;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || running) return;
  running = true;
  try {
    const ai = new GoogleGenAI({ apiKey });
    const manifest = readManifest();
    // VISUALIZER_REGENERATE se aplica una sola vez por valor (no vuelve a cobrar en cada reinicio)
    const forceKey = force.join(',');
    if (forceKey && manifest.regenerated === forceKey) force = [];
    const pending = SCENES.filter(s => force.includes(s.id) || !manifest.scenes[s.id]);
    if (forceKey) { manifest.regenerated = forceKey; writeManifest(manifest); }
    if (!pending.length) return;
    console.log(`[VISUALIZER] Generando ${pending.length} escena(s) con fotos reales…`);
    for (const s of pending) {
      try {
        const old = manifest.scenes[s.id];
        manifest.scenes[s.id] = await generateScene(ai, s);
        writeManifest(manifest);
        if (old) for (const f of [old.base, old.ref]) fs.rm(path.join(VISUALIZER_DIR, f), { force: true }, () => {});
        console.log(`[VISUALIZER] Escena ${s.id} lista (${manifest.scenes[s.id].model}).`);
      } catch (e: any) {
        console.error(`[VISUALIZER] No se pudo generar ${s.id}:`, e?.message || e);
      }
    }
  } finally {
    running = false;
  }
}

export function registerVisualizerRoutes(app: Express) {
  app.use('/visualizer-real', express.static(VISUALIZER_DIR, { maxAge: '30d', immutable: true }));
  app.get('/api/visualizer/manifest', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.json(readManifest());
  });
}

export function startVisualizerAutogen() {
  if (process.env.VISUALIZER_AUTOGEN === 'false' || !process.env.GEMINI_API_KEY) return;
  const force = (process.env.VISUALIZER_REGENERATE || '').split(',').map(s => s.trim()).filter(Boolean);
  // Arranca unos segundos después para no competir con el inicio del servidor
  setTimeout(() => { generateMissingScenes(force).catch(e => console.error('[VISUALIZER]', e)); }, 5000);
}
