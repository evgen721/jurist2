function loadMoreReviews() {
    const reviewsGrid = document.getElementById('reviewsGrid');
    const hiddenReviews = reviewsGrid.querySelectorAll('.review-card-all:not(.visible)');
    const loadMoreBtn = document.getElementById('loadMoreReviews');
    
    // Показываем следующие 6 отзывов
    for (let i = 0; i < 6 && i < hiddenReviews.length; i++) {
        hiddenReviews[i].classList.add('visible');
        hiddenReviews[i].style.display = 'flex';
    }
    
    // Скрываем кнопку, если больше нет отзывов
    const remainingHidden = reviewsGrid.querySelectorAll('.review-card-all:not(.visible)');
    if (remainingHidden.length === 0) {
        loadMoreBtn.style.display = 'none';
    }
}