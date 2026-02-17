document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "pf_booking_selection";

  const chooseButtons = Array.from(document.querySelectorAll(".chooseBtn[data-package]"));
  const addonButtons = Array.from(document.querySelectorAll(".addonBtn[data-addon]"));
  const addonsSection = document.querySelector("#addonsSection");

  const normalize = (s) => String(s || "").trim();

  const pkgNameToSlug = (name) => {
    const n = String(name || "").toLowerCase();
    if (n.includes("maintain") || n.includes("rinse")) return "rinse-gloss";
    if (n.includes("restore") || n.includes("paint reset") || n.includes("reset")) return "paint-reset";
    if (n.includes("protect") || n.includes("paint lock") || n.includes("lock")) return "paint-lock";
    return "";
  };

  const loadSelection = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { pkg: null, addons: [], addonsDecision: null };
      const s = JSON.parse(raw);

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

  const setSelectedPackageUI = (pkgName) => {
    document.querySelectorAll(".planCard.is-selected").forEach((el) => el.classList.remove("is-selected"));

    chooseButtons.forEach((b) => {
      const isSelected = pkgName && normalize(b.dataset.package) === normalize(pkgName);
      const card = b.closest(".planCard");

      if (isSelected && card) {
        card.classList.add("is-selected");
      }

      b.textContent = isSelected ? "Selected ✓" : "Choose this package";
      b.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
  };

  const setSelectedAddonsUI = (sel) => {
    document.querySelectorAll(".addonCard.is-selected").forEach((el) => el.classList.remove("is-selected"));

    addonButtons.forEach((btn) => {
      const slug = btn.dataset.addonSlug;
      const card = btn.closest(".addonCard");

      const isNone = slug === "none" && sel.addonsDecision === "none";
      const isSelectedAddon =
          sel.addonsDecision === "selected" &&
          Array.isArray(sel.addons) &&
          sel.addons.length === 1 &&
          sel.addons[0]?.slug === slug;

      const isOn = isNone || isSelectedAddon;

      if (card && isOn) card.classList.add("is-selected");

      if (slug === "none") {
        btn.textContent = isOn ? "Selected ✓" : "Select no add-ons";
      } else {
        btn.textContent = isOn ? "Selected ✓" : "Select this add-on";
      }

      btn.setAttribute("aria-pressed", isOn ? "true" : "false");
    });
  };

  const showPrompt = (message) => {
    const existingPrompt = document.querySelector(".selection-prompt");
    if (existingPrompt) existingPrompt.remove();

    const prompt = document.createElement("div");
    prompt.className = "selection-prompt";
    prompt.textContent = message;
    prompt.style.cssText = `
      position: fixed;
      bottom: 30px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(37, 150, 190, 0.95);
      color: #fff;
      padding: 16px 24px;
      border-radius: 12px;
      font-weight: 700;
      box-shadow: 0 8px 30px rgba(0,0,0,0.4);
      z-index: 9999;
      animation: slideUp 0.3s ease;
    `;

    const style = document.createElement("style");
    style.textContent = `
      @keyframes slideUp {
        from { transform: translate(-50%, 20px); opacity: 0; }
        to { transform: translate(-50%, 0); opacity: 1; }
      }
      @keyframes slideDown {
        from { transform: translate(-50%, 0); opacity: 1; }
        to { transform: translate(-50%, 20px); opacity: 0; }
      }
    `;
    if (!document.querySelector('style[data-prompt-animations]')) {
      style.setAttribute('data-prompt-animations', 'true');
      document.head.appendChild(style);
    }

    document.body.appendChild(prompt);

    setTimeout(() => {
      prompt.style.animation = "slideDown 0.3s ease";
      setTimeout(() => prompt.remove(), 300);
    }, 3000);
  };

  const showInteriorResetModal = () => {
    const modal = document.createElement("div");
    modal.className = "interior-reset-modal";
    modal.innerHTML = `
      <div class="modal-overlay"></div>
      <div class="modal-content">
        <h3>Interior Reset Only</h3>
        <p>Would you like to add a package?</p>
        <div class="modal-buttons">
          <button class="modal-btn choose-package">Choose a package</button>
          <button class="modal-btn no-package">No package needed</button>
        </div>
      </div>
    `;

    modal.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
    `;

    const style = document.createElement("style");
    style.textContent = `
      .modal-overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(4px);
      }
      .modal-content {
        position: relative;
        background: linear-gradient(180deg, #0c0f14, #000);
        border: 1px solid rgba(37, 150, 190, 0.4);
        border-radius: 24px;
        padding: 32px 28px;
        max-width: 420px;
        width: 90%;
        box-shadow: 0 22px 70px rgba(0,0,0,0.7);
        text-align: center;
      }
      .modal-content h3 {
        font-family: "Montserrat", sans-serif;
        font-weight: 800;
        font-size: 1.5rem;
        margin-bottom: 12px;
      }
      .modal-content p {
        color: rgba(255,255,255,0.7);
        margin-bottom: 24px;
        line-height: 1.6;
      }
      .modal-buttons {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .modal-btn {
        padding: 14px 20px;
        border-radius: 999px;
        font-weight: 800;
        cursor: pointer;
        border: 1px solid rgba(255,255,255,0.16);
        background: rgba(255,255,255,0.04);
        color: #fff;
        transition: all 0.2s ease;
      }
      .modal-btn:hover {
        transform: translateY(-2px);
        background: rgba(255,255,255,0.08);
        border-color: rgba(255,255,255,0.24);
      }
      .modal-btn.choose-package {
        background: rgba(37, 150, 190, 0.95);
        border-color: rgba(37, 150, 190, 0.35);
      }
      .modal-btn.choose-package:hover {
        background: rgba(37, 150, 190, 1);
      }
    `;

    if (!document.querySelector('style[data-modal-styles]')) {
      style.setAttribute('data-modal-styles', 'true');
      document.head.appendChild(style);
    }

    document.body.appendChild(modal);

    modal.querySelector(".choose-package").addEventListener("click", () => {
      modal.remove();

      // ✅ SAVE Interior Reset selection before scrolling
      let currentSelection = loadSelection();
      currentSelection.addons = [{ slug: "interior-reset", name: "Interior Reset", price: 99 }];
      currentSelection.addonsDecision = "selected";
      saveSelection(currentSelection);
      setSelectedAddonsUI(currentSelection);

      // Scroll to packages
      const packagesSection = document.querySelector(".cards");
      if (packagesSection) {
        packagesSection.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    modal.querySelector(".no-package").addEventListener("click", () => {
      modal.remove();

      // Save ONLY interior reset (no package)
      const cleanSelection = {
        pkg: null,
        addons: [{ slug: "interior-reset", name: "Interior Reset", price: 99 }],
        addonsDecision: "selected"
      };

      saveSelection(cleanSelection);

      // Redirect to booking with addon-only parameter
      window.location.href = `booking.html?addon-only=interior-reset`;
    });

    modal.querySelector(".modal-overlay").addEventListener("click", () => {
      modal.remove();
    });
  };

  // ----- init from storage -----
  let selection = loadSelection();

  const storedPkgName = selection.pkg?.name || "";
  if (storedPkgName) setSelectedPackageUI(storedPkgName);

  setSelectedAddonsUI(selection);

  // ----- add-on selection (SINGLE SELECT with TOGGLE) -----
  addonButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const addonName = normalize(btn.dataset.addon);
      const addonPrice = Number(btn.dataset.addonPrice || 0);
      const slug = btn.dataset.addonSlug;

      selection = loadSelection();

      // Check if clicking the same add-on (toggle off)
      const currentAddon = selection.addons[0];
      const isSameAddon = currentAddon && currentAddon.slug === slug;
      const isSameNone = slug === "none" && selection.addonsDecision === "none";

      // TOGGLE: If clicking the same selection, unselect it
      if (isSameAddon || isSameNone) {
        selection.addons = [];
        selection.addonsDecision = null;
        saveSelection(selection);
        setSelectedAddonsUI(selection);
        return;
      }

      // Special handling for "Interior Reset" when selected first (no package)
      if (slug === "interior-reset" && !selection.pkg) {
        showInteriorResetModal();
        return;
      }

      // "No Add-ons" selection
      if (slug === "none") {
        selection.addons = [];
        selection.addonsDecision = "none";
        saveSelection(selection);
        setSelectedAddonsUI(selection);

        // ✅ Auto-redirect if package already selected
        if (selection.pkg) {
          const params = new URLSearchParams();
          params.set("pkg", selection.pkg.slug || selection.pkg.name);
          window.location.href = `booking.html?${params.toString()}`;
        } else {
          showPrompt("Please choose a package after this selection.");
        }
        return;
      }

      // Normal add-on selection (single select)
      selection.addons = [{ slug, name: addonName, price: addonPrice }];
      selection.addonsDecision = "selected";
      saveSelection(selection);
      setSelectedAddonsUI(selection);

      // ✅ Auto-redirect if package already selected
      if (selection.pkg) {
        const params = new URLSearchParams();
        params.set("pkg", selection.pkg.slug || selection.pkg.name);
        window.location.href = `booking.html?${params.toString()}`;
      } else {
        showPrompt("Please choose a package after this selection.");
      }
    });
  });

  // ----- package selection (SINGLE SELECT with TOGGLE) -----
  chooseButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      selection = loadSelection();

      const pkgName = normalize(btn.dataset.package);
      const base = Number(btn.dataset.price || 0);
      const pkgSlug = pkgNameToSlug(pkgName);

      // Check if clicking the same package (toggle off)
      const isSamePackage = selection.pkg && normalize(selection.pkg.name) === pkgName;

      // TOGGLE: If clicking the same package, unselect it
      if (isSamePackage) {
        selection.pkg = null;
        saveSelection(selection);
        setSelectedPackageUI("");
        return;
      }

      // Select new package
      selection.pkg = { slug: pkgSlug, name: pkgName, base };
      saveSelection(selection);
      setSelectedPackageUI(pkgName);

      // ✅ Auto-redirect if ANY add-on decision made
      if (selection.addonsDecision === "selected" && selection.addons.length > 0) {
        // Package + add-on selected → auto-redirect
        const params = new URLSearchParams();
        params.set("pkg", pkgSlug || pkgName);
        window.location.href = `booking.html?${params.toString()}`;
      } else if (selection.addonsDecision === "none") {
        // Package + "No Add-ons" → auto-redirect
        const params = new URLSearchParams();
        params.set("pkg", pkgSlug || pkgName);
        window.location.href = `booking.html?${params.toString()}`;
      } else {
        // No add-on decision yet → show prompt
        showPrompt("Now choose an add-on.");
      }
    });
  });

  // If another tab updates selection, update UI here too
  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY) {
      const updated = loadSelection();
      setSelectedAddonsUI(updated);
      const n = updated.pkg?.name || "";
      setSelectedPackageUI(n);
    }
  });
});
