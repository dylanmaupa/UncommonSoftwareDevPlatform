import { useMemo } from 'react';
import { Link } from 'react-router';
import { LuArrowRight, LuBell, LuBookOpen, LuBookOpenCheck, LuClock3, LuFolderKanban, LuTarget, LuTriangleAlert, LuUsers } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { calculateProgressPercentage, calculateProjectPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function InstructorHomePage() {
  const { instructor, instructorHub, instructorStudents } = useInstructorData();

  const lessonProgress = useMemo(() => {
    if (instructorStudents.length === 0) return 0;
    const total = instructorStudents.reduce((sum, student) => sum + calculateProgressPercentage(student.progress), 0);
    return Math.round(total / instructorStudents.length);
  }, [instructorStudents]);

  const projectProgress = useMemo(() => {
    if (instructorStudents.length === 0) return 0;
    const total = instructorStudents.reduce((sum, student) => sum + calculateProjectPercentage(student.progress), 0);
    return Math.round(total / instructorStudents.length);
  }, [instructorStudents]);

  const atRisk = useMemo(() => {
    return instructorStudents.filter((student) => student.riskLevel === 'at-risk').length;
  }, [instructorStudents]);

  const needsAttention = useMemo(() => {
    return instructorStudents.filter((student) => student.riskLevel === 'needs-attention').length;
  }, [instructorStudents]);

  const activeNow = useMemo(() => {
    return clamp(Math.round(instructorStudents.length * 0.66), 0, instructorStudents.length);
  }, [instructorStudents.length]);

  const overdue = useMemo(() => {
    return instructorStudents.reduce((sum, student, index) => {
      const project = calculateProjectPercentage(student.progress);
      return sum + (project < 70 ? 1 + (index % 2) : 0);
    }, 0);
  }, [instructorStudents]);

  const actionCards = [
    {
      id: 'students',
      title: 'Students needing follow-up',
      value: `${atRisk + needsAttention}`,
      detail: `${atRisk} at-risk and ${needsAttention} needs-attention learners`,
      href: '/instructor/students',
      icon: LuUsers,
    },
    {
      id: 'assessments',
      title: 'Overdue submissions',
      value: `${overdue}`,
      detail: 'Assignments and quizzes pending review or completion',
      href: '/instructor/assessments',
      icon: LuBookOpenCheck,
    },
    {
      id: 'communication',
      title: 'Unread communication',
      value: `${Math.max(1, Math.round(instructorStudents.length * 0.35))}`,
      detail: 'Students awaiting responses in active threads',
      href: '/instructor/communication',
      icon: LuBell,
    },
  ];

  const quickLinks = [
    { label: 'Students', href: '/instructor/students', icon: LuUsers },
    { label: 'Curriculum', href: '/instructor/curriculum', icon: LuBookOpen },
    { label: 'Assessments', href: '/instructor/assessments', icon: LuBookOpenCheck },
    { label: 'Projects', href: '/instructor/projects', icon: LuFolderKanban },
    { label: 'Live Ops', href: '/instructor/live', icon: LuTarget },
  ];

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-2xl border-border bg-primary text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Instructor Home</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Overview</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Welcome {instructor.fullName}. This page tracks class health and routes you to focused instructor workflows.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-5">
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Students</p>
              <p className="mt-1 text-base text-white">{instructorStudents.length}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Active Now</p>
              <p className="mt-1 text-base text-white">{activeNow}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Lesson Progress</p>
              <p className="mt-1 text-base text-white">{lessonProgress}%</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Project Progress</p>
              <p className="mt-1 text-base text-white">{projectProgress}%</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">At Risk</p>
              <p className="mt-1 text-base text-white">{atRisk}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {actionCards.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.id} className="rounded-2xl border-border">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">{item.title}</p>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <p className="mt-2 text-3xl text-foreground heading-font">{item.value}</p>
                <p className="mt-2 text-xs text-muted-foreground">{item.detail}</p>
                <Button asChild size="sm" className="mt-3 h-8 rounded-lg">
                  <Link to={item.href}>
                    Open
                    <LuArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="heading-font text-lg text-foreground">Intervention Alerts</h2>
                <p className="text-xs text-muted-foreground">Issues that should be handled today</p>
              </div>
              <LuTriangleAlert className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-2 p-3 text-sm">
              <div className="rounded-xl border border-border bg-sidebar p-3 text-foreground">
                {atRisk} students are currently in the at-risk segment.
              </div>
              <div className="rounded-xl border border-border bg-sidebar p-3 text-foreground">
                {overdue} submissions are overdue across exercises and projects.
              </div>
              <div className="rounded-xl border border-border bg-sidebar p-3 text-foreground">
                {Math.max(1, Math.round(activeNow * 0.3))} students have repeated runtime error patterns.
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Quick Access</h2>
              <p className="text-xs text-muted-foreground">Jump to specialized instructor pages</p>
            </div>
            <div className="space-y-2 p-3">
              {quickLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.label} to={item.href} className="flex items-center justify-between rounded-xl border border-border bg-sidebar p-3">
                    <span className="text-sm text-foreground">{item.label}</span>
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border bg-sidebar">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-xs text-muted-foreground">
          <span>Hub: {instructorHub?.name ?? 'Not assigned'}</span>
          <Badge className="border border-border bg-card text-[11px] text-muted-foreground">Single Hub Scope</Badge>
          <span>Last refresh: now</span>
        </CardContent>
      </Card>
    </div>
  );
}

