import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Class } from '../types';
import { classesApi, ApiError } from '../services/api';
import { mapBackendClass } from '../utils/typeMappers';
import { useAuth } from './AuthContext';

interface CreateClassData {
  name: string;
  subject: string;
}

interface ClassesContextType {
  classes: Class[];
  isLoading: boolean;
  error: string | null;
  addClass: (data: CreateClassData) => Promise<Class | null>;
  removeClass: (id: string) => Promise<boolean>;
  updateClass: (id: string, updates: Partial<Class>) => Promise<Class | null>;
  refreshClasses: () => Promise<void>;
  clearError: () => void;
}

const ClassesContext = createContext<ClassesContextType | undefined>(undefined);

export function ClassesProvider({ children }: { children: ReactNode }) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const refreshClasses = async () => {
    if (!isAuthenticated || user?.role !== 'prof') return;
    
    setIsLoading(true);
    setError(null);
    try {
      const { classes: apiClasses } = await classesApi.getAll();
      setClasses(apiClasses.map(mapBackendClass));
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors du chargement des classes');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Charger les classes quand l'utilisateur est connecté
  useEffect(() => {
    if (isAuthenticated && user?.role === 'prof') {
      refreshClasses();
    } else {
      setClasses([]);
    }
  }, [isAuthenticated, user]);

  const addClass = async (data: CreateClassData): Promise<Class | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const { class: apiClass } = await classesApi.create(data);
      const newClass = mapBackendClass(apiClass);
      setClasses((prev) => [...prev, newClass]);
      return newClass;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors de la création de la classe');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const removeClass = async (id: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);
    try {
      await classesApi.delete(id);
      setClasses((prev) => prev.filter((c) => c.id !== id));
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors de la suppression de la classe');
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const updateClass = async (id: string, updates: Partial<Class>): Promise<Class | null> => {
    setIsLoading(true);
    setError(null);
    try {
      // Filtrer les champs qui peuvent être mis à jour
      const updateData: any = {};
      if (updates.name) updateData.name = updates.name;
      if (updates.subject) updateData.subject = updates.subject;

      const { class: apiClass } = await classesApi.update(id, updateData);
      const updatedClass = mapBackendClass(apiClass);
      
      setClasses((prev) =>
        prev.map((c) => (c.id === id ? updatedClass : c))
      );
      return updatedClass;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors de la mise à jour de la classe');
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return (
    <ClassesContext.Provider
      value={{
        classes,
        isLoading,
        error,
        addClass,
        removeClass,
        updateClass,
        refreshClasses,
        clearError,
      }}
    >
      {children}
    </ClassesContext.Provider>
  );
}

export function useClasses() {
  const context = useContext(ClassesContext);
  if (!context) {
    throw new Error('useClasses must be used within ClassesProvider');
  }
  return context;
}
