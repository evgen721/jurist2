const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('.nav');

// открытие / закрытие по кнопке
menuToggle.addEventListener('click', function (e) {
    e.stopPropagation(); // чтобы клик по кнопке не закрыл меню
    nav.classList.toggle('active');
});

// закрытие при клике вне меню
document.addEventListener('click', function (e) {
    // если меню открыто и клик не по меню и не по кнопке
    if (nav.classList.contains('active') &&
        !nav.contains(e.target) &&
        !menuToggle.contains(e.target)) {
        nav.classList.remove('active');
    }
});