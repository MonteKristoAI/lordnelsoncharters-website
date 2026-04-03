/* ============================================
   BOOKING WIZARD - Multi-Step Charter Booking
   with Calendly-Style Calendar
   ============================================ */

(function() {
  let currentStep = 1;
  let bookingData = { experience: '', guests: '', date: '', time: '', name: '', email: '', phone: '', message: '' };
  let calMonth, calYear;

  function goToStep(n) {
    document.querySelectorAll('.wizard-panel').forEach(p => p.classList.remove('active'));
    const panel = document.querySelector(`[data-step="${n}"]`);
    if (panel) panel.classList.add('active');

    document.querySelectorAll('.step-dot').forEach((dot, i) => {
      dot.classList.remove('active', 'completed');
      if (i + 1 < n) dot.classList.add('completed');
      if (i + 1 === n) dot.classList.add('active');
    });

    document.querySelectorAll('.step-line').forEach((line, i) => {
      line.classList.toggle('active', i + 1 < n);
    });

    currentStep = n;

    // Initialize calendar when reaching step 3
    if (n === 3 && !calMonth) {
      var now = new Date();
      calMonth = now.getMonth();
      calYear = now.getFullYear();
      renderCalendar();
    }
  }

  // Step 1: Experience selection
  document.querySelectorAll('.experience-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.experience-card').forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      bookingData.experience = card.dataset.experience;
      setTimeout(() => goToStep(2), 400);
    });
  });

  // Guest count buttons
  document.querySelectorAll('.guest-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.guest-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      bookingData.guests = btn.dataset.guests;
    });
  });

  // ==========================================
  // CALENDLY-STYLE CALENDAR
  // ==========================================

  function renderCalendar() {
    var container = document.getElementById('cal-container');
    if (!container) return;

    var today = new Date();
    today.setHours(0, 0, 0, 0);

    var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];
    var dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // First day of the month and number of days
    var firstDay = new Date(calYear, calMonth, 1).getDay();
    var daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

    // Can we go to previous month?
    var canPrev = calYear > today.getFullYear() || (calYear === today.getFullYear() && calMonth > today.getMonth());
    // Limit to 3 months ahead
    var maxMonth = today.getMonth() + 3;
    var maxYear = today.getFullYear();
    if (maxMonth > 11) { maxMonth -= 12; maxYear++; }
    var canNext = calYear < maxYear || (calYear === maxYear && calMonth < maxMonth);

    var html = '';

    // Header with month/year and nav arrows
    html += '<div class="cal-header">';
    html += '<button type="button" class="cal-nav" id="cal-prev"' + (!canPrev ? ' disabled' : '') + '>';
    html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>';
    html += '</button>';
    html += '<h4>' + monthNames[calMonth] + ' ' + calYear + '</h4>';
    html += '<button type="button" class="cal-nav" id="cal-next"' + (!canNext ? ' disabled' : '') + '>';
    html += '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>';
    html += '</button>';
    html += '</div>';

    // Weekday headers
    html += '<div class="cal-weekdays">';
    for (var w = 0; w < 7; w++) {
      html += '<div class="cal-weekday">' + dayNames[w] + '</div>';
    }
    html += '</div>';

    // Calendar grid
    html += '<div class="cal-grid">';

    // Empty cells before first day
    for (var e = 0; e < firstDay; e++) {
      html += '<button type="button" class="cal-day cal-empty" tabindex="-1"></button>';
    }

    // Day cells
    for (var d = 1; d <= daysInMonth; d++) {
      var dateObj = new Date(calYear, calMonth, d);
      var dateStr = calYear + '-' + String(calMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
      var isPast = dateObj < today;
      var isToday = dateObj.getTime() === today.getTime();
      var isSelected = bookingData.date === dateStr;

      var classes = 'cal-day';
      if (isPast) classes += ' cal-disabled';
      if (isToday) classes += ' cal-today';
      if (isSelected) classes += ' cal-selected';

      html += '<button type="button" class="' + classes + '" data-date="' + dateStr + '"' + (isPast ? ' tabindex="-1"' : '') + '>' + d + '</button>';
    }

    html += '</div>';

    // Time slots
    html += '<div class="time-slots">';
    html += '<p style="width:100%;text-align:center;font-size:0.8125rem;font-weight:600;color:var(--navy);margin:0 0 0.5rem;">Preferred Time</p>';
    var times = [
      { label: 'Morning', sub: '9:00 AM', value: 'Morning (9:00 AM)' },
      { label: 'Afternoon', sub: '1:00 PM', value: 'Afternoon (1:00 PM)' },
      { label: 'Sunset', sub: 'varies', value: 'Sunset (varies)' }
    ];
    for (var t = 0; t < times.length; t++) {
      var sel = bookingData.time === times[t].value ? ' selected' : '';
      html += '<button type="button" class="time-slot' + sel + '" data-time="' + times[t].value + '">';
      html += '<strong>' + times[t].label + '</strong> <span style="opacity:0.6;font-size:0.75rem;">' + times[t].sub + '</span>';
      html += '</button>';
    }
    html += '</div>';

    container.innerHTML = html;

    // Bind calendar events
    var prevBtn = document.getElementById('cal-prev');
    var nextBtn = document.getElementById('cal-next');
    if (prevBtn) prevBtn.addEventListener('click', function() { calMonth--; if (calMonth < 0) { calMonth = 11; calYear--; } renderCalendar(); });
    if (nextBtn) nextBtn.addEventListener('click', function() { calMonth++; if (calMonth > 11) { calMonth = 0; calYear++; } renderCalendar(); });

    // Day click
    container.querySelectorAll('.cal-day:not(.cal-disabled):not(.cal-empty)').forEach(function(btn) {
      btn.addEventListener('click', function() {
        container.querySelectorAll('.cal-day').forEach(function(b) { b.classList.remove('cal-selected'); });
        btn.classList.add('cal-selected');
        bookingData.date = btn.dataset.date;
      });
    });

    // Time slot click
    container.querySelectorAll('.time-slot').forEach(function(btn) {
      btn.addEventListener('click', function() {
        container.querySelectorAll('.time-slot').forEach(function(b) { b.classList.remove('selected'); });
        btn.classList.add('selected');
        bookingData.time = btn.dataset.time;
      });
    });
  }

  // Navigation buttons
  document.querySelectorAll('[data-wizard-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      var nextStep = parseInt(btn.dataset.wizardNext, 10);
      if (validateStep(currentStep)) goToStep(nextStep);
    });
  });

  document.querySelectorAll('[data-wizard-back]').forEach(btn => {
    btn.addEventListener('click', () => {
      goToStep(parseInt(btn.dataset.wizardBack, 10));
    });
  });

  function validateStep(step) {
    if (step === 1 && !bookingData.experience) {
      highlightRequired('.experience-card');
      return false;
    }
    if (step === 2) {
      if (!bookingData.guests) { highlightRequired('.guest-btn'); return false; }
    }
    if (step === 3) {
      if (!bookingData.date) {
        var calGrid = document.querySelector('.cal-grid');
        if (calGrid) calGrid.style.outline = '2px solid #DC2626';
        setTimeout(function() { if (calGrid) calGrid.style.outline = ''; }, 1500);
        return false;
      }
      if (!bookingData.time) { highlightRequired('.time-slot'); return false; }
    }
    return true;
  }

  function highlightRequired(selector) {
    document.querySelectorAll(selector).forEach(el => {
      el.style.borderColor = '#DC2626';
      setTimeout(() => { el.style.borderColor = ''; }, 1500);
    });
  }

  // Submit booking
  var bookingForm = document.getElementById('booking-form');
  if (bookingForm) {
    bookingForm.addEventListener('submit', function(e) {
      e.preventDefault();
      var name = document.getElementById('booking-name');
      var email = document.getElementById('booking-email');
      var phone = document.getElementById('booking-phone');
      var message = document.getElementById('booking-message');

      var valid = true;
      [name, email].forEach(function(field) {
        if (!field.value.trim()) {
          field.classList.add('error');
          valid = false;
        } else {
          field.classList.remove('error');
        }
      });
      if (email && !email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        email.classList.add('error');
        valid = false;
      }
      if (!valid) return;

      bookingData.name = name.value;
      bookingData.email = email.value;
      bookingData.phone = phone ? phone.value : '';
      bookingData.message = message ? message.value : '';

      var submitBtn = bookingForm.querySelector('button[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Sending...'; }

      fetch(typeof CONFIG !== 'undefined' ? CONFIG.bookingWebhookUrl : '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: 'charter_booking', experience: bookingData.experience, guests: bookingData.guests, date: bookingData.date, time: bookingData.time, name: bookingData.name, email: bookingData.email, phone: bookingData.phone, message: bookingData.message, timestamp: new Date().toISOString() })
      }).catch(function() {});

      // Show success
      document.querySelectorAll('.wizard-panel').forEach(function(p) { p.classList.remove('active'); });
      var success = document.getElementById('booking-success');
      if (success) success.classList.add('active');

      document.querySelectorAll('.step-dot').forEach(function(dot) { dot.classList.add('completed'); });
    });
  }

  // Expose for external use
  window.goToBookingStep = goToStep;
})();
