import { useState, useEffect, useRef, useCallback } from 'react';
import Editor from '@monaco-editor/react';
import { Panel, PanelGroup, PanelResizeHandle } from 'react-resizable-panels';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Textarea } from '../../../components/ui/textarea';
import { Avatar, AvatarFallback } from '../../../components/ui/avatar';
import {
  LuX,
  LuPlay,
  LuSend,
  LuCode,
  LuFileText,
  LuMessageSquare,
  LuStar,
  LuLoader,
  LuCircleCheck,
  LuCircleAlert,
  LuClock,
  LuChevronDown,
  LuTerminal,
  LuTrash2,
  LuUser,
} from 'react-icons/lu';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface ReviewSubmission {
  id: string;
  studentName: string;
  studentEmail: string;
  exerciseTitle: string;
  exerciseDescription: string;
  exerciseModule: string;
  exerciseType: 'coding' | 'debugging' | 'written' | 'quiz' | 'project';
  language?: string;
  submittedAt: string;
  submissionContent: string;           // The actual submitted code or written text
  focusLossCount?: number;             // From written assignments
  existingGrade?: number;
  existingFeedback?: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
}

interface ReviewAssignmentPageProps {
  submission: ReviewSubmission;
  onClose: () => void;
  onSubmitReview?: (payload: {
    submissionId: string;
    grade: number;
    feedback: string;
    action: 'approve' | 'request_revision';
  }) => void;
}

// ─── Quick Comments ──────────────────────────────────────────────────────────

const QUICK_COMMENTS = [
  { label: '👏 Great logic!', value: '**Great logic!** Your approach demonstrates solid problem-solving skills.\n\n' },
  { label: '✅ Well structured', value: '**Well structured code.** Clean and readable — great job.\n\n' },
  { label: '⚠️ Check your syntax', value: '**Check your syntax.** There are a few syntax errors that prevent the code from running correctly.\n\n' },
  { label: '🔄 Needs refactoring', value: '**Consider refactoring.** While functional, some parts could be simplified for readability.\n\n' },
  { label: '📝 Add comments', value: '**Please add comments.** Your code works, but inline comments would help others understand your thinking.\n\n' },
  { label: '🐛 Edge cases missing', value: '**Edge cases not handled.** Consider what happens with empty input, null values, or very large datasets.\n\n' },
  { label: '⭐ Excellent work!', value: '**Excellent work!** This exceeds expectations in every way. Keep it up!\n\n' },
  { label: '🔁 Incomplete', value: '**Submission appears incomplete.** Please review the exercise requirements and resubmit.\n\n' },
];

// ─── Run Output Types ────────────────────────────────────────────────────────

interface OutputLine {
  kind: 'stdout' | 'stderr' | 'info' | 'error';
  text: string;
}

// ─── Piston Mapping ─────────────────────────────────────────────────────────

const INTERNAL_RUN_API = '/api/code/run';

const LANGUAGE_MAP: Record<string, { language: string; version: string }> = {
  python:     { language: 'python',     version: '3.10.0' },
  javascript: { language: 'javascript', version: '18.15.0' },
  js:         { language: 'javascript', version: '18.15.0' },
  typescript: { language: 'typescript', version: '5.0.3' },
  ts:         { language: 'typescript', version: '5.0.3' },
  java:       { language: 'java',       version: '15.0.2' },
  cpp:        { language: 'c++',        version: '10.2.0' },
  c:          { language: 'c',          version: '10.2.0' },
  go:         { language: 'go',         version: '1.16.2' },
  rust:       { language: 'rust',       version: '1.50.0' },
};

// ─── Component ───────────────────────────────────────────────────────────────

export default function ReviewAssignmentPage({
  submission,
  onClose,
  onSubmitReview,
}: ReviewAssignmentPageProps) {

  const isCodeSubmission = submission.exerciseType === 'coding' || submission.exerciseType === 'debugging';

  // ── Grading state ─────────────────────────────────────────────────────────
  const [grade, setGrade] = useState<string>(
    submission.existingGrade != null ? String(submission.existingGrade) : ''
  );
  const [feedback, setFeedback] = useState<string>(submission.existingFeedback ?? '');
  const [showQuickComments, setShowQuickComments] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // ── Run code state ────────────────────────────────────────────────────────
  const [showRunModal, setShowRunModal] = useState(false);
  const [runOutput, setRunOutput] = useState<OutputLine[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunMs, setLastRunMs] = useState<number | null>(null);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // ── Code editing state ────────────────────────────────────────────────────
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [currentCode, setCurrentCode] = useState<string>(submission.submissionContent);

  // ── Quick comments dropdown close on outside click ────────────────────────
  const quickCommentsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (quickCommentsRef.current && !quickCommentsRef.current.contains(e.target as Node)) {
        setShowQuickComments(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const scrollTerminal = useCallback(() => {
    setTimeout(() => terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
  }, []);

  // ── Grade validation ──────────────────────────────────────────────────────
  const numericGrade = parseInt(grade, 10);
  const isGradeValid = !isNaN(numericGrade) && numericGrade >= 0 && numericGrade <= 100;

  const gradeColor =
    !grade ? 'border-slate-200'
    : !isGradeValid ? 'border-rose-300 ring-2 ring-rose-100'
    : numericGrade >= 80 ? 'border-emerald-300 ring-2 ring-emerald-100'
    : numericGrade >= 50 ? 'border-amber-300 ring-2 ring-amber-100'
    : 'border-rose-300 ring-2 ring-rose-100';

  const gradeLabel =
    !grade ? null
    : !isGradeValid ? 'Invalid'
    : numericGrade >= 90 ? 'A'
    : numericGrade >= 80 ? 'B'
    : numericGrade >= 70 ? 'C'
    : numericGrade >= 60 ? 'D'
    : 'F';

  // ── Run Student Code ──────────────────────────────────────────────────────
  const handleRunCode = async () => {
    const langKey = (submission.language ?? 'python').toLowerCase().trim();
    const runtime = LANGUAGE_MAP[langKey];

    if (!runtime) {
      setRunOutput([{ kind: 'error', text: `✖ Unsupported language: ${submission.language}` }]);
      setShowRunModal(true);
      return;
    }

    setShowRunModal(true);
    setIsRunning(true);
    setRunOutput([{ kind: 'info', text: `⟳ Running ${submission.language ?? 'code'} via Piston…` }]);
    scrollTerminal();

    const startTime = performance.now();

    try {
      const res = await fetch(INTERNAL_RUN_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          language: runtime.language,
          version: runtime.version,
          code: currentCode,
        }),
      });

      const elapsed = Math.round(performance.now() - startTime);
      setLastRunMs(elapsed);

      if (!res.ok) {
        throw new Error(`Execution service error (HTTP ${res.status})`);
      }

      const data = await res.json();

      const lines: OutputLine[] = [];
      
      // Add standard error (which includes compile error from backend proxy)
      if (data.stderr) {
        data.stderr.trimEnd().split('\n').forEach((l: string) => lines.push({ kind: 'stderr', text: l }));
      }
      
      // Add standard output
      if (data.stdout) {
        data.stdout.trimEnd().split('\n').forEach((l: string) => lines.push({ kind: 'stdout', text: l }));
      }

      if (lines.length === 0) {
        lines.push({ kind: 'info', text: '(No output)' });
      }

      const exitCode = data.exitCode ?? 0;
      lines.push({ 
        kind: exitCode === 0 ? 'info' : 'error', 
        text: `── Exited with code ${exitCode} · ${elapsed}ms ──` 
      });
      
      setRunOutput(lines);
    } catch (err: unknown) {
      const elapsed = Math.round(performance.now() - startTime);
      setLastRunMs(elapsed);
      const msg = err instanceof Error ? err.message : String(err);
      setRunOutput([
        { kind: 'error', text: `✖ Execution failed: ${msg}` },
        { kind: 'error', text: `── ${elapsed}ms ──` },
      ]);
    } finally {
      setIsRunning(false);
      scrollTerminal();
    }
  };

  // ── Submit review ─────────────────────────────────────────────────────────
  const handleSubmitReview = async (action: 'approve' | 'request_revision') => {
    if (!isGradeValid || !feedback.trim()) return;

    setIsSubmitting(true);

    try {
      if (onSubmitReview) {
        onSubmitReview({
          submissionId: submission.id,
          grade: numericGrade,
          feedback,
          action,
        });
      } else {
        // Fallback: post to API
        await fetch('/api/submissions/review', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            submissionId: submission.id,
            grade: numericGrade,
            feedback,
            action,
          }),
        });
      }
      setSubmitted(true);
    } catch {
      setIsSubmitting(false);
    }
  };

  // ── Student initials ──────────────────────────────────────────────────────
  const initials = submission.studentName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase();

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 bg-slate-50 flex flex-col">

      {/* ── Top bar ── */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors shrink-0"
          >
            <LuX className="h-4 w-4" />
          </button>
          <div className="h-6 w-px bg-slate-200" />
          <div className="flex items-center gap-2 min-w-0">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarFallback className="bg-blue-100 text-blue-700 text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">
                {submission.exerciseTitle}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {submission.studentName} · {submission.exerciseModule} · {isCodeSubmission ? 'Code' : 'Written'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Badge className={`rounded-full text-xs ${
            submission.status === 'pending' ? 'bg-blue-100 text-blue-700'
            : submission.status === 'approved' ? 'bg-emerald-100 text-emerald-700'
            : submission.status === 'rejected' ? 'bg-rose-100 text-rose-700'
            : 'bg-slate-100 text-slate-600'
          }`}>
            {submission.status === 'pending' ? 'Pending Review' : submission.status}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-slate-500">
            <LuClock className="h-3 w-3" />
            {submission.submittedAt}
          </span>
        </div>
      </div>

      {/* ── Split content ── */}
      <div className="flex-1 overflow-hidden">
        <PanelGroup direction="horizontal" className="h-full">

          {/* ═══════════ LEFT — Submission Content ═══════════ */}
          <Panel defaultSize={60} minSize={35} className="flex flex-col bg-white">

            {/* Left header */}
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-100 shrink-0 bg-slate-50/60">
              <div className="flex items-center gap-2">
                {isCodeSubmission ? (
                  <LuCode className="h-4 w-4 text-blue-600" />
                ) : (
                  <LuFileText className="h-4 w-4 text-indigo-600" />
                )}
                <span className="text-xs font-semibold text-slate-700">
                  {isCodeSubmission ? 'Code Submission' : 'Written Submission'}
                </span>
                {submission.language && (
                  <Badge className="bg-slate-100 text-slate-600 rounded-full text-[10px] capitalize">
                    {submission.language}
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={isEditingCode ? "outline" : "secondary"}
                  className={`rounded-full h-7 text-xs gap-1 ${isEditingCode ? 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}
                  onClick={() => setIsEditingCode(!isEditingCode)}
                >
                  {isEditingCode ? <LuX className="h-3 w-3" /> : <LuCode className="h-3 w-3" />}
                  {isEditingCode ? 'Exit Edit Mode' : 'Edit Code'}
                </Button>
                <Button
                  size="sm"
                  className="rounded-full h-7 text-xs bg-emerald-600 hover:bg-emerald-500 gap-1"
                  onClick={handleRunCode}
                  disabled={isRunning}
                >
                  {isRunning ? <LuLoader className="h-3 w-3 animate-spin" /> : <LuPlay className="h-3 w-3" />}
                  Run Student Code
                </Button>
              </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-hidden">
              {isCodeSubmission || isEditingCode ? (
                <Editor
                  height="100%"
                  language={submission.language ?? 'python'}
                  value={currentCode}
                  onChange={(val) => setCurrentCode(val ?? '')}
                  theme="vs-dark"
                  options={{
                    readOnly: !isEditingCode,
                    fontSize: 14,
                    fontFamily: '"JetBrains Mono", "Fira Code", monospace',
                    minimap: { enabled: false },
                    scrollBeyondLastLine: false,
                    lineNumbers: 'on',
                    renderLineHighlight: 'all',
                    padding: { top: 12, bottom: 12 },
                    wordWrap: 'on',
                    automaticLayout: true,
                  }}
                />
              ) : (
                /* Written submission view */
                <div className="h-full overflow-y-auto p-6">
                  {/* Student info strip */}
                  <div className="flex items-center gap-3 mb-6 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-sm text-slate-900">{submission.studentName}</p>
                      <p className="text-xs text-slate-500">{submission.studentEmail}</p>
                    </div>
                    {submission.focusLossCount != null && submission.focusLossCount > 0 && (
                      <Badge className="ml-auto bg-amber-100 text-amber-700 rounded-full text-xs">
                        {submission.focusLossCount} tab {submission.focusLossCount === 1 ? 'switch' : 'switches'}
                      </Badge>
                    )}
                  </div>

                  {/* Exercise description */}
                  <div className="mb-4 text-xs text-slate-500 p-3 rounded-lg bg-blue-50 border border-blue-100">
                    <span className="font-semibold text-blue-700 mr-1">📋 Prompt:</span>
                    {submission.exerciseDescription}
                  </div>

                  {/* Written content */}
                  <div className="prose prose-sm prose-slate max-w-none whitespace-pre-wrap text-sm text-slate-800 leading-relaxed p-4 rounded-xl border border-slate-200 bg-white min-h-[300px]">
                    {submission.submissionContent}
                  </div>

                  {/* Word/char count */}
                  <div className="mt-3 flex items-center gap-4 text-xs text-slate-400">
                    <span>{submission.submissionContent.length.toLocaleString()} characters</span>
                    <span>{submission.submissionContent.trim().split(/\s+/).filter(Boolean).length} words</span>
                  </div>
                </div>
              )}
            </div>
          </Panel>

          {/* Resize handle */}
          <PanelResizeHandle className="group w-1.5 bg-transparent hover:bg-blue-500/20 transition-colors cursor-col-resize flex items-center justify-center">
            <div className="h-12 w-0.5 rounded-full bg-slate-200 group-hover:bg-blue-400/70 transition-colors" />
          </PanelResizeHandle>

          {/* ═══════════ RIGHT — Grading Sidebar ═══════════ */}
          <Panel defaultSize={40} minSize={28} className="flex flex-col bg-white border-l border-slate-100">
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {submitted ? (
                /* ── Success state ── */
                <div className="flex flex-col items-center justify-center gap-4 py-16">
                  <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                    <LuCircleCheck className="h-8 w-8 text-emerald-600" />
                  </div>
                  <p className="text-lg font-semibold text-slate-900">Review Submitted!</p>
                  <p className="text-sm text-slate-500 text-center max-w-xs">
                    Your grade and feedback have been saved. The student will be notified.
                  </p>
                  <Button className="rounded-full bg-blue-600 hover:bg-blue-700 mt-2" onClick={onClose}>
                    Close
                  </Button>
                </div>
              ) : (
                <>
                  {/* ── Student Card ── */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <Avatar className="h-10 w-10 shrink-0">
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-medium">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-slate-900 truncate">{submission.studentName}</p>
                      <p className="text-xs text-slate-500 truncate">{submission.studentEmail}</p>
                    </div>
                  </div>

                  {/* ── Grade Input ── */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                      <LuStar className="h-4 w-4 text-amber-500" />
                      Grade
                    </label>
                    <div className="flex items-center gap-3">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          placeholder="0 – 100"
                          value={grade}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setGrade(e.target.value)}
                          className={`rounded-xl text-lg font-bold text-center h-12 ${gradeColor} transition-all`}
                        />
                      </div>
                      {gradeLabel && (
                        <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                          !isGradeValid ? 'bg-rose-100 text-rose-600'
                          : numericGrade >= 80 ? 'bg-emerald-100 text-emerald-700'
                          : numericGrade >= 50 ? 'bg-amber-100 text-amber-700'
                          : 'bg-rose-100 text-rose-600'
                        }`}>
                          {gradeLabel}
                        </div>
                      )}
                    </div>
                    {grade && !isGradeValid && (
                      <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                        <LuCircleAlert className="h-3 w-3" /> Enter a number between 0 and 100.
                      </p>
                    )}
                  </div>

                  {/* ── Feedback (Markdown) ── */}
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-800 mb-2">
                      <LuMessageSquare className="h-4 w-4 text-blue-500" />
                      Feedback
                      <span className="text-[10px] text-slate-400 font-normal ml-1">Markdown supported</span>
                    </label>
                    <Textarea
                      placeholder="Write detailed feedback for the student…&#10;&#10;You can use **bold**, *italic*, `code`, and more."
                      value={feedback}
                      onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback(e.target.value)}
                      className="min-h-[180px] rounded-xl border-slate-200 text-sm font-mono leading-relaxed resize-y"
                    />
                    <div className="flex items-center justify-between mt-1.5">
                      <p className="text-xs text-slate-400">
                        {feedback.length} characters
                      </p>
                    </div>
                  </div>

                  {/* ── Quick Comments ── */}
                  <div className="relative" ref={quickCommentsRef}>
                    <button
                      onClick={() => setShowQuickComments(!showQuickComments)}
                      className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <LuMessageSquare className="h-3.5 w-3.5" />
                        Quick Comments
                      </span>
                      <LuChevronDown className={`h-3.5 w-3.5 transition-transform ${showQuickComments ? 'rotate-180' : ''}`} />
                    </button>

                    {showQuickComments && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg z-20 max-h-[240px] overflow-y-auto">
                        {QUICK_COMMENTS.map((comment, i) => (
                          <button
                            key={i}
                            onClick={() => {
                              setFeedback(prev => prev + comment.value);
                              setShowQuickComments(false);
                            }}
                            className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-blue-50 transition-colors first:rounded-t-xl last:rounded-b-xl border-b border-slate-50 last:border-b-0"
                          >
                            {comment.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* ── Action Buttons ── */}
                  <div className="pt-2 space-y-2">
                    <Button
                      className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 h-10 gap-2"
                      disabled={!isGradeValid || !feedback.trim() || isSubmitting}
                      onClick={() => handleSubmitReview('approve')}
                    >
                      {isSubmitting ? <LuLoader className="h-4 w-4 animate-spin" /> : <LuCircleCheck className="h-4 w-4" />}
                      Approve & Submit Grade
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full rounded-full border-amber-200 text-amber-700 hover:bg-amber-50 h-10 gap-2"
                      disabled={!feedback.trim() || isSubmitting}
                      onClick={() => handleSubmitReview('request_revision')}
                    >
                      <LuSend className="h-4 w-4" />
                      Request Revision
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Panel>
        </PanelGroup>
      </div>

      {/* ── Run Output Modal (for code submissions) ── */}
      {showRunModal && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-3">
          <div className="w-full max-w-xl bg-[#0d1117] rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[50vh]">
            {/* Modal header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#161b22] shrink-0">
              <div className="flex items-center gap-2">
                <LuTerminal className="h-3.5 w-3.5 text-emerald-400" />
                <span className="text-xs font-semibold text-slate-300">
                  Student Code Output
                </span>
                {isRunning && (
                  <Badge className="gap-1 bg-blue-900/50 text-blue-300 rounded-full text-[10px] animate-pulse">
                    <LuLoader className="h-2.5 w-2.5 animate-spin" />
                    Running
                  </Badge>
                )}
                {lastRunMs != null && !isRunning && (
                  <span className="flex items-center gap-1 text-[10px] text-slate-500">
                    <LuClock className="h-2.5 w-2.5" />
                    {lastRunMs}ms
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowRunModal(false)}
                className="h-6 w-6 rounded-full flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10 transition-colors"
              >
                <LuX className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Terminal output */}
            <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-0.5">
              {runOutput.map((line, i) => (
                <div
                  key={i}
                  className={
                    line.kind === 'stdout' ? 'text-slate-200'
                    : line.kind === 'stderr' ? 'text-red-400'
                    : line.kind === 'error' ? 'text-rose-400'
                    : 'text-slate-500 italic'
                  }
                >
                  {line.kind === 'stdout' && <span className="text-emerald-500 mr-1 select-none">›</span>}
                  {line.kind === 'stderr' && <span className="text-red-500 mr-1 select-none">✖</span>}
                  {line.text}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
