import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Link } from 'react-router';
import { toast } from 'sonner';
import {
  LuArrowRight,
  LuBell,
  LuBookOpen,
  LuClock3,
  LuListTodo,
  LuTarget,
  LuTriangleAlert,
  LuTrendingDown,
  LuUpload,
} from 'react-icons/lu';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Progress } from '../../../components/ui/progress';
import { Switch } from '../../../components/ui/switch';
import { Textarea } from '../../../components/ui/textarea';
import { calculateProgressPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';

const modules = [
  'Web Foundations',
  'JavaScript Basics',
  'Async and APIs',
  'Backend Services',
  'Data and SQL',
  'Testing and Deployment',
] as const;

type TopicStatus = 'planned' | 'in-progress' | 'covered';

interface UploadedResource {
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
}

interface ReminderSettings {
  enabled: boolean;
  time: string;
  focus: string;
  lastSentOn: string;
}

interface TopicItem {
  id: string;
  title: string;
  moduleName: string;
  status: TopicStatus;
  plannedDate: string;
  coveredOn?: string;
}

interface PlannerState {
  curriculum: UploadedResource | null;
  lessonPlan: UploadedResource | null;
  reminder: ReminderSettings;
  topics: TopicItem[];
}

const DEFAULT_REMINDER_TIME = '07:00';

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function createDefaultPlannerState(): PlannerState {
  return {
    curriculum: null,
    lessonPlan: null,
    reminder: {
      enabled: false,
      time: DEFAULT_REMINDER_TIME,
      focus: '',
      lastSentOn: '',
    },
    topics: [],
  };
}

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10);
}

function getPlannerStorageKey(instructorId: string) {
  return `instructor-planner:${instructorId}`;
}

function parsePlannerState(raw: string | null): PlannerState {
  if (!raw) return createDefaultPlannerState();

  try {
    const parsed = JSON.parse(raw) as Partial<PlannerState>;
    const base = createDefaultPlannerState();

    return {
      curriculum: parsed.curriculum ?? base.curriculum,
      lessonPlan: parsed.lessonPlan ?? base.lessonPlan,
      reminder: {
        enabled: parsed.reminder?.enabled ?? base.reminder.enabled,
        time: parsed.reminder?.time ?? base.reminder.time,
        focus: parsed.reminder?.focus ?? base.reminder.focus,
        lastSentOn: parsed.reminder?.lastSentOn ?? base.reminder.lastSentOn,
      },
      topics: Array.isArray(parsed.topics)
        ? parsed.topics.map((topic) => ({
            id: String(topic.id),
            title: String(topic.title),
            moduleName: String(topic.moduleName),
            status: topic.status === 'covered' || topic.status === 'in-progress' ? topic.status : 'planned',
            plannedDate: String(topic.plannedDate || getTodayDateInputValue()),
            coveredOn: topic.coveredOn ? String(topic.coveredOn) : undefined,
          }))
        : base.topics,
    };
  } catch {
    return createDefaultPlannerState();
  }
}

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(isoDate: string) {
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) return 'Invalid date';
  return value.toLocaleDateString();
}

function formatDateTime(isoDate: string) {
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) return 'Invalid date';
  return value.toLocaleString();
}

function toUploadedResource(file: File): UploadedResource {
  return {
    name: file.name,
    size: file.size,
    type: file.type || 'unknown',
    uploadedAt: new Date().toISOString(),
  };
}

function getStatusTone(status: TopicStatus) {
  if (status === 'covered') return 'bg-green-100 text-green-700 border-green-200';
  if (status === 'in-progress') return 'bg-amber-100 text-amber-700 border-amber-200';
  return 'bg-blue-100 text-blue-700 border-blue-200';
}

export default function InstructorCurriculumInsightsPage() {
  const { instructor, instructorHub, instructorStudents } = useInstructorData();

  const lessonProgress = useMemo(() => {
    return instructorStudents.map((student) => calculateProgressPercentage(student.progress));
  }, [instructorStudents]);

  const rows = useMemo(() => {
    const base = modules.map((moduleName, index) => {
      const threshold = Math.round(((index + 1) / modules.length) * 100);
      const completedCount = lessonProgress.filter((value) => value >= threshold).length;
      const completion = instructorStudents.length === 0 ? 0 : Math.round((completedCount / instructorStudents.length) * 100);
      const avgHours = clamp(Math.round(4 + (100 - completion) / 10 + index), 3, 24);
      return { moduleName, completion, avgHours };
    });

    return base.map((row, index) => {
      const previous = index === 0 ? row.completion : base[index - 1].completion;
      const dropOff = Math.max(0, previous - row.completion);
      return { ...row, dropOff };
    });
  }, [instructorStudents.length, lessonProgress]);

  const avgCompletion = rows.length === 0 ? 0 : Math.round(rows.reduce((sum, row) => sum + row.completion, 0) / rows.length);
  const avgDropOff = rows.length < 2 ? 0 : Math.round(rows.reduce((sum, row) => sum + row.dropOff, 0) / (rows.length - 1));
  const avgTime = rows.length === 0 ? 0 : Number((rows.reduce((sum, row) => sum + row.avgHours, 0) / rows.length).toFixed(1));

  const bottlenecks = [...rows].sort((a, b) => b.dropOff - a.dropOff).slice(0, 3);

  const failedChecks = [
    { topic: 'Async error handling', rate: clamp(42 + avgDropOff, 10, 95) },
    { topic: 'SQL joins and grouping', rate: clamp(35 + avgDropOff, 8, 90) },
    { topic: 'State synchronization', rate: clamp(30 + Math.round(avgDropOff * 0.8), 5, 88) },
  ];

  const plannerStorageKey = useMemo(() => getPlannerStorageKey(instructor.id), [instructor.id]);
  const [planner, setPlanner] = useState<PlannerState>(() => createDefaultPlannerState());
  const [isPlannerLoaded, setIsPlannerLoaded] = useState(false);

  const [topicTitle, setTopicTitle] = useState('');
  const [topicModule, setTopicModule] = useState<string>(modules[0]);
  const [topicPlannedDate, setTopicPlannedDate] = useState(getTodayDateInputValue());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const raw = window.localStorage.getItem(plannerStorageKey);
    setPlanner(parsePlannerState(raw));
    setIsPlannerLoaded(true);
  }, [plannerStorageKey]);

  useEffect(() => {
    if (!isPlannerLoaded || typeof window === 'undefined') return;

    window.localStorage.setItem(plannerStorageKey, JSON.stringify(planner));
  }, [planner, plannerStorageKey, isPlannerLoaded]);

  const coveredTopics = useMemo(() => {
    return planner.topics.filter((topic) => topic.status === 'covered').length;
  }, [planner.topics]);

  const inProgressTopics = useMemo(() => {
    return planner.topics.filter((topic) => topic.status === 'in-progress').length;
  }, [planner.topics]);

  const remainingTopics = planner.topics.length - coveredTopics;
  const topicCoverage = planner.topics.length === 0 ? 0 : Math.round((coveredTopics / planner.topics.length) * 100);
  const nextTopic = planner.topics.find((topic) => topic.status !== 'covered') ?? null;

  const reminderPreview = planner.reminder.focus.trim() || nextTopic?.title || 'Review your next lesson objectives.';

  const nextReminderLabel = useMemo(() => {
    if (!planner.reminder.enabled) return 'Disabled';

    const parts = planner.reminder.time.split(':').map((value) => Number(value));
    if (parts.length !== 2 || parts.some((value) => Number.isNaN(value))) return 'Set a valid time';

    const now = new Date();
    const next = new Date(now);
    next.setHours(parts[0], parts[1], 0, 0);
    if (next <= now) {
      next.setDate(next.getDate() + 1);
    }

    return next.toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  }, [planner.reminder.enabled, planner.reminder.time]);

  useEffect(() => {
    if (typeof window === 'undefined' || !planner.reminder.enabled) return;

    const parts = planner.reminder.time.split(':').map((value) => Number(value));
    if (parts.length !== 2 || parts.some((value) => Number.isNaN(value))) return;

    const checkReminder = () => {
      const now = new Date();
      const today = now.toISOString().slice(0, 10);
      const scheduled = new Date(now);
      scheduled.setHours(parts[0], parts[1], 0, 0);

      if (now >= scheduled && planner.reminder.lastSentOn !== today) {
        toast.info(`Daily reminder: ${reminderPreview}`);
        setPlanner((prev) => ({
          ...prev,
          reminder: {
            ...prev.reminder,
            lastSentOn: today,
          },
        }));
      }
    };

    checkReminder();
    const intervalId = window.setInterval(checkReminder, 60 * 1000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [planner.reminder.enabled, planner.reminder.lastSentOn, planner.reminder.time, reminderPreview]);

  const handleFileUpload = (kind: 'curriculum' | 'lessonPlan') => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const fileMeta = toUploadedResource(file);
    setPlanner((prev) => ({
      ...prev,
      [kind]: fileMeta,
    }));

    toast.success(`${kind === 'curriculum' ? 'Curriculum' : 'Lesson plan'} uploaded: ${file.name}`);
    event.target.value = '';
  };

  const clearUpload = (kind: 'curriculum' | 'lessonPlan') => {
    setPlanner((prev) => ({
      ...prev,
      [kind]: null,
    }));
  };

  const updateReminder = (patch: Partial<ReminderSettings>) => {
    setPlanner((prev) => ({
      ...prev,
      reminder: {
        ...prev.reminder,
        ...patch,
      },
    }));
  };

  const sendTestReminder = () => {
    toast.info(`Reminder preview: ${reminderPreview}`);
  };

  const handleAddTopic = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!topicTitle.trim()) {
      toast.error('Enter a topic before adding it.');
      return;
    }

    const topic: TopicItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title: topicTitle.trim(),
      moduleName: topicModule,
      status: 'planned',
      plannedDate: topicPlannedDate || getTodayDateInputValue(),
    };

    setPlanner((prev) => ({
      ...prev,
      topics: [topic, ...prev.topics],
    }));

    setTopicTitle('');
    setTopicPlannedDate(getTodayDateInputValue());
    toast.success('Topic added to your coverage tracker.');
  };

  const setTopicStatus = (topicId: string, status: TopicStatus) => {
    setPlanner((prev) => ({
      ...prev,
      topics: prev.topics.map((topic) => {
        if (topic.id !== topicId) return topic;

        return {
          ...topic,
          status,
          coveredOn: status === 'covered' ? new Date().toISOString() : undefined,
        };
      }),
    }));
  };

  const removeTopic = (topicId: string) => {
    setPlanner((prev) => ({
      ...prev,
      topics: prev.topics.filter((topic) => topic.id !== topicId),
    }));
  };

  return (
    <div className="space-y-4">
      <Card className="overflow-hidden rounded-2xl border-border bg-primary text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Curriculum</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'Assigned Hub'} Curriculum Insights</h1>
          <p className="max-w-3xl text-sm text-white/80">
            Upload curriculum and lesson plans, schedule daily teaching reminders, and track covered topics alongside completion insights.
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs md:grid-cols-5">
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Completion</p><p className="mt-1 text-base text-white">{avgCompletion}%</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Drop-off</p><p className="mt-1 text-base text-white">{avgDropOff}%</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Avg Lesson Time</p><p className="mt-1 text-base text-white">{avgTime}h</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Topics Covered</p><p className="mt-1 text-base text-white">{coveredTopics}/{planner.topics.length}</p></div>
            <div className="rounded-xl bg-white/15 p-2.5"><p className="text-white/70">Reminder</p><p className="mt-1 text-base text-white">{planner.reminder.enabled ? 'Daily' : 'Off'}</p></div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <Card className="rounded-2xl border-border">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-font text-lg text-foreground">Resource Uploads</h2>
              <LuUpload className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label htmlFor="curriculum-upload">Curriculum file</Label>
                <Input
                  id="curriculum-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                  onChange={handleFileUpload('curriculum')}
                />
                {planner.curriculum ? (
                  <div className="rounded-lg border border-border bg-sidebar p-2 text-xs text-muted-foreground">
                    <p className="text-foreground">{planner.curriculum.name}</p>
                    <p>{formatBytes(planner.curriculum.size)} - {formatDateTime(planner.curriculum.uploadedAt)}</p>
                    <Button type="button" size="sm" variant="ghost" className="mt-1 h-7 px-2" onClick={() => clearUpload('curriculum')}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No curriculum file uploaded yet.</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="lesson-plan-upload">Lesson plan file</Label>
                <Input
                  id="lesson-plan-upload"
                  type="file"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.md"
                  onChange={handleFileUpload('lessonPlan')}
                />
                {planner.lessonPlan ? (
                  <div className="rounded-lg border border-border bg-sidebar p-2 text-xs text-muted-foreground">
                    <p className="text-foreground">{planner.lessonPlan.name}</p>
                    <p>{formatBytes(planner.lessonPlan.size)} - {formatDateTime(planner.lessonPlan.uploadedAt)}</p>
                    <Button type="button" size="sm" variant="ghost" className="mt-1 h-7 px-2" onClick={() => clearUpload('lessonPlan')}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">No lesson plan file uploaded yet.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-font text-lg text-foreground">Daily Reminder</h2>
              <LuBell className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border bg-sidebar px-3 py-2">
              <Label htmlFor="daily-reminder-toggle" className="text-sm text-foreground">Enable daily reminder</Label>
              <Switch
                id="daily-reminder-toggle"
                checked={planner.reminder.enabled}
                onCheckedChange={(checked) => updateReminder({ enabled: checked === true })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="daily-reminder-time">Reminder time</Label>
              <Input
                id="daily-reminder-time"
                type="time"
                value={planner.reminder.time}
                onChange={(event) => updateReminder({ time: event.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="daily-reminder-focus">What are you doing today?</Label>
              <Textarea
                id="daily-reminder-focus"
                value={planner.reminder.focus}
                onChange={(event) => updateReminder({ focus: event.target.value })}
                placeholder="Example: Run API error-handling recap and pair debugging lab."
                className="min-h-24"
              />
            </div>

            <div className="rounded-lg border border-border bg-sidebar p-2 text-xs text-muted-foreground">
              <p className="text-foreground">Next reminder: {nextReminderLabel}</p>
              <p className="mt-1">Message: {reminderPreview}</p>
            </div>

            <Button type="button" variant="outline" className="w-full" onClick={sendTestReminder}>
              Send test reminder
            </Button>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-border">
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="heading-font text-lg text-foreground">Topic Coverage</h2>
              <LuListTodo className="h-4 w-4 text-muted-foreground" />
            </div>

            <div className="rounded-lg border border-border bg-sidebar p-3 text-xs">
              <p className="text-muted-foreground">Coverage progress</p>
              <p className="mt-1 text-sm text-foreground">{topicCoverage}%</p>
              <Progress value={topicCoverage} className="mt-2 h-1.5" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg border border-border bg-sidebar p-2"><p className="text-muted-foreground">Covered</p><p className="text-foreground">{coveredTopics}</p></div>
              <div className="rounded-lg border border-border bg-sidebar p-2"><p className="text-muted-foreground">In Progress</p><p className="text-foreground">{inProgressTopics}</p></div>
              <div className="rounded-lg border border-border bg-sidebar p-2"><p className="text-muted-foreground">Remaining</p><p className="text-foreground">{remainingTopics}</p></div>
            </div>

            <div className="rounded-lg border border-border bg-sidebar p-2 text-xs text-muted-foreground">
              <p className="text-foreground">Next topic</p>
              <p className="mt-1">{nextTopic ? `${nextTopic.title} (${nextTopic.moduleName})` : 'All planned topics are covered.'}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="border-b border-border px-4 py-3">
                <h2 className="heading-font text-lg text-foreground">Module Completion Map</h2>
                <p className="text-xs text-muted-foreground">Completion and drop-off across the learning path</p>
              </div>
              <div className="space-y-2 p-3">
                {rows.map((row) => (
                  <div key={row.moduleName} className="rounded-xl border border-border bg-sidebar p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm text-foreground">{row.moduleName}</p>
                      <Badge className="border border-border bg-card text-[11px] text-muted-foreground">{row.completion}%</Badge>
                    </div>
                    <Progress value={row.completion} className="mt-2 h-1.5" />
                    <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                      <div className="rounded-lg bg-card p-2">Drop-off<p className="text-foreground">{row.dropOff}%</p></div>
                      <div className="rounded-lg bg-card p-2">Avg time<p className="text-foreground">{row.avgHours}h</p></div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="border-b border-border px-4 py-3">
                <h2 className="heading-font text-lg text-foreground">Lesson Plan Tracker</h2>
                <p className="text-xs text-muted-foreground">Add topics and mark them as you teach.</p>
              </div>

              <div className="space-y-3 p-3">
                <form onSubmit={handleAddTopic} className="grid grid-cols-1 gap-2 lg:grid-cols-[1.3fr_1fr_0.9fr_auto]">
                  <Input
                    value={topicTitle}
                    onChange={(event) => setTopicTitle(event.target.value)}
                    placeholder="Topic title"
                  />

                  <select
                    value={topicModule}
                    onChange={(event) => setTopicModule(event.target.value)}
                    className="h-9 rounded-md border border-input bg-input-background px-3 text-sm text-foreground"
                  >
                    {modules.map((moduleName) => (
                      <option key={moduleName} value={moduleName}>
                        {moduleName}
                      </option>
                    ))}
                  </select>

                  <Input
                    type="date"
                    value={topicPlannedDate}
                    onChange={(event) => setTopicPlannedDate(event.target.value)}
                  />

                  <Button type="submit" className="h-9">
                    Add topic
                  </Button>
                </form>

                <div className="space-y-2">
                  {planner.topics.length === 0 && (
                    <div className="rounded-xl border border-dashed border-border bg-sidebar p-4 text-sm text-muted-foreground">
                      No tracked topics yet. Add your first topic above.
                    </div>
                  )}

                  {planner.topics.map((topic) => (
                    <div key={topic.id} className="rounded-xl border border-border bg-sidebar p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm text-foreground">{topic.title}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {topic.moduleName} - Planned {formatDate(topic.plannedDate)}
                            {topic.coveredOn ? ` - Covered ${formatDate(topic.coveredOn)}` : ''}
                          </p>
                        </div>
                        <Badge className={`border text-[11px] ${getStatusTone(topic.status)}`}>
                          {topic.status === 'in-progress' ? 'In Progress' : topic.status === 'covered' ? 'Covered' : 'Planned'}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button type="button" size="sm" variant="outline" className="h-7" onClick={() => setTopicStatus(topic.id, 'planned')}>
                          Planned
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="h-7" onClick={() => setTopicStatus(topic.id, 'in-progress')}>
                          In progress
                        </Button>
                        <Button type="button" size="sm" className="h-7" onClick={() => setTopicStatus(topic.id, 'covered')}>
                          Mark covered
                        </Button>
                        <Button type="button" size="sm" variant="ghost" className="h-7 text-muted-foreground" onClick={() => removeTopic(topic.id)}>
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="heading-font text-lg text-foreground">Failed Checks</h2>
                <LuTriangleAlert className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2 p-3">
                {failedChecks.map((item) => (
                  <div key={item.topic} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-foreground">{item.topic}</span>
                      <span className="text-muted-foreground">{item.rate}% fail</span>
                    </div>
                    <Progress value={item.rate} className="mt-2 h-1.5" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border">
            <CardContent className="p-0">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="heading-font text-lg text-foreground">Bottlenecks</h2>
                <LuTrendingDown className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-2 p-3">
                {bottlenecks.map((row) => (
                  <div key={row.moduleName} className="rounded-xl border border-border bg-sidebar p-3 text-xs">
                    <p className="text-foreground">{row.moduleName}</p>
                    <p className="mt-1 text-muted-foreground">Drop-off: {row.dropOff}%</p>
                  </div>
                ))}
                <Button asChild size="sm" className="h-8 rounded-lg">
                  <Link to="/instructor/assessments">
                    Plan remediation
                    <LuArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-sidebar">
            <CardContent className="space-y-2 p-4 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Teaching cadence</span>
                <LuClock3 className="h-4 w-4" />
              </div>
              <p>Last reminder sent: {planner.reminder.lastSentOn ? formatDate(planner.reminder.lastSentOn) : 'None yet'}</p>
              <p>Uploads saved: {[planner.curriculum, planner.lessonPlan].filter(Boolean).length}</p>
              <p>Students in view: {instructorStudents.length}</p>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-border bg-sidebar">
            <CardContent className="flex items-center justify-between p-4 text-xs text-muted-foreground">
              <span>Use this page to run daily curriculum operations.</span>
              <div className="flex items-center gap-2">
                <LuBookOpen className="h-4 w-4" />
                <LuTarget className="h-4 w-4" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

