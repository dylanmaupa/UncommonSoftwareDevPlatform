import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { authService } from '../../services/mockData';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Trophy,
  Settings,
  LogOut,
  Code2,
  Inbox,
  ListChecks,
  Users,
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  if (!user) {
    navigate('/');
    return null;
  }

  const overviewItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: Inbox, label: 'Inbox', path: '/courses' },
    { icon: BookOpen, label: 'Lesson', path: '/courses' },
    { icon: ListChecks, label: 'Task', path: '/projects' },
    { icon: Users, label: 'Group', path: '/profile' },
  ];

  const friendItems = [
    { name: 'Bagas Mahpie', tag: 'Friend' },
    { name: 'Sir Dandy', tag: 'Old Friend' },
    { name: 'Jhon Tosan', tag: 'Friend' },
  ];

  const settingsItems = [
    { icon: Settings, label: 'Setting', path: '/settings' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
  ];

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-0">
      <div className="mx-auto flex h-screen max-w-[1280px] overflow-hidden border border-[rgba(0,0,0,0.08)] bg-white shadow-sm">
        <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-[rgba(0,0,0,0.08)] bg-[#FAFAFA] px-4 py-6 lg:flex lg:flex-col">
          <Link to="/dashboard" className="mb-8 flex items-center gap-3 px-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0747a1]/10">
              <Code2 className="h-4 w-4 text-[#0747a1]" />
            </div>
            <span className="heading-font text-lg" style={{ color: '#1a1a2e' }}>
              Uncommon Bootcamp Portal
            </span>
          </Link>

          <div className="space-y-6">
            <div>
              <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-[#6B7280]">Overview</p>
              <nav className="space-y-1">
                {overviewItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={`${item.label}-${item.path}`}
                      to={item.path}
                      className={`flex items-center gap-2 rounded-xl px-3 py-2 text-sm transition-colors ${
                        isActive ? 'bg-white text-[#1a1a2e] shadow-sm' : 'text-[#6B7280] hover:bg-white hover:text-[#1a1a2e]'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div>
              <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-[#6B7280]">Friends</p>
              <div className="space-y-1">
                {friendItems.map((friend) => (
                  <div key={friend.name} className="rounded-xl px-3 py-2">
                    <p className="text-sm text-[#1a1a2e]">{friend.name}</p>
                    <p className="text-xs text-[#6B7280]">{friend.tag}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-1 pt-6">
            <p className="px-2 pb-2 text-[10px] uppercase tracking-wider text-[#6B7280]">Settings</p>
            {settingsItems.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={`${item.label}-${item.path}`}
                  to={item.path}
                  className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-[#6B7280] transition-colors hover:bg-white hover:text-[#1a1a2e]"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="mt-2 w-full justify-start gap-2 rounded-xl px-3 py-2 text-sm text-[#6B7280] hover:bg-white hover:text-[#1a1a2e]"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
