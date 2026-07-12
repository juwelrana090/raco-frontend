"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSidebar } from "@/shared/context/SidebarContext";
import { useAuthStore } from '@/lib/auth/authStore';
import { authApi } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import GridIcon from "@/shared/icons/GridIcon";
import BoxIcon from "@/shared/icons/BoxIcon";
import CategoryIcon from "@/shared/icons/CategoryIcon";
import ClipboardIcon from "@/shared/icons/ClipboardIcon";
import DollarIcon from "@/shared/icons/DollarIcon";
import UserIcon from "@/shared/icons/UserIcon";
import ChevronDownIcon from "@/shared/icons/ChevronDownIcon";

interface NavItem {
  icon: React.ReactNode;
  name: string;
  path?: string;
  subItems?: { name: string; path: string }[];
}

const mainNav: NavItem[] = [
  { icon: <GridIcon />, name: "Dashboard", path: "/admin/dashboard" },
];

const managementNav: NavItem[] = [
  {
    icon: <BoxIcon />,
    name: "Products",
    subItems: [
      { name: "Add Product", path: "/admin/products/add" },
      { name: "Manage Products", path: "/admin/products" },
    ],
  },
  {
    icon: <CategoryIcon />,
    name: "Categories",
    subItems: [
      { name: "Add Category", path: "/admin/categories/add" },
      { name: "Manage Categories", path: "/admin/categories" },
    ],
  },
  { icon: <ClipboardIcon />, name: "Orders", path: "/admin/orders" },
  { icon: <DollarIcon />, name: "Payments", path: "/admin/payments" },
  { icon: <UserIcon />, name: "Users", path: "/admin/users" },
  { icon: <UserIcon />, name: "Profile", path: "/admin/profile" },
];

export default function DashboardSidebar() {
  const {
    isExpanded,
    isHovered,
    isMobileOpen,
    toggleMobileSidebar,
    setIsHovered,
  } = useSidebar();
  const pathname = usePathname();
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const { user, clearAuth } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const refreshToken = Cookies.get('raco_refresh') ?? '';
      if (refreshToken) {
        await authApi.logout(refreshToken).catch(() => {});
      }
    } finally {
      clearAuth();
      router.push('/auth/login');
    }
  };

  useEffect(() => {
    managementNav.forEach((item) => {
      if (item.subItems) {
        const hasActiveSubitem = item.subItems.some(
          (sub) => sub.path === pathname,
        );
        if (hasActiveSubitem) {
          setOpenMenus((prev) => new Set(prev).add(item.name));
        }
      }
    });
  }, [pathname]);

  const toggleMenu = (name: string) => {
    setOpenMenus((prev) => {
      const next = new Set(prev);
      if (next.has(name)) {
        next.delete(name);
      } else {
        next.add(name);
      }
      return next;
    });
  };

  const isMenuOpen = (name: string) => openMenus.has(name);

  const sidebarWidth = isMobileOpen
    ? "translate-x-0"
    : "-translate-x-full lg:translate-x-0";
  const collapsedWidth = isExpanded || isHovered ? "w-[290px]" : "w-[90px]";

  const renderNavItem = (item: NavItem, isManagement = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isActive = item.path === pathname;
    const isOpen = isMenuOpen(item.name);

    return (
      <div key={item.name} className={isManagement ? "mt-1" : ""}>
        <div
          className={`group flex items-center gap-3 ${isExpanded || isHovered ? "px-3" : "justify-center px-3"} ${
            hasSubItems ? "cursor-pointer" : ""
          }`}
          onClick={() => hasSubItems && toggleMenu(item.name)}
        >
          {hasSubItems ? (
            <>
              <div
                className={`menu-item ${isActive ? "menu-item-active" : "menu-item-inactive"}`}
                style={{ width: "100%" }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={
                      isActive
                        ? "menu-item-icon-active"
                        : "menu-item-icon-inactive"
                    }
                  >
                    {item.icon}
                  </div>
                  {(isExpanded || isHovered) && (
                    <>
                      <span className="flex-1">{item.name}</span>
                      <div
                        className={`menu-item-arrow ${
                          isOpen
                            ? "menu-item-arrow-active"
                            : "menu-item-arrow-inactive"
                        }`}
                        style={{ transition: "transform 0.2s ease" }}
                      >
                        <ChevronDownIcon />
                      </div>
                    </>
                  )}
                </div>
              </div>
            </>
          ) : (
            <Link
              href={item.path || "#"}
              className={`menu-item ${isActive ? "menu-item-active" : "menu-item-inactive"}`}
              style={{ width: "100%" }}
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    isActive
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }
                >
                  {item.icon}
                </div>
                {(isExpanded || isHovered) && <span>{item.name}</span>}
              </div>
            </Link>
          )}
        </div>

        {hasSubItems && (isExpanded || isHovered) && (
          <div
            className="overflow-hidden transition-all duration-300 ease-in-out"
            style={{
              maxHeight: isOpen ? "500px" : "0px",
            }}
          >
            <div className="mt-1 ml-9 flex flex-col gap-0.5">
              {item.subItems?.map((sub) => {
                const isSubActive = sub.path === pathname;
                return (
                  <Link
                    key={sub.path}
                    href={sub.path}
                    className={`menu-dropdown-item ${
                      isSubActive
                        ? "menu-dropdown-item-active"
                        : "menu-dropdown-item-inactive"
                    }`}
                  >
                    {sub.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          onClick={toggleMobileSidebar}
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen ${sidebarWidth} ${collapsedWidth} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out dark:bg-gray-900 dark:border-gray-800`}
        onMouseEnter={() => !isExpanded && setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Logo area */}
        <div className="flex h-16 items-center gap-3 border-b border-gray-200 px-4 dark:border-gray-800">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500">
            <span className="text-lg font-bold text-white">R</span>
          </div>
          {(isExpanded || isHovered) && (
            <div>
              <h1 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                Raco
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Admin Panel
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="space-y-5 px-3 py-4">
          {/* Main navigation */}
          <div>{mainNav.map((item) => renderNavItem(item))}</div>

          {/* Management navigation */}
          <div>
            {(isExpanded || isHovered) && (
              <p className="mb-2 px-3 text-xs font-medium uppercase text-gray-500 dark:text-gray-400">
                Management
              </p>
            )}
            {managementNav.map((item) => renderNavItem(item, true))}
          </div>
        </div>

        {/* Footer */}
        {(isExpanded || isHovered) && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800">
            {/* User info */}
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                  <span className="text-sm font-medium">
                    {user?.name?.[0]?.toUpperCase() ?? 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800 dark:text-white/90">
                    {user?.name ?? 'Admin User'}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {user?.email ?? 'admin@raco.com'}
                  </p>
                </div>
              </div>
            </div>

            {/* Logout button */}
            <div className="border-t border-gray-200 dark:border-gray-800 p-4">
              <button
                onClick={handleLogout}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400 transition-colors"
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
                    d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                  />
                </svg>
                Logout
              </button>
            </div>
          </div>
        )}

        {/* Collapsed logout button */}
        {!(isExpanded || isHovered) && (
          <div className="absolute bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-800 p-4">
            <button
              onClick={handleLogout}
              className="flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-gray-600 hover:bg-error-50 hover:text-error-600 dark:text-gray-400 dark:hover:bg-error-500/10 dark:hover:text-error-400 transition-colors"
              title="Logout"
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
                  d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9"
                />
              </svg>
            </button>
          </div>
        )}
      </aside>
    </>
  );
}
