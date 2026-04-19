import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../../../../lib/supabase';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import { toast } from 'sonner';
import {
  LuBookOpen,
  LuCalendar,
  LuChevronDown,
  LuChevronRight,
  LuCircleCheck,
  LuClock,
  LuRefreshCw,
  LuUsers,
  LuFileText,
  LuCode,
  LuFileUp,
} from 'react-icons/lu';
import ReviewAssignmentPage, { ReviewSubmission } from './ReviewAssignmentPage';

// ─── Types ────────────────────────────────────────────────────────────────────

interface RawExercise {
  id: string;
  instructor_id: string;
  student_id: string | null;
  hub_location: string;
  title: string;
  instructions: string;
  language: string;
  due_date: string | null;
  status: string;
  created_at: string;
  submitted_at: string | null;
  submission_content?: string | null;
  submission_document_path?: string | null;
  submission_document_name?: string | null;
  submission_document_size?: number | null;
  submission_document_mime_type?: string | null;
  formatting_requirements?: string | null;
  focus_loss_count?: number | null;
  grade?: number | null;
  feedback?: string | null;
}

interface StudentRecord {
  id: string;
  full_name: string;
  email: string;
}

interface StudentAssignment {
  exerciseId: string;
  student: StudentRecord;
  status: 'not_submitted' | 'submitted' | 'reviewed';
  submittedAt: string | null;
  raw: RawExercise;
}

interface AssignmentGroup {
  title: string;
  language: string;
  dueDate: string | null;
  createdAt: string;
  instructions: string;
  formattingRequirements?: string | null;
  students: StudentAssignment[];
}

type TopFilter = 'all' | 'not_submitted' | 'submitted' | 'reviewed';
type GroupFilter = 'all' | 'not_submitted' | 'submitted' | 'reviewed';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resolveStatus(raw: string): 'not_submitted' | 'submitted' | 'reviewed' {
  if (['submitted'].includes(raw)) return 'submitted';
  if (['reviewed', 'approved', 'rejected'].includes(raw)) return 'reviewed';
  return 'not_submitted';
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return 'No due date';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function initials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function langIcon(lang: string) {
  if (lang === 'document') return <LuFileUp className="h-3.5 w-3.5" />;
  if (lang === 'written') return <LuFileText className="h-3.5 w-3.5" />;
  return <LuCode className="h-3.5 w-3.5" />;
}

// ─── Status badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status, rawStatus }: { status: StudentAssignment['status']; rawStatus: string }) {
  if (status === 'not_submitted') {
    const isPastDue = false; // could derive from dueDate if needed
    return (
      <Badge className="bg-slate-100 text-slate-600 border-slate-200 text-[10px]">
        Not Submitted
      </Badge>
    );
  }
  if (status === 'submitted') {
    return <Badge className="bg-amber-100 text-amber-700 border-amber-200 text-[10px]">Submitted</Badge>;
  }
  // reviewed bucket
  if (rawStatus === 'approved') {
    return <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px]">Approved</Badge>;
  }
  if (rawStatus === 'rejected') {
    return <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[10px]">Needs Revision</Badge>;
  }
  return <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px]">Reviewed</Badge>;
}

// ─── Single assignment group card ─────────────────────────────────────────────

function AssignmentGroupCard({
  group,
  onReview,
}: {
  group: AssignmentGroup;
  onReview: (rec: StudentAssignment) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const [groupFilter, setGroupFilter] = useState<GroupFilter>('all');

  const total = group.students.length;
  const submittedCount = group.students.filter((s) => s.status === 'submitted').length;
  const reviewedCount = group.students.filter((s) => s.status === 'reviewed').length;
  const notSubmittedCount = group.students.filter((s) => s.status === 'not_submitted').length;
  const doneCount = submittedCount + reviewedCount;

  const filteredStudents = group.students.filter((s) => {
    if (groupFilter === 'all') return true;
    return s.status === groupFilter;
  });

  const isOverdue =
    group.dueDate && new Date(group.dueDate) < new Date();

  return (
    <Card className="overflow-hidden border-slate-200 hover:shadow-md transition-shadow">
      {/* ── Header ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full text-left px-5 py-4 flex items-start gap-4 hover:bg-slate-50/60 transition-colors"
      >
        {/* Progress ring placeholder — simple circle */}
        <div className="relative shrink-0 mt-0.5">
          <svg className="h-10 w-10 -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#e2e8f0" strokeWidth="3.5" />
            <circle
              cx="18"
              cy="18"
              r="14"
              fill="none"
              stroke={doneCount === total ? '#10b981' : '#3b82f6'}
              strokeWidth="3.5"
              strokeDasharray={`${total > 0 ? (doneCount / total) * 88 : 0} 88`}
              strokeLinecap="round"
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[9px] font-bold text-slate-600">
            {total > 0 ? Math.round((doneCount / total) * 100) : 0}%
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-slate-900 text-sm leading-snug">{group.title}</span>
            <Badge variant="outline" className="gap-1 text-[10px] capitalize text-slate-500 border-slate-200">
              {langIcon(group.language)}
              {group.language}
            </Badge>
            {isOverdue && notSubmittedCount > 0 && (
              <Badge className="bg-rose-100 text-rose-600 border-rose-200 text-[10px]">Overdue</Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1 line-clamp-1">{group.instructions}</p>

          <div className="flex items-center gap-4 mt-2 text-xs text-slate-500 flex-wrap">
            <span className="flex items-center gap-1">
              <LuCalendar className="h-3 w-3" />
              {formatDate(group.dueDate)}
            </span>
            <span className="flex items-center gap-1">
              <LuUsers className="h-3 w-3" />
              {total} student{total !== 1 ? 's' : ''}
            </span>
            <span className="flex items-center gap-1 text-amber-600">
              <LuClock className="h-3 w-3" />
              {submittedCount} submitted
            </span>
            <span className="flex items-center gap-1 text-emerald-600">
              <LuCircleCheck className="h-3 w-3" />
              {reviewedCount} reviewed
            </span>
            {notSubmittedCount > 0 && (
              <span className="flex items-center gap-1 text-slate-400">
                {notSubmittedCount} not submitted
              </span>
            )}
          </div>
        </div>

        <div className="shrink-0 text-slate-400 mt-1">
          {expanded ? <LuChevronDown className="h-4 w-4" /> : <LuChevronRight className="h-4 w-4" />}
        </div>
      </button>

      {/* ── Progress bar ── */}
      <div className="h-1 bg-slate-100 mx-5 rounded-full mb-0.5">
        <div
          className="h-full rounded-full bg-emerald-500 transition-all duration-500"
          style={{ width: total > 0 ? `${(doneCount / total) * 100}%` : '0%' }}
        />
      </div>

      {/* ── Expanded student list ── */}
      {expanded && (
        <div className="border-t border-slate-100">
          {/* Category filter pills */}
          <div className="flex gap-2 px-5 pt-4 pb-2 flex-wrap">
            {(
              [
                { key: 'all', label: `All (${total})` },
                { key: 'not_submitted', label: `Not Submitted (${notSubmittedCount})` },
                { key: 'submitted', label: `Submitted (${submittedCount})` },
                { key: 'reviewed', label: `Reviewed (${reviewedCount})` },
              ] as { key: GroupFilter; label: string }[]
            ).map(({ key, label }) => (
              <button
                key={key}
                onClick={(e) => {
                  e.stopPropagation();
                  setGroupFilter(key);
                }}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                  groupFilter === key
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Student rows */}
          <div className="px-5 pb-4 space-y-2">
            {filteredStudents.length === 0 ? (
              <p className="text-sm text-slate-400 italic py-4 text-center">
                No students in this category.
              </p>
            ) : (
              filteredStudents.map((rec) => (
                <div
                  key={rec.exerciseId}
                  className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                >
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                      {initials(rec.student.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{rec.student.full_name}</p>
                    <p className="text-xs text-slate-500 truncate">{rec.student.email}</p>
                    {rec.submittedAt && (
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        Submitted {new Date(rec.submittedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                  </div>
                  <StatusBadge status={rec.status} rawStatus={rec.raw.status} />
                  {(rec.status === 'submitted' || rec.status === 'reviewed') && (
                    <Button
                      size="sm"
                      variant={rec.status === 'reviewed' ? 'outline' : 'default'}
                      className="rounded-full text-xs shrink-0 h-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        onReview(rec);
                      }}
                    >
                      {rec.status === 'reviewed' ? 'View Review' : 'Review'}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function InstructorAssignmentsPage() {
  const [groups, setGroups] = useState<AssignmentGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [topFilter, setTopFilter] = useState<TopFilter>('all');
  const [reviewTarget, setReviewTarget] = useState<ReviewSubmission | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Instructor's hub
      const { data: profile } = await supabase
        .from('profiles')
        .select('hub_location')
        .eq('id', user.id)
        .single();

      const hub = profile?.hub_location;
      if (!hub) {
        toast.error('Your account has no hub location set.');
        return;
      }

      // Fetch all exercises for this hub
      const { data: exercises, error: exError } = await supabase
        .from('instructor_exercises')
        .select('*')
        .eq('hub_location', hub)
        .order('created_at', { ascending: false });

      if (exError) throw exError;

      // Fetch all student profiles in hub
      const { data: students, error: stuError } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('role', 'student')
        .eq('hub_location', hub)
        .order('full_name');

      if (stuError) throw stuError;

      const studentMap = new Map<string, StudentRecord>(
        (students || []).map((s: any) => [s.id, { id: s.id, full_name: s.full_name || s.email, email: s.email }])
      );

      // Group exercises by title
      const groupMap = new Map<string, AssignmentGroup>();

      for (const ex of exercises || []) {
        const key = ex.title;
        if (!groupMap.has(key)) {
          groupMap.set(key, {
            title: ex.title,
            language: ex.language || 'python',
            dueDate: ex.due_date || null,
            createdAt: ex.created_at,
            instructions: ex.instructions || '',
            formattingRequirements: ex.formatting_requirements || null,
            students: [],
          });
        }

        const student = ex.student_id ? studentMap.get(ex.student_id) : null;
        const studentRecord: StudentRecord = student || {
          id: ex.student_id || 'unknown',
          full_name: 'Unknown Student',
          email: '',
        };

        groupMap.get(key)!.students.push({
          exerciseId: ex.id,
          student: studentRecord,
          status: resolveStatus(ex.status),
          submittedAt: ex.submitted_at || null,
          raw: ex as RawExercise,
        });
      }

      // Sort groups: most recent first
      const sorted = Array.from(groupMap.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setGroups(sorted);
    } catch (err) {
      console.error('Error loading assignments:', err);
      toast.error('Failed to load assignments.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Top-level filter: only show groups that have at least one student in that category
  const filteredGroups = groups.filter((g) => {
    if (topFilter === 'all') return true;
    return g.students.some((s) => s.status === topFilter);
  });

  // Counts for filter pills
  const allCount = groups.length;
  const notSubmittedCount = groups.filter((g) => g.students.some((s) => s.status === 'not_submitted')).length;
  const submittedCount = groups.filter((g) => g.students.some((s) => s.status === 'submitted')).length;
  const reviewedCount = groups.filter((g) => g.students.some((s) => s.status === 'reviewed')).length;

  const openReview = (rec: StudentAssignment) => {
    const ex = rec.raw;
    const isCode = ex.language === 'python' || ex.language === 'javascript';
    const isDocument = ex.language === 'document';

    const submission: ReviewSubmission = {
      id: ex.id,
      studentName: rec.student.full_name,
      studentEmail: rec.student.email,
      exerciseTitle: ex.title,
      exerciseDescription: ex.instructions,
      exerciseModule: '',
      exerciseType: isDocument ? 'document' : isCode ? 'coding' : 'written',
      language: ex.language,
      submittedAt: ex.submitted_at
        ? new Date(ex.submitted_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
        : '',
      submissionContent: ex.submission_content || '',
      focusLossCount: ex.focus_loss_count ?? undefined,
      existingGrade: ex.grade ?? undefined,
      existingFeedback: ex.feedback ?? undefined,
      formattingRequirements: ex.formatting_requirements ?? undefined,
      documentName: ex.submission_document_name ?? undefined,
      documentSize: ex.submission_document_size ?? undefined,
      documentUrl: ex.submission_document_path
        ? supabase.storage.from('assignment-documents').getPublicUrl(ex.submission_document_path).data.publicUrl
        : undefined,
      status: resolveStatus(ex.status) === 'reviewed' ? 'reviewed' : 'pending',
    };

    setReviewTarget(submission);
  };

  if (reviewTarget) {
    return (
      <ReviewAssignmentPage
        submission={reviewTarget}
        onClose={() => {
          setReviewTarget(null);
          fetchData();
        }}
      />
    );
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* ── Page header ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600 ring-1 ring-blue-500/20">
              <LuBookOpen className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 heading-font lowercase">Assignments</h1>
              <p className="text-sm text-slate-500">See who has submitted and who hasn't</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={fetchData}
            disabled={isLoading}
            className="gap-2 rounded-full text-xs"
          >
            <LuRefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* ── Filter pills ── */}
        <div className="flex flex-wrap gap-2 mt-5">
          {(
            [
              { key: 'all', label: 'All Assignments', count: allCount },
              { key: 'not_submitted', label: 'Has Pending', count: notSubmittedCount },
              { key: 'submitted', label: 'Has Submissions', count: submittedCount },
              { key: 'reviewed', label: 'Has Reviewed', count: reviewedCount },
            ] as { key: TopFilter; label: string; count: number }[]
          ).map(({ key, label, count }) => (
            <button
              key={key}
              onClick={() => setTopFilter(key)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                topFilter === key
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {label}
              <span className={`ml-1.5 ${topFilter === key ? 'text-white/70' : 'text-slate-400'}`}>
                ({count})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48 text-slate-500 gap-3">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
          Loading assignments…
        </div>
      ) : filteredGroups.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center h-48 text-center">
            <LuBookOpen className="h-8 w-8 text-slate-300 mb-3" />
            <p className="text-slate-600 font-medium">No assignments found</p>
            <p className="text-slate-400 text-sm mt-1">
              {topFilter === 'all'
                ? 'No assignments have been created for this hub yet.'
                : 'No assignments match the selected filter.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredGroups.map((group) => (
            <AssignmentGroupCard key={group.title} group={group} onReview={openReview} />
          ))}
        </div>
      )}
    </div>
  );
}
