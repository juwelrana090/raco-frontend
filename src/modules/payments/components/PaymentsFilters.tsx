"use client";
import { usePayments } from "../contexts/PaymentsContext";

const statusOptions = [
  { value: "", label: "All Status" },
  { value: "PENDING", label: "Pending" },
  { value: "SUCCESS", label: "Success" },
  { value: "FAILED", label: "Failed" },
  { value: "REFUNDED", label: "Refunded" },
];

const providerOptions = [
  { value: "", label: "All Providers" },
  { value: "STRIPE", label: "Stripe" },
  { value: "BKASH", label: "bKash" },
];

export default function PaymentsFilters() {
  const { filters, setStatus, setProvider } = usePayments();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <select
        value={filters.status ?? ""}
        onChange={(e) => setStatus(e.target.value)}
        className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        {statusOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <select
        value={filters.provider ?? ""}
        onChange={(e) => setProvider(e.target.value)}
        className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        {providerOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
