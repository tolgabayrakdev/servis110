export const normalizePlate = (plate: string): string =>
  plate.toLocaleUpperCase("tr-TR").replace(/[^A-ZÇĞİÖŞÜ0-9]/g, "");
