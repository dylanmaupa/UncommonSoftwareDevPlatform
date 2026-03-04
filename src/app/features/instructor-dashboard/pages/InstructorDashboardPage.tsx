import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  LuArrowRight,
  LuBell,
  LuBookOpen,
  LuBookOpenCheck,
  LuClock3,
  LuFolderKanban,
  LuMessageSquare,
  LuTarget,
  LuTriangleAlert,
  LuUsers,
} from 'react-icons/lu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { calculateProgressPercentage, calculateProjectPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

type StudentSnapshot = {
  id: string;
  fullName: string;
  avatarUrl: string;
  riskLevel: 'on-track' | 'needs-attention' | 'at-risk';
  lessonProgress: number;
  projectProgress: number;
  xp: number;
  lastActiveHours: number;
  overdueAssignments: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function InstructorDashboardPage() {
  const { instructor, instructorHub, instructorStudents } = useInstructorData();

  const studentSnapshots = useMemo<StudentSnapshot[]>(() => {
    return instructorStudents.map((student, index) => {
      const lessonProgress = calculateProgressPercentage(student.progress);
      const projectProgress = calculateProjectPercentage(student.progress);

      return {
        id: student.id,
        fullName: student.fullName,
        avatarUrl: student.avatarUrl,
        riskLevel: student.riskLevel,
        lessonProgress,
        projectProgress,
        xp: student.progress.xp,
        lastActiveHours: Math.max(1, Math.round((100 - lessonProgress) / 7 + (index % 4) * 2)),
        overdueAssignments: projectProgress < 70 ? Math.max(1, Math.round((70 - projectProgress) / 12)) : 0,
      };
    });
  }, [instructorStudents]);

  const riskCounts = useMemo(() => {
    return {
      'on-track': studentSnapshots.filter((student) => student.riskLevel === 'on-track').length,
      'needs-attention': studentSnapshots.filter((student) => student.riskLevel === 'needs-attention').length,
      'at-risk': studentSnapshots.filter((student) => student.riskLevel === 'at-risk').length,
    };
  }, [studentSnapshots]);

  const averageLessonProgress = useMemo(() => {
    if (studentSnapshots.length === 0) return 0;
    const total = studentSnapshots.reduce((sum, student) => sum + student.lessonProgress, 0);
    return Math.round(total / studentSnapshots.length);
  }, [studentSnapshots]);

  const averageProjectProgress = useMemo(() => {
    if (studentSnapshots.length === 0) return 0;
    const total = studentSnapshots.reduce((sum, student) => sum + student.projectProgress, 0);
    return Math.round(total / studentSnapshots.length);
  }, [studentSnapshots]);

  const activeNow = useMemo(() => {
    return studentSnapshots.filter((student) => student.lastActiveHours <= 8).length;
  }, [studentSnapshots]);

  const codingNow = useMemo(() => {
    return clamp(Math.round(activeNow * 0.67), 0, activeNow);
  }, [activeNow]);

  const overdueSubmissions = useMemo(() => {
    return studentSnapshots.reduce((sum, student) => sum + student.overdueAssignments, 0);
  }, [studentSnapshots]);

  const inactiveLong = useMemo(() => {
    return studentSnapshots.filter((student) => student.lastActiveHours > 18).length;
  }, [studentSnapshots]);

  const onTimeSubmissionRate = useMemo(() => {
    if (studentSnapshots.length === 0) return 0;
    const capacity = Math.max(1, studentSnapshots.length * 3);
    return clamp(100 - Math.round((overdueSubmissions / capacity) * 100), 0, 100);
  }, [studentSnapshots.length, overdueSubmissions]);

  const followUpLearners = useMemo(() => {
    return [...studentSnapshots]
      .sort((a, b) => {
        const aScore = a.lessonProgress + a.projectProgress - (a.riskLevel === 'at-risk' ? 50 : a.riskLevel === 'needs-attention' ? 20 : 0);
        const bScore = b.lessonProgress + b.projectProgress - (b.riskLevel === 'at-risk' ? 50 : b.riskLevel === 'needs-attention' ? 20 : 0);
        return aScore - bScore;
      })
      .slice(0, 4);
  }, [studentSnapshots]);

  const topLearners = useMemo(() => {
    return [...studentSnapshots]
      .sort((a, b) => {
        const aScore = a.lessonProgress + a.projectProgress + Math.round(a.xp / 30);
        const bScore = b.lessonProgress + b.projectProgress + Math.round(b.xp / 30);
        return bScore - aScore;
      })
      .slice(0, 4);
  }, [studentSnapshots]);

  const interventions = [
    `${riskCounts['at-risk']} learners are currently at risk.`,
    `${overdueSubmissions} assignment submissions are overdue.`,
    `${inactiveLong} learners have been inactive for 18+ hours.`,
  ];

  const actionQueue = [
    {
      id: 'queue-live',
      title: 'Resolve Live Blockers',
      detail: `${Math.max(1, riskCounts['at-risk'])} active blockers need immediate support.`,
      href: '/instructor/live-activity',
      cta: 'Open Live Activity',
    },
    {
      id: 'queue-exercises',
      title: 'Assign Catch-up Exercise',
      detail: `${riskCounts['needs-attention']} learners need reinforcement today.`,
      href: '/instructor/exercises',
      cta: 'Schedule Exercise',
    },
    {
      id: 'queue-announcements',
      title: 'Publish Daily Brief',
      detail: `Push a reminder to reduce missed submissions (${overdueSubmissions} pending).`,
      href: '/instructor/announcements',
      cta: 'Draft Announcement',
    },
  ];

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-white/75">Instructor Command Center</p>
              <h1 className="heading-font mt-1 text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/85">
                Track learner progress, triage risks, and execute interventions from one workspace.
              </p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-white/15 p-2 pr-3">
              <Avatar className="h-10 w-10 border border-white/30">
                <AvatarImage src={studentSnapshots[0]?.avatarUrl ?? ''} alt={instructor.fullName} />
                <AvatarFallback>{instructor.fullName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm text-white">{instructor.fullName}</p>
                <p className="text-xs text-white/75">{instructor.email}</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-5">
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Students</p>
              <p className="mt-1 text-base text-white">{studentSnapshots.length}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Active Now</p>
              <p className="mt-1 text-base text-white">{activeNow}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Coding Now</p>
              <p className="mt-1 text-base text-white">{codingNow}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">At Risk</p>
              <p className="mt-1 text-base text-white">{riskCounts['at-risk']}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Overdue</p>
              <p className="mt-1 text-base text-white">{overdueSubmissions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Avg Lesson Progress</p>
              <p className="text-sm text-foreground">{averageLessonProgress}%</p>
            </div>
            <LuBookOpen className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Avg Project Progress</p>
              <p className="text-sm text-foreground">{averageProjectProgress}%</p>
            </div>
            <LuFolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">On-time Submission Rate</p>
              <p className="text-sm text-foreground">{onTimeSubmissionRate}%</p>
            </div>
            <LuClock3 className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Needs Attention</p>
              <p className="text-sm text-foreground">{riskCounts['needs-attention']}</p>
            </div>
            <LuTarget className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="heading-font text-lg text-foreground">Intervention Alerts</h2>
                <p className="text-xs text-muted-foreground">Immediate risks requiring instructor action</p>
              </div>
              <LuTriangleAlert className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2 p-3">
              {interventions.map((item) => (
                <div key={item} className="rounded-xl border border-border bg-sidebar p-3 text-sm text-foreground">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="heading-font text-lg text-foreground">Today's Action Queue</h2>
                <p className="text-xs text-muted-foreground">Priority actions for class health and momentum</p>
              </div>
              <Badge className="border border-border bg-sidebar text-[11px] text-muted-foreground">
                {actionQueue.length} items
              </Badge>
            </div>
            <div className="space-y-2 p-3">
              {actionQueue.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-sidebar p-3">
                  <p className="text-sm text-foreground">{item.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{item.detail}</p>
                  <Button asChild size="sm" className="mt-2 h-8 rounded-lg">
                    <Link to={item.href}>
                      {item.cta}
                      <LuArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Learners Requiring Follow-up</h2>
              <p className="text-xs text-muted-foreground">Low progress, risk signals, or missing submissions</p>
            </div>
            <div className="space-y-2 p-3">
              {followUpLearners.map((student) => (
                <div key={student.id} className="rounded-xl border border-border bg-sidebar p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                        <AvatarFallback>{student.fullName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{student.fullName}</p>
                        <p className="text-xs text-muted-foreground">Last active {student.lastActiveHours}h ago</p>
                      </div>
                    </div>
                    <Badge
                      className={`border text-[11px] ${
                        student.riskLevel === 'at-risk'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-700'
                          : student.riskLevel === 'needs-attention'
                            ? 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                      }`}
                    >
                      {student.riskLevel.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Lesson progress</span>
                      <span className="text-foreground">{student.lessonProgress}%</span>
                    </div>
                    <Progress value={student.lessonProgress} className="h-1.5" />
                  </div>
                  <div className="mt-2 flex items-center gap-1.5">
                    <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg border border-border bg-card text-xs">
                      <Link to={`/instructor/students/${student.id}`}>
                        <LuUsers className="h-3.5 w-3.5" />
                        Profile
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg border border-border bg-card text-xs">
                      <Link to="/instructor/announcements">
                        <LuMessageSquare className="h-3.5 w-3.5" />
                        Message
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg border border-border bg-card text-xs">
                      <Link to="/instructor/exercises">
                        <LuBookOpenCheck className="h-3.5 w-3.5" />
                        Assign
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Top Learners</h2>
              <p className="text-xs text-muted-foreground">Highest overall progress and consistency this week</p>
            </div>
            <div className="space-y-2 p-3">
              {topLearners.map((student) => (
                <div key={student.id} className="rounded-xl border border-border bg-sidebar p-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm text-foreground">{student.fullName}</p>
                      <p className="text-xs text-muted-foreground">{student.xp} XP</p>
                    </div>
                    <Badge className="border border-border bg-card text-[11px] text-muted-foreground">
                      {Math.round((student.lessonProgress + student.projectProgress) / 2)}%
                    </Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="rounded-lg bg-card p-2">
                      Lessons
                      <p className="text-sm text-foreground">{student.lessonProgress}%</p>
                    </div>
                    <div className="rounded-lg bg-card p-2">
                      Projects
                      <p className="text-sm text-foreground">{student.projectProgress}%</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border">
        <CardContent className="grid grid-cols-1 gap-2.5 p-3 sm:grid-cols-2 xl:grid-cols-5">
          <Button asChild variant="ghost" className="h-10 justify-between rounded-xl border border-border bg-sidebar text-sm">
            <Link to="/instructor/students">
              Students
              <LuUsers className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 justify-between rounded-xl border border-border bg-sidebar text-sm">
            <Link to="/instructor/curriculum">
              Curriculum
              <LuBookOpen className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 justify-between rounded-xl border border-border bg-sidebar text-sm">
            <Link to="/instructor/exercises">
              Exercises
              <LuBookOpenCheck className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 justify-between rounded-xl border border-border bg-sidebar text-sm">
            <Link to="/instructor/projects">
              Projects
              <LuFolderKanban className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="ghost" className="h-10 justify-between rounded-xl border border-border bg-sidebar text-sm">
            <Link to="/instructor/live-activity">
              Live Activity
              <LuBell className="h-4 w-4" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
