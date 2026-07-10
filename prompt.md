---

**Prompt 2 — Frontend (install lucide-react, replace all emoji with SVG icons):**

````
Remove all emoji from raco-frontend. Replace with lucide-react SVG icons.
lucide-react is NOT yet installed — install it first.

## Step 1 — Install lucide-react

```bash
pnpm add lucide-react
````

## Step 2 — app/(web)/page.tsx — full rewrite of emoji sections

### Remove the CATEGORY_ICONS emoji map entirely

Delete these lines:

```typescript
const CATEGORY_ICONS: Record<string, string> = {
  default: '📦',
  electronics: '💻',
  ...
};
function getCategoryIcon(name: string): string { ... }
```

Replace with a Lucide icon component lookup:

```typescript
import {
  Package,
  Monitor,
  Shirt,
  Smartphone,
  Laptop,
  ShoppingBag,
  BookOpen,
  Trophy,
  Watch,
  Tag,
} from "lucide-react";

const CATEGORY_ICON_MAP: Record<string, React.ElementType> = {
  electronics: Monitor,
  clothing: Shirt,
  phones: Smartphone,
  laptops: Laptop,
  bags: ShoppingBag,
  shoes: Package,
  accessories: Watch,
  books: BookOpen,
  sports: Trophy,
};

function getCategoryIcon(name: string): React.ElementType {
  const key = name.toLowerCase();
  const match = Object.entries(CATEGORY_ICON_MAP).find(([k]) =>
    key.includes(k),
  );
  return match ? match[1] : Tag;
}
```

In the categories section, replace:

```tsx
<span className="text-3xl">{getCategoryIcon(cat.name)}</span>
```

With:

```tsx
{
  (() => {
    const Icon = getCategoryIcon(cat.name);
    return <Icon className="h-7 w-7 text-gray-600 dark:text-gray-300" />;
  })();
}
```

### Replace hero emoji 🛍️ with Lucide ShoppingCart

Replace:

```tsx
<div className="text-9xl select-none">🛍️</div>
```

With:

```tsx
import { ShoppingCart } from "lucide-react";

<div className="flex items-center justify-center rounded-full bg-brand-500/20 p-10">
  <ShoppingCart className="h-28 w-28 text-brand-300" strokeWidth={1} />
</div>;
```

### Replace hero floating card 🔒 with Lucide Lock

Replace:

```tsx
<p className="text-white font-semibold">🔒 Secure Payment</p>
```

With:

```tsx
import { Lock } from "lucide-react";

<div className="flex items-center gap-2">
  <Lock className="h-4 w-4 text-brand-300" />
  <p className="text-white font-semibold">Secure Payment</p>
</div>;
```

### Replace features bar emoji array with Lucide icon components

Replace:

```tsx
const features = [
  { icon: "🚚", title: "Free Delivery", sub: "On orders over ৳2,000" },
  { icon: "🔄", title: "Easy Returns", sub: "7 day return policy" },
  { icon: "🔒", title: "Secure Checkout", sub: "Stripe & bKash" },
  { icon: "💬", title: "24/7 Support", sub: "Always here to help" },
];
```

With:

```tsx
import { Truck, RefreshCw, ShieldCheck, MessageCircle } from "lucide-react";

const features = [
  { Icon: Truck, title: "Free Delivery", sub: "On orders over ৳2,000" },
  { Icon: RefreshCw, title: "Easy Returns", sub: "7 day return policy" },
  { Icon: ShieldCheck, title: "Secure Checkout", sub: "Stripe & bKash" },
  { Icon: MessageCircle, title: "24/7 Support", sub: "Always here to help" },
];
```

Update the render:

```tsx
{
  features.map((f) => (
    <div key={f.title} className="flex items-center gap-3 px-6 py-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 dark:bg-brand-500/10">
        <f.Icon className="h-5 w-5 text-brand-500 dark:text-brand-400" />
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800 dark:text-white/90">
          {f.title}
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">{f.sub}</p>
      </div>
    </div>
  ));
}
```

## Step 3 — src/shared/components/storefront/Footer.tsx

### Replace payment emoji icons 💳📱

Replace:

```tsx
{
  ["💳", "📱"].map((icon, i) => (
    <div
      key={i}
      className="flex h-8 w-12 items-center justify-center rounded-lg bg-gray-800 border border-gray-700 text-sm"
    >
      {icon}
    </div>
  ));
}
<span className="text-xs text-gray-500">Stripe · bKash</span>;
```

With:

```tsx
import { CreditCard, Smartphone } from "lucide-react";

<div className="mt-6 flex items-center gap-3">
  <div className="flex items-center gap-1 rounded-lg bg-gray-800 border border-gray-700 px-2.5 py-1.5">
    <CreditCard className="h-4 w-4 text-gray-300" />
    <span className="text-xs text-gray-400">Stripe</span>
  </div>
  <div className="flex items-center gap-1 rounded-lg bg-gray-800 border border-gray-700 px-2.5 py-1.5">
    <Smartphone className="h-4 w-4 text-gray-300" />
    <span className="text-xs text-gray-400">bKash</span>
  </div>
</div>;
```

### Replace ❤️ in bottom bar

Replace:

```tsx
<p className="text-xs text-gray-500">Made with ❤️ in Bangladesh</p>
```

With:

```tsx
import { Heart } from "lucide-react";

<p className="text-xs text-gray-500 flex items-center gap-1">
  Made with <Heart className="h-3 w-3 text-red-400 fill-red-400" /> in
  Bangladesh
</p>;
```

## Step 4 — Verify no emoji remain

```bash
python3 -c "
import os, re
emoji = re.compile('[^\x00-\x7F]+')
skip = {'node_modules', '.git', '.next', 'dist'}
found = []
for root, dirs, files in os.walk('.'):
    dirs[:] = [d for d in dirs if d not in skip]
    for f in files:
        if f.endswith(('.tsx','.ts')):
            path = os.path.join(root, f)
            for i, line in enumerate(open(path, encoding='utf-8'), 1):
                m = emoji.search(line)
                if m and '৳' not in line and '—' not in line and '←' not in line and '└' not in line:
                    print(f'{path}:{i}: {line.rstrip()}')
"
```

Expected: no output (all emoji removed except ৳ taka symbol and ← arrow which are intentional).

## Step 5 — Test

```bash
pnpm dev
```

Check:

- http://localhost:3000/ — features bar shows Truck/RefreshCw/ShieldCheck/MessageCircle icons
- Categories section shows Lucide icons instead of emoji
- Hero section has ShoppingCart SVG instead of 🛍️
- Footer shows CreditCard + Smartphone icons for payment methods
- No broken renders, no missing icons

After completing: run /r-done

```

```
