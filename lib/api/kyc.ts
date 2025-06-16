import { supabase } from "../supabase/client"
import { uploadFile } from "../storage"

export interface KYCDocument {
  id: string
  user_id: string
  document_type: "id_card" | "passport" | "utility_bill" | "bank_statement" | "farm_document"
  document_url: string
  status: "pending" | "approved" | "rejected"
  created_at: string
  rejection_reason?: string
}

export async function uploadKYCDocument(userId: string, documentType: KYCDocument["document_type"], file: File) {
  try {
    // Upload file to storage
    const fileName = `${userId}/${documentType}-${Date.now()}-${file.name}`
    const { data: uploadData, error: uploadError } = await uploadFile(file, "kyc-documents", fileName)

    if (uploadError) throw uploadError

    // Save document record to database
    const { data, error } = await supabase
      .from("kyc_documents")
      .insert({
        user_id: userId,
        document_type: documentType,
        document_url: uploadData.publicUrl,
        status: "pending",
      })
      .select()
      .single()

    if (error) throw error

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getKYCDocuments(userId: string) {
  try {
    const { data, error } = await supabase
      .from("kyc_documents")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function updateKYCStatus(documentId: string, status: "approved" | "rejected", rejectionReason?: string) {
  try {
    const { data, error } = await supabase
      .from("kyc_documents")
      .update({
        status,
        rejection_reason: rejectionReason,
      })
      .eq("id", documentId)
      .select()
      .single()

    if (error) throw error

    // Update user KYC status if all documents are approved
    if (status === "approved") {
      const { data: userDocs } = await supabase.from("kyc_documents").select("status").eq("user_id", data.user_id)

      const allApproved = userDocs?.every((doc) => doc.status === "approved")

      if (allApproved) {
        await supabase.from("users").update({ kyc_status: "approved" }).eq("id", data.user_id)
      }
    }

    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}

export async function getAllPendingKYC() {
  try {
    const { data, error } = await supabase
      .from("kyc_documents")
      .select(`
        *,
        users(name, email)
      `)
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    return { data: null, error }
  }
}
