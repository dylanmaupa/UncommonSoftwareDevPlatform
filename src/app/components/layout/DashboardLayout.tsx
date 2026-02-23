import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { authService } from '../../services/mockData';
import {
  LuBookOpen,
  LuFolderKanban,
  LuLayoutDashboard,
  LuLogOut,
  LuSettings,
  LuTrophy,
  LuUser,
} from 'react-icons/lu';
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
    { icon: LuLayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: LuBookOpen, label: 'Courses', path: '/courses' },
    { icon: LuFolderKanban, label: 'Projects', path: '/projects' },
    { icon: LuTrophy, label: 'Achievements', path: '/achievements' },
    { icon: LuUser, label: 'Profile', path: '/profile' },
  ];

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-sidebar p-0">
      <div className="mx-auto flex h-screen max-w-[1280px] overflow-hidden border border-border bg-card shadow-sm">
        <aside className="flex w-56 shrink-0 flex-col overflow-y-auto border-r border-border bg-card px-3 py-6">
          <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              <img
                src="https://uncommon.org/images/hd-logo.svg"
                alt="Uncommon logo"
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="heading-font text-base normal-case text-foreground">
              Coursue
            </span>
          </Link>

          <div>
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Overview</p>
            <nav className="space-y-1">
              {overviewItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={`${item.label}-${item.path}`}
                    to={item.path}
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                      isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="mt-auto space-y-1 pt-8">
            <p className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Settings</p>
            <Link
              to="/settings"
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${
                location.pathname === '/settings'
                  ? 'text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              <LuSettings className="h-4 w-4" />
              <span>Settings</span>
            </Link>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="mt-1 w-full justify-start gap-2 rounded-lg px-2 py-2 text-sm text-accent hover:bg-secondary hover:text-accent"
            >
              <LuLogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
