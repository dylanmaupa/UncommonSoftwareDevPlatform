import { type ComponentType, useState } from 'react';
import { Link } from 'react-router';
import {
  LuArrowUpRight,
  LuBookOpen,
  LuChevronUp,
  LuClock3,
  LuPlus,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';

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
      <Card className="relative h-full overflow-hidden rounded-3xl border-border bg-card shadow-sm">
        <CardContent className="space-y-6 p-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${iconClassName}`}>
            <Icon className="h-6 w-6" />
          </div>

          <div>
            <p className="text-5xl font-semibold leading-none text-foreground">0</p>
            <p className="mt-4 flex items-center gap-1 text-3xl text-muted-foreground">
              {label}
              <LuArrowUpRight className={`h-4 w-4 ${arrowClassName}`} />
            </p>
          </div>

          <Icon className="pointer-events-none absolute -bottom-5 right-6 h-24 w-24 text-muted-foreground/10" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function InstructorDashboardPage() {
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('active');

  return (
    <div className="relative space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
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

      <Link
        to="/instructor/live-activity"
        className="fixed bottom-4 right-4 z-20 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-3 shadow-sm"
      >
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
        <span className="text-3xl text-foreground">Live Activity</span>
        <span className="rounded-full bg-sidebar px-2 py-0.5 text-sm text-foreground">0</span>
        <LuChevronUp className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
