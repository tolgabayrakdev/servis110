import { dashboardRepository } from "../repositories/dashboard-repository.js";

export const dashboardService = {
  get(workshopId: string) {
    return dashboardRepository.get(workshopId);
  },
};
