import { observeAnimationState } from './animation-state.js';

const preference = matchMedia('(prefers-reduced-motion: reduce)');
const animations = new Set();
// Content is visible by default. Entrance effects are an optional enhancement.
if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        observer.unobserve(entry.target);
        if (preference.matches || !entry.target.animate) continue;
        const animation = entry.target.animate(
          [
            { opacity: 0, transform: 'translateY(18px)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 700, easing: 'ease-out' },
        );
        animations.add(animation);
        animation.finished.finally(() => animations.delete(animation)).catch(() => {});
      }
    },
    { threshold: 0.08 },
  );
  document.querySelectorAll('.reveal').forEach((target) => observer.observe(target));
}
preference.addEventListener('change', () => {
  if (preference.matches) animations.forEach((animation) => animation.cancel());
});
const hero = document.querySelector('.hero');
if (hero && matchMedia('(hover: hover) and (pointer: fine)').matches) {
  let frame = 0;
  hero.addEventListener(
    'pointermove',
    (event) => {
      if (preference.matches || frame) return;
      frame = requestAnimationFrame(() => {
        const bounds = hero.getBoundingClientRect();
        hero.style.setProperty(
          '--pointer-x',
          ((event.clientX - bounds.left) / bounds.width) * 100 + '%',
        );
        hero.style.setProperty(
          '--pointer-y',
          ((event.clientY - bounds.top) / bounds.height) * 100 + '%',
        );
        frame = 0;
      });
    },
    { passive: true },
  );
}

const preview = document.querySelector('.creative-demo');
if (preview) {
  observeAnimationState(preview.closest('.project-art'), (active) => {
    if (active) preview.unpauseAnimations?.();
    else {
      preview.pauseAnimations?.();
      preview.setCurrentTime?.(0);
    }
  });
}
