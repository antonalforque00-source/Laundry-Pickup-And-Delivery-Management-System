import { relations } from 'drizzle-orm';
import { pgTable, text, serial, integer, timestamp, real, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: text('uid').notNull().unique(),
  name: text('name').notNull(),
  email: text('email').notNull(),
  role: text('role').notNull().default('customer'),
  balance: real('balance').notNull().default(0),
  phone: text('phone'),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const alerts = pgTable('alerts', {
  id: serial('id').primaryKey(),
  userId: text('user_id').references(() => users.uid).notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  date: text('date').notNull(),
  isRead: boolean('is_read').notNull().default(false),
});

export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  orderNumber: text('order_number').notNull().unique(), // E.g., ORD-001
  customerId: text('customer_id').references(() => users.uid).notNull(),
  customerName: text('customer_name').notNull(),
  address: text('address').notNull(),
  phone: text('phone').notNull(),
  serviceType: text('service_type').notNull(),
  status: text('status').notNull().default('Pending'),
  pickupDate: text('pickup_date').notNull(),
  price: real('price'),
  weight: real('weight'),
  specialInstructions: text('special_instructions'),
  paymentMethod: text('payment_method'),
  riderId: text('rider_id').references(() => users.uid),
  staffId: text('staff_id').references(() => users.uid),
  createdAt: timestamp('created_at').defaultNow(),
});

export const inventory = pgTable('inventory', {
  id: serial('id').primaryKey(),
  name: text('name').notNull(),
  quantity: real('quantity').notNull(),
  unit: text('unit').notNull(),
  lowStockThreshold: real('low_stock_threshold').notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders, { relationName: 'customerOrders' }),
  deliveries: many(orders, { relationName: 'riderDeliveries' }),
  processedOrders: many(orders, { relationName: 'staffOrders' }),
  alerts: many(alerts),
}));

export const ordersRelations = relations(orders, ({ one }) => ({
  customer: one(users, {
    fields: [orders.customerId],
    references: [users.uid],
    relationName: 'customerOrders'
  }),
  rider: one(users, {
    fields: [orders.riderId],
    references: [users.uid],
    relationName: 'riderDeliveries'
  }),
  staff: one(users, {
    fields: [orders.staffId],
    references: [users.uid],
    relationName: 'staffOrders'
  }),
}));

export const alertsRelations = relations(alerts, ({ one }) => ({
  user: one(users, {
    fields: [alerts.userId],
    references: [users.uid],
  }),
}));
