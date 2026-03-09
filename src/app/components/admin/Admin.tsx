import { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import StreakWidget from '../dashboard/StreakWidget';
// @ts-ignore
import dashboardAvatar from '../../../assets/avatar2.png';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { calculateUserLevel } from '../../../lib/gamificationUtils';
import { getGreeting } from '../../lib/timeUtils';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  LuBell,
  LuBookOpen,
  LuBuilding2,
  LuCircleCheck,
  LuClock3,
  LuEllipsis,
  LuFolderKanban,
  LuKey,
  LuLayoutDashboard,
  LuMegaphone,
  LuSearch,
  LuSettings,
  LuSparkles,
  LuTarget,
  LuTriangle,
  LuUsers,
  LuActivity,
} from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { fetchProfileForAuthUser } from '../../lib/profileAccess';

// Import new page components
import OverviewPage from '../../features/instructor-dashboard/pages/OverviewPage';
import StudentsPage from '../../features/instructor-dashboard/pages/StudentsPage';
import ExercisesPage from '../../features/instructor-dashboard/pages/ExercisesPage';
import SubmissionsPage from '../../features/instructor-dashboard/pages/SubmissionsPage';
import AnalyticsPage from '../../features/instructor-dashboard/pages/AnalyticsPage';
import AnnouncementsPage from '../../features/instructor-dashboard/pages/AnnouncementsPage';

import { Link } from 'react-router';

const instructorSections = [
  {
    id: 'dashboard',
    label: 'Overview',
    icon: LuLayoutDashboard,
    stage: 'MVP',
    purpose: 'Immediate situational awareness for instructors.',
    features: ['KPI widgets', 'Insights & alerts', 'Recent submissions'],
    teachingValue: ['Dashboard-level analytics', 'Fast read model design'],
  },
  {
    id: 'students',
    label: 'Students',
    icon: LuUsers,
    stage: 'Intermediate',
    purpose: 'Track learner outcomes by person.',
    features: ['Student profiles', 'Progress tracking', 'Status flags'],
    teachingValue: ['One-to-many relationships', 'Conditional rendering'],
  },
  {
    id: 'assignments',
    label: 'Exercises',
    icon: LuKey,
    stage: 'MVP',
    purpose: 'Create structured exercises and deadlines.',
    features: ['Exercises per lesson', 'Difficulty levels', 'Deadlines'],
    teachingValue: ['Data modeling for assessment', 'Time-based logic'],
  },
  {
    id: 'submissions',
    label: 'Submissions',
    icon: LuCircleCheck,
    stage: 'MVP',
    purpose: 'Run the review workflow with feedback.',
    features: ['Review queue', 'Grade submissions', 'Approve/request revision'],
    teachingValue: ['Workflow modeling', 'State-machine design'],
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: LuBookOpen,
    stage: 'MVP',
    purpose: 'Control curriculum structure and publication.',
    features: ['Create and publish courses', 'Organize modules', 'Lock/unlock lessons'],
    teachingValue: ['CRUD at scale', 'Nested content hierarchies'],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: LuActivity,
    stage: 'Intermediate',
    purpose: 'Use data to improve teaching outcomes.',
    features: ['Completion rates', 'Average scores', 'Drop-off detection'],
    teachingValue: ['Aggregations and time-series', 'Query optimization'],
  },
  {
    id: 'announcements',
    label: 'Announcements',
    icon: LuMegaphone,
    stage: 'MVP',
    purpose: 'Communicate with students at hub level.',
    features: ['Post hub announcements', 'Message cohorts', 'Notification log'],
    teachingValue: ['Pub/sub patterns', 'Real-time communication'],
  },
  {
    id: 'hub',
    label: 'Hub',
    icon: LuBuilding2,
    stage: 'Intermediate',
    purpose: 'Manage cohort health and leaderboard.',
    features: ['Hub summary', 'Leaderboard', 'At-risk student list'],
    teachingValue: ['Cohort analytics', 'Ranking systems'],
  },
  {
    id: 'lessons',
    label: 'Lessons',
    icon: LuFolderKanban,
    stage: 'MVP',
    purpose: 'Author lesson content safely and quickly.',
    features: ['Markdown editing', 'Preview before publish', 'Embeds'],
    teachingValue: ['Content storage', 'XSS prevention'],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: LuSettings,
    stage: 'MVP',
    purpose: 'Keep instructor workflow configurable.',
    features: ['Course-level policies', 'Notification preferences', 'Publishing safeguards'],
    teachingValue: ['Configuration schemas', 'Safe defaults'],
  },
] as const;


type SubmissionStatus = 'Pending' | 'Reviewed' | 'Approved';

interface HubSubmissionItem {
  id: string;
  studentId: string;
  student: string;
  assignment: string;
  status: SubmissionStatus;
  submitted: string;
}

const mapExerciseStatusToSubmissionStatus = (status: string): SubmissionStatus => {
  const normalized = String(status || '').toLowerCase();

  if (normalized === 'reviewed') return 'Reviewed';
  if (normalized === 'approved') return 'Approved';
  return 'Pending';
};

const formatRelativeTime = (timestamp: string | null) => {
  if (!timestamp) return 'Not submitted';

  const submittedAt = new Date(timestamp);
  if (Number.isNaN(submittedAt.getTime())) return 'Not submitted';

  const diffMs = Date.now() - submittedAt.getTime();
  const minutes = Math.floor(diffMs / (1000 * 60));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  return submittedAt.toLocaleDateString();
};
const stageBadgeVariant: Record<(typeof instructorSections)[number]['stage'] | 'Advanced', 'default' | 'secondary' | 'outline'> = {
  MVP: 'default',
  Intermediate: 'secondary',
  Advanced: 'outline',
};

const submissionBadgeVariant: Record<SubmissionStatus, 'default' | 'secondary' | 'outline'> = {
  Pending: 'secondary',
  Reviewed: 'outline',
  Approved: 'default',
};

type SectionId = (typeof instructorSections)[number]['id'];

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'instructor';
  hub_location: string;
  streak?: number;
  xp?: number;
  last_activity_date?: string;
}

export default function Admin() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [hubSubmissionQueue, setHubSubmissionQueue] = useState<HubSubmissionItem[]>([]);
  const [hubRecentActivity, setHubRecentActivity] = useState<string[]>([]);
  const [hubActiveStudentsCount, setHubActiveStudentsCount] = useState(0);
  const [hubActiveTodayCount, setHubActiveTodayCount] = useState(0);
  const [hubStuckStudentsCount, setHubStuckStudentsCount] = useState(0);
  const [exercisesCompletedToday, setExercisesCompletedToday] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { section } = useParams();
  const activeSection = (section as SectionId) || 'dashboard';
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);

  // Instructor Data States
  const [activeCourses, setActiveCourses] = useState<any[]>([]);
  const [activeModules, setActiveModules] = useState<any[]>([]);
  const [activeLessons, setActiveLessons] = useState<any[]>([]);
  const [activeAssignments, setActiveAssignments] = useState<any[]>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
          navigate('/');
          return;
        }

        const profileRow = await fetchProfileForAuthUser(user as any);
        const metadata = (user.user_metadata as Record<string, unknown> | undefined) ?? undefined;
        const profileData = (profileRow ?? {
          id: user.id,
          email: user.email ?? '',
          role: String(metadata?.['role'] ?? metadata?.['user_role'] ?? 'student'),
          hub_location: String(metadata?.['hub_location'] ?? ''),
          full_name: String(metadata?.['full_name'] ?? user.email?.split('@')[0] ?? 'Instructor'),
          xp: Number(metadata?.['xp'] ?? 0),
          streak: Number(metadata?.['streak'] ?? 0),
          last_activity_date: String(metadata?.['last_activity_date'] ?? ''),
        }) as unknown as UserProfile;

        setProfile(profileData);

        const hasRoleColumn = profileRow ? Object.prototype.hasOwnProperty.call(profileRow, 'role') : false;

        if (profileData.role === 'instructor') {
          // If no hub location is set yet, we just show empty states instead of failing
          if (profileData.hub_location && hasRoleColumn) {
            const { data: studentData, error: studentError } = await supabase
              .from('profiles')
              .select('*')
              .eq('role', 'student')
              .eq('hub_location', profileData.hub_location);

            if (studentError) {
              console.error('Failed to load hub students', studentError);
            }

            const hubStudents = (!studentError && studentData ? studentData : []) as UserProfile[];
            setStudents(hubStudents);

            // Fetch Instructor Content
            const [
              { data: coursesData },
              { data: modulesData },
              { data: lessonsData },
              { data: exercisesData }
            ] = await Promise.all([
              supabase.from('courses').select('*'),
              supabase.from('course_modules').select('*'),
              supabase.from('lessons').select('*'),
              supabase.from('exercises').select('*')
            ]);

            setActiveCourses(coursesData || []);
            setActiveModules(modulesData || []);
            setActiveLessons(lessonsData || []);
            setActiveAssignments(exercisesData || []);

            const hubStudentIds = hubStudents.map((student) => String(student.id));
            const hubStudentIdSet = new Set(hubStudentIds);
            const studentNameMap = new Map(
              hubStudents.map((student) => [
                String(student.id),
                String(student.full_name || student.email || 'Student'),
              ]),
            );

            if (hubStudentIds.length > 0) {
              const { data: exerciseData, error: exerciseError } = await supabase
                .from('instructor_exercises')
                .select('id, student_id, title, status, submitted_at, created_at')
                .eq('instructor_id', user.id)
                .order('submitted_at', { ascending: false, nullsFirst: false })
                .order('created_at', { ascending: false });

              if (!exerciseError && exerciseData) {
                const hubItems: HubSubmissionItem[] = exerciseData
                  .filter((row: any) => hubStudentIdSet.has(String(row.student_id)))
                  .map((row: any) => {
                    const studentId = String(row.student_id || '');

                    return {
                      id: String(row.id || ''),
                      studentId,
                      student: studentNameMap.get(studentId) || 'Student',
                      assignment: String(row.title || 'Untitled Assignment'),
                      status: mapExerciseStatusToSubmissionStatus(String(row.status || '')),
                      submitted: formatRelativeTime(row.submitted_at ? String(row.submitted_at) : null),
                    };
                  })
                  .slice(0, 12);

                setHubSubmissionQueue(hubItems);

                const fallbackActivity = hubItems
                  .map((item) => `${item.student} ${item.status === 'Pending' ? 'submitted' : 'updated'} ${item.assignment}`)
                  .slice(0, 8);

                setHubRecentActivity(fallbackActivity);
                setHubActiveStudentsCount(new Set(hubItems.map((item) => item.studentId)).size);
              } else {
                setHubSubmissionQueue([]);
                setHubRecentActivity([]);
                setHubActiveStudentsCount(0);

                if (exerciseError?.code !== '42P01') {
                  console.error('Failed to load hub submissions', exerciseError);
                }
              }

              const { data: activityData, error: activityError } = await supabase
                .from('user_activity_logs')
                .select('user_id, active_date')
                .in('user_id', hubStudentIds)
                .order('active_date', { ascending: false })
                .limit(8);

              if (!activityError && activityData && activityData.length > 0) {
                const activityFeed = activityData.map((row: any) => {
                  const studentName = studentNameMap.get(String(row.user_id || '')) || 'Student';
                  const activeDate = row.active_date ? new Date(String(row.active_date)).toLocaleDateString() : 'recently';
                  return `${studentName} was active on ${activeDate}`;
                });

                setHubRecentActivity(activityFeed);
                setHubActiveStudentsCount(new Set(activityData.map((row: any) => String(row.user_id || ''))).size);
                
                // Calculate "Active Today" (simple check for today's logs)
                const todayStr = new Date().toLocaleDateString();
                const activeToday = activityData.filter(row => 
                  row.active_date && new Date(String(row.active_date)).toLocaleDateString() === todayStr
                ).length;
                setHubActiveTodayCount(activeToday);
                
                // Heuristic for "Stuck Students": Inactive for > 4 days in this hub
                const fourDaysAgo = new Date();
                fourDaysAgo.setDate(fourDaysAgo.getDate() - 4);
                const stuckStudents = hubStudents.filter(s => {
                  const lastActive = s.last_activity_date ? new Date(s.last_activity_date) : null;
                  return lastActive && lastActive < fourDaysAgo;
                }).length;
                setHubStuckStudentsCount(stuckStudents);

                // Exercises completed today
                const completedToday = hubItems.filter(item => 
                  (item.status === 'Reviewed' || item.status === 'Approved') && 
                  item.submitted.includes('h ago') // Rough heuristic for today
                ).length;
                setExercisesCompletedToday(completedToday);

              } else if (activityError?.code !== '42P01') {
                console.error('Failed to load hub activity', activityError);
              }
            } else {
              setHubSubmissionQueue([]);
              setHubRecentActivity([]);
              setHubActiveStudentsCount(0);
              setHubActiveTodayCount(0);
              setHubStuckStudentsCount(0);
              setExercisesCompletedToday(0);
            }
          }
        } else {
          // Admin UI is not for students
          navigate('/dashboard');
        }
      } catch (err) {
        console.error("Error loading dashboard data", err);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [navigate]);


  if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading instructor workspace...</div>;
  if (!profile) return null;

  const selectedSection = instructorSections.find((s) => s.id === activeSection) ?? instructorSections[0];
  const totalStudents = students.length;
  const assignmentsPendingReview = hubSubmissionQueue.filter((item) => item.status === 'Pending').length;
  const recentActivityCount = hubRecentActivity.length;
  const reviewedSubmissions = hubSubmissionQueue.filter(
    (item) => item.status === 'Reviewed' || item.status === 'Approved',
  ).length;

  const analyticsSnapshot = {
    avgCompletion:
      hubSubmissionQueue.length > 0
        ? Math.round((reviewedSubmissions / hubSubmissionQueue.length) * 100)
        : 0,
    reviewedSubmissions,
    inactiveStudents: Math.max(totalStudents - hubActiveStudentsCount, 0),
    dropOffPoint:
      hubSubmissionQueue.length > 0 ? 'Track in submissions table' : 'No hub submission data yet',
  };

  const nickname = profile.full_name;
  const xp = profile.xp || 0;
  const level = calculateUserLevel(xp);

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
          
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-sidebar p-3">
              <div className="order-1 relative w-full min-w-0 sm:min-w-[220px] sm:flex-1">
                <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  defaultValue=""
                  placeholder="Search students, courses..."
                  className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none"
                />
              </div>
              <div className="order-2 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground" onClick={() => navigate('/settings')}>
                  <LuBell className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground" onClick={() => navigate('/achievements')}>
                  <LuSparkles className="h-4 w-4" />
                </Button>
              </div>
              <div className="order-3 ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={dashboardAvatar} alt={nickname} />
                  <AvatarFallback>{nickname ? nickname[0] : 'U'}</AvatarFallback>
                </Avatar>
                <span className="hidden pr-2 text-sm text-foreground sm:block">{nickname}</span>
                <Button
                  variant="ghost"
                  onClick={async () => {
                    await supabase.auth.signOut();
                    navigate('/');
                  }}
                  className="rounded-full bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700 h-8 ml-2"
                >
                  Log out
                </Button>
              </div>
            </div>

            <Card className="overflow-hidden rounded-2xl border-border bg-primary">
              <CardContent className="p-4 sm:p-6">
                <Badge variant="secondary" className="mb-2 rounded-full px-3 py-1 text-[11px] uppercase tracking-wider bg-white/20 text-white hover:bg-white/30 border-none">
                  Hub: {profile.hub_location || 'Pending Assignment'}
                </Badge>
                <h2 className="heading-font mt-1 max-w-md text-2xl leading-tight text-white sm:text-3xl">
                  Instructor Dashboard
                </h2>
                <p className="mt-2 text-sm text-white/80">Optimize teaching efficiency, student visibility, and content control.</p>
                <Button className="mt-5 rounded-full bg-white text-foreground hover:bg-white/90">
                  <LuBell className="mr-2 h-4 w-4" />
                  Send Announcement
                </Button>
              </CardContent>
            </Card>

            {/* Main content area based on section */}
            {activeSection === 'dashboard' && <OverviewPage />}
            {activeSection === 'students' && <StudentsPage />}
            {activeSection === 'assignments' && <ExercisesPage />}
            {activeSection === 'submissions' && <SubmissionsPage />}
            {activeSection === 'analytics' && <AnalyticsPage />}
            {activeSection === 'announcements' && <AnnouncementsPage />}
            
            {/* Fallback for sections not yet implemented with new pages */}
            {activeSection === 'courses' && (
              <Card className="rounded-2xl border-blue-200/60 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">Course Catalog</CardTitle>
                  <CardDescription>Manage curriculum structure and module organization.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                    Course management coming soon with the new design system.
                  </div>
                </CardContent>
              </Card>
            )}
            {activeSection === 'lessons' && (
              <Card className="rounded-2xl border-blue-200/60 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">Lesson Content Editor</CardTitle>
                  <CardDescription>Author and organize individual lesson structures.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                    Lesson editor coming soon with the new design system.
                  </div>
                </CardContent>
              </Card>
            )}
            {activeSection === 'hub' && (
              <Card className="rounded-2xl border-blue-200/60 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">Hub Management</CardTitle>
                  <CardDescription>Manage cohort health and leaderboard.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="p-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-500">
                    Hub management coming soon with the new design system.
                  </div>
                </CardContent>
              </Card>
            )}
            {activeSection === 'settings' && (
              <Card className="rounded-2xl border-blue-200/60 bg-white">
                <CardHeader>
                  <CardTitle className="text-xl font-semibold text-slate-900">Instructor Preferences</CardTitle>
                  <CardDescription>Configure notifications and assignment validation rules.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-xl">
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-slate-900">Email Notifications</p>
                        <p className="text-xs text-slate-500">Receive daily digest of new submissions</p>
                      </div>
                      <Badge className="bg-blue-100 text-blue-700 rounded-full cursor-pointer hover:bg-blue-200">Enabled</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-slate-200 rounded-xl">
                      <div>
                        <p className="font-medium text-sm text-slate-900">Auto-Review Trivial Exercises</p>
                        <p className="text-xs text-slate-500">Automatically pass coding questions that pass unit tests</p>
                      </div>
                      <Badge variant="outline" className="rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer">Off</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          {/* Right Column (Sidebar) */}
          <div className="space-y-4">
            <Card className="rounded-2xl border-border">
              <CardContent className="space-y-4 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base text-foreground heading-font">Instructor Profile</h3>
                  <LuEllipsis className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex flex-col items-center">
                  <Avatar className="h-20 w-20 border border-border">
                    <AvatarImage src={dashboardAvatar} alt={nickname} />
                    <AvatarFallback>{nickname ? nickname[0] : 'U'}</AvatarFallback>
                  </Avatar>
                  <p className="mt-3 text-base text-foreground">{getGreeting()} {nickname}</p>
                  <p className="text-xs text-muted-foreground">Hub: {profile.hub_location}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground flex flex-col items-center">
                    <span className="text-[10px] opacity-70">Students</span>
                    <span className="mt-1 text-base text-foreground font-semibold">{totalStudents}</span>
                  </div>
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground flex flex-col items-center">
                    <span className="text-[10px] opacity-70">Courses</span>
                    <span className="mt-1 text-base text-foreground font-semibold">{activeCourses.length}</span>
                  </div>
                  <div className="col-span-2 rounded-xl bg-sidebar p-2 text-muted-foreground flex flex-col items-center">
                    <span className="text-[10px] opacity-70">Hub Presence</span>
                    <span className="mt-1 text-foreground font-medium">{profile.hub_location || 'Remote'}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="heading-font text-base text-foreground">Review Velocity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-xl bg-sidebar p-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Pending Review</p>
                    <p className="mt-0.5 text-lg text-foreground font-semibold">{assignmentsPendingReview}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <LuClock3 className="h-4 w-4" />
                  </div>
                </div>
                <div className="rounded-xl bg-sidebar p-3 flex justify-between items-center">
                  <div>
                    <p className="text-xs text-muted-foreground">Successful Reviews</p>
                    <p className="mt-0.5 text-lg text-foreground font-semibold">{reviewedSubmissions}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <LuCircleCheck className="h-4 w-4" />
                  </div>
                </div>
                <div className="rounded-xl bg-sidebar p-3">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-xs text-muted-foreground">Hub Completion Rate</p>
                    <p className="text-xs text-foreground font-medium">{analyticsSnapshot.avgCompletion}%</p>
                  </div>
                  <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary transition-all duration-500" 
                      style={{ width: `${analyticsSnapshot.avgCompletion}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="heading-font text-base text-foreground">Recent Student Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {hubRecentActivity.length > 0 ? (
                  hubRecentActivity.map((item) => (
                    <div key={item} className="rounded-xl bg-sidebar p-3 text-sm text-foreground">
                      {item}
                    </div>
                  ))
                ) : (
                  <div className="rounded-xl bg-sidebar p-3 text-sm text-muted-foreground">
                    No recent activity recorded for your hub yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
