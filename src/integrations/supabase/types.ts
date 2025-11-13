export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      "mo-clients": {
        Row: {
          active: boolean | null
          address: string | null
          company_name: string | null
          contact_person: string | null
          created_at: string | null
          email: string
          id: string
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          address?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          email: string
          id?: string
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          address?: string | null
          company_name?: string | null
          contact_person?: string | null
          created_at?: string | null
          email?: string
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      "mo-products": {
        Row: {
          active: boolean | null
          base_price: number | null
          category: Database["public"]["Enums"]["product_type"] | null
          cost_price: number | null
          created_at: string | null
          description: string | null
          id: string
          ingredients: Json | null
          name: string
          name_chinese: string | null
          nutritional_specs: Json | null
          quantity_per_box: number | null
          recipe: Json | null
          sku: string
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          base_price?: number | null
          category?: Database["public"]["Enums"]["product_type"] | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          ingredients?: Json | null
          name: string
          name_chinese?: string | null
          nutritional_specs?: Json | null
          quantity_per_box?: number | null
          recipe?: Json | null
          sku: string
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          base_price?: number | null
          category?: Database["public"]["Enums"]["product_type"] | null
          cost_price?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          ingredients?: Json | null
          name?: string
          name_chinese?: string | null
          nutritional_specs?: Json | null
          quantity_per_box?: number | null
          recipe?: Json | null
          sku?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      "mo-inventory": {
        Row: {
          created_at: string | null
          current_stock: number | null
          id: string
          last_restocked_at: string | null
          max_stock_level: number | null
          min_stock_level: number | null
          product_id: string
          stock_status: Database["public"]["Enums"]["stock_status"] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_stock?: number | null
          id?: string
          last_restocked_at?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_id: string
          stock_status?: Database["public"]["Enums"]["stock_status"] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_stock?: number | null
          id?: string
          last_restocked_at?: string | null
          max_stock_level?: number | null
          min_stock_level?: number | null
          product_id?: string
          stock_status?: Database["public"]["Enums"]["stock_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mo-inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "mo-products"
            referencedColumns: ["id"]
          },
        ]
      }
      "mo-client_category_pricing": {
        Row: {
          client_id: string
          created_at: string | null
          custom_price: number
          id: string
          product_category: Database["public"]["Enums"]["product_type"]
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          custom_price: number
          id?: string
          product_category: Database["public"]["Enums"]["product_type"]
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          custom_price?: number
          id?: string
          product_category?: Database["public"]["Enums"]["product_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mo-client_category_pricing_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mo-clients"
            referencedColumns: ["id"]
          },
        ]
      }
      "mo-events": {
        Row: {
          actual_cost: number | null
          actual_revenue: number | null
          budget: number | null
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          location: string | null
          name: string
          start_date: string
          status: Database["public"]["Enums"]["event_status"] | null
          target_revenue: number | null
          updated_at: string | null
        }
        Insert: {
          actual_cost?: number | null
          actual_revenue?: number | null
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          location?: string | null
          name: string
          start_date: string
          status?: Database["public"]["Enums"]["event_status"] | null
          target_revenue?: number | null
          updated_at?: string | null
        }
        Update: {
          actual_cost?: number | null
          actual_revenue?: number | null
          budget?: number | null
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          location?: string | null
          name?: string
          start_date?: string
          status?: Database["public"]["Enums"]["event_status"] | null
          target_revenue?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      "mo-invoices": {
        Row: {
          client_id: string
          created_at: string | null
          currency: string | null
          due_date: string | null
          fx_to_cny: number | null
          id: string
          invoice_number: string
          language: string | null
          notes: string | null
          paid_date: string | null
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          po_number: string | null
          subtotal: number | null
          subtotal_original: number | null
          tax_amount: number | null
          tax_amount_original: number | null
          tax_included: boolean | null
          tax_rate: number | null
          total_amount: number | null
          total_amount_original: number | null
          updated_at: string | null
        }
        Insert: {
          client_id: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          fx_to_cny?: number | null
          id?: string
          invoice_number: string
          language?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          po_number?: string | null
          subtotal?: number | null
          subtotal_original?: number | null
          tax_amount?: number | null
          tax_amount_original?: number | null
          tax_included?: boolean | null
          tax_rate?: number | null
          total_amount?: number | null
          total_amount_original?: number | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string
          created_at?: string | null
          currency?: string | null
          due_date?: string | null
          fx_to_cny?: number | null
          id?: string
          invoice_number?: string
          language?: string | null
          notes?: string | null
          paid_date?: string | null
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          po_number?: string | null
          subtotal?: number | null
          subtotal_original?: number | null
          tax_amount?: number | null
          tax_amount_original?: number | null
          tax_included?: boolean | null
          tax_rate?: number | null
          total_amount?: number | null
          total_amount_original?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mo-invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "mo-clients"
            referencedColumns: ["id"]
          },
        ]
      }
      "mo-venues": {
        Row: {
          active: boolean | null
          city: string
          country: string
          created_at: string | null
          description_en: string | null
          description_zh: string | null
          id: string
          location: string | null
          name_en: string
          name_zh: string | null
          picture_url: string | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          city: string
          country: string
          created_at?: string | null
          description_en?: string | null
          description_zh?: string | null
          id?: string
          location?: string | null
          name_en: string
          name_zh?: string | null
          picture_url?: string | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          city?: string
          country?: string
          created_at?: string | null
          description_en?: string | null
          description_zh?: string | null
          id?: string
          location?: string | null
          name_en?: string
          name_zh?: string | null
          picture_url?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      event_status: "planned" | "active" | "completed" | "cancelled"
      payment_status: "pending" | "paid" | "overdue" | "cancelled"
      pricing_tier: "retail" | "wholesale" | "distributor" | "vip"
      product_type: "small_bottle" | "large_bottle" | "keg"
      sales_category:
        | "online"
        | "offline_events"
        | "offline_shops"
        | "cws_distributor"
        | "hong_kong_cws"
        | "free_stock_giveaway"
      stock_status: "in_stock" | "low_stock" | "out_of_stock"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T]
