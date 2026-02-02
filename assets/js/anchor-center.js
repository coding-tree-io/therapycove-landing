(() => {
  const prefersReducedMotion =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const getNavHeight = () => {
    const value = getComputedStyle(document.documentElement).getPropertyValue(
      "--cove-nav-height"
    );
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const getViewportMetrics = () => {
    const vv = window.visualViewport;
    return {
      height: vv?.height || window.innerHeight,
      offsetTop: vv?.offsetTop || 0,
    };
  };

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const resolveTarget = (hash) => {
    if (!hash || hash === "#" || hash === "#!") {
      return null;
    }
    const id = hash.startsWith("#") ? hash.slice(1) : hash;
    const element = document.getElementById(id) || document.querySelector(`[name="${id}"]`);
    if (!element) {
      return null;
    }
    if (element.classList.contains("cove-anchor")) {
      return element.nextElementSibling || element;
    }
    return element;
  };

  const getCenterElement = (target) => {
    if (!target) {
      return null;
    }
    const selector = target.getAttribute("data-anchor-center-target");
    if (selector) {
      const candidate = target.querySelector(selector);
      if (candidate) {
        return candidate;
      }
    }
    return target;
  };

  const getCenterOffset = (target) => {
    if (!target) {
      return 0;
    }
    const raw = target.getAttribute("data-anchor-center-offset");
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const centerTarget = (target, behavior = "smooth") => {
    if (!target) {
      return;
    }
    const centerEl = getCenterElement(target);
    if (!centerEl) {
      return;
    }
    const { height, offsetTop } = getViewportMetrics();
    const navHeight = getNavHeight();
    const rect = centerEl.getBoundingClientRect();
    const currentCenter = rect.top + rect.height / 2;
    const desiredCenter = offsetTop + height / 2 + navHeight / 2;
    const offset = getCenterOffset(target);
    const delta = currentCenter - desiredCenter;
    const maxScroll =
      document.documentElement.scrollHeight - window.innerHeight;
    const targetTop = clamp(
      window.scrollY + delta + offset,
      0,
      Math.max(0, maxScroll)
    );
    window.scrollTo({
      top: targetTop,
      behavior: prefersReducedMotion ? "auto" : behavior,
    });
  };

  const dispatchAnchorEvent = (hash) => {
    window.dispatchEvent(
      new CustomEvent("cove:anchor-center", { detail: { hash } })
    );
  };

  const scrollToHash = (hash, behavior = "smooth") => {
    const target = resolveTarget(hash);
    if (!target) {
      return false;
    }
    centerTarget(target, behavior);
    dispatchAnchorEvent(hash);
    return true;
  };

  document.addEventListener("click", (event) => {
    const anchor = event.target.closest('a[href^="#"]');
    if (!anchor) {
      return;
    }
    const hash = anchor.getAttribute("href");
    if (!resolveTarget(hash)) {
      return;
    }
    event.preventDefault();
    if (history.pushState) {
      history.pushState(null, "", hash);
    } else {
      window.location.hash = hash;
    }
    scrollToHash(hash, "smooth");
  });

  window.addEventListener("hashchange", () => {
    const hash = window.location.hash;
    if (!hash) {
      return;
    }
    scrollToHash(hash, "auto");
  });

  window.addEventListener("popstate", () => {
    const hash = window.location.hash;
    if (!hash) {
      return;
    }
    scrollToHash(hash, "auto");
  });

  if (window.location.hash) {
    const hash = window.location.hash;
    window.addEventListener("load", () => {
      window.requestAnimationFrame(() => {
        window.setTimeout(() => {
          scrollToHash(hash, "auto");
        }, 0);
      });
    });
  }

  window.__coveAnchorCenter = true;
})();
