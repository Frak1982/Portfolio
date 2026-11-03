import { observeSceneLayout } from './scene-layout.js';
const scene = document.querySelector('.visual');
if (scene) {
  const spots = [
    { selector: '.fr-laptop-pulse', x: 772, y: 575, width: 72, height: 57 },
    { selector: '.fr-heart-pulse', x: 390, y: 474, width: 86, height: 86 },
    { selector: '.fr-forehead-pulse', x: 420, y: 176, width: 62, height: 62 },
  ];
  observeSceneLayout(
    scene,
    spots.map(({ selector, ...spot }) => ({
      ...spot,
      element: scene.querySelector(selector),
    })),
  );
}
