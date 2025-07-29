import { Buffer } from "buffer/";
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getSchemaName = (ref: string | undefined) => {
  if (!ref) return "";
  return ref.split("/").pop() || "";
};

function base64urlToBase64(str: string): string {
  // Replace '-' back to '+' and '_' back to '/'
  let base64 = str.replaceAll("-", "+").replaceAll(`_`, "/");

  // Add padding ('=') if needed
  const padding = base64.length % 4;

  if (padding > 0) {
    base64 += "=".repeat(4 - padding);
  }

  return base64;
}

function base64urlFromBase64(str: string): string {
  return str.replaceAll("+", "-").replaceAll("/", `_`).replace(/=+$/, "");
}

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

export const encodeToBase64Url = (str: string) => {
  const s = Buffer.from(str).toString("base64url");
  return base64urlFromBase64(s);
};
export const decodeFromBase64Url = (str: string) => {
  return Buffer.from(base64urlToBase64(str), "base64url").toString("utf-8");
};

export const httpMethodComparator = (
  [aKey, _a]: [string, any],
  [bKey, _b]: [string, any],
) => {
  // 基準となる順序を配列で定義
  const order = ["get", "post", "delete", "put", "patch"];

  // 大文字・小文字を区別しないように小文字に変換
  const lowerA = aKey.toLowerCase();
  const lowerB = bKey.toLowerCase();

  // 配列内でのインデックスの差を返す
  return order.indexOf(lowerA) - order.indexOf(lowerB);
};
