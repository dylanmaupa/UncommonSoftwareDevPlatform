import { useMemo, useState } from 'react';
import { LuMessageSquare, LuSend, LuSparkles } from 'react-icons/lu';
import { toast } from 'sonner';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { useInstructorData } from '../hooks/useInstructorData';

export default function InstructorAnnouncementsPage() {
  const { metrics } = useInstructorData();
  const [format, setFormat] = useState<'Text' | 'Image' | 'Video' | 'Poll'>('Text');

  const seenCount = Math.max(1, Math.round(metrics.totalStudents * 0.82));
  const unseenCount = Math.max(0, metrics.totalStudents - seenCount);
  const seenRate = metrics.totalStudents > 0 ? Math.round((seenCount / metrics.totalStudents) * 100) : 0;

  const announcementFeed = [
    {
      id: 'announcement-1',
      type: 'Video',
      title: 'Week Sprint Kickoff + Priority Modules',
      seen: seenRate,
      clicked: 63,
      commented: 29,
      expiresIn: '18h',
    },
    {
      id: 'announcement-2',
      type: 'Poll',
      title: 'Which project should we do next: Budget Tracker or Team Planner?',
      seen: 74,
      clicked: 58,
      commented: 22,
      expiresIn: '2d',
    },
    {
      id: 'announcement-3',
      type: 'Text',
      title: 'Office hours moved to Friday 14:00 this week',
      seen: 81,
      clicked: 44,
      commented: 17,
      expiresIn: '1d',
    },
  ];

  const inboxThreads = [
    {
      id: 'thread-1',
      student: 'Peter Moyo',
      message: 'How should we structure migrations for week 4 project?',
      repeats: 4,
      lastActive: '8 min ago',
    },
    {
      id: 'thread-2',
      student: 'Ruvimbo Dube',
      message: 'Can we submit the API challenge as a team pair?',
      repeats: 2,
      lastActive: '22 min ago',
    },
    {
      id: 'thread-3',
      student: 'Blessing Ncube',
      message: 'I keep getting timeout errors in the sandbox.',
      repeats: 5,
      lastActive: '31 min ago',
    },
  ];

  const repeatedQuestions = useMemo(() => {
    return inboxThreads.reduce((sum, thread) => sum + thread.repeats, 0);
  }, [inboxThreads]);

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Communication Center</p>
          <h1 className="heading-font text-2xl sm:text-3xl">Announcements & Inbox</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Publish updates in multiple formats and monitor real engagement to improve communication quality.
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl bg-white/15 p-2.5 text-xs">
              <p className="text-white/70">Seen</p>
              <p className="mt-1 text-base text-white">{seenRate}%</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5 text-xs">
              <p className="text-white/70">Not Seen</p>
              <p className="mt-1 text-base text-white">{unseenCount}</p>
            </div>
            <div className="rounded-xl bg-white/15 p-2.5 text-xs">
              <p className="text-white/70">Repeated Questions</p>
              <p className="mt-1 text-base text-white">{repeatedQuestions}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1fr]">
        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-3">
              <h2 className="heading-font text-lg text-foreground">Create Announcement</h2>
              <p className="text-xs text-muted-foreground">Text, image, video, or poll with auto-expiry</p>
            </div>

            <div className="space-y-3 p-3">
              <div className="flex flex-wrap gap-1.5">
                {(['Text', 'Image', 'Video', 'Poll'] as const).map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setFormat(item)}
                    className={`rounded-full border px-2.5 py-1 text-[11px] ${
                      format === item
                        ? 'border-primary bg-primary text-white'
                        : 'border-border bg-sidebar text-muted-foreground'
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <textarea
                rows={4}
                defaultValue=""
                placeholder="Draft your instructor announcement..."
                className="w-full rounded-xl border border-border bg-sidebar p-3 text-sm text-foreground outline-none"
              />

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Auto-expire in 24h</span>
                <Button
                  size="sm"
                  className="h-8 rounded-lg"
                  onClick={() => toast.success(`${format} announcement published`) }
                >
                  <LuSend className="h-3.5 w-3.5" />
                  Publish
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <div>
                <h2 className="heading-font text-lg text-foreground">Recent Announcement Performance</h2>
                <p className="text-xs text-muted-foreground">Seen %, clicked %, commented %</p>
              </div>
              <Badge className="border border-blue-500/30 bg-blue-500/10 text-[11px] text-blue-700">
                <LuSparkles className="mr-1 h-3.5 w-3.5" />
                Engagement
              </Badge>
            </div>

            <div className="space-y-2 p-3">
              {announcementFeed.map((announcement) => (
                <div key={announcement.id} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-foreground">{announcement.title}</p>
                    <Badge className="border border-border bg-card text-[11px] text-muted-foreground">
                      {announcement.type}
                    </Badge>
                  </div>

                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <div>
                      <p className="text-muted-foreground">Seen</p>
                      <p className="text-foreground">{announcement.seen}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Clicked</p>
                      <p className="text-foreground">{announcement.clicked}%</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Commented</p>
                      <p className="text-foreground">{announcement.commented}%</p>
                    </div>
                  </div>

                  <p className="mt-2 text-primary">Auto-expires in {announcement.expiresIn}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-2xl border-border">
        <CardContent className="p-0">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div>
              <h2 className="heading-font text-lg text-foreground">Inbox Threads</h2>
              <p className="text-xs text-muted-foreground">Repeated question detection and FAQ prompts</p>
            </div>
            <Badge className="border border-border bg-sidebar text-[11px] text-muted-foreground">
              {inboxThreads.length} active threads
            </Badge>
          </div>

          <div className="space-y-2 p-3">
            {inboxThreads.map((thread) => (
              <div key={thread.id} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-foreground">{thread.student}</p>
                  <p className="text-muted-foreground">{thread.lastActive}</p>
                </div>
                <p className="mt-1 text-muted-foreground">{thread.message}</p>

                <div className="mt-2 flex items-center justify-between">
                  <Badge className="border border-amber-500/30 bg-amber-500/10 text-[11px] text-amber-700">
                    {thread.repeats} repeated questions • FAQ suggestion
                  </Badge>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-lg border border-border bg-card"
                    onClick={() => toast.success(`Reply opened for ${thread.student}`)}
                  >
                    <LuMessageSquare className="h-3.5 w-3.5" />
                    Reply
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
