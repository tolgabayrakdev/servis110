import bcrypt from "bcryptjs";
import { createHash, createHmac, randomBytes, randomInt } from "node:crypto";
import { env } from "../config/env.js";
import { errors } from "../errors/app-error.js";
import { emailVerificationRepository } from "../repositories/email-verification-repository.js";
import { passwordResetRepository } from "../repositories/password-reset-repository.js";
import { userRepository } from "../repositories/user-repository.js";
import { mailService } from "./mail-service.js";
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

const verificationCodeHash = (userId: string, code: string) =>
  createHmac("sha256", env.JWT_SECRET)
    .update(`${userId}:${code}`)
    .digest("hex");

const sendVerificationCode = async (user: {
  id: string;
  name: string;
  email: string;
}) => {
  const code = randomInt(100000, 1000000).toString();
  await emailVerificationRepository.replaceForUser(
    user.id,
    verificationCodeHash(user.id, code),
    new Date(Date.now() + 10 * 60 * 1000),
  );
  await mailService.sendVerificationCode({ name: user.name, email: user.email, code });
};

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
    await sendVerificationCode(result.user);
    return { email: result.user.email };
  },

  async login(input: { email: string; password: string }) {
    const user = await userRepository.findByEmail(input.email);
    if (!user || !user.isActive || !(await bcrypt.compare(input.password, user.passwordHash))) {
      throw errors.unauthorized("E-posta veya parola hatalı");
    }
    if (!user.emailVerifiedAt) {
      await sendVerificationCode(user);
      throw errors.emailNotVerified(user.email);
    }
    const safeUser = publicUser(user);
    return { user: safeUser, token: tokenService.sign(safeUser) };
  },

  async resendVerificationCode(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive || user.emailVerifiedAt) return;
    await sendVerificationCode(user);
  },

  async verifyEmail(email: string, code: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive || user.emailVerifiedAt)
      throw errors.badRequest("Doğrulama kodu geçersiz veya süresi dolmuş");
    const verified = await emailVerificationRepository.verify(
      user.id,
      verificationCodeHash(user.id, code),
    );
    if (!verified)
      throw errors.badRequest("Doğrulama kodu geçersiz veya süresi dolmuş");
    const safeUser = publicUser(user);
    return { user: safeUser, token: tokenService.sign(safeUser) };
  },

  async forgotPassword(email: string) {
    const user = await userRepository.findByEmail(email);
    if (!user || !user.isActive) return;

    const token = randomBytes(32).toString("hex");
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await passwordResetRepository.replaceForUser(user.id, tokenHash, expiresAt);
    const resetUrl = `${env.FRONTEND_URL}/reset-password?token=${encodeURIComponent(token)}`;
    await mailService.sendPasswordReset({
      name: user.name,
      email: user.email,
      resetUrl,
    });
  },

  async resetPassword(token: string, newPassword: string) {
    const tokenHash = createHash("sha256").update(token).digest("hex");
    const reset = await passwordResetRepository.resetPassword(
      tokenHash,
      await bcrypt.hash(newPassword, 12),
    );
    if (!reset)
      throw errors.badRequest("Sıfırlama bağlantısı geçersiz veya süresi dolmuş");
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
