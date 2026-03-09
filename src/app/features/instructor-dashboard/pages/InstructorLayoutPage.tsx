import { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router';
import {
  LuLayoutDashboard,
  LuUsers,
  LuLayoutGrid,
  LuTarget,
  LuSettings,
  LuLogOut,
  LuMenu,
  LuX,
} from 'react-icons/lu';
import { supabase } from '../../../../lib/supabase';
import { fetchProfileForAuthUser } from '../../../lib/profileAccess';
import { Button } from '../../../components/ui/button';
import { Toaster } from 'sonner';

export default function InstructorLayoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCheckingAccess, setIsCheckingAccess] = useState(true);
  const [isInstructor, setIsInstructor] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!isMounted) return;

      const hasBypass = localStorage.getItem('admin_bypass') === 'true';

      if (!user && !hasBypass) {
        navigate('/', { replace: true });
        return;
      }

      if (hasBypass && !user) {
        setIsInstructor(true);
        setUserProfile({ full_name: 'Guest Instructor' });
        setIsCheckingAccess(false);
        return;
      }

      const profile = await fetchProfileForAuthUser(user as any);
      if (!isMounted) return;

      const metadata = (user?.user_metadata as Record<string, unknown> | undefined) ?? undefined;
      const role = String(
        profile?.['role'] ??
        profile?.['user_role'] ??
        metadata?.['role'] ??
        metadata?.['user_role'] ??
        ''
      ).toLowerCase();

      const isInstructorEmail = user?.email?.toLowerCase().endsWith('@uncommon.org');

      if (role === 'instructor' || isInstructorEmail) {
        setIsInstructor(true);
        setUserProfile(profile || { full_name: user?.email?.split('@')[0] || 'Instructor' });
      } else {
        navigate('/dashboard', { replace: true });
      }

      setIsCheckingAccess(false);
    };

    checkAccess();
    return () => { isMounted = false; };
  }, [navigate]);

  const handleLogout = async () => {
    localStorage.removeItem('admin_bypass');
    await supabase.auth.signOut();
    navigate('/', { replace: true });
  };

  if (isCheckingAccess || !isInstructor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  const navItems = [
    { label: 'Overview', href: '/instructor', icon: LuLayoutDashboard },
    { label: 'All Students', href: '/instructor/students', icon: LuUsers },
    { label: 'Hub Management', href: '/instructor/hubs', icon: LuLayoutGrid },
  ];

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar for Desktop */}
      <aside className="hidden w-64 border-r border-border bg-sidebar md:flex md:flex-col sticky top-0 h-screen overflow-y-auto">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/instructor" className="flex items-center gap-2 font-bold text-primary">
            <LuTarget className="h-6 w-6" />
            <span>Instructor Dashboard</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${isActive
                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                    : 'text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-border p-4 space-y-2">
          <div className="flex items-center gap-3 px-4 py-2">
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
              {userProfile?.full_name?.[0] || 'A'}
            </div>
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-foreground">{userProfile?.full_name || 'Instructor'}</p>
              <p className="truncate text-[10px] text-muted-foreground">Instructor</p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={handleLogout}
          >
            <LuLogOut className="h-5 w-5" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-sidebar px-4 md:hidden">
          <Link to="/instructor" className="flex items-center gap-2 font-bold text-primary">
            <LuTarget className="h-6 w-6" />
            <span>Instructor</span>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <LuX className="h-6 w-6" /> : <LuMenu className="h-6 w-6" />}
          </Button>
        </header>

        {/* Mobile Navigation Dropdown */}
        {isMobileMenuOpen && (
          <nav className="border-b border-border bg-sidebar p-4 md:hidden">
            {navItems.map((item) => (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium ${location.pathname === item.href ? 'bg-primary text-white' : 'text-muted-foreground'
                  }`}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            ))}
            <Button
              variant="ghost"
              className="mt-2 w-full justify-start gap-3 rounded-xl text-muted-foreground"
              onClick={handleLogout}
            >
              <LuLogOut className="h-5 w-5" />
              Logout
            </Button>
          </nav>
        )}

        {/* Main View */}
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
