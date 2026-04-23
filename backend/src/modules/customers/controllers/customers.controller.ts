import { ok } from '../../../shared/utils/response';
import { CustomersService } from '../services/customers.service';
import { validateCreateCustomerInput, validateUpdateCustomerInput } from '../validators/customers.validator';

export class CustomersController {
  constructor(private readonly service = new CustomersService()) {}

  list(tenantId: string, query?: string) {
    return ok(this.service.list(tenantId, query));
  }

  getById(id: string) {
    return ok(this.service.getById(id));
  }

  create(payload: unknown) {
    return ok(this.service.create(validateCreateCustomerInput(payload)));
  }

  update(id: string, payload: unknown) {
    return ok(this.service.update(id, validateUpdateCustomerInput(payload)));
  }

  archive(id: string) {
    return ok(this.service.archive(id));
  }
}
