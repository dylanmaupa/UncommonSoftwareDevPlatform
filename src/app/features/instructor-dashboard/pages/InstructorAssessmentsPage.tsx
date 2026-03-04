import { useMemo } from 'react';
import { LuBookOpenCheck, LuClock3, LuTarget } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function InstructorAssessmentsPage() {
  const { instructorHub, instructorStudents } = useInstructorData();

  const tasks = useMemo(() => {
    const names = ['Async Bug Hunt', 'SQL Joins Quiz', 'API Reflection Log', 'Debugging Sprint'];

    return names.map((title, index) => {
      const submissionRate = clamp(72 - index * 9 + Math.round(instructorStudents.length * 0.6), 15, 99);
      const onTimeRate = clamp(submissionRate - 10 + (index % 3) * 5, 10, 99);
      const passRate = clamp(onTimeRate - 8 + (index % 2) * 4, 5, 98);
      const avgScore = clamp(passRate + 12, 20, 99);
      const reattemptRate = clamp(100 - passRate + 8, 5, 90);
      return { id: `task-${index}`, title, submissionRate, onTimeRate, passRate, avgScore, reattemptRate };
    });
  }, [instructorStudents.length]);

  const avgSubmission = Math.round(tasks.reduce((sum, task) => sum + task.submissionRate, 0) / Math.max(1, tasks.length));
  const avgPass = Math.round(tasks.reduce((sum, task) => sum + task.passRate, 0) / Math.max(1, tasks.length));
  const gradingQueue = tasks.filter((task) => task.submissionRate > 0).length * Math.max(1, Math.round(instructorStudents.length * 0.35));

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-2xl border-border bg-primary text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Assessments</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Assessment Performance</h1>
          <p className="max-w-2xl text-sm text-white/80">Submission, on-time completion, pass rates, and reattempt signals across exercises.</p>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Submission</p><p className="mt-1 text-base text-white">{avgSubmission}%</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Pass Rate</p><p className="mt-1 text-base text-white">{avgPass}%</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Grading Queue</p><p className="mt-1 text-base text-white">{gradingQueue}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {tasks.map((task) => (
          <Card key={task.id} className="rounded-2xl border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-foreground">{task.title}</p>
                  <p className="text-xs text-muted-foreground">Current hub cohort</p>
                </div>
                <Badge className="border border-border bg-card text-[11px] text-muted-foreground">Avg score {task.avgScore}%</Badge>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-5 text-xs">
                <div className="rounded-lg border border-border bg-sidebar p-2">
                  Submission
                  <p className="text-foreground">{task.submissionRate}%</p>
                  <Progress value={task.submissionRate} className="mt-1 h-1.5" />
                </div>
                <div className="rounded-lg border border-border bg-sidebar p-2">
                  On-time
                  <p className="text-foreground">{task.onTimeRate}%</p>
                  <Progress value={task.onTimeRate} className="mt-1 h-1.5" />
                </div>
                <div className="rounded-lg border border-border bg-sidebar p-2">
                  Pass rate
                  <p className="text-foreground">{task.passRate}%</p>
                  <Progress value={task.passRate} className="mt-1 h-1.5" />
                </div>
                <div className="rounded-lg border border-border bg-sidebar p-2">
                  Reattempt
                  <p className="text-foreground">{task.reattemptRate}%</p>
                  <Progress value={task.reattemptRate} className="mt-1 h-1.5" />
                </div>
                <div className="rounded-lg border border-border bg-sidebar p-2">
                  Priority
                  <p className="text-foreground">{task.passRate < 60 ? 'High' : task.passRate < 75 ? 'Medium' : 'Low'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border bg-sidebar">
        <CardContent className="grid grid-cols-2 gap-2 p-4 text-xs text-muted-foreground sm:grid-cols-4">
          <div className="flex items-center gap-2"><LuBookOpenCheck className="h-4 w-4" /> Exercise signals</div>
          <div className="flex items-center gap-2"><LuClock3 className="h-4 w-4" /> On-time tracking</div>
          <div className="flex items-center gap-2"><LuTarget className="h-4 w-4" /> Pass thresholds</div>
          <div className="text-right">Use this page to plan next assessment cycle.</div>
        </CardContent>
      </Card>
    </div>
  );
}

