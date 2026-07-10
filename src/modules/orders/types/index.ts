export interface IOrder {
  id: string;
  shortId: string;
  customer: {
    id: string;
    name: string;
    email: string;
  };
  items: Array<{
    id: string;
    product: {
      name: string;
      price: number;
    };
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'paid' | 'canceled';
  paymentProvider: 'stripe' | 'bkash';
  createdAt: string;
  updatedAt: string;
}

export interface IOrderListResponse {
  orders: IOrder[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IOrderFilters {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}
