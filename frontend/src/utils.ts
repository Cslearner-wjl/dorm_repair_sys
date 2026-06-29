import { REPAIR_STATUS_LABELS } from "./constants";
import type { RepairOrderVO, RepairStatus, UserRole } from "./types";

export function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

export function formatDateTime(value?: string) {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatFullDateTime(value?: string) {
  if (!value) return "-";
  const normalized = value.includes("T") ? value : value.replace(" ", "T");
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function maskPhone(phone?: string) {
  if (!phone || phone.length < 7) return phone || "-";
  return `${phone.slice(0, 3)} **** ${phone.slice(-4)}`;
}

export function statusClass(status: RepairStatus) {
  return `status-${status.toLowerCase().replace("_", "-")}`;
}

export function roleHome(role: UserRole) {
  if (role === "ADMIN") return "admin-home";
  if (role === "REPAIR") return "repairer-tasks";
  return "student-home";
}

export function countByStatus(orders: RepairOrderVO[], status: RepairStatus) {
  return orders.filter((order) => order.status === status).length;
}

export function activeRepairCount(orders: RepairOrderVO[]) {
  return orders.filter((order) => !["COMPLETED", "CANCELLED", "REJECTED"].includes(order.status)).length;
}

export function statusLabel(status: RepairStatus) {
  return REPAIR_STATUS_LABELS[status];
}
