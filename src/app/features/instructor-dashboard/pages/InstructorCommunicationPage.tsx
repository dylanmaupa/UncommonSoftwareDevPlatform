import { useMemo } from 'react';
import { LuMessageSquare, LuSend } from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { useInstructorData } from '../hooks/useInstructorData';

export default function InstructorCommunicationPage() {
  const { instructorHub, instructorStudents } = useInstructorData();

  const seenRate = Math.max(55, 90 - Math.round(instructorStudents.length * 0.5));
  const unreadThreads = Math.max(1, Math.round(instructorStudents.length * 0.35));

  const feed = useMemo(() => {
    return [
      { id: 'f1', title: 'Weekly Sprint Priorities', type: 'Text', seen: seenRate, replies: 18 },
      { id: 'f2', title: 'API Challenge Clarification', type: 'Video', seen: seenRate - 8, replies: 11 },
      { id: 'f3', title: 'Friday Office Hours Poll', type: 'Poll', seen: seenRate - 4, replies: 23 },
    ];
  }, [seenRate]);

  const threads = useMemo(() => {
    return instructorStudents.slice(0, 4).map((student, index) => ({
      id: student.id,
      name: student.fullName,
      issue: ['Timeout errors in sandbox', 'Project scope confusion', 'SQL join errors', 'Need assignment extension'][index % 4],
      repeats: 1 + (index % 4),
      lastActive: `${6 + index * 7} min ago`,
    }));
  }, [instructorStudents]);

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Communication</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Messaging Hub</h1>
          <p className="max-w-2xl text-sm text-white/80">Announcements, response rates, and inbox threads in one dedicated page.</p>

          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Seen Rate</p><p className="mt-1 text-base text-white">{seenRate}%</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Unread Threads</p><p className="mt-1 text-base text-white">{unreadThreads}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Active Students</p><p className="mt-1 text-base text-white">{instructorStudents.length}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Announcement Performance</h2>
              <p className="text-xs text-muted-foreground">Seen and reply engagement per update</p>
            </div>
            <div className="space-y-2 p-3">
              {feed.map((item) => (
                <div key={item.id} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{item.title}</p>
                    <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{item.type}</Badge>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div className="rounded-lg bg-card p-2">Seen<p className="text-foreground">{item.seen}%</p></div>
                    <div className="rounded-lg bg-card p-2">Replies<p className="text-foreground">{item.replies}</p></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Inbox Threads</h2>
              <p className="text-xs text-muted-foreground">Repeated issues and response queue</p>
            </div>
            <div className="space-y-2 p-3">
              {threads.map((thread) => (
                <div key={thread.id} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm text-foreground">{thread.name}</p>
                    <p className="text-muted-foreground">{thread.lastActive}</p>
                  </div>
                  <p className="mt-1 text-muted-foreground">{thread.issue}</p>
                  <div className="mt-2 flex items-center justify-between">
                    <Badge className="border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-700">
                      {thread.repeats} repeats
                    </Badge>
                    <Button size="sm" className="h-8 rounded-lg">
                      <LuSend className="h-3.5 w-3.5" />
                      Reply
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border bg-sidebar">
        <CardContent className="flex items-center justify-between p-4 text-xs text-muted-foreground">
          <span>Use this page for announcements and message triage.</span>
          <LuMessageSquare className="h-4 w-4" />
        </CardContent>
      </Card>
    </div>
  );
}
