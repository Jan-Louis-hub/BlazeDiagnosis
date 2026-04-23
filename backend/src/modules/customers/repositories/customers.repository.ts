import { db } from '../../../shared/store/in-memory-db';
import type { CustomerEntity } from '../entities/customer.entity';

export class CustomersRepository {
  listByTenant(tenantId: string): CustomerEntity[] {
    return db.customers.filter((customer) => customer.tenantId === tenantId && !customer.isArchived);
  }

  search(tenantId: string, query?: string): CustomerEntity[] {
    const normalizedQuery = query?.trim().toLowerCase();
    const records = this.listByTenant(tenantId);

    if (!normalizedQuery) {
      return records;
    }

    return records.filter((customer) =>
      [
        customer.fullName,
        customer.mobileNumber,
        customer.alternateNumber,
        customer.email,
        customer.companyName,
        customer.address,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery))
    );
  }

  findById(id: string): CustomerEntity | undefined {
    return db.customers.find((customer) => customer.id === id && !customer.isArchived);
  }

  findDuplicate(tenantId: string, mobileNumber: string, email?: string, excludeId?: string): CustomerEntity | undefined {
    const normalizedEmail = email?.trim().toLowerCase();
    return this.listByTenant(tenantId).find((customer) => {
      if (excludeId && customer.id === excludeId) return false;
      const mobileMatch = customer.mobileNumber.trim() === mobileNumber.trim();
      const emailMatch = normalizedEmail && customer.email?.trim().toLowerCase() === normalizedEmail;
      return mobileMatch || Boolean(emailMatch);
    });
  }

  create(customer: CustomerEntity): CustomerEntity {
    db.customers.push(customer);
    return customer;
  }

  update(id: string, updates: Partial<CustomerEntity>): CustomerEntity {
    const customer = this.findById(id);
    if (!customer) {
      throw new Error('Customer not found.');
    }

    Object.assign(customer, updates, { updatedAt: new Date() });
    return customer;
  }

  archive(id: string): CustomerEntity {
    const customer = this.findById(id);
    if (!customer) {
      throw new Error('Customer not found.');
    }

    customer.isArchived = true;
    customer.archivedAt = new Date();
    customer.updatedAt = new Date();
    return customer;
  }
}
