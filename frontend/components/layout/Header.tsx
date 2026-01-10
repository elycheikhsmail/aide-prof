import { Link } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { Button } from '../ui';

interface HeaderProps {
  userName: string;
  userPhoto?: string;
  onLogout: () => void;
}

export function Header({ userName, userPhoto, onLogout }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors">
              Assistant d'Évaluation
            </Link>
          </div>
          <div className="flex items-center gap-4">
            {userPhoto && (
              <img
                src={userPhoto}
                alt={userName}
                className="w-10 h-10 rounded-full"
              />
            )}
            <span className="text-gray-700 font-medium">{userName}</span>
            <Button data-testid="logout-button" variant="ghost" size="sm" onClick={onLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
