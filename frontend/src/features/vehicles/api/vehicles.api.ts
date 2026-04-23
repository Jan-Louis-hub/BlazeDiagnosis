import { apiClient } from '../../../lib/api-client';
import { endpoints } from '../../../services/endpoints';
import type { VehicleCreatePayload, VehicleRecord, VehicleUpdatePayload } from '../types/vehicles.types';

export const vehiclesApi = {
  list: (tenantId: string, query?: string) => apiClient<VehicleRecord[]>(`${endpoints.vehicles}?tenantId=${tenantId}${query ? `&q=${encodeURIComponent(query)}` : ''}`),
  getById: (id: string) => apiClient<VehicleRecord>(`${endpoints.vehicles}/${id}`),
  create: (payload: VehicleCreatePayload) => apiClient<VehicleRecord>(endpoints.vehicles, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  update: (id: string, payload: VehicleUpdatePayload) => apiClient<VehicleRecord>(`${endpoints.vehicles}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  }),
  archive: (id: string) => apiClient<VehicleRecord>(`${endpoints.vehicles}/${id}`, {
    method: 'DELETE',
  }),
};
