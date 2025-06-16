import { z } from "zod"

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  role: z.enum(["farmer", "investor", "admin"], {
    required_error: "Please select your role",
  }),
})

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

export const projectSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters").max(100, "Title must be less than 100 characters"),
  description: z
    .string()
    .min(20, "Description must be at least 20 characters")
    .max(1000, "Description must be less than 1000 characters"),
  category: z.enum(["crops", "livestock", "equipment", "processing", "other"], {
    required_error: "Please select a category",
  }),
  funding_goal: z
    .number()
    .min(1000, "Funding goal must be at least ₦1,000")
    .max(100000000, "Funding goal must be less than ₦100,000,000"),
  duration_months: z
    .number()
    .min(1, "Duration must be at least 1 month")
    .max(60, "Duration must be less than 60 months"),
  expected_return: z
    .number()
    .min(1, "Expected return must be at least 1%")
    .max(100, "Expected return must be less than 100%"),
  location: z
    .string()
    .min(2, "Location must be at least 2 characters")
    .max(100, "Location must be less than 100 characters"),
})

export const investmentSchema = z.object({
  amount: z.number().min(1000, "Minimum investment is ₦1,000").max(10000000, "Maximum investment is ₦10,000,000"),
  project_id: z.string().uuid("Invalid project ID"),
})

export const kycSchema = z.object({
  document_type: z.enum(["national_id", "passport", "drivers_license", "voters_card"], {
    required_error: "Please select a document type",
  }),
  document_number: z
    .string()
    .min(5, "Document number must be at least 5 characters")
    .max(50, "Document number must be less than 50 characters"),
  phone_number: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .max(15, "Phone number must be less than 15 digits"),
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(200, "Address must be less than 200 characters"),
  date_of_birth: z.string().min(1, "Date of birth is required"),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type InvestmentInput = z.infer<typeof investmentSchema>
export type KYCInput = z.infer<typeof kycSchema>
