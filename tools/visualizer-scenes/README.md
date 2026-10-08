# Escenas del visualizador

Genera las escenas 3D que usa el visualizador de color de la tienda: por cada escena se
produce la imagen base y una máscara (blanco = superficie que se pinta: muros, fachada,
piso o carrocería). La tienda aplica el color sobre la máscara conservando luces y sombras.

- `scenes/hogar.js`: sala, dormitorio, comedor
- `scenes/more.js`: fachadas, pisos industriales y automotriz
- Para marcar algo como pintable se envuelve el objeto con `paintable(...)`.

Renderizar (requiere Playwright con Chromium y esbuild):

```bash
npm install
node run.mjs sala dormitorio comedor   # deja out/<escena>-beauty.jpg y out/<escena>-mask.png
```

Luego se copian a `public/visualizer/<escena>.jpg`, `<escena>-mask.png` y `<escena>-thumb.jpg`
(360x225) y se registran en `src/data/visualizerScenes.ts`.
