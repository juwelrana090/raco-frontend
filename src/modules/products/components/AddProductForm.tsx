"use client";
import { useRouter } from "next/navigation";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRef, useState } from "react";
import { useCreateProduct } from "../hooks/useCreateProduct";
import { productsApi } from "../api";
import ButtonLoader from "@/shared/components/ui/button/ButtonLoader";
import { toast } from "react-toastify";

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
  categoryId: Yup.string().required("Category is required"),
});

interface ProductFormValues {
  name: string;
  sku: string;
  description: string;
  price: number;
  stock: number;
  categoryId: string;
}

interface AddProductFormProps {
  categories: Array<{
    id: string;
    name: string;
    children?: Array<{ id: string; name: string }>;
  }>;
}

export default function AddProductForm({ categories }: AddProductFormProps) {
  const router = useRouter();
  const createProduct = useCreateProduct();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  const flattenedCategories = categories.flatMap((cat) => [
    { id: cat.id, name: cat.name, depth: 0 },
    ...(cat.children?.map((child) => ({
      id: child.id,
      name: child.name,
      depth: 1,
    })) ?? []),
  ]);

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

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (
    values: ProductFormValues,
    { setSubmitting }: FormikHelpers<ProductFormValues>,
  ) => {
    try {
      // Step 1: Create product
      const product = await createProduct.mutateAsync(values);
      const productId = (product as any)?.id;

      // Step 2: Upload image if a file was selected
      if (selectedFile && productId) {
        setUploadingImage(true);
        try {
          await productsApi.uploadImage(productId, selectedFile);
        } catch (err: any) {
          toast.error(
            `Product created but image upload failed: ${err.message}`,
          );
        } finally {
          setUploadingImage(false);
        }
      }

      router.push("/admin/products");
    } catch {
      // error toast handled in useCreateProduct hook
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
        categoryId: "",
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, isSubmitting }) => (
        <Form className="space-y-6">
          {/* ── Basic Information ─────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Basic Information
            </h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Name *
                </label>
                <Field
                  name="name"
                  className={inputClass}
                  placeholder="Product name"
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-xs text-error-500">{errors.name}</p>
                )}
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  SKU *
                </label>
                <Field
                  name="sku"
                  className={inputClass}
                  placeholder="e.g. PRD-001"
                />
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
                rows={3}
                className={inputClass}
                placeholder="Product description"
              />
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
                  Price (Poisha) *
                  <span className="ml-1 text-xs font-normal text-gray-400">
                    100 = ৳1.00
                  </span>
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
            </div>
          </div>

          {/* ── Category ──────────────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Category
            </h3>
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

          {/* ── Product Image ─────────────────────────────────────── */}
          <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
            <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
              Product Image
              <span className="ml-2 text-xs font-normal text-gray-400">
                Optional · JPG, PNG, WEBP, GIF · max 5MB
              </span>
            </h3>

            {preview ? (
              <div className="flex items-start gap-4">
                <img
                  src={preview}
                  alt="Preview"
                  className="h-32 w-32 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
                />
                <div className="flex flex-col gap-2 pt-1">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {selectedFile?.name}
                  </p>
                  <p className="text-xs text-gray-400">
                    {selectedFile
                      ? (selectedFile.size / 1024).toFixed(1) + " KB"
                      : ""}
                  </p>
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="flex items-center gap-1 text-xs text-error-500 hover:text-error-600"
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
                        d="M6 18 18 6M6 6l12 12"
                      />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            ) : (
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
                    Click to upload product image
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
              onClick={() => router.push("/admin/products")}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || uploadingImage}
              className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
            >
              {(isSubmitting || uploadingImage) && <ButtonLoader />}
              {uploadingImage
                ? "Uploading image..."
                : isSubmitting
                  ? "Creating..."
                  : "Create Product"}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
}