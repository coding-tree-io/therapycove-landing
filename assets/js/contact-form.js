(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form || !window.fetch) {
    return;
  }

  const status = form.querySelector("[data-contact-status]");
  const submitButton = form.querySelector('button[type="submit"]');
  const ajaxEndpoint =
    form.getAttribute("data-formsubmit-ajax") ||
    (form.getAttribute("action") || "").replace("formsubmit.co/", "formsubmit.co/ajax/");

  if (!ajaxEndpoint) {
    return;
  }

  const setStatus = (message, state) => {
    if (!status) {
      return;
    }
    status.textContent = message;
    if (state) {
      status.setAttribute("data-state", state);
    } else {
      status.removeAttribute("data-state");
    }
  };

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    if (formData.get("_honey")) {
      return;
    }

    setStatus("Αποστολή...", "pending");
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.setAttribute("aria-busy", "true");
    }

    try {
      const response = await fetch(ajaxEndpoint, {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        form.reset();
        setStatus("Το μήνυμα στάλθηκε. Θα επικοινωνήσουμε σύντομα.", "success");
      } else {
        const data = await response.json().catch(() => null);
        const message =
          data?.message || "Δεν ήταν δυνατή η αποστολή. Δοκιμάστε ξανά.";
        setStatus(message, "error");
      }
    } catch (error) {
      setStatus("Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.", "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
})();
