export interface User {
  id: string
  email: string
  name: string
  role: "farmer" | "investor" | "admin"
  phone?: string
  location?: string
  avatar_url?: string
  kyc_status: "pending" | "approved" | "rejected"
  created_at: string
  updated_at: string
}

export interface Project {
  id: string
  title: string
  description: string
  farmer_id: string
  farmer_name: string
  category: "crops" | "poultry" | "livestock" | "processing" | "equipment"
  location: string
  funding_goal: number
  amount_raised: number
  status: "draft" | "active" | "funded" | "completed" | "cancelled"
  image_url?: string
  start_date?: string
  end_date?: string
  expected_return: number
  risk_level: "low" | "medium" | "high"
  created_at: string
  updated_at: string
}

export interface Investment {
  id: string
  investor_id: string
  project_id: string
  amount: number
  status: "pending" | "active" | "completed" | "cancelled"
  expected_return: number
  actual_return?: number
  created_at: string
  updated_at: string
  project?: Project
}

export interface KYCDocument {
  id: string
  user_id: string
  document_type: "id_card" | "passport" | "utility_bill" | "bank_statement"
  document_url: string
  status: "pending" | "approved" | "rejected"
  created_at: string
}
