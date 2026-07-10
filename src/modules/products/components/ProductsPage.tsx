'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Table, Button, Input, Select, Popconfirm, Image } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useProducts, useDeleteProduct } from '../hooks/useProducts';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import type { IProduct } from '@/lib/api/products';

const inputClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

export default function ProductsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string | undefined>();

  const { data: productsData, isLoading } = useProducts({ page, limit: 10, search, categoryId: categoryFilter });
  const { data: categoriesData } = useCategories({ limit: 100 });
  const deleteMutation = useDeleteProduct();

  const formatPrice = (poisha: number) => {
    const taka = poisha / 100;
    return `৳${taka.toLocaleString('en-BD', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const columns: ColumnsType<IProduct> = [
    {
      title: 'Image',
      dataIndex: 'imageUrl',
      key: 'imageUrl',
      render: (imageUrl: string | null) => (
        <div className="flex h-12 w-12 items-center justify-center">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt="Product"
              width={48}
              height={48}
              className="rounded-lg object-cover"
              fallback="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <span className="text-sm font-medium">P</span>
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string) => <span className="font-medium text-gray-800 dark:text-white/90">{name}</span>,
    },
    {
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (sku: string) => <span className="text-sm text-gray-500 dark:text-gray-400">{sku}</span>,
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
      render: (category: any) => {
        const name = category?.name || 'Unknown';
        return (
          <span className="inline-flex rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-medium text-brand-500 dark:bg-brand-500/15 dark:text-brand-400">
            {name}
          </span>
        );
      },
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <span className="font-medium text-gray-800 dark:text-white/90">{formatPrice(price)}</span>,
    },
    {
      title: 'Quantity',
      dataIndex: 'quantity',
      key: 'quantity',
      render: (quantity: number) => (
        <span className={quantity < 10 ? 'text-error-500' : quantity < 50 ? 'text-warning-500' : 'text-success-500'}>
          {quantity}
        </span>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="text"
            size="small"
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => router.push(`/admin/products/edit/${record.id}`)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete product"
            description="Are you sure you want to delete this product?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="text" size="small" danger icon={<Trash2 className="h-4 w-4" />}>
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const products = productsData?.products || [];
  const total = productsData?.total || 0;
  const categories = categoriesData || [];

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Products</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} total products</p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => router.push('/admin/products/add')}
        >
          Add Product
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
          <Input
            placeholder="Search by name or SKU..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className={inputClass}
          />
          <Select
            placeholder="Filter by category"
            value={categoryFilter}
            onChange={setCategoryFilter}
            allowClear
            className="w-full sm:w-48"
            options={[
              { label: 'All Categories', value: undefined },
              ...categories.map((cat: any) => ({ label: cat.name, value: cat.id })),
            ]}
          />
        </div>

        <Table
          columns={columns}
          dataSource={products}
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
