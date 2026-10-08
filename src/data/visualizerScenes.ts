// Fotos reales de ambientes para el visualizador de color.
// Cada escena tiene la foto base y una máscara exacta (blanco = superficie que se pinta).
export interface VisualizerScene {
  id: string;
  name: string;
  surface: string;
}

export type VisualizerCategory = 'hogar' | 'construccion' | 'industrial' | 'automotriz';

export const VISUALIZER_SCENES: Record<VisualizerCategory, VisualizerScene[]> = {
  hogar: [
    { id: 'sala', name: 'Sala de Estar', surface: 'Muros interiores' },
    { id: 'dormitorio', name: 'Dormitorio', surface: 'Muros interiores' },
    { id: 'comedor', name: 'Comedor', surface: 'Muros interiores' }
  ],
  construccion: [
    { id: 'casa_moderna', name: 'Casa Moderna', surface: 'Fachada exterior' },
    { id: 'casa_colonial', name: 'Casa Tradicional', surface: 'Fachada exterior' },
    { id: 'edificio', name: 'Edificio', surface: 'Fachada exterior' }
  ],
  industrial: [
    { id: 'bodega', name: 'Bodega', surface: 'Piso epóxico' },
    { id: 'parqueadero', name: 'Parqueadero', surface: 'Piso de alto tráfico' },
    { id: 'planta', name: 'Planta Industrial', surface: 'Piso industrial' }
  ],
  automotriz: [
    { id: 'carro_lateral', name: 'Vista Lateral', surface: 'Carrocería' },
    { id: 'carro_exterior', name: 'Vista Frontal', surface: 'Carrocería' },
    { id: 'carro_garaje', name: 'Vista Trasera', surface: 'Carrocería' }
  ]
};

export const sceneImage = (id: string) => `/visualizer/${id}.jpg`;
export const sceneMask = (id: string) => `/visualizer/${id}-mask.png`;
export const sceneThumb = (id: string) => `/visualizer/${id}-thumb.jpg`;

export const scenesForCategory = (category?: string): VisualizerScene[] =>
  VISUALIZER_SCENES[(category as VisualizerCategory)] || VISUALIZER_SCENES.hogar;
