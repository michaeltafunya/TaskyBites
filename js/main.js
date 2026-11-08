/* ===== TastyBites: navigation, gallery, delivery, hours, dialogs ===== */
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.timer); toast.timer = setTimeout(() => t.classList.remove('show'), 2800);
}

const GALLERY = [
  ['1550317138-10000687a72b', 'Stacked burger'], ['1565299624946-b28f40a0ae38', 'Wood-fired pizza'],
  ['1555939594-58d7cb561ad1', 'Grilled skewers'], ['1573080496219-bb080dd4f877', 'Fresh fries'],
  ['1621506289937-a8e4df240d0b', 'Orange juice'], ['1414235077428-338989a2e8c0', 'Plated restaurant meal']
];

function initNav() {
  const header = document.getElementById('siteHeader'), links = document.getElementById('navLinks'), toggle = document.getElementById('menuToggle');
  addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open'); toggle.setAttribute('aria-expanded', open);
  });
  links.addEventListener('click', e => { if (e.target.closest('a')) { links.classList.remove('open'); toggle.setAttribute('aria-expanded', false); } });
  const navAnchors = [...links.querySelectorAll('a')];
  const obs = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'menu', 'gallery', 'delivery', 'about', 'contact'].forEach(id => obs.observe(document.getElementById(id)));
}

function initGallery() {
  document.getElementById('galleryGrid').innerHTML = GALLERY.map(([id, cap]) =>
    `<button class="g-item" data-full="${photo(id, 1400)}" data-cap="${cap}"><img src="${photo(id, 600)}" alt="${cap}" loading="lazy"></button>`).join('');
  const lb = document.getElementById('lightbox');
  document.getElementById('galleryGrid').addEventListener('click', e => {
    const b = e.target.closest('.g-item'); if (!b) return;
    document.getElementById('lbImg').src = b.dataset.full; document.getElementById('lbImg').alt = b.dataset.cap;
    document.getElementById('lbCap').textContent = b.dataset.cap; lb.showModal();
  });
  lb.addEventListener('click', e => { if (e.target === lb) lb.close(); });
}

function initDelivery() {
  document.getElementById('zoneList').innerHTML = CONFIG.zones.map(z => `<li><i data-lucide="check-circle-2"></i>${z}</li>`).join('');
  document.getElementById('areaList').innerHTML = CONFIG.zones.map(z => `<option value="${z}">`).join('');
  const modal = document.getElementById('areaModal'), input = document.getElementById('areaInput'), result = document.getElementById('areaResult');
  document.getElementById('checkAreaBtn').addEventListener('click', () => { result.textContent = ''; result.className = 'area-result'; input.value = ''; modal.showModal(); });
  const check = () => {
    const v = input.value.trim().toLowerCase();
    if (!v) { result.textContent = 'Type or choose an area first.'; result.className = 'area-result'; return; }
    const hit = CONFIG.zones.find(z => z.toLowerCase() === v || (v.length > 2 && z.toLowerCase().includes(v)));
    result.className = 'area-result ' + (hit ? 'yes' : 'no');
    result.textContent = hit ? `Good news! We deliver to ${hit}.`
      : 'Sorry, we do not deliver to that area yet. Message us on WhatsApp and we will see what we can do.';
  };
  document.getElementById('areaCheck').addEventListener('click', check);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') check(); });
}

/* Opening hours are evaluated in Lusaka time, whatever the visitor's timezone */
function updateOpenStatus() {
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Africa/Lusaka', hour: 'numeric', minute: 'numeric', hour12: false }).formatToParts(new Date());
  const mins = (+parts.find(p => p.type === 'hour').value % 24) * 60 + +parts.find(p => p.type === 'minute').value;
  const open = mins >= CONFIG.openHour * 60 && mins < CONFIG.closeHour * 60;
  document.getElementById('openStatus').className = 'status ' + (open ? 'open' : 'closed');
  document.getElementById('openText').textContent = open ? 'Open Now' : 'Closed Now';
}

function initContactForm() {
  const form = document.getElementById('contactForm'), note = document.getElementById('contactNote');
  form.addEventListener('submit', e => {
    e.preventDefault();
    const ok = validateForm(form, {
      name: v => v.length < 2 ? 'Enter your name' : '',
      email: v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter a valid email address',
      message: v => v.length < 10 ? 'Write at least 10 characters' : ''
    });
    if (!ok) return;
    note.textContent = 'Thanks! Your message looks good, but this demo site has no server, so it was not sent. Please contact us on WhatsApp or by phone.';
    form.reset();
  });
}

document.addEventListener('DOMContentLoaded', () => {
  initNav(); initGallery(); initDelivery(); initContactForm();
  updateOpenStatus(); setInterval(updateOpenStatus, 60000);
  document.querySelectorAll('[data-wa-chat]').forEach(a => a.href = `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent('Hello TastyBites!')}`);
  document.getElementById('bannerMomo').addEventListener('click', () => document.getElementById('momoModal').showModal());
  document.querySelectorAll('dialog [data-close]').forEach(b => b.addEventListener('click', () => b.closest('dialog').close()));
  document.querySelectorAll('dialog:not(#lightbox)').forEach(d => d.addEventListener('click', e => { if (e.target === d) d.close(); }));
  document.getElementById('year').textContent = new Date().getFullYear();
  refreshIcons();
});

/* If a remote photo fails to load, show a neutral placeholder instead of a broken icon */
document.addEventListener('error', e => {
  const el = e.target;
  if (el.tagName === 'IMG' && !el.dataset.failed) {
    el.dataset.failed = 1;
    el.src = 'data:image/svg+xml;utf8,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="#FFF1E4"/></svg>');
  }
}, true);
