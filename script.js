document.addEventListener('DOMContentLoaded', () => {
  // footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // mobile nav toggle
  const menuToggle = document.getElementById('mobile-menu');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // close when clicking outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }
});
// Booking + Contact button wiring (no design changes)
document.addEventListener("DOMContentLoaded", () => {
  const bookingLinks = document.querySelectorAll('[data-go="booking"]');
  const contactLinks = document.querySelectorAll('[data-go="contact"]');

  bookingLinks.forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "booking.html";
    });
  });

  contactLinks.forEach(a => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      window.location.href = "contact.html";
    });
  });
});
