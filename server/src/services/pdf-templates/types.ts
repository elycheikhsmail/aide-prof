export interface QuestionData {
  number: number;
  statement: string;
  points: number;
  estimatedLines: number;
}

export interface TemplateData {
  title: string;
  subject: string;
  formattedDate: string;
  totalPoints: number;
  questions: QuestionData[];
  includeQuestions: boolean;
  includeAnswerSpace: boolean;
}

export type TemplateFunction = (data: TemplateData) => string;
