'use client';
import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Form, Input, InputNumber, Select, Button, message } from 'antd';
import { ArrowLeft } from 'lucide-react';
import { useProduct, useUpdateProduct } from '@/modules/products/hooks/useProducts';
import { useCategories } from '@/modules/categories/hooks/useCategories';
import type { IProduct } from '@/lib/api/products';

const inputClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 h-11 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

const textareaClass =
  'shadow-theme-xs focus:border-brand-300 focus:ring-brand-500/20 dark:focus:border-brand-800 w-full appearance-none rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:ring-3 focus:outline-hidden dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 dark:placeholder:text-white/30';

export default function AdminEditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();
  const [product, setProduct] = useState<IProduct | null>(null);

  const { data: productData, isLoading } = useProduct(id);
  const updateMutation = useUpdateProduct();
  const { data: categoriesData } = useCategories({ limit: 100 });

  useEffect(() => {
    if (productData) {
      setProduct(productData);
      form.setFieldsValue({
        name: productData.name,
        sku: productData.sku,
        description: productData.description || '',
        price: productData.price,
        stock: productData.stock,
        categoryId: productData.categoryId,
        imageUrl: productData.imageUrl || '',
      });
    }
  }, [productData, form]);

  const handleSubmit = async (values: any) => {
    try {
      await updateMutation.mutateAsync({
        id,
        data: values,
      });
      router.push('/admin/products');
    } catch (error) {
      // Error handled by mutation
    }
  };

  const categories = categoriesData || [];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Button
          type="text"
          icon={<ArrowLeft className="h-4 w-4" />}
          onClick={() => router.back()}
        >
          Back
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white/90">Edit Product</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Update product information</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-gray-900">
        <Form form={form} layout="vertical" onFinish={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item
              name="name"
              label="Product Name"
              rules={[{ required: true, message: 'Product name is required' }]}
            >
              <Input className={inputClass} placeholder="Wireless Headphones" />
            </Form.Item>

            <Form.Item
              name="sku"
              label="SKU"
              rules={[{ required: true, message: 'SKU is required' }]}
            >
              <Input className={inputClass} placeholder="WH-1001" />
            </Form.Item>
          </div>

          <Form.Item name="description" label="Description">
            <Input.TextArea
              className={textareaClass}
              placeholder="Product description..."
              rows={4}
            />
          </Form.Item>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item
              name="price"
              label="Price (in poisha)"
              rules={[{ required: true, message: 'Price is required' }]}
              tooltip="Enter price in poisha (100 poisha = 1 BDT). Example: 185000 for ৳1,850.00"
            >
              <InputNumber
                className="w-full"
                placeholder="185000"
                min={0}
                formatter={(value: number | undefined) => `৳${(value || 0).toLocaleString('en-BD')}`}
                parser={(value: string | undefined) => Number(value?.replace(/[৳,]/g, '') || 0)}
              />
            </Form.Item>

            <Form.Item
              name="stock"
              label="Stock"
              rules={[{ required: true, message: 'Stock is required' }]}
            >
              <InputNumber className="w-full" placeholder="100" min={0} />
            </Form.Item>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Form.Item
              name="categoryId"
              label="Category"
              rules={[{ required: true, message: 'Category is required' }]}
            >
              <Select
                placeholder="Select category"
                options={categories.map((cat: any) => ({
                  label: cat.name,
                  value: cat.id,
                }))}
              />
            </Form.Item>

            <Form.Item
              name="imageUrl"
              label="Image URL"
              tooltip="Optional: Provide a URL to the product image"
            >
              <Input className={inputClass} placeholder="https://example.com/product.jpg" />
            </Form.Item>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button onClick={() => router.back()}>Cancel</Button>
            <Button type="primary" htmlType="submit" loading={updateMutation.isPending}>
              Update Product
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
