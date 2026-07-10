"use client";
import { useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useUsers } from "../hooks/useUsers";
import type { IUser } from "@/lib/api/types";

const inputClass =
  "shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30";

export default function UsersPage() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useUsers({ page, limit: 10 });

  const columns: ColumnsType<IUser> = [
    {
      title: "User",
      dataIndex: "name",
      key: "name",
      render: (name: string, record: IUser) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-white/90">
            {name}
          </div>
          <div className="text-xs text-gray-500">{record.email}</div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      key: "role",
      render: (role: "USER" | "ADMIN") => (
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
            role === "ADMIN"
              ? "bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-400"
              : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}
        >
          {role}
        </span>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const users = data?.items || [];
  const total = data?.total || 0;

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

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <Table
          columns={columns}
          dataSource={users}
          loading={isLoading}
          rowKey="id"
          pagination={{
            current: page,
            pageSize: 10,
            total,
            onChange: (newPage) => setPage(newPage),
            showSizeChanger: false,
          }}
          className="border-0"
        />
      </div>
    </div>
  );
}
