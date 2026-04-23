import { db } from '../../../shared/store/in-memory-db';
import type { VehicleEntity } from '../entities/vehicle.entity';

export class VehiclesRepository {
  listByTenant(tenantId: string): VehicleEntity[] {
    return db.vehicles.filter((vehicle) => vehicle.tenantId === tenantId && !vehicle.isArchived);
  }

  search(tenantId: string, query?: string): VehicleEntity[] {
    const normalizedQuery = query?.trim().toLowerCase();
    const vehicles = this.listByTenant(tenantId);

    if (!normalizedQuery) {
      return vehicles;
    }

    return vehicles.filter((vehicle) =>
      [
        vehicle.registrationNumber,
        vehicle.vin,
        vehicle.make,
        vehicle.model,
        vehicle.variant,
        vehicle.fuelType,
        vehicle.transmission,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }

  findById(id: string): VehicleEntity | undefined {
    return db.vehicles.find((vehicle) => vehicle.id === id && !vehicle.isArchived);
  }

  findDuplicate(tenantId: string, registrationNumber: string, vin?: string, excludeId?: string): VehicleEntity | undefined {
    const normalizedRegistration = registrationNumber.trim().toUpperCase();
    const normalizedVin = vin?.trim().toUpperCase();

    return this.listByTenant(tenantId).find((vehicle) => {
      if (excludeId && vehicle.id === excludeId) return false;
      const regMatch = vehicle.registrationNumber.trim().toUpperCase() === normalizedRegistration;
      const vinMatch = normalizedVin && vehicle.vin?.trim().toUpperCase() === normalizedVin;
      return regMatch || Boolean(vinMatch);
    });
  }

  create(vehicle: VehicleEntity): VehicleEntity {
    db.vehicles.push(vehicle);
    return vehicle;
  }

  update(id: string, updates: Partial<VehicleEntity>): VehicleEntity {
    const vehicle = this.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found.');
    }

    Object.assign(vehicle, updates, { updatedAt: new Date() });
    return vehicle;
  }

  archive(id: string): VehicleEntity {
    const vehicle = this.findById(id);
    if (!vehicle) {
      throw new Error('Vehicle not found.');
    }

    vehicle.isArchived = true;
    vehicle.archivedAt = new Date();
    vehicle.updatedAt = new Date();
    return vehicle;
  }
}
