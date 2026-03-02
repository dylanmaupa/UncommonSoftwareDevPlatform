import { useEffect, useState, ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { loadPyodideEnvironment } from '../../../lib/pyodide';
import {
  LuBookOpen,
  LuFolderKanban,
  LuLayoutDashboard,
  LuLogOut,
  LuSettings,
  LuTerminal,
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
  const [user, setUser] = useState<any>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  useEffect(() => {
    // Preload Python environment in the background silently
    loadPyodideEnvironment().catch(console.error);
  }, []);

  useEffect(() => {
    const loadUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsAuthLoading(false);
    };

    loadUser();
  }, []);

  useEffect(() => {
    if (!isAuthLoading && !user) {
      navigate('/');
    }
  }, [user, isAuthLoading, navigate]);

  useEffect(() => {
    const ensureGender = async () => {
      if (!user) return;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('gender')
        .eq('id', user.id)
        .single();

      if (!error && !profile?.gender && location.pathname !== '/profile') {
        navigate('/profile?setup=gender', { replace: true });
      }
    };

    if (!isAuthLoading && user) {
      ensureGender();
    }
  }, [isAuthLoading, user, location.pathname, navigate]);

  if (isAuthLoading) {
    return null;
  }

  if (!user) {
    return null;
  }

  const overviewItems = [
    { icon: LuLayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: LuTerminal, label: 'Sandbox', path: '/sandbox' },
    { icon: LuBookOpen, label: 'Courses', path: '/courses' },
    { icon: LuFolderKanban, label: 'Projects', path: '/projects' },
    { icon: LuTrophy, label: 'Achievements', path: '/achievements' },
    { icon: LuUser, label: 'Profile', path: '/profile' },
  ];
  const mobileNavItems = [...overviewItems, { icon: LuSettings, label: 'Settings', path: '/settings' }];

  const handleLogout = () => {
    supabase.auth.signOut();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-sidebar">
      <div className="mx-auto flex min-h-screen max-w-[1280px] flex-col border-x border-border bg-card shadow-sm lg:h-screen lg:flex-row lg:overflow-hidden lg:border">
        <header className="sticky top-0 z-20 border-b border-border bg-card/95 backdrop-blur lg:hidden">
          <div className="flex items-center justify-between gap-3 px-4 py-3">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10">
                <img
                  src="https://uncommon.org/images/hd-logo.svg"
                  alt="Uncommon logo"
                  className="h-5 w-5 object-contain"
                />
              </div>
              <span className="heading-font text-base normal-case text-foreground">Coursue</span>
            </Link>
            <div className="flex items-center gap-2">
              <Link
                to="/settings"
                className={`flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground ${location.pathname === '/settings'
                  ? 'bg-secondary text-foreground'
                  : 'bg-card hover:bg-secondary hover:text-foreground'
                  }`}
                aria-label="Settings"
              >
                <LuSettings className="h-4 w-4" />
              </Link>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleLogout}
                className="h-9 w-9 rounded-full border border-border bg-card text-[#FF6B35] hover:bg-secondary hover:text-[#FF6B35]"
              >
                <LuLogOut className="h-4 w-4" />
                <span className="sr-only">Logout</span>
              </Button>
            </div>
          </div>
          <nav className="overflow-x-auto px-2 pb-3">
            <div className="flex w-max items-center gap-1">
              {mobileNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <Link
                    key={`${item.label}-${item.path}-mobile`}
                    to={item.path}
                    className={`flex items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 text-sm transition-colors ${isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                      }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </nav>
        </header>

        <aside className="hidden w-56 shrink-0 flex-col overflow-y-auto border-r border-border bg-card px-3 py-6 lg:flex">
          <Link to="/dashboard" className="mb-8 flex items-center gap-2 px-2">
            <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary/10">
              <img
                src="https://uncommon.org/images/hd-logo.svg"
                alt="Uncommon logo"
                className="h-5 w-5 object-contain"
              />
            </div>
            <span className="heading-font text-base normal-case text-foreground">Coursue</span>
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
                    className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
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
              className={`flex items-center gap-2 rounded-lg px-2 py-2 text-sm transition-colors ${location.pathname === '/settings'
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
              className="mt-1 w-full justify-start gap-2 rounded-lg px-2 py-2 text-sm text-[#FF6B35] hover:bg-secondary hover:text-[#FF6B35]"
            >
              <LuLogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <main className="min-h-0 flex-1 lg:overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}



















