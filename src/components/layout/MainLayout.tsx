import React, { useState, useEffect } from 'react';
import { Waves, LogOut, Home, PlusCircle, ClipboardList, LayoutDashboard, Package, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../../types';
import { supabase, hasValidSupabaseKeys } from '../../lib/supabase';

interface MainLayoutProps {
  children: React.ReactNode;
  user: User;
  currentTab: string;
  onTabChange: (tab: string) => void;
  onLogout: () => void;
}

export default function MainLayout({ children, user, currentTab, onTabChange, onLogout }: MainLayoutProps) {
  const isCustomer = user.role === 'customer';
  const [balance, setBalance] = useState(user.balance || 0);

  useEffect(() => {
    if (!hasValidSupabaseKeys || !isCustomer) return;

    const fetchBalance = async () => {
      const { data } = await supabase.from('users').select('balance').eq('id', user.id).single();
      if (data && typeof data.balance === 'number') {
        setBalance(data.balance);
      }
    };

    fetchBalance();
    
    // Set up real-time subscription or poll every 15s to keep it fresh
    const interval = setInterval(fetchBalance, 15000);
    return () => clearInterval(interval);
  }, [user.id, isCustomer]);

  const customerTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'new', label: 'New Order', icon: PlusCircle },
    { id: 'orders', label: 'My Orders', icon: ClipboardList },
    { id: 'profile', label: 'Profile', icon: UserCircle },
  ];

  const riderTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'pickups', label: 'Pickups', icon: ClipboardList },
    { id: 'deliveries', label: 'Deliveries', icon: Package },
  ];

  const staffTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'processing', label: 'Processing', icon: Waves },
    { id: 'inventory', label: 'Inventory', icon: ClipboardList },
  ];

  const adminTabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'orders', label: 'Manage Orders', icon: ClipboardList },
  ];

  let tabs;
  if (user.role === 'customer') tabs = customerTabs;
  else if (user.role === 'admin') tabs = adminTabs;
  else if (user.role === 'rider') tabs = riderTabs;
  else tabs = staffTabs;

  return (
    <div className="min-h-screen flex flex-col md:flex-row relative overflow-hidden">
      {/* Animated gradient background elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-400/10 blur-3xl mix-blend-multiply opacity-50 animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-300/10 blur-3xl mix-blend-multiply opacity-50 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-brand-200/10 blur-3xl mix-blend-multiply opacity-50 animate-blob animation-delay-4000"></div>
      </div>
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white/80 backdrop-blur-xl border-r border-slate-200/50 shadow-sm z-20 h-screen sticky top-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2.5 rounded-2xl text-white shadow-lg shadow-brand-500/30">
            <Waves size={24} strokeWidth={2.5} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 font-display">
            Pure<span className="text-brand-600">Drop</span>
          </h1>
        </div>
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8 bg-slate-50 p-3 rounded-2xl border border-slate-100 relative">
            <div className="w-10 h-10 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-lg font-display">
              {user.name.charAt(0)}
            </div>
            <div className="overflow-hidden flex-1">
              <p className="font-bold text-slate-900 truncate">{user.name}</p>
              <div className="flex justify-between items-center mt-0.5">
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{user.role}</p>
                {user.role === 'customer' && (
                  <span className="text-[11px] font-bold text-brand-600 bg-brand-100/50 px-2 py-0.5 rounded-full">
                    ₱{balance.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
          </div>

          <nav className="space-y-2 flex-1">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = currentTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all duration-300 relative ${
                    isActive ? 'text-brand-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  {isActive && (
                    <motion.div 
                      layoutId="sidebar-active"
                      className="absolute inset-0 bg-brand-50 border border-brand-100 rounded-2xl"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <Icon size={20} className="relative z-10" />
                  <span className="relative z-10">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-slate-100">
          <button 
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Top Header (Mobile) */}
      <header className="md:hidden bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-200/50 sticky top-0 z-20 px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-2 rounded-xl text-white shadow-md shadow-brand-500/30">
            <Waves size={20} strokeWidth={2.5} />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 font-display">
            Pure<span className="text-brand-600">Drop</span>
          </h1>
        </div>
        <button onClick={onLogout} className="p-2 text-slate-400 hover:text-slate-800 bg-slate-50 rounded-full">
          <LogOut size={18} />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full relative z-10 overflow-y-auto pb-24 md:pb-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Bottom Tab Bar (Mobile) - Expo Router style */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-slate-200/50 pb-safe z-30 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <nav className="flex justify-around items-center px-2 py-2">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`flex flex-col items-center justify-center w-full py-2 px-1 relative transition-colors ${
                  isActive ? 'text-brand-600' : 'text-slate-400'
                }`}
              >
                {isActive && (
                  <motion.div 
                    layoutId="tab-active-indicator"
                    className="absolute top-0 w-10 h-1 bg-brand-500 rounded-full"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <div className={`p-1.5 rounded-xl transition-all duration-300 ${isActive ? 'bg-brand-50 scale-110' : ''}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <span className={`text-[10px] mt-1 font-bold ${isActive ? 'text-brand-700' : 'font-semibold'}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
