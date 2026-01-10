import type { ApiUser, ApiEvaluation, ApiQuestion, ApiClass } from '../services/api';
import type { Evaluation, Question, Class } from '../types';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'prof' | 'eleve';
  photo: string | null;
}

// Mapper les rôles backend vers frontend
export function mapBackendRole(role: 'professor' | 'student'): 'prof' | 'eleve' {
  return role === 'professor' ? 'prof' : 'eleve';
}

// Mapper les rôles frontend vers backend
export function mapFrontendRole(role: 'prof' | 'eleve'): 'professor' | 'student' {
  return role === 'prof' ? 'professor' : 'student';
}

// Mapper les utilisateurs backend vers frontend
export function mapBackendUser(apiUser: ApiUser): User {
  return {
    id: apiUser.id,
    email: apiUser.email,
    name: apiUser.name,
    role: mapBackendRole(apiUser.role),
    photo: apiUser.photo,
  };
}

// Mapper les questions backend vers frontend
export function mapBackendQuestion(apiQuestion: ApiQuestion): Question {
  return {
    id: apiQuestion.id,
    number: apiQuestion.number,
    statement: apiQuestion.statement,
    modelAnswer: apiQuestion.modelAnswer,
    points: apiQuestion.points,
    estimatedLines: apiQuestion.estimatedLines,
  };
}

// Mapper les évaluations backend vers frontend
export function mapBackendEvaluation(apiEvaluation: ApiEvaluation): Evaluation {
  return {
    id: apiEvaluation.id,
    title: apiEvaluation.title,
    subject: apiEvaluation.subject,
    date: apiEvaluation.date,
    duration: apiEvaluation.duration,
    totalPoints: apiEvaluation.totalPoints,
    professorId: apiEvaluation.professorId,
    classIds: apiEvaluation.classIds,
    status: apiEvaluation.status,
    questions: apiEvaluation.questions ? apiEvaluation.questions.map(mapBackendQuestion) : [],
  };
}

// Mapper les classes backend vers frontend
export function mapBackendClass(apiClass: ApiClass): Class {
  return {
    id: apiClass.id,
    name: apiClass.name,
    subject: apiClass.subject,
    studentCount: apiClass.studentCount,
  };
}
