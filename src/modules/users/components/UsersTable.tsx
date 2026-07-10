"use client";
import { Table } from "antd";
import Link from "next/link";
import dayjs from "dayjs";
import { useUsers } from "../contexts/UsersContext";
import Badge from "@/shared/components/ui/badge/Badge";
import type { IUser } from "../types";
import type { ColumnsType } from "antd/es/table";

export default function UsersTable() {
  const { users, total, isLoading, page, setPage } = useUsers();

  const columns: ColumnsType<IUser> = [
    {
      title: "#",
      width: 50,
      render: (_: unknown, __: unknown, index: number) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {(page - 1) * 10 + index + 1}
        </span>
      ),
    },
    {
      title: "User",
      render: (_: unknown, record: IUser) => (
        <div className="flex items-center gap-2">
          <div className="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
            {record.name[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {record.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {record.email}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: "Role",
      dataIndex: "role",
      render: (role: string) => (
        <Badge color={role === "ADMIN" ? "primary" : "light"}>{role}</Badge>
      ),
    },
    {
      title: "Joined",
      dataIndex: "createdAt",
      render: (date: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {dayjs(date).format("DD MMM YYYY")}
        </span>
      ),
    },
    {
      title: "Actions",
      render: (_: unknown, record: IUser) => (
        <Link
          href={`/admin/users/${record.id}`}
          className="text-sm text-brand-500 hover:text-brand-600"
        >
          View
        </Link>
      ),
    },
  ];

  return (
    <Table
      columns={columns}
      dataSource={users}
      rowKey="id"
      loading={isLoading}
      pagination={{
        current: page,
        total,
        pageSize: 10,
        onChange: setPage,
        showSizeChanger: false,
      }}
    />
  );
}
