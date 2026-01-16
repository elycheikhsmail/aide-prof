import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Evaluation } from '../types';
import { evaluationsApi, ApiError } from '../services/api';
import { mapBackendEvaluation } from '../utils/typeMappers';
import { useAuth } from './AuthContext';

interface CreateEvaluationData {
  title: string;
  subject: string;
  date: string;
  duration: number;
  totalPoints: number;
  classIds?: string[];
  questions?: {
    number: number;
    statement: string;
    modelAnswer?: string;
    points: number;
    estimatedLines?: number;
  }[];
}

interface EvaluationsContextType {
  evaluations: Evaluation[];
  isLoading: boolean;
  error: string | null;
  addEvaluation: (data: CreateEvaluationData) => Promise<Evaluation | null>;
  removeEvaluation: (id: string) => Promise<boolean>;
  updateEvaluation: (id: string, updates: Partial<Evaluation>) => Promise<Evaluation | null>;
  refreshEvaluations: () => Promise<void>;
  clearError: () => void;
}

const EvaluationsContext = createContext<EvaluationsContextType | undefined>(undefined);

export function EvaluationsProvider({ children }: { children: ReactNode }) {
  const [evaluations, setEvaluations] = useState<Evaluation[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const refreshEvaluations = async () => {
    if (!isAuthenticated || user?.role !== 'prof') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { evaluations: apiEvaluations } = await evaluationsApi.getAll();
      setEvaluations(apiEvaluations.map(mapBackendEvaluation));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors du chargement des évaluations');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les évaluations quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user?.role === 'prof') {
      refreshEvaluations();
    } else {
      setEvaluations([]);
    }
  }, [isAuthenticated, user]);

  const addEvaluation = async (data: CreateEvaluationData): Promise<Evaluation | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { evaluation: apiEvaluation } = await evaluationsApi.create(data);
      const newEvaluation = mapBackendEvaluation(apiEvaluation);
      setEvaluations((prev) => [...prev, newEvaluation]);
      return newEvaluation;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors de la création de l\'évaluation');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeEvaluation = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await evaluationsApi.delete(id);
      setEvaluations((prev) => prev.filter((e) => e.id !== id));
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors de la suppression de l\'évaluation');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateEvaluation = async (id: string, updates: Partial<Evaluation>): Promise<Evaluation | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // Filtrer les champs qui peuvent être mis à jour
      const updateData: any = {};
      if (updates.title) updateData.title = updates.title;
      if (updates.subject) updateData.subject = updates.subject;
      if (updates.date) updateData.date = updates.date;
      if (updates.duration) updateData.duration = updates.duration;
      if (updates.totalPoints) updateData.totalPoints = updates.totalPoints;
      if (updates.status) updateData.status = updates.status;

      const { evaluation: apiEvaluation } = await evaluationsApi.update(id, updateData);
      const updatedEvaluation = mapBackendEvaluation(apiEvaluation);
      
      setEvaluations((prev) =>
        prev.map((e) => (e.id === id ? updatedEvaluation : e))
      );
      return updatedEvaluation;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors de la mise à jour de l\'évaluation');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <EvaluationsContext.Provider
      value={{
        evaluations,
        isLoading,
        error,
        addEvaluation,
        removeEvaluation,
        updateEvaluation,
        refreshEvaluations,
        clearError,
      }}
    >
      {children}
    </EvaluationsContext.Provider>
  );
}

export function useEvaluations() {
  const context = useContext(EvaluationsContext);
  if (!context) {
    throw new Error('useEvaluations must be used within EvaluationsProvider');
  }
  return context;
}
