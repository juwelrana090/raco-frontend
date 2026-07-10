import StorefrontHeader from "@/shared/components/storefront/StorefrontHeader";
import Footer from "@/shared/components/storefront/Footer";
import { QueryProvider } from "@/lib/providers/QueryProvider";
import { ThemeProvider } from "@/shared/context/ThemeContext";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function StorefrontLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider>
      <QueryProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
          <ToastContainer position="top-right" autoClose={3000} />
          <StorefrontHeader />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
      </QueryProvider>
    </ThemeProvider>
  );
}
