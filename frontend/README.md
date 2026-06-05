# Donatly — Вебзастосунок (Frontend)

Єдиний **вебзастосунок** платформи **Donatly** (мобільну частину виведено з
проєкту). Підтримує **три ролі** з окремими обліковими записами, логінами та
наборами функцій: **Благодійник (Donor)**, **Представник організації
(OrganizationRep)** та **Адміністратор (Admin)**.

## Технологічний стек

- **React 18** + **TypeScript**
- **Vite** — збірка та dev-сервер
- **Tailwind CSS** — стилізація
- **React Router** — маршрутизація
- **Google Identity Services** — вхід через Google (опційно)
- Взаємодія з **ASP.NET API** (`backend/`) через типізований fetch-клієнт

## Ролі та функції

Роль обирається під час **реєстрації** (Благодійник або Представник організації).
**Адміністратор не реєструється** — його акаунт створено заздалегідь у БД.
Після входу кожна роль бачить власну навігацію та маршрути.

### Благодійник (Donor)

| Розділ | Опис |
| --- | --- |
| **Огляд** | Зведення: задоновано загалом, кількість донатів, рекомендовані збори |
| **Збори** | Каталог активних зборів, пошук і сортування, **донат** через платіжну форму (банківська заглушка / sandbox) |
| **AI-помічник** | Чат із рекомендаціями, куди задонатити (Google Gemini + евристичний фолбек) |
| **Петиції** | Перегляд, **голосування** (один голос на петицію), **створення** петицій |
| **Історія донатів** | Усі власні внески зі статусом обробки |

### Представник організації (OrganizationRep)

| Розділ | Опис |
| --- | --- |
| **Огляд** | Статистика **власних** зборів |
| **Мої збори** | Створення, редагування, видалення власних зборів, продовження терміну, поширення в соцмережі |

> Новий збір створюється зі статусом «На розгляді» і публікується після перевірки
> адміністратором (BR-9).

### Адміністратор (Admin)

| Розділ | Опис |
| --- | --- |
| **Огляд** | Системна аналітика: усі збори, розподіл за статусами, загальний прогрес |
| **Модерація зборів** | Підтвердження `Pending → Active`, відхилення, завершення, маркування держпідтримки, видалення |
| **Модерація петицій** | Зміна статусу, видалення неприйнятного вмісту |
| **Користувачі** | Перелік усіх акаунтів, **блокування / розблокування** доступу |

## Швидкий старт

```bash
# backend
cd backend/DonatlyAPI
dotnet run            # створює БД і сід (адмін, представник, донор)

# frontend (в іншому терміналі)
cd frontend
npm install
npm run dev           # http://localhost:5173
```

CORS на бекенді дозволяє будь-яке джерело для розробки. Базовий URL API — у
`.env` (`VITE_API_BASE_URL`, типово `http://localhost:5029/api`).

### Облікові записи (зі `DbSeeder`)

| Роль | Email | Пароль |
| --- | --- | --- |
| **Адміністратор** (заздалегідь створений) | `admin@donatly.com` | `Admin123!` |
| Представник організації | `org@donatly.com` | `password` |
| Благодійник | `donor@donatly.com` | `password` |

Нових благодійників і представників організацій можна створювати через сторінку
**реєстрації**.

## Безкоштовні інтеграції (опційні)

Обидві працюють **безкоштовно** і вмикаються лише після додавання ключів.
Без ключів застосунок повністю функціональний:
- **AI-помічник** автоматично переходить на евристичні рекомендації;
- **кнопка Google** просто не показується (лишається вхід за email/паролем).

### 1. Google-вхід (Google Identity Services — безкоштовно)

1. У [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
   створіть **OAuth client ID → Web application**.
2. До **Authorized JavaScript origins** додайте `http://localhost:5173`.
3. Скопіюйте **Client ID** у два місця:
   - `frontend/.env` → `VITE_GOOGLE_CLIENT_ID=...`
   - `backend/DonatlyAPI/appsettings.Development.json` → `Google:ClientId` (для перевірки токена).

### 2. AI-помічник (Google Gemini — безкоштовний tier)

1. Отримайте безкоштовний ключ у [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Впишіть його на бекенді:
   `backend/DonatlyAPI/appsettings.Development.json` → `AI:Gemini:ApiKey`
   (модель типово `gemini-1.5-flash`).

Приклад `backend/DonatlyAPI/appsettings.Development.json`:

```json
{
  "Google": { "ClientId": "ВАШ_GOOGLE_CLIENT_ID.apps.googleusercontent.com" },
  "AI": { "Gemini": { "ApiKey": "ВАШ_GEMINI_KEY", "Model": "gemini-1.5-flash" } }
}
```

> Не комітьте реальні ключі. `appsettings.Development.json` призначений для
> локальних значень.

## Конфігурація фронтенду

```bash
cp .env.example .env
```

```
VITE_API_BASE_URL=http://localhost:5029/api
VITE_GOOGLE_CLIENT_ID=            # порожньо = кнопка Google прихована
```

## Скрипти

| Команда | Дія |
| --- | --- |
| `npm run dev` | Запуск dev-сервера (HMR) |
| `npm run build` | Перевірка типів (`tsc`) і production-збірка у `dist/` |
| `npm run preview` | Локальний перегляд production-збірки |
| `npm run lint` | Перевірка ESLint |

## Структура проєкту

```
frontend/src/
├── api/                 # client, auth, initiatives, petitions, donations, ai
├── components/
│   ├── auth/            # GoogleSignInButton
│   ├── donor/           # DonateModal (платіжна заглушка)
│   ├── initiatives/     # InitiativeFormModal, ShareMenu
│   ├── petitions/       # CreatePetitionModal
│   ├── layout/          # AppLayout, Sidebar (per-role), Header
│   ├── ui/              # Modal, Alert, ProgressBar, StatCard, Badge, Icons тощо
│   └── ProtectedRoute.tsx
├── contexts/            # AuthContext (isAdmin / isOrgRep / isDonor, loginWithGoogle)
├── lib/                 # format.ts
├── pages/
│   ├── donor/           # DonorDashboard, BrowseInitiatives, DonationHistory, DonorPetitions, AiAssistant
│   ├── orgrep/          # OrgRepDashboard, MyInitiatives, InitiativeDetail
│   ├── admin/           # AdminDashboard, InitiativeModeration, PetitionModeration, UserManagement
│   ├── LoginPage.tsx    # email/пароль + Google
│   ├── RegisterPage.tsx # вибір ролі: Донор / Організація
│   └── NotFoundPage.tsx
├── types/               # дзеркало DTO бекенду
└── App.tsx              # окремі дерева маршрутів для кожної ролі
```

## Відповідність API

- `POST /api/users/login`
- `POST /api/users/register/donor`, `POST /api/users/register/org-representative`
- `POST /api/users/google` — вхід через Google (перевірка ID-токена на бекенді)
- `GET /api/users`, `PUT /api/users/{id}/active` — керування користувачами (адмін)
- `GET/POST /api/initiatives`, `GET/PUT/DELETE /api/initiatives/{id}`, `GET /api/initiatives/active`
- `POST /api/donations`, `GET /api/donations/donor/{donorId}` — донат + історія
- `GET/POST /api/petitions`, `GET/PUT/DELETE /api/petitions/{id}`, `POST /api/petitions/{id}/vote`
- `POST /api/ai/recommend` — AI-рекомендації донору

### Зміни в backend для цього етапу

- Прибрано self-реєстрацію адміна (`/register/admin`); адмін **сідиться** у `DbSeeder`
  (`admin@donatly.com` / `Admin123!`).
- Додано `POST /api/users/google` (перевірка токена через `Google.Apis.Auth`).
- Додано керування користувачами: `GET /api/users`, `PUT /api/users/{id}/active`
  (+ перевірка `IsActive` під час логіну).
- Додано історію донатів: `GET /api/donations/donor/{donorId}`.
- Додано AI-сервіс `POST /api/ai/recommend` (Gemini + евристичний фолбек).
- Конфіг: `Google:ClientId`, `AI:Gemini:ApiKey`, `AI:Gemini:Model` в `appsettings`.
