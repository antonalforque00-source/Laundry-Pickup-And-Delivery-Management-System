import { Order, User, InventoryItem } from '../types';
import { Waves, Scale, AlertTriangle, Box, RefreshCw, LayoutDashboard, Search, Package, Plus, Minus, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { useState } from 'react';

interface StaffDashboardProps {
  user: User;
  orders: Order[];
  inventory: InventoryItem[];
  onUpdateStatus: (orderId: string, status: Order['status']) => void;
  onUpdateWeight: (orderId: string, weight: number) => void;
  onUpdateInventory?: (itemId: string, quantity: number) => void;
  currentTab?: string;
}

export default function StaffDashboard({ user, orders, inventory, onUpdateStatus, onUpdateWeight, onUpdateInventory, currentTab = 'dashboard' }: StaffDashboardProps) {
  const processingOrders = orders.filter(o => 
    o.status === 'Picked Up' || 
    o.status === 'Washing' || 
    o.status === 'Drying' || 
    o.status === 'Folding'
  );

  const pendingPickups = orders.filter(o => o.status === 'Pending' || o.status === 'Pickup Scheduled');
  const readyOrders = orders.filter(o => o.status === 'Ready for Delivery');

  const lowInventory = inventory.filter(i => i.quantity <= i.lowStockThreshold);
  
  const [activeWeights, setActiveWeights] = useState<Record<string, string>>({});
  const [searchQuery, setSearchQuery] = useState('');

  const handleWeightSubmit = (orderId: string) => {
    const w = parseFloat(activeWeights[orderId]);
    if (!isNaN(w) && w > 0) {
      onUpdateWeight(orderId, w);
    }
  };

  const handleInventoryChange = (itemId: string, currentQty: number, delta: number) => {
    if (onUpdateInventory) {
      const newQty = Math.max(0, currentQty + delta);
      onUpdateInventory(itemId, newQty);
    }
  };

  if (currentTab === 'dashboard') {
    return (
      <div className="space-y-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900 font-display">Staff Dashboard</h2>
          <p className="text-slate-500 mt-1 text-lg">Welcome back, {user.name}. Here's what needs attention today.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none" />
            <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mb-4">
              <Package size={28} />
            </div>
            <h3 className="text-4xl font-bold font-display text-slate-900 mb-1">{pendingPickups.length}</h3>
            <p className="text-slate-500 font-medium">Pending Pickups</p>
          </div>
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#f5596e]/20 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none" />
            <div className="w-14 h-14 bg-[#f5596e]/10 text-[#f5596e] rounded-2xl flex items-center justify-center mb-4">
              <Waves size={28} />
            </div>
            <h3 className="text-4xl font-bold font-display text-slate-900 mb-1">{processingOrders.length}</h3>
            <p className="text-slate-500 font-medium">Active Processing</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-100 rounded-full blur-3xl opacity-50 -mr-10 -mt-10 pointer-events-none" />
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-4">
              <CheckCircle2 size={28} />
            </div>
            <h3 className="text-4xl font-bold font-display text-slate-900 mb-1">{readyOrders.length}</h3>
            <p className="text-slate-500 font-medium">Ready for Delivery</p>
          </div>
        </div>

        {lowInventory.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 border border-red-200 p-6 rounded-3xl flex items-start gap-4 text-red-800"
          >
            <div className="bg-red-100 p-3 rounded-xl">
              <AlertTriangle className="text-red-600" size={24} />
            </div>
            <div>
              <h4 className="text-lg font-bold text-red-900 mb-2">Low Inventory Alert</h4>
              <ul className="space-y-1">
                {lowInventory.map(item => (
                  <li key={item.id} className="text-sm font-medium flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-400"></span>
                    {item.name}: Only {item.quantity} {item.unit} remaining (Threshold: {item.lowStockThreshold})
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </div>
    );
  }

  if (currentTab === 'inventory') {
    return (
      <div className="space-y-8">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-slate-900 font-display">Inventory Management</h2>
          <p className="text-slate-500 mt-1 text-lg">Monitor and restock laundry supplies.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {inventory.map((item) => {
            const isLow = item.quantity <= item.lowStockThreshold;
            return (
              <div key={item.id} className={`bg-white p-6 rounded-3xl border shadow-sm transition-all ${isLow ? 'border-red-200 shadow-red-100/50' : 'border-slate-200'}`}>
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${isLow ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                    <Box size={24} />
                  </div>
                  {isLow && (
                    <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full flex items-center gap-1">
                      <AlertTriangle size={12} /> Low Stock
                    </span>
                  )}
                </div>
                
                <h3 className="font-bold text-slate-900 text-xl mb-1">{item.name}</h3>
                <div className="flex items-end gap-2 mb-6">
                  <span className={`text-3xl font-display font-bold ${isLow ? 'text-red-600' : 'text-slate-900'}`}>{item.quantity}</span>
                  <span className="text-slate-500 font-medium mb-1">{item.unit}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleInventoryChange(item.id, item.quantity, -1)}
                    className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-bold rounded-xl border border-slate-200 flex justify-center items-center transition-colors"
                  >
                    <Minus size={18} />
                  </button>
                  <button 
                    onClick={() => handleInventoryChange(item.id, item.quantity, 1)}
                    className="flex-1 py-2 bg-[#f5596e] hover:bg-[#e0485d] text-white font-bold rounded-xl flex justify-center items-center shadow-md shadow-[#f5596e]/20 transition-colors"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Processing tab
  const filteredOrders = processingOrders.filter(o => 
    o.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
    o.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 font-display">Laundry Processing</h2>
          <p className="text-slate-500 mt-1 text-lg">Manage active laundry tasks and update statuses.</p>
        </div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="Search by ID or Name"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full md:w-64 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-2 focus:ring-[#f5596e] outline-none font-medium text-slate-700"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredOrders.length > 0 ? filteredOrders.map((order) => (
          <div key={order.id} className="bg-white p-5 md:p-6 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <span className="text-xs font-mono font-bold text-[#f5596e] bg-[#f5596e]/10 px-3 py-1 rounded-lg">{order.id}</span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold uppercase tracking-wider">{order.status}</span>
              </div>
              <h3 className="font-bold text-slate-900 text-xl">{order.serviceType}</h3>
              <p className="text-slate-500 text-sm font-medium mt-1">Customer: {order.customerName}</p>
              
              {!order.weight && order.status === 'Picked Up' && (
                <div className="mt-5 flex items-center gap-2">
                  <input 
                    type="number" 
                    placeholder="Weight (kg)"
                    className="py-2.5 px-4 border border-slate-200 rounded-xl w-36 text-sm outline-none focus:border-[#f5596e] bg-slate-50 font-medium"
                    value={activeWeights[order.id] || ''}
                    onChange={(e) => setActiveWeights({...activeWeights, [order.id]: e.target.value})}
                  />
                  <button 
                    onClick={() => handleWeightSubmit(order.id)}
                    className="py-2.5 px-4 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20"
                  >
                    Set Weight
                  </button>
                </div>
              )}
              {order.weight && (
                <p className="text-sm font-bold text-emerald-700 mt-4 bg-emerald-50 inline-flex items-center px-4 py-2 rounded-xl">
                  <Scale size={16} className="mr-2" />
                  Recorded Weight: {order.weight} kg
                </p>
              )}
            </div>

            <div className="flex flex-col gap-3 min-w-full md:min-w-[280px] bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                <button 
                  onClick={() => onUpdateStatus(order.id, 'Washing')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${order.status === 'Washing' ? 'bg-blue-500 text-white shadow-blue-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                  Washing
                </button>
                <button 
                  onClick={() => onUpdateStatus(order.id, 'Drying')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${order.status === 'Drying' ? 'bg-amber-500 text-white shadow-amber-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                  Drying
                </button>
                <button 
                  onClick={() => onUpdateStatus(order.id, 'Folding')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${order.status === 'Folding' ? 'bg-indigo-500 text-white shadow-indigo-500/20' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                  Folding
                </button>
                <button 
                  onClick={() => onUpdateStatus(order.id, 'Ready for Delivery')}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${order.status === 'Ready for Delivery' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-[#f5596e] text-white shadow-[#f5596e]/20 hover:bg-[#e0485d]'}`}
                >
                  Ready
                </button>
              </div>
            </div>
          </div>
        )) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-300">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Waves size={40} className="text-slate-400" />
            </div>
            <p className="text-slate-600 text-xl font-bold font-display mb-1">No active processing tasks.</p>
            <p className="text-slate-400 font-medium">When orders are picked up, they will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
