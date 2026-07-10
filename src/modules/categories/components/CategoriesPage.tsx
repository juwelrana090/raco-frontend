'use client';
import { useState } from 'react';
import { Table, Button, Input, Modal, Form, Select, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import type { ICategory } from '@/lib/api/categories';

const inputClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [form] = Form.useForm();

  const { data, isLoading } = useCategories({ page, limit: 10, search });
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleCreate = async (values: any) => {
    try {
      await createMutation.mutateAsync(values);
      setIsAddModalOpen(false);
      form.resetFields();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleEdit = async (values: any) => {
    try {
      await updateMutation.mutateAsync({
        id: editingCategory!.id,
        data: values,
      });
      setIsEditModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
    } catch (error) {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      // Error handled by mutation
    }
  };

  const openEditModal = (category: ICategory) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || undefined,
    });
    setIsEditModalOpen(true);
  };

  const flattenCategories = (categories: ICategory[], level = 0): any[] => {
    const result: any[] = [];
    categories.forEach((category) => {
      result.push({ ...category, _level: level });
      if (category.children && category.children.length > 0) {
        result.push(...flattenCategories(category.children, level + 1));
      }
    });
    return result;
  };

  const columns: ColumnsType<ICategory> = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: any) => (
        <span style={{ paddingLeft: `${(record._level || 0) * 20}px` }}>
          {name}
        </span>
      ),
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      render: (description: string) => description || '-',
    },
    {
      title: 'Parent',
      dataIndex: 'parent',
      key: 'parent',
      render: (parent: ICategory | null) => parent?.name || '-',
    },
    {
      title: 'Products',
      dataIndex: 'productCount',
      key: 'productCount',
      render: (count: number) => count || 0,
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
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
            onClick={() => openEditModal(record)}
          >
            Edit
          </Button>
          <Popconfirm
            title="Delete category"
            description={record.productCount > 0 ? 'This category has products and cannot be deleted.' : 'Are you sure you want to delete this category?'}
            onConfirm={() => handleDelete(record.id)}
            disabled={record.productCount > 0}
            okText="Yes"
            cancelText="No"
          >
            <Button
              type="text"
              size="small"
              danger
              icon={<Trash2 className="h-4 w-4" />}
              disabled={record.productCount > 0}
            >
              Delete
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const categories = data || [];
  const total = categories.length;
  const flatCategories = flattenCategories(categories);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Categories</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{total} total categories</p>
        </div>
        <Button
          type="primary"
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setIsAddModalOpen(true)}
        >
          Add Category
        </Button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <div className="p-4">
          <Input
            placeholder="Search categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            allowClear
            className={inputClass}
          />
        </div>

        <Table
          columns={columns}
          dataSource={flatCategories}
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

      {/* Add Category Modal */}
      <Modal
        title="Add Category"
        open={isAddModalOpen}
        onCancel={() => {
          setIsAddModalOpen(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Category name is required' }]}
          >
            <Input className={inputClass} placeholder="Electronics" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              className={inputClass}
              placeholder="Optional description"
              rows={3}
            />
          </Form.Item>

          <Form.Item name="parentId" label="Parent Category">
            <Select
              className="w-full"
              placeholder="Select parent category (optional)"
              allowClear
              options={categories.map((cat: any) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={createMutation.isPending}>
              Create Category
            </Button>
          </div>
        </Form>
      </Modal>

      {/* Edit Category Modal */}
      <Modal
        title="Edit Category"
        open={isEditModalOpen}
        onCancel={() => {
          setIsEditModalOpen(false);
          setEditingCategory(null);
          form.resetFields();
        }}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleEdit}>
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Category name is required' }]}
          >
            <Input className={inputClass} placeholder="Electronics" />
          </Form.Item>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              className={inputClass}
              placeholder="Optional description"
              rows={3}
            />
          </Form.Item>

          <Form.Item name="parentId" label="Parent Category">
            <Select
              className="w-full"
              placeholder="Select parent category (optional)"
              allowClear
              options={categories
                .filter((cat: any) => cat.id !== editingCategory?.id)
                .map((cat: any) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
            />
          </Form.Item>

          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
              Update Category
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
