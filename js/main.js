/* ============================================
   LORD NELSON CHARTERS - Main JS
   Header, mobile menu, scroll reveal, counters
   ============================================ */

// --- CONFIG ---
const CONFIG = {
  phone: '770-271-1888',
  phoneTel: 'tel:+17702711888',
  email: 'info@lordnelsoncharters.com',
  googleReviewsUrl: 'https://maps.google.com/?cid=13465404798994123730',
  webhookUrl: 'https://primary-production-5fdce.up.railway.app/webhook/lord-nelson-inquiry',
  bookingWebhookUrl: 'https://primary-production-5fdce.up.railway.app/webhook/lord-nelson-booking',
  reviewWebhookUrl: 'https://primary-production-5fdce.up.railway.app/webhook/lord-nelson-review',
  chatbotName: 'Nelson',
  chatbotWelcome: 'Ahoy! I\'m Nelson, your sailing assistant. Ask me about cruises, pricing, or how to book your Lake Lanier adventure.',
};

// --- HEADER SCROLL ---
const header = document.querySelector('.site-header');
if (header) {
  let lastScroll = 0;
  window.addEventListener('scroll', () => {
    const y = window.scrollY;
    header.classList.toggle('scrolled', y > 60);
    lastScroll = y;
  }, { passive: true });
}

// --- MOBILE MENU ---
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const mobileClose = document.getElementById('mobile-close');

if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.classList.add('active');
    document.body.style.overflow = 'hidden';
    menuToggle.setAttribute('aria-expanded', 'true');
  });

  const closeMenu = () => {
    mobileMenu.classList.remove('active');
    document.body.style.overflow = '';
    menuToggle.setAttribute('aria-expanded', 'false');
  };

  if (mobileClose) mobileClose.addEventListener('click', closeMenu);
  mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
  mobileMenu.addEventListener('click', (e) => { if (e.target === mobileMenu) closeMenu(); });
}

// --- SCROLL REVEAL ---
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// --- ROTATING TEXT ---
const rotatingEl = document.getElementById('rotating-text');
if (rotatingEl) {
  const words = JSON.parse(rotatingEl.dataset.words || '[]');
  if (words.length > 1) {
    let idx = 0;
    setInterval(() => {
      rotatingEl.style.opacity = '0';
      rotatingEl.style.transform = 'translateY(-100%)';
      setTimeout(() => {
        idx = (idx + 1) % words.length;
        rotatingEl.textContent = words[idx];
        rotatingEl.style.opacity = '1';
        rotatingEl.style.transform = 'translateY(0)';
      }, 350);
    }, 3000);
  }
}

// --- ANIMATED COUNTERS ---
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.target, 10);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      let current = 0;
      const step = Math.max(1, Math.ceil(target / 60));
      const timer = setInterval(() => {
        current += step;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        el.textContent = prefix + current.toLocaleString() + suffix;
      }, 25);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-target]').forEach(el => counterObserver.observe(el));

// --- SMOOTH ANCHOR SCROLL ---
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', (e) => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// --- ACTIVE NAV HIGHLIGHT ---
const sections = document.querySelectorAll('section[id]');
if (sections.length) {
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      if (window.scrollY >= section.offsetTop - 200) {
        current = section.getAttribute('id');
      }
    });
    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  }, { passive: true });
}
