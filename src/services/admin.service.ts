import { api } from "./api";

export interface DashboardStats {
  productCount: number;
  orderCount: number;
  userCount: number;
  totalRevenue: number;
}

export const adminService = {
  getDashboardStats: () => api.get<DashboardStats>("/admin/dashboard"),
  getUsers: () => api.get("/admin/users"),
  updateUserRole: (id: string, role: string) => api.patch(`/admin/users/${id}/role`, { role }),
};
