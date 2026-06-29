import React, { useState } from 'react';
import { Order, User } from '../types';
import { Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface NewOrderProps {
  user: User;
  onAddOrder: (order: Omit<Order, 'id' | 'status' | 'customerId'>) => void;
  onSuccess: () => void;
}

export default function NewOrder({ user, onAddOrder, onSuccess }: NewOrderProps) {
  const [formData, setFormData] = useState({
    customerName: user.name,
    address: '',
    phone: '',
    serviceType: 'Wash & Fold',
    pickupDate: '',
    paymentMethod: 'Cash on Delivery',
    specialInstructions: '',
    estimatedWeight: 5
  });

  const pricePerKilo = 45; // Base price per kilo in PHP

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderData = {
      ...formData,
      weight: formData.estimatedWeight,
      price: formData.estimatedWeight * pricePerKilo
    };
    onAddOrder(orderData);
    onSuccess();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-slate-900 font-display">Schedule Pickup</h2>
        <p className="text-slate-500 mt-1 text-lg">Book a new laundry service and we'll handle the rest.</p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-6 sm:p-8 rounded-3xl shadow-xl shadow-brand-100/50 border border-brand-100"
      >
        <div className="flex items-center gap-3 mb-8">
          <div className="p-3 bg-brand-50 rounded-xl">
            <Sparkles className="text-brand-600" size={24} />
          </div>
          <h3 className="text-xl font-bold text-slate-900 font-display">Transaction Details</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Full Name</label>
            <input
              required
              type="text"
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="John Doe"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Phone Number</label>
            <input
              required
              type="tel"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="(555) 123-4567"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Pickup & Delivery Address</label>
            <input
              required
              type="text"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="123 Main St, Apt 4B"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Service Type</label>
            <select
              value={formData.serviceType}
              onChange={e => setFormData({...formData, serviceType: e.target.value})}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-semibold text-slate-800"
            >
              <option>Wash & Fold</option>
              <option>Wash & Dry</option>
              <option>Dry Cleaning</option>
              <option>Ironing Only</option>
              <option>Premium Care</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-700">Preferred Pickup Date</label>
            <input
              required
              type="date"
              value={formData.pickupDate}
              onChange={e => setFormData({...formData, pickupDate: e.target.value})}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all text-slate-800 font-medium"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Estimated Weight (kg)</label>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
              <div className="flex justify-between items-end mb-4">
                <div>
                  <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Load Size</p>
                  <p className="font-bold text-slate-800">
                    {formData.estimatedWeight <= 5 ? 'Small Load (1-5 kg)' : 
                     formData.estimatedWeight <= 10 ? 'Medium Load (6-10 kg)' : 
                     formData.estimatedWeight <= 15 ? 'Large Load (11-15 kg)' : 'Extra Large (15+ kg)'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-display font-bold text-brand-600">{formData.estimatedWeight}</span>
                  <span className="text-sm font-semibold text-slate-500 ml-1">kg</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="1"
                value={formData.estimatedWeight}
                onChange={e => setFormData({...formData, estimatedWeight: parseInt(e.target.value)})}
                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
              />
              <div className="flex justify-between text-xs text-slate-400 mt-2 font-medium">
                <span>1 kg</span>
                <span>25 kg</span>
              </div>
            </div>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Payment Method</label>
            <select
              value={formData.paymentMethod}
              onChange={e => setFormData({...formData, paymentMethod: e.target.value})}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-semibold text-slate-800"
            >
              <option>Cash on Delivery</option>
              <option>GCash</option>
              <option>Maya</option>
              <option>Credit/Debit Card</option>
            </select>
          </div>
          <div className="space-y-2 md:col-span-2">
            <label className="text-sm font-semibold text-slate-700">Special Instructions</label>
            <textarea
              value={formData.specialInstructions}
              onChange={e => setFormData({...formData, specialInstructions: e.target.value})}
              className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all placeholder:text-slate-400 font-medium"
              placeholder="e.g. Please handle with care, separate whites."
              rows={3}
            />
          </div>
          
          <div className="md:col-span-2 mt-6 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500 font-medium mb-1">Estimated Total (~{formData.estimatedWeight} kg)</p>
              <p className="text-2xl font-bold text-slate-900 font-display">₱{(formData.estimatedWeight * pricePerKilo).toFixed(2)}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full sm:w-auto bg-slate-900 text-white px-8 py-3.5 rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-xl shadow-slate-900/20 text-lg"
            >
              Confirm Transaction
            </motion.button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
