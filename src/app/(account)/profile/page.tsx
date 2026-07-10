"use client";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { accountApi } from "@/lib/api/account";
import { useAuthStore } from "@/lib/auth/authStore";
import Badge from "@/shared/components/ui/badge/Badge";

const inputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

const readOnlyClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400";

export default function ProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const { data: meData, isLoading } = useQuery({
    queryKey: ["account-me"],
    queryFn: () => accountApi.getMe(),
  });

  const me = (meData as any) ?? user;

  const profileForm = useFormik({
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
      } catch (err: any) {
        toast.error(err?.message ?? "Failed to update profile");
      }
    },
  });

  if (isLoading) {
    return (
      <div className="space-y-5">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-800"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
        Profile
      </h1>

      {/* Card 1 — Personal Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Personal Information
        </h3>
        <form onSubmit={profileForm.handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
              Name
            </label>
            <input
              name="name"
              value={profileForm.values.name}
              onChange={profileForm.handleChange}
              onBlur={profileForm.handleBlur}
              className={inputClass}
              placeholder="Your name"
            />
            {profileForm.touched.name && profileForm.errors.name && (
              <p className="mt-1 text-xs text-red-500">
                {String(profileForm.errors.name)}
              </p>
            )}
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
              Email
            </label>
            <input readOnly value={me?.email ?? ""} className={readOnlyClass} />
          </div>
          <div>
            <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300">
              Role
            </label>
            <div className="mt-1">
              <Badge color={me?.role === "ADMIN" ? "primary" : "light"}>
                {me?.role}
              </Badge>
            </div>
          </div>
          <button
            type="submit"
            disabled={profileForm.isSubmitting}
            className="rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 disabled:opacity-50"
          >
            {profileForm.isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>

      {/* Card 2 — Change Password */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Change Password
        </h3>
        <div className="rounded-lg border border-warning-200 bg-warning-50 dark:border-warning-800 dark:bg-warning-500/10 px-4 py-3">
          <p className="text-sm text-warning-700 dark:text-warning-400">
            Coming soon — password change is not yet available.
          </p>
        </div>
        <div className="mt-4 space-y-4 opacity-50 pointer-events-none">
          {(["current", "new", "confirm"] as const).map((field) => (
            <div key={field}>
              <label className="mb-1 block text-sm text-gray-700 dark:text-gray-300 capitalize">
                {field === "current"
                  ? "Current Password"
                  : field === "new"
                    ? "New Password"
                    : "Confirm New Password"}
              </label>
              <div className="relative">
                <input
                  type={showPasswords[field] ? "text" : "password"}
                  disabled
                  className={inputClass}
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPasswords((p) => ({ ...p, [field]: !p[field] }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                >
                  {showPasswords[field] ? "Hide" : "Show"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
