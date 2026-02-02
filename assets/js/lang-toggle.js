(() => {
  const toggles = document.querySelectorAll("[data-lang-toggle]");
  if (!toggles.length) {
    return;
  }

  const normalizeBase = (href) => href.replace(/#.*$/, "");

  const applyHash = (toggle) => {
    const base = normalizeBase(toggle.dataset.baseHref || toggle.getAttribute("href") || "");
    const hash = window.location.hash;
    if (hash && hash !== "#") {
      toggle.setAttribute("href", `${base}${hash}`);
    } else {
      toggle.setAttribute("href", base);
    }
  };

  toggles.forEach((toggle) => {
    applyHash(toggle);
    toggle.addEventListener("click", () => applyHash(toggle));
  });
})();
