import { config } from '../config/env';
console.log('API URL:', config.apiUrl);
// Types for API responses
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: 'professor' | 'student';
  photo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEvaluation {
  id: string;
  title: string;
  subject: string;
  date: string;
  duration: number;
  totalPoints: number;
  professorId: string;
  status: 'draft' | 'active' | 'correcting' | 'completed';
  createdAt: string;
  updatedAt: string;
  questions: ApiQuestion[];
  classIds: string[];
}

export interface ApiQuestion {
  id: string;
  evaluationId: string;
  number: number;
  statement: string;
  modelAnswer: string;
  points: number;
  estimatedLines: number;
  createdAt: string;
}

export interface ApiClass {
  id: string;
  name: string;
  subject: string;
  professorId: string;
  studentCount: number;
  createdAt: string;
  updatedAt: string;
}

// Custom API Error class
export class ApiError extends Error {
  public statusCode?: number;
  public data?: any;

  constructor(
    message: string,
    statusCode?: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.data = data;
  }
}

// Generic fetch wrapper with credentials and timeout
export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.apiTimeout);

  try {
    const response = await fetch(`${config.apiUrl}${endpoint}`, {
      ...options,
      signal: controller.signal,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.error || 'Une erreur est survenue',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw new ApiError('La requête a expiré', 408);
    }
    
    throw new ApiError('Erreur de connexion au serveur');
  }
}

// Auth API
export const authApi = {
  login: async (email: string, password: string) => {
    return apiFetch<{ user: ApiUser }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  register: async (name: string, email: string, password: string, role: 'professor' | 'student') => {
    return apiFetch<{ user: ApiUser }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, role }),
    });
  },

  logout: async () => {
    return apiFetch<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
  },

  me: async () => {
    return apiFetch<{ user: ApiUser }>('/auth/me');
  },
};

// Evaluations API
export const evaluationsApi = {
  getAll: async () => {
    return apiFetch<{ evaluations: ApiEvaluation[] }>('/evaluations');
  },

  getById: async (id: string) => {
    return apiFetch<{ evaluation: ApiEvaluation }>(`/evaluations/${id}`);
  },

  create: async (data: {
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
  }) => {
    return apiFetch<{ evaluation: ApiEvaluation }>('/evaluations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{
    title: string;
    subject: string;
    date: string;
    duration: number;
    totalPoints: number;
    status: 'draft' | 'active' | 'correcting' | 'completed';
  }>) => {
    return apiFetch<{ evaluation: ApiEvaluation }>(`/evaluations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiFetch<{ message: string }>(`/evaluations/${id}`, {
      method: 'DELETE',
    });
  },

  addQuestion: async (evaluationId: string, question: {
    number: number;
    statement: string;
    modelAnswer: string;
    points: number;
    estimatedLines: number;
  }) => {
    return apiFetch<{ question: ApiQuestion }>(`/evaluations/${evaluationId}/questions`, {
      method: 'POST',
      body: JSON.stringify(question),
    });
  },
};

// Classes API
export const classesApi = {
  getAll: async () => {
    return apiFetch<{ classes: ApiClass[] }>('/classes');
  },

  getById: async (id: string) => {
    return apiFetch<{ class: ApiClass }>(`/classes/${id}`);
  },

  create: async (data: { name: string; subject: string }) => {
    return apiFetch<{ class: ApiClass }>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  update: async (id: string, data: Partial<{ name: string; subject: string }>) => {
    return apiFetch<{ class: ApiClass }>(`/classes/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  delete: async (id: string) => {
    return apiFetch<{ message: string }>(`/classes/${id}`, {
      method: 'DELETE',
    });
  },
};
