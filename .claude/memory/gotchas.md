# Gotchas
> ⚠️ PROJECT SCOPED: This file lives in .claude/memory/ only.
> Run /r-memory-scan to auto-fill from codebase.

[Gotchas will be added here as they are discovered]

## Template
#### [Module] — [Title]
- **What Happens**:
- **Why**:
- **How to Avoid**:
- **Discovered**:

## API Integration Gotchas

#### [Auth] — /auth/me endpoint doesn't exist
- **What Happens**: Frontend tries to call `/auth/me` for profile data but this endpoint doesn't exist in the backend
- **Why**: Profile endpoint is actually at `/users/me` not `/auth/me`
- **How to Avoid**: Use `/users/me` for profile data and `/auth/validate` for token validation
- **Discovered**: 2026-07-11

#### [Account] — updateMe uses wrong HTTP method
- **What Happens**: Frontend uses `PATCH /users/me` but backend expects `PUT /users/me`
- **Why**: OpenAPI spec specifies PUT for user profile updates
- **How to Avoid**: Always use `put()` method for `/users/me` updates
- **Discovered**: 2026-07-11

#### [Categories] — /categories/tree endpoint doesn't exist
- **What Happens**: Frontend might try to call `/categories/tree` expecting a separate tree endpoint
- **Why**: `GET /categories` already returns the full nested tree structure
- **How to Avoid**: Use `getAll()` which calls `/categories` - it returns nested categories with children
- **Discovered**: 2026-07-11

#### [Products] — CreateProductDto doesn't include status field
- **What Happens**: Frontend might try to send a `status` field when creating products
- **Why**: Backend CreateProductDto only accepts: sku, name, description, price, stock, imageUrl, categoryId
- **How to Avoid**: Don't include `status` in product creation payload
- **Discovered**: 2026-07-11

#### [Products] — Image upload requires raw fetch
- **What Happens**: Using apiClient for multipart/form-data uploads fails
- **Why**: apiClient forces `Content-Type: application/json` which breaks multipart boundaries
- **How to Avoid**: Use raw fetch for image uploads - see `uploadImage` method in products API
- **Discovered**: 2026-07-11

#### [Orders] — GET /orders returns current user's orders only
- **What Happens**: Admin orders page calls `/orders` expecting all orders but gets current user's orders
- **Why**: Backend doesn't have an admin "get all orders" endpoint - `/orders` is scoped to authenticated user
- **How to Avoid**: Document this limitation - admin orders will only show current user's orders until backend adds `/orders/all`
- **Discovered**: 2026-07-11

#### [Payments] — No GET /payments list endpoint
- **What Happens**: Admin payments page expects `GET /payments` to list all payments
- **Why**: Backend only has `GET /payments/:id` and `GET /payments/order/:orderId` - no list endpoint
- **How to Avoid**: Show payments per-order on order detail page instead of standalone payments list
- **Discovered**: 2026-07-11

#### [Users] — No admin user management endpoints
- **What Happens**: Admin users page expects `GET /users`, `GET /users/:id`, `PATCH /users/:id/role`
- **Why**: Backend only has `/users/me` endpoints - no admin user management
- **How to Avoid**: These endpoints are stubbed with console warnings - backend needs to add admin user management
- **Discovered**: 2026-07-11

## Missing backend endpoints (admin panel limitations)

The following endpoints are NOT in the current backend OpenAPI spec.
The admin UI for these modules shows empty/placeholder until they are added:

1. `GET /api/v1/users` — admin list all users (with pagination + role filter)
2. `GET /api/v1/users/:id` — admin get user by ID
3. `PATCH /api/v1/users/:id/role` — admin update user role
4. `GET /api/v1/users/:id/orders` — admin get a user's orders
5. `GET /api/v1/payments` — admin list all payments (with pagination + provider/status filter)
6. `GET /api/v1/orders/all` — admin list ALL orders (current GET /orders returns only current user's)

Workarounds applied:
- Products admin: uses GET /products (public endpoint, works)
- Categories admin: uses GET /categories (public endpoint, works)
- Orders admin: uses GET /orders (returns current user's orders only)
- Payments admin: uses GET /payments/order/:orderId (per-order only)
- Users admin: stub returns empty array with console warnings

## Next.js 16 + src/app/ Structure

#### [Next.js] — src/app/ directory structure
- **What Happens**: Next.js 16+ supports both `app/` and `src/app/` directory structures
- **Why**: `src/app/` is preferred for better organization and separates source from config files
- **How to Avoid**: Always use `src/app/` for new Next.js 16 projects, update tsconfig.json include paths
- **Discovered**: 2026-07-11

#### [Next.js] — Route groups vs real URL segments
- **What Happens**: `(account)/` doesn't create URL segment while `admin/` creates `/admin/*` URLs
- **Why**: Parentheses in Next.js create route groups for organization without affecting URL structure
- **How to Avoid**: Use `(group)/` for layout organization and `real-path/` for actual URL segments
- **Discovered**: 2026-07-11
