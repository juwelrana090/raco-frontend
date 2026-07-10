"use client";
import { Table, Modal } from "antd";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCategories } from "../contexts/CategoriesContext";
import { useDeleteCategory } from "../hooks/useDeleteCategory";
import type { ICategory } from "../types";
import type { ColumnsType } from "antd/es/table";

export default function CategoriesTable() {
  const { categories, total, isLoading } = useCategories();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const deleteCategory = useDeleteCategory();
  const router = useRouter();

  const columns: ColumnsType<ICategory> = [
    {
      title: "#",
      width: 50,
      render: (_: unknown, __: unknown, index: number) => (
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {index + 1}
        </span>
      ),
    },
    {
      title: "Category",
      dataIndex: "name",
      render: (_: unknown, record: ICategory) => (
        <div className="flex items-center gap-3">
          <div className="bg-brand-100 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium">
            {record.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-800 dark:text-white/90">
              {record.name}
            </p>
            {record.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {record.description}
              </p>
            )}
          </div>
        </div>
      ),
    },
    {
      title: "Slug",
      dataIndex: "slug",
      render: (slug: string) => (
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {slug}
        </span>
      ),
    },
    {
      title: "Products",
      dataIndex: "productCount",
      render: (count: number) => (
        <span className="text-sm font-medium text-gray-800 dark:text-white/90">
          {count ?? 0}
        </span>
      ),
    },
    {
      title: "Actions",
      width: 100,
      render: (_: unknown, record: ICategory) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => router.push(`/admin/categories/${record.id}/edit`)}
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
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
              />
            </svg>
          </button>
          <button
            onClick={() => setDeleteId(record.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-gray-500 hover:bg-error-50 hover:text-error-500 dark:text-gray-400 dark:hover:bg-error-500/10"
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
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="rounded-2xl border border-gray-200 dark:border-gray-800">
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          loading={isLoading}
          pagination={{
            total,
            pageSize: 10,
            showTotal: (total, range) =>
              `Showing ${range[0]}-${range[1]} of ${total} categories`,
          }}
        />
      </div>

      <Modal
        title="Delete Category"
        open={!!deleteId}
        onCancel={() => setDeleteId(null)}
        onOk={() => {
          if (deleteId) {
            deleteCategory.mutate(deleteId);
            setDeleteId(null);
          }
        }}
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true }}
      >
        <p>Are you sure you want to delete this category?</p>
      </Modal>
    </>
  );
}
