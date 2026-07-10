"use client";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useCreateProduct } from "../hooks/useCreateProduct";
import ButtonLoader from "@/shared/components/ui/button/ButtonLoader";

const inputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

const selectClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

const validationSchema = Yup.object({
  name: Yup.string().required("Name is required"),
  sku: Yup.string().required("SKU is required"),
  description: Yup.string(),
  price: Yup.number()
    .min(1, "Price must be at least 1")
    .required("Price is required"),
  stock: Yup.number()
    .min(0, "Stock cannot be negative")
    .required("Stock is required"),
  status: Yup.string().required("Status is required"),
  categoryId: Yup.string().required("Category is required"),
});

interface ProductFormValues {
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  status: "active" | "inactive";
  categoryId: string;
}

interface AddProductFormProps {
  categories: Array<{ id: string; name: string; children?: Array<{ id: string; name: string }> }>;
}

export default function AddProductForm({ categories }: AddProductFormProps) {
  const router = useRouter();
  const createProduct = useCreateProduct();

  const flattenedCategories = categories.flatMap((cat) => [
    { id: cat.id, name: cat.name, depth: 0 },
    ...(cat.children?.map((child) => ({
      id: child.id,
      name: child.name,
      depth: 1,
    })) ?? []),
  ]);

  const handleSubmit = async (
    values: ProductFormValues,
    { setSubmitting }: FormikHelpers<ProductFormValues>
  ) => {
    try {
      await createProduct.mutateAsync(values);
      router.push("/admin/products");
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        name: "",
        sku: "",
        description: "",
        price: 0,
        stock: 0,
        status: "active",
        categoryId: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-6">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Basic Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Name *
                </label>
                <Field name="name" className={inputClass} placeholder="Product name" />
                {errors.name && touched.name && (
                  <p className="mt-1 text-xs text-error-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  SKU *
                </label>
                <Field name="sku" className={inputClass} placeholder="e.g. PRD-001" />
                {errors.sku && touched.sku && (
                  <p className="mt-1 text-xs text-error-500">{errors.sku}</p>
                )}
              </div>
            </div>
            <div className="mt-4">
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Description
              </label>
              <Field
                as="textarea"
                name="description"
                rows={4}
                className={inputClass}
                placeholder="Product description"
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Price (Taka) *
                </label>
                <Field
                  name="price"
                  type="number"
                  className={inputClass}
                  placeholder="0"
                />
                {errors.price && touched.price && (
                  <p className="mt-1 text-xs text-error-500">{errors.price}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Stock *
                </label>
                <Field
                  name="stock"
                  type="number"
                  className={inputClass}
                  placeholder="0"
                />
                {errors.stock && touched.stock && (
                  <p className="mt-1 text-xs text-error-500">{errors.stock}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Status
                </label>
                <Field as="select" name="status" className={selectClass}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </Field>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Category
            </h3>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                Category *
              </label>
              <Field as="select" name="categoryId" className={selectClass}>
                <option value="">Select a category</option>
                {flattenedCategories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.depth === 1 ? "  └── " : ""}
                    {cat.name}
                  </option>
                ))}
              </Field>
              {errors.categoryId && touched.categoryId && (
                <p className="mt-1 text-xs text-error-500">{errors.categoryId}</p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => router.push("/admin/products")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
            >
              {isSubmitting && <ButtonLoader />}
              {isSubmitting ? "Creating..." : "Create Product"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
