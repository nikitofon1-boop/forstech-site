// ФОРСТЕХ - основной скрипт
console.log('🏭 ФОРСТЕХ СКРИПТ ЗАГРУЖЕН');

// Мобильное меню
function initMobileMenu() {
    const menuToggle = document.getElementById('menuToggle');
    const navMenu = document.getElementById('navMenu');
    
    if (menuToggle && navMenu) {
        menuToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
}

// Плавная прокрутка
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
                // Закрываем мобильное меню
                const navMenu = document.getElementById('navMenu');
                if (navMenu) navMenu.classList.remove('active');
            }
        });
    });
}

// Загрузка файлов
function initFileUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const fileList = document.getElementById('fileList');
    
    if (!uploadArea || !fileInput) return;
    
    uploadArea.addEventListener('click', () => fileInput.click());
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#3498db';
        uploadArea.style.background = '#f8f9fa';
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = 'white';
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#ddd';
        uploadArea.style.background = 'white';
        handleFiles(e.dataTransfer.files);
    });
    
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });
    
    function handleFiles(files) {
        Array.from(files).forEach(file => {
            if (validateFile(file)) {
                addFileToUI(file);
            }
        });
    }
    
    function validateFile(file) {
        const validTypes = ['.dxf', '.dwg', '.pdf', '.jpg', '.jpeg', '.png'];
        const ext = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!validTypes.includes(ext)) {
            alert(`Формат ${ext} не поддерживается. Используйте: ${validTypes.join(', ')}`);
            return false;
        }
        
        if (file.size > 50 * 1024 * 1024) {
            alert('Файл слишком большой. Максимальный размер: 50MB');
            return false;
        }
        
        return true;
    }
    
    function addFileToUI(file) {
        const item = document.createElement('div');
        item.className = 'file-item';
        item.innerHTML = `
            <span>${file.name} (${formatSize(file.size)})</span>
            <button onclick="this.parentElement.remove()" style="background:none;border:none;cursor:pointer;color:#e74c3c;font-size:1.2rem">×</button>
        `;
        if (fileList) fileList.appendChild(item);
    }
    
    function formatSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Быстрая заявка
function submitQuickRequest() {
    const name = document.getElementById('clientName');
    const phone = document.getElementById('clientPhone');
    
    if (!name || !phone || !name.value || !phone.value) {
        alert('Пожалуйста, заполните имя и телефон');
        return;
    }
    
    // Здесь обычно отправка на сервер
    const requestData = {
        name: name.value,
        phone: phone.value,
        message: document.getElementById('clientMessage')?.value || '',
        timestamp: new Date().toISOString()
    };
    
    console.log('Быстрая заявка:', requestData);
    
    alert('Спасибо! Технолог ФорсТех свяжется с вами в течение 30 минут.');
    
    // Очистка формы
    name.value = '';
    phone.value = '';
    const message = document.getElementById('clientMessage');
    if (message) message.value = '';
}

// Прокрутка к калькулятору
function scrollToCalculator() {
    const calculator = document.getElementById('calculator');
    if (calculator) {
        calculator.scrollIntoView({ behavior: 'smooth' });
    }
}

// Инициализация всех компонентов
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM ЗАГРУЖЕН - инициализация компонентов ФорсТех');
    initMobileMenu();
    initSmoothScroll();
    initFileUpload();
    console.log('✅ ВСЕ КОМПОНЕНТЫ ФОРСТЕХ ИНИЦИАЛИЗИРОВАНЫ');
});