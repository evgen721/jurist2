function slideReviews(direction) {
  slideSlider('reviewsSlider', direction);
}

function slideStaff(direction) {
  slideSlider('staffSlider', direction);
}

function slideArticles(direction) {
  slideSlider('articlesSlider', direction);
}

function slideSlider(sliderId, direction) {
  const slider = document.getElementById(sliderId);
  if (!slider) {
    console.error(`Слайдер с id "${sliderId}" не найден`);
    return;
  }
  
  // Берем первую дочернюю элемент как карточку
  const card = slider.children[0];
  if (!card) {
    console.error('В слайдере нет карточек');
    return;
  }
  
  const cardStyle = window.getComputedStyle(card);
  const cardWidth = card.offsetWidth + 
                   parseInt(cardStyle.marginLeft) + 
                   parseInt(cardStyle.marginRight);
  
  const step = cardWidth;
  const maxScroll = slider.scrollWidth - slider.clientWidth;
  const newScroll = slider.scrollLeft + (direction * step);
  
  slider.scrollLeft = Math.max(0, Math.min(maxScroll, newScroll));
}