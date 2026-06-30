-- Run this in your Supabase SQL Editor

-- Create Users table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    role TEXT NOT NULL DEFAULT 'customer',
    password TEXT,
    balance REAL NOT NULL DEFAULT 0,
    phone TEXT,
    address TEXT,
    is_approved BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Orders table
CREATE TABLE IF NOT EXISTS public.orders (
    id TEXT PRIMARY KEY,
    customer_id TEXT NOT NULL REFERENCES public.users(id),
    customer_name TEXT NOT NULL,
    address TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Pending',
    pickup_date TEXT NOT NULL,
    price REAL,
    weight REAL,
    special_instructions TEXT,
    payment_method TEXT,
    rider_id TEXT REFERENCES public.users(id),
    staff_id TEXT REFERENCES public.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create Alerts table
CREATE TABLE IF NOT EXISTS public.alerts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    date TEXT NOT NULL,
    is_read BOOLEAN NOT NULL DEFAULT false
);

-- Create Inventory table
CREATE TABLE IF NOT EXISTS public.inventory (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    quantity REAL NOT NULL,
    unit TEXT NOT NULL,
    low_stock_threshold REAL NOT NULL
);

-- Create Messages table
CREATE TABLE IF NOT EXISTS public.messages (
    id TEXT PRIMARY KEY,
    sender_id TEXT NOT NULL REFERENCES public.users(id),
    sender_name TEXT NOT NULL,
    sender_role TEXT NOT NULL,
    receiver_role TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Setup Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Create Policies (allowing anonymous access for demo purposes, you should restrict this in production)
CREATE POLICY "Enable all access for all users" ON public.users FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all orders" ON public.orders FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all alerts" ON public.alerts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all inventory" ON public.inventory FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Enable all access for all messages" ON public.messages FOR ALL USING (true) WITH CHECK (true);


-- Insert demo inventory data
INSERT INTO public.inventory (id, name, quantity, unit, low_stock_threshold) VALUES
('INV-1', 'Premium Detergent', 25, 'Liters', 10),
('INV-2', 'Fabric Conditioner', 8, 'Liters', 15),
('INV-3', 'Bleach', 12, 'Liters', 5)
ON CONFLICT (id) DO NOTHING;
