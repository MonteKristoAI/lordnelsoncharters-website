/* ============================================
   CHATBOT WIDGET
   ============================================ */

(function() {
  const chatBtn = document.getElementById('chatbot-btn');
  const chatPanel = document.getElementById('chatbot-panel');
  const chatBubble = document.getElementById('chatbot-bubble');
  const chatClose = document.getElementById('chatbot-close');
  const chatInput = document.getElementById('chatbot-input');
  const chatSend = document.getElementById('chatbot-send');
  const chatMessages = document.getElementById('chatbot-messages');

  if (!chatBtn) return;

  let isOpen = false;

  function toggleChat() {
    isOpen = !isOpen;
    if (chatPanel) chatPanel.classList.toggle('active', isOpen);
    if (chatBubble) chatBubble.style.display = isOpen ? 'none' : '';
    if (isOpen && chatInput) chatInput.focus();
  }

  chatBtn.addEventListener('click', toggleChat);
  if (chatClose) chatClose.addEventListener('click', toggleChat);

  // Dismiss bubble on click
  if (chatBubble) chatBubble.addEventListener('click', toggleChat);

  // Auto-dismiss bubble after 8s
  setTimeout(() => {
    if (chatBubble && !isOpen) chatBubble.style.display = 'none';
  }, 10000);

  // Send message
  function sendMessage() {
    if (!chatInput || !chatMessages) return;
    const text = chatInput.value.trim();
    if (!text) return;

    // User message
    const userMsg = document.createElement('div');
    userMsg.className = 'chat-msg user';
    userMsg.style.cssText = 'background:var(--ocean);color:var(--white);margin-left:auto;';
    userMsg.textContent = text;
    chatMessages.appendChild(userMsg);
    chatInput.value = '';

    // Bot response (placeholder - would connect to real AI in production)
    setTimeout(() => {
      const botMsg = document.createElement('div');
      botMsg.className = 'chat-msg bot';
      botMsg.textContent = getBotResponse(text);
      chatMessages.appendChild(botMsg);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 800);

    chatMessages.scrollTop = chatMessages.scrollHeight;
  }

  if (chatSend) chatSend.addEventListener('click', sendMessage);
  if (chatInput) chatInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') sendMessage(); });

  function getBotResponse(text) {
    const lower = text.toLowerCase();
    if (lower.includes('price') || lower.includes('cost') || lower.includes('how much')) {
      return 'Our private 2.5-hour cruises start at $350 for 2 guests. Sunset and day sails are the same rate. Check our Pricing page for full details, or call Captain John at 770-271-1888!';
    }
    if (lower.includes('book') || lower.includes('reserv')) {
      return 'You can book right here on our website using the booking form, or call Captain John directly at 770-271-1888. We recommend booking at least a week in advance for weekends!';
    }
    if (lower.includes('sunset')) {
      return 'Our sunset cruises are magical! The 2.5-hour sail departs about 2 hours before sundown so you catch the golden hour on Lake Lanier. Same pricing as day sails. Would you like to book one?';
    }
    if (lower.includes('group') || lower.includes('team') || lower.includes('corporate')) {
      return 'We specialize in corporate team building! Captain John has 20+ years of experience with Fortune 500 clients. Groups of 10-16 are $80/person for a 3-hour cruise. Want me to connect you with Captain John?';
    }
    if (lower.includes('kid') || lower.includes('child') || lower.includes('family')) {
      return 'Families are welcome! Children enjoy our cruises, and we even have a special Pirate Cruise with costumes and treasure hunts. You are welcome to bring snacks and drinks (BYOB, including alcohol for adults).';
    }
    if (lower.includes('bring') || lower.includes('byob') || lower.includes('food') || lower.includes('drink')) {
      return 'Absolutely! Lord Nelson Charters is BYOB. Bring your own cooler, picnic basket, snacks, and beverages (yes, alcohol is welcome). We have some on-board storage, but a soft cooler works best.';
    }
    if (lower.includes('where') || lower.includes('location') || lower.includes('dock') || lower.includes('marina')) {
      return 'We are docked at Safe Harbor Aqualand Marina, Dock Q. Address: 6800 Lights Ferry Rd, Flowery Branch, GA 30542. It is about 40 minutes north of Atlanta. Check our Contact page for driving directions!';
    }
    if (lower.includes('weather') || lower.includes('rain') || lower.includes('cancel')) {
      return 'Safety is our top priority. If weather conditions are unsafe, Captain John will contact you to reschedule at no charge. Light rain usually does not cancel a trip - it can be quite beautiful on the water!';
    }
    return 'Great question! For the best answer, I recommend reaching out to Captain John directly at 770-271-1888 or using our booking form. He can help with all cruise details, custom requests, and availability.';
  }

  // Close panel on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggleChat();
  });
})();
