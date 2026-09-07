const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

type ApiErrorBody = { error?: { message?: string; details?: unknown } };

export class ApiError extends Error {
  status: number;
  details?: unknown;

  constructor(status: number, message: string, details?: unknown) {
    super(message);
    this.status = status;
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
    const body = await response.json() as T & ApiErrorBody;
    if (!response.ok) throw new ApiError(response.status, body.error?.message ?? "İşlem tamamlanamadı", body.error?.details);
    return body;
  },

  get<T>(path: string) {
    return this.request<T>(path);
  },

  post<T>(path: string, data?: unknown) {
    return this.request<T>(path, { method: "POST", body: data === undefined ? undefined : JSON.stringify(data) });
  },

  patch<T>(path: string, data: unknown) {
    return this.request<T>(path, { method: "PATCH", body: JSON.stringify(data) });
  },

  delete(path: string) {
    return this.request<void>(path, { method: "DELETE" });
  },
};
