'use client';
import { useSidebar } from '@/shared/context/SidebarContext';
import DashboardHeader from './DashboardHeader';
import DashboardSidebar from './DashboardSidebar';
import Backdrop from './Backdrop';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();
  const mainContentMargin = isMobileOpen
    ? 'ml-0'
    : isExpanded || isHovered
      ? 'lg:ml-[290px]'
      : 'lg:ml-[90px]';

  return (
    <div className="min-h-screen xl:flex">
      <DashboardSidebar />
      <Backdrop />
      <div className={`flex-1 transition-all duration-300 ease-in-out ${mainContentMargin}`}>
        <DashboardHeader />
        <div className="mx-auto max-w-[--breakpoint-2xl] p-4 md:p-6">{children}</div>
      </div>
    </div>
  );
}