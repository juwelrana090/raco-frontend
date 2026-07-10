import { useQuery } from '@tanstack/react-query';
import { paymentsApi } from '../api';
import type { IPaymentFilters } from '../types';

export function useFetchPayments(filters?: IPaymentFilters) {
  return useQuery({
    queryKey: ['payments', filters],
    queryFn: () => paymentsApi.getAll(filters),
  });
}
