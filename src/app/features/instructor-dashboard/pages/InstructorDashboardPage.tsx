import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import {
  LuTriangleAlert,
  LuArrowRight,
  LuBell,
  LuBookOpenCheck,
  LuBuilding2,
  LuChevronRight,
  LuClock3,
  LuFolderKanban,
  LuMessageSquare,
  LuSearch,
  LuSparkles,
  LuTarget,
  LuTrendingUp,
  LuUsers,
} from 'react-icons/lu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { calculateProgressPercentage, calculateProjectPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

type TimelineFilter = 'active' | 'closed';

type TimelineItem = {
  id: string;
  title: string;
  description: string;
  status: TimelineFilter;
  path: string;
  type: string;
};

export default function InstructorDashboardPage() {
  const { instructor, instructorHub, instructorStudents } = useInstructorData();
  const [timelineFilter, setTimelineFilter] = useState<TimelineFilter>('active');
  const [searchValue, setSearchValue] = useState('');

  const activeStudentsCount = useMemo(() => {
    return instructorStudents.filter((student) => {
      const progress = calculateProgressPercentage(student.progress);
      return progress >= 50 && student.riskLevel !== 'at-risk';
    }).length;
  }, [instructorStudents]);

  const atRiskStudentsCount = useMemo(() => {
    return instructorStudents.filter((student) => student.riskLevel === 'at-risk').length;
  }, [instructorStudents]);

  const averageProgress = useMemo(() => {
    if (instructorStudents.length === 0) return 0;
    const total = instructorStudents.reduce((sum, student) => {
      return sum + calculateProgressPercentage(student.progress);
    }, 0);
    return Math.round(total / instructorStudents.length);
  }, [instructorStudents]);

  const projectCompletionRate = useMemo(() => {
    if (instructorStudents.length === 0) return 0;
    const total = instructorStudents.reduce((sum, student) => {
      return sum + calculateProjectPercentage(student.progress);
    }, 0);
    return Math.round(total / instructorStudents.length);
  }, [instructorStudents]);

  const filteredStudents = useMemo(() => {
    const query = searchValue.trim().toLowerCase();
    if (!query) return instructorStudents;

    return instructorStudents.filter((student) => {
      return student.fullName.toLowerCase().includes(query) || student.email.toLowerCase().includes(query);
    });
  }, [instructorStudents, searchValue]);

  const timelineItems = useMemo<TimelineItem[]>(() => {
    if (!instructorHub) return [];

    return [
      {
        id: 'attendance-window',
        title: 'Attendance Check-in Window',
        description: `${instructorHub.name} attendance closes at 10:00`,
        status: 'active',
        path: '/instructor/hub-controls',
        type: 'Hub',
      },
      {
        id: 'exercise-follow-up',
        title: 'Targeted Exercise Review',
        description: 'Review recent exercise responses from learners needing support',
        status: activeStudentsCount > 0 ? 'active' : 'closed',
        path: '/instructor/exercises',
        type: 'Exercises',
      },
      {
        id: 'announcement-recap',
        title: 'Weekly Announcement Recap',
        description: 'The previous weekly update cycle was completed',
        status: 'closed',
        path: '/instructor/announcements',
        type: 'Announcements',
      },
    ];
  }, [instructorHub, activeStudentsCount]);

  const visibleTimelineItems = useMemo(() => {
    return timelineItems.filter((item) => item.status === timelineFilter);
  }, [timelineItems, timelineFilter]);

  return (
    <div className="p-3 sm:p-4 lg:p-6">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_280px] xl:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-sidebar p-3">
            <div className="order-1 relative w-full min-w-0 sm:min-w-[220px] sm:flex-1">
              <LuSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Search students in your hub..."
                className="h-10 w-full rounded-full border border-border bg-card pl-9 pr-3 text-sm text-foreground outline-none"
              />
            </div>

            <div className="order-2 flex items-center gap-2">
              <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
                <Link to="/instructor/announcements" aria-label="Announcements">
                  <LuBell className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="ghost" size="icon" className="h-10 w-10 rounded-full border border-border bg-card text-muted-foreground">
                <Link to="/instructor/live-activity" aria-label="Live Activity">
                  <LuTarget className="h-4 w-4" />
                </Link>
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
              <p className="text-xs uppercase tracking-wider text-white/80">Instructor Hub</p>
              <h2 className="heading-font mt-2 max-w-lg text-2xl leading-tight text-white sm:text-3xl">
                {instructorHub ? instructorHub.name : 'No Hub Assigned'}
              </h2>
              <p className="mt-2 text-sm text-white/80">
                {instructorHub
                  ? `Manage one hub at a time. Cohort ${instructorHub.cohort} in ${instructorHub.city}.`
                  : 'Assign a hub to begin managing learners, exercises, and projects.'}
              </p>
              <Button asChild className="mt-5 rounded-full bg-white text-foreground hover:bg-white/90">
                <Link to="/instructor/hub">
                  Open Hub
                  <LuArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Active Students</p>
                  <p className="text-sm text-foreground">{activeStudentsCount}</p>
                </div>
                <LuUsers className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">Average Progress</p>
                  <p className="text-sm text-foreground">{averageProgress}%</p>
                </div>
                <LuTrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
            <Card className="rounded-2xl border-border bg-sidebar">
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="text-xs text-muted-foreground">At Risk</p>
                  <p className="text-sm text-foreground">{atRiskStudentsCount}</p>
                </div>
                <LuTriangleAlert className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
            <Card className="rounded-2xl border-border">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-lg text-foreground heading-font">Your Class</h3>
                  <Badge className="border border-border bg-sidebar text-[11px] text-muted-foreground">Single Hub</Badge>
                </div>

                <div className="space-y-3 p-4">
                  {instructorHub ? (
                    <>
                      <div className="rounded-xl bg-sidebar p-3">
                        <p className="text-sm text-foreground">{instructorHub.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          {instructorHub.city} · {instructorHub.cohort}
                        </p>
                      </div>

                      <div className="space-y-2">
                        {filteredStudents.slice(0, 3).map((student) => (
                          <div key={student.id} className="flex items-center justify-between rounded-xl bg-sidebar p-2.5">
                            <div className="min-w-0">
                              <p className="truncate text-sm text-foreground">{student.fullName}</p>
                              <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {calculateProgressPercentage(student.progress)}%
                            </span>
                          </div>
                        ))}

                        {filteredStudents.length === 0 && (
                          <p className="rounded-xl bg-sidebar p-3 text-xs text-muted-foreground">
                            No learners match your search in this hub.
                          </p>
                        )}
                      </div>

                      <Button asChild variant="ghost" className="h-9 w-full justify-between rounded-xl border border-border bg-sidebar text-foreground">
                        <Link to="/instructor/students">
                          View all students
                          <LuChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </>
                  ) : (
                    <p className="rounded-xl bg-sidebar p-3 text-sm text-muted-foreground">
                      No hub is currently assigned to this instructor profile.
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-border">
              <CardContent className="p-0">
                <div className="flex items-center justify-between border-b border-border px-4 py-3">
                  <h3 className="text-lg text-foreground heading-font">Timeline</h3>
                  <div className="inline-flex rounded-full bg-sidebar p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setTimelineFilter('active')}
                      className={`rounded-full px-3 py-1 ${
                        timelineFilter === 'active' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      onClick={() => setTimelineFilter('closed')}
                      className={`rounded-full px-3 py-1 ${
                        timelineFilter === 'closed' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'
                      }`}
                    >
                      Closed
                    </button>
                  </div>
                </div>

                <div className="space-y-2 p-4">
                  {visibleTimelineItems.length > 0 ? (
                    visibleTimelineItems.map((item) => (
                      <Link key={item.id} to={item.path} className="block rounded-xl border border-border bg-sidebar p-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm text-foreground">{item.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                          </div>
                          <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{item.type}</Badge>
                        </div>
                      </Link>
                    ))
                  ) : (
                    <div className="rounded-xl border border-dashed border-border bg-sidebar px-4 py-8 text-center">
                      <LuClock3 className="mx-auto h-5 w-5 text-muted-foreground" />
                      <p className="mt-3 text-sm text-foreground">No {timelineFilter} items</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        You do not have any {timelineFilter} hub activities right now.
                      </p>
                    </div>
                  )}

                  <Button asChild variant="ghost" className="h-9 w-full justify-between rounded-xl border border-border bg-sidebar text-foreground">
                    <Link to="/instructor/exercises">
                      Create new timeline item
                      <LuChevronRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-4 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font">Hub Overview</h3>
                <LuSparkles className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="flex flex-col items-center">
                <Avatar className="h-20 w-20 border border-border">
                  <AvatarImage src={instructorStudents[0]?.avatarUrl ?? ''} alt={instructor.fullName} />
                  <AvatarFallback>{instructor.fullName?.[0] ?? 'I'}</AvatarFallback>
                </Avatar>
                <p className="mt-3 text-base text-foreground">{instructor.fullName}</p>
                <p className="text-xs text-muted-foreground">
                  {instructorHub ? `Hub: ${instructorHub.name}` : 'Hub: Not Assigned'}
                </p>
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
                  <span>Projects</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs mt-4">
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Students: {instructorStudents.length}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Active: {activeStudentsCount}</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Progress: {averageProgress}%</div>
                <div className="rounded-xl bg-sidebar p-2 text-muted-foreground">Projects: {projectCompletionRate}%</div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base text-foreground heading-font">Quick Actions</h3>
                <LuBuilding2 className="h-4 w-4 text-muted-foreground" />
              </div>

              <Button asChild variant="ghost" className="h-9 w-full justify-between rounded-xl border border-border bg-sidebar text-foreground">
                <Link to="/instructor/students">
                  <span className="inline-flex items-center gap-2">
                    <LuUsers className="h-4 w-4 text-muted-foreground" />
                    Students
                  </span>
                  <LuChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="ghost" className="h-9 w-full justify-between rounded-xl border border-border bg-sidebar text-foreground">
                <Link to="/instructor/exercises">
                  <span className="inline-flex items-center gap-2">
                    <LuBookOpenCheck className="h-4 w-4 text-muted-foreground" />
                    Exercises
                  </span>
                  <LuChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="ghost" className="h-9 w-full justify-between rounded-xl border border-border bg-sidebar text-foreground">
                <Link to="/instructor/projects">
                  <span className="inline-flex items-center gap-2">
                    <LuFolderKanban className="h-4 w-4 text-muted-foreground" />
                    Projects
                  </span>
                  <LuChevronRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="ghost" className="h-9 w-full justify-between rounded-xl border border-border bg-sidebar text-foreground">
                <Link to="/instructor/announcements">
                  <span className="inline-flex items-center gap-2">
                    <LuMessageSquare className="h-4 w-4 text-muted-foreground" />
                    Announcements
                  </span>
                  <LuChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
