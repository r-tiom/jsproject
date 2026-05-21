export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  address?: string;
  phone?: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  countInStock: number;
  rating?: number;
  numReviews?: number;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'Pending' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number; // Snapshot of the price at order time
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  orderItems: OrderItem[];
  shippingAddress: string;
  shippingCity: string;
  shippingPostalCode: string;
  shippingPhone: string;
  paymentMethod: string;
  paymentDetails?: {
    cardBrand?: string;
    last4?: string;
  };
  itemsPrice: number;
  shippingPrice: number;
  taxPrice: number;
  totalPrice: number;
  status: OrderStatus;
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface DashboardStats {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  salesByCategory: Record<string, number>;
  monthlySales: { month: string; sales: number }[];
  recentOrders: Order[];
}
