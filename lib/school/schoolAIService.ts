/**
 * lib/school/schoolAIService.ts
 *
 * School-specific AI workflows built on top of the canonical
 * CentralAIService and creditLedger.
 *
 * INVARIANT: All AI output is DRAFT only.
 * Teachers MUST Review → Edit → Approve before any authoritative
 * record (lesson, assignment, grade, report card comment) is written.
 *
 * No function in this file writes to a lesson/grade/assignment directly.
 * The caller (API route) handles persistence after teacher approval.
 */

import { centralAIService } from "@/lib/ai/aiService";
import {
  AIExecutionContext,
  AICapability,
} from "@/lib/ai/types";

// ─────────────────────────────────────────────────────────────────────────────
// CREDIT COSTS (school-specific estimates, adjust as needed)
// ─────────────────────────────────────────────────────────────────────────────

// All school AI functions use TEXT generation → charged by token
const SCHOOL_AI_FEATURE = "school_education";

// ─────────────────────────────────────────────────────────────────────────────
// TYPES — School AI Inputs & Outputs (all DRAFT)
// ─────────────────────────────────────────────────────────────────────────────

export interface LessonPlanInput {
  subject: string;          // e.g. "Mathematics"
  topic: string;            // e.g. "Quadratic Equations"
  gradeLevel: string;       // e.g. "Grade 10"
  duration: number;         // in minutes, e.g. 40
  objectives?: string[];    // learning objectives (optional, AI will generate if empty)
  style?: string;           // "lecture" | "interactive" | "inquiry-based" | "project-based"
  curriculum?: string;      // e.g. "Kenya KCSE", "IB", "Cambridge"
  priorKnowledge?: string;  // what students already know
}

export interface DraftLessonPlan {
  title: string;
  subject: string;
  gradeLevel: string;
  duration: number;
  objectives: string[];
  introduction: string;     // hook / opener (5 min)
  mainContent: Array<{
    section: string;
    content: string;
    duration: number;       // minutes
    teacherActivity: string;
    studentActivity: string;
  }>;
  assessment: string;       // in-class check
  homework: string;
  materials: string[];
  teacherNotes: string;
  creditsConsumed: number;
}

export interface AssignmentGenerationInput {
  subject: string;
  topic: string;
  gradeLevel: string;
  questionCount: number;    // 1–30
  questionTypes: Array<"multiple_choice" | "short_answer" | "essay" | "true_false" | "fill_blank">;
  difficulty: "easy" | "medium" | "hard" | "mixed";
  instructions?: string;
  rubric?: boolean;         // include marking rubric?
}

export interface DraftAssignment {
  title: string;
  subject: string;
  instructions: string;
  questions: Array<{
    questionText: string;
    questionType: string;
    options?: string[];     // for multiple_choice
    correctAnswer?: string; // for auto-gradeable types
    points: number;
    hint?: string;
  }>;
  totalPoints: number;
  rubric?: string;          // markdown rubric if requested
  creditsConsumed: number;
}

export interface GradingFeedbackInput {
  submissionText: string;   // student's answer
  questionText: string;
  maxPoints: number;
  rubric?: string;          // optional rubric
  subject: string;
  gradeLevel: string;
}

export interface DraftGradingFeedback {
  suggestedScore: number;   // 0 to maxPoints
  feedback: string;         // detailed feedback for student
  strengths: string[];
  improvements: string[];
  creditsConsumed: number;
}

export interface ReportCommentInput {
  studentName: string;
  subject: string;
  averageScore: number;
  letterGrade: string;
  absences: number;
  strengths?: string;
  areasForImprovement?: string;
  teacherName?: string;
}

export interface DraftReportComment {
  comment: string;          // 3-5 sentence narrative
  creditsConsumed: number;
}

export interface StoryGenerationInput {
  title?: string;
  theme: string;            // e.g. "friendship", "sharing", "adventure"
  ageGroup: string;         // e.g. "3-5 years", "6-8 years"
  pageCount: number;        // 4–12 pages
  moralLesson?: string;
  characters?: string[];
  setting?: string;
  language?: "English" | "Swahili" | "French";
}

export interface DraftStory {
  title: string;
  pages: Array<{
    pageNumber: number;
    text: string;
    illustrationPrompt: string; // for image generation
  }>;
  moralLesson: string;
  discussionQuestions: string[];
  creditsConsumed: number;
}

export interface ActivityContentInput {
  activityType: "drawing" | "puzzle-play" | "sing-along" | "make-friends";
  theme?: string;
  ageGroup?: string;
  language?: string;
}

export interface DraftActivityContent {
  title: string;
  instructions: string;
  content: Record<string, unknown>; // type-specific JSON payload
  creditsConsumed: number;
}

// ─────────────────────────────────────────────────────────────────────────────
// SCHOOL AI SERVICE CLASS
// ─────────────────────────────────────────────────────────────────────────────

export class SchoolAIService {
  // ── Helper: build execution context ────────────────────────────────────────
  private ctx(
    companyId: string,
    userId: string,
    feature: string,
    idempotencyKey?: string
  ): AIExecutionContext {
    return {
      companyId,
      userId,
      source: "WEB",
      feature: `${SCHOOL_AI_FEATURE}_${feature}`,
      capability: "TEXT" as AICapability,
      idempotencyKey,
    };
  }

  // ── Helper: safe JSON parse from AI text ───────────────────────────────────
  private safeParseJson<T>(text: string, fallback: T): T {
    try {
      const start = text.indexOf("{");
      const end = text.lastIndexOf("}");
      if (start === -1 || end === -1) return fallback;
      return JSON.parse(text.slice(start, end + 1)) as T;
    } catch {
      return fallback;
    }
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 1. LESSON PLAN GENERATOR
  // ──────────────────────────────────────────────────────────────────────────

  async generateLessonPlan(
    input: LessonPlanInput,
    companyId: string,
    userId: string,
    idempotencyKey?: string
  ): Promise<DraftLessonPlan> {
    const systemPrompt = `You are an experienced curriculum designer. Generate structured lesson plans in valid JSON format only. No markdown fences, no extra text.`;

    const prompt = `Create a complete lesson plan:
Subject: ${input.subject}
Topic: ${input.topic}
Grade Level: ${input.gradeLevel}
Duration: ${input.duration} minutes
Teaching Style: ${input.style ?? "interactive"}
Curriculum: ${input.curriculum ?? "Standard"}
${input.priorKnowledge ? `Prior Knowledge: ${input.priorKnowledge}` : ""}
${input.objectives?.length ? `Learning Objectives: ${input.objectives.join(", ")}` : ""}

Return JSON with this exact shape:
{
  "title": "string",
  "subject": "string",
  "gradeLevel": "string",
  "duration": number,
  "objectives": ["string"],
  "introduction": "string (5 min hook)",
  "mainContent": [
    {
      "section": "string",
      "content": "string",
      "duration": number,
      "teacherActivity": "string",
      "studentActivity": "string"
    }
  ],
  "assessment": "string",
  "homework": "string",
  "materials": ["string"],
  "teacherNotes": "string"
}`;

    const result = await centralAIService.generateText(
      { prompt, systemPrompt, maxTokens: 2000, jsonSchema: false },
      this.ctx(companyId, userId, "lesson_plan", idempotencyKey)
    );

    const parsed = this.safeParseJson<Omit<DraftLessonPlan, "creditsConsumed">>(
      result.text,
      {
        title: `${input.topic} — Lesson Plan`,
        subject: input.subject,
        gradeLevel: input.gradeLevel,
        duration: input.duration,
        objectives: input.objectives ?? ["To be specified by teacher"],
        introduction: result.text.slice(0, 500),
        mainContent: [],
        assessment: "To be specified by teacher",
        homework: "To be specified by teacher",
        materials: [],
        teacherNotes: result.text,
      }
    );

    return { ...parsed, creditsConsumed: result.creditsConsumed };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 2. ASSIGNMENT GENERATOR
  // ──────────────────────────────────────────────────────────────────────────

  async generateAssignment(
    input: AssignmentGenerationInput,
    companyId: string,
    userId: string,
    idempotencyKey?: string
  ): Promise<DraftAssignment> {
    const systemPrompt = `You are an expert teacher creating academic assignments. Return valid JSON only. No markdown, no extra text.`;

    const prompt = `Create a ${input.subject} assignment:
Topic: ${input.topic}
Grade Level: ${input.gradeLevel}
Difficulty: ${input.difficulty}
Number of Questions: ${input.questionCount}
Question Types: ${input.questionTypes.join(", ")}
${input.instructions ? `Additional Instructions: ${input.instructions}` : ""}
${input.rubric ? "Include a marking rubric." : ""}

Return JSON with this exact shape:
{
  "title": "string",
  "subject": "string",
  "instructions": "string",
  "questions": [
    {
      "questionText": "string",
      "questionType": "multiple_choice|short_answer|essay|true_false|fill_blank",
      "options": ["string"] or null,
      "correctAnswer": "string" or null,
      "points": number,
      "hint": "string" or null
    }
  ],
  "totalPoints": number,
  "rubric": "string" or null
}`;

    const result = await centralAIService.generateText(
      { prompt, systemPrompt, maxTokens: 2500, jsonSchema: false },
      this.ctx(companyId, userId, "assignment_gen", idempotencyKey)
    );

    const parsed = this.safeParseJson<Omit<DraftAssignment, "creditsConsumed">>(
      result.text,
      {
        title: `${input.topic} Assignment`,
        subject: input.subject,
        instructions: "Complete all questions below.",
        questions: [],
        totalPoints: input.questionCount * 10,
        rubric: undefined,
      }
    );

    return { ...parsed, creditsConsumed: result.creditsConsumed };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 3. ASSESSMENT / QUIZ GENERATOR (reuses assignment logic, quiz framing)
  // ──────────────────────────────────────────────────────────────────────────

  async generateAssessment(
    input: AssignmentGenerationInput & { assessmentType?: "quiz" | "test" | "exam" },
    companyId: string,
    userId: string,
    idempotencyKey?: string
  ): Promise<DraftAssignment> {
    const type = input.assessmentType ?? "quiz";
    return this.generateAssignment(
      {
        ...input,
        instructions: `This is a ${type}. Answer all questions carefully.`,
      },
      companyId,
      userId,
      idempotencyKey
    );
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 4. GRADING ASSISTANT
  // ──────────────────────────────────────────────────────────────────────────

  async generateGradingFeedback(
    input: GradingFeedbackInput,
    companyId: string,
    userId: string,
    idempotencyKey?: string
  ): Promise<DraftGradingFeedback> {
    const systemPrompt = `You are an experienced teacher providing grading feedback. Return valid JSON only.`;

    const prompt = `Grade this student submission:
Subject: ${input.subject}
Grade Level: ${input.gradeLevel}
Question: ${input.questionText}
Max Points: ${input.maxPoints}
${input.rubric ? `Rubric: ${input.rubric}` : ""}

Student's Answer:
${input.submissionText}

Return JSON:
{
  "suggestedScore": number (0 to ${input.maxPoints}),
  "feedback": "detailed feedback string",
  "strengths": ["string"],
  "improvements": ["string"]
}`;

    const result = await centralAIService.generateText(
      { prompt, systemPrompt, maxTokens: 800, jsonSchema: false },
      this.ctx(companyId, userId, "grade_assist", idempotencyKey)
    );

    const parsed = this.safeParseJson<Omit<DraftGradingFeedback, "creditsConsumed">>(
      result.text,
      {
        suggestedScore: 0,
        feedback: result.text,
        strengths: [],
        improvements: ["Teacher review required"],
      }
    );

    return { ...parsed, creditsConsumed: result.creditsConsumed };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 5. REPORT CARD COMMENT GENERATOR
  // ──────────────────────────────────────────────────────────────────────────

  async generateReportComment(
    input: ReportCommentInput,
    companyId: string,
    userId: string,
    idempotencyKey?: string
  ): Promise<DraftReportComment> {
    const systemPrompt = `You are an experienced teacher writing end-of-term report card comments. Be professional, specific, positive, and constructive. Return valid JSON only.`;

    const prompt = `Write a report card comment for:
Student: ${input.studentName}
Subject: ${input.subject}
Average Score: ${input.averageScore}%
Grade: ${input.letterGrade}
Absences: ${input.absences}
${input.strengths ? `Strengths: ${input.strengths}` : ""}
${input.areasForImprovement ? `Areas for Improvement: ${input.areasForImprovement}` : ""}

Write a 3-5 sentence professional comment. Return JSON:
{
  "comment": "string"
}`;

    const result = await centralAIService.generateText(
      { prompt, systemPrompt, maxTokens: 400, jsonSchema: false },
      this.ctx(companyId, userId, "report_comment", idempotencyKey)
    );

    const parsed = this.safeParseJson<{ comment: string }>(result.text, {
      comment: result.text.slice(0, 500),
    });

    return { comment: parsed.comment, creditsConsumed: result.creditsConsumed };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 6. STORY GENERATOR (for younger students)
  // ──────────────────────────────────────────────────────────────────────────

  async generateStory(
    input: StoryGenerationInput,
    companyId: string,
    userId: string,
    idempotencyKey?: string
  ): Promise<DraftStory> {
    const systemPrompt = `You are a children's book author. Write age-appropriate, engaging stories. Return valid JSON only.`;

    const prompt = `Write a children's story:
Theme: ${input.theme}
Age Group: ${input.ageGroup}
Number of Pages: ${input.pageCount}
${input.title ? `Title: ${input.title}` : ""}
${input.moralLesson ? `Moral Lesson: ${input.moralLesson}` : ""}
${input.characters?.length ? `Characters: ${input.characters.join(", ")}` : ""}
${input.setting ? `Setting: ${input.setting}` : ""}
Language: ${input.language ?? "English"}

Return JSON:
{
  "title": "string",
  "pages": [
    {
      "pageNumber": number,
      "text": "string (1-3 short sentences for a child)",
      "illustrationPrompt": "string (description for illustrator/image AI)"
    }
  ],
  "moralLesson": "string",
  "discussionQuestions": ["string"]
}`;

    const result = await centralAIService.generateText(
      { prompt, systemPrompt, maxTokens: 2000, jsonSchema: false },
      this.ctx(companyId, userId, "story_gen", idempotencyKey)
    );

    const parsed = this.safeParseJson<Omit<DraftStory, "creditsConsumed">>(
      result.text,
      {
        title: input.title ?? "A New Story",
        pages: [],
        moralLesson: input.moralLesson ?? "Be kind and honest",
        discussionQuestions: [],
      }
    );

    return { ...parsed, creditsConsumed: result.creditsConsumed };
  }

  // ──────────────────────────────────────────────────────────────────────────
  // 7. ACTIVITY CONTENT GENERATOR (drawing prompts, puzzle, sing-along, etc.)
  // ──────────────────────────────────────────────────────────────────────────

  async generateActivityContent(
    input: ActivityContentInput,
    companyId: string,
    userId: string,
    idempotencyKey?: string
  ): Promise<DraftActivityContent> {
    const systemPrompt = `You are a creative early childhood education specialist. Return valid JSON only.`;

    let activityPrompt = "";
    let jsonShape = "";

    switch (input.activityType) {
      case "drawing":
        activityPrompt = `Create a drawing activity prompt for children aged ${input.ageGroup ?? "4-7 years"} on the theme "${input.theme ?? "nature"}".`;
        jsonShape = `{"title":"string","instructions":"string","content":{"prompts":["string"],"guidedSteps":["string"],"illustrationTips":["string"]}}`;
        break;
      case "puzzle-play":
        activityPrompt = `Create a matching/memory puzzle game for children aged ${input.ageGroup ?? "4-7 years"} on the theme "${input.theme ?? "animals"}".`;
        jsonShape = `{"title":"string","instructions":"string","content":{"type":"matching","pairs":[{"question":"string","answer":"string"}]}}`;
        break;
      case "sing-along":
        activityPrompt = `Write a short sing-along song for children aged ${input.ageGroup ?? "3-6 years"} about "${input.theme ?? "numbers"}". Include the chorus and 2 verses.`;
        jsonShape = `{"title":"string","instructions":"string","content":{"lyrics":"string","chorus":"string","tempo":"slow|medium|fast","actions":["string"]}}`;
        break;
      case "make-friends":
        activityPrompt = `Create a structured social activity for children aged ${input.ageGroup ?? "4-7 years"} to practise making friends and sharing on the theme "${input.theme ?? "teamwork"}".`;
        jsonShape = `{"title":"string","instructions":"string","content":{"scenario":"string","steps":["string"],"reflectionQuestions":["string"]}}`;
        break;
    }

    const prompt = `${activityPrompt}
Language: ${input.language ?? "English"}
Return JSON exactly matching this shape: ${jsonShape}`;

    const result = await centralAIService.generateText(
      { prompt, systemPrompt, maxTokens: 1200, jsonSchema: false },
      this.ctx(companyId, userId, `activity_${input.activityType}`, idempotencyKey)
    );

    const parsed = this.safeParseJson<{ title: string; instructions: string; content: Record<string, unknown> }>(
      result.text,
      {
        title: `${input.activityType} Activity`,
        instructions: "Follow along with the activity.",
        content: { raw: result.text },
      }
    );

    return { ...parsed, creditsConsumed: result.creditsConsumed };
  }
}

// Singleton export
export const schoolAIService = new SchoolAIService();
