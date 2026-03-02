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
  XAxis,
  YAxis,
} from 'recharts';
import {
  LuBell,
  LuBookOpenCheck,
  LuBuilding2,
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

const severityBadgeClass: Record<'high' | 'medium' | 'low', string> = {
  high: 'border-blue-500/30 bg-blue-500/15 text-blue-700 dark:text-blue-200',
  medium: 'border-sky-500/30 bg-sky-500/15 text-sky-700 dark:text-sky-200',
  low: 'border-cyan-500/30 bg-cyan-500/15 text-cyan-700 dark:text-cyan-200',
};

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
      hubName: summary.hub.name.replace(' Hub', ''),
      students: summary.studentCount,
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
    <div className="space-y-5 pb-6" id="instructor-dashboard">
      <section className="rounded-2xl border border-blue-500/20 bg-gradient-to-r from-blue-600/15 via-sky-600/10 to-cyan-600/10 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-blue-700 dark:text-blue-200">Instructor Command Center</p>
            <h1 className="mt-1 text-3xl font-semibold text-foreground">Welcome back, {instructor.fullName}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Monitor learner momentum, resolve risk alerts, and keep hub outcomes on track.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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
        </div>
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

      <section className="grid gap-4 xl:grid-cols-3" id="students-overview">
        <Card className="rounded-2xl border-border bg-card xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Recent Student Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="rounded-xl border border-border bg-secondary/20 p-3">
                <p className="text-sm text-foreground">{activity.text}</p>
                <p className="mt-1 text-xs text-muted-foreground">{activity.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Students Falling Behind</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {fallingBehind.length === 0 ? (
              <p className="text-sm text-muted-foreground">No students currently flagged as falling behind.</p>
            ) : (
              fallingBehind.map((student) => (
                <Link
                  key={student.id}
                  to={`/instructor/students/${student.id}`}
                  className="block rounded-xl border border-border bg-secondary/20 p-3 transition hover:bg-secondary/35"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{student.fullName}</p>
                    <Badge className="border border-blue-500/25 bg-blue-500/10 text-xs text-blue-700 dark:text-blue-200">
                      {student.progressPercentage}%
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Risk: {student.riskLevel.replace('-', ' ')}</p>
                </Link>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card xl:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Top Performing Students</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPerformers.map((student) => (
              <Link
                key={student.id}
                to={`/instructor/students/${student.id}`}
                className="block rounded-xl border border-border bg-secondary/20 p-3 transition hover:bg-secondary/35"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium text-foreground">{student.fullName}</p>
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
      </section>

      <section className="grid gap-4 xl:grid-cols-2" id="hub-performance">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Hub Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {hubPerformanceData.map((hub) => (
              <div key={hub.hubName} className="rounded-xl border border-border bg-secondary/20 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground">{hub.hubName}</p>
                  <span className="text-xs text-muted-foreground">{hub.students} students</span>
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Avg Progress: <span className="font-medium text-foreground">{hub.averageProgress}%</span></span>
                  <span>Completion: <span className="font-medium text-foreground">{hub.completionRate}%</span></span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Weekly Hub Activity (Hours Learned)</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weeklyActivityData} margin={{ top: 8, right: 12, left: 0, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="day" tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                <YAxis tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                <Tooltip
                  cursor={{ strokeDasharray: '3 3' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Line type="monotone" dataKey="hoursLearned" stroke="#2563eb" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2" id="analytics">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Course Completion by Hub</CardTitle>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hubPerformanceData} margin={{ top: 8, right: 12, left: 0, bottom: 6 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="hubName" tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                <YAxis domain={[0, 100]} tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                <Tooltip
                  cursor={{ fill: 'hsl(var(--secondary))' }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid hsl(var(--border))',
                    background: 'hsl(var(--card))',
                  }}
                />
                <Bar dataKey="completionRate" fill="#2563eb" radius={[8, 8, 0, 0]} />
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
                <div key={bucket.range}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{bucket.range}</span>
                    <span className="font-medium text-foreground">{bucket.students} students ({percentage}%)</span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>
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
