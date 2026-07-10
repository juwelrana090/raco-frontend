export interface IPayment {
  id: string;
  orderId: string;
  provider: "STRIPE" | "BKASH";
  providerTxnId?: string | null;
  amount: number;
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
  clientSecret?: string | null;
  bkashURL?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface IPaymentListResponse {
  items: IPayment[];
  total: number;
  page: number;
  limit: number;
}

export interface IPaymentFilters {
  status?: string;
  provider?: string;
  page?: number;
  limit?: number;
}
