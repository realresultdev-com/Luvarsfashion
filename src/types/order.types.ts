export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PACKING"
  | "DISPATCHED"
  | "SHIPPED"
  | "ON_THE_WAY"
  | "ARRIVING_TODAY"
  | "DELIVERED"
  | "CANCELLED"
  | (string & {});

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  razorpayOrderId?: string;
  paymentId?: string;
  createdAt: string;
}
