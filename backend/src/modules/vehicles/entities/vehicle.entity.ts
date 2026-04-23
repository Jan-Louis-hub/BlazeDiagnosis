import { BaseEntity, ID } from '../../../shared/types/common';

export interface VehicleEntity extends BaseEntity {
  customerId: ID;
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
  archivedAt?: Date;
}
