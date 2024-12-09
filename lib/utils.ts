import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

// Function to merge class names using clsx and twMerge
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs)) // Combine class names and merge Tailwind classes
}