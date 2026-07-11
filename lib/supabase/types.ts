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
export type SubscriptionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly'
export type SubscriptionStatus = 'active' | 'paused' | 'cancelled'
export type RelationType = 'related' | 'cross_sell' | 'upsell'

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
          category_id: string | null
          brand_id: string | null
          has_variants: boolean
          subscription_eligible: boolean
          allow_backorder: boolean
          preorder_release_date: string | null
          seo_title_bn: string | null
          seo_title_en: string | null
          seo_description_bn: string | null
          seo_description_en: string | null
          og_image_url: string | null
          vendor_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['products']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['products']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'products_category_id_fkey'
            columns: ['category_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'products_brand_id_fkey'
            columns: ['brand_id']
            isOneToOne: false
            referencedRelation: 'brands'
            referencedColumns: ['id']
          },
        ]
      }
      categories: {
        Row: {
          id: string
          slug: string
          parent_id: string | null
          name_bn: string
          name_en: string
          description_bn: string | null
          description_en: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['categories']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['categories']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'categories_parent_id_fkey'
            columns: ['parent_id']
            isOneToOne: false
            referencedRelation: 'categories'
            referencedColumns: ['id']
          },
        ]
      }
      brands: {
        Row: {
          id: string
          slug: string
          name: string
          logo_url: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['brands']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['brands']['Insert']>
        Relationships: []
      }
      product_media: {
        Row: {
          id: string
          product_id: string
          url: string
          alt_bn: string | null
          alt_en: string | null
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_media']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_media']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'product_media_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      product_variants: {
        Row: {
          id: string
          product_id: string
          sku: string | null
          name_bn: string
          name_en: string
          attributes: Json
          price: number
          sale_price: number | null
          stock: number
          is_active: boolean
          sort_order: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_variants']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_variants']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'product_variants_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      bulk_pricing_tiers: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          min_qty: number
          price: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bulk_pricing_tiers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bulk_pricing_tiers']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'bulk_pricing_tiers_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bulk_pricing_tiers_variant_id_fkey'
            columns: ['variant_id']
            isOneToOne: false
            referencedRelation: 'product_variants'
            referencedColumns: ['id']
          },
        ]
      }
      product_reviews: {
        Row: {
          id: string
          product_id: string
          user_id: string | null
          order_item_id: string | null
          rating: number
          title: string | null
          body: string | null
          is_approved: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_reviews']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_reviews']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'product_reviews_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'product_reviews_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      related_products: {
        Row: {
          product_id: string
          related_product_id: string
          relation_type: RelationType
          sort_order: number
        }
        Insert: Database['public']['Tables']['related_products']['Row']
        Update: Partial<Database['public']['Tables']['related_products']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'related_products_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'related_products_related_product_id_fkey'
            columns: ['related_product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      product_subscription_plans: {
        Row: {
          id: string
          product_id: string
          variant_id: string | null
          frequency: SubscriptionFrequency
          discount_percent: number
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['product_subscription_plans']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['product_subscription_plans']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'product_subscription_plans_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string | null
          product_id: string
          variant_id: string | null
          frequency: SubscriptionFrequency
          quantity: number
          discount_percent: number
          unit_price: number
          status: SubscriptionStatus
          next_billing_date: string
          skip_next_cycle: boolean
          paused_at: string | null
          cancelled_at: string | null
          address: Json
          payment_method: PaymentMethod
          contact_phone: string | null
          contact_email: string | null
          last_order_id: string | null
          last_renewal_status: 'success' | 'failed' | null
          last_renewal_error: string | null
          last_renewal_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'subscriptions_product_id_fkey'
            columns: ['product_id']
            isOneToOne: false
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'subscriptions_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
        ]
      }
      subscription_orders: {
        Row: {
          id: string
          subscription_id: string
          order_id: string | null
          cycle_date: string
          skipped: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscription_orders']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['subscription_orders']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'subscription_orders_subscription_id_fkey'
            columns: ['subscription_id']
            isOneToOne: false
            referencedRelation: 'subscriptions'
            referencedColumns: ['id']
          },
        ]
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
          coupon_id: string | null
          discount_total: number
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
          variant_id: string | null
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
      coupons: {
        Row: {
          id: string
          code: string
          type: 'percent' | 'fixed'
          value: number
          min_order_total: number
          starts_at: string | null
          ends_at: string | null
          usage_limit: number | null
          per_user_limit: number | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupons']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['coupons']['Insert']>
        Relationships: []
      }
      coupon_redemptions: {
        Row: {
          id: string
          coupon_id: string
          order_id: string | null
          user_id: string | null
          redeemed_at: string
        }
        Insert: Omit<Database['public']['Tables']['coupon_redemptions']['Row'], 'id' | 'redeemed_at'>
        Update: Partial<Database['public']['Tables']['coupon_redemptions']['Insert']>
        Relationships: []
      }
      wishlists: {
        Row: {
          id: string
          user_id: string
          product_id: string
          variant_id: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['wishlists']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['wishlists']['Insert']>
        Relationships: []
      }
      loyalty_accounts: {
        Row: {
          user_id: string
          points_balance: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['loyalty_accounts']['Row'], 'updated_at'>
        Update: Partial<Database['public']['Tables']['loyalty_accounts']['Insert']>
        Relationships: []
      }
      loyalty_ledger: {
        Row: {
          id: string
          user_id: string
          order_id: string | null
          points_delta: number
          reason: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['loyalty_ledger']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['loyalty_ledger']['Insert']>
        Relationships: []
      }
      gift_cards: {
        Row: {
          id: string
          code: string
          initial_value: number
          balance: number
          is_active: boolean
          issued_to_user_id: string | null
          expires_at: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['gift_cards']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['gift_cards']['Insert']>
        Relationships: []
      }
      gift_card_redemptions: {
        Row: {
          id: string
          gift_card_id: string
          order_id: string | null
          amount: number
          redeemed_at: string
        }
        Insert: Omit<Database['public']['Tables']['gift_card_redemptions']['Row'], 'id' | 'redeemed_at'>
        Update: Partial<Database['public']['Tables']['gift_card_redemptions']['Insert']>
        Relationships: []
      }
      flash_sales: {
        Row: {
          id: string
          name: string
          starts_at: string
          ends_at: string
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['flash_sales']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['flash_sales']['Insert']>
        Relationships: []
      }
      flash_sale_products: {
        Row: {
          id: string
          flash_sale_id: string
          product_id: string
          variant_id: string | null
          sale_price: number
        }
        Insert: Omit<Database['public']['Tables']['flash_sale_products']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['flash_sale_products']['Insert']>
        Relationships: []
      }
      bundles: {
        Row: {
          id: string
          slug: string
          name_bn: string
          name_en: string
          price: number | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bundles']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bundles']['Insert']>
        Relationships: []
      }
      bundle_items: {
        Row: {
          id: string
          bundle_id: string
          product_id: string
          variant_id: string | null
          quantity: number
        }
        Insert: Omit<Database['public']['Tables']['bundle_items']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['bundle_items']['Insert']>
        Relationships: []
      }
      warehouses: {
        Row: {
          id: string
          name: string
          address: Json
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['warehouses']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['warehouses']['Insert']>
        Relationships: []
      }
      inventory_levels: {
        Row: {
          id: string
          warehouse_id: string
          product_id: string
          variant_id: string | null
          stock: number
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['inventory_levels']['Row'], 'id' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['inventory_levels']['Insert']>
        Relationships: []
      }
      vendors: {
        Row: {
          id: string
          profile_id: string
          business_name: string
          commission_percent: number
          is_approved: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['vendors']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['vendors']['Insert']>
        Relationships: []
      }
      b2b_price_lists: {
        Row: {
          id: string
          profile_id: string | null
          role: string | null
          product_id: string
          variant_id: string | null
          price: number
          min_qty: number
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['b2b_price_lists']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['b2b_price_lists']['Insert']>
        Relationships: []
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
          // Each item: { id: string; variant_id?: string; quantity: number }
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
      create_subscription: {
        Args: {
          p_user_id: string | null
          p_product_id: string
          p_variant_id: string | null
          p_quantity: number
          p_frequency: SubscriptionFrequency
          p_address: Json
          p_payment_method: string
          p_contact_phone: string | null
          p_contact_email: string | null
        }
        Returns: {
          subscription_id: string
          order_id: string | null
          order_number: string | null
          access_token: string | null
        }[]
      }
      process_subscription_renewal: {
        Args: {
          p_subscription_id: string
          p_strict?: boolean
        }
        Returns: {
          order_id: string | null
          order_number: string | null
          access_token: string | null
          skipped: boolean
          failed: boolean
          error_reason: string | null
        }[]
      }
      process_due_subscriptions: {
        Args: Record<string, never>
        Returns: {
          subscription_id: string
          order_id: string | null
          skipped: boolean
          failed: boolean
          error_reason: string | null
        }[]
      }
    }
    Enums: Record<string, never>
  }
}
