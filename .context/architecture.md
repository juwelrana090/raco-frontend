# Architecture Summary

> Full detail lives in `.claude/memory/architecture.md`. This is the
> portable summary for non-Claude-Code AI agents.

## Route groups (App Router)
- `(storefront)/` — public: home, products, product detail, cart, checkout
- `(account)/`     — logged-in user: orders, profile
- `(admin)/`       — admin: products, categories, orders, payments dashboard

## Data flow
- All API calls go through a typed API client (`lib/api/*`) — never raw fetch
  scattered in components
- TanStack Query for all server data; mutations invalidate the right query keys
- Auth token stored per project convention (httpOnly cookie preferred over
  localStorage) — set this decision in `.claude/memory/decisions.md`

## Checkout flow (UI side)
1. Cart → "Place order" → `POST /orders` (backend)
2. Provider choice (Stripe / bKash) → redirect or embedded widget per provider
3. Poll or webhook-driven status → order status page reflects `pending → paid/failed`

## Environment Differences
- [fill in: API base URL per environment, Stripe publishable key, bKash sandbox vs live]
