import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

import { applicationStatusStyles } from "@/lib/status-styles";
import { ApplicationStatus } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function downloadCsv(filename: string, rows: Record<string, string | number | undefined>[]) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const escape = (value: string | number | undefined) =>
    `"${String(value ?? "").replaceAll('"', '""')}"`;

  const csv = [headers.join(","), ...rows.map((row) => headers.map((header) => escape(row[header])).join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function getStatusTone(status: ApplicationStatus) {
  return applicationStatusStyles[status];
}

export function getStatusLabel(status: ApplicationStatus) {
  const labels: Record<ApplicationStatus, string> = {
    SAVED: "已收藏",
    APPLIED: "已投递",
    OA: "在线测评",
    INTERVIEW: "面试中",
    OFFER: "已拿 Offer",
    REJECTED: "未通过",
    GHOSTED: "无回应"
  };

  return labels[status];
}

export function getDaysUntil(date: string) {
  const today = new Date();
  const target = new Date(date);
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function createId(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`;
}
