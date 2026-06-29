import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

const env = (import.meta as any).env || {};
const supabaseUrl = env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey);

export const hasValidSupabaseKeys = Boolean(supabaseUrl && supabaseAnonKey);
