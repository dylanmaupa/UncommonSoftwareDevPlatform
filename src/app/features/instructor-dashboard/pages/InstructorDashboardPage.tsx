import { type ComponentType, useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  LuArrowUpRight,
  LuBell,
  LuBookOpen,
  LuChevronRight,
  LuChevronUp,
  LuClock3,
  LuEllipsis,
  LuPlus,
  LuSearch,
  LuSparkles,
  LuTarget,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

type TimelineFilter = 'active' | 'closed';

type StatCardProps = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  arrowClassName: string;
};

function StatCard({ label, href, icon: Icon, iconClassName, arrowClassName }: StatCardProps) {
  return (
    <Link to={href} className="block">
      <Card className="relative h-full overflow-hidden rounded-2xl border-border bg-card">
        <CardContent className="space-y-6 p-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}>
            <Icon className="h-6 w-6" />
          </div>

          <div>
            <p className="text-5xl font-semibold leading-none text-foreground">0</p>
            <p className="mt-4 flex items-center gap-1 text-lg text-muted-foreground">
              {label}
              <LuArrowUpRight className={`h-4 w-4 ${arrowClassName}`} />
            </p>
          </div>

          <Icon className="pointer-events-none absolute -bottom-4 right-5 h-24 w-24 text-muted-foreground/10" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function InstructorDashboardPage() {
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('active');
  const { instructor, instructorHub, instructorStudents } = useInstructorData();

  const averageProgress = useMemo(() => {
    if (instructorStudents.length === 0) return 0;
    const sum = instructorStudents.reduce((total, student) => total + calculateProgressPercentage(student.progress), 0);
    return Math.round(sum / instructorStudents.length);
  }, [instructorStudents]);

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-sidebar p-3">
            <div className="order-1 relative w-full min-w-0 sm:min-w-[220px] sm:flex-1">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                defaultValue=""
                placeholder="Search your hub..."
                className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none"
              />
            </div>
            <div className="order-2 flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
                <LuBell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
                <LuSparkles className="h-4 w-4" />
              </Button>
            </div>
            <div className="order-3 ml-auto flex items-center gap-2 rounded-full border border-border bg-card px-2 py-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={instructorStudents[0]?.avatarUrl ?? ''} alt={instructor.fullName} />
                <AvatarFallback>{instructor.fullName?.[0] ?? 'I'}</AvatarFallback>
              </Avatar>
              <span className="hidden pr-2 text-sm text-foreground sm:block">{instructor.fullName}</span>
            </div>
          </div>

          <Card className="overflow-hidden rounded-2xl border-border bg-primary">
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs uppercase tracking-wider text-white/80">Instructor Overview</p>
              <h2 className="heading-font mt-2 max-w-md text-2xl leading-tight text-white sm:text-3xl">
                Manage Your Hub with Real-Time Teaching Insights
              </h2>
              <p className="mt-2 text-sm text-white/80">
                Focus on one hub, track learner performance, and coordinate class activities in one place.
              </p>
              <Button asChild className="mt-5 rounded-full bg-white text-foreground hover:bg-white/90">
                <Link to="/instructor/hub">
                  Open Hub
                  <LuChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <StatCard
              label="Active Classes"
              href="/instructor/hub"
              icon={LuUsers}
              iconClassName="bg-primary/10 text-primary"
              arrowClassName="text-primary"
            />

            <StatCard
              label="Total Exams"
              href="/instructor/exercises"
              icon={LuBookOpen}
              iconClassName="bg-violet-500/10 text-violet-600"
              arrowClassName="text-violet-600"
            />

            <StatCard
              label="Recent Submissions (24h)"
              href="/instructor/projects"
              icon={LuTrendingUp}
              iconClassName="bg-emerald-500/10 text-emerald-600"
              arrowClassName="text-emerald-600"
            />
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <Card className="rounded-2xl border-border">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <LuUsers className="h-5 w-5" />
                    </div>
                    <h2 className="heading-font text-2xl text-foreground">Your Classes</h2>
                  </div>

                  <Link to="/instructor/hub-controls">
                    <Button className="h-10 rounded-xl px-4">
                      <LuPlus className="h-4 w-4" />
                      Create
                    </Button>
                  </Link>
                </div>

                <div className="p-5">
                  <div className="rounded-2xl border border-dashed border-border bg-sidebar px-6 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card text-muted-foreground">
                      <LuUsers className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-3xl text-foreground">No classes yet</p>
                    <p className="mt-2 text-lg text-muted-foreground">Create your first class to get started.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardContent className="p-0">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <LuClock3 className="h-5 w-5" />
                    </div>
                    <h2 className="heading-font text-2xl text-foreground">Timeline</h2>
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
                  <div className="rounded-2xl border border-dashed border-border bg-sidebar px-6 py-12 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-card text-muted-foreground">
                      <LuClock3 className="h-6 w-6" />
                    </div>
                    <p className="mt-4 text-3xl text-foreground">No {timelineFilter} items</p>
                    <p className="mt-2 text-lg text-muted-foreground">
                      {timelineFilter === 'active'
                        ? "You don't have any active exams or assignments."
                        : "You don't have any closed exams or assignments."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font">Profile Overview</h3>
                <LuEllipsis className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 border border-border">
                  <AvatarImage src={instructorStudents[0]?.avatarUrl ?? ''} alt={instructor.fullName} />
                  <AvatarFallback>{instructor.fullName?.[0] ?? 'I'}</AvatarFallback>
                </Avatar>
                <p className="mt-3 text-base text-foreground">Good Morning {instructor.fullName}</p>
                <p className="text-xs text-muted-foreground">Hub: {instructorHub?.name ?? 'Not assigned'}</p>
              </div>
              <div className="rounded-2xl bg-secondary p-3">
                <div className="mb-2 flex items-end gap-2">
                  <div className="h-8 w-8 rounded-md bg-primary/30" />
                  <div className="h-12 w-8 rounded-md bg-primary/70" />
                  <div className="h-9 w-8 rounded-md bg-primary/40" />
                  <div className="h-14 w-8 rounded-md bg-primary" />
                  <div className="h-8 w-8 rounded-md bg-primary/30" />
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Students</span>
                  <span>Progress</span>
                  <span>Hub</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Students: {instructorStudents.length}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Progress: {averageProgress}%</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Hub: {instructorHub ? '1' : '0'}</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font">Quick Access</h3>
                <LuTarget className="h-4 w-4 text-muted-foreground" />
              </div>
              <Link to="/instructor/students" className="flex items-center justify-between rounded-xl bg-sidebar p-2.5">
                <span className="text-sm text-foreground">Students</span>
                <LuChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link to="/instructor/exercises" className="flex items-center justify-between rounded-xl bg-sidebar p-2.5">
                <span className="text-sm text-foreground">Exercises</span>
                <LuChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link to="/instructor/projects" className="flex items-center justify-between rounded-xl bg-sidebar p-2.5">
                <span className="text-sm text-foreground">Projects</span>
                <LuChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
              <Link to="/instructor/announcements" className="flex items-center justify-between rounded-xl bg-sidebar p-2.5">
                <span className="text-sm text-foreground">Announcements</span>
                <LuChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      <Link
        to="/instructor/live-activity"
        className="fixed bottom-4 right-4 z-20 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-sm"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="text-lg text-foreground">Live Activity</span>
        <span className="rounded-full bg-sidebar px-2 py-0.5 text-sm text-foreground">0</span>
        <LuChevronUp className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
