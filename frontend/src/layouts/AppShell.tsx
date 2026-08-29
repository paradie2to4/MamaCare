import { Outlet } from 'react-router-dom';
import { Sidebar } from '../components/layout/Sidebar';
import { BottomNav } from '../components/layout/BottomNav';
import { AppHeader } from '../components/layout/AppHeader';

export function AppShell() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex min-h-screen flex-1 flex-col">
        <AppHeader />
        <main className="flex-1 px-4 pb-24 pt-4 md:px-8 md:pb-8 md:pt-6">
          <div className="mx-auto w-full max-w-3xl">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
