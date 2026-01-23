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

    // Home header style on scroll
    window.addEventListener('scroll', () => {
        const header = document.getElementById('siteHeader');
        if (!header) return;

        if (window.scrollY > 50) {
            header.style.backgroundColor = 'rgba(15, 16, 20, 0.95)';
            header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.5)';
            header.style.backdropFilter = 'blur(10px)';
        } else {
            header.style.backgroundColor = 'transparent';
            header.style.boxShadow = 'none';
            header.style.backdropFilter = 'none';
        }
    }, { passive: true });
});
