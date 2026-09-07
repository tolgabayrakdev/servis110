import type { Pagination } from "../types/index.js";

export const getPagination = (query: Record<string, unknown>): Pagination => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  return { page, limit, offset: (page - 1) * limit };
};

export const getTotal = (value: string | number | undefined): number => Number(value ?? 0);
