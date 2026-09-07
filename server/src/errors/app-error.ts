export class AppError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly code: string,
    message: string,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errors = {
  badRequest: (message: string, details?: unknown) => new AppError(400, "BAD_REQUEST", message, details),
  unauthorized: (message = "Oturum açmanız gerekiyor") => new AppError(401, "UNAUTHORIZED", message),
  forbidden: (message = "Bu işlem için yetkiniz yok") => new AppError(403, "FORBIDDEN", message),
  notFound: (resource = "Kayıt") => new AppError(404, "NOT_FOUND", `${resource} bulunamadı`),
  conflict: (message: string) => new AppError(409, "CONFLICT", message),
};
