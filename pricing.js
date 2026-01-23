document.addEventListener("DOMContentLoaded", () => {
  // year
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // billing toggle
  const toggle = document.getElementById("billingToggle");
  const amounts = document.querySelectorAll(".amount");

  const setAnnual = (isAnnual) => {
    toggle.classList.toggle("isOn", isAnnual);
    toggle.setAttribute("aria-checked", String(isAnnual));

    amounts.forEach((el) => {
      const value = isAnnual ? el.dataset.annual : el.dataset.month;
      el.textContent = value;
    });
  };

  // default: monthly
  if (toggle) {
    setAnnual(false);
    toggle.addEventListener("click", () => {
      const isAnnual = toggle.getAttribute("aria-checked") === "true";
      setAnnual(!isAnnual);
    });
  }
});
