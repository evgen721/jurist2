let employeesData = null;
let currentModalId = null;

// Функция для загрузки JSON
async function loadEmployeesData() {
    try {
        const response = await fetch('staff.json');
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        throw error;
    }
}

// Функция для создания карточек сотрудников
function createEmployeeCards(data) {
    const staffList = document.getElementById('staffList');
    const staffSlider = document.getElementById('staffSlider');
    const modalsContainer = document.getElementById('modalsContainer');
    
    // Очищаем контейнеры только если они существуют
    if (staffList) staffList.innerHTML = '';
    if (staffSlider) staffSlider.innerHTML = '';
    if (modalsContainer) modalsContainer.innerHTML = '';

    // Проверяем, есть ли данные
    if (!data || !data.employees || data.employees.length === 0) {
        if (staffList) staffList.innerHTML = '<div class="error">Нет данных о сотрудниках</div>';
        if (staffSlider) staffSlider.innerHTML = '<div class="error">Нет данных о сотрудниках</div>';
        return;
    }

    // Создаем карточки для каждого сотрудника
    data.employees.forEach(employee => {
        // 1. Карточка для основного списка (.staff-list) - если элемент существует
        if (staffList) {
            const staffItem = document.createElement('div');
            staffItem.className = 'staff-item';
            staffItem.onclick = () => openModal(employee.id);
            
            staffItem.innerHTML = `
                <img src="${employee.photo}" alt="${employee.name}" class="staff-item-img">
                <div class="staff-item-info">
                    <h3 class="staff-item-name">${employee.name}</h3>
                    <p class="staff-item-position">${employee.position}</p>
					
					<div class="info-row">
                        <span class="info-label">Образование:</span>
                        <span class="info-value">${employee.education}</span>
                    </div>
					<div class="info-row">
                        <span class="info-label">Опыт работы:</span>
                        <span class="info-value">${employee.experience}</span>
                    </div>
                </div>
            `;
            
            staffList.appendChild(staffItem);
        }

        // 2. Карточка для слайдера (.slider-track) - если элемент существует
        if (staffSlider) {
            const staffCard = document.createElement('div');
            staffCard.className = 'staff-card';
            staffCard.onclick = () => openModal(employee.id);
            
            staffCard.innerHTML = `
                <img src="${employee.photo}" alt="${employee.name}" class="staff-img">
                <h3 class="staff-name">${employee.name}</h3>
                <p class="staff-desc">${employee.position}</p>
            `;
            
            staffSlider.appendChild(staffCard);
        }

        // 3. Модальное окно
        const modal = document.createElement('div');
        modal.id = employee.id;
        modal.className = 'modal';
        
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-btn" onclick="closeCurrentModal()">&times;</button>
                <div class="employee-detail">
                    <div class="employee-header">
                        <img src="${employee.photo}" alt="${employee.name}" class="employee-photo">
                        <div>
                            <h2 class="employee-name-large">${employee.name}</h2>
                            <p class="employee-position-large">${employee.position}</p>
                            <div class="employee-info">
                                <div class="info-row">
                                    <span class="info-label">Образование:</span>
                                    <span class="info-value">${employee.education}</span>
                                </div>
                                <div class="info-row">
                                    <span class="info-label">Опыт работы:</span>
                                    <span class="info-value">${employee.experience}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    


                    
                </div>
				<button class="mobile-close-btn" onclick="closeCurrentModal()">Закрыть</button>
            </div>
        `;

        if (modalsContainer) {
            modalsContainer.appendChild(modal);
        }
    });
}
/* <div class="description-section">
                        <h3 class="section-title">О сотруднике</h3>
                        <p class="description-text">${employee.description}</p>
                    </div>
                     <div class="documents-section">
                        <h3 class="section-title">Документы и сертификаты</h3>
                        <div class="documents-grid">
                            ${employee.documents.map(doc => `
                                <div class="document-item">
                                    <a href="${doc.image}" target="_blank" class="document-link">
                                        <img src="${doc.image}" alt="${doc.name}" class="document-image">
                                    </a>
                                    <div class="document-name">${doc.name}</div>
                                </div>
                            `).join('')}
                        </div>
                    </div> */


// Функции для работы с модальными окнами
function openModal(employeeId) {
    const modal = document.getElementById(employeeId);
    if (modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
        currentModalId = employeeId;
        
        // Добавляем состояние в историю браузера
        history.pushState({ modalOpen: true, modalId: employeeId }, '');
    }
}

function closeCurrentModal() {
    if (currentModalId) {
        const modal = document.getElementById(currentModalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
            
            // Если мы были на состоянии модального окна, возвращаемся назад
            if (history.state && history.state.modalOpen) {
                history.back();
            }
        }
        currentModalId = null;
    }
}

// Обработчик кнопки "Назад" в браузере
window.addEventListener('popstate', function(event) {
    if (currentModalId) {
        // Закрываем модальное окно
        const modal = document.getElementById(currentModalId);
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
        
        // Если пользователь нажал "Назад" и мы были в модальном окне,
        // но история говорит что модальное окно должно быть открыто - предотвращаем
        if (event.state && event.state.modalOpen) {
            history.pushState({ modalOpen: true, modalId: currentModalId }, '');
        } else {
            currentModalId = null;
        }
    }
});

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        closeCurrentModal();
    }
}

// Закрытие по ESC
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeCurrentModal();
    }
});

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const data = await loadEmployeesData();
        employeesData = data;
        createEmployeeCards(data);
    } catch (error) {
        const staffList = document.getElementById('staffList');
        if (staffList) {
            staffList.innerHTML = `
                <div class="error">
                    Ошибка загрузки данных: ${error.message}<br>
                    Проверьте наличие файла staff.json и его формат
                </div>
            `;
        }
    }
});