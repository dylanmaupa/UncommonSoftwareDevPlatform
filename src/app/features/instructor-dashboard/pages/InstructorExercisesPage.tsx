import { useMemo } from 'react';
import { LuBookOpen, LuCode, LuFolderKanban, LuSparkles, LuTarget } from 'react-icons/lu';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

const skillKeys = [
  { key: 'html', label: 'HTML' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'python', label: 'Python' },
  { key: 'databases', label: 'Databases' },
] as const;

type SkillName = (typeof skillKeys)[number]['key'];

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function InstructorExercisesPage() {
  const { instructorStudents } = useInstructorData();

  const skillAverages = useMemo(() => {
    const initial = skillKeys.reduce<Record<SkillName, number>>((acc, skill) => {
      acc[skill.key] = 0;
      return acc;
    }, {} as Record<SkillName, number>);

    instructorStudents.forEach((student, index) => {
      const progress = calculateProgressPercentage(student.progress);
      initial.html += clamp(progress + ((index * 5) % 10) - 4, 0, 100);
      initial.javascript += clamp(progress + ((index * 7) % 14) - 10, 0, 100);
      initial.python += clamp(progress + ((index * 9) % 16) - 14, 0, 100);
      initial.databases += clamp(progress + ((index * 11) % 18) - 18, 0, 100);
    });

    if (instructorStudents.length > 0) {
      skillKeys.forEach((skill) => {
        initial[skill.key] = Math.round(initial[skill.key] / instructorStudents.length);
      });
    }

    return initial;
  }, [instructorStudents]);

  const weakestSkills = useMemo(() => {
    return [...skillKeys]
      .sort((a, b) => skillAverages[a.key] - skillAverages[b.key])
      .slice(0, 2)
      .map((skill) => skill.label);
  }, [skillAverages]);

  const lateSubmissionCount = useMemo(() => {
    return instructorStudents.filter((student) => {
      const progress = calculateProgressPercentage(student.progress);
      return student.riskLevel !== 'on-track' || progress < 55;
    }).length;
  }, [instructorStudents]);

  const incompleteModules = useMemo(() => {
    return instructorStudents.reduce((sum, student) => {
      const progress = calculateProgressPercentage(student.progress);
      return sum + Math.max(1, Math.round((100 - progress) / 20));
    }, 0);
  }, [instructorStudents]);

  const suggestions = [
    {
      id: 'suggestion-1',
      title: `${weakestSkills[0] ?? 'Core skill'} deep-dive mini-lab`,
      reason: 'Common weakness in this cohort over the last 7 days.',
      action: `Assign to ${lateSubmissionCount} learners with late submissions.`,
    },
    {
      id: 'suggestion-2',
      title: 'Catch-up sprint for incomplete modules',
      reason: 'Module completion lag is trending upward.',
      action: `Break ${incompleteModules} incomplete tasks into 3 checkpoints.`,
    },
    {
      id: 'suggestion-3',
      title: 'Pair-programming debug challenge',
      reason: 'Repeated blockers in async and query debugging patterns.',
      action: 'Auto-pair blocked learners with fast learners for 30 minutes.',
    },
  ];

  const scheduledExercises = [
    { id: 'exercise-1', type: 'Coding Challenge', title: 'Async Bug Hunt', due: 'Mar 6, 10:00', audience: 'All hubs' },
    { id: 'exercise-2', type: 'Quiz', title: 'Database Joins Quick Quiz', due: 'Mar 6, 15:30', audience: 'Needs Support tag' },
    { id: 'exercise-3', type: 'Written Assignment', title: 'API Reflection Log', due: 'Mar 7, 16:00', audience: 'Hub Harare North' },
    { id: 'exercise-4', type: 'Group Project', title: 'Mini API Build Sprint', due: 'Mar 8, 09:00', audience: 'Mixed cohorts' },
  ];

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Exercise Manager</p>
          <h1 className="heading-font text-2xl sm:text-3xl">Build and Schedule Smart Exercises</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Create coding challenges, quizzes, written assignments, and projects with auto-suggested plans based on real student performance.
          </p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button className="h-10 rounded-xl bg-white text-foreground hover:bg-white/90" onClick={() => toast.success('Coding challenge builder opened')}>
              <LuCode className="h-4 w-4" />
              Coding
            </Button>
            <Button className="h-10 rounded-xl bg-white text-foreground hover:bg-white/90" onClick={() => toast.success('Quiz builder opened')}>
              <LuTarget className="h-4 w-4" />
              Quiz
            </Button>
            <Button className="h-10 rounded-xl bg-white text-foreground hover:bg-white/90" onClick={() => toast.success('Written assignment builder opened')}>
              <LuBookOpen className="h-4 w-4" />
              Written
            </Button>
            <Button className="h-10 rounded-xl bg-white text-foreground hover:bg-white/90" onClick={() => toast.success('Group project builder opened')}>
              <LuFolderKanban className="h-4 w-4" />
              Projects
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="heading-font text-lg text-foreground">Auto-Suggested Exercises</h2>
                <p className="text-xs text-muted-foreground">Generated from weak skill trends and incomplete module data</p>
              </div>
              <Badge className="border border-blue-500/30 bg-blue-500/10 text-[11px] text-blue-700">
                <LuSparkles className="mr-1 h-3.5 w-3.5" />
                Smart
              </Badge>
            </div>

            <div className="space-y-2 p-3">
              {suggestions.map((suggestion) => (
                <div key={suggestion.id} className="rounded-xl border border-border bg-sidebar p-3">
                  <p className="text-sm text-foreground">{suggestion.title}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{suggestion.reason}</p>
                  <p className="mt-2 text-xs text-primary">{suggestion.action}</p>
                  <Button
                    size="sm"
                    className="mt-2 h-8 rounded-lg"
                    onClick={() => toast.success(`Scheduled: ${suggestion.title}`)}
                  >
                    Schedule this
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Scheduled Queue</h2>
              <p className="text-xs text-muted-foreground">Upcoming exercises and target groups</p>
            </div>

            <div className="space-y-2 p-3">
              {scheduledExercises.map((exercise) => (
                <div key={exercise.id} className="rounded-xl border border-border bg-sidebar p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm text-foreground">{exercise.title}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{exercise.type} • {exercise.audience}</p>
                    </div>
                    <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{exercise.due}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
