import { User, Order, Alert } from '../types';
import { motion } from 'motion/react';
import { Wallet, Bell, Package, ArrowRight, Clock, RefreshCw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase, hasValidSupabaseKeys } from '../lib/supabase';

interface CustomerDashboardProps {
  user: User;
  orders: Order[];
  alerts: Alert[];
  onNavigate: (tab: string) => void;
}

export default function CustomerDashboard({ user, orders, alerts, onNavigate }: CustomerDashboardProps) {
  const [balance, setBalance] = useState(user.balance);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchBalance = async () => {
    if (!hasValidSupabaseKeys) return;
    setIsRefreshing(true);
    const { data } = await supabase.from('users').select('balance').eq('id', user.id).single();
    if (data && data.balance !== undefined) {
      setBalance(data.balance);
    }
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const activeOrders = orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled');
  const completedOrders = orders.filter(o => o.status === 'Delivered');
  const totalOrders = orders.length;
  const totalSpent = orders.filter(o => o.status !== 'Cancelled').reduce((sum, order) => sum + (order.price || 0), 0);
  
  const recentOrder = orders[0];

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 font-display">Welcome back, {user.name.split(' ')[0]}</h2>
        <p className="text-slate-500 mt-1 text-lg">Here's what's happening with your laundry.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-slate-900 to-slate-800 p-5 rounded-3xl shadow-xl shadow-slate-900/20 text-white relative overflow-hidden lg:col-span-2"
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="flex justify-between items-start mb-6 relative z-10">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
              <Wallet size={24} className="text-brand-300" />
            </div>
            <span className="px-3 py-1 bg-white/10 rounded-full text-xs font-semibold backdrop-blur-sm">Active Account</span>
          </div>
          <div className="relative z-10 flex flex-col w-full gap-4 mt-2">
            <div className="flex items-center justify-between w-full">
              <div>
                <p className="text-slate-300 font-medium text-sm mb-1">Current Balance</p>
                <h3 className="text-4xl font-bold font-display">₱{balance.toFixed(2)}</h3>
              </div>
              <button 
                onClick={fetchBalance}
                disabled={isRefreshing}
                className="p-2 bg-white/10 hover:bg-white/20 rounded-xl backdrop-blur-sm transition-all disabled:opacity-50"
                title="Refresh Balance"
              >
                <RefreshCw size={20} className={`text-white ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white p-5 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 flex flex-col justify-between"
        >
          <p className="text-slate-500 font-medium text-sm mb-1">Total Orders</p>
          <h3 className="text-3xl font-bold text-slate-900 font-display">{totalOrders}</h3>
          <p className="text-xs text-slate-400 mt-2">All time requests</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-5 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 flex flex-col justify-between"
        >
          <p className="text-slate-500 font-medium text-sm mb-1">Active</p>
          <h3 className="text-3xl font-bold text-brand-600 font-display">{activeOrders.length}</h3>
          <p className="text-xs text-slate-400 mt-2">In progress</p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-5 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 flex flex-col justify-between"
        >
          <p className="text-slate-500 font-medium text-sm mb-1">Total Spent</p>
          <h3 className="text-3xl font-bold text-slate-900 font-display">₱{totalSpent.toFixed(2)}</h3>
          <p className="text-xs text-slate-400 mt-2">Lifetime value</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Bell className="text-amber-500" size={20} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 font-display">Recent Alerts</h3>
          </div>
          
          <div className="space-y-4">
            {alerts.length > 0 ? alerts.map((alert) => (
              <div key={alert.id} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors">
                <div className="mt-1 w-2 h-2 rounded-full bg-brand-500 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{alert.title}</h4>
                  <p className="text-sm text-slate-500 mt-0.5">{alert.message}</p>
                  <span className="text-xs text-slate-400 mt-2 block font-medium">{alert.date}</span>
                </div>
              </div>
            )) : (
              <p className="text-slate-500 text-sm">No new alerts at this time.</p>
            )}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white p-6 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 flex flex-col"
        >
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-sky-50 rounded-lg">
                <Clock className="text-sky-500" size={20} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 font-display">Latest Order</h3>
            </div>
            {recentOrder && (
              <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-xs font-bold font-mono">
                {recentOrder.id}
              </span>
            )}
          </div>
          
          {recentOrder ? (
            <div className="flex-1 flex flex-col justify-center">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-slate-900 font-display">{recentOrder.serviceType}</h4>
                <p className="text-brand-600 font-semibold mt-1">{recentOrder.status}</p>
              </div>
              
              <div className="bg-slate-50 p-4 rounded-2xl space-y-3 text-sm font-medium">
                <div className="flex justify-between">
                  <span className="text-slate-500">Pickup Date</span>
                  <span className="text-slate-800">{recentOrder.pickupDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Total</span>
                  <span className="text-slate-800">₱{(recentOrder.price || 0).toFixed(2)}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <p className="text-slate-500 mb-4">You have no recent orders.</p>
              <button 
                onClick={() => onNavigate('new')}
                className="bg-slate-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-md"
              >
                Schedule Pickup
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
