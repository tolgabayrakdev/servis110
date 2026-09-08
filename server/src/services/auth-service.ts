import bcrypt from "bcryptjs";
import { errors } from "../errors/app-error.js";
import { userRepository } from "../repositories/user-repository.js";
import { tokenService } from "./token-service.js";

const publicUser = (user: {
  id: string;
  workshopId: string;
  name: string;
  email: string;
  role: "owner" | "staff";
  workshopName?: string;
}) => ({
  id: user.id,
  workshopId: user.workshopId,
  name: user.name,
  email: user.email,
  role: user.role,
  workshopName: user.workshopName,
});

export const authService = {
  async register(input: {
    workshopName: string;
    name: string;
    email: string;
    password: string;
  }) {
    if (await userRepository.findByEmail(input.email))
      throw errors.conflict("Bu e-posta adresi zaten kullanılıyor");
    const result = await userRepository.createOwner({
      ...input,
      passwordHash: await bcrypt.hash(input.password, 12),
    });
    const user = publicUser(result.user);
    return { user, workshop: result.workshop, token: tokenService.sign(user) };
  },

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email);
    if (
      !user ||
      !user.isActive ||
      !(await bcrypt.compare(input.password, user.passwordHash))
    ) {
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

  async updateAccount(
    userId: string,
    workshopId: string,
    input: { name: string; email: string; workshopName: string },
  ) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing && existing.id !== userId)
      throw errors.conflict("Bu e-posta adresi zaten kullanılıyor");
    const user = await userRepository.updateAccount(userId, workshopId, input);
    if (!user) throw errors.notFound("Kullanıcı");
    return publicUser(user);
  },

  async changePassword(
    userId: string,
    workshopId: string,
    input: { currentPassword: string; newPassword: string },
  ) {
    const user = await userRepository.findWithPasswordById(userId, workshopId);
    if (
      !user ||
      !(await bcrypt.compare(input.currentPassword, user.passwordHash))
    ) {
      throw errors.badRequest("Mevcut parola hatalı");
    }
    await userRepository.updatePassword(
      userId,
      workshopId,
      await bcrypt.hash(input.newPassword, 12),
    );
  },

  async deleteAccount(userId: string, workshopId: string, password: string) {
    const user = await userRepository.findWithPasswordById(userId, workshopId);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw errors.badRequest("Parola hatalı");
    }
    await userRepository.deleteAccount(userId, workshopId, user.role);
  },
};
