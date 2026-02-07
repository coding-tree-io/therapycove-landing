(() => {
  const approachesSection = document.getElementById("approaches");
  if (!approachesSection) {
    return;
  }

  const tabCards = Array.from(
    approachesSection.querySelectorAll(".approaches-tab-card")
  );
  const tabButtons = Array.from(
    approachesSection.querySelectorAll(".approaches-tab-list .approaches-tab")
  );
  const tabContents = Array.from(
    approachesSection.querySelectorAll(".approaches-content")
  );
  const tabPanels = Array.from(
    approachesSection.querySelectorAll(".approaches-panels .approaches-panel")
  );

  if (tabButtons.length < 2) {
    return;
  }

  let openIndices = new Set([0]);
  let autoSequenceCompleted = false;
  let onOpenIndex = null;

  const normalizeOpenSet = (indices) => {
    const normalized = [];
    Array.from(indices).forEach((value) => {
      const index = Number(value);
      if (!Number.isInteger(index)) {
        return;
      }
      if (index < 0 || index >= tabButtons.length) {
        return;
      }
      if (!normalized.includes(index)) {
        normalized.push(index);
      }
    });

    if (!normalized.length) {
      normalized.push(0);
    }

    return new Set(normalized);
  };

  const getOpenIndices = () =>
    Array.from(openIndices).sort((left, right) => left - right);

  const getLastOpenedIndex = () => {
    const sorted = getOpenIndices();
    if (!sorted.length) {
      return 0;
    }
    return sorted[sorted.length - 1];
  };

  const syncOpenVisuals = () => {
    tabButtons.forEach((button, index) => {
      const isOpen = openIndices.has(index);
      button.classList.toggle("is-open", isOpen);
      button.setAttribute("aria-expanded", isOpen ? "true" : "false");
      tabCards[index]?.classList.toggle("is-open", isOpen);

      const content = tabContents[index];
      if (content) {
        content.hidden = !isOpen;
      }
    });

    tabPanels.forEach((panel, index) => {
      panel.classList.toggle("is-open", openIndices.has(index));
    });
  };

  const setOpenState = (nextIndices) => {
    openIndices = normalizeOpenSet(nextIndices);
    if (!autoSequenceCompleted && openIndices.size === tabButtons.length) {
      autoSequenceCompleted = true;
    }
    syncOpenVisuals();
    if (typeof onOpenIndex === "function") {
      onOpenIndex(getLastOpenedIndex());
    }
  };

  const openIndex = (index) => {
    if (index < 0 || index >= tabButtons.length) {
      return false;
    }
    if (openIndices.has(index)) {
      return false;
    }

    const next = new Set(openIndices);
    next.add(index);
    setOpenState(next);
    return true;
  };

  const toggleIndex = (index) => {
    if (index < 0 || index >= tabButtons.length) {
      return;
    }

    const next = new Set(openIndices);
    if (next.has(index)) {
      if (next.size === 1) {
        if (index === 0) {
          return;
        }
        setOpenState(new Set([0]));
        return;
      }

      next.delete(index);
    } else {
      next.add(index);
    }

    setOpenState(next);
  };

  tabButtons.forEach((button, index) => {
    button.addEventListener("click", () => {
      toggleIndex(index);
    });
  });

  syncOpenVisuals();

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const getLockOffset = () => {
    const navHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--cove-nav-height")
      ) || 80;
    return navHeight + 16;
  };

  const isSingleColumnLayout =
    window.matchMedia && window.matchMedia("(max-width: 1024px)").matches;

  if (isSingleColumnLayout) {
    if (typeof window.scrollama !== "function") {
      return;
    }

    const scroller = window.scrollama();
    const getOffset = () => `${Math.round(getLockOffset() + 24)}px`;
    const onResize = () => {
      scroller.resize();
    };
    const stopAutoOpen = () => {
      window.removeEventListener("resize", onResize);
      if (typeof scroller.destroy === "function") {
        scroller.destroy();
      }
    };

    scroller
      .setup({
        step: tabCards,
        offset: getOffset(),
        threshold: 4,
      })
      .onStepEnter((response) => {
        if (autoSequenceCompleted) {
          return;
        }
        openIndex(response.index);
        if (autoSequenceCompleted) {
          stopAutoOpen();
        }
      });

    window.addEventListener("resize", onResize);
    return;
  }

  const anchorCenterEnabled = Boolean(window.__coveAnchorCenter);

  const lockTarget =
    approachesSection.querySelector("[data-approaches-lock]") || approachesSection;

  let lastScrollTime = 0;
  let lastSwitchTime = 0;
  let accumulatedDelta = 0;
  let lastDirection = 0;
  let edgeUnlocked = false;
  let bypassUntil = 0;
  let lockUntil = 0;
  let wasActive = false;
  let anchorBypass = 0;
  let lastNaturalScroll = 0;
  let lockDisabled = false;
  const cooldownMs = 300;
  const dwellMs = 550;
  const minDeltaPerTab = 240;
  const maxDeltaPerEvent = 120;
  const resetMs = 700;
  const snapThreshold = 10;
  const naturalScrollWindow = 300;

  const isSectionActive = () => {
    const rect = approachesSection.getBoundingClientRect();
    const offset = getLockOffset();
    return rect.top <= offset && rect.bottom >= offset;
  };

  const normalizeDelta = (event) => {
    let delta = event.deltaY;
    if (event.deltaMode === 1) {
      delta *= 16;
    } else if (event.deltaMode === 2) {
      delta *= window.innerHeight;
    }
    return delta;
  };

  const clampDelta = (rawDelta) => {
    return Math.max(-maxDeltaPerEvent, Math.min(maxDeltaPerEvent, rawDelta));
  };

  const resetAccumulation = () => {
    accumulatedDelta = 0;
    lastDirection = 0;
  };

  const resetState = () => {
    resetAccumulation();
    edgeUnlocked = false;
    lockUntil = 0;
    wasActive = false;
    bypassUntil = 0;
    anchorBypass = 0;
    lastNaturalScroll = 0;
    lockDisabled = false;
  };

  const startDwell = (now) => {
    lockUntil = now + dwellMs;
  };

  const getLockTop = () => {
    const rect = lockTarget.getBoundingClientRect();
    return window.scrollY + rect.top - getLockOffset();
  };

  const isNearLock = () => Math.abs(window.scrollY - getLockTop()) <= snapThreshold;

  const snapToLock = () => {
    if (isNearLock()) {
      return;
    }
    window.scrollTo({ top: getLockTop(), behavior: "auto" });
  };

  onOpenIndex = (index) => {
    const now = Date.now();
    startDwell(now);
    lastSwitchTime = now;
    edgeUnlocked = false;
    lockDisabled = index === tabButtons.length - 1;
    if (lockDisabled) {
      edgeUnlocked = true;
    } else {
      accumulatedDelta = 0;
    }
  };

  onOpenIndex(getLastOpenedIndex());

  const contactAnchor = document.getElementById("contact");
  const contactSection =
    document.querySelector("[data-contact-section]") || contactAnchor?.closest("section");
  const contactLockTarget =
    document.querySelector("[data-contact-lock]") || contactAnchor || contactSection;
  const isContactActive = () => {
    if (!contactSection) {
      return false;
    }
    const offset = getLockOffset();
    const start = contactSection.offsetTop - offset;
    const end = contactSection.offsetTop + contactSection.offsetHeight;
    return window.scrollY >= start && window.scrollY <= end;
  };

  const scrollContactIntoView = (behavior = "smooth") => {
    if (!contactLockTarget) {
      return;
    }
    const rect = contactLockTarget.getBoundingClientRect();
    const extraMargin = 0;
    const targetTop = Math.max(
      0,
      window.scrollY + rect.top - getLockOffset() - extraMargin
    );
    window.scrollTo({ top: targetTop, behavior });
  };

  const enableBypass = (durationMs = 1400) => {
    bypassUntil = Date.now() + durationMs;
    edgeUnlocked = true;
  };

  const enableAnchorBypass = (durationMs = 1200) => {
    anchorBypass = Date.now() + durationMs;
    edgeUnlocked = true;
    bypassUntil = Math.max(bypassUntil, anchorBypass);
  };

  const triggerContactFlow = (behavior = "smooth") => {
    enableBypass(5000);
    scrollContactIntoView(behavior);
    if (window.location.hash !== "#contact" && history.replaceState) {
      history.replaceState(null, "", "#contact");
    }
  };

  const processDelta = (rawDelta) => {
    if (autoSequenceCompleted) {
      return false;
    }
    if (isContactActive()) {
      resetState();
      return false;
    }
    if (lockDisabled) {
      return false;
    }

    const activeIndex = getLastOpenedIndex();
    const now = Date.now();
    lastNaturalScroll = now;
    if (!isSectionActive()) {
      resetState();
      return false;
    }

    if (!wasActive) {
      wasActive = true;
      startDwell(now);
    }

    if (bypassUntil && now < bypassUntil) {
      return false;
    }
    if (bypassUntil && now >= bypassUntil) {
      bypassUntil = 0;
    }

    if (!edgeUnlocked && !isNearLock()) {
      snapToLock();
      return true;
    }

    if (rawDelta === 0) {
      return false;
    }

    if (activeIndex < tabButtons.length - 1) {
      edgeUnlocked = false;
    }

    const direction = Math.sign(rawDelta);
    if (!direction) {
      return false;
    }
    if (direction < 0) {
      lastDirection = direction;
      bypassUntil = now + 1200;
      edgeUnlocked = true;
      resetAccumulation();
      return false;
    }

    if (direction > 0 && now < lockUntil) {
      return true;
    }

    if (direction !== lastDirection || now - lastScrollTime > resetMs) {
      accumulatedDelta = 0;
    }

    lastDirection = direction;
    lastScrollTime = now;

    if (direction > 0 && activeIndex < tabButtons.length - 1) {
      if (now - lastSwitchTime < cooldownMs) {
        return true;
      }

      accumulatedDelta += clampDelta(rawDelta);
      if (Math.abs(accumulatedDelta) >= minDeltaPerTab) {
        openIndex(activeIndex + 1);
        accumulatedDelta = 0;
        lastSwitchTime = now;
      }
      return true;
    }

    if (direction > 0 && activeIndex === tabButtons.length - 1) {
      if (edgeUnlocked) {
        return false;
      }

      if (now - lastSwitchTime < cooldownMs) {
        return true;
      }

      accumulatedDelta += clampDelta(rawDelta);
      if (Math.abs(accumulatedDelta) >= minDeltaPerTab) {
        edgeUnlocked = true;
        accumulatedDelta = 0;
        lastSwitchTime = now;
        return false;
      }
      return true;
    }

    return false;
  };

  const onWheel = (event) => {
    if (event.ctrlKey) {
      return;
    }

    const rawDelta = normalizeDelta(event);
    const shouldPrevent = processDelta(rawDelta);
    if (shouldPrevent && event.cancelable) {
      event.preventDefault();
    }
  };

  let scrollRaf = null;
  const onScroll = () => {
    if (scrollRaf) {
      return;
    }
    scrollRaf = window.requestAnimationFrame(() => {
      scrollRaf = null;
      if (isContactActive()) {
        resetState();
        return;
      }
      if (!isSectionActive()) {
        resetState();
        return;
      }
      if (autoSequenceCompleted) {
        return;
      }
      if (lockDisabled) {
        return;
      }
      if (lastDirection < 0) {
        return;
      }
      const now = Date.now();
      if (anchorBypass) {
        if (now >= anchorBypass) {
          anchorBypass = 0;
        } else {
          return;
        }
      }
      if (now - lastNaturalScroll > naturalScrollWindow) {
        return;
      }
      if (bypassUntil && now < bypassUntil) {
        return;
      }
      if (!edgeUnlocked) {
        snapToLock();
      }
    });
  };

  const onHashChange = () => {
    if (anchorCenterEnabled) {
      return;
    }
    const hash = window.location.hash;
    if (!hash) {
      return;
    }
    if (hash === "#contact") {
      enableBypass(5000);
      scrollContactIntoView("auto");
      return;
    }
    if (hash === "#approaches") {
      return;
    }
    enableAnchorBypass(1600);
  };

  document.addEventListener("click", (event) => {
    if (event.defaultPrevented) {
      return;
    }
    const anchor = event.target.closest('a[href="#contact"]');
    if (anchor) {
      event.preventDefault();
      triggerContactFlow("smooth");
      return;
    }
    const otherAnchor = event.target.closest(
      'a[href^="#"]:not([href="#contact"]):not([href="#approaches"])'
    );
    if (otherAnchor) {
      enableAnchorBypass(1600);
    }
  });

  document.addEventListener("pointerdown", (event) => {
    const anchor = event.target.closest('a[href="#contact"]');
    if (anchor) {
      enableBypass(5000);
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.defaultPrevented) {
      return;
    }
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }
    const active = document.activeElement;
    if (active && active.matches('a[href="#contact"]')) {
      event.preventDefault();
      triggerContactFlow("smooth");
    }
  });

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("hashchange", onHashChange, { passive: true });
  window.addEventListener("cove:anchor-center", (event) => {
    const hash = event?.detail?.hash;
    if (!hash) {
      return;
    }
    if (hash === "#contact") {
      enableBypass(5000);
      return;
    }
    enableAnchorBypass(2000);
  });

  onHashChange();
})();
