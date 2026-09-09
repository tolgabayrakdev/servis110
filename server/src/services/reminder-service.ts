import { errors } from "../errors/app-error.js";
import { reminderRepository } from "../repositories/reminder-repository.js";
import { vehicleRepository } from "../repositories/vehicle-repository.js";

export const reminderService = {
  async list(vehicleId: string, workshopId: string) {
    if (!(await vehicleRepository.findById(vehicleId, workshopId))) throw errors.notFound("Araç");
    return reminderRepository.list(vehicleId, workshopId);
  },

  async create(
    vehicleId: string,
    workshopId: string,
    input: { title: string; dueDate?: string | null; dueMileage?: number | null; notes?: string | null },
  ) {
    if (!(await vehicleRepository.findById(vehicleId, workshopId))) throw errors.notFound("Araç");
    return reminderRepository.create(vehicleId, workshopId, input);
  },

  async updateStatus(id: string, workshopId: string, status: "active" | "completed" | "cancelled") {
    const reminder = await reminderRepository.updateStatus(id, workshopId, status);
    if (!reminder) throw errors.notFound("Hatırlatıcı");
    return reminder;
  },

  async remove(id: string, workshopId: string) {
    if (!(await reminderRepository.remove(id, workshopId))) throw errors.notFound("Hatırlatıcı");
  },
};
