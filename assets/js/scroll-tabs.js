(() => {
  const section = document.getElementById("features");
  if (!section) {
    return;
  }

  const tabs = Array.from(section.querySelectorAll("input.tc-features-toggle"));
  if (tabs.length < 2) {
    return;
  }

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  const getActiveIndex = () => tabs.findIndex((tab) => tab.checked);
  const setActiveIndex = (index) => {
    if (index < 0 || index >= tabs.length) {
      return;
    }
    tabs[index].checked = true;
    tabs[index].dispatchEvent(new Event("change", { bubbles: true }));
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
  const topOffset = 96;

  const isSectionActive = () => {
    const rect = section.getBoundingClientRect();
    return rect.top <= topOffset && rect.bottom >= topOffset;
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

  tabs.forEach((tab, index) => {
    tab.addEventListener("change", () => {
      if (!tab.checked) {
        return;
      }
      const now = Date.now();
      startDwell(now);
      lastSwitchTime = now;
      edgeUnlocked = false;
      if (index < tabs.length - 1) {
        accumulatedDelta = 0;
      }
    });
  });

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

    if (activeIndex < 0 || rawDelta === 0) {
      return false;
    }

    if (activeIndex < tabs.length - 1) {
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

    if (direction > 0 && activeIndex < tabs.length - 1) {
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

    if (direction > 0 && activeIndex === tabs.length - 1) {
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

  window.addEventListener("wheel", onWheel, { passive: false });
  window.addEventListener("touchstart", onTouchStart, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd, { passive: true });
  window.addEventListener("touchcancel", onTouchEnd, { passive: true });
})();
