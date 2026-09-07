import bcrypt from "bcryptjs";
import { errors } from "../errors/app-error.js";
import { userRepository } from "../repositories/user-repository.js";
import { tokenService } from "./token-service.js";

const publicUser = (user: { id: string; workshopId: string; name: string; email: string; role: "owner" | "staff" }) => ({
  id: user.id,
  workshopId: user.workshopId,
  name: user.name,
  email: user.email,
  role: user.role,
});

export const authService = {
  async register(input: { workshopName: string; name: string; email: string; password: string }) {
    if (await userRepository.findByEmail(input.email)) throw errors.conflict("Bu e-posta adresi zaten kullanılıyor");
    const result = await userRepository.createOwner({ ...input, passwordHash: await bcrypt.hash(input.password, 12) });
    const user = publicUser(result.user);
    return { user, workshop: result.workshop, token: tokenService.sign(user) };
  },

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw errors.unauthorized("E-posta veya parola hatalı");
    }
    const safeUser = publicUser(user);
    return { user: safeUser, token: tokenService.sign(safeUser) };
  },

  async me(userId: string, workshopId: string) {
    const user = await userRepository.findById(userId, workshopId);
    if (!user) throw errors.notFound("Kullanıcı");
    return user;
  },
};
