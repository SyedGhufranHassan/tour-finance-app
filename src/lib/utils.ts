import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRs(value: number) {
  return `Rs. ${new Intl.NumberFormat("en-PK", { maximumFractionDigits: 0 }).format(value)}`;
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}

export function isOnlineMethod(method: string) {
  return method !== "Cash";
}

export function uid(prefix: string) {
  return `${prefix}_${crypto.randomUUID()}`;
}
