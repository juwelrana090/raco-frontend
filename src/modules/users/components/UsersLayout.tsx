"use client";
import { useUsers } from "../contexts/UsersContext";
import UsersFilters from "./UsersFilters";
import UsersTable from "./UsersTable";

export default function UsersLayout() {
  const { total } = useUsers();

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">
            Users
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} total users
          </p>
        </div>
      </div>
      <UsersFilters />
      <UsersTable />
    </div>
  );
}
