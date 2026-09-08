import type { UserRole } from "./index.js";

export type User = {
  id: string;
  workshopId: string;
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  isActive: boolean;
  workshopName?: string;
};

export type CustomerInput = {
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
};

export type VehicleInput = {
  customerId: string;
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  currentMileage: number;
};

export type ServiceRecordInput = {
  serviceDate: string;
  mileage: number;
  serviceType: string;
  operations: string[];
  replacedParts: string[];
  description?: string | null;
  nextServiceDate?: string | null;
  nextServiceMileage?: number | null;
};
