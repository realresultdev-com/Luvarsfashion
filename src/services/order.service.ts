import { api } from "./api";

export interface ShippingAddressInput {
  fullName?: string;
  email?: string;
  phone?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
}

export const orderService = {
  createFromCart: (
    items: { productId: string; quantity: number }[],
    shippingAddress?: ShippingAddressInput
  ) => api.post("/orders", { items, shippingAddress }),
  myOrders: () => api.get("/orders/me"),
  allOrders: () => api.get("/orders"),               // admin only
  updateStatus: (id: string, status: string) =>
    api.patch(`/orders/${id}/status`, { status }),    // admin only
};
