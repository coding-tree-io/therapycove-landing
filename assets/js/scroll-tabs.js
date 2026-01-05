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
  const cooldownMs = 300;
  const scrollThreshold = 12;
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

  const onWheel = (event) => {
    if (event.ctrlKey) {
      return;
    }

    if (!isSectionActive()) {
      accumulatedDelta = 0;
      lastDirection = 0;
      return;
    }

    const rawDelta = normalizeDelta(event);
    if (Math.abs(rawDelta) < scrollThreshold) {
      return;
    }

    const activeIndex = getActiveIndex();
    if (activeIndex < 0) {
      return;
    }

    const direction = Math.sign(rawDelta);
    const canAdvance = direction > 0 && activeIndex < tabs.length - 1;
    const canRewind = direction < 0 && activeIndex > 0;
    if (!canAdvance && !canRewind) {
      return;
    }

    event.preventDefault();
    const now = Date.now();
    if (direction !== lastDirection || now - lastScrollTime > resetMs) {
      accumulatedDelta = 0;
    }

    lastDirection = direction;
    lastScrollTime = now;

    if (now - lastSwitchTime < cooldownMs) {
      return;
    }

    const delta = Math.max(-maxDeltaPerEvent, Math.min(maxDeltaPerEvent, rawDelta));
    accumulatedDelta += delta;
    if (Math.abs(accumulatedDelta) >= minDeltaPerTab) {
      setActiveIndex(activeIndex + (canAdvance ? 1 : -1));
      accumulatedDelta = 0;
      lastSwitchTime = now;
    }
  };

  window.addEventListener("wheel", onWheel, { passive: false });
})();
