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
  LuCircleCheck,
  LuClock3,
  LuEllipsis,
  LuFolderKanban,
  LuKey,
  LuLayoutDashboard,
  LuSearch,
  LuSettings,
  LuSparkles,
  LuTarget,
  LuUsers,
  LuZap,
} from 'react-icons/lu';
import { useNavigate, useParams } from 'react-router';
import { supabase } from '../../../lib/supabase';
import { fetchProfileForAuthUser } from '../../lib/profileAccess';

const instructorSections = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LuLayoutDashboard,
    stage: 'MVP',
    purpose: 'Immediate situational awareness for instructors.',
    features: [
      'Total students enrolled and active courses',
      'Assignments pending review',
      'Recent student activity feed',
    ],
    teachingValue: [
      'Aggregated queries for platform metrics',
      'Dashboard-level analytics patterns',
      'Fast read model design',
    ],
  },
  {
    id: 'courses',
    label: 'Courses',
    icon: LuBookOpen,
    stage: 'MVP',
    purpose: 'Control curriculum structure and publication.',
    features: [
      'Create, edit, and publish courses',
      'Organize modules and lessons',
      'Draft vs published visibility states',
    ],
    teachingValue: [
      'CRUD at scale',
      'Nested content hierarchies',
      'Status-flag driven access logic',
    ],
  },
  {
    id: 'lessons',
    label: 'Lessons',
    icon: LuFolderKanban,
    stage: 'MVP',
    purpose: 'Author lesson content safely and quickly.',
    features: [
      'Markdown or rich-text editing',
      'Embeds for links, videos, and code blocks',
      'Preview before publish',
    ],
    teachingValue: [
      'Content storage strategies',
      'Sanitization and XSS prevention',
      'Editor UX tradeoffs',
    ],
  },
  {
    id: 'assignments',
    label: 'Assignments',
    icon: LuKey,
    stage: 'MVP',
    purpose: 'Create structured work and deadlines.',
    features: [
      'Assignments per lesson or module',
      'Submission type rules (text, file, link)',
      'Deadline and validation constraints',
    ],
    teachingValue: [
      'Data modeling for assessment',
      'Validation and business rules',
      'Time-based logic',
    ],
  },
  {
    id: 'submissions',
    label: 'Submissions',
    icon: LuCircleCheck,
    stage: 'MVP',
    purpose: 'Run the review workflow with feedback.',
    features: [
      'Submission queue with status transitions',
      'View learner work and history',
      'Leave feedback and approve/review states',
    ],
    teachingValue: [
      'Workflow and state-machine modeling',
      'Relational querying by student and assignment',
      'Idempotent review actions',
    ],
  },
  {
    id: 'students',
    label: 'Students',
    icon: LuUsers,
    stage: 'Intermediate',
    purpose: 'Track learner outcomes by person.',
    features: [
      'Student profiles and course progress',
      'Submission history per learner',
      'Inactive student flags',
    ],
    teachingValue: [
      'One-to-many relationships',
      'Conditional rendering by state',
      'Performance-oriented filtering',
    ],
  },
  {
    id: 'analytics',
    label: 'Analytics',
    icon: LuZap,
    stage: 'Intermediate',
    purpose: 'Use data to improve teaching outcomes.',
    features: [
      'Completion rates per lesson',
      'Average assignment scores',
      'Drop-off point detection',
    ],
    teachingValue: [
      'Aggregations and time-series',
      'Visualization decisions',
      'Query optimization for dashboards',
    ],
  },
  {
    id: 'settings',
    label: 'Settings',
    icon: LuSettings,
    stage: 'MVP',
    purpose: 'Keep instructor workflow configurable and stable.',
    features: [
      'Course-level policies and defaults',
      'Review preferences and notifications',
      'Publishing safeguards',
    ],
    teachingValue: [
      'Configuration schemas',
      'Policy-based behavior',
      'Safe defaults in production systems',
    ],
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
              } else if (activityError?.code !== '42P01') {
                console.error('Failed to load hub activity', activityError);
              }
            } else {
              setHubSubmissionQueue([]);
              setHubRecentActivity([]);
              setHubActiveStudentsCount(0);
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
            {activeSection === 'students' && (
                <div className={`grid grid-cols-1 ${selectedStudent ? 'lg:grid-cols-2' : ''} gap-4 items-start`}>
                  <Card className="rounded-2xl border-border bg-card">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <div>
                        <CardTitle className="heading-font text-xl text-foreground">
                          Student Directory ({profile.hub_location || 'All'})
                        </CardTitle>
                        <CardDescription>
                          All students currently registered at your hub.
                        </CardDescription>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left">
                          <thead>
                            <tr className="border-y border-border text-xs text-muted-foreground bg-sidebar/50">
                              <th className="px-4 py-3 font-medium">Name</th>
                              <th className="px-4 py-3 font-medium">Role</th>
                              <th className="px-4 py-3 font-medium">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {students.length > 0 ? (
                              students.map((student) => (
                                <tr key={student.id} className={`border-b border-border text-sm text-foreground last:border-b-0 hover:bg-sidebar/30 transition-colors ${selectedStudent?.id === student.id ? 'bg-secondary/30' : ''}`}>
                                  <td className="whitespace-nowrap px-4 py-3">
                                    <p className="font-medium">{student.full_name}</p>
                                    <p className="text-xs text-muted-foreground">{student.email}</p>
                                  </td>
                                  <td className="px-4 py-3 capitalize">{student.role}</td>
                                  <td className="px-4 py-3">
                                    <Button size="sm" variant="outline" className="rounded-full text-xs h-8" asChild>
                                      <Link to={`/admin/students/${student.id}`} target="_blank">
                                        View Profile
                                      </Link>
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={3} className="text-center py-8 text-muted-foreground bg-sidebar/30">
                                  {profile.hub_location ? `No students have registered for ${profile.hub_location} yet.` : 'You are not assigned to a hub yet.'}
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>

                  {selectedStudent && (
                    <Card className="rounded-2xl border-border bg-card animate-in fade-in slide-in-from-right-4">
                      <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                          <CardTitle className="heading-font text-xl text-foreground">
                            {selectedStudent.full_name}
                          </CardTitle>
                          <CardDescription>{selectedStudent.email}</CardDescription>
                        </div>
                        <Button size="sm" variant="ghost" className="rounded-full h-8 px-3 text-muted-foreground hover:text-foreground" onClick={() => setSelectedStudent(null)}>
                          Hide
                        </Button>
                      </CardHeader>
                      <CardContent className="p-4 space-y-4">
                        <div className="rounded-xl border border-border p-4 bg-sidebar">
                          <h3 className="font-medium text-foreground mb-4">Account Snapshot</h3>
                          <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Status</span>
                              <Badge className="bg-success/20 text-success hover:bg-success/30 rounded-full">Active</Badge>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Hub</span>
                              <span className="text-foreground capitalize">{selectedStudent.hub_location}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Role</span>
                              <span className="text-foreground capitalize">{selectedStudent.role}</span>
                            </div>
                          </div>
                        </div>

                        <div className="rounded-xl border border-border p-4 bg-sidebar">
                          <h3 className="font-medium text-foreground mb-4">Submission History</h3>
                          <div className="space-y-3">
                            {hubSubmissionQueue.filter(sub => sub.studentId === selectedStudent.id).length > 0 ? (
                              hubSubmissionQueue.filter(sub => sub.studentId === selectedStudent.id).map(sub => (
                                <div key={sub.id} className="flex justify-between items-center bg-secondary/50 p-2 rounded-lg text-sm border border-border">
                                  <div>
                                    <p className="font-medium text-foreground truncate max-w-[150px]" title={sub.assignment}>{sub.assignment}</p>
                                    <p className="text-xs text-muted-foreground">{sub.submitted}</p>
                                  </div>
                                  <Badge variant={submissionBadgeVariant[sub.status]} className="text-[10px] uppercase">{sub.status}</Badge>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground text-sm">
                                No submissions found for this learner yet.
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {activeSection === 'dashboard' && (
                <>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Card className="rounded-2xl border-border bg-sidebar">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Total students enrolled</p>
                        <p className="mt-2 text-2xl text-foreground">{students.length}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-border bg-sidebar">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Active courses</p>
                        <p className="mt-2 text-2xl text-foreground">{activeCourses.length}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-border bg-sidebar">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Pending review</p>
                        <p className="mt-2 text-2xl text-foreground">{assignmentsPendingReview}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-border bg-sidebar">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Recent activity metrics</p>
                        <p className="mt-2 text-2xl text-foreground">{recentActivityCount}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-2xl border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="heading-font text-lg text-foreground">Active Submissions (Hub Overview)</CardTitle>
                      <CardDescription>Recent submissions from learners at {profile.hub_location}.</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="overflow-x-auto">
                        <table className="w-full min-w-[620px] text-left">
                          <thead>
                            <tr className="border-y border-border text-xs text-muted-foreground">
                              <th className="px-4 py-3 font-medium">Submission ID</th>
                              <th className="px-4 py-3 font-medium">Student</th>
                              <th className="px-4 py-3 font-medium">Assignment</th>
                              <th className="px-4 py-3 font-medium">Status</th>
                              <th className="px-4 py-3 font-medium">Submitted</th>
                              <th className="px-4 py-3 font-medium">Action</th>
                            </tr>
                          </thead>
                          <tbody>
                            {hubSubmissionQueue.length > 0 ? (
                              hubSubmissionQueue.slice(0, 5).map((item) => (
                                <tr key={item.id} className="border-b border-border text-sm text-foreground last:border-b-0">
                                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">#{item.id.slice(0, 8)}</td>
                                  <td className="whitespace-nowrap px-4 py-3 font-medium">{item.student}</td>
                                  <td className="px-4 py-3">{item.assignment}</td>
                                  <td className="px-4 py-3">
                                    <Badge variant={submissionBadgeVariant[item.status]}>{item.status}</Badge>
                                  </td>
                                  <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{item.submitted}</td>
                                  <td className="px-4 py-3">
                                    <Button size="sm" variant="ghost" className="rounded-full border border-border text-xs">
                                      Review
                                    </Button>
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={6} className="px-4 py-6 text-center text-sm text-muted-foreground">
                                  No active submissions from your hub yet.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </>
              )}

              {activeSection === 'courses' && (
                <Card className="rounded-2xl border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="heading-font text-xl text-foreground">Course Catalog</CardTitle>
                      <CardDescription>Manage curriculum structure and module organization.</CardDescription>
                    </div>
                    <Button size="sm" className="rounded-full">
                      <LuBookOpen className="mr-2 h-4 w-4" /> Create Course
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {activeCourses.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeCourses.map(course => (
                          <Card key={course.id} className="rounded-xl border border-border bg-sidebar hover:border-primary/50 transition">
                            <CardContent className="p-4 flex gap-4">
                              <div className="h-16 w-16 rounded-xl bg-secondary flex items-center justify-center text-3xl shrink-0">
                                {course.icon || '📚'}
                              </div>
                              <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                  <h3 className="font-semibold text-foreground line-clamp-1">{course.title}</h3>
                                  <Badge variant="outline" className="text-[10px] rounded-full px-2 uppercase">{course.difficulty_level || 'Beginner'}</Badge>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{course.description || 'No description provided.'}</p>
                                <div className="flex items-center gap-2">
                                  <Button size="sm" variant="secondary" className="h-7 text-xs rounded-lg flex-1">Modules ({activeModules.filter(m => m.course_id === course.id).length})</Button>
                                  <Button size="sm" variant="default" className="h-7 text-xs rounded-lg flex-1">Edit Course</Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-sidebar/50 rounded-xl border border-dashed border-border text-muted-foreground">
                        No courses available. Start by creating your first course.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeSection === 'lessons' && (
                <Card className="rounded-2xl border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="heading-font text-xl text-foreground">Lesson Content Editor</CardTitle>
                      <CardDescription>Author and organize individual lesson structures.</CardDescription>
                    </div>
                    <Button size="sm" className="rounded-full">
                      <LuFolderKanban className="mr-2 h-4 w-4" /> New Lesson
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {activeLessons.length > 0 ? (
                      <div className="space-y-2">
                        {activeLessons.map(lesson => {
                          const course = activeCourses.find(c => c.id === lesson.course_id);
                          return (
                            <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-sidebar hover:bg-secondary/50 transition">
                              <div className="flex items-center gap-3">
                                <div className="bg-primary/10 text-primary p-2 rounded-lg"><LuFolderKanban className="h-4 w-4" /></div>
                                <div>
                                  <p className="font-medium text-sm text-foreground">{lesson.title}</p>
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    {course?.title || 'Unassigned'}
                                  </p>
                                </div>
                              </div>
                              <Button size="sm" variant="ghost" className="h-8 rounded-lg text-xs">Edit Content</Button>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-sidebar/50 rounded-xl border border-dashed border-border text-muted-foreground">
                        No lessons have been created yet.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeSection === 'assignments' && (
                <Card className="rounded-2xl border-border bg-card">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="heading-font text-xl text-foreground">Exercises & Projects</CardTitle>
                      <CardDescription>Build interactive validation and practical tasks.</CardDescription>
                    </div>
                    <Button size="sm" className="rounded-full">
                      <LuTarget className="mr-2 h-4 w-4" /> Add Exercise
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {activeAssignments.length > 0 ? (
                      <div className="space-y-2">
                        {activeAssignments.map(exercise => (
                          <div key={exercise.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-sidebar hover:bg-secondary/50 transition">
                            <div className="flex items-center gap-3">
                              <div className="bg-accent/10 text-accent p-2 rounded-lg">
                                <LuKey className="h-4 w-4" />
                              </div>
                              <div>
                                <p className="font-medium text-sm text-foreground">{exercise.title}</p>
                                <p className="text-xs text-muted-foreground">Type: <span className="uppercase text-foreground">{exercise.type || 'Standard'}</span> • Points: {exercise.xp_reward || 0}</p>
                              </div>
                            </div>
                            <Badge variant="outline" className="text-[10px] rounded-full">Configured</Badge>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-sidebar/50 rounded-xl border border-dashed border-border text-muted-foreground">
                        No exercises found.
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {activeSection === 'submissions' && (
                <Card className="rounded-2xl border-border">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <div>
                      <CardTitle className="heading-font text-xl text-foreground">Full Review Queue</CardTitle>
                      <CardDescription>Review process for {profile.hub_location} submissions.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="rounded-full">{assignmentsPendingReview} Pending</Badge>
                      <Badge variant="outline" className="rounded-full">{reviewedSubmissions} Done</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-left">
                        <thead>
                          <tr className="border-y border-border text-xs text-muted-foreground bg-sidebar/50">
                            <th className="px-4 py-3 font-medium">Tracking ID</th>
                            <th className="px-4 py-3 font-medium">Student</th>
                            <th className="px-4 py-3 font-medium">Assignment Output</th>
                            <th className="px-4 py-3 font-medium">Current Status</th>
                            <th className="px-4 py-3 font-medium">Submitted</th>
                            <th className="px-4 py-3 font-medium">Review Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {hubSubmissionQueue.length > 0 ? (
                            hubSubmissionQueue.map((item) => (
                              <tr key={item.id} className="border-b border-border text-sm text-foreground last:border-b-0 hover:bg-secondary/30 transition">
                                <td className="whitespace-nowrap px-4 py-4 font-mono text-xs text-muted-foreground">{item.id.slice(0, 8)}...</td>
                                <td className="whitespace-nowrap px-4 py-4 font-medium">
                                  <div className="flex items-center gap-2">
                                    <div className="h-6 w-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] uppercase font-bold">
                                      {item.student.slice(0, 2)}
                                    </div>
                                    {item.student}
                                  </div>
                                </td>
                                <td className="px-4 py-4 max-w-[200px] truncate" title={item.assignment}>{item.assignment}</td>
                                <td className="px-4 py-4">
                                  <Badge variant={submissionBadgeVariant[item.status]} className="rounded-full">{item.status}</Badge>
                                </td>
                                <td className="whitespace-nowrap px-4 py-4 text-muted-foreground text-xs">{item.submitted}</td>
                                <td className="px-4 py-4">
                                  <Button size="sm" className="rounded-full h-8 px-4 font-medium" variant={item.status === 'Pending' ? 'default' : 'outline'}>
                                    {item.status === 'Pending' ? 'Start Review' : 'View Feedback'}
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={6} className="px-4 py-8 text-center text-sm text-muted-foreground bg-sidebar/40 border-dashed border-border border-b">
                                No learner submissions are in the queue for your hub.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === 'analytics' && (
                <Card className="rounded-2xl border-border bg-card">
                  <CardHeader>
                    <CardTitle className="heading-font text-xl text-foreground">Teaching Analytics</CardTitle>
                    <CardDescription>Metrics based on user events and submission velocity.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="p-8 text-center bg-sidebar/50 rounded-xl border border-dashed border-border text-muted-foreground">
                      <LuZap className="h-8 w-8 mx-auto mb-3 opacity-50" />
                      <p>Detailed visualization charts will appear here.</p>
                      <p className="text-xs mt-1">Currently aggregating interaction records for {students.length} students.</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {activeSection === 'settings' && (
                <Card className="rounded-2xl border-border bg-card">
                  <CardHeader>
                    <CardTitle className="heading-font text-xl text-foreground">Instructor Preferences</CardTitle>
                    <CardDescription>Configure notifications and assignment validation rules.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4 max-w-xl">
                      <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                        <div>
                          <p className="font-medium text-sm text-foreground">Email Notifications</p>
                          <p className="text-xs text-muted-foreground">Receive daily digest of new submissions</p>
                        </div>
                        <Badge variant="default" className="rounded-full cursor-not-allowed">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                        <div>
                          <p className="font-medium text-sm text-foreground">Auto-Review Trivial Exercises</p>
                          <p className="text-xs text-muted-foreground">Automatically pass coding questions that pass unit tests</p>
                        </div>
                        <Badge variant="outline" className="rounded-full text-muted-foreground hover:bg-secondary cursor-pointer">Off</Badge>
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
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">XP: {xp}</div>
                  <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Level: {level}</div>
                  <div className="col-span-2 rounded-xl bg-sidebar p-2 text-muted-foreground text-center">Students: {totalStudents}</div>
                </div>
                <div className="mt-4">
                  <StreakWidget
                    streak={profile.streak || 0}
                    userId={profile.id}
                    lastActivityDate={profile.last_activity_date}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardHeader className="pb-2">
                <CardTitle className="heading-font text-base text-foreground">Progress & Hub Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="rounded-xl bg-sidebar p-3">
                  <p className="text-xs text-muted-foreground">Average lesson completion</p>
                  <p className="mt-1 text-lg text-foreground">{analyticsSnapshot.avgCompletion}%</p>
                </div>
                <div className="rounded-xl bg-sidebar p-3">
                  <p className="text-xs text-muted-foreground">Reviewed submissions</p>
                  <p className="mt-1 text-lg text-foreground">{analyticsSnapshot.reviewedSubmissions}</p>
                </div>
                <div className="rounded-xl bg-sidebar p-3">
                  <p className="text-xs text-muted-foreground">Drop-off point</p>
                  <p className="mt-1 text-sm text-foreground">{analyticsSnapshot.dropOffPoint}</p>
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
