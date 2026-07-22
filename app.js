const PLACEHOLDER = 'images/店舗ロゴ_竜の旅路亭_v3_2.png';

const CATEGORY_LABELS = {
    appetizer: '前菜',
    main:      '食事',
    dessert:   'デザート',
    drink:     'ドリンク',
};
const CATEGORY_CSS = {
    appetizer: 'cat-appetizer',
    main:      'cat-main',
    dessert:   'cat-dessert',
    drink:     'cat-drink',
};

async function loadDishes() {
    const res = await fetch('data/dishes.json');
    if (!res.ok) throw new Error('dishes.json の読み込みに失敗しました');
    return res.json();
}

function categoryBadge(category) {
    if (!category || !CATEGORY_LABELS[category]) return '';
    const label = CATEGORY_LABELS[category];
    const cls   = CATEGORY_CSS[category] || '';
    return `<span class="category-badge ${cls}">${label}</span>`;
}

function createCard(dish, navIndex) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const imgSrc = dish.image || PLACEHOLDER;
    const imgClass = dish.image ? '' : ' class="placeholder-img"';
    card.innerHTML = `
        <img src="${imgSrc}" alt="${dish.name}"${imgClass} onerror="this.onerror=null; this.src='${PLACEHOLDER}'; this.classList.add('placeholder-img')">
        <div class="dish-card-body">
            ${categoryBadge(dish.category)}
            <p class="dish-card-name">${dish.name}</p>
            ${dish.name_sub ? `<p class="dish-card-sub">${dish.name_sub}</p>` : ''}
        </div>
    `;

    card.addEventListener('click', () => openModal(navIndex));
    card.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') openModal(navIndex);
    });
    return card;
}

function renderDescription(el, description) {
    el.innerHTML = '';
    if (!description) return;

    const newlineIdx = description.indexOf('\n');
    if (newlineIdx === -1) {
        el.textContent = description;
        return;
    }

    const front = document.createElement('span');
    front.className = 'desc-explanation';
    front.textContent = description.slice(0, newlineIdx);

    const divider = document.createElement('hr');
    divider.className = 'desc-divider';

    const story = document.createElement('span');
    story.className = 'desc-story';
    story.textContent = description.slice(newlineIdx + 1);

    el.appendChild(front);
    el.appendChild(divider);
    el.appendChild(story);
}

let navOrder = [];
let currentNavIndex = -1;

function openModal(navIndex) {
    const dish = navOrder[navIndex];
    if (!dish) return;
    currentNavIndex = navIndex;

    const modal = document.getElementById('modal');
    const img   = document.getElementById('modal-image');

    img.className = '';
    img.src = dish.image || PLACEHOLDER;
    img.alt = dish.name;
    if (!dish.image) img.classList.add('placeholder-img');
    img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; img.classList.add('placeholder-img'); };

    document.getElementById('modal-category-badge').innerHTML = categoryBadge(dish.category);
    document.getElementById('modal-name').textContent        = dish.name;
    document.getElementById('modal-name-sub').textContent    = dish.name_sub || '';
    document.getElementById('modal-event').textContent       = `第 ${dish.event_number} 回 ご提供`;

    renderDescription(document.getElementById('modal-description'), dish.description || '');

    const tagsEl = document.getElementById('modal-ingredients');
    tagsEl.innerHTML = (dish.ingredients || [])
        .map(i => `<span class="ingredient-tag">${i}</span>`)
        .join('');

    updateModalNav();

    modal.classList.remove('hidden');
    document.getElementById('modal-close').focus();
    document.body.style.overflow = 'hidden';
}

function updateModalNav() {
    const prevBtn = document.getElementById('modal-prev');
    const nextBtn = document.getElementById('modal-next');
    prevBtn.classList.toggle('is-hidden', currentNavIndex <= 0);
    nextBtn.classList.toggle('is-hidden', currentNavIndex >= navOrder.length - 1);
}

function showPrevDish() {
    if (currentNavIndex > 0) openModal(currentNavIndex - 1);
}

function showNextDish() {
    if (currentNavIndex < navOrder.length - 1) openModal(currentNavIndex + 1);
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.body.style.overflow = '';
    currentNavIndex = -1;
}

async function init() {
    const data = await loadDishes();

    const label = document.getElementById('event-label');
    label.textContent = `第${data.current_event.number}回 — ${data.current_event.date}`;

    const currentGrid  = document.getElementById('current-grid');
    const archiveGrid  = document.getElementById('archive-grid');

    const currentDishes = data.dishes.filter(d => d.is_current && d.category !== 'drink');
    const drinkDishes   = data.dishes.filter(d => d.is_current && d.category === 'drink');
    const archiveDishes = data.dishes.filter(d => !d.is_current);

    const CURRENT_CATEGORY_ORDER = { appetizer: 0, main: 1, dessert: 2 };
    currentDishes.sort((a, b) =>
        (CURRENT_CATEGORY_ORDER[a.category] ?? 99) - (CURRENT_CATEGORY_ORDER[b.category] ?? 99)
    );

    const CATEGORY_ORDER = { appetizer: 0, main: 1, dessert: 2, drink: 3 };
    archiveDishes.sort((a, b) =>
        (CATEGORY_ORDER[a.category] ?? 99) - (CATEGORY_ORDER[b.category] ?? 99)
    );

    // モーダルの前後ナビゲーションは、画面に表示される順（今回のお料理→ドリンク→過去のお料理）で辿る
    navOrder = [...currentDishes, ...drinkDishes, ...archiveDishes];

    if (currentDishes.length === 0) {
        currentGrid.innerHTML = '<p class="empty-note">準備中</p>';
    } else {
        currentDishes.forEach(d => currentGrid.appendChild(createCard(d, navOrder.indexOf(d))));
    }

    const drinksGrid = document.getElementById('drinks-grid');
    if (drinkDishes.length === 0) {
        drinksGrid.innerHTML = '<p class="empty-note">準備中</p>';
    } else {
        drinkDishes.forEach(d => drinksGrid.appendChild(createCard(d, navOrder.indexOf(d))));
    }

    if (archiveDishes.length === 0) {
        archiveGrid.innerHTML = '<p class="empty-note">過去の料理データを追加予定</p>';
    } else {
        archiveDishes.forEach(d => archiveGrid.appendChild(createCard(d, navOrder.indexOf(d))));
    }

    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', closeModal);
    document.getElementById('modal-prev').addEventListener('click', showPrevDish);
    document.getElementById('modal-next').addEventListener('click', showNextDish);
    document.addEventListener('keydown', e => {
        if (document.getElementById('modal').classList.contains('hidden')) return;
        if (e.key === 'Escape')    closeModal();
        if (e.key === 'ArrowLeft')  showPrevDish();
        if (e.key === 'ArrowRight') showNextDish();
    });
}

init().catch(err => console.error(err));
