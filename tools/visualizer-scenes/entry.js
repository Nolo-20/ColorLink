import { render } from './lib.js';
import * as hogar from './scenes/hogar.js';
import * as more from './scenes/more.js';
const SCENES = { ...hogar, ...more };
window.SCENES = SCENES;
window.renderScene = (name, mode, w, h) => render(SCENES[name], { mode, width: w, height: h });
