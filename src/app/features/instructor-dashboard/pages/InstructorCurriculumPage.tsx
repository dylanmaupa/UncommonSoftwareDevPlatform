import { useMemo } from 'react';
import { Link } from 'react-router';
import { LuArrowRight, LuBookOpen, LuClock3, LuTarget, LuTriangleAlert, LuTrendingUp } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

const moduleLabels = [
  'Web Foundations',
  'JavaScript Basics',
  'Async and APIs',
  'Backend Services',
  'Data and SQL',
  'Testing and Deployment',
] as const;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function InstructorCurriculumPage() {
  const { instructorHub, instructorStudents } = useInstructorData();

  const lessonProgressValues = useMemo(() => {
    return instructorStudents.map((student) => calculateProgressPercentage(student.progress));
  }, [instructorStudents]);

  const moduleRows = useMemo(() => {
    const completionRows = moduleLabels.map((moduleName, index) => {
      const expectedThreshold = Math.round(((index + 1) / moduleLabels.length) * 100);
      const completedCount = lessonProgressValues.filter((progress) => progress >= expectedThreshold).length;
      const completionRate =
        instructorStudents.length === 0
          ? 0
          : Math.round((completedCount / instructorStudents.length) * 100);
      const averageHours = clamp(Math.round(4 + (100 - completionRate) / 9 + index * 0.8), 3, 26);

      return {
        moduleName,
        completionRate,
        averageHours,
      };
    });

    return completionRows.map((row, index) => {
      const previous = index === 0 ? row.completionRate : completionRows[index - 1].completionRate;
      const dropOffRate = Math.max(0, previous - row.completionRate);

      return {
        ...row,
        dropOffRate,
      };
    });
  }, [instructorStudents.length, lessonProgressValues]);

  const averageCompletion = useMemo(() => {
    if (moduleRows.length === 0) return 0;
    return Math.round(moduleRows.reduce((sum, row) => sum + row.completionRate, 0) / moduleRows.length);
  }, [moduleRows]);

  const averageDropOff = useMemo(() => {
    if (moduleRows.length <= 1) return 0;
    return Math.round(moduleRows.reduce((sum, row) => sum + row.dropOffRate, 0) / (moduleRows.length - 1));
  }, [moduleRows]);

  const averageLessonHours = useMemo(() => {
    if (moduleRows.length === 0) return 0;
    return Number((moduleRows.reduce((sum, row) => sum + row.averageHours, 0) / moduleRows.length).toFixed(1));
  }, [moduleRows]);

  const bottleneckModules = useMemo(() => {
    return [...moduleRows]
      .sort((a, b) => {
        const aScore = a.dropOffRate * 2 + (100 - a.completionRate);
        const bScore = b.dropOffRate * 2 + (100 - b.completionRate);
        return bScore - aScore;
      })
      .slice(0, 3);
  }, [moduleRows]);

  const failedChecks = useMemo(() => {
    const base = Math.max(1, instructorStudents.length);

    return [
      {
        topic: 'Async error handling',
        failed: clamp(Math.round(base * 0.55 + averageDropOff / 2), 1, base),
      },
      {
        topic: 'SQL joins and grouping',
        failed: clamp(Math.round(base * 0.48 + averageDropOff / 3), 1, base),
      },
      {
        topic: 'State synchronization',
        failed: clamp(Math.round(base * 0.41 + averageDropOff / 4), 1, base),
      },
      {
        topic: 'Test assertions',
        failed: clamp(Math.round(base * 0.34 + averageDropOff / 5), 1, base),
      },
    ]
      .sort((a, b) => b.failed - a.failed)
      .map((item) => ({
        ...item,
        failureRate: instructorStudents.length === 0 ? 0 : Math.round((item.failed / instructorStudents.length) * 100),
      }));
  }, [averageDropOff, instructorStudents.length]);

  const remediationPlan = [
    {
      id: 'rem-1',
      title: 'Run a catch-up lab for the bottom quartile',
      detail: `${bottleneckModules[0]?.moduleName ?? 'Current module'} has the highest friction signal.`,
      href: '/instructor/exercises',
      cta: 'Create lab',
    },
    {
      id: 'rem-2',
      title: 'Schedule office-hours intervention block',
      detail: `${failedChecks[0]?.topic ?? 'Core skills'} should be revisited in small groups.`,
      href: '/instructor/students',
      cta: 'Open students',
    },
    {
      id: 'rem-3',
      title: 'Publish module guidance announcement',
      detail: 'Share quick remediation resources before the next checkpoint.',
      href: '/instructor/announcements',
      cta: 'Draft update',
    },
  ];

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Curriculum Performance</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Curriculum Radar</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Monitor module completion, drop-off points, lesson pacing, and failed checks to plan targeted interventions.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-4">
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Avg Completion</p>
              <p className="mt-1 text-base text-white">{averageCompletion}%</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Avg Drop-off</p>
              <p className="mt-1 text-base text-white">{averageDropOff}%</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Avg Lesson Time</p>
              <p className="mt-1 text-base text-white">{averageLessonHours}h</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Students</p>
              <p className="mt-1 text-base text-white">{instructorStudents.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Module Completion</p>
              <p className="text-sm text-foreground">{averageCompletion}%</p>
            </div>
            <LuBookOpen className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Drop-off Signal</p>
              <p className="text-sm text-foreground">{averageDropOff}%</p>
            </div>
            <LuTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Avg Time/Lesson</p>
              <p className="text-sm text-foreground">{averageLessonHours}h</p>
            </div>
            <LuClock3 className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
        <Card className="rounded-2xl border-border bg-sidebar">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-xs text-muted-foreground">Bottlenecks</p>
              <p className="text-sm text-foreground">{bottleneckModules.length}</p>
            </div>
            <LuTarget className="h-4 w-4 text-muted-foreground" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Module Completion and Drop-off</h2>
              <p className="text-xs text-muted-foreground">Where completion declines between sequential modules</p>
            </div>

            <div className="space-y-2 p-3">
              {moduleRows.map((row) => (
                <div key={row.moduleName} className="rounded-xl border border-border bg-sidebar p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{row.moduleName}</p>
                    <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{row.completionRate}% complete</Badge>
                  </div>
                  <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center justify-between">
                      <span>Completion rate</span>
                      <span className="text-foreground">{row.completionRate}%</span>
                    </div>
                    <Progress value={row.completionRate} className="h-1.5" />
                  </div>

                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="rounded-lg bg-card p-2">
                      Drop-off
                      <p className={row.dropOffRate > 10 ? 'text-amber-700' : 'text-foreground'}>{row.dropOffRate}%</p>
                    </div>
                    <div className="rounded-lg bg-card p-2">
                      Avg time
                      <p className="text-foreground">{row.averageHours}h</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div>
                  <h2 className="heading-font text-lg text-foreground">Most Failed Quiz Checks</h2>
                  <p className="text-xs text-muted-foreground">Target weak concepts before assessments</p>
                </div>
                <LuTriangleAlert className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="space-y-2 p-3">
                {failedChecks.map((item) => (
                  <div key={item.topic} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">{item.topic}</span>
                      <span className="text-muted-foreground">{item.failed} learners</span>
                    </div>
                    <Progress value={item.failureRate} className="mt-2 h-1.5" />
                    <p className="mt-1 text-muted-foreground">Failure rate: {item.failureRate}%</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="border-b border-border px-4 py-3">
                <h2 className="heading-font text-lg text-foreground">Remediation Plan</h2>
                <p className="text-xs text-muted-foreground">Recommended next actions for this week</p>
              </div>

              <div className="space-y-2 p-3">
                {remediationPlan.map((item) => (
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
      </div>
    </div>
  );
}
