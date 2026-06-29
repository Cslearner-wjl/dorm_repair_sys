export type UserRole = "STUDENT" | "ADMIN" | "REPAIR";

export type RepairStatus =
  | "PENDING"
  | "APPROVED"
  | "ASSIGNED"
  | "PROCESSING"
  | "WAIT_CONFIRM"
  | "COMPLETED"
  | "REJECTED"
  | "CANCELLED"
  | "NEED_REASSIGN";

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  page: number;
  pageSize: number;
  total: number;
  items: T[];
}

export interface UserVO {
  id: number;
  username: string;
  realName: string;
  phone: string;
  role: UserRole;
  status: number;
}

export interface LoginVO {
  token: string;
  user: UserVO;
}

export interface RepairOrderVO {
  id: number;
  orderNo: string;
  title: string;
  dormBuilding: string;
  roomNo: string;
  category: string;
  status: RepairStatus;
  studentName?: string;
  repairerName?: string;
  createdAt: string;
}

export interface RepairRecordVO {
  id: number;
  operatorName: string;
  action: string;
  content: string;
  createdAt: string;
}

export interface RepairFeedbackVO {
  score: number;
  comment?: string;
  createdAt: string;
}

export interface RepairDetailVO extends RepairOrderVO {
  description: string;
  imageUrls?: string;
  contactPhone: string;
  rejectReason?: string;
  records?: RepairRecordVO[];
  feedback?: RepairFeedbackVO;
}

export interface RepairFormDTO {
  dormBuilding: string;
  roomNo: string;
  category: string;
  title: string;
  description: string;
  imageUrls?: string;
  contactPhone: string;
}

export interface RepairQueryDTO {
  page?: number;
  pageSize?: number;
  status?: RepairStatus | "";
  category?: string;
  keyword?: string;
}

export interface StatisticItemVO {
  name: string;
  count: number;
}

export interface RepairerStatisticVO {
  repairerId: number;
  repairerName: string;
  activeCount: number;
  completedCount: number;
  averageScore?: number;
}

export interface DailyStatisticVO {
  date: string;
  createdCount: number;
  completedCount: number;
}

export interface StatisticsOverviewVO {
  totalOrders: number;
  pendingOrders: number;
  processingOrders: number;
  completedOrders: number;
  averageScore?: number;
  statusStats?: StatisticItemVO[];
  categoryStats?: StatisticItemVO[];
  repairerStats?: RepairerStatisticVO[];
}

export interface UploadVO {
  fileName: string;
  url: string;
  size: number;
}

export interface ToastMessage {
  type: "success" | "error";
  message: string;
}
