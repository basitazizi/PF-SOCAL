/* booking.js */
(function () {
  // Shared storage key used across pricing + booking
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

  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  function money(n) {
    return `$${Number(n || 0).toFixed(0)}`;
  }

  // ---- Storage helpers (supports old formats safely) ----
  function safeLoad() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { pkg: "", addons: [] };
      const s = JSON.parse(raw);

      // pkg may be object or string/slug
      let pkgSlug = "";
      if (typeof s.pkg === "string") pkgSlug = s.pkg;
      else if (s.pkg && typeof s.pkg.slug === "string") pkgSlug = s.pkg.slug;
      else if (s.pkg && typeof s.pkg.name === "string") {
        // map name -> slug if possible
        pkgSlug = nameToSlug(s.pkg.name);
      }

      // addons may be array of objects or strings
      let addons = Array.isArray(s.addons) ? s.addons : [];
      addons = addons
          .map((a) => (typeof a === "string" ? a : (a && a.slug) ? a.slug : nameToSlug(a?.name || "")))
          .filter(Boolean);

      return { pkg: pkgSlug, addons };
    } catch {
      return { pkg: "", addons: [] };
    }
  }

  function safeSave(sel) {
    // Keep the format stable for later Firebase usage
    const pkgSlug = sel.pkg || "";
    const addons = Array.isArray(sel.addons) ? sel.addons : [];

    const pkgObj = pkgSlug
        ? { slug: pkgSlug, name: PACKAGE_MAP[pkgSlug]?.name || pkgSlug, base: PACKAGE_MAP[pkgSlug]?.base || 0 }
        : null;

    const addonObjs = addons.map((slug) => ({
      slug,
      name: ADDON_MAP[slug]?.name || slug,
      price: ADDON_MAP[slug]?.price || 0
    }));

    localStorage.setItem(STORAGE_KEY, JSON.stringify({ pkg: pkgObj, addons: addonObjs }));
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

  // ---- URL param support (optional but nice) ----
  function getPkgFromUrl() {
    const url = new URL(window.location.href);
    // support ?package= or ?pkg=
    return url.searchParams.get("package") || url.searchParams.get("pkg") || "";
  }

  // ---- UI sync ----
  function setDefaultDate() {
    const el = $("#date");
    if (!el) return;

    const now = new Date();
    const yyyy = now.getFullYear();
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    el.value = `${yyyy}-${mm}-${dd}`;
    el.min = el.value;
  }

  function applySelectionToForm(sel) {
    // Package dropdown
    const pkgSelect = $("#package");
    if (pkgSelect && sel.pkg && PACKAGE_MAP[sel.pkg]) {
      pkgSelect.value = sel.pkg;
    }

    // Addon checkboxes
    const addonSet = new Set(sel.addons || []);
    $$('input[name="addon"]').forEach((cb) => {
      cb.checked = addonSet.has(cb.value);
    });
  }

  function readSelectionFromForm() {
    const pkgSelect = $("#package");
    const pkg = pkgSelect ? pkgSelect.value : "";

    const addons = $$('input[name="addon"]:checked').map((cb) => cb.value);

    return { pkg, addons };
  }

  function updateSummaryFromSelection(sel) {
    const pkg = PACKAGE_MAP[sel.pkg];

    // Title + note
    $("#summaryTitle").textContent = pkg ? pkg.name : "Choose a package";
    $("#summaryNote").textContent = pkg
        ? "Estimate updates as you add options."
        : "Select a package to see an estimate.";

    // Details
    $("#summaryPkg").textContent = pkg ? pkg.name : "—";
    $("#summaryTime").textContent = pkg ? pkg.time : "—";
    $("#summaryBase").textContent = pkg ? money(pkg.base) : "$0";

    // Add-ons list
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
    const total = base + addonsTotal;

    $("#summaryTotal").textContent = money(total);
  }

  function syncAll() {
    const sel = readSelectionFromForm();
    safeSave(sel);
    updateSummaryFromSelection(sel);
  }

  function bind() {
    const pkgSelect = $("#package");
    if (pkgSelect) {
      pkgSelect.addEventListener("change", () => {
        syncAll(); // updates localStorage + summary
      });
    }

    $$('input[name="addon"]').forEach((cb) => {
      cb.addEventListener("change", () => {
        syncAll(); // updates localStorage + summary
      });
    });

    const form = $("#bookingForm");
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      // Basic client-side validation
      const required = form.querySelectorAll("[required]");
      let ok = true;
      required.forEach((el) => {
        if (!el.value) {
          ok = false;
          el.style.borderColor = "rgba(255,90,90,0.75)";
        } else {
          el.style.borderColor = "rgba(255,255,255,0.12)";
        }
      });
      if (!ok) return;

      // Always persist latest selection before success
      syncAll();

      // ✅ Later: send to Firebase here
      // Example (later): addDoc(collection(db,"bookings"), payload)

      const success = $("#success");
      success.hidden = false;
      success.scrollIntoView({ behavior: "smooth", block: "nearest" });
    });

    const year = $("#year");
    if (year) year.textContent = new Date().getFullYear();

    // If pricing page selection changes in another tab, re-render
    window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        const sel = safeLoad();
        applySelectionToForm(sel);
        updateSummaryFromSelection(sel);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setDefaultDate();

    // 1) Load selection saved from pricing
    let sel = safeLoad();

    // 2) URL param overrides (optional)
    const fromUrl = getPkgFromUrl();
    if (fromUrl && PACKAGE_MAP[fromUrl]) {
      sel.pkg = fromUrl;
      safeSave(sel);
    }

    // 3) Apply to form + render summary
    applySelectionToForm(sel);
    updateSummaryFromSelection(readSelectionFromForm());

    // 4) Bind events
    bind();

    // 5) Initial save to ensure stable format
    syncAll();
  });
})();
