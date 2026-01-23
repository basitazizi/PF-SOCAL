function bookNow() {
    // Later: window.location.href = 'booking.html';
    alert("Booking coming next — we’ll link this to your booking page.");
}

function goPackages() {
    // Later: window.location.href = 'pricing.html';
    alert("Packages coming next — we’ll link this to your pricing page.");
}

document.addEventListener('DOMContentLoaded', () => {
    // Footer year
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = String(new Date().getFullYear());

    // Mobile menu
    const menuToggle = document.getElementById('mobile-menu');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            const isOpen = navLinks.classList.toggle('open');
            menuToggle.setAttribute('aria-expanded', String(isOpen));
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

    // Sticky header effect
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
    }, { passive: true });
});
