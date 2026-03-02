import { Link, useParams } from 'react-router';
import { LuArrowLeft } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import StatusBadge from '../components/shared/StatusBadge';
import { calculateProgressPercentage, calculateProjectPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';
import type { AchievementTier } from '../types/instructor.types';

const tierClassNames: Record<AchievementTier, string> = {
  bronze: 'border-amber-700/20 bg-amber-700/10 text-amber-700 dark:text-amber-300',
  silver: 'border-slate-500/20 bg-slate-500/10 text-slate-700 dark:text-slate-300',
  gold: 'border-yellow-600/20 bg-yellow-600/10 text-yellow-700 dark:text-yellow-300',
  platinum: 'border-cyan-600/20 bg-cyan-600/10 text-cyan-700 dark:text-cyan-300',
};

export default function StudentProfilePage() {
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
  const studentAchievements = getStudentAchievements(student);

  return (
    <div className="space-y-4">
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
            <StatusBadge riskLevel={student.riskLevel} />
          </div>
        </CardContent>
      </Card>

      <section className="grid gap-4 md:grid-cols-2">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Lesson Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {student.progress.completedLessons}/{student.progress.totalLessons} lessons
              </span>
              <span className="font-medium text-foreground">{lessonProgress}%</span>
            </div>
            <Progress value={lessonProgress} className="h-2" />
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Project Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {student.progress.completedProjects}/{student.progress.totalProjects} projects
              </span>
              <span className="font-medium text-foreground">{projectProgress}%</span>
            </div>
            <Progress value={projectProgress} className="h-2" />
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Performance Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>
              Total XP: <span className="font-medium text-foreground">{student.progress.xp}</span>
            </p>
            <p>
              Lesson Completion: <span className="font-medium text-foreground">{lessonProgress}%</span>
            </p>
            <p>
              Project Completion: <span className="font-medium text-foreground">{projectProgress}%</span>
            </p>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            {studentAchievements.length === 0 ? (
              <p className="text-sm text-muted-foreground">No achievements unlocked yet.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {studentAchievements.map((achievement) => (
                  <Badge key={achievement.id} className={`border ${tierClassNames[achievement.tier]}`}>
                    {achievement.title}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
