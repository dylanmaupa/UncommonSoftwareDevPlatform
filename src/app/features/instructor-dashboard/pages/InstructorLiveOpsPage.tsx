import { useMemo } from 'react';
import { LuActivity, LuTriangleAlert } from 'react-icons/lu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

export default function InstructorLiveOpsPage() {
  const { instructorHub, instructorStudents } = useInstructorData();

  const sessions = useMemo(() => {
    return instructorStudents.map((student, index) => {
      const progress = calculateProgressPercentage(student.progress);
      const status =
        student.riskLevel === 'at-risk' ? 'stuck' : index % 3 === 0 ? 'debugging' : index % 2 === 0 ? 'coding' : 'active';
      return {
        id: student.id,
        name: student.fullName,
        avatarUrl: student.avatarUrl,
        task: ['Module 4 async drills', 'Project debugging', 'SQL query practice', 'Peer review'][index % 4],
        status,
        progress,
        lastError: ['Unhandled promise rejection', 'SQL syntax mismatch', 'State update loop', 'Type mismatch'][index % 4],
      };
    });
  }, [instructorStudents]);

  const online = Math.max(0, Math.round(sessions.length * 0.72));
  const stuck = sessions.filter((session) => session.status === 'stuck').length;
  const idle = Math.max(0, Math.round(sessions.length * 0.18));

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-2xl border-border bg-primary text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Live Ops</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Live Activity</h1>
          <p className="max-w-2xl text-sm text-white/80">Real-time class status for interventions while learners are active.</p>
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Online</p><p className="mt-1 text-base text-white">{online}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Stuck</p><p className="mt-1 text-base text-white">{stuck}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Idle 20+ min</p><p className="mt-1 text-base text-white">{idle}</p></div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="heading-font text-lg text-foreground">Live Sessions</h2>
              <p className="text-xs text-muted-foreground">Current tasks, progress, and error signals</p>
            </div>
            <LuActivity className="h-4 w-4 text-muted-foreground" />
          </div>

          <div className="space-y-2 p-3">
            {sessions.map((session) => (
              <div key={session.id} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <Avatar className="h-8 w-8 border border-border">
                      <AvatarImage src={session.avatarUrl} alt={session.name} />
                      <AvatarFallback>{session.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="truncate text-sm text-foreground">{session.name}</p>
                      <p className="truncate text-muted-foreground">{session.task}</p>
                    </div>
                  </div>
                  <Badge
                    className={`border text-[11px] ${
                      session.status === 'stuck'
                        ? 'border-rose-500/30 bg-rose-500/10 text-rose-700'
                        : session.status === 'debugging'
                          ? 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                          : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                    }`}
                  >
                    {session.status}
                  </Badge>
                </div>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <p className="text-muted-foreground">Last error: {session.lastError}</p>
                  <p className="text-foreground">{session.progress}%</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-2xl border-border bg-sidebar">
        <CardContent className="flex items-center justify-between p-4 text-xs text-muted-foreground">
          <span>{stuck} learners need immediate assistance.</span>
          <LuTriangleAlert className="h-4 w-4" />
        </CardContent>
      </Card>
    </div>
  );
}

