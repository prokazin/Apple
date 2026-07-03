let products = [];
let categories = [];
let currentFilter = 'all';
let currentProduct = null;
let currentImageIndex = 0;

function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' ₽';
}

function loadCategories() {
    const stored = localStorage.getItem('shopCategories');
    if (stored) {
        try {
            categories = JSON.parse(stored);
        } catch (e) {
            categories = ['iPhone', 'Mac', 'Watch', 'Аксессуары'];
        }
    } else {
        categories = ['iPhone', 'Mac', 'Watch', 'Аксессуары'];
        localStorage.setItem('shopCategories', JSON.stringify(categories));
    }
    renderCategories();
}

function renderCategories() {
    const container = document.getElementById('categoriesContainer');
    if (!container) return;
    
    const categoryNames = {
        'all': 'Все',
        'iPhone': 'iPhone',
        'Mac': 'Mac',
        'Watch': 'Watch',
        'Аксессуары': 'Аксессуары'
    };
    
    let html = `<button class="filter-chip active" data-cat="all">Все</button>`;
    
    for (const cat of categories) {
        const label = categoryNames[cat] || cat.charAt(0).toUpperCase() + cat.slice(1);
        html += `<button class="filter-chip" data-cat="${cat}">${label}</button>`;
    }
    
    container.innerHTML = html;
    
    document.querySelectorAll('.filter-chip').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-chip').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.cat;
            
            const filtered = currentFilter === 'all' 
                ? products 
                : products.filter(p => p.category === currentFilter);
            
            renderProducts(filtered, true);
        });
    });
}

function loadProducts() {
    const stored = localStorage.getItem('shopProducts');
    if (stored) {
        try {
            products = JSON.parse(stored);
            products = products.map(p => ({
                ...p,
                images: p.images || [p.img || 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'],
                specs: p.specs || {},
                tags: p.tags || [],
                inStock: p.inStock !== undefined ? p.inStock : true
            }));
        } catch (e) {
            products = getDefaultProducts();
        }
    } else {
        products = getDefaultProducts();
    }
    renderProducts(products, true);
}

function getDefaultProducts() {
    const defaults = [
        { 
            id: 1, 
            name: 'iPhone 16 Pro', 
            price: 129990, 
            category: 'iPhone', 
            desc: 'Титан, A18 Pro, 256 ГБ. Новая кнопка управления камерой.', 
            images: ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'],
            inStock: true,
            tags: ['хит', 'новинка'],
            specs: { 'Экран': '6.3" Super Retina XDR', 'Чип': 'A18 Pro', 'Память': '256 ГБ', 'Цвет': 'Натуральный титан' }
        },
        { 
            id: 2, 
            name: 'MacBook Air M3', 
            price: 159990, 
            category: 'Mac', 
            desc: '13" Liquid Retina, 16 ГБ, 512 ГБ. Сверхтонкий и мощный.', 
            images: ['https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?w=800'],
            inStock: true,
            tags: ['хит'],
            specs: { 'Процессор': 'M3', 'Память': '16 ГБ', 'Накопитель': '512 ГБ', 'Цвет': 'Серебристый' }
        },
        { 
            id: 3, 
            name: 'AirPods Pro 2', 
            price: 24990, 
            category: 'Аксессуары', 
            desc: 'Шумоподавление, адаптивный звук, USB-C.', 
            images: ['https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=800'],
            inStock: true,
            tags: ['новинка'],
            specs: { 'Чип': 'H2', 'Шумоподавление': 'Активное', 'Зарядка': 'USB-C', 'Цвет': 'Белый' }
        },
        { 
            id: 4, 
            name: 'Apple Watch Series 9', 
            price: 41990, 
            category: 'Watch', 
            desc: 'GPS, Always-On дисплей, новый жест двойного касания.', 
            images: ['https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800'],
            inStock: false,
            tags: ['премиум'],
            specs: { 'Дисплей': 'Always-On', 'GPS': 'Да', 'Цвет': 'Полуночный', 'Материал': 'Алюминий' }
        }
    ];
    localStorage.setItem('shopProducts', JSON.stringify(defaults));
    return defaults;
}

function renderProducts(items, animate = true) {
    const grid = document.getElementById('productGrid');
    if (!grid) return;
    
    if (!items || items.length === 0) {
        grid.innerHTML = '<p style="text-align:center;color:#7b5f47;padding:40px 0;font-weight:300;">Товары временно отсутствуют</p>';
        return;
    }
    
    if (animate) {
        grid.innerHTML = Array(Math.min(items.length, 6)).fill(0).map(() => `
            <div class="skeleton-row">
                <div class="sk-image"></div>
                <div class="sk-info">
                    <div class="sk-line"></div>
                    <div class="sk-line short"></div>
                    <div class="sk-line tiny"></div>
                </div>
            </div>
        `).join('');
        
        setTimeout(() => {
            renderProducts(items, false);
        }, 300);
        return;
    }
    
    grid.innerHTML = items.map((p, index) => {
        let tagsHtml = '';
        if (p.tags && p.tags.length > 0) {
            tagsHtml = p.tags.map(tag => {
                const tagClasses = {
                    'хит': 'hit',
                    'новинка': 'new',
                    'премиум': 'premium'
                };
                const cls = tagClasses[tag] || '';
                return `<span class="row-tag ${cls}">${tag}</span>`;
            }).join('');
        }
        
        const stockHtml = p.inStock !== undefined ? `
            <span class="row-stock ${p.inStock ? 'in-stock' : 'out-of-stock'}">
                ${p.inStock ? 'В наличии' : 'Нет в наличии'}
            </span>
        ` : '';
        
        const imgSrc = p.images && p.images.length > 0 ? p.images[0] : 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400';
        
        return `
            <div class="product-row" style="animation-delay: ${(index * 0.04).toFixed(2)}s;" onclick="openProductModal(${p.id})">
                <div class="row-image">
                    <img src="${imgSrc}" alt="${p.name}" onerror="this.src='https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=400'">
                </div>
                <div class="row-info">
                    <div>
                        <div class="row-header">
                            <span class="row-name">${p.name}</span>
                            <span class="row-price">${formatPrice(p.price)}</span>
                        </div>
                        <div class="row-desc">${p.desc || 'Без описания'}</div>
                    </div>
                    <div class="row-meta">
                        <div class="row-tags">${tagsHtml}</div>
                        ${stockHtml}
                        <span class="row-arrow">→</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function openProductModal(id) {
    currentProduct = products.find(p => p.id === id);
    if (!currentProduct) return;
    
    currentImageIndex = 0;
    const modal = document.getElementById('productModal');
    
    document.getElementById('modalName').textContent = currentProduct.name;
    document.getElementById('modalPrice').textContent = formatPrice(currentProduct.price);
    document.getElementById('modalDesc').textContent = currentProduct.desc || 'Без описания';
    
    const specsContainer = document.getElementById('modalSpecs');
    const specs = currentProduct.specs || {};
    const specKeys = Object.keys(specs);
    
    if (specKeys.length > 0) {
        specsContainer.innerHTML = specKeys.map(key => `
            <span class="spec">
                <span class="label">${key}:</span>
                <span class="value">${specs[key]}</span>
            </span>
        `).join('');
        specsContainer.style.display = 'flex';
    } else {
        specsContainer.style.display = 'none';
    }
    
    const tagsContainer = document.getElementById('modalTags');
    if (currentProduct.tags && currentProduct.tags.length > 0) {
        const tagClasses = {
            'хит': 'hit',
            'новинка': 'new',
            'премиум': 'premium'
        };
        tagsContainer.innerHTML = currentProduct.tags.map(tag => {
            const cls = tagClasses[tag] || '';
            return `<span class="modal-tag row-tag ${cls}">${tag}</span>`;
        }).join('');
    } else {
        tagsContainer.innerHTML = '';
    }
    
    const stockContainer = document.getElementById('modalStock');
    if (currentProduct.inStock !== undefined) {
        stockContainer.textContent = currentProduct.inStock ? '● В наличии' : '● Нет в наличии';
        stockContainer.style.color = currentProduct.inStock ? '#5a7a4a' : '#8a5a4a';
        stockContainer.style.display = 'block';
    } else {
        stockContainer.style.display = 'none';
    }
    
    updateModalImage();
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
    document.body.style.overflow = '';
}

function updateModalImage() {
    const images = currentProduct.images || ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'];
    const imgElement = document.getElementById('modalImage');
    imgElement.src = images[currentImageIndex] || images[0];
    imgElement.alt = currentProduct.name;
    
    document.getElementById('modalImageCounter').textContent = `${currentImageIndex + 1} / ${images.length}`;
    
    const nav = document.querySelector('.modal-image-nav');
    if (images.length <= 1) {
        nav.style.display = 'none';
    } else {
        nav.style.display = 'flex';
    }
}

function changeImage(direction) {
    const images = currentProduct.images || ['https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=800'];
    currentImageIndex = (currentImageIndex + direction + images.length) % images.length;
    updateModalImage();
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeProductModal();
    if (e.key === 'ArrowLeft' && document.getElementById('productModal').classList.contains('active')) changeImage(-1);
    if (e.key === 'ArrowRight' && document.getElementById('productModal').classList.contains('active')) changeImage(1);
});

window.addEventListener('storage', (e) => {
    if (e.key === 'shopProducts') {
        try {
            products = JSON.parse(e.newValue);
            const filtered = currentFilter === 'all' 
                ? products 
                : products.filter(p => p.category === currentFilter);
            renderProducts(filtered, true);
        } catch (e) {}
    }
    if (e.key === 'shopCategories') {
        try {
            categories = JSON.parse(e.newValue);
            renderCategories();
            const filtered = currentFilter === 'all' 
                ? products 
                : products.filter(p => p.category === currentFilter);
            renderProducts(filtered, true);
        } catch (e) {}
    }
});

document.addEventListener('DOMContentLoaded', () => {
    loadCategories();
    loadProducts();
});
