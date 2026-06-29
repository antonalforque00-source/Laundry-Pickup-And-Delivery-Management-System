import { Order, Alert, User, InventoryItem } from '../types';

export const INITIAL_USERS: User[] = [
  { id: 'ADM-001', name: 'System Admin', email: 'admin@puredrop.com', role: 'admin', balance: 0 },
  { id: 'CUS-1029', name: 'Alex Johnson', email: 'alex@example.com', role: 'customer', balance: 42.50 },
  { id: 'RID-502', name: 'Mark Driver', email: 'mark@puredrop.com', role: 'rider', balance: 0 },
  { id: 'STF-301', name: 'Sarah Wash', email: 'sarah@puredrop.com', role: 'staff', balance: 0 },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 'ORD-001',
    customerId: 'CUS-1029',
    customerName: 'Alex Johnson',
    address: '123 Main St, Apt 4B',
    phone: '555-0100',
    serviceType: 'Wash & Fold',
    status: 'Pending',
    pickupDate: new Date().toISOString().split('T')[0],
    paymentMethod: 'Cash on Delivery',
  },
  {
    id: 'ORD-002',
    customerId: 'CUS-1029',
    customerName: 'Alex Johnson',
    address: '456 Oak Ave',
    phone: '555-0200',
    serviceType: 'Dry Cleaning',
    status: 'Washing',
    pickupDate: new Date(Date.now() - 86400000).toISOString().split('T')[0],
    price: 35.50,
    weight: 5.2,
    paymentMethod: 'GCash',
    staffId: 'STF-301'
  },
  {
    id: 'ORD-003',
    customerId: 'CUS-1030',
    customerName: 'Maria Garcia',
    address: '789 Pine Rd',
    phone: '555-0300',
    serviceType: 'Wash & Dry',
    status: 'Ready for Delivery',
    pickupDate: new Date(Date.now() - 172800000).toISOString().split('T')[0],
    price: 45.00,
    weight: 8.5,
    paymentMethod: 'Credit/Debit Card',
    riderId: 'RID-502'
  }
];

export const INITIAL_ALERTS: Alert[] = [
  { id: 'ALT-1', title: 'Pickup Scheduled', message: 'Your driver is scheduled to arrive tomorrow between 9am-11am.', date: 'Today, 2:30 PM', isRead: false },
  { id: 'ALT-2', title: 'Order Completed', message: 'ORD-002 has been successfully delivered.', date: 'Yesterday', isRead: true },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  { id: 'INV-1', name: 'Premium Detergent', quantity: 25, unit: 'Liters', lowStockThreshold: 10 },
  { id: 'INV-2', name: 'Fabric Conditioner', quantity: 8, unit: 'Liters', lowStockThreshold: 15 },
  { id: 'INV-3', name: 'Bleach', quantity: 12, unit: 'Liters', lowStockThreshold: 5 },
];
