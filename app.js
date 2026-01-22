// PureFinish mobile hero enhancement: subtle parallax for the car overlay
(() => {
  const carWrap = document.querySelector('.hero__right');
  if (!carWrap) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) return;

  let ticking = false;

  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(() => {
      const y = Math.min(window.scrollY, 260);
      carWrap.style.transform = `translateY(${y * 0.08}px)`;
      ticking = false;
    });
  };

  window.addEventListener('scroll', onScroll, { passive: true });
})();
