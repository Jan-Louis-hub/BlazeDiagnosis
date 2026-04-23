export interface VehicleRecord {
  id: string;
  tenantId: string;
  customerId: string;
  registrationNumber: string;
  vin?: string;
  make: string;
  model: string;
  variant?: string;
  year?: number;
  engineType?: string;
  fuelType?: string;
  transmission?: string;
  odometer?: number;
  color?: string;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type VehicleCreatePayload = Omit<VehicleRecord, 'id' | 'createdAt' | 'updatedAt' | 'isArchived'>;
export type VehicleUpdatePayload = Partial<VehicleCreatePayload>;
