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
  iconBadgeClassName: string;
  arrowClassName: string;
  glowClassName: string;
  delayMs: number;
};

function StatCard({
  label,
  href,
  icon: Icon,
  iconBadgeClassName,
  arrowClassName,
  glowClassName,
  delayMs,
}: StatCardProps) {
  return (
    <Link to={href} className="group block dashboard-rise" style={{ animationDelay: `${delayMs}ms` }}>
      <Card className="relative h-full overflow-hidden rounded-[30px] border border-white/70 bg-gradient-to-br from-white via-white to-[#eef3ff] shadow-[0_16px_44px_-28px_rgba(7,71,161,0.75)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_48px_-26px_rgba(7,71,161,0.95)]">
        <div className={`pointer-events-none absolute -right-12 -top-10 h-32 w-32 rounded-full blur-2xl ${glowClassName} dashboard-pulse`} />
        <CardContent className="relative space-y-6 p-6">
          <div className={`flex h-12 w-12 items-center justify-center rounded-2xl border border-white/60 shadow-sm ${iconBadgeClassName}`}>
            <Icon className="h-6 w-6" />
          </div>

          <div>
            <p className="text-[3rem] font-semibold leading-none text-foreground">0</p>
            <p className="mt-4 flex items-center gap-1 text-[1.75rem] text-muted-foreground">
              {label}
              <LuArrowUpRight className={`h-4 w-4 ${arrowClassName}`} />
            </p>
          </div>

          <Icon className="pointer-events-none absolute -bottom-4 right-5 h-24 w-24 text-muted-foreground/[0.06] transition-transform duration-300 group-hover:scale-105" />
        </CardContent>
      </Card>
    </Link>
  );
}

export default function InstructorDashboardPage() {
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('active');

  return (
    <div className="relative space-y-4 p-3 sm:p-4 lg:p-6">
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="dashboard-float absolute -left-24 -top-20 h-72 w-72 rounded-full bg-sky-300/20 blur-3xl" />
        <div className="dashboard-float absolute -right-24 top-28 h-72 w-72 rounded-full bg-violet-300/20 blur-3xl" style={{ animationDelay: '1.8s' }} />
        <div className="dashboard-float absolute left-1/3 top-[52%] h-64 w-64 rounded-full bg-emerald-300/15 blur-3xl" style={{ animationDelay: '3.2s' }} />
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
        <StatCard
          label="Active Classes"
          href="/instructor/hub"
          icon={LuUsers}
          iconBadgeClassName="bg-primary/10 text-primary"
          arrowClassName="text-primary"
          glowClassName="bg-primary/25"
          delayMs={80}
        />

        <StatCard
          label="Total Exams"
          href="/instructor/exercises"
          icon={LuBookOpen}
          iconBadgeClassName="bg-violet-500/10 text-violet-600"
          arrowClassName="text-violet-600"
          glowClassName="bg-violet-400/30"
          delayMs={180}
        />

        <StatCard
          label="Recent Submissions (24h)"
          href="/instructor/projects"
          icon={LuTrendingUp}
          iconBadgeClassName="bg-emerald-500/10 text-emerald-600"
          arrowClassName="text-emerald-600"
          glowClassName="bg-emerald-400/30"
          delayMs={280}
        />
      </div>

      <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        <Card
          className="dashboard-rise rounded-[30px] border border-white/70 bg-gradient-to-br from-white to-[#f7f9ff] shadow-[0_16px_44px_-30px_rgba(7,71,161,0.7)]"
          style={{ animationDelay: '340ms' }}
        >
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-primary/10 text-primary shadow-sm">
                  <LuUsers className="h-5 w-5" />
                </div>
                <h2 className="heading-font text-3xl text-foreground">Your Classes</h2>
              </div>

              <Link to="/instructor/hub-controls">
                <Button className="h-10 rounded-xl bg-gradient-to-r from-primary to-[#456dff] px-4 shadow-[0_10px_20px_-12px_rgba(7,71,161,0.85)] hover:from-primary hover:to-[#315cff]">
                  <LuPlus className="h-4 w-4" />
                  Create
                </Button>
              </Link>
            </div>

            <div className="p-5">
              <div className="relative rounded-2xl border border-dashed border-[#cfd9ec] bg-gradient-to-br from-[#f8fbff] via-white to-[#f3f6ff] px-6 py-12 text-center shadow-inner">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white text-muted-foreground shadow-sm">
                  <LuUsers className="h-6 w-6" />
                </div>
                <p className="mt-4 text-3xl text-foreground">No classes yet</p>
                <p className="mt-2 text-lg text-muted-foreground">Create your first class to get started.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card
          className="dashboard-rise rounded-[30px] border border-white/70 bg-gradient-to-br from-white to-[#f7f9ff] shadow-[0_16px_44px_-30px_rgba(7,71,161,0.7)]"
          style={{ animationDelay: '420ms' }}
        >
          <CardContent className="p-0">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/70 bg-primary/10 text-primary shadow-sm">
                  <LuClock3 className="h-5 w-5" />
                </div>
                <h2 className="heading-font text-3xl text-foreground">Timeline</h2>
              </div>

              <div className="flex items-center gap-3">
                <div className="inline-flex rounded-xl border border-white/70 bg-sidebar/80 p-1 shadow-inner">
                  <button
                    type="button"
                    onClick={() => setTimelineFilter('active')}
                    className={`rounded-lg px-4 py-1.5 text-sm transition-colors ${
                      timelineFilter === 'active'
                        ? 'bg-white text-foreground shadow-[0_6px_14px_-10px_rgba(7,71,161,0.7)]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Active
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimelineFilter('closed')}
                    className={`rounded-lg px-4 py-1.5 text-sm transition-colors ${
                      timelineFilter === 'closed'
                        ? 'bg-white text-foreground shadow-[0_6px_14px_-10px_rgba(7,71,161,0.7)]'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Closed
                  </button>
                </div>

                <Link to="/instructor/exercises">
                  <Button variant="secondary" className="h-10 rounded-xl border border-white/70 bg-white/90 shadow-sm hover:bg-white">
                    <LuPlus className="h-4 w-4 text-primary" />
                    <span className="text-primary">New</span>
                  </Button>
                </Link>
              </div>
            </div>

            <div className="p-5">
              <div className="relative rounded-2xl border border-dashed border-[#cfd9ec] bg-gradient-to-br from-[#f8fbff] via-white to-[#f3f6ff] px-6 py-12 text-center shadow-inner">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/80 bg-white text-muted-foreground shadow-sm">
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
        className="fixed bottom-4 right-4 z-20 inline-flex items-center gap-3 rounded-full border border-white/80 bg-white/90 px-4 py-3 shadow-[0_18px_36px_-20px_rgba(7,71,161,0.85)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_40px_-18px_rgba(7,71,161,0.95)]"
      >
        <span className="relative flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-70" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
        </span>
        <span className="text-3xl text-foreground">Live Activity</span>
        <span className="rounded-full border border-white/70 bg-sidebar px-2 py-0.5 text-sm text-foreground shadow-sm">0</span>
        <LuChevronUp className="h-4 w-4 text-muted-foreground" />
      </Link>
    </div>
  );
}
