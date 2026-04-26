/**
 * Sahliya — main.js
 * Burger menu · Navbar scroll · FAQ accordion · Scroll animations · Smooth scroll
 */

'use strict';

/* ─────────────────────────────────────────────
   REVEAL ANIMATIONS — generic .reveal blocks
───────────────────────────────────────────── */
(function initReveal() {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  // Fallback for older browsers: show content immediately.
  if (!('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('visible'));
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  revealEls.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────
   NAVBAR — scroll effect
───────────────────────────────────────────── */
(function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const onScroll = () => {
    if (window.scrollY > 30) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on load
})();


/* ─────────────────────────────────────────────
   BURGER MENU — mobile nav toggle
───────────────────────────────────────────── */
(function initBurger() {
  const burger =
    document.getElementById('burgerBtn') || document.getElementById('burger');
  const navLinks =
    document.getElementById('mobileMenu') || document.getElementById('navLinks');
  if (!burger || !navLinks) return;

  const toggle = () => {
    const isOpen = navLinks.classList.toggle('open');
    burger.classList.toggle('open', isOpen);
    burger.classList.toggle('active', isOpen);
    burger.setAttribute('aria-expanded', String(isOpen));
    document.body.style.overflow = isOpen ? 'hidden' : '';
  };

  burger.addEventListener('click', toggle);

  // Close on nav link click
  navLinks.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (!burger.contains(e.target) && !navLinks.contains(e.target)) {
      navLinks.classList.remove('open');
      burger.classList.remove('open');
      burger.classList.remove('active');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    }
  });

  // Close on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && navLinks.classList.contains('open')) {
      toggle();
      burger.focus();
    }
  });
})();


/* ─────────────────────────────────────────────
   FAQ ACCORDION — index.html & faq.html
───────────────────────────────────────────── */
(function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');
  if (!faqItems.length) return;

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');
    if (!question || !answer) return;

    // Set initial max-height for transition
    answer.style.maxHeight = '0';
    answer.style.overflow = 'hidden';
    answer.style.transition = 'max-height 0.3s ease, padding 0.3s ease';

    question.addEventListener('click', () => {
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      // Close all siblings in the same list
      const parentList = item.closest('.faq-list, .faq');
      if (parentList) {
        parentList.querySelectorAll('.faq-item').forEach(sibling => {
          const sibQ = sibling.querySelector('.faq-question');
          const sibA = sibling.querySelector('.faq-answer');
          if (sibQ && sibA && sibQ !== question) {
            sibQ.setAttribute('aria-expanded', 'false');
            sibA.style.maxHeight = '0';
            sibling.classList.remove('open');
            const sibIcon = sibQ.querySelector('.faq-icon');
            if (sibIcon) sibIcon.textContent = '+';
          }
        });
      }

      // Toggle current
      if (isOpen) {
        question.setAttribute('aria-expanded', 'false');
        answer.style.maxHeight = '0';
        item.classList.remove('open');
        const icon = question.querySelector('.faq-icon');
        if (icon) icon.textContent = '+';
      } else {
        question.setAttribute('aria-expanded', 'true');
        answer.style.maxHeight = answer.scrollHeight + 32 + 'px';
        item.classList.add('open');
        const icon = question.querySelector('.faq-icon');
        if (icon) icon.textContent = '×';
      }
    });
  });
})();


/* ─────────────────────────────────────────────
   FAQ CATEGORY TABS — faq.html only
───────────────────────────────────────────── */
(function initFaqCategories() {
  const catBtns = document.querySelectorAll('.faq-cat-btn');
  if (!catBtns.length) return;

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const cat = btn.dataset.cat;

      // Update buttons
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Show/hide categories
      document.querySelectorAll('.faq-category').forEach(section => {
        section.classList.remove('active');
      });
      const target = document.getElementById('cat-' + cat);
      if (target) target.classList.add('active');
    });
  });
})();


/* ─────────────────────────────────────────────
   SCROLL ANIMATIONS — Intersection Observer
───────────────────────────────────────────── */
(function initScrollAnimations() {
  if (!('IntersectionObserver' in window)) return;

  const animatedEls = document.querySelectorAll(
    '.benefit-card, .feature-tile, .testimonial-card, .pricing-card, ' +
    '.feature-detail, .pour-qui-card, .demo-form-wrapper, .demo-sidebar, ' +
    '.contact-form-wrapper, .contact-sidebar > *, .faq-item'
  );

  if (!animatedEls.length) return;

  // Add initial state
  animatedEls.forEach((el, i) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(24px)';
    el.style.transition = `opacity 0.5s ease ${(i % 4) * 0.08}s, transform 0.5s ease ${(i % 4) * 0.08}s`;
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  animatedEls.forEach(el => observer.observe(el));
})();


/* ─────────────────────────────────────────────
   SMOOTH SCROLL — anchor links
───────────────────────────────────────────── */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const hash = link.getAttribute('href');
      if (hash === '#') return;
      const target = document.querySelector(hash);
      if (!target) return;
      e.preventDefault();
      const navHeight = document.getElementById('navbar')?.offsetHeight || 80;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 16;
      window.scrollTo({ top, behavior: 'smooth' });
      // Update URL without jump
      history.pushState(null, '', hash);
    });
  });
})();

/* ─────────────────────────────────────────────
   HOME VIDEO — play on click and hide placeholder
───────────────────────────────────────────── */
(function initHomeVideo() {
  const wrapper = document.querySelector('.video-wrapper');
  if (!wrapper) return;

  const video = wrapper.querySelector('video');
  const placeholder = wrapper.querySelector('#videoPlaceholder');
  if (!video || !placeholder) return;

  const revealVideo = () => {
    placeholder.style.display = 'none';
  };

  const playVideo = () => {
    revealVideo();
    const playPromise = video.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {
        // Ignore browser autoplay/play promise edge cases.
      });
    }
  };

  placeholder.addEventListener('click', playVideo);

  // If user uses native controls, keep placeholder hidden.
  video.addEventListener('play', revealVideo);
})();


/* ─────────────────────────────────────────────
   CSRF TOKEN — generate client-side token
   (server must validate against session)
───────────────────────────────────────────── */
(function initCsrfToken() {
  const tokenInput = document.getElementById('csrfToken');
  if (!tokenInput) return;

  // Generate a random token and store in sessionStorage
  let token = sessionStorage.getItem('csrf_token');
  if (!token) {
    token = Array.from(crypto.getRandomValues(new Uint8Array(24)))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    sessionStorage.setItem('csrf_token', token);
  }
  tokenInput.value = token;
})();


/* ─────────────────────────────────────────────
   TOAST HELPER — global utility
───────────────────────────────────────────── */
window.showToast = function(message, type = 'success') {
  const toast = document.getElementById('toast');
  if (!toast) return;

  toast.textContent = message;
  toast.className = 'toast toast--' + type + ' toast--visible';

  setTimeout(() => {
    toast.className = 'toast';
  }, 4000);
};


/* ─────────────────────────────────────────────
   HERO COUNTER ANIMATION
───────────────────────────────────────────── */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  if (!('IntersectionObserver' in window)) return;

  const animateCount = (el) => {
    const target = parseInt(el.dataset.target, 10);
    const suffix = el.dataset.suffix || '';
    const duration = 1500;
    const start = performance.now();

    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease out cubic
      el.textContent = Math.round(eased * target) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(el => observer.observe(el));
})();
