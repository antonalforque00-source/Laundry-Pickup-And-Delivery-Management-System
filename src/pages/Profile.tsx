import React from 'react';
import { User } from '../types';
import { motion } from 'motion/react';
import { UserCircle, Mail, Phone, MapPin, Shield } from 'lucide-react';

interface ProfileProps {
  user: User;
}

export default function Profile({ user }: ProfileProps) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-slate-900 font-display">My Profile</h2>
        <p className="text-slate-500 mt-1 text-lg">Manage your account information and preferences.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-8 border border-slate-200/60 shadow-xl shadow-slate-200/40 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100 rounded-full blur-3xl opacity-50 -mr-20 -mt-20 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-6 mb-10">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-bold text-4xl font-display shadow-lg shadow-brand-500/30">
              {user.name.charAt(0)}
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900 font-display">{user.name}</h3>
              <div className="flex items-center gap-2 mt-2">
                <span className="px-3 py-1 bg-brand-50 text-brand-700 text-xs font-bold rounded-full uppercase tracking-wider">
                  {user.role}
                </span>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider flex items-center gap-1">
                  <Shield size={12} />
                  Verified
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <UserCircle size={16} /> Full Name
                </label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-medium text-slate-900">
                  {user.name}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                  <Mail size={16} /> Email Address
                </label>
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 font-medium text-slate-900">
                  {user.email}
                </div>
              </div>
            </div>
          </div>
          
          <div className="mt-10 pt-8 border-t border-slate-100">
             <button className="px-6 py-3 bg-brand-600 hover:bg-brand-700 text-white font-bold rounded-xl shadow-lg shadow-brand-600/20 transition-all active:scale-95">
               Edit Profile
             </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
