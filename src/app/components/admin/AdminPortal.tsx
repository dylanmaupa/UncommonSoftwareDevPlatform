import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { supabase } from '../../../lib/supabase';
import {
  LuLayoutDashboard,
  LuUsers,
  LuBookOpen,
  LuClipboardList,
  LuActivity,
  LuLogOut,
  LuSearch,
  LuRefreshCw,
  LuShieldCheck,
  LuGraduationCap,
  LuChevronUp,
  LuChevronDown,
  LuMinus,
} from 'react-icons/lu';
import { toast } from 'sonner';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: string | null;
  hub_location: string | null;
  streak: number | null;
  longest_streak: number | null;
  xp: number | null;
  last_activity_date: string | null;
  achievements: string[] | null;
  gender: string | null;
  avatar_url: string | null;
}

interface Course {
  id: string;
  title: string;
  description: string;
  icon: string | null;
  difficulty: string | null;
  total_lessons: number | null;
  estimated_hours: number | null;
  created_at: string;
}

interface Submission {
  id: string;
  instructor_id: string;
  student_id: string;
  title: string;
  language: string;
  status: string;
  submitted_at: string | null;
  created_at: string;
  due_date: string | null;
}

interface ActivityLog {
  id: string;
  user_id: string;
  active_date: string;
  created_at: string;
}

type TabId = 'overview' | 'users' | 'instructors' | 'courses' | 'submissions' | 'activity';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (date: string | null) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const roleBadge = (role: string | null) => {
  if (role === 'instructor') return 'bg-blue-200 text-blue-800';
  if (role === 'student') return 'bg-blue-100 text-blue-700';
  return 'bg-blue-50 text-blue-400';
};

const statusBadge = (status: string) => {
  if (status === 'approved') return 'bg-blue-700 text-white';
  if (status === 'reviewed') return 'bg-blue-400 text-white';
  if (status === 'submitted') return 'bg-blue-200 text-blue-800';
  return 'bg-blue-50 text-blue-500';
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color }: {
  label: string; value: number | string; sub?: string;
  icon: React.ElementType; color: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 flex gap-4 items-start">
      <div className={`flex-shrink-0 h-11 w-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-bold text-foreground mt-0.5">{value}</p>
        {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ─── Table Wrapper ────────────────────────────────────────────────────────────
function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-card">
      <table className="w-full text-left text-sm">{children}</table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground bg-sidebar/50 border-b border-border whitespace-nowrap">
      {children}
    </th>
  );
}

function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-foreground border-b border-border/50 last:border-b-0 ${className}`}>{children}</td>;
}

function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-10 text-center text-muted-foreground text-sm">
        {message}
      </td>
    </tr>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function AdminPortal() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');

  // Data
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // ── Auth guard: only allow admin bypass ─────────────────────────────────────
  useEffect(() => {
    const isAdmin = localStorage.getItem('admin_bypass') === 'true';
    if (!isAdmin) {
      navigate('/');
    }
  }, [navigate]);

  // ── Fetch all data ───────────────────────────────────────────────────────────
  const fetchAll = async () => {
    setRefreshing(true);
    try {
      const [
        { data: profilesData },
        { data: coursesData },
        { data: submissionsData },
        { data: activityData },
      ] = await Promise.all([
        supabase.from('profiles').select('*').order('last_activity_date', { ascending: false, nullsFirst: false }),
        supabase.from('courses').select('*').order('created_at', { ascending: false }),
        supabase.from('instructor_exercises').select('*').order('created_at', { ascending: false }),
        supabase.from('user_activity_logs').select('*').order('active_date', { ascending: false }).limit(200),
      ]);

      setProfiles((profilesData as Profile[]) || []);
      setCourses((coursesData as Course[]) || []);
      setSubmissions((submissionsData as Submission[]) || []);
      setActivityLogs((activityData as ActivityLog[]) || []);
    } catch (err) {
      console.error('Admin fetch error', err);
      toast.error('Failed to load some data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // ── Derived data ─────────────────────────────────────────────────────────────
  const students = useMemo(() => profiles.filter(p => p.role === 'student'), [profiles]);
  const instructors = useMemo(() => profiles.filter(p => p.role === 'instructor'), [profiles]);

  const profileMap = useMemo(() => {
    const m = new Map<string, Profile>();
    profiles.forEach(p => m.set(p.id, p));
    return m;
  }, [profiles]);

  // Filtered lists based on search
  const filteredProfiles = useMemo(() => {
    if (!search) return profiles;
    const q = search.toLowerCase();
    return profiles.filter(p =>
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.role || '').toLowerCase().includes(q) ||
      (p.hub_location || '').toLowerCase().includes(q)
    );
  }, [profiles, search]);

  const filteredInstructors = useMemo(() => {
    if (!search) return instructors;
    const q = search.toLowerCase();
    return instructors.filter(p =>
      (p.full_name || '').toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.hub_location || '').toLowerCase().includes(q)
    );
  }, [instructors, search]);

  const filteredCourses = useMemo(() => {
    if (!search) return courses;
    const q = search.toLowerCase();
    return courses.filter(c =>
      (c.title || '').toLowerCase().includes(q) ||
      (c.difficulty || '').toLowerCase().includes(q)
    );
  }, [courses, search]);

  const filteredSubmissions = useMemo(() => {
    if (!search) return submissions;
    const q = search.toLowerCase();
    return submissions.filter(s =>
      (s.title || '').toLowerCase().includes(q) ||
      (s.status || '').toLowerCase().includes(q) ||
      (profileMap.get(s.student_id)?.full_name || '').toLowerCase().includes(q) ||
      (profileMap.get(s.instructor_id)?.full_name || '').toLowerCase().includes(q)
    );
  }, [submissions, search, profileMap]);

  const filteredActivity = useMemo(() => {
    if (!search) return activityLogs;
    const q = search.toLowerCase();
    return activityLogs.filter(a =>
      (profileMap.get(a.user_id)?.full_name || '').toLowerCase().includes(q) ||
      (profileMap.get(a.user_id)?.email || '').toLowerCase().includes(q)
    );
  }, [activityLogs, search, profileMap]);

  // Top stats
  const pendingCount = submissions.filter(s => s.status === 'assigned').length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const reviewedCount = submissions.filter(s => s.status === 'reviewed' || s.status === 'approved').length;
  const hubs = [...new Set(instructors.map(i => i.hub_location).filter(Boolean))];

  // ── Tabs config ───────────────────────────────────────────────────────────────
  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LuLayoutDashboard },
    { id: 'users', label: 'All Users', icon: LuUsers, count: profiles.length },
    { id: 'instructors', label: 'Instructors', icon: LuShieldCheck, count: instructors.length },
    { id: 'courses', label: 'Courses', icon: LuBookOpen, count: courses.length },
    { id: 'submissions', label: 'Submissions', icon: LuClipboardList, count: submissions.length },
    { id: 'activity', label: 'Activity', icon: LuActivity, count: activityLogs.length },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_bypass');
    localStorage.removeItem('instructor_bypass');
    navigate('/');
    toast.success('Logged out');
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading admin data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-sidebar">

      {/* ── Sidebar ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-card h-full">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="h-9 w-9 rounded-xl bg-blue-700 flex items-center justify-center flex-shrink-0">
            <LuShieldCheck className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">Admin Portal</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Uncommon Studio</p>
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">Navigation</p>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  active
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums ${
                    active ? 'bg-blue-100 text-blue-700' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom: user + logout */}
        <div className="px-3 py-4 border-t border-border space-y-2">
          <div className="px-3 py-2 rounded-xl bg-sidebar">
            <p className="text-xs font-semibold text-foreground truncate">admin@uncommon.org</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Super Admin</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-blue-800 hover:bg-blue-50 transition-colors"
          >
            <LuLogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Right panel ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* Topbar */}
        <header className="sticky top-0 z-20 flex items-center gap-3 px-6 py-3 border-b border-border bg-card/95 backdrop-blur shrink-0">
          {/* Mobile brand */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="h-7 w-7 rounded-lg bg-blue-700 flex items-center justify-center">
              <LuShieldCheck className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-sm font-bold text-foreground">Admin</span>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeTab}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-9 w-full rounded-full border border-border bg-sidebar pl-9 pr-3 text-sm text-foreground outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-200"
            />
          </div>

          <button
            onClick={fetchAll}
            disabled={refreshing}
            className="h-9 w-9 flex items-center justify-center rounded-full border border-border bg-sidebar text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors flex-shrink-0"
            title="Refresh data"
          >
            <LuRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Mobile logout */}
          <button
            onClick={handleLogout}
            className="lg:hidden flex items-center gap-1.5 h-9 px-3 rounded-full bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm font-medium border border-blue-200"
          >
            <LuLogOut className="h-4 w-4" />
          </button>
        </header>

        {/* Mobile tab strip */}
        <nav className="lg:hidden flex overflow-x-auto border-b border-border bg-card px-4 gap-1 shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); }}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active ? 'border-blue-700 text-blue-700' : 'border-transparent text-muted-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

        {/* ── OVERVIEW ── */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-foreground">Platform Overview</h2>
              <p className="text-sm text-muted-foreground mt-1">Real-time snapshot of the entire Uncommon Studio platform.</p>
            </div>

            {/* KPI row 1 */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              <StatCard label="Total Users" value={profiles.length} icon={LuUsers} color="bg-blue-700 text-white" sub="All roles" />
              <StatCard label="Students" value={students.length} icon={LuGraduationCap} color="bg-blue-500 text-white" sub="Enrolled" />
              <StatCard label="Instructors" value={instructors.length} icon={LuShieldCheck} color="bg-blue-400 text-white" sub={`${hubs.length} hubs`} />
              <StatCard label="Courses" value={courses.length} icon={LuBookOpen} color="bg-blue-300 text-blue-900" sub="Published" />
              <StatCard label="Submissions" value={submissions.length} icon={LuClipboardList} color="bg-blue-200 text-blue-800" sub={`${pendingCount} pending`} />
              <StatCard label="Activity Logs" value={activityLogs.length} icon={LuActivity} color="bg-blue-100 text-blue-700" sub="Last 200" />
            </div>

            {/* Submission breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Assigned (Not started)</p>
                <p className="text-3xl font-bold text-foreground mt-2">{pendingCount}</p>
                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-blue-200 rounded-full" style={{ width: submissions.length ? `${(pendingCount / submissions.length) * 100}%` : '0%' }} />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Submitted (Awaiting review)</p>
                <p className="text-3xl font-bold text-foreground mt-2">{submittedCount}</p>
                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: submissions.length ? `${(submittedCount / submissions.length) * 100}%` : '0%' }} />
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Reviewed / Approved</p>
                <p className="text-3xl font-bold text-foreground mt-2">{reviewedCount}</p>
                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                  <div className="h-full bg-blue-700 rounded-full" style={{ width: submissions.length ? `${(reviewedCount / submissions.length) * 100}%` : '0%' }} />
                </div>
              </div>
            </div>

            {/* Hubs summary */}
            {hubs.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-5">
                <h3 className="font-semibold text-foreground mb-4">Hub Breakdown</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {hubs.map(hub => {
                    const hubInstructors = instructors.filter(i => i.hub_location === hub).length;
                    const hubStudents = students.filter(s => s.hub_location === hub).length;
                    return (
                      <div key={hub} className="rounded-xl border border-border bg-sidebar p-3">
                        <p className="font-semibold text-foreground text-sm capitalize">{hub}</p>
                        <p className="text-xs text-muted-foreground mt-1">{hubInstructors} instructor{hubInstructors !== 1 ? 's' : ''} · {hubStudents} student{hubStudents !== 1 ? 's' : ''}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recent registrations */}
            <div className="rounded-2xl border border-border bg-card">
              <div className="p-5 border-b border-border">
                <h3 className="font-semibold text-foreground">Top Students by XP</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Highest XP earners on the platform</p>
              </div>
              <TableWrap>
                <thead>
                  <tr>
                    <Th>Rank</Th><Th>Student</Th><Th>Hub</Th><Th>XP</Th><Th>Streak</Th><Th>Last Active</Th>
                  </tr>
                </thead>
                <tbody>
                  {[...students].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)).slice(0, 10).map((s, i) => (
                    <tr key={s.id} className="hover:bg-sidebar/40 transition-colors">
                      <Td className="font-bold text-muted-foreground">#{i + 1}</Td>
                      <Td>
                        <p className="font-medium">{s.full_name || '—'}</p>
                        <p className="text-xs text-muted-foreground">{s.email}</p>
                      </Td>
                      <Td><span className="capitalize text-xs">{s.hub_location || '—'}</span></Td>
                      <Td><span className="font-semibold text-blue-700">{(s.xp ?? 0).toLocaleString()}</span></Td>
                      <Td><span className="font-semibold text-blue-500">🔥 {s.streak ?? 0}</span></Td>
                      <Td className="text-muted-foreground text-xs">{fmt(s.last_activity_date)}</Td>
                    </tr>
                  ))}
                  {students.length === 0 && <EmptyRow cols={6} message="No students yet." />}
                </tbody>
              </TableWrap>
            </div>
          </div>
        )}

        {/* ── ALL USERS ── */}
        {activeTab === 'users' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-foreground">All Users</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{filteredProfiles.length} of {profiles.length} users</p>
              </div>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Hub</Th><Th>XP</Th><Th>Streak</Th><Th>Longest Streak</Th><Th>Achievements</Th><Th>Last Active</Th>
                </tr>
              </thead>
              <tbody>
                {filteredProfiles.length > 0 ? filteredProfiles.map(p => (
                  <tr key={p.id} className="hover:bg-sidebar/40 transition-colors">
                    <Td>
                      <p className="font-medium whitespace-nowrap">{p.full_name || '—'}</p>
                      <p className="text-xs text-muted-foreground font-mono">{p.id.slice(0, 8)}…</p>
                    </Td>
                    <Td className="text-xs text-muted-foreground">{p.email}</Td>
                    <Td>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleBadge(p.role)}`}>
                        {p.role || 'unknown'}
                      </span>
                    </Td>
                    <Td className="capitalize text-xs text-muted-foreground">{p.hub_location || '—'}</Td>
                    <Td className="font-semibold text-blue-700">{(p.xp ?? 0).toLocaleString()}</Td>
                    <Td>🔥 {p.streak ?? 0}</Td>
                    <Td>{p.longest_streak ?? 0}</Td>
                    <Td>{(p.achievements ?? []).length}</Td>
                    <Td className="text-xs text-muted-foreground whitespace-nowrap">{fmt(p.last_activity_date)}</Td>
                  </tr>
                )) : <EmptyRow cols={9} message="No users match your search." />}
              </tbody>
            </TableWrap>
          </div>
        )}

        {/* ── INSTRUCTORS ── */}
        {activeTab === 'instructors' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Instructors</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{filteredInstructors.length} instructor{filteredInstructors.length !== 1 ? 's' : ''}</p>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Name</Th><Th>Email</Th><Th>Hub</Th><Th>Streak</Th><Th>Exercises Assigned</Th><Th>Last Active</Th>
                </tr>
              </thead>
              <tbody>
                {filteredInstructors.length > 0 ? filteredInstructors.map(i => {
                  const assigned = submissions.filter(s => s.instructor_id === i.id).length;
                  return (
                    <tr key={i.id} className="hover:bg-sidebar/40 transition-colors">
                      <Td>
                        <p className="font-medium">{i.full_name || '—'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{i.id.slice(0, 8)}…</p>
                      </Td>
                      <Td className="text-xs text-muted-foreground">{i.email}</Td>
                      <Td>
                        {i.hub_location
                          ? <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 capitalize">{i.hub_location}</span>
                          : <span className="text-xs text-muted-foreground">Not assigned</span>}
                      </Td>
                      <Td>🔥 {i.streak ?? 0}</Td>
                      <Td>
                        <span className="font-semibold text-blue-700">{assigned}</span>
                        <span className="text-xs text-muted-foreground ml-1">exercise{assigned !== 1 ? 's' : ''}</span>
                      </Td>
                      <Td className="text-xs text-muted-foreground whitespace-nowrap">{fmt(i.last_activity_date)}</Td>
                    </tr>
                  );
                }) : <EmptyRow cols={6} message="No instructors match your search." />}
              </tbody>
            </TableWrap>
          </div>
        )}

        {/* ── COURSES ── */}
        {activeTab === 'courses' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">Courses</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCourses.length > 0 ? filteredCourses.map(c => (
                <div key={c.id} className="rounded-2xl border border-border bg-card p-5 flex gap-4">
                  <div className="h-14 w-14 rounded-xl bg-sidebar border border-border flex items-center justify-center text-2xl flex-shrink-0">
                    {c.icon || '📚'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-foreground truncate">{c.title}</p>
                      <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        c.difficulty === 'Beginner' ? 'bg-blue-100 text-blue-700' :
                        c.difficulty === 'Intermediate' ? 'bg-blue-300 text-blue-800' :
                        'bg-blue-700 text-white'
                      }`}>{c.difficulty || '—'}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                    <div className="mt-3 flex gap-3 text-xs text-muted-foreground">
                      <span>📖 {c.total_lessons ?? 0} lessons</span>
                      <span>⏱ {c.estimated_hours ?? 0}h</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">Created {fmt(c.created_at)}</p>
                  </div>
                </div>
              )) : (
                <div className="col-span-3 text-center py-12 text-muted-foreground text-sm">
                  No courses match your search.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── SUBMISSIONS ── */}
        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">All Submissions</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} across all instructors</p>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  <Th>Title</Th><Th>Student</Th><Th>Instructor</Th><Th>Language</Th><Th>Status</Th><Th>Due</Th><Th>Submitted</Th><Th>Created</Th>
                </tr>
              </thead>
              <tbody>
                {filteredSubmissions.length > 0 ? filteredSubmissions.map(s => {
                  const student = profileMap.get(s.student_id);
                  const instructor = profileMap.get(s.instructor_id);
                  return (
                    <tr key={s.id} className="hover:bg-sidebar/40 transition-colors">
                      <Td>
                        <p className="font-medium max-w-[180px] truncate" title={s.title}>{s.title}</p>
                        <p className="text-xs text-muted-foreground font-mono">{s.id.slice(0, 8)}…</p>
                      </Td>
                      <Td>
                        <p className="font-medium text-xs">{student?.full_name || '—'}</p>
                        <p className="text-[10px] text-muted-foreground">{student?.email || s.student_id.slice(0, 8)}</p>
                      </Td>
                      <Td>
                        <p className="font-medium text-xs">{instructor?.full_name || '—'}</p>
                        <p className="text-[10px] text-muted-foreground">{instructor?.hub_location || '—'}</p>
                      </Td>
                      <Td>
                        <span className="font-mono text-xs bg-sidebar px-2 py-0.5 rounded border border-border">{s.language}</span>
                      </Td>
                      <Td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${statusBadge(s.status)}`}>{s.status}</span>
                      </Td>
                      <Td className="text-xs text-muted-foreground whitespace-nowrap">{fmt(s.due_date)}</Td>
                      <Td className="text-xs text-muted-foreground whitespace-nowrap">{fmt(s.submitted_at)}</Td>
                      <Td className="text-xs text-muted-foreground whitespace-nowrap">{fmt(s.created_at)}</Td>
                    </tr>
                  );
                }) : <EmptyRow cols={8} message="No submissions match your search." />}
              </tbody>
            </TableWrap>
          </div>
        )}

        {/* ── ACTIVITY ── */}
        {activeTab === 'activity' && (
          <div className="space-y-4">
            <div>
              <h2 className="text-xl font-bold text-foreground">User Activity Log</h2>
              <p className="text-sm text-muted-foreground mt-0.5">Most recent {filteredActivity.length} activity entries</p>
            </div>
            <TableWrap>
              <thead>
                <tr>
                  <Th>User</Th><Th>Email</Th><Th>Role</Th><Th>Hub</Th><Th>Active Date</Th>
                </tr>
              </thead>
              <tbody>
                {filteredActivity.length > 0 ? filteredActivity.map(a => {
                  const user = profileMap.get(a.user_id);
                  return (
                    <tr key={a.id} className="hover:bg-sidebar/40 transition-colors">
                      <Td>
                        <p className="font-medium">{user?.full_name || '—'}</p>
                        <p className="text-xs text-muted-foreground font-mono">{a.user_id.slice(0, 8)}…</p>
                      </Td>
                      <Td className="text-xs text-muted-foreground">{user?.email || '—'}</Td>
                      <Td>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${roleBadge(user?.role ?? null)}`}>
                          {user?.role || 'unknown'}
                        </span>
                      </Td>
                      <Td className="capitalize text-xs text-muted-foreground">{user?.hub_location || '—'}</Td>
                      <Td className="font-medium text-sm whitespace-nowrap">{fmt(a.active_date)}</Td>
                    </tr>
                  );
                }) : <EmptyRow cols={5} message="No activity logs match your search." />}
              </tbody>
            </TableWrap>
          </div>
        )}

        </main>
      </div>
    </div>
  );
}
