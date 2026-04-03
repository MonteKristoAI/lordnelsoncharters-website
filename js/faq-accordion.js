/* ============================================
   FAQ ACCORDION - ARIA-compliant
   Auto-generates FAQPage JSON-LD
   ============================================ */

(function() {
  const triggers = document.querySelectorAll('.faq-trigger');

  triggers.forEach(btn => {
    btn.addEventListener('click', () => {
      const content = btn.nextElementSibling;
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      // Close all others
      triggers.forEach(b => {
        b.setAttribute('aria-expanded', 'false');
        if (b.nextElementSibling) b.nextElementSibling.style.maxHeight = '0';
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        btn.setAttribute('aria-expanded', 'true');
        if (content) content.style.maxHeight = content.scrollHeight + 'px';
      }
    });
  });

  // Keyboard navigation
  triggers.forEach(btn => {
    btn.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        btn.click();
      }
    });
  });

  // Auto-generate FAQPage JSON-LD
  const faqItems = document.querySelectorAll('.faq-item');
  if (faqItems.length > 0) {
    const questions = [];
    faqItems.forEach(item => {
      const trigger = item.querySelector('.faq-trigger');
      const content = item.querySelector('.faq-content p');
      if (trigger && content) {
        questions.push({
          '@type': 'Question',
          name: trigger.textContent.trim(),
          acceptedAnswer: {
            '@type': 'Answer',
            text: content.textContent.trim()
          }
        });
      }
    });

    if (questions.length > 0) {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: questions
      });
      document.head.appendChild(script);
    }
  }
})();
