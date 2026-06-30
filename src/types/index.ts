export type Role = 'customer' | 'admin' | 'rider' | 'staff';

export type OrderStatus = 
  | 'Pending' 
  | 'Pickup Scheduled' 
  | 'Picked Up' 
  | 'Washing' 
  | 'Drying' 
  | 'Folding' 
  | 'Ready for Delivery' 
  | 'Out for Delivery' 
  | 'Delivered'
  | 'Cancelled';

export type ServiceType = 'Wash & Fold' | 'Wash & Dry' | 'Dry Cleaning' | 'Ironing';

export type PaymentMethod = 'Cash on Delivery' | 'GCash' | 'Maya' | 'Credit/Debit Card';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  balance: number;
  phone?: string;
  address?: string;
  isApproved?: boolean;
  password?: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  date: string;
  isRead: boolean;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  phone: string;
  serviceType: ServiceType | string;
  status: OrderStatus;
  pickupDate: string;
  price?: number;
  weight?: number;
  specialInstructions?: string;
  paymentMethod?: PaymentMethod | string;
  riderId?: string;
  staffId?: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  lowStockThreshold: number;
}

export interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: Role | string;
  receiverRole: Role | string;
  content: string;
  createdAt: string;
}

