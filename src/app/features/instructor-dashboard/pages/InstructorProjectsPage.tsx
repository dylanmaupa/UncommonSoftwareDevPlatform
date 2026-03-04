import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { LuDownload, LuFolderKanban } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { calculateProgressPercentage, calculateProjectPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function InstructorProjectsPage() {
  const { instructorStudents, instructorHub } = useInstructorData();

  const hubName = instructorHub?.name ?? 'Assigned Hub';
  const projectNames = ['Portfolio API', 'Inventory Dashboard', 'Peer Review Engine', 'Task Automation CLI', 'Hub Attendance Tracker'];
  const steps = ['Scoping', 'API Integration', 'State Management', 'Testing', 'Deployment'];
  const concepts = ['Async Patterns', 'Relational Joins', 'Error Handling', 'Type Safety', 'State Sync'];

  const projectRows = useMemo(() => {
    return instructorStudents.map((student, index) => {
      const progress = calculateProgressPercentage(student.progress);
      const projectProgress = calculateProjectPercentage(student.progress);
      const completion = clamp(projectProgress + (index % 3) * 7 - 4, 18, 100);
      const quality = clamp(Math.round(progress * 0.78 + (index % 4) * 5), 42, 98);
      const peer = completion >= 78 ? 'Complete' : index % 2 ? 'Pending' : 'In Review';
      const feedbackPending = completion < 85 || student.riskLevel === 'at-risk';
      const avgDays = clamp(Math.round(25 - completion / 7 + (index % 3)), 8, 34);

      return {
        id: student.id,
        studentName: student.fullName,
        hubName,
        projectName: projectNames[index % projectNames.length],
        completion,
        quality,
        peer,
        feedbackPending,
        step: steps[(index + Math.round(progress / 12)) % steps.length],
        concept: concepts[(index + (feedbackPending ? 2 : 0)) % concepts.length],
        avgDays,
      };
    });
  }, [hubName, instructorStudents]);

  const challengingStepData = useMemo(() => {
    return steps.map((step) => ({
      step,
      students: projectRows.filter((project) => project.step === step).length,
    }));
  }, [projectRows]);

  const conceptStruggleData = useMemo(() => {
    return concepts
      .map((concept) => ({
        concept,
        students: projectRows.filter((project) => project.concept === concept).length,
      }))
      .sort((a, b) => b.students - a.students);
  }, [projectRows]);

  const successByHub = useMemo(() => {
    const grouped = projectRows.reduce<Record<string, { quality: number; completion: number; count: number }>>((acc, row) => {
      if (!acc[row.hubName]) {
        acc[row.hubName] = { quality: 0, completion: 0, count: 0 };
      }

      acc[row.hubName].quality += row.quality;
      acc[row.hubName].completion += row.completion;
      acc[row.hubName].count += 1;
      return acc;
    }, {});

    return Object.entries(grouped).map(([name, value]) => ({
      hubName: name,
      quality: Math.round(value.quality / value.count),
      completion: Math.round(value.completion / value.count),
    }));
  }, [projectRows]);

  const averagePeriod = useMemo(() => {
    if (projectRows.length === 0) return 0;
    return Math.round(projectRows.reduce((sum, row) => sum + row.avgDays, 0) / projectRows.length);
  }, [projectRows]);

  const exportSnapshot = () => {
    const header = ['Student', 'Project', 'Completion (%)', 'Quality', 'Peer Review', 'Feedback Pending'];
    const rows = projectRows.map((row) => [
      row.studentName,
      row.projectName,
      String(row.completion),
      String(row.quality),
      row.peer,
      row.feedbackPending ? 'Yes' : 'No',
    ]);

    const csvContent = [header, ...rows]
      .map((row) => row.map((value) => `"${value.replaceAll('"', '""')}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'instructor-project-insights.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Project Insights</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{hubName} Project Dashboard</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Track project completion, quality, peer review status, and identify concept-level friction for your assigned hub.
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Projects</p><p className="mt-1 text-base text-white">{projectRows.length}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Completion Period</p><p className="mt-1 text-base text-white">{averagePeriod} days</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Feedback Pending</p><p className="mt-1 text-base text-white">{projectRows.filter((row) => row.feedbackPending).length}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border">
        <CardContent className="p-0">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
            <div>
              <h2 className="heading-font text-lg text-foreground">Project Pipeline</h2>
              <p className="text-xs text-muted-foreground">Completion %, quality rating, peer review, and feedback queue</p>
            </div>
            <Button size="sm" variant="ghost" className="h-8 rounded-lg border border-border bg-sidebar" onClick={exportSnapshot}>
              <LuDownload className="h-3.5 w-3.5" />
              Export CSV
            </Button>
          </div>

          <div className="space-y-2 p-3">
            {projectRows.map((project) => (
              <div key={project.id} className="rounded-xl border border-border bg-sidebar p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm text-foreground">{project.projectName}</p>
                    <p className="text-xs text-muted-foreground">{project.studentName} • {project.hubName}</p>
                  </div>
                  <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{project.peer}</Badge>
                </div>

                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                  <div>
                    Completion
                    <p className="text-sm text-foreground">{project.completion}%</p>
                  </div>
                  <div>
                    Quality
                    <p className="text-sm text-foreground">{project.quality}/100</p>
                  </div>
                  <div>
                    Avg period
                    <p className="text-sm text-foreground">{project.avgDays} days</p>
                  </div>
                  <div>
                    Feedback
                    <p className={project.feedbackPending ? 'text-amber-700' : 'text-emerald-700'}>
                      {project.feedbackPending ? 'Pending' : 'Up to date'}
                    </p>
                  </div>
                </div>

                <Progress value={project.completion} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-border xl:col-span-1">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="heading-font text-base text-foreground">Most Challenging Step</h3>
            </div>
            <div className="h-64 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={challengingStepData} margin={{ top: 8, right: 8, left: -16, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="step" tickLine={false} axisLine={false} className="fill-muted-foreground text-[10px]" />
                  <YAxis tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                  <Tooltip
                    cursor={{ fill: 'hsl(var(--secondary))' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }}
                  />
                  <Bar dataKey="students" fill="#2563eb" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border xl:col-span-1">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="heading-font text-base text-foreground">Success in Your Hub</h3>
            </div>
            <div className="h-64 p-3">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={successByHub} margin={{ top: 8, right: 8, left: -16, bottom: 6 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="hubName" tickLine={false} axisLine={false} className="fill-muted-foreground text-[10px]" />
                  <YAxis domain={[0, 100]} tickLine={false} axisLine={false} className="fill-muted-foreground text-xs" />
                  <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid hsl(var(--border))', background: 'hsl(var(--card))' }} />
                  <Line type="monotone" dataKey="quality" stroke="#2563eb" strokeWidth={2} dot={{ r: 2 }} />
                  <Line type="monotone" dataKey="completion" stroke="#0ea5e9" strokeWidth={2} dot={{ r: 2 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border xl:col-span-1">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h3 className="heading-font text-base text-foreground">Concept Struggle Clusters</h3>
            </div>
            <div className="space-y-2 p-3">
              {conceptStruggleData.map((item) => (
                <div key={item.concept} className="rounded-xl border border-border bg-sidebar p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{item.concept}</span>
                    <span className="text-foreground">{item.students} students</span>
                  </div>
                  <Progress value={Math.round((item.students / Math.max(1, projectRows.length)) * 100)} className="mt-1 h-1.5" />
                </div>
              ))}
              <div className="rounded-xl border border-border bg-sidebar p-2 text-xs text-muted-foreground">
                <LuFolderKanban className="mr-1 inline-block h-3.5 w-3.5 text-primary" />
                Average completion period: <span className="text-foreground">{averagePeriod} days</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
