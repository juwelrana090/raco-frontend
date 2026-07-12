"use client";
import { useRouter, useParams } from "next/navigation";
import { Formik, Form, Field, type FormikHelpers } from "formik";
import * as Yup from "yup";
import { useRef, useState } from "react";
import { useFetchProduct } from "../hooks/useFetchProducts";
import { useUpdateProduct } from "../hooks/useUpdateProduct";
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

interface EditProductFormProps {
  categories: Array<{
    id: string;
    name: string;
    children?: Array<{ id: string; name: string }>;
  }>;
}

export default function EditProductForm({ categories }: EditProductFormProps) {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const { data: product, isLoading, refetch } = useFetchProduct(productId);
  const updateProduct = useUpdateProduct();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

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

  const handleCancelNewFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !productId) return;
    setUploadingImage(true);
    try {
      await productsApi.uploadImage(productId, selectedFile);
      toast.success("Image uploaded successfully");
      handleCancelNewFile();
      refetch();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!productId) return;
    if (!confirm("Delete the current product image?")) return;
    setDeletingImage(true);
    try {
      await productsApi.deleteImage(productId);
      toast.success("Image deleted");
      refetch();
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || "Failed to delete image");
    } finally {
      setDeletingImage(false);
    }
  };

  const handleSubmit = async (
    values: ProductFormValues,
    { setSubmitting }: FormikHelpers<ProductFormValues>,
  ) => {
    try {
      await updateProduct.mutateAsync({ id: productId, data: values });
      router.push("/admin/products");
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

  if (!product) {
    return (
      <div className="text-center text-gray-500 dark:text-gray-400">
        Product not found
      </div>
    );
  }

  return (
    <Formik
      initialValues={{
        name: product.name,
        sku: product.sku,
        description: product.description ?? "",
        price: product.price,
        stock: product.stock,
        categoryId: product.categoryId,
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
                JPG, PNG, WEBP, GIF · max 5MB
              </span>
            </h3>

            {/* Existing image (no new file selected) */}
            {product.imageUrl && !preview && (
              <div className="mb-4 flex items-start gap-4">
                <img
                  src={product.imageUrl}
                  alt="Current"
                  className="h-32 w-32 rounded-xl object-cover border border-gray-200 dark:border-gray-700"
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

            {/* New file selected — show preview + Upload Now button */}
            {preview && (
              <div className="mb-4 flex items-start gap-4">
                <img
                  src={preview}
                  alt="New"
                  className="h-32 w-32 rounded-xl object-cover border-2 border-brand-400"
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

            {/* No image at all — show upload area */}
            {!product.imageUrl && !preview && (
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