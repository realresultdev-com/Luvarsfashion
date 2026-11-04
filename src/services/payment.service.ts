import { api } from "./api";

export const paymentService = {
  createOrder: (amount: number) => api.post("/payment/create-order", { amount }),
  verify: (payload: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    orderId: string;
  }) => api.post("/payment/verify", payload),
};
