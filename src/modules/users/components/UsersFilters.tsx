"use client";
import { useUsers } from "../contexts/UsersContext";
import SearchIcon from "@/shared/icons/SearchIcon";

const filterInputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-10 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

const roleOptions = [
  { value: "", label: "All Roles" },
  { value: "USER", label: "USER" },
  { value: "ADMIN", label: "ADMIN" },
];

export default function UsersFilters() {
  const { filters, setSearch, setRole } = useUsers();

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <SearchIcon />
        </span>
        <input
          type="text"
          placeholder="Search users..."
          value={filters.search ?? ""}
          onChange={(e) => setSearch(e.target.value)}
          className={`${filterInputClass} pl-10`}
        />
      </div>
      <select
        value={filters.role ?? ""}
        onChange={(e) => setRole(e.target.value)}
        className="shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-10 rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90"
      >
        {roleOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
