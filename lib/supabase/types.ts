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
          avatar_url: string | null
          kyc_status: "pending" | "approved" | "rejected"
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
          avatar_url?: string | null
          kyc_status?: "pending" | "approved" | "rejected"
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
          avatar_url?: string | null
          kyc_status?: "pending" | "approved" | "rejected"
          created_at?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          title: string
          description: string
          farmer_id: string
          category: "crops" | "poultry" | "livestock" | "processing" | "equipment"
          location: string
          funding_goal: number
          amount_raised: number
          status: "draft" | "active" | "funded" | "completed" | "cancelled"
          image_url: string | null
          start_date: string | null
          end_date: string | null
          expected_return: number
          risk_level: "low" | "medium" | "high"
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          farmer_id: string
          category: "crops" | "poultry" | "livestock" | "processing" | "equipment"
          location: string
          funding_goal: number
          amount_raised?: number
          status?: "draft" | "active" | "funded" | "completed" | "cancelled"
          image_url?: string | null
          start_date?: string | null
          end_date?: string | null
          expected_return: number
          risk_level: "low" | "medium" | "high"
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          farmer_id?: string
          category?: "crops" | "poultry" | "livestock" | "processing" | "equipment"
          location?: string
          funding_goal?: number
          amount_raised?: number
          status?: "draft" | "active" | "funded" | "completed" | "cancelled"
          image_url?: string | null
          start_date?: string | null
          end_date?: string | null
          expected_return?: number
          risk_level?: "low" | "medium" | "high"
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
          expected_return: number
          actual_return: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          investor_id: string
          project_id: string
          amount: number
          status?: "pending" | "active" | "completed" | "cancelled"
          expected_return: number
          actual_return?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          investor_id?: string
          project_id?: string
          amount?: number
          status?: "pending" | "active" | "completed" | "cancelled"
          expected_return?: number
          actual_return?: number | null
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}
