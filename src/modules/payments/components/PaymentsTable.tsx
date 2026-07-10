"use client";
import { Table } from "antd";
import dayjs from "dayjs";
import { usePayments } from "../contexts/PaymentsContext";
import Badge from "@/shared/components/ui/badge/Badge";
import type { IPayment } from "../types";
import type { ColumnsType } from "antd/es/table";

function formatPrice(price: number): string {
  return `৳ ${(price / 100).toLocaleString()}`;
}

const statusColor: Record<string, "warning" | "success" | "error" | "light"> = {
  PENDING: "warning",
  SUCCESS: "success",
  FAILED: "error",
  REFUNDED: "light",
};

export default function PaymentsTable() {
  const { payments, total, isLoading, page, setPage } = usePayments();

  const columns: ColumnsType<IPayment> = [
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
      title: "Transaction ID",
      dataIndex: "providerTxnId",
      render: (id: string) => (
        <span
          className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer hover:text-brand-500"
          onClick={() => navigator.clipboard.writeText(id)}
          title="Click to copy"
        >
          {id ? (id.length > 20 ? `${id.slice(0, 20)}...` : id) : "—"}
        </span>
      ),
    },
    {
      title: "Order ID",
      dataIndex: "orderId",
      render: (orderId: string) => (
        <span className="text-xs font-mono text-gray-500 dark:text-gray-400">
          #{orderId?.slice(0, 8)}...
        </span>
      ),
    },
    {
      title: "Provider",
      dataIndex: "provider",
      render: (provider: string) => (
        <Badge color={provider === "STRIPE" ? "primary" : "success"}>
          {provider?.toLowerCase()}
        </Badge>
      ),
    },
    {
      title: "Amount",
      dataIndex: "amount",
      render: (amount: number) => (
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
          {formatPrice(amount)}
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
  ];

  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800">
      <Table
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={isLoading}
        pagination={{
          current: page,
          total,
          pageSize: 10,
          onChange: setPage,
          showTotal: (total, range) =>
            `Showing ${range[0]}-${range[1]} of ${total} payments`,
        }}
        scroll={{ x: 800 }}
      />
    </div>
  );
}
