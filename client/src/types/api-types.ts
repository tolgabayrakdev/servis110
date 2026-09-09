export type User = {
  id: string;
  workshopId: string;
  name: string;
  email: string;
  role: "owner" | "staff";
  workshopName?: string;
};

export type Customer = {
  id: string;
  name: string;
  phone?: string | null;
  email?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt: string;
};

export type Vehicle = {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone?: string | null;
  plate: string;
  brand: string;
  model: string;
  year?: number | null;
  currentMileage: number;
  publicToken: string;
  serviceCardUrl: string;
  createdAt: string;
};

export type ServiceRecord = {
  id: string;
  vehicleId: string;
  serviceDate: string;
  mileage: number;
  serviceType: string;
  operations: string[];
  replacedParts: string[];
  description?: string | null;
  createdAt: string;
};

export type MaintenanceReminder = {
  id: string;
  vehicleId: string;
  title: string;
  dueDate?: string | null;
  dueMileage?: number | null;
  notes?: string | null;
  status: "active" | "completed" | "cancelled";
  completedAt?: string | null;
  createdAt: string;
};

export type MaintenanceItem = {
  reminderId: string;
  title: string;
  vehicleId: string;
  plate: string;
  brand: string;
  model: string;
  customerName: string;
  currentMileage: number;
  nextServiceDate?: string | null;
  nextServiceMileage?: number | null;
  status: "upcoming" | "overdue";
};

export type RecentService = {
  id: string;
  serviceDate: string;
  serviceType: string;
  mileage: number;
  vehicleId: string;
  plate: string;
  brand: string;
  model: string;
  customerName: string;
};

export type Dashboard = {
  stats: {
    totalVehicles: number;
    totalCustomers: number;
    upcomingMaintenance: number;
    overdueMaintenance: number;
  };
  recentServices: RecentService[];
  upcomingMaintenance: MaintenanceItem[];
  overdueMaintenance: MaintenanceItem[];
};

export type Paginated<T> = {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
};
