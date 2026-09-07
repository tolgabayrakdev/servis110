import { errors } from "../errors/app-error.js";
import { publicCardRepository } from "../repositories/public-card-repository.js";

export const publicCardService = {
  async get(token: string) {
    const vehicle = await publicCardRepository.findVehicle(token);
    if (!vehicle) throw errors.notFound("Dijital servis karnesi");
    const history = await publicCardRepository.history(vehicle.id);
    return { vehicle, serviceHistory: history };
  },
};
