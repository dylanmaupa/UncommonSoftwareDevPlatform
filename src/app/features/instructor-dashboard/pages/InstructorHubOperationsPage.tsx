import { LuBookOpen, LuRocket, LuSend, LuUserCheck, LuUsers } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { useInstructorData } from '../hooks/useInstructorData';

export default function InstructorHubOperationsPage() {
  const { instructorHub, instructorStudents } = useInstructorData();

  const capacity = instructorHub?.capacity ?? 0;
  const enrolled = instructorStudents.length;
  const load = capacity > 0 ? Math.round((enrolled / capacity) * 100) : 0;

  const operations = [
    { id: 'groups', icon: LuUsers, title: 'Class Groups', detail: 'Manage squads and peer pods.' },
    { id: 'onboarding', icon: LuRocket, title: 'Onboarding', detail: 'Track setup and orientation completion.' },
    { id: 'invites', icon: LuSend, title: 'Invites', detail: 'Send learner and mentor invites.' },
    { id: 'attendance', icon: LuUserCheck, title: 'Attendance', detail: 'Run daily check-ins and alerts.' },
    { id: 'resources', icon: LuBookOpen, title: 'Resources', detail: 'Publish docs and support materials.' },
  ];

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Hub Operations</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Operations</h1>
          <p className="max-w-2xl text-sm text-white/80">Operational controls for attendance, onboarding, invites, and resources.</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Capacity</p><p className="mt-1 text-base text-white">{capacity}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Enrolled</p><p className="mt-1 text-base text-white">{enrolled}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Hub Load</p><p className="mt-1 text-base text-white">{load}%</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-5">
        {operations.map((op) => {
          const Icon = op.icon;
          return (
            <Card key={op.id} className="rounded-2xl border-border bg-card">
              <CardContent className="p-4">
                <div className="w-fit rounded-xl border border-border bg-sidebar p-2 text-muted-foreground"><Icon className="h-4 w-4" /></div>
                <p className="mt-3 text-sm text-foreground">{op.title}</p>
                <p className="mt-1 text-xs text-muted-foreground">{op.detail}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="rounded-2xl border-border">
        <CardContent className="p-4 text-xs text-muted-foreground flex items-center justify-between">
          <span>Scope: single assigned hub.</span>
          <Badge className="border border-border bg-sidebar text-[11px] text-muted-foreground">Hub Ops</Badge>
        </CardContent>
      </Card>
    </div>
  );
}
