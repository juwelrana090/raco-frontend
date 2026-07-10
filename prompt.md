# raco-frontend — Build Prompt (E-commerce Storefront + Admin)

> Paste this whole file to Claude Code (or Cursor/Windsurf) inside the
> `raco-frontend` project after running the updated `setup-claude.sh`.
> It already has `.claude/agents/` (storefront-agent, checkout-agent,
> admin-agent) and `.context/` cross-tool briefs loaded.

## 0. Context

This frontend is **not explicitly required** by the assessment's core
grading (backend deliverable is `Node.js/Express/Django/FastAPI`), but the
deployment section (§4.5) explicitly expects **"Frontend on Vercel"** —
so a working, deployed frontend is a strong differentiator versus
Swagger-only submissions. Keep it focused: a clean storefront + a
functional admin panel, not a design showcase.

Stack for this project (already scaffolded):

- Next.js 16, React 19, App Router, TypeScript, Tailwind v4
- **Add**: TanStack Query for server state
- **Add**: a typed API client (`lib/api/*`) hitting `raco-backend`
- **Add**: Stripe.js / Stripe Elements for card entry; bKash's hosted
  checkout redirect for bKash
- **Add**: minimal auth state (httpOnly cookie session preferred; if you
  must use client storage, document the tradeoff in
  `.claude/memory/decisions.md`)

## 1. Route structure (App Router groups)

```
app/
  (storefront)/
    page.tsx                → home / featured products
    products/page.tsx       → product listing (filters, pagination)
    products/[slug]/page.tsx→ product detail + recommendations
    cart/page.tsx
    checkout/page.tsx       → provider choice → Stripe/bKash flow
  (account)/
    orders/page.tsx         → user's own order history
    orders/[id]/page.tsx    → order detail + payment status
  (admin)/
    products/page.tsx       → CRUD table
    categories/page.tsx     → tree management
    orders/page.tsx         → all orders, status filter
    payments/page.tsx       → payment dashboard, provider filter
  layout.tsx, globals.css
```

Route groups `(storefront)`, `(account)`, `(admin)` are excluded from the
URL path (Next.js convention) — `/products`, `/orders`, `/admin/products`
etc., not `/storefront/products`.

## 2. Data layer

- All requests go through `lib/api/{products,categories,orders,payments,auth}.ts`
  — typed request/response, never a raw `fetch()` in a component.
- Wrap the app in a `QueryClientProvider`; use TanStack Query for every
  server read, mutations for writes, and invalidate the right query keys
  (e.g. creating a product invalidates `['products']` and
  `['categories', categoryId]`).
- Server Components by default for read-heavy pages (product listing/detail,
  order history); Client Components only where interactivity needs it
  (add-to-cart button, checkout provider picker, admin forms/tables).

## 3. Checkout flow (delegate to `checkout-agent`)

1. Cart page → "Place order" → `POST /orders` on the backend
2. Checkout page: explicit provider choice (Stripe card form vs bKash
   redirect button) — never assume one provider
3. Stripe: mount Elements with the client secret from
   `POST /orders/:id/checkout`, confirm card payment client-side, then
   land on an order-status page that polls `GET /orders/:id` until the
   webhook has flipped status to `paid`/`failed`
4. bKash: redirect to the provider's hosted flow, return to a callback
   route, then same polling pattern on the order-status page
5. Never optimistically show "Paid" before the backend confirms it

## 4. Admin panel (delegate to `admin-agent`)

- Guarded routes: check role client-side for UX, but treat the backend's
  403 as the real boundary (a rejected mutation should show a clear error,
  not a silent no-op)
- Product/category forms: client validation mirrors backend rules (unique
  SKU, positive price/stock) but always surface the backend's actual
  validation error text on submit failure
- Category management should render the actual parent/child tree (e.g. an
  indented list or a simple expandable tree component), not a flat dropdown
- Orders/payments tables: pagination + at least a status filter; this is a
  working tool for the reviewer to click through, not a mockup

## 5. Storefront polish (delegate to `storefront-agent`)

- Product detail page shows the DFS-based "related products" from
  `GET /products/:id/recommendations`
- Skeleton/loading states everywhere data is fetched — no layout-shifting
  blank flashes
- Empty states (empty cart, no orders yet, no search results)

## 6. Deliverables checklist (supports assessment §4)

- [ ] Deployed to Vercel with env vars pointed at the backend (local via
      ngrok per §4.5, or a deployed backend URL if you have one)
- [ ] `.env.example` documenting `NEXT_PUBLIC_API_BASE_URL`,
      `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, bKash public config
- [ ] README section: how to run locally against the backend
- [ ] `.claude/modules/*.md` updated per area touched (storefront, checkout,
      admin)

## 7. Suggested build order

1. API client layer + TanStack Query setup
2. Auth (login/register forms, session handling)
3. Storefront: product listing/detail/category browsing
4. Cart + checkout (Stripe then bKash)
5. Order history + order-status polling
6. Admin: products/categories CRUD
7. Admin: orders/payments dashboards
8. Deploy to Vercel, wire real/sandbox env vars, smoke-test the full flow

Work section by section with `/r-task`, and log any non-obvious frontend
decision (auth storage choice, polling vs webhook-push for order status,
etc.) to `.claude/memory/decisions.md` as you go.
