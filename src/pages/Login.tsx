import React, { useState } from 'react';
import { Waves, Lock, Mail, ArrowRight, User as UserIcon, Eye, EyeOff, ChevronLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { User } from '../types';
import { supabase, hasValidSupabaseKeys } from '../lib/supabase';

interface LoginProps {
  onLogin: (user: User) => Promise<boolean | void> | void;
}

type AuthStep = 'welcome' | 'login' | 'signup';

export default function Login({ onLogin }: LoginProps) {
  const [step, setStep] = useState<AuthStep>('welcome');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (step === 'signup' && password !== confirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setErrorMsg('');
    
    try {
      let loggedUser: User;
      let assignedRole: 'customer' | 'staff' | 'rider' | 'admin' = 'customer';
      
      if (email.toLowerCase().includes('admin')) {
        assignedRole = 'admin';
      } else if (email.toLowerCase().includes('staff')) {
        assignedRole = 'staff';
      } else if (email.toLowerCase().includes('rider')) {
        assignedRole = 'rider';
      }

      if (hasValidSupabaseKeys) {
        if (step === 'signup') {
          // Check if user already exists in our table
          const { data: existingUsers, error: checkError } = await supabase
            .from('users')
            .select('*')
            .eq('email', email);

          if (checkError) {
             throw new Error('Database error checking for existing user.');
          }

          if (existingUsers && existingUsers.length > 0) {
            throw new Error('User with this email already exists.');
          }

          let prefix = 'CUS';
          if (assignedRole === 'admin') prefix = 'ADM';
          if (assignedRole === 'staff') prefix = 'STF';
          if (assignedRole === 'rider') prefix = 'RDR';
          
          const userId = `${prefix}-${Math.floor(Math.random() * 10000)}`;
          
          // Automatically put inside the public.users table
          const { data: insertData, error: insertError } = await supabase
            .from('users')
            .insert({
              id: userId,
              name: name || 'New User',
              email: email,
              role: assignedRole,
              password: password,
              is_approved: true
            })
            .select()
            .single();
            
          if (insertError) {
             console.error("Failed to insert into public.users:", insertError);
             throw new Error('Failed to create user record.');
          }
          
          loggedUser = {
            id: userId,
            name: name || 'New User',
            email: email,
            role: assignedRole,
            balance: 0,
            password: password
          };
        } else {
          // Fetch the latest user info from the public.users table
          const { data: dbUser, error: dbError } = await supabase
            .from('users')
            .select('*')
            .ilike('email', email)
            .single();

          if (dbError || !dbUser) {
            throw new Error('User not found. Please check your email.');
          }
          
          // If a password is set in the DB, verify it
          if (dbUser.password && dbUser.password !== password) {
            throw new Error('Invalid password.');
          } else if (!dbUser.password) {
             // If they created the user before we started saving passwords, let's save this one
             await supabase.from('users').update({ password }).eq('id', dbUser.id);
             dbUser.password = password;
          }

          loggedUser = {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            role: dbUser.role,
            balance: dbUser.balance,
            password: dbUser.password
          };
        }
      } else {
        loggedUser = {
          id: `CUS-${Math.floor(Math.random() * 10000)}`,
          name: step === 'login' ? email.split('@')[0] : name || 'New User',
          email,
          role: assignedRole,
          balance: 0
        };
      }

      await onLogin(loggedUser);
    } catch (err: any) {
      let errorMessage = err.message || 'An error occurred during authentication';
      if (errorMessage.toLowerCase().includes('rate limit')) {
        errorMessage = 'Sign up rate limit exceeded by the database. Please try again later or use an existing account.';
      }
      setErrorMsg(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex justify-center relative overflow-hidden font-sans">
      {/* Animated gradient background elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-brand-400/20 blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute top-[20%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-300/20 blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-[20%] left-[20%] w-[80%] h-[80%] rounded-full bg-brand-200/20 blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="w-full max-w-md relative z-10 flex flex-col h-screen">
        <AnimatePresence mode="wait">
          {step === 'welcome' && (
            <motion.div 
              key="welcome"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center px-6"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl shadow-brand-100/50 border border-white">
                <div className="flex flex-col items-center text-center mb-10">
                  <div className="bg-gradient-to-br from-brand-500 to-brand-700 p-4 rounded-3xl text-white shadow-xl shadow-brand-500/30 mb-6">
                    <Waves size={40} strokeWidth={2.5} />
                  </div>
                  <h1 className="text-4xl font-bold tracking-tight text-slate-900 font-display">
                    Pure<span className="text-brand-600">Drop</span>
                  </h1>
                  <p className="text-slate-500 font-medium mt-2 text-lg">
                    Premium Laundry Services
                  </p>
                </div>

                <div className="mb-10 text-center">
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-3 tracking-tight">
                    Welcome
                  </h2>
                  <p className="text-slate-500 font-medium text-base leading-relaxed">
                    Discover amazing laundry services and get your fresh clothes delivered to your door.
                  </p>
                </div>
                
                <button
                  onClick={() => setStep('signup')}
                  className="w-full bg-brand-600 hover:bg-brand-700 text-white py-4 rounded-2xl font-bold text-lg transition-all shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2"
                >
                  Get Started <ArrowRight size={20} />
                </button>
                
                <div className="mt-8 text-center">
                  <span className="text-slate-500 font-medium">Already have an account? </span>
                  <button onClick={() => setStep('login')} className="text-brand-600 font-bold hover:underline">
                    Sign in
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {(step === 'login' || step === 'signup') && (
             <motion.div 
              key="auth"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex-1 flex flex-col justify-center px-6 h-full py-8"
            >
              <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-100/50 border border-white overflow-y-auto custom-scrollbar max-h-full">
                <button 
                  onClick={() => setStep('welcome')}
                  className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-xl flex items-center justify-center text-slate-600 mb-6 transition-colors"
                >
                  <ChevronLeft size={24} />
                </button>

                <h2 className="text-3xl font-extrabold text-slate-900 mb-8 tracking-tight">
                  {step === 'signup' ? 'Sign up' : 'Sign in'}
                  <div className="w-10 h-1 bg-brand-500 mt-2 rounded-full" />
                </h2>

                {errorMsg && (
                  <div className={`p-4 rounded-xl text-sm font-medium border mb-6 flex items-start gap-2 ${
                    errorMsg.includes('successful') 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                      : 'bg-rose-50 text-rose-700 border-rose-200'
                  }`}>
                    <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${errorMsg.includes('successful') ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                    <span className="leading-relaxed">{errorMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {step === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Full Name</label>
                      <div className="relative">
                        <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          required
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal transition-all"
                          placeholder="Anton Alforque"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        required
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal transition-all"
                        placeholder={step === 'signup' ? 'Anton@yahoo.com' : 'Antonalforque@yahoo.com'}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-700 ml-1">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal transition-all"
                        placeholder="Enter your password"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 focus:outline-none transition-colors"
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {step === 'signup' && (
                    <div className="space-y-1.5">
                      <label className="text-sm font-bold text-slate-700 ml-1">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                          required
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-brand-500 outline-none font-medium text-slate-700 placeholder:text-slate-400 placeholder:font-normal transition-all"
                          placeholder="Confirm your password"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-brand-600 focus:outline-none transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-slate-900 hover:bg-slate-800 text-white py-4 rounded-2xl font-bold text-base transition-all shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      step === 'signup' ? 'Create Account' : 'Secure Login'
                    )}
                  </button>
                </form>
                
                <div className="mt-8 text-center">
                  <span className="text-slate-500 font-medium text-sm">
                    {step === 'signup' ? 'Already have an account? ' : "Don't have an account? "}
                  </span>
                  <button 
                    onClick={() => setStep(step === 'signup' ? 'login' : 'signup')} 
                    className="text-brand-600 font-bold hover:underline text-sm"
                  >
                    {step === 'signup' ? 'Sign in' : 'Sign up'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
