import { ok } from '../../../shared/utils/response';
import { VehiclesService } from '../services/vehicles.service';
import { validateCreateVehicleInput, validateUpdateVehicleInput } from '../validators/vehicles.validator';

export class VehiclesController {
  constructor(private readonly service = new VehiclesService()) {}

  list(tenantId: string, query?: string) {
    return ok(this.service.list(tenantId, query));
  }

  getById(id: string) {
    return ok(this.service.getById(id));
  }

  create(payload: unknown) {
    return ok(this.service.create(validateCreateVehicleInput(payload)));
  }

  update(id: string, payload: unknown) {
    return ok(this.service.update(id, validateUpdateVehicleInput(payload)));
  }

  archive(id: string) {
    return ok(this.service.archive(id));
  }
}
