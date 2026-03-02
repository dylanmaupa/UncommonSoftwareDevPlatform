import { Link, useLocation } from 'react-router';
import { LuBuilding2, LuLayoutDashboard, LuUsers } from 'react-icons/lu';

const navItems = [
  { label: 'Dashboard', path: '/instructor', icon: LuLayoutDashboard },
  { label: 'Hubs', path: '/instructor/hubs', icon: LuBuilding2 },
  { label: 'Students', path: '/instructor/students', icon: LuUsers },
];

export default function InstructorSidebar() {
  const location = useLocation();

  return (
    <aside className="rounded-2xl border border-border bg-card p-3">
      <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
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
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-secondary text-foreground'
                  : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
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

