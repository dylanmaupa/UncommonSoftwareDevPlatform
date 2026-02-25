import { useMemo, useState } from 'react';
import DashboardLayout from '../layout/DashboardLayout';
import { authService, coursesData } from '../../services/mockData';
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

const phaseRoadmap = [
  {
    phase: 'MVP',
    focus: 'Teaching efficiency and reliable review workflow',
    modules: ['Dashboard', 'Courses', 'Lessons', 'Assignments', 'Submissions', 'Settings'],
  },
  {
    phase: 'Intermediate',
    focus: 'Better visibility and communication',
    modules: ['Students', 'Analytics', 'Announcements'],
  },
  {
    phase: 'Advanced',
    focus: 'Consistency and operational intelligence',
    modules: ['Rubrics & Grading', 'Versioning & Draft History', 'AI Assistance'],
  },
] as const;

const submissionQueue = [
  {
    id: 'SUB-2014',
    student: 'Ari Johnson',
    assignment: 'React Module 2 Reflection',
    status: 'Pending',
    submitted: '35m ago',
  },
  {
    id: 'SUB-2011',
    student: 'Mina Lopez',
    assignment: 'Python Functions Drill',
    status: 'Reviewed',
    submitted: '2h ago',
  },
  {
    id: 'SUB-2009',
    student: 'Owen Park',
    assignment: 'JS DOM Mini Project',
    status: 'Approved',
    submitted: '4h ago',
  },
] as const;

const recentStudentActivity = [
  'Mina Lopez completed Lesson: Variables and Data Types',
  'Ari Johnson submitted React Module 2 Reflection',
  'Owen Park completed Project: Calculator App',
  'Priya Das started Lesson: Lists and Dictionaries',
] as const;

const studentStats = [
  { name: 'Ari Johnson', completionRate: 72, averageScore: 88, lastActiveDays: 1 },
  { name: 'Mina Lopez', completionRate: 84, averageScore: 92, lastActiveDays: 0 },
  { name: 'Owen Park', completionRate: 41, averageScore: 76, lastActiveDays: 8 },
  { name: 'Priya Das', completionRate: 67, averageScore: 81, lastActiveDays: 2 },
  { name: 'Noah Kim', completionRate: 29, averageScore: 69, lastActiveDays: 11 },
] as const;

const stageBadgeVariant: Record<(typeof instructorSections)[number]['stage'], 'default' | 'secondary' | 'outline'> = {
  MVP: 'default',
  Intermediate: 'secondary',
  Advanced: 'outline',
};

const submissionBadgeVariant: Record<(typeof submissionQueue)[number]['status'], 'default' | 'secondary' | 'outline'> = {
  Pending: 'secondary',
  Reviewed: 'outline',
  Approved: 'default',
};

type SectionId = (typeof instructorSections)[number]['id'];

export default function Admin() {
  const user = authService.getCurrentUser();
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard');

  if (!user) return null;

  const selectedSection = instructorSections.find((section) => section.id === activeSection) ?? instructorSections[0];
  const activeCourses = coursesData.length;
  const totalStudents = studentStats.length;
  const assignmentsPendingReview = submissionQueue.filter((item) => item.status === 'Pending').length;
  const recentActivityCount = recentStudentActivity.length;

  const analyticsSnapshot = useMemo(() => {
    const avgCompletion = Math.round(
      studentStats.reduce((sum, student) => sum + student.completionRate, 0) / studentStats.length,
    );
    const avgScore = Math.round(studentStats.reduce((sum, student) => sum + student.averageScore, 0) / studentStats.length);
    const inactiveStudents = studentStats.filter((student) => student.lastActiveDays >= 7).length;

    return {
      avgCompletion,
      avgScore,
      inactiveStudents,
      dropOffPoint: 'Module 2: Control Flow',
    };
  }, []);

  return (
    <DashboardLayout>
      <div className="p-3 sm:p-4 lg:p-6">
        <div className="mb-4 flex flex-wrap items-end justify-between gap-3 sm:mb-6">
          <div>
            <Badge variant="secondary" className="rounded-full px-3 py-1 text-[11px] uppercase tracking-wider">
              Instructor Workspace
            </Badge>
            <h1 className="heading-font mt-2 text-2xl text-foreground sm:text-3xl">Instructor Dashboard</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Optimize teaching efficiency, student visibility, and content control without extra complexity.
            </p>
          </div>
          <Button className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
            <LuBell className="mr-2 h-4 w-4" />
            Send Announcement
          </Button>
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
                        className={`flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition-colors ${
                          isActive
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
            <div className="space-y-4">
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
                    <p className="text-xs text-muted-foreground">Total students enrolled</p>
                    <p className="mt-2 text-2xl text-foreground">{totalStudents}</p>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border-border bg-sidebar">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground">Active courses</p>
                    <p className="mt-2 text-2xl text-foreground">{activeCourses}</p>
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
                        {submissionQueue.map((item) => (
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>

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
                    <p className="text-xs text-muted-foreground">Average assignment score</p>
                    <p className="mt-1 text-lg text-foreground">{analyticsSnapshot.avgScore}%</p>
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
                  {recentStudentActivity.map((item) => (
                    <div key={item} className="rounded-xl bg-sidebar p-3 text-sm text-foreground">
                      {item}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border">
                <CardHeader>
                  <CardTitle className="heading-font text-base text-foreground">MVP to Advanced Roadmap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {phaseRoadmap.map((phase) => (
                    <div key={phase.phase} className="rounded-xl bg-sidebar p-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-sm text-foreground">{phase.phase}</p>
                        <Badge variant={stageBadgeVariant[phase.phase]}>{phase.phase}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{phase.focus}</p>
                      <p className="mt-2 text-xs text-foreground">{phase.modules.join(' • ')}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border bg-destructive/5">
                <CardHeader>
                  <CardTitle className="heading-font text-base text-foreground">What Not To Add Early</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-foreground">
                  <p className="rounded-xl bg-card p-3">Complex grading formulas</p>
                  <p className="rounded-xl bg-card p-3">Over-detailed analytics</p>
                  <p className="rounded-xl bg-card p-3">Realtime chat systems</p>
                  <p className="rounded-xl bg-card p-3">Too many role types</p>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border bg-gradient-to-br from-primary/5 to-accent/5">
                <CardHeader>
                  <CardTitle className="heading-font text-base text-foreground">Instructor Dashboard = Teaching Tool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm text-muted-foreground">
                  <p>Each dashboard metric maps to an aggregated backend query.</p>
                  <p>Every workflow button maps to a state transition in your data model.</p>
                  <p>Each list view maps to filtered relational queries students can inspect and learn from.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
