import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { authService } from '../../services/mockData';
import {
  LayoutDashboard,
  Inbox,
  BookOpen,
  ListChecks,
  Users,
  Settings,
  LogOut,
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

  const friends = [
    { name: 'Bagas Mahpie', status: 'Friend' },
    { name: 'Sir Dandy', status: 'Old Friend' },
    { name: 'Jhon Tosan', status: 'Friend' },
  ];

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] p-0">
      <div className="mx-auto flex h-screen max-w-[1280px] overflow-hidden border border-[rgba(0,0,0,0.08)] bg-white shadow-sm">
        <aside className="flex w-56 shrink-0 flex-col overflow-y-auto border-r border-[rgba(0,0,0,0.08)] bg-white px-3 py-6">
          <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-[#0747a1]/10">
              <img
                src="https://uncommon.org/images/hd-logo.svg"
                alt="Uncommon logo"
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="heading-font text-base normal-case" style={{ color: '#1a1a2e' }}>
              Coursue
            </span>
          </Link>

          <div className="space-y-7">
            <div>
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]/70">Overview</p>
              <nav className="space-y-1">
                {overviewItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;

                  return (
                    <Link
                      key={`${item.label}-${item.path}`}
                      to={item.path}
                      className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                        isActive ? 'text-[#1a1a2e]' : 'text-[#6B7280] hover:bg-[#F5F5FA] hover:text-[#1a1a2e]'
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
              <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]/70">Friends</p>
              <div className="space-y-3 px-2">
                {friends.map((friend) => (
                  <div key={friend.name} className="flex items-center gap-2">
                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#F5F5FA] text-[10px] text-[#6B7280]">
                      {friend.name[0]}
                    </div>
                    <div>
                      <p className="text-xs text-[#1a1a2e]">{friend.name}</p>
                      <p className="text-[10px] text-[#6B7280]">{friend.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-auto space-y-1 pt-8">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#6B7280]/70">Settings</p>
            <Link
              to="/settings"
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                location.pathname === '/settings'
                  ? 'text-[#1a1a2e]'
                  : 'text-[#6B7280] hover:bg-[#F5F5FA] hover:text-[#1a1a2e]'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Setting</span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="mt-1 w-full justify-start gap-2 rounded-lg px-2 py-2 text-sm text-[#FF6B35] hover:bg-[#F5F5FA] hover:text-[#FF6B35]"
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
