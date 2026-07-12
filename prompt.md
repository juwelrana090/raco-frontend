Fix the following bugs in the raco-frontend codebase:

**Bug 1 — Remove `status: "ACTIVE"` param from all getProducts() calls**

In `src/app/(web)/shop/page.tsx`, remove `status: "ACTIVE"` from the storefrontApi.getProducts() call inside the useQuery queryFn.

In `src/app/(web)/page.tsx`, remove `status: "ACTIVE"` from the storefrontApi.getProducts() call inside the useQuery queryFn.

The backend QueryProductDto has no status field and runs with forbidNonWhitelisted: true, so sending this param causes a 400 Bad Request and no products are returned.

**Bug 2 — Flatten nested category tree for the shop dropdown**

In `src/app/(web)/shop/page.tsx`, add a helper function to flatten the nested category tree returned by getCategories(), and use it when building the categories array for the <select> dropdown. The backend returns a nested tree with children arrays, but the current code only shows root-level categories.

Add this helper above the ShopContent component:

function flattenCategories(cats: ICategory[]): ICategory[] {
return cats.flatMap((c) => [c, ...flattenCategories(c.children ?? [])]);
}

Then change:
const categories = Array.isArray(categoriesData)
? (categoriesData as ICategory[])
: [];

To:
const categories = Array.isArray(categoriesData)
? flattenCategories(categoriesData as ICategory[])
: [];

Also update the ICategory interface in shop/page.tsx to include the children field:
children?: ICategory[];
