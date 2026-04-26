/**
 * Sahliya — pricing.js
 * Currency toggle (TND / DZD / MAD) + monthly/annual switch.
 */

'use strict';

(function initPricing() {
  const currencyBtns = document.querySelectorAll('.currency-btn');
  const periodToggle = document.getElementById('periodToggle');
  const priceEls = document.querySelectorAll('.pricing-card__price');

  if (!currencyBtns.length || !periodToggle || !priceEls.length) return;

  let currentCurrency = 'tnd';
  let currentPeriod = 'monthly';

  const updateUI = () => {
    priceEls.forEach((priceEl) => {
      const price = priceEl.dataset[`${currentPeriod}${capitalize(currentCurrency)}`];
      if (price) priceEl.textContent = price;

      const card = priceEl.closest('.pricing-card');
      if (!card) return;

      const currencyLabel = card.querySelector(
        '.pricing-card__currency[data-label-tnd]'
      );
      const periodLabel = card.querySelector('.pricing-card__period');
      const annualInfo = card.querySelector('.annual-info');

      if (currencyLabel) {
        const nextLabel = currencyLabel.dataset[`label${capitalize(currentCurrency)}`];
        if (nextLabel) currencyLabel.textContent = nextLabel;
      }

      if (periodLabel) {
        const nextPeriod = periodLabel.dataset[`period${capitalize(currentPeriod)}`];
        if (nextPeriod) periodLabel.textContent = nextPeriod;
      }

      if (annualInfo) {
        annualInfo.style.display = currentPeriod === 'annual' ? 'block' : 'none';
      }
    });
  };

  currencyBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      const nextCurrency = (btn.dataset.currency || '').toLowerCase();
      if (!nextCurrency || nextCurrency === currentCurrency) return;

      currentCurrency = nextCurrency;
      currencyBtns.forEach((b) => b.classList.toggle('active', b === btn));
      updateUI();
    });
  });

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
