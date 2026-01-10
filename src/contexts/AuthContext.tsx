import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface User {
  email: string;
  role: 'prof' | 'eleve';
  name: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string, role: 'prof' | 'eleve') => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, password: string): boolean => {
    // Simulation de connexion avec les credentials fournis
    if (email === 'ely@gmail.com' && password === '1234') {
      setUser({
        email: 'ely@gmail.com',
        role: 'prof',
        name: 'Dr. Marie Dubois',
      });
      return true;
    }
    return false;
  };

  const register = (email: string, _password: string, role: 'prof' | 'eleve'): boolean => {
    // Simulation d'inscription - accepte tous les enregistrements
    setUser({
      email,
      role,
      name: role === 'prof' ? 'Professeur' : 'Étudiant',
    });
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
