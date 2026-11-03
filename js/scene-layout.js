// Coordinates refer to the 1122 × 720 image. CSS owns the responsive crop.
export function observeSceneLayout(scene, items) {
  function align() {
    const width = scene.clientWidth,
      height = scene.clientHeight;
    if (!width || !height) return;
    const styles = getComputedStyle(scene);
    const positionX = parseFloat(styles.getPropertyValue('--scene-x')) / 100;
    const positionY = parseFloat(styles.getPropertyValue('--scene-y')) / 100;
    const scale = Math.max(width / 1122, height / 720);
    for (const { element, x, y, width: itemWidth, height: itemHeight, font } of items) {
      if (!element) continue;
      element.style.left = (width - 1122 * scale) * positionX + x * scale + 'px';
      element.style.top = (height - 720 * scale) * positionY + y * scale + 'px';
      element.style.width = itemWidth * scale + 'px';
      element.style.height = itemHeight * scale + 'px';
      if (font) {
        element.style.fontSize = font * scale + 'px';
        element.style.setProperty('--editor-bar-height', 13 * scale + 'px');
        element.style.setProperty('--editor-bar-font', 7 * scale + 'px');
      }
    }
  }
  if ('ResizeObserver' in window) new ResizeObserver(align).observe(scene);
  window.addEventListener('resize', align, { passive: true });
  align();
}
