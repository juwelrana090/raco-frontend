**Prompt 2 — Frontend: Admin Users module:**

````

Build the Admin Users module for raco-frontend.
Read .claude/memory/patterns.md before writing any component.

## Files to create

### src/modules/users/types/index.ts

```typescript
export interface IUser {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
  createdAt: string;
  updatedAt: string;
}

export interface IUsersFilters {
  search?: string;
  role?: string;
  page?: number;
  limit?: number;
}
````

### src/modules/users/api/index.ts

```typescript
import { apiClient } from "@/lib/api/apiClient";
import type { IUser } from "../types";

export const usersAdminApi = {
  getAll: (params: Record<string, string | number | undefined>) =>
    apiClient.get<{ items: IUser[]; total: number }>(
      `/users?${new URLSearchParams(params as Record<string, string>)}`,
    ),
  getById: (id: string) => apiClient.get<IUser>(`/users/${id}`),
};
```

### src/modules/users/contexts/UsersContext.tsx

Same pattern as ProductsContext — TanStack Query + filter state.
State: users[], total, filters (search, role, page, limit=10), loading.
useQuery key: ['admin-users', filters].

### src/modules/users/components/UsersFilters.tsx

```tsx
// Search input + Role select (All Roles / USER / ADMIN)
// Filter chip row below inputs (same pattern as other filters)
// Use exact filterInputClass from patterns.md:
const filterInputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-10 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";
```

### src/modules/users/components/UsersTable.tsx

Ant Design Table columns:

1. # — row number
2. User — avatar initials + name + email stacked
   ```tsx
   <div className="flex items-center gap-2">
     <div className="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
       {name[0]?.toUpperCase()}
     </div>
     <div>
       <p className="text-sm font-medium text-gray-800 dark:text-white/90">
         {name}
       </p>
       <p className="text-xs text-gray-500 dark:text-gray-400">{email}</p>
     </div>
   </div>
   ```
3. Role — Badge: ADMIN=primary, USER=light
4. Joined — dayjs(createdAt).format('DD MMM YYYY')
5. Actions — "View" link to /admin/users/[id]

### src/modules/users/components/UsersLayout.tsx

```tsx
// Page header pattern (exact from patterns.md):
<div className="space-y-5">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Users
      </h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">
        {total} total users
      </p>
    </div>
    {/* No Add button — users self-register */}
  </div>
  <UsersFilters />
  <UsersTable />
</div>
```

### app/admin/users/page.tsx

```tsx
"use client";
import UsersLayout from "@/modules/users/components/UsersLayout";
import { UsersProvider } from "@/modules/users/contexts/UsersContext";
export default function UsersPage() {
  return (
    <UsersProvider>
      <UsersLayout />
    </UsersProvider>
  );
}
```

### app/admin/users/[id]/page.tsx

User detail page with two cards:

Card 1 — User Info:

```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
  <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
    User Info
  </h3>
  {/* name, email (read-only), role badge, joined date */}
</div>
```

Card 2 — Orders Table (read-only, same columns as admin orders, GET /users/:id/orders):

```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
  <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
    Orders
  </h3>
  {/* Ant Design Table */}
</div>
```

## Update sidebar

File: src/shared/components/layouts/DashboardSidebar.tsx

Add to managementNav array after Payments:

```typescript
{ icon: <UserIcon />, name: 'Users', path: '/admin/users' },
```

## Verify

- /admin/users shows user list with avatar initials, role badge, joined date
- /admin/users/[id] shows user info + their orders
- Users link appears in sidebar after Payments

After completing: run /r-done

```

---
```

**Prompt 3 — Frontend: Storefront pages:**

````

Build all storefront (public) pages for raco-frontend.
Read .claude/memory/patterns.md for all design rules.

## Setup: Storefront shared components

### src/lib/store/cartStore.ts

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string | null;
  sku: string;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: () => number;
  totalAmount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (i) => i.productId === item.productId,
          );
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + item.quantity }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),
      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),
      updateQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId ? { ...i, quantity } : i,
                ),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      totalAmount: () =>
        get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'raco-cart' },
  ),
);
````

### src/lib/api/storefront.ts

```typescript
import { apiClient } from "@/lib/api/apiClient";

export const storefrontApi = {
  getProducts: (params: Record<string, string | number | undefined>) =>
    apiClient.get<{ items: any[]; total: number }>(
      `/products?${new URLSearchParams(params as Record<string, string>)}`,
    ),
  getProduct: (id: string) => apiClient.get<any>(`/products/${id}`),
  getCategories: () => apiClient.get<any[]>("/categories"),
  getCategory: (id: string) => apiClient.get<any>(`/categories/${id}`),
};
```

### Price helper: src/shared/utils/formatPrice.ts

```typescript
export const formatPrice = (poisha: number): string => {
  return `৳ ${(poisha / 100).toLocaleString("en-BD")}`;
};
```

### src/shared/components/storefront/StorefrontHeader.tsx

```tsx
// Sticky header
// className: "sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800"
// Left: Logo "Raco" in brand-500
// Center: Nav links — Home (/), Shop (/shop)
// Right: Cart icon (with red badge showing totalItems), Login button or user name
```

### src/shared/components/storefront/Footer.tsx

```tsx
// Simple footer
// className: "bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-6 mt-auto"
// Text: "© 2026 Raco. All rights reserved."
```

### src/shared/components/storefront/ProductCard.tsx

```tsx
// className card: "bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
// Image area: fixed height 200px, object-cover — if no imageUrl show grey bg with BoxIcon
// Body padding: p-4
// Category badge: <Badge variant="light" color="primary" size="sm">
// Product name: text-sm font-semibold text-gray-800 dark:text-white/90 mt-1
// Price: text-lg font-bold text-brand-500 mt-1
// Stock: show "Out of Stock" badge if stock === 0
// Link to /shop/[id]
```

## app/(web)/layout.tsx

```tsx
import StorefrontHeader from "@/shared/components/storefront/StorefrontHeader";
import Footer from "@/shared/components/storefront/Footer";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StorefrontLayout({ children }) {
  return (
    <QueryProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
        <ToastContainer position="top-right" autoClose={3000} />
        <StorefrontHeader />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </QueryProvider>
  );
}
```

## app/(web)/page.tsx — Home

```tsx
// Hero section:
// className: "bg-brand-500 text-white py-20 px-4 text-center"
// h1: "Shop the Best Products" (text-4xl font-bold)
// p: "Quality products, great prices, fast delivery" (text-lg mt-4 opacity-90)
// Link to /shop: "bg-white text-brand-500 hover:bg-gray-100 rounded-lg px-8 py-3 font-semibold mt-8 inline-block"

// Featured Products section:
// h2: "Featured Products" (text-2xl font-semibold text-gray-800 dark:text-white/90)
// GET /products?limit=8&status=ACTIVE
// Grid: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5

// Categories section:
// h2: "Shop by Category"
// GET /categories (root only — no parentId)
// Grid of category cards: rounded-2xl border p-5 text-center hover:border-brand-500 cursor-pointer
// Each links to /shop?category=[id]
```

## app/(web)/shop/page.tsx — Product Listing

```tsx
// Page heading: "Shop" + product count
// Filter bar:
//   Search input (filterInputClass from patterns.md)
//   Category select (all categories flattened)
//   Status hidden (always ACTIVE for storefront)
// Product grid: grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5
// Ant Design Pagination at bottom
// Loading: skeleton cards (grey animated divs, same card shape)
// Empty: centered "No products found" + "Clear filters" button
// URL params: ?page=1&search=&category=
```

## app/(web)/shop/[id]/page.tsx — Product Detail

```tsx
// Two column layout: lg:grid-cols-2 gap-8
// Left column — Image:
//   if imageUrl: <img> with object-cover rounded-2xl aspect-square
//   else: grey rounded-2xl with BoxIcon centered
// Right column — Details:
//   Category badge (brand-50 text-brand-500 rounded-full px-3 py-1 text-xs)
//   Product name: text-3xl font-bold text-gray-900 dark:text-white mt-2
//   Price: text-2xl font-bold text-brand-500 mt-2
//   Stock badge: success if stock > 0, error if stock === 0
//   Divider: border-t border-gray-200 dark:border-gray-800 my-4
//   Description: text-gray-600 dark:text-gray-400
//   Quantity selector:
//     <button onClick={decrease}>−</button>
//     <span>{qty}</span>
//     <button onClick={increase}>+</button>
//   Add to Cart button (bg-brand-500, full width, disabled if out of stock)
//   On click: cartStore.addItem(), toast.success('Added to cart')
// GET /products/:id
```

## app/(web)/cart/page.tsx — Cart

```tsx
// If empty:
//   centered py-20
//   BoxIcon (h-16 w-16 text-gray-300)
//   "Your cart is empty"
//   Link to /shop: bg-brand-500 button

// If has items:
// Two column: main cart left, summary right (lg:grid-cols-3, main takes col-span-2)

// Cart table (left):
//   rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900
//   Rows: product thumb | name+sku | unit price | qty stepper | subtotal | remove btn
//   Qty stepper: minus btn | input | plus btn
//   Remove: trash icon button (hover:text-error-500)

// Summary card (right):
//   rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900
//   "Order Summary" heading
//   Items count
//   Subtotal: formatPrice(totalAmount())
//   divider
//   Total: text-xl font-bold text-gray-800 dark:text-white/90
//   "Proceed to Checkout" button (bg-brand-500, full width)
//   → /checkout
```

## app/(web)/checkout/page.tsx — Checkout

```tsx
// If not logged in: redirect to /auth/login?redirect=/checkout
// Two columns: summary left, payment right

// Left — Order summary:
//   Cart items list (read-only)
//   Total amount

// Right — Payment method:
//   "Select Payment Method" heading
//   Two cards:
//   Stripe card:
//     className (unselected): "rounded-2xl border-2 border-gray-200 p-5 cursor-pointer hover:border-brand-300 dark:border-gray-700"
//     className (selected): "rounded-2xl border-2 border-brand-500 p-5 cursor-pointer ring-2 ring-brand-500/20"
//     Content: credit card icon, "Stripe", "Pay with credit/debit card"
//   bKash card:
//     Same styling, icon + "bKash" + "Mobile banking payment"

//   "Place Order" button (bg-brand-500 full width):
//     1. POST /orders { items: cartItems.map(i => ({ productId, quantity })) }
//     2. POST /orders/:id/checkout { provider: 'stripe' | 'bkash' }
//     3. Stripe → redirect to /checkout/stripe?secret=...&orderId=...
//     4. bKash → redirect to bKash URL from response
//     5. On error → toast.error(message)
```

## app/(web)/checkout/success/page.tsx

```tsx
// Centered content py-20
// Green checkmark circle (bg-success-50, checkmark icon text-success-500, h-20 w-20)
// h2: "Payment Successful!" (text-2xl font-bold text-gray-800 dark:text-white/90)
// p: "Your order has been placed successfully."
// If orderId in URL params: show "Order #[id]" in gray
// Two buttons side by side:
//   "View My Orders" → /account/orders (bg-brand-500)
//   "Continue Shopping" → /shop (outline)
```

## app/(web)/checkout/failed/page.tsx

```tsx
// Centered content py-20
// Red X circle (bg-error-50, x icon text-error-500, h-20 w-20)
// h2: "Payment Failed"
// p: "Something went wrong with your payment. Please try again."
// Two buttons:
//   "Try Again" → /checkout (bg-brand-500)
//   "View Orders" → /account/orders (outline)
```

## Design rules (non-negotiable)

- Price: always formatPrice(poisha) — divide by 100, ৳ symbol
- Empty states: always have an icon + message + CTA button
- Loading: skeleton divs, never blank white space
- Dark mode: every className has dark: variant
- Buttons: bg-brand-500 hover:bg-brand-600 for primary actions

After completing: run /r-done
Log to .claude/tasks/logs/YYYY-MM-DD-storefront.md

```

---

**Prompt 4 — Frontend: Account pages:**

```

Build all account pages for raco-frontend (logged-in customer area).
Read .claude/memory/patterns.md for all design rules.

## Setup

### src/lib/api/account.ts

```typescript
import { apiClient } from "@/lib/api/apiClient";

export const accountApi = {
  getMe: () => apiClient.get<any>("/users/me"),
  updateMe: (data: { name: string }) => apiClient.patch<any>("/users/me", data),
  getMyOrders: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<{ items: any[]; total: number }>(
      `/users/me/orders?${new URLSearchParams((params || {}) as Record<string, string>)}`,
    ),
  getMyPayments: (params?: Record<string, string | number | undefined>) =>
    apiClient.get<{ items: any[]; total: number }>(
      `/users/me/payments?${new URLSearchParams((params || {}) as Record<string, string>)}`,
    ),
};
```

### Price helper (if not already created)

src/shared/utils/formatPrice.ts:

```typescript
export const formatPrice = (poisha: number): string =>
  `৳ ${(poisha / 100).toLocaleString("en-BD")}`;
```

## app/(account)/layout.tsx

```tsx
"use client";
import AuthGuard from "@/lib/auth/AuthGuard";
import StorefrontHeader from "@/shared/components/storefront/StorefrontHeader";
import Footer from "@/shared/components/storefront/Footer";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { QueryProvider } from "@/lib/providers/QueryProvider";

const navLinks = [
  { href: "/account/dashboard", label: "Dashboard" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/orders", label: "My Orders" },
  { href: "/account/payments", label: "Payments" },
];

export default function AccountLayout({ children }) {
  return (
    <AuthGuard>
      <QueryProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <StorefrontHeader />
          <div className="flex-1 mx-auto max-w-screen-xl w-full px-4 py-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Side nav */}
              <aside className="w-full lg:w-56 shrink-0">
                <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                  <nav className="flex flex-col gap-1">
                    {navLinks.map((link) => (
                      <SideNavItem
                        key={link.href}
                        href={link.href}
                        label={link.label}
                      />
                    ))}
                  </nav>
                </div>
              </aside>
              {/* Main content */}
              <main className="flex-1">{children}</main>
            </div>
          </div>
          <Footer />
        </div>
      </QueryProvider>
    </AuthGuard>
  );
}

// SideNavItem uses usePathname to apply menu-item-active / menu-item-inactive classes
// Active: bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12] dark:text-brand-400
// Inactive: text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5
```

## app/(account)/dashboard/page.tsx — Account Dashboard

```tsx
// Heading: "Welcome back, {user.name}"
// Subtitle: "Manage your orders and account settings"

// Stat cards row (grid grid-cols-1 sm:grid-cols-3 gap-5):
// Card pattern: rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900
//   Card 1: "Total Orders" — count from getMyOrders({ limit: 1 }).total
//   Card 2: "Total Spent" — sum of paid orders totalAmount (formatPrice)
//   Card 3: "Pending Orders" — count of status=PENDING

// Recent Orders section:
// h3: "Recent Orders" (text-base font-semibold text-gray-800 dark:text-white/90 mb-4)
// Table with last 5 orders (GET /users/me/orders?limit=5)
// Columns: Order ID (truncated) | Total | Status Badge | Date | View link
// "View all orders →" link to /account/orders
```

## app/(account)/profile/page.tsx — Profile

```tsx
// Two section cards:

// Card 1 — Personal Info:
// h3: "Personal Information"
// Formik form:
//   Name field (editable, text input, inputClass from patterns.md)
//   Email field (read-only, bg-gray-50 dark:bg-gray-800)
//   Role badge (read-only display)
//   Submit: "Save Changes" → PATCH /users/me → toast.success('Profile updated')

// Card 2 — Change Password:
// h3: "Change Password"
// Fields: current password, new password, confirm new password
// Submit → POST /auth/change-password (or whatever the endpoint is)
// If endpoint doesn't exist yet — show a note "Coming soon"
// Show/hide password toggle on each field

// Use exact inputClass:
const inputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";
```

## app/(account)/orders/page.tsx — My Orders

```tsx
// Heading: "My Orders" + total count
// Filter: status select (All / Pending / Paid / Canceled)

// Ant Design Table columns:
// 1. Order ID — first 8 chars + "..." (monospace text-xs text-gray-500)
// 2. Items — count of order.items
// 3. Total — formatPrice(totalAmount)
// 4. Status — Badge: pending=warning, paid=success, canceled=error
// 5. Date — dayjs(createdAt).format('DD MMM YYYY')
// 6. Actions — "View" link to /account/orders/[id]

// GET /users/me/orders?page=1&limit=10&status=
// Ant Design Pagination at bottom
// Empty: "No orders yet" + "Start Shopping" button → /shop
```

## app/(account)/orders/[id]/page.tsx — Order Detail

```tsx
// "← Back to Orders" link (text-sm text-brand-500 hover:text-brand-600 mb-4)

// Card 1 — Order Info:
// rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900
// Grid 3 cols:
//   Order ID (full, monospace text-xs)
//   Status badge
//   Date: dayjs format

// Card 2 — Items:
// h3: "Order Items"
// Table: image thumbnail | product name | qty | unit price | subtotal
// Footer row: "Total" right-aligned | formatPrice(totalAmount) bold

// Card 3 — Payment:
// h3: "Payment Details"
// Provider: "Stripe" or "bKash" badge
// Transaction ID (monospace, truncated with copy button)
// Payment status badge
// Amount

// GET /users/me/orders/:id (or /orders/:id — whichever exists)
```

## app/(account)/payments/page.tsx — Payment History

```tsx
// Heading: "Payment History" + total count
// Filter: provider select (All / Stripe / bKash) + status select

// Ant Design Table columns:
// 1. # — row number
// 2. Transaction ID — first 12 chars + "..." (monospace text-xs)
//    Copy icon button that copies full ID to clipboard
// 3. Order ID — first 8 chars link to /account/orders/[orderId]
// 4. Provider — Badge: stripe=primary, bkash=success
// 5. Amount — formatPrice(amount)
// 6. Status — Badge: pending=warning, success=success, failed=error
// 7. Date — dayjs format

// GET /users/me/payments?page=1&limit=10
// Empty: "No payment history yet" + "Start Shopping" → /shop
```

## Design rules (non-negotiable)

- All cards: rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900
- All headings: text-xl font-semibold text-gray-800 dark:text-white/90
- All subtitles: text-sm text-gray-500 dark:text-gray-400
- Empty states: icon + message + CTA button — never a blank table
- Loading states: skeleton or Ant Design Table loading spinner
- formatPrice() for every money value — never raw poisha numbers

After completing: run /r-done
Log to .claude/tasks/logs/YYYY-MM-DD-account-pages.md

```

```
