import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getSchemaName = (ref: string | undefined) => {
  if (!ref) return "";
  return ref.split("/").pop() || "";
};

export const getMethodBadgeColor = (method: string) => {
  switch (method.toUpperCase()) {
    case "GET":
      return "bg-sky-600 hover:bg-sky-700";
    case "POST":
      return "bg-green-600 hover:bg-green-700";
    case "PUT":
      return "bg-yellow-600 hover:bg-yellow-700";
    case "DELETE":
      return "bg-red-600 hover:bg-red-700";
    case "PATCH":
      return "bg-orange-600 hover:bg-orange-700";
    default:
      return "bg-gray-600 hover:bg-gray-700";
  }
};