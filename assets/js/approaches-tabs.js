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

  tabInputs.forEach((tab, index) => {
    tab.addEventListener("change", () => {
      if (!tab.checked) {
        return;
      }
      setActiveVisuals(index);
    });
  });

  setActiveVisuals(getActiveIndex());

  const prefersReducedMotion =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (prefersReducedMotion) {
    return;
  }

  if (typeof window.scrollama !== "function") {
    return;
  }

  const getOffset = () => {
    const navHeight =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--cove-nav-height")
      ) || 72;
    return `${Math.round(navHeight + 48)}px`;
  };

  const scroller = window.scrollama();
  scroller
    .setup({
      step: tabLabels,
      offset: getOffset(),
      threshold: 4,
    })
    .onStepEnter((response) => {
      if (response.index === getActiveIndex()) {
        return;
      }
      setActiveIndex(response.index);
    });

  window.addEventListener("resize", () => {
    scroller.resize();
  });
})();
