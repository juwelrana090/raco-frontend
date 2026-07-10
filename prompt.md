# raco-frontend — Build Prompt

# UI Pattern: madrasa-frontend (exact match)

> Paste this into Claude Code inside `raco-frontend` after running `setup-claude.sh`.
> The `.claude/memory/patterns.md` already has every Tailwind class and component
> structure from madrasa-frontend. Read it before writing any screen.

---

## 0. Stack

```
Next.js 16 (App Router) · React 19 · TypeScript
TailwindCSS v4 (globals.css @theme block — NO tailwind.config.ts)
Ant Design 5 (Table, Pagination, Select, DatePicker)
Formik + Yup (all forms)
TanStack Query v5 (server state)
Zustand v5 (auth store, dashboard title store)
react-toastify (toast notifications)
js-cookie (token storage — httpOnly cookie preferred)
dayjs (date formatting)
react-image-crop (product image before S3 upload)
```

Install all deps first:

```bash
pnpm add antd @ant-design/nextjs-registry @ant-design/icons @ant-design/v5-patch-for-react-19 formik yup react-toastify zustand @tanstack/react-query @tanstack/react-query-devtools js-cookie dayjs react-image-crop
pnpm add -D @svgr/webpack @types/js-cookie
```

---

## 1. Route Groups

```
app/
  (storefront)/
    page.tsx                     → home / featured products
    products/
      page.tsx                   → listing (filters, pagination)
      [slug]/page.tsx            → detail + recommendations
    cart/page.tsx
    checkout/
      page.tsx                   → provider choice
      bkash-callback/page.tsx    → bKash return handler
  (account)/
    orders/page.tsx              → user order history
    orders/[id]/page.tsx         → order detail + status polling
  (admin)/
    layout.tsx                   ← DashboardLayout (exact madrasa pattern)
    dashboard/page.tsx
    products/
      page.tsx
      add/page.tsx
      [id]/edit/page.tsx
    categories/
      page.tsx
      add/page.tsx
      [id]/edit/page.tsx
    orders/
      page.tsx
      [id]/page.tsx
    payments/page.tsx
  (auth)/
    login/page.tsx
    register/page.tsx
  layout.tsx                     ← AntdRegistry + QueryClientProvider + ToastContainer
```

---

## 2. Admin Layout (copy from madrasa exactly)

### `app/(admin)/layout.tsx`

```tsx
"use client";
import DashboardLayout from "@/shared/components/layouts/DashboardLayout";
import { SidebarProvider } from "@/shared/context/SidebarContext";
import { ThemeProvider } from "@/shared/context/ThemeContext";
import AuthGuard from "@/lib/auth/AuthGuard";

export default function AdminLayout({ children }) {
  return (
    <AuthGuard>
      <ThemeProvider>
        <SidebarProvider>
          <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-gray-900">
            <DashboardLayout>{children}</DashboardLayout>
          </div>
        </SidebarProvider>
      </ThemeProvider>
    </AuthGuard>
  );
}
```

### Sidebar nav items for raco

```ts
const mainNav = [
  { icon: <GridIcon />, name: 'Dashboard', path: '/admin/dashboard' },
];

const managementNav = [
  { icon: <BoxIcon />,       name: 'Products',   subItems: [
    { name: 'Add Product',      path: '/admin/products/add' },
    { name: 'Manage Products',  path: '/admin/products' },
  ]},
  { icon: <CategoryIcon />,  name: 'Categories', subItems: [
    { name: 'Add Category',     path: '/admin/categories/add' },
    { name: 'Manage Categories',path: '/admin/categories' },
  ]},
  { icon: <ClipboardIcon />, name: 'Orders',     path: '/admin/orders' },
  { icon: <DollarIcon />,    name: 'Payments',   path: '/admin/payments' },
];
```

---

## 3. globals.css — copy madrasa EXACTLY

Copy the entire `globals.css` from madrasa-frontend including:

- `@import 'tailwindcss'`
- `@custom-variant dark`
- `@plugin 'tailwind-scrollbar'`
- `@plugin 'daisyui'`
- The full `@theme { ... }` block (brand-_, success-_, error-_, warning-_, gray-\* colors)
- All `@utility` blocks (`menu-item`, `menu-item-active`, `menu-dropdown-item`, etc.)
- The `no-scrollbar` and `custom-scrollbar` utilities

This is the ENTIRE design token system. Do not change any values.

---

## 4. Module Structure per feature

Every admin feature (products, categories, orders, payments) follows this exact
module structure from madrasa-frontend:

```
src/modules/[feature]/
├── components/
│   ├── [Feature]Layout.tsx      ← list: page header + filters + table
│   ├── [Feature]Table.tsx       ← Ant Design <Table> with typed columns
│   ├── [Feature]Filters.tsx     ← search + select filters + active filter chips
│   ├── Add[Feature]Page.tsx     ← page wrapper: title + back + form
│   ├── Add[Feature]Form.tsx     ← Formik form with multiple section cards
│   └── Edit[Feature]Form.tsx
├── contexts/
│   └── [Feature]Context.tsx     ← TanStack Query useQuery/useMutation + filter state
├── hooks/
│   ├── useCreate[Feature].ts    ← useMutation wrapping API call
│   └── useFetch[Feature]s.ts   ← useQuery wrapping paginated GET
└── types/
    └── index.ts
```

Route page files stay thin — they pull from the module:

```tsx
// app/(admin)/products/page.tsx
"use client";
import ProductsLayout from "@/modules/products/components/ProductsLayout";
import { ProductsProvider } from "@/modules/products/contexts/ProductsContext";
export default function ProductsPage() {
  return (
    <ProductsProvider>
      <ProductsLayout />
    </ProductsProvider>
  );
}
```

---

## 5. Key UI Classes (copy verbatim — never invent)

### Page heading

```
h2: text-xl font-semibold text-gray-800 dark:text-white/90
p:  text-sm text-gray-500 dark:text-gray-400
```

### Add button (top-right of list page)

```
bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white
```

### Form card

```
rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900
```

### Form section title

```
mb-4 text-base font-semibold text-gray-800 dark:text-white/90
```

### Form label

```
mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400
```

### Input (h-11, universal)

```
shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
```

### Filter input (h-10)

```
shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-10 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30
```

### Cancel button

```
rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300
```

### Submit button

```
bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white
```

### Table wrapper

```
rounded-2xl border border-gray-200 dark:border-gray-800
```

### Avatar fallback (initial letter)

```
bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium
```

---

## 6. Products Module (full spec)

### Products table columns

1. # (row number)
2. Product (thumbnail + name + SKU)
3. Category (name)
4. Price (format as ৳ X,XXX — integer minor units ÷ 100)
5. Stock (number, red if ≤ 5)
6. Status (Badge: active=success, inactive=error)
7. Actions (edit icon button + delete icon button)

### Add Product form sections

**Section 1 — Basic Information**

- Name \* (text)
- SKU \* (text, uppercase hint)
- Description (textarea, full width)
- Price \* (number, in Taka — store as poisha = taka × 100)
- Stock \* (number)
- Status (select: active/inactive)

**Section 2 — Category**

- Category \* (select — loads from GET /categories tree, flatten for display)

**Section 3 — Product Image**

- Image upload with crop (`react-image-crop`)
- Preview
- On save: POST /products/:id/image (multipart/form-data)

### Category tree select

The backend returns a tree. Flatten for the select dropdown with indentation:

```
Electronics
  └── Phones
  └── Laptops
Clothing
  └── T-Shirts
```

---

## 7. Orders Module (admin view)

### Orders table columns

1. # (row number)
2. Order ID (short ID)
3. Customer (name)
4. Total (৳ formatted)
5. Items (count)
6. Status (Badge: pending=warning, paid=success, canceled=error)
7. Payment Provider (stripe/bkash badge)
8. Date (dayjs formatted)
9. Actions (view details)

Orders are read-only for admin (no edit). Status changes only via payment webhook.

---

## 8. Payments Module (admin view)

### Payments table columns

1. # (row number)
2. Transaction ID (truncated, copy on click)
3. Order ID (link to order detail)
4. Provider (Badge: stripe=primary, bkash=success)
5. Amount (৳ formatted)
6. Status (Badge: pending=warning, success=success, failed=error)
7. Date

---

## 9. Auth (login/register)

### Login page layout

```tsx
// Two columns on desktop, single column mobile
<div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
  <div className="w-full max-w-md">
    <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90 mb-6">Sign in</h2>
      <Formik ...>
        <Form className="space-y-4">
          {/* email field */}
          {/* password field */}
          {/* submit button */}
        </Form>
      </Formik>
    </div>
  </div>
</div>
```

Token stored in cookie (`js-cookie`) with `{ expires: 7, secure: true, sameSite: 'strict' }`.
Auth state in Zustand `authStore` (`user`, `token`, `isAuthenticated`).
`AuthGuard` reads from authStore → redirect `/auth/login` if not authenticated.

---

## 10. Build Order

1. Copy `globals.css` from madrasa-frontend exactly
2. Copy context files: `ThemeContext`, `SidebarContext`, `LocaleContext`
3. Build shared components: `DashboardLayout`, `DashboardSidebar`, `DashboardHeader`, `Badge`, `Button`, `Backdrop`
4. Build `lib/api/apiClient.ts` + `lib/auth/authStore.ts` + `AuthGuard`
5. Auth module: login form + register form
6. Admin dashboard page (stats cards)
7. Products module (list → add → edit)
8. Categories module (list + tree add)
9. Orders admin module
10. Payments admin module
11. Storefront: product listing + detail
12. Cart + checkout (Stripe then bKash)
13. Account: order history + status polling
14. Deploy to Vercel

Work module by module with `/r-task`. Update `.claude/modules/*.md` after each module.
Log any dark mode bug or Ant Design quirk to `.claude/memory/gotchas.md`.

You are building the raco-frontend admin panel + storefront. UI must match madrasa-frontend exactly. Read .claude/memory/patterns.md before writing any component — it contains every Tailwind class, pattern, and dark mode rule.

## TASK: Steps A–B (Layout infrastructure + Auth)

### Step A1 — Install dependencies

```bash
pnpm add antd @ant-design/nextjs-registry @ant-design/icons "@ant-design/v5-patch-for-react-19" formik yup react-toastify zustand @tanstack/react-query @tanstack/react-query-devtools js-cookie dayjs react-image-crop

pnpm add -D @types/js-cookie
```

### Step A2 — globals.css (CRITICAL — do this first)

Copy the COMPLETE globals.css from madrasa-frontend verbatim to src/app/globals.css.

It must contain all of these — do not skip any:

- @import 'tailwindcss'
- @custom-variant dark (&:where(.dark, .dark \*))
- @plugin 'tailwind-scrollbar'
- @plugin 'daisyui' { themes: light --default; }
- Full @theme { } block with ALL color tokens:
  brand-25 through brand-950, gray-25 through gray-950,
  success-25 through success-950, error-25 through error-950,
  warning-25 through warning-950, blue-light variants,
  orange variants, all shadow-theme-_ variables,
  all text-title-_ and text-theme-_ font sizes,
  all breakpoint-_ values
- All @utility blocks:
  menu-item, menu-item-active, menu-item-inactive,
  menu-item-icon-active, menu-item-icon-inactive,
  menu-dropdown-item, menu-dropdown-item-active, menu-dropdown-item-inactive,
  no-scrollbar, custom-scrollbar
- body { @apply font-figtree bg-gray-50; }
- Ant Design dark mode overrides for: dropdown, select, datepicker

This is the entire design token system. Zero modifications.

### Step A3 — Root layout

src/app/layout.tsx:

```tsx
import type { Metadata } from "next";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import "./globals.css";

export const metadata: Metadata = {
  title: "Raco — E-commerce",
  description: "E-commerce Ordering & Payment System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AntdRegistry>{children}</AntdRegistry>
      </body>
    </html>
  );
}
```

### Step A4 — Shared contexts

src/shared/context/ThemeContext.tsx:

- useState<'light'|'dark'>
- useEffect: read localStorage 'theme', apply/remove 'dark' class on document.documentElement
- toggleTheme(): set state, update localStorage, toggle class

src/shared/context/SidebarContext.tsx:

- State: isExpanded (bool, default true), isMobileOpen (bool), isHovered (bool)
- toggleSidebar(): flip isExpanded
- toggleMobileSidebar(): flip isMobileOpen
- setIsHovered(bool)
- useEffect: detect mobile (< 1024px) on resize → auto-collapse

src/shared/context/LocaleContext.tsx (minimal — raco has no i18n):

```tsx
"use client";
import { createContext, useContext } from "react";
const LocaleContext = createContext("en");
export const useLocale = () => useContext(LocaleContext);
export const LocaleProvider = ({ children }: { children: React.ReactNode }) => (
  <LocaleContext.Provider value="en">{children}</LocaleContext.Provider>
);
```

### Step A5 — Dashboard layout components

These must follow the madrasa-frontend structure exactly. Read .claude/memory/patterns.md for the layout pattern before writing.

src/shared/components/layouts/DashboardLayout.tsx:

```tsx
"use client";
import { useSidebar } from "@/shared/context/SidebarContext";
import DashboardHeader from "./DashboardHeader";
import DashboardSidebar from "./DashboardSidebar";
import Backdrop from "./Backdrop";

export default function DashboardLayout({ children }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainContentMargin = isMobileOpen
    ? "ml-0"
    : isExpanded || isHovered
      ? "lg:ml-[290px]"
      : "lg:ml-[90px]";

  return (
    <div className="min-h-screen xl:flex">
      <DashboardSidebar />
      <Backdrop />
      <div
        className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}
      >
        <DashboardHeader />
        <div className="mx-auto max-w-(--breakpoint-2xl) p-4 md:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
```

src/shared/components/layouts/DashboardSidebar.tsx:
Collapsible sidebar (290px expanded / 90px icon-only).
Nav items for raco:

```typescript
const mainNav = [
  { icon: <GridIcon />, name: 'Dashboard', path: '/admin/dashboard' },
];

const managementNav = [
  {
    icon: <BoxIcon />, name: 'Products',
    subItems: [
      { name: 'Add Product',      path: '/admin/products/add' },
      { name: 'Manage Products',  path: '/admin/products' },
    ],
  },
  {
    icon: <CategoryIcon />, name: 'Categories',
    subItems: [
      { name: 'Add Category',     path: '/admin/categories/add' },
      { name: 'Manage Categories',path: '/admin/categories' },
    ],
  },
  { icon: <ClipboardIcon />, name: 'Orders',   path: '/admin/orders' },
  { icon: <DollarIcon />,    name: 'Payments', path: '/admin/payments' },
  { icon: <UserIcon />,      name: 'Profile',  path: '/admin/profile' },
];
```

Active item class: menu-item-active (from globals.css utility)
Inactive item class: menu-item-inactive
Active icon: menu-item-icon-active
Inactive icon: menu-item-icon-inactive
Submenu items: menu-dropdown-item-active / menu-dropdown-item-inactive
Animated height for submenus using scrollHeight ref pattern.
Auto-open submenu when current path matches a subitem.

Use plain /admin/... paths — NO /${locale}/... prefix (raco has no i18n).

src/shared/components/layouts/DashboardHeader.tsx:
Sticky top-0 header with:

- Sidebar toggle button (hamburger / X)
- Search input (desktop only): shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 h-11 rounded-lg border border-gray-200
- ThemeToggleButton, NotificationDropdown, UserDropdown

src/shared/components/layouts/Backdrop.tsx:
Fixed overlay shown when isMobileOpen, clicking it calls toggleMobileSidebar().

### Step A6 — Shared UI components

src/shared/components/ui/badge/Badge.tsx:

```typescript
type BadgeColor =
  | "primary"
  | "success"
  | "error"
  | "warning"
  | "info"
  | "light"
  | "dark";
type BadgeVariant = "light" | "solid";

// light.primary  → bg-brand-50 text-brand-500 dark:bg-brand-500/15 dark:text-brand-400
// light.success  → bg-success-50 text-success-600 dark:bg-success-500/15 dark:text-success-500
// light.error    → bg-error-50 text-error-600 dark:bg-error-500/15 dark:text-error-500
// light.warning  → bg-warning-50 text-warning-600 dark:bg-warning-500/15 dark:text-orange-400
// light.light    → bg-gray-100 text-gray-700 dark:bg-white/5 dark:text-white/80
// solid.primary  → bg-brand-500 text-white
// solid.success  → bg-success-500 text-white
```

src/shared/components/ui/button/Button.tsx:

```typescript
// primary: bg-brand-500 text-white shadow-theme-xs hover:bg-brand-600 disabled:bg-brand-300
// outline: bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700
// sizes: sm = px-4 py-3 text-sm, md = px-5 py-3.5 text-sm
```

src/shared/components/ui/ButtonLoader.tsx:
Spinner shown inside submit buttons while isSubmitting is true.

### Step A7 — Icons

Create src/shared/icons/ with SVG icon components needed for sidebar:
GridIcon, BoxIcon (or PackageIcon), CategoryIcon (TagIcon), ClipboardIcon (OrdersIcon), DollarIcon (PaymentsIcon), UserIcon, ChevronDownIcon, HorizontalDotsIcon.

Each returns a plain SVG element, no wrapper. Size: 20×20, stroke="currentColor" strokeWidth={1.5}.

### Step A8 — Admin layout group

src/app/(admin)/layout.tsx:

```tsx
"use client";
import DashboardLayout from "@/shared/components/layouts/DashboardLayout";
import { SidebarProvider } from "@/shared/context/SidebarContext";
import { ThemeProvider } from "@/shared/context/ThemeContext";
import AuthGuard from "@/lib/auth/AuthGuard";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function AdminLayout({ children }) {
  return (
    <AuthGuard requiredRole="ADMIN">
      <QueryProvider>
        <ThemeProvider>
          <SidebarProvider>
            <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-gray-900">
              <ToastContainer position="top-right" autoClose={3000} />
              <DashboardLayout>{children}</DashboardLayout>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </QueryProvider>
    </AuthGuard>
  );
}
```

src/app/(admin)/dashboard/page.tsx — placeholder:

```tsx
"use client";
export default function DashboardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Dashboard
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Welcome to Raco Admin
        </p>
      </div>
    </div>
  );
}
```

### Step B1 — API client

src/lib/api/apiClient.ts:

Base URL: process.env.NEXT_PUBLIC_API_URL
Auto-attach: Authorization: Bearer <token> from authStore
Response unwrap: backend returns { success, message, data } — return data or throw with message
Methods: get<T>(url), post<T>(url, body), patch<T>(url, body), delete<T>(url)

src/lib/api/auth.ts:

```typescript
export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string; user: IUser }>(
      "/auth/login",
      { email, password },
    ),
  register: (name: string, email: string, password: string) =>
    apiClient.post<{ accessToken: string; user: IUser }>("/auth/register", {
      name,
      email,
      password,
    }),
  me: () => apiClient.get<IUser>("/auth/me"),
  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>(
      "/auth/refresh",
      { refreshToken },
    ),
};
```

src/lib/api/types.ts:

```typescript
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
}
```

### Step B2 — Auth store (Zustand)

src/lib/auth/authStore.ts:

```typescript
import { create } from "zustand";
import Cookies from "js-cookie";

interface AuthStore {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: IUser, token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: Cookies.get("raco_token") ?? null,
  isAuthenticated: !!Cookies.get("raco_token"),
  setAuth: (user, token, refreshToken) => {
    Cookies.set("raco_token", token, { expires: 1, sameSite: "strict" });
    Cookies.set("raco_refresh", refreshToken, {
      expires: 7,
      sameSite: "strict",
    });
    set({ user, token, isAuthenticated: true });
  },
  clearAuth: () => {
    Cookies.remove("raco_token");
    Cookies.remove("raco_refresh");
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
```

### Step B3 — AuthGuard

src/lib/auth/AuthGuard.tsx:

```tsx
"use client";
import { useAuthStore } from "./authStore";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "USER";
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }
    if (requiredRole === "ADMIN" && user?.role !== "ADMIN") router.replace("/");
  }, [isAuthenticated, user, requiredRole, router]);

  if (!isAuthenticated) return null;
  if (requiredRole === "ADMIN" && user?.role !== "ADMIN") return null;
  return <>{children}</>;
}
```

### Step B4 — TanStack Query provider

src/lib/providers/QueryProvider.tsx:

```tsx
"use client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { useState } from "react";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 60_000, retry: 1 } },
      }),
  );
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {process.env.NODE_ENV === "development" && <ReactQueryDevtools />}
    </QueryClientProvider>
  );
}
```

### Step B5 — Auth pages

src/app/(auth)/layout.tsx:

```tsx
export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      {children}
    </div>
  );
}
```

src/app/(auth)/login/page.tsx:

Use this EXACT inputClass:

```typescript
const inputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";
```

```tsx
<div className="w-full max-w-md">
  <div className="rounded-2xl border border-gray-200 bg-white p-8 dark:border-gray-800 dark:bg-gray-900">
    <div className="mb-6">
      <h2 className="text-2xl font-semibold text-gray-800 dark:text-white/90">
        Sign in to Raco
      </h2>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        E-commerce admin panel
      </p>
    </div>
    <Formik
      initialValues={{ email: "", password: "" }}
      validationSchema={Yup.object({
        email: Yup.string()
          .email("Invalid email")
          .required("Email is required"),
        password: Yup.string().min(6).required("Password is required"),
      })}
      onSubmit={async (values, { setSubmitting }) => {
        try {
          const res = await authApi.login(values.email, values.password);
          authStore.setAuth(res.user, res.accessToken, res.refreshToken);
          router.push("/admin/dashboard");
        } catch (err) {
          toast.error(err.message ?? "Login failed");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Email
            </label>
            <Field
              name="email"
              type="email"
              className={inputClass}
              placeholder="admin@raco.com"
            />
            {errors.email && touched.email && (
              <p className="mt-1 text-xs text-error-500">{errors.email}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Password
            </label>
            <Field
              name="password"
              type="password"
              className={inputClass}
              placeholder="Min 6 characters"
            />
            {errors.password && touched.password && (
              <p className="mt-1 text-xs text-error-500">{errors.password}</p>
            )}
          </div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 w-full rounded-lg py-2.5 text-sm font-medium text-white inline-flex items-center justify-center gap-2"
          >
            {isSubmitting ? <ButtonLoader /> : null}
            {isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </Form>
      )}
    </Formik>
  </div>
</div>
```

src/app/(auth)/register/page.tsx — same card pattern. Fields: name, email, password, confirmPassword.

### Step B6 — Redirect root

src/app/page.tsx:

```tsx
import { redirect } from "next/navigation";
export default function Home() {
  redirect("/admin/dashboard");
}
```

### Step B7 — Verify

```bash
pnpm dev

# Check:
# 1. http://localhost:3000/auth/login — login form with brand-500 button renders
# 2. Dark mode toggle works — applies 'dark' class to <html>
# 3. Login with admin@raco.com / Admin@1234 → redirects to /admin/dashboard
# 4. Sidebar shows Products (with submenu), Categories, Orders, Payments
# 5. Sidebar collapses to 90px icons on toggle
# 6. Refreshing /admin/dashboard stays logged in (cookie persists)
# 7. Visiting /admin/* when logged out redirects to /auth/login
```

After completing: run /r-done and log to .claude/tasks/logs/YYYY-MM-DD-layout-auth.md

Next session prompt: Step C — Admin Products + Categories CRUD (paste after backend Step 3 Products API is running)
