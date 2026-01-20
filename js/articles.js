let articlesToShow = 8;

function loadMoreArticles() {
    const allArticles = document.querySelectorAll('#articlesGrid .article-card-all');
    const nextArticlesToShow = articlesToShow + 8;
    
    // Показываем следующие 8 статей
    for (let i = articlesToShow; i < nextArticlesToShow && i < allArticles.length; i++) {
        allArticles[i].classList.add('visible');
        allArticles[i].style.display = 'block';
    }
    
    articlesToShow = nextArticlesToShow;
    
    // Скрываем кнопку если все статьи показаны
    const loadMoreBtn = document.getElementById('loadMoreArticles');
    if (articlesToShow >= allArticles.length) {
        loadMoreBtn.style.display = 'none';
    }
}

// Инициализация - показываем первые 8 статей
function initArticles() {
    const allArticles = document.querySelectorAll('#articlesGrid .article-card-all');
    
    // Скрываем все статьи кроме первых 8
    allArticles.forEach((article, index) => {
        if (index >= 8) {
            article.style.display = 'none';
        }
    });
    
    // Скрываем кнопку если статей меньше 9
    if (allArticles.length <= 8) {
        document.getElementById('loadMoreArticles').style.display = 'none';
    }
}

// Запускаем при загрузке страницы
document.addEventListener('DOMContentLoaded', initArticles);