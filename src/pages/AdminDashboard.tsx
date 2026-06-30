import { Order, OrderStatus, User } from '../types';
import { Search, Filter, Droplets, Truck, CheckCircle2, Clock, Users, UserCheck, Plus, Eye, EyeOff } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase, hasValidSupabaseKeys } from '../lib/supabase';

interface AdminDashboardProps {
  user: User;
  orders: Order[];
  onUpdateStatus: (orderId: string, status: OrderStatus) => void;
  currentView?: 'orders' | 'users';
}

export default function AdminDashboard({ user, orders, onUpdateStatus, currentView = 'orders' }: AdminDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'All'>('All');
  
  const [users, setUsers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState<{ [key: string]: string }>({});

  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('customer');
  const [showNewUserPassword, setShowNewUserPassword] = useState(false);
  const [createUserError, setCreateUserError] = useState('');

  useEffect(() => {
    if (!hasValidSupabaseKeys || currentView !== 'users') return;
    
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      const { data, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
      if (!error && data) {
        setUsers(data.map(u => ({
          id: u.id,
          name: u.name,
          email: u.email,
          role: u.role as any,
          password: u.password,
          balance: u.balance,
          phone: u.phone || undefined,
          address: u.address || undefined,
          isApproved: u.is_approved
        })));
      }
      setIsLoadingUsers(false);
    };

    fetchUsers();
  }, [currentView]);

  const handleApproveUser = async (userId: string) => {
    if (!hasValidSupabaseKeys) return;
    const { error } = await supabase.from('users').update({ is_approved: true }).eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isApproved: true } : u));
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    if (!hasValidSupabaseKeys) return;
    const { error } = await supabase.from('users').update({ role: newRole }).eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole as any } : u));
    } else {
      console.error('Failed to update role', error);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasValidSupabaseKeys) return;
    setCreateUserError('');
    setIsLoadingUsers(true);

    try {
      const { data: existingUsers, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('email', newUserEmail);

      if (checkError) throw new Error('Error checking for existing user.');
      if (existingUsers && existingUsers.length > 0) throw new Error('User with this email already exists.');

      let prefix = 'CUS';
      if (newUserRole === 'admin') prefix = 'ADM';
      if (newUserRole === 'staff') prefix = 'STF';
      if (newUserRole === 'rider') prefix = 'RDR';
      
      const userId = `${prefix}-${Math.floor(Math.random() * 10000)}`;

      const { data, error } = await supabase
        .from('users')
        .insert({
          id: userId,
          name: newUserName || 'New User',
          email: newUserEmail,
          role: newUserRole,
          password: newUserPassword,
          is_approved: true
        })
        .select()
        .single();

      if (error) throw new Error('Failed to create user record.');

      setUsers(prev => [{
        id: data.id,
        name: data.name,
        email: data.email,
        role: data.role as any,
        password: data.password,
        balance: data.balance,
        isApproved: data.is_approved
      }, ...prev]);

      setIsCreatingUser(false);
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      setNewUserRole('customer');
    } catch (err: any) {
      setCreateUserError(err.message || 'An error occurred while creating user.');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const handleTopUp = async (userId: string, currentBalance: number) => {
    if (!hasValidSupabaseKeys) return;
    const amountStr = topUpAmount[userId];
    const amount = parseFloat(amountStr);
    if (isNaN(amount) || amount <= 0) return;

    const newBalance = currentBalance + amount;
    const { error } = await supabase.from('users').update({ balance: newBalance }).eq('id', userId);
    if (!error) {
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, balance: newBalance } : u));
      setTopUpAmount(prev => ({ ...prev, [userId]: '' }));
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          order.customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statuses: OrderStatus[] = [
    'Pending', 'Pickup Scheduled', 'Picked Up', 'Washing', 'Drying', 
    'Folding', 'Ready for Delivery', 'Out for Delivery', 'Delivered', 'Cancelled'
  ];

  const getStatusColor = (status: OrderStatus) => {
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

  const stats = [
    { title: 'Total Orders', count: orders.length, icon: Droplets, color: 'text-slate-700', bg: 'bg-slate-100' },
    { title: 'Pending Pickups', count: orders.filter(o => o.status === 'Pending' || o.status === 'Pickup Scheduled').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: 'Processing', count: orders.filter(o => ['Washing', 'Drying', 'Folding'].includes(o.status)).length, icon: Droplets, color: 'text-brand-600', bg: 'bg-brand-100' },
    { title: 'Out for Delivery', count: orders.filter(o => o.status === 'Out for Delivery').length, icon: Truck, color: 'text-indigo-600', bg: 'bg-indigo-100' },
    { title: 'Delivered', count: orders.filter(o => o.status === 'Delivered').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 mb-2">
        <h2 className="text-3xl font-bold text-slate-900 font-display">Dashboard</h2>
        <p className="text-slate-500 text-lg">Manage operations and track processing states.</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {stats.map((stat, i) => (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={stat.title} 
            className="bg-white p-5 rounded-3xl shadow-lg shadow-slate-200/40 border border-slate-100 flex flex-col justify-between items-start"
          >
            <div className={`p-2.5 rounded-xl ${stat.bg} ${stat.color} mb-4`}>
              <stat.icon size={20} />
            </div>
            <div>
              <div className="text-slate-500 text-sm font-semibold mb-1">{stat.title}</div>
              <div className="text-3xl font-bold text-slate-900 font-display">{stat.count}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-xl shadow-brand-100/40 border border-brand-100/60 overflow-hidden"
      >
        {currentView === 'orders' ? (
          <>
            <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row gap-4 justify-between items-center bg-slate-50/50">
              <div className="relative w-full sm:max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search by ID or customer..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 placeholder:text-slate-400 shadow-sm transition-all"
                />
              </div>
              <div className="flex items-center gap-3 w-full sm:w-auto bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-sm">
                <Filter size={18} className="text-slate-400" />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as OrderStatus | 'All')}
                  className="bg-transparent text-slate-700 text-sm font-medium focus:outline-none w-full sm:w-auto outline-none cursor-pointer"
                >
                  <option value="All">All Statuses</option>
                  {statuses.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50/80 text-slate-500 border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4 font-semibold tracking-wide">Order ID</th>
                    <th className="px-6 py-4 font-semibold tracking-wide">Customer</th>
                    <th className="px-6 py-4 font-semibold tracking-wide">Service</th>
                    <th className="px-6 py-4 font-semibold tracking-wide">Pickup Date</th>
                    <th className="px-6 py-4 font-semibold tracking-wide">Status</th>
                    <th className="px-6 py-4 font-semibold tracking-wide text-right">Update Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  <AnimatePresence>
                    {filteredOrders.map((order, i) => (
                      <motion.tr 
                        layout
                        initial={{ opacity: 0, alpha: 0 }}
                        animate={{ opacity: 1, alpha: 1 }}
                        exit={{ opacity: 0 }}
                        key={order.id} 
                        className="hover:bg-brand-50/30 transition-colors group"
                      >
                        <td className="px-6 py-5 font-mono font-bold text-brand-600">{order.id}</td>
                        <td className="px-6 py-5">
                          <div className="font-bold text-slate-900">{order.customerName}</div>
                          <div className="text-slate-500 text-xs mt-1 truncate max-w-[200px] font-medium">{order.address}</div>
                        </td>
                        <td className="px-6 py-5 font-semibold text-slate-700">{order.serviceType}</td>
                        <td className="px-6 py-5 text-slate-600 font-medium">{order.pickupDate}</td>
                        <td className="px-6 py-5">
                          <span className={`px-3 py-1.5 rounded-xl text-xs font-bold tracking-wide border ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <select
                            value={order.status}
                            onChange={(e) => onUpdateStatus(order.id, e.target.value as OrderStatus)}
                            className="bg-white border border-slate-200 text-slate-800 text-xs rounded-xl px-3 py-2 font-bold outline-none focus:ring-2 focus:ring-brand-500 shadow-sm cursor-pointer group-hover:border-brand-300 transition-colors"
                          >
                            {statuses.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                  {filteredOrders.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center text-slate-500 text-lg font-medium">
                        No orders found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-slate-900">Manage Users & Balances</h3>
              <button
                onClick={() => setIsCreatingUser(!isCreatingUser)}
                className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2"
              >
                {isCreatingUser ? 'Cancel' : <><Plus size={16} /> Create User</>}
              </button>
            </div>
            
            <AnimatePresence>
              {isCreatingUser && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden mb-6"
                >
                  <form onSubmit={handleCreateUser} className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
                    <h4 className="font-bold text-slate-900 mb-4">Create New User</h4>
                    
                    {createUserError && (
                      <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium mb-4">
                        {createUserError}
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                        <input
                          type="text"
                          required
                          value={newUserName}
                          onChange={e => setNewUserName(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                        <input
                          type="email"
                          required
                          value={newUserEmail}
                          onChange={e => setNewUserEmail(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                        <div className="relative">
                          <input
                            type={showNewUserPassword ? "text" : "password"}
                            required
                            value={newUserPassword}
                            onChange={e => setNewUserPassword(e.target.value)}
                            className="w-full pl-4 pr-10 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewUserPassword(!showNewUserPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                          >
                            {showNewUserPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                          </button>
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Role</label>
                        <select
                          value={newUserRole}
                          onChange={e => setNewUserRole(e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-brand-500"
                        >
                          <option value="customer">Customer</option>
                          <option value="staff">Staff</option>
                          <option value="rider">Rider</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={isLoadingUsers}
                        className="bg-brand-600 hover:bg-brand-700 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-sm transition-all disabled:opacity-50"
                      >
                        {isLoadingUsers ? 'Creating...' : 'Create User'}
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {isLoadingUsers ? (
              <div className="py-8 text-center text-slate-500 font-medium animate-pulse">Loading users...</div>
            ) : users.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {users.map(user => (
                  <div key={user.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-bold text-slate-900 text-lg">{user.name}</h4>
                        <p className="text-slate-500 text-sm mb-1">{user.email}</p>
                        {user.password && <p className="text-slate-400 font-mono text-xs mb-2">Password: {user.password}</p>}
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs font-bold text-slate-500 uppercase">Role:</span>
                          <select 
                            value={user.role} 
                            onChange={(e) => handleUpdateRole(user.id, e.target.value)}
                            className="bg-white border border-slate-200 text-slate-800 text-xs rounded-lg px-2 py-1 font-bold outline-none focus:ring-1 focus:ring-brand-500"
                          >
                            <option value="customer">Customer</option>
                            <option value="staff">Staff</option>
                            <option value="rider">Rider</option>
                            <option value="admin">Admin</option>
                          </select>
                          {!user.isApproved && <span className="ml-2 bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-md font-bold uppercase tracking-wider">Pending</span>}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-500 font-medium mb-1">Balance</div>
                        <div className="text-2xl font-bold text-brand-600 font-display">${(user.balance || 0).toFixed(2)}</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mt-2 pt-4 border-t border-slate-200">
                      {!user.isApproved && (
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all flex items-center gap-2 mr-auto"
                        >
                          <UserCheck size={16} /> Approve
                        </button>
                      )}
                      
                      <div className="flex gap-2 ml-auto">
                        <input 
                          type="number"
                          placeholder="Amount"
                          value={topUpAmount[user.id] || ''}
                          onChange={(e) => setTopUpAmount({ ...topUpAmount, [user.id]: e.target.value })}
                          className="w-24 px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-500"
                        />
                        <button
                          onClick={() => handleTopUp(user.id, user.balance || 0)}
                          className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-md shadow-brand-500/20 transition-all whitespace-nowrap"
                        >
                          Top Up
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 font-medium">
                No users found.
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
