import { createAuditTimestamps, nextEntityId } from '../../../shared/store/in-memory-db';
import type { CreateCustomerDto, UpdateCustomerDto } from '../dto/customers.dto';
import type { CustomerEntity } from '../entities/customer.entity';
import { CustomersRepository } from '../repositories/customers.repository';

export class CustomersService {
  constructor(private readonly repository = new CustomersRepository()) {}

  list(tenantId: string, query?: string) {
    return this.repository.search(tenantId, query);
  }

  getById(id: string) {
    const customer = this.repository.findById(id);
    if (!customer) {
      throw new Error('Customer not found.');
    }

    return customer;
  }

  create(input: CreateCustomerDto): CustomerEntity {
    const duplicate = this.repository.findDuplicate(input.tenantId, input.mobileNumber, input.email);
    if (duplicate) {
      throw new Error('A customer with the same phone number or email already exists.');
    }

    return this.repository.create({
      id: nextEntityId('cust'),
      ...createAuditTimestamps(),
      fullName: input.fullName,
      mobileNumber: input.mobileNumber,
      alternateNumber: input.alternateNumber,
      email: input.email,
      address: input.address,
      companyName: input.companyName,
      taxNumber: input.taxNumber,
      preferredCommunicationChannel: input.preferredCommunicationChannel,
      marketingConsent: input.marketingConsent ?? false,
      tenantId: input.tenantId,
      isArchived: false,
    });
  }

  update(id: string, input: UpdateCustomerDto): CustomerEntity {
    const existing = this.getById(id);
    const tenantId = input.tenantId ?? existing.tenantId;
    const mobileNumber = input.mobileNumber ?? existing.mobileNumber;
    const email = input.email ?? existing.email;
    if (!tenantId) {
      throw new Error('Customer tenant is required.');
    }

    const duplicate = this.repository.findDuplicate(tenantId, mobileNumber, email, id);
    if (duplicate) {
      throw new Error('A customer with the same phone number or email already exists.');
    }

    return this.repository.update(id, input);
  }

  archive(id: string) {
    return this.repository.archive(id);
  }
}
