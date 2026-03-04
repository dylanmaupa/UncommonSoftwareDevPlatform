import { LuBookOpen, LuRocket, LuSend, LuUserCheck, LuUsers } from 'react-icons/lu';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { useInstructorData } from '../hooks/useInstructorData';

export default function InstructorHubControlsPage() {
  const { metrics, instructorHub, hubSummary } = useInstructorData();

  const controls = [
    {
      id: 'groups',
      icon: LuUsers,
      title: 'Class Groups',
      description: 'Organize learners into pods and sprint squads for focused collaboration.',
      action: 'Open class groups',
    },
    {
      id: 'onboarding',
      icon: LuRocket,
      title: 'Student Onboarding',
      description: 'Track setup completion, profile readiness, and orientation milestones.',
      action: 'Open onboarding queue',
    },
    {
      id: 'invites',
      icon: LuSend,
      title: 'Invites',
      description: 'Send learner invites and mentor access links for your current hub.',
      action: 'Send invites',
    },
    {
      id: 'attendance',
      icon: LuUserCheck,
      title: 'Attendance Check-ins',
      description: 'Capture daily attendance and identify repeated absences early.',
      action: 'Run check-in',
    },
    {
      id: 'resources',
      icon: LuBookOpen,
      title: 'Resource Library',
      description: 'Publish shared docs, videos, templates, and cohort reference packs.',
      action: 'Open resources',
    },
  ];

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Hub Controls</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'My Hub'} Operations</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Instructors manage exactly one hub. These controls are scoped to your assigned hub only.
          </p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Hub</p><p className="mt-1 text-base text-white">1</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Students</p><p className="mt-1 text-base text-white">{metrics.totalStudents}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Average Progress</p><p className="mt-1 text-base text-white">{metrics.averageProgress}%</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {controls.map((control) => {
          const Icon = control.icon;

          return (
            <button
              key={control.id}
              type="button"
              onClick={() => toast.success(`${control.action} initiated`) }
              className="w-full rounded-2xl border border-border bg-card p-4 text-left transition-colors hover:bg-sidebar"
            >
              <div className="w-fit rounded-xl border border-border bg-sidebar p-2 text-muted-foreground">
                <Icon className="h-4 w-4" />
              </div>
              <p className="mt-3 text-sm text-foreground">{control.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">{control.description}</p>
            </button>
          );
        })}
      </div>

      {instructorHub ? (
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="heading-font text-lg text-foreground">Managed Hub</h2>
                <p className="text-xs text-muted-foreground">Operational snapshot for your assigned hub</p>
              </div>
              <Badge className="border border-border bg-sidebar text-[11px] text-muted-foreground">Single Hub</Badge>
            </div>

            <div className="p-3 text-xs">
              <div className="rounded-xl border border-border bg-sidebar p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-foreground">{instructorHub.name}</p>
                  <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{instructorHub.city}</Badge>
                </div>
                <p className="mt-1 text-muted-foreground">Cohort: {instructorHub.cohort}</p>
                <p className="mt-1 text-muted-foreground">Capacity: {instructorHub.capacity} learners</p>
                <p className="mt-1 text-muted-foreground">Enrolled: {hubSummary?.studentCount ?? 0} learners</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
