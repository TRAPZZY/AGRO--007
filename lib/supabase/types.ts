export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: "farmer" | "investor" | "admin"
          phone: string | null
          address: string | null
          bio: string | null
          profile_image_url: string | null
          kyc_status: "pending" | "approved" | "rejected"
          kyc_document_url: string | null
          is_verified: boolean
          total_invested: number
          total_earned: number
          login_count: number
          last_login: string | null
          failed_login_attempts: number
          locked_until: string | null
          password_changed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: "farmer" | "investor" | "admin"
          phone?: string | null
          address?: string | null
          bio?: string | null
          profile_image_url?: string | null
          kyc_status?: "pending" | "approved" | "rejected"
          kyc_document_url?: string | null
          is_verified?: boolean
          total_invested?: number
          total_earned?: number
          login_count?: number
          last_login?: string | null
          failed_login_attempts?: number
          locked_until?: string | null
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
          address?: string | null
          bio?: string | null
          profile_image_url?: string | null
          kyc_status?: "pending" | "approved" | "rejected"
          kyc_document_url?: string | null
          is_verified?: boolean
          total_invested?: number
          total_earned?: number
          login_count?: number
          last_login?: string | null
          failed_login_attempts?: number
          locked_until?: string | null
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
          location: string
          project_type: string
          funding_goal: number
          current_funding: number
          min_investment: number
          expected_duration: number
          expected_roi: number
          status: "draft" | "active" | "funded" | "completed" | "cancelled"
          images: string[]
          documents: string[]
          tags: string[]
          start_date: string | null
          end_date: string | null
          progress_percentage: number
          risk_level: number
          investor_count: number
          is_featured: boolean
          views_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          farmer_id: string
          title: string
          description: string
          location: string
          project_type: string
          funding_goal: number
          current_funding?: number
          min_investment?: number
          expected_duration: number
          expected_roi: number
          status?: "draft" | "active" | "funded" | "completed" | "cancelled"
          images?: string[]
          documents?: string[]
          tags?: string[]
          start_date?: string | null
          end_date?: string | null
          progress_percentage?: number
          risk_level?: number
          investor_count?: number
          is_featured?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          farmer_id?: string
          title?: string
          description?: string
          location?: string
          project_type?: string
          funding_goal?: number
          current_funding?: number
          min_investment?: number
          expected_duration?: number
          expected_roi?: number
          status?: "draft" | "active" | "funded" | "completed" | "cancelled"
          images?: string[]
          documents?: string[]
          tags?: string[]
          start_date?: string | null
          end_date?: string | null
          progress_percentage?: number
          risk_level?: number
          investor_count?: number
          is_featured?: boolean
          views_count?: number
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          project_id: string
          investor_id: string
          amount: number
          status: "pending" | "confirmed" | "cancelled"
          expected_return: number | null
          actual_return: number | null
          investment_date: string
          return_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          project_id: string
          investor_id: string
          amount: number
          status?: "pending" | "confirmed" | "cancelled"
          expected_return?: number | null
          actual_return?: number | null
          investment_date?: string
          return_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          project_id?: string
          investor_id?: string
          amount?: number
          status?: "pending" | "confirmed" | "cancelled"
          expected_return?: number | null
          actual_return?: number | null
          investment_date?: string
          return_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          action_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          action_url?: string | null
          created_at?: string
        }
      }
      audit_logs: {
        Row: {
          id: string
          user_id: string | null
          action: string
          table_name: string | null
          record_id: string | null
          old_values: Record<string, any> | null
          new_values: Record<string, any> | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          action: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Record<string, any> | null
          new_values?: Record<string, any> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          action?: string
          table_name?: string | null
          record_id?: string | null
          old_values?: Record<string, any> | null
          new_values?: Record<string, any> | null
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
    }
  }
}
