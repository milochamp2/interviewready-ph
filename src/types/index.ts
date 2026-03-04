// ─── Questionnaire Types ───

export type Language = "en" | "tl";

export type IdentityType =
  | "fresh_grad"
  | "career_shifter"
  | "employed_applying"
  | "first_time"
  | "experienced";

export type ImportanceLevel =
  | "exploring"
  | "important"
  | "very_important"
  | "really_need";

export type Worry =
  | "freeze"
  | "unknown_questions"
  | "english"
  | "lack_experience"
  | "nervous";

export type FailedBefore = "yes" | "no" | "unsure";

export type Role = "va" | "bpo_csr" | "smm" | "marketing" | "web_dev";

export type ExperienceLevel = "fresh" | "1_3" | "3_plus";

export type InterviewTiming = "within_3_days" | "this_week" | "just_preparing";

export interface QuestionnaireAnswers {
  language: Language;
  identityType: IdentityType;
  importanceLevel: ImportanceLevel;
  worry: Worry;
  failedBefore: FailedBefore;
  role: Role;
  experienceLevel: ExperienceLevel;
  interviewTiming: InterviewTiming;
  jobDescription?: string;
}

// ─── Interview Types ───

export interface InterviewQuestion {
  id: string;
  category: "behavioral" | "technical" | "situational";
  questionText: string;
  sampleAnswer: string;
  rubricBullets: string[];
}

export interface FullInterviewPayload {
  readinessSummary: string;
  readinessScore: number;
  questions: InterviewQuestion[];
}

export interface TeaserPayload {
  readinessSummary: string;
  readinessScore: number;
  questions: InterviewQuestion[]; // only 3
  feedbackSummary: string;
}

// ─── Grading Types ───

export interface GradeResult {
  score: number; // 1-10
  strengths: string[];
  weaknesses: string[];
  improvedAnswer: string;
}

// ─── Payment Types ───

export type PlanType = "basic_399" | "bundle_999" | "extend_149";

export interface EntitlementInfo {
  status: "locked" | "active" | "expired";
  plan: string | null;
  expiresAt: string | null;
  daysRemaining: number | null;
  hoursRemaining: number | null;
  showCountdown: boolean;
  isGracePeriod: boolean;
  extensionsUsed: number;
}

// ─── Bundle Types ───

export interface ResumeOptimization {
  optimizedSummary: string;
  improvedBullets: string[];
  keywordSuggestions: string[];
}

export interface BundleOutputData {
  resumeOptimization: ResumeOptimization | null;
  coverLetter: string | null;
  practicePlan: string[];
}
