# Мобильное приложение такси - Руководство по запуску

React Native (Expo) мобильное приложение для заказа такси.

## Требования

- Node.js 18+
- npm или pnpm
- Expo CLI
- Expo Go (для тестирования на физическом устройстве)

## Быстрый старт

### 1. Установка зависимостей

```bash
cd uber-clone
npm install
# или
pnpm install
```

### 2. Настройка переменных окружения

Скопируйте файл примера и настройте его:

```bash
cp .env.example .env
```

Отредактируйте файл `.env`:

```env
# Google API ключ (обязательно!)
EXPO_PUBLIC_GOOGLE_API_KEY=ваш-google-api-ключ

# URL бэкенда
# Для эмулятора на том же компьютере:
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000

# Для физического устройства используйте IP вашего компьютера:
# EXPO_PUBLIC_API_BASE_URL=http://192.168.1.100:8000
```

### 3. Запуск приложения

```bash
npx expo start
```

## Запуск на разных устройствах

### iOS Simulator (Mac)

```bash
npx expo start
# Нажмите 'i' в терминале
```

### Android Emulator

```bash
npx expo start
# Нажмите 'a' в терминале
```

### Физическое устройство

1. **iOS (Expo Go):**
   - Установите Expo Go из App Store
   - Отсканируйте QR-код из терминала
   - Убедитесь, что телефон на той же WiFi сети

2. **Android (Expo Go):**
   - Установите Expo Go из Google Play
   - Отсканируйте QR-код из терминала
   - Убедитесь, что телефон на той же WiFi сети

### Настройка для физического устройства

1. Узнайте IP вашего компьютера:
   - Windows: `ipconfig` (найдите IPv4 Address)
   - Mac: `ipconfig getifaddr en0`
   - Linux: `hostname -I`

2. Обновите `.env` файл:
   ```env
   EXPO_PUBLIC_API_BASE_URL=http://ВАШ_IP:8000
   ```

3. Обновите `backend/.env`:
   ```env
   HOST_IP=ВАШ_IP
   CORS_ALLOW_ALL_ORIGINS=True
   ```

4. Перезапустите Docker контейнеры и Expo

## Получение Google API Key

1. Перейдите в [Google Cloud Console](https://console.cloud.google.com/)
2. Создайте новый проект
3. Включите следующие API:
   - **Maps SDK for Android** - для отображения карт на Android
   - **Maps SDK for iOS** - для отображения карт на iOS
   - **Directions API** - для построения маршрутов
   - **Places API** - для поиска мест
4. Создайте API ключ в разделе "Credentials"
5. Добавьте ключ в `.env` файл

## Тестирование

### Вход как клиент

```
Телефон: +77010000001
Пароль: test1234
```

Телефоны клиентов: +77010000001 - +77010000010

### Вход как водитель

```
Телефон: +77020000001
Пароль: test1234
```

Телефоны водителей: +77020000001 - +77020000030

### Вход как администратор

```
Телефон: +77000000000
Пароль: admin1234
```

### Mock-данные поездок

После запуска `seed_data` у первых 4 клиентов есть история поездок:

| Аккаунт | Телефон | Поездки | Оценено | Кнопка «Оценить» | Отменено |
|---------|---------|---------|---------|------------------|---------|
| Customer1 | `+77010000001` | 5 | 2 | ✅ 2 поездки | 1 |
| Customer2 | `+77010000002` | 4 | 1 | ✅ 2 поездки | 1 |
| Customer3 | `+77010000003` | 2 | 0 | ✅ 2 поездки | 0 |
| Customer4 | `+77010000004` | 2 | 1 | ✅ 1 поездка | 0 |

**Чтобы увидеть функцию отзывов:** войдите как `+77010000001`, откройте вкладку **Поездки** — у 2 завершённых поездок будет кнопка «⭐ Оценить поездку», у 2 других уже выставлены оценки.

---

## AQA Тестирование (Static Analysis)

### Semgrep - Статический анализ кода

Semgrep - это инструмент для статического анализа безопасности и качества кода.

#### Установка (через npm или pip)

```bash
# Через npm
npm install -g semgrep

# Или через pip
pip install semgrep
```

#### Запуск

```bash
# Сканирование TypeScript кода
semgrep --config=r/typescript --exclude=node_modules c:/tax_service/uber-clone/

# Полное сканирование (все правила)
semgrep --config=auto --exclude=node_modules c:/tax_service/uber-clone/

# Только безопасность
semgrep --config=security --exclude=node_modules c:/tax_service/uber-clone/
```

#### Опции

| Опция | Описание |
|-------|----------|
| `--config=auto` | Автоопределение языка |
| `--config=r/typescript` | Правила TypeScript |
| `--exclude=node_modules` | Исключить зависимости |
| `--json` | Вывод в JSON |
| `--verbose` | Подробный вывод |

#### Пример вывода

```
✅ Scan completed successfully.
 • Findings: 16 (16 blocking)
 • Rules run: 48
 • Targets scanned: 73
 • Parsed lines: ~99.9%
```

#### Создание .semgrepignore

Создайте файл `uber-clone/.semgrepignore`:

```
node_modules/
.expo/
android/
ios/
*.d.ts
```

#### Запуск с логином (расширенные правила)

```bash
# Авторизуйтесь
semgrep login

# Запустите сканирование
semgrep --config=r/typescript --exclude=node_modules c:/tax_service/uber-clone/
```

После логина доступны дополнительные Pro правила.

## Структура проекта

```
uber-clone/
├── app/                    # Экраны приложения
│   ├── (auth)/            # Экраны аутентификации
│   │   ├── sign-in.tsx   # Вход
│   │   ├── sign-up.tsx   # Регистрация
│   │   └── welcome.tsx   # Приветствие
│   └── (root)/           # Основные экраны
│       ├── find-ride.tsx     # Выбор тарифа
│       ├── confirm-ride.tsx  # Подтверждение поездки
│       ├── book-ride.tsx     # Заказ поездки
│       └── (tabs)/           # Табы
│           ├── home.tsx      # Главная (карта)
│           └── profile.tsx   # Профиль
├── components/            # Компоненты
│   ├── Map.tsx           # Карта
│   ├── GoogleTextInput.tsx # Поиск мест
│   └── ...
├── hooks/                # React хуки
├── store/                # Zustand хранилище
├── lib/                  # Утилиты
├── constants/            # Константы
└── i18n/                # Интернационализация
```

## Основные функции

1. **Главный экран** - карта с поиском места назначения
2. **Выбор тарифа** - Economy, Comfort, Premium, Business
3. **Подтверждение поездки** - просмотр водителей и цен
4. **Заказ поездки** - оформление заказа
5. **Профиль** - история поездок и настройки

## Возможные проблемы

### Ошибка подключения к API

- Проверьте, что backend запущен и доступен
- Проверьте URL в `.env` файле
- Для физического устройства убедитесь, что используете IP адрес

### Карта не отображается

- Проверьте Google API Key
- Убедитесь, что API включены в Google Cloud Console

### Ошибки при установке

```bash
# Очистка кэша
rm -rf node_modules
rm package-lock.json
npm install
```

## Команды

```bash
# Запуск
npx expo start

# Очистка кэша
npx expo start --clear

# Сборка для Android
npx expo prebuild --platform android
cd android && ./gradlew assembleRelease

# Сборка для iOS
npx expo prebuild --platform ios
```
