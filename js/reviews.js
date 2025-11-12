const REVIEWS_PER_PAGE = 6; // Количество отзывов на странице
let currentPage = 1;
let allReviews = [];

// Функция для загрузки отзывов из JSON
async function loadReviews() {
    try {
        const response = await fetch('reviews.json');
        const data = await response.json();
        allReviews = data.reviews;
        
        // Инициализация отображения
        displayReviews();
        setupPagination();
    } catch (error) {
        console.error('Ошибка загрузки отзывов:', error);
        document.getElementById('reviewsGrid').innerHTML = '<p>Не удалось загрузить отзывы. Пожалуйста, попробуйте позже.</p>';
    }
}

// Функция для отображения отзывов на текущей странице
function displayReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    reviewsGrid.innerHTML = '';
    
    // Вычисляем, какие отзывы показывать на текущей странице
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    const endIndex = startIndex + REVIEWS_PER_PAGE;
    const reviewsToShow = allReviews.slice(startIndex, endIndex);
    
    // Создаем HTML для каждого отзыва
    reviewsToShow.forEach(review => {
        const reviewCard = document.createElement('div');
        reviewCard.className = 'review-card-all review-grid-card';
        
        // Форматируем дату для отображения
        const formattedDate = formatDate(review.date);
        
        // Создаем звезды рейтинга
        const ratingStars = createRatingStars(review.rating);
        
        reviewCard.innerHTML = `
            <div class="review-content">
                <h3 class="review-title">${review.author}</h3>
                ${review.position ? `<p class="review-position">${review.position}</p>` : ''}
                <div class="review-meta">
                    <span class="review-date">${formattedDate}</span>
                    ${ratingStars}
                </div>
                <p class="review-snippet">${review.text}</p>
                ${review.practice ? `<span class="review-practice">${getPracticeName(review.practice)}</span>` : ''}
            </div>
        `;
        
        reviewsGrid.appendChild(reviewCard);
    });
}

// Функция для создания звезд рейтинга
function createRatingStars(rating) {
    let starsHtml = '<div class="review-rating">';
    
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            starsHtml += '<span class="star filled">★</span>';
        } else {
            starsHtml += '<span class="star">★</span>';
        }
    }
    
    starsHtml += '</div>';
    return starsHtml;
}

// Функция для форматирования даты
function formatDate(dateString) {
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', options);
}

// Функция для получения названия практики
function getPracticeName(practiceCode) {
    const practices = {
        'corporate-law': 'Корпоративное право',
        'contract-law': 'Договорное право',
        'litigation': 'Судебные споры',
        'real-estate': 'Недвижимость',
        'tax-law': 'Налоговое право'
        // Добавьте другие практики по мере необходимости
    };
    
    return practices[practiceCode] || practiceCode;
}

// Функция для настройки пагинации
function setupPagination() {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';
    
    const totalPages = Math.ceil(allReviews.length / REVIEWS_PER_PAGE);
    
    // Создаем кнопки пагинации
    for (let i = 1; i <= totalPages; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `page-number ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.addEventListener('click', () => {
            currentPage = i;
            displayReviews();
            setupPagination();
            
            // Прокрутка к началу отзывов
            document.getElementById('reviewsGrid').scrollIntoView({ 
                behavior: 'smooth', 
                block: 'start' 
            });
        });
        
        paginationContainer.appendChild(pageButton);
    }
}

// Загружаем отзывы при загрузке страницы
document.addEventListener('DOMContentLoaded', loadReviews);