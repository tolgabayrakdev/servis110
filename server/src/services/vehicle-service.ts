import { env } from "../config/env.js";
import { errors } from "../errors/app-error.js";
import { customerRepository } from "../repositories/customer-repository.js";
import { vehicleRepository } from "../repositories/vehicle-repository.js";
import type { VehicleInput } from "../types/entities.js";
import type { Pagination } from "../types/index.js";
import { normalizePlate } from "../utils/plate.js";

const withCardUrl = <T extends { publicToken?: string }>(vehicle: T) => ({
  ...vehicle,
  serviceCardUrl: vehicle.publicToken ? `${env.FRONTEND_URL}/service-card/${vehicle.publicToken}` : undefined,
});

export const vehicleService = {
  async list(workshopId: string, pagination: Pagination, search?: string) {
    const result = await vehicleRepository.list(workshopId, pagination, search);
    return {
      data: result.items.map(withCardUrl),
      meta: { page: pagination.page, limit: pagination.limit, total: result.total, totalPages: Math.ceil(result.total / pagination.limit) },
    };
  },

  async get(id: string, workshopId: string) {
    const vehicle = await vehicleRepository.findById(id, workshopId);
    if (!vehicle) throw errors.notFound("Araç");
    return withCardUrl(vehicle);
  },

  async findByPlate(plate: string, workshopId: string) {
    const vehicle = await vehicleRepository.findByPlate(normalizePlate(plate), workshopId);
    if (!vehicle) throw errors.notFound("Araç");
    return withCardUrl(vehicle);
  },

  async create(workshopId: string, input: VehicleInput) {
    if (!(await customerRepository.findById(input.customerId, workshopId))) throw errors.notFound("Müşteri");
    const vehicle = await vehicleRepository.create(workshopId, { ...input, plate: normalizePlate(input.plate) });
    return withCardUrl(vehicle!);
  },

  async update(id: string, workshopId: string, input: Partial<VehicleInput>) {
    await this.get(id, workshopId);
    if (input.customerId && !(await customerRepository.findById(input.customerId, workshopId))) throw errors.notFound("Müşteri");
    const vehicle = await vehicleRepository.update(id, workshopId, { ...input, ...(input.plate && { plate: normalizePlate(input.plate) }) });
    return withCardUrl(vehicle!);
  },

  async remove(id: string, workshopId: string) {
    await this.get(id, workshopId);
    if (await vehicleRepository.serviceCount(id, workshopId)) {
      throw errors.conflict("Servis geçmişi bulunan araç silinemez");
    }
    await vehicleRepository.remove(id, workshopId);
  },
};
