// PF SoCal homepage interactions
(() => {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // Smooth scrolling for in-page navigation
  const links = document.querySelectorAll('a[href^="#"]');
  links.forEach(a => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      const target = document.querySelector(href);
      if (!target) return;

      e.preventDefault();
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      // Update dock active state after a small delay so scroll can start
      window.setTimeout(() => setActive(href.slice(1)), 120);
    });
  });

  const dockItems = document.querySelectorAll(".dock__item");

  function setActive(id) {
    dockItems.forEach(i => i.classList.toggle("is-active", i.dataset.target === id));
    dockItems.forEach(i => {
      if (i.dataset.target === id) i.setAttribute("aria-current", "page");
      else i.removeAttribute("aria-current");
    });
  }

  // Active section tracking (intersection observer)
  const sections = ["home", "pricing", "book", "contact"]
    .map(id => document.getElementById(id))
    .filter(Boolean);

  const obs = new IntersectionObserver((entries) => {
    // Pick the most visible entry
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible?.target?.id) setActive(visible.target.id);
  }, {
    root: null,
    threshold: [0.35, 0.5, 0.65],
  });

  sections.forEach(s => obs.observe(s));
})();
