import { Order, User } from '../types';
import { MapPin, Package, CheckCircle2, Navigation } from 'lucide-react';
import { motion } from 'motion/react';

interface RiderDashboardProps {
  user: User;
  orders: Order[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
}

export default function RiderDashboard({ user, orders, onUpdateStatus }: RiderDashboardProps) {
  const myPickups = orders.filter(o => o.status === 'Pending' || o.status === 'Pickup Scheduled');
  const myDeliveries = orders.filter(o => o.status === 'Ready for Delivery' || o.status === 'Out for Delivery');

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 font-display">Rider Operations</h2>
        <p className="text-slate-500 mt-1 text-lg">Manage your daily route, pickups, and deliveries.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-brand-600 p-6 rounded-3xl text-white shadow-xl shadow-brand-600/30"
        >
          <h3 className="font-bold text-brand-100 text-sm uppercase tracking-wider mb-2">Pending Pickups</h3>
          <p className="text-4xl font-display font-bold">{myPickups.length}</p>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-sky-600 p-6 rounded-3xl text-white shadow-xl shadow-sky-600/30"
        >
          <h3 className="font-bold text-sky-100 text-sm uppercase tracking-wider mb-2">Pending Deliveries</h3>
          <p className="text-4xl font-display font-bold">{myDeliveries.length}</p>
        </motion.div>
      </div>

      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-slate-900 font-display">Your Tasks</h3>
        
        {/* Pickups */}
        <div className="space-y-4">
          <h4 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Package size={20} className="text-brand-500" /> Pending Pickups
          </h4>
          {myPickups.length > 0 ? myPickups.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <p className="font-bold text-slate-900">{order.customerName}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <MapPin size={16} /> {order.address}
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onUpdateStatus(order.id, 'Pickup Scheduled')}
                  disabled={order.status === 'Pickup Scheduled'}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {order.status === 'Pickup Scheduled' ? 'Scheduled' : 'Accept Pickup'}
                </button>
                <button 
                  onClick={() => onUpdateStatus(order.id, 'Picked Up')}
                  className="px-4 py-2 bg-brand-600 hover:bg-brand-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={16} /> Confirm Pickup
                </button>
              </div>
            </div>
          )) : (
            <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl">No pending pickups right now.</p>
          )}
        </div>

        {/* Deliveries */}
        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h4 className="text-lg font-bold text-slate-700 flex items-center gap-2">
            <Navigation size={20} className="text-sky-500" /> Pending Deliveries
          </h4>
          {myDeliveries.length > 0 ? myDeliveries.map((order) => (
            <div key={order.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div>
                <p className="font-bold text-slate-900">{order.customerName} - {order.serviceType}</p>
                <div className="flex items-center gap-2 text-sm text-slate-600 mt-1">
                  <MapPin size={16} /> {order.address}
                </div>
                {order.price && (
                  <p className="text-sm font-bold text-emerald-600 mt-1">Collect: ₱{order.price.toFixed(2)} ({order.paymentMethod})</p>
                )}
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={() => onUpdateStatus(order.id, 'Out for Delivery')}
                  disabled={order.status === 'Out for Delivery'}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-sm transition-colors disabled:opacity-50"
                >
                  {order.status === 'Out for Delivery' ? 'On Route' : 'Start Route'}
                </button>
                <button 
                  onClick={() => onUpdateStatus(order.id, 'Delivered')}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-sm flex items-center gap-2 transition-colors"
                >
                  <CheckCircle2 size={16} /> Mark Delivered
                </button>
              </div>
            </div>
          )) : (
            <p className="text-slate-500 text-sm bg-slate-50 p-4 rounded-xl">No pending deliveries right now.</p>
          )}
        </div>
      </div>
    </div>
  );
}
