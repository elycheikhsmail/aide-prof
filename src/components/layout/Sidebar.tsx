import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
} from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

const menuItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { id: 'evaluations', label: 'Mes évaluations', icon: FileText, path: '/evaluations' },
  { id: 'classes', label: 'Mes classes', icon: Users, path: '/classes' },
  { id: 'statistics', label: 'Statistiques', icon: BarChart3, path: '/statistics' },
  { id: 'settings', label: 'Paramètres', icon: Settings, path: '/settings' },
];

export function Sidebar({ activePage, onNavigate: _onNavigate }: SidebarProps) {
  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;

          return (
            <NavLink
              key={item.id}
              to={item.path}
              data-testid={`nav-${item.id}`}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
}
