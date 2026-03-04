import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  LuArrowRight,
  LuBookOpen,
  LuChevronUp,
  LuClock3,
  LuPlus,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

type TimelineFilter = 'active' | 'closed';

export default function InstructorDashboardPage() {
  const { instructorHub, instructorStudents } = useInstructorData();
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('active');

  const activeClassesCount = instructorHub ? 1 : 0;
  const totalExamsCount = 0;
  const recentSubmissionsCount = 0;

  const averageProgress = useMemo(() => {
    if (instructorStudents.length === 0) return 0;
    const total = instructorStudents.reduce((sum, student) => sum + calculateProgressPercentage(student.progress), 0);
    return Math.round(total / instructorStudents.length);
  }, [instructorStudents]);

  const activeStudentsCount = useMemo(() => {
    return instructorStudents.filter((student) => {
      const progress = calculateProgressPercentage(student.progress);
      return progress >= 50 && student.riskLevel !== 'at-risk';
    }).length;
  }, [instructorStudents]);

  const timelineItems: Array<{ id: string; title: string; path: string }> = [];

  return (
    <div className="relative space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <Link to="/instructor/hub" className="block">
          <Card className="h-full rounded-3xl border-border bg-card shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <LuUsers className="h-6 w-6" />
              </div>
              <div>
                <p className="text-4xl font-semibold leading-none text-foreground">{activeClassesCount}</p>
                <p className="mt-3 flex items-center gap-1 text-lg text-muted-foreground">
                  Active Classes
                  <LuArrowRight className="h-4 w-4 text-primary" />
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/instructor/exercises" className="block">
          <Card className="h-full rounded-3xl border-border bg-card shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-600">
                <LuBookOpen className="h-6 w-6" />
              </div>
              <div>
                <p className="text-4xl font-semibold leading-none text-foreground">{totalExamsCount}</p>
                <p className="mt-3 flex items-center gap-1 text-lg text-muted-foreground">
                  Total Exams
                  <LuArrowRight className="h-4 w-4 text-violet-600" />
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link to="/instructor/projects" className="block">
          <Card className="h-full rounded-3xl border-border bg-card shadow-sm">
            <CardContent className="space-y-5 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600">
                <LuTrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-4xl font-semibold leading-none text-foreground">{recentSubmissionsCount}</p>
                <p className="mt-3 flex items-center gap-1 text-lg text-muted-foreground">
                  Recent Submissions (24h)
                  <LuArrowRight className="h-4 w-4 text-emerald-600" />
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card className="rounded-3xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LuUsers className="h-5 w-5" />
                </div>
                <h2 className="heading-font text-3xl text-foreground">Your Classes</h2>
              </div>

              <Link to="/instructor/hub-controls">
                <Button className="h-10 rounded-xl px-4">
                  <LuPlus className="h-4 w-4" />
                  Create
                </Button>
              </Link>
            </div>

            <div className="p-5">
              {instructorHub ? (
                <div className="space-y-4 rounded-2xl border border-dashed border-border bg-sidebar p-4">
                  <div className="space-y-1">
                    <p className="text-lg text-foreground">{instructorHub.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {instructorHub.city} · {instructorHub.cohort}
                    </p>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="rounded-xl bg-card p-3">
                      <p className="text-xs text-muted-foreground">Students</p>
                      <p className="mt-1 text-base text-foreground">{instructorStudents.length}</p>
                    </div>
                    <div className="rounded-xl bg-card p-3">
                      <p className="text-xs text-muted-foreground">Active</p>
                      <p className="mt-1 text-base text-foreground">{activeStudentsCount}</p>
                    </div>
                    <div className="rounded-xl bg-card p-3">
                      <p className="text-xs text-muted-foreground">Avg Progress</p>
                      <p className="mt-1 text-base text-foreground">{averageProgress}%</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Link to="/instructor/hub">
                      <Button variant="ghost" className="h-9 rounded-xl border border-border bg-card">
                        Open Hub
                      </Button>
                    </Link>
                    <Link to="/instructor/students">
                      <Button variant="ghost" className="h-9 rounded-xl border border-border bg-card">
                        View Students
                      </Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-sidebar px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card text-muted-foreground">
                    <LuUsers className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-3xl text-foreground">No classes yet</p>
                  <p className="mt-2 text-lg text-muted-foreground">Create your first class to get started.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-3xl border-border">
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <LuClock3 className="h-5 w-5" />
                </div>
                <h2 className="heading-font text-3xl text-foreground">Timeline</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-xl bg-sidebar p-1">
                  <button
                    type="button"
                    onClick={() => setTimelineFilter('active')}
                    className={`rounded-lg px-4 py-1.5 text-sm ${
                      timelineFilter === 'active' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineFilter('closed')}
                    className={`rounded-lg px-4 py-1.5 text-sm ${
                      timelineFilter === 'closed' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                    }`}
                  >
                    Closed
                  </button>
                </div>

                <Link to="/instructor/exercises">
                  <Button variant="secondary" className="h-10 rounded-xl">
                    <LuPlus className="h-4 w-4" />
                    New
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-5">
              {timelineItems.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-border bg-sidebar px-6 py-12 text-center">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card text-muted-foreground">
                    <LuClock3 className="h-6 w-6" />
                  </div>
                  <p className="mt-4 text-3xl text-foreground">
                    No {timelineFilter === 'active' ? 'active' : 'closed'} items
                  </p>
                  <p className="mt-2 text-lg text-muted-foreground">
                    {timelineFilter === 'active'
                      ? "You don't have any active exams or assignments."
                      : "You don't have any closed exams or assignments."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {timelineItems.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      className="flex items-center justify-between rounded-xl border border-border bg-sidebar p-3"
                    >
                      <p className="text-sm text-foreground">{item.title}</p>
                      <LuArrowRight className="h-4 w-4 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Link
        to="/instructor/live-activity"
        className="fixed bottom-4 right-4 z-20 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-sm"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="text-3xl text-foreground">Live Activity</span>
        <span className="rounded-full bg-sidebar px-2 py-0.5 text-sm text-foreground">{activeStudentsCount}</span>
        <LuChevronUp className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
