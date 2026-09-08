const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

type ApiErrorBody = { error?: { code?: string; message?: string; details?: unknown } };

const getValidationMessage = (details: unknown): string | undefined => {
  if (!details || typeof details !== "object") return undefined;
  const value = details as { formErrors?: unknown; fieldErrors?: unknown };
  const formErrors = Array.isArray(value.formErrors) ? value.formErrors : [];
  if (typeof formErrors[0] === "string") return formErrors[0];
  if (!value.fieldErrors || typeof value.fieldErrors !== "object")
    return undefined;
  for (const messages of Object.values(value.fieldErrors)) {
    if (Array.isArray(messages) && typeof messages[0] === "string")
      return messages[0];
  }
  return undefined;
};

export class ApiError extends Error {
  status: number;
  code?: string;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export const apiClient = {
  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      credentials: "include",
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });

    if (response.status === 204) return undefined as T;
    const body = (await response.json()) as T & ApiErrorBody;
    if (!response.ok)
      throw new ApiError(
        response.status,
        getValidationMessage(body.error?.details) ??
          body.error?.message ??
          "İşlem tamamlanamadı",
        body.error?.details,
        body.error?.code,
      );
    return body;
  },

  get<T>(path: string) {
    return this.request<T>(path);
  },

  post<T>(path: string, data?: unknown) {
    return this.request<T>(path, {
      method: "POST",
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  },

  patch<T>(path: string, data: unknown) {
    return this.request<T>(path, {
      method: "PATCH",
      body: JSON.stringify(data),
    });
  },

  delete(path: string, data?: unknown) {
    return this.request<void>(path, {
      method: "DELETE",
      body: data === undefined ? undefined : JSON.stringify(data),
    });
  },
};
