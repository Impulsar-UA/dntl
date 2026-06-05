# Donatly — Вебпанель управління (Frontend)

Вебзастосунок платформи **Donatly** для **адміністраторів** та **представників
організацій**. Дозволяє керувати благодійними зборами (ініціативами) та петиціями.

> ℹ️ Функціонал для **донорів** (донати, голосування за петиції) реалізується в
> **мобільному застосунку** і навмисно **відсутній** у цій вебпанелі.

## Технологічний стек

- **React 18** + **TypeScript**
- **Vite** — збірка та dev-сервер
- **Tailwind CSS** — стилізація
- **React Router** — маршрутизація
- Взаємодія з **ASP.NET API** (`backend/`) через типізований fetch-клієнт

## Розмежування ролей

Вебпанель має **дві окремі ролі** з різними обліковими записами, логінами та
наборами функцій (відповідно до Vision & Scope §2.2, MF-1 – MF-18). Роль
обирається під час **реєстрації** (адміністратор або представник організації).
Після входу кожна роль бачить **власний інтерфейс** (своя навігація, свої
сторінки, окремі маршрути).

### Представник організації (Organization Representative) — MF-10 … MF-18

| Розділ | Опис |
| --- | --- |
| **Огляд** | Статистика **власних** зборів: кількість, активні, на розгляді, завершені, зібрана сума |
| **Мої збори** | Список лише власних зборів, **створення**, редагування, видалення (MF-10) |
| **Деталі збору** | Прогрес збору в реальному часі (MF-11), **продовження терміну** (MF-13), **поширення в соцмережі** Facebook / X / Threads (MF-15) |

> Новий збір створюється зі статусом «На розгляді» і публікується лише після
> перевірки адміністратором (BR-9). Представник **не** може сам змінювати статус
> чи маркувати держпідтримку.

### Адміністратор (Administrator) — MF-1 … MF-9

| Розділ | Опис |
| --- | --- |
| **Огляд** | Системна аналітика (MF-4): усі збори, розподіл за статусами, загальний прогрес, кількість петицій |
| **Модерація зборів** | Усі збори платформи: **підтвердження** `Pending → Active` (MF-2, BR-9), відхилення, завершення (MF-5), **маркування держпідтримки** (MF-6), видалення |
| **Модерація петицій** | Усі петиції: зміна статусу, **видалення неприйнятного вмісту** (MF-8) |

> Адміністратор **не створює** збори — створення зборів є функцією представника
> організації.

### Спільне

| Розділ | Опис |
| --- | --- |
| **Автентифікація** | Вхід для обох ролей; реєстрація з **вибором ролі** (адмін / представник організації) |

> ℹ️ Функціонал для **донорів** (донати, голосування за петиції, реєстрація
> донора) реалізується в **мобільному застосунку** і навмисно **відсутній** у
> цій вебпанелі. Донорам вхід у вебпанель заблоковано.

## Швидкий старт

```bash
cd frontend
npm install
npm run dev
```

Застосунок відкриється на http://localhost:5173.

### Передумова: запущений backend

Фронтенд очікує API за адресою `http://localhost:5029/api`. Запустіть backend:

```bash
cd backend/DonatlyAPI
dotnet run
```

(За замовчуванням профіль `http` слухає `http://localhost:5029` — див.
`backend/DonatlyAPI/Properties/launchSettings.json`. CORS у backend дозволяє
будь-яке джерело для розробки.)

### Тестові облікові записи (зі `DbSeeder`)

| Роль | Email | Пароль |
| --- | --- | --- |
| Представник організації | `org@donatly.com` | `password` |

> Донорський акаунт `donor@donatly.com` існує, але вхід через вебпанель для
> донорів **заблоковано** (донори користуються мобільним застосунком).
>
> Окремого адміністратора в сидері немає — створіть його через сторінку
> **реєстрації**, обравши роль «Адміністратор».

## Конфігурація

Базовий URL API задається змінною середовища `VITE_API_BASE_URL`.

```bash
cp .env.example .env
# за потреби змініть значення в .env
```

```
VITE_API_BASE_URL=http://localhost:5029/api
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
frontend/
├── public/                  # Статичні файли (favicon)
├── src/
│   ├── api/                 # Типізований API-клієнт (client, auth, initiatives, petitions)
│   ├── components/
│   │   ├── initiatives/     # InitiativeFormModal, ShareMenu (соцмережі)
│   │   ├── layout/          # AppLayout, Sidebar (навігація per-role), Header
│   │   ├── ui/              # Кнопки, Modal, Alert, ProgressBar, StatCard, Icons тощо
│   │   └── ProtectedRoute.tsx
│   ├── contexts/            # AuthContext (сесія + ролі isAdmin/isOrgRep)
│   ├── lib/                 # format.ts (валюта, дати, статуси)
│   ├── pages/
│   │   ├── orgrep/          # OrgRepDashboard, MyInitiativesPage, InitiativeDetailPage
│   │   ├── admin/           # AdminDashboard, InitiativeModerationPage, PetitionModerationPage
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx # реєстрація з вибором ролі
│   │   └── NotFoundPage.tsx
│   ├── types/               # TypeScript-типи, дзеркало DTO бекенду
│   ├── App.tsx              # Маршрути (окремі дерева для admin / orgrep)
│   ├── main.tsx             # Точка входу
│   └── index.css            # Tailwind + базові компонентні класи
├── .env.example
├── index.html
├── tailwind.config.js
├── tsconfig*.json
└── vite.config.ts
```

## Відповідність API

Типи в `src/types/index.ts` віддзеркалюють DTO з
`backend/Donatly.Application/DTOs`. Ендпоінти, що використовуються:

- `POST /api/users/login`
- `POST /api/users/register/org-representative` (реєстрація представника організації)
- `POST /api/users/register/admin` (реєстрація адміністратора)
- `GET/POST /api/initiatives`, `GET/PUT/DELETE /api/initiatives/{id}`, `GET /api/initiatives/active`
- `GET/POST /api/petitions`, `GET/PUT/DELETE /api/petitions/{id}`

> Ендпоінти `POST /api/donations` та `POST /api/petitions/{id}/vote` належать
> донорському (мобільному) функціоналу і тут **не використовуються**.

> **Зміни в backend для цього завдання:** додано `POST /api/users/register/admin`
> (`RegisterAdminDto`, `UserService.RegisterAdminAsync`), а до `UpdateInitiativeDto`
> додано поле `IsGovernmentSupported` для маркування держпідтримки адміністратором (MF-6).
