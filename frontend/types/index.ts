export interface User {
  id: string;
  name: string;
  email: string;
  role: 'professor' | 'student';
  photo?: string;
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  studentCount: number;
}

export interface Evaluation {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: number; // en minutes
  totalPoints: number;
  professorId: string;
  classIds: string[];
  status: 'draft' | 'active' | 'correcting' | 'completed';
  questions: Question[];
}

export interface Question {
  id: string;
  number: number;
  statement: string;
  modelAnswer: string;
  points: number;
  estimatedLines: number;
}

export interface StudentCopy {
  id: string;
  evaluationId: string;
  studentId: string;
  scanUrl?: string;
  status: 'pending' | 'associated' | 'corrected' | 'validated';
  answers: Answer[];
  totalScore?: number;
  correctedAt?: string;
}

export interface Answer {
  questionId: string;
  studentAnswer: string;
  score?: number;
  comment?: string;
  aiSuggestion?: {
    score: number;
    comment: string;
    confidence: number;
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  classId: string;
  averageScore: number;
  rank?: number;
}

export interface EvaluationResult {
  evaluationId: string;
  studentId: string;
  studentName: string;
  score: number;
  maxScore: number;
  rank: number;
  progress: number; // pourcentage de progression par rapport à la moyenne
}
