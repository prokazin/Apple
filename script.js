// script.js
const STORAGE_KEY = 'apple_terracotta_products';
const CATEGORY_KEY = 'apple_terracotta_categories';
let currentCategory = 'Все';
let editingId = null;
let adminLogged = false;
let sortField = 'name';

function getCategories() {
    try { return JSON.parse(localStorage.getItem(CATEGORY_KEY)) || ['Все']; } catch { return ['Все']; }
}
function setCategories(cats) { localStorage.setItem(CATEGORY_KEY, JSON.stringify(cats)); }
function getProducts() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch { return []; }
}
function setProducts(prods) { localStorage.setItem(STORAGE_KEY, JSON.stringify(prods)); }

window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === CATEGORY_KEY) { renderAll(); }
});

function renderCategories() {
    const container = document.getElementById('categoryTabs');
    const cats = getCategories();
    container.innerHTML = cats.map(c => `<span class="cat-item ${c === currentCategory ? 'active' : ''}" data-cat="${c}">${c}</span>`).join('');
    container.querySelectorAll('.cat-item').forEach(el => {
        el.addEventListener('click', () => {
            currentCategory = el.dataset.cat;
            renderAll();
        });
    });
    const sel = document.getElementById('prodCategory');
    if(sel) {
        const currentVal = sel.value;
        sel.innerHTML = cats.filter(c => c !== 'Все').map(c => `<option value="${c}">${c}</option>`).join('');
        if(currentVal && cats.includes(currentVal)) sel.value = currentVal;
    }
}

function renderProducts() {
    const grid = document.getElementById('productGrid');
    let products = getProducts();
    if (currentCategory !== 'Все') products = products.filter(p => p.category === currentCategory);
    if (products.length === 0) {
        grid.innerHTML = `<div style="grid-column:1/-1; text-align:center; padding:40px 0; color:#7b5f47;">Товары не найдены</div>`;
        return;
    }
    grid.innerHTML = products.map((p, idx) => {
        const tags = p.tags ? p.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        const status = p.status || 'В наличии';
        const inStock = status.toLowerCase().includes('наличии');
        const price = Number(p.price).toLocaleString('ru-RU') + ' ₽';
        const adminBtns = adminLogged ? `
            <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
                <button onclick="event.stopPropagation();editProduct('${p.id}')" class="secondary" style="padding:4px 12px;">✎</button>
                <button onclick="event.stopPropagation();copyProduct('${p.id}')" class="secondary" style="padding:4px 12px;">📋</button>
                <button onclick="event.stopPropagation();deleteProduct('${p.id}')" class="danger" style="padding:4px 12px;">🗑️</button>
            </div>` : '';
        return `<div class="card" style="animation-delay:${idx*0.03}s" onclick="openModal('${p.id}')">
            <img src="${p.images?.[0] || 'https://via.placeholder.com/200/dccfc0/5a3f2b?text=🍎'}" alt="${p.name}">
            <div class="product-title">${p.name}</div>
            <div class="price">${price}</div>
            <div class="desc">${p.desc || ''}</div>
            <div class="meta-row">
                ${tags.map(t => `<span class="tag ${t.toLowerCase()}">${t}</span>`).join('')}
                <span class="status-badge ${inStock ? '' : 'out'}">${status}</span>
            </div>
            ${adminBtns}
        </div>`;
    }).join('');
}

function renderAdminUI() {
    if (!adminLogged) return;
    const list = document.getElementById('categoryList');
    const cats = getCategories();
    list.innerHTML = cats.filter(c => c !== 'Все').map(c => 
        `<div style="display:flex;gap:8px;align-items:center;margin:4px 0;"><span>${c}</span> <button class="secondary" onclick="deleteCategory('${c}')">🗑️</button></div>`
    ).join('');
    const sel = document.getElementById('prodCategory');
    if(sel) {
        const currentVal = sel.value;
        sel.innerHTML = cats.filter(c => c !== 'Все').map(c => `<option value="${c}">${c}</option>`).join('');
        if(currentVal && cats.includes(currentVal)) sel.value = currentVal;
    }
}

function updateStats() {
    if (!adminLogged) return;
    const products = getProducts();
    const cats = getCategories();
    const total = products.length;
    const byCat = cats.filter(c => c !== 'Все').map(c => ({c, count: products.filter(p => p.category === c).length}));
    document.getElementById('statsDisplay').innerHTML = `<span>📦 Всего: ${total}</span>` + byCat.map(b => `<span>${b.c}: ${b.count}</span>`).join('');
}

function renderAll() {
    renderCategories();
    renderProducts();
    renderAdminUI();
    updateStats();
}

// --- АДМИНКА ---
function adminLogin() {
    const pass = document.getElementById('adminPass').value;
    if (pass === 'apple2026') {
        adminLogged = true;
        document.getElementById('loginArea').classList.add('hidden');
        document.getElementById('adminContent').classList.remove('hidden');
        renderAll();
    } else alert('Неверный пароль');
}

// --- КАТЕГОРИИ ---
function addCategory() {
    const input = document.getElementById('newCategory');
    const name = input.value.trim();
    if (!name) return alert('Введите название');
    const cats = getCategories();
    if (cats.includes(name)) return alert('Уже существует');
    cats.push(name);
    setCategories(cats);
    input.value = '';
    renderAll();
}
function deleteCategory(name) {
    const products = getProducts();
    if (products.some(p => p.category === name)) return alert('Нельзя удалить: есть товары в этой категории');
    let cats = getCategories();
    cats = cats.filter(c => c !== name);
    setCategories(cats);
    if (currentCategory === name) currentCategory = 'Все';
    renderAll();
}

// --- ТОВАРЫ ---
function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }

function addProduct() {
    const name = document.getElementById('prodName').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value);
    const category = document.getElementById('prodCategory').value;
    const desc = document.getElementById('prodDesc').value.trim();
    const tags = document.getElementById('prodTags').value.trim();
    const status = document.getElementById('prodStatus').value.trim() || 'В наличии';
    const images = document.getElementById('prodImages').value.split(',').map(s=>s.trim()).filter(Boolean);
    if (!name || isNaN(price) || !category) return alert('Заполните название, цену и категорию');

    const charFields = document.querySelectorAll('.char-field');
    const chars = {};
    charFields.forEach(el => {
        const key = el.querySelector('.char-key')?.value?.trim();
        const val = el.querySelector('.char-val')?.value?.trim();
        if (key && val) chars[key] = val;
    });

    const products = getProducts();
    if (editingId) {
        const idx = products.findIndex(p => p.id === editingId);
        if (idx !== -1) {
            products[idx] = { ...products[idx], name, price, category, desc, tags, status, images, chars };
            editingId = null;
            document.querySelector('button[onclick="addProduct()"]').textContent = 'Сохранить товар';
        }
    } else {
        const newProduct = { id: generateId(), name, price, category, desc, tags, status, images, chars };
        products.push(newProduct);
    }
    setProducts(products);
    clearForm();
    renderAll();
}

function deleteProduct(id) {
    if (!confirm('Удалить товар?')) return;
    let products = getProducts();
    products = products.filter(p => p.id !== id);
    setProducts(products);
    renderAll();
}
function copyProduct(id) {
    const products = getProducts();
    const orig = products.find(p => p.id === id);
    if (!orig) return;
    const copy = { ...orig, id: generateId(), name: orig.name + ' (копия)' };
    products.push(copy);
    setProducts(products);
    renderAll();
}
function editProduct(id) {
    const products = getProducts();
    const p = products.find(p => p.id === id);
    if (!p) return;
    editingId = id;
    document.getElementById('prodName').value = p.name || '';
    document.getElementById('prodPrice').value = p.price || '';
    document.getElementById('prodCategory').value = p.category || '';
    document.getElementById('prodDesc').value = p.desc || '';
    document.getElementById('prodTags').value = p.tags || '';
    document.getElementById('prodStatus').value = p.status || '';
    document.getElementById('prodImages').value = (p.images || []).join(', ');
    document.getElementById('charList').innerHTML = '';
    if (p.chars) {
        Object.entries(p.chars).forEach(([k,v]) => addCharField(k, v));
    }
    document.querySelector('button[onclick="addProduct()"]').textContent = 'Обновить товар';
    window.scrollTo({top:0, behavior:'smooth'});
}

function clearForm() {
    document.getElementById('prodName').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodDesc').value = '';
    document.getElementById('prodTags').value = '';
    document.getElementById('prodStatus').value = '';
    document.getElementById('prodImages').value = '';
    document.getElementById('charList').innerHTML = '';
    editingId = null;
    document.querySelector('button[onclick="addProduct()"]').textContent = 'Сохранить товар';
}

function clearAllProducts() {
    if (!confirm('Удалить все товары?')) return;
    setProducts([]);
    renderAll();
}

function addCharField(keyVal, valVal) {
    const container = document.getElementById('charList');
    const div = document.createElement('div');
    div.className = 'char-field';
    div.style.display = 'flex';
    div.style.gap = '6px';
    div.style.margin = '4px 0';
    div.innerHTML = `
        <input class="char-key" placeholder="Ключ" value="${keyVal || ''}" style="flex:1;">
        <input class="char-val" placeholder="Значение" value="${valVal || ''}" style="flex:2;">
        <button onclick="this.parentElement.remove()" class="secondary" style="padding:4px 12px;">✕</button>
    `;
    container.appendChild(div);
}

// --- МОДАЛКА ---
function openModal(id) {
    const products = getProducts();
    const p = products.find(p => p.id === id);
    if (!p) return;
    const modal = document.getElementById('modalOverlay');
    const body = document.getElementById('modalBody');
    const price = Number(p.price).toLocaleString('ru-RU') + ' ₽';
    const tags = p.tags ? p.tags.split(',').map(t=>t.trim()).filter(Boolean) : [];
    const status = p.status || 'В наличии';
    const inStock = status.toLowerCase().includes('наличии');
    const images = p.images && p.images.length ? p.images : ['https://via.placeholder.com/200/dccfc0/5a3f2b?text=🍎'];
    const charsHtml = p.chars ? Object.entries(p.chars).map(([k,v]) => `<p><span>${k}</span><span>${v}</span></p>`).join('') : '';

    body.innerHTML = `
        <div class="modal-gallery">${images.map(img => `<img src="${img}" alt="фото">`).join('')}</div>
        <div class="modal-title">${p.name}</div>
        <div class="modal-price">${price}</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin:4px 0;">
            ${tags.map(t => `<span class="tag ${t.toLowerCase()}">${t}</span>`).join('')}
            <span class="status-badge ${inStock ? '' : 'out'}">${status}</span>
        </div>
        <div class="modal-desc">${p.desc || ''}</div>
        ${charsHtml ? `<div class="modal-chars">${charsHtml}</div>` : ''}
    `;
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}

function closeModal(e) {
    if (e && e.target !== e.currentTarget && e.target.id !== 'modalOverlay') return;
    document.getElementById('modalOverlay').classList.add('hidden');
    document.body.style.overflow = '';
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(e); });

// --- СОРТИРОВКА, ПОИСК, ЭКСПОРТ/ИМПОРТ ---
function sortProducts(field) {
    sortField = field;
    let products = getProducts();
    products.sort((a,b) => {
        if (field === 'price') return (a.price||0) - (b.price||0);
        if (field === 'category') return (a.category||'').localeCompare(b.category||'');
        return (a.name||'').localeCompare(b.name||'');
    });
    setProducts(products);
    renderAll();
}

document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('searchInput')?.addEventListener('input', function() {
        const q = this.value.toLowerCase();
        const grid = document.getElementById('productGrid');
        const cards = grid.querySelectorAll('.card');
        cards.forEach(card => {
            const title = card.querySelector('.product-title')?.textContent?.toLowerCase() || '';
            card.style.display = title.includes(q) ? '' : 'none';
        });
    });
});

function exportJSON() {
    const data = { products: getProducts(), categories: getCategories() };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'apple_terracotta_backup.json';
    a.click();
}
function importJSON(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
        try {
            const data = JSON.parse(ev.target.result);
            if (data.products) setProducts(data.products);
            if (data.categories) setCategories(data.categories);
            renderAll();
        } catch (err) { alert('Ошибка импорта'); }
    };
    reader.readAsText(file);
    e.target.value = '';
}

// --- ИНИЦИАЛИЗАЦИЯ СТАРТОВЫХ ДАННЫХ ---
if (!localStorage.getItem(STORAGE_KEY)) {
    const initial = [
        { id: '1', name: 'iPhone 16 Pro', price: 129990, category: 'iPhone', desc: 'Титан, A18 Pro, 256 ГБ', tags: 'Новинка, Премиум', status: 'В наличии', images: ['https://via.placeholder.com/200/b48b6e/ffffff?text=iPhone'], chars: { Экран: '6.3"', Чип: 'A18 Pro' } },
        { id: '2', name: 'MacBook Air M3', price: 159990, category: 'Mac', desc: '13" Liquid Retina, 16 ГБ', tags: 'Хит', status: 'В наличии', images: ['https://via.placeholder.com/200/b48b6e/ffffff?text=Mac'], chars: { Процессор: 'M3', Память: '16 ГБ' } },
        { id: '3', name: 'AirPods Pro 2', price: 24990, category: 'Аксессуары', desc: 'Шумоподавление, USB-C', tags: 'Хит, Новинка', status: 'В наличии', images: ['https://via.placeholder.com/200/b48b6e/ffffff?text=AirPods'], chars: { Чип: 'H2' } },
        { id: '4', name: 'Apple Watch S9', price: 41990, category: 'Watch', desc: 'GPS, Always-On', tags: 'Премиум', status: 'Нет в наличии', images: ['https://via.placeholder.com/200/b48b6e/ffffff?text=Watch'], chars: { Экран: 'Always-On' } }
    ];
    setProducts(initial);
}
if (!localStorage.getItem(CATEGORY_KEY)) {
    setCategories(['Все', 'iPhone', 'Mac', 'Watch', 'Аксессуары']);
}

renderAll();
