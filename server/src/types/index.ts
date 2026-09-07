export type UserRole = "owner" | "staff";

export type AuthUser = {
  id: string;
  workshopId: string;
  role: UserRole;
  email: string;
};

export type Pagination = {
  page: number;
  limit: number;
  offset: number;
};

export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
