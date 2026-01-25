/* booking.js */
(function () {
  const STORAGE_KEY = "pf_booking_selection";

  const PACKAGE_MAP = {
    "rinse-gloss": { name: "Rinse & Gloss", base: 160, time: "~2.5 HRS" },
    "paint-reset": { name: "Paint Reset", base: 210, time: "~3–4 HRS" },
    "paint-lock": { name: "Paint Lock (Consultation)", base: 300, time: "By consultation" }
  };

  const ADDON_MAP = {
    "interior-essentials": { name: "Interior Essentials", price: 39 },
    "interior-reset": { name: "Interior Reset", price: 99 }
  };

  const CALENDLY_BASE = "https://calendly.com/abdulbasitazizi816/new-meeting";

  const $ = (sel) => document.querySelector(sel);

  function money(n) {
    return `$${Number(n || 0).toFixed(0)}`;
  }

  function nameToSlug(name) {
    const n = String(name || "").toLowerCase().trim();
    if (!n) return "";
    if (n.includes("rinse")) return "rinse-gloss";
    if (n.includes("reset")) return "paint-reset";
    if (n.includes("lock")) return "paint-lock";
    if (n.includes("essentials")) return "interior-essentials";
    if (n.includes("interior reset")) return "interior-reset";
    return "";
  }

  function safeLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { pkg: "", addons: [] };

      const s = JSON.parse(raw);

      let pkgSlug = "";
      if (typeof s.pkg === "string") pkgSlug = s.pkg;
      else if (s.pkg && typeof s.pkg.slug === "string") pkgSlug = s.pkg.slug;
      else if (s.pkg && typeof s.pkg.name === "string") pkgSlug = nameToSlug(s.pkg.name);

      let addons = Array.isArray(s.addons) ? s.addons : [];
      addons = addons
          .map((a) =>
              typeof a === "string" ? a : (a && a.slug) ? a.slug : nameToSlug(a?.name || "")
          )
          .filter(Boolean);

      return { pkg: pkgSlug, addons };
    } catch {
      return { pkg: "", addons: [] };
    }
  }

  function updateSummary(sel) {
    const pkg = PACKAGE_MAP[sel.pkg];

    $("#summaryTitle").textContent = pkg ? pkg.name : "Choose a package";
    $("#summaryNote").textContent = pkg
        ? "Estimate updates as you add options."
        : "Select a package to see an estimate.";

    $("#summaryPkg").textContent = pkg ? pkg.name : "—";
    $("#summaryTime").textContent = pkg ? pkg.time : "—";
    $("#summaryBase").textContent = pkg ? money(pkg.base) : "$0";

    const list = $("#summaryAddons");
    list.innerHTML = "";

    const addonItems = (sel.addons || [])
        .map((slug) => ADDON_MAP[slug])
        .filter(Boolean);

    if (!addonItems.length) {
      const empty = document.createElement("div");
      empty.className = "addonEmpty";
      empty.textContent = "No add-ons selected.";
      list.appendChild(empty);
    } else {
      addonItems.forEach((item) => {
        const row = document.createElement("div");
        row.className = "addonItem";
        row.innerHTML = `<span>${item.name}</span><span>${money(item.price)}</span>`;
        list.appendChild(row);
      });
    }

    const base = pkg ? pkg.base : 0;
    const addonsTotal = addonItems.reduce((s, a) => s + (a.price || 0), 0);
    $("#summaryTotal").textContent = money(base + addonsTotal);
  }

  // Send your selection into Calendly as query params.
  // Note: Calendly can capture these if you add custom questions in Calendly settings.
  // Common pattern: a1, a2, a3... for custom answers.
  function buildCalendlyUrl(sel) {
    const pkg = PACKAGE_MAP[sel.pkg]?.name || "Not selected";
    const addons = (sel.addons || [])
        .map((slug) => ADDON_MAP[slug]?.name)
        .filter(Boolean);

    const addonsText = addons.length ? addons.join(", ") : "None";
    const total =
        (PACKAGE_MAP[sel.pkg]?.base || 0) +
        (sel.addons || []).reduce((sum, slug) => sum + (ADDON_MAP[slug]?.price || 0), 0);

    const url = new URL(CALENDLY_BASE);

    // Put key info into custom fields:
    url.searchParams.set("a1", `Package: ${pkg}`);
    url.searchParams.set("a2", `Add-ons: ${addonsText}`);
    url.searchParams.set("a3", `Estimate: $${total}`);

    return url.toString();
  }

  // Calendly widget script reads data-url at load.
  // If we want it to reflect the selected package, we re-init it after setting URL.
  function initCalendly(sel) {
    const el = $("#calendlyWidget");
    if (!el) return;

    const calendlyUrl = buildCalendlyUrl(sel);
    el.setAttribute("data-url", calendlyUrl);

    // If Calendly has already loaded, re-render it:
    // (This is safe; it just re-inits the widget.)
    const tryInit = () => {
      if (!window.Calendly || !window.Calendly.initInlineWidget) return false;

      el.innerHTML = ""; // clear existing widget
      window.Calendly.initInlineWidget({
        url: calendlyUrl,
        parentElement: el
      });
      return true;
    };

    if (!tryInit()) {
      // If script hasn't loaded yet, poll briefly
      let tries = 0;
      const t = setInterval(() => {
        tries += 1;
        if (tryInit() || tries > 40) clearInterval(t); // ~4s max
      }, 100);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    const sel = safeLoad();
    updateSummary(sel);
    initCalendly(sel);

    // If pricing selection changes in another tab, update summary + calendly
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        const updated = safeLoad();
        updateSummary(updated);
        initCalendly(updated);
      }
    });
  });
})();
