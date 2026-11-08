/* ===== TastyBites: configuration, menu data, search and filtering ===== */

// Edit these values for a real restaurant.
const CONFIG = {
  name: 'TastyBites',
  whatsapp: '260970000000',            // international format, no + or spaces
  openHour: 8, closeHour: 22,          // 24h clock, Africa/Lusaka time
  zones: ['Lusaka Central', 'Ibex Hill', 'Kabulonga', 'Chilenje', 'Woodlands', 'Olympia', 'Chelstone']
};

const fmt = n => 'K' + n.toLocaleString('en-US');
const refreshIcons = () => window.lucide && lucide.createIcons();
const photo = (id, w = 700) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=75`;

const CATEGORIES = [
  { id: 'burgers', name: 'Burgers', img: photo('1568901346375-23c9450c58cd', 400) },
  { id: 'pizzas',  name: 'Pizzas',  img: photo('1513104890138-7c749659a591', 400) },
  { id: 'grills',  name: 'Grills',  img: photo('1598103442097-8b74394b95c6', 400) },
  { id: 'sides',   name: 'Sides',   img: photo('1573080496219-bb080dd4f877', 400) },
  { id: 'drinks',  name: 'Drinks',  img: photo('1621506289937-a8e4df240d0b', 400) }
];

// Sample products. Change names, prices and images here.
const MENU = [
  { id: 'beef-burger',   cat: 'burgers', name: 'Classic Beef Burger',  price: 85,  desc: 'Beef patty, lettuce, tomato and house sauce.',   img: photo('1550547660-d9450f859349') },
  { id: 'cheese-burger', cat: 'burgers', name: 'Double Cheese Burger', price: 110, desc: 'Two patties, melted cheddar, pickles.',          img: photo('1568901346375-23c9450c58cd') },
  { id: 'chicken-pizza', cat: 'pizzas',  name: 'Chicken Pizza',        price: 150, desc: 'Roast chicken, peppers and mozzarella.',         img: photo('1513104890138-7c749659a591') },
  { id: 'bbq-pizza',     cat: 'pizzas',  name: 'BBQ Chicken Pizza',    price: 170, desc: 'Smoky BBQ sauce, chicken, red onion.',           img: photo('1565299624946-b28f40a0ae38') },
  { id: 'grilled-chicken', cat: 'grills', name: 'Grilled Chicken',     price: 120, desc: 'Flame-grilled quarter chicken with rice.',       img: photo('1598103442097-8b74394b95c6') },
  { id: 'wings',         cat: 'grills',  name: 'Chicken Wings',        price: 95,  desc: 'Crispy wings tossed in spicy glaze.',            img: photo('1608039755401-742074f0548d') },
  { id: 'fries',         cat: 'sides',   name: 'French Fries',         price: 35,  desc: 'Golden, crisp and lightly salted.',              img: photo('1573080496219-bb080dd4f877') },
  { id: 'orange-juice',  cat: 'drinks',  name: 'Fresh Orange Juice',   price: 30,  desc: 'Squeezed to order, served cold.',                img: photo('1621506289937-a8e4df240d0b') }
];

const menuState = { cat: null, query: '' };

function renderCategories() {
  document.getElementById('categoryGrid').innerHTML = CATEGORIES.map(c => `
    <button class="cat-card" data-cat="${c.id}" aria-pressed="${menuState.cat === c.id}">
      <img src="${c.img}" alt="" loading="lazy"><span>${c.name}</span>
    </button>`).join('');
}

function renderMenu() {
  const q = menuState.query.trim().toLowerCase();
  const list = MENU.filter(m => (!menuState.cat || m.cat === menuState.cat) &&
    (!q || (m.name + ' ' + m.desc).toLowerCase().includes(q)));
  const catName = CATEGORIES.find(c => c.id === menuState.cat)?.name;
  document.getElementById('menuStatus').textContent =
    `Showing ${list.length} ${catName ? catName.toLowerCase() : 'meals'}` + (q ? ` matching “${menuState.query.trim()}”` : '');
  document.getElementById('menuGrid').innerHTML = list.length ? list.map(m => `
    <article class="food-card">
      <img src="${m.img}" alt="${m.name}" loading="lazy">
      <div class="food-body">
        <h3>${m.name}</h3><p class="muted">${m.desc}</p>
        <div class="food-foot"><strong>${fmt(m.price)}</strong>
          <button class="btn btn-primary btn-sm" data-add="${m.id}"><i data-lucide="plus"></i> Add to Cart</button></div>
      </div>
    </article>`).join('') :
    `<div class="empty"><p>No meals match your search.</p><button class="btn btn-outline" id="resetMenu">Show all meals</button></div>`;
  refreshIcons();
}

function resetMenuFilters() {
  menuState.cat = null; menuState.query = '';
  document.getElementById('menuSearch').value = '';
  renderCategories(); renderMenu();
}

document.addEventListener('DOMContentLoaded', () => {
  renderCategories(); renderMenu();
  document.getElementById('categoryGrid').addEventListener('click', e => {
    const btn = e.target.closest('[data-cat]'); if (!btn) return;
    menuState.cat = menuState.cat === btn.dataset.cat ? null : btn.dataset.cat; // click again to clear
    renderCategories(); renderMenu();
    document.getElementById('menuGrid').scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });
  document.getElementById('menuSearch').addEventListener('input', e => { menuState.query = e.target.value; renderMenu(); });
  document.getElementById('viewFullMenu').addEventListener('click', () => {
    resetMenuFilters(); document.getElementById('menuGrid').scrollIntoView({ behavior: 'smooth' });
  });
  document.getElementById('menuGrid').addEventListener('click', e => { if (e.target.closest('#resetMenu')) resetMenuFilters(); });
});
