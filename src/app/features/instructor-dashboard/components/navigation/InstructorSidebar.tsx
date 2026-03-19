import { Link, useLocation } from 'react-router';
import { 
  LuBarChart3, 
  LuBookOpen, 
  LuHome, 
  LuMegaphone, 
  LuUsers, 
  LuFileCheck,
  LuLayoutDashboard
} from 'react-icons/lu';

const navItems = [
  { label: 'Home', path: '/instructor', icon: LuHome },
  { label: 'Students', path: '/instructor/students', icon: LuUsers },
  { label: 'Exercises', path: '/instructor/exercises', icon: LuBookOpen },
  { label: 'Submissions', path: '/instructor/submissions', icon: LuFileCheck },
  { label: 'Analytics', path: '/instructor/analytics', icon: LuBarChart3 },
  { label: 'Announcements', path: '/instructor/announcements', icon: LuMegaphone },
];

export default function InstructorSidebar() {
  const location = useLocation();

  return (
    <aside className="rounded-2xl border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-white p-3 shadow-sm">
      <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wider text-blue-600/70">
        Instructor Panel
      </p>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === '/instructor'
              ? location.pathname === '/instructor'
              : location.pathname.startsWith(item.path);

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-blue-700/80 hover:bg-blue-100/80 hover:text-blue-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
