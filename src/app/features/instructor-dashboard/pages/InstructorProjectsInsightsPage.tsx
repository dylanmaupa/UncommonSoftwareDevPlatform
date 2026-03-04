import { useMemo } from 'react';
import { LuFolderKanban, LuTrendingUp } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { calculateProgressPercentage, calculateProjectPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function InstructorProjectsInsightsPage() {
  const { instructorHub, instructorStudents } = useInstructorData();

  const projects = useMemo(() => {
    return instructorStudents.map((student, index) => {
      const lesson = calculateProgressPercentage(student.progress);
      const project = calculateProjectPercentage(student.progress);
      const quality = clamp(Math.round(project * 0.82 + lesson * 0.18 + (index % 3) * 4), 35, 99);
      const feedbackPending = project < 80 || student.riskLevel !== 'on-track';
      const cycleDays = clamp(Math.round(22 - project / 9 + (index % 4)), 8, 35);

      return {
        id: student.id,
        studentName: student.fullName,
        projectName: ['Portfolio API', 'Hub Attendance Tracker', 'Peer Review Engine', 'CLI Automation'][index % 4],
        completion: project,
        quality,
        feedbackPending,
        cycleDays,
      };
    });
  }, [instructorStudents]);

  const avgCompletion = Math.round(projects.reduce((sum, row) => sum + row.completion, 0) / Math.max(1, projects.length));
  const avgQuality = Math.round(projects.reduce((sum, row) => sum + row.quality, 0) / Math.max(1, projects.length));
  const feedbackQueue = projects.filter((row) => row.feedbackPending).length;

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Projects</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Project Insights</h1>
          <p className="max-w-2xl text-sm text-white/80">Track completion, quality, review state, and feedback queue.</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Completion</p><p className="mt-1 text-base text-white">{avgCompletion}%</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Quality</p><p className="mt-1 text-base text-white">{avgQuality}/100</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Feedback Queue</p><p className="mt-1 text-base text-white">{feedbackQueue}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {projects.map((row) => (
          <Card key={row.id} className="rounded-2xl border-border">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-sm text-foreground">{row.projectName}</p>
                  <p className="text-xs text-muted-foreground">{row.studentName}</p>
                </div>
                <Badge className="border border-border bg-card text-[11px] text-muted-foreground">
                  {row.feedbackPending ? 'Feedback pending' : 'Up to date'}
                </Badge>
              </div>

              <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-3 text-xs">
                <div className="rounded-lg border border-border bg-sidebar p-2">
                  Completion
                  <p className="text-foreground">{row.completion}%</p>
                  <Progress value={row.completion} className="mt-1 h-1.5" />
                </div>
                <div className="rounded-lg border border-border bg-sidebar p-2">
                  Quality
                  <p className="text-foreground">{row.quality}/100</p>
                  <Progress value={row.quality} className="mt-1 h-1.5" />
                </div>
                <div className="rounded-lg border border-border bg-sidebar p-2">
                  Cycle time
                  <p className="text-foreground">{row.cycleDays} days</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="rounded-2xl border-border bg-sidebar">
        <CardContent className="flex flex-wrap items-center justify-between gap-2 p-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><LuFolderKanban className="h-4 w-4" /> Pipeline monitoring</div>
          <div className="flex items-center gap-2"><LuTrendingUp className="h-4 w-4" /> Quality trends</div>
          <div>Use this page to drive project completion and review velocity.</div>
        </CardContent>
      </Card>
    </div>
  );
}
