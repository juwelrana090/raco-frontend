"use client";
import { useAuthStore } from "./authStore";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: "ADMIN" | "USER";
}) {
  const { isAuthenticated, user } = useAuthStore();
  const router = useRouter();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Use setTimeout to avoid synchronous setState during render
    const timer = setTimeout(() => setHydrated(true), 0);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    if (!isAuthenticated) {
      router.replace("/auth/login");
      return;
    }

    if (requiredRole === "ADMIN" && user !== null && user.role !== "ADMIN") {
      router.replace("/");
    }
  }, [hydrated, isAuthenticated, user, requiredRole, router]);

  if (!hydrated) return null;
  if (!isAuthenticated) return null;
  if (requiredRole === "ADMIN" && user !== null && user.role !== "ADMIN")
    return null;

  return <>{children}</>;
}
