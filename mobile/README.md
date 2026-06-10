# AI Stock Trend — Mobile App

Mobile client for the **AI-Based Stock Trend Prediction** platform. Built with **React Native + Expo** targeting HOSE/VN30 stock monitoring for Vietnamese retail investors.

> **Read this first.** Then consult the companion docs in `AI_Stock_Trend_Prediction_Docs/`:
> - `FE/MOBILE_DEV_RULES.md` — strict architecture, component, and coding rules
> - `FE/MOBILE_DESIGN.md` — design tokens, component specs, layout system
> - `01-project-overview.md` — project scope, MVP direction, data philosophy
> - `02-system-architecture-techstack.md` — full tech stack
> - `03-erd.md` — database schema and dimension/fact model
> - `04-project-structure.md` — monorepo structure

---

## Quick Start

```bash
cd FE_AI_Stock_Trend_Prediction/mobile
npm install
npx expo start
# Then press 'a' for Android, 'i' for iOS, 'w' for web
```

## Environment

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `EXPO_PUBLIC_API_URL` | No | `https://your-backend-api.com/api` | Backend API base URL |

Set via `.env` file or Expo's `app.config.js` `extra` field.

---

## Architecture Philosophy

### Data First → Visualization First → AI Later

The mobile app prioritizes:
1. **Authentication** (Login/Register)
2. **Dashboard** (market overview)
3. **Stock Detail** (OHLCV charts, validated data)
4. **Watchlist** (follow/unfollow stocks)
5. **Alerts** (list + create price alerts)
6. **Search** (ticker lookup)
7. **Profile** (session controls, preferences)

### Strict 4-Layer Data Flow

```
Screen
  → calls Hook(s)        (features/<name>/hooks/)
    → calls Service(s)    (features/<name>/services/)
      → calls apiClient   (shared/services/api.service.ts)
```

**Rules enforced:**
- Screens **never** call Axios, fetch, or AsyncStorage directly
- Screens **never** contain inline mock data or validation schemas
- Hooks own all screen-level state (loading, data, error)
- Services own all API communication and return typed responses

---

## Project Structure

```
mobile/
├── App.tsx                          # Root: GestureHandlerRootView → ThemeProvider → NavigationContainer → RootNavigator
├── app.config.js                    # Expo config, env var bridge
├── babel.config.js                  # nativewind/babel + reanimated plugin
├── metro.config.js                  # nativewind/metro
├── tailwind.config.js               # NativeWind + custom colors (market up/down, surface, chart)
├── tsconfig.json                    # Path aliases: @/, @/app, @/shared, @/features, @/stores, @/assets
│
├── assets/
│   ├── images/
│   │   └── tabIcons/               # Tab bar icon assets
│   └── fonts/
│
└── src/
    ├── global.css                   # Tailwind directives + CSS custom properties
    │
    ├── app/
    │   ├── navigation/
    │   │   ├── RootNavigator.tsx     # NativeStack: Startup → Login/Register → MainTabs → detail screens
    │   │   ├── MainTabNavigator.tsx  # Bottom tabs (Dashboard, Watchlist, Alerts, Search, Profile) + session guard
    │   │   ├── AppTabBar.tsx         # Custom tab bar with icons, badges, responsive sizing
    │   │   └── navigation.types.ts   # RootStackParamList, MainTabParamList, screen prop types
    │   └── config/
    │       └── (env.ts, app.config.ts when present)
    │
    ├── features/                    # Feature modules (see §Feature Module Pattern below)
    │   ├── auth/                    # Login, Register, auth service, session types
    │   ├── dashboard/               # Market overview screen
    │   ├── stocks/                  # Stock detail screen, price header, chart section
    │   ├── watchlist/               # Watchlist screen + swipeable rows + filters
    │   ├── alerts/                  # Alert list + create alert screen
    │   ├── search/                  # Stock search screen
    │   ├── profile/                 # Profile, change password, edit profile
    │   └── startup/                 # Splash/startup screen + auth check orchestration
    │
    ├── shared/
    │   ├── design/
    │   │   └── tokens.ts            # THE SOURCE OF TRUTH for palette, spacing, radius
    │   ├── services/
    │   │   ├── api.service.ts       # Single axios factory (getApiBaseUrl, createApiClient)
    │   │   └── tokenStorage.ts      # AsyncStorage helpers (persist, read, clear session)
    │   ├── ui/
    │   │   ├── index.ts             # Barrel exports: all shared UI components
    │   │   ├── primitives/          # Pure RN building blocks (Box, VStack, HStack, Text, Button, Input, etc.)
    │   │   ├── components/          # Composed shared UI (MetricCard, StatusBadge, StockListItem)
    │   │   ├── feedback/            # Toast, AlertBanner, LoadingSkeleton
    │   │   ├── forms/               # FormField, CheckboxRow, PasswordToggle
    │   │   ├── layout/              # AppScreen, SectionHeader
    │   │   └── utils/
    │   │       └── ThemeProvider.tsx # Theme context + toast system (replaces GluestackUIProvider)
    │   ├── hooks/                   # Shared hooks (useRefresh, useOffline)
    │   ├── utils/                   # Pure utility functions
    │   ├── constants/               # App-wide constants
    │   └── types/                   # Shared TS types
    │
    └── stores/                      # Zustand global stores ONLY
        ├── auth.store.ts            # Session, token, user state
        ├── market.store.ts          # Market status, tickers (mock data currently)
        ├── app-shell.store.ts       # Offline, stale, notification badge count
        └── startup.store.ts         # Startup orchestration state
```

---

## Feature Module Pattern

Each feature follows a consistent structure. **Example `watchlist/`:**

```
features/watchlist/
├── types.ts                         # API response types (WatchlistItem, WatchlistResponse, etc.)
├── services/watchlist.service.ts    # API calls using createApiClient() + Bearer token from useAuthStore
├── hooks/useWatchlist.ts            # State owner: loading, data, error, refresh(), removeItem(symbol)
├── components/
│   ├── WatchlistHeader.tsx          # Title + action buttons
│   ├── WatchlistSearchBar.tsx       # Client-side search input
│   ├── WatchlistFilterChips.tsx     # Filter chips (All, Gainers, Losers, HOSE)
│   ├── WatchlistRow.tsx             # Single watchlist item row
│   └── SwipeableRow.tsx             # Generic ReanimatedSwipeable wrapper (red "Delete" action)
└── screens/
    └── WatchlistScreen.tsx          # ≤250 lines — FlatList, hooks, client-side filtering, RefreshControl
```

### File Size Limits (ENFORCED)

| File Type | Target | Hard Limit |
|---|---|---|
| Screen | 80–180 lines | **250 lines** |
| Shared component | 40–120 lines | 180 lines |
| Hook | 30–100 lines | 150 lines |
| Service | 40–150 lines | 200 lines |
| Store | 40–120 lines | 180 lines |
| Utility | 20–80 lines | 120 lines |

---

## Design System (Dark Theme Only)

All values come from `shared/design/tokens.ts` — **never hardcode** colors, spacing, or radii in screens.

```ts
palette = {
  background:    '#0F172A',   // Base background
  surface:       '#111827',   // Card backgrounds
  elevated:      '#1E293B',   // Popovers, hover states
  border:        '#334155',   // Subtle separators
  textPrimary:   '#F8FAFC',   // High contrast text
  textSecondary: '#94A3B8',   // Lower contrast metadata
  positive:      '#22C55E',   // Gains, upward ▲
  negative:      '#EF4444',   // Losses, downward ▼
  warning:       '#F59E0B',   // Warnings
  info:          '#38BDF8',   // Informational
  offline:       '#64748B',   // Disabled/inactive
  primary:       '#3B82F6',   // Brand, primary actions
  primarySoft:   '#ADC6FF',   // Soft variant
}
```

### Spacing (8pt system): `xs:4, sm:8, md:16, lg:24, xl:32`
### Typography: `largePrice:28, screenTitle:24, sectionTitle:20, cardTitle:16, body:14, secondary:12, tiny:10-11`
### Min touch target: **44×44**

### Styling Rules
- `StyleSheet.create()` only — no inline style objects in JSX
- No NativeWind/Tailwind classes in production screens (CSS is for global reset only)
- No ad-hoc color/radius/font values — always use tokens

---

## Component Architecture

### Primitives (`shared/ui/primitives/`)
Pure React Native components with `tva` (tailwind-variants wrapper) styling. Available components:

| Component | Description |
|---|---|
| `Box` | `<View>` wrapper |
| `VStack` / `HStack` | Vertical/horizontal layout |
| `Text` | Styled text with variants |
| `Button` | Multi-variant button (primary, secondary, positive, negative, outline, link, sizes xs–xl) |
| `Input` | Text input with focus/error/disabled states |
| `Pressable` | Touchable wrapper |
| `Card` | Surface card container |
| `Divider` | Line separator |
| `Switch` / `Checkbox` | Boolean controls |
| `Spinner` | Loading indicator |
| `Modal` | RN Modal wrapper |
| `Icon` | Lucide-based icon component |

### Composed Components (`shared/ui/components/`)
- `MetricCard` — KPI display with label, value, detail, tone color
- `StatusBadge` — Pill badge with tone (up/down/warning/primary/neutral)
- `StockListItem` — Stock row with symbol, name, price
- `FeaturePlaceholderScreen` — Placeholder for incomplete features

### Layout Components (`shared/ui/layout/`)
- `AppScreen` — Screen shell with scroll, refresh, banners, market status overlay

### Feedback Components (`shared/ui/feedback/`)
- `AppBanner` — Contextual banner (market open/closed, stale data, warning)
- `LoadingSkeleton` — Skeleton placeholders
- App-level toast via `useToast()` from ThemeProvider

---

## Navigation Architecture

### Screen Hierarchy
```
RootNavigator (NativeStack)
├── Startup       → animated splash, auth check, auto-navigate
├── Login         → email/password form, remember me
├── Register      → registration form
├── MainTabs      → BottomTabNavigator (headerShown: false)
│   ├── Dashboard → market overview, brand + status header
│   ├── Watchlist → "My Watchlist" + search + filters + swipeable rows
│   ├── Alerts    → alert list
│   ├── Search    → stock search
│   └── Profile   → account/profile
├── StockDetail   → modal presentation, no tab bar
├── EditProfile   → slide from right, no tab bar
├── ChangePassword → slide from right, no tab bar
└── CreateAlert / EditAlert / NotificationCenter (planned)
```

### Header Rules
- **No global header** — MainTabNavigator sets `headerShown: false`
- Each tab screen renders its own contextual header inside scrollable content
- Safe area padding handled per screen via `useSafeAreaInsets()`
- Detail/child screens have a back-header with no bottom navbar

---

## State Management

### Global State (Zustand)
| Store | Purpose |
|---|---|
| `auth.store.ts` | Session, tokens, user — `setSession`, `clearSession`, `beginSubmit`, `failSubmit` |
| `market.store.ts` | Market status (OPEN/CLOSED), active symbol, ticker list |
| `app-shell.store.ts` | Offline flag, stale data, notification count, refresh orchestration |
| `startup.store.ts` | Startup flow state |

### Local State (useState/useReducer)
- Form field values
- Modal open/close (screen-scoped only)
- Single-screen loading/error
- UI-only toggles

---

## API Communication

### Layer Structure
```
shared/services/
├── api.service.ts        # createApiClient() — Axios factory with env-based baseURL
└── tokenStorage.ts       # AsyncStorage CRUD for auth tokens

features/<name>/services/
└── <name>.service.ts     # Feature-specific API calls
```

### Patterns
- `createApiClient()` from `api.service.ts` returns an Axios instance
- Bearer token injected per-call via `useAuthStore.getState().session?.accessToken`
- All API responses typed via feature `types.ts`
- Error handling with friendly user-facing messages
- 401 handling is per-service (no global interceptor yet)

---

## Import Rules (STRICT)

```
✓ features/  → shared/         (features import from shared)
✓ features/  → app/navigation  (types only)
✓ app/       → features/       (app loads screens)
✓ shared/    → shared/         (shared imports from shared only)
✓ app/       → shared/         (app imports providers/theme)
✗ shared/    → features/       (circular dependency risk)
✗ feature → another feature    (must go through app/ or shared)
```

### Path Aliases
| Alias | Maps to |
|---|---|
| `@/app` | `src/app` |
| `@/shared` | `src/shared` |
| `@/features` | `src/features` |
| `@/stores` | `src/stores` |
| `@/assets` | `assets/` |

---

## Key Files for Code Agents

### Where to find things:
- **Screens**: `src/features/<name>/screens/`
- **Components**: `src/features/<name>/components/` (feature-specific), `src/shared/ui/components/` (shared)
- **Hooks**: `src/features/<name>/hooks/` (feature), `src/shared/hooks/` (shared)
- **Services**: `src/features/<name>/services/` (API calls)
- **Types**: `src/features/<name>/types.ts` (API types), `src/shared/types/` (shared)
- **Design tokens**: `src/shared/design/tokens.ts`
- **Navigation types**: `src/app/navigation/navigation.types.ts`
- **Navigators**: `src/app/navigation/`
- **Stores**: `src/stores/`
- **API client**: `src/shared/services/api.service.ts`
- **Token storage**: `src/shared/services/tokenStorage.ts`
- **UI primitives**: `src/shared/ui/primitives/`
- **UI components**: `src/shared/ui/components/`
- **Root component**: `App.tsx`

---

## Deliberately NOT built (do not add)
- AI prediction / chatbot / conversational UI
- Real-time tick data
- Trading game UI
- Portfolio or advanced analytics (future phase)
- Light theme support
- Large decorative screens

---

## Dependencies (Key)

| Package | Purpose |
|---|---|
| `expo` ~56 | Framework |
| `react-native` 0.85 | Core |
| `@react-navigation/native` + `native-stack` + `bottom-tabs` | Navigation |
| `zustand` ^5 | Global state |
| `axios` ^1 | HTTP client |
| `react-native-gesture-handler` + `react-native-reanimated` | Swipeable, animations |
| `react-native-safe-area-context` | Safe area insets |
| `formik` + `yup` | Form state & validation |
| `nativewind` ^4 | Tailwind for RN (global CSS only) |
| `tailwind-variants` | Component variant system |
| `lucide-react-native` | Icons |
| `react-native-svg` | SVG support |
| `@react-native-async-storage/async-storage` | Token persistence |

---

## Notes for Code Agents

1. **Read `FE/MOBILE_DEV_RULES.md` first** before making any changes — it contains the authoritative coding rules.
2. **Never import GlueStack** — it was removed in June 2026. All primitives are pure React Native. Feature screens import from `@/shared/ui`.
3. **Keep screens under 250 lines** — split into components/, hooks/, services/, schemas/ when exceeded.
4. **All design values come from `tokens.ts`** — never hardcode colors/spacing/radii.
5. **Feature isolation** — features cannot import from other features. Shared code lives in `shared/`.
6. **Client-side filtering** over API filtering where possible (watchlist search/filter chips pattern).
7. **Tab screens have `headerShown: false`** — each screen manages its own top area with `useSafeAreaInsets()`.
8. **Use `TouchableOpacity` over `Pressable`** in feature screens for button/touch actions.
9. **Search grep patterns** for finding code quickly:
   - `grep "function\|const.*=>"` in a screen to find handlers
   - `grep "from.*@/shared"` to see shared imports
   - `grep "palette\."` to find token usage
   - `grep "createApiClient"` to find API calls
   - `grep "use.*Store"` to find store usage


