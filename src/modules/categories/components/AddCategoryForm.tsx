"use client";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useCreateCategory } from "../hooks/useCreateCategory";
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

interface AddCategoryFormProps {
  categories: Array<{ id: string; name: string; children?: Array<{ id: string; name: string }> }>;
}

export default function AddCategoryForm({ categories }: AddCategoryFormProps) {
  const router = useRouter();
  const createCategory = useCreateCategory();

  const flattenedCategories = categories.flatMap((cat) => [
    { id: cat.id, name: cat.name, depth: 0 },
    ...(cat.children?.map((child) => ({
      id: child.id,
      name: child.name,
      depth: 1,
    })) ?? []),
  ]);

  const handleSubmit = async (
    values: CategoryFormValues,
    { setSubmitting }: FormikHelpers<CategoryFormValues>
  ) => {
    try {
      await createCategory.mutateAsync({
        name: values.name,
        description: values.description || undefined,
        parentId: values.parentId ?? undefined,
      });
      router.push("/admin/categories");
    } catch {
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Formik
      initialValues={{
        name: "",
        description: "",
        parentId: null as string | null,
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting, setFieldValue, values }) => (
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
              {isSubmitting ? "Creating..." : "Create Category"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}
