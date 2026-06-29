import axios from "axios";
import type {
  ApiResponse,
  DailyStatisticVO,
  LoginVO,
  PageResult,
  RepairDetailVO,
  RepairFormDTO,
  RepairOrderVO,
  RepairQueryDTO,
  RepairerStatisticVO,
  RepairStatus,
  StatisticItemVO,
  StatisticsOverviewVO,
  UploadVO,
  UserRole,
  UserVO,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8080/api";
const TOKEN_KEY = "dorm_repair_token";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "请求失败";
    return Promise.reject(new Error(message));
  },
);

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function unwrap<T>(promise: Promise<{ data: ApiResponse<T> }>): Promise<T> {
  const response = await promise;
  if (response.data.code !== 200) {
    throw new Error(response.data.message || "接口返回异常");
  }
  return response.data.data;
}

function cleanParams(params: object) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== ""),
  );
}

export const authApi = {
  login: (payload: { username: string; password: string }) =>
    unwrap<LoginVO>(apiClient.post("/auth/login", payload)),
  register: (payload: { username: string; password: string; realName: string; phone: string }) =>
    unwrap<UserVO>(apiClient.post("/auth/register", payload)),
  me: () => unwrap<UserVO>(apiClient.get("/auth/me")),
};

export const repairApi = {
  create: (payload: RepairFormDTO) => unwrap<RepairOrderVO>(apiClient.post("/repairs", payload)),
  update: (id: number, payload: RepairFormDTO) => unwrap<RepairOrderVO>(apiClient.put(`/repairs/${id}`, payload)),
  my: (query: RepairQueryDTO) =>
    unwrap<PageResult<RepairOrderVO>>(apiClient.get("/repairs/my", { params: cleanParams(query) })),
  all: (query: RepairQueryDTO) =>
    unwrap<PageResult<RepairOrderVO>>(apiClient.get("/repairs", { params: cleanParams(query) })),
  repairerMy: (query: RepairQueryDTO) =>
    unwrap<PageResult<RepairOrderVO>>(apiClient.get("/repairs/repairer/my", { params: cleanParams(query) })),
  detail: (id: number) => unwrap<RepairDetailVO>(apiClient.get(`/repairs/${id}`)),
  remove: (id: number) => unwrap<void>(apiClient.delete(`/repairs/${id}`)),
  cancel: (id: number) => unwrap<RepairOrderVO>(apiClient.post(`/repairs/${id}/cancel`)),
  approve: (id: number) => unwrap<RepairOrderVO>(apiClient.post(`/repairs/${id}/approve`)),
  reject: (id: number, reason: string) => unwrap<RepairOrderVO>(apiClient.post(`/repairs/${id}/reject`, { reason })),
  assign: (id: number, repairerId: number, remark?: string) =>
    unwrap<RepairOrderVO>(apiClient.post(`/repairs/${id}/assign`, { repairerId, remark })),
  start: (id: number) => unwrap<RepairOrderVO>(apiClient.post(`/repairs/${id}/start`)),
  finish: (id: number, content: string, imageUrls?: string) =>
    unwrap<RepairOrderVO>(apiClient.post(`/repairs/${id}/finish`, { content, imageUrls })),
  requestReassign: (id: number, reason: string) =>
    unwrap<RepairOrderVO>(apiClient.post(`/repairs/${id}/reassign`, { reason })),
  confirm: (id: number) => unwrap<RepairOrderVO>(apiClient.post(`/repairs/${id}/confirm`)),
  feedback: (id: number, score: number, comment?: string) =>
    unwrap<RepairOrderVO>(apiClient.post(`/repairs/${id}/feedback`, { score, comment })),
  buildings: () => unwrap<string[]>(apiClient.get("/repairs/buildings")),
};

export const userApi = {
  list: (query: { page?: number; pageSize?: number; role?: UserRole | ""; keyword?: string }) =>
    unwrap<PageResult<UserVO>>(apiClient.get("/users", { params: cleanParams(query) })),
  repairers: () => unwrap<UserVO[]>(apiClient.get("/users/repairers")),
  create: (payload: { username: string; password: string; realName: string; phone: string; role: UserRole }) =>
    unwrap<UserVO>(apiClient.post("/users", payload)),
  update: (id: number, payload: { realName: string; phone: string }) => unwrap<UserVO>(apiClient.put(`/users/${id}`, payload)),
  updateRole: (id: number, role: UserRole) => unwrap<UserVO>(apiClient.put(`/users/${id}/role`, { role })),
  updateStatus: (id: number, status: number) => unwrap<UserVO>(apiClient.put(`/users/${id}/status`, { status })),
  remove: (id: number) => unwrap<void>(apiClient.delete(`/users/${id}`)),
};

export const statisticsApi = {
  overview: () => unwrap<StatisticsOverviewVO>(apiClient.get("/statistics/overview")),
  status: () => unwrap<StatisticItemVO[]>(apiClient.get("/statistics/status")),
  categories: () => unwrap<StatisticItemVO[]>(apiClient.get("/statistics/categories")),
  buildings: () => unwrap<StatisticItemVO[]>(apiClient.get("/statistics/buildings")),
  daily: (days = 7) => unwrap<DailyStatisticVO[]>(apiClient.get("/statistics/daily", { params: { days } })),
  repairers: () => unwrap<RepairerStatisticVO[]>(apiClient.get("/statistics/repairers")),
};

export const uploadApi = {
  image: async (file: File) => {
    const form = new FormData();
    form.append("file", file);
    const response = await apiClient.post<ApiResponse<UploadVO>>("/uploads/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    if (response.data.code !== 200) {
      throw new Error(response.data.message || "上传失败");
    }
    return response.data.data;
  },
};

export function isAssignableStatus(status: RepairStatus) {
  return status === "APPROVED" || status === "NEED_REASSIGN";
}
