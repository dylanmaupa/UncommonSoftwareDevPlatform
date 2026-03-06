import { useMemo, useState, useEffect } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  LuBell,
  LuBookOpen,
  LuCircleCheck,
  LuClock3,
  LuFolderKanban,
  LuKey,
  LuLayoutDashboard,
  LuSettings,
  LuSparkles,
  LuTarget,
  LuUsers,
  LuZap,
} from 'react-icons/lu';
import { useNavigate } from 'react-router';
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
}

export default function Admin() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [hubSubmissionQueue, setHubSubmissionQueue] = useState<HubSubmissionItem[]>([]);
  const [hubRecentActivity, setHubRecentActivity] = useState<string[]>([]);
  const [hubActiveStudentsCount, setHubActiveStudentsCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');

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
        }) as UserProfile;

        setProfile(profileData);

        const hasRoleColumn = profileRow ? Object.prototype.hasOwnProperty.call(profileRow, 'role') : false;

        if (profileData.role === 'instructor' && profileData.hub_location && hasRoleColumn) {
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

  const selectedSection = instructorSections.find((section) => section.id === activeSection) ?? instructorSections[0];
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

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wider">
              Hub: {profile.hub_location}
            </Badge>
            <h1 className="heading-font mt-2 text-2xl text-foreground sm:text-3xl">Instructor Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Optimize teaching efficiency, student visibility, and content control without extra complexity.
            </p>
          </div>
          <div className="flex gap-2">
            <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <LuBell className="mr-2 h-4 w-4" />
              Send Announcement
            </Button>
            <Button
              variant="outline"
              onClick={async () => {
                await supabase.auth.signOut();
                navigate('/');
              }}
              className="rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 h-10"
            >
              Log out
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border bg-sidebar">
            <CardHeader className="pb-2">
              <CardTitle className="heading-font text-base text-foreground">Navigation</CardTitle>
              <CardDescription>Core sections for an instructor-first workflow</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="overflow-x-auto pb-1">
                <div className="flex w-max gap-2 lg:w-full lg:flex-wrap">
                  {instructorSections.map((section) => {
                    const Icon = section.icon;
                    const isActive = section.id === selectedSection.id;

                    return (
                      <button
                        key={section.id}
                        type="button"
                        onClick={() => setActiveSection(section.id)}
                        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${isActive
                          ? 'border-primary bg-primary/10 text-foreground'
                          : 'border-border bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
                          }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{section.label}</span>
                        <Badge variant={stageBadgeVariant[section.stage]} className="rounded-full px-2 text-[10px]">
                          {section.stage}
                        </Badge>
                      </button>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            {/* Left Column (Main content area based on section) */}
            <div className="space-y-4">
              {activeSection === 'students' ? (
                <Card className="rounded-2xl border-border bg-card">
                  <CardHeader>
                    <CardTitle className="heading-font text-xl text-foreground">Student Directory ({profile.hub_location})</CardTitle>
                    <CardDescription>All students currently registered at your hub.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[620px] text-left">
                        <thead>
                          <tr className="border-y border-border text-xs text-muted-foreground bg-sidebar/50">
                            <th className="px-4 py-3 font-medium">Name</th>
                            <th className="px-4 py-3 font-medium">Email</th>
                            <th className="px-4 py-3 font-medium">Role</th>
                            <th className="px-4 py-3 font-medium">Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {students.length > 0 ? (
                            students.map((student) => (
                              <tr key={student.id} className="border-b border-border text-sm text-foreground last:border-b-0 hover:bg-sidebar/30 transition-colors">
                                <td className="whitespace-nowrap px-4 py-3 font-medium">{student.full_name}</td>
                                <td className="whitespace-nowrap px-4 py-3 text-muted-foreground">{student.email}</td>
                                <td className="px-4 py-3 capitalize">{student.role}</td>
                                <td className="px-4 py-3">
                                  <Button size="sm" variant="outline" className="rounded-full text-xs h-8">
                                    View Profile
                                  </Button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={4} className="text-center py-8 text-muted-foreground bg-sidebar/30">
                                No students have registered for {profile.hub_location} yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* Keep the original dashboard placeholders for other sections until fully built out */}
                  <Card className="overflow-hidden rounded-2xl border-border bg-primary">
                    <CardContent className="p-4 sm:p-6">
                      <p className="text-xs uppercase tracking-wider text-white/80">Overview / Home</p>
                      <h2 className="heading-font mt-2 max-w-2xl text-2xl leading-tight text-white sm:text-3xl">
                        Real instructor operations mapped directly to backend behavior
                      </h2>
                      <p className="mt-2 text-sm text-white/80">
                        Every action here is designed as a live case study for students: data reads, mutations, and workflow
                        transitions.
                      </p>
                    </CardContent>
                  </Card>

                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <Card className="rounded-2xl border-border bg-sidebar">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Total students enrolled at Hub</p>
                        <p className="mt-2 text-2xl text-foreground">{students.length}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-border bg-sidebar">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Active students in hub</p>
                        <p className="mt-2 text-2xl text-foreground">{hubActiveStudentsCount}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-border bg-sidebar">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Assignments pending review</p>
                        <p className="mt-2 text-2xl text-foreground">{assignmentsPendingReview}</p>
                      </CardContent>
                    </Card>
                    <Card className="rounded-2xl border-border bg-sidebar">
                      <CardContent className="p-4">
                        <p className="text-xs text-muted-foreground">Recent student activity</p>
                        <p className="mt-2 text-2xl text-foreground">{recentActivityCount}</p>
                      </CardContent>
                    </Card>
                  </div>

                  <Card className="rounded-2xl border-border">
                    <CardHeader>
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <CardTitle className="heading-font text-lg text-foreground">{selectedSection.label}</CardTitle>
                          <CardDescription className="mt-1">{selectedSection.purpose}</CardDescription>
                        </div>
                        <Badge variant={stageBadgeVariant[selectedSection.stage]} className="rounded-full px-3 py-1 text-[11px]">
                          {selectedSection.stage}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 gap-4 pt-0 md:grid-cols-2">
                      <div className="rounded-xl bg-sidebar p-3">
                        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Feature Set</p>
                        <ul className="space-y-2 text-sm text-foreground">
                          {selectedSection.features.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <LuCircleCheck className="mt-0.5 h-4 w-4 text-primary" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl bg-sidebar p-3">
                        <p className="mb-2 text-xs uppercase tracking-wider text-muted-foreground">Teaching Value</p>
                        <ul className="space-y-2 text-sm text-foreground">
                          {selectedSection.teachingValue.map((item) => (
                            <li key={item} className="flex items-start gap-2">
                              <LuSparkles className="mt-0.5 h-4 w-4 text-accent" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="rounded-2xl border-border">
                    <CardHeader className="pb-2">
                      <CardTitle className="heading-font text-lg text-foreground">Submission Review & Feedback</CardTitle>
                      <CardDescription>Core instructor workflow: review, feedback, and state transitions.</CardDescription>
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
                              hubSubmissionQueue.map((item) => (
                                <tr key={item.id} className="border-b border-border text-sm text-foreground last:border-b-0">
                                  <td className="whitespace-nowrap px-4 py-3">{item.id}</td>
                                  <td className="whitespace-nowrap px-4 py-3">{item.student}</td>
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
                                  No submissions from your hub yet.
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
            </div>

            {/* Right Column (Sidebar) */}
            <div className="space-y-4">
              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="heading-font text-base text-foreground">Progress & Analytics</CardTitle>
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
                    <p className="text-xs text-muted-foreground">Inactive students flagged</p>
                    <p className="mt-1 text-lg text-foreground">{analyticsSnapshot.inactiveStudents}</p>
                  </div>
                  <div className="rounded-xl bg-sidebar p-3">
                    <p className="text-xs text-muted-foreground">Drop-off point</p>
                    <p className="mt-1 text-sm text-foreground">{analyticsSnapshot.dropOffPoint}</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardHeader>
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
      </div>
    </DashboardLayout>
  );
}

