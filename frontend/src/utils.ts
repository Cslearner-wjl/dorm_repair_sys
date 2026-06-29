import { REPAIR_STATUS_LABELS } from "./constants";
import type { PageResult, RepairOrderVO, RepairStatus, StatisticItemVO, UserRole } from "./types";

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
  if (role === "ADMIN") return "/admin";
  if (role === "REPAIR") return "/repairer/tasks";
  return "/";
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

export function emptyPage<T>(): PageResult<T> {
  return { page: 1, pageSize: 10, total: 0, items: [] };
}

export function chartColor(index: number) {
  return ["#09568c", "#4f8fd3", "#6fc5d3", "#16a66a", "#f59e0b", "#94a3b8"][index % 6];
}

export function buildDonut(data: StatisticItemVO[], total: number) {
  if (!data.length || total <= 0) return "conic-gradient(#dfe3e8 0 100%)";
  let start = 0;
  const stops = data.map((item, index) => {
    const end = start + (item.count / total) * 100;
    const stop = `${chartColor(index)} ${start}% ${end}%`;
    start = end;
    return stop;
  });
  return `conic-gradient(${stops.join(", ")})`;
}
