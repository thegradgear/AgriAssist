import type { ReactNode } from 'react';
import { AppHeader } from '@/components/layout/AppHeader';
import { ProtectedRoute } from '@/contexts/AuthContext';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col min-h-screen">
        <AppHeader />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
