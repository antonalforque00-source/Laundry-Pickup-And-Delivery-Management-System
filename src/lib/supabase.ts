import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);

export const hasValidSupabaseKeys = Boolean(env.VITE_SUPABASE_URL && env.VITE_SUPABASE_ANON_KEY);
