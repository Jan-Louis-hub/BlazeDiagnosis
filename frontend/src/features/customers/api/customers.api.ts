import { apiClient } from '../../../lib/api-client';
import { endpoints } from '../../../services/endpoints';
import type { CustomerCreatePayload, CustomerRecord, CustomerUpdatePayload } from '../types/customers.types';

export const customersApi = {
  list: (tenantId: string, query?: string) => apiClient<CustomerRecord[]>(`${endpoints.customers}?tenantId=${tenantId}${query ? `&q=${encodeURIComponent(query)}` : ''}`),
  getById: (id: string) => apiClient<CustomerRecord>(`${endpoints.customers}/${id}`),
  create: (payload: CustomerCreatePayload) => apiClient<CustomerRecord>(endpoints.customers, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  update: (id: string, payload: CustomerUpdatePayload) => apiClient<CustomerRecord>(`${endpoints.customers}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  archive: (id: string) => apiClient<CustomerRecord>(`${endpoints.customers}/${id}`, {
    method: 'DELETE',
  }),
};
