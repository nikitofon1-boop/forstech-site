// ФОРСТЕХ КАЛЬКУЛЯТОР - с 3D-печатью
console.log('⚡ ФОРСТЕХ КАЛЬКУЛЯТОР С 3D-ПЕЧАТЬЮ ЗАГРУЖЕН');

// Тарифы согласно ТЗ
const PRICE_RATES = {
    wire_edm: {
        rate: 1500,        // ₽/час
        speed: 65,         // мм²/мин (среднее 60-70)
        type: 'time_based'
    },
    sinking_edm: {
        rate: 650,         // ₽/час
        type: 'time_based' 
    },
    welding: {
        steel: 1500,       // ₽/час - сталь/нержавейка
        aluminum: 2000,    // ₽/час - алюминий/титан
        type: 'material_based'
    },
    '3d_printing': {
        // Цены за см³ согласно таблице от Алисы
        pla: 5,
        abs: 8,
        petg: 9,
        tpu: 15,
        nylon: 18,
        asa: 14,
        pc: 22,
        pla_plus: 9,
        type: 'volume_based'
    }
};

// Вспомогательные функции
function $(id) { return document.getElementById(id); }
function log(msg) { console.log('🧮 ' + msg); }

// Основная функция расчета
function calculatePrice() {
    log('Выполняем расчет...');
    
    try {
        const service = $('serviceType');
        const material = $('material');
        const material3d = $('material3d');
        const workTime = $('workTime');
        const cutArea = $('cutArea');
        const modelVolume = $('modelVolume');
        const infillPercent = $('infillPercent');
        const complexity = $('complexity');
        const priceDisplay = $('calculatedPrice');
        
        if (!service || !priceDisplay) {
            log('Не найдены необходимые элементы');
            return;
        }
        
        const serviceType = service.value;
        const materialType = material ? material.value : 'steel';
        const material3dType = material3d ? material3d.value : 'pla';
        const time = workTime ? parseFloat(workTime.value) : 2;
        const area = cutArea ? parseFloat(cutArea.value) : 0;
        const volume = modelVolume ? parseFloat(modelVolume.value) : 50;
        const infill = infillPercent ? parseFloat(infillPercent.value) : 0.3;
        const complexMultiplier = complexity ? parseFloat(complexity.value) : 1.0;
        
        log(`Услуга: ${serviceType}, Объем: ${volume}см³, Заполнение: ${infill*100}%`);
        
        let totalCost = 0;
        let calculationDetails = '';
        
        // Расчет в зависимости от типа услуги
        switch(serviceType) {
            case 'wire_edm':
                // Вырезная электроэрозия - расчет по времени или площади
                if (area > 0) {
                    const cuttingTime = area / (PRICE_RATES.wire_edm.speed * 60); // часы
                    totalCost = cuttingTime * PRICE_RATES.wire_edm.rate;
                    calculationDetails = `Площадь: ${area}мм² (~${cuttingTime.toFixed(1)}ч)`;
                } else {
                    totalCost = time * PRICE_RATES.wire_edm.rate;
                    calculationDetails = `Время: ${time}ч`;
                }
                break;
                
            case 'sinking_edm':
                // Прошивная электроэрозия - по времени
                totalCost = time * PRICE_RATES.sinking_edm.rate;
                calculationDetails = `Время: ${time}ч`;
                break;
                
            case 'welding':
                // Сварка - зависит от материала
                const weldRate = materialType === 'aluminum' || materialType === 'titanium' 
                    ? PRICE_RATES.welding.aluminum 
                    : PRICE_RATES.welding.steel;
                totalCost = time * weldRate;
                calculationDetails = `Время: ${time}ч (${materialType === 'aluminum' || materialType === 'titanium' ? 'алюминий/титан' : 'сталь/нержавейка'})`;
                break;
                
            case '3d_printing':
                // 3D-печать - расчет по объему и материалу
                const materialRate = PRICE_RATES['3d_printing'][material3dType] || 5;
                const baseCost = volume * materialRate;
                
                // Учет заполнения (инфилл)
                const infillCost = baseCost * infill;
                
                // Базовая стоимость + сложность
                totalCost = infillCost * complexMultiplier;
                
                // Учет постобработки
                const postSanding = $('post_sanding');
                const postPainting = $('post_painting');
                
                if (postSanding && postSanding.checked) {
                    totalCost *= parseFloat(postSanding.value);
                    calculationDetails += 'Шлифовка ';
                }
                if (postPainting && postPainting.checked) {
                    totalCost *= parseFloat(postPainting.value);
                    calculationDetails += 'Покраска ';
                }
                
                calculationDetails = `Объем: ${volume}см³, ${material3dType.toUpperCase()}, заполнение ${infill*100}%`;
                break;
        }
        
        // Применяем коэффициент сложности (кроме 3D-печати, где он уже учтен)
        if (serviceType !== '3d_printing') {
            totalCost *= complexMultiplier;
        }
        
        // Форматируем и выводим результат
        const formattedPrice = Math.round(totalCost).toLocaleString('ru-RU');
        
        if (calculationDetails) {
            priceDisplay.innerHTML = `${formattedPrice} ₽<br><small>${calculationDetails}</small>`;
        } else {
            priceDisplay.innerHTML = `${formattedPrice} ₽`;
        }
        
        if (complexMultiplier > 1.0 && serviceType !== '3d_printing') {
            priceDisplay.innerHTML += `<br><small>×${complexMultiplier} (сложность)</small>`;
        }
        
        log(`Расчет завершен: ${formattedPrice} ₽`);
        
    } catch (error) {
        console.error('Ошибка расчета:', error);
        const priceDisplay = $('calculatedPrice');
        if (priceDisplay) priceDisplay.textContent = 'Ошибка расчета';
    }
}

// Динамическое изменение формы калькулятора
function updateCalculatorForm() {
    const service = $('serviceType');
    const materialGroup = $('materialGroup');
    const material3dGroup = $('material3dGroup');
    const areaGroup = $('areaGroup');
    const timeGroup = $('timeGroup');
    const volumeGroup = $('volumeGroup');
    const infillGroup = $('infillGroup');
    const postprocessGroup = $('postprocessGroup');
    const complexityGroup = $('complexityGroup');
    
    if (!service) return;
    
    const serviceType = service.value;
    
    // Скрываем все группы
    if (materialGroup) materialGroup.style.display = 'none';
    if (material3dGroup) material3dGroup.style.display = 'none';
    if (areaGroup) areaGroup.style.display = 'none';
    if (timeGroup) timeGroup.style.display = 'none';
    if (volumeGroup) volumeGroup.style.display = 'none';
    if (infillGroup) infillGroup.style.display = 'none';
    if (postprocessGroup) postprocessGroup.style.display = 'none';
    
    // Показываем нужные группы в зависимости от услуги
    switch(serviceType) {
        case 'wire_edm':
            if (materialGroup) materialGroup.style.display = 'block';
            if (areaGroup) areaGroup.style.display = 'block';
            if (timeGroup) timeGroup.style.display = 'block';
            if (complexityGroup) complexityGroup.style.display = 'block';
            break;
            
        case 'sinking_edm':
        case 'welding':
            if (materialGroup) materialGroup.style.display = 'block';
            if (timeGroup) timeGroup.style.display = 'block';
            if (complexityGroup) complexityGroup.style.display = 'block';
            break;
            
        case '3d_printing':
            if (material3dGroup) material3dGroup.style.display = 'block';
            if (volumeGroup) volumeGroup.style.display = 'block';
            if (infillGroup) infillGroup.style.display = 'block';
            if (postprocessGroup) postprocessGroup.style.display = 'block';
            if (complexityGroup) complexityGroup.style.display = 'block';
            break;
    }
    
    // Обновляем расчет
    calculatePrice();
}

// Отправка расчета
function submitCalculation() {
    log('Отправка коммерческого предложения...');
    
    const service = $('serviceType');
    const material = $('material');
    const material3d = $('material3d');
    const files = document.querySelectorAll('.file-item');
    
    if (!service) {
        alert('Ошибка формы');
        return;
    }
    
    const serviceName = service.options[service.selectedIndex].text;
    const materialName = material ? material.options[material.selectedIndex].text : '';
    const material3dName = material3d ? material3d.options[material3d.selectedIndex].text : '';
    const fileCount = files.length;
    
    const selectedMaterial = materialName || material3dName;
    
    const message = `✅ ЗАЯВКА ОТПРАВЛЕНА!\n\nУслуга: ${serviceName}\n${selectedMaterial ? 'Материал: ' + selectedMaterial + '\n' : ''}${fileCount > 0 ? 'Файлов: ' + fileCount + '\n' : ''}\nТехнолог свяжется в течение 1 часа для уточнения деталей и подготовки КП!`;
    
    alert(message);
    
    // Очистка формы
    const fileList = $('fileList');
    if (fileList) fileList.innerHTML = '';
}

// Инициализация калькулятора
function initCalculator() {
    log('Инициализация калькулятора ФорсТех с 3D-печатью...');
    
    try {
        const service = $('serviceType');
        const material = $('material');
        const material3d = $('material3d');
        const workTime = $('workTime');
        const cutArea = $('cutArea');
        const modelVolume = $('modelVolume');
        const infillPercent = $('infillPercent');
        const complexity = $('complexity');
        const postSanding = $('post_sanding');
        const postPainting = $('post_painting');
        
        if (!service) {
            log('Элементы калькулятора не найдены, повторная попытка...');
            setTimeout(initCalculator, 100);
            return;
        }
        
        log('Все элементы калькулятора найдены!');
        
        // Настройка обработчиков событий
        service.addEventListener('change', updateCalculatorForm);
        
        if (material) material.addEventListener('change', calculatePrice);
        if (material3d) material3d.addEventListener('change', calculatePrice);
        if (workTime) workTime.addEventListener('input', calculatePrice);
        if (cutArea) cutArea.addEventListener('input', calculatePrice);
        if (modelVolume) modelVolume.addEventListener('input', calculatePrice);
        if (infillPercent) infillPercent.addEventListener('change', calculatePrice);
        if (complexity) complexity.addEventListener('change', calculatePrice);
        
        // Обработчики для чекбоксов постобработки
        if (postSanding) postSanding.addEventListener('change', calculatePrice);
        if (postPainting) postPainting.addEventListener('change', calculatePrice);
        
        // Первоначальная настройка формы
        updateCalculatorForm();
        
        // Первоначальный расчет
        setTimeout(calculatePrice, 50);
        
        log('Калькулятор ФорсТех с 3D-печатью успешно инициализирован!');
        window.calculatorInitialized = true;
        
    } catch (error) {
        console.error('Ошибка инициализации:', error);
    }
}

// Глобальные функции
window.updateCalculator = calculatePrice;
window.openCalculator = function(serviceType) {
    const service = $('serviceType');
    if (service) {
        service.value = serviceType;
        updateCalculatorForm();
    }
    const calculatorSection = $('calculator');
    if (calculatorSection) {
        calculatorSection.scrollIntoView({ behavior: 'smooth' });
    }
};

// Автоматическая инициализация
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCalculator);
} else {
    initCalculator();
}

// Резервная инициализация
setTimeout(() => {
    if (!window.calculatorInitialized) {
        log('Аварийная инициализация калькулятора');
        initCalculator();
    }
}, 500);