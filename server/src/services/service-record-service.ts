import { errors } from "../errors/app-error.js";
import { serviceRecordRepository } from "../repositories/service-record-repository.js";
import { vehicleRepository } from "../repositories/vehicle-repository.js";
import type { ServiceRecordInput } from "../types/entities.js";

export const serviceRecordService = {
  async list(vehicleId: string, workshopId: string) {
    if (!(await vehicleRepository.findById(vehicleId, workshopId))) throw errors.notFound("Araç");
    return serviceRecordRepository.listByVehicle(vehicleId, workshopId);
  },

  async get(id: string, workshopId: string) {
    const record = await serviceRecordRepository.findById(id, workshopId);
    if (!record) throw errors.notFound("Servis kaydı");
    return record;
  },

  async create(vehicleId: string, workshopId: string, input: ServiceRecordInput) {
    if (!(await vehicleRepository.findById(vehicleId, workshopId))) throw errors.notFound("Araç");
    return serviceRecordRepository.create(vehicleId, workshopId, input);
  },

  async update(id: string, workshopId: string, input: Partial<ServiceRecordInput>) {
    const current = await this.get(id, workshopId);
    const mileage = input.mileage ?? current.mileage;
    const nextMileage = input.nextServiceMileage === undefined ? current.nextServiceMileage : input.nextServiceMileage;
    if (nextMileage && nextMileage <= mileage) throw errors.badRequest("Sonraki bakım kilometresi servis kilometresinden büyük olmalıdır");
    const serviceDate = input.serviceDate ?? current.serviceDate;
    const nextDate = input.nextServiceDate === undefined ? current.nextServiceDate : input.nextServiceDate;
    if (nextDate && nextDate <= serviceDate) throw errors.badRequest("Sonraki bakım tarihi servis tarihinden sonra olmalıdır");
    const record = await serviceRecordRepository.update(id, workshopId, input);
    if (!record) throw errors.notFound("Servis kaydı");
    return record;
  },

  async remove(id: string, workshopId: string) {
    await this.get(id, workshopId);
    await serviceRecordRepository.remove(id, workshopId);
  },
};
