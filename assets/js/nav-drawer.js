(() => {
  const navToggle = document.querySelector(".cove-nav-toggle");
  const navDrawer = document.querySelector(".cove-nav-drawer");
  if (!navToggle || !navDrawer) {
    return;
  }

  const closeDrawer = () => {
    navToggle.checked = false;
  };

  navDrawer.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (link) {
      closeDrawer();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && navToggle.checked) {
      closeDrawer();
    }
  });
})();
