// Run effects only while visible and allowed by the user's preferences.
export function observeAnimationState(element, update) {
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  let visible = false;
  function refresh() {
    const active = visible && !document.hidden && !preference.matches;
    element.classList.toggle('animations-paused', !active);
    update(active);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      refresh();
    }).observe(element);
  } else {
    visible = true;
  }
  document.addEventListener('visibilitychange', refresh);
  preference.addEventListener('change', refresh);
  refresh();
}
