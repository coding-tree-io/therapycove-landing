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
  const cooldownMs = 600;
  const scrollThreshold = 12;
  const topOffset = 96;

  const isSectionActive = () => {
    const rect = section.getBoundingClientRect();
    return rect.top <= topOffset && rect.bottom >= topOffset;
  };

  const onWheel = (event) => {
    if (event.ctrlKey) {
      return;
    }

    if (!isSectionActive()) {
      return;
    }

    const delta = event.deltaY;
    if (Math.abs(delta) < scrollThreshold) {
      return;
    }

    const activeIndex = getActiveIndex();
    if (activeIndex < 0) {
      return;
    }

    const canAdvance = delta > 0 && activeIndex < tabs.length - 1;
    const canRewind = delta < 0 && activeIndex > 0;
    if (!canAdvance && !canRewind) {
      return;
    }

    event.preventDefault();
    const now = Date.now();
    if (now - lastScrollTime >= cooldownMs) {
      setActiveIndex(activeIndex + (canAdvance ? 1 : -1));
      lastScrollTime = now;
    }
  };

  window.addEventListener("wheel", onWheel, { passive: false });
})();
