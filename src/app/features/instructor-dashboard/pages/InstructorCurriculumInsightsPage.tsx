import { useMemo } from 'react';
import { Link } from 'react-router';
import { LuArrowRight, LuBookOpen, LuClock3, LuTarget, LuTriangleAlert, LuTrendingDown } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

const modules = [
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

export default function InstructorCurriculumInsightsPage() {
  const { instructorHub, instructorStudents } = useInstructorData();

  const lessonProgress = useMemo(() => {
    return instructorStudents.map((student) => calculateProgressPercentage(student.progress));
  }, [instructorStudents]);

  const rows = useMemo(() => {
    const base = modules.map((moduleName, index) => {
      const threshold = Math.round(((index + 1) / modules.length) * 100);
      const completedCount = lessonProgress.filter((value) => value >= threshold).length;
      const completion = instructorStudents.length === 0 ? 0 : Math.round((completedCount / instructorStudents.length) * 100);
      const avgHours = clamp(Math.round(4 + (100 - completion) / 10 + index), 3, 24);
      return { moduleName, completion, avgHours };
    });

    return base.map((row, index) => {
      const previous = index === 0 ? row.completion : base[index - 1].completion;
      const dropOff = Math.max(0, previous - row.completion);
      return { ...row, dropOff };
    });
  }, [instructorStudents.length, lessonProgress]);

  const avgCompletion = rows.length === 0 ? 0 : Math.round(rows.reduce((sum, row) => sum + row.completion, 0) / rows.length);
  const avgDropOff = rows.length < 2 ? 0 : Math.round(rows.reduce((sum, row) => sum + row.dropOff, 0) / (rows.length - 1));
  const avgTime = rows.length === 0 ? 0 : Number((rows.reduce((sum, row) => sum + row.avgHours, 0) / rows.length).toFixed(1));

  const bottlenecks = [...rows].sort((a, b) => b.dropOff - a.dropOff).slice(0, 3);

  const failedChecks = [
    { topic: 'Async error handling', rate: clamp(42 + avgDropOff, 10, 95) },
    { topic: 'SQL joins and grouping', rate: clamp(35 + avgDropOff, 8, 90) },
    { topic: 'State synchronization', rate: clamp(30 + Math.round(avgDropOff * 0.8), 5, 88) },
  ];

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Curriculum</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Curriculum Insights</h1>
          <p className="max-w-2xl text-sm text-white/80">Track module completion, drop-off rates, lesson pacing, and failed checks.</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Completion</p><p className="mt-1 text-base text-white">{avgCompletion}%</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Drop-off</p><p className="mt-1 text-base text-white">{avgDropOff}%</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Lesson Time</p><p className="mt-1 text-base text-white">{avgTime}h</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Module Completion Map</h2>
              <p className="text-xs text-muted-foreground">Completion and drop-off across the learning path</p>
            </div>
            <div className="space-y-2 p-3">
              {rows.map((row) => (
                <div key={row.moduleName} className="rounded-xl border border-border bg-sidebar p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{row.moduleName}</p>
                    <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{row.completion}%</Badge>
                  </div>
                  <Progress value={row.completion} className="mt-2 h-1.5" />
                  <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                    <div className="rounded-lg bg-card p-2">Drop-off<p className="text-foreground">{row.dropOff}%</p></div>
                    <div className="rounded-lg bg-card p-2">Avg time<p className="text-foreground">{row.avgHours}h</p></div>
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
                <h2 className="heading-font text-lg text-foreground">Failed Checks</h2>
                <LuTriangleAlert className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2 p-3">
                {failedChecks.map((item) => (
                  <div key={item.topic} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">{item.topic}</span>
                      <span className="text-muted-foreground">{item.rate}% fail</span>
                    </div>
                    <Progress value={item.rate} className="mt-2 h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="heading-font text-lg text-foreground">Bottlenecks</h2>
                <LuTrendingDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2 p-3">
                {bottlenecks.map((row) => (
                  <div key={row.moduleName} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                    <p className="text-foreground">{row.moduleName}</p>
                    <p className="mt-1 text-muted-foreground">Drop-off: {row.dropOff}%</p>
                  </div>
                ))}
                <Button asChild size="sm" className="h-8 rounded-lg">
                  <Link to="/instructor/assessments">
                    Plan remediation
                    <LuArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-sidebar">
            <CardContent className="flex items-center justify-between p-4 text-xs text-muted-foreground">
              <span>Use this page for curriculum-level decisions.</span>
              <LuBookOpen className="h-4 w-4" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
