(() => {
  const form = document.querySelector("[data-contact-form]");
  if (!form || !window.fetch) {
    return;
  }

  const status = form.querySelector("[data-contact-status]");
  const submitButton = form.querySelector('button[type="submit"]');
  const fields = Array.from(form.querySelectorAll("input, textarea")).filter(
    (field) => field.name && !field.name.startsWith("_")
  );
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

  const fieldMessages = {
    name: {
      valueMissing: "Συμπλήρωσε το ονοματεπώνυμο.",
      tooShort: "Το ονοματεπώνυμο πρέπει να έχει τουλάχιστον 2 χαρακτήρες.",
    },
    email: {
      valueMissing: "Συμπλήρωσε το email.",
      typeMismatch: "Χρησιμοποίησε ένα έγκυρο email.",
    },
    message: {
      valueMissing: "Συμπλήρωσε το μήνυμα.",
      tooShort: "Το μήνυμα πρέπει να έχει τουλάχιστον 10 χαρακτήρες.",
    },
  };

  const trimRules = {
    name: 2,
    message: 10,
  };

  const applyTrimValidation = (field) => {
    const minLength = trimRules[field.name];
    if (!minLength) {
      field.setCustomValidity("");
      return;
    }
    const trimmed = field.value.trim();
    if (!trimmed) {
      field.setCustomValidity(fieldMessages[field.name]?.valueMissing || "");
      return;
    }
    if (trimmed.length < minLength) {
      field.setCustomValidity(fieldMessages[field.name]?.tooShort || "");
      return;
    }
    field.setCustomValidity("");
  };

  const getErrorMessage = (field) => {
    const messages = fieldMessages[field.name] || {};
    const { validity } = field;
    if (validity.customError) {
      return field.validationMessage;
    }
    if (validity.valueMissing) {
      return messages.valueMissing || "Συμπλήρωσε αυτό το πεδίο.";
    }
    if (validity.typeMismatch) {
      return messages.typeMismatch || "Χρησιμοποίησε έγκυρα στοιχεία.";
    }
    if (validity.tooShort) {
      return messages.tooShort || "Το πεδίο είναι πολύ σύντομο.";
    }
    return "";
  };

  const setFieldError = (field, message) => {
    const error = form.querySelector(`[data-error-for="${field.id}"]`);
    if (!error) {
      return;
    }
    if (message) {
      error.textContent = message;
      error.classList.add("is-active");
      field.setAttribute("aria-invalid", "true");
    } else {
      error.textContent = "";
      error.classList.remove("is-active");
      field.removeAttribute("aria-invalid");
    }
  };

  const validateField = (field, showMessage = true) => {
    applyTrimValidation(field);
    const message = getErrorMessage(field);
    if (showMessage) {
      setFieldError(field, message);
    }
    return !message;
  };

  const validateForm = (showMessages = true) =>
    fields.every((field) => validateField(field, showMessages));

  const updateButtonState = () => {
    const isValid = validateForm(false);
    if (!submitButton) {
      return;
    }
    submitButton.disabled = !isValid;
    submitButton.setAttribute("aria-disabled", String(!isValid));
  };

  fields.forEach((field) => {
    field.addEventListener("input", () => {
      validateField(field);
      updateButtonState();
    });
    field.addEventListener("blur", () => {
      validateField(field);
      updateButtonState();
    });
  });

  updateButtonState();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    if (formData.get("_honey")) {
      return;
    }

    if (!validateForm(true)) {
      setStatus("Παρακαλούμε συμπλήρωσε σωστά τα πεδία.", "error");
      updateButtonState();
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
        fields.forEach((field) => setFieldError(field, ""));
        updateButtonState();
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
