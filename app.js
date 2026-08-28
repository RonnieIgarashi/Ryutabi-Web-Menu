const PLACEHOLDER = 'images/店舗ロゴ_竜の旅路亭_v3_2.png';

// ===== i18n =====
const LANG_KEY = 'ryutabi-lang';
let lang = localStorage.getItem(LANG_KEY) === 'en' ? 'en' : 'ja';

const CATEGORY_LABELS = {
    ja: { appetizer: '前菜', main: '食事', dessert: 'デザート', drink: 'ドリンク' },
    en: { appetizer: 'Appetizer', main: 'Main', dessert: 'Dessert', drink: 'Drink' },
};
const CATEGORY_CSS = {
    appetizer: 'cat-appetizer',
    main:      'cat-main',
    dessert:   'cat-dessert',
    drink:     'cat-drink',
};
const UI_TEXT = {
    ja: {
        current: '今回のお料理', currentSub: 'Current Menu',
        drinks: 'ドリンク', drinksSub: 'Drinks',
        archive: '過去のお料理', archiveSub: 'The Grand Compendium',
        eventLabel: (n, d) => `第${n}回 — ${d}`,
        modalEvent: n => `第 ${n} 回 ご提供`,
        emptyCurrent: '準備中', emptyDrinks: '準備中', emptyArchive: '過去の料理データを追加予定',
        toggleLabel: 'EN', toggleAria: 'Switch to English',
    },
    en: {
        current: 'Current Menu', currentSub: '今回のお料理',
        drinks: 'Drinks', drinksSub: 'ドリンク',
        archive: 'The Grand Compendium', archiveSub: '過去のお料理',
        eventLabel: (n, d) => `Tavern Night #${n} — ${d}`,
        modalEvent: n => `Served at Tavern Night #${n}`,
        emptyCurrent: 'Coming soon', emptyDrinks: 'Coming soon', emptyArchive: 'Archive coming soon',
        toggleLabel: '日本語', toggleAria: '日本語に切り替え',
    },
};

// 表示用テキスト取得（EN欠落時は日本語へフォールバック）
function dishName(dish)    { return lang === 'en' ? (dish.name_sub || dish.name) : dish.name; }
function dishNameSub(dish) { return lang === 'en' ? dish.name : (dish.name_sub || ''); }
function dishDesc(dish)    { return lang === 'en' ? (dish.description_en || dish.description || '') : (dish.description || ''); }
function dishIngredients(dish) {
    if (lang === 'en' && Array.isArray(dish.ingredients_en) && dish.ingredients_en.length) return dish.ingredients_en;
    return dish.ingredients || [];
}

async function loadDishes() {
    const res = await fetch('data/dishes.json');
    if (!res.ok) throw new Error('dishes.json の読み込みに失敗しました');
    return res.json();
}

function categoryBadge(category) {
    if (!category || !CATEGORY_LABELS[lang][category]) return '';
    const label = CATEGORY_LABELS[lang][category];
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
    const sub = dishNameSub(dish);
    card.innerHTML = `
        <img src="${imgSrc}" alt="${dishName(dish)}"${imgClass} onerror="this.onerror=null; this.src='${PLACEHOLDER}'; this.classList.add('placeholder-img')">
        <div class="dish-card-body">
            ${categoryBadge(dish.category)}
            <p class="dish-card-name">${dishName(dish)}</p>
            ${sub ? `<p class="dish-card-sub">${sub}</p>` : ''}
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

    img.className = 'modal-image';
    img.src = dish.image || PLACEHOLDER;
    img.alt = dishName(dish);
    if (!dish.image) img.classList.add('placeholder-img');
    img.onerror = () => { img.onerror = null; img.src = PLACEHOLDER; img.classList.add('placeholder-img'); };

    document.getElementById('modal-category-badge').innerHTML = categoryBadge(dish.category);
    document.getElementById('modal-name').textContent        = dishName(dish);
    document.getElementById('modal-name-sub').textContent    = dishNameSub(dish);
    document.getElementById('modal-event').textContent       = UI_TEXT[lang].modalEvent(dish.event_number);

    renderDescription(document.getElementById('modal-description'), dishDesc(dish));

    const tagsEl = document.getElementById('modal-ingredients');
    tagsEl.innerHTML = dishIngredients(dish)
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

// ===== 描画（言語切替時に再実行） =====
let dishesData = null;

function applyStaticText() {
    const t = UI_TEXT[lang];
    document.documentElement.lang = lang;

    const setBanner = (sectionId, title, sub) => {
        const sec = document.getElementById(sectionId);
        if (!sec) return;
        const h2 = sec.querySelector('.section-banner h2');
        const subEl = sec.querySelector('.section-banner .section-sub');
        if (h2) h2.textContent = title;
        if (subEl) subEl.textContent = sub;
    };
    setBanner('current-menu', t.current, t.currentSub);
    setBanner('drinks-menu', t.drinks, t.drinksSub);
    setBanner('archive', t.archive, t.archiveSub);

    const toggle = document.getElementById('lang-toggle');
    if (toggle) {
        toggle.textContent = t.toggleLabel;
        toggle.setAttribute('aria-label', t.toggleAria);
    }
}

function renderAll() {
    const data = dishesData;
    if (!data) return;
    const t = UI_TEXT[lang];

    applyStaticText();

    const label = document.getElementById('event-label');
    label.textContent = t.eventLabel(data.current_event.number, data.current_event.date);

    const currentGrid  = document.getElementById('current-grid');
    const drinksGrid   = document.getElementById('drinks-grid');
    const archiveGrid  = document.getElementById('archive-grid');
    currentGrid.innerHTML = '';
    drinksGrid.innerHTML  = '';
    archiveGrid.innerHTML = '';

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
        currentGrid.innerHTML = `<p class="empty-note">${t.emptyCurrent}</p>`;
    } else {
        currentDishes.forEach(d => currentGrid.appendChild(createCard(d, navOrder.indexOf(d))));
    }

    if (drinkDishes.length === 0) {
        drinksGrid.innerHTML = `<p class="empty-note">${t.emptyDrinks}</p>`;
    } else {
        drinkDishes.forEach(d => drinksGrid.appendChild(createCard(d, navOrder.indexOf(d))));
    }

    if (archiveDishes.length === 0) {
        archiveGrid.innerHTML = `<p class="empty-note">${t.emptyArchive}</p>`;
    } else {
        archiveDishes.forEach(d => archiveGrid.appendChild(createCard(d, navOrder.indexOf(d))));
    }
}

function toggleLang() {
    lang = lang === 'ja' ? 'en' : 'ja';
    localStorage.setItem(LANG_KEY, lang);
    const wasOpen = currentNavIndex >= 0 ? navOrder[currentNavIndex] : null;
    renderAll();
    // モーダルを開いたまま切り替えた場合は同じ料理で再表示
    if (wasOpen) {
        const idx = navOrder.indexOf(wasOpen);
        if (idx >= 0) openModal(idx);
    }
}

async function init() {
    dishesData = await loadDishes();

    renderAll();

    const toggle = document.getElementById('lang-toggle');
    if (toggle) toggle.addEventListener('click', toggleLang);

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
