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
  LuArrowRight,
  LuBell,
  LuBookOpenCheck,
  LuBuilding2,
  LuChevronRight,
  LuClock3,
  LuDownload,
  LuMessageSquare,
  LuSearch,
  LuSend,
  LuSparkles,
  LuTarget,
  LuTriangleAlert,
  LuTrendingUp,
  LuUserCheck,
  LuUsers,
} from 'react-icons/lu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
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

  const topPerformers = useMemo(() => sortedByProgress.slice(0, 4), [sortedByProgress]);

  const fallingBehind = useMemo(() => {
    return [...studentRows]
      .filter((student) => student.riskLevel !== 'on-track' || student.progressPercentage < 45)
      .sort((a, b) => a.progressPercentage - b.progressPercentage)
      .slice(0, 4);
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

    return [...topActivity, ...behindActivity].slice(0, 5);
  }, [topPerformers, fallingBehind]);

  const reviewQueueCount = Math.max(2, Math.round(metrics.totalStudents * 0.3));
  const profileAvatar = topPerformers[0]?.avatarUrl ?? '';

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
      actionLabel: 'Open progress',
      actionTo: '/instructor/students',
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
    <div className="p-3 sm:p-4 lg:p-6 space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-sidebar p-3">
        <div className="order-1 relative w-full min-w-0 sm:min-w-[220px] sm:flex-1">
          <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            defaultValue=""
            placeholder="Search students, hubs, and alerts..."
            className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none"
          />
        </div>
        <div className="order-2 flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
            <LuBell className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
            <LuSparkles className="h-4 w-4" />
          </Button>
        </div>
        <div className="order-3 ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
          <Avatar className="h-8 w-8">
            <AvatarImage src={profileAvatar} alt={instructor.fullName} />
            <AvatarFallback>{instructor.fullName ? instructor.fullName[0] : 'I'}</AvatarFallback>
          </Avatar>
          <span className="hidden pr-2 text-sm text-foreground sm:block">{instructor.fullName}</span>
        </div>
      </div>

      <Card className="overflow-hidden rounded-2xl border-border bg-primary">
        <CardContent className="p-4 sm:p-6">
          <p className="text-xs uppercase tracking-wider text-white/80">Instructor Workspace</p>
          <h1 className="heading-font mt-2 max-w-2xl text-2xl leading-tight text-white sm:text-3xl">
            Instructor Home
          </h1>
          <p className="mt-2 text-sm text-white/80">
            Active today: {activeStudentsToday} learners. Review {fallingBehind.length} students needing support.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link to="/instructor/students">
              <Button className="rounded-full bg-white text-foreground hover:bg-white/90">
                View Students
                <LuArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Button
              variant="secondary"
              onClick={handleExportProgress}
              className="rounded-full border border-white/30 bg-white/15 text-white hover:bg-white/20"
            >
              <LuDownload className="mr-2 h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard
          title="Total Students"
          value={metrics.totalStudents}
          subtitle="Assigned learners"
          icon={<LuUsers className="h-4 w-4" />}
        />
        <MetricCard
          title="Active Today"
          value={activeStudentsToday}
          subtitle="Studying now"
          icon={<LuUserCheck className="h-4 w-4" />}
        />
        <MetricCard
          title="Falling Behind"
          value={fallingBehind.length}
          subtitle="Need follow-up"
          icon={<LuTriangleAlert className="h-4 w-4" />}
        />
        <MetricCard
          title="Avg Progress"
          value={`${metrics.averageProgress}%`}
          subtitle="Across students"
          icon={<LuTrendingUp className="h-4 w-4" />}
        />
        <MetricCard
          title="Hubs Managed"
          value={metrics.totalHubs}
          subtitle="Assigned hubs"
          icon={<LuBuilding2 className="h-4 w-4" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-lg text-foreground heading-font">Learner Pulse</h3>
              <Link to="/instructor/students" className="text-xs text-muted-foreground hover:text-foreground">
                Open roster
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 md:grid-cols-2">
              <div className="rounded-2xl border border-border bg-sidebar p-3">
                <p className="text-sm text-foreground heading-font">Recent Activity</p>
                <div className="mt-2 space-y-2">
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className="rounded-xl bg-card p-2.5">
                      <p className="text-xs text-foreground">{activity.text}</p>
                      <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-muted-foreground">
                        <LuClock3 className="h-3.5 w-3.5" />
                        {activity.time}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-2xl border border-border bg-sidebar p-3">
                  <p className="text-sm text-foreground heading-font">Top Performers</p>
                  <div className="mt-2 space-y-2">
                    {topPerformers.map((student) => (
                      <Link key={student.id} to={`/instructor/students/${student.id}`} className="block rounded-xl bg-card p-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs text-foreground">{student.fullName}</p>
                          <span className="text-[11px] font-semibold text-primary">{student.xp} XP</span>
                        </div>
                        <div className="mt-2 flex items-center gap-2">
                          <Progress value={student.progressPercentage} className="h-2 flex-1" />
                          <span className="text-[11px] text-muted-foreground">{student.progressPercentage}%</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-sidebar p-3">
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Task Queue</p>
                  <div className="mt-2 space-y-2">
                    <Link to="/instructor/students" className="flex items-start gap-2 rounded-xl bg-card p-2.5 text-xs text-foreground">
                      <LuBookOpenCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Review {reviewQueueCount} assignment submissions</span>
                    </Link>
                    <Link to="/instructor/students" className="flex items-start gap-2 rounded-xl bg-card p-2.5 text-xs text-foreground">
                      <LuBookOpenCheck className="mt-0.5 h-4 w-4 text-primary" />
                      <span>Send intervention feedback to flagged students</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base text-foreground heading-font">Operations Panel</h3>
              <Badge className="border border-blue-500/25 bg-blue-500/10 text-[11px] text-blue-700 dark:text-blue-200">
                Instructor
              </Badge>
            </div>

            <div className="flex flex-col items-center rounded-2xl bg-sidebar p-3">
              <Avatar className="h-16 w-16 border border-border">
                <AvatarImage src={profileAvatar} alt={instructor.fullName} />
                <AvatarFallback>{instructor.fullName ? instructor.fullName[0] : 'I'}</AvatarFallback>
              </Avatar>
              <p className="mt-2 text-sm text-foreground">{instructor.fullName}</p>
              <p className="text-xs text-muted-foreground">{instructor.email}</p>
            </div>

            {alerts.map((alert) => (
              <div key={alert.id} className="rounded-xl border border-border bg-sidebar p-3">
                <div className="flex items-center justify-between gap-2">
                  <Badge className={`border text-[11px] ${severityBadgeClass[alert.severity]}`}>{alert.severity}</Badge>
                  <Link to={alert.actionTo} className="text-[11px] text-primary hover:underline">
                    {alert.actionLabel}
                  </Link>
                </div>
                <p className="mt-1 text-xs text-foreground">{alert.title}</p>
              </div>
            ))}

            {messages.map((message) => (
              <div key={message.id} className="rounded-xl border border-border bg-sidebar p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-foreground">{message.title}</p>
                  <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{message.tag}</Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{message.detail}</p>
              </div>
            ))}

            <div className="grid grid-cols-1 gap-2">
              <Link to="/instructor/hubs" className="block">
                <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm text-foreground">
                  View All Hubs
                  <LuChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/instructor/students" className="block">
                <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm text-foreground">
                  Message a Student
                  <LuMessageSquare className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm text-foreground"
              >
                Send Group Announcement
                <LuSend className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-lg text-foreground heading-font">Hub Performance</h3>
              <Link to="/instructor/hubs" className="text-xs text-muted-foreground hover:text-foreground">
                View hubs
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-[1fr_1.1fr]">
              <div className="space-y-2">
                {hubPerformanceData.map((hub) => {
                  const loadPercentage = hub.capacity > 0 ? Math.round((hub.students / hub.capacity) * 100) : 0;

                  return (
                    <div key={hub.hubId} className="rounded-xl border border-border bg-sidebar p-3">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm text-foreground">{hub.hubName}</p>
                        <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{hub.city}</Badge>
                      </div>
                      <div className="mt-2 text-[11px] text-muted-foreground">
                        <p>
                          Students: <span className="text-foreground">{hub.students}/{hub.capacity}</span>
                        </p>
                        <Progress value={loadPercentage} className="mt-1 h-2" />
                        <div className="mt-2 flex items-center justify-between">
                          <span>
                            Avg Progress: <span className="text-foreground">{hub.averageProgress}%</span>
                          </span>
                          <span>
                            Completion: <span className="text-foreground">{hub.completionRate}%</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-xl border border-border bg-sidebar p-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={weeklyActivityData} margin={{ top: 8, right: 10, left: -18, bottom: 4 }}>
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
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-lg text-foreground heading-font">Progress Distribution</h3>
              <Badge className="border border-border bg-card text-[11px] text-muted-foreground">Live</Badge>
            </div>
            <div className="grid grid-cols-1 gap-3 p-4 xl:grid-cols-2">
              <div className="rounded-xl border border-border bg-sidebar p-2">
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hubPerformanceData} margin={{ top: 8, right: 10, left: -18, bottom: 4 }}>
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
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-border bg-sidebar p-3">
                {progressDistribution.map((bucket) => {
                  const percentage = metrics.totalStudents > 0 ? Math.round((bucket.students / metrics.totalStudents) * 100) : 0;

                  return (
                    <div key={bucket.range} className="rounded-xl bg-card p-2.5">
                      <div className="mb-1 flex items-center justify-between text-xs">
                        <span className="text-muted-foreground">{bucket.range}</span>
                        <span className="text-foreground">
                          {bucket.students} students ({percentage}%)
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
