/* ===== TastyBites: cart, checkout and WhatsApp ordering ===== */
const CART_KEY = 'tastybites_cart';
let cart = loadCart();

function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } }
function saveCart() { try { localStorage.setItem(CART_KEY, JSON.stringify(cart)); } catch { /* storage blocked */ } }

function cartLines() {
  return Object.entries(cart).map(([id, qty]) => ({ ...MENU.find(m => m.id === id), qty })).filter(l => l.name);
}
const cartTotal = () => cartLines().reduce((s, l) => s + l.price * l.qty, 0);
const cartCount = () => cartLines().reduce((s, l) => s + l.qty, 0);

function addToCart(id) {
  cart[id] = (cart[id] || 0) + 1; saveCart(); renderCart();
  toast(`${MENU.find(m => m.id === id).name} added to cart`);
}
function changeQty(id, delta) {
  cart[id] = (cart[id] || 0) + delta;
  if (cart[id] <= 0) delete cart[id];
  saveCart(); renderCart();
}
function removeItem(id) { delete cart[id]; saveCart(); renderCart(); }
function clearCart() { cart = {}; saveCart(); renderCart(); }

function renderCart() {
  const lines = cartLines();
  document.getElementById('cartCount').textContent = cartCount();
  document.getElementById('cartCount').hidden = cartCount() === 0;
  document.getElementById('cartTotal').textContent = fmt(cartTotal());
  document.getElementById('checkoutBtn').disabled = !lines.length;
  document.getElementById('clearCart').hidden = !lines.length;
  document.getElementById('cartItems').innerHTML = lines.length ? lines.map(l => `
    <div class="cart-line">
      <img src="${l.img}" alt="">
      <div class="cl-info"><b>${l.name}</b><span class="muted">${fmt(l.price)} each</span>
        <div class="qty"><button data-qty="-1" data-id="${l.id}" aria-label="Decrease quantity"><i data-lucide="minus"></i></button>
          <span>${l.qty}</span><button data-qty="1" data-id="${l.id}" aria-label="Increase quantity"><i data-lucide="plus"></i></button></div></div>
      <div class="cl-end"><strong>${fmt(l.price * l.qty)}</strong>
        <button class="icon-btn" data-remove="${l.id}" aria-label="Remove ${l.name}"><i data-lucide="trash-2"></i></button></div>
    </div>`).join('') :
    `<div class="empty"><p>Your cart is empty.</p><button class="btn btn-outline" data-close-cart>Browse the menu</button></div>`;
  refreshIcons();
}

/* ---- Drawer ---- */
function openCart() {
  document.getElementById('cartDrawer').classList.add('open');
  document.getElementById('cartDrawer').setAttribute('aria-hidden', 'false');
  document.getElementById('overlay').classList.add('show');
  document.body.classList.add('lock');
}
function closeCart() {
  document.getElementById('cartDrawer').classList.remove('open');
  document.getElementById('cartDrawer').setAttribute('aria-hidden', 'true');
  document.getElementById('overlay').classList.remove('show');
  document.body.classList.remove('lock');
}

/* ---- Checkout ---- */
function openCheckout() {
  if (!cartLines().length) { toast('Add a meal to your cart first'); return; }
  closeCart();
  document.getElementById('checkoutSummary').innerHTML =
    cartLines().map(l => `<div><span>${l.qty} × ${l.name}</span><span>${fmt(l.price * l.qty)}</span></div>`).join('') +
    `<div class="sum-total"><span>Total</span><span>${fmt(cartTotal())}</span></div>`;
  document.getElementById('checkoutModal').showModal();
}

function validateForm(form, rules) {
  let ok = true;
  Object.entries(rules).forEach(([field, check]) => {
    const input = form.elements[field];
    const msg = check(input.value.trim());
    input.closest('label').querySelector('.error').textContent = msg || '';
    input.classList.toggle('invalid', !!msg);
    if (msg && ok) { input.focus(); ok = false; }
  });
  return ok;
}

function buildWhatsAppMessage(d) {
  const items = cartLines().map(l => `• ${l.qty} x ${l.name} @ ${fmt(l.price)} = ${fmt(l.price * l.qty)}`).join('\n');
  const lines = [`*New order for ${CONFIG.name}*`, '', `Name: ${d.name}`, `Phone: ${d.phone}`, '', '*Items*', items, '',
    `*Total: ${fmt(cartTotal())}*`, '', `Delivery area: ${d.area}`, `Address: ${d.address}`];
  if (d.notes && d.notes.trim()) lines.push(`Notes: ${d.notes.trim()}`);
  lines.push('', 'Payment: please confirm MTN MoMo, Airtel Money or cash.');
  return lines.join('\n');
}
const waLink = text => `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(text)}`;

function orderOnWhatsApp() {
  if (cartLines().length) openCheckout();
  else window.open(waLink(`Hello ${CONFIG.name}, I would like to place an order.`), '_blank', 'noopener');
}

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  document.getElementById('checkoutForm').elements.area.innerHTML =
    '<option value="">Select your area</option>' + CONFIG.zones.map(z => `<option>${z}</option>`).join('');

  document.addEventListener('click', e => {
    const t = e.target;
    if (t.closest('[data-add]')) addToCart(t.closest('[data-add]').dataset.add);
    const q = t.closest('[data-qty]'); if (q) changeQty(q.dataset.id, +q.dataset.qty);
    const r = t.closest('[data-remove]'); if (r) removeItem(r.dataset.remove);
    if (t.closest('[data-close-cart]')) { closeCart(); document.getElementById('menu').scrollIntoView({ behavior: 'smooth' }); }
  });
  document.getElementById('openCart').addEventListener('click', openCart);
  document.getElementById('closeCart').addEventListener('click', closeCart);
  document.getElementById('overlay').addEventListener('click', closeCart);
  document.getElementById('clearCart').addEventListener('click', () => { clearCart(); toast('Cart cleared'); });
  document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
  document.getElementById('bannerWa').addEventListener('click', orderOnWhatsApp);
  document.getElementById('momoOrder').addEventListener('click', () => { document.getElementById('momoModal').close(); orderOnWhatsApp(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCart(); });

  document.getElementById('checkoutForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = e.target;
    const ok = validateForm(f, {
      name: v => v.length < 2 ? 'Enter your name' : '',
      phone: v => /^(\+?260|0)\d{9}$/.test(v.replace(/[\s-]/g, '')) ? '' : 'Enter a valid Zambian number, e.g. 097 000 0000',
      area: v => v ? '' : 'Choose your delivery area',
      address: v => v.length < 5 ? 'Enter your delivery address' : ''
    });
    if (!ok) return;
    const data = Object.fromEntries(new FormData(f).entries());
    window.open(waLink(buildWhatsAppMessage(data)), '_blank', 'noopener');
    document.getElementById('checkoutModal').close();
    toast('WhatsApp is opening. Send the message to place your order.');
  });
});
