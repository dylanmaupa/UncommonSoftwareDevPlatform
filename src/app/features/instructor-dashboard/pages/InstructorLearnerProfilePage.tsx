import { Link, useParams } from 'react-router';
import { LuArrowLeft, LuMessageSquare, LuSend } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { calculateProgressPercentage, calculateProjectPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

export default function InstructorLearnerProfilePage() {
  const { studentId } = useParams();
  const { getStudentById, getStudentAchievements } = useInstructorData();

  const student = studentId ? getStudentById(studentId) : undefined;

  if (!student) {
    return (
      <Card className="rounded-2xl border-border bg-card">
        <CardContent className="p-6">
          <p className="text-foreground">Student not found.</p>
          <Link to="/instructor/students" className="mt-2 inline-flex text-sm font-medium text-primary hover:underline">
            Back to students
          </Link>
        </CardContent>
      </Card>
    );
  }

  const lessonProgress = calculateProgressPercentage(student.progress);
  const projectProgress = calculateProjectPercentage(student.progress);
  const achievements = getStudentAchievements(student);

  const riskClass =
    student.riskLevel === 'at-risk'
      ? 'border-rose-500/30 bg-rose-500/10 text-rose-700'
      : student.riskLevel === 'needs-attention'
        ? 'border-amber-500/30 bg-amber-500/10 text-amber-700'
        : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700';

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Link to="/instructor/students" className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
        <LuArrowLeft className="h-4 w-4" />
        Back to students
      </Link>

      <Card className="rounded-2xl border-border bg-card">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img src={student.avatarUrl} alt={student.fullName} className="h-20 w-20 rounded-2xl object-cover" />
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-foreground">{student.fullName}</h1>
              <p className="text-sm text-muted-foreground">{student.email}</p>
              <p className="mt-1 text-sm text-muted-foreground">Cohort: {student.cohort}</p>
            </div>
            <Badge className={`border text-[11px] ${riskClass}`}>{student.riskLevel.replace('-', ' ')}</Badge>
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Lesson Progress</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-2 text-sm text-muted-foreground">{lessonProgress}% completed</p>
            <Progress value={lessonProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Project Progress</CardTitle></CardHeader>
          <CardContent>
            <p className="mb-2 text-sm text-muted-foreground">{projectProgress}% completed</p>
            <Progress value={projectProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">XP</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl text-foreground heading-font">{student.progress.xp}</p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Intervention Need</CardTitle></CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {student.riskLevel === 'on-track'
                ? 'Low - monitor weekly'
                : student.riskLevel === 'needs-attention'
                  ? 'Medium - assign catch-up task'
                  : 'High - immediate intervention'}
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Achievements</CardTitle></CardHeader>
          <CardContent>
            {achievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No achievements unlocked yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {achievements.map((achievement) => (
                  <Badge key={achievement.id} className="border border-border bg-sidebar text-[11px] text-muted-foreground">
                    {achievement.title}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2"><CardTitle className="text-base">Actions</CardTitle></CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg border border-border bg-sidebar text-xs">
              <Link to="/instructor/communication">
                <LuMessageSquare className="h-3.5 w-3.5" />
                Message learner
              </Link>
            </Button>
            <Button asChild size="sm" variant="ghost" className="h-8 rounded-lg border border-border bg-sidebar text-xs">
              <Link to="/instructor/assessments">
                <LuSend className="h-3.5 w-3.5" />
                Assign remediation task
              </Link>
            </Button>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
