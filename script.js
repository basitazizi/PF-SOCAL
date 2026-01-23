function bookNow() {
  // Replace later with booking.html or booking section
  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
}

function goPackages() {
  // Replace later with pricing.html or pricing section
  document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
}

document.addEventListener('DOMContentLoaded', () => {
  // Set footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  const menuToggle = document.getElementById('mobile-menu');
  const navLinks = document.getElementById('navLinks');

  // Mobile menu toggle
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked + update active state
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when tapping outside
    document.addEventListener('click', (e) => {
      const target = e.target;
      if (!target) return;
      if (!navLinks.contains(target) && !menuToggle.contains(target)) {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Sticky header effect on scroll
  window.addEventListener('scroll', () => {
    const header = document.querySelector('.navbar');
    if (!header) return;

    if (window.scrollY > 50) {
      header.style.backgroundColor = 'rgba(15, 16, 20, 0.95)';
      header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
    } else {
      header.style.backgroundColor = 'transparent';
      header.style.boxShadow = 'none';
    }
  });

  // Active link highlight on scroll (simple)
  const sections = ['home', 'pricing', 'booking', 'contact']
      .map(id => document.getElementById(id))
      .filter(Boolean);

  const links = Array.from(document.querySelectorAll('.nav-links a'));

  const setActive = (id) => {
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
  };

  window.addEventListener('scroll', () => {
    let current = 'home';
    const offset = 120;

    sections.forEach(sec => {
      const rect = sec.getBoundingClientRect();
      if (rect.top - offset <= 0) current = sec.id;
    });

    setActive(current);
  }, { passive: true });
});
