/* booking.js */
(function () {
  const STORAGE_KEY = "pf_booking_selection";

  const PACKAGE_MAP = {
    "rinse-gloss": { name: "Rinse & Gloss", base: 160, timeMin: 2, timeMax: 3 },
    "paint-reset": { name: "Paint Reset", base: 210, timeMin: 3, timeMax: 4 },
    "paint-lock": { name: "Paint Lock (Consultation)", base: 300, timeMin: 0, timeMax: 0, timeText: "By consultation" }
  };

  const ADDON_MAP = {
    "interior-essentials": { name: "Interior Essentials", price: 39, timeMin: 0.5, timeMax: 0.75 },
    "interior-reset": { name: "Interior Reset", price: 99, timeMin: 1.5, timeMax: 1.5 }
  };

  const CALENDLY_BASE = "https://calendly.com/puref-socal/pure-finish?primary_color=2596be";

  const $ = (sel) => document.querySelector(sel);

  function money(n) {
    return `$${Number(n || 0).toFixed(0)}`;
  }

  function formatTime(hours) {
    if (hours === 0) return "";
    if (hours < 1) {
      const minutes = Math.round(hours * 60);
      return `${minutes} min`;
    }
    const wholeHours = Math.floor(hours);
    const minutes = Math.round((hours - wholeHours) * 60);
    if (minutes === 0) {
      return `${wholeHours} hr${wholeHours > 1 ? 's' : ''}`;
    }
    return `${wholeHours}.${minutes > 30 ? '5' : '0'} hrs`;
  }

  function calculateTotalTime(pkg, addons) {
    if (!pkg) return "";

    // Special case: Paint Lock
    if (pkg.timeText) return pkg.timeText;

    let minTime = pkg.timeMin || 0;
    let maxTime = pkg.timeMax || 0;

    // Add addon times
    addons.forEach(addonSlug => {
      const addon = ADDON_MAP[addonSlug];
      if (addon) {
        minTime += addon.timeMin || 0;
        maxTime += addon.timeMax || 0;
      }
    });

    // Format the range
    if (minTime === maxTime) {
      return `~${formatTime(minTime)}`;
    }
    return `~${formatTime(minTime)}–${formatTime(maxTime)}`;
  }

  function nameToSlug(name) {
    const n = String(name || "").toLowerCase().trim();
    if (!n) return "";

    // Add-ons first (more specific)
    if (n.includes("interior reset")) return "interior-reset";
    if (n.includes("interior essentials") || n.includes("essentials")) return "interior-essentials";

    // Packages
    if (n.includes("rinse")) return "rinse-gloss";
    if (n.includes("paint lock") || n.includes("lock")) return "paint-lock";
    if (n.includes("paint reset")) return "paint-reset";

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
              typeof a === "string"
                  ? a
                  : (a && a.slug)
                      ? a.slug
                      : nameToSlug(a?.name || "")
          )
          .filter(Boolean);

      return { pkg: pkgSlug, addons };
    } catch {
      return { pkg: "", addons: [] };
    }
  }

  function updateSummary(sel, isAddonOnly = false) {
    // Handle addon-only scenario (Interior Reset without package)
    if (isAddonOnly && sel.addons.length > 0) {
      const addon = ADDON_MAP[sel.addons[0]];

      $("#summaryTitle").textContent = addon ? addon.name : "Add-on Only";
      $("#summaryNote").textContent = "Interior service without exterior package.";

      $("#summaryPkg").textContent = "No package";
      $("#summaryTime").textContent = addon ? `~${formatTime(addon.timeMin)}` : "~90 min";
      $("#summaryBase").textContent = "$0";

      const list = $("#summaryAddons");
      list.innerHTML = "";

      if (addon) {
        const row = document.createElement("div");
        row.className = "addonItem";
        row.innerHTML = `<span>${addon.name}</span><span>${money(addon.price)}</span>`;
        list.appendChild(row);

        $("#summaryTotal").textContent = money(addon.price);
      }

      return;
    }

    // Normal package + addon scenario
    const pkg = PACKAGE_MAP[sel.pkg];

    $("#summaryTitle").textContent = pkg ? pkg.name : "Choose a package";
    $("#summaryNote").textContent = pkg
        ? "Estimate updates as you add options."
        : "Select a package to see an estimate.";

    $("#summaryPkg").textContent = pkg ? pkg.name : "—";

    // ✅ Calculate combined time (package + addons)
    const totalTime = pkg ? calculateTotalTime(pkg, sel.addons) : "—";
    $("#summaryTime").textContent = totalTime;

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
    const addonsTotal = addonItems.reduce((sum, a) => sum + (a.price || 0), 0);
    $("#summaryTotal").textContent = money(base + addonsTotal);
  }

  function buildCalendlyUrl(sel, isAddonOnly = false) {
    let pkgName, addonsText, total, estimatedTime;

    if (isAddonOnly && sel.addons.length > 0) {
      // Addon-only booking
      pkgName = "No package (Add-on only)";
      const addon = ADDON_MAP[sel.addons[0]];
      addonsText = addon ? addon.name : "Interior Reset";
      total = addon ? addon.price : 99;
      estimatedTime = addon ? `~${formatTime(addon.timeMin)}` : "~90 min";
    } else {
      // Normal package booking
      const pkg = PACKAGE_MAP[sel.pkg];
      pkgName = pkg?.name || "Not selected";

      const addons = (sel.addons || [])
          .map((slug) => ADDON_MAP[slug]?.name)
          .filter(Boolean);

      addonsText = addons.length ? addons.join(", ") : "None";

      total =
          (pkg?.base || 0) +
          (sel.addons || []).reduce((sum, slug) => sum + (ADDON_MAP[slug]?.price || 0), 0);

      estimatedTime = pkg ? calculateTotalTime(pkg, sel.addons) : "—";
    }

    const url = new URL(CALENDLY_BASE);
    url.searchParams.set("a1", `Package: ${pkgName}`);
    url.searchParams.set("a2", `Add-ons: ${addonsText}`);
    url.searchParams.set("a3", `Estimate: $${total}`);
    url.searchParams.set("a4", `Est. Time: ${estimatedTime}`);

    return url.toString();
  }

  function initCalendly(sel, isAddonOnly = false) {
    const el = $("#calendlyWidget");
    if (!el) return;

    const calendlyUrl = buildCalendlyUrl(sel, isAddonOnly);
    el.setAttribute("data-url", calendlyUrl);

    const tryInit = () => {
      if (!window.Calendly || !window.Calendly.initInlineWidget) return false;
      el.innerHTML = "";
      window.Calendly.initInlineWidget({ url: calendlyUrl, parentElement: el });
      return true;
    };

    if (!tryInit()) {
      let tries = 0;
      const t = setInterval(() => {
        tries += 1;
        if (tryInit() || tries > 40) clearInterval(t);
      }, 100);
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    // Check if this is an addon-only booking
    const urlParams = new URLSearchParams(window.location.search);
    const isAddonOnly = urlParams.get("addon-only") === "interior-reset";

    const sel = safeLoad();
    updateSummary(sel, isAddonOnly);
    initCalendly(sel, isAddonOnly);

    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        const updated = safeLoad();
        const stillAddonOnly = new URLSearchParams(window.location.search).get("addon-only") === "interior-reset";
        updateSummary(updated, stillAddonOnly);
        initCalendly(updated, stillAddonOnly);
      }
    });
  });
})();