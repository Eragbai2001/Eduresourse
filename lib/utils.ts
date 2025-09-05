import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
// This file previously contained utility functions for shadcn components
// Now that shadcn has been uninstalled, you can add your own utility functions here
