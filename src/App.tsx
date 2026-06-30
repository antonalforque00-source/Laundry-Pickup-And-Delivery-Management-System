/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import MainLayout from './components/layout/MainLayout';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import CustomerDashboard from './pages/CustomerDashboard';
import NewOrder from './pages/NewOrder';
import OrderHistory from './pages/OrderHistory';
import Profile from './pages/Profile';
import { Order, User, Alert } from './types';
import RiderDashboard from './pages/RiderDashboard';
import StaffDashboard from './pages/StaffDashboard';
import { INITIAL_ORDERS, INITIAL_ALERTS, INITIAL_INVENTORY } from './db/mockData';
import { supabase, hasValidSupabaseKeys } from './lib/supabase';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [alerts, setAlerts] = useState<Alert[]>(INITIAL_ALERTS);
  const [inventory, setInventory] = useState(INITIAL_INVENTORY);
  const [isLoading, setIsLoading] = useState(hasValidSupabaseKeys);
  const [dbError, setDbError] = useState<string | null>(null);

  useEffect(() => {
    if (!hasValidSupabaseKeys) {
      console.log('No Supabase keys found. Using mock data.');
      return;
    }

    async function loadData() {
      try {
        const { data: ordersData, error: ordersErr } = await supabase.from('orders').select('*');
        if (ordersErr) throw ordersErr;

        const { data: alertsData, error: alertsErr } = await supabase.from('alerts').select('*');
        if (alertsErr) throw alertsErr;

        const { data: inventoryData, error: inventoryErr } = await supabase.from('inventory').select('*');
        if (inventoryErr) throw inventoryErr;

        // Map snake_case from DB to camelCase for frontend
        const mappedOrders: Order[] = (ordersData || []).map((o: any) => ({
          id: o.id,
          customerId: o.customer_id,
          customerName: o.customer_name,
          address: o.address,
          phone: o.phone,
          serviceType: o.service_type,
          status: o.status,
          pickupDate: o.pickup_date,
          price: o.price,
          weight: o.weight,
          specialInstructions: o.special_instructions,
          paymentMethod: o.payment_method,
          riderId: o.rider_id,
          staffId: o.staff_id,
        }));

        const mappedAlerts: Alert[] = (alertsData || []).map((a: any) => ({
          id: a.id,
          title: a.title,
          message: a.message,
          date: a.date,
          isRead: a.is_read
        }));

        const mappedInventory = (inventoryData || []).map((i: any) => ({
          id: i.id,
          name: i.name,
          quantity: i.quantity,
          unit: i.unit,
          lowStockThreshold: i.low_stock_threshold
        }));

        setOrders(mappedOrders);
        setAlerts(mappedAlerts);
        setInventory(mappedInventory.length ? mappedInventory : INITIAL_INVENTORY);
      } catch (err: any) {
        console.error('Supabase load error:', err);
        setDbError(err.message || 'Error loading data from Supabase. Did you run the SQL schema?');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleLogin = async (authenticatedUser: User) => {
    let finalUser = authenticatedUser;

    if (hasValidSupabaseKeys) {
      // Check if user exists
      const { data: existingUser } = await supabase.from('users').select('*').eq('email', authenticatedUser.email).maybeSingle();
      
      if (existingUser) {
        if (!existingUser.is_approved && existingUser.role !== 'admin') {
          throw new Error('Your account is pending admin approval.');
        }
        finalUser = {
          id: existingUser.id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role as any,
          balance: existingUser.balance,
          isApproved: existingUser.is_approved,
          password: existingUser.password,
        };
      } else {
        // New user registration
        const isInitialAdmin = authenticatedUser.role === 'admin';
        const newDbUser = {
          id: authenticatedUser.id,
          name: authenticatedUser.name,
          email: authenticatedUser.email,
          role: authenticatedUser.role,
          balance: authenticatedUser.balance,
          is_approved: true, // Auto-approve all for easier demo testing
        };
        const { error } = await supabase.from('users').insert(newDbUser);
        if (error) {
           console.error("Error inserting user:", error);
           if (error.message?.includes('is_approved')) {
             throw new Error('Schema outdated: Please copy the SQL from supabase-schema.sql and run it in your Supabase SQL Editor to add the is_approved column.');
           }
           if (error.message?.includes('users')) {
             throw new Error('Table missing: Please run supabase-schema.sql in your Supabase SQL Editor.');
           }
           throw new Error(`Database error: ${error.message}`);
        }
        
        finalUser.isApproved = true;
      }
    } else {
      // In mock mode, we just let them in to avoid breaking the demo
      finalUser.isApproved = true;
    }

    setUser(finalUser);
    setCurrentTab('dashboard');
    return true;
  };

  const handleLogout = () => {
    setUser(null);
  };

  const handleAddOrder = async (newOrder: Omit<Order, 'id' | 'status' | 'customerId'>) => {
    if (!user) return;
    const newId = `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
    const order: Order = {
      ...newOrder,
      id: newId,
      customerId: user.id,
      status: 'Pending',
    };

    if (hasValidSupabaseKeys) {
      const { error } = await supabase.from('orders').insert({
        id: order.id,
        customer_id: order.customerId,
        customer_name: order.customerName,
        address: order.address,
        phone: order.phone,
        service_type: order.serviceType,
        status: order.status,
        pickup_date: order.pickupDate,
        payment_method: order.paymentMethod,
        special_instructions: order.specialInstructions,
      });
      if (error) console.error("Error adding order:", error);
    }

    setOrders([order, ...orders]);
    setAlerts([{ id: `ALT-${Date.now()}`, title: 'New Order Placed', message: `Order ${order.id} confirmed.`, date: 'Just now', isRead: false }, ...alerts]);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: Order['status']) => {
    if (hasValidSupabaseKeys) {
      const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', orderId);
      if (error) console.error("Error updating status:", error);
    }
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
  };

  const handleUpdateWeight = async (orderId: string, weight: number) => {
    if (hasValidSupabaseKeys) {
      const { error } = await supabase.from('orders').update({ weight }).eq('id', orderId);
      if (error) console.error("Error updating weight:", error);
    }
    setOrders(orders.map(o => o.id === orderId ? { ...o, weight } : o));
  };

  const handleUpdateInventory = async (itemId: string, quantity: number) => {
    if (hasValidSupabaseKeys) {
      const { error } = await supabase.from('inventory').update({ quantity }).eq('id', itemId);
      if (error) console.error("Error updating inventory:", error);
    }
    setInventory(inventory.map(i => i.id === itemId ? { ...i, quantity } : i));
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center relative overflow-hidden"><div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" /></div>;
  }

  if (!user) {
    return (
      <>
        {dbError && (
          <div className="bg-red-50 text-red-800 p-4 text-center text-sm font-bold border-b border-red-200 z-50 relative">
            ⚠️ Database Error: {dbError}. Please ensure you have run the schema script in your Supabase SQL Editor.
          </div>
        )}
        <Login onLogin={handleLogin} />
      </>
    );
  }

  // Derived state for the specific customer
  const myOrders = orders.filter(o => o.customerId === user.id);

  return (
    <MainLayout user={user} currentTab={currentTab} onTabChange={setCurrentTab} onLogout={handleLogout}>
      {user.role === 'customer' && (
        <>
          {currentTab === 'dashboard' && (
            <CustomerDashboard user={user} orders={myOrders} alerts={alerts} onNavigate={setCurrentTab} />
          )}
          {currentTab === 'new' && (
            <NewOrder user={user} onAddOrder={handleAddOrder} onSuccess={() => setCurrentTab('orders')} />
          )}
          {currentTab === 'orders' && (
            <OrderHistory orders={myOrders} />
          )}
          {currentTab === 'profile' && (
            <Profile user={user} />
          )}
        </>
      )}

      {user.role === 'admin' && (
        <>
          {(currentTab === 'dashboard' || currentTab === 'orders') && (
            <AdminDashboard orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
          )}
        </>
      )}

      {user.role === 'rider' && (
        <>
          {(currentTab === 'dashboard' || currentTab === 'pickups' || currentTab === 'deliveries') && (
            <RiderDashboard user={user} orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
          )}
        </>
      )}

      {user.role === 'staff' && (
        <>
          {(currentTab === 'dashboard' || currentTab === 'processing' || currentTab === 'inventory') && (
            <StaffDashboard 
              user={user} 
              orders={orders} 
              inventory={inventory} 
              onUpdateStatus={handleUpdateOrderStatus} 
              onUpdateWeight={handleUpdateWeight} 
              onUpdateInventory={handleUpdateInventory}
              currentTab={currentTab} 
            />
          )}
          {currentTab === 'admin-dashboard' && (
            <AdminDashboard orders={orders} onUpdateStatus={handleUpdateOrderStatus} />
          )}
        </>
      )}
    </MainLayout>
  );
}
