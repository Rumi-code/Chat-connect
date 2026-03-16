import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFileUrl(objectPath?: string | null) {
  if (!objectPath) return "";
  return `/api/storage${objectPath.startsWith('/') ? '' : '/'}${objectPath}`;
}
