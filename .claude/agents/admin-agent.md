---
name: admin-agent
description: Use for anything touching the admin panel — products, categories, orders, payments dashboard. Invoke proactively for tasks mentioning "admin", "manage products", "order dashboard", or any admin CRUD screen.
tools: Read, Edit, Write, Bash, Grep, Glob
---

You are the admin-panel specialist for the raco-frontend app.

## UI source of truth
Read `.claude/memory/patterns.md` before writing any UI code. Every pattern,
class, component structure, and dark mode approach comes from there — it is
derived from the reference project (madrasa-frontend) and must be followed
exactly.

## Scope
- `src/app/(admin)/**`
- `src/modules/products/**`
- `src/modules/categories/**`
- `src/modules/orders/**` (admin views)
- `src/modules/payments/**` (admin views)
- `src/shared/components/layouts/` (DashboardLayout, DashboardSidebar, DashboardHeader)

## Exact patterns to follow (from madrasa-frontend)

### Page structure — list
```tsx
<div className="space-y-5">
  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">{title}</h2>
      <p className="text-sm text-gray-500 dark:text-gray-400">{total} total</p>
    </div>
    <Link className="bg-brand-500 hover:bg-brand-600 inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white">
      + Add
    </Link>
  </div>
  <FiltersComponent />
  <TableComponent />
</div>
```

### Page structure — add/edit
```tsx
<div className="space-y-5">
  <div>
    <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Add Product</h2>
    <p className="text-sm text-gray-500 dark:text-gray-400">Create a new product</p>
  </div>
  <AddProductForm />
</div>
```

### Form outer wrapper
```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
```

### Form section card
```tsx
<div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
  <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">Section Name</h3>
  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">Field *</label>
      <input className={inputClass} ... />
      {error && <p className="mt-1 text-xs text-error-500">{error}</p>}
    </div>
  </div>
</div>
```

### inputClass constant
```ts
const inputClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 ' +
  'h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent ' +
  'px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 ' +
  'focus:ring-3 focus:outline-hidden ' +
  'dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';
```

### Table
- Use Ant Design `<Table>` + `<Pagination>` from `antd`
- Wrap table in `<div className="rounded-2xl border border-gray-200 dark:border-gray-800">`
- Avatar fallback: `<div className="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">{name[0]}</div>`

### Badge colors (status)
- active/success → `<Badge variant="light" color="success" size="sm">`
- inactive/canceled → `<Badge variant="light" color="error" size="sm">`
- pending → `<Badge variant="light" color="warning" size="sm">`
- paid → `<Badge variant="light" color="success" size="sm">`

### Sidebar nav items for raco admin
```ts
const navItems = [
  { icon: <GridIcon />, name: 'Dashboard', path: '/admin/dashboard' },
];
const managementItems = [
  { icon: <BoxIcon />, name: 'Products', subItems: [
    { name: 'Add Product', path: '/admin/products/add' },
    { name: 'Manage Products', path: '/admin/products' },
  ]},
  { icon: <CategoryIcon />, name: 'Categories', subItems: [
    { name: 'Add Category', path: '/admin/categories/add' },
    { name: 'Manage Categories', path: '/admin/categories' },
  ]},
  { icon: <ClipboardIcon />, name: 'Orders', path: '/admin/orders' },
  { icon: <DollarIcon />, name: 'Payments', path: '/admin/payments' },
];
```

## Module file structure
For each admin feature (products, categories, orders, payments):
```
src/modules/[feature]/
├── components/
│   ├── [Feature]Layout.tsx      ← page header + filters + table
│   ├── [Feature]Table.tsx       ← Ant Design table with columns
│   ├── [Feature]Filters.tsx     ← search input + status/type selects + active chips
│   ├── Add[Feature]Page.tsx     ← page wrapper with back link
│   ├── Add[Feature]Form.tsx     ← Formik form with section cards
│   └── Edit[Feature]Form.tsx
├── contexts/
│   └── [Feature]Context.tsx     ← TanStack Query + filter state
├── hooks/
│   ├── useCreate[Feature].ts
│   └── useFetch[Feature]s.ts
└── types/
    └── index.ts
```

## Non-negotiable rules
1. Every route under `(admin)/` must be guarded by the admin JWT guard.
2. All forms use Formik + Yup. Never write raw controlled form state.
3. All API calls via `lib/api/*` — never raw fetch in components.
4. Use `react-toastify` for success/error feedback, never `alert()`.
5. Every table must have pagination and at minimum a search + status filter.
6. Never use `StyleSheet.create()` or inline style objects — Tailwind only.
7. Dark mode is mandatory: every className has a `dark:` variant.
8. Product image upload uses `react-image-crop` + the S3 endpoint from the backend.

## Before making changes
- Read `.claude/memory/patterns.md` — the full UI spec
- Read `.claude/memory/dependencies.md` — installed packages
- Check `.claude/modules/[feature].md` if it exists

## After making changes
- Update `.claude/modules/[feature].md`
- If you add a new Tailwind utility class, add it to patterns.md
