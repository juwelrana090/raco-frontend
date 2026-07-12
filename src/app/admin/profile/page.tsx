"use client";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { accountApi } from "@/lib/api/account";
import { useAuthStore } from "@/lib/auth/authStore";

const inputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

export default function AdminProfilePage() {
  const { user, setAuth, token } = useAuthStore();

  const { data: meData } = useQuery({
    queryKey: ["admin-me"],
    queryFn: () => accountApi.getMe(),
  });

  const me = meData ?? user;

  const form = useFormik({
    enableReinitialize: true,
    initialValues: { name: me?.name ?? "" },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
    }),
    onSubmit: async (values) => {
      try {
        await accountApi.updateMe({ name: values.name });
        if (user && token) {
          const refreshToken = Cookies.get("raco_refresh") ?? "";
          setAuth({ ...user, name: values.name }, token, refreshToken);
        }
        toast.success("Profile updated");
      } catch (err) {
        const error = err as Error;
        toast.error(error.message ?? "Failed to update profile");
      }
    },
  });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
          Admin Profile
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Update your account details
        </p>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Personal Info
        </h3>
        <form onSubmit={form.handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Name
            </label>
            <input
              name="name"
              value={form.values.name}
              onChange={form.handleChange}
              className={inputClass}
              placeholder="Your full name"
            />
            {form.errors.name && form.touched.name && (
              <p className="mt-1 text-xs text-error-500">
                {String(form.errors.name)}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Email
            </label>
            <div className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              {me?.email}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-400">
              Role
            </label>
            <div className="h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400">
              {me?.role}
            </div>
          </div>
          <button
            type="submit"
            disabled={form.isSubmitting}
            className="bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 rounded-lg px-5 py-2.5 text-sm font-medium text-white transition-colors"
          >
            {form.isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
