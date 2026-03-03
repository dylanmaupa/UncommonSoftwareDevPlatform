import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  LuArrowRight,
  LuBell,
  LuBuilding2,
  LuChevronRight,
  LuDownload,
  LuMessageSquare,
  LuSearch,
  LuSparkles,
  LuTarget,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import DataTable, { type DataTableColumn } from '../components/shared/DataTable';
import { useInstructorData } from '../hooks/useInstructorData';
import type { HubSummary } from '../types/instructor.types';

export default function HubsPage() {
  const { instructor, hubSummaries } = useInstructorData();

  const totalCapacity = useMemo(() => {
    return hubSummaries.reduce((sum, summary) => sum + summary.hub.capacity, 0);
  }, [hubSummaries]);

  const totalStudents = useMemo(() => {
    return hubSummaries.reduce((sum, summary) => sum + summary.studentCount, 0);
  }, [hubSummaries]);

  const overallLoad = totalCapacity > 0 ? Math.round((totalStudents / totalCapacity) * 100) : 0;

  const topHub = useMemo(() => {
    if (hubSummaries.length === 0) {
      return null;
    }

    return [...hubSummaries].sort((a, b) => b.averageProgress - a.averageProgress)[0];
  }, [hubSummaries]);

  const watchlistHubs = useMemo(() => {
    return [...hubSummaries].sort((a, b) => a.completionRate - b.completionRate).slice(0, 3);
  }, [hubSummaries]);

  const columns: Array<DataTableColumn<HubSummary>> = [
    {
      key: 'hub',
      header: 'Hub',
      render: (summary) => (
        <div>
          <p className="font-medium text-foreground">{summary.hub.name}</p>
          <p className="text-xs text-muted-foreground">{summary.hub.city}</p>
        </div>
      ),
    },
    {
      key: 'cohort',
      header: 'Cohort',
      render: (summary) => <span className="text-sm text-foreground">{summary.hub.cohort}</span>,
    },
    {
      key: 'load',
      header: 'Student Load',
      render: (summary) => {
        const loadPercentage = summary.hub.capacity > 0 ? Math.round((summary.studentCount / summary.hub.capacity) * 100) : 0;

        return (
          <div className="min-w-32 space-y-2">
            <p className="text-xs text-muted-foreground">
              {summary.studentCount}/{summary.hub.capacity} students
            </p>
            <Progress value={loadPercentage} className="h-2" />
          </div>
        );
      },
    },
    {
      key: 'progress',
      header: 'Avg Progress',
      render: (summary) => <span className="text-sm text-foreground">{summary.averageProgress}%</span>,
    },
    {
      key: 'completion',
      header: 'Completion',
      render: (summary) => <span className="text-sm text-foreground">{summary.completionRate}%</span>,
    },
    {
      key: 'action',
      header: 'Action',
      className: 'text-right',
      render: () => (
        <Link to="/instructor/students" className="text-sm font-medium text-primary hover:underline">
          View Students
        </Link>
      ),
    },
  ];

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_300px] xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-sidebar p-3">
            <div className="order-1 relative w-full min-w-0 sm:min-w-[220px] sm:flex-1">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                defaultValue=""
                placeholder="Search hubs, cohort, or city..."
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
                <AvatarFallback>{instructor.fullName?.[0] ?? 'I'}</AvatarFallback>
              </Avatar>
              <span className="hidden pr-2 text-sm text-foreground sm:block">{instructor.fullName}</span>
            </div>
          </div>

          <Card className="overflow-hidden rounded-2xl border-border bg-primary">
            <CardContent className="p-4 sm:p-6">
              <p className="text-xs uppercase tracking-wider text-white/80">Hub Operations</p>
              <h1 className="heading-font mt-2 max-w-2xl text-2xl leading-tight text-white sm:text-3xl">
                Track Capacity, Cohorts, and Completion Across All Instructor Hubs
              </h1>
              <p className="mt-2 text-sm text-white/80">
                Current load: {overallLoad}% ({totalStudents}/{totalCapacity} students)
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                <Link to="/instructor/students">
                  <Button className="rounded-full bg-white text-foreground hover:bg-white/90">
                    Open Students
                    <LuArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/instructor">
                  <Button variant="secondary" className="rounded-full border border-white/30 bg-white/15 text-white hover:bg-white/20">
                    Dashboard
                    <LuChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Hubs</p>
                  <p className="text-sm text-foreground">{hubSummaries.length}</p>
                </div>
                <LuBuilding2 className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Students Enrolled</p>
                  <p className="text-sm text-foreground">{totalStudents}</p>
                </div>
                <LuUsers className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Avg Completion</p>
                  <p className="text-sm text-foreground">{topHub ? `${topHub.completionRate}% best hub` : '0%'}</p>
                </div>
                <LuTrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Capacity Usage</p>
                  <p className="text-sm text-foreground">{overallLoad}% used</p>
                </div>
                <LuTarget className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-lg text-foreground heading-font">Hub Timeline</h2>
                <Link to="/instructor/students" className="text-xs text-muted-foreground hover:text-foreground">
                  View students
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
                {hubSummaries.map((summary) => {
                  const loadPercentage = summary.hub.capacity > 0 ? Math.round((summary.studentCount / summary.hub.capacity) * 100) : 0;

                  return (
                    <Card key={summary.hub.id} className="rounded-2xl border-border bg-sidebar">
                      <CardContent className="space-y-3 p-3">
                        <div className="flex items-center justify-between">
                          <p className="text-sm text-foreground">{summary.hub.name}</p>
                          <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{summary.hub.city}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{summary.hub.cohort}</p>
                        <div className="space-y-2 text-xs text-muted-foreground">
                          <p>
                            Student Load: <span className="text-foreground">{summary.studentCount}/{summary.hub.capacity}</span>
                          </p>
                          <Progress value={loadPercentage} className="h-2" />
                          <p>
                            Average Progress: <span className="text-foreground">{summary.averageProgress}%</span>
                          </p>
                          <p>
                            Completion: <span className="text-foreground">{summary.completionRate}%</span>
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-lg text-foreground heading-font">Hub Directory</h2>
                <span className="text-xs text-muted-foreground">Operational table view</span>
              </div>
              <div className="p-4">
                <DataTable
                  data={hubSummaries}
                  columns={columns}
                  keyExtractor={(summary) => summary.hub.id}
                  caption="Capacity, progress, and completion across assigned hubs"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font">Hub Insights</h3>
                <LuBuilding2 className="h-4 w-4 text-muted-foreground" />
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
                  <span>Load</span>
                  <span>Progress</span>
                  <span>Completion</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Hubs: {hubSummaries.length}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Students: {totalStudents}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Capacity: {totalCapacity}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Load: {overallLoad}%</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font">Watchlist Hubs</h3>
                <LuTrendingUp className="h-4 w-4 text-muted-foreground" />
              </div>

              {watchlistHubs.map((summary) => (
                <div key={summary.hub.id} className="rounded-xl bg-sidebar p-3">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{summary.hub.name}</p>
                    <Badge className="border border-border bg-card text-[11px] text-muted-foreground">
                      {summary.completionRate}%
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">Needs completion push this week.</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font">Quick Actions</h3>
                <LuTarget className="h-4 w-4 text-muted-foreground" />
              </div>

              <Link to="/instructor/students" className="block">
                <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm text-foreground">
                  View All Students
                  <LuChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/instructor" className="block">
                <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm text-foreground">
                  Return to Dashboard
                  <LuChevronRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button
                variant="ghost"
                onClick={() => window.print()}
                className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm text-foreground"
              >
                Export Hub Snapshot
                <LuDownload className="h-4 w-4" />
              </Button>
              <Link to="/instructor/students" className="block">
                <Button variant="ghost" className="h-10 w-full justify-between rounded-xl border border-border bg-sidebar text-sm text-foreground">
                  Message Hub Learners
                  <LuMessageSquare className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
