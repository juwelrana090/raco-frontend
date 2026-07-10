'use client';
import { useState } from 'react';
import { Table, Button, Select, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { useOrders, useUpdateOrderStatus } from '../hooks/useOrders';
import type { IOrder, OrderStatus } from '@/lib/api/orders';

const inputClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

const statusConfig: Record<OrderStatus, { color: string; label: string }> = {
  pending: { color: 'warning', label: 'Pending' },
  processing: { color: 'processing', label: 'Processing' },
  shipped: { color: 'default', label: 'Shipped' },
  delivered: { color: 'success', label: 'Delivered' },
  cancelled: { color: 'error', label: 'Cancelled' },
  refunded: { color: 'default', label: 'Refunded' },
};

export default function OrdersPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<OrderStatus | undefined>();

  const { data, isLoading } = useOrders({ page, limit: 10, status: statusFilter });
  const updateStatusMutation = useUpdateOrderStatus();

  const formatPrice = (poisha: number) => {
    const taka = poisha / 100;
    return `৳${taka.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateStatusMutation.mutateAsync({ id: orderId, status: newStatus });
    } catch (error) {
      // Error handled by mutation
    }
  };

  const columns: ColumnsType<IOrder> = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <span className="text-sm font-mono text-gray-500">{id.slice(0, 8)}</span>,
    },
    {
      title: 'Customer',
      dataIndex: 'userName',
      key: 'userName',
      render: (name: string, record: IOrder) => (
        <div>
          <div className="font-medium text-gray-800 dark:text-white/90">{name}</div>
          <div className="text-xs text-gray-500">{record.userEmail}</div>
        </div>
      ),
    },
    {
      title: 'Items',
      dataIndex: 'items',
      key: 'items',
      render: (items: any[]) => (
        <div className="text-sm">
          <div className="font-medium text-gray-800 dark:text-white/90">{items.length} items</div>
          <div className="text-xs text-gray-500">
            {items.slice(0, 2).map((item) => item.productName).join(', ')}
            {items.length > 2 && '...'}
          </div>
        </div>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      render: (amount: number) => (
        <span className="font-medium text-gray-800 dark:text-white/90">{formatPrice(amount)}</span>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: OrderStatus, record: IOrder) => (
        <Select
          size="small"
          value={status}
          onChange={(value) => handleStatusChange(record.id, value as OrderStatus)}
          loading={updateStatusMutation.isPending}
          options={Object.entries(statusConfig).map(([key, { label, color }]) => ({
            label,
            value: key,
          }))}
          className="w-32"
        />
      ),
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ];

  const orders = data?.orders || [];
  const total = data?.total || 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Orders</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} total orders</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex justify-end p-4">
          <Select
            placeholder="Filter by status"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as OrderStatus | undefined)}
            allowClear
            className="w-48"
            options={[
              { label: 'All Orders', value: undefined },
              ...Object.entries(statusConfig).map(([key, { label }]) => ({
                label,
                value: key,
              })),
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={orders}
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
