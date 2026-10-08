import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function buildWhatsAppUrl(
  source: string,
  cta: string,
  service = "",
  time = "",
  area = ""
): string {
  const phone = "919876543210"; // Replace with actual YouClean WhatsApp number
  const parts = [
    `Hi, I'd like to book a pickup via the YouClean website.`,
    service && `Service: ${service}`,
    time && `Preferred time: ${time}`,
    area && `Area: ${area}`,
    `[Source: ${source} — ${cta}]`,
  ].filter(Boolean);
  const message = encodeURIComponent(parts.join("\n"));
  return `https://wa.me/${phone}?text=${message}`;
}
