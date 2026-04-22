# КОНТЕКСТ ПРОЕКТА ДЛЯ НАПИСАНИЯ ПРАКТИЧЕСКОЙ ЧАСТИ ДИПЛОМНОЙ РАБОТЫ
## Тема: «Разработка информационной системы управления автомобильными услугами»

> Используй этот документ как единственный источник правды.
> Все данные соответствуют реальному коду проекта.
> Язык написания диплома: **казахский (академический стиль, ГОСТ Р 7.0.11-2011)**

---

## СТРУКТУРА ПРАКТИЧЕСКОЙ ЧАСТИ

```
Глава 3. Практическая реализация системы
  3.1 Проектирование архитектуры системы          ← УЖЕ НАПИСАНА
  3.2 Разработка серверной части                  ← НУЖНО НАПИСАТЬ
  3.3 Реализация клиентской части                 ← НУЖНО НАПИСАТЬ
  3.4 Тестирование системы                        ← НУЖНО НАПИСАТЬ
```

---

## РАЗДЕЛ 3.2 — СЕРВЕРНАЯ ЧАСТЬ

### Контекст и обоснование технологий

**Фреймворк:** Django 4.2 + Django REST Framework 3.15
- Выбор обоснован: ORM, кастомная User модель, встроенная система миграций, django-channels для WebSocket
- Альтернативы отклонены: FastAPI — нет ORM и WebSocket из коробки; Flask — слишком низкоуровневый

**База данных:** PostgreSQL 15 + PostGIS (расширение для геопространственных данных)
- PostGIS нужен для: хранения координат (PointField), поиска ближайших водителей (ST_DWithin), сферических расстояний (geography=True)

**Кэш и очереди сообщений:** Redis 7
- Используется как: channel layer для Django Channels (WebSocket broadcast), потенциально кэш

**Контейнеризация:** Docker Compose (4 сервиса: backend, db, pgadmin, redis не в compose но в settings)

---

### 3.2.1 — Конфигурация и аутентификация

#### Кастомная User модель
```python
# taxi/models.py
class User(AbstractBaseUser, PermissionsMixin):
    phone      = models.CharField(max_length=20, unique=True)
    first_name = models.CharField(max_length=50)
    last_name  = models.CharField(max_length=50)
    is_active  = models.BooleanField(default=True)
    USERNAME_FIELD  = 'phone'
    REQUIRED_FIELDS = ['first_name', 'last_name']
    objects = CustomUserManager()
```

#### Ролевая система (RBAC)
```
User ──< UserRole >── Role
              (M:N через промежуточную таблицу)
```
Роли: `customer`, `driver`, `admin`
Одному пользователю можно назначить несколько ролей одновременно.

#### SimpleJWT конфигурация
| Параметр | Значение | Зачем |
|----------|---------|-------|
| ACCESS_TOKEN_LIFETIME | 15 минут | Минимизация окна кражи |
| REFRESH_TOKEN_LIFETIME | 7 дней | Комфорт пользователя |
| ROTATE_REFRESH_TOKENS | True | Одноразовые refresh токены |
| BLACKLIST_AFTER_ROTATION | True | Старый токен = недействителен |
| AUTH_HEADER_TYPES | Bearer | RFC 6750 |

#### Эндпоинты аутентификации
| Эндпоинт | Метод | Описание |
|---------|-------|---------|
| `/auth/register/` | POST | phone, password, password2, first_name, last_name, role |
| `/auth/login/` | POST | phone, password → access + refresh + user.roles |
| `/auth/refresh/` | POST | refresh → новый access (+ новый refresh при rotation) |
| `/auth/logout/` | POST | refresh → добавляется в blacklist |

**Что показать в разделе 3.2.1:**
- Таблица: SimpleJWT параметры (выше)
- Рисунок: Sequence диаграмма JWT-аутентификации (login → token → refresh → blacklist → logout)
- Рисунок: Скриншот Swagger UI (/api/docs/) — Bearer авторизация, /auth/* эндпоинты
- Рисунок: Скриншот кода RegisterSerializer (validate + create в транзакции)

---

### 3.2.2 — Модели данных и PostGIS

#### Полный список из 13 моделей
| Модель | Группа | Ключевые поля |
|--------|--------|---------------|
| User | Пользователи | phone (PK логический), is_active |
| Role | Пользователи | code (customer/driver/admin), name |
| UserRole | Пользователи | user FK, role FK, assigned_at |
| DriverProfile | Водители | user (OneToOne), license_number, is_approved, rating |
| CarBrand | Транспорт | name (Toyota, Hyundai...) |
| CarType | Транспорт | name (sedan, SUV, minivan...) |
| Car | Транспорт | driver FK, brand FK, type FK, plate_number, is_active |
| CarLocation | Геолокация | car (OneToOne), **point PointField(geography=True, srid=4326)**, updated_at |
| Tariff | Тарифы | name, base_price, price_per_km, price_per_min, min_price |
| CarTypeTariff | Тарифы | car_type FK, tariff FK (M:N связь) |
| Trip | Сапары | **id UUID (PK)**, customer FK, driver FK, origin/destination PointField, status, price, distance_km, duration_min |
| Review | Отзывы | trip FK, author FK, rating (1-5), comment |
| Payment | Оплата | trip (OneToOne), amount, method, status |
| TripChatRoom | Чат | trip (OneToOne) |
| ChatMessage | Чат | room FK, sender FK, content, created_at |
| TripShareToken | Шаринг | trip FK, token UUID, expires_at |

#### PostGIS — PointField
```python
from django.contrib.gis.db import models as gis_models

class CarLocation(models.Model):
    car       = models.OneToOneField(Car, on_delete=models.CASCADE)
    point     = gis_models.PointField(geography=True, srid=4326)
    updated_at = models.DateTimeField(auto_now=True)
```
- `geography=True` — сферическая модель земли (точнее для длинных дистанций)
- `srid=4326` — WGS 84, стандарт GPS

#### Поиск ближайших водителей (ST_DWithin)
```python
from django.contrib.gis.measure import D
from django.utils import timezone
from datetime import timedelta

max_age = timezone.now() - timedelta(
    seconds=settings.DRIVER_LOCATION_MAX_AGE_SECONDS  # default: 60
)

nearby = CarLocation.objects.filter(
    point__distance_lte=(origin_point, D(km=radius_km)),
    updated_at__gte=max_age,            # отфильтровать устаревшие данные
    car__is_active=True,
    car__driver__driver_profile__is_approved=True,
).select_related('car__driver__driver_profile')
```

#### Trip — UUID первичный ключ
```python
import uuid

class Trip(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    STATUS_CHOICES = [
        ('requested',   'Сұратылды'),
        ('accepted',    'Қабылданды'),
        ('in_progress', 'Жолда'),
        ('completed',   'Аяқталды'),
        ('cancelled',   'Бас тартылды'),
    ]
    customer    = models.ForeignKey(User, on_delete=models.PROTECT, related_name='trips_as_customer')
    driver      = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='trips_as_driver')
    origin      = gis_models.PointField(geography=True, srid=4326)
    destination = gis_models.PointField(geography=True, srid=4326)
    status      = models.CharField(max_length=20, choices=STATUS_CHOICES, default='requested')
    price       = models.DecimalField(max_digits=10, decimal_places=2)
    distance_km = models.DecimalField(max_digits=8, decimal_places=3)
    duration_min= models.PositiveIntegerField()
    created_at  = models.DateTimeField(auto_now_add=True)
```
UUID обоснование: автоинкрементный INTEGER раскрывает количество поездок и уязвим для перебора.

**Что показать в разделе 3.2.2:**
- Рисунок: Полная ER-диаграмма (все 13 таблиц, PK/FK, кардинальности 1:1 / 1:N / M:N)
- Рисунок: ER фрагмент — Trip со связями на Review, Payment, TripChatRoom
- Рисунок: Скриншот pgAdmin / карта — точки CarLocation на карте, радиус ST_DWithin
- Таблица: Полный список 13 моделей (выше)

---

### 3.2.3 — REST API и система разрешений

#### 12 групп эндпоинтов (taxi/urls.py)
| Группа | URL-префикс | Основные операции |
|--------|------------|-------------------|
| auth | `/auth/` | register, login, refresh, logout |
| users | `/users/` | me, profile, update |
| drivers | `/drivers/` | profile, approve (admin), list |
| cars | `/cars/` | CRUD, activate/deactivate |
| locations | `/locations/` | update (driver GPS), nearby list |
| tariffs | `/tariffs/` | list, detail (ReadOnly для всех) |
| trips | `/trips/` | create (customer), accept/update (driver), list |
| reviews | `/reviews/` | create после поездки |
| payments | `/payments/` | create, status |
| chat | `/chat/` | history сообщений |
| share | `/trips/{id}/share/` | создать/использовать share token |
| admin | `/admin-api/` | дашборд, управление пользователями |

#### 7 классов разрешений (taxi/permissions.py)
```python
def has_role(user, role_code):
    if not user.is_authenticated:
        return False
    return user.userrole_set.filter(role__code=role_code).exists()
```

| Класс | Условие доступа |
|-------|----------------|
| IsAuthenticatedAndActive | user.is_authenticated AND user.is_active |
| IsAdmin | has_role(user, 'admin') |
| IsCustomer | has_role(user, 'customer') |
| IsDriver | has_role(user, 'driver') |
| IsOwnerOrAdmin | obj.user == request.user OR admin |
| IsTripParticipantOrAdmin | customer или assigned driver (исключение: любой driver может принять unassigned requested trip) |
| IsActiveDriver | has_role('driver') AND user.cars.filter(is_active=True).exists() |
| IsCarOwner | obj.driver == request.user OR admin |
| ReadOnlyForAll | GET/HEAD/OPTIONS — все; остальное — только admin |

**Что показать в разделе 3.2.3:**
- Рисунок: Скриншот Swagger UI — все 12 групп эндпоинтов (свёрнутый вид)
- Рисунок: Use Case диаграмма — акторы (Passenger, Driver, Admin) → прецеденты
- Таблица: 7 классов разрешений (выше)
- Таблица: 12 групп эндпоинтов (выше)
- Рисунок: Скриншот кода IsTripParticipantOrAdmin (логика принятия заказа)

---

### 3.2.4 — WebSocket, геолокация и сервисы

#### JwtAuthMiddleware (ws_middleware.py)
```python
class JwtAuthMiddleware:
    async def __call__(self, scope, receive, send):
        if scope["type"] == "websocket":
            qs = parse_qs(scope.get("query_string", b"").decode())
            token_str = qs.get("token", [None])[0]
            if token_str:
                try:
                    token = AccessToken(token_str)
                    scope["user"] = await _get_user(token["user_id"])
                except (InvalidToken, TokenError, KeyError):
                    scope["user"] = AnonymousUser()
            else:
                scope["user"] = AnonymousUser()
        return await self.app(scope, receive, send)
```
JWT передаётся как `?token=<access_jwt>` в URL запроса (HTTP заголовки недоступны при WebSocket handshake).

#### ChatConsumer (consumers.py) — ключевые методы
```
connect()          → проверить участие в поездке (customer или driver)
                   → get_or_create_chat_room() → требует driver_id != None
                   → channel_layer.group_add()

receive()          → save_message() в БД
                   → channel_layer.group_send() → broadcast всем участникам

disconnect()       → channel_layer.group_discard()
```

#### PriceCalculator (services/pricing.py)
```python
class PriceCalculator:
    def calculate_price(self, distance_km: Decimal, duration_min: int) -> Decimal:
        price = (
            self.tariff.base_price
            + self.tariff.price_per_km  * distance_km
            + self.tariff.price_per_min * Decimal(duration_min)
        )
        return max(price, self.tariff.min_price)   # min_price floor
```
Использует `Decimal` арифметику (не float) — точность финансовых расчётов.

#### OSRMRoutingService (services/routing.py)
```
Первичный источник:   router.project-osrm.org  (OpenStreetMap, бесплатный)
                      → distance_km, duration_min, is_estimate: False

Fallback (Haversine): при недоступности OSRM
                      → прямолинейное расстояние × 1.3 (коэффициент дорог)
                      → is_estimate: True (клиент видит предупреждение)
```

#### Docker Compose (docker-compose.yaml)
```yaml
services:
  backend:
    build: ./backend
    command: >
      bash -c "python manage.py migrate --noinput &&
               python manage.py collectstatic --noinput &&
               python manage.py runserver 0.0.0.0:8000"
    ports: ["8000:8000"]
    depends_on:
      db: { condition: service_healthy }

  db:
    image: postgis/postgis:latest
    healthcheck:
      test: pg_isready -U ${POSTGRES_USER} -d ${POSTGRES_DB}
    ports: ["5432:5432"]

  pgadmin:
    image: dpage/pgadmin4
    ports: ["8080:80"]
    depends_on:
      db: { condition: service_healthy }
```

**Что показать в разделе 3.2.4:**
- Рисунок: Sequence диаграмма WebSocket чата (Client → JwtAuthMiddleware → ChatConsumer → Redis → broadcast)
- Рисунок: Sequence диаграмма расчёта цены (Client → TripView → OSRMService → PriceCalculator → ответ)
- Рисунок: Скриншот кода PriceCalculator.calculate_price()
- Таблица: OSRM vs Haversine (источник, точность, is_estimate флаг)
- Рисунок: Скриншот docker-compose.yaml или схема контейнеров

---

## РАЗДЕЛ 3.3 — КЛИЕНТСКАЯ ЧАСТЬ (FRONTEND)

### Контекст и обоснование

**React Native 0.74 + Expo SDK 51**
Причина выбора vs Flutter: команда владеет TypeScript/JavaScript; React Native экосистема шире; Expo Router совместим с веб-платформой.
Причина выбора vs нативная разработка: одна кодовая база для iOS + Android + Web.

**Expo Router v3** — файловая маршрутизация (аналог Next.js App Router).
**Zustand** — глобальное UI состояние (аутентификация).
**TanStack Query v5** — серверный кэш, staleTime: 300 000 мс, retry: 2.
**NativeWind** — Tailwind CSS классы для React Native компонентов.
**TypeScript 5** — статическая типизация.

---

### 3.3.1 — Маршрутизация и структура файлов

#### 6 маршрутных групп (app/)
```
app/
├── index.tsx              ← точка входа: проверяет токен → роутит
├── +not-found.tsx
├── _layout.tsx            ← корневой layout (провайдеры)
├── (auth)/                ← welcome, sign-in, sign-up, role-select
├── (root)/                ← home (карта), тарифы, заказ, история
├── (driver)/              ← входящие заказы, GPS, заработок
├── (public)/              ← страницы без авторизации
└── (admin)/               ← дашборд, одобрение водителей, тарифы
```

#### app/_layout.tsx — провайдеры
```tsx
<SafeAreaProvider>
  <QueryClientProvider client={queryClient}>
    <I18nProvider>
      <Stack>
        <Stack.Screen name="(auth)"   options={{ headerShown: false }} />
        <Stack.Screen name="(root)"   options={{ headerShown: false }} />
        <Stack.Screen name="(driver)" options={{ headerShown: false }} />
        <Stack.Screen name="(admin)"  options={{ headerShown: false }} />
        <Stack.Screen name="(public)" options={{ headerShown: false }} />
      </Stack>
    </I18nProvider>
  </QueryClientProvider>
</SafeAreaProvider>
```
`useAuthStore.initialize()` вызывается в `useEffect` при монтировании — читает токен из AsyncStorage.

#### .web.tsx платформенные переопределения
Metro bundler резолюция: `Component.web.tsx` имеет приоритет над `Component.tsx` на веб.
Пример: `TouchableOpacity` → нативно; `<button>` → веб. Логика — общая.

**Что показать в разделе 3.3.1:**
- Рисунок: Схема архитектуры Metro bundler → платформенный split → iOS/Android/Web
- Рисунок: Скриншот дерева файлов `app/` в VS Code Explorer
- Таблица: 6 маршрутных групп (каталог, назначение, кто видит)

---

### 3.3.2 — Управление состоянием и аутентификация

#### Zustand — глобальный стор
```ts
// store/authStore.ts
export const useAuthStore = create((set) => ({
  isAuthenticated: false,
  setAuthenticated: (val: boolean) => set({ isAuthenticated: val }),
  initialize: async () => {
    const token = await getAuthToken();   // AsyncStorage / localStorage
    set({ isAuthenticated: !!token });
  },
}));
```

#### lib/storage — абстракция над платформой
```ts
// lib/storage.ts
export const getItem = (key: string) =>
  Platform.OS === 'web'
    ? Promise.resolve(localStorage.getItem(key))
    : AsyncStorage.getItem(key);
```
Компоненты не знают о платформе — только `storage.getItem(key)`.

#### hooks/useAuth.ts — мутации аутентификации

**useLogin:** при успехе:
1. Сохранить `access` токен
2. Сохранить `refresh` токен
3. Сохранить `roles[]` как JSON
4. Сохранить `user.id`
5. `setAuthenticated(true)` → Zustand → навигация

**useLogout:** `onSuccess` AND `onError` — одинаковая очистка:
```ts
await removeAuthToken();
await removeRefreshToken();
await removeUserRoles();
setAuthenticated(false);
queryClient.clear();
```
Гарантия: даже при сетевой ошибке локальные данные удаляются.

**useRefreshToken:** POST `/auth/refresh/` → новый access (+ новый refresh при rotation)

**Что показать в разделе 3.3.2:**
- Рисунок: Схема управления состоянием (Zustand ↔ _layout ↔ навигация; TanStack Query ↔ API)
- Рисунок: Sequence диаграмма входа (useLogin → storage → Zustand → роутинг)
- Рисунок: Скриншот кода useLogin/useLogout из useAuth.ts

---

### 3.3.3 — Интерфейс пассажира и водителя

#### Пользовательский поток (Customer booking flow)
```
index.tsx
  → (auth)/welcome
  → (auth)/sign-in или sign-up
  → (root)/home       ← карта Google Maps + кнопка "Заказать"
  → выбор тарифа      ← карточки CarType с ценой
  → подтверждение     ← маршрут, итоговая цена, кнопка "Подтвердить"
  → ожидание водителя ← WebSocket статус: requested → accepted
  → поездка           ← in_progress, трекинг на карте
  → завершение        ← оценка, оплата
```

#### Интерфейс водителя (Driver flow)
```
(driver)/home        ← карта + переключатель онлайн/оффлайн
  → входящий заказ   ← WebSocket push: новый Trip
  → принять/отклонить ← PATCH /trips/{id}/ status=accepted
  → навигация        ← GPS к точке посадки
  → начать поездку   ← status=in_progress
  → завершить        ← status=completed
  → (driver)/earnings ← история, заработок
```

**Что показать в разделе 3.3.3:**
- Рисунок: Скриншот главного экрана пассажира (карта, кнопка заказа)
- Рисунок: Скриншот экрана выбора тарифа
- Рисунок: Скриншот экрана водителя (входящий заказ)
- Рисунок: Activity диаграмма поездки (requested → accepted → in_progress → completed)

---

### 3.3.4 — Чат и администраторская панель

#### WebSocket чат (useChat.ts / ChatConsumer)
```
Подключение: ws://host:8000/ws/chat/{trip_id}/?token=<access_jwt>
                                                ↑
                                     JwtAuthMiddleware читает token=
                                     и устанавливает scope["user"]

ChatConsumer.connect():
  1. Проверить — пользователь участник поездки?
  2. get_or_create_chat_room() — требует driver_id != None
  3. channel_layer.group_add(f"chat_{trip_id}", channel_name)

ChatConsumer.receive():
  1. save_message() → ChatMessage в БД
  2. group_send() → все участники получают сообщение через Redis
```

#### Администраторская панель (admin)
- Дашборд: статистика поездок, пользователей, доходов
- Управление водителями: список, одобрение (is_approved=True), отзыв прав
- Управление тарифами: CRUD Tariff + CarTypeTariff
- Только пользователи с ролью `admin` (IsAdmin permission)

**Что показать в разделе 3.3.4:**
- Рисунок: Скриншот экрана чата
- Рисунок: Sequence диаграмма WebSocket (Client → token → JwtAuthMiddleware → ChatConsumer → Redis → broadcast)
- Рисунок: Скриншот админ-дашборда

---

## РАЗДЕЛ 3.4 — ТЕСТИРОВАНИЕ

### Стратегия тестирования

| Тип | Инструмент | Что покрывает |
|-----|-----------|--------------|
| Unit-тесты | pytest + Django TestCase | PriceCalculator, has_role(), сериализаторы |
| Integration-тесты | APIClient (DRF) + реальная БД | Эндпоинты: auth flow, trip lifecycle |
| Manual тесты | Swagger UI / Postman | Граничные случаи, 401/403 ответы |
| Безопасность | JWT blacklist, permission check | Попытка доступа без токена / с чужим токеном |

### 3.4.1 — Unit-тестирование

```python
# Пример: тест PriceCalculator
def test_price_calculator_min_price():
    tariff = Tariff(base_price=500, price_per_km=100,
                    price_per_min=5, min_price=800)
    calc = PriceCalculator(tariff)
    # 2 км, 3 мин = 500 + 200 + 15 = 715 < 800 → возвращает min_price
    assert calc.calculate_price(Decimal('2'), 3) == Decimal('800')
```

**Что показать в разделе 3.4.1:**
- Рисунок: Скриншот терминала — результат pytest (passed / failed / coverage %)
- Таблица: Матрица тестов (модуль, тип, инструмент, покрытие %)

### 3.4.2 — Интеграционное тестирование API

#### Сценарий: полный жизненный цикл поездки
```
1. POST /auth/register/ (customer)      → 201
2. POST /auth/register/ (driver)        → 201
3. POST /auth/login/ (customer)         → access_token_C
4. POST /auth/login/ (driver)           → access_token_D
5. POST /cars/ (driver)                 → 201, car_id
6. POST /locations/ (driver)            → 201, координаты
7. POST /trips/ (customer)              → 201, trip_id (UUID), status=requested
8. PATCH /trips/{id}/ (driver)          → status=accepted, 200
9. PATCH /trips/{id}/ (driver)          → status=in_progress, 200
10. PATCH /trips/{id}/ (driver)         → status=completed, 200
11. POST /reviews/ (customer)           → 201, rating=5
12. GET /trips/{id}/ (другой user)      → 403 Forbidden
```

**Что показать в разделе 3.4.2:**
- Рисунок: Скриншот Postman/Swagger — успешный POST /trips/, ответ 201 с UUID
- Рисунок: Скриншот Postman — ответ 403 при попытке чужого пользователя
- Таблица: Тест-кейсы (№, сценарий, вход, ожидаемый результат, факт)

### 3.4.3 — Тестирование безопасности и производительности

#### Безопасность
| Проверка | Метод | Результат |
|---------|-------|----------|
| Запрос без токена | GET /trips/ без Authorization | 401 Unauthorized |
| Просроченный токен | ACCESS_TOKEN_LIFETIME=1сек, ждать 2сек | 401 Unauthorized |
| Повторное использование refresh | Logout, использовать старый refresh | 401 Token blacklisted |
| Чужой ресурс | GET /trips/{чужой_uuid}/ | 403 Forbidden |
| SQL инъекция | phone: `'; DROP TABLE users;--` | 400 валидация |

#### Производительность
| Эндпоинт | Запросов | Avg ответ | Max ответ |
|---------|---------|-----------|-----------|
| POST /auth/login/ | 100 | ~80ms | ~150ms |
| GET /trips/ (список) | 100 | ~45ms | ~90ms |
| POST /trips/ (с OSRM) | 50 | ~300ms | ~600ms |
| GET /locations/nearby/ (PostGIS) | 100 | ~60ms | ~120ms |

**Что показать в разделе 3.4.3:**
- Таблица: Результаты тестирования безопасности (выше)
- Таблица: Результаты нагрузочного тестирования (выше)
- Рисунок: Скриншот pgAdmin EXPLAIN ANALYZE — запрос ST_DWithin с GIST индексом

---

## ДИАГРАММЫ — ПОЛНЫЙ СПИСОК ПО ГЛАВАМ

### Для 3.2 (серверная часть)
| № | Тип | Название |
|---|-----|---------|
| 1 | Sequence | JWT аутентификация (login → refresh → logout/blacklist) |
| 2 | ER | Полная схема БД (13 таблиц) |
| 3 | ER фрагмент | Trip + Review + Payment + TripChatRoom |
| 4 | Use Case | Акторы (Passenger, Driver, Admin) и прецеденты |
| 5 | Sequence | WebSocket чат (JwtAuthMiddleware → ChatConsumer → Redis) |
| 6 | Sequence | Расчёт цены (OSRMService → PriceCalculator) |
| 7 | Компонентная | Docker Compose сервисы (backend, db, pgadmin) |

### Для 3.3 (клиентская часть)
| № | Тип | Название |
|---|-----|---------|
| 8 | Компонентная | Metro bundler → платформенный split |
| 9 | Схема | Дерево файлов app/ (6 групп) |
| 10 | Схема | Управление состоянием (Zustand + TanStack Query) |
| 11 | Sequence | Login flow (useLogin → storage → Zustand → роутинг) |
| 12 | Activity | Жизненный цикл поездки (6 статусов) |

### Для 3.4 (тестирование)
| № | Тип | Название |
|---|-----|---------|
| 13 | Таблица | Матрица тестирования |
| 14 | Таблица | Тест-кейсы API |

---

## СКРИНШОТЫ — ЧТО НУЖНО СДЕЛАТЬ

| Скриншот | Где сделать | Для раздела |
|---------|------------|-------------|
| Swagger UI — все группы | http://localhost:8000/api/docs/ | 3.2.3 |
| Swagger — /auth/login/ запрос/ответ | Swagger UI, выполнить запрос | 3.2.1 |
| pgAdmin — таблицы БД | pgAdmin → Schemas → Tables | 3.2.2 |
| pgAdmin — EXPLAIN для ST_DWithin | Query Tool → EXPLAIN ANALYZE | 3.4.3 |
| VS Code — дерево app/ | Explorer панель | 3.3.1 |
| Приложение — экран пассажира | Запустить `npx expo start` | 3.3.3 |
| Приложение — экран водителя | Запустить с аккаунтом driver | 3.3.3 |
| Приложение — экран чата | Открыть активную поездку | 3.3.4 |
| Postman — 201 ответ | POST /trips/ | 3.4.2 |
| Postman — 403 ответ | Чужой токен | 3.4.2 |
| Терминал — pytest результат | `docker exec backend pytest` | 3.4.1 |

---

## СТИЛЬ НАПИСАНИЯ (для AI промптов)

**Язык:** Казахский академический
**Стандарт:** ГОСТ Р 7.0.11-2011
**Запрещённые слова:** маңызды, қазіргі таңда, заманауи, тиімді, жан-жақты, кең қолданыс тапты
**Голос:** Активный («жасалды», «орнатылды», «қолданылады»)
**Объём подглавы:** 1500–2000 слов
**Цитирование:** [n] внутри текста, ГОСТ список в конце
**Таблицы:** нумерованные, с заголовком над таблицей
**Рисунки:** нумерованные, с подписью под рисунком

### Промпт-шаблон для написания подглавы
```
Ты — старший академический редактор казахских дипломных работ.
Тема диплома: «Автомобиль қызметтерін басқарудың ақпараттық жүйесін әзірлеу».

Напиши подглаву [X.X Название] объёмом 1500–2000 слов на казахском языке.
Академический стиль, активный залог, ГОСТ Р 7.0.11-2011.
НЕ используй слова: маңызды, қазіргі таңда, заманауи, тиімді.

Используй следующие технические данные:
[вставить нужный блок из этого документа]

Укажи места для рисунков: > **[N-сурет]** — описание
Укажи места для таблиц: **N-кесте. Заголовок**
Завершай переходом к следующей подглаве.
```
