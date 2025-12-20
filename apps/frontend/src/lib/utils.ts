import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
    return text
        .toString()
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[\s\W-]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

export function formatCurrency(
    amount: number,
    currency: "USD" | "KHR" = "USD"
): string {
    return new Intl.NumberFormat(currency === "KHR" ? "km-KH" : "en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: currency === "KHR" ? 0 : 2,
    }).format(amount);
}
