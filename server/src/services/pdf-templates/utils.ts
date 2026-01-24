import type { Evaluation, Question } from '../../db/schema/index.js';
import type { TemplateData, QuestionData } from './types.js';

type EvaluationWithQuestions = Evaluation & { questions: Question[] };

export function containsArabic(text: string): boolean {
  const arabicRegex = /[\u0600-\u06FF\u0750-\u077F]/;
  return arabicRegex.test(text);
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function prepareTemplateData(
  evaluation: EvaluationWithQuestions,
  includeQuestions: boolean,
  includeAnswerSpace: boolean
): TemplateData {
  const questions: QuestionData[] = evaluation.questions.map((q, index) => ({
    number: q.number || index + 1,
    statement: escapeHtml(q.statement),
    points: q.points,
    estimatedLines: q.estimatedLines ?? q.points * 2,
  }));

  return {
    title: escapeHtml(evaluation.title),
    subject: escapeHtml(evaluation.subject),
    formattedDate: new Date(evaluation.date).toLocaleDateString('fr-FR'),
    totalPoints: evaluation.totalPoints,
    questions,
    includeQuestions,
    includeAnswerSpace,
  };
}
