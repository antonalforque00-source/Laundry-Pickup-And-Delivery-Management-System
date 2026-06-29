export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          name: string
          email: string
          role: string
          balance: number
          phone: string | null
          address: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          role?: string
          balance?: number
          phone?: string | null
          address?: string | null
          is_approved?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          role?: string
          balance?: number
          phone?: string | null
          address?: string | null
          is_approved?: boolean
          created_at?: string
        }
      }
      orders: {
        Row: {
          id: string
          customer_id: string
          customer_name: string
          address: string
          phone: string
          service_type: string
          status: string
          pickup_date: string
          price: number | null
          weight: number | null
          special_instructions: string | null
          payment_method: string | null
          rider_id: string | null
          staff_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          customer_id: string
          customer_name: string
          address: string
          phone: string
          service_type: string
          status?: string
          pickup_date: string
          price?: number | null
          weight?: number | null
          special_instructions?: string | null
          payment_method?: string | null
          rider_id?: string | null
          staff_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          customer_id?: string
          customer_name?: string
          address?: string
          phone?: string
          service_type?: string
          status?: string
          pickup_date?: string
          price?: number | null
          weight?: number | null
          special_instructions?: string | null
          payment_method?: string | null
          rider_id?: string | null
          staff_id?: string | null
          created_at?: string
        }
      }
      alerts: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          date: string
          is_read: boolean
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          date: string
          is_read?: boolean
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          date?: string
          is_read?: boolean
        }
      }
      inventory: {
        Row: {
          id: string
          name: string
          quantity: number
          unit: string
          low_stock_threshold: number
        }
        Insert: {
          id?: string
          name: string
          quantity: number
          unit: string
          low_stock_threshold: number
        }
        Update: {
          id?: string
          name?: string
          quantity?: number
          unit?: string
          low_stock_threshold?: number
        }
      }
    }
  }
}
