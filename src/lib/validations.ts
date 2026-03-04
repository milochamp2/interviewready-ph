import { z } from "zod";

export const createSessionSchema = z.object({
  language: z.enum(["en", "tl"]),
  identityType: z.enum([
    "fresh_grad",
    "career_shifter",
    "employed_applying",
    "first_time",
    "experienced",
  ]),
  importanceLevel: z.enum([
    "exploring",
    "important",
    "very_important",
    "really_need",
  ]),
  worry: z.enum([
    "freeze",
    "unknown_questions",
    "english",
    "lack_experience",
    "nervous",
  ]),
  failedBefore: z.enum(["yes", "no", "unsure"]),
  role: z.enum(["va", "bpo_csr", "smm", "marketing", "web_dev"]),
  experienceLevel: z.enum(["fresh", "1_3", "3_plus"]),
  interviewTiming: z.enum(["within_3_days", "this_week", "just_preparing"]),
  jobDescription: z
    .string()
    .max(3000, "Job description too long")
    .optional()
    .transform((val) => val?.trim() || undefined),
});

export const gradeAnswerSchema = z.object({
  sessionId: z.string().uuid(),
  questionId: z.string(),
  userAnswer: z
    .string()
    .min(10, "Answer too short")
    .max(5000, "Answer too long"),
});

export const createCheckoutSchema = z.object({
  sessionId: z.string().uuid(),
  plan: z.enum(["basic_399", "bundle_999", "extend_149"]),
});

export const sendPdfEmailSchema = z.object({
  sessionId: z.string().uuid(),
  email: z.string().email("Invalid email address"),
});
