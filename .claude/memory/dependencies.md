# Dependencies

## Runtime (add to package.json)

| Package | Version | Purpose |
|---|---|---|
| `antd` | `^5.x` | Table, Pagination, Select, DatePicker |
| `@ant-design/nextjs-registry` | `^1.x` | Ant Design SSR fix for Next.js |
| `@ant-design/icons` | `^6.x` | Ant Design icon set |
| `@ant-design/v5-patch-for-react-19` | `^1.x` | React 19 compatibility |
| `formik` | `^2.x` | Forms |
| `yup` | `^1.x` | Form validation schemas |
| `react-toastify` | `^11.x` | Toast notifications |
| `zustand` | `^5.x` | Global state (auth store, dashboard title) |
| `@tanstack/react-query` | `^5.x` | Server state (already planned) |
| `@tanstack/react-query-devtools` | `^5.x` | Dev tools |
| `js-cookie` | `^3.x` | Token storage |
| `dayjs` | `^1.x` | Date formatting |
| `react-image-crop` | `^11.x` | Product image crop before S3 upload |
| `@svgr/webpack` | `^8.x` | Import SVG as React components |
| `daisyui` | `^5.x` | Already in globals.css |
| `tailwind-scrollbar` | `^4.x` | Already in globals.css |

## Install command
```bash
pnpm add antd @ant-design/nextjs-registry @ant-design/icons @ant-design/v5-patch-for-react-19 formik yup react-toastify zustand @tanstack/react-query @tanstack/react-query-devtools js-cookie dayjs react-image-crop
pnpm add -D @svgr/webpack @types/js-cookie @tanstack/react-query-devtools
```

## Ant Design SSR setup (layout.tsx)
```tsx
import { AntdRegistry } from '@ant-design/nextjs-registry';
// wrap <AntdRegistry>{children}</AntdRegistry> in root layout
```

## Tailwind v4 config (globals.css)
Uses `@import 'tailwindcss'` + `@theme { ... }` block.
All custom colors (brand-*, success-*, error-*, warning-*) are defined in @theme.
Custom utilities defined with `@utility` (menu-item, menu-item-active, etc.)
