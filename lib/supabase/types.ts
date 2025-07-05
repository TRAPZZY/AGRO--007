export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: "farmer" | "investor" | "admin"
          phone: string | null
          location: string | null
          bio: string | null
          profile_image_url: string | null
          kyc_status: "pending" | "approved" | "rejected"
          kyc_documents: Json | null
          is_verified: boolean
          last_login: string | null
          password_changed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          name: string
          role: "farmer" | "investor" | "admin"
          phone?: string | null
          location?: string | null
          bio?: string | null
          profile_image_url?: string | null
          kyc_status?: "pending" | "approved" | "rejected"
          kyc_documents?: Json | null
          is_verified?: boolean
          last_login?: string | null
          password_changed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: "farmer" | "investor" | "admin"
          phone?: string | null
          location?: string | null
          bio?: string | null
          profile_image_url?: string | null
          kyc_status?: "pending" | "approved" | "rejected"
          kyc_documents?: Json | null
          is_verified?: boolean
          last_login?: string | null
          password_changed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          farmer_id: string
          title: string
          description: string
          category: string
          location: string
          funding_goal: number
          current_funding: number
          min_investment: number
          expected_return: number
          duration_months: number
          status: "draft" | "active" | "funded" | "completed" | "cancelled"
          images: string[] | null
          documents: string[] | null
          risk_level: "low" | "medium" | "high"
          start_date: string | null
          end_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          title: string
          description: string
          category: string
          location: string
          funding_goal: number
          current_funding?: number
          min_investment: number
          expected_return: number
          duration_months: number
          status?: "draft" | "active" | "funded" | "completed" | "cancelled"
          images?: string[] | null
          documents?: string[] | null
          risk_level?: "low" | "medium" | "high"
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          title?: string
          description?: string
          category?: string
          location?: string
          funding_goal?: number
          current_funding?: number
          min_investment?: number
          expected_return?: number
          duration_months?: number
          status?: "draft" | "active" | "funded" | "completed" | "cancelled"
          images?: string[] | null
          documents?: string[] | null
          risk_level?: "low" | "medium" | "high"
          start_date?: string | null
          end_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          investor_id: string
          project_id: string
          amount: number
          status: "pending" | "active" | "completed" | "cancelled"
          expected_return: number | null
          actual_return: number | null
          investment_date: string
          maturity_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          investor_id: string
          project_id: string
          amount: number
          status?: "pending" | "active" | "completed" | "cancelled"
          expected_return?: number | null
          actual_return?: number | null
          investment_date?: string
          maturity_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          project_id?: string
          amount?: number
          status?: "pending" | "active" | "completed" | "cancelled"
          expected_return?: number | null
          actual_return?: number | null
          investment_date?: string
          maturity_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      project_updates: {
        Row: {
          id: string
          project_id: string
          title: string
          content: string
          images: string[] | null
          update_type: "general" | "milestone" | "financial" | "risk"
          created_at: string
        }
        Insert: {
          id?: string
          project_id: string
          title: string
          content: string
          images?: string[] | null
          update_type?: "general" | "milestone" | "financial" | "risk"
          created_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          title?: string
          content?: string
          images?: string[] | null
          update_type?: "general" | "milestone" | "financial" | "risk"
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error"
          is_read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: "info" | "success" | "warning" | "error"
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: "info" | "success" | "warning" | "error"
          is_read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          details: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          details?: Json | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}
