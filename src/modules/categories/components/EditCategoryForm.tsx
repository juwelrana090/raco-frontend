"use client";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useFetchCategory } from "../hooks/useFetchCategories";
import { useUpdateCategory } from "../hooks/useUpdateCategory";
import ButtonLoader from "@/shared/components/ui/button/ButtonLoader";

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
  categories: Array<{ id: string; name: string; children?: Array<{ id: string; name: string }> }>;
}

export default function EditCategoryForm({ categories }: EditCategoryFormProps) {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id as string;
  const { data: category, isLoading } = useFetchCategory(categoryId);
  const updateCategory = useUpdateCategory();

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

  const handleSubmit = async (
    values: CategoryFormValues,
    { setSubmitting }: FormikHelpers<CategoryFormValues>
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
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Category Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Name *
                </label>
                <Field name="name" className={inputClass} placeholder="Category name" />
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
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white"
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
