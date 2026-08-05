// ============================================
// SWARAM — lightweight EN / தமிழ் toggle
// 1. Add data-i18n="key" to any text element.
// 2. Include this file after the page scripts.
// 3. Add data-i18n-lang to any button to toggle.
// Choice is remembered in localStorage.
// ============================================
(function () {
  const DICT = {
    home:        { en: 'Home',                 ta: 'முகப்பு' },
    ourOils:     { en: 'Our Oils',             ta: 'எண்ணெய்கள்' },
    chekku:      { en: 'The Chekku Method',    ta: 'செக்கு முறை' },
    shop:        { en: 'Shop',                 ta: 'கடை' },
    login:       { en: 'Login',                ta: 'உள்நுழை' },
    account:     { en: 'My Account',           ta: 'எனது கணக்கு' },
    cart:        { en: 'Cart',                 ta: 'வண்டி' },
    addToCart:   { en: 'Add to Cart',          ta: 'வண்டியில் சேர்க்க' },
    heroH1a:     { en: 'Cooking Oil',          ta: 'சமையல் எண்ணெய்' },
    heroH1b:     { en: 'in Cold-Pressed',      ta: 'குளிர்-அழுத்தத்தில்' },
    heroH1c:     { en: 'Purity',               ta: 'தூய்மை' },
    rangeTitle:  { en: 'Three oils, one method', ta: 'மூன்று எண்ணெய், ஒரு முறை' },
    storyLabel:  { en: 'Cold-pressed, wood chekku method', ta: 'குளிர் அழுத்தப்பட்ட, மர செக்கு முறை' }
  };

  const key = 'swaram_lang';
  let lang = localStorage.getItem(key) || 'en';

  function text(k) {
    const d = DICT[k];
    return d ? (d[lang] || d.en) : '';
  }

  function apply() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const t = text(el.dataset.i18n);
      if (t) el.textContent = t;
    });
    document.querySelectorAll('[data-i18n-lang]').forEach(btn => {
      btn.textContent = lang === 'ta' ? 'English' : 'தமிழ்';
    });
  }

  function set(l) {
    lang = l;
    localStorage.setItem(key, l);
    apply();
  }

  document.addEventListener('click', (e) => {
    const t = e.target.closest('[data-i18n-lang]');
    if (t) set(lang === 'ta' ? 'en' : 'ta');
  });

  window.swaramLanguage = { set: set, get: () => lang };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
})();