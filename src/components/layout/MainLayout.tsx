import type { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  userName: string;
  userPhoto?: string;
  activePage: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

export function MainLayout({
  children,
  userName,
  userPhoto,
  activePage,
  onNavigate,
  onLogout,
}: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header userName={userName} userPhoto={userPhoto} onLogout={onLogout} />
      <div className="flex">
        <Sidebar activePage={activePage} onNavigate={onNavigate} />
        <main className="flex-1 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
