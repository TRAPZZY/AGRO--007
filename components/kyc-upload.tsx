"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { FileUpload } from "@/components/ui/file-upload"
import { LoadingSpinner } from "@/components/ui/loading-spinner"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, Clock, XCircle, Upload, FileText } from "lucide-react"
import { uploadKYCDocument, getKYCDocuments, type KYCDocument } from "@/lib/api/kyc"
import { getCurrentUser } from "@/lib/auth"

const documentTypes = [
  {
    type: "id_card" as const,
    label: "Government ID Card",
    description: "National ID, Driver's License, or Voter's Card",
    required: true,
  },
  {
    type: "utility_bill" as const,
    label: "Proof of Address",
    description: "Recent utility bill or bank statement",
    required: true,
  },
  {
    type: "bank_statement" as const,
    label: "Bank Statement",
    description: "Recent bank statement (last 3 months)",
    required: false,
  },
  {
    type: "farm_document" as const,
    label: "Farm Documentation",
    description: "Farm ownership or lease documents (farmers only)",
    required: false,
  },
]

export function KYCUpload() {
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [uploadingType, setUploadingType] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        const { user } = await getCurrentUser()
        if (!user) return

        setUser(user)
        const { data, error } = await getKYCDocuments(user.id)

        if (error) throw error
        setDocuments(data || [])
      } catch (err) {
        setError("Failed to load KYC documents")
        console.error(err)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  const handleUpload = async (documentType: KYCDocument["document_type"], fileUrl: string) => {
    if (!user) return

    setUploadingType(documentType)
    setError(null)

    try {
      // Create a File object from the URL (this is a simplified approach)
      // In a real implementation, you'd handle this differently
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const file = new File([blob], `${documentType}.pdf`, { type: blob.type })

      const { data, error } = await uploadKYCDocument(user.id, documentType, file)

      if (error) throw error

      // Refresh documents list
      const { data: updatedDocs } = await getKYCDocuments(user.id)
      setDocuments(updatedDocs || [])
    } catch (err) {
      setError("Failed to upload document")
      console.error(err)
    } finally {
      setUploadingType(null)
    }
  }

  const getDocumentStatus = (type: KYCDocument["document_type"]) => {
    return documents.find((doc) => doc.document_type === type)
  }

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-600" />
      default:
        return <Upload className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredDocumentTypes =
    user?.role === "farmer" ? documentTypes : documentTypes.filter((doc) => doc.type !== "farm_document")

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-gray-600">Loading KYC documents...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>KYC Verification</CardTitle>
          <CardDescription>
            Upload the required documents to verify your identity and complete your account setup.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-6">
            {filteredDocumentTypes.map((docType) => {
              const existingDoc = getDocumentStatus(docType.type)
              const isUploading = uploadingType === docType.type

              return (
                <div key={docType.type} className="border rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <FileText className="w-5 h-5 text-gray-500" />
                        <h3 className="font-medium text-gray-900">{docType.label}</h3>
                        {docType.required && (
                          <Badge variant="outline" className="text-xs">
                            Required
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{docType.description}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(existingDoc?.status)}
                      {existingDoc && (
                        <Badge className={getStatusColor(existingDoc.status)} variant="secondary">
                          {existingDoc.status.charAt(0).toUpperCase() + existingDoc.status.slice(1)}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {existingDoc?.status === "rejected" && existingDoc.rejection_reason && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertDescription>
                        <strong>Rejected:</strong> {existingDoc.rejection_reason}
                      </AlertDescription>
                    </Alert>
                  )}

                  {(!existingDoc || existingDoc.status === "rejected") && (
                    <FileUpload
                      onUpload={(url) => handleUpload(docType.type, url)}
                      bucket="kyc-documents"
                      path={`${user?.id}/${docType.type}`}
                      accept=".pdf,.jpg,.jpeg,.png"
                      maxSize={10 * 1024 * 1024} // 10MB
                      className="mt-4"
                    >
                      {isUploading ? (
                        <div className="flex items-center justify-center">
                          <LoadingSpinner size="sm" className="mr-2" />
                          Uploading...
                        </div>
                      ) : (
                        <div>
                          <Upload className="w-8 h-8 text-green-600 mx-auto mb-2" />
                          <p className="text-sm text-gray-600">Click to upload {docType.label.toLowerCase()}</p>
                        </div>
                      )}
                    </FileUpload>
                  )}

                  {existingDoc?.status === "approved" && (
                    <div className="mt-4 p-4 bg-green-50 rounded-lg">
                      <div className="flex items-center text-green-700">
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Document approved and verified
                      </div>
                    </div>
                  )}

                  {existingDoc?.status === "pending" && (
                    <div className="mt-4 p-4 bg-yellow-50 rounded-lg">
                      <div className="flex items-center text-yellow-700">
                        <Clock className="w-5 h-5 mr-2" />
                        Document under review
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Verification Process</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Documents are typically reviewed within 24-48 hours</li>
              <li>• Ensure all documents are clear and readable</li>
              <li>• Accepted formats: PDF, JPG, PNG (max 10MB)</li>
              <li>• You'll receive email notifications about status updates</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
