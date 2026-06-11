/* eslint-disable */
// Lord Nelson Charters — local-SEO location page generator.
// Generates one landing page per metro-Atlanta city: "Sailing charters near {City}".
// Static HTML, design 1:1 with the existing site. Run: `node generate-locations.js`
// Re-runnable (overwrites). Captain John first-person voice; Lake Lanier + Aqualand
// Marina anchors on every page; no banned vocab; never claims a USCG license.

const fs = require("fs");
const path = require("path");

const SITE = "https://lordnelsoncharters.com";
const PHONE = "770-271-1888";
const PHONE_RAW = "+17702711888";

// --- City data: drive time + miles + primary route to Aqualand Marina (Flowery Branch).
// hook = one unique local sentence so no two pages read the same.
const CITIES = [
  { name: "Atlanta", slug: "atlanta", min: 45, miles: 45, route: "I-85 north to I-985", county: "Fulton", hook: "From intown Atlanta you can leave after a slow breakfast and still have your hand on the tiller before noon." },
  { name: "Alpharetta", slug: "alpharetta", min: 35, miles: 28, route: "GA-400 to GA-20, then I-985", county: "Fulton", hook: "Plenty of Alpharetta families come up for a half-day and are home before the kids' bedtime." },
  { name: "Johns Creek", slug: "johns-creek", min: 30, miles: 26, route: "State Bridge Road to Peachtree Industrial and I-985", county: "Fulton", hook: "Johns Creek sits about as close to the lake as any North Fulton suburb gets." },
  { name: "Sandy Springs", slug: "sandy-springs", min: 40, miles: 35, route: "GA-400 north, then GA-20 to I-985", county: "Fulton", hook: "Skip the Saturday traffic on 400 and the lake feels a lot closer than it looks on the map." },
  { name: "Roswell", slug: "roswell", min: 40, miles: 33, route: "GA-400 to GA-20 east, then I-985", county: "Fulton", hook: "Roswell on the Chattahoochee and Lord Nelson on Lake Lanier — same water, bigger horizon." },
  { name: "Milton", slug: "milton", min: 35, miles: 30, route: "GA-400 north to GA-20, then I-985", county: "Fulton", hook: "Milton's horse-country quiet trades nicely for an afternoon of open water." },
  { name: "Cumming", slug: "cumming", min: 25, miles: 20, route: "GA-400 to GA-20 east, then toward Friendship Road", county: "Forsyth", hook: "Cumming is one of the quickest runs to the dock from the 400 corridor." },
  { name: "Buford", slug: "buford", min: 15, miles: 11, route: "I-985 north to Friendship Road", county: "Gwinnett", hook: "Buford is practically on the lake — fifteen minutes door to Dock Q." },
  { name: "Flowery Branch", slug: "flowery-branch", min: 8, miles: 4, route: "a short hop down Lights Ferry Road", county: "Hall", hook: "Flowery Branch is home water — the marina is right in your back yard." },
  { name: "Oakwood", slug: "oakwood", min: 12, miles: 8, route: "Mundy Mill Road to Lights Ferry Road", county: "Hall", hook: "Oakwood is close enough to sail on a weeknight after work." },
  { name: "Gainesville", slug: "gainesville", min: 15, miles: 12, route: "I-985 south to Friendship Road", county: "Hall", hook: "Gainesville folks already know the lake — this is just the calm, captained way to see it." },
  { name: "Braselton", slug: "braselton", min: 20, miles: 16, route: "GA-211 to I-985 north", county: "Jackson", hook: "Braselton to the dock is a straight, easy run up 985." },
  { name: "Dawsonville", slug: "dawsonville", min: 30, miles: 24, route: "GA-400 south to GA-53, then toward Gainesville", county: "Dawson", hook: "Trade the mountains for the main channel — Dawsonville is a half-hour from the slip." },
  { name: "Dahlonega", slug: "dahlonega", min: 35, miles: 28, route: "GA-400 south to GA-60, then GA-53 toward Gainesville", county: "Lumpkin", hook: "Come down out of the gold-country hills and onto open water for the afternoon." },
  { name: "Duluth", slug: "duluth", min: 30, miles: 25, route: "Peachtree Industrial Boulevard to I-985", county: "Gwinnett", hook: "Duluth runs straight up Peachtree Industrial to the lake — no interstate slog." },
  { name: "Norcross", slug: "norcross", min: 35, miles: 30, route: "I-85 north to I-985", county: "Gwinnett", hook: "Norcross to Dock Q is a clean shot up the interstate." },
  { name: "Lawrenceville", slug: "lawrenceville", min: 30, miles: 25, route: "GA-316 to I-85, then I-985", county: "Gwinnett", hook: "Lawrenceville sits right in the middle of Gwinnett's quick run to the lake." },
  { name: "Lilburn", slug: "lilburn", min: 35, miles: 30, route: "US-29 to I-85 north, then I-985", county: "Gwinnett", hook: "Lilburn is a half-hour from trading the yard for the cockpit." },
  { name: "Snellville", slug: "snellville", min: 35, miles: 32, route: "US-78 to I-985 via Lawrenceville", county: "Gwinnett", hook: "Snellville's an easy diagonal up through Gwinnett to the water." },
  { name: "Suwanee area Buford", slug: "winder", min: 30, miles: 27, route: "GA-211 to I-85, then I-985", county: "Barrow", hook: "Winder rides up through Braselton and onto the lake inside a half-hour.", display: "Winder" },
  { name: "Jefferson", slug: "jefferson", min: 30, miles: 24, route: "US-129 to I-85, then I-985", county: "Jackson", hook: "Jefferson is a straight country run over to the I-985 corridor." },
  { name: "Commerce", slug: "commerce", min: 35, miles: 30, route: "I-85 south to I-985 north", county: "Jackson", hook: "Commerce hops on 85 and is at the dock before the outlets open." },
  { name: "Athens", slug: "athens", min: 45, miles: 42, route: "US-129 north through Jefferson to I-985", county: "Clarke", hook: "Athens makes a fine lake day — under an hour from downtown to the docks." },
  { name: "Tucker", slug: "tucker", min: 35, miles: 32, route: "I-285 to I-85 north, then I-985", county: "DeKalb", hook: "Tucker slips onto 85 and up to the lake without crossing the city." },
  { name: "Decatur", slug: "decatur", min: 45, miles: 38, route: "I-285 to I-85 north, then I-985", county: "DeKalb", hook: "Decatur to Dock Q is a quiet weekend-morning drive up the east side." },
  { name: "Stone Mountain", slug: "stone-mountain", min: 40, miles: 35, route: "US-78 to I-285, then I-85 and I-985", county: "DeKalb", hook: "Swap one Georgia landmark for another — the mountain for the main channel." },
  { name: "Brookhaven", slug: "brookhaven", min: 40, miles: 34, route: "I-85 north to I-985", county: "DeKalb", hook: "Brookhaven is a clean forty-minute run straight up 85." },
  { name: "Dunwoody", slug: "dunwoody", min: 35, miles: 32, route: "GA-400 north to GA-20, then I-985", county: "DeKalb", hook: "Dunwoody hops on 400 and is at the lake before lunch." },
  { name: "Kennesaw", slug: "kennesaw", min: 50, miles: 45, route: "I-575 to GA-20 east, then I-985", county: "Cobb", hook: "Kennesaw runs across the top of the metro on GA-20 to reach the lake." },
  { name: "Acworth", slug: "acworth", min: 50, miles: 46, route: "I-575 to GA-20 east toward Cumming, then I-985", county: "Cobb", hook: "Acworth has its own lake, but Lanier's open water and a captained sail are a different day." },
  { name: "Smyrna", slug: "smyrna", min: 50, miles: 44, route: "I-285 north to GA-400, then GA-20 and I-985", county: "Cobb", hook: "Smyrna swings around the Perimeter and up 400 to the docks." },
  { name: "Marietta area Powder Springs", slug: "powder-springs", min: 55, miles: 50, route: "US-278 to I-75, around I-285 to I-85 and I-985", county: "Cobb", hook: "Powder Springs makes a proper day of it — the open lake is worth the cross-metro drive.", display: "Powder Springs" },
  { name: "Mableton", slug: "mableton", min: 55, miles: 48, route: "I-285 north to GA-400, then GA-20 and I-985", county: "Cobb", hook: "Mableton loops the west side of the Perimeter and up to the lake." },
  { name: "Austell", slug: "austell", min: 55, miles: 50, route: "I-20 to I-285 north, then I-85 and I-985", county: "Cobb", hook: "Austell crosses up the west side for a full lake day." },
  { name: "Woodstock", slug: "woodstock", min: 45, miles: 38, route: "I-575 to GA-20 east toward Cumming, then I-985", county: "Cherokee", hook: "Woodstock cuts across GA-20 and is on the water inside of an hour." },
  { name: "Canton", slug: "canton", min: 45, miles: 40, route: "I-575 to GA-20 east, then I-985", county: "Cherokee", hook: "Canton runs east on GA-20 straight toward the lake." },
  { name: "Holly Springs", slug: "holly-springs", min: 40, miles: 36, route: "I-575 to GA-20 east, then I-985", county: "Cherokee", hook: "Holly Springs is a tidy run across GA-20 to the docks." },
  { name: "Ball Ground", slug: "ball-ground", min: 40, miles: 34, route: "GA-372 to GA-20 east, then I-985", county: "Cherokee", hook: "Ball Ground drops down GA-20 and onto Lanier in good time." },
  { name: "Cartersville", slug: "cartersville", min: 60, miles: 55, route: "I-75 to I-575, GA-20 east, then I-985", county: "Bartow", hook: "Cartersville makes the cross-metro run for a real change of water." },
  { name: "Dallas", slug: "dallas", min: 65, miles: 55, route: "US-278 to I-575, GA-20 east, then I-985", county: "Paulding", hook: "Dallas comes east across the top of the metro for a full lake day." },
  { name: "Douglasville", slug: "douglasville", min: 65, miles: 58, route: "I-20 to I-285 north, GA-400 and I-985", county: "Douglas", hook: "Douglasville makes a day of it — west metro to the open lake." },
  { name: "Villa Rica", slug: "villa-rica", min: 80, miles: 70, route: "I-20 east to I-285 north, GA-400 and I-985", county: "Carroll", hook: "Villa Rica is a longer haul, but a calm captained sail is worth the morning drive." },
  { name: "Newnan", slug: "newnan", min: 80, miles: 72, route: "I-85 north through Atlanta to I-985", county: "Coweta", hook: "Newnan runs the full length of 85 — a proper road-trip-and-sail day." },
  { name: "Peachtree City", slug: "peachtree-city", min: 75, miles: 65, route: "I-85 north through Atlanta to I-985", county: "Fayette", hook: "Trade the golf carts for a tiller — Peachtree City makes a great day-trip sail." },
  { name: "Stockbridge", slug: "stockbridge", min: 55, miles: 50, route: "I-675 to I-285, I-85 north, then I-985", county: "Henry", hook: "Stockbridge swings up the east side of the Perimeter to the lake." },
  { name: "McDonough", slug: "mcdonough", min: 60, miles: 55, route: "I-75 to I-675, I-285, I-85 and I-985", county: "Henry", hook: "McDonough heads north for the day to reach open water." },
  { name: "Covington", slug: "covington", min: 50, miles: 45, route: "GA-11/US-278 north to I-985 via Gainesville", county: "Newton", hook: "Covington takes the quiet country way north to the lake." },
  { name: "Loganville", slug: "loganville", min: 40, miles: 35, route: "GA-20 north through Lawrenceville to I-985", county: "Walton", hook: "Loganville rides GA-20 up through Gwinnett to the docks." },
  { name: "East Point", slug: "east-point", min: 55, miles: 48, route: "I-85 north through Atlanta to I-985", county: "Fulton", hook: "East Point runs straight up 85 and out of the city to the lake." },
  { name: "South Fulton", slug: "south-fulton", min: 60, miles: 52, route: "I-285 to I-85 north, then I-985", county: "Fulton", hook: "South Fulton loops the Perimeter and up to open water for the day." },
  { name: "Dalton", slug: "dalton", min: 90, miles: 90, route: "I-75 south to I-575, GA-20 east, then I-985", county: "Whitfield", hook: "Dalton is a real day-trip, and the carpet capital trades nicely for a quiet sail." },
  { name: "Blue Ridge", slug: "blue-ridge", min: 90, miles: 80, route: "GA-515 to GA-400 south, then GA-53 toward Gainesville", county: "Fannin", hook: "Come down out of the Blue Ridge mountains and onto the widest water in North Georgia." },
];

// Normalize display name
CITIES.forEach((c) => { c.display = c.display || c.name; });

const HEADER = `  <header class="site-header" id="site-header">
    <div class="header-inner">
      <a href="/" class="header-logo">
        <img src="images/lord-nelson-logo-150.png" alt="Lord Nelson Charters logo" width="48" height="48">
        <span>Lord Nelson Charters</span>
      </a>
      <nav aria-label="Main navigation">
        <ul class="nav-links">
          <li><a href="/">Home</a></li>
          <li><a href="experiences.html">Experiences</a></li>
          <li><a href="pricing.html">Pricing</a></li>
          <li><a href="about.html">About</a></li>
          <li><a href="/sailing-charters-near-atlanta">Locations</a></li>
        </ul>
      </nav>
      <a href="index.html#booking" class="btn btn-gold header-cta">Book Your Sail</a>
      <button class="menu-toggle" id="menu-toggle" aria-label="Open navigation menu" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-label="Mobile navigation">
    <button class="mobile-close" id="mobile-close" aria-label="Close navigation menu">&times;</button>
    <a href="/">Home</a>
    <a href="experiences.html">Experiences</a>
    <a href="pricing.html">Pricing</a>
    <a href="about.html">About</a>
    <a href="/sailing-charters-near-atlanta">Locations</a>
    <a href="index.html#booking" class="btn btn-gold" style="margin-top: 1rem;">Book Your Sail</a>
  </div>`;

const FOOTER = `  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" class="header-logo" style="margin-bottom: 0.5rem;">
            <img src="images/lord-nelson-logo-150.png" alt="Lord Nelson Charters logo" width="44" height="44" style="border-radius: 50%;">
            <span style="color: var(--white); font-family: 'Playfair Display', serif; font-weight: 700;">Lord Nelson Charters</span>
          </a>
          <p>Private sailing charters on Lake Lanier since 2003. Just 40 minutes from Atlanta.</p>
        </div>
        <div>
          <div class="footer-heading">Quick Links</div>
          <ul class="footer-links">
            <li><a href="/">Home</a></li>
            <li><a href="experiences.html">Experiences</a></li>
            <li><a href="pricing.html">Pricing</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="/sailing-charters-near-atlanta">Locations</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-heading">Experiences</div>
          <ul class="footer-links">
            <li><a href="experiences.html">Sunset Cruises</a></li>
            <li><a href="experiences.html">Day Sails</a></li>
            <li><a href="experiences.html">Team Building</a></li>
            <li><a href="experiences.html">Pirate Cruise</a></li>
            <li><a href="experiences.html">Weddings &amp; Events</a></li>
          </ul>
        </div>
        <div>
          <div class="footer-heading">Contact</div>
          <ul class="footer-links">
            <li><a href="tel:${PHONE_RAW}"><i data-lucide="phone" style="width:14px;height:14px;display:inline;vertical-align:-2px;margin-right:6px;"></i>${PHONE}</a></li>
            <li><span style="font-size: var(--text-sm); color: rgba(255,255,255,0.65);">6800 Lights Ferry Rd<br>Flowery Branch, GA 30542</span></li>
            <li><a href="https://www.facebook.com/lordnelsoncharters" target="_blank" rel="noopener noreferrer"><i data-lucide="facebook" style="width:14px;height:14px;display:inline;vertical-align:-2px;margin-right:6px;"></i>Facebook</a></li>
          </ul>
        </div>
      </div>
      <div class="footer-bottom">&copy; 2026 Lord Nelson Charters Ltd. All rights reserved.</div>
    </div>
  </footer>

  <div class="mobile-cta">
    <a href="tel:${PHONE_RAW}" class="cta-call">
      <i data-lucide="phone" style="width:16px;height:16px;display:inline;vertical-align:-2px;margin-right:4px;"></i>
      Call Captain
    </a>
    <a href="pricing.html" class="cta-book">
      <i data-lucide="calendar" style="width:16px;height:16px;display:inline;vertical-align:-2px;margin-right:4px;"></i>
      Book a Sail
    </a>
  </div>

  <script src="https://unpkg.com/lucide@0.344.0/dist/umd/lucide.js"></script>
  <script src="js/main.js"></script>
  <script>lucide.createIcons();</script>`;

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");

function nearbyCities(city) {
  return CITIES
    .filter((c) => c.slug !== city.slug)
    .map((c) => ({ c, d: Math.abs(c.min - city.min) }))
    .sort((a, b) => a.d - b.d || a.c.min - b.c.min)
    .slice(0, 5)
    .map((x) => x.c);
}

function faqs(city) {
  return [
    {
      q: `How long is the drive from ${city.display} to the sailing charter on Lake Lanier?`,
      a: `From ${city.display} to Safe Harbor Aqualand Marina in Flowery Branch it is about ${city.min} minutes, roughly ${city.miles} miles via ${city.route}. There is free parking next to the docks, and it is a short walk down to Dock Q where I keep the boat. Most folks arrive 10 to 15 minutes before their booking.`,
    },
    {
      q: `Do I need any sailing experience to book a charter from ${city.display}?`,
      a: `None at all. Every Lord Nelson charter is captained personally by me, Captain John Rice. You can sit back the whole sail, or after the safety briefing I will hand you the tiller and walk you through reading the wind. Most first-timers end up steering for a good stretch of a half-day.`,
    },
    {
      q: `What kinds of sails can ${city.display} guests book on Lake Lanier?`,
      a: `Half-day and full-day private sails, sunset cruises, corporate team building, hands-on sailing lessons, the kids' pirate cruise, and small weddings and events. See current rates on the pricing page and pick a date that works for you.`,
    },
    {
      q: `What happens if the weather turns on the day of my ${city.display} charter?`,
      a: `I make the weather call, and I make it conservatively. If the forecast for Flowery Branch shows sustained winds over 20 knots, lightning nearby, or a small craft advisory, we reschedule at no charge. I will call or text you the morning of your sail if anything looks borderline and we decide together.`,
    },
  ];
}

function jsonLd(city) {
  const url = `${SITE}/sailing-charter-${city.slug}`;
  const graph = [
    {
      "@type": "Service",
      "@id": `${url}#service`,
      serviceType: "Private sailing charter",
      name: `Sailing Charters near ${city.display}, GA`,
      description: `Private sailing charters on Lake Lanier for ${city.display}, Georgia guests — about ${city.min} minutes from the marina. Sunset cruises, half-day and full-day sails, team building, and lessons with Captain John Rice.`,
      url,
      areaServed: { "@type": "City", name: `${city.display}, Georgia` },
      provider: {
        "@type": "LocalBusiness",
        name: "Lord Nelson Charters",
        telephone: `+1-${PHONE}`,
        priceRange: "$$",
        image: `${SITE}/images/DJI_0312.jpg`,
        address: {
          "@type": "PostalAddress",
          streetAddress: "6800 Lights Ferry Rd, Safe Harbor Aqualand Marina, Dock Q",
          addressLocality: "Flowery Branch",
          addressRegion: "GA",
          postalCode: "30542",
          addressCountry: "US",
        },
      },
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Locations", item: `${SITE}/sailing-charters-near-atlanta` },
        { "@type": "ListItem", position: 3, name: `${city.display}`, item: url },
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs(city).map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  return JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
}

function cityPage(city) {
  const url = `${SITE}/sailing-charter-${city.slug}`;
  const title = `Sailing Charters near ${city.display}, GA | ${city.min} Min to Lake Lanier`;
  const desc = `Private sailing charters on Lake Lanier, about ${city.min} minutes from ${city.display}, GA via ${city.route}. Sunset cruises, half-day sails, team building & lessons with Captain John Rice. ${PHONE}.`;
  const near = nearbyCities(city);
  const faqList = faqs(city);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${esc(title)} — Lord Nelson Charters</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}/images/DJI_0312.jpg">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(desc)}">
  <meta name="twitter:image" content="${SITE}/images/DJI_0312.jpg">
  <link rel="icon" type="image/png" href="images/lord-nelson-logo-150.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="preconnect" href="https://unpkg.com" crossorigin>
  <link rel="stylesheet" href="css/styles.css">
  <script type="application/ld+json">${jsonLd(city)}</script>
</head>
<body>
${HEADER}

  <main id="main-content">

    <!-- MINI HERO -->
    <section class="section-dark" style="min-height: 42vh; display: flex; align-items: center; position: relative; overflow: hidden;">
      <img src="images/lord-nelson-cruise-3-sunset.jpg" alt="Sunset sail on Lake Lanier, about ${city.min} minutes from ${esc(city.display)}, Georgia" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(11,37,69,0.72) 0%, rgba(11,37,69,0.88) 100%); z-index: 1;"></div>
      <div class="container" style="position: relative; z-index: 2; text-align: center; padding-top: 6rem; padding-bottom: 3rem;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 1.25rem;">
          <ol style="list-style: none; display: flex; justify-content: center; flex-wrap: wrap; gap: 0.5rem; font-size: var(--text-sm); color: rgba(255,255,255,0.6);">
            <li><a href="/" style="color: rgba(255,255,255,0.7);">Home</a></li>
            <li style="color: rgba(255,255,255,0.4);">/</li>
            <li><a href="/sailing-charters-near-atlanta" style="color: rgba(255,255,255,0.7);">Locations</a></li>
            <li style="color: rgba(255,255,255,0.4);">/</li>
            <li style="color: var(--gold);">${esc(city.display)}</li>
          </ol>
        </nav>
        <h1 style="font-size: var(--text-h1); color: var(--white); margin-bottom: 1rem;">Sailing Charters near ${esc(city.display)}</h1>
        <p style="font-size: clamp(1.05rem, 1.2vw, 1.25rem); color: rgba(255,255,255,0.85); max-width: 620px; margin: 0 auto;">About ${city.min} minutes from ${esc(city.display)} to Aqualand Marina on Lake Lanier — private sails with Captain John Rice.</p>
        <div class="hero-ctas" style="justify-content:center;margin-top:1.75rem;display:flex;gap:0.75rem;flex-wrap:wrap;">
          <a href="pricing.html" class="btn btn-gold">See pricing &amp; reserve</a>
          <a href="tel:${PHONE_RAW}" class="btn btn-outline">Call Captain John</a>
        </div>
      </div>
    </section>

    <!-- INTRO -->
    <section class="section">
      <div class="container" style="max-width: 820px;">
        <p style="font-size: var(--text-body); margin-bottom: 1.25rem;">If you are looking for a sailing charter near ${esc(city.display)}, the closest open water worth the trip is Lake Lanier. From ${esc(city.display)} it is about ${city.min} minutes to Safe Harbor Aqualand Marina in Flowery Branch — roughly ${city.miles} miles via ${esc(city.route)}. I am Captain John Rice, and I have run Lord Nelson Charters out of the same slip on this lake since around 2003.</p>
        <p style="font-size: var(--text-body); margin-bottom: 1.25rem;">${esc(city.hook)} Every sail is private and captained by me personally — one boat, one captain, no shared decks or rotating crew. You book the boat and the day is yours.</p>
        <p style="font-size: var(--text-body); color: var(--text-muted);">Lake Lanier covers 38,000 acres with more than 690 miles of shoreline, and the afternoon breeze fills in most days from April through October. It is the calm, captained way to spend a day on the water without owning a boat or learning the ropes first.</p>
      </div>
    </section>

    <!-- THE DRIVE -->
    <section class="section section-alt">
      <div class="container" style="max-width: 820px;">
        <h2 style="font-size: var(--text-h2); margin-bottom: 1rem;">The drive from ${esc(city.display)} to Lake Lanier</h2>
        <p style="font-size: var(--text-body); margin-bottom: 1.25rem;">The route is simple: ${esc(city.route)}, exiting toward Friendship Road for Aqualand Marina. Outside of weekday rush hour it runs about ${city.min} minutes from ${esc(city.display)}. The marina has free parking next to the docks, and it is a four-minute walk down to Dock Q, where I will have the boat rigged and ready before you arrive.</p>
        <ul style="list-style:none;padding:0;display:grid;gap:0.75rem;">
          <li style="display:flex;gap:0.6rem;align-items:flex-start;"><i data-lucide="map-pin" style="width:18px;height:18px;color:var(--gold);flex-shrink:0;margin-top:3px;"></i><span><strong>Distance:</strong> about ${city.miles} miles, roughly ${city.min} minutes from ${esc(city.display)}.</span></li>
          <li style="display:flex;gap:0.6rem;align-items:flex-start;"><i data-lucide="navigation" style="width:18px;height:18px;color:var(--gold);flex-shrink:0;margin-top:3px;"></i><span><strong>Route:</strong> ${esc(city.route)} to Friendship Road.</span></li>
          <li style="display:flex;gap:0.6rem;align-items:flex-start;"><i data-lucide="anchor" style="width:18px;height:18px;color:var(--gold);flex-shrink:0;margin-top:3px;"></i><span><strong>Where you meet me:</strong> Dock Q, Safe Harbor Aqualand Marina, 6800 Lights Ferry Rd, Flowery Branch.</span></li>
          <li style="display:flex;gap:0.6rem;align-items:flex-start;"><i data-lucide="car" style="width:18px;height:18px;color:var(--gold);flex-shrink:0;margin-top:3px;"></i><span><strong>Parking:</strong> free, adjacent to the docks.</span></li>
        </ul>
      </div>
    </section>

    <!-- EXPERIENCES -->
    <section class="section">
      <div class="container">
        <h2 style="font-size: var(--text-h2); margin-bottom: 0.5rem; text-align:center;">Sails ${esc(city.display)} guests book most</h2>
        <p style="text-align:center;color:var(--text-muted);max-width:640px;margin:0 auto 2.5rem;">Pick the day that fits you. Full rates are on the <a href="pricing.html" style="color:var(--ocean);">pricing page</a>.</p>
        <div class="gallery-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:1.25rem;">
          ${[
            ["sunset", "Sunset cruises", "A 2.5 to 3 hour evening sail that pushes off about 90 minutes before sunset — the most-booked trip on the lake."],
            ["users", "Corporate team building", "Get the team off-site and onto the water. Half and full-day options with room for groups."],
            ["compass", "Half &amp; full-day sails", "Three to four hours, or a full six to eight with time to anchor, swim, and explore quiet coves."],
            ["graduation-cap", "Sailing lessons", "Hands-on time at the tiller — tacking, jibing, and reading the wind, taught the plain way."],
            ["flag", "Kids' pirate cruise", "A playful trip the little ones remember. Treasure, tales, and an easy ride on calm water."],
            ["heart", "Weddings &amp; events", "Small ceremonies, proposals, and anniversaries out on the open lake."],
          ].map(([icon, h, p]) => `<div class="card" style="padding:1.5rem;border:1px solid var(--border);border-radius:var(--radius-lg);background:var(--white);">
            <i data-lucide="${icon}" style="width:26px;height:26px;color:var(--gold);margin-bottom:0.75rem;"></i>
            <h3 style="font-size:var(--text-h4);margin-bottom:0.5rem;">${h}</h3>
            <p style="color:var(--text-muted);font-size:0.95rem;">${p}</p>
          </div>`).join("\n          ")}
        </div>
      </div>
    </section>

    <!-- WHAT TO EXPECT -->
    <section class="section section-alt">
      <div class="container" style="max-width: 820px;">
        <h2 style="font-size: var(--text-h2); margin-bottom: 1rem;">What to expect aboard</h2>
        <p style="font-size: var(--text-body); margin-bottom: 1.25rem;">It is a single-captain, single-boat private operation. There is no rotating staff and no shared boat. I run a comfortable sailing yacht set up for day cruising — sit forward on the bow, stretch out in the cockpit, or take the helm yourself once we are clear of the dock. Bottled water and ice are aboard; you are welcome to bring your own food and drinks for a longer trip.</p>
        <p style="font-size: var(--text-body); color: var(--text-muted);">Every passenger has a Coast Guard-approved life jacket aboard, and kids 13 and under wear theirs the whole trip per Georgia law. I keep the calendar light on purpose — one or two charters a day — so the day belongs to you, not to a schedule.</p>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section">
      <div class="container" style="max-width: 800px;">
        <h2 style="font-size: var(--text-h2); margin-bottom: 1.75rem; text-align:center;">${esc(city.display)} sailing questions</h2>
        <div class="faq-list">
          ${faqList.map((f) => `<details class="faq-item" style="border-bottom:1px solid var(--border);padding:1.1rem 0;">
            <summary style="font-weight:600;cursor:pointer;font-size:1.05rem;list-style:none;">${esc(f.q)}</summary>
            <p style="margin-top:0.75rem;color:var(--text-muted);">${esc(f.a)}</p>
          </details>`).join("\n          ")}
        </div>
      </div>
    </section>

    <!-- CTA BAND -->
    <section class="section section-dark" style="text-align:center;">
      <div class="container" style="max-width: 700px;">
        <h2 style="font-size: var(--text-h2); color: var(--white); margin-bottom: 1rem;">Reserve your Lake Lanier sail</h2>
        <p style="color: rgba(255,255,255,0.85); margin-bottom: 1.75rem;">Captain John runs every charter himself out of Aqualand Marina, Dock Q — about ${city.min} minutes from ${esc(city.display)}. Half-day, full-day, sunset, and corporate sails.</p>
        <div style="display:flex;gap:0.75rem;justify-content:center;flex-wrap:wrap;">
          <a href="pricing.html" class="btn btn-gold">See pricing &amp; reserve a sail</a>
          <a href="tel:${PHONE_RAW}" class="btn btn-outline">Call ${PHONE}</a>
        </div>
      </div>
    </section>

    <!-- NEARBY -->
    <section class="section">
      <div class="container" style="max-width: 900px;">
        <h2 style="font-size: var(--text-h3); margin-bottom: 1.25rem;">Sailing charters near other ${'metro Atlanta'} towns</h2>
        <div style="display:flex;flex-wrap:wrap;gap:0.6rem;">
          ${near.map((n) => `<a href="/sailing-charter-${n.slug}" style="display:inline-block;padding:0.5rem 1rem;border:1px solid var(--border);border-radius:var(--radius-full);font-size:0.9rem;color:var(--ocean);text-decoration:none;">${esc(n.display)} &middot; ${n.min} min</a>`).join("\n          ")}
          <a href="/sailing-charters-near-atlanta" style="display:inline-block;padding:0.5rem 1rem;border:1px solid var(--gold);border-radius:var(--radius-full);font-size:0.9rem;color:var(--gold);text-decoration:none;">All locations &rarr;</a>
        </div>
      </div>
    </section>

  </main>

${FOOTER}
</body>
</html>
`;
}

function hubPage() {
  const url = `${SITE}/sailing-charters-near-atlanta`;
  const title = "Sailing Charters near Atlanta — Lake Lanier Locations We Serve";
  const desc = `Lord Nelson Charters runs private sailing trips on Lake Lanier for guests across metro Atlanta and North Georgia. Find drive times and routes from your city. ${PHONE}.`;
  const sorted = [...CITIES].sort((a, b) => a.min - b.min);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
  <title>${esc(title)} — Lord Nelson Charters</title>
  <meta name="description" content="${esc(desc)}">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(desc)}">
  <meta property="og:image" content="${SITE}/images/DJI_0312.jpg">
  <meta property="og:url" content="${url}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="images/lord-nelson-logo-150.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;600;700;800&family=DM+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/styles.css">
  <script type="application/ld+json">${JSON.stringify({
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
        { "@type": "ListItem", position: 2, name: "Locations", item: url },
      ]},
      { "@type": "ItemList", itemListElement: sorted.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: `Sailing charters near ${c.display}`, url: `${SITE}/sailing-charter-${c.slug}` })) },
    ],
  })}</script>
</head>
<body>
${HEADER}

  <main id="main-content">
    <section class="section-dark" style="min-height: 40vh; display: flex; align-items: center; position: relative; overflow: hidden;">
      <img src="images/DJI_0312.jpg" alt="Aerial view of a sailboat on Lake Lanier near Atlanta" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; z-index: 0;">
      <div style="position: absolute; inset: 0; background: linear-gradient(180deg, rgba(11,37,69,0.7) 0%, rgba(11,37,69,0.88) 100%); z-index: 1;"></div>
      <div class="container" style="position: relative; z-index: 2; text-align: center; padding-top: 6rem; padding-bottom: 3rem;">
        <nav aria-label="Breadcrumb" style="margin-bottom: 1.25rem;">
          <ol style="list-style: none; display: flex; justify-content: center; gap: 0.5rem; font-size: var(--text-sm); color: rgba(255,255,255,0.6);">
            <li><a href="/" style="color: rgba(255,255,255,0.7);">Home</a></li>
            <li style="color: rgba(255,255,255,0.4);">/</li>
            <li style="color: var(--gold);">Locations</li>
          </ol>
        </nav>
        <h1 style="font-size: var(--text-h1); color: var(--white); margin-bottom: 1rem;">Sailing charters near Atlanta</h1>
        <p style="font-size: clamp(1.05rem, 1.2vw, 1.25rem); color: rgba(255,255,255,0.85); max-width: 640px; margin: 0 auto;">Lake Lanier is the closest open water for most of metro Atlanta and North Georgia. Find the drive time from your town below.</p>
      </div>
    </section>

    <section class="section">
      <div class="container" style="max-width: 900px;">
        <p style="font-size: var(--text-body); margin-bottom: 2rem; color: var(--text-muted);">Every sail leaves from Safe Harbor Aqualand Marina, Dock Q, in Flowery Branch. Pick your town for the route, drive time, and what to expect — or just <a href="pricing.html" style="color:var(--ocean);">see pricing and reserve a date</a>.</p>
        <div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:0.75rem;">
          ${sorted.map((c) => `<a href="/sailing-charter-${c.slug}" style="display:flex;justify-content:space-between;align-items:center;gap:0.5rem;padding:0.85rem 1.1rem;border:1px solid var(--border);border-radius:var(--radius-md);text-decoration:none;color:var(--text);background:var(--white);">
            <span style="font-weight:600;">${esc(c.display)}</span>
            <span style="font-size:0.85rem;color:var(--text-muted);white-space:nowrap;">${c.min} min</span>
          </a>`).join("\n          ")}
        </div>
      </div>
    </section>
  </main>

${FOOTER}
</body>
</html>
`;
}

// --- Write files
const root = __dirname;
let count = 0;
for (const city of CITIES) {
  fs.writeFileSync(path.join(root, `sailing-charter-${city.slug}.html`), cityPage(city));
  count++;
}
fs.writeFileSync(path.join(root, "sailing-charters-near-atlanta.html"), hubPage());

// --- Rebuild sitemap.xml (existing pages + blog + locations)
const blogSlugs = fs.readdirSync(path.join(root, "blog")).filter((f) => f.endsWith(".html")).map((f) => f.replace(/\.html$/, ""));
const urls = [
  { loc: `${SITE}/`, pr: "1.0", cf: "weekly" },
  { loc: `${SITE}/experiences`, pr: "0.9", cf: "monthly" },
  { loc: `${SITE}/pricing`, pr: "0.9", cf: "monthly" },
  { loc: `${SITE}/about`, pr: "0.7", cf: "monthly" },
  { loc: `${SITE}/contact`, pr: "0.7", cf: "monthly" },
  { loc: `${SITE}/sailing-charters-near-atlanta`, pr: "0.8", cf: "monthly" },
  ...CITIES.map((c) => ({ loc: `${SITE}/sailing-charter-${c.slug}`, pr: "0.7", cf: "monthly" })),
  ...blogSlugs.map((s) => ({ loc: `${SITE}/blog/${s}`, pr: "0.6", cf: "monthly" })),
];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.pr}</priority><changefreq>${u.cf}</changefreq></url>`).join("\n")}
</urlset>
`;
fs.writeFileSync(path.join(root, "sitemap.xml"), sitemap);

console.log(`Generated ${count} city pages + 1 hub page. Sitemap now ${urls.length} URLs.`);
