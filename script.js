// Пример базы данных пользователей (для авторизации)
const users = JSON.parse(localStorage.getItem('users')) || {};

// Авторизация
document.getElementById('login-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  if (users[username] && users[username].password === password) {
    // Успешный логин
    localStorage.setItem('currentUser', username); // Сохраняем текущего пользователя
    document.getElementById('auth-section').style.display = 'none';
    document.getElementById('game-section').style.display = 'block';
    document.getElementById('logout-button').style.display = 'inline-block';
    document.getElementById('login-register-button').style.display = 'none'; // Скрываем кнопку авторизации
    document.getElementById('start-guest-button').style.display = 'none'; // Скрываем кнопку Start as Guest
    startTypingTest();
  } else {
    document.getElementById('login-error').textContent = "Invalid username or password";
  }
});

// Регистрация нового пользователя
document.getElementById('register-form').addEventListener('submit', function(event) {
  event.preventDefault();
  const username = document.getElementById('new-username').value;
  const password = document.getElementById('new-password').value;

  if (users[username]) {
    document.getElementById('register-error').textContent = "User already exists!";
  } else {
    users[username] = { password, results: [] };
    localStorage.setItem('users', JSON.stringify(users)); // Сохраняем пользователей в LocalStorage
    document.getElementById('register-error').textContent = "Registration successful!";
  }
});

// Показать форму регистрации
document.getElementById('show-register').addEventListener('click', function() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('register-section').style.display = 'block';
});

// Показать форму авторизации
document.getElementById('show-login').addEventListener('click', function() {
  document.getElementById('register-section').style.display = 'none';
  document.getElementById('auth-section').style.display = 'block';
});

// Выход из аккаунта
document.getElementById('logout-button').addEventListener('click', function() {
  localStorage.removeItem('currentUser');
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('game-section').style.display = 'none';
  document.getElementById('logout-button').style.display = 'none';
  document.getElementById('login-register-button').style.display = 'inline-block'; // Показываем кнопку для авторизации
  document.getElementById('start-guest-button').style.display = 'inline-block'; // Показываем кнопку Start as Guest
  typedChars = 0;
  correctChars = 0;
  errors = 0; // Сброс ошибок
  userInput = '';
  clearInterval(interval);
});

// Начать игру как гость
document.getElementById('start-guest-button').addEventListener('click', function() {
  document.getElementById('auth-section').style.display = 'none';
  document.getElementById('game-section').style.display = 'block';
  document.getElementById('login-register-button').style.display = 'inline-block'; // Скрыть кнопку авторизации
  document.getElementById('start-guest-button').style.display = 'none'; // Скрыть кнопку Start as Guest
  startTypingTest();
});

// Показать секцию для авторизации или регистрации
function showAuthSection() {
  document.getElementById('auth-section').style.display = 'block';
  document.getElementById('game-section').style.display = 'none';
  document.getElementById('login-register-button').style.display = 'none'; // Скрыть кнопку, когда пользователь авторизован
}

/// Переменные для теста на слепую печать
let startTime = 0; // Время начала теста
let interval; // Интервал для обновления таймера
let typedChars = 0; // Общее количество введённых символов
let correctChars = 0; // Количество правильных символов
let errors = 0; // Количество ошибок
let currentTextIndex = 0; // Индекс текущей фразы
let currentText = ''; // Текущая фраза, которую нужно ввести
let isTimerStarted = false; // Флаг, чтобы начать таймер после первого ввода

// История ввода для подсчета точности (accuracy), включая стертые буквы
let inputHistory = []; // Массив, который будет хранить введенные и удаленные символы

// Пример фраз для тренировки
const textsArray = [
  "The quick brown fox jumps over the lazy dog.",
  "A journey of a thousand miles begins with a single step.",
  "To be or not to be, that is the question.",
  "All that glitters is not gold.",
  "In the end, we will remember not the words of our enemies, but the silence of our friends.",
  "Life is what happens when you're busy making other plans.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Do not dwell in the past, do not dream of the future, concentrate the mind on the present moment.",
  "Happiness is not something ready-made. It comes from your own actions.",
  "You miss 100% of the shots you don't take.",
  "In the middle of difficulty lies opportunity.",
  "The only way to do great work is to love what you do.",
  "The best way to predict the future is to invent it.",
  "If you want to go fast, go alone. If you want to go far, go together.",
  "Hardships often prepare ordinary people for an extraordinary destiny.",
  "Strive not to be a success, but rather to be of value.",
  "Don't count the days, make the days count.",
  "Opportunities don't happen. You create them.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream big and dare to fail.",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us.",
  "The greatest glory in living lies not in never falling, but in rising every time we fall.",
  "Do not go where the path may lead, go instead where there is no path and leave a trail.",
  "Act as if what you do makes a difference. It does.",
  "Keep your face always toward the sunshine — and shadows will fall behind you.",
  "The purpose of our lives is to be happy.",
  "Turn your wounds into wisdom.",
  "You have power over your mind - not outside events. Realize this, and you will find strength.",
  "Limit your 'always' and your 'nevers.'",
  "Do what you can, with what you have, where you are."
];

function getRandomPhrase() {
  const randomIndex = Math.floor(Math.random() * textsArray.length);
  return textsArray[randomIndex];
}

// Начать тест
function startTypingTest() {
  typedChars = 0;
  correctChars = 0;
  errors = 0; // Сброс ошибок
  inputHistory = []; // Очистка истории

  currentText = getRandomPhrase(); // Выбираем случайную фразу
  document.getElementById('text-to-type').textContent = currentText;
  document.getElementById('user-input').value = "";
  document.getElementById('user-input').focus();

  // Разбиваем фразу на буквы и отображаем их
  document.getElementById('text-to-type').innerHTML = currentText.split("").map(char => `<span class="char">${char}</span>`).join("");

  // Слушаем ввод пользователя
  document.getElementById('user-input').addEventListener('input', handleInput);
}


// Обновление таймера
function updateTimer() {
  const elapsedTime = Math.floor((Date.now() - startTime) / 1000);
  document.getElementById('timer').textContent = `Time: ${elapsedTime}s`;
}

function handleInput(event) {
  const input = event.target.value; // Текущий ввод пользователя
  const charSpans = document.querySelectorAll('#text-to-type .char'); // Символы для ввода
  
  // Старт таймера при первом вводе символа
  if (!isTimerStarted && input.length > 0) {
    isTimerStarted = true;
    startTime = Date.now();
    interval = setInterval(updateTimer, 1000);
  }

  typedChars = input.length; // Общее количество введённых символов
  correctChars = 0; // Сброс счётчика правильных символов

  for (let i = 0; i < input.length; i++) {
    const currentSpan = charSpans[i];
    const currentChar = input[i];
    const correctChar = currentSpan ? currentSpan.textContent : null;
  
    if (currentSpan) {
      // Если символ правильный
      if (currentChar === correctChar) {
        currentSpan.style.color = 'green';
        if (!currentSpan.dataset.corrected) {
          correctChars++; // Учитываем символ как правильный
        }
      } else {
        currentSpan.style.color = 'red';
        if (!currentSpan.dataset.corrected) {
          errors++; // Учитываем как ошибку
          currentSpan.dataset.corrected = true; // Помечаем исправление
        }
      }
    } else {
      errors++; // Лишние символы
    }
  }

  // Для оставшихся символов, которые не были введены
  for (let i = input.length; i < charSpans.length; i++) {
    const span = charSpans[i];
    span.style.color = 'black'; // Возвращаем цвет по умолчанию
    delete span.dataset.corrected; // Сбрасываем метку исправления
  }

  checkForTextCompletion(input); // Проверяем, завершена ли фраза
}

// Проверка завершения фразы
function checkForTextCompletion(input) {
  // Проверяем, введено ли количество символов, равное длине текущей фразы
  if (input.length >= currentText.length) {
    updateWpmAndAccuracy(); // Обновляем статистику

    // Сбрасываем переменные для новой фразы
    typedChars = 0;
    correctChars = 0;
    errors = 0;
    inputHistory = [];
    clearInterval(interval);
    isTimerStarted = false;

    // Генерируем новую случайную фразу
    currentText = getRandomPhrase();
    document.getElementById('text-to-type').innerHTML = currentText.split("").map(char => `<span class="char">${char}</span>`).join("");
    document.getElementById('user-input').value = "";

    document.getElementById('text-to-type').scrollIntoView(); // Если требуется прокрутка
  }
}


// Обновление WPM и точности
function updateWpmAndAccuracy() {
  const timeElapsed = (Date.now() - startTime) / 1000;
  const wpm = Math.floor((typedChars / 5) / (timeElapsed / 60)); // WPM = (characters / 5) / time in minutes
  const accuracy = calculateAccuracy();

  // Сохраняем результат WPM в историю пользователя
  const currentUser  = localStorage.getItem('currentUser');
if (currentUser ) {
    users[currentUser ].results.push(wpm);
    localStorage.setItem('users', JSON.stringify(users)); // Сохраняем изменения в LocalStorage
}

  document.getElementById('wpm').textContent = `WPM: ${wpm}`;
  document.getElementById('accuracy').textContent = `Accuracy: ${accuracy}%`;
}

// Функция для вычисления точности с учетом исправленных символов и ошибок
function calculateAccuracy() {
  const totalTypedChars = typedChars; // Общее количество введённых символов
  const incorrectChars = errors; // Ошибки, включая исправления

  // Проверяем, чтобы не делить на ноль
  if (totalTypedChars === 0) return 0;

  // Формула точности: ((Общее количество символов - Ошибки) / Общее количество символов) * 100
  const accuracy = ((totalTypedChars - incorrectChars) / totalTypedChars) * 100;

  return accuracy.toFixed(2); // Округляем до двух знаков
}



// Функция, которая будет вызываться при исправлении символов
function handleCorrection(index, correctedChar) {
  if (inputHistory[index] && inputHistory[index].correct === false) {
    // Отметим, что символ был исправлен
    inputHistory[index].char = correctedChar;  // Записываем исправленный символ
    inputHistory[index].correct = true;        // Отмечаем, что теперь символ правильный
    inputHistory[index].revised = true;        // Отметим, что символ был исправлен

    // Перерисовываем символ на экране
    const charSpans = document.querySelectorAll('#text-to-type .char');
    charSpans[index].style.color = 'green'; // Окрашиваем исправленный символ в зелёный
  }
}