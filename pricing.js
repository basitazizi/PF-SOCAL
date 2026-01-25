document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "pf_booking_selection";

  const chooseButtons = Array.from(document.querySelectorAll(".chooseBtn[data-package]"));
  const addonButtons = Array.from(document.querySelectorAll(".addonBtn[data-addon]"));
  const addonsSection = document.querySelector("#addonsSection");

  const normalize = (s) => String(s || "").trim();

  const pkgNameToSlug = (name) => {
    const n = String(name || "").toLowerCase();
    if (n.includes("rinse")) return "rinse-gloss";
    if (n.includes("paint reset") || n.includes("reset")) return "paint-reset";
    if (n.includes("paint lock") || n.includes("lock")) return "paint-lock";
    return "";
  };

  const loadSelection = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { pkg: null, addons: [], addonsDecision: null };
      const s = JSON.parse(raw);

      // Keep your booking.js compatible:
      // pkg: {slug,name,base} | null
      // addons: [{slug,name,price}]
      return {
        pkg: s.pkg ?? null,
        addons: Array.isArray(s.addons) ? s.addons : [],
        addonsDecision: s.addonsDecision ?? null
      };
    } catch {
      return { pkg: null, addons: [], addonsDecision: null };
    }
  };

  const saveSelection = (sel) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(sel));
  };

  const hasAddonDecision = (sel) => sel.addonsDecision === "none" || sel.addonsDecision === "selected";

  const requireAddonDecision = () => {
    alert("Please choose ONE add-on option first (Interior Essentials, Interior Reset, or No Add-ons).");
    if (addonsSection) addonsSection.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const setSelectedPackageUI = (pkgName) => {
    document.querySelectorAll(".planCard.is-selected").forEach((el) => el.classList.remove("is-selected"));
    const btn = chooseButtons.find((b) => normalize(b.dataset.package) === normalize(pkgName));
    if (!btn) return;
    const card = btn.closest(".planCard");
    if (card) card.classList.add("is-selected");
  };

  const setSelectedAddonsUI = (sel) => {
    // clear UI
    document.querySelectorAll(".addonCard.is-selected").forEach((el) => el.classList.remove("is-selected"));

    addonButtons.forEach((btn) => {
      const slug = btn.dataset.addonSlug;
      const card = btn.closest(".addonCard");

      // Decide what is selected
      const isNone = slug === "none" && sel.addonsDecision === "none";
      const isSelectedAddon =
          sel.addonsDecision === "selected" &&
          Array.isArray(sel.addons) &&
          sel.addons.length === 1 &&
          sel.addons[0]?.slug === slug;

      const isOn = isNone || isSelectedAddon;

      if (card && isOn) card.classList.add("is-selected");

      // Button labels
      if (slug === "none") {
        btn.textContent = isOn ? "Selected ✓" : "Select no add-ons";
      } else {
        btn.textContent = isOn ? "Selected ✓" : "Select this add-on";
      }

      btn.setAttribute("aria-pressed", isOn ? "true" : "false");
    });
  };

  // ----- init from storage -----
  let selection = loadSelection();

  // restore package UI if exists
  const storedPkgName = selection.pkg?.name || "";
  if (storedPkgName) setSelectedPackageUI(storedPkgName);

  // restore addon UI
  setSelectedAddonsUI(selection);

  // ----- add-on selection (RADIO behavior) -----
  addonButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const addonName = normalize(btn.dataset.addon);
      const addonPrice = Number(btn.dataset.addonPrice || 0);
      const slug = btn.dataset.addonSlug;

      selection = loadSelection();

      // ✅ “No Add-ons” becomes the only choice (clears others)
      if (slug === "none") {
        selection.addons = [];
        selection.addonsDecision = "none";
        saveSelection(selection);
        setSelectedAddonsUI(selection);
        return;
      }

      // ✅ Single select real add-on (only one allowed)
      selection.addons = [{ slug, name: addonName, price: addonPrice }];
      selection.addonsDecision = "selected";

      saveSelection(selection);
      setSelectedAddonsUI(selection);
    });
  });

  // ----- package selection (requires addon decision first) -----
  chooseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selection = loadSelection();

      if (!hasAddonDecision(selection)) {
        requireAddonDecision();
        return;
      }

      const pkgName = normalize(btn.dataset.package);
      const base = Number(btn.dataset.price || 0);
      const pkgSlug = pkgNameToSlug(pkgName);

      selection.pkg = { slug: pkgSlug, name: pkgName, base };

      saveSelection(selection);
      setSelectedPackageUI(pkgName);

      // redirect to booking with slug param (your booking.js supports it)
      const params = new URLSearchParams();
      params.set("pkg", pkgSlug || pkgName);
      window.location.href = `booking.html?${params.toString()}`;
    });
  });

  // If another tab updates selection, update UI here too
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      const updated = loadSelection();
      setSelectedAddonsUI(updated);
      const n = updated.pkg?.name || "";
      if (n) setSelectedPackageUI(n);
    }
  });
});
