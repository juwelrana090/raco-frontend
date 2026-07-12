"use client";
import { useParams } from "next/navigation";
import { Table } from "antd";
import Link from "next/link";
import dayjs from "dayjs";
import {
  useFetchUser,
  useFetchUserOrders,
} from "@/modules/users/hooks/useFetchUsers";
import Badge from "@/shared/components/ui/badge/Badge";
import type { ColumnsType } from "antd/es/table";

const statusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELED: "error",
};

function formatPrice(price: number): string {
  return `৳ ${(price / 100).toLocaleString()}`;
}

const orderColumns: ColumnsType<any> = [
  {
    title: "Order ID",
    dataIndex: "id",
    render: (id: string) => (
      <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
        #{id?.slice(0, 8)}
      </span>
    ),
  },
  {
    title: "Items",
    dataIndex: "items",
    render: (items: any[]) => (
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {items?.length ?? 0}
      </span>
    ),
  },
  {
    title: "Total",
    dataIndex: "totalAmount",
    render: (total: number) => (
      <span className="text-sm font-medium text-gray-800 dark:text-white/90">
        {formatPrice(total)}
      </span>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    render: (status: string) => (
      <Badge color={statusColor[status] ?? "light"}>
        {status?.toLowerCase()}
      </Badge>
    ),
  },
  {
    title: "Date",
    dataIndex: "createdAt",
    render: (date: string) => (
      <span className="text-sm text-gray-600 dark:text-gray-300">
        {dayjs(date).format("DD MMM YYYY")}
      </span>
    ),
  },
  {
    title: "Actions",
    render: (_: unknown, record: any) => (
      <Link
        href={`/admin/orders/${record.id}`}
        className="text-sm text-brand-500 hover:text-brand-600"
      >
        View
      </Link>
    ),
  },
];

export default function UserDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { data: user, isLoading: userLoading } = useFetchUser(id);
  const { data: ordersData, isLoading: ordersLoading } = useFetchUserOrders(id);

  const orders: any[] = (ordersData as any)?.items ?? [];

  if (userLoading) {
    return (
      <div className="space-y-5">
        <div className="h-6 w-32 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700" />
        <div className="h-48 animate-pulse rounded-2xl bg-gray-200 dark:bg-gray-700" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-gray-500 dark:text-gray-400">
        User not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-2">
        <Link
          href="/admin/users"
          className="text-sm text-brand-500 hover:text-brand-600"
        >
          ← Back to Users
        </Link>
      </div>

      {/* Card 1 — User Info */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          User Info
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
              {(user as any).name}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
              {(user as any).email}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
            <div className="mt-1">
              <Badge
                color={(user as any).role === "ADMIN" ? "primary" : "light"}
              >
                {(user as any).role}
              </Badge>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 dark:text-gray-400">Joined</p>
            <p className="mt-1 text-sm font-medium text-gray-800 dark:text-white/90">
              {dayjs((user as any).createdAt).format("DD MMM YYYY")}
            </p>
          </div>
        </div>
      </div>

      {/* Card 2 — Orders */}
      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <h3 className="mb-4 text-base font-semibold text-gray-800 dark:text-white/90">
          Orders
        </h3>
        <Table
          columns={orderColumns}
          dataSource={orders}
          rowKey="id"
          loading={ordersLoading}
          pagination={false}
        />
      </div>
    </div>
  );
}
