import { useEffect, useMemo, useState } from 'react';
import { LuTriangleAlert } from 'react-icons/lu';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Card, CardContent } from '../../../components/ui/card';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export default function InstructorLiveActivityPage() {
  const { metrics, instructorStudents } = useInstructorData();
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((value) => value + 1), 6000);
    return () => window.clearInterval(id);
  }, []);

  const liveAssignments = ['Module 5: Async Patterns', 'Project Debug Sprint', 'Database Query Drills', 'Peer Review Tasks'];
  const liveErrors = ['Unhandled promise rejection', 'SQL syntax mismatch', 'State update loop', 'Type guard missing'];

  const liveSessions = useMemo(() => {
    return instructorStudents.slice(0, 8).map((student, index) => {
      const progress = calculateProgressPercentage(student.progress);

      return {
        id: student.id,
        studentName: student.fullName,
        avatarUrl: student.avatarUrl,
        assignment: liveAssignments[index % liveAssignments.length],
        lastError: liveErrors[(index + tick) % liveErrors.length],
        status:
          index % 4 === 0 || student.riskLevel === 'at-risk'
            ? 'stuck'
            : index % 3 === 0
              ? 'coding'
              : index % 2 === 0
                ? 'reviewing'
                : 'active',
        progress,
      };
    });
  }, [instructorStudents, tick]);

  const onlineNow = Math.max(1, clamp(Math.round(metrics.totalStudents * 0.7) + (tick % 3) - 1, 1, metrics.totalStudents));
  const codingNow = Math.max(1, clamp(Math.round(onlineNow * 0.68), 1, onlineNow));
  const stuckNow = Math.max(1, liveSessions.filter((session) => session.status === 'stuck').length);

  const notifications = [
    `${stuckNow} students currently stuck on active tasks`,
    `${Math.max(1, Math.round(codingNow * 0.35))} students have repeated runtime errors`,
    `${Math.max(1, Math.round(onlineNow * 0.2))} students have been idle for 20+ minutes`,
  ];

  const currentFeed = liveSessions.length > 0 ? liveSessions[tick % liveSessions.length] : null;

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Live Activity Monitor</p>
          <h1 className="heading-font text-2xl sm:text-3xl">Real-Time Class Radar</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Monitor student activity in real time and intervene before learners disengage.
          </p>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Online</p>
              <p className="mt-1 text-base text-white">{onlineNow}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Coding</p>
              <p className="mt-1 text-base text-white">{codingNow}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5">
              <p className="text-white/70">Stuck</p>
              <p className="mt-1 text-base text-white">{stuckNow}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Live Student Sessions</h2>
              <p className="text-xs text-muted-foreground">Current assignment + most recent error signal</p>
            </div>

            <div className="space-y-2 p-3">
              {liveSessions.map((session) => (
                <div key={session.id} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                      <Avatar className="h-8 w-8 border border-border">
                        <AvatarImage src={session.avatarUrl} alt={session.studentName} />
                        <AvatarFallback>{session.studentName[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <p className="truncate text-sm text-foreground">{session.studentName}</p>
                        <p className="truncate text-muted-foreground">{session.assignment}</p>
                      </div>
                    </div>

                    <Badge
                      className={`border text-[11px] ${
                        session.status === 'stuck'
                          ? 'border-rose-500/30 bg-rose-500/10 text-rose-700'
                          : session.status === 'coding'
                            ? 'border-blue-500/30 bg-blue-500/10 text-blue-700'
                            : 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700'
                      }`}
                    >
                      {session.status}
                    </Badge>
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-2">
                    <p className="text-muted-foreground">Last error: {session.lastError}</p>
                    <span className="text-foreground">{session.progress}% progress</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="border-b border-border px-4 py-3">
                <h2 className="heading-font text-lg text-foreground">Current Focus</h2>
              </div>

              <div className="p-3 text-sm">
                {currentFeed ? (
                  <div className="rounded-xl border border-border bg-sidebar p-3">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage src={currentFeed.avatarUrl} alt={currentFeed.studentName} />
                        <AvatarFallback>{currentFeed.studentName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-foreground">{currentFeed.studentName}</p>
                        <p className="text-xs text-muted-foreground">{currentFeed.assignment}</p>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-amber-700">Last error: {currentFeed.lastError}</p>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No active sessions yet.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="heading-font text-lg text-foreground">Intervention Alerts</h2>
                <LuTriangleAlert className="h-4 w-4 text-muted-foreground" />
              </div>

              <div className="space-y-2 p-3">
                {notifications.map((notification) => (
                  <div key={notification} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                    <p className="text-foreground">{notification}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
