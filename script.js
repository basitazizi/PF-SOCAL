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
// ===== 3 Video Strip: click-to-play (added) =====
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".video-card");

  function stopAll(exceptVideo) {
    cards.forEach((card) => {
      const v = card.querySelector("video");
      if (!v) return;

      if (v !== exceptVideo) {
        v.pause();
        card.classList.remove("is-playing");
        v.controls = false;
      }
    });
  }

  cards.forEach((card) => {
    const btn = card.querySelector(".video-play");
    const video = card.querySelector("video");
    if (!btn || !video) return;

    btn.addEventListener("click", async () => {
      // only one plays at a time
      stopAll(video);

      card.classList.add("is-playing");
      video.controls = true;

      try {
        await video.play();
      } catch (e) {
        // autoplay blocked on some browsers until user taps again; controls still show
      }
    });

    // If user pauses manually, show overlay again
    video.addEventListener("pause", () => {
      // If it's paused because it ended, show overlay too
      if (!video.ended) {
        card.classList.remove("is-playing");
        video.controls = false;
      }
    });

    video.addEventListener("ended", () => {
      card.classList.remove("is-playing");
      video.controls = false;
      video.currentTime = 0;
    });
  });
});
