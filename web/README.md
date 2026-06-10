# AI Stock Trend — Web Dashboard

Web admin panel for the **AI-Based Stock Trend Prediction** platform. Built with **React 19 + Vite 8 + TypeScript**, powering three role-specific dashboards (USER, STAFF, ADMIN) for HOSE/VN30 stock monitoring and data pipeline management.

> **Read this first.** Then consult the companion docs in `AI_Stock_Trend_Prediction_Docs/`:
> - `FE/WEB_DEV_RULES.md` — strict architecture, reuse-first policy, shadcn-first
> - `FE/WEB_DESIGN.md` — design system, colors, typography
> - `01-project-overview.md` — project scope, MVP direction, data philosophy
> - `02-system-architecture-techstack.md` — full tech stack
> - `03-erd.md` — database schema and dimension/fact model
> - `04-project-structure.md` — monorepo structure

---

## Quick Start

```bash
cd FE_AI_Stock_Trend_Prediction/web
npm install
npm run dev
```

### Environment

Create `.env` in the `web/` root:

```env
VITE_API_BASE_URL=https://your-backend-api.com/api
```

---

## Architecture

### Component Tree

```
ThemeProvider (theme-provider.tsx)
└── AuthProvider (providers/AuthProvider.tsx)
    └── BrowserRouter
        └── AppRoutes (routes/AppRoutes.tsx)
            ├── /                 → LandingPage
            ├── /login            → LoginPage
            ├── /register         → Register
            ├── /forgot-password  → ForgotPassword
            ├── USER_ROUTES       → RequireAuth(role=USER) → UserLayout
            ├── STAFF_ROUTES      → RequireAuth(role=STAFF) → StaffLayout
            ├── ADMIN_ROUTES      → RequireAuth(role=ADMIN) → AdminLayout
            ├── /nothing-here     → NothingHere
            └── *                 → redirect to /nothing-here
        └── Toaster (sonner)
```

### Role System

Three distinct user roles with separate layouts and route trees:

| Role | Base Path | Layout | Purpose |
|---|---|---|---|
| **USER** | `/` | `UserLayout` | Stock browsing, watchlist, alerts, portfolio |
| **STAFF** | `/staff` | `StaffLayout` | Data pipeline: crawl jobs, ETL monitor, data validation |
| **ADMIN** | `/admin` | `AdminLayout` | System administration: users, stocks, market coverage |

Routing helpers in `lib/role-routes.ts`:
- `getDefaultHomeRouteByRole(role)` — returns `/dashboard`, `/staff/dashboard`, or `/admin/dashboard`
- `getProfileRouteByRole(role)` — returns `/profile`, `/staff/profile`, or `/admin/profile`
- `getSettingsRouteByRole(role)` — returns `/settings`, `/staff/settings`, or `/admin/settings`

---

## Project Structure

```
web/
├── index.html
├── vite.config.ts                  # Vite 8 + React + path aliases (@/ → src/)
├── tsconfig.json                   # Path aliases: @/ → src/
├── package.json                    # React 19, Vite 8, TypeScript 6
├── tailwind.config.js              # (if present, legacy; v4 uses CSS)
│
├── public/
│
└── src/
    ├── main.tsx                    # Entry: renders App
    ├── App.tsx                     # Root: AuthProvider → BrowserRouter → AppRoutes → Toaster
    ├── index.css                   # Tailwind v4 + shadcn CSS variables + Geist font + dark theme vars
    │
    ├── components/
    │   ├── theme-provider.tsx      # Dark theme provider (next-themes pattern)
    │   ├── topbar/                 # Shared top navigation bar
    │   │   ├── index.tsx           # Topbar container
    │   │   ├── BrandLogo.tsx       # Logo + app name
    │   │   ├── SearchInput.tsx     # Stock search input
    │   │   ├── NotificationIcon.tsx # Notification bell icon
    │   │   └── UserMenu.tsx        # User dropdown (profile, settings, logout)
    │   ├── admin-shell/            # Admin layout sidebar + shell
    │   ├── staff-shell/            # Staff layout sidebar + shell
    │   └── ui/                     # shadcn primitives (see §UI Components below)
    │
    ├── layouts/
    │   ├── UserLayout.tsx          # Sidebar + Topbar + <Outlet/> for USER routes
    │   ├── StaffLayout.tsx         # Staff shell + Topbar for STAFF routes
    │   ├── AdminLayout.tsx         # Admin shell + Topbar for ADMIN routes
    │   ├── user-layout.css
    │   ├── staff-layout.css
    │   └── admin-layout.css
    │
    ├── pages/                      # Page components (one folder per page)
    │   ├── LandingPage/            # Public landing / marketing page
    │   ├── LoginPage/              # Login form
    │   ├── Register/               # Registration form
    │   ├── ForgotPassword/         # Password reset request
    │   ├── UserDashboard/          # USER main dashboard
    │   ├── UserProfilePage/        # Profile view & edit
    │   ├── StockListPage/          # Stock list with search
    │   ├── StockDetailPage/        # Individual stock details + charts
    │   ├── WatchlistPage/          # USER watchlist management
    │   ├── AlertsPage/             # USER alerts
    │   ├── HistoricalAnalysisPage/ # Historical chart analysis
    │   ├── ComparisonPage/         # Side-by-side stock comparison
    │   ├── SettingsPage/           # User settings
    │   ├── StaffDashboardPage/     # STAFF main dashboard
    │   ├── CrawlJobsPage/          # STAFF: crawl job management
    │   ├── CrawlLogsPage/          # STAFF: crawl execution logs
    │   ├── DataSourcesPage/        # STAFF: data source management
    │   ├── DataValidationPage/     # STAFF: data quality validation
    │   ├── EtlMonitorPage/         # STAFF: ETL pipeline monitoring
    │   ├── ImportHistoryPage/      # STAFF: import history
    │   ├── StockDataMonitorPage/   # STAFF: stock data monitoring
    │   ├── Admin/                  # ADMIN: user management, stock management, system
    │   ├── UserPlaceholderPage/    # Placeholder for incomplete features
    │   └── NothingHere/            # 404 / access denied
    │
    ├── routes/
    │   ├── AppRoutes.tsx           # Route tree assembly (see §Routing)
    │   ├── layoutRoutes.tsx        # USER_ROUTES, STAFF_ROUTES, ADMIN_ROUTES arrays
    │   ├── RequireAuth.tsx         # Auth guard + role check component
    │   └── renderProtectedLayoutRoute.tsx # Route → Layout → RequireAuth wrapper
    │
    ├── providers/
    │   └── AuthProvider.tsx        # Auth context provider (wraps useAuthStore)
    │
    ├── services/
    │   ├── auth.service.ts         # Auth API: login, register, logout, refresh, change-password
    │   └── (apiClient.ts)          # Axios instance + refresh interceptor (inside auth.service.ts)
    │
    ├── stores/
    │   └── auth.store.ts           # Zustand: accessToken, refreshToken, user, isAuthenticated, signOut
    │
    ├── types/                      # Shared TS type definitions
    ├── shared/                     # Shared utilities (if any)
    └── lib/
        ├── role-routes.ts          # Route helpers by role
        └── utils.ts                # cn() helper using clsx + tailwind-merge
```

---

## UI Components (shadcn-first policy)

All UI primitives live in `src/components/ui/` and follow the shadcn pattern.

### Currently available:

| Component | File | Purpose |
|---|---|---|
| `Button` | `ui/button.tsx` | Multi-variant button (default, destructive, outline, secondary, ghost, link, sizes) |
| `Input` | `ui/input.tsx` | Form input with error state |
| `Avatar` | `ui/avatar.tsx` | User avatar with fallback |
| `Badge` | `ui/badge.tsx` | Inline status indicator (default, secondary, destructive, outline) |
| `Dialog` | `ui/dialog.tsx` | Modal dialog overlay |
| `Sonner` | `ui/sonner.tsx` | Toast notification system (rendered in App.tsx) |
| `Tooltip` (planned) | | |
| `DropdownMenu` (planned) | | |

### Styling Rules

- **Use `cn()`** from `lib/utils.ts` for class merging: `cn("base-class", variant && "variant-class")`
- All CSS via Tailwind v4 utility classes + CSS variables from `index.css`
- No inline styles, no CSS modules (Tailwind-first approach)
- Dark theme via `.dark` class on `<html>` — toggled by `theme-provider.tsx`
- Font: **Geist Variable** via `@fontsource-variable/geist`

### Design Tokens (defined in `index.css`)

```
Background:    oklch(0.145 0 0)      # dark
Foreground:    oklch(0.985 0 0)      # light text
Primary:       oklch(0.205 0 0)      # brand
Card:          oklch(0.205 0 0)      # surface
Border:        oklch(0.269 0 0)      # subtle borders
Muted:         oklch(0.269 0 0)      # muted backgrounds
Destructive:   oklch(0.577 0.245 27.325)  # red
Radius:        0.625rem              # base border-radius (scaled via --radius-*)
```

---

## Routing Architecture

### Route Definition

Routes are defined as arrays in `layoutRoutes.tsx`:

```ts
export const USER_ROUTES: LayoutRoute[] = [
  { path: "/dashboard", element: <UserDashboard /> },
  { path: "/profile", element: <UserProfilePage /> },
  { path: "/stocks/:symbol", element: <StockDetailPage /> },
  { path: "/watchlist", element: <WatchlistPage /> },
  // ... etc
]
```

### Protected Route Wrapping

`renderProtectedLayoutRoute()` wraps each route with:

```
RequireAuth(role)
  → Layout (UserLayout | StaffLayout | AdminLayout)
    → route.element
```

### Auth Guard (`RequireAuth.tsx`)
- If not authenticated → redirect to `/login` with `state.from` for post-login redirect
- If role mismatch → redirect to `/nothing-here`
- Otherwise → render children

---

## Auth System

### Layer Architecture

```
LoginPage
  → calls auth.service.ts login()
    → Axios POST /api/auth/login
    → saves tokens to localStorage/sessionStorage (based on "remember me")
    → updates useAuthStore via setSession()

App startup
  → AuthProvider reads useAuthStore initialState
  → useAuthStore constructor reads persisted session via readAuthSession()
  → isAuthenticated becomes true/false based on token presence
```

### Token Storage
- `"remember me"` checked → `localStorage`, else `sessionStorage`
- Key: `"auth"` — stores `{ accessToken, refreshToken, user }`
- Event listener on `"auth-session-cleared"` syncs across tabs

### Refresh Token Flow
- `authenticatedRequest()` in `auth.service.ts` wraps Axios calls
- On 401 → calls `/api/auth/refresh` with `refreshToken`
- Refresh requests are deduplicated (singleton `refreshInFlight` promise)
- On refresh failure → clears session, dispatches `"auth-session-cleared"` event

### Key Service Functions (`auth.service.ts`)
| Function | Purpose |
|---|---|
| `login(credentials)` | POST /api/auth/login |
| `register(credentials)` | POST /api/auth/register |
| `logout(accessToken)` | POST /api/auth/logout |
| `refreshAccessToken(refreshToken)` | POST /api/auth/refresh |
| `authenticatedRequest(config)` | Axios wrapper with auto-refresh |
| `changePassword(currentPwd, newPwd)` | PUT /api/auth/change-password |
| `readAuthSession()` | Read from localStorage/sessionStorage |
| `saveAuthSession(session, rememberMe)` | Persist to storage |
| `clearAuthSession()` | Remove from storage + dispatch event |

---

## State Management

### Global State (Zustand — `auth.store.ts`)
```ts
type AuthStore = {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  setSession: (session: AuthState, rememberMe?: boolean) => void
  clearSession: () => void
  signOut: () => Promise<void>
}
```

### Local State
- Page-level `useState` / `useReducer`
- Form state via Formik

---

## Key Files for Code Agents

### Where to find things:
- **Pages**: `src/pages/<PageName>/`
- **Layouts**: `src/layouts/`
- **Route config**: `src/routes/layoutRoutes.tsx`
- **Route rendering**: `src/routes/AppRoutes.tsx`
- **Auth guard**: `src/routes/RequireAuth.tsx`
- **Auth store**: `src/stores/auth.store.ts`
- **Auth service (API + refresh)**: `src/services/auth.service.ts`
- **Auth provider**: `src/providers/AuthProvider.tsx`
- **UI primitives**: `src/components/ui/`
- **Topbar components**: `src/components/topbar/`
- **Admin/Staff shells**: `src/components/admin-shell/`, `src/components/staff-shell/`
- **Theme provider**: `src/components/theme-provider.tsx`
- **Role helpers**: `src/lib/role-routes.ts`
- **CSS + design tokens**: `src/index.css`
- **Root component**: `src/App.tsx`

---

## Deliberately NOT built (do not add)
- AI prediction / chatbot / conversational UI
- Real-time WebSocket tick data
- Trading or brokerage functionality
- Light theme (planned future)
- Portfolio management with mock trading
- Large decorative animations or splash pages

---

## Dependencies (Key)

| Package | Purpose |
|---|---|
| `react` ^19 | UI framework |
| `react-dom` ^19 | DOM rendering |
| `react-router-dom` ^6 | Client-side routing |
| `zustand` ^5 | Global state |
| `axios` ^1 | HTTP client |
| `formik` + `yup` | Forms & validation |
| `echarts` ^6 + `echarts-for-react` | Charts |
| `tailwindcss` ^4 | Utility CSS |
| `clsx` + `tailwind-merge` | `cn()` helper |
| `class-variance-authority` | Component variants |
| `lucide-react` | Icons |
| `@fontsource-variable/geist` | Font |
| `sonner` | Toasts |
| `shadcn/ui` (individual) | UI primitives |

---

## Notes for Code Agents

1. **Read `FE/WEB_DEV_RULES.md` first** — contains the authoritative coding conventions.
2. **shadcn-first** — always check `src/components/ui/` before building a new UI primitive. If a shadcn component already exists, use it. If not, consider adding one.
3. **Reuse-first policy** — scan `src/components/`, `src/layouts/`, and `src/lib/` for existing components before creating new ones.
4. **New pages** follow this pattern:
   - Create folder in `src/pages/<PageName>/`
   - Create `<PageName>.tsx` as the page component
   - Add route entry in `src/routes/layoutRoutes.tsx` under the appropriate role array
5. **Styling** uses Tailwind v4 utility classes exclusively — no inline styles, no CSS modules.
6. **Auth** is managed via `useAuthStore` (Zustand) with Axios interceptors for token refresh.
7. **Role routing** uses `RequireAuth` component with `requiredRole` prop — each role route array gets wrapped automatically.
8. **Search grep patterns** for finding code quickly:
   - `grep "function\|const.*=>"` in a page to find handlers
   - `grep "from.*@/"` to see local imports
   - `grep "useAuth"` to find auth usage
   - `grep "apiClient\|axios"` to find API calls
   - `grep "cn("` to find component styling
   - `grep "import.*from.*@/components/ui"` to find shadcn usage
