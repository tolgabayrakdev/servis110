export const formatDate = (value?: string | null) => {
  if (!value) return "—";
  return new Intl.DateTimeFormat("tr-TR", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value.slice(0, 10)}T12:00:00`));
};

export const formatMileage = (value?: number | null) => value == null ? "—" : `${new Intl.NumberFormat("tr-TR").format(value)} km`;

export const getInitials = (name: string) => name.split(" ").slice(0, 2).map((part) => part[0]).join("").toLocaleUpperCase("tr-TR");
