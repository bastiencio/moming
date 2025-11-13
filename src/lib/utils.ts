import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return `¥${rounded.toLocaleString('en-US').replace(/,/g, "''")}`
}
