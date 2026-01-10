import { evaluationRepository } from '../repositories/evaluation.repository.js';
import { questionRepository } from '../repositories/question.repository.js';
import { studentCopyRepository } from '../repositories/studentCopy.repository.js';
import type { Evaluation } from '../db/schema/evaluations.js';
import type { Question } from '../db/schema/questions.js';
import type { CreateEvaluationInput, UpdateEvaluationInput, CreateQuestionInput } from '../validators/evaluation.validator.js';

export interface EvaluationWithQuestions extends Evaluation {
  questions: Question[];
  classIds: string[];
}

class EvaluationService {
  async findAll(): Promise<Evaluation[]> {
    return evaluationRepository.findAll();
  }

  async findByProfessorId(professorId: string): Promise<EvaluationWithQuestions[]> {
    const evaluations = await evaluationRepository.findByProfessorId(professorId);

    return Promise.all(
      evaluations.map(async (evaluation) => {
        const questions = await questionRepository.findByEvaluationId(evaluation.id);
        const classIds = await evaluationRepository.getEvaluationClasses(evaluation.id);
        return {
          ...evaluation,
          questions,
          classIds,
        };
      })
    );
  }

  async findById(id: string): Promise<EvaluationWithQuestions | null> {
    const evaluation = await evaluationRepository.findById(id);
    if (!evaluation) return null;

    const questions = await questionRepository.findByEvaluationId(id);
    const classIds = await evaluationRepository.getEvaluationClasses(id);

    return {
      ...evaluation,
      questions,
      classIds,
    };
  }

  async create(professorId: string, data: CreateEvaluationInput): Promise<EvaluationWithQuestions> {
    const { classIds, ...evaluationData } = data;

    const evaluation = await evaluationRepository.create({
      ...evaluationData,
      professorId,
    });

    // Add classes if provided
    if (classIds && classIds.length > 0) {
      await Promise.all(
        classIds.map((classId) =>
          evaluationRepository.addClassToEvaluation({
            evaluationId: evaluation.id,
            classId,
          })
        )
      );
    }

    return {
      ...evaluation,
      questions: [],
      classIds: classIds ?? [],
    };
  }

  async update(id: string, data: UpdateEvaluationInput): Promise<Evaluation | null> {
    return evaluationRepository.update(id, data);
  }

  async delete(id: string): Promise<boolean> {
    return evaluationRepository.delete(id);
  }

  async addQuestion(evaluationId: string, data: CreateQuestionInput): Promise<Question> {
    return questionRepository.create({
      ...data,
      evaluationId,
    });
  }

  async getQuestions(evaluationId: string): Promise<Question[]> {
    return questionRepository.findByEvaluationId(evaluationId);
  }

  async getCopies(evaluationId: string) {
    return studentCopyRepository.findByEvaluationId(evaluationId);
  }
}

export const evaluationService = new EvaluationService();
