# Established Patterns
> Source of truth for all UI patterns in raco-frontend.
> Derived from madrasa-frontend — the reference project for this codebase.

---

## Design System Tokens (globals.css)

Primary brand color: `brand-500 = #465fff`

```css
/* Key color tokens from @theme */
--color-brand-500: #465fff;       /* primary actions, active states */
--color-brand-50:  #ecf3ff;       /* active bg (sidebar, badge) */
--color-success-500: #12b76a;
--color-error-500:   #f04438;
--color-warning-500: #f79009;
--color-gray-700:    #344054;     /* body text */
--color-gray-500:    #667085;     /* secondary text */
```

---

## Layout Pattern

### Admin protected layout
```
app/(admin)/layout.tsx
  └── AuthGuard (redirect if no token)
      └── ThemeProvider (localStorage dark/light)
          └── SidebarProvider (isExpanded, isMobileOpen, isHovered)
              └── div.min-h-screen.bg-white.dark:bg-gray-900
                  └── DashboardLayout
                      ├── DashboardSidebar (fixed left, 290px / 90px)
                      ├── Backdrop (mobile overlay)
                      └── div.flex-1 (margin adapts to sidebar)
                          ├── DashboardHeader (sticky top)
                          └── div.mx-auto.max-w-(--breakpoint-2xl).p-4.md:p-6
                              └── {children}
```

### Main content margin (dynamic)
```tsx
const mainContentMargin = isMobileOpen
  ? 'ml-0'
  : isExpanded || isHovered
    ? 'lg:ml-[290px]'
    : 'lg:ml-[90px]';
```

---

## Page Structure Patterns

### List page (e.g. products/page.tsx)
```tsx
<div className="space-y-5">
  {/* Page header */}
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Products</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">{total} total products</p>
    </div>
    <Link
      href="/admin/products/add"
      className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white"
    >
      <svg className="h-4 w-4">...</svg>
      Add Product
    </Link>
  </div>
  <ProductsFilters />
  <ProductsTable />
</div>
```

### Add/Edit page
```tsx
<div className="space-y-5">
  <div>
    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Add Product</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">Create a new product</p>
  </div>
  <AddProductForm />
</div>
```

---

## Form Patterns

### Form card wrapper
```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
  <Formik initialValues={...} validationSchema={schema} onSubmit={handleSubmit}>
    {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
      <Form className="space-y-5">
        {/* form sections */}
      </Form>
    )}
  </Formik>
</div>
```

### Form section card
```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
  <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
    Basic Information
  </h3>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
        Product Name *
      </label>
      <input className={inputClass} name="name" ... />
      {errors.name && touched.name && (
        <p className="mt-1 text-xs text-error-500">{errors.name}</p>
      )}
    </div>
  </div>
</div>
```

### Input class (universal)
```ts
const inputClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 ' +
  'h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent ' +
  'px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 ' +
  'focus:ring-3 focus:outline-hidden ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';
```

### Filter input class (shorter, h-10)
```ts
const filterInputClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 ' +
  'h-10 w-full appearance-none rounded-lg border border-gray-300 bg-transparent ' +
  'px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 ' +
  'focus:ring-3 focus:outline-hidden ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';
```

### Submit button row
```tsx
<div className="flex items-center justify-end gap-3 pt-2">
  <button type="button" onClick={() => router.back()}
    className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300">
    Cancel
  </button>
  <button type="submit" disabled={isSubmitting}
    className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white">
    {isSubmitting ? <Spinner /> : null}
    Save Product
  </button>
</div>
```

---

## Table Patterns

### Ant Design table wrapper
```tsx
import { Table, Pagination } from 'antd';
import type { ColumnsType } from 'antd/es/table';

const columns: ColumnsType<IProduct> = [
  { title: '#', render: (_, __, i) => (page - 1) * limit + i + 1, width: 60 },
  {
    title: 'Product',
    render: (_, r) => (
      <div className="flex items-center gap-2">
        {r.imageUrl
          ? <img src={r.imageUrl} className="h-8 w-8 rounded-lg object-cover" />
          : <div className="bg-brand-100 text-brand-600 flex h-8 w-8 items-center justify-center rounded-lg text-sm font-medium">{r.name[0]}</div>
        }
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">{r.name}</span>
      </div>
    )
  },
  // ...
];

<Table
  columns={columns}
  dataSource={products}
  pagination={false}
  loading={loading}
  rowKey="id"
  className="rounded-2xl border border-gray-200 dark:border-gray-800"
/>
<Pagination ... />
```

---

## Badge Component
```tsx
// Badge variants
<Badge variant="light" color="success" size="sm">Active</Badge>
<Badge variant="light" color="warning" size="sm">Pending</Badge>
<Badge variant="light" color="error" size="sm">Inactive</Badge>
<Badge variant="light" color="primary" size="sm">New</Badge>
<Badge variant="light" color="light" size="sm">Draft</Badge>
```

Badge color → class map:
```
primary → bg-brand-50 text-brand-500  dark:bg-brand-500/15 dark:text-brand-400
success → bg-success-50 text-success-600  dark:bg-success-500/15 dark:text-success-500
error   → bg-error-50 text-error-600  dark:bg-error-500/15 dark:text-error-500
warning → bg-warning-50 text-warning-600  dark:bg-warning-500/15 dark:text-orange-400
light   → bg-gray-100 text-gray-700  dark:bg-white/5 dark:text-white/80
```

---

## Sidebar Nav Pattern

```tsx
type NavItem = {
  name: string;
  icon: React.ReactNode;   // SVG icon component
  path?: string;
  subItems?: { name: string; path: string }[];
};

// Active item class
'menu-item-active'    → bg-brand-50 text-brand-500 dark:bg-brand-500/[0.12]
// Inactive item class
'menu-item-inactive'  → text-gray-700 hover:bg-gray-100 dark:text-gray-300
// Dropdown item active
'menu-dropdown-item-active'  → bg-brand-50 text-brand-500
// Dropdown item inactive
'menu-dropdown-item-inactive' → text-gray-700 hover:bg-gray-100
```

---

## Module File Structure

```
src/modules/[feature]/
├── components/
│   ├── [Feature]Layout.tsx   ← list view wrapper (page header + filters + table)
│   ├── [Feature]Table.tsx    ← Ant Design table
│   ├── [Feature]Filters.tsx  ← filter bar (search + selects + filter chips)
│   ├── Add[Feature]Page.tsx  ← add page header + form
│   ├── Add[Feature]Form.tsx  ← Formik form sections
│   └── Edit[Feature]Form.tsx ← same as add but pre-filled
├── contexts/
│   └── [Feature]Context.tsx  ← data + filters state via TanStack Query
├── hooks/
│   ├── useCreate[Feature].ts
│   ├── useFetch[Feature]s.ts
│   └── useUpdate[Feature].ts
└── types/
    └── index.ts
```

---

## Toast Notifications
```tsx
import { toast } from 'react-toastify';
toast.success('Product created successfully');
toast.error('Failed to save product');
```

---

## Dark Mode
Every UI element has a dark variant using `dark:` prefix.
Body bg: `bg-white dark:bg-gray-900`
Card: `bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800`
Text: `text-gray-800 dark:text-white/90` (primary) | `text-gray-500 dark:text-gray-400` (secondary)
