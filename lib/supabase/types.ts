export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type ProductType = 'dairy' | 'feed' | 'cattle' | 'equipment' | 'vet_supply'
export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'dispatched' | 'delivered' | 'cancelled'
export type UserRole = 'customer' | 'farmer' | 'admin' | 'staff'
export type PaymentMethod = 'bkash' | 'nagad' | 'card' | 'cod' | 'bank_transfer'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          phone: string | null
          email: string | null
          full_name: string | null
          role: UserRole
          is_farmer: boolean
          credit_limit: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'created_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      products: {
        Row: {
          id: string
          slug: string
          name_bn: string
          name_en: string
          description_bn: string | null
          description_en: string | null
          type: ProductType
          price: number
          sale_price: number | null
          unit: string
          stock: number
          is_active: boolean
          images: string[]
          tags: string[]
          meta: Json
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          status: OrderStatus
          total: number
          payment_method: PaymentMethod
          payment_status: PaymentStatus
          address: Json
          notes: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['orders']['Insert']>
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          unit_price: number
          total: number
        }
        Insert: Omit<Database['public']['Tables']['order_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['order_items']['Insert']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
