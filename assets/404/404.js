(function () {
  var root = document.documentElement;
  var builtInThemeStylesheets = {
    "therapy-cove": "/assets/404/therapy-cove.css",
    therapycove: "/assets/404/therapy-cove.css"
  };

  function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  function normalizeHex(value) {
    if (typeof value !== "string") {
      return null;
    }

    var hex = value.trim().replace(/^#/, "");

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map(function (char) {
          return char + char;
        })
        .join("");
    }

    if (!/^[0-9a-fA-F]{6}$/.test(hex)) {
      return null;
    }

    return "#" + hex.toLowerCase();
  }

  function hexToRgb(hex) {
    var normalized = normalizeHex(hex);

    if (!normalized) {
      return null;
    }

    return {
      r: parseInt(normalized.slice(1, 3), 16),
      g: parseInt(normalized.slice(3, 5), 16),
      b: parseInt(normalized.slice(5, 7), 16)
    };
  }

  function rgbToHex(r, g, b) {
    function toHex(channel) {
      return clamp(channel, 0, 255).toString(16).padStart(2, "0");
    }

    return "#" + toHex(r) + toHex(g) + toHex(b);
  }

  function mixHex(hexA, hexB, ratio) {
    var rgbA = hexToRgb(hexA);
    var rgbB = hexToRgb(hexB);

    if (!rgbA || !rgbB) {
      return null;
    }

    var t = clamp(ratio, 0, 1);
    var r = Math.round(rgbA.r + (rgbB.r - rgbA.r) * t);
    var g = Math.round(rgbA.g + (rgbB.g - rgbA.g) * t);
    var b = Math.round(rgbA.b + (rgbB.b - rgbA.b) * t);

    return rgbToHex(r, g, b);
  }

  function toRgba(hex, alpha) {
    var rgb = hexToRgb(hex);

    if (!rgb) {
      return null;
    }

    return "rgba(" + rgb.r + ", " + rgb.g + ", " + rgb.b + ", " + clamp(alpha, 0, 1) + ")";
  }

  function getToken(name) {
    return getComputedStyle(root).getPropertyValue(name).trim();
  }

  function setToken(name, value) {
    if (typeof value === "string" && value.trim()) {
      root.style.setProperty(name, value.trim());
    }
  }

  function parseSearchParams() {
    if (typeof window.URLSearchParams !== "function") {
      return null;
    }

    return new window.URLSearchParams(window.location.search || "");
  }

  function injectThemeStylesheet(themeName) {
    if (typeof themeName !== "string" || !themeName.trim()) {
      return;
    }

    var normalizedThemeName = themeName.trim().toLowerCase();
    var href = builtInThemeStylesheets[normalizedThemeName];

    if (!href) {
      return;
    }

    var existingTheme = document.querySelector(
      'link[rel="stylesheet"][data-ct-404-theme="' + normalizedThemeName + '"]'
    );
    if (existingTheme) {
      return;
    }

    var link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.setAttribute("data-ct-404-theme", normalizedThemeName);
    document.head.appendChild(link);
  }

  function getPaletteFromSearchParams(searchParams) {
    if (!searchParams) {
      return null;
    }

    var paramMap = [
      ["ctBrand", "brand"],
      ["ctPrimary", "primary"],
      ["ctAccent", "accent"],
      ["ctBackground", "background"],
      ["ctSurface", "surface"],
      ["ctText", "text"],
      ["ctMuted", "muted"],
      ["ctBorder", "border"],
      ["ctButtonGhostBackground", "buttonGhostBackground"],
      ["ctGradientStart", "gradientStart"],
      ["ctGradientEnd", "gradientEnd"],
      ["ctPrimaryContrast", "primaryContrast"],
      ["ctMenuSurface", "menuSurface"],
      ["ctMenuText", "menuText"],
      ["ctMenuHover", "menuHover"],
      ["ctIllustrationStroke", "illustrationStroke"],
      ["ctIllustrationFill", "illustrationFill"],
      ["ctIllustrationDot", "illustrationDot"]
    ];
    var palette = {};

    paramMap.forEach(function (entry) {
      var value = searchParams.get(entry[0]);
      if (typeof value === "string" && value.trim()) {
        palette[entry[1]] = value.trim();
      }
    });

    return Object.keys(palette).length ? palette : null;
  }

  function getRequestedPathLabel(searchParams) {
    if (searchParams) {
      var pathOverride = searchParams.get("ctPath");
      if (typeof pathOverride === "string" && pathOverride.trim()) {
        return pathOverride.trim();
      }
    }

    var path = window.location.pathname || "/";
    var query = window.location.search || "";
    return path + query;
  }

  function hasTruthyParam(searchParams, key) {
    if (!searchParams) {
      return false;
    }

    var value = searchParams.get(key);
    if (value === null) {
      return false;
    }

    if (value === "") {
      return true;
    }

    var normalized = String(value).trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes" || normalized === "on";
  }

  function isEmbeddedContext() {
    try {
      return window.self !== window.top;
    } catch (error) {
      return true;
    }
  }

  function getCurrentPathname() {
    if (typeof window.location !== "object" || typeof window.location.pathname !== "string") {
      return "/";
    }

    return window.location.pathname;
  }

  function isEnglishPath(pathname) {
    return pathname === "/en" || pathname.indexOf("/en/") === 0;
  }

  function isDirect404TemplatePath(pathname) {
    return pathname === "/404.html" || pathname === "/en/404.html";
  }

  function resolveFallbackSection(pathname) {
    var normalizedPathname = pathname.toLowerCase();
    return normalizedPathname.indexOf("contact") >= 0 ? "#contact" : "#home";
  }

  function buildLocalizedSectionUrl(pathname, sectionHash) {
    var sectionBasePath = isEnglishPath(pathname) ? "/en/" : "/";
    return sectionBasePath + sectionHash;
  }

  function applyLocalizedActionLinks(pathname) {
    var homeLink = document.getElementById("home-link");
    var contactLink = document.getElementById("contact-link");

    if (homeLink) {
      homeLink.setAttribute("href", buildLocalizedSectionUrl(pathname, "#home"));
    }

    if (contactLink) {
      contactLink.setAttribute("href", buildLocalizedSectionUrl(pathname, "#contact"));
    }
  }

  function redirectUnknownPath(pathname, searchParams) {
    if (hasTruthyParam(searchParams, "ctNoRedirect")) {
      return;
    }

    if (isDirect404TemplatePath(pathname)) {
      return;
    }

    var fallbackSection = resolveFallbackSection(pathname);
    var fallbackUrl = buildLocalizedSectionUrl(pathname, fallbackSection);

    window.location.replace(fallbackUrl);
  }

  function applyPalette(input) {
    var palette = input || {};
    var currentPrimary = normalizeHex(getToken("--ct-404-primary")) || "#2ccf6d";
    var currentAccent = normalizeHex(getToken("--ct-404-accent")) || "#8cffbb";
    var currentBackground = normalizeHex(getToken("--ct-404-bg")) || "#f7f8ff";
    var currentSurface = normalizeHex(getToken("--ct-404-surface")) || "#ffffff";
    var currentText = normalizeHex(getToken("--ct-404-text")) || "#0e0620";

    var primary = normalizeHex(palette.primary || palette.brand) || currentPrimary;
    var accent = normalizeHex(palette.accent) || currentAccent;
    var background = normalizeHex(palette.background) || currentBackground;
    var surface = normalizeHex(palette.surface) || currentSurface;
    var text = normalizeHex(palette.text) || currentText;

    var muted = normalizeHex(palette.muted) || mixHex(text, background, 0.68) || "#3f3755";
    var border = normalizeHex(palette.border) || mixHex(text, surface, 0.78) || "#cfcde0";
    var buttonGhostBg =
      normalizeHex(palette.buttonGhostBackground) || mixHex(surface, background, 0.5) || "#f4f5ff";
    var gradientStart = normalizeHex(palette.gradientStart) || mixHex(background, "#ffffff", 0.52) || background;
    var gradientEnd = normalizeHex(palette.gradientEnd) || mixHex(background, primary, 0.12) || background;

    var primaryContrast = normalizeHex(palette.primaryContrast) || mixHex(primary, "#ffffff", 0.94) || "#ffffff";
    var menuSurface = normalizeHex(palette.menuSurface) || primary;
    var menuText = normalizeHex(palette.menuText) || text;
    var menuHover = normalizeHex(palette.menuHover) || primaryContrast;
    var illustrationStroke = normalizeHex(palette.illustrationStroke) || text;
    var illustrationFill = normalizeHex(palette.illustrationFill) || surface;
    var illustrationDot = normalizeHex(palette.illustrationDot) || text;

    setToken("--ct-404-primary", primary);
    setToken("--ct-404-accent", accent);
    setToken("--ct-404-bg", background);
    setToken("--ct-404-surface", surface);
    setToken("--ct-404-text", text);
    setToken("--ct-404-muted", muted);
    setToken("--ct-404-border", border);
    setToken("--ct-404-button-ghost-bg", buttonGhostBg);
    setToken("--ct-404-gradient-start", gradientStart);
    setToken("--ct-404-gradient-end", gradientEnd);

    setToken("--ct-404-primary-contrast", primaryContrast);
    setToken("--ct-404-menu-surface", menuSurface);
    setToken("--ct-404-menu-text", menuText);
    setToken("--ct-404-menu-hover", menuHover);
    setToken("--ct-404-illustration-stroke", illustrationStroke);
    setToken("--ct-404-illustration-fill", illustrationFill);
    setToken("--ct-404-illustration-dot", illustrationDot);

    setToken("--ct-404-primary-soft", toRgba(primary, 0.2));
    setToken("--ct-404-accent-soft", toRgba(accent, 0.16));
    setToken("--ct-404-shadow-color", toRgba(text, 0.16));
  }

  function resetPalette() {
    var tokens = [
      "--ct-404-primary",
      "--ct-404-accent",
      "--ct-404-bg",
      "--ct-404-surface",
      "--ct-404-text",
      "--ct-404-muted",
      "--ct-404-border",
      "--ct-404-button-ghost-bg",
      "--ct-404-gradient-start",
      "--ct-404-gradient-end",
      "--ct-404-primary-contrast",
      "--ct-404-menu-surface",
      "--ct-404-menu-text",
      "--ct-404-menu-hover",
      "--ct-404-illustration-stroke",
      "--ct-404-illustration-fill",
      "--ct-404-illustration-dot",
      "--ct-404-primary-soft",
      "--ct-404-accent-soft",
      "--ct-404-shadow-color"
    ];

    tokens.forEach(function (token) {
      root.style.removeProperty(token);
    });
  }

  window.ct404Theme = {
    applyPalette: applyPalette,
    resetPalette: resetPalette
  };

  var searchParams = parseSearchParams();
  var currentPathname = getCurrentPathname();

  if (hasTruthyParam(searchParams, "ctEmbed") && isEmbeddedContext()) {
    document.documentElement.setAttribute("data-ct-404-embed", "true");
  }

  applyLocalizedActionLinks(currentPathname);

  if (searchParams) {
    injectThemeStylesheet(searchParams.get("ctTheme"));
  }

  if (window.CT_404_PALETTE && typeof window.CT_404_PALETTE === "object") {
    applyPalette(window.CT_404_PALETTE);
  }

  var queryPalette = getPaletteFromSearchParams(searchParams);
  if (queryPalette) {
    applyPalette(queryPalette);
  }

  var requestedPath = document.getElementById("requested-path");
  if (requestedPath && typeof window.location === "object") {
    requestedPath.textContent = getRequestedPathLabel(searchParams);
  }

  redirectUnknownPath(currentPathname, searchParams);

  var backLink = document.getElementById("back-link");
  if (backLink) {
    backLink.addEventListener("click", function () {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }

      window.location.href = "/";
    });
  }

})();
