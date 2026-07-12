'use client';
import { useState, useRef } from 'react';
import { Table, Button, Input, Modal, Form, Select, Popconfirm } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Plus, Pencil, Trash2, Upload as UploadIcon } from 'lucide-react';
import { useCategories, useCreateCategory, useUpdateCategory, useDeleteCategory } from '../hooks/useCategories';
import { categoriesApi } from '../api';
import type { ICategory } from '@/lib/api/categories';
import { toast } from 'react-toastify';
import Image from 'next/image';

interface CategoryFormValues {
  name: string;
  description?: string;
  parentId?: string;
}

const inputClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

export default function CategoriesPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ICategory | null>(null);
  const [form] = Form.useForm();

  // Image upload state
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [deletingImage, setDeletingImage] = useState(false);

  const { data, isLoading } = useCategories({ page, limit: 10, search });
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();

  const handleCreate = async (values: CategoryFormValues) => {
    try {
      const category = await createMutation.mutateAsync(values);
      const categoryId = category?.id;

      // Upload image if selected
      if (selectedFile && categoryId) {
        setUploadingImage(true);
        try {
          await categoriesApi.uploadImage(categoryId, selectedFile);
        } catch (err) {
          const error = err as Error;
          toast.error(`Category created but image upload failed: ${error.message}`);
        } finally {
          setUploadingImage(false);
        }
      }

      setIsAddModalOpen(false);
      form.resetFields();
      handleCancelNewFile();
    } catch {
      // Error handled by mutation
    }
  };

  const handleEdit = async (values: CategoryFormValues) => {
    try {
      await updateMutation.mutateAsync({
        id: editingCategory!.id,
        data: values,
      });
      setIsEditModalOpen(false);
      setEditingCategory(null);
      form.resetFields();
      handleCancelNewFile();
    } catch {
      // Error handled by mutation
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
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
    // Set image preview if exists
    if (category.imageUrl) {
      setPreview(category.imageUrl);
    }
    setIsEditModalOpen(true);
  };

  // Image handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (
      ![
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif',
      ].includes(file.type)
    ) {
      toast.error('Only JPG, PNG, WEBP, GIF allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be under 5MB');
      return;
    }
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleCancelNewFile = () => {
    setSelectedFile(null);
    setPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleUploadImage = async () => {
    if (!selectedFile || !editingCategory?.id) return;
    setUploadingImage(true);
    try {
      await categoriesApi.uploadImage(editingCategory.id, selectedFile);
      toast.success('Image uploaded successfully');
      handleCancelNewFile();
      // Update editing category image
      setEditingCategory({
        ...editingCategory,
        imageUrl: preview!,
      });
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!editingCategory?.id) return;
    if (!confirm('Delete the current category image?')) return;
    setDeletingImage(true);
    try {
      await categoriesApi.deleteImage(editingCategory.id);
      toast.success('Image deleted');
      setPreview(null);
      setEditingCategory({
        ...editingCategory,
        imageUrl: null,
      });
    } catch (err) {
      const error = err as Error;
      toast.error(error.message || 'Failed to delete image');
    } finally {
      setDeletingImage(false);
    }
  };

  const flattenCategories = (categories: ICategory[], level = 0): (ICategory & { _level: number })[] => {
    const result: (ICategory & { _level: number })[] = [];
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
      render: (name: string, record: ICategory & { _level?: number }) => (
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

  const renderImageSection = (isEdit = false) => (
    <div className="space-y-3">
      <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Category Image
        <span className="ml-2 text-xs font-normal text-gray-400">
          Optional · JPG, PNG, WEBP, GIF · max 5MB
        </span>
      </div>

      {preview ? (
        <div className="flex items-start gap-4">
          <Image
            src={preview}
            alt="Preview"
            width={96}
            height={96}
            className="h-24 w-24 rounded-lg object-cover border border-gray-200 dark:border-gray-700"
          />
          <div className="flex flex-col gap-2">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {selectedFile?.name || 'Current image'}
            </p>
            <p className="text-xs text-gray-400">
              {selectedFile
                ? (selectedFile.size / 1024).toFixed(1) + ' KB'
                : ''}
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCancelNewFile}
                className="text-xs text-error-500 hover:text-error-600"
              >
                Remove
              </button>
              {isEdit && (
                <>
                  <button
                    type="button"
                    onClick={handleUploadImage}
                    disabled={uploadingImage}
                    className="text-xs text-brand-500 hover:text-brand-600 disabled:opacity-50"
                  >
                    {uploadingImage ? 'Uploading...' : 'Upload Now'}
                  </button>
                  <button
                    type="button"
                    onClick={handleDeleteImage}
                    disabled={deletingImage}
                    className="text-xs text-error-500 hover:text-error-600 disabled:opacity-50"
                  >
                    {deletingImage ? 'Deleting...' : 'Delete Current'}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp,image/gif"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-700 p-6 text-center hover:border-brand-400 hover:bg-brand-50 dark:hover:border-brand-600 dark:hover:bg-brand-500/5 transition-colors"
          >
            <UploadIcon className="h-6 w-6 text-gray-400" />
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Click to upload image
              </p>
              <p className="mt-1 text-xs text-gray-400">
                PNG, JPG, WEBP, GIF up to 5MB
              </p>
            </div>
          </button>
        </div>
      )}
    </div>
  );

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
          handleCancelNewFile();
        }}
        footer={null}
        width={600}
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
              options={categories.map((cat: ICategory) => ({
                label: cat.name,
                value: cat.id,
              }))}
            />
          </Form.Item>

          {/* Image Upload Section */}
          <div className="mb-4">{renderImageSection(false)}</div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsAddModalOpen(false);
                handleCancelNewFile();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={createMutation.isPending || uploadingImage}
            >
              {uploadingImage ? 'Uploading Image...' : 'Create Category'}
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
          handleCancelNewFile();
        }}
        footer={null}
        width={600}
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
                .filter((cat: ICategory) => cat.id !== editingCategory?.id)
                .map((cat: ICategory) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
            />
          </Form.Item>

          {/* Image Upload Section */}
          <div className="mb-4">{renderImageSection(true)}</div>

          <div className="flex justify-end gap-2">
            <Button
              onClick={() => {
                setIsEditModalOpen(false);
                handleCancelNewFile();
              }}
            >
              Cancel
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              loading={updateMutation.isPending}
            >
              Update Category
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}