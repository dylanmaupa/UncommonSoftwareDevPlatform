import { useEffect, useMemo, useState } from 'react';
import type { IconType } from 'react-icons';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  LuArrowRight,
  LuBell,
  LuBookOpen,
  LuBookOpenCheck,
  LuChevronRight,
  LuClock3,
  LuCode,
  LuDownload,
  LuFolderKanban,
  LuLayoutDashboard,
  LuMessageSquare,
  LuRocket,
  LuSearch,
  LuSend,
  LuSparkles,
  LuTarget,
  LuTrendingUp,
  LuTriangleAlert,
  LuUserCheck,
  LuUsers,
  LuZap,
} from 'react-icons/lu';
import { toast } from 'sonner';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Progress } from '../../../components/ui/progress';
import { cn } from '../../../components/ui/utils';
import { calculateProgressPercentage, calculateProjectPercentage } from '../data/selectors';
import { useInstructorData } from '../hooks/useInstructorData';
import type { StudentRiskLevel } from '../types/instructor.types';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const skills = [
  { key: 'html', label: 'HTML' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'python', label: 'Python' },
  { key: 'databases', label: 'Databases' },
] as const;
const tagOptions = ['Beginner', 'Fast Learner', 'Needs Support'] as const;
const sections = ['overview', 'tracker', 'exercises', 'announcements', 'projects', 'controls', 'live'] as const;

const heatClass = [
  'border-border bg-sidebar',
  'border-sky-200 bg-sky-100',
  'border-sky-300 bg-sky-200',
  'border-blue-300 bg-blue-300/70',
  'border-blue-500/70 bg-primary',
];

const riskClass: Record<StudentRiskLevel, string> = {
  'on-track': 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700',
  'needs-attention': 'border-amber-500/30 bg-amber-500/10 text-amber-700',
  'at-risk': 'border-rose-500/30 bg-rose-500/10 text-rose-700',
};

type SkillKey = (typeof skills)[number]['key'];
type StudentTag = (typeof tagOptions)[number];
type SectionId = (typeof sections)[number];

type TrackerRow = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  hubName: string;
  risk: StudentRiskLevel;
  progress: number;
  projectProgress: number;
  heat: number[];
  mastery: Record<SkillKey, number>;
  flags: string[];
  weeklyDelta: number;
  completionHours: number;
  weeklyProjects: number;
  defaultTag: StudentTag;
};

type Metric = {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  section: SectionId;
  icon: IconType;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function Ring({ value }: { value: number }) {
  const size = 58;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const c = 2 * Math.PI * radius;
  const offset = c - (clamp(value, 0, 100) / 100) * c;

  return (
    <div className="relative h-[58px] w-[58px]">
      <svg className="h-[58px] w-[58px] -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="hsl(var(--border))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-foreground">{value}%</span>
    </div>
  );
}

export default function InstructorDashboardPage() {
  const { instructor, instructorStudents, hubSummaries, metrics } = useInstructorData();

  const [focus, setFocus] = useState<SectionId>('overview');
  const [liveTick, setLiveTick] = useState(0);
  const [announcementType, setAnnouncementType] = useState<'Text' | 'Image' | 'Video' | 'Poll'>('Text');
  const [tags, setTags] = useState<Record<string, StudentTag>>({});

  const hubById = useMemo(() => {
    return hubSummaries.reduce<Record<string, string>>((acc, hub) => {
      acc[hub.hub.id] = hub.hub.name;
      return acc;
    }, {});
  }, [hubSummaries]);

  const trackerRows = useMemo<TrackerRow[]>(() => {
    return instructorStudents.map((student, index) => {
      const progress = calculateProgressPercentage(student.progress);
      const projectProgress = calculateProjectPercentage(student.progress);
      const weeklyDelta = clamp(Math.round(progress / 12) + (index % 4) - (student.riskLevel === 'at-risk' ? 2 : 0), 1, 14);

      const mastery: Record<SkillKey, number> = {
        html: clamp(progress + ((index * 5) % 12) - 4, 10, 99),
        javascript: clamp(progress + ((index * 7) % 16) - 10, 8, 98),
        python: clamp(progress + ((index * 9) % 20) - 16, 6, 97),
        databases: clamp(progress + ((index * 11) % 20) - 18, 5, 96),
      };

      const heat = days.map((_, dayIndex) => {
        const base = Math.round((progress + weeklyDelta * 2) / 24);
        const wave = ((index + dayIndex * 2) % 3) - 1;
        return clamp(base + wave, 0, 4);
      });

      const flags: string[] = [];
      if (student.riskLevel !== 'on-track' || projectProgress < 65) flags.push('Late submissions');
      if (student.riskLevel === 'at-risk' || progress < 35) flags.push('Blocked 3+ days');
      if (index % 4 === 0 || (student.riskLevel === 'on-track' && weeklyDelta >= 8)) flags.push('Returner');
      if (!flags.length) flags.push('Steady progress');

      const defaultTag: StudentTag =
        progress >= 80
          ? 'Fast Learner'
          : student.riskLevel !== 'on-track' || progress < 45
            ? 'Needs Support'
            : 'Beginner';

      return {
        id: student.id,
        name: student.fullName,
        email: student.email,
        avatar: student.avatarUrl,
        hubName: hubById[student.hubId] ?? student.hubId,
        risk: student.riskLevel,
        progress,
        projectProgress,
        heat,
        mastery,
        flags,
        weeklyDelta,
        completionHours: Number((5 + (100 - progress) / 18 + (student.riskLevel === 'at-risk' ? 2.8 : 1)).toFixed(1)),
        weeklyProjects: clamp(Math.round(projectProgress / 38) + (index % 2) - (student.riskLevel === 'at-risk' ? 1 : 0), 0, 3),
        defaultTag,
      };
    });
  }, [hubById, instructorStudents]);

  useEffect(() => {
    setTags((prev) => {
      const next: Record<string, StudentTag> = {};
      let changed = Object.keys(prev).length !== trackerRows.length;

      trackerRows.forEach((row) => {
        const value = prev[row.id] ?? row.defaultTag;
        next[row.id] = value;
        if (prev[row.id] !== value) changed = true;
      });

      return changed ? next : prev;
    });
  }, [trackerRows]);

  useEffect(() => {
    const id = window.setInterval(() => setLiveTick((v) => v + 1), 6000);
    return () => window.clearInterval(id);
  }, []);
  const activeStudents = useMemo(() => trackerRows.filter((row) => row.heat.slice(-3).some((v) => v >= 2)).length, [trackerRows]);

  const weeklyRate = useMemo(() => {
    if (!trackerRows.length) return 0;
    const avg = trackerRows.reduce((sum, row) => sum + row.weeklyDelta, 0) / trackerRows.length;
    return Math.round(avg * 2.2);
  }, [trackerRows]);

  const avgCompletionTime = useMemo(() => {
    if (!trackerRows.length) return 0;
    const total = trackerRows.reduce((sum, row) => sum + row.completionHours, 0);
    return Number((total / trackerRows.length).toFixed(1));
  }, [trackerRows]);

  const projectsThisWeek = useMemo(() => trackerRows.reduce((sum, row) => sum + row.weeklyProjects, 0), [trackerRows]);

  const seenCount = Math.max(1, Math.round(metrics.totalStudents * 0.82));
  const unseenCount = Math.max(0, metrics.totalStudents - seenCount);
  const seenRate = metrics.totalStudents > 0 ? Math.round((seenCount / metrics.totalStudents) * 100) : 0;

  const metricsCards: Metric[] = [
    {
      id: 'active',
      title: 'Active Students @ Your Hub',
      value: String(activeStudents),
      subtitle: `${Math.max(metrics.totalStudents - activeStudents, 0)} currently idle`,
      trend: '+4 today',
      section: 'tracker',
      icon: LuUsers,
    },
    {
      id: 'weekly',
      title: 'Weekly Progress Rate',
      value: `${weeklyRate}%`,
      subtitle: 'Week-over-week learning velocity',
      trend: '+6% vs last week',
      section: 'overview',
      icon: LuTrendingUp,
    },
    {
      id: 'time',
      title: 'Avg Assignment Completion Time',
      value: `${avgCompletionTime}h`,
      subtitle: 'Median assignment effort',
      trend: '-0.7h faster',
      section: 'exercises',
      icon: LuClock3,
    },
    {
      id: 'announce',
      title: 'Announcements Engagement',
      value: `${seenRate}% seen`,
      subtitle: `${seenCount} seen / ${unseenCount} unseen`,
      trend: '+11% click rate',
      section: 'announcements',
      icon: LuBell,
    },
    {
      id: 'projects',
      title: 'Projects Completed This Week',
      value: String(projectsThisWeek),
      subtitle: 'Milestones completed',
      trend: '+3 from last week',
      section: 'projects',
      icon: LuFolderKanban,
    },
  ];

  const trendData = useMemo(
    () =>
      days.map((day, i) => {
        const total = trackerRows.reduce((sum, row) => sum + row.heat[i], 0);
        const progress = trackerRows.length ? Math.round((total / (trackerRows.length * 4)) * 100) : 0;
        const engagement = clamp(Math.round(progress * 0.8 + ((i % 2) * 6 - 2)), 20, 100);
        return { day, progress, engagement };
      }),
    [trackerRows]
  );

  const timeline = [
    { id: 'a', title: `${projectsThisWeek} project milestones completed`, time: '12m ago' },
    { id: 'b', title: `${trackerRows.filter((r) => r.flags.includes('Blocked 3+ days')).length} students stuck on similar module`, time: '34m ago' },
    { id: 'c', title: `${trackerRows.filter((r) => r.flags.includes('Returner')).length} returners re-engaged`, time: '1h ago' },
    { id: 'd', title: `${seenRate}% announcement seen rate`, time: '2h ago' },
  ];

  const skillAverage = useMemo(() => {
    const init = skills.reduce<Record<SkillKey, number>>((acc, s) => {
      acc[s.key] = 0;
      return acc;
    }, {} as Record<SkillKey, number>);

    trackerRows.forEach((row) => {
      skills.forEach((s) => {
        init[s.key] += row.mastery[s.key];
      });
    });

    if (trackerRows.length) {
      skills.forEach((s) => {
        init[s.key] = Math.round(init[s.key] / trackerRows.length);
      });
    }

    return init;
  }, [trackerRows]);

  const weakest = [...skills].sort((a, b) => skillAverage[a.key] - skillAverage[b.key]).slice(0, 2);

  const suggestions = [
    {
      id: 's1',
      title: `${weakest[0]?.label ?? 'Core skill'} deep-dive micro-lab`,
      reason: 'Common weakness in last 7 days.',
      action: `Assign a 20-minute drill to ${trackerRows.filter((r) => r.flags.includes('Late submissions')).length} students.`,
    },
    {
      id: 's2',
      title: 'Catch-up sprint for incomplete modules',
      reason: 'Module completion lag detected.',
      action: `Split ${trackerRows.reduce((sum, row) => sum + Math.max(1, Math.round((100 - row.progress) / 20)), 0)} incomplete tasks into mini checkpoints.`,
    },
    {
      id: 's3',
      title: 'Pair-programming debug challenge',
      reason: 'Repeated blockers in async + query debugging.',
      action: 'Auto-match blocked learners with fast learners for 30 minutes.',
    },
  ];

  const scheduled = [
    { id: 'e1', type: 'Coding Challenge', title: 'Async Bug Hunt', due: 'Mar 6, 10:00', audience: 'All hubs' },
    { id: 'e2', type: 'Quiz', title: 'Database Joins Quick Quiz', due: 'Mar 6, 15:30', audience: 'Needs Support' },
    { id: 'e3', type: 'Group Project', title: 'Mini API Build Sprint', due: 'Mar 8, 09:00', audience: 'Hub Harare North' },
  ];

  const announcements = [
    { id: 'n1', type: 'Video', title: 'Week Sprint Kickoff + Priority Modules', seen: seenRate, clicked: 63, commented: 29, expires: '18h' },
    { id: 'n2', type: 'Poll', title: 'Which project should we build next?', seen: 74, clicked: 58, commented: 22, expires: '2d' },
  ];

  const inbox = [
    { id: 'i1', student: 'Peter Moyo', message: 'How should we structure migrations for week 4?', repeats: 4, at: '8 min ago' },
    { id: 'i2', student: 'Ruvimbo Dube', message: 'Can we submit API challenge as a pair?', repeats: 2, at: '22 min ago' },
    { id: 'i3', student: 'Blessing Ncube', message: 'I keep getting timeout errors in sandbox.', repeats: 5, at: '31 min ago' },
  ];

  const projectNames = ['Portfolio API', 'Inventory Dashboard', 'Peer Review Engine', 'Task Automation CLI', 'Hub Attendance Tracker'];
  const steps = ['Scoping', 'API Integration', 'State Management', 'Testing', 'Deployment'];
  const concepts = ['Async Patterns', 'Relational Joins', 'Error Handling', 'Type Safety', 'State Sync'];

  const projectRows = useMemo(
    () =>
      trackerRows.map((row, i) => {
        const completion = clamp(row.projectProgress + (i % 3) * 7 - 4, 18, 100);
        const quality = clamp(Math.round(row.progress * 0.78 + (i % 4) * 5), 42, 98);
        return {
          id: `p-${row.id}`,
          student: row.name,
          hub: row.hubName,
          project: projectNames[i % projectNames.length],
          completion,
          quality,
          peer: completion >= 78 ? 'Complete' : i % 2 ? 'Pending' : 'In Review',
          feedback: completion < 85 || row.flags.includes('Blocked 3+ days'),
          step: steps[(i + row.weeklyDelta) % steps.length],
          concept: concepts[(i + row.flags.length) % concepts.length],
          days: clamp(Math.round(25 - completion / 7 + (i % 3)), 8, 34),
        };
      }),
    [trackerRows]
  );

  const stepData = steps.map((step) => ({ step, students: projectRows.filter((p) => p.step === step).length }));
  const conceptData = concepts
    .map((concept) => ({ concept, students: projectRows.filter((p) => p.concept === concept).length }))
    .sort((a, b) => b.students - a.students);

  const hubSuccess = Object.entries(
    projectRows.reduce<Record<string, { quality: number; completion: number; count: number }>>((acc, project) => {
      if (!acc[project.hub]) acc[project.hub] = { quality: 0, completion: 0, count: 0 };
      acc[project.hub].quality += project.quality;
      acc[project.hub].completion += project.completion;
      acc[project.hub].count += 1;
      return acc;
    }, {})
  ).map(([hub, value]) => ({
    hub,
    quality: Math.round(value.quality / value.count),
    completion: Math.round(value.completion / value.count),
  }));
