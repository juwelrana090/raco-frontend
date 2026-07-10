'use client';
import DashboardLayout from '@/shared/components/layouts/DashboardLayout';
import { SidebarProvider } from '@/shared/context/SidebarContext';
import { ThemeProvider } from '@/shared/context/ThemeContext';
import AuthGuard from '@/lib/auth/AuthGuard';
import { QueryProvider } from '@/lib/providers/QueryProvider';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="ADMIN">
      <QueryProvider>
        <ThemeProvider>
          <SidebarProvider>
            <div className="min-h-screen bg-white transition-colors duration-200 dark:bg-gray-900">
              <ToastContainer position="top-right" autoClose={3000} />
              <DashboardLayout>{children}</DashboardLayout>
            </div>
          </SidebarProvider>
        </ThemeProvider>
      </QueryProvider>
    </AuthGuard>
  );
}