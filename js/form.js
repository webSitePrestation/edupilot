/**
 * Sahliya — form.js
 * Client-side validation + async submission for demo.html and contact.html
 */

'use strict';

/* ─────────────────────────────────────────────
   UTILITIES
───────────────────────────────────────────── */
const isEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
const isPhone = (v) => /^\+?[\d\s\-().]{7,20}$/.test(v.trim());
const isEmpty = (v) => !v || v.trim() === '';

function setError(fieldId, msg) {
  const errorEl = document.getElementById(fieldId + 'Error');
  const field = document.getElementById(fieldId);
  if (errorEl) errorEl.textContent = msg;
  if (field) field.setAttribute('aria-invalid', msg ? 'true' : 'false');
}

function clearError(fieldId) {
  setError(fieldId, '');
}

function clearAllErrors(fields) {
  fields.forEach(f => clearError(f));
}


/* ─────────────────────────────────────────────
   DEMO FORM
───────────────────────────────────────────── */
(function initDemoForm() {
  const form = document.getElementById('demoForm');
  if (!form) return;

  const fields = ['prenom', 'nom', 'email', 'tel', 'etablissement', 'pays', 'ville', 'nb_eleves', 'role', 'rgpd'];

  // Live validation on blur
  ['prenom', 'nom', 'etablissement', 'ville'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateDemoField(id));
  });

  ['email', 'tel'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateDemoField(id));
  });

  ['pays', 'nb_eleves', 'role'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('change', () => validateDemoField(id));
  });

  function validateDemoField(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const val = el.value;

    switch (id) {
      case 'prenom':
      case 'nom':
        if (isEmpty(val)) { setError(id, 'Ce champ est requis.'); return false; }
        if (val.trim().length < 2) { setError(id, 'Minimum 2 caractères.'); return false; }
        break;
      case 'etablissement':
      case 'ville':
        if (isEmpty(val)) { setError(id, 'Ce champ est requis.'); return false; }
        break;
      case 'email':
        if (isEmpty(val)) { setError(id, 'L\'email est requis.'); return false; }
        if (!isEmail(val)) { setError(id, 'Adresse email invalide.'); return false; }
        break;
      case 'tel':
        if (isEmpty(val)) { setError(id, 'Le téléphone est requis.'); return false; }
        if (!isPhone(val)) { setError(id, 'Numéro invalide. Incluez l\'indicatif (+216…).'); return false; }
        break;
      case 'pays':
      case 'nb_eleves':
      case 'role':
        if (isEmpty(val)) { setError(id, 'Veuillez faire un choix.'); return false; }
        break;
      default:
        break;
    }
    clearError(id);
    return true;
  }

  function validateDemoForm() {
    const toValidate = ['prenom', 'nom', 'email', 'tel', 'etablissement', 'pays', 'ville', 'nb_eleves', 'role'];
    let valid = true;

    toValidate.forEach(id => {
      if (!validateDemoField(id)) valid = false;
    });

    // RGPD checkbox
    const rgpd = document.getElementById('rgpd');
    if (!rgpd || !rgpd.checked) {
      setError('rgpd', 'Vous devez accepter la politique de confidentialité.');
      valid = false;
    } else {
      clearError('rgpd');
    }

    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateDemoForm()) {
      // Scroll to first error
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        const top = firstError.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    // Honeypot check
    const honeypot = form.querySelector('input[name="honeypot"]');
    if (honeypot && honeypot.value) return; // Silently drop

    const submitBtn = document.getElementById('demoSubmit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    // Loading state
    submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline';

    try {
      const formData = new FormData(form);

      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
      });

      if (response.redirected || response.ok) {
        // Redirect to thank-you page
        window.location.href = 'merci.html';
      } else {
        throw new Error('Erreur serveur ' + response.status);
      }
    } catch (err) {
      console.error('Demo form error:', err);
      if (window.showToast) {
        window.showToast('Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.', 'error');
      }
      submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  });
})();


/* ─────────────────────────────────────────────
   CONTACT FORM
───────────────────────────────────────────── */
(function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  ['prenom', 'nom'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('blur', () => validateContactField(id));
  });

  const emailEl = document.getElementById('email');
  if (emailEl) emailEl.addEventListener('blur', () => validateContactField('email'));

  const sujetEl = document.getElementById('sujet');
  if (sujetEl) sujetEl.addEventListener('change', () => validateContactField('sujet'));

  const msgEl = document.getElementById('message');
  if (msgEl) msgEl.addEventListener('blur', () => validateContactField('message'));

  function validateContactField(id) {
    const el = document.getElementById(id);
    if (!el) return true;
    const val = el.value;

    switch (id) {
      case 'prenom':
      case 'nom':
        if (isEmpty(val)) { setError(id, 'Ce champ est requis.'); return false; }
        break;
      case 'email':
        if (isEmpty(val)) { setError(id, 'L\'email est requis.'); return false; }
        if (!isEmail(val)) { setError(id, 'Adresse email invalide.'); return false; }
        break;
      case 'sujet':
        if (isEmpty(val)) { setError(id, 'Veuillez choisir un sujet.'); return false; }
        break;
      case 'message':
        if (isEmpty(val)) { setError(id, 'Veuillez écrire votre message.'); return false; }
        if (val.trim().length < 10) { setError(id, 'Message trop court (10 caractères min.).'); return false; }
        break;
      default:
        break;
    }
    clearError(id);
    return true;
  }

  function validateContactForm() {
    const toValidate = ['prenom', 'nom', 'email', 'sujet', 'message'];
    let valid = true;

    toValidate.forEach(id => {
      if (!validateContactField(id)) valid = false;
    });

    const rgpd = document.getElementById('rgpd');
    if (!rgpd || !rgpd.checked) {
      setError('rgpd', 'Vous devez accepter la politique de confidentialité.');
      valid = false;
    } else {
      clearError('rgpd');
    }

    return valid;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validateContactForm()) {
      const firstError = form.querySelector('[aria-invalid="true"]');
      if (firstError) {
        const top = firstError.getBoundingClientRect().top + window.scrollY - 120;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      return;
    }

    const honeypot = form.querySelector('input[name="honeypot"]');
    if (honeypot && honeypot.value) return;

    const submitBtn = document.getElementById('contactSubmit');
    const btnText = submitBtn?.querySelector('.btn-text');
    const btnLoader = submitBtn?.querySelector('.btn-loader');

    if (submitBtn) submitBtn.disabled = true;
    if (btnText) btnText.style.display = 'none';
    if (btnLoader) btnLoader.style.display = 'inline';

    try {
      const formData = new FormData(form);

      const response = await fetch(form.action, {
        method: 'POST',
        body: formData,
      });

      if (response.redirected || response.ok) {
        window.location.href = 'merci.html';
      } else {
        throw new Error('Erreur serveur ' + response.status);
      }
    } catch (err) {
      console.error('Contact form error:', err);
      if (window.showToast) {
        window.showToast('Une erreur est survenue. Réessayez ou contactez-nous sur WhatsApp.', 'error');
      }
      if (submitBtn) submitBtn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  });
})();
