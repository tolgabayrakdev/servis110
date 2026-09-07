import { errors } from "../errors/app-error.js";
import { customerRepository } from "../repositories/customer-repository.js";
import type { CustomerInput } from "../types/entities.js";
import type { Pagination } from "../types/index.js";

export const customerService = {
  async list(workshopId: string, pagination: Pagination, search?: string) {
    const result = await customerRepository.list(workshopId, pagination, search);
    return {
      data: result.items,
      meta: { page: pagination.page, limit: pagination.limit, total: result.total, totalPages: Math.ceil(result.total / pagination.limit) },
    };
  },

  async get(id: string, workshopId: string) {
    const customer = await customerRepository.findById(id, workshopId);
    if (!customer) throw errors.notFound("Müşteri");
    return customer;
  },

  create(workshopId: string, input: CustomerInput) {
    return customerRepository.create(workshopId, input);
  },

  async update(id: string, workshopId: string, input: Partial<CustomerInput>) {
    const customer = await customerRepository.update(id, workshopId, input);
    if (!customer) throw errors.notFound("Müşteri");
    return customer;
  },

  async remove(id: string, workshopId: string) {
    await this.get(id, workshopId);
    if (await customerRepository.vehicleCount(id, workshopId)) {
      throw errors.conflict("Araçları bulunan müşteri silinemez; önce araçları silin veya başka müşteriye aktarın");
    }
    await customerRepository.remove(id, workshopId);
  },
};
