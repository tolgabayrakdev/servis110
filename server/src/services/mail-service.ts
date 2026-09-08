import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const transporter = env.SMTP_HOST
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:
        env.SMTP_USER && env.SMTP_PASS
          ? { user: env.SMTP_USER, pass: env.SMTP_PASS }
          : undefined,
    })
  : null;

const escapeHtml = (value: string) =>
  value.replace(/[&<>"]/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
    };
    return entities[character]!;
  });

export const mailService = {
  async sendVerificationCode(input: { name: string; email: string; code: string }) {
    if (!transporter) {
      if (env.NODE_ENV === "production")
        throw new Error("SMTP ayarları yapılandırılmamış");
      console.info(`[DEV] E-posta doğrulama kodu (${input.email}): ${input.code}`);
      return;
    }

    const name = escapeHtml(input.name);
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: input.email,
      subject: "Servis110 e-posta doğrulama kodu",
      text: `Merhaba ${input.name},\n\nE-posta doğrulama kodunuz: ${input.code}\n\nBu kod 10 dakika geçerlidir ve yalnızca bir kez kullanılabilir.`,
      html: `<p>Merhaba ${name},</p><p>E-posta doğrulama kodunuz:</p><p style="font-size:28px;font-weight:700;letter-spacing:8px">${input.code}</p><p>Bu kod 10 dakika geçerlidir ve yalnızca bir kez kullanılabilir.</p>`,
    });
  },

  async sendPasswordReset(input: { name: string; email: string; resetUrl: string }) {
    if (!transporter) {
      if (env.NODE_ENV === "production")
        throw new Error("SMTP ayarları yapılandırılmamış");
      console.info(`[DEV] Parola sıfırlama bağlantısı (${input.email}): ${input.resetUrl}`);
      return;
    }

    const name = escapeHtml(input.name);
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to: input.email,
      subject: "Servis110 parola sıfırlama",
      text: `Merhaba ${input.name},\n\nYeni parolanızı belirlemek için bu bağlantıyı açın:\n${input.resetUrl}\n\nBu bağlantı 15 dakika geçerlidir ve yalnızca bir kez kullanılabilir.`,
      html: `<p>Merhaba ${name},</p><p>Yeni parolanızı belirlemek için aşağıdaki bağlantıyı açın:</p><p><a href="${escapeHtml(input.resetUrl)}">Parolamı sıfırla</a></p><p>Bu bağlantı 15 dakika geçerlidir ve yalnızca bir kez kullanılabilir.</p>`,
    });
  },
};
