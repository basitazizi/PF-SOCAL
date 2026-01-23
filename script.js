// Function for the 'Book Now' button
function bookNow() {
  alert("Redirecting to booking system...");
  // window.location.href = 'booking.html';
}

// Packages button
function goPackages() {
  alert("Opening packages...");
  // window.location.href = 'pricing.html';
}

// Mobile Menu Interaction
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('mobile-menu');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Close menu when a link is clicked
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // Close menu when tapping outside
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Add sticky header effect on scroll
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
});
