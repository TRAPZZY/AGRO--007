import { z } from "zod"

export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
  role: z.enum(["farmer", "investor"], {
    required_error: "Please select a role",
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
    .min(50, "Description must be at least 50 characters")
    .max(1000, "Description must be less than 1000 characters"),
  fundingGoal: z
    .number()
    .min(10000, "Funding goal must be at least ₦10,000")
    .max(50000000, "Funding goal cannot exceed ₦50,000,000"),
  category: z.enum(["crops", "poultry", "livestock", "processing", "equipment"], {
    required_error: "Please select a category",
  }),
  location: z.string().min(2, "Please enter a valid location"),
  expectedReturn: z.number().min(5, "Expected return must be at least 5%").max(50, "Expected return cannot exceed 50%"),
  riskLevel: z.enum(["low", "medium", "high"], {
    required_error: "Please select a risk level",
  }),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
})

export const investmentSchema = z.object({
  amount: z.number().min(1000, "Minimum investment is ₦1,000").max(10000000, "Maximum investment is ₦10,000,000"),
  projectId: z.string().min(1, "Project ID is required"),
})

export const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  phone: z.string().regex(/^\+234[0-9]{10}$/, "Please enter a valid Nigerian phone number (+234xxxxxxxxxx)"),
  location: z.string().min(2, "Please enter a valid location"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
})

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ProjectInput = z.infer<typeof projectSchema>
export type InvestmentInput = z.infer<typeof investmentSchema>
export type ProfileInput = z.infer<typeof profileSchema>
