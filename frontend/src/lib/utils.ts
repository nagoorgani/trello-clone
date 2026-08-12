import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "";
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function isOverdue(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  return new Date(date).getTime() < Date.now();
}

export function isDueSoon(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const target = new Date(date).getTime();
  const now = Date.now();
  const diff = target - now;
  return diff > 0 && diff <= 86400000 * 2; // within 48 hours
}
