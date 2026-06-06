const PLACEHOLDER = 'images/placeholder.svg';

async function loadDishes() {
    const res = await fetch('data/dishes.json');
    if (!res.ok) throw new Error('dishes.json の読み込みに失敗しました');
    return res.json();
}

function createCard(dish) {
    const card = document.createElement('div');
    card.className = 'dish-card';
    card.setAttribute('role', 'button');
    card.setAttribute('tabindex', '0');

    const imgSrc = dish.image || PLACEHOLDER;
    card.innerHTML = `
        <img src="${imgSrc}" alt="${dish.name}" onerror="this.src='${PLACEHOLDER}'">
        <div class="dish-card-body">
            <p class="dish-card-name">${dish.name}</p>
            ${dish.name_sub ? `<p class="dish-card-sub">${dish.name_sub}</p>` : ''}
            <p class="dish-card-event">第${dish.event_number}回</p>
        </div>
    `;

    card.addEventListener('click', () => openModal(dish));
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') openModal(dish); });
    return card;
}

function openModal(dish) {
    const modal = document.getElementById('modal');
    const img = document.getElementById('modal-image');

    img.src = dish.image || PLACEHOLDER;
    img.alt = dish.name;
    img.onerror = () => { img.src = PLACEHOLDER; };

    document.getElementById('modal-name').textContent = dish.name;
    document.getElementById('modal-name-sub').textContent = dish.name_sub || '';
    document.getElementById('modal-description').textContent = dish.description || '';
    document.getElementById('modal-event').textContent = `第${dish.event_number}回提供`;

    const tagsEl = document.getElementById('modal-ingredients');
    tagsEl.innerHTML = (dish.ingredients || [])
        .map(i => `<span class="ingredient-tag">${i}</span>`)
        .join('');

    modal.classList.remove('hidden');
    document.getElementById('modal-close').focus();
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modal').classList.add('hidden');
    document.body.style.overflow = '';
}

async function init() {
    const data = await loadDishes();

    const label = document.getElementById('event-label');
    label.textContent = `第${data.current_event.number}回 — ${data.current_event.date}`;

    const currentGrid = document.getElementById('current-grid');
    const archiveGrid = document.getElementById('archive-grid');

    const currentDishes = data.dishes.filter(d => d.is_current);
    const archiveDishes = data.dishes.filter(d => !d.is_current);

    if (currentDishes.length === 0) {
        currentGrid.innerHTML = '<p class="empty-note">準備中</p>';
    } else {
        currentDishes.forEach(d => currentGrid.appendChild(createCard(d)));
    }

    if (archiveDishes.length === 0) {
        archiveGrid.innerHTML = '<p class="empty-note">過去の料理データを追加予定</p>';
    } else {
        archiveDishes.forEach(d => archiveGrid.appendChild(createCard(d)));
    }

    document.getElementById('modal-close').addEventListener('click', closeModal);
    document.getElementById('modal-overlay').addEventListener('click', closeModal);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });
}

init().catch(err => console.error(err));
