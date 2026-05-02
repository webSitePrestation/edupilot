/**
 * Sahliya — pricing.js (DZD uniquement + bascule mensuel/annuel)
 */
'use strict';

(function initPricing() {
  const periodToggle = document.getElementById('periodToggle');
  const priceEls = document.querySelectorAll('.pricing-card__price');
  if (!periodToggle || !priceEls.length) return;

  let currentPeriod = 'monthly';

  const updateUI = () => {
    priceEls.forEach((priceEl) => {
      const key = currentPeriod === 'annual' ? 'annualDzd' : 'monthlyDzd';
      const val = priceEl.dataset[key];
      if (val) priceEl.textContent = val;

      const card = priceEl.closest('.pricing-card');
      if (!card) return;

      const periodLabel = card.querySelector('.pricing-card__period');
      const annualInfo = card.querySelector('.annual-info');

      if (periodLabel) {
        const nextPeriod = periodLabel.dataset['period' + capitalize(currentPeriod)];
        if (nextPeriod) periodLabel.textContent = nextPeriod;
      }

      if (annualInfo) {
        annualInfo.style.display = currentPeriod === 'annual' ? 'block' : 'none';
      }
    });
  };

  periodToggle.addEventListener('click', () => {
    periodToggle.classList.toggle('active');
    currentPeriod = periodToggle.classList.contains('active') ? 'annual' : 'monthly';
    periodToggle.setAttribute(
      'aria-label',
      currentPeriod === 'annual'
        ? "Basculer vers l'abonnement mensuel"
        : "Basculer vers l'abonnement annuel"
    );
    updateUI();
  });

  updateUI();

  function capitalize(value) {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
})();
