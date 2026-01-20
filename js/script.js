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

  // Берём первый реальный элемент-карточку, а не текстовый узел
  const card = Array.from(slider.children).find(el => el.nodeType === 1);
  if (!card) {
    console.error('В слайдере нет карточек');
    return;
  }

  // Вычисляем корректную ширину карточки
  const style = window.getComputedStyle(card);
  const cardWidth =
    card.offsetWidth +
    parseFloat(style.marginLeft) +
    parseFloat(style.marginRight);

  const step = cardWidth; // шаг прокрутки = ширина карточки
  const maxScroll = slider.scrollWidth - slider.clientWidth;

  let newScroll = slider.scrollLeft + direction * step;
  newScroll = Math.max(0, Math.min(maxScroll, newScroll));

  slider.scrollLeft = newScroll;
}
