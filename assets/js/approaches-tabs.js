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

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const lockTarget =
    approachesSection.querySelector("[data-approaches-lock]") || approachesSection;

  const getActiveIndex = () => tabInputs.findIndex((tab) => tab.checked);
  const setActiveVisuals = (index) => {
    tabLabels.forEach((label, labelIndex) => {
      label.classList.toggle("is-active", labelIndex === index);
    });
    tabPanels.forEach((panel, panelIndex) => {
      panel.classList.toggle("is-active", panelIndex === index);
    });
  };
  const setActiveIndex = (index) => {
    if (index < 0 || index >= tabInputs.length) {
      return;
    }
    tabInputs[index].checked = true;
    tabInputs[index].dispatchEvent(new Event("change", { bubbles: true }));
  };

  let lastScrollTime = 0;
  let lastSwitchTime = 0;
  let accumulatedDelta = 0;
  let lastDirection = 0;
  let edgeUnlocked = false;
  let lockUntil = 0;
  let wasActive = false;
  const cooldownMs = 300;
  const dwellMs = 550;
  const minDeltaPerTab = 240;
  const maxDeltaPerEvent = 120;
  const resetMs = 700;
  const snapThreshold = 10;

  const getLockOffset = () => {
    const navHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--cove-nav-height")
      ) || 80;
    return navHeight + 16;
  };

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
      setActiveVisuals(index);
      const now = Date.now();
      startDwell(now);
      lastSwitchTime = now;
      edgeUnlocked = false;
      if (index < tabInputs.length - 1) {
        accumulatedDelta = 0;
      }
    });
  });

  setActiveVisuals(getActiveIndex());

  if (prefersReducedMotion) {
    return;
  }

  const processDelta = (rawDelta) => {
    const activeIndex = getActiveIndex();
    const now = Date.now();
    if (!isSectionActive()) {
      resetState();
      return false;
    }

    if (!wasActive) {
      wasActive = true;
      startDwell(now);
    }

    if (!edgeUnlocked && !isNearLock()) {
      snapToLock();
      return true;
    }

    if (activeIndex < 0 || rawDelta === 0) {
      return false;
    }

    if (activeIndex < tabInputs.length - 1) {
      edgeUnlocked = false;
    }

    const direction = Math.sign(rawDelta);
    if (!direction) {
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
        setActiveIndex(activeIndex + 1);
        accumulatedDelta = 0;
        lastSwitchTime = now;
      }
      return true;
    }

    if (direction < 0 && activeIndex > 0) {
      if (now - lastSwitchTime < cooldownMs) {
        return true;
      }

      accumulatedDelta += clampDelta(rawDelta);
      if (Math.abs(accumulatedDelta) >= minDeltaPerTab) {
        setActiveIndex(activeIndex - 1);
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

  let lastTouchY = null;
  const onTouchStart = (event) => {
    if (event.touches.length !== 1) {
      lastTouchY = null;
      return;
    }
    lastTouchY = event.touches[0].clientY;
  };

  const onTouchMove = (event) => {
    if (event.touches.length !== 1 || lastTouchY === null) {
      return;
    }

    const currentY = event.touches[0].clientY;
    const rawDelta = lastTouchY - currentY;
    lastTouchY = currentY;

    const shouldPrevent = processDelta(rawDelta);
    if (shouldPrevent && event.cancelable) {
      event.preventDefault();
    }
  };

  const onTouchEnd = () => {
    lastTouchY = null;
    resetAccumulation();
  };

  let scrollRaf = null;
  const onScroll = () => {
    if (scrollRaf) {
      return;
    }
    scrollRaf = window.requestAnimationFrame(() => {
      scrollRaf = null;
      if (!isSectionActive()) {
        resetState();
        return;
      }
      if (!edgeUnlocked) {
        snapToLock();
      }
    });
  };

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("touchcancel", onTouchEnd, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
})();
