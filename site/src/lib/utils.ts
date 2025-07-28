import {type ClassValue, clsx} from "clsx"
import {twMerge} from "tailwind-merge"
import {Buffer} from "buffer/";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const getSchemaName = (ref: string | undefined) => {
    if (!ref) return "";
    return ref.split("/").pop() || "";
};

function base64urlToBase64(str: string): string {
    // Replace '-' back to '+' and '_' back to '/'
    let base64 = str
        .replaceAll('-', '+')
        .replaceAll(`_`, '/')

    // Add padding ('=') if needed
    const padding = base64.length % 4

    if (padding > 0) {
        base64 += '='.repeat(4 - padding)
    }

    return base64;
}

function base64urlFromBase64(str: string): string {
    return str
        .replaceAll('+', '-')
        .replaceAll('/', `_`)
        .replace(/=+$/, '')
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
    const s = Buffer.from(str).toString('base64url');
    return base64urlFromBase64(s)
};
export const decodeFromBase64Url = (str: string) => {
    return Buffer.from(base64urlToBase64(str), 'base64url').toString('utf-8')
};