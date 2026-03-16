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
  LuBell,
  LuChevronRight,
  LuBuilding2,
} from 'react-icons/lu';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
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

type TabId = 'overview' | 'users' | 'instructors' | 'courses' | 'submissions' | 'activity' | 'hubs';

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmt = (date: string | null) => {
  if (!date) return '—';
  return new Date(date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

const roleBadge = (role: string | null): 'default' | 'secondary' | 'outline' => {
  if (role === 'instructor') return 'default';
  if (role === 'student') return 'secondary';
  return 'outline';
};

const statusBadge = (status: string): 'default' | 'secondary' | 'outline' => {
  if (status === 'approved' || status === 'reviewed') return 'default';
  if (status === 'submitted') return 'secondary';
  return 'outline';
};

// ─── KPI Stat Card ────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon }: {
  label: string; value: number | string; sub?: string; icon: React.ElementType;
}) {
  return (
    <Card className="rounded-2xl border-border">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
          {sub && <p className="text-[11px] text-muted-foreground/70 mt-0.5">{sub}</p>}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Table helpers ────────────────────────────────────────────────────────────
function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-4 py-3 text-xs font-medium text-muted-foreground whitespace-nowrap">{children}</th>;
}
function Td({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 text-sm text-foreground border-t border-border ${className}`}>{children}</td>;
}
function EmptyRow({ cols, message }: { cols: number; message: string }) {
  return (
    <tr>
      <td colSpan={cols} className="px-4 py-8 text-center text-sm text-muted-foreground">{message}</td>
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
  const [selectedHub, setSelectedHub] = useState<string | null>(null);

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);

  // Auth guard
  useEffect(() => {
    if (localStorage.getItem('admin_bypass') !== 'true') navigate('/');
  }, [navigate]);

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
    } catch {
      toast.error('Failed to load some data');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const students = useMemo(() => profiles.filter(p => p.role === 'student'), [profiles]);
  const instructors = useMemo(() => profiles.filter(p => p.role === 'instructor'), [profiles]);
  const profileMap = useMemo(() => {
    const m = new Map<string, Profile>();
    profiles.forEach(p => m.set(p.id, p));
    return m;
  }, [profiles]);

  const q = search.toLowerCase();
  const filteredProfiles = useMemo(() => !search ? profiles : profiles.filter(p =>
    [p.full_name, p.email, p.role, p.hub_location].some(v => v?.toLowerCase().includes(q))
  ), [profiles, search, q]);
  const filteredInstructors = useMemo(() => !search ? instructors : instructors.filter(p =>
    [p.full_name, p.email, p.hub_location].some(v => v?.toLowerCase().includes(q))
  ), [instructors, search, q]);
  const filteredCourses = useMemo(() => !search ? courses : courses.filter(c =>
    [c.title, c.difficulty].some(v => v?.toLowerCase().includes(q))
  ), [courses, search, q]);
  const filteredSubmissions = useMemo(() => !search ? submissions : submissions.filter(s =>
    [s.title, s.status, profileMap.get(s.student_id)?.full_name, profileMap.get(s.instructor_id)?.full_name].some(v => v?.toLowerCase().includes(q))
  ), [submissions, search, q, profileMap]);
  const filteredActivity = useMemo(() => !search ? activityLogs : activityLogs.filter(a =>
    [profileMap.get(a.user_id)?.full_name, profileMap.get(a.user_id)?.email].some(v => v?.toLowerCase().includes(q))
  ), [activityLogs, search, q, profileMap]);

  const pendingCount = submissions.filter(s => s.status === 'assigned').length;
  const submittedCount = submissions.filter(s => s.status === 'submitted').length;
  const reviewedCount = submissions.filter(s => s.status === 'reviewed' || s.status === 'approved').length;
  const hubs = [...new Set(instructors.map(i => i.hub_location).filter(Boolean))];

  const tabs: { id: TabId; label: string; icon: React.ElementType; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: LuLayoutDashboard },
    { id: 'hubs', label: 'Hubs', icon: LuBuilding2, count: hubs.length },
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

  if (loading) {
    return (
      <div className="min-h-screen bg-sidebar flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
          <p className="text-sm text-muted-foreground">Loading admin data…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-sidebar">

      {/* ── Sidebar (matches DashboardLayout style) ── */}
      <aside className="hidden lg:flex flex-col w-60 shrink-0 border-r border-border bg-card h-full">
        {/* Brand */}
        <div className="flex items-center gap-3 px-5 py-5 border-b border-border">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
            <LuShieldCheck className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-bold text-foreground leading-none">Admin Portal</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Uncommon Studio</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          <p className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
            Navigation
          </p>
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); setSelectedHub(null); }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm transition-colors ${
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="flex-1 text-left">{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
                    active ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-secondary text-muted-foreground'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom */}
        <div className="px-3 py-4 border-t border-border space-y-1">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar">
            <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold flex-shrink-0">A</div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">admin@uncommon.org</p>
              <p className="text-[10px] text-muted-foreground">Super Admin</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
          >
            <LuLogOut className="h-4 w-4" />
            Log out
          </button>
        </div>
      </aside>

      {/* ── Right panel ── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* Topbar — matches Dashboard search bar style */}
        <div className="flex flex-wrap items-center gap-3 bg-sidebar border-b border-border px-4 py-3 shrink-0">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <LuShieldCheck className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <LuSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={`Search ${activeTab}…`}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none"
            />
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground"
              onClick={fetchAll}
              disabled={refreshing}
              title="Refresh"
            >
              <LuRefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground lg:hidden"
            >
              <LuBell className="h-4 w-4" />
            </Button>
            {/* User chip (matches Dashboard avatar chip) */}
            <div className="flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xs font-bold">A</div>
              <span className="hidden pr-1 text-sm text-foreground sm:block">Admin</span>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="rounded-full bg-secondary text-muted-foreground hover:bg-secondary/80 h-8 ml-1 text-xs hidden sm:flex"
              >
                Log out
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile tab strip */}
        <nav className="lg:hidden flex overflow-x-auto border-b border-border bg-card px-2 gap-0.5 shrink-0">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearch(''); setSelectedHub(null); }}
                className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-medium border-b-2 whitespace-nowrap transition-colors ${
                  active ? 'border-primary text-primary' : 'border-transparent text-muted-foreground'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Scrollable content */}
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6">

          {/* ── OVERVIEW ── */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              {/* Hero card — matches Dashboard primary card */}
              <Card className="overflow-hidden rounded-2xl border-border bg-primary">
                <CardContent className="p-4 sm:p-6">
                  <p className="text-xs uppercase tracking-wider text-primary-foreground/70">Admin Portal</p>
                  <h2 className="heading-font lowercase mt-2 text-2xl leading-tight text-primary-foreground sm:text-3xl">
                    Platform Overview
                  </h2>
                  <p className="mt-2 text-sm text-primary-foreground/80">
                    {profiles.length} users across {hubs.length} hub{hubs.length !== 1 ? 's' : ''}
                  </p>
                  <Button
                    className="mt-4 rounded-full bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                    onClick={fetchAll}
                    disabled={refreshing}
                  >
                    {refreshing ? 'Refreshing…' : 'Refresh Data'}
                  </Button>
                </CardContent>
              </Card>

              {/* KPI grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard label="Total Users" value={profiles.length} icon={LuUsers} sub="All roles" />
                <StatCard label="Students" value={students.length} icon={LuGraduationCap} sub="Enrolled" />
                <StatCard label="Instructors" value={instructors.length} icon={LuShieldCheck} sub={`${hubs.length} hubs`} />
                <StatCard label="Courses" value={courses.length} icon={LuBookOpen} sub="Published" />
                <StatCard label="Submissions" value={submissions.length} icon={LuClipboardList} sub={`${pendingCount} pending`} />
                <StatCard label="Activity Logs" value={activityLogs.length} icon={LuActivity} sub="Last 200" />
              </div>

              {/* Two-col layout like Dashboard */}
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
                {/* Left: submission breakdown + top students */}
                <div className="space-y-4">
                  {/* Submission status */}
                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h3 className="text-base text-foreground heading-font lowercase">Submission Status</h3>
                        <LuClipboardList className="h-4 w-4 text-muted-foreground" />
                      </div>
                      <div className="p-4 space-y-3">
                        {[
                          { label: 'Assigned', count: pendingCount, pct: submissions.length ? (pendingCount / submissions.length) * 100 : 0 },
                          { label: 'Submitted', count: submittedCount, pct: submissions.length ? (submittedCount / submissions.length) * 100 : 0 },
                          { label: 'Reviewed', count: reviewedCount, pct: submissions.length ? (reviewedCount / submissions.length) * 100 : 0 },
                        ].map(({ label, count, pct }) => (
                          <div key={label}>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-muted-foreground">{label}</span>
                              <span className="font-semibold text-foreground">{count}</span>
                            </div>
                            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top students table */}
                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-0">
                      <div className="flex items-center justify-between border-b border-border px-4 py-3">
                        <h3 className="text-base text-foreground heading-font lowercase">Top Students by XP</h3>
                        <button onClick={() => { setActiveTab('users'); setSearch(''); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          See all <LuChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[400px] text-left">
                          <thead>
                            <tr className="text-xs text-muted-foreground">
                              <Th>#</Th><Th>Student</Th><Th>Hub</Th><Th>XP</Th><Th>Streak</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {[...students].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)).slice(0, 8).map((s, i) => (
                              <tr key={s.id}>
                                <Td className="font-semibold text-muted-foreground text-xs">#{i + 1}</Td>
                                <Td>
                                  <p className="font-medium">{s.full_name || '—'}</p>
                                  <p className="text-xs text-muted-foreground">{s.email}</p>
                                </Td>
                                <Td className="capitalize text-xs text-muted-foreground">{s.hub_location || '—'}</Td>
                                <Td className="font-semibold text-primary">{(s.xp ?? 0).toLocaleString()}</Td>
                                <Td>🔥 {s.streak ?? 0}</Td>
                              </tr>
                            ))}
                            {students.length === 0 && <EmptyRow cols={5} message="No students yet." />}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right sidebar: hubs + recent activity */}
                <div className="space-y-4">
                  {/* Hubs */}
                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base text-foreground heading-font lowercase">Hubs</h3>
                        <LuUsers className="h-4 w-4 text-muted-foreground" />
                      </div>
                      {hubs.length > 0 ? hubs.map(hub => {
                        const hi = instructors.filter(i => i.hub_location === hub).length;
                        const hs = students.filter(s => s.hub_location === hub).length;
                        return (
                          <div key={hub} className="flex items-center justify-between rounded-xl bg-sidebar p-2">
                            <p className="text-sm text-foreground capitalize">{hub}</p>
                            <p className="text-xs text-muted-foreground">{hi}i · {hs}s</p>
                          </div>
                        );
                      }) : (
                        <p className="text-xs text-muted-foreground">No hubs found.</p>
                      )}
                    </CardContent>
                  </Card>

                  {/* Recent activity */}
                  <Card className="rounded-2xl border-border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base text-foreground heading-font lowercase">Recent Activity</h3>
                        <button onClick={() => { setActiveTab('activity'); setSearch(''); }} className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1">
                          All <LuChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                      {activityLogs.slice(0, 8).map(a => {
                        const user = profileMap.get(a.user_id);
                        return (
                          <div key={a.id} className="flex items-center justify-between rounded-xl bg-sidebar p-2">
                            <div>
                              <p className="text-sm text-foreground">{user?.full_name || '—'}</p>
                              <p className="text-xs text-muted-foreground capitalize">{user?.role || 'unknown'}</p>
                            </div>
                            <p className="text-xs text-muted-foreground">{fmt(a.active_date)}</p>
                          </div>
                        );
                      })}
                      {activityLogs.length === 0 && (
                        <p className="text-xs text-muted-foreground">No recent activity.</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* ── ALL USERS ── */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg text-foreground heading-font lowercase">all users</h2>
                <p className="text-sm text-muted-foreground">{filteredProfiles.length} of {profiles.length} users</p>
              </div>
              <Card className="rounded-2xl border-border">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full min-w-[600px] text-left">
                    <thead className="text-xs text-muted-foreground">
                      <tr>
                        <Th>Name</Th><Th>Email</Th><Th>Role</Th><Th>Hub</Th><Th>XP</Th><Th>Streak</Th><Th>Last Active</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.length > 0 ? filteredProfiles.map(p => (
                        <tr key={p.id} className="hover:bg-sidebar/50 transition-colors">
                          <Td>
                            <p className="font-medium">{p.full_name || '—'}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.id.slice(0, 8)}…</p>
                          </Td>
                          <Td className="text-xs text-muted-foreground">{p.email}</Td>
                          <Td><Badge variant={roleBadge(p.role)} className="capitalize text-xs">{p.role || 'unknown'}</Badge></Td>
                          <Td className="capitalize text-xs text-muted-foreground">{p.hub_location || '—'}</Td>
                          <Td className="font-semibold text-primary">{(p.xp ?? 0).toLocaleString()}</Td>
                          <Td>🔥 {p.streak ?? 0}</Td>
                          <Td className="text-xs text-muted-foreground">{fmt(p.last_activity_date)}</Td>
                        </tr>
                      )) : <EmptyRow cols={7} message="No users match your search." />}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── INSTRUCTORS ── */}
          {activeTab === 'instructors' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg text-foreground heading-font lowercase">instructors</h2>
                <p className="text-sm text-muted-foreground">{filteredInstructors.length} instructor{filteredInstructors.length !== 1 ? 's' : ''}</p>
              </div>
              <Card className="rounded-2xl border-border">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full min-w-[480px] text-left">
                    <thead>
                      <tr>
                        <Th>Name</Th><Th>Email</Th><Th>Hub</Th><Th>Streak</Th><Th>Exercises Assigned</Th><Th>Last Active</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInstructors.length > 0 ? filteredInstructors.map(i => {
                        const assigned = submissions.filter(s => s.instructor_id === i.id).length;
                        return (
                          <tr key={i.id} className="hover:bg-sidebar/50 transition-colors">
                            <Td>
                              <p className="font-medium">{i.full_name || '—'}</p>
                              <p className="text-xs text-muted-foreground font-mono">{i.id.slice(0, 8)}…</p>
                            </Td>
                            <Td className="text-xs text-muted-foreground">{i.email}</Td>
                            <Td>
                              {i.hub_location
                                ? <Badge variant="secondary" className="capitalize text-xs">{i.hub_location}</Badge>
                                : <span className="text-xs text-muted-foreground">Not assigned</span>}
                            </Td>
                            <Td>🔥 {i.streak ?? 0}</Td>
                            <Td className="font-semibold text-primary">{assigned}</Td>
                            <Td className="text-xs text-muted-foreground">{fmt(i.last_activity_date)}</Td>
                          </tr>
                        );
                      }) : <EmptyRow cols={6} message="No instructors found." />}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── COURSES ── */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg text-foreground heading-font lowercase">courses</h2>
                <p className="text-sm text-muted-foreground">{filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredCourses.length > 0 ? filteredCourses.map(c => (
                  <Card key={c.id} className="rounded-2xl border-border">
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-3">
                        <div className="h-12 w-12 rounded-xl bg-sidebar border border-border flex items-center justify-center text-2xl flex-shrink-0">
                          {c.icon || '📚'}
                        </div>
                        <Badge variant={
                          c.difficulty === 'Beginner' ? 'secondary' :
                          c.difficulty === 'Intermediate' ? 'outline' : 'default'
                        } className="text-xs capitalize mt-1">{c.difficulty || '—'}</Badge>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{c.title}</p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{c.description}</p>
                      </div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>📖 {c.total_lessons ?? 0} lessons</span>
                        <span>⏱ {c.estimated_hours ?? 0}h</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Created {fmt(c.created_at)}</p>
                    </CardContent>
                  </Card>
                )) : (
                  <div className="col-span-3 rounded-2xl border border-dashed border-border bg-sidebar p-8 text-center text-sm text-muted-foreground">
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
                <h2 className="text-lg text-foreground heading-font lowercase">all submissions</h2>
                <p className="text-sm text-muted-foreground">{filteredSubmissions.length} submission{filteredSubmissions.length !== 1 ? 's' : ''} across all instructors</p>
              </div>
              <Card className="rounded-2xl border-border">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full min-w-[640px] text-left">
                    <thead>
                      <tr>
                        <Th>Title</Th><Th>Student</Th><Th>Instructor</Th><Th>Language</Th><Th>Status</Th><Th>Due</Th><Th>Submitted</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSubmissions.length > 0 ? filteredSubmissions.map(s => {
                        const student = profileMap.get(s.student_id);
                        const instructor = profileMap.get(s.instructor_id);
                        return (
                          <tr key={s.id} className="hover:bg-sidebar/50 transition-colors">
                            <Td>
                              <p className="font-medium truncate max-w-[160px]" title={s.title}>{s.title}</p>
                            </Td>
                            <Td>
                              <p className="text-xs font-medium">{student?.full_name || '—'}</p>
                              <p className="text-[10px] text-muted-foreground">{student?.email || '—'}</p>
                            </Td>
                            <Td>
                              <p className="text-xs font-medium">{instructor?.full_name || '—'}</p>
                              <p className="text-[10px] text-muted-foreground capitalize">{instructor?.hub_location || '—'}</p>
                            </Td>
                            <Td>
                              <span className="font-mono text-xs bg-sidebar px-2 py-0.5 rounded border border-border">{s.language}</span>
                            </Td>
                            <Td>
                              <Badge variant={statusBadge(s.status)} className="capitalize text-xs">{s.status}</Badge>
                            </Td>
                            <Td className="text-xs text-muted-foreground whitespace-nowrap">{fmt(s.due_date)}</Td>
                            <Td className="text-xs text-muted-foreground whitespace-nowrap">{fmt(s.submitted_at)}</Td>
                          </tr>
                        );
                      }) : <EmptyRow cols={7} message="No submissions found." />}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── ACTIVITY ── */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div>
                <h2 className="text-lg text-foreground heading-font lowercase">user activity log</h2>
                <p className="text-sm text-muted-foreground">Most recent {filteredActivity.length} entries</p>
              </div>
              <Card className="rounded-2xl border-border">
                <CardContent className="p-0 overflow-x-auto">
                  <table className="w-full min-w-[400px] text-left">
                    <thead>
                      <tr>
                        <Th>User</Th><Th>Email</Th><Th>Role</Th><Th>Hub</Th><Th>Active Date</Th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredActivity.length > 0 ? filteredActivity.map(a => {
                        const user = profileMap.get(a.user_id);
                        return (
                          <tr key={a.id} className="hover:bg-sidebar/50 transition-colors">
                            <Td>
                              <p className="font-medium">{user?.full_name || '—'}</p>
                              <p className="text-xs text-muted-foreground font-mono">{a.user_id.slice(0, 8)}…</p>
                            </Td>
                            <Td className="text-xs text-muted-foreground">{user?.email || '—'}</Td>
                            <Td><Badge variant={roleBadge(user?.role ?? null)} className="capitalize text-xs">{user?.role || 'unknown'}</Badge></Td>
                            <Td className="capitalize text-xs text-muted-foreground">{user?.hub_location || '—'}</Td>
                            <Td className="font-medium text-sm">{fmt(a.active_date)}</Td>
                          </tr>
                        );
                      }) : <EmptyRow cols={5} message="No activity logs found." />}
                    </tbody>
                  </table>
                </CardContent>
              </Card>
            </div>
          )}

          {/* ── HUBS ── */}
          {activeTab === 'hubs' && (() => {
            const allHubs = [...new Set(profiles.map(p => p.hub_location).filter(Boolean))] as string[];

            // ── Hub detail view ────────────────────────────────────────────────
            if (selectedHub) {
              const hub = selectedHub;
              const hubInstructors = instructors.filter(i => i.hub_location === hub);
              const hubStudents = students.filter(s => s.hub_location === hub);
              const hubMemberIds = new Set([...hubInstructors, ...hubStudents].map(p => p.id));
              const hubSubmissions = submissions.filter(s => hubInstructors.some(i => i.id === s.instructor_id));
              const pendingHub = hubSubmissions.filter(s => s.status === 'assigned').length;
              const submittedHub = hubSubmissions.filter(s => s.status === 'submitted').length;
              const reviewedHub = hubSubmissions.filter(s => s.status === 'reviewed' || s.status === 'approved').length;
              const hubActivity = activityLogs.filter(a => hubMemberIds.has(a.user_id));

              return (
                <div className="space-y-4">
                  {/* Back button + title */}
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => { setSelectedHub(null); setSearch(''); }}
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <LuChevronRight className="h-4 w-4 rotate-180" />
                      All Hubs
                    </button>
                    <span className="text-muted-foreground">/</span>
                    <h2 className="text-lg text-foreground heading-font lowercase capitalize">{hub}</h2>
                  </div>

                  {/* Top KPI row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <Card className="rounded-2xl border-border"><CardContent className="p-4">
                      <p className="text-2xl font-bold text-foreground">{hubInstructors.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Instructors</p>
                    </CardContent></Card>
                    <Card className="rounded-2xl border-border"><CardContent className="p-4">
                      <p className="text-2xl font-bold text-foreground">{hubStudents.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Students</p>
                    </CardContent></Card>
                    <Card className="rounded-2xl border-border"><CardContent className="p-4">
                      <p className="text-2xl font-bold text-primary">{hubStudents.reduce((s, p) => s + (p.xp ?? 0), 0).toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground mt-1">Total XP</p>
                    </CardContent></Card>
                    <Card className="rounded-2xl border-border"><CardContent className="p-4">
                      <p className="text-2xl font-bold text-foreground">{hubSubmissions.length}</p>
                      <p className="text-xs text-muted-foreground mt-1">Submissions</p>
                    </CardContent></Card>
                  </div>

                  <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_260px]">
                    {/* Left: instructors + students */}
                    <div className="space-y-4">
                      {/* Instructors */}
                      <Card className="rounded-2xl border-border">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <h3 className="text-base text-foreground heading-font lowercase">instructors</h3>
                            <LuShieldCheck className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="p-3 space-y-1">
                            {hubInstructors.length > 0 ? hubInstructors.map(i => (
                              <div key={i.id} className="flex items-center justify-between rounded-xl bg-sidebar px-3 py-2">
                                <div>
                                  <p className="text-sm text-foreground">{i.full_name || '—'}</p>
                                  <p className="text-xs text-muted-foreground">{i.email}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-medium text-foreground">🔥 {i.streak ?? 0}</p>
                                  <p className="text-xs text-muted-foreground">{fmt(i.last_activity_date)}</p>
                                </div>
                              </div>
                            )) : <p className="text-xs text-muted-foreground px-3 py-2">No instructors in this hub.</p>}
                          </div>
                        </CardContent>
                      </Card>

                      {/* Students */}
                      <Card className="rounded-2xl border-border">
                        <CardContent className="p-0">
                          <div className="flex items-center justify-between border-b border-border px-4 py-3">
                            <h3 className="text-base text-foreground heading-font lowercase">students</h3>
                            <LuGraduationCap className="h-4 w-4 text-muted-foreground" />
                          </div>
                          <div className="overflow-x-auto">
                            <table className="w-full min-w-[400px] text-left">
                              <thead>
                                <tr className="text-xs text-muted-foreground">
                                  <Th>Name</Th><Th>XP</Th><Th>Streak</Th><Th>Longest Streak</Th><Th>Last Active</Th>
                                </tr>
                              </thead>
                              <tbody>
                                {[...hubStudents].sort((a, b) => (b.xp ?? 0) - (a.xp ?? 0)).map(s => (
                                  <tr key={s.id} className="hover:bg-sidebar/50 transition-colors">
                                    <Td>
                                      <p className="font-medium">{s.full_name || '—'}</p>
                                      <p className="text-xs text-muted-foreground">{s.email}</p>
                                    </Td>
                                    <Td className="font-semibold text-primary">{(s.xp ?? 0).toLocaleString()}</Td>
                                    <Td>🔥 {s.streak ?? 0}</Td>
                                    <Td>{s.longest_streak ?? 0}</Td>
                                    <Td className="text-xs text-muted-foreground whitespace-nowrap">{fmt(s.last_activity_date)}</Td>
                                  </tr>
                                ))}
                                {hubStudents.length === 0 && <EmptyRow cols={5} message="No students in this hub." />}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Right sidebar: submissions + activity */}
                    <div className="space-y-4">
                      {/* Submission status */}
                      <Card className="rounded-2xl border-border">
                        <CardContent className="p-4 space-y-3">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base text-foreground heading-font lowercase">submissions</h3>
                            <LuClipboardList className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {[
                            { label: 'Assigned', count: pendingHub, pct: hubSubmissions.length ? (pendingHub / hubSubmissions.length) * 100 : 0 },
                            { label: 'Submitted', count: submittedHub, pct: hubSubmissions.length ? (submittedHub / hubSubmissions.length) * 100 : 0 },
                            { label: 'Reviewed', count: reviewedHub, pct: hubSubmissions.length ? (reviewedHub / hubSubmissions.length) * 100 : 0 },
                          ].map(({ label, count, pct }) => (
                            <div key={label}>
                              <div className="flex justify-between text-xs mb-1">
                                <span className="text-muted-foreground">{label}</span>
                                <span className="font-semibold text-foreground">{count}</span>
                              </div>
                              <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                                <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          ))}
                          {hubSubmissions.length === 0 && <p className="text-xs text-muted-foreground">No submissions yet.</p>}
                        </CardContent>
                      </Card>

                      {/* Activity log */}
                      <Card className="rounded-2xl border-border">
                        <CardContent className="p-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-base text-foreground heading-font lowercase">activity</h3>
                            <LuActivity className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {hubActivity.length > 0 ? hubActivity.slice(0, 10).map(a => {
                            const member = profileMap.get(a.user_id);
                            return (
                              <div key={a.id} className="flex items-center justify-between rounded-xl bg-sidebar px-3 py-2">
                                <div>
                                  <p className="text-sm text-foreground">{member?.full_name || '—'}</p>
                                  <p className="text-xs text-muted-foreground capitalize">{member?.role || 'unknown'}</p>
                                </div>
                                <p className="text-xs text-muted-foreground whitespace-nowrap">{fmt(a.active_date)}</p>
                              </div>
                            );
                          }) : <p className="text-xs text-muted-foreground">No activity logged yet.</p>}
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              );
            }

            // ── Hub picker grid ────────────────────────────────────────────────
            return (
              <div className="space-y-4">
                <div>
                  <h2 className="text-lg text-foreground heading-font lowercase">select a hub</h2>
                  <p className="text-sm text-muted-foreground">Choose a hub to view its activity, members, and submissions.</p>
                </div>

                {allHubs.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border bg-sidebar p-8 text-center text-sm text-muted-foreground">
                    No hubs found. Hubs are assigned via user profiles.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {allHubs.map(hub => {
                    const hi = instructors.filter(i => i.hub_location === hub).length;
                    const hs = students.filter(s => s.hub_location === hub).length;
                    const totalXP = students.filter(s => s.hub_location === hub).reduce((sum, s) => sum + (s.xp ?? 0), 0);
                    const hubSubs = submissions.filter(s => instructors.filter(i => i.hub_location === hub).some(i => i.id === s.instructor_id)).length;
                    return (
                      <button
                        key={hub}
                        onClick={() => setSelectedHub(hub)}
                        className="text-left group"
                      >
                        <Card className="rounded-2xl border-border group-hover:border-primary/50 transition-colors cursor-pointer">
                          <CardContent className="p-5 space-y-4">
                            {/* Hub icon + name */}
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-xl bg-primary/10 flex items-center justify-center text-primary flex-shrink-0">
                                  <LuBuilding2 className="h-6 w-6" />
                                </div>
                                <div>
                                  <p className="font-semibold text-foreground capitalize">{hub}</p>
                                  <p className="text-xs text-muted-foreground">{hi} instructor{hi !== 1 ? 's' : ''} · {hs} student{hs !== 1 ? 's' : ''}</p>
                                </div>
                              </div>
                              <LuChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            </div>

                            {/* Stats row */}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="rounded-xl bg-sidebar px-3 py-2">
                                <p className="text-sm font-semibold text-primary">{totalXP.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">Total XP</p>
                              </div>
                              <div className="rounded-xl bg-sidebar px-3 py-2">
                                <p className="text-sm font-semibold text-foreground">{hubSubs}</p>
                                <p className="text-xs text-muted-foreground">Submissions</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}

        </main>
      </div>
    </div>
  );
}
