export interface IPayment {
  id: string;
  transactionId: string;
  order: {
    id: string;
    shortId: string;
  };
  provider: 'stripe' | 'bkash';
  amount: number;
  status: 'pending' | 'success' | 'failed';
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentListResponse {
  payments: IPayment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IPaymentFilters {
  search?: string;
  status?: string;
  provider?: string;
  page?: number;
  limit?: number;
}
