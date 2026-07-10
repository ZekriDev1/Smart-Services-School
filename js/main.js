/**
 * SMARTSERVICES Schools - Main JavaScript
 * Handles: Mobile menu, scroll-to-top, header shadow, app navigation
 */

document.addEventListener('DOMContentLoaded', function() {

  if (window.I18n) {
    I18n.init();
  }

  // Sync mobile language selector with main selector
  const mobileLangSelect = document.getElementById('mobileLangSelect');
  const langSelect = document.getElementById('langSelect');
  if (mobileLangSelect && langSelect) {
    mobileLangSelect.value = langSelect.value;
    mobileLangSelect.addEventListener('change', function() {
      if (window.I18n) {
        window.I18n.setLanguage(this.value);
        langSelect.value = this.value;
      }
    });
  }

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');

  if (menuToggle && navLinks) {
    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function closeNav() {
      navLinks.classList.remove('open');
      overlay.classList.remove('open');
      menuToggle.classList.remove('active');
      document.body.style.overflow = '';
    }

    menuToggle.addEventListener('click', function(e) {
      e.stopPropagation();
      navLinks.classList.toggle('open');
      overlay.classList.toggle('open');
      menuToggle.classList.toggle('active');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close nav when clicking any link inside the nav, but NOT the language selector
    navLinks.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        closeNav();
        // Navigate after a short delay to allow the close animation
        setTimeout(function() {
          window.location.href = link.getAttribute('href');
        }, 150);
      });
    });

    // Prevent nav from closing when clicking the mobile language selector
    const mobileLangSelector = navLinks.querySelector('.mobile-lang-selector');
    if (mobileLangSelector) {
      mobileLangSelector.addEventListener('click', function(e) {
        e.stopPropagation();
      });
    }

    // Close nav when clicking outside (on overlay)
    overlay.addEventListener('click', function() {
      closeNav();
    });
  }

  // ===== SCROLL TO TOP BUTTON =====
  const scrollToTopBtn = document.getElementById('scrollToTop');

  if (scrollToTopBtn) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 400) {
        scrollToTopBtn.classList.add('visible');
      } else {
        scrollToTopBtn.classList.remove('visible');
      }
    });

    scrollToTopBtn.addEventListener('click', function() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // ===== HEADER SHADOW ON SCROLL =====
  const mainHeader = document.getElementById('mainHeader');

  if (mainHeader) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 50) {
        mainHeader.classList.add('scrolled');
      } else {
        mainHeader.classList.remove('scrolled');
      }
    });
  }

  // ===== HERO AUTH BUTTONS =====
  const heroSignupBtn = document.getElementById('heroSignupBtn');
  const heroLoginBtn = document.getElementById('heroLoginBtn');

  if (heroSignupBtn && typeof openSignupModal === 'function') {
    heroSignupBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openSignupModal();
    });
  }

  if (heroLoginBtn && typeof openLoginModal === 'function') {
    heroLoginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      openLoginModal();
    });
  }

  // ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
  if ('IntersectionObserver' in window) {
    const animateElements = document.querySelectorAll(
      '.step-card, .service-card, .benefit-card'
    );

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    animateElements.forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(30px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      observer.observe(el);
    });
  }

});