document.addEventListener('DOMContentLoaded', function() {
    // Инициализация Telegram Web App
    if (window.Telegram && window.Telegram.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand(); 
    }

    // Прелоадинг всех изображений для предотвращения прыжков кнопки
    const imageUrls = [
        'images/fortune.svg',
        'images/card.svg', 
        'images/compas.svg',
        'images/book.svg'
    ];
    
    imageUrls.forEach(url => {
        const img = new Image();
        img.src = url;
    });

    const metrikaId = 103293805;

    // --- FACEBOOK PIXEL СОБЫТИЕ ---
    function sendFacebookEvent(eventName) {
        if (window.fbq) {
            window.fbq('track', eventName);
            console.log(`Facebook Pixel: событие ${eventName} отправлено`);
        } else {
            console.error('Facebook Pixel не найден.');
        }
    }

    // --- ОБЩАЯ ЛОГИКА ДЛЯ ЦЕЛЕЙ ---
    function sendGoalWithCallback(goalId, callback) {
        let callbackExecuted = false;
        
        function executeCallback() {
            if (callbackExecuted) return;
            callbackExecuted = true;
            console.log(`Переход выполняется для цели ${goalId}`);
            if (callback) callback();
        }
        
        if (window.ym) {
            window.ym(metrikaId, 'reachGoal', goalId, {
                callback: function() {
                    console.log(`Цель ${goalId} успешно отправлена в Метрику`);
                    executeCallback();
                }
            });
            // Резервная задержка на случай, если callback не сработает
            setTimeout(function() {
                console.log(`Резервный таймаут для цели ${goalId}`);
                executeCallback();
            }, 300);
        } else {
            console.error('Счётчик Яндекс.Метрики не найден.');
            executeCallback();
        }
    }

    const goalMap = {
        'start-onboarding': '5-CLICK_START_ONBOARDING',
        'onboarding-1-next': '5-CLICK_ONBOARDING_1_NEXT',
        'onboarding-2-next': '5-CLICK_ONBOARDING_2_NEXT',
        'onboarding-3-to-paywall': '5-CLICK_ONBOARDING_3_TO_PAYWALL',
        'paywall-submit': '5-CLICK_PAYWALL_SUBMIT'
    };

    for (const buttonId in goalMap) {
        const button = document.getElementById(buttonId);
        if (button) {
            const goalId = goalMap[buttonId];
            button.addEventListener('click', function(event) {
                // Если у кнопки есть класс disabled, отменяем переход
                if (button.classList.contains('disabled')) {
                    event.preventDefault();
                    return;
                }
                
                // Предотвращаем немедленный переход
                event.preventDefault();
                
                // Получаем href для перехода
                const targetUrl = this.getAttribute('href');
                
                // Отправляем цель и Facebook событие, потом переходим
                if (buttonId === 'paywall-submit') {
                    sendFacebookEvent('Subscription');
                }
                sendGoalWithCallback(goalId, function() {
                    if (targetUrl) {
                        window.location.href = targetUrl;
                    }
                });
            });
        }
    }

    // --- ЛОГИКА СПЕЦИАЛЬНО ДЛЯ ЭКРАНА ПЕЙВОЛА ---
    const paywallContainer = document.querySelector('.tariffs');
    if (paywallContainer) {
        const tariffs = paywallContainer.querySelectorAll('.tariff');
        const submitButton = document.getElementById('paywall-submit');

        tariffs.forEach(tariff => {
            tariff.addEventListener('click', function() {
                // Сначала убираем подсветку со всех тарифов
                tariffs.forEach(t => t.classList.remove('selected'));
                
                // Добавляем подсветку только кликнутому тарифу
                this.classList.add('selected');

                // Активируем кнопку
                if (submitButton) {
                    submitButton.classList.remove('disabled');
                }
            });
        });
    }
});