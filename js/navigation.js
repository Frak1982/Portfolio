const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');

function findTarget(hash) {
  try {
    return hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null;
  } catch {
    return null;
  }
}

function goToSection(target, animate = true) {
  // Move keyboard focus with the section, without adding a permanent tab stop.
  if (!target.hasAttribute('tabindex')) {
    target.setAttribute('tabindex', '-1');
    target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
  }
  target.focus({ preventScroll: true });
  target.scrollIntoView({
    behavior: animate && !reducedMotion.matches ? 'smooth' : 'instant',
    block: 'start',
  });
}

// Accept existing section links (including links from the privacy page), then
// leave a clean address for copying and sharing.
const initialTarget = findTarget(location.hash);
const cleanPath = location.pathname.replace(/\/index\.html$/, '/') + location.search;
if (location.hash || cleanPath !== location.pathname + location.search) {
  history.replaceState(history.state, '', cleanPath);
}
let pendingInitialTarget = initialTarget;
if (initialTarget) {
  const navigateOnLoad = () => {
    if (pendingInitialTarget) goToSection(pendingInitialTarget, false);
    pendingInitialTarget = null;
  };
  if (document.readyState === 'complete') navigateOnLoad();
  else window.addEventListener('load', navigateOnLoad, { once: true });
}

for (const link of document.querySelectorAll('a[href^="#"]')) {
  link.addEventListener('click', (event) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    )
      return;
    const target = findTarget(link.hash);
    if (!target) return;
    event.preventDefault();
    pendingInitialTarget = null;
    goToSection(target);
  });
}
