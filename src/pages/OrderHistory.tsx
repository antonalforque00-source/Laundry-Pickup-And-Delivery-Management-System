import { Order } from '../types';
import { Calendar, MapPin, Phone, Package, Navigation } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useState } from 'react';
import OrderTracker from '../components/OrderTracker';

interface OrderHistoryProps {
  orders: Order[];
}

export default function OrderHistory({ orders }: OrderHistoryProps) {
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const getStatusColor = (status: Order['status']) => {
    const colors = {
      'Pending': 'bg-amber-100 text-amber-800 border-amber-200',
      'Pickup Scheduled': 'bg-orange-100 text-orange-800 border-orange-200',
      'Picked Up': 'bg-sky-100 text-sky-800 border-sky-200',
      'Washing': 'bg-blue-100 text-blue-800 border-blue-200',
      'Drying': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'Folding': 'bg-indigo-100 text-indigo-800 border-indigo-200',
      'Ready for Delivery': 'bg-teal-100 text-teal-800 border-teal-200',
      'Out for Delivery': 'bg-purple-100 text-purple-800 border-purple-200',
      'Delivered': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'Cancelled': 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[status];
  };

  const isActive = (status: Order['status']) => 
    !['Delivered', 'Cancelled'].includes(status);

  const getEstimatedPrice = (serviceType: string) => {
    const estimates: Record<string, number> = {
      'Wash & Fold': 15.00,
      'Wash & Dry': 20.00,
      'Dry Cleaning': 35.00,
      'Ironing Only': 25.00,
      'Premium Care': 50.00
    };
    return estimates[serviceType] || 20.00;
  };

  return (
    <div className="space-y-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 font-display">Order History</h2>
        <p className="text-slate-500 mt-1 text-lg">Track all your past and current transactions.</p>
      </div>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {orders.map((order, i) => (
            <motion.div 
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              key={order.id} 
              className="bg-white p-6 rounded-3xl border border-slate-200/60 shadow-lg shadow-slate-200/40 hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-start mb-5">
                <div>
                  <span className="text-xs font-mono font-bold text-brand-400 bg-brand-50 px-2 py-1 rounded-md">{order.id}</span>
                  <h3 className="font-bold text-slate-900 text-xl mt-2 font-display">{order.serviceType}</h3>
                </div>
                <span className={`px-3 py-1.5 border rounded-xl text-xs font-bold tracking-wide ${getStatusColor(order.status)}`}>
                  {order.status}
                </span>
              </div>
              
              <div className="space-y-4 mt-4 text-sm text-slate-600 font-medium flex-1">
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-lg">
                  <Calendar size={18} className="text-brand-500" />
                  <span>Pickup: <span className="text-slate-900">{order.pickupDate}</span></span>
                </div>
                <div className="flex items-start gap-3 p-2">
                  <MapPin size={18} className="text-slate-400 shrink-0 mt-0.5" />
                  <span className="leading-snug">{order.address}</span>
                </div>
                <div className="flex items-center gap-3 p-2">
                  <Phone size={18} className="text-slate-400" />
                  <span>{order.phone}</span>
                </div>
              </div>

              {isActive(order.status) && (
                <div className="mt-4">
                  <button 
                    onClick={() => setExpandedOrder(expandedOrder === order.id ? null : order.id)}
                    className="w-full py-2.5 bg-brand-50 hover:bg-brand-100 text-brand-700 font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Navigation size={16} />
                    {expandedOrder === order.id ? 'Hide Tracking Map' : 'View Live Tracking Map'}
                  </button>
                  
                  <AnimatePresence>
                    {expandedOrder === order.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden mt-4"
                      >
                        <OrderTracker order={order} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              <div className="mt-6 pt-5 border-t border-slate-100 flex justify-between items-center">
                <span className="text-slate-500 text-sm font-semibold">
                  Estimated Total {order.weight ? `(~${order.weight} kg)` : ''}
                </span>
                <span className="text-2xl font-bold text-slate-900 font-display">
                  {order.price ? `₱${order.price.toFixed(2)}` : `~₱${getEstimatedPrice(order.serviceType).toFixed(2)}`}
                </span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {orders.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="col-span-full py-20 text-center border-2 border-dashed border-brand-200 rounded-3xl bg-brand-50/50"
          >
            <div className="bg-white w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-sm border border-brand-100">
              <Package size={32} className="text-brand-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-800 font-display">No history found</h3>
            <p className="text-slate-500 mt-2 text-lg">You haven't made any orders yet.</p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
