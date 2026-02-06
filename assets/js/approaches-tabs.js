(() => {
  const approachesSection = document.getElementById("approaches");
  if (!approachesSection) {
    return;
  }

  const tabInputs = Array.from(
    approachesSection.querySelectorAll("input.approaches-tab-toggle")
  );
  if (tabInputs.length < 2) {
    return;
  }

  const tabLabels = Array.from(
    approachesSection.querySelectorAll(".approaches-tab")
  );
  const tabPanels = Array.from(
    approachesSection.querySelectorAll(".approaches-panel")
  );

  const getOpenIndices = () =>
    tabInputs.reduce((indices, tab, index) => {
      if (tab.checked) {
        indices.push(index);
      }
      return indices;
    }, []);
  const getLastOpenedIndex = () => {
    const openIndices = getOpenIndices();
    if (!openIndices.length) {
      return 0;
    }
    return Math.max(...openIndices);
  };
  const syncOpenVisuals = () => {
    tabLabels.forEach((label, labelIndex) => {
      const isOpen = tabInputs[labelIndex]?.checked;
      label.classList.toggle("is-open", isOpen);
      label.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    tabPanels.forEach((panel, panelIndex) => {
      panel.classList.toggle("is-open", Boolean(tabInputs[panelIndex]?.checked));
    });
  };
  const openIndex = (index) => {
    if (index < 0 || index >= tabInputs.length) {
      return;
    }
    if (tabInputs[index].checked) {
      return;
    }
    tabInputs[index].checked = true;
    tabInputs[index].dispatchEvent(new Event("change", { bubbles: true }));
  };

  tabInputs.forEach((tab, index) => {
    tab.addEventListener("change", () => {
      syncOpenVisuals();
    });
  });

  tabLabels.forEach((label, index) => {
    label.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " ") {
        return;
      }
      event.preventDefault();
      const tab = tabInputs[index];
      if (!tab) {
        return;
      }
      tab.checked = !tab.checked;
      tab.dispatchEvent(new Event("change", { bubbles: true }));
    });
  });

  syncOpenVisuals();

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const isCoarsePointer =
    window.matchMedia &&
    (window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(hover: none)").matches);

  const getLockOffset = () => {
    const navHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--cove-nav-height")
      ) || 80;
    return navHeight + 16;
  };

  if (isCoarsePointer) {
    if (typeof window.scrollama !== "function") {
      return;
    }
    const getOffset = () => `${Math.round(getLockOffset() + 32)}px`;
    const scroller = window.scrollama();
    scroller
      .setup({
        step: tabLabels,
        offset: getOffset(),
        threshold: 4,
      })
      .onStepEnter((response) => {
        if (tabInputs[response.index]?.checked) {
          return;
        }
        openIndex(response.index);
      });

    window.addEventListener("resize", () => {
      scroller.resize();
    });
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

  tabInputs.forEach((tab, index) => {
    tab.addEventListener("change", () => {
      if (!tab.checked) {
        return;
      }
      const now = Date.now();
      startDwell(now);
      lastSwitchTime = now;
      edgeUnlocked = false;
      if (index === tabInputs.length - 1) {
        lockDisabled = true;
        edgeUnlocked = true;
      }
      if (index < tabInputs.length - 1) {
        accumulatedDelta = 0;
      }
    });
  });

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

    if (activeIndex < tabInputs.length - 1) {
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

    if (direction > 0 && activeIndex < tabInputs.length - 1) {
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

    if (direction > 0 && activeIndex === tabInputs.length - 1) {
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
