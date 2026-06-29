import type { RepairStatus, UserRole } from "./types";

export const ROLE_LABELS: Record<UserRole, string> = {
  STUDENT: "学生",
  ADMIN: "管理员",
  REPAIR: "维修员",
};

export const REPAIR_STATUS_LABELS: Record<RepairStatus, string> = {
  PENDING: "待受理",
  APPROVED: "已受理",
  ASSIGNED: "已派单",
  PROCESSING: "处理中",
  WAIT_CONFIRM: "待确认",
  COMPLETED: "已完成",
  REJECTED: "已驳回",
  CANCELLED: "已撤销",
  NEED_REASSIGN: "需重派",
};

export const REPAIR_STATUS_OPTIONS: RepairStatus[] = [
  "PENDING",
  "APPROVED",
  "ASSIGNED",
  "PROCESSING",
  "WAIT_CONFIRM",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
  "NEED_REASSIGN",
];

export const REPAIR_CATEGORIES = [
  "水电维修",
  "门窗维修",
  "家具维修",
  "网络维修",
  "卫生维修",
  "电器维修",
  "公共设施",
  "其他维修",
];

export const BUILDINGS = ["松园1栋", "松园2栋", "松园3栋", "竹园4栋", "梅园3栋", "兰园5栋"];

export const DEMO_ACCOUNTS = [
  { label: "学生演示", username: "student001", password: "123456", role: "STUDENT" as const },
  { label: "管理员演示", username: "admin001", password: "123456", role: "ADMIN" as const },
  { label: "维修员演示", username: "repair001", password: "123456", role: "REPAIR" as const },
];
