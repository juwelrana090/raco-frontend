'use client';
import { useSidebar } from '@/shared/context/SidebarContext';
import { useTheme } from '@/shared/context/ThemeContext';
import MenuIcon from '@/shared/icons/MenuIcon';
import XIcon from '@/shared/icons/XIcon';
import SearchIcon from '@/shared/icons/SearchIcon';
import SunIcon from '@/shared/icons/SunIcon';
import MoonIcon from '@/shared/icons/MoonIcon';
import BellIcon from '@/shared/icons/BellIcon';
import UserIcon from '@/shared/icons/UserIcon';
import { Dropdown, Button, Input } from 'antd';

const { Search } = Input;

export default function DashboardHeader() {
  const { isMobileOpen, toggleMobileSidebar, isExpanded } = useSidebar();
  const { theme, toggleTheme } = useTheme();

  const notificationItems = [
    {
      key: '1',
      label: <div className="px-2 py-1">New order received</div>,
    },
    {
      key: '2',
      label: <div className="px-2 py-1">Payment successful</div>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: '3',
      label: <div className="px-2 py-1 text-brand-500">View all notifications</div>,
    },
  ];

  const userItems = [
    {
      key: '1',
      label: <div className="px-2 py-1">Profile</div>,
    },
    {
      key: '2',
      label: <div className="px-2 py-1">Settings</div>,
    },
    {
      type: 'divider' as const,
    },
    {
      key: '3',
      label: <div className="px-2 py-1 text-error-500">Logout</div>,
    },
  ];

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-800 dark:bg-gray-900">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-white/5"
          aria-label="Toggle sidebar"
        >
          {isMobileOpen ? <XIcon /> : <MenuIcon />}
        </button>

        <div className="hidden md:block">
          <Search
            placeholder="Search..."
            className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/10 dark:focus:border-brand-800 h-11 w-64 rounded-lg border border-gray-200 dark:border-gray-700"
          />
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <Button
          onClick={toggleTheme}
          className="rounded-lg border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
          icon={theme === 'light' ? <MoonIcon /> : <SunIcon />}
        />

        {/* Notifications */}
        <Dropdown menu={{ items: notificationItems }} placement="bottomRight" trigger={['click']}>
          <Button
            className="rounded-lg border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            icon={<BellIcon />}
          />
        </Dropdown>

        {/* User menu */}
        <Dropdown menu={{ items: userItems }} placement="bottomRight" trigger={['click']}>
          <Button
            className="rounded-lg border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-300"
            icon={<UserIcon />}
          />
        </Dropdown>
      </div>
    </header>
  );
}