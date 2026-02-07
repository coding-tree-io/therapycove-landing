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
  const ajaxEndpoint = form.getAttribute("data-contact-endpoint") || form.getAttribute("action") || "";

  if (!ajaxEndpoint) {
    return;
  }

  const draftStorageKey = `cove-contact-draft:${window.location.pathname}`;
  const loadDraft = () => {
    if (!window.sessionStorage) {
      return;
    }
    const raw = window.sessionStorage.getItem(draftStorageKey);
    if (!raw) {
      return;
    }
    try {
      const saved = JSON.parse(raw);
      fields.forEach((field) => {
        if (field.value) {
          return;
        }
        if (saved && typeof saved[field.name] === "string") {
          field.value = saved[field.name];
        }
      });
    } catch (error) {
      window.sessionStorage.removeItem(draftStorageKey);
    }
  };

  const persistDraft = () => {
    if (!window.sessionStorage) {
      return;
    }
    const isEmpty = fields.every((field) => !field.value.trim());
    if (isEmpty) {
      clearDraft();
      return;
    }
    const payload = fields.reduce((acc, field) => {
      acc[field.name] = field.value;
      return acc;
    }, {});
    window.sessionStorage.setItem(draftStorageKey, JSON.stringify(payload));
  };

  const clearDraft = () => {
    if (!window.sessionStorage) {
      return;
    }
    window.sessionStorage.removeItem(draftStorageKey);
  };

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

  const fieldMessages = fields.reduce((messages, field) => {
    messages[field.name] = {
      valueMissing: field.dataset.errorValueMissing,
      tooShort: field.dataset.errorTooShort,
      typeMismatch: field.dataset.errorTypeMismatch,
    };
    return messages;
  }, {});

  const statusMessages = {
    invalid: form.dataset.statusInvalid || "Παρακαλούμε συμπλήρωσε σωστά τα πεδία.",
    pending: form.dataset.statusPending || "Αποστολή...",
    success: form.dataset.statusSuccess || "Το μήνυμα στάλθηκε. Θα επικοινωνήσουμε σύντομα.",
    error: form.dataset.statusError || "Παρουσιάστηκε σφάλμα. Δοκιμάστε ξανά.",
    sendError: form.dataset.statusSendError || "Δεν ήταν δυνατή η αποστολή. Δοκιμάστε ξανά.",
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
      persistDraft();
    });
    field.addEventListener("blur", () => {
      validateField(field);
      updateButtonState();
    });
  });

  loadDraft();
  updateButtonState();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    if (formData.get("_honey")) {
      return;
    }

    if (!validateForm(true)) {
      setStatus(statusMessages.invalid, "error");
      updateButtonState();
      return;
    }

    setStatus(statusMessages.pending, "pending");
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
      const data = await response.clone().json().catch(() => null);

      if (response.ok && data?.success !== false) {
        form.reset();
        fields.forEach((field) => setFieldError(field, ""));
        updateButtonState();
        clearDraft();
        setStatus(statusMessages.success, "success");
      } else {
        const message =
          data?.message || data?.error_msg || statusMessages.sendError;
        setStatus(message, "error");
      }
    } catch (error) {
      setStatus(statusMessages.error, "error");
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.removeAttribute("aria-busy");
      }
    }
  });
})();
