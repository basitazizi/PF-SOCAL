// pricing.js — selection + saving + redirect to booking
document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "pf_booking_selection";

  const chooseButtons = Array.from(document.querySelectorAll(".chooseBtn[data-package]"));
  const addonButtons = Array.from(document.querySelectorAll(".addonBtn[data-addon]"));

  // ----- Helpers -----
  const loadSelection = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { pkg: null, addons: [] };
      const parsed = JSON.parse(raw);
      return {
        pkg: parsed.pkg ?? null,
        addons: Array.isArray(parsed.addons) ? parsed.addons : [],
      };
    } catch {
      return { pkg: null, addons: [] };
    }
  };

  const saveSelection = (sel) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
  };

  const normalize = (s) => String(s || "").trim();

  const setSelectedPackageUI = (pkgName) => {
    // Remove previous selected state
    document.querySelectorAll(".planCard.is-selected").forEach((el) => el.classList.remove("is-selected"));

    // Add selected state to the card that contains the button with this package
    const btn = chooseButtons.find((b) => normalize(b.dataset.package) === normalize(pkgName));
    if (!btn) return;

    const card = btn.closest(".planCard");
    if (card) card.classList.add("is-selected");
  };

  const setSelectedAddonsUI = (addonsArr) => {
    const set = new Set(addonsArr.map(normalize));

    // Clear selected states
    document.querySelectorAll(".addonCard.is-selected").forEach((el) => el.classList.remove("is-selected"));

    addonButtons.forEach((btn) => {
      const name = normalize(btn.dataset.addon);
      const card = btn.closest(".addonCard");

      const isOn = set.has(name);

      if (card && isOn) card.classList.add("is-selected");

      // Update button label (fix: never show add-ons unless actually selected)
      btn.textContent = isOn ? "Added ✓" : "Add this add-on";

      // Optional: aria pressed
      btn.setAttribute("aria-pressed", isOn ? "true" : "false");
    });
  };

  // ----- Initialize from storage -----
  let selection = loadSelection();
  if (!selection.addons) selection.addons = [];
  setSelectedPackageUI(selection.pkg?.name);
  setSelectedAddonsUI(selection.addons);

  // ----- Package selection -----
  chooseButtons.forEach((btn) => {
    // Clicking the CARD could also select (optional) — but we won't touch markup.
    btn.addEventListener("click", () => {
      const pkgName = normalize(btn.dataset.package);
      const pkgPrice = Number(btn.dataset.price || 0);

      // Save selected package
      selection = loadSelection();
      selection.pkg = { name: pkgName, price: pkgPrice };
      if (!Array.isArray(selection.addons)) selection.addons = [];

      saveSelection(selection);

      // Update UI
      setSelectedPackageUI(pkgName);

      // Go to booking page with package in URL too (extra reliability)
      const params = new URLSearchParams();
      params.set("pkg", pkgName);
      window.location.href = `booking.html?${params.toString()}`;
    });
  });

  // ----- Add-on toggle -----
  addonButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const addonName = normalize(btn.dataset.addon);
      const addonPrice = Number(btn.dataset.addonPrice || 0);

      selection = loadSelection();
      if (!Array.isArray(selection.addons)) selection.addons = [];

      const idx = selection.addons.findIndex((a) => normalize(a.name || a) === addonName);

      // We store addons as objects for pricing in booking
      // but also support old string format safely.
      if (idx >= 0) {
        selection.addons.splice(idx, 1);
      } else {
        selection.addons.push({ name: addonName, price: addonPrice });
      }

      saveSelection(selection);

      // Update UI: pass just names for display
      const addonNames = selection.addons.map((a) => normalize(a.name || a));
      setSelectedAddonsUI(addonNames);
    });
  });
});
