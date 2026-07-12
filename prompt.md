# raco-frontend — Edit Product & Edit Category Image Upload

Four bugs found. Fix in order. Read each file before editing.

---

## Bug Inventory

| File                                                     | Bug                                                                                                                    |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `src/app/admin/products/[id]/edit/page.tsx`              | Completely ignores EditProductForm — has its own Ant Design form with plain imageUrl text field instead of file upload |
| `src/modules/categories/components/EditCategoryForm.tsx` | No image upload section at all                                                                                         |
| `src/lib/api/categories.ts`                              | ICategory missing imageUrl field, no uploadImage/deleteImage methods                                                   |
| `src/modules/categories/api/index.ts`                    | Missing uploadImage/deleteImage methods                                                                                |

---

## Fix 1 — src/app/admin/products/[id]/edit/page.tsx

PROBLEM: This page has its own Ant Design form implementation that
bypasses EditProductForm entirely. It shows a plain URL text input
instead of the proper file upload UI.

FIX: Replace the entire page with a thin wrapper that renders
EditProductForm (which already has the full image upload implementation).

Full rewrite:

```tsx
"use client";
import { useRouter } from "next/navigation";
import { useCategories } from "@/modules/categories/hooks/useCategories";
import EditProductForm from "@/modules/products/components/EditProductForm";

export default function AdminEditProductPage() {
  const router = useRouter();
  const { data: categoriesData, isLoading } = useCategories({ limit: 100 });

  const categories = (categoriesData ?? []) as Array<{
    id: string;
    name: string;
    children?: Array<{ id: string; name: string }>;
  }>;

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
            Edit Product
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Update product information and image
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
        </div>
      ) : (
        <EditProductForm categories={categories} />
      )}
    </div>
  );
}
```

EditProductForm internally calls useFetchProduct(productId) using useParams()
so it handles its own data loading. No extra data fetching needed in the page.

---

## Fix 2 — src/lib/api/categories.ts

Add imageUrl to ICategory and add uploadImage/deleteImage methods.

Replace the full file:

```typescript
import { apiClient } from "./apiClient";

export interface ICategory {
  id: string;
  name: string;
  description: string | null;
  parentId: string | null;
  imageUrl: string | null; // ← ADD: category image CDN URL
  fileManagerId: number | null; // ← ADD: FK to file_manager table
  parent?: ICategory | null;
  children?: ICategory[];
  createdAt: string;
  updatedAt: string;
}

export interface ICategoryListResponse {
  categories: ICategory[];
  total: number;
  page: number;
  limit: number;
}

export interface ICreateCategoryRequest {
  name: string;
  description?: string;
  parentId?: string;
}

export interface IUpdateCategoryRequest {
  name?: string;
  description?: string;
  parentId?: string;
}

export const categoryApi = {
  // GET /categories — returns full nested tree
  getAll: () => apiClient.get<ICategory[]>("/categories"),

  // Alias for getAll
  getTree: () => apiClient.get<ICategory[]>("/categories"),

  getById: (id: string) => apiClient.get<ICategory>(`/categories/${id}`),

  getCategoryProducts: (id: string) =>
    apiClient.get<any>(`/categories/${id}/products`),

  create: (data: ICreateCategoryRequest) =>
    apiClient.post<ICategory>("/categories", data),

  update: (id: string, data: IUpdateCategoryRequest) =>
    apiClient.patch<ICategory>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/categories/${id}`),

  // POST /categories/:id/image — multipart/form-data, Admin only
  // Must use raw fetch — apiClient forces JSON Content-Type
  uploadImage: async (
    id: string,
    file: File,
  ): Promise<{ imageUrl: string }> => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
    const token =
      typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((r) => r.startsWith("raco_token="))
            ?.split("=")[1]
        : "";
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${baseUrl}/categories/${id}/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? "Upload failed");
    return json.data;
  },

  // DELETE /categories/:id/image — Admin only
  deleteImage: (id: string) =>
    apiClient.delete<void>(`/categories/${id}/image`),
};
```

---

## Fix 3 — src/modules/categories/api/index.ts

Also add uploadImage/deleteImage to the module-level API
(EditCategoryForm imports from here):

Replace the full file:

```typescript
import { apiClient } from "@/lib/api/apiClient";
import type { ICategory } from "../types";

export const categoriesApi = {
  getAll: (search?: string) => {
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    const query = params.toString();
    return apiClient.get<ICategory[]>(`/categories${query ? `?${query}` : ""}`);
  },

  getTree: () => apiClient.get<ICategory[]>("/categories"),

  getById: (id: string) => apiClient.get<ICategory>(`/categories/${id}`),

  getCategoryProducts: (id: string) =>
    apiClient.get<any>(`/categories/${id}/products`),

  create: (data: { name: string; description?: string; parentId?: string }) =>
    apiClient.post<ICategory>("/categories", data),

  update: (
    id: string,
    data: { name?: string; description?: string; parentId?: string },
  ) => apiClient.patch<ICategory>(`/categories/${id}`, data),

  delete: (id: string) => apiClient.delete<void>(`/categories/${id}`),

  // POST /categories/:id/image — multipart/form-data, Admin only
  uploadImage: async (
    id: string,
    file: File,
  ): Promise<{ imageUrl: string }> => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api/v1";
    const token =
      typeof document !== "undefined"
        ? document.cookie
            .split("; ")
            .find((r) => r.startsWith("raco_token="))
            ?.split("=")[1]
        : "";
    const form = new FormData();
    form.append("image", file);
    const res = await fetch(`${baseUrl}/categories/${id}/image`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: form,
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.message ?? "Upload failed");
    return json.data;
  },

  // DELETE /categories/:id/image — Admin only
  deleteImage: (id: string) =>
    apiClient.delete<void>(`/categories/${id}/image`),
};
```

---

## Fix 4 — src/modules/categories/components/EditCategoryForm.tsx

Add image upload section — current image preview, Replace, Delete,
and independent Upload Now button (separate from Save Changes).

Full rewrite:

```tsx
"use client";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRef, useState } from "react";
import { useFetchCategory } from "../hooks/useFetchCategories";
import { useUpdateCategory } from "../hooks/useUpdateCategory";
import { categoriesApi } from "../api";
import ButtonLoader from "@/shared/components/ui/button/ButtonLoader";
import { toast } from "react-toastify";

const inputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

const selectClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  description: Yup.string(),
  parentId: Yup.string().nullable(),
});

interface CategoryFormValues {
  name: string;
  description: string;
  parentId: string | null;
}

interface EditCategoryFormProps {
  categories: Array<{
    id: string;
    name: string;
    children?: Array<{ id: string; name: string }>;
  }>;
}

export default function EditCategoryForm({
  categories,
}: EditCategoryFormProps) {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { data: category, isLoading, refetch } = useFetchCategory(categoryId);
  const updateCategory = useUpdateCategory();

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const flattenedCategories = categories
    .flatMap((cat) => [
      { id: cat.id, name: cat.name, depth: 0 },
      ...(cat.children?.map((child) => ({
        id: child.id,
        name: child.name,
        depth: 1,
      })) ?? []),
    ])
    .filter((cat) => cat.id !== categoryId);

  // ── Image handlers ──────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      ![
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
      ].includes(file.type)
    ) {
      toast.error("Only JPG, PNG, WEBP, GIF allowed");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size must be under 5MB");
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCancelNewFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !categoryId) return;
    setUploadingImage(true);
    try {
      await categoriesApi.uploadImage(categoryId, selectedFile);
      toast.success("Image uploaded successfully");
      handleCancelNewFile();
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!categoryId) return;
    if (!confirm("Delete the current category image?")) return;
    setDeletingImage(true);
    try {
      await categoriesApi.deleteImage(categoryId);
      toast.success("Image deleted");
      refetch();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete image");
    } finally {
      setDeletingImage(false);
    }
  };

  // ── Form submit ─────────────────────────────────────────────────
  const handleSubmit = async (
    values: CategoryFormValues,
    { setSubmitting }: FormikHelpers<CategoryFormValues>,
  ) => {
    try {
      await updateCategory.mutateAsync({
        id: categoryId,
        data: {
          name: values.name,
          description: values.description || undefined,
          parentId: values.parentId ?? undefined,
        },
      });
      router.push("/admin/categories");
    } catch {
      // error handled in hook
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Category not found
      </div>
    );
  }

  return (
    <Formik
      initialValues={{
        name: category.name,
        description: category.description ?? "",
        parentId: category.parentId ?? null,
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-6">
          {/* ── Category Information ──────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Category Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Name *
                </label>
                <Field
                  name="name"
                  className={inputClass}
                  placeholder="Category name"
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-xs text-error-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Description
                </label>
                <Field
                  as="textarea"
                  name="description"
                  rows={3}
                  className={inputClass}
                  placeholder="Category description"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Parent Category
                </label>
                <Field as="select" name="parentId" className={selectClass}>
                  <option value="">None (Top Level)</option>
                  {flattenedCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.depth === 1 ? "  └── " : ""}
                      {cat.name}
                    </option>
                  ))}
                </Field>
              </div>
            </div>
          </div>

          {/* ── Category Image ─────────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Category Image
              <span className="ml-2 text-xs font-normal text-gray-400">
                JPG, PNG, WEBP, GIF · max 5MB
              </span>
            </h3>

            {/* Existing image — no new file selected */}
            {(category as any).imageUrl && !preview && (
              <div className="mb-4 flex items-start gap-4">
                <img
                  src={(category as any).imageUrl}
                  alt="Current"
                  className="h-28 w-28 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                />
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Current image
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-1 text-xs text-brand-500 hover:text-brand-600"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    Replace image
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={deletingImage}
                    className="flex items-center gap-1 text-xs text-error-500 hover:text-error-600 disabled:opacity-50"
                  >
                    <svg
                      className="h-3.5 w-3.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                      />
                    </svg>
                    {deletingImage ? "Deleting..." : "Delete image"}
                  </button>
                </div>
              </div>
            )}

            {/* New file selected — preview + Upload Now */}
            {preview && (
              <div className="mb-4 flex items-start gap-4">
                <img
                  src={preview}
                  alt="New"
                  className="h-28 w-28 rounded-xl object-cover border-2 border-brand-400"
                />
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-xs font-medium text-brand-500">
                    New image ready to upload
                  </p>
                  <p className="text-xs text-gray-400">{selectedFile?.name}</p>
                  <p className="text-xs text-gray-400">
                    {selectedFile
                      ? (selectedFile.size / 1024).toFixed(1) + " KB"
                      : ""}
                  </p>
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={uploadingImage}
                    className="flex items-center gap-1.5 rounded-lg bg-brand-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-brand-600 disabled:bg-brand-300 transition-colors"
                  >
                    {uploadingImage && (
                      <svg
                        className="h-3 w-3 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                    )}
                    {uploadingImage ? "Uploading..." : "Upload Now"}
                  </button>
                  <button
                    type="button"
                    onClick={handleCancelNewFile}
                    className="text-xs text-error-500 hover:text-error-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* No image yet — show upload area */}
            {!(category as any).imageUrl && !preview && (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex w-full flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700 p-8 text-center hover:border-brand-400 hover:bg-brand-50 dark:hover:border-brand-600 dark:hover:bg-brand-500/5 transition-colors cursor-pointer"
              >
                <svg
                  className="h-10 w-10 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1}
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                  />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Click to upload category image
                  </p>
                  <p className="mt-1 text-xs text-gray-400">
                    PNG, JPG, WEBP, GIF up to 5MB
                  </p>
                </div>
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>

          {/* ── Actions ───────────────────────────────────────────── */}
          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/categories")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
            >
              {isSubmitting && <ButtonLoader />}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
```

---

## Verify

```bash
pnpm dev
```

Test Edit Product:

1. Go to /admin/products → click Edit on any product
2. Page loads at /admin/products/:id/edit
3. Shows EditProductForm with name, sku, price, stock, category fields
4. Shows Product Image section at the bottom (NOT a text input)
5. If product has image: shows current image with Replace/Delete buttons
6. If no image: shows dashed upload area
7. Click upload area → select file → preview appears with Upload Now button
8. Click Upload Now → "Uploading..." → image appears
9. Click Save Changes → updates name/price/etc → redirects to /admin/products

Test Edit Category:

1. Go to /admin/categories → click Edit on any category
2. Page loads at /admin/categories/:id/edit
3. Shows EditCategoryForm with name, description, parent
4. Shows Category Image section at the bottom
5. Upload → preview → Upload Now → image updates via refetch()
6. Delete → confirm → image removed
7. Save Changes → updates category info → redirects

After completing: run /r-done
Log to .claude/memory/gotchas.md:

- admin/products/[id]/edit MUST use EditProductForm component — never reimplement inline
- Edit page should NOT fetch product data itself — EditProductForm does it via useFetchProduct(params.id)
- Image upload is INDEPENDENT of Save Changes — Upload Now is its own button
- categoriesApi.uploadImage uses raw fetch not apiClient — never add Content-Type for multipart
