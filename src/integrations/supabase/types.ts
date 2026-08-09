export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          content: Json | null
          created_at: string | null
          id: string
          insight_type: string | null
          user_id: string | null
        }
        Insert: {
          content?: Json | null
          created_at?: string | null
          id?: string
          insight_type?: string | null
          user_id?: string | null
        }
        Update: {
          content?: Json | null
          created_at?: string | null
          id?: string
          insight_type?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      companion_settings: {
        Row: {
          created_at: string
          enabled: boolean
          frequency: string
          id: string
          last_sent_at: string | null
          notify_listings: boolean
          notify_occasions: boolean
          notify_orders: boolean
          updated_at: string
          user_id: string
          whatsapp_phone: string | null
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent_at?: string | null
          notify_listings?: boolean
          notify_occasions?: boolean
          notify_orders?: boolean
          updated_at?: string
          user_id: string
          whatsapp_phone?: string | null
        }
        Update: {
          created_at?: string
          enabled?: boolean
          frequency?: string
          id?: string
          last_sent_at?: string | null
          notify_listings?: boolean
          notify_occasions?: boolean
          notify_orders?: boolean
          updated_at?: string
          user_id?: string
          whatsapp_phone?: string | null
        }
        Relationships: []
      }
      currency_rates: {
        Row: {
          id: string
          rate: number
          updated_at: string | null
        }
        Insert: {
          id: string
          rate: number
          updated_at?: string | null
        }
        Update: {
          id?: string
          rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      escrow_transactions: {
        Row: {
          buyer_id: string | null
          created_at: string
          deposit_amount: number
          id: string
          order_id: string
          payment_method: string
          platform_share: number
          released_at: string | null
          seller_id: string | null
          shipper_id: string | null
          shipper_share: number
          status: string
          total_amount: number
          updated_at: string
          vendor_share: number
        }
        Insert: {
          buyer_id?: string | null
          created_at?: string
          deposit_amount?: number
          id?: string
          order_id: string
          payment_method: string
          platform_share?: number
          released_at?: string | null
          seller_id?: string | null
          shipper_id?: string | null
          shipper_share?: number
          status?: string
          total_amount?: number
          updated_at?: string
          vendor_share?: number
        }
        Update: {
          buyer_id?: string | null
          created_at?: string
          deposit_amount?: number
          id?: string
          order_id?: string
          payment_method?: string
          platform_share?: number
          released_at?: string | null
          seller_id?: string | null
          shipper_id?: string | null
          shipper_share?: number
          status?: string
          total_amount?: number
          updated_at?: string
          vendor_share?: number
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: []
      }
      integration_keys: {
        Row: {
          api_key: string
          created_at: string
          id: string
          is_active: boolean
          label: string | null
          meta: Json
          provider: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          meta?: Json
          provider: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          meta?: Json
          provider?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          created_at: string
          deposit_amount: number | null
          discount_amount: number | null
          due_on_delivery: number | null
          id: string
          items: Json
          order_id: string
          payment_method: string
          paypal_capture_id: string | null
          paypal_order_id: string | null
          platform_fee: number | null
          shipping_info: Json
          status: string
          subtotal: number
          total: number
          updated_at: string
          user_id: string | null
          vendor_id: string | null
          vendor_share: number | null
        }
        Insert: {
          created_at?: string
          deposit_amount?: number | null
          discount_amount?: number | null
          due_on_delivery?: number | null
          id?: string
          items: Json
          order_id: string
          payment_method: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          platform_fee?: number | null
          shipping_info: Json
          status?: string
          subtotal: number
          total: number
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
          vendor_share?: number | null
        }
        Update: {
          created_at?: string
          deposit_amount?: number | null
          discount_amount?: number | null
          due_on_delivery?: number | null
          id?: string
          items?: Json
          order_id?: string
          payment_method?: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          platform_fee?: number | null
          shipping_info?: Json
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
          vendor_share?: number | null
        }
        Relationships: []
      }
      products: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          id: string
          image: string | null
          is_featured: boolean | null
          is_new: boolean | null
          name: string
          price: number
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name: string
          price: number
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image?: string | null
          is_featured?: boolean | null
          is_new?: boolean | null
          name?: string
          price?: number
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          document_url: string | null
          email: string
          facebook_url: string | null
          full_name: string
          home_address: string | null
          id: string
          instagram_url: string | null
          is_verified: boolean
          phone: string | null
          referral_code: string | null
          referral_product_rewarded: boolean
          referred_by: string | null
          referred_product_id: string | null
          referred_units_counter: number
          subscription_expires_at: string | null
          subscription_tier: string
          twitter_url: string | null
          updated_at: string
          user_id: string
          verification_status: string | null
          verified_at: string | null
        }
        Insert: {
          account_type?: string
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          document_url?: string | null
          email: string
          facebook_url?: string | null
          full_name: string
          home_address?: string | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean
          phone?: string | null
          referral_code?: string | null
          referral_product_rewarded?: boolean
          referred_by?: string | null
          referred_product_id?: string | null
          referred_units_counter?: number
          subscription_expires_at?: string | null
          subscription_tier?: string
          twitter_url?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Update: {
          account_type?: string
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          document_url?: string | null
          email?: string
          facebook_url?: string | null
          full_name?: string
          home_address?: string | null
          id?: string
          instagram_url?: string | null
          is_verified?: boolean
          phone?: string | null
          referral_code?: string | null
          referral_product_rewarded?: boolean
          referred_by?: string | null
          referred_product_id?: string | null
          referred_units_counter?: number
          subscription_expires_at?: string | null
          subscription_tier?: string
          twitter_url?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
          verified_at?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          bonus_awarded: boolean | null
          created_at: string
          id: string
          product_id: string
          recipient_email: string
          recommender_id: string
        }
        Insert: {
          bonus_awarded?: boolean | null
          created_at?: string
          id?: string
          product_id: string
          recipient_email: string
          recommender_id: string
        }
        Update: {
          bonus_awarded?: boolean | null
          created_at?: string
          id?: string
          product_id?: string
          recipient_email?: string
          recommender_id?: string
        }
        Relationships: []
      }
      referral_rewards: {
        Row: {
          amount: number
          created_at: string
          id: string
          order_id: string | null
          referred_user_id: string
          referrer_id: string
          reward_type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          referred_user_id: string
          referrer_id: string
          reward_type: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
          referred_user_id?: string
          referrer_id?: string
          reward_type?: string
        }
        Relationships: []
      }
      reminders: {
        Row: {
          created_at: string
          id: string
          occasion_date: string
          occasion_name: string
          product_id: string
          product_name: string
          recipient_name: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          occasion_date: string
          occasion_name: string
          product_id: string
          product_name: string
          recipient_name?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          occasion_date?: string
          occasion_name?: string
          product_id?: string
          product_name?: string
          recipient_name?: string | null
          user_id?: string
        }
        Relationships: []
      }
      seller_listings: {
        Row: {
          bundle_price: number | null
          created_at: string
          description: string | null
          expires_at: string
          id: string
          image_url: string | null
          listing_fee: number
          listing_type: string
          parent_listing_id: string | null
          price: number | null
          product_id: string | null
          seller_id: string
          sort_order: number
          status: string
          title: string | null
          updated_at: string
        }
        Insert: {
          bundle_price?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          image_url?: string | null
          listing_fee?: number
          listing_type?: string
          parent_listing_id?: string | null
          price?: number | null
          product_id?: string | null
          seller_id: string
          sort_order?: number
          status?: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          bundle_price?: number | null
          created_at?: string
          description?: string | null
          expires_at?: string
          id?: string
          image_url?: string | null
          listing_fee?: number
          listing_type?: string
          parent_listing_id?: string | null
          price?: number | null
          product_id?: string | null
          seller_id?: string
          sort_order?: number
          status?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seller_listings_parent_listing_id_fkey"
            columns: ["parent_listing_id"]
            isOneToOne: false
            referencedRelation: "seller_listings"
            referencedColumns: ["id"]
          },
        ]
      }
      seller_profiles: {
        Row: {
          business_name: string | null
          created_at: string
          fee_tier: string
          id: string
          is_verified: boolean
          national_id_url: string | null
          passport_url: string | null
          preferred_currency: string
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          fee_tier?: string
          id?: string
          is_verified?: boolean
          national_id_url?: string | null
          passport_url?: string | null
          preferred_currency?: string
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          business_name?: string | null
          created_at?: string
          fee_tier?: string
          id?: string
          is_verified?: boolean
          national_id_url?: string | null
          passport_url?: string | null
          preferred_currency?: string
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      seller_transactions: {
        Row: {
          ai_fee: number
          cleared_at: string | null
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          order_id: string | null
          platform_fee: number
          processing_fee: number
          seller_id: string
          status: string
          transaction_fee: number
        }
        Insert: {
          ai_fee?: number
          cleared_at?: string | null
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string | null
          platform_fee?: number
          processing_fee?: number
          seller_id: string
          status?: string
          transaction_fee?: number
        }
        Update: {
          ai_fee?: number
          cleared_at?: string | null
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          order_id?: string | null
          platform_fee?: number
          processing_fee?: number
          seller_id?: string
          status?: string
          transaction_fee?: number
        }
        Relationships: []
      }
      shipping_company_profiles: {
        Row: {
          company_name: string | null
          country_of_origin: string
          created_at: string
          id: string
          is_verified: boolean
          legal_address: string | null
          legal_document_url: string | null
          registration_number: string | null
          siege_social: string | null
          updated_at: string
          user_id: string
          verification_status: string
        }
        Insert: {
          company_name?: string | null
          country_of_origin: string
          created_at?: string
          id?: string
          is_verified?: boolean
          legal_address?: string | null
          legal_document_url?: string | null
          registration_number?: string | null
          siege_social?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string
        }
        Update: {
          company_name?: string | null
          country_of_origin?: string
          created_at?: string
          id?: string
          is_verified?: boolean
          legal_address?: string | null
          legal_document_url?: string | null
          registration_number?: string | null
          siege_social?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string
        }
        Relationships: []
      }
      shipping_jobs: {
        Row: {
          buyer_name: string | null
          created_at: string
          delivered_at: string | null
          destination: string | null
          id: string
          notes: string | null
          order_id: string | null
          received_at: string | null
          return_reason: string | null
          returned_at: string | null
          sent_at: string | null
          shipper_id: string
          status: string
          updated_at: string
        }
        Insert: {
          buyer_name?: string | null
          created_at?: string
          delivered_at?: string | null
          destination?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          received_at?: string | null
          return_reason?: string | null
          returned_at?: string | null
          sent_at?: string | null
          shipper_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_name?: string | null
          created_at?: string
          delivered_at?: string | null
          destination?: string | null
          id?: string
          notes?: string | null
          order_id?: string | null
          received_at?: string | null
          return_reason?: string | null
          returned_at?: string | null
          sent_at?: string | null
          shipper_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      special_offers: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          discount_pct: number
          ends_at: string | null
          id: string
          is_active: boolean
          occasion: string | null
          starts_at: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_pct?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          occasion?: string | null
          starts_at?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          discount_pct?: number
          ends_at?: string | null
          id?: string
          is_active?: boolean
          occasion?: string | null
          starts_at?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscription_payments: {
        Row: {
          amount: number
          created_at: string
          expires_at: string | null
          id: string
          paypal_capture_id: string | null
          paypal_order_id: string | null
          status: string
          tier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          expires_at?: string | null
          id?: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          status?: string
          tier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          expires_at?: string | null
          id?: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          status?: string
          tier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      verification_documents: {
        Row: {
          account_type: string
          admin_notes: string | null
          created_at: string
          document_type: string
          document_url: string
          id: string
          reject_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          account_type: string
          admin_notes?: string | null
          created_at?: string
          document_type: string
          document_url: string
          id?: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          account_type?: string
          admin_notes?: string | null
          created_at?: string
          document_type?: string
          document_url?: string
          id?: string
          reject_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_topups: {
        Row: {
          amount: number
          created_at: string
          currency: string
          id: string
          paypal_capture_id: string | null
          paypal_order_id: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          id?: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          id?: string
          paypal_capture_id?: string | null
          paypal_order_id?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          id: string
          transaction_type: string
          wallet_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type: string
          wallet_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          id?: string
          transaction_type?: string
          wallet_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_wallet_id_fkey"
            columns: ["wallet_id"]
            isOneToOne: false
            referencedRelation: "wallets"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          available_balance: number
          balance: number
          created_at: string
          currency: string
          id: string
          lifetime_earnings: number
          pending_balance: number
          updated_at: string
          user_id: string
        }
        Insert: {
          available_balance?: number
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          lifetime_earnings?: number
          pending_balance?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          available_balance?: number
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          lifetime_earnings?: number
          pending_balance?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      withdrawal_requests: {
        Row: {
          amount: number
          created_at: string
          currency: string
          destination: Json
          id: string
          method: string
          notes: string | null
          processed_at: string | null
          processed_by: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          destination?: Json
          id?: string
          method: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          destination?: Json
          id?: string
          method?: string
          notes?: string | null
          processed_at?: string | null
          processed_by?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_subscription: {
        Args: { _months?: number; _tier: string }
        Returns: Json
      }
      credit_wallet_from_topup: {
        Args: { _amount: number; _topup_id: string; _user: string }
        Returns: undefined
      }
      expire_old_listings: { Args: never; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      match_products: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content_text: string
          product_id: string
          product_name: string
          similarity: number
        }[]
      }
      process_referral_rewards: {
        Args: { _order_id: string; _product_ids: string[]; _unit_count: number }
        Returns: Json
      }
      resolve_referral_code: { Args: { _code: string }; Returns: string }
      upgrade_to_seller: { Args: { _business_name?: string }; Returns: Json }
      wallet_pay_vendor: {
        Args: {
          _amount: number
          _buyer: string
          _order_id: string
          _vendor: string
        }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
