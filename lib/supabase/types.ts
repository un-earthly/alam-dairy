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
        Relationships: []
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
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          user_id: string | null
          order_number: string | null
          access_token: string
          contact_phone: string | null
          contact_email: string | null
          delivery_fee: number
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
        Relationships: [
          {
            foreignKeyName: 'orders_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
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
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            isOneToOne: false
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      create_order: {
        Args: {
          p_user_id: string | null
          p_address: Json
          p_payment_method: string
          p_notes: string | null
          p_contact_phone: string
          p_contact_email: string | null
          p_items: Json
        }
        Returns: {
          order_id: string
          order_number: string
          access_token: string
        }[]
      }
      is_staff: {
        Args: Record<string, never>
        Returns: boolean
      }
    }
    Enums: Record<string, never>
  }
}
