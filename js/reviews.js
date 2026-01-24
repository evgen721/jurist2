let reviewsData = null;
let currentReviewModalId = null;
let currentPage = 1;
const itemsPerPage = 20;
let filteredReviews = [];

// 1) Загрузка JSON
async function loadReviewsData() {
  try {
    const response = await fetch('reviews.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error('Ошибка загрузки отзывов:', error);
    throw error;
  }
}

// Утилиты
function formatDate(isoDate) {
  // 2026-01-10 -> 10.01.2026
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return isoDate;
  return `${d}.${m}.${y}`;
}

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function renderStars(rating) {
  const r = Math.max(0, Math.min(5, Number(rating) || 0));
  const full = '★'.repeat(r);
  const empty = '☆'.repeat(5 - r);
  return `<span class="review-stars" aria-label="Рейтинг ${r} из 5">${full}${empty}</span>`;
}

function getImageAttachments(review) {
  // Берём из attachments (предпочтительно), либо из docs с type=image
  const a1 = Array.isArray(review.attachments) ? review.attachments : [];
  const a2 = Array.isArray(review.docs) ? review.docs : [];

  const all = [...a1, ...a2];

  return all.filter(item => {
    const url = (item?.url || '').toLowerCase();
    const type = (item?.type || '').toLowerCase();
    const isImgType = type === 'image' || type.startsWith('image/');
    const isImgExt = url.endsWith('.png') || url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.webp') || url.endsWith('.gif');
    return isImgType || isImgExt;
  });
}

function getFirstImageUrl(review) {
  const imgs = getImageAttachments(review);
  return imgs.length ? imgs[0].url : null;
}

function getPdfDocs(review) {
  const docs = Array.isArray(review.docs) ? review.docs : [];
  return docs.filter(d => String(d?.type || '').toLowerCase() === 'pdf' || String(d?.url || '').toLowerCase().endsWith('.pdf'));
}

// Функция для перемешивания массива (Fisher-Yates shuffle)
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Функция для получения случайных отзывов
function getRandomReviews(reviews, count) {
  if (reviews.length <= count) return [...reviews];
  return shuffleArray(reviews).slice(0, count);
}

// Функция для рендера пагинации
function renderPagination(totalItems, currentPage, itemsPerPage) {
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginationContainer = document.getElementById('reviewsPagination');
  
  if (!paginationContainer || totalPages <= 1) {
    if (paginationContainer) paginationContainer.innerHTML = '';
    return;
  }
  
  let paginationHTML = '<div class="pagination">';
  
  // Кнопка "Назад"
  if (currentPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})">Назад</button>`;
  }
  
  // Номера страниц
  for (let i = 1; i <= totalPages; i++) {
    if (
      i === 1 || 
      i === totalPages || 
      (i >= currentPage - 2 && i <= currentPage + 2)
    ) {
      if (i === currentPage) {
        paginationHTML += `<span class="pagination-current">${i}</span>`;
      } else {
        paginationHTML += `<button class="pagination-btn" onclick="goToPage(${i})">${i}</button>`;
      }
    } else if (
      (i === currentPage - 3 && currentPage > 4) || 
      (i === currentPage + 3 && currentPage < totalPages - 3)
    ) {
      paginationHTML += '<span class="pagination-dots">...</span>';
    }
  }
  
  // Кнопка "Вперед"
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})">Вперёд</button>`;
  }
  
  paginationHTML += '</div>';
  
  paginationContainer.innerHTML = paginationHTML;
}

// Функция для прокрутки к началу страницы
function scrollToReviewsTop() {
  // Прокручиваем к началу контейнера с отзывами
  const reviewsContainer = document.getElementById('reviewsList');
  if (reviewsContainer) {
    // Получаем позицию контейнера относительно верха страницы
    const containerTop = reviewsContainer.getBoundingClientRect().top + window.pageYOffset;
    
    // Прокручиваем с плавной анимацией
    window.scrollTo({
      top: containerTop - 100, // Немного выше для лучшего обзора
      behavior: 'smooth'
    });
  } else {
    // Если контейнер не найден, прокручиваем просто к верху страницы
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}

// Функция перехода на страницу
function goToPage(pageNumber) {
  currentPage = pageNumber;
  const reviewsList = document.getElementById('reviewsList');
  const modalsContainer = document.getElementById('reviewsModalsContainer');
  
  // Очищаем только список отзывов, модалки оставляем
  if (reviewsList) reviewsList.innerHTML = '';
  if (modalsContainer) modalsContainer.innerHTML = '';
  
  // Рендерим отзывы для текущей страницы
  createReviewCards(reviewsData);
  
  // Прокручиваем к началу страницы после обновления контента
  // Используем небольшую задержку, чтобы дать время на рендеринг DOM
  setTimeout(scrollToReviewsTop, 50);
}

// 2) Рендер карточек + модалок (и для слайдера, и для страницы)
function createReviewCards(data) {
  const reviewsList = document.getElementById('reviewsList');     // страница всех отзывов
  const reviewsSlider = document.getElementById('reviewsSlider'); // слайдер на главной
  const modalsContainer = document.getElementById('reviewsModalsContainer');

  if (reviewsList) reviewsList.innerHTML = '';
  if (reviewsSlider) reviewsSlider.innerHTML = '';
  if (modalsContainer) modalsContainer.innerHTML = '';

  const reviews = data?.reviews;
  if (!Array.isArray(reviews) || reviews.length === 0) {
    const msg = '<div class="error">Нет данных об отзывах</div>';
    if (reviewsList) reviewsList.innerHTML = msg;
    if (reviewsSlider) reviewsSlider.innerHTML = msg;
    return;
  }

  // Только опубликованные
  const published = reviews.filter(r => String(r?.status || '').toLowerCase() === 'published');

  if (published.length === 0) {
    const msg = '<div class="error">Нет опубликованных отзывов</div>';
    if (reviewsList) reviewsList.innerHTML = msg;
    if (reviewsSlider) reviewsSlider.innerHTML = msg;
    return;
  }

  // Сохраняем все опубликованные отзывы для пагинации
  filteredReviews = published;

  // A) СЛАЙДЕР НА ГЛАВНОЙ - 10 случайных отзывов
  if (reviewsSlider) {
    const randomReviews = getRandomReviews(published, 10);
    
    randomReviews.forEach(review => {
      const id = review.id;
      const author = escapeHtml(review.author);
      const authorRole = escapeHtml(review.authorRole || '');
      const date = formatDate(review.date);
      const fullText = String(review.text || '');
      const previewHome = escapeHtml(truncateText(fullText, 100));   // главная
      const rating = Number(review.rating) || 0;

      const card = document.createElement('div');
      card.className = 'review-card review-card--slider';
      card.onclick = () => openReviewModal(id);

      card.innerHTML = `
        <div class="review-card-top">
          <div class="review-rating">${renderStars(rating)}</div>
          <div class="review-date">${escapeHtml(date)}</div>
        </div>
        <h3 class="review-author">${author}</h3>
        ${authorRole ? `<p class="review-role">${authorRole}</p>` : ''}
        <p class="review-snippet">${previewHome}</p>
      `;

      reviewsSlider.appendChild(card);
    });
  }

  // B) СТРАНИЦА ВСЕХ ОТЗЫВОВ - с пагинацией
  if (reviewsList) {
    // Рассчитываем отзывы для текущей страницы
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedReviews = filteredReviews.slice(startIndex, endIndex);
    
    // Если нет отзывов на текущей странице (например, удалили последние)
    if (paginatedReviews.length === 0 && currentPage > 1) {
      currentPage = Math.max(1, Math.ceil(filteredReviews.length / itemsPerPage));
      goToPage(currentPage);
      return;
    }
    
    paginatedReviews.forEach(review => {
      const id = review.id;
      const author = escapeHtml(review.author);
      const authorRole = escapeHtml(review.authorRole || '');
      const date = formatDate(review.date);
      const fullText = String(review.text || '');
      const previewPage = escapeHtml(truncateText(fullText, 300));   // все отзывы
      const rating = Number(review.rating) || 0;

      const lawArea = Array.isArray(review.lawArea) ? review.lawArea : [];
      const lawAreaText = escapeHtml(lawArea.join(', '));

      const problem = escapeHtml(review.problem || '');
      const goal = escapeHtml(review.goal || '');
      const result = escapeHtml(review.result || '');

      const firstImg = getFirstImageUrl(review);
      const images = getImageAttachments(review);
      const pdfs = getPdfDocs(review);
      
      const textForModal = escapeHtml(fullText);

      const item = document.createElement('div');
      item.className = 'review-grid-card';
      item.onclick = () => openReviewModal(id);

      item.innerHTML = `
        ${firstImg
          ? `<img src="${firstImg}" alt="Вложение отзыва ${author}" class="review-grid-img">`
          : `<div class="review-grid-img review-grid-img--placeholder" aria-label="Нет скриншота">
               <span>Нет скриншота</span>
             </div>`
        }
        <div class="review-grid-info">
          <div class="review-grid-meta">
            <div class="review-rating">${renderStars(rating)}</div>
            <div class="review-date">${escapeHtml(date)}</div>
          </div>

          <h3 class="review-grid-author">${author}</h3>
          ${authorRole ? `<div class="review-grid-role">${authorRole}</div>` : ''}

          <div class="review-grid-text">${previewPage}</div>
        </div>
      `;

      reviewsList.appendChild(item);
    });
    
    // Рендерим пагинацию
    renderPagination(filteredReviews.length, currentPage, itemsPerPage);
  }

  // C) МОДАЛКИ - рендерим все отзывы для модалок
  if (modalsContainer) {
    published.forEach(review => {
      const id = review.id;
      const author = escapeHtml(review.author);
      const authorRole = escapeHtml(review.authorRole || '');
      const date = formatDate(review.date);
      const fullText = String(review.text || '');
      const textForModal = escapeHtml(fullText);
      const rating = Number(review.rating) || 0;

      const lawArea = Array.isArray(review.lawArea) ? review.lawArea : [];
      const lawAreaText = escapeHtml(lawArea.join(', '));

      const problem = escapeHtml(review.problem || '');
      const goal = escapeHtml(review.goal || '');
      const result = escapeHtml(review.result || '');

      const images = getImageAttachments(review);
      const pdfs = getPdfDocs(review);

      const modal = document.createElement('div');
      modal.id = id;
      modal.className = 'modal review-modal';

      modal.innerHTML = `
        <div class="modal-content review-modal-content">
          <button class="close-btn" onclick="closeCurrentReviewModal()">&times;</button>

          <div class="review-detail">
            <!-- Верхняя часть с именем -->
            <div class="review-header-new">
              <h1 class="review-title-new">${author}</h1>
              
              <div class="review-meta-row">
                <!-- Рейтинг -->
                <div class="review-rating-modal">
                  ${renderStars(rating)}
                </div>
                
                <!-- Роль -->
                ${authorRole ? `<div class="review-role">${authorRole}</div>` : ''}
                
                <!-- Дата -->
                <div class="review-date-modal">${escapeHtml(date)}</div>
              </div>
            </div>

            <!-- Блок с информацией (остается без изменений) -->
            <div class="review-info">
              ${lawAreaText ? `
                <div class="info-row">
                  <span class="info-label">Сфера:</span>
                  <span class="info-value">${lawAreaText}</span>
                </div>
              ` : ''}

              ${problem ? `
                <div class="info-row">
                  <span class="info-label">Проблема:</span>
                  <span class="info-value">${problem}</span>
                </div>
              ` : ''}

              ${goal ? `
                <div class="info-row">
                  <span class="info-label">Цель:</span>
                  <span class="info-value">${goal}</span>
                </div>
              ` : ''}

              ${result ? `
                <div class="info-row">
                  <span class="info-label">Результат:</span>
                  <span class="info-value">${result}</span>
                </div>
              ` : ''}
            </div>

            <!-- Красивый блок с текстом отзыва - ПОКАЗЫВАЕМ ТОЛЬКО ЕСЛИ ЕСТЬ ТЕКСТ -->
            ${fullText.trim() ? `
              <div class="review-text-block-new">
                <div class="review-text-header">
                  <h3 class="review-text-title">Отзыв</h3>
                </div>
                <div class="review-text-content">
                  <p>${textForModal}</p>
                </div>
              </div>
            ` : ''}

            ${(images.length > 0) ? `
              <div class="review-attachments">
                <h3 class="section-title">Скриншоты / вложения</h3>
                <div class="review-attachments-grid">
                  ${images.map(img => `
                    <a href="${img.url}" target="_blank" class="review-attachment">
                      <img src="${img.url}" alt="${escapeHtml(img.title || 'Вложение')}" class="review-attachment-img">
                    </a>
                  `).join('')}
                </div>
              </div>
            ` : ''}

            ${(pdfs.length > 0) ? `
              <div class="review-docs">
                <h3 class="section-title">Документы</h3>
                <ul class="review-docs-list">
                  ${pdfs.map(d => `
                    <li><a href="${d.url}" target="_blank">${escapeHtml(d.title || d.url)}</a></li>
                  `).join('')}
                </ul>
              </div>
            ` : ''}
          </div>

          <button class="mobile-close-btn" onclick="closeCurrentReviewModal()">Закрыть</button>
        </div>
      `;

      modalsContainer.appendChild(modal);
    });
  }
}

// 3) Модалки (по аналогии с staff.js)
function openReviewModal(reviewId) {
  const modal = document.getElementById(reviewId);
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    currentReviewModalId = reviewId;
    history.pushState({ modalOpen: true, modalId: reviewId, type: 'review' }, '');
  }
}

function closeCurrentReviewModal() {
  if (!currentReviewModalId) return;

  const modal = document.getElementById(currentReviewModalId);
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';

    if (history.state && history.state.modalOpen) {
      history.back();
    }
  }
  currentReviewModalId = null;
}

// Назад в браузере
window.addEventListener('popstate', function(event) {
  if (currentReviewModalId) {
    const modal = document.getElementById(currentReviewModalId);
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
    }

    if (event.state && event.state.modalOpen) {
      history.pushState({ modalOpen: true, modalId: currentReviewModalId, type: 'review' }, '');
    } else {
      currentReviewModalId = null;
    }
  }
});

// Закрытие по клику на фон
window.addEventListener('click', function(event) {
  if (event.target.classList && event.target.classList.contains('review-modal')) {
    closeCurrentReviewModal();
  }
});

// Закрытие по ESC
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') closeCurrentReviewModal();
});

// 4) Инициализация
document.addEventListener('DOMContentLoaded', async function() {
  try {
    const data = await loadReviewsData();
    reviewsData = data;
    createReviewCards(data);
  } catch (error) {
    const reviewsList = document.getElementById('reviewsList');
    const reviewsSlider = document.getElementById('reviewsSlider');
    const msg = `
      <div class="error">
        Ошибка загрузки отзывов: ${escapeHtml(error.message)}<br>
        Проверьте наличие файла reviews.json и его формат
      </div>
    `;
    if (reviewsList) reviewsList.innerHTML = msg;
    if (reviewsSlider) reviewsSlider.innerHTML = msg;
  }
});

function truncateText(str, limit) {
  const s = String(str ?? '').trim();
  if (s.length <= limit) return s;
  return s.slice(0, limit).trimEnd() + '…';
}