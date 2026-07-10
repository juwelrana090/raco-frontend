Found **20 bugs** across the entire frontend. Let me write the comprehensive fix prompt.

````
Fix all 20 bugs found in raco-frontend. Work file by file in order.
Read each file before editing it.

---

## BUG CATALOG (reference during fixes)

**Critical — runtime crashes:**
B1. apiClient: wrong default port (3001 vs 4000)
B2. apiClient: non-wrapped responses fail (categories[], products/:id, users/me)
B3. apiClient: 204 No Content crashes on response.json()
B4. IProductListResponse: reads pagination.* from wrong field paths
B5. IOrder: wrong field names (shortId, customer, total, status case)
B6. IPayment: wrong field names (transactionId, provider/status case)
B7. ICategory: has `slug` field that doesn't exist in backend
B8. (account) layout: nav links point to /account/* but route group removes that prefix
B9. account/orders: reads `data?.items` but response is an array after unwrap
B10. admin orders API: calls GET /orders (user scoped) instead of GET /orders/admin/all
B11. storefront homepage: reads `productsData?.items` but backend returns `products` key
B12. ProductsContext: reads `data?.total/page/totalPages` but they're nested in `pagination`

**Major — wrong data / broken UI:**
B13. IProduct has `status` field not in backend
B14. admin dashboard empty stub (no stats)
B15. OrdersTable reads shortId, customer.name, total, paymentProvider — all undefined
B16. AccountDashboard reads order.total (should be totalAmount), wrong status case
B17. profile update doesn't sync auth store → stale name in header
B18. register always redirects to /admin/dashboard (should check role)
B19. payments admin always empty (stub API with console.warn)
B20. authApi.validate returns `{user: IUser}` but typed as `IUser`

---

## FIX 1 — src/lib/api/apiClient.ts (B1, B2, B3)

Replace the entire file:

```typescript
import Cookies from 'js-cookie';

class ApiClient {
  private baseUrl: string;

  constructor() {
    // B1 fixed: default is 4000, not 3001
    this.baseUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1';
  }

  private getHeaders(): HeadersInit {
    const token = this.getToken();
    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  private getToken(): string | null {
    if (typeof window !== 'undefined') return Cookies.get('raco_token') ?? null;
    return null;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      ...options,
      headers: { ...this.getHeaders(), ...options?.headers },
    };

    try {
      const response = await fetch(url, config);

      // B3 fixed: 204 No Content has no body — return undefined cast as T
      if (response.status === 204) return undefined as unknown as T;

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(errorData.message || `Request failed with status ${response.status}`);
      }

      const result = await response.json();

      // B2 fixed: handle both wrapped { success, message, data } and direct responses
      // Wrapped: backend controllers that return { success: true, message: "...", data: T }
      // Direct: controllers that return entity/array directly (categories, products/:id, users/me)
      if (
        result !== null &&
        typeof result === 'object' &&
        !Array.isArray(result) &&
        'success' in result &&
        'data' in result
      ) {
        if (!result.success) throw new Error(result.message || 'Request failed');
        return result.data as T;
      }

      // Direct response (array or plain object without success wrapper)
      return result as T;
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) });
  }

  async patch<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) });
  }

  async put<T>(endpoint: string, body?: unknown): Promise<T> {
    return this.request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
````

---

## FIX 2 — src/lib/api/types.ts (B20)

Replace the entire file:

```typescript
export interface IUser {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  updatedAt: string;
}

export interface IAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}

export interface ILoginRequest {
  email: string;
  password: string;
}

export interface IRegisterRequest {
  name: string;
  email: string;
  password: string;
}

// B20 fixed: validate returns { user: IUser } not IUser directly
export interface IValidateResponse {
  user: IUser;
}
```

---

## FIX 3 — src/lib/api/auth.ts (B20)

Replace the entire file:

```typescript
import { apiClient } from "./apiClient";
import type { IUser, IAuthResponse, IValidateResponse } from "./types";

export const authApi = {
  login: (email: string, password: string) =>
    apiClient.post<IAuthResponse>("/auth/login", { email, password }),

  register: (name: string, email: string, password: string) =>
    apiClient.post<IAuthResponse>("/auth/register", { name, email, password }),

  refresh: (refreshToken: string) =>
    apiClient.post<{ accessToken: string; refreshToken: string }>(
      "/auth/refresh",
      { refreshToken },
    ),

  logout: (refreshToken: string) =>
    apiClient.post<void>("/auth/logout", { refreshToken }),

  // B20 fixed: returns { user: IUser } not IUser
  validate: () => apiClient.get<IValidateResponse>("/auth/validate"),
};
```

---

## FIX 4 — src/modules/products/types/index.ts (B4, B13)

Replace the entire file:

```typescript
// B13 fixed: removed 'status' field — backend Product has no status
// B4 fixed: pagination is nested under pagination object
export interface IProduct {
  id: string;
  name: string;
  sku: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
  fileManagerId?: number | null;
  categoryId: string;
  category?: {
    id: string;
    name: string;
  } | null;
  createdAt: string;
  updatedAt: string;
}

export interface IProductPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// B4 fixed: real backend structure has { products, pagination }
export interface IProductListResponse {
  products: IProduct[];
  pagination: IProductPagination;
}

export interface IProductFilters {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
```

---

## FIX 5 — src/modules/products/contexts/ProductsContext.tsx (B4)

Replace the full file to read `pagination.*` correctly:

```tsx
"use client";
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { useFetchProducts } from "../hooks/useFetchProducts";
import type { IProduct, IProductFilters } from "../types";

interface ProductsContextValue {
  products: IProduct[];
  total: number;
  page: number;
  totalPages: number;
  isLoading: boolean;
  filters: IProductFilters;
  setFilters: (filters: IProductFilters) => void;
  setSearch: (search: string) => void;
  setCategory: (categoryId: string) => void;
  setPage: (page: number) => void;
  refetch: () => void;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [filters, setFilters] = useState<IProductFilters>({
    page: 1,
    limit: 10,
  });
  const { data, isLoading, refetch } = useFetchProducts(filters);

  const setSearch = useCallback(
    (search: string) => setFilters((p) => ({ ...p, search, page: 1 })),
    [],
  );
  const setCategory = useCallback(
    (categoryId: string) => setFilters((p) => ({ ...p, categoryId, page: 1 })),
    [],
  );
  const setPage = useCallback(
    (page: number) => setFilters((p) => ({ ...p, page })),
    [],
  );

  return (
    <ProductsContext.Provider
      value={{
        products: data?.products ?? [],
        // B4 fixed: read from pagination object
        total: data?.pagination?.total ?? 0,
        page: data?.pagination?.page ?? 1,
        totalPages: data?.pagination?.totalPages ?? 0,
        isLoading,
        filters,
        setFilters,
        setSearch,
        setCategory,
        setPage,
        refetch,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context)
    throw new Error("useProducts must be used within a ProductsProvider");
  return context;
}
```

---

## FIX 6 — src/modules/products/components/AddProductForm.tsx (B13)

Remove `status` field from form entirely. In the validationSchema, remove the status validation. In `ProductFormValues`, remove `status`. In the initialValues, remove `status: 'active'`. Remove the Status `<Field>` and its label from the JSX.

Also remove the `status` field from `EditProductForm.tsx` the same way.

For both files: find every occurrence of `status` related to the product form field and remove it. The `status: _status, ...payload` destructure in `useCreateProduct.ts` and `useUpdateProduct.ts` already strips it before the API call, so those hooks are fine as-is.

---

## FIX 7 — src/modules/categories/types/index.ts (B7)

Replace the entire file:

```typescript
// B7 fixed: removed 'slug' and 'productCount' — not in backend schema
export interface ICategory {
  id: string;
  name: string;
  description?: string | null;
  parentId?: string | null;
  children?: ICategory[];
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryFilters {
  search?: string;
  page?: number;
  limit?: number;
}
```

---

## FIX 8 — src/modules/orders/types/index.ts (B5, B15)

Replace the entire file:

```typescript
// B5 fixed: field names match actual backend response
// Backend Order: { id, userId, totalAmount, status: PENDING|PAID|CANCELED, items, createdAt, updatedAt }
// Backend OrderItem: { id, orderId, productId, quantity, price, subtotal, createdAt }

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number; // price snapshot in poisha
  subtotal: number; // price * quantity
  createdAt: string;
}

export interface IOrder {
  id: string;
  userId: string;
  totalAmount: number; // in poisha
  status: "PENDING" | "PAID" | "CANCELED"; // uppercase
  items?: IOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IOrderListResponse {
  items: IOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface IOrderFilters {
  status?: string;
  page?: number;
  limit?: number;
}
```

---

## FIX 9 — src/modules/orders/api/index.ts (B10)

Replace the entire file:

```typescript
import { apiClient } from "@/lib/api/apiClient";
import type { IOrder, IOrderListResponse } from "../types";

export const ordersApi = {
  // B10 fixed: admin uses GET /orders/admin/all, not GET /orders
  getAll: (filters?: { status?: string; page?: number; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));
    const q = params.toString();
    return apiClient.get<IOrderListResponse>(
      `/orders/admin/all${q ? `?${q}` : ""}`,
    );
  },

  getById: (id: string) => apiClient.get<IOrder>(`/orders/${id}`),

  create: (items: { productId: string; quantity: number }[]) =>
    apiClient.post<IOrder>("/orders", { items }),

  checkout: (id: string, provider: "STRIPE" | "BKASH") =>
    apiClient.post<any>(`/orders/${id}/checkout`, { provider }),

  cancel: (id: string) => apiClient.delete<IOrder>(`/orders/${id}`),
};
```

---

## FIX 10 — src/modules/orders/contexts/OrdersContext.tsx

Update to read `data?.items ?? []` instead of `data?.orders ?? []`:

In the return `<OrdersContext.Provider value={...}>`, change:

```typescript
// OLD
orders: data?.orders ?? [],
// NEW
orders: data?.items ?? [],
```

---

## FIX 11 — src/modules/orders/components/OrdersTable.tsx (B15)

Replace the entire file to use correct field names:

```tsx
"use client";
import { Table } from "antd";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useOrders } from "../contexts/OrdersContext";
import Badge from "@/shared/components/ui/badge/Badge";
import type { IOrder } from "../types";
import type { ColumnsType } from "antd/es/table";

function formatPrice(price: number): string {
  return `৳ ${(price / 100).toLocaleString()}`;
}

const statusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELED: "error",
};

export default function OrdersTable() {
  const { orders, total, isLoading, page, setPage } = useOrders();
  const router = useRouter();

  const columns: ColumnsType<IOrder> = [
    {
      title: "#",
      width: 50,
      render: (_: unknown, __: unknown, index: number) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {(page - 1) * 10 + index + 1}
        </span>
      ),
    },
    {
      title: "Order ID",
      dataIndex: "id",
      // B15 fixed: use id.slice(0,8) since shortId doesn't exist
      render: (id: string) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          #{id?.slice(0, 8)}...
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      // B15 fixed: backend has userId not customer.name
      render: (userId: string) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {userId?.slice(0, 8)}...
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      // B15 fixed: totalAmount not total
      render: (totalAmount: number) => (
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
          {formatPrice(totalAmount ?? 0)}
        </span>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items: IOrder["items"]) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {items?.length ?? 0}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      // B15 fixed: status is uppercase PENDING|PAID|CANCELED
      render: (status: string) => (
        <Badge color={statusColor[status] ?? "light"}>
          {status?.toLowerCase()}
        </Badge>
      ),
    },
    {
      title: "Date",
      dataIndex: "createdAt",
      render: (date: string) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {dayjs(date).format("MMM D, YYYY")}
        </span>
      ),
    },
    {
      title: "Actions",
      width: 80,
      render: (_: unknown, record: IOrder) => (
        <button
          onClick={() => router.push(`/admin/orders/${record.id}`)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800">
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (t, range) =>
            `Showing ${range[0]}-${range[1]} of ${t} orders`,
        }}
        scroll={{ x: 700 }}
      />
    </div>
  );
}
```

---

## FIX 12 — src/modules/payments/types/index.ts (B6)

Replace the entire file:

```typescript
// B6 fixed: field names match actual backend PaymentResponseDto
export interface IPayment {
  id: string;
  orderId: string; // B6: was order.id — now direct orderId string
  provider: "STRIPE" | "BKASH"; // B6: uppercase to match backend enum
  providerTxnId?: string | null; // B6: was transactionId
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"; // B6: uppercase
  clientSecret?: string | null;
  bkashURL?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentListResponse {
  items: IPayment[];
  total: number;
  page: number;
  limit: number;
}

export interface IPaymentFilters {
  status?: string;
  provider?: string;
  page?: number;
  limit?: number;
}
```

---

## FIX 13 — src/modules/payments/api/index.ts (B19)

Replace the entire file — use the real backend endpoint:

```typescript
import { apiClient } from "@/lib/api/apiClient";
import type { IPayment, IPaymentListResponse } from "../types";

export const paymentsApi = {
  // B19 fixed: use real backend endpoint GET /payments/admin/all
  getAll: (filters?: {
    status?: string;
    provider?: string;
    page?: number;
    limit?: number;
  }) => {
    const params = new URLSearchParams();
    if (filters?.status) params.append("status", filters.status);
    if (filters?.provider) params.append("provider", filters.provider);
    if (filters?.page) params.append("page", String(filters.page));
    if (filters?.limit) params.append("limit", String(filters.limit));
    const q = params.toString();
    return apiClient.get<IPaymentListResponse>(
      `/payments/admin/all${q ? `?${q}` : ""}`,
    );
  },

  getById: (id: string) => apiClient.get<IPayment>(`/payments/${id}`),

  getByOrderId: (orderId: string) =>
    apiClient.get<IPayment[]>(`/payments/order/${orderId}`),

  create: (orderId: string, provider: "STRIPE" | "BKASH") =>
    apiClient.post<any>("/payments", { orderId, provider }),
};
```

---

## FIX 14 — src/modules/payments/contexts/PaymentsContext.tsx

Update to read `data?.items ?? []` instead of `data?.payments ?? []`:

```typescript
// Change in the Provider value:
payments: data?.items ?? [],
```

---

## FIX 15 — src/modules/payments/components/PaymentsTable.tsx

Fix status and provider field names to uppercase:

```typescript
const statusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "error",
  REFUNDED: "light",
};
```

Also fix dataIndex references:

- `dataIndex: 'transactionId'` → `dataIndex: 'providerTxnId'`
- `dataIndex: 'order'` for order reference → use `dataIndex: 'orderId'`

Display status and provider as lowercase in the UI:

```tsx
render: (status: string) => (
  <Badge color={statusColor[status] ?? "light"}>{status?.toLowerCase()}</Badge>
);
render: (provider: string) => (
  <Badge color={provider === "STRIPE" ? "primary" : "success"}>
    {provider?.toLowerCase()}
  </Badge>
);
```

---

## FIX 16 — src/app/(account)/layout.tsx (B8)

Fix nav links — (account) is a route group so it removes `account/` from URLs:

```typescript
// B8 fixed: remove /account/ prefix — route group (account) is not in URL
const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/orders", label: "My Orders" },
  { href: "/payments", label: "Payments" },
];
```

---

## FIX 17 — src/app/(account)/orders/page.tsx (B9, B5, B16)

Fix response reading:

```typescript
// The backend GET /users/me/orders wraps in { success, message, data: [...array] }
// After apiClient unwraps: data IS the array
// B9 fixed: data is a direct array, not { items, total }

// Replace:
const orders: any[] = (data as any)?.items ?? [];
const total: number = (data as any)?.total ?? 0;

// With:
const orders: any[] = Array.isArray(data) ? (data as any[]) : [];
const total: number = orders.length;
```

Also fix field references in the table rows:

```tsx
// B5 fixed: totalAmount not total, uppercase status
<td>{formatPrice(order.totalAmount ?? 0)}</td>
<td>
  <Badge color={statusColor[order.status] ?? 'light'}>
    {order.status?.toLowerCase()}
  </Badge>
</td>
// B5 fixed: no shortId, use id
<td className="font-mono text-xs">{order.id?.slice(0, 8)}...</td>
```

Update `statusColor` map to uppercase:

```typescript
const statusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELED: "error",
};
```

---

## FIX 18 — src/app/(account)/dashboard/page.tsx (B16)

Fix field name and status case:

```typescript
// B16 fixed: totalAmount not total
const totalSpent = recentOrders
  .filter((o) => o.status === "PAID") // uppercase
  .reduce((sum, o) => sum + (o.totalAmount ?? 0), 0);
```

In the recent orders table:

```tsx
// totalAmount not total
{
  formatPrice(order.totalAmount ?? 0);
}
// uppercase status
<Badge color={statusColor[order.status] ?? "light"}>
  {order.status?.toLowerCase()}
</Badge>;
```

Also fix the data reading — `GET /users/me/orders` returns wrapped `{ data: [...] }`:

```typescript
// Replace
const recentOrders: any[] = (recentOrdersData as any)?.items ?? [];
// With
const recentOrders: any[] = Array.isArray(recentOrdersData)
  ? (recentOrdersData as any[])
  : [];
```

---

## FIX 19 — src/app/(account)/profile/page.tsx (B17)

After successful profile update, sync the auth store:

```typescript
// Add import
import { useAuthStore } from '@/lib/auth/authStore';

// In the component, destructure setAuth from store
const { user, setAuth, token } = useAuthStore();

// In profileForm.onSubmit, after successful update:
onSubmit: async (values) => {
  try {
    const updated = await accountApi.updateMe({ name: values.name });
    // B17 fixed: update auth store so header name refreshes immediately
    if (updated && token) {
      const refreshToken = Cookies.get('raco_refresh') ?? '';
      setAuth(
        { ...(user!), name: values.name },
        token,
        refreshToken
      );
    }
    toast.success('Profile updated');
  } catch (err: any) {
    toast.error(err?.message ?? 'Failed to update profile');
  }
},
```

Add `import Cookies from 'js-cookie';` at top.

---

## FIX 20 — src/app/auth/register/page.tsx (B18)

Fix redirect after registration — check role:

```typescript
// B18 fixed: redirect based on role, not always admin
onSubmit={async (values, { setSubmitting }) => {
  try {
    const res = await authApi.register(values.name, values.email, values.password);
    authStore.setAuth(res.user, res.accessToken, res.refreshToken);
    toast.success('Account created successfully!');
    // Route based on role
    if (res.user.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/');
    }
  } catch (err) {
    toast.error(err instanceof Error ? err.message : 'Registration failed');
  } finally {
    setSubmitting(false);
  }
}}
```

---

## FIX 21 — src/app/(web)/page.tsx (B11)

Fix products key from `items` to `products`:

```typescript
// B11 fixed: backend returns { products: [], pagination: {} } not { items: [] }
const products: any[] = (productsData as any)?.products ?? [];
const categories: any[] = Array.isArray(categoriesData)
  ? (categoriesData as any[]).filter((c: any) => !c.parentId)
  : [];
```

---

## FIX 22 — src/app/(web)/shop/page.tsx (B11)

Fix same products key:

```typescript
// B11 fixed
const products: any[] = (productsData as any)?.products ?? [];
const total: number = (productsData as any)?.pagination?.total ?? 0;
```

---

## FIX 23 — src/app/admin/dashboard/page.tsx (B14)

Replace the stub with a real dashboard:

```tsx
"use client";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiClient } from "@/lib/api/apiClient";

export default function DashboardPage() {
  const { data: productsData } = useQuery({
    queryKey: ["admin-stats-products"],
    queryFn: () => apiClient.get<any>("/products?limit=1"),
  });

  const stats = [
    {
      label: "Total Products",
      value: (productsData as any)?.pagination?.total ?? "—",
      href: "/admin/products",
      color: "text-brand-500",
    },
    {
      label: "Orders",
      value: "—",
      href: "/admin/orders",
      color: "text-success-600",
    },
    {
      label: "Payments",
      value: "—",
      href: "/admin/payments",
      color: "text-warning-600",
    },
    {
      label: "Users",
      value: "—",
      href: "/admin/users",
      color: "text-error-600",
    },
  ];

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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s) => (
          <Link key={s.label} href={s.href}>
            <div className="rounded-2xl border border-gray-200 bg-white p-5 hover:shadow-md transition-shadow dark:border-gray-800 dark:bg-gray-900 cursor-pointer">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {s.label}
              </p>
              <p className={`text-3xl font-bold mt-1 ${s.color}`}>{s.value}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
```

---

## FIX 24 — src/app/admin/orders/[id]/page.tsx (B5)

Fix field names from backend:

```typescript
// Replace shortId references
<h2>Order #{order.id?.slice(0, 8)}</h2>

// Replace order.total
{formatPrice(order.totalAmount ?? 0)}

// Replace status color map to uppercase
const statusColor: Record<string, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  PAID: 'success',
  CANCELED: 'error',
};
```

---

## FIX 25 — src/app/(account)/orders/[id]/page.tsx

Apply same field name fixes:

```typescript
// totalAmount not total
// uppercase status
// no shortId
```

---

## VERIFY

```bash
pnpm dev
```

Test checklist:

1. http://localhost:3000/auth/login → login works, admin goes to /admin/dashboard, user goes to /
2. http://localhost:3000/auth/register → register works, redirects by role
3. http://localhost:3000/ → homepage loads products from `products` key
4. http://localhost:3000/shop → shop loads with correct pagination
5. http://localhost:3000/admin/products → table loads, pagination shows real total
6. http://localhost:3000/admin/categories → tree loads (no slug errors)
7. http://localhost:3000/admin/orders → orders table loads with ID, totalAmount, status
8. http://localhost:3000/admin/payments → payments table loads (not empty stub)
9. http://localhost:3000/dashboard → account dashboard loads (route group URL, no /account/ prefix)
10. http://localhost:3000/orders → account orders load with correct total amounts
11. http://localhost:3000/profile → update name → header refreshes immediately

TypeScript compile check:

```bash
npx tsc --noEmit
```

Expected: 0 errors.

After completing: run /r-done
Log to .claude/memory/gotchas.md:

- apiClient must handle both wrapped { success, data } and direct responses
- 204 No Content must be handled before response.json() call
- Route group (account) removes the group name from URL
- Backend Product has no status field — only stock
- All enums from backend are UPPERCASE (PAID, STRIPE, PENDING)
- GET /orders returns current user's orders — admin uses GET /orders/admin/all
- GET /categories returns array directly (no wrapper)
- products pagination is nested as { products, pagination: { total, page, totalPages } }

```


Now I have the complete picture. Let me document every issue found across the entire codebase.

```

Full raco-frontend audit and fix. Read every file before touching it.
22 bugs found — fix in order below.

---

## AUDIT REPORT

### AUTH PERSISTENCE

- [A1] Hard reload redirects admin to / — AuthGuard checks user?.role but user is null on reload
- [A2] authStore never persists user object — only token in cookie

### ROUTE/NAVIGATION BUGS

- [R1] (account) layout nav links wrong — use /account/\* but route group removes that prefix
- [R2] checkout/success links to /account/orders — should be /orders
- [R3] checkout/failed links to /account/orders — should be /orders
- [R4] account/orders/[id] back link → /account/orders — should be /orders
- [R5] admin sidebar links to /admin/profile — page doesn't exist
- [R6] ProductsPage edit button pushes /admin/products/edit/:id — should be /admin/products/:id/edit

### DATA FIELD BUGS

- [D1] ProductsPage reads productsData?.total — wrong; should be pagination?.total
- [D2] ProductsPage column uses dataIndex 'quantity' — backend field is 'stock'
- [D3] lib/api/products.ts IProductListResponse missing pagination field
- [D4] account/payments reads data?.items but /users/me/payments returns array after unwrap
- [D5] account/payments statusColor uses lowercase — backend uses uppercase
- [D6] admin/users/[id] uses order.shortId, order.total — wrong field names
- [D7] UsersPage reads data?.users — backend returns data.items
- [D8] lib/api/orders.ts calls GET /orders (user-scoped) not GET /orders/admin/all

### STUB APIs (empty pages)

- [S1] lib/api/users.ts — getAll, getById, updateRole all stubs with console.warn
- [S2] Users admin page always empty

### MISSING CATEGORIES LOAD IN FORMS

- [F1] AddProductPage passes empty categories=[] hardcoded — form dropdown always empty
- [F2] AddCategoryPage passes empty categories=[] hardcoded — parent dropdown empty
- [F3] admin/categories/[id]/edit passes empty categories=[] hardcoded

### MISSING PAGE

- [M1] /admin/profile page doesn't exist but sidebar links to it

---

## FIX A1+A2 — Auth persistence on hard reload

File: src/lib/auth/authStore.ts (FULL REWRITE)

Use zustand persist middleware to save user object in localStorage.
On hard reload, user is restored from localStorage instead of being null.

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";
import Cookies from "js-cookie";
import type { IUser } from "@/lib/api/types";

interface AuthStore {
  user: IUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: IUser, token: string, refreshToken: string) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      // A2 fixed: user starts as null but is restored from localStorage on reload
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
    }),
    {
      name: "raco-auth", // localStorage key
      partialize: (state) => ({
        // only persist user + isAuthenticated
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    },
  ),
);
```

---

## FIX A1 — AuthGuard handles user=null during hydration

File: src/lib/auth/AuthGuard.tsx (FULL REWRITE)

```typescript
'use client';
import { useAuthStore } from './authStore';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  // A1 fixed: wait for zustand persist to hydrate before checking auth
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace('/auth/login');
      return;
    }

    // A1 fixed: only redirect if user is loaded AND role doesn't match
    // Don't redirect if user is still null (hydrating from localStorage)
    if (requiredRole === 'ADMIN' && user !== null && user?.role !== 'ADMIN') {
      router.replace('/');
    }
  }, [hydrated, isAuthenticated, user, requiredRole, router]);

  // Show nothing while hydrating
  if (!hydrated) return null;
  if (!isAuthenticated) return null;

  // A1 fixed: if user null but authenticated (token valid), show children
  // The user will load from persist on next render tick
  if (requiredRole === 'ADMIN' && user !== null && user?.role !== 'ADMIN') {
    return null;
  }

  return <>{children}</>;
}
```

---

## FIX R1 — (account) layout nav links

File: src/app/(account)/layout.tsx

Change navLinks to remove /account/ prefix:

```typescript
// R1 fixed: (account) route group removes 'account' from URL
const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/orders", label: "My Orders" },
  { href: "/payments", label: "Payments" },
];
```

Also fix isActive logic — update SideNavItem to work without /account/ prefix:

```typescript
// The current logic is fine — just ensure hrefs match
```

---

## FIX R2+R3 — checkout links to correct account routes

File: src/app/(web)/checkout/success/page.tsx

Change:

```tsx
href = "/account/orders";
```

To:

```tsx
href = "/orders";
```

File: src/app/(web)/checkout/failed/page.tsx

Change:

```tsx
href = "/account/orders";
```

To:

```tsx
href = "/orders";
```

---

## FIX R4 — account orders detail back link

File: src/app/(account)/orders/[id]/page.tsx

Change every occurrence of:

```tsx
href = "/account/orders";
```

To:

```tsx
href = "/orders";
```

---

## FIX R5+M1 — Create missing /admin/profile page

File: src/app/admin/profile/page.tsx (CREATE NEW)

```tsx
"use client";
import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { accountApi } from "@/lib/api/account";
import { useAuthStore } from "@/lib/auth/authStore";
import Cookies from "js-cookie";

const inputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

export default function AdminProfilePage() {
  const { user, setAuth, token } = useAuthStore();

  const { data: meData } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => accountApi.getMe(),
  });

  const me = (meData as any) ?? user;

  const form = useFormik({
    enableReinitialize: true,
    initialValues: { name: me?.name ?? "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
    }),
    onSubmit: async (values) => {
      try {
        await accountApi.updateMe({ name: values.name });
        if (user && token) {
          const refreshToken = Cookies.get("raco_refresh") ?? "";
          setAuth({ ...user, name: values.name }, token, refreshToken);
        }
        toast.success("Profile updated");
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to update profile");
      }
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Admin Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update your account details
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Personal Info
        </h3>
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Name
            </label>
            <input
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
              className={inputClass}
              placeholder="Your full name"
            />
            {form.errors.name && form.touched.name && (
              <p className="mt-1 text-xs text-error-500">{form.errors.name}</p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Email
            </label>
            <div className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              {me?.email}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Role
            </label>
            <div className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              {me?.role}
            </div>
          </div>
          <button
            type="submit"
            disabled={form.isSubmitting}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
          >
            {form.isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

---

## FIX R6 — ProductsPage edit button wrong URL

File: src/modules/products/components/ProductsPage.tsx

Change:

```typescript
onClick={() => router.push(`/admin/products/edit/${record.id}`)}
```

To:

```typescript
onClick={() => router.push(`/admin/products/${record.id}/edit`)}
```

---

## FIX D1+D2+D3 — ProductsPage wrong field names + lib type

File: src/lib/api/products.ts — update IProductListResponse:

```typescript
export interface IProductListResponse {
  products: IProduct[];
  pagination: {
    // D3 fixed: backend wraps page info in pagination object
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
```

File: src/modules/products/components/ProductsPage.tsx

Change:

```typescript
// D1 fixed: read from pagination
const total = productsData?.pagination?.total || 0;
```

Change the Quantity column:

```typescript
// D2 fixed: backend field is 'stock' not 'quantity'
{
  title: 'Stock',
  dataIndex: 'stock',    // was 'quantity'
  key: 'stock',
  render: (stock: number) => (
    <span className={stock < 10 ? 'text-error-500' : stock < 50 ? 'text-warning-500' : 'text-success-500'}>
      {stock}
    </span>
  ),
},
```

---

## FIX D4+D5 — account/payments field names and status case

File: src/app/(account)/payments/page.tsx

Fix statusColor to uppercase keys:

```typescript
const statusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "error",
  REFUNDED: "light",
};
```

Fix data reading — GET /users/me/payments returns wrapped `{ data: [...] }`:

```typescript
// D4 fixed: /users/me/payments wraps data as array
const payments: any[] = Array.isArray(data) ? (data as any[]) : [];
const total: number = payments.length;
```

In the table rows fix field names:

```tsx
// provider uppercase
<Badge color={payment.provider === 'STRIPE' ? 'primary' : 'success'}>
  {payment.provider?.toLowerCase()}
</Badge>

// status uppercase
<Badge color={statusColor[payment.status] ?? 'light'}>
  {payment.status?.toLowerCase()}
</Badge>

// amount field (no orderId.shortId)
{formatPrice(payment.amount ?? 0)}
```

---

## FIX D6 — admin/users/[id] wrong field names

File: src/app/admin/users/[id]/page.tsx

Fix statusColor and order table columns:

```typescript
const statusColor: Record<string, 'warning' | 'success' | 'error'> = {
  PENDING: 'warning',
  PAID: 'success',
  CANCELED: 'error',
};

const orderColumns: ColumnsType<any> = [
  {
    title: 'Order ID',
    dataIndex: 'id',
    // D6 fixed: no shortId — use id.slice
    render: (id: string) => <span className="font-mono text-xs">#{id?.slice(0, 8)}</span>,
  },
  {
    title: 'Items',
    dataIndex: 'items',
    render: (items: any[]) => items?.length ?? 0,
  },
  {
    title: 'Total',
    dataIndex: 'totalAmount',    // D6 fixed: was 'total'
    render: (total: number) => formatPrice(total ?? 0),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    render: (status: string) => (
      <Badge color={statusColor[status] ?? 'light'}>{status?.toLowerCase()}</Badge>
    ),
  },
  {
    title: 'Date',
    dataIndex: 'createdAt',
    render: (date: string) => dayjs(date).format('DD MMM YYYY'),
  },
  {
    title: 'Actions',
    render: (_: unknown, record: any) => (
      <Link href={`/admin/orders/${record.id}`} className="text-sm text-brand-500 hover:text-brand-600">
        View
      </Link>
    ),
  },
];
```

Also fix `useFetchUserOrders` — it calls `usersAdminApi.getOrders(id)` which is a stub.
The backend GET /users/:id doesn't exist, but we can show the user's orders via GET /orders with userId filter if possible, or show empty state with a note.

For now: in `src/modules/users/api/index.ts`, update getOrders to use admin orders endpoint filtered by userId won't work without a dedicated endpoint. Keep stub but make the UI show a friendly "Orders data requires backend endpoint" message rather than crashing.

---

## FIX D7+D8+S1+S2 — Users API wiring

File: src/lib/api/users.ts (FULL REWRITE — remove all stubs)

```typescript
import { apiClient } from "./apiClient";
import type { IUser } from "./types";

export interface IUsersListResponse {
  items: IUser[];
  total: number;
  page: number;
  limit: number;
}

export const userApi = {
  // GET /users — Admin only (added to backend in full-audit-fix)
  list: (params?: {
    page?: number;
    limit?: number;
    role?: string;
    search?: string;
  }) => {
    const p = new URLSearchParams();
    if (params?.page) p.append("page", String(params.page));
    if (params?.limit) p.append("limit", String(params.limit));
    if (params?.role) p.append("role", params.role);
    if (params?.search) p.append("search", params.search);
    const q = p.toString();
    return apiClient.get<IUsersListResponse>(`/users${q ? `?${q}` : ""}`);
  },

  // GET /users/:id — Admin only
  getById: (id: string) => apiClient.get<IUser>(`/users/${id}`),

  // NOTE: Backend has no PATCH /users/:id/role endpoint
  // Role update requires backend implementation
  updateRole: (_id: string, _role: "USER" | "ADMIN"): Promise<IUser> => {
    return Promise.reject(new Error("Role update endpoint not yet available"));
  },
};
```

File: src/modules/users/components/UsersPage.tsx

Fix data reading:

```typescript
// D7 fixed: backend returns items not users
const users = data?.items || [];
const total = data?.total || 0;
```

Also hide the role change Select since updateRole is not implemented:

```typescript
// Remove the role change Select column or make it read-only
{
  title: 'Role',
  dataIndex: 'role',
  key: 'role',
  render: (role: 'USER' | 'ADMIN') => (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
      role === 'ADMIN'
        ? 'bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400'
        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
    }`}>
      {role}
    </span>
  ),
},
```

---

## FIX F1 — AddProductPage fetch real categories

File: src/modules/products/components/AddProductPage.tsx (FULL REWRITE)

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import AddProductForm from "./AddProductForm";

export default function AddProductPage() {
  const router = useRouter();
  // F1 fixed: fetch real categories instead of passing empty []
  const { data: categoriesData, isLoading } = useCategories({ limit: 100 });
  const categories = (categoriesData ?? []) as any[];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/products")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Add Product
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new product
          </p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <AddProductForm categories={categories} />
      )}
    </div>
  );
}
```

---

## FIX F2 — AddCategoryPage fetch real categories

File: src/modules/categories/components/AddCategoryPage.tsx (FULL REWRITE)

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import AddCategoryForm from "./AddCategoryForm";

export default function AddCategoryPage() {
  const router = useRouter();
  // F2 fixed: fetch real categories for parent dropdown
  const { data: categoriesData, isLoading } = useCategories({ limit: 100 });
  const categories = (categoriesData ?? []) as any[];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/categories")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Add Category
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Create a new category
          </p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <AddCategoryForm categories={categories} />
      )}
    </div>
  );
}
```

---

## FIX F3 — admin/categories/[id]/edit fetch real categories

File: src/app/admin/categories/[id]/edit/page.tsx (FULL REWRITE)

```tsx
"use client";
import { useRouter, useParams } from "next/navigation";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import EditCategoryForm from "@/modules/categories/components/EditCategoryForm";

export default function AdminEditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  // F3 fixed: fetch real categories for parent dropdown
  const { data: categoriesData, isLoading } = useCategories({ limit: 100 });
  const categories = (categoriesData ?? []) as any[];

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/admin/categories")}
          className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
            />
          </svg>
        </button>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Edit Category
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update category information
          </p>
        </div>
      </div>
      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <EditCategoryForm categories={categories} />
      )}
    </div>
  );
}
```

---

## VERIFY — Complete test checklist

```bash
pnpm dev
```

Test each item:

**Auth persistence:**

1. Login as admin@raco.com / Admin@1234
2. Navigate to /admin/dashboard
3. **Hard reload (F5/Cmd+R)** → should stay on /admin/dashboard, NOT redirect to /
4. Hard reload on /admin/products → should stay there
5. Open new tab → /admin/orders → should load (not redirect)

**Admin CRUD — Products:** 6. /admin/products → table loads, shows stock column (not quantity), total from pagination 7. Click Edit button → goes to /admin/products/:id/edit ✓ (not /edit/:id) 8. /admin/products/add → categories dropdown populated with real categories 9. Create product → fills form, submits, redirects to list 10. Edit product → pre-fills form, updates, redirects to list 11. Delete product → confirm modal → row removed

**Admin CRUD — Categories:** 12. /admin/categories → table shows categories 13. Click Add Category → modal opens with parent dropdown populated 14. /admin/categories/add → parent dropdown populated 15. Edit category inline modal → parent dropdown populated 16. /admin/categories/:id/edit → page loads, parent dropdown populated

**Admin — Orders:** 17. /admin/orders → table shows all orders (not just current user's) 18. Status shows as "pending"/"paid"/"canceled" (lowercase display, uppercase data) 19. Order ID shown as hex slice, not #undefined

**Admin — Payments:** 20. /admin/payments → table loads (was always empty stub)

**Admin — Users:** 21. /admin/users → table shows users list (was stub) 22. Click View → /admin/users/:id → shows user info and orders

**Admin — Profile:** 23. /admin/profile → page loads (was 404) 24. Update name → header name updates immediately

**Account pages (route group):** 25. Login as user → redirected to / 26. Click account icon → goes to /dashboard (not /account/dashboard) 27. /dashboard → loads, shows recent orders 28. /orders → loads, shows order list with correct totalAmount 29. /orders/:id → loads, back link goes to /orders (not /account/orders) 30. /payments → loads, shows payments 31. /profile → loads, update name → header updates

**Public storefront:** 32. / → homepage loads, products display from products key 33. /shop → products load with pagination 34. /shop/:id → product detail page loads 35. Add to cart → badge updates in header 36. /cart → items show correctly 37. /checkout → place order → redirects to /checkout/success 38. /checkout/success "View My Orders" → goes to /orders (not /account/orders) 39. /checkout/failed "View Orders" → goes to /orders (not /account/orders)

After completing: run /r-done
Log to .claude/memory/gotchas.md:

- authStore must use zustand persist to survive hard reload — token in cookie alone doesn't restore user.role
- AuthGuard must handle hydration delay — user is null for first render tick even when authenticated
- (account) route group removes 'account' from URL — nav links must NOT have /account/ prefix
- AddProductPage/AddCategoryPage must fetch categories from API — hardcoded empty [] breaks dropdowns
- Backend 'stock' field not 'quantity' — never use 'quantity' as product column dataIndex
- Backend pagination is nested: { products, pagination: { total, page, totalPages } } — not flat
- Admin products edit URL: /admin/products/:id/edit not /admin/products/edit/:id

```

```
