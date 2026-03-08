import { Outlet } from 'react-router-dom';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { useUIStore } from '@/core/store/ui.store';
import { cn } from '@/lib/utils';

export default function AdminLayout() {
  const { sidebarCollapsed } = useUIStore();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <Sidebar />
      
      <div
        className={cn(
          'flex flex-1 flex-col transition-all duration-300',
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        )}
      >
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
