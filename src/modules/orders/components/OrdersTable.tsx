"use client";
import { Table } from "antd";
import { useRouter } from "next/navigation";
import dayjs from "dayjs";
import { useOrders } from "../contexts/OrdersContext";
import Badge from "@/shared/components/ui/badge/Badge";
import type { IOrder } from "../types";
import type { ColumnsType } from "antd/es/table";

function formatPrice(price: number): string {
  return `৳ ${(price / 100).toLocaleString()}`;
}

const statusColor: Record<string, "warning" | "success" | "error"> = {
  PENDING: "warning",
  PAID: "success",
  CANCELED: "error",
};

export default function OrdersTable() {
  const { orders, total, isLoading, page, setPage } = useOrders();
  const router = useRouter();

  const columns: ColumnsType<IOrder> = [
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
      title: "Order ID",
      dataIndex: "id",
      render: (id: string) => (
        <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
          #{id?.slice(0, 8)}...
        </span>
      ),
    },
    {
      title: "User ID",
      dataIndex: "userId",
      render: (userId: string) => (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {userId?.slice(0, 8)}...
        </span>
      ),
    },
    {
      title: "Total",
      dataIndex: "totalAmount",
      render: (totalAmount: number) => (
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
          {formatPrice(totalAmount ?? 0)}
        </span>
      ),
    },
    {
      title: "Items",
      dataIndex: "items",
      render: (items: IOrder["items"]) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {items?.length ?? 0}
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
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {dayjs(date).format("MMM D, YYYY")}
        </span>
      ),
    },
    {
      title: "Actions",
      width: 80,
      render: (_: unknown, record: IOrder) => (
        <button
          onClick={() => router.push(`/admin/orders/${record.id}`)}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-400 dark:hover:bg-white/5"
        >
          <svg
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
            />
          </svg>
        </button>
      ),
    },
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800">
      <Table
        columns={columns}
        dataSource={orders}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} orders`,
        }}
        scroll={{ x: 700 }}
      />
    </div>
  );
}
