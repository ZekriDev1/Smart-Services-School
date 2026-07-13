/**
 * SMARTSERVICES Schools - Main JavaScript
 * Handles: Mobile menu, scroll-to-top, header shadow, app navigation
 */

document.addEventListener('DOMContentLoaded', function() {

  if (window.I18n) {
    I18n.init();
  }

  // Sync language selectors (desktop + mobile)
  function bindLangSelector(selectorId) {
    const sel = document.getElementById(selectorId);
    if (sel) {
      sel.addEventListener('change', function() {
        if (window.I18n) {
          window.I18n.setLanguage(this.value);
        }
      });
      // Sync value when I18n language changes
      document.addEventListener('languageChanged', function() {
        if (window.I18n) {
          sel.value = window.I18n.currentLang || 'fr';
        }
      });
    }
  }
  bindLangSelector('langSelect');

  // ===== HAMBURGER MENU =====
  var hamburger = document.getElementById('hamburger');
  var navLinks = document.getElementById('navLinks');

  if (hamburger && navLinks) {
    var mobileActions = document.createElement('div');
    mobileActions.className = 'mobile-actions';
    navLinks.appendChild(mobileActions);

    // Only clone lang selector if not already inside #navLinks
    if (!navLinks.querySelector('.lang-selector')) {
      var mobileLang = document.createElement('div');
      mobileLang.className = 'mobile-lang';
      var desktopLang = document.querySelector('.lang-selector');
      if (desktopLang) {
        mobileLang.innerHTML = desktopLang.innerHTML;
        navLinks.appendChild(mobileLang);
        var mobSel = mobileLang.querySelector('select');
        if (mobSel) {
          mobSel.addEventListener('change', function() {
            if (window.I18n) window.I18n.setLanguage(this.value);
          });
        }
      }
    }

    function openHamburger() {
      var ha = document.getElementById('headerActions');
      if (ha) mobileActions.innerHTML = ha.innerHTML;
      mobileActions.querySelectorAll('[onclick]').forEach(function(el) {
        var fn = el.getAttribute('onclick');
        el.removeAttribute('onclick');
        el.addEventListener('click', function(e) {
          e.stopPropagation();
          try { eval(fn); } catch(ex) {}
          closeHamburger();
        });
      });
      navLinks.classList.add('open');
      hamburger.classList.add('active');
      document.body.style.overflow = 'hidden';
    }

    function closeHamburger() {
      navLinks.classList.remove('open');
      hamburger.classList.remove('active');
      document.body.style.overflow = '';
    }

    hamburger.addEventListener('click', function(e) {
      e.stopPropagation();
      if (navLinks.classList.contains('open')) {
        closeHamburger();
      } else {
        openHamburger();
      }
    });

    var hamburgerLinks = navLinks.querySelectorAll('a');
    for (var i = 0; i < hamburgerLinks.length; i++) {
      hamburgerLinks[i].addEventListener('click', function() {
        setTimeout(closeHamburger, 150);
      });
    }

    document.addEventListener('languageChanged', function() {
      if (window.I18n && typeof mobileLang !== 'undefined' && mobileLang) {
        var sel = mobileLang.querySelector('select');
        if (sel) sel.value = window.I18n.currentLang || 'fr';
      }
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