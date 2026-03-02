import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  type TooltipProps,
  XAxis,
  YAxis,
} from 'recharts';
import {
  LuArrowUpRight,
  LuBell,
  LuBookOpenCheck,
  LuBuilding2,
  LuClock3,
  LuDownload,
  LuMessageSquare,
  LuSend,
  LuSparkles,
  LuTriangleAlert,
  LuTrendingUp,
  LuUserCheck,
  LuUsers,
} from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import MetricCard from '../components/shared/MetricCard';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

type StudentView = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  riskLevel: 'on-track' | 'needs-attention' | 'at-risk';
  progressPercentage: number;
  xp: number;
};

const riskLabel: Record<StudentView['riskLevel'], string> = {
  'on-track': 'On Track',
  'needs-attention': 'Needs Attention',
  'at-risk': 'At Risk',
};

const severityBadgeClass: Record<'high' | 'medium' | 'low', string> = {
  high: 'border-blue-600/35 bg-blue-600/15 text-blue-700 dark:text-blue-200',
  medium: 'border-sky-600/35 bg-sky-600/15 text-sky-700 dark:text-sky-200',
  low: 'border-cyan-600/35 bg-cyan-600/15 text-cyan-700 dark:text-cyan-200',
};

function ChartTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="mt-1 space-y-0.5">
        {payload.map((item) => (
          <p key={`${item.dataKey}-${item.value}`} className="text-sm text-foreground">
            {item.name ?? item.dataKey}: <span className="font-semibold">{item.value}</span>
          </p>
        ))}
      </div>
    </div>
  );
}

export default function InstructorDashboardPage() {
  const { instructor, metrics, instructorStudents, hubSummaries } = useInstructorData();

  const studentRows = useMemo<StudentView[]>(() => {
    return instructorStudents.map((student) => ({
      id: student.id,
      fullName: student.fullName,
      email: student.email,
      avatarUrl: student.avatarUrl,
      riskLevel: student.riskLevel,
      progressPercentage: calculateProgressPercentage(student.progress),
      xp: student.progress.xp,
    }));
  }, [instructorStudents]);

  const sortedByProgress = useMemo(() => {
    return [...studentRows].sort((a, b) => b.progressPercentage - a.progressPercentage);
  }, [studentRows]);

  const topPerformers = useMemo(() => sortedByProgress.slice(0, 5), [sortedByProgress]);

  const fallingBehind = useMemo(() => {
    return [...studentRows]
      .filter((student) => student.riskLevel !== 'on-track' || student.progressPercentage < 45)
      .sort((a, b) => a.progressPercentage - b.progressPercentage)
      .slice(0, 5);
  }, [studentRows]);

  const activeStudentsToday = useMemo(() => {
    return studentRows.filter((student) => student.riskLevel === 'on-track' && student.progressPercentage >= 50).length;
  }, [studentRows]);

  const weeklyActivityData = useMemo(() => {
    return dayLabels.map((day, dayIndex) => {
      const hoursLearned = hubSummaries.reduce((sum, summary, hubIndex) => {
        const baseline = Math.max(4, Math.round(summary.averageProgress / 6));
        const variation = ((dayIndex + 2) * (hubIndex + 3) + summary.studentCount) % 5;
        return sum + baseline + variation;
      }, 0);

      return {
        day,
        hoursLearned,
      };
    });
  }, [hubSummaries]);

  const hubPerformanceData = useMemo(() => {
    return hubSummaries.map((summary) => ({
      hubId: summary.hub.id,
      hubName: summary.hub.name.replace(' Hub', ''),
      city: summary.hub.city,
      cohort: summary.hub.cohort,
      students: summary.studentCount,
      capacity: summary.hub.capacity,
      averageProgress: summary.averageProgress,
      completionRate: summary.completionRate,
    }));
  }, [hubSummaries]);

  const progressDistribution = useMemo(() => {
    const buckets = [
      { label: '0-25%', min: 0, max: 25 },
      { label: '26-50%', min: 26, max: 50 },
      { label: '51-75%', min: 51, max: 75 },
      { label: '76-100%', min: 76, max: 100 },
    ];

    return buckets.map((bucket) => ({
      range: bucket.label,
      students: studentRows.filter(
        (student) => student.progressPercentage >= bucket.min && student.progressPercentage <= bucket.max
      ).length,
    }));
  }, [studentRows]);

  const recentActivity = useMemo(() => {
    const topActivity = topPerformers.map((student, index) => ({
      id: `${student.id}-activity`,
      text: `${student.fullName} completed Module ${index + 2}`,
      time: `${(index + 1) * 12} min ago`,
    }));

    const behindActivity = fallingBehind.slice(0, 2).map((student, index) => ({
      id: `${student.id}-support`,
      text: `${student.fullName} needs support on current learning path`,
      time: `${index + 1}h ago`,
    }));

    return [...topActivity, ...behindActivity].slice(0, 6);
  }, [topPerformers, fallingBehind]);

  const reviewQueueCount = Math.max(2, Math.round(metrics.totalStudents * 0.3));
  const certificationReadyCount = topPerformers.filter((student) => student.progressPercentage >= 85).length;

  const alerts = [
    {
      id: 'alert-inactive',
      severity: 'high' as const,
      title: `${fallingBehind.length} students are currently falling behind`,
      actionLabel: 'Review students',
      actionTo: '/instructor/students',
    },
    {
      id: 'alert-stuck',
      severity: 'medium' as const,
      title: `${Math.max(1, Math.round(fallingBehind.length * 0.6))} students appear stuck on the same module`,
      actionLabel: 'Open student progress',
      actionTo: '/instructor/students',
    },
    {
      id: 'alert-cert',
      severity: 'low' as const,
      title: `${certificationReadyCount} learners reached certification-ready progress`,
      actionLabel: 'Open top performers',
      actionTo: '/instructor/students',
    },
  ];

  const tasks = [
    {
      id: 'task-review',
      title: `Review ${reviewQueueCount} assignment submissions`,
      to: '/instructor/students',
    },
    {
      id: 'task-feedback',
      title: 'Send intervention feedback to at-risk students',
      to: '/instructor/students',
    },
    {
      id: 'task-badges',
      title: 'Approve achievement badge nominations',
      to: '/instructor/students',
    },
  ];

  const messages = [
    {
      id: 'msg-admin',
      title: 'Admin Announcement',
      detail: 'Quarterly instructor sync is scheduled for Friday at 14:00.',
      tag: 'Announcement',
    },
    {
      id: 'msg-join',
      title: '2 students joined your hubs',
      detail: 'Harare Central Hub received two new student assignments.',
      tag: 'Enrollment',
    },
    {
      id: 'msg-course',
      title: 'New course published',
      detail: 'Applied JavaScript Patterns is now available for assignment.',
      tag: 'Course Update',
    },
  ];

  const handleExportProgress = () => {
    const header = ['Student Name', 'Email', 'Progress (%)', 'XP', 'Risk Level'];
    const rows = studentRows.map((student) => [
      student.fullName,
      student.email,
      String(student.progressPercentage),
      String(student.xp),
      student.riskLevel,
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'instructor-student-progress.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-8" id="instructor-dashboard">
      <section className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <Card className="relative overflow-hidden rounded-2xl border-blue-500/20 bg-gradient-to-br from-blue-600/20 via-sky-600/10 to-cyan-500/10">
          <div className="absolute -right-8 -top-10 h-36 w-36 rounded-full bg-blue-500/10 blur-2xl" />
          <CardContent className="relative p-5 lg:p-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-200">Instructor Command Center</p>
            <h1 className="mt-2 text-3xl font-semibold leading-tight text-foreground">
              Welcome back, {instructor.fullName}
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              Track student momentum, surface intervention points quickly, and drive consistent hub outcomes.
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <Badge className="border border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-200">
                {metrics.totalHubs} hubs managed
              </Badge>
              <Badge className="border border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-200">
                {metrics.totalStudents} students assigned
              </Badge>
              <Badge className="border border-cyan-500/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200">
                {metrics.averageProgress}% average progress
              </Badge>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              <Link to="/instructor/students">
                <Button className="rounded-xl bg-blue-600 text-white hover:bg-blue-700">
                  <LuUsers className="mr-2 h-4 w-4" />
                  View All Students
                </Button>
              </Link>
              <Link to="/instructor/hubs">
                <Button variant="outline" className="rounded-xl border-blue-500/30 bg-blue-500/5">
                  <LuBuilding2 className="mr-2 h-4 w-4" />
                  View All Hubs
                </Button>
              </Link>
              <Button variant="outline" onClick={handleExportProgress} className="rounded-xl border-blue-500/30 bg-blue-500/5">
                <LuDownload className="mr-2 h-4 w-4" />
                Export Progress CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card/95">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Today at a Glance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="rounded-xl border border-border bg-secondary/20 p-3">
              <p className="text-xs uppercase tracking-wider text-muted-foreground">Need attention</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{fallingBehind.length}</p>
              <p className="text-xs text-muted-foreground">Learners should receive support today.</p>
            </div>
            <div className="space-y-2">
              {alerts.slice(0, 2).map((alert) => (
                <Link
                  key={alert.id}
                  to={alert.actionTo}
                  className="flex items-start gap-2 rounded-lg border border-border bg-secondary/10 p-2 text-sm transition hover:bg-secondary/25"
                >
                  <LuTriangleAlert className="mt-0.5 h-4 w-4 text-primary" />
                  <span className="text-foreground">{alert.title}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total Students Assigned"
          value={metrics.totalStudents}
          subtitle="Learners across your hubs"
          icon={<LuUsers className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Students Today"
          value={activeStudentsToday}
          subtitle="On-track and progressing"
          icon={<LuUserCheck className="h-4 w-4" />}
        />
        <MetricCard
          title="Students Falling Behind"
          value={fallingBehind.length}
          subtitle="Need intervention"
          icon={<LuTriangleAlert className="h-4 w-4" />}
        />
        <MetricCard
          title="Average Course Progress"
          value={`${metrics.averageProgress}%`}
          subtitle="Across assigned students"
          icon={<LuTrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Total Hubs Managed"
          value={metrics.totalHubs}
          subtitle="Current active hubs"
          icon={<LuBuilding2 className="h-4 w-4" />}
        />
      </section>

      <section className="space-y-3" id="students-overview">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Students Overview</h2>
            <p className="text-sm text-muted-foreground">Live learner signals for quick interventions.</p>
          </div>
          <Link to="/instructor/students" className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
            Open full roster
            <LuArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Student Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="rounded-xl border border-border bg-secondary/20 p-3">
                  <p className="text-sm text-foreground">{activity.text}</p>
                  <p className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground">
                    <LuClock3 className="h-3.5 w-3.5" />
                    {activity.time}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Students Falling Behind</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {fallingBehind.length === 0 ? (
                <p className="text-sm text-muted-foreground">No students currently flagged as falling behind.</p>
              ) : (
                fallingBehind.map((student) => (
                  <Link
                    key={student.id}
                    to={`/instructor/students/${student.id}`}
                    className="flex items-center gap-3 rounded-xl border border-border bg-secondary/20 p-3 transition hover:bg-secondary/35"
                  >
                    <img src={student.avatarUrl} alt={student.fullName} className="h-10 w-10 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground">{riskLabel[student.riskLevel]}</p>
                    </div>
                    <Badge className="border border-blue-500/25 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-200">
                      {student.progressPercentage}%
                    </Badge>
                  </Link>
                ))
              )}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Top Performing Students</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {topPerformers.map((student) => (
                <Link
                  key={student.id}
                  to={`/instructor/students/${student.id}`}
                  className="block rounded-xl border border-border bg-secondary/20 p-3 transition hover:bg-secondary/35"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex min-w-0 items-center gap-2">
                      <img src={student.avatarUrl} alt={student.fullName} className="h-8 w-8 rounded-full object-cover" />
                      <p className="truncate text-sm font-medium text-foreground">{student.fullName}</p>
                    </div>
                    <span className="text-xs font-semibold text-blue-600 dark:text-blue-300">{student.xp} XP</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Progress value={student.progressPercentage} className="h-2 flex-1" />
                    <span className="text-xs text-muted-foreground">{student.progressPercentage}%</span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3" id="hub-performance">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Hub Performance</h2>
          <p className="text-sm text-muted-foreground">Capacity, progress, and completion signals per hub.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Hub Summary Cards</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {hubPerformanceData.map((hub) => {
                const loadPercentage = hub.capacity > 0 ? Math.round((hub.students / hub.capacity) * 100) : 0;

                return (
                  <div key={hub.hubId} className="rounded-xl border border-border bg-secondary/20 p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium text-foreground">{hub.hubName}</p>
                      <Badge className="border border-blue-500/25 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-200">
                        {hub.city}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{hub.cohort}</p>
                    <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                      <p>
                        Student Load: <span className="font-medium text-foreground">{hub.students}/{hub.capacity}</span>
                      </p>
                      <Progress value={loadPercentage} className="h-2" />
                      <p>
                        Avg Progress: <span className="font-medium text-foreground">{hub.averageProgress}%</span>
                      </p>
                      <p>
                        Completion Rate: <span className="font-medium text-foreground">{hub.completionRate}%</span>
                      </p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Weekly Activity (Hours Learned)</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyActivityData} margin={{ top: 8, right: 8, left: -12, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                  <YAxis tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                  <Tooltip content={<ChartTooltip />} />
                  <Line type="monotone" dataKey="hoursLearned" name="Hours" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="space-y-3" id="analytics">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Course Progress Analytics</h2>
          <p className="text-sm text-muted-foreground">Completion trends and progress distribution across your students.</p>
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Course Completion by Hub</CardTitle>
            </CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={hubPerformanceData} margin={{ top: 8, right: 8, left: -12, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hubName" tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                  <Tooltip content={<ChartTooltip />} />
                  <Bar dataKey="completionRate" name="Completion %" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Progress Distribution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {progressDistribution.map((bucket) => {
                const percentage = metrics.totalStudents > 0 ? Math.round((bucket.students / metrics.totalStudents) * 100) : 0;

                return (
                  <div key={bucket.range} className="rounded-xl border border-border bg-secondary/20 p-3">
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{bucket.range}</span>
                      <span className="font-medium text-foreground">
                        {bucket.students} students ({percentage}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2" id="alerts-tasks">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Tasks & Alerts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-border bg-secondary/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <Badge className={`border text-xs ${severityBadgeClass[alert.severity]}`}>{alert.severity}</Badge>
                  <Link to={alert.actionTo} className="text-xs font-medium text-primary hover:underline">
                    {alert.actionLabel}
                  </Link>
                </div>
                <p className="mt-2 text-sm text-foreground">{alert.title}</p>
              </div>
            ))}

            <div className="space-y-2 rounded-xl border border-border bg-secondary/20 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Task Queue</p>
              {tasks.map((task) => (
                <Link key={task.id} to={task.to} className="flex items-start gap-2 text-sm text-foreground hover:text-primary">
                  <LuBookOpenCheck className="mt-0.5 h-4 w-4 text-primary" />
                  <span>{task.title}</span>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Messages & Communication</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {messages.map((message) => (
              <div key={message.id} className="rounded-xl border border-border bg-secondary/20 p-3">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{message.title}</p>
                  <Badge className="border border-blue-500/25 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-200">
                    {message.tag}
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{message.detail}</p>
              </div>
            ))}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Link to="/instructor/students">
                <Button variant="outline" className="w-full rounded-xl border-blue-500/30 bg-blue-500/5">
                  <LuMessageSquare className="mr-2 h-4 w-4" />
                  Message a Student
                </Button>
              </Link>
              <Link to="/instructor/hubs">
                <Button variant="outline" className="w-full rounded-xl border-blue-500/30 bg-blue-500/5">
                  <LuSend className="mr-2 h-4 w-4" />
                  Send Group Announcement
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="rounded-2xl border border-border bg-card p-4" id="quick-actions">
        <div className="mb-3 flex items-center gap-2">
          <LuSparkles className="h-4 w-4 text-primary" />
          <p className="text-base font-semibold text-foreground">Quick Actions</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <Link to="/instructor/students">
            <Button variant="outline" className="w-full justify-start rounded-xl">
              <LuUsers className="mr-2 h-4 w-4" />
              View All Students
            </Button>
          </Link>
          <Link to="/instructor/hubs">
            <Button variant="outline" className="w-full justify-start rounded-xl">
              <LuBuilding2 className="mr-2 h-4 w-4" />
              View All Hubs
            </Button>
          </Link>
          <Link to="/instructor/students">
            <Button variant="outline" className="w-full justify-start rounded-xl">
              <LuBell className="mr-2 h-4 w-4" />
              Check Alerts
            </Button>
          </Link>
          <Link to="/instructor/students">
            <Button variant="outline" className="w-full justify-start rounded-xl">
              <LuMessageSquare className="mr-2 h-4 w-4" />
              Open Student Profiles
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
