import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { authService } from '../../services/mockData';
import {
  LayoutDashboard,
  BookOpen,
  FolderKanban,
  Trophy,
  User,
  Settings,
  LogOut,
  Code2,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Progress } from '../ui/progress';

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

  const xpToNextLevel = ((user.level) * 500) - user.xp;
  const progressToNextLevel = ((user.xp % 500) / 500) * 100;

  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
    { icon: BookOpen, label: 'Courses', path: '/courses' },
    { icon: FolderKanban, label: 'Projects', path: '/projects' },
    { icon: Trophy, label: 'Achievements', path: '/achievements' },
    { icon: User, label: 'Profile', path: '/profile' },
    { icon: Settings, label: 'Settings', path: '/settings' },
  ];

  const handleLogout = () => {
    authService.logout();
    toast.success('Logged out successfully');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#FAFAFA]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-[rgba(0,0,0,0.08)] flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-[rgba(0,0,0,0.08)]">
          <Link to="/dashboard" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-[#0747a1] flex items-center justify-center">
              <Code2 className="w-6 h-6 text-white" />
            </div>
            <span className="heading-font text-xl" style={{ color: '#1a1a2e' }}>
              uncommon
            </span>
          </Link>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-[rgba(0,0,0,0.08)]">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="w-12 h-12">
              <AvatarImage src={user.avatar} alt={user.nickname} />
              <AvatarFallback>{user.nickname[0]}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-[#1a1a2e] truncate">{user.nickname}</p>
              <p className="text-sm text-[#6B7280]">Level {user.level}</p>
            </div>
          </div>

          {/* XP Progress */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#6B7280]">XP Progress</span>
              <span className="font-medium text-[#0747a1] flex items-center gap-1">
                <Zap className="w-3 h-3" />
                {user.xp}
              </span>
            </div>
            <Progress value={progressToNextLevel} className="h-2" />
            <p className="text-xs text-[#6B7280]">
              {xpToNextLevel} XP to level {user.level + 1}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${isActive
                  ? 'bg-[#0747a1] text-white'
                  : 'text-[#6B7280] hover:bg-[#F5F5FA]'
                  }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium heading-font">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-[rgba(0,0,0,0.08)]">
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="w-full justify-start gap-3 text-[#6B7280] hover:bg-[#F5F5FA] hover:text-[#1a1a2e]"
          >
            <LogOut className="w-5 h-5" />
            <span className="heading-font">Log Out</span>
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
