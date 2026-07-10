"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/lib/auth/AuthGuard";
import StorefrontHeader from "@/shared/components/storefront/StorefrontHeader";
import Footer from "@/shared/components/storefront/Footer";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { ThemeProvider } from "@/shared/context/ThemeContext";

const navLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/profile", label: "Profile" },
  { href: "/orders", label: "My Orders" },
  { href: "/payments", label: "Payments" },
];

function SideNavItem({ href, label }: { href: string; label: string }) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  return (
    <Link
      href={href}
      className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        isActive
          ? "bg-brand-50 text-brand-500 dark:bg-brand-500/12 dark:text-brand-400"
          : "text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/5"
      }`}
    >
      {label}
    </Link>
  );
}

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ThemeProvider>
        <QueryProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
            <StorefrontHeader />
            <div className="flex-1 mx-auto max-w-7xl w-full px-4 py-8">
              <div className="flex flex-col lg:flex-row gap-6">
                {/* Side nav */}
                <aside className="w-full lg:w-56 shrink-0">
                  <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-900">
                    <nav className="flex flex-col gap-1">
                      {navLinks.map((link) => (
                        <SideNavItem
                          key={link.href}
                          href={link.href}
                          label={link.label}
                        />
                      ))}
                    </nav>
                  </div>
                </aside>
                {/* Main content */}
                <main className="flex-1">{children}</main>
              </div>
            </div>
            <Footer />
          </div>
        </QueryProvider>
      </ThemeProvider>
    </AuthGuard>
  );
}
