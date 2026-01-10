import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Evaluation } from '../types';
import { mockEvaluations } from '../data/mockData';

interface EvaluationsContextType {
  evaluations: Evaluation[];
  addEvaluation: (evaluation: Evaluation) => void;
  removeEvaluation: (id: string) => void;
  updateEvaluation: (id: string, evaluation: Partial<Evaluation>) => void;
}

const EvaluationsContext = createContext<EvaluationsContextType | undefined>(undefined);

export function EvaluationsProvider({ children }: { children: ReactNode }) {
  // Initialiser avec les données mockées
  const [evaluations, setEvaluations] = useState<Evaluation[]>(mockEvaluations);

  const addEvaluation = (evaluation: Evaluation) => {
    setEvaluations((prev) => [...prev, evaluation]);
  };

  const removeEvaluation = (id: string) => {
    setEvaluations((prev) => prev.filter((e) => e.id !== id));
  };

  const updateEvaluation = (id: string, updates: Partial<Evaluation>) => {
    setEvaluations((prev) =>
      prev.map((e) => (e.id === id ? { ...e, ...updates } : e))
    );
  };

  return (
    <EvaluationsContext.Provider
      value={{ evaluations, addEvaluation, removeEvaluation, updateEvaluation }}
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
