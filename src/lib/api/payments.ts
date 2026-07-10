import { apiClient } from './apiClient';

export interface IPayment {
  id: string;
  orderId: string;
  userId: string;
  amount: number; // in poisha
  provider: 'STRIPE' | 'BKASH';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  updatedAt: string;
}

export const paymentsApi = {
  // GET /payments/:id
  getById: (id: string) => apiClient.get<IPayment>(`/payments/${id}`),

  // GET /payments/order/:orderId — get all payments for an order
  getByOrderId: (orderId: string) =>
    apiClient.get<IPayment[]>(`/payments/order/${orderId}`),

  // POST /payments — create payment (called by checkout flow)
  create: (orderId: string, provider: 'STRIPE' | 'BKASH') =>
    apiClient.post<any>('/payments', { orderId, provider }),

  // NOTE: There is no GET /payments list endpoint in the backend.
  // Admin payments list will show empty until backend adds:
  // GET /api/v1/payments?page=&limit=&status=&provider= (admin only)
  // Workaround: show payments per-order on the order detail page.
};
