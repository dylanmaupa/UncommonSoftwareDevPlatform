import { useMemo } from 'react';
import { Link } from 'react-router';
import {
  LuArrowRight,
  LuBell,
  LuBookOpen,
  LuClock3,
  LuFolderKanban,
  LuMessageSquare,
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

type HubRouteCard = {
  id: string;
  title: string;
  description: string;
  path: string;
  cta: string;
  metric: string;
  icon: React.ComponentType<{ className?: string }>;
};

export default function InstructorDashboardPage() {
  const { instructor, instructorStudents, metrics } = useInstructorData();

  const activeStudents = useMemo(() => {
    return instructorStudents.filter((student) => {
      const progress = calculateProgressPercentage(student.progress);
      return progress >= 50 && student.riskLevel !== 'at-risk';
    }).length;
  }, [instructorStudents]);

  const weeklyProgressRate = useMemo(() => {
    if (instructorStudents.length === 0) return 0;

    const averageProgress =
      instructorStudents.reduce((sum, student) => sum + calculateProgressPercentage(student.progress), 0) /
      instructorStudents.length;

    return Math.round((averageProgress / 100) * 76 + 10);
  }, [instructorStudents]);

  const averageCompletionHours = useMemo(() => {
    if (instructorStudents.length === 0) return 0;

    const total = instructorStudents.reduce((sum, student) => {
      const progress = calculateProgressPercentage(student.progress);
      const effort = 5 + (100 - progress) / 20 + (student.riskLevel === 'at-risk' ? 2.5 : 0.8);
      return sum + effort;
    }, 0);

    return Number((total / instructorStudents.length).toFixed(1));
  }, [instructorStudents]);

  const projectsThisWeek = useMemo(() => {
    return instructorStudents.reduce((sum, student) => {
      const completion = calculateProjectPercentage(student.progress);
      return sum + Math.max(0, Math.round(completion / 40) - (student.riskLevel === 'at-risk' ? 1 : 0));
    }, 0);
  }, [instructorStudents]);

  const seenCount = Math.max(1, Math.round(metrics.totalStudents * 0.82));
  const unseenCount = Math.max(0, metrics.totalStudents - seenCount);
  const announcementEngagement = metrics.totalStudents > 0 ? Math.round((seenCount / metrics.totalStudents) * 100) : 0;

  const routeCards: HubRouteCard[] = [
    {
      id: 'students',
      title: 'Student Tracker',
      description: 'Heat maps, mastery bars, risk flags, and intervention actions.',
      path: '/instructor/students',
      cta: 'Open Students',
      metric: `${activeStudents} active now`,
      icon: LuUsers,
    },
    {
      id: 'exercises',
      title: 'Exercise Manager',
      description: 'Create tasks and use AI-style suggestions from weak skills and incomplete modules.',
      path: '/instructor/exercises',
      cta: 'Open Exercises',
      metric: `${averageCompletionHours}h avg completion`,
      icon: LuBookOpen,
    },
    {
      id: 'projects',
      title: 'Project Insights',
      description: 'Track quality, peer review status, completion speed, and concept struggles.',
      path: '/instructor/projects',
      cta: 'Open Projects',
      metric: `${projectsThisWeek} completed this week`,
      icon: LuFolderKanban,
    },
    {
      id: 'announcements',
      title: 'Announcements Center',
      description: 'Publish text/image/video updates, polls, and monitor engagement stats.',
      path: '/instructor/announcements',
      cta: 'Open Announcements',
      metric: `${announcementEngagement}% seen`,
      icon: LuMessageSquare,
    },
    {
      id: 'live',
      title: 'Live Activity Monitor',
      description: 'See who is online, coding, stuck, and what error happened last.',
      path: '/instructor/live-activity',
      cta: 'Open Live Monitor',
      metric: `${Math.max(1, Math.round(activeStudents * 0.65))} coding now`,
      icon: LuTarget,
    },
    {
      id: 'controls',
      title: 'Hub Controls',
      description: 'Manage class groups, onboarding, invites, attendance, and resource library.',
      path: '/instructor/hub-controls',
      cta: 'Open Controls',
      metric: `${metrics.totalHubs} hubs managed`,
      icon: LuBell,
    },
  ];

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-4 p-4 sm:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs uppercase tracking-[0.2em] text-white/75">Instructor Hub</p>
              <h1 className="heading-font mt-2 text-2xl sm:text-3xl">Instructor Home</h1>
              <p className="mt-2 max-w-2xl text-sm text-white/80">
                The dashboard is now split into focused pages so each workflow has dedicated space.
              </p>
            </div>

            <div className="ml-auto flex items-center gap-2 rounded-full border border-white/35 bg-white/15 px-2 py-1.5">
              <Avatar className="h-9 w-9 border border-white/50">
                <AvatarImage src={instructorStudents[0]?.avatarUrl ?? ''} alt={instructor.fullName} />
                <AvatarFallback>{instructor.fullName?.[0] ?? 'I'}</AvatarFallback>
              </Avatar>
              <div className="pr-2">
                <p className="text-sm text-white">{instructor.fullName}</p>
                <p className="text-[11px] text-white/75">Instructor</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
            <div className="rounded-xl bg-white/15 p-2.5 text-xs">
              <p className="text-white/70">Active Students</p>
              <p className="mt-1 text-base text-white">{activeStudents}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5 text-xs">
              <p className="text-white/70">Weekly Progress</p>
              <p className="mt-1 text-base text-white">{weeklyProgressRate}%</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5 text-xs">
              <p className="text-white/70">Avg Completion</p>
              <p className="mt-1 text-base text-white">{averageCompletionHours}h</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5 text-xs">
              <p className="text-white/70">Announcements</p>
              <p className="mt-1 text-base text-white">{seenCount}/{metrics.totalStudents} seen</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5 text-xs">
              <p className="text-white/70">Projects This Week</p>
              <p className="mt-1 text-base text-white">{projectsThisWeek}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {routeCards.map((card) => {
          const Icon = card.icon;

          return (
            <Card key={card.id} className="rounded-2xl border-border">
              <CardContent className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="heading-font text-lg text-foreground">{card.title}</h2>
                    <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
                  </div>
                  <div className="rounded-xl border border-border bg-sidebar p-2 text-muted-foreground">
                    <Icon className="h-4 w-4" />
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-primary">{card.metric}</span>
                  <Badge className="border border-border bg-sidebar text-[11px] text-muted-foreground">Focused page</Badge>
                </div>

                <Link to={card.path}>
                  <Button className="h-9 w-full justify-between rounded-xl">
                    {card.cta}
                    <LuArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border-border bg-sidebar">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm text-muted-foreground">
          <p>
            Announcement engagement: <span className="text-foreground">{announcementEngagement}% seen</span>.
            Unseen learners: <span className="text-foreground">{unseenCount}</span>.
          </p>
          <div className="inline-flex items-center gap-2 text-primary">
            <LuTrendingUp className="h-4 w-4" />
            <span>Workflow split complete: use the cards above</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
