import { useEffect, useMemo, useState } from 'react';
import { LuBookOpenCheck, LuMessageSquare } from 'react-icons/lu';
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
const skillKeys = [
  { key: 'html', label: 'HTML' },
  { key: 'javascript', label: 'JavaScript' },
  { key: 'python', label: 'Python' },
  { key: 'databases', label: 'Databases' },
] as const;
const tagOptions = ['Beginner', 'Fast Learner', 'Needs Support'] as const;

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

type SkillName = (typeof skillKeys)[number]['key'];
type StudentTag = (typeof tagOptions)[number];

type TrackerStudent = {
  id: string;
  fullName: string;
  email: string;
  avatarUrl: string;
  progress: number;
  projectProgress: number;
  riskLevel: StudentRiskLevel;
  heatMap: number[];
  skills: Record<SkillName, number>;
  flags: string[];
  defaultTag: StudentTag;
  avgCompletionHours: number;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function ProgressRing({ value }: { value: number }) {
  const size = 58;
  const stroke = 6;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamp(value, 0, 100) / 100) * circumference;

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
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[11px] font-semibold text-foreground">{value}%</span>
    </div>
  );
}

export default function StudentsPage() {
  const { instructorStudents, instructorHub } = useInstructorData();
  const [tags, setTags] = useState<Record<string, StudentTag>>({});

  const trackerStudents = useMemo<TrackerStudent[]>(() => {
    return instructorStudents.map((student, index) => {
      const progress = calculateProgressPercentage(student.progress);
      const projectProgress = calculateProjectPercentage(student.progress);

      const heatMap = days.map((_, dayIndex) => {
        const baseline = Math.round(progress / 24);
        const variation = ((index + dayIndex * 2) % 3) - 1;
        return clamp(baseline + variation, 0, 4);
      });

      const skills: Record<SkillName, number> = {
        html: clamp(progress + ((index * 5) % 12) - 4, 10, 99),
        javascript: clamp(progress + ((index * 7) % 16) - 10, 8, 98),
        python: clamp(progress + ((index * 9) % 16) - 14, 6, 97),
        databases: clamp(progress + ((index * 11) % 18) - 18, 5, 96),
      };

      const flags: string[] = [];
      if (student.riskLevel !== 'on-track' || projectProgress < 65) flags.push('Late submissions');
      if (student.riskLevel === 'at-risk' || progress < 35) flags.push('Blocked 3+ days');
      if (index % 4 === 0) flags.push('Returner');
      if (flags.length === 0) flags.push('Steady progress');

      const defaultTag: StudentTag =
        progress >= 80
          ? 'Fast Learner'
          : student.riskLevel !== 'on-track' || progress < 45
            ? 'Needs Support'
            : 'Beginner';

      const avgCompletionHours = Number((5 + (100 - progress) / 20 + (student.riskLevel === 'at-risk' ? 2.8 : 1)).toFixed(1));

      return {
        id: student.id,
        fullName: student.fullName,
        email: student.email,
        avatarUrl: student.avatarUrl,
        progress,
        projectProgress,
        riskLevel: student.riskLevel,
        heatMap,
        skills,
        flags,
        defaultTag,
        avgCompletionHours,
      };
    });
  }, [instructorStudents]);

  useEffect(() => {
    setTags((prev) => {
      const next: Record<string, StudentTag> = {};
      let changed = Object.keys(prev).length !== trackerStudents.length;

      trackerStudents.forEach((student) => {
        const value = prev[student.id] ?? student.defaultTag;
        next[student.id] = value;
        if (prev[student.id] !== value) changed = true;
      });

      return changed ? next : prev;
    });
  }, [trackerStudents]);

  return (
    <div className="space-y-4 p-3 sm:p-4 lg:p-6">
      <Card className="overflow-hidden rounded-3xl border-0 bg-gradient-to-br from-primary via-[#0b5bbf] to-[#1098c9] text-white">
        <CardContent className="space-y-3 p-4 sm:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-white/75">Student Tracker</p>
          <h1 className="heading-font text-2xl sm:text-3xl">{instructorHub?.name ?? 'My Hub'} Learner Progress</h1>
          <p className="max-w-2xl text-sm text-white/80">
            Monitor student performance for your hub with heat maps, mastery bars, and intervention actions.
          </p>
        </CardContent>
      </Card>

      <div className="rounded-xl border border-border bg-sidebar p-2.5">
        <p className="text-xs text-muted-foreground">Heat Map Legend</p>
        <div className="mt-2 flex items-center gap-1.5">
          {heatClass.map((item, index) => (
            <div key={index} className={cn('h-4 w-4 rounded-sm border', item)} />
          ))}
          <span className="ml-2 text-[11px] text-muted-foreground">Low to high daily activity</span>
        </div>
      </div>

      <div className="space-y-3">
        {trackerStudents.map((student) => (
          <Card key={student.id} className="rounded-2xl border-border">
            <CardContent className="p-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
                <div className="flex min-w-0 items-center gap-3 xl:w-[260px]">
                  <Avatar className="h-11 w-11 border border-border">
                    <AvatarImage src={student.avatarUrl} alt={student.fullName} />
                    <AvatarFallback>{student.fullName[0]}</AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-foreground">{student.fullName}</p>
                    <p className="truncate text-xs text-muted-foreground">{student.email}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">{instructorHub?.name ?? 'Assigned Hub'}</p>
                  </div>

                  <ProgressRing value={student.progress} />
                </div>

                <div className="grid flex-1 gap-3 lg:grid-cols-[1.25fr_1fr]">
                  <div className="space-y-3 rounded-xl border border-border bg-sidebar p-2.5">
                    <div>
                      <p className="mb-1 text-[11px] text-muted-foreground">Weekly activity heat map</p>
                      <div className="grid grid-cols-7 gap-1">
                        {student.heatMap.map((value, dayIndex) => (
                          <div key={`${student.id}-heat-${dayIndex}`} className="space-y-1">
                            <div className={cn('h-5 rounded-sm border', heatClass[value])} />
                            <p className="text-center text-[10px] text-muted-foreground">{days[dayIndex]}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {skillKeys.map((skill) => (
                        <div key={`${student.id}-${skill.key}`} className="rounded-lg bg-card p-2">
                          <div className="mb-1 flex items-center justify-between text-[11px]">
                            <span className="text-muted-foreground">{skill.label}</span>
                            <span className="text-foreground">{student.skills[skill.key]}%</span>
                          </div>
                          <Progress value={student.skills[skill.key]} className="h-1.5" />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2 rounded-xl border border-border bg-sidebar p-2.5">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge className={cn('border text-[11px]', riskClass[student.riskLevel])}>
                        {student.riskLevel.replace('-', ' ')}
                      </Badge>
                      {student.flags.map((flag) => (
                        <Badge
                          key={`${student.id}-${flag}`}
                          className={`border text-[11px] ${
                            flag === 'Blocked 3+ days'
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-700'
                              : flag === 'Late submissions'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-700'
                                : 'border-sky-500/30 bg-sky-500/10 text-sky-700'
                          }`}
                        >
                          {flag}
                        </Badge>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-muted-foreground">
                      <div className="rounded-lg bg-card p-2">
                        Avg completion time
                        <p className="text-sm text-foreground">{student.avgCompletionHours}h</p>
                      </div>
                      <div className="rounded-lg bg-card p-2">
                        Project progress
                        <p className="text-sm text-foreground">{student.projectProgress}%</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {tagOptions.map((tag) => (
                        <button
                          key={`${student.id}-${tag}`}
                          type="button"
                          onClick={() => {
                            setTags((prev) => ({ ...prev, [student.id]: tag }));
                            toast.success(`${student.fullName} tagged as ${tag}`);
                          }}
                          className={`rounded-full border px-2.5 py-1 text-[11px] ${
                            tags[student.id] === tag
                              ? 'border-primary bg-primary text-white'
                              : 'border-border bg-card text-muted-foreground'
                          }`}
                        >
                          {tag}
                        </button>
                      ))}
                    </div>

                    <div className="grid grid-cols-2 gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 justify-start rounded-lg border border-border bg-card text-xs"
                        onClick={() => toast.success(`Message thread opened for ${student.fullName}`)}
                      >
                        <LuMessageSquare className="h-3.5 w-3.5" />
                        Message
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 justify-start rounded-lg border border-border bg-card text-xs"
                        onClick={() => toast.success(`Mini exercise assigned to ${student.fullName}`)}
                      >
                        <LuBookOpenCheck className="h-3.5 w-3.5" />
                        Mini exercise
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
