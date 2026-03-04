import { useMemo } from 'react';
import { Link } from 'react-router';
import { LuBookOpenCheck, LuMessageSquare, LuTriangleAlert } from 'react-icons/lu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { calculateProgressPercentage, calculateProjectPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

export default function InstructorLearnersPage() {
  const { instructorHub, instructorStudents } = useInstructorData();

  const rows = useMemo(() => {
    return instructorStudents.map((student, index) => {
      const lessonProgress = calculateProgressPercentage(student.progress);
      const projectProgress = calculateProjectPercentage(student.progress);
      const lateSubmissions = projectProgress < 70 ? 1 + (index % 2) : 0;

      return {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        avatarUrl: student.avatarUrl,
        riskLevel: student.riskLevel,
        lessonProgress,
        projectProgress,
        xp: student.progress.xp,
        lateSubmissions,
      };
    });
  }, [instructorStudents]);

  const riskClass = {
    'on-track': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
    'needs-attention': 'border-amber-500/30 bg-amber-500/10 text-amber-700',
    'at-risk': 'border-rose-500/30 bg-rose-500/10 text-rose-700',
  } as const;

  const atRiskCount = rows.filter((row) => row.riskLevel === 'at-risk').length;
  const attentionCount = rows.filter((row) => row.riskLevel === 'needs-attention').length;

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-2xl border-border bg-primary text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Students</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Learners</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Monitor progress, identify risk, and take direct action from each learner card.
          </p>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Total</p>
              <p className="mt-1 text-base text-white">{rows.length}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Needs Attention</p>
              <p className="mt-1 text-base text-white">{attentionCount}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">At Risk</p>
              <p className="mt-1 text-base text-white">{atRiskCount}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.id} className="rounded-2xl border-border">
            <CardContent className="p-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
                <div className="flex min-w-0 items-center gap-3 xl:w-[280px]">
                  <Avatar className="h-11 w-11 border border-border">
                    <AvatarImage src={row.avatarUrl} alt={row.fullName} />
                    <AvatarFallback>{row.fullName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{row.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{row.email}</p>
                    <p className="text-[11px] text-muted-foreground">XP: {row.xp}</p>
                  </div>
                </div>

                <div className="grid flex-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-xl border border-border bg-sidebar p-2">
                    <p className="text-[11px] text-muted-foreground">Lesson Progress</p>
                    <p className="text-sm text-foreground">{row.lessonProgress}%</p>
                    <Progress value={row.lessonProgress} className="mt-1 h-1.5" />
                  </div>
                  <div className="rounded-xl border border-border bg-sidebar p-2">
                    <p className="text-[11px] text-muted-foreground">Project Progress</p>
                    <p className="text-sm text-foreground">{row.projectProgress}%</p>
                    <Progress value={row.projectProgress} className="mt-1 h-1.5" />
                  </div>
                  <div className="rounded-xl border border-border bg-sidebar p-2">
                    <p className="text-[11px] text-muted-foreground">Risk</p>
                    <Badge className={`mt-1 border text-[11px] ${riskClass[row.riskLevel]}`}>
                      {row.riskLevel.replace('-', ' ')}
                    </Badge>
                  </div>
                  <div className="rounded-xl border border-border bg-sidebar p-2">
                    <p className="text-[11px] text-muted-foreground">Late Submissions</p>
                    <p className="text-sm text-foreground">{row.lateSubmissions}</p>
                  </div>
                </div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {row.riskLevel !== 'on-track' && (
                  <Badge className="border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-700">
                    <LuTriangleAlert className="mr-1 h-3.5 w-3.5" />
                    Intervention recommended
                  </Badge>
                )}

                <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg border border-border bg-card text-xs">
                  <Link to={`/instructor/students/${row.id}`}>
                    View profile
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg border border-border bg-card text-xs">
                  <Link to="/instructor/communication">
                    <LuMessageSquare className="h-3.5 w-3.5" />
                    Message
                  </Link>
                </Button>
                <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg border border-border bg-card text-xs">
                  <Link to="/instructor/assessments">
                    <LuBookOpenCheck className="h-3.5 w-3.5" />
                    Assign task
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

