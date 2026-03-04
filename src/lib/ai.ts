import OpenAI from "openai";
import type {
  QuestionnaireAnswers,
  FullInterviewPayload,
  TeaserPayload,
  GradeResult,
} from "@/types";

function getOpenAI() {
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

const ROLE_LABELS: Record<string, string> = {
  va: "Virtual Assistant",
  bpo_csr: "BPO Customer Service Representative",
  smm: "Social Media Manager",
  marketing: "Marketing Specialist",
  web_dev: "Web Developer",
};

const WORRY_LABELS: Record<string, string> = {
  freeze: "freezing up during interviews",
  unknown_questions: "encountering unexpected questions",
  english: "English communication skills",
  lack_experience: "lack of relevant experience",
  nervous: "general nervousness and anxiety",
};

const EXPERIENCE_LABELS: Record<string, string> = {
  fresh: "fresh graduate with no work experience",
  "1_3": "1-3 years of experience",
  "3_plus": "3+ years of experience",
};

export async function generateInterview(
  answers: QuestionnaireAnswers
): Promise<FullInterviewPayload> {
  const roleLabel = ROLE_LABELS[answers.role] || answers.role;
  const worryLabel = WORRY_LABELS[answers.worry] || answers.worry;
  const expLabel = EXPERIENCE_LABELS[answers.experienceLevel] || answers.experienceLevel;

  const languageInstruction =
    answers.language === "tl"
      ? `Use Taglish (Tagalog-English mix) for coaching lines and tips. Write like a supportive kuya/ate mentor. Keep question text in English but add short Tagalog encouragement or context where natural.`
      : `Use professional, supportive English. Include Philippine workplace context and scenarios.`;

  const jobDescSection = answers.jobDescription
    ? `\nThe candidate provided this job description to prepare for:\n"${answers.jobDescription.slice(0, 3000)}"\nTailor some questions to match this specific role.`
    : "";

  const prompt = `You are an expert Philippine interview coach. Generate a complete mock interview for a candidate.

Candidate Profile:
- Target role: ${roleLabel}
- Experience: ${expLabel}
- Biggest worry: ${worryLabel}
- Importance: ${answers.importanceLevel.replace("_", " ")}
- Failed interviews before: ${answers.failedBefore}
- Interview timing: ${answers.interviewTiming.replace(/_/g, " ")}
${jobDescSection}

${languageInstruction}

Generate exactly 15 interview questions with this distribution:
- 5 behavioral questions (STAR method applicable)
- 5 situational questions (Philippine workplace scenarios)
- 5 technical/role-specific questions for ${roleLabel}

Order them progressively from easier to harder.

For each question provide:
1. A clear question text
2. A strong sample answer (professional, detailed, 3-5 sentences)
3. 3-4 scoring rubric bullets

Also provide:
- A readiness summary (2-3 sentences assessing the candidate's preparation level)
- A readiness score from 0-100

Respond in this exact JSON format:
{
  "readinessSummary": "...",
  "readinessScore": 0-100,
  "questions": [
    {
      "id": "q1",
      "category": "behavioral|technical|situational",
      "questionText": "...",
      "sampleAnswer": "...",
      "rubricBullets": ["...", "...", "..."]
    }
  ]
}`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI");
  }

  const parsed = JSON.parse(content) as FullInterviewPayload;

  // Validate structure
  if (
    !parsed.readinessSummary ||
    typeof parsed.readinessScore !== "number" ||
    !Array.isArray(parsed.questions) ||
    parsed.questions.length < 10
  ) {
    throw new Error("Invalid interview structure from AI");
  }

  return parsed;
}

export function extractTeaser(
  fullInterview: FullInterviewPayload
): TeaserPayload {
  return {
    readinessSummary: fullInterview.readinessSummary,
    readinessScore: fullInterview.readinessScore,
    questions: fullInterview.questions.slice(0, 3),
    feedbackSummary: `Based on your profile, we've prepared ${fullInterview.questions.length} targeted questions covering behavioral, situational, and technical areas. Your first 3 questions are available as a preview.`,
  };
}

export async function gradeAnswer(
  questionText: string,
  rubricBullets: string[],
  userAnswer: string,
  role: string,
  language: string
): Promise<GradeResult> {
  const roleLabel = ROLE_LABELS[role] || role;
  const langInstruction =
    language === "tl"
      ? "Provide feedback in Taglish (supportive kuya/ate tone). Short Tagalog tips are welcome."
      : "Provide feedback in professional, supportive English.";

  const prompt = `You are a Philippine interview coach grading a candidate's answer.

Role: ${roleLabel}
Question: ${questionText}
Scoring Rubric: ${rubricBullets.join("; ")}
Candidate's Answer: ${userAnswer}

${langInstruction}

Grade the answer and respond in this exact JSON format:
{
  "score": 1-10,
  "strengths": ["strength 1", "strength 2"],
  "weaknesses": ["area to improve 1", "area to improve 2"],
  "improvedAnswer": "A better version of their answer (3-5 sentences)"
}`;

  const response = await getOpenAI().chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
    temperature: 0.5,
    max_tokens: 1000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("No response from AI for grading");
  }

  return JSON.parse(content) as GradeResult;
}
