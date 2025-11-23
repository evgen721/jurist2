        let employeesData = null;

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

        // Функция для создания карточек сотрудников с вашими классами
        function createEmployeeCards(data) {
            const staffList = document.getElementById('staffList');
            const modalsContainer = document.getElementById('modalsContainer');
            
            // Очищаем контейнеры
            staffList.innerHTML = '';
            modalsContainer.innerHTML = '';

            // Проверяем, есть ли данные
            if (!data || !data.employees || data.employees.length === 0) {
                staffList.innerHTML = '<div class="error">Нет данных о сотрудниках</div>';
                return;
            }

            // Создаем карточки для каждого сотрудника
            data.employees.forEach(employee => {
                // Создаем карточку для сетки с вашими классами
                const staffItem = document.createElement('div');
                staffItem.className = 'staff-item';
                staffItem.onclick = () => openModal(employee.id);
                
                staffItem.innerHTML = `
                    <img src="${employee.photo}" alt="${employee.name}" class="staff-item-img">
                    <div class="staff-item-info">
                        <h3 class="staff-item-name">${employee.name}</h3>
                        <p class="staff-item-position">${employee.position}</p>
                    </div>
                `;
                
                staffList.appendChild(staffItem);

                // Создаем модальное окно (остается без изменений)
                const modal = document.createElement('div');
                modal.id = employee.id;
                modal.className = 'modal';
                
                modal.innerHTML = `
                    <div class="modal-content">
                        <button class="close-btn" onclick="closeModal('${employee.id}')">&times;</button>
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

                            <div class="description-section">
                                <h3 class="section-title">О сотруднике</h3>
                                <p class="description-text">${employee.description}</p>
                            </div>

                            <div class="documents-section">
                                <h3 class="section-title">Документы и сертификаты</h3>
                                <div class="documents-grid">
                                    ${employee.documents.map(doc => `
                                        <div class="document-item">
                                            <img src="${doc.image}" alt="${doc.name}" class="document-image">
                                            <div class="document-name">${doc.name}</div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        </div>
                    </div>
                `;
                
                modalsContainer.appendChild(modal);
            });
        }

        // Функции для работы с модальными окнами
        function openModal(employeeId) {
            const modal = document.getElementById(employeeId);
            if (modal) {
                modal.style.display = 'block';
                document.body.style.overflow = 'hidden';
            }
        }

        function closeModal(employeeId) {
            const modal = document.getElementById(employeeId);
            if (modal) {
                modal.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }

        // Закрытие модального окна при клике вне его
        window.onclick = function(event) {
            if (event.target.classList.contains('modal')) {
                event.target.style.display = 'none';
                document.body.style.overflow = 'auto';
            }
        }

        // Закрытие по ESC
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                const modals = document.querySelectorAll('.modal');
                modals.forEach(modal => {
                    modal.style.display = 'none';
                });
                document.body.style.overflow = 'auto';
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
                staffList.innerHTML = `
                    <div class="error">
                        Ошибка загрузки данных: ${error.message}<br>
                        Проверьте наличие файла employees.json и его формат
                    </div>
                `;
            }
        });