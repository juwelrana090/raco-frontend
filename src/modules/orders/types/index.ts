export interface IOrder {
  id: string;
  userId: string;
  totalAmount: number;
  status: "PENDING" | "PAID" | "CANCELED";
  items?: IOrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface IOrderItem {
  id: string;
  orderId: string;
  productId: string;
  quantity: number;
  price: number;
  subtotal: number;
  createdAt: string;
}

export interface IOrderListResponse {
  items: IOrder[];
  total: number;
  page: number;
  limit: number;
}

export interface IOrderFilters {
  status?: string;
  page?: number;
  limit?: number;
}
